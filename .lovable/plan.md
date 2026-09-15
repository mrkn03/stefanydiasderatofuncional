# Agenda focada em avaliação e evolução clínica

## Objetivo

Restringir o agendamento público à avaliação dermatofuncional e ampliar a área profissional com confirmação, reagendamento, cancelamento e evolução do paciente.

## Alterações no site

- Remover a escolha de procedimentos do formulário público; toda nova solicitação será criada como `Avaliação dermatofuncional`.
- Atualizar os textos da página para explicar que os demais procedimentos são definidos após a avaliação.
- Na agenda profissional, trocar a seleção genérica por ações claras para confirmar, reagendar ou cancelar.
- Permitir reagendar escolhendo uma nova data e um horário ainda disponível.
- Exibir `Evoluir paciente` somente em agendamentos confirmados.
- Abrir um formulário de evolução clínica com queixa, avaliação, conduta realizada, resposta do paciente e orientações.
- Mostrar o histórico de evoluções do paciente no registro do agendamento.

## Modo demonstrativo e API .NET

- Persistir reagendamentos e evoluções somente no navegador enquanto a API não estiver configurada.
- Validar textos, datas e horários no frontend e documentar a mesma validação obrigatória no backend.
- Ampliar o contrato ASP.NET Core com modelos e endpoints protegidos para reagendamento e evolução clínica.
- Exigir que o backend valide disponibilidade de forma transacional e mantenha os dados clínicos protegidos.

## Validação

- Testar criação de avaliação, confirmação, reagendamento para horário livre, cancelamento e inclusão de evolução.
- Confirmar que `Evoluir paciente` não aparece antes da confirmação.
- Verificar a agenda em telas grandes e celulares.
