// Local test data only. No customer database or network access.
export const families = [
  { ID: '0271', DESCRICAO: 'AG-AGLOMERADO BLOCO', DESC_TIPOPRODUTO: '0002 - PRODUTO ACABADO' },
  { ID: '0260', DESCRICAO: 'AGULHA TEAR (SLS)', DESC_TIPOPRODUTO: '0007 - MAT. P/ USO/CONSUMO' },
  { ID: '0143', DESCRICAO: 'ALMA/BULA/TAG', DESC_TIPOPRODUTO: '0008 - MATERIAL EMBALAGEM' },
  { ID: '0108', DESCRICAO: 'ALUMINIOS MATRIZ C', DESC_TIPOPRODUTO: '0007 - MAT. P/ USO/CONSUMO' },
  { ID: '0147', DESCRICAO: 'CONFECCIONADOS', DESC_TIPOPRODUTO: '0011 - PRODUTOS REVENDA' },
  { ID: '0231', DESCRICAO: 'INSUMOS (SLS)', DESC_TIPOPRODUTO: '0001 - MATERIA-PRIMA' }
];
export const catalogs = {
  TIPO: [{ ID: '0011', DESCRICAO: 'PRODUTOS REVENDA', DESC_CLASSE: 'REVENDA' }, { ID: '0002', DESCRICAO: 'PRODUTO ACABADO', DESC_CLASSE: 'PRODUÇÃO' }, { ID: '0001', DESCRICAO: 'MATERIA-PRIMA', DESC_CLASSE: 'INSUMOS' }],
  FAMILIA_ID: families,
  LINHA: [{ ID: '0837', DESCRICAO: 'VIES - COMPLEMENTO SEAMLESS' }],
  MATRIZ: [{ ID: '1', DESC_ID: '0001', DESCRICAO: 'MATRIZ DEMONSTRAÇÃO' }],
  PERFIL: [{ ID: 'CLL', DESCRICAO: 'COLEÇÃO LET. COLLIN', FAMILIA: 'CONFECÇÃO' }],
  CATEGORIA: [{ ID: '1', CODIGO: 'CAT01', DESC_ID: '0001', DESCRICAO: 'VESTUÁRIO', API_DESCRICAO: 'CATÁLOGO LOCAL' }]
};
export const models = Array.from({ length: 125 }, function (_, index) {
  var first = index < 4, type = catalogs.TIPO[first ? (index < 2 ? 0 : 1) : 2];
  var family = families[first ? 4 : 5];
  return {
    ID: index + 1, DESC_ID: String(7612 + index).padStart(6, '0'), REFERENCIA: 'REF-' + (index + 1),
    DESCRICAO: ['020.14 BODY BUTTERFLY', '020.47 BODY CRAWL', '.SHORT CICLISTA FEM.', '.T-SHIRT BASICO'][index] || '0129-002 GALAO DE VIES (' + ['P', 'M', 'G', 'GG'][index % 4] + ')',
    UNIDADEMEDIDA_SIGLA: 'PC', TIPO: type.ID, TIPOPRODUTO_CODIGO: type.ID, HINT_TIPO: type.DESCRICAO, DESC_TIPO: type.ID + ' - ' + type.DESCRICAO,
    FAMILIA_ID: family.ID, FAMILIA_CODIGO: family.ID, HINT_FAMILIA: family.DESCRICAO, DESC_FAM_ALT: family.ID + ' - ' + family.DESCRICAO, DESC_FAMILIA: family.DESCRICAO,
    LINHA: '0837', DESC_LINHA: first ? '' : '0837 - VIES - COMPLEMENTO SEAMLESS', MATRIZ: '1', DESC_MATRIZ: '0001 - MATRIZ DEMONSTRAÇÃO',
    LINHA_CODIGO: '0837', HINT_LINHA: 'VIES - COMPLEMENTO SEAMLESS', MATRIZ_CODIGO: '1', HINT_MATRIZ: 'MATRIZ DEMONSTRAÇÃO', COR_PADRAO: '0896', HINT_COR_PADRAO: 'CINZA',
    NCM_CODIGO: first ? '61142000' : '61121200', PERFIL: 'CLL', DESC_PERFIL_MDL: first ? 'CLL - COLEÇÃO LET. COLLIN' : '',
    DESC_COR_PADRAO: first ? '0896 - CINZA' : '2918 - CRU', DESC_TAM_PADRAO: first ? 'P' : '', GRADE: ['P M G GG', 'PP P M G GG XGG', 'P', 'M'][index % 4],
    DENSIDADE: 0, ESPESSURA: 0, MARCA_TIPO_TAG: '', DATA_FORMAT: '19/10/2026', DATA_LANCAMENTO_FORMAT: '19/10/2026',
    DATA: '2026-10-19', DATA_LANCAMENTO: '2026-10-19', STATUS: index === 124 ? '0' : '1', BLOQ_PED: index % 17 === 7 ? 1 : 0,
    TIPO_MODELO: index % 2 ? '2' : '1', FILTRO_ECOMMERCE: index % 5 + '', CATEGORIA: 'CAT01', HORAS_BLOQUEIO: 0
  };
});
export function filterModels(filter) {
  function inRange(value, start, end) {
    function iso(date) { return date ? date.split('.').reverse().join('-') : ''; }
    return (!start || value >= iso(start)) && (!end || value <= iso(end));
  }
  return models.filter(function (row) {
    return ['TIPO', 'FAMILIA_ID', 'LINHA', 'MATRIZ', 'PERFIL', 'CATEGORIA', 'STATUS', 'TIPO_MODELO', 'FILTRO_ECOMMERCE'].every(function (key) {
      return filter[key] === '' || filter[key] == null || String(row[key]) === String(filter[key]);
    }) && (!filter.FILTRO_DADOS || (row.DESC_ID + ' ' + row.REFERENCIA + ' ' + row.DESCRICAO).toLowerCase().includes(filter.FILTRO_DADOS.toLowerCase())) &&
      (!filter.FILTRO_MARCA || row.MARCA_TIPO_TAG.includes(filter.FILTRO_MARCA)) &&
      (filter.FILTRO_BLOQ_PED === '' || String(row.BLOQ_PED === 1 ? 0 : 1) === filter.FILTRO_BLOQ_PED) &&
      inRange(row.DATA, filter.DATA_CAD1, filter.DATA_CAD2) && inRange(row.DATA_LANCAMENTO, filter.DATA_LANCAMENTO1, filter.DATA_LANCAMENTO2);
  });
}
