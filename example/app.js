import registerValueDisplay from './components/value-display/value-display.component.js';
import registerPerformanceLab from './components/performance-lab/performance-lab.component.js';
import registerAppRoot from './components/app-root/app-root.component.js';
import registerCounterCard from './components/counter-card/counter-card.component.js';

// AngularJS: cria somente o modulo da aplicacao.
angular.module('demoApp', ['ngEasyComponents']);

// Easy Components: registra os componentes importados no modulo.
var app = EasyComponents.use('demoApp');

app.register(
  registerValueDisplay,
  registerPerformanceLab,
  registerAppRoot,
  registerCounterCard
);
