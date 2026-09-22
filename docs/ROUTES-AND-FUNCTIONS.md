# Documentação de rotas e funções do site

Este documento reúne todas as rotas e fluxos de integração do frontend para que a API do backend possa ser implementada com base no comportamento real do site.

## 1. Visão geral do projeto

O site é uma vitrine institucional com agendamento público e área privada para gestão da agenda.

Principais módulos:
- Landing page institucional
- Página de serviços
- Página de sobre
- Página de contato
- Agendamento de avaliação dermatofuncional
- Login profissional
- Área administrativa com agenda, confirmação/cancelamento, reagendamento e evolução clínica

A comunicação com o backend acontece pelo arquivo [src/lib/api.ts](../src/lib/api.ts), em que o frontend define contratos de entrada/saída esperados, validações e regras de negócio em modo demonstrativo.

---

## 2. Estrutura de rotas

### 2.1 Rotas públicas

| Rota | Arquivo | Função | Requer backend |
| --- | --- | --- | --- |
| / | [src/routes/index.tsx](../src/routes/index.tsx) | Página inicial institucional com apresentação da Dra. Stefany, serviços em destaque e CTA para agendamento | Não |
| /servicos | [src/routes/servicos.tsx](../src/routes/servicos.tsx) | Exibe protocolos e serviços oferecidos | Não |
| /sobre | [src/routes/sobre.tsx](../src/routes/sobre.tsx) | Apresenta formação, filosofia e valores | Não |
| /contato | [src/routes/contato.tsx](../src/routes/contato.tsx) | Mostra localização, Instagram e WhatsApp | Não |
| /agendamento | [src/routes/agendamento.tsx](../src/routes/agendamento.tsx) | Formulário público para solicitar avaliação dermatofuncional | Sim |
| /auth | [src/routes/auth.tsx](../src/routes/auth.tsx) | Login da área administrativa | Sim |

### 2.2 Rotas protegidas

| Rota | Arquivo | Função | Requer backend |
| --- | --- | --- | --- |
| /_authenticated | [src/routes/_authenticated/route.tsx](../src/routes/_authenticated/route.tsx) | Guard de autenticação da área privada | Sim |
| /_authenticated/admin | [src/routes/_authenticated/admin.tsx](../src/routes/_authenticated/admin.tsx) | Agenda administrativa, confirmação, cancelamento, reagendamento e evoluções | Sim |

---

## 3. Documentação por rota

### 3.1 / (home)

Arquivo: [src/routes/index.tsx](../src/routes/index.tsx)

Objetivo:
- apresentar a clínica e o posicionamento da profissional
- converter visitantes para agendamento
- guiar para serviços, sobre e WhatsApp

Elementos principais:
- hero com CTA para /agendamento
- seção de tratamentos em destaque
- seção de apresentação sobre a profissional
- bloco final com convite para agendar

Backend necessário:
- nenhum, pois é uma página institucional estática
- apenas SEO/meta tags e links internos

---

### 3.2 /servicos

Arquivo: [src/routes/servicos.tsx](../src/routes/servicos.tsx)

Objetivo:
- detalhar os protocolos da clínica
- mostrar os principais serviços e tratamentos
- conduzir para o agendamento

Conteúdo exibido:
- Microagulhamento
- Peelings
- Botox
- Feridas
- Pós-operatório
- Rejuvenescimento

Backend necessário:
- nenhum, se os serviços forem estáticos no frontend
- caso queira tornar dinâmico, pode evoluir para CMS ou banco de serviços

---

### 3.3 /sobre

Arquivo: [src/routes/sobre.tsx](../src/routes/sobre.tsx)

Objetivo:
- apresentar formação, abordagem e valores da profissional

Conteúdo exibido:
- formação pela UFES
- abordagem terapêutica individualizada
- foco em ciência e acolhimento

Backend necessário:
- nenhum, salvo se quiser alimentar perfil profissional com banco

---

### 3.4 /contato

Arquivo: [src/routes/contato.tsx](../src/routes/contato.tsx)

Objetivo:
- disponibilizar comunicação por localização, Instagram e WhatsApp

Dados exibidos:
- endereço: Praia do Suá · 3º andar sala 302
- Instagram: @stefanyfisiodermato
- WhatsApp: número 5527988333769

Backend necessário:
- nenhum para a tela em si
- se quiser integrar, o backend pode manter dados públicos de contato e links

---

### 3.5 /agendamento

Arquivo: [src/routes/agendamento.tsx](../src/routes/agendamento.tsx)

Objetivo:
- coletar dados do paciente para solicitar avaliação dermatofuncional
- permitir seleção de data e horário
- consultar horários já ocupados
- enviar solicitação para backend ou simular em modo local

Fluxo principal:
1. usuário escolhe a data
2. o frontend chama getOccupiedSlots(date)
3. o frontend renderiza horários disponíveis e ocupados
4. usuário preenche nome, WhatsApp, observações e seleciona horário
5. o frontend envia createAppointment({ patientName, phone, date, time, notes })
6. o backend responde com sucesso ou erro
7. tela mostra confirmação

Dados esperados:
- patientName
- phone
- date
- time
- notes (opcional)
- procedure: sempre "Avaliação dermatofuncional"

Regras aplicadas no frontend:
- nome: mínimo 2 caracteres
- telefone: apenas dígitos, espaços, parênteses, + e -
- data: formato YYYY-MM-DD
- horário: valores permitidos de APPOINTMENT_TIMES
- não permite duplicidade de agendamento para o mesmo dia/horário ativo
- status inicial: pendente

Backend esperado:
- GET /api/appointments/occupied-slots?date=YYYY-MM-DD
- POST /api/appointments

---

### 3.6 /auth

Arquivo: [src/routes/auth.tsx](../src/routes/auth.tsx)

Objetivo:
- autenticar a profissional para acessar a área administrativa

Fluxo:
1. usuário insere e-mail e senha
2. chama login(email, password)
3. em caso de sucesso, navega para /_authenticated/admin

Regras do frontend:
- e-mail obrigatório
- senha obrigatória
- em modo demonstrativo, qualquer preenchimento gera sessão local

Backend esperado:
- POST /api/auth/login
- GET /api/auth/session
- POST /api/auth/logout

Importante:
- o frontend usa cookies com credentials: "include"
- a sessão é tratada como HTTP-only cookie

---

### 3.7 /_authenticated

Arquivo: [src/routes/_authenticated/route.tsx](../src/routes/_authenticated/route.tsx)

Objetivo:
- verificar autenticidade da sessão antes de abrir a área privada

Fluxo:
1. useEffect verifica hasAdminSession()
2. se autenticado, renderiza Outlet
3. se não autenticado, redireciona para /auth

Backend esperado:
- GET /api/auth/session

---

### 3.8 /_authenticated/admin

Arquivo: [src/routes/_authenticated/admin.tsx](../src/routes/_authenticated/admin.tsx)

Objetivo:
- centralizar gestão profissional da clínica
- listagem de agendamentos
- confirmação, cancelamento e reagendamento
- registro de evolução clínica
- logout

Funcionalidades oferecidas:

1. Carregar agenda
   - listAppointments()
   - chama GET /api/admin/appointments

2. Confirmar agendamento
   - change(item.id, "confirmado")
   - chama PATCH /api/admin/appointments/{id}/status

3. Cancelar agendamento
   - change(item.id, "cancelado")
   - chama PATCH /api/admin/appointments/{id}/status

4. Reagendar agendamento
   - openReschedule(item)
   - saveReschedule()
   - chama PATCH /api/admin/appointments/{id}/schedule

5. Abrir evolução clínica
   - openEvolution(item)
   - chama GET /api/admin/appointments/{id}/evolutions

6. Salvar evolução
   - saveEvolution(event)
   - chama POST /api/admin/appointments/{id}/evolutions

7. Sair da conta
   - logout()
   - chama POST /api/auth/logout

Backend esperado:
- GET /api/admin/appointments
- PATCH /api/admin/appointments/{id}/status
- PATCH /api/admin/appointments/{id}/schedule
- GET /api/admin/appointments/{id}/evolutions
- POST /api/admin/appointments/{id}/evolutions

---

## 4. Funções do backend esperadas a partir do frontend

As funções abaixo estão implementadas em [src/lib/api.ts](../src/lib/api.ts) e definem o contrato funcional para a API.

### 4.1 getOccupiedSlots(date, excludeId?)

Objetivo:
- retornar horários ocupados em uma data
- excluir um agendamento ao reagendar

Regra:
- horários de agendamentos pendentes ou confirmados são ocupados
- cancelados são liberados

Backend esperado:
- GET /api/appointments/occupied-slots?date=YYYY-MM-DD
- opcionalmente: &excludeId={id}

Retorno:
- array de strings no formato HH:mm

---

### 4.2 createAppointment(input)

Objetivo:
- criar solicitação de agendamento público

Campos aceitos:
- patientName
- phone
- date
- time
- notes (opcional)

Obrigatório:
- procedure = "Avaliação dermatofuncional"

Regras:
- validar data no formato YYYY-MM-DD
- validar horário permitido
- impedir duplicidade em horário ativo
- salvar status pendente

Backend esperado:
- POST /api/appointments
- HTTP 201 em sucesso
- HTTP 409 quando horário ocupado

---

### 4.3 login(email, password)

Objetivo:
- autenticar profissional

Backend esperado:
- POST /api/auth/login
- sucesso: 204 No Content com cookie HTTP-only
- erro: 401 Unauthorized

---

### 4.4 logout()

Objetivo:
- encerrar a sessão atual

Backend esperado:
- POST /api/auth/logout

---

### 4.5 hasAdminSession()

Objetivo:
- checar se a sessão do profissional ainda é válida

Backend esperado:
- GET /api/auth/session
- retorno esperado: { authenticated: true }

---

### 4.6 listAppointments()

Objetivo:
- listar agendamentos da área administrativa

Retorno esperado:
- array de objetos Appointment
- ordenação por data e horário

Backend esperado:
- GET /api/admin/appointments

---

### 4.7 updateAppointmentStatus(id, status)

Objetivo:
- alterar o status de um agendamento

Status permitidos:
- pendente
- confirmado
- cancelado

Backend esperado:
- PATCH /api/admin/appointments/{id}/status

---

### 4.8 rescheduleAppointment(id, date, time)

Objetivo:
- reagendar avaliação para outro horário livre

Regras:
- data e horário válidos
- novo horário não pode estar ocupado por outro agendamento ativo
- manter consistência com transação e concorrência

Backend esperado:
- PATCH /api/admin/appointments/{id}/schedule

---

### 4.9 listClinicalEvolutions(appointmentId)

Objetivo:
- buscar histórico de evolução de um agendamento

Backend esperado:
- GET /api/admin/appointments/{id}/evolutions

Retorno esperado:
- lista de evoluções em ordem decrescente por data de criação

---

### 4.10 createClinicalEvolution(appointmentId, input)

Objetivo:
- registrar evolução clínica profissional para um agendamento confirmado

Regras:
- o agendamento precisa estar confirmado
- campos obrigatórios: chiefComplaint, clinicalDiagnosis, objective, conduct
- o restante do formulário pode ser opcional
- aceita listas de strings para campos múltiplos

Backend esperado:
- POST /api/admin/appointments/{id}/evolutions

---

## 5. Modelo de dados do agendamento

Tipo definido em [src/lib/api.ts](../src/lib/api.ts):

```ts
export type Appointment = {
  id: string;
  patientName: string;
  phone: string;
  procedure: string;
  date: string;
  time: string;
  status: "pendente" | "confirmado" | "cancelado";
  notes: string | null;
  createdAt: string;
};
```

Status:
- pendente
- confirmado
- cancelado

Valores permitidos de horário:
- 08:00
- 09:00
- 10:00
- 11:00
- 13:00
- 14:00
- 15:00
- 16:00
- 17:00
- 18:00

---

## 6. Modelo de evolução clínica

Arquivo principal: [src/components/clinical-evolution-form.tsx](../src/components/clinical-evolution-form.tsx)

A evolução tem um conjunto muito grande de campos. O formulário cobre estas áreas:

1. Identificação
   - endereço
   - sexo
   - bairro
   - cidade
   - UF
   - data de nascimento
   - naturalidade
   - estado civil
   - escolaridade
   - profissão
   - profissional responsável
   - especialidade
   - data de admissão

2. Anamnese
   - queixa principal
   - HDA
   - antecedentes pessoais e familiares
   - câncer de pele
   - hábitos de vida
   - outros hábitos
   - medicamentos
   - cosméticos
   - botox
   - protetor solar
   - alergias
   - alimentação
   - menstruação/menopausa
   - menarca
   - tratamento facial anterior

3. Exame físico-funcional
   - cor da pele
   - tipo de pele
   - Glogau
   - Fitzpatrick
   - pilosidade
   - acne
   - alterações
   - flacidez
   - rugas
   - classificação de Tsuji
   - classificação de Lapiere e Pierard
   - avaliação odontológica
   - tato
   - tônus muscular
   - hidratação
   - lâmpada de Wood
   - medidas faciais

4. Pós-operatório e imagem
   - achados pós-operatórios
   - dor
   - sensibilidade
   - avaliação por imagem

5. Tratamento fisioterapêutico
   - diagnóstico clínico-funcional
   - objetivo
   - conduta

Os campos obrigatórios de evolução no frontend são:
- chiefComplaint
- clinicalDiagnosis
- objective
- conduct

Todos os campos textuais possuem limite de até 2000 ou 4000 caracteres, dependendo do tipo.

---

## 7. Regras de negócio centrais que o backend precisa garantir

### 7.1 Agendamento
- só existe um procedimento público: "Avaliação dermatofuncional"
- a data deve estar no futuro
- o horário deve pertencer à grade permitida
- horário em status pendente ou confirmado é ocupado
- cancelado pode ser reutilizado
- duas solicitações simultâneas não podem ocupar o mesmo slot ativo

### 7.2 Administração
- só profissionais autenticados podem acessar agenda
- status pode ser pendente, confirmado ou cancelado
- reagendamento exige novo horário disponível
- evolução só pode ser registrada se o agendamento estiver confirmado

### 7.3 Segurança
- autenticação por cookie HTTP-only
- sessão validada por endpoint dedicado
- credenciais não devem serem acessadas pelo navegador
- CORS deve permitir apenas a origem do frontend

---

## 8. Resumo de endpoints mínimos para backend

### Públicos
- GET /api/appointments/occupied-slots
- POST /api/appointments

### Autenticação
- POST /api/auth/login
- GET /api/auth/session
- POST /api/auth/logout

### Administrativos
- GET /api/admin/appointments
- PATCH /api/admin/appointments/{id}/status
- PATCH /api/admin/appointments/{id}/schedule
- GET /api/admin/appointments/{id}/evolutions
- POST /api/admin/appointments/{id}/evolutions

---

## 9. Observações importantes para a implementação

- O frontend já define contratos que podem servir como base do backend.
- O arquivo [src/lib/api.ts](../src/lib/api.ts) deve ser usado como referência do que o backend precisa aceitar e devolver.
- O formulário de evolução em [src/components/clinical-evolution-form.tsx](../src/components/clinical-evolution-form.tsx) descreve o protocolo clínico completo e também serve como blueprint para tabela ou JSON de persistência.
- O frontend usa credentials: "include", então o backend precisa lidar com cookies e CORS corretamente.
- Sem VITE_API_BASE_URL configurado, o site fica em modo demonstrativo e não envia dados para servidor.

Se quiser, o próximo passo pode ser transformar este mapa em:
1. modelagem de banco de dados,
2. DTOs em C#,
3. controllers e services ASP.NET Core,
4. autenticação com Identity,
5. documentação Swagger/OpenAPI.
