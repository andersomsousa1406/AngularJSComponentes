import { endpoint } from './contract.js';
import { catalogs, filterModels } from './fixtures.js';
export const lookupEndpoints = {
  TIPO: '/consultas/api/TipoProdutos', FAMILIA_ID: '/consultas/api/Familia', LINHA: '/consultas/api/Linhas',
  MATRIZ: '_22430/api/getConsultaFiltroMatriz', PERFIL: '_22430/api/getConsultaFiltroPerfil', CATEGORIA: '_22430/api/getConsultaCategoriaFiltro'
};
export default function register(app) {
  app.angularModule.factory('Gc22430Backend', ['$q', function ($q) {
    var backend = { calls: [], failNext: false };
    backend.post = function (url, payload) {
      backend.calls.push({ url: url, data: angular.copy(payload) });
      if (backend.failNext) { backend.failNext = false; return $q.reject(new Error('Falha simulada na consulta.')); }
      if (url === endpoint) {
        var filter = payload.FILTRO, rows = filterModels(filter);
        return $q.resolve({ DADOS: angular.copy(rows.slice(filter.PAGINA, filter.PAGINA + filter.QTD)), USER: [] });
      }
      var key = Object.keys(lookupEndpoints).find(function (key) { return lookupEndpoints[key] === url; });
      if (!key) return $q.reject(new Error('Rota não simulada: ' + url));
      var query = String(payload.FILTRO || '').toLowerCase();
      var results = catalogs[key].filter(function (row) { return Object.values(row).join(' ').toLowerCase().includes(query); });
      var options = payload.CONSULTA || { PAGINA: 0, QTD: 20 };
      return $q.resolve(angular.copy(results.slice(options.PAGINA, options.PAGINA + options.QTD)));
    };
    return backend;
  }]);
  app.angularModule.factory('GcApi', ['Gc22430Backend', function (backend) { return backend; }]);
}
