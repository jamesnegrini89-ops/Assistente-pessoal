# Assistente Pessoal VIP — Genesis 0.1.2

Primeira fundação modular do antigo QG 360, preparada para GitHub Pages e instalação no celular como PWA.

## Áreas desta versão

- **AGORA:** prioridades locais e comando universal básico.
- **QG:** central de motores, modo atual e ferramentas criadas na FORJA.
- **MEMÓRIA VIVA:** registros, categorias, etiquetas, pesquisa e linha do tempo.
- **ORÁCULO:** comparação de duas alternativas por benefício, custo, risco, urgência e reversibilidade.
- **FORJA:** criação de checklist, cadastro, diário e rastreador com campos personalizados.
- **VIP GUIA:** manual interativo offline, perguntas por voz, atalhos e respostas ampliadas pelo Gemini.
- **GUARDIÃO:** PIN, bloqueio automático, backup, restauração, registro de atividades e reinicialização.
- **CONFIGURAÇÕES:** perfil, tema, tamanho do texto, modo atual e conexão com a Gemini API.

## Publicar no GitHub Pages

1. Faça backup do aplicativo antigo antes de substituir arquivos.
2. Envie **o conteúdo desta pasta** para a raiz do repositório, não a pasta inteira.
3. No GitHub, abra `Settings > Pages`.
4. Em `Build and deployment`, selecione `Deploy from a branch`.
5. Escolha a branch `main` e a pasta `/ (root)`.
6. Aguarde a publicação e abra o endereço fornecido pelo GitHub.
7. No celular, abra pelo navegador e use `Adicionar à tela inicial` ou `Instalar aplicativo`.

## Atualização e cache

O `sw.js` usa uma identificação de versão. A cada atualização futura, essa identificação precisa ser alterada para que o navegador substitua o cache anterior.

## Armazenamento

Os dados ficam no IndexedDB do navegador. Eles não estão no repositório GitHub. O usuário deve exportar backup pelo GUARDIÃO antes de:

- trocar arquivos no GitHub;
- limpar dados do navegador;
- trocar de aparelho;
- redefinir o aplicativo.

## Limite de segurança do PIN

O PIN desta versão bloqueia a interface e armazena somente um hash derivado por PBKDF2. Os registros do IndexedDB ainda não são criptografados individualmente. A criptografia integral é uma evolução planejada para o GUARDIÃO.

## IA

A área de CONFIGURAÇÕES permite inserir uma chave Gemini apenas no banco local do navegador, informar o modelo e testar a conexão. A chave não é publicada no GitHub e não é incluída no backup JSON. Por ser uma PWA cliente, a arquitetura mais segura para uso futuro continua sendo uma ponte de servidor.

## Execução local para testes

Módulos JavaScript exigem servidor HTTP. Na pasta do projeto, execute por exemplo:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## VIP GUIA

Manual interativo que funciona offline e pode ampliar respostas com o Gemini configurado em CONFIGURAÇÕES.
