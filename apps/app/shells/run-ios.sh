#!/bin/bash

# 現在 Booted 状態のデバイスを取得
DEVICE_UDID=$(xcrun simctl list devices | grep "(Booted)" | grep -oE "[A-F0-9-]{36}" | head -n 1)

if [ -z "$DEVICE_UDID" ]; then
  echo "Error: No Booted device found. Please start a simulator first."
  exit 1
fi

# Booted デバイス情報を出力
DEVICE_NAME=$(xcrun simctl list devices | grep "$DEVICE_UDID" | awk -F '[()]' '{print $1}' | xargs)
echo "Using Booted device: $DEVICE_NAME (UDID: $DEVICE_UDID)"

# シミュレータアプリを開く
open -a Simulator

# Capacitor アプリを実行
NODE_ENV=development npx cap run ios --target="$DEVICE_UDID"
