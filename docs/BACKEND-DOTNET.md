# Backend .NET — especificação funcional e contrato da API

Este documento descreve o backend necessário para ativar o agendamento e a área administrativa deste frontend. A implementação recomendada é ASP.NET Core 8 ou superior com Entity Framework Core e PostgreSQL, SQL Server ou outro banco relacional.

## 1. Funcionalidades esperadas

### Área pública

1. Consultar horários ocupados de uma data.
2. Enviar uma solicitação exclusivamente para `Avaliação dermatofuncional`.
3. Impedir dois agendamentos ativos no mesmo dia e horário.
4. Criar toda nova solicitação com status `pendente`.

### Área profissional

1. Autenticar a profissional por e-mail e senha.
2. Verificar se a sessão atual continua válida.
3. Encerrar a sessão.
4. Listar agendamentos em ordem de data e horário.
5. Alterar o status para `pendente`, `confirmado` ou `cancelado`.
6. Reagendar uma avaliação para outra data e horário disponíveis.
7. Registrar e consultar o histórico de evoluções clínicas após a confirmação.

## 2. Configuração do frontend

Defina a URL pública da API no ambiente do frontend:

```env
VITE_API_BASE_URL=https://api.seudominio.com
```

Não inclua `/` no final. O frontend envia JSON e usa `credentials: "include"`, permitindo autenticação por cookie HTTP-only. Sem essa variável, o site permanece em modo demonstrativo local.

## 3. Formato JSON

Use nomes em `camelCase`, padrão do `System.Text.Json` no ASP.NET Core.

```json
{
  "id": "d7bbca82-05f1-4d86-97ba-bca8959db81f",
  "patientName": "Maria Silva",
  "phone": "(27) 99999-9999",
  "procedure": "Avaliação dermatofuncional",
  "date": "2026-10-20",
  "time": "14:00",
  "status": "pendente",
  "notes": "Primeira avaliação",
  "createdAt": "2026-09-14T21:00:00Z"
}
```

Datas usam `YYYY-MM-DD`, horários usam `HH:mm` e instantes usam ISO 8601 em UTC.

## 4. Endpoints

### `GET /api/appointments/occupied-slots?date=YYYY-MM-DD`

Público. Retorna apenas horários de agendamentos `pendente` ou `confirmado`. Na consulta administrativa para reagendamento, aceite opcionalmente `excludeId` e desconsidere o próprio agendamento.

```json
["09:00", "14:00"]
```

- `200`: consulta concluída.
- `400`: data ausente ou inválida.

### `POST /api/appointments`

Público. Cria uma solicitação.

```json
{
  "patientName": "Maria Silva",
  "phone": "(27) 99999-9999",
  "procedure": "Avaliação dermatofuncional",
  "date": "2026-10-20",
  "time": "14:00",
  "notes": "Primeira avaliação"
}
```

Retorne `201 Created` com o objeto completo criado e um cabeçalho `Location`. Retorne `409 Conflict` com `{ "message": "Este horário acabou de ser reservado. Escolha outro." }` quando o horário não estiver mais livre.

### `POST /api/auth/login`

```json
{ "email": "profissional@dominio.com", "password": "senha" }
```

Valide a senha com ASP.NET Core Identity. Em caso de sucesso, crie um cookie HTTP-only e retorne `204 No Content`. Em credenciais inválidas, retorne `401` com uma mensagem genérica.

### `GET /api/auth/session`

Protegido. Retorna `200` quando a sessão for válida:

```json
{ "authenticated": true }
```

Retorna `401` quando não houver sessão válida.

### `POST /api/auth/logout`

Encerra a sessão e retorna `204 No Content`.

### `GET /api/admin/appointments`

Protegido pela política `Admin`. Retorna `200` com um array de agendamentos, ordenado por `date` e `time` crescentes.

### `PATCH /api/admin/appointments/{id}/status`

Protegido pela política `Admin`.

```json
{ "status": "confirmado" }
```

Retorna `204 No Content`, `400` para status inválido ou `404` para identificador inexistente.

### `PATCH /api/admin/appointments/{id}/schedule`

Protegido pela política `Admin`. Reagenda uma avaliação:

```json
{ "date": "2026-10-22", "time": "15:00" }
```

Retorna `204 No Content`. Retorne `409 Conflict` quando o novo horário estiver ocupado. A verificação e a atualização devem ocorrer na mesma transação e respeitar o índice único de horários ativos.

### `GET /api/admin/appointments/{id}/evolutions`

Protegido pela política `Admin`. Retorna o histórico clínico em ordem decrescente de criação. Cada item contém `id`, `appointmentId`, todos os campos do protocolo descritos abaixo e `createdAt`.

### `POST /api/admin/appointments/{id}/evolutions`

Protegido pela política `Admin`. Aceita múltiplas evoluções por agendamento confirmado:

O corpo JSON segue diretamente o DTO `ClinicalEvolutionData`. Campos de seleção múltipla são arrays de strings; campos não preenchidos são enviados como string vazia ou array vazio.

Retorna `201 Created` com a evolução criada. Retorne `409 Conflict` se o agendamento não estiver `confirmado` e `404` se ele não existir.

## 5. Modelos C# sugeridos

```csharp
public enum AppointmentStatus { Pendente, Confirmado, Cancelado }

public sealed class Appointment
{
    public Guid Id { get; set; }
    public required string PatientName { get; set; }
    public required string Phone { get; set; }
    public required string Procedure { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pendente;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed record CreateAppointmentRequest(
    string PatientName,
    string Phone,
    string Procedure,
    DateOnly Date,
    TimeOnly Time,
    string? Notes);

public sealed record LoginRequest(string Email, string Password);
public sealed record UpdateAppointmentStatusRequest(string Status);
public sealed record RescheduleAppointmentRequest(DateOnly Date, TimeOnly Time);

public sealed class ClinicalEvolution
{
    public Guid Id { get; set; }
    public Guid AppointmentId { get; set; }
    public required ClinicalEvolutionData Data { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Configure como owned/complex type no EF Core, ou mapeie cada propriedade para coluna.
public sealed record ClinicalEvolutionData(
    string Address, string Sex, string Neighborhood, string City, string State,
    string BirthDate, string Nationality, string MaritalStatus, string Education,
    string Profession, string Responsible, string Specialty, string AdmissionDate,
    string ChiefComplaint, string CurrentHistory, string PreviousHistory,
    string FamilyHistory, string SkinCancer, string[] Habits, string OtherHabits,
    string Medications, string Cosmetics, string Botox, string Sunscreen,
    string Allergies, string Diet, string MenstrualStatus, string MenarcheAge,
    string PreviousFacialTreatment, string SkinColor, string SkinType,
    string GlogauType, string FitzpatrickType, string[] HairLocations,
    string AcneGrade, string[] SkinAlterations, string SkinLaxity,
    string SkinLaxityLocation, string Wrinkles, string[] WrinkleLocations,
    string WrinkleType, string TsujiClassification, string LapierePierardGrade,
    string[] DentalAssessment, string Touch, string MuscleTone, string Hydration,
    string[] WoodLamp, string FacialMeasurements, string[] PostoperativeFindings,
    string Pain, string Sensitivity, string ImageAssessment,
    string ClinicalDiagnosis, string Objective, string Conduct);
```

Configure a enumeração para ser serializada em minúsculas (`pendente`, `confirmado`, `cancelado`) ou mapeie explicitamente para esses três valores nos DTOs.

## 6. Validações e regras de negócio

- `patientName`: obrigatório, entre 2 e 100 caracteres após `Trim()`.
- `phone`: obrigatório, entre 8 e 20 caracteres; aceitar somente números, espaços, `(`, `)`, `+` e `-`.
- `procedure`: obrigatório e deve ser exatamente `Avaliação dermatofuncional`. Rejeite qualquer outro valor, mesmo que a requisição não venha do frontend oficial.
- `date`: obrigatória, não pode estar no passado nem no dia atual.
- `time`: obrigatório e pertencente à grade permitida: `08:00`, `09:00`, `10:00`, `11:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`.
- `notes`: opcional, até 500 caracteres.
- Um horário com status `pendente` ou `confirmado` está ocupado. Um horário `cancelado` pode ser reservado novamente.
- O backend é a autoridade final. Sempre revalide a disponibilidade dentro da mesma transação que cria o agendamento.
- No reagendamento, aplique as mesmas regras de data, horário e concorrência, desconsiderando apenas o próprio agendamento.
- A evolução clínica só pode ser criada para um agendamento `confirmado`.
- Campos obrigatórios: `chiefComplaint`, `clinicalDiagnosis`, `objective` e `conduct`, entre 2 e 4.000 caracteres após `Trim()`.
- Demais campos textuais são opcionais e aceitam até 2.000 caracteres; cada item de seleção tem até 100 caracteres e cada lista aceita no máximo 30 itens.
- Valide seleções contra as opções do protocolo: sexo; sim/não; cor e tipo de pele; Glogau; Fitzpatrick; acne; rugas; Tsuji; Lapiere e Pierard; tato; tônus; hidratação; sensibilidade; pilosidade; alterações; localização das rugas; avaliação odontológica; lâmpada de Wood; e achados pós-operatórios.
- O protocolo contempla identificação, anamnese, exame físico-funcional, pós-operatório, avaliação por imagem, diagnóstico, objetivo e conduta. Mantenha os nomes JSON exatamente em `camelCase`, conforme o DTO acima.

## 7. Concorrência e índice no banco

Uma simples consulta antes do `INSERT` não evita duas requisições simultâneas. Prefira um índice único parcial no PostgreSQL:

```sql
CREATE UNIQUE INDEX ux_appointments_active_slot
ON appointments (date, time)
WHERE status IN ('pendente', 'confirmado');
```

No SQL Server, use uma coluna calculada/indicador de ativo com índice único filtrado. Capture a violação de unicidade e responda `409 Conflict`. A atualização de um agendamento cancelado para ativo também deve respeitar essa restrição.

## 8. Persistência com Entity Framework Core

1. Crie `AppDbContext`, `DbSet<Appointment>` e `DbSet<ClinicalEvolution>` com relação de um agendamento para muitas evoluções.
2. Configure limites de coluna, conversão de `AppointmentStatus` para texto e índice de data/horário.
3. Gere a migration inicial com `dotnet ef migrations add InitialCreate`.
4. Aplique com `dotnet ef database update` no desenvolvimento; em produção, use uma etapa controlada de implantação.
5. Nunca exponha a entidade diretamente se futuramente ela ganhar campos internos; mantenha DTOs de entrada e saída.

## 9. Autenticação recomendada

Use ASP.NET Core Identity e uma função/política `Admin`. Não grave função administrativa no navegador nem confie em parâmetros enviados pelo frontend.

Cookie recomendado:

```csharp
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.None; // se site e API estiverem em origens diferentes
    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
});
```

Se site e API compartilharem o mesmo domínio, prefira `SameSite=Lax`. Caso use JWT em vez de cookie, adapte `src/lib/api.ts` para manter o token somente em memória; não use `localStorage` para um token administrativo.

## 10. CORS e proteção contra CSRF

Permita exclusivamente as origens reais do site, nunca `AllowAnyOrigin` com credenciais:

```csharp
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
    policy.WithOrigins("https://seusite.com", "http://localhost:8080")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()));
```

Com cookies e origens diferentes, proteja `POST`/`PATCH` contra CSRF. Uma opção é emitir um token antifalsificação em um endpoint próprio e enviá-lo em cabeçalho. Se essa opção for adotada, acrescente a obtenção e o envio desse token na função `request` de `src/lib/api.ts`.

## 11. Erros, privacidade e operação

- Retorne erros no formato `{ "message": "Texto seguro para exibição" }`.
- Use `400` para validação, `401` para falta de autenticação, `403` para falta de permissão, `404` para recurso ausente, `409` para conflito e `500` para falha inesperada.
- Nunca registre senhas. Não registre nome, telefone, observações ou conteúdo das evoluções clínicas em logs.
- Evoluções contêm dados sensíveis de saúde: restrinja leitura e escrita à política `Admin`, mantenha trilha de auditoria de acesso e alteração e defina base legal, retenção e descarte conforme a LGPD.
- Use criptografia em trânsito e a proteção de dados em repouso oferecida pela infraestrutura escolhida. Não envie evoluções para ferramentas de análise ou monitoramento.
- Aplique limitação de requisições nos endpoints públicos, especialmente criação e login.
- Use HTTPS em produção.
- Proteja backups e defina política de retenção/exclusão para dados pessoais, observando a LGPD.
- Adicione rastreamento por identificador de requisição, logs estruturados e monitoramento de respostas 5xx.

## 12. Ordem recomendada de implementação

1. Criar a solução Web API e configurar banco, EF Core e migrations.
2. Implementar entidade, DTOs, validações e índice contra conflito.
3. Implementar os dois endpoints públicos e testes de concorrência.
4. Configurar Identity, criar a conta profissional e a política `Admin`.
5. Implementar sessão, login e logout.
6. Implementar status, reagendamento e consulta administrativa de horários.
7. Implementar a entidade e os endpoints protegidos de evolução clínica com auditoria.
8. Configurar CORS, cookie, CSRF, HTTPS e limitação de requisições.
9. Executar testes de integração usando um banco real de teste.
10. Publicar a API e configurar `VITE_API_BASE_URL` no frontend.

## 13. Cenários mínimos de teste

- Criar agendamento válido retorna `201` e status `pendente`.
- Campos ausentes ou limites excedidos retornam `400`.
- Data passada e horário fora da grade retornam `400`.
- Duas tentativas simultâneas para o mesmo horário resultam em um `201` e um `409`.
- Cancelar libera o horário; confirmar mantém o horário ocupado.
- Listagem e alteração de status sem sessão retornam `401`.
- Usuário autenticado sem função administrativa recebe `403`.
- Login inválido retorna `401` sem revelar se o e-mail existe.
- Logout invalida a sessão.
- CORS aceita apenas as origens configuradas.
- Procedimento diferente de `Avaliação dermatofuncional` retorna `400`.
- Reagendamento para horário ocupado retorna `409`; horário livre atualiza data e hora.
- Evolução antes da confirmação retorna `409`.
- Usuário sem política `Admin` não lê nem cria evoluções.
- Uma avaliação confirmada aceita múltiplas evoluções e as retorna da mais recente para a mais antiga.
