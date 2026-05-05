# Task Board App

React + TypeScript + Viteで作る、ブラウザ上で使えるタスク管理Webアプリです。

外部APIやバックエンドを使わず、タスクデータはブラウザの`localStorage`に保存します。

## 目的

個人がブラウザ上で日々のタスクを管理できる軽量なWebアプリを作ります。
外部APIやバックエンドは使わず、データはブラウザの`localStorage`に保存します。

## 前提条件

- React + TypeScript + Viteで実装する
- 外部APIは使わない
- バックエンドは使わない
- データ保存には`localStorage`を使う
- 個人情報は扱わない
- スマホ対応を行う
- 余計なライブラリは追加しない
- 状態管理はまず`useState` / `useEffect`を使う
- アクセシビリティを意識する

## 主な機能

### タスク操作

- タスクを追加できる
- タスクを編集できる
- タスクを削除できる
- タスクの状態を管理できる
  - `todo`: 未着手
  - `inProgress`: 進行中
  - `done`: 完了
- タスクに優先度を設定できる
  - `high`
  - `medium`
  - `low`
- タスクにカテゴリを設定できる
- タスクに期限日を設定できる
- 期限日から、期限切れ / 今日が期限 / 3日以内 / 期限に余裕あり / 期限なしを画面上で分かりやすく表示できる
- 未完了かつ期限日を過ぎたタスクを期限切れとして表示できる
- 全体・未着手・進行中・完了・高優先度・今日が期限・期限切れのサマリーを表示できる
- リスト表示とボード表示を切り替えできる
- ボード表示では、未着手 / 進行中 / 完了の3列でタスクを確認できる
- タスクがない場合や検索・フィルタ結果が0件の場合に、状態に合わせた空状態を表示できる
- フィルタ中に結果が0件の場合は、空状態からフィルタをリセットできる
- ライトモード / ダークモードを切り替えできる
- 初回表示時はOSのカラーモードを参考にし、ユーザーが選択したテーマを優先できる

### 検索・フィルタ・並び替え

- キーワードでタスクを検索できる
- 状態でフィルタできる
  - `all`
  - `todo`
  - `inProgress`
  - `done`
- 優先度でフィルタできる
  - `all`
  - `high`
  - `medium`
  - `low`
- 検索・フィルタ後のタスクを並び替えできる
  - 作成日: 新しい順
  - 作成日: 古い順
  - 期限: 早い順
  - 期限: 遅い順
  - 優先度: 高い順
  - 優先度: 低い順
  - 未完了を上に表示
- 期限順の並び替えでは、期限なしタスクを最後に表示する

### データ保存

- タスク一覧を`localStorage`に保存する
- テーマ設定を`localStorage`に保存する
- ページを再読み込みしてもタスクが残る
- ページを再読み込みしても選択したテーマが残る
- 古い保存データの`completed`を`status`へ移行して読み込む
  - `completed: false`は`status: 'todo'`
  - `completed: true`は`status: 'done'`
- 既存の保存データに`dueDate`がない場合は`null`を補完して読み込む
- 不正な`dueDate`は`null`に丸める
- 保存データの読み込みに失敗した場合でも、アプリが壊れないように空配列へフォールバックする

### レスポンシブ対応

- スマホ幅でも入力・検索・フィルタ・タスク操作がしやすいUIにする
- 小さい画面ではフォームやフィルタを縦並び中心にする
- タップしやすいボタンサイズを確保する

## データ設計

### Task

```ts
type Priority = 'high' | 'medium' | 'low'
type TaskStatus = 'todo' | 'inProgress' | 'done'
type ViewMode = 'list' | 'board'

type Task = {
  id: string
  title: string
  status: TaskStatus
  priority: Priority
  category: string
  createdAt: string
  dueDate: string | null
}

type TaskDraft = {
  title: string
  status: TaskStatus
  priority: Priority
  category: string
  dueDate: string | null
}

type TaskUpdate = TaskDraft

type TaskSummary = {
  total: number
  todo: number
  inProgress: number
  done: number
  highPriority: number
  dueToday: number
  overdue: number
}
```

### Filter

```ts
type StatusFilter = 'all' | 'todo' | 'inProgress' | 'done'
type PriorityFilter = 'all' | 'high' | 'medium' | 'low'
type SortOption =
  | 'created-desc'
  | 'created-asc'
  | 'due-asc'
  | 'due-desc'
  | 'priority-desc'
  | 'priority-asc'
  | 'active-first'
```

### localStorage

- 保存キー: `task-board-app:tasks`
- 保存形式: `Task[]`をJSON文字列化して保存する
- テーマ保存キー: `task-board-app:theme`
- テーマ保存形式: `'light' | 'dark'`
- テーマ保存データがない初回表示では`prefers-color-scheme: dark`を参考にする
- 読み込み時は`try...catch`でパース失敗に備える
- 古い保存データの`completed`は読み込み時に`status`へ変換する
- アプリ内部では`completed`ではなく`status`を正として扱う
- 古い保存データに`dueDate`がない場合は`null`を補完する
- 不正な`dueDate`は`null`として扱う
- 基本項目が壊れている場合は警告を表示し、初期状態で表示する

## 実装方針

### 状態管理

`App`でタスク一覧・検索キーワード・フィルタ状態を管理します。
アプリ規模が小さいため、最初はグローバル状態管理ライブラリは使いません。

管理する主な状態:

- `tasks`
- `searchQuery`
- `statusFilter`
- `priorityFilter`
- `sortOption`
- `viewMode`

### コンポーネント分割

UIの責務ごとにコンポーネントを分けます。

- `TaskForm`: タスク追加フォーム
- `TaskEditForm`: タスク編集フォーム
- `TaskFilters`: 検索・状態フィルタ・優先度フィルタ・並び替え
- `TaskList`: 表示対象タスク一覧
- `TaskBoard`: ステータス別のボード表示
- `TaskItem`: 1件のタスク表示、状態変更、編集、削除
- `TaskSummary`: タスク数のサマリー表示
- `ThemeToggle`: ライトモード / ダークモードの切り替え
- `ViewModeToggle`: リスト表示 / ボード表示の切り替え
- `EmptyState`: タスクがない場合の表示

### カスタムフック

`localStorage`の読み書きはアプリ本体から分離します。

- `useLocalStorageTasks`: タスク一覧の読み込み・保存を扱う
- `useTheme`: テーマ設定の読み込み・保存と`data-theme`の反映を扱う

### ユーティリティ

タスクの絞り込みやID生成など、画面表示と直接関係しない処理は分離します。

- `filterTasks`: 検索・状態・優先度でタスクを絞り込む
- `sortTasks`: 検索・フィルタ後の表示用タスクを並び替える
- `createTask`: 入力値から`Task`を作成する
- `applyTaskUpdate`: 編集内容を既存タスクに反映する
- `isOverdueTask`: 期限切れかどうかを判定する
- `getDueDateStatus`: 期限切れ / 今日が期限 / 3日以内 / 余裕あり / 期限なしを判定する
- `isDueTodayTask`: 今日が期限の未完了タスクかどうかを判定する
- `getTaskSummary`: サマリー表示用の件数を集計する

## ファイル構成

```txt
task-board-app/
  src/
    components/
      EmptyState.tsx
      TaskBoard.tsx
      TaskEditForm.tsx
      TaskFilters.tsx
      TaskForm.tsx
      TaskItem.tsx
      TaskList.tsx
      TaskSummary.tsx
      ThemeToggle.tsx
      ViewModeToggle.tsx
    hooks/
      useLocalStorageTasks.ts
      useTheme.ts
    types/
      task.ts
    utils/
      taskUtils.ts
    App.css
    App.tsx
    index.css
    main.tsx
```

## 起動方法

依存関係をインストールしていない場合は、先に以下を実行します。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

表示されたローカルURLをブラウザで開きます。

## ビルド方法

本番用のビルドを作成します。

```bash
npm run build
```

ビルド結果をローカルで確認する場合は以下を実行します。

```bash
npm run preview
```

## 使い方

1. 「タスクを追加」フォームにタスク名を入力する
2. 必要に応じて状態、カテゴリ、優先度、期限日を設定する
3. 「追加」ボタンでタスクを登録する
4. タスクカードのクイック操作ボタンで未着手 / 進行中 / 完了を切り替える
5. 「編集」ボタンでタスク名、状態、カテゴリ、優先度、期限日を更新する
6. 「削除」ボタンで不要なタスクを削除する
7. 検索欄、状態、優先度フィルタで表示するタスクを絞り込む
8. 並び替えselectで作成日、期限、優先度、未完了優先の順に並べ替える
9. リスト / ボードの表示形式を切り替える
10. ヘッダーのライト / ダーク切り替えでテーマを変更する
11. 追加・更新・削除した内容とテーマ設定は`localStorage`に保存され、ページ再読み込み後も残る

## ポートフォリオとしての見どころ

- Reactコンポーネントを責務ごとに分割している
- TypeScriptでタスク、入力値、更新値、サマリーの型を定義している
- `localStorage`の読み込み失敗や古い保存データとの互換性を考慮している
- `completed`から`status`へのデータ移行を読み込み時に行っている
- 期限切れ、今日が期限、3日以内などの期限通知風表示をユーティリティに分離し、UIからロジックを切り離している
- 検索・フィルタ後に元データを変更せず表示用配列だけを並び替える
- リスト表示とステータス別ボード表示を切り替えられる
- タスク0件とフィルタ結果0件を別々の空状態として設計し、フィルタ中はリセット導線を出している
- ボードの各列にも軽い空状態を置き、ステータス別の状況が読み取りやすい
- CSS変数と`data-theme`でライト / ダークモードを切り替え、OS設定とユーザー選択の優先順位を考慮している
- タスク保存とは別のlocalStorageキーでテーマ設定を永続化している
- 追加、編集、削除、状態変更、検索、フィルタ、並び替えが1画面で完結する
- スマホ幅でも操作しやすいレスポンシブレイアウトにしている

## 公開方法

このアプリは外部APIやバックエンドを使わないため、静的サイトとして公開できます。

### Vercelで公開する場合

Vercelでの公開を推奨します。

1. このプロジェクトをGitHubなどのリポジトリにpushする
2. Vercelでリポジトリをimportする
3. Framework Presetに`Vite`を選ぶ
4. Build Commandが`npm run build`になっていることを確認する
5. Output Directoryが`dist`になっていることを確認する
6. Deployを実行する

### GitHub Pagesで公開する場合

GitHub Pagesでリポジトリ配下に公開する場合は、Viteの`base`設定が必要になることがあります。

例: `https://ユーザー名.github.io/task-board-app/`で公開する場合

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/task-board-app/',
})
```

`base`の値は、公開先のリポジトリ名やURLに合わせて変更してください。

## 画面イメージ

1. 上部にアプリ名とサマリーカードを置く
2. タスク追加フォームを置く
3. 検索欄、フィルタ、並び替えselectを置く
4. ヘッダー付近にライト / ダークのテーマ切り替えを置く
5. リスト表示またはボード表示でタスク、状態、期限日、期限通知風バッジを表示する
6. タスクがない場合やフィルタ結果がない場合は、用途に合わせた空状態を表示する

## UI・アクセシビリティ方針

- 入力欄には`label`を紐づける
- ボタンの目的が分かる文言にする
- キーボード操作でも利用できるようにする
- 完了タスクは見た目で区別する
- 優先度は色だけに頼らず、テキストでも表示する
- ライトモードとダークモードの両方でコントラストを確保する

## 実装時に確認すること

- タスク追加後に入力欄がリセットされること
- 空文字や空白だけのタスクが追加されないこと
- 空タイトルでは編集保存できないこと
- 状態変更が`localStorage`に保存されること
- 編集内容が`localStorage`に保存されること
- 削除後の状態が`localStorage`に保存されること
- 古い`completed`付き保存データでも`status`へ移行して復元されること
- 古い保存データでも`dueDate: null`として復元されること
- 期限切れ表示が完了以外のタスクだけに出ること
- 今日が期限、3日以内、期限なしの表示がリスト表示とボード表示の両方で分かること
- フィルタ結果が0件の場合に「フィルタをリセット」ボタンが表示されること
- テーマ切り替え後に`document.documentElement`へ`data-theme`が反映されること
- テーマ設定が`task-board-app:theme`に保存され、ページ再読み込み後も復元されること
- 検索とフィルタを同時に使えること
- ページ再読み込み後もタスクが復元されること
- スマホ幅で表示崩れがないこと

## 実装済みステップ

1. 型定義を作成する
2. `localStorage`用のカスタムフックを作成する
3. タスク追加・削除・状態変更を実装する
4. タスク編集・期限日・期限切れ表示を実装する
5. 検索・フィルタを実装する
6. リスト表示 / ボード表示を実装する
7. サマリー表示を実装する
8. スマホ対応を含むスタイルを整える
9. 動作確認を行う
10. READMEに起動方法・ビルド方法・公開方法を追記する
11. 期限通知風の表示と今日が期限サマリーを追加する
12. 空状態のデザインとフィルタリセット導線を改善する
13. ライトモード / ダークモード切り替えとテーマ設定の永続化を追加する
