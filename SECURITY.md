# Segurança e privacidade

- Não publique chaves de API no GitHub.
- Não armazene no aplicativo pessoal dados operacionais sigilosos ou dados identificadores de terceiros.
- O PIN é uma barreira local de interface; não é criptografia completa do banco.
- Mantenha o aparelho protegido por senha e criptografia do sistema operacional.
- Faça backup frequente e guarde o arquivo em local seguro.
- Antes de importar um backup, confirme a origem e a integridade do arquivo.

- A chave Gemini é armazenada localmente no IndexedDB e excluída dos backups, mas chamadas diretas do navegador continuam menos seguras que uma ponte de servidor.

## VIP Guia e Gemini

- O manual offline não envia dados para a internet.
- Quando o Gemini é utilizado, apenas a pergunta atual e os trechos relevantes da documentação oficial do aplicativo são enviados.
- As chamadas do VIP Guia usam `store: false` na Interactions API.
- Evite escrever senhas, chaves, dados sigilosos ou informações de terceiros nas perguntas.
