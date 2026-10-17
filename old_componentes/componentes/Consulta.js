(function(window, angular) {
    'use strict';

	AngularFindModule.factory('$consulta' , Consulta );
	
	Consulta.$inject = [
        '$ajax',
        '$httpParamSerializer',
        '$rootScope',
        'gScope',
        '$compile',
		'$timeout',
		'$sce'
    ];

	function Consulta($ajax, $httpParamSerializer, $rootScope, gScope, $compile,$timeout,$sce) {

		var lista = [];
	    /**
	     * Constructor, with class name
	     */
	    function Consulta(data) {
	        if (data) {
	            this.setData(data);
	        }
	    }

	    /**
	     * Public method, assigned to prototype
	     */
	    var obj_Consulta = {

	        Consulta: function(data) {
	            if (data) {
	                this.setData(data);
	            }
			},
			htmlDecode: function(str) {
            
				str = str.replace(/&QUOT;/g,    '&quot;'   );
				str = str.replace(/&NBSP;/g,    '&nbsp;'   );
				str = str.replace(/&AACUTE;/g,  '&Aacute;' );
				str = str.replace(/&ACIRC;/g,   '&Acirc;'  );
				str = str.replace(/&AGRAVE;/g,  '&Agrave;' );
				str = str.replace(/&ARING;/g,   '&Aring;'  );
				str = str.replace(/&ATILDE;/g,  '&Atilde;' );
				str = str.replace(/&AUML;/g,    '&Auml;'   );
				str = str.replace(/&AELIG;/g,   '&AElig;'  );
				str = str.replace(/&EACUTE;/g,  '&Eacute;' );
				str = str.replace(/&ECIRC;/g,   '&Ecirc;'  );
				str = str.replace(/&EGRAVE;/g,  '&Egrave;' );
				str = str.replace(/&EUML;/g,    '&Euml;'   );
				str = str.replace(/&ETH;/g,     '&ETH;'    );
				str = str.replace(/&IACUTE;/g,  '&Iacute;' );
				str = str.replace(/&ICIRC;/g,   '&Icirc;'  );
				str = str.replace(/&IGRAVE;/g,  '&Igrave;' );
				str = str.replace(/&IUML;/g,    '&Iuml;'   );
				str = str.replace(/&OACUTE;/g,  '&Oacute;' );
				str = str.replace(/&OCIRC;/g,   '&Ocirc;'  );
				str = str.replace(/&OGRAVE;/g,  '&Ograve;' );
				str = str.replace(/&OSLASH;/g,  '&Oslash;' );
				str = str.replace(/&OTILDE;/g,  '&Otilde;' );
				str = str.replace(/&OUML;/g,    '&Ouml;'   );
				str = str.replace(/&UACUTE;/g,  '&Uacute;' );
				str = str.replace(/&UCIRC;/g,   '&Ucirc;'  );
				str = str.replace(/&UGRAVE;/g,  '&Ugrave;' );
				str = str.replace(/&UUML;/g,    '&Uuml;'   );
				str = str.replace(/&CCEDIL;/g,  '&Ccedil;' );
	
				return str;
			},
			trustAsHtml: function(string){
				var obj = this;
				var html = obj.htmlDecode(string);
				return $sce.trustAsHtml(html);
			},
			onScrollEnd: function(event){
				var obj = this;
				//console.log('chegamos ao final');
				if(obj.option.infinite_scroll == true && obj.option.infinite_end == false){
					//console.log(event);
					obj.option.consulta_pagina++;
					console.log('pagina atual',obj.option.consulta_pagina);
					obj.filtrar(true);
				}
				//var html = obj.htmlDecode(string);
				//eturn $sce.trustAsHtml(html);
			},
			gerar_class: function(item,focused){
				var that = this;
				var classe = '';
				if(that.option.keepitopen == true){
					item.CHECKED = !item.CHECKED;
				}
			},
			placeholder : '',
			getVisualizarReferenciaModelo: function(){
				if(typeof window.__CONSULTA_VISUALIZAR_REFERENCIA_MODELO != 'undefined'){
					return window.__CONSULTA_VISUALIZAR_REFERENCIA_MODELO;
				}

				var visualizarReferenciaModelo = '0';

				try{
					execAjaxSemProgresso('GET', '/consultas/api/VisualizarReferenciaModelo', {}, function(response){
						visualizarReferenciaModelo = trim_null(response.VISUALIZAR_REFERENCIA_MODELO);
					}, function(){
						visualizarReferenciaModelo = '0';
					}, null, false, false);
				}catch(e){
					visualizarReferenciaModelo = '0';
				}

				window.__CONSULTA_VISUALIZAR_REFERENCIA_MODELO = (visualizarReferenciaModelo == '1') ? '1' : '0';

				return window.__CONSULTA_VISUALIZAR_REFERENCIA_MODELO;
			},
	        MontarHtml: function(obj,flag){
				var that = this;

				var html_subfiltro = '';
				if(typeof obj.ARRAY_SUB_FILTRO != 'undefined'){
					for(var index_var = 0; index_var < obj.ARRAY_SUB_FILTRO.length; index_var++) {
						html_subfiltro = html_subfiltro+'<div class="consulta-sub-filtro-'+obj.ARRAY_SUB_FILTRO[index_var].VARIAVEL+'"></div>';					
					}
				}
	            var html = '';

				///////////////////////////////////////////////////////////////////////////////////
				if(typeof obj.option.sub_visualizacao != 'undefined' && obj.option.sub_visualizacao.length > 0){
					html += '<div style="display: inline-flex; flex-wrap: wrap; align-content: center;">'; // DIV de junção do campo de sub-visualização
				}
				///////////////////////////////////////////////////////////////////////////////////
				// Dados Padrões da Consulta //////////////////////////////////////////////////////

	            html += '<div class="consulta-container" ng-class="{\'no-label\':'+obj.model+'.option.no_label == true}">';
	            html += '    <div class="consulta">';
				html += '        <div class="form-group '+obj.getClassForm()+'">';
				if(typeof obj.ARRAY_SUB_FILTRO != 'undefined'){
					html += '        <div class="group-consulta-sub-filtro" style="display: flex; margin-bottom: -3px;"> ';	
					html += '           <label style="margin-right: 6px; margin-top: 8px;" for="consulta-descricao" '+( obj.option.ttitle.length > 0 ? 'ttitle="'+ obj.option.ttitle +'"' : '' )+'>'+obj.option.label_descricao+'</label>'+html_subfiltro;
					html += '        </div> ';	
				}else{
					html += '           <label for="consulta-descricao" '+( obj.option.ttitle.length > 0 ? 'ttitle="'+ obj.option.ttitle +'"' : '' )+'>'+obj.option.label_descricao+'</label>'+html_subfiltro;
				}
	            html += '           <div class="input-group '+obj.option.class+'">';
	            html += '               <input placeholder="'+obj.placeholder+'" type="search" style="'+ (obj.option.width > 0 ? 'width : '+obj.option.width+'px !important;' : '') + ' '+(typeof obj.option.text_transform_input != 'undefined' ? 'text-transform:'+ obj.option.text_transform_input + ';' : '')+''+(typeof obj.option.tamanho_minimo != 'undefined' ? ' min-width:'+ obj.option.tamanho_minimo : '')+''+(typeof obj.option.tamanho_maximo != 'undefined' ? '; max-width:'+ obj.option.tamanho_maximo : '')+'" ng-focus="'+obj.model+'.Input.focus" '+( obj.option.placeholder.length > 0 ? 'placeholder="'+obj.option.placeholder+'"' : '' )+' ng-blur="'+obj.model+'.InputBlur($event)" ng-keydown="'+obj.model+'.InputKeydown($event)" name="consulta_descricao" class="form-control consulta-descricao '+obj.option.tamanho_input+' objConsulta input_consultaJS_filtro '+obj.getClassInput()+'" autocomplete="off" ng-required="'+obj.model+'.option.required" ng-readonly="'+obj.model+'.Input.readonly" ng-disabled="'+obj.model+'.Input.disabled" ng-model="'+obj.model+'.Input.value" '+( obj.option.input_width.length > 0 ? 'style="width: '+ obj.option.input_width +' !important"' : '' )+' '+(typeof obj.option.placeholder != undefined ? 'placeholder="'+ obj.option.placeholder +'"' : '' )+' />';            
	            html += '               <button type="button" ng-click="'+obj.model+'.apagar(true)" class="input-group-addon btn-filtro btn-apagar-filtro btn-apagar-filtro-consulta search-button" style="display: block !important;" ng-if="'+obj.model+'.btn_apagar_filtro.visivel" ng-disabled="'+obj.model+'.btn_apagar_filtro.disabled" tabindex="-1" ><span class="fa fa-close"></span></button>';
	            html += '               <button type="button" ng-click="'+obj.model+'.setFocusInput(); '+obj.model+'.filtrar()" class="input-group-addon btn-filtro btn-filtro-consulta search-button '+obj.getClassButton()+'" disabled tabindex="-1"  style="display: block !important;" ng-if="'+obj.model+'.btn_filtro.visivel" ng-disabled="'+obj.model+'.btn_filtro.disabled"><span class="fa fa-search"></span></button>';
	            html += '               <div ng-style="'+obj.model+'.tabela.style" ng-if="'+obj.model+'.tabela.visivel" style="width: '+(typeof obj.option.tamanho_tabela == 'string' ? obj.option.tamanho_tabela : obj.option.tamanho_tabela > 0 ? obj.option.tamanho_tabela +'px' : 'auto')+'; max-height: '+(obj.option.altura_tabela > 0 ? obj.option.altura_tabela +'px' : '300px;')+' '+(typeof obj.option.tamanho_minimo != 'undefined' ? 'min-width:'+ obj.option.tamanho_minimo : '')+''+(typeof obj.option.tamanho_tabela_max == 'string' ? obj.option.tamanho_tabela_max : '')+''+'" class="pesquisa-res-container ativo lista-consulta-container '+obj.getClassPesqContainer()+'">';
	            html += '<div ng-click="'+obj.model+'.closeTab()" class="item-close-tab" style="width: 30px; height: 30px; position: fixed; right: 20px; top: 69px;  color: white !important; z-index: 99 !important; background-color: #ff6666 !important; padding: 1px 5px 0px 5px !important; border-radius: 25px !important; font-size: 20px !important; margin-right: -5px !important;"></div>'
				html += '                   <div class="pesquisa-res lista-consulta table-ec" on-scroll-to-bottom=" '+obj.model+'.onScrollEnd($event)">';
					if(obj.option.infinite_scroll == true){
						html += ' <div ng-if="'+obj.model+'.consultando" style="position: absolute; opacity: 0.75; width: 100%; height: 100%; z-index: 10; background-color: rgb(255, 255, 255);">';
						html += ' <img style="width: 100px; height: 100px; top: calc(50% - 50px); left: calc(50% - 50px); position: relative;"';
						html += ' src="'+urlhost+'/assets/images/loading.gif"/> </div>';
					}
	            html += '                       <table class="table table-condensed table-striped table-bordered table-hover selectable '+obj.getClassTabela()+'">';
	            html += '                           <thead>';
				html += '                               <tr ng-focus="'+obj.model+'.focus()" >';
				
				
				angular.forEach(obj.option.campos_tabela, function(iten, key) {
					if(typeof iten[0] == 'string'){
						html += '                                   <th>'+iten[1] + ((obj.option.campos_tabela.length-1) == key ? '<span title="Atualizar dados" style="float: right; color: white;" class="glyphicon glyphicon-refresh" ng-if="'+obj.model+'.id_cached != \'0\'" ng-click="'+obj.model+'.apagarCache()" ></span>' : '')  +'</th>';
					}else if (typeof iten[0] == 'object'){

						var htmlTtitle = typeof iten[0].TTITLE == 'undefined' || (typeof iten[0].TTITLE != 'undefined' && iten[0].TTITLE == '') ? '' : 'ttitle="'+iten[0].TTITLE+'"';
						html += '                                   <th '+htmlTtitle+'>'+iten[1] + ((obj.option.campos_tabela.length-1) == key ? '<span title="Atualizar dados" style="float: right; color: white;" class="glyphicon glyphicon-refresh" ng-if="'+obj.model+'.id_cached != \'0\'" ng-click="'+obj.model+'.apagarCache()" ></span>' : '')  +'</th>';

					}
				});


	            html += '                               </tr>';
	            html += '                           </thead>';

	            var tamanho = obj.option.campos_tabela.length;
	            html += '                           <tr ng-if="'+obj.model+'.dados.length == 0" ng-Keydown="'+obj.model+'.selecionarKeydown($event,null)" ng-click="'+obj.model+'.selecionarItem(null)" ng-focus="'+obj.model+'.focus()" class="selectable" tabindex="0">';
	            html += '                                   <td style="text-align:center;" colspan="'+tamanho+'">SEM REGISTROS</td>';
	            html += '                           </tr>';


	            html += '                           <tr ng-class="{ \'selected\' : '+obj.model+'.focused == consultaTblItem }" ng-Keydown="'+obj.model+'.selecionarKeydown($event,consultaTblItem)" style="{{ consultaTblItem.MARKED == true ? \'background-color : rgb(255, 224, 224);\' : \'\'}} {{consultaTblItem.NOT_SELECTIVE_LINE_SEARCH == 1 ? \'background-color: rgb(2 2 2) !important; color: white; font-weight: bold;\' : \'\'}}" ng-click="'+obj.model+'.selecionarItem(consultaTblItem); " ng-focus="'+obj.model+'.focus(); ' + obj.model + '.focused = consultaTblItem" ng-blur="' + obj.model + '.focused = false " class="selectable" tabindex="0" ng-repeat="consultaTblItem in '+obj.model+'.dados track by $index">';
	            
	            angular.forEach(obj.option.campos_tabela, function(iten, key) {
					var alinha = 'left';
					var textUpper = 'uppercase';
					var coluna = "";					
					if(typeof iten[0] == 'string'){
						coluna = iten[0];
					}else if (typeof iten[0] == 'object'){
						coluna = iten[0].COLUNA;
					}

					if(typeof obj.option.align_right != 'undefined'){
						//console.log(iten[0]);
						if(obj.option.align_right.indexOf(coluna) != (-1)){
							alinha = 'right';
						}
					}

					if(typeof obj.option.align_center != 'undefined'){
						//console.log(iten[0]);
						if(obj.option.align_center.indexOf(coluna) != (-1)){
							alinha = 'center';
						}
					}

					if(typeof obj.option.text_transform_none != 'undefined'){
						//console.log(coluna);
						if(obj.option.text_transform_none.indexOf(coluna) != (-1)){
							textUpper = 'none';
						}
					}
					
					if(typeof obj.option.campos_html != 'undefined' && obj.option.campos_html == true){						
						var check_html = false;
						
						if (typeof iten[0] == 'object' && typeof iten[0].HTML != 'undefined'){
							check_html = iten[0].HTML;
						}

						if(check_html == true){
							html += '	<td ng-bind-html="'+obj.model+'.trustAsHtml(consultaTblItem.'+coluna+')" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:'+alinha+';"></td>';
						}else{
							html += '   <td style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:'+alinha+'; text-transform:'+textUpper+';">{{consultaTblItem.'+coluna+'}}</td>';
						}

					}else{
						if(coluna == obj.option.campo_html){
							html += '	<td ng-bind-html="'+obj.model+'.trustAsHtml(consultaTblItem.'+coluna+')" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:'+alinha+';"></td>';
						}else if(coluna == obj.option.campo_html2){
							html += '	<td ng-bind-html="'+obj.model+'.trustAsHtml(consultaTblItem.'+coluna+')" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:'+alinha+';"></td>';
						}else{
							html += '   <td style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:'+alinha+'; text-transform:'+textUpper+';">{{consultaTblItem.'+coluna+'}}</td>';
						}
					}
				
				});

	            html += '                           </tr>';
				html += '                       </table>';
				html += '						<p ng-if="'+obj.model+'.option.infinite_end" style="font-weight: bold;margin-top: 3px;margin-bottom: 5px;text-align: center;color: crimson;"> Todos os registros foram carregados </p> ';
	            html += '                   </div>';
	            html += '               </div>';
	            html += '           </div>';
	            html += '        </div>';
	            html += '    </div>';
	            html += '</div>';  

				///////////////////////////////////////////////////////////////////////////////////
				// Montando Campo de sub-visualização /////////////////////////////////////////////

				if(typeof obj.option.sub_visualizacao != 'undefined' && obj.option.sub_visualizacao.length > 0){

					html += '<div class="consulta-subvisualizacao" style="display: contents;">';
					
					angular.forEach(obj.option.sub_visualizacao, function(iten, key) {
						var label = '';
						var coluna = '';
						var mask = '';
						var tela_vinc = '';
						var campo_tela_vinc = '';
						var campo_tab_vinc = '';
	
						label = trim_null(iten[1]).replaceAll('_', '');
						mask = typeof iten[2] != "undefined" && trim_null(iten[2]) != '' ? iten[2] : '';
						tela_vinc = typeof iten[3] != "undefined" && trim_null(iten[3]) != '' ? iten[3] : '';
						campo_tela_vinc = typeof iten[4] != "undefined" && trim_null(iten[4]) != '' ? iten[4] : '';
						campo_tab_vinc = typeof iten[5] != "undefined" && trim_null(iten[5]) != '' ? iten[5] : '';
						if(typeof iten[0] == 'string'){
							coluna = iten[0];
						}else if(typeof iten[0] == 'object'){
							coluna = iten[0].COLUNA;
						}


						if(trim_null(tela_vinc) != '' && trim_null(campo_tela_vinc) != ''){
							var link = '<a tabindex="-1" href="/_'+ tela_vinc +'?'+ campo_tela_vinc +'={{'+ obj.model +'.item.dados.'+ campo_tab_vinc +'}}" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="Abrir Tela '+ tela_vinc +'"></span></a>';
						}else if(trim_null(tela_vinc) != '' && trim_null(campo_tela_vinc) == ''){
							var link = '<a tabindex="-1" href="/_'+ tela_vinc +'" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="Abrir Tela '+ tela_vinc +'"></span></a>';
						}else{
							var link = '';
						}console.log('Tem tela: '+ tela_vinc); console.log('Tem campo: '+ campo_tela_vinc); console.log('Tem campo: '+ campo_tab_vinc);


						html += '<div class="form-group"> ';
						html += '	<label>'+label+': '+ link +'</label> ';
						html += '	<div class="link-campo-dependencia-consulta"> ';
						html += '		<span class="glyphicon glyphicon-minus icon-link-dependencia-consulta"></span> ';

						if (trim_null(mask) != '') {
							html += '<div class="input-group left-icon" style="width: auto !important;"> ';
							html += '	<div class="input-group-addon" style="padding: 9px;"> '+ mask +' </div>';
						}

						html += '		<input ';
						html += '			type="text" ';
						html += '			class="form-control input-link-dependencia-consulta normal-case" ';
						html += '			ng-model="'+obj.model+'.item.dados.'+coluna+'" ';
						html += '			readonly="readonly"> ';

						if (trim_null(mask) != '') {
							html += '</div> ';
						}

						html += '	</div> ';
						html += '</div> ';
	
					});
					html += '</div>';
	
					///////////////////////////////////////////////////////////////////////////////////
	
					html += '</div>'; // Fim da DIV de junção da sub-visualização
	
					///////////////////////////////////////////////////////////////////////////////////
				}
				

	            if(flag == 0){
		            var obj   = $(obj.componente);
                    if ( obj.length > 0 ) {
						obj.html(html);

						if(typeof gScope.childScopes == 'undefined'){ gScope.childScopes = []; }

						if(that.key_object_scop >= 0){
							var childScope = gScope.childScopes[that.key_object_scop];

							if (typeof childScope != 'undefined') {
								childScope.$destroy();
								gScope.childScopes[that.key_object_scop] = undefined;
							}
						}
						
						if(that.key_object_scop < 0){
							that.key_object_scop = gScope.childScopes.length;
						}

						var scope = obj.scope(); 
						
						childScope = scope.$new();
						gScope.childScopes[that.key_object_scop] = childScope;

						that.compiledElement = $compile(obj.contents())(childScope);
						childScope.$on("$destroy", function() {
							that.compiledElement.remove();
						});
                    }
		        }else{
		        	return html;	
		        }

			},
			key_object_scop: -1,
            id_cached : '0',
            apagarCache : function(){

                var that = this;
				var cache_id_apagar = that.option.cache_id != '' ? that.option.cache_id+'_' : '';

				if(cache_id_apagar == ''){
					localStorage.removeItem(that.id_cached);
					that.dados = [];
					that.consultar(that);
				}else {					
					var keys = Object.keys(localStorage),
					i = keys.length;

					for(var a = 0; a < i; a++) {						
						var verif_cache_id = keys[a].includes(cache_id_apagar);
						if(verif_cache_id) {
							localStorage.removeItem(keys[a]);
						}
					}
					that.dados = [];
					that.consultar(that);
				}                
            },

			validar_consultar : true,
			validarConsultar : function() {
				var that = this;
				that.validar_consultar = true;
			},

            beforeSearch : function(){},
			onAutoFiltroFimished : function(){},
			consultar: function(obj,scroll){
                var that = this;

				that.validarConsultar();

				if(that.validar_consultar){
				
					if(typeof scroll == 'undefined'){
						that.option.consulta_pagina = 0;
						that.option.infinite_end = false;
					}

					that.beforeSearch();
					
					var btn_filtro = $(this.element_input_group).find('.'+this.getClassButton());

					function beforeSend() {
						if (btn_filtro !== false){
						$(btn_filtro)
							.children()
							.addClass('fa-circle-o-notch');
						}
					}

					function complete(){
						if (btn_filtro !== false) {
							$(btn_filtro)
								.children()
								.removeClass('fa-circle-o-notch');
						}
					}

					function isEmpty(obj) {
						for(var prop in obj) {
							if(obj.hasOwnProperty(prop))
								return false;
						}

						return JSON.stringify(obj) === JSON.stringify({});
					}

					beforeSend();

					var filtro = '';

					try {
						filtro = obj.Input.value;
						if(filtro == undefined){
							filtro = "";	
						}	
					} catch (error) {}
					
					var paran = Object.assign({}, obj.option.paran);

					var dados = {FILTRO : (filtro+'').replace(/'/g, "''")};
					
					if ( isEmpty(this.option.data_request) && isEmpty(this.option.require_request) ) {
						dados.OPTIONS  = obj.option.filtro_sql;

						//////////////////////////////////////////////////////////////////////////////
						
						if(typeof that.require2 != "undefined" && that.require2.length > 0){
							if(typeof gScope.Create != "undefined" && typeof gScope.Create.model_itens != "undefined" && gScope.Create.model_itens.length > 0){
								angular.forEach(that.require2, function(item, key) {
									if(typeof item.option.id_campo_vinc_c != "undefined" && item.option.id_campo_vinc_c > 0 && typeof item.option.campo_gravar != "undefined" && trim_null(item.option.campo_gravar) != ''){
										angular.forEach(gScope.Create.model_itens[item.option.id_campo_vinc_c].OBJ_DADOS_TABELA, function(item2, key2) {
											var obj_vl = {
												dados   : item2,
												selected: true,
												tipo	: item.option.id_campo_vinc_c,
											}
			

											var index_opt = -1;
											for (let i = 0; i < dados.OPTIONS.length; i++) {
												const element = dados.OPTIONS[i];
											
												if(i > 0){
													if(element.dados[trim_null(item.option.campo_gravar)] == obj_vl.dados[trim_null(item.option.campo_gravar)]){
														index_opt = i;
														break;
													}
												}
											}

											if(index_opt > -1){
												dados.OPTIONS[index_opt] = obj_vl;
											}else{
												dados.OPTIONS.push(obj_vl);
											}
										});
									}
								});
							}
						}

						//////////////////////////////////////////////////////////////////////////////

						dados.ADD_FILTRO = obj.option.filtro_consulta;
						dados.PARAN    = paran;
						dados.CONSULTA = {
							TIPO: obj.option.consulta_tipo,
							PAGINA: obj.option.consulta_pagina * obj.option.consulta_qtd,
							QTD: obj.option.consulta_qtd,
							INFINITE_SCROLL: obj.option.infinite_scroll
						};

						if ( !isEmpty(this.option.imput_request) ) {                   
							var target = this.option.imput_request;

							var props = {};
							for (var k in target){
								if (target.hasOwnProperty(k)) {

									if ( Array.isArray(target[k]) ) {
										var model = target[k][0];
										var prop  = target[k][1];
										props[k]  = model[prop];
									} else {
										props[k] = target[k];
									}

								}
							}

							angular.extend(dados.PARAN, props);
						}
						
					} else {
						if ( !isEmpty(this.option.data_request) ) {                   
							var target = this.option.data_request;

							var props = {};
							for (var k in target){
								if (target.hasOwnProperty(k)) {

									if ( Array.isArray(target[k]) ) {
										var model = target[k][0];
										var prop  = target[k][1];
										props[k]  = model[prop];
									} else {
										props[k] = target[k];
									}

								}
							}

							angular.extend(dados, props);
						}
						if ( !isEmpty(this.option.require_request) ) {    
							var target = this.option.require_request;

							var props = {};
							for (var k in target){
								if (target.hasOwnProperty(k)) {
									var model = target[k][0].item.dados;
									var prop  = target[k][1];
									props[k]  = model[prop];
								}
							}
							angular.extend(dados, props);
						}
					}

					function executarConsulta(obj, hash){
						if(typeof scroll != 'undefined'){
							obj.consultando = true;
						}

						$ajax.post(obj.option.obj_consulta, dados, {progress:false,complete:complete})
							.then(function(response) {

								if(that.onFilter != null){
									that.onFilter();
								}
								
								if(typeof scroll != 'undefined'){
									for(var a = 0; a < response.length; a++){
										var item = response[a];
										obj.dados.push(item);
									}
									if(response.length < obj.option.consulta_qtd && obj.option.consulta_pagina > 0){
										obj.option.infinite_end = true;
										//(response.length < obj.dados.length) response.length == 0
										//showAlert('Aviso: <br> Não há registros a serem adicionados.');
									}
								}else{
									obj.dados = response;								
								}	

								that.onFormatMerge(obj.dados);

								if(typeof obj.option.imput_request._VALUE_AUTO_FILTER != 'undefined' && obj.option.imput_request._VALUE_AUTO_FILTER != null && obj.option.imput_request._VALUE_AUTO_FILTER.length > 0){
									try {
										obj.option.imput_request._VALUE_AUTO_FILTER = null;

										obj.dados.forEach(function(itemf, keyf){
											try { obj.selecionarItem(itemf);  	} catch (error) { } 
											try { obj.onSelect(itemf);  		} catch (error) { }
										});

										obj.onAutoFiltroFimished();
										obj.onAutoFiltroFimished = function(){};
										console.log('Filtro automático concluído para -> '+obj.option.label_descricao);
									} catch (error) {
										
									}
								}else{
									if(obj.dados.length == 1){
										obj.selecionarItem(obj.dados[0]);   
									}else{
										if(typeof scroll == 'undefined'){
											obj.setFocusTabela();
										}                                
									}
								}  
								
								that.id_cached   = '0';
								var timeDateHora = new Date();
								if((that.cache == true || typeof that.cache == 'undefined') && obj.dados.length > 1){
									//localStorage.setItem(hash, JSON.stringify({DADOS: obj.dados, DATA: timeDateHora}));
									localStorageInsert(hash, {DADOS: obj.dados, DATA: timeDateHora, DATA_EXPIRAR : timeDateHora});
								}
								if(that.onMerge != null && that.option.keepitopen == true){
									that.onMerge(obj.dados);
								}
								
								if(response.length < obj.option.consulta_qtd){
									obj.option.infinite_end = true;
								}else{
									obj.option.infinite_end = false;
								}
								obj.consultando = false;

								that.fimConsultar();
							},
							function(e){
								//showErro(e);
								obj.consultando = false;
							}
						);

					}

					function hashCode(str) {
						str = str + '';
						var hash = 0, i, chr;
						if (str.length === 0) return hash;
						for (i = 0; i < str.length; i++) {
						chr   = str.charCodeAt(i);
						hash  = ((hash << 5) - hash) + chr;
						hash |= 0; // Convert to 32bit integer
						}
						return hash;
					};

					var cache_id_apagar = that.option.cache_id != '' ? that.option.cache_id+'_' : '';
					var hash = cache_id_apagar+'cache' + hashCode(obj.option.obj_consulta + JSON.stringify(dados));

					if(that.cache == true){

						var cache = localStorage.getItem(hash);

						if(cache === null){
							executarConsulta(obj, hash);
						}else{

							cache  =  JSON.parse(cache);

							var outraData = new Date();
							var dataTime  = new Date(cache.DATA);
							var response  = cache.DADOS;
							
							if(!(response.length > 1)){
								executarConsulta(obj, hash);
							}else{

								dataTime.setHours(dataTime.getHours() + 24);

								if(outraData <= dataTime){

									that.id_cached = hash;

									that.Time1 = $timeout(function(){

										if(that.onFilter != null){
											console.log('tem on filter');
											that.onFilter();
										}

										obj.dados = response;
										if(that.onMerge != null && that.option.keepitopen == true){
											that.onMerge(obj.dados);
										}

										if(obj.dados.length == 1){

											obj.selecionarItem(obj.dados[0]); 

										}else{

											that.Time2 = $timeout(function(){
												obj.setFocusTabela();
												$timeout.cancel(that.Time2);
											},100);

										} 
										
										complete();
										
										$timeout.cancel(that.Time1);
										
									},100);

								}else{
									localStorage.removeItem(hash);
									executarConsulta(obj, hash);
								}
							}
						}

					}else{
						executarConsulta(obj, hash);
					}

				}

	        },
	        setData: function(data) {
	            angular.extend(this, data);
	        },
			fimConsultar: function() {

			},
	        InputKeydown: function($event){
	            if($event.key == 'Delete' && this.Input.readonly == true && this.btn_apagar_filtro.disabled == false){
	                this.apagar();   
	            }

	            if($event.key == 'Enter' && this.Input.readonly == false){
	                this.filtrar();   
	            }

	            if($event.key == 'ArrowDown' && this.tabela.visivel == true){
	                
                    var table = $($event.target).nextAll('.pesquisa-res-container').first();
                    var tr    = table.find('tbody tr:focusable').first();
                    tr.focus();
	            }
	        },
	        InputBlur: function($event){
                
                var that = this;
                                
                var input_group = $($event.relatedTarget).closest('.input-group');

                if ( !that.item.selected ) { 

                    if ( input_group.length == 0 || (input_group.length > 0 && input_group[0] != that.element_input_group)  ) {
                        if ( !that.tabela.visivel ) {
                            //that.apagar();
                            this.Input.value = '';
                        }
                    }
                }
	        },
	        selecionarKeydown: function($event,item){
	            if($event.key == 'Enter'){
	                this.selecionarItem(item);
	            }   

	            if($event.key == 'Escape'){
	                this.tabela.visivel = false;
	                this.setFocusInput();
	            }
	        },
	        vincular:function(msg){

                var msg = typeof msg == 'undefined' ? '' : msg;
                var that = this;
                
                this.require_msg = msg;

	            if(this.require != null){
	                if(Array.isArray(this.require)){
	                	that.option.filtro_sql = [];
	                    angular.forEach(this.require, function(item, key) {
	                        that.option.filtro_sql.push(item.item);
	                    });

	                    this.require.reverse();

	                    angular.forEach(this.require, function(item, key) {

	                        item.actionsSelct.push(function(){
	                            if(that.validar() && that.autoload == true){
                                    that.setFocusInput();
	                                that.filtrar();
	                            }   
	                        });

	                        item.actionsClear.push(function(){
								if(that.autoclear == true){
	                            	that.apagar();
								}
	                        });
	                    });

	                }else{

	                    this.option.filtro_sql = this.require.item;

	                    this.require.actionsSelct.push(function(){
                            if(that.validar() && that.autoload == true){
                                that.setFocusInput();
                                that.filtrar();
                            }   
	                    });
	                    this.require.actionsClear.push(function(){
							if(that.autoclear == true){
	                        	that.apagar();    
							}
	                    });
	                }
	            }
	        },
	        selecionarItem:function(item){

				var that = this;
	        	var tamanho = 0;
	        	if(this.dados != undefined){
		        	if(typeof this.dados == 'object'){
		        		tamanho = Object.keys(this.dados).length;
		        	}else{
		        		tamanho = this.dados.length;
		        	}
		        }else{
		        	tamanho = 0;	
		        }

				function tratar(){
					if(that.onSelect != null && that.vinculoEnabled == true){
	                    that.onSelect(item);
					}

					if(that.onSelectMultipla != null && that.vinculoEnabled == true){
	                    that.onSelectMultipla(item);
					}
					
					that.onFindItem();

	                if(that.vinculoEnabled == true){
		                if(that.actionsSelct != null){
							if(typeof that.option.keepitopen == 'undefined' ||
								that.option.keepitopen == false){
							
								angular.forEach(that.actionsSelct, function(item, key) {
									if(item != null){
										item();
									}
								});
							}
		                }
		            }
				}

	            if(tamanho > 0){
					   
					if(typeof that.option.keepitopen == 'undefined' || that.option.keepitopen == false){
							//Se acaso for verdadeiro a tabela não irá fechar porém irá fazer o método de onSelect...
							if(item.NOT_SELECTIVE_LINE_SEARCH == 1){								
								
							}else {
								this.tabela.visivel = false;
	
								this.btn_apagar_filtro.disabled = false;
								this.btn_apagar_filtro.visivel  = true;
	
								this.btn_filtro.disabled = true;
								this.btn_filtro.visivel  = false;
	
								this.Input.readonly = true;
	
								var valor = '';
	
								angular.forEach(this.option.obj_ret, function(campo, key) {
									if(valor == ''){
										valor  = item[campo];
									}else{
										valor += ' - ' + item[campo];    
									}
								});
	
								this.selected = item;
	
								this.item.selected = true;
								this.item.dados = item;
								
								if ( this.set_this ) {
									angular.extend(this, item);
								}
								
								//$rootScope.$apply(function(){
								that.Time3 = $timeout(function(){
									$rootScope.$apply(function(){
										that.Input.value = valor;
									});								
									tratar();
	
									$timeout.cancel(that.Time3);
									
								}, 0, false);
								//})
								
								this.setFocusInput();
								this.setDefalt();
							}
					}else{
						item.MARKED = true;
						tratar();
					}
	                	                

	            }else{
	                this.item.selected = false;
	                this.item.dados = {};
                    
	                this.tabela.visivel = false;
	                this.selected = null;
	                this.setFocusInput();
	            }
			},
			closeTab : function(){
				this.item.selected = false;
				this.item.dados = {};
				
				this.tabela.visivel = false;
				this.selected = null;
				this.setFocusInput();
			},
			tabela_fixa : false,
	        setFocusTabela: function() {
	            this.tabela.visivel = true;
                
	            var that = this;

                var input_height = that.element_input.offsetHeight;
                var table_pos    = input_height+1;
                
	            var altura    = window.innerHeight;
	            var registros = this.dados.length + 1; if(registros>8){registros = 8.7}
	            var tamanho   = (registros) * table_pos;
	            var imput     = $(this.element_form_group).find('.'+that.getClassInput());
	            var pos       = $(imput).offset();
	            var topo      = table_pos;
				var max_height= '300px';

				var coordenadas = that.element_input.getBoundingClientRect();
				var topo_tela = coordenadas.top;

				if(that.tabela_fixa == true){
					if(($('.modal.fade.in.confirm:visible')).length > 0){
						topo = topo_tela + table_pos;
					}else{
						topo = topo_tela - input_height;
					}					
				}
				
	            if(((pos.top + table_pos + tamanho) > altura)  &&  (window.innerWidth > 500)){

					if(isMobile()){
						
					}else{

						var tabdiv = (pos.top + table_pos + tamanho);

						if( (tabdiv - 60) <  altura){
							max_height= '210px';
						}else if( (tabdiv - 90) <  altura){
							max_height= '180px';
						}else if( (tabdiv - 120) <  altura){
							max_height= '150px';
						}else if( (tabdiv - 150) <  altura){
							max_height= '120px';
						}else if( (tabdiv - 180) <  altura){
							max_height= '90px';
						}else{
							if(that.tabela_fixa == true){
								topo = (topo_tela - tamanho) * -1;
								max_height= '150px';
							}else{
								topo = (tamanho * -1);
								max_height= '150px';
							}
						}
					}	
					            	
				};

				if(typeof this.option.altura_tabela != 'undefined' && this.option.altura_tabela  > 0){
					max_height = this.option.altura_tabela;
				}

				if(that.tabela_fixa == true && !isMobile()){
					var parte_css1 = {'max-height': max_height, 'top':topo, 'z-index': '99', 'position' : 'fixed'};
				}else{
					var parte_css1 = {'max-height': max_height, 'top':topo, 'z-index': '99'};
				}

				if(typeof this.option.tabela_style != 'undefined'){					
					var parte_css2 = this.option.tabela_style;
					//this.tabela.style = {...parte_css1, ...parte_css2 };
					this.tabela.style = Object.assign({}, parte_css1, parte_css2);
				}else{
					this.tabela.style = parte_css1;
				}
                
                that.Time4 = $timeout(function(){
                    
                    var tabela = $(that.element_form_group).find('.'+that.getClassTabela());

	                var tr     = $(tabela).find('tr');
	                if(tr.length > 1){
	                    $(tr[1]).focus();
	                }

                    that.element_table_container = $(that.componente).find('.pesquisa-res-container')[0];

                    var closeTable = function (e) {

                        var input_group_click = $(e.target).closest('.input-group');
                        var table_container_click = $(e.target).closest('.pesquisa-res-container');

                        if ( !that.tabela.visivel || table_container_click.length == 0 || (table_container_click.length > 0 && table_container_click[0] != that.element_table_container) ) {
                            
                            $(this).off(e);
                            
                            that.Time5 = $timeout(function(){
                                //$rootScope.$apply(function () {                            

                                    if ( !that.item.selected && !$(that.element_input).is(':focus') && !$(that.element_input).is(':disabled') && !$(that.element_button_search).is(':focus')  ) {
                                        that.apagar();
                                    }

                                    that.tabela.visivel = false;
								//});
								$timeout.cancel(that.Time5);
                            });
                        }
                    };
                    
                    $('body').focusin(closeTable);
					$('body').click(closeTable);

					$timeout.cancel(that.Time4);
                });

	            /*
	            that.pageScroll = $(document).scrollTop();
            	
            	$(document).on('mouseenter','.pesquisa-res-container.ativo',function(){
            		$(document).scroll(function() {
		                var obj = $('.pesquisa-res-container.ativo');
		                if ($(obj).length > 0) {
		                    $(document).scrollTop(that.pageScroll);
		                }
		            });
            	});
            	*/	            

	        },
	        pageScroll:0,
	        setFocusInput: function() {
	            $(this.element_form_group).find('.'+this.getClassInput()).focus();
	        },
	        focus:function(){
	            clearTimeout(this.timeFechar);
	        },     
	        compile : function (montar_html) {
                
                this.getDataComponent();
                this.MontarHtml(this,0);
                this.getScale();
                
                if ( this.option.tamanho_tabela == undefined || this.option.tamanho_tabela == null ) {
                    var input_width = $(this.element_input).width();
                    
                    if ( input_width < 300 ) {
                        this.option.tamanho_tabela = 300;
                    } else {
                        this.option.tamanho_tabela = input_width;
                    }
				}
				
				if(typeof this.ARRAY_SUB_FILTRO != 'undefined'){
					for(var index = 0; index < this.ARRAY_SUB_FILTRO.length; index++) {
						//compilar sub-filtro da consulta
						this.ARRAY_SUB_FILTRO[index].CONSULTA.compile();
						//compilar css do sub-filtro da consulta
						if(typeof this.ARRAY_SUB_FILTRO[index].CSS != 'undefined'){
							for(var index_css = 0; index_css < this.ARRAY_SUB_FILTRO[index].CSS.length; index_css++) {
								var element_css = this.ARRAY_SUB_FILTRO[index].CSS[index_css];
								//Se o css não for um atributo, tratar como css normal
								if(typeof element_css.ATTR == 'undefined'){
									if(element_css.ELEMENT == ''){
										$(this.ARRAY_SUB_FILTRO[index].CONSULTA.componente).css(element_css.TYPE,element_css.VALOR);
									}else{
										$(this.ARRAY_SUB_FILTRO[index].CONSULTA.componente).find(element_css.ELEMENT).css(element_css.TYPE,element_css.VALOR);
									}
								}else{
									if(element_css.ELEMENT == ''){
										$(this.ARRAY_SUB_FILTRO[index].CONSULTA.componente).attr(element_css.ATTR,element_css.VALOR);
									}else{
										$(this.ARRAY_SUB_FILTRO[index].CONSULTA.componente).find(element_css.ELEMENT).attr(element_css.ATTR,element_css.VALOR);
									}
								}
							}
						}
					}					
				}
                
                return this;
	        },
            getScale : function () {
                this.element_input = $(this.componente).find('.consulta-descricao')[0];
                this.element_button_search = $(this.componente).find('[type="button"].search-button')[0];
                this.element_input_group = $(this.componente).find('.input-group')[0];                
                this.element_form_group = $(this.componente).find('.form-group')[0];   
            },
            getDataComponent : function () {
                
                var label = $(this.componente).attr('x-label');
                if (typeof label !== typeof undefined && label !== false) {
                    this.option.label_descricao = label;
                }
                
                var ttitle = $(this.componente).attr('x-ttitle');
                if (typeof ttitle !== typeof undefined && ttitle !== false) {
                    this.option.ttitle = ttitle;                    
                }
                
                var required = $(this.componente).attr('x-required');
                if (typeof required !== typeof undefined && required !== false) {
                    this.option.required = required == true ? true : false;                    
                }
                
                var model = $(this.componente).attr('x-model');
                if (typeof model !== typeof undefined && model !== false) {
                    this.model = model;                    
                }
                
                var api = $(this.componente).attr('x-api');
                if (typeof api !== typeof undefined && api !== false) {
                    this.option.obj_consulta = api;                    
                }
                
                var returns = $(this.componente).attr('x-returns');
                if (typeof returns !== typeof undefined && returns !== false) {
                    returns = returns.replace(/'/g, '"');
                    returns = JSON.parse(returns);
                    this.option.obj_ret = returns;
                }
                
                var table_returns = $(this.componente).attr('x-table-returns');
                if (typeof table_returns !== typeof undefined && table_returns !== false) {
                    table_returns = table_returns.replace(/'/g, '"');
                    table_returns = JSON.parse(table_returns);
                    this.option.campos_tabela = table_returns;
                }

                var input_width = $(this.componente).attr('x-input-width');
                if (typeof input_width !== typeof undefined && input_width !== false) {
                    this.option.input_width = input_width;                    
                }                

                var table_width = $(this.componente).attr('x-table-width');
                if (typeof table_width !== typeof undefined && table_width !== false) {
                    this.option.tamanho_tabela = table_width;                    
                }     
                

                var data_request = $(this.componente).attr('x-data-request');
                if (typeof data_request !== typeof undefined && data_request !== false) {
                    data_request = data_request.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
                    data_request = JSON.parse(data_request);
                    this.option.data_request = data_request;
                }
                
            },
	        html : function () {
	            return this.MontarHtml(this,1);
            },
            require_msg : '',
	        validate:function(){
                var that = this;
	            var ret = true;


				if(typeof that.require2 != "undefined" && that.require2.length > 0){

					that.require2.reverse();
					var notificado = false;

					angular.forEach(that.require2, function(item, key) {
						if(typeof item.option.id_campo_vinc_c != "undefined" && item.option.id_campo_vinc_c > 0){
							if(typeof gScope.Create.model_itens[item.option.id_campo_vinc_c].OBJ_DADOS_TABELA == "undefined" || gScope.Create.model_itens[item.option.id_campo_vinc_c].OBJ_DADOS_TABELA.length == 0){
								item.setErro();
								item.setFocusInput();
								
								if(typeof item.option.onValidarRequired === 'function'){
									item.option.onValidarRequired();
								}
								
								ret = false;
								
								if(that.require_msg.length > 0 && notificado ==  false){
									notificado = true;
									showAlert(that.require_msg);
								}
							}
						}
					});

				}else{
					if(that.require != null){
						if(Array.isArray(that.require)){

							that.require.reverse();
							var notificado = false;

							angular.forEach(that.require, function(item, key) {
								if(item.selected == null){
									item.setErro();
									item.setFocusInput();
									
									if(typeof item.option.onValidarRequired === 'function'){
										item.option.onValidarRequired();
									}
									
									ret = false;
									
									if(that.require_msg.length > 0 && notificado ==  false){
										notificado = true;
										showAlert(that.require_msg);
									}
								}
							});

						}else{
							if(that.require.selected == null){
								that.require.setErro();
								that.require.setFocusInput();
								if(typeof that.require.option.onValidarRequired === 'function'){
									that.require.option.onValidarRequired();
								}
								ret = false;
								
								if(that.require_msg.length > 0){
									showAlert(that.require_msg);
								}
							}
						}
					}
	            }

	            return ret;

	        },
	        validar:function(){

	            var ret = true;

	            if(typeof this.require2 != "undefined" && this.require2.length > 0){
					
					this.require2.reverse();

					if(typeof gScope.Create != "undefined" && typeof gScope.Create.model_itens != "undefined" && gScope.Create.model_itens.length > 0){
						angular.forEach(this.require2, function(item, key) {
							if(typeof item.option.id_campo_vinc_c != "undefined" && item.option.id_campo_vinc_c > 0){
								if(typeof gScope.Create.model_itens[item.option.id_campo_vinc_c].OBJ_DADOS_TABELA == "undefined" || gScope.Create.model_itens[item.option.id_campo_vinc_c].OBJ_DADOS_TABELA.length == 0){
									ret = false;
								}
							}
						});
					}
				}else{
					if(this.require != null){
						if(Array.isArray(this.require)){

							this.require.reverse();

							angular.forEach(this.require, function(item, key) {
								if(item.selected == null){
									ret = false;
								}
							});

						}else{
							if(this.require.selected == null){
								ret = false;
							}
						}
	            	}
	            }

	            return ret;

            },
            clear : function (focus,withoutOnClear) {
                this.apagar(focus,withoutOnClear);
            },
	        apagar : function (focus,withoutOnClear) {

				this.validar_apagar = true;

				if(typeof this.validarApagar != 'undefined'){
					this.validarApagar();
				}
				
				if(this.validar_apagar == true){

					if(this.item.selected == true){
						this.onBeforeClear();
					}	

					if ( focus ) {
						if ( $(this.element_input).is(':focusable') ) {
							$(this.element_input).focus();
						}
					}
					
					var target = this.item.dados;
					var selected = this.item.selected;


					for (var k in target){
						if (target.hasOwnProperty(k)) {

							delete this[k];
						}
					}                
					
					this.item.selected = false;
					this.item.dados = {};

					this.tabela.visivel = false;

					this.btn_apagar_filtro.disabled = true;
					this.btn_apagar_filtro.visivel  = false;

					this.btn_filtro.disabled = false;
					this.btn_filtro.visivel  = true;

					this.Input.disabled = false;
					this.Input.readonly = false;
					this.Input.value = '';

					this.selected = null;

					if(withoutOnClear != true && this.onClear != null && this.vinculoEnabled == true){
						this.onClear();
					}

					if(this.vinculoEnabled == true){
						if(this.actionsClear != null){
							angular.forEach(this.actionsClear, function(item, key) {
								if(item != null){
									item();
								}
							});
						}
					}

					if(this.fimClear != null){
						this.fimClear(selected);
					}
					
					$(this.element_form_group).removeClass('has-error');
				}
	        },
	        filtrar : function (scroll) {

	            var validar = true;

				if(typeof this.onBeforeFiltrar != 'undefined'){
					this.onBeforeFiltrar();
				}

	            if(this.validarInput != null){
	                validar = this.validarInput();
	            }

	            if(this.validate()){
	                if(validar){
						this.consultar(this,scroll);						                    
	                }
	            }
	        },
	        disable: function(status){
	        	if(status){
//		        	this.vinculoEnabled 			= false;
					this.Input.disabled             = true;
					this.btn_apagar_filtro.visivel  = true;
					this.btn_apagar_filtro.disabled = true;
					this.disabled                   = true;
					this.btn_filtro.visivel         = false;
				}else{

					if(this.item.selected == true){
						this.btn_filtro.visivel         = false;
						this.btn_apagar_filtro.visivel  = true;
						this.Input.disabled             = false;
					}else{
						this.btn_filtro.visivel         = true;
						this.btn_apagar_filtro.visivel  = false;
						this.Input.disabled             = false;

					}

//					this.vinculoEnabled 			= true;
					this.btn_apagar_filtro.disabled = false;
					this.disabled                   = false;

				}
			},
			selecao_multipla: false,
			usuario_vinculado : false,
			onVincularUsuario : function(itens){},
			key_object_scop_filtro : 0,
			executarFiltrobtn : function(){
				
			},
			addFiltro : function(margem, variavel, campo, def, tamanho, objComItem){

				var that   = this;
				var classf = that.getClassFiltro(variavel);

				if(typeof that.ARRAY_SUB_FILTRO == 'undefined'){
					that.ARRAY_SUB_FILTRO = []
				}

				if(typeof objComItem.option.filtro_consulta == 'undefined'){
					objComItem.option.filtro_consulta = {};
				}
				objComItem.componente                  = '.consulta-sub-filtro-'+variavel;
				objComItem.option.class                = 'consulta-sub-filtro-'+variavel+'-c';
				that.ARRAY_SUB_FILTRO.push({
					VARIAVEL: variavel,
					CONSULTA: objComItem,
					CSS: [
						// {
						// 	TYPE: 'margin-top',
						// 	ELEMENT: '',
						// 	VALOR: '-26px'
						// },
						// {
						// 	TYPE: 'margin-left',
						// 	ELEMENT: '',
						// 	VALOR: margem+'px'
						// },
						// {
						// 	TYPE: 'margin-bottom',
						// 	ELEMENT: '',
						// 	VALOR: '-5px'
						// },
						{
							TYPE: 'zoom',
							ELEMENT: '.consulta',
							VALOR: '0.7'
						},
						{
							TYPE: 'display',
							ELEMENT: 'label',
							VALOR: 'none'
						},
						{
							TYPE: 'margin-top',
							ELEMENT: '.consulta-descricao',
							VALOR: 'width: '+tamanho+'px !important',
							ATTR: 'style'
						}
					]
				});
				
				objComItem.option.filtro_consulta[variavel] = def;
				objComItem.onSelect = function(objComItemValor){
					that.option.filtro_consulta[variavel] = objComItemValor[campo];
					that.apagar();
				} 
				
				objComItem.onClear = function(){
					that.option.filtro_consulta[variavel] = def;
					if(that.btn_filtro.disabled != true){
						if(objComItem.item.selected == true){
							that.apagar();
						}
					}
				}			
				// $(obj).find('.consulta').css('zoom','0.7');
				// $(obj).find('label').css('display','none');
				// $(obj).find('.consulta-descricao').attr('style', 'width: '+tamanho+'px !important');
				/*
				if ( obj.length > 0 ) {

					var html = '<a style="margin-left: 5px" tabindex="-1">'+
							   '    <span ng-click="'+obj.model+'.executarFiltrobtn();" class="glyphicon glyphicon-filter">'+
							   '</span></a>';

					obj.html(html);

					if(typeof gScope.childScopes == 'undefined'){ gScope.childScopes = []; }

					if(that.key_object_scop_filtro >= 0){
						var childScope = gScope.childScopes[that.key_object_scop_filtro];

						if (typeof childScope != 'undefined') {
							childScope.$destroy();
							gScope.childScopes[that.key_object_scop_filtro] = undefined;
						}
					}
					
					if(that.key_object_scop_filtro < 0){
						that.key_object_scop_filtro = gScope.childScopes.length;
					}

					var scope = obj.scope(); 
					
					childScope = scope.$new();
					gScope.childScopes[that.key_object_scop_filtro] = childScope;

					that.compiledElementFiltro = $compile(obj.contents())(childScope);
					childScope.$on("$destroy", function() {
						that.compiledElementFiltro.remove();
					});
				}
				*/
			},
			vincularUsuario : function(){
				var that = this;

				var btn_filtro = $(this.element_input_group).find('.'+this.getClassButton());

				function complete(){
	                if (btn_filtro !== false) {
	                    $(btn_filtro)
	                        .children()
	                        .removeClass('fa-circle-o-notch');
	                }
				}

				var dados = {
					ADD_FILTRO	: {},
					CONSULTA	: {TIPO: "", PAGINA: 0, QTD: 100, INFINITE_SCROLL: true, RET_VINCULO: true},
					FILTRO		: "",
					OPTIONS		: [],
					PARAN		: {},
				}
				
				$ajax.post(that.option.obj_consulta+'VincularUsuario', dados, {progress:false,complete:complete})
					.then(function(data) {

						var response = data.DADOS;
						var verificacaoUsuario = data.DADOS_USUARIO;

						if(response.length > 0){
							that.usuario_vinculado = true;
							if(response.length == 1 && verificacaoUsuario == true) {								
								that.setSelected(response[0]);
								if(that.selecao_multipla == true){
									that.apagar();
								}else{
									that.setSelected(response[0]);
								}
								that.btn_apagar_filtro.disabled = true;
								that.Input.disabled = true;
								that.btn_filtro.disabled = true;								
							}else {
								that.apagar();
								that.btn_apagar_filtro.disabled = false;
								that.Input.disabled = false;
								that.btn_filtro.disabled = false;
                                that.option.obj_consulta = that.option.obj_consulta +'VincularUsuario';
							}

						}else{

							that.btn_apagar_filtro.disabled = false;
                            that.Input.disabled = false;
                            that.btn_filtro.disabled = false;

						}
						
						that.DADOS_ITENS = response;
						that.onVincularUsuario(response, verificacaoUsuario);
					},
					function(e){
						showErro('Consulta sem vínculo de usuário!');
					}
				);
				
			},
	        setSelected : function(dasos, descricao){

	        	if(dasos != null){
		        	if(Object.keys(dasos).length > 0){

			        	this.selected       = dasos;   
			            this.item.dados     = dasos;
			            this.item.selected  = true;
			            this.selecionado    = true;
			            this.Input.readonly = true;
			            this.Input.readonly = true;

			            this.btn_apagar_filtro.visivel = true;
			            this.btn_apagar_filtro.disabled= false;
			            this.btn_filtro.visivel        = false;

                        if ( this.set_this ) {
                            angular.extend(this, this.selected);
                        }  
                        
                        if ( descricao == true ) {

                            if(this.onSelect != null && this.vinculoEnabled == true){
                                this.onSelect(this.item.dados);
							}

							if(this.onSelectMultipla != null && this.vinculoEnabled == true){
                                this.onSelectMultipla(this.item.dados);
							}
							
							this.onFindItem();
                        } else {
                            this.Input.value    = descricao;
                        }
                        
			            if(descricao == undefined || true ){
				            var valor = '';

			                angular.forEach(this.option.obj_ret, function(campo, key) {
			                    if(valor == ''){
			                        valor  = dasos[campo];
			                    }else{
			                        valor += ' - ' + dasos[campo];    
			                    }
			                });

			                if(valor != "undefined - undefined" && valor != "undefined" && valor != "null - null" && valor != "null"){
			                	this.Input.value = valor;
							}
			            } 
                        
                                            
			        }
				}
				
				$(this.element_form_group).removeClass('has-error');
	        },
	        setErro:function(msg){
	            $(this.element_form_group).addClass('has-error');
	        },
	        setAlert:function(msg){
	            $(this.element_form_group).addClass('has-error');
	        },
	        setDefalt:function(){
	            $(this.element_form_group).removeClass('has-error');
	        },
            setRequireRequest : function (data) {
                this.option.require_request = data;
            },            
            setDataRequest : function (data) {
                this.option.data_request = data;
            },            
	        getClassTabela:function(){
	            return this.option.class+'_tabela';
	        },
	        getClassForm:function(){
	            return this.option.class+'_forme';
	        },
			getClassPesqContainer:function(){
	            return this.option.class+'_pesqc';
	        },
	        getClassFiltro:function(variavel){
				var text165 = ''
				if(typeof variavel != 'undefined'){
					text165 = 'consulta-sub-filtro-'+variavel;
				}else{
					text165 = this.option.class+'_filtro';
				}
	            return text165;
	        },
	        getClassInput:function(){
	            return this.option.class+'_Input';
	        },
	        getClassButton:function(){
	            return this.option.class+'_button';
            },
	        vinculoEnabled	 : true,
	        actionsSelct  	 : [],
	        actionsClear  	 : [],
	        fimClear      	 : null,
			onSelect      	 : null,
			onSelectMultipla : null,
			onFindItem    	 : function(event){
				var that = this;
				findNextField(that.componente,true);
			},
			onMerge       : null,
			onFormatMerge : function(){},
			onBeforeClear : function(){},
	        onFilter      : null,
	        onClear       : null,
	        require       : null,
			require2	  : [],
	        validarInput  : null,
	        timeFechar    : null,
	        selected      : null,
            focused       : false,			
	        item          : {selected: false, dados: {}},   
	        model         : '',
	        componente    : '',
	        dados         : [],
	        tabela:{
	            disabled  : true,
	            visivel   : false,
	            style     : {'max-height':'300px'}    
	        },
	        btn_apagar_filtro: { 
	            disabled  : true,
	            visivel   : false,
	        },
	        btn_filtro: { 
	            disabled  : false,
	            visivel   : true,
	        },
	        Input: {
	            disabled  : false,
	            readonly  : false,
	            focus     : false,
	            value     : ''
            },
            autoload : true,
			autoclear: true,
            cache    : true,
	        option   : {
				campo_index		  : 'ID',
				cache_id	 	  : '',
	            label_descricao   : 'DEFAULT:',
                ttitle            : '',
	            obj_consulta      : 'Ppcp/include/_22030-gp',
	            obj_ret           : ['ID','DESCRICAO'],
	            campos_sql        : ['ID','DESCRICAO'],
	            campos_inputs     : [['_id','ID'],['_descricao','DESCRICAO']],
	            filtro_sql        : [['STATUS','1'],['ORDER','DESCRICAO,ID']],
	            campos_tabela     : [['ID','ID'],['DESCRICAO','DESCRIÇÃO']],
				sub_visualizacao  : [],
	            tamanho_input     : 'input-medio',
	            tamanho_tabela    : null,
	            required          : true,
	            class             : 'consulta_gp_grup',
	            autofocus         : false,
				selecionado       : false,
				consulta_tipo     : '',
				consulta_pagina   : 0,
				consulta_qtd      : 20,
				infinite_scroll   : false,
				infinite_end 	  : false,
	            paran             : [],
                data_request      : {},
				imput_request     : {},
                require_request   : {},
                input_width       : '',
				placeholder       : '',
				width             : 0,
				filtro_consulta   : {},
				campo_filtro	  : 'ID', //campo para filtro automático nos relatórios

				id_campo_vinc_c	  : 0,
				campo_gravar	  : '',
	        },
			contem_vinc_usuario	  : false,
	    };

	    /**
	     * Public method, assigned to prototype
	     */
	    Consulta.prototype = {
	        Consulta: function(data) {
	            if (data) {
	                this.setData(data);
	            }
	        },
	        getNew: function(set_this) {
                
	        	var item = angular.copy(obj_Consulta);
				lista.push(item);
				
				item.consulta_id = 'consulta_'+Math.floor((Math.random() * 9999999) + 1);

	        	item.pageScroll = $(document).scrollTop();
                
                if ( set_this != undefined ) {
                    item.set_this = true;
				}
				
				//item.objeto_principal = item;

	        	return item;
			},
			getConsultasPadrao : function(){

				return [
					{NOME : 'ESTABELECIMENTO'					, CAMPOS : ['ID','CODIGO','DESCRICAO','UF','REGIME_TRIBUTARIO']},
					{NOME : 'ESTABELECIMENTO_TODOS'				, CAMPOS : ['ID','CODIGO','DESCRICAO','UF','REGIME_TRIBUTARIO']},
					{NOME : 'ESTABELECIMENTO_PROD'				, CAMPOS : ['ID','CODIGO','DESCRICAO','UF','REGIME_TRIBUTARIO']},
					{NOME : 'ESTABELECIMENTO_GRUPO'				, CAMPOS : ['ID','CODIGO','DESCRICAO','UF','REGIME_TRIBUTARIO']},
					{NOME : 'BANCO'								, CAMPOS : ['ID','CODIGO','DESCRICAO','CONTA_CONTABIL','CCONTABIL']},
					{NOME : 'BANCO_INSTITUICAO'					, CAMPOS : ['ID','CODIGO','DESCRICAO']},
					{NOME : 'BANDEIRA_CARTAO'					, CAMPOS : ['ID','DESCRICAO']},					
					{NOME : 'CLASS_FINANCEIRA'					, CAMPOS : ['ID','CODIGO','DESCRICAO','HISTORICO_CONTABIL','EXIGE_EMPRESA','FCONTA','CONTA_CONTABIL','CCONTABIL','CDESCRICAO','CCODREDUZIDO']},
					{NOME : 'CLASS_FINANCEIRA_TODAS'			, CAMPOS : ['ID','CODIGO','DESCRICAO','HISTORICO_CONTABIL','EXIGE_EMPRESA','FCONTA','CONTA_CONTABIL','CCONTABIL','CDESCRICAO','CCODREDUZIDO']},
					{NOME : 'CLASS_FINANCEIRA_ANALIT'			, CAMPOS : ['ID','CODIGO','DESCRICAO','HISTORICO_CONTABIL','EXIGE_EMPRESA','FCONTA','CONTA_CONTABIL','CCONTABIL','CDESCRICAO','CCODREDUZIDO']},
					{NOME : 'CLASS_FINANCEIRA_ANALIT_GERAL'		, CAMPOS : ['ID','CODIGO','DESCRICAO','HISTORICO_CONTABIL','EXIGE_EMPRESA','FCONTA','CONTA_CONTABIL','CCONTABIL','CDESCRICAO','CCODREDUZIDO']},
					{NOME : 'CLASS_FINANCEIRA_ANALIT_ENTRADA'	, CAMPOS : ['ID','CODIGO','DESCRICAO','HISTORICO_CONTABIL','EXIGE_EMPRESA','FCONTA','CONTA_CONTABIL','CCONTABIL','CDESCRICAO','CCODREDUZIDO']},
					{NOME : 'CLASS_FINANCEIRA_ANALIT_SAIDA'		, CAMPOS : ['ID','CODIGO','DESCRICAO','HISTORICO_CONTABIL','EXIGE_EMPRESA','FCONTA','CONTA_CONTABIL','CCONTABIL','CDESCRICAO','CCODREDUZIDO']},
					{NOME : 'GRUPO_CLASS_FINANCEIRA'			, CAMPOS : ['ID','CODIGO','DESCRICAO','NIVEL','CLASSIFICACAO_CODIGO','ORDEM','OBSERVACAO','FORMULA','FORMULA_PERCENT']}, 
					{NOME : 'CARGO'								, CAMPOS : ['ID','CODIGO','DESCRICAO']},
					{NOME : 'ESCALA'							, CAMPOS : ['ID','CODIGO','DESCRICAO']},
					{NOME : 'CCUSTO'							, CAMPOS : ['CODIGO','DESCRICAO','HISTORICO_CONTABIL','ID']},
					{NOME : 'CCUSTO_USUARIO'					, CAMPOS : ['CODIGO','DESCRICAO','HISTORICO_CONTABIL','ID']},
					{NOME : 'CONTA_CONTABIL'					, CAMPOS : ['ID','CODREDUZIDO','DESCRICAO','NATUREZA','CONTA']},
					{NOME : 'EMPRESA'							, CAMPOS : ['CODIGO','ID','RAZAOSOCIAL','NOMEFANTASIA','CNPJ','CNPJ_F','BAIRRO','ENDERECO','INSCRICAO_ESTADUAL','CEP','CIDADE','NUMERO','DESC_ENDERECO','DESC_CIDADE','UF','DESC_UF']},
					{NOME : 'EMPRESA_TODAS'						, CAMPOS : ['CODIGO','ID','RAZAOSOCIAL','NOMEFANTASIA','CNPJ','CNPJ_F','BAIRRO','ENDERECO','INSCRICAO_ESTADUAL','CEP','CIDADE','NUMERO','DESC_ENDERECO','DESC_CIDADE','UF','DESC_UF']},
					{NOME : 'FAMILIA'							, CAMPOS : ['ID','CODIGO','DESCRICAO']},
					{NOME : 'FAMILIA_USUARIO'					, CAMPOS : ['ID','CODIGO','DESCRICAO']},
					{NOME : 'FAMILIA_COMPRA'					, CAMPOS : ['ID','CODIGO','DESCRICAO']},
					{NOME : 'FAMILIA_VENDA'						, CAMPOS : ['ID','CODIGO','DESCRICAO']},
					{NOME : 'PERFIL'							, CAMPOS : ['ID','DESCRICAO','FAMILIA']},
					{NOME : 'PERFILPED'							, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'PERFILSKU'							, CAMPOS : ['ID','DESCRICAO']},					
					{NOME : 'PERFILNF'							, CAMPOS : ['ID','DESCRICAO']},					
					{NOME : 'PERFILCOR'							, CAMPOS : ['ID','DESCRICAO']},					
					{NOME : 'PERFILGP'							, CAMPOS : ['ID','DESCRICAO']},					
					{NOME : 'PERFIL_PRODUCAO'					, CAMPOS : ['ID','DESCRICAO','DATA_PRODUCAO']},					
					{NOME : 'PERFIL_SKU_AGRUPADO'				, CAMPOS : ['PERFIL','FAMILIA']},					
					{NOME : 'PERFIL_MODELO'						, CAMPOS : ['ID','DESCRICAO']},	
					{NOME : 'PERFIL_CLASS_FINANCEIRA'			, CAMPOS : ['ID','DESCRICAO']},	
					{NOME : 'PERFILREM'							, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'FLUXO_PRODUCAO'					, CAMPOS : ['ID','DESCRICAO']},	
					{NOME : 'MAQUINA'							, CAMPOS : ['ID','DESCRICAO']},	
					{NOME : 'USUARIO'							, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'OPERADOR'							, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'SUPERVISOR'						, CAMPOS : ['ID','CODIGO','DESCRICAO','USUARIO_ID']},
					{NOME : 'SUPERVISOR_OFICINA'				, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'OPERACAO_ENTRADA'					, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'OPERACAO_NF_ENTRADA'				, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'OPERACAO_SAIDA'					, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'OPERACAO_NF_SAIDA'					, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'OPERACAO_GERAL'					, CAMPOS : ['ID','CODIGO','DESCRICAO','TIPO']},
					{NOME : 'OPERACAO_DOCUMENTO_FISCAL' 		, CAMPOS : ['CFOP_CODIGO', 'TRIBUTACAO_ICMS', 'ICMS', 'ICMS_NAO_CONTR', 'BASE_CALCULO_ICMS', 'ICMS_JSON', 'TRIBUTACAO_IPI', 'IPI_JSON', 'TRIBUTACAO_IPI_ENQ', 'IPI_ENQ_JSON', 'TRIBUTACAO_PIS', 'PIS_JSON', 'TRIBUTACAO_COFINS', 'COFINS_JSON', 'TRIBUTACAO_SIMPLES', 'MODALIDADE_ST', 'ALIQUOTA_ST', 'ATUALIZA_CUSTO', 'BLOQUEIA_ITEM_OC', 'CODIGO', 'CONTROLE_DEVOLUCAO', 'CONTROLE_ESTOQUE', 'CONTROLE_ESTOQUE_EXTERNO', 'CONTROLE_FATURAMENTO', 'CONTROLE_REVISAO', 'DATA', 'DESCRICAO', 'ESTOQUE', 'EXIGE_CUSTO', 'EXIGE_CUSTO_EXTERNO', 'EXIGE_DUPLICATA', 'EXIGE_LOCALIZACAO', 'EXIGE_NCM', 'EXIGE_NF_REFERENCIA', 'EXIGE_OC', 'EXIGE_PEDIDO', 'GERA_COMISSAO', 'GERA_DUPLICATA', 'GERACONSUMO', 'NOTAFISCAL', 'OPERACAOCONSUMO', 'SERVICO', 'STATUS', 'TIPO', 'ID', 'TRANSFERENCIA', 'USUARIO_CODIGO', 'CONTROLE_CONSIGNACAO', 'STATUS_DESCRICAO', 'ICONE_EXIGE_OC', 'ICONE_EXIGE_DOCUMENTO_FISCAL','VALOR_CONTABIL']},
					{NOME : 'OPERACAO_FRETE' 					, CAMPOS : ['CFOP_CODIGO', 'TRIBUTACAO_ICMS', 'ICMS', 'ICMS_NAO_CONTR', 'BASE_CALCULO_ICMS', 'ICMS_JSON', 'TRIBUTACAO_IPI', 'IPI_JSON', 'TRIBUTACAO_IPI_ENQ', 'IPI_ENQ_JSON', 'TRIBUTACAO_PIS', 'PIS_JSON', 'TRIBUTACAO_COFINS', 'COFINS_JSON', 'TRIBUTACAO_SIMPLES', 'MODALIDADE_ST', 'ALIQUOTA_ST', 'ATUALIZA_CUSTO', 'BLOQUEIA_ITEM_OC', 'CODIGO', 'CONTROLE_DEVOLUCAO', 'CONTROLE_ESTOQUE', 'CONTROLE_ESTOQUE_EXTERNO', 'CONTROLE_FATURAMENTO', 'CONTROLE_REVISAO', 'DATA', 'DESCRICAO', 'ESTOQUE', 'EXIGE_CUSTO', 'EXIGE_CUSTO_EXTERNO', 'EXIGE_DUPLICATA', 'EXIGE_LOCALIZACAO', 'EXIGE_NCM', 'EXIGE_NF_REFERENCIA', 'EXIGE_OC', 'EXIGE_PEDIDO', 'GERA_COMISSAO', 'GERA_DUPLICATA', 'GERACONSUMO', 'NOTAFISCAL', 'OPERACAOCONSUMO', 'SERVICO', 'STATUS', 'TIPO', 'ID', 'TRANSFERENCIA', 'USUARIO_CODIGO', 'CONTROLE_CONSIGNACAO', 'STATUS_DESCRICAO', 'ICONE_EXIGE_OC', 'ICONE_EXIGE_DOCUMENTO_FISCAL','VALOR_CONTABIL']},
					{NOME : 'LOCALIZACAO'						, CAMPOS : ['ID','CODIGO','DESCRICAO','NOMEFANTASIA']},
					{NOME : 'LOCALIZACAO_TODAS'					, CAMPOS : ['ID','CODIGO','DESCRICAO','NOMEFANTASIA']},
					{NOME : 'CIDADE'							, CAMPOS : ['ID','DESCRICAO','UF','CODIGOIBGE','CAPITAL','CEP','CIDADE/UF']},
					{NOME : 'CLIENTES'							, CAMPOS : ['ID','CODIGO','RAZAOSOCIAL','NOMEFANTASIA','CNPJ','CNPJ_F','BAIRRO','ENDERECO','INSCRICAO_ESTADUAL','CEP','CIDADE','NUMERO','DESC_ENDERECO','DESC_CIDADE','UF', 'DESC_EMP_GRUPO']},
					{NOME : 'CLIENTES_VINC_ESTABELECIMENTO'		, CAMPOS : ['ID','EMPRESA_DESCRICAO','DESC_ESTABELECIMENTO','CNPJ_F','UF']},
					{NOME : 'CLIENTES_CONTA_PRINCIPAL'			, CAMPOS : ['ID','CODIGO','RAZAOSOCIAL','NOMEFANTASIA','CNPJ','CNPJ_F','UF']},
					{NOME : 'FORNECEDORES'						, CAMPOS : ['ID','CODIGO','RAZAOSOCIAL','NOMEFANTASIA','CNPJ','CNPJ_F','BAIRRO','ENDERECO','INSCRICAO_ESTADUAL','CEP','CIDADE','NUMERO','DESC_ENDERECO','DESC_CIDADE','UF', 'EMAIL', 'FONE', 'CELULAR', 'CONTATO']},
					{NOME : 'TRANSPORTADORAS'					, CAMPOS : ['ID','CODIGO','RAZAOSOCIAL','NOMEFANTASIA','CNPJ','CNPJ_F','BAIRRO','ENDERECO','INSCRICAO_ESTADUAL','CEP','CIDADE','NUMERO','DESC_ENDERECO','DESC_CIDADE','UF']},
					{NOME : 'REPRESENTANTES'					, CAMPOS : ['CODIGO', 'ID', 'RAZAOSOCIAL', 'NOMEFANTASIA', 'CNPJ', 'CNPJ_F', 'BAIRRO', 'ENDERECO', 'INSCRICAO_ESTADUAL', 'CEP', 'CIDADE', 'NUMERO', 'DESC_ENDERECO', 'DESC_CIDADE', 'UF', 'STATUS', 'REPRESENTANTE_ID', 'VENDEDOR_ID', 'SUPERVISOR_ID', 'DESC_SUPERVISOR']},
					{NOME : 'UF'								, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'UF_USUARIO'						, CAMPOS : ['ID','DESCRICAO']},
					{NOME : 'CFOP'								, CAMPOS : ['ID','CODIGO','DESCRICAO','DESC_TIPO']},
					{NOME : 'CFOP_ENTRADA'						, CAMPOS : ['ID','CODIGO','DESCRICAO','DESC_TIPO']},
					{NOME : 'CFOP_FRETE'						, CAMPOS : ['ID','CODIGO','DESCRICAO','DESC_TIPO']},
					{NOME : 'CFOP_SAIDA'						, CAMPOS : ['ID','CODIGO','DESCRICAO','DESC_TIPO']},
					{NOME : 'CORES'								, CAMPOS : ['CODIGO', 'ID','DESCRICAO']},
					{NOME : 'CORES_MODELO'						, CAMPOS : ['CODIGO', 'ID','DESCRICAO']},
					{NOME : 'LINHAS'							, CAMPOS : ['ID','CODIGO','DESCRICAO','FAMILIA_CODIGO','GRADE_CODIGO','QUANTIDADE','TIPOPRODUTO_CODIGO']},
					{NOME : 'UM'								, CAMPOS : ['ID','DESCRICAO','PODE_FRACIONAR']},
					{NOME : 'COLABORADOR'						, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO', 'CCUSTO', 'CARGO', 'DESC_SIT', 'DESC_TURNO','DOCUMENTO_PIS']},
					{NOME : 'COLABORADOR_SIT'					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'CRACHA', 'SITUACAO', 'DESC_SITUACAO', 'TURNO_ID', 'DESC_TURNO_ID', 'TURNO_DESC', 'DESC_TURNO', 'CCUSTO_CODIGO', 'DESC_CCUSTO_CODIGO', 'CCUSTO_DESC', 'DESC_CCUSTO']},
					{NOME : 'COLABORADOR_TODOS'					, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO', 'CCUSTO', 'CARGO', 'DESC_SIT', 'DESC_TURNO','DOCUMENTO_PIS']},					
					{NOME : 'EXAMES'							, CAMPOS : ['DESC_ID','CODIGO', 'DESCRICAO']},					
					{NOME : 'MODELO'							, CAMPOS : ['ID', 'CODIGO', 'FAMILIA_CODIGO', 'GRADE_CODIGO', 'MATRIZ_CODIGO', 'DESCRICAO']},					
					{NOME : 'PRODUTO'							, CAMPOS : ['ID', 'CODIGO', 'FAMILIA_CODIGO', 'DESC_FAMILIA', 'UNIDADEMEDIDA_SIGLA', 'GRADE_CODIGO', 'LOCALIZACAO_CODIGO', 'TIPOPRODUTO_CODIGO', 'MODELO_CODIGO', 'DESCRICAO', 'PODE_FRACIONAR', 'DESC_UM', 'NCM_CODIGO', 'DESC_NCM', 'PRODUTO_JSON', 'LOCALIZACAO_JSON', 'FAMILIA_INVENTARIO', 'FAMILIA_ALTERNATIVA', 'DESC_FAMILIA_ALT', 'DESC_FAMILIA_INV']},
					{NOME : 'PRODUTO_TODOS'						, CAMPOS : ['ID', 'CODIGO', 'FAMILIA_CODIGO', 'DESC_FAMILIA', 'UNIDADEMEDIDA_SIGLA', 'GRADE_CODIGO', 'LOCALIZACAO_CODIGO', 'TIPOPRODUTO_CODIGO', 'MODELO_CODIGO', 'DESCRICAO', 'PODE_FRACIONAR', 'DESC_UM', 'NCM_CODIGO', 'DESC_NCM', 'PRODUTO_JSON', 'LOCALIZACAO_JSON', 'FAMILIA_INVENTARIO', 'FAMILIA_ALTERNATIVA', 'DESC_FAMILIA_ALT', 'DESC_FAMILIA_INV']},
					{NOME : 'ETIQUETA'							, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO']},					
					{NOME : 'TIPO_PRODUTO'						, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO', 'DESC_CLASSE']},
					{NOME : 'TAMANHO_MODELO'					, CAMPOS : ['MODELO_DESCRICAO', 'TAMANHO', 'TAMANHO_DESCRICAO', 'GRADE_ID']},
					{NOME : 'TAMANHO_PRODUTO'					, CAMPOS : ['TAMANHO', 'DESCRICAO', 'GRADE']},
					{NOME : 'GP'								, CAMPOS : ['CODIGO', 'ID', 'DESCRICAO', 'FAMILIA_ID', 'PERFIL', 'CCUSTO', 'VER_PECA_DISPONIVEL', 'VER_PARES', 'HABILITA_QUEBRA_TALAO_SKU', 'REQUISITA_SOBRA']},
					{NOME : 'UP'								, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO', 'FAMILIA_ID', 'PERFIL']},
					{NOME : 'UP_GERAL'							, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO', 'FAMILIA_ID', 'PERFIL', 'ETAPA_ROTEIRO', 'SETOR_RESPONSAVEL']},
					{NOME : 'UP_ETAPA'							, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO', 'FAMILIA_ID', 'PERFIL', 'ETAPA_ROTEIRO', 'SETOR_RESPONSAVEL']},
					{NOME : 'UP_SETOR'							, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO', 'FAMILIA_ID', 'PERFIL', 'ETAPA_ROTEIRO', 'SETOR_RESPONSAVEL']},
					{NOME : 'GESTOR'							, CAMPOS : ['ID', 'CODIGO', 'NOME']},
					{NOME : 'TURNO'								, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO']},
					{NOME : 'CONDICAO_PAGAMENTO'				, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO']},
					{NOME : 'FORMA_PAGEMENTO'					, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO']},
					{NOME : 'PARAMETRO_OPERADOR'	    		, CAMPOS : ['ID', 'CODIGO', 'DESCRICAO']},     
					{NOME : 'MATRIZ'							, CAMPOS : ['ID', 'DESCRICAO']},
					{NOME : 'POSICAO_S'							, CAMPOS : ['ID', 'DESCRICAO']},
					{NOME : 'COBRANCA_S'						, CAMPOS : ['ID', 'DESCRICAO']},
					{NOME : 'MODALIDADE_S'						, CAMPOS : ['ID', 'DESCRICAO']},					
					{NOME : 'OPERACAO_CRE'						, CAMPOS : ['ID', 'DESCRICAO']},
					{NOME : 'OPERACAO_CPA'						, CAMPOS : ['ID', 'DESCRICAO']},					
					{NOME : 'TABELA_PRECO_TODAS'				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO','DESC_ESTAB']},					
					{NOME : 'TABELA_PRECO'						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO','DESC_ESTAB']},					
					{NOME : 'TABELA_PRECO_POR_USUARIO'			, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO','DESC_ESTAB']},					
					{NOME : 'CAIXA_PDV'							, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO','DESC_PDV']},					
					{NOME : 'PEDIDO'							, CAMPOS : ['PEDIDO', 'PEDIDO_CLIENTE', 'NOMEFANTASIA']},				
					{NOME : 'REMESSA'							, CAMPOS : ['REMESSA', 'DATA', 'FAMILIA', 'MODELOS', 'NUMERO']},
					{NOME : 'VEICULO'							, CAMPOS : ['ID', 'MARCA', 'MODELO', 'ANO', 'PLACA', 'RNTRC']},
					{NOME : 'VENDEDORES'						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'REPRESENTANTE_ID']},
					{NOME : 'CORRETORES'						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'GRUPO_PRODUTO'						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'VERBA'								, CAMPOS : ['ID', 'DESC_ID', 'CODIGO', 'DESC_CODIGO', 'DESCRICAO']},
					{NOME : 'GRADE'								, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'FORMULARIO_TIPO_1' 				, CAMPOS : ['ID', 'DESC_ID', 'TITULO', 'PERIODO_INI_FORMAT', 'PERIODO_FIM_FORMAT']},
					{NOME : 'FORMULARIO_TIPO_2' 				, CAMPOS : ['ID', 'DESC_ID', 'TITULO', 'PERIODO_INI_FORMAT', 'PERIODO_FIM_FORMAT']},
					{NOME : 'FORMULARIO_TIPO_3' 				, CAMPOS : ['ID', 'DESC_ID', 'TITULO', 'PERIODO_INI_FORMAT', 'PERIODO_FIM_FORMAT']},
					{NOME : 'AGRUPAMENTO' 						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'DATA_INICIAL', 'DATA_FINAL']},
					{NOME : 'GRUPO_CLIENTE' 					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'GRUPO_FORNECEDOR' 					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'GRUPO_CLIENTE_FORNECEDOR' 			, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'DESC_TIPO']},
					{NOME : 'PRODUTO_SEM_MODELO' 				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'UNIDADEMEDIDA_SIGLA', 'DESC_FAM_ALT']},
					{NOME : 'TIPO_CLIENTE' 	    				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'DEFEITOS' 							, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO','SETOR']},
					{NOME : 'CANAL_VENDAS' 	    				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'SUBCANAL_VENDAS' 	    			, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'ROTAS'		 	    				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'TIPO_EMBALAGEM'    				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},					
					{NOME : 'REGIAO' 	    					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'MICRORREGIAO'    					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'FOLHA_PAGAMENTO'					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'CAIXABANCO_ID', 'CLASSIFICACAO_CODIGO', 'CCUSTO_CODIGO', 'FORMA_PAGAMENTO_ID']},
					{NOME : 'CENTRO_NEGOCIO'   					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'PACIENTE'   						, CAMPOS : ['ID', 'DESC_ID', 'NOME', 'CPF']},
					{NOME : 'PROFISSIONAL' 						, CAMPOS : ['ID', 'DESC_ID', 'NOME']},
					{NOME : 'CLINICA' 							, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'CONSULTORIO' 						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'SOCIO' 							, CAMPOS : ['ID', 'DESC_ID', 'NOME']},
					{NOME : 'CONTADOR' 							, CAMPOS : ['ID', 'DESC_ID', 'NOME']},
					{NOME : 'SETOR'								, CAMPOS : ['CODIGO', 'DESCRICAO']},
					{NOME : 'SERVIDOR'							, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'ATRIBUTOS'							, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'SERVIDOR_URL'						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'DESCRICAO_RESUMIDA', 'URL', 'FB_ADMIN_ID']},
					{NOME : 'CLIENTE_SITUACAO'					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'FICHA_PROCESSO_REL'				, CAMPOS : ['VALOR']},
					{NOME : 'TRIBUTACAO_ICMS'					, CAMPOS : ['CST', 'DESCRICAO']},
					{NOME : 'TRIBUTACAO_IPI_ENTRADA'			, CAMPOS : ['CST', 'DESCRICAO']},
					{NOME : 'TRIBUTACAO_IPI_SAIDA'				, CAMPOS : ['CST', 'DESCRICAO']},
					{NOME : 'TRIBUTACAO_PIS_ENTRADA'			, CAMPOS : ['CST', 'DESCRICAO']},
					{NOME : 'TRIBUTACAO_PIS_SAIDA'				, CAMPOS : ['CST', 'DESCRICAO']},
					{NOME : 'TRIBUTACAO_COFINS_ENTRADA'			, CAMPOS : ['CST', 'DESCRICAO']},
					{NOME : 'TRIBUTACAO_COFINS_SAIDA'			, CAMPOS : ['CST', 'DESCRICAO']},
					{NOME : 'BASE_LEGAL'	 					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},

					{NOME : 'MOTIVO_ENCERRAMENTO_PED'			, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'PAINEL_CASO'						, CAMPOS : ['ID', 'DESC_ID', 'TITULO', 'DESCRICAO', 'VERSAO']},
					{NOME : 'MERCADO'							, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'SITUACAO_PONTO'					, CAMPOS : ['ID', 'DESC_ID', 'CODIGO', 'DESC_CODIGO', 'DESCRICAO', 'OPERADOR_BH', 'REL_CARTAO_PONTO', 'REL_OCORRENCIAS', 'REL_FALTAS', 'AFASTAMENTO', 'PERC_HREXTRA', 'ADD_ACJEF', 'ABSENTEISMO', 'SITUACAO_TIPO', 'VERBA_ID', 'GERAR_DSR']},
					{NOME : 'ROTEIRO_ETAPAS'					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'ROTEIRO_PRODUCAO_TIPO'				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'GRUPO_ESTABELECIMENTO'				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'PERFIL_ESTABELECIMENTO'			, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'TIPO_PEDIDO'						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'PREVISAO_VENDA'					, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'PERIODO']},
					{NOME : 'FORMULARIO_AVALIACAO'				, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO', 'DATA_INICIO', 'DATA_INICIO_FORMAT', 'DATA_FIM', 'DATA_FIM_FORMAT', 'PERIODO_FORMAT']},
					{NOME : 'CONF_ALOCACAO'						, CAMPOS : ['ID', 'DESC_ID', 'DESCRICAO']},
					{NOME : 'MARCA'								, CAMPOS : ['MARCA']},
					{NOME : 'CATALOGO'							, CAMPOS : ['ID', 'DESC_ID', 'DATA_INICIAL', 'DATA_INICIAL_FORMAT', 'DATA_FIM', 'DATA_FIM_FORMAT', 'DESCRICAO']},
				];
				
			},
            getConsultaPadrao:function(TIPO, componente, descricao){
                var that = this;
				var consulta = that.getNew(true);				

				switch(TIPO) {
					case 'DEFEITOS':
					  	// Consulta Estabelecimento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Defeito: <a tabindex="-1" href="'+urlhost+'/_22330" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22330 - Cadastro de Defeitos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Defeito';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['SETOR','SETOR']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CANAL_VENDAS':
					  	// Consulta de Canal de Vendas						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Canal de Vendas: <a tabindex="-1" href="'+urlhost+'/_12470" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12470 - Cadastro de Canais de Vendas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CanalVenda';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'SUBCANAL_VENDAS':
					  	// Consulta de Subcanal de Vendas						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Subcanal de Vendas: <a tabindex="-1" href="'+urlhost+'/_12720" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12720 - Cadastro de Subcanais de Venda"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/SubcanalVenda';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'ROTAS':
					  	// Consulta de Canal de Vendas						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Rota: <a tabindex="-1" href="'+urlhost+'/_14270" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="14270 - Cadastro de Rotas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Rotas';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'TIPO_EMBALAGEM':
						// Consulta Tipos de Embalagem						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Tipo de Embalagem: <a tabindex="-1" href="'+urlhost+'/_12510" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12510 - Cadastro de Tipos de Embalagens"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TipoEmbalagem';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
						
					case 'DEFEITOS2':
					  	// Consulta Defeitos						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Defeito: <a tabindex="-1" href="'+urlhost+'/_22330" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22330 - Cadastro de Defeitos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Defeito';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['SETOR','SETOR']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'TIPO_CLIENTE':
					  	// Consulta Tipo de Cliente						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Tipo de Cliente: <a tabindex="-1" href="'+urlhost+'/_12130" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12130 - Cadastro de Tipos de Clientes"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TipoCliente';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CLIENTE_SITUACAO':
					  	// Consulta Cliente Situação						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Situação do Cliente: ';
						consulta.option.obj_consulta         = '/consultas/api/ClienteSituacao';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'MATRIZ':
					  	// Consulta Matriz						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Matriz: <a tabindex="-1" href="'+urlhost+'/_22490" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22490 - Cadastro de Matrizes para Modelos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Matriz';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'AGRUPAMENTO':
					  	// Consulta Agrupamento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Agrupamento: <a tabindex="-1" href="'+urlhost+'/_22690" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22690 - Registro de Agrupamento para Produção"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Agrupamento';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['DATA_INICIAL','DATA INICIAL'],['DATA_FINAL','DATA FINAL']];
						consulta.option.filtro_sql           = {STATUS: 1};
					  	break;

					case 'ESTABELECIMENTO':
						// Consulta Estabelecimento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Estabelecimento: <a tabindex="-1" href="'+urlhost+'/_11630" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11630 - Cadastro de Estabelecimentos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Estabelecimento';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','NOME FANTASIA'],['UF','UF'],['GRUPO_ESTABELECIMENTO','GRUPO'],['PERFIL_ESTABELECIMENTO','PERFIL']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'ESTABELECIMENTO_TODOS':
						// Consulta Estabelecimento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Estabelecimento: <a tabindex="-1" href="'+urlhost+'/_11630" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11630 - Cadastro de Estabelecimentos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/EstabelecimentoTodos';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','NOME FANTASIA'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'ESTABELECIMENTO_PROD':
						// Consulta Estabelecimento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Estabelecimento: <a tabindex="-1" href="'+urlhost+'/_11630" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11630 - Cadastro de Estabelecimentos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/EstabelecimentoProd';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','NOME FANTASIA'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'ESTABELECIMENTO_GRUPO':
						// Consulta Estabelecimento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Estabelecimento: <a tabindex="-1" href="'+urlhost+'/_11630" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11630 - Cadastro de Estabelecimentos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/EstabelecimentoGrupo';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','NOME FANTASIA'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'BANCO':
					  	// Consulta Caixa/banco					  
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Caixa/Banco: <a tabindex="-1" href="'+urlhost+'/_20310" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20310 - Cadastro de Caixas e Bancos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Banco';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};					  
					  	break;

					case 'BANCO_INSTITUICAO':
					  	// Consulta Caixa/banco					  
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Banco:';
						consulta.option.obj_consulta         = '/consultas/api/BancoInstituicao';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['CODIGO','DESCRICAO'];
						consulta.option.campos_tabela        = [['CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};					  
					  	break;

					case 'BANDEIRA_CARTAO':
					  	// Consulta Bandeira				  
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Bandeira: <a tabindex="-1" href="'+urlhost+'/_20221" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20221 - Cadastro de Bandeiras de Cartão"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/BandeiraCartao';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};					  
					  	break;

					case 'CLASS_FINANCEIRA':
						// Consulta Classif. Financeira
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Classif.Financeira:  <a tabindex="-1" href="'+urlhost+'/_20230" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20230 - Cadastro de Classificações Financeiras"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClassfFinanceira';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 550;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO'], ['FCONTA', 'CONTA CONTÁBIL']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'CLASS_FINANCEIRA_TODAS':
						// Consulta Classif. Financeira
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Classif.Financeira:  <a tabindex="-1" href="'+urlhost+'/_20230" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20230 - Cadastro de Classificações Financeiras"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClassfFinanceiraTodas';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 550;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO'], ['FCONTA', 'CONTA CONTÁBIL']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CLASS_FINANCEIRA_ANALIT':
						// Consulta Classif. Financeira
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Classif.Financeira:  <a tabindex="-1" href="'+urlhost+'/_20230" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20230 - Cadastro de Classificações Financeiras"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClassfFinanceiraAnalitics';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 550;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO'], ['FCONTA', 'CONTA CONTÁBIL']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CLASS_FINANCEIRA_ANALIT_GERAL':
						// Consulta Classif. Financeira com Todas as Classificações
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Classif.Financeira:  <a tabindex="-1" href="'+urlhost+'/_20230" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20230 - Cadastro de Classificações Financeiras"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClassfFinanceiraAnaliticsGeral';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 550;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO'], ['FCONTA', 'CONTA CONTÁBIL']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CLASS_FINANCEIRA_ANALIT_ENTRADA':
						// Consulta Classif. Financeira de Natureza de Entrada
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Classif.Financeira:  <a tabindex="-1" href="'+urlhost+'/_20230" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20230 - Cadastro de Classificações Financeiras"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClassfFinanceiraAnaliticsEntrada';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 550;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO'], ['FCONTA', 'CONTA CONTÁBIL']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CLASS_FINANCEIRA_ANALIT_SAIDA':
						// Consulta Classif. Financeira de Natureza de Saída
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Classif.Financeira:  <a tabindex="-1" href="'+urlhost+'/_20230" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20230 - Cadastro de Classificações Financeiras"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClassfFinanceiraAnaliticsSaida';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 550;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO'], ['FCONTA', 'CONTA CONTÁBIL']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'GRUPO_CLASS_FINANCEIRA':
						// Consulta Classif. Financeira
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Classif.Financeira:  <a tabindex="-1" href="'+urlhost+'/_20230" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20230 - Cadastro de Classificações Financeiras"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClassfFinanceiraGrupo';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 550;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CARGO':
						// Consulta Cargos
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Cargo:  <a tabindex="-1" href="'+urlhost+'/_23040" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23040 - Cadastro de Cargos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Cargos';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 440;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'ESCALA':
						// Consulta Escalas
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Escala:  <a tabindex="-1" href="'+urlhost+'/_23190" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23190 - Cadastro de Escalas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Escalas';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 340;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
	
					case 'CCUSTO':
						//Consulta Centro de Custo
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Centro de Custo:  <a tabindex="-1" href="'+urlhost+'/_20240" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20240 - Cadastro de Centros de Custo"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Ccusto';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						
						consulta.option.filtro_sql           = {STATUS: 1};					  
						break;

					case 'CCUSTO_USUARIO':
						//Consulta Centro de Custo
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Centro de Custo:  <a tabindex="-1" href="'+urlhost+'/_20240" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20240 - Cadastro de Centros de Custo"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CcustoUsuario';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						consulta.contem_vinc_usuario		 = true;
						consulta.option.filtro_sql           = {STATUS: 1};					  
						break;

					case 'CONTA_CONTABIL':
						//Consulta Contas Contábeis
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Conta Contábil:   <a tabindex="-1" href="'+urlhost+'/_17151" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="17151 - Cadastro de Contas Contábeis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ContaContabil';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_tabela       = 500;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CONTA'],['CODREDUZIDO','CÓD.RED.'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'EMPRESA':
						//Consulta Empresas
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Empresa:   <a tabindex="-1" href="'+urlhost+'/_14080" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="14080 - Cadastro de Fornecedores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Empresa';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','RAZAOSOCIAL'];
						consulta.option.campos_tabela        = [['ID','ID'],['RAZAOSOCIAL','NOME'],['NOMEFANTASIA','NOME FANTASIA'],['CNPJ_F','CNPJ'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'EMPRESA_TODAS':
						//Consulta Empresas
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Empresa:   <a tabindex="-1" href="'+urlhost+'/_14080" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="14080 - Cadastro de Fornecedores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/EmpresaTodas';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','RAZAOSOCIAL'];
						consulta.option.campos_tabela        = [['ID','ID'],['RAZAOSOCIAL','NOME'],['NOMEFANTASIA','NOME FANTASIA'],['CNPJ_F','CNPJ'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'FAMILIA':
						//Consulta Familias
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Família:   <a tabindex="-1" href="'+urlhost+'/_27080" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="27080 - Cadastro de Familias de Produto"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Familia';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['DESC_TIPOPRODUTO','TIPO DO PRODUTO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'FAMILIA_USUARIO':
						//Consulta Familias
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Família:   <a tabindex="-1" href="'+urlhost+'/_27080" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="27080 - Cadastro de Familias de Produto"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/FamiliaUsuario';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['DESC_TIPOPRODUTO','TIPO DO PRODUTO']];
						consulta.contem_vinc_usuario		 = true;
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'FAMILIA_COMPRA':
						//Consulta Familias
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Família:   <a tabindex="-1" href="'+urlhost+'/_27080" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="27080 - Cadastro de Familias de Produto"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/FamiliaCompra';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['DESC_TIPOPRODUTO','TIPO DO PRODUTO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'FAMILIA_VENDA':
						//Consulta Familias
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Família:   <a tabindex="-1" href="'+urlhost+'/_27080" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="27080 - Cadastro de Familias de Produto"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/FamiliaVenda';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['DESC_TIPOPRODUTO','TIPO DO PRODUTO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'PERFIL':
						//Consulta Perfil
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Perfil';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['FAMILIA','FAMÍLIA']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'PERFILPED':
						//Consulta Perfil de Pedidos
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil de Pedidos:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilPed';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'PERFILSKU':
						//Consulta Perfil de SKU
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil SKU:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilSKU';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'PERFILNF':
						//Consulta Perfil de NF
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil NF:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilNF';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 1400;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESCRICAO_COMPLETA'];
						consulta.option.campos_tabela        = [['NATUREZA','NATUREZA'],['DESCRICAO','DESCRIÇÃO'],['DESCRICAO_COMPLETA','COMPLEMENTO'],['CFOP_OPER','CFOP/OPER'],['SERIE','SÉRIE'],['DESTINATARIO_FISCAL','DESTINATÁRIO'],['QTD_PEDIDO','QTD.PEDIDO'],['ID','ID']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
				
					case 'PERFILCOR':
						//Consulta Perfil de Cores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil Cor:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilCOR';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
			
					case 'PERFILGP':
						//Consulta Perfil de GP
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil GP:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilGP';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'PERFIL_PRODUCAO':
						//Consulta Perfil de GP
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil GP:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilProducao';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'PERFIL_SKU_AGRUPADO':
						//Consulta Perfil de SKU Agrupado
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil SKU:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilSKUAGP';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'PERFIL';
						consulta.option.obj_ret              = ['PERFIL','FAMILIA'];
						consulta.option.campos_tabela        = [['PERFIL','PERFIL'],['FAMILIA','FAMÍLIA']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'PERFIL_MODELO':
						//Consulta Perfil de Modelo
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil Modelo:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilModelo';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'PERFIL_CLASS_FINANCEIRA':
						//Consulta Perfil de Modelo
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil Class.Financeira:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilClassFinanceira';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
						
					case 'PERFILREM':
						//Consulta Perfil de Modelo
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil Remessa:   <a tabindex="-1" href="'+urlhost+'/_11640" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11640 - Cadastro de Perfis"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilRemessa'; 
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1}; 
						break;

					case 'FLUXO_PRODUCAO':
						//Consulta Fluxo de Produção
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Fluxo de Produção:   <a tabindex="-1" href="'+urlhost+'/_22320" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22320 - Cadastro de Fluxos de produção"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/FluxoProducao';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['TIPO','TIPO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'MAQUINA':
						//Consulta Máquinas p/ Fluxo de Produção
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Máquina:   <a tabindex="-1" href="'+urlhost+'/_22391" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22391 - Cadastro de Máquinas para Fluxo de Produção"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Maquinas';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
						
					case 'USUARIO':
						//Consulta Usuários
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Usuário:   <a tabindex="-1" href="'+urlhost+'/_11300" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11300 - Gestão de Usuários"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Usuarios';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','NOME']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
						
					case 'OPERADOR':
						//Consulta Operadores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operador:   <a tabindex="-1" href="'+urlhost+'/_22510" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22510 - Cadastro de Operadores de Processos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Operadores';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','NOME']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'SUPERVISOR':
						//Consulta Supervisores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Supervisor:   <a tabindex="-1" href="'+urlhost+'/_12150" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12150 - Cadastro de Supervisores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Supervisores';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','NOME']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'SUPERVISOR_OFICINA':
						//Consulta Supervisor de Oficinas
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Supervisor:   <a tabindex="-1" href="'+urlhost+'/_12150" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12150 - Cadastro de Supervisores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/SupervisorOficinas';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','NOME']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'OPERACAO_ENTRADA':
						//Consulta Operações de Entrada
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação de Entrada:   <a tabindex="-1" href="'+urlhost+'/_15250" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="15250 - Cadastro de Operações para Movimentação de Estoque"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoEntrada';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.consulta_tipo	     = '';
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'OPERACAO_NF_ENTRADA':
						//Consulta Operações de Entrada
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação de Entrada:   <a tabindex="-1" href="'+urlhost+'/_15250" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="15250 - Cadastro de Operações para Movimentação de Estoque"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoNFEntrada';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'OPERACAO_SAIDA':
						//Consulta Operações de Saída
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação de Saída:   <a tabindex="-1" href="'+urlhost+'/_15250" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="15250 - Cadastro de Operações para Movimentação de Estoque"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoSaida';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.consulta_tipo	     = '';
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'OPERACAO_NF_SAIDA':
						//Consulta Operações de Saída
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação de Saída:   <a tabindex="-1" href="'+urlhost+'/_15250" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="15250 - Cadastro de Operações para Movimentação de Estoque"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoNFSaida';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'OPERACAO_GERAL':
						//Consulta Operações Gerais
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação: '//  <a tabindex="-1" href="'+urlhost+'/_15250" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="15250 - Cadastro de Operações para Movimentação de Estoque"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoGeral';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'CODIGO';
						consulta.option.obj_ret              = ['CODIGO','DESCRICAO'];
						consulta.option.campos_tabela        = [['CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO'],['DESC_CONTA','C.CONTÁBIL'],['DESC_CCUSTO','C.CUSTO'],['DESC_STATUS', 'STATUS']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'OPERACAO_DOCUMENTO_FISCAL':
						// CONSULTA OPERAÇÕES PARA DOCUMENTO FISCAL
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação:   <a tabindex="-1" href="'+urlhost+'/_21110" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21110 - Cadastro de Operações Internas para Documentos Fiscais "></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoDocumentoFiscal';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false; 
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'CODIGO';
						consulta.option.obj_ret              = ['CODIGO','DESCRICAO'];
						consulta.option.campos_tabela        = [['CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'OPERACAO_FRETE':
						// CONSULTA OPERAÇÕES PARA CONHECIMENTOS DE FRETES
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação:   <a tabindex="-1" href="'+urlhost+'/_21110" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21110 - Cadastro de Operações Internas para Documentos Fiscais "></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoFrete';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'CODIGO';
						consulta.option.obj_ret              = ['CODIGO','DESCRICAO'];
						consulta.option.campos_tabela        = [['CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'LOCALIZACAO':
						//Consulta Localizações de estoque
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Localização:   <a tabindex="-1" href="'+urlhost+'/_15150" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="15150 - Cadastro de Localização de Estoque"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Localizacao';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.contem_vinc_usuario		 = true;
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'LOCALIZACAO_TODAS':
						//Consulta Todas as Localizações de estoque
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Localização:   <a tabindex="-1" href="'+urlhost+'/_15150" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="15150 - Cadastro de Localização de Estoque"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/LocalizacaoTodas';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CIDADE':
						//Consulta Cidades
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Cidade:  <a tabindex="-1" href="'+urlhost+'/_21120" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21120 - Cadastro de Cidades"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Cidade';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CLIENTES':
						//Consulta Clientes
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Cliente:   <a tabindex="-1" href="'+urlhost+'/_12360" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12360 - Cadastro de Clientes"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Clientes';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 532;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','RAZAOSOCIAL'];
						consulta.option.campos_tabela        = [['ID','ID'],['RAZAOSOCIAL','NOME'],['NOMEFANTASIA','CLIENTE'],['DESC_EMP_GRUPO', 'GRUPO DO CLIENTE'],['CNPJ_F','CNPJ/CPF'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'CLIENTES_VINC_ESTABELECIMENTO':
						//Consulta Clientes
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Cliente:   <a tabindex="-1" href="'+urlhost+'/_12360" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12360 - Cadastro de Clientes"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClientesVincEstabelecimento';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 600;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','EMPRESA_DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['EMPRESA_DESCRICAO','NOME'],['DESC_ESTABELECIMENTO', 'ESTABELECIMENTO'],['CNPJ_F','CNPJ/CPF'],['UF', 'UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'CLIENTES_CONTA_PRINCIPAL':
						//Consulta Clientes
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Cliente:   <a tabindex="-1" href="'+urlhost+'/_12360" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12360 - Cadastro de Clientes"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ClientesContaPrincipal';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 540;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','RAZAOSOCIAL'];
						consulta.option.campos_tabela        = [['ID','ID'],['RAZAOSOCIAL','NOME'],['NOMEFANTASIA','CLIENTE'],['EMPRESA_VINCULO_RAZAOSOCIAL','CONTA PRINCIPAL'],['CNPJ_F','CNPJ/CPF'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'FORNECEDORES':
						//Consulta Fornecedores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Fornecedor:   <a tabindex="-1" href="'+urlhost+'/_14080" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="14080 - Cadastro de Fornecedores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Fornecedores';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','RAZAOSOCIAL'];
						consulta.option.campos_tabela        = [['ID','ID'],['RAZAOSOCIAL','NOME'],['NOMEFANTASIA','NOME FANTASIA'],['CNPJ_F','CNPJ/CPF'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'TRANSPORTADORAS':
						//Consulta Transportadoras
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Transportadora:   <a tabindex="-1" href="'+urlhost+'/_14011" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="14011 - Cadastro de Transportadoras"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Transportadoras';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','RAZAOSOCIAL'];
						consulta.option.campos_tabela        = [['ID','ID'],['RAZAOSOCIAL','NOME'],['NOMEFANTASIA','NOME FANTASIA'],['CNPJ_F','CNPJ/CPF'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'REPRESENTANTES':
						//Consulta Representantes
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Representante:   <a tabindex="-1" href="'+urlhost+'/_12350" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12350 - Cadastro de Representantes"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Representantes';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','RAZAOSOCIAL'];
						consulta.option.campos_tabela        = [['ID','ID'],['RAZAOSOCIAL','NOME'],['NOMEFANTASIA','NOME FANTASIA'],['CNPJ_F','CNPJ/CPF'],['UF','UF']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'UF':
						//Consulta UF's
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'UF: ';
						consulta.option.obj_consulta         = '/consultas/api/UF';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret           	 = ['ID','DESCRICAO'];
						consulta.option.campos_tabela     	 = [['ID','UF'],['DESCRICAO','DESCRIÇÃO']];
						break;

					case 'UF_USUARIO':
						//Consulta UF's
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'UF: ';
						consulta.option.obj_consulta         = '/consultas/api/UFUsuario';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret           	 = ['ID','DESCRICAO'];
						consulta.option.campos_tabela     	 = [['ID','UF'],['DESCRICAO','DESCRIÇÃO']];
						consulta.contem_vinc_usuario		 = true;
						break;

					case 'CFOP':
						//Consulta UF's
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'CFOP: <a tabindex="-1" href="'+urlhost+'/_21100" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21100 - Cadastro de CFOP"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CFOP';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret           	 = ['CODIGO','DESCRICAO'];
						consulta.option.campos_tabela     	 = [['CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
						break;

					case 'CFOP_ENTRADA':
						//Consulta UF's
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'CFOP: <a tabindex="-1" href="'+urlhost+'/_21100" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21100 - Cadastro de CFOP"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CFOPEntrada';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'CODIGO';
						consulta.option.obj_ret           	 = ['CODIGO','DESCRICAO'];
						consulta.option.campos_tabela     	 = [['CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
					break;
				
					case 'CFOP_FRETE':
						//Consulta UF's
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'CFOP: <a tabindex="-1" href="'+urlhost+'/_21100" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21100 - Cadastro de CFOP"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CFOPFrete';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'CODIGO';
						consulta.option.obj_ret           	 = ['CODIGO'];
						consulta.option.campos_tabela     	 = [['CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'CFOP_SAIDA':
						//Consulta UF's
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'CFOP: <a tabindex="-1" href="'+urlhost+'/_21100" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21100 - Cadastro de CFOP"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CFOPSaida';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'CODIGO';
						consulta.option.obj_ret           	 = ['CODIGO','DESCRICAO'];
						consulta.option.campos_tabela     	 = [['CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'CORES':
						//Consulta Cores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Cor:   <a tabindex="-1" href="'+urlhost+'/_22340" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22340 - Cadastro de Cores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Cores';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID', 'ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'CORES_MODELO':
						//Consulta Cores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Cor:   <a tabindex="-1" href="'+urlhost+'/_22340" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22340 - Cadastro de Cores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CoresModelos';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID', 'ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'LINHAS':
						//Consulta Linhas de produção
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Linha:   <a tabindex="-1" href="'+urlhost+'/_22350" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22350 - Cadastro de Linhas de Produção"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Linhas';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID', 'ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'UM':
						//Consulta Unidades de Medida
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Unidade de Medida:   <a tabindex="-1" href="'+urlhost+'/_21051" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21051 - Cadastro de Unidades de Medidas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/UnidadesMedidas';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 430;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','SIGLA'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'COLABORADOR':
						//Consulta Colaboradores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Colaborador:   <a tabindex="-1" href="'+urlhost+'/_23180" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23180 - Cadastro de Colaboradores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Colaboradores';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 520;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.consulta_tipo	     = 'ATIVO';
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','MATRÍCULA'],['DESCRICAO','NOME'],['DESC_TURNO','TURNO'],['DESC_SIT','SITUAÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'COLABORADOR_SIT':
						//Consulta Colaboradores por Situação
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Colaborador: <a tabindex="-1" href="'+urlhost+'/_23180" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23180 - Cadastro de Colaboradores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ColaboradoresSit';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 520;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','MATRÍCULA'],['DESCRICAO','NOME'],['TURNO_DESC','TURNO'],['DESC_SITUACAO','SITUAÇÃO']];
						consulta.option.filtro_sql           = {SITUACAO: 1};
					break;

					case 'COLABORADOR_TODOS':
						//Consultar Todos os Colaboradores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Colaborador:   <a tabindex="-1" href="'+urlhost+'/_23180" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23180 - Cadastro de Colaboradores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ColaboradoresTodos';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 520;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.consulta_tipo	     = 'ATIVO';
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','MATRÍCULA'],['DESCRICAO','NOME'],['DESC_TURNO','TURNO'],['DESC_SIT','SITUAÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'EXAMES':
						//Consultar os Tipos de Exames
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Exame: <a tabindex="-1" href="'+urlhost+'/_23100" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23100 - Cadastro de Tipos de Exame"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Exames';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 300;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'MODELO':
						//Consulta Modelo
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Modelo:  <a tabindex="-1" href="'+urlhost+'/_22430" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22430 - Cadastro de Modelos e Fichas Técnicas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Modelos';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						var visualizarReferenciaModelo       = consulta.getVisualizarReferenciaModelo();
 
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						if(visualizarReferenciaModelo == '1'){
							consulta.option.campos_tabela.splice(1, 0, ['REFERENCIA','REFERÊNCIA']);
						}
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'PRODUTO':
						//Consulta Produto
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Produto:  <a tabindex="-1" href="'+urlhost+'/_27070" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="27070 - Cadastro de Produtos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Produtos';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 650;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['UNIDADEMEDIDA_SIGLA','UM'], ['DESC_FAM_ALT','FAMÍLIA']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'PRODUTO_TODOS':
						//Consulta Produto
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Produto:  <a tabindex="-1" href="'+urlhost+'/_27070" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="27070 - Cadastro de Produtos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ProdutosTodos';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 650;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['UNIDADEMEDIDA_SIGLA','UM'], ['DESC_FAM_ALT','FAMÍLIA']];
						// consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'ETIQUETA':
						//Consulta Etiquetas
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Etiqueta: <a tabindex="-1" href="'+urlhost+'/_11361" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11361 - Configuração de Etiquetas de Impressoras Térmicas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Etiquetas';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'TIPO_PRODUTO':
						//Consulta Tipo de Produto
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Tipo de Produto:  <a tabindex="-1" href="'+urlhost+'/_15140" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="15140 - Cadastro de Tipos de Produtos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TipoProdutos';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['DESC_CLASSE','CLASSE']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'TAMANHO_MODELO':
						//Consulta Tamanho por Modelo
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Tamanho:  <a tabindex="-1" href="'+urlhost+'/_22360" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22360 - Cadastro de Grades"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TamanhoModelo';
						consulta.option.tamanho_input        = 'input-menor';
						consulta.option.tamanho_tabela       = 231;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['TAMANHO_DESCRICAO'];
						consulta.option.campos_tabela        = [['TAMANHO_DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'TAMANHO_PRODUTO':
						//Consulta Tamanho por Produto
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Tamanho:  <a tabindex="-1" href="'+urlhost+'/_22360" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22360 - Cadastro de Grades"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TamanhoProduto';
						consulta.option.tamanho_input        = 'input-menor';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESCRICAO'];
						consulta.option.campos_tabela        = [['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'GP':
						//Consulta GP
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'GP:  <a tabindex="-1" href="'+urlhost+'/_22031" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22031 - Cadastro de Grupos de Produção"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/GP';
						consulta.option.tamanho_input        = 'input-menor';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'UP':
						//Consulta UP
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'UP/Etapa:  <a tabindex="-1" href="'+urlhost+'/_22310" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22310 - Cadastro de Unidades Produtivas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/UP';
						consulta.option.tamanho_input        = 'input-menor';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['TIPO','TIPO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'UP_GERAL':
						//Consulta UP
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'UP:  <a tabindex="-1" href="'+urlhost+'/_22310" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22310 - Cadastro de Unidades Produtivas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/UPGeral';
						consulta.option.tamanho_input        = 'input-menor';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'UP_ETAPA':
						//Consulta UP
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Etapa:  <a tabindex="-1" href="'+urlhost+'/_22740" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22740 - Cadastro de Etapas de Produção"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/UPEtapa';
						consulta.option.tamanho_input        = 'input-menor';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'UP_SETOR':
						//Consulta UP
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'SETOR:  <a tabindex="-1" href="'+urlhost+'/_22760" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22760 - Cadastro de Setor de Unidade Produtiva"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/UPSetorResponsavel';
						consulta.option.tamanho_input        = 'input-menor';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'GESTOR':
						//Consulta Gestores
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Gestores:' //  <a tabindex="-1" href="'+urlhost+'/_23180" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23180 - Cadastro de Colaboradores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Gestores';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','NOME']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'TURNO':
						//Consulta Turnos
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Turno:' //  <a tabindex="-1" href="'+urlhost+'/_23180" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23180 - Cadastro de Colaboradores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Turnos';
						consulta.option.tamanho_input        = 'input-menor';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'CONDICAO_PAGAMENTO':
						//Consulta Turnos
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Condição de Pagamento:  <a tabindex="-1" href="'+urlhost+'/_20160" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20160 - Cadastro de Condições de Pagamento"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CondPagamento';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRICAO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'PARAMETRO_OPERADOR':
						//Consulta Turnos
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Parametro de Operador:  <a tabindex="-1" href="'+urlhost+'/_11005" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11005 - Cadastro de Parametros do Sistema"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ParametroOperador';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRICAO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'FORMA_PAGEMENTO':
						//Consulta Turnos
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Forma de Pagamento:  <a tabindex="-1" href="'+urlhost+'/_20181" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20181 - Cadastro de Formas de Pagamento"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/FormaPagamento';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRICAO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'POSICAO_S':
						//Consulta Posição de Contas a Receber
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Posição:  <a tabindex="-1" href="'+urlhost+'/_20201" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20201 - Cadastro de Posições do CRE"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PosicaoCRE';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRICAO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'COBRANCA_S':
						//Consulta Cobrança de Contas a Receber
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Cobrança:  <a tabindex="-1" href="'+urlhost+'/_20151" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20151 - Cadastro de Cobranças do CRE"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CobrancaCRE';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRICAO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'MODALIDADE_S':
						//Consulta Modalidade de Contas a Receber
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Modalidade:   <a tabindex="-1" href="'+urlhost+'/_20191" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20191 - Cadastro de Modalidades do CRE"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ModalidadeCRE';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRICAO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'OPERACAO_CRE':
						//Consulta Operação de Contas a Receber
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação:   <a tabindex="-1" href="'+urlhost+'/_20141" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20141 - Cadastro de Operações do CRE"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoCRE';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRICAO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'OPERACAO_CPA':
						//Consulta Operação de Contas a Pagar
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Operação:   <a tabindex="-1" href="'+urlhost+'/_20131" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="20131 - Cadastro de Operações do CPA"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/OperacaoCPA';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRICAO']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'TABELA_PRECO':
						//Consulta Tabela de Preço
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Tabela de Preço:   <a tabindex="-1" href="'+urlhost+'/_12390" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12390 - Cadastro de Tabelas de Preços"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TabelaPreco';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO'], ['DESC_STATUS','STATUS'], ['DESC_ESTAB','ESTABELECIMENTO']];
						consulta.option.align_right        	 = ['QTD_FAMILIAS'];
					break;
					
					case 'TABELA_PRECO_POR_USUARIO':
						//Consulta Tabela de Preço
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Tabela de Preço:   <a tabindex="-1" href="'+urlhost+'/_12390" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12390 - Cadastro de Tabelas de Preços"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TabelaPrecoPorUsuario';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO'], ['DESC_STATUS','STATUS'], ['DESC_ESTAB','ESTABELECIMENTO']];
						consulta.option.align_right        	 = ['QTD_FAMILIAS'];
					break;
					
					case 'TABELA_PRECO_TODAS':
						//Consulta Tabela de Preço
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Tabela de Preço:   <a tabindex="-1" href="'+urlhost+'/_12390" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12390 - Cadastro de Tabelas de Preços"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TodasTabelaPreco';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO'], ['DESC_STATUS','STATUS'], ['DESC_ESTAB','ESTABELECIMENTO']];
						consulta.option.align_right        	 = ['QTD_FAMILIAS'];
					break;

					case 'PEDIDO':
						//Consulta Tabela de Preço
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Pedidos:   <a tabindex="-1" href="'+urlhost+'/_12200" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12200 - Registro de Pedidos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Pedidos';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'PEDIDO';
						consulta.option.obj_ret              = ['PEDIDO'];
						consulta.option.campos_tabela        = [['PEDIDO','PEDIDO'],['PEDIDO_CLIENTE','PED. CLIENTE'], ['NOMEFANTASIA','CLIENTE']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'REMESSA':
						//Consulta Tabela de Preço
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Remessas:';
						consulta.option.obj_consulta         = '/consultas/api/Remessas';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'NUMERO';
						consulta.option.obj_ret              = ['REMESSA'];
						consulta.option.campos_tabela        = [['REMESSA','REMESSA'],['MODELOS','MODELOS'],['DATA','DATA']];
						consulta.option.filtro_sql           = {STATUS: 1};
					break;

					case 'VEICULO':
						//Consulta Veículo
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Veículo:   <a tabindex="-1" href="'+urlhost+'/_14100" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="14100 - Cadastro de Veículos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Veiculos';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'MODELO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['MARCA','MARCA'],['MODELO','MODELO'], ['ANO','ANO'], ['PLACA','PLACA'], ['RNTRC','RNTRC']];
						consulta.option.filtro_sql           = {};
					break;

					case 'CAIXA_PDV':
						//Consulta Caixa de PDV
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						// consulta.option.label_descricao      = 'Caixa:   <a tabindex="-1" href="'+urlhost+'/_12390" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12390 - Cadastro de Caixas para PDV"></span></a>';
						consulta.option.label_descricao      = 'Caixa: ';
						consulta.option.obj_consulta         = '/consultas/api/CaixaPDV';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRICAO'], ['DESC_PDV','PDV']];
					break;

					case 'CORRETORES':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Corretor:  <a tabindex="-1" href="'+urlhost+'/_12480" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12480 - Cadastro de Corretores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Corretores';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRICAO']];
					break;

					case 'VENDEDORES':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Vendedor:  <a tabindex="-1" href="'+urlhost+'/_12430" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12430 - Cadastro de Vendedores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/vendedores';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRICAO']];
					break;

					case 'VERBA':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Verba:  <a tabindex="-1" href="'+urlhost+'/_34030" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="34030 - Cadastro de Verbas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/verba';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESC_CODIGO','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESC_CODIGO','CODIGO'],['DESCRICAO','DESCRIÇÃO']];	
					break;
					
					case 'GRADE':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Grade:  <a tabindex="-1" href="'+urlhost+'/_22360" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22360 - Cadastro de Grades"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Grade';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'FORMULARIO_TIPO_1':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Formulário:  <a tabindex="-1" href="'+urlhost+'/_25010" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="25010 - Cadastro de Formulários"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Formulario1';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'TITULO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['TITULO','TITULO'],['PERIODO_INI_FORMAT','PERÍODO INICIAL'],['PERIODO_FIM_FORMAT','PERÍODO FINAL']];	
					break;

					case 'FORMULARIO_TIPO_2':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Formulário:  <a tabindex="-1" href="'+urlhost+'/_25010" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="25010 - Cadastro de Formulários"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Formulario2';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'TITULO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['TITULO','TITULO'],['PERIODO_INI_FORMAT','PERÍODO INICIAL'],['PERIODO_FIM_FORMAT','PERÍODO FINAL']];	
					break;

					case 'FORMULARIO_TIPO_3':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Formulário:  <a tabindex="-1" href="'+urlhost+'/_25010" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="25010 - Cadastro de Formulários"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Formulario3';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'TITULO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['TITULO','TITULO'],['PERIODO_INI_FORMAT','PERÍODO INICIAL'],['PERIODO_FIM_FORMAT','PERÍODO FINAL']];	
					break;
					
					case 'GRUPO_CLIENTE':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Grupo de Cliente:  <a tabindex="-1" href="'+urlhost+'/_12450" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12450 - Cadastro de Grupos de Clientes"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/GrupoCliente';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','Descrição']];	
					break;
					
					case 'GRUPO_FORNECEDOR':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Grupo de Fornecedor:  <a tabindex="-1" href="'+urlhost+'/_13070" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="13070 - Cadastro de Grupos de Fornecedores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/GrupoFornecedor';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','Descrição']];	
					break;
					
					case 'GRUPO_PRODUTO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Grupo de Produtos:  <a tabindex="-1" href="'+urlhost+'/_27090" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="27090 - Cadastro de Grupos de Produtos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/GrupoProdutos';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'GRUPO_CLIENTE_FORNECEDOR':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Grupo de Clientes/Fornecedores:  <a tabindex="-1" href="'+urlhost+'/_12450" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12450 - Cadastro de Grupos de Clientes"></span></a> <a tabindex="-1" href="'+urlhost+'/_13070" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="13070 - Cadastro de Grupos de Fornecedores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/GrupoClienteFornecedor';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO'],['DESC_TIPO', 'TIPO']];	
					break;
					
					case 'REGIAO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Regiões:  <a tabindex="-1" href="'+urlhost+'/_21250" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21250 - Cadastro de Regiões"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Regiao';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'PRODUTO_SEM_MODELO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Produtos:  <a tabindex="-1" href="'+urlhost+'/_27070" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="27070 - Cadastro de Produtos e Serviços"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ProdutoSemModelo';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['ID','ID'],['DESCRICAO','DESCRIÇÃO'],['UNIDADEMEDIDA_SIGLA', 'UM'],['DESC_FAM_ALT', 'FAMÍLIA']];	
					break;

					case 'MICRORREGIAO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Microrregiões:  <a tabindex="-1" href="'+urlhost+'/_21290" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="21290 - Cadastro de Microrregiões"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Microrregiao';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 740;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'FOLHA_PAGAMENTO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Folha de Pagamento:  <a tabindex="-1" href="'+urlhost+'/_34010" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="34010 - Cadastro de Folha de Pagamento"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/FolhaPagamento';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;
					
					case 'CENTRO_NEGOCIO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Centro de Negócio:  <a tabindex="-1" href="'+urlhost+'/_31160" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="31160 - Cadastro de Centro de Negócio"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/CentroNegocio';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'SETOR':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Setor:  <a tabindex="-1" href="'+urlhost+'/_32030" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="32030 - Cadastro de Setores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Setor';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'PACIENTE':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Paciente:  <a tabindex="-1" href="'+urlhost+'/_23500" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23500 - Cadastro de Pacientes"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Paciente';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'NOME'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['NOME','NOME'], ['CPF_F','CPF']];	
					break;

					case 'PROFISSIONAL':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Profissional:  <a tabindex="-1" href="'+urlhost+'/_23141" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23141 - Cadastro de Profissionais da Saúde"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ProfissionalSaude';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'NOME'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['NOME','NOME']];	
					break;

					case 'CLINICA':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Clínica:  <a tabindex="-1" href="'+urlhost+'/_23510" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23510 - Cadastro de Clínicas"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Clinica';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'CONSULTORIO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Consultório:  <a tabindex="-1" href="'+urlhost+'/_23460" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23460 - Cadastro de Consultórios"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Consultorio';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'SOCIO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Sócio:  <a tabindex="-1" href="'+urlhost+'/_17190" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="17190 - Cadastro de Sócios"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Socio';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'NOME'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['NOME','NOME']];	
					break;

					case 'CONTADOR':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Contador:  <a tabindex="-1" href="'+urlhost+'/_17180" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="17180 - Cadastro de Contadores"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Contador';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'NOME'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['NOME','NOME']];	
					break;

					case 'SERVIDOR':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Servidor (DB):  <a tabindex="-1" href="'+urlhost+'/_11940" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11940 - Cadastro de Servidores (DB)"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Servidores';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'ATRIBUTOS':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Atributo:  <a tabindex="-1" href="'+urlhost+'/_22850" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22850 - Cadastro de Atributos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Atributos';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];	
					break;

					case 'SERVIDOR_URL':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Servidor (URL):  <a tabindex="-1" href="'+urlhost+'/_11083" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11083 - Cadastro de Servidores (URL)"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ServidoresUrl';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO_RESUMIDA', 'URL'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO_RESUMIDA','DESC. RESUMIDA'],['URL','URL'],['DESC_SERVIDOR_VINC', 'SERVIDOR VINC.']];	
					break;

					case 'FICHA_PROCESSO_REL':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Processo (Relatório): ';
						consulta.option.obj_consulta         = '/consultas/api/FichaProcessoRel';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['VALOR'];
						consulta.option.campos_tabela        = [['VALOR','VALOR']];	
						consulta.option.filtro_sql           = {TIPO: ''};
					break;

					case 'TRIBUTACAO_ICMS':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Tributação ICMS: ';
						consulta.option.obj_consulta         = '/consultas/api/TributacaoICMS';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['CST', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['CST','CST'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'TRIBUTACAO_IPI_ENTRADA':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Tributação IPI Entrada: ';
						consulta.option.obj_consulta         = '/consultas/api/TributacaoIPIEntrada';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['CST', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['CST','CST'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'TRIBUTACAO_IPI_SAIDA':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Tributação IPI Saída: ';
						consulta.option.obj_consulta         = '/consultas/api/TributacaoIPISaida';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['CST', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['CST','CST'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'TRIBUTACAO_PIS_ENTRADA':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Tributação PIS Entrada: ';
						consulta.option.obj_consulta         = '/consultas/api/TributacaoPISEntrada';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['CST', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['CST','CST'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'TRIBUTACAO_PIS_SAIDA':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Tributação PIS Saída: ';
						consulta.option.obj_consulta         = '/consultas/api/TributacaoPISSaida';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['CST', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['CST','CST'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'TRIBUTACAO_COFINS_ENTRADA':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Tributação Cofins Entrada: ';
						consulta.option.obj_consulta         = '/consultas/api/TributacaoCofinsEntrada';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['CST', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['CST','CST'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'TRIBUTACAO_COFINS_SAIDA':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Tributação Cofins Saída: ';
						consulta.option.obj_consulta         = '/consultas/api/TributacaoCofinsSaida';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['CST', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['CST','CST'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'BASE_LEGAL':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Base Legal: ';
						consulta.option.obj_consulta         = '/consultas/api/Baselegal';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = false;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'MOTIVO_ENCERRAMENTO_PED':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Motivo de Encerramento: <a tabindex="-1" href="'+urlhost+'/_12600" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12600 - Cadastro de Motivos para Encerramento dos Pedidos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/MotivoEncerramentoPed';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'PAINEL_CASO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Painel de Caso: <a tabindex="-1" href="'+urlhost+'/_26031" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="26031 - Cadastro de Paineis de Casos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PainelCaso';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'TITULO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['TITULO','TÍTULO'],['VERSAO','VERSÃO']];
					break;

					case 'MERCADO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Mercado: <a tabindex="-1" href="'+urlhost+'/_31081" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="31081 - Cadastro de Mercados"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Mercado';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'SITUACAO_PONTO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Situação de Ponto: <a tabindex="-1" href="'+urlhost+'/_23090" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="23090 - Cadastro de Situações de Ponto"></span></a>'; 
						consulta.option.obj_consulta         = '/consultas/api/SituacaoPonto';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.obj_ret              = ['DESC_CODIGO', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESC_CODIGO','CÓDIGO'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'ROTEIRO_ETAPAS':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Roteiro de Etapas: <a tabindex="-1" href="'+urlhost+'/_22890" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22890 - Cadastro de Roteiros de Etapas"></span></a>'; 
						consulta.option.obj_consulta         = '/consultas/api/RoteiroEtapas';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'ROTEIRO_PRODUCAO_TIPO':
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						consulta.option.label_descricao      = 'Tipo de Roteiro:'; 
						consulta.option.obj_consulta         = '/consultas/api/RoteiroProducaoTipo';
						consulta.option.consulta_tipo 		 = '';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_CODIGO', 'DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
					break;

					case 'GRUPO_ESTABELECIMENTO':
						// Consulta Estabelecimento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Grupo Estabelecimento: <a tabindex="-1" href="'+urlhost+'/_11635" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11630 - Cadastro de Estabelecimentos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/GrupoEstabelecimento';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'PERFIL_ESTABELECIMENTO':
						// Consulta Estabelecimento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Perfil Estabelecimento: <a tabindex="-1" href="'+urlhost+'/_11635" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="11630 - Cadastro de Estabelecimentos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PerfilEstabelecimento';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'TIPO_PEDIDO':
						// Consulta Estabelecimento						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = ''; 
						consulta.option.label_descricao      = 'Tipo do Pedido: <a tabindex="-1" href="'+urlhost+'/_12130" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12130 - Cadastro de Tipos de Clientes"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/TipoPedido';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;
					
					case 'PREVISAO_VENDA':
						// Consulta previsão de venda						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Previsão de venda: <a tabindex="-1" href="'+urlhost+'/_12610" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12610 - Registro de Previsão de Venda"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/PrevisaoVenda';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO'], ['PERIODO_F','PERÍODO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'FORMULARIO_AVALIACAO':
						// Consulta formulário de avaliação						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Formulário: <a tabindex="-1" href="'+urlhost+'/_12660" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12660 - Cadastro de Formulários para Avaliação"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/FormularioAvaliacao';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO'], ['PERIODO_FORMAT','PERÍODO']];
						// consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'CONF_ALOCACAO':
						// Consulta previsão de venda						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Configuração de Alocação para Modelos: <a tabindex="-1" href="'+urlhost+'/_22435" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="22435 - Configuração de Alocação para Modelos"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/ConfAlocacao';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 450;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DESCRICAO','DESCRIÇÃO']];
						consulta.option.filtro_sql           = {STATUS: 1};
						break;

					case 'MARCA':
						// Consulta previsão de venda						
						consulta.componente                  = '.'+componente;
						consulta.option.class                = componente+'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Marca: ';
						consulta.option.obj_consulta         = '/consultas/api/Marca';
						consulta.option.tamanho_input        = 'input-medio';
						consulta.option.tamanho_tabela       = 350;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = false;
						consulta.option.campo_filtro		 = 'MARCA';
						consulta.option.obj_ret              = ['MARCA'];
						consulta.option.campos_tabela        = [['MARCA','MARCA']];
						break;

					case 'CATALOGO':
						// Consulta Classif. Financeira
						consulta.componente                  = '.'+ componente;
						consulta.option.class                = componente +'-c';
						//consulta.model                     = '';
						consulta.option.label_descricao      = 'Catálogo:  <a tabindex="-1" href="'+urlhost+'/_12461" target="_blank" rel="noopener noreferrer"><span class="fa fa-external-link" title="12461 - Cadastro de Catálogo Eletrônico"></span></a>';
						consulta.option.obj_consulta         = '/consultas/api/Catalogo';
						consulta.option.tamanho_input        = 'input-maior';
						consulta.option.tamanho_tabela       = 550;
						consulta.option.infinite_scroll      = true;
						consulta.option.required             = true;
						consulta.autoload                    = false;
						consulta.cache                       = true;
						consulta.option.campo_filtro		 = 'ID';
						consulta.option.obj_ret              = ['DESC_ID','DESCRICAO'];
						consulta.option.campos_tabela        = [['DESC_ID','ID'],['DATA_INICIAL_FORMAT','DT. INICIAL'],['DATA_FIM_FORMAT','DT. FINAL'],['DESCRICAO','DESCRIÇÃO']];
						break;


					case '':

						break;

					default:
					  // code block
				}

				var valido = false;
				var list   = that.getConsultasPadrao();

				angular.forEach(list,  function(item , key){
					if(TIPO == item.NOME){
						valido = true;
					}
				});

				if(!valido){
					showErro('Consulta "'+TIPO+'" não foi definida, defina em "getConsultasPadrao"' + (typeof descricao != 'undefined' ? ', Campo: '+descricao : '.'));
				}

                return consulta;
            },
            component : function(componente,set_this){
                
                set_this = set_this != undefined ? set_this : true;
                
                if ( componente == undefined || typeof componente != 'string' || !(componente.length > 0) ) {
                    showErro('Seu objeto de consulta esta configurado incorretamente.');
                    return false;
                }
                
                var ret = this.getNew(set_this);
                
                ret.componente = componente;
                
                return ret;
            },
	        clearHistory:function(url){
                window.history.replaceState('', '', encodeURI(urlhost + url));
	        },
	        postHistory:function(obj,url){
	        	var paran = {
                    CONSULTA : []
                };

                angular.forEach(lista, function(item, key) {
	                paran.CONSULTA.push(item.item);
	            });

                paran.CONSULTA.push(obj);

                window.history.replaceState('', '', encodeURI(urlhost + url + '?' + JSON.stringify(paran)));
	        },
	        getHistory:function(){
	        	var ret =[];

	        	try {

	                var search = location.search.substring(1);
	                search = decodeURI(search);
	                search = JSON.parse(search);

	                if(!(typeof search.CONSULTA == 'undefined')){
	                    ret = search.CONSULTA[search.CONSULTA.length - 1];

	                    angular.forEach(lista, function(item, key) {
			                item.item = search.CONSULTA[key];

			                if(item.item.selected){
				                
					            item.btn_apagar_filtro.disabled = false;
					            item.btn_apagar_filtro.visivel  = true;
					            item.btn_filtro.disabled = true;
					            item.btn_filtro.visivel  = false;
					            item.Input.readonly = true;
					            item.selected = item.item.dados;

					            var valor = '';
					            angular.forEach(item.option.obj_ret, function(campo, key) {
				                    if(valor == ''){
				                        valor  = item.item.dados[campo];
				                    }else{
				                        valor += ' - ' + item.item.dados[campo];    
				                    }
				                });

				                item.Input.value = valor;
					        }
			            });
	                }   

	            } catch(err) {}

	            return ret;
	        }
	    }

	    /**
	     * Return the constructor function
	     */
	    return Consulta;
	};

})(window, window.angular);
