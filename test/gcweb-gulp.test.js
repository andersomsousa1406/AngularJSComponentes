'use strict';
// Testa o artefato independente com o AngularJS do consumidor, inclusive minificado.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { execFile } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const consumer = path.resolve(process.argv[2] || 'C:/Projetos/GCWeb');
const out = path.join(root, 'test/artifacts/gcweb');
const browser = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
async function main() {
    assert(browser, 'Chrome/Edge necessario.');
    const build = require('../integration/gcweb/build-ui-kit.cjs');
    fs.mkdirSync(out, { recursive: true });
    const file = await build({ projectRoot: consumer, sourceRoot: path.join(root, 'ui-kit'), runtime: path.join(root, 'src/angularjs-easy-components.js'), outfile: path.join(out, 'library.js') });
    const uglify = require(require.resolve('uglify-js', { paths: [consumer] }));
    const result = uglify.minify(fs.readFileSync(file, 'utf8'));
    assert.ifError(result.error);
    fs.writeFileSync(path.join(out, 'library.min.js'), result.code);
    const master = fs.readFileSync(path.join(consumer, 'gulp/Helper/master.js'), 'utf8');
    assert.equal(master.split("'helper/plugin/angular/ui-kit/dist/gcweb-ui.js'").length - 1, 4);
    assert.equal(master.split("'helper/plugin/angular/functions.js',\n").length > 1 || master.includes("'helper/plugin/angular/functions.js',\r\n"), true);
    for (const name of ['library.js', 'library.min.js']) {
        const html = `<!doctype html><html><head><script src="${pathToFileURL(path.join(consumer, 'resources/assets/js/helper/plugin/angular/angular.min.js'))}"></script>
<script>angular.module('gc-find', []).value('legacySentinel', 123);</script>
<script src="${name}"></script><script src="${name}"></script></head><body>
<div id="app" ng-controller="Ctrl as vm"><g-button text="Salvar" on-click="vm.count = vm.count + 1"></g-button><g-toast></g-toast></div>
<pre id="result">PENDING</pre><script>
try {
 function check(value, label) { if (!value) throw Error(label); }
 check(!angular.element(document.getElementById('app')).injector(), 'bootstrap prematuro');
 check(GCWebUI.components.length === 27, '27 componentes');
 check(angular.module('gc-find').requires.filter(function(x) { return x === 'gc-ui'; }).length === 1, 'registro duplicado');
 angular.module('app', ['gc-find']).controller('Ctrl', function() { this.count = 0; });
 var injector = angular.bootstrap(document.getElementById('app'), ['app'], { strictDi: true });
 check(injector.get('legacySentinel') === 123, 'servico legado');
 GCWebUI.components.forEach(function(name) { check(injector.has(name.replace(/-([a-z])/g, function(_, c) { return c.toUpperCase(); }) + 'Directive'), name); });
 var button = document.querySelector('g-button button');
 check(button && button.textContent.indexOf('Salvar') !== -1, 'template embutido');
 button.click();
 check(angular.element(document.getElementById('app')).scope().vm.count === 1, 'callback');
 check(getComputedStyle(button).backgroundColor !== 'rgba(0, 0, 0, 0)', 'estilo embutido');
 injector.get('GToast').success('Teste'); injector.get('$rootScope').$digest();
 check(document.querySelector('g-toast').textContent.indexOf('Teste') !== -1, 'GToast');
 document.getElementById('result').textContent = 'PASS';
} catch(error) { document.getElementById('result').textContent = 'FAIL: ' + error.stack; }
</script></body></html>`;
        const fixture = path.join(out, name + '.html');
        fs.writeFileSync(fixture, html);
        const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'gcweb-ui-test-'));
        try {
            const stdout = await new Promise((resolve, reject) => execFile(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + profile, '--dump-dom', pathToFileURL(fixture).href], { windowsHide: true, timeout: 30000, maxBuffer: 2000000 }, (error, stdout) => error ? reject(error) : resolve(stdout)));
            const outcome = stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/);
            assert(outcome && outcome[1] === 'PASS', outcome ? outcome[1] : 'Browser nao executou fixture.');
            console.log(name + ': PASS (AngularJS real, strict DI, 27 registros, callback, CSS, toast, carga duplicada).');
        } finally {
            try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) { /* Chrome pode manter o perfil ocupado brevemente. */ }
        }
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
