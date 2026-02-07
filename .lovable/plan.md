
# テキストチャット画面の機能復旧プラン

## 問題の原因

`TextChat.tsx` では `FortuneSessionView` コンポーネントを使用し、チャットUIを `children` として渡していますが、現在の `FortuneSessionView` は **音声チャット専用のUI** になっており、`children` をレンダリングしていません。

そのため、テキストチャット開始時にセッション画面は表示されるものの、メッセージ一覧や入力欄などのチャット機能が見えない状態になっています。

---

## 解決方針

テキストチャット専用のセッションビューコンポーネントを作成するか、`FortuneSessionView` を拡張してテキストチャットモードもサポートするようにします。

**選択した方法**: テキストチャット専用のセッションビューを新規作成

これにより、音声チャットとテキストチャットの両方のUIを独立して管理でき、将来的な機能追加も容易になります。

---

## 変更するファイル

### 1. `src/components/TextChatSessionView.tsx` (新規作成)

テキストチャット専用のセッション画面コンポーネント：

- **ヘッダー**: LIVEバッジ、占い師名、終了ボタン
- **メインエリア**: 占い師の画像/アバター表示（左上に小さく）、チャットメッセージ一覧、入力エリア
- **フッター**: ラリーカウンター（残り回数表示）

デザイン構成:
```text
┌────────────────────────────────┐
│ [LIVE]  四柱推命占い師  [終了] │ ← ヘッダー
├────────────────────────────────┤
│ 🔮                              │
│ ┌──────────────────────────┐   │
│ │ チャットメッセージ一覧   │   │ ← メインエリア
│ │                          │   │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ 選択肢 / テキスト入力    │   │ ← 入力エリア  
│ └──────────────────────────┘   │
├────────────────────────────────┤
│     3 / 10 ラリー              │ ← フッター
└────────────────────────────────┘
```

### 2. `src/components/TextChat.tsx` (修正)

- `FortuneSessionView` の代わりに `TextChatSessionView` を使用
- `onLeave` propを渡して終了機能を有効化
- `children` から直接メッセージ一覧と入力UIを統合

---

## 技術的な詳細

### TextChatSessionView の props

```typescript
interface TextChatSessionViewProps {
  agent: Agent;
  displayName?: string | null;
  isConnecting?: boolean;
  rallyCount?: number;
  maxRallies?: number;
  showRallyCounter?: boolean;
  isExempt?: boolean;
  ticketBalance?: number;
  onLeave?: () => void;
  // チャット専用props
  messages: Message[];
  isSending: boolean;
  choices?: string[];
  onChoiceSelect: (choice: string) => void;
  onCustomInput: (text: string) => void;
  isRallyLimitReached: boolean;
}
```

### レイアウト構成

- 全画面表示（`fixed inset-0`）
- ダークグラデーション背景
- スクロール可能なチャットエリア
- 下部に選択肢と入力フィールド

---

## 期待される動作

1. ユーザーがテキストモードを選択
2. 「占いを始める」ボタンをクリック
3. 入室アニメーション表示
4. テキストチャット専用のセッション画面が表示される
5. 占い師からの初回メッセージが表示される
6. 選択肢をタップまたはテキスト入力で会話継続
7. 「終了」ボタンでホーム画面に戻る
