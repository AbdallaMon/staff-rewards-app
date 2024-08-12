import dayjs from "dayjs";

export const isTodayOrYesterday = (date) => {
    const targetDate = dayjs(date);
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');
    return targetDate.isSame(today, 'day') || targetDate.isSame(yesterday, 'day');
};