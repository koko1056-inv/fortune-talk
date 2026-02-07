
## 問題の詳細分析

### 現在起きていること（ログから判明）
1. 「占いを始める」クリック → `isInSession: true`、入室アニメ開始
2. アニメ完了 + 接続処理完了（`isConnecting: false`）
3. **直後に `onDisconnect` が呼ばれる** → `setIsInSession(false)`が実行
4. ホーム画面に戻ってしまう

### 根本原因
`VoiceChat.tsx` の `onDisconnect` コールバック内で無条件に `setIsInSession(false)` を呼んでいるため、接続が失敗した場合やユーザーがボタンを素早くタップした場合に、ルーム画面を維持できずにホームに戻ってしまいます。

---

## 修正方針

### 1. `VoiceChat.tsx` の状態管理を修正
- `onDisconnect` で `setIsInSession(false)` を呼ぶタイミングを制御
- 接続が一度も成功していない場合（初回接続失敗）は、エラーメッセージを表示しつつルーム画面を維持するか、明確にホームに戻すかを選択させる
- 「ルームに滞在中」の状態を、接続状態とは独立して管理する

### 2. セッション終了の明確化
- ユーザーが明示的に「終了」ボタンを押した場合のみ `isInSession` を `false` にする
- `onDisconnect` が呼ばれた場合は「再接続を試みる」または「切断されました」UIを表示

---

## 具体的な変更

### `src/components/VoiceChat.tsx`

**変更点1**: `onDisconnect` の処理を修正
- 「ユーザーが明示的に終了した」フラグ（`userRequestedEndRef`）を追加
- ユーザーが終了ボタンを押した場合のみ `setIsInSession(false)` を呼ぶ
- 予期しない切断の場合はルーム内でエラー表示

**変更点2**: 接続エラー時の処理を改善
- `onError` でもルーム画面は維持
- 再試行オプションまたはホームに戻るボタンを表示

**変更点3**: VoiceButtonの「終了」ボタンクリック時のフロー
- `stopConversation` 呼び出し前に `userRequestedEndRef.current = true` をセット
- これにより `onDisconnect` 内で意図的な終了かどうかを判別

---

## 変更するファイル
- `src/components/VoiceChat.tsx` - 状態管理とセッション終了ロジックの修正
- （必要に応じて）`src/components/FortuneSessionView.tsx` - 切断時のUI表示改善

---

## 期待される動作
1. 「占いを始める」→ 入室アニメ → ルーム画面表示
2. 接続成功 → 会話開始、ルーム画面を維持
3. 予期しない切断 → ルーム画面内で「切断されました」表示、再接続または戻るオプション
4. ユーザーが終了ボタン → ホーム画面に戻る

