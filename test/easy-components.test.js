'use strict';

var assert = require('assert').strict;
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var navigation = require('../vscode-extension/navigation');
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
  assert.equal(scope.asyncCalls, 2);
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

test('localiza metodos da API do plugin usados no JavaScript', function () {
  var source = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'angularjs-easy-components.js'),
    'utf8'
  );

  ['app', 'use', 'component', 'register', 'mount', '$setState', '$emit'].forEach(function (apiName) {
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

if (failures) {
  console.error('\n' + failures + ' de ' + total + ' testes falharam.');
  process.exitCode = 1;
} else {
  console.log('\n' + total + ' testes passaram.');
}
