'use strict';

var fs = require('fs');
var path = require('path');
var root = path.resolve(__dirname, '..');
var inventoryPath = path.join(root, 'legacy-migration/parity/legacy-api.generated.json');
var outputPath = path.join(root, 'legacy-migration/parity/parity-report.generated.md');
var inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
var crypto = require('crypto');
var audit = { schemaVersion: 1, complete: false, files: {} };

Object.keys(inventory.files).forEach(function (name) {
  var source = fs.readFileSync(path.join(root, inventory.source, name));
  var file = inventory.files[name];
  audit.files[name] = {
    sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
    factory: file.factory,
    dependencies: file.dependencies || [],
    entries: (file.entries || []).map(function (entry) {
      return { path: entry.path, type: entry.type, line: entry.line, status: 'nao-validado', evidence: [] };
    })
  };
});

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
  'Gerado por `npm run legacy:parity`. **Migracao incompleta: substituicao direta nao aprovada.** O modulo `gcLegacyEngine` carrega codigo original; isso nao demonstra equivalencia dos componentes novos nem valida o hospedeiro.',
  '',
  '- API catalogada: **' + inventory.totals.publicEntries + '** entradas publicas.',
  '- Metodos: **' + inventory.totals.methods + '**.',
  '- Propriedades: **' + inventory.totals.properties + '**.',
  '- Factories originais no bundle de compatibilidade: **21**.',
  '- Inventario estatico de candidatos: nomes iguais nao demonstram comportamento igual; aliases e propriedades dinamicas exigem verificacao em execucao.',
  '- Evidencias por entrada: `compatibility-audit.generated.json`. `nao-validado` significa ausencia de comprovacao, nao necessariamente ausencia de implementacao.',
  '',
  '| Prioridade | Origem | Destino | Metodos | Propriedades | Compatibilidade | Reescrita nativa |',
  '| ---: | --- | --- | ---: | ---: | --- | --- |'
];

groups.forEach(function (group) {
  lines.push('| ' + group.priority + ' | `' + group.sources.join('`, `') + '` | `' + group.target + '` | ' +
    sum(group, 'methods') + ' | ' + sum(group, 'properties') + ' | motor original disponivel; equivalencia nao comprovada | ' + group.native + ' |');
});

lines = lines.concat([
  '',
  '## Regra de conclusao',
  '',
  'Para compatibilidade de 100%, nenhuma API pode ser removida apenas com justificativa. Cada entrada precisa preservar assinatura, valores padrao, mutacoes, retornos, promises, callbacks, eventos, erros e efeitos visuais. Delegacao precisa ser validada no componente consumidor. O motor original disponivel nao garante ausencia de regressao.',
  '',
  'Os testes atuais de contrato inspecionam nomes de Consulta e Tabela na inicializacao, com dependencias simuladas. Eles nao executam todos os metodos nem demonstram a criacao dos campos classificados como tardios. Os demais testes exercitam a demonstracao, nao a equivalencia completa.',
  '',
  '`functions.js`, estilos em `old_componentes/css`, plugins jQuery, filtros/diretivas externos, endpoints e dispositivos tambem fazem parte da validacao de integracao. O inventario desta tabela cobre apenas `old_componentes/componentes`.',
  '',
  '## Proximos blocos',
  '',
  '1. Consulta: requisicao, cache, selecao, teclado, dependencias, subfiltros e scroll infinito.',
  '2. Tabela: tipos de coluna, selecao, filtros, agrupamentos, totais, paginacao, exportacao e impressao.',
  '3. Arquivos e importacao: upload, persistencia, preview e mapeamento de colunas.',
  '4. Historico, fluxo e dispositivos: integrar endpoints e hardware reais.'
]);

fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');
fs.writeFileSync(path.join(path.dirname(outputPath), 'compatibility-audit.generated.json'), JSON.stringify(audit, null, 2) + '\n', 'utf8');
console.log('Relatorio de paridade atualizado: ' + path.relative(root, outputPath));
if (process.argv.indexOf('--require-complete') !== -1) {
  console.error('Migracao incompleta: nao existe comprovacao de compatibilidade de 100%.');
  process.exitCode = 1;
}
