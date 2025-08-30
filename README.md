🚧 WIP

## Required Application

XCode
AndroidStudio

## install asdf

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
