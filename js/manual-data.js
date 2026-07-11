const entries = [
  {
    id:'visao-geral', module:'Assistente Pessoal VIP', icon:'◆', title:'O que é o Assistente Pessoal VIP?', route:'qg',
    summary:'É uma PWA pessoal e modular que funciona prioritariamente no próprio aparelho. Nesta versão, reúne AGORA, QG, GÊMEO FINANCEIRO, MEMÓRIA VIVA, ORÁCULO, FORJA, GUARDIÃO, CONFIGURAÇÕES e VIP GUIA.',
    keywords:['aplicativo','app','assistente','vip','como funciona','funções','ferramentas','visão geral','inicio','começar'],
    questions:['Quais funções existem no aplicativo?','Por onde devo começar?','O aplicativo funciona sem internet?'],
    steps:['Conclua a configuração inicial e crie seu PIN.','Abra o AGORA para ver as prioridades sugeridas.','Use o QG para acessar todos os módulos.','Abra o VIP GUIA sempre que tiver dúvida sobre uma função.'],
    tips:['Comece criando uma memória, uma decisão no ORÁCULO e uma ferramenta simples na FORJA.'],
    warnings:['Os dados são armazenados no navegador do aparelho. Faça backups regulares no GUARDIÃO.']
  },
  {
    id:'agora-prioridades', module:'AGORA', icon:'⌂', title:'Como funciona o AGORA?', route:'agora',
    summary:'O AGORA é a tela inicial inteligente. Ele observa quantas memórias, decisões abertas e ferramentas existem e mostra no máximo três próximos passos úteis.',
    keywords:['agora','prioridade','prioridades','tela inicial','próximo passo','inicio','sugestão'],
    questions:['Como o AGORA escolhe as prioridades?','Posso clicar nas prioridades?','Por que aparecem somente três ações?'],
    steps:['Abra AGORA.','Leia as três prioridades exibidas.','Toque em uma prioridade para ir diretamente ao módulo correspondente.','Use o campo de comando para abrir uma função por frase curta.'],
    tips:['O modo atual, escolhido no QG ou nas CONFIGURAÇÕES, aparece no topo e ajuda a contextualizar a tela.'],
    warnings:['Nesta versão, as prioridades são geradas por regras locais simples; elas ainda não analisam agenda, localização ou saúde.']
  },
  {
    id:'agora-comandos', module:'AGORA', icon:'⌁', title:'Como usar o comando universal do AGORA?', route:'agora',
    summary:'O comando universal reconhece palavras ligadas às funções do aplicativo e encaminha você para a área correta.',
    keywords:['comando','campo de comando','executar','digitar','abrir função','comando universal'],
    questions:['O que posso escrever no AGORA?','O comando usa inteligência artificial?','Como abrir o manual pelo comando?'],
    steps:['Abra AGORA.','Digite uma frase, como “registrar uma ideia”, “analisar uma decisão”, “criar um checklist”, “fazer backup” ou “como funciona o ORÁCULO”.','Toque em Executar.'],
    tips:['Use frases curtas com o nome da função ou da ação desejada.'],
    warnings:['O roteamento do AGORA é local e baseado em palavras-chave. Para perguntas completas, use o VIP GUIA.']
  },
  {
    id:'qg-central', module:'QG', icon:'◇', title:'Como funciona o QG Central?', route:'qg',
    summary:'O QG é o centro de acesso a todos os motores principais e às ferramentas personalizadas criadas na FORJA.',
    keywords:['qg','central','módulos','ferramentas','abrir módulo','painel','motores'],
    questions:['Onde encontro todas as funções?','Onde aparecem as ferramentas da FORJA?','Como mudar o modo atual?'],
    steps:['Abra QG.','Na parte superior, selecione o modo atual.','Na seção Motores principais, toque no módulo desejado.','Na seção Ferramentas da FORJA, toque em uma ferramenta para adicionar ou consultar registros.'],
    tips:['Use o QG quando não souber em qual área uma função está localizada.'],
    warnings:[]
  },
  {
    id:'qg-modos', module:'QG', icon:'◐', title:'Para que servem os modos do QG?', route:'qg',
    summary:'Os modos identificam o contexto atual: Pessoal, Plantão, Pós-plantão, Folga, Casa, Estudo, Recuperação ou Modo mínimo.',
    keywords:['modo','plantão','folga','casa','estudo','recuperação','modo mínimo','contexto'],
    questions:['Como mudar para modo Plantão?','O modo altera meus dados?','O que é o Modo mínimo?'],
    steps:['Abra QG.','Localize Modo atual.','Toque no modo desejado.','Volte ao AGORA para ver o modo selecionado.'],
    tips:['Escolha o modo que melhor representa o momento atual.'],
    warnings:['Nesta versão, o modo altera principalmente o contexto exibido; automações avançadas serão adicionadas futuramente.']
  },
  {
    id:'memoria-criar', module:'MEMÓRIA VIVA', icon:'▤', title:'Como registrar uma memória?', route:'memoria?action=new',
    summary:'A MEMÓRIA VIVA guarda ideias, acontecimentos, aprendizados, projetos e outros registros em uma linha do tempo local.',
    keywords:['memória','registrar','anotar','ideia','acontecimento','aprendizado','salvar anotação','nova memória'],
    questions:['Como criar uma memória?','Para que servem categoria e etiquetas?','Onde ficam minhas anotações?'],
    steps:['Abra MEMÓRIA.','Toque em + Nova memória.','Digite um título.','Escolha uma categoria.','Adicione etiquetas separadas por vírgula, se desejar.','Escreva o registro e toque em Salvar memória.'],
    tips:['Use títulos objetivos e etiquetas como “carro”, “trabalho” ou “importante” para facilitar pesquisas futuras.'],
    warnings:['Ao excluir uma memória, ela é removida permanentemente do navegador.']
  },
  {
    id:'memoria-pesquisa', module:'MEMÓRIA VIVA', icon:'⌕', title:'Como pesquisar e consultar memórias?', route:'memoria',
    summary:'A pesquisa local procura no título, texto, categoria e etiquetas. Também é possível filtrar por categoria.',
    keywords:['pesquisar memória','buscar','filtro','categoria','etiqueta','encontrar anotação','ver memória'],
    questions:['Como encontrar uma ideia antiga?','Posso filtrar por categoria?','Como abrir o texto completo?'],
    steps:['Abra MEMÓRIA.','Digite uma palavra no campo Pesquisar.','Opcionalmente selecione uma categoria.','Toque em Ver para abrir o conteúdo completo.'],
    tips:['Pesquise por uma etiqueta específica ou por uma palavra incomum do registro.'],
    warnings:[]
  },
  {
    id:'financeiro-visao-geral', module:'GÊMEO FINANCEIRO', icon:'$', title:'Como funciona o GÊMEO FINANCEIRO?', route:'finance',
    summary:'O GÊMEO FINANCEIRO reúne entradas, gastos, saldo geral estimado, resultado mensal, orçamento por categoria, compromissos recorrentes e metas financeiras.',
    keywords:['financeiro','finanças','dinheiro','saldo','entrada','gasto','despesa','receita','planejamento financeiro','gêmeo financeiro'],
    questions:['Onde registro meus gastos?','Como vejo meu saldo?','Quais ferramentas financeiras existem?'],
    steps:['Abra o GÊMEO FINANCEIRO pelo QG ou menu lateral.','Escolha o mês que deseja analisar.','Use + Movimentação para registrar uma entrada ou gasto.','Consulte o resultado do mês, orçamento, projeção e metas na Visão geral.'],
    tips:['Registre as movimentações no dia em que acontecerem para manter o saldo e os relatórios corretos.'],
    warnings:['Os cálculos dependem dos valores cadastrados por você e não substituem extratos bancários ou orientação financeira profissional.']
  },
  {
    id:'financeiro-movimentacoes', module:'GÊMEO FINANCEIRO', icon:'⇄', title:'Como registrar entradas e gastos?', route:'finance?view=transactions',
    summary:'Cada movimentação possui tipo, data, descrição, valor, conta, categoria e observações opcionais.',
    keywords:['registrar gasto','registrar entrada','nova movimentação','salário','compra','despesa','receita','transação'],
    questions:['Como registrar um gasto?','Como registrar meu salário?','Posso editar ou excluir uma movimentação?'],
    steps:['Abra GÊMEO FINANCEIRO.','Toque em + Movimentação ou abra Movimentações.','Escolha Entrada ou Gasto.','Informe data, descrição, valor, conta e categoria.','Toque em Salvar movimentação.','Para corrigir um lançamento, use Editar; para removê-lo, use Excluir.'],
    tips:['Use descrições objetivas, como “Supermercado” ou “Salário de julho”.'],
    warnings:['Excluir uma movimentação altera imediatamente o saldo e os relatórios.']
  },
  {
    id:'financeiro-planejamento', module:'GÊMEO FINANCEIRO', icon:'▥', title:'Como usar orçamento e recorrências?', route:'finance?view=planning',
    summary:'O planejamento permite definir um limite mensal por categoria e cadastrar entradas ou gastos que se repetem todo mês.',
    keywords:['orçamento','limite mensal','categoria','recorrência','conta fixa','gasto fixo','planejamento mensal','projeção'],
    questions:['Como limitar gastos por categoria?','Como cadastrar uma conta fixa?','O valor recorrente altera o saldo automaticamente?'],
    steps:['Abra GÊMEO FINANCEIRO e escolha Planejamento.','Use + Orçamento para definir o limite de uma categoria no mês.','Use + Recorrência para cadastrar salário, aluguel, internet ou outro compromisso mensal.','Acompanhe a porcentagem utilizada e o resultado planejado.'],
    tips:['Cadastre as contas fixas como recorrências e depois registre a movimentação real quando ela for paga ou recebida.'],
    warnings:['A recorrência serve para projeção e não cria automaticamente uma movimentação no saldo.']
  },
  {
    id:'financeiro-metas', module:'GÊMEO FINANCEIRO', icon:'◎', title:'Como criar e acompanhar uma meta financeira?', route:'finance?view=goals',
    summary:'As metas registram o valor desejado, quanto já foi acumulado, prazo opcional e progresso percentual.',
    keywords:['meta financeira','reserva','economizar','juntar dinheiro','objetivo','progresso','prazo'],
    questions:['Como criar uma reserva de emergência?','Como atualizar o valor acumulado?','Quando uma meta é concluída?'],
    steps:['Abra GÊMEO FINANCEIRO e escolha Metas.','Toque em + Nova meta.','Informe nome, valor desejado, valor acumulado e prazo opcional.','Salve a meta.','Use Atualizar sempre que aumentar ou corrigir o valor acumulado.'],
    tips:['Crie metas específicas e mensuráveis, como “Reserva de emergência — R$ 10.000”.'],
    warnings:['O valor acumulado da meta é informativo e não é descontado automaticamente de uma conta.']
  },
  {
    id:'financeiro-contas-categorias', module:'GÊMEO FINANCEIRO', icon:'▣', title:'Como configurar contas e categorias?', route:'finance?view=setup',
    summary:'Contas representam onde o dinheiro está. Categorias organizam o motivo de cada entrada ou gasto.',
    keywords:['conta corrente','carteira','poupança','categoria financeira','criar categoria','saldo inicial','configurar financeiro'],
    questions:['Como adicionar uma conta bancária?','O que é saldo inicial?','Posso criar uma categoria própria?'],
    steps:['Abra GÊMEO FINANCEIRO e escolha Contas e categorias.','Use + Conta para cadastrar conta corrente, carteira, poupança ou outro local.','Informe o saldo existente antes de começar a registrar movimentações.','Use + Categoria para criar classificações personalizadas.'],
    tips:['Evite duplicar contas ou categorias com nomes muito parecidos.'],
    warnings:['Contas e categorias que já estejam em uso não podem ser excluídas até que os registros relacionados sejam removidos ou alterados.']
  },
  {
    id:'oraculo-criar', module:'ORÁCULO', icon:'◈', title:'Como analisar uma decisão no ORÁCULO?', route:'oraculo?action=new',
    summary:'O ORÁCULO compara duas alternativas usando benefício, custo ou esforço, risco, urgência atendida e reversibilidade.',
    keywords:['oráculo','decisão','escolha','comparar','alternativas','vale a pena','comprar','analisar decisão'],
    questions:['Como criar uma decisão?','Como comparar duas opções?','O ORÁCULO decide por mim?'],
    steps:['Abra ORÁCULO.','Toque em + Nova decisão.','Descreva a decisão e o contexto.','Dê um nome para cada alternativa.','Avalie cada critério de 1 a 5.','Adicione observações e toque em Calcular e salvar.','Revise o resultado e registre sua escolha quando decidir.'],
    tips:['Preencha os critérios com calma e considere valores realistas, não apenas a preferência inicial.'],
    warnings:['O resultado é apoio para reflexão, não uma ordem nem garantia de que a alternativa vencedora seja a melhor.']
  },
  {
    id:'oraculo-pontuacao', module:'ORÁCULO', icon:'%', title:'Como funciona a pontuação do ORÁCULO?', route:'oraculo',
    summary:'A fórmula local dá 30% ao benefício, 20% ao baixo custo, 20% ao baixo risco, 15% à urgência atendida e 15% à reversibilidade.',
    keywords:['pontuação','fórmula','peso','benefício','custo','risco','urgência','reversibilidade','advogado do contrário'],
    questions:['O que significa reversibilidade?','Como o ORÁCULO calcula o vencedor?','Para que serve o advogado do contrário?'],
    steps:['Benefício: avalie quanto a opção ajuda.','Custo ou esforço: 1 significa baixo e 5 significa alto.','Risco: 1 significa baixo e 5 significa alto.','Urgência: avalie quanto a opção resolve uma necessidade urgente.','Reversibilidade: 1 significa difícil de desfazer e 5 significa fácil.'],
    tips:['O “Advogado do contrário” lembra você de revisar possíveis vieses antes da escolha final.'],
    warnings:['Uma pontuação alta não substitui informações que ainda estejam faltando.']
  },
  {
    id:'forja-criar', module:'FORJA', icon:'✦', title:'Como criar uma ferramenta na FORJA?', route:'forja?action=new',
    summary:'A FORJA cria mini ferramentas pessoais sem programação, usando os modelos Checklist, Cadastro, Diário ou Rastreador.',
    keywords:['forja','criar ferramenta','checklist','cadastro','diário','rastreador','campos','miniaplicativo'],
    questions:['Como criar um checklist?','Qual modelo devo escolher?','Posso adicionar meus próprios campos?'],
    steps:['Abra FORJA.','Toque em + Criar ferramenta.','Informe nome, modelo, ícone e descrição.','Revise os campos sugeridos.','Adicione, remova ou altere campos.','Salve a ferramenta.','Abra QG para começar a utilizá-la.'],
    tips:['Checklist é ideal para conferências; Cadastro para fichas; Diário para registros sucessivos; Rastreador para valores e evolução.'],
    warnings:['Excluir uma ferramenta também remove todos os registros associados a ela.']
  },
  {
    id:'forja-usar', module:'FORJA', icon:'▦', title:'Como usar uma ferramenta criada na FORJA?', route:'qg',
    summary:'Depois de criada, a ferramenta aparece no QG. Ao abri-la, você preenche os campos e salva registros com data e horário.',
    keywords:['usar ferramenta','ferramenta criada','registro forja','histórico forja','onde aparece checklist'],
    questions:['Onde encontro o checklist que criei?','Como adicionar um registro?','Como ver o histórico da ferramenta?'],
    steps:['Abra QG.','Role até Ferramentas da FORJA.','Toque na ferramenta desejada.','Preencha os campos.','Toque em Salvar registro.','Consulte o histórico na mesma janela.'],
    tips:['Crie ferramentas específicas e simples; isso facilita o uso no celular.'],
    warnings:[]
  },
  {
    id:'guardiao-pin', module:'GUARDIÃO', icon:'⬡', title:'Como funciona o PIN e o bloqueio?', route:'guardiao',
    summary:'O PIN protege o acesso à interface. O GUARDIÃO permite bloquear agora e escolher o tempo de bloqueio automático.',
    keywords:['pin','senha','bloquear','desbloquear','bloqueio automático','segurança','código'],
    questions:['Como bloquear o aplicativo?','Como alterar o tempo de bloqueio?','O PIN criptografa os dados?'],
    steps:['Para bloquear imediatamente, toque no símbolo de bloqueio no topo.','Para alterar o tempo automático, abra GUARDIÃO.','Escolha o número de minutos e salve.','Ao retornar, digite o PIN criado na configuração inicial.'],
    tips:['Use um PIN que você consiga lembrar, mas que não seja óbvio para outras pessoas.'],
    warnings:['Nesta versão, o PIN bloqueia a interface, mas não criptografa individualmente todos os registros do banco.']
  },
  {
    id:'guardiao-backup', module:'GUARDIÃO', icon:'⇩', title:'Como criar um backup?', route:'guardiao',
    summary:'O backup exporta os dados do aplicativo para um arquivo JSON que pode ser guardado no celular, computador ou nuvem.',
    keywords:['backup','exportar','salvar dados','arquivo json','cópia de segurança','guardar dados'],
    questions:['Como fazer backup?','A chave do Gemini vai no backup?','Onde devo guardar o arquivo?'],
    steps:['Abra GUARDIÃO.','Toque em Exportar backup.','Escolha onde salvar o arquivo.','Guarde uma cópia em local seguro.'],
    tips:['Faça backup antes de atualizações importantes e depois de cadastrar informações relevantes.'],
    warnings:['A chave API do Gemini é excluída do backup por segurança.']
  },
  {
    id:'guardiao-restaurar', module:'GUARDIÃO', icon:'⇧', title:'Como restaurar um backup?', route:'guardiao',
    summary:'A restauração importa um arquivo JSON válido do Assistente Pessoal VIP e substitui os dados atuais do navegador.',
    keywords:['restaurar','importar backup','recuperar dados','arquivo json','substituir dados'],
    questions:['Como recuperar meus dados?','A restauração apaga os dados atuais?','Qual arquivo devo escolher?'],
    steps:['Abra GUARDIÃO.','Toque em Restaurar backup.','Selecione o arquivo JSON exportado anteriormente.','Leia o aviso e confirme.','Aguarde o aplicativo recarregar.'],
    tips:['Antes de restaurar, exporte um backup do estado atual caso queira voltar atrás.'],
    warnings:['A restauração substitui os dados atuais pelos dados do arquivo selecionado.']
  },
  {
    id:'guardiao-apagar', module:'GUARDIÃO', icon:'×', title:'Como apagar todos os dados do aplicativo?', route:'guardiao',
    summary:'O GUARDIÃO possui uma ação de redefinição que remove os dados locais e retorna à configuração inicial.',
    keywords:['apagar tudo','excluir dados','resetar','redefinir','começar do zero','limpar aplicativo'],
    questions:['Como começar do zero?','Posso apagar todas as informações?','O que acontece depois da redefinição?'],
    steps:['Crie um backup, se desejar preservar os dados.','Abra GUARDIÃO.','Toque na opção de apagar todos os dados.','Confirme somente depois de ler o aviso.','O aplicativo será recarregado e voltará à configuração inicial.'],
    tips:[],
    warnings:['Essa ação é permanente no navegador atual.']
  },
  {
    id:'configuracoes-perfil', module:'CONFIGURAÇÕES', icon:'⚙', title:'Como alterar perfil, modo, tema e tamanho do texto?', route:'configuracoes',
    summary:'CONFIGURAÇÕES personaliza o nome exibido, o modo inicial, o tema e o tamanho das letras.',
    keywords:['configurações','nome','perfil','tema','modo escuro','modo claro','tamanho da letra','fonte'],
    questions:['Como ativar o modo escuro?','Como aumentar as letras?','Como mudar meu nome no aplicativo?'],
    steps:['Abra CONFIGURAÇÕES.','Altere o nome ou modo inicial, se necessário.','Escolha tema Escuro, Claro ou Automático.','Escolha texto Compacto, Normal ou Ampliado.','Toque em Salvar configurações.'],
    tips:['O botão de meia-lua no topo alterna rapidamente entre tema claro e escuro.'],
    warnings:[]
  },
  {
    id:'gemini-configurar', module:'GOOGLE GEMINI', icon:'✧', title:'Como configurar e testar o Gemini?', route:'configuracoes',
    summary:'A integração Gemini usa a chave salva localmente e o modelo digitado para ampliar as respostas do VIP GUIA.',
    keywords:['gemini','api','chave api','modelo','testar conexão','google ai studio','inteligência artificial','ia'],
    questions:['Onde coloco a chave API?','Qual modelo devo escrever?','Como saber se a conexão funcionou?'],
    steps:['Abra CONFIGURAÇÕES.','Localize Inteligência Artificial · Google Gemini.','Mantenha a integração ativada.','Digite o identificador do modelo, por exemplo gemini-3.5-flash.','Cole a chave API.','Toque em Testar conexão.','Aguarde a mensagem Conexão confirmada e salve as configurações.'],
    tips:['Use uma chave exclusiva para o aplicativo e confira o modelo disponível para sua conta.'],
    warnings:['A chave fica no IndexedDB do navegador. Por ser uma PWA cliente, esse método é menos seguro que uma ponte de servidor.']
  },
  {
    id:'gemini-erros', module:'GOOGLE GEMINI', icon:'!', title:'Como resolver erros de conexão com o Gemini?', route:'configuracoes',
    summary:'O teste diferencia chave inválida, permissão negada, modelo inexistente, cota atingida, indisponibilidade do serviço e falta de internet.',
    keywords:['erro gemini','chave inválida','modelo não encontrado','cota','429','401','403','404','sem conexão','api não conecta'],
    questions:['Por que a chave não foi aceita?','O que significa modelo não encontrado?','O que fazer quando a cota acaba?'],
    steps:['Confirme que o aparelho está conectado à internet.','Copie novamente a chave no Google AI Studio.','Confira o nome exato do modelo.','Toque em Testar conexão.','Leia a mensagem detalhada exibida.','Se houver cota excedida, aguarde a renovação ou verifique o plano do projeto.'],
    tips:['Chaves novas do Google AI Studio são preferíveis e devem ser tratadas como senha.'],
    warnings:['Nunca publique sua chave nos arquivos do GitHub.']
  },
  {
    id:'pwa-instalar', module:'INSTALAÇÃO E OFFLINE', icon:'▣', title:'Como instalar e usar o aplicativo no celular?', route:'agora',
    summary:'O aplicativo é uma PWA. Depois de publicado no GitHub Pages, pode ser instalado pela opção “Adicionar à tela inicial” ou “Instalar aplicativo” do navegador.',
    keywords:['instalar','pwa','tela inicial','celular','github pages','offline','sem internet','atalho'],
    questions:['Como instalar no Android?','O aplicativo funciona sem internet?','Por que ainda aparece a versão antiga?'],
    steps:['Abra o endereço do GitHub Pages no Chrome.','Abra o menu do navegador.','Escolha Instalar aplicativo ou Adicionar à tela inicial.','Confirme.','Abra pelo novo ícone.'],
    tips:['A interface e as funções locais funcionam offline depois que os arquivos são armazenados pelo navegador.'],
    warnings:['O Gemini exige internet. Após uma atualização, pode ser necessário fechar, atualizar a página ou reinstalar a PWA para renovar o cache.']
  },
  {
    id:'privacidade', module:'PRIVACIDADE', icon:'◉', title:'Onde meus dados ficam armazenados?', route:'guardiao',
    summary:'Memórias, decisões, ferramentas, registros, configurações e histórico do VIP GUIA ficam no IndexedDB do navegador usado.',
    keywords:['privacidade','dados','onde fica','indexeddb','github','nuvem','servidor','segurança'],
    questions:['Meus dados ficam no GitHub?','O aplicativo envia tudo para o Gemini?','O que acontece se eu limpar o navegador?'],
    steps:['Use o GUARDIÃO para exportar backups.','Evite limpar os dados do navegador sem uma cópia.','Ao usar o VIP GUIA com IA, apenas a pergunta e trechos do manual são enviados ao Gemini.'],
    tips:['Guarde backups em mais de um local seguro.'],
    warnings:['Limpar os dados do site ou trocar de aparelho sem restaurar backup pode remover os registros locais.']
  },
  {
    id:'vip-guia', module:'VIP GUIA', icon:'?', title:'Como usar o VIP GUIA?', route:'guia',
    summary:'O VIP GUIA é o manual interativo. Ele pesquisa o manual offline e, quando o Gemini está conectado, pode reformular a resposta com linguagem mais natural e contextual.',
    keywords:['vip guia','manual','ajuda','dúvida','pergunta','como usar','tutorial','explicar tela'],
    questions:['Como fazer uma pergunta ao manual?','O manual funciona offline?','Como usar a resposta com IA?'],
    steps:['Abra VIP GUIA pelo botão ? no topo ou pelo QG.','Digite sua dúvida.','Escolha Automático, Somente offline ou Preferir Gemini.','Toque em Perguntar.','Use o botão Abrir função para ir diretamente ao módulo indicado.'],
    tips:['Faça perguntas objetivas, como “Como criar um checklist?” ou “Por que o Gemini não conectou?”.'],
    warnings:['O Gemini é instruído a responder somente com base no manual oficial, mas respostas de IA ainda devem ser conferidas.']
  }
];

export const MANUAL_ENTRIES = Object.freeze(entries);
export const MANUAL_CATEGORIES = Object.freeze([
  ['agora-prioridades','AGORA'],['qg-central','QG'],['financeiro-visao-geral','FINANCEIRO'],['memoria-criar','MEMÓRIA'],['oraculo-criar','ORÁCULO'],
  ['forja-criar','FORJA'],['guardiao-backup','GUARDIÃO'],['configuracoes-perfil','CONFIGURAÇÕES'],['gemini-configurar','GEMINI'],['vip-guia','VIP GUIA']
]);

export function normalizeManualText(value=''){
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

export function findManualEntries(query,limit=5){
  const normalized=normalizeManualText(query);
  if(!normalized)return MANUAL_ENTRIES.slice(0,limit);
  const tokens=[...new Set(normalized.split(/\s+/).filter(t=>t.length>2))];
  return MANUAL_ENTRIES.map(entry=>{
    const title=normalizeManualText(entry.title);
    const module=normalizeManualText(entry.module);
    const keywords=(entry.keywords||[]).map(normalizeManualText);
    const haystack=normalizeManualText([entry.title,entry.module,entry.summary,...entry.questions,...entry.steps,...entry.tips,...entry.warnings,...entry.keywords].join(' '));
    let score=0;
    if(title.includes(normalized))score+=30;
    if(module===normalized||normalized.includes(module))score+=18;
    for(const keyword of keywords){if(normalized.includes(keyword)||keyword.includes(normalized))score+=12;}
    for(const token of tokens){if(title.includes(token))score+=6;if(module.includes(token))score+=5;if(keywords.some(k=>k.includes(token)))score+=4;if(haystack.includes(token))score+=1;}
    return {entry,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.entry);
}

export function manualContext(entriesToUse=MANUAL_ENTRIES.slice(0,5)){
  return entriesToUse.map(entry=>[
    `FUNÇÃO: ${entry.title}`,
    `MÓDULO: ${entry.module}`,
    `RESUMO: ${entry.summary}`,
    `PASSOS: ${entry.steps.map((step,index)=>`${index+1}. ${step}`).join(' ')}`,
    entry.tips.length?`DICAS: ${entry.tips.join(' ')}`:'',
    entry.warnings.length?`LIMITES/AVISOS: ${entry.warnings.join(' ')}`:'',
    `ROTA INTERNA: ${entry.route}`
  ].filter(Boolean).join('\n')).join('\n\n---\n\n');
}

export function getManualEntry(id){return MANUAL_ENTRIES.find(entry=>entry.id===id)||null;}
