# ClaveStore PT

Loja online portuguesa para instrumentos, áudio, estúdio, DJ/palco e artigos ligados à música. O projeto foi preparado para avaliação académica e portefólio, com área de cliente, login/registo, carrinho guardado, checkout simulado e backoffice separado para gestão de produtos, stock e encomendas.

Projeto online atual: https://clavestore-pt-paulo.kadkad.chatgpt.site/

Guia para publicar em GitHub + Neon + Render + Vercel: `DEPLOYMENT.md`

## Funcionalidades

- Catálogo com pesquisa, filtros por categoria, ordenação e ficha detalhada de produto.
- Galeria de fotografias, especificações, ratings e comentários por produto.
- Login e registo para cliente e admin.
- Carrinho guardado por cliente, com recuperação em sessões seguintes.
- Checkout disponível apenas para cliente autenticado.
- Backoffice protegido por conta admin.
- Criação de encomendas e alteração de estados: pendente, pago, preparação, enviado, entregue e cancelado.
- Backoffice separado para criar produtos, ajustar preço/stock e acompanhar alertas.
- Dashboard com receita, unidades vendidas, valor em stock, ticket médio e produtos com baixo stock.
- Dados de exemplo para demonstração quando a base de dados ainda não está configurada.

## Contas de teste

```text
Cliente: cliente@clavestore.pt / cliente123
Admin:   admin@clavestore.pt / admin123
```

## Requisitos cumpridos

- Arquitetura MVC no backend: `models`, `controllers`, `services` e `routes`.
- UI com Bootstrap e Bootstrap Icons.
- Base de dados PostgreSQL com Sequelize.
- Framework web Express para Node.js.
- Axios no frontend e no backend para chamadas HTTP da aplicação.
- React com Hooks: `useState`, `useEffect` e `useMemo`.
- Projeto publicado online.

## Estrutura necessária

```text
client/                  Frontend React, Bootstrap, Axios e Hooks
server/src/app.js        Configuração Express
server/src/config/       Configuração PostgreSQL/Sequelize
server/src/models/       Models Sequelize
server/src/controllers/  Controllers MVC
server/src/services/     Regras de negócio, estatísticas e dados de exemplo
server/src/routes/       Rotas REST da API
server/src/seeders/      Seed da base de dados
scripts/build-sites.mjs  Build para publicação online
.openai/hosting.json     Configuração do site publicado
```

## Comandos

```bash
npm install
npm run dev:client
npm run dev:server
npm run seed
npm run build
```

## Variáveis de ambiente

Configurar no servidor local, Render/Neon ou plataforma equivalente:

```bash
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
CLIENT_URL=https://o-teu-front-end.pt
DEMO_FALLBACK=true
```

Sem `DATABASE_URL`, ou se a base de dados falhar em ambiente local, a API usa dados de exemplo para permitir testar a loja completa.

Nota: o código da aplicação usa Axios para HTTP. O `fetch` existente no ficheiro de build do Sites é apenas o handler técnico do runtime de publicação para servir assets/API online.