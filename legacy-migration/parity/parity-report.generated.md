# Relatorio de paridade legado

Gerado por `npm run legacy:parity`. A compatibilidade integral usa o codigo original pelo modulo `gcLegacyEngine`; a coluna nativa indica o andamento da reescrita sem `$compile` e sem jQuery.

- API catalogada: **1313** entradas publicas.
- Metodos: **608**.
- Propriedades: **705**.
- Factories originais no bundle de compatibilidade: **21**.

| Prioridade | Origem | Destino | Metodos | Propriedades | Compatibilidade | Reescrita nativa |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | `TabelaJS.js`, `TabelaHTML.js`, `comp.js`, `comp2.js` | `gc-data-grid` | 149 | 117 | preservada pelo motor original | parcial |
| 1 | `Consulta.js`, `ConsultaBootstrap4.js`, `ConsultaBootstrap5.js` | `gc-lookup` | 160 | 247 | preservada pelo motor original | parcial |
| 2 | `ConsultaMultipla.js` | `gc-multi-lookup` | 20 | 12 | preservada pelo motor original | parcial |
| 2 | `InputJS.js` | `gc-smart-input` | 23 | 39 | preservada pelo motor original | parcial |
| 2 | `Arquivos.js`, `ArquivosGC.js`, `ArquivosJS.js` | `gc-file-manager` | 60 | 68 | preservada pelo motor original | parcial |
| 3 | `Confirmacao.js` | `gc-confirm-dialog` | 7 | 45 | preservada pelo motor original | parcial |
| 3 | `ImportarArquivos.js` | `gc-file-import` | 20 | 6 | preservada pelo motor original | parcial |
| 3 | `Historico.js` | `gc-history-panel` | 2 | 13 | preservada pelo motor original | parcial |
| 3 | `FluxoOperacional.js` | `gc-operation-flow` | 15 | 25 | preservada pelo motor original | parcial |
| 4 | `FactoryDefault.js`, `ControllerService.js` | `GcCrudStore / GcControllerActions` | 106 | 78 | preservada pelo motor original | parcial |
| 4 | `Devices.js`, `DevicesRequest.js`, `RFID.js` | `GcDeviceBridge / GcRfid` | 39 | 50 | preservada pelo motor original | parcial |
| 4 | `SpeechRecognition.js`, `TesteSpeed.js` | `GcSpeech / GcSpeedTest` | 7 | 5 | preservada pelo motor original | parcial |

## Regra de conclusao

Um destino so muda de `parcial` para `completo` depois que cada entrada publica relevante estiver classificada como implementada, delegada ou removida com justificativa, e seus cenarios forem aprovados contra dados reais. A existencia no motor de compatibilidade evita regressao durante esse processo, mas nao conta como reescrita nativa.

## Proximos blocos

1. Consulta: requisicao, cache, selecao, teclado, dependencias, subfiltros e scroll infinito.
2. Tabela: tipos de coluna, selecao, filtros, agrupamentos, totais, paginacao, exportacao e impressao.
3. Arquivos e importacao: upload, persistencia, preview e mapeamento de colunas.
4. Historico, fluxo e dispositivos: integrar endpoints e hardware reais.
