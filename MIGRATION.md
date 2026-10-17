# Guia de migracao

## Migracao gradual da API 0.x

Nao e necessario converter todos os componentes de uma vez. `createApp` aceita descritores novos e funcoes legadas no mesmo catalogo.

Antes:

```js
export default function registerUserCard(app) {
  return app.component('userCard', {
    props: { user: Object, onSave: Function },
    template: template,
    styles: styles
  });
}
```

Depois:

```js
export default EasyComponents.defineComponent('user-card', {
  props: {
    user: EasyComponents.required(EasyComponents.object()),
    onSave: EasyComponents.event()
  },
  template: template,
  styles: styles
});
```

No ponto de entrada, substitua `angular.module(...)`, `use(...)` e a lista manual por:

```js
import components from './components/index.generated.js';

EasyComponents.createApp({ name: 'app', components: components });
```

Execute `npx easy-components sync` para gerar o catalogo. Remova `ng-app` do HTML quando usar o bootstrap automatico.

## Mudancas de ambiente na 1.0

- CLI e build requerem Node.js 18 ou superior.
- O runtime requer AngularJS 1.5 a 1.8 e continua disponivel como script UMD.
- CSS continua global por padrao; habilite `scoped: true` componente por componente.
- CSP com estilos inline requer um nonce em `createApp({ csp: { styleNonce } })`.
- Projetos que controlam o bootstrap podem usar `autoMount: false` e `app.start(element)`.

## Verificacao recomendada

```bash
npm test
npm run components:check
npm run build:example
npm run test:browser
```
