import template from './user-list.html';
import styles from './user-list.css';

export default function registerUserList(app) {
  return app.component('userList', {
    props: { users: { type: Array, required: true } },
    computed: {
      onlineCount: function () { return this.users.filter(function (user) { return user.online; }).length; }
    },
    template: template,
    styles: styles
  });
}
