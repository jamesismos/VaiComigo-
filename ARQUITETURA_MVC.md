# 📐 Arquitetura MVC do VaiComigo

## 🎯 Visão Geral

O projeto **VaiComigo** utiliza uma arquitetura moderna baseada em **React + TypeScript**, que pode ser mapeada para o padrão **MVC (Model-View-Controller)** com algumas adaptações.

---

## 🏗️ Estrutura MVC Adaptada

### **MODEL (Modelo) - Dados e Lógica de Negócio**

Os **Models** são representados por:

#### 1. **Stores (Zustand) - Estado Global**
```
src/store/
├── locationStore.ts    # Model: Localização do usuário
├── driverStore.ts      # Model: Motoristas disponíveis
├── rideStore.ts        # Model: Estado das corridas
└── categoryStore.ts    # Model: Categorias de serviço
```

**Responsabilidades:**
- Gerenciar estado global da aplicação
- Persistir dados (localStorage)
- Lógica de negócio relacionada aos dados

**Exemplo:**
```typescript
// src/store/locationStore.ts
export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  destinationAddress: null,
  // ... métodos para atualizar estado
}));
```

#### 2. **Types (Tipos TypeScript)**
```
src/types/index.ts
```

**Responsabilidades:**
- Definir estruturas de dados
- Garantir type-safety
- Documentar interfaces

**Exemplo:**
```typescript
export interface Driver {
  id: number;
  name: string;
  rating: number;
  car: string;
  // ...
}
```

#### 3. **Config (Configurações)**
```
src/app/config/
├── pricing.ts    # Model: Regras de preço
└── payment.ts    # Model: Métodos de pagamento
```

**Responsabilidades:**
- Configurações de negócio
- Regras de cálculo
- Constantes do sistema

---

### **VIEW (Visualização) - Interface do Usuário**

As **Views** são representadas por:

#### 1. **Componentes de Página**
```
src/app/App.tsx          # View Principal (Container)
```

**Responsabilidades:**
- Orquestrar telas da aplicação
- Gerenciar navegação entre views
- Integrar componentes menores

#### 2. **Componentes Reutilizáveis**
```
src/app/components/
├── Map.tsx              # View: Mapa interativo
├── LocationInput.tsx     # View: Input de endereço
├── PaymentMethods.tsx   # View: Seleção de pagamento
├── DriverCard.tsx       # View: Card do motorista
├── RideStatusBadge.tsx  # View: Status da corrida
├── RouteDisplay.tsx     # View: Exibição de rota
└── Chat.tsx             # View: Sistema de chat
```

**Responsabilidades:**
- Renderizar UI
- Receber props e eventos
- Exibir dados do Model

#### 3. **Componentes UI (Design System)**
```
src/app/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
└── ... (40+ componentes)
```

**Responsabilidades:**
- Componentes base do design system
- Estilização consistente
- Acessibilidade

---

### **CONTROLLER (Controlador) - Lógica de Controle**

Os **Controllers** são representados por:

#### 1. **Utils (Utilitários de Negócio)**
```
src/app/utils/
├── calculations.ts    # Controller: Cálculos de preço
└── geocoding.ts      # Controller: Geocodificação
```

**Responsabilidades:**
- Processar dados
- Aplicar regras de negócio
- Transformar dados entre Model e View

**Exemplo:**
```typescript
// src/app/utils/calculations.ts
export const calculatePrice = (
  route: { distance: string; duration: number },
  categories: CategorySelection,
  stopsCount: number,
  origin: string,
  destination: string,
): number => {
  // Lógica de cálculo de preço
  const config = getPricingForCity(origin || destination);
  // ... cálculos
  return totalPrice;
};
```

#### 2. **Hooks Customizados**
```
src/app/hooks/
└── useGeolocation.ts   # Controller: Lógica de geolocalização
```

**Responsabilidades:**
- Encapsular lógica reutilizável
- Gerenciar efeitos colaterais
- Conectar View com Model

#### 3. **Handlers em Componentes**
```typescript
// Em App.tsx
const handleRequestRide = () => {
  // Controller: Processa solicitação de corrida
  if (origin && destination && routeInfo) {
    setRideStatus('searching');
    // ... lógica
  }
};
```

**Responsabilidades:**
- Processar eventos do usuário
- Atualizar Model (stores)
- Coordenar fluxo de dados

---

## 🔄 Fluxo de Dados MVC

```
┌─────────────────────────────────────────────────────────┐
│                    ARQUITETURA MVC                      │
└─────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│     VIEW     │─────▶│  CONTROLLER  │─────▶│    MODEL     │
│  (Componente)│      │   (Utils/    │      │   (Stores/   │
│              │◀─────│   Handlers)  │◀─────│    Types)    │
└──────────────┘      └──────────────┘      └──────────────┘
     │                       │                       │
     │                       │                       │
     └───────────────────────┴───────────────────────┘
                    Fluxo de Dados
```

### **Exemplo Prático: Solicitar Corrida**

1. **VIEW** (`App.tsx`):
   ```typescript
   <button onClick={handleRequestRide}>
     Solicitar Corrida
   </button>
   ```

2. **CONTROLLER** (`handleRequestRide`):
   ```typescript
   const handleRequestRide = () => {
     // Valida dados
     if (!origin || !destination) return;
     
     // Calcula preço (Controller)
     const price = calculatePrice(route, categories, stops.length, origin, destination);
     
     // Atualiza Model (Store)
     rideStore.setRideStatus('searching');
     rideStore.setTotalPrice(price);
   };
   ```

3. **MODEL** (`rideStore.ts`):
   ```typescript
   // Store atualiza estado global
   set({ rideStatus: 'searching', totalPrice: price });
   ```

4. **VIEW** (Re-renderiza):
   ```typescript
   // Componente lê do Store e atualiza UI
   const rideStatus = useRideStore(state => state.rideStatus);
   <RideStatusBadge status={rideStatus} />
   ```

---

## 📁 Estrutura de Diretórios (MVC)

```
src/
├── 📦 MODEL (Dados)
│   ├── store/              # Stores Zustand (Estado Global)
│   │   ├── locationStore.ts
│   │   ├── driverStore.ts
│   │   ├── rideStore.ts
│   │   └── categoryStore.ts
│   ├── types/              # Tipos TypeScript
│   │   └── index.ts
│   └── app/config/         # Configurações
│       ├── pricing.ts
│       └── payment.ts
│
├── 🎨 VIEW (Interface)
│   ├── app/
│   │   ├── App.tsx         # View Principal
│   │   └── components/     # Componentes de View
│   │       ├── Map.tsx
│   │       ├── LocationInput.tsx
│   │       ├── PaymentMethods.tsx
│   │       └── ui/         # Design System
│   └── components/
│       └── Auth.tsx
│
└── 🎮 CONTROLLER (Lógica)
    ├── app/utils/          # Utilitários de Negócio
    │   ├── calculations.ts
    │   └── geocoding.ts
    └── app/hooks/          # Hooks Customizados
        └── useGeolocation.ts
```

---

## 🔍 Mapeamento Detalhado MVC

### **MODEL - Onde ficam os dados?**

| Conceito MVC | Implementação VaiComigo | Localização |
|--------------|-------------------------|-------------|
| **Entidades** | Interfaces TypeScript | `src/types/index.ts` |
| **Estado Global** | Stores Zustand | `src/store/*.ts` |
| **Configurações** | Config files | `src/app/config/*.ts` |
| **Persistência** | localStorage | Dentro dos Stores |

### **VIEW - Onde fica a interface?**

| Conceito MVC | Implementação VaiComigo | Localização |
|--------------|-------------------------|-------------|
| **Páginas** | App.tsx (screens) | `src/app/App.tsx` |
| **Componentes** | React Components | `src/app/components/*.tsx` |
| **UI Base** | Design System | `src/app/components/ui/*.tsx` |
| **Estilos** | CSS/Tailwind | `src/styles/*.css` |

### **CONTROLLER - Onde fica a lógica?**

| Conceito MVC | Implementação VaiComigo | Localização |
|--------------|-------------------------|-------------|
| **Lógica de Negócio** | Utils | `src/app/utils/*.ts` |
| **Event Handlers** | Handlers em componentes | `src/app/App.tsx` |
| **Hooks** | Custom Hooks | `src/app/hooks/*.ts` |
| **Validações** | Funções em utils | `src/app/utils/calculations.ts` |

---

## 🎯 Padrões de Arquitetura Utilizados

### 1. **Container/Presentational Pattern**
- **Container**: `App.tsx` (gerencia estado, lógica)
- **Presentational**: Componentes em `components/` (apenas renderização)

### 2. **State Management Pattern**
- **Global State**: Zustand Stores
- **Local State**: useState (para UI temporária)

### 3. **Separation of Concerns**
- **Dados**: Stores + Types
- **Lógica**: Utils + Hooks
- **UI**: Components

### 4. **Dependency Injection**
- Stores injetados via hooks
- Props passadas para componentes

---

## 📊 Diagrama de Camadas

```
┌─────────────────────────────────────────────────┐
│           CAMADA DE APRESENTAÇÃO                │
│  (View) - Componentes React + UI                │
│  - App.tsx                                       │
│  - Components/                                   │
│  - UI Components                                 │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│          CAMADA DE CONTROLE                     │
│  (Controller) - Lógica de Negócio               │
│  - Utils (calculations, geocoding)              │
│  - Hooks (useGeolocation)                        │
│  - Event Handlers                                │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│           CAMADA DE DADOS                       │
│  (Model) - Estado e Configurações               │
│  - Stores (Zustand)                             │
│  - Types (TypeScript)                            │
│  - Config (pricing, payment)                    │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│        CAMADA DE SERVIÇOS (Futuro)                │
│  - API REST                                       │
│  - WebSocket                                      │
│  - Autenticação (Clerk)                           │
│  - Pagamentos (Mercado Pago, PIX, etc)           │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Completo: Solicitar Corrida

```
1. USER ACTION (View)
   └─▶ Usuário clica "Solicitar Corrida"
       │
2. EVENT HANDLER (Controller)
   └─▶ handleRequestRide() é chamado
       │
3. VALIDATION (Controller)
   └─▶ Valida origem, destino, categoria
       │
4. BUSINESS LOGIC (Controller)
   └─▶ calculatePrice() calcula preço
       └─▶ getPricingForCity() obtém configuração
       │
5. UPDATE MODEL (Model)
   └─▶ rideStore.setRideStatus('searching')
       └─▶ rideStore.setTotalPrice(price)
       │
6. STATE CHANGE (Model)
   └─▶ Store notifica componentes
       │
7. RE-RENDER (View)
   └─▶ Componentes leem do Store
       └─▶ UI atualiza automaticamente
```

---

## 🎓 Princípios Aplicados

### **SOLID Principles**

1. **Single Responsibility**
   - Cada store tem uma responsabilidade
   - Componentes fazem uma coisa
   - Utils têm funções específicas

2. **Open/Closed**
   - Componentes extensíveis via props
   - Stores podem ser estendidos

3. **Dependency Inversion**
   - Componentes dependem de abstrações (stores)
   - Não dependem de implementações concretas

### **Clean Architecture**

- **Independência de Framework**: React é detalhe
- **Testabilidade**: Lógica separada de UI
- **Independência de UI**: Stores não conhecem componentes
- **Independência de Banco**: Preparado para API

---

## 🚀 Próximos Passos (Arquitetura)

### **Backend Integration (Futuro)**

```
Frontend (MVC)          Backend (MVC)
     │                       │
     │  HTTP REST API        │
     │──────────────────────▶│
     │                       │
     │  WebSocket            │
     │◀──────────────────────│
```

**Backend seguirá MVC tradicional:**
- **Model**: PostgreSQL + Prisma/TypeORM
- **View**: JSON Responses
- **Controller**: Express Routes

---

## 📝 Resumo

| Camada MVC | Tecnologia | Localização |
|------------|------------|-------------|
| **Model** | Zustand + TypeScript | `src/store/`, `src/types/` |
| **View** | React Components | `src/app/components/` |
| **Controller** | Utils + Hooks | `src/app/utils/`, `src/app/hooks/` |

**Arquitetura**: Híbrida (MVC adaptado para React)
**Padrão**: Container/Presentational + State Management
**Estado**: Global (Zustand) + Local (useState)

---

**Última atualização**: Janeiro 2026
**Versão**: 1.0.0
