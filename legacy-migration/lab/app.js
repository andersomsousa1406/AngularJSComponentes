import components from '../components/index.js';
import services from '../services/index.js';
import backend from './backend.js';
import LabRoot from './lab-root.component.js';

EasyComponents.createApp({ name: 'migrationLab', components: services.concat([backend], components, [LabRoot]) });
