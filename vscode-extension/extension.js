'use strict';

var vscode = require('vscode');
var navigation = require('./navigation');
var semantic = require('./semantic');

var EXCLUDE_PATTERN = '{**/node_modules/**,**/AngularJS184/**,**/.git/**,**/dist/**}';
var EASY_API_NAMES = [
  'app', 'component', 'createApp', 'define', 'defineComponent', 'easyComponent',
  'mount', 'register', 'toAngularComponent', 'text', 'number', 'boolean',
  'object', 'array', 'event', 'required', 'metrics', 'configure', 'testing',
  'use', '$emit', '$setState'
];
var componentIndexPromise;

function configuration() {
  return vscode.workspace.getConfiguration('easyComponents.navigation');
}

function componentPattern() {
  return configuration().get('filePattern', '**/*.component.{js,ts,mjs}');
}

function invalidateIndex() {
  componentIndexPromise = null;
}

async function componentIndex() {
  if (!componentIndexPromise) {
    componentIndexPromise = (async function () {
      var files = await vscode.workspace.findFiles(componentPattern(), EXCLUDE_PATTERN);
      var components = await Promise.all(files.map(async function (uri) {
        var document = await vscode.workspace.openTextDocument(uri);
        return semantic.parseComponent(document.getText(), uri);
      }));
      return components.filter(Boolean);
    }());
  }
  return componentIndexPromise;
}

async function findComponent(componentName) {
  var normalized = semantic.camelToKebab(componentName);
  var components = await componentIndex();
  return components.filter(function (component) { return component.selector === normalized; })[0] || null;
}

async function findComponentLocations(componentName) {
  var component = await findComponent(componentName);
  if (!component) return [];
  var document = await vscode.workspace.openTextDocument(component.uri);
  return [new vscode.Location(component.uri, document.positionAt(component.nameStart))];
}

async function findApiLocation(apiName) {
  var files = await vscode.workspace.findFiles('**/src/angularjs-easy-components.js', EXCLUDE_PATTERN, 5);
  for (var index = 0; index < files.length; index += 1) {
    var document = await vscode.workspace.openTextDocument(files[index]);
    var offset = navigation.apiDefinitionOffset(document.getText(), apiName);
    if (offset !== -1) return new vscode.Location(files[index], document.positionAt(offset));
  }
  return null;
}

async function findResourceLocations(resourcePath, sourceUri) {
  if (/^\.\.?\//.test(resourcePath)) {
    var relativeUri = vscode.Uri.joinPath(sourceUri, '..', resourcePath);
    try {
      await vscode.workspace.fs.stat(relativeUri);
      return [new vscode.Location(relativeUri, new vscode.Position(0, 0))];
    } catch (_) {
      return [];
    }
  }
  var normalizedPath = resourcePath.replace(/\\/g, '/').replace(/^\.\//, '');
  var files = await vscode.workspace.findFiles('**/' + normalizedPath, EXCLUDE_PATTERN, 10);
  return files.map(function (uri) {
    return new vscode.Location(uri, new vscode.Position(0, 0));
  });
}

async function findExportedRegistration(registrationName) {
  var files = await vscode.workspace.findFiles(componentPattern(), EXCLUDE_PATTERN);
  for (var index = 0; index < files.length; index += 1) {
    var document = await vscode.workspace.openTextDocument(files[index]);
    var offset = navigation.exportedRegistrationOffset(document.getText(), registrationName);
    if (offset !== -1) return new vscode.Location(files[index], document.positionAt(offset));
  }
  return null;
}

async function findRegistrationImports(registrationName) {
  var files = await vscode.workspace.findFiles('**/*.{js,ts,mjs}', EXCLUDE_PATTERN);
  var locations = [];
  await Promise.all(files.map(async function (uri) {
    var document = await vscode.workspace.openTextDocument(uri);
    var offset = navigation.importedRegistrationOffset(document.getText(), registrationName);
    if (offset !== -1) locations.push(new vscode.Location(uri, document.positionAt(offset)));
  }));
  return locations;
}

function uriKey(uri) {
  return uri.fsPath.replace(/\\/g, '/').toLowerCase();
}

async function componentForTemplate(uri) {
  var key = uriKey(uri);
  var components = await componentIndex();
  return components.filter(function (component) {
    return component.templates.some(function (templatePath) {
      var normalizedTemplate = templatePath.replace(/\\/g, '/').toLowerCase();
      if (/^\.\.?\//.test(templatePath)) {
        return uriKey(vscode.Uri.joinPath(component.uri, '..', templatePath)) === key;
      }
      return key.slice(-normalizedTemplate.length) === normalizedTemplate;
    });
  })[0] || null;
}

function componentDetail(component) {
  return component.selector + ' — ' + component.props.length + ' props, ' + component.members.length + ' membros vm';
}

function propDetail(prop) {
  var detail = prop.attribute + ': ' + prop.type + ' (binding ' + prop.binding + ')';
  return prop.required ? detail + ' — obrigatoria' : detail + ' — opcional';
}

function completionKind(member) {
  if (member.kind === 'methods') return vscode.CompletionItemKind.Method;
  if (member.kind === 'computed') return vscode.CompletionItemKind.Property;
  if (member.kind === 'inject') return vscode.CompletionItemKind.Module;
  return vscode.CompletionItemKind.Field;
}

async function htmlCompletions(document, position) {
  var text = document.getText();
  var offset = document.offsetAt(position);
  var before = text.slice(Math.max(0, offset - 80), offset);

  if (/\bvm\.[a-zA-Z_$\w]*$/.test(before)) {
    var owner = await componentForTemplate(document.uri);
    if (!owner) return [];
    return owner.members.map(function (member) {
      var item = new vscode.CompletionItem(member.name, completionKind(member));
      item.detail = 'vm.' + member.name + ' — ' + member.kind;
      item.sortText = '0-' + member.name;
      return item;
    });
  }

  var tag = semantic.openingTagAtOffset(text, offset);
  if (tag) {
    var component = await findComponent(tag.name);
    if (component && offset > tag.nameEnd) {
      var existing = {};
      tag.attributes.forEach(function (attribute) { existing[attribute.name] = true; });
      return component.props.filter(function (prop) { return !existing[prop.attribute]; }).map(function (prop) {
        var item = new vscode.CompletionItem(prop.attribute, vscode.CompletionItemKind.Property);
        item.detail = propDetail(prop);
        item.insertText = new vscode.SnippetString(prop.attribute + '="$1"');
        item.sortText = (prop.required ? '0-' : '1-') + prop.attribute;
        return item;
      });
    }
  }

  var components = await componentIndex();
  return components.map(function (component) {
    var item = new vscode.CompletionItem(component.selector, vscode.CompletionItemKind.Class);
    item.detail = componentDetail(component);
    item.insertText = component.selector;
    return item;
  });
}

async function htmlHover(document, position) {
  var text = document.getText();
  var offset = document.offsetAt(position);
  var attributeContext = semantic.attributeAtOffset(text, offset);
  if (attributeContext) {
    var attributeComponent = await findComponent(attributeContext.tag.name);
    if (attributeComponent) {
      var prop = attributeComponent.props.filter(function (item) { return item.attribute === attributeContext.attribute.name; })[0];
      if (prop) {
        return new vscode.Hover(
          new vscode.MarkdownString('`' + propDetail(prop) + '`'),
          new vscode.Range(document.positionAt(attributeContext.attribute.nameStart), document.positionAt(attributeContext.attribute.nameEnd))
        );
      }
    }
  }

  var tag = navigation.tagAtOffset(text, offset);
  if (!tag) return null;
  var component = await findComponent(tag.name);
  if (!component) return null;
  var markdown = new vscode.MarkdownString();
  markdown.appendMarkdown('**`<' + component.selector + '>`**\n\n' + componentDetail(component));
  if (component.props.length) {
    markdown.appendMarkdown('\n\n' + component.props.map(function (prop) { return '- `' + propDetail(prop) + '`'; }).join('\n'));
  }
  return new vscode.Hover(markdown, new vscode.Range(document.positionAt(tag.start), document.positionAt(tag.end)));
}

function isAllowedAttribute(name) {
  return name === 'id' || name === 'class' || name === 'style' || name === 'role' || name === 'title' || /^(?:ng-|data-|aria-|x-)/.test(name);
}

async function diagnosticsFor(document) {
  var text = document.getText();
  var components = await componentIndex();
  var bySelector = {};
  components.forEach(function (component) { bySelector[component.selector] = component; });
  var diagnostics = [];

  semantic.openingTags(text).forEach(function (tag) {
    var component = bySelector[tag.name];
    if (!component) return;
    var byAttribute = {};
    component.props.forEach(function (prop) { byAttribute[prop.attribute] = prop; });
    var present = {};

    tag.attributes.forEach(function (attribute) {
      present[attribute.name] = true;
      var prop = byAttribute[attribute.name];
      var range = new vscode.Range(document.positionAt(attribute.nameStart), document.positionAt(attribute.nameEnd));
      if (!prop && !isAllowedAttribute(attribute.name)) {
        var unknown = new vscode.Diagnostic(range, 'A prop "' + attribute.name + '" nao existe em <' + tag.name + '>.', vscode.DiagnosticSeverity.Warning);
        unknown.source = 'Easy Components';
        diagnostics.push(unknown);
      } else if (prop && prop.binding === '&' && attribute.value === undefined) {
        var eventValue = new vscode.Diagnostic(range, 'O evento "' + attribute.name + '" precisa de uma expressao AngularJS.', vscode.DiagnosticSeverity.Warning);
        eventValue.source = 'Easy Components';
        diagnostics.push(eventValue);
      } else if (prop && prop.binding === '<' && /{{/.test(attribute.value || '')) {
        var expression = new vscode.Diagnostic(range, 'Use uma expressao sem {{ }} em props com binding unidirecional.', vscode.DiagnosticSeverity.Warning);
        expression.source = 'Easy Components';
        diagnostics.push(expression);
      }
    });

    component.props.filter(function (prop) { return prop.required && !present[prop.attribute]; }).forEach(function (prop) {
      var missingRange = new vscode.Range(document.positionAt(tag.nameStart), document.positionAt(tag.nameEnd));
      var missing = new vscode.Diagnostic(missingRange, 'A prop obrigatoria "' + prop.attribute + '" nao foi informada.', vscode.DiagnosticSeverity.Error);
      missing.source = 'Easy Components';
      diagnostics.push(missing);
    });
  });
  return diagnostics;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validSelector(value) {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);
}

async function renameContext(document, position) {
  var text = document.getText();
  var offset = document.offsetAt(position);
  var attribute = semantic.attributeAtOffset(text, offset);
  if (attribute) {
    var attributeComponent = await findComponent(attribute.tag.name);
    var prop = attributeComponent && attributeComponent.props.filter(function (item) { return item.attribute === attribute.attribute.name; })[0];
    if (prop) return { kind: 'prop', component: attributeComponent, prop: prop, start: attribute.attribute.nameStart, end: attribute.attribute.nameEnd };
  }
  var tag = navigation.tagAtOffset(text, offset);
  if (!tag) return null;
  var component = await findComponent(tag.name);
  return component ? { kind: 'component', component: component, start: tag.start, end: tag.end } : null;
}

async function renameEdits(rename, newName) {
  var edit = new vscode.WorkspaceEdit();
  var files = await vscode.workspace.findFiles('**/*.html', EXCLUDE_PATTERN);
  var normalizedName = semantic.camelToKebab(newName);
  if (!validSelector(normalizedName)) throw new Error('Use um nome HTML em kebab-case.');

  for (var index = 0; index < files.length; index += 1) {
    var document = await vscode.workspace.openTextDocument(files[index]);
    var text = document.getText();
    if (rename.kind === 'component') {
      semantic.openingTags(text).filter(function (tag) { return tag.name === rename.component.selector; }).forEach(function (tag) {
        edit.replace(files[index], new vscode.Range(document.positionAt(tag.nameStart), document.positionAt(tag.nameEnd)), normalizedName);
      });
      var closingPattern = new RegExp('<\\s*\\/\\s*(' + escapeRegExp(rename.component.selector) + ')\\b', 'g');
      var closing;
      while ((closing = closingPattern.exec(text))) {
        var start = closing.index + closing[0].lastIndexOf(closing[1]);
        edit.replace(files[index], new vscode.Range(document.positionAt(start), document.positionAt(start + closing[1].length)), normalizedName);
      }
    } else {
      semantic.openingTags(text).filter(function (tag) { return tag.name === rename.component.selector; }).forEach(function (tag) {
        tag.attributes.filter(function (attribute) { return attribute.name === rename.prop.attribute; }).forEach(function (attribute) {
          edit.replace(files[index], new vscode.Range(document.positionAt(attribute.nameStart), document.positionAt(attribute.nameEnd)), normalizedName);
        });
      });
    }
  }

  var sourceDocument = await vscode.workspace.openTextDocument(rename.component.uri);
  if (rename.kind === 'component') {
    edit.replace(rename.component.uri, new vscode.Range(sourceDocument.positionAt(rename.component.nameStart), sourceDocument.positionAt(rename.component.nameEnd)), normalizedName);
  } else {
    edit.replace(rename.component.uri, new vscode.Range(sourceDocument.positionAt(rename.prop.nameStart), sourceDocument.positionAt(rename.prop.nameEnd)), semantic.kebabToCamel(normalizedName));
  }
  return edit;
}

function activate(context) {
  var htmlSelector = [
    { language: 'html', scheme: 'file' },
    { language: 'html', scheme: 'untitled' }
  ];
  var scriptSelector = [
    { language: 'javascript', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'typescript', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'file' }
  ];

  context.subscriptions.push(vscode.languages.registerDefinitionProvider(htmlSelector, {
    provideDefinition: async function (document, position) {
      var tag = navigation.tagAtOffset(document.getText(), document.offsetAt(position));
      if (!tag || tag.name.indexOf('-') === -1) return null;
      var locations = await findComponentLocations(tag.name);
      return locations.length ? locations : null;
    }
  }));
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(htmlSelector, { provideCompletionItems: htmlCompletions }, '<', ' ', '-', '.'));
  context.subscriptions.push(vscode.languages.registerHoverProvider(htmlSelector, { provideHover: htmlHover }));
  context.subscriptions.push(vscode.languages.registerRenameProvider(htmlSelector, {
    prepareRename: async function (document, position) {
      var rename = await renameContext(document, position);
      return rename ? new vscode.Range(document.positionAt(rename.start), document.positionAt(rename.end)) : null;
    },
    provideRenameEdits: async function (document, position, newName) {
      var rename = await renameContext(document, position);
      return rename ? renameEdits(rename, newName) : null;
    }
  }));

  context.subscriptions.push(vscode.languages.registerDefinitionProvider(scriptSelector, {
    provideDefinition: async function (document, position) {
      var documentText = document.getText();
      var documentOffset = document.offsetAt(position);
      var resource = navigation.resourcePathAtOffset(documentText, documentOffset);
      if (resource) {
        var resources = await findResourceLocations(resource.path, document.uri);
        return resources.length ? resources : null;
      }
      var declaredRegistration = navigation.registrationNameAtOffset(documentText, documentOffset);
      if (declaredRegistration) {
        var imports = await findRegistrationImports(declaredRegistration);
        return imports.length ? imports : null;
      }
      var range = document.getWordRangeAtPosition(position, /[$a-zA-Z_][$\w]*/);
      if (!range) return null;
      var apiName = document.getText(range);
      if (/^register[A-Z]/.test(apiName)) return findExportedRegistration(apiName);
      if (EASY_API_NAMES.indexOf(apiName) === -1) return null;
      var linePrefix = document.lineAt(position.line).text.slice(0, range.start.character);
      if (!/\.\s*$/.test(linePrefix)) return null;
      return findApiLocation(apiName);
    }
  }));

  var diagnosticCollection = vscode.languages.createDiagnosticCollection('easy-components');
  context.subscriptions.push(diagnosticCollection);
  async function updateDiagnostics(document) {
    if (document.languageId === 'html') diagnosticCollection.set(document.uri, await diagnosticsFor(document));
  }
  vscode.workspace.textDocuments.forEach(updateDiagnostics);
  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(updateDiagnostics));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(function (event) { updateDiagnostics(event.document); }));
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(function (document) {
    if (/\.component\.(?:js|mjs|ts)$/.test(document.fileName)) invalidateIndex();
    updateDiagnostics(document);
  }));
  context.subscriptions.push(vscode.workspace.onDidCreateFiles(invalidateIndex));
  context.subscriptions.push(vscode.workspace.onDidDeleteFiles(invalidateIndex));
  context.subscriptions.push(vscode.workspace.onDidRenameFiles(invalidateIndex));
}

function deactivate() {}

module.exports = { activate: activate, deactivate: deactivate };
