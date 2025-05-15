/**
 * Format a date to a readable string
 * @param date - Date object or ISO string
 * @param options - DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', options);
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param date - Date object or ISO string
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return now > dateObj ? 'Вчера' : 'Завтра';
  } else if (diffDays < 7) {
    return now > dateObj ? `${diffDays} дн. назад` : `Через ${diffDays} дн.`;
  } else {
    return formatDate(dateObj);
  }
};
