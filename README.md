# VaiComigo!

Aplicativo local de mobilidade para operacao inicial em Padre Paraiso - MG.

Este projeto deve ser tratado como software operacional, nao como prototipo visual. Regras criticas de preco, rota, cidade ativa, carteira, aceite de corrida, status e taxa da plataforma devem ser validadas no backend, banco ou Edge Functions.

## Escopo Inicial

- Transporte de passageiros
- VaiPet
- VaiEntrega
- VaiMercado
- Modalidade sugerida para fase futura: VaiApoio, para transporte acompanhado de idosos ou pessoas vulneraveis, com contato de seguranca obrigatorio e motorista aprovado em treinamento especifico.

## Regras Criticas

- A operacao inicial fica limitada a Padre Paraiso - MG.
- Toda corrida precisa de `city_id`.
- Origem, destino e ate 3 paradas precisam ter lat/lng validos.
- Rota, distancia e duracao precisam vir do Mapbox Directions.
- Preco fixo deve ser calculado sobre rota real.
- Passageiro paga dinheiro ou Pix direto ao motorista.
- A plataforma desconta a taxa dos creditos virtuais do motorista apos corrida concluida.
- Transacoes financeiras sao imutaveis.

## Configuracao

Crie `.env.local` com base em `.env.example`:

```bash
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MAPBOX_TOKEN=
```

`VITE_MAPBOX_TOKEN` e obrigatorio para autocomplete, geocodificacao, mapa e rota real.

## Banco

O arquivo `database_schema.sql` contem a base Supabase para:

- `cities`
- `users`, `passengers`, `drivers`
- `rides`, `ride_events`
- `wallet_transactions`, `driver_recharges`, `financial_audit_logs`
- `security_logs`, `fraud_flags`
- `reports`
- RLS nas tabelas
- funcao `apply_ride_platform_fee`
- trigger para impedir edicao/exclusao de transacoes financeiras

## Desenvolvimento

```bash
npm install
npm run dev
npm run build
```

## Pendencias Antes de Operacao Real

- Criar Edge Functions para `quote-ride`, `request-ride`, `accept-ride`, `complete-ride`, `cancel-ride`, `confirm-driver-recharge`.
- Mover calculo definitivo de preco/taxa para Edge Function com service role.
- Implementar rate limit por usuario/IP.
- Integrar Supabase Auth/Clerk de forma consistente com `auth.uid()`.
- Revisar vulnerabilidades do `npm audit`.
- Testar rotas reais em campo em Padre Paraiso.
