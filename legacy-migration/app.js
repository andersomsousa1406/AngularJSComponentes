import components from './components/index.js';
import services from './services/index.js';
import DemoRoot from './demo/demo-root.component.js';

EasyComponents.createApp({
  name: 'legacyMigrationDemo',
  dependencies: window.GcLegacyEngine ? [window.GcLegacyEngine.module] : [],
  components: services.concat(components, [DemoRoot])
});
