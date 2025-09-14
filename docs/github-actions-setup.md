# GitHub Actions セットアップガイド

このドキュメントでは、Android APKの自動ビルドとFirebase App Distributionへの配信を設定する方法を説明します。

## 必要なシークレットの設定

GitHubリポジトリのSettings > Secrets and variables > Actionsで以下のシークレットを設定してください。

### 1. FIREBASE_TOKEN

Firebase CLIの認証トークンです。CI/CDでFirebase CLIを使用するために必要です。

```bash
# 1. Firebase CLIをインストール（まだの場合）
npm install -g firebase-tools

# 2. ブラウザでログイン
firebase login

# 3. CI用のトークンを生成
firebase login:ci
```

**実行結果例**:

```
✔  Firebase CLI Login Successful

Visit this URL on this/any other device to log in:
https://accounts.google.com/o/oauth2/auth?client_id=...

Waiting for authentication...

✔  Success! Use this token to login on a CI server:

1//0AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

この長いトークン（`1//0AbCdEfGhIjKlMnOpQrStUvWxYz...`）を`FIREBASE_TOKEN`として設定してください。

### 2. FIREBASE_ANDROID_APP_ID

Firebase ConsoleでAndroidアプリのApp IDを取得します。

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. **Project Settings** (歯車アイコン) → **General**タブ
4. **Your apps**セクションでAndroidアプリを見つける
5. **App ID**をコピー

**App IDの形式例**:

```
1:123456789012:android:abcdef1234567890abcdef
```

このApp IDを`FIREBASE_ANDROID_APP_ID`として設定してください。

**App IDの構造**:

- `1:` - プロジェクト番号プレフィックス
- `123456789012:` - プロジェクト番号（数字）
- `android:` - プラットフォーム識別子
- `abcdef1234567890abcdef` - アプリ固有のID

### 3. GitHub Secretsの設定

取得した値をGitHubリポジトリのSecretsに設定します。

1. GitHubリポジトリページで **Settings** タブをクリック
2. 左サイドバーの **Secrets and variables** → **Actions** をクリック
3. **New repository secret** をクリック
4. 以下の2つのシークレットを追加：

**FIREBASE_TOKEN**:

- Name: `FIREBASE_TOKEN`
- Secret: `1//0AbCdEfGhIjKlMnOpQrStUvWxYz...`（`firebase login:ci`で取得したトークン）

**FIREBASE_ANDROID_APP_ID**:

- Name: `FIREBASE_ANDROID_APP_ID`
- Secret: `1:123456789012:android:abcdef1234567890abcdef`（Firebase Consoleで取得したApp ID）

## Firebase App Distributionの設定

### 1. App Distributionの有効化

Firebase ConsoleでApp Distributionを有効にしてください。

1. Firebase Console > App Distribution
2. 「Get started」をクリック
3. Androidアプリを選択または追加

### 2. テスターグループの設定

Firebase Consoleでテスターグループを作成し、メンバーを管理してください。

1. Firebase Console > App Distribution > Testers & Groups
2. 「Create group」をクリック
3. グループ名: `testers`
4. テスターのメールアドレスを追加
5. グループを作成

**注意**: テスターのメールアドレスはFirebase Consoleでのみ管理し、コードには含めません。これにより、テスター情報の変更時にコードを修正する必要がなくなります。

### 3. テスター管理のベストプラクティス

**テスターの追加**:

1. Firebase Console > App Distribution > Testers & Groups
2. `testers`グループを選択
3. 「Add testers」をクリック
4. メールアドレスを入力して追加

**テスターの削除**:

1. グループ内のテスター一覧から削除したいテスターを選択
2. 「Remove」をクリック

**新しいグループの作成**:

- 例: `internal-testers`、`beta-users`など
- ワークフローファイルの`--groups`パラメータで複数グループを指定可能

## ワークフローの動作

### トリガー条件

- `main`ブランチへのpush
- `apps/app/**`、`packages/**`、`.github/workflows/android-build.yml`の変更

### ビルドプロセス

Capacitorアプリのビルドは以下の手順で実行されます：

1. **Node.js環境のセットアップ**
2. **依存関係のインストール** (`pnpm install`)
3. **Webアプリのビルド** (`pnpm build`)
   - Reactアプリをビルドして`dist`ディレクトリに出力
   - TypeScriptのコンパイル、バンドル、最適化
4. **Android SDKのセットアップ**
5. **Capacitorの同期** (`npx cap sync android`)
   - ビルドされたWebアプリをAndroidプロジェクトにコピー
   - ネイティブプラグインの設定を同期
6. **Android APKのビルド** (`./gradlew assembleDebug`)
   - Androidアプリとしてパッケージ化
7. **APKのアーティファクトアップロード**
8. **Firebase App Distributionへの配信**（mainブランチのみ）

**重要なポイント**: WebアプリのビルドとCapacitorの同期は必須です。これらがないと、最新のWebアプリコードがAndroidアプリに反映されません。

### ビルド結果

- **Pull Request**: ビルドテストのみ実行
- **Main branch**: ビルド + Firebase App Distributionへの配信

## トラブルシューティング

### よくある問題

1. **Firebase認証エラー**
   - `FIREBASE_TOKEN`が正しく設定されているか確認
   - トークンの有効期限を確認

2. **Android App IDが見つからない**
   - `FIREBASE_ANDROID_APP_ID`が正しいApp IDか確認
   - Firebase ConsoleでAndroidアプリが登録されているか確認

3. **ビルドエラー**
   - Android SDKのバージョンが正しいか確認
   - Gradleの依存関係を確認

### ログの確認

GitHub Actionsのログで詳細なエラー情報を確認できます。

1. GitHubリポジトリ > Actions
2. 失敗したワークフローをクリック
3. 各ステップのログを確認

## セキュリティ考慮事項

- シークレットは適切に管理し、定期的に更新してください
- Firebaseトークンは最小権限で設定してください
- テスターグループには信頼できるメールアドレスのみを追加してください
- **重要**: テスターのメールアドレスはFirebase Consoleでのみ管理し、コードリポジトリには含めないでください
- テスターの追加・削除はFirebase Consoleから行い、コードの変更は不要です
