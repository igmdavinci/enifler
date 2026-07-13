# Enifler

Projeto da loja Enifler com catálogo, carrinho, login, cadastro, checkout PIX, painel de administrador e banco via Supabase.

## Como rodar localmente

1. Instale Node.js 18+ e Python 3.
2. Copie `.env.example` para `.env` e preencha as credenciais.
3. Na raiz do projeto, rode:

```bash
npm start
```

Se o PowerShell bloquear `npm.ps1`, use:

```bash
npm.cmd start
```

A loja abre em:

```text
http://127.0.0.1:4173/pc-gamer.html
```

Depois de configurar o Supabase, dá para popular produtos e admin com:

```bash
npm run db:init
```

E validar os arquivos principais com:

```bash
npm run check
```

## Checkout PIX

No segundo passo do checkout, o resumo do pedido agora aparece no topo do formulário de pagamento, no lugar onde antes ficava o título “Pagamento via PIX”.

## Banco real

1. Crie um projeto no Supabase.
2. Abra `supabase-schema.sql`.
3. Cole o conteúdo no SQL Editor do Supabase e execute.
4. Copie `.env.example` para `.env`.
5. Preencha:

```text
ENIFLER_DB_DRIVER=supabase
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY_AQUI
```

A `SERVICE_ROLE_KEY` fica somente no backend. Nunca coloque essa chave no HTML ou no JavaScript público.

## Admin

Painel local:

```text
http://127.0.0.1:4173/admin
```

Login padrão criado pelo seed:

```text
admin@enifler.local
Enifler@2026
```

Troque a senha no painel ou diretamente no banco antes de vender em produção.

## Deploy na Vercel pelo Git

Este projeto já inclui:

- `vercel.json` apontando a saída estática para `enifler/www.enifler.com.br`.
- `api/index.py` como função Python serverless para as rotas `/api/*`.
- `.python-version` com Python 3.12.
- `.vercelignore` para não enviar `.env`, banco local, cache e `node_modules`.

Na Vercel, configure o projeto com Framework Preset **Other** e use a raiz do repositório como Root Directory.

### Variáveis obrigatórias na Vercel

```text
ENIFLER_DB_DRIVER=supabase
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY_AQUI
SIGILOPAY_PUBLIC_KEY=SUA_CHAVE_PUBLICA_AQUI
SIGILOPAY_SECRET_KEY=SUA_CHAVE_PRIVADA_AQUI
SIGILOPAY_BASE_URL=https://app.sigilopay.com.br/api/v1
PUBLIC_BASE_URL=https://www.seudominio.com.br
SIGILOPAY_WEBHOOK_TOKEN=CRIE_UM_TOKEN_ALEATORIO_E_SECRETO
NTFY_SERVER=https://ntfy.sh
NTFY_TOPIC=enifler-alertas-troque-por-um-nome-secreto
NTFY_ACCESS_TOKEN=
ENIFLER_COOKIE_SECRET=UMA_CHAVE_LONGA_ALEATORIA
```

### Variáveis opcionais

```text
SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
ENIFLER_PORT=4173
```

`ENIFLER_PORT` só é usado localmente. Na Vercel, a plataforma controla a porta automaticamente.

## Importante sobre SQLite/local

SQLite local funciona para desenvolvimento, mas não é indicado para produção na Vercel porque funções serverless não têm disco persistente. Para login, cadastro, pedidos, produtos e admin funcionarem em produção, use Supabase com `ENIFLER_DB_DRIVER=supabase`.

O arquivo `data/old-products.json` é mantido no Git como seed de produtos. O banco `data/enifler.db` continua ignorado e deve ficar apenas local.
