# 🔧 Configuração do VaiComigo

## Clerk Authentication Setup

Siga o [React Quickstart oficial do Clerk](https://clerk.com/docs/quickstarts/react) para configurar a autenticação.

### 1. Instalar Clerk React SDK

O pacote já está instalado, mas para atualizar:

```bash
npm install @clerk/clerk-react@latest
```

### 2. Obter Publishable Key

1. Acesse o [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
2. Selecione **React** na lista de aplicativos
3. Copie sua **Publishable Key** (começa com `pk_test_...` ou `pk_live_...`)

### 3. Configurar Variável de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (preferido para desenvolvimento) ou `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

**Importante:**
- Use `.env.local` para desenvolvimento local (já está no `.gitignore`)
- O prefixo `VITE_` é **obrigatório** para Vite expor variáveis ao cliente
- **NUNCA** commite chaves reais no Git
- Use apenas placeholders em arquivos de exemplo

### 4. Estrutura do Código

O `ClerkProvider` já está configurado corretamente em `src/main.tsx`:

```typescript
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

<ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
  <App />
</ClerkProvider>
```

### 5. Componentes Clerk Disponíveis

O componente `Auth.tsx` usa os componentes oficiais do Clerk:

- `<SignedIn>` - Renderiza conteúdo quando usuário está autenticado
- `<SignedOut>` - Renderiza conteúdo quando usuário não está autenticado
- `<SignInButton>` - Botão de login
- `<SignUpButton>` - Botão de cadastro
- `<UserButton>` - Botão com menu do usuário

## Google Maps API (Opcional)

Para usar Google Places Autocomplete:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a API "Maps JavaScript API" e "Places API"
4. Crie uma chave de API
5. Adicione no `.env.local`:

```env
VITE_GOOGLE_MAPS_KEY=your_google_maps_key_here
```

## ⚠️ Segurança

- **NUNCA** commite arquivos `.env.local` ou `.env` com chaves reais
- Use `.env.example` apenas com placeholders
- Para produção, configure variáveis de ambiente no serviço de hospedagem
- Chaves de produção devem começar com `pk_live_...`

## 📚 Documentação

- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [Clerk React Components](https://clerk.com/docs/components/overview)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
