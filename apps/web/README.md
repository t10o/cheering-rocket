# Cheering Web

応援用リンクからアクセスできるリアルタイム応援ページです。ランナーの現在地や走行軌跡を Google マップ上に表示し、サポーターのメッセージ送信と閲覧をサポートします。

## 主な機能

- イベント ID ごとの応援 URL (`/cheer/:eventId`)
- Google Maps によるランナー位置表示と走行ルートの道路スナップ
- ランナーごとの識別色と重なりを抑えたポリライン描画
- 応援メッセージの投稿／閲覧（Firebase Functions 経由で処理）
- Firebase Cloud Messaging を利用したランナー端末へのプッシュ通知連携
- PC / モバイルのレスポンシブ対応とアクセシビリティに配慮した UI

## 環境変数

`.env` もしくは `.env.local` などで以下を設定してください。

| 変数名 | 説明 |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase API キー |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth ドメイン |
| `VITE_FIREBASE_PROJECT_ID` | Firebase プロジェクト ID |
| `VITE_FIREBASE_APP_ID` | Firebase アプリ ID |
| `VITE_FIREBASE_SENDER_ID` | Firebase メッセージ送信者 ID |
| `VITE_FIREBASE_FUNCTIONS_REGION` | Firebase Functions のリージョン（例: `asia-northeast1`） |
| `VITE_FIREBASE_FUNCTIONS_EMULATOR_ORIGIN` | Functions Emulator を使う場合のベース URL（例: `http://localhost:5001`、任意） |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API キー |
| `VITE_CHEER_POLLING_INTERVAL_MS` | 応援ページのポーリング間隔 (ミリ秒、任意。既定値 15000) |
| `VITE_CHEER_HISTORICAL_POINTS_WINDOW` | マップに保持する走行履歴の最大ポイント数 (任意。既定値 50) |
| `VITE_CHEER_WEB_BASE_URL` | アプリ側から共有する応援ページのベース URL。未設定時は `window.location.origin` を利用 |

## 開発手順

```bash
pnpm install
pnpm -C apps/web dev
```

Firebase Functions / Firestore をローカルで利用する場合は、 `VITE_FIREBASE_FUNCTIONS_EMULATOR_ORIGIN` を設定しておくと HTTPS Callable 呼び出しがローカルに切り替わります。

## Firebase との連携

- `functions/src/index.ts` に `getCheerSession` と `postCheerMessage` を実装しています。
  - `getCheerSession` はランナーの現在地・履歴・応援メッセージをまとめて取得します。
  - `postCheerMessage` はメッセージ保存と FCM プッシュ通知送信を行います。
- Firestore には以下の追加フィールド／インデックスを利用します。
  - `runs` ドキュメントに `deviceToken` フィールド（ランナー端末の FCM トークン）
  - `cheerMessages` コレクションに `eventId`、`timestamp`
  - `locationPoints` コレクションに `runId`、`timestamp`

## テスト

```bash
pnpm -C apps/web lint
pnpm -C apps/web test
```

> **Note:** 初回実行時に依存パッケージのインストールが必要です。`pnpm install` が完了していない場合は先に実行してください。

## デプロイ

ビルドは `pnpm -C apps/web build` を利用してください。生成物は `apps/web/dist` に出力されます。
