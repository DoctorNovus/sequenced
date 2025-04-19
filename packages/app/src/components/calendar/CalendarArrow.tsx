import arrow_left from "@/assets/arrow_left.svg";
import arrow_right from "@/assets/arrow_right.svg";

export default function CalendarArrow({ direction, activeWeek, changeActiveWeek }) {
  let source = arrow_left;
  if (direction == "right") source = arrow_right;

  const handleClick = () => {
    if(direction == "left")
        changeActiveWeek(activeWeek - 7);
    else
        changeActiveWeek(activeWeek + 7);
  }

  return (
    <div className="flex w-8" onClick={handleClick}>
      <img src={source} className={`${direction == "left" ? "ml-2" : "mr-2"} w-8 h-8 invert`} />
    </div>
  );
}
