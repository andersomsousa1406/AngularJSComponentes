import registerValueDisplay from './components/value-display/value-display.component.js';
import registerPerformanceLab from './components/performance-lab/performance-lab.component.js';
import registerAppRoot from './components/app-root/app-root.component.js';
import registerCounterCard from './components/counter-card/counter-card.component.js';
import registerFeatureCard from './components/feature-card/feature-card.component.js';
import registerTaskItem from './components/task-item/task-item.component.js';
import registerTaskBoard from './components/task-board/task-board.component.js';
import registerThemeSwitcher from './components/theme-switcher/theme-switcher.component.js';
import registerCodePreview from './components/code-preview/code-preview.component.js';
import registerActivityFeed from './components/activity-feed/activity-feed.component.js';
import registerUiTabs from './components/ui-tabs/ui-tabs.component.js';
import registerUiButton from './components/ui-button/ui-button.component.js';
import registerUiBadge from './components/ui-badge/ui-badge.component.js';
import registerUiAlert from './components/ui-alert/ui-alert.component.js';
import registerUiSelect from './components/ui-select/ui-select.component.js';
import registerUiPagination from './components/ui-pagination/ui-pagination.component.js';
import registerDataTable from './components/data-table/data-table.component.js';
import registerStatCard from './components/stat-card/stat-card.component.js';
import registerProductCard from './components/product-card/product-card.component.js';
import registerUserList from './components/user-list/user-list.component.js';
import registerAccordionList from './components/accordion-list/accordion-list.component.js';
import registerDemoForm from './components/demo-form/demo-form.component.js';
import registerUiModal from './components/ui-modal/ui-modal.component.js';
import registerComponentShowcase from './components/component-showcase/component-showcase.component.js';

// AngularJS: cria somente o modulo da aplicacao.
angular.module('demoApp', ['ngEasyComponents']);

// Easy Components: registra os componentes importados no modulo.
var app = EasyComponents.use('demoApp');

app.register(
  registerValueDisplay,
  registerPerformanceLab,
  registerAppRoot,
  registerCounterCard,
  registerFeatureCard,
  registerTaskItem,
  registerTaskBoard,
  registerThemeSwitcher,
  registerCodePreview,
  registerActivityFeed,
  registerUiTabs,
  registerUiButton,
  registerUiBadge,
  registerUiAlert,
  registerUiSelect,
  registerUiPagination,
  registerDataTable,
  registerStatCard,
  registerProductCard,
  registerUserList,
  registerAccordionList,
  registerDemoForm,
  registerUiModal,
  registerComponentShowcase
);
