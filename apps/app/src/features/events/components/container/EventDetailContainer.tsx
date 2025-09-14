import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";

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

export type EventDetailContainerProps = {
  eventId: string;
};

export const EventDetailContainer = ({
  eventId,
}: EventDetailContainerProps) => {
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
        Sentry.captureException(error);
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
      Sentry.captureException(error);
    }
  };

  const handleCopyCheerUrl = async () => {
    try {
      const cheerUrl = generateCheerUrl(eventId);
      await copyToClipboard(cheerUrl);
    } catch (error) {
      console.error("Failed to copy cheer URL:", error);
      Sentry.captureException(error);
    }
  };

  if (!event || loading) {
    return <EventDetailSkeleton />;
  }

  const cheerUrl = generateCheerUrl(eventId);

  return (
    <EventDetailPresenter
      event={event}
      members={members}
      eventId={eventId}
      cheerUrl={cheerUrl}
      onCopyEventId={handleCopyEventId}
      onCopyCheerUrl={handleCopyCheerUrl}
      isHeicImage={isHeicImage}
    />
  );
};
