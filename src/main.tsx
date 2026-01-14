import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// React 18 root
createRoot(document.getElementById("root")!).render(<App />);
