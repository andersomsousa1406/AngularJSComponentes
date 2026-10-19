// Request mapping converted from CADDEMODELFICHATECNICA.consultar, not a new API.
export const endpoint = '/_22430/api/getCADDEMODELFICHATECNICA';
export function modelRequest(form, lookups, page, quantity) {
  function selected(name, field) {
    var lookup = lookups[name];
    return lookup && lookup.item.selected ? lookup.item.dados[field || 'ID'] : '';
  }
  function date(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
    return [String(value.getDate()).padStart(2, '0'), String(value.getMonth() + 1).padStart(2, '0'), value.getFullYear()].join('.');
  }
  var filter = {
    TIPO: selected('TIPO'), FAMILIA_ID: selected('FAMILIA_ID'), LINHA: selected('LINHA'), MATRIZ: selected('MATRIZ'), PERFIL: selected('PERFIL'), CATEGORIA: selected('CATEGORIA', 'CODIGO'),
    FILTRO_DADOS: form.FILTRO_DADOS, FILTRO_CODIGO: form.FLAG_MODELO ? form.FILTRO_CODIGO : '',
    STATUS: form.FILTRO_STATUS, TIPO_MODELO: form.TIPO_MODELO, FILTRO_ECOMMERCE: form.FILTRO_ECOMMERCE,
    FILTRO_PUBLICA_ECOM: form.FILTRO_PUBLICA_ECOM, FILTRO_MARCA: form.FILTRO_MARCA, FILTRO_BLOQ_PED: form.FILTRO_BLOQ_PED,
    DATA_CAD1: form.TIPODATA === '1' ? date(form.PERIODO_INICIAL) : '', DATA_CAD2: form.TIPODATA === '1' ? date(form.PERIODO_FINAL) : '',
    DATA_LANCAMENTO1: form.TIPODATA !== '1' ? date(form.PERIODO_INICIAL) : '', DATA_LANCAMENTO2: form.TIPODATA !== '1' ? date(form.PERIODO_FINAL) : '',
    QTD: quantity, PAGINA: page * quantity, VISUALIZAR_REFERENCIA: form.VISUALIZAR_REFERENCIA
  };
  return { FILTRO: filter, DADOS: filter };
}
