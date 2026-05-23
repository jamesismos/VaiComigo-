import { Home, Receipt, User } from "lucide-react";

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const isActive = (screen: string) => currentScreen === screen;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4 pb-8 z-50">
      <div className="flex justify-around items-center pt-2 max-w-md mx-auto">
        <button
          onClick={() => onNavigate("home")}
          className="flex flex-col items-center gap-1 transition-colors"
        >
          <Home
            size={24}
            className={isActive("home") ? "text-primary fill-primary" : "text-muted-foreground"}
          />
          <span
            className={`text-[10px] ${
              isActive("home") ? "font-bold text-primary" : "font-medium text-muted-foreground"
            }`}
          >
            Início
          </span>
        </button>
        <button
          onClick={() => onNavigate("history")}
          className="flex flex-col items-center gap-1 transition-colors"
        >
          <Receipt
            size={24}
            className={
              isActive("history") ? "text-primary fill-primary" : "text-muted-foreground"
            }
          />
          <span
            className={`text-[10px] ${
              isActive("history")
                ? "font-bold text-primary"
                : "font-medium text-muted-foreground"
            }`}
          >
            Atividade
          </span>
        </button>
        <button
          onClick={() => onNavigate("profile")}
          className="flex flex-col items-center gap-1 transition-colors"
        >
          <User
            size={24}
            className={
              isActive("profile") ? "text-primary fill-primary" : "text-muted-foreground"
            }
          />
          <span
            className={`text-[10px] ${
              isActive("profile")
                ? "font-bold text-primary"
                : "font-medium text-muted-foreground"
            }`}
          >
            Perfil
          </span>
        </button>
      </div>
    </div>
  );
}
