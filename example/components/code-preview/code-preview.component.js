import template from './code-preview.html';
import styles from './code-preview.css';

var EXAMPLES = {
  component: "import template from './profile-card.html';\nimport styles from './profile-card.css';\n\nexport default function register(app) {\n  return app.component('profileCard', {\n    props: { user: Object, onSave: Function },\n    state: { editing: false },\n    methods: {\n      save: function () {\n        this.$emit('onSave', this.user);\n      }\n    },\n    template: template,\n    styles: styles\n  });\n}",
  template: '<article class="profile-card">\n  <img ng-src="{{ vm.user.avatar }}" alt="">\n  <h3>{{ vm.user.name }}</h3>\n  <button ng-click="vm.save()">Salvar</button>\n</article>',
  app: "import registerProfile from './profile-card.component.js';\n\nangular.module('myApp', ['ngEasyComponents']);\n\nEasyComponents\n  .use('myApp')\n  .register(registerProfile);"
};

export default function registerCodePreview(app) {
  return app.component('codePreview', {
    state: {
      active: 'component',
      copied: false
    },
    computed: {
      code: function () {
        return EXAMPLES[this.active];
      }
    },
    methods: {
      select: function (tab) {
        this.$setState({ active: tab, copied: false });
      },
      copy: function () {
        var vm = this;
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(vm.code).then(function () {
          vm.$setState({ copied: true });
          window.setTimeout(function () { vm.$setState({ copied: false }); }, 1400);
        });
      }
    },
    template: template,
    styles: styles
  });
}
