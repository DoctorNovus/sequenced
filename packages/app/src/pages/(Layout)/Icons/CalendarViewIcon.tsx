import calendarView from "@/assets/calendar-view.svg";

export default function CalendarViewIcon({ className = "" }: { className?: string }) {
  return <img src={calendarView} className={`w-6 h-6 ${className}`} alt="Calendar view placeholder" />;
}
