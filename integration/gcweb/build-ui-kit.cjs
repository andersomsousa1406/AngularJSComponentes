'use strict';
const fs = require('node:fs');
const path = require('node:path');

// Usa o Rollup que ja faz parte das dependencias do Gulp/Vite do GCWeb.
module.exports = async function buildUiKit(options = {}) {
    const projectRoot = options.projectRoot || path.resolve(__dirname, '..');
    const sourceRoot = options.sourceRoot || path.join(projectRoot, 'resources/assets/js/helper/plugin/angular/ui-kit');
    const outfile = options.outfile || path.join(sourceRoot, 'dist/gcweb-ui.js');
    const { rollup } = require(require.resolve('rollup', { paths: [projectRoot] }));
    const bundle = await rollup({
        input: path.join(sourceRoot, 'gcweb.js'),
        plugins: [{
            name: 'embedded-templates-and-styles',
            load(id) {
                if (/\.(html|css)$/.test(id)) return 'export default ' + JSON.stringify(fs.readFileSync(id, 'utf8')) + ';';
            }
        }]
    });
    try {
        const result = await bundle.generate({ format: 'iife' });
        const runtime = fs.readFileSync(options.runtime || path.join(sourceRoot, 'angularjs-easy-components.js'), 'utf8');
        const source = '(function () {\n"use strict";\n' +
            'if (window.GCWebUI && window.GCWebUI.angular === window.angular) return;\n' +
            runtime + '\n' + result.output[0].code + '\n})();\n';
        fs.mkdirSync(path.dirname(outfile), { recursive: true });
        fs.writeFileSync(outfile, source);
        console.log('GCWeb UI: 27 componentes, templates e estilos embutidos (' + Buffer.byteLength(source) + ' bytes).');
        return outfile;
    } finally {
        if (bundle.close) await bundle.close();
    }
};
