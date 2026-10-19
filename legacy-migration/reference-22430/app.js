import components from '../components/index.js';
import services from '../services/index.js';
import backend from './backend.js';
import screen from './screen.component.js';
EasyComponents.createApp({ name: 'reference22430', components: services.concat([backend], components, [screen]) });
