#!/bin/bash

# スクリプトのディレクトリを基準に package.json のパスを指定
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PACKAGE_JSON="$SCRIPT_DIR/../package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
  echo "Error: package.json not found at $PACKAGE_JSON"
  exit 1
fi

# package.json からバージョンを取得
APP_VERSION=$(node -p "require('$PACKAGE_JSON').version")

if [ -z "$APP_VERSION" ]; then
  echo "Error: Could not retrieve version from package.json"
  exit 1
fi

# ビルド番号を生成（例: タイムスタンプを使用）
BUILD_NUMBER=$(date +%Y%m%d%H%M)

echo "Updating app version to $APP_VERSION (build $BUILD_NUMBER)..."

# Android: build.gradle を更新
ANDROID_BUILD_FILE="$SCRIPT_DIR/../android/app/build.gradle"
if [ -f "$ANDROID_BUILD_FILE" ]; then
  sed -i "" "s/versionCode [0-9]\+/versionCode $BUILD_NUMBER/" "$ANDROID_BUILD_FILE"
  sed -i "" "s/versionName \".*\"/versionName \"$APP_VERSION\"/" "$ANDROID_BUILD_FILE"
  echo "Android version updated in $ANDROID_BUILD_FILE"
else
  echo "Warning: Android build.gradle not found"
fi

# iOS: Info.plist を更新
IOS_INFO_PLIST="$SCRIPT_DIR/../ios/App/App/Info.plist"
if [ -f "$IOS_INFO_PLIST" ]; then
  /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $APP_VERSION" "$IOS_INFO_PLIST"
  /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" "$IOS_INFO_PLIST"
  echo "iOS version updated in $IOS_INFO_PLIST"
else
  echo "Warning: iOS Info.plist not found"
fi

echo "Version update completed!"
