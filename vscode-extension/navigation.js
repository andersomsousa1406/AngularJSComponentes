'use strict';

function kebabToCamel(name) {
  return name.replace(/-([a-z0-9])/g, function (_, character) {
    return character.toUpperCase();
  });
}

function camelToKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tagAtOffset(text, offset) {
  var before = text.slice(0, offset);
  var opening = before.lastIndexOf('<');
  var closing = before.lastIndexOf('>');
  var match;
  var start;

  if (opening === -1 || opening < closing) return null;
  match = text.slice(opening).match(/^<\s*\/?\s*([a-zA-Z][\w-]*)/);
  if (!match) return null;

  start = opening + match[0].lastIndexOf(match[1]);
  if (offset < start || offset > start + match[1].length) return null;

  return {
    name: match[1],
    start: start,
    end: start + match[1].length
  };
}

function componentDefinitionOffset(source, componentName) {
  var names = [componentName, camelToKebab(componentName)];
  var patterns = ['\\.component', '\\bdefineComponent'];
  var nameIndex;
  var patternIndex;
  var expression;
  var match;

  for (nameIndex = 0; nameIndex < names.length; nameIndex += 1) {
    for (patternIndex = 0; patternIndex < patterns.length; patternIndex += 1) {
      expression = new RegExp(
        patterns[patternIndex] + '\\s*\\(\\s*(["\\\'])' + escapeRegExp(names[nameIndex]) + '\\1'
      );
      match = expression.exec(source);
      if (match) return match.index + match[0].lastIndexOf(names[nameIndex]);
    }
  }
  return -1;
}

function apiDefinitionOffset(source, apiName) {
  var escapedName = escapeRegExp(apiName);
  var patterns = [
    new RegExp(escapedName + '\\s*:\\s*function\\b'),
    new RegExp('(?:self|this)\\.' + escapedName + '\\s*=\\s*function\\b'),
    new RegExp(escapedName + '\\s*:\\s*[a-zA-Z_$][\\w$]*')
  ];
  var index;
  var match;

  for (index = 0; index < patterns.length; index += 1) {
    match = patterns[index].exec(source);
    if (match) return match.index + match[0].indexOf(apiName);
  }
  return -1;
}

function resourcePathAtOffset(source, offset) {
  var expressions = [
    /\b(templateUrl|styleUrl)\s*:\s*(['"])([^'"]+)\2/g,
    /\bimport\s+[$\w]+\s+from\s+(['"])([^'"]+\.(html|css))\1/g
  ];
  var expression;
  var match;
  var start;
  var end;
  var path;
  var kind;
  var index;

  for (index = 0; index < expressions.length; index += 1) {
    expression = expressions[index];
    while ((match = expression.exec(source))) {
      path = index === 0 ? match[3] : match[2];
      kind = index === 0 ? match[1] : (match[3] === 'html' ? 'templateImport' : 'styleImport');
      start = match.index + match[0].lastIndexOf(path);
      end = start + path.length;
      if (offset >= start && offset <= end) {
        return {
          kind: kind,
          path: path,
          start: start,
          end: end
        };
      }
    }
  }
  return null;
}

function registrationNameAtOffset(source, offset) {
  var expression = /\bexport\s+default\s+function\s+(register[A-Z][$\w]*)/g;
  var match;
  var start;

  while ((match = expression.exec(source))) {
    start = match.index + match[0].lastIndexOf(match[1]);
    if (offset >= start && offset <= start + match[1].length) return match[1];
  }
  return null;
}

function exportedRegistrationOffset(source, registrationName) {
  var expression = new RegExp(
    '\\bexport\\s+default\\s+function\\s+' + escapeRegExp(registrationName) + '\\b'
  );
  var match = expression.exec(source);
  if (!match) return -1;
  return match.index + match[0].lastIndexOf(registrationName);
}

function importedRegistrationOffset(source, registrationName) {
  var expression = new RegExp(
    '\\bimport\\s+' + escapeRegExp(registrationName) + '\\s+from\\s+["\\\']'
  );
  var match = expression.exec(source);
  if (!match) return -1;
  return match.index + match[0].indexOf(registrationName);
}

module.exports = {
  apiDefinitionOffset: apiDefinitionOffset,
  camelToKebab: camelToKebab,
  componentDefinitionOffset: componentDefinitionOffset,
  exportedRegistrationOffset: exportedRegistrationOffset,
  importedRegistrationOffset: importedRegistrationOffset,
  kebabToCamel: kebabToCamel,
  registrationNameAtOffset: registrationNameAtOffset,
  resourcePathAtOffset: resourcePathAtOffset,
  tagAtOffset: tagAtOffset
};
