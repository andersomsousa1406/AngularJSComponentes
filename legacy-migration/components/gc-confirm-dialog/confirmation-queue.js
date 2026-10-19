// Declarative dialog state. Rendering belongs to gc-confirm-dialog's template.
export function createConfirmationQueue(schedule, cancel, notify, reportError) {
  var timers = new Set();
  var disposed = false;
  var sequence = 0;
  function later(callback, delay) {
    var timer = schedule(function () {
      timers.delete(timer);
      if (!disposed) callback();
    }, delay);
    timers.add(timer);
    return timer;
  }
  function copy(value) { return angular.copy(value); }
  var queue = {
    ID: '', confirmacao_id: '', componente: '', model: '', titulo: '', lista: [],
    alto_fechar: false, key_object_scop: -1,
    agendada_Confirmacao: function () {},
    obtn_sim: { desc: 'Sim', class: 'btn-primary', ret: '1', hotkey: 'enter', glyphicon: 'class-btn1 glyphicon-ok' },
    obtn_ok: { desc: 'Confirmar', class: 'btn-primary', ret: '1', hotkey: 'enter', glyphicon: 'class-btn2 glyphicon-ok' },
    obtn_gravar: { desc: 'Gravar', class: 'btn-success', ret: '1', hotkey: 'f1', glyphicon: 'class-btn2 glyphicon-ok' },
    obtn_nao: { desc: 'Não', class: 'btn-danger ', ret: '2', hotkey: 'esc', glyphicon: 'class-btn3 glyphicon-ban-circle' },
    obtn_cancelar: { desc: 'Cancelar', class: 'btn-danger ', ret: '2', hotkey: 'esc', glyphicon: 'class-btn4 glyphicon-ban-circle' },
    obtn_voltar: { desc: 'Voltar', class: 'btn-default', ret: '2', hotkey: 'esc', glyphicon: 'class-btn5 glyphicon-chevron-left' },
    closeAll: function () { queue.lista.forEach(function (dialog) { dialog.fechar(); }); },
    add: function (tipo, titulo, pergunta, botao, func, fechar, classe, classe_size) {
      if (disposed) throw new Error('Confirmacao destruida.');
      var model = queue.model + '.lista[' + queue.lista.length + ']';
      var localTimers = new Set();
      function defer(callback, delay) {
        var timer = later(function () { localTimers.delete(timer); callback(); }, delay);
        localTimers.add(timer);
        return timer;
      }
      var dialog = {
        id: queue.lista.length + '_' + (++sequence), tipo: tipo, titulo: titulo,
        pergunta: String(pergunta).split('#MODEL#').join(model), botao: botao, func: func,
        alto_fechar: fechar !== 'N', model: model, html: '', botoes: '', CSS_TITULO: '',
        classe: classe || '', classe_size: classe_size || '', hidden: false, closed: false,
        cancelar: function (event) { if (dialog.alto_fechar) dialog.fechar(event); },
        fechar: function () {
          dialog.closed = true;
          localTimers.forEach(function (timer) { cancel(timer); timers.delete(timer); });
          localTimers.clear();
          notify();
        },
        hide: function () { dialog.hidden = true; notify(); },
        show: function () { dialog.hidden = false; notify(); }
      };
      // Preserve the legacy mutation and pairing of the caller's arrays.
      botao.reverse(); func.reverse();
      botao.forEach(function (button, index) {
        var current = botao[index] = copy(button);
        current.aguardar = current.aguardar === undefined ? false : current.aguardar;
        current.aguardar2 = current.aguardar2 === undefined ? false : current.aguardar2;
        current.TEMPO_AGUARDAR = current.TEMPO_AGUARDAR === undefined ? 0 : current.TEMPO_AGUARDAR;
        current.click = func[index];
        current.pai = dialog;
        current.executar = function (event, selected) {
          selected = selected || current;
          if (dialog.closed || (selected.aguardar2 && selected.TEMPO_AGUARDAR > 0)) return;
          if (event && event.target && event.target.focus) event.target.focus();
          queue.Time1 = defer(function () {
            try {
              selected.click(event, selected);
              if (dialog.alto_fechar) { dialog.fechar(); selected.pai = {}; }
            } catch (error) { reportError(error); }
            notify();
          }, 0);
        };
        current.timeAguardar = function () {
          if (dialog.closed) return;
          current.TEMPO_AGUARDAR -= 1;
          defer(function () { if (current.TEMPO_AGUARDAR > 0) current.timeAguardar(); notify(); }, 1000);
          notify();
        };
        if (current.aguardar) current.timeAguardar();
        if (current.aguardar2) current.timeAguardar();
      });
      queue.lista.push(dialog);
      notify();
      return dialog;
    },
    destroy: function () {
      disposed = true;
      timers.forEach(cancel);
      timers.clear();
      queue.lista.forEach(function (dialog) { dialog.closed = true; });
    }
  };
  return queue;
}
