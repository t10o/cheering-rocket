import { PageHeader } from "@/shared/components/PageHeader";
import { BackButton } from "@/shared/components/BackButton";
import { Skeleton } from "@cheering/ui";

export const EventDetailSkeleton = () => {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader
        title={<Skeleton width="120px" height="24px" />}
        left={<BackButton />}
      />
      <div className="p-4 space-y-6">
        <Section title="概要">
          <Skeleton height="60px" />
        </Section>

        <Section title="イベントID">
          <div className="flex items-center gap-2">
            <Skeleton width="200px" height="40px" />
            <Skeleton width="60px" height="32px" />
          </div>
          <Skeleton width="280px" height="16px" className="mt-1" />
        </Section>

        <Section title="応援用URL">
          <div className="flex items-center gap-2">
            <Skeleton width="250px" height="40px" />
            <Skeleton width="60px" height="32px" />
          </div>
          <Skeleton width="200px" height="16px" className="mt-1" />
        </Section>

        <Section title="メンバー">
          <div className="space-y-2">
            <Skeleton height="24px" />
            <Skeleton height="24px" />
            <Skeleton height="24px" />
          </div>
        </Section>
      </div>
    </div>
  );
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm text-gray-600">{title}</h2>
      <div className="rounded-2xl border bg-white p-4">{children}</div>
    </section>
  );
}
