(()=>{var x=`<div class="gc-confirm" ng-if="vm.open" ng-keydown="vm.keydown($event)">
  <button class="gc-confirm__backdrop" type="button" aria-label="Fechar" ng-click="vm.backdrop()"></button>
  <section class="modal-dialog {{ vm.size }}" role="dialog" aria-modal="true" aria-labelledby="gc-confirm-title">
    <div class="modal-content">
      <header class="modal-header">
        <button type="button" class="close" aria-label="Fechar" ng-click="vm.cancel('close')"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="gc-confirm-title">{{ vm.title }}</h4>
      </header>
      <div class="modal-body">
        <p ng-if="vm.message">{{ vm.message }}</p>
        <div ng-transclude></div>
      </div>
      <footer class="modal-footer">
        <button type="button" class="btn btn-default" ng-disabled="vm.busy" ng-click="vm.cancel('cancel')">{{ vm.cancelLabel }}</button>
        <button type="button" class="btn {{ vm.confirmClass }}" ng-disabled="vm.busy" ng-click="vm.confirm()">
          <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
          {{ vm.confirmLabel }}
        </button>
      </footer>
    </div>
  </section>
</div>
`;var C=`:host { display: block; }
.gc-confirm { position: fixed; inset: 0; z-index: 1050; display: flex; align-items: flex-start; justify-content: center; overflow: auto; padding: 30px 15px; }
.gc-confirm__backdrop { position: fixed; inset: 0; z-index: -1; width: 100%; border: 0; background: rgba(0, 0, 0, .5); }
.modal-dialog { width: 600px; max-width: 100%; margin: 0; }
.modal-content { box-shadow: 0 5px 15px rgba(0, 0, 0, .5); }
.modal-body > p:last-child { margin-bottom: 0; }

`;var w=EasyComponents.defineComponent("gc-confirm-dialog",{props:{open:EasyComponents.boolean(!1),title:EasyComponents.text("Confirmacao"),message:EasyComponents.text("Deseja continuar?"),confirmLabel:EasyComponents.text("Confirmar"),cancelLabel:EasyComponents.text("Cancelar"),confirmClass:EasyComponents.text("btn-primary"),size:EasyComponents.text(""),busy:EasyComponents.boolean(!1),closeOnBackdrop:EasyComponents.boolean(!0),onConfirm:EasyComponents.event(),onCancel:EasyComponents.event()},methods:{confirm:function(){this.busy||this.$emit("onConfirm",{reason:"confirm"})},cancel:function(e){this.busy||this.$emit("onCancel",{reason:e||"cancel"})},backdrop:function(){this.closeOnBackdrop&&this.cancel("backdrop")},keydown:function(e){e.key==="Escape"&&this.cancel("escape"),e.key==="Enter"&&this.confirm()}},transclude:!0,template:x,styles:C,scoped:!0});var k=`<section class="panel panel-default gc-data-grid">
  <header class="panel-heading gc-data-grid__toolbar">
    <div class="input-group">
      <span class="input-group-addon"><span class="glyphicon glyphicon-filter"></span></span>
      <input class="form-control" type="search" aria-label="Filtrar registros" ng-model="vm.query" ng-change="vm.search()" placeholder="Filtrar registros">
    </div>
    <span class="label label-default">{{ vm.filteredRows.length }} registros</span>
  </header>
  <div class="table-responsive gc-data-grid__viewport">
    <table class="table table-striped table-bordered table-condensed table-hover">
      <thead><tr>
        <th ng-repeat="column in vm.columns track by column.key" ng-style="{ width: column.width }">
          <button type="button" ng-click="vm.sort(column)" ng-disabled="column.sortable === false">
            {{ column.label }}
            <span class="glyphicon" ng-if="vm.sortKey === column.key" ng-class="vm.sortDirection === 'asc' ? 'glyphicon-chevron-up' : 'glyphicon-chevron-down'"></span>
          </button>
        </th>
      </tr></thead>
      <tbody>
        <tr ng-if="vm.loading"><td colspan="{{ vm.columns.length }}" class="text-center"><span class="glyphicon glyphicon-refresh gc-spin"></span> Carregando...</td></tr>
        <tr ng-if="!vm.loading" ng-repeat="row in vm.visibleRows track by vm.identity(row)" ng-click="vm.select(row)" ng-class="{ info: vm.selected(row), 'gc-data-grid__selectable': vm.selectable }">
          <td ng-repeat="column in vm.columns track by column.key" ng-class="column.className">{{ row[column.key] }}</td>
        </tr>
        <tr ng-if="!vm.loading && !vm.visibleRows.length"><td colspan="{{ vm.columns.length }}" class="text-center text-muted">{{ vm.emptyText }}</td></tr>
      </tbody>
    </table>
  </div>
  <footer class="panel-footer gc-data-grid__footer">
    <span>Pagina {{ vm.page }} de {{ vm.pageCount }}</span>
    <div class="btn-group btn-group-sm">
      <button class="btn btn-default" type="button" aria-label="Pagina anterior" ng-click="vm.go(vm.page - 1)" ng-disabled="vm.page <= 1"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></button>
      <button class="btn btn-default" type="button" aria-label="Proxima pagina" ng-click="vm.go(vm.page + 1)" ng-disabled="vm.page >= vm.pageCount"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></button>
    </div>
  </footer>
</section>
`;var E=`:host { display: block; }
.gc-data-grid__toolbar, .gc-data-grid__footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.gc-data-grid__toolbar .input-group { max-width: 420px; }
.gc-data-grid__viewport { max-height: 520px; overflow: auto; }
.gc-data-grid .table { margin-bottom: 0; }
.gc-data-grid thead th { position: sticky; top: 0; z-index: 2; background: #f5f5f5; }
.gc-data-grid th button { width: 100%; padding: 0; border: 0; background: transparent; font-weight: 700; text-align: left; }
.gc-data-grid__selectable { cursor: pointer; }
.gc-spin { animation: gc-grid-spin 1s linear infinite; }
@keyframes gc-grid-spin { to { transform: rotate(360deg); } }
`;function me(e,t){return e===t?0:e==null?-1:t==null?1:e<t?-1:1}var _=EasyComponents.defineComponent("gc-data-grid",{props:{rows:EasyComponents.array(function(){return[]}),columns:EasyComponents.required(EasyComponents.array()),trackBy:EasyComponents.text("ID"),pageSize:EasyComponents.number(20,function(e){return e>0}),selectable:EasyComponents.boolean(!1),multiSelect:EasyComponents.boolean(!1),loading:EasyComponents.boolean(!1),emptyText:EasyComponents.text("Nenhum registro encontrado."),onSelect:EasyComponents.event(),onPageChange:EasyComponents.event(),onSort:EasyComponents.event()},state:function(){return{query:"",page:1,sortKey:"",sortDirection:"asc",selection:[]}},computed:{filteredRows:function(){var e=this.query.toLowerCase(),t=this.columns,n=this.sortKey,a=this.sortDirection==="asc"?1:-1;return this.rows.filter(function(o){return!e||t.some(function(s){return String(o[s.key]===void 0?"":o[s.key]).toLowerCase().indexOf(e)!==-1})}).sort(function(o,s){return n?me(o[n],s[n])*a:0})},pageCount:function(){return Math.max(1,Math.ceil(this.filteredRows.length/this.pageSize))},visibleRows:function(){var e=(Math.min(this.page,this.pageCount)-1)*this.pageSize;return this.filteredRows.slice(e,e+this.pageSize)}},methods:{search:function(){this.$setState({page:1})},sort:function(e){if(e.sortable!==!1){var t=this.sortKey===e.key&&this.sortDirection==="asc"?"desc":"asc";this.$setState({sortKey:e.key,sortDirection:t,page:1}),this.$emit("onSort",{key:e.key,direction:t})}},go:function(e){e=Math.max(1,Math.min(e,this.pageCount)),this.$setState({page:e}),this.$emit("onPageChange",e)},select:function(e){if(this.selectable){var t=this.trackBy,n=this.selection.some(function(o){return o[t]===e[t]}),a=this.multiSelect?n?this.selection.filter(function(o){return o[t]!==e[t]}):this.selection.concat([e]):[e];this.$setState({selection:a}),this.$emit("onSelect",this.multiSelect?a:e)}},selected:function(e){var t=this.trackBy;return this.selection.some(function(n){return n[t]===e[t]})},identity:function(e){return e[this.trackBy]}},template:k,styles:E,scoped:!0});var S=`<section class="panel panel-default gc-file-import">
  <header class="panel-heading"><strong>{{ vm.title }}</strong></header>
  <div class="panel-body">
    <div class="well well-sm gc-file-import__chooser">
      <input class="sr-only" type="file" aria-label="Escolher arquivo para importar" accept="{{ vm.accept }}">
      <button class="btn btn-primary" type="button" ng-click="vm.choose()"><span class="glyphicon glyphicon-folder-open"></span> Escolher arquivo</button>
      <span ng-if="vm.fileName"><strong>{{ vm.fileName }}</strong> · {{ vm.rows.length }} linhas</span>
    </div>
    <div class="alert alert-danger" ng-if="vm.error"><span class="glyphicon glyphicon-exclamation-sign"></span> {{ vm.error }}</div>
    <p class="text-center" ng-if="vm.loading"><span class="glyphicon glyphicon-refresh gc-spin"></span> Lendo arquivo...</p>
    <gc-data-grid ng-if="!vm.loading && vm.rows.length" rows="vm.previewRows" columns="vm.columns" track-by="__id" page-size="10"></gc-data-grid>
    <p class="text-muted" ng-if="vm.rows.length > vm.maxPreview">A visualizacao mostra {{ vm.maxPreview }} de {{ vm.rows.length }} linhas. Todas serao enviadas na importacao.</p>
  </div>
  <footer class="panel-footer text-right">
    <button class="btn btn-default" type="button" ng-click="vm.clear()" ng-disabled="!vm.fileName">Limpar</button>
    <button class="btn btn-success" type="button" ng-click="vm.importRows()" ng-disabled="!vm.rows.length"><span class="glyphicon glyphicon-import"></span> Importar {{ vm.rows.length }} linhas</button>
  </footer>
</section>
`;var $=`:host { display: block; }
.gc-file-import__chooser { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.gc-file-import .panel-footer .btn + .btn { margin-left: 5px; }
.gc-spin { animation: gc-import-spin 1s linear infinite; }
@keyframes gc-import-spin { to { transform: rotate(360deg); } }

`;function I(e,t){for(var n=[],a="",o=!1,s=0;s<e.length;s+=1){var r=e[s];r==='"'&&e[s+1]==='"'&&o?(a+='"',s+=1):r==='"'?o=!o:r===t&&!o?(n.push(a.trim()),a=""):a+=r}return n.push(a.trim()),n}function ge(e,t,n){var a=e.replace(/^\uFEFF/,"").split(/\r?\n/).filter(function(i){return i.trim()});if(!a.length)return{headers:[],rows:[]};var o=I(a[0],t),s=n?o:o.map(function(i,l){return"COLUNA_"+(l+1)}),r=n?1:0,c=a.slice(r).map(function(i,l){var p=I(i,t),u={__id:l+1};return s.forEach(function(m,re){u[m]=p[re]||""}),u});return{headers:s,rows:c}}var D=EasyComponents.defineComponent("gc-file-import",{props:{title:EasyComponents.text("Importacao por arquivo"),separator:EasyComponents.text(";"),hasHeader:EasyComponents.boolean(!0),accept:EasyComponents.text(".csv,text/csv"),maxPreview:EasyComponents.number(50),onParse:EasyComponents.event(),onImport:EasyComponents.event(),onError:EasyComponents.event()},state:function(){return{fileName:"",headers:[],rows:[],loading:!1,error:""}},computed:{columns:function(){return this.headers.map(function(e){return{key:e,label:e}})},previewRows:function(){return this.rows.slice(0,this.maxPreview)}},methods:{choose:function(){this.$element[0].querySelector("input[type=file]").click()},read:function(e){var t=this;if(e){this.$setState({loading:!0,error:"",fileName:e.name});var n=new FileReader;n.onload=function(){try{var a=ge(String(n.result||""),t.separator,t.hasHeader);t.$setState({headers:a.headers,rows:a.rows,loading:!1}),t.$emit("onParse",{file:e,headers:a.headers,rows:a.rows})}catch(o){t.fail(o)}},n.onerror=function(){t.fail(n.error||new Error("Nao foi possivel ler o arquivo."))},n.readAsText(e)}},fail:function(e){this.$setState({loading:!1,error:e.message||String(e)}),this.$emit("onError",e)},clear:function(){this.$setState({fileName:"",headers:[],rows:[],error:""})},importRows:function(){this.$emit("onImport",{headers:this.headers.slice(),rows:this.rows.slice()})}},hooks:{postLink:function(){var e=this;this.fileInput=this.$element[0].querySelector("input[type=file]"),this.fileChange=function(t){e.read(t.target.files[0]),t.target.value=""},this.fileInput.addEventListener("change",this.fileChange)},onDestroy:function(){this.fileInput&&this.fileInput.removeEventListener("change",this.fileChange)}},template:S,styles:$,scoped:!0});var q=`<section class="panel panel-default gc-file-manager">
  <header class="panel-heading gc-file-manager__header">
    <strong>{{ vm.label }}</strong>
    <button class="btn btn-info btn-sm" type="button" ng-click="vm.choose()" ng-disabled="vm.disabled"><span class="glyphicon glyphicon-plus"></span> Adicionar</button>
    <input class="sr-only" type="file" aria-label="Adicionar arquivos" accept="{{ vm.accept }}" ng-attr-multiple="{{ vm.multiple || undefined }}">
  </header>
  <div class="alert alert-danger" ng-if="vm.error">{{ vm.error }}</div>
  <ul class="list-group">
    <li class="list-group-item gc-file-manager__item" ng-repeat="file in vm.localFiles track by vm.identity(file)">
      <span class="glyphicon glyphicon-file gc-file-manager__icon" aria-hidden="true"></span>
      <span class="gc-file-manager__name"><strong>{{ vm.name(file) }}</strong><small class="text-muted">{{ vm.size(file.size || file.TAMANHO) }}</small></span>
      <span class="btn-group btn-group-sm">
        <button class="btn btn-default" type="button" ng-if="file.url" ng-click="vm.open(file)" title="Visualizar"><span class="glyphicon glyphicon-eye-open"></span></button>
        <button class="btn btn-default" type="button" ng-click="vm.download(file)" title="Baixar"><span class="glyphicon glyphicon-download-alt"></span></button>
        <button class="btn btn-danger" type="button" ng-click="vm.remove(file)" ng-disabled="vm.disabled" title="Remover"><span class="glyphicon glyphicon-trash"></span></button>
      </span>
    </li>
    <li class="list-group-item text-muted text-center" ng-if="!vm.localFiles.length">Nenhum arquivo adicionado.</li>
  </ul>
  <div class="gc-file-manager__preview" ng-if="vm.preview">
    <button class="btn btn-default" type="button" ng-click="vm.closePreview()"><span class="glyphicon glyphicon-remove"></span> Fechar</button>
    <img ng-if="vm.preview.type.indexOf('image/') === 0" ng-src="{{ vm.preview.url }}" alt="{{ vm.name(vm.preview) }}">
    <object ng-if="vm.preview.type.indexOf('image/') !== 0" data="{{ vm.preview.url }}" type="{{ vm.preview.type }}"><p>Visualizacao indisponivel.</p></object>
  </div>
</section>
`;var A=`:host { display: block; }
.gc-file-manager__header, .gc-file-manager__item { display: flex; align-items: center; gap: 10px; }
.gc-file-manager__header strong { flex: 1; }
.gc-file-manager .list-group { margin-bottom: 0; }
.gc-file-manager__icon { color: #337ab7; font-size: 20px; }
.gc-file-manager__name { display: flex; flex: 1; min-width: 0; flex-direction: column; overflow: hidden; }
.gc-file-manager__name strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gc-file-manager__preview { position: fixed; inset: 50px 0 0; z-index: 1060; padding: 50px 30px 30px; overflow: auto; background: rgba(0, 0, 0, .82); text-align: center; }
.gc-file-manager__preview > button { position: fixed; top: 60px; right: 30px; }
.gc-file-manager__preview img, .gc-file-manager__preview object { max-width: 100%; height: calc(100vh - 150px); background: #fff; }
.gc-file-manager__preview object { width: 100%; }

`;function ye(e){if(!e)return"0 B";var t=["B","KB","MB","GB"],n=Math.min(Math.floor(Math.log(e)/Math.log(1024)),t.length-1);return(e/Math.pow(1024,n)).toFixed(n?1:0)+" "+t[n]}var R=EasyComponents.defineComponent("gc-file-manager",{props:{files:EasyComponents.array(function(){return[]}),label:EasyComponents.text("Arquivos"),accept:EasyComponents.text("*/*"),multiple:EasyComponents.boolean(!0),disabled:EasyComponents.boolean(!1),maxSize:EasyComponents.number(0),onAdd:EasyComponents.event(),onRemove:EasyComponents.event(),onDownload:EasyComponents.event()},state:function(){return{localFiles:this.files.slice(),preview:null,error:""}},methods:{choose:function(){this.disabled||this.$element[0].querySelector("input[type=file]").click()},receive:function(e){var t=this,n=Array.prototype.slice.call(e||[]).filter(function(o){return!t.maxSize||o.size<=t.maxSize?!0:(t.$setState({error:o.name+" excede o tamanho permitido."}),!1)}).map(function(o){return{id:Date.now()+"-"+Math.random(),name:o.name,size:o.size,type:o.type,raw:o,url:URL.createObjectURL(o)}});if(n.length){var a=this.multiple?this.localFiles.concat(n):[n[0]];this.$setState({localFiles:a,error:""}),this.$emit("onAdd",this.multiple?n:n[0])}},remove:function(e){e.url&&e.raw&&URL.revokeObjectURL(e.url),this.$setState({localFiles:this.localFiles.filter(function(t){return t!==e}),preview:this.preview===e?null:this.preview}),this.$emit("onRemove",e)},open:function(e){this.$setState({preview:e})},closePreview:function(){this.$setState({preview:null})},download:function(e){this.$emit("onDownload",e)},size:ye,identity:function(e){return e.id||e.ID||e.name||e.NOME},name:function(e){return e.name||e.NOME}},hooks:{postLink:function(){var e=this;this.fileInput=this.$element[0].querySelector("input[type=file]"),this.fileChange=function(t){e.receive(t.target.files),t.target.value=""},this.fileInput.addEventListener("change",this.fileChange)},onChanges:function(e){e.files&&this.$setState({localFiles:(e.files.currentValue||[]).slice()})},onDestroy:function(){this.fileInput&&this.fileInput.removeEventListener("change",this.fileChange),this.localFiles.forEach(function(e){e.url&&e.raw&&URL.revokeObjectURL(e.url)})}},template:q,styles:A,scoped:!0});var M=`<section class="gc-history-panel">
  <header><h3><span class="glyphicon glyphicon-time"></span> {{ vm.title }}</h3><button class="btn btn-default btn-sm" type="button" ng-click="vm.refresh()"><span class="glyphicon glyphicon-refresh"></span> Atualizar</button></header>
  <gc-data-grid rows="vm.entries" columns="vm.columns" loading="vm.loading" track-by="ID" selectable="true" on-select="vm.select($event)"></gc-data-grid>
</section>
`;var O=`:host { display: block; }
.gc-history-panel > header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.gc-history-panel h3 { margin: 0; color: #a94442; }

`;var L=EasyComponents.defineComponent("gc-history-panel",{props:{title:EasyComponents.text("Historico"),entries:EasyComponents.array(function(){return[]}),loading:EasyComponents.boolean(!1),onSelect:EasyComponents.event(),onRefresh:EasyComponents.event()},state:function(){return{columns:[{key:"DATA",label:"Data",width:"150px"},{key:"USUARIO",label:"Usuario",width:"180px"},{key:"DESCRICAO",label:"Descricao"}]}},methods:{refresh:function(){this.$emit("onRefresh",null)},select:function(e){this.$emit("onSelect",e)}},template:M,styles:O,scoped:!0});var P=`<div class="gc-legacy-host">
  <div class="alert alert-danger" role="alert" ng-if="vm.error">
    <strong>Falha ao carregar {{ vm.factory }}:</strong> {{ vm.error.message }}
  </div>
  <div data-legacy-mount></div>
</div>
`;var F=`:host, .gc-legacy-host, [data-legacy-mount] { display: block; }
`;function z(e){return e&&Object.prototype.toString.call(e)==="[object Object]"}function G(e,t){return Object.keys(t||{}).forEach(function(n){z(t[n])&&z(e[n])?G(e[n],t[n]):e[n]=t[n]}),e}var j=EasyComponents.defineComponent("gc-legacy-host",{inject:{injector:"$injector",timeout:"$timeout"},props:{factory:EasyComponents.required(EasyComponents.text()),config:EasyComponents.object(function(){return{}}),args:EasyComponents.array(function(){return[]}),createMethod:EasyComponents.text("getNew"),compileMethod:EasyComponents.text("compile"),model:EasyComponents.text("vm.instance"),onReady:EasyComponents.event(),onError:EasyComponents.event()},state:function(){return{instance:null,owner:null,mounted:!1,error:null}},methods:{create:function(){if(!this.injector.has(this.factory))throw new Error("Factory legado nao registrado: "+this.factory);var e=this.injector.get(this.factory),t=Reflect.construct(e,this.args||[]),n=this.createMethod&&typeof t[this.createMethod]=="function"?t[this.createMethod]():t;return G(n,this.config||{}),n.model=this.model,this.$setState({owner:t,instance:n,error:null}),n},compile:function(){var e=this.instance||this.create(),t=this.$element[0].querySelector("[data-legacy-mount]");return e.componente=t,this.compileMethod&&typeof e[this.compileMethod]=="function"&&e[this.compileMethod](),this.$setState({mounted:!0}),this.$emit("onReady",e),e},recompile:function(){this.mounted&&(this.destroyInstance(!1),this.create(),this.compile())},destroyInstance:function(e){var t=this.instance;t&&(Object.keys(t).forEach(function(n){/^Time\d*$/.test(n)&&this.timeout.cancel(t[n])},this),["childScope","scope"].forEach(function(n){t[n]&&typeof t[n].$destroy=="function"&&!t[n].$$destroyed&&t[n].$destroy()}),["compiledElement","compiledElement2"].forEach(function(n){t[n]&&typeof t[n].remove=="function"&&t[n].remove()}),typeof t.destroy=="function"&&t.destroy(),e!==!1&&this.$setState({instance:null,owner:null,mounted:!1}))}},hooks:{onInit:function(){try{this.create()}catch(e){this.$setState({error:e}),this.$emit("onError",e)}},postLink:function(){if(!this.error)try{this.compile()}catch(e){this.$setState({error:e}),this.$emit("onError",e)}},onChanges:function(e){if(!(!this.mounted||!e.config&&!e.args))try{this.recompile()}catch(t){this.$setState({error:t}),this.$emit("onError",t)}},onDestroy:function(){this.destroyInstance()}},template:P,styles:F,scoped:!0});var N=`<div class="form-group gc-lookup" ng-class="{ 'has-error': vm.required && !vm.value }">
  <label>{{ vm.label }}</label>
  <div class="input-group">
    <input class="form-control" type="search" ng-model="vm.query" ng-change="vm.search()" ng-focus="vm.search()" ng-disabled="vm.disabled" placeholder="{{ vm.selectedLabel || vm.placeholder }}" aria-label="{{ vm.label }}">
    <span class="input-group-btn">
      <button class="btn btn-danger" type="button" aria-label="Limpar consulta" ng-if="vm.value" ng-click="vm.clear()" ng-disabled="vm.disabled"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
      <button class="btn btn-primary" type="button" aria-label="Pesquisar" ng-click="vm.search()" ng-disabled="vm.disabled"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></button>
    </span>
  </div>
  <div class="panel panel-default gc-lookup__results" ng-if="vm.open">
    <div class="panel-body text-center" ng-if="vm.loading"><span class="glyphicon glyphicon-refresh gc-spin"></span> Carregando...</div>
    <div class="table-responsive" ng-if="!vm.loading">
      <table class="table table-condensed table-striped table-bordered table-hover">
        <thead><tr><th ng-repeat="column in vm.columns track by column.key">{{ column.label }}</th></tr></thead>
        <tbody>
          <tr ng-repeat="item in vm.visibleItems track by vm.identity(item)" ng-click="vm.select(item)" tabindex="0">
            <td ng-repeat="column in vm.columns track by column.key">{{ item[column.key] }}</td>
          </tr>
          <tr ng-if="!vm.visibleItems.length"><td colspan="{{ vm.columns.length || 1 }}" class="text-center text-muted">Nenhum registro encontrado.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`;var B=`:host { display: block; position: relative; }
.gc-lookup { position: relative; }
.gc-lookup__results { position: absolute; z-index: 1000; right: 0; left: 0; max-height: 320px; margin-top: 2px; overflow: auto; box-shadow: 0 6px 12px rgba(0, 0, 0, .175); }
.gc-lookup__results .table { margin-bottom: 0; }
.gc-lookup__results tbody tr { cursor: pointer; }
.gc-spin { animation: gc-spin 1s linear infinite; }
@keyframes gc-spin { to { transform: rotate(360deg); } }
`;function T(e){return String(e==null?"":e).toLowerCase()}var U=EasyComponents.defineComponent("gc-lookup",{props:{label:EasyComponents.text("Consulta"),items:EasyComponents.array(function(){return[]}),columns:EasyComponents.array(function(){return[]}),value:EasyComponents.object(null),trackBy:EasyComponents.text("ID"),placeholder:EasyComponents.text("Pesquisar..."),loading:EasyComponents.boolean(!1),disabled:EasyComponents.boolean(!1),required:EasyComponents.boolean(!1),minChars:EasyComponents.number(0),maxResults:EasyComponents.number(50),onSearch:EasyComponents.event(),onSelect:EasyComponents.event(),onClear:EasyComponents.event()},state:function(){return{query:"",open:!1}},computed:{visibleItems:function(){var e=T(this.query),t=this.columns;return this.items.filter(function(n){return!e||t.some(function(a){return T(n[a.key]).indexOf(e)!==-1})}).slice(0,this.maxResults)},selectedLabel:function(){if(!this.value)return"";var e=this.columns[0];return e?this.value[e.key]:this.value[this.trackBy]}},methods:{search:function(){var e=this.query.length>=this.minChars;this.$setState({open:e}),e&&this.$emit("onSearch",this.query)},select:function(e){this.$setState({query:"",open:!1}),this.$emit("onSelect",e)},clear:function(){this.$setState({query:"",open:!1}),this.$emit("onClear",null)},identity:function(e){return e[this.trackBy]}},template:N,styles:B,scoped:!0});var K=`<section class="panel panel-default gc-multi-lookup">
  <header class="panel-heading"><strong>{{ vm.title }}</strong><span class="badge pull-right">{{ vm.draft.length }}</span></header>
  <div class="panel-body">
    <div class="row">
      <div class="col-sm-6">
        <div class="input-group gc-multi-lookup__search">
          <input class="form-control" type="search" aria-label="Filtrar itens disponiveis" ng-model="vm.query" placeholder="Filtrar disponiveis">
          <span class="input-group-btn"><button class="btn btn-primary" type="button" ng-click="vm.addAll()" ng-disabled="!vm.available.length">Adicionar todos</button></span>
        </div>
        <div class="list-group gc-multi-lookup__list">
          <button class="list-group-item" type="button" ng-repeat="item in vm.available track by vm.identity(item)" ng-click="vm.add(item)">
            <span ng-repeat="column in vm.columns track by column.key"><strong ng-if="$first">{{ item[column.key] }}</strong><small ng-if="!$first" class="text-muted"> · {{ item[column.key] }}</small></span>
            <span class="glyphicon glyphicon-chevron-right pull-right" aria-hidden="true"></span>
          </button>
          <p class="list-group-item text-muted" ng-if="!vm.available.length">Nenhum item disponivel.</p>
        </div>
      </div>
      <div class="col-sm-6">
        <button class="btn btn-link btn-xs pull-right" type="button" ng-click="vm.clear()" ng-disabled="!vm.draft.length">Limpar</button>
        <label>Selecionados</label>
        <div class="list-group gc-multi-lookup__list">
          <button class="list-group-item" type="button" ng-repeat="item in vm.draft track by vm.identity(item)" ng-click="vm.remove(item)">
            <span class="glyphicon glyphicon-remove text-danger" aria-hidden="true"></span>
            <span ng-repeat="column in vm.columns track by column.key"> {{ item[column.key] }}<span ng-if="!$last"> ·</span></span>
          </button>
          <p class="list-group-item text-muted" ng-if="!vm.draft.length">Nenhum item selecionado.</p>
        </div>
      </div>
    </div>
  </div>
  <footer class="panel-footer text-right"><button class="btn btn-success" type="button" ng-click="vm.confirm()"><span class="glyphicon glyphicon-ok"></span> Confirmar selecao</button></footer>
</section>
`;var V=`:host { display: block; }
.gc-multi-lookup__search { margin-bottom: 10px; }
.gc-multi-lookup__list { max-height: 280px; overflow-y: auto; }
.gc-multi-lookup__list .list-group-item { width: 100%; text-align: left; }
.gc-multi-lookup__list p.list-group-item { margin: 0; }

`;function $e(e,t,n){return e.some(function(a){return a[n]===t[n]})}var H=EasyComponents.defineComponent("gc-multi-lookup",{props:{title:EasyComponents.text("Selecao multipla"),items:EasyComponents.array(function(){return[]}),selected:EasyComponents.array(function(){return[]}),columns:EasyComponents.array(function(){return[]}),trackBy:EasyComponents.text("ID"),onChange:EasyComponents.event(),onConfirm:EasyComponents.event()},state:function(){return{query:"",draft:this.selected.slice()}},computed:{available:function(){var e=this.query.toLowerCase(),t=this.columns,n=this.draft,a=this.trackBy;return this.items.filter(function(o){return $e(n,o,a)?!1:!e||t.some(function(s){return String(o[s.key]||"").toLowerCase().indexOf(e)!==-1})})}},methods:{add:function(e){var t=this.draft.concat([e]);this.$setState({draft:t}),this.$emit("onChange",t)},remove:function(e){var t=this.trackBy,n=this.draft.filter(function(a){return a[t]!==e[t]});this.$setState({draft:n}),this.$emit("onChange",n)},addAll:function(){var e=this.draft.concat(this.available);this.$setState({draft:e}),this.$emit("onChange",e)},clear:function(){this.$setState({draft:[]}),this.$emit("onChange",[])},confirm:function(){this.$emit("onConfirm",this.draft.slice())},identity:function(e){return e[this.trackBy]}},hooks:{onChanges:function(e){e.selected&&this.$setState({draft:(e.selected.currentValue||[]).slice()})}},template:K,styles:V,scoped:!0});var J=`<section class="panel panel-default gc-operation-flow">
  <header class="panel-heading"><strong>{{ vm.title }}</strong><span class="label label-info pull-right" ng-if="vm.running">Executando</span></header>
  <div class="panel-body">
    <ol class="gc-operation-flow__steps">
      <li ng-repeat="step in vm.steps track by step.id" ng-class="'gc-operation-flow--' + vm.statusClass(step, $index)">
        <button type="button" ng-click="vm.select(step, $index)" ng-disabled="vm.running">
          <span class="gc-operation-flow__number">{{ $index + 1 }}</span>
          <span><strong>{{ step.title }}</strong><small>{{ step.description }}</small></span>
        </button>
      </li>
    </ol>
    <div class="progress" ng-if="vm.running"><div class="progress-bar progress-bar-striped active" role="progressbar" ng-style="{ width: vm.steps[vm.current].progress + '%' }">{{ vm.steps[vm.current].progress || 0 }}%</div></div>
  </div>
  <footer class="panel-footer text-right">
    <button class="btn btn-danger" type="button" ng-if="vm.running" ng-click="vm.cancel()"><span class="glyphicon glyphicon-stop"></span> Cancelar</button>
    <button class="btn btn-primary" type="button" ng-if="!vm.running" ng-click="vm.execute()" ng-disabled="!vm.steps.length"><span class="glyphicon glyphicon-play"></span> Executar</button>
  </footer>
</section>
`;var Q=`:host { display: block; }
.gc-operation-flow__steps { display: flex; margin: 0 0 20px; padding: 0; list-style: none; }
.gc-operation-flow__steps li { position: relative; flex: 1; }
.gc-operation-flow__steps li:not(:last-child)::after { position: absolute; top: 17px; right: -50%; left: 50%; height: 2px; background: #ddd; content: ''; }
.gc-operation-flow__steps button { position: relative; z-index: 1; display: flex; width: 100%; align-items: center; gap: 8px; border: 0; background: transparent; text-align: left; }
.gc-operation-flow__steps small { display: block; color: #777; }
.gc-operation-flow__number { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border: 2px solid #ccc; border-radius: 50%; background: #fff; }
.gc-operation-flow--primary .gc-operation-flow__number { border-color: #337ab7; color: #337ab7; }
.gc-operation-flow--success .gc-operation-flow__number { border-color: #5cb85c; background: #5cb85c; color: #fff; }
.gc-operation-flow--danger .gc-operation-flow__number { border-color: #d9534f; background: #d9534f; color: #fff; }
@media (max-width: 767px) { .gc-operation-flow__steps { flex-direction: column; gap: 8px; } .gc-operation-flow__steps li::after { display: none; } }
`;var W=EasyComponents.defineComponent("gc-operation-flow",{props:{title:EasyComponents.text("Fluxo operacional"),steps:EasyComponents.array(function(){return[]}),current:EasyComponents.number(0),running:EasyComponents.boolean(!1),onExecute:EasyComponents.event(),onCancel:EasyComponents.event(),onSelect:EasyComponents.event()},methods:{execute:function(){this.running||this.$emit("onExecute",this.steps[this.current])},cancel:function(){this.running&&this.$emit("onCancel",this.steps[this.current])},select:function(e,t){this.running||this.$emit("onSelect",{step:e,index:t})},statusClass:function(e,t){return e.status==="error"?"danger":e.status==="done"||t<this.current?"success":t===this.current?"primary":"default"}},template:J,styles:Q,scoped:!0});var X=`<div class="form-group gc-smart-input" ng-class="{ 'has-error': vm.required && !vm.query }">
  <label ng-if="vm.label">{{ vm.label }}</label>
  <div class="input-group">
    <input class="form-control" type="text" autocomplete="off" aria-label="{{ vm.label || vm.placeholder }}" ng-model="vm.query" ng-change="vm.search()" ng-focus="vm.search()" ng-keydown="vm.keydown($event)" ng-disabled="vm.disabled" ng-required="vm.required" placeholder="{{ vm.placeholder }}" role="combobox" aria-expanded="{{ vm.open }}">
    <span class="input-group-btn">
      <button class="btn btn-default" type="button" ng-click="vm.clear()" ng-disabled="vm.disabled || !vm.query" aria-label="Limpar"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
    </span>
  </div>
  <ul class="dropdown-menu gc-smart-input__menu" ng-if="vm.open" role="listbox">
    <li ng-repeat="item in vm.filteredItems track by vm.itemId(item)" ng-class="{ active: $index === vm.activeIndex }">
      <button type="button" ng-mousedown="vm.select(item)" role="option">{{ item[vm.displayKey] }}</button>
    </li>
    <li class="disabled" ng-if="!vm.filteredItems.length"><span>Nenhum resultado</span></li>
  </ul>
</div>
`;var Y=`:host { display: block; position: relative; }
.gc-smart-input { position: relative; margin-bottom: 15px; }
.gc-smart-input__menu { display: block; right: 0; max-height: 260px; overflow-y: auto; }
.gc-smart-input__menu li button { display: block; width: 100%; padding: 6px 20px; border: 0; background: transparent; color: #333; text-align: left; }
.gc-smart-input__menu li button:hover, .gc-smart-input__menu li.active button { background: #337ab7; color: #fff; }

`;function Z(e){return String(e==null?"":e).toLowerCase()}var ee=EasyComponents.defineComponent("gc-smart-input",{props:{label:EasyComponents.text(""),items:EasyComponents.array(function(){return[]}),value:EasyComponents.object(null),displayKey:EasyComponents.text("DESCRICAO"),valueKey:EasyComponents.text("ID"),placeholder:EasyComponents.text("Digite para pesquisar"),required:EasyComponents.boolean(!1),disabled:EasyComponents.boolean(!1),maxResults:EasyComponents.number(20),onSelect:EasyComponents.event(),onClear:EasyComponents.event(),onSearch:EasyComponents.event()},state:function(){return{query:this.value&&this.value[this.displayKey]||"",open:!1,activeIndex:-1}},computed:{filteredItems:function(){var e=Z(this.query),t=this.displayKey;return this.items.filter(function(n){return!e||Z(n[t]).indexOf(e)!==-1}).slice(0,this.maxResults)}},methods:{search:function(){this.$setState({open:!0,activeIndex:-1}),this.$emit("onSearch",this.query)},select:function(e){this.$setState({query:e[this.displayKey],open:!1,activeIndex:-1}),this.$emit("onSelect",e)},clear:function(){this.$setState({query:"",open:!1,activeIndex:-1}),this.$emit("onClear",null)},keydown:function(e){if(e.key==="Escape")return this.$setState({open:!1,activeIndex:-1});if(e.key==="ArrowDown")return e.preventDefault(),this.$setState({open:!0,activeIndex:Math.min(this.activeIndex+1,this.filteredItems.length-1)});if(e.key==="ArrowUp")return e.preventDefault(),this.$setState({activeIndex:Math.max(this.activeIndex-1,0)});e.key==="Enter"&&this.activeIndex>=0&&(e.preventDefault(),this.select(this.filteredItems[this.activeIndex]))},itemId:function(e){return e[this.valueKey]}},hooks:{onChanges:function(e){e.value&&e.value.currentValue&&this.$setState({query:e.value.currentValue[this.displayKey]||""})}},template:X,styles:Y,scoped:!0});var te=[w,_,D,R,L,j,U,H,W,ee];function d(e){return e.angularModule.factory("GcApi",["$http","$q",function(t,n){function a(o,s,r,c){return t(Object.assign({},c||{},{method:o,url:s,data:r})).then(function(i){return i.data}).catch(function(i){return n.reject({status:i.status,message:i.data&&(i.data.message||i.data.error)||i.statusText||"Falha na requisicao.",cause:i})})}return{request:a,get:function(o,s){return a("GET",o,void 0,s)},post:function(o,s,r){return a("POST",o,s,r)},put:function(o,s,r){return a("PUT",o,s,r)},remove:function(o,s){return a("DELETE",o,void 0,s)}}}]),e}function f(e){return e.angularModule.factory("GcControllerActions",["$q",function(t){function n(a,o,s){var r=s&&s[a];if(typeof r!="function")return t.reject(new Error("Acao nao registrada: "+a));try{return t.when(r(o))}catch(c){return t.reject(c)}}return{run:n}}]),e}function g(e){return e.angularModule.factory("GcCrudStore",["$q",function(t){function n(a){a=a||{};var o=a.adapter||{},s={items:[],selected:null,loading:!1,error:null,query:{},list:function(i){return s.loading=!0,s.error=null,s.query=i||s.query,t.when(o.list?o.list(s.query):[]).then(function(l){return s.items=l||[],s.items}).catch(r).finally(c)},save:function(i){return s.loading=!0,t.when(o.save?o.save(i):i).then(function(l){var p=a.trackBy||"ID",u=s.items.findIndex(function(m){return m[p]===l[p]});return u>=0?s.items[u]=l:s.items.push(l),s.selected=l,l}).catch(r).finally(c)},remove:function(i){return s.loading=!0,t.when(o.remove?o.remove(i):i).then(function(){var l=a.trackBy||"ID";return s.items=s.items.filter(function(p){return p[l]!==i[l]}),s.selected&&s.selected[l]===i[l]&&(s.selected=null),i}).catch(r).finally(c)},select:function(i){return s.selected=i,i},clear:function(){s.selected=null,s.error=null}};function r(i){return s.error=i,t.reject(i)}function c(){s.loading=!1}return s}return{create:n}}]),e}function h(e){return e.angularModule.constant("GcDeviceConfig",{serverUrl:"http://127.0.0.1:8081/datasnap/rest/TServerMethods1/",printUrl:"https://www.gcwebmfe.com:8080/datasnap/rest/TServerMethods1/",timeout:1e4}),e.angularModule.factory("GcDeviceBridge",["$http","GcDeviceConfig",function(t,n){function a(o,s,r){r=r||{};var c=r.print?n.printUrl:n.serverUrl,i=s===void 0?"":"/"+encodeURIComponent(JSON.stringify(s));return t.get(c+o+i,{timeout:r.timeout||n.timeout}).then(function(l){var p=l.data;if(p&&p.error)throw new Error(p.error);if(p&&p.result&&p.result[0])try{p=JSON.parse(p.result[0])}catch(u){p=p.result[0]}return p})}return{command:a,connectScale:function(){return a("conectar_balanca")},disconnectScale:function(){return a("desconectar_balanca")},printLabel:function(o){return a("imprimir_etiqueta",o,{print:!0})},printReceipt:function(o){return a("imprimir_cupom",o,{print:!0})},health:function(){return a("echo")}}}]),e}function v(e){return e.angularModule.factory("GcRfid",["GcDeviceBridge",function(t){var n=[],a=!1;function o(i){n.slice().forEach(function(l){l(i)})}function s(i){return a=!0,t.command("rfid/iniciar",i||{}).then(function(l){return(l.tags||[]).forEach(o),l})}function r(){return a=!1,t.command("rfid/parar")}function c(i){return n.push(i),function(){n=n.filter(function(l){return l!==i})}}return{start:s,stop:r,subscribe:c,isReading:function(){return a}}}]),e}function y(e){return e.angularModule.factory("GcSpeech",["$window","$q",function(t,n){var a=t.SpeechRecognition||t.webkitSpeechRecognition,o=null;function s(c){return a?(c=c||{},n(function(i,l){o=new a,o.lang=c.lang||"pt-BR",o.interimResults=!1,o.maxAlternatives=1,o.onresult=function(p){i(p.results[0][0].transcript)},o.onerror=function(p){l(new Error(p.error||"Falha no reconhecimento de voz."))},o.onend=function(){o=null},o.start()})):n.reject(new Error("Reconhecimento de voz nao suportado."))}function r(){o&&o.stop()}return{supported:!!a,listen:s,stop:r}}]),e}function b(e){return e.angularModule.factory("GcSpeedTest",["$window","$q",function(t,n){function a(r,c){var i=t.performance.now();return t.fetch(r,c).then(function(l){if(!l.ok)throw new Error("HTTP "+l.status);return l}).then(function(l){return{response:l,duration:t.performance.now()-i}})}function o(r){return n.when(a(r,{method:"HEAD",cache:"no-store"})).then(function(c){return c.duration})}function s(r){return n.when(a(r+(r.indexOf("?")<0?"?":"&")+"_="+Date.now(),{cache:"no-store"})).then(function(c){return c.response.arrayBuffer().then(function(i){return{bytes:i.byteLength,milliseconds:c.duration,mbps:i.byteLength*8/(c.duration/1e3)/1e6}})})}return{latency:o,download:s}}]),e}var ne=[d,f,g,h,v,y,b];var oe=`<main class="container gc-demo">
  <header class="page-header">
    <span class="label label-primary">Bootstrap 3.4.1</span>
    <h1>Componentes antigos, modelo novo</h1>
    <p class="lead">Props de uma via, eventos, templates separados e destruicao automatica.</p>
    <div class="alert alert-info" role="status">{{ vm.message }}</div>
  </header>

  <section class="row">
    <div class="col-md-6">
      <h2>Consulta e campo inteligente</h2>
      <gc-lookup label="Cliente" items="vm.people" columns="vm.columns" value="vm.selectedPerson" on-select="vm.selectPerson($event)" on-clear="vm.clearPerson()"></gc-lookup>
      <gc-smart-input label="Atalho de cliente" items="vm.people" display-key="NOME" value-key="ID" on-select="vm.selectPerson($event)"></gc-smart-input>
    </div>
    <div class="col-md-6">
      <h2>Confirmacao</h2>
      <div class="well"><button class="btn btn-primary" type="button" ng-click="vm.openDialog()">Abrir confirmacao</button></div>
      <gc-confirm-dialog open="vm.dialogOpen" title="Confirmar processamento" message="Os dados selecionados serao processados." on-confirm="vm.confirmDialog()" on-cancel="vm.closeDialog()"></gc-confirm-dialog>
    </div>
  </section>

  <h2>Tabela declarativa</h2>
  <gc-data-grid rows="vm.people" columns="vm.columns" track-by="ID" page-size="3" selectable="true" on-select="vm.selectPerson($event)"></gc-data-grid>

  <h2>Componente dentro de componente</h2>
  <p class="text-muted">O historico abaixo reutiliza internamente o componente de tabela.</p>
  <gc-history-panel entries="vm.history" on-select="vm.selectPerson($event)"></gc-history-panel>

  <h2>Selecao multipla</h2>
  <gc-multi-lookup items="vm.people" selected="vm.selectedPeople" columns="vm.columns" track-by="ID" on-change="vm.updatePeople($event)"></gc-multi-lookup>

  <section class="row">
    <div class="col-md-6"><h2>Arquivos</h2><gc-file-manager accept="image/*,.pdf,.txt" on-add="vm.filesAdded($event)"></gc-file-manager></div>
    <div class="col-md-6"><h2>Fluxo operacional</h2><gc-operation-flow steps="vm.steps" current="1" running="vm.running" on-execute="vm.startFlow()" on-cancel="vm.stopFlow()"></gc-operation-flow></div>
  </section>

  <h2>Importacao CSV</h2>
  <gc-file-import separator=";" on-import="vm.importRows($event)"></gc-file-import>
</main>
`;var ae=`:host { display: block; }
.gc-demo { padding-top: 20px; padding-bottom: 60px; }
.gc-demo .page-header h1 { margin-top: 8px; }
.gc-demo > h2, .gc-demo .row h2 { margin-top: 30px; font-size: 22px; }

`;var se=[{ID:1,NOME:"Ana Lima",EMAIL:"ana@empresa.com",CIDADE:"Fortaleza"},{ID:2,NOME:"Bruno Reis",EMAIL:"bruno@empresa.com",CIDADE:"Recife"},{ID:3,NOME:"Carla Souza",EMAIL:"carla@empresa.com",CIDADE:"Natal"},{ID:4,NOME:"Diego Alves",EMAIL:"diego@empresa.com",CIDADE:"Teresina"}],ie=EasyComponents.defineComponent("legacy-demo-root",{state:function(){return{dialogOpen:!1,message:"Pronto para testar.",people:se,selectedPerson:null,selectedPeople:[se[0]],columns:[{key:"ID",label:"Codigo",width:"90px"},{key:"NOME",label:"Nome"},{key:"EMAIL",label:"E-mail"},{key:"CIDADE",label:"Cidade"}],history:[{ID:1,DATA:"17/10/2026 10:20",USUARIO:"admin",DESCRICAO:"Cadastro criado"},{ID:2,DATA:"17/10/2026 10:31",USUARIO:"ana",DESCRICAO:"Endereco atualizado"}],steps:[{id:1,title:"Validar",description:"Confere os dados",status:"done",progress:100},{id:2,title:"Processar",description:"Executa a operacao",status:"ready",progress:45},{id:3,title:"Finalizar",description:"Grava o resultado",status:"waiting",progress:0}],running:!1}},methods:{selectPerson:function(e){this.$setState({selectedPerson:e,message:"Selecionado: "+e.NOME})},clearPerson:function(){this.$setState({selectedPerson:null,message:"Selecao limpa."})},updatePeople:function(e){this.$setState({selectedPeople:e})},openDialog:function(){this.$setState({dialogOpen:!0})},closeDialog:function(){this.$setState({dialogOpen:!1,message:"Operacao cancelada."})},confirmDialog:function(){this.$setState({dialogOpen:!1,message:"Operacao confirmada."})},startFlow:function(){this.$setState({running:!0,message:"Fluxo iniciado."})},stopFlow:function(){this.$setState({running:!1,message:"Fluxo interrompido."})},filesAdded:function(e){this.$setState({message:(Array.isArray(e)?e.length:1)+" arquivo(s) adicionado(s)."})},importRows:function(e){this.$setState({message:e.rows.length+" linha(s) prontas para o backend."})}},template:oe,styles:ae,scoped:!0});EasyComponents.createApp({name:"legacyMigrationDemo",components:ne.concat(te,[ie])});})();
//# sourceMappingURL=app.bundle.js.map
