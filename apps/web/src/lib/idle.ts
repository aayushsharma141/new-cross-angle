type IdleCallback = () => void;


export const runWhenIdle = (
  callback: IdleCallback,
  timeout = 1500,
): (() => void) => {
  if (typeof window === "undefined") {
    callback();
    return () => undefined;
  }

  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(() => callback(), { timeout });
    return () => window.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, Math.min(timeout, 1200));
  return () => window.clearTimeout(handle);
};
