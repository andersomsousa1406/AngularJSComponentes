# GCWeb UI Kit

17 componentes novos para a arquitetura EasyComponents deste repositorio, inspirados em `C:\Projetos\gcweb-evolution\Frontend\src\components`. O projeto de referencia foi consultado somente para leitura. Esta e uma biblioteca nova; nao e uma conversao dos componentes antigos nem uma copia das dependencias Angular/CoreUI daquele projeto.

Os componentes usam AngularJS 1.8 e EasyComponents ja disponiveis aqui. Nao precisam de Bootstrap, Font Awesome, CoreUI, servidor ou servico externo. Icones SVG locais, estilos com escopo e templates acompanham os arquivos JavaScript.

## Abrir o catalogo

```powershell
powershell -ExecutionPolicy Bypass -File .\testar-componentes.ps1 -Ui
```

Acesse http://127.0.0.1:4173/ui-kit/index.html. Com Node moderno no PATH: `npm run demo:ui`. O servidor local desativa cache. `npm run build:ui` compila somente este catalogo. `npm run test:ui:browser` valida as interacoes em Chrome/Edge com Node 22+. A opcao `--screenshot` no script de navegador gera `test/artifacts/ui-kit.png`.

## Usar em outra tela

Carregue AngularJS e `src/angularjs-easy-components.js`. Importe o kit no entry do projeto compilado por esbuild (com loaders de texto para HTML e CSS, como neste repositorio):

```js
import kit from './ui-kit/index.js';
import MinhaPagina from './minha-pagina.component.js';

EasyComponents.createApp({
  name: 'minhaAplicacao',
  components: kit.concat([MinhaPagina])
});
```

O pacote tambem exporta `angularjs-easy-components/ui-kit`. O export padrao inclui os componentes e o registro do servico `GToast`. Os exports nomeados `components` e `services` permitem montar um catalogo proprio. O build de demonstracao nao e necessario para consumir os fontes.

```html
<g-button text="Incluir" icon="add" on-click="vm.incluir()"></g-button>
<g-save-button loading="vm.gravando" on-click="vm.gravar()"></g-save-button>
<g-float-label-input label="Nome" model="vm.nome"
  required="true" on-change="vm.nome = $value"></g-float-label-input>
<g-select label="Departamento" options="vm.departamentos"
  model="vm.departamento" on-change="vm.departamento = $value"></g-select>
<g-switch label="Ativo" model="vm.ativo"
  on-change="vm.ativo = $value"></g-switch>
```

Valores booleanos, arrays, objetos e `model` usam expressoes. Textos usam atributos literais ou interpolacao (`text="{{ vm.titulo }}"`). Eventos expõem o payload em `$value` e `$event`; os campos nao alteram o estado do pai automaticamente. Atualize esse estado nos callbacks. O campo flutuante emite texto, inclusive para `type="number"`; converta no dominio se precisar de numero.

## Componentes

| Componente | Propriedades principais | Eventos/conteudo |
| --- | --- | --- |
| `g-button` | `text`, `color`, `variant`, `size`, `shape`, `icon`, `type`, `is-disabled`, `loading`, `text-loading`, `block`, `aria-label`, `custom-class` | `on-click`: evento DOM; bloqueado durante loading/disabled |
| `g-save-button` | Mesmas propriedades; success, icone save, textos Gravar/Gravando por padrao | `on-click` |
| `g-home-button` | `text`, `group`, `description`, `icon`, `color`, `is-disabled`, `loading` | `on-click`; atalho de modulo |
| `g-button-group` | `items`: `{value,label,icon?,disabled?}[]`, `value`, `label`, `is-disabled` | `on-change`: valor; navegacao por setas/Home/End |
| `g-float-label-input` | `model`, `label`, `type`, `erro`, `hint`, `required`, `is-disabled`, `readonly`, `autocomplete` | `on-change`, `on-blur`: texto |
| `g-search-home-input` | `model`, `data`, `fields`, `label`, `placeholder`, `max-results`, `is-disabled` | `on-change`: texto; `on-select`: objeto original; setas/Enter/Escape |
| `g-select` | `model`, `options`, `label`, `placeholder`, `value-key`, `label-key`, `required`, `erro`, `is-disabled` | `on-change`: valor selecionado; preserva tipo de `options[valueKey]` |
| `g-switch` | `model`, `label`, `description`, `is-disabled` | `on-change`: booleano |
| `g-status` | `status` (texto), `label`, `list`: mapa de status para cores | Indicador e descricao textual |
| `g-icon` | `name`, `label` opcional | SVG decorativo por padrao; label cria descricao acessivel |
| `g-spinner` | `label`, `size`: sm/md/lg | Status de carregamento |
| `g-loading` | `active`, `text`, `progress` (-1 = indeterminado), `overlay` | Spinner e progresso; overlay ocupa a janela |
| `g-card` | `title`, `description`, `icon`, `padded` | Conteudo livre por transclusao |
| `g-toolbar` | `eyebrow`, `title`, `description` | Acoes por transclusao |
| `g-empty-state` | `title`, `description`, `icon` | Acoes por transclusao |
| `g-modal` | `open`, `title`, `description`, `size`: sm/md/lg, `busy`, `close-on-backdrop`, `confirm-text`, `cancel-text` | Conteudo por transclusao; `on-close`: motivo; `on-confirm` |
| `g-toast` | Usa o servico `GToast` | `on-dismiss`: id |

Cores de botao: primary, secondary, success, danger, warning, info, light, dark e link. Variantes: solid, outline, ghost. Tamanhos: sm, md, lg, xl, xxl. Formatos: rounded, pill, square, circle. Botoes somente com icone devem receber `aria-label`.

Icones: add, check, close, search, save, home, trash, download, settings, arrow, chevron, folder, user, filter e info. E possivel adicionar paths locais em `g-icon.component.js`.

A busca padrao usa os campos CONTROLE, GRUPO e DESCRICAO, com normalizacao de acentos e todos os termos digitados. E local e limitada por `max-results`; nao faz consultas HTTP. Para outro formato de dados, configure `fields`.

## Dialogos e notificacoes

```html
<g-modal open="vm.aberto" title="Novo registro"
  on-close="vm.aberto = false" on-confirm="vm.gravar()">
  <g-float-label-input label="Nome" model="vm.nome"
    on-change="vm.nome = $value"></g-float-label-input>
</g-modal>
<g-toast></g-toast>
```

O modal usa `<dialog>` nativo em navegadores modernos: foco contido, fundo inerte e restauracao de foco. O pai controla `open` e decide quando fechar apos confirmacao. `busy` impede confirmar/fechar repetidamente. O kit nao injeta templates dinamicos nem depende de manipular o DOM do projeto consumidor. Validacao deve ser mostrada no formulario do dialogo.

Injete `GToast` na pagina (`inject: { toast: 'GToast' }`). Use `toast.success(titulo, mensagem)`, `danger`, `warning` ou `info`. `show(titulo, mensagem, cor, duracaoMs)` retorna um id; `dismiss(id)` remove a mensagem. Duracao 0 mantem a mensagem ate fechamento manual. O limite e de cinco mensagens; timers sao cancelados na remocao e destruicao da aplicacao. Renderize um `g-toast` por aplicacao.

Os tokens CSS `--g-primary`, `--g-border` e `--g-focus` personalizam a base sem mudar os componentes. A pagina do catalogo demonstra composicao e eventos reais com dados locais.
