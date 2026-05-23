import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { User } from "lucide-react";
import { ClerkWrapper } from "./ClerkWrapper";

// Verificar se Clerk está disponível através da variável de ambiente
const HAS_CLERK = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Componente de fallback quando Clerk não está disponível
function DevModeAuth() {
  return (
    <div className="flex items-center gap-2">
      <div className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm flex items-center gap-2">
        <User size={16} />
        <span>Modo Desenvolvimento</span>
      </div>
    </div>
  );
}

// Componente principal que decide qual renderizar
export default function Auth() {
  // Se não houver chave do Clerk, mostrar modo de desenvolvimento
  if (!HAS_CLERK) {
    return <DevModeAuth />;
  }

  // Se houver chave, usar ClerkWrapper para verificar se Clerk está disponível em runtime
  return (
    <ClerkWrapper
      fallback={<DevModeAuth />}
    >
      <div className="flex items-center gap-2">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Entrar
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
              Cadastrar
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </ClerkWrapper>
  );
}
