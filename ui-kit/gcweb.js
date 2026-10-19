import kit, { components } from './index.js';

// A biblioteca participa do bootstrap existente; nao inicia outra aplicacao.
EasyComponents.createApp({ name: 'gc-ui', components: kit, autoMount: false });
const legacy = angular.module('gc-find');
if (!legacy.requires.includes('gc-ui')) legacy.requires.push('gc-ui');
window.GCWebUI = { module: 'gc-ui', angular: angular, components: components.map(component => component.name) };
