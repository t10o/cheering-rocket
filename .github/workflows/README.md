# GitHub Actions ワークフロー

## ワークフロー構成

### 1. `test-and-deploy.yml` - メインパイプライン

**トリガー**: mainブランチへのプッシュ（アプリ関連ファイルの変更時）
**目的**: テスト実行 → 成功時にデプロイ

**ジョブ**:

- `test`: テスト実行（型チェック、リント、フォーマット、テスト、ビルド）
- `deploy`: デプロイ実行（Android APKビルド → Firebase App Distribution）

**特徴**:

- テストが失敗した場合、デプロイは実行されない
- アプリ関連ファイル（`apps/app/**`, `packages/**`）が変更された場合のみ実行
- 手動実行も可能

### 2. `test.yml` - 開発用テスト

**トリガー**: mainブランチ以外へのプッシュ、プルリクエスト
**目的**: 開発中の品質チェック

**ジョブ**:

- `test-and-quality`: テスト実行（型チェック、リント、フォーマット、テスト、ビルド）

**特徴**:

- mainブランチでは実行されない（重複回避）
- プルリクエスト時にも実行

### 3. `android-build.yml` - 無効化済み

**状態**: 無効化（`test-and-deploy.yml`に統合）

## デプロイフロー

```
mainブランチ更新
    ↓
test-and-deploy.yml トリガー
    ↓
test ジョブ実行
    ↓
テスト成功？
    ↓ YES
deploy ジョブ実行
    ↓
Firebase App Distribution に配信
```

## 手動実行

GitHub Actions の UI から手動でワークフローを実行できます：

1. GitHub リポジトリの「Actions」タブ
2. 実行したいワークフローを選択
3. 「Run workflow」ボタンをクリック
