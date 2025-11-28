# abrigo-helena-dornfeld-front

## Como utilizar

1. **Instale as dependências**

   ```bash
   pnpm install
   ```

   Isso instalará todas as dependências necessárias do projeto.

2. **Execute o projeto**

   Após a instalação, use os scripts disponíveis (por exemplo):

   ```bash
   npm run dev
   npm run dev:server
   ```

   > Consulte o `package.json` para ver todos os scripts disponíveis.

3. **Execução do banco de dados de homologação**

Diferentemente do banco de produção, o banco de homologação roda em um container postgreSQL.

Após a instalação, use os scripts disponíveis (por exemplo):

```bash
npm run dev:server
```

> Configure as credenciais de acesso do postgres no docker-compose.yml

---

## Estrutura de Branches

O repositório segue uma estrutura simples e padronizada de branches:

| Branch     | Função                                | Permissão de Push           |
| ---------- | ------------------------------------- | --------------------------- |
| **main**   | Versão estável do código em produção  | Protegida (sem push direto) |
| **dev**    | Ambiente principal de desenvolvimento | Via Pull Request            |
| **hotfix** | Correções urgentes e pontuais         | Via Pull Request            |

---

## Regras de Push e Pull Requests

- Nenhum push direto é permitido na branch **main**.
- Todo código deve ser enviado via **Pull Request (PR)**.
- As PRs podem ter origem:
  - da branch **dev**, para desenvolvimento normal;
  - ou da branch **hotfix**, para correções urgentes.

> ⚠️ Somente PRs aprovadas e revisadas podem ser mescladas na `main`.

---

## Fluxo de Desenvolvimento

```mermaid
gitGraph
   commit id: "main"
   branch dev
   commit id: "dev"
   branch hotfix
   commit id: "hotfix"
   checkout dev
   merge hotfix id: "merge hotfix → dev"
   checkout main
   merge dev id: "merge dev → main"
```

---

## Observações

- sempre dê pull na branch **main**
- Sempre crie uma nova branch local a partir de **dev** antes de iniciar uma feature.
- Commits devem ser descritivos e seguir boas práticas de versionamento.

---

## Requisitos

- Node.js (versão compatível com o projeto)
- pnpm (para gerenciamento de dependências)
- Docker (para usar o banco de homolog)
- PostgreSQL (para rodar o banco local)

---
