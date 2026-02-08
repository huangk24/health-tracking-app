const PST_TIMEZONE = "America/Los_Angeles";
const PST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: PST_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const PST_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PST_TIMEZONE,
  weekday: "short",
});
const PST_LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PST_TIMEZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
});
const PST_DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PST_TIMEZONE,
  day: "numeric",
});

export const getPstDateString = (date: Date): string =>
  PST_DATE_FORMATTER.format(date);

// Use midday UTC to avoid date rollover issues across timezones.
export const dateFromPstString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
};

export const addDays = (dateStr: string, offset: number): string => {
  const base = dateFromPstString(dateStr);
  return getPstDateString(new Date(base.getTime() + offset * 86400000));
};

export const getWeekDates = (dateStr: string) => {
  const anchor = dateFromPstString(dateStr);
  const dayIndex = anchor.getUTCDay();
  const start = new Date(anchor.getTime() - dayIndex * 86400000);
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start.getTime() + index * 86400000);
    return {
      dateStr: getPstDateString(current),
      weekday: PST_WEEKDAY_FORMATTER.format(current),
      dayNumber: PST_DAY_FORMATTER.format(current),
    };
  });
};

export const formatPstLongDate = (dateStr: string): string =>
  PST_LONG_DATE_FORMATTER.format(dateFromPstString(dateStr));

export const getTodayPst = (): string => getPstDateString(new Date());
