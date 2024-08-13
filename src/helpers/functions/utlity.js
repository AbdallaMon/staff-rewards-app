import dayjs from "dayjs";

export const isTodayOrYesterday = (date) => {
    const targetDate = dayjs(date);
    const today = dayjs();
    const oneWeekBefore = today.subtract(7, 'day');
    return (targetDate.isSame(today, 'day') ||
          (targetDate.isAfter(oneWeekBefore) && targetDate.isBefore(today.add(1, 'second'))));

};