import template from './gc-file-manager.html';
import styles from './gc-file-manager.css';

function sizeLabel(bytes) {
  if (!bytes) return '0 B';
  var units = ['B', 'KB', 'MB', 'GB'];
  var index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return (bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0) + ' ' + units[index];
}

export default EasyComponents.defineComponent('gc-file-manager', {
  props: {
    files: EasyComponents.array(function () { return []; }),
    label: EasyComponents.text('Arquivos'),
    accept: EasyComponents.text('*/*'),
    multiple: EasyComponents.boolean(true),
    disabled: EasyComponents.boolean(false),
    maxSize: EasyComponents.number(0),
    onAdd: EasyComponents.event(),
    onRemove: EasyComponents.event(),
    onDownload: EasyComponents.event()
  },

  state: function () { return { localFiles: this.files.slice(), preview: null, error: '' }; },

  methods: {
    choose: function () { if (!this.disabled) this.$element[0].querySelector('input[type=file]').click(); },
    receive: function (fileList) {
      var that = this;
      var added = Array.prototype.slice.call(fileList || []).filter(function (file) {
        if (!that.maxSize || file.size <= that.maxSize) return true;
        that.$setState({ error: file.name + ' excede o tamanho permitido.' });
        return false;
      }).map(function (file) {
        return { id: Date.now() + '-' + Math.random(), name: file.name, size: file.size, type: file.type, raw: file, url: URL.createObjectURL(file) };
      });
      if (!added.length) return;
      var localFiles = this.multiple ? this.localFiles.concat(added) : [added[0]];
      this.$setState({ localFiles: localFiles, error: '' });
      this.$emit('onAdd', this.multiple ? added : added[0]);
    },
    remove: function (file) {
      if (file.url && file.raw) URL.revokeObjectURL(file.url);
      this.$setState({ localFiles: this.localFiles.filter(function (item) { return item !== file; }), preview: this.preview === file ? null : this.preview });
      this.$emit('onRemove', file);
    },
    open: function (file) { this.$setState({ preview: file }); },
    closePreview: function () { this.$setState({ preview: null }); },
    download: function (file) { this.$emit('onDownload', file); },
    size: sizeLabel,
    identity: function (file) { return file.id || file.ID || file.name || file.NOME; },
    name: function (file) { return file.name || file.NOME; }
  },

  hooks: {
    postLink: function () {
      var that = this;
      this.fileInput = this.$element[0].querySelector('input[type=file]');
      this.fileChange = function (event) { that.receive(event.target.files); event.target.value = ''; };
      this.fileInput.addEventListener('change', this.fileChange);
    },
    onChanges: function (changes) {
      if (changes.files) this.$setState({ localFiles: (changes.files.currentValue || []).slice() });
    },
    onDestroy: function () {
      if (this.fileInput) this.fileInput.removeEventListener('change', this.fileChange);
      this.localFiles.forEach(function (file) { if (file.url && file.raw) URL.revokeObjectURL(file.url); });
    }
  },

  template: template,
  styles: styles,
  scoped: true
});
