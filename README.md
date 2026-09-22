# Site Dra. Stefany Dias

Site institucional e sistema de agendamento desenvolvido com React, TanStack Start, TypeScript, Tailwind CSS e Lovable Cloud.

## Executar localmente

```bash
bun install
bun run dev
```

O agendamento público solicita exclusivamente uma avaliação dermatofuncional. Solicitações, reagendamentos e evoluções clínicas são persistidos no Lovable Cloud, e a agenda profissional exige login.

## WhatsApp Business

O sistema registra cada tentativa de aviso e acompanha os retornos de entrega. Para habilitar o envio automático, conecte a conta oficial do WhatsApp Business ao projeto. O agendamento é preservado mesmo quando o aviso não puder ser enviado.

O documento [`docs/BACKEND-DOTNET.md`](docs/BACKEND-DOTNET.md) permanece como referência histórica caso seja necessária uma migração futura para uma API própria.

## Comandos

```bash
bun run dev      # desenvolvimento
bun run build    # compilação de produção
bun run lint     # análise estática
```
