import "./index.css";
import { Toaster } from "sonner";
import AllRoute from "./AllRoute.tsx";
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./ContextApi.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <AllRoute />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  </AuthProvider>
);
