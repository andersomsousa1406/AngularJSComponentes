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

  var VERSION = '0.1.0';
  var INSTALLED_STYLES = {};
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
    __easyUnwatch: true
  };

  function own(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
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
      head.appendChild(link);
      INSTALLED_STYLES[key] = true;
    });

    var inlineStyles = Array.isArray(definition.styles) ? definition.styles : [definition.styles];
    angular.forEach(inlineStyles, function (css, index) {
      if (!css) return;
      var key = 'inline:' + name + ':' + index;
      if (INSTALLED_STYLES[key]) return;
      var style = document.createElement('style');
      style.type = 'text/css';
      style.setAttribute('data-easy-component-style', name);
      style.appendChild(document.createTextNode(css));
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
    var blockedStateKeys = angular.extend(
      {},
      RESERVED,
      props,
      definition.methods || {},
      definition.computed || {}
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
      self.$element = $element;
      self.$attrs = $attrs;
      self.$scope = $scope;
      self.__easyUnwatch = [];

      installStyles(name, definition, $document);

      self.$setState = function (update) {
        var patch = typeof update === 'function' ? update.call(self, self) : update;
        if (!isObject(patch)) {
          throw new Error('[EasyComponents] $setState espera um objeto ou uma funcao que retorne um objeto.');
        }
        validateStatePatch(patch);
        angular.extend(self, patch);
        if (!$scope.$root || !$scope.$root.$$phase) {
          $scope.$evalAsync(angular.noop);
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

    EasyController.$inject = ['$element', '$attrs', '$scope', '$document'];

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
      runHook(this, hooks, 'onInit');
    };

    EasyController.prototype.$onChanges = function (changes) {
      validateProps(this, props);
      runHook(this, hooks, 'onChanges', changes);
    };

    EasyController.prototype.$postLink = function () {
      runHook(this, hooks, 'postLink');
    };

    EasyController.prototype.$onDestroy = function () {
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

  function appFacade(module) {
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
      var target = element || (typeof document !== 'undefined' ? document : null);
      if (!target) {
        throw new Error('[EasyComponents] mount precisa de um elemento DOM.');
      }
      if (mounted || bootstrapRequested) return facade;

      bootstrapRequested = true;
      angular.element(target).ready(function () {
        if (mounted) return;
        mounted = true;
        angular.bootstrap(target, [module.name]);
      });
      return facade;
    }

    function scheduleAutoMount() {
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
          if (typeof registration !== 'function') {
            throw new Error('[EasyComponents] register espera funcoes de registro ou arrays de funcoes.');
          }
          registration(facade);
        }

        angular.forEach(registrations, applyRegistration);
        scheduleAutoMount();
        return facade;
      },
      mount: function (element) {
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

  return {
    version: VERSION,
    module: 'ngEasyComponents',
    app: createApp,
    use: useApp,
    define: defineComponent,
    toAngularComponent: toAngularComponent
  };
}));
