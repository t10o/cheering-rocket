import { initializeApp } from "firebase-admin/app";
import { onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

initializeApp(); // admin SDK 初期化

// 認証必須の Callable 関数（クライアントから呼べる）
export const hello = onCall({ region: "asia-northeast1" }, (req) => {
  if (!req.auth) {
    throw new Error("Unauthenticated");
  }
  return { ok: true, uid: req.auth.uid, message: "Hello from Functions v2!" };
});

// Firestore トリガ（users/{uid} 作成時）
export const onUserCreated = onDocumentCreated("users/{uid}", async (event) => {
  const uid = event.params.uid;
  console.log("New user doc:", uid, event.data?.data());
});
