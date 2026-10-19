# Auditoria da substituicao dos componentes antigos

Status: **incompleta; componentes novos nao aprovados como substitutos integrais**.

A meta e reescrever os comportamentos na arquitetura EasyComponents sobre AngularJS 1.x, sem depender do bundle do motor antigo. Preservar os fontes antigos dentro de outro bundle nao atende a essa meta.

O inventario estatico corrigido identifica 1.466 candidatos de API em 23 arquivos: 686 metodos e 780 propriedades. A correcao inclui atribuicoes individuais ao prototype, o alias `self`, objetos aninhados (`epcAvulso`, `digital`, `XhrPromise`) e objetos dentro de arrays. Esses numeros sao uma base de auditoria, nao uma prova de cobertura completa: nomes computados, aliases e mutacoes dinamicas exigem analise em execucao.

## Diferencas comprovadas

| Origem / destino | Lacunas de substituicao |
| --- | --- |
| TabelaJS / gc-data-grid | Implementados filtros, ordenacao, marcacao, totais, agrupamento em estado, navegacao, exportacao CSV/TXT/HTML, configuracao de colunas, persistencia e carregamento por adaptador. Ainda faltam variantes completas de celulas/accordion, renderizacao de grupos, todos os menus/atalhos e integracoes de PDF, email e impressao. |
| Consulta / gc-lookup | Implementados payload remoto, parametros dependentes, cache em memoria, paginação, selecao/limpeza, teclado e descarte de respostas antigas. Ainda faltam paridade de subfiltros, vinculo de usuario, historico de URL e variacoes de layout Bootstrap 4/5. |
| FactoryDefault / GcCrudStore | `getNew` implementa inclusao, edicao, copia, backup/cancelamento, consulta/gravar/excluir, confirmacoes e hooks. Ainda faltam fluxos completos de itens, selecao multipla, operacoes em lote, SSE e todos os detalhes de merge/modal. O store `create` anterior foi preservado. |
| Confirmacao / gc-confirm-dialog | A implementacao inicial tinha somente dois botoes fixos. A fila declarativa adiciona botoes configuraveis, `add`, `closeAll`, callbacks, espera, fechamento e visibilidade. Ainda faltam equivalencia de HTML dinamico, layout especial, manipulacao de foco/global de hotkeys e contratos antigos de geracao/compilacao de HTML. |
| Arquivos | Implementados contratos de listagem, preparacao de upload, gravacao, fila de exclusao, backup/restauracao e tokens. Camera, editor, QR completo, impressao e email ainda exigem migracao. Os tres fluxos nao estao certificados como equivalentes. |
| Importacao | Implementados CSV com multiplas linhas e aspas, mapeamento de campos obrigatorios e protecao contra leituras antigas. Ainda faltam todas as etapas/validacoes personalizadas do importador original. |
| Historico e fluxo | Implementadas requisicoes com os endpoints originais e apresentacao declarativa de tarefas/credenciais. Ainda faltam todas as regras de painel, scripts isolados, foco e integracao com telas. |
| Dispositivos / RFID / voz / velocidade | Implementados os 21 metodos principais de Devices, contratos de balanca e digitais, entrada manual de EPC, comandos de voz e sequencia de velocidade com cancelamento. Leitores RFID Itag/Votu, camera, hardware real, escolhas de impressora e inicio do servidor ainda exigem integracao/validacao. |

## Evidencias existentes e seus limites

- `npm test`: verifica a biblioteca EasyComponents, nao a equivalencia das regras de negocio antigas.
- `npm run components:check:legacy`: valida estrutura dos componentes e ausencia de determinados padroes legados; nao mede paridade.
- `npm run test:confirmation`: compara o original e a fila nova para ordem/mutacao dos botoes, callbacks, substituicao de modelo, valores padrao e contagem regressiva. Tambem verifica cancelamento de timers, visibilidade e erros. DOM e dependencias sao simulados nesse teste.
- `npm run test:confirmation:browser` (Node 22+): monta o componente em Chrome/Edge real, clica no botao, verifica callback e remocao do dialogo, e rejeita excecoes AngularJS.
- `npm run test:migration:native`: compara 14 comandos com Devices original e testa respostas de dispositivos, CSV, payload/paginacao/corridas de consulta, tabela, CRUD, arquivos/URLs, fluxo, conferencia EPC, voz e velocidade com transportes controlados.
- `npm run test:migration:browser` (Node 22+): exercita os cenarios do laboratorio em Chrome/Edge, verifica erro simulado, ausencia de motor antigo/requisicoes externas e ausencia de overflow nas abas em celular.
- `npm run test:legacy`: testa a demonstracao em navegador, incluindo montagem/callback/fechamento da fila nova. O contrato antigo inspeciona nomes de Consulta e Tabela; isso nao prova todos os comportamentos dessas APIs.
- `npm run legacy:compatibility:check`: falha enquanto nao houver comprovacao integral. Nao usar o sucesso do build como aprovacao para substituir os componentes.

`compatibility-audit.generated.json` registra candidatos por arquivo, linha, tipo, dependencias injetadas e hash do fonte. O status `nao-validado` evita confundir existencia com equivalencia. O arquivo e regenerado; nao editar como registro manual de aprovacoes.

Cada comportamento deve ter cenarios diferenciais para entradas, defaults, mutacoes, retornos, promises, callbacks, eventos, erros, DOM, estilos e descarte de recursos. Integracoes precisam de contratos/respostas representativas do backend, diretivas/filtros/plugins do projeto consumidor e testes dos dispositivos aplicaveis. `old_componentes/functions.js` e `old_componentes/css` tambem precisam de auditoria; nao estao incluidos na contagem de API acima.

Nao ha percentual confiavel de conclusao funcional neste momento. Os testes aprovados acima nao autorizam substituir os componentes antigos em todas as telas.

## Conversao direta da tabela

O [mapa especifico de TabelaJS](TABLE-CONVERSION.generated.md) e gerado por `npm run legacy:table:audit` a partir do objeto `default_table` integral, incluindo membros aninhados. O mapa preserva linhas e hashes de cada declaracao. `--require-complete` rejeita a conversao incompleta. Nomes presentes na implementacao continuam sem aprovacao integral; membros dinamicos criados por metodos nao estao todos contabilizados nesse mapa.

Foram restaurados 105 valores iniciais, assinaturas e comportamentos de `format(valor,campo,item)`, `number_format`, `isValid`, `next`, `previous`, `nextReg`, `previousReg`, `first`, `last`, `MergeDados(origem,dados,agrup)`, `setChangeCheck(check)` e `setVisible()` sem argumentos. Operacoes novas usam `formatCell`, `setRowChecked` e `setColumnVisible`; o overload anterior de `setVisible(campo,visible,id)` permanece disponivel. `removeColunas` agora remove declaracoes em vez de apenas ocultar.

A fase de dados de `merge` segue as regras originais de conversao numerica, substituicao/concatenacao, fim de pagina, operacao de gravacao, links derivados, modelo associado e callback agendado. Nao equivale a toda a funcao original, que tambem gerava iframes, HTML para impressao e modo html_speed. Checklist conserva ITENS_MARCADOS e hooks. A temporizacao da aplicacao e feita por `$timeout` injetado e descartada na destruicao.

O renderer passou a distinguir BTN/BTN2/BTN3/BTN4 e botoes semanticos, status/status2, cores/gradientes, links, HTML nao compilado e entrada numerica. HTMLCP mostra uma indicacao explicita de conversao pendente. A entrada numerica ainda nao reproduz o plugin `ng-number-format`, e HTML dinamico nao inicializa os antigos plugins Bootstrap. Esses casos nao estao aprovados como equivalentes.

`test/table-direct-conversion.test.js` executa corpos originais somente como oraculo de teste: compara defaults, 1492 casos de formatacao/navegacao/toggle, estado do merge por paginas, callback, checklist, MergeDados e setVisible. O teste de navegador do laboratorio verifica botoes, HTML, cores, status2, link, foco, visualizacao e callback de edicao. O modo headless mantem o documento em foco para testar eventos reais. A cobertura desses cenarios nao representa os 146 metodos completos.

Persistem lacunas em agrupamentos/accordion, HTMLCP/contexto do consumidor, totalizadores avancados e assinaturas que ainda divergem, reordenacao/redimensionamento completo, preferencias, impressao/PDF/XLS/email, atalhos e integracoes. Em particular, a atual implementacao de `OrderTabela` e `TotalTabela` ainda nao equivale ao original integral. A interface de fabrica `new TabelaJS().getNew()` ainda nao foi substituida integralmente. O limite de gzip do build nativo foi ajustado de 40 kB para 48 kB para comportar os contratos restaurados; nao usar o tamanho ou o sucesso do build como prova de compatibilidade.

## Laboratorio local

Execute `powershell -ExecutionPolicy Bypass -File .\testar-componentes.ps1` na raiz do repositorio. O script usa Node 22+ ja instalado (inclusive pelo NVM), compila a demonstracao e abre um servidor em `http://127.0.0.1:4173/legacy-migration/lab.html`. Alternativa com Node moderno no PATH: `npm run demo:lab`.

`C:\xampp\htdocs` foi consultado somente para leitura. O laboratorio fica neste repositorio, usa dados sinteticos e substitui `GcApi` por um backend em memoria somente no modulo do laboratorio. Os componentes normais continuam aceitando a API real; `GcApi` usa `$ajax` quando disponivel para preservar a infraestrutura HTTP do consumidor.
