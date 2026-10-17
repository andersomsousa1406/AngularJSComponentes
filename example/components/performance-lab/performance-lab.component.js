import template from './performance-lab.html';
import styles from './performance-lab.css';

function countScopes(scope) {
  var count = 0;

  function visit(current) {
    var child;
    if (!current) return;
    count += 1;
    child = current.$$childHead;
    while (child) {
      visit(child);
      child = child.$$nextSibling;
    }
  }

  visit(scope);
  return count;
}

function heapSize() {
  if (!window.performance || !window.performance.memory) return null;
  return window.performance.memory.usedJSHeapSize;
}

export default function registerPerformanceLab(app) {
  // Componente interno usado para exercitar compilacao, bindings e destruicao.
  app.component('benchmarkProbe', {
    props: {
      value: Number
    },
    watch: {
      value: function () {}
    },
    template: '<span class="benchmark-probe">{{ vm.value }}</span>'
  });

  return app.component('performanceLab', {
    state: {
      items: [],
      running: false,
      result: null
    },

    methods: {
      run: function () {
        var vm = this;
        var cycles = 20;
        var size = 150;
        var updatesPerCycle = 4;

        if (vm.running) return;
        vm.$setState({ running: true, result: null });

        window.setTimeout(function () {
          var rootScope = vm.$scope.$root;
          var scopesBefore = countScopes(rootScope);
          var heapBefore;
          var startedAt;
          var cycle;
          var update;
          var index;
          var items;

          if (window.gc) window.gc();
          heapBefore = heapSize();
          startedAt = window.performance ? window.performance.now() : Date.now();

          for (cycle = 0; cycle < cycles; cycle += 1) {
            items = [];
            for (index = 0; index < size; index += 1) {
              items.push({ id: cycle + '-' + index, value: index });
            }
            vm.$setState({ items: items });
            vm.$scope.$digest();

            for (update = 0; update < updatesPerCycle; update += 1) {
              items = items.map(function (item) {
                return { id: item.id, value: item.value + 1 };
              });
              vm.$setState({ items: items });
              vm.$scope.$digest();
            }

            vm.$setState({ items: [] });
            vm.$scope.$digest();
          }

          var duration = (window.performance ? window.performance.now() : Date.now()) - startedAt;
          items = null;

          window.setTimeout(function () {
            if (window.gc) window.gc();
            var scopesAfter = countScopes(rootScope);
            var heapAfter = heapSize();
            var remainingNodes = document.querySelectorAll('benchmark-probe').length;
            var compiled = cycles * size;

            vm.$setState({
              running: false,
              result: {
                passed: scopesAfter === scopesBefore && remainingNodes === 0,
                compiled: compiled,
                bindingUpdates: compiled * updatesPerCycle,
                duration: Math.round(duration),
                componentsPerSecond: Math.round(compiled / (duration / 1000)),
                scopeDelta: scopesAfter - scopesBefore,
                remainingNodes: remainingNodes,
                heapDelta: heapBefore === null || heapAfter === null ? null : heapAfter - heapBefore,
                runtime: EasyComponents.metrics().totals
              }
            });
          }, 50);
        }, 0);
      }
    },

    hooks: {
      postLink: function () {
        window.setTimeout(this.run, 50);
      }
    },

    template: template,
    styles: styles
  });
}
