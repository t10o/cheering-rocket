import * as Sentry from "@sentry/react";

/**
 * 開発モードではSentryにエラーを送信しないラッパー関数
 * @param error 送信するエラー
 * @param context エラーのコンテキスト情報
 */
export const captureException = (error: unknown, context?: string) => {
  // 開発モードの場合はコンソールに出力するだけ
  if (import.meta.env.DEV) {
    console.error(
      "Sentry (開発モード):",
      context ? `${context} - ${error}` : error,
    );
    return;
  }

  // 本番モードではSentryに送信
  Sentry.captureException(error);
};

/**
 * 開発モードではSentryにメッセージを送信しないラッパー関数
 * @param message 送信するメッセージ
 * @param level ログレベル
 */
export const captureMessage = (
  message: string,
  level: "info" | "warning" | "error" = "info",
) => {
  // 開発モードの場合はコンソールに出力するだけ
  if (import.meta.env.DEV) {
    if (level === "error") {
      console.error(`Sentry (開発モード): ${message}`);
    } else {
      console.warn(`Sentry (開発モード): ${message}`);
    }
    return;
  }

  // 本番モードではSentryに送信
  Sentry.captureMessage(message, level);
};
