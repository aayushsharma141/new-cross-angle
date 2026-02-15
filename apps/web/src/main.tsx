import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
    const rootEl = document.getElementById("root");
    if (!rootEl) throw new Error("Root element not found");
    createRoot(rootEl).render(<App />);
} catch (e) {
    console.error("App Crash:", e);
}
