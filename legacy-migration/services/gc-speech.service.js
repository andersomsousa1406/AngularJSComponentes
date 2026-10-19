import { createSpeechClient, createDefaultSpeechCommands } from './speech-client.js';

export default function registerGcSpeech(app) {
  app.angularModule.factory('GcSpeech', ['$window', '$q', '$rootScope', 'GcApi', function ($window, $q, $rootScope, api) {
    var Recognition = $window.SpeechRecognition || $window.webkitSpeechRecognition;
    var recognition = null;

    function listen(options) {
      if (!Recognition) return $q.reject(new Error('Reconhecimento de voz nao suportado.'));
      options = options || {};
      return $q(function (resolve, reject) {
        recognition = new Recognition();
        recognition.lang = options.lang || 'pt-BR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = function (event) { resolve(event.results[0][0].transcript); };
        recognition.onerror = function (event) { reject(new Error(event.error || 'Falha no reconhecimento de voz.')); };
        recognition.onend = function () { recognition = null; };
        recognition.start();
      });
    }
    function stop() { if (recognition) recognition.stop(); }

    function create(options) {
      options = Object.assign({}, options);
      var onError = options.onError || function (error) { $rootScope.$broadcast('gcSpeech:error', error); };
      if (!options.commands) options.commands = ($window.LISTA_METODOS_RECOGNIZER || []).concat(
        createDefaultSpeechCommands($window.open.bind($window), api, options.baseUrl || $window.urlhost || '', onError));
      options.onError = onError;
      return createSpeechClient({ Recognition: Recognition, update: function (callback) { $rootScope.$evalAsync(callback); } }, options);
    }
    var client = create();
    var stopCommands = client.stop;
    return Object.assign(client, { create: create, supported: !!Recognition, listen: listen,
      stop: function () { stopCommands(); stop(); }, stopListening: stop });
  }]);
  return app;
}
