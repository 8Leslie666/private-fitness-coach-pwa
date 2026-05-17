export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const formatClock = (ms: number) => {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const formatDuration = (ms: number) => {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getTimeLabel = (date = new Date()) =>
  date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

export const sessionElapsedMs = (
  startedAt: number,
  pausedAccumulatedMs: number,
  pausedAt?: number,
  now = Date.now(),
) => {
  const activePause = pausedAt ? now - pausedAt : 0;
  return Math.max(0, now - startedAt - pausedAccumulatedMs - activePause);
};

export const remainingMs = (startedAt: number, durationSeconds: number, now = Date.now()) =>
  Math.max(0, durationSeconds * 1000 - (now - startedAt));

