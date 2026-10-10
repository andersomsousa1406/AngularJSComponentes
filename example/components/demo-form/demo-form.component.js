import template from './demo-form.html';
import styles from './demo-form.css';

export default function registerDemoForm(app) {
  return app.component('demoForm', {
    state: {
      name: '',
      email: '',
      role: 'developer',
      plan: 'team',
      updates: true,
      submitted: false,
      roleOptions: [
        { value: 'developer', label: 'Desenvolvimento' },
        { value: 'designer', label: 'Design de produto' },
        { value: 'manager', label: 'Gestao de projeto' }
      ]
    },
    computed: {
      valid: function () { return this.name.length >= 2 && this.email.indexOf('@') > 0; }
    },
    methods: {
      setRole: function (role) { this.$setState({ role: role }); },
      submit: function () {
        if (this.valid) this.$setState({ submitted: true });
      }
    },
    template: template,
    styles: styles
  });
}
