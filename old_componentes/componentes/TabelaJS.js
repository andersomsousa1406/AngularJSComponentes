
(function(window, angular) {
    'use strict';

	AngularFindModule.factory('TabelaJS' , TabelaJS );
	
    TabelaJS.$inject = [
		'$rootScope',
		'$parse',
		'$q',
        '$compile',
		'gcCollection',
		'$ajax',		
		'$timeout',
		'$sce',
		'TabelaHTML',
		'gScope',
		'Confirmacao',
		'$interval',
		'safeCompiler',
		'MemoryCleaner'
    ];

	function TabelaJS($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce, TabelaHTML, gScope, Confirmacao, $interval, safeCompiler, MemoryCleaner) {

		/**
		 * Carrega as colunas visíveis/ordem para todas as tabelas do menu (cache por página).
		 * Retorna uma Promise que resolve num mapa { TABELA_ID: [ itens... ], ... }
		 */
		function loadColunasVisiveisPorMenu(menuControle){

			if(!menuControle){
				var menu1 = $('#menu-controle').val();
				var menu2 = $('[name="_menu_controle"]').val();
				var menuControle = 0;

				if(menu1 > 0){
					menuControle = menu1;
				} else if(menu2 > 0){
					menuControle = menu2;
				}

				menuControle = Number(menuControle);
				menuControle = isNaN(menuControle) ? 0 : menuControle;
			}

			// Se já carregado para este menu, retorna a mesma promise
			if(window.__colunasVisiveisPorMenuPromise && window.__colunasVisiveisPorMenuMenu == menuControle){
				return window.__colunasVisiveisPorMenuPromise;
			}

			window.__colunasVisiveisPorMenuMenu = menuControle;
			window.__colunasVisiveisPorMenuPromise = new Promise(function(resolve, reject){
				execAjaxSemProgresso('POST', urlhost + '/api/controleTabela/getColunasVisiveisByMenu', { MENU_CONTROLE: Number(menuControle) },
					function(response){
						try{
							var map = {};
							angular.forEach(response || [], function(item){
								if(!map[item.TABELA_ID]) map[item.TABELA_ID] = [];
								map[item.TABELA_ID].push(item);
							});
							window.__colunasVisiveisPorMenu = map;
							resolve(map);
						} catch(err){
							resolve({});
						}
					},
					function(err){
						// on error resolve empty map (graceful fallback)
						resolve({});
					},
					null,
					false
				);
			});
			return window.__colunasVisiveisPorMenuPromise;
		}

		function normalizarColunasSalvas(saved){
			var colunas = [];

			angular.forEach(saved || [], function(item){
				if(!item){
					return;
				}

				if(angular.isArray(item)){
					colunas = colunas.concat(item);
					return;
				}

				if(angular.isString(item)){
					try{
						item = JSON.parse(item);
					}catch(e){
						item = null;
					}

					if(!item){
						return;
					}

					if(angular.isArray(item)){
						colunas = colunas.concat(item);
						return;
					}
				}

				if(typeof item.CHAVE_COLUNA !== 'undefined'){
					colunas.push(item);
					return;
				}

				if(typeof item.COLUNAS !== 'undefined'){
					var cols = item.COLUNAS;

					if(angular.isString(cols)){
						try{
							cols = JSON.parse(cols);
						}catch(e){
							cols = [];
						}
					}

					if(angular.isArray(cols)){
						colunas = colunas.concat(cols);
					}
				}
			});

			return colunas;
		}

		function aplicarColunasSalvas(colunasPadrao, colunasSalvas){
			var colunas = angular.copy(colunasPadrao || []);

			angular.forEach(colunas, function(item, index){
				colunasSalvas.forEach(function(colunaSalva){
					if(
						colunaSalva.CAMPO 		 == item.CAMPO &&
						colunaSalva.CAMPO_FILTRO == item.CAMPO_FILTRO
					){
						item.VISIBLE	= colunaSalva.STATUS == '1';
						item.ORDEM 		= colunaSalva.ORDEM;
						item.ORDEM_TEMP	= colunaSalva.ORDEM;
					}
				});
			});

			colunas.sort(function(a, b){
				return Number(a.ORDEM || 0) - Number(b.ORDEM || 0);
			});

			//console.log('---------');
			//console.log(colunas);

			return angular.copy(colunas);
		}

		function atualizarCacheColunasVisiveis(tabelaId, colunas, menuControle){
			if(!tabelaId){
				return;
			}

			if(typeof window.__colunasVisiveisPorMenu == 'undefined' || window.__colunasVisiveisPorMenu === null){
				window.__colunasVisiveisPorMenu = {};
			}

			if(colunas.length > 0){
				window.__colunasVisiveisPorMenu[tabelaId] = angular.copy(colunas);
			}else{
				window.__colunasVisiveisPorMenu[tabelaId] = [];
				delete window.__colunasVisiveisPorMenu[tabelaId];
			}

			if(menuControle){
				window.__colunasVisiveisPorMenuMenu = Number(menuControle);
			}

			window.__colunasVisiveisPorMenuPromise = Promise.resolve(window.__colunasVisiveisPorMenu);
		}

        // Private variables.
        var obj      			= null;
        var selected			= null;
        
	    /**
	     * Constructor, with class name
	    */
		
		function TabelaJS() {
            
            obj = this; 

            /**
             * Tipos de Campos das Colunas(ECMAS6)
             * ||  Tipo  |||  Nome  |||| Ordem ||
             * |  número  | 'number'  |         | 
             * |  texto   | 'string'  |         |
			 * |  status  | 'status'  |         |
			 * |  nulo    |  'null'   |         |
             * |  data    |  'date'   |         |
             * | boolean  | 'boolean' |         |
             * | função   |'function' |         |
             * | undefined|'undefined'|         |
             * 
             */
            
			this.getNew	= getNew;	

            this.default_table = {
                ID               		: '',
				nonce					: getCurrentNonce(),
                tabela_id        		: '',
                componente       		: '',
                model            		: '',
                titulo           		: '',
                filtro           		: '',
                zoom             		: 100,
				DADOS            		: [],
				DADOS_RENDER     		: [],
				DADOS_RENDER_FILTRADOS	: [],
				campos_filtro    		: [],	
				html_total				: '',	
				impressao_inativa		: false,		
				status_visible   		: true,
				FILTRO_RENDER	 		: [],
				input_visible    		: false,
				total_visible	 		: false,
				options_fixed	 		: false,
				VER				 		: true,
				marcar_todos	 		: true,
				tabela_compilada 		: false,
				using_total_dados		: false,
                model_selected   		: '',
                backup_colunas   		: [],
				filtro_visible   		: true,
				COLUNAS_RESTAURADAS 	: false,
				MODIFICAR_PAGINACAO 	: false,
				EVENTOS_GERADOS			: false,
				BACKUP_STATUS			: [],
				CABECALHO_CSV			: 1,
				IMPRESSAO_RELATORIO		: 0,
				OBSERVACAO_VISUAL_REL	:'',
				CABECALHO_HABILITADO	: true,
				marcar_perc_visible 	: false,
				Confirmacao				: new Confirmacao(),
                COLUNAS         		: [
                    {
                        CAMPO    		: 'ID',
                        DESCRICAO		: 'ID',
                        TIPO     		: 'number',
                        ALIGN    		: 'left',
                        VISIBLE  		: true,
                        SIZE     		: 0,
                        STYLE    		: '',
						ORDEM    		: 1,
						PARAM_CLASS_DIV : '',
						CHAVE_COLUNA 	: 'ID_0'
                    },
                    {
                        CAMPO    		: 'DESCRICAO',
                        DESCRICAO		: 'DESCRIÇÃO',
                        TIPO     		: 'string',
                        ALIGN    		: 'left',
                        VISIBLE  		: true,
                        SIZE     		: 0,
                        STYLE    		: '',
						ORDEM    		: 2,
						PARAM_CLASS_DIV : '',
						CHAVE_COLUNA 	: 'DESCRICAO_1'
                    }
				],
				COLUNAS2				: [],
				COLUNAS_FUNC			: [],
				position_colunas2		: 'after',
				position_colunas_func	: 'before',
				FILTRO          		: '',
				STATUS          		: '1',
                ORDER_BY        		: 'ID',
                WIDTH           		: '100%',
				HEIGHT          		: 'calc(var(--screen-height) - 205px)',
				MIN_HEIGHT      		: '300px',
				STYLE_TABELA    		: '',
                SELECTED        		: {},
                descricoes      		: [],
				btn_filtrar_registros  	: false,
				btn_excluir_filtro   	: false,
				coluna_gerada   		: false,
				imprinting				: false,
				infinite_scroll			: false,
				fix_infinite_scroll		: false,
				infinite_end			: false,
				time_counter			: false,
				timer_out				: false,
				operacao_merge_gravar	: false,
				scroll_counter  		: 0,
				consulta_pagina 		: 0,
				consulta_qtd 			: 50,
				counter_selected		: 0,
				tabela_itens			: false,
				habilita_botao_next 	: true,
				habilita_botao_nextAll 	: false,
                check_list      		: true,
                col_pressed     		: false,
                start_width     		: undefined,
				start_x     			: undefined,
				filtro_status_v 		: true,
				filtro_status_v2		: true,
				not_focus_enter			: false,
				disabled_tab_enter		: false,
				cabecalho_print			: false,
				status_opt				: undefined,
				totalizador_html 	 	: false,
				fimcountmarcados		: undefined,
				onMergeEnd				: undefined,
				total_registros_default : true,
				habilitar_load_colunas	: true,
				total_registros_aux		: 0,
				array_numericos			: [],
				status_opt_bkp			: [
					{VALOR: '' , DESCRICAO: 'TODOS'},
					{VALOR: '0', DESCRICAO: 'INATIVOS'},
					{VALOR: '1', DESCRICAO: 'ATIVOS'}
				],
				item_status				: {
					VALOR: '0',
					DESCRICAO: 'INATIVOS'
				},
				HABILITA_COLUNAS_V_BTN	: false,
				compilado				: false,
				BACKUP_ID_ARR			: [],
				BACKUP_TABELA_ID_ARR	: [],	
				is_compile_eve			: false,
				bkp_is_compile_eve		: null,
				next : function(selected){
					var that 		= this;
					var encontrado 	= false;
					var ret 		= {};
					var status 		= 0;
					var pos     	= 0;

					angular.forEach(that.DADOS,function(item, key){
						if(status == 1 && encontrado == false){
							pos = key + 1;
							ret = item;
							encontrado = true;
						}

						if(JSON.stringify(item) === JSON.stringify(selected)){
							status = 1;
						}
					});

					return {ITEM : ret, POS: pos, PRIMEIRO: pos == 1,ULTIMO: pos == that.DADOS.length};
				},
				previous : function(selected){
					var that    	= this;
					var encontrado 	= false;
					var ret 		= {};
					var ant     	= {};
					var pos     	= 0;

					angular.forEach(that.DADOS,function(item, key){

						if(JSON.stringify(item) === JSON.stringify(selected)){
							if(encontrado == false && key > 0){
								pos = key + 1;
								ant = ret;
								encontrado = true;
							}
						}

						ret = item;
					});

					return {ITEM : ant, POS: pos, PRIMEIRO: pos == 1,ULTIMO: pos == that.DADOS.length};
					
				},
				previousReg : function(selected){	// Similar ao previous(), mas utilizando ID.
					var that    	= this;
					var encontrado 	= false;
					var ret 		= {};
					var ant     	= {};
					var pos     	= 0;

					angular.forEach(that.DADOS,function(item, key){

						var validId = trim_null(item.ID) != '' && trim_null(selected.ID) != '';

						if(validId && item.ID === selected.ID){

							if(encontrado == false && key > 0){
								pos = key + 1;
								ant = ret;
								encontrado = true;
							}

						}

						ret = item;

					});

					return {ITEM : ant, POS: pos, PRIMEIRO: pos == 1,ULTIMO: pos == that.DADOS.length};
				},
				nextReg : function(selected){	// Similar ao next(), mas utilizando ID.
					var that 		= this;
					var encontrado 	= false;
					var ret 		= {};
					var status 		= 0;
					var pos     	= 0;

					angular.forEach(that.DADOS,function(item, key){

						if(status == 1 && encontrado == false){
							pos = key + 1;
							ret = item;
							encontrado = true;
						}

						var validId = trim_null(item.ID) != '' && trim_null(selected.ID) != '';

						if(validId && item.ID === selected.ID){
							status = 1;
						}

					});

					return {ITEM : ret, POS: pos, PRIMEIRO: pos == 1,ULTIMO: pos == that.DADOS.length};
				},
				first : function(){
					var that     = this;

					if(that.DADOS.length > 0){
						return {ITEM : that.DADOS[0], POS: 1, PRIMEIRO: true,ULTIMO: false};
					}else{
						return {ITEM : {}, POS: 0, PRIMEIRO: false,ULTIMO: false};
					}
				},
				last : function(){
					var that     = this;
					
					if(that.DADOS.length > 0){
						return {ITEM : that.DADOS[that.DADOS.length - 1], POS: that.DADOS.length - 1, PRIMEIRO: false,ULTIMO: true};
					}else{
						return {ITEM : {}, POS: 0, PRIMEIRO: false,ULTIMO: false};
					}
				},
                setColuna       : function(){
                    
                    var that     = this;
                    var colunas  = [];  

                    if(that.DADOS.length > 0 && that.coluna_gerada == false){
                        var item  = that.DADOS[0];
                        colunas   = Object.getOwnPropertyNames(item);
                        that.COLUNAS = [];

                        function test_type(coluna){
                            var type2 = '';
                            for(var t = 0; t < that.DADOS.length;t++){
                                if(type2 == ''){
                                    var type3 = typeof that.DADOS[t][coluna];

                                    switch (type3) {
                                        case 'number':
                                        type2 = type3;  
                                        break;
                                    
                                        case 'string':
                                        type2 = type3;   
                                        break;

                                        default:
                                        break;
                                    }
                                }
                            }

                            if(type2 == ''){
                                type2 = 'string';
                            }

                            return type2; 
                        }
                        
                        for(var u = 0; u < colunas.length; u++){
                            var descricao = that.descricoes.length > 0 ? that.descricoes[u][1] : colunas[u];
                            var ordem     = that.descricoes.length > 0 ? that.descricoes[u][0] : u;
                            var type      = test_type(colunas[u]);

                            that.COLUNAS.push({
                                CAMPO    : colunas[u],
                                DESCRICAO: descricao,
                                TIPO     : type,
                                ALIGN    : type === 'number' ? 'right' : 'left',
                                VISIBLE  : true,
                                SIZE     : 0,
                                STYLE    : '',
                                ORDEM    : ordem
                            });

                        }
                    }
                    that.coluna_gerada = true;
				},
				trunc_number : function(num, precisao) {
					var decimais = Math.pow(10, precisao);
					return Math.floor(num * decimais) / decimais;
				},
                number_format: function (number, decimals, decPoint, thousandsSep) {

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
                },
                isValid : function(valor){
                    if(valor === null || valor === 'null' || valor === undefined  || valor === 'undefined' || valor === ''){
                        return false;   
                    }else{
                        return true;
                    }
                },
                format : function(valor,campo,item){
                    var that = this;

					try {
						if(!that.isValid(valor)){
							valor = '';     
						}else{ 
							if(campo.TIPO == 'number'){
								valor = that.number_format(valor, campo.DECIMAL, ',', '.');
							}else if(campo.TIPO == 'date'){
								var data  = '';

								if((valor+'').includes('-')){
									var data = (valor+'').split('-').reverse().join('/');
								}else if(valor+''.includes('.')){
									var data = (valor+'').split('.').reverse().join('/');
								}
								
								valor = data;
							}else if(campo.TIPO == 'timestamp'){
								var part1 = (valor+'').split(' ');
								var data  = '';

								valor = part1[0];

								if((valor+'').includes('-')){
									var data = (valor+'').split('-').reverse().join('/');
								}else if(valor+''.includes('.')){
									var data = (valor+'').split('.').reverse().join('/');
								}
								
								valor = data+' '+(part1[1]+'').substring(0,5);
							}else if(campo.TIPO == 'time'){
								valor = (valor+'').substring(0,5);
							}
						}
					} catch (error) {
						valor = valor + '';	
					}

					///////////////////////////////////////////////

					function isVariable(str) {
						str = trim_null(str);

						return typeof str === 'string' &&
							str.length >= 2 &&
							str[0] === '#' &&
							str[str.length - 1] === '#';
					}

					function returnVariable(str) {
						str = trim_null(str);

						if (typeof str !== 'string') return str;

						if (str.length >= 2 && str[0] === '#' && str[str.length - 1] === '#') {
							return str.substring(1, str.length - 1);
						}

						return str;
					}

					///////////////////////////////////////////////

                    if(that.isValid(campo.PREFIXO) && (campo.INPUT == undefined || campo.INPUT == null)){
						if(valor == null || typeof valor == 'undefined' || (''+valor).trim() == ''){
							valor = valor;
						}else{
							if(isVariable(campo.PREFIXO)){
								let var_prefixo = returnVariable(campo.PREFIXO),
									prefixo_val = item[var_prefixo];

								if(prefixo_val == null || typeof prefixo_val == "undefined"){
									valor = (campo.PREFIXO + ' '+ valor);
								}else{
									valor = (prefixo_val +' '+ valor);
								}
							}else{
								valor = (campo.PREFIXO + ' '+ valor);
							}
						}
					}

                    if(that.isValid(campo.SUFIXO) && (campo.INPUT == undefined || campo.INPUT == null)){
						//console.log(typeof valor);
						if(valor == null || typeof valor == 'undefined' || (''+valor).trim() == ''){
							valor = valor;
						}else{
							if(isVariable(campo.SUFIXO)){
								let var_sufixo = returnVariable(campo.SUFIXO),
									sufixo_val = item[var_sufixo];

								if(sufixo_val == null || typeof sufixo_val == "undefined"){
									valor = (valor +' '+ campo.SUFIXO);
								}else{
									valor = (valor +' '+ sufixo_val);
								}
							}else{
								valor = (valor +' '+ campo.SUFIXO);
							}
						}
                    }

                    return valor;
				},
				COLUNAS_REC: [],
				getColuns :  function() {
					var that = this;

					var colunas = [];
					colunas = that.COLUNAS;	

					/*
					var html_div = $(that.componente_frame);
						html_div = html_div[0];
						html_div = html_div.contentWindow;
						var imputs_coluna = $(html_div.document).find('body').find('.imput_coluna');

					if(imputs_coluna.length > 0){

						angular.forEach(that.COLUNAS , function(col, key){
							
							$(imputs_coluna).each(function(key){
								var field = $(this).attr('field');
								var check = $(this).is(':checked');

								if(check == true && col.CAMPO == field){
									colunas.push(col);
								}
							});
						});

					}else{
						colunas = that.COLUNAS;	
					}
					*/

					return colunas;
				},
				xls_v : 1,
                exportTXT: function(param){

					var that = this;
					var colunas = [];

					if(that.html_speed == true){
						colunas = that.getColuns();
					}else{
						colunas = that.COLUNAS;
					}
					
					if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado'){
						return that.exportTo(that.tabela_id+'.txt', (that.filtro_visible == true ? that.DADOS_RENDER : that.DADOS), colunas , 4, param, that.titulo);
					}else if(that.tipo_tabela == 'accordion'){
						return that.exportTo(that.tabela_id+'.txt', that.DADOS, colunas , 4, param, that.titulo);
					}

				},
                exportXls: function(param){

					var that = this;
					var colunas = [];

					if(typeof that.beforeExportXls != 'undefined'){
						that.beforeExportXls();
					}

					if(that.html_speed == true){
						colunas = that.getColuns();
					}else{
						colunas = that.COLUNAS;
					}
					
					if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado'){
						return that.exportTo(that.tabela_id+'.xls', (that.filtro_visible == true ? that.DADOS_RENDER : that.DADOS), colunas , that.xls_v, param, that.titulo);
					}else if(that.tipo_tabela == 'accordion'){
						return that.exportTo(that.tabela_id+'.xls', that.DADOS, colunas , that.xls_v, param, that.titulo);
					}

				},
				exportHTML : function(flag){
					var that = this;

					that.PAISAGEM = typeof that.PAISAGEM == 'undefined' ? true        : that.PAISAGEM;
					that.VERSAO   = typeof that.VERSAO   != 'undefined' ? that.VERSAO : '1.0.0';

					var tipo_page = that.PAISAGEM == true ? 1 : 2;

					var win = that.printHtml( that.tabela_id , that.titulo, that.filtro, $('#usuario-descricao').val(), that.VERSAO, tipo_page, '', that.zoom, that.tamanho_colunas,'html')
					.then(function(win){

						if(flag != 1){
							var csvData = '\ufeff'+win.HTML;
							var blob = new Blob([ csvData ], {
								type : "application/csv;charset=utf-8;"
							});

							var link = document.createElement("a");
							var csvUrl = URL.createObjectURL(blob);
							link.href = csvUrl;
							link.style = "visibility:hidden";
							link.download = that.titulo+'.html';
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
							win 	= '';
							csvData = '';
							blob    = '';
						}else{
							that.HTML_EXPORT = win.HTML;
						}

					});

				},
				exportHTML2 : function(flag){
					var that = this;

					return $q(function(resolve, reject){

						that.PAISAGEM = typeof that.PAISAGEM == 'undefined' ? true        : that.PAISAGEM;
						that.VERSAO   = typeof that.VERSAO   != 'undefined' ? that.VERSAO : '1.0.0';

						var tipo_page = that.PAISAGEM == true ? 1 : 2;

						var win = that.printHtml( that.tabela_id , that.titulo, that.filtro, $('#usuario-descricao').val(), that.VERSAO, tipo_page, '', that.zoom, that.tamanho_colunas,'html')
						.then(function(win){
							resolve(win);
						});
					});

				},
				fixTable: function(tipo){
					var that = this;

					tipo = typeof tipo == 'undefined' ? 1 : 0;

					var menuControle = that.getMenuControle();

					that.BKP_HEIGHT = that.HEIGHT;

					$timeout(function(){

						if(tipo == 1){
							atualizarCacheColunasVisiveis(that.ID, [], menuControle);
							that.HEIGHT = '500px';
							that.compile();
						}

						$timeout(function(){
							that.HEIGHT = that.BKP_HEIGHT;
						},500);

					},100);
				},
				clearCache : function(){
					var that = this;
					localStorage.removeItem(''+that.ID+'');
					that.COLUNAS = angular.copy(that.colunas_originais);

					var menuControle = that.getMenuControle();

					$ajax.post(urlhost + '/api/controleTabela/removerColunasVisiveisByMenu', { MENU_CONTROLE: menuControle, TABELA_ID: that.ID }, {new_job: true}).then(function(response) {

						that.fixTable(1);
						
					});
				},
                exportCsv: function(param){
					var that    = this;
					var colunas = [];

					if(that.html_speed == true){
						colunas = that.getColuns();
					}else{
						colunas = that.COLUNAS;
					}

					if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado'){
						return that.exportTo(that.tabela_id+'.csv', (that.filtro_visible == true ? that.DADOS_RENDER : that.DADOS), colunas, 2, param, that.titulo);
					}else if(that.tipo_tabela == 'accordion'){		
						return that.exportTo(that.tabela_id+'.csv', that.DADOS, colunas, 2, param, that.titulo);
					}
                },
                exportPDF: function(param){
					var that = this;
					return new Promise(function(resolve, reject) {

						that.PAISAGEM = typeof that.PAISAGEM == 'undefined' ? true        : that.PAISAGEM;
						that.VERSAO   = typeof that.VERSAO   != 'undefined' ? that.VERSAO : '1.0.0';

						var tipo_page = that.PAISAGEM == true ? 1 : 2;

						var win = that.printHtml( that.tabela_id , that.titulo, that.filtro, $('#usuario-descricao').val(), that.VERSAO, tipo_page, '', that.zoom, that.tamanho_colunas,'pdf')

						.then(function(win){
							//console.log('export p1',win);	
							var str = (win.HTML+'').replaceAll("<!--(.|\\s)*?-->", "");
							//console.log('export p2',str);	
							var dados = {
								FILE	: str,
								STYLE	: win.STYLE,
								NAME	: that.titulo,
								FILTRO	: that.filtro,
								ELEMENT	: that.tabela_id+'.pdf',
								VERSAO	: that.VERSAO,
								PAISAGEM: that.PAISAGEM
							};
				
							var dados_conv = [JSON.stringify(dados)];
							var csvData = '\ufeff'+dados_conv;
							var blob = new Blob([ csvData ], {
								type : "application/csv;charset=utf-8;"
							});

							var link = document.createElement("a");
							var csvUrl = URL.createObjectURL(blob);
							link.href = csvUrl;	
							
							if(typeof param == 'undefined'){					
								
								var fd = new FormData();
								fd.append('fname', that.tabela_id+'.pdf');
								fd.append('data', blob);					
								showSuccess('Seu arquivo está sendo processado... <br> Por Favor arguarde...');

								$q(function(resolve2, reject2){
									$.ajax({
										type: 'POST',
										url: '/api/tabela/pdf',
										data: fd,
										processData: false,
										contentType: false,
										success: function(resposta) {
											var url = urlhost+resposta;
											url = url.replaceAll('/',"\\");
											console.log(url);
											var link = window.document.createElement("a");
											link.setAttribute("href", url);
											link.setAttribute("download", that.tabela_id+'.pdf');
											link.click();
											resolve2(resposta);
										},
										error: function(resposta){
											showErro('Erro ao Gerar PDF');
											reject2(resposta);
										}
									});
								}).then(function(resposta){
									resolve(resposta);	
								});

							}else{
								console.log('export p3',dados);
								//setTimeout( function() {
								resolve(dados);  
								//}, 1000)								
							}
						});
					});

                },
				exportHtmlPDF: function(flag) {
                    var that = this;

					//console.log(that);
					var cabecalho = typeof that.CABECALHO_HABILITADO == 'undefined' ? true        : that.CABECALHO_HABILITADO;
					that.PAISAGEM = typeof that.PAISAGEM == 'undefined' 			? true        : that.PAISAGEM;
					that.VERSAO   = typeof that.VERSAO   != 'undefined' 			? that.VERSAO : '1.0.0';

					var tipo_page = that.PAISAGEM == true ? 1 : 2;

					var win = that.printHtml( that.tabela_id , that.titulo, that.filtro, $('#usuario-descricao').val(), that.VERSAO, tipo_page, '', that.zoom, that.tamanho_colunas, 'ArquivoPDF')
					.then(function(win){

						if(flag != 1){

							$ajax.post(urlhost +'/_11081/api/exportHtmlPDF', { HTML: trim_null(win.HTML), NOME: that.tabela_id +'.pdf' }, {new_job: true}).then(function(response) {

								var url = response;
								url = url.replaceAll('/',"\\");

								console.log(url);

								var link = window.document.createElement("a");
								link.setAttribute("href", url);
								link.setAttribute("download", that.tabela_id +'.pdf');
								link.click();
							});

						}else{
							that.PDF_EXPORT = win.HTML;
						}

					});

				},
                imprimir: function(){
                    var that = this;
					//console.log(that);
					var cabecalho = typeof that.CABECALHO_HABILITADO == 'undefined' ? true        : that.CABECALHO_HABILITADO;
					that.PAISAGEM = typeof that.PAISAGEM == 'undefined' 			? true        : that.PAISAGEM;
					that.VERSAO   = typeof that.VERSAO   != 'undefined' 			? that.VERSAO : '1.0.0';

					var tipo_page = that.PAISAGEM == true ? 1 : 2;

                    that.printHtml( that.tabela_id , that.titulo, that.filtro, $('#usuario-descricao').val(), that.VERSAO, tipo_page, '', that.zoom, that.tamanho_colunas);
				},
                imprimirPDF: function(){
                    var that = this;
					//console.log(that);
					
					that.PAISAGEM = typeof that.PAISAGEM == 'undefined' ? true        : that.PAISAGEM;
					that.VERSAO   = typeof that.VERSAO   != 'undefined' ? that.VERSAO : '1.0.0';

					var tipo_page = that.PAISAGEM == true ? 1 : 2;

                    that.printHtml( that.tabela_id , that.titulo, that.filtro, $('#usuario-descricao').val(), that.VERSAO, tipo_page, '', that.zoom, that.tamanho_colunas,'printPDF')
					.then(function(win){

						var iframe=document.createElement('iframe');
						document.body.appendChild(iframe);

						var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
    					iframedoc.body.innerHTML= win.HTML;

						html2canvas(iframedoc.body, {
							useCORS: true,
            				background: "#ffffff",
							onrendered: function(canvas) {         
								var imgData = canvas.toDataURL('image/png');  
								
								var imgWidth =  (canvas.width  * 60) / 240;
                 				var imgHeight = (canvas.height * 70) / 240;

								var doc = new jsPDF('p', 'mm');
								doc.addImage(imgData, 'PNG', 15, 2, imgWidth, imgHeight);
								doc.save('sample-file.pdf');
							}
						});						

					});
				},
				exportEmail: function(tabela, nome, email_user){
					var that 	= this;
					email_user 	= angular.element('#usuario-email').val();
					tabela 		= that.tabela_id+'_tabela';
					nome 		= that.titulo;					
					email_user 	= email_user+'';
					that.opemEmailFile(that.titulo, 'Tabela: '+that.titulo+' em anexo', email_user, nome , tabela);
				},
				opemEmailFile: function(asunto, corpo, email, name, table, file_tipe){
					var that = this;
					var str_file = '';

					if (typeof file_tipe == 'undefined') {
						file_tipe = '';
					}

					that.exportHTML(1);
					that.exportHtmlPDF(1);

					showAlert('Carregando informações necessárias...');

					that.Time2 = $timeout(function(){					
						//that.exportPDF(1).then(function(response) {

							that.pdf_generated = {};//response

							if(file_tipe == 'CSV' || file_tipe == 'XLS' || file_tipe == ''){
								str_file = ''
								+'<div class="itens-inputs">'
								+'  <div class="form-group">'
								+'      <label>Arquivo:</label>'
								+'      <select class="tipe-file-send">'
								+'          <option value="PDF3">PDF</option>'
								+'          <option value="CSV">CSV</option>'
								+'          <option value="HTML">HTML</option>'
								+'          <option selected="selected" value="XLS">XLS</option>'
								+'      </select>'
								+'  </div>'
								+'</div>';
							}else{
								str_file = ''
								+'<div class="itens-inputs">'
								+'  <div class="form-group">'
								+'      <label>Arquivo:</label>'
								+'      <select class="tipe-file-send">'
								+'          <option selected="selected" value="'+file_tipe+'">'+file_tipe+'</option>'
								+'      </select>'
								+'  </div>'
								+'</div>';    
							}
						
							addConfirme('Email',''
						
								+'<input type="text" style="display: none;" name="titulo" class="name-file-send"  value="'+name+'" autocomplete="off">'
								+'<input type="text" style="display: none;" name="titulo" class="table-file-send" value="'+table+'" autocomplete="off">'
						
								+ str_file
						
								+'<div class="itens-inputs">'   
								+'  <div class="form-group">'
								+'      <label>Para:</label>'
								+'      <input type="text" style="width: 100% !important;text-transform: lowercase;" name="titulo" class="email-file-send form-control input-maior" value="'+email+'" autocomplete="off">'
								+'  </div>'
								+'</div>'
						
								+'<div class="itens-inputs">'
								+'  <div class="form-group">'
								+'      <label>Assunto:</label>'
								+'      <input type="text" style="width: 100% !important;" name="titulo" class="assunto-file-send form-control input-maior normal-case" value="'+asunto+'" autocomplete="off">'
								+'  </div>'
								+'</div>'
								+'<div class="itens-inputs">'
								+'    <div class="form-group">'
								+'        <label>Descrição:</label>'
								+'        <textarea name="" class="form-control corpo-file-send normal-case" rows="5" cols="70" value="'+corpo+'">'+corpo+'</textarea>'
								+'    </div>'
								+'</div>',
									[
										{desc:'Enviar',class:'btn-primary btn-confirm-sim',ret:'1',hotkey:'f1',glyphicon:'glyphicon-ok'},
										{desc:'Cancelar',class:'btn-danger btn-confirm-can btn-voltar',ret:'2',hotkey:'esc',glyphicon:'glyphicon-ban-circle'}
									],
									[
										{ret:1,func:function(){

											var email  = $('.email-file-send').val();
											var asunto = $('.assunto-file-send').val();
											var corpo  = $('.corpo-file-send').val();
											var name   = $('.name-file-send').val();
											var table  = $('.table-file-send').val();
											var tipe   = $('.tipe-file-send').val();

											var file = name;

											if(tipe == 'CSV'){
												file = that.exportCsv(1);
											}

											if(tipe == 'XLS'){
												file = that.exportXls(1);
											}

											if(tipe == 'HTML'){
												file = that.HTML_EXPORT;
											}

											// Atenção: Tipo 'PDF' é utilizado no envio de e-mails para pedidos

											if(tipe == 'PDF2'){
												file = that.pdf_generated;
											}

											if(tipe == 'PDF3'){
												file = that.PDF_EXPORT;
											}


											that.sendEmailFile(email, file, tipe, asunto, corpo, name, table, tipe).then(function(){
												showSuccess('Arquivo enviado por email.');
												$('.modal.confirm').prev('.modal-backdrop.confirm').remove();
												$('.modal.confirm').remove();
											});

										}},
										{ret:2,func:function(){
											$('.modal.confirm').prev('.modal-backdrop.confirm').remove();
											$('.modal.confirm').remove();
										}}
									],'N'    
							);
							
							$timeout.cancel(that.Time2);
						//});
					}, 500);
					    
				},   
				getHtmlS : function(){
					var that = this;

					var html_div = $(that.componente_frame);
						html_div = html_div[0];
						html_div = html_div.contentWindow;
					var conteudo = $(html_div.document).find('body').html();

					conteudo = (conteudo+'').replaceAll("<script(.|\\s)*?</script>", "");

					return conteudo;

				},
				sendEmailFile: function(email, file, file_tipe, assunto, corpo, name, table){
					var that = this;
					return new Promise(function(resolve, reject) {
				
						var dados = {
							FILE_TIPE : file_tipe,
							EMAIL     : email,
							FILE      : file,
							ASSUNTO   : assunto,
							CORPO     : corpo,
							MOME      : name,
							TABLE     : table 
						};

						var dados_conv = [JSON.stringify(dados)];
						console.log('dados convertidos',dados_conv);
						var blob = new Blob(dados_conv,{type: 'text/plain;charset=utf-8'});
						console.log(blob);						
						var link = document.createElement("a");
						var csvUrl = URL.createObjectURL(blob);
						link.href = csvUrl;	

						var fd = new FormData();
						fd.append('fname', that.tabela_id);
						fd.append('data', blob);

						$.ajax({
							type: 'POST',
							url: '/sendEmailFileANY',
							data: fd,
							processData: false,
							contentType: false,
							success: function(resposta) {
								resolve(resposta);
							},
							error: function(resposta){
								showErro('Erro ao Enviar Email');
								reject(resposta);
							},
							xhr			: function () {
								var myXhr = $.ajaxSettings.xhr();
								if (myXhr.upload && true) {
									if(true){
										myXhr.upload.addEventListener('progress', progressPagina, false);
									}
								}
				
								return myXhr;
							},
							beforeSend	: function () {
								if(true){
									$('.carregando-pagina').fadeIn(200);
								}
							},
							complete	: function () {

								$('.carregando-pagina').fadeOut(200);
								$('.carregando-pagina2').fadeOut(200);
			
								setTimeout(function() {
									$('.carregando-pagina .progress .progress-bar')
										.attr({'aria-valuenow': 0,'aria-valuemax': 0})
										.css('width', 0);

									$('.carregando-pagina2 .progress .progress-bar')
										.attr({'aria-valuenow': 0,'aria-valuemax': 0})
										.css('width', 0);
								}, 300);

								//$(window).trigger('resize');  
						}
						});
					});
				},
				csv_com_bom: true,
				getTegsCsv : function(){
					return {
						tag_abrir   : '',
                        tag_fechar  : '',
                        lin_abrir   : '"',
                        lin_fechar  : '",',
                        col_abrir   : '"',
                        col_fechar  : '",',
                        coln_abrir  : '"',
                        coln_fechar : '",'
					};
				},
                exportTo : function (filename, rows, coll, tipo, param, titulo) {
					var that = this;
					
                    /*
                        coll = [
                            {COLUNA: 'ID', DESCRICAO:'ID', TIPO: 'INTEIRO'},
                            {COLUNA: 'DESCRICAO', DESCRICAO:'DESCRIÇÃO', TIPO: 'STRING'},
                            {COLUNA: 'DATA', DESCRICAO:'DATA', TIPO: 'DATA'},
                        ];

                        TIPOS:INTEIRO, STRING, DATA, NUMERICO, COR

                        tipo 1 = xls
                        tipo 2 = csv
                        tipo 3 = xlsx
                        tipo 4 = txt

                    */

                    var tag_abrir   = '';
                    var tag_fechar  = '';
                    var lin_abrir   = '';
                    var lin_fechar  = '';
                    var col_abrir   = '';
                    var col_fechar  = '';
					var coln_abrir  = '';
					var coln_fechar = '';
					

					var SEPARADOR_CSV		  = typeof that.SEPARADOR_CSV 		  != 'undefined' ? that.SEPARADOR_CSV 		  : ',';
					var ASPAS_VALORES_CSV	  = typeof that.ASPAS_VALORES_CSV 	  != 'undefined' ? that.ASPAS_VALORES_CSV 	  : '1';
					var SEPARADOR_DECIMAL_CSV = typeof that.SEPARADOR_DECIMAL_CSV != 'undefined' ? that.SEPARADOR_DECIMAL_CSV : ',';

					if(tipo == 1){
                        tag_abrir   = '<tr>';
                        tag_fechar  = '</tr>';
                        lin_abrir   = '<td style="background: #337ab7;color: white;">';
                        lin_fechar  = '</td>';
                        col_abrir   = '<td>';
                        col_fechar  = '</td>';
                        coln_abrir  = '<td align="right" sdnum="#FORMAT#">';
                        coln_fechar = '</td>';
                    }else{

						if(tipo == 3){
							tag_abrir   = '<ss:Row>';
							tag_fechar  = '</ss:Row>';
	
							lin_abrir   = '<ss:Cell ss:StyleID="ColoredRowStyle"><ss:Data ss:Type="String">';
							lin_fechar  = '</ss:Data></ss:Cell>';
	
							col_abrir   = '<ss:Cell><ss:Data ss:Type="String">';
							col_fechar  = '</ss:Data></ss:Cell>';
	
							coln_abrir  = '<ss:Cell ss:StyleID="AlingRight"><ss:Data ss:Type="String">';
							coln_fechar = '</ss:Data></ss:Cell>';
						}else{
							if(tipo == 4){
								tag_abrir   = '';
								tag_fechar  = '';
								lin_abrir   = '';
								lin_fechar  = ',';
								col_abrir   = '';
								col_fechar  = ',';
								coln_abrir  = '';
								coln_fechar = ',';
							}else{
								var tags = that.getTegsCsv();

								tags.lin_fechar = tags.lin_fechar.replaceAll(',',SEPARADOR_CSV);
								tags.col_fechar = tags.col_fechar.replaceAll(',',SEPARADOR_CSV);
								tags.coln_fechar= tags.coln_fechar.replaceAll(',',SEPARADOR_CSV);

								tag_abrir   = tags.tag_abrir;
								tag_fechar  = tags.tag_fechar;
								lin_abrir   = tags.lin_abrir;
								lin_fechar  = tags.lin_fechar;
								col_abrir   = tags.col_abrir;
								col_fechar  = tags.col_fechar;
								coln_abrir  = tags.coln_abrir;
								coln_fechar = tags.coln_fechar;
							}
						}
                    }

                    var formatar = 0;

                    if(coll){
                        if(coll.length > 0){
                            formatar = 1;
                        }   
                    }

                    var csvFile = '';

                    if(Object.keys(rows).length > 0){
                        var l = tag_abrir;

                        if(formatar == 1){
                            angular.forEach(coll, function(coluna, key) {

                                angular.forEach(rows[0], function(valor, campo) {
                                    if(coluna.CAMPO == campo){
                                        campo = coluna.DESCRICAO;
                                        l += lin_abrir + campo + lin_fechar; 
                                    }
                                });
                                
                            });
                        }else{
                            angular.forEach(rows[0], function(valor, campo) {
                                l += lin_abrir + campo + lin_fechar;
                            });   
                        }

                        l += tag_fechar;

                        csvFile += l;

                        if(tipo == 2){
                            csvFile = (csvFile + '').substring(0 , (csvFile + '').length -1);
						}

						if(tipo == 4){
                            csvFile = (csvFile + '').substring(0 , (csvFile + '').length -1);
						}
						
                        csvFile += '\r\n';
					}
					
					if(that.CABECALHO_CSV == 0 || that.CABECALHO_CSV == 2){
						csvFile = '';
					}

                    angular.forEach(rows, function(linha, key) {

                        var l = tag_abrir;
                        
                        if(formatar == 1){
                            angular.forEach(coll, function(coluna, key) {

                                var cor = '';

                                angular.forEach(linha, function(valor, campo) {
                                    if(coluna.CAMPO == campo){

										var e_numero = 0;
										var format   = '';

										var tipo_coluna = coluna.TIPO;

										if(typeof coluna.TIPO_EXP != 'undefined'){
											tipo_coluna = coluna.TIPO_EXP;
										}

                                        if(tipo_coluna == 'integer'){
                                            valor = parseInt(valor);
                                        }

                                        if(tipo_coluna == 'number'){
											valor  = Number(valor);
											if(tipo == 2){
												valor  = formatNumber(valor, coluna.DECIMAL, SEPARADOR_DECIMAL_CSV, '');
												format = '1046;0;#.##'+formatNumber(0, coluna.DECIMAL, SEPARADOR_DECIMAL_CSV, '');
											}else{
												valor  = formatNumber(valor, coluna.DECIMAL, ',', '');
												format = '1046;0;#.##'+formatNumber(0, coluna.DECIMAL, ',', '');
											}
											
											e_numero = coluna.DECIMAL;
                                        }

                                        if(tipo_coluna == 'date'){
                                            valor = valor;
                                        }

                                        if(tipo_coluna == 'cor'){
											if(typeof value === 'object' && value.constructor === Array){
												valor = valor.join(','); 
											}else{
												valor = valor;
											}
                                        }

                                        if(tipo_coluna == 'string'){
                                            valor = (''+ valor + '');
										}

										if(tipo_coluna == 'status'){
                                            valor = (''+ valor + '');
										}
										
										if(tipo_coluna == 'btn-danger'){
                                            valor = valor;
										}
										
										if(tipo_coluna == 'btn-primary'){
                                            valor = valor;
										}
										
										if(tipo_coluna == 'btn-success'){
                                            valor = valor;
										}
										
										if(tipo_coluna == 'btn-warning'){
                                            valor = valor;
                                        }

                                        if(tipo == 2){
											valor = (valor + '').replace(/("|\n)/g,' ');
                                        }

										if(coluna.FN_FORMATAR != undefined){
                                            valor = coluna.FN_FORMATAR(linha, valor);
                                        }

										if(e_numero > 0){
											l += (coln_abrir+'').replaceAll('#FORMAT#', format) + valor + coln_fechar; 
										}else{
                                        	l += col_abrir + valor + col_fechar; 
										}
                                    }
                                });

                            });
                        }else{
                            angular.forEach(linha, function(valor, campo) {
								valor = (valor + '').replace(/("|\n)/g,' ');
                                l += col_abrir + valor + col_fechar; 
                            });
                        }

                        l += tag_fechar;

                        csvFile += l;

                        if(tipo == 2){
                            csvFile = (csvFile + '').substring(0 , (csvFile + '').length -1);
                        }

						if(tipo == 4){
                            csvFile = (csvFile + '').substring(0 , (csvFile + '').length -1);
						}

                        csvFile += '\r\n';
                    });

					if(ASPAS_VALORES_CSV == 0){
						csvFile = (csvFile + '').replaceAll('"', '');
					}

                    var html = csvFile;

                    if(tipo == 1){
						
						if(typeof param == 'undefined'){
						
							var tab_text = '\ufeff' + '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
								tab_text = tab_text + '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
								tab_text = tab_text + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></meta>';
								tab_text = tab_text + '<meta name=ProgId content=Excel.Sheet></meta>';
								tab_text = tab_text + '<meta name=Generator content="Microsoft Excel 15"></meta></meta>';
								tab_text = tab_text + '<x:Name>'+(typeof titulo == 'undefined' ? 'Pasta 1' : titulo)+'</x:Name>';
								tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
								tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';
								tab_text = tab_text + "<table border='1px'>";
								tab_text = tab_text + html;
								tab_text = tab_text + '</table></body></html>';
							

							str = decodeURIComponent(encodeURIComponent(tab_text));

							var blob = new Blob([ str ], {
								type : "text/plain;charset=utf-8;"
							});

							var link = document.createElement("a");
							var csvUrl = URL.createObjectURL(blob);
							link.href = csvUrl;
							link.style = "visibility:hidden";
							link.download = filename;
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);

							return '';
						}else{
							var str = ExcellentExport.excel5(filename,html);							
							return str;
						}
                        
                    }else{
						
						if(tipo == 3){
						
							if(typeof param == 'undefined'){

								var tab_text = '\ufeff'
									+'<?xml version="1.0" encoding="UTF-8"?> '
									+'<?mso-application progid="Excel.Sheet"?> '
									+'<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" '
									+'xmlns="urn:schemas-microsoft-com:office:spreadsheet" '
									+'xmlns:x="urn:schemas-microsoft-com:office:excel"> '
									+'	<ss:Styles> '
									+'		<ss:Style ss:ID="DecimalStyle0"><NumberFormat ss:Format="#,##0"/></ss:Style> '
									+'		<ss:Style ss:ID="DecimalStyle1"><NumberFormat ss:Format="#,##0.0"/></ss:Style> '
									+'		<ss:Style ss:ID="DecimalStyle2"><NumberFormat ss:Format="#,##0.00"/></ss:Style> '
									+'		<ss:Style ss:ID="DecimalStyle3"><NumberFormat ss:Format="#,##0.000"/></ss:Style> '
									+'		<ss:Style ss:ID="DecimalStyle4"><NumberFormat ss:Format="#,##0.0000"/></ss:Style> '
									+'		<ss:Style ss:ID="DecimalStyle5"><NumberFormat ss:Format="#,##0.00000"/></ss:Style> '
									+'		<ss:Style ss:ID="DecimalStyle6"><NumberFormat ss:Format="#,##0.000000"/></ss:Style> '
									+'		<ss:Style ss:ID="DecimalStyle7"><NumberFormat ss:Format="#,##0.0000000"/></ss:Style> '
									+'		<ss:Style ss:ID="AlingRight"> '
									+'			<ss:Alignment ss:Horizontal="Right" ss:Vertical="Center"/> '
									+'		</ss:Style> '
									+'		<ss:Style ss:ID="ColoredRowStyle"> '
									+'			<ss:Interior ss:Color="#337ab7" ss:Pattern="Solid"/> '
									+'		</ss:Style> '
									+'	</ss:Styles> '
									+'	<ss:Worksheet ss:Name="Sheet1"> '
									+'  <ss:Table> ' + html.replaceAll('%', '&#37;') +' </ss:Table></ss:Worksheet></ss:Workbook> ';
	
								str = decodeURIComponent(encodeURIComponent(tab_text));
	
								var blob = new Blob([ str ], {
									type : "text/plain;charset=utf-8;"
								});
	
								var link = document.createElement("a");
								var csvUrl = URL.createObjectURL(blob);
								link.href = csvUrl;
								link.style = "visibility:hidden";
								link.download = filename;
								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
	
								return '';
							}else{
								var str = ExcellentExport.excel5(filename,html);							
								return str;
							}
							
						}else{	

							if(tipo == 4){
								
								var txtData = csvFile; // ou o conteúdo que você quiser salvar

								var blob = new Blob([txtData], {
									type: "text/plain;charset=utf-8;"
								});

								var link = document.createElement("a");
								var txtUrl = URL.createObjectURL(blob);

								link.href = txtUrl;
								link.style = "visibility:hidden";
								link.download = filename.endsWith(".txt") ? filename : filename + ".txt";

								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);

								URL.revokeObjectURL(txtUrl);

								return '';
							}else{
								if(typeof param == 'undefined'){
								
									if(that.csv_com_bom){
										var csvData = '\ufeff'+ decodeURIComponent(encodeURIComponent(csvFile));

										var blob = new Blob([ csvData ], {
											type : "application/csv;charset=utf-8,%EF%BB%BF;"
										});
									}else{
										var csvData = decodeURIComponent(encodeURIComponent(csvFile));

										var blob = new Blob([ csvData ], {
											type : "application/csv;charset=utf-8;"
										});
									}

									var link = document.createElement("a");
									var csvUrl = URL.createObjectURL(blob);
									link.href = csvUrl;
									link.style = "visibility:hidden";
									link.download = filename;
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
									return '';
								}else{
									return csvFile;
								}
							}
						}
                    }
                },
                printHtml: function(elemento, titulo, filtro, user, versao, pagina, css, zoom, tamanho_colunas, tipo_doc, cabecalho){
					var that = this;						
					var tipo_print = 0;    
					that.imprinting = true;
					var link_page = urlhost;
						 
					return new Promise(function(resolve, reject) {

						if(pagina == 1){
							var tam_filt = '750';
						}else{
							var tam_filt = '520';
						}

						var div_top = '';
						if(that.CABECALHO_HABILITADO == true){
							var dir_empresa = trim_null(path_dir_empresa);
							// var dir_empresa = '';

							// Logo do Relatório
							var logo_relatorio = `${link_page}/assets/images/logo/${dir_empresa}relatorio/logo.png`;

							div_top = '<div class="divFooter" id="top" style="border: 1px solid; z-index: 999; height: 85px !important;"> '+
											//' <div class="logo"> '+
										//		'<img style="width: 100px; margin-top: 10px;" src="'+link_page+'/assets/images/logo/'+path_dir_empresa+'relatorio/logo.png"> ' +
										//	' </div> '+
											'<div class="logo" style="width: 110px; height: 60px; margin-top: 10px; display: flex; align-items: center;"> '+
											'	<img src="'+ logo_relatorio +'" style="width: 100%; height: auto; background-size: cover;"></img> '+
											// '	<div style="background-image: url(\''+ link_page +'/assets/images/logo/'+ dir_empresa +'relatorio/logo.png\'); background-size: contain;"></div> '+
											'</div> '+
											' <div class="center" style="margin-left: 20px; max-width: '+tam_filt+'px;"> '+
												'<label style="font-size: 12px; font-weight: 600; float: left; clear: left; margin-right: 5px;">GCWEB - '+(grupo_empresarial+'').toUpperCase()+'</label> '+
												'<label style="font-size: 12px; font-weight: 600; float: left; clear: left; margin-right: 5px;">'+titulo+'</label> '+
												'<div style="max-height: 30px; height: 30px; overflow: hidden; text-overflow: ellipsis; font-size: 8px; font-weight: normal; float: left; clear: left; margin-right: 5px;">'+filtro+'</div> '+
											' </div> '+
											' <div class="right"> '+
												'<label style="font-size: 12px; font-weight: 600;">'+moment().format('L')+' '+moment().format('LT')+'</label>'+
												'<label style="font-size: 12px;overflow: hidden; text-overflow: ellipsis; -webkit-line-clamp: 1; width: 100px !important; word-wrap: break-word; word-break: break-all; white-space: nowrap;" class="pagina" >'+user+'</label>'+
												'<label style="font-size: 12px;" class="pagina">Vr:'+versao+'</label>'+
											'</div>'+
										' </div> '+     
									'';

						}
						var top = div_top;

						var fim1 = '<tfoot><tr><th colspan="100"><div style="background-color:black;width:100%;height:2px;"></div></th></tr></tfoot>';
						var fim2 = ''; //<div style="border: 2px solid; border-style: dotted; width:100%;height:2px;"></div><br><div style="text-align:center">'+user+' / '+moment().format('L')+' '+moment().format('LT')+'</div>';
				
						if(tipo_print == 1){
				
							var $print = $('#'+elemento)
							.clone()
							.prepend(top)
							.addClass('print')
							.addClass('printable')
							.prependTo('body');
				
							$('.navbar').css('display', 'none'); 
							$('.container-fluid').css('display', 'none');
				
							// Stop JS execution
							window.print();
				
							$('.navbar').css('display', 'block'); 
							$('.container-fluid').css('display', 'block'); 
				
							// Remove div once printed
							$print.remove();
							resolve('');

						}else{						
							//eval(that.model).rendering = true;
							
							if(that.html_speed != true){
								that.compile_print_html(elemento+'_print',elemento);
							}

							var timer_t = 500;
							if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado'){
								var qtd_dados_t = that.DADOS_RENDER.length;								
							}else if(that.tipo_tabela == 'accordion'){
								var qtd_dados_t = that.total_dados * 100;
							}

							if(qtd_dados_t < 500 || qtd_dados_t == 500 ) {
								timer_t = 800;
							}else if(qtd_dados_t > 500 && qtd_dados_t < 1000){
								timer_t = 900;
							}else if(qtd_dados_t > 1000 && qtd_dados_t < 2000) {
								timer_t = 1150;
							}else if(qtd_dados_t > 1000 && qtd_dados_t < 2000) {
								timer_t = 1340;
							}else if(qtd_dados_t > 2000 && qtd_dados_t < 3000) {
								timer_t = 1540;
							}else if(qtd_dados_t > 3000 && qtd_dados_t < 4000) {
								timer_t = 1700;
							}else if(qtd_dados_t > 4000 && qtd_dados_t < 5000) {
								timer_t = 1900;
							}else{
								timer_t = 2100;
							}

							// apagar html gerado
							var elm = document.getElementById("ifreme_html");
							if(typeof elm != "undefined" && trim_null(elm) != ''){
								var elm2 = elm.contentWindow.document.getElementById("container4");

								if(typeof elm2 != "undefined" && trim_null(elm2) != ''){
									var elm3 = elm2.children;

									if(elm3.length > 1){
										for (let i = 1; i < elm3.length; i++) {
											var elm4 = elm3[i];

											elm4.parentNode.removeChild(elm4);
										}
									}
								}
							}

							var gerar_print = new Promise(function(resolve, reject) {

								if(typeof that.IMPRESSAO_RELATORIO != "undefined" && trim_null(that.IMPRESSAO_RELATORIO) != '' && Number(that.IMPRESSAO_RELATORIO) == 1){
									$("#ifreme_html")[0].contentWindow.document.getElementById("btnGerarHtmlImprimir").click();
								}

								setTimeout(function() {
									resolve('');
								}, timer_t); 
							});								

							gerar_print.then(function(){

								if(that.html_speed != true){
									if(that.vs_scroll == true && typeof that.vs_scroll != 'undefined'){
										if(that.filtro_visible == true){
											var html_div = $('#'+elemento+'vs_render div').eq(1);
										}else{
											var html_div = $('#'+elemento+'vs_render div').eq(0);
										}
										var conteudo = html_div.html();
									}else{
										var html_div = $('#'+elemento);
										var conteudo = html_div.html();
									}
								}else{
									/*
									var html_div = $(that.componente_frame);
										html_div = html_div[0];
										html_div = html_div.contentWindow;
									var conteudo = $(html_div.document).find('body').html();
									*/

									if(typeof that.IMPRESSAO_RELATORIO != "undefined" && trim_null(that.IMPRESSAO_RELATORIO) != '' && Number(that.IMPRESSAO_RELATORIO) == 1){
										var conteudo = $("#ifreme_html")[0].contentWindow.document.getElementById("table3").innerHTML;
									}else{
										var conteudo = that.CACHE_HTML;
									}
									conteudo = (conteudo+'').replaceAll("<script(.|\\s)*?</script>", "");
								}
									
								var html_iframe = '<iframe id="'+elemento+'_print" ';

								if(that.html_speed == true){
									var iframe = html_iframe+' style="width:100%; height:50%;" hidden> '+
													' <p>Sem suporte ao iframe</p>' +
													'</iframe>';
													
									$('#tabela_print').prepend(iframe);

									var win = document.getElementById(elemento+'_print').contentWindow;
								}else{
									if(document.getElementById(elemento+'_gerar_print')){
										if(document.getElementById(elemento+'_print')){
											document.getElementById(elemento+'_print').remove();						//hidden
											var iframe =  html_iframe+' style="width:100%; height:50%;" hidden> '+
															' <p>Sem suporte ao iframe</p>' +
															'</iframe>';
											$('#'+elemento+'_gerar_print').prepend(iframe);
											var win = document.getElementById(elemento+'_print').contentWindow;
										}else{
											var iframe =  html_iframe+' style="width:100%; height:50%;" hidden> '+
															' <p>Sem suporte ao iframe</p>' +
															'</iframe>';
											$('#'+elemento+'_gerar_print').prepend(iframe);
											var win = document.getElementById(elemento+'_print').contentWindow;
										}

									}else{
										var div_relatorio = '<div id="'+elemento+'_gerar_print"></div>';
										$(div_relatorio).insertAfter($('#'+elemento));
										if(document.getElementById(elemento+'_print')){
											document.getElementById(elemento+'_print').remove();
											var iframe = html_iframe+' style="width:100%; height:50%;" hidden> '+
															' <p>Sem suporte ao iframe</p>' +
															'</iframe>';
											$('#'+elemento+'_gerar_print').prepend(iframe);
											var win = document.getElementById(elemento+'_print').contentWindow;
										}else{
											var iframe = html_iframe+' style="width:100%; height:50%;" hidden> '+
												' <p>Sem suporte ao iframe</p>' +
												'</iframe>';
												
												$('#'+elemento+'_gerar_print').prepend(iframe);

												var win = document.getElementById(elemento+'_print').contentWindow;
										}
									}
								}

								if(typeof zoom == "undefined"){zoom = 1;}else{zoom = zoom/100;}
								if(tipo_doc == 'pdf'){var overflow = 'overflow: hidden;'; tamanho_colunas = 38}else{ var overflow = '';}		

								var sty = ' style="zoom:'+zoom+'; width: 100%; '+overflow+'"'; 

								var tamanho_padrao = 150;
								if(typeof tamanho_colunas == 'undefined'){										
									if(typeof that.style_col_print != 'undefined' && tipo_doc != 'pdf'){
										var style_colunas = that.style_col_print;
									}else if(tipo_doc != 'pdf'){
										var style_colunas = '<style> thead tr {height:'+(that.CABECALHO_HABILITADO == true ? tamanho_padrao : 30) +'px !important; }</style>';
									}else{
										var style_colunas = '';											
									}										
								}else{
									if(typeof that.style_col_print == 'undefined'){
										var style_colunas = '<style> thead tr {height:'+(that.CABECALHO_HABILITADO == true ? tamanho_padrao : 30)+'px !important;}</style>';	
									}else{
										if(tipo_doc != 'pdf'){
											var style_colunas = that.style_col_print;	
										}									
									}										
								}
								var ajuste_zoom = '';

								if(typeof that.OBSERVACAO_VISUAL_REL != "undefined" && trim_null(that.OBSERVACAO_VISUAL_REL) != ''){
									var footer_html = '<br><br> <div style="page-break-inside: avoid !important; background-color: #eeeeee; width: 100%; float: left; padding: 5px; height: 150px; margin-top: 60px;"> '+
                                    '                               <div style="background-color: #eeeeee; width: 100%; margin-right: 1%; float: left; padding: 5px; height: 150px;"> '+
                                    '                                   <div><span style="font-weight: bold;"></span><br></div> '+ 
                                    '                                   <div><span class=""> '+ trim_null(that.OBSERVACAO_VISUAL_REL) +'</div> '+
                                    '                               </div> '+
                                    '                           </div>';
								}else{
									var footer_html = '';
								}
								
								ajuste_zoom = '<style> table { zoom: '+Number(zoom)+' !important; }</style>';

								if(tipo_doc == 'pdf'){								
									win.document.write('<page size="A4">' + style_colunas + conteudo + footer_html + '</page>');
								}else{
									win.document.write('<page size="A4">' + top + style_colunas + ajuste_zoom + conteudo + footer_html + fim1 + '</page>');
								}	                           

								var head = $(win.document.head).html() + '';
								var css_buscar = $(document).find('link');
								
								for(var b = 0; b < css_buscar.length;b++){
									var tal = $(css_buscar[b]).attr('href');
									
									if(tal.indexOf('http') == -1){
										tal = link_page+''+tal;
									}

									head = head + '<link rel="stylesheet" href="'+tal+'">';
								}

								if(pagina == 1){
									head = head + '<link rel="stylesheet" href="'+link_page+'/js/page_paisagem.css">';
								}else{
									head = head + '<link rel="stylesheet" href="'+link_page+'/js/page_retrato.css">';
								}
			
								if(css != ''){
									head += '<link rel="stylesheet" href="'+css+'">';
								}
								
								head = head + ' <script nonce="'+that.nonce+'" src="'+link_page+'/js/print.js"></script>';
				
								$(win.document).find('head').prepend(head);
								$(win.document).find('.selected').removeClass('selected');
								$(win.document).find('.no-print').css('display', 'none');

								$(win.document).find('#table4').css('height', '');

								if(that.html_speed == true || that.cabecalho_print == true){
									
									if(that.html_speed == true){
										
										$(win.document).find('.table-ec').css('height'		, 'unset', 'important');
										$(win.document).find('.table-ec').css('min-height'	, 'unset', 'important');
										$(win.document).find('.table-ec').css('overflow'	, 'unset', 'important');
										$(win.document).find('.table-ec').css('width'		, '100%' , 'important');
										
										var html_div = $(that.componente_frame);
										html_div = html_div[0];
										html_div = html_div.contentWindow;
										var imputs_coluna = $(html_div.document).find('body').find('.imput_coluna');
									}else{
										var html_div = $(that.componente);
										html_div = html_div[0];
										var imputs_coluna = $(html_div).find('.imput_coluna');
									}										

									if(imputs_coluna.length > 0){
										$(imputs_coluna).each(function(key){
											var colid = $(this).attr('colid');
											var check = $(this).is(':checked');

											$(win.document).find('body').find('.colid_'+colid).each(function( index ) {
												try {
													var min = $(this).css('min-width');
													var max = $(this).css('max-width');
														min = Number(('0'+ min).replace('px','').replace('vw !important','').replace('none',''));
														max = Number(('0'+ max).replace('px','').replace('vw !important','').replace('none',''));

													if(min > 0 && max > 0){
														$(this).css('word-break' ,'break-word' , 'important');
														$(this).css('white-space','pre-wrap'   , 'important');
													}
												} catch (error) {
													
												}
											});

											//$(win.document).find('body').find('.colid_'+colid).css('word-break' ,'break-word' , 'important');
											//$(win.document).find('body').find('.colid_'+colid).css('white-space','pre-wrap'   , 'important');

											if(check == true){

											}else{

												console.log($(win.document).find('body').find('.colid_'+colid));

												$(win.document).find('body').find('.colid_'+colid).css('font-size' 	,'0.000000000001px', 'important');
												$(win.document).find('body').find('.colid_'+colid).css('max-width'	,'0px'			   , 'important');
												$(win.document).find('body').find('.colid_'+colid).css('min-width'	,'0px'			   , 'important');
												$(win.document).find('body').find('.colid_'+colid).css('padding'	,'0px'			   , 'important');
												$(win.document).find('body').find('.colid_'+colid).css('border'		,'0'			   , 'important');
												$(win.document).find('body').find('.colid_'+colid).css('margin'		,'0'			   , 'important');
												$(win.document).find('body').find('.colid_'+colid).css('display'	,'none'			   , 'important');

												$(win.document).find('body').find('.colid_'+colid).css('width'		,'0px' 				, 'important');
												$(win.document).find('body').find('.colid_'+colid).css('display'	,'table-cell' 		, 'important');

												$(win.document).find('body').find('.colid_'+colid).addClass('item_ocultar');
											}
										});
									}
								}
								
								var timer = 0;
								
								if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado'){
									var qtd_dados = that.DADOS_RENDER.length;								
								}else if(that.tipo_tabela == 'accordion'){
									var qtd_dados = that.total_dados;
								}

								if(that.vs_scroll == true && typeof that.vs_scroll != 'undefined'){
									$(win.document).find('.legenda_padrao').css('display', 'none');
								}

								$(win.document).find('div.dropdown.acoes').css('display', 'none');									

								if(qtd_dados < 500 || qtd_dados == 500 ) {
									timer = 800;
								}else if(qtd_dados > 500 && qtd_dados < 1000){
									timer = 900;
								}else if(qtd_dados > 1000 && qtd_dados < 2000) {
									timer = 1150;
								}else if(qtd_dados > 1000 && qtd_dados < 2000) {
									timer = 1340;
								}else if(qtd_dados > 2000 && qtd_dados < 3000) {
									timer = 1540;
								}else if(qtd_dados > 3000 && qtd_dados < 4000) {
									timer = 1700;
								}else if(qtd_dados > 4000 && qtd_dados < 5000) {
									timer = 1900;
								}else{
									timer = 2100;
								}

								var needle   = 'background-image'
								var re 		 = new RegExp(needle,'gi');
								var haystack = angular.copy(conteudo);

								var results = new Array();//this is the results you want
								while(re.exec(haystack)){
									results.push(re.lastIndex);
								}

								if(results.length > 0){
									timer = timer + (results.length * 450);
								}


								if(typeof tipo_doc == 'undefined' || tipo_doc == 'print' || tipo_doc == 'printPDF' || tipo_doc == 'ArquivoPDF'){

									/*
									var docker = "<!DOCTYPE html><html><head>"+head+"</head><body>"+
												 document.getElementById(elemento+'_print').contentWindow.document.body.innerHTML+
												 "</body></html>";

									var csvData = '\ufeff'+docker;
									var blob = new Blob([ csvData ], {
										type : "text/html;charset=utf-8;"
									});

									var link = document.createElement("a");
									var csvUrl = URL.createObjectURL(blob);

									link.href = csvUrl;
									link.style = "visibility:hidden";
									link.download = 'print.html';
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
									//*/
									
									if(tipo_doc == 'printPDF'){

										var docker = document.getElementById(elemento+'_print').contentWindow.document.body.innerHTML;

										var obj_html = {
											elemento : elemento,
											win		 : win,
											HTML	 : docker,
											STYLE	 : head,
											top 	 : top,
											fim 	 : fim1
										};
										
										docker = '';

										resolve(obj_html);

									}else if(tipo_doc == 'ArquivoPDF'){

										var obj_html = {
											HTML	: win.document.documentElement.innerHTML,
										}

										resolve(obj_html);

									}else{

										win.setTimeout(function(){
											win.print();  
											win.close();
										},timer);

										resolve('');
									}

									that.imprinting = false;

								}else if(tipo_doc == 'pdf' || tipo_doc == 'html'){

									if(that.html_speed == true){
										//var docker = win.document.documentElement.outerHTML;

										var docker = ''
										+' <style>										' + '\n'
										+' table {										' + '\n'
										+' 		width: 100%;							' + '\n'
										+' 		border: 1px solid #dfdfdf;				' + '\n'
										+' 		border-collapse: collapse;				' + '\n'
										+' 		border-spacing: 0;						' + '\n'
										+' 	}											' + '\n'
										+' table thead tr th {                          ' + '\n'
										+'     background-color: #337ab7;               ' + '\n'
										+'     color: white;                            ' + '\n'
										+'     font-size: 14px;                         ' + '\n'
										+'     font-weight: normal;                     ' + '\n'
										+'     white-space: nowrap;                     ' + '\n'
										+' }                                            ' + '\n'
										+'                                              ' + '\n'
										+' tbody tr td {                                ' + '\n'
										+'     font-size: 14px;                         ' + '\n'
										+'     font-weight: normal;                     ' + '\n'
										+'     white-space: nowrap;                     ' + '\n'
										+' }                                            ' + '\n'
										+'                                              ' + '\n'
										+' tr {                                         ' + '\n'
										+'     height: 26px;                            ' + '\n'
										+' }                                            ' + '\n'
										+'                                              ' + '\n'
										+' tr th {                                      ' + '\n'
										+'     height: 26px;                            ' + '\n'
										+'     padding: 1px !important;                 ' + '\n'
										+' }                                            ' + '\n'
										+'                                              ' + '\n'
										+' table#container1 {                           ' + '\n'
										+'   border: 1px solid #dfdfdf;                 ' + '\n'
										+' }                                            ' + '\n'
										+' table#container3 {                           ' + '\n'
										+'   border: 1px solid #dfdfdf;                 ' + '\n'
										+' }                                            ' + '\n'
										+'                                              ' + '\n'
										+' thead tr {                                   ' + '\n'
										+'   border: 1px solid #dfdfdf !important;      ' + '\n'
										+' }                                            ' + '\n'
										+'                                              ' + '\n'
										+' div#table1 {                                 ' + '\n'
										+'   border-radius: 6px !important;             ' + '\n'
										+' }                                            ' + '\n'
										+' div#table3 {                                 ' + '\n'
										+'   border-radius: 6px !important;             ' + '\n'
										+'   display: none !important;                  ' + '\n'
										+' }                                            ' + '\n'
										+'                                              ' + '\n'
										+' tr > th.item_ocultar, tr > td.item_ocultar {	' + '\n'
										+' 	width: 0px !important;						' + '\n'
										+' 	display: table-cell !important;				' + '\n'
										+' }											' + '\n'
										+' </style>                                     ';


										if(typeof that.IMPRESSAO_RELATORIO != "undefined" && trim_null(that.IMPRESSAO_RELATORIO) != '' && Number(that.IMPRESSAO_RELATORIO) == 1){
											var docker = docker + $("#ifreme_html")[0].contentWindow.document.getElementById("table3").innerHTML;
										}else{
											var docker = docker + $(win.document).find('body').find('.table-ec').html();
										}

										docker = (docker+'').replace('<table ','<table border="1" ');

									}else{
										var docker = document.getElementById(elemento+'_print').contentWindow.document.body.innerHTML;		
									}

									var obj_html = {
										elemento:elemento,
										HTML	: docker,
										STYLE	: head,
									 	top 	: top,
										fim 	: fim1
									};
									
									docker = '';
									resolve(obj_html);
									that.imprinting = false;								
								}					
								
							});
						}
					});	
				},
				print_end : function(win){
					var that = this;
					if(win == that.tabela_id){
						win.setTimeout(function(){
							win.print();
							win.close();
						});
					}
				},
                ModalOPT : {
					father  : this, 
					key_object_scop2 : -1,
					destroy : function(){
						var that = this;

						if(typeof gScope.childScopes == 'undefined'){ gScope.childScopes = []; }

						if(that.key_object_scop2 >= 0){
							var result = gScope.childScopes[that.key_object_scop2];
							
							if(typeof result != 'undefined' && result != null){
								var childScope = result ? result.childScope : null;

								result.destroy();

								/*
								try {
									var orphaned1 = safeCompiler.findOrphanWatchers();
													safeCompiler.cleanOrphanWatchers();
									var orphaned2 = safeCompiler.findOrphanWatchers();

									console.log('Orphaned Watchers before clean: ', orphaned1.length);
									console.log('Orphaned Watchers after clean: ', orphaned2.length);
								} catch (error) {
									
								}*/

								try {
									if (typeof childScope != 'undefined') {
										
										childScope.$$watchers 	 = null;
										childScope.$$nextSibling = null;
										childScope.$$prevSibling = null;
										childScope.$$childHead   = null;
										childScope.$$childTail   = null;

										childScope.$destroy();
										gScope.childScopes[that.key_object_scop2] = null;
									}

									var obj = $(that.componente);
									if ( obj.length > 0 ) {	
										obj.html('');
									}
								} catch (error) {
									
								}
							}
						}
					},
                    compile : function(){
                        var that  = this.father;
						var thoth = this;
						
						function initModalOPT(){

							var cont = $('#'+that.tabela_id+'_modal').length;

							if(!cont){     
								console.log('Inicializando Modal OPT');

								var html = thoth.getHtml();
								var obj  = $(that.componente).closest('.ng-scope');
			
								if ( obj.length > 0 ) {	

									var scope = obj.scope(); 
									obj.append(html);
									obj  = $('#'+that.tabela_id+'_modal');

									if(typeof gScope.childScopes == 'undefined'){ gScope.childScopes = []; }

									if(thoth.key_object_scop2 >= 0){
										var childScope = gScope.childScopes[thoth.key_object_scop2];

										if (typeof childScope != 'undefined') {
											childScope.$destroy();
											gScope.childScopes[thoth.key_object_scop2] = undefined;
										}
									}
									
									if(thoth.key_object_scop2 < 0){
										thoth.key_object_scop2 = gScope.childScopes.length;
									}

									childScope = scope.$new();
									gScope.childScopes[thoth.key_object_scop2] = childScope;

									that.compiledElement2 = $compile(obj.contents())(childScope);
									childScope.$on("$destroy", function() {
										that.compiledElement2.remove();
									});

									thoth._modal = $('#'+that.tabela_id+'_modal');
								}
							}else{
								console.log('Modal OPT já inicializado');
								//console.log(that);
							}
						}

                        var cont = $('#'+that.tabela_id+'_modal').length;
						
						if(!cont){                           
							initModalOPT();
                        }else{
							thoth._modal = $('#'+that.tabela_id+'_modal');
                            return false;   
                        }
    
					},
                    getHtml : function(){
                          var that = this.father;
                          var modal = ' <div id="'+that.tabela_id+'_backdrop" class="modal-backdrop fade in" style="display:none;">'+
                                        ' </div>'+
                                        ' <div class="modal fade modal-Teste master-modal-lg in" id="'+that.tabela_id+'_modal" role="dialog" data-keyboard="false" data-backdrop="static">'+
                                            ' <div class="modal-dialog modal-lg" style="min-width: 300px;" role="document">'+
                                            ' <form class="form-inline ng-pristine ng-invalid ng-invalid-required">'+
                                                ' <div class="modal-content">'+
                                                    ' <div class="modal-header">'+				
                                                        ' <div class="modal-header-left">'+					
                                                            ' <h4 class="modal-title">'+
                                                                'Colunas Visíveis'+
                                                            ' </h4>'+
                                                        ' </div>'+				
                                                        ' <div class="modal-header-center">'+				
                                                        ' </div>'+				
                                                        ' <div class="modal-header-right">'+					
                                                            ' <button type="button" class="btn btn-primary btn-toggle-acoes-modal">'+
                                                                ' <span class="glyphicon glyphicon-option-vertical">'+' </span>'+
                                                            ' </button>'+
                                                            ' <div class="acoes-modal">'+						
                                                                ' <button ng-click="'+that.model+'.setStandard()" type="button" class="btn btn-info" data-hotkey="alt+r">'+
                                                                    ' <span class="glyphicon glyphicon-refresh">'+' </span>'+'&nbsp;'+'Padrão'+
                                                                ' </button>'+ 						
                                                               ' <button ng-click="'+that.model+'.setPersistentVisible()" type="button" class="btn btn-success" data-hotkey="f1">'+
                                                                    ' <span class="glyphicon glyphicon-ok">'+' </span>'+'&nbsp;'+'Gravar'+
                                                                ' </button>'+
                                                                ' <button ng-click="'+that.model+'.closeModalOPT()" type="button" class="btn btn-default btn-fechar-modal btn-voltar" data-hotkey="esc">'+
                                                                    ' <span class="glyphicon glyphicon-chevron-left">'+' </span>'+'&nbsp;'+'Voltar'+
                                                                ' </button>'+
                                                            ' </div>'+
                                                        ' </div>'+
                                                    ' </div>'+
                                                ' <div class="modal-body">'+
                                                    ' <div style="height: calc(var(--screen-height) - 600px); min-height: 340px;">'+
                                                        ' <div class="row" style="height: 100%;">'+
                                                                ' <div class="table-ec table-scroll" style="">'+
                                                                ' <table style="width: calc(100% - 2px) !important;" class="table table-striped table-bordered table-condensed table-no-break table-middle table-low">'+
                                                                    ' <thead>'+
                                                                        ' <tr class="ng-isolate-scope">'+
                                                                            ' <th><input style="height: 23px; width: 22px; margin-left: calc(50% - 12px);" type="checkbox" ng-checked="'+that.model+'.check_list == true" ng-click="'+that.model+'.check_list = !'+that.model+'.check_list;'+that.model+'.setDefault();">'+
                                                                            ' </th>'+
                                                                            ' <th>Coluna</th>'+                                                                            
                                                                        ' </tr>'+
																' </thead>'+
																	' <tbody id="tabela_ordem">'+
																	' <tr class="tabela_ordem" id="{{ Campo.ORDEM }}" data-ordem="{{ Campo.ORDEM }}" draggable="{{'+that.model+'.REORDENAR == true}}" '+
																	' 	ng-repeat="Campo in '+that.model+'.COLUNAS | orderBy : \'ORDEM\' track by $index" tabindex="0">'+
                                                                        ' <td ng-if="Campo.ID_COLSPAN == undefined && (Campo.HIDDEN == false || Campo.HIDDEN == undefined)">'+
                                                                            ' <span>'+
                                                                                ' <input style="height: 23px; width: 22px; margin-left: calc(50% - 12px);" type="checkbox" ng-checked="Campo.CHECKED == \'1\'" ng-click="Campo.CHECKED = ('+that.model+'.setChangeCheck(Campo.CHECKED));'+that.model+'.setVisible();">'+
                                                                            ' </span>'+
                                                                        ' </td>'+
                                                                        ' <th ng-if="Campo.ID_COLSPAN == undefined && (Campo.HIDDEN == false || Campo.HIDDEN == undefined)">{{ Campo.DESC_COLUNA == undefined ? Campo.DESCRICAO : Campo.DESC_COLUNA }}</th>'+
                                                                        ' </td>'+
																	  ' </tr>'+
																	  ' </tbody>'+   
                                                                ' </table>'+
                                                            ' </div>'+
                                                        ' </div>'+
                                                    ' </div>'+
                                                ' </div>'+		
                                                ' </div>'+
                                            ' </form>'+
                                            ' </div>'+
										' </div>';

						return modal;
                    },
                    _modal : $('#'+obj.tabela_id+'_modal'),
                    focus  : function(){
                        //$(this._modal).find('input:focusable').first().select();
					},
                    show : function(shown,hidden) {
						var that = this.father;

						that.ModalOPT.compile();

						this._modal = $('#'+that.tabela_id+'_modal');
						
                        this._modal
                            .modal('show');
    
                        this._modal
                            .one('shown.bs.modal', function(){
	                           
                                /*if ( shown ) {
                                    shown();
								}*/
								if(that.COLUNAS_RESTAURADAS == true){
									that.EVENTOS_GERADOS = false;
									that.COLUNAS_RESTAURADAS = false;
								}

								that.OrderTabela();

                            });
        
                            this._modal
                                .one('hidden.bs.modal', function(){
                                    $rootScope.$apply(function(){
                                        if ( hidden ) {
                                            hidden();
                                        }
                                    });
                                });
                    },
                    hide : function(hidden) {
        
                        this._modal
                            .modal('hide');
        
                        if ( hidden ) {
                            this._modal
                                .one('hidden.bs.modal', function(){
                                    $rootScope.$apply(function(){
                                        hidden ? hidden() : '';
                                    });
                                });                      
                        }
                    }
				},
                openModalOPT : function(){
					var that = this;

					// cria backup das colunas antes de abrir o modal (para poder reverter se cancelar)
					that.setRestored();
					that.backup_check_list = that.check_list;
					that.ModalOPT.show();

					that.REORDENAR = true;

					// Sincroniza ORDEM com a posição do array (essencial para drag/drop correto)
					angular.forEach(that.COLUNAS, function(item, index){
						item.ORDEM = index + 1;
						item.ORDEM_TEMP = index + 1;
						item.CHECKED = item.VISIBLE == true ? 1 : 0;
					});
					
					that.bkp_colunas_edit = angular.copy(that.COLUNAS);
                    
				},
                excluirFiltroTabela : function(){
					var that = this;
					
                    that.FILTRO = '';
					that.TotalTabela();
                    
				},
				closeModalOPT : function(){
					var that = this;

					// Se houver backup (abertura do modal), restaurar antes de compilar
					if(that.backup_colunas && that.backup_colunas.length){
						that.COLUNAS = angular.copy(that.backup_colunas);
						that.backup_colunas = [];
						if(typeof that.backup_check_list !== 'undefined'){
							that.check_list = that.backup_check_list; 
							that.backup_check_list = undefined;
						}
					}

					that.ModalOPT.hide();
					if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'compilado' || that.tipo_tabela == 'normal'){
						that.compile(1);
					}
					//console.log('fechar modal opções');
				},
                aplicarOrdem : function(){
                    var that = this;
                    //that.REORDENAR = false;

                    // Sincroniza ORDEM com a posição no array
                    angular.forEach(that.COLUNAS, function(item, index){
                        item.ORDEM = index + 1;
                        item.ORDEM_TEMP = index + 1;
                    });

                },
                dragOrdem : function(e){
					var that = this;
					//console.log(e);
					//that.REORDENAR = false;
					if(that.REORDENAR){
						//console.log('fará algo');
						//console.log(that);
					}

				},
				recalcularOrdenColunas : function(){
					/**
					 * Recalcula a ordem das colunas baseado na posição no array
					 * Garante que ORDEM seja sequencial de 1 até a quantidade de colunas
					 * Útil após operações de dragdrop ou manipulação de array
					 */
					var that = this;
					angular.forEach(that.COLUNAS, function(item, index){
						item.ORDEM = index + 1;
						item.ORDEM_TEMP = index + 1;
					});
				},
                toggle_lista : function(e, item){
					var that  	= this;

					var element = e.currentTarget;

					var parentEl 	 	= $(element).parent();
					var b 				= parent.find('li:focusable');

					that.setDropdownPos(parentEl, item);
					that.setDropdownScrollListeners(element);

					if(b.length > 0){
						b.first().focus();
					}
				},
				setDropdownPos: function(parentEl, item){
					const that = this;

					const dados = that.DADOS_RENDER_FILTRADOS.length > 0 ? that.DADOS_RENDER_FILTRADOS : that.DADOS;

					if (dados.length <= 20) {
						// If the array length is less than or equal to 20, every element is between the first and last 10
						var primeirosCincoDados = dados.slice(0, 5);
						var ultimosCincoDados = dados.slice(-5);

						if (primeirosCincoDados.includes(item)) {

							parentEl.removeClass('dropup').prependClass('dropdown');
	
						}else if (ultimosCincoDados.includes(item)){
	
							parentEl.removeClass('dropdown').prependClass('dropup dropdown');
	
						} else {
	
							parentEl.removeClass('dropup').prependClass('dropdown');
	
						}
						// parentEl.removeClass('dropup').prependClass('dropdown');
						return true;
					}

					const firstTen = dados.slice(0, 10);
					const lastTen = dados.slice(-10);			
					
					if (firstTen.includes(item)) {

						parentEl.removeClass('dropup').prependClass('dropdown');

					}else if (lastTen.includes(item)){

						parentEl.removeClass('dropdown').prependClass('dropup dropdown');

					} else {

						parentEl.removeClass('dropup').prependClass('dropdown');

					}
				},
				setDropdownScrollListeners: function(element){
					var that = this;

					if(that.tabela_compilada){
						var removeOpenClass = function() {
							try {
								$(element).parent().removeClass('open');

								window.removeEventListener('scroll', removeOpenClass);

								$('.table-ec').off('scroll', removeOpenClass);
								$('.modal-body').off('scroll', removeOpenClass);
							} catch (error) {
								console.log(error);
							}
						};
					
						window.addEventListener('scroll', removeOpenClass);
						$('.table-ec').on('scroll', removeOpenClass);
						$('.modal-body').on('scroll', removeOpenClass);
					}
				},
                funcao_lista: function(event,dados,tabelinha){
					var that = this;
					//console.log(event);
					var campos = $(event.currentTarget);
					if(event.keyCode == 40){
						event.stopPropagation();
						event.preventDefault();
						var a = campos.nextAll('li[tabindex="0"]:visible').first();
						if(a.length > 0){
							a.focus();				
						}
					}else if(event.keyCode == 38){
						event.stopPropagation();
						event.preventDefault();
						var b = campos.prevAll('li[tabindex="0"]:visible').first();
						if(b.length > 0){
							b.focus();
						}else{							
							var filtro = $(that.componente).find('.filtro-input-dropdown').first();
							filtro.focus();							
						}
					}else if(event.keyCode == 27){
						$timeout(function(){
							var menu = $(event.currentTarget).closest('div.dropdown.acoes');
							if(menu.hasClass('open')){
								menu.removeClass('open');									
							}							
						},100,false);						
						$timeout(function(){
							var zeta = $(tabelinha).find('tr.selected');
							if(zeta.length > 0){
								zeta.first().focus();
							}
						},200,false);		
					}else if(event.keyCode == 13){
						$timeout(function(){
							var c = campos.find('a');
							if(c.length > 0){
								c.first().click()
							}
						},100,false);						
					}
                },
                cancelarOrdem : function(){
                    var that = this;
                    that.REORDENAR = false;

                    angular.forEach(that.COLUNAS,function(item, key){
                        item.ORDEM_TEMP = item.ORDEM;
					});
					
					if(that.total_visible){
						that.COLUNAS_BKP_TOTAIS = that.COLUNAS;					
						that.TotalTabela();
					}

                },
                clickOrdem : function(campo){
                    var that = this;
                    if( (that.REORDENAR) && !(campo.ORDEM_TEMP > 0) ){
                        that.CON_REORDENAR = that.CON_REORDENAR + 1;
                        campo.ORDEM_TEMP   = that.CON_REORDENAR;    
                    }
                },
                trocarOrdem : function(){
                    var that = this;
                    that.REORDENAR = true;
                    that.CON_REORDENAR = 0;

                    /*angular.forEach(that.COLUNAS,function(item, key){
                        item.ORDEM_TEMP = '';
                    });*/

                },
                setChangeCheck : function(check){
					var that = this;
					//console.log('função trocar check',check);
					if((parseInt(check)) == 1){
						check = 0;
						//console.log(check);
						return check;
					}else{
						check = 1;
						//console.log(check);
						return check;
					}
					
                },
				setVisibleLocalStorage: function(){
					if(that.localStorage_lite == true){

						var str_json1 = isEquivalentArray(that.COLUNAS, that.colunas_originais, [], ['CAMPO','ORDEM','VISIBLE']);
						
						localStorage.removeItem(''+that.ID+'');
						
						if(!str_json1){
							//localStorage.setItem(''+that.ID+'', JSON.stringify(that.COLUNAS));
							localStorageInsert(''+that.ID+'', that.COLUNAS);
						}

					}else{
						localStorage.removeItem(''+that.ID+'');
						//localStorage.setItem(''+that.ID+'', JSON.stringify(that.COLUNAS));
						localStorageInsert(''+that.ID+'', that.COLUNAS);
					}
				},
                setVisible : function(){
                    var that = this;
					
					angular.forEach(that.COLUNAS,function(item, key){
						item.VISIBLE = item.CHECKED == 1 ? true : false;                        
					});

					if(that.filtro_visible == true){
						that.campos_filtro = [];
						
						angular.forEach(that.COLUNAS, function(item, ref){
							if(item.VISIBLE){
								that.campos_filtro.push(item.CAMPO);
							}
						});
					}
					
                    if(that.REORDENAR){
                        that.aplicarOrdem();
                    }

                },
				filterObjectsByProps: function(arr, propsToKeep){
					return arr.map(obj => {

						const filteredObj = {};

						propsToKeep.forEach(prop => {
						  if (obj.hasOwnProperty(prop)) {
							filteredObj[prop] = obj[prop];
						  }
						});

						return filteredObj;

					});
				},
				getMenuControle: function(){
					var menu1 = $('#menu-controle').val();
					var menu2 = $('[name="_menu_controle"]').val();
					var menuControle = 0;

					if(menu1 > 0){
						menuControle = menu1;
					} else if(menu2 > 0){
						menuControle = menu2;
					}

					menuControle = Number(menuControle);
					menuControle = isNaN(menuControle) ? 0 : menuControle;
					
					return menuControle;
				},
				setPersistentVisible: function(){
					var that = this;

					if(!(typeof that.bkp_colunas_edit != 'undefined' && that.bkp_colunas_edit.length > 0)){
						that.bkp_colunas_edit = [];
					}

					var keepOpen = false;
					if (arguments.length > 0) {
						keepOpen = arguments[0] === true;
					}

					var menuControle = that.getMenuControle();
					var modificados  = [];

					that.COLUNAS.forEach(function(coluna_a){
						that.bkp_colunas_edit.forEach(function(coluna_b){
							if(
								(coluna_a.CAMPO == coluna_b.CAMPO && coluna_a.CAMPO_FILTRO == coluna_b.CAMPO_FILTRO) &&
								(coluna_a.ORDEM != coluna_b.ORDEM || coluna_a.VISIBLE != coluna_b.VISIBLE)
							){
								modificados.push(coluna_a);
							}
						});
					});

					let dados = {
						ITENS_MARCADOS		: that.filterObjectsByProps(modificados, ['DESCRICAO', 'CHECKED', 'VISIBLE', 'CAMPO', 'CAMPO_FILTRO', 'CHAVE_COLUNA', 'ORDEM']),
						TABELA_ID			: that.ID,
						TIPO_PLATAFORMA		: that.isMobileDevice() ? 1 : 0,
						MENU_CONTROLE		: menuControle,
					};

					let url = urlhost + '/api/controleTabela/gravarColunasVisiveis';

					return new Promise(function(resolve, reject){

						if(modificados.length > 0){

							$ajax.post(url, dados).then(function(response) {

								var colunas = []; //angular.copy(that.COLUNAS);

								if(response?.DATA_RETURN && response.DATA_RETURN.length > 0){
									colunas = response?.DATA_RETURN;
								}

								try {
									if(colunas.length > 0){
										$timeout(function(){
											$rootScope.$apply(function(){

												colunas = normalizarColunasSalvas(colunas);
												if(colunas && colunas.length > 0){
													that.COLUNAS = aplicarColunasSalvas(that.COLUNAS, colunas);
													atualizarCacheColunasVisiveis(that.ID, colunas, dados.MENU_CONTROLE);
												}

												// após salvar persistente, limpar backup para que o fechar não reverta as alterações
												that.backup_colunas = [];
												that.bkp_colunas_edit = [];
												that.backup_check_list = undefined;

												if (!keepOpen) {
													that.closeModalOPT();
												}
												
												resolve(response);
											});
										},100);
									}
								} catch (error) {
									resolve(response);
								}
								
							}, (xhr) => {
								reject(xhr);
							});
						
						} else {
							// após salvar persistente, limpar backup para que o fechar não reverta as alterações
							that.backup_colunas = [];
							that.bkp_colunas_edit = [];
							that.backup_check_list = undefined;

							if (!keepOpen) {
								that.closeModalOPT();
							}
							resolve(that.COLUNAS);
						}
					});
				},
				getPersistentVisible: function(){
					var that = this;

					return new Promise(function(resolve, reject) {
						resolve([]);
					});
					
				},
				setCacheColunasVisiveis: function(colunas){
					var that = this;

					if(typeof colunas === 'undefined'){
						colunas = that.COLUNAS;
					}

					var cache = null;//localStorage.getItem(that.ID);

					if(cache !== null){

						var json_cache = JSON.parse(cache);

						var check_cache = areArraysOfObjectsEqual(colunas, json_cache);

						if(!check_cache){

							// var dados = {
							// 	COLUNAS_VISIVEIS: 	colunas,
							// 	USUARIO_ID: 		Number($('#usuario-id').val())
							// }

							//localStorage.setItem(that.ID, JSON.stringify(colunas));

						}

					} else {

						// var dados = {
						// 	COLUNAS_VISIVEIS: 	colunas,
						// 	USUARIO_ID: 		Number($('#usuario-id').val())
						// }

						//localStorage.setItem(that.ID, JSON.stringify(colunas));

					}
				},
                setDefault : function(){
                    var that = this;
                    angular.forEach(that.COLUNAS,function(item, key){
                        item.CHECKED = that.check_list;
					});
					
					that.setVisible();
                
				},
				setRestored	: function(){
					var that = this;
					//console.log(that);
					//console.log(that.COLUNAS);
					//console.log(that.backup_colunas);
					that.backup_colunas = angular.copy(that.COLUNAS);
					//console.log(that.COLUNAS);
					//console.log(that.backup_colunas);				

				},
				setStandard : function(){
					var that = this;
                    
					addConfirme('<h4>Restaurar</h4>',
						'Deseja realmente restaurar as colunas da tabela atual para a visualização padrão?',
						[obtn_sim,obtn_nao],
						[{ret:1,func:function(){
							$rootScope.$apply(function(){

								that.closeModalOPT();
								that.clearCache();
								
								
							});
						}}]     
					);
				},
                onMarcar : function(){

                },
				MarcarItensPerc: function(){
                    var that = this;

					that.TIPO_MARCAR_ITEM   = 1;
					that.QTD_MARCAR_ITEM    = 1;
					that.QTD_PULAR_ITEM     = 1;
					that.PAGINA_MARCAR_ITEM = 1;

					that.DesmarcarItens();

					var prop1 = trim_null((''+that.campo_model).replace('item.',''));

					if(typeof that.Confirme == 'undefined'){
						that.Confirme = that.Confirmacao.getNew(that.model+'.Confirme');
					}
					
					that.Confirme.add(1, '<h4>Selecione a Configuração</h4>', 
					`
						<div class="form-group">
							<label>Tipo de Marcação:</label>
							<div class="input-group">
								<select ng-model="`+that.model+`.TIPO_MARCAR_ITEM">
									<option ng-value="1">1 - Páginas</option>
									<option ng-value="2">2 - Intercalar</option>
								</select>
							</div>
						</div> 

						<div class="form-group" ng-if="`+that.model+`.TIPO_MARCAR_ITEM == 1">
							<label>Página:</label>
							<input type="number" class="form-control normalcase input-menor" ng-model="`+that.model+`.PAGINA_MARCAR_ITEM">
						</div>

						<div class="form-group" ng-if="`+that.model+`.TIPO_MARCAR_ITEM == 1">
							<label>Quantidade:</label>
							<input type="number" class="form-control normalcase input-menor" ng-model="`+that.model+`.QTD_MARCAR_ITEM">
						</div>

						<div class="form-group" ng-if="`+that.model+`.TIPO_MARCAR_ITEM == 2">
							<label>Qtd. Marcar:</label>
							<input type="number" class="form-control normalcase input-menor" ng-model="`+that.model+`.QTD_MARCAR_ITEM">
						</div>

						<div class="form-group" ng-if="`+that.model+`.TIPO_MARCAR_ITEM == 2">
							<label>Qtd. Pular:</label>
							<input type="number" class="form-control normalcase input-menor" ng-model="`+that.model+`.QTD_PULAR_ITEM">
						</div>

					`, [
						{desc:'Marcar',		class:'btn-success',	ret:'1',	hotkey:'f1',	glyphicon:'glyphicon glyphicon-ok'			},
						{desc:'Cancelar',	class:'btn-danger',		ret:'2',	hotkey:'esc',	glyphicon:'glyphicon glyphicon-ban-circle'	},
					], [
						function(e, btn) {
							if(that.TIPO_MARCAR_ITEM > 0){
								if(that.TIPO_MARCAR_ITEM == 1){

									if(that.filtro_visible == false){
										var pagina_atual = 0;

										for(var a = 0; a < that.DADOS.length; a++){
											var item = that.DADOS[a];
											
											pagina_atual = Math.trunc(a/that.QTD_MARCAR_ITEM) + 1;

											if(pagina_atual == that.PAGINA_MARCAR_ITEM){
												item[prop1] = that.validarMarcarItem(item);
											}
										}

									}else if(that.filtro_visible == true){
										var pagina_atual = 0;

										for(var a = 0; a < that.DADOS_RENDER.length; a++){
											var item = that.DADOS_RENDER[a];
											
											pagina_atual = Math.trunc(a/that.QTD_MARCAR_ITEM) + 1;

											if(pagina_atual == that.PAGINA_MARCAR_ITEM){
												item[prop1] = that.validarMarcarItem(item);
											}
										}
									}

								}else{
									if(that.filtro_visible == false){
										var qtd_carcar = 0;
										var qtd_pular  = 0;
										var marcando = true;

										for(var a = 0; a < that.DADOS.length; a++){
											var item = that.DADOS[a];

											if(marcando && qtd_carcar < that.QTD_MARCAR_ITEM){
												item[prop1] = that.validarMarcarItem(item);
												qtd_carcar++;

												if(qtd_carcar >= that.QTD_MARCAR_ITEM){
													qtd_carcar = 0;
													marcando = false;
												}
											}else{
												qtd_pular++;
												if(qtd_pular >= that.QTD_PULAR_ITEM){
													qtd_pular = 0;
													marcando = true;
												}
											}
										}

									}else if(that.filtro_visible == true){
										var qtd_carcar = 0;
										var qtd_pular  = 0;
										var marcando   = true;

										for(var a = 0; a < that.DADOS_RENDER.length; a++){
											var item = that.DADOS_RENDER[a];
											
											pagina_atual = Math.trunc(a/that.QTD_MARCAR_ITEM) + 1;

											if(marcando && qtd_carcar < that.QTD_MARCAR_ITEM){
												item[prop1] = that.validarMarcarItem(item);
												qtd_carcar++;

												if(qtd_carcar >= that.QTD_MARCAR_ITEM){
													qtd_carcar = 0;
													marcando = false;
												}
											}else{
												qtd_pular++;
												if(qtd_pular >= that.QTD_PULAR_ITEM){
													qtd_pular = 0;
													marcando = true;
												}
											}
										}
									}
								}
										
								angular.forEach(that, function(item,key){
									if(((''+item).trim()) == that.campo_verific){
										that.model_tabela[that.campo_verific] = true;
									}
								});
			
								that.count_marcados();
								that.onMarcar();
							}
						},
						function(e, btn) {

						}
					]);

				},
                MarcarItens : function(){
                    var that = this;
					//console.log(that);
					//Função para marcar todas as linhas
					// var prop1 = trim_null((''+that.campo_model).replace('item.',''));
					// angular.forEach(that.DADOS, function(item, key){
					// 	//item.CHECKED = true;
					// 	item[prop1] = true;
					// });
					var prop1 = trim_null((''+that.campo_model).replace('item.',''));
					if(that.filtro_visible == false){
						for(var a = 0; a < that.DADOS.length; a++){
							var item = that.DADOS[a];
							
							item[prop1] = that.validarMarcarItem(item);
						}
						angular.forEach(that, function(item,key){
							if(((''+item).trim()) == that.campo_verific){
								that.model_tabela[that.campo_verific] = true;
							}
						});

						that.linhas_marcadas = true;
						that.count_marcados();
						that.onMarcar();
					}else if(that.filtro_visible == true){
						//that.Time3 = $timeout(function(){
							for(var a = 0; a < that.DADOS_RENDER.length; a++){
								var item = that.DADOS_RENDER[a];
								item[prop1] = that.validarMarcarItem(item);
							}
							
							angular.forEach(that, function(item,key){
								if(((''+item).trim()) == that.campo_verific){
									that.model_tabela[that.campo_verific] = true;
								}
							});

							that.linhas_marcadas = true;
							that.count_marcados();
							that.onMarcar();
						//	$timeout.cancel(that.Time3);
						//},300)
					}
					
					if(typeof that.onMarcarTodos != 'undefined'){
						that.onMarcarTodos();
					}

				},
                DesmarcarItens : function(){
                    var that = this;
					//console.log(that);
					//Função para desmarcar todas as linhas
					// var prop1 = trim_null((''+that.campo_model).replace('item.',''));
					// angular.forEach(that.DADOS, function(item, key){
					// 	//item.CHECKED = false;
					// 	item[prop1] = true;
					// });
					var prop1 = trim_null((''+that.campo_model).replace('item.',''));
					if(that.filtro_visible == false){
						for(var a = 0; a < that.DADOS.length; a++){
							var item = that.DADOS[a];
							item[prop1] = false;
						}

						angular.forEach(that, function(item,key){
							if(((''+item).trim()) == that.campo_verific){
								that.model_tabela[that.campo_verific] = false;
							}
						});

						that.linhas_marcadas = false;
						that.count_marcados();
						that.onMarcar();
					}else if(that.filtro_visible == true){
						//that.Time4 = $timeout(function(){
							for(var a = 0; a < that.DADOS_RENDER.length; a++){
								var item = that.DADOS_RENDER[a];
								item[prop1] = false;
							}	
							
						//	$timeout.cancel(that.Time4);
						//},300)
						
						angular.forEach(that, function(item,key){
							if(((''+item).trim()) == that.campo_verific){
								that.model_tabela[that.campo_verific] = false;
							}
						});

						that.linhas_marcadas = false;
						that.count_marcados();
						that.onMarcar();
					}

					if(typeof that.PaiTab != 'undefined'){
						that.PaiTab.BACKUP_ITENS_MARCADOS = [];
					}

					if(typeof that.onDesmarcarTodos != 'undefined'){
						that.onDesmarcarTodos();
					}

				},
                Resize : function(event){
					//Função para redimensionar colunas
					var that = this;					
					that.start_x = event.pageX;
					that.start_width = event.currentTarget.clientWidth;
					that.col_pressed = true;
				},
				ResizeMove : function(event){
					//Função para redimensionar colunas segurando click
					var that = this;
					if(that.col_pressed){
						event.currentTarget.width = ((that.start_width+((event.pageX) - (that.start_x))) + ('px'));
					}
				},
				ResizeUp : function(event){
					//Função para parar o redimensionamento após soltar o click
					var that = this;
					that.col_pressed = false;
					if(that.col_pressed){
						that.col_pressed = false;
					}
				},
				getCampo: function(nivel, col, campo){
					var that = this;
					var html = '';
					var item = 'item'
					var class1 = '';
					var class2 = '';
					if(nivel != 0){
						item = item+'_'+nivel;
					}

					if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado'){
						class1 = '';
						class2 = 'no-print';
					}else if( that.tipo_tabela == 'accordion'){
						class1 = 'no-print';
						class2 = '';
					}

					if(campo.TIPO == 'btn3'){
						html += that.montarMenuBtn3(item, col);
					}

					if(campo.TIPO == 'btn2'){
						html = html +' <div class="form-group no-print" style="margin-bottom: -2px; margin-top: -8px; display: contents;"> '+
							'					<button type="button" ng-repeat="Botao in '+col+'.BTN2 track by $index" class="btn btn-sm {{ Botao.type }} {{ Botao.class }}" '+
							'						style="margin-left: 6px; {{ Botao.xstyle !== undefined ? Botao.xstyle : \'\' }}" '+										
							'						ng-click="Botao.funcao($event, '+item+'); $event.stopPropagation();" '+
							'						ng-attr-ttitle="{{Botao.ttitle !== undefined ? Botao.ttitle : \'\'}}"'+
							'						ng-attr-title="{{Botao.title !== undefined ? Botao.title : \'\'}}"'+
							'						ng-disabled="Botao.disabled('+item+')" '+
							'                   	ng-readonly="Botao.readonly('+item+')" '+
							'                   	ng-show="Botao.visible('+item+')"> '+
							'						<span class="{{Botao.icone}}"></span> '+
							'						{{ Botao.label }} '+
							' 					</button> '+
							'				</div> ';
					}

					if(campo.TIPO == 'btn4'){
						html = html +' <div class="form-group no-print" style="margin-bottom: -2px; margin-top: -8px; display: contents;"> '+
							'					<button type="button" ng-repeat="Botao in '+col+'.BTN4 track by $index" class="btn btn-sm" ng-class="Botao.class('+item+')"'+
							'						style="margin-left: 6px;" '+								
							'						ng-click="Botao.funcao($event, '+item+'); $event.stopPropagation();" '+
							'						ng-disabled="Botao.disabled('+item+')" '+
							'                   	ng-readonly="Botao.readonly('+item+')" '+
							'                   	ng-show="Botao.visible('+item+')" ttitle="{{Botao.ttitle('+item+')}}"> '+
							'						<span ng-class="Botao.icone('+item+')" ng-bind="Botao.label('+item+')"></span> '+
							' 					</button> '+
							'				</div> ';
					}

					if(campo.TIPO == 'btn'){
						html = html + '<div class="form-group no-print" style="margin-bottom: -2px; margin-top: -8px; display: contents;"> '+
									'			<button type="button" class="btn btn-sm {{ '+col+'.BTN.type }} {{ '+col+'.BTN.class }}" '+
									'			 ng-click="'+col+'.BTN.funcao($event, '+item+'); $event.stopPropagation();" '+
									'			 ng-disabled="'+col+'.BTN.disabled('+item+')" '+
									'                  ng-readonly="'+col+'.BTN.readonly('+item+')" '+
									'                   ng-show="'+col+'.BTN.visible('+item+')"> '+
									'					<span class="{{'+col+'.BTN.icone}}"></span> '+
									'					{{ '+col+'.CAMPO }} '+
									' 					</button> '+
									'			</div> ';		
					}

					if(campo.TIPO == 'btn-danger'){
						html = html +'	<div class="form-group no-print"> '+
									'		<button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
									'			ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
									'			ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
									'			<span class="glyphicon glyphicon-trash"></span> '+
									'		{{ '+col+'.CAMPO }} '+
									' 		</button> '+
									'	</div> ';
					}
						
					if(campo.TIPO == 'btn-primary'){
						html = html +'	<div class="form-group no-print"> '+
									'	 <button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
									'		ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
									'		ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
									'	 <span class="glyphicon glyphicon-edit"></span> '+
									'	{{ '+col+'.CAMPO }} '+
									' 	 </button> '+
									'	</div> ';
					}
					
					if(campo.TIPO == 'btn-success'){
						html = html +' <div class="form-group no-print"> '+
									'			<button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
									'				ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
									'				ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
									'				<span class="glyphicon glyphicon-ok"></span> '+
									'			{{ '+col+'.CAMPO }} '+
									' 			</button> '+
									'		</div> ';
					}
						
					if(campo.TIPO == 'btn-warning'){
						html = html +' <div class="form-group no-print"> '+
									'		<button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
									'			ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
									'			ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
									'			<span class="glyphicon glyphicon-print"></span> '+
									'			{{ '+col+'.CAMPO }} '+
									' 			</button> '+
									'	</div> ';
					}
						
					if(campo.TIPO == 'btn-info'){
						html = html +' <div class="form-group no-print"> '+
									'	 	<button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
									'	 		ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
									'			ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
									'			<span class="glyphicon glyphicon-ok"></span> '+
									'		{{ '+col+'.CAMPO }} '+
									' 		</button> '+
									'	</div> ';
					}
						
					if(campo.TIPO == 'cor-grd'){
						html = html +' <div ng-mouseover="'+that.model+'.ZoominItem($event);" ng-mouseleave="'+that.model+'.ZoomoutItem($event);" '+
									'		style="padding: 12px; border-radius: 3px; box-shadow: 0 1px 3px #646464; transform-origin: left top; transition: .5s 0s; position: inherit; cursor: zoom-in; {{'+that.model+'.gerar_gradiente('+item+'['+col+'.CAMPO]) }};"> '+
									'	</div> ';
					}
						
					if(campo.TIPO == 'cor'){
						html = html +' <div ng-mouseover="'+that.model+'.ZoominItem($event);" ng-mouseleave="'+that.model+'.ZoomoutItem($event);" '+
									'		 style="padding: 12px; border-radius: 3px; box-shadow: 0 1px 3px #646464; transform-origin: left top; transition: .5s 0s; position: inherit; cursor: zoom-in; background-color: {{ '+item+'['+col+'.CAMPO] }};"> '+
									' </div> ';
					}
					
					if(campo.TIPO == 'html'){
						html = html +' <div ng-bind-html="'+that.model+'.GeraHtml('+col+'.HTML.funcao('+item+'));"> </div> ';
					}

					if(campo.TIPO == 'htmlcp'){
						html = html +' <div> </div> ';
					}
					
					if(campo.TIPO == 'status2'){
						html = html +'  <div style="text-align: -webkit-center;"> <span class="t-status status2-{{ '+item+'['+col+'.CAMPO] }}"></span> </div> ';
					}
						
					if(campo.TIPO == 'status'){
						html = html +' <div style="text-align: -webkit-center;"> <span class="t-status status-{{ '+item+'['+col+'.CAMPO] }}"></span> </div>'
					}
						
					if(campo.TIPO == 'link'){
						html = html +' <a  href="" target=”_blank” ng-click="'+that.model_selected+'.SELECTED = '+item+';'+that.model+'.open_link('+col+'.LINK,'+col+'.LINK_PARAM,'+item+');$event.stopPropagation();" rel=”noopener noreferrer”>{{ '+that.model+'.format('+item+'['+col+'.CAMPO],'+col+','+item+') }}</a>	';
					}

					if(campo.TIPO == 'imput_number'){
						html = html +'<input ng-number-format="'+col+'.NUMBER_FORMAT" ng-blur="'+col+'.EVENT_BLUR.funcao('+item+', $event);"" ng-click="$event.stopPropagation();" type="text" ng-min="'+col+'.MIN" ng-max="'+col+'.MAX" class="item_edit_tab text-right" ng-model="'+item+'['+col+'.CAMPO]" ng-focus="'+that.model+'.SELECTED = item" style=" padding: 5px; height: 25px; width: 40%; margin-top: -3px;">';
					}

					return html;					
				},
				remove_focus_submenu: function(isSubmenu){
					if(isSubmenu){
						$('.__dropdown__submenu').removeClass('focusable');
					}
				},
				normalizarMenuBtn3: function(botoes){
					angular.forEach(botoes || [], function(botao){
						var menuDrop = botao.menu_drop || {};
						var itensMenu = [];
						var numeroOpcao = 0;

						function adicionarCabecalho(descricao){
							if(trim_null(descricao) != ''){
								itensMenu.push({
									_MENU_TIPO: 'CABECALHO',
									desc: descricao
								});
							}
						}

						function adicionarOpcoes(opcoes){
							angular.forEach(opcoes || [], function(opcao){
								numeroOpcao++;
								opcao._MENU_TIPO = 'OPCAO';
								opcao._MENU_NUMERO = numeroOpcao;
								itensMenu.push(opcao);
							});
						}

						if(angular.isArray(menuDrop.GRUPOS) && menuDrop.GRUPOS.length > 0){
							angular.forEach(menuDrop.GRUPOS, function(grupo){
								adicionarCabecalho(grupo.DESC);
								adicionarOpcoes(grupo.OPCAO);
							});
						}else{
							adicionarCabecalho(menuDrop.DESC);
							adicionarOpcoes(menuDrop.OPCAO);
						}

						menuDrop.ITENS_MENU = itensMenu;
					});
				},
				montarMenuBtn3: function(item, col){
					var that = this;
					var html = '';

					html += `
						<div class="form-group no-print" style="display: contents;">
							<div class="dropdown acoes no-print" ng-repeat="Botao in ${col}.BTN3 track by $index">
								<button type="button" ng-attr-data-hotkey="{{${that.model_selected}.SELECTED == item && (${col}.BTN3[$index].menu_drop.ITENS_MENU != undefined) && item.btn3_atalho == true ? 'alt+l' : ''}}" 
									class="btn btn-sm {{ Botao.type }} {{ Botao.class }}" 
									style="margin-left: 6px;" 
									ng-attr-title="{{Botao.title !== undefined ? Botao.title : ''}}" 
									data-toggle="dropdown" aria-expanded="false" 
									ng-click="Botao.funcao($event, ${item}); $event.stopPropagation(); ${that.model}.toggle_lista($event, item);" 
									ng-disabled="Botao.disabled(${item})" ng-readonly="Botao.readonly(${item})"
									ng-show="Botao.visible(${item})">
									<span class="{{Botao.icone}}"></span> {{ Botao.label }}
								</button>
								<ul ordem="{{ ${col}.ORDEM }}" class="dropdown-menu {{ ${col}.ORDEM == 0 || ${col}.ORDEM == 1 || ${col}.ORDEM == 2 || ${col}.ORDEM == '00' || ${col}.ORDEM == '01' || ${col}.ORDEM == '02' ? 'dropdown-menu-left' : 'dropdown-menu-right' }} multi-level">

									<li ng-if="opt._MENU_TIPO == 'CABECALHO' || ((opt.visible == undefined) || (opt.visible(${item})))" 
										ng-repeat="(opt_key, opt) in ${col}.BTN3[$index].menu_drop.ITENS_MENU track by $index" 
										ng-attr-tabindex="{{opt._MENU_TIPO == 'OPCAO' ? '0' : undefined}}" 
										ng-keydown="${that.model}.funcao_lista($event, ${item}, '${that.componente}'); $event.stopPropagation();" 
										ng-focus="opt.focused = true;" 
										ng-blur="opt.focused = false;" 
										ng-class="{ 'dropdown-header' : opt._MENU_TIPO == 'CABECALHO', 'focusable' : opt.focused == true, '__dropdown__submenu' : opt.submenu == true }">

										<span ng-if="opt._MENU_TIPO == 'CABECALHO'" style="text-transform: initial; font-weight: bold;">{{ opt.desc }}</span>

										<a ng-if="opt._MENU_TIPO == 'OPCAO' && !opt.submenu" 
											ng-click="opt.funcao($event, ${item}); $event.stopPropagation();" 
											target="_blank" 
											style="text-transform: initial; cursor: pointer;">
											<span class="{{opt.icon}}"></span> {{('0'+opt._MENU_NUMERO).slice(-2)}} - {{opt.desc}}
										</a>

										<a ng-if="opt._MENU_TIPO == 'OPCAO' && opt.submenu" href="javascript:void(0)" 
											class="dropdown-toggle" 
											data-toggle="dropdown" 
											role="button" 
											aria-haspopup="true" 
											aria-expanded="false"
											style="text-transform: initial; cursor: pointer;">

											<i class="fa fa-caret-left {{ (opt.submenu) && (${col}.ORDEM >= 3) ? '' : 'hide' }}"></i>

											<span class="{{opt.icon}}"></span> {{('0'+opt._MENU_NUMERO).slice(-2)}} - {{opt.desc}}

											<ul class="dropdown-menu {{ ${col}.ORDEM == 1 || ${col}.ORDEM == 2 ? '__dropdown__submenu__left' : '__dropdown__submenu__right' }} multi-level">

												<li ng-if="(subopt.visible == undefined) || (subopt.visible(${item}))" 
													ng-repeat="(subopt_key, subopt) in opt.submenu_options track by $index" 
													tabIndex="0" 
													ng-keydown="${that.model}.funcao_lista($event, ${item}, '${that.componente}'); $event.stopPropagation();" 
													ng-focus="subopt.focused = true;" 
													ng-blur="subopt.focused = false;" 
													ng-class="{ 'focusable' : subopt.focused == true, '___dropdown___submenu' : subopt.submenu == true }">

													<a ng-if="!subopt.submenu" ng-click="subopt.funcao($event, ${item}); $event.stopPropagation(); ${that.model}.remove_focus_submenu(opt.submenu);" 
														target="_blank" 
														style="text-transform: initial; cursor: pointer;">
													<span class="{{subopt.icon}}"></span> {{ ('0' + opt._MENU_NUMERO).slice(-2) + '.' + (subopt_key+1) }} - {{ subopt.desc }}
													</a>

													<a ng-if="subopt.submenu" href="javascript:void(0)" 
														class="dropdown-toggle" 
														data-toggle="dropdown" 
														role="button" 
														aria-haspopup="true" 
														aria-expanded="false"
														style="text-transform: initial; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
														
														<div style="display: flex; flex-direction: row; justify-content: center; align-items: flex-start; gap: 5px;">
															<i class="fa fa-caret-left {{ (subopt.submenu) && (${col}.ORDEM >= 3) ? '' : 'hide' }}"></i>

															<span class="{{subopt.icon}}"></span> {{ (' '+'0' + (opt_key+1)).slice(-2) + '.' + (subopt_key+1) }} - {{ subopt.desc }}

														</div>
														
														<i class="fa fa-caret-right {{ (opt.submenu) && (${col}.ORDEM == 1 || ${col}.ORDEM == 2) ? '' : 'hide' }}"></i>

														<ul class="dropdown-menu {{ ${col}.ORDEM == 1 || ${col}.ORDEM == 2 ? '___dropdown___submenu___left' : '___dropdown___submenu___right' }}">
															
															<li ng-repeat="(subopt_lv_key, subopt_lv) in subopt.submenu_options track by $index"
																ng-if="(subopt_lv.visible == undefined) || (subopt_lv.visible(${item}))">

																<a ng-click="subopt_lv.funcao($event, ${item}); $event.stopPropagation(); ${that.model}.remove_focus_submenu(opt.submenu);" 
																	target="_blank" 
																	style="text-transform: initial; cursor: pointer;">
																	<span class="{{subopt_lv.icon}}"></span> {{ ('0' + opt._MENU_NUMERO).slice(-2) + '.' + (subopt_key+1) + '.' + (subopt_lv_key+1) }} - {{ subopt_lv.desc }}
																</a>
																
															</li>
														
														</ul>
													
													</a>

												</li>

											</ul>

											<i class="fa fa-caret-right {{ (opt.submenu) && (${col}.ORDEM == 1 || ${col}.ORDEM == 2) ? '' : 'hide' }}"></i>

										</a>

									</li>

								</ul>
							</div>
						</div>
					`;

					return html;
				},
				getCampoCP: function(col, coluna, nivel){
					var that = this;
					var html = '';
					var item = 'item'
					var class1 = '';
					var class2 = '';
					if(nivel != 0){
						item = item+'_'+nivel;
					}

					if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado'){
						class1 = '';
						class2 = 'no-print';
					}else if( that.tipo_tabela == 'accordion'){
						class1 = 'no-print';
						class2 = '';
					}

					switch (coluna.TIPO) {
						case 'btn3':
							that.normalizarMenuBtn3(coluna.BTN3);
							html += that.montarMenuBtn3(item, col);
							break;

						case 'btn2':
							html = html +' <div class="form-group no-print" style="margin-bottom: -2px; margin-top: -8px; display: contents;"> '+
								'					<button type="button" ng-repeat="Botao in '+col+'.BTN2 track by $index" class="btn btn-sm {{ Botao.type }} {{ Botao.class }}" '+
								'						style="margin-left: 6px; {{ Botao.xstyle !== undefined ? Botao.xstyle : \'\' }}" '+											
								'						ng-click="Botao.funcao($event, '+item+'); $event.stopPropagation();" '+
								'						ng-attr-ttitle="{{Botao.ttitle !== undefined ? Botao.ttitle : \'\'}}"'+
								'						ng-attr-title="{{Botao.title !== undefined ? Botao.title : \'\'}}"'+
								'						ng-disabled="Botao.disabled('+item+')" '+
								'                   	ng-readonly="Botao.readonly('+item+')" '+
								'                   	ng-show="Botao.visible('+item+')"> '+
								'						<span class="{{Botao.icone}}"></span> '+
								'						{{ Botao.label }} '+
								' 					</button> '+
								'				</div> ';
							break;
						
						case 'btn4':
							html = html +' <div class="form-group no-print" style="margin-bottom: -2px; margin-top: -8px; display: contents;"> '+
							'					<button type="button" ng-repeat="Botao in '+col+'.BTN4 track by $index" class="btn btn-sm" ng-class="Botao.class('+item+')"'+
							'						style="margin-left: 6px;" '+								
							'						ng-click="Botao.funcao($event, '+item+'); $event.stopPropagation();" '+
							'						ng-disabled="Botao.disabled('+item+')" '+
							'                   	ng-readonly="Botao.readonly('+item+')" '+
							'                   	ng-show="Botao.visible('+item+')" ttitle="{{Botao.ttitle('+item+')}}"> '+
							'						<span ng-class="Botao.icone('+item+')" ng-bind="Botao.label('+item+')"></span> '+
							' 					</button> '+
							'				</div> ';
							break;

						case 'btn':
							html = html + '<div class="form-group no-print" style="margin-bottom: -2px; margin-top: -8px; display: contents;"> '+
							'			<button type="button" class="btn btn-sm {{ '+col+'.BTN.type }} {{ '+col+'.BTN.class }}" '+
							'			 ng-click="'+col+'.BTN.funcao($event, '+item+'); $event.stopPropagation();" '+
							'			 ng-disabled="'+col+'.BTN.disabled('+item+')" '+
							'                  ng-readonly="'+col+'.BTN.readonly('+item+')" '+
							'                   ng-show="'+col+'.BTN.visible('+item+')"> '+
							'					<span class="{{'+col+'.BTN.icone}}"></span> '+
							'					{{ '+col+'.CAMPO }} '+
							' 					</button> '+
							'			</div> ';		
							break;
						
						case 'btn-danger':
							html = html +'	<div class="form-group no-print"> '+
							'		<button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
							'			ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
							'			ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
							'			<span class="glyphicon glyphicon-trash"></span> '+
							'		{{ '+col+'.CAMPO }} '+
							' 		</button> '+
							'	</div> ';
							break;
						
						case 'btn-primary':
							html = html +'	<div class="form-group no-print"> '+
							'	 <button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
							'		ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
							'		ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
							'	 <span class="glyphicon glyphicon-edit"></span> '+
							'	{{ '+col+'.CAMPO }} '+
							' 	 </button> '+
							'	</div> ';
							break;
						
						case 'btn-success':
							html = html +' <div class="form-group no-print"> '+
							'			<button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
							'				ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
							'				ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
							'				<span class="glyphicon glyphicon-ok"></span> '+
							'			{{ '+col+'.CAMPO }} '+
							' 			</button> '+
							'		</div> ';
							break;
						
						case 'btn-warning':
							html = html +' <div class="form-group no-print"> '+
							'		<button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
							'			ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
							'			ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
							'			<span class="glyphicon glyphicon-print"></span> '+
							'			{{ '+col+'.CAMPO }} '+
							' 			</button> '+
							'	</div> ';
							break;
						
						case 'btn-info':
							html = html +' <div class="form-group no-print"> '+
							'	 	<button type="button" class="btn btn-sm {{ '+col+'.TIPO }}" '+
							'	 		ng-click="'+that.model_selected+'.parametro == true ? '+that.model_selected+'.funcao_botao('+item+') : '+that.model_selected+'.funcao_botao() " '+
							'			ng-disabled="'+that.model_selected+'.desabilitado == true"> '+
							'			<span class="glyphicon glyphicon-ok"></span> '+
							'		{{ '+col+'.CAMPO }} '+
							' 		</button> '+
							'	</div> ';
							break;
						
						case 'cor-grd':
							html = html +' <div ng-mouseover="'+that.model+'.ZoominItem($event);" ng-mouseleave="'+that.model+'.ZoomoutItem($event);" '+
							'		style="padding: 12px; border-radius: 3px; box-shadow: 0 1px 3px #646464; transform-origin: left top; transition: .5s 0s; position: inherit; cursor: zoom-in; {{'+that.model+'.gerar_gradiente('+item+'['+col+'.CAMPO]) }};"> '+
							'	</div> ';
							break;
						
						case 'cor':
							html = html +' <div ng-mouseover="'+that.model+'.ZoominItem($event);" ng-mouseleave="'+that.model+'.ZoomoutItem($event);" '+
								'	 style="padding: 12px; border-radius: 3px; box-shadow: 0 1px 3px #646464; transform-origin: left top; transition: .5s 0s; position: inherit; cursor: zoom-in; background-color: {{ '+item+'['+col+'.CAMPO] }};"> '+
								'</div> ';
							break;
						
						case 'html':
							html = html +' <div ng-bind-html="'+that.model+'.GeraHtml('+col+'.HTML.funcao('+item+'));"> '+
								'	</div> ';
							break;
						
						case 'htmlcp':

							var classDiv = '';
							var htmlCp = coluna.HTML;

							if(typeof coluna.PARAM_CLASS_DIV != 'undefined' && coluna.PARAM_CLASS_DIV != ''){
								classDiv = " class = '" + coluna.PARAM_CLASS_DIV + "'";
							}

							if(nivel != 0){
								htmlCp = (htmlCp + '')
									.replace(/\bitem\./g, item + '.')
									.replace(/\bitem\[/g, item + '[')
									.replace(/\(item,/g, '(' + item + ',')
									.replace(/\(item\)/g, '(' + item + ')')
									.replace(/=item\./g, '=' + item + '.')
									.replace(/ item,/g, ' ' + item + ',')
									.replace(/ item\)/g, ' ' + item + ')');
							}
							
							html = html +' <div '+ classDiv +'>'+ htmlCp +'  </div> ';
							break;
						
						case 'status2':
							html = html +'  <div style="text-align: -webkit-center;"> <span class="t-status status2-{{ '+item+'['+col+'.CAMPO] }}"></span> </div> ';
							break;
						
						case 'status':
							html = html +' <div style="text-align: -webkit-center;"> <span class="t-status status-{{ '+item+'['+col+'.CAMPO] }}"></span> </div>'
							break;
						
						case 'link':
							html = html +' <a  href="" target=”_blank” ng-click="'+that.model_selected+'.SELECTED = '+item+';'+that.model+'.open_link('+col+'.LINK,'+col+'.LINK_PARAM,'+item+');$event.stopPropagation();" rel=”noopener noreferrer”>{{ '+that.model+'.format('+item+'['+col+'.CAMPO],'+col+','+item+') }}</a>	';
							break;
						
						case 'imput_number':
							html = html +'<input ng-blur="'+col+'.EVENT_BLUR.funcao('+item+', $event);" ng-number-format="'+col+'.NUMBER_FORMAT" ng-click="$event.stopPropagation();" type="text" ng-min="'+col+'.MIN" ng-max="'+col+'.MAX" class="item_edit_tab text-right" ng-model="'+item+'['+col+'.CAMPO]" ng-focus="'+that.model+'.SELECTED = item" style=" padding: 5px; height: 25px; width: 40%; margin-top: -3px;">';
							break;
						
						default:
							html = html +' <div> </div> ';							
							break;
					}

					return html;					
				},
				DADOS_AGRUPAMENTO : [],
				DADOS_AGRUP_BKP : [],
				getTD2: function(texto_ttitle,tipo,nivel, obj_item, mdl, tmp_item){
					var that = this;

					that.campo_model = typeof that.campo_model == 'undefined' ? 'item.CHECKED' : that.campo_model;
					that.input_function = typeof that.input_function == 'undefined' ? 'function(){}' : that.input_function;

					if(tipo == 1 || tipo == 3){

						var html = ' <td ng-if="'+that.model+'.status_visible == true" style="text-align: -webkit-center; {{'+that.model+'.status_style != undefined ? '+that.model+'.status_style.funcao(item) : \'\' }};  {{item.ESTILOS_CALCULADOS != undefined ? item.ESTILOS_CALCULADOS[\'STATUS\'] : \'\' }};"> <span ng-if="item.HINT_STATUS != undefined" ttitle="{{item.HINT_STATUS}}" class="t-status status-{{ item.STATUS }}" style="{{'+that.model+'.status_style_custom != undefined ? '+that.model+'.status_style_custom.funcao(item) : \'\' }};"></span> <span ng-if="item.HINT_STATUS == undefined" class="t-status status-{{ item.STATUS }}" style="{{'+that.model+'.status_style_custom != undefined ? '+that.model+'.status_style_custom.funcao(item) : \'\' }};"></span> </td> '+
								   ' <td class="no-print checkbox-align" ng-if="'+that.model+'.input_visible == true" style="{{'+that.model+'.input_style != undefined ? '+that.model+'.input_style.funcao(item) : \'\' }}; {{item.ESTILOS_CALCULADOS != undefined ? item.ESTILOS_CALCULADOS[\'STATUS\'] : \'\' }};"> <span class="no-print"> <input tabindex="-1" type="checkbox" style="{{'+that.model+'.input_checkbox_style != undefined ? '+that.model+'.input_checkbox_style.funcao(item) : \'\' }};" ng-class="{\'not-focus-enter\' : '+that.model+'.not_focus_enter == true}" class="checkbox-class-manipulation" style="height: 20px !important; width: 20px !important; margin: 4px 0px 4px 1px !important;" ng-disabled="('+that.model+'.input_disabled == true && '+that.model+'.input_disabled != undefined) || ('+that.model+'.input_disabled.funcao != undefined && '+that.model+'.input_disabled.funcao(item) == true) || ('+that.model+'.validarMarcarItem(item) == false)" style="position: static; display: inline-block;" class="form-group" ng-model="'+that.campo_model+'" ng-click="$event.stopPropagation();'+that.model+'.count_marcados();'+that.model+'.fecha_menu($event);" ng-dblclick="$event.stopPropagation();" ng-change="'+that.input_function+';'+that.model+'.count_checked();"></span> </td> ';
				

						that.COLUNAS = sort_by_key(that.COLUNAS, 'ORDEM');

						var cont_col = 0;

						angular.forEach(that.COLUNAS, function(coluna, key){

							if(coluna.VISIBLE == true){
								cont_col = cont_col + 1;
							}

							var col    = ''+that.model+'.COLUNAS['+key+']';
							var classe = coluna.TIPO == 'btn' || coluna.TIPO == 'btn2' || coluna.TIPO == 'btn3' || coluna.TIPO == 'btn-danger' || coluna.TIPO == 'btn-primary' || coluna.TIPO == 'btn-success' || coluna.TIPO == 'btn-warning' || coluna.TIPO == 'btn-info' ? 'no-print' : '';

							if(coluna.TIPO == 'htmlcp'){
								var cod_click = '';
							}else{
								var cod_click = 'ng-dblclick="'+that.model+'.input_visible == true && '+that.model+'.input_visible != undefined ? '+that.model_selected+'.visualizar() : \'\'"';
							}

							var is_vl = coluna.TIPO != 'cor' && coluna.TIPO != 'cor-grd' && coluna.TIPO != 'status' && coluna.TIPO != 'status2' && coluna.TIPO != 'link' && coluna.TIPO != 'html' && coluna.TIPO != 'imput_number' && coluna.TIPO != 'htmlcp';

							var t1 = !(coluna.TEXT != '' && coluna.TEXT != undefined && coluna.TEXT.position == undefined) ? '' : ' <label ng-show="{{'+col+'.TEXT.visible}}" '+texto_ttitle+' style="{{'+col+'.TEXT.style}}"> <span ng-if="'+col+'.TEXT.icone != \'\' && '+col+'.TEXT.icone != undefined" class="{{'+col+'.TEXT.icone}}"></span> {{ '+col+'.TEXT.texto }} </label>	  ';
							var t2 = !(coluna.TEXT != '' && coluna.TEXT != undefined && coluna.TEXT.position == 'left'   ) ? '' : ' <label ng-show="{{'+col+'.TEXT.visible}}" '+texto_ttitle+' style="{{'+col+'.TEXT.style}}"> <span ng-if="'+col+'.TEXT.icone != \'\' && '+col+'.TEXT.icone != undefined" class="{{'+col+'.TEXT.icone}}"></span> {{ '+col+'.TEXT.texto }} </label>	  ';
							
							var tt = typeof coluna.TITLE == 'undefined' ? '' : 'ttitle="{{ '+col+'.TITLE(item) }}" ';

							var attr = typeof coluna.ATTR == 'undefined' ? '' : coluna.ATTR;

							var no_select = typeof coluna.NO_SELECT == 'undefined' ? '' : coluna.NO_SELECT;

							var SIZE_CELL = typeof coluna.SIZE_CELL != 'undefined' && (''+coluna.SIZE_CELL).trim().length > 1 ? 'min-width:'+coluna.SIZE_CELL+';max-width:'+coluna.SIZE_CELL+';' : '';

							html += ' <td '+tt+' id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" '+attr+' '+cod_click+' class="colid_'+cont_col+' '+no_select+' '+classe+'" ng-if="'+col+'.VISIBLE == true" style="'+SIZE_CELL+' text-align: {{'+col+'.ALIGN }}; overflow:{{'+col+'.TIPO == \'cor\' ? \'inherit\' : \'unset\' }};{{'+col+'.SIZE != \'0\' ? \'width:\'+'+col+'.SIZE+\';\' : \'\'}}; {{ (\'\'+'+col+'.STYLE.trim()).length > 0 ? '+col+'.STYLE : \'\'}}; {{ '+col+'.STYLE_CELL.trim().length > 0 ? '+col+'.STYLE_CELL : \'\'}}; {{ '+col+'.STYLE_OPT != undefined ? '+col+'.STYLE_OPT.funcao(item) : \'\' }}; {{ '+col+'.STYLE_OPT_PARAM != undefined ? '+col+'.STYLE_OPT_PARAM.funcao(item, '+col+'.PARAM_STYLE) : \'\' }}; {{'+that.model+'.opt_style != undefined ? '+that.model+'.opt_style.funcao(item) : \'\' }}; {{item.ESTILOS_CALCULADOS != undefined ? item.ESTILOS_CALCULADOS[\''+coluna.CAMPO+'\'] : \'\' }}; "> ';
							html += t1;
							html += is_vl ? ' <label style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; display: contents; {{'+col+'.SIZE != \'0\' ? \'max-width:\'+'+col+'.SIZE+\';\' : \'\'}};{{ '+col+'.STYLE_OPT != undefined ? '+col+'.STYLE_OPT.funcao(item) : \'\' }}; {{ '+col+'.STYLE_OPT_PARAM != undefined ? '+col+'.STYLE_OPT_PARAM.funcao(item, '+col+'.PARAM_STYLE) : \'\' }}; {{'+that.model+'.opt_style != undefined ? '+that.model+'.opt_style.funcao(item) : \'\' }};" ng-hide="'+that.model_selected+'.ALTERANDO == true && '+col+'.INPUT != undefined && '+col+'.INPUT != false" >{{ '+that.model+'.format(item['+col+'.CAMPO], '+col+', item) }} </label> ' : '';
							html += t2;
							html += that.getCampoCP(col, coluna,0) +' </td> ';

						});

					}else if(tipo == 2){

						var grupo  = '';
						var grupo2 = '';

						var model_grupo = that;

						for(var a = 0; a < nivel; a++){
							grupo = grupo +'.GRUPOS';

							if(typeof model_grupo['GRUPOS'] != 'undefined'){
								model_grupo = model_grupo['GRUPOS'];
							}

							if(nivel > 0){
								grupo2 = grupo2 +'.GRUPOS';

								if(typeof model_grupo['GRUPOS'] != 'undefined'){
									model_grupo = model_grupo['GRUPOS'];
								}
							}
						}

						var html = '';
						model_grupo.CAMPOS = sort_by_key(model_grupo.CAMPOS, 'ORDEM');

						var cont_col = 0;

						var tmp = 'that'+grupo;
						eval('model_grupo = '+ tmp + ';');

						angular.forEach(model_grupo.CAMPOS, function(campo, key){

							var col = that.model+grupo+'.CAMPOS['+key+']';
							
							if(campo.VISIBLE){
								if(campo.SPANCEL > 0){
									cont_col = cont_col + campo.SPANCEL;
								}else{
									cont_col = cont_col + 1;
								}
							}

							var valor  = that.format( obj_item[campo.CAMPO] , campo, obj_item);
							var tvalor = that.format( obj_item['_TOT_'+campo.CAMPO] , campo, obj_item);

							var ctop = obj_item['_V_TOT_'+campo.CAMPO] == true ? tvalor : valor;

							var size  = (campo.SIZE != '0' ? 'max-width:'+campo.SIZE+';' : '');
							var sopt  = (campo.STYLE_OPT != undefined ? campo.STYLE_OPT.funcao(obj_item) : '');
							var sopt  = (campo.STYLE_OPT_PARAM != undefined ? campo.STYLE_OPT_PARAM.funcao(obj_item, campo.PARAM_STYLE) : '');
							var popt  = (that.opt_style != undefined ? that.opt_style.funcao(obj_item) : '');

							var link  = obj_item['_LINK_'+campo.CAMPO];
							var vlink = obj_item['_V_LINK_'+campo.CAMPO] == true;

							var seif = campo.TIPO != 'cor' && campo.TIPO != 'cor-grd' && obj_item['_V_LINK_'+campo.CAMPO] != true && campo.TIPO != 'status' && campo.TIPO != 'status2' && campo.TIPO != 'link' && campo.TIPO != 'imput_number' && campo.TIPO != 'cor-grd' && campo.TIPO != 'btn' && campo.TIPO != 'btn2' && campo.TIPO != 'btn3';

							if( campo.STYLE_OPT2 != undefined && ((''+campo.STYLE_OPT2).trim()).length > 0){
								var novo_valor = '';
								eval('function execVal(){'+campo.STYLE_OPT2+'};  novo_valor = execVal()');

								sopt = novo_valor;
							}

							if( campo.CONTEUDO != undefined && ((''+campo.CONTEUDO).trim()).length > 0){

								var novo_valor = '';
								eval('function execVal(){'+campo.CONTEUDO+'};  novo_valor = execVal()');

								var str_campo1 = (!seif ? '' : novo_valor);

							}else{
								var str_campo1 = (!seif ? '' : ' <label style=" text-overflow: ellipsis; white-space: nowrap; overflow: hidden; display: contents; '+size+' '+sopt+' '+popt+'" ng-hide="'+that.model_selected+'.ALTERANDO == true && '+col+'.INPUT != undefined && '+col+'.INPUT != false" > '+ctop+'  </label> ');
							}


							var str_campo2 = (!vlink ? '' : '<a target="_blank" href="'+link+'" >'+ctop+'</a>');

							var ttitle = typeof campo.TITLE == 'undefined' ? '' : 'ttitle="'+campo.TITLE(obj_item)+'" ';

							var stylesr = 'text-align: '+campo.ALIGN+'; overflow:'+ (campo.TIPO == 'cor' ? 'inherit' : 'unset')+';'+ (campo.SIZE != '0' ? 'width:'+campo.SIZE+';' : '') + (((''+campo.STYLE).trim()).length > 0 ? campo.STYLE : '') + ((campo.STYLE_CELL+'').trim().length > 0 ? campo.STYLE_CELL : '') + (campo.STYLE_OPT != undefined ? campo.STYLE_OPT.funcao(obj_item) : '') + (campo.STYLE_OPT_PARAM != undefined ? campo.STYLE_OPT_PARAM.funcao(obj_item, campo.PARAM_STYLE) : '') + (that.opt_style != undefined ? that.opt_style.funcao(obj_item) : '');

							var attr = typeof campo.ATTR == 'undefined' ? '' : campo.ATTR;

							var no_select = typeof campo.NO_SELECT == 'undefined' ? '' : campo.NO_SELECT;

							var SIZE_CELL = typeof campo.SIZE_CELL != 'undefined' && (''+campo.SIZE_CELL).trim().length > 1 ? 'min-width:'+campo.SIZE_CELL+';max-width:'+campo.SIZE_CELL+';' : '';


							if(key == 0){
								html += (!(that.status_visible == true) ? '' : ' <td style="text-align: -webkit-center; {{'+that.model+'.status_style != undefined ? '+that.model+'.status_style.funcao('+tmp_item+') : \'\' }};"> <span class="t-status status-{{ '+tmp_item+'.STATUS }}"></span></td> ')+
										(!(that.input_visible  == true && (model_grupo.INPUT == true ? true : false)) ? '' : ' <td class="no-print checkbox-align" style="{{'+that.model+'.input_style != undefined ? '+that.model+'.input_style.funcao(item) : \'\' }};"> <span class="no-print"> <input type="checkbox" style="{{'+that.model+'.input_checkbox_style != undefined ? '+that.model+'.input_checkbox_style.funcao(item) : \'\' }};" ng-class="{\'not-focus-enter\' : '+that.model+'.not_focus_enter == true}" class="checkbox-class-manipulation" ng-disabled="('+that.model+'.input_disabled == true && '+that.model+'.input_disabled != undefined) || ('+that.model+'.input_disabled.funcao != undefined && '+that.model+'.input_disabled.funcao(item) == true) || ('+that.model+'.validarMarcarItem(item) == false)" style="width: 20px; height: 20px; margin: 0px; position: static; display: inline-block;" class="form-group" ng-model="'+that.campo_model+'" ng-change="'+that.input_function+';'+that.model+'.count_checked();"></span></td> ');
							}
							
							var icone_acordeon = (that.html_speed == true && key == 0 && nivel < that.TOTAL_NIVEIS) ? '<span style="color: green; font-size: 14px; display: none;" class="glyphicon glyphicon-plus-sign icone_fechado" aria-hidden="true"></span><span style="color: #F44336; font-size: 14px;" class="icone_aberto glyphicon glyphicon-minus-sign" aria-hidden="true"></span>' : '';

							if(campo.VISIBLE == true){

								var  contid_cel = campo.SPANCEL > 1 ? (cont_col - campo.SPANCEL + 1) : cont_col;
								
								html += '  <td id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" '+attr+' class="colid_'+( contid_cel )+' '+no_select+'" colspan="'+campo.SPANCEL+'" '+ttitle+' ng-click="'+that.model+'.input_visible == true && '+that.model+'.input_visible != undefined ? '+that.model_selected+'.visualizar() : \'\' " style="'+stylesr+''+SIZE_CELL+';'+sopt+'"> '+ 
						
								str_campo1 + str_campo2 + icone_acordeon + '</td>';
									
							}
						
						});

					}
					
					return html;

                },
				getValueNivel: function(item, col){
					var that = this;
					var valor = item['_V_TOT_' + col.CAMPO] == true ? that.format(item['_TOT_'+ col.CAMPO ], col, item) : that.format(item[col.CAMPO], col, item);
					return valor;
				},
				getTD: function(texto_ttitle,tipo,nivel){
					var that = this;

					that.campo_model = typeof that.campo_model == 'undefined' ? 'item.CHECKED' : that.campo_model;
					that.input_function = typeof that.input_function == 'undefined' ? 'function(){}' : that.input_function;

					if(tipo == 1 || tipo == 3){

						var html = ' <td ng-if="'+that.model+'.status_visible == true" style="text-align: -webkit-center; {{'+that.model+'.status_style != undefined ? '+that.model+'.status_style.funcao(item) : \'\' }};  {{item.ESTILOS_CALCULADOS != undefined ? item.ESTILOS_CALCULADOS[\'STATUS\'] : \'\' }}; "> <span ng-if="item.HINT_STATUS != undefined" ttitle="{{item.HINT_STATUS}}" class="t-status status-{{ item.STATUS }}" style="{{'+that.model+'.status_style_custom != undefined ? '+that.model+'.status_style_custom.funcao(item) : \'\' }};"></span> <span ng-if="item.HINT_STATUS == undefined" class="t-status status-{{ item.STATUS }}" style="{{'+that.model+'.status_style_custom != undefined ? '+that.model+'.status_style_custom.funcao(item) : \'\' }};"></span> </td> '+
								   ' <td class="no-print checkbox-align" ng-if="'+that.model+'.input_visible == true" style="{{'+that.model+'.input_style != undefined ? '+that.model+'.input_style.funcao(item) : \'\' }}; {{item.ESTILOS_CALCULADOS != undefined ? item.ESTILOS_CALCULADOS[\'STATUS\'] : \'\' }}; "> <span class="no-print"> <input tabindex="-1" type="checkbox" style="{{'+that.model+'.input_checkbox_style != undefined ? '+that.model+'.input_checkbox_style.funcao(item) : \'\' }};" ng-class="{\'not-focus-enter\' : '+that.model+'.not_focus_enter == true}" check-standard2 class="checkbox-class-manipulation" style="height: 20px !important; width: 20px !important; margin: 4px 0px 4px 1px !important;" ng-disabled="('+that.model+'.input_disabled == true && '+that.model+'.input_disabled != undefined) || ('+that.model+'.input_disabled.funcao != undefined && '+that.model+'.input_disabled.funcao(item) == true) || ('+that.model+'.validarMarcarItem(item) == false)" style="position: static; display: inline-block;" class="form-group" ng-model="'+that.campo_model+'" ng-click="$event.stopPropagation();'+that.model+'.fecha_menu($event);" ng-dblclick="$event.stopPropagation();" ng-change="'+that.input_function+';'+that.model+'.count_checked();"></span> </td> ';
				

						that.COLUNAS = sort_by_key(that.COLUNAS, 'ORDEM');

						var cont_col = 0;

						angular.forEach(that.COLUNAS, function(coluna, key){

							if(coluna.VISIBLE == true){
								cont_col = cont_col + 1;
							}

							var col    = ''+that.model+'.COLUNAS['+key+']';
							var classe = coluna.TIPO == 'btn' || coluna.TIPO == 'btn2' || coluna.TIPO == 'btn3' || coluna.TIPO == 'btn-danger' || coluna.TIPO == 'btn-primary' || coluna.TIPO == 'btn-success' || coluna.TIPO == 'btn-warning' || coluna.TIPO == 'btn-info' ? 'no-print' : '';

							if(coluna.TIPO == 'htmlcp'){
								var cod_click = '';
							}else{
								var cod_click = 'ng-dblclick="'+that.model+'.input_visible == true && '+that.model+'.input_visible != undefined ? '+that.model_selected+'.visualizar() : \'\'"';
							}

							var is_vl = coluna.TIPO != 'cor' && coluna.TIPO != 'cor-grd' && coluna.TIPO != 'status' && coluna.TIPO != 'status2' && coluna.TIPO != 'link' && coluna.TIPO != 'html' && coluna.TIPO != 'imput_number' && coluna.TIPO != 'htmlcp';

							var t1 = !(coluna.TEXT != '' && coluna.TEXT != undefined && coluna.TEXT.position == undefined) ? '' : ' <label ng-show="{{'+col+'.TEXT.visible}}" '+texto_ttitle+' style="{{'+col+'.TEXT.style}}"> <span ng-if="'+col+'.TEXT.icone != \'\' && '+col+'.TEXT.icone != undefined" class="{{'+col+'.TEXT.icone}}"></span> {{ '+col+'.TEXT.texto }} </label>	  ';
							var t2 = !(coluna.TEXT != '' && coluna.TEXT != undefined && coluna.TEXT.position == 'left'   ) ? '' : ' <label ng-show="{{'+col+'.TEXT.visible}}" '+texto_ttitle+' style="{{'+col+'.TEXT.style}}"> <span ng-if="'+col+'.TEXT.icone != \'\' && '+col+'.TEXT.icone != undefined" class="{{'+col+'.TEXT.icone}}"></span> {{ '+col+'.TEXT.texto }} </label>	  ';
							
							var tt = typeof coluna.TITLE == 'undefined' ? '' : 'ttitle="{{ '+col+'.TITLE(item) }}" ';
							
							var SIZE_CELL = typeof coluna.SIZE_CELL != 'undefined' && (''+coluna.SIZE_CELL).trim().length > 1 ? 'min-width:'+coluna.SIZE_CELL+';max-width:'+coluna.SIZE_CELL+';' : '';

							//var tex_aling = coluna

							var attr = typeof coluna.ATTR == 'undefined' ? '' : coluna.ATTR;

							var no_select = typeof coluna.NO_SELECT == 'undefined' ? '' : coluna.NO_SELECT;

							html += ' <td id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" '+tt+' '+attr+' '+cod_click+' class="colid_'+cont_col+' '+classe+' '+no_select+'" ng-if="'+col+'.VISIBLE == true" style="'+SIZE_CELL+'text-align: {{'+col+'.ALIGN }}; overflow:{{'+col+'.TIPO == \'cor\' ? \'inherit\' : \'unset\' }};{{'+col+'.SIZE != \'0\' ? \'width:\'+'+col+'.SIZE+\';\' : \'\'}}; {{ (\'\'+'+col+'.STYLE.trim()).length > 0 ? '+col+'.STYLE : \'\'}}; {{ '+col+'.STYLE_CELL.trim().length > 0 ? '+col+'.STYLE_CELL : \'\'}}; {{ '+col+'.STYLE_OPT != undefined ? '+col+'.STYLE_OPT.funcao(item) : \'\' }}; {{ '+col+'.STYLE_OPT_PARAM != undefined ? '+col+'.STYLE_OPT_PARAM.funcao(item, '+col+'.PARAM_STYLE) : \'\' }}; {{'+that.model+'.opt_style != undefined ? '+that.model+'.opt_style.funcao(item) : \'\' }}; {{item.ESTILOS_CALCULADOS != undefined ? item.ESTILOS_CALCULADOS[\''+coluna.CAMPO+'\'] : \'\' }}; "> ';
							html += t1;
							html += is_vl ? ' <label style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; display: contents; {{'+col+'.SIZE != \'0\' ? \'max-width:\'+'+col+'.SIZE+\';\' : \'\'}};{{ '+col+'.STYLE_OPT != undefined ? '+col+'.STYLE_OPT.funcao(item) : \'\' }};{{ '+col+'.STYLE_OPT_PARAM != undefined ? '+col+'.STYLE_OPT_PARAM.funcao(item, '+col+'.PARAM_STYLE) : \'\' }}; {{'+that.model+'.opt_style != undefined ? '+that.model+'.opt_style.funcao(item) : \'\' }};" ng-hide="'+that.model_selected+'.ALTERANDO == true && '+col+'.INPUT != undefined && '+col+'.INPUT != false" >{{ '+that.model+'.format(item['+col+'.CAMPO], '+col+', item) }} </label> ' : '';
							html += t2;
							html += that.getCampoCP(col, coluna,0) +' </td> ';

						});

					}else if(tipo == 2){

						var grupo  = '';
						var grupo2 = '';

						var model_grupo = that;

						for(var a = 0; a < nivel; a++){
							grupo = grupo +'.GRUPOS';

							if(typeof model_grupo['GRUPOS'] != 'undefined'){
								model_grupo = model_grupo['GRUPOS'];
							}

							if(nivel > 0){
								grupo2 = grupo2 +'.GRUPOS';

								if(typeof model_grupo['GRUPOS'] != 'undefined'){
									model_grupo = model_grupo['GRUPOS'];
								}
							}
						}

						var html = '';
						model_grupo.CAMPOS = sort_by_key(model_grupo.CAMPOS, 'ORDEM');

						var cont_col = 0;

						var tmp = 'that'+grupo;
						eval('model_grupo = '+ tmp + ';');

						angular.forEach(model_grupo.CAMPOS, function(campo, key){

							var col = that.model+grupo+'.CAMPOS['+key+']';
							var item_grupo = that;
							var item_g = that;

							grupo.split('.').forEach(function(gp){
								if(gp != ''){
									item_grupo = item_grupo[gp];
								}
							});

							item_g     = item_grupo;
							item_grupo = item_grupo.CAMPOS[key];
							
							if(campo.VISIBLE){
								if(campo.SPANCEL > 0){
									cont_col = cont_col + campo.SPANCEL;
								}else{
									cont_col = cont_col + 1;
								}
							}

							var attr = typeof campo.ATTR == 'undefined' ? '' : campo.ATTR;
							var no_select = typeof campo.NO_SELECT == 'undefined' ? '' : campo.NO_SELECT;
							var SIZE_CELL = typeof campo.SIZE_CELL != 'undefined' && (''+campo.SIZE_CELL).trim().length > 1 ? 'min-width:'+campo.SIZE_CELL+';max-width:'+campo.SIZE_CELL+';' : '';

							var is_vl = campo.TIPO != 'cor' && campo.TIPO != 'cor-grd' && campo.TIPO != 'status' && campo.TIPO != 'status2' && campo.TIPO != 'html' && campo.TIPO != 'imput_number' && campo.TIPO != 'htmlcp';
							var is_lk = campo.TIPO == 'link';

							var str_campo1 = '';
							var str_campo2 = '';

							//var valor = item['_V_TOT_'+col].CAMPO == true ? that.format(item['_V_TOT_'+col].CAMPO,col,item['_V_TOT_'+col]) : that.format(item[col].CAMPO,col,item[col]);
							
							var cp_valor = ''+that.model+'.getValueNivel(item_'+nivel+', '+col+')';

							if(is_vl){
								str_campo1 = ' <div style=" text-overflow: ellipsis; white-space: nowrap; overflow: hidden; display: contents; {{'+col+'.SIZE != \'0\' ? \'max-width:\'+'+col+'.SIZE+\';\' : \'\'}};{{ '+col+'.STYLE_OPT != undefined ? '+col+'.STYLE_OPT.funcao(item_'+nivel+') : \'\' }};{{ '+col+'.STYLE_OPT_PARAM != undefined ? '+col+'.STYLE_OPT_PARAM.funcao(item_'+nivel+', '+col+'.PARAM_STYLE) : \'\' }};{{'+that.model+'.opt_style != undefined ? '+that.model+'.opt_style.funcao(item) : \'\' }};" ng-hide="'+that.model_selected+'.ALTERANDO == true && '+col+'.INPUT != undefined && '+col+'.INPUT != false" >'+
											'{{' + cp_valor + '}} </div> ';
							}

							if(is_lk){
								str_campo2 = '<a target="_blank" href="{{item_'+nivel+'[\'_LINK_\'+'+col+'.CAMPO]}}" ng-if="item_'+nivel+'[\'_V_LINK_\'+'+col+'.CAMPO] == true"> {{ item_'+nivel+'[\'_V_TOT_\'+'+col+'.CAMPO] == true ? '+that.model+'.format(item_'+nivel+'[\'_TOT_\'+'+col+'.CAMPO],'+col+',item_'+nivel+') : '+that.model+'.format(item_'+nivel+'['+col+'.CAMPO],'+col+',item_'+nivel+') }} </a>';
							}

							if(key == 0){
								if(that.status_visible == true){
									html += '  <td style="text-align: -webkit-center; {{'+that.model+'.status_style != undefined ? '+that.model+'.status_style.funcao(item_'+nivel+') : \'\' }};"> <span class="t-status status-{{ item_'+nivel+'.STATUS }}"></span></td> ';
								}
								
								if(that.input_visible == true && item_g.INPUT == true){
									html += '  <td class="no-print checkbox-align" style="{{'+that.model+'.input_style != undefined ? '+that.model+'.input_style.funcao(item) : \'\' }};" ng-if="'+that.model+'.input_visible == true && '+that.model+grupo+'.INPUT == true ? true : false"> <span class="no-print"> <input type="checkbox" style="{{'+that.model+'.input_checkbox_style != undefined ? '+that.model+'.input_checkbox_style.funcao(item) : \'\' }};" ng-class="{\'not-focus-enter\' : '+that.model+'.not_focus_enter == true}" class="checkbox-class-manipulation" ng-disabled="('+that.model+'.input_disabled == true && '+that.model+'.input_disabled != undefined) || ('+that.model+'.input_disabled.funcao != undefined && '+that.model+'.input_disabled.funcao(item) == true) || ('+that.model+'.validarMarcarItem(item) == false)" style="width: 20px; height: 20px; margin: 0px; position: static; display: inline-block;" class="form-group" ng-model="'+that.campo_model+'" ng-change="'+that.input_function+';'+that.model+'.count_checked();"></span></td> ';
								}
							}
							
							var icone_acordeon = (that.html_speed == true && key == 0 && nivel < that.TOTAL_NIVEIS) ? '<span style="color: green; font-size: 14px;" class="glyphicon glyphicon-plus-sign icone_fechado" aria-hidden="true"></span><span style="color: #F44336; display: none; font-size: 14px;" class="icone_aberto glyphicon glyphicon-minus-sign" aria-hidden="true"></span>' : '';

							if(item_grupo.VISIBLE == true){

								html += '  <td id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" '+attr+' class="colid_'+( cont_col )+' '+no_select+'" ng-attr-colspan="{{'+col+'.SPANCEL}}" ttitle="{{ '+col+'.TITLE(item_'+nivel+') }}" ng-click="'+that.model+'.input_visible == true && '+that.model+'.input_visible != undefined ? '+that.model_selected+'.visualizar() : \'\' " style="'+SIZE_CELL+'text-align: {{'+col+'.ALIGN }}; overflow:{{'+col+'.TIPO == \'cor\' ? \'inherit\' : \'unset\' }};{{'+col+'.SIZE != \'0\' ? \'width:\'+'+col+'.SIZE+\';\' : \'\'}}; {{ (\'\'+'+col+'.STYLE.trim()).length > 0 ? '+col+'.STYLE : \'\'}}; {{ '+col+'.STYLE_CELL.trim().length > 0 ? '+col+'.STYLE_CELL : \'\'}}; {{ '+col+'.STYLE_OPT != undefined ? '+col+'.STYLE_OPT.funcao(item_'+nivel+') : \'\' }}; {{ '+col+'.STYLE_OPT_PARAM != undefined ? '+col+'.STYLE_OPT_PARAM.funcao(item_'+nivel+', '+col+'.PARAM_STYLE) : \'\' }}; {{'+that.model+'.opt_style != undefined ? '+that.model+'.opt_style.funcao(item_'+nivel+') : \'\' }}; "> '+ 						
										str_campo1 + 
										str_campo2 + 
										icone_acordeon
									;						
								
								if(item_grupo.TEXT != '' && item_grupo.TEXT != undefined && item_grupo.TEXT.visible){
									html += '<label '+texto_ttitle+' style="{{'+col+'.TEXT.style}}"> <span ng-if="'+col+'.TEXT.icone != \'\' && '+col+'.TEXT.icone != undefined" class="{{'+col+'.TEXT.icone}}"></span> {{ '+col+'.TEXT.texto }} </label> ';
								}

								html += (campo.TIPO == 'htmlcp' ? that.getCampoCP(col, campo, nivel) : that.getCampo(nivel, col, campo)) +' </td> ';
							}
						
						});

					}
					
					return html;

				},
                merge : function(dados){

					var that 		= this;	
					var array_dados = dados;
					if(typeof that.array_numericos == 'undefined'){
						that.array_numericos = [];
					}

					if(that.array_numericos.length == 0){
						//Identificar e guardar colunas do tipo number
						for(var a = 0; a < that.COLUNAS.length;a++){
							if(that.COLUNAS[a].TIPO == 'number'){
								that.array_numericos.push(that.COLUNAS[a].CAMPO);
							}
						}
					}

					if(typeof that.infinite_scroll == 'undefined' || that.infinite_scroll == false){
						for(var zy = 0; zy < that.array_numericos.length; zy++){
							for(var zx = 0; zx < dados.length; zx++){
								dados[zx][that.array_numericos[zy]] = Number(dados[zx][that.array_numericos[zy]]);
							}	
						}							
						that.DADOS = dados;
						if(dados.length){
							that.total_dados = dados.length;				
						}else{
							that.total_dados = 0;
						}
					}else{

						var resetar_dados = false;
						if(that.consulta_pagina == 0){
							that.apagar();
							resetar_dados = true;
						}
				
						if(dados.length < that.consulta_qtd){
							that.infinite_end = true;
						}else if(that.infinite_end == true){
							if(dados.length != 0){
								that.infinite_end = false;
							}							
							resetar_dados = true;
						}else{							
							that.infinite_end = false;
						}

						if(that.operacao_merge_gravar == true){
							resetar_dados = true;
							console.log('Operação utilizada no merge dos dados em execução. Aguarde...');

							that.operacao_merge_gravar = false;
						}

						if(resetar_dados == false){
							var array1 = that.DADOS;
							//Transformar as colunas do tipo number em número...
							for(var zy = 0; zy < that.array_numericos.length; zy++){
								for(var zx = 0; zx < array_dados.length; zx++){
									array_dados[zx][that.array_numericos[zy]] = Number(array_dados[zx][that.array_numericos[zy]]);
								}	
							}							
							var array2 = array_dados;
							var array3 = array1.concat(array2);
							console.log('dados concatenados tabela',array3);
							that.DADOS = array3;

						}else{
							//Transformar as colunas do tipo number em número...
							for(var zy = 0; zy < that.array_numericos.length; zy++){
								for(var zx = 0; zx < dados.length; zx++){
									dados[zx][that.array_numericos[zy]] = Number(dados[zx][that.array_numericos[zy]]);
								}	
							}
							that.DADOS = dados;
							if(dados.length){
								that.total_dados = dados.length;				
							}else{
								that.total_dados = 0;
							}
						}
						
						if(that.DADOS.length){
							that.total_dados = that.DADOS.length;				
						}else{
							that.total_dados = 0;
						}

						that.scroll_counter = 0;
						
					}

					var prop1 = trim_null((''+that.campo_model).replace('item.',''));
					if(that.linhas_marcadas == true && that.filtro_visible == false){
						for(var a = 0; a < that.DADOS.length; a++){
							var item = that.DADOS[a];
							item[prop1] = true;
							if(that.validar_marcar_todos == true){
								that.onMarcar(item);
							}
						}
						if(typeof that.validar_marcar_todos == 'undefined' || that.validar_marcar_todos == false){
							that.onMarcar();
						}
						
					}else if(that.linhas_marcadas == true && that.filtro_visible == true){
						that.Time5 = $timeout(function(){
							for(var a = 0; a < that.DADOS_RENDER.length; a++){
								var item = that.DADOS_RENDER[a];
								item[prop1] = true;
								if(that.validar_marcar_todos == true){
									that.onMarcar(item);
								}
							}
							if(typeof that.validar_marcar_todos == 'undefined' || that.validar_marcar_todos == false){
								that.onMarcar();
							}

							$timeout.cancel(that.Time5);
						},300)
					}

					angular.forEach(that.DADOS, function(item, key1){
						angular.forEach(that.COLUNAS , function(campoList, key2){
							if(typeof campoList.URL_LINK != 'undefined' && campoList.URL_LINK != '' && campoList.URL_LINK != 'null' && campoList.URL_LINK != null){
								item['_LINK_'+campoList.CAMPO] = typeof item['_LINK_'+campoList.CAMPO]== 'undefined' ? campoList.URL_LINK : item['_LINK_'+campoList.CAMPO];
								item['_V_LINK_'+campoList.CAMPO] = true;

								var campos = Object.keys(item);

								angular.forEach( campos, function(campo, key3){										
									if(item['_V_TOT_'+campo] == true){
										var valor = item['_TOT_'+campo];
									}else{
										var valor = item[campo];
									}

									item['_LINK_'+campoList.CAMPO] = item['_LINK_'+campoList.CAMPO].replaceAll('#'+campo+'#', '' + valor + '');
								});
							}
						});
					});

                    if(that.total_visible){
                        that.TotalTabela();	
					}

					if(typeof that.infinite_scroll != 'undefined' && that.infinite_scroll == true){
						that.model_tabela.DADOS = that.DADOS;
					}
					
					that.consultando = false;

					function tratarhtml(olt_html){
						olt_html = (olt_html+'').replaceAll('ng-repeat', 'old-repeat');
						olt_html = (olt_html+'').replaceAll("<!--(.|\\s)*?-->", "");
						olt_html = (olt_html+'').replaceAll("<label(.|\\s)*?>", "");
						olt_html = (olt_html+'').replaceAll("</label>", "");
						olt_html = (olt_html+'').replaceAll("ng-", "old-");
						olt_html = (olt_html+'').replaceAll("old-(.|\\s)*?\" ", "");
						olt_html = (olt_html+'').replaceAll(that.model, "");
						olt_html = (olt_html+'').replaceAll("{{(.|\\s)*?}}", "");
						olt_html = (olt_html+'').replaceAll("  ", " ");
						olt_html = (olt_html+'').replaceAll("input_visible", " ");
						olt_html = (olt_html+'').replaceAll(/\.CAMPOS/g, " ");
						olt_html = (olt_html+'').replaceAll(/\.GRUPOS/g, " ");
						olt_html = (olt_html+'').replaceAll(that.model_selected, " ");
						olt_html = (olt_html+'').replaceAll(".COLLECTION", " ");
						olt_html = (olt_html+'').replaceAll(".DADOS_AGRUPAMENTO", " ");
						olt_html = (olt_html+'').replaceAll(".modelTabela", " ");
						olt_html = (olt_html+'').replaceAll(".SELECTED", " ");
						olt_html = (olt_html+'').replaceAll(".getClickAccordion", " ");
						olt_html = (olt_html+'').replaceAll("undefined", " ");
						olt_html = (olt_html+'').replaceAll(".visualizar()", " ");
						olt_html = (olt_html+'').replaceAll("colspan\=\"0\"", " ");
						olt_html = (olt_html+'').replaceAll("colspan\=\" \"", " ");
						olt_html = (olt_html+'').replaceAll("overflow\:unset\;", " ");
						olt_html = (olt_html+'').replaceAll("text-align\: left\;", " ");
						olt_html = (olt_html+'').replaceAll("gc-order-by=\".ORDER_BY\"", " ");

						olt_html = (olt_html+'').replaceAll("  ", " ");
						olt_html = (olt_html+'').replaceAll("  ", " ");
						olt_html = (olt_html+'').replaceAll("  ", " ");
						olt_html = (olt_html+'').replaceAll("  ", " ");
						
						olt_html = (olt_html+'').replaceAll("style\=\" \"", " ");
						olt_html = (olt_html+'').replaceAll("style\=\"\"", " ");

						return olt_html;
					}

					that.Time6 = $timeout(function(){
						if(that.html_speed == true){

							that.Time7 = $timeout(function(){
								/////////////////////////////////////////////////////////////////////

								var head = '';

								var css_buscar = $(document).find('link');
								var js_buscar  = $(document).find('script');
								
								var link_page = urlhost;
								
								for(var b = 0; b < css_buscar.length;b++){
									var tal = $(css_buscar[b]).attr('href');
									
									if(tal.indexOf('http') == -1){
										tal = link_page+''+tal;
									}

									head += '<link rel="stylesheet" href="'+tal+'">';
								}

								var head2 = '';

								for(var b = 0; b < js_buscar.length;b++){
									var tal = $(js_buscar[b]).attr('src');
									
									if(typeof tal !== 'undefined' && tal != ''){
										if(tal.indexOf('http') == -1){
											tal = link_page+''+tal;
										}

										if(tal.indexOf('master') > 0 || tal.indexOf('11081') > 0){

											head2 += '<script nonce="'+that.nonce+'" src="'+tal+'"></script>';
										}
									}
								}
			
								head+=  '<style>'+
										'	.table-ec{height: calc(var(--screen-height) - 0px) !important; overflow-anchor: none; opacity: 0;}'+
										'    body {padding-top: 0px !important;}'+
										'    td { white-space: nowrap; padding: 3px !important; overflow: hidden; text-overflow: ellipsis;}'+
										'	 tr:focus { outline: -webkit-focus-ring-color auto 21px; outline-width: 12px; outline-color: black;}'+
										'</style>';

								head += ' <link rel="stylesheet" href="'+link_page+'/js/tabela/tabela.css">';
								head += ' <script nonce="'+that.nonce+'" src="'+link_page+'/js/tabela/pace.min.js"></script>';
								head += ' <script nonce="'+that.nonce+'" src="'+link_page+'/js/tabela/jquery-3.5.1.min.js"></script>';
								head += ' <script nonce="'+that.nonce+'" src="'+link_page+'/js/tabela/vlist.js"></script>';

								var csvData = '\ufeff'+'<HTML></HTML>';
								var blob = new Blob([ csvData ], { type : "text/html;charset=utf-8;" });
								var csvUrl = URL.createObjectURL(blob);
								$(that.componente_frame).attr('src', csvUrl);

								var olt_html = that.getHtml();

								var tot = {HTML: that.html_total};

								if(typeof that.LINHAS_GERADAS == 'undefined'){
									that.LINHAS_GERADAS = [];
								}

								var tamanho_total   = document.getElementById((that.componente_frame+'').replace("#",'')).offsetHeight - 30;
								var tamanho_total   = 'var tamanho_tabela = \''+tamanho_total+'\';';
								var variavel_total  = 'var total_tabela   = '+JSON.stringify(tot)+'; total_tabela = total_tabela.HTML;';
								var variavel_linhas = 'var linha_tabela   = '+JSON.stringify(that.LINHAS_GERADAS)+';';
								var js_page_speed 	= that.JS_PAGE_SPEED;
								var html_page_speed = that.HTML_PAGE_SPEED;

								head+= "<script nonce=\""+that.nonce+"\">"+"\n"+
									"	Pace.on('start', function(){"+"\n"+
									"		$(\".table-ec\").css(\"opacity\", 0);"+"\n"+
									"	});"+"\n"+
									""+"\n"+
									"	Pace.on('done', function(){"+"\n"+
									"		$(\".table-ec\").css(\"opacity\", 1);"+"\n"+
									"	});"+"\n"+
									" "+tratarhtml(tamanho_total  )+" "+"\n"+
									" "+tratarhtml(variavel_total )+" "+"\n"+
									" "+tratarhtml(variavel_linhas)+" "+"\n"+
									"</script>"+"\n";

								olt_html = tratarhtml(olt_html);
								that.CACHE_HTML = olt_html;

								olt_html = (olt_html+'').replaceAll("<tbody>", "<tbody id=\"container2\">");
								olt_html = (olt_html+'').replaceAll("<thead" , '<thead order="1" id="container1" style="position: sticky; top: 0;" ');
								olt_html = (olt_html+'').replaceAll("<table" , '<thead style="background-color: #337ab7; color: white;" ');

								var p1 	 = (olt_html+'').indexOf('<thead');
								var p2 	 = (olt_html+'').indexOf('</thead>');

								p1 		 = (olt_html+'').substring(p1, p2+8);
								
								var p12  = (p1+'').indexOf('<thead');
								var p22  = (p1+'').indexOf('>');
								
								p12  	 = (p1+'').substring(p12, p22+1);

								var p13  = (p12+'').indexOf('id="tabela_');

								if(trim_null(p12) != '' && p13 > -1){
									p13  = p1.replace(p12, '');
									p13  = p13.replace('position: sticky;', '');
								}else{
									p13  = p1;
								}


								var html = '<!DOCTYPE html><html><head><title>Page Title</title>'+head+'</head><body id="main" ng-app="app" >'+
								'<input type="hidden" id="nor_enable_relogio" value="1">'+
								'<input type="hidden" id="habilita-websocket" value="0">'+
								'<input type="hidden" id="url-server" value="'+urlhost+'">'+
								'<div id=\"AppCtrl\" ng-controller=\"Ctrl as vm\" id="container">'+

								// botão para gerar html de impressão //////////////////
								'		<button type="button" class="btn btn-warning btn-sm" ng-click="" id="btnGerarHtmlImprimir" style="opacity: 0; width: 0.1px; height: 0.1px; left: 50vw; padding: 0.5px; cursor: none;">'+
								'			<span class="glyphicon glyphicon-console"></span> Gerar HTML Impressão'+
								'		</button>'+
								////////////////////////////////////////////////////////

								'		<div id="table1">'+
								'			<div id="table2"></div>'+
								'			<table border="1" id="container1" style="position: sticky; top: 0;">'+
								'				'+ p1 +''+
								'				<tbody id="container2">'+
								'					'+that.html_total+''+
								'				</tbody>'+
								'			</table>'+
								'		</div>'+

								// aba para impressão //////////////////////////////////
								'		<div id="table3" style="display: none;">'+
								'			<div id="table4"></div>'+
								'			<table border="1" id="container3" class="table table-striped tab_enter table-bordered table-condensed table-no-break table-middle table-low tabelaJS">'+
								'				'+ p13 +''+
								'				<tbody id="container4">'+
								'					'+that.html_total+''+
								'				</tbody>'+
								'			</table>'+
								'		</div>'+
								////////////////////////////////////////////////////////

								'		<table>'+
								'			<tbody id="tabela">'+
								'			</tbody>'+
								'		</table>'+

								' 		<div class="carregando-pagina">'+
								'			 <div class="progress">'+
								'				 <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">'+
								'					 <span class="sr-only">0% Complete</span>'+
								'				 </div>'+
								'			 </div>'+
								' 		</div>'+
								' '+html_page_speed+
								' </div>';

								
								html = html + head2;
								html = html + ' <script nonce="'+that.nonce+'" src="'+link_page+'/js/tabela/tabela.js"></script>';
								html = html + ' <script>'+js_page_speed+'</script>';
								html = html + ' </body></html>';

								var csvData = '\ufeff'+html;
								var blob = new Blob([ csvData ], {
									type : "text/html;charset=utf-8;"
								});

								var csvUrl = URL.createObjectURL(blob);
								that.LINK_HTML  = csvUrl;

								//that.exportHTML();
								//that.DADOS = [];

								that.DADOS_AGRUPAMENTO 		= [];
								that.DADOS_AGRUP_BKP 		= [];
								that.DADOS_RENDER 			= [];
								that.DADOS_RENDER_FILTRADOS	= [];
								that.COLUNAS_RESTAURADAS 	= [];
								that.COUNTER_RDZ 			= [];

								olt_html = '';
								html     = '';
						
								$(that.componente_frame).attr('src', csvUrl);

								$timeout.cancel(that.Time7);
								
							},300);
						}else{
							if(typeof that.onMergeEnd != 'undefined'){
								that.onMergeEnd();
							}
						}

						$timeout.cancel(that.Time6);
					},300);

                },
				GeraHtml : function(string, feed){
					return $sce.trustAsHtml(string);
				},
				MergeDados : function(origem,dados,agrup){
					var that = this;
					if(dados.length > 0){
						angular.forEach(origem, function(value_ds, chave_ds){
							var find = false;
							angular.forEach(dados, function(item, key){
								var i = true;
								if(find == false){
									angular.forEach(agrup, function(valor, chave){
										if(typeof item[valor] === 'undefined' || item[valor] != value_ds[valor]){
											i = false;
										}
									});
									if(i){
										value_ds = Object.assign(value_ds,item);
										find = true
									}
								}
							});
						});						
					}
					// console.log('saída merge dados', origem);
					return origem;
					
				},
				calcValor : function(campo, dados){
					
				},
				somar : function(number1, number2){
					number1 = typeof numeral(Number(number1)) != 'undefined' ? numeral(Number(number1)) : numeral(0);
					number2 = typeof numeral(Number(number2)) != 'undefined' ? numeral(Number(number2)) : numeral(0);
					return number1.add(number2.value()).value();
				},
				subtrair : function(number1, number2){
					number1 = typeof numeral(Number(number1)) != 'undefined' ? numeral(Number(number1)) : numeral(0);
					number2 = typeof numeral(Number(number2)) != 'undefined' ? numeral(Number(number2)) : numeral(0);
					return number1.subtract(number2.value()).value();
				},
				dividir : function(number1, number2){
					number1 = typeof numeral(Number(number1)) != 'undefined' ? numeral(Number(number1)) : numeral(0);
					number2 = typeof numeral(Number(number2)) != 'undefined' ? numeral(Number(number2)) : numeral(0);
					return number1.divide(number2.value()).value();
				},
				multiplicar : function(number1, number2){
					number1 = typeof numeral(Number(number1)) != 'undefined' ? numeral(Number(number1)) : numeral(0);
					number2 = typeof numeral(Number(number2)) != 'undefined' ? numeral(Number(number2)) : numeral(0);
					return number1.multiply(number2.value()).value();
				},
				getDadosRDZ : function(grupo,dados){
					var that = this;
					var ds = gcCollection.groupBy(dados, grupo.AGRUPAMENTO);

					grupo.TOTAL = [];

					angular.forEach(ds, function(item, key){
						item.TAB_GRUPO = 'item_'+that.ITENS_GROUP[that.COUNTER_RDZ].NIVEL+'_'+key;												
						angular.forEach(item.COLLECTION, function(valor, chave){

							if(typeof valor.NIVEL_XYZ == 'undefined'){
								valor.NIVEL  	  	= that.ITENS_GROUP[that.COUNTER_RDZ].NIVEL;
								valor.NIVEL_XYZ		= that.ITENS_GROUP[that.COUNTER_RDZ].NIVEL;
								valor.FIXO   	  	= that.ITENS_GROUP[that.COUNTER_RDZ].FIXO;
								valor.ABERTO 	  	= that.ITENS_GROUP[that.COUNTER_RDZ].ABERTO;
								valor.TOTAL_GRUPO 	= that.ITENS_GROUP[that.COUNTER_RDZ].TOTAL_GRUPO == true;

								valor.TAB_GRUPO_PAI = item.TAB_GRUPO;
							}
						});						
					});

					ds = that.MergeDados(ds,that.DADOS,grupo.AGRUPAMENTO);
					that.DADOS_AGRUP_BKP = ds;					
					that.COUNTER_RDZ = that.COUNTER_RDZ + 1;	
					
					if(grupo.TOTAL_GRUPO == true){
						console.log('Totalizar Grupo');
						angular.forEach(ds, function(item, key1){
							angular.forEach(item.COLLECTION , function(reg, key2){
								angular.forEach(grupo.CAMPOS , function(campo, key3){

									if(campo.TOTAL == true){

										if(campo.TOTAL_TIPO == 'maximo'){
											item['_TOT_'+campo.CAMPO] = typeof item['_TOT_'+campo.CAMPO] == 'undefined' ? -999999999999999 : item['_TOT_'+campo.CAMPO];
										}else{
											if(campo.TOTAL_TIPO == 'minimo'){
												item['_TOT_'+campo.CAMPO] = typeof item['_TOT_'+campo.CAMPO] == 'undefined' ? 999999999999999 : item['_TOT_'+campo.CAMPO];
											}else{
												if(campo.TOTAL_TIPO == 'media'){
													item['_A_'+campo.CAMPO] = typeof item['_A_'+campo.CAMPO] == 'undefined' ? 0 : item['_A_'+campo.CAMPO];
													item['_B_'+campo.CAMPO] = typeof item['_B_'+campo.CAMPO] == 'undefined' ? 0 : item['_B_'+campo.CAMPO];
												}else{
													item['_TOT_'+campo.CAMPO] = typeof item['_TOT_'+campo.CAMPO] == 'undefined' ? 0 : item['_TOT_'+campo.CAMPO];
												}
											}
										}

										item['_V_TOT_'+campo.CAMPO] = true;

										if(reg['_V_TOT_'+campo.CAMPO] == true){
											var vls = '';

											if((reg['_TOT_'+campo.CAMPO]+'').indexOf('.') > -1 && (reg['_TOT_'+campo.CAMPO]+'').indexOf(',') > -1){
												var vlsNoPoint 			= (reg['_TOT_'+campo.CAMPO]+'').replace('.','');
												var vlsVirguleToPoint 	= (vlsNoPoint+'').replace(',','.');
												vls 					= vlsVirguleToPoint;
											}else if((reg['_TOT_'+campo.CAMPO]+'').indexOf('.') > -1 && (reg['_TOT_'+campo.CAMPO]+'').indexOf(',') == -1){
												vls 					= reg['_TOT_'+campo.CAMPO];
											}else if((reg['_TOT_'+campo.CAMPO]+'').indexOf('.') == -1 && (reg['_TOT_'+campo.CAMPO]+'').indexOf(',') > -1){
												var vlsVirguleToPoint 	= (reg['_TOT_'+campo.CAMPO]+'').replace(',','.');
												vls 					= vlsVirguleToPoint;
											}else{
												if(isNaN(reg['_TOT_'+campo.CAMPO]) == false){
													vls 				= reg['_TOT_'+campo.CAMPO];
												}
											}

											var valor = Number(vls);
										}else{
											var vls = '';

											if((reg[campo.CAMPO]+'').indexOf('.') > -1 && (reg[campo.CAMPO]+'').indexOf(',') > -1){
												var vlsNoPoint 			= (reg[campo.CAMPO]+'').replace('.','');
												var vlsVirguleToPoint 	= (vlsNoPoint+'').replace(',','.');
												vls 					= vlsVirguleToPoint;
											}else if((reg[campo.CAMPO]+'').indexOf('.') > -1 && (reg[campo.CAMPO]+'').indexOf(',') == -1){
												vls 					= reg[campo.CAMPO];
											}else if((reg[campo.CAMPO]+'').indexOf('.') == -1 && (reg[campo.CAMPO]+'').indexOf(',') > -1){
												var vlsVirguleToPoint 	= (reg[campo.CAMPO]+'').replace(',','.');
												vls 					= vlsVirguleToPoint;
											}else{
												if(isNaN(reg[campo.CAMPO]) == false){
													vls 				= reg[campo.CAMPO];
												}
											}

											var valor = Number(vls);
										}

										if( isNaN(valor) 	){ valor = 0 };
										if( !isFinite(valor)){ valor = 0 };

										switch (campo.TOTAL_TIPO) {
											case 'titulo':												
												item['_TOT_'+campo.CAMPO] = 'TOTAL:';
											break;
											case 'contador':												
												item['_TOT_'+campo.CAMPO] =  that.somar(item['_TOT_'+campo.CAMPO],1);
											break;
											case 'contador2':
												if(valor > 0){
													item['_TOT_'+campo.CAMPO] =  that.somar(item['_TOT_'+campo.CAMPO],1);
												}
											break;
											case 'maximo':
												if(item['_TOT_'+campo.CAMPO] < valor){
													item['_TOT_'+campo.CAMPO] = valor;
												}
											break;
											case 'minimo':												
												if(item['_TOT_'+campo.CAMPO] > valor){
													item['_TOT_'+campo.CAMPO] = valor;
												}
											break;
											case 'media':												
												item['_A_'+campo.CAMPO] =  that.somar(item['_A_'+campo.CAMPO],valor);
												item['_B_'+campo.CAMPO] =  that.somar(item['_B_'+campo.CAMPO],1);
											break;
											default:
												item['_TOT_'+campo.CAMPO] = that.somar(item['_TOT_'+campo.CAMPO], valor);
											break;
										}
									}
								});
									
							});	
						});
					}

					if(grupo.TOTAL_GRUPO == true){
						angular.forEach(ds, function(item, key1){
							angular.forEach(item.COLLECTION , function(reg, key2){
								angular.forEach(grupo.CAMPOS , function(campo, key3){
									if(campo.TOTAL == true){
										switch (campo.TOTAL_TIPO) {
											case 'media':												
												item['_TOT_'+campo.CAMPO] = item['_B_'+campo.CAMPO] > 0 ? item['_A_'+campo.CAMPO] / item['_B_'+campo.CAMPO] : 0;
											break;
										}
									}
								});
									
							});	
						});
					}

					if(grupo.TOTAL_GRUPO == true){
						angular.forEach(ds, function(item, key1){
							angular.forEach(item.COLLECTION , function(reg, key2){
								angular.forEach(grupo.CAMPOS , function(campo, key3){

									if(campo.TOTAL == true){
										switch (campo.TOTAL_TIPO) {
											case 'formula':

												var formula = campo.FORMULA;
												
												angular.forEach(grupo.CAMPOS , function(camp, key3){
													if( item['_V_TOT_'+camp.CAMPO] == true){
														formula = (formula+'').replaceAll('#'+camp.CAMPO+'#', 'item[\'_TOT_'+camp.CAMPO+'\']');
													}else{
														formula = (formula+'').replaceAll('#'+camp.CAMPO+'#', 'item[\''+camp.CAMPO+'\']');
													}
												});

												try {
													var ret = eval(formula);
													ret = Number(ret);

													if(!isNaN(ret) && isNumber(ret) && isFinite(ret)){
														ret = Number(ret);
													}else{
														ret = 0;
													}
													
												} catch (error) {
													var ret = 0;
												}
												
												item['_TOT_'+campo.CAMPO] = ret;
											break;
										}
									}
								});
									
							});	
						});
					}

					if(typeof grupo.GRUPOS != 'undefined'){  
						that.getDadosRDZ(grupo.GRUPOS,that.DADOS_AGRUP_BKP);
					}					
				},
				getDadosRender: function(){
					var that = this;
					var agrup = that.InvertGroup();
					that.COUNTER_RDZ = 0;
					agrup = agrup.GRUPOS;
					var ds = angular.copy(that.DADOS);
					that.DADOS_AGRUP_BKP = ds;

					if(typeof that.ordenarTisch != 'undefined'){
						that.DADOS_AGRUP_BKP = that.ordenarTisch(that.DADOS_AGRUP_BKP);
					}

					that.getDadosRDZ(agrup.GRUPOS,that.DADOS_AGRUP_BKP);

					angular.forEach(that.DADOS_AGRUP_BKP, function(item, key){
						if(typeof item.NIVEL == 'undefined'){
							item.NIVEL  = that.ITENS_GROUP[(that.ITENS_GROUP.length)-1].NIVEL;
							item.FIXO   = that.ITENS_GROUP[(that.ITENS_GROUP.length)-1].FIXO;
							item.ABERTO = that.ITENS_GROUP[(that.ITENS_GROUP.length)-1].ABERTO;
						}
					});

					gcCollection.merge(that.DADOS_AGRUPAMENTO , that.DADOS_AGRUP_BKP, ['ID']);
					that.DADOS_RENDER = new Array(that.DADOS.length);
					that.DADOS_RENDER_FILTRADOS = that.DADOS_RENDER;

					console.log('compilar aqui');
				},
				ITENS_GROUP : [],
				COUNTER_RDZ : 0,
				InvertGroup: function(){
					var that = this;
					that.ITENS_GROUP = [];
					if(typeof that.GRUPOS != 'undefined'){
						that.PushGroup(that.GRUPOS);
					}
					that.ITENS_GROUP.reverse();
					var objeto = {};
					var obj_temp = {};
					angular.forEach(that.ITENS_GROUP, function(item, key){
						if(key == 0){
							objeto['GRUPOS'] = item;
							obj_temp = objeto['GRUPOS']; 
						}else{
							obj_temp['GRUPOS'] = item;
							obj_temp = obj_temp['GRUPOS']; 
							if(key == (that.ITENS_GROUP.length - 1)){
								obj_temp['GRUPOS'] = undefined;
							}
						}				
					});
					
					return objeto;
				},
				PushGroup: function(item){
					var that = this;
					var a = angular.copy(item);
						a.GRUPOS = {};
						that.ITENS_GROUP.push(a);						
					if(typeof item.GRUPOS != 'undefined'){
						that.PushGroup(item.GRUPOS);
					}				
				},
				PushGroupPrint: function(item){
					var that = this;
					var a = angular.copy(item);
						a.GRUPOS = {};
						that.COLUNAS_REC.push(a);						
					if(typeof item.GRUPOS != 'undefined'){
						that.PushGroupPrint(item.GRUPOS);
					}				
                },
                isMobile : function()
                {
                    var userAgent = navigator.userAgent.toLowerCase();
                    if( userAgent.search(/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i)!= -1 )
                        return true;
				},
				isMobileDevice : function(checkMediaMatch = false){
					var isMobile = (function (a) {
						var isMobile =
							/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
							a
							) ||
							/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
							a.substr(0, 4)
							);
						return isMobile;
					})(navigator.userAgent || navigator.vendor || window.opera);

					if(checkMediaMatch){
						return isMobile && window.matchMedia("only screen and (max-width: 767px)").matches;
					}
				  
					return isMobile;
				},
				getAccordion2 : function(html,grupos,ttitle, mdl, tmp_mdl, linha_visible){
					var that = this;					
					var grupo = '';
					
					for(var a = 0; a < grupos.NIVEL; a++){
						grupo = grupo +'.GRUPOS';					
					}

					var tipo_click = 'ng-dblclick';

					if(that.isMobile()){
						tipo_click = 'ng-click';
					}

					angular.forEach(mdl, function(item ,key){

						var tmp_item = tmp_mdl+'['+key+']';

						var tmp_html = '';
						tmp_html =  '<tr ng-keydown="'+that.model+'.atalho_enter('+that.model_selected+','+tmp_item+',$event)" ' + 'id="_item_tabela_'+grupos.NIVEL+'" '+
									'  '+tipo_click+'="'+that.model_selected+'.visualizar()" ng-click="'+that.model+'.getClickAccordion('+tmp_item+')" ng-focus="'+that.model_selected+'.SELECTED = '+tmp_item+' ;'+that.model+'.event_focus != undefined ? '+that.model+'.event_focus.function(item_'+grupos.NIVEL+',event) : \'\';" '+
									' tgp="'+item.TAB_GRUPO+'" fx="'+(grupos.FIXO ? '1' : '0')+'" ab="'+(grupos.ABERTO ? '1' : '0') +'" class="tlh lhn_'+grupos.NIVEL+' '+item.TAB_GRUPO_PAI+'" ng-class="{ \'selected\' : '+that.model_selected+'.SELECTED == '+tmp_item+' }" '+
									' style="'+grupos.STYLE+'" tabindex="0"> '+
									(that.getTD2(ttitle,2,grupos.NIVEL, item, mdl, tmp_item))
									+' </tr>';	

						try {
							html = html + tmp_html;
						} catch (error) {
							console.log(html);
						}

						that.LINHAS_GERADAS.push({
							tab_grupo 		: item.TAB_GRUPO,
							tab_grupo_pai 	: item.TAB_GRUPO_PAI,
							fixo			: grupos.FIXO,
							aberto 			: grupos.ABERTO,
							nivel 			: grupos.NIVEL,
							grupo 			: key,
							html            : tmp_html
						});

						if(typeof item.COLLECTION != 'undefined' && item.COLLECTION.length > 0){
							html = that.getAccordion2( html ,grupos.GRUPOS,ttitle, item.COLLECTION, tmp_item+'.COLLECTION', linha_visible + ' && '+tmp_item+'.ABERTO == true');
						}	

					});
					
					return html;
				},
				getAccordion : function(html,grupos,ttitle){
					var that = this;
					var grupo = '';
					var linha_visible = '';

					for(var a = 0; a < grupos.NIVEL; a++){
						grupo = grupo +'.GRUPOS';
						if(a > 0){
							linha_visible = linha_visible +'&& item_'+(a)+'.ABERTO == true';
						}
					}

					var temp_model = that.model+'.DADOS_AGRUPAMENTO';

					if(grupos.NIVEL > 1){
						temp_model = 'item_'+(grupos.NIVEL-1)+'.COLLECTION'
					}

					var tipo_click = 'ng-dblclick';

					if(that.isMobile()){
						tipo_click = 'ng-click';
					}

					var filtro_render = '';
					angular.forEach(that.FILTRO_RENDER, function(item, key){
						filtro_render = filtro_render + ' | '+item.FIND+': {model : '+item.MODEL+' ,fields : '+item.CAMPO+'} '
					});

					if(that.html_speed == true){

						var mdl = that.DADOS_AGRUPAMENTO;
						var tmp_mdl = that.model+'.DADOS_AGRUPAMENTO';

						that.LINHAS_GERADAS = [];
						html = that.getAccordion2( html ,grupos, ttitle, mdl, tmp_mdl, linha_visible);

					}else{
						var show_itens 	= 'ng-if="true '+linha_visible+'"';
						var showTr 		= '';

						if(typeof that.validar_visualizacao_accordion != 'undefined'){
							showTr = 'ng-if="'+that.model+'.visualizacaoAccordion('+that.model_selected+',item_'+grupos.NIVEL+', '+ grupos.NIVEL + ', $event) '+linha_visible+'"';
							show_itens = '';
						}

						//orderBy : '+that.model+'.ORDER_BY
						html = html + ' <tr '+showTr+' ng-keydown="'+that.model+'.atalho_enter('+that.model_selected+',item_'+grupos.NIVEL+',$event)"' + 'id="_item_tabela_{{'+grupos.NIVEL+'}}" ng-repeat-start="item_'+grupos.NIVEL+' in '+that.model+'.DADOS_RENDER_'+grupos.NIVEL+' = ( '+temp_model+' | orderBy2 : '+(typeof grupos.ORDER_BY != 'undefined' ? "{model :"+that.model+grupo+".ORDER_BY }" : '{model :'+that.model+'.ORDER_BY }')+' | find: {model : '+that.model+'.FILTRO ,fields : '+that.model+'.campos_filtro.length > 0 ? '+that.model+'.campos_filtro : \'all\'} '+filtro_render+') track by $index"'+
									' '+show_itens+' '+tipo_click+'="'+that.model_selected+'.visualizar()" ng-click="'+that.model+'.getClickAccordion(item_'+grupos.NIVEL+')" ng-focus="'+that.model_selected+'.SELECTED = item_'+grupos.NIVEL+' ;'+that.model+'.event_focus != undefined ? '+that.model+'.event_focus.function(item_'+grupos.NIVEL+',event) : \'\'; item.btn3_atalho = true;" ng-blur="item.btn3_atalho = false;" '+
									' tgp="{{item_'+grupos.NIVEL+'.TAB_GRUPO}}" fx="{{'+that.model+grupo+'.FIXO ? 1 : 0}}" ab="{{'+that.model+grupo+'.ABERTO ? 1 : 0}}" class="tlh lhn_'+grupos.NIVEL+' {{item_'+grupos.NIVEL+'.TAB_GRUPO_PAI}}" ng-class="{ \'selected\' : '+that.model_selected+'.SELECTED == item_'+grupos.NIVEL+' }" '+
									' style="{{'+that.model+grupo+'.STYLE}}" tabindex="0"> '+(that.getTD(ttitle,2,grupos.NIVEL))+' </tr>';	

						if(typeof grupos.GRUPOS != 'undefined'){
							html = html + that.getAccordion('',grupos.GRUPOS,ttitle);
						}
						
						html = html + '  <tr ng-repeat-end ng-if="false"></tr> ';

					}

					return html;
				},
				getClickAccordion: function(grupos){
					var that = this;
					//console.log(grupos);
					//item_'+grupos.NIVEL+'.ABERTO = !item_'+grupos.NIVEL+'.ABERTO
					if(typeof grupos.FIXO == 'undefined' || grupos.FIXO == false){
						if(grupos.ABERTO == true){
							grupos.ABERTO = false;
						}else{
							grupos.ABERTO = true;
						}
						return grupos.ABERTO;
					}else{
						// grupos.ABERTO = true
						return grupos.ABERTO;
					}
				},
				compileDropdownColunas: function(){
					var that = this;

					var dropdown_id      	= 'dropdownCompilado_' + that.tabela_id;
					var dropdown_menu_id 	= 'dropdownMenu_' + that.tabela_id;

					var rendered_li 		= '';

					angular.forEach(that.COLUNAS, (value, key) => {
						if(value.VISIBLE){
							rendered_li += `
								<li tabindex="0" 
									style="padding: 5px">
										<div style="display: flex; flex-direction: row; align-items: center; cursor: pointer">
											<input type="checkbox" ng-model="${that.model}.COLUNAS[${key}].VISIBLE" id="${that.tabela_id}_coluna_${key}" style="width: 25px; height: 25px">
											<label for="${that.tabela_id}_coluna_${key}" style="left: 5px; width: 100%">
												${value.DESCRICAO}
											</label>
										</div>
								</li>
							`;
						}
					})

					var render = `
						<div class="dropdown colunas-dropdown" id="${dropdown_id}" style="margin-top: 10px; margin-bottom: 10px" ng-show="${that.model}.HABILITA_COLUNAS_V_BTN">
							<a class="btn btn-primary dropdown-toggle" 
								ng-click="${that.model}.abrirDropdownColunas('${dropdown_id}')"
								role="button">
								<span class="fa fa-th-list"></span> Colunas
							</a>
							<ul class="dropdown-menu" 
								id="${dropdown_menu_id}"
								style="height: calc(var(--screen-height) - 500px); overflow-y: auto;">
								<li class="dropdown-header" style="text-transform: initial; font-weight: bold; text-align: center">Colunas Visíveis</li>
								${rendered_li}
							</ul>
						</div>
					`;

					return render;
				},
				abrirDropdownColunas: function(dropdown_id){

					var dropdown_id = '#' + dropdown_id;
					var dropdown_btn = dropdown_id + ' a';

					$(dropdown_btn).parent().toggleClass('open');

					$('body').on('click', function (e) {
						if (!$(dropdown_id).is(e.target) 
							&& $(dropdown_id).has(e.target).length === 0 
							&& $('.open').has(e.target).length === 0
						) {
							$(dropdown_id).removeClass('open');
						}
					});

				},
				setColunasVisiveisBtn: function(){
					var that = this;
					
					var container = $("#"+that.tabela_id); // Replace with your container's actual ID

					var hasHorizontalScroll = container.get(0).scrollWidth > container.innerWidth();
					var isMobile = that.isMobileDevice();
				
					if (hasHorizontalScroll && isMobile) {
						that.HABILITA_COLUNAS_V_BTN = true;
					} else {
						that.HABILITA_COLUNAS_V_BTN = false;
					}
				},
                getHtml : function(){
					var that = this;
					if(typeof that.total_visible != 'undefined' && that.total_visible == true){
						var totalizador = ' ng-change="'+that.model+'.TotalTabela()" >';
					}else{
						var totalizador = ' >';
					}
					
					if(typeof that.legendas != 'undefined'){
						var legendas = that.legendas;
					}else{
						var legendas = ' ';
					}
					var mousedown = '';
					var mousemove = '';
					var	mouseup   = '';

					if(typeof that.resizable != 'undefined' && that.resizable === true){
						mousedown = 'ng-mousedown ="'+that.model+'.Resize($event);     $event.stopPropagation();"';
						mousemove = 'ng-mousemove ="'+that.model+'.ResizeMove($event); $event.stopPropagation();"';
						mouseup   = 'ng-mouseup   ="'+that.model+'.ResizeUp($event);   $event.stopPropagation();"';
					}

					var coluna_input = '';
					var coluna_input_total = '';
					var texto_ttitle = '';
					that.COLUNAS_BKP_TOTAIS = [];

					function normalizeColunaDefaults(item){
						if(typeof item.SIZE 		== 'undefined'){ item.SIZE 			= 0; 		}
						if(typeof item.ALIGN 		== 'undefined'){ item.ALIGN 		= 'left'; 	}
						if(typeof item.STYLE 		== 'undefined'){ item.STYLE 		= ''; 		}
						if(typeof item.STYLE_TXT 	== 'undefined'){ item.STYLE_TXT 	= ''; 		}
						if(typeof item.STYLE_HEADER == 'undefined'){ item.STYLE_HEADER 	= ''; 		}
						if(typeof item.SIZE_CELL 	== 'undefined'){ item.SIZE_CELL 	= ''; 		}
						if(typeof item.STYLE_CELL 	== 'undefined'){ item.STYLE_CELL 	= ''; 		}
						if(typeof item.COLSPAN 		== 'undefined'){ item.COLSPAN 		= ''; 		}
						if(typeof item.ROWSPAN 		== 'undefined'){ item.ROWSPAN 		= ''; 		}
					}

					var cont_col = 1;
					if(that.cabecalho_print == true){
						cont_col = 0;
					}
					
					angular.forEach(that.COLUNAS, function(item, key){

						item.ORDEM = (item.ORDEM+'').padStart(3,'0');

						normalizeColunaDefaults(item);

						if(item.VISIBLE == true){
							cont_col = cont_col + 1;
						}

						item.COLID = cont_col;

						that.COLUNAS_BKP_TOTAIS[key] = item; 

						if(typeof item.TEXT != 'undefined'){
							if(item.TEXT.ttitle != '' && typeof item.TEXT.ttitle != 'undefined'){
								texto_ttitle = "ttitle="+'"'+item.TEXT.ttitle+'"';
							}
                        }

					});

					angular.forEach(that.COLUNAS2, function(item){
						normalizeColunaDefaults(item);
					});

					angular.forEach(that.COLUNAS_FUNC, function(item){
						normalizeColunaDefaults(item);
					});
					
					var nome_totalizador = Math.floor(Math.random() * 99999);
					
					if(that.input_visible === true && typeof that.input_visible != 'undefined'){
						coluna_input = 'class="no-print"';
						coluna_input_total = 'no-print';
					}

					var vs_scroll = '';
					var anchor = '';
					var listener = '';
					if(that.vs_scroll == true && typeof that.vs_scroll != 'undefined' && (that.loading_noscroll == false || typeof that.loading_noscroll == 'undefined')){
						vs_scroll = 'vs-repeat="" vs-scroll-parent=".table-ec"';
						anchor = 'overflow-anchor: none;';
						listener = 'ng-init="$last && '+that.model+'.print_end('+that.model+'._print)"';
					}

					var descricao_filtro = 'Filtragem rápida... <Ctrl+*>';

					if(typeof that.descricao_filtro != 'undefined' && that.descricao_filtro != ''){
						descricao_filtro = that.descricao_filtro;
					}

					var acoes_list = ''+
					' <ul class="dropdown-menu no-print" style="top: 21px;"> '+
					'		<li class="dropdown-header">Opções de Dados</li> '+
					'		<li> <a href="" ng-click="'+that.model+'.exportHtmlPDF()">Exportar para PDF</a> '+
					'		<a href="" ng-click="'+that.model+'.exportXls()">Exportar para XLS</a> '+
					'		<a href="" ng-click="'+that.model+'.exportCsv()">Exportar para CSV</a> '+
					'		<a href="" ng-if="'+that.model+'.impressao_inativa == false" ng-click="'+that.model+'.imprimir()">Imprimir</a> '+
					'		<a href="" ng-click="'+that.model+'.exportEmail()">Enviar por Email</a> '+
					'		<a href="" ng-if="'+that.model+'.infinite_scroll == true && '+that.model+'.habilita_botao_next == true" ng-click="'+that.model+'.NextPageAll()">Carregar Todos os registros</a> '+
					'		<a href="" ng-if="'+that.model+'.tipo_tabela != \'accordion\'" ng-click="'+that.model+'.openModalOPT();">Campos Visíveis</a> '+ 
					'		<a href="" name="mark_all_comp" ng-if="'+that.model+'.input_visible == true && '+that.model+'.linhas_marcadas == false && '+that.model+'.DADOS != \'undefined\' && '+that.model+'.DADOS.length > 0 && '+that.model+'.marcar_todos == true" ng-click="'+that.model+'.MarcarItens()">Marcar Todos</a> '+
					'		<a href="" name="mark_per_comp" ng-if="'+that.model+'.input_visible == true && '+that.model+'.marcar_perc_visible == true && '+that.model+'.DADOS != \'undefined\' && '+that.model+'.DADOS.length > 0 && '+that.model+'.marcar_todos == true" ng-click="'+that.model+'.MarcarItensPerc()">Marcar Pesonalizado</a> '+
					'		<a href="" ng-if="'+that.model+'.input_visible == true && '+that.model+'.linhas_marcadas == true && '+that.model+'.marcar_todos == true" ng-click="'+that.model+'.DesmarcarItens()">Desmarcar Todos</a> '+
					'		<a href="" ng-click="'+that.model+'.clearCache()">Limpar Cache</a> '+
					' </li> </ul> ';
				
					if(typeof that.status_opt != 'undefined'){
						var index123 = findInArrayByProp(that.status_opt,'DESCRICAO','TODOS');
						if(index123 == -1){
							that.status_opt.unshift({VALOR: '' , DESCRICAO: 'TODOS'});
						}
						that.status_opt_bkp = that.status_opt;
					}

					if(that.filtro_status_v == false){
						that.filtro_status_v2 = false;
					}

					if(typeof that.STATUS != 'undefined'){
						that.STATUS = '1';
					}

					var auxBtnExcluir = '';

					var width_filtro = 'calc(100%)';

					if(that.btn_excluir_filtro == true) {
						auxBtnExcluir = ' <span class="input-group-btn" style="margin-right: 14px !important;" ng-click="'+that.model+'.excluirFiltroTabela()" title="Apagar Filtro"> '+
										' 	<button class="btn btn-default" type="button" style="color: #D9534F;">X</button> ' +
										' </span> ';

						if(that.btn_filtrar_registros == true && that.filtro_visible == true){
							if(that.filtro_status_v == false){
								width_filtro = 'calc(100% - 125px)';
							}else{
								width_filtro = 'calc(100% - 250px)';
							}
						}else{
							width_filtro = 'calc(100% - 45px)';

						}
					}else{
						if(that.btn_filtrar_registros == true && that.filtro_visible == true){
							if(that.filtro_status_v == false){
								width_filtro = 'calc(100% - 90px)';
							}else{
								width_filtro = 'calc(100% - 215px)';
							}
						}

						if(typeof that.input_style_width != 'undefined'){
							width_filtro = that.input_style_width;
						}
					}

					
					var estilo_filtro_visible = '';

					if(typeof that.estilo_filtro_visible != ''){
						estilo_filtro_visible = that.estilo_filtro_visible;
					}


					let auxBtnFiltrarAll = '';
					if(that.btn_filtrar_registros == true && that.filtro_visible == true){

						if(typeof that.multithread_filter != 'undefined'){
							for(var indexzxy = 0; indexzxy < that.multithread_filter.length; indexzxy++) {
								if(typeof that.multithread_filter[indexzxy].TITULO != "undefined" && (typeof that.multithread_filter[indexzxy].VISIBLE == "undefined" || that.multithread_filter[indexzxy].VISIBLE == true)){
									that.THREAD_TITULO = true;
								}
							}
						}
						

						auxBtnFiltrarAll = '<button class="btn btn-primary" style="height: 34px !important; border-top-left-radius: 0px !important; border-bottom-left-radius: 0px !important; '+((that.THREAD_TITULO == true || typeof that.THREAD_TITULO != "undefined") ? 'margin-top: 25px !important' : 'margin-top: 0px !important')+'" ng-click="'+that.model_selected+'.consultar()" type="button" data-hotkey="alt+f"><span class="glyphicon glyphicon-filter"></span> &nbsp; Filtrar</button>';
					}
					
					var html = '';
					if(that.html_speed != true){
						if(typeof that.filtro_compilado == 'undefined'){

							html = ' <div ng-if="'+that.model+'.filtro_visible == true && '+that.model+'.barra_visible != true" class="form-group input-group filtro_visibleJS" style="margin-bottom: 4px; display: inline-flex; width: calc(100%); overflow-x: auto;">';
							if(typeof that.multithread_filter == 'undefined'){
								html = 	html+'	<select ng-keydown="$event.keyCode == 36 && $event.preventDefault()" style="margin-right: 8px !important; margin-top: 0px !important;" class="form-group" ng-if="'+that.model+'.filtro_status_v == true" ng-hide="'+that.model+'.filtro_status_v2 == false" ng-model="'+that.model+'.STATUS" ng-style="{color: {true: '+that.model+'.item_status.STYLE, false:\'rgb(0, 0, 0);\'}['+that.model+'.item_status.STYLE !== undefined]}" ng-change="'+that.model+'.filtroStatusOnChange();"> '+
											'		<option ng-keydown="$event.keyCode == 36 && $event.preventDefault()" ng-repeat="item in '+that.model+'.status_opt_bkp track by $index" ng-value="item.VALOR" ng-style="{color: {true: item.STYLE, false:\'rgb(0, 0, 0);\'}[item.STYLE !== undefined]}">{{item.DESCRICAO}}</option> '+
											'	</select> ';


	
								html = 	html+' <input type="text" style="border-radius: 5px; width: ' + width_filtro + '!important; border-top-right-radius: 0px !important; border-bottom-right-radius: 0px !important; '+estilo_filtro_visible+'" '+
								'   placeholder="'+descricao_filtro+'" class="form-control input-maior filtro_tabelaJS" '+
								'   ng-model="'+that.model+'.FILTRO" id="'+that.tabela_id+'_filtro_1" name="'+that.tabela_id+'_filtro_1" autocomplete="off" ng-change="'+that.model+'.filtroOnChange()"'+ totalizador + auxBtnExcluir + auxBtnFiltrarAll +
								' </div> ';

							}else{
								for(var indexzxy = 0; indexzxy < that.multithread_filter.length; indexzxy++) {
									that[that.multithread_filter[indexzxy].CAMPO] = '';
	
									if(typeof that.multithread_filter[indexzxy].TITULO != "undefined" && (typeof that.multithread_filter[indexzxy].VISIBLE == "undefined" || that.multithread_filter[indexzxy].VISIBLE == true)){
										that.THREAD_TITULO = true;
									}
								}
	
								html = 	html+'<div class="form-group" ng-if="thread.TITULO != undefined && (thread.VISIBLE == undefined || thread.VISIBLE == true)" ng-repeat="thread in '+that.model+'.multithread_filter track by $index" style="{{thread.STYLE}}">'+
											'	<label ng-hide="'+that.model+'.filtro_status_v2 == false" ng-if="'+that.model+'.filtro_status_v == true && (thread.VISIBLE == undefined || thread.VISIBLE == true)"> {{thread.TITULO}} </label>	'+
											'	<select ng-keydown="$event.keyCode == 36 && $event.preventDefault()" style="margin-right: 8px !important; margin-top: 0px !important;" class="form-group" ng-if="'+that.model+'.filtro_status_v == true && (thread.VISIBLE == undefined || thread.VISIBLE == true)" ng-hide="'+that.model+'.filtro_status_v2 == false" ng-model="'+that.model+'[thread.CAMPO]" ng-style="{color: {true: '+that.model+'.item_status.STYLE, false:\'rgb(0, 0, 0);\'}['+that.model+'.item_status.STYLE !== undefined]}" ng-change="'+that.model+'.filtroStatusOnChange();"> '+
											'		<option ng-keydown="$event.keyCode == 36 && $event.preventDefault()" ng-repeat="item in thread.FILTER track by $index" ng-value="item.VALOR" ng-style="{color: {true: item.STYLE, false:\'rgb(0, 0, 0);\'}[item.STYLE !== undefined]}">{{item.DESCRICAO}}</option> '+
											'	</select> '+
											' </div>';
	
								html = 	html+'	<select ng-keydown="$event.keyCode == 36 && $event.preventDefault()" ng-if="thread.TITULO == undefined && (thread.VISIBLE == undefined || thread.VISIBLE == true)" ng-repeat="thread in '+that.model+'.multithread_filter track by $index" style="margin-right: 8px !important; margin-top: '+((that.THREAD_TITULO == true || typeof that.THREAD_TITULO != "undefined") ? '25px !important' : '0px !important')+';" class="form-group" ng-if="'+that.model+'.filtro_status_v == true && (thread.VISIBLE == undefined || thread.VISIBLE == true)" ng-hide="'+that.model+'.filtro_status_v2 == false" ng-model="'+that.model+'[thread.CAMPO]" ng-style="{color: {true: '+that.model+'.item_status.STYLE, false:\'rgb(0, 0, 0);\'}['+that.model+'.item_status.STYLE !== undefined]}" ng-change="'+that.model+'.filtroStatusOnChange();"> '+
											'		<option ng-keydown="$event.keyCode == 36 && $event.preventDefault()" ng-repeat="item in thread.FILTER track by $index" ng-value="item.VALOR" ng-style="{color: {true: item.STYLE, false:\'rgb(0, 0, 0);\'}[item.STYLE !== undefined]}">{{item.DESCRICAO}}</option> '+
											'	</select> ';
	
								html = 	html+' <input type="text" style="border-radius: 5px; width: ' + width_filtro + '!important; border-top-right-radius: 0px !important; border-bottom-right-radius: 0px !important; margin-top: '+((that.THREAD_TITULO == true || typeof that.THREAD_TITULO != "undefined") ? '25px' : '0px')+'; '+estilo_filtro_visible+'" '+
								'   placeholder="'+descricao_filtro+'" id="'+that.tabela_id+'_filtro_2" name="'+that.tabela_id+'_filtro_2" autocomplete="off" class="form-control input-maior filtro_tabelaJS" '+
								'   ng-model="'+that.model+'.FILTRO" ng-change="'+that.model+'.filtroOnChange()"'+ totalizador + auxBtnExcluir + auxBtnFiltrarAll +
								' </div> ';
							}

						}else{
							html = html+trim_null(that.filtro_compilado());
						}
					}					


					let auxBtnFiltrarTudo = ' <span class="input-group-btn" ng-click="'+that.model+'.consultar()" title="Filtrar registros"> '+
									' 	<button class="btn btn-default" type="button" style="color: #D9534F;">X</button> ' +
									' </span> ';
									
					html = html+(that.html_speed == true ? '' : 					
					' <div style="zoom: 0.9; width: calc(100% - 4px);" ng-if="'+that.model+'.barra_visible == true && '+that.model+'.ocultar_barra != true" class="form-group input-group" style="margin-bottom: 4px; display: flex;">'+
					'   <input type="text" style="border-radius: 5px; width: ' + width_filtro + '!important; border-top-right-radius: 0px !important; border-bottom-right-radius: 0px !important; '+estilo_filtro_visible+'" '+
					'   	placeholder="'+descricao_filtro+'" id="'+that.tabela_id+'_filtro_3" name="'+that.tabela_id+'_filtro_3" autocomplete="off" class="form-control input-maior filtro_tabelaJS" '+
					'   	ng-model="'+that.model+'.FILTRO" ng-change="'+that.model+'.filtroOnChange()"'+ totalizador + acoes_list + auxBtnExcluir + auxBtnFiltrarTudo +
					' </div>');

					if(!!$('#app_debug').val() !== true){

						var scrollDownFn 	= that.fix_infinite_scroll === true ? `on-scroll-down-fixed=${that.model}.onScrollDown()` : `on-scroll-down=${that.model}.onScrollDown()`;
						var scrollBottomFn 	= that.fix_infinite_scroll === true ? `on-scroll-to-bottom-fixed=${that.model}.onScrollEnd()` : `on-scroll-to-bottom=${that.model}.onScrollEnd()`;

						html += '<div ng-check-visibility on-visibility-change="'+that.model+'.checkTableVisibility(visible)" id="'+that.tabela_id+'" class="table-ec table-scroll" '+ scrollDownFn +' on-scroll-up="'+that.model+'.onScrollUP()" '+ scrollBottomFn +' style="{{'+that.model+'.STYLE_TABELA}} height: {{'+that.model+'.HEIGHT}}; min-height: {{'+that.model+'.MIN_HEIGHT}}; max-height: {{'+that.model+'.MAX_HEIGHT != undefined ? '+that.model+'.MAX_HEIGHT : \'\' }}; width: {{'+that.model+'.WIDTH}};'+anchor+'">';

					} else {

						var scrollDownFn 	= that.fix_infinite_scroll === true ? `on-scroll-down-fixed=${that.model}.onScrollDown()` : `on-scroll-down=${that.model}.onScrollDown()`;
						var scrollBottomFn 	= that.fix_infinite_scroll === true ? `on-scroll-to-bottom-fixed=${that.model}.onScrollEnd()` : `on-scroll-to-bottom=${that.model}.onScrollEnd()`;

						html +='<div id="'+that.tabela_id+'" class="table-ec table-scroll" '+ scrollDownFn +' on-scroll-up="'+that.model+'.onScrollUP()" '+ scrollBottomFn +' style="{{'+that.model+'.STYLE_TABELA}} height: {{'+that.model+'.HEIGHT}}; min-height: {{'+that.model+'.MIN_HEIGHT}}; max-height: {{'+that.model+'.MAX_HEIGHT != undefined ? '+that.model+'.MAX_HEIGHT : \'\' }}; width: {{'+that.model+'.WIDTH}};'+anchor+'">';

					}

					if((typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado') && that.infinite_scroll == true){
						html += ' <div ng-show="'+that.model+'.consultando" class="no-print div-carregando-tabela_ls" style="position: absolute; opacity: 0.75; width: 100%; height: calc(100% - 150px); z-index: 10; background-color: rgb(255, 255, 255);">';
						html += ' 	<img style="width: 120px; height: 120px; top: calc(50% - 60px); left: calc(50% - 60px); position: relative;"';
						html += ' src="'+urlhost+'/assets/images/loading.gif"/> </div>';
					}

					var check_tab_enter = 'tab_enter';
					if(that.disabled_tab_enter == true){
						check_tab_enter = 'notClick';
					}

                    html = html+'    <table style="text-rendering: optimizeSpeed !important;" id="'+that.tabela_id+'_tabela" class="table table-striped '+ check_tab_enter +' table-bordered table-condensed table-no-break table-middle table-low tabelaJS">'+
								'      	<thead> ';

					var rowspan		= that.COLUNAS2.length > 0 ? 'rowspan="2"' : '';

					var cabeca1 =' <tr gc-order-by="'+that.model+'.ORDER_BY"><th '+coluna_input+' style="overflow: inherit; width: 20px;" '+rowspan+'>'; 
					var cabeca2 =' <tr gc-order-by="'+that.model+'.ORDER_BY" style=" border: 1px solid; height: 25px; zoom: 0.75;" class="no-print"><th '+coluna_input+' style="overflow: inherit; width: 20px; background-color: #ffffff; padding: 0px;"><span style="color: black; font-size: 23px; margin: 3px; cursor: pointer;" class="glyphicon glyphicon-resize-full expandir_grupos" aria-hidden="true"  title="Recolher Grupos"></span><span style="color: black; font-size: 23px; margin: 3px; cursor: pointer; display : none;" title="Expandir Grupos" class="glyphicon glyphicon-resize-small recolher_grupos" aria-hidden="true"></span> <span id="exibir_valor_grupo" style="float: left; color: #000; margin: -30px 0px 0px 3px; font-weight: bold;"></span> </th>'; 
					var cabeca3 =' <tr gc-order-by="'+that.model+'.ORDER_BY">';
					var cabeca4 =' <tr gc-order-by="'+that.model+'.ORDER_BY">';
					
					cabeca1 = cabeca1 +	(that.html_speed == true ? '' :
								'			<div class="dropdown acoes" '+
								'				 style="text-align: center;">   '+
								'				<span title="Ações disponíveis" class="toggle glyphicon glyphicon-cog" '+
								'					  data-toggle="dropdown" ng-click="'+that.model+'.fixed_menu($event)" style="font-size: 14pt;" aria-expanded="false"> '+
								'				</span>'+acoes_list+
								'				</div> ') +
								'			</th> ';

								if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' || that.tipo_tabela == 'compilado'){

									that.COLUNAS = sort_by_key(that.COLUNAS, 'ORDEM');
									
									var cont_col = 0;

									angular.forEach(that.COLUNAS_FUNC, function(coluna, key){

										if(coluna.VISIBLE == true){
											cont_col = cont_col + 1;
										}

										var titulo1 = coluna.TTITLE_SPN != '' && coluna.TTITLE_SPN != undefined ? ' ttitle="' + coluna.TTITLE_SPN + '" ' : '';
										var titulo2 = coluna.ATITLE_SPN != '' && coluna.ATITLE_SPN != undefined ? ' atitle="' + coluna.ATITLE_SPN + '" ' : '';
										var titulo3 = coluna.BTITLE_SPN != '' && coluna.BTITLE_SPN != undefined ? ' btitle="' + coluna.BTITLE_SPN + '" ' : '';

										var ttitulo1 = coluna.TTITLE != '' && coluna.TTITLE != undefined ? ' ttitle="' + coluna.TTITLE + '" ' : '';
										var ttitulo2 = coluna.ATITLE != '' && coluna.ATITLE != undefined ? ' atitle="' + coluna.ATITLE + '" ' : '';
										var ttitulo3 = coluna.BTITLE != '' && coluna.BTITLE != undefined ? ' btitle="' + coluna.BTITLE + '" ' : '';
										var colspan  = coluna.COLSPAN != '' && coluna.COLSPAN != undefined ? ' colspan="' + coluna.COLSPAN + '" ' : '';
										var rowspan  = coluna.ROWSPAN != '' && coluna.ROWSPAN != undefined ? ' rowspan="' + coluna.ROWSPAN + '" ' : '';

										var col = ''+that.model+'.COLUNAS_FUNC['+key+']';

										cabeca4 = cabeca4 + ' <th id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" data-title="{{'+col+'.DATA_TITLE}}" ng-attr-title="{{'+col+'.NTITLE}}" '+colspan+' '+rowspan+' '+mousedown+' '+mousemove+' '+mouseup+' ' + ttitulo1 + ttitulo2 + ttitulo3 +
												'	class="colid_'+cont_col+'" ng-class="{\'no-print\': '+col+'.TIPO == \'btn-danger\' || '+col+'.TIPO == \'btn\' || '+col+'.TIPO == \'btn2\' || '+col+'.TIPO == \'btn3\'}"'+
												' 	ng-if="'+col+'.VISIBLE == true && ('+col+'.HIDDEN == false || '+col+'.HIDDEN == undefined)" style="'+(that.position_colunas_func == 'after' ? 'top: 30px !important;' : 'top: 0px !important;')+' text-align: {{'+col+'.ALIGN}}; {{'+col+'.SIZE_CELL.trim().length > 0 ? \'min-width:\'+'+col+'.SIZE_CELL+\'; max-width:\'+'+col+'.SIZE_CELL+\';\' : \'\'}} {{'+col+'.SIZE != \'0\' ? \'width:\'+'+col+'.SIZE+\';\' : \'\'}} {{ (\'\'+'+col+'.STYLE.trim()).length > 0 ? '+col+'.STYLE : \'\'}} {{ (\'\'+'+col+'.STYLE_HEADER != undefined && \'\'+'+col+'.STYLE_HEADER.trim()).length > 0 ? '+col+'.STYLE_HEADER : \'\'}} " field="'+coluna.CAMPO_FILTRO+'"> '+
												' 	<span  '+ titulo1 + titulo2 + titulo3 +
												' 	style="display: inline-flex;{{'+col+'.STYLE_TXT}}"> '+coluna.HTML+' <span style="margin-left: 5px ;margin-right: -5px;" ng-if="'+that.model+'.ORDER_BY == '+col+'.CAMPO || '+that.model+'.ORDER_BY == '+col+'.CAMPO_FILTRO" class="glyphicon glyphicon-sort-by-attributes"></span><span style="margin-left: 5px; float: right;margin-right: -5px;" '+
												' 	ng-if="'+that.model+'.ORDER_BY == \'-\'+'+col+'.CAMPO || '+that.model+'.ORDER_BY == \'-\'+'+col+'.CAMPO_FILTRO" class="glyphicon glyphicon-sort-by-attributes-alt"></span></span></th>'; 
								
									});

									var cont_col = 0;

									angular.forEach(that.COLUNAS, function(coluna, key){

										if(coluna.VISIBLE == true){
											cont_col = cont_col + 1;
										}

										var titulo1 = coluna.TTITLE_SPN != '' && coluna.TTITLE_SPN != undefined ? ' ttitle="' + coluna.TTITLE_SPN + '" ' : '';
										var titulo2 = coluna.ATITLE_SPN != '' && coluna.ATITLE_SPN != undefined ? ' atitle="' + coluna.ATITLE_SPN + '" ' : '';
										var titulo3 = coluna.BTITLE_SPN != '' && coluna.BTITLE_SPN != undefined ? ' btitle="' + coluna.BTITLE_SPN + '" ' : '';

										var ttitulo1 = coluna.TTITLE != '' && coluna.TTITLE != undefined ? ' ttitle="' + coluna.TTITLE + '" ' : '';
										var ttitulo2 = coluna.ATITLE != '' && coluna.ATITLE != undefined ? ' atitle="' + coluna.ATITLE + '" ' : '';
										var ttitulo3 = coluna.BTITLE != '' && coluna.BTITLE != undefined ? ' btitle="' + coluna.BTITLE + '" ' : '';
										var colspan  = coluna.COLSPAN != '' && coluna.COLSPAN != undefined ? ' colspan="' + coluna.COLSPAN + '" ' : '';
										var rowspan  = coluna.ROWSPAN != '' && coluna.ROWSPAN != undefined ? ' rowspan="' + coluna.ROWSPAN + '" ' : '';

										var col = ''+that.model+'.COLUNAS['+key+']';

										cabeca1 = cabeca1 + ' <th id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" data-title="{{'+col+'.DATA_TITLE}}" ng-attr-title="{{'+col+'.NTITLE}}" '+colspan+' '+rowspan+' '+mousedown+' '+mousemove+' '+mouseup+' ' + ttitulo1 + ttitulo2 + ttitulo3 +
									 			'	class="colid_'+cont_col+'" ng-class="{\'no-print\': '+col+'.TIPO == \'btn-danger\' || '+col+'.TIPO == \'btn\' || '+col+'.TIPO == \'btn2\' || '+col+'.TIPO == \'btn3\'}" ng-click="'+col+'.CAMPO_FILTRO != undefined ? '+that.model+'.FiltrarTabela('+col+'.CAMPO_FILTRO,$event) : '+that.model+'.FiltrarTabela('+col+'.CAMPO,$event)" '+
									 			' 	ng-if="'+col+'.VISIBLE == true && ('+col+'.HIDDEN == false || '+col+'.HIDDEN == undefined)" style="text-align: {{'+col+'.ALIGN}}; {{'+col+'.SIZE_CELL.trim().length > 0 ? \'min-width:\'+'+col+'.SIZE_CELL+\'; max-width:\'+'+col+'.SIZE_CELL+\';\' : \'\'}} {{'+col+'.SIZE != \'0\' ? \'width:\'+'+col+'.SIZE+\';\' : \'\'}} {{ (\'\'+'+col+'.STYLE.trim()).length > 0 ? '+col+'.STYLE : \'\'}} {{ (\'\'+'+col+'.STYLE_HEADER != undefined && \'\'+'+col+'.STYLE_HEADER.trim()).length > 0 ? '+col+'.STYLE_HEADER : \'\'}} " field="'+coluna.CAMPO_FILTRO+'"> '+
												' 	<span  '+ titulo1 + titulo2 + titulo3 +
												' 	style="display: inline-flex;{{'+col+'.STYLE_TXT}}">{{ '+col+'.DESCRICAO }}<span style="margin-left: 5px ;margin-right: -5px;" ng-if="'+that.model+'.ORDER_BY == '+col+'.CAMPO || '+that.model+'.ORDER_BY == '+col+'.CAMPO_FILTRO" class="glyphicon glyphicon-sort-by-attributes"></span>'+
												(typeof coluna.HTML_HEADER != 'undefined' ? coluna.HTML_HEADER : '')+
												' 	<span style="margin-left: 5px; float: right;margin-right: -5px;" '+
												' 	ng-if="'+that.model+'.ORDER_BY == \'-\'+'+col+'.CAMPO || '+that.model+'.ORDER_BY == \'-\'+'+col+'.CAMPO_FILTRO" class="glyphicon glyphicon-sort-by-attributes-alt"></span></span></th>'; 
								
										cabeca2 = cabeca2 + ' <th ng-if="'+col+'.VISIBLE == true && ('+col+'.HIDDEN == false || '+col+'.HIDDEN == undefined)" style="height: 25px; padding: 6px 2px 0px; background-color: #ffffff; {{'+col+'.SIZE_CELL.trim().length > 0 ? \'min-width:\'+'+col+'.SIZE_CELL+\'; max-width:\'+'+col+'.SIZE_CELL+\';\' : \'\'}} {{'+col+'.SIZE != \'0\' ? \'width:\'+'+col+'.SIZE+\';\' : \'\'}} {{ (\'\'+'+col+'.STYLE.trim()).length > 0 ? '+col+'.STYLE : \'\'}} {{ (\'\'+'+col+'.STYLE_HEADER != undefined && \'\'+'+col+'.STYLE_HEADER.trim()).length > 0 ? '+col+'.STYLE_HEADER : \'\'}} " field="'+coluna.CAMPO_FILTRO+'"> <input colid="'+cont_col+'" field="'+coluna.CAMPO_FILTRO+'" class="imput_coluna"  style="width: 100%; min-width: 20px; height: 20px;" type="checkbox" checked="true"></input></th>'; 

									});

									var cont_col = 0;						
										
									angular.forEach(that.COLUNAS2, function(coluna, key){

										if(coluna.VISIBLE == true){
											cont_col = cont_col + 1;
										}

										var titulo1 = coluna.TTITLE_SPN != '' && coluna.TTITLE_SPN != undefined ? ' ttitle="' + coluna.TTITLE_SPN + '" ' : '';
										var titulo2 = coluna.ATITLE_SPN != '' && coluna.ATITLE_SPN != undefined ? ' atitle="' + coluna.ATITLE_SPN + '" ' : '';
										var titulo3 = coluna.BTITLE_SPN != '' && coluna.BTITLE_SPN != undefined ? ' btitle="' + coluna.BTITLE_SPN + '" ' : '';

										var ttitulo1 = coluna.TTITLE != '' && coluna.TTITLE != undefined ? ' ttitle="' + coluna.TTITLE + '" ' : '';
										var ttitulo2 = coluna.ATITLE != '' && coluna.ATITLE != undefined ? ' atitle="' + coluna.ATITLE + '" ' : '';
										var ttitulo3 = coluna.BTITLE != '' && coluna.BTITLE != undefined ? ' btitle="' + coluna.BTITLE + '" ' : '';
										var colspan  = coluna.COLSPAN != '' && coluna.COLSPAN != undefined ? ' colspan="' + coluna.COLSPAN + '" ' : '';
										var rowspan  = coluna.ROWSPAN != '' && coluna.ROWSPAN != undefined ? ' rowspan="' + coluna.ROWSPAN + '" ' : '';

										var col = ''+that.model+'.COLUNAS2['+key+']';

										cabeca3 = cabeca3 + ' <th id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" data-title="{{'+col+'.DATA_TITLE}}" ng-attr-title="{{'+col+'.NTITLE}}" '+colspan+' '+rowspan+' '+mousedown+' '+mousemove+' '+mouseup+' ' + ttitulo1 + ttitulo2 + ttitulo3 +
												'	class="colid_'+cont_col+'" ng-class="{\'no-print\': '+col+'.TIPO == \'btn-danger\' || '+col+'.TIPO == \'btn\' || '+col+'.TIPO == \'btn2\' || '+col+'.TIPO == \'btn3\'}" ng-click="'+col+'.CAMPO_FILTRO != undefined ? '+that.model+'.FiltrarTabela('+col+'.CAMPO_FILTRO,$event) : '+that.model+'.FiltrarTabela('+col+'.CAMPO,$event)" '+
												' 	ng-if="'+col+'.VISIBLE == true && ('+col+'.HIDDEN == false || '+col+'.HIDDEN == undefined)" style="'+(that.position_colunas2 == 'after' ? 'top: 30px !important;' : 'top: 0px !important;')+' text-align: {{'+col+'.ALIGN}}; {{'+col+'.SIZE_CELL.trim().length > 0 ? \'min-width:\'+'+col+'.SIZE_CELL+\'; max-width:\'+'+col+'.SIZE_CELL+\';\' : \'\'}} {{'+col+'.SIZE != \'0\' ? \'width:\'+'+col+'.SIZE+\';\' : \'\'}} {{ (\'\'+'+col+'.STYLE.trim()).length > 0 ? '+col+'.STYLE : \'\'}} {{ (\'\'+'+col+'.STYLE_HEADER != undefined && \'\'+'+col+'.STYLE_HEADER.trim()).length > 0 ? '+col+'.STYLE_HEADER : \'\'}} " field="'+coluna.CAMPO_FILTRO+'"> '+
												' 	<span  '+ titulo1 + titulo2 + titulo3 +
												' 	style="display: inline-flex;{{'+col+'.STYLE_TXT}}">{{ '+col+'.DESCRICAO }}<span style="margin-left: 5px ;margin-right: -5px;" ng-if="'+that.model+'.ORDER_BY == '+col+'.CAMPO || '+that.model+'.ORDER_BY == '+col+'.CAMPO_FILTRO" class="glyphicon glyphicon-sort-by-attributes"></span><span style="margin-left: 5px; float: right;margin-right: -5px;" '+
												' 	ng-if="'+that.model+'.ORDER_BY == \'-\'+'+col+'.CAMPO || '+that.model+'.ORDER_BY == \'-\'+'+col+'.CAMPO_FILTRO" class="glyphicon glyphicon-sort-by-attributes-alt"></span></span></th>'; 
								
									});									

								}else{
									
									that.COLUNAS = sort_by_key(that.COLUNAS, 'ORDEM');

									var cont_col = 1;

									angular.forEach(that.COLUNAS, function(coluna, key){

										if(coluna.VISIBLE == true){
											cont_col = cont_col + 1;

											var col = ''+that.model+'.COLUNAS['+key+']';
											var coluna_style = typeof coluna.STYLE != 'undefined' ? coluna.STYLE : '';
											var coluna_style_txt = typeof coluna.STYLE_TXT != 'undefined' ? coluna.STYLE_TXT : '';
											var coluna_size_cell = typeof coluna.SIZE_CELL != 'undefined' ? coluna.SIZE_CELL : '';

											var ttitulo1 = coluna.TTITLE != '' && coluna.TTITLE != undefined ? ' ttitle="' + coluna.TTITLE + '" ' : '';

											var classe = coluna.TIPO == 'btn' || coluna.TIPO == 'btn2' || coluna.TIPO == 'btn3' || coluna.TIPO == 'btn-danger' || coluna.TIPO == 'btn-primary' || coluna.TIPO == 'btn-success' || coluna.TIPO == 'btn-warning' || coluna.TIPO == 'btn-info' ? 'no-print' : '';

											var style  = 'style="height: 25px; padding: 6px 2px 0px; background-color: #ffffff; '+(coluna.SIZE != '0' ? 'width:'+coluna.SIZE+';' : '') + ' '+((''+coluna_size_cell).trim().length > 1 ? 'min-width:'+coluna_size_cell+';max-width:'+coluna_size_cell+';' : '') +' '+((''+coluna_style).trim().length > 0 ? coluna_style : '')+'"';
											var style2 = 'style="text-align: '+coluna.ALIGN+'; '+(coluna.SIZE != '0' ? 'width:'+coluna.SIZE+';' : '')+' '+((coluna_size_cell+'').trim().length > 1 ? 'min-width:'+coluna_size_cell+';max-width:'+coluna_size_cell+';' : '')+((''+coluna_style).trim().length > 0 ? coluna_style : '')+'"';
											var colspan  = coluna.COLSPAN != '' && coluna.COLSPAN != undefined ? ' colspan="' + coluna.COLSPAN + '" ' : '';
											var rowspan  = coluna.ROWSPAN != '' && coluna.ROWSPAN != undefined ? ' rowspan="' + coluna.ROWSPAN + '" ' : '';

											cabeca1 = cabeca1+' <th id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" '+colspan+' '+rowspan+' '+mousedown+' '+mousemove+' '+mouseup+' class="colid_'+cont_col+' '+classe+'" '+ ttitulo1 + ' ng-if="'+col+'.VISIBLE == true && ('+col+'.HIDDEN == false || '+col+'.HIDDEN == undefined)" '+style2+' field="'+coluna.CAMPO_FILTRO+'"> <span style="display: inline-flex;'+coluna_style_txt+'">'+coluna.DESCRICAO +'</span>'+ (typeof coluna.HTML_HEADER2 != 'undefined' ? coluna.HTML_HEADER2 : '') +'</th>'; 
											cabeca2 = cabeca2+' <th '+colspan+' '+rowspan+' ng-if="'+col+'.VISIBLE == true && ('+col+'.HIDDEN == false || '+col+'.HIDDEN == undefined)" class="'+classe+'" '+style+' field="{{ '+col+'.CAMPO }}"> <input colid="'+cont_col+'" class="imput_coluna" field="'+coluna.CAMPO_FILTRO+'" style="width: 100%; min-width: 20px; height: 20px;" type="checkbox" checked="true"></input></th>'; 
										}
									});

									that.COLUNAS2 = sort_by_key(that.COLUNAS2, 'ORDEM');

									var cont_col = 1;

									angular.forEach(that.COLUNAS2, function(coluna, key){

										if(coluna.VISIBLE == true){
											cont_col = cont_col + 1;

											var col = ''+that.model+'.COLUNAS2['+key+']';
											var coluna_style = typeof coluna.STYLE != 'undefined' ? coluna.STYLE : '';
											var coluna_style_txt = typeof coluna.STYLE_TXT != 'undefined' ? coluna.STYLE_TXT : '';
											var coluna_size_cell = typeof coluna.SIZE_CELL != 'undefined' ? coluna.SIZE_CELL : '';

											var ttitulo1 = coluna.TTITLE != '' && coluna.TTITLE != undefined ? ' ttitle="' + coluna.TTITLE + '" ' : '';

											var classe = coluna.TIPO == 'btn' || coluna.TIPO == 'btn2' || coluna.TIPO == 'btn3' || coluna.TIPO == 'btn-danger' || coluna.TIPO == 'btn-primary' || coluna.TIPO == 'btn-success' || coluna.TIPO == 'btn-warning' || coluna.TIPO == 'btn-info' ? 'no-print' : '';

											var style  = 'style="height: 25px; padding: 6px 2px 0px; background-color: #ffffff; '+(coluna.SIZE != '0' ? 'width:'+coluna.SIZE+';' : '') + ' '+((''+coluna_size_cell).trim().length > 1 ? 'min-width:'+coluna_size_cell+';max-width:'+coluna_size_cell+';' : '') +' '+((''+coluna_style).trim().length > 0 ? coluna_style : '')+'"';
											var style2 = 'style="'+(that.position_colunas2 == 'after' ? 'top: 30px !important;' : 'top: 0px !important;')+' text-align: '+coluna.ALIGN+'; '+(coluna.SIZE != '0' ? 'width:'+coluna.SIZE+';' : '')+' '+((coluna_size_cell+'').trim().length > 1 ? 'min-width:'+coluna_size_cell+';max-width:'+coluna_size_cell+';' : '')+((''+coluna_style).trim().length > 0 ? coluna_style : '')+'"';
											var colspan  = coluna.COLSPAN != '' && coluna.COLSPAN != undefined ? ' colspan="' + coluna.COLSPAN + '" ' : '';
											var rowspan  = coluna.ROWSPAN != '' && coluna.ROWSPAN != undefined ? ' rowspan="' + coluna.ROWSPAN + '" ' : '';

											cabeca3 = cabeca3+' <th id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" '+colspan+' '+rowspan+' '+mousedown+' '+mousemove+' '+mouseup+' class="colid_'+cont_col+' '+classe+'" '+ ttitulo1 + ' ng-if="'+col+'.VISIBLE == true && ('+col+'.HIDDEN == false || '+col+'.HIDDEN == undefined)" '+style2+' field="'+coluna.CAMPO_FILTRO+'"> <span style="display: inline-flex;'+coluna_style_txt+'">'+coluna.DESCRICAO +'</span>'+ (typeof coluna.HTML_HEADER2 != 'undefined' ? coluna.HTML_HEADER2 : '') +'</th>'; 
										}
									});

									that.COLUNAS_FUNC = sort_by_key(that.COLUNAS_FUNC, 'ORDEM');

									var cont_col = 1;

									angular.forEach(that.COLUNAS_FUNC, function(coluna, key){

										if(coluna.VISIBLE == true){
											cont_col = cont_col + 1;

											var col = ''+that.model+'.COLUNAS_FUNC['+key+']';
											var coluna_style = typeof coluna.STYLE != 'undefined' ? coluna.STYLE : '';
											var coluna_size_cell = typeof coluna.SIZE_CELL != 'undefined' ? coluna.SIZE_CELL : '';

											var ttitulo1 = coluna.TTITLE != '' && coluna.TTITLE != undefined ? ' ttitle="' + coluna.TTITLE + '" ' : '';

											var classe = coluna.TIPO == 'btn' || coluna.TIPO == 'btn2' || coluna.TIPO == 'btn3' || coluna.TIPO == 'btn-danger' || coluna.TIPO == 'btn-primary' || coluna.TIPO == 'btn-success' || coluna.TIPO == 'btn-warning' || coluna.TIPO == 'btn-info' ? 'no-print' : '';

											var style  = 'style="height: 25px; padding: 6px 2px 0px; background-color: #ffffff; '+(coluna.SIZE != '0' ? 'width:'+coluna.SIZE+';' : '') + ' '+((''+coluna_size_cell).trim().length > 1 ? 'min-width:'+coluna_size_cell+';max-width:'+coluna_size_cell+';' : '') +' '+((''+coluna_style).trim().length > 0 ? coluna_style : '')+'"';
											var style2 = 'style="'+(that.position_colunas_func == 'after' ? 'top: 30px !important;' : 'top: 0px !important;')+' text-align: '+coluna.ALIGN+'; '+(coluna.SIZE != '0' ? 'width:'+coluna.SIZE+';' : '')+' '+((coluna_size_cell+'').trim().length > 1 ? 'min-width:'+coluna_size_cell+';max-width:'+coluna_size_cell+';' : '')+((''+coluna_style).trim().length > 0 ? coluna_style : '')+'"';
											var colspan  = coluna.COLSPAN != '' && coluna.COLSPAN != undefined ? ' colspan="' + coluna.COLSPAN + '" ' : '';
											var rowspan  = coluna.ROWSPAN != '' && coluna.ROWSPAN != undefined ? ' rowspan="' + coluna.ROWSPAN + '" ' : '';

											cabeca4 = cabeca4+' <th id="'+that.tabela_id+'_tabela_col_'+key+'" data-col-index="'+key+'" '+colspan+' '+rowspan+' '+mousedown+' '+mousemove+' '+mouseup+' class="colid_'+cont_col+' '+classe+'" '+ ttitulo1 + ' ng-if="'+col+'.VISIBLE == true && ('+col+'.HIDDEN == false || '+col+'.HIDDEN == undefined)" '+style2+' field="'+coluna.CAMPO_FILTRO+'">'+coluna.HTML+'</th>'; 
										}
									});

								}

								cabeca1 = cabeca1 + '</tr>';
								cabeca2 = cabeca2 + '</tr>';
								cabeca3 = cabeca3 + '</tr>';
								cabeca4 = cabeca4 + '</tr>';
								
								if(that.COLUNAS2.length > 0 || that.COLUNAS_FUNC.length > 0){
									if(that.COLUNAS_FUNC.length > 0){
										if(that.position_colunas_func == 'after') {										
											cabeca3 = cabeca3 + cabeca4;
										}else {
											cabeca3 = cabeca4 + cabeca3;
										}
									}

									if(that.position_colunas2 == 'after') {
										html = html + ((that.html_speed == true || that.cabecalho_print == true) ? cabeca2 : '') + cabeca1 + cabeca3 + '</thead><tbody '+vs_scroll+'> ';	
									}else{
										html = html + ((that.html_speed == true || that.cabecalho_print == true) ? cabeca2 : '') + cabeca3 + cabeca1 + '</thead><tbody '+vs_scroll+'> ';	
									}
								}else{
									html = html + ((that.html_speed == true || that.cabecalho_print == true) ? cabeca2 : '') + cabeca1 + '</thead><tbody '+vs_scroll+'> ';
								}
										
								if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal' ||  that.tipo_tabela == 'compilado'){

									var tipo_click = 'ng-dblclick';

									if(isMobile()){
										tipo_click = 'ng-click';
									}

									var tipo_add_campo = 1;
									if(that.tipo_tabela == 'compilado'){
										tipo_add_campo = 3;
									}

									var checkonfocus = '';
									if(that.check_onfocus == true){
										checkonfocus = that.input_function;
									}
									
									var filtro_status = '';
									if(that.filtro_visible == true && that.filtro_status_v == true && typeof that.multithread_filter == 'undefined'){
										filtro_status = '| find2: { model : '+that.model+'.STATUS , fields :[\'STATUS\'] }';
									}else if(that.filtro_visible == true && typeof that.multithread_filter != 'undefined'){
										for(var indexzxy = 0; indexzxy < that.multithread_filter.length; indexzxy++) {
											filtro_status = filtro_status +'| find2: { model : '+that.model+'.'+that.multithread_filter[indexzxy].CAMPO+' , fields :[\''+that.multithread_filter[indexzxy].CAMPO+'\'] }';
										}
									}
									
									var filtro_tabela = '| find: {model : '+that.model+'.FILTRO ,fields : '+that.model+'.campos_filtro.length > 0 ? '+that.model+'.campos_filtro : \'all\'}';
									var filtro_render = '';
									angular.forEach(that.FILTRO_RENDER, function(item, key){
										filtro_render = filtro_render + ' | '+item.FIND+': {model : '+item.MODEL+' , fields : '+item.CAMPO+'} '
									});
									var row_hide = typeof that.row_hide != 'undefined' && (''+that.row_hide).trim().length > 0 ? ' ng-hide="'+that.row_hide+'" ' : '';

									if(that.marcar_linhas == true){
										html = html + ' <tr class="itbl itbl_index_{{ $index }}" id="_item_tabela_{{item.ID ? item.ID : item.CODIGO}}" ng-repeat="item in '+that.model+'.DADOS_RENDER = ( '+that.model+'.DADOS | orderBy2 : {model :'+that.model+'.ORDER_BY } '+filtro_tabela+' '+filtro_render+' '+filtro_status+') track by $index" '+row_hide+listener+''+
												' ng-click="'+that.model+'.focus_checkbox(item,$event);'+checkonfocus+';'+that.model+'.count_marcados();" ng-keydown="'+that.model+'.atalho_enter('+that.model_selected+',item,$event)"'+
												' ng-focus="'+that.model+'.event_focus != undefined ? '+that.model+'.event_focus.function(item,event) : \'\'; item.btn3_atalho = true;" ng-blur="item.btn3_atalho = false;" '+
												' ng-class="{ \'selected\' : {{'+that.model+'.campo_model}} == true }" '+
												' tabindex="0"> '
												+ (that.getTD(texto_ttitle, tipo_add_campo)) +
												' </tr> ';

									}else{
										
										html = html + ' <tr class="itbl itbl_index_{{ $index }}" id="_item_tabela_{{item.ID ? item.ID : item.CODIGO}}" ng-repeat="item in '+that.model+'.DADOS_RENDER = ( '+that.model+'.DADOS | orderBy2 : {model :'+that.model+'.ORDER_BY } ' + filtro_tabela + '  '+filtro_render+' '+filtro_status+') track by $index" '+row_hide+listener+''+
												' '+tipo_click+'="'+that.model+'.VER == true ? '+that.model_selected+'.visualizar() : \'\'" ng-keydown="'+that.model+'.atalho_enter('+that.model_selected+',item,$event)"'+
												' ng-focus="'+that.model_selected+'.SELECTED = item;'+that.model+'.VER = true;'+that.model+'.event_focus != undefined ? '+that.model+'.event_focus.function(item,event) : \'\';'+checkonfocus+'; item.btn3_atalho = true;" ng-blur="item.btn3_atalho = false;"'+
												' ng-class="{ \'selected\' : '+that.model_selected+'.SELECTED == item }" '+
												' tabindex="0"> '
												+ (that.getTD(texto_ttitle, tipo_add_campo)) +
												'  </tr> ';

									}
									

								}else if(that.tipo_tabela == 'accordion'){

									that.TOTAL_NIVEIS = 0;

									function getTNivel(grupos){
										that.TOTAL_NIVEIS = grupos.NIVEL;
										if(typeof grupos.GRUPOS != 'undefined' && grupos.GRUPOS.NIVEL > 0){
											getTNivel(grupos.GRUPOS);
										}
									}
																		
									getTNivel(that.GRUPOS);
									
									html = html + that.getAccordion('',that.GRUPOS,texto_ttitle);

								}	

								var total_html = '';
								if(that.total_visible){
									if(that.totalizador_html == false){

										if(that.html_speed == true){

											if(that.total_visible == true){
												total_html = '<tr style="font-weight: bold;" total="true"><td style="position: sticky; bottom: 0; z-index: '+(typeof that.index_z != 'undefined' ? that.index_z : '2')+'; background-color: rgb(191, 191, 191);"></td>';

													that.COLUNAS_BKP_TOTAIS = sort_by_key(that.COLUNAS_BKP_TOTAIS, 'ORDEM');

													angular.forEach(that.COLUNAS_BKP_TOTAIS, function(item , key){

														if(item.VISIBLE == true && typeof that.COLUNAS_TOTAIS != 'undefined'){
															total_html = total_html +
															'			<td class="colid_'+item.COLID+'" class="total_tabela '+ (((that.input_visible == true && that.input_visible != undefined) || (item.BTN3 != undefined)) ? 'no-print' : '' )+'" '+ 
															' 				style="position: sticky; bottom: 0; z-index: '+(typeof that.index_z != 'undefined' ? that.index_z : '2')+'; background-color: rgb(191, 191, 191); text-align: '+ (item.TOTAL_TIPO == 'titulo' ? 'left;' : 'right;')+'"> '+
															( !(item.TOTAL != undefined && item.TOTAL != false) ? '' : ' <label class="total_tabela" style="display: contents;"> '+(item.PREFIXOT+' '+that.number_format(that.COLUNAS_TOTAIS[item.CAMPO] , item.DECIMAL, ',', '.')+' '+item.SUFIXOT)+ '</label> ')+
															'			</td> ';
														}

													});
												
												total_html	= total_html + '</tr> ';
											}else{
												total_html = '';	
											}

											that.html_total = total_html;

										}else{
											var class_totalizador = that.ID+'_TOTALIZADOR';
											total_html = ''+
												' 		<tr style="font-weight: bold;" class="linha_total_tabela '+class_totalizador+'" ng-class="'+that.model+'.total_visible == false || '+that.model+'.total_visible == undefined ? \'no-print\' : \'\'" '+
												'			ng-show="'+that.model+'.total_visible == true && '+that.model+'.total_visible != undefined"> '+
												'			<td style="position: sticky; bottom: 0;	z-index: '+(typeof that.index_z != 'undefined' ? that.index_z : '2')+'; background-color: rgb(191, 191, 191);"><label class="total_tabela"> TOTAL </label></td> '+
												'			<td class="colid_{{item.COLID}}" ng-class="('+that.model+'.input_visible == true && '+that.model+'.input_visible != undefined && $first) || (item.BTN3 != undefined && $last) ? \'no-print\' : \'\' "ng-if="item.VISIBLE == true" ng-repeat="item in '+that.model+'.DADOS_RENDER_'+nome_totalizador+' = ( '+that.model+'.COLUNAS_BKP_TOTAIS | orderBy : \'ORDEM\' ) track by $index" '+ 
												' 				style="position: sticky; bottom: 0; z-index: '+(typeof that.index_z != 'undefined' ? that.index_z : '2')+'; background-color: rgb(191, 191, 191); text-align: {{item.TOTAL_TIPO == \'titulo\' ? \'left;\' : \'right;\'}} {{ item.STYLE_TOTAL != undefined && item.STYLE_TOTAL != undefined ? item.STYLE_TOTAL : \'\'}};"> '+
												'				<label class="total_tabela {{(item.TOTAL != undefined && item.TOTAL != false) == false ? \'no-print\' : \'\'}}" style="display: contents; {{ item.STYLE_TOTAL_L != undefined && item.STYLE_TOTAL_L != undefined ? item.STYLE_TOTAL_L : \'\'}};" ng-show="item.TOTAL != undefined && item.TOTAL != false && (item.TOTAL_FORMAT == undefined || item.TOTAL_FORMAT == \'number\')"> {{  (item.PREFIXOT+\' \'+'+that.model+'.number_format( '+that.model+'.COLUNAS_TOTAIS[item.CAMPO] , item.DECIMAL, \',\', \'.\')+\' \'+item.SUFIXOT) }} </label> '+
												'				<label class="total_tabela {{(item.TOTAL != undefined && item.TOTAL != false) == false ? \'no-print\' : \'\'}}" style="display: contents; {{ item.STYLE_TOTAL_L != undefined && item.STYLE_TOTAL_L != undefined ? item.STYLE_TOTAL_L : \'\'}};" ng-show="item.TOTAL != undefined && item.TOTAL != false && (item.TOTAL_FORMAT == \'string\')"> {{  '+that.model+'.COLUNAS_TOTAIS[item.CAMPO] }} </label> '+
												'			</td> '+
												'      	</tr> ';
										}

									}else{

										var class_totalizador = that.ID+'_TOTALIZADOR';
										total_html = ''+
											' 		<tr style="font-weight: bold;" class="linha_total_tabela '+class_totalizador+'" ng-class="'+that.model+'.total_visible == false || '+that.model+'.total_visible == undefined ? \'no-print\' : \'\'" '+
											'			ng-show="'+that.model+'.total_visible == true && '+that.model+'.total_visible != undefined"> '+
											'			<td style="position: sticky; bottom: 0;	z-index: '+(typeof that.index_z != 'undefined' ? that.index_z : '2')+'; background-color: rgb(191, 191, 191);"><label class="total_tabela"> TOTAL </label></td> ';		

											angular.forEach(that.COLUNAS_BKP_TOTAIS,function(item,key){
												if(item.VISIBLE == true){
													total_html = total_html+'  <td class="colid_'+item.COLID+'" style="position: sticky; bottom: 0; z-index: '+(typeof that.index_z != 'undefined' ? that.index_z : '2')+'; background-color: rgb(191, 191, 191);'+
																			' 		text-align: '+(item.TOTAL_TIPO == 'titulo' ? 'left;' : 'right;')+' '+(typeof item.STYLE_TOTAL != 'undefined' ? item.STYLE_TOTAL : '')+'"> '+
																			'	'+trim_null(item.HTML_TOTAL)+'	'+
																			'  </td> '
												}
											})
											total_html = total_html+'  </tr> ';

									}
								}

								if(that.vs_scroll == true){
									total_html = total_html != '' ? '<tfoot>'+total_html+'</tfoot> ' : '';
									html = html + '</tbody>'+ total_html +'</table> ';
								}else{
									html = html + total_html + '</tbody>'+'</table> ';
								}

								html = html + ( that.html_speed == true ? '' : '	<p ng-if="'+that.model+'.infinite_end == true && '+that.model+'.consulta_pagina > 0" class="no-print" style="font-weight: bold;margin-top: 3px;margin-bottom: 5px;text-align: center;color: crimson;"> Todos os registros filtrados foram carregados </p> ')+
										
										( that.html_speed == true ? '' : '	<div ng-show="'+that.model+'.infinite_scroll == true && '+that.model+'.scroll_counter > 0 && '+that.model+'.time_counter == true" style="padding-left: 0px; padding-top: 10px; padding-bottom: 7px; position: relative; text-align: -webkit-center; width: 100px;margin-left: calc(50% - 50px);'+
										'	border: 1px solid; border-radius: 25px 25px 0px 0px; margin-top: -31px; border-bottom: 0px; background: white; border-color: silver;" class="'+that.tabela_id+'_tabela_indicador no-print indicador_carregamento"> ' +
										'	<div style="display: inline-flex;"> '+
										'		<span class="t-status status-0" ng-if="'+that.model+'.scroll_counter  < 2" style="margin-right: 6px;"></span> '+
										'		<span class="t-status status-1" ng-if="'+that.model+'.scroll_counter >= 2" style="margin-right: 6px;"></span> '+
										'		<span class="t-status status-0" ng-if="'+that.model+'.scroll_counter  < 4" style="margin-right: 6px;"></span> '+
										'		<span class="t-status status-1" ng-if="'+that.model+'.scroll_counter >= 4" style="margin-right: 6px;"></span> '+
										'		<span class="t-status status-0" ng-if="'+that.model+'.scroll_counter  < 5"></span> '+
										'		<span class="t-status status-1" ng-if="'+that.model+'.scroll_counter >= 5"></span> '+
										'	</div> '+
										'  </div> '+
										' </div> ')+
										
										( that.html_speed == true ? '' : ' <nav ng-if="'+that.model+'.pagina_enabled == true && '+that.model+'.pagina_enabled != undefined" style="text-align: center;" aria-label="Page navigation example"> ' +
										'  <ul class="pagination justify-content-center">  ' +
										'    <li class="page-item disabled"> ' +
										'      <a class="page-link" href="#" tabindex="-1">Anterior</a> ' +
										'    </li>	' +
										'    <li class="page-item" ng-repeat="item in '+that.model+'.pages_indexer track by $index"><p style="cursor:pointer" class="page-link">@{{item.name}}</p></li> ' +
										'    <li class="page-item"> '+
										'      <a class="page-link" href="#">Próxima</a>  '+
										'    </li>  '+
										'  </ul>   '+
										'  </nav>	')+
										  
										(that.html_speed == true ? '' :  
										trim_null(that.Beforelegendas)+
										' <div class="form-group" style="margin-bottom: 0px;"> '+
										' 	<div class="legenda_padrao" ng-show="'+that.model+'.total_registros_default == true && '+that.model+'.total_registros == true && '+that.model+'.total_registros != undefined" style="display: -webkit-inline-box; padding: 7px; margin-top: 5px; background-color: rgb(255, 255, 255); color: black; border-radius: 5px; border: groove; font-weight: bold;">Qtd. de Registros: &#160 <label ng-bind="'+that.model+'.DADOS_RENDER.length"></label> </div> ' +
										' 	<div class="legenda_padrao" ng-show="'+that.model+'.total_registros_default == false && '+that.model+'.total_registros == true && '+that.model+'.total_registros != undefined" style="display: -webkit-inline-box; padding: 7px; margin-top: 5px; background-color: rgb(255, 255, 255); color: black; border-radius: 5px; border: groove; font-weight: bold;">Qtd. de Registros: &#160 <label ng-bind="'+that.model+'.total_registros_aux"></label> </div> ' +
										' 	<div class="legenda_padrao" ng-show="'+that.model+'.marcar_linhas == true && '+that.model+'.marcar_linhas != undefined" style="display: -webkit-inline-box; padding: 7px; margin-top: 5px; background-color: rgb(255, 255, 255); color: black; border-radius: 5px; border: groove; font-weight: bold;">Qtd. de Registros Selecionados: &#160 <label ng-bind="'+that.model+'.counter_selected"></label> </div> ' +										
										
										' 	<div class="legenda_padrao" ng-if="'+that.model+'.infinite_scroll == true && '+that.model+'.habilita_botao_next == true" style="display: -webkit-inline-box; padding: 2px; margin-top: 5px; background-color: rgb(255, 255, 255); color: black; border-radius: 5px; border: groove; font-weight: bold; padding-top: 3px;">'+
											 '<button type="button" class="btn btn-default" style="height: 29px;" ng-click="'+that.model+'.NextPage();">'+
											 	'<span class="glyphicon glyphicon-chevron-right"></span>'+
											 '</button>'+
										'  </div> ' +

										' 	<div class="legenda_padrao" ng-if="'+that.model+'.infinite_scroll == true && '+that.model+'.habilita_botao_nextAll == true" style="display: -webkit-inline-box; padding: 2px; margin-top: 5px; background-color: rgb(255, 255, 255); color: black; border-radius: 5px; border: groove; font-weight: bold; padding-top: 3px;">'+
											 '<button type="button" class="btn btn-default" style="height: 29px;" ng-click="'+that.model+'.NextPageAll();">'+
											 	'<span class="glyphicon glyphicon-forward"></span>'+
											 '</button>'+
										'  </div> ' +

										' '+legendas+' '+
										' </div> ')+


										' <div class="form-group" id="'+that.tabela_id+'vs_render" style="display: none;"> '+ 
										' </div> ';
									
								return html;
				},
				NextPageAll : function(){
					var that2 = this;
					
					return $q(function(resolve, reject){

						function executar(){
							if(typeof that2.model_tabela.consultar != 'undefined'){

								$timeout(function(){
									
									that2.bkp_consulta_qtd 	= that2.consulta_qtd;
									that2.consulta_pagina 	= 0;	
									that2.consulta_qtd    	= 10000;						

									if(typeof that2.func_consultar == 'undefined'){
										if(that2.model_tabela.isFactoryDefault == true){
											var old_toggle = that2.model_tabela.habilita_toggle;
											that2.model_tabela.habilita_toggle = false;
											
											if(that2.next_page_add_itens){
												try {
													that2.model_tabela.getItensAdd().then(function(result){
														$timeout(function(){
															that2.model_tabela.habilita_toggle = old_toggle;
															that2.infinite_end = true;
															resolve([]);
														},500);
													}).catch(function(result){
														$timeout(function(){
															that2.model_tabela.habilita_toggle = old_toggle;
															that2.infinite_end = true;
														},500);
														resolve([]);
													});
												} catch (error) {
													console.log('Metodo consultar não retornou um "promises"');
													that2.model_tabela.habilita_toggle = old_toggle;
													resolve([]);
												}
											}else{
												try {
													that2.model_tabela.consultar().then(function(result){
														$timeout(function(){
															that2.model_tabela.habilita_toggle = old_toggle;
															that2.infinite_end = true;
															resolve([]);
														},500);
													}).catch(function(result){
														$timeout(function(){ 
															that2.model_tabela.habilita_toggle = old_toggle;
															that2.infinite_end = true;
															resolve([]);
														},500);
													});
												} catch (error) {
													console.log('Metodo consultar não retornou um "promises"');
													that2.model_tabela.habilita_toggle = old_toggle;
													resolve([]);
												}
											}
											
										}else{	
											$('#filtrar-toggle').attr("disabled", "true");
											var old_disabled = $('#filtrar-toggle').attr("disabled");
											
											try {
												that2.model_tabela.consultar().then(function(result){
													$timeout(function(){ 
														that2.infinite_end = true;

														if(typeof old_disabled != 'undefined' && old_disabled != false){
															$('#filtrar-toggle').removeAttr("disabled");
														}	

														resolve([]);
													},500,false);
												}).catch(function(result){
													$timeout(function(){ 
														that2.infinite_end = true;
														
														if(typeof old_disabled != 'undefined' && old_disabled != false){
															$('#filtrar-toggle').removeAttr("disabled");
														}	

														resolve([]);
													},500,false);
												});											
											} catch (error) {
												$timeout(function(){ 
													if(typeof old_disabled != 'undefined' && old_disabled != false){
														$('#filtrar-toggle').removeAttr("disabled");
													}	
													console.log('Metodo consultar não retornou um "promises"');

													resolve([]);
												},500,false);
											}
										}

									}else{
										that2.func_consultar();
										that2.infinite_end = true;
										resolve([]);
									}
		
									that2.consulta_qtd = that2.bkp_consulta_qtd;
									
								});

							

							}else{
								resolve([]);
							}
						}

						// if(typeof that2.Confirme == 'undefined'){
						// 	that2.Confirme	= that2.Confirmacao.getNew(that2.model+'.Confirme');
						// }						

						that2.Confirme.add(1,'<h4>Confirmação</h4>',
						'Essa operação pode retornar muitos registros, analise com cuidado os parametros de filtragem antes de continuar!<br><br>'+
						'Deseja realmente consultar todos os registros da filtragem?'
						,[
							that2.Confirme.obtn_ok, 
							that2.Confirme.obtn_cancelar
						],
						  [
							function (e, btn){ 
								executar();
							},
							function (e, btn){
								resolve([]);
							}
						]);

					});
				},
				NextPage : function(){
					var that2 = this;
					//console.log(that2);
					if(typeof that2.model_tabela.consultar != 'undefined'){
						if(that2.infinite_end == false){
							$timeout(function(){
								if(that2.DADOS.length > 0){
									that2.consulta_pagina++;
								} 								
								/*
								if(typeof that2.func_consultar == 'undefined'){

									var a    = that2.model_tabela['consultar'];
									var b    = String(a);
									var obj  = that2.model_tabela; 
									var that = that2.model_tabela;
									
									var p1 = (b+'').indexOf('(');

									b = (b+'').substring(p1, (b+'').length);
									b = 'that2.func_consultar = function '+b+'';

									b = (b+'').replace('.filtrarToggle()','');
									b = (b+'').replace('var that = this;','');
									b = (b+'').replace('this.','obj.');
									
									eval(""+b+";");

									that2.func_consultar();
								}else{
									that2.func_consultar();
								}*/

								if(typeof that2.func_consultar == 'undefined'){
									if(that2.model_tabela.isFactoryDefault == true){
										var old_toggle = that2.model_tabela.habilita_toggle;
										that2.model_tabela.habilita_toggle = false;
										//that2.model_tabela.consultar();
										if(that2.next_page_add_itens){
											try {
												that2.model_tabela.getItensAdd().then(function(result){
													$timeout(function(){ that2.model_tabela.habilita_toggle = old_toggle;},500);
												}).catch(function(result){
													$timeout(function(){ that2.model_tabela.habilita_toggle = old_toggle;},500);
												});
											} catch (error) {
												console.log('Metodo consultar não retornou um "promises"');
												that2.model_tabela.habilita_toggle = old_toggle;
											}
										}else{
											try {
												that2.model_tabela.consultar().then(function(result){
													$timeout(function(){ that2.model_tabela.habilita_toggle = old_toggle;},500);
												}).catch(function(result){
													$timeout(function(){ that2.model_tabela.habilita_toggle = old_toggle;},500);
												});
											} catch (error) {
												console.log('Metodo consultar não retornou um "promises"');
												that2.model_tabela.habilita_toggle = old_toggle;
											}
										}
										
										
									}else{	
										$('#filtrar-toggle').attr("disabled", "true");
										var old_disabled = $('#filtrar-toggle').attr("disabled");
										
										try {
											that2.model_tabela.consultar().then(function(result){
												$timeout(function(){ 
													if(typeof old_disabled != 'undefined' && old_disabled != false){
														$('#filtrar-toggle').removeAttr("disabled");
													}	
												},500,false);
											}).catch(function(result){
												$timeout(function(){ 
													if(typeof old_disabled != 'undefined' && old_disabled != false){
														$('#filtrar-toggle').removeAttr("disabled");
													}	
												},500,false);
											});											
										} catch (error) {
											$timeout(function(){ 
												if(typeof old_disabled != 'undefined' && old_disabled != false){
													$('#filtrar-toggle').removeAttr("disabled");
												}	
												console.log('Metodo consultar não retornou um "promises"');
											},500,false);
										}
									}

									//that2.model_tabela.consultar()
								}else{
									that2.func_consultar();
								}
								
							})
						}						
					}
				},
				fixed_menu : function(event) {
					var that = this;
					if(that.options_fixed == true){
						//console.log(event);
						//var a = $(event.currentTarget).parent().find('ul');
						var a = event.currentTarget.parentNode.querySelector('ul');
						if(typeof(a) != 'undefined' && a !== null){
							a.style.position = 'absolute';
							a.style.top		 = '21px';
							a.style.left	 = '0px';
							$timeout(function(){																
								console.log(a);
								//a = document.getElementById()
								var tamanho      = 160;
								var coordenadas  = a.getBoundingClientRect();
								var topo_tela 	 = coordenadas.top;
								//var left_tela  = coordenadas.left;
								var left_tela 	 = 22;
								var topo 		 = topo_tela - 62;
								//var left 		 = left_tela - 10;
								//topo 			 = (topo_tela - tamanho + 10) * -1;
								a.style.position = 'fixed';
								a.style.top 	 = topo+'px';					
								//a.style.left 	 = left+'px';					
								a.style.left 	 = left_tela+'px';
							})
						} 
						//var b = event.currentTarget.querySelector("li")
						
						//console.log(b);
						// if(a.length > 0){
							
						// }
						// var coordenadas = that.element_input.getBoundingClientRect();
						// var topo_tela 	= coordenadas.top;
						// var topo 		= topo_tela - 20;
						// topo = (topo_tela - tamanho + 10) * -1;
						// $(event.currentTarget).ccs('position','fixed');
						// $(event.currentTarget).ccs('top',topo+'px');
					}
				},
				fecha_menu : function(event){
					var that = this;
					var table_drops = $('div.dropdown.acoes.open');
					table_drops.each(function(index){
						$(this).removeClass('open');
					});
				},
				count_marcados : function(){
					var that = this;
					//var modelo = (''+that.campo_model).replace('item.','');
					var modelo = (''+that.campo_model).replace(that.campo_model.substring(0,that.campo_model.indexOf('.')+1),'');
					that.counter_selected = 0;
					if(that.filtro_visible == false){
						for(var a = 0;a < that.DADOS.length;a++){
							var dados = that.DADOS[a];
							if(typeof dados[modelo] != 'undefined' && dados[modelo] == true){
								that.counter_selected++;
							}
						}
					}else if(that.filtro_visible == true){
						// $timeout(function(){
							// for(var a = 0; a < that.DADOS_RENDER.length; a++){
							// 	var item = that.DADOS_RENDER[a];
							// 	item[prop1] = true;
							// }
							for(var a = 0;a < that.DADOS_RENDER.length;a++){
								var dados = that.DADOS_RENDER[a];
								if(typeof dados[modelo] != 'undefined' && dados[modelo] == true){
									that.counter_selected++;
								}
							}						
						// },500)
					}
					
					if(typeof that.fimcountmarcados != 'undefined'){
						that.fimcountmarcados();
					}
				},
				filtroStatusOnChange : function(e){
					var that = this;
					if(typeof that.multithread_filter == 'undefined'){
						if(that.STATUS == 1){
							that.filtro_status = ',Registros ativos';
						}else if(that.STATUS == 0){
							that.filtro_status = ',Registros inativos';
						}else{
							that.filtro_status = ',';
						}
						that.item_status = {};
	
						angular.forEach(that.status_opt_bkp, function (item, value){	
							if(item.VALOR == that.STATUS){
								that.item_status = angular.copy(item);
							}	
						});
					}else{
						// angular.forEach(that.multithread_filter, function(item, key){
						// 	if(item){
						// 		angular.forEach(that.status_opt_bkp, function (item, value){	
						// 			if(item.VALOR == that.STATUS){
						// 				that.item_status = angular.copy(item);
						// 			}	
						// 		});
						// 	}
						// });
					}

					if(typeof that.onfiltroStatusOnChange != 'undefined'){
						that.onfiltroStatusOnChange();
					}

					// if(that.BACKUP_STATUS.length == 0 || typeof e != 'undefined'){
					// 	gcCollection.merge(that.BACKUP_STATUS,angular.copy(that.DADOS));
					// }					
					// var index = findInArrayProp(that.DADOS,'STATUS');
					// function filter_by_prop(value){
					// 	value.STATUS == that.STATUS
					// }

					// if(index > -1 && that.STATUS != ''){
					// 	that.DADOS = angular.copy(that.BACKUP_STATUS).filter(filter_by_prop);
					// }else{
					// 	if(that.STATUS == ''){
					// 		that.DADOS = angular.copy(that.BACKUP_STATUS);
					// 	}
					// }

					// console.log(that.DADOS_RENDER);
				},
				filtroOnChange : function(){
					var that = this;
					if(that.filtro_change == true){
						that.filtro = that.FILTRO;
					}
					if(typeof that.onfiltroOnChange != 'undefined'){
						that.onfiltroOnChange();
					}

					$timeout(function(){
						that.DADOS_RENDER_FILTRADOS = filterObjectsByPartialValue(that.DADOS_RENDER, that.FILTRO);

						that.TotalTabela();

						that.count_marcados();
					},100);
				},
				apagar : function(){
					//Função para apagar os dados da tabela
					var that 					= this;
					that.FILTRO					= '';					
					that.DADOS 					= [];
					that.DADOS_RENDER 			= [];
					that.DADOS_RENDER_FILTRADOS	= [],
					that.DADOS_AGRUPAMENTO 		= [];
					that.total_dados 			= 0;
					that.counter_selected 		= 0;
					that.infinite_end 			= false;
					that.linhas_marcadas 		= false;
					that.consulta_pagina 		= 0;
					// if(typeof that.PaiTab != 'undefined'){
					// 	that.PaiTab.BACKUP_ITENS_MARCADOS = [];
					// }

					if(that.total_visible){
                        that.TotalTabela();
					}
				},
				Executioner : function(obj){
					return Function('"use strict";return (' + obj + ')')();
				},
				onScrollEnd : function(){
					var that = this;
					$('.dropdown-fixo').parent().removeClass('open');

					if(that.infinite_scroll == true && that.infinite_end == false){
						
						//that.consultando = true;
						//that.model_tabela.consultar();					
					};
				},
				onScrollUP : function(){
					var that = this;

					$('.dropdown-fixo').parent().removeClass('open');
					
					if(that.infinite_scroll == true && that.infinite_end == false){
						that.scroll_counter = 0;
						clearTimeout(that.setTimer);
						that.timer_out = false;
						that.time_counter = false;							
						//console.log('reset scroll',that.scroll_counter);
					};
				},
				clearTimer: function(){
					var that = this;
					if(that.infinite_scroll == true && that.infinite_end == false){
						clearTimeout(that.timer_func);
					};
				},
				setTimer : function(){
					var that = this;
					if(that.infinite_scroll == true && that.infinite_end == false){
						console.log('timeout setado!');
						that.timer_func = setTimeout(function(){
							$rootScope.$apply(function(){
								that.time_counter = false;									
								that.scroll_counter = 0;
								console.log('timeout ocorreu!');
							});
						},2000);						
					};
				},
				setTamanhoDiv : function(){
					var that = this;
					
					var height = $( that.componente ).height();
					var width  = $( that.componente ).width();

					var elm = $( that.componente ).find('.div-carregando-tabela_ls');
					
					$( elm).height(height);
					$( elm).width(width);
				},
				onScrollDown : function(){
					var that = this;
					$('.dropdown-fixo').parent().removeClass('open');

					if(that.infinite_scroll == true && that.infinite_end == false){
						if(that.consultando == false){
							if(that.scroll_counter >= 5){								
								if(that.DADOS.length > 0){
									that.consulta_pagina++;
								}
								console.log('pagina',that.consulta_pagina);						
								that.consultando = true;
								if(that.tabela_itens == false || typeof that.tabela_itens == 'undefined'){
									that.model_tabela.consultar();
								}else{
									that.model_tabela.getItensAdd();
								}								
								that.clearTimer();
								//that.scroll_counter = 0;
								console.log('consulta realizado scroll zerado!,',that.scroll_counter);

								that.setTamanhoDiv();
								
							}else{
								if(that.consultando == false){
									that.scroll_counter++;	
									if(that.scroll_counter >= 5){								
										if(that.DADOS.length > 0){
											that.consulta_pagina++;
										}
										console.log('pagina',that.consulta_pagina);						
										that.consultando = true;
										if(that.tabela_itens == false || typeof that.tabela_itens == 'undefined'){
											that.model_tabela.consultar();
										}else{
											that.model_tabela.getItensAdd();
										}	
										// that.model_tabela.consultar();
										that.clearTimer();
										//that.scroll_counter = 0;
										console.log('consulta realizado scroll zerado!,',that.scroll_counter);

										that.setTamanhoDiv();
									}else{
										that.clearTimer();
										that.setTimer();
										that.time_counter = true;
									}													
								}
							}
						}
					};
				},
				focus_checkbox: function(dados,event){
					var that = this;
					event.stopPropagation();
					if(that.input_visible == true){
						// console.log('focus realizado');
						// var modelo = (''+that.campo_model).replace('item.','');
						var modelo = (''+that.campo_model).replace(that.campo_model.substring(0,that.campo_model.indexOf('.')+1),'');
						var table_drops = $('div.dropdown.acoes.open');
						table_drops.each(function(index){
							$(this).removeClass('open');
						});
						if(typeof that.validar_focus_checkbox == 'undefined' || that.validar_focus_checkbox == false || (typeof that.validar_focus_checkbox === 'object' && that.validar_focus_checkbox.funcao(dados) == false)){
							dados[modelo] = !dados[modelo];
						}
						
						if(typeof that.onMarcarClick != 'undefined'){
							that.onMarcarClick(dados)
						}
						
						if(that.marcar_linhas == true){
							that.count_marcados();
						}
					}
				},
				count_checked: function(dados){
					var that = this;
					if(that.marcar_linhas == true){
						that.count_marcados();
					}
				},
				desabilitar_atalho_enter  : false,
				desabilitar_atalho_delete : false,
				desabilitar_atalho_space  : false,
				atalho_enter: function(model,dados,event){
					//Opção a desenvolver futuramente se acaso outros atalhos forem incluidos nas tabelasJS
					var that = this;
					if(event.keyCode == 13 && that.desabilitar_atalho_enter == false){								
						var table_drops = $('div.dropdown.acoes.open');
						table_drops.each(function(index){
							$(this).removeClass('open');
						});			
						event.stopPropagation();
						//console.log('visualizar');
						if(that.VER){
							model.visualizar();
						}
						
						if(that.tipo_tabela	 == 'accordion'){
							that.getClickAccordion(dados);
						}
					}else if(event.keyCode == 32 && that.desabilitar_atalho_space == false){
						if(that.input_visible == true){
							event.preventDefault();
							//console.log('space pressionado');
							var table_drops = $('div.dropdown.acoes.open');
							table_drops.each(function(index){
								$(this).removeClass('open');
							});
							// var modelo = (''+that.campo_model).replace('item.','');
							var modelo = (''+that.campo_model).replace(that.campo_model.substring(0,that.campo_model.indexOf('.')+1),'');
							if(typeof that.validar_space_function == 'undefined' || that.validar_space_function == false || (typeof that.validar_space_function === 'object' && that.validar_space_function.funcao(dados) == false)){
								dados[modelo] = !dados[modelo];
							}
							
							if(typeof that.space_function != 'undefined'){
								that.space_function(dados);
							}

							if(that.marcar_linhas == true){
								that.count_marcados();
							}
						}
					}else if(event.keyCode == 46 && that.desabilitar_atalho_delete == false){
						
						var table_drops = $('div.dropdown.acoes.open');
						table_drops.each(function(index){
							$(this).removeClass('open');
						});

						if(that.delete_item == true){
							//console.log('tecla delete!');
							var btn_excluir 					= $(event.target).find('button:enabled:visible:focusable').has('span.glyphicon-trash');
							var btn_excluir_in_list 			= $(event.target).find('button:enabled:visible:focusable').has('span.glyphicon-th-list');
							var btn_excluir_in_list_sub_menu 	= $(event.target).find('div.dropdown:visible').has('span.glyphicon-th-list');
							if(btn_excluir.length){

								that.Time9 = $timeout(function(){
									btn_excluir.first().click();
									$timeout.cancel(that.Time9);
								});
							}else if (btn_excluir_in_list.length){
								var link_excluir = $(event.target).find('a').has('span.glyphicon-trash');
								if(link_excluir.length){
									that.time10 = $timeout(function(){
										console.log(link_excluir);
										link_excluir.first().click();
										$timeout.cancel(that.Time10);
									});
								}
								
							}else if (btn_excluir_in_list_sub_menu.length){
								var link_excluir = $(event.target).find('a').has('span.glyphicon-trash');
								if(link_excluir.length){
									that.time10 = $timeout(function(){
										console.log(link_excluir);
										link_excluir.first().click();
										$timeout.cancel(that.Time10);
									});
								}
								
							}
						}
					}else if(event.keyCode == 40){
						
						var table_drops = $('div.dropdown.acoes.open');
						table_drops.each(function(index){
							$(this).removeClass('open');
						});
						var scroll_itens_top  = $(that.componente+' div.table-ec').scrollTop();
						var scroll_itens_left = $(that.componente+' div.table-ec').scrollLeft();
						var linha_tabela_tam  = $(event.currentTarget).outerHeight();
						if(that.total_visible){
							var result = scroll_itens_top + linha_tabela_tam;
							$(that.componente+' div.table-ec').scrollTop(result);
						}
					}else if(event.keyCode == 38){
						
						var table_drops = $('div.dropdown.acoes.open');
						table_drops.each(function(index){
							$(this).removeClass('open');
						});

						var scroll_itens_top  = $(that.componente+' div.table-ec').scrollTop();
						var scroll_itens_left = $(that.componente+' div.table-ec').scrollLeft();
						var linha_tabela_tam  = $(event.currentTarget).outerHeight();
						if(that.total_visible){
							var result = scroll_itens_top - linha_tabela_tam;
							$(that.componente+' div.table-ec').scrollTop(result);
						}
					}

					if(typeof that.atalho_enter_add != 'undefined'){
						that.atalho_enter_add(model,dados,event);
					}
				},
				generate_page: function(pages){
					var that = this;
					var indexer = [];
					for(var a = 0; a< indexer;a++){
						indexer[a] = {
							name: a,
							valor: a,
							title: a
						}
					};

					that.pages_indexer = indexer;
					// console.log(indexer);
				},
				select_page: function(index){
					var that = this;
					that.selected_page = index;
				},
				skip_page: function(){
					var that = this;
					var index = that.selected_page + 1;
					if(index > (that.pages_indexer.length + 1)){
						that.blk_next_page = true;
					}else{
						that.selected_page = index;
					}
				},
				prev_page: function(){
					var that = this;
					var index = that.selected_page - 1;
					if(index > (that.pages_indexer.length + 1)){
						that.blk_prev_page = true;
					}else{
						that.selected_page = index;
					}
				},
				gerar_gradiente : function(valor){
					if(valor === null || typeof valor == 'undefined' || valor.length == 1){
						return 'background-color: #000000;';
					}else{
						var color = "background: ";
						var perc  = 100/((valor.length)); 
						for(var a = 0;a < valor.length;a++){
							//color = color + valor[a]+' '+((a+1)*perc)+'%, ';
							var p = ((a+1)*perc)+'%';						
							color = color +'linear-gradient(110deg,'+ valor[a]+' '+p+', rgba(0, 0, 0, 0) '+p+'),';
						};
						color = color.substring(0,color.lastIndexOf(','));
						color = color+';'
						//console.log(color);
						return color;
					}					
				},
				open_link : function(link,param,dados){
					if((''+link.trim()) != ''){
						if(typeof param != 'undefined'){
							if(param.length){
								angular.forEach(param, function(item, key){
									if(link.includes(item.PARAM)){
										if(typeof item.CAMPO != 'undefined'){
											if(dados.hasOwnProperty(item.CAMPO)){
												link = link.replace(('#'+item.PARAM+'#'.trim()),dados[item.CAMPO]);
											}else{
												link = link.replace(('#'+item.PARAM+'#'.trim()),item.VALUE);
											}											
										}else{
											link = link.replace(('#'+item.PARAM+'#'.trim()),item.VALUE);
										}
									}
								});
								window.open(link,'_blank');
							}else{
								window.open(link,'_blank');
							}
						}
						
					}else{
						return false;
					}
				},
				colunas_originais 	: [],
				no_use_cache_tabela : false,
				localStorage_lite 	: true,
				destroy: function(){
					var that = this;

					that.ModalOPT.destroy();

					if(typeof gScope.childScopes == 'undefined'){ gScope.childScopes = []; }

					if(that.key_object_scop >= 0){
						var result = gScope.childScopes[that.key_object_scop];

						if(typeof result != 'undefined' && result != null){
							var childScope = result ? result.childScope : null;

							result.destroy();

							/*
							try {
								var orphaned1 = safeCompiler.findOrphanWatchers();
												safeCompiler.cleanOrphanWatchers();
								var orphaned2 = safeCompiler.findOrphanWatchers();

								console.log('Orphaned Watchers before clean: ', orphaned1.length);
								console.log('Orphaned Watchers after clean: ', orphaned2.length);
							} catch (error) {
								
							}*/

							try {

								if (typeof childScope != 'undefined') {
									childScope.$$watchers 	 = null;
									childScope.$$nextSibling = null;
									childScope.$$prevSibling = null;
									childScope.$$childHead   = null;
									childScope.$$childTail   = null;

									childScope.$destroy();
									gScope.childScopes[that.key_object_scop] = null;
								}

								var obj = $(that.componente);
								if ( obj.length > 0 ) {	
									obj.html('');
								}
								
							} catch (error) {
								
							}
						}
					}
				},
				getAllScopes: function() {
					let scopes = [];
					let elem = document.querySelector('[ng-app]');

					function collect(scope) {
						scopes.push(scope);
						let child = scope.$$childHead;
						while (child) {
							collect(child);
							child = child.$$nextSibling;
						}
					}
					collect(angular.element(elem).scope());
					return scopes;
				},
				findOrphanScopes: function() {
					const all = getAllScopes();
					return all.filter(s => !s.$root && !document.body.contains(s.$$element && s.$$element[0]));
				},
				clearOrphanScopes: function() {
					try {
						const comp = document.querySelector(that.componente);

						if (!comp) return 0;

						console.log("RESET DOM for:", comp);

						// Clone sem listeners
						const clone = comp.cloneNode(true);

						// Substitui removendo todos listeners nativos/jQuery
						comp.parentNode.replaceChild(clone, comp);

						// Agora limpa watchers órfãos
						const orphans = this.findOrphanScopes();
						console.log("Orphaned Scopes found:", orphans.length);

						orphans.forEach(s => s.$destroy());

						return orphans.length;

					} catch (e) { return 0; }
				},
				countWatchers: function() {
					let total = 0;
					const elements = document.querySelectorAll('*');

					angular.forEach(elements, element => {
						const scope = angular.element(element).scope();
						if (scope && scope.$$watchers) {
						total += scope.$$watchers.length;
						}
					});

					console.log('Watchers:', total);
				},
				tratarIDTabelas : function(){
					var that = this;

					if(typeof gScope.childScopesID == 'undefined'){ gScope.childScopesID = []; }
					if(typeof that.HACH_KAY == 'undefined'){ that.HACH_KAY = Math.floor(Math.random() * 1000000); }

					var encontrada = false;

					gScope.childScopesID.forEach((item, index) => {
						if(item.ID == that.ID && item.HACH_KAY != that.HACH_KAY){
							encontrada = true;
						}
					});

					if(encontrada == false){
						gScope.childScopesID.push({HACH_KAY: that.HACH_KAY, ID: that.ID});
					}else{
						that.ID = that.ID + '_' + that.HACH_KAY;
					}

				},
                compile: async function(eve){
					var that = this;

					that.tratarIDTabelas();

					if(typeof eve == 'undefined'){
						that.is_compile_eve = false;
					} else {
						that.is_compile_eve = true;
					}

					angular.forEach(that.COLUNAS, (value, index) => {
						if(typeof value.CHAVE_COLUNA === 'undefined'){
							value.CHAVE_COLUNA = value.CAMPO_FILTRO + '_' + index;
						}
					});

					that.bkp_is_compile_eve = that.is_compile_eve;
					that.old_coluns_tabela  = angular.copy(that.COLUNAS);

					if(that.colunas_originais.length == 0){
						that.colunas_originais = angular.copy(that.COLUNAS);
					}

					// Tenta aplicar configurações salvas deste MENU para esta tabela antes de compilar
					var appliedServer = false;
					try{

						var menuControle = that.getMenuControle();

						if(that.habilitar_load_colunas == true && menuControle > 0){
							var map = await loadColunasVisiveisPorMenu(menuControle);
							var saved = (map && map[that.ID]) ? map[that.ID] : [];
							saved = normalizarColunasSalvas(saved);
							if(saved && saved.length){
								that.COLUNAS = aplicarColunasSalvas(that.COLUNAS, saved);
								appliedServer = true;
							}
						}

					}catch(err){
						console.warn('loadColunasVisiveisPorMenu failed', err);
					}

					if(typeof that.input_disabled != 'undefined' && that.input_visible == true){
						if(typeof that.validar_focus_checkbox == 'undefined'){
							that.validar_focus_checkbox = angular.copy(that.input_disabled);
						}

						if(typeof that.validar_space_function == 'undefined'){
							that.validar_space_function = angular.copy(that.input_disabled);
						}
					}

                    var obj = $(that.componente);

					// Cache de colunas visiveis da tabela
					var check_apply = null;//JSON.parse(localStorage.getItem(that.ID));

					if(that.tabela_compilada == false){
						that.backup_colunas = angular.copy(that.COLUNAS);
					}
                    
					if( !(check_apply === null) && !(typeof check_apply === 'undefined') ){

						// Se o servidor retornou configurações salvas, elas têm precedência sobre o cache local.
						if(appliedServer){
							// Atualiza o cache local para refletir o estado do servidor (sem reaplicar o cache local sobre os dados do servidor)
							check_apply = that.COLUNAS;
						} else {
							if(typeof eve == 'undefined'){
								angular.forEach(check_apply, function(value1, ref){
									angular.forEach(that.COLUNAS, function(value2, ref){
										if(value1.CAMPO == value2.CAMPO){
											value2.VISIBLE      = value1.VISIBLE;
											value2.ORDEM        = value1.ORDEM;
										}
									});
								});
							}else{
								angular.forEach(check_apply, function(value1, ref){
									angular.forEach(that.COLUNAS, function(value2, ref){
										if(value1.CAMPO == value2.CAMPO){
											value1.VISIBLE = value2.VISIBLE;
											value1.ORDEM   = value2.ORDEM;
										}
									});
								});
							}
						}
					}

					/*
					if(that.no_use_cache_tabela == true && !appliedServer){
						that.COLUNAS 		= angular.copy(that.colunas_originais);
						that.backup_colunas = angular.copy(that.colunas_originais);
						check_apply 		= angular.copy(that.colunas_originais);
					}
					*/

                    angular.forEach(that.COLUNAS, function(item, ref){
                        item.ORDEM_TEMP   = item.ORDEM;                                  
					});
					
					if(that.filtro_visible == true){
						that.campos_filtro = [];
						
						angular.forEach(that.COLUNAS, function(item, ref){
							if(item.VISIBLE){
								that.campos_filtro.push(item.CAMPO);
							}
						});
					}

					if((check_apply === null) || (typeof check_apply === 'undefined')){						
						check_apply = angular.copy(that.COLUNAS);						
					}

					///////////////////////////////////////////////////////////////

					/*
					try {
						let colunas_padrao_tabela	= trim_null($("#campos-tabelas").val());
						colunas_padrao_tabela		= JSON.parse(colunas_padrao_tabela);

						if(!that.verificacao_inicial){
							angular.forEach(colunas_padrao_tabela, (item_r) => {
								
								if(trim_null(that.ID) === trim_null(item_r.TABELA_ID)){
									angular.forEach(that.COLUNAS, (item) => {

										if(trim_null(item_r.CHAVE_COLUNA) === trim_null(item.CHAVE_COLUNA)){
											item.VISIBLE = item_r.STATUS == 1 ? true : false;
										}

									});

									that.verificacao_inicial = true;
								}

							});
						}
					} catch (error) {
						
					}
					*/

					///////////////////////////////////////////////////////////////

					/*
					if(that.localStorage_lite == true){

						var str_json1 = isEquivalentArray(check_apply, that.colunas_originais, [], ['CAMPO','ORDEM','VISIBLE']);

						localStorage.removeItem(''+that.ID+'');

						if(!str_json1){
							localStorageInsert(''+that.ID+'', check_apply);
						}

					}else{
						localStorage.removeItem(''+that.ID+'');
						localStorageInsert(''+that.ID+'', check_apply);
					}
					*/

					that.COLUNAS.forEach(function(item){
						item.TEMP_VISIBLE = item.VISIBLE;
					});
					
					/*
					console.log('AAA:');
					console.log(angular.copy(that.COLUNAS));

					console.log('BBB:');
					console.log(that.COLUNAS);
					*/

					var html = that.getHtml();

                    if ( obj.length > 0 ) {
                    
						if(that.html_speed == true){

						}else{

							var scope = obj.scope();

							if(typeof gScope.childScopes == 'undefined'){ gScope.childScopes = []; }

							if(that.key_object_scop >= 0){
								var result = gScope.childScopes[that.key_object_scop];
								
								if(typeof result != 'undefined' && result != null){
									var childScope = result ? result.childScope : null;

									result.destroy();

									try {
										if (typeof childScope != 'undefined') {
											
											childScope.$$watchers 	 = null;
											childScope.$$nextSibling = null;
											childScope.$$prevSibling = null;
											childScope.$$childHead   = null;
											childScope.$$childTail   = null;

											childScope.$destroy();
											gScope.childScopes[that.key_object_scop] = null;
										}
									} catch (error) {
										
									}
								}
							}
							
							if(that.key_object_scop < 0){
								that.key_object_scop = gScope.childScopes.length;
							}

							////////////////////////////////////////////////////////////

								var result = safeCompiler.compileSafe({
									parentScope: scope,
									element: obj,
									html: html,
									onBeforeCompile: function(el, tChildScope) {
										// por exemplo: configurar algo no childScope
										tChildScope.staticValue = 123;
									},
									onAfterCompile: function(el, tChildScope) {
										// inicializações pós-compile
									}
								});

							////////////////////////////////////////////////////////////
							
							var newChildScope = result.childScope;
							that.compiledElement = result.compiledElement;

							gScope.childScopes[that.key_object_scop] = result;

							if(typeof that.onBeforeCompile != 'undefined'){
								that.onBeforeCompile(that,obj);
							}

							newChildScope.$on("$destroy", function() {
								that.compiledElement.remove();
							});
							
						}

						that.tabela_compilada = true;
					}
					
					if(typeof that.Confirme == 'undefined'){
						that.Confirme	= that.Confirmacao.getNew(that.model+'.Confirme');
					}	

					that.BACKUP_ID_ARR = [...that.BACKUP_ID_ARR, that.ID];
					that.BACKUP_TABELA_ID_ARR = [...that.BACKUP_TABELA_ID_ARR, that.tabela_id];

					that.fixTable(0);
					that.fimCompilar();
					
				},
				checkTableVisibility: function(visible){	
					var that = this;

					// console.log('current table visibility is: ' + visible);

					if(visible && !that.is_compile_eve){
						that.handleTableVisibility();
					}
				},
				handleTableVisibility: function() {
					var that = this;
					that.COLUNAS_VISIVEIS_OLD = angular.copy(that.COLUNAS);

					/*
					$timeout(function() {
						that.getPersistentVisible();
					}, 300);
					*/
				},
				handleVisibilityChange: function() {
					var that = this;
					that.COLUNAS_VISIVEIS_OLD = angular.copy(that.COLUNAS);
					
					/*
					if ($('#'+that.tabela_id).is(":visible") && !that.is_compile_eve) {
						$timeout(function() {
							that.getPersistentVisible();
						}, 300);
					}
					*/

				},
				recompile: function(obj) {	
					var cache = null;//localStorage.getItem(obj.ID);

					if(cache == null){

						/*
						$timeout(function() {
							obj.getPersistentVisible().then(obj.compile())
						}, 1000);
						*/

						obj.compile();
					}
				},
				key_object_scop : -1,
				no_restore_print : false,
                compile_print_html     : function(elemento,tabela){
					var that = this;
					that.loading_noscroll = true;
					var html = that.getHtml();
					//console.log(elemento);
					var obj  = $('#'+that.tabela_id+'vs_render');
					console.log(obj);
                    var check_apply = null;//JSON.parse(localStorage.getItem(that.ID));
                    //that.backup_colunas = angular.copy(that.COLUNAS);
					
					if(that.no_restore_print == false){
						if( !(check_apply === null) && !(typeof check_apply === 'undefined') ){
	
							angular.forEach(check_apply, function(value1, ref){
								angular.forEach(that.COLUNAS, function(value2, ref){
									if(value1.CAMPO == value2.CAMPO){
										value2.VISIBLE      = value1.VISIBLE;
										value2.ORDEM        = value1.ORDEM;
									}                                    
								});
							});

						}
					}

                    angular.forEach(that.COLUNAS, function(item, ref){
                        item.ORDEM_TEMP   = item.ORDEM;                                  
                    });

                    check_apply = that.COLUNAS;

					/*
					if(that.localStorage_lite == true){

						var str_json1 = isEquivalentArray(check_apply, that.old_coluns_tabela, [], ['CAMPO','ORDEM','VISIBLE']);

						localStorage.removeItem(''+that.ID+'');

						if(!str_json1){
							localStorageInsert(''+that.ID+'', check_apply);
						}

					}else{
						localStorage.removeItem(''+that.ID+'');
						localStorageInsert(''+that.ID+'', check_apply);
					}
					*/

                    if ( obj.length > 0 ) {
                        var scope = obj.scope(); 
                        obj.html(html);
						$compile(obj.contents())(scope);						 
					}

					console.log('compilei tudo p/ print');
					that.loading_noscroll = false;
					
					//console.log(angular);

				},TotalTabela : function(){
					var that 	= this;
					//console.log(that);
					var colunas = [];
					var colunas_tipadas = [];
					var valores = {};

					that.Time1 = $timeout(function(){
						// $rootScope.$apply(function(){
							
							// Array de dados
							var dados_tratar = [];

							if(typeof that.COLUNAS_TOTAIS == 'undefined'){
								dados_tratar = that.DADOS;
							}else{
								if(that.tipo_tabela == "accordion"){
									dados_tratar = that.DADOS_AGRUPAMENTO;
								}else{
									if(that.using_total_dados){
										dados_tratar = that.DADOS;									
									}else{
										dados_tratar = that.DADOS_RENDER;		
									}
								}
							}	


							// Colunas
							angular.forEach(that.COLUNAS, function(valor, chave){

								if(typeof valor.TOTAL != 'undefined' && valor.TOTAL === true){
									colunas.push(valor.CAMPO);
								}/* && typeof valor.TOTAL_TIPO == 'undefined' else if(typeof valor.TOTAL != 'undefined' && valor.TOTAL === true && typeof valor.TOTAL_TIPO != 'undefined'){
									var dados = {
										COLUNA: valor.CAMPO,
										TIPO: valor.TOTAL_TIPO
									}
									colunas_tipadas.push(dados);
								}*/

							});


							// tratamento dos dados e calculo dos totais
							angular.forEach(dados_tratar, function(item, key){
								for(var n = 0;n < colunas.length;n++){
									if(item.hasOwnProperty(colunas[n]) || item.hasOwnProperty('_TOT_'+colunas[n])){

										var coluna_dados = null;
										var coluna_valor = colunas[n];
										
										if(that.tipo_tabela == "accordion" && item.hasOwnProperty('_TOT_'+colunas[n])){
											coluna_dados = '_TOT_'+colunas[n];
										}else{
											coluna_dados = colunas[n];
										}


										// Verificação de função para condicionar os campos no totalizador
										var coluna_func_i = -1;
										for (let i_c = 0; i_c < that.COLUNAS.length; i_c++) {
											const element_c = that.COLUNAS[i_c];

											if(trim_null(element_c.CAMPO) == trim_null(colunas[n])){
												coluna_func_i = i_c;

												break;
											}
										}

										var ret_func = true;
										if(coluna_func_i > -1){
											if(typeof that.COLUNAS[coluna_func_i].FUNC_TOTAL != "undefined" && trim_null(that.COLUNAS[coluna_func_i].FUNC_TOTAL) != ''){
												ret_func = that.COLUNAS[coluna_func_i].FUNC_TOTAL(item);
											}
										}


										if(ret_func){
											if(valores.hasOwnProperty(coluna_valor)){	
												
												var vls = '';

												if((item[coluna_dados]+'').indexOf('.') > -1 && (item[coluna_dados]+'').indexOf(',') > -1){
													var vlsNoPoint 			= (item[coluna_dados]+'').replace('.','');
													var vlsVirguleToPoint 	= (vlsNoPoint+'').replace(',','.');
													vls 					= vlsVirguleToPoint;
												}else if((item[coluna_dados]+'').indexOf('.') > -1 && (item[coluna_dados]+'').indexOf(',') == -1){
													vls 					= item[coluna_dados];
												}else if((item[coluna_dados]+'').indexOf('.') == -1 && (item[coluna_dados]+'').indexOf(',') > -1){
													var vlsVirguleToPoint 	= (item[coluna_dados]+'').replace(',','.');
													vls 					= vlsVirguleToPoint;
												}else{
													if(isNaN(item[coluna_dados]) == false){
														vls 				= item[coluna_dados];
													}
												}

												var a = Number(valores[coluna_valor]);
												var b = Number(vls);
												if( isNaN(a) ){ a = 0 };
												if( isNaN(b) ){ b = 0 };

												var valor1 	= numeral(angular.copy(a)); 
												var valor2 	= numeral(angular.copy(b)); 

												var soma 	= angular.copy(valor1).add(valor2.value());
												
												valores[coluna_valor] = soma.value();
											}else{

												var vls = '';

												if((item[coluna_dados]+'').indexOf('.') > -1 && (item[coluna_dados]+'').indexOf(',') > -1){
													var vlsNoPoint 			= (item[coluna_dados]+'').replace('.','');
													var vlsVirguleToPoint 	= (vlsNoPoint+'').replace(',','.');
													vls 					= vlsVirguleToPoint;
												}else if((item[coluna_dados]+'').indexOf('.') > -1 && (item[coluna_dados]+'').indexOf(',') == -1){
													vls 					= item[coluna_dados];
												}else if((item[coluna_dados]+'').indexOf('.') == -1 && (item[coluna_dados]+'').indexOf(',') > -1){
													var vlsVirguleToPoint 	= (item[coluna_dados]+'').replace(',','.');
													vls 					= vlsVirguleToPoint;
												}else{
													if(isNaN(item[coluna_dados]) == false){
														vls 				= item[coluna_dados];
													}
												}

												var b = Number(vls);
												if( isNaN(b) ){ b = 0 };
												
												Object.defineProperty(valores, coluna_valor, {
													enumerable		: true,   // enumerável
													configurable	: true,   // configurável
													writable		: true,   // gravável
													value			: b,
													TITULO          : 0 
												});
												//console.log(valores);
											}	
										}		

									}
								}
							});
		
							that.COLUNAS_TOTAIS = valores;
							
							angular.forEach(that.COLUNAS_TOTAIS, function(valor, chave){
								var counter1 = 0;
								var counter2 = 0;
								angular.forEach(that.COLUNAS, function(valor2, chave2){

									valor2.PREFIXO = typeof valor2.PREFIXO == 'undefined' ? '' : valor2.PREFIXO;
									valor2.SUFIXO  = typeof valor2.SUFIXO  == 'undefined' ? '' : valor2.SUFIXO ;

									valor2.PREFIXOT = typeof valor2.PREFIXOT == 'undefined' ? valor2.PREFIXO : valor2.PREFIXOT;
									valor2.SUFIXOT  = typeof valor2.SUFIXOT  == 'undefined' ? valor2.SUFIXO  : valor2.SUFIXOT ;

									if(chave == valor2.CAMPO){
										
										valor2.TOTAL_TIPO = valor2.TOTAL_TIPO != 'undefined' ? valor2.TOTAL_TIPO : 'soma';

										switch (valor2.TOTAL_TIPO) {

											case 'titulo':												
												that.COLUNAS_TOTAIS[chave] = 'TOTAL:';
												that.COLUNAS_TOTAIS.TITULO = 1;
												break;
											
											case 'contador':												
												that.COLUNAS_TOTAIS[chave] = that.DADOS.length;
												break;

											case 'maximo':
												var vlr = -999999999999999;	
												for(var w = 0; w < that.DADOS.length; w++){
													var dados = that.DADOS[w];
													if(Number(dados[chave]) > vlr){
														vlr = Number(dados[chave]);
													}
												}
												that.COLUNAS_TOTAIS[chave] = vlr;
												break;

											case 'minimo':												
												var vlr = 999999999999999;	
												for(var w = 0; w < that.DADOS.length; w++){
													var dados = that.DADOS[w];
													if(Number(dados[chave]) < vlr){
														vlr = Number(dados[chave]);
													}
												}
												that.COLUNAS_TOTAIS[chave] = vlr;
												break;

											case 'media':												
												var vlr = 0;
												var cot = 0;	
												for(var w = 0; w < that.DADOS.length; w++){
													cot++;
													var dados = that.DADOS[w];
													vlr = vlr +	Number(dados[chave]);
												}
												that.COLUNAS_TOTAIS[chave] = (cot > 0 ? vlr/cot : 0);
												break;

											case 'contador2':
												for(var w = 0; w < that.DADOS.length; w++){
													var dados = that.DADOS[w];
													if(Number(dados[chave]) > 0){
														counter2 = counter2 + 1;
													}
												}
												that.COLUNAS_TOTAIS[chave] = counter2;
												break;
											default:
												that.COLUNAS_TOTAIS[chave] = valor;
											break;
										}
									}
									
								});
							});	

							angular.forEach(that.COLUNAS_TOTAIS, function(valor, chave){
								var counter1 = 0;
								var counter2 = 0;
								angular.forEach(that.COLUNAS, function(valor2, chave2){
									if(chave == valor2.CAMPO){
										switch (valor2.TOTAL_TIPO) {
											case 'formula':
											
												var formula = valor2.FORMULA;
												angular.forEach(that.COLUNAS_TOTAIS, function(vlr, campo){
													formula = (formula+'').replaceAll('#'+campo+'#', vlr);
												});

												try {
													var ret = eval(formula);
													ret = Number(ret);

													if(!isNaN(ret) && isNumber(ret) && isFinite(ret)){
														ret = Number(ret);
													}else{
														ret = 0;
													}

												} catch (error) {
													var ret = 0;
												}

												that.COLUNAS_TOTAIS[chave] = ret;
											break;
										}
									}
									
								});
							});	
							
							//console.log(that.COLUNAS_TOTAIS);	
							if(typeof that.total_end != 'undefined'){
								that.total_end.funcao();
							}
						// })

						$timeout.cancel(that.Time1);

					},100);
					
				
				},OrderTabela : function(){
					var that = this;

					var cont = $('#'+that.tabela_id+'_modal').length;

					if(cont > 0){     

						var cols  = document.getElementById(that.tabela_id+'_modal').querySelectorAll('tr.tabela_ordem');
										
						// Sempre (re)anexa handlers, removendo listeners antigos se existirem
						[].forEach.call(cols, function(col){
							try {
								if (col._dragHandlers) {
									if (col._dragHandlers.dragstart) col.removeEventListener('dragstart', col._dragHandlers.dragstart, true);
									if (col._dragHandlers.dragenter) col.removeEventListener('dragenter', col._dragHandlers.dragenter, true);
									if (col._dragHandlers.dragover) col.removeEventListener('dragover', col._dragHandlers.dragover, true);
									if (col._dragHandlers.dragleave) col.removeEventListener('dragleave', col._dragHandlers.dragleave, true);
									if (col._dragHandlers.drop) col.removeEventListener('drop', col._dragHandlers.drop, true);
									if (col._dragHandlers.dragend) col.removeEventListener('dragend', col._dragHandlers.dragend, true);
								}
							} catch (e) {
								// ignore removal errors
							}

							var handlers = {
								dragstart: handleDragStart,
								dragenter: handleDragEnter,
								dragover: handleDragOver,
								dragleave: handleDragLeave,
								drop: handleDrop,
								dragend: handleDragEnd
							};

							col._dragHandlers = handlers;

							col.addEventListener('dragstart', handlers.dragstart, true);
							col.addEventListener('dragenter', handlers.dragenter, true);
							col.addEventListener('dragover', handlers.dragover, true);
							col.addEventListener('dragleave', handlers.dragleave, true);
							col.addEventListener('drop', handlers.drop, true);
							col.addEventListener('dragend', handlers.dragend, true);
						});

						that.EVENTOS_GERADOS = true;
						
						var dragSrcEl = null;
						var oldDeag   = null;
							
						function handleDragEnd(e) {
							// this/e.target is the source node.						
							[].forEach.call(cols, function (col) {
								col.classList.remove('over');
								col.classList.remove('selected');
							});
							that.setVisible();
							//console.log('soltou o mouse');

						}
		
						function handleDragStart(e) {
							// Target (this) element is the source node.						
							this.style.opacity = '0.4';
							this.style.borderStyle = 'dotted';
							this.style.borderWidth = '2px';
							this.style.borderColor = 'rgb(51, 146, 255)';
							//this.style.cursor 	   = 'row-resize';
							oldDeag   		   = this;
							dragSrcEl 		   = this;
							//document.activeElement.classList.add('selected');
							//console.log(document.activeElement);
							e.dataTransfer.effectAllowed = 'move';
							e.dataTransfer.setData('text/html', this.innerHTML);
						}
		
						function handleDrop(e) {
							if (e.stopPropagation) {
								e.stopPropagation();
							}
						
							// Armazena o elemento alvo ANTES de perder o contexto dentro de $apply
							var dropTarget = e.target.closest('tr.tabela_ordem');

							// Não faz nada se dropar no mesmo elemento
							if (dragSrcEl != dropTarget) {
								$rootScope.$apply(function(){
									// Usa o escopo do Angular para pegar o item real sendo arrastado
									var sourceScope = angular.element(dragSrcEl).scope();
									var targetScope = angular.element(dropTarget).scope();
									
									// Pega o objeto Campo do escopo (que é a linha do ng-repeat)
									var sourceItem = sourceScope.Campo;
									var targetItem = targetScope.Campo;
									
									if(!sourceItem || !targetItem){
										console.warn('Erro: não conseguiu obter items do escopo');
										return;
									}
									
									// Encontra os índices no array baseado no ORDEM dos items
									var sourceIndex = -1;
									var targetIndex = -1;
									
									angular.forEach(that.COLUNAS, function(item, index){
										if(item === sourceItem) sourceIndex = index;
										if(item === targetItem) targetIndex = index;
									});
									
									// Se encontrou ambos os índices e são diferentes, faz a reordenação
									if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
										console.log('Reordenando: "' + sourceItem.DESCRICAO + '" de índice ' + sourceIndex + ' para ' + targetIndex);

										// Remove o item da posição original
										var movedItem = that.COLUNAS.splice(sourceIndex, 1)[0];

										// Insere na nova posição
										that.COLUNAS.splice(targetIndex, 0, movedItem);

										// Recalcula ORDEM sequencialmente
										angular.forEach(that.COLUNAS, function(item, index) {
											item.ORDEM      = index + 1;
											item.ORDEM_TEMP = index + 1; 
										});

										console.log('Novo sequenciamento:', that.COLUNAS.map(function(c) {
											return c.DESCRICAO + '(' + c.ORDEM + ')';
										}).join(' -> '));
									}
								});
							}

							oldDeag.style.opacity = '1';
							oldDeag.style.borderStyle = '';
							oldDeag.style.borderWidth = '';
							oldDeag.style.borderColor = '';

						}

						function handleDragOver(e) {
							if (e.preventDefault) {
							e.preventDefault(); // Necessary. Allows us to drop.
							}
		
							e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
							return false;
						}
		
						function handleDragEnter(e) {
							// this / e.target is the current hover target.
							this.classList.add('over');
						}
		
						function handleDragLeave(e) {
							this.classList.remove('over');  // this / e.target is previous target element.
						}
					}
				},
				FiltrarTabela	: function(campo,event){
                    var that = this;
					
                    if(that.ORDER_BY == campo){
                        that.ORDER_BY = '-'+campo;
                    }else{
                        that.ORDER_BY = campo;
                    }
				},
				ZoominItem	 : function(event,scale){
					var that = this;
					var escala = 3;
					if(typeof scale != 'undefined' && scale > 0){
						escala = scale;
					}
					if(that.imprinting == false){
						var el  = getElement(event);
						angular.element(el).css('transform','scale('+escala+')');
						angular.element(el).css('z-index','1');
						angular.element(el).css('position','relative');
						
						function getElement(event) {
							return angular.element(event.srcElement || event.target);
						}
						
					}
				},
				ZoomoutItem	 : function(event){
					var that = this;
					var el  = getElement(event);
                    angular.element(el).css('transform','scale(1)');
                    angular.element(el).css('z-index','0');
                    angular.element(el).css('position','inherit');
					
					function getElement(event) {
						return angular.element(event.srcElement || event.target);
					}
					
				},
                restaurarColunas : function(){
                    
					var that = this;
					
					angular.forEach(that.colunas_originais,function(item, key){
						item.MUDAR_ORDEM == true;
					});

					var colunas = angular.copy(that.colunas_originais);
						
					if(colunas != null && colunas.length > 0){

						that.COLUNAS = colunas;	

						/* Funcão criada para adequar o componente ao padrão de abas virtuais: */
						/* Sendo {that} a tabela a ser compilada*/
						if(typeof that.onBeforeRestore != 'undefined'){
							that.onBeforeRestore(that);
						}

						if(that.filtro_visible == true){
							that.campos_filtro = [];
							
							angular.forEach(that.COLUNAS, function(item, ref){
								if(item.VISIBLE){
									that.campos_filtro.push(item.CAMPO);
								}
							});
						}

						/*
						if(that.localStorage_lite == true){
							var str_json1 = isEquivalentArray(that.COLUNAS, that.old_coluns_tabela, [], ['CAMPO','ORDEM','VISIBLE']);
							
							localStorage.removeItem(''+that.ID+'');

							if(!str_json1){
								localStorageInsert(''+that.ID+'', that.COLUNAS);
							}

						}else{
							localStorage.removeItem(''+that.ID+'');
							localStorageInsert(''+that.ID+'', that.COLUNAS);
						}
						*/

						that.COLUNAS_RESTAURADAS = true;
						that.OrderTabela();
						that.setPersistentVisible();
					}
				},
				validarMarcarItem : function(item){
					return true;
				},
				setTableCheckList: function(campo, model){
					var that   = this;
					
					that.CheckSelect = function(item){
						console.log('Executando seleção padrão TabelaJS...');

						var that3   = this;
						var check  = -1;
						var aux    = undefined;

						if(that.validarMarcarItem(item) == false){
							item.CHECKED = false;
						}
						
						angular.forEach(that.ITENS_MARCADOS, function (dado, key){
							if(dado[that3.campo_check] == item[that3.campo_check]){
								check = key;
								aux   = item;
							}
						});
			
						if(item.CHECKED == true){
							if(check < 0){
								that.ITENS_MARCADOS.push(item);
							}
						}else{
							if(check >= 0){
								that.ITENS_MARCADOS.splice(check, 1);
							}
						}


						// that.TotalTabela();
						that.fimCheckSelect();
					}
			
					that.onMarcar  = function(item){
						console.log('Executando marcação padrão TabelaJS...');

						var that   = this;

						angular.forEach(that.DADOS, function(item, key){
							that.CheckSelect(item);
						});
					}
			
					that.campo_check    = campo;
					that.space_function = that.CheckSelect;
					that.input_visible  = true;
					that.input_model 	= false;
					that.linhas_marcadas= false;
					that.status_visible = false;
					that.marcar_linhas  = true;
					that.check_onfocus  = true;
					that.model_tabela   = that;
					that.input_function = that.model + '.CheckSelect('+model+');';
					that.ITENS_MARCADOS = [];
					that.campo_model 	= model+'.CHECKED';
					that.campo_verific  = 'CHEC_MARCADOS';
				},
				fimCheckSelect: function (){

				},
				fimCompilar: function (){

				},

				removeColunas		: removeColunas,

				disableTableCheckList: function(){
					var that = this;
					
					that.CheckSelect 	= function(item){}
					that.onMarcar    	= function(item){}					
			
					that.space_function = that.CheckSelect;
					that.input_visible  = false;
					that.input_model 	= false;
					that.linhas_marcadas= false;
					that.status_visible = true;
					that.marcar_linhas  = false;
					that.check_onfocus  = false;
					that.marcar_linhas  = false;
					that.check_onfocus  = false;
					that.ITENS_MARCADOS = [];
					that.campo_verific  = 'CHEC_MARCADOS';
				},
			};
        }

		/**
		 * Função que remove 1 ou mais campos da tabelaJS.
		 * @param {array} campos - Campos declarados na criação da sua tabela no controller.
		 * @returns {void} Remove os campos da tabela.
		 */
		function removeColunas(campos){

			var that = this;

			var colunas = angular.copy(that.COLUNAS);

			var indices = [];

			angular.forEach(colunas, function(item, key) {

				for (var index = 0; index < campos.length; index++) {
					var element = trim_null(campos[index]);

					if(trim_null(item.CAMPO) == element || trim_null(item.CAMPO) == element || trim_null(item.CAMPO) == element || trim_null(item.CAMPO) == element) {
						indices.push(angular.copy(key));
					}
				}
			});

			for (var index = 0; index < indices.length; index++) {
				var element = indices[index];
				delete colunas[element];
			}

			var filterd_array = colunas.filter(Boolean);

			that.COLUNAS = filterd_array;
			that.compile();
		}

        function getNew(){
            var that    	= this;
			var table   	= angular.copy(that.default_table);
			var tabelaHTML  = new TabelaHTML().getNew();

            table.tabela_id				= 'tabela_'+Math.floor((Math.random() * 9999999) + 1);
			table.ModalOPT.father		= table;
			table.TabelaHTML			= tabelaHTML;
			table.TabelaHTML.Tabela		= table;
			table.verificacao_inicial	= false;

            return table;
        }
		    
	    /**
	     * Return the constructor function
	     */
	    return TabelaJS;
	};
	
})(window, window.angular);
