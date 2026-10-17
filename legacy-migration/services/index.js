import registerGcApi from './gc-api.service.js';
import registerGcControllerActions from './gc-controller-actions.service.js';
import registerGcCrudStore from './gc-crud-store.service.js';
import registerGcDeviceBridge from './gc-device-bridge.service.js';
import registerGcRfid from './gc-rfid.service.js';
import registerGcSpeech from './gc-speech.service.js';
import registerGcSpeedTest from './gc-speed-test.service.js';

export default [
  registerGcApi,
  registerGcControllerActions,
  registerGcCrudStore,
  registerGcDeviceBridge,
  registerGcRfid,
  registerGcSpeech,
  registerGcSpeedTest
];
