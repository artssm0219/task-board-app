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
- タスクの完了 / 未完了を切り替えできる
- タスクに優先度を設定できる
  - `high`
  - `medium`
  - `low`
- タスクにカテゴリを設定できる
- タスクに期限日を設定できる
- 未完了かつ期限日を過ぎたタスクを期限切れとして表示できる
- 全体・未完了・完了済み・高優先度・期限切れのサマリーを表示できる

### 検索・フィルタ

- キーワードでタスクを検索できる
- 完了状態でフィルタできる
  - `all`
  - `active`
  - `completed`
- 優先度でフィルタできる
  - `all`
  - `high`
  - `medium`
  - `low`

### データ保存

- タスク一覧を`localStorage`に保存する
- ページを再読み込みしてもタスクが残る
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

type Task = {
  id: string
  title: string
  completed: boolean
  priority: Priority
  category: string
  createdAt: string
  dueDate: string | null
}

type TaskDraft = {
  title: string
  priority: Priority
  category: string
  dueDate: string | null
}

type TaskUpdate = TaskDraft

type TaskSummary = {
  total: number
  active: number
  completed: number
  highPriority: number
  overdue: number
}
```

### Filter

```ts
type StatusFilter = 'all' | 'active' | 'completed'
type PriorityFilter = 'all' | 'high' | 'medium' | 'low'
```

### localStorage

- 保存キー: `task-board-app:tasks`
- 保存形式: `Task[]`をJSON文字列化して保存する
- 読み込み時は`try...catch`でパース失敗に備える
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

### コンポーネント分割

UIの責務ごとにコンポーネントを分けます。

- `TaskForm`: タスク追加フォーム
- `TaskEditForm`: タスク編集フォーム
- `TaskFilters`: 検索・完了状態フィルタ・優先度フィルタ
- `TaskList`: 表示対象タスク一覧
- `TaskItem`: 1件のタスク表示、完了切り替え、削除
- `TaskSummary`: タスク数のサマリー表示
- `EmptyState`: タスクがない場合の表示

### カスタムフック

`localStorage`の読み書きはアプリ本体から分離します。

- `useLocalStorageTasks`: タスク一覧の読み込み・保存を扱う

### ユーティリティ

タスクの絞り込みやID生成など、画面表示と直接関係しない処理は分離します。

- `filterTasks`: 検索・完了状態・優先度でタスクを絞り込む
- `createTask`: 入力値から`Task`を作成する
- `applyTaskUpdate`: 編集内容を既存タスクに反映する
- `isOverdueTask`: 期限切れかどうかを判定する
- `getTaskSummary`: サマリー表示用の件数を集計する

## ファイル構成

```txt
task-board-app/
  src/
    components/
      EmptyState.tsx
      TaskEditForm.tsx
      TaskFilters.tsx
      TaskForm.tsx
      TaskItem.tsx
      TaskList.tsx
      TaskSummary.tsx
    hooks/
      useLocalStorageTasks.ts
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
2. 必要に応じてカテゴリ、優先度、期限日を設定する
3. 「追加」ボタンでタスクを登録する
4. チェックボックスで完了 / 未完了を切り替える
5. 「編集」ボタンでタスク名、カテゴリ、優先度、期限日を更新する
6. 「削除」ボタンで不要なタスクを削除する
7. 検索欄、完了状態、優先度フィルタで表示するタスクを絞り込む
8. 追加・更新・削除した内容は`localStorage`に保存され、ページ再読み込み後も残る

## ポートフォリオとしての見どころ

- Reactコンポーネントを責務ごとに分割している
- TypeScriptでタスク、入力値、更新値、サマリーの型を定義している
- `localStorage`の読み込み失敗や古い保存データとの互換性を考慮している
- 期限切れ判定をユーティリティに分離し、UIからロジックを切り離している
- 追加、編集、削除、完了切り替え、検索、フィルタが1画面で完結する
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
3. 検索欄とフィルタを置く
4. タスク一覧、期限日、期限切れバッジを表示する
5. タスクがない場合は空状態メッセージを表示する

## UI・アクセシビリティ方針

- 入力欄には`label`を紐づける
- ボタンの目的が分かる文言にする
- キーボード操作でも利用できるようにする
- 完了済みタスクは見た目で区別する
- 優先度は色だけに頼らず、テキストでも表示する
- コントラストを確保する

## 実装時に確認すること

- タスク追加後に入力欄がリセットされること
- 空文字や空白だけのタスクが追加されないこと
- 空タイトルでは編集保存できないこと
- 完了切り替えが`localStorage`に保存されること
- 編集内容が`localStorage`に保存されること
- 削除後の状態が`localStorage`に保存されること
- 古い保存データでも`dueDate: null`として復元されること
- 期限切れ表示が未完了タスクだけに出ること
- 検索とフィルタを同時に使えること
- ページ再読み込み後もタスクが復元されること
- スマホ幅で表示崩れがないこと

## 実装済みステップ

1. 型定義を作成する
2. `localStorage`用のカスタムフックを作成する
3. タスク追加・削除・完了切り替えを実装する
4. タスク編集・期限日・期限切れ表示を実装する
5. 検索・フィルタを実装する
6. サマリー表示を実装する
7. スマホ対応を含むスタイルを整える
8. 動作確認を行う
9. READMEに起動方法・ビルド方法・公開方法を追記する
