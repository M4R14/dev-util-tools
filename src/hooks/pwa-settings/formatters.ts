export const formatPwaBytes = (bytes: number | null) => {
  if (bytes === null) return 'Unavailable';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const formatPwaLastUpdated = (timestamp: number | null) =>
  timestamp ? new Date(timestamp).toLocaleString() : 'Not recorded';
