import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
  type EventLite,
  joinEvent,
  searchEvent,
} from "../../functions/joinEvent";
import { JoinEventPresenter } from "../presenter/JoinEventPresenter";

import { useAuth } from "@/features/auth/hooks/useAuth";

export const JoinEventContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventId, setEventId] = useState("");
  const [hit, setHit] = useState<{ id: string; data: EventLite } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const handleSearch = async () => {
    setError(null);
    setHit(null);
    const id = eventId.trim();
    if (!id) return;

    setLoading(true);
    try {
      const result = await searchEvent(id);
      setHit({ id: result.id, data: result.data! });
    } catch (e: unknown) {
      setError((e as Error).message || "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !hit) return;

    setJoining(true);
    setError(null);
    try {
      await joinEvent(hit.id, user.uid);
      // 参加完了 → 詳細へ
      navigate({ to: "/events/$eventId", params: { eventId: hit.id } });
    } catch (e: unknown) {
      setError((e as Error).message || "参加に失敗しました");
    } finally {
      setJoining(false);
    }
  };

  const alreadyMember = false; // 必要なら members/{uid} の存在チェックを追加

  return (
    <JoinEventPresenter
      eventId={eventId}
      onEventIdChange={setEventId}
      onSearch={handleSearch}
      onJoin={handleJoin}
      hit={hit}
      loading={loading}
      joining={joining}
      error={error}
      alreadyMember={alreadyMember}
    />
  );
};
