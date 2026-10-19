export default function registerGcControllerActions(app) {
  app.angularModule.factory('GcControllerActions', ['$q', '$timeout', '$document', function ($q, $timeout, $document) {
    var defaultActions = {
      create: function (controller) {
        var model = controller.TabelaPrincipal && controller.TabelaPrincipal.model_tabela;
        if (!model || typeof model.incluir !== 'function') throw new Error('Método incluir não encontrado, entre em contato o suporte.');
        return model.incluir();
      }
    };
    function run(action, controller, actions, owner) {
      var handler = (actions && actions[action]) || defaultActions[action];
      if (typeof handler !== 'function') return $q.reject(new Error('Acao nao registrada: ' + action));
      try {
        return $q.when(handler(controller, owner));
      } catch (error) {
        return $q.reject(error);
      }
    }

    function create(controller, actions, options) {
      options = options || {};
      var timer;
      var disposed = false;
      var client = {
        defaultActions: defaultActions,
        init: function (action) {
          if (disposed) return $q.reject(new Error('ControllerActions destruido.'));
          if (action === undefined) {
            var input = $document[0].getElementById('_action_app_page');
            action = input && input.value;
          }
          if (!action) return $q.when();
          return run(action, controller || {}, actions || {}, client);
        },
        destroy: function () { disposed = true; if (timer) $timeout.cancel(timer); }
      };
      if (options.autoInit !== false) timer = $timeout(function () {
        return client.init(options.action).catch(function (error) {
          client.error = error;
          if (options.onError) options.onError(error);
        });
      }, options.delay === undefined ? 1000 : options.delay);
      return client;
    }
    return { run: run, create: create, defaultActions: defaultActions };
  }]);
  return app;
}
