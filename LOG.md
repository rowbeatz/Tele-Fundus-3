# Tele-Fundus 開発ログ

## Phase 1: Infrastructure & Core Logic
- `docker-compose.yml` および各種Dockerfileの作成
- PostgreSQL 15 用のDBマイグレーションSQLの作成 (0000〜0005)
- `apps/api` (Hono) と `apps/web` (React) のディレクトリ構造定義
- RootAgentおよび各エージェントの型定義とオーケストレーションロジックの基盤作成

## Phase 2: Workflow & Viewer
- `ClientAgent` による症例登録フローの実装 (`/src/pages/Registration.tsx`)
- `ReadingAgent` 向けの高機能Canvasビューワの実装 (`/src/pages/Viewer.tsx`)
  - ズーム、パン、輝度、コントラスト調整機能
- 症例スレッドによるコミュニケーション機能の実装 (チャットUIとバックエンドAPI)
- `Hono` 側にモックDBを用いた `viewer-data` API および `screenings` API を追加

## Phase 3: QC & Operations
- `AssignmentAgent` による医師割当機能の実装 (`/src/pages/Dashboard.tsx`)
  - ダッシュボードにステータス別タブ（未割当、読影中、QC待ち、完了）を追加
  - 医師一覧の取得とプルダウンからの割当処理
- `ReadingAgent` による所見レポート提出機能の実装 (`/src/pages/Viewer.tsx`)
- `QCAgent` による検品（QC）フローの実装
  - 読影完了ステータス時にビューアを「QC確認モード」へ切り替え
  - 承認（完了）および差し戻し（理由付きで再割当）機能の実装

## Phase 4: Billing & Reporting
- `BillingAgent` による課金集計バッチロジックの実装 (`/apps/api/src/index.ts`)
  - 依頼元への請求計算（ボリュームディスカウント：0-500件、501-1000件、1001件〜の階層別料金、至急オプション加算）
  - 読影医への支払計算（ランク別単価：指導医、専門医、一般医）
- 管理者用収支ダッシュボードの実装 (`/src/pages/Billing.tsx`)
  - 総請求額、総支払額、粗利益、利益率のKPI表示
  - 依頼元への請求明細と、読影医への支払明細のテーブル表示
