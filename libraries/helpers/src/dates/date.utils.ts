export class DateUtils {
  static formatScheduledTime(date: Date | string, timezone: string = "UTC"): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  }

  static isDue(scheduledAt: Date | string): boolean {
    return new Date(scheduledAt).getTime() <= Date.now();
  }

  static getNextSlot(minutesFromNow: number = 30): Date {
    return new Date(Date.now() + minutesFromNow * 60 * 1000);
  }
}

