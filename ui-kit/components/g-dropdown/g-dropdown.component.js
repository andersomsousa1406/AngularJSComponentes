import template from './g-dropdown.html';
import styles from './g-dropdown.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-dropdown', {
  inject: { scope: '$scope', document: '$document', timeout: '$timeout' },
  props: { text: EasyComponents.text('Ações'), icon: EasyComponents.text('chevron'), items: EasyComponents.array(() => []), align: EasyComponents.text('start'), isDisabled: EasyComponents.boolean(false), onSelect: EasyComponents.event() },
  state: function () { return { uid: 'g-menu-' + ++sequence, open: false }; },
  methods: {
    close: function (restoreFocus) { this.open = false; this.timeout.cancel(this._focusTimer); if (restoreFocus) this.$element[0].querySelector('.trigger').focus(); },
    focus: function (last) { this.timeout.cancel(this._focusTimer); this._focusTimer = this.timeout(() => { const items = this.$element[0].querySelectorAll('[role=menuitem]:not(:disabled)'); if (items.length) items[last ? items.length - 1 : 0].focus(); }, 0); },
    toggle: function () { if (!this.isDisabled) { this.open = !this.open; if (this.open) this.focus(false); } },
    select: function (item) { if (this.isDisabled || item.disabled || item.separator) return; this.close(true); this.$emit('onSelect', item); },
    keydown: function (event) {
      if (event.key === 'Escape' && this.open) { event.preventDefault(); event.stopPropagation(); this.close(true); }
      else if (event.key === 'Tab') this.close(false);
      else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        if (!this.open) { if (this.isDisabled) return; this.open = true; this.focus(event.key === 'ArrowUp' || event.key === 'End'); return; }
        const items = Array.from(this.$element[0].querySelectorAll('[role=menuitem]:not(:disabled)')), current = items.indexOf(this.document[0].activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        if (items[next]) items[next].focus();
      }
    }
  },
  hooks: {
    postLink: function () { this._outside = event => { if (this.open && !this.$element[0].contains(event.target)) this.scope.$evalAsync(() => this.close(false)); }; this.document[0].addEventListener('click', this._outside); },
    onChanges: function () { if (this.isDisabled) this.close(false); },
    onDestroy: function () { this.document[0].removeEventListener('click', this._outside); this.timeout.cancel(this._focusTimer); }
  }, template, styles, scoped: true
});
