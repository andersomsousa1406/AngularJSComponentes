'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const target = path.resolve(process.argv[2] || 'C:/Projetos/GCWeb');
const masterPath = path.join(target, 'gulp/Helper/master.js');
const gulpPath = path.join(target, 'gulpfile.cjs');
const kitPath = path.join(target, 'resources/assets/js/helper/plugin/angular/ui-kit');
let master = fs.readFileSync(masterPath, 'utf8');
let gulp = fs.readFileSync(gulpPath, 'utf8');
const anchor = "'helper/plugin/angular/functions.js',";
if ((master.match(/'helper\/plugin\/angular\/functions\.js',/g) || []).length !== 4) {
    throw new Error('Esperados quatro bundles globais com angular/functions.js; revisar integracao.');
}
if (!master.includes('ui-kit/dist/gcweb-ui.js')) {
    const eol = master.includes('\r\n') ? '\r\n' : '\n';
    master = '// Build dos componentes antes da concatenacao dos bundles globais.' + eol +
        "if (['master', 'master_portal', 'master_pdv', 'master_pdv_b5'].some(name => mix.validarTela(jsPathPublic + '/' + name + '.js'))) {" + eol +
        "    mix.uiKit();" + eol + '}' + eol + eol +
        master.split(anchor).join(anchor + eol + "            'helper/plugin/angular/ui-kit/dist/gcweb-ui.js',");
}
master = master.replace("mix.queue.push(() => require('../../scripts/build-ui-kit.cjs')());", 'mix.uiKit();');
if (!gulp.includes("elixir.extend('uiKit'")) {
    gulp = gulp.replace("elixir.extend('validarTela'", "elixir.extend('uiKit', function () {\r\n" +
        "    this.queue.push(() => require('./scripts/build-ui-kit.cjs')());\r\n" +
        "    return this;\r\n});\r\n\r\nelixir.extend('validarTela'");
}
if (!gulp.includes("gulp.task('ui-kit'")) {
    gulp += "\r\n// Compila apenas a biblioteca intermediaria, sem publicar os bundles globais.\r\n" +
        "gulp.task('ui-kit', function () { return require('./scripts/build-ui-kit.cjs')(); });\r\n";
}
// O build deve sinalizar falhas ao Gulp, inclusive falhas ao gerar a biblioteca.
gulp = gulp.replace(/(\.catch\(err => \{\s*console\.error\('[^']*Erro no build', err\);)(\s*\}\);)/,
    '$1\r\n\t\t\t\t\treject(err);$2');
gulp = gulp.replace(/(gulp\.task\('default',[\s\S]*?\.catch\(err => \{\s*)done\(\);/, '$1done(err || new Error("Falha no build do GCWeb"));');
// Validacoes acima ocorrem antes de qualquer alteracao no destino.
fs.mkdirSync(kitPath, { recursive: true });
for (const dir of ['components', 'services']) {
    fs.cpSync(path.join(root, 'ui-kit', dir), path.join(kitPath, dir), { recursive: true });
}
for (const file of ['index.js', 'gcweb.js', 'README.md']) {
    fs.copyFileSync(path.join(root, 'ui-kit', file), path.join(kitPath, file));
}
// O README instalado aponta para a documentacao local da integracao.
const readmePath = path.join(kitPath, 'README.md');
fs.writeFileSync(readmePath, fs.readFileSync(readmePath, 'utf8').replace('[integration/gcweb/README.md](../integration/gcweb/README.md)', '[GULP.md](GULP.md)'));
fs.copyFileSync(path.join(root, 'src/angularjs-easy-components.js'), path.join(kitPath, 'angularjs-easy-components.js'));
fs.mkdirSync(path.join(target, 'scripts'), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'build-ui-kit.cjs'), path.join(target, 'scripts/build-ui-kit.cjs'));
fs.copyFileSync(path.join(__dirname, 'README.md'), path.join(kitPath, 'GULP.md'));
fs.writeFileSync(path.join(kitPath, '.gitignore'), 'dist/\n');
fs.writeFileSync(masterPath, master);
fs.writeFileSync(gulpPath, gulp);
console.log('Integracao instalada em ' + target);
