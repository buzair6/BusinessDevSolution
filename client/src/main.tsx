import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// The root render function no longer uses the ErrorBoundary component,
// as it was removed to simplify the application.
root.render(
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <App />
  </QueryClientProvider>
);