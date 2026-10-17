export default function registerGcRfid(app) {
  app.angularModule.factory('GcRfid', ['GcDeviceBridge', function (devices) {
    var listeners = [];
    var reading = false;

    function notify(tag) { listeners.slice().forEach(function (listener) { listener(tag); }); }
    function start(options) {
      reading = true;
      return devices.command('rfid/iniciar', options || {}).then(function (result) {
        (result.tags || []).forEach(notify);
        return result;
      });
    }
    function stop() { reading = false; return devices.command('rfid/parar'); }
    function subscribe(listener) {
      listeners.push(listener);
      return function () { listeners = listeners.filter(function (current) { return current !== listener; }); };
    }

    return { start: start, stop: stop, subscribe: subscribe, isReading: function () { return reading; } };
  }]);
  return app;
}
