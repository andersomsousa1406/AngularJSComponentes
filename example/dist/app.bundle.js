(()=>{var U=`<output class="value-display">
  <span><i aria-hidden="true"></i>{{ vm.label }}</span>
  <strong>{{ vm.value === null || vm.value === undefined ? '—' : vm.value }}</strong>
</output>
`;var N=`.value-display { display: flex; margin-top: 13px; padding: 11px 13px; align-items: center; justify-content: space-between; gap: 16px; border: 1px solid rgba(255,255,255,.07); border-radius: 10px; color: #8390a8; background: rgba(255,255,255,.025); }
.value-display span { display: flex; align-items: center; gap: 8px; font-size: .65rem; }.value-display i { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
.value-display strong { color: #edf2ff; font-family: monospace; font-size: .95rem; }
`;function g(t){return t.component("valueDisplay",{props:{label:{type:String,binding:"@",default:"Valor recebido"},value:{binding:"<"}},template:U,styles:N})}var V=`<section class="performance-lab" aria-live="polite">
  <header class="performance-lab__header">
    <div class="performance-lab__title">
      <span class="performance-lab__terminal"><i></i><i></i><i></i></span>
      <div><span class="performance-lab__eyebrow">Chrome runtime diagnostic</span><h3>Benchmark de componentes</h3></div>
    </div>
    <button type="button" ng-click="vm.run()" ng-disabled="vm.running">
      <span ng-if="!vm.running">Executar novamente</span><span ng-if="vm.running">Executando teste…</span>
    </button>
  </header>

  <div class="performance-lab__running" ng-if="vm.running"><i></i><span>Criando, atualizando e destruindo 3.000 instancias…</span></div>

  <div class="performance-lab__content" ng-if="vm.result">
    <aside class="performance-lab__score">
      <div class="score-ring" ng-class="{ 'is-ok': vm.result.passed }"><strong>{{ vm.result.passed ? 'A' : '!' }}</strong><span>resultado</span></div>
      <div><strong class="performance-lab__status" ng-class="{ 'is-ok': vm.result.passed }">{{ vm.result.passed ? 'Sem vazamento estrutural' : 'Possivel retencao detectada' }}</strong><p>Scopes e elementos DOM retornaram ao estado inicial depois do ciclo.</p></div>
    </aside>

    <dl class="performance-lab__results">
      <div><dt>Componentes</dt><dd>{{ vm.result.compiled | number }}</dd><small>criados + destruidos</small></div>
      <div><dt>Bindings</dt><dd>{{ vm.result.bindingUpdates | number }}</dd><small>atualizacoes</small></div>
      <div><dt>Tempo total</dt><dd>{{ vm.result.duration }}<b>ms</b></dd><small>rodada completa</small></div>
      <div><dt>Vazao</dt><dd>{{ vm.result.componentsPerSecond | number }}<b>/s</b></dd><small>componentes por segundo</small></div>
      <div><dt>Scopes retidos</dt><dd data-testid="scope-delta">{{ vm.result.scopeDelta }}</dd><small>esperado: zero</small></div>
      <div><dt>Nos retidos</dt><dd data-testid="node-delta">{{ vm.result.remainingNodes }}</dd><small>esperado: zero</small></div>
    </dl>

    <footer>
      <span><i class="is-green"></i> Ciclo de vida aprovado</span>
      <span ng-if="vm.result.heapDelta !== null"><i></i> Heap: {{ vm.result.heapDelta | number }} bytes</span>
      <code>performance.now()</code>
    </footer>
  </div>

  <div class="performance-lab__sandbox" aria-hidden="true">
    <benchmark-probe ng-repeat="item in vm.items track by item.id" value="item.value"></benchmark-probe>
  </div>
</section>
`;var J=`.performance-lab { overflow: hidden; border: 1px solid rgba(255,255,255,.11); border-radius: 24px; background: #0d131f; box-shadow: 0 30px 80px rgba(0,0,0,.26); }
.performance-lab__header { display: flex; min-height: 78px; padding: 0 25px; align-items: center; justify-content: space-between; gap: 20px; border-bottom: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.018); }
.performance-lab__title { display: flex; align-items: center; gap: 17px; }.performance-lab__terminal { display: flex; width: 44px; height: 38px; padding: 0 9px; align-items: center; justify-content: center; gap: 4px; border: 1px solid rgba(255,255,255,.1); border-radius: 9px; background: #090e17; }.performance-lab__terminal i { width: 5px; height: 5px; border-radius: 50%; background: #ff6b73; }.performance-lab__terminal i:nth-child(2) { background: #ffc557; }.performance-lab__terminal i:nth-child(3) { background: #4bd69a; }
.performance-lab__eyebrow { color: var(--accent); font-family: monospace; font-size: .56rem; letter-spacing: .09em; text-transform: uppercase; }.performance-lab h3 { margin: 4px 0 0; font-size: 1rem; }
.performance-lab__header button { min-width: 150px; padding: 10px 13px; border: 1px solid var(--accent); border-radius: 9px; color: white; background: var(--accent-soft); font-size: .67rem; font-weight: 750; cursor: pointer; }.performance-lab__header button:hover { background: var(--accent-strong); }.performance-lab__header button:disabled { cursor: wait; opacity: .65; }
.performance-lab__running { display: flex; min-height: 260px; align-items: center; justify-content: center; gap: 12px; color: #8995aa; font-size: .75rem; }.performance-lab__running i { width: 17px; height: 17px; border: 2px solid rgba(255,255,255,.12); border-top-color: var(--accent); border-radius: 50%; animation: lab-spin .7s linear infinite; }
.performance-lab__score { display: grid; padding: 30px; grid-template-columns: auto 1fr; align-items: center; gap: 22px; border-bottom: 1px solid rgba(255,255,255,.075); }.score-ring { display: flex; width: 78px; height: 78px; align-items: center; justify-content: center; flex-direction: column; border: 5px solid #ff8d8d; border-radius: 50%; background: rgba(255,255,255,.02); }.score-ring.is-ok { border-color: #43e7bc; box-shadow: 0 0 30px rgba(67,231,188,.1); }.score-ring strong { font-size: 1.7rem; line-height: 1; }.score-ring span { margin-top: 3px; color: #718098; font-size: .5rem; text-transform: uppercase; }
.performance-lab__status { display: block; color: #ff8d8d; font-size: 1rem; }.performance-lab__status.is-ok { color: #69e7c4; }.performance-lab__score p { max-width: 600px; margin: 7px 0 0; color: #77849c; font-size: .7rem; line-height: 1.6; }
.performance-lab__results { display: grid; margin: 0; padding: 14px; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }.performance-lab__results div { min-width: 0; padding: 18px; border: 1px solid rgba(255,255,255,.065); border-radius: 12px; background: rgba(255,255,255,.018); }.performance-lab__results dt { color: #707c93; font-size: .62rem; }.performance-lab__results dd { overflow: hidden; margin: 12px 0 4px; color: #f1f4fa; font-size: clamp(1.2rem, 3vw, 1.8rem); font-weight: 850; letter-spacing: -.04em; text-overflow: ellipsis; }.performance-lab__results dd b { margin-left: 3px; color: var(--accent); font-family: monospace; font-size: .62rem; font-weight: 600; }.performance-lab__results small { color: #536077; font-size: .55rem; }
.performance-lab__content > footer { display: flex; min-height: 48px; padding: 0 20px; align-items: center; gap: 22px; border-top: 1px solid rgba(255,255,255,.07); color: #667289; background: rgba(0,0,0,.12); font-size: .59rem; }.performance-lab__content > footer span { display: flex; align-items: center; gap: 7px; }.performance-lab__content > footer i { width: 5px; height: 5px; border-radius: 50%; background: #f7b955; }.performance-lab__content > footer i.is-green { background: #43e7bc; }.performance-lab__content > footer code { margin-left: auto; color: #5b687f; }
.performance-lab__sandbox { position: fixed; left: -100000px; width: 1px; height: 1px; overflow: hidden; }
@keyframes lab-spin { to { transform: rotate(360deg); } }
@media (max-width: 650px) { .performance-lab__header { padding: 18px; align-items: flex-start; flex-direction: column; }.performance-lab__header button { width: 100%; }.performance-lab__results { grid-template-columns: repeat(2, minmax(0,1fr)); }.performance-lab__content > footer { padding-block: 12px; align-items: flex-start; flex-direction: column; gap: 7px; }.performance-lab__content > footer code { margin-left: 0; } }
@media (max-width: 420px) { .performance-lab__score { grid-template-columns: 1fr; }.performance-lab__results { grid-template-columns: 1fr; } }
`;function Y(t){var e=0;function a(r){var o;if(r)for(e+=1,o=r.$$childHead;o;)a(o),o=o.$$nextSibling}return a(t),e}function G(){return!window.performance||!window.performance.memory?null:window.performance.memory.usedJSHeapSize}function b(t){return t.component("benchmarkProbe",{props:{value:Number},watch:{value:function(){}},template:'<span class="benchmark-probe">{{ vm.value }}</span>'}),t.component("performanceLab",{state:{items:[],running:!1,result:null},methods:{run:function(){var e=this,a=20,r=150,o=4;e.running||(e.$setState({running:!0,result:null}),window.setTimeout(function(){var i=e.$scope.$root,n=Y(i),d,F,p,m,l,s;for(window.gc&&window.gc(),d=G(),F=window.performance?window.performance.now():Date.now(),p=0;p<a;p+=1){for(s=[],l=0;l<r;l+=1)s.push({id:p+"-"+l,value:l});for(e.$setState({items:s}),e.$scope.$digest(),m=0;m<o;m+=1)s=s.map(function(c){return{id:c.id,value:c.value+1}}),e.$setState({items:s}),e.$scope.$digest();e.$setState({items:[]}),e.$scope.$digest()}var L=(window.performance?window.performance.now():Date.now())-F;s=null,window.setTimeout(function(){window.gc&&window.gc();var c=Y(i),B=G(),I=document.querySelectorAll("benchmark-probe").length,u=a*r;e.$setState({running:!1,result:{passed:c===n&&I===0,compiled:u,bindingUpdates:u*o,duration:Math.round(L),componentsPerSecond:Math.round(u/(L/1e3)),scopeDelta:c-n,remainingNodes:I,heapDelta:d===null||B===null?null:B-d}})},50)},0))}},hooks:{postLink:function(){window.setTimeout(this.run,50)}},template:V,styles:J})}var H=`<div class="demo-shell theme-{{ vm.theme }}">
  <a class="skip-link" href="#conteudo">Pular para o conteudo</a>

  <header class="topbar">
    <a class="brand" href="#inicio" ng-click="vm.closeMenu()" aria-label="Easy Components - inicio">
      <span class="brand__mark" aria-hidden="true">EC</span>
      <span>Easy Components</span>
      <small>v0.1</small>
    </a>

    <button class="menu-button" type="button" ng-click="vm.toggleMenu()" aria-label="Abrir menu" aria-expanded="{{ vm.menuOpen }}">
      <span></span><span></span><span></span>
    </button>

    <nav class="nav" ng-class="{ 'is-open': vm.menuOpen }" aria-label="Navegacao principal">
      <a href="#recursos" ng-click="vm.closeMenu()">Recursos</a>
      <a href="#componentes" ng-click="vm.closeMenu()">Componentes</a>
      <a href="#biblioteca" ng-click="vm.closeMenu()">Biblioteca</a>
      <a href="#desempenho" ng-click="vm.closeMenu()">Desempenho</a>
      <a href="#comecar" ng-click="vm.closeMenu()">Documentacao</a>
    </nav>

    <a class="button button--small button--ghost topbar__cta" href="#comecar">Comecar agora</a>
  </header>

  <main id="conteudo">
    <section class="hero section" id="inicio">
      <div class="hero__copy">
        <div class="eyebrow"><span></span> AngularJS 1.5+ · experiencia moderna</div>
        <h1>Componentes simples.<br><em>Legado poderoso.</em></h1>
        <p class="hero__lead">Uma camada pequena e produtiva para criar componentes AngularJS com props, estado, eventos e estilos isolados por arquivo — sem abandonar o ecossistema que voce ja tem.</p>

        <div class="hero__actions">
          <a class="button button--primary" href="#componentes">Explorar componentes <span aria-hidden="true">→</span></a>
          <a class="button button--ghost" href="#comecar">Ver como funciona</a>
        </div>

        <dl class="hero__stats" aria-label="Resumo do projeto">
          <div><dt>3.000</dt><dd>componentes no teste</dd></div>
          <div><dt>0</dt><dd>scopes retidos</dd></div>
          <div><dt>1</dt><dd>bundle da aplicacao</dd></div>
        </dl>
      </div>

      <div class="hero__visual" aria-label="Exemplo de codigo do Easy Components">
        <div class="orb orb--one"></div>
        <div class="orb orb--two"></div>
        <div class="code-window">
          <header class="code-window__bar">
            <span class="window-dots"><i></i><i></i><i></i></span>
            <span>counter-card.component.js</span>
            <span class="code-window__status">● pronto</span>
          </header>
          <pre><code><span class="token-keyword">export default</span> <span class="token-keyword">function</span> <span class="token-fn">register</span>(app) {
  <span class="token-keyword">return</span> app.<span class="token-fn">component</span>(<span class="token-string">'counterCard'</span>, {
    <span class="token-prop">props</span>: { initial: Number },
    <span class="token-prop">state</span>: { count: <span class="token-number">0</span> },
    <span class="token-prop">computed</span>: {
      doubled() { <span class="token-keyword">return this</span>.count * <span class="token-number">2</span>; }
    },
    <span class="token-prop">template</span>, <span class="token-prop">styles</span>
  });
}</code></pre>
          <footer><span>✓ HTML + CSS incorporados</span><span>8 linhas de API</span></footer>
        </div>
        <div class="floating-chip floating-chip--top"><b>vm.</b> autocomplete</div>
        <div class="floating-chip floating-chip--bottom"><span>✓</span> mount automatico</div>
      </div>
    </section>

    <section class="trust-strip" aria-label="Compatibilidade">
      <span>FEITO PARA PROJETOS REAIS</span>
      <ul>
        <li>AngularJS 1.5+</li>
        <li>ES Modules</li>
        <li>VS Code</li>
        <li>Build com esbuild</li>
        <li>Zero runtime extra</li>
      </ul>
    </section>

    <section class="section section--features" id="recursos">
      <div class="section-heading">
        <div><span class="kicker">Uma API que faz sentido</span><h2>Menos cerimonia.<br>Mais produto.</h2></div>
        <p>Continue usando AngularJS por baixo, mas escreva componentes com uma estrutura que qualquer pessoa acostumada a frameworks modernos reconhece.</p>
      </div>

      <div class="feature-grid">
        <feature-card icon="↘" tag="Fluxo previsivel" title="Props e eventos" description="Dados descem por props; mudancas voltam por callbacks nativos do AngularJS." accent="violet">
          <div class="mini-flow"><span>Pai</span><i>props →</i><span>Filho</span><i>← event</i></div>
        </feature-card>
        <feature-card icon="◇" tag="Estado local" title="$setState simples" description="Atualize objetos ou use uma funcao, mantendo o digest sincronizado automaticamente." accent="cyan">
          <code>vm.$setState({ open: true })</code>
        </feature-card>
        <feature-card icon="ƒ" tag="Valores derivados" title="Computed values" description="Getters declarativos que acompanham o estado pelo ciclo normal do AngularJS." accent="orange">
          <code>doubled: () =&gt; count * 2</code>
        </feature-card>
        <feature-card icon="{ }" tag="Organizacao" title="HTML, CSS e JS juntos" description="Cada componente mora em sua pasta; o build entrega tudo em um unico bundle." accent="green">
          <div class="file-stack"><span>component.js</span><span>template.html</span><span>styles.css</span></div>
        </feature-card>
      </div>
    </section>

    <section class="section playground" id="componentes">
      <div class="section-heading section-heading--center">
        <div><span class="kicker">Playground interativo</span><h2>Componentes trabalhando juntos</h2></div>
        <p>Interaja com os exemplos. Cada bloco abaixo e um componente independente, com estado, estilos e responsabilidades proprias.</p>
      </div>

      <theme-switcher value="vm.theme" on-change="vm.changeTheme($event)"></theme-switcher>

      <div class="playground__grid">
        <div class="playground__primary">
          <div class="demo-label"><span>01</span><div><strong>Estado + computed</strong><small>contador-card</small></div></div>
          <counter-card
            title="Contador reativo"
            initial="vm.start"
            step="vm.step"
            on-change="vm.record($event)">
            <span>Este conteudo chegou por <code>ng-transclude</code>.</span>
          </counter-card>

          <section class="data-flow">
            <p><span class="pulse"></span> Componente irmao atualizado pelo evento do contador</p>
            <value-display label="Ultimo valor recebido" value="vm.lastValue"></value-display>
          </section>
        </div>

        <div class="playground__secondary">
          <div class="demo-label"><span>02</span><div><strong>Composicao + eventos</strong><small>task-board → task-item</small></div></div>
          <task-board on-activity="vm.recordTask($event)"></task-board>
        </div>
      </div>

      <div class="activity-section">
        <div class="activity-section__copy">
          <span class="kicker">Fluxo entre irmaos</span>
          <h3>Um evento, varios componentes sincronizados.</h3>
          <p>O componente pai recebe eventos do contador, do quadro de tarefas e do seletor de tema. Em seguida, repassa o estado atualizado para o feed.</p>
          <div class="flow-diagram" aria-label="Fluxo dos dados">
            <span>Filho A</span><i>evento</i><b>App Root</b><i>prop</i><span>Filho B</span>
          </div>
        </div>
        <activity-feed items="vm.activities"></activity-feed>
      </div>
    </section>

    <section class="section library-section" id="biblioteca">
      <div class="section-heading section-heading--center">
        <div><span class="kicker">Biblioteca de interface</span><h2>Um kit completo de componentes.</h2></div>
        <p>Explore componentes inspirados nos padrões do Bootstrap, agora declarados com props, estado e eventos do Easy Components.</p>
      </div>
      <component-showcase></component-showcase>
    </section>

    <section class="section performance-section" id="desempenho">
      <div class="section-heading">
        <div><span class="kicker">Medicao real, nao promessa</span><h2>Velocidade e memoria<br>ao vivo no seu navegador.</h2></div>
        <p>O laboratorio cria, atualiza e destroi milhares de componentes. Depois verifica scopes, DOM e heap para identificar retencoes.</p>
      </div>
      <performance-lab></performance-lab>
    </section>

    <section class="section quickstart" id="comecar">
      <div class="quickstart__copy">
        <span class="kicker">Do zero ao componente</span>
        <h2>Comece em poucos minutos.</h2>
        <p>Crie o modulo uma vez, importe seus componentes e deixe o Easy Components fazer o bootstrap no momento certo.</p>
        <ol class="steps">
          <li><span>1</span><div><strong>Instale ou copie o plugin</strong><small>Adicione AngularJS e angularjs-easy-components.js.</small></div></li>
          <li><span>2</span><div><strong>Crie componentes por pasta</strong><small>JavaScript, template e estilos proximos.</small></div></li>
          <li><span>3</span><div><strong>Registre e use</strong><small>Uma tag HTML normal, pronta para o AngularJS.</small></div></li>
        </ol>
      </div>
      <code-preview></code-preview>
    </section>

    <section class="section api-section">
      <div class="section-heading section-heading--center">
        <div><span class="kicker">API essencial</span><h2>Tudo que um componente precisa.</h2></div>
        <p>Uma superficie pequena, previsivel e totalmente apoiada no ciclo de vida nativo do AngularJS.</p>
      </div>
      <div class="api-grid">
        <article><code>props</code><h3>Entradas tipadas</h3><p>Defaults, validadores e bindings <code>&lt; @ = &amp;</code>.</p></article>
        <article><code>state</code><h3>Estado local</h3><p>Objeto ou factory inicializada depois das props.</p></article>
        <article><code>methods</code><h3>Metodos ligados</h3><p><code>this</code> sempre aponta para o componente.</p></article>
        <article><code>computed</code><h3>Valores derivados</h3><p>Getters enxutos, sem sincronizacao manual.</p></article>
        <article><code>watch</code><h3>Observadores seguros</h3><p>Watchers removidos automaticamente no destroy.</p></article>
        <article><code>hooks</code><h3>Ciclo completo</h3><p>Init, changes, post-link e destroy.</p></article>
      </div>
    </section>

    <section class="final-cta section">
      <div>
        <span class="kicker">Seu legado nao precisa parecer antigo</span>
        <h2>Modernize a experiencia.<br>Preserve o investimento.</h2>
      </div>
      <a class="button button--light" href="#comecar">Criar primeiro componente <span>→</span></a>
    </section>
  </main>

  <footer class="footer">
    <a class="brand" href="#inicio"><span class="brand__mark">EC</span><span>Easy Components</span></a>
    <p>Componentes modernos para AngularJS. Projeto demonstrativo local.</p>
    <div><a href="#recursos">API</a><a href="#componentes">Exemplos</a><a href="#desempenho">Benchmark</a></div>
  </footer>
</div>
`;var K=`.demo-shell {
  --accent: #8b5cf6;
  --accent-strong: #6d3ee8;
  --accent-soft: rgba(139, 92, 246, .16);
  --cyan: #22d3ee;
  --green: #43e7bc;
  --orange: #ffb866;
  --ink: #f7f8fc;
  --muted: #9ba6bf;
  --surface: #111827;
  --surface-2: #161e2e;
  --line: rgba(255, 255, 255, .1);
  min-height: 100vh;
  overflow: hidden;
  color: var(--ink);
  background: #080c16;
}

.demo-shell.theme-cyan { --accent: #22d3ee; --accent-strong: #0891b2; --accent-soft: rgba(34, 211, 238, .15); }
.demo-shell.theme-orange { --accent: #fb923c; --accent-strong: #ea580c; --accent-soft: rgba(251, 146, 60, .15); }
.demo-shell.theme-green { --accent: #34d399; --accent-strong: #059669; --accent-soft: rgba(52, 211, 153, .15); }
.demo-shell a { color: inherit; text-decoration: none; }
.demo-shell button, .demo-shell input { font: inherit; }
.demo-shell code, .demo-shell pre { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
.demo-shell .section { width: min(1180px, calc(100% - 48px)); margin-inline: auto; }

.skip-link { position: fixed; z-index: 100; top: 10px; left: 10px; padding: 10px 14px; border-radius: 8px; background: white; color: #080c16 !important; transform: translateY(-150%); }
.skip-link:focus { transform: translateY(0); }
.topbar { position: relative; z-index: 20; display: flex; width: min(1180px, calc(100% - 48px)); min-height: 76px; margin-inline: auto; align-items: center; gap: 36px; border-bottom: 1px solid var(--line); }
.brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 780; letter-spacing: -.02em; }
.brand__mark { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; color: white; background: linear-gradient(145deg, var(--accent), var(--accent-strong)); box-shadow: 0 8px 28px var(--accent-soft); font-size: .7rem; letter-spacing: -.03em; }
.brand small { padding: 3px 7px; border: 1px solid var(--line); border-radius: 99px; color: var(--muted); font-size: .62rem; }
.nav { display: flex; margin-left: auto; align-items: center; gap: 30px; }
.nav a { color: var(--muted); font-size: .86rem; font-weight: 650; transition: color .2s; }
.nav a:hover { color: var(--ink); }
.topbar__cta { margin-left: 0; }
.menu-button { display: none; }

.button { display: inline-flex; min-height: 48px; padding: 0 20px; align-items: center; justify-content: center; gap: 12px; border: 1px solid transparent; border-radius: 12px; font-weight: 750; font-size: .9rem; transition: transform .18s ease, border-color .18s ease, background .18s ease; }
.button:hover { transform: translateY(-2px); }
.button--small { min-height: 38px; padding-inline: 15px; font-size: .8rem; }
.button--primary { color: white !important; background: linear-gradient(135deg, var(--accent), var(--accent-strong)); box-shadow: 0 14px 38px var(--accent-soft); }
.button--ghost { border-color: var(--line); background: rgba(255, 255, 255, .03); }
.button--ghost:hover { border-color: rgba(255, 255, 255, .25); background: rgba(255, 255, 255, .06); }
.button--light { color: #111827 !important; background: white; box-shadow: 0 14px 45px rgba(0, 0, 0, .2); }

.hero { position: relative; display: grid; min-height: 700px; padding-block: 100px 76px; grid-template-columns: 1.03fr .97fr; align-items: center; gap: 68px; }
.hero::before { position: absolute; z-index: 0; width: 700px; height: 700px; top: -430px; left: -300px; border-radius: 50%; background: var(--accent); opacity: .12; filter: blur(90px); content: ""; }
.hero__copy, .hero__visual { position: relative; z-index: 1; min-width: 0; }
.eyebrow, .kicker { color: var(--accent); font-size: .72rem; font-weight: 850; letter-spacing: .16em; text-transform: uppercase; }
.eyebrow { display: flex; align-items: center; gap: 9px; }
.eyebrow span { width: 24px; height: 1px; background: currentColor; }
.hero h1 { max-width: 700px; margin: 20px 0 24px; font-size: clamp(3.5rem, 6.6vw, 6.3rem); line-height: .9; letter-spacing: -.075em; }
.hero h1 em { color: var(--accent); font-family: Georgia, "Times New Roman", serif; font-weight: 400; }
.hero__lead { max-width: 620px; margin: 0; color: var(--muted); font-size: clamp(1rem, 1.8vw, 1.18rem); line-height: 1.75; }
.hero__actions { display: flex; margin-top: 34px; flex-wrap: wrap; gap: 12px; }
.hero__stats { display: flex; margin: 50px 0 0; gap: 48px; }
.hero__stats div { position: relative; }
.hero__stats div + div::before { position: absolute; width: 1px; height: 34px; top: 7px; left: -24px; background: var(--line); content: ""; }
.hero__stats dt { font-size: 1.45rem; font-weight: 850; letter-spacing: -.04em; }
.hero__stats dd { margin: 4px 0 0; color: var(--muted); font-size: .72rem; }

.hero__visual { min-width: 0; padding: 48px 0; }
.code-window { position: relative; z-index: 2; overflow: hidden; border: 1px solid rgba(255, 255, 255, .15); border-radius: 18px; background: rgba(13, 18, 31, .94); box-shadow: 0 40px 100px rgba(0, 0, 0, .48), 0 0 0 8px rgba(255, 255, 255, .02); transform: perspective(1100px) rotateY(-4deg) rotateX(1deg); }
.code-window__bar { display: grid; min-height: 50px; padding: 0 16px; grid-template-columns: 1fr auto 1fr; align-items: center; border-bottom: 1px solid var(--line); color: #7f8aa3; font-family: monospace; font-size: .7rem; }
.window-dots { display: flex; gap: 6px; }
.window-dots i { width: 8px; height: 8px; border-radius: 50%; background: #ff6b73; }
.window-dots i:nth-child(2) { background: #ffc557; }.window-dots i:nth-child(3) { background: #4bd69a; }
.code-window__status { justify-self: end; color: #43e7bc; }
.code-window pre { overflow: auto; margin: 0; padding: 32px 26px; color: #cbd5e1; font-size: clamp(.68rem, 1.1vw, .83rem); line-height: 1.8; }
.code-window footer { display: flex; padding: 13px 18px; justify-content: space-between; border-top: 1px solid var(--line); color: #71809d; background: rgba(255, 255, 255, .02); font-size: .68rem; }
.token-keyword { color: #c084fc; }.token-fn { color: #67e8f9; }.token-string { color: #86efac; }.token-prop { color: #f9a8d4; }.token-number { color: #fdba74; }
.orb { position: absolute; border-radius: 50%; filter: blur(2px); }
.orb--one { width: 300px; height: 300px; top: -30px; right: -50px; background: var(--accent); opacity: .18; filter: blur(65px); }
.orb--two { width: 180px; height: 180px; bottom: -20px; left: -40px; background: var(--cyan); opacity: .11; filter: blur(55px); }
.floating-chip { position: absolute; z-index: 3; padding: 10px 14px; border: 1px solid rgba(255,255,255,.14); border-radius: 10px; background: rgba(22,30,46,.9); box-shadow: 0 16px 40px rgba(0,0,0,.3); color: #b8c2d8; font-family: monospace; font-size: .68rem; backdrop-filter: blur(12px); }
.floating-chip--top { top: 18px; right: -16px; }.floating-chip--top b { color: var(--accent); }
.floating-chip--bottom { bottom: 10px; left: -24px; }.floating-chip--bottom span { color: var(--green); }

.trust-strip { display: flex; padding: 26px max(24px, calc((100vw - 1180px) / 2)); align-items: center; gap: 46px; border-block: 1px solid var(--line); background: rgba(255,255,255,.018); }
.trust-strip > span { flex: 0 0 auto; color: #657089; font-size: .62rem; font-weight: 850; letter-spacing: .16em; }
.trust-strip ul { display: flex; width: 100%; margin: 0; padding: 0; justify-content: space-between; gap: 24px; color: #a4aec4; list-style: none; font-size: .78rem; font-weight: 650; }

.section--features, .playground, .library-section, .performance-section, .quickstart, .api-section { padding-block: 120px; }
.section-heading { display: grid; margin-bottom: 54px; grid-template-columns: 1.1fr .75fr; align-items: end; gap: 70px; }
.section-heading h2 { margin: 12px 0 0; font-size: clamp(2.35rem, 5vw, 4.25rem); line-height: 1; letter-spacing: -.06em; }
.section-heading > p { max-width: 480px; margin: 0 0 5px; color: var(--muted); line-height: 1.75; }
.section-heading--center { display: block; max-width: 720px; margin-inline: auto; text-align: center; }
.section-heading--center > p { margin: 20px auto 0; }
.feature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.mini-flow { display: flex; align-items: center; gap: 8px; color: #cad2e4; font-size: .73rem; }
.mini-flow span { padding: 7px 10px; border: 1px solid var(--line); border-radius: 7px; background: rgba(255,255,255,.04); }.mini-flow i { color: var(--muted); font-style: normal; }
.file-stack { display: flex; gap: 8px; flex-wrap: wrap; }.file-stack span { padding: 6px 9px; border-radius: 7px; background: rgba(255,255,255,.06); color: #bdc7da; font-family: monospace; font-size: .65rem; }

.playground { position: relative; }
.playground::before { position: absolute; z-index: 0; inset: 40px -100vw; border-block: 1px solid var(--line); background: linear-gradient(180deg, rgba(255,255,255,.018), transparent); content: ""; }
.playground > * { position: relative; z-index: 1; }
.playground__grid { display: grid; margin-top: 44px; grid-template-columns: .9fr 1.1fr; gap: 18px; align-items: start; }
.playground__primary, .playground__secondary { min-width: 0; }
.demo-label { display: flex; margin-bottom: 14px; align-items: center; gap: 10px; color: var(--muted); }
.demo-label > span { display: grid; width: 30px; height: 30px; place-items: center; border: 1px solid var(--line); border-radius: 8px; color: var(--accent); font-family: monospace; font-size: .67rem; }
.demo-label div { display: flex; flex-direction: column; }.demo-label strong { color: var(--ink); font-size: .78rem; }.demo-label small { margin-top: 1px; font-family: monospace; font-size: .62rem; }
.data-flow { margin-top: 12px; padding: 14px; border: 1px dashed rgba(139, 92, 246, .38); border-radius: 14px; background: var(--accent-soft); }
.data-flow > p { display: flex; margin: 0; align-items: center; gap: 8px; color: var(--muted); font-size: .72rem; }
.pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 5px rgba(67,231,188,.1); }
.activity-section { display: grid; margin-top: 72px; padding: 50px; grid-template-columns: .9fr 1.1fr; gap: 70px; border: 1px solid var(--line); border-radius: 26px; background: radial-gradient(circle at 0 0, var(--accent-soft), transparent 40%), #0d1320; }
.activity-section__copy h3 { max-width: 470px; margin: 14px 0; font-size: clamp(1.8rem, 3vw, 2.7rem); line-height: 1.08; letter-spacing: -.045em; }
.activity-section__copy p { color: var(--muted); line-height: 1.7; }
.flow-diagram { display: flex; margin-top: 30px; align-items: center; gap: 8px; flex-wrap: wrap; }
.flow-diagram span, .flow-diagram b { padding: 8px 11px; border: 1px solid var(--line); border-radius: 8px; font-size: .7rem; }.flow-diagram b { border-color: var(--accent); background: var(--accent-soft); }.flow-diagram i { color: #68748c; font-size: .6rem; font-style: normal; text-transform: uppercase; }

.performance-section .section-heading { margin-bottom: 30px; }
.library-section { border-top: 1px solid var(--line); }
.quickstart { display: grid; grid-template-columns: .8fr 1.2fr; align-items: center; gap: 70px; border-top: 1px solid var(--line); }
.quickstart h2 { margin: 13px 0 18px; font-size: clamp(2.5rem, 4vw, 4rem); letter-spacing: -.06em; }
.quickstart__copy > p { color: var(--muted); line-height: 1.7; }
.steps { display: grid; margin: 34px 0 0; padding: 0; gap: 18px; list-style: none; }
.steps li { display: flex; align-items: center; gap: 14px; }.steps li > span { display: grid; flex: 0 0 auto; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 10px; color: var(--accent); font-family: monospace; font-size: .7rem; }
.steps li div { display: flex; flex-direction: column; gap: 4px; }.steps strong { font-size: .85rem; }.steps small { color: var(--muted); font-size: .72rem; }

.api-section { border-top: 1px solid var(--line); }
.api-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.api-grid article { min-height: 190px; padding: 26px; border: 1px solid var(--line); border-radius: 16px; background: rgba(255,255,255,.018); transition: border-color .2s, transform .2s; }
.api-grid article:hover { border-color: rgba(139, 92, 246, .55); transform: translateY(-3px); }
.api-grid article > code { color: var(--accent); font-size: .72rem; }.api-grid h3 { margin: 34px 0 9px; font-size: 1.05rem; }.api-grid p { margin: 0; color: var(--muted); font-size: .78rem; line-height: 1.65; }.api-grid p code { color: #d7ddec; }

.final-cta { display: flex; margin-bottom: 50px; padding: 58px 62px; align-items: center; justify-content: space-between; gap: 40px; border-radius: 28px; background: linear-gradient(120deg, var(--accent-strong), var(--accent)); box-shadow: 0 28px 90px var(--accent-soft); }
.final-cta .kicker { color: rgba(255,255,255,.72); }.final-cta h2 { margin: 12px 0 0; font-size: clamp(2rem, 4vw, 3.7rem); line-height: 1; letter-spacing: -.055em; }
.footer { display: grid; width: min(1180px, calc(100% - 48px)); min-height: 120px; margin: 0 auto; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; border-top: 1px solid var(--line); }
.footer p { color: #69748c; font-size: .68rem; text-align: center; }.footer > div { display: flex; justify-content: flex-end; gap: 18px; }.footer > div a { color: var(--muted); font-size: .72rem; }

@media (max-width: 980px) {
  .hero { min-height: auto; padding-top: 76px; grid-template-columns: 1fr; }.hero__copy { max-width: 780px; }.hero__visual { width: min(700px, 100%); margin-inline: auto; }
  .trust-strip { align-items: flex-start; flex-direction: column; gap: 20px; }.trust-strip ul { flex-wrap: wrap; }
  .playground__grid, .activity-section, .quickstart { grid-template-columns: 1fr; }.activity-section { gap: 40px; }.quickstart { gap: 50px; }
  .nav { gap: 18px; }.topbar__cta { display: none; }
}

@media (max-width: 720px) {
  .demo-shell .section, .topbar, .footer { width: min(100% - 30px, 1180px); }
  .topbar { min-height: 66px; }.brand small { display: none; }
  .menu-button { display: flex; width: 38px; height: 38px; margin-left: auto; padding: 10px; flex-direction: column; justify-content: center; gap: 4px; border: 1px solid var(--line); border-radius: 9px; background: rgba(255,255,255,.03); }
  .menu-button span { width: 100%; height: 1px; background: white; }
  .nav { position: absolute; display: none; top: 58px; right: 0; width: 210px; padding: 16px; align-items: stretch; flex-direction: column; gap: 0; border: 1px solid var(--line); border-radius: 12px; background: #121927; box-shadow: 0 20px 50px rgba(0,0,0,.4); }.nav.is-open { display: flex; }.nav a { padding: 11px; }
  .hero { padding-block: 70px 55px; gap: 32px; }.hero h1 { font-size: clamp(3.2rem, 15vw, 5rem); }.hero__stats { gap: 25px; }.hero__stats div + div::before { left: -13px; }.hero__stats dd { max-width: 90px; }
  .code-window { transform: none; }.floating-chip { display: none; }.code-window__bar { grid-template-columns: auto 1fr; gap: 15px; }.code-window__bar > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.code-window__status { display: none; }
  .trust-strip ul { display: grid; grid-template-columns: 1fr 1fr; }
  .section--features, .playground, .library-section, .performance-section, .quickstart, .api-section { padding-block: 82px; }
  .section-heading { display: block; }.section-heading > p { margin-top: 20px; }.feature-grid, .api-grid { grid-template-columns: 1fr; }
  .activity-section { padding: 28px 20px; }.final-cta { align-items: flex-start; flex-direction: column; padding: 40px 26px; }
  .footer { padding-block: 34px; grid-template-columns: 1fr; }.footer p { text-align: left; }.footer > div { justify-content: flex-start; }
}

@media (max-width: 560px) {
  .hero h1 { max-width: 100%; font-size: clamp(2.75rem, 12vw, 3.6rem); overflow-wrap: anywhere; }
  .hero__lead { max-width: 100%; font-size: .92rem; }
  .hero__actions { flex-direction: column; }.hero__actions .button { width: 100%; flex: 0 0 auto; }
  .hero__stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }.hero__stats div + div::before { display: none; }
  .trust-strip ul { grid-template-columns: 1fr; }.activity-section { margin-top: 48px; }.flow-diagram i { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .demo-shell *, .demo-shell *::before, .demo-shell *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
`;function f(t){return t.component("appRoot",{state:{start:2,step:1,lastValue:null,theme:"violet",menuOpen:!1,activities:[{id:1,type:"system",title:"Aplicacao iniciada",detail:"Bootstrap automatico executado uma unica vez."},{id:2,type:"success",title:"10 componentes registrados",detail:"Templates e estilos vieram no mesmo bundle."}]},methods:{record:function(e){this.addActivity("event","Evento recebido do contador","Novo valor: "+e),this.$setState({lastValue:e})},changeTheme:function(e){this.$setState({theme:e}),this.addActivity("theme","Tema alterado","A interface agora usa a paleta "+e+".")},recordTask:function(e){this.addActivity(e.done?"success":"event",e.done?"Tarefa concluida":"Tarefa reaberta",e.title)},addActivity:function(e,a,r){var o=[{id:Date.now()+Math.random(),type:e,title:a,detail:r}].concat(this.activities).slice(0,5);this.$setState({activities:o})},toggleMenu:function(){this.$setState({menuOpen:!this.menuOpen})},closeMenu:function(){this.$setState({menuOpen:!1})}},template:H,styles:K})}var W=`<article class="counter">
  <header>
    <div><span class="badge">easyComponent</span><h2>{{ vm.title }}</h2></div>
    <span class="counter__live"><i></i> reativo</span>
  </header>

  <div class="counter__number">
    <div class="counter__value">{{ vm.count }}</div>
    <p>Valor computado <strong>{{ vm.doubled }}</strong></p>
  </div>

  <div class="counter__actions">
    <button type="button" ng-click="vm.decrement()" aria-label="Diminuir">−</button>
    <button type="button" ng-click="vm.increment()" aria-label="Aumentar">+</button>
  </div>

  <div class="slot"><span>slot</span><div ng-transclude></div></div>

  <value-display label="Filho aninhado recebeu" value="vm.count"></value-display>
</article>
`;var Q=`.counter { overflow: hidden; padding: 23px; border: 1px solid rgba(255,255,255,.11); border-radius: 20px; background: radial-gradient(circle at 100% 0, var(--accent-soft), transparent 40%), #111827; box-shadow: 0 24px 60px rgba(0,0,0,.22); }
.counter > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }.counter > header > div { display: flex; flex-direction: column; gap: 5px; }
.counter .badge { color: var(--accent); font-size: .56rem; font-weight: 850; letter-spacing: .15em; text-transform: uppercase; }.counter h2 { margin: 0; font-size: 1.02rem; }
.counter__live { display: flex; padding: 5px 8px; align-items: center; gap: 6px; border: 1px solid rgba(67,231,188,.13); border-radius: 99px; color: #75d9bd; background: rgba(67,231,188,.06); font-size: .56rem; }.counter__live i { width: 5px; height: 5px; border-radius: 50%; background: #43e7bc; }
.counter__number { display: flex; margin-top: 34px; align-items: flex-end; justify-content: space-between; }.counter__value { font-size: 5rem; font-weight: 850; line-height: .85; letter-spacing: -.07em; }.counter__number p { display: flex; margin: 0; flex-direction: column; align-items: flex-end; color: #71809a; font-size: .62rem; }.counter__number strong { margin-top: 3px; color: var(--accent); font-family: monospace; font-size: 1.05rem; }
.counter__actions { display: grid; margin: 30px 0 22px; grid-template-columns: 1fr 1fr; gap: 8px; }.counter__actions button { height: 43px; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #e6eaf2; background: rgba(255,255,255,.04); font-size: 1.2rem; cursor: pointer; transition: transform .15s, background .15s; }.counter__actions button:last-child { border-color: transparent; color: white; background: linear-gradient(135deg, var(--accent), var(--accent-strong)); }.counter__actions button:hover { transform: translateY(-2px); background: rgba(255,255,255,.08); }.counter__actions button:last-child:hover { background: linear-gradient(135deg, var(--accent), var(--accent-strong)); }
.counter .slot { display: flex; padding: 12px; align-items: center; gap: 12px; border: 1px dashed rgba(255,255,255,.12); border-radius: 10px; color: #8793aa; font-size: .67rem; }.counter .slot > span { padding: 3px 6px; border-radius: 5px; color: var(--accent); background: var(--accent-soft); font-family: monospace; font-size: .55rem; }.counter .slot p { margin: 0; }
`;function h(t){return t.component("counterCard",{props:{title:{type:String,binding:"@",default:"Contador"},initial:{type:Number,default:0},step:{type:Number,default:1,validator:function(e){return e>0}},onChange:Function},state:function(){return{count:this.initial}},computed:{doubled:function(){return this.count*2}},methods:{increment:function(){this.$setState({count:this.count+this.step}),this.$emit("onChange",this.count)},decrement:function(){this.$setState(function(){return{count:this.count-this.step}}),this.$emit("onChange",this.count)}},hooks:{onInit:function(){this.startedAt=new Date}},transclude:!0,template:W,styles:Q})}var X=`<article class="feature-card feature-card--{{ vm.accent }}">
  <div class="feature-card__top">
    <span class="feature-card__icon" aria-hidden="true">{{ vm.icon }}</span>
    <span class="feature-card__tag">{{ vm.tag }}</span>
  </div>
  <h3>{{ vm.title }}</h3>
  <p>{{ vm.description }}</p>
  <div class="feature-card__demo" ng-transclude></div>
</article>
`;var Z=`.feature-card { position: relative; min-height: 310px; overflow: hidden; padding: 30px; border: 1px solid rgba(255,255,255,.1); border-radius: 20px; background: linear-gradient(145deg, rgba(255,255,255,.035), rgba(255,255,255,.01)); transition: transform .22s ease, border-color .22s ease; }
.feature-card::after { position: absolute; width: 170px; height: 170px; right: -80px; bottom: -90px; border-radius: 50%; background: var(--card-accent); opacity: .13; filter: blur(30px); content: ""; }
.feature-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,.2); }
.feature-card--violet { --card-accent: #8b5cf6; }.feature-card--cyan { --card-accent: #22d3ee; }.feature-card--orange { --card-accent: #fb923c; }.feature-card--green { --card-accent: #34d399; }
.feature-card__top { display: flex; align-items: center; justify-content: space-between; }
.feature-card__icon { display: grid; width: 42px; height: 42px; place-items: center; border: 1px solid color-mix(in srgb, var(--card-accent) 48%, transparent); border-radius: 12px; color: var(--card-accent); background: color-mix(in srgb, var(--card-accent) 10%, transparent); font-family: monospace; font-weight: 800; }
.feature-card__tag { color: #68758d; font-size: .63rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.feature-card h3 { margin: 30px 0 10px; font-size: 1.35rem; letter-spacing: -.035em; }.feature-card > p { max-width: 450px; margin: 0; color: #929eb6; font-size: .84rem; line-height: 1.7; }
.feature-card__demo { position: absolute; z-index: 1; right: 30px; bottom: 28px; left: 30px; }.feature-card__demo > code { display: inline-block; padding: 9px 11px; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; color: #ccd5e7; background: rgba(0,0,0,.2); font-size: .68rem; }
`;function v(t){return t.component("featureCard",{props:{icon:{type:String,binding:"@"},tag:{type:String,binding:"@"},title:{type:String,binding:"@",required:!0},description:{type:String,binding:"@",required:!0},accent:{type:String,binding:"@",default:"violet"}},transclude:!0,template:X,styles:Z})}var ee=`<article class="task-item" ng-class="{ 'is-done': vm.task.done }">
  <button type="button" class="task-item__check" ng-click="vm.toggle()" aria-label="{{ vm.task.done ? 'Reabrir' : 'Concluir' }} {{ vm.task.title }}">
    <span aria-hidden="true">{{ vm.task.done ? '✓' : '' }}</span>
  </button>
  <div class="task-item__content">
    <strong>{{ vm.task.title }}</strong>
    <small>{{ vm.task.category }}</small>
  </div>
  <span class="task-item__points">{{ vm.task.points }} pt</span>
</article>
`;var te=`.task-item { display: flex; min-height: 64px; padding: 11px 13px; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,.075); border-radius: 12px; background: rgba(255,255,255,.025); transition: opacity .2s, background .2s, border-color .2s; }
.task-item:hover { border-color: rgba(255,255,255,.15); background: rgba(255,255,255,.04); }
.task-item__check { display: grid; flex: 0 0 auto; width: 25px; height: 25px; padding: 0; place-items: center; border: 1px solid rgba(255,255,255,.2); border-radius: 7px; color: #07120f; background: transparent; cursor: pointer; }
.task-item.is-done .task-item__check { border-color: #43e7bc; background: #43e7bc; }.task-item.is-done .task-item__content strong { color: #69758d; text-decoration: line-through; }
.task-item__content { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 3px; }.task-item__content strong { overflow: hidden; color: #e7ebf5; font-size: .78rem; text-overflow: ellipsis; white-space: nowrap; }.task-item__content small { color: #6f7b94; font-size: .64rem; }
.task-item__points { flex: 0 0 auto; padding: 4px 7px; border-radius: 6px; color: #8d99b0; background: rgba(255,255,255,.05); font-family: monospace; font-size: .6rem; }
`;function x(t){return t.component("taskItem",{props:{task:{type:Object,required:!0},onToggle:Function},methods:{toggle:function(){this.$emit("onToggle",this.task)}},template:ee,styles:te})}var ae=`<section class="task-board">
  <header class="task-board__header">
    <div>
      <span>SPRINT ATUAL</span>
      <h3>Componentes da release</h3>
    </div>
    <button type="button" class="task-board__add" ng-click="vm.addTask()"><span>+</span> Nova tarefa</button>
  </header>

  <div class="task-board__progress">
    <div><span>Progresso</span><strong>{{ vm.doneCount }}/{{ vm.tasks.length }} concluidas</strong></div>
    <div class="task-board__track"><i ng-style="{ width: vm.progress + '%' }"></i></div>
  </div>

  <nav class="task-board__filters" aria-label="Filtrar tarefas">
    <button type="button" ng-click="vm.setFilter('all')" ng-class="{ active: vm.filter === 'all' }">Todas</button>
    <button type="button" ng-click="vm.setFilter('open')" ng-class="{ active: vm.filter === 'open' }">Abertas</button>
    <button type="button" ng-click="vm.setFilter('done')" ng-class="{ active: vm.filter === 'done' }">Concluidas</button>
  </nav>

  <div class="task-board__list">
    <task-item ng-repeat="task in vm.visibleTasks track by task.id" task="task" on-toggle="vm.toggleTask($event)"></task-item>
    <p class="task-board__empty" ng-if="!vm.visibleTasks.length">Nenhuma tarefa nesta visualizacao.</p>
  </div>

  <footer><span><i></i> Estado sincronizado</span><code>{{ vm.progress }}%</code></footer>
</section>
`;var oe=`.task-board { overflow: hidden; border: 1px solid rgba(255,255,255,.11); border-radius: 20px; background: #111827; box-shadow: 0 24px 60px rgba(0,0,0,.22); }
.task-board__header { display: flex; padding: 22px 23px 18px; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid rgba(255,255,255,.075); }
.task-board__header div > span { color: var(--accent); font-size: .58rem; font-weight: 850; letter-spacing: .15em; }.task-board__header h3 { margin: 5px 0 0; font-size: 1.02rem; }
.task-board__add { display: inline-flex; padding: 8px 11px; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,.11); border-radius: 8px; color: #d8deeb; background: rgba(255,255,255,.035); font-size: .67rem; font-weight: 750; cursor: pointer; }.task-board__add:hover { background: rgba(255,255,255,.07); }.task-board__add span { color: var(--accent); font-size: 1rem; }
.task-board__progress { padding: 17px 23px 6px; }.task-board__progress > div:first-child { display: flex; margin-bottom: 9px; justify-content: space-between; color: #7f8ba2; font-size: .65rem; }.task-board__progress strong { color: #b8c1d4; font-weight: 650; }
.task-board__track { height: 5px; overflow: hidden; border-radius: 9px; background: rgba(255,255,255,.06); }.task-board__track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent-strong), var(--accent)); transition: width .25s ease; }
.task-board__filters { display: flex; padding: 13px 23px; gap: 5px; }.task-board__filters button { padding: 6px 9px; border: 0; border-radius: 7px; color: #77839b; background: transparent; font-size: .64rem; font-weight: 700; cursor: pointer; }.task-board__filters button.active { color: #e8ecf5; background: rgba(255,255,255,.07); }
.task-board__list { display: grid; min-height: 292px; padding: 0 23px 18px; align-content: start; gap: 8px; }.task-board__empty { padding: 40px 0; color: #69748a; font-size: .72rem; text-align: center; }
.task-board > footer { display: flex; min-height: 43px; padding: 0 23px; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,.075); color: #68748a; background: rgba(0,0,0,.12); font-size: .61rem; }.task-board > footer span { display: flex; align-items: center; gap: 7px; }.task-board > footer i { width: 6px; height: 6px; border-radius: 50%; background: #43e7bc; box-shadow: 0 0 0 4px rgba(67,231,188,.08); }.task-board > footer code { color: var(--accent); }
@media (max-width: 430px) { .task-board__header { align-items: flex-start; flex-direction: column; }.task-board__add { width: 100%; justify-content: center; } }
`;function y(t){return t.component("taskBoard",{props:{onActivity:Function},state:{filter:"all",createdCount:0,tasks:[{id:1,title:"Criar componente de perfil",category:"Interface",points:3,done:!0},{id:2,title:"Conectar evento on-save",category:"Integracao",points:5,done:!1},{id:3,title:"Validar props obrigatorias",category:"Qualidade",points:2,done:!1},{id:4,title:"Executar benchmark local",category:"Performance",points:8,done:!0}]},computed:{doneCount:function(){return this.tasks.filter(function(e){return e.done}).length},progress:function(){return Math.round(this.doneCount/this.tasks.length*100)},visibleTasks:function(){var e=this.filter;return e==="all"?this.tasks:this.tasks.filter(function(a){return e==="done"?a.done:!a.done})}},methods:{setFilter:function(e){this.$setState({filter:e})},toggleTask:function(e){var a,r=this.tasks.map(function(o){return o.id!==e.id?o:(a=Object.assign({},o,{done:!o.done}),a)});this.$setState({tasks:r}),this.$emit("onActivity",a)},addTask:function(){var e=this.createdCount+1,a={id:Date.now(),title:"Novo componente #"+e,category:"Backlog",points:3,done:!1};this.$setState({tasks:this.tasks.concat(a),createdCount:e,filter:"all"}),this.$emit("onActivity",a)}},template:ae,styles:oe})}var re=`<aside class="theme-switcher" aria-label="Personalizar demonstracao">
  <div><span class="theme-switcher__icon">◐</span><p><strong>Props em tempo real</strong><small>Tema atual: {{ vm.currentLabel }}</small></p></div>
  <div class="theme-switcher__options">
    <button ng-repeat="theme in vm.themes" type="button" ng-click="vm.choose(theme)" ng-class="{ active: vm.value === theme.id }" aria-label="Usar tema {{ theme.label }}" aria-pressed="{{ vm.value === theme.id }}">
      <i ng-style="{ background: theme.color }"></i><span>{{ theme.label }}</span>
    </button>
  </div>
</aside>
`;var ie=`.theme-switcher { display: flex; max-width: 780px; margin: 0 auto; padding: 12px 14px; align-items: center; justify-content: space-between; gap: 20px; border: 1px solid rgba(255,255,255,.1); border-radius: 14px; background: rgba(255,255,255,.025); }
.theme-switcher > div:first-child { display: flex; align-items: center; gap: 10px; }.theme-switcher__icon { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 9px; color: var(--accent); background: var(--accent-soft); }
.theme-switcher p { display: flex; margin: 0; flex-direction: column; gap: 2px; }.theme-switcher strong { font-size: .72rem; }.theme-switcher small { color: #7f8aa1; font-size: .61rem; }
.theme-switcher__options { display: flex; gap: 4px; }.theme-switcher__options button { display: flex; padding: 7px 9px; align-items: center; gap: 6px; border: 1px solid transparent; border-radius: 8px; color: #7f8aa1; background: transparent; font-size: .62rem; cursor: pointer; }.theme-switcher__options button:hover, .theme-switcher__options button.active { border-color: rgba(255,255,255,.11); color: #e6eaf3; background: rgba(255,255,255,.05); }.theme-switcher__options i { width: 8px; height: 8px; border-radius: 50%; }
@media (max-width: 620px) { .theme-switcher { align-items: stretch; flex-direction: column; }.theme-switcher__options { display: grid; grid-template-columns: 1fr 1fr; }.theme-switcher__options button { justify-content: center; } }
`;function _(t){return t.component("themeSwitcher",{props:{value:{type:String,default:"violet"},onChange:Function},state:{themes:[{id:"violet",label:"Violeta",color:"#8b5cf6"},{id:"cyan",label:"Ciano",color:"#22d3ee"},{id:"orange",label:"Laranja",color:"#fb923c"},{id:"green",label:"Verde",color:"#34d399"}]},computed:{currentLabel:function(){var e=this.value,a=this.themes.find(function(r){return r.id===e});return a?a.label:e}},methods:{choose:function(e){this.$emit("onChange",e.id)}},template:re,styles:ie})}var ne=`<section class="code-preview">
  <header>
    <nav aria-label="Arquivos do exemplo">
      <button type="button" ng-click="vm.select('component')" ng-class="{ active: vm.active === 'component' }">component.js</button>
      <button type="button" ng-click="vm.select('template')" ng-class="{ active: vm.active === 'template' }">template.html</button>
      <button type="button" ng-click="vm.select('app')" ng-class="{ active: vm.active === 'app' }">app.js</button>
    </nav>
    <button class="code-preview__copy" type="button" ng-click="vm.copy()">{{ vm.copied ? 'Copiado ✓' : 'Copiar' }}</button>
  </header>
  <pre><code ng-bind="vm.code"></code></pre>
  <footer><span>JavaScript</span><span>UTF-8</span><span>Easy Components</span></footer>
</section>
`;var se=`.code-preview { min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: 18px; background: #0d121e; box-shadow: 0 28px 80px rgba(0,0,0,.3); }
.code-preview > header { display: flex; min-height: 50px; padding: 0 12px; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.08); }.code-preview nav { display: flex; min-width: 0; align-self: stretch; }.code-preview nav button { padding: 0 11px; border: 0; border-bottom: 2px solid transparent; color: #657189; background: transparent; font-family: monospace; font-size: .61rem; cursor: pointer; }.code-preview nav button.active { border-bottom-color: var(--accent); color: #d9dfeb; }
.code-preview__copy { padding: 6px 9px; border: 1px solid rgba(255,255,255,.1); border-radius: 7px; color: #9ba6ba; background: rgba(255,255,255,.03); font-size: .6rem; cursor: pointer; }
.code-preview pre { height: 430px; overflow: auto; margin: 0; padding: 25px; color: #bdc7d9; font-size: .72rem; line-height: 1.75; tab-size: 2; }.code-preview > footer { display: flex; min-height: 36px; padding: 0 15px; align-items: center; justify-content: flex-end; gap: 15px; border-top: 1px solid rgba(255,255,255,.07); color: #536078; background: rgba(255,255,255,.018); font-size: .55rem; }
@media (max-width: 520px) { .code-preview nav button { padding-inline: 7px; font-size: .54rem; }.code-preview pre { height: 380px; padding: 18px; font-size: .64rem; }.code-preview__copy { display: none; } }
`;var at={component:`import template from './profile-card.html';
import styles from './profile-card.css';

export default function register(app) {
  return app.component('profileCard', {
    props: { user: Object, onSave: Function },
    state: { editing: false },
    methods: {
      save: function () {
        this.$emit('onSave', this.user);
      }
    },
    template: template,
    styles: styles
  });
}`,template:`<article class="profile-card">
  <img ng-src="{{ vm.user.avatar }}" alt="">
  <h3>{{ vm.user.name }}</h3>
  <button ng-click="vm.save()">Salvar</button>
</article>`,app:`import registerProfile from './profile-card.component.js';

angular.module('myApp', ['ngEasyComponents']);

EasyComponents
  .use('myApp')
  .register(registerProfile);`};function w(t){return t.component("codePreview",{state:{active:"component",copied:!1},computed:{code:function(){return at[this.active]}},methods:{select:function(e){this.$setState({active:e,copied:!1})},copy:function(){var e=this;navigator.clipboard&&navigator.clipboard.writeText(e.code).then(function(){e.$setState({copied:!0}),window.setTimeout(function(){e.$setState({copied:!1})},1400)})}},template:ne,styles:se})}var de=`<section class="activity-feed">
  <header><div><span class="activity-feed__live"></span><strong>Event stream</strong></div><small>{{ vm.total }} recentes</small></header>
  <div class="activity-feed__list">
    <article ng-repeat="item in vm.items track by item.id" class="activity-feed__item activity-feed__item--{{ item.type }}">
      <span class="activity-feed__marker">{{ item.type === 'success' ? '✓' : item.type === 'theme' ? '◐' : item.type === 'event' ? '↗' : '·' }}</span>
      <div><strong>{{ item.title }}</strong><p>{{ item.detail }}</p></div>
      <code>#{{ $index + 1 }}</code>
    </article>
  </div>
</section>
`;var le=`.activity-feed { overflow: hidden; border: 1px solid rgba(255,255,255,.1); border-radius: 16px; background: rgba(8,12,22,.7); }
.activity-feed > header { display: flex; min-height: 48px; padding: 0 17px; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.08); }.activity-feed > header div { display: flex; align-items: center; gap: 9px; }.activity-feed > header strong { font-family: monospace; font-size: .7rem; }.activity-feed > header small { color: #69758c; font-size: .6rem; }
.activity-feed__live { width: 7px; height: 7px; border-radius: 50%; background: #43e7bc; box-shadow: 0 0 0 5px rgba(67,231,188,.08); }
.activity-feed__list { display: grid; min-height: 255px; padding: 10px; align-content: start; gap: 5px; }
.activity-feed__item { display: grid; padding: 10px; grid-template-columns: 30px 1fr auto; align-items: center; gap: 10px; border-radius: 10px; animation: activity-in .28s ease both; }.activity-feed__item:hover { background: rgba(255,255,255,.035); }
.activity-feed__marker { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 8px; color: #8b5cf6; background: rgba(139,92,246,.1); font-size: .7rem; }.activity-feed__item--success .activity-feed__marker { color: #43e7bc; background: rgba(67,231,188,.1); }.activity-feed__item--theme .activity-feed__marker { color: #22d3ee; background: rgba(34,211,238,.1); }
.activity-feed__item div { min-width: 0; }.activity-feed__item strong { display: block; color: #dce2ee; font-size: .72rem; }.activity-feed__item p { overflow: hidden; margin: 3px 0 0; color: #6e7a92; font-size: .63rem; text-overflow: ellipsis; white-space: nowrap; }.activity-feed__item code { color: #4f5b72; font-size: .55rem; }
@keyframes activity-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }
`;function k(t){return t.component("activityFeed",{props:{items:{type:Array,default:function(){return[]}}},computed:{total:function(){return this.items.length}},template:de,styles:le})}var ce=`<section class="ui-tabs">
  <nav class="ui-tabs__nav" role="tablist" aria-label="Categorias de componentes">
    <button ng-repeat="tab in vm.tabs track by tab.id" type="button" role="tab" ng-click="vm.select(tab)" ng-disabled="tab.disabled" ng-class="{ active: vm.active === tab.id }" aria-selected="{{ vm.active === tab.id }}">
      <span class="ui-tabs__icon">{{ tab.icon }}</span><span>{{ tab.label }}</span><small ng-if="tab.count">{{ tab.count }}</small>
    </button>
  </nav>
  <div class="ui-tabs__panel" role="tabpanel" ng-transclude></div>
</section>
`;var pe=`.ui-tabs { overflow: hidden; border: 1px solid rgba(255,255,255,.1); border-radius: 22px; background: #0d131f; box-shadow: 0 28px 80px rgba(0,0,0,.25); }
.ui-tabs__nav { display: flex; min-height: 68px; padding: 0 18px; align-items: stretch; gap: 4px; border-bottom: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.018); }
.ui-tabs__nav button { position: relative; display: flex; padding: 0 18px; align-items: center; gap: 8px; border: 0; color: #758199; background: transparent; font-size: .7rem; font-weight: 750; cursor: pointer; }.ui-tabs__nav button::after { position: absolute; height: 2px; right: 14px; bottom: 0; left: 14px; border-radius: 3px 3px 0 0; background: transparent; content: ""; }.ui-tabs__nav button:hover { color: #c8d0df; }.ui-tabs__nav button.active { color: #f0f3f8; }.ui-tabs__nav button.active::after { background: var(--accent); box-shadow: 0 -4px 18px var(--accent); }.ui-tabs__icon { color: var(--accent); font-family: monospace; }.ui-tabs__nav small { display: grid; min-width: 18px; height: 18px; padding-inline: 4px; place-items: center; border-radius: 6px; color: #98a4b9; background: rgba(255,255,255,.07); font-size: .52rem; }
.ui-tabs__panel { min-height: 640px; padding: 26px; }
@media (max-width: 700px) { .ui-tabs__nav { overflow-x: auto; padding-inline: 8px; }.ui-tabs__nav button { min-width: max-content; padding-inline: 13px; }.ui-tabs__panel { padding: 16px; } }
`;function z(t){return t.component("uiTabs",{props:{tabs:{type:Array,required:!0},active:{type:String,required:!0},onChange:Function},transclude:!0,methods:{select:function(e){e.disabled||this.$emit("onChange",e.id)}},template:ce,styles:pe})}var me=`<button type="button" class="ui-button ui-button--{{ vm.variant }} ui-button--{{ vm.size }}" ng-click="vm.click()" ng-disabled="vm.disabled">
  <span class="ui-button__icon" ng-if="vm.icon" aria-hidden="true">{{ vm.icon }}</span>
  <span>{{ vm.label }}</span>
</button>
`;var ue=`.ui-button { display: inline-flex; min-height: 40px; padding: 0 15px; align-items: center; justify-content: center; gap: 8px; border: 1px solid transparent; border-radius: 9px; color: #e9edf6; background: rgba(255,255,255,.06); font-size: .72rem; font-weight: 750; cursor: pointer; transition: transform .15s, background .15s, border-color .15s; }
.ui-button:hover:not(:disabled) { transform: translateY(-2px); }.ui-button:disabled { cursor: not-allowed; opacity: .4; }
.ui-button--primary { color: white; background: linear-gradient(135deg, var(--accent), var(--accent-strong)); }.ui-button--secondary { border-color: rgba(255,255,255,.13); background: rgba(255,255,255,.045); }.ui-button--success { color: #06130f; background: #43e7bc; }.ui-button--danger { color: #fff; background: #e85d75; }.ui-button--ghost { color: #9aa7bd; background: transparent; }
.ui-button--small { min-height: 32px; padding-inline: 11px; font-size: .62rem; }.ui-button--large { min-height: 48px; padding-inline: 20px; font-size: .82rem; }.ui-button__icon { font-size: 1.05em; }
`;function C(t){return t.component("uiButton",{props:{label:{type:String,binding:"@",required:!0},variant:{type:String,binding:"@",default:"primary"},size:{type:String,binding:"@",default:"medium"},icon:{type:String,binding:"@"},disabled:{type:Boolean,default:!1},onClick:Function},methods:{click:function(){this.disabled||this.$emit("onClick",{label:this.label,variant:this.variant})}},template:me,styles:ue})}var ge=`<span class="ui-badge ui-badge--{{ vm.variant }}"><i ng-if="vm.dot"></i>{{ vm.label }}</span>
`;var be=`.ui-badge { display: inline-flex; min-height: 22px; padding: 3px 8px; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,.1); border-radius: 99px; color: #aab4c8; background: rgba(255,255,255,.045); font-size: .56rem; font-weight: 800; letter-spacing: .02em; white-space: nowrap; }
.ui-badge i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }.ui-badge--primary { border-color: rgba(139,92,246,.25); color: #bca7ff; background: rgba(139,92,246,.1); }.ui-badge--success { border-color: rgba(67,231,188,.2); color: #69e7c4; background: rgba(67,231,188,.08); }.ui-badge--warning { border-color: rgba(251,184,102,.2); color: #ffc67f; background: rgba(251,184,102,.08); }.ui-badge--danger { border-color: rgba(232,93,117,.2); color: #ff91a4; background: rgba(232,93,117,.08); }.ui-badge--info { border-color: rgba(34,211,238,.2); color: #78e6f6; background: rgba(34,211,238,.08); }
`;function S(t){return t.component("uiBadge",{props:{label:{type:String,binding:"@",required:!0},variant:{type:String,binding:"@",default:"neutral"},dot:{type:Boolean,default:!1}},template:ge,styles:be})}var fe=`<aside class="ui-alert ui-alert--{{ vm.variant }}" ng-if="vm.visible" role="status">
  <span class="ui-alert__icon">{{ vm.icon }}</span>
  <div><strong>{{ vm.title }}</strong><p>{{ vm.message }}</p></div>
  <button ng-if="vm.dismissible" type="button" ng-click="vm.dismiss()" aria-label="Fechar alerta">×</button>
</aside>
`;var he=`.ui-alert { --alert-color: #22d3ee; display: grid; min-height: 68px; padding: 13px 15px; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; border: 1px solid color-mix(in srgb, var(--alert-color) 24%, transparent); border-radius: 11px; background: color-mix(in srgb, var(--alert-color) 7%, transparent); }
.ui-alert--success { --alert-color: #43e7bc; }.ui-alert--warning { --alert-color: #ffb866; }.ui-alert--danger { --alert-color: #e85d75; }.ui-alert__icon { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 8px; color: #081018; background: var(--alert-color); font-size: .72rem; font-weight: 900; }.ui-alert strong { color: #e7ebf4; font-size: .7rem; }.ui-alert p { margin: 3px 0 0; color: #7f8ba2; font-size: .62rem; line-height: 1.45; }.ui-alert button { align-self: start; border: 0; color: #7d889e; background: transparent; font-size: 1rem; cursor: pointer; }
`;function A(t){return t.component("uiAlert",{props:{title:{type:String,binding:"@",required:!0},message:{type:String,binding:"@",required:!0},variant:{type:String,binding:"@",default:"info"},dismissible:{type:Boolean,default:!1}},state:{visible:!0},computed:{icon:function(){return{success:"✓",warning:"!",danger:"×",info:"i"}[this.variant]||"i"}},methods:{dismiss:function(){this.$setState({visible:!1})}},template:fe,styles:he})}var ve=`<label class="ui-select">
  <span ng-if="vm.label">{{ vm.label }}</span>
  <span class="ui-select__control">
    <select ng-model="vm.value" ng-change="vm.changed()" ng-options="option.value as option.label for option in vm.options">
      <option value="">{{ vm.placeholder }}</option>
    </select>
    <i aria-hidden="true">⌄</i>
  </span>
</label>
`;var xe=`.ui-select { display: grid; min-width: 150px; gap: 6px; }.ui-select > span:first-child:not(.ui-select__control) { color: #8591a8; font-size: .62rem; font-weight: 700; }.ui-select__control { position: relative; display: block; }.ui-select select { width: 100%; min-height: 38px; padding: 0 34px 0 11px; appearance: none; border: 1px solid rgba(255,255,255,.1); border-radius: 9px; outline: 0; color: #ccd4e2; background: #141c2a; font-size: .68rem; cursor: pointer; }.ui-select select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }.ui-select option { color: #dce2ed; background: #141c2a; }.ui-select__control i { position: absolute; top: 50%; right: 12px; color: #728098; font-style: normal; pointer-events: none; transform: translateY(-55%); }
`;function P(t){return t.component("uiSelect",{props:{label:{type:String,binding:"@"},options:{type:Array,required:!0},value:{type:String},placeholder:{type:String,binding:"@",default:"Selecione"},onChange:Function},methods:{changed:function(){this.$emit("onChange",this.value)}},template:ve,styles:xe})}var ye=`<nav class="ui-pagination" aria-label="Paginacao">
  <button type="button" ng-click="vm.go(vm.page - 1)" ng-disabled="vm.page === 1" aria-label="Pagina anterior">‹</button>
  <button ng-repeat="number in vm.pages track by number" type="button" ng-click="vm.go(number)" ng-class="{ active: vm.page === number }" aria-current="{{ vm.page === number ? 'page' : undefined }}">{{ number }}</button>
  <button type="button" ng-click="vm.go(vm.page + 1)" ng-disabled="vm.page === vm.total" aria-label="Proxima pagina">›</button>
</nav>
`;var _e=`.ui-pagination { display: flex; gap: 4px; }.ui-pagination button { display: grid; width: 31px; height: 31px; padding: 0; place-items: center; border: 1px solid rgba(255,255,255,.09); border-radius: 8px; color: #8490a7; background: rgba(255,255,255,.025); font-size: .64rem; cursor: pointer; }.ui-pagination button:hover:not(:disabled) { color: white; border-color: rgba(255,255,255,.18); }.ui-pagination button.active { border-color: var(--accent); color: white; background: var(--accent-strong); }.ui-pagination button:disabled { opacity: .3; cursor: not-allowed; }
`;function $(t){return t.component("uiPagination",{props:{page:{type:Number,default:1},total:{type:Number,default:1},onChange:Function},computed:{pages:function(){for(var e=[],a=1;a<=this.total;a+=1)e.push(a);return e}},methods:{go:function(e){e>=1&&e<=this.total&&e!==this.page&&this.$emit("onChange",e)}},template:ye,styles:_e})}var we=`<section class="data-table">
  <header class="data-table__toolbar">
    <label class="data-table__search"><span aria-hidden="true">⌕</span><input type="search" ng-model="vm.query" ng-change="vm.search()" placeholder="Buscar projeto ou responsavel" aria-label="Buscar na tabela"></label>
    <ui-select options="vm.statusOptions" value="vm.status" on-change="vm.setStatus($event)"></ui-select>
    <ui-button label="Exportar" icon="↓" variant="secondary" size="small"></ui-button>
  </header>

  <div class="data-table__scroll">
    <table>
      <thead><tr>
        <th><button type="button" ng-click="vm.sort('id')">ID <span>↕</span></button></th>
        <th><button type="button" ng-click="vm.sort('name')">Projeto <span>↕</span></button></th>
        <th>Responsavel</th><th>Status</th>
        <th><button type="button" ng-click="vm.sort('value')">Valor <span>↕</span></button></th>
        <th>Atualizado</th><th><span class="sr-only">Acoes</span></th>
      </tr></thead>
      <tbody>
        <tr ng-repeat="row in vm.visibleRows track by row.id">
          <td><code>{{ row.id }}</code></td>
          <td><strong>{{ row.name }}</strong></td>
          <td><span class="data-table__owner"><i>{{ row.initials }}</i>{{ row.owner }}</span></td>
          <td><ui-badge label="{{ vm.statusLabel(row.status) }}" variant="{{ vm.statusVariant(row.status) }}" dot="true"></ui-badge></td>
          <td><strong>{{ row.value | currency:'R$ ':0 }}</strong></td>
          <td><span class="data-table__date">{{ row.date }}</span></td>
          <td><button class="data-table__more" type="button" aria-label="Acoes para {{ row.name }}">•••</button></td>
        </tr>
        <tr ng-if="!vm.visibleRows.length"><td colspan="7" class="data-table__empty">Nenhum registro encontrado.</td></tr>
      </tbody>
    </table>
  </div>

  <footer><span>Mostrando {{ vm.visibleRows.length }} de {{ vm.filteredRows.length }} registros</span><ui-pagination page="vm.page" total="vm.pageCount" on-change="vm.setPage($event)"></ui-pagination></footer>
</section>
`;var ke=`.data-table { overflow: hidden; border: 1px solid rgba(255,255,255,.085); border-radius: 15px; background: #101722; }
.data-table__toolbar { display: flex; min-height: 68px; padding: 13px 15px; align-items: center; gap: 9px; border-bottom: 1px solid rgba(255,255,255,.075); }.data-table__search { position: relative; display: block; min-width: 230px; margin-right: auto; }.data-table__search span { position: absolute; top: 50%; left: 12px; color: #68758d; transform: translateY(-50%); }.data-table__search input { width: 100%; min-height: 38px; padding: 0 12px 0 34px; border: 1px solid rgba(255,255,255,.1); border-radius: 9px; outline: 0; color: #d8dfeb; background: #141c2a; font-size: .67rem; }.data-table__search input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }.data-table__search input::placeholder { color: #59667d; }
.data-table__scroll { overflow-x: auto; }.data-table table { width: 100%; min-width: 880px; border-collapse: collapse; }.data-table th { height: 42px; padding: 0 15px; color: #657289; background: rgba(255,255,255,.018); font-size: .56rem; font-weight: 800; letter-spacing: .04em; text-align: left; text-transform: uppercase; }.data-table th button { padding: 0; border: 0; color: inherit; background: transparent; font: inherit; cursor: pointer; }.data-table th button span { color: #465269; }.data-table td { height: 65px; padding: 0 15px; border-top: 1px solid rgba(255,255,255,.06); color: #9ca7ba; font-size: .66rem; }.data-table tbody tr:hover { background: rgba(255,255,255,.022); }.data-table td code { color: var(--accent); font-size: .61rem; }.data-table td > strong { color: #dce2ec; font-weight: 700; }.data-table__owner { display: flex; align-items: center; gap: 8px; white-space: nowrap; }.data-table__owner i { display: grid; width: 27px; height: 27px; place-items: center; border-radius: 8px; color: #c9d0dd; background: linear-gradient(145deg, #293449, #1b2434); font-size: .55rem; font-style: normal; font-weight: 800; }.data-table__date { white-space: nowrap; }.data-table__more { border: 0; color: #67748b; background: transparent; cursor: pointer; }.data-table__empty { padding: 50px !important; text-align: center; }
.data-table > footer { display: flex; min-height: 60px; padding: 0 15px; align-items: center; justify-content: space-between; gap: 18px; border-top: 1px solid rgba(255,255,255,.075); color: #68748b; font-size: .61rem; }.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
@media (max-width: 720px) { .data-table__toolbar { align-items: stretch; flex-direction: column; }.data-table__search { width: 100%; min-width: 0; }.data-table > footer { padding-block: 13px; align-items: flex-start; flex-direction: column; } }
`;var xt=[{id:"EC-1048",name:"Dashboard financeiro",owner:"Ana Lima",initials:"AL",status:"active",date:"10 out 2026",value:18400},{id:"EC-1047",name:"Portal de clientes",owner:"Carlos Melo",initials:"CM",status:"pending",date:"09 out 2026",value:12750},{id:"EC-1046",name:"Painel operacional",owner:"Joao Reis",initials:"JR",status:"active",date:"08 out 2026",value:9600},{id:"EC-1045",name:"Catalogo interno",owner:"Bianca Luz",initials:"BL",status:"inactive",date:"07 out 2026",value:7200},{id:"EC-1044",name:"Central de suporte",owner:"Marina Alves",initials:"MA",status:"active",date:"06 out 2026",value:15300},{id:"EC-1043",name:"Gestao de contratos",owner:"Rafael Dias",initials:"RD",status:"pending",date:"05 out 2026",value:11800},{id:"EC-1042",name:"Relatorios executivos",owner:"Luiza Costa",initials:"LC",status:"active",date:"04 out 2026",value:22100},{id:"EC-1041",name:"Onboarding digital",owner:"Pedro Nunes",initials:"PN",status:"inactive",date:"03 out 2026",value:6400}];function j(t){return t.component("recordsTable",{state:{rows:xt,query:"",status:"all",page:1,perPage:4,sortKey:"id",sortDirection:"desc",statusOptions:[{value:"all",label:"Todos os status"},{value:"active",label:"Ativos"},{value:"pending",label:"Pendentes"},{value:"inactive",label:"Inativos"}]},computed:{filteredRows:function(){var e=this.query.toLowerCase(),a=this.status,r=this.sortKey,o=this.sortDirection==="asc"?1:-1;return this.rows.filter(function(i){var n=!e||(i.id+i.name+i.owner).toLowerCase().indexOf(e)!==-1,d=a==="all"||i.status===a;return n&&d}).sort(function(i,n){return i[r]<n[r]?-1*o:i[r]>n[r]?1*o:0})},pageCount:function(){return Math.max(1,Math.ceil(this.filteredRows.length/this.perPage))},visibleRows:function(){var e=(this.page-1)*this.perPage;return this.filteredRows.slice(e,e+this.perPage)}},methods:{setStatus:function(e){this.$setState({status:e||"all",page:1})},setPage:function(e){this.$setState({page:e})},search:function(){this.$setState({page:1})},sort:function(e){this.$setState({sortKey:e,sortDirection:this.sortKey===e&&this.sortDirection==="asc"?"desc":"asc"})},statusLabel:function(e){return{active:"Ativo",pending:"Pendente",inactive:"Inativo"}[e]},statusVariant:function(e){return{active:"success",pending:"warning",inactive:"neutral"}[e]}},template:we,styles:ke})}var ze=`<article class="stat-card">
  <header><span>{{ vm.label }}</span><i>{{ vm.icon }}</i></header>
  <strong>{{ vm.value }}</strong>
  <footer ng-if="vm.change"><span class="stat-card__trend stat-card__trend--{{ vm.trend }}">{{ vm.trend === 'up' ? '↗' : '↘' }} {{ vm.change }}</span><small>vs. mes anterior</small></footer>
</article>
`;var Ce=`.stat-card { min-height: 150px; padding: 18px; border: 1px solid rgba(255,255,255,.085); border-radius: 14px; background: linear-gradient(145deg, rgba(255,255,255,.035), rgba(255,255,255,.012)); }.stat-card header { display: flex; align-items: center; justify-content: space-between; color: #77849a; font-size: .64rem; }.stat-card header i { display: grid; width: 29px; height: 29px; place-items: center; border-radius: 8px; color: var(--accent); background: var(--accent-soft); font-size: .65rem; font-style: normal; }.stat-card > strong { display: block; margin-top: 20px; color: #f1f4f9; font-size: 1.75rem; letter-spacing: -.05em; }.stat-card footer { display: flex; margin-top: 8px; align-items: center; gap: 8px; }.stat-card__trend { color: #43e7bc; font-size: .62rem; font-weight: 800; }.stat-card__trend--down { color: #ff8da1; }.stat-card footer small { color: #59667d; font-size: .55rem; }
`;function E(t){return t.component("statCard",{props:{label:{type:String,binding:"@",required:!0},value:{type:String,binding:"@",required:!0},change:{type:String,binding:"@"},trend:{type:String,binding:"@",default:"up"},icon:{type:String,binding:"@",default:"◆"}},template:ze,styles:Ce})}var Se=`<article class="product-card">
  <div class="product-card__visual product-card__visual--{{ vm.product.color }}"><span>{{ vm.product.icon }}</span><ui-badge label="{{ vm.product.tag }}" variant="{{ vm.product.badge }}"></ui-badge></div>
  <div class="product-card__body"><span>{{ vm.product.category }}</span><h3>{{ vm.product.name }}</h3><p>{{ vm.product.description }}</p></div>
  <footer><div><small>a partir de</small><strong>{{ vm.product.price | currency:'R$ ':0 }}</strong></div><ui-button label="Detalhes" variant="secondary" size="small" on-click="vm.select()"></ui-button></footer>
</article>
`;var Ae=`.product-card { overflow: hidden; border: 1px solid rgba(255,255,255,.085); border-radius: 15px; background: #111824; }.product-card__visual { position: relative; display: grid; height: 125px; place-items: center; background: radial-gradient(circle, rgba(139,92,246,.28), rgba(139,92,246,.06)); }.product-card__visual--cyan { background: radial-gradient(circle, rgba(34,211,238,.24), rgba(34,211,238,.05)); }.product-card__visual--orange { background: radial-gradient(circle, rgba(251,146,60,.25), rgba(251,146,60,.05)); }.product-card__visual > span { font-family: Georgia, serif; font-size: 2.8rem; }.product-card__visual ui-badge { position: absolute; top: 11px; right: 11px; }.product-card__body { padding: 17px 17px 12px; }.product-card__body > span { color: var(--accent); font-size: .54rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }.product-card h3 { margin: 7px 0; font-size: .92rem; }.product-card p { height: 34px; overflow: hidden; margin: 0; color: #748097; font-size: .62rem; line-height: 1.5; }.product-card footer { display: flex; padding: 12px 17px 16px; align-items: flex-end; justify-content: space-between; gap: 12px; }.product-card footer div { display: flex; flex-direction: column; }.product-card footer small { color: #5e6a80; font-size: .52rem; }.product-card footer strong { margin-top: 2px; font-size: .9rem; }
`;function T(t){return t.component("productCard",{props:{product:{type:Object,required:!0},onSelect:Function},methods:{select:function(){this.$emit("onSelect",this.product)}},template:Se,styles:Ae})}var Pe=`<section class="user-list">
  <header><div><strong>Equipe do projeto</strong><small>{{ vm.onlineCount }} online agora</small></div><button type="button" aria-label="Adicionar pessoa">+</button></header>
  <ul><li ng-repeat="user in vm.users track by user.email">
    <span class="user-list__avatar user-list__avatar--{{ user.color }}">{{ user.initials }}<i ng-if="user.online"></i></span>
    <div><strong>{{ user.name }}</strong><small>{{ user.email }}</small></div>
    <ui-badge label="{{ user.role }}" variant="{{ user.role === 'Admin' ? 'primary' : 'neutral' }}"></ui-badge>
    <button class="user-list__more" type="button" aria-label="Acoes para {{ user.name }}">•••</button>
  </li></ul>
</section>
`;var $e=`.user-list { overflow: hidden; border: 1px solid rgba(255,255,255,.085); border-radius: 15px; background: #111824; }.user-list > header { display: flex; min-height: 65px; padding: 0 17px; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.07); }.user-list > header div { display: flex; flex-direction: column; gap: 3px; }.user-list > header strong { font-size: .78rem; }.user-list > header small { color: #6c7890; font-size: .57rem; }.user-list > header button { display: grid; width: 29px; height: 29px; place-items: center; border: 1px solid rgba(255,255,255,.11); border-radius: 8px; color: var(--accent); background: rgba(255,255,255,.03); cursor: pointer; }.user-list ul { margin: 0; padding: 7px; list-style: none; }.user-list li { display: grid; min-height: 57px; padding: 7px 10px; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 10px; border-radius: 10px; }.user-list li:hover { background: rgba(255,255,255,.025); }.user-list__avatar { position: relative; display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; color: #d8dfee; background: #313b50; font-size: .58rem; font-weight: 850; }.user-list__avatar--violet { background: #493779; }.user-list__avatar--cyan { background: #174f5c; }.user-list__avatar--orange { background: #674023; }.user-list__avatar--green { background: #1e5547; }.user-list__avatar i { position: absolute; width: 8px; height: 8px; right: -2px; bottom: -2px; border: 2px solid #111824; border-radius: 50%; background: #43e7bc; }.user-list li > div { display: flex; min-width: 0; flex-direction: column; gap: 2px; }.user-list li > div strong { font-size: .69rem; }.user-list li > div small { overflow: hidden; color: #647087; font-size: .56rem; text-overflow: ellipsis; }.user-list__more { border: 0; color: #59667d; background: transparent; cursor: pointer; }
`;function M(t){return t.component("userList",{props:{users:{type:Array,required:!0}},computed:{onlineCount:function(){return this.users.filter(function(e){return e.online}).length}},template:Pe,styles:$e})}var je=`<section class="accordion-list">
  <article ng-repeat="item in vm.items track by item.id" ng-class="{ open: vm.openId === item.id }">
    <button type="button" ng-click="vm.toggle(item.id)" aria-expanded="{{ vm.openId === item.id }}"><span>{{ item.title }}</span><i>{{ vm.openId === item.id ? '−' : '+' }}</i></button>
    <div ng-if="vm.openId === item.id"><p>{{ item.text }}</p></div>
  </article>
</section>
`;var Ee=`.accordion-list { overflow: hidden; border: 1px solid rgba(255,255,255,.085); border-radius: 15px; background: #111824; }.accordion-list article + article { border-top: 1px solid rgba(255,255,255,.07); }.accordion-list article > button { display: flex; width: 100%; min-height: 58px; padding: 0 17px; align-items: center; justify-content: space-between; gap: 18px; border: 0; color: #cbd3e1; background: transparent; font-size: .7rem; font-weight: 750; text-align: left; cursor: pointer; }.accordion-list article > button:hover { background: rgba(255,255,255,.02); }.accordion-list article.open > button { color: white; }.accordion-list article > button i { display: grid; flex: 0 0 auto; width: 24px; height: 24px; place-items: center; border-radius: 7px; color: var(--accent); background: var(--accent-soft); font-style: normal; }.accordion-list article > div { padding: 0 48px 16px 17px; }.accordion-list p { margin: 0; color: #77839a; font-size: .65rem; line-height: 1.65; }
`;function q(t){return t.component("accordionList",{state:{openId:1,items:[{id:1,title:"Componentes funcionam com servicos AngularJS?",text:"Sim. A definicao final continua sendo um componente AngularJS nativo e pode usar injecao e recursos existentes."},{id:2,title:"Posso aninhar componentes?",text:"Sim. Props descem para os filhos e eventos retornam ao pai usando o fluxo normal do AngularJS."},{id:3,title:"Os estilos geram novas requisicoes?",text:"Nao no build demonstrado. HTML e CSS sao importados como texto e incorporados ao bundle."},{id:4,title:"O mount precisa ser chamado?",text:"Nao. O primeiro registro agenda um bootstrap automatico, depois que todos os componentes sincronicos foram registrados."}]},methods:{toggle:function(e){this.$setState({openId:this.openId===e?null:e})}},template:je,styles:Ee})}var Te=`<form class="demo-form" ng-submit="vm.submit()" novalidate>
  <header><div><span>FORMULARIO REATIVO</span><h3>Criar acesso ao projeto</h3></div><ui-badge label="AngularJS form" variant="info"></ui-badge></header>
  <ui-alert ng-if="vm.submitted" title="Cadastro pronto" message="O formulario foi validado e o estado atualizado com sucesso." variant="success" dismissible="true"></ui-alert>
  <div class="demo-form__grid">
    <label><span>Nome completo</span><input type="text" ng-model="vm.name" placeholder="Ex.: Marina Alves" required><small>Minimo de 2 caracteres</small></label>
    <label><span>E-mail profissional</span><input type="email" ng-model="vm.email" placeholder="nome@empresa.com" required><small>Usado somente nesta demonstracao</small></label>
  </div>
  <ui-select label="Area principal" options="vm.roleOptions" value="vm.role" on-change="vm.setRole($event)"></ui-select>
  <fieldset><legend>Plano preferido</legend><label><input type="radio" ng-model="vm.plan" value="solo"><span><strong>Individual</strong><small>Para projetos pessoais</small></span></label><label><input type="radio" ng-model="vm.plan" value="team"><span><strong>Equipe</strong><small>Colaboracao completa</small></span></label><label><input type="radio" ng-model="vm.plan" value="company"><span><strong>Empresa</strong><small>Controle avancado</small></span></label></fieldset>
  <label class="demo-form__check"><input type="checkbox" ng-model="vm.updates"><i>✓</i><span>Quero receber novidades da biblioteca de componentes.</span></label>
  <footer><span ng-class="{ ready: vm.valid }"><i></i>{{ vm.valid ? 'Formulario valido' : 'Preencha nome e e-mail' }}</span><button type="submit" ng-disabled="!vm.valid">Criar demonstracao <b>→</b></button></footer>
</form>
`;var Me=`.demo-form { display: grid; max-width: 760px; margin: 0 auto; gap: 20px; }.demo-form > header { display: flex; align-items: center; justify-content: space-between; gap: 18px; }.demo-form > header div { display: flex; flex-direction: column; gap: 5px; }.demo-form > header span { color: var(--accent); font-size: .54rem; font-weight: 850; letter-spacing: .13em; }.demo-form h3 { margin: 0; font-size: 1.1rem; }.demo-form__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }.demo-form label:not(.demo-form__check) { display: grid; gap: 6px; color: #8591a8; font-size: .62rem; font-weight: 700; }.demo-form input[type="text"], .demo-form input[type="email"] { min-height: 42px; padding: 0 12px; border: 1px solid rgba(255,255,255,.1); border-radius: 9px; outline: 0; color: #dbe1ec; background: #141c2a; font-size: .7rem; }.demo-form input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }.demo-form input::placeholder { color: #536078; }.demo-form label small { color: #58647a; font-size: .54rem; font-weight: 400; }.demo-form fieldset { display: grid; margin: 0; padding: 0; grid-template-columns: repeat(3, 1fr); gap: 8px; border: 0; }.demo-form legend { margin-bottom: 8px; color: #8591a8; font-size: .62rem; font-weight: 700; }.demo-form fieldset label { display: flex !important; min-height: 65px; padding: 11px; align-items: flex-start; grid-template-columns: auto 1fr; border: 1px solid rgba(255,255,255,.08); border-radius: 10px; background: rgba(255,255,255,.018); cursor: pointer; }.demo-form fieldset input { accent-color: var(--accent); }.demo-form fieldset label > span { display: flex; flex-direction: column; gap: 3px; }.demo-form fieldset strong { color: #cfd6e3; font-size: .65rem; }.demo-form__check { display: flex; align-items: center; gap: 9px; color: #7e8aa1; font-size: .62rem; cursor: pointer; }.demo-form__check input { position: absolute; opacity: 0; }.demo-form__check i { display: grid; width: 19px; height: 19px; place-items: center; border: 1px solid rgba(255,255,255,.15); border-radius: 5px; color: transparent; font-size: .55rem; font-style: normal; }.demo-form__check input:checked + i { border-color: var(--accent); color: white; background: var(--accent-strong); }.demo-form > footer { display: flex; padding-top: 16px; align-items: center; justify-content: space-between; gap: 15px; border-top: 1px solid rgba(255,255,255,.07); }.demo-form > footer > span { display: flex; align-items: center; gap: 7px; color: #69758b; font-size: .59rem; }.demo-form > footer > span i { width: 6px; height: 6px; border-radius: 50%; background: #69758b; }.demo-form > footer > span.ready { color: #63dcb9; }.demo-form > footer > span.ready i { background: #43e7bc; }.demo-form > footer button { min-height: 40px; padding: 0 15px; border: 0; border-radius: 9px; color: white; background: linear-gradient(135deg, var(--accent), var(--accent-strong)); font-size: .68rem; font-weight: 800; cursor: pointer; }.demo-form > footer button:disabled { cursor: not-allowed; opacity: .35; }.demo-form > footer b { margin-left: 8px; }
@media (max-width: 600px) { .demo-form__grid, .demo-form fieldset { grid-template-columns: 1fr; }.demo-form > footer { align-items: stretch; flex-direction: column; }.demo-form > footer button { width: 100%; } }
`;function O(t){return t.component("demoForm",{state:{name:"",email:"",role:"developer",plan:"team",updates:!0,submitted:!1,roleOptions:[{value:"developer",label:"Desenvolvimento"},{value:"designer",label:"Design de produto"},{value:"manager",label:"Gestao de projeto"}]},computed:{valid:function(){return this.name.length>=2&&this.email.indexOf("@")>0}},methods:{setRole:function(e){this.$setState({role:e})},submit:function(){this.valid&&this.$setState({submitted:!0})}},template:Te,styles:Me})}var qe=`<div class="ui-modal" ng-if="vm.open" role="dialog" aria-modal="true" aria-label="{{ vm.title }}">
  <button class="ui-modal__backdrop" type="button" ng-click="vm.close()" aria-label="Fechar modal"></button>
  <section class="ui-modal__dialog">
    <header><div><span>COMPONENTE MODAL</span><h3>{{ vm.title }}</h3></div><button type="button" ng-click="vm.close()" aria-label="Fechar">×</button></header>
    <div class="ui-modal__body" ng-transclude></div>
    <footer><ui-button label="Cancelar" variant="ghost" on-click="vm.close()"></ui-button><ui-button label="Confirmar" icon="✓" on-click="vm.confirm()"></ui-button></footer>
  </section>
</div>
`;var Oe=`.ui-modal { position: fixed; z-index: 80; display: grid; inset: 0; padding: 20px; place-items: center; }.ui-modal__backdrop { position: absolute; inset: 0; border: 0; background: rgba(2,5,11,.76); backdrop-filter: blur(5px); cursor: default; }.ui-modal__dialog { position: relative; width: min(450px, 100%); overflow: hidden; border: 1px solid rgba(255,255,255,.14); border-radius: 18px; background: #111824; box-shadow: 0 40px 120px rgba(0,0,0,.6); animation: modal-in .2s ease both; }.ui-modal__dialog > header { display: flex; min-height: 76px; padding: 0 20px; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.08); }.ui-modal__dialog > header div { display: flex; flex-direction: column; gap: 4px; }.ui-modal__dialog > header span { color: var(--accent); font-size: .54rem; font-weight: 850; letter-spacing: .12em; }.ui-modal__dialog h3 { margin: 0; font-size: 1.05rem; }.ui-modal__dialog > header > button { border: 0; color: #7d899f; background: transparent; font-size: 1.2rem; cursor: pointer; }.ui-modal__body { padding: 22px 20px; color: #8995aa; font-size: .72rem; line-height: 1.7; }.ui-modal__dialog > footer { display: flex; padding: 14px 20px; justify-content: flex-end; gap: 8px; border-top: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.12); }@keyframes modal-in { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
`;function D(t){return t.component("uiModal",{props:{open:{type:Boolean,default:!1},title:{type:String,binding:"@",default:"Confirmar acao"},onClose:Function,onConfirm:Function},transclude:!0,methods:{close:function(){this.$emit("onClose")},confirm:function(){this.$emit("onConfirm")}},template:qe,styles:Oe})}var De=`<div class="component-showcase">
  <header class="component-showcase__summary">
    <div><span class="component-showcase__dot"></span><strong>24 componentes registrados</strong><small>Todos usando a mesma API declarativa</small></div>
    <code>&lt;component-showcase&gt;</code>
  </header>

  <ui-tabs tabs="vm.tabs" active="vm.activeTab" on-change="vm.changeTab($event)">
    <div ng-switch="vm.activeTab">
      <section class="showcase-panel" ng-switch-when="base">
        <div class="showcase-heading"><div><span>01 · ELEMENTOS</span><h3>Botoes, badges, alertas e selects</h3></div><code>{{ vm.lastAction }}</code></div>

        <div class="showcase-group"><header><strong>Botoes</strong><small>5 variantes · 3 tamanhos · estados</small></header>
          <div class="showcase-row"><ui-button label="Primario" icon="→" on-click="vm.handleAction($event)"></ui-button><ui-button label="Secundario" variant="secondary" on-click="vm.handleAction($event)"></ui-button><ui-button label="Sucesso" icon="✓" variant="success" on-click="vm.handleAction($event)"></ui-button><ui-button label="Perigo" variant="danger" on-click="vm.handleAction($event)"></ui-button><ui-button label="Ghost" variant="ghost" on-click="vm.handleAction($event)"></ui-button><ui-button label="Desabilitado" disabled="true"></ui-button></div>
          <div class="showcase-row"><ui-button label="Pequeno" size="small"></ui-button><ui-button label="Medio" variant="secondary"></ui-button><ui-button label="Grande" size="large" icon="◇"></ui-button></div>
        </div>

        <div class="showcase-columns">
          <div class="showcase-group"><header><strong>Badges e status</strong><small>Semantica visual reutilizavel</small></header><div class="showcase-row"><ui-badge label="Padrao"></ui-badge><ui-badge label="Primary" variant="primary" dot="true"></ui-badge><ui-badge label="Sucesso" variant="success" dot="true"></ui-badge><ui-badge label="Atencao" variant="warning"></ui-badge><ui-badge label="Erro" variant="danger"></ui-badge><ui-badge label="Info" variant="info"></ui-badge></div></div>
          <div class="showcase-group"><header><strong>Selects</strong><small>Binding e callback on-change</small></header><div class="showcase-selects"><ui-select label="Tamanho" options="[{ value: 'sm', label: 'Pequeno' }, { value: 'md', label: 'Medio' }, { value: 'lg', label: 'Grande' }]" value="'md'"></ui-select><ui-select label="Estado" options="[{ value: 'ready', label: 'Pronto' }, { value: 'review', label: 'Em revisao' }]" value="'ready'"></ui-select></div></div>
        </div>

        <div class="showcase-alerts"><ui-alert title="Operacao concluida" message="O componente foi atualizado e todos os bindings estao sincronizados." variant="success" dismissible="true"></ui-alert><ui-alert title="Revise esta configuracao" message="Esta e uma mensagem de atencao com acao para dispensar." variant="warning" dismissible="true"></ui-alert><ui-alert title="Informacao do sistema" message="Alertas tambem podem ser persistentes e informativos." variant="info"></ui-alert></div>
      </section>

      <section class="showcase-panel" ng-switch-when="data">
        <div class="showcase-heading"><div><span>02 · DADOS</span><h3>Metricas e tabela interativa</h3></div><code>tabela → select → badge → pagination</code></div>
        <div class="showcase-stats"><stat-card label="Receita mensal" value="R$ 84,2 mil" change="12,4%" icon="$"></stat-card><stat-card label="Projetos ativos" value="128" change="8,1%" icon="▦"></stat-card><stat-card label="Tempo medio" value="1,8s" change="4,2%" trend="down" icon="◷"></stat-card><stat-card label="Satisfacao" value="96%" change="2,7%" icon="☆"></stat-card></div>
        <records-table></records-table>
      </section>

      <section class="showcase-panel" ng-switch-when="cards">
        <div class="showcase-heading"><div><span>03 · CONTEUDO</span><h3>Cards, listas e accordion</h3></div><code>componentes reutilizados dentro de componentes</code></div>
        <div class="showcase-products"><product-card ng-repeat="product in vm.products track by product.id" product="product" on-select="vm.selectProduct($event)"></product-card></div>
        <div class="showcase-columns showcase-columns--content"><user-list users="vm.users"></user-list><accordion-list></accordion-list></div>
      </section>

      <section class="showcase-panel" ng-switch-when="forms">
        <div class="showcase-heading"><div><span>04 · ENTRADA</span><h3>Formulario, validacao e modal</h3></div><ui-button label="Abrir modal" icon="↗" variant="secondary" size="small" on-click="vm.openModal()"></ui-button></div>
        <demo-form></demo-form>
      </section>
    </div>
  </ui-tabs>

  <ui-modal open="vm.modalOpen" title="{{ vm.selectedProduct ? vm.selectedProduct.name : 'Componente reutilizavel' }}" on-close="vm.closeModal()" on-confirm="vm.confirmModal()">
    <p ng-if="vm.selectedProduct">Voce selecionou <strong>{{ vm.selectedProduct.name }}</strong>, no valor de {{ vm.selectedProduct.price | currency:'R$ ':0 }}. O card enviou o produto por evento e o componente pai abriu este modal.</p>
    <p ng-if="!vm.selectedProduct">Este modal e um componente independente com props, eventos, transclusao, backdrop e estados acessiveis.</p>
  </ui-modal>
</div>
`;var Re=`.component-showcase__summary { display: flex; max-width: 760px; min-height: 48px; margin: 0 auto 18px; padding: 0 15px; align-items: center; justify-content: space-between; gap: 16px; border: 1px solid rgba(255,255,255,.09); border-radius: 12px; background: rgba(255,255,255,.02); }.component-showcase__summary > div { display: flex; align-items: center; gap: 8px; }.component-showcase__summary strong { font-size: .67rem; }.component-showcase__summary small { color: #657188; font-size: .57rem; }.component-showcase__summary code { color: var(--accent); font-size: .59rem; }.component-showcase__dot { width: 6px; height: 6px; border-radius: 50%; background: #43e7bc; box-shadow: 0 0 0 5px rgba(67,231,188,.08); }
.showcase-panel { animation: showcase-in .22s ease both; }.showcase-heading { display: flex; min-height: 62px; margin-bottom: 20px; align-items: center; justify-content: space-between; gap: 20px; }.showcase-heading > div { display: flex; flex-direction: column; gap: 5px; }.showcase-heading > div > span { color: var(--accent); font-size: .55rem; font-weight: 850; letter-spacing: .14em; }.showcase-heading h3 { margin: 0; font-size: 1.2rem; }.showcase-heading > code { max-width: 46%; overflow: hidden; padding: 7px 9px; border-radius: 7px; color: #748198; background: rgba(255,255,255,.035); font-size: .56rem; text-overflow: ellipsis; white-space: nowrap; }
.showcase-group { padding: 18px; border: 1px solid rgba(255,255,255,.075); border-radius: 13px; background: rgba(255,255,255,.015); }.showcase-group > header { display: flex; margin-bottom: 16px; align-items: center; justify-content: space-between; gap: 15px; }.showcase-group > header strong { font-size: .72rem; }.showcase-group > header small { color: #5f6b81; font-size: .55rem; }.showcase-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }.showcase-row + .showcase-row { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.06); }.showcase-columns { display: grid; margin-top: 12px; grid-template-columns: 1fr 1fr; gap: 12px; }.showcase-selects { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }.showcase-alerts { display: grid; margin-top: 12px; grid-template-columns: repeat(3, 1fr); gap: 9px; }
.showcase-stats { display: grid; margin-bottom: 12px; grid-template-columns: repeat(4, 1fr); gap: 9px; }.showcase-products { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }.showcase-columns--content { margin-top: 12px; align-items: start; }
@keyframes showcase-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
@media (max-width: 900px) { .showcase-stats { grid-template-columns: repeat(2, 1fr); }.showcase-alerts { grid-template-columns: 1fr; }.showcase-products { grid-template-columns: 1fr 1fr; }.showcase-products product-card:last-child { grid-column: 1 / -1; } }
@media (max-width: 650px) { .component-showcase__summary small, .component-showcase__summary code { display: none; }.showcase-heading { align-items: flex-start; flex-direction: column; }.showcase-heading > code { max-width: 100%; }.showcase-columns, .showcase-products { grid-template-columns: 1fr; }.showcase-products product-card:last-child { grid-column: auto; }.showcase-selects { grid-template-columns: 1fr; }.showcase-stats { grid-template-columns: 1fr 1fr; } }
@media (max-width: 420px) { .showcase-stats { grid-template-columns: 1fr; }.showcase-group > header { align-items: flex-start; flex-direction: column; } }
`;function R(t){return t.component("componentShowcase",{state:{activeTab:"base",modalOpen:!1,selectedProduct:null,lastAction:"Nenhuma acao executada",tabs:[{id:"base",label:"Elementos",icon:"◇",count:4},{id:"data",label:"Dados e tabela",icon:"▦",count:3},{id:"cards",label:"Cards e listas",icon:"▤",count:4},{id:"forms",label:"Formularios",icon:"⌁",count:3}],products:[{id:1,name:"Workspace Pro",category:"Produtividade",description:"Painel completo para equipes e projetos complexos.",price:89,icon:"W",tag:"Popular",badge:"primary",color:"violet"},{id:2,name:"Analytics Kit",category:"Dados",description:"Graficos, metricas e relatorios prontos para conectar.",price:64,icon:"A",tag:"Novo",badge:"info",color:"cyan"},{id:3,name:"Commerce UI",category:"E-commerce",description:"Componentes para catalogos e jornadas de compra.",price:72,icon:"C",tag:"Completo",badge:"warning",color:"orange"}],users:[{name:"Ana Lima",email:"ana@equipe.dev",initials:"AL",role:"Admin",online:!0,color:"violet"},{name:"Carlos Melo",email:"carlos@equipe.dev",initials:"CM",role:"Editor",online:!0,color:"cyan"},{name:"Bianca Luz",email:"bianca@equipe.dev",initials:"BL",role:"Viewer",online:!1,color:"orange"},{name:"Rafael Dias",email:"rafael@equipe.dev",initials:"RD",role:"Editor",online:!0,color:"green"}]},methods:{changeTab:function(e){this.$setState({activeTab:e})},handleAction:function(e){this.$setState({lastAction:"Botao "+e.label+" acionado"})},selectProduct:function(e){this.$setState({selectedProduct:e,modalOpen:!0})},openModal:function(){this.$setState({selectedProduct:null,modalOpen:!0})},closeModal:function(){this.$setState({modalOpen:!1})},confirmModal:function(){this.$setState({modalOpen:!1,lastAction:"Acao do modal confirmada"})}},template:De,styles:Re})}angular.module("demoApp",["ngEasyComponents"]);var qt=EasyComponents.use("demoApp");qt.register(g,b,f,h,v,x,y,_,w,k,z,C,S,A,P,$,j,E,T,M,q,O,D,R);})();
