# Histórico de versões

## 0.1.2 — VIP Guia

- Novo módulo VIP GUIA com manual interativo offline.
- Respostas ampliadas pelo Gemini quando a API estiver configurada.
- Pesquisa por linguagem natural nas funções atuais do aplicativo.
- Perguntas por voz em navegadores compatíveis.
- Atalhos para abrir diretamente a função explicada.
- Histórico local de perguntas e fallback automático para o manual offline.
- Botão de ajuda `?` no topo e acesso pelo QG.
- Chamada Gemini com `store: false` e contexto restrito ao manual oficial.

## 0.1.1 — Configuração Gemini

- Adicionada a área `Configurações > Inteligência Artificial`.
- Campo local para chave API do Google Gemini.
- Campo editável para selecionar o modelo.
- Botão para mostrar ou ocultar a chave.
- Teste real de conexão pela Interactions API v1.
- Diagnóstico para chave inválida, modelo inexistente, cota excedida, falta de internet e indisponibilidade do serviço.
- A chave Gemini passou a ser excluída dos backups JSON do GUARDIÃO.

## 0.1.0 — Genesis

- Renomeação para Assistente Pessoal VIP.
- Nova identidade azul-marinho, azul elétrico e verde metálico.
- Configuração inicial vazia.
- PIN obrigatório de 4 a 8 números.
- Bloqueio automático configurável.
- IndexedDB modular.
- Áreas AGORA, QG, MEMÓRIA, ORÁCULO, FORJA, GUARDIÃO e CONFIGURAÇÕES.
- Backup e restauração JSON.
- PWA offline-first para GitHub Pages.
