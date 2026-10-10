'use strict';

var vscode = require('vscode');
var navigation = require('./navigation');

var EXCLUDE_PATTERN = '{**/node_modules/**,**/AngularJS184/**,**/.git/**}';
var EASY_API_NAMES = [
  'app',
  'component',
  'define',
  'easyComponent',
  'mount',
  'register',
  'toAngularComponent',
  'use',
  '$emit',
  '$setState'
];

async function findComponentLocations(componentName) {
  var configuration = vscode.workspace.getConfiguration('easyComponents.navigation');
  var filePattern = configuration.get('filePattern', '**/*.component.{js,ts,mjs}');
  var files = await vscode.workspace.findFiles(filePattern, EXCLUDE_PATTERN);
  var locations = [];

  await Promise.all(files.map(async function (uri) {
    var document = await vscode.workspace.openTextDocument(uri);
    var offset = navigation.componentDefinitionOffset(document.getText(), componentName);
    if (offset !== -1) {
      locations.push(new vscode.Location(uri, document.positionAt(offset)));
    }
  }));

  return locations;
}

async function findApiLocation(apiName) {
  var files = await vscode.workspace.findFiles(
    '**/src/angularjs-easy-components.js',
    EXCLUDE_PATTERN,
    5
  );

  for (var index = 0; index < files.length; index += 1) {
    var document = await vscode.workspace.openTextDocument(files[index]);
    var offset = navigation.apiDefinitionOffset(document.getText(), apiName);
    if (offset !== -1) {
      return new vscode.Location(files[index], document.positionAt(offset));
    }
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
  var files = await vscode.workspace.findFiles('**/*.component.{js,ts,mjs}', EXCLUDE_PATTERN);

  for (var index = 0; index < files.length; index += 1) {
    var document = await vscode.workspace.openTextDocument(files[index]);
    var offset = navigation.exportedRegistrationOffset(document.getText(), registrationName);
    if (offset !== -1) {
      return new vscode.Location(files[index], document.positionAt(offset));
    }
  }
  return null;
}

async function findRegistrationImports(registrationName) {
  var files = await vscode.workspace.findFiles('**/*.{js,ts,mjs}', EXCLUDE_PATTERN);
  var locations = [];

  await Promise.all(files.map(async function (uri) {
    var document = await vscode.workspace.openTextDocument(uri);
    var offset = navigation.importedRegistrationOffset(document.getText(), registrationName);
    if (offset !== -1) {
      locations.push(new vscode.Location(uri, document.positionAt(offset)));
    }
  }));
  return locations;
}

function activate(context) {
  var selector = [
    { language: 'html', scheme: 'file' },
    { language: 'html', scheme: 'untitled' }
  ];

  var provider = vscode.languages.registerDefinitionProvider(selector, {
    provideDefinition: async function (document, position) {
      var offset = document.offsetAt(position);
      var tag = navigation.tagAtOffset(document.getText(), offset);
      if (!tag || tag.name.indexOf('-') === -1) return null;

      var locations = await findComponentLocations(navigation.kebabToCamel(tag.name));
      return locations.length ? locations : null;
    }
  });

  context.subscriptions.push(provider);

  var scriptSelector = [
    { language: 'javascript', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'typescript', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'file' }
  ];

  var scriptProvider = vscode.languages.registerDefinitionProvider(scriptSelector, {
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
      if (/^register[A-Z]/.test(apiName)) {
        return findExportedRegistration(apiName);
      }
      if (EASY_API_NAMES.indexOf(apiName) === -1) return null;

      var linePrefix = document.lineAt(position.line).text.slice(0, range.start.character);
      if (!/\.\s*$/.test(linePrefix)) return null;

      return findApiLocation(apiName);
    }
  });

  context.subscriptions.push(scriptProvider);
}

function deactivate() {}

module.exports = {
  activate: activate,
  deactivate: deactivate
};
