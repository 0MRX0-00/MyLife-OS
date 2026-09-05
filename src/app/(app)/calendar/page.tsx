import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { getCalendarMonthData } from "@/services/calendar/calendar-service";
import { CalendarContent } from "@/features/calendar/components/calendar-content";

export const metadata: Metadata = { title: "Calendar — LifeFit OS" };

export default async function CalendarPage() {
  const userId = await requireAuth();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const data = await getCalendarMonthData(userId, year, month);

  return (
    <CalendarContent
      initialYear={year}
      initialMonth={month}
      initialData={data}
    />
  );
}
