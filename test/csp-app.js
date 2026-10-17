'use strict';

var CspRoot = EasyComponents.defineComponent('csp-root', {
  scoped: true,
  styles: '.message { color: rgb(12, 120, 80); }',
  state: { message: 'CSP ativo' },
  template: '<strong class="message">{{ vm.message }}</strong>'
});

EasyComponents.createApp({
  name: 'cspTestApp',
  csp: { styleNonce: 'easy-components-csp' },
  components: [CspRoot]
});
