//Форматирование даты
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

export function formatDateDay(isoString: string): string {
  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function getTimeDifference(date1: string, date2: string): string {
  const diffMs = new Date(date2).getTime() - new Date(date1).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(diffSeconds / 86400); 
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  let result = [];
  if (days > 0) result.push(`${days} ${getDayWord(days)}`);
  if (hours > 0) result.push(`${hours} ${getHourWord(hours)}`);
  if (minutes > 0) result.push(`${minutes} ${getMinuteWord(minutes)}`);
  if (seconds > 0 && result.length === 0) result.push(`${seconds} ${getSecondWord(seconds)}`);

  return result.join(", ");
}

//Дни/часы/минуты/секунды
function getDayWord(days: number): string {
  if (days % 10 === 1 && days % 100 !== 11) return "день";
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return "дня";
  return "дней";
}

function getHourWord(hours: number): string {
  if (hours % 10 === 1 && hours % 100 !== 11) return "час";
  if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) return "часа";
  return "часов";
}

function getMinuteWord(minutes: number): string {
  if (minutes % 10 === 1 && minutes % 100 !== 11) return "минута";
  if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) return "минуты";
  return "минут";
}

function getSecondWord(seconds: number): string {
  if (seconds % 10 === 1 && seconds % 100 !== 11) return "секунда";
  if ([2, 3, 4].includes(seconds % 10) && ![12, 13, 14].includes(seconds % 100)) return "секунды";
  return "секунд";
}