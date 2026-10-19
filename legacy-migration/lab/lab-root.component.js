import template from './lab-root.html';
import styles from './lab-root.css';
import { createDeviceClient } from '../services/device-client.js';
import { createSpeedClient } from '../services/speed-client.js';

export default EasyComponents.defineComponent('migration-lab', {
  inject: { backend: 'GcLabBackend', crudStore: 'GcCrudStore', speechService: 'GcSpeech', rfidService: 'GcRfid', http: '$http' },
  state: function () {
    return {
      active: 'consulta', message: 'Escolha um cenário para testar.', error: '', events: [], handles: {},
      tabs: [{ id: 'consulta', label: 'Consultas e seleção' }, { id: 'tabela', label: 'Tabela de dados' }, { id: 'confirmacao', label: 'Confirmação' },
        { id: 'crud', label: 'Cadastro e CRUD' }, { id: 'arquivos', label: 'Arquivos' }, { id: 'importacao', label: 'Importação CSV' },
        { id: 'historico', label: 'Histórico' }, { id: 'fluxo', label: 'Fluxo operacional' }, { id: 'servicos', label: 'Dispositivos, RFID e voz' }, { id: 'cobertura', label: 'Auditoria de paridade' }],
      columns: [{ key: 'ID', label: 'Código' }, { key: 'NOME', label: 'Nome' }, { key: 'CIDADE', label: 'Cidade' }, { key: 'VALOR', label: 'Valor' }],
      lookupConfig: { cache: true, option: { consulta_qtd: 2, infinite_scroll: true, obj_ret: ['ID', 'NOME'] } },
      gridConfig: { ID: 'lab-grid', titulo: 'Pessoas do laboratório', total_visible: true, HEIGHT: '260px', input_visible: true,
        filtro_status_v: true, STATUS: '', status_opt_bkp: [{ VALOR: '', DESCRICAO: 'TODOS' }, { VALOR: '1', DESCRICAO: 'ATIVOS' }, { VALOR: '0', DESCRICAO: 'INATIVOS' }],
        COLUNAS: [{ CAMPO: 'ID', DESCRICAO: 'Código', VISIBLE: true, ORDEM: 1 }, { CAMPO: 'NOME', DESCRICAO: 'Nome', VISIBLE: true, ORDEM: 2 },
          { CAMPO: 'CIDADE', DESCRICAO: 'Cidade', VISIBLE: true, ORDEM: 3 }, { CAMPO: 'VALOR', DESCRICAO: 'Valor', VISIBLE: true, TIPO: 'number', DECIMAL: 2, ALIGN: 'right', TOTAL: true, ORDEM: 4 }] },
      fileConfig: { TABELA: 'LAB', TABELA_ID: 1, disabled: false },
      historyArgs: { TABELA: 'LAB', TABELA_ID: 1 }, flowConfig: { ARGS: { TABELA: 'LAB', TABELA_ID: 1 } },
      importFields: [{ CAMPO: 'ID', DESCRICAO: 'Código', OBRIGATORIO: true }, { CAMPO: 'NOME', DESCRICAO: 'Nome', OBRIGATORIO: true }],
      csv: 'ID;NOME\n1;Ana Lima\n2;"Bruno; Reis"', selectedPeople: [], selectedPerson: null,
      command: 'ABRIR MENU 19160', audit: null, auditRows: [], speed: null, epcCode: '123456789012345678901234', busy: false
    };
  },
  hooks: {
    onInit: function () {
      var vm = this;
      vm.crud = vm.crudStore.getNew({ url_consultar: '/lab/cadastro/listar', url_gravar: '/lab/cadastro/gravar', url_excluir: '/lab/cadastro/excluir' }, {
        notify: function () { vm.$setState({ crud: vm.crud }); }, confirm: function (message) { return vm.ask(message); }
      });
      vm.devices = createDeviceClient(vm.backend.request, { onProgress: function (value) { vm.record('Progresso do dispositivo', value); } });
      vm.speech = vm.speechService.create({ commands: [{ COMANDO: 'ABRIR MENU #VAR#', variaveis: 1, FUNCAO: function (values) { vm.record('Comando reconhecido', values); } }], onError: function (error) { vm.fail(error); } });
      vm.epc = vm.rfidService.create({ notify: function () { vm.$setState({ epc: vm.epc }); }, onError: function (error) { vm.fail(error); } }).epcAvulso;
      vm.epc.iniciar({});
      vm.epc.onAddItens = function (items) { vm.record('EPCs confirmados', items); return Promise.resolve(); };
      vm.http.get('parity/legacy-api.generated.json').then(function (response) {
        vm.$setState({ audit: response.data, auditRows: Object.keys(response.data.files).map(function (name) { return { name: name, counts: response.data.files[name].counts }; }) });
      });
    },
    onDestroy: function () { this.crud.destroy(); this.speech.destroy(); if (this.speedTask) this.speedTask.cancel(); }
  },
  methods: {
    capture: function (name, handle) { this.handles[name] = handle; },
    record: function (name, data) {
      this.events.unshift({ name: name, data: data }); if (this.events.length > 20) this.events.length = 20;
      this.$setState({ message: name, events: this.events });
    },
    fail: function (error) { this.$setState({ error: error.message || String(error) }); },
    run: function (callback) {
      var vm = this; vm.$setState({ error: '', busy: true });
      return Promise.resolve().then(callback).then(function (result) { vm.record('Cenário executado', result); return result; })
        .catch(function (error) { vm.fail(error); }).finally(function () { vm.$setState({ busy: false }); });
    },
    ask: function (message) {
      var vm = this;
      return new Promise(function (resolve) {
        vm.handles.confirm.add(1, 'Confirmação', message, [vm.handles.confirm.obtn_sim, vm.handles.confirm.obtn_nao], [function () { resolve(true); }, function () { resolve(false); }]);
      });
    },
    openDialog: function () {
      var vm = this; var button = Object.assign({}, vm.handles.confirm.obtn_ok, { aguardar2: true, TEMPO_AGUARDAR: 4 });
      vm.handles.confirm.add(2, 'Teste de contagem regressiva', 'O botão fica bloqueado durante a espera.', [button, vm.handles.confirm.obtn_cancelar], [function () { vm.record('Confirmação aceita', true); }, function () { vm.record('Confirmação cancelada', false); }]);
    },
    crudList: function () { var vm = this; return vm.run(function () { return vm.crud.consultar(); }); },
    crudSave: function () { var vm = this; return vm.run(function () { return vm.crud.gravar(); }); },
    crudDelete: function () { var vm = this; return vm.run(function () { return vm.crud.excluir(); }); },
    crudCancel: function () { var vm = this; return vm.run(function () { return vm.crud.cancelar(); }); },
    editRecord: function (row) { this.crud.SELECTED = row; this.crud.alterar(); },
    loadFiles: function () { var vm = this; return vm.run(function () { return vm.handles.files.getFiles('LAB', 1); }); },
    saveFiles: function () { var vm = this; return vm.run(function () { return vm.handles.files.gravar(); }); },
    refreshHistory: function () { var vm = this; return vm.run(function () { return vm.handles.history.consultar(0); }); },
    parseCsv: function () { var vm = this; return vm.run(function () { return vm.handles.importer.parseText(vm.csv); }); },
    sendDevice: function () { var vm = this; return vm.run(function () { return vm.devices.imprimirEtiqueta(123); }); },
    runCommand: function () { this.speech.comandoManual(this.command); },
    scanEpc: function () { var vm = this; return vm.run(function () { vm.epc.EPC_SIMPLIFICADO = vm.epcCode; return vm.epc.AvaliarEPC({ key: 'Enter' }); }); },
    runSpeed: function () {
      var vm = this;
      function Xhr() {
        this.open = function (method) { this.method = method; }; this.setRequestHeader = function () {};
        this.send = function () { var xhr = this; xhr.timer = setTimeout(function () { xhr.status = 200; xhr.responseText = 'x'.repeat(10000); xhr.onload(); }, 100); };
        this.abort = function () { clearTimeout(this.timer); this.onabort(); };
      }
      var client = createSpeedClient({ XMLHttpRequest: Xhr, now: Date.now, random: Math.random }, { latencyTestUrl: '/simulado', downloadUrl: '/simulado', uploadUrl: '/simulado', uploadDataMaxSize: 10000 });
      vm.speedTask = client.testSpeed(); return vm.run(function () { return vm.speedTask.then(function (result) { vm.$setState({ speed: result }); return result; }); });
    },
    download: function (event) {
      var url = URL.createObjectURL(new Blob([event.content], { type: event.type }));
      var link = document.createElement('a'); link.href = url; link.download = event.name; link.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      this.record('Exportação gerada', event.name);
    },
    selectTab: function (id) { this.$setState({ active: id, error: '' }); }
  },
  template: template, styles: styles, scoped: true
});
