import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "default";

  const profile = await prisma.profile.findFirst({
    where: userId !== "default" ? { userId } : {},
    select: { cheatDay: true },
  });

  const cheatDay = profile?.cheatDay || "Saturday";

  // Map day name to iCal BYDAY code (SU, MO, TU, WE, TH, FR, SA)
  const dayMap: Record<string, string> = {
    sunday: "SU",
    monday: "MO",
    tuesday: "TU",
    wednesday: "WE",
    thursday: "TH",
    friday: "FR",
    saturday: "SA",
  };

  const byDayCode = dayMap[cheatDay.toLowerCase()] || "SA";

  const icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LifeFit OS//Cheat Day Calendar Feed//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:LifeFit OS Cheat Days 🍕",
    "X-WR-TIMEZONE:UTC",
    "BEGIN:VEVENT",
    `UID:cheat-day-${userId}@lifefit-os.local`,
    "DTSTAMP:20260905T090000Z",
    "DTSTART;VALUE=DATE:20260905",
    "DTEND;VALUE=DATE:20260906",
    `RRULE:FREQ=WEEKLY;BYDAY=${byDayCode}`,
    "SUMMARY:🍕 LifeFit OS Cheat Day (Enjoy Junk Food!)",
    `DESCRIPTION:Today is your designated ${cheatDay} Cheat Day in LifeFit OS. Enjoy your favorite meals with boosted dynamic calorie targets!`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(icalContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="lifefit-cheat-day.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
