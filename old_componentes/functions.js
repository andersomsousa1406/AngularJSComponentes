/**
 * Bunch of useful filters for angularJS(with no external dependencies!)
 * @version v0.5.15 - 2017-01-17 * @link https://github.com/a8m/angular-filter
 * @author Ariel Mashraki <ariel@mashraki.co.il>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */!function(a,b,c){"use strict";function d(a){return E(a)?a:Object.keys(a).map(function(b){return a[b]})}function e(a){return null===a}function f(a,b){var d=Object.keys(a);return d.map(function(d){return b[d]!==c&&b[d]==a[d]}).indexOf(!1)==-1}function g(a,b){function c(a,b,c){for(var d=0;b+d<=a.length;){if(a.charAt(b+d)==c)return d;d++}return-1}for(var d=0,e=0;e<=b.length;e++){var f=c(a,d,b.charAt(e));if(f==-1)return!1;d+=f+1}return!0}function h(a,b,c){var d=0;return a.filter(function(a){var e=y(c)?d<b&&c(a):d<b;return d=e?d+1:d,e})}function i(a,b){return Math.round(a*Math.pow(10,b))/Math.pow(10,b)}function j(a,b,c){b=b||[];var d=Object.keys(a);return d.forEach(function(d){if(D(a[d])&&!E(a[d])){var e=c?c+"."+d:c;j(a[d],b,e||d)}else{var f=c?c+"."+d:d;b.push(f)}}),b}function k(a){return a&&a.$evalAsync&&a.$watch}function l(){return function(a,b){return a>b}}function m(){return function(a,b){return a>=b}}function n(){return function(a,b){return a<b}}function o(){return function(a,b){return a<=b}}function p(){return function(a,b){return a==b}}function q(){return function(a,b){return a!=b}}function r(){return function(a,b){return a===b}}function s(){return function(a,b){return a!==b}}function t(a){return function(b,c){return b=D(b)?d(b):b,!(!E(b)||z(c))&&b.some(function(b){return B(c)&&D(b)||A(c)?a(c)(b):b===c})}}function u(a,b){return b=b||0,b>=a.length?a:E(a[b])?u(a.slice(0,b).concat(a[b],a.slice(b+1)),b):u(a,b+1)}function v(a){return function(b,c){function e(a,b){return!z(b)&&a.some(function(a){return I(a,b)})}if(b=D(b)?d(b):b,!E(b))return b;var f=[],g=a(c);return z(c)?b.filter(function(a,b,c){return c.indexOf(a)===b}):b.filter(function(a){var b=g(a);return!e(f,b)&&(f.push(b),!0)})}}function w(a,b,c){return b?a+c+w(a,--b,c):a}function x(){return function(a){return B(a)?a.split(" ").map(function(a){return a.charAt(0).toUpperCase()+a.substring(1)}).join(" "):a}}var y=b.isDefined,z=b.isUndefined,A=b.isFunction,B=b.isString,C=b.isNumber,D=b.isObject,E=b.isArray,F=b.forEach,G=b.extend,H=b.copy,I=b.equals;String.prototype.contains||(String.prototype.contains=function(){return String.prototype.indexOf.apply(this,arguments)!==-1}),b.module("a8m.angular",[]).filter("isUndefined",function(){return function(a){return b.isUndefined(a)}}).filter("isDefined",function(){return function(a){return b.isDefined(a)}}).filter("isFunction",function(){return function(a){return b.isFunction(a)}}).filter("isString",function(){return function(a){return b.isString(a)}}).filter("isNumber",function(){return function(a){return b.isNumber(a)}}).filter("isArray",function(){return function(a){return b.isArray(a)}}).filter("isObject",function(){return function(a){return b.isObject(a)}}).filter("isEqual",function(){return function(a,c){return b.equals(a,c)}}),b.module("a8m.conditions",[]).filter({isGreaterThan:l,">":l,isGreaterThanOrEqualTo:m,">=":m,isLessThan:n,"<":n,isLessThanOrEqualTo:o,"<=":o,isEqualTo:p,"==":p,isNotEqualTo:q,"!=":q,isIdenticalTo:r,"===":r,isNotIdenticalTo:s,"!==":s}),b.module("a8m.is-null",[]).filter("isNull",function(){return function(a){return e(a)}}),b.module("a8m.after-where",[]).filter("afterWhere",function(){return function(a,b){if(a=D(a)?d(a):a,!E(a)||z(b))return a;var c=a.map(function(a){return f(b,a)}).indexOf(!0);return a.slice(c===-1?0:c)}}),b.module("a8m.after",[]).filter("after",function(){return function(a,b){return a=D(a)?d(a):a,E(a)?a.slice(b):a}}),b.module("a8m.before-where",[]).filter("beforeWhere",function(){return function(a,b){if(a=D(a)?d(a):a,!E(a)||z(b))return a;var c=a.map(function(a){return f(b,a)}).indexOf(!0);return a.slice(0,c===-1?a.length:++c)}}),b.module("a8m.before",[]).filter("before",function(){return function(a,b){return a=D(a)?d(a):a,E(a)?a.slice(0,b?--b:b):a}}),b.module("a8m.chunk-by",["a8m.filter-watcher"]).filter("chunkBy",["filterWatcher",function(a){return function(b,c,d){function e(a,b){for(var c=[];a--;)c[a]=b;return c}function f(a,b,c){return E(a)?a.map(function(a,d,f){return d*=b,a=f.slice(d,d+b),!z(c)&&a.length<b?a.concat(e(b-a.length,c)):a}).slice(0,Math.ceil(a.length/b)):a}return a.isMemoized("chunkBy",arguments)||a.memoize("chunkBy",arguments,this,f(b,c,d))}}]),b.module("a8m.concat",[]).filter("concat",[function(){return function(a,b){if(z(b))return a;if(E(a))return D(b)?a.concat(d(b)):a.concat(b);if(D(a)){var c=d(a);return D(b)?c.concat(d(b)):c.concat(b)}return a}}]),b.module("a8m.contains",[]).filter({contains:["$parse",t],some:["$parse",t]}),b.module("a8m.count-by",[]).filter("countBy",["$parse",function(a){return function(b,c){var e,f={},g=a(c);return b=D(b)?d(b):b,!E(b)||z(c)?b:(b.forEach(function(a){e=g(a),f[e]||(f[e]=0),f[e]++}),f)}}]),b.module("a8m.defaults",[]).filter("defaults",["$parse",function(a){return function(b,c){if(b=D(b)?d(b):b,!E(b)||!D(c))return b;var e=j(c);return b.forEach(function(b){e.forEach(function(d){var e=a(d),f=e.assign;z(e(b))&&f(b,e(c))})}),b}}]),b.module("a8m.every",[]).filter("every",["$parse",function(a){return function(b,c){return b=D(b)?d(b):b,!(E(b)&&!z(c))||b.every(function(b){return D(b)||A(c)?a(c)(b):b===c})}}]),b.module("a8m.filter-by",[]).filter("filterBy",["$parse",function(a){return function(b,e,f,g){var h;return f=B(f)||C(f)?String(f).toLowerCase():c,b=D(b)?d(b):b,!E(b)||z(f)?b:b.filter(function(b){return e.some(function(c){if(~c.indexOf("+")){var d=c.replace(/\s+/g,"").split("+");h=d.map(function(c){return a(c)(b)}).join(" ")}else h=a(c)(b);return!(!B(h)&&!C(h))&&(h=String(h).toLowerCase(),g?h===f:h.contains(f))})})}}]),b.module("a8m.first",[]).filter("first",["$parse",function(a){return function(b){var e,f,g;return b=D(b)?d(b):b,E(b)?(g=Array.prototype.slice.call(arguments,1),e=C(g[0])?g[0]:1,f=C(g[0])?C(g[1])?c:g[1]:g[0],g.length?h(b,e,f?a(f):f):b[0]):b}}]),b.module("a8m.flatten",[]).filter("flatten",function(){return function(a,b){return b=b||!1,a=D(a)?d(a):a,E(a)?b?[].concat.apply([],a):u(a,0):a}}),b.module("a8m.fuzzy-by",[]).filter("fuzzyBy",["$parse",function(a){return function(b,c,e,f){var h,i,j=f||!1;return b=D(b)?d(b):b,!E(b)||z(c)||z(e)?b:(i=a(c),b.filter(function(a){return h=i(a),!!B(h)&&(h=j?h:h.toLowerCase(),e=j?e:e.toLowerCase(),g(h,e)!==!1)}))}}]),b.module("a8m.fuzzy",[]).filter("fuzzy",function(){return function(a,b,c){function e(a,b){var c,d,e=Object.keys(a);return 0<e.filter(function(e){return c=a[e],!!d||!!B(c)&&(c=f?c:c.toLowerCase(),d=g(c,b)!==!1)}).length}var f=c||!1;return a=D(a)?d(a):a,!E(a)||z(b)?a:(b=f?b:b.toLowerCase(),a.filter(function(a){return B(a)?(a=f?a:a.toLowerCase(),g(a,b)!==!1):!!D(a)&&e(a,b)}))}}),b.module("a8m.group-by",["a8m.filter-watcher"]).filter("groupBy",["$parse","filterWatcher",function(a,b){return function(c,d){function e(a,b){var c,d={};return F(a,function(a){c=b(a),d[c]||(d[c]=[]),d[c].push(a)}),d}return!D(c)||z(d)?c:b.isMemoized("groupBy",arguments)||b.memoize("groupBy",arguments,this,e(c,a(d)))}}]),b.module("a8m.is-empty",[]).filter("isEmpty",function(){return function(a){return D(a)?!d(a).length:!a.length}}),b.module("a8m.join",[]).filter("join",function(){return function(a,b){return z(a)||!E(a)?a:(z(b)&&(b=" "),a.join(b))}}),b.module("a8m.last",[]).filter("last",["$parse",function(a){return function(b){var e,f,g,i=H(b);return i=D(i)?d(i):i,E(i)?(g=Array.prototype.slice.call(arguments,1),e=C(g[0])?g[0]:1,f=C(g[0])?C(g[1])?c:g[1]:g[0],g.length?h(i.reverse(),e,f?a(f):f).reverse():i[i.length-1]):i}}]),b.module("a8m.map",[]).filter("map",["$parse",function(a){return function(b,c){return b=D(b)?d(b):b,!E(b)||z(c)?b:b.map(function(b){return a(c)(b)})}}]),b.module("a8m.omit",[]).filter("omit",["$parse",function(a){return function(b,c){return b=D(b)?d(b):b,!E(b)||z(c)?b:b.filter(function(b){return!a(c)(b)})}}]),b.module("a8m.pick",[]).filter("pick",["$parse",function(a){return function(b,c){return b=D(b)?d(b):b,!E(b)||z(c)?b:b.filter(function(b){return a(c)(b)})}}]),b.module("a8m.range",[]).filter("range",function(){return function(a,b,c,d,e){c=c||0,d=d||1;for(var f=0;f<parseInt(b);f++){var g=c+f*d;a.push(A(e)?e(g):g)}return a}}),b.module("a8m.remove-with",[]).filter("removeWith",function(){return function(a,b){return z(b)?a:(a=D(a)?d(a):a,a.filter(function(a){return!f(b,a)}))}}),b.module("a8m.remove",[]).filter("remove",function(){return function(a){a=D(a)?d(a):a;var b=Array.prototype.slice.call(arguments,1);return E(a)?a.filter(function(a){return!b.some(function(b){return I(b,a)})}):a}}),b.module("a8m.reverse",[]).filter("reverse",[function(){return function(a){return a=D(a)?d(a):a,B(a)?a.split("").reverse().join(""):E(a)?a.slice().reverse():a}}]),b.module("a8m.search-field",[]).filter("searchField",["$parse",function(a){return function(b){var c,e;b=D(b)?d(b):b;var f=Array.prototype.slice.call(arguments,1);return E(b)&&f.length?b.map(function(b){return e=f.map(function(d){return(c=a(d))(b)}).join(" "),G(b,{searchField:e})}):b}}]),b.module("a8m.to-array",[]).filter("toArray",function(){return function(a,b){return D(a)?b?Object.keys(a).map(function(b){return G(a[b],{$key:b})}):d(a):a}}),b.module("a8m.unique",[]).filter({unique:["$parse",v],uniq:["$parse",v]}),b.module("a8m.where",[]).filter("where",function(){return function(a,b){return z(b)?a:(a=D(a)?d(a):a,a.filter(function(a){return f(b,a)}))}}),b.module("a8m.xor",[]).filter("xor",["$parse",function(a){return function(b,c,e){function f(b,c){var d=a(e);return c.some(function(a){return e?I(d(a),d(b)):I(a,b)})}return e=e||!1,b=D(b)?d(b):b,c=D(c)?d(c):c,E(b)&&E(c)?b.concat(c).filter(function(a){return!(f(a,b)&&f(a,c))}):b}}]),b.module("a8m.math.abs",[]).filter("abs",function(){return function(a){return Math.abs(a)}}),b.module("a8m.math.byteFmt",[]).filter("byteFmt",function(){var a=[{str:"B",val:1024}];return["KB","MB","GB","TB","PB","EB","ZB","YB"].forEach(function(b,c){a.push({str:b,val:1024*a[c].val})}),function(b,c){if(C(c)&&isFinite(c)&&c%1===0&&c>=0&&C(b)&&isFinite(b)){for(var d=0;d<a.length-1&&b>=a[d].val;)d++;return b/=d>0?a[d-1].val:1,i(b,c)+" "+a[d].str}return"NaN"}}),b.module("a8m.math.degrees",[]).filter("degrees",function(){return function(a,b){if(C(b)&&isFinite(b)&&b%1===0&&b>=0&&C(a)&&isFinite(a)){var c=180*a/Math.PI;return Math.round(c*Math.pow(10,b))/Math.pow(10,b)}return"NaN"}}),b.module("a8m.math.kbFmt",[]).filter("kbFmt",function(){var a=[{str:"KB",val:1024}];return["MB","GB","TB","PB","EB","ZB","YB"].forEach(function(b,c){a.push({str:b,val:1024*a[c].val})}),function(b,c){if(C(c)&&isFinite(c)&&c%1===0&&c>=0&&C(b)&&isFinite(b)){for(var d=0;d<a.length-1&&b>=a[d].val;)d++;return b/=d>0?a[d-1].val:1,i(b,c)+" "+a[d].str}return"NaN"}}),b.module("a8m.math.max",[]).filter("max",["$parse",function(a){function b(b,c){var d=b.map(function(b){return a(c)(b)});return d.indexOf(Math.max.apply(Math,d))}return function(a,c){return E(a)?z(c)?Math.max.apply(Math,a):a[b(a,c)]:a}}]),b.module("a8m.math.min",[]).filter("min",["$parse",function(a){function b(b,c){var d=b.map(function(b){return a(c)(b)});return d.indexOf(Math.min.apply(Math,d))}return function(a,c){return E(a)?z(c)?Math.min.apply(Math,a):a[b(a,c)]:a}}]),b.module("a8m.math.percent",[]).filter("percent",function(){return function(a,b,c){var d=B(a)?Number(a):a;return b=b||100,c=c||!1,!C(d)||isNaN(d)?a:c?Math.round(d/b*100):d/b*100}}),b.module("a8m.math.radians",[]).filter("radians",function(){return function(a,b){if(C(b)&&isFinite(b)&&b%1===0&&b>=0&&C(a)&&isFinite(a)){var c=3.14159265359*a/180;return Math.round(c*Math.pow(10,b))/Math.pow(10,b)}return"NaN"}}),b.module("a8m.math.radix",[]).filter("radix",function(){return function(a,b){var c=/^[2-9]$|^[1-2]\d$|^3[0-6]$/;return C(a)&&c.test(b)?a.toString(b).toUpperCase():a}}),b.module("a8m.math.shortFmt",[]).filter("shortFmt",function(){return function(a,b){return C(b)&&isFinite(b)&&b%1===0&&b>=0&&C(a)&&isFinite(a)?a<1e3?""+a:a<1e6?i(a/1e3,b)+" K":a<1e9?i(a/1e6,b)+" M":i(a/1e9,b)+" B":"NaN"}}),b.module("a8m.math.sum",[]).filter("sum",function(){return function(a,b){return E(a)?a.reduce(function(a,b){return a+b},b||0):a}}),b.module("a8m.ends-with",[]).filter("endsWith",function(){return function(a,b,c){var d,e=c||!1;return!B(a)||z(b)?a:(a=e?a:a.toLowerCase(),d=a.length-b.length,a.indexOf(e?b:b.toLowerCase(),d)!==-1)}}),b.module("a8m.latinize",[]).filter("latinize",[function(){function a(a){return a.replace(/[^\u0000-\u007E]/g,function(a){return c[a]||a})}for(var b=[{base:"A",letters:"AⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ"},{base:"AA",letters:"Ꜳ"},{base:"AE",letters:"ÆǼǢ"},{base:"AO",letters:"Ꜵ"},{base:"AU",letters:"Ꜷ"},{base:"AV",letters:"ꜸꜺ"},{base:"AY",letters:"Ꜽ"},{base:"B",letters:"BⒷＢḂḄḆɃƂƁ"},{base:"C",letters:"CⒸＣĆĈĊČÇḈƇȻꜾ"},{base:"D",letters:"DⒹＤḊĎḌḐḒḎĐƋƊƉꝹ"},{base:"DZ",letters:"ǱǄ"},{base:"Dz",letters:"ǲǅ"},{base:"E",letters:"EⒺＥÈÉÊỀẾỄỂẼĒḔḖĔĖËẺĚȄȆẸỆȨḜĘḘḚƐƎ"},{base:"F",letters:"FⒻＦḞƑꝻ"},{base:"G",letters:"GⒼＧǴĜḠĞĠǦĢǤƓꞠꝽꝾ"},{base:"H",letters:"HⒽＨĤḢḦȞḤḨḪĦⱧⱵꞍ"},{base:"I",letters:"IⒾＩÌÍÎĨĪĬİÏḮỈǏȈȊỊĮḬƗ"},{base:"J",letters:"JⒿＪĴɈ"},{base:"K",letters:"KⓀＫḰǨḲĶḴƘⱩꝀꝂꝄꞢ"},{base:"L",letters:"LⓁＬĿĹĽḶḸĻḼḺŁȽⱢⱠꝈꝆꞀ"},{base:"LJ",letters:"Ǉ"},{base:"Lj",letters:"ǈ"},{base:"M",letters:"MⓂＭḾṀṂⱮƜ"},{base:"N",letters:"NⓃＮǸŃÑṄŇṆŅṊṈȠƝꞐꞤ"},{base:"NJ",letters:"Ǌ"},{base:"Nj",letters:"ǋ"},{base:"O",letters:"OⓄＯÒÓÔỒỐỖỔÕṌȬṎŌṐṒŎȮȰÖȪỎŐǑȌȎƠỜỚỠỞỢỌỘǪǬØǾƆƟꝊꝌ"},{base:"OI",letters:"Ƣ"},{base:"OO",letters:"Ꝏ"},{base:"OU",letters:"Ȣ"},{base:"OE",letters:"Œ"},{base:"oe",letters:"œ"},{base:"P",letters:"PⓅＰṔṖƤⱣꝐꝒꝔ"},{base:"Q",letters:"QⓆＱꝖꝘɊ"},{base:"R",letters:"RⓇＲŔṘŘȐȒṚṜŖṞɌⱤꝚꞦꞂ"},{base:"S",letters:"SⓈＳẞŚṤŜṠŠṦṢṨȘŞⱾꞨꞄ"},{base:"T",letters:"TⓉＴṪŤṬȚŢṰṮŦƬƮȾꞆ"},{base:"TZ",letters:"Ꜩ"},{base:"U",letters:"UⓊＵÙÚÛŨṸŪṺŬÜǛǗǕǙỦŮŰǓȔȖƯỪỨỮỬỰỤṲŲṶṴɄ"},{base:"V",letters:"VⓋＶṼṾƲꝞɅ"},{base:"VY",letters:"Ꝡ"},{base:"W",letters:"WⓌＷẀẂŴẆẄẈⱲ"},{base:"X",letters:"XⓍＸẊẌ"},{base:"Y",letters:"YⓎＹỲÝŶỸȲẎŸỶỴƳɎỾ"},{base:"Z",letters:"ZⓏＺŹẐŻŽẒẔƵȤⱿⱫꝢ"},{base:"a",letters:"aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐ"},{base:"aa",letters:"ꜳ"},{base:"ae",letters:"æǽǣ"},{base:"ao",letters:"ꜵ"},{base:"au",letters:"ꜷ"},{base:"av",letters:"ꜹꜻ"},{base:"ay",letters:"ꜽ"},{base:"b",letters:"bⓑｂḃḅḇƀƃɓ"},{base:"c",letters:"cⓒｃćĉċčçḉƈȼꜿↄ"},{base:"d",letters:"dⓓｄḋďḍḑḓḏđƌɖɗꝺ"},{base:"dz",letters:"ǳǆ"},{base:"e",letters:"eⓔｅèéêềếễểẽēḕḗĕėëẻěȅȇẹệȩḝęḙḛɇɛǝ"},{base:"f",letters:"fⓕｆḟƒꝼ"},{base:"g",letters:"gⓖｇǵĝḡğġǧģǥɠꞡᵹꝿ"},{base:"h",letters:"hⓗｈĥḣḧȟḥḩḫẖħⱨⱶɥ"},{base:"hv",letters:"ƕ"},{base:"i",letters:"iⓘｉìíîĩīĭïḯỉǐȉȋịįḭɨı"},{base:"j",letters:"jⓙｊĵǰɉ"},{base:"k",letters:"kⓚｋḱǩḳķḵƙⱪꝁꝃꝅꞣ"},{base:"l",letters:"lⓛｌŀĺľḷḹļḽḻſłƚɫⱡꝉꞁꝇ"},{base:"lj",letters:"ǉ"},{base:"m",letters:"mⓜｍḿṁṃɱɯ"},{base:"n",letters:"nⓝｎǹńñṅňṇņṋṉƞɲŉꞑꞥ"},{base:"nj",letters:"ǌ"},{base:"o",letters:"oⓞｏòóôồốỗổõṍȭṏōṑṓŏȯȱöȫỏőǒȍȏơờớỡởợọộǫǭøǿɔꝋꝍɵ"},{base:"oi",letters:"ƣ"},{base:"ou",letters:"ȣ"},{base:"oo",letters:"ꝏ"},{base:"p",letters:"pⓟｐṕṗƥᵽꝑꝓꝕ"},{base:"q",letters:"qⓠｑɋꝗꝙ"},{base:"r",letters:"rⓡｒŕṙřȑȓṛṝŗṟɍɽꝛꞧꞃ"},{base:"s",letters:"sⓢｓßśṥŝṡšṧṣṩșşȿꞩꞅẛ"},{base:"t",letters:"tⓣｔṫẗťṭțţṱṯŧƭʈⱦꞇ"},{base:"tz",letters:"ꜩ"},{base:"u",letters:"uⓤｕùúûũṹūṻŭüǜǘǖǚủůűǔȕȗưừứữửựụṳųṷṵʉ"},{base:"v",letters:"vⓥｖṽṿʋꝟʌ"},{base:"vy",letters:"ꝡ"},{base:"w",letters:"wⓦｗẁẃŵẇẅẘẉⱳ"},{base:"x",letters:"xⓧｘẋẍ"},{base:"y",letters:"yⓨｙỳýŷỹȳẏÿỷẙỵƴɏỿ"},{base:"z",letters:"zⓩｚźẑżžẓẕƶȥɀⱬꝣ"}],c={},d=0;d<b.length;d++)for(var e=b[d].letters.split(""),f=0;f<e.length;f++)c[e[f]]=b[d].base;return function(b){return B(b)?a(b):b}}]),b.module("a8m.ltrim",[]).filter("ltrim",function(){return function(a,b){var c=b||"\\s";return B(a)?a.replace(new RegExp("^"+c+"+"),""):a}}),b.module("a8m.match",[]).filter("match",function(){return function(a,b,c){var d=new RegExp(b,c);return B(a)?a.match(d):null}}),b.module("a8m.phoneUS",[]).filter("phoneUS",function(){return function(a){return a+="","("+a.slice(0,3)+") "+a.slice(3,6)+"-"+a.slice(6)}}),b.module("a8m.repeat",[]).filter("repeat",[function(){return function(a,b,c){var d=~~b;return B(a)&&d?w(a,--b,c||""):a}}]),b.module("a8m.rtrim",[]).filter("rtrim",function(){return function(a,b){var c=b||"\\s";return B(a)?a.replace(new RegExp(c+"+$"),""):a}}),b.module("a8m.slugify",[]).filter("slugify",[function(){return function(a,b){var c=z(b)?"-":b;return B(a)?a.toLowerCase().replace(/\s+/g,c):a}}]),b.module("a8m.split",[]).filter("split",function(){function a(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}return function(b,c,d){var f,g,h,i;return z(b)||!B(b)?null:(z(c)&&(c=""),isNaN(d)&&(d=0),f=new RegExp(a(c),"g"),g=b.match(f),e(g)||d>=g.length?[b]:0===d?b.split(c):(h=b.split(c),i=h.splice(0,d+1),h.unshift(i.join(c)),h))}}),b.module("a8m.starts-with",[]).filter("startsWith",function(){return function(a,b,c){var d=c||!1;return!B(a)||z(b)?a:(a=d?a:a.toLowerCase(),!a.indexOf(d?b:b.toLowerCase()))}}),b.module("a8m.stringular",[]).filter("stringular",function(){return function(a){var b=Array.prototype.slice.call(arguments,1);return a.replace(/{(\d+)}/g,function(a,c){return z(b[c])?a:b[c]})}}),b.module("a8m.strip-tags",[]).filter("stripTags",function(){return function(a){return B(a)?a.replace(/<\S[^><]*>/g,""):a}}),b.module("a8m.test",[]).filter("test",function(){return function(a,b,c){var d=new RegExp(b,c);return B(a)?d.test(a):a}}),b.module("a8m.trim",[]).filter("trim",function(){return function(a,b){var c=b||"\\s";return B(a)?a.replace(new RegExp("^"+c+"+|"+c+"+$","g"),""):a}}),b.module("a8m.truncate",[]).filter("truncate",function(){return function(a,b,c,d){return b=z(b)?a.length:b,d=d||!1,c=c||"",!B(a)||a.length<=b?a:a.substring(0,d?a.indexOf(" ",b)===-1?a.length:a.indexOf(" ",b):b)+c}}),b.module("a8m.ucfirst",[]).filter({ucfirst:x,titleize:x}),b.module("a8m.uri-component-encode",[]).filter("uriComponentEncode",["$window",function(a){return function(b){return B(b)?a.encodeURIComponent(b):b}}]),b.module("a8m.uri-encode",[]).filter("uriEncode",["$window",function(a){return function(b){return B(b)?a.encodeURI(b):b}}]),b.module("a8m.wrap",[]).filter("wrap",function(){return function(a,b,c){return B(a)&&y(b)?[b,a,c||b].join(""):a}}),b.module("a8m.filter-watcher",[]).provider("filterWatcher",function(){this.$get=["$window","$rootScope",function(a,b){function c(b,c){function d(){var b=[];return function(c,d){if(D(d)&&!e(d)){if(~b.indexOf(d))return"[Circular]";b.push(d)}return a==d?"$WINDOW":a.document==d?"$DOCUMENT":k(d)?"$SCOPE":d}}return[b,JSON.stringify(c,d())].join("#").replace(/"/g,"")}function d(a){var b=a.targetScope.$id;F(l[b],function(a){delete j[a]}),delete l[b]}function f(){m(function(){b.$$phase||(j={})},2e3)}function g(a,b){var c=a.$id;return z(l[c])&&(a.$on("$destroy",d),l[c]=[]),l[c].push(b)}function h(a,b){var d=c(a,b);return j[d]}function i(a,b,d,e){var h=c(a,b);return j[h]=e,k(d)?g(d,h):f(),e}var j={},l={},m=a.setTimeout;return{isMemoized:h,memoize:i}}]}),b.module("angular.filter",["a8m.ucfirst","a8m.uri-encode","a8m.uri-component-encode","a8m.slugify","a8m.latinize","a8m.strip-tags","a8m.stringular","a8m.truncate","a8m.starts-with","a8m.ends-with","a8m.wrap","a8m.trim","a8m.ltrim","a8m.rtrim","a8m.repeat","a8m.test","a8m.match","a8m.split","a8m.to-array","a8m.concat","a8m.contains","a8m.unique","a8m.is-empty","a8m.after","a8m.after-where","a8m.before","a8m.before-where","a8m.defaults","a8m.where","a8m.reverse","a8m.remove","a8m.remove-with","a8m.group-by","a8m.count-by","a8m.chunk-by","a8m.search-field","a8m.fuzzy-by","a8m.fuzzy","a8m.omit","a8m.pick","a8m.every","a8m.filter-by","a8m.xor","a8m.map","a8m.first","a8m.last","a8m.flatten","a8m.join","a8m.range","a8m.math.max","a8m.math.min","a8m.math.abs","a8m.math.percent","a8m.math.radix","a8m.math.sum","a8m.math.degrees","a8m.math.radians","a8m.math.byteFmt","a8m.math.kbFmt","a8m.math.shortFmt","a8m.angular","a8m.conditions","a8m.is-null","a8m.filter-watcher"])}(window,window.angular);

/*!
angular-xeditable - 0.5.0
Edit-in-place for angular.js
Build date: 2016-10-27 
*/
angular.module("xeditable",[]).value("editableOptions",{theme:"default",icon_set:"default",buttons:"right",blurElem:"cancel",blurForm:"ignore",activate:"focus",isDisabled:!1,activationEvent:"click",submitButtonTitle:"Submit",submitButtonAriaLabel:"Submit",cancelButtonTitle:"Cancel",cancelButtonAriaLabel:"Cancel",clearButtonTitle:"Clear",clearButtonAriaLabel:"Clear",displayClearButton:!1}),angular.module("xeditable").directive("editableBsdate",["editableDirectiveFactory",function(a){return a({directiveName:"editableBsdate",inputTpl:"<div></div>",render:function(){this.parent.render.call(this);var a=angular.element('<input type="text" class="form-control" data-ng-model="$parent.$data"/>');a.attr("uib-datepicker-popup",this.attrs.eDatepickerPopupXEditable||"yyyy/MM/dd"),a.attr("is-open",this.attrs.eIsOpen),a.attr("date-disabled",this.attrs.eDateDisabled),a.attr("uib-datepicker-popup",this.attrs.eDatepickerPopup),a.attr("year-range",this.attrs.eYearRange||20),a.attr("show-button-bar",this.attrs.eShowButtonBar||!0),a.attr("current-text",this.attrs.eCurrentText||"Today"),a.attr("clear-text",this.attrs.eClearText||"Clear"),a.attr("close-text",this.attrs.eCloseText||"Done"),a.attr("close-on-date-selection",this.attrs.eCloseOnDateSelection||!0),a.attr("datepicker-append-to-body",this.attrs.eDatePickerAppendToBody||!1),a.attr("date-disabled",this.attrs.eDateDisabled),a.attr("name",this.attrs.eName),a.attr("on-open-focus",this.attrs.eOnOpenFocus||!0),a.attr("ng-readonly",this.attrs.eReadonly||!1),this.attrs.eNgChange&&(a.attr("ng-change",this.attrs.eNgChange),this.inputEl.removeAttr("ng-change")),this.attrs.eStyle&&(a.attr("style",this.attrs.eStyle),this.inputEl.removeAttr("style")),this.scope.dateOptions={formatDay:this.attrs.eFormatDay||"dd",formatMonth:this.attrs.eFormatMonth||"MMMM",formatYear:this.attrs.eFormatYear||"yyyy",formatDayHeader:this.attrs.eFormatDayHeader||"EEE",formatDayTitle:this.attrs.eFormatDayTitle||"MMMM yyyy",formatMonthTitle:this.attrs.eFormatMonthTitle||"yyyy",showWeeks:this.attrs.eShowWeeks?"true"===this.attrs.eShowWeeks.toLowerCase():!0,startingDay:this.attrs.eStartingDay||0,minMode:this.attrs.eMinMode||"day",maxMode:this.attrs.eMaxMode||"year",initDate:this.scope.$eval(this.attrs.eInitDate)||new Date,datepickerMode:this.attrs.eDatepickerMode||"day",maxDate:this.scope.$eval(this.attrs.eMaxDate)||null,minDate:this.scope.$eval(this.attrs.eMinDate)||null};var b=angular.isDefined(this.attrs.eShowCalendarButton)?this.attrs.eShowCalendarButton:"true";if("true"===b){var c=angular.element('<button type="button" class="btn btn-default"><i class="glyphicon glyphicon-calendar"></i></button>'),d=angular.element('<span class="input-group-btn"></span>');c.attr("ng-click",this.attrs.eNgClick),d.append(c),this.inputEl.append(d)}else a.attr("ng-click",this.attrs.eNgClick);a.attr("datepicker-options","dateOptions"),this.inputEl.prepend(a),this.inputEl.removeAttr("class"),this.inputEl.removeAttr("ng-click"),this.inputEl.removeAttr("is-open"),this.inputEl.removeAttr("init-date"),this.inputEl.removeAttr("datepicker-popup"),this.inputEl.removeAttr("required"),this.inputEl.removeAttr("ng-model"),this.inputEl.removeAttr("date-picker-append-to-body"),this.inputEl.removeAttr("name"),this.inputEl.attr("class","input-group")}})}]),angular.module("xeditable").directive("editableBstime",["editableDirectiveFactory",function(a){return a({directiveName:"editableBstime",inputTpl:"<uib-timepicker></uib-timepicker>",render:function(){this.parent.render.call(this);var a=angular.element('<div class="well well-small" style="display:inline-block;"></div>');a.attr("ng-model",this.inputEl.attr("ng-model")),this.inputEl.removeAttr("ng-model"),this.attrs.eNgChange&&(a.attr("ng-change",this.inputEl.attr("ng-change")),this.inputEl.removeAttr("ng-change")),this.inputEl.wrap(a)}})}]),angular.module("xeditable").directive("editableCheckbox",["editableDirectiveFactory",function(a){return a({directiveName:"editableCheckbox",inputTpl:'<input type="checkbox">',render:function(){this.parent.render.call(this),this.attrs.eTitle&&(this.inputEl.wrap("<label></label>"),this.inputEl.parent().append("<span>"+this.attrs.eTitle+"</span>"))},autosubmit:function(){var a=this;a.inputEl.bind("change",function(){setTimeout(function(){a.scope.$apply(function(){a.scope.$form.$submit()})},500)})}})}]),angular.module("xeditable").directive("editableChecklist",["editableDirectiveFactory","editableNgOptionsParser",function(a,b){return a({directiveName:"editableChecklist",inputTpl:"<span></span>",useCopy:!0,render:function(){this.parent.render.call(this);var a=b(this.attrs.eNgOptions),c="",d="";this.attrs.eNgChange&&(c=' ng-change="'+this.attrs.eNgChange+'"'),this.attrs.eChecklistComparator&&(d=' checklist-comparator="'+this.attrs.eChecklistComparator+'"');var e='<label ng-repeat="'+a.ngRepeat+'"><input type="checkbox" checklist-model="$parent.$parent.$data" checklist-value="'+a.locals.valueFn+'"'+c+d+'><span ng-bind="'+a.locals.displayFn+'"></span></label>';this.inputEl.removeAttr("ng-model"),this.inputEl.removeAttr("ng-options"),this.inputEl.removeAttr("ng-change"),this.inputEl.removeAttr("checklist-comparator"),this.inputEl.html(e)}})}]),angular.module("xeditable").directive("editableCombodate",["editableDirectiveFactory","editableCombodate",function(a,b){return a({directiveName:"editableCombodate",inputTpl:'<input type="text">',render:function(){this.parent.render.call(this);var a={value:new Date(this.scope.$data)},c=this;angular.forEach(["format","template","minYear","maxYear","yearDescending","minuteStep","secondStep","firstItem","errorClass","customClass","roundTime","smartDays"],function(b){var d="e"+b.charAt(0).toUpperCase()+b.slice(1);d in c.attrs&&(a[b]=c.attrs[d])});var d=b.getInstance(this.inputEl,a);d.$widget.find("select").bind("change",function(a){c.scope.$data=new Date(d.getValue()).toISOString()})}})}]),function(){var a=function(a){return a.toLowerCase().replace(/-(.)/g,function(a,b){return b.toUpperCase()})},b="text|password|email|tel|number|url|search|color|date|datetime|datetime-local|time|month|week|file".split("|");angular.forEach(b,function(b){var c=a("editable-"+b);angular.module("xeditable").directive(c,["editableDirectiveFactory",function(a){return a({directiveName:c,inputTpl:'<input type="'+b+'">',render:function(){if(this.parent.render.call(this),this.attrs.eInputgroupleft||this.attrs.eInputgroupright){if(this.inputEl.wrap('<div class="input-group"></div>'),this.attrs.eInputgroupleft){var a=angular.element('<span class="input-group-addon">'+this.attrs.eInputgroupleft+"</span>");this.inputEl.parent().prepend(a)}if(this.attrs.eInputgroupright){var b=angular.element('<span class="input-group-addon">'+this.attrs.eInputgroupright+"</span>");this.inputEl.parent().append(b)}}if(this.attrs.eLabel){var c=angular.element("<label>"+this.attrs.eLabel+"</label>");this.attrs.eInputgroupleft||this.attrs.eInputgroupright?this.inputEl.parent().parent().prepend(c):this.inputEl.parent().prepend(c)}this.attrs.eFormclass&&this.editorEl.addClass(this.attrs.eFormclass)}})}])}),angular.module("xeditable").directive("editableRange",["editableDirectiveFactory","$interpolate",function(a,b){return a({directiveName:"editableRange",inputTpl:'<input type="range" id="range" name="range">',render:function(){this.parent.render.call(this),this.inputEl.after("<output>"+b.startSymbol()+"$data"+b.endSymbol()+"</output>")}})}])}(),angular.module("xeditable").directive("editableTagsInput",["editableDirectiveFactory","editableUtils",function(a,b){var c=a({directiveName:"editableTagsInput",inputTpl:"<tags-input></tags-input>",render:function(){this.parent.render.call(this),this.inputEl.append(b.rename("auto-complete",this.attrs.$autoCompleteElement)),this.inputEl.removeAttr("ng-model"),this.inputEl.attr("ng-model","$parent.$data")}}),d=c.link;return c.link=function(a,b,c,e){var f=b.find("editable-tags-input-auto-complete");return c.$autoCompleteElement=f.clone(),f.remove(),d(a,b,c,e)},c}]),angular.module("xeditable").directive("editableRadiolist",["editableDirectiveFactory","editableNgOptionsParser","$interpolate",function(a,b,c){return a({directiveName:"editableRadiolist",inputTpl:"<span></span>",render:function(){this.parent.render.call(this);var a=b(this.attrs.eNgOptions),d="";this.attrs.eNgChange&&(d='ng-change="'+this.attrs.eNgChange+'"');var e='<label data-ng-repeat="'+a.ngRepeat+'"><input type="radio" data-ng-disabled="::'+this.attrs.eNgDisabled+'" data-ng-model="$parent.$parent.$data" data-ng-value="'+c.startSymbol()+"::"+a.locals.valueFn+c.endSymbol()+'"'+d+'><span data-ng-bind="::'+a.locals.displayFn+'"></span></label>';this.inputEl.removeAttr("ng-model"),this.inputEl.removeAttr("ng-options"),this.inputEl.removeAttr("ng-change"),this.inputEl.html(e)},autosubmit:function(){var a=this;a.inputEl.bind("change",function(){setTimeout(function(){a.scope.$apply(function(){a.scope.$form.$submit()})},500)})}})}]),angular.module("xeditable").directive("editableSelect",["editableDirectiveFactory",function(a){return a({directiveName:"editableSelect",inputTpl:"<select></select>",render:function(){if(this.parent.render.call(this),this.attrs.ePlaceholder){var a=angular.element('<option value="">'+this.attrs.ePlaceholder+"</option>");this.inputEl.append(a)}},autosubmit:function(){var a=this;a.inputEl.bind("change",function(){a.scope.$apply(function(){a.scope.$form.$submit()})})}})}]),angular.module("xeditable").directive("editableTextarea",["editableDirectiveFactory",function(a){return a({directiveName:"editableTextarea",inputTpl:"<textarea></textarea>",addListeners:function(){var a=this;a.parent.addListeners.call(a),a.single&&"no"!==a.buttons&&a.autosubmit()},autosubmit:function(){var a=this;a.inputEl.bind("keydown",function(b){(b.ctrlKey||b.metaKey)&&13===b.keyCode&&a.scope.$apply(function(){a.scope.$form.$submit()})})}})}]),angular.module("xeditable").directive("editableUiSelect",["editableDirectiveFactory","editableUtils",function(a,b){var c=a({directiveName:"editableUiSelect",inputTpl:"<ui-select></ui-select>",render:function(){this.parent.render.call(this),this.inputEl.append(b.rename("ui-select-match",this.attrs.$matchElement)),this.inputEl.append(b.rename("ui-select-choices",this.attrs.$choicesElement)),this.inputEl.removeAttr("ng-model"),this.inputEl.attr("ng-model","$parent.$parent.$data")}}),d=c.link;return c.link=function(a,b,c,e){var f=b.find("editable-ui-select-match"),g=b.find("editable-ui-select-choices");return c.$matchElement=f.clone(),c.$choicesElement=g.clone(),f.remove(),g.remove(),d(a,b,c,e)},c}]),angular.module("xeditable").factory("editableController",["$q","editableUtils",function(a,b){function c(a,c,d,e,f,g,h,i,j,k){var l,m,n=this;n.scope=a,n.elem=d,n.attrs=c,n.inputEl=null,n.editorEl=null,n.single=!0,n.error="",n.theme=f[c.editableTheme]||f[h.theme]||f["default"],n.parent={},n.icon_set="default"===h.icon_set?g["default"][h.theme]:g.external[h.icon_set],n.inputTpl="",n.directiveName="",n.useCopy=!1,n.single=null,n.buttons="right",n.init=function(b){if(n.single=b,n.name=c.eName||c[n.directiveName],!c[n.directiveName])throw"You should provide value for `"+n.directiveName+"` in editable element!";l=e(c[n.directiveName]),n.single?n.buttons=n.attrs.buttons||h.buttons:n.buttons="no",c.eName&&n.scope.$watch("$data",function(a){n.scope.$form.$data[c.eName]=a}),c.onshow&&(n.onshow=function(){return n.catchError(e(c.onshow)(a))}),c.onhide&&(n.onhide=function(){return e(c.onhide)(a)}),c.oncancel&&(n.oncancel=function(){return e(c.oncancel)(a)}),c.onbeforesave&&(n.onbeforesave=function(){return n.catchError(e(c.onbeforesave)(a))}),c.onaftersave&&(n.onaftersave=function(){return n.catchError(e(c.onaftersave)(a))}),a.$parent.$watch(c[n.directiveName],function(a,b){n.setLocalValue(),n.handleEmpty()})},n.render=function(){var a=n.theme;n.inputEl=angular.element(n.inputTpl),n.controlsEl=angular.element(a.controlsTpl),n.controlsEl.append(n.inputEl),"no"!==n.buttons&&(n.buttonsEl=angular.element(a.buttonsTpl),n.submitEl=angular.element(a.submitTpl),n.resetEl=angular.element(a.resetTpl),n.cancelEl=angular.element(a.cancelTpl),n.submitEl.attr("title",h.submitButtonTitle),n.submitEl.attr("aria-label",h.submitButtonAriaLabel),n.cancelEl.attr("title",h.cancelButtonTitle),n.cancelEl.attr("aria-label",h.cancelButtonAriaLabel),n.resetEl.attr("title",h.clearButtonTitle),n.resetEl.attr("aria-label",h.clearButtonAriaLabel),n.icon_set&&(n.submitEl.find("span").addClass(n.icon_set.ok),n.cancelEl.find("span").addClass(n.icon_set.cancel),n.resetEl.find("span").addClass(n.icon_set.clear)),n.buttonsEl.append(n.submitEl).append(n.cancelEl),h.displayClearButton&&n.buttonsEl.append(n.resetEl),n.controlsEl.append(n.buttonsEl),n.inputEl.addClass("editable-has-buttons")),n.errorEl=angular.element(a.errorTpl),n.controlsEl.append(n.errorEl),n.editorEl=angular.element(n.single?a.formTpl:a.noformTpl),n.editorEl.append(n.controlsEl);for(var d in c.$attr)if(!(d.length<=1)){var e=!1,f=d.substring(1,2);if("e"===d.substring(0,1)&&f===f.toUpperCase()&&(e=d.substring(1),"Form"!==e&&"NgSubmit"!==e)){var g=e.substring(0,1),i=e.substring(1,2);e=i===i.toUpperCase()&&g===g.toUpperCase()?g.toLowerCase()+"-"+b.camelToDash(e.substring(1)):g.toLowerCase()+b.camelToDash(e.substring(1));var j="value"!==e&&""===c[d]?e:c[d];n.inputEl.attr(e,j)}}n.inputEl.addClass("editable-input"),n.inputEl.attr("ng-model","$parent.$data"),n.editorEl.addClass(b.camelToDash(n.directiveName)),n.single&&(n.editorEl.attr("editable-form","$form"),n.editorEl.attr("blur",n.attrs.blur||("no"===n.buttons?"cancel":h.blurElem))),angular.isFunction(a.postrender)&&a.postrender.call(n)},n.setLocalValue=function(){n.scope.$data=n.useCopy?angular.copy(l(a.$parent)):l(a.$parent)};var o=null;n.show=function(){return n.setLocalValue(),n.render(),d.after(n.editorEl),o=a.$new(),j(n.editorEl)(o),n.addListeners(),d.addClass("editable-hide"),n.onshow()},n.hide=function(){return o.$destroy(),n.controlsEl.remove(),n.editorEl.remove(),d.removeClass("editable-hide"),n.onhide()},n.cancel=function(){n.oncancel()},n.addListeners=function(){n.inputEl.bind("keyup",function(a){if(n.single)switch(a.keyCode){case 27:n.scope.$apply(function(){n.scope.$form.$cancel()})}}),n.single&&"no"===n.buttons&&n.autosubmit(),n.editorEl.bind("click",function(a){a.which&&1!==a.which||n.scope.$form.$visible&&(n.scope.$form._clicked=!0)})},n.setWaiting=function(a){a?(m=!n.inputEl.attr("disabled")&&!n.inputEl.attr("ng-disabled")&&!n.inputEl.attr("ng-enabled"),m&&(n.inputEl.attr("disabled","disabled"),n.buttonsEl&&n.buttonsEl.find("button").attr("disabled","disabled"))):m&&(n.inputEl.removeAttr("disabled"),n.buttonsEl&&n.buttonsEl.find("button").removeAttr("disabled"))},n.activate=function(a,b){setTimeout(function(){var c=n.inputEl[0];"focus"===h.activate&&c.focus?(a&&(b=b||a,c.onfocus=function(){var c=this;setTimeout(function(){c.setSelectionRange(a,b)})}),"editableRadiolist"==n.directiveName||"editableChecklist"==n.directiveName||"editableBsdate"==n.directiveName||"editableTagsInput"==n.directiveName?c.querySelector(".ng-pristine").focus():c.focus()):"select"===h.activate&&(c.select?c.select():c.focus&&c.focus())},0)},n.setError=function(b){angular.isObject(b)||(a.$error=b,n.error=b)},n.catchError=function(a,b){return angular.isObject(a)&&b!==!0?k.when(a).then(angular.bind(this,function(a){this.catchError(a,!0)}),angular.bind(this,function(a){this.catchError(a,!0)})):b&&angular.isObject(a)&&a.status&&200!==a.status&&a.data&&angular.isString(a.data)?(this.setError(a.data),a=a.data):angular.isString(a)&&this.setError(a),a},n.save=function(){l.assign(a.$parent,n.useCopy?angular.copy(n.scope.$data):n.scope.$data)},n.handleEmpty=function(){var b=l(a.$parent),c=null===b||void 0===b||""===b||angular.isArray(b)&&0===b.length;d.toggleClass("editable-empty",c)},n.autosubmit=angular.noop,n.onshow=angular.noop,n.onhide=angular.noop,n.oncancel=angular.noop,n.onbeforesave=angular.noop,n.onaftersave=angular.noop}return c.$inject=["$scope","$attrs","$element","$parse","editableThemes","editableIcons","editableOptions","$rootScope","$compile","$q"],c}]),angular.module("xeditable").factory("editableDirectiveFactory",["$parse","$compile","editableThemes","$rootScope","$document","editableController","editableFormController","editableOptions",function(a,b,c,d,e,f,g,h){return function(b){return{restrict:"A",scope:!0,require:[b.directiveName,"?^form"],controller:f,link:function(c,f,i,j){var k,l=j[0],m=!1;if(j[1])k=j[1],m=void 0===i.eSingle;else if(i.eForm){var n=a(i.eForm)(c);if(n)k=n,m=!0;else if(f&&"function"==typeof f.parents&&f.parents().last().find("form[name="+i.eForm+"]").length)k=null,m=!0;else for(var o=0;o<e[0].forms.length;o++)if(e[0].forms[o].name===i.eForm){k=null,m=!0;break}}angular.forEach(b,function(a,b){void 0!==l[b]&&(l.parent[b]=l[b])}),angular.extend(l,b);var p=function(){return angular.isDefined(i.editDisabled)?c.$eval(i.editDisabled):h.isDisabled};if(l.init(!m),c.$editable=l,f.addClass("editable"),m)if(k){if(c.$form=k,!c.$form.$addEditable)throw"Form with editable elements should have `editable-form` attribute.";c.$form.$addEditable(l)}else d.$$editableBuffer=d.$$editableBuffer||{},d.$$editableBuffer[i.eForm]=d.$$editableBuffer[i.eForm]||[],d.$$editableBuffer[i.eForm].push(l),c.$form=null;else c.$form=g(),c.$form.$addEditable(l),i.eForm&&(a(i.eForm).assign||angular.noop)(c.$parent,c.$form),(!i.eForm||i.eClickable)&&(f.addClass("editable-click"),f.bind(h.activationEvent,function(a){a.preventDefault(),a.editable=l,p()||c.$apply(function(){c.$form.$show()})}))}}}}]),angular.module("xeditable").factory("editableFormController",["$parse","$document","$rootScope","editablePromiseCollection","editableUtils",function(a,b,c,d,e){var f=[],g=function(a,b){if(b==a)return!0;for(var c=b.parentNode;null!==c;){if(c==a)return!0;c=c.parentNode}return!1},h=function(a,b){var c=!0,d=a.$editables;return angular.forEach(d,function(a){var d=a.editorEl[0];g(d,b.target)&&(c=!1)}),c};b.bind("click",function(a){if(!a.which||1===a.which){for(var b=[],d=[],e=0;e<f.length;e++)f[e]._clicked?f[e]._clicked=!1:f[e].$waiting||("cancel"===f[e]._blur&&h(f[e],a)&&b.push(f[e]),"submit"===f[e]._blur&&h(f[e],a)&&d.push(f[e]));(b.length||d.length)&&c.$apply(function(){angular.forEach(b,function(a){a.$cancel()}),angular.forEach(d,function(a){a.$submit()})})}}),c.$on("closeEdit",function(){for(var a=0;a<f.length;a++)f[a].$hide()});var i={$addEditable:function(a){this.$editables.push(a),a.elem.bind("$destroy",angular.bind(this,this.$removeEditable,a)),a.scope.$form||(a.scope.$form=this),this.$visible&&a.catchError(a.show()),a.catchError(a.setWaiting(this.$waiting))},$removeEditable:function(a){for(var b=0;b<this.$editables.length;b++)if(this.$editables[b]===a)return void this.$editables.splice(b,1)},$show:function(){if(!this.$visible){this.$visible=!0;var a=d();a.when(this.$onshow()),this.$setError(null,""),angular.forEach(this.$editables,function(b){a.when(b.show())}),a.then({onWait:angular.bind(this,this.$setWaiting),onTrue:angular.bind(this,this.$activate),onFalse:angular.bind(this,this.$activate),onString:angular.bind(this,this.$activate)}),setTimeout(angular.bind(this,function(){this._clicked=!1,-1===e.indexOf(f,this)&&f.push(this)}),0)}},$activate:function(a){var b;if(this.$editables.length){if(angular.isString(a))for(b=0;b<this.$editables.length;b++)if(this.$editables[b].name===a)return void this.$editables[b].activate();for(b=0;b<this.$editables.length;b++)if(this.$editables[b].error)return void this.$editables[b].activate();this.$editables[0].activate(this.$editables[0].elem[0].selectionStart,this.$editables[0].elem[0].selectionEnd)}},$hide:function(){this.$visible&&(this.$visible=!1,this.$onhide(),angular.forEach(this.$editables,function(a){a.hide()}),e.arrayRemove(f,this))},$cancel:function(){this.$visible&&(this.$oncancel(),angular.forEach(this.$editables,function(a){a.cancel()}),this.$hide())},$setWaiting:function(a){this.$waiting=!!a,angular.forEach(this.$editables,function(b){b.setWaiting(!!a)})},$setError:function(a,b){angular.forEach(this.$editables,function(c){a&&c.name!==a||c.setError(b)})},$submit:function(){function a(a){var b=d();b.when(this.$onbeforesave()),b.then({onWait:angular.bind(this,this.$setWaiting),onTrue:a?angular.bind(this,this.$save):angular.bind(this,this.$hide),onFalse:angular.bind(this,this.$hide),onString:angular.bind(this,this.$activate)})}if(!this.$waiting){this.$setError(null,"");var b=d();angular.forEach(this.$editables,function(a){b.when(a.onbeforesave())}),b.then({onWait:angular.bind(this,this.$setWaiting),onTrue:angular.bind(this,a,!0),onFalse:angular.bind(this,a,!1),onString:angular.bind(this,this.$activate)})}},$save:function(){angular.forEach(this.$editables,function(a){a.save()});var a=d();a.when(this.$onaftersave()),angular.forEach(this.$editables,function(b){a.when(b.onaftersave())}),a.then({onWait:angular.bind(this,this.$setWaiting),onTrue:angular.bind(this,this.$hide),onFalse:angular.bind(this,this.$hide),onString:angular.bind(this,this.$activate)})},$onshow:angular.noop,$oncancel:angular.noop,$onhide:angular.noop,$onbeforesave:angular.noop,$onaftersave:angular.noop};return function(){return angular.extend({$editables:[],$visible:!1,$waiting:!1,$data:{},_clicked:!1,_blur:null},i)}}]),angular.module("xeditable").directive("editableForm",["$rootScope","$parse","editableFormController","editableOptions",function(a,b,c,d){return{restrict:"A",require:["form"],compile:function(){return{pre:function(b,d,e,f){var g,h=f[0];e.editableForm?b[e.editableForm]&&b[e.editableForm].$show?(g=b[e.editableForm],angular.extend(h,g)):(g=c(),b[e.editableForm]=g,angular.extend(g,h)):(g=c(),angular.extend(h,g));var i=a.$$editableBuffer,j=h.$name;j&&i&&i[j]&&(angular.forEach(i[j],function(a){g.$addEditable(a)}),delete i[j])},post:function(a,c,e,f){var g;g=e.editableForm&&a[e.editableForm]&&a[e.editableForm].$show?a[e.editableForm]:f[0],e.onshow&&(g.$onshow=angular.bind(g,b(e.onshow),a)),e.onhide&&(g.$onhide=angular.bind(g,b(e.onhide),a)),e.oncancel&&(g.$oncancel=angular.bind(g,b(e.oncancel),a)),e.shown&&b(e.shown)(a)&&g.$show(),g._blur=e.blur||d.blurForm,e.ngSubmit||e.submit||(e.onbeforesave&&(g.$onbeforesave=function(){return b(e.onbeforesave)(a,{$data:g.$data})}),e.onaftersave&&(g.$onaftersave=function(){return b(e.onaftersave)(a,{$data:g.$data})}),c.bind("submit",function(b){b.preventDefault(),a.$apply(function(){g.$submit()})})),c.bind("click",function(a){a.which&&1!==a.which||g.$visible&&(g._clicked=!0)})}}}}}]),angular.module("xeditable").factory("editablePromiseCollection",["$q",function(a){function b(){return{promises:[],hasFalse:!1,hasString:!1,when:function(b,c){if(b===!1)this.hasFalse=!0;else if(!c&&angular.isObject(b))this.promises.push(a.when(b));else{if(!angular.isString(b))return;this.hasString=!0}},then:function(b){function c(){h.hasString||h.hasFalse?!h.hasString&&h.hasFalse?e():f():d()}b=b||{};var d=b.onTrue||angular.noop,e=b.onFalse||angular.noop,f=b.onString||angular.noop,g=b.onWait||angular.noop,h=this;this.promises.length?(g(!0),a.all(this.promises).then(function(a){g(!1),angular.forEach(a,function(a){h.when(a,!0)}),c()},function(a){g(!1),f()})):c()}}}return b}]),angular.module("xeditable").factory("editableUtils",[function(){return{indexOf:function(a,b){if(a.indexOf)return a.indexOf(b);for(var c=0;c<a.length;c++)if(b===a[c])return c;return-1},arrayRemove:function(a,b){var c=this.indexOf(a,b);return c>=0&&a.splice(c,1),b},camelToDash:function(a){var b=/[A-Z]/g;return a.replace(b,function(a,b){return(b?"-":"")+a.toLowerCase()})},dashToCamel:function(a){var b=/([\:\-\_]+(.))/g,c=/^moz([A-Z])/;return a.replace(b,function(a,b,c,d){return d?c.toUpperCase():c}).replace(c,"Moz$1")},rename:function(a,b){if(b[0]&&b[0].attributes){var c=angular.element("<"+a+"/>");c.html(b.html());for(var d=b[0].attributes,e=0;e<d.length;++e)c.attr(d.item(e).nodeName,d.item(e).value);return c}}}}]),angular.module("xeditable").factory("editableNgOptionsParser",[function(){function a(a){var c;if(!(c=a.match(b)))throw"ng-options parse error";var d,e=c[2]||c[1],f=c[4]||c[6],g=c[5],h=(c[3]||"",c[2]?c[1]:f),i=c[7],j=c[8],k=j?c[8]:null;return void 0===g?(d=f+" in "+i,void 0!==j&&(d+=" track by "+k)):d="("+g+", "+f+") in "+i,{ngRepeat:d,locals:{valueName:f,keyName:g,valueFn:h,displayFn:e}}}var b=/^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/;return a}]),angular.module("xeditable").factory("editableCombodate",[function(){function a(a,b){if(this.$element=angular.element(a),"INPUT"!=this.$element[0].nodeName)throw"Combodate should be applied to INPUT element";var c=(new Date).getFullYear();this.defaults={format:"YYYY-MM-DD HH:mm",template:"D / MMM / YYYY   H : mm",value:null,minYear:1970,maxYear:c,yearDescending:!0,minuteStep:5,secondStep:1,firstItem:"empty",errorClass:null,customClass:"",roundTime:!0,smartDays:!0},this.options=angular.extend({},this.defaults,b),this.init()}return a.prototype={constructor:a,init:function(){if(this.map={day:["D","date"],month:["M","month"],year:["Y","year"],hour:["[Hh]","hours"],minute:["m","minutes"],second:["s","seconds"],ampm:["[Aa]",""]},this.$widget=angular.element('<span class="combodate"></span>').html(this.getTemplate()),this.initCombos(),this.options.smartDays){var a=this;this.$widget.find("select").bind("change",function(b){(angular.element(b.target).hasClass("month")||angular.element(b.target).hasClass("year"))&&a.fillCombo("day")})}this.$widget.find("select").css("width","auto"),this.$element.css("display","none").after(this.$widget),this.setValue(this.$element.val()||this.options.value)},getTemplate:function(){var a=this.options.template,b=this.options.customClass;return angular.forEach(this.map,function(b,c){b=b[0];var d=new RegExp(b+"+"),e=b.length>1?b.substring(1,2):b;a=a.replace(d,"{"+e+"}")}),a=a.replace(/ /g,"&nbsp;"),angular.forEach(this.map,function(c,d){c=c[0];var e=c.length>1?c.substring(1,2):c;a=a.replace("{"+e+"}",'<select class="'+d+" "+b+'"></select>')}),a},initCombos:function(){for(var a in this.map){var b=this.$widget[0].querySelectorAll("."+a);this["$"+a]=b.length?angular.element(b):null,this.fillCombo(a)}},fillCombo:function(a){var b=this["$"+a];if(b){var c="fill"+a.charAt(0).toUpperCase()+a.slice(1),d=this[c](),e=b.val();b.html("");for(var f=0;f<d.length;f++)b.append('<option value="'+d[f][0]+'">'+d[f][1]+"</option>");b.val(e)}},fillCommon:function(a){var b,c=[];if("name"===this.options.firstItem){b=moment.relativeTime||moment.langData()._relativeTime;var d="function"==typeof b[a]?b[a](1,!0,a,!1):b[a];d=d.split(" ").reverse()[0],c.push(["",d])}else"empty"===this.options.firstItem&&c.push(["",""]);return c},fillDay:function(){var a,b,c=this.fillCommon("d"),d=-1!==this.options.template.indexOf("DD"),e=31;if(this.options.smartDays&&this.$month&&this.$year){var f=parseInt(this.$month.val(),10),g=parseInt(this.$year.val(),10);isNaN(f)||isNaN(g)||(e=moment([g,f]).daysInMonth())}for(b=1;e>=b;b++)a=d?this.leadZero(b):b,c.push([b,a]);return c},fillMonth:function(){var a,b,c=this.fillCommon("M"),d=-1!==this.options.template.indexOf("MMMM"),e=-1!==this.options.template.indexOf("MMM"),f=-1!==this.options.template.indexOf("MM");for(b=0;11>=b;b++)a=d?moment().date(1).month(b).format("MMMM"):e?moment().date(1).month(b).format("MMM"):f?this.leadZero(b+1):b+1,c.push([b,a]);return c},fillYear:function(){var a,b,c=[],d=-1!==this.options.template.indexOf("YYYY");for(b=this.options.maxYear;b>=this.options.minYear;b--)a=d?b:(b+"").substring(2),c[this.options.yearDescending?"push":"unshift"]([b,a]);return c=this.fillCommon("y").concat(c)},fillHour:function(){var a,b,c=this.fillCommon("h"),d=-1!==this.options.template.indexOf("h"),e=(-1!==this.options.template.indexOf("H"),-1!==this.options.template.toLowerCase().indexOf("hh")),f=d?1:0,g=d?12:23;for(b=f;g>=b;b++)a=e?this.leadZero(b):b,c.push([b,a]);return c},fillMinute:function(){var a,b,c=this.fillCommon("m"),d=-1!==this.options.template.indexOf("mm");for(b=0;59>=b;b+=this.options.minuteStep)a=d?this.leadZero(b):b,c.push([b,a]);return c},fillSecond:function(){var a,b,c=this.fillCommon("s"),d=-1!==this.options.template.indexOf("ss");for(b=0;59>=b;b+=this.options.secondStep)a=d?this.leadZero(b):b,c.push([b,a]);return c},fillAmpm:function(){var a=-1!==this.options.template.indexOf("a"),b=(-1!==this.options.template.indexOf("A"),[["am",a?"am":"AM"],["pm",a?"pm":"PM"]]);return b},getValue:function(a){var b,c={},d=this,e=!1;return angular.forEach(this.map,function(a,b){if("ampm"!==b){var f="day"===b?1:0;return c[b]=d["$"+b]?parseInt(d["$"+b].val(),10):f,isNaN(c[b])?(e=!0,!1):void 0}}),e?"":(this.$ampm&&(12===c.hour?c.hour="am"===this.$ampm.val()?0:12:c.hour="am"===this.$ampm.val()?c.hour:c.hour+12),b=moment([c.year,c.month,c.day,c.hour,c.minute,c.second]),this.highlight(b),a=void 0===a?this.options.format:a,null===a?b.isValid()?b:null:b.isValid()?b.format(a):"")},setValue:function(a){function b(a,b){var c={};return angular.forEach(a.children("option"),function(a,d){var e=angular.element(a).attr("value");if(""!==e){var f=Math.abs(e-b);("undefined"==typeof c.distance||f<c.distance)&&(c={value:e,distance:f})}}),c.value}if(a){var c="string"==typeof a?moment(a,this.options.format,!0):moment(a),d=this,e={};c.isValid()&&(angular.forEach(this.map,function(a,b){"ampm"!==b&&(e[b]=c[a[1]]())}),this.$ampm&&(e.hour>=12?(e.ampm="pm",e.hour>12&&(e.hour-=12)):(e.ampm="am",0===e.hour&&(e.hour=12))),angular.forEach(e,function(a,c){d["$"+c]&&("minute"===c&&d.options.minuteStep>1&&d.options.roundTime&&(a=b(d["$"+c],a)),"second"===c&&d.options.secondStep>1&&d.options.roundTime&&(a=b(d["$"+c],a)),d["$"+c].val(a))}),this.options.smartDays&&this.fillCombo("day"),this.$element.val(c.format(this.options.format)).triggerHandler("change"))}},highlight:function(a){a.isValid()?this.options.errorClass?this.$widget.removeClass(this.options.errorClass):this.$widget.find("select").css("border-color",this.borderColor):this.options.errorClass?this.$widget.addClass(this.options.errorClass):(this.borderColor||(this.borderColor=this.$widget.find("select").css("border-color")),this.$widget.find("select").css("border-color","red"))},leadZero:function(a){return 9>=a?"0"+a:a},destroy:function(){this.$widget.remove(),this.$element.removeData("combodate").show()}},{getInstance:function(b,c){return new a(b,c)}}}]),angular.module("xeditable").factory("editableIcons",function(){var a={"default":{bs2:{ok:"icon-ok icon-white",cancel:"icon-remove",clear:"icon-trash"},bs3:{ok:"glyphicon glyphicon-ok",cancel:"glyphicon glyphicon-remove",clear:"glyphicon glyphicon-trash"}},external:{"font-awesome":{ok:"fa fa-check",cancel:"fa fa-times",clear:"fa fa-trash"}}};return a}),angular.module("xeditable").factory("editableThemes",function(){var a={"default":{formTpl:'<form class="editable-wrap"></form>',noformTpl:'<span class="editable-wrap"></span>',controlsTpl:'<span class="editable-controls"></span>',inputTpl:"",errorTpl:'<div class="editable-error" data-ng-if="$error" data-ng-bind="$error"></div>',buttonsTpl:'<span class="editable-buttons"></span>',submitTpl:'<button type="submit">save</button>',cancelTpl:'<button type="button" ng-click="$form.$cancel()">cancel</button>',resetTpl:'<button type="reset">clear</button>'},bs2:{formTpl:'<form class="form-inline editable-wrap" role="form"></form>',noformTpl:'<span class="editable-wrap"></span>',controlsTpl:'<div class="editable-controls controls control-group" ng-class="{\'error\': $error}"></div>',inputTpl:"",errorTpl:'<div class="editable-error help-block" data-ng-if="$error" data-ng-bind="$error"></div>',buttonsTpl:'<span class="editable-buttons"></span>',submitTpl:'<button type="submit" class="btn btn-primary"><span></span></button>',cancelTpl:'<button type="button" class="btn" ng-click="$form.$cancel()"><span></span></button>',resetTpl:'<button type="reset" class="btn btn-danger">clear</button>'},bs3:{formTpl:'<form class="form-inline editable-wrap" role="form"></form>',noformTpl:'<span class="editable-wrap"></span>',
controlsTpl:'<div class="editable-controls form-group" ng-class="{\'has-error\': $error}"></div>',inputTpl:"",errorTpl:'<div class="editable-error help-block" data-ng-if="$error" data-ng-bind="$error"></div>',buttonsTpl:'<span class="editable-buttons"></span>',submitTpl:'<button type="submit" class="btn btn-primary"><span></span></button>',cancelTpl:'<button type="button" class="btn btn-default" ng-click="$form.$cancel()"><span></span></button>',resetTpl:'<button type="reset" class="btn btn-danger">clear</button>',buttonsClass:"",inputClass:"",postrender:function(){switch(this.directiveName){case"editableText":case"editableSelect":case"editableTextarea":case"editableEmail":case"editableTel":case"editableNumber":case"editableUrl":case"editableSearch":case"editableDate":case"editableDatetime":case"editableBsdate":case"editableTime":case"editableMonth":case"editableWeek":case"editablePassword":case"editableDatetimeLocal":if(this.inputEl.addClass("form-control"),this.theme.inputClass){if(this.inputEl.attr("multiple")&&("input-sm"===this.theme.inputClass||"input-lg"===this.theme.inputClass))break;this.inputEl.addClass(this.theme.inputClass)}break;case"editableCheckbox":this.editorEl.addClass("checkbox")}this.buttonsEl&&this.theme.buttonsClass&&this.buttonsEl.find("button").addClass(this.theme.buttonsClass)}},semantic:{formTpl:'<form class="editable-wrap ui form" ng-class="{\'error\': $error}" role="form"></form>',noformTpl:'<span class="editable-wrap"></span>',controlsTpl:'<div class="editable-controls ui fluid input" ng-class="{\'error\': $error}"></div>',inputTpl:"",errorTpl:'<div class="editable-error ui error message" data-ng-if="$error" data-ng-bind="$error"></div>',buttonsTpl:'<span class="mini ui buttons"></span>',submitTpl:'<button type="submit" class="ui primary button"><i class="ui check icon"></i></button>',cancelTpl:'<button type="button" class="ui button" ng-click="$form.$cancel()"><i class="ui cancel icon"></i></button>',resetTpl:'<button type="reset" class="ui button">clear</button>'}};return a});
                                                                                                         
//
// Copyright Kamil Pękala http://github.com/kamilkp
// Angular Virtual Scroll Repeat v1.1.7 2016/03/08
!function(a,b){"use strict";function c(){if("pageYOffset"in a)return{scrollTop:pageYOffset,scrollLeft:pageXOffset};var b,c,d=document,e=d.documentElement,f=d.body;return b=e.scrollLeft||f.scrollLeft||0,c=e.scrollTop||f.scrollTop||0,{scrollTop:c,scrollLeft:b}}function d(b,c){return b===a?"clientWidth"===c?a.innerWidth:a.innerHeight:b[c]}function e(b,d){return b===a?c()[d]:b[d]}function f(b,d,e){return b.getBoundingClientRect()[e?"left":"top"]-(d===a?0:d.getBoundingClientRect()[e?"left":"top"])+(d===a?c():d)[e?"scrollLeft":"scrollTop"]}var g=document.documentElement,h=g.matches?"matches":g.matchesSelector?"matchesSelector":g.webkitMatches?"webkitMatches":g.webkitMatchesSelector?"webkitMatchesSelector":g.msMatches?"msMatches":g.msMatchesSelector?"msMatchesSelector":g.mozMatches?"mozMatches":g.mozMatchesSelector?"mozMatchesSelector":null,i=b.element.prototype.closest||function(a){for(var c=this[0].parentNode;c!==document.documentElement&&null!=c&&!c[h](a);)c=c.parentNode;return c&&c[h](a)?b.element(c):b.element()},j=b.module("vs-repeat",[]).directive("vsRepeat",["$compile","$parse",function(c,g){return{restrict:"A",scope:!0,compile:function(h,j){var k,l,m,n,o,p,q=b.isDefined(j.vsRepeatContainer)?b.element(h[0].querySelector(j.vsRepeatContainer)):h,r=q.children().eq(0),s=r[0].outerHTML,t="$vs_collection",u=!1,v={vsRepeat:"elementSize",vsOffsetBefore:"offsetBefore",vsOffsetAfter:"offsetAfter",vsScrolledToEndOffset:"scrolledToEndOffset",vsScrolledToBeginningOffset:"scrolledToBeginningOffset",vsExcess:"excess"};if(r.attr("ng-repeat"))p="ng-repeat",k=r.attr("ng-repeat");else if(r.attr("data-ng-repeat"))p="data-ng-repeat",k=r.attr("data-ng-repeat");else if(r.attr("ng-repeat-start"))u=!0,p="ng-repeat-start",k=r.attr("ng-repeat-start");else{if(!r.attr("data-ng-repeat-start"))throw new Error("angular-vs-repeat: no ng-repeat directive on a child element");u=!0,p="data-ng-repeat-start",k=r.attr("data-ng-repeat-start")}if(l=/^\s*(\S+)\s+in\s+([\S\s]+?)(track\s+by\s+\S+)?$/.exec(k),m=l[1],n=l[2],o=l[3],u)for(var w=0,x=q.children().eq(0);null==x.attr("ng-repeat-end")&&null==x.attr("data-ng-repeat-end");)w++,x=q.children().eq(w),s+=x[0].outerHTML;return q.empty(),{pre:function(h,j,k){function l(){if(!G||G.length<1)h[t]=[],C=0,h.sizesCumulative=[0];else if(C=G.length,L){h.sizes=G.map(function(a){var c=h.$new(!1);b.extend(c,a),c[m]=a;var d=k.vsSize||k.vsSizeProperty?c.$eval(k.vsSize||k.vsSizeProperty):h.elementSize;return c.$destroy(),d});var a=0;h.sizesCumulative=h.sizes.map(function(b){var c=a;return a+=b,c}),h.sizesCumulative.push(a)}else q();y()}function q(){K&&h.$$postDigest(function(){if(D[0].offsetHeight||D[0].offsetWidth){for(var a=D.children(),b=0,c=!1,d=!1;b<a.length;){if(null!=a[b].attributes[p]||d){if(c||(h.elementSize=0),c=!0,a[b][P]&&(h.elementSize+=a[b][P]),!u)break;if(null!=a[b].attributes["ng-repeat-end"]||null!=a[b].attributes["data-ng-repeat-end"])break;d=!0}b++}c&&(y(),K=!1,h.$root&&!h.$root.$$phase&&h.$apply())}else var e=h.$watch(function(){(D[0].offsetHeight||D[0].offsetWidth)&&(e(),q())})})}function r(){var a="tr"===F?"":"min-";return H?a+"width":a+"height"}function w(){B()&&h.$digest()}function x(){void 0!==k.vsAutoresize&&(K=!0,q(),h.$root&&!h.$root.$$phase&&h.$apply()),B()&&h.$apply()}function y(){R=void 0,S=void 0,T=C,U=0,z(L?h.sizesCumulative[C]:h.elementSize*C),B(),h.$emit("vsRepeatReinitialized",h.startIndex,h.endIndex)}function z(a){h.totalSize=h.offsetBefore+a+h.offsetAfter}function A(){var a=d(M[0],O);a!==V&&(y(),h.$root&&!h.$root.$$phase&&h.$apply()),V=a}function B(){var a=e(M[0],Q),b=d(M[0],O),c=D[0]===M[0]?0:f(D[0],M[0],H),i=h.startIndex,j=h.endIndex;if(L){for(i=0;h.sizesCumulative[i]<a-h.offsetBefore-c;)i++;for(i>0&&i--,i=Math.max(Math.floor(i-h.excess/2),0),j=i;h.sizesCumulative[j]<a-h.offsetBefore-c+b;)j++;j=Math.min(Math.ceil(j+h.excess/2),C)}else i=Math.max(Math.floor((a-h.offsetBefore-c)/h.elementSize)-h.excess/2,0),j=Math.min(i+Math.ceil(b/h.elementSize)+h.excess,C);T=Math.min(i,T),U=Math.max(j,U),h.startIndex=N.latch?T:i,h.endIndex=N.latch?U:j,U<h.startIndex&&(h.startIndex=U);var l=!1;if(null==R?l=!0:null==S&&(l=!0),l||(N.hunked?Math.abs(h.startIndex-R)>=h.excess/2||0===h.startIndex&&0!==R?l=!0:(Math.abs(h.endIndex-S)>=h.excess/2||h.endIndex===C&&S!==C)&&(l=!0):l=h.startIndex!==R||h.endIndex!==S),l){h[t]=G.slice(h.startIndex,h.endIndex),h.$emit("vsRepeatInnerCollectionUpdated",h.startIndex,h.endIndex,R,S);var m;k.vsScrolledToEnd&&(m=G.length-(h.scrolledToEndOffset||0),(h.endIndex>=m&&S<m||G.length&&h.endIndex===G.length)&&h.$eval(k.vsScrolledToEnd)),k.vsScrolledToBeginning&&(m=h.scrolledToBeginningOffset||0,h.startIndex<=m&&R>h.startIndex&&h.$eval(k.vsScrolledToBeginning)),R=h.startIndex,S=h.endIndex;var n=L?"(sizesCumulative[$index + startIndex] + offsetBefore)":"(($index + startIndex) * elementSize + offsetBefore)",o=g(n),p=o(h,{$index:0}),q=o(h,{$index:h[t].length}),s=h.totalSize;I.css(r(),p+"px"),J.css(r(),s-q+"px")}return l}var C,D=b.isDefined(k.vsRepeatContainer)?b.element(j[0].querySelector(k.vsRepeatContainer)):j,E=b.element(s),F=E[0].tagName.toLowerCase(),G=[],H=void 0!==k.vsHorizontal,I=b.element("<"+F+' class="vs-repeat-before-content"></'+F+">"),J=b.element("<"+F+' class="vs-repeat-after-content"></'+F+">"),K=!k.vsRepeat,L=!!k.vsSize||!!k.vsSizeProperty,M=k.vsScrollParent?"window"===k.vsScrollParent?b.element(a):i.call(D,k.vsScrollParent):D,N="vsOptions"in k?h.$eval(k.vsOptions):{},O=H?"clientWidth":"clientHeight",P=H?"offsetWidth":"offsetHeight",Q=H?"scrollLeft":"scrollTop";if(h.totalSize=0,!("vsSize"in k)&&"vsSizeProperty"in k&&console.warn("vs-size-property attribute is deprecated. Please use vs-size attribute which also accepts angular expressions."),0===M.length)throw"Specified scroll parent selector did not match any element";h.$scrollParent=M,L&&(h.sizesCumulative=[]),h.elementSize=+k.vsRepeat||d(M[0],O)||50,h.offsetBefore=0,h.offsetAfter=0,h.excess=2,H?(I.css("height","100%"),J.css("height","100%")):(I.css("width","100%"),J.css("width","100%")),Object.keys(v).forEach(function(a){k[a]&&k.$observe(a,function(b){h[v[a]]=+b,y()})}),h.$watchCollection(n,function(a){G=a||[],l()}),E.eq(0).attr(p,m+" in "+t+(o?" "+o:"")),E.addClass("vs-repeat-repeated-element"),D.append(I),D.append(E),c(E)(h),D.append(J),h.startIndex=0,h.endIndex=0,M.on("scroll",w),b.element(a).on("resize",x),h.$on("$destroy",function(){b.element(a).off("resize",x),M.off("scroll",w)}),h.$on("vsRepeatTrigger",l),h.$on("vsRepeatResize",function(){K=!0,q()});var R,S,T,U;h.$on("vsRenderAll",function(){N.latch&&setTimeout(function(){var a=C;U=Math.max(a,U),h.endIndex=N.latch?U:a,h[t]=G.slice(h.startIndex,h.endIndex),S=h.endIndex,h.$$postDigest(function(){I.css(r(),0),J.css(r(),0)}),h.$apply(function(){h.$emit("vsRenderAllDone")})})});var V;h.$watch(function(){"function"==typeof a.requestAnimationFrame?a.requestAnimationFrame(A):A()})}}}}}]);"undefined"!=typeof module&&module.exports&&(module.exports=j.name)}(window,window.angular);

//Angular Virtual Scroll Repeat v2.0.9
//function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function _extends(){return(_extends=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function _defineProperty(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function _sliceIterator(e,t){var n=[],r=!0,o=!1,a=void 0;try{for(var s,i=e[Symbol.iterator]();!(r=(s=i.next()).done)&&(n.push(s.value),!t||n.length!==t);r=!0);}catch(e){o=!0,a=e}finally{try{r||null==i.return||i.return()}finally{if(o)throw a}}return n}function _slicedToArray(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return _sliceIterator(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}!function(Y,U){var X=U.element.prototype.closest;if(!X){var r=["matches","matchesSelector","webkitMatches","webkitMatchesSelector","msMatches","msMatchesSelector","mozMatches","mozMatchesSelector"].reduce(function(e,t){var n;return null!==(n=e)&&void 0!==n?n:t in document.documentElement?t:null},null);X=function(e){for(var t,n=this[0].parentNode;n!==document.documentElement&&null!=n&&!n[r](e);)n=n.parentNode;return(null===(t=n)||void 0===t?void 0:t[r](e))?U.element(n):U.element()}}function G(){var e,t,n,r;return"pageYOffset"in Y?{scrollTop:Y.pageYOffset,scrollLeft:Y.pageXOffset}:{scrollTop:null!==(e=null!==(t=document.documentElement.scrollTop)&&void 0!==t?t:document.body.scrollTop)&&void 0!==e?e:0,scrollLeft:null!==(n=null!==(r=document.documentElement.scrollLeft)&&void 0!==r?r:document.body.scrollLeft)&&void 0!==n?n:0}}function K(e,t){return e===Y?"clientWidth"===t?Y.innerWidth:Y.innerHeight:e[t]}function c(e,t){var n,r;n=t,r="".concat(e," attribute is deprecated. Pass the options object to vs-repeat attribute instead https://github.com/kamilkp/angular-vs-repeat#options"),console.warn("vs-repeat deprecation: ".concat(r),n[0])}var Q={latch:!1,preserveLatchOnRefresh:!1,container:null,scrollParent:null,size:null,offsetBefore:0,offsetAfter:0,scrolledToBeginning:U.noop,scrolledToEnd:U.noop,scrolledToBeginningOffset:0,scrolledToEndOffset:0,scrollMargin:0,horizontal:!1,autoresize:!1,hunked:!1,hunkSize:0},e=U.module("vs-repeat",[]).directive("vsRepeat",["$compile","$parse",function(F,J){return{restrict:"A",scope:!0,compile:function(t,n){var e="vsRepeatContainer"in n?U.element(t[0].querySelector(n.vsRepeatContainer)):t,r=e.children(),o=r.eq(0),L=o[0].outerHTML,q="$vs_collection";["vsSize","vsScrollParent","vsSizeProperty","vsHorizontal","vsOffsetBefore","vsOffsetAfter","vsScrolledToEndOffset","vsScrolledToBeginningOffset","vsExcess","vsScrollMargin"].forEach(function(e){e in n&&c(e,t)});var a=_slicedToArray(function(e){for(var t=["ng-repeat","data-ng-repeat","ng-repeat-start","data-ng-repeat-start"],n=0;n<t.length;n++){var r=t[n];if(e.attr(r))return[r,e.attr(r),0<=r.indexOf("-start")]}throw new Error("angular-vs-repeat: no ng-repeat directive on a child element")}(o),3),H=a[0],s=a[1],W=a[2],i=_slicedToArray(/^\s*(\S+)\s+in\s+([\S\s]+?)(track\s+by\s+\S+)?$/.exec(s),4),j=i[1],N=i[2],D=i[3];if(W)for(var l=0,d=r.eq(l);null==d.attr("ng-repeat-end")&&null==d.attr("data-ng-repeat-end");)l++,d=r.eq(l),L+=d[0].outerHTML;return e.empty(),{pre:function(g,m,e){var t;function n(e){if("number"==typeof e.size)e.getSize=function(){return e.size};else{var t=J(String(e.size));e.getSize=function(e){return t(g,_defineProperty({},j,e))}}}g.vsRepeat={options:_extends({},Q,null!==(t=g.$eval(e.vsRepeat))&&void 0!==t?t:{})};var R=g.vsRepeat.options;n(R);var x,z=U.isDefined(e.vsRepeatContainer)?U.element(m[0].querySelector(e.vsRepeatContainer)):m,r=U.element(L),o=r[0].tagName.toLowerCase(),y=[],$=U.element("<"+o+' class="vs-repeat-before-content"></'+o+">"),b=U.element("<"+o+' class="vs-repeat-after-content"></'+o+">"),I=null===R.size,w=R.scrollParent?"window"===R.scrollParent?U.element(Y):X.call(z,R.scrollParent):z,S=R.horizontal?"clientWidth":"clientHeight",a=R.horizontal?"offsetWidth":"offsetHeight",T=R.horizontal?"scrollWidth":"scrollHeight",O=R.horizontal?"scrollLeft":"scrollTop";if((g.vsRepeat.totalSize=0)===w.length)throw"Specified scroll parent selector did not match any element";if(g.vsRepeat.$scrollParent=w,g.vsRepeat.sizesCumulative=[],R.debug){var s="window"===R.scrollParent?U.element(document.body):w,i=U.element('<div class="vs-repeat-debug-element"></div>');i.css("position","window"===R.scrollParent?"fixed":"absolute"),s.append(i),g.$on("$destroy",function(){i.remove()})}var A,C,M,_,l,d=K(w[0],S)||50;function c(){!y||y.length<1?(g[q]=[],x=0,g.vsRepeat.sizesCumulative=[0]):(x=y.length,R.size?u():p()),h()}function u(){var n=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,e=y.map(function(e){var t;return null!==(t=n)&&void 0!==t?t:R.getSize(e)}),t=0;g.vsRepeat.sizesCumulative=[0].concat(_toConsumableArray(e.map(function(e){return t+=e})))}function p(){I?g.$$postDigest(function(){if(z[0].offsetHeight||z[0].offsetWidth){for(var e=z.children(),t=0,n=!1,r=!1;t<e.length;){if(null!=e[t].attributes[H]||r){if(n||(d=0),n=!0,e[t][a]&&(d+=e[t][a]),!W)break;if(null!=e[t].attributes["ng-repeat-end"]||null!=e[t].attributes["data-ng-repeat-end"])break;r=!0}t++}n&&(u(d),h(),I=!1,g.$root&&!g.$root.$$phase&&g.$digest())}else var o=g.$watch(function(){(z[0].offsetHeight||z[0].offsetWidth)&&(o(),p())})}):u(d)}function B(n){var r=R.horizontal?"width":"height";return["","min-","max-"].reduce(function(e,t){return e["".concat(t).concat(r)]=n,e},{})}function v(){var e=w[0][O];k()&&(g.$digest(),R._ensureScrollIntegrity&&(w[0][O]=e))}function f(){R.autoresize&&(I=!0,p(),g.$root&&!g.$root.$$phase&&g.$digest()),k()&&g.$digest()}function h(){var e;C=A=void 0,R.preserveLatchOnRefresh&&void 0!==M&&void 0!==_||(M=x,_=0),e=g.vsRepeat.sizesCumulative[x],g.vsRepeat.totalSize=R.offsetBefore+e+R.offsetAfter,k(),g.$emit("vsRepeatReinitialized",g.vsRepeat.startIndex,g.vsRepeat.endIndex)}function E(){var e=K(w[0],S);e!==l&&(h(),g.$root&&!g.$root.$$phase&&g.$digest()),l=e}function P(e,t){var n=2<arguments.length&&void 0!==arguments[2]?arguments[2]:0,r=3<arguments.length&&void 0!==arguments[3]?arguments[3]:e.length-1,o=4<arguments.length&&void 0!==arguments[4]?arguments[4]:1;if(e[n]===t)return[n,n,o];if(e[r]===t)return[r,r,o];if(1<r-n){var a=Math.floor((n+r)/2);return e[a]>t?P(e,t,n,a,o+1):P(e,t,a,r,o+1)}return[t>e[r]?r:n,t<e[n]?n:r,o]}function k(){var e,t,n=(e=w[0],t=O,e===Y?G()[t]:e[t]),r=K(w[0],S);R.debug&&(r/=2);var o,a,s,i=z[0]===w[0]?0:(o=z[0],a=w[0],s=R.horizontal,o.getBoundingClientRect()[s?"left":"top"]-(a===Y?0:a.getBoundingClientRect()[s?"left":"top"])+(a===Y?G():a)[s?"scrollLeft":"scrollTop"]),l=g.vsRepeat.startIndex,d=g.vsRepeat.endIndex;if(I&&!R.size)l=0,d=1;else{g.$$postDigest(function(){Y.requestAnimationFrame(function(){var e=g.vsRepeat.sizesCumulative[x],n=Y.getComputedStyle(z[0]),t=R.horizontal?["paddingLeft","paddingRight"]:["paddingTop","paddingBottom"],r=z[0][T]-t.reduce(function(e,t){return e+Number(n[t].slice(0,-2))},0);z[0][T]&&e!==r&&console.warn("vsRepeat: size mismatch. Expected size "+e+"px whereas actual size is "+r+"px. Fix vsSize on element:",m[0])})});var c=n-R.offsetBefore-i;l=_slicedToArray(P(g.vsRepeat.sizesCumulative,c-R.scrollMargin),1)[0],l=Math.max(l,0),d=_slicedToArray(P(g.vsRepeat.sizesCumulative,c+R.scrollMargin+r,l),2)[1],d=Math.min(d,x)}M=Math.min(l,M),_=Math.max(d,_),g.vsRepeat.startIndex=R.latch?M:l,g.vsRepeat.endIndex=R.latch?_:d,_<g.vsRepeat.startIndex&&(g.vsRepeat.startIndex=_);var u=!1;if(null==A?u=!0:null==C&&(u=!0),u||(R.hunked?Math.abs(g.vsRepeat.startIndex-A)>=R.hunkSize||0===g.vsRepeat.startIndex&&0!==A?u=!0:(Math.abs(g.vsRepeat.endIndex-C)>=R.hunkSize||g.vsRepeat.endIndex===x&&C!==x)&&(u=!0):u=g.vsRepeat.startIndex!==A||g.vsRepeat.endIndex!==C),u){var p;g[q]=y.slice(g.vsRepeat.startIndex,g.vsRepeat.endIndex),g.$emit("vsRepeatInnerCollectionUpdated",g.vsRepeat.startIndex,g.vsRepeat.endIndex,A,C),R.scrolledToEnd&&(p=y.length-R.scrolledToEndOffset,(g.vsRepeat.endIndex>=p&&C<p||y.length&&g.vsRepeat.endIndex===y.length)&&g.$eval(R.scrolledToEnd)),R.scrolledToBeginning&&(p=R.scrolledToBeginningOffset,g.vsRepeat.startIndex<=p&&A>g.vsRepeat.startIndex&&g.$eval(R.scrolledToBeginning)),A=g.vsRepeat.startIndex,C=g.vsRepeat.endIndex;var v=g.vsRepeat.sizesCumulative[g.vsRepeat.startIndex]+R.offsetBefore,f=g.vsRepeat.sizesCumulative[g.vsRepeat.startIndex+g[q].length]+R.offsetBefore,h=g.vsRepeat.totalSize;$.css(B(v+"px")),b.css(B(h-f+"px"))}return u}R.horizontal?($.css("height","100%"),b.css("height","100%")):($.css("width","100%"),b.css("width","100%")),e.vsRepeatOptions&&g.$watchCollection(e.vsRepeatOptions,function(e){var t=_extends({},R,e);JSON.stringify(t)!==JSON.stringify(R)&&(Object.assign(R,e),n(R),h())}),g.$watchCollection(N,function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[];y=e,c()}),r.eq(0).attr(H,j+" in "+q+(D?" "+D:"")),r.addClass("vs-repeat-repeated-element"),z.append($),z.append(r),F(r)(g),z.append(b),g.vsRepeat.startIndex=0,g.vsRepeat.endIndex=0,w.on("scroll",v),U.element(Y).on("resize",f),g.$on("$destroy",function(){U.element(Y).off("resize",f),w.off("scroll",v)}),g.$on("vsRepeatTrigger",c),g.$on("vsRepeatResize",function(){I=!0,p()}),g.$on("vsRenderAll",function(){R.latch&&(g.vsRepeat.endIndex!==x?setTimeout(function(){var e=x;_=Math.max(e,_),g.vsRepeat.endIndex=R.latch?_:e,g[q]=y.slice(g.vsRepeat.startIndex,g.vsRepeat.endIndex),C=g.vsRepeat.endIndex,$.css(B(0)),b.css(B(0)),g.$emit("vsRenderAllDone"),g.$root&&!g.$root.$$phase&&g.$digest()}):g.$emit("vsRenderAllDone"))}),g.$watch(function(){"function"==typeof Y.requestAnimationFrame?Y.requestAnimationFrame(E):E()})}}}}}]);U.element(document.head).append('<style id="angular-vs-repeat-style">\n\t  \t.vs-repeat-debug-element {\n        top: 50%;\n        left: 0;\n        right: 0;\n        height: 1px;\n        background: red;\n        z-index: 99999999;\n        box-shadow: 0 0 20px red;\n      }\n\n      .vs-repeat-debug-element + .vs-repeat-debug-element {\n        display: none;\n      }\n\n      .vs-repeat-before-content,\n      .vs-repeat-after-content {\n        border: none !important;\n        padding: 0 !important;\n      }\n    </style>'),"undefined"!=typeof module&&module.exports&&(module.exports=e.name)}(window,window.angular);

//Angular Virtual Scroll Repeat v2.0.7
//function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function _extends(){return(_extends=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function _defineProperty(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function _sliceIterator(e,t){var n=[],r=!0,a=!1,o=void 0;try{for(var s,i=e[Symbol.iterator]();!(r=(s=i.next()).done)&&(n.push(s.value),!t||n.length!==t);r=!0);}catch(e){a=!0,o=e}finally{try{r||null==i.return||i.return()}finally{if(a)throw o}}return n}function _slicedToArray(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return _sliceIterator(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}!function(Y,U){var X=U.element.prototype.closest;if(!X){var r=["matches","matchesSelector","webkitMatches","webkitMatchesSelector","msMatches","msMatchesSelector","mozMatches","mozMatchesSelector"].reduce(function(e,t){var n;return null!==(n=e)&&void 0!==n?n:t in document.documentElement?t:null},null);X=function(e){for(var t,n=this[0].parentNode;n!==document.documentElement&&null!=n&&!n[r](e);)n=n.parentNode;return(null===(t=n)||void 0===t?void 0:t[r](e))?U.element(n):U.element()}}function G(){var e,t,n,r;return"pageYOffset"in Y?{scrollTop:Y.pageYOffset,scrollLeft:Y.pageXOffset}:{scrollTop:null!==(e=null!==(t=document.documentElement.scrollTop)&&void 0!==t?t:document.body.scrollTop)&&void 0!==e?e:0,scrollLeft:null!==(n=null!==(r=document.documentElement.scrollLeft)&&void 0!==r?r:document.body.scrollLeft)&&void 0!==n?n:0}}function K(e,t){return e===Y?"clientWidth"===t?Y.innerWidth:Y.innerHeight:e[t]}function d(e){var t;t="".concat(e," attribute is deprecated. Pass the options object to vs-repeat attribute instead <link>."),console.warn("vs-repeat deprecation: ".concat(t))}var Q={latch:!1,container:null,scrollParent:null,size:null,offsetBefore:0,offsetAfter:0,scrolledToBeginning:U.noop,scrolledToEnd:U.noop,scrolledToBeginningOffset:0,scrolledToEndOffset:0,scrollMargin:0,horizontal:!1,autoresize:!1,hunked:!1,hunkSize:0},e=U.module("vs-repeat",[]).directive("vsRepeat",["$compile","$parse",function(F,J){return{restrict:"A",scope:!0,compile:function(e,t){var n="vsRepeatContainer"in t?U.element(e[0].querySelector(t.vsRepeatContainer)):e,r=n.children(),a=r.eq(0),H=a[0].outerHTML,L="$vs_collection";["vsSize","vsScrollParent","vsSizeProperty","vsHorizontal","vsOffsetBefore","vsOffsetAfter","vsScrolledToEndOffset","vsScrolledToBeginningOffset","vsExcess","vsScrollMargin"].forEach(function(e){e in t&&d(e)});var o=_slicedToArray(function(e){for(var t=["ng-repeat","data-ng-repeat","ng-repeat-start","data-ng-repeat-start"],n=0;n<t.length;n++){var r=t[n];if(e.attr(r))return[r,e.attr(r),0<=r.indexOf("-start")]}throw new Error("angular-vs-repeat: no ng-repeat directive on a child element")}(a),3),q=o[0],s=o[1],W=o[2],i=_slicedToArray(/^\s*(\S+)\s+in\s+([\S\s]+?)(track\s+by\s+\S+)?$/.exec(s),4),j=i[1],N=i[2],D=i[3];if(W)for(var l=0,c=r.eq(l);null==c.attr("ng-repeat-end")&&null==c.attr("data-ng-repeat-end");)l++,c=r.eq(l),H+=c[0].outerHTML;return n.empty(),{pre:function(m,t,e){var n;function r(e){if("number"==typeof e.size)e.getSize=function(){return e.size};else{var t=J(String(e.size));e.getSize=function(e){return t(m,_defineProperty({},j,e))}}}m.vsRepeat={options:_extends({},Q,null!==(n=m.$eval(e.vsRepeat))&&void 0!==n?n:{})};var g=m.vsRepeat.options;r(g);var R,x=U.isDefined(e.vsRepeatContainer)?U.element(t[0].querySelector(e.vsRepeatContainer)):t,a=U.element(H),o=a[0].tagName.toLowerCase(),y=[],z=U.element("<"+o+' class="vs-repeat-before-content"></'+o+">"),$=U.element("<"+o+' class="vs-repeat-after-content"></'+o+">"),b=null===g.size,I=g.scrollParent?"window"===g.scrollParent?U.element(Y):X.call(x,g.scrollParent):x,w=g.horizontal?"clientWidth":"clientHeight",s=g.horizontal?"offsetWidth":"offsetHeight",i=g.horizontal?"scrollWidth":"scrollHeight",S=g.horizontal?"scrollLeft":"scrollTop";if((m.vsRepeat.totalSize=0)===I.length)throw"Specified scroll parent selector did not match any element";if(m.vsRepeat.$scrollParent=I,m.vsRepeat.sizesCumulative=[],g.debug){var l="window"===g.scrollParent?U.element(document.body):I,c=U.element('<div class="vs-repeat-debug-element"></div>');c.css("position","window"===g.scrollParent?"fixed":"absolute"),l.append(c),m.$on("$destroy",function(){c.remove()})}var T,C,O,A,d,u=K(I[0],w)||50;function p(){!y||y.length<1?(m[L]=[],R=0,m.vsRepeat.sizesCumulative=[0]):(R=y.length,g.size?v():f()),E()}function v(){var n=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,e=y.map(function(e){var t;return null!==(t=n)&&void 0!==t?t:g.getSize(e)}),t=0;m.vsRepeat.sizesCumulative=[0].concat(_toConsumableArray(e.map(function(e){return t+=e})))}function f(){b?m.$$postDigest(function(){if(x[0].offsetHeight||x[0].offsetWidth){for(var e=x.children(),t=0,n=!1,r=!1;t<e.length;){if(null!=e[t].attributes[q]||r){if(n||(u=0),n=!0,e[t][s]&&(u+=e[t][s]),!W)break;if(null!=e[t].attributes["ng-repeat-end"]||null!=e[t].attributes["data-ng-repeat-end"])break;r=!0}t++}n&&(v(u),E(),b=!1,m.$root&&!m.$root.$$phase&&m.$apply())}else var a=m.$watch(function(){(x[0].offsetHeight||x[0].offsetWidth)&&(a(),f())})}):v(u)}function M(){var e="tr"===o?"":"min-";return g.horizontal?e+"width":e+"height"}function h(){if(k()){m.$digest();var e=m.vsRepeat.sizesCumulative[R];e!==x[0][i]&&console.warn("vsRepeat: size mismatch. Expected size "+e+"px whereas actual size is "+x[0][i]+"px. Fix vsSize on element:",t[0])}}function _(){g.autoresize&&(b=!0,f(),m.$root&&!m.$root.$$phase&&m.$apply()),k()&&m.$digest()}function E(){var e;C=T=void 0,O=R,A=0,e=m.vsRepeat.sizesCumulative[R],m.vsRepeat.totalSize=g.offsetBefore+e+g.offsetAfter,k(),m.$emit("vsRepeatReinitialized",m.vsRepeat.startIndex,m.vsRepeat.endIndex)}function B(){var e=K(I[0],w);e!==d&&(E(),m.$root&&!m.$root.$$phase&&m.$apply()),d=e}function P(e,t){var n=2<arguments.length&&void 0!==arguments[2]?arguments[2]:0,r=3<arguments.length&&void 0!==arguments[3]?arguments[3]:e.length-1,a=4<arguments.length&&void 0!==arguments[4]?arguments[4]:1;if(e[n]===t)return[n,n,a];if(e[r]===t)return[r,r,a];if(1<r-n){var o=Math.floor((n+r)/2);return e[o]>t?P(e,t,n,o,a+1):P(e,t,o,r,a+1)}return[t>e[r]?r:n,t<e[n]?n:r,a]}function k(){var e,t,n=(e=I[0],t=S,e===Y?G()[t]:e[t]),r=K(I[0],w);g.debug&&(r/=2);var a,o,s,i=x[0]===I[0]?0:(a=x[0],o=I[0],s=g.horizontal,a.getBoundingClientRect()[s?"left":"top"]-(o===Y?0:o.getBoundingClientRect()[s?"left":"top"])+(o===Y?G():o)[s?"scrollLeft":"scrollTop"]),l=m.vsRepeat.startIndex,c=m.vsRepeat.endIndex;if(b&&!g.size)l=0,c=1;else{var d=n-g.offsetBefore-i;l=_slicedToArray(P(m.vsRepeat.sizesCumulative,d-g.scrollMargin),1)[0],l=Math.max(l,0),c=_slicedToArray(P(m.vsRepeat.sizesCumulative,d+g.scrollMargin+r,l),2)[1],c=Math.min(c,R)}O=Math.min(l,O),A=Math.max(c,A),m.vsRepeat.startIndex=g.latch?O:l,m.vsRepeat.endIndex=g.latch?A:c,A<m.vsRepeat.startIndex&&(m.vsRepeat.startIndex=A);var u=!1;if(null==T?u=!0:null==C&&(u=!0),u||(g.hunked?Math.abs(m.vsRepeat.startIndex-T)>=g.hunkSize||0===m.vsRepeat.startIndex&&0!==T?u=!0:(Math.abs(m.vsRepeat.endIndex-C)>=g.hunkSize||m.vsRepeat.endIndex===R&&C!==R)&&(u=!0):u=m.vsRepeat.startIndex!==T||m.vsRepeat.endIndex!==C),u){var p;m[L]=y.slice(m.vsRepeat.startIndex,m.vsRepeat.endIndex),m.$emit("vsRepeatInnerCollectionUpdated",m.vsRepeat.startIndex,m.vsRepeat.endIndex,T,C),g.scrolledToEnd&&(p=y.length-g.scrolledToEndOffset,(m.vsRepeat.endIndex>=p&&C<p||y.length&&m.vsRepeat.endIndex===y.length)&&m.$eval(g.scrolledToEnd)),g.scrolledToBeginning&&(p=g.scrolledToBeginningOffset,m.vsRepeat.startIndex<=p&&T>m.vsRepeat.startIndex&&m.$eval(g.scrolledToBeginning)),T=m.vsRepeat.startIndex,C=m.vsRepeat.endIndex;var v=m.vsRepeat.sizesCumulative[m.vsRepeat.startIndex]+g.offsetBefore,f=m.vsRepeat.sizesCumulative[m.vsRepeat.startIndex+m[L].length]+g.offsetBefore,h=m.vsRepeat.totalSize;z.css(M(),v+"px"),$.css(M(),h-f+"px")}return u}g.horizontal?(z.css("height","100%"),$.css("height","100%")):(z.css("width","100%"),$.css("width","100%")),e.vsRepeatOptions&&m.$watchCollection(e.vsRepeatOptions,function(e){var t=_extends({},g,e);JSON.stringify(t)!==JSON.stringify(g)&&(Object.assign(g,e),r(g),E())}),m.$watchCollection(N,function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[];y=e,p()}),a.eq(0).attr(q,j+" in "+L+(D?" "+D:"")),a.addClass("vs-repeat-repeated-element"),x.append(z),x.append(a),F(a)(m),x.append($),m.vsRepeat.startIndex=0,m.vsRepeat.endIndex=0,I.on("scroll",h),U.element(Y).on("resize",_),m.$on("$destroy",function(){U.element(Y).off("resize",_),I.off("scroll",h)}),m.$on("vsRepeatTrigger",p),m.$on("vsRepeatResize",function(){b=!0,f()}),m.$on("vsRenderAll",function(){g.latch&&setTimeout(function(){var e=R;A=Math.max(e,A),m.vsRepeat.endIndex=g.latch?A:e,m[L]=y.slice(m.vsRepeat.startIndex,m.vsRepeat.endIndex),C=m.vsRepeat.endIndex,m.$$postDigest(function(){z.css(M(),0),$.css(M(),0)}),m.$apply(function(){m.$emit("vsRenderAllDone")})})}),m.$watch(function(){"function"==typeof Y.requestAnimationFrame?Y.requestAnimationFrame(B):B()})}}}}}]);U.element(document.head).append('<style id="angular-vs-repeat-style">\n\t  \t.vs-repeat-debug-element {\n        top: 50%;\n        left: 0;\n        right: 0;\n        height: 1px;\n        background: red;\n        z-index: 99999999;\n        box-shadow: 0 0 20px red;\n      }\n\n      .vs-repeat-debug-element + .vs-repeat-debug-element {\n        display: none;\n      }\n    </style>'),"undefined"!=typeof module&&module.exports&&(module.exports=e.name)}(window,window.angular);

//
// Copyright Kamil Pękala http://github.com/kamilkp
// Angular Virtual Scroll Repeat v1.1.11 2018/03/09
//!function(a,b){"use strict";function c(){if("pageYOffset"in a)return{scrollTop:pageYOffset,scrollLeft:pageXOffset};var b,c,d=document,e=d.documentElement,f=d.body;return b=e.scrollLeft||f.scrollLeft||0,c=e.scrollTop||f.scrollTop||0,{scrollTop:c,scrollLeft:b}}function d(b,c){return b===a?"clientWidth"===c?a.innerWidth:a.innerHeight:b[c]}function e(b,d){return b===a?c()[d]:b[d]}function f(b,d,e){return b.getBoundingClientRect()[e?"left":"top"]-(d===a?0:d.getBoundingClientRect()[e?"left":"top"])+(d===a?c():d)[e?"scrollLeft":"scrollTop"]}var g=document.documentElement,h=g.matches?"matches":g.matchesSelector?"matchesSelector":g.webkitMatches?"webkitMatches":g.webkitMatchesSelector?"webkitMatchesSelector":g.msMatches?"msMatches":g.msMatchesSelector?"msMatchesSelector":g.mozMatches?"mozMatches":g.mozMatchesSelector?"mozMatchesSelector":null,i=b.element.prototype.closest||function(a){for(var c=this[0].parentNode;c!==document.documentElement&&null!=c&&!c[h](a);)c=c.parentNode;return c&&c[h](a)?b.element(c):b.element()},j=b.module("vs-repeat",[]).directive("vsRepeat",["$compile","$parse",function(c,g){return{restrict:"A",scope:!0,compile:function(h,j){var k,l,m,n,o,p,q=b.isDefined(j.vsRepeatContainer)?b.element(h[0].querySelector(j.vsRepeatContainer)):h,r=q.children().eq(0),s=r[0].outerHTML,t="$vs_collection",u=!1,v={vsRepeat:"elementSize",vsOffsetBefore:"offsetBefore",vsOffsetAfter:"offsetAfter",vsScrolledToEndOffset:"scrolledToEndOffset",vsScrolledToBeginningOffset:"scrolledToBeginningOffset",vsExcess:"excess",vsScrollMargin:"scrollMargin"};if(r.attr("ng-repeat"))p="ng-repeat",k=r.attr("ng-repeat");else if(r.attr("data-ng-repeat"))p="data-ng-repeat",k=r.attr("data-ng-repeat");else if(r.attr("ng-repeat-start"))u=!0,p="ng-repeat-start",k=r.attr("ng-repeat-start");else{if(!r.attr("data-ng-repeat-start"))throw new Error("angular-vs-repeat: no ng-repeat directive on a child element");u=!0,p="data-ng-repeat-start",k=r.attr("data-ng-repeat-start")}if(l=/^\s*(\S+)\s+in\s+([\S\s]+?)(track\s+by\s+\S+)?$/.exec(k),m=l[1],n=l[2],o=l[3],u)for(var w=0,x=q.children().eq(0);null==x.attr("ng-repeat-end")&&null==x.attr("data-ng-repeat-end");)w++,x=q.children().eq(w),s+=x[0].outerHTML;return q.empty(),{pre:function(h,j,k){function l(){if(!G||G.length<1)h[t]=[],C=0,h.sizesCumulative=[0];else if(C=G.length,L){h.sizes=G.map(function(a){var c=h.$new(!1);b.extend(c,a),c[m]=a;var d=k.vsSize||k.vsSizeProperty?c.$eval(k.vsSize||k.vsSizeProperty):h.elementSize;return c.$destroy(),d});var a=0;h.sizesCumulative=h.sizes.map(function(b){var c=a;return a+=b,c}),h.sizesCumulative.push(a)}else q();y()}function q(){K&&h.$$postDigest(function(){if(D[0].offsetHeight||D[0].offsetWidth){for(var a=D.children(),b=0,c=!1,d=!1;b<a.length;){if(null!=a[b].attributes[p]||d){if(c||(h.elementSize=0),c=!0,a[b][P]&&(h.elementSize+=a[b][P]),!u)break;if(null!=a[b].attributes["ng-repeat-end"]||null!=a[b].attributes["data-ng-repeat-end"])break;d=!0}b++}c&&(y(),K=!1,h.$root&&!h.$root.$$phase&&h.$apply())}else var e=h.$watch(function(){(D[0].offsetHeight||D[0].offsetWidth)&&(e(),q())})})}function r(){var a="tr"===F?"":"min-";return H?a+"width":a+"height"}function w(){if(B()){h.$digest();var a=L?h.sizesCumulative[C]:h.elementSize*C;a!==j[0].clientHeight&&console.warn("vsRepeat: size mismatch. Expected size "+a+"px whereas actual size is "+j[0].clientHeight+"px. Fix vsSize on element:",j[0])}}function x(){void 0!==k.vsAutoresize&&(K=!0,q(),h.$root&&!h.$root.$$phase&&h.$apply()),B()&&h.$apply()}function y(){R=void 0,S=void 0,T=C,U=0,z(L?h.sizesCumulative[C]:h.elementSize*C),B(),h.$emit("vsRepeatReinitialized",h.startIndex,h.endIndex)}function z(a){h.totalSize=h.offsetBefore+a+h.offsetAfter}function A(){var a=d(M[0],O);a!==V&&(y(),h.$root&&!h.$root.$$phase&&h.$apply()),V=a}function B(){var a=e(M[0],Q),b=d(M[0],O),c=D[0]===M[0]?0:f(D[0],M[0],H),i=h.startIndex,j=h.endIndex;if(L){for(i=0;h.sizesCumulative[i]<a-h.offsetBefore-c-h.scrollMargin;)i++;for(i>0&&i--,i=Math.max(Math.floor(i-h.excess/2),0),j=i;h.sizesCumulative[j]<a-h.offsetBefore-c+h.scrollMargin+b;)j++;j=Math.min(Math.ceil(j+h.excess/2),C)}else i=Math.max(Math.floor((a-h.offsetBefore-c)/h.elementSize)-h.excess/2,0),j=Math.min(i+Math.ceil(b/h.elementSize)+h.excess,C);T=Math.min(i,T),U=Math.max(j,U),h.startIndex=N.latch?T:i,h.endIndex=N.latch?U:j,U<h.startIndex&&(h.startIndex=U);var l=!1;if(null==R?l=!0:null==S&&(l=!0),l||(N.hunked?Math.abs(h.startIndex-R)>=h.excess/2||0===h.startIndex&&0!==R?l=!0:(Math.abs(h.endIndex-S)>=h.excess/2||h.endIndex===C&&S!==C)&&(l=!0):l=h.startIndex!==R||h.endIndex!==S),l){h[t]=G.slice(h.startIndex,h.endIndex),h.$emit("vsRepeatInnerCollectionUpdated",h.startIndex,h.endIndex,R,S);var m;k.vsScrolledToEnd&&(m=G.length-(h.scrolledToEndOffset||0),(h.endIndex>=m&&S<m||G.length&&h.endIndex===G.length)&&h.$eval(k.vsScrolledToEnd)),k.vsScrolledToBeginning&&(m=h.scrolledToBeginningOffset||0,h.startIndex<=m&&R>h.startIndex&&h.$eval(k.vsScrolledToBeginning)),R=h.startIndex,S=h.endIndex;var n=L?"(sizesCumulative[$index + startIndex] + offsetBefore)":"(($index + startIndex) * elementSize + offsetBefore)",o=g(n),p=o(h,{$index:0}),q=o(h,{$index:h[t].length}),s=h.totalSize;I.css(r(),p+"px"),J.css(r(),s-q+"px")}return l}var C,D=b.isDefined(k.vsRepeatContainer)?b.element(j[0].querySelector(k.vsRepeatContainer)):j,E=b.element(s),F=E[0].tagName.toLowerCase(),G=[],H=void 0!==k.vsHorizontal,I=b.element("<"+F+' class="vs-repeat-before-content"></'+F+">"),J=b.element("<"+F+' class="vs-repeat-after-content"></'+F+">"),K=!k.vsRepeat,L=!!k.vsSize||!!k.vsSizeProperty,M=k.vsScrollParent?"window"===k.vsScrollParent?b.element(a):i.call(D,k.vsScrollParent):D,N="vsOptions"in k?h.$eval(k.vsOptions):{},O=H?"clientWidth":"clientHeight",P=H?"offsetWidth":"offsetHeight",Q=H?"scrollLeft":"scrollTop";if(h.totalSize=0,!("vsSize"in k)&&"vsSizeProperty"in k&&console.warn("vs-size-property attribute is deprecated. Please use vs-size attribute which also accepts angular expressions."),0===M.length)throw"Specified scroll parent selector did not match any element";h.$scrollParent=M,L&&(h.sizesCumulative=[]),h.elementSize=+k.vsRepeat||d(M[0],O)||50,h.offsetBefore=0,h.offsetAfter=0,h.scrollMargin=0,h.excess=2,H?(I.css("height","100%"),J.css("height","100%")):(I.css("width","100%"),J.css("width","100%")),Object.keys(v).forEach(function(a){k[a]&&k.$observe(a,function(b){h[v[a]]=+b,y()})}),h.$watchCollection(n,function(a){G=a||[],l()}),E.eq(0).attr(p,m+" in "+t+(o?" "+o:"")),E.addClass("vs-repeat-repeated-element"),D.append(I),D.append(E),c(E)(h),D.append(J),h.startIndex=0,h.endIndex=0,M.on("scroll",w),b.element(a).on("resize",x),h.$on("$destroy",function(){b.element(a).off("resize",x),M.off("scroll",w)}),h.$on("vsRepeatTrigger",l),h.$on("vsRepeatResize",function(){K=!0,q()});var R,S,T,U;h.$on("vsRenderAll",function(){N.latch&&setTimeout(function(){var a=C;U=Math.max(a,U),h.endIndex=N.latch?U:a,h[t]=G.slice(h.startIndex,h.endIndex),S=h.endIndex,h.$$postDigest(function(){I.css(r(),0),J.css(r(),0)}),h.$apply(function(){h.$emit("vsRenderAllDone")})})});var V;h.$watch(function(){"function"==typeof a.requestAnimationFrame?a.requestAnimationFrame(A):A()})}}}}}]);"undefined"!=typeof module&&module.exports&&(module.exports=j.name)}(window,window.angular);

/* ng-infinite-scroll - v1.3.0 - 2016-06-30 */
angular.module("infinite-scroll",[]).value("THROTTLE_MILLISECONDS",null).directive("infiniteScroll",["$rootScope","$window","$interval","THROTTLE_MILLISECONDS",function(a,b,c,d){return{scope:{infiniteScroll:"&",infiniteScrollContainer:"=",infiniteScrollDistance:"=",infiniteScrollDisabled:"=",infiniteScrollUseDocumentBottom:"=",infiniteScrollListenForEvent:"@"},link:function(e,f,g){var h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z;return z=angular.element(b),u=null,v=null,j=null,k=null,r=!0,y=!1,x=null,i=!1,q=function(a){return a=a[0]||a,isNaN(a.offsetHeight)?a.document.documentElement.clientHeight:a.offsetHeight},s=function(a){if(a[0].getBoundingClientRect&&!a.css("none"))return a[0].getBoundingClientRect().top+t(a)},t=function(a){return a=a[0]||a,isNaN(window.pageYOffset)?a.document.documentElement.scrollTop:a.ownerDocument.defaultView.pageYOffset},p=function(){var b,d,g,h,l;return k===z?(b=q(k)+t(k[0].document.documentElement),g=s(f)+q(f)):(b=q(k),d=0,void 0!==s(k)&&(d=s(k)),g=s(f)-d+q(f)),y&&(g=q((f[0].ownerDocument||f[0].document).documentElement)),h=g-b,l=h<=q(k)*u+1,l?(j=!0,v?e.$$phase||a.$$phase?e.infiniteScroll():e.$apply(e.infiniteScroll):void 0):(i&&c.cancel(i),j=!1)},w=function(a,b){var d,e,f;return f=null,e=0,d=function(){return e=(new Date).getTime(),c.cancel(f),f=null,a.call()},function(){var g,h;return g=(new Date).getTime(),h=b-(g-e),h<=0?(c.cancel(f),f=null,e=g,a.call()):f?void 0:f=c(d,h,1)}},null!=d&&(p=w(p,d)),e.$on("$destroy",function(){if(k.unbind("scroll",p),null!=x&&(x(),x=null),i)return c.cancel(i)}),n=function(a){return u=parseFloat(a)||0},e.$watch("infiniteScrollDistance",n),n(e.infiniteScrollDistance),m=function(a){if(v=!a,v&&j)return j=!1,p()},e.$watch("infiniteScrollDisabled",m),m(e.infiniteScrollDisabled),o=function(a){return y=a},e.$watch("infiniteScrollUseDocumentBottom",o),o(e.infiniteScrollUseDocumentBottom),h=function(a){if(null!=k&&k.unbind("scroll",p),k=a,null!=a)return k.bind("scroll",p)},h(z),e.infiniteScrollListenForEvent&&(x=a.$on(e.infiniteScrollListenForEvent,p)),l=function(a){if(null!=a&&0!==a.length){if(a.nodeType&&1===a.nodeType?a=angular.element(a):"function"==typeof a.append?a=angular.element(a[a.length-1]):"string"==typeof a&&(a=angular.element(document.querySelector(a))),null!=a)return h(a);throw new Error("invalid infinite-scroll-container attribute.")}},e.$watch("infiniteScrollContainer",l),l(e.infiniteScrollContainer||[]),null!=g.infiniteScrollParent&&h(angular.element(f.parent())),null!=g.infiniteScrollImmediateCheck&&(r=e.$eval(g.infiniteScrollImmediateCheck)),i=c(function(){return r&&p(),c.cancel(i)})}}}]),"undefined"!=typeof module&&"undefined"!=typeof exports&&module.exports===exports&&(module.exports="infinite-scroll");


/*! ngstorage 0.3.6 | Copyright (c) 2015 Gias Kay Lee | MIT License */
!function(a,b){"use strict";return"function"==typeof define&&define.amd?void define("ngStorage",["angular"],function(a){return b(a)}):b(a)}("undefined"==typeof angular?null:angular,function(a){"use strict";function b(b){return["$rootScope","$window","$log","$timeout",function(c,d,e,f){function g(a){var b;try{b=d[a]}catch(c){b=!1}if(b&&"localStorage"===a){var e="__"+Math.round(1e7*Math.random());try{localStorage.setItem(e,e),localStorage.removeItem(e)}catch(c){b=!1}}return b}var h,i,j=g(b)||(e.warn("This browser does not support Web Storage!"),{setItem:function(){},getItem:function(){}}),k={$default:function(b){for(var c in b)a.isDefined(k[c])||(k[c]=b[c]);return k},$reset:function(a){for(var b in k)"$"===b[0]||delete k[b]&&j.removeItem("ngStorage-"+b);return k.$default(a)}};try{j=d[b],j.length}catch(l){e.warn("This browser does not support Web Storage!"),j={}}for(var m,n=0,o=j.length;o>n;n++)(m=j.key(n))&&"ngStorage-"===m.slice(0,10)&&(k[m.slice(10)]=a.fromJson(j.getItem(m)));return h=a.copy(k),c.$watch(function(){var b;i||(i=f(function(){if(i=null,!a.equals(k,h)){b=a.copy(h),a.forEach(k,function(c,d){a.isDefined(c)&&"$"!==d[0]&&j.setItem("ngStorage-"+d,a.toJson(c)),delete b[d]});for(var c in b)j.removeItem("ngStorage-"+c);h=a.copy(k)}},100,!1))}),"localStorage"===b&&d.addEventListener&&d.addEventListener("storage",function(b){"ngStorage-"===b.key.slice(0,10)&&(b.newValue?k[b.key.slice(10)]=a.fromJson(b.newValue):delete k[b.key.slice(10)],h=a.copy(k),c.$apply())}),k}]}a.module("ngStorage",[]).factory("$localStorage",b("localStorage")).factory("$sessionStorage",b("sessionStorage"))});

/* 
 ng Coockie
*/
(function(n,c){'use strict';function l(b,a,g){var d=g.baseHref(),k=b[0];return function(b,e,f){var g,h;f=f||{};h=f.expires;g=c.isDefined(f.path)?f.path:d;c.isUndefined(e)&&(h="Thu, 01 Jan 1970 00:00:00 GMT",e="");c.isString(h)&&(h=new Date(h));e=encodeURIComponent(b)+"="+encodeURIComponent(e);e=e+(g?";path="+g:"")+(f.domain?";domain="+f.domain:"");e+=h?";expires="+h.toUTCString():"";e+=f.secure?";secure":"";f=e.length+1;4096<f&&a.warn("Cookie '"+b+"' possibly not set or overflowed because it was too large ("+f+" > 4096 bytes)!");k.cookie=e}}c.module("ngCookies",["ng"]).provider("$cookies",[function(){var b=this.defaults={};this.$get=["$$cookieReader","$$cookieWriter",function(a,g){return{get:function(d){return a()[d]},getObject:function(d){return(d=this.get(d))?c.fromJson(d):d},getAll:function(){return a()},put:function(d,a,m){g(d,a,m?c.extend({},b,m):b)},putObject:function(d,b,a){this.put(d,c.toJson(b),a)},remove:function(a,k){g(a,void 0,k?c.extend({},b,k):b)}}}]}]);c.module("ngCookies").factory("$cookieStore",["$cookies",function(b){return{get:function(a){return b.getObject(a)},put:function(a,c){b.putObject(a,c)},remove:function(a){b.remove(a)}}}]);l.$inject=["$document","$log","$browser"];c.module("ngCookies").provider("$$cookieWriter",function(){this.$get=l})})(window,window.angular);

/*
 AngularJS v1.6.9
 (c) 2010-2018 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(J,d){'use strict';function A(d){k&&d.get("$route")}function B(t,u,g){return{restrict:"ECA",terminal:!0,priority:400,transclude:"element",link:function(a,f,b,c,m){function v(){l&&(g.cancel(l),l=null);n&&(n.$destroy(),n=null);p&&(l=g.leave(p),l.done(function(a){!1!==a&&(l=null)}),p=null)}function E(){var b=t.current&&t.current.locals;if(d.isDefined(b&&b.$template)){var b=a.$new(),c=t.current;p=m(b,function(b){g.enter(b,null,p||f).done(function(b){!1===b||!d.isDefined(w)||w&&!a.$eval(w)||u()});
v()});n=c.scope=b;n.$emit("$viewContentLoaded");n.$eval(k)}else v()}var n,p,l,w=b.autoscroll,k=b.onload||"";a.$on("$routeChangeSuccess",E);E()}}}function C(d,k,g){return{restrict:"ECA",priority:-400,link:function(a,f){var b=g.current,c=b.locals;f.html(c.$template);var m=d(f.contents());if(b.controller){c.$scope=a;var v=k(b.controller,c);b.controllerAs&&(a[b.controllerAs]=v);f.data("$ngControllerController",v);f.children().data("$ngControllerController",v)}a[b.resolveAs||"$resolve"]=c;m(a)}}}var x,
y,F,G,z=d.module("ngRoute",[]).info({angularVersion:"1.6.9"}).provider("$route",function(){function t(a,f){return d.extend(Object.create(a),f)}function u(a,d){var b=d.caseInsensitiveMatch,c={originalPath:a,regexp:a},g=c.keys=[];a=a.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)(\*\?|[?*])?/g,function(a,b,d,c){a="?"===c||"*?"===c?"?":null;c="*"===c||"*?"===c?"*":null;g.push({name:d,optional:!!a});b=b||"";return""+(a?"":b)+"(?:"+(a?b:"")+(c&&"(.+?)"||"([^/]+)")+(a||"")+")"+(a||"")}).replace(/([/$*])/g,
"\\$1");c.regexp=new RegExp("^"+a+"$",b?"i":"");return c}x=d.isArray;y=d.isObject;F=d.isDefined;G=d.noop;var g={};this.when=function(a,f){var b;b=void 0;if(x(f)){b=b||[];for(var c=0,m=f.length;c<m;c++)b[c]=f[c]}else if(y(f))for(c in b=b||{},f)if("$"!==c.charAt(0)||"$"!==c.charAt(1))b[c]=f[c];b=b||f;d.isUndefined(b.reloadOnSearch)&&(b.reloadOnSearch=!0);d.isUndefined(b.caseInsensitiveMatch)&&(b.caseInsensitiveMatch=this.caseInsensitiveMatch);g[a]=d.extend(b,a&&u(a,b));a&&(c="/"===a[a.length-1]?a.substr(0,
a.length-1):a+"/",g[c]=d.extend({redirectTo:a},u(c,b)));return this};this.caseInsensitiveMatch=!1;this.otherwise=function(a){"string"===typeof a&&(a={redirectTo:a});this.when(null,a);return this};k=!0;this.eagerInstantiationEnabled=function(a){return F(a)?(k=a,this):k};this.$get=["$rootScope","$location","$routeParams","$q","$injector","$templateRequest","$sce","$browser",function(a,f,b,c,m,k,u,n){function p(e){var h=q.current;(y=(s=C())&&h&&s.$$route===h.$$route&&d.equals(s.pathParams,h.pathParams)&&
!s.reloadOnSearch&&!D)||!h&&!s||a.$broadcast("$routeChangeStart",s,h).defaultPrevented&&e&&e.preventDefault()}function l(){var e=q.current,h=s;if(y)e.params=h.params,d.copy(e.params,b),a.$broadcast("$routeUpdate",e);else if(h||e){D=!1;q.current=h;var H=c.resolve(h);n.$$incOutstandingRequestCount();H.then(w).then(z).then(function(c){return c&&H.then(A).then(function(c){h===q.current&&(h&&(h.locals=c,d.copy(h.params,b)),a.$broadcast("$routeChangeSuccess",h,e))})}).catch(function(b){h===q.current&&a.$broadcast("$routeChangeError",
h,e,b)}).finally(function(){n.$$completeOutstandingRequest(G)})}}function w(e){var a={route:e,hasRedirection:!1};if(e)if(e.redirectTo)if(d.isString(e.redirectTo))a.path=x(e.redirectTo,e.params),a.search=e.params,a.hasRedirection=!0;else{var b=f.path(),g=f.search();e=e.redirectTo(e.pathParams,b,g);d.isDefined(e)&&(a.url=e,a.hasRedirection=!0)}else if(e.resolveRedirectTo)return c.resolve(m.invoke(e.resolveRedirectTo)).then(function(e){d.isDefined(e)&&(a.url=e,a.hasRedirection=!0);return a});return a}
function z(a){var b=!0;if(a.route!==q.current)b=!1;else if(a.hasRedirection){var d=f.url(),c=a.url;c?f.url(c).replace():c=f.path(a.path).search(a.search).replace().url();c!==d&&(b=!1)}return b}function A(a){if(a){var b=d.extend({},a.resolve);d.forEach(b,function(a,e){b[e]=d.isString(a)?m.get(a):m.invoke(a,null,null,e)});a=B(a);d.isDefined(a)&&(b.$template=a);return c.all(b)}}function B(a){var b,c;d.isDefined(b=a.template)?d.isFunction(b)&&(b=b(a.params)):d.isDefined(c=a.templateUrl)&&(d.isFunction(c)&&
(c=c(a.params)),d.isDefined(c)&&(a.loadedTemplateUrl=u.valueOf(c),b=k(c)));return b}function C(){var a,b;d.forEach(g,function(c,g){var r;if(r=!b){var k=f.path();r=c.keys;var m={};if(c.regexp)if(k=c.regexp.exec(k)){for(var l=1,n=k.length;l<n;++l){var p=r[l-1],q=k[l];p&&q&&(m[p.name]=q)}r=m}else r=null;else r=null;r=a=r}r&&(b=t(c,{params:d.extend({},f.search(),a),pathParams:a}),b.$$route=c)});return b||g[null]&&t(g[null],{params:{},pathParams:{}})}function x(a,b){var c=[];d.forEach((a||"").split(":"),
function(a,d){if(0===d)c.push(a);else{var e=a.match(/(\w+)(?:[?*])?(.*)/),f=e[1];c.push(b[f]);c.push(e[2]||"");delete b[f]}});return c.join("")}var D=!1,s,y,q={routes:g,reload:function(){D=!0;var b={defaultPrevented:!1,preventDefault:function(){this.defaultPrevented=!0;D=!1}};a.$evalAsync(function(){p(b);b.defaultPrevented||l()})},updateParams:function(a){if(this.current&&this.current.$$route)a=d.extend({},this.current.params,a),f.path(x(this.current.$$route.originalPath,a)),f.search(a);else throw I("norout");
}};a.$on("$locationChangeStart",p);a.$on("$locationChangeSuccess",l);return q}]}).run(A),I=d.$$minErr("ngRoute"),k;A.$inject=["$injector"];z.provider("$routeParams",function(){this.$get=function(){return{}}});z.directive("ngView",B);z.directive("ngView",C);B.$inject=["$route","$anchorScroll","$animate"];C.$inject=["$compile","$controller","$route"]})(window,window.angular);
//# sourceMappingURL=angular-route.min.js.map

var AngularFindModule = {};

(function(window, angular) {
    'use strict';

    var ajax = function ($q, $rootScope) {

        var vm  = this;
        vm.ajax = null;
                
        var sanitize = function(type,url,params,options,resolve,reject) {
                            
            params              = (typeof(params             ) === "undefined") ? null      : params             ;
            options             = (typeof(options            ) === "undefined") ? {}        : options            ;
            options.complete    = (typeof(options.complete   ) === "undefined") ? null      : options.complete   ;
            options.progress    = (typeof(options.progress   ) === "undefined") ? true      : options.progress   ;
            options.async       = (typeof(options.async      ) === "undefined") ? true      : options.async      ;
            options.cache       = (typeof(options.cache      ) === "undefined") ? true      : options.cache      ;
            options.contentType = (typeof(options.contentType) === "undefined") ? null      : options.contentType;
            options.see         = (typeof(options.see        ) === "undefined") ? false     : options.see        ;
            options.seeType     = (typeof(options.seeType    ) === "undefined") ? 'cache'   : options.seeType    ;
            options.new_job     = (typeof(options.new_job    ) === "undefined") ? false     : options.new_job    ;
            options.metodos     = (typeof(options.metodos    ) === "undefined") ? []        : options.metodos    ;
            options.seeProgress = (typeof(options.seeProgress) === "undefined") ? false     : options.seeProgress;
            options.scope       = (typeof(options.scope      ) === "undefined") ? {Ctrl:{}} : options.scope      ;

            if ( params != null && typeof(params) == 'object') {
                
                params = JSON.stringify(params);
                
                options.contentType = 'application/json';
            }            
            
            return {
                type    : type,
                url     : url,
                params  : params,
                options : options,
                resolve : resolve,
                reject  : reject
            }
        };
		
		var objectToFormData = function(obj) {
			
			var formData 	= new FormData();
			var rootName 	= '';
			var ignoreList 	= [];

			function appendFormData(data, root) {
				if (!ignore(root)) {
					root = root || '';
					if (data instanceof File) {
						formData.append(root, data);
					} else if (Array.isArray(data)) {
						for (var i = 0; i < data.length; i++) {
							appendFormData(data[i], root + '[' + i + ']');
						}
					} else if (typeof data === 'object' && data) {
						for (var key in data) {
							if (data.hasOwnProperty(key)) {
								if (root === '') {
									appendFormData(data[key], key);
								} else {
									appendFormData(data[key], root + '[' + key+ ']');
								}
							}
						}
					} else {
						if (data !== null && typeof data !== 'undefined') {
							formData.append(root, data);
						}
					}
				}
			}

			function ignore(root){
				return Array.isArray(ignoreList)
					&& ignoreList.some(function(x) { return x === root; });
			}

			appendFormData(obj, rootName);

			return formData;

		}
        
        var xhr2 = function(type,url,params,options) {
            return $q(function(resolve, reject) {
                
				var data = sanitize(type,url,params,options,resolve, reject);
				var dados = objectToFormData(params);                

                vm.ajax = execAjaxFile(
                    data.type,
                    data.url,
                    dados,
                    data.resolve,
                    data.reject,
                    data.options.complete,
                    data.options.progress,
                    data.options.async,
                    data.options.cache,
					false,
					false
                );
				
            });
        }
		
		var xhr = function(type,url,params,options) {
            return $q(function(resolve, reject) {
                
                var data  = sanitize(type,url,params,options,resolve, reject);
                var scope = data.options.scope.Ctrl;

                function execProgress(dados){
                    try {
                        $rootScope.$apply(function(){
                
                            scope.SSE_PORGRESSO_STATUS  = dados.STATUS;
                            scope.SSE_PORGRESSO1 	    = dados.POS;
                            scope.SSE_PORGRESSO_TOTAL1  = dados.FIM;
        
                            try {var a = ((scope.SSE_PORGRESSO1 / scope.SSE_PORGRESSO_TOTAL1) * 100);} catch (error) {a=0;}
        
                            if(isNaN(a) || !isFinite(a)){a = 0;}
                            scope.SSE_PROGRESSO_CALC =  a;

                        });
                    } catch (error) {
                        
                    }
                }

                function execProgressFim(){
                    scope.SSE_PROGRESSO_CALC   = 0;
                    scope.SSE_PORGRESSO_STATUS = '';
                    scope.SSE_PORGRESSO1 	   = 0;
                    scope.SSE_PORGRESSO_TOTAL1 = 0;
                }

                scope.fecharProgressoSse = function(){
                    try {
                        $('#modal-progresso-sse').modal('hide');
                        
                        scope.SSE_PROGRESSO_CALC   = 0;
                        scope.SSE_PORGRESSO_STATUS = '';
                        scope.SSE_PORGRESSO1 	   = 0;
                        scope.SSE_PORGRESSO_TOTAL1 = 0;
                    } catch (error) {}
                }

                vm.ajax = execAjaxSee(
                    data.type,
                    data.url,
                    data.params,
                    data.resolve,
                    data.reject,
                    data.options.complete,
                    data.options.progress,
                    data.options.async,
                    data.options.cache,
                    data.options.contentType,
					true,
                    true,
                    data.options.see,
                    data.options.seeType,
                    data.options.new_job,
                    data.options.metodos,
                    data.options.seeProgress,
                    execProgress,
                    execProgressFim,
                    data.options.url
                );
            });
        }
		
		vm.postFile = function (url,params,options) {
            return xhr2('POST',url,params,options);
        };
        
        vm.post = function (url,params,options) {
            return xhr('POST',url,params,options);
        };
        
        vm.get = function (url,options) {
            return xhr('GET',url,null,options);
        };

        vm.delete = function (url,options) {
            return xhr('DELETE',url,null,options);
        };
        
        vm.abort = function () {
            vm.ajax.abort();
        }
    };
    
    ajax.$inject = ['$q', '$rootScope'];

    var ajaxModule = angular.module('gc-ajax', []);
    
    ajaxModule.service('$ajax', ajax);

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ajaxModule.name;
    }

})(window, window.angular);

(function(window, angular) {
    'use strict';

    var find = function () {
        
        return function (items,array) {
            var model  = array.model;
            var fields = array.fields;
            var clearOnEmpty = array.clearOnEmpty || false;
            var filtered = [];

            var inFields = function(row,query) {
                var finded = false;
                if ( fields == 'all' ) {
                    fields = [];
                    for (var k in row){
                        /*
                        if(k != '$$hashKey'){
                            if($("th[field="+k+"]:visible").length == 1){
                                fields.push(k);
                            }
                        }*/

                        if(k != '$$hashKey' && k.includes('_JSON') != true && k != 'DATAHORA_INSERT' && k != 'DATAHORA_UPDATE' && k != 'DATAHORA_DELETE'){
                            fields.push(k);
                        }
                    }                    
                }
                
                for ( var i in fields ) {
                    var field = row[fields[i]];
                    if ( field != undefined ) {

                    	var val = row[fields[i]];

                    	if(!(typeof val == 'string')){
                    		val = val.toString();
                    	}
                        
                        val = removeAcento(val);
                        
                        if ( val != undefined && val != null ) {
                            val = val.toLowerCase();
                        }
                        
                        finded = val.indexOf(query || '') !== -1;

                    }
                    if ( finded ) break;
                }
                return finded;
            };

            if ( clearOnEmpty && model == "" ) return filtered;

            for (var i in items) {
                var row = items[i];
                var query = removeAcento(model);


                if ( query != undefined && query != null ) {
                    query = String(query).toLowerCase();
                }

                if (query != undefined && query != null && query.indexOf(" ") > 0) {
                    var query_array = query.split(" ");
                    var x;
                    for (x in query_array) {
                        query = query_array[x];
                        var search_result = true;
                        if ( !inFields(row,query) ) {
                            search_result = false;
                            break;
                        }
                    }
                } else {
                    search_result = inFields(row,query);
                }                
                if ( search_result ) {
                    filtered.push(row);
                }
            }
            return filtered;
        };
	};
	
	var find2 = function () {
        
		return function (items,array) {
			var model  = array.model;
			var fields = array.fields;
			var clearOnEmpty = array.clearOnEmpty || false;
			var filtered = [];

			var inFields = function(row,query) {
				var finded = false;
				if ( fields == 'all' ) {
					fields = [];
					for (var k in row){
						if(k != '$$hashKey' && k.includes('_JSON') != true && k != 'DATAHORA_INSERT' && k != 'DATAHORA_UPDATE' && k != 'DATAHORA_DELETE'){
							fields.push(k);
						}
					}                    
				}
				
				for( var i in fields ) {					
					var field = row[fields[i]];
					if (trim_null(field) != '') {

						var val = row[fields[i]];

						if(!(typeof val == 'string')){
							val = val.toString();
						}
						
						val = removeAcento(val);
						
						if ( val != undefined && val != null ) {
							val = val.toLowerCase();
						}
						
						finded = val.indexOf(query || '') !== -1;
					}else{
						finded = true;
					}

					if ( finded ) break;
				}
				return finded;
			};

			if ( clearOnEmpty && model == "" ) return filtered;

			for (var i in items) {
				var row = items[i];
				var query = removeAcento(model);

				if (typeof query != 'undefined' && query != null ) {
					query = String(query).toLowerCase();
				}

				if (typeof query != 'undefined' && query != null && query.indexOf(" ") > 0) {
					var query_array = query.split(" ");
					var x;
					for (x in query_array) {
						query = query_array[x];
						var search_result = true;
						if ( !inFields(row,query) ) {
							search_result = false;
							break;
						}
					}
				} else {
					search_result = inFields(row,query);
				}   
								
				if ( search_result ) {
					filtered.push(row);
				}
			}
			return filtered;
		};
	};
	
	var orderBy2 = function() {
		return function(items, field2) {

            items = typeof items == 'undefined' ? [] : items;
            
			var field = field2.model;
			if((field+'').indexOf('-') == -1){
				items.sort(function (a, b) {
					var x = a[field]; var y = b[field];
					//console.log((((x < y) ? -1 : ((x > y) ? 1 : 0))))
					
					if(!isNaN(x) && !isNaN(parseFloat(x)) && (!((x) > Number.MAX_SAFE_INTEGER))){
						return (Number(x) - Number(y));
					}else{
						return (((x < y) ? -1 : ((x > y) ? 1 : 0)));
					}					
				});
			}else{
				field = trim_null((field+'').replace('-',''));
				items.sort(function (a, b) {
					var x = a[field]; var y = b[field];
					//console.log((((x < y) ? -1 : ((x > y) ? 1 : 0))))
					if(!isNaN(x) && !isNaN(parseFloat(x)) && (!((x) > Number.MAX_SAFE_INTEGER))){
						return (Number(y) - Number(x));
					}else{
						return (((x < y) ? 1 : ((x > y) ? -1 : 0)));
					}					
				});
			}
			return items;			
		};
		
	}
    
    var highlight = function ($sce) {

        return function(str, termsToHighlight) {
            
            if (termsToHighlight != undefined && termsToHighlight != null && termsToHighlight.trim() != '') {            
                
                if ( termsToHighlight.indexOf(" ") > 0 ) {
                    var termsToHighlight = termsToHighlight.split(" ");
                } else {
                    var termsToHighlight = [termsToHighlight];
                }                   

                // Sort terms by length
                termsToHighlight.sort(function(a, b) {
                  return b.length - a.length;
                });
                
                
                // Regex to simultaneously replace terms
                var regex = new RegExp('(' + termsToHighlight.join('|') + ')', 'ig');
                str = $sce.trustAsHtml(str.replace(regex, '<span class="highlight-text">$&</span>'));
            } else {
                str = $sce.trustAsHtml(str);
            }
            return str;            
        };    
    };
    
    highlight.$inject = [
        '$sce'
    ]; 
    
    AngularFindModule = angular.module('gc-find', []);

	AngularFindModule.filter('find', find);
	AngularFindModule.filter('find2', find2);
	AngularFindModule.filter('orderBy2', orderBy2);
    AngularFindModule.filter('highlight', highlight );

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AngularFindModule.name;
    }
    
})(window, window.angular);

// (function(window, angular) {
//     'use strict';

//     var find2 = function () {
        
//         return function (items,array) {
//             var model  = array.model;
//             var fields = array.fields;
//             var clearOnEmpty = array.clearOnEmpty || false;
//             var filtered = [];

//             var inFields = function(row,query) {
//                 var finded = false;
//                 if ( fields == 'all' ) {
//                     fields = [];
//                     for (var k in row){
//                         if(k != '$$hashKey' && k.includes('_JSON') != true && k != 'DATAHORA_INSERT' && k != 'DATAHORA_UPDATE' && k != 'DATAHORA_DELETE'){
//                             fields.push(k);
//                         }
//                     }                    
//                 }
                
//                 for( var i in fields ) {					
//                     var field = row[fields[i]];
//                     if (trim_null(field) != '') {

//                     	var val = row[fields[i]];

//                     	if(!(typeof val == 'string')){
//                     		val = val.toString();
//                     	}
                        
//                         val = removeAcento(val);
                        
//                         if ( val != undefined && val != null ) {
//                             val = val.toLowerCase();
//                         }
                        
//                         finded = val.indexOf(query || '') !== -1;
//                     }else{
// 						finded = true;
// 					}

//                     if ( finded ) break;
//                 }
//                 return finded;
//             };

//             if ( clearOnEmpty && model == "" ) return filtered;

//             for (var i in items) {
//                 var row = items[i];
//                 var query = removeAcento(model);

//                 if (typeof query != 'undefined' && query != null ) {
//                     query = query.toLowerCase();
//                 }

//                 if (typeof query != 'undefined' && query != null && query.indexOf(" ") > 0) {
//                     var query_array = query.split(" ");
//                     var x;
//                     for (x in query_array) {
//                         query = query_array[x];
//                         var search_result = true;
//                         if ( !inFields(row,query) ) {
//                             search_result = false;
//                             break;
//                         }
//                     }
//                 } else {
//                     search_result = inFields(row,query);
// 				}   
				             
//                 if ( search_result ) {
//                     filtered.push(row);
//                 }
//             }
//             return filtered;
//         };
//     };   
    
//     var highlight2 = function ($sce) {

//         return function(str, termsToHighlight) {
            
//             if (termsToHighlight != undefined && termsToHighlight != null && termsToHighlight.trim() != '') {            
                
//                 if ( termsToHighlight.indexOf(" ") > 0 ) {
//                     var termsToHighlight = termsToHighlight.split(" ");
//                 } else {
//                     var termsToHighlight = [termsToHighlight];
//                 }                   

//                 // Sort terms by length
//                 termsToHighlight.sort(function(a, b) {
//                   return b.length - a.length;
//                 });
                
                
//                 // Regex to simultaneously replace terms
//                 var regex = new RegExp('(' + termsToHighlight.join('|') + ')', 'ig');
//                 str = $sce.trustAsHtml(str.replace(regex, '<span class="highlight-text">$&</span>'));
//             } else {
//                 str = $sce.trustAsHtml(str);
//             }
//             return str;            
//         };    
//     };
    
//     highlight.$inject = [
//         '$sce'
//     ]; 
    
//     AngularFindModule = angular.module('gc-find', []);

//     AngularFindModule.filter('find2', find2);
//     AngularFindModule.filter('highlight2'        , highlight2 );

//     if (typeof module !== 'undefined' && module.exports) {
//         module.exports = AngularFindModule.name;
//     }
    
// })(window, window.angular);

/**
 * Modulo de Forms
 */
(function(window, angular) {
    'use strict';

    var ngUpdateHidden = function () {
        return {
            restrict: 'AE', //attribute or element
            scope: {},
            replace: true,
            require: 'ngModel',
            link: function ($scope, elem, attr, ngModel) {
                $scope.$watch(ngModel, function (nv) {
                    if ( nv != undefined ) {
                        elem.val(nv);
                    }
                });
                $(document).ready(function() {
                    
                    ngModel.$setViewValue(  elem.val());
                    
                    $(elem).change(function () { //bind the change event to hidden input
                        $scope.$apply(function () {
                            ngModel.$setViewValue(  elem.val());
                        });
                    });
                });
            }
        };
    };

    // Remover validação de email do AngularJS.
    var removeNgEmailValidation = function() {
	    return {
	        require : 'ngModel',
	        link : function(scope, element, attrs, ngModel) {
	            ngModel.$validators["email"] = function () {
	                return true;
	            };
	        }
	    }
	};

    var toDate = function () {
        return function(input) {
            if ( input ) return new Date(input);
        };
    };
    
    var uppercase = function() {
      return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
          var capitalize = function(inputValue) {
            if (inputValue == undefined) inputValue = '';
            var capitalized = inputValue.toUpperCase();
            if (capitalized !== inputValue) {
              // see where the cursor is before the update so that we can set it back
              var selection = element[0].selectionStart;
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
              // set back the cursor after rendering
              element[0].selectionStart = selection;
              element[0].selectionEnd = selection;
            }
            return capitalized;
          }
          modelCtrl.$parsers.push(capitalize);
          capitalize(scope[attrs.ngModel]); // capitalize initial value
        }
      };
    };
    
    var validMaxValue = function() {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: { numberFixed:'=' },
            link: function($scope, element, attrs, ngModel) {
                $(document).ready(function() {
                    $(element).change(function () { //bind the change event to hidden input
                        if ( ngModel.$invalid ) {
                            var max_value = parseFloat(attrs.ngMax);
                            var new_value = parseFloat(ngModel.$viewValue);

                            if ( new_value > max_value ) {
                                element.val(max_value);
                                $scope.$apply(function () {
                                    ngModel.$setViewValue( max_value );
                                });
                            }
                        }
                    });
                });
            }
        };
    };
    
    var GcForm = angular.module('gc-form', []);

    GcForm.directive('ngUpdateHidden'			, ngUpdateHidden);
    GcForm.directive('removeNgEmailValidation'	, removeNgEmailValidation);
    GcForm.directive('validMaxValue'            , validMaxValue );
    GcForm.filter   ('toDate'        			, toDate);
    GcForm.directive('uppercase'       			, uppercase);
    GcForm.factory  ('gcOperador'               , gcOperador);

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GcForm.name;
    }
    
	gcOperador.$inject = [
        '$compile',
        '$rootScope',
        '$q',
        '$timeout',
        '$ajax'
    ];
    
    function gcOperador($compile,$rootScope,$q,$timeout,$ajax) {
        var that = null;
        function gcOperador(object,arg_scope) {
            that = this;
            
            this.autenticar = autenticar;
            this.validar    = validar;
            this.confirmar  = confirmar;
            this.cancelar   = cancelar;
            this.fechar     = fechar;
            this.html       = html;
            
            this._button_attr  = '[gc-form-operador]';
            this._button       = null;
            
            this._modal        = function(){
                return $('#gc-form-operador-modal')
            };
            
            this._controller   = function(){
            	var scope = $('#main').find('[ng-controller]').first();

            	if(scope.length == 0){
            		scope = $('#main').find('.ng-isolate-scope').first();
            	}
            	return scope; 
            };

            if ( object != undefined && object != null ) {
                this._object = object;
            } else {
                this._object = 'vm.gcOperador';
            }

            var scope = null;

        	if ( arg_scope != undefined ) {
        		scope = arg_scope;
        	} else {
            	scope = that._controller().scope();
        	}

            that._controller().append($compile(that.html())(scope));
            
            $(document).on('click',that._button_attr,function(){
                var button = $(this);
                $rootScope.$apply(function(){
                    
                    that._button = button;

                    that.autenticar(button.attr(that._button_attr));
                });
            });
            
        }
        
        function autenticar(args,callback) {
            
            clearObj(that);
            
            that._ARGS = args || {};
                        
            that._CODIGO_BARRAS = '';
            
            that.callback = callback;
            
            that._element_focused = $(':focus');
            that._modal().modal('show');      

            $timeout(function(){
                that._modal().find('input:focusable').first().focus();
            });            
        }
        
        function validar() {

            if ( !(that._ARGS.OPERACAO_ID > 0) ) {
                showErro('Id da operação para autenticar operador é obrigatória.');
                return;
            }
            
            that._ARGS.BARRAS = that._CODIGO_BARRAS;
            
            if ( that._ARGS.ABORT == undefined ) {
                that._ARGS.ABORT = true;
            }               

            if ( that._ARGS.VALOR_EXT == undefined ) {
                that._ARGS.VALOR_EXT = '1';
            }            

            if ( that._ARGS.VERIFICAR_UP == undefined ) {
                that._ARGS.VERIFICAR_UP = false;
            }            
                        
        }
        
        function confirmar() {
            
            that.validar();
            
            return $q(function(resolve, reject){
                $ajax.post('/_22050/autenticacao',that._ARGS)
                    .then(function(response) {

                        that.OPERADOR_ID     = response[0].OPERADOR_ID;
                        that.OPERADOR_NOME   = response[0].OPERADOR_NOME;
                        that.OPERADOR_BARRAS = response[0].OPERADOR_BARRAS;
                        that.AUTENTICADO     = true;
                        
                        that.fechar();
  
                        if ( that.callback != undefined && that.callback != null ) {

                            if ( that.callback && {}.toString.call(that.callback) === '[object Function]' ) {
                                that.callback(response);
                                that.callback = null;
                            } else {
                                angular.copy(that,that.callback);
                            }                            
                            
                        }

                        resolve(that.SELECTED);
                    },function(erro){
                        that._CODIGO_BARRAS = '';
                        that._modal().find('input:focusable').first().focus();
                        
                        reject(erro);
                    }
                );        
            });
        }
        
        function cancelar() {
            that.fechar();          
        }
        
        function fechar() {
            that._CODIGO_BARRAS = '';
            that._modal().modal('hide');   
            
            $timeout(function(){
                if ( $(that._element_focused).is(':focusable') ) {
                    $(that._element_focused).focus();
                    $(that._element_focused).select();
                }
            });                 
            
        }
        
        function clearObj(obj) {
            delete obj['AUTENTICADO'];
            delete obj['OPERADOR_ID'];
            delete obj['OPERADOR_NOME'];
            delete obj['OPERADOR_BARRAS'];
            

            if ( !(that.callback && {}.toString.call(that.callback) === '[object Function]') && that.callback != undefined ) {
                Object.keys(that.callback).forEach(function(key) { delete that.callback[key]; });
            }                 
        }
        
        function html() {
            var html = '';
            
            html += '<div class="modal" id="gc-form-operador-modal"  role="dialog" data-keyboard="false" data-backdrop="static">                                                                       ';
            html += '	<div class="modal-dialog" role="document" style="max-width: 420px;margin: 60px auto;">                                                                                                               ';
            html += '		<form class="form-inlin" ng-submit="' + that._object + '.confirmar()">                                                                                                     ';
            html += '			<div class="modal-content">                                                                                                                                            ';
            html += '				<div class="modal-header">                                                                                                                                         ';
            html += '					<div class="modal-header-left" style="width: auto;">                                                                                                                                ';
            html += '						<h4 class="modal-title">                                                                                                                                   ';
            html += '							Autenticar Operador                                                                                                                                    ';
            html += '						</h4>                                                                                                                                                      ';
            html += '					</div>                                                                                                                                                         ';
            html += '					<div class="modal-header-center"></div>                                                                                                                        ';
            html += '					<div class="modal-header-right">                                                                                                                               ';
            html += '						                                                                                                                                  ';
            html += '							<button type="submit" class="btn btn-success" data-hotkey="enter" data-loading-text="Confirmando...">                                                  ';
            html += '								<span class="glyphicon glyphicon-ok"></span> Confirmar                                                                                             ';
            html += '							</button>                                                                                                                                              ';
            html += '							<button ng-click="' + that._object + '.cancelar()" type="button" class="btn btn-danger btn-cancelar" data-hotkey="esc">                                ';
            html += '								<span class="glyphicon glyphicon-ban-circle"></span> Cancelar                                                                                      ';
            html += '							</button>                                                                                                                                              ';
            html += '						                                                                                                                                               ';
            html += '					</div>                                                                                                                                                         ';
            html += '				</div>                                                                                                                                                             ';
            html += '				<div class="modal-body">                                                                                                                                           ';
            html += '                   <input type="text" ng-model="' + that._object + '._CODIGO_BARRAS" required style="width:100%; -webkit-text-security: disc;" form-validate="true" placeholder="Informe o numero do crachá"/>       ';
            html += '				</div>                                                                                                                                                             ';
            html += '			</div>                                                                                                                                                                 ';
            html += '		</form>                                                                                                                                                                    ';
            html += '	</div>                                                                                                                                                                         ';
            html += '</div>                                                                                                                                                                            ';                
            
            
            return html;
        }
        
        return gcOperador;
    }    
    
})(window, window.angular);


/**
 * Modulo de Transform
 */
(function(window, angular) {
    'use strict';

    var toColor = function() {
        return function(input, n) {
            
            if( input == undefined ) return '';

            if ( typeof input == 'string' ) {
                input = input.replace("$", "");
            }

            var r = input & 0xFF;
            var g = (input >> 8) & 0xFF;
            var b = (input >> 16) & 0xFF;
            
            var array = [r, g, b];
            
            return 'rgb(' + array.join(",") + ')';

        };
    };

    var sumByField = function() {
        return function(input, field) {
            if (!Array.isArray(input) || !field) return 0;

            return input.reduce(function(total, item) {
            const value = parseFloat(item[field]) || 0;
            return total + value;
            }, 0);
        };
    }

    var lpad = function() {
        return function(input, n) {
            
            input = ''+input;
            
            var tamanho   = ( n[0] == undefined ) ? n   : n[0];
            var caractere = ( n[1] == undefined ) ? " " : n[1];
            
            if(input === undefined || input === null )
                input = "";
            if(input.length >= tamanho)
                return input;
            var zeros = String(caractere).repeat(tamanho);
            return (zeros + input).slice(-1 * tamanho);
        };
    };

    var stringToNumber = function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function(value) {
                    return parseFloat(value);
                });
            }
        };
    };
    
    var GcTransform = angular.module('gc-transform', []);

    GcTransform.filter('toColor', toColor);
    GcTransform.filter('lpad'   , lpad);
    GcTransform.directive('stringToNumber', stringToNumber);
    GcTransform.filter('sumByField', sumByField);

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GcTransform.name;
    }
})(window, window.angular);

/**
 * Modulo de Array
 */
(function(window, angular) {
    'use strict';

    var gcCollection = function () {

        var vm = this;
        
        /**
         * Extende/mescla propriedades de uma nova coleção de dados para uma coleção de dados já existente
         * @param {array} collection_main Coleção de Dados principal
         * @param {array} collection_new Nova Coleção de Dados para ser extendida para a existente
         * @param {boolean} preserve_main <b>Opicional</b> Verifica se os dados que não vieram na nova coleção deverão ser removidos da já existente. Default: false
         * @param {boolean} push_new <b>Opicional</b> Verifica se os dados que vieram na nova coleção deverão ser inseridos na coleção já existente. Default: true
         */
        vm.merge = function (collection_main, collection_new, field_identifier, preserve_main, push_new) {

            //  try {
                if ( !Array.isArray(collection_main) ) {
                    
                    throw new 'Os dados principal devem ser do tipe array.';
                }
                
                collection_new = !Array.isArray(collection_new) ? [] : collection_new;
                
                // Verifica se na mesclagem deverá manter os objetos principais, caso não exista na nova coleção de dados
                var preserve_main = (preserve_main == undefined) ? false : preserve_main;

                // Verifica se insere os novos objetos que não existem na coleção de dados principal
                var push_new = (push_new == undefined) ? true : push_new;

                // Laço que busca os itens com refências iguais e extende o dados do objeto novo para o principal
                for ( var i in collection_main ) {
                    var item_main = collection_main[i];

                    for ( var j = 0; j < collection_new.length; j++) {
                        var item_new = collection_new[j];


                        var condicao_true = true;

                        if ( typeof field_identifier == 'string' ) {
                            if ( item_main[field_identifier] != item_new[field_identifier] ) {
                                condicao_true = false;
                            }
                        } else {
                            for ( var k in field_identifier ) {
                                var condicao = field_identifier[k];

                                if ( item_main[condicao] != item_new[condicao] ) {
                                    condicao_true = false;
                                    break;
                                }
                            }
                        }

                        // Verifica se os dois objetos possuem o mesmo valor no campo identificador
                        if ( condicao_true ) {

                            // Extende os objetos ( insere ou atualiza as propriedades do novo objeto para o principal )
                            angular.extend(item_main, item_new);

                            // Marca o item principal como localizado na coleção de dados principal
                            item_main.found = true;

                            // Remove da nova coleção de dados o objeto já utilizado
                            collection_new.splice(j,1);
                            j--;

                            break;
                        }
                    }
                }

                // Prepara a coleção principal de dados para saída
                for ( var i = 0; i < collection_main.length; i++) {
                    var item = collection_main[i];

                    // Verifica se preserva o objeto da coleção principal, caso não exista na nova coleção de dados
                    if ( preserve_main ) {
                        // Limpa a propriedade "found" criada para tratamento
                        if ( item.found != undefined ) {
                            delete item.found;
                        }
                    } else {
                        // Remove o item da coleção principal caso não exista na nova coleção de dados
                        if ( item.found == undefined ) {
                            collection_main.splice(i,1);
                            i--;
                        } else {
                            delete item.found;
                        }
                    }
                }

                // Verifica se insere os novos objetos na coleção principal de dados
                if ( push_new ) {
                    // Insere os novos objetos na coleção principal de dados
                    for ( var i in collection_new ) {
                        var item = collection_new[i];
                        collection_main.push(item);
                    }
                }

                return collection_main;
            // } catch (err) {
            //      showErro(err.message + ' Operação cancelada.');
            // }
        };
        
        vm.groupBy = function (collection, fields, collection_name,callOnGroup) {
            var gps = [];


            if ( typeof collection_name != 'string' ) {
                collection_name = 'COLLECTION';
            }
            
            for (var i in collection) {
                var estacao = collection[i];


                var localized = false;
                for ( var y in gps ) {
                    var gp = gps[y];

                    var condicao_true = true;
                    if ( typeof fields == 'string' ) {
                        if ( gp[fields] != estacao[fields] ) {
                            condicao_true = false;
                        }
                    } else {
                        for ( var j in fields ) {
                            var condicao = fields[j];

                            if ( gp[condicao] != estacao[condicao] ) {
                                condicao_true = false;
                                break;
                            }
                        }
                    }

                    if ( condicao_true ) {
                        localized = true;
                        gp[collection_name].push(estacao);
                        callOnGroup != undefined ? callOnGroup(gp,estacao) : '';
                        break;
                    }
                }
                if ( localized == false ) {

                    var gp = {};
                    
                    gp[collection_name] = [estacao];

                    if ( typeof fields == 'string' ) {
                        gp[fields] = estacao[fields];
                    } else {
                        for ( var j in fields ) {
                            var condicao = fields[j];

                            gp[condicao] = estacao[condicao];
                        }
                    }
                    
                    callOnGroup != undefined ? callOnGroup(gp,estacao) : '';

                    gps.push(gp);
                }
            }
            
            return gps;
        };
        
        vm.distinct = function (collection, fields) {
            var gps = [];

            for (var i in collection) {
                var estacao = collection[i];


                var localized = false;
                for ( var y in gps ) {
                    var gp = gps[y];

                    var condicao_true = true;
                    for ( var j in fields ) {
                        var condicao = fields[j];

                        if ( gp[condicao] != estacao[condicao] ) {
                            condicao_true = false;
                            break;
                        }
                    }

                    if ( condicao_true ) {
                        localized = true;
                        break;
                    }
                }
                if ( localized == false ) {

                    gp = {};
                    
                    for ( var j in fields ) {
                        var condicao = fields[j];

                        gp[condicao] = estacao[condicao];
                    }

                    gps.push(gp);
                }
            }
            
            return gps;
        }
        
        /**
         * Liga dois arrays; Um pai e um filho
         * @param {Array} collection_main Array principal (Pai)
         * @param {Array} collection_bind Array a ser ligado (Filho)
         * @param {String} field_identifier Nome do atributo que liga os dois array
         * @param {String} name_bind Nome da relação entre os arrays. Default: BINDED
         * @return {Array} Retorna o array principal ligado ao array filho
         */
        vm.bind = function ( collection_main, collection_bind, field_identifier, name_bind , callbackOnBind) {
            
            // Aplica o nome padrão para para o nome da relação
            var name_bind = (name_bind == undefined) ? 'BINDED' : name_bind;
                      
            // Passa por todos os itens da coleção principal
            for ( var i in collection_main ) {
                
                // Cria a variavel que recebe o item da coleção principal
                var item_main = collection_main[i];
                
                item_main[name_bind] = [];

                for ( var j = 0; j < collection_bind.length; j++) {
                    var item_bind = collection_bind[j];                

                    // Verifica se os dois objetos possuem o mesmo valor no campo identificador
                    if ( equalsByField(item_main,item_bind,field_identifier) ) {          
                        
                        callbackOnBind != undefined ? callbackOnBind(item_main,item_bind) : '';
                        
                        item_main[name_bind].push(item_bind);
                    }
                }
                
            }
            
            return collection_main;
        }
        
        vm.extendObjByField = function ( collection_main, obj_new, field ) {
                 
            var localized = false;
            for ( var i in collection_main ) {
                var item_main = collection_main[i];       
                
                var condicao_true = true;

                if ( typeof field == 'string' ) {
                    if ( item_main[field] != obj_new[field] ) {
                        condicao_true = false;
                    }
                } else {
                    for ( var k in field ) {
                        var condicao = field[k];

                        if ( item_main[condicao] != obj_new[condicao] ) {
                            condicao_true = false;
                            break;
                        }
                    }
                }
                
                if ( condicao_true ) {
                    localized = true;
                    angular.extend(item_main, obj_new);
                    break;
                }                
            }
            
            if ( localized == false ) {            
                collection_main.push(obj_new);
            }
            
            return collection_main;            
        }
        
    };
    
   
    /** @ngInject */
    var gcObject = function() {
        return {
            start: function (propertyName, prototype, func) {
                var propertyAccessor = '_' + propertyName;
                
                Object.defineProperty(prototype,
                propertyName, {
                get: function () {
                    return prototype[propertyAccessor];
                },
                set: function (newValue) {
                    prototype[propertyAccessor] = newValue;
                    if (angular.isFunction(func)) {
                        func(newValue);
                    }
                },
                enumerable: true,
                configurable: true
                });
            },
            calcField: function(propertyName, prototype, func) {
                Object.defineProperty(prototype,
                propertyName, {
                get: function () {
                    return func(prototype);
                },
                enumerable: true,
                configurable: true
                });
            },
            /**
             * Liga um array a um objecto; Liga filhos a um pai
             * @param {Array} collection_main Array principal (Pai)
             * @param {Array} collection_bind Array a ser ligado (Filho)
             * @param {String} field_identifier Nome do atributo que liga os dois array
             * @param {String} name_bind Nome da relação entre os arrays. Default: BINDED
             * @param {boolean} bind_if_exists Faz a ligação se o array pai possuir a propriedade do filho
             * @return {Array} Retorna o array principal ligado ao array filho
             */
            bind : function ( objectMain, collection_bind, field_identifier, name_bind ) {

                // Aplica o nome padrão para para o nome da relação
                var name_bind = (name_bind == undefined) ? 'BINDED' : name_bind;

                objectMain[name_bind] = [];

                for ( var j = 0; j < collection_bind.length; j++) {
                    var item_bind = collection_bind[j];                

                    // Verifica se os dois objetos possuem o mesmo valor no campo identificador
                    if ( equalsByField(objectMain,item_bind,field_identifier) ) {          
                        objectMain[name_bind].push(item_bind);
                    }
                }

                return objectMain;
            }                 
        };
    }    
    
    var gcClock = function($rootScope) {
        
        var vm = this;
        
        vm.TimeServer = function () {
//            $rootScope.$watch(function () {;
//               return Clock.DATETIME_SERVER;
//            }, function(val) {
////                $rootScope.$apply(function () {
//                            
//                    var time_server = moment(val).add(1, 's');
//                    return moment(time_server).format("YYYY-MM-DD HH:mm:ss"); 
////                });
//            });  
        };
        
    };
    
    gcClock.$inject = ['$rootScope'];


    function ProvadorVirtualMotor() {

        var vm = this;

        /**
         * Estima medidas do usuário com base em altura,
         * biotipo e preferência de uso
         */
        vm.estimarMedidasUsuario = function(usuario) {

            var fatorBase = 0.55;

            if (usuario.biotipo === 'magro') {
                fatorBase -= 0.03;
            }

            if (usuario.biotipo === 'largo') {
                fatorBase += 0.03;
            }

            var ajuste = 0;

            if (usuario.preferencia === 'justa') {
                ajuste = -4;
            }

            if (usuario.preferencia === 'larga') {
                ajuste = 4;
            }

            return {
                PEITO    : (usuario.altura * fatorBase) + ajuste,
                CINTURA  : (usuario.altura * (fatorBase - 0.05)) + ajuste,
                QUADRIL  : (usuario.altura * (fatorBase - 0.02)) + ajuste
            };
        };

        /**
         * Compara medidas do produto com o usuário
         */
        vm.compararProduto = function(produto, usuario) {

            if (!produto || !produto.MEDIDAS || !usuario) {
                return {};
            }

            var medidasUsuario = vm.estimarMedidasUsuario(usuario);
            var resultado = {};

            angular.forEach(produto.MEDIDAS, function(valorProduto, chave) {

                if (!medidasUsuario[chave]) return;

                var diferenca = valorProduto - medidasUsuario[chave];

                if (diferenca < -3) {
                    resultado[chave] = 'JUSTO';
                } else if (diferenca > 3) {
                    resultado[chave] = 'LARGO';
                } else {
                    resultado[chave] = 'IDEAL';
                }

            });

            return resultado;
        };

    }


    ProvadorVirtualMotor.$inject = [];

    
    var onFinishRender = function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    
                    var time = 0;
                    if ( attr.renderTime != undefined ) {
                        time = attr.renderTime;
                    }
                    
                    $timeout(function () {
                        scope.$emit(attr.onFinishRender);
                    },time);
                }
            }
        };
    };
    
    onFinishRender.$inject = ['$timeout'];
    
    function arraysEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length != b.length) return false;

      // If you don't care about the order of the elements inside
      // the array, you should sort both arrays here.

      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
	}
	
    var gcOrderBy = function () {
        return {
            restrict: 'A',
            scope: {
                    model: '=gcOrderBy',
            },            
            link: function (scope, element, attr) {
                
                element.find('[field]').bind('click', function() {

					var that = $(this);
					//console.log(that);
                    $(this).closest('[gc-order-by').find('.span-order-by').remove();
                    
                    var fields = $(this).attr('field').split(',');
                    
                    scope.$apply(function(){
                        
                        if ( ! arraysEqual(fields, scope.model) ) {
                            scope.model = fields;
                            
                            $(that).append('<span style="margin-left: 5px;" class="glyphicon glyphicon-sort-by-attributes span-order-by"></span>');
                        } else {
                            
                            var ret = [];
                            for ( var i in fields ) {
                                var field = fields[i];
                                
                                field = '-'+field;
                                
                                ret.push(field);
                            }
                            
                            scope.model = ret;
                            
                            $(that).append('<span style="margin-left: 5px;" class="glyphicon glyphicon-sort-by-attributes-alt span-order-by"></span>');
                        }
                        
//                        for ( var i in fields ) {
//                            var field = fields[i];
                            
//                            if( scope.model == '-'+field){
//                                scope.model = field;
//
//                                $(that).append('<span style="margin-left: 5px;" class="glyphicon glyphicon-sort-by-attributes span-order-by"></span>');
//                            }else{
//                                scope.model = '-'+field;
//                                $(that).append('<span style="margin-left: 5px;" class="glyphicon glyphicon-sort-by-attributes-alt span-order-by"></span>');
//                            }
//                        }
                        
                    });
                });
                
//                  var src = elem.find('img').attr('src');
//
//                  // call your SmoothZoom here
//                  angular.element(attrs.options).css({'background-image':'url('+ scope.item.src +')'});
//                });             
            }
        };
	};

    var GcUtils = angular.module('gc-utils', []);
    
    GcUtils.service  ('gcCollection'  , gcCollection  );
    GcUtils.service  ('gcObject'      , gcObject      );
    GcUtils.service  ('gcClock'       , gcClock       );
    GcUtils.service  ('ProvadorVirtualMotor', ProvadorVirtualMotor);
    GcUtils.directive('onFinishRender', onFinishRender);
    GcUtils.directive('gcOrderBy'     , gcOrderBy     );

    GcUtils.directive('ngAtalho', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
				//se for campo data e apertar t vai setar a data de hoje
				if(event.target.type == 'date'){
					if(event.which === 84) {
						var element = event.currentTarget //angular.element(event.currentTarget);
						var readonly = element.getAttribute('readonly');
						var disabled = element.getAttribute('disabled');
						// console.log(readonly);
						// console.log(disabled);
						if(readonly === null && disabled === null){
							console.log(attrs.ngModel);
							var date = moment().toDate();
							scope.$eval(attrs.ngModel + "=d", {d: new Date(date)});
							scope.$apply();
						}                    
					}
                }else if(event.target.type == 'month'){
                    if(event.which === 84) {
						var element = event.currentTarget //angular.element(event.currentTarget);
						var readonly = element.getAttribute('readonly');
						var disabled = element.getAttribute('disabled');
						// console.log(readonly);
						// console.log(disabled);
						if(readonly === null && disabled === null){
							console.log(attrs.ngModel);
							var date = moment().toDate();
							scope.$eval(attrs.ngModel + "=d", {d: new Date(date)});
							scope.$apply();
						}                    
					}
				}else if(event.target.type == 'datetime'){
					if(event.which === 84) {
						var element = event.currentTarget //angular.element(event.currentTarget);
						var readonly = element.getAttribute('readonly');
						var disabled = element.getAttribute('disabled');
						// console.log(readonly);
						// console.log(disabled);
						if(readonly === null && disabled === null){
							console.log(attrs.ngModel);
							var date = moment().toDate();
							scope.$eval(attrs.ngModel + "=d", {d: new Date(date)});
							scope.$apply();
						}                    
					}
				}else if(event.target.type == 'datetime-local'){
					if(event.which === 84) {
						var element = event.currentTarget //angular.element(event.currentTarget);
						var readonly = element.getAttribute('readonly');
						var disabled = element.getAttribute('disabled');
						// console.log(readonly);
						// console.log(disabled);
						if(readonly === null && disabled === null){
							console.log(attrs.ngModel);
							var date = moment().seconds(0).milliseconds(0).toDate();
							
							scope.$eval(attrs.ngModel + "=d", {d: new Date(date)});
							scope.$apply();
						}                    
					}
				}else if(event.target.type == 'time'){
					if(event.which === 84) {
						var element = event.currentTarget //angular.element(event.currentTarget);
						var readonly = element.getAttribute('readonly');
						var disabled = element.getAttribute('disabled');
						// console.log(readonly);
						// console.log(disabled);
						if(readonly === null && disabled === null){
							console.log(attrs.ngModel);
							var date = moment().toDate();
							var horamin = new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(),0,0);
							scope.$eval(attrs.ngModel + "=d", {d: horamin});
							scope.$apply();
						}                    
					}
				}                
            });
        };
    });
      
	GcUtils.directive('onScrollToBottom', function(){
		return {	
			restrict: 'A',
			link: function(scope,elem,attrs){
				$(elem).on('scroll', function(evt){
					var doc = evt.currentTarget;
					// método anterior: if(doc.scrollHeight - doc.scrollTop === doc.clientHeight){
					if(doc.scrollHeight - doc.scrollTop - doc.clientHeight <= 1){
						// console.log('a',doc.scrollHeight,'b',doc.scrollTop,'c',doc.clientHeight);
						scope.$apply(attrs.onScrollToBottom);
					}
				});
				
				/*$(elem).on('mousewheel', function(e){
					if(e.originalEvent.wheelDelta /120 > 0) {
						console.log('scrolling up !');
						scope.$apply(attrs.onScrollUP);
					}else{
						if(e.originalEvent.wheelDelta == -120){
							var doc = e.currentTarget;
							if(doc.scrollHeight - doc.scrollTop === doc.clientHeight){
								console.log('scrolled to bottom!');
								scope.$apply(attrs.onScrollDown);	
							}
						}
					}	
				})*/
			}	
		}	
	});

    GcUtils.directive('onScrollToBottomFixed', function($timeout){
        return {	
            restrict: 'A',
            link: function(scope,elem,attrs){
                var timeout;
                $(elem).on('scroll', function(evt){
                    var doc = evt.currentTarget;
                    if(Math.abs(doc.scrollHeight - doc.scrollTop - doc.clientHeight) <= 3.0){
                        if (timeout) {
                            $timeout.cancel(timeout);
                        }
                        timeout = $timeout(function() {
                            scope.$apply(attrs.onScrollToBottomFixed);
                        }, 500);
                    }
                });
            }	
        }	
    });

	GcUtils.directive('onScrollUp', function(){
		return {	
			restrict: 'A',
			link: function(scope,elem,attrs){				
				$(elem).on('mousewheel', function(e){
					if(e.originalEvent.wheelDelta /120 > 0) {
						// console.log('scrolling up !');
						scope.$apply(attrs.onScrollUp);
					}	
				})
			}	
		}	
	});

	GcUtils.directive('onScrollDown', function(){
		return {	
			restrict: 'A',
			link: function(scope,elem,attrs){				
				$(elem).on('mousewheel', function(e){					
					if(e.originalEvent.wheelDelta == -120){
						var doc = e.currentTarget;
						// if(doc.scrollHeight - doc.scrollTop === doc.clientHeight){
						// if(doc.scrollTop === (doc.scrollHeight - doc.offsetHeight)){
						if(doc.scrollHeight - doc.scrollTop - doc.clientHeight <= 1){
							// console.log('scrolled to bottom!');
							scope.$apply(attrs.onScrollDown);	
						}
					}						
				})
			}	
		}	
    });

    GcUtils.directive('onScrollDownFixed', function(){
		return {	
			restrict: 'A',
			link: function(scope,elem,attrs){				
				$(elem).on('mousewheel', function(e){					
					if(e.originalEvent.wheelDelta == -120){
						var doc = e.currentTarget;
						if(Math.abs(doc.scrollHeight - doc.scrollTop - doc.clientHeight) <= 3.0){
							scope.$apply(attrs.onScrollDownFixed);	
						}
					}						
				})
			}	
		}	
    });
    
    GcUtils.directive('onlyDigits', function () {
        return {
          require: 'ngModel',
          restrict: 'A',
          link: function (scope, element, attr, ctrl) {
            function inputValue(val) {
              if (val) {
                var digits = val.replace(/[^0-9]/g, '');
    
                if (digits !== val) {
                  ctrl.$setViewValue(digits);
                  ctrl.$render();
                }
                return parseInt(digits,10);
              }
              return undefined;
            }            
            ctrl.$parsers.push(inputValue);
          }
        };
	});

    GcUtils.directive('onlyAlphanumeric', function () {
        return {
          require: 'ngModel',
          restrict: 'A',
          link: function (scope, element, attr, ctrl) {
            function inputValue(val) {
              if (val) {
                var digits = val.replace(/[^a-zA-Z0-9]+/g, '');

                if (digits !== val) {
                  ctrl.$setViewValue(digits);
                  ctrl.$render();
                }
                return digits;
              }
              return undefined;
            }            
            ctrl.$parsers.push(inputValue);
          }
        };
	});
    
    GcUtils.directive('onlyDigits2', function () {
        return {
          require: 'ngModel',
          restrict: 'A',
          link: function (scope, element, attr, ctrl) {
            function inputValue(val) {
              if (val) {
                var digits = val.replace(/[^0-9]/g, '');
    
                if (digits !== val) {
                  ctrl.$setViewValue(digits);
                  ctrl.$render();
                }
                return digits;
              }
              return undefined;
            }            
            ctrl.$parsers.push(inputValue);
          }
        };
	});

    GcUtils.directive('ngProvadorVirtual', function(ProvadorVirtualMotor) {

        return {
            restrict: 'E',
            scope: {
                produto: '=',
                usuario: '='
            },
            template: `
                <div class="gc-provador">

                    <div class="gc-provador-preview">
                        <video autoplay playsinline></video>
                        <img class="gc-provador-overlay"
                            ng-src="{{produto.IMAGEM_PROVADOR}}">
                    </div>

                    <div class="gc-provador-resultado">
                        <div ng-repeat="(campo, status) in resultado">
                            <strong>{{campo}}</strong>:
                            <span class="status {{status}}">
                                {{status}}
                            </span>
                        </div>
                    </div>

                </div>
            `,
            link: function(scope, element) {

                scope.resultado = {};

                scope.$watchGroup(
                    ['produto', 'usuario'],
                    function() {
                        if (!scope.produto || !scope.usuario) return;

                        scope.resultado =
                            ProvadorVirtualMotor.compararProduto(
                                scope.produto,
                                scope.usuario
                            );
                    },
                    true
                );

                var video = element.find('video')[0];

                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(function(stream) {
                            video.srcObject = stream;
                        })
                        .catch(function() {});
                }

            }
        };

    });

    GcUtils.directive('ngProvadorAvatar', function(ProvadorVirtualMotor) {
        return {
            restrict: 'E',
            scope: {
                produto: '=',
                usuario: '='
            },
            template: `
                <div class="gc-avatar-provador">

                    <div class="avatar-stage">
                        <img class="avatar"
                            ng-src="/assets/images/avatar_{{usuario.biotipo}}.png">

                        <img class="roupa"
                            ng-style="estiloRoupa"
                            ng-src="{{produto.IMAGEM_PROVADOR}}">
                    </div>

                    <div class="legenda">
                        <span class="tag {{statusGlobal}}">
                            {{statusGlobal}}
                        </span>
                    </div>

                </div>
            `,
            link: function(scope) {

                function atualizar() {

                    if (!scope.produto || !scope.usuario) return;

                    const resultado =
                        ProvadorVirtualMotor.compararProduto(
                            scope.produto,
                            scope.usuario
                        );

                    scope.statusGlobal = 'IDEAL';

                    angular.forEach(resultado, function(val) {
                        if (val === 'JUSTO') scope.statusGlobal = 'JUSTO';
                    });

                    scope.estiloRoupa = {
                        transform: escalaPorStatus(scope.statusGlobal)
                    };
                }

                function escalaPorStatus(status) {
                    if (status === 'JUSTO') return 'scale(0.95)';
                    if (status === 'LARGO') return 'scale(1.05)';
                    return 'scale(1)';
                }

                scope.$watchGroup(
                    ['produto', 'usuario'],
                    atualizar,
                    true
                );
            }
        };
    });



    GcUtils.$inject = ['$window'];

    GcUtils.directive('ngWindowResize', function ($window) {
        return {
            restrict: 'A',
            scope: {
                onResize: '&' // Binding for the function to call
            },
            link: function(scope) {
                angular.element($window).on('resize', function() {
                    scope.$apply(function() {
                        // Call the provided function on window resize
                        scope.onResize();
                    });
                });
            }
        };
	});

    GcUtils.directive('ngCheckVisibility', function($window){
        return {
            restrict: 'A',
            scope: {
                onVisibilityChange: '&'
            },
            link: function(scope, element, attrs) {
                angular.element(document).ready(function() {
                    var previousVisibility = false;

                    scope.$watch(function(){
                        if (element !== null || element !== undefined) return element.is(':visible');
                    }, function(newVisibility){
                        if (newVisibility !== previousVisibility) {
                            scope.onVisibilityChange({visible: newVisibility});
                            previousVisibility = newVisibility;
                        }
                    });
                });
            }
        }
    });
    
    GcUtils.directive('checkStandard', function () {
        return function (scope, element, attrs) {
			// element.bind("click", function (event) {
			// 	//element[0].setAttribute("editando", true);
			// 	tratInputValue(event.currentTarget, scope, element, attrs);                     
			// });

			if(attrs.type == 'checkbox'){					
				if(trim_null(attrs.checkStandard) == ''){
					if(trim_null(attrs.ngDisabled) != ''){
						//scope.$eval(attrs.ngDisabled) == true
						//attrs.class = trim_null(attrs.class)+" no_selectable";
						//element[0].className = trim_null(element[0].className)+" no_selectable";
						attrs.ngClass = "{ 'no_selectable': "+angular.copy(attrs.ngDisabled)+" }";						
						attrs.ngDisabled = '';						
						// scope.$apply();
					}else if(trim_null(attrs.ngReadonly) != ''){
						attrs.ngClass = angular.copy(attrs.ngReadonly)+" ? 'no_selectable' : ''";						
						attrs.ngDisabled = '';
					}

					// var a = $(element[0]).next('label');
					// if(a.length > 0){
					// 	if(a.attr('for') == (element[0]).id){
					// 		console.log('label achada');
					// 	}
					// }

				}else{
					attrs.ngClass = angular.copy(attrs.checkStandard)+" ? 'no_selectable' : ''";						
					attrs.checkStandard = '';				
				}							
			}
			
			// function tratInputValue(event, scope, element, attrs){
			// 	if(attrs.type == 'checkbox'){					
			// 		if(trim_null(attrs.checkStandard) == ''){
			// 			if(trim_null(attrs.ngDisabled) != ''){
			// 				//scope.$eval(attrs.ngDisabled) == true
			// 				//attrs.class = trim_null(attrs.class)+" no_selectable";
			// 				//element[0].className = trim_null(element[0].className)+" no_selectable";
			// 				attrs.ngClass = "{ 'no_selectable': "+angular.copy(attrs.ngDisabled)+" }";						
			// 				attrs.ngDisabled = '';
			// 				// $timeout(function(){
			// 				// 	scope.$apply();
			// 				// });
			// 				scope.$apply();
			// 			}else if(trim_null(attrs.ngReadonly) != ''){
			// 				attrs.ngClass = angular.copy(attrs.ngReadonly)+" ? 'no_selectable' : ''";						
			// 				attrs.ngDisabled = '';
			// 			}

			// 			// var a = $(element[0]).next('label');
			// 			// if(a.length > 0){
			// 			// 	if(a.attr('for') == (element[0]).id){
			// 			// 		console.log('label achada');
			// 			// 	}
			// 			// }

			// 		}else{
			// 			attrs.ngClass = angular.copy(attrs.checkStandard)+" ? 'no_selectable' : ''";						
			// 			attrs.checkStandard = '';				
			// 		}							
			// 	}
			// }  
        };
	});
    
    var cod_gen_key = 0;

	GcUtils.directive('popOver', function (/*$templateCache,*/ $compile) {
        // var getTemplate = function () {
        //     $templateCache.put('templateId.html', 'This is the content of the template');
        //     console.log($templateCache.get("popover_template.html"));
        //     return $templateCache.get("popover_template.html");
        // }
        return {
			restrict: "A",
            transclude: true,
            link: function (scope, element, attrs) {
                var popOverContent;
                if (scope.html) {
                    var html = scope.html;
                    popOverContent = $compile(html)(scope);                    
                    var options = {
                        content: popOverContent,
						placement: element.place,
						// trigger: "hover",
                        html: true,
                        title: scope.title
                    };
                    $(element).popover(options);
                }
            },
            scope: {
                dados: '@',
				title: '@',
				html: '='
            }
        };
    });
	
	// GcUtils.directive('onImportFile', function(){
	// 	return {	
	// 		restrict: 'A',
	// 		link: function(scope,elem,attrs){				
	// 			$(elem).on('mousewheel', function(e){					
	// 				if(e.originalEvent.wheelDelta == -120){
	// 					var doc = e.currentTarget;
	// 					// if(doc.scrollHeight - doc.scrollTop === doc.clientHeight){
	// 					// if(doc.scrollTop === (doc.scrollHeight - doc.offsetHeight)){
	// 					if(doc.scrollHeight - doc.scrollTop - doc.clientHeight < 1){
	// 						// console.log('scrolled to bottom!');
	// 						scope.$apply(attrs.onScrollDown);	
	// 					}
	// 				}						
	// 			})
	// 		}	
	// 	}	
    // });

	GcUtils.directive('onImportFile', ['$parse', function($parse) {

		return {
			require: 'ngModel',
			restrict: 'A',
			link: function ($scope, element, attrs, ngModel) {

				// Get the function provided in the file-change attribute.
				// Note the attribute has become an angular expression,
				// which is what we are parsing. The provided handler is 
				// wrapped up in an outer function (attrHandler) - we'll 
				// call the provided event handler inside the handler()
				// function below.
				var attrHandler = $parse(attrs['onImportFile']);

				// This is a wrapper handler which will be attached to the
				// HTML change event.
				var handler = function (e) {
					$scope.$apply(function () {
						// Execute the provided handler in the directive's scope.
						// The files variable will be available for consumption
						// by the event handler.
						attrHandler($scope, { $event: e, files: e.target.files });
					});
				};
				console.log('diretiva files executada');
				// Attach the handler to the HTML change event 
				element[0].addEventListener('change', handler, false);
			}
		};
    }]);

    GcUtils.directive('ngBindHtmlCompile', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.$eval(attrs.ngBindHtmlCompile);
                }, function (value) {
                    // In case value is a TrustedValueHolderType, sometimes it
                    // needs to be explicitly called into a string in order to
                    // get the HTML string.
                    element.html(value && value.toString());
                    // If scope is provided use it, otherwise use parent scope
                    var compileScope = scope;
                    if (attrs.ngBindHtmlCompile) {
                        compileScope = scope.$eval(attrs.ngBindHtmlCompile);
                    }
                    $compile(element.contents())(compileScope);
                });
            }
        };
    }]);

    ////////////////////////////////////////////////////// INICIO - ngNumberFormat

    function setInputValueForce(event, scope, element, attrs, ctrl, timeout, tipo, onFormat, onFormatErro, model, no_tmp){
        var element = event;
        var mask    = Number(attrs.ngNumberFormat);
        var tmp     = (element.value+'').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','').replace(',','.');
            tmp     = tmp == '' ? '0' : tmp;
            
        try {
            tmp = num_trunc(tmp, mask);   
        } catch (error) {
            tmp = 0;   
        }

        var vlr = Number(tmp);

        if(!isNaN(vlr) && isNumber(vlr) && isFinite(vlr)){

            var min = Number(element.getAttribute('min'));
            var max = Number(element.getAttribute('max'));

            var new_value = vlr;

            if(!isNaN(min) && isNumber(min) && isFinite(min)){
                if(vlr < min){
                    new_value = min;
                }
            }

            if(!isNaN(max) && isNumber(max) && isFinite(max)){
                if(vlr > max && max > 0){
                    new_value = max;
                }
            }

            if(tipo == 2){
                vlr = new_value;
            }

            timeout(function(){

                scope.$eval(model + "=d", {d: new_value});
                scope.$apply();    

                if(new_value != vlr){
                    $(element).removeClass('has-error-number');
                    $(element).addClass('has-error-number');
                }else{
                    $(element).removeClass('has-error-number');
                }

            },1);            

        }else{
            vlr = 0;

            var min = Number(element.getAttribute('min'));
            if(!isNaN(min) && isNumber(min) && isFinite(min)){
                vlr = min;
            }

            scope.$eval(model + "=d", {d: vlr});
            scope.$apply();    
        }    
    }

    function setInputValue(event, scope, element, attrs, ctrl, timeout, tipo, onFormat, onFormatErro, model, no_tmp){
        var element = event;
        var mask    = Number(attrs.ngNumberFormat);
        var tmp     = (element.value+'').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','').replace(',','.');
            tmp     = tmp == '' ? '0' : tmp;
            
            try {
                tmp = num_trunc(tmp, mask);   
            } catch (error) {
                tmp = 0;   
            }

        var vlr    = Number(tmp);

        if(!isNaN(vlr) && isNumber(vlr) && isFinite(vlr)){

            /*
            ctrl.$setViewValue(vlr);
            ctrl.$render();

            element.value = formatNumber(vlr, mask, ',', '.');
            $(element).removeClass('has-error-number');
            */

            if(tipo == 2){
                var min = Number(element.getAttribute('min'));
				var max = Number(element.getAttribute('max'));

                if(!isNaN(min) && isNumber(min) && isFinite(min)){
                    if(vlr < min){
                        vlr = min;
                    }
                }

                if(!isNaN(max) && isNumber(max) && isFinite(max)){
                    if(vlr > max && max > 0){
                        vlr = max;
                    }
                }
            }

            timeout(function(){
                if(!no_tmp){
                    scope.$eval(model + "=d", {d: vlr});
                    scope.$apply();    
                }

                scope.$eval(attrs.ngModel + "=d", {d: vlr});
                scope.$apply();
                element.value = formatNumber(vlr, mask, ',', '.');
                $(element).removeClass('has-error-number');

                try {scope.$eval(onFormat);} catch (error) {console.log(error); }

            },1);

        }else{
            $(element).addClass('has-error-number');
            console.log('Erro no numero ('+vlr+') ('+element.value+')');

            try {scope.$eval(onFormatErro);} catch (error) {console.log(error); }
        }    
                
        //var readonly = element.getAttribute('readonly');
        //var disabled = element.getAttribute('disabled');     
    }

    function tratInputValue(event, scope, element, attrs, ctrl){
        var element = event;
        var mask    = Number(attrs.ngNumberFormat);
        var tmp     = (element.value+'').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','');

        var vlr     = Number(tmp.replace(',','.'));

        element.value = (vlr+'').replace('.',','); 
        
        if(isNaN(vlr) || !isNumber(vlr) || !isFinite(vlr)){
            $(element).addClass('has-error-number');
        }else{
            $(element).removeClass('has-error-number');
        }
    }

    GcUtils.directive('ngNumberFormat', ['$timeout', function ($timeout) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {

                var timeout      = $timeout;
                var onFormat     = attrs.ngOnformat
                var onFormatErro = attrs.ngOnformaterro;

                ctrl.$formatters.push(function(value) {

                    value = isNumber(value) ? (value+'').replace('.',',') : value;

                    value = typeof value == 'undefined' ? '0' : value;

                    var mask = Number(attrs.ngNumberFormat);
                    
                        var vld = (value+'').replace(/[^0-9\,-]/g, '');

                        var tmp  = (vld+'').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','').replace(',','.');
                            tmp  = tmp == '' ? '0' : tmp; 

                            vld = (tmp+'').replace(/[^0-9]/g, '');
                        
                        if(vld != ''){
                            tmp = num_trunc(tmp, mask);
                        }else{
                            tmp = 0;
                        }

                        /*
                        var forme  = scope[element[0].form.name];
                        var item_f = forme[element[0].name];

                        item_f.$error.min = true;
                        item_f.$error.max = true;
                        */
                        

                    var vlr  = Number(tmp);

                    if(!isNaN(vlr) && isNumber(vlr) && isFinite(vlr)){
                        var ret = formatNumber(vlr, mask, ',', '.');
                    }else{
                        var ret = '0';
                    }

                    return ret;
                });

                ctrl.$parsers.push(function(val) {

                    if (val) {
                        var digits = (val+'').replace(/[^0-9\,-]/g, '');
                        
                        if (digits !== val) {
                            ctrl.$setViewValue(digits);
                            ctrl.$render();
                        }else{
                            if (',' == val) {
                                ctrl.$setViewValue('0,');
                                ctrl.$render();
                            }else{
                                if ('-,' == val) {
                                    ctrl.$setViewValue('-0,');
                                    ctrl.$render();
                                }
                            }
                        }

                        var ele = event.currentTarget
                        var tmp = (ele.value+'').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','').replace('.','');
                            tmp = Number((tmp+'').replace(',','.'));
                        
                        if(isNaN(tmp) || !isNumber(tmp) || !isFinite(tmp)){
                            $(ele).addClass('has-error-number');
                        }else{
                            $(ele).removeClass('has-error-number');
                        }

                        timeout(function(){ try {scope.$eval(onFormat);} catch (error) {console.log(error); }},100);

                        return digits;
                    }

                    timeout(function(){ try {scope.$eval(onFormatErro);} catch (error) {console.log(error); }},100);

                    return undefined;
                });

                element.bind("keyup", function (event) {
                    element[0].setAttribute("editando", false);

                    var model  = element[0].getAttribute('ng-tmp-model');
                    if(typeof model != 'undefined' && (model+'').length > 2 && model != 'null' && model != null){
                        setInputValueForce(event.currentTarget, scope, element, attrs, ctrl, timeout, 1, onFormat, onFormatErro, model, false);
                    }  
                });

                element.bind("change", function (event) {
                    element[0].setAttribute("editando", false);

                    var model  = element[0].getAttribute('ng-tmp-model');
                    var no_tmp = true; if(typeof model != 'undefined' && (model+'').length > 2 && model != 'null' && model != null){no_tmp = false;}

                    setInputValue(event.currentTarget, scope, element, attrs, ctrl, timeout, 1, onFormat, onFormatErro, model, no_tmp);    
                });

                element.bind("click", function (event) {
                    element[0].setAttribute("editando", true);
                    tratInputValue(event.currentTarget, scope, element, attrs, ctrl);                     
                });

                element.bind("blur", function (event) {
                    element[0].setAttribute("editando", false);

                    var model  = element[0].getAttribute('ng-tmp-model');
                    var no_tmp = true; if(typeof model != 'undefined' && (model+'').length > 2 && model != 'null' && model != null){no_tmp = false;}

                    setInputValue(event.currentTarget, scope, element, attrs, ctrl, timeout, 2, onFormat, onFormatErro, model, no_tmp);    
                });
            }         
        };
    }]);
    ////////////////////////////////////////////////////// FIM - ngNumberFormat

    ////////////////////////////////////////////////////// INICIO - ngNumberCurrencyFormat

    GcUtils.directive('ngNumberCurrencyFormat', ['$timeout', function ($timeout) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
    
                var decimalPlaces = parseInt(attrs.ngNumberCurrencyFormat) || 2; // Padrão: 3 casas decimais
    
                function formatValue(value) {
                    if (!value) return '0,' + '0'.repeat(decimalPlaces);
    
                    // Remove caracteres não numéricos
                    value = value.replace(/\D/g, '');
    
                    // Converte para número e divide pela quantidade correta para deslocamento decimal
                    let divisor = Math.pow(10, decimalPlaces);
                    let number = parseFloat(value) / divisor;
    
                    // Formata com separador decimal (vírgula) e o número de casas definido
                    return number.toLocaleString('pt-BR', { 
                        minimumFractionDigits: decimalPlaces, 
                        maximumFractionDigits: decimalPlaces 
                    });
                }
    
                ctrl.$parsers.push(function (val) {
                    if (!val) return '';
    
                    let formattedValue = formatValue(val);
    
                    // Atualiza o valor da input formatado
                    ctrl.$setViewValue(formattedValue);
                    ctrl.$render();
    
                    return formattedValue;
                });
    
                ctrl.$formatters.push(function (value) {
                    return formatValue(value);
                });
    
                element.on('input', function () {
                    scope.$apply(function () {
                        ctrl.$setViewValue(formatValue(element.val()));
                        ctrl.$render();
                    });
                });
            }
        };
    }]);
    
    ////////////////////////////////////////////////////// FIM - ngNumberCurrencyFormat

    ////////////////////////////////////////////////////// INÍCIO - shortcut

    GcUtils.directive('shortcut', ['$document', function($document) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {

                if (!window.__executedShortcuts) {
                    window.__executedShortcuts = new Set();
                }


                function parseShortcut(str) {
                    const keys = str.toLowerCase().split('+');
                    return {
                        ctrl: keys.includes('ctrl'),
                        alt: keys.includes('alt'),
                        shift: keys.includes('shift'),
                        meta: keys.includes('meta'),
                        key: keys.find(k => !['ctrl', 'alt', 'shift', 'meta'].includes(k))?.replace('esc', 'escape'),
                    };
                }
    
                const shortcutKeys = parseShortcut(attrs.shortcut);
    
                function matchesShortcut(e) {
                    return (
                        e.ctrlKey === shortcutKeys.ctrl &&
                        e.altKey === shortcutKeys.alt &&
                        e.shiftKey === shortcutKeys.shift &&
                        e.metaKey === (shortcutKeys.meta || false) &&
                        e.key.toLowerCase() === shortcutKeys.key
                    );
                }
    
                function isInputElement(el) {
                    return false;
                }
    
                function getTopModal() {
                    const modals = Array.from(document.querySelectorAll('.modal.show'));
                    if (modals.length === 0) return null;

                    return modals.reduce((topModal, currentModal) => {
                        const topZ = parseInt(window.getComputedStyle(topModal).zIndex) || 0;
                        const currentZ = parseInt(window.getComputedStyle(currentModal).zIndex) || 0;
                        return currentZ > topZ ? currentModal : topModal;
                    });
                }
    
                function isInside(el, container) {
                    while (el) {
                        if (el === container) return true;
                        el = el.parentElement;
                    }
                    return false;
                }
    
                function isVisible(el) {
                    if (!el) return false;
                    if (el.classList.contains('ng-hide')) return false;
                    const style = window.getComputedStyle(el);
                    if (
                        style.display === 'none' ||
                        style.visibility === 'hidden' ||
                        parseFloat(style.opacity) === 0
                    ) return false;
                    if (el.offsetParent === null) return false;
                    const rect = el.getBoundingClientRect();
                    return !(rect.width === 0 || rect.height === 0);
                }
    
                function onKeydown(e) {
                    if (isInputElement(e.target)) return;
                
                    // Matcha o atalho da tecla pressionada
                    if (!matchesShortcut(e)) return;
                
                    e.preventDefault();
                
                    const allShortcutElements = Array.from(document.querySelectorAll('[shortcut]'));
                    const matchingElements = allShortcutElements.filter(el => {
                        const shortcutAttr = el.getAttribute('shortcut');
                        return shortcutAttr && parseShortcut(shortcutAttr).key === shortcutKeys.key && isVisible(el);
                    });
                
                    if (matchingElements.length === 0) return;
                
                    // Dá prioridade a elementos dentro do último modal aberto
                    const topModal = getTopModal();
                
                    let targetEl = null;
                
                    if (topModal) {
                        targetEl = matchingElements.find(el => isInside(el, topModal));
                    }
                
                    if (!targetEl) {
                        // Se não tem modal visível com esse atalho, pega o mais visível na página
                        targetEl = matchingElements.find(el => !el.closest('.modal') || isInside(el, document.body));
                    }
                
                    if (targetEl && typeof targetEl.click === 'function') {
                        const shortcutId = targetEl.getAttribute('data-shortcut-id') || '';

                        if (window.__executedShortcuts.has(shortcutId)) return;

                        window.__executedShortcuts.add(shortcutId);
                        targetEl.click();

                        // Libera a trava na próxima execução do ciclo do navegador
                        requestAnimationFrame(() => {
                            window.__executedShortcuts.delete(shortcutId);
                        });
                    }

                }
    
                function onKeyup(e) {
                    if (matchesShortcut(e)) {
                        
                    }
                }
    
                if (attrs.shortcut && attrs.shortcutLabel !== 'false') {
                    const shortcutLabel = document.createElement('span');
                    shortcutLabel.innerText = attrs.shortcut.toUpperCase();
                    shortcutLabel.className = 'shortcut-label';
                    element.css('position', 'relative');
                    element[0].appendChild(shortcutLabel);
                }
    
                const boundHandler = onKeydown.bind(null);
                element[0].setAttribute('data-shortcut-id', attrs.shortcut.toLowerCase());

                if (!window.__registeredShortcuts) {
                    window.__registeredShortcuts = {};
                }

                if (!window.__registeredShortcuts[attrs.shortcut]) {
                    $document.on('keydown', boundHandler);
                    window.__registeredShortcuts[attrs.shortcut] = true;
                }

                $document.on('keyup', onKeyup);
    
                scope.$on('$destroy', function () {
                    $document.off('keydown', boundHandler);
                    delete window.__registeredShortcuts[attrs.shortcut];
                });
            }
        };
    }]);
    
    

    ////////////////////////////////////////////////////// FIM - shortcut

    GcUtils.directive('ngMaskPlaca', ['$timeout', function ($timeout) {
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, element, attrs, ngModel) {

            var addSpaces = function(value) {
              if (typeof(value) == typeof(undefined))
                return value;

                var mercosul = /([A-Za-z]{3}[0-9]{1}[A-Za-z]{1})/;
                var normal   = /([A-Za-z]{3}[0-9]{2})/;
                var replaced = (value+'').replace(/[^\w]/g, '');

                if (normal.exec(replaced) || !mercosul.exec(replaced)) {

                    var p1 = (replaced+'').substring(0,3) || '';
                    var p2 = (replaced+'').substring(3,7) || '';

                    p1 = (p1+'').replace(/[0-9]/g , '')+'-';
                    p2 = (p2+'').replace(/[^0-9]/g, '');

                    var parsedValue = (p1 + p2)
                    .toUpperCase()
                    .replace(/-$/, '');

                } else if (mercosul.exec(replaced)) {

                    var p1 = (replaced+'').substring(0,3) || '';
                    var p2 = (replaced+'').substring(3,4) || '';
                    var p3 = (replaced+'').substring(4,5) || '';
                    var p4 = (replaced+'').substring(5,7) || '';

                    p1 = (p1+'').replace(/[0-9]/g  , '') +'-';
                    p2 = (p2+'').replace(/[^0-9]/g , ''); 
                    p3 = (p3+'').replace(/[0-9]/g  , '');
                    p4 = (p4+'').replace(/[^0-9]/g , '');   

                    var parsedValue = (p1+p2+p3+p4)
                    .toUpperCase()
                    .replace(/-$/, '');
                }

                return parsedValue;
            }
       
            var removeSpaces = function(value) {
              if (typeof(value) == typeof(undefined))
                return value;
              var parsedValue = value.toString().replace(/\s/g, '').replace(/-/g, '');
              return parsedValue;
            }
       
            var parseViewValue = function(value) {
              var viewValue = addSpaces(value);
              ngModel.$viewValue = viewValue;
              ngModel.$render();
       
              // Return what we want the model value to be
              return removeSpaces(viewValue);
            }
       
            var formatModelValue = function(value) {
              var modelValue = removeSpaces(value);
              //ngModel.$modelValue =  (modelValue+'').replace('-','');
              return addSpaces(modelValue);
            }
       
            ngModel.$parsers.push(parseViewValue);
            ngModel.$formatters.push(formatModelValue);

            element.bind("blur", function (event) {
                parseViewValue(ngModel.$modelValue);
            });

          }
        };
    }]);

    GcUtils.directive('ngMaskDiaMes', ['$timeout', function ($timeout) {
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, element, attrs, ngModel) {

            var addSpaces = function(value) {
              if (typeof(value) == typeof(undefined))
                return value;

                var normal   = /([0-9]{2}[0-9]{2})/;
                var replaced = (value+'').replace(/[^\w]/g, '');

                var p1 = (replaced+'').substring(0,2) || '';
                var p2 = (replaced+'').substring(2,4) || '';

                p1 = (p1+'').replace(/[^0-9]/g , '');
                p2 = (p2+'').replace(/[^0-9]/g, '');

                if(Number(p2) > 12){
                    p2 = '';
                }

                var parsedValue = (p1 + ( (p1 + p2).length > 2 ? '/' : '') + p2)
                .toUpperCase()
                .replace(/-$/, '');

                return parsedValue;
            }
       
            var removeSpaces = function(value) {
              if (typeof(value) == typeof(undefined))
                return value;
              var parsedValue = value.toString().replace(/\s/g, '').replace(/-/g, '');
              return parsedValue;
            }
       
            var parseViewValue = function(value) {
            
                var viewValue = addSpaces(value);
                $timeout(function(){
                    ngModel.$viewValue = viewValue;
                    ngModel.$render();
                });

                return removeSpaces(viewValue);
            }
       
            var formatModelValue = function(value) {
              var modelValue = removeSpaces(value);
              return addSpaces(modelValue);
            }
       
            ngModel.$parsers.push(parseViewValue);
            ngModel.$formatters.push(formatModelValue);

            element.bind("blur", function (event) {
                parseViewValue(ngModel.$modelValue);
            });

            element.bind("change", function (event) {
                parseViewValue(ngModel.$modelValue);
            });

            element.bind("keydown", function (event) {
                parseViewValue(ngModel.$modelValue);    
            });
          }
        };
    }]);

    GcUtils.directive('formSubmitValidation', function () {

        return {
            require: 'form',
            compile: function (tElem, tAttr) {

                tElem.data('augmented', true);

                return function (scope, elem, attr, form) {
                    elem.on('submit', function ($event) {

                        scope.$broadcast('form:submit', form);

                        if (!form.$valid) {
                            $event.preventDefault();
                        }

                        scope.$apply(function () {
                            scope.submitted = true;
                        });

                    });
                }
            }
        };
    });

    GcUtils.directive('ngMaskedInput', function ($timeout) {
        return {
          restrict: 'EA',
          require: 'ngModel',
          link: function(scope, element, attrs, ngModel) {
            console.log("In link function");
       
            var addSpaces = function(value) {
              if (typeof(value) == typeof(undefined))
                return value;
              var parsedValue = value.toString()
                .replace(/[^\dA-Za-z]/g, '')
                .replace(/(.{4})/g, '$1-').trim()
                .toUpperCase()
                .replace(/-$/, '');
              return parsedValue;
            }
       
            var removeSpaces = function(value) {
              if (typeof(value) == typeof(undefined))
                return value;
              var parsedValue = value.toString().replace(/\s/g, '').replace(/-/g, '');
              return parsedValue;
            }
       
            var parseViewValue = function(value) {
              var viewValue = addSpaces(value);
              ngModel.$viewValue = viewValue;
              ngModel.$render();
       
              // Return what we want the model value to be
              return removeSpaces(viewValue);
            }
       
            var formatModelValue = function(value) {
              var modelValue = removeSpaces(value);
              ngModel.$modelValue = modelValue;
              return addSpaces(modelValue);
            }
       
            ngModel.$parsers.push(parseViewValue);
            ngModel.$formatters.push(formatModelValue);
          }
        };
	});
	
    GcUtils.filter('numberFixedLen', function () {
        return function(a,b){
			return (''+a).padStart(b, 0);
		};
	});

	GcUtils.filter('numberFixDec', function () {
        return function(a,b){
			function number_format(number, decimals, decPoint, thousandsSep) {

				number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
				// number = trunc_number(number, decimals);
				// number = parseFloat(number).toFixed(decimals);
				number = num_trunc(number, decimals);

				var n = !isFinite(+number) ? 0 : +number
				var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
				var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
				var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
				var s = ''
			  
				var toFixedFix = function (n, prec) {
				  var k = Math.pow(10, prec)
				  return '' + (Math.round(n * k) / k)
					.toFixed(prec)
				}
				
				if(prec){
					s = '' + parseFloat(n).toFixed(prec);
				}else{
					s = '' + Math.round(n);
				}
			
				s = s.split('.');
			
				if (s[0].length > 3) {
				  s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
				}
				if ((s[1] || '').length < prec) {
				  s[1] = s[1] || ''
				  s[1] += new Array(prec - s[1].length + 1).join('0')
				}
			  
				return s.join(dec)
			}

			function countDecimals(number){
				number = typeof number == 'undefined' ? 0 : number;
				if(Math.floor(number.valueOf()) === number.valueOf()) return 0;
	
				if(typeof trim_null(number).split(".")[1] != 'undefined'){
					return trim_null(number).split(".")[1].length || 0; 
				}else{
					return 0; 
				}				
			}

			function calcularQuantidadeDecimais(number){
				var quantidadeDecimais 				= 0;
				var contarDecimaisNumber			= countDecimals(number);
	
				if(contarDecimaisNumber < 2){
					quantidadeDecimais 				= 2;
				}else if(contarDecimaisNumber > 5){
					quantidadeDecimais 				= 5;
				}else{
					quantidadeDecimais 				= contarDecimaisNumber;
				}
				
				return quantidadeDecimais;
			}

			var decimaisCustoUnitario = calcularQuantidadeDecimais(a);

			return number_format(Number(a), decimaisCustoUnitario, ',', '.');
			//return (a).padStart(b, 0);
		};
	});

	GcUtils.directive('checkStandard2', function () {
		return function (scope, element, attrs) {

			var id = 'CHECK_'+(cod_gen_key + 1)+'';
			scope[id] = {
				ORIGINAL_VALUE : scope.$eval(angular.element(element).attr('ng-model')),
				VALUE    	   : scope.$eval(angular.element(element).attr('ng-model')),
				EDITABLE 	   : true,
				MODEL    	   : trim_null(angular.element(element).attr('ng-model')) 
			};

			attrs.$set('id_chesc',id);
			
			if(trim_null(angular.element(element).attr('bind')) == ''){
				//angular.element(element).attr('bind','false');					
				if(trim_null(angular.element(element).attr('ng-disabled')) != ''){
					attrs.$set('bind',angular.copy(angular.element(element).attr('ng-disabled')));
					angular.element(element).removeAttr('ng-disabled');						
					attrs.ngDisabled = 'false';
				}else if(trim_null(angular.element(element).attr('ng-readonly')) != ''){
					attrs.$set('bind',angular.copy(angular.element(element).attr('ng-readonly')));
					angular.element(element).removeAttr('ng-readonly');
					attrs.ngReadonly = 'false';
				}		
			}

			scope.$watch(attrs.bind, function(condition){
				if(condition){	
					angular.element(element).addClass('no_selectable');				
					angular.element(element).attr('onclick','return false;');				
                    angular.element(element).attr('tabindex','-1');
					//e = e || window.event; 
					// angular.element(element).attr('onkeydown','if(typeof e == "undefined" || e.keyCode !== 9) return false;');				
					if(trim_null(angular.element(element).attr('ng-model')) != ''){
						// console.log(angular.element(element).attr('ng-model'));						
					}
					//angular.element(element).attr('editable','false');				
					attrs.$set('editable','false');
					var a = $( "label[for*='"+angular.element(element).attr('id')+"']" );
					if(a.length > 0){
						a.first().removeAttr('for');
						a.first().attr('for_std',angular.element(element).attr('id'));
					}
				}else{
					angular.element(element).removeClass('no_selectable');
					angular.element(element).removeAttr('onclick');				
                    angular.element(element).removeAttr('tabindex');
					// angular.element(element).removeAttr('onkeydown');									
					attrs.$set('editable','true');
					var a = $( "label[for_std*='"+angular.element(element).attr('id')+"']" );
					if(a.length > 0){
						a.first().removeAttr('for_std');
						a.first().attr('for',angular.element(element).attr('id'));
					}									
					//angular.element(element).attr('editable','true');
				}			
			});
			
			if(trim_null(angular.element(element).attr('ng-model')) != ''){

				scope.$watch(angular.element(element).attr('ng-model'), function (newValue, oldValue) {
					var id  = angular.element(element).attr('id_chesc');
					if(oldValue != newValue && typeof oldValue != 'undefined'){
						if(scope.$eval(attrs.bind) == true){
							if(scope[id].VALUE !== scope.$eval(angular.element(element).attr('ng-model')) && typeof scope.$eval(angular.element(element).attr('ng-model')) != 'undefined'){
								scope[id].VALUE =  scope.$eval(angular.element(element).attr('ng-model'));
							}
							var old = scope[id].VALUE;

							if(trim_null(old) === ''){
								if((typeof attrs.ngFalseValue != 'undefined')){
									old = attrs.ngFalseValue;
								}else{
									old = ''; 
								}
								
							}else{ 
								old = trim_null(old);
							}

							if(typeof old == 'string' && (typeof attrs.ngFalseValue != 'undefined' && typeof attrs.ngTrueValue != 'undefined')){
								if(("'"+old+"'") == attrs.ngFalseValue){
									old = ("'"+old+"'");
								}else if(("'"+old+"'") == attrs.ngTrueValue){
									old = ("'"+old+"'");
								}
							}

							attrs.$set('editable','true');
							scope.$eval(angular.element(element).attr('ng-model')+" = "+old);
						}else{

							if(typeof newValue == 'string' && (typeof attrs.ngFalseValue != 'undefined' && typeof attrs.ngTrueValue != 'undefined')){
								if(("'"+newValue+"'") == attrs.ngFalseValue){
									newValue = ("'"+newValue+"'");
								}else if(("'"+newValue+"'") == attrs.ngTrueValue){
									newValue = ("'"+newValue+"'");
								}
							}

							scope[id].VALUE = newValue;
							scope.$eval(angular.element(element).attr('ng-model')+" = "+(newValue));
						}
						
						// console.log(scope.$eval(angular.element(element).attr('ng-model')));
					}else{

						if(typeof newValue == 'string' && (typeof attrs.ngFalseValue != 'undefined' && typeof attrs.ngTrueValue != 'undefined')){
							if(("'"+newValue+"'") == attrs.ngFalseValue){
								newValue = ("'"+newValue+"'");
							}else if(("'"+newValue+"'") == attrs.ngTrueValue){
								newValue = ("'"+newValue+"'");
							}
						}
						scope[id].VALUE = newValue;
					}					
				});

			}
			// console.log('diretiva iniciada!');
		};
	});

    GcUtils.directive('ngCompareTo', function(){
        return {
            require: 'ngModel',
            scope: {
                otherModelValue: '=ngCompareTo'
            },
            link: function(scope, element, attributes, ngModel) {
                ngModel.$validators.ngCompareTo = function(modelValue) {
                    return modelValue == scope.otherModelValue;
                };
    
                scope.$watch('otherModelValue', function() {
                    ngModel.$validate();
                });
            }
        };
    });

    GcUtils.directive('ngLazyImage', function(){
        return {
            restrict: 'A',
            scope: {
                placeholder: '@',
                imgSrc: '@'
            },
            link: function(scope, element, attrs) {
                // Set the placeholder image initially
                element.attr('src', scope.placeholder);
    
                // Create a new Image object to load the actual image
                var img = new Image();
                img.src = scope.imgSrc;
    
                // Once the actual image has loaded, update the src attribute
                img.onload = function() {
                    element.attr('src', scope.imgSrc);
                };
    
                // Handle error case (optional)
                img.onerror = function() {
                    console.error('Failed to load image: ' + scope.imgSrc);
                };
            }
        };
    });

    // Adicione ao seu módulo AngularJS
    GcUtils.factory('safeCompiler', ['$compile', '$timeout', function($compile, $timeout) {

        function safeEmpty(element) {
            try {
            // remove listeners at the element level
            element.off && element.off();
            // empty the DOM
            element.empty && element.empty();
            } catch (e) {
            console.warn('safeEmpty error', e);
            }
        }

        function destroyScope(scope) {
            if (!scope) return;
            try {
                // dispara $destroy e tenta limpar watchers (não obrigatório)
                scope.$destroy && scope.$destroy();
                // optional: try to null internal references (help GC)
                if (scope.$$watchers) { scope.$$watchers.length = 0; }
                if (scope.$$listeners) { scope.$$listeners = {}; }
            } catch (e) {
                console.warn('destroyScope error', e);
            }
        }

        function getAssociatedScope(element) {
            // tenta a associação direta (element.data é mais seguro que manter array global)
            return element.data && element.data('safeCompilerChildScope') || null;
        }

        function setAssociatedScope(element, scope) {
            if (element.data) {
                element.data('safeCompilerChildScope', scope);
            } else {
                // fallback
                element.__safeCompilerScope = scope;
            }
        }

        function clearAssociatedScope(element) {
            if (element.data) {
                element.data('safeCompilerChildScope', null);
            } else {
                element.__safeCompilerScope = null;
            }
        }

        // Contadores / debug
        function countWatchers() {
            var root = angular.element(document.body).scope();
            var cnt = 0;
            (function trav(scope) {
                if (!scope) return;
                if (scope.$$watchers) cnt += scope.$$watchers.length;
                trav(scope.$$childHead);
                trav(scope.$$nextSibling);
            })(root && root.$root);
            return cnt;
        }

        function findOrphanWatchers() {
            var orphans = [];
            var root = angular.element(document.body).scope();
            function trav(scope) {
                if (!scope) return;
                // considered orphan if no DOM element attached
                var hasElement = !!(scope.$$element && scope.$$element.length);
                if (!hasElement && scope.$$watchers && scope.$$watchers.length) {
                    orphans.push({ scope: scope, watchers: scope.$$watchers.length });
                }
                trav(scope.$$childHead);
                trav(scope.$$nextSibling);
            }
            trav(root && root.$root);
            return orphans;
        }

        function cleanOrphanWatchers() {
            var orphans = findOrphanWatchers();
            orphans.forEach(function(o) {
                try {
                    o.scope.$$watchers && (o.scope.$$watchers.length = 0);
                    o.scope.$destroy && o.scope.$destroy();
                } catch (e) {  }
            });
            return orphans.length;
        }

        /**
         * compileSafe(options)
         *
         * options:
         *  - parentScope: scope onde criar o childScope (REQUIRED)
         *  - element: angular.element onde será inserido o html (REQUIRED)
         *  - html: string HTML que será inserido (REQUIRED)
         *  - onBeforeCompile: function(element, childScope) optional
         *  - onAfterCompile: function(element, childScope) optional
         *
         * retorna um objeto { childScope, compiledElement, destroy: fn }
         */
        function compileSafe(options) {
            if (!options || !options.parentScope || !options.element || !options.html) {
            throw new Error('compileSafe: parentScope, element e html são obrigatórios');
            }

            var parentScope = options.parentScope;
            var element = options.element; // angular.element(...)
            var html = options.html;
            var onBeforeCompile = options.onBeforeCompile;
            var onAfterCompile = options.onAfterCompile;

            // 1) destrói e limpa escopo/elemento antigo associado
            var oldChild = getAssociatedScope(element);
            if (oldChild) {
                try {
                    // dispara $destroy e limpa DOM/listeners
                    destroyScope(oldChild);
                } catch (e) { /* swallow */ }

                try {
                    safeEmpty(element);
                } catch (e) { /* swallow */ }

                clearAssociatedScope(element);
            } else {
                // mesmo se não houver old scope, garanta que o elemento esteja limpo
                safeEmpty(element);
            }

            // 2) cria novo child scope
            var childScope = parentScope.$new();

            // 3) seta referência segura
            setAssociatedScope(element, childScope);

            // 4) permite manipulação antes de compilar (ex: adicionar atributos)
            if (typeof onBeforeCompile === 'function') {
                try { onBeforeCompile(element, childScope); } catch (e) { console.warn('onBeforeCompile error', e); }
            }

            // 5) monta elemento DOM sem usar .html() diretamente
            var newEl;
            try {
                newEl = angular.element(html);
                element.append(newEl);
            } catch (e) {
                // fallback: usar append de forma segura
                try {
                    element.append($compile(html)(childScope));
                } catch (ex) {
                    console.error('safeCompiler: erro ao criar elemento', ex);
                    destroyScope(childScope);
                    clearAssociatedScope(element);
                    throw ex;
                }
            }

            // 6) compila o conteúdo recém-inserido
            var compiledElement;
            try {
                compiledElement = $compile(element.contents())(childScope);
            } catch (e) {
                // se falhar, limpa e re-throw
                destroyScope(childScope);
                safeEmpty(element);
                clearAssociatedScope(element);
                throw e;
            }

            // 7) onAfterCompile hook
            if (typeof onAfterCompile === 'function') {
                try { onAfterCompile(element, childScope); } catch (e) { console.warn('onAfterCompile error', e); }
            }

            // 8) garante limpeza caso o childScope seja destruído diretamente
            var destroyHandler = childScope.$on('$destroy', function() {
            try { element.off && element.off(); } catch (e) {}
            try { safeEmpty(element); } catch (e) {}
                clearAssociatedScope(element);
            });

            // 9) destroy function retornada
            function destroy() {
                try { destroyHandler && destroyHandler(); } catch (e) {}
                try { destroyScope(childScope); } catch (e) {}
                try { safeEmpty(element); } catch (e) {}
                clearAssociatedScope(element);
            }

            return {
                childScope: childScope,
                compiledElement: compiledElement,
                destroy: destroy,
                // utilitários úteis para debug
                debug: {
                    countWatchers: countWatchers,
                    findOrphanWatchers: findOrphanWatchers,
                    cleanOrphanWatchers: cleanOrphanWatchers
                }
            };
        }

        // API pública
        return {
            compileSafe: compileSafe,
            countWatchers: countWatchers,
            findOrphanWatchers: findOrphanWatchers,
            cleanOrphanWatchers: cleanOrphanWatchers
        };
    }]);

    GcUtils.factory('MemoryCleaner', ['$compile', '$timeout', function($compile, $timeout) {
        return {
            nuke: function(el) {
                const clone = el.cloneNode(true);
                el.parentNode.replaceChild(clone, el);
                return clone;
            },
            purge: function(el) {
                angular.element(el).off();
                $(el).off();
            },
            destroyScopes: function(scopes) {
                scopes.forEach(s => s && s.$destroy());
            }
        };

    }]);
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GcUtils.name;
	}

	// var updateCheckboxes = function (){
	// 	console.log('atualizando checkboxes');
	// 	var inputs_zxvb = angular.element(document).find('input:checkbox');
	// 	for(var zxvb = 0; zxvb < inputs_zxvb.length; zxvb++) {
	// 		var element_zxvb  = inputs_zxvb[zxvb];
	// 		var check_zxvb    = angular.element(element_zxvb).attr('check-standard2');
	// 		var ng_model_zxvb = angular.element(element_zxvb).attr('ng-model');
	// 		if(typeof check_zxvb == 'undefined' && typeof ng_model_zxvb != 'undefined'){
	// 			angular.element(element_zxvb).attr('check-standard2','');
	// 		}			
	// 	}	
	// 	console.log('checkboxes atualizadas!');		
	// }

	// window.addEventListener('load', function() {
	// 	updateCheckboxes();
	// })
	

})(window, window.angular);

(function($) {

    /*
    $(document).on("click",".dropdown-fixo",function($event) {

        //oculta todos abertos
        $('.dropdown-fixo').parent().removeClass('open');

        //pegar a posicao do botão clicado
        var pos     =  $(this).offset();

        //pegar as medidas da tela
        var altura  = window.innerHeight;
        var largura = window.innerWidth;

        //encontrar o dropdown
        var drop    = $(this).parent();
        var menu    = $(drop).find('.dropdown-menu');
        
        //tamanho do botão clicado
        var btnCompr = $(drop).height();
        var btnLarg  = $(drop).width();

        //altura do botão clicado mais o tamanho do botao
        var top      = pos.top  + btnCompr;

        //distancia do botao da lateral da tela
        var left     = pos.left;

        //tamanho do dropdown
        var menu_altura  = $(menu).height() + 15;
        var menu_largura = $(menu).width()  + 30;

        //mostrar o dropdown
        //$(menu).css('display'   ,'block'   );
        
        $(this).parent().addClass('open');
        $(menu).css('position'  ,'fixed'   );

        //verificar o scroll da tela
        let doc = document.documentElement;
        let srtTop = doc.scrollTop;
        let srtLeft = doc.scrollLeft;

        //somar as distancias mais o scroll da tela
        top  = top  - srtTop;
        left = left - srtLeft;

        //se muito para a direita, faz o elemento virar para o outro lado
        if(largura >= (menu_largura+left+10)){
            $(menu).css('left' ,left+'px');
        }else{
            $(menu).css('left' ,(left - menu_largura + btnLarg)+'px');
        }

        //se o elemto muito no fim da tela direciona ele para o topo
        if(altura >= (menu_altura+top+10)){
            $(menu).css('top' ,top+'px');
        }else{
            $(menu).css('top',(top - menu_altura - btnCompr)+'px');
        }

    });
    
    setTimeout(function(){
        window.addEventListener('scroll', function() {
            try {
                $('.dropdown-fixo').parent().removeClass('open');
            } catch (error) {}
        });

        $('.table-ec').on('scroll', function(){
            try {
                $('.dropdown-fixo').parent().removeClass('open');
            } catch (error) {}
        });
    },1000);
    */

})(jQuery);