# 🔄 Como Reiniciar o Servidor

## ⚠️ Problema: Variável de Ambiente Não Carregada

O arquivo `.env.local` foi criado, mas o Vite precisa ser **reiniciado** para carregar as variáveis de ambiente.

## 📋 Passos para Resolver

### 1. Parar o Servidor Atual

No terminal onde o servidor está rodando:
- Pressione **`Ctrl + C`** para parar o servidor

### 2. Reiniciar o Servidor

Execute novamente:
```bash
npm run dev
```

### 3. Verificar

Após reiniciar, o app deve:
- ✅ Carregar sem erros
- ✅ Mostrar os botões de autenticação do Clerk
- ✅ Funcionar normalmente

## 🔍 Verificação Rápida

Se ainda der erro, verifique:

1. **Arquivo `.env.local` existe?**
   ```bash
   # Windows PowerShell
   Test-Path .env.local
   
   # Deve retornar: True
   ```

2. **Conteúdo do arquivo está correto?**
   ```bash
   # Windows PowerShell
   Get-Content .env.local
   
   # Deve mostrar:
   # VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29tcGxldGUtZ3JvdXBlci0zMy5jbGVyay5hY2NvdW50cy5kZXYk
   ```

3. **Arquivo está na raiz do projeto?**
   - O arquivo `.env.local` deve estar na mesma pasta que `package.json`

## 💡 Dica

Sempre que você criar ou modificar arquivos `.env.local` ou `.env`, é necessário **reiniciar o servidor** para que as mudanças sejam aplicadas.
