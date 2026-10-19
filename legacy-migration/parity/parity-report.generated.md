# Relatorio de paridade legado

Gerado por `npm run legacy:parity`. **Migracao incompleta: substituicao direta nao aprovada.** O modulo `gcLegacyEngine` carrega codigo original; isso nao demonstra equivalencia dos componentes novos nem valida o hospedeiro.

- API catalogada: **1466** entradas publicas.
- Metodos: **686**.
- Propriedades: **780**.
- Factories originais no bundle de compatibilidade: **21**.
- Inventario estatico de candidatos: nomes iguais nao demonstram comportamento igual; aliases e propriedades dinamicas exigem verificacao em execucao.
- Evidencias por entrada: `compatibility-audit.generated.json`. `nao-validado` significa ausencia de comprovacao, nao necessariamente ausencia de implementacao.

| Prioridade | Origem | Destino | Metodos | Propriedades | Compatibilidade | Reescrita nativa |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | `TabelaJS.js`, `TabelaHTML.js`, `comp.js`, `comp2.js` | `gc-data-grid` | 149 | 143 | motor original disponivel; equivalencia nao comprovada | parcial |
| 1 | `Consulta.js`, `ConsultaBootstrap4.js`, `ConsultaBootstrap5.js` | `gc-lookup` | 160 | 247 | motor original disponivel; equivalencia nao comprovada | parcial |
| 2 | `ConsultaMultipla.js` | `gc-multi-lookup` | 20 | 12 | motor original disponivel; equivalencia nao comprovada | parcial |
| 2 | `InputJS.js` | `gc-smart-input` | 23 | 39 | motor original disponivel; equivalencia nao comprovada | parcial |
| 2 | `Arquivos.js`, `ArquivosGC.js`, `ArquivosJS.js` | `gc-file-manager` | 63 | 68 | motor original disponivel; equivalencia nao comprovada | parcial |
| 3 | `Confirmacao.js` | `gc-confirm-dialog` | 7 | 45 | motor original disponivel; equivalencia nao comprovada | parcial |
| 3 | `ImportarArquivos.js` | `gc-file-import` | 20 | 13 | motor original disponivel; equivalencia nao comprovada | parcial |
| 3 | `Historico.js` | `gc-history-panel` | 4 | 13 | motor original disponivel; equivalencia nao comprovada | parcial |
| 3 | `FluxoOperacional.js` | `gc-operation-flow` | 21 | 29 | motor original disponivel; equivalencia nao comprovada | parcial |
| 4 | `FactoryDefault.js`, `ControllerService.js` | `GcCrudStore / GcControllerActions` | 106 | 78 | motor original disponivel; equivalencia nao comprovada | parcial |
| 4 | `Devices.js`, `DevicesRequest.js`, `RFID.js` | `GcDeviceBridge / GcRfid` | 93 | 81 | motor original disponivel; equivalencia nao comprovada | parcial |
| 4 | `SpeechRecognition.js`, `TesteSpeed.js` | `GcSpeech / GcSpeedTest` | 20 | 12 | motor original disponivel; equivalencia nao comprovada | parcial |

## Regra de conclusao

Para compatibilidade de 100%, nenhuma API pode ser removida apenas com justificativa. Cada entrada precisa preservar assinatura, valores padrao, mutacoes, retornos, promises, callbacks, eventos, erros e efeitos visuais. Delegacao precisa ser validada no componente consumidor. O motor original disponivel nao garante ausencia de regressao.

Os testes atuais de contrato inspecionam nomes de Consulta e Tabela na inicializacao, com dependencias simuladas. Eles nao executam todos os metodos nem demonstram a criacao dos campos classificados como tardios. Os demais testes exercitam a demonstracao, nao a equivalencia completa.

`functions.js`, estilos em `old_componentes/css`, plugins jQuery, filtros/diretivas externos, endpoints e dispositivos tambem fazem parte da validacao de integracao. O inventario desta tabela cobre apenas `old_componentes/componentes`.

## Proximos blocos

1. Consulta: requisicao, cache, selecao, teclado, dependencias, subfiltros e scroll infinito.
2. Tabela: tipos de coluna, selecao, filtros, agrupamentos, totais, paginacao, exportacao e impressao.
3. Arquivos e importacao: upload, persistencia, preview e mapeamento de colunas.
4. Historico, fluxo e dispositivos: integrar endpoints e hardware reais.
