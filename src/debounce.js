// Avoid fast-repeating calls
export default (fn, timeout = 125) => {
  let lastCall = null;
  let handle = null;
  return () => {
    const now = Date.now();
    const dur = now - lastCall;
    lastCall = now;
    if (!lastCall || !timeout || dur > timeout) {
      handle = setTimeout(() => {
        handle = null;
        lastCall = null;
        fn();
      }, timeout);
    }
  };
}
