/* Gets year in US YYYY format */
export function getYearYYYY(date: Date): string {
  return date
    .getFullYear()
    .toLocaleString("en-US", { minimumIntegerDigits: 4, useGrouping: false });
}

/* Ensures date in US MM format */
export function getMonthMM(date: Date): string {
  return (date.getMonth() + 1).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

/* Ensures date in US DD format */
export function getDateDD(date: Date): string {
  return date
    .getDate()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
}

/* Ensures date in US hh format */
export function getHoursHH(date: Date): string {
  return date
    .getHours()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
}

/* Ensures date in US mm format */
export function getMinutesMM(date: Date): string {
  return date
    .getMinutes()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
}

/* Ensures date in US ss format */
export function getSecondsSS(date: Date): string {
  return date
    .getSeconds()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
}

/* Formats date in YYYY-MM-DD format */
export function formatDate(date: Date): string {
  return `${getYearYYYY(date)}-${getMonthMM(date)}-${getDateDD(
    date
  )}`;
}

/* Formats date in MM-DD format */
export function formatDateMMDD(date: Date): string {
  return `${getMonthMM(date)}-${getDateDD(date)}`;
}

/* Formats date in YYYY-MM format */
export function formatDateYYYYMM(date: Date): string {
  return `${getYearYYYY(date)}-${getMonthMM(date)}`;
}

/* Formats date in YYYY-MM-DDThh:mm format */
export function formatDateTime(date: Date): string {
  return `${getYearYYYY(date)}-${getMonthMM(date)}-${getDateDD(
    date
  )}T${getHoursHH(date)}:${getMinutesMM(date)}`;
}

/* Formats date in YYYY-MM-DDT00:00:00 format */
export function formatDateTimeClean(date: Date): string {
  return `${getYearYYYY(date)}-${getMonthMM(date)}-${getDateDD(
    date
  )}T00:00:00`;
}

/* Formats date in MM/DD/YYYY hh:mm format */
export function formatDateClean(date: Date): string {
  if (!date) return "No Date Set";

  const month = getMonthMM(date);
  const day = getDateDD(date);
  const year = getYearYYYY(date);

  const hours = getHoursHH(date);
  const minutes = getMinutesMM(date);

  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

/* Generates an array of 7 dates within range of the starting date, with the dayStart as the first index */
export function generateWeek(startingDate: Date, dayStart: number) {
  let week = [];

  let dateSet = new Date(startingDate);

  if (startingDate.getDay() != dayStart) {
    dateSet.setDate(
      startingDate.getDate() - (startingDate.getDay() - dayStart)
    );
  }

  for (let i = 0; i < 7; i++) {
    let tempDate = new Date(dateSet);
    tempDate.setDate(tempDate.getDate() + i);

    week.push(tempDate);
  }

  return week;
}

/* Checks if a date is overdue in relation to the second date */
export function isOverdue(firstDate: Date, secondDate: Date): boolean {
  const dateOne = new Date(firstDate);
  const dateTwo = new Date(secondDate);

  return dateOne < dateTwo;
}

export function withinWeek(firstDate: Date, secondDate: Date): boolean {
  return (
    firstDate.getFullYear() == secondDate.getFullYear() &&
    firstDate.getMonth() == secondDate.getMonth() &&
    (firstDate.getDate() + 7) > (secondDate.getDate())
  )
}

/* Checks if two dates are equal */
export function matchDate(dateOne: Date, dateTwo: Date) {
  return (
    dateOne.getFullYear() == dateTwo.getFullYear() &&
    dateOne.getMonth() == dateTwo.getMonth() &&
    dateOne.getDate() == dateTwo.getDate()
  );
}

export type DaysAsNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Days = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export type MonthsAsNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type Months = "January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December";

/* Gets day of the week in name format */
export function getNameByDate(date: DaysAsNumbers): Days {
  switch (date) {
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

export function getNameByMonth(date: MonthsAsNumbers): Months {
  switch (date) {
    case 0:
      return "January";
    case 1:
      return "February";
    case 2:
      return "March";
    case 3:
      return "April"
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
  }
}