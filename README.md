# AngularJS Easy Components

Uma camada pequena sobre `module.component()` para escrever componentes AngularJS 1.5+ com uma API mais proxima de Angular moderno e React.

Ela nao substitui o AngularJS nem cria um framework paralelo. O resultado continua sendo um componente AngularJS normal, compativel com templates, injecao de dependencias, transclusao e ferramentas existentes.

## Uso rapido

Carregue o AngularJS e o plugin:

```html
<script src="angular.js"></script>
<script src="angularjs-easy-components.js"></script>
```

Declare cada componente sem receber ou recriar o modulo AngularJS:

```js
import template from './like-button.html';
import styles from './like-button.css';

export default EasyComponents.defineComponent('like-button', {
  props: {
    initial: EasyComponents.number(0),
    label: EasyComponents.text('Curtidas'),
    onChange: EasyComponents.event()
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

No HTML principal basta montar a raiz com `<app-root></app-root>`. O app importa e registra os componentes em um unico lugar:

```js
import AppRoot from './components/app-root/app-root.component.js';
import LikeButton from './components/like-button/like-button.component.js';

EasyComponents.createApp({
  name: 'app',
  dependencies: ['ngRoute'],
  components: [AppRoot, LikeButton]
});
```

`createApp` cria o modulo, registra tudo e agenda um unico bootstrap para quando o DOM estiver pronto. Para controlar o inicio manualmente, informe `autoMount: false` e chame `app.start(element)`.

Uma organizacao recomendada separa claramente o AngularJS dos componentes:

```text
example/
  app.js                         # configura o app e importa o catalogo
  components/
    index.generated.js           # catalogo automatico de componentes
    app-root/
      app-root.component.js      # estado e comportamento
      app-root.html              # template
      app-root.css               # estilo
    like-button/
      like-button.component.js
      like-button.html
      like-button.css
```

O catalogo de imports e gerado pelo CLI. Assim, o `app.js` possui um unico import mesmo quando o projeto cresce:

```js
import components from './components/index.generated.js';

EasyComponents.createApp({
  name: 'app',
  components: components
});
```

Nos arquivos de componente, a declaracao fica isolada e e exportada. O arquivo nao conhece o app nem o modulo onde sera usado:

```js
export default EasyComponents.defineComponent('like-button', {
  templateUrl: 'components/like-button/like-button.html',
  styleUrl: 'components/like-button/like-button.css'
});
```

O HTML carrega apenas o ponto de entrada:

```html
<script src="angular.js"></script>
<script src="angularjs-easy-components.js"></script>
<script type="module" src="app.js"></script>
```

Com ES Modules, nao use `ng-app` no HTML. `createApp` aguarda o DOM, registra os componentes antes do bootstrap e monta a aplicacao uma unica vez.

## CLI e geracao de componentes

Configure uma vez os caminhos no `package.json`:

```json
{
  "easyComponents": {
    "componentsDir": "src/components",
    "registry": "src/components/index.generated.js",
    "customData": "html-custom-data.json"
  }
}
```

Crie um componente completo com JavaScript, HTML, CSS e um teste inicial:

```bash
npx easy-components create user-card
```

O comando tambem atualiza o catalogo de imports e os metadados HTML. Para sincronizar todo o projeto ou apenas procurar inconsistencias:

```bash
npx easy-components sync
npx easy-components check
```

Comandos disponiveis:

- `create <nome>`: cria os quatro arquivos sem sobrescrever pastas existentes;
- `sync`: regenera catalogo e autocomplete, depois valida o projeto;
- `registry`: regenera apenas o arquivo de imports;
- `custom-data`: regenera apenas `html-custom-data.json`;
- `check`: detecta seletores duplicados, definicoes invalidas e arquivos ausentes.
- `build [--watch]`: gera bundle, sourcemap e relatorio de orcamento.

### Compatibilidade com a API anterior

Projetos existentes podem continuar usando `EasyComponents.app(...)`, `EasyComponents.use(...)`, `app.component(...)` e funcoes `register...(app)`. Um mesmo `createApp` aceita componentes declarativos novos e funcoes de registro antigas no array `components`, permitindo migracao gradual.

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

Para isolamento opt-in, use `scoped: true`. O plugin adiciona um atributo exclusivo ao host e prefixa os seletores inline no build/runtime, incluindo regras dentro de `@media` e `@supports`:

```js
EasyComponents.defineComponent('user-card', {
  scoped: true,
  styles: ':host { display: block; } .title { font-weight: 700; }',
  template: '<h2 class="title">{{ vm.title }}</h2>'
});
```

O isolamento se aplica a `styles` e a CSS importado como texto. Um `styleUrl` externo continua global, pois seu conteudo e processado pelo navegador.

Em ambientes com Content Security Policy, informe o nonce que o servidor incluiu em `style-src`:

```js
EasyComponents.createApp({
  name: 'app',
  csp: { styleNonce: window.__CSP_NONCE__ },
  components: components
});
```

O Easy Components nao usa `eval` nem `new Function`; o teste de navegador inclui uma pagina CSP sem adicionar `unsafe-eval`.

O build usa o loader `text` do esbuild para incorporar os imports de HTML e CSS no bundle. Assim os arquivos continuam separados no projeto, mas nao geram requests individuais no navegador:

```bash
npm run build:example
```

Durante edicoes, use `npm run watch:example` para reconstruir o bundle automaticamente. `npm run demo` executa um build antes de iniciar o servidor.

### Build de producao e orcamentos

O CLI fornece o mesmo build para outros projetos:

```bash
npx easy-components build
npx easy-components build --watch
```

Configure entrada, saida, sourcemap e limites no `package.json`:

```json
{
  "easyComponents": {
    "build": {
      "entry": "src/app.js",
      "outfile": "dist/app.bundle.js",
      "report": "dist/easy-components-report.json",
      "sourcemap": true,
      "minify": true,
      "budgets": { "bundle": 130000, "gzip": 30000 }
    }
  }
}
```

HTML e CSS importados sao incorporados ao bundle no build. O relatorio registra tamanho normal/gzip e quantidade de templates e estilos; o comando falha quando um orçamento e ultrapassado.

## Autocomplete no VS Code

O arquivo `html-custom-data.json` descreve as tags e propriedades dos componentes. A configuracao `.vscode/settings.json` o conecta ao HTML Language Service do VS Code, oferecendo autocomplete e texto de ajuda para tags como `<counter-card>` e atributos como `initial` e `on-change`.

Ao criar um componente, adicione sua tag e suas props nesse catálogo. Isso reconhece a estrutura HTML; o VS Code não consegue inferir em tempo real os bindings de um componente AngularJS declarado dinamicamente em JavaScript.

## API

O alias padrao dos componentes nos templates e `vm`. Ele pode ser alterado por componente com `controllerAs`, se necessario.

### `defineComponent` e `createApp`

`defineComponent(nome, definicao)` valida e exporta uma descricao reutilizavel do componente. O nome pode ser escrito como a tag HTML (`counter-card`) ou no formato AngularJS (`counterCard`).

`createApp(config)` aceita:

- `name`: nome obrigatorio do modulo;
- `dependencies`: modulos AngularJS adicionais;
- `components`: componentes declarativos, funcoes legadas ou arrays;
- `root`: elemento DOM ou seletor usado no bootstrap;
- `autoMount: false`: desativa o bootstrap automatico.

### `props`

Use os helpers curtos para declarar o tipo, binding e valor padrao:

```js
props: {
  title: EasyComponents.text('Titulo'),
  quantity: EasyComponents.number(0),
  active: EasyComponents.boolean(false),
  user: EasyComponents.object(),
  items: EasyComponents.array(function () { return []; }),
  onSave: EasyComponents.event(),
  id: EasyComponents.required(EasyComponents.number())
}
```

Tambem e possivel usar um construtor como atalho ou uma configuracao completa:

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

### Injecao de servicos

Mapeie um nome curto do componente para qualquer servico AngularJS. O servico fica disponivel em `this` e a anotacao de dependencia e criada automaticamente, inclusive para codigo minificado:

```js
EasyComponents.defineComponent('user-list', {
  inject: {
    users: 'UserService',
    http: '$http'
  },
  state: function () {
    return { items: this.users.list() };
  },
  template: '<p>{{ vm.items.length }} usuarios</p>'
});
```

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

### Metricas de runtime

`EasyComponents.metrics()` devolve um snapshot global e por componente com instancias criadas, montadas, destruidas e ativas, atualizacoes de estado, agendamentos de digest, watchers ativos e tempo acumulado de montagem. Quando o navegador oferece `performance.memory`, o snapshot tambem inclui o heap:

```js
var report = EasyComponents.metrics();
console.table(report.components);
console.log(report.totals, report.heap);
```

Chamadas consecutivas de `$setState` no mesmo ciclo sao agrupadas em um unico `$evalAsync`, reduzindo digests redundantes sem mudar a atualizacao imediata do estado.

### Testes de componentes

O harness oficial monta um componente declarativo em um modulo e injector isolados:

```js
var fixture = EasyComponents.testing.mount(UserCard, {
  props: { user: { name: 'Ana' } },
  events: {
    onSave: function (user) { /* assert */ }
  }
});

fixture.controller.save();
fixture.update({ user: { name: 'Bia' } });
fixture.destroy();
```

O fixture expoe `element`, `controller`, `scope`, `update(props)` e `destroy()`. Cada teste deve chamar `destroy()` para encerrar scopes, watchers e DOM.

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
- vitrine com 25 componentes publicos organizados em tabs;
- botoes, badges, alertas, selects e paginacao;
- tabela com busca, filtro, ordenacao e componentes aninhados;
- cards de metricas, produtos, usuarios e listas expansivas;
- formulario reativo, validacao e modal com transclusao;
- navegacao sticky com scroll-spy, progresso e notificacoes toast;
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

## Versoes e suporte

Consulte [SUPPORT.md](SUPPORT.md) para ambientes suportados, [MIGRATION.md](MIGRATION.md) para migracao gradual e [CHANGELOG.md](CHANGELOG.md) para mudancas por versao. As ferramentas de CLI/build requerem Node.js 18+; o runtime continua sendo JavaScript para AngularJS 1.5+ no navegador.
