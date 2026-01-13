# Frontend - Sistema de Gerenciamento de Estoque

Interface web desenvolvida em React, TypeScript e Vite para gerenciamento de estoque do Abrigo Helena Dornfeld.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18+ recomendada)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)
- Backend rodando (veja README do backend)

## 🚀 Instalação e Configuração

### 1. Instalar Dependências

```bash
cd frontend
npm install
# ou
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `frontend` (opcional, se não usar Docker):

```env
# URL da API Backend
VITE_API_BASE_URL=http://localhost:3001/api/v1

# URL do Logo (opcional)
VITE_LOGO_URL=http://localhost:8081/logo.png
```

> ⚠️ **Importante**: As variáveis de ambiente no Vite devem começar com `VITE_` para serem expostas ao código do frontend.

## 🏃 Como Executar

### Modo Desenvolvimento

```bash
npm run dev
```

O frontend será iniciado em modo desenvolvimento com hot-reload em `http://localhost:5173`.

### Modo Produção

```bash
npm run build
```

### Usando Docker

```bash
docker compose up -d frontend
```

O frontend estará disponível em `http://localhost:8081`.

## 📁 Estrutura do Projeto

```
frontend/
├── client/
│   ├── api/                     # Cliente API e requests
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes de UI (shadcn/ui)
│   │   └── ...                  # Outros componentes
│   ├── context/                 # Context API
│   ├── hooks/                   # Custom hooks
│   ├── interfaces/              # Interfaces TypeScript
│   ├── pages/                   # Páginas da aplicação
│   ├── schemas/                 # Schemas de validação (Zod)
│   ├── utils/                   # Utilitários
│   └── App.tsx                  # Componente principal
├── public/                      # Arquivos estáticos
├── index.html                   # HTML principal
├── vite.config.ts               # Configuração do Vite
├── tailwind.config.ts           # Configuração do Tailwind
├── tsconfig.json                # Configuração TypeScript
└── package.json
```

## 🧪 Testes

```bash
npm test
ou
npm run test:watch
```

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm test` | Executa testes |
| `npm run format.fix` | Formata código com Prettier |
| `npm run typecheck` | Verifica tipos TypeScript |

## 🎨 Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Material-UI (MUI)** - Componentes de UI
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado e cache
- **Zod** - Validação de schemas
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de UI adicionais

## 📱 Páginas Principais

- `/dashboard` - Dashboard principal
- `/medicines` - Gerenciamento de medicamentos
- `/inputs` - Gerenciamento de insumos
- `/stock` - Controle de estoque
- `/movements` - Histórico de movimentações
- `/reports` - Geração de relatórios
- `/residents` - Gerenciamento de residentes
- `/notifications` - Notificações
- `/user/login` - Página de login

## 🔐 Autenticação

O frontend gerencia autenticação através de Context API:

1. Login em `/user/login`
2. Token JWT é armazenado no localStorage
3. Token é enviado em todas as requisições
4. Sessão inválida redireciona para login

## 🎯 Funcionalidades Principais

### Estoque

- Visualização de estoque de medicamentos e insumos
- Entrada e saída de produtos
- Filtros por tipo, setor, status
- Alertas de produtos próximos do vencimento
- Alertas de estoque abaixo do mínimo

### Movimentações

- Histórico completo de movimentações
- Filtros por data, tipo, produto
- Ranking de medicamentos mais/menos movimentados

### Relatórios

- Relatórios de medicamentos e insumos
- Relatórios por residente
- Relatórios de consumo mensal
- Exportação em PDF

### Notificações

- Sistema de notificações
- Agendamento de notificações
- Diferentes destinos (SUS, Família, Farmácia)

## 🎨 Desenvolvimento

### Adicionar Nova Página

1. Crie o componente em `client/pages/`
2. Adicione a rota em `client/App.tsx`
3. Adicione validação se necessário em `client/schemas/`

### Adicionar Novo Componente

1. Crie o componente em `client/components/`
2. Use TypeScript para tipagem
3. Siga os padrões do projeto

### Estilização

- Use Material-UI para componentes principais
- Use Tailwind CSS para estilização customizada
- Siga o design system estabelecido

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/spa/`.

### Deploy com Docker

O Dockerfile está configurado para usar Nginx como servidor web estático.

```bash
docker build -t abrigo-frontend .
docker run -p 8081:80 abrigo-frontend
```

## ⚠️ Troubleshooting

### Erro de Conexão com Backend

- Verifique se o backend está rodando
- Confirme a URL da API no `.env` ou `vite.config.ts`
- Verifique CORS no backend

### Erro de Build

- Limpe a pasta `node_modules` e reinstale: `rm -rf node_modules && npm install`
- Verifique erros de TypeScript: `npm run typecheck`
- Limpe o cache do Vite: `rm -rf node_modules/.vite`

### Problemas de Hot Reload

- Reinicie o servidor de desenvolvimento
- Limpe o cache do navegador
- Verifique se há erros no console

### Porta já em uso

- O Vite usa a porta 5173 por padrão
- Altere a porta no `vite.config.ts` se necessário

## 🔄 Integração com Backend

O frontend se comunica com o backend através da API REST:

- Todas as requisições são feitas para `/api/v1`
- Autenticação via JWT no header `Authorization`
- Tratamento de erros padronizado
- Cache de requisições com React Query

## 📝 Variáveis de Ambiente no Vite

Variáveis de ambiente no Vite devem começar com `VITE_`:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

Acesse no código:

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 📄 Licença

MIT

## 👥 Autores

Guilherme Tosi
