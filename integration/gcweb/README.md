# Integracao com o Gulp do GCWeb

Os fontes do kit ficam em `resources/assets/js/helper/plugin/angular/ui-kit` no GCWeb. O script `scripts/build-ui-kit.cjs` usa o Rollup ja instalado pelo projeto para embutir os imports JavaScript, HTML e CSS. Nao requer o catalogo de demonstracao nem outro bootstrap AngularJS.

O `gulp/Helper/master.js` executa esse build antes dos quatro bundles globais e inclui o resultado depois de `angular/functions.js`. O modulo `gc-ui` e adicionado as dependencias de `gc-find`, disponibilizando os componentes e o servico `GToast` nas telas existentes.

Depois de alterar componentes, compile o bundle global utilizado pelo layout:

```powershell
npx gulp --master
# Outros layouts: --master_portal, --master_pdv, --master_pdv_b5
```

O build completo (`npx gulp`, ou `npx gulp --production`) tambem recompila o kit. A compilacao de uma tela isolada continua usando os bundles globais existentes. Para gerar somente o bundle intermediario: `npx gulp ui-kit`.

Exemplo dentro de uma tela com `ng-controller="Ctrl as vm"`:

```html
<g-button text="Salvar" color="primary" on-click="vm.salvar()"></g-button>
<g-toast></g-toast>
```

Os contratos completos estao no README copiado junto aos fontes do kit. Os componentes usam CSS proprio e recursos de navegadores atuais, incluindo `<dialog>`. Esta integracao disponibiliza os componentes novos; a migracao dos componentes antigos e um trabalho separado.

Para atualizar a copia do kit, copie `ui-kit/components`, `ui-kit/services`, `ui-kit/index.js`, `ui-kit/gcweb.js`, `ui-kit/README.md` e `src/angularjs-easy-components.js` deste repositorio para a pasta dos fontes no GCWeb, e compile o bundle global novamente. Nao edite `dist/gcweb-ui.js` nem os arquivos de `public/assets` manualmente.
