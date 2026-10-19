(function (window, angular) {
  'use strict';

  window.getCurrentNonce = window.getCurrentNonce || function () { return ''; };
  window.trim_null = window.trim_null || function (value) { return value === null || value === undefined ? '' : String(value).trim(); };
  window.$ = window.$ || function () {
    return { scrollTop: function () { return 0; }, length: 0 };
  };

  function collect(target, entries, prefix, seen) {
    if (!target || (typeof target !== 'object' && typeof target !== 'function')) return;
    if (seen.indexOf(target) !== -1) return;
    seen.push(target);
    Object.keys(target).forEach(function (key) {
      var value = target[key];
      var path = prefix ? prefix + (Array.isArray(target) ? '[' + key + ']' : '.' + key) : key;
      entries[path] = typeof value === 'function' ? 'method' : 'property';
      if (value && (Array.isArray(value) || Object.prototype.toString.call(value) === '[object Object]')) collect(value, entries, path, seen);
    });
  }

  var noopPromise = {
    then: function () { return noopPromise; },
    catch: function () { return noopPromise; },
    finally: function () { return noopPromise; }
  };
  var ajax = {
    get: function () { return noopPromise; },
    post: function () { return noopPromise; },
    put: function () { return noopPromise; },
    delete: function () { return noopPromise; }
  };

  angular.module('legacyEngineContract', ['gcLegacyEngine'])
    .value('$ajax', ajax)
    .value('gcCollection', {})
    .value('gcObject', {})
    .value('gScope', { childScopes: [] })
    .value('Upload', {})
    .value('safeCompiler', {})
    .value('MemoryCleaner', {})
    .run(['$injector', function ($injector) {
      try {
        var registered = window.GcLegacyEngine.factories.filter(function (name) { return $injector.has(name); });
        var Consulta = $injector.get('$consulta');
        var consultaFactory = new Consulta();
        var consulta = consultaFactory.getNew();
        var consultaEntries = {};
        collect(consultaFactory, consultaEntries, '', []);
        collect(Object.getPrototypeOf(consultaFactory), consultaEntries, '', []);
        collect(consulta, consultaEntries, '', []);

        var TabelaJS = $injector.get('TabelaJS');
        var tabelaFactory = new TabelaJS();
        var tabela = tabelaFactory.getNew();
        var tabelaEntries = {};
        collect(tabelaFactory, tabelaEntries, '', []);
        collect(Object.getPrototypeOf(tabelaFactory), tabelaEntries, '', []);
        collect(tabelaFactory.default_table, tabelaEntries, '', []);
        collect(tabela, tabelaEntries, '', []);

        window.legacyEngineContract = {
          passed: true,
          registered: registered,
          consulta: consultaEntries,
          tabela: tabelaEntries
        };
        document.getElementById('contract-status').textContent = 'Pronto';
      } catch (error) {
        window.legacyEngineContract = { passed: false, error: error.stack || error.message || String(error) };
        document.getElementById('contract-status').textContent = 'Falhou';
      }
    }]);

  angular.bootstrap(document, ['legacyEngineContract']);
}(window, window.angular));
