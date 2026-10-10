import template from './accordion-list.html';
import styles from './accordion-list.css';

export default function registerAccordionList(app) {
  return app.component('accordionList', {
    state: {
      openId: 1,
      items: [
        { id: 1, title: 'Componentes funcionam com servicos AngularJS?', text: 'Sim. A definicao final continua sendo um componente AngularJS nativo e pode usar injecao e recursos existentes.' },
        { id: 2, title: 'Posso aninhar componentes?', text: 'Sim. Props descem para os filhos e eventos retornam ao pai usando o fluxo normal do AngularJS.' },
        { id: 3, title: 'Os estilos geram novas requisicoes?', text: 'Nao no build demonstrado. HTML e CSS sao importados como texto e incorporados ao bundle.' },
        { id: 4, title: 'O mount precisa ser chamado?', text: 'Nao. O primeiro registro agenda um bootstrap automatico, depois que todos os componentes sincronicos foram registrados.' }
      ]
    },
    methods: {
      toggle: function (id) { this.$setState({ openId: this.openId === id ? null : id }); }
    },
    template: template,
    styles: styles
  });
}
