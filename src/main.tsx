
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Initializing application");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("No root element found!");
} else {
  console.log("Root element found, rendering App");
  createRoot(rootElement).render(<App />);
}
