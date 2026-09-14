# Backend .NET — especificação funcional e contrato da API

Este documento descreve o backend necessário para ativar o agendamento e a área administrativa deste frontend. A implementação recomendada é ASP.NET Core 8 ou superior com Entity Framework Core e PostgreSQL, SQL Server ou outro banco relacional.

## 1. Funcionalidades esperadas

### Área pública
1. Consultar horários ocupados de uma data.
2. Enviar uma solicitação de agendamento.
3. Impedir dois agendamentos ativos no mesmo dia e horário.
4. Criar toda nova solicitação com status `pendente`.

### Área profissional
1. Autenticar a profissional por e-mail e senha.
2. Verificar se a sessão atual continua válida.
3. Encerrar a sessão.
4. Listar agendamentos em ordem de data e horário.
5. Alterar o status para `pendente`, `confirmado` ou `cancelado`.

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
  "procedure": "Limpeza de pele",
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

Público. Retorna apenas horários de agendamentos `pendente` ou `confirmado`.

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
  "procedure": "Limpeza de pele",
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
```

Configure a enumeração para ser serializada em minúsculas (`pendente`, `confirmado`, `cancelado`) ou mapeie explicitamente para esses três valores nos DTOs.

## 6. Validações e regras de negócio

- `patientName`: obrigatório, entre 2 e 100 caracteres após `Trim()`.
- `phone`: obrigatório, entre 8 e 20 caracteres; aceitar somente números, espaços, `(`, `)`, `+` e `-`.
- `procedure`: obrigatório, entre 2 e 100 caracteres. Idealmente valide contra os procedimentos cadastrados no backend.
- `date`: obrigatória, não pode estar no passado nem no dia atual.
- `time`: obrigatório e pertencente à grade permitida: `08:00`, `09:00`, `10:00`, `11:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`.
- `notes`: opcional, até 500 caracteres.
- Um horário com status `pendente` ou `confirmado` está ocupado. Um horário `cancelado` pode ser reservado novamente.
- O backend é a autoridade final. Sempre revalide a disponibilidade dentro da mesma transação que cria o agendamento.

## 7. Concorrência e índice no banco

Uma simples consulta antes do `INSERT` não evita duas requisições simultâneas. Prefira um índice único parcial no PostgreSQL:

```sql
CREATE UNIQUE INDEX ux_appointments_active_slot
ON appointments (date, time)
WHERE status IN ('pendente', 'confirmado');
```

No SQL Server, use uma coluna calculada/indicador de ativo com índice único filtrado. Capture a violação de unicidade e responda `409 Conflict`. A atualização de um agendamento cancelado para ativo também deve respeitar essa restrição.

## 8. Persistência com Entity Framework Core

1. Crie `AppDbContext` e `DbSet<Appointment>`.
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
- Nunca registre senhas. Evite registrar nome, telefone e observações em logs.
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
6. Implementar os dois endpoints administrativos.
7. Configurar CORS, cookie, CSRF, HTTPS e limitação de requisições.
8. Executar testes de integração usando um banco real de teste.
9. Publicar a API e configurar `VITE_API_BASE_URL` no frontend.

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