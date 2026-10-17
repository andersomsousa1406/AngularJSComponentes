export default function registerGcControllerActions(app) {
  app.angularModule.factory('GcControllerActions', ['$q', function ($q) {
    function run(action, controller, actions) {
      var handler = actions && actions[action];
      if (typeof handler !== 'function') return $q.reject(new Error('Acao nao registrada: ' + action));
      try {
        return $q.when(handler(controller));
      } catch (error) {
        return $q.reject(error);
      }
    }

    return { run: run };
  }]);
  return app;
}
