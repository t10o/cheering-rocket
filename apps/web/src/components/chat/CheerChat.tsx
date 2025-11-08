import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { FormEvent } from "react";

import { Button, Input } from "@cheering/ui";

import type { CheerMessage } from "@/types/cheer";

type CheerChatProps = {
  messages: CheerMessage[];
  onSubmit: (payload: {
    senderName: string;
    message: string;
  }) => Promise<void>;
  isPosting: boolean;
};

const NAME_STORAGE_KEY = "cheering-rocket.sender-name";

export const CheerChat = ({
  messages,
  onSubmit,
  isPosting,
}: CheerChatProps) => {
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const messageListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedName = window.localStorage.getItem(NAME_STORAGE_KEY);
    if (savedName) {
      setSenderName(savedName);
    }
  }, []);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    const payload = {
      senderName: senderName.trim(),
      message: message.trim(),
    };

    window.localStorage.setItem(NAME_STORAGE_KEY, senderName.trim());

    try {
      await onSubmit(payload);
      setMessage("");
    } catch (error) {
      console.error("Failed to send cheer message", error);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-xl">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">応援メッセージ</h2>
        <p className="text-sm text-gray-500">
          ニックネームを入力して、ランナー全員にエールを届けましょう。
        </p>
      </header>

      <div
        ref={messageListRef}
        className="flex-1 max-h-[45vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-finish-50/60 via-white to-marathon-50/40 p-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            まだ応援メッセージは届いていません。最初のエールを送ってみましょう！
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li key={message.id} className="flex flex-col">
                <div
                  className={clsx(
                    "max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                    message.senderType === "runner"
                      ? "self-end bg-gradient-to-r from-marathon-400 to-marathon-500 text-white"
                      : "self-start bg-white text-gray-900 border border-gray-100",
                  )}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span>
                      {message.senderName ||
                        (message.senderType === "runner"
                          ? "ランナー"
                          : "サポーター")}
                    </span>
                    <span className="text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {message.message}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3">
          <Input
            label="ニックネーム"
            placeholder="例: ゴール前応援隊"
            value={senderName}
            onChange={(value) => setSenderName(value)}
            aria-required="true"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="cheer-message"
          >
            メッセージ
          </label>
          <textarea
            id="cheer-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="心強い応援メッセージを送ってください！"
            rows={3}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed shadow-sm focus:border-marathon-500 focus:outline-none focus:ring-2 focus:ring-marathon-200"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            メッセージはランナーの端末にプッシュ通知で届きます。
          </p>
          <Button
            type="submit"
            variant="primary"
            isDisabled={isPosting || !senderName.trim() || !message.trim()}
          >
            {isPosting ? "送信中..." : "応援メッセージを送信"}
          </Button>
        </div>
      </form>
    </div>
  );
};
