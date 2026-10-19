import template from './g-file-upload.html';
import styles from './g-file-upload.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-file-upload', {
  props: { files: EasyComponents.array(() => []), label: EasyComponents.text('Anexos'), accept: EasyComponents.text(''), multiple: EasyComponents.boolean(true), maxFiles: EasyComponents.number(5), maxSizeMb: EasyComponents.number(10), isDisabled: EasyComponents.boolean(false), onChange: EasyComponents.event(), onReject: EasyComponents.event() },
  state: function () { return { uid: 'g-file-' + ++sequence, errors: [], dragging: false }; },
  methods: {
    add: function (files) {
      if (this.isDisabled) return;
      const result = this.multiple ? this.files.slice() : [], rejected = [], accepted = this.accept.toLowerCase().split(',').map(value => value.trim()).filter(Boolean);
      Array.from(files).forEach(file => {
        const typeAllowed = !accepted.length || accepted.some(type => type[0] === '.' ? file.name.toLowerCase().endsWith(type) : type.endsWith('/*') ? file.type.toLowerCase().startsWith(type.slice(0, -1)) : file.type.toLowerCase() === type);
        const duplicate = result.some(item => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified);
        let error = !typeAllowed ? 'Tipo de arquivo não permitido.' : file.size > this.maxSizeMb * 1024 * 1024 ? 'O arquivo excede ' + this.maxSizeMb + ' MB.' : result.length >= (this.multiple ? Math.max(1, this.maxFiles) : 1) ? 'Limite de arquivos atingido.' : '';
        if (duplicate) return;
        if (error) rejected.push({ file, error }); else result.push(file);
      });
      this.errors = rejected.map(item => item.file.name + ': ' + item.error);
      if (rejected.length) this.$emit('onReject', rejected);
      if (result.length && (this.multiple || result.some(file => Array.from(files).includes(file)))) this.$emit('onChange', result);
    },
    select: function (event) { this.add(event.target.files); event.target.value = ''; },
    drop: function (event) { event.preventDefault(); this.dragging = false; if (event.dataTransfer) this.add(event.dataTransfer.files); },
    remove: function (index) { if (!this.isDisabled) this.$emit('onChange', this.files.filter((file, offset) => offset !== index)); },
    size: function (bytes) { return bytes < 1048576 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB'; }
  }, template, styles, scoped: true
});
