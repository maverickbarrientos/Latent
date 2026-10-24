import { format, formatDistanceToNow, isThisYear, isToday, isYesterday, parseISO } from "date-fns"

/** "Today, 11:00 AM", "Yesterday, 4:00 PM", "Oct 22, 3:00 AM", or "Oct 22, 2025, 3:00 AM" for older years. */
export function formatWhen(iso: string): string {
  const d = parseISO(iso)
  const time = format(d, "h:mm a")
  if (isToday(d)) return `Today, ${time}`
  if (isYesterday(d)) return `Yesterday, ${time}`
  return `${format(d, isThisYear(d) ? "MMM d" : "MMM d, yyyy")}, ${time}`
}

/** "Oct 24", for chart axes. */
export const formatDay = (iso: string): string => format(parseISO(iso), "MMM d")

/** "Oct 24, 11:00 AM", for chart tooltips. */
export const formatDayTime = (iso: string): string => format(parseISO(iso), "MMM d, h:mm a")

/** "3 hours ago". */
export const formatAgo = (iso: string): string => formatDistanceToNow(parseISO(iso), { addSuffix: true })
