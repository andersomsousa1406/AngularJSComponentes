import { createEpcClient } from './epc-client.js';

export default function registerGcRfid(app) {
  app.angularModule.factory('GcRfid', ['GcDeviceBridge', 'GcApi', function (devices, api) {
    var listeners = [];
    var reading = false;

    function notify(tag) { listeners.slice().forEach(function (listener) { listener(tag); }); }
    function start(options) {
      return devices.command('rfid/iniciar', options || {}).then(function (result) {
        reading = true;
        (result.tags || []).forEach(notify);
        return result;
      });
    }
    function stop() { reading = false; return devices.command('rfid/parar'); }
    function subscribe(listener) {
      listeners.push(listener);
      return function () { listeners = listeners.filter(function (current) { return current !== listener; }); };
    }

    function create(options) { return { epcAvulso: createEpcClient(api, options) }; }
    return { start: start, stop: stop, subscribe: subscribe, isReading: function () { return reading; }, create: create,
      epcAvulso: createEpcClient(api) };
  }]);
  return app;
}
