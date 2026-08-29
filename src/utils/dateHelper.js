export function getDayNumFromDate(targetDateStr, startDateStr) {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  const diffTime = target - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(189, diffDays));
}

export function getDateFromDayNum(dayNum, startDateStr) {
  const start = new Date(startDateStr);
  start.setDate(start.getDate() + (dayNum - 1));
  return start;
}

export function formatDateReadable(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
