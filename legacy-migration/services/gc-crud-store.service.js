import { createCrudClient } from './crud-client.js';

export default function registerGcCrudStore(app) {
  app.angularModule.factory('GcCrudStore', ['$q', 'GcApi', function ($q, api) {
    function create(options) {
      options = options || {};
      var adapter = options.adapter || {};
      var store = {
        items: [],
        selected: null,
        loading: false,
        error: null,
        query: {},
        list: function (query) {
          store.loading = true;
          store.error = null;
          store.query = query || store.query;
          return $q.when(adapter.list ? adapter.list(store.query) : []).then(function (items) {
            store.items = items || [];
            return store.items;
          }).catch(fail).finally(done);
        },
        save: function (item) {
          store.loading = true;
          return $q.when(adapter.save ? adapter.save(item) : item).then(function (saved) {
            var key = options.trackBy || 'ID';
            var index = store.items.findIndex(function (current) { return current[key] === saved[key]; });
            if (index >= 0) store.items[index] = saved;
            else store.items.push(saved);
            store.selected = saved;
            return saved;
          }).catch(fail).finally(done);
        },
        remove: function (item) {
          store.loading = true;
          return $q.when(adapter.remove ? adapter.remove(item) : item).then(function () {
            var key = options.trackBy || 'ID';
            store.items = store.items.filter(function (current) { return current[key] !== item[key]; });
            if (store.selected && store.selected[key] === item[key]) store.selected = null;
            return item;
          }).catch(fail).finally(done);
        },
        select: function (item) { store.selected = item; return item; },
        clear: function () { store.selected = null; store.error = null; }
      };

      function fail(error) { store.error = error; return $q.reject(error); }
      function done() { store.loading = false; }
      return store;
    }

    return { create: create, getNew: function (configuration, environment) { return createCrudClient(api, configuration, environment); } };
  }]);
  return app;
}
