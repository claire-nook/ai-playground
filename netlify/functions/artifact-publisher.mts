import { createHash, timingSafeEqual } from "node:crypto";

const TARGET_REPOSITORY = "claire-nook/ai-playground";
const ALLOWED_PATH_PREFIX = "experiments/artifact-transport/publisher-output/";
const MAX_BINARY_BYTES = 4 * 1024 * 1024;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizeBase64(value: string): string {
  return value.replace(/\s+/g, "");
}

function decodeBase64(value: string): Buffer {
  return Buffer.from(normalizeBase64(value), "base64");
}

function isAllowedImageMediaType(mediaType: string): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(mediaType);
}

function isAllowedFileName(fileName: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,119}$/.test(fileName);
}

function safeEqualText(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  if (leftBytes.length !== rightBytes.length) return false;
  return timingSafeEqual(leftBytes, rightBytes);
}

async function readGithubFile(
  token: string,
  path: string,
): Promise<{ content: string; sha: string; size: number }> {
  const response = await fetch(
    `https://api.github.com/repos/${TARGET_REPOSITORY}/contents/${encodeURI(path)}?ref=main`,
    {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "ai-playground-artifact-publisher",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub read-back failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json() as {
    content?: string;
    encoding?: string;
    sha?: string;
    size?: number;
  };

  if (payload.encoding !== "base64" || typeof payload.content !== "string" || typeof payload.sha !== "string") {
    throw new Error("GitHub read-back payload was not a base64 file.");
  }

  return {
    content: payload.content,
    sha: payload.sha,
    size: payload.size ?? decodeBase64(payload.content).length,
  };
}

async function publishGithubFile(
  token: string,
  path: string,
  base64Content: string,
  commitMessage: string,
): Promise<{ commitSha: string; contentSha: string }> {
  const getResponse = await fetch(
    `https://api.github.com/repos/${TARGET_REPOSITORY}/contents/${encodeURI(path)}?ref=main`,
    {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "ai-playground-artifact-publisher",
      },
    },
  );

  let existingSha: string | undefined;
  if (getResponse.ok) {
    const current = await getResponse.json() as { sha?: string };
    existingSha = current.sha;
  } else if (getResponse.status !== 404) {
    throw new Error(`GitHub preflight failed: ${getResponse.status} ${await getResponse.text()}`);
  }

  const body: Record<string, string> = {
    message: commitMessage,
    content: normalizeBase64(base64Content),
    branch: "main",
  };
  if (existingSha) body.sha = existingSha;

  const response = await fetch(
    `https://api.github.com/repos/${TARGET_REPOSITORY}/contents/${encodeURI(path)}`,
    {
      method: "PUT",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "ai-playground-artifact-publisher",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub publish failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json() as {
    content?: { sha?: string };
    commit?: { sha?: string };
  };

  if (!payload.content?.sha || !payload.commit?.sha) {
    throw new Error("GitHub publish response was missing commit/content SHA.");
  }

  return {
    commitSha: payload.commit.sha,
    contentSha: payload.content.sha,
  };
}

export default async (req: Request) => {
  if (req.method === "GET") {
    // 內建 deterministic binary probe，確認 Netlify runtime 的 Base64 → bytes → hash 路徑正常。
    const sampleBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const bytes = decodeBase64(sampleBase64);
    const roundTrip = bytes.toString("base64");

    return json({
      service: "artifact-publisher",
      status: "ready",
      targetRepository: TARGET_REPOSITORY,
      allowedPathPrefix: ALLOWED_PATH_PREFIX,
      maxBinaryBytes: MAX_BINARY_BYTES,
      configuration: {
        githubTokenConfigured: Boolean(Netlify.env.get("GITHUB_ARTIFACT_PUBLISH_TOKEN")),
        publisherKeyConfigured: Boolean(Netlify.env.get("ARTIFACT_PUBLISHER_KEY")),
      },
      runtimeProbe: {
        decodedBytes: bytes.length,
        sha256: sha256(bytes),
        base64RoundTripExact: normalizeBase64(roundTrip) === normalizeBase64(sampleBase64),
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const expectedKey = Netlify.env.get("ARTIFACT_PUBLISHER_KEY");
  const suppliedKey = req.headers.get("x-artifact-publisher-key") ?? "";

  if (!expectedKey || !suppliedKey || !safeEqualText(expectedKey, suppliedKey)) {
    return json({ error: "unauthorized" }, 401);
  }

  const githubToken = Netlify.env.get("GITHUB_ARTIFACT_PUBLISH_TOKEN");
  if (!githubToken) {
    return json({ error: "github_publish_token_not_configured" }, 503);
  }

  let input: {
    fileName?: string;
    mediaType?: string;
    base64Content?: string;
    commitMessage?: string;
  };

  try {
    input = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const fileName = input.fileName ?? "";
  const mediaType = input.mediaType ?? "";
  const base64Content = input.base64Content ?? "";

  if (!isAllowedFileName(fileName)) {
    return json({ error: "invalid_file_name" }, 400);
  }
  if (!isAllowedImageMediaType(mediaType)) {
    return json({ error: "unsupported_media_type" }, 415);
  }
  if (!base64Content) {
    return json({ error: "base64_content_required" }, 400);
  }

  const bytes = decodeBase64(base64Content);
  if (bytes.length === 0 || bytes.length > MAX_BINARY_BYTES) {
    return json({ error: "invalid_binary_size", bytes: bytes.length }, 413);
  }

  const sourceHash = sha256(bytes);
  const targetPath = `${ALLOWED_PATH_PREFIX}${fileName}`;

  try {
    const published = await publishGithubFile(
      githubToken,
      targetPath,
      base64Content,
      input.commitMessage?.trim() || `test: publish artifact ${fileName}`,
    );

    const readBack = await readGithubFile(githubToken, targetPath);
    const readBackBytes = decodeBase64(readBack.content);
    const readBackHash = sha256(readBackBytes);

    if (readBackBytes.length !== bytes.length || readBackHash !== sourceHash) {
      return json({
        error: "round_trip_verification_failed",
        targetPath,
        source: { bytes: bytes.length, sha256: sourceHash },
        readBack: { bytes: readBackBytes.length, sha256: readBackHash, gitBlobSha: readBack.sha },
        commitSha: published.commitSha,
      }, 502);
    }

    return json({
      status: "published_and_verified",
      targetRepository: TARGET_REPOSITORY,
      targetPath,
      mediaType,
      bytes: bytes.length,
      sha256: sourceHash,
      gitBlobSha: readBack.sha,
      commitSha: published.commitSha,
    }, 201);
  } catch (error) {
    return json({
      error: "publish_failed",
      detail: error instanceof Error ? error.message : String(error),
    }, 502);
  }
};

export const config = {
  path: "/artifact-publisher",
};
