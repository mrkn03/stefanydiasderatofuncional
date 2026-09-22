# Sistema completo de agenda e avisos

## Objetivo

Colocar o site em funcionamento real com banco, acesso privado da Dra. Stefany, agenda persistente, prontuário clínico e aviso automático de novos pedidos pelo WhatsApp oficial `+55 27 98833-3769`.

## Banco e segurança

- Reativar a integração do site com o Lovable Cloud, substituindo o modo demonstrativo.
- Manter `appointments` como agenda e criar uma tabela separada para as evoluções clínicas vinculadas ao agendamento.
- Restringir a consulta e gestão da agenda e dos prontuários a usuários autenticados.
- Manter pública apenas a consulta de horários ocupados e a criação de uma solicitação de avaliação.
- Validar no banco conflitos de data/horário e impedir evolução clínica antes da confirmação.
- Preservar o protocolo PAF completo e tratar seus dados como conteúdo clínico sensível.

## Acesso profissional

- Trocar o login demonstrativo por e-mail e senha reais.
- Proteger a agenda e o histórico clínico com sessão autenticada.
- Manter confirmação, reagendamento, cancelamento, evolução e saída funcionando com os dados persistidos.

## Aviso no WhatsApp

- Criar o envio no servidor após um agendamento ser salvo com sucesso.
- Enviar à Dra. Stefany um resumo com paciente, telefone, data e horário, sem incluir dados clínicos sensíveis.
- Usar a API oficial do WhatsApp Business ou uma conexão disponível, com credenciais guardadas com segurança.
- Se o provedor não estiver configurado ou estiver temporariamente indisponível, preservar o agendamento e registrar apenas a falha do aviso, sem expor detalhes ao paciente.

## Validação

- Testar horários ocupados e conflito simultâneo.
- Testar criação pública e persistência após recarregar a página.
- Testar login, confirmação, reagendamento, cancelamento e evolução clínica.
- Testar proteção da área profissional e dos prontuários.
- Testar o pedido de envio do aviso e o comportamento seguro em caso de falha do WhatsApp.

## Dependência externa

O envio automático exige uma conta oficial do WhatsApp Business com modelo de mensagem aprovado e credenciais do provedor. A estrutura será criada primeiro; depois, as credenciais serão solicitadas pelo formulário seguro.
