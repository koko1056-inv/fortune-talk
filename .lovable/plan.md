
## 現状の問題の解析（なぜ「入室できない／すぐホームに戻る」のか）

結論から言うと、**Index（ホーム）側で「フルスクリーン表示に切り替える条件分岐」が原因で、チャットコンポーネントが一度アンマウント→別ツリーで再マウントされ、入室状態が即座にリセット**されています。

### 起きていること（実際のコード上の挙動）
`src/pages/Index.tsx` には以下の分岐があります：

- `isInSession === true` のとき → **フルスクリーン用の別レイアウト**を `return`（ここで `VoiceChat` / `TextChat` を描画）
- `isInSession === false` のとき → **通常ホーム**を `return`（ここでも `VoiceChat` / `TextChat` を描画）

つまり、`isInSession` が true になった瞬間に **Index が “別の return ブランチ” に切り替わる**ため、
- それまで表示していた `VoiceChat` が **アンマウント**
- フルスクリーンブランチ内の `VoiceChat` が **新規マウント**
になります。

このとき新規マウントされた `VoiceChat` 内の `isInSession` state は初期値 `false` なので、`VoiceChat` の `useEffect` がすぐ走って：

```ts
onSessionChange?.(isInSession); // 初期値 false
```

→ 親(Index)の `setIsInSession(false)` が呼ばれる  
→ Index が通常ホームブランチに戻る  
→ 結果として **「入室した瞬間にホームへ戻る」** が発生します。

これは VoiceChat だけでなく TextChat でも同じ構造的問題で、**“フルスクリーン分岐が子コンポーネントの状態を必ずリセットする”** ため、入室フローが安定しません。

---

## 目標の挙動（ユーザー要望の正しい状態）
- 「占いを始める」→ 入室アニメーション → そのまま **同じルーム（セッションUI）で会話開始**
- 途中でホームのUI（デイリーカード等）が一瞬でも戻らない
- 終了したときだけホームへ戻る

---

## 実装方針（根本解決）
### 方針A（推奨）：Index の “早期 return” をやめて、同一ツリーで表示を切り替える
**チャットコンポーネントをアンマウントしない**のが最重要です。

- Index の `if (isInSession) return (...)` を撤去
- 代わりに、同じ JSX ツリーの中で
  - ホーム要素（ヘッダー、デイリーカード、右上ボタン、モード切替）を `isInSession` のとき非表示
  - チャット領域は常に同じ場所（同じコンポーネントインスタンス）で保持
  - `isInSession` のときだけ “フルスクリーンっぽいレイアウト” に CSS で切り替え

こうすることで、
- `VoiceChat/TextChat` が **マウントし直されない**
- 入室直後に state が初期化されて `onSessionChange(false)` が飛ぶ現象が消える
- 「入室したらそのルームで占いが行われる」が成立します

---

## 具体的な変更計画（コード変更）
### 1) `src/pages/Index.tsx` の構造を修正（最重要）
- `if (isInSession) { return (...) }` の分岐を廃止し、単一 return に統合
- 右上のボタン群、ヘッダー、デイリーカード、モード切替は `!isInSession` のときだけ描画
- チャット部分（`VoiceChat` / `TextChat`）は **常に同じ場所**で描画
- `isInSession` の時に以下を満たすようにクラスを切り替え
  - 中央寄せ、余白調整、必要なら `min-h-screen` 強制
  - ホーム要素を消す（display:none相当）

実装イメージ（概念）：
```text
Index
└── 背景（StarField, BackgroundMusic）←常に
└── 右上ボタン群 ← !isInSession のときだけ
└── コンテンツラッパー（クラスを isInSession で切り替え）
    ├── ヘッダー/デイリー ← !isInSession のときだけ
    ├── Chat（VoiceChat/TextChat）←常に同じ場所、アンマウントしない
    └── モード切替 ← !isInSession のときだけ
```

### 2) `VoiceChat` の onSessionChange 通知を “セッション維持” 優先で調整
今の `VoiceChat` は `onSessionChange?.(isInSession)` のみ通知で、クリック時に `setIsInSession(true)` はしているので一応成立しますが、実運用では
- 入室アニメ中
- 接続開始中
- 接続失敗時の復帰
などが絡むので、通知条件を次のようにするのが安全です：

- “ルーム扱い” を true にする条件：`isInSession || showEnterAnimation || isConnecting || conversation.status === "connecting"`
- false に戻すのは “明確に終了した” ときだけ（ユーザーが終了、または onDisconnect でセッション終了確定）

これで「入室アニメが終わった瞬間に false が飛ぶ」類のブレを防ぎます。

### 3) `TextChat` 側も同様に “ルーム扱い” を安定させる（必要なら）
TextChat は今 `isConnected || isConnecting || showEnterAnimation` なので基本OKですが、
- startChat が失敗した場合に `showEnterAnimation` が消えたら戻る
などの挙動があるため、失敗時にホームに戻す／エラー表示を出すなども合わせて整えます。

### 4) デバッグ用の軽いログを入れて原因切り分け（短期）
「入室できない」が再発したときに即わかるように、以下を一時的に追加します（実装時に必要なら）：
- Index: `handleSessionChange(inSession)` が呼ばれたタイミングをログ
- VoiceChat/TextChat: `onSessionChange` を呼ぶ直前に現在値をログ
- これで “誰が false を送っているか” が即判明します

---

## 動作確認（必ずここまでをセットで）
### 期待テストケース
1. ホームで占い師選択 → 「占いを始める」
   - 入室アニメが出る
   - アニメが終わってもホームに戻らず、そのままルーム（セッションUI）で接続/会話開始
2. 接続に失敗した場合
   - ルーム表示のままエラーが出る（または適切にホームに戻るが、意図せずチラつかない）
3. 終了ボタン押下
   - ルームが閉じてホームに戻る（デイリーカードなどが復帰）
4. 音声モード/テキストモードの両方で同様に成立

---

## 影響範囲（変更するファイル）
- `src/pages/Index.tsx`（主原因の解消：早期returnの廃止・単一ツリー化）
- `src/components/VoiceChat.tsx`（onSessionChange通知条件の安定化）
- `src/components/TextChat.tsx`（必要に応じて通知条件/失敗時の扱いを安定化）

---

## 補足：今回の症状と一致する決定的ポイント
今回の「入室後すぐホームに戻る／入室できない」は、通信やアニメ自体ではなく、
**“フルスクリーン表示への切替がチャットコンポーネントの再マウントを引き起こす”**という構造が原因で、再現性が高いタイプのバグです。  
まずここを直すのが最短で確実です。
