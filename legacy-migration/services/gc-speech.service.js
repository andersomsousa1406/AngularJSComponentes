export default function registerGcSpeech(app) {
  app.angularModule.factory('GcSpeech', ['$window', '$q', function ($window, $q) {
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

    return { supported: !!Recognition, listen: listen, stop: stop };
  }]);
  return app;
}
