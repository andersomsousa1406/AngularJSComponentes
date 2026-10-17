'use strict';

function kebabToCamel(name) {
  return name.replace(/-([a-z0-9])/g, function (_, character) { return character.toUpperCase(); });
}

function camelToKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function skipQuoted(source, index) {
  var quote = source[index];
  var cursor = index + 1;
  while (cursor < source.length) {
    if (source[cursor] === '\\') cursor += 2;
    else if (source[cursor] === quote) return cursor + 1;
    else cursor += 1;
  }
  return cursor;
}

function skipSpaceAndComments(source, index, limit) {
  var cursor = index;
  while (cursor < limit) {
    if (/\s/.test(source[cursor])) {
      cursor += 1;
    } else if (source.slice(cursor, cursor + 2) === '//') {
      cursor = source.indexOf('\n', cursor + 2);
      if (cursor === -1) return limit;
    } else if (source.slice(cursor, cursor + 2) === '/*') {
      cursor = source.indexOf('*/', cursor + 2);
      if (cursor === -1) return limit;
      cursor += 2;
    } else {
      break;
    }
  }
  return cursor;
}

function matching(source, start, opening, closing) {
  var depth = 0;
  for (var index = start; index < source.length; index += 1) {
    var character = source[index];
    if (character === '\'' || character === '"' || character === '`') {
      index = skipQuoted(source, index) - 1;
      continue;
    }
    if (source.slice(index, index + 2) === '//') {
      index = source.indexOf('\n', index + 2);
      if (index === -1) return -1;
      continue;
    }
    if (source.slice(index, index + 2) === '/*') {
      index = source.indexOf('*/', index + 2);
      if (index === -1) return -1;
      index += 1;
      continue;
    }
    if (character === opening) depth += 1;
    if (character === closing) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function objectEntries(source, objectStart) {
  if (objectStart < 0 || source[objectStart] !== '{') return [];
  var end = matching(source, objectStart, '{', '}');
  if (end === -1) return [];
  var entries = [];
  var cursor = objectStart + 1;

  while (cursor < end) {
    cursor = skipSpaceAndComments(source, cursor, end);
    if (source[cursor] === ',') {
      cursor += 1;
      continue;
    }
    var nameMatch = /^([a-zA-Z_$][\w$]*)\s*:/.exec(source.slice(cursor, end));
    if (!nameMatch) break;
    var name = nameMatch[1];
    var nameStart = cursor;
    var valueStart = cursor + nameMatch[0].length;
    var valueEnd = end;
    var braces = 0;
    var brackets = 0;
    var parentheses = 0;

    for (var index = valueStart; index < end; index += 1) {
      var character = source[index];
      if (character === '\'' || character === '"' || character === '`') {
        index = skipQuoted(source, index) - 1;
        continue;
      }
      if (source.slice(index, index + 2) === '//') {
        index = source.indexOf('\n', index + 2);
        if (index === -1) index = end;
        continue;
      }
      if (source.slice(index, index + 2) === '/*') {
        index = source.indexOf('*/', index + 2);
        if (index === -1) index = end;
        else index += 1;
        continue;
      }
      if (character === '{') braces += 1;
      else if (character === '}') braces -= 1;
      else if (character === '[') brackets += 1;
      else if (character === ']') brackets -= 1;
      else if (character === '(') parentheses += 1;
      else if (character === ')') parentheses -= 1;
      else if (character === ',' && braces === 0 && brackets === 0 && parentheses === 0) {
        valueEnd = index;
        break;
      }
    }

    entries.push({
      name: name,
      nameStart: nameStart,
      nameEnd: nameStart + name.length,
      valueStart: valueStart,
      valueEnd: valueEnd,
      value: source.slice(valueStart, valueEnd).trim()
    });
    cursor = valueEnd + 1;
  }
  return entries;
}

function objectStartInValue(source, entry) {
  var start = source.indexOf('{', entry.valueStart);
  return start !== -1 && start < entry.valueEnd ? start : -1;
}

function definitionMatch(source) {
  var modern = /EasyComponents\.defineComponent\s*\(\s*(['"])([^'"]+)\1\s*,/.exec(source);
  if (modern) return modern;
  var pattern = /return\s+[a-zA-Z_$][\w$]*\.component\s*\(\s*(['"])([^'"]+)\1\s*,/g;
  var result;
  var match;
  while ((match = pattern.exec(source))) result = match;
  return result || null;
}

function inferProp(entry) {
  var value = entry.value;
  var bindingMatch = /binding\s*:\s*['"]([<@=&])/.exec(value);
  var helperMatch = /EasyComponents\.(text|number|boolean|object|array|event|required)\b/.exec(value);
  var typeMatch = /\b(String|Number|Boolean|Object|Array|Function)\b/.exec(value);
  var helper = helperMatch && helperMatch[1];
  var type = typeMatch && typeMatch[1];
  var binding = bindingMatch && bindingMatch[1];

  if (!binding) {
    if (helper === 'text' || type === 'String' && /binding\s*:\s*['"]@/.test(value)) binding = '@';
    else if (helper === 'event' || type === 'Function') binding = '&';
    else binding = '<';
  }
  if (!type) {
    type = { text: 'String', number: 'Number', boolean: 'Boolean', object: 'Object', array: 'Array', event: 'Function' }[helper] || 'any';
  }

  return {
    name: entry.name,
    attribute: camelToKebab(entry.name),
    type: type,
    binding: binding,
    required: /EasyComponents\.required\s*\(|\brequired\s*:\s*true/.test(value),
    nameStart: entry.nameStart,
    nameEnd: entry.nameEnd
  };
}

function membersFromEntry(source, entry, kind) {
  if (!entry) return [];
  var start = -1;
  if (kind === 'state') {
    var rawValue = source.slice(entry.valueStart, entry.valueEnd);
    var returnMatch = /\breturn\s*{/.exec(rawValue);
    if (returnMatch) start = entry.valueStart + returnMatch.index + returnMatch[0].lastIndexOf('{');
  }
  if (start === -1) start = objectStartInValue(source, entry);
  if (start === -1) return [];
  return objectEntries(source, start).map(function (member) {
    return { name: member.name, kind: kind, nameStart: member.nameStart, nameEnd: member.nameEnd };
  });
}

function uniqueMembers(members) {
  var found = {};
  return members.filter(function (member) {
    if (found[member.name]) return false;
    found[member.name] = true;
    return true;
  });
}

function parseComponent(source, uri) {
  var match = definitionMatch(source);
  if (!match) return null;
  var rawName = match[2];
  var nameOffset = match.index + match[0].lastIndexOf(rawName);
  var definitionStart = source.indexOf('{', match.index + match[0].length);
  if (definitionStart === -1) return null;
  var definitionEnd = matching(source, definitionStart, '{', '}');
  if (definitionEnd === -1) return null;
  var definitionEntries = objectEntries(source, definitionStart);

  function entry(name) {
    return definitionEntries.filter(function (item) { return item.name === name; })[0];
  }

  var propsEntry = entry('props');
  var propsStart = propsEntry && objectStartInValue(source, propsEntry);
  var props = propsStart === undefined || propsStart === -1
    ? []
    : objectEntries(source, propsStart).map(inferProp);
  var members = props.map(function (prop) {
    return { name: prop.name, kind: 'prop', nameStart: prop.nameStart, nameEnd: prop.nameEnd };
  });
  ['state', 'methods', 'computed', 'inject'].forEach(function (kind) {
    members = members.concat(membersFromEntry(source, entry(kind), kind));
  });

  var templates = [];
  var importPattern = /\bimport\s+[$\w]+\s+from\s+(['"])([^'"]+\.html)\1/g;
  var importMatch;
  while ((importMatch = importPattern.exec(source))) templates.push(importMatch[2]);
  var urlPattern = /\btemplateUrl\s*:\s*(['"])([^'"]+)\1/g;
  while ((importMatch = urlPattern.exec(source))) templates.push(importMatch[2]);

  return {
    name: kebabToCamel(rawName),
    selector: camelToKebab(rawName),
    uri: uri,
    nameStart: nameOffset,
    nameEnd: nameOffset + rawName.length,
    props: props,
    members: uniqueMembers(members),
    templates: templates
  };
}

function attributesIn(tagText, absoluteStart) {
  var tagNameMatch = /^<\s*([a-zA-Z][\w-]*)/.exec(tagText);
  if (!tagNameMatch) return [];
  var cursor = tagNameMatch[0].length;
  var attributes = [];
  var pattern = /([:@a-zA-Z_][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  pattern.lastIndex = cursor;
  var match;
  while ((match = pattern.exec(tagText))) {
    if (match[1] === '/') continue;
    var nameStart = absoluteStart + match.index;
    var full = match[0];
    var value = match[2] !== undefined ? match[2] : (match[3] !== undefined ? match[3] : match[4]);
    var valueStart = value === undefined ? -1 : absoluteStart + match.index + full.indexOf(value);
    attributes.push({
      name: match[1],
      nameStart: nameStart,
      nameEnd: nameStart + match[1].length,
      value: value,
      valueStart: valueStart,
      valueEnd: valueStart === -1 ? -1 : valueStart + value.length
    });
  }
  return attributes;
}

function openingTags(text) {
  var tags = [];
  var pattern = /<\s*([a-zA-Z][\w-]*)(?:\s[^<>]*?)?>/g;
  var match;
  while ((match = pattern.exec(text))) {
    var nameOffset = match.index + match[0].indexOf(match[1]);
    tags.push({
      name: match[1],
      start: match.index,
      end: match.index + match[0].length,
      nameStart: nameOffset,
      nameEnd: nameOffset + match[1].length,
      attributes: attributesIn(match[0], match.index)
    });
  }
  return tags;
}

function openingTagAtOffset(text, offset) {
  var opening = text.lastIndexOf('<', offset);
  if (opening === -1 || text.lastIndexOf('>', offset) > opening) return null;
  var end = text.indexOf('>', opening);
  if (end === -1) end = text.length;
  var fragment = text.slice(opening, end + 1);
  var match = /^<\s*([a-zA-Z][\w-]*)/.exec(fragment);
  if (!match || /^<\s*\//.test(fragment)) return null;
  var nameStart = opening + fragment.indexOf(match[1]);
  return {
    name: match[1],
    start: opening,
    end: end + 1,
    nameStart: nameStart,
    nameEnd: nameStart + match[1].length,
    attributes: attributesIn(fragment, opening)
  };
}

function attributeAtOffset(text, offset) {
  var tag = openingTagAtOffset(text, offset);
  if (!tag) return null;
  var attribute = tag.attributes.filter(function (item) {
    return offset >= item.nameStart && offset <= item.nameEnd;
  })[0];
  return attribute ? { tag: tag, attribute: attribute } : null;
}

module.exports = {
  attributeAtOffset: attributeAtOffset,
  camelToKebab: camelToKebab,
  kebabToCamel: kebabToCamel,
  openingTagAtOffset: openingTagAtOffset,
  openingTags: openingTags,
  parseComponent: parseComponent
};
