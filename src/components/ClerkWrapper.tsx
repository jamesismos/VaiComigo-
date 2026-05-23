import { ReactNode, Component, ErrorInfo } from "react";

interface ClerkWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ClerkWrapperState {
  hasError: boolean;
}

/**
 * Error Boundary que captura erros do Clerk quando não está dentro do ClerkProvider
 * Se houver erro, renderiza o fallback
 */
export class ClerkWrapper extends Component<ClerkWrapperProps, ClerkWrapperState> {
  constructor(props: ClerkWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ClerkWrapperState {
    // Se o erro for relacionado ao Clerk não estar disponível
    if (error.message.includes("ClerkProvider") || error.message.includes("@clerk/clerk-react")) {
      return { hasError: true };
    }
    // Para outros erros, deixar propagar
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro se necessário
    if (error.message.includes("ClerkProvider")) {
      console.warn("Clerk não está disponível, usando modo de desenvolvimento");
    }
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }

    return <>{this.props.children}</>;
  }
}
