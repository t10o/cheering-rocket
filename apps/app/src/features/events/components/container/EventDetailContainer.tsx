import { useEffect, useState } from "react";

import {
  copyToClipboard,
  type Event,
  fetchEventDetail,
  generateCheerUrl,
  isHeicImage,
  type MemberView,
} from "../../functions/eventDetail";
import { EventDetailPresenter } from "../presenter/EventDetailPresenter";
import { EventDetailSkeleton } from "../presenter/EventDetailSkeleton";

import { useAuth } from "@/features/auth/hooks/useAuth";

export type EventDetailContainerProps = {
  eventId: string;
};

export const EventDetailContainer = ({
  eventId,
}: EventDetailContainerProps) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<MemberView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventDetail = async () => {
      setLoading(true);
      try {
        const { event: eventData, members: membersData } =
          await fetchEventDetail(eventId);
        setEvent(eventData);
        setMembers(membersData);
      } catch (error) {
        console.error("Failed to load event detail:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEventDetail();
  }, [eventId]);

  const handleCopyEventId = async () => {
    try {
      await copyToClipboard(eventId);
    } catch (error) {
      console.error("Failed to copy event ID:", error);
    }
  };

  const handleCopyCheerUrl = async () => {
    try {
      const cheerUrl = generateCheerUrl(eventId);
      await copyToClipboard(cheerUrl);
    } catch (error) {
      console.error("Failed to copy cheer URL:", error);
    }
  };

  if (!event || loading) {
    return <EventDetailSkeleton />;
  }

  const cheerUrl = generateCheerUrl(eventId);
  const isOwner = !!(user && event && event.ownerUid === user.uid);

  return (
    <EventDetailPresenter
      event={event}
      members={members}
      eventId={eventId}
      cheerUrl={cheerUrl}
      isOwner={isOwner}
      onCopyEventId={handleCopyEventId}
      onCopyCheerUrl={handleCopyCheerUrl}
      isHeicImage={isHeicImage}
    />
  );
};
