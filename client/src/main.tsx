import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

// Measure time to interactive (TTI)
const startTime = performance.now();

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Use requestIdleCallback to log after browser is idle post render
// Fallback to setTimeout if not available (e.g. some older browsers)
const onIdle =
  (window as any).requestIdleCallback ||
  function (cb: IdleRequestCallback) {
    return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 } as any), 0);
  };

onIdle(() => {
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  // eslint-disable-next-line no-console
  console.log(`[Perf] App hydrated in ${duration}ms`);
});
