import { formatDate, generateWeek } from "@/utils/date";
import CalendarItem from "./CalendarItem";

import CalendarIcon from "@/assets/calendar.svg";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useApp } from "@/hooks/app";

type ActiveCalendarProps = {
  skeleton?: boolean;
};

export default function ActiveCalendar({ skeleton }: ActiveCalendarProps) {
  const [appData, setAppData] = useApp();

  const shiftWeek = (direction: number) => {
    const tempDate = new Date(appData.activeDate!);
    tempDate.setDate(tempDate.getDate() + 7 * direction);
    setAppData({ ...appData, activeDate: tempDate });
  };

  if (skeleton) {
    return (
      <div className="w-full h-full">
        <div className="rounded-3xl surface-card border p-4 shadow-xl ring-1 ring-accent-blue/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={CalendarIcon} className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-primary">This Week</span>
              </div>
            </div>
            <div className="flex w-44 md:w-56 justify-end">
              <div className="flex w-full items-center rounded-2xl border border-accent-blue/20 bg-accent-blue-50/60 px-2 py-1 shadow-inner dark:bg-[rgba(99,102,241,0.12)]">
                <input
                  disabled
                  value={formatDate(new Date())}
                  type="date"
                  className="w-full rounded-2xl border-none bg-transparent text-center text-sm font-semibold text-muted focus:outline-hidden"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-row items-center justify-center">
            <div className="flex flex-row w-full h-full justify-evenly items-center">
              <div className="hidden lg:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-blue-50 text-slate-400 shadow-inner dark:bg-[rgba(99,102,241,0.12)] dark:text-muted" aria-hidden>
                  <ChevronLeftIcon className="w-6 h-6" />
                </div>
              </div>
              <div className="w-full md:w-[90%] flex flex-row justify-between px-2 md:px-4">
                {generateWeek(new Date(), 0).map((date, key) => (
                  <CalendarItem date={date} key={key} />
                ))}
              </div>
              <div className="hidden lg:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-blue-50 text-slate-400 shadow-inner dark:bg-[rgba(99,102,241,0.12)] dark:text-muted" aria-hidden>
                  <ChevronRightIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  let touchstartX = 0;
  let touchendX = 0;

  const dates = generateWeek(appData.activeDate || new Date(), 0);

  function changeActiveMonth(e: React.ChangeEvent<HTMLInputElement>) {
    let activeData = e.target.value.split("-");

    let tempData = {
      ...appData,
    };

    const tempYear = parseInt(activeData[0]);
    const tempMonth = parseInt(activeData[1]) - 1;
    const tempDay = parseInt(activeData[2]);

    tempData.activeDate = new Date();
    tempData.activeDate.setFullYear(tempYear);
    tempData.activeDate.setMonth(tempMonth);
    tempData.activeDate.setDate(tempDay);

    setAppData(tempData);
  }

  const checkDirection = () => {
    if (touchendX < touchstartX) return -1;
    if (touchendX > touchstartX) return 1;

    return 0;
  };

  const touchstart = (e: React.TouchEvent) => {
    touchstartX = e.changedTouches[0].screenX;
  };

  const touchend = (e: React.TouchEvent) => {
    touchendX = e.changedTouches[0].screenX;
    const direction = checkDirection();

    if (direction !== 0) {
      shiftWeek(direction);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="rounded-3xl surface-card border p-4 shadow-xl ring-1 ring-accent-blue/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <img src={CalendarIcon} className="h-6 w-6" /> */}
            <div className="flex flex-col justify-center">
              <span className="text-lg font-semibold text-primary">This Week</span>
            </div>
          </div>
          <div className="flex flex-row w-48 md:w-60">
            <div className="flex justify-center w-full rounded-2xl border border-accent-blue/30 bg-white shadow-xs ring-1 ring-accent-blue/10 focus-within:ring-2 focus-within:ring-accent-blue/30 dark:bg-[rgba(15,23,42,0.85)] dark:border-accent-blue/40">
              <input
                type="date"
                value={formatDate(appData.activeDate!)}
                onChange={changeActiveMonth}
                className="w-full h-full rounded-2xl border-none bg-transparent px-3 py-2 text-center text-sm font-semibold text-primary focus:outline-hidden"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-row items-center justify-center">
          <div className="flex flex-row w-full h-full justify-evenly items-center">
            <div className="hidden lg:flex">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-blue-50 text-primary shadow-inner transition hover:bg-accent-blue-100 dark:bg-[rgba(99,102,241,0.12)]"
                onClick={() => shiftWeek(-1)}
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
            </div>
            <div
              className="w-full md:w-[90%] flex flex-row justify-between px-2 md:px-4"
              onTouchStart={touchstart}
              onTouchEnd={touchend}
            >
              {dates.map((date, key) => (
                <CalendarItem date={date} key={key} />
              ))}
            </div>
            <div className="hidden lg:flex">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-blue-50 text-primary shadow-inner transition hover:bg-accent-blue-100 dark:bg-[rgba(99,102,241,0.12)]"
                onClick={() => shiftWeek(1)}
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
