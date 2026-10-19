import template from './gc-file-manager.html';
import styles from './gc-file-manager.css';
import { createFileClient } from '../../services/file-client.js';

function sizeLabel(bytes) {
  if (!bytes) return '0 B';
  var units = ['B', 'KB', 'MB', 'GB'];
  var index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return (bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0) + ' ' + units[index];
}

export default EasyComponents.defineComponent('gc-file-manager', {
  inject: { api: 'GcApi' },
  props: {
    files: EasyComponents.array(function () { return []; }),
    label: EasyComponents.text('Arquivos'),
    accept: EasyComponents.text('*/*'),
    multiple: EasyComponents.boolean(true),
    disabled: EasyComponents.boolean(false),
    maxSize: EasyComponents.number(0),
    config: EasyComponents.object(null),
    onReady: EasyComponents.event(),
    onError: EasyComponents.event(),
    onAdd: EasyComponents.event(),
    onRemove: EasyComponents.event(),
    onDownload: EasyComponents.event()
  },

  state: function () { return { localFiles: this.files.slice(), preview: null, error: '', fileClient: null, ownedUrls: new Set() }; },

  methods: {
    choose: function () { if (!this.disabled) this.$element[0].querySelector('input[type=file]').click(); },
    receive: function (fileList) {
      if (this.disabled) return;
      if (this.fileClient) {
        try { var result = this.fileClient.receive(this.multiple ? fileList : Array.prototype.slice.call(fileList, 0, 1)); this.$emit('onAdd', this.multiple ? result : result[0]); }
        catch (error) { this.$setState({ error: error.message }); this.$emit('onError', error); }
        return;
      }
      var that = this;
      var source = Array.prototype.slice.call(fileList || []);
      if (!this.multiple) source = source.slice(0, 1);
      var errors = [];
      var added = source.filter(function (file) {
        if (!that.maxSize || file.size <= that.maxSize) return true;
        errors.push(file.name + ' excede o tamanho permitido.');
        return false;
      }).map(function (file) {
        var url = URL.createObjectURL(file); that.ownedUrls.add(url);
        return { id: Date.now() + '-' + Math.random(), name: file.name, size: file.size, type: file.type, raw: file, url: url };
      });
      if (!added.length) { this.$setState({ error: errors.join(' ') }); return; }
      if (!this.multiple) this.localFiles.forEach(function (file) { that.releaseUrl(file); });
      var localFiles = this.multiple ? this.localFiles.concat(added) : [added[0]];
      this.$setState({ localFiles: localFiles, error: errors.join(' ') });
      this.$emit('onAdd', this.multiple ? added : added[0]);
    },
    remove: function (file) {
      if (this.disabled) return;
      if (this.fileClient) { this.fileClient.excluirArquivo(file); this.$emit('onRemove', file); return; }
      this.releaseUrl(file);
      this.$setState({ localFiles: this.localFiles.filter(function (item) { return item !== file; }), preview: this.preview === file ? null : this.preview });
      this.$emit('onRemove', file);
    },
    releaseUrl: function (file) { if (this.ownedUrls.has(file.url)) { URL.revokeObjectURL(file.url); this.ownedUrls.delete(file.url); } },
    open: function (file) { this.$setState({ preview: file }); },
    closePreview: function () { this.$setState({ preview: null }); },
    download: function (file) { this.$emit('onDownload', file); },
    size: sizeLabel,
    identity: function (file) { return file.id || file.ID || file.name || file.NOME; },
    name: function (file) { return file.name || file.NOME; }
  },

  hooks: {
    onInit: function () {
      if (!this.config) return;
      var vm = this;
      vm.fileClient = createFileClient(vm.api, vm.config, { createObjectURL: URL.createObjectURL.bind(URL), revokeObjectURL: URL.revokeObjectURL.bind(URL),
        notify: function () { if (vm.fileClient) vm.$setState({ localFiles: vm.fileClient.data, error: '' }); } });
      vm.$emit('onReady', vm.fileClient);
    },
    postLink: function () {
      var that = this;
      this.fileInput = this.$element[0].querySelector('input[type=file]');
      this.fileChange = function (event) { that.receive(event.target.files); event.target.value = ''; };
      this.fileInput.addEventListener('change', this.fileChange);
    },
    onChanges: function (changes) {
      if (changes.files) {
        var vm = this;
        var files = changes.files.currentValue || [];
        this.localFiles.forEach(function (file) { if (files.indexOf(file) < 0) vm.releaseUrl(file); });
        this.$setState({ localFiles: files.slice() });
      }
    },
    onDestroy: function () {
      if (this.fileInput) this.fileInput.removeEventListener('change', this.fileChange);
      this.ownedUrls.forEach(function (url) { URL.revokeObjectURL(url); }); this.ownedUrls.clear();
      if (this.fileClient) this.fileClient.destroy();
    }
  },

  template: template,
  styles: styles,
  scoped: true
});
