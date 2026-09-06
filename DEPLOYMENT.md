# Colocar o ClaveStore PT online

Este guia usa uma separação simples e fácil de defender:

- GitHub: guardar o código online.
- Neon: base de dados PostgreSQL.
- Render: backend Express + Sequelize.
- Vercel: frontend React + Bootstrap + Axios.

O projeto local recomendado é:

```text
C:\Users\Paulo Monteiro\Desktop\ClaveStore_PT
```

## 1. Confirmar que o projeto está pronto

No terminal, entra na pasta do projeto:

```bash
cd "C:\Users\Paulo Monteiro\Desktop\ClaveStore_PT"
```

Instala e testa a build:

```bash
npm install
npm run build
```

Se a build terminar sem erros, o projeto está pronto para publicar.

## 2. Colocar o projeto no GitHub

1. Entra em https://github.com.
2. Clica em New repository.
3. Nome recomendado: `clavestore-pt`.
4. Deixa o repositório vazio, sem README, sem `.gitignore` e sem licença.
5. Cria o repositório.

Depois, no terminal:

```bash
cd "C:\Users\Paulo Monteiro\Desktop\ClaveStore_PT"
git status
git add .
git commit -m "Versao final para deploy"
git branch -M main
git remote add origin https://github.com/TEU-UTILIZADOR/clavestore-pt.git
git push -u origin main
```

Troca `TEU-UTILIZADOR` pelo teu nome de utilizador do GitHub.

Se o comando `git commit` disser que não há nada para guardar, segue para os comandos seguintes.

## 3. Criar a base de dados PostgreSQL no Neon

1. Entra em https://neon.com.
2. Cria conta ou faz login com GitHub.
3. Clica em New Project.
4. Nome recomendado: `clavestore-db`.
5. Cria a base de dados.
6. Clica em Connect.
7. Copia a connection string PostgreSQL.

Deve ser parecida com:

```text
postgresql://USER:PASSWORD@HOST/dbname?sslmode=require&channel_binding=require
```

Guarda esse valor para usar no Render como `DATABASE_URL`.

## 4. Publicar o backend no Render

1. Entra em https://render.com.
2. Clica em New > Web Service.
3. Liga a tua conta GitHub.
4. Escolhe o repositório `clavestore-pt`.
5. Usa estas opções:

```text
Name: clavestore-api
Root Directory: server
Runtime/Language: Node
Build Command: npm install
Start Command: npm start
```

6. Em Environment Variables, adiciona:

```bash
NODE_ENV=production
DATABASE_URL=<connection string do Neon>
CLIENT_URL=https://clavestore-pt.vercel.app
DEMO_FALLBACK=false
```

O `CLIENT_URL` pode ficar provisório nesta fase. Depois de criares o frontend na Vercel, voltas ao Render e colocas o URL real.

7. Clica em Create Web Service.
8. Quando terminar, o backend fica com um URL parecido com:

```text
https://clavestore-api.onrender.com
```

Testa no browser:

```text
https://clavestore-api.onrender.com/
https://clavestore-api.onrender.com/api/workspace
```

## 5. Popular a base de dados

No Render:

1. Abre o serviço `clavestore-api`.
2. Entra em Shell.
3. Executa:

```bash
npm run seed
```

Isto cria categorias, produtos, utilizadores de teste, encomendas e dados de dashboard.

Contas de teste:

```text
Cliente: cliente@clavestore.pt / cliente123
Admin:   admin@clavestore.pt / admin123
```

## 6. Publicar o frontend na Vercel

1. Entra em https://vercel.com.
2. Clica em Add New > Project.
3. Importa o repositório `clavestore-pt`.
4. Configura:

```text
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

5. Em Environment Variables, adiciona:

```bash
VITE_API_URL=https://clavestore-api.onrender.com/api
```

Troca o URL pelo URL real do teu backend no Render.

6. Clica em Deploy.

No fim, a Vercel vai gerar um URL parecido com:

```text
https://clavestore-pt.vercel.app
```

## 7. Corrigir o CORS no Render

Depois de teres o URL real da Vercel:

1. Volta ao Render.
2. Abre o serviço `clavestore-api`.
3. Vai a Environment.
4. Atualiza:

```bash
CLIENT_URL=https://URL-REAL-DA-VERCEL
```

Exemplo:

```bash
CLIENT_URL=https://clavestore-pt.vercel.app
```

5. Faz redeploy do backend.

## 8. Testes finais

Testa estes pontos no site da Vercel:

- Abrir catálogo.
- Pesquisar produtos.
- Ver detalhes de um produto.
- Registar cliente.
- Entrar com cliente.
- Adicionar produtos ao carrinho.
- Sair e voltar a entrar para confirmar que o carrinho continua guardado.
- Finalizar checkout.
- Entrar com admin.
- Ver backoffice.
- Criar ou editar produto.
- Alterar estado de encomenda.

## 9. URLs para entregar

Na entrega, deves guardar estes três links:

```text
GitHub:   https://github.com/TEU-UTILIZADOR/clavestore-pt
Frontend: https://URL-DA-VERCEL
Backend:  https://URL-DO-RENDER
```

## 10. Notas para defesa

- O frontend usa React, React Hooks, Bootstrap, Bootstrap Icons e Axios.
- O backend usa Express com arquitetura MVC.
- A base de dados online é PostgreSQL no Neon.
- A ligação à base de dados é feita com Sequelize.
- O carrinho fica associado ao utilizador autenticado.
- A área de backoffice só aparece para utilizadores admin.
- O ficheiro `client/src/api/musicApi.js` usa `VITE_API_URL` para chamar a API online.
- O ficheiro `server/src/app.js` usa `CLIENT_URL` para permitir o domínio da Vercel no CORS.