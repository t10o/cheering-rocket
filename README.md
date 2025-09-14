# Cheering Rocket

マラソンランナーを応援するアプリです。

## 開発環境セットアップ

### Required Application

- XCode
- Android Studio

## CI/CD

このプロジェクトでは、GitHub Actionsを使用してAndroid APKの自動ビルドとFirebase App Distributionへの配信を行います。

### セットアップ

詳細なセットアップ手順は [GitHub Actions セットアップガイド](docs/github-actions-setup.md) を参照してください。

### 自動ビルド

- **mainブランチへのpush**: 自動的にAPKがビルドされ、Firebase App Distributionに配信されます
- **Pull Request**: ビルドテストが実行されます
- **手動実行**: GitHub Actionsの画面から手動でワークフローを実行できます

## 開発環境

### install asdf

```
export PATH="$PATH:$(npm prefix -g)/bin"

export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

export JAVA_HOME=$(asdf where java)
export PATH=$JAVA_HOME/bin:$PATH
```

## change xcode reference

```
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
```

## install cocoapods

```
brew install cocoapods
pod setup
```

## set android home

```
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools' >> ~/.zshrc
```

set android studio path

```
export CAPACITOR_ANDROID_STUDIO_PATH=/Users/ogt/Applications/Android\ Studio.app
```
