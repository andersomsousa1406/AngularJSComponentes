'use strict';

var fs = require('fs');
var path = require('path');
var root = path.resolve(__dirname, '..');
var inventoryPath = path.join(root, 'legacy-migration/parity/legacy-api.generated.json');
var outputPath = path.join(root, 'legacy-migration/parity/parity-report.generated.md');
var inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

var groups = [
  { sources: ['TabelaJS.js', 'TabelaHTML.js', 'comp.js', 'comp2.js'], target: 'gc-data-grid', native: 'parcial', priority: 1 },
  { sources: ['Consulta.js', 'ConsultaBootstrap4.js', 'ConsultaBootstrap5.js'], target: 'gc-lookup', native: 'parcial', priority: 1 },
  { sources: ['ConsultaMultipla.js'], target: 'gc-multi-lookup', native: 'parcial', priority: 2 },
  { sources: ['InputJS.js'], target: 'gc-smart-input', native: 'parcial', priority: 2 },
  { sources: ['Arquivos.js', 'ArquivosGC.js', 'ArquivosJS.js'], target: 'gc-file-manager', native: 'parcial', priority: 2 },
  { sources: ['Confirmacao.js'], target: 'gc-confirm-dialog', native: 'parcial', priority: 3 },
  { sources: ['ImportarArquivos.js'], target: 'gc-file-import', native: 'parcial', priority: 3 },
  { sources: ['Historico.js'], target: 'gc-history-panel', native: 'parcial', priority: 3 },
  { sources: ['FluxoOperacional.js'], target: 'gc-operation-flow', native: 'parcial', priority: 3 },
  { sources: ['FactoryDefault.js', 'ControllerService.js'], target: 'GcCrudStore / GcControllerActions', native: 'parcial', priority: 4 },
  { sources: ['Devices.js', 'DevicesRequest.js', 'RFID.js'], target: 'GcDeviceBridge / GcRfid', native: 'parcial', priority: 4 },
  { sources: ['SpeechRecognition.js', 'TesteSpeed.js'], target: 'GcSpeech / GcSpeedTest', native: 'parcial', priority: 4 }
];

function sum(group, field) {
  return group.sources.reduce(function (total, name) {
    var file = inventory.files[name];
    return total + (file ? file.counts[field] : 0);
  }, 0);
}

var lines = [
  '# Relatorio de paridade legado',
  '',
  'Gerado por `npm run legacy:parity`. A compatibilidade integral usa o codigo original pelo modulo `gcLegacyEngine`; a coluna nativa indica o andamento da reescrita sem `$compile` e sem jQuery.',
  '',
  '- API catalogada: **' + inventory.totals.publicEntries + '** entradas publicas.',
  '- Metodos: **' + inventory.totals.methods + '**.',
  '- Propriedades: **' + inventory.totals.properties + '**.',
  '- Factories originais no bundle de compatibilidade: **21**.',
  '',
  '| Prioridade | Origem | Destino | Metodos | Propriedades | Compatibilidade | Reescrita nativa |',
  '| ---: | --- | --- | ---: | ---: | --- | --- |'
];

groups.forEach(function (group) {
  lines.push('| ' + group.priority + ' | `' + group.sources.join('`, `') + '` | `' + group.target + '` | ' +
    sum(group, 'methods') + ' | ' + sum(group, 'properties') + ' | preservada pelo motor original | ' + group.native + ' |');
});

lines = lines.concat([
  '',
  '## Regra de conclusao',
  '',
  'Um destino so muda de `parcial` para `completo` depois que cada entrada publica relevante estiver classificada como implementada, delegada ou removida com justificativa, e seus cenarios forem aprovados contra dados reais. A existencia no motor de compatibilidade evita regressao durante esse processo, mas nao conta como reescrita nativa.',
  '',
  '## Proximos blocos',
  '',
  '1. Consulta: requisicao, cache, selecao, teclado, dependencias, subfiltros e scroll infinito.',
  '2. Tabela: tipos de coluna, selecao, filtros, agrupamentos, totais, paginacao, exportacao e impressao.',
  '3. Arquivos e importacao: upload, persistencia, preview e mapeamento de colunas.',
  '4. Historico, fluxo e dispositivos: integrar endpoints e hardware reais.'
]);

fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');
console.log('Relatorio de paridade atualizado: ' + path.relative(root, outputPath));
