'use strict';

var fs = require('fs');
var path = require('path');

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function toKebab(value) {
  return String(value || '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toPascal(value) {
  return toKebab(value).replace(/(^|-)([a-z0-9])/g, function (_, __, character) {
    return character.toUpperCase();
  });
}

function isValidName(value) {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);
}

function inside(root, target) {
  var relative = path.relative(root, target);
  return relative === '' || (relative.indexOf('..' + path.sep) !== 0 && !path.isAbsolute(relative));
}

function resolveInside(root, configuredPath, label) {
  var target = path.resolve(root, configuredPath);
  if (!inside(root, target)) {
    throw new Error(label + ' precisa ficar dentro do projeto: ' + configuredPath);
  }
  return target;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function loadConfig(projectRoot) {
  var root = path.resolve(projectRoot || process.cwd());
  var packagePath = path.join(root, 'package.json');
  var packageJson = fs.existsSync(packagePath) ? readJson(packagePath) : {};
  var input = packageJson.easyComponents || {};
  var componentsDir = input.componentsDir || 'src/components';
  var buildInput = input.build || {};

  return {
    root: root,
    packagePath: packagePath,
    componentsDir: resolveInside(root, componentsDir, 'componentsDir'),
    registry: resolveInside(root, input.registry || path.join(componentsDir, 'index.generated.js'), 'registry'),
    customData: resolveInside(root, input.customData || 'html-custom-data.json', 'customData'),
    build: {
      entry: resolveInside(root, buildInput.entry || 'src/app.js', 'build.entry'),
      outfile: resolveInside(root, buildInput.outfile || 'dist/app.bundle.js', 'build.outfile'),
      report: resolveInside(root, buildInput.report || 'dist/easy-components-report.json', 'build.report'),
      target: buildInput.target || ['es2017'],
      minify: buildInput.minify !== false,
      sourcemap: buildInput.sourcemap !== false,
      budgets: buildInput.budgets || {}
    }
  };
}

function walk(directory, result) {
  if (!fs.existsSync(directory)) return result;
  fs.readdirSync(directory, { withFileTypes: true }).forEach(function (entry) {
    var fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, result);
    } else if (/\.component\.(?:js|mjs|ts)$/.test(entry.name) && entry.name.indexOf('.generated.') === -1) {
      result.push(fullPath);
    }
  });
  return result;
}

function discoverComponents(config) {
  return walk(config.componentsDir, []).sort().map(function (filePath) {
    return inspectComponent(config, filePath);
  });
}

function skipQuoted(source, index) {
  var quote = source[index];
  var cursor = index + 1;
  while (cursor < source.length) {
    if (source[cursor] === '\\') {
      cursor += 2;
    } else if (source[cursor] === quote) {
      return cursor + 1;
    } else {
      cursor += 1;
    }
  }
  return cursor;
}

function skipComment(source, index) {
  if (source[index + 1] === '/') {
    var lineEnd = source.indexOf('\n', index + 2);
    return lineEnd === -1 ? source.length : lineEnd + 1;
  }
  if (source[index + 1] === '*') {
    var blockEnd = source.indexOf('*/', index + 2);
    return blockEnd === -1 ? source.length : blockEnd + 2;
  }
  return index;
}

function matchingBrace(source, start) {
  var depth = 0;
  for (var index = start; index < source.length; index += 1) {
    var character = source[index];
    if (character === '\'' || character === '"' || character === '`') {
      index = skipQuoted(source, index) - 1;
      continue;
    }
    if (character === '/' && (source[index + 1] === '/' || source[index + 1] === '*')) {
      index = skipComment(source, index) - 1;
      continue;
    }
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function definitionMatch(source) {
  var modern = /export\s+default\s+EasyComponents\.defineComponent\s*\(\s*(['"])([^'"]+)\1\s*,/.exec(source);
  if (modern) return modern;

  var legacyPattern = /return\s+[a-zA-Z_$][\w$]*\.component\s*\(\s*(['"])([^'"]+)\1\s*,/g;
  var legacy;
  var current;
  while ((current = legacyPattern.exec(source))) legacy = current;
  return legacy || null;
}

function topLevelKeys(objectSource) {
  var keys = [];
  var depth = 0;
  var expectingKey = true;

  for (var index = 1; index < objectSource.length - 1; index += 1) {
    var character = objectSource[index];
    if (character === '\'' || character === '"' || character === '`') {
      index = skipQuoted(objectSource, index) - 1;
      continue;
    }
    if (character === '/' && (objectSource[index + 1] === '/' || objectSource[index + 1] === '*')) {
      index = skipComment(objectSource, index) - 1;
      continue;
    }
    if (character === '{' || character === '[' || character === '(') {
      depth += 1;
      continue;
    }
    if (character === '}' || character === ']' || character === ')') {
      depth -= 1;
      continue;
    }
    if (depth === 0 && character === ',') {
      expectingKey = true;
      continue;
    }
    if (depth === 0 && expectingKey && /[a-zA-Z_$]/.test(character)) {
      var rest = objectSource.slice(index);
      var keyMatch = /^([a-zA-Z_$][\w$]*)\s*:/.exec(rest);
      if (keyMatch) {
        keys.push(keyMatch[1]);
        index += keyMatch[0].length - 1;
        expectingKey = false;
      }
    }
  }
  return keys;
}

function extractProps(definitionSource) {
  var match = /\bprops\s*:\s*{/.exec(definitionSource);
  if (!match) return [];
  var start = match.index + match[0].lastIndexOf('{');
  var end = matchingBrace(definitionSource, start);
  if (end === -1) return [];
  return topLevelKeys(definitionSource.slice(start, end + 1));
}

function inspectComponent(config, filePath) {
  var source = fs.readFileSync(filePath, 'utf8');
  var match = definitionMatch(source);
  var name = match && match[2];
  var definitionSource = '';

  if (match) {
    var objectStart = source.indexOf('{', match.index + match[0].length);
    var objectEnd = objectStart === -1 ? -1 : matchingBrace(source, objectStart);
    if (objectEnd !== -1) definitionSource = source.slice(objectStart, objectEnd + 1);
  }

  return {
    filePath: filePath,
    relativePath: toPosix(path.relative(config.root, filePath)),
    name: name || null,
    selector: name ? toKebab(name) : null,
    props: extractProps(definitionSource),
    source: source
  };
}

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function registrySource(config, components) {
  var registryDirectory = path.dirname(config.registry);
  var lines = [
    '// Gerado por easy-components sync. Nao edite manualmente.',
    ''
  ];
  components.forEach(function (component, index) {
    var importPath = toPosix(path.relative(registryDirectory, component.filePath));
    if (importPath.charAt(0) !== '.') importPath = './' + importPath;
    lines.push("import Component" + index + " from '" + importPath + "';");
  });
  lines.push('', 'var components = [');
  components.forEach(function (_, index) {
    lines.push('  Component' + index + (index === components.length - 1 ? '' : ','));
  });
  lines.push('];', '', 'export { components };', 'export default components;', '');
  return lines.join('\n');
}

function generateRegistry(config, components) {
  var discovered = components || discoverComponents(config);
  ensureDirectory(config.registry);
  fs.writeFileSync(config.registry, registrySource(config, discovered), 'utf8');
  return discovered;
}

function attributeDescription(name) {
  return /^on[A-Z_]|^on-/.test(name)
    ? 'Evento do componente. O valor fica disponivel em $event.'
    : 'Propriedade declarada pelo componente.';
}

function generateCustomData(config, components) {
  var discovered = components || discoverComponents(config);
  var previous = fs.existsSync(config.customData) ? readJson(config.customData) : { version: 1.1, tags: [] };
  var previousTags = {};
  (previous.tags || []).forEach(function (tag) { previousTags[tag.name] = tag; });

  var tags = discovered.filter(function (component) { return component.selector; }).map(function (component) {
    var existing = previousTags[component.selector] || {};
    var previousAttributes = {};
    (existing.attributes || []).forEach(function (attribute) { previousAttributes[attribute.name] = attribute; });
    var tag = {
      name: component.selector,
      description: existing.description || ('Componente ' + component.selector + '.')
    };
    var attributes = component.props.map(function (prop) {
      var name = toKebab(prop);
      return previousAttributes[name] || { name: name, description: attributeDescription(name) };
    });
    if (attributes.length) tag.attributes = attributes;
    return tag;
  });

  ensureDirectory(config.customData);
  fs.writeFileSync(config.customData, JSON.stringify({ version: 1.1, tags: tags }, null, 2) + '\n', 'utf8');
  return tags;
}

function checkProject(config, components) {
  var discovered = components || discoverComponents(config);
  var errors = [];
  var warnings = [];
  var selectors = {};

  if (!discovered.length) errors.push('Nenhum arquivo *.component.js, *.mjs ou *.ts foi encontrado.');

  discovered.forEach(function (component) {
    var directory = path.dirname(component.filePath);
    var baseName = path.basename(component.filePath).replace(/\.component\.(?:js|mjs|ts)$/, '');
    var htmlPath = path.join(directory, baseName + '.html');
    var cssPath = path.join(directory, baseName + '.css');

    if (!component.selector) {
      errors.push(component.relativePath + ': exporte defineComponent(...) ou retorne app.component(...).');
      return;
    }
    if (selectors[component.selector]) {
      errors.push('Seletor duplicado "' + component.selector + '": ' + selectors[component.selector] + ' e ' + component.relativePath + '.');
    } else {
      selectors[component.selector] = component.relativePath;
    }
    if (!fs.existsSync(htmlPath)) errors.push(component.relativePath + ': falta ' + baseName + '.html.');
    if (!fs.existsSync(cssPath)) errors.push(component.relativePath + ': falta ' + baseName + '.css.');
    if (component.selector !== baseName) {
      warnings.push(component.relativePath + ': a pasta/arquivo "' + baseName + '" difere do seletor "' + component.selector + '".');
    }
  });

  return { components: discovered, errors: errors, warnings: warnings };
}

function componentFiles(name) {
  var className = toPascal(name);
  return {
    component: [
      "import template from './" + name + ".html';",
      "import styles from './" + name + ".css';",
      '',
      "export default EasyComponents.defineComponent('" + name + "', {",
      '  props: {',
      "    title: EasyComponents.text('" + className + "')",
      '  },',
      '',
      '  state: function () {',
      '    return {};',
      '  },',
      '',
      '  methods: {},',
      '',
      '  template: template,',
      '  styles: styles',
      '});',
      ''
    ].join('\n'),
    html: [
      '<section class="' + name + '">',
      '  <h2>{{ vm.title }}</h2>',
      '</section>',
      ''
    ].join('\n'),
    css: [
      '.' + name + ' {',
      '  display: block;',
      '}',
      ''
    ].join('\n'),
    test: [
      "import Component from './" + name + ".component.js';",
      '',
      "describe('" + name + "', function () {",
      "  it('exporta o seletor correto', function () {",
      "    expect(Component.selector).toBe('" + name + "');",
      '  });',
      '});',
      ''
    ].join('\n')
  };
}

function createComponent(config, inputName) {
  var name = toKebab(inputName);
  if (!isValidName(name)) throw new Error('Nome de componente invalido: ' + inputName);
  var directory = path.join(config.componentsDir, name);
  if (!inside(config.componentsDir, directory)) throw new Error('Diretorio de componente invalido.');
  if (fs.existsSync(directory)) throw new Error('O componente ja existe: ' + name);

  var files = componentFiles(name);
  fs.mkdirSync(directory, { recursive: false });
  fs.writeFileSync(path.join(directory, name + '.component.js'), files.component, 'utf8');
  fs.writeFileSync(path.join(directory, name + '.html'), files.html, 'utf8');
  fs.writeFileSync(path.join(directory, name + '.css'), files.css, 'utf8');
  fs.writeFileSync(path.join(directory, name + '.test.js'), files.test, 'utf8');
  return { name: name, directory: directory };
}

module.exports = {
  toKebab: toKebab,
  loadConfig: loadConfig,
  discoverComponents: discoverComponents,
  inspectComponent: inspectComponent,
  registrySource: registrySource,
  generateRegistry: generateRegistry,
  generateCustomData: generateCustomData,
  checkProject: checkProject,
  createComponent: createComponent
};
