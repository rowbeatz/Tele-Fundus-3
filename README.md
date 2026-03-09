# Telefundus System

Telefundus Systemは、眼底検査の症例管理、医師による読影、QC（品質管理）、および請求管理を一元化するフルスタックWebアプリケーションです。

## 技術スタック

本システムは以下の技術で構成されています。

### フロントエンド
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Components/UI**: React Dropzone, React Router

### バックエンド
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: SQLite (better-sqlite3)
- **File Handling**: Multer (アップロード), csv-parse (CSV処理), adm-zip (ZIP処理)

## ディレクトリ構造

```text
/
├── server.ts           # サーバーエントリーポイント (Express + Vite)
├── server/             # バックエンドロジック
│   ├── routes.ts       # APIルーティング
│   ├── screeningController.ts # 症例関連コントローラー
│   ├── screeningService.ts    # 症例関連ビジネスロジック
│   └── ...             # 他コントローラー/サービス
├── src/                # フロントエンドソース
│   ├── components/     # 再利用可能なUIコンポーネント
│   ├── pages/          # ページコンポーネント
│   ├── services/       # APIクライアント
│   └── ...
├── public/             # 静的ファイル
└── telefundus.db       # SQLiteデータベースファイル
```

## データベース設計

SQLiteを使用しており、主に以下のテーブルで構成されています。

- **organizations**: 健診機関情報
- **physicians**: 医師情報
- **examinees**: 被検者情報
- **screenings**: 検査症例情報 (メインテーブル)
- **screening_images**: 検査画像URL
- **reading_reviews**: 読影レビュー結果
- **audit_logs**: 操作ログ

## API エンドポイント

主要なAPIは `/api` 以下に定義されています。

- `GET /api/stats`: ダッシュボード用統計データ
- `GET /api/screenings`: 症例一覧取得（**クエリ対応**）
  - `status`: ステータス絞り込み（`registered | submitted | assigned | reading_completed | completed | confirmed | rejected | pending`）
  - `search`: 患者名 / 患者ID (`examinee_number`) / 機関名の部分一致検索（最大100文字）
  - `limit`: 1〜500件
  - `offset`: 0以上
- `POST /api/screenings`: 症例登録
- `POST /api/screenings/batch`: 症例一括登録 (CSV + ZIP)
- `GET /api/screenings/:id`: 症例詳細取得
- `PATCH /api/screenings/:id`: 症例更新
- `POST /api/screenings/:id/reviews`: QCレビュー登録
- `POST /api/screenings/:id/messages`: 症例メッセージ投稿
- `GET /api/physicians`: 医師一覧
- `POST /api/physicians`: 医師登録
- `GET /api/organizations`: 健診機関一覧
- `GET /api/billing`: 請求サマリー
- `POST /api/billing/finalize`: 請求確定

### API/フロント整合性の設計方針

- 一覧系の絞り込み（status/search/pagination）は、原則バックエンド側で実行し、フロントは表示責務に集中します。
- `Queue` / `Reviews` は `GET /api/screenings?status=...` を直接利用し、全件取得→クライアント絞り込みを避けます。
- 入力値検証は `zod` で行い、契約違反は `400` を返して早期検知します。

## セットアップと起動

### 前提条件
- Node.js (v22以上推奨)
- npm

### 手順

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**
   `.env.example` を参考に `.env` ファイルを作成してください。

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   サーバーは `http://localhost:3000` で起動します。

4. **ビルド**
   ```bash
   npm run build
   ```

## 開発ガイド

### 新規機能の追加
1. **バックエンド**: `server/` 配下にコントローラーとサービスを追加し、`server/routes.ts` でルーティングを定義してください。
2. **フロントエンド**: `src/pages/` または `src/components/` にコンポーネントを追加し、`src/services/` を通じてAPIを呼び出してください。

### データベースの変更
`server.ts` 内の `db.exec` にあるテーブル定義を更新してください。既存のデータベースファイル (`telefundus.db`) を削除すると、再起動時に初期データが再シードされます。


## 最近の改善（パフォーマンス/保守性）

- 症例一覧APIに `status/search/limit/offset` を追加し、DBレベルでの絞り込みに対応。
- Queue/Reviews のデータ取得をサーバーサイド検索へ統一し、転送量とクライアント負荷を削減。
- 検索入力時はデバウンス + AbortController で不要リクエストを抑制。
