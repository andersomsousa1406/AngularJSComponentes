# Migracao dos componentes antigos

Esta pasta recebe a nova implementacao dos arquivos de `old_componentes`. Os originais nao sao alterados e continuam servindo como referencia durante a validacao funcional.

**A migracao ainda nao possui paridade integral aprovada.** Veja [a auditoria atualizada](parity/MIGRATION-AUDIT.md) para funcionalidades implementadas, testes e lacunas.

## Pagina para testar

Na raiz do projeto, execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\testar-componentes.ps1
```

Acesse `http://127.0.0.1:4173/legacy-migration/lab.html`. O script seleciona Node 22+ instalado sem alterar o Node global. Com Node moderno no PATH, tambem pode usar `npm run demo:lab`.

O laboratorio tem abas para todos os componentes de interface e testes de servicos, respostas em memoria, eventos e inspecao dos payloads. Nenhuma requisicao de componente e enviada ao GCWeb. A pasta `C:\xampp\htdocs` nao e alterada.

O build normal gera somente os componentes novos, a demonstracao e o laboratorio. Para regenerar o bundle antigo opcional, use `npm run build:legacy:compat`.

## Estrategia

- UI vira componente declarativo com `EasyComponents.defineComponent`.
- HTML e CSS ficam ao lado do JavaScript para permitir navegacao e autocomplete no VS Code.
- As classes usadas nos templates continuam compativeis com Bootstrap 3.
- Acesso a AJAX, impressoras, RFID e reconhecimento de voz permanece em servicos injetaveis; esses recursos nao devem manipular ou compilar HTML.
- Variacoes Bootstrap 4/5 e arquivos duplicados nao geram componentes repetidos.

## Mapeamento

| Origem | Destino | Tipo | Estado |
| --- | --- | --- | --- |
| `Confirmacao.js` | `gc-confirm-dialog` | componente | nucleo convertido |
| `InputJS.js` | `gc-smart-input` | componente | nucleo convertido |
| `Consulta.js`, `ConsultaBootstrap4.js`, `ConsultaBootstrap5.js` | `gc-lookup` | componente BS3 unico | nucleo convertido; regras de backend pendentes |
| `ConsultaMultipla.js` | `gc-multi-lookup` | componente | nucleo convertido |
| `TabelaJS.js`, `TabelaHTML.js`, `comp.js`, `comp2.js` | `gc-data-grid` | componente unico | nucleo convertido; recursos avancados pendentes |
| `Arquivos.js`, `ArquivosGC.js`, `ArquivosJS.js` | `gc-file-manager` | componente unico | nucleo convertido; persistencia pendente |
| `Historico.js` | `gc-history-panel` | componente | nucleo convertido; consulta real pendente |
| `FluxoOperacional.js` | `gc-operation-flow` | componente | nucleo convertido; execucao real pendente |
| `ImportarArquivos.js` | `gc-file-import` | componente | nucleo convertido; mapeamento do backend pendente |
| `FactoryDefault.js`, `ControllerService.js` | `GcCrudStore`, `GcControllerActions`, `GcApi` | servico | contrato-base convertido |
| `Devices.js`, `DevicesRequest.js`, `RFID.js` | `GcDeviceBridge`, `GcRfid` | servico | contrato-base convertido; endpoints devem ser configurados |
| `SpeechRecognition.js`, `TesteSpeed.js` | `GcSpeech`, `GcSpeedTest` | servico | contrato-base convertido |
| `functions.js` | dependencias legadas auditadas separadamente | bundle/vendor | fora da camada de UI |

## Contrato adotado

Dados entram por props com binding de uma via (`<`) e acoes saem por eventos (`&`). Nenhum componente procura `#main`, cria escopo filho manualmente ou chama `$compile`. O controlador do template e sempre `vm`.

Exemplo de uso:

```html
<gc-lookup
  label="Cliente"
  items="vm.clientes"
  columns="vm.colunasCliente"
  on-select="vm.selecionarCliente($event)">
</gc-lookup>
```

O projeto consumidor deve carregar o CSS do Bootstrap 3 antes do bundle da aplicacao. Os estilos especificos de cada componente sao incorporados pelo build do Easy Components.

## Servicos

Os servicos ficam em `services/` e sao funcoes normais de registro aceitas pelo mesmo catalogo dos componentes. Eles nao criam DOM e podem ser injetados pela API declarativa:

```js
export default EasyComponents.defineComponent('device-status', {
  inject: { devices: 'GcDeviceBridge' },
  methods: {
    test: function () { return this.devices.health(); }
  },
  template: '<button ng-click="vm.test()">Testar</button>'
});
```

Antes de usar dispositivos em producao, ajuste `GcDeviceConfig` para os enderecos do ambiente. Operacoes especificas que existiam no backend antigo devem chamar `GcDeviceBridge.command(nome, parametros)`; os componentes nao conhecem URLs nem protocolos.

## Modo de compatibilidade integral

O comando opcional `npm run build:legacy:compat` gera `dist/legacy-engine.bundle.js`. Esse bundle registra os 21 factories originais no modulo `gcLegacyEngine`; nao representa a reescrita solicitada e nao e carregado pelo laboratorio. Seu uso nao comprova equivalencia dos novos componentes. Para usar o hospedeiro antigo, carregue-o antes do bundle da aplicacao:

```html
<script src="angular.js"></script>
<script src="angularjs-easy-components.js"></script>
<script src="legacy-engine.bundle.js"></script>
<script src="app.bundle.js"></script>
```

Qualquer motor antigo pode ser hospedado por uma tag declarativa:

```html
<gc-legacy-host
  factory="TabelaJS"
  config="vm.configuracaoTabela"
  on-ready="vm.tabelaPronta($event)">
</gc-legacy-host>
```

Para consulta, use `factory="$consulta"`; para o campo antigo, `factory="InputJS"`. O hospedeiro cria a instancia, preserva propriedades e metodos, chama `compile()` no momento correto e destroi escopos, elementos compilados e timers ao sair. O projeto consumidor ainda precisa fornecer as dependencias usadas pelo codigo original (`$ajax`, `gScope`, `gcCollection`, filtros e diretivas do GCWeb, jQuery e plugins correspondentes).

## O que ainda exige paridade funcional

Esta primeira conversao cobre a estrutura moderna e o comportamento comum demonstravel sem o backend. `TabelaJS.js`, por exemplo, possui milhares de linhas com regras especificas de agrupamento, impressao, exportacao e paginacao remota; essas regras nao foram consideradas automaticamente equivalentes ao grid novo. O checklist detalhado fica na Fase 6 do `ROADMAP.md` e deve ser concluido usando telas e respostas reais do GCWeb.

## Executar

```bash
npm run demo:legacy
```

Validacao automatica:

```bash
npm run components:check:legacy
npm run build:legacy
npm run test:legacy
```
