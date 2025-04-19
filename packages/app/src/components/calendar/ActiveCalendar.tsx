import { useState } from "react";
import CalendarArrow from "./CalendarArrow";
import { formatDate, generateWeek } from "@/utils/date";
import CalendarItem from "./CalendarItem";

import CalendarIcon from "@/assets/calendar.svg";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useApp } from "@/hooks/app";

export default function ActiveCalendar({ skeleton }) {
  const [appData, setAppData] = useApp();

  const [calendarSize, setCalendarSize] = useState(7);
  const [activeWeek, setActiveWeek] = useState(0);
  const [swipeCounter, setSwipeCounter] = useState<number>(0);

  if (skeleton) {
    return (
      <div className="w-full h-full px-2">
        <div className="w-full flex justify-center my-3">
          <div className="flex flex-row w-[90%] justify-center">
            <div className="flex justify-center w-full py-1 border bg-accent-blue shadow-lg rounded-lg hover:bg-accent-blue-600">
              <input
                onChange={() => { }}
                value={formatDate(new Date())}
                type="date"
                className="w-full h-full bg-transparent text-accent-black invert px-1 m-0 text-center text-xl"
              />
            </div>
          </div>
        </div>
        <div className="w-full h-full flex flex-row items-center justify-center">
          <div className="flex flex-row w-full h-full justify-evenly items-center">
            <ChevronLeftIcon className="hidden lg:flex w-10 h-10 fill-accent-black-100 hover:fill-accent-black-300" />
            <div className="w-full md:w-[90%] flex flex-row justify-between px-4">
              {generateWeek(new Date(), 0).map((date, key) => (
                <CalendarItem date={date} key={key} />
              ))}
            </div>
            <ChevronRightIcon className="hidden lg:flex w-10 h-10 fill-accent-black-100 hover:fill-accent-black-300" />
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

    const tempYear = activeData[0];
    const tempMonth = activeData[1] - 1;
    const tempDay = activeData[2];

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

  const touchstart = (e) => {
    touchstartX = e.changedTouches[0].screenX;
  };

  const touchend = (e) => {
    touchendX = e.changedTouches[0].screenX;
    const direction = checkDirection();

    const tempDate = appData.activeDate;

    if (direction == 1) tempDate.setDate(tempDate.getDate() + 7);
    else if (direction == -1) tempDate.setDate(tempDate.getDate() - 7);

    setAppData({
      appData,
      activeDate: tempDate
    });
  };

  return (
    <div className="w-full h-full px-2">
      <div className="w-full flex justify-center my-3">
        <div className="flex flex-row w-[90%] justify-center">
          <div className="flex justify-center w-full py-1 border bg-accent-blue shadow-lg rounded-lg hover:bg-accent-blue-600">
            <input
              type="date"
              value={formatDate(appData.activeDate)}
              onChange={changeActiveMonth}
              className="w-full h-full bg-transparent text-accent-black invert px-1 m-0 text-center text-xl"
            />
          </div>
        </div>
      </div>
      <div className="w-full h-full flex flex-row items-center justify-center">
        <div className="flex flex-row w-full h-full justify-evenly items-center">
          <ChevronLeftIcon
            className="hidden lg:flex w-10 h-10 fill-accent-black-100 hover:fill-accent-black-300"
            onClick={(e) => {
              const tempDate = appData.activeDate;
              tempDate.setDate(tempDate.getDate() - 7);
            }}
          />
          <div
            className="w-full md:w-[90%] flex flex-row justify-between px-4"
            onTouchStart={touchstart}
            onTouchEnd={touchend}
          >
            {dates.map((date, key) => (
              <CalendarItem date={date} key={key} />
            ))}
          </div>
          <ChevronRightIcon
            className="hidden lg:flex w-10 h-10 fill-accent-black-100 hover:fill-accent-black-300"
            onClick={(e) => {
              const tempDate = appData.activeDate;
              tempDate.setDate(tempDate.getDate() + 7);
              setAppData({
                appData,
                activeDate: tempDate
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
