# AngularJS Easy Components

Uma camada pequena sobre `module.component()` para escrever componentes AngularJS 1.5+ com uma API mais proxima de Angular moderno e React.

Ela nao substitui o AngularJS nem cria um framework paralelo. O resultado continua sendo um componente AngularJS normal, compativel com templates, injecao de dependencias, transclusao e ferramentas existentes.

## Uso rapido

Carregue o AngularJS e o plugin:

```html
<script src="angular.js"></script>
<script src="angularjs-easy-components.js"></script>
```

Crie o app uma vez e use componentes, sem declarar um controller separado:

```js
import template from './like-button.html';
import styles from './like-button.css';

var app = EasyComponents.app('app');

app
  .component('appRoot', {
    state: { total: 0 },
    methods: {
      changed: function (value) {
        this.$setState({ total: value });
      }
    },
    templateUrl: 'templates/app-root.html',
    styleUrl: 'styles/app-root.css'
  })
  .component('likeButton', {
    props: {
      initial: { type: Number, default: 0 },
      label: { type: String, binding: '@', default: 'Curtidas' },
      onChange: Function
    },

    state: function () {
      return { likes: this.initial };
    },

    computed: {
      summary: function () {
        return this.likes + ' ' + this.label;
      }
    },

    methods: {
      like: function () {
        this.$setState({ likes: this.likes + 1 });
        this.$emit('onChange', this.likes);
      }
    },

    template: template,
    styles: styles
  });
```

`templates/app-root.html`:

```html
<main>
  <like-button
    initial="vm.total"
    label="curtidas"
    on-change="vm.changed($event)">
  </like-button>
</main>
```

`templates/like-button.html`:

```html
<button ng-click="vm.like()">
  {{ vm.summary }}
</button>
```

No HTML principal basta montar a raiz com `<app-root></app-root>`. Dependencias adicionais podem ser passadas como segundo argumento: `EasyComponents.app('app', ['ngRoute'])`.

Para registrar componentes em outro arquivo sem recriar o modulo, use `EasyComponents.use('app').component(...)`.

Uma organizacao recomendada separa claramente o AngularJS dos componentes:

```text
example/
  app.js                         # cria o modulo e importa os componentes
  components/
    app-root/
      app-root.component.js      # estado e comportamento
      app-root.html              # template
      app-root.css               # estilo
    like-button/
      like-button.component.js
      like-button.html
      like-button.css
```

No `app.js` ficam a infraestrutura AngularJS e a lista explicita de imports:

```js
import registerAppRoot from './components/app-root/app-root.component.js';
import registerLikeButton from './components/like-button/like-button.component.js';

angular.module('app', ['ngEasyComponents']);

var app = EasyComponents.use('app');
app.register(registerAppRoot, registerLikeButton);
```

`register(...)` aceita quantas funcoes forem necessarias, inclusive arrays, e devolve o proprio app para permitir encadeamento.

Nos arquivos de componente, a declaracao fica isolada e e exportada:

```js
export default function registerLikeButton(app) {
  return app.component('likeButton', {
    templateUrl: 'components/like-button/like-button.html',
    styleUrl: 'components/like-button/like-button.css'
  });
}
```

O HTML carrega apenas o ponto de entrada:

```html
<script src="angular.js"></script>
<script src="angularjs-easy-components.js"></script>
<script type="module" src="app.js"></script>
```

Com ES Modules, nao use `ng-app` no HTML. O primeiro registro agenda automaticamente um unico bootstrap para o fim da tarefa JavaScript atual e ainda aguarda o DOM ficar pronto. Isso permite que todos os registros sincronos terminem antes de o AngularJS iniciar e evita a condicao de corrida que poderia deixar as tags vazias. `mount(element)` continua disponivel apenas para casos que precisam controlar manualmente o elemento raiz.

## CSS do componente

No codigo-fonte, o CSS e o HTML podem ficar ao lado do componente e ser importados como texto:

```js
import template from './user-card.html';
import styles from './user-card.css';

app.component('userCard', {
  template: template,
  styles: styles
});
```

Tambem e possivel informar varios arquivos ou CSS inline:

```js
styleUrls: ['styles/base-card.css', 'styles/dark-theme.css'],
styles: [
  '.user-card { display: block; }'
]
```

Cada bloco inline e inserido no `<head>` somente uma vez. Como no AngularJS tradicional, esses estilos sao globais; use uma classe raiz do componente, como `.user-card`, para evitar conflitos.

O build usa o loader `text` do esbuild para incorporar os imports de HTML e CSS no bundle. Assim os arquivos continuam separados no projeto, mas nao geram requests individuais no navegador:

```bash
npm run build:example
```

Durante edicoes, use `npm run watch:example` para reconstruir o bundle automaticamente. `npm run demo` executa um build antes de iniciar o servidor.

## Autocomplete no VS Code

O arquivo `html-custom-data.json` descreve as tags e propriedades dos componentes. A configuracao `.vscode/settings.json` o conecta ao HTML Language Service do VS Code, oferecendo autocomplete e texto de ajuda para tags como `<counter-card>` e atributos como `initial` e `on-change`.

Ao criar um componente, adicione sua tag e suas props nesse catálogo. Isso reconhece a estrutura HTML; o VS Code não consegue inferir em tempo real os bindings de um componente AngularJS declarado dinamicamente em JavaScript.

## API

O alias padrao dos componentes nos templates e `vm`. Ele pode ser alterado por componente com `controllerAs`, se necessario.

### `props`

Aceita um construtor como atalho ou uma configuracao completa:

```js
props: {
  user: Object,                         // binding <?
  onSave: Function,                    // binding &?
  title: { type: String, binding: '@' },
  value: { type: Number, required: true },
  theme: { default: 'dark' },
  age: { type: Number, validator: function (age) { return age >= 0; } }
}
```

Bindings sao opcionais por padrao. Use `required: true` para remover `?`. Os modos nativos `<`, `@`, `=`, `&` e aliases do AngularJS sao aceitos em `binding`.

### `state` e `$setState`

`state` pode ser um objeto ou uma funcao. A funcao roda depois que props e defaults foram resolvidos.

```js
state: function () { return { open: false }; }

this.$setState({ open: true });
this.$setState(function () { return { open: !this.open }; });
```

As chaves do estado ficam diretamente no controller para manter os templates curtos: `vm.open`.

### `methods` e `computed`

Metodos sao automaticamente ligados ao componente. Computed values sao getters recalculados pelo ciclo normal de digest do AngularJS.

### Eventos

Props do tipo `Function` usam o binding `&?`. `$emit` entrega o valor como `$event` e `$value`:

```js
this.$emit('onSelect', item);
```

```html
<item-card on-select="vm.select($event)"></item-card>
```

### Valores entre componentes

Use o fluxo nativo do AngularJS: uma prop para descer o valor e um callback para devolver um evento. Nao ha uma API adicional para aprender:

```html
<!-- pai -->
<counter-card
  initial="vm.total"
  on-change="vm.updateTotal($event)">
</counter-card>

<!-- outro filho recebe o valor guardado pelo pai -->
<value-display value="vm.total"></value-display>
```

```js
methods: {
  updateTotal: function (value) {
    this.$setState({ total: value });
  }
}
```

Componentes podem ser aninhados normalmente. O exemplo usa `app-root > counter-card > value-display`.

### Diagnostico no navegador

O componente `performance-lab` da demo executa automaticamente um teste com 3.000 criacoes, 12.000 atualizacoes de bindings e 3.000 destruicoes. Ele mede tempo e vazao, verifica os scopes e nos DOM restantes e, quando o navegador disponibiliza `performance.memory`, mostra a variacao do heap. A variacao de heap e apenas diagnostica porque o coletor de lixo do navegador nao e deterministico; scopes e DOM retidos sao o sinal estrutural usado para aprovar o teste.

O teste automatizado repete o benchmark tres vezes em um Chrome real, forca a coleta de lixo entre rodadas e valida tambem componente aninhado, comunicacao entre irmaos e carregamento de CSS:

```bash
npm run test:browser
```

### Watchers

```js
watch: {
  user: function (current, previous) {},
  settings: {
    deep: true,
    handler: function (current) {}
  },
  customKey: {
    get: function () { return this.first + this.last; },
    handler: function (current) {}
  }
}
```

Todos os watchers sao removidos automaticamente na destruicao do componente.

### Lifecycle hooks

```js
hooks: {
  onInit: function () {},
  onChanges: function (changes) {},
  postLink: function () {},
  onDestroy: function () {}
}
```

As opcoes AngularJS `templateUrl`, `transclude`, `require`, `$canActivate` e `$routeConfig` tambem sao repassadas ao componente nativo. `styleUrl`, `styleUrls` e `styles` sao fornecidos pelo Easy Components.

## Executar

Os testes usam somente Node.js, sem bibliotecas adicionais:

```bash
npm test
```

Para abrir o exemplo, sirva a raiz do projeto por HTTP e visite `/example/`. Uma opcao e:

```bash
npm run demo
```

## Projeto de demonstracao

A rota `/example/` funciona como uma apresentacao completa da biblioteca. Ela inclui:

- landing page responsiva e navegacao acessivel;
- contador com estado, metodos, computed value, evento e transclusao;
- quadro de tarefas composto por componentes pai e filhos;
- seletor de tema usando props e callback;
- feed que demonstra comunicacao entre componentes irmaos;
- exemplos de codigo com abas;
- vitrine com 24 componentes publicos organizados em tabs;
- botoes, badges, alertas, selects e paginacao;
- tabela com busca, filtro, ordenacao e componentes aninhados;
- cards de metricas, produtos, usuarios e listas expansivas;
- formulario reativo, validacao e modal com transclusao;
- laboratorio que cria e destroi 3.000 componentes por rodada;
- templates e estilos incorporados em um unico bundle.

Para reconstruir automaticamente enquanto edita os componentes:

```bash
npm run watch:example
```

## Limites intencionais

- O plugin nao implementa Virtual DOM; ele usa o compilador e o digest do AngularJS.
- A validacao de tipos ajuda durante o desenvolvimento, mas nao substitui validacao de dados de negocio.
- Componentes continuam usando expressoes e diretivas AngularJS no template.
