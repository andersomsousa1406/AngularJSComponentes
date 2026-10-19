export default function registerToast(app) {
  app.angularModule.factory('GToast', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
    let sequence = 0; const timers = new Map();
    const service = { items: [],
      dismiss: function (id) { if (timers.has(id)) $timeout.cancel(timers.get(id)); timers.delete(id); service.items = service.items.filter(item => item.id !== id); },
      show: function (title, message = '', color = 'info', duration = 4500) {
        const id = ++sequence; service.items = service.items.concat({ id, title, message, color });
        while (service.items.length > 5) service.dismiss(service.items[0].id);
        if (duration > 0) timers.set(id, $timeout(() => { timers.delete(id); service.dismiss(id); }, duration));
        return id;
      }
    };
    ['success', 'danger', 'warning', 'info'].forEach(color => { service[color] = (title, message, duration) => service.show(title, message, color, duration); });
    $rootScope.$on('$destroy', () => { timers.forEach(timer => $timeout.cancel(timer)); timers.clear(); service.items = []; });
    return service;
  }]);
}
