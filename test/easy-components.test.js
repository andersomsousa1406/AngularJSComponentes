'use strict';

var assert = require('assert').strict;
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var navigation = require('../vscode-extension/navigation');
var semantic = require('../vscode-extension/semantic');
var projectTools = require('../lib/project-tools');
var total = 0;
var failures = 0;

function test(name, callback) {
  total += 1;
  try {
    callback();
    console.log('✓ ' + name);
  } catch (error) {
    failures += 1;
    console.error('✗ ' + name);
    console.error(error.stack || error);
  }
}

function fakeAngular() {
  var modules = {};
  var bootstraps = [];

  function Module(name, dependencies) {
    this.name = name;
    this.dependencies = dependencies || [];
    this.components = {};
    this.constants = {};
  }
  Module.prototype.component = function (name, definition) {
    this.components[name] = definition;
    return this;
  };
  Module.prototype.constant = function (name, value) {
    this.constants[name] = value;
    return this;
  };

  return {
    bootstraps: bootstraps,
    module: function (name, dependencies) {
      if (dependencies) modules[name] = new Module(name, dependencies);
      if (!modules[name]) throw new Error('Unknown module: ' + name);
      return modules[name];
    },
    copy: function (value) {
      if (value === undefined) return value;
      return JSON.parse(JSON.stringify(value));
    },
    extend: function (target) {
      for (var i = 1; i < arguments.length; i += 1) Object.assign(target, arguments[i]);
      return target;
    },
    forEach: function (value, iterator) {
      if (Array.isArray(value)) return value.forEach(iterator);
      Object.keys(value || {}).forEach(function (key) { iterator(value[key], key); });
    },
    element: function () {
      return { ready: function (callback) { callback(); } };
    },
    bootstrap: function (element, moduleNames) {
      bootstraps.push({ element: element, moduleNames: moduleNames });
    },
    noop: function () {}
  };
}

function loadLibrary(globals) {
  var source = fs.readFileSync(path.join(__dirname, '..', 'src', 'angularjs-easy-components.js'), 'utf8');
  var angular = fakeAngular();
  var context = Object.assign({ angular: angular, console: console }, globals || {});
  context.self = context;
  vm.runInNewContext(source, context, { filename: 'angularjs-easy-components.js' });
  return { angular: angular, api: context.AngularJSEasyComponents };
}

function createScope() {
  return {
    $root: { $$phase: false },
    asyncCalls: 0,
    $evalAsync: function () { this.asyncCalls += 1; },
    $eval: function (expression, controller) {
      return expression.split('.').reduce(function (value, key) { return value && value[key]; }, controller);
    },
    $watch: function () { return function () {}; }
  };
}

test('instala easyComponent nos modulos e permite encadeamento', function () {
  var loaded = loadLibrary();
  var app = loaded.angular.module('app', []);
  var result = app.easyComponent('helloCard', { template: '<p>Oi</p>' });

  assert.equal(result, app);
  assert.ok(app.components.helloCard);
  assert.equal(loaded.api.module, 'ngEasyComponents');
});

test('cria um app simples e registra componentes sem repetir angular.module', function () {
  var loaded = loadLibrary();
  var app = loaded.api.app('storeApp', ['ngRoute']);
  var result = app.component('storeRoot', { templateUrl: 'store-root.html' });

  assert.equal(result, app);
  assert.equal(app.name, 'storeApp');
  assert.deepEqual(app.angularModule.dependencies, ['ngEasyComponents', 'ngRoute']);
  assert.ok(app.angularModule.components.storeRoot);
  assert.equal(loaded.api.use('storeApp').angularModule, app.angularModule);
});

test('registra imports de componentes sem forEach manual', function () {
  var loaded = loadLibrary();
  var app = loaded.api.app('importsApp');
  var calls = [];

  function registerFirst(target) {
    calls.push(target.name);
    target.component('firstCard', { template: '<div></div>' });
  }
  function registerSecond(target) {
    calls.push(target.name);
    target.component('secondCard', { template: '<div></div>' });
  }

  var result = app.register(registerFirst, [registerSecond]);

  assert.equal(result, app);
  assert.deepEqual(calls, ['importsApp', 'importsApp']);
  assert.ok(app.angularModule.components.firstCard);
  assert.ok(app.angularModule.components.secondCard);
});

test('define componentes declarativos e aceita nomes em kebab-case', function () {
  var loaded = loadLibrary();
  var CounterCard = loaded.api.defineComponent('counter-card', {
    props: { initial: loaded.api.number(0) },
    template: '<div>{{ vm.initial }}</div>'
  });
  var app = loaded.api.app('descriptorApp');

  app.register(CounterCard);

  assert.equal(CounterCard.name, 'counterCard');
  assert.equal(CounterCard.selector, 'counter-card');
  assert.ok(app.angularModule.components.counterCard);
});

test('createApp registra API nova e antiga antes de montar uma unica vez', function () {
  var loaded = loadLibrary();
  var root = { nodeName: 'MAIN' };
  var NewCard = loaded.api.defineComponent('new-card', { template: '<div></div>' });

  function registerLegacy(app) {
    app.component('legacyCard', { template: '<div></div>' });
  }

  var app = loaded.api.createApp({
    name: 'modernApp',
    dependencies: ['ngRoute'],
    components: [NewCard, registerLegacy],
    root: root
  });

  assert.deepEqual(app.angularModule.dependencies, ['ngEasyComponents', 'ngRoute']);
  assert.ok(app.angularModule.components.newCard);
  assert.ok(app.angularModule.components.legacyCard);
  assert.equal(loaded.angular.bootstraps.length, 1);
  assert.equal(loaded.angular.bootstraps[0].element, root);
});

test('oferece helpers curtos para props tipadas e obrigatorias', function () {
  var loaded = loadLibrary();
  var component = loaded.api.toAngularComponent('typedCard', {
    props: {
      title: loaded.api.text('Titulo'),
      count: loaded.api.number(2, function (value) { return value >= 0; }),
      enabled: loaded.api.boolean(true),
      user: loaded.api.required(loaded.api.object()),
      tags: loaded.api.array(function () { return []; }),
      onSave: loaded.api.event()
    },
    template: '<div></div>'
  });
  var controller = new component.controller({}, {}, createScope());
  controller.user = { id: 1 };
  controller.$onInit();

  assert.deepEqual(JSON.parse(JSON.stringify(component.bindings)), {
    title: '@?', count: '<?', enabled: '<?', user: '<', tags: '<?', onSave: '&?'
  });
  assert.equal(controller.title, 'Titulo');
  assert.equal(controller.count, 2);
  assert.equal(controller.enabled, true);
  assert.ok(Array.isArray(controller.tags));
});

test('injeta servicos AngularJS usando aliases declarativos', function () {
  var loaded = loadLibrary();
  var users = { list: function () { return ['Ana']; } };
  var component = loaded.api.toAngularComponent('usersCard', {
    inject: { users: 'UserService' },
    methods: { load: function () { return this.users.list(); } },
    template: '<div></div>'
  });
  var controller = new component.controller({}, {}, createScope(), undefined, users);

  assert.deepEqual(JSON.parse(JSON.stringify(component.controller.$inject)), [
    '$element', '$attrs', '$scope', '$document', 'UserService'
  ]);
  assert.deepEqual(controller.load(), ['Ana']);
});

test('monta o app somente depois que os componentes foram registrados', function () {
  var loaded = loadLibrary();
  var app = loaded.api.app('mountedApp');
  var root = { nodeName: 'BODY' };

  var result = app
    .register(function (target) {
      target.component('mountedRoot', { template: '<div></div>' });
    })
    .mount(root);

  assert.equal(result, app);
  assert.ok(app.angularModule.components.mountedRoot);
  assert.equal(loaded.angular.bootstraps.length, 1);
  assert.equal(loaded.angular.bootstraps[0].element, root);
  assert.equal(loaded.angular.bootstraps[0].moduleNames.length, 1);
  assert.equal(loaded.angular.bootstraps[0].moduleNames[0], 'mountedApp');
  app.mount(root);
  assert.equal(loaded.angular.bootstraps.length, 1);
});

test('faz o mount automatico uma unica vez apos todos os registros', function () {
  var queued = [];
  var root = { nodeName: 'DOCUMENT' };
  var loaded = loadLibrary({
    document: root,
    queueMicrotask: function (callback) { queued.push(callback); }
  });
  var app = loaded.api.app('automaticApp');

  app.register(
    function (target) { target.component('firstRoot', { template: '<div></div>' }); },
    function (target) { target.component('secondRoot', { template: '<div></div>' }); }
  );

  assert.equal(loaded.angular.bootstraps.length, 0);
  assert.ok(app.angularModule.components.firstRoot);
  assert.ok(app.angularModule.components.secondRoot);
  assert.equal(queued.length, 1);

  queued[0]();
  assert.equal(loaded.angular.bootstraps.length, 1);
  assert.equal(loaded.angular.bootstraps[0].element, root);

  app.mount(root);
  assert.equal(loaded.angular.bootstraps.length, 1);
});

test('converte props em bindings opcionais e obrigatorios', function () {
  var loaded = loadLibrary();
  var component = loaded.api.toAngularComponent('userCard', {
    props: {
      user: { type: Object, required: true },
      label: { type: String, binding: '@' },
      onSave: Function
    },
    template: '<div></div>'
  });

  assert.deepEqual(JSON.parse(JSON.stringify(component.bindings)), {
    user: '<',
    label: '@?',
    onSave: '&?'
  });
  assert.equal(component.controllerAs, 'vm');
});

test('inicializa defaults, estado, metodos e computed values', function () {
  var loaded = loadLibrary();
  var component = loaded.api.toAngularComponent('counterBox', {
    props: { initial: { type: Number, default: 3 } },
    state: function () { return { count: this.initial }; },
    computed: { doubled: function () { return this.count * 2; } },
    methods: {
      increment: function () { this.$setState({ count: this.count + 1 }); }
    },
    template: '<div></div>'
  });
  var scope = createScope();
  var controller = new component.controller({}, {}, scope);

  controller.$onInit();
  controller.increment();

  assert.equal(controller.initial, 3);
  assert.equal(controller.count, 4);
  assert.equal(controller.doubled, 8);
  assert.equal(scope.asyncCalls, 1);
});

test('agrupa atualizacoes de estado e expoe metricas por componente', function () {
  var loaded = loadLibrary();
  var component = loaded.api.toAngularComponent('metricsCard', {
    state: { count: 0 },
    methods: {
      updateMany: function () {
        this.$setState({ count: 1 });
        this.$setState({ count: 2 });
        this.$setState({ count: 3 });
      }
    },
    watch: { count: function () {} },
    template: '<div></div>'
  });
  var scope = createScope();
  var controller = new component.controller({}, {}, scope);

  controller.$onInit();
  controller.updateMany();
  controller.$postLink();
  var active = loaded.api.metrics();

  assert.equal(scope.asyncCalls, 1);
  assert.equal(active.components.metricsCard.stateUpdates, 4);
  assert.equal(active.components.metricsCard.digestSchedules, 1);
  assert.equal(active.components.metricsCard.active, 1);
  assert.equal(active.components.metricsCard.watchers, 1);
  assert.equal(active.totals.created, 1);

  controller.$onDestroy();
  var destroyed = loaded.api.metrics();
  assert.equal(destroyed.components.metricsCard.active, 0);
  assert.equal(destroyed.components.metricsCard.destroyed, 1);
  assert.equal(destroyed.components.metricsCard.watchers, 0);
});

test('$emit entrega o payload no formato de callback do AngularJS', function () {
  var loaded = loadLibrary();
  var component = loaded.api.toAngularComponent('saveButton', {
    props: { onSave: Function },
    template: '<button></button>'
  });
  var controller = new component.controller({}, {}, createScope());
  var received;
  controller.onSave = function (locals) { received = locals; return 'ok'; };

  var result = controller.$emit('onSave', { id: 42 });

  assert.equal(result, 'ok');
  assert.equal(received.$event.id, 42);
  assert.equal(received.$value.id, 42);
});

test('rejeita colisoes de nomes antes de registrar o componente', function () {
  var loaded = loadLibrary();

  assert.throws(function () {
    loaded.api.toAngularComponent('brokenCard', {
      props: { title: String },
      methods: { title: function () {} },
      template: '<div></div>'
    });
  }, /prop e metodo/);
});

test('impede que o estado sobrescreva props ou metodos', function () {
  var loaded = loadLibrary();
  var component = loaded.api.toAngularComponent('safeCard', {
    props: { title: String },
    state: { title: 'sobrescrito' },
    template: '<div></div>'
  });
  var controller = new component.controller({}, {}, createScope());

  assert.throws(function () { controller.$onInit(); }, /estado "title" colide/);
});

test('carrega arquivos e estilos inline apenas uma vez por pagina', function () {
  var loaded = loadLibrary();
  var appended = [];
  var document = {
    head: { appendChild: function (element) { appended.push(element); } },
    createElement: function (tagName) {
      return {
        tagName: tagName,
        attributes: {},
        setAttribute: function (name, value) { this.attributes[name] = value; },
        appendChild: function (child) { this.child = child; }
      };
    },
    createTextNode: function (text) { return { text: text }; }
  };
  var component = loaded.api.toAngularComponent('styledCard', {
    template: '<div></div>',
    styleUrl: 'card.css',
    styleUrls: ['theme.css'],
    styles: ['.card { color: red; }']
  });

  new component.controller({}, {}, createScope(), [document]);
  new component.controller({}, {}, createScope(), [document]);

  assert.equal(appended.length, 3);
  assert.equal(appended[0].tagName, 'link');
  assert.equal(appended[0].href, 'card.css');
  assert.equal(appended[1].href, 'theme.css');
  assert.equal(appended[2].tagName, 'style');
  assert.equal(appended[2].child.text, '.card { color: red; }');
});

test('isola CSS por componente e aplica nonce para CSP', function () {
  var loaded = loadLibrary();
  var appended = [];
  var attributes = {};
  var document = {
    head: { appendChild: function (element) { appended.push(element); } },
    createElement: function (tagName) {
      return {
        tagName: tagName,
        attributes: {},
        setAttribute: function (name, value) { this.attributes[name] = value; },
        appendChild: function (child) { this.child = child; }
      };
    },
    createTextNode: function (text) { return { text: text }; }
  };
  var element = { attr: function (name, value) { attributes[name] = value; } };

  loaded.api.configure({ styleNonce: 'nonce-123' });
  var component = loaded.api.toAngularComponent('scopedCard', {
    scoped: true,
    styles: '.title, :host(.active) { color: red; } @media (max-width: 10px) { .title { color: blue; } }',
    template: '<h2 class="title"></h2>'
  });
  new component.controller(element, {}, createScope(), [document]);

  assert.equal(attributes['data-easy-scope'], 'scoped-card');
  assert.equal(appended[0].attributes.nonce, 'nonce-123');
  assert.match(appended[0].child.text, /\[data-easy-scope="scoped-card"\] \.title/);
  assert.match(appended[0].child.text, /\[data-easy-scope="scoped-card"\]\.active/);
  assert.equal(typeof loaded.api.testing.mount, 'function');
});

test('runtime nao adiciona eval ou Function dinamica para CSP', function () {
  var source = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'angularjs-easy-components.js'),
    'utf8'
  );
  assert.doesNotMatch(source, /(^|[^.$\w])eval\s*\(/m);
  assert.doesNotMatch(source, /new\s+Function\s*\(/);
});

test('localiza a declaracao de um componente a partir da tag HTML', function () {
  var html = '<article><value-display value="vm.count"></value-display></article>';
  var source = "export default function register(app) { return app.component('valueDisplay', {}); }";
  var tag = navigation.tagAtOffset(html, html.indexOf('value-display') + 3);

  assert.equal(tag.name, 'value-display');
  assert.equal(navigation.kebabToCamel(tag.name), 'valueDisplay');
  assert.equal(
    source.slice(
      navigation.componentDefinitionOffset(source, 'valueDisplay'),
      navigation.componentDefinitionOffset(source, 'valueDisplay') + 'valueDisplay'.length
    ),
    'valueDisplay'
  );
});

test('localiza componentes declarados com defineComponent', function () {
  var source = "export default EasyComponents.defineComponent('value-display', { template: '<p></p>' });";
  var offset = navigation.componentDefinitionOffset(source, 'valueDisplay');

  assert.notEqual(offset, -1);
  assert.equal(source.slice(offset, offset + 'value-display'.length), 'value-display');
});

test('localiza metodos da API do plugin usados no JavaScript', function () {
  var source = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'angularjs-easy-components.js'),
    'utf8'
  );

  ['app', 'createApp', 'defineComponent', 'use', 'component', 'register', 'mount', '$setState', '$emit'].forEach(function (apiName) {
    var offset = navigation.apiDefinitionOffset(source, apiName);
    assert.notEqual(offset, -1, 'Nao encontrou ' + apiName);
    assert.equal(source.slice(offset, offset + apiName.length), apiName);
  });
});

test('navega pelos imports, templates e estilos de um arquivo de componente', function () {
  var componentSource = [
    "import template from './value-display.html';",
    "import styles from './value-display.css';",
    'export default function registerValueDisplay(app) {',
    "  return app.component('valueDisplay', {",
    '    template: template,',
    '    styles: styles',
    '  });',
    '}'
  ].join('\n');
  var appSource = "import registerValueDisplay from './components/value-display/value-display.component.js';";
  var registrationOffset = componentSource.indexOf('registerValueDisplay') + 3;
  var templateOffset = componentSource.indexOf('./value-display.html') + 3;

  assert.equal(
    navigation.registrationNameAtOffset(componentSource, registrationOffset),
    'registerValueDisplay'
  );
  assert.notEqual(
    navigation.exportedRegistrationOffset(componentSource, 'registerValueDisplay'),
    -1
  );
  assert.notEqual(
    navigation.importedRegistrationOffset(appSource, 'registerValueDisplay'),
    -1
  );
  assert.deepEqual(navigation.resourcePathAtOffset(componentSource, templateOffset), {
    kind: 'templateImport',
    path: './value-display.html',
    start: componentSource.indexOf('./value-display.html'),
    end: componentSource.indexOf('./value-display.html') + './value-display.html'.length
  });
});

test('descobre componentes e props para o catalogo automatico', function () {
  var config = projectTools.loadConfig(path.join(__dirname, '..'));
  var components = projectTools.discoverComponents(config);
  var counter = components.filter(function (component) {
    return component.selector === 'counter-card';
  })[0];

  assert.equal(components.length, 25);
  assert.ok(counter);
  assert.deepEqual(counter.props, ['title', 'initial', 'step', 'onChange']);
});

test('gera um catalogo ES Modules com todos os componentes', function () {
  var config = projectTools.loadConfig(path.join(__dirname, '..'));
  var components = projectTools.discoverComponents(config);
  var source = projectTools.registrySource(config, components);

  assert.match(source, /counter-card\/counter-card\.component\.js/);
  assert.match(source, /export default components/);
  assert.equal((source.match(/^import Component/gm) || []).length, components.length);
});

test('valida a estrutura e a nomenclatura dos componentes', function () {
  var config = projectTools.loadConfig(path.join(__dirname, '..'));
  var result = projectTools.checkProject(config);

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test('gerador cria JavaScript, HTML, CSS e teste sem sobrescrever', function () {
  var temporaryRoot = fs.mkdtempSync(path.join(__dirname, 'tmp-cli-'));
  var componentsDir = path.join(temporaryRoot, 'components');
  var config = { componentsDir: componentsDir };

  fs.mkdirSync(componentsDir);
  try {
    var created = projectTools.createComponent(config, 'ProfileCard');
    ['component.js', 'html', 'css', 'test.js'].forEach(function (suffix) {
      assert.ok(fs.existsSync(path.join(created.directory, 'profile-card.' + suffix)));
    });
    assert.throws(function () {
      projectTools.createComponent(config, 'profile-card');
    }, /ja existe/);
  } finally {
    fs.rmdirSync(temporaryRoot, { recursive: true });
  }
});

test('indice semantico extrai props, tipos e membros de vm', function () {
  var source = fs.readFileSync(
    path.join(__dirname, '..', 'example', 'components', 'counter-card', 'counter-card.component.js'),
    'utf8'
  );
  var component = semantic.parseComponent(source, 'counter-card.component.js');

  assert.equal(component.selector, 'counter-card');
  assert.deepEqual(component.props.map(function (prop) {
    return [prop.attribute, prop.type, prop.binding];
  }), [
    ['title', 'String', '@'],
    ['initial', 'Number', '<'],
    ['step', 'Number', '<'],
    ['on-change', 'Function', '&']
  ]);
  ['count', 'increment', 'decrement', 'doubled'].forEach(function (name) {
    assert.ok(component.members.some(function (member) { return member.name === name; }), 'Nao encontrou vm.' + name);
  });
  assert.deepEqual(component.templates, ['./counter-card.html']);
});

test('indice semantico reconhece API legada e props obrigatorias', function () {
  var source = [
    "import template from './user-card.html';",
    'export default function register(app) {',
    "  return app.component('userCard', {",
    '    props: { user: { type: Object, required: true }, onSave: Function },',
    '    inject: { api: "UserService" },',
    '    template: template',
    '  });',
    '}'
  ].join('\n');
  var component = semantic.parseComponent(source, 'user-card.component.js');

  assert.equal(component.selector, 'user-card');
  assert.equal(component.props[0].required, true);
  assert.equal(component.props[1].binding, '&');
  assert.ok(component.members.some(function (member) { return member.name === 'api' && member.kind === 'inject'; }));
});

test('indice semantico localiza tags e atributos no HTML', function () {
  var html = '<counter-card initial="vm.total" on-change="vm.changed($event)"></counter-card>';
  var tags = semantic.openingTags(html);
  var offset = html.indexOf('on-change') + 3;
  var context = semantic.attributeAtOffset(html, offset);

  assert.equal(tags.length, 1);
  assert.equal(tags[0].name, 'counter-card');
  assert.equal(tags[0].attributes[0].value, 'vm.total');
  assert.equal(context.attribute.name, 'on-change');
  assert.equal(context.tag.name, 'counter-card');
});

if (failures) {
  console.error('\n' + failures + ' de ' + total + ' testes falharam.');
  process.exitCode = 1;
} else {
  console.log('\n' + total + ' testes passaram.');
}
