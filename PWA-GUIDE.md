# VaiComigo - Guia PWA (Progressive Web App)

## 🚗 Sobre o VaiComigo

VaiComigo é um aplicativo de mobilidade inteligente com múltiplas categorias:
- **VaiComigo!** - Transporte de passageiros (1-4 pessoas)
- **VaiPet** - Transporte com animais de estimação
- **VaiEntrega** - Entregas até 20kg
- **VaiMercado** - Compras em supermercados

## 📱 Como usar como PWA

### No Android (Chrome/Edge):
1. Abra o app no navegador
2. Toque no menu (⋮) 
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação
5. O ícone aparecerá na sua tela inicial como um app nativo!

### No iOS (Safari):
1. Abra o app no Safari
2. Toque no botão "Compartilhar" (□↑)
3. Role e toque em "Adicionar à Tela de Início"
4. Dê um nome e confirme
5. Use como um app normal!

### No Desktop (Chrome/Edge):
1. Abra o app no navegador
2. Clique no ícone de instalação (+) na barra de endereço
3. Clique em "Instalar"
4. O app abrirá em sua própria janela!

## 🎨 Funcionalidades Implementadas

### ✅ Sistema de Categorias Combinadas
- Escolha entre 4 tipos de serviço
- Combine passageiros + pet
- Ajuste número de passageiros (1-4)

### ✅ Sistema de Paradas
- Adicione até 3 paradas intermediárias
- Cada parada adiciona R$ 3,00
- Remova paradas facilmente

### ✅ Sistema de Cupons
- PRIMEIRA - 10% OFF primeira corrida
- VAIPET20 - 20% OFF em corridas com pet
- MERCADO15 - 15% OFF no VaiMercado
- FIXO5 - R$ 5 OFF em corridas acima de R$ 20

### ✅ Cálculo Transparente de Preços
- Preço base por categoria
- Custo por km e minuto
- Taxa de pet: R$ 8,00
- Taxa de parada: R$ 3,00 cada
- Preço fixo que não muda durante a corrida

### ✅ Fluxo Completo de Corrida
1. Seleção de categoria e passageiros
2. Definição de origem/destino/paradas
3. Visualização de preço estimado
4. Busca de motorista
5. Acompanhamento em tempo real
6. Avaliação do motorista

### ✅ Histórico de Corridas
- Veja todas as suas corridas anteriores
- Detalhes completos (origem, destino, preço)
- Tags de categoria
- Avaliações dadas

### ✅ Design System
- Cores: #0B0B0B (fundo), #0F5F4A (primária), #ECECEC (texto)
- Design escuro moderno
- Alto contraste (AA acessibilidade)
- Responsivo mobile-first

## 🔧 Para Desenvolvedores

### Estrutura do Projeto
```
/src
  /app
    App.tsx                 # Componente principal com toda lógica
    /components
      LocationInput.tsx     # Input de localização
      MapPlaceholder.tsx    # Placeholder do mapa
  /styles
    theme.css              # Design system
/public
  manifest.json            # Configuração PWA
  icon.svg                 # Ícone do app
```

### Próximos Passos para Produção

1. **Integração de Mapas Reais**
   - Integrar Mapbox ou Google Maps
   - Geocodificação de endereços
   - Cálculo real de rotas

2. **Backend com Supabase**
   - Autenticação de usuários
   - Banco de dados de corridas
   - Sistema de pagamentos
   - WebSocket para tracking em tempo real

3. **Funcionalidades Adicionais**
   - Chat motorista-passageiro
   - Compartilhamento de corrida
   - Corridas agendadas
   - Programa de fidelidade

4. **Otimizações PWA**
   - Service Worker para cache offline
   - Notificações push
   - Sincronização em background
   - Ícones otimizados (192x192 e 512x512)

### Configuração de Preços

Edite as constantes em `App.tsx`:

```typescript
const PRICING_CONFIG = {
  basePrice: 5.00,
  pricePerKm: 2.50,
  pricePerMin: 0.50,
  stopPointFee: 3.00,
  passengerBase: 12.00,
  passengerAdditional: 5.00,
  petFee: 8.00,
  deliveryBase: 15.00,
  marketBase: 20.00,
};
```

## 📊 Estimativa de Preços

### VaiComigo! (Passageiros)
- Base: R$ 12,00
- +R$ 5,00 por passageiro adicional
- +R$ 2,50 por km
- +R$ 0,50 por minuto

### VaiPet
- Mesmo que VaiComigo!
- +R$ 8,00 taxa de pet

### VaiEntrega
- Base: R$ 15,00
- +R$ 2,50 por km
- +R$ 0,50 por minuto

### VaiMercado
- Base: R$ 20,00
- +R$ 2,50 por km
- +R$ 0,50 por minuto

**Todas as categorias**: +R$ 3,00 por parada adicional

## 🎯 Características Técnicas

- ⚡ React 18 + TypeScript
- 🎨 Tailwind CSS v4
- 📱 100% Responsivo
- ♿ Acessível (WCAG AA)
- 🔒 Preparado para PWA
- 🌙 Dark Mode nativo
- 📦 Componentizado e escalável

## 📝 Licença

© 2026 VaiComigo - Mobilidade Inteligente
