import { useEffect } from "react";

/**
 * Component used solely for verifying the global ErrorBoundary.
 * It throws an error immediately after mount.
 */
export default function TestError() {
  useEffect(() => {
    throw new Error("Intentional test error: verifying ErrorBoundary");
  }, []);

  return <div>🔥 This text should never be visible. 🔥</div>;
}