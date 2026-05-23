import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./app/App.tsx";
import "./styles/index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Aviso no console se a chave não estiver configurada
if (!PUBLISHABLE_KEY) {
  console.warn(
    "⚠️ Clerk Publishable Key não encontrada!\n" +
    "Por favor:\n" +
    "1. Crie um arquivo .env.local na raiz do projeto\n" +
    "2. Adicione: VITE_CLERK_PUBLISHABLE_KEY=sua_chave_aqui\n" +
    "3. Reinicie o servidor (Ctrl+C e depois npm run dev)"
  );
  // Em desenvolvimento, permitir continuar sem Clerk
  // Em produção, você pode descomentar a linha abaixo para forçar erro:
  // throw new Error("Missing Clerk Publishable Key");
}

// Ensure your index.html contains a <div id="root"></div> element for React to mount the app.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
