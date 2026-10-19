# Referencia 22430

Conversao do **cenario de consulta principal** da tela real 22430 para os componentes EasyComponents novos. Bootstrap 3.4.1 esta instalado neste projeto. Nenhum motor antigo e importado. Backend e dados sao simulados exclusivamente neste modulo; nao ha conexao ao GCWeb.

Fontes consultados somente para leitura em `C:\xampp\htdocs`:

- `resources/assets/js/ppcp/_22430/_22430.controller.js`: configuracao da TabelaPrincipal, 27 declaracoes de coluna, fnOpcaoMain, estilos de bloqueio, cinco popovers e consultas de filtros.
- `resources/assets/js/ppcp/_22430/_22430.factory.CADDEMODELFICHATECNICA.js`: mapeamento de `consultar`, endpoint e envelope `FILTRO`/`DADOS`.
- `resources/views/ppcp/_22430/index.blade.php`: campos, filtros e disposicao Bootstrap 3.
- `old_componentes/componentes/Consulta.js` e `TabelaJS.js` neste repositorio: catalogos de consulta e contratos de menu/status/estilos.

`columns.js` preserva os metadados das 27 declaracoes originais e o hash do controller consultado. Duplicatas identicas da propriedade FIXO e exemplos comentados foram removidos. Flags de visibilidade sao parametros; neste cenario os valores aproximam a captura enviada, sem carregar permissoes de producao.

O componente compartilhado gc-data-grid recebeu status, STYLE_OPT, STYLE_OPT_PARAM, ESTILOS_CALCULADOS, menu BTN3 com grupos/callbacks/visibilidade e carregamento incremental por rolagem. O callback recebe `(event, row)` e a selecao do modelo e atualizada. O controle do dropdown e nativo; o callback antigo que manipulava jQuery foi convertido para estado. Os cinco popovers dessa tela foram convertidos de HTML gerado para codigo formatado + conteudo textual com abertura nativa. gc-lookup usa `option.campos_tabela`, `obj_ret` e largura do dropdown quando nao ha colunas novas explicitas.

As consultas mantem os caminhos originais e a paginacao por deslocamento (`PAGINA=pagina*QTD`). Datas usam DD.MM.YYYY. O inspetor permite conferir cada payload. O backend local filtra dados sinteticos; nao reproduz toda a logica SQL, autorizacao e integracoes da aplicacao.

**Nao e a migracao completa da tela nem prova de 100% de compatibilidade dos componentes.** Incluir e Funcionalidades estao desabilitados; o menu de arquivos demonstra a entrega do registro, sem executar a operacao de negocio. Cabecalho do sistema, atalhos globais, workflows/cards, submenus BTN3, renderizacao arbitraria HTML/HTMLCP, edicao inline e persistencia das preferencias da tela continuam fora deste cenario. Os demais recursos permanecem acompanhados na auditoria geral. O zoom desta referencia e 100% com fonte de 12px para aproximar a captura, e a legenda usa markup nativo; o codigo antigo configurava zoom 70% sobre seus estilos globais.

Executar: `powershell -ExecutionPolicy Bypass -File .\testar-componentes.ps1`, acessar `/legacy-migration/22430.html`. Testar depois do build: `npm run test:migration:22430` com Node 22+ e Chrome/Edge instalado. `--screenshot` no script de navegador grava `test/artifacts/22430.png`.
