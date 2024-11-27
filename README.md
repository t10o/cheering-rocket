# 応援ロケット

## Setup

### Install Volta

```bash
curl https://get.volta.sh | bash
```

### Install Corepack

```bash
volta install corepack
```

### Enable pnpm

```bash
corepack enable
corepack enable pnpm
```

### Install Dependencies

```bash
pnmm i
```

### Start Android Studio

```bash
npx cap open android
```

### Start XCode

```bash
npx cap open ios
```

## Dev

### Launch Dev Server
Launch Web, App, Storybook, UI build

```bash
pnpm dev
```

### Launch Simulator
You need to launch the dev server before executing this command. Additionally, both the iOS and Android simulators must be running.

```bash
pnpm dev:app
```
