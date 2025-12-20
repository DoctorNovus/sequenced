import { useApp } from "@/hooks/app";

export default function CalendarItem({ skeleton, date }: {skeleton?: boolean, date: Date}) {

  const [appData, setAppData] = useApp();

  if (skeleton) {
    return (
      <div className="hover:bg-accent-white p-3 rounded-full w-10 h-10 flex justify-center text-center items-center">
        <span className="text-lg">Today</span>
      </div>
    )
  }

  const changeDate = (date, e) => {
    let tempData = {
      ...appData,
      activeDate: date
    };

    tempData.activeDate = date;

    setAppData(tempData);
  }

  function convertDay(num) {
    switch (num) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
    }
  }

  const today = new Date();
  const isToday = today.toDateString() === date.toDateString();
  const isActive = appData.activeDate?.toDateString?.() === date.toDateString();

  const baseClasses =
    "p-3 rounded-full w-10 h-10 flex justify-center text-center items-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-blue-600 text-primary";
  const activeClasses =
    "bg-accent-blue-700 text-white ring-2 ring-accent-blue-300 shadow-md";
  const todayClasses =
    "bg-accent-blue-50 text-accent-blue-700 border border-accent-blue/30 dark:bg-[rgba(99,102,241,0.18)] dark:text-primary";

  return (
    <button
      type="button"
      onClick={(e) => changeDate(date, e)}
      aria-pressed={isActive}
      className={`${baseClasses} ${isActive ? activeClasses : ""} ${!isActive && isToday ? todayClasses : ""}`}
    >
      <span className="text-lg font-semibold">{date.getDate()}</span>
    </button>
  )
}
