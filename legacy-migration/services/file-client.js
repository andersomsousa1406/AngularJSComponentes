export function createFileClient(api, configuration, environment) {
  environment = environment || {};
  var notify = environment.notify || function () {};
  var urls = new Set();
  var sequence = 0;
  var generation = 0;
  var disposed = false;
  var client = {
    variant: 'Arquivos', data: [], data_excluir: [], dadosbackup: [], excluirbackup: [], comentario: '',
    TABELA: '', TABELA_ID: 0, TAML_IMG: 600, TAMA_IMG: 600, TAM_ARQ: 5,
    tamanho_arquivo: 2, allowedExtensions: ['*'], disabled: false, vGravar: false,
    mostrar_nome: true, mostrar_descricao: false, mostrar_ordem: false, habilita_descricao: true, habilita_ordem: true,
    qr_code: '', qr_code_exp: '', loading: false, onFileLoad: function () {}, onFileGravar: function () {}, onFileClear: function () {},
    setData: function (data) { Object.assign(client, data); notify(); },
    backup: function () { client.dadosbackup = client.data.map(function (item) { return Object.assign({}, item); }); client.excluirbackup = client.data_excluir.map(function (item) { return Object.assign({}, item); }); pruneUrls(); },
    restore: function () { client.data = client.dadosbackup.map(function (item) { return Object.assign({}, item); }); client.data_excluir = client.excluirbackup.map(function (item) { return Object.assign({}, item); }); pruneUrls(); notify(); },
    clear: function () { ++generation; client.data = []; client.data_excluir = []; client.loading = false; pruneUrls(); client.onFileClear(); notify(); },
    load: function (files) {
      client.data_excluir = [];
      client.data = files.map(function (file) {
        var extension = file.EXTENSAO || file.TYPE || '';
        var binary = Object.assign({}, file, { $ngfBlobUrl: file.CAMINHO || file.URL });
        return { ID: file.ID, NOME: file.ARQUIVO || file.NOME, TABELA: client.TABELA, TAML_IMG: client.TAML_IMG,
          TAMA_IMG: client.TAMA_IMG, TAM_ARQ: client.TAM_ARQ, TIPO: extension, TYPE: extension.toUpperCase(),
          TAMANHO: file.TAMANHO, CSS: extension, OBSERVACAO: file.OBSERVACAO, SEQUENCIA: file.SEQUENCIA,
          BINARIO: binary, id: file.ID || 'stored-' + (++sequence), name: file.ARQUIVO || file.NOME,
          url: binary.$ngfBlobUrl, type: mime(extension) };
      });
      pruneUrls(); client.onFileLoad(); notify(); return client.data;
    },
    getFiles: function (table, id) {
      if (client.variant !== 'Arquivos') { id = table; table = client.TABELA; }
      var current = generation + 1;
      return operation(function () { return api.post('/api/getFiles', { FILTRO: {}, TABELA: table, TABELA_ID: id }); })
        .then(function (files) { if (!disposed && current === generation) client.load(files); return files; });
    },
    processarArquivo: function (event) { return client.receive(event.target.files); },
    receive: function (files) {
      if (client.disabled) return [];
      var added = [];
      Array.from(files).forEach(function (file) {
        var extension = file.name.split('.').pop().toLowerCase();
        var limit = (client.variant === 'Arquivos' ? client.TAM_ARQ : client.tamanho_arquivo) * 1048576;
        if (file.size > limit) throw new Error(file.name + ' excede o tamanho permitido.');
        if (client.allowedExtensions.indexOf('*') < 0 && !client.allowedExtensions.some(function (value) { return String(value).replace(/^\./, '').toLowerCase() === extension; })) throw new Error('Extensão de arquivo não permitida: ' + extension);
      });
      Array.from(files).forEach(function (file) {
        var url = environment.createObjectURL(file); urls.add(url);
        var extension = file.name.split('.').pop();
        var item = { id: 'local-' + (++sequence), NOME: file.name, name: file.name, TABELA: client.TABELA, TIPO: file.type,
          TYPE: extension.toUpperCase(), TAMANHO: file.size, size: file.size, type: file.type, url: url, raw: file,
          OBSERVACAO: file.name, SEQUENCIA: client.data.length + 1, BINARIO: file };
        client.data.push(item); added.push(item);
      });
      client.vGravar = !!client.data.length; notify(); return added;
    },
    excluirArquivo: function (file) {
      var index = client.data.indexOf(file);
      if (client.disabled || index < 0) return;
      if (file.ID > 0) client.data_excluir.push({ NOME: file.NOME, TABELA: file.TABELA, ID: file.ID });
      client.data.splice(index, 1); client.vGravar = !!client.data.length; pruneUrls(); notify();
    },
    limparFiles: function () { client.data = client.data.filter(function (file) { return file.BINARIO !== undefined; }); },
    setDataFiles: function (data) {
      client.limparFiles();
      Object.assign(data, { ARQUIVOS: client.data.map(function (file) {
        return Object.fromEntries(Object.entries(file).filter(function (entry) { return ['url', 'raw', 'id', 'name', 'type', 'size'].indexOf(entry[0]) < 0; }));
      }), ARQUIVOS_EXCLUIR: client.data_excluir, EXEC_GRAVAR_FILE: true });
      return data;
    },
    gravar: function () {
      var current = generation + 1;
      var data = client.setDataFiles({ FILTRO: {}, TABELA: client.TABELA, TABELA_ID: client.TABELA_ID, TAML_IMG: client.TAML_IMG, TAMA_IMG: client.TAMA_IMG });
      return operation(function () { return api.postFile('/api/gravarGFiles', data); }).then(function (files) {
        if (!disposed && current === generation) { client.load(files); client.onFileGravar(); } return files;
      });
    },
    gerarQrCodeToken: function () {
      return operation(function () { return api.post('/api/gerarTokenArquivos', tokenData(), { progress: false }); }).then(function (response) {
        client.qr_code = response; client.qr_code_exp = new Date(Date.now() + 300000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); notify(); return response;
      });
    },
    removerQrCodeToken: function () {
      return operation(function () { return api.post('/api/limparTokenArquivos', tokenData(), { progress: false }); }).then(function (response) { client.qr_code = ''; client.qr_code_exp = ''; notify(); return response; });
    },
    substituirCaracteresEspeciais: function (value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); },
    removerExtensao: function (name) { var index = name.lastIndexOf('.'); return index > 0 ? name.slice(0, index) : name; },
    destroy: function () { disposed = true; ++generation; urls.forEach(function (url) { environment.revokeObjectURL(url); }); urls.clear(); }
  };
  function tokenData() { return { TABELA: client.TABELA, TABELA_ID: client.TABELA_ID, TAML_IMG: client.TAML_IMG, TAMA_IMG: client.TAMA_IMG }; }
  function pruneUrls() {
    var keep = new Set(client.data.concat(client.dadosbackup).map(function (file) { return file.url; }));
    urls.forEach(function (url) { if (!keep.has(url)) { environment.revokeObjectURL(url); urls.delete(url); } });
  }
  function operation(callback) {
    if (disposed) return Promise.reject(new Error('Arquivos destruido.'));
    var current = ++generation; client.loading = true; notify();
    return Promise.resolve().then(callback).finally(function () { if (!disposed && current === generation) { client.loading = false; notify(); } });
  }
  function mime(extension) {
    var types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf', txt: 'text/plain' };
    return types[String(extension).replace(/^\./, '').toLowerCase()] || 'application/octet-stream';
  }
  Object.assign(client, configuration || {}); return client;
}
