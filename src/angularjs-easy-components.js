(function (root, factory) {
  'use strict';

  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('angular'));
  } else {
    root.EasyComponents = root.AngularJSEasyComponents = factory(root.angular);
  }
}(typeof self !== 'undefined' ? self : this, function (angular) {
  'use strict';

  if (!angular || !angular.module) {
    throw new Error('[EasyComponents] AngularJS 1.5+ precisa ser carregado primeiro.');
  }

  var VERSION = '1.0.0';
  var COMPONENT_DEFINITION = '__easyComponentDefinition';
  var INSTALLED_STYLES = {};
  var COMPONENT_METRICS = {};
  var GLOBAL_OPTIONS = {};
  var TEST_APP_ID = 0;
  var RESERVED = {
    $attrs: true,
    $element: true,
    $emit: true,
    $onChanges: true,
    $onDestroy: true,
    $onInit: true,
    $postLink: true,
    $scope: true,
    $setState: true,
    __easyDigestQueued: true,
    __easyMetric: true,
    __easyMountedAt: true,
    __easyUnwatch: true
  };

  function now() {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }

  function componentMetric(name) {
    if (!COMPONENT_METRICS[name]) {
      COMPONENT_METRICS[name] = {
        created: 0,
        mounted: 0,
        destroyed: 0,
        active: 0,
        stateUpdates: 0,
        digestSchedules: 0,
        watchers: 0,
        mountTime: 0
      };
    }
    return COMPONENT_METRICS[name];
  }

  function metricsSnapshot() {
    var components = angular.copy(COMPONENT_METRICS);
    var totals = {
      created: 0,
      mounted: 0,
      destroyed: 0,
      active: 0,
      stateUpdates: 0,
      digestSchedules: 0,
      watchers: 0,
      mountTime: 0
    };
    angular.forEach(components, function (metric) {
      angular.forEach(totals, function (_, key) { totals[key] += metric[key]; });
    });
    return {
      components: components,
      totals: totals,
      heap: typeof performance !== 'undefined' && performance.memory
        ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        }
        : null
    };
  }

  function own(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function kebabToCamel(name) {
    return name.replace(/-([a-z0-9])/g, function (_, character) {
      return character.toUpperCase();
    });
  }

  function camelToKebab(name) {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  function normalizeComponentName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('[EasyComponents] O componente precisa de um nome.');
    }
    var normalized = kebabToCamel(name);
    if (!/^[a-z][\w$]*$/.test(normalized)) {
      throw new Error('[EasyComponents] Nome de componente invalido: "' + name + '".');
    }
    return normalized;
  }

  function propConfig(type, binding, args) {
    var config = { type: type, binding: binding };
    var options;

    if (args.length > 0) config.default = args[0];
    if (args.length > 1) {
      options = typeof args[1] === 'function' ? { validator: args[1] } : args[1];
      if (options !== undefined && !isObject(options)) {
        throw new Error('[EasyComponents] As opcoes da prop precisam ser um objeto ou validator.');
      }
      angular.extend(config, options || {});
    }
    return config;
  }

  function textProp(defaultValue, options) {
    return propConfig(String, '@', arguments);
  }

  function numberProp(defaultValue, options) {
    return propConfig(Number, '<', arguments);
  }

  function booleanProp(defaultValue, options) {
    return propConfig(Boolean, '<', arguments);
  }

  function objectProp(defaultValue, options) {
    return propConfig(Object, '<', arguments);
  }

  function arrayProp(defaultValue, options) {
    return propConfig(Array, '<', arguments);
  }

  function eventProp(options) {
    var config = { type: Function, binding: '&' };
    if (options !== undefined) {
      if (!isObject(options)) {
        throw new Error('[EasyComponents] As opcoes do evento precisam ser um objeto.');
      }
      angular.extend(config, options);
    }
    return config;
  }

  function requiredProp(input) {
    var config;
    if (typeof input === 'function') {
      config = { type: input };
    } else if (typeof input === 'string') {
      config = { binding: input };
    } else if (isObject(input)) {
      config = angular.extend({}, input);
    } else {
      throw new Error('[EasyComponents] required espera uma definicao de prop valida.');
    }
    config.required = true;
    return config;
  }

  function copyDefault(value, controller) {
    var resolved = typeof value === 'function' ? value.call(controller) : value;
    return angular.copy(resolved);
  }

  function expectedName(type) {
    return type && type.name ? type.name : String(type);
  }

  function matchesType(value, type) {
    var name = expectedName(type);
    if (value === undefined || value === null || !type) return true;
    if (name === 'String') return typeof value === 'string';
    if (name === 'Number') return typeof value === 'number' && !isNaN(value);
    if (name === 'Boolean') return typeof value === 'boolean';
    if (name === 'Function') return typeof value === 'function';
    if (name === 'Array') return Array.isArray(value);
    if (name === 'Object') return isObject(value);
    return value instanceof type;
  }

  function inferBinding(type) {
    return expectedName(type) === 'Function' ? '&?' : '<?';
  }

  function normalizeProp(name, input) {
    var config;

    if (typeof input === 'string') {
      config = { binding: input };
    } else if (typeof input === 'function') {
      config = { type: input };
    } else if (isObject(input)) {
      config = angular.extend({}, input);
    } else {
      throw new Error('[EasyComponents] A prop "' + name + '" possui uma definicao invalida.');
    }

    config.binding = config.binding || inferBinding(config.type);
    if (!/^[<@=&](\??)([a-zA-Z_$][\w$]*)?$/.test(config.binding)) {
      throw new Error('[EasyComponents] Binding invalido em "' + name + '": ' + config.binding);
    }

    if (config.required) {
      config.binding = config.binding.replace('?', '');
    } else if (config.binding.indexOf('?') === -1) {
      config.binding = config.binding.charAt(0) + '?' + config.binding.slice(1);
    }

    return config;
  }

  function normalizeProps(props) {
    var result = {};
    angular.forEach(props || {}, function (input, name) {
      result[name] = normalizeProp(name, input);
    });
    return result;
  }

  function bindingsFrom(props) {
    var bindings = {};
    angular.forEach(props, function (config, name) {
      bindings[name] = config.binding;
    });
    return bindings;
  }

  function warn(message) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[EasyComponents] ' + message);
    }
  }

  function assertAvailable(name, kind) {
    if (RESERVED[name]) {
      throw new Error('[EasyComponents] "' + name + '" e reservado e nao pode ser usado como ' + kind + '.');
    }
  }

  function normalizeInject(inject) {
    var result = {};
    if (inject === undefined) return result;
    if (!isObject(inject)) {
      throw new Error('[EasyComponents] inject precisa ser um objeto de alias para servico.');
    }
    angular.forEach(inject, function (serviceName, alias) {
      assertAvailable(alias, 'injecao');
      if (!/^[a-zA-Z_$][\w$]*$/.test(alias) || typeof serviceName !== 'string' || !serviceName) {
        throw new Error('[EasyComponents] Injecao invalida em "' + alias + '".');
      }
      result[alias] = serviceName;
    });
    return result;
  }

  function validateDefinition(name, definition, props) {
    if (!name || typeof name !== 'string') {
      throw new Error('[EasyComponents] O componente precisa de um nome.');
    }
    if (!isObject(definition)) {
      throw new Error('[EasyComponents] A definicao de "' + name + '" precisa ser um objeto.');
    }
    if (!definition.template && !definition.templateUrl) {
      throw new Error('[EasyComponents] "' + name + '" precisa de template ou templateUrl.');
    }

    var injections = normalizeInject(definition.inject);

    angular.forEach(props, function (_, key) { assertAvailable(key, 'prop'); });
    angular.forEach(definition.methods || {}, function (method, key) {
      assertAvailable(key, 'metodo');
      if (typeof method !== 'function') {
        throw new Error('[EasyComponents] O metodo "' + key + '" precisa ser uma funcao.');
      }
      if (own(props, key)) {
        throw new Error('[EasyComponents] "' + key + '" nao pode ser prop e metodo ao mesmo tempo.');
      }
    });
    angular.forEach(definition.computed || {}, function (computed, key) {
      assertAvailable(key, 'computed');
      if (typeof computed !== 'function') {
        throw new Error('[EasyComponents] O computed "' + key + '" precisa ser uma funcao.');
      }
      if (own(props, key) || own(definition.methods || {}, key)) {
        throw new Error('[EasyComponents] Nome duplicado: "' + key + '".');
      }
    });
    angular.forEach(injections, function (_, key) {
      if (own(props, key) || own(definition.methods || {}, key) || own(definition.computed || {}, key)) {
        throw new Error('[EasyComponents] A injecao "' + key + '" colide com outro membro do componente.');
      }
    });
  }

  function defineComponentDescriptor(name, definition) {
    var normalizedName = normalizeComponentName(name);
    var props = normalizeProps(definition && definition.props);
    validateDefinition(normalizedName, definition, props);
    return {
      __easyComponentDefinition: true,
      name: normalizedName,
      selector: camelToKebab(normalizedName),
      definition: definition
    };
  }

  function isComponentDescriptor(value) {
    return !!(value && value[COMPONENT_DEFINITION] === true && value.name && value.definition);
  }

  function runHook(controller, hooks, name, argument) {
    if (hooks && typeof hooks[name] === 'function') {
      return hooks[name].call(controller, argument);
    }
  }

  function validateProps(controller, props) {
    angular.forEach(props, function (config, name) {
      var value = controller[name];
      if ((value === undefined || value === null) && own(config, 'default')) {
        controller[name] = copyDefault(config.default, controller);
        value = controller[name];
      }
      if (config.required && (value === undefined || value === null)) {
        warn('A prop obrigatoria "' + name + '" nao foi informada.');
      } else if (!matchesType(value, config.type)) {
        warn('A prop "' + name + '" deveria ser ' + expectedName(config.type) + '.');
      }
      if (value !== undefined && typeof config.validator === 'function' && !config.validator(value)) {
        warn('A prop "' + name + '" nao passou na validacao customizada.');
      }
    });
  }

  function installMethods(controller, methods) {
    angular.forEach(methods || {}, function (method, name) {
      controller[name] = method.bind(controller);
    });
  }

  function installComputed(controller, computed) {
    angular.forEach(computed || {}, function (getter, name) {
      Object.defineProperty(controller, name, {
        configurable: true,
        enumerable: true,
        get: function () { return getter.call(controller); }
      });
    });
  }

  function cssBlockEnd(css, start) {
    var depth = 0;
    var quote = null;
    var comment = false;
    for (var index = start; index < css.length; index += 1) {
      var character = css[index];
      if (comment) {
        if (character === '*' && css[index + 1] === '/') {
          comment = false;
          index += 1;
        }
        continue;
      }
      if (quote) {
        if (character === '\\') index += 1;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '/' && css[index + 1] === '*') {
        comment = true;
        index += 1;
      } else if (character === '\'' || character === '"') {
        quote = character;
      } else if (character === '{') {
        depth += 1;
      } else if (character === '}') {
        depth -= 1;
        if (depth === 0) return index;
      }
    }
    return -1;
  }

  function splitSelectors(selectorText) {
    var selectors = [];
    var start = 0;
    var parentheses = 0;
    for (var index = 0; index < selectorText.length; index += 1) {
      if (selectorText[index] === '(') parentheses += 1;
      else if (selectorText[index] === ')') parentheses -= 1;
      else if (selectorText[index] === ',' && parentheses === 0) {
        selectors.push(selectorText.slice(start, index));
        start = index + 1;
      }
    }
    selectors.push(selectorText.slice(start));
    return selectors;
  }

  function scopeSelector(selector, scope) {
    var trimmed = selector.trim();
    if (!trimmed) return selector;
    if (trimmed.indexOf(':host') !== -1) {
      return trimmed
        .replace(/:host\(([^)]+)\)/g, scope + '$1')
        .replace(/:host\b/g, scope);
    }
    return scope + ' ' + trimmed;
  }

  function scopeCss(css, componentName) {
    var scope = '[data-easy-scope="' + camelToKebab(componentName) + '"]';
    var output = '';
    var cursor = 0;

    while (cursor < css.length) {
      var open = css.indexOf('{', cursor);
      if (open === -1) return output + css.slice(cursor);
      var close = cssBlockEnd(css, open);
      if (close === -1) return output + css.slice(cursor);
      var header = css.slice(cursor, open);
      var body = css.slice(open + 1, close);
      var trimmedHeader = header.trim();

      if (/^@(media|supports|layer|container|document)\b/i.test(trimmedHeader)) {
        output += header + '{' + scopeCss(body, componentName) + '}';
      } else if (/^@/.test(trimmedHeader)) {
        output += header + '{' + body + '}';
      } else {
        var leading = /^\s*/.exec(header)[0];
        var selectorText = header.slice(leading.length);
        output += leading + splitSelectors(selectorText).map(function (selector) {
          return scopeSelector(selector, scope);
        }).join(', ') + '{' + body + '}';
      }
      cursor = close + 1;
    }
    return output;
  }

  function installStyles(name, definition, $document) {
    var document = $document && ($document[0] || $document);
    if (!document || !document.createElement) return;

    var head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    var urls = [];
    if (definition.styleUrl) urls.push(definition.styleUrl);
    if (Array.isArray(definition.styleUrls)) {
      urls = urls.concat(definition.styleUrls);
    } else if (definition.styleUrls) {
      urls.push(definition.styleUrls);
    }

    angular.forEach(urls, function (url) {
      var key = 'url:' + url;
      if (INSTALLED_STYLES[key]) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-easy-component-style', name);
      if (definition.styleNonce || GLOBAL_OPTIONS.styleNonce) {
        link.setAttribute('nonce', definition.styleNonce || GLOBAL_OPTIONS.styleNonce);
      }
      head.appendChild(link);
      INSTALLED_STYLES[key] = true;
    });

    var inlineStyles = Array.isArray(definition.styles) ? definition.styles : [definition.styles];
    angular.forEach(inlineStyles, function (css, index) {
      if (!css) return;
      var key = 'inline:' + name + ':' + index + ':' + (definition.scoped ? 'scoped' : 'global');
      if (INSTALLED_STYLES[key]) return;
      var style = document.createElement('style');
      style.type = 'text/css';
      style.setAttribute('data-easy-component-style', name);
      if (definition.styleNonce || GLOBAL_OPTIONS.styleNonce) {
        style.setAttribute('nonce', definition.styleNonce || GLOBAL_OPTIONS.styleNonce);
      }
      style.appendChild(document.createTextNode(definition.scoped ? scopeCss(css, name) : css));
      head.appendChild(style);
      INSTALLED_STYLES[key] = true;
    });
  }

  function installWatchers(controller, watches) {
    angular.forEach(watches || {}, function (input, expression) {
      var config = typeof input === 'function' ? { handler: input } : input;
      if (!config || typeof config.handler !== 'function') {
        throw new Error('[EasyComponents] O watcher de "' + expression + '" precisa de um handler.');
      }
      var getter = typeof config.get === 'function'
        ? function () { return config.get.call(controller); }
        : function () { return controller.$scope.$eval(expression, controller); };
      var unwatch = controller.$scope.$watch(
        getter,
        function (value, previous) { config.handler.call(controller, value, previous); },
        !!config.deep
      );
      controller.__easyUnwatch.push(unwatch);
    });
  }

  function createController(name, definition, props) {
    var hooks = definition.hooks || {};
    var injections = normalizeInject(definition.inject);
    var injectionAliases = Object.keys(injections);
    var blockedStateKeys = angular.extend(
      {},
      RESERVED,
      props,
      definition.methods || {},
      definition.computed || {},
      injections
    );

    function validateStatePatch(patch) {
      angular.forEach(patch, function (_, key) {
        if (blockedStateKeys[key]) {
          throw new Error('[EasyComponents] O estado "' + key + '" colide com uma prop, metodo, computed ou nome reservado.');
        }
      });
    }

    function EasyController($element, $attrs, $scope, $document) {
      var self = this;
      var controllerArguments = arguments;
      self.$element = $element;
      self.$attrs = $attrs;
      self.$scope = $scope;
      self.__easyUnwatch = [];
      self.__easyDigestQueued = false;
      self.__easyMetric = componentMetric(name);
      self.__easyMountedAt = now();
      self.__easyMetric.created += 1;
      self.__easyMetric.active += 1;

      if (definition.scoped && $element) {
        if (typeof $element.attr === 'function') {
          $element.attr('data-easy-scope', camelToKebab(name));
        } else if ($element[0] && $element[0].setAttribute) {
          $element[0].setAttribute('data-easy-scope', camelToKebab(name));
        }
      }

      angular.forEach(injectionAliases, function (alias, index) {
        self[alias] = controllerArguments[index + 4];
      });

      installStyles(name, definition, $document);

      self.$setState = function (update) {
        var patch = typeof update === 'function' ? update.call(self, self) : update;
        if (!isObject(patch)) {
          throw new Error('[EasyComponents] $setState espera um objeto ou uma funcao que retorne um objeto.');
        }
        validateStatePatch(patch);
        angular.extend(self, patch);
        self.__easyMetric.stateUpdates += 1;
        if ((!$scope.$root || !$scope.$root.$$phase) && !self.__easyDigestQueued) {
          self.__easyDigestQueued = true;
          self.__easyMetric.digestSchedules += 1;
          $scope.$evalAsync(function () { self.__easyDigestQueued = false; });
        }
        return self;
      };

      self.$emit = function (propName, payload) {
        if (typeof self[propName] !== 'function') return undefined;
        return self[propName]({ $event: payload, $value: payload });
      };

      installMethods(self, definition.methods);
      installComputed(self, definition.computed);
    }

    EasyController.$inject = ['$element', '$attrs', '$scope', '$document'].concat(
      injectionAliases.map(function (alias) { return injections[alias]; })
    );

    EasyController.prototype.$onInit = function () {
      validateProps(this, props);
      var initialState = typeof definition.state === 'function'
        ? definition.state.call(this, this)
        : definition.state;
      if (initialState !== undefined) {
        if (!isObject(initialState)) {
          throw new Error('[EasyComponents] state precisa ser um objeto ou retornar um objeto.');
        }
        this.$setState(angular.copy(initialState));
      }
      installWatchers(this, definition.watch);
      this.__easyMetric.watchers += this.__easyUnwatch.length;
      runHook(this, hooks, 'onInit');
    };

    EasyController.prototype.$onChanges = function (changes) {
      validateProps(this, props);
      runHook(this, hooks, 'onChanges', changes);
    };

    EasyController.prototype.$postLink = function () {
      this.__easyMetric.mounted += 1;
      this.__easyMetric.mountTime += now() - this.__easyMountedAt;
      runHook(this, hooks, 'postLink');
    };

    EasyController.prototype.$onDestroy = function () {
      this.__easyMetric.destroyed += 1;
      this.__easyMetric.active = Math.max(0, this.__easyMetric.active - 1);
      this.__easyMetric.watchers = Math.max(0, this.__easyMetric.watchers - this.__easyUnwatch.length);
      angular.forEach(this.__easyUnwatch, function (unwatch) { unwatch(); });
      this.__easyUnwatch.length = 0;
      runHook(this, hooks, 'onDestroy');
    };

    return EasyController;
  }

  function toAngularComponent(name, definition) {
    var props = normalizeProps(definition.props);
    validateDefinition(name, definition, props);

    var component = {
      bindings: bindingsFrom(props),
      controller: createController(name, definition, props),
      controllerAs: definition.controllerAs || 'vm'
    };

    ['template', 'templateUrl', 'transclude', 'require', '$canActivate', '$routeConfig'].forEach(function (key) {
      if (definition[key] !== undefined) component[key] = definition[key];
    });

    return component;
  }

  function defineComponent(module, name, definition) {
    if (!module || typeof module.component !== 'function') {
      throw new Error('[EasyComponents] Informe um modulo AngularJS valido.');
    }
    module.component(name, toAngularComponent(name, definition));
    return module;
  }

  function appFacade(module, options) {
    options = options || {};
    var mounted = false;
    var mountScheduled = false;
    var bootstrapRequested = false;

    function defer(callback) {
      if (typeof queueMicrotask === 'function') {
        queueMicrotask(callback);
      } else if (typeof Promise === 'function') {
        Promise.resolve().then(callback);
      } else {
        setTimeout(callback, 0);
      }
    }

    function requestMount(element) {
      var requestedTarget = element || (typeof document !== 'undefined' ? document : null);
      var readyTarget = typeof document !== 'undefined' ? document : requestedTarget;
      if (!requestedTarget || !readyTarget) {
        throw new Error('[EasyComponents] mount precisa de um elemento DOM.');
      }
      if (mounted || bootstrapRequested) return facade;

      bootstrapRequested = true;
      angular.element(readyTarget).ready(function () {
        var target = requestedTarget;
        if (mounted) return;
        if (typeof requestedTarget === 'string') {
          target = document.querySelector(requestedTarget);
          if (!target) {
            throw new Error('[EasyComponents] Elemento de mount nao encontrado: ' + requestedTarget);
          }
        }
        mounted = true;
        angular.bootstrap(target, [module.name]);
      });
      return facade;
    }

    function scheduleAutoMount() {
      if (options.autoMount === false) return;
      if (mounted || bootstrapRequested || mountScheduled || typeof document === 'undefined') return;
      mountScheduled = true;
      defer(function () {
        mountScheduled = false;
        requestMount(document);
      });
    }

    var facade = {
      name: module.name,
      angularModule: module,
      component: function (name, definition) {
        if (mounted) {
          throw new Error('[EasyComponents] Registre "' + name + '" antes do bootstrap do app.');
        }
        defineComponent(module, name, definition);
        scheduleAutoMount();
        return facade;
      },
      register: function () {
        var registrations = Array.prototype.slice.call(arguments);

        function applyRegistration(registration) {
          if (Array.isArray(registration)) {
            angular.forEach(registration, applyRegistration);
            return;
          }
          if (isComponentDescriptor(registration)) {
            defineComponent(module, registration.name, registration.definition);
            return;
          }
          if (typeof registration !== 'function') {
            throw new Error('[EasyComponents] register espera componentes, funcoes de registro ou arrays.');
          }
          registration(facade);
        }

        angular.forEach(registrations, applyRegistration);
        scheduleAutoMount();
        return facade;
      },
      mount: function (element) {
        return requestMount(element);
      },
      start: function (element) {
        return requestMount(element);
      }
    };
    return facade;
  }

  function createApp(name, dependencies) {
    if (!name || typeof name !== 'string') {
      throw new Error('[EasyComponents] O app precisa de um nome.');
    }
    var appDependencies = (dependencies || []).slice();
    if (appDependencies.indexOf('ngEasyComponents') === -1) {
      appDependencies.unshift('ngEasyComponents');
    }
    return appFacade(angular.module(name, appDependencies));
  }

  function useApp(name) {
    return appFacade(angular.module(name));
  }

  function createConfiguredApp(config) {
    if (!isObject(config)) {
      throw new Error('[EasyComponents] createApp espera um objeto de configuracao.');
    }
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('[EasyComponents] createApp precisa do nome da aplicacao.');
    }

    var dependencies = (config.dependencies || []).slice();
    if (dependencies.indexOf('ngEasyComponents') === -1) {
      dependencies.unshift('ngEasyComponents');
    }

    if (config.csp && config.csp.styleNonce) GLOBAL_OPTIONS.styleNonce = config.csp.styleNonce;
    var facade = appFacade(angular.module(config.name, dependencies), { autoMount: false });
    if (config.components) facade.register(config.components);
    if (config.autoMount !== false) facade.start(config.root);
    return facade;
  }

  function configure(options) {
    if (!isObject(options)) throw new Error('[EasyComponents] configure espera um objeto.');
    angular.extend(GLOBAL_OPTIONS, options);
    return publicApi;
  }

  function mountTestComponent(component, options) {
    if (!isComponentDescriptor(component)) {
      throw new Error('[EasyComponents] testing.mount espera um componente criado com defineComponent.');
    }
    if (!angular.injector || !angular.element) {
      throw new Error('[EasyComponents] testing.mount precisa do AngularJS completo no navegador.');
    }
    options = options || {};
    TEST_APP_ID += 1;
    var moduleName = 'easyComponentsTest' + TEST_APP_ID;
    var module = angular.module(moduleName, ['ngEasyComponents']);
    defineComponent(module, component.name, component.definition);
    var props = normalizeProps(component.definition.props);
    var attributes = [];

    angular.forEach(props, function (config, name) {
      var attribute = camelToKebab(name);
      if (config.binding.charAt(0) === '@') {
        attributes.push(attribute + '="{{ __easyProps.' + name + ' }}"');
      } else if (config.binding.charAt(0) === '&') {
        attributes.push(attribute + '="__easyEvents.' + name + '($event)"');
      } else {
        attributes.push(attribute + '="__easyProps.' + name + '"');
      }
    });

    var host = angular.element('<div data-easy-test-host></div>');
    var injector = angular.bootstrap(host[0], [moduleName]);
    var rootScope = injector.get('$rootScope');
    var compile = injector.get('$compile');
    rootScope.__easyProps = angular.copy(options.props || {});
    rootScope.__easyEvents = options.events || {};
    var markup = '<' + component.selector + (attributes.length ? ' ' + attributes.join(' ') : '') + '>' +
      (options.content || '') + '</' + component.selector + '>';
    var element = compile(angular.element(markup))(rootScope);
    host.append(element);
    rootScope.$digest();
    var isolateScope = element.isolateScope();
    var controller = isolateScope && isolateScope[component.definition.controllerAs || 'vm'];
    var destroyed = false;

    return {
      element: element,
      controller: controller,
      scope: rootScope,
      update: function (nextProps) {
        angular.extend(rootScope.__easyProps, nextProps || {});
        rootScope.$digest();
        return this;
      },
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        rootScope.$destroy();
        host.remove();
      }
    };
  }

  var pluginModule = angular.module('ngEasyComponents', []);
  pluginModule.constant('EASY_COMPONENTS_VERSION', VERSION);

  var modulePrototype = Object.getPrototypeOf(pluginModule);
  if (!modulePrototype.easyComponent) {
    Object.defineProperty(modulePrototype, 'easyComponent', {
      configurable: true,
      value: function (name, definition) {
        return defineComponent(this, name, definition);
      }
    });
  }

  var publicApi = {
    version: VERSION,
    module: 'ngEasyComponents',
    app: createApp,
    createApp: createConfiguredApp,
    configure: configure,
    defineComponent: defineComponentDescriptor,
    use: useApp,
    define: defineComponent,
    toAngularComponent: toAngularComponent,
    metrics: metricsSnapshot,
    testing: {
      mount: mountTestComponent
    },
    props: {
      text: textProp,
      number: numberProp,
      boolean: booleanProp,
      object: objectProp,
      array: arrayProp,
      event: eventProp,
      required: requiredProp
    },
    text: textProp,
    number: numberProp,
    boolean: booleanProp,
    object: objectProp,
    array: arrayProp,
    event: eventProp,
    required: requiredProp
  };
  return publicApi;
}));
