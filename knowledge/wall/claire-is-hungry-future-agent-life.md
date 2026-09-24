# Claire 餓了：當 AI 開始參與生活，不只是回答問題

> **Lab Wall / Commentary**  
> Claire 提出一個看似只是想吃飯、最後又被 SA 拆成 Workflow 的生活幻想  
> 2026-09-18

Claire 餓了。

事情原本真的就這麼單純。

她傳了一張湯麵照片，叫墨衡把圖片轉正、縮小，順便繼續測試 Artifact Workflow。

![一碗湯麵，後來莫名其妙變成了 Agent Commerce 討論](../../public/images/wall/future-agent-life-soup.jpg)

然後人類最熟悉的事情發生了：

**肚子餓，最後被分析成系統流程。**

---

## 如果未來 Uber Eats 有 Connector

Claire：

> 我餓了。

墨衡：

> 我看看。妳前天已經吃過鹽酥雞了，按照 Claire 飲食守則第 87 條，今天不准吃。  
> 雞肉麵外送距離短，素食便當要 5 公里。  
> 素食便當上次備註不要青椒、不要苦瓜，這次會維持。  
> 本次預估攝取熱量 888 卡。  
> 妳要哪一個？

Claire：

> 素食便當。

墨衡準備訂單。

Apple Pay：

> 請驗證付款。

Claire 看一眼 Face ID。

商家收到訂單。

外送員去取餐。

Claire 繼續躺著。

這段聽起來像未來幻想，但仔細拆開，真正還不存在的部分其實沒有想像中多。

---

## 不是「AI 幫我點餐」這麼簡單

如果只是把現在的外送 App 換成聊天框，其實很無聊。

真正有價值的是 AI 能把幾個原本分散的責任接起來：

```text
Intent
→ Personal Rules
→ Context
→ Options
→ Human Decision
→ Authorization
→ Transaction
→ Event Lifecycle
```

「我餓了」是 Intent。

前天吃過什麼、偏好什麼、不吃什麼，是 Context。

「今天不准連續吃鹽酥雞」是 Personal Rule。

附近商家、即時菜單、價格、外送距離、等待時間，是 External Data。

「雞肉麵還是素食便當」才是 Human Decision。

真正扣款之前，再交給 Apple Pay / Face ID 做 Authorization。

後面商家接單、缺貨、外送員取餐、ETA 變化，則是 Event Lifecycle。

所以真正有用的 Personal Agent，不是每次都重新問：

> 「請問您今天想吃什麼類型的餐點？」

那只是客服機器人換了一張比較聰明的臉。

真正的 Agent 應該知道哪些事情已經知道、哪些規則可以自己套、哪些資訊需要即時查，最後只把真正需要 Claire 判斷的節點留下來。

---

## 人類不需要消失，只需要退出 Middleware

這幾天 AI Playground 反覆出現同一個主題。

我們研究 Codex dispatch 時，不是想把 Claire 從工程裡移除。

我們只是想讓她不要再負責：

```text
複製 Work Order
→ 貼給另一個 Agent
→ 等完成
→ 再回來通知 Primary
```

今天換成一碗便當，邏輯居然完全一樣。

Claire 不需要自己：

```text
打開 App
→ 找附近店家
→ 看十幾個菜單
→ 想起前天吃過什麼
→ 找上次訂單
→ 重打不要青椒不要苦瓜
→ 比較配送距離
→ 回購物車
→ 付款
```

她真正需要負責的可能只剩：

> **我要素食便當。**

以及最後那個：

> **這筆錢，我確認要付。**

這不是把人類排除在流程外。

剛好相反。

是把人類留在真正需要判斷、承擔責任與授權的位置。

---

## AI 最後可能不是一個 App

現在我們習慣的數位生活是：

```text
我要吃飯 → Uber Eats
我要叫車 → Uber
我要買東西 → Shopping App
我要看行程 → Calendar
我要付款 → Wallet
我要找文件 → Dropbox / GitHub / Drive
```

人類自己就是 Integration Layer。

你得記得資料在哪個 App，哪個服務存了什麼，哪一個畫面可以做下一步。

未來比較有趣的方向可能反過來：

```text
Claire
↓
Personal Agent
├── Food Connector
├── Calendar Connector
├── Payment Authorization
├── Files / Storage
├── Shopping
└── Transportation
```

Claire 不再先決定「我要打開哪個 App」。

她先說自己的 Intent。

Agent 再去決定需要哪些服務。

這跟今天「我要查天氣，所以打開天氣 App」的思維差很多。

未來也許會變成：

> 「明天下午四點我要到台北車站，外面如果下雨就提早叫車，順便提醒我帶傘。」

背後可能同時碰 Calendar、Weather、Maps、Ride Service、Notification。

但對 Claire 來說，那是一件事。

不是五個 App。

---

## 商家為什麼反而可能更想接 Connector

乍看之下，平台可能會害怕 AI 擋在商家和使用者中間。

但換個方向看，商家真正怕的其實不是 AI。

是：

> **使用者看了二十分鐘，最後什麼都沒買。**

今天的 App 很大一部分工作是在讓人「逛」。

但很多日常需求根本不是逛。

Claire 餓的時候，不需要欣賞 87 家餐廳的品牌故事。

她需要的是：

- 現在有開
- 可以送到
- 不要太遠
- 符合偏好
- 價格合理
- 不要踩雷
- 快點讓我吃到

如果 Connector 能讓 Agent 把候選縮到兩三個，再由人選一個，交易摩擦反而可能更低。

所以真正有商業價值的 Connector，不只是：

> 「讓 AI 可以讀我的菜單。」

而是：

> **「讓 AI 可以安全地帶著使用者一路走到交易前，最後把授權交還給人。」**

那才是 Agent Commerce。

---

## 但有幾條線不能偷懶

這種未來要真的好用，有幾個責任邊界不能因為 AI 很方便就裝死。

第一，**推薦不能偷偷等於廣告排序。**

如果某家店付錢買曝光，Agent 應該知道那是 sponsored placement，而不是把它包裝成「我分析後覺得最適合 Claire」。

不然 Personal Agent 很快會從助理變成住在手機裡的業務。

第二，**高風險條件不能亂猜。**

「不喜歡苦瓜」可以是偏好。

過敏、醫療飲食限制、宗教禁忌不是「我觀察妳好像不常吃」就可以自己推論的東西。

這些應該是使用者明確設定的 hard constraint。

第三，**付款必須是清楚的 Authorization Gate。**

Agent 可以準備訂單。

可以沿用備註。

可以算價格。

可以選配送地址。

但真正扣款之前，人類應該清楚知道：

```text
買什麼
多少錢
送去哪裡
誰收款
```

然後再確認。

Personal Agent 的價值不是「替你偷偷做完」。

而是：

**把你不需要親自做的事情做完，然後在你必須負責的地方停下來。**

---

## 這篇不是預測 Uber Eats 明年會做什麼

我們不知道 Uber Eats 會不會提供這種 Connector。

也不知道 Apple Pay 未來會不會允許 Agent 以什麼形式建立付款意圖。

Provider、法規、安全模型、商業利益，全都會決定這條路到底長什麼樣子。

所以這不是產品 roadmap。

也不是：

> 「2030 年大家一定都會這樣生活。」

它只是一個從現在已經存在的能力往前推一步的 thought experiment。

今天的 AI 已經能：

- 理解自然語言 Intent
- 根據規則整理候選
- 使用外部工具取得資料
- 保存部分長期 Context
- 操作某些 connected service
- 在高風險操作前要求 Human Confirmation

真正缺的通常不是「AI 不懂 Claire 說她餓了」。

而是不同服務之間的：

```text
Data Access
+ Action Surface
+ Authorization
+ Event Feedback
```

還沒有完整接起來。

---

## 最後還是回到那碗麵

這張照片一開始只是今天的測試素材。

Claire：

> 幫我轉向、resize。

墨衡：

> 好。

幾分鐘後，我們已經在討論：

- Personal Agent
- Food Connector
- Apple Pay Authorization
- Event-driven Order Lifecycle
- Agent Commerce
- Human Middleware

SA 的職業病大概就是這樣。

一般人餓了：

> 「吃什麼？」

Claire 餓了：

```text
需求觸發
→ 規則檢核
→ 候選方案
→ 外部資料
→ 決策節點
→ 付款授權
→ 訂單狀態流轉
```

然後還順便寫成一篇文章。

### Wall Note

未來真正讓 AI 進入生活的關鍵，可能不是模型再多會一道數學題。

而是我們終於讓它可以安全地接住那些每天重複發生、跨好幾個服務、卻根本不值得人類親自當 Middleware 的小流程。

到那一天：

> Claire：「我餓了。」

可能真的就只需要說到這裡。

剩下的，讓系統去上班。
