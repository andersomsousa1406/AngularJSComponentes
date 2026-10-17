import template from './gc-legacy-host.html';
import styles from './gc-legacy-host.css';

function isPlainObject(value) {
  return value && Object.prototype.toString.call(value) === '[object Object]';
}

function merge(target, source) {
  Object.keys(source || {}).forEach(function (key) {
    if (isPlainObject(source[key]) && isPlainObject(target[key])) merge(target[key], source[key]);
    else target[key] = source[key];
  });
  return target;
}

export default EasyComponents.defineComponent('gc-legacy-host', {
  inject: {
    injector: '$injector',
    timeout: '$timeout'
  },

  props: {
    factory: EasyComponents.required(EasyComponents.text()),
    config: EasyComponents.object(function () { return {}; }),
    args: EasyComponents.array(function () { return []; }),
    createMethod: EasyComponents.text('getNew'),
    compileMethod: EasyComponents.text('compile'),
    model: EasyComponents.text('vm.instance'),
    onReady: EasyComponents.event(),
    onError: EasyComponents.event()
  },

  state: function () {
    return { instance: null, owner: null, mounted: false, error: null };
  },

  methods: {
    create: function () {
      if (!this.injector.has(this.factory)) throw new Error('Factory legado nao registrado: ' + this.factory);
      var Constructor = this.injector.get(this.factory);
      var owner = Reflect.construct(Constructor, this.args || []);
      var instance = this.createMethod && typeof owner[this.createMethod] === 'function'
        ? owner[this.createMethod]()
        : owner;
      merge(instance, this.config || {});
      instance.model = this.model;
      this.$setState({ owner: owner, instance: instance, error: null });
      return instance;
    },
    compile: function () {
      var instance = this.instance || this.create();
      var mount = this.$element[0].querySelector('[data-legacy-mount]');
      instance.componente = mount;
      if (this.compileMethod && typeof instance[this.compileMethod] === 'function') {
        instance[this.compileMethod]();
      }
      this.$setState({ mounted: true });
      this.$emit('onReady', instance);
      return instance;
    },
    recompile: function () {
      if (!this.mounted) return;
      this.destroyInstance(false);
      this.create();
      this.compile();
    },
    destroyInstance: function (clearReference) {
      var instance = this.instance;
      if (!instance) return;
      Object.keys(instance).forEach(function (key) {
        if (/^Time\d*$/.test(key)) this.timeout.cancel(instance[key]);
      }, this);
      ['childScope', 'scope'].forEach(function (key) {
        if (instance[key] && typeof instance[key].$destroy === 'function' && !instance[key].$$destroyed) instance[key].$destroy();
      });
      ['compiledElement', 'compiledElement2'].forEach(function (key) {
        if (instance[key] && typeof instance[key].remove === 'function') instance[key].remove();
      });
      if (typeof instance.destroy === 'function') instance.destroy();
      if (clearReference !== false) this.$setState({ instance: null, owner: null, mounted: false });
    }
  },

  hooks: {
    onInit: function () {
      try { this.create(); } catch (error) { this.$setState({ error: error }); this.$emit('onError', error); }
    },
    postLink: function () {
      if (this.error) return;
      try { this.compile(); } catch (error) { this.$setState({ error: error }); this.$emit('onError', error); }
    },
    onChanges: function (changes) {
      if (!this.mounted || (!changes.config && !changes.args)) return;
      try { this.recompile(); } catch (error) { this.$setState({ error: error }); this.$emit('onError', error); }
    },
    onDestroy: function () { this.destroyInstance(); }
  },

  template: template,
  styles: styles,
  scoped: true
});
