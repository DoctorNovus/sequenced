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

  let currentDate = new Date().getDate();

  return (
    <div onClick={(e) => changeDate(date, e)}
      className={`hover:bg-accent-white ${date.getDate() == currentDate && "bg-accent-blue-600 text-accent-white"} ${appData.activeDate.getDate() == date.getDate() && "border border-solid border-blue-500"} p-3 rounded-full w-10 h-10 flex justify-center text-center items-center`}>
      <span className="text-lg">{date.getDate()}</span>
    </div>
  )
}
