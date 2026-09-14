# Frontend independente e contrato para backend .NET

## Objetivo
Manter o site visual e navegável sem Lovable Cloud, deixando a agenda preparada para consumir futuramente uma API ASP.NET Core.

## Alterações no frontend
- Remover o cliente, autenticação, funções e dependências específicas do banco atual.
- Preservar as páginas públicas, o formulário de agendamento e a área administrativa.
- Criar uma camada única de acesso à API, configurada por `VITE_API_BASE_URL`, para evitar lógica HTTP espalhada pelas telas.
- Enquanto a URL da API não estiver configurada, usar dados demonstrativos locais e deixar claro na interface que nenhum agendamento real será salvo.
- Adaptar login, logout, consulta de horários, criação e gestão de agendamentos ao contrato HTTP documentado.
- Guardar a sessão administrativa apenas conforme o modelo definido pelo backend: cookie seguro como opção recomendada; token Bearer como alternativa documentada.

## Documentação .NET
Criar um guia no repositório contendo:
- funcionalidades e regras de negócio;
- modelos, enums e validações;
- endpoints, corpos, respostas e códigos HTTP;
- autenticação e autorização da área administrativa;
- prevenção de conflito de horários;
- persistência com ASP.NET Core e Entity Framework Core;
- CORS, configuração, segurança, logs e tratamento de erros;
- sequência recomendada de implementação e testes;
- exemplos de configuração para conectar este frontend.

## Validação
- Confirmar que não restaram importações ou chamadas ao banco atual no código da aplicação.
- Testar navegação, agendamento em modo demonstrativo, login demonstrativo e gestão visual.
- Verificar as páginas em desktop e celular e confirmar que os metadados continuam presentes.

## Observação
O banco já criado no Lovable Cloud não será apagado; ele apenas deixará de ser utilizado pelo site. Isso evita uma exclusão irreversível e mantém a entrega restrita ao frontend.
