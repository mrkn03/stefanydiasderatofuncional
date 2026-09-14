# Site Dra. Stefany Dias

Frontend institucional e de agendamento desenvolvido com React, TanStack Start, TypeScript e Tailwind CSS.

## Executar localmente

```bash
bun install
bun run dev
```

Sem configuração adicional, a agenda funciona em **modo demonstrativo**: os dados ficam apenas no `localStorage` do navegador e não são enviados para nenhum servidor.

## Conectar à API .NET

Crie um arquivo `.env.local` na sua máquina:

```env
VITE_API_BASE_URL=https://localhost:7001
```

Reinicie o frontend. A partir daí, todas as ações da agenda usam a API configurada. Não coloque senhas, chaves privadas ou tokens em variáveis `VITE_*`, pois elas ficam públicas no navegador.

O contrato completo da API, regras de negócio, segurança, banco, exemplos e roteiro de implementação estão em [`docs/BACKEND-DOTNET.md`](docs/BACKEND-DOTNET.md).

## Comandos

```bash
bun run dev      # desenvolvimento
bun run build    # compilação de produção
bun run lint     # análise estática
```
