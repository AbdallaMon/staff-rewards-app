import dayjs from "dayjs";

export const isTodayOrYesterday = (date) => {
  return true;
  // const targetDate = dayjs(date);
  // const today = dayjs();
  // const oneWeekBefore = today.subtract(30, 'day');
  // const july30 = dayjs('2024-07-30'); // Adjust the year if needed
  // return (targetDate.isSame(today, 'day') ||
  //       (targetDate.isAfter(oneWeekBefore) && targetDate.isBefore(today.add(1, 'second'))) ||
  //       targetDate.isSame(july30, 'day')
  // );
};
