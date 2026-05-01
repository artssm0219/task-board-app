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
- タスクを削除できる
- タスクの完了 / 未完了を切り替えできる
- タスクに優先度を設定できる
  - `high`
  - `medium`
  - `low`
- タスクにカテゴリを設定できる

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
- `TaskFilters`: 検索・完了状態フィルタ・優先度フィルタ
- `TaskList`: 表示対象タスク一覧
- `TaskItem`: 1件のタスク表示、完了切り替え、削除
- `EmptyState`: タスクがない場合の表示

### カスタムフック

`localStorage`の読み書きはアプリ本体から分離します。

- `useLocalStorageTasks`: タスク一覧の読み込み・保存を扱う

### ユーティリティ

タスクの絞り込みやID生成など、画面表示と直接関係しない処理は分離します。

- `filterTasks`: 検索・完了状態・優先度でタスクを絞り込む
- `createTask`: 入力値から`Task`を作成する

## ファイル構成

```txt
task-board-app/
  src/
    components/
      EmptyState.tsx
      TaskFilters.tsx
      TaskForm.tsx
      TaskItem.tsx
      TaskList.tsx
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
2. 必要に応じてカテゴリと優先度を設定する
3. 「追加」ボタンでタスクを登録する
4. チェックボックスで完了 / 未完了を切り替える
5. 「削除」ボタンで不要なタスクを削除する
6. 検索欄、完了状態、優先度フィルタで表示するタスクを絞り込む
7. 追加・更新・削除した内容は`localStorage`に保存され、ページ再読み込み後も残る

## 公開方法

`npm run build`で作成される`dist/`ディレクトリを、静的サイトとして配信できるサービスにアップロードします。
外部APIやバックエンドは不要です。

## 画面イメージ

1. 上部にアプリ名と簡単な件数表示を置く
2. タスク追加フォームを置く
3. 検索欄とフィルタを置く
4. タスク一覧を表示する
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
- 完了切り替えが`localStorage`に保存されること
- 削除後の状態が`localStorage`に保存されること
- 検索とフィルタを同時に使えること
- ページ再読み込み後もタスクが復元されること
- スマホ幅で表示崩れがないこと

## 実装済みステップ

1. 型定義を作成する
2. `localStorage`用のカスタムフックを作成する
3. タスク追加・削除・完了切り替えを実装する
4. 検索・フィルタを実装する
5. スマホ対応を含むスタイルを整える
6. 動作確認を行う
7. READMEに起動方法・ビルド方法・公開方法を追記する
