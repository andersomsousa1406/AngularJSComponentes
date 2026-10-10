(()=>{var k=`<output class="value-display">
  <span>{{ vm.label }}</span>
  <strong>{{ vm.value === null || vm.value === undefined ? '—' : vm.value }}</strong>
</output>
`;var _=`.value-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(121, 92, 255, .1);
  color: #aab5ce;
}

.value-display strong { color: #edf2ff; font-size: 1.1rem; }
`;function m(t){return t.component("valueDisplay",{props:{label:{type:String,binding:"@",default:"Valor recebido"},value:{binding:"<"}},template:k,styles:_})}var $=`<section class="performance-lab" aria-live="polite">
  <header>
    <div>
      <span class="performance-lab__eyebrow">Diagnostico real no navegador</span>
      <h2>Desempenho e ciclo de vida</h2>
    </div>
    <button type="button" ng-click="vm.run()" ng-disabled="vm.running">
      {{ vm.running ? 'Testando…' : 'Testar novamente' }}
    </button>
  </header>

  <p ng-if="vm.running">Criando, atualizando e destruindo componentes…</p>

  <div class="performance-lab__results" ng-if="vm.result">
    <strong class="performance-lab__status" ng-class="{ 'is-ok': vm.result.passed }">
      {{ vm.result.passed ? 'Sem vazamento estrutural' : 'Possivel retencao detectada' }}
    </strong>
    <dl>
      <div><dt>Componentes compilados</dt><dd>{{ vm.result.compiled }}</dd></div>
      <div><dt>Atualizacoes de binding</dt><dd>{{ vm.result.bindingUpdates }}</dd></div>
      <div><dt>Tempo total</dt><dd>{{ vm.result.duration }} ms</dd></div>
      <div><dt>Vazao</dt><dd>{{ vm.result.componentsPerSecond }}/s</dd></div>
      <div><dt>Scopes retidos</dt><dd data-testid="scope-delta">{{ vm.result.scopeDelta }}</dd></div>
      <div><dt>Nos retidos</dt><dd data-testid="node-delta">{{ vm.result.remainingNodes }}</dd></div>
      <div ng-if="vm.result.heapDelta !== null"><dt>Variacao do heap</dt><dd>{{ vm.result.heapDelta | number }} bytes</dd></div>
    </dl>
  </div>

  <div class="performance-lab__sandbox" aria-hidden="true">
    <benchmark-probe
      ng-repeat="item in vm.items track by item.id"
      value="item.value">
    </benchmark-probe>
  </div>
</section>
`;var S=`.performance-lab {
  margin-top: 28px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 18px;
  background: rgba(13, 19, 37, .7);
}

.performance-lab header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.performance-lab h2 { margin: 4px 0 0; font-size: 1.2rem; }
.performance-lab__eyebrow { color: #15cfae; font-size: .7rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.performance-lab > p { color: #aab5ce; }

.performance-lab button {
  min-width: 140px;
  padding: 10px 14px;
  border: 0;
  border-radius: 10px;
  background: #15cfae;
  color: #07120f;
  font-weight: 800;
  cursor: pointer;
}

.performance-lab button:disabled { cursor: wait; opacity: .6; }
.performance-lab__status { display: block; margin: 20px 0 12px; color: #ff8d8d; }
.performance-lab__status.is-ok { color: #43e7bc; }
.performance-lab dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 0; }
.performance-lab dl div { padding: 10px; border-radius: 10px; background: rgba(255, 255, 255, .04); }
.performance-lab dt { color: #8793ad; font-size: .75rem; }
.performance-lab dd { margin: 4px 0 0; font-weight: 800; }
.performance-lab__sandbox { position: fixed; left: -100000px; width: 1px; height: 1px; overflow: hidden; }

@media (max-width: 560px) {
  .performance-lab header { align-items: flex-start; flex-direction: column; }
  .performance-lab dl { grid-template-columns: 1fr; }
}
`;function z(t){var e=0;function o(n){var r;if(n)for(e+=1,r=n.$$childHead;r;)o(r),r=r.$$nextSibling}return o(t),e}function C(){return!window.performance||!window.performance.memory?null:window.performance.memory.usedJSHeapSize}function u(t){return t.component("benchmarkProbe",{props:{value:Number},watch:{value:function(){}},template:'<span class="benchmark-probe">{{ vm.value }}</span>'}),t.component("performanceLab",{state:{items:[],running:!1,result:null},methods:{run:function(){var e=this,o=20,n=150,r=4;e.running||(e.$setState({running:!0,result:null}),window.setTimeout(function(){var b=e.$scope.$root,v=z(b),p,h,d,l,i,a;for(window.gc&&window.gc(),p=C(),h=window.performance?window.performance.now():Date.now(),d=0;d<o;d+=1){for(a=[],i=0;i<n;i+=1)a.push({id:d+"-"+i,value:i});for(e.$setState({items:a}),e.$scope.$digest(),l=0;l<r;l+=1)a=a.map(function(s){return{id:s.id,value:s.value+1}}),e.$setState({items:a}),e.$scope.$digest();e.$setState({items:[]}),e.$scope.$digest()}var x=(window.performance?window.performance.now():Date.now())-h;a=null,window.setTimeout(function(){window.gc&&window.gc();var s=z(b),w=C(),y=document.querySelectorAll("benchmark-probe").length,c=o*n;e.$setState({running:!1,result:{passed:s===v&&y===0,compiled:c,bindingUpdates:c*r,duration:Math.round(x),componentsPerSecond:Math.round(c/(x/1e3)),scopeDelta:s-v,remainingNodes:y,heapDelta:p===null||w===null?null:w-p}})},50)},0))}},hooks:{postLink:function(){window.setTimeout(this.run,50)}},template:$,styles:S})}var D=`<main class="page">
  <p class="eyebrow">AngularJS 1.8.4</p>
  <h1>Componentes simples,<br>mesmo em projetos legados.</h1>
  <p class="intro">Props, estado, computed values e eventos em uma API pequena e previsivel.</p>

  <counter-card
    title="Contador de exemplo"
    initial="vm.start"
    step="vm.step"
    on-change="vm.record($event)">
    <span>Este texto chegou pelo slot.</span>
  </counter-card>

  <section class="data-flow">
    <p>Componente irmao recebendo o valor pelo pai:</p>
    <value-display
      label="Ultimo evento"
      value="vm.lastValue">
    </value-display>
  </section>

  <performance-lab></performance-lab>
</main>
`;var A=`.page {
  width: min(92%, 720px);
  margin: 0 auto;
  padding: 72px 0;
}

.eyebrow {
  color: #9e8cff;
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
}

h1 {
  margin: 8px 0 16px;
  font-size: clamp(2.5rem, 7vw, 4.8rem);
  line-height: .98;
  letter-spacing: -.055em;
}

.intro { color: #aab5ce; font-size: 1.1rem; margin-bottom: 36px; }
.data-flow {
  margin-top: 18px;
  padding: 18px;
  border: 1px dashed rgba(158, 140, 255, .35);
  border-radius: 16px;
}

.data-flow > p { margin: 0 0 10px; color: #aab5ce; }
`;function f(t){return t.component("appRoot",{state:{start:2,step:1,lastValue:null},methods:{record:function(e){this.$setState({lastValue:e})}},template:D,styles:A})}var P=`<article class="counter">
  <header>
    <span class="badge">easyComponent</span>
    <h2>{{ vm.title }}</h2>
  </header>

  <div class="counter__value">{{ vm.count }}</div>
  <p>Dobro: {{ vm.doubled }}</p>

  <div class="counter__actions">
    <button type="button" ng-click="vm.decrement()" aria-label="Diminuir">−</button>
    <button type="button" ng-click="vm.increment()" aria-label="Aumentar">+</button>
  </div>

  <div class="slot" ng-transclude></div>

  <value-display
    label="Filho aninhado recebeu"
    value="vm.count">
  </value-display>
</article>
`;var V=`.counter {
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 24px;
  background: rgba(20, 27, 50, .82);
  box-shadow: 0 24px 80px rgba(0, 0, 0, .3);
  backdrop-filter: blur(18px);
}

.counter .badge {
  color: #9e8cff;
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.counter header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.counter h2 { margin: 0; font-size: 1.1rem; }
.counter__value { margin-top: 32px; font-size: 5rem; font-weight: 800; line-height: 1; }
.counter p { color: #aab5ce; }
.counter__actions { display: flex; gap: 10px; margin: 28px 0; }

.counter button {
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 14px;
  background: #795cff;
  color: white;
  font-size: 1.7rem;
  cursor: pointer;
  transition: transform .15s ease, background .15s ease;
}

.counter button:hover { background: #8c74ff; transform: translateY(-2px); }
.counter .slot { padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, .1); color: #c6cee0; }
`;function g(t){return t.component("counterCard",{props:{title:{type:String,binding:"@",default:"Contador"},initial:{type:Number,default:0},step:{type:Number,default:1,validator:function(e){return e>0}},onChange:Function},state:function(){return{count:this.initial}},computed:{doubled:function(){return this.count*2}},methods:{increment:function(){this.$setState({count:this.count+this.step}),this.$emit("onChange",this.count)},decrement:function(){this.$setState(function(){return{count:this.count-this.step}}),this.$emit("onChange",this.count)}},hooks:{onInit:function(){this.startedAt=new Date}},transclude:!0,template:P,styles:V})}angular.module("demoApp",["ngEasyComponents"]);var B=EasyComponents.use("demoApp");B.register(m,u,f,g);})();
