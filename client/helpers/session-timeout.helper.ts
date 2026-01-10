const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_TIME_MS = 5 * 60 * 1000;

let inactivityTimer: NodeJS.Timeout | null = null;
let warningTimer: NodeJS.Timeout | null = null;
let onTimeoutCallback: (() => void) | null = null;
let onWarningCallback: (() => void) | null = null;

export function resetInactivityTimer() {
  clearInactivityTimer();

  inactivityTimer = setTimeout(() => {
    if (onTimeoutCallback) {
      onTimeoutCallback();
    }
  }, SESSION_TIMEOUT_MS);

  warningTimer = setTimeout(() => {
    if (onWarningCallback) {
      onWarningCallback();
    }
  }, SESSION_TIMEOUT_MS - WARNING_TIME_MS);
}

export function clearInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
}

export function initSessionTimeout(
  onTimeout: () => void,
  onWarning?: () => void,
) {
  onTimeoutCallback = onTimeout;
  onWarningCallback = onWarning || null;

  const events = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ];

  events.forEach((event) => {
    document.addEventListener(event, resetInactivityTimer, true);
  });

  resetInactivityTimer();
}

export function cleanupSessionTimeout() {
  clearInactivityTimer();
  onTimeoutCallback = null;
  onWarningCallback = null;

  const events = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ];

  events.forEach((event) => {
    document.removeEventListener(event, resetInactivityTimer, true);
  });
}
