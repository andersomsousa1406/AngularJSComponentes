(function(window, angular) {
    'use strict';
    
    AngularFindModule.factory('FactoryDefault' , FactoryDefault  );

    FactoryDefault.$inject = [
        '$ajax',
        '$q',
        '$rootScope',
        '$compile',
        '$timeout',
        '$consulta',
        'gScope',
        'gcCollection',
        'gcObject'
    ];

    function FactoryDefault($ajax, $q, $rootScope, $compile,$timeout, $consulta, gScope, gcCollection, gcObject) {

        // Private variables.
        var obj = null;
        var selected = null;
        
        /**
         * Constructor, with class name
         */
        function FactoryDefault() {

            obj = this; 

            obj.getNew = getNew;
            obj.default_item = {
                ajax_new_job_gravar                     : false,  
                ajax_new_job_consultar                  : false,  
                ajax_new_job_excluir                    : false,  
                ajax_new_job_ItensDel                   : false,  
                ajax_new_job_excluir_mult               : false,   
                ajax_new_job_get_itens_add              : false,
                factory_principal                       : 0,
                setNewJobAll                            : setNewJobAll,
                setFactoryPrincipal                     : setFactoryPrincipal,
                consultar 			                    : consultar,
                merge     			                    : merge,
                incluir   			                    : incluir,
                incluirNovo                             : incluirNovo,
                alterar   			                    : alterar,
                copiar                                  : copiar, 
                gravar   			                    : gravar, 
                cancelar  			                    : cancelar, 
                excluir   			                    : excluir,
                visualizar                              : visualizar,
                fecharModal                             : fecharModal,
                filtrarToggle                           : filtrarToggle,
                confirmarExcluir 	                    : confirmarExcluir,
                confirmarGravar  	                    : confirmarGravar,
                setDadosFiltro                          : setDadosFiltro,
                formatDataMerge                         : formatDataMerge,
                formatDataMergeItens                    : formatDataMergeItens,
                setDadosIncluir                         : setDadosIncluir,
                setDadosConsultar                       : setDadosConsultar,
                getItensAdd                             : getItensAdd,
                onMarcar                                : onMarcar,
                CheckSelect                             : CheckSelect,
                getTabelaItens                          : getTabelaItens,
                validarVisualizar                       : validarVisualizar,
                nextRecord                              : nextRecord,
                previousRecord                          : previousRecord,

                excluirMultiplos			            : excluirMultiplos,
                onValidarExcluirMultiplos	            : function(){},
                onExcluirMultiplos				        : function(){},
                onValidarConsultarItensDel		        : function(){},
                getItensDel						        : getItensDel,
                setDadosConsultarDelItens		        : undefined,
                confirmarExcluirMultiplos		        : confirmarExcluirMultiplos,	
                onConfirmarExcluirMultiplos 	        : onConfirmarExcluirMultiplos,
                beforeExcluirMultiplos			        : function(){},				
                getFimExcluirMultiplos			        : function(){},	
                fimExcluirMultiplos				        : function(){},	
                execPosExcluirMultiplos			        : function(){},
                executeOnRejectExcluirMultiplos	        : function(){},
                execPrePosGravar                        : function(response){},
                onFimConsultarItensAdd                  : function(response){},
                onFimConsultarItensDel                  : function(response){},

                fecharModalItensSelected                : fecharModalItensSelected,
                confirmItensSelected                    : confirmItensSelected,                
               
                isFactoryDefault                        : true,
                onConsultar 		                    : function(){},
                onShowModal 		                    : function(){},
                onHideModal 		                    : function(){},
                onMerge     		                    : function(){},
                onValidarIncluir                        : function(){}, 
                onValidarAlterar                        : function(){}, 
                onValidarCopiar                         : function(){},
                onIncluir   		                    : function(){},
                onAlterar   		                    : function(){}, 
                onCopiar   		                        : function(){},
                onGravar   			                    : function(){}, 
                onValidarConsultar   			        : function(){}, 
                onValidarConsultarItensAdd              : function(){}, 
                onValidarConfirmarItensAdd              : function(){},
                beforeCancelar  	                    : function(){},
                onCancelar  		                    : function(){},
                onCancelarGravar	                    : function(){},
                onExcluir   		                    : function(){},
                onVisualizar                            : function(){},
                onFecharModal                           : function(){},
                onFiltrarToggle                         : function(){},
                onConfirmarExcluir 	                    : function(){},
                onConfirmarGravar  	                    : function(){},
                beforeConfirmarGravar  	                : function(){},
                beforeMerge  	                        : function(response){ return response; },
                beforeDataAssign  	                    : function(response){ return response; },
                onCheckSelect                           : function(){},
                fimConsultar 	                        : function(response){},
                fimConsultarOnReject                    : function(e){},
                beforeFimGravar 	                    : function(){},
                fimGravar 	                            : function(response){ return response; },
                fimExcluir  	                        : function(response){ return response; },
                executeOnReject                         : function(){},
                getFimGravar                            : function(){}, 
                onFecharModalItensSelected              : function(){}, 
				onFormatterItensSelected 	            : function(){},
				onMergeItens 				            : function(){},
                fimGravarConfirmItensSelected 	        : function(){},
				fimGravarConfirmTexto 	                : function(){},
                onPreviousRecord                        : function(){},
                onNextRecord                            : function(){},
				compileItemIncluir                      : false,
                clearTabela                             : false,
                limparTabela                            : limparTabela,
                compileTabela                           : compileTabela,

                Tabela                                  : {DADOS : [], merge: function(){}, apagar: function(){}, count_marcados: function(){}},
                TabelaItensSelecionados                 : {DADOS : [], merge: function(){}, apagar: function(){}, count_marcados: function(){}},
                TabelaAddItens                          : {DADOS : [], merge: function(){}, apagar: function(){}, count_marcados: function(){}},

                habilita_toggle                         : true,
                consultas                               : [],
                habilita_itens                          : true,
                consulta_itens_add_on_gravar            : true,
                consultar_itens                         : true,
                Itens                                   : {},
                TIPO_ADD                                : 1,
                TIPO_GRAVAR                             : 1,
                fechar_modal_incluir                    : true,
                fechar_modal_incluir_t2                 : false,
                merger_dados                            : true,
                merger_tabela                           : false,
                marcar_todos_itens                      : false,
                format_datamerge                        : false,
                format_datamerge_itens                  : false,
                atualizar_principal                     : false,
                manter_itens_marcados                   : true,
                disabled_consulta_on_visualizar         : false,
                montar_dados_excluir                    : false,
                see_active                              : false,
                see_metodos                             : [],
                see_type                                : 'logs',
                url_consultar                           : '',
                url_gravar                              : '',
                url_excluir                             : '',
                postfiles                               : false,

                confirmar_gravar                        : true,
                confirmar_cancelar                      : true,
                force_confirmar_cancelar                : false,
                confirmar_excluir                       : true,
                VALIDAR_MODAL_ITENS_SELECIONADOS        : true,

                tabela_height		                    : tabela_height,
                ORDER_BY  			                    : 'ID',
                CAMPO_INDEX                             : 'ID',
                BACKUP_ID_COPY                          : '',
                FILTRO_DADOS                            : '',             
                FILTRO_DADOS_ADD                        : '',             
                INCLUINDO 			                    : false,
                ALTERANDO 			                    : false,
                COPIANDO                                : false,
                EXCLUINDO_MULTIPLOS                     : false,
				ARRAY_TABELAS		                    : [],
				ARRAY_TABELAS_ITENS						: [],
                DADOS     			                    : [],
                ITENS_EXCLUIDOS                         : [],
                DADOS_RENDER		                    : [],
                ITENS     			                    : [],
                SELECTEDS 			                    : [],
                SELECTED  			                    : {},
                BACKUP    			                    : {},
                BACKUP_ITENS                            : [],
                BACKUP_ITENS_MARCADOS                   : [],
                MSG_GRAVAR                              : 'Deseja realmente gravar este registro?',
                MODAL_ITENS_SELECIONADOS                : '#modal-ConfirmItensSelected',
                Modal : {
                    Pai : {},
                    _modal : $('#modal-FactoryDefault'),
                    isShown: false,
                    preventAutoFocus: false,
                    focus  : function(){
                        //$(this._modal).find('input:focusable').first().select();
                        focusOnmodal(this);
                    },
                    getFactoryPai: function(){
                        return undefined;
                    },
                    show : function(shown,hidden) {
                        var that = this;

						if($(this._modal).first().hasClass("fade")){
							$(this._modal).first().removeClass("fade");
                        }
                        
                        focusOnmodal(this);

                        this._modal
                            .modal('show');    
                            
                        this.isShown = true;
        
                        this._modal
                            .one('show.bs.modal', function() {                        
                                if (that.Pai.INCLUINDO == true && !that.preventAutoFocus) {
                                    var imputs = $(this)
                                        .find('input:focusable')
                                        .not(':input[readonly]');
                        
                                    $(imputs).first().select();
                                }
                        
                                if (that.Pai.COPIANDO == true && !that.preventAutoFocus) {
                                    var imputs = $(this)
                                        .find('input:focusable')
                                        .not(':input[readonly]');
                        
                                    $(imputs).first().select();
                                }
                        
                                if (shown) {
                                    shown();
                                }
                        
                                if (!that.preventAutoFocus) {
                                    that._modal
                                        .find('input:focusable')
                                        .first()
                                        .focus();
                                }
                            })
                            .modal('show');
        
                            this._modal
                                .one('hidden.bs.modal', function(){
									that.TimeModal = $timeout(function(){										
										//$rootScope.$apply(function(){
											that.Pai.ALTERANDO           = false;
											that.Pai.INCLUINDO           = false;
											that.Pai.COPIANDO            = false;
                                            that.Pai.EXCLUINDO_MULTIPLOS = false;
											if(typeof that.Tabela_ID != 'undefined'){
												var selecter = $(that.Tabela_ID).find('.selected:focusable');
												// console.log(selecter);
												selecter.last().focus();
											}else{
												var selecter = $('.selected:focusable');
												// console.log(selecter);
												selecter.last().focus();
											}
										
											if ( hidden ) {
												hidden();      
											}
                                        //});
                                        $timeout.cancel(that.TimeModal);
									})
                                });   
                                
                                if(typeof that.getFactoryPai() != 'undefined'){
                                    that.getFactoryPai().onShowModal();
                                }
                    },
                    hide : function(hidden) {
                        var that = this;

                        this._modal
                            .modal('hide');

                        this.isShown = false;
        
                        if ( hidden ) {
                            this._modal
                                .one('hidden.bs.modal', function(){
									that.TimeModal2 = $timeout(function(){
										//$rootScope.$apply(function(){
											that.Pai.ALTERANDO          = false;
											that.Pai.INCLUINDO          = false;
											that.Pai.COPIANDO           = false;
                                            that.Pai.EXCLUINDO_MULTIPLOS= false;
											if(typeof that.Tabela_ID != 'undefined'){
												var selecter = $(that.Tabela_ID).find('.selected:focusable');
												// console.log(selecter);
												selecter.last().focus();
											}else{
												var selecter = $('.selected:focusable');
												// console.log(selecter);
												selecter.last().focus();
											}
			
                                            hidden ? hidden() : '';
                                            
                                            $timeout.cancel(that.TimeModal2);
										//});
									})
                                });                      
                        }

                        if(typeof that.getFactoryPai() != 'undefined'){
                            that.getFactoryPai().onHideModal();
                        }
                    }
                },
                init : function(table){
                    var that = this;
                    that.Modal.Pai = table;
                }
            }
        }
		
        function excluirMultiplos() {
            var that = this;

            that.validar_excluir_multiplos = true;

            that.onValidarExcluirMultiplos();

            if(that.validar_excluir_multiplos == true){
                
                that.BACKUP     = {};

                that.SELECTED   = {};
				
                that.ALTERANDO  		 	= false;
                that.INCLUINDO  		 	= false;
                that.COPIANDO   		 	= false;
                that.EXCLUINDO_MULTIPLOS 	= true;
				that.BACKUP_ITENS_EXCLUIDOS = [];

                if(that.habilita_itens == true){
					
                    that.Itens.ITENS_EXCLUIDOS  = [];
                    that.Itens.DADOS            = [];
                    that.Itens.Tabela.DADOS     = [];
                }
                
                if(typeof that.CONFIRMACAO_SEM_TABELA_ITENS == 'undefined' && that.TIPO_ADD == 3){
                    that.FILTRO_DADOS = '';
                    that.FILTRO_DADOS_ADD = '';
                    that.BACKUP_ITENS_MARCADOS = [];
                    that.TabelaAddItens.apagar();
                }

				that.Modal.show();
				if(that.clearTabela == true){
					that.Itens.limparTabela();
					that.Itens.compileTabela();                    
                }	

                ativarBeforeunload(that.factory_principal);
                that.onExcluirMultiplos();
            }
        }
        
        function getItensDel(e){

            var that = this;

            that.validar_consulta_itens_del = true;
            
            that.onValidarConsultarItensDel();

            if(that.validar_consulta_itens_del == true){

                var dados = {
                        FILTRO: { 
                            FILTRO      : that.FILTRO_DADOS,
                            FILTRO_ADD  : that.FILTRO_DADOS_ADD 
                        },
                        DADOS : { 
                            FILTRO      : that.FILTRO_DADOS,
                            FILTRO_ADD  : that.FILTRO_DADOS_ADD
                        }
                    };

				if(typeof this.setDadosConsultarDelItens != 'undefined'){
					this.setDadosConsultarDelItens(dados);
				}else{
					this.setDadosConsultar(dados);
				}

                if(typeof e != 'undefined'){
                    that.TabelaAddItens.consulta_pagina = 0;
                }

                if(that.TabelaAddItens.infinite_scroll == true){
                    dados.FILTRO.QTD = that.TabelaAddItens.consulta_qtd;
                    dados.FILTRO.PAGINA = that.TabelaAddItens.consulta_qtd * that.TabelaAddItens.consulta_pagina;
                }

                if(that.TabelaAddItens.MODIFICAR_PAGINACAO == true){
                    dados.FILTRO.QTD    = that.TabelaAddItens.consulta_qtd;
                    dados.FILTRO.PAGINA = that.TabelaAddItens.consulta_qtd * that.TabelaAddItens.consulta_pagina;
                }

                return $q(function(resolve, reject){

                    $ajax.post(that.url_ItensDel, dados, {new_job: that.ajax_new_job_ItensDel}).then(function(response){
                        // that.TabelaAddItens.apagar();
                        if(that.marcar_todos_itens == true){
                            that.BACKUP_ITENS_MARCADOS = [];
                            angular.forEach(response, function(data,chave){
                                data.CHECKED = true;
                                that.BACKUP_ITENS_MARCADOS.push(data);
                            });
                        }
                        if(typeof that.TabelaAddItens.infinite_scroll != 'undefined' && that.TabelaAddItens.infinite_scroll == true){
                            that.TabelaAddItens.merge(response);
                        }else{
                            that.TabelaAddItens.DADOS = response;
                        }
                        

                        angular.forEach(that.BACKUP_ITENS_MARCADOS, function(dados, key){
                            angular.forEach(that.TabelaAddItens.DADOS, function(item, valor){
                                item.CHECKED = false;
                                // if(item.CODIGO == dados.CODIGO){
                                if(item[that.CAMPO_INDEX] == dados[that.CAMPO_INDEX]){
                                    that.TabelaAddItens.DADOS.splice(valor, 1);
                                }
                            });
                        });

                        angular.forEach(that.BACKUP_ITENS_MARCADOS, function(data,chave){
                            data.CHECKED = true;
                            that.TabelaAddItens.DADOS.push(data);
                        });

                        that.TabelaAddItens.count_marcados();

                        if(that.TabelaAddItens.counter_selected == that.TabelaAddItens.DADOS.length){
                            that.TabelaAddItens.linhas_marcadas = true;
                        }else{
                            that.TabelaAddItens.linhas_marcadas = false;
                        }

                        if(that.format_datamerge == true){
                            that.formatDataMerge(response);
                        }

                        if(that.format_datamerge_itens == true){
                            that.formatDataMergeItens(response);
                        }

                        if(that.TabelaAddItens.total_visible == true){
                            that.TabelaAddItens.TotalTabela();
                        }

                        that.onFimConsultarItensDel(response);

                        resolve(response);
                    });

                });
            }
        }

        function onConfirmarExcluirMultiplos() {
            var that = this;
            that.validar_confirmar_excluir_multiplos = true;
        }

        function confirmarExcluirMultiplos() {
            var that = this;

            return $q(function(resolve, reject){

                that.Tabela.operacao_merge_gravar = true;

                var dados = {
                    FILTRO: { 
                        FILTRO      : that.FILTRO_DADOS,
                        FILTRO_ADD  : that.FILTRO_DADOS_ADD
                    },
                    DADOS : that.SELECTED
                };

                if(that.habilita_itens == true){
                    if(that.Itens.TIPO_ADD == 2){
                        that.SELECTED.GRAVAR_ITENS    = that.Itens.DADOS;
                        that.SELECTED.ITENS_EXCLUIDOS = that.Itens.ITENS_EXCLUIDOS;
                    }
                }
                
                dados = that.setDadosFiltro(dados);

                that.onConfirmarExcluirMultiplos();

                if(that.validar_confirmar_excluir_multiplos == true) {

                    if((that.TIPO_ADD == 1 || that.TIPO_ADD == 3) && that.TIPO_GRAVAR == 1){
    
                        that.execPosExcluirMultiplos = function(response){
                            if(that.merger_dados == true){
                                that.merge(response.DATA_RETURN);
                            }else{
                                if(that.atualizar_principal == true){
                                    var index = -1;
                                    angular.forEach(that.BACKUP_ITENS_MARCADOS, function (selected, key){
                                        var key_found = -1;
                                        angular.forEach(that.DADOS, function (item, key){
                                            if(item[that.CAMPO_INDEX] == selected[that.CAMPO_INDEX]){
                                                key_found = key;
                                            }
                                        });
                                        
                                        if(key_found > -1){
                                            that.DADOS.splice(key_found,1); 
                                        }
                                    });
    
                                    that.merge(that.DADOS);
    
                                }
    
                                if(that.merger_tabela == false){
                                    that.Tabela.merge(that.DADOS);
                                }
                            }
                            
                            if(typeof that.CONFIRMACAO_SEM_TABELA_ITENS == 'undefined' && that.TIPO_ADD == 3){
                                that.fecharModalItensSelected();
                                that.Modal.hide();
                                that.BACKUP_ITENS_MARCADOS = [];
                                that.TabelaAddItens.apagar();
    
                                if(that.consulta_itens_add_on_gravar == true){
                                    that.consultar();
                                }                            
                            }
                            
                            if(that.habilita_itens == true){
                                if(that.Itens.TIPO_ADD == 2){
                                    if(that.consultar_itens == true){
                                        that.Itens.consultar();
                                    }
                                }
                            }
                            
                            if(that.fechar_modal_incluir == true){
                                that.Modal.hide();
                            }
                            
                            that.beforeExcluirMultiplos();
                            
                            that.ALTERANDO           = false;
                            that.INCLUINDO           = false;
                            that.COPIANDO            = false;
                            that.EXCLUINDO_MULTIPLOS = false;
                            that.excluir_multiplos   = false;
                            desativarBeforeunload(that.factory_principal);
                            that.fimExcluirMultiplos(response);
                            resolve(response);
                        }
    
                        if(that.postfiles == true){
                            $ajax.postFile(that.url_excluir_mult, dados).then(function(response){
                                that.execPosExcluirMultiplos(response);
                            },function(e){
                                that.executeOnRejectExcluirMultiplos();
                                reject(e);
                            });
                        }else{
    
                            $ajax.post(that.url_excluir_mult, dados, {new_job: that.ajax_new_job_excluir_mult}).then(function(response){
                                that.execPosExcluirMultiplos(response);
                            },function(e){
                                that.executeOnRejectExcluirMultiplos();
                                reject(e);
                            });
                        }
    
                    }else{
    
                        if(that.TIPO_ADD == 2 || that.TIPO_GRAVAR == 2){
    
                            that.BACKUP_ITENS_EXCLUIDOS = [];
    
                            that.beforeExcluirMultiplos();
                            that.getFimExcluirMultiplos();
    
                            
                            angular.forEach(that.BACKUP_ITENS_MARCADOS, function (selected, key){
                                var itemSelected = {};
                                var key_found = -1;
                                angular.forEach(that.DADOS, function (item, key){
                                    if(item[that.CAMPO_INDEX] == selected[that.CAMPO_INDEX]){
                                        itemSelected = item;
                                        key_found = key;
                                    }
                                });
                                
                                if(key_found > -1){
                                    that.BACKUP_ITENS_EXCLUIDOS.push(angular.copy(itemSelected));
                                    that.DADOS.splice(key_found,1); 
                                }
                            });
                            
                            that.onMergeItens();
                            
                            that.Tabela.merge(that.DADOS);
    
                            // that.SELECTED = that.setDadosIncluir();
    
                            if(typeof that.CONFIRMACAO_SEM_TABELA_ITENS == 'undefined' && that.TIPO_ADD == 3){
                                that.fecharModalItensSelected();
                                that.Modal.hide();
                                that.BACKUP_ITENS_MARCADOS = [];
                                that.TabelaAddItens.apagar();
                            }
    
                            desativarBeforeunload(that.factory_principal);
                            that.fimExcluirMultiplos({});
                            resolve();
                        }else{
    
                            desativarBeforeunload(that.factory_principal);
                            that.fimExcluirMultiplos({});
                            reject();
                        }
                    }
                }

            });
        }

        function compileTabela(){
            var that = this;
            if(typeof that.ARRAY_TABELAS != 'undefined' && that.ARRAY_TABELAS.length > 0 ){
				angular.forEach(that.ARRAY_TABELAS,function(tabela, key){					
					tabela.MODEL.compile(1);
				})
            }else{
                that.TimeCompile = $timeout(function(){
                    that.Tabela.compile(1);
                    $timeout.cancel(that.TimeCompile);			        
                });                
            }
        }

        function limparTabela(){
            var that = this;
            if(typeof that.ARRAY_TABELAS != 'undefined' && that.ARRAY_TABELAS.length > 0 ){
				angular.forEach(that.ARRAY_TABELAS,function(tabela, key){
					$(tabela.COMPONENTE).empty();
					tabela.MODEL.apagar();
				})
            }else{
                $(that.Tabela.componente).empty();
				that.Tabela.apagar();
            }
            
        }

        function getTabelaItens(tabela, classe){

            var that = this;
            
            that.TabelaItensSelecionados = angular.copy(tabela);

            that.TabelaAddItens = tabela;
            that.TabelaAddItens.input_visible   	= true;
            that.TabelaAddItens.input_model 		= false;
            that.TabelaAddItens.campo_model 		= 'item.CHECKED';
            that.TabelaAddItens.campo_verific   	= 'CHEC_MARCADOS';
            that.TabelaAddItens.model_tabela    	= that;
            that.TabelaAddItens.linhas_marcadas 	= false;
            that.TabelaAddItens.input_function  	= that.model + '.CheckSelect(item);';
            that.TabelaAddItens.space_function  	= that.CheckSelect;
            that.TabelaAddItens.componente      	= classe;
            that.TabelaAddItens.model           	= that.model + '.TabelaAddItens';
            that.TabelaAddItens.titulo          	= '';
            that.TabelaAddItens.filtro          	= ' Padrão';
            that.TabelaAddItens.ID              	= '';
            that.TabelaAddItens.HEIGHT          	= 'calc(var(--screen-height) - 550px)';
            that.TabelaAddItens.ORDER_BY        	= 'ID';
            that.TabelaAddItens.tipo_tabela	    	= 'normal';
            that.TabelaAddItens.zoom            	= 90;
            that.TabelaAddItens.model_selected  	= that.model + '.ItensAdd';
            that.TabelaAddItens.marcar_linhas   	= true;
            that.TabelaAddItens.check_onfocus   	= true;
            that.TabelaAddItens.filtro_visible  	= false;
            that.TabelaAddItens.status_visible  	= false;
            that.TabelaAddItens.total_visible   	= false;
            that.TabelaAddItens.total_registros 	= true;
            that.TabelaAddItens.tabela_itens    	= true;
			that.TabelaAddItens.total_dados	    	= 0;
			that.TabelaAddItens.next_page_add_itens	= true;
            // that.TabelaAddItens.habilitar_load_colunas = false;

            that.ItensAdd = {};
            
            gScope.TabelaAddItens = that.TabelaAddItens;
            
            that.TabelaAddItens.COLUNAS        = [
                {CAMPO: "ID"			, PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '',  FIXO: true, TOTAL: false, ALIGN: 'left' , CAMPO_FILTRO: "ID"			, VISIBLE: true , SIZE: 0, STYLE: '', DECIMAL: 0, ORDEM:"01", DESCRICAO:"Código"},
                {CAMPO: "DESCRICAO"		, PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '',  FIXO: true, TOTAL: false, ALIGN: 'left' , CAMPO_FILTRO: "DESCRICAO"		, VISIBLE: true , SIZE: 0, STYLE: '', DECIMAL: 0, ORDEM:"03", DESCRICAO:"Descrição"}
            ];

            that.TabelaAddItens.onMarcar  = that.onMarcar;

            //////////////////////////////////////////////////////////////

            // Tabela de Itens Selecionados
            that.TabelaItensSelecionados.input_visible   = false;
            that.TabelaItensSelecionados.model_tabela    = that;
            that.TabelaItensSelecionados.linhas_marcadas = false;
            that.TabelaItensSelecionados.componente      = classe + '_selecionados';
            that.TabelaItensSelecionados.model           = that.model + '.TabelaItensSelecionados';
            that.TabelaItensSelecionados.titulo          = '';
            that.TabelaItensSelecionados.filtro          = ' Padrão';
            that.TabelaItensSelecionados.ID              = '';
            that.TabelaItensSelecionados.HEIGHT          = 'calc(var(--screen-height) - 550px)';
            that.TabelaItensSelecionados.ORDER_BY        = 'ID';
            that.TabelaItensSelecionados.tipo_tabela	 = 'normal';
            that.TabelaItensSelecionados.zoom            = 90;
            that.TabelaItensSelecionados.model_selected  = that.model + '.ItensSelected';
            that.TabelaItensSelecionados.marcar_linhas   = false;
            that.TabelaItensSelecionados.check_onfocus   = false;
            that.TabelaItensSelecionados.filtro_visible  = false;
            that.TabelaItensSelecionados.status_visible  = true;
            that.TabelaItensSelecionados.total_visible   = false;
            that.TabelaItensSelecionados.total_registros = true;
            that.TabelaItensSelecionados.total_dados	 = 0;
            that.TabelaItensSelecionados.habilitar_load_colunas = false;
            
			that.ItensSelected = {};
			that.ItensSelected.visualizar = function(){};
            that.TabelaItensSelecionados.COLUNAS = angular.copy(that.TabelaAddItens.COLUNAS);

            that.TabelaAddItens.PaiTab = that;
            that.TabelaItensSelecionados.PaiTab = that;
        }

        function onMarcar(){
			var that = this.PaiTab;
			if(that.TabelaAddItens.filtro_visible == true){
				angular.forEach(that.TabelaAddItens.DADOS_RENDER, function(dado, valor){
					that.CheckSelect(dado);
				});
			}else{
				angular.forEach(that.TabelaAddItens.DADOS, function(dado, valor){
					that.CheckSelect(dado);
				});
			}            
        }

        function CheckSelect(item){
            var that = this;


            if(typeof that.PaiTab == 'undefined'){
                if(typeof that.TabelaAddItens.validarMarcarItem != 'undefined'){
                    if(that.TabelaAddItens.validarMarcarItem(item) == false){
                        item.CHECKED = false;
                    }
                }
            }else{
                if(typeof that.PaiTab.TabelaAddItens.validarMarcarItem != 'undefined'){
                    if(that.PaiTab.TabelaAddItens.validarMarcarItem(item) == false){
                        item.CHECKED = false;
                    }
                }
            }
           

            if(typeof that.PaiTab == 'undefined'){
                var ordem_checked = 1;
                
                if(that.BACKUP_ITENS_MARCADOS.length == 0){
                    item.ORDEM_CHECKED = ordem_checked;
                    that.BACKUP_ITENS_MARCADOS.push(angular.copy(item));
                }else{
                    var check = 0;
                    var aux = undefined;
                    var breakForeach = true;
                    angular.forEach(that.BACKUP_ITENS_MARCADOS, function (dado, valor){
                        if(breakForeach == true){
                            if((dado[that.CAMPO_INDEX] != item[that.CAMPO_INDEX])){
                                check = 1;
                                ++ordem_checked
                                item.ORDEM_CHECKED = ordem_checked;
                                aux = item;
                                breakForeach = true;
                            }else if((dado[that.CAMPO_INDEX] == item[that.CAMPO_INDEX] && item.CHECKED == true)){
                                check = 1;
                                --ordem_checked;
                                item.ORDEM_CHECKED = ordem_checked;
                                aux = item;
                                that.BACKUP_ITENS_MARCADOS.splice(valor, 1);
                                breakForeach = true;
                            }else{
                                check = 0;
                                ordem_checked = 0;
                                aux = valor;
                                breakForeach = false;
                            }
                        }                        
                    });

                    if(check == 1){
                        that.BACKUP_ITENS_MARCADOS.push(angular.copy(aux));
                    }else{
                        that.BACKUP_ITENS_MARCADOS.splice(aux, 1);
                    }
                }

                angular.forEach(that.BACKUP_ITENS_MARCADOS, function (dado, valor){
                    if(dado.CHECKED == false){
                        that.BACKUP_ITENS_MARCADOS.splice(valor, 1);
                    }
                    
                });


                that.TabelaAddItens.TotalTabela();
                if(typeof that.onCheckSelect != 'undefined'){
                    that.onCheckSelect(item);
                }

            }else{
                var ordem_checked = 1;

                if(that.PaiTab.BACKUP_ITENS_MARCADOS.length == 0){
                    item.ORDEM_CHECKED = ordem_checked;
                    that.PaiTab.BACKUP_ITENS_MARCADOS.push(angular.copy(item));
                }else{
                    var check = 0;
                    var aux = undefined;
                    var breakForeach = true;
                    angular.forEach(that.PaiTab.BACKUP_ITENS_MARCADOS, function (dado, valor){
                        if(breakForeach == true){
                            if(dado[that.PaiTab.CAMPO_INDEX] != item[that.PaiTab.CAMPO_INDEX]){
                                check = 1;
                                ++ordem_checked;
                                item.ORDEM_CHECKED = ordem_checked;
                                aux = item;
                                breakForeach = true;
                            }else if((dado[that.PaiTab.CAMPO_INDEX] == item[that.PaiTab.CAMPO_INDEX] && item.CHECKED == true)){
                                check = 1;
                                --ordem_checked;
                                item.ORDEM_CHECKED = ordem_checked;
                                aux = item;
                                that.PaiTab.BACKUP_ITENS_MARCADOS.splice(valor, 1);
                                breakForeach = true;
                            }else{
                                check = 0;
                                ordem_checked = 0;
                                aux = valor;
                                breakForeach = false;
                            }
                        }
                        
                    });

                    if(check == 1){
                        that.PaiTab.BACKUP_ITENS_MARCADOS.push(angular.copy(aux));
                    }else{
                        that.PaiTab.BACKUP_ITENS_MARCADOS.splice(aux, 1);
                    }
                }

                angular.forEach(that.PaiTab.BACKUP_ITENS_MARCADOS, function (dado, valor){
                    if(dado.CHECKED == false){
                        that.PaiTab.BACKUP_ITENS_MARCADOS.splice(valor, 1);
                    }
                    
                });

                that.PaiTab.TabelaAddItens.TotalTabela();
                if(typeof that.onCheckSelect != 'undefined'){
                    that.onCheckSelect(item);
                }
            }                
        }

        function fecharModalItensSelected(){
            var that = this;

            $(that.MODAL_ITENS_SELECIONADOS).modal('hide');

            if(typeof that.PaiTab != 'undefined'){
                that.PaiTab.onFecharModalItensSelected();
            }else{
                that.onFecharModalItensSelected();
            }
        }
        
        function confirmItensSelected(){
            var that = this;

            that.validar_confirmar_itens_add = true;

            $timeout(function (){
                that.onValidarConfirmarItensAdd();

                if(that.validar_confirmar_itens_add == true){

                    that.TimeItensSelect = $timeout(function (){

                        if(typeof that.BACKUP_ITENS_MARCADOS != 'undefined' && that.BACKUP_ITENS_MARCADOS.length != 0){
                            that.onFormatterItensSelected();
                            that.TabelaItensSelecionados.merge(that.BACKUP_ITENS_MARCADOS);
                            that.fimGravarConfirmItensSelected();					
                            if($(that.MODAL_ITENS_SELECIONADOS).hasClass("fade")){
                                $(that.MODAL_ITENS_SELECIONADOS).removeClass("fade")
                            }

                            $(that.MODAL_ITENS_SELECIONADOS).modal('show');
                            // Se o método acima gerar bugs removê-lo e descomentar a linha abaixo:
                            // $(that.MODAL_ITENS_SELECIONADOS).modal('show');

                            var timer = $timeout(function (){
                                var firstInput = $(that.MODAL_ITENS_SELECIONADOS).find('input,select,textarea,div[contenteditable=true]').filter(":visible:first");
                                firstInput.focus();

                                $timeout.cancel(timer);
                            }, 300);

                        }else if(typeof that.PaiTab != 'undefined' && typeof that.PaiTab.BACKUP_ITENS_MARCADOS != 'undefined' && that.PaiTab.BACKUP_ITENS_MARCADOS.length != 0){
                            that.onFormatterItensSelected();
                            that.PaiTab.TabelaItensSelecionados.merge(that.PaiTab.BACKUP_ITENS_MARCADOS);
                            that.fimGravarConfirmItensSelected();
                            if($(that.MODAL_ITENS_SELECIONADOS).hasClass("fade")){
                                $(that.MODAL_ITENS_SELECIONADOS).removeClass("fade")
                            }

                            $(that.MODAL_ITENS_SELECIONADOS).modal('show');
                            // Se o método acima gerar bugs removê-lo e descomentar a linha abaixo:
                        // $(that.MODAL_ITENS_SELECIONADOS).modal('show');

                            var timer = $timeout(function (){
                                var firstInput = $(that.MODAL_ITENS_SELECIONADOS).find('input,select,textarea,div[contenteditable=true]').filter(":visible:first");
                                firstInput.focus();

                                $timeout.cancel(timer);
                            }, 300);

                        }else{
                            if(typeof that.CONFIRMACAO_SEM_TABELA_ITENS != 'undefined' && that.CONFIRMACAO_SEM_TABELA_ITENS == true){
                                that.fimGravarConfirmTexto();
                                
                                if(that.VALIDAR_MODAL_ITENS_SELECIONADOS == true){

                                    if($(that.MODAL_ITENS_SELECIONADOS).hasClass("fade")){
                                        $(that.MODAL_ITENS_SELECIONADOS).removeClass("fade")
                                    }

                                    $(that.MODAL_ITENS_SELECIONADOS).modal('show');

                                    var timer = $timeout(function (){
                                        var firstInput = $(that.MODAL_ITENS_SELECIONADOS).find('input,select,textarea,div[contenteditable=true]').filter(":visible:first");
                                        firstInput.focus();
                
                                        $timeout.cancel(timer);
                                    }, 300);

                                }
                                // Se o método acima gerar bugs removê-lo e descomentar a linha abaixo:
                                //$(that.MODAL_ITENS_SELECIONADOS).modal('show');

                            }else{
                                showErro("Você não selecionou nenhum registro.");
                            }
                        } 
                        
                        $timeout.cancel(that.TimeItensSelect);	
                    });

                }
            });
        }
        
        function getItensAdd(e){

            var that = this;

            that.validar_consulta_itens_add = true;
            
            that.onValidarConsultarItensAdd();

            if(that.validar_consulta_itens_add == true){

                var dados = {
                        FILTRO: {
                            FILTRO     : that.FILTRO_DADOS,
                            FILTRO_ADD : that.FILTRO_DADOS_ADD
                        },
                        DADOS : { 
                            FILTRO     : that.FILTRO_DADOS,
                            FILTRO_ADD : that.FILTRO_DADOS_ADD
                        }
                    };

				if(typeof this.setDadosConsultarAddItens != 'undefined'){
					this.setDadosConsultarAddItens(dados);
				}else{
					this.setDadosConsultar(dados);
				}

                if(typeof e != 'undefined'){
                    that.TabelaAddItens.consulta_pagina = 0;
                }

                if(that.TabelaAddItens.infinite_scroll == true){
                    dados.FILTRO.QTD = that.TabelaAddItens.consulta_qtd;
                    dados.FILTRO.PAGINA = that.TabelaAddItens.consulta_qtd * that.TabelaAddItens.consulta_pagina;
                }

                if(that.TabelaAddItens.MODIFICAR_PAGINACAO == true){
                    dados.FILTRO.QTD    = that.TabelaAddItens.consulta_qtd;
                    dados.FILTRO.PAGINA = that.TabelaAddItens.consulta_qtd * that.TabelaAddItens.consulta_pagina;
                }

                return $q(function(resolve, reject){

                    var post_url = that.url_ItensAdd;

                    if(that.EXCLUINDO_MULTIPLOS == true){
                        post_url = that.url_ItensDel;
                    }

                    $ajax.post(post_url, dados, {new_job: that.ajax_new_job_get_itens_add}).then(function(response){
                        // that.TabelaAddItens.apagar();
                        if(that.marcar_todos_itens == true){
                            that.BACKUP_ITENS_MARCADOS = [];
                            angular.forEach(response, function(data,chave){
                                data.CHECKED = true;
                                that.BACKUP_ITENS_MARCADOS.push(data);
                            });
                        }
                        if(typeof that.TabelaAddItens.infinite_scroll != 'undefined' && that.TabelaAddItens.infinite_scroll == true){
                            that.TabelaAddItens.merge(response);
                        }else{
                            that.TabelaAddItens.DADOS = response;
                        }
                        
                        angular.forEach(that.BACKUP_ITENS_MARCADOS, function(dados, key){
                            angular.forEach(that.TabelaAddItens.DADOS, function(item, valor){
                                item.CHECKED = false;
                                // if(item.CODIGO == dados.CODIGO){
                                if(item[that.CAMPO_INDEX] == dados[that.CAMPO_INDEX]){
                                    that.TabelaAddItens.DADOS.splice(valor, 1);
                                }
                            });
                        });

                        angular.forEach(that.BACKUP_ITENS_MARCADOS, function(data,chave){
                            data.CHECKED = true;
                            that.TabelaAddItens.DADOS.push(data);
                        });

                        that.TabelaAddItens.count_marcados();

                        if(that.TabelaAddItens.counter_selected == that.TabelaAddItens.DADOS.length){
                            that.TabelaAddItens.linhas_marcadas = true;
                        }else{
                            that.TabelaAddItens.linhas_marcadas = false;
                        }

                        if(that.format_datamerge == true){
                            that.formatDataMerge(response);
                        }

                        if(that.format_datamerge_itens == true){
                            that.formatDataMergeItens(response);
                        }

                        if(that.TabelaAddItens.total_visible == true){
                            that.TabelaAddItens.TotalTabela();
                        }

                        that.onFimConsultarItensAdd(response);

                        resolve(response);
                    });

                });
            }
        }
        
        function filtrarToggle() {
            var that         = this;
            
            //if(that.habilita_toggle == true){

				if($('#filtro-toggle-usuario').val() == 1){
					that.TimefiltrarToggle = $timeout(function(){
						var filtro = $('#filtrar-toggle');
						if($(filtro).attr('aria-expanded') == 'true'){
							$(filtro).trigger('click');                  
						}
	
						$timeout.cancel(that.TimefiltrarToggle);
					},0, false);	
				}
                this.onFiltrarToggle();
            //}
        }
        
        function tabela_height(status){
            
			var that         = this;
            var tabela_dados = $('div.tabela_principal div.table-ec');
            var filtro       = $('#filtro_main');
            var aria         = filtro.attr('aria-expanded')
            
            if(filtro.attr('aria-expanded') == 'false' || status == true){
                if(typeof that.tabela_height_calc == 'undefined'){
                    that.Tabela.HEIGHT = 'calc(var(--screen-height) - 290px);';
                }else{
                    that.Tabela.HEIGHT = that.tabela_height_calc; 
                }
            }else{	
                that.Tabela.HEIGHT = 'calc(var(--screen-height) - 220px)';			
            }
        }
        
        function fecharModal(){
            this.Modal.hide();

            if(this.clearTabela == true){
                this.Itens.limparTabela();
            }

            this.onFecharModal();
        }

        function validarVisualizar(){
            return true;
        }
        
        function visualizar(){
			var that = this;

            if(that.validarVisualizar()){
                that.Modal.show();
                
                if(that.consultas.length > 0){
                    angular.forEach(that.consultas, function(consulta, key){
                        var nome = consulta.NOME;

                        if(typeof that.SELECTED[nome+'_JSON'] != 'undefined' && that.SELECTED[nome+'_JSON'] != '' && that.SELECTED[nome+'_JSON'] != null && !isJSONEmpty(JSON.parse(that.SELECTED[nome+'_JSON']))){
                            consulta.OBJ.setSelected(JSON.parse(that.SELECTED[nome+'_JSON']));

                            if(that.SELECTED[that.CAMPO_INDEX] <= 0 && that.disabled_consulta_on_visualizar == false){
                                consulta.OBJ.btn_apagar_filtro.disabled = false;
                            }else{
                                consulta.OBJ.btn_apagar_filtro.disabled = true;
                            }
                            
                        }else{
                            if(that.SELECTED[that.CAMPO_INDEX] <= 0 && that.disabled_consulta_on_visualizar == false){
                                consulta.OBJ.apagar();
                                consulta.OBJ.Input.disabled = false;
                                consulta.OBJ.btn_filtro.disabled = false;    
                            }else{
                                consulta.OBJ.apagar();
                                consulta.OBJ.Input.disabled = true;
                                consulta.OBJ.btn_filtro.disabled = true;   
                            }
                        }

                    });
                }
                
                if(that.habilita_itens == true){
                    that.Itens.ITENS_EXCLUIDOS = [];
                    that.Itens.DADOS = [];
                    if(that.consultar_itens == true){
                        that.Itens.consultar();
                    }
					if(that.Itens.TIPO_ADD == 3){
						that.Itens.Tabela.delete_item = true;
					}
                }

                if(that.TIPO_ADD == 2 && that.SELECTED[that.CAMPO_INDEX] <= 0){
                    angular.copy(that.Itens.DADOS, that.BACKUP_ITENS);
                } 

                desativarBeforeunload(that.factory_principal);
                that.onVisualizar();
                if(that.clearTabela == true){
                    that.Itens.limparTabela();
                    that.Itens.compileTabela();
                }
            }
        }

        function setNewJobAll(new_job){
            var that = this;
            
            that.ajax_new_job_gravar        = new_job;
            that.ajax_new_job_consultar     = new_job;
            that.ajax_new_job_excluir       = new_job;
            that.ajax_new_job_ItensDel      = new_job;
            that.ajax_new_job_excluir_mult  = new_job;
            that.ajax_new_job_get_itens_add = new_job;
        }

        function setFactoryPrincipal(){
            var that = this;
            ativarKeyEventRefresh  = false;
            that.factory_principal = 1;
        }

        function consultar(e) {
            var that = this;

            that.validar_consultar = true;
            
            that.onValidarConsultar();

            if(that.validar_consultar == true){
                
                var dados = {
                        FILTRO: { 
                            FILTRO      : that.FILTRO_DADOS, 
                            FILTRO_ADD  : that.FILTRO_DADOS_ADD 
                        },
                        DADOS : { 
                            FILTRO      : that.FILTRO_DADOS,
                            FILTRO_ADD  : that.FILTRO_DADOS_ADD
                        }
                    };

                this.setDadosConsultar(dados);

                if(typeof e != 'undefined'){
                    that.Tabela.consulta_pagina = 0;
                }

                if(that.Tabela.infinite_scroll == true){
                    dados.FILTRO.QTD    = that.Tabela.consulta_qtd;
                    dados.FILTRO.PAGINA = that.Tabela.consulta_qtd * that.Tabela.consulta_pagina;
                }

                if(that.Tabela.MODIFICAR_PAGINACAO == true){
                    dados.FILTRO.QTD    = that.Tabela.consulta_qtd;
                    dados.FILTRO.PAGINA = that.Tabela.consulta_qtd * that.Tabela.consulta_pagina;
                }
                    
                return $q(function(resolve, reject){

                    var send = {new_job: that.ajax_new_job_consultar};

                    if(that.see_active){

                        try {
                            gScope.Ctrl.SSE_PROGRESSO_CALC   = 0;
                            gScope.Ctrl.SSE_PORGRESSO_STATUS = '';
                            gScope.Ctrl.SSE_PORGRESSO1 	     = 0;
                            gScope.Ctrl.SSE_PORGRESSO_TOTAL1 = 0;
                        } catch (error) {
                            
                        }

                        try {
                            send = {
                                new_job: that.ajax_new_job_consultar,
                                seeType: that.see_type, 
                                see: true, 
                                metodos: angular.copy(that.see_metodos), 
                                seeProgress: that.see_metodos.length == 0,
                                scope: gScope
                            };
                        } catch (error) {
                            
                        }
                    }

                    $ajax.post( that.url_consultar ,dados, send).then(function(response){
                        
                        that.merge(response);

						var f165 = false;
						try {
							if(response.length > 0){
								f165 = true
							}							
						} catch (error) {
							
						}

						if($('#filtro-toggle-usuario').val() == 1 && f165){
							that.filtrarToggle();
						}

                        if(typeof that.BACKUP_ITENS_MARCADOS != 'undefined' && that.BACKUP_ITENS_MARCADOS.length != 0 && that.manter_itens_marcados == true){
                            angular.forEach(that.BACKUP_ITENS_MARCADOS, function(dados, key){
                                angular.forEach(that.Tabela.DADOS, function(item, valor){
                                    item.CHECKED = false;
                                    if(item[that.CAMPO_INDEX] == dados[that.CAMPO_INDEX]){
                                        that.Tabela.DADOS.splice(valor,1);
                                    }
                                });
                            });
        
                            angular.forEach(that.BACKUP_ITENS_MARCADOS, function(data, chave){
                                data.CHECKED = true;
                                that.Tabela.DADOS.push(data);
                            });
        
                            that.Tabela.count_marcados();

                            if(that.Tabela.counter_selected == that.Tabela.DADOS.length){
                                that.Tabela.linhas_marcadas = true;
                            }else{
                                that.Tabela.linhas_marcadas = false;
                            }
                        }

                        if(that.manter_itens_marcados == false){
                            
                            that.BACKUP_ITENS_MARCADOS = [];

                            that.Tabela.count_marcados();
                        }

                        that.fimConsultar(response);
                        
                        resolve(response);
                    },function(e){
                        that.fimConsultarOnReject(e);
                        reject(e);
                    });
                });
            }
        } 
        
        function confirmarExcluir() {
            var that = this;

            return $q(function(resolve, reject){

                that.Tabela.operacao_merge_gravar = true;                

                if(that.montar_dados_excluir == true){
                    if(that.consultas.length > 0){
                        angular.forEach(that.consultas, function(consulta, key){
                            var nome = consulta.NOME;
                            
                            if(consulta.OBJ.item.selected == true){
                                that.SELECTED[nome]         = consulta.OBJ.item.dados;
                                that.SELECTED[nome+'_BKP']  = consulta.OBJ.item.dados;
                                that.SELECTED[nome+'_JSON'] = JSON.stringify(consulta.OBJ.item.dados);
                            }else{
                                that.SELECTED[nome]         = undefined;
                                that.SELECTED[nome+'_BKP']  = undefined;
                                that.SELECTED[nome+'_JSON'] = '';
                            }
    
                        });
                    }
                }
                
                var dados = {
                    FILTRO: { 
                        FILTRO      : that.FILTRO_DADOS, 
                        FILTRO_ADD  : that.FILTRO_DADOS_ADD 
                    },
                    DADOS : that.SELECTED
                };

                if(that.Tabela.infinite_scroll == true){
                    dados.FILTRO.QTD    = that.Tabela.consulta_qtd;
                    dados.FILTRO.PAGINA = that.Tabela.consulta_qtd * that.Tabela.consulta_pagina;
                }

                if(that.Tabela.MODIFICAR_PAGINACAO == true){
                    dados.FILTRO.QTD    = that.Tabela.consulta_qtd;
                    dados.FILTRO.PAGINA = that.Tabela.consulta_qtd * that.Tabela.consulta_pagina;
                }

                that.setDadosConsultar(dados);
                that.onConfirmarExcluir();

                if((that.TIPO_ADD == 1 || that.TIPO_ADD == 3) && that.TIPO_GRAVAR == 1){
                    $ajax.post( that.url_excluir ,dados, {new_job: that.ajax_new_job_excluir}).then(function(response){

                        if(that.merger_dados == true){
                            that.merge(response.DATA_RETURN);
                        }else{
                            var add = false;
                            var index = -1;
                            var indexInf = -1;

                            if(that.merger_tabela == false){
                                angular.forEach(that.DADOS, function (item, key){
                                    if(item[that.CAMPO_INDEX]  == that.SELECTED[that.CAMPO_INDEX] ){
                                        add   = true;
                                        index = key;
                                        indexInf = key - 1;
                                    }
                                });

                                if(add){
                                    that.DADOS.splice(index, 1);
                                    that.Tabela.merge(that.DADOS);
                                    
                                    if(that.focar_excluido == true || that.Tabela.delete_item == true){
                                        if(trim_null(response.DATA_RETURN) != ''){
                                            that.SELECTED = response.DATA_RETURN[index];
                                            if(trim_null(that.SELECTED) == ''){
                                                that.SELECTED = response.DATA_RETURN[indexInf];
                                                $timeout(function(){
                                                    $(that.Tabela.componente).find('tr.selected:focusable').first().focus()
                                                },200)
                                            }
                                        }else if(trim_null(that.DADOS) != ''){
                                            that.SELECTED = that.DADOS[index];
                                            if(trim_null(that.SELECTED) == ''){
                                                that.SELECTED = that.DADOS[indexInf];
                                                $timeout(function(){
                                                    $(that.Tabela.componente).find('tr.selected:focusable').first().focus()
                                                },200)
                                            }
                                        }
                                    }
                                }
                            }else{

                                angular.forEach(that.Tabela.DADOS, function (item, key){
                                    if(item[that.CAMPO_INDEX]  == that.SELECTED[that.CAMPO_INDEX] ){
                                        add   = true;
                                        index = key;
                                        indexInf = key - 1;
                                    }
                                });

                                if(add){
                                    that.Tabela.DADOS.splice(index, 1);
                                    //that.Tabela.merge(that.DADOS);
                                    
                                    if(that.focar_excluido == true || that.Tabela.delete_item == true){
                                        if(trim_null(response.DATA_RETURN) != ''){
                                            that.SELECTED = response.DATA_RETURN[index];
                                            if(trim_null(that.SELECTED) == ''){
                                                that.SELECTED = response.DATA_RETURN[indexInf];
                                                $timeout(function(){
                                                    $(that.Tabela.componente).find('tr.selected:focusable').first().focus()
                                                },200)
                                            }
                                        }else if(trim_null(that.DADOS) != ''){
                                            that.SELECTED = that.DADOS[index];
                                            if(trim_null(that.SELECTED) == ''){
                                                that.SELECTED = that.DADOS[indexInf];
                                                $timeout(function(){
                                                    $(that.Tabela.componente).find('tr.selected:focusable').first().focus()
                                                },200)
                                            }
                                        }
                                    }
                                }

                            }
                        }

                        if(typeof that.campo_focalizador != 'undefined' && (that.focar_excluido == true || that.Tabela.delete_item == true)/* && that.INCLUINDO == true && that.COPIANDO == true*/){
                            angular.forEach(that.Tabela.DADOS, function(item, key){
                                if(trim_null(item[that.campo_focalizador]) == trim_null(that.SELECTED[that.campo_focalizador])){
                                    that.SELECTED = item;
                                }
							});
							
							$timeout(function(){
								$(that.Tabela.componente).find('tr.selected:focusable').first().focus()
							},200)
                        }

                        that.Modal.hide();

                        that.ALTERANDO           = false;
                        that.INCLUINDO           = false;
                        that.COPIANDO            = false;
                        that.EXCLUINDO_MULTIPLOS = false;

                        that.fimExcluir(response);

                        resolve(response);
                    },function(e){
                        reject(e);
                    });
                }else{
                    if(that.TIPO_ADD == 2 || that.TIPO_GRAVAR == 2){
                        var item_add = {};
                        var add = false;
                        var index = -1;
                        var indexInf = -1;

                        angular.forEach(that.DADOS, function (item, key){
                            if(item[that.CAMPO_INDEX] == that.SELECTED[that.CAMPO_INDEX]){
                                item_add = item;
                                add = true;
                                index = key;
                                indexInf = key - 1;
                            }
                        });

                        if(add){
                            that.ITENS_EXCLUIDOS.push(item_add);
                            that.DADOS.splice(index, 1);
                            that.Tabela.merge(that.DADOS);

                            if(that.focar_excluido == true || that.Tabela.delete_item == true){
                                if(trim_null(that.DADOS) != ''){
                                    that.SELECTED = that.DADOS[index];
                                    if(trim_null(that.SELECTED) == ''){
                                        that.SELECTED = that.DADOS[indexInf];
                                        $timeout(function(){
                                            $(that.Tabela.componente).find('tr.selected:focusable').first().focus()
                                        },200)
                                    }
                                }
                            }
                        }

                        if(typeof that.campo_focalizador != 'undefined' && (that.focar_excluido == true || that.Tabela.delete_item == true)/* && that.INCLUINDO == true && that.COPIANDO == true*/){
                            angular.forEach(that.Tabela.DADOS, function(item, key){
                                if(trim_null(item[that.campo_focalizador]) == trim_null(that.SELECTED[that.campo_focalizador])){
                                    that.SELECTED = item;
                                }
							});
							
							$timeout(function(){
								$(that.Tabela.componente).find('tr.selected:focusable').first().focus()
							},200)
                        }

                        that.Modal.hide();
                        that.ALTERANDO           = false;
                        that.INCLUINDO           = false;
                        that.COPIANDO            = false;
                        that.EXCLUINDO_MULTIPLOS = false;

                        that.fimExcluir();
                        resolve();
                    }else{
                        that.fimExcluir();
                        reject();
                    }
                }
            });
        }

        function setDadosConsultar(dados){
            var that = this;

            return dados;
        }
        
        function setDadosFiltro(dados){
            var that = this;

            return dados;
        }

        function confirmarGravar() {
            var that = this;

            return $q(function(resolve, reject){

                that.Tabela.operacao_merge_gravar = true;

                if(that.consultas.length > 0){
                    angular.forEach(that.consultas, function(consulta, key){
                        var nome = consulta.NOME;
                        
                        if(consulta.OBJ.item.selected == true){
                            that.SELECTED[nome]         = consulta.OBJ.item.dados;
                            that.SELECTED[nome+'_BKP']  = consulta.OBJ.item.dados;
                            that.SELECTED[nome+'_JSON'] = JSON.stringify(consulta.OBJ.item.dados);
                        }else{
                            that.SELECTED[nome]         = undefined;
                            that.SELECTED[nome+'_BKP']  = undefined;
                            that.SELECTED[nome+'_JSON'] = '';
                        }

                    });
                }

                that.beforeConfirmarGravar();

                var dados = {
                    FILTRO: { 
                        FILTRO      : that.FILTRO_DADOS,
                        FILTRO_ADD  : that.FILTRO_DADOS_ADD
                    },
                    DADOS : that.SELECTED
                };

                if(that.habilita_itens == true){
                    if(that.Itens.TIPO_ADD == 2){
                        that.SELECTED.GRAVAR_ITENS    = that.Itens.DADOS;
                        that.SELECTED.ITENS_EXCLUIDOS = that.Itens.ITENS_EXCLUIDOS;
                    }
                }
                
                dados = that.setDadosFiltro(dados);

                that.onConfirmarGravar();
                
                if((that.TIPO_ADD == 1 || that.TIPO_ADD == 3) && that.TIPO_GRAVAR == 1){

                    that.execPosGravar = function(response){
                        if(that.merger_dados == true){

                            if(that.COPIANDO){
                                for (var v = 0; v < that.DADOS.length; v++) {
                                    if(trim_null(that.DADOS[v][that.CAMPO_INDEX]) === ''){
                                        that.DADOS[v] = angular.copy(that.BACKUP);
                                        that.BACKUP = {};
                                        break;
                                    }
                                }
                            }
                            
                            if(that.INCLUINDO == true || that.COPIANDO == true){
                                that.SELECTED[that.CAMPO_INDEX] = response.ID_RETURN;
                            }	

                            that.merge(response.DATA_RETURN);
                        }else{
							if(that.atualizar_principal == true){
								var index = -1;
								if(typeof response.DATA_RETURN != "undefined" && response.DATA_RETURN.length > 0){
									if(that.INCLUINDO || that.COPIANDO){
                                        that.DADOS.push(response.DATA_RETURN[0]);
									}else{										
										angular.forEach(that.DADOS, function (item, key){
											if(item[that.CAMPO_INDEX] == response.ID_RETURN){
												index = key;
											}
										});
		
										that.DADOS[index] = response.DATA_RETURN[0];
                                    }
                                    
                                    if(that.COPIANDO){
                                        for (var v = 0; v < that.DADOS.length; v++) {
                                            if(trim_null(that.DADOS[v][that.CAMPO_INDEX]) === ''){
                                                that.DADOS[v] = angular.copy(that.BACKUP);
                                                that.BACKUP = {};
                                                break;
                                            }
                                        }
                                    }

									that.merge(that.DADOS);
                                    that.SELECTED = response.DATA_RETURN[0];
								}								
								
							}else{

                                if(that.merger_tabela == false){
                                    var add = false;
                                    angular.forEach(that.DADOS, function (item, key){
                                        if(item[that.CAMPO_INDEX] == response.ID_RETURN){
                                            add = true;
                                        }
                                    });
                                    
                                    if(typeof response.DATA_RETURN != 'undefined' && add == false && response.DATA_RETURN.length > 0){
                                        angular.forEach(response.DATA_RETURN, function (item, key){
                                            that.DADOS.push(item); 
                                        });
                                    }
        
                                    if(that.INCLUINDO == true || that.COPIANDO == true){
                                        angular.forEach(that.DADOS, function (item, key){
                                            if(item[that.CAMPO_INDEX] == response.ID_RETURN){
                                                that.SELECTED = item;
                                            }
                                        });
                                    }
                                }else{
                                    var add = false;
                                    var index = -1;
                                    angular.forEach(that.DADOS, function (item, key){
                                        if(item[that.CAMPO_INDEX] == response.ID_RETURN){
                                            add = true;
                                            index = key;
                                        }
                                    });
                                    
                                    if(typeof response.DATA_RETURN != 'undefined' && add == false && response.DATA_RETURN.length > 0){
                                        angular.forEach(response.DATA_RETURN, function (item, key){
                                            that.DADOS.push(item); 
                                        });
                                    }else if(typeof response.DATA_RETURN != 'undefined' && add == true && response.DATA_RETURN.length > 0){

                                        that.DADOS.splice(index, 1);

                                        that.DADOS.push(response.DATA_RETURN[0]);

                                    }
        
                                    if(that.INCLUINDO == true || that.COPIANDO == true){
                                        angular.forEach(that.DADOS, function (item, key){
                                            if(item[that.CAMPO_INDEX] == response.ID_RETURN){
                                                that.SELECTED = item;
                                            }
                                        });
                                    }   
                                }
							}

                            if(that.merger_tabela == false){
                                that.Tabela.merge(that.DADOS);
                            }
                        }
                        
                        if(that.consultas.length > 0){
                            angular.forEach(that.consultas, function(consulta, key){
                                consulta.OBJ.btn_apagar_filtro.disabled = true;
                                consulta.OBJ.Input.disabled = true;
                                consulta.OBJ.btn_filtro.disabled = true;
                            });
                        }

                        if(typeof that.CONFIRMACAO_SEM_TABELA_ITENS == 'undefined' && that.TIPO_ADD == 3){
                            that.fecharModalItensSelected();
                            that.Modal.hide();
                            that.BACKUP_ITENS_MARCADOS = [];
                            that.TabelaAddItens.apagar();

                            if(that.consulta_itens_add_on_gravar == true){
                                that.consultar();
                            }
                            
                        }
                        
                        if(that.habilita_itens == true){
                            if(that.Itens.TIPO_ADD == 2){
                                if(that.consultar_itens == true){
                                    that.Itens.consultar();
                                }
                            }
                        }
                        
                        if(typeof that.campo_focalizador != 'undefined' && that.focar_incluido == true/* && that.INCLUINDO == true && that.COPIANDO == true*/){
                            angular.forEach(that.Tabela.DADOS, function(item, key){
                                if(trim_null(item[that.campo_focalizador]) == trim_null(that.SELECTED[that.campo_focalizador])){
                                    that.SELECTED = item;
                                }
                            });
                            
                            if(that.fechar_modal_incluir == true){
                                that.Modal.hide();
                            }
                        }

                        if(that.COPIANDO){
                            that.BACKUP_ID_COPY = '';
                        }
                        
                        that.beforeFimGravar(response);
                        
                        that.ALTERANDO           = false;
                        that.INCLUINDO           = false;
                        that.COPIANDO            = false;
                        that.EXCLUINDO_MULTIPLOS = false;

                        desativarBeforeunload(that.factory_principal);
                        that.fimGravar(response);
                        resolve(response);
                    }

                    var send = {new_job: that.ajax_new_job_consultar};

                    if(that.see_active){
                        
                        try {
                            gScope.Ctrl.SSE_PROGRESSO_CALC   = 0;
                            gScope.Ctrl.SSE_PORGRESSO_STATUS = '';
                            gScope.Ctrl.SSE_PORGRESSO1 	     = 0;
                            gScope.Ctrl.SSE_PORGRESSO_TOTAL1 = 0;
                        } catch (error) {
                            
                        }

                        try {
                            send = {
                                new_job: that.ajax_new_job_consultar,
                                seeType: that.see_type, 
                                see: true, 
                                metodos: angular.copy(that.see_metodos), 
                                seeProgress: that.see_metodos.length == 0,
                                scope: gScope
                            };
                        } catch (error) {
                            
                        }
                    }
                    
                    if(that.postfiles == true){
                        $ajax.postFile( that.url_gravar, dados, send).then(function(response){
                            that.execPrePosGravar(response);
                            that.execPosGravar(response);
                        },function(e){
                            that.executeOnReject();
                            reject(e);
                        });
                    }else{
                        $ajax.post( that.url_gravar, dados, send).then(function(response){
                            that.execPrePosGravar(response);
                            that.execPosGravar(response);
                        },function(e){
                            that.executeOnReject();
                            reject(e);
                        });
                    }

                }else{
                    if(that.TIPO_ADD == 2 || that.TIPO_GRAVAR == 2){

                        if(that.TIPO_GRAVAR == 1){
                            that.beforeFimGravar();

                            var add = false;
                            if(that.COPIANDO){
                                that.DADOS.push(angular.copy(that.SELECTED));
                                
                                for (var v = 0; v < that.DADOS.length; v++) {
                                    if(trim_null(that.DADOS[v][that.CAMPO_INDEX]) === '' || that.DADOS[v][that.CAMPO_INDEX] === (that.DADOS.length * -1)){
                                        that.DADOS[v] = angular.copy(that.BACKUP);
                                        that.BACKUP = {};
                                        break;
                                    }
                                }

                                add = true;
                            }else{
                                angular.forEach(that.DADOS, function (item, key){
                                    if(item[that.CAMPO_INDEX] == that.SELECTED[that.CAMPO_INDEX]){
                                        add = true;
                                    }
                                });
                            }

                            that.getFimGravar();
                            
                            if(that.fechar_modal_incluir_t2 == true){
                                if(add == false){
                                    that.Modal.hide();
                                    that.ALTERANDO           = false;
                                    that.INCLUINDO           = false;
                                    that.COPIANDO            = false;
                                    that.EXCLUINDO_MULTIPLOS = false;
                                    that.DADOS.push(angular.copy(that.SELECTED));
                                }else{
                                    that.ALTERANDO           = false;
                                    that.INCLUINDO           = false;
                                    that.COPIANDO            = false;
                                    that.EXCLUINDO_MULTIPLOS = false;
                                }
                            }else{
                                if(add == false){
                                    that.DADOS.push(angular.copy(that.SELECTED)); 
                                }else{
                                    that.Modal.hide();
                                    that.ALTERANDO           = false;
                                    that.INCLUINDO           = false;
                                    that.COPIANDO            = false;
                                    that.EXCLUINDO_MULTIPLOS = false;
                                }

                                that.SELECTED = that.setDadosIncluir();

                                if(that.consultas.length > 0){
                                    angular.forEach(that.consultas, function(consulta, key){
                                        consulta.OBJ.apagar();
                                        consulta.OBJ.Input.disabled = false;
                                        consulta.OBJ.btn_filtro.disabled = false;
                                    });
                                }
                            }
                            
                            that.Tabela.merge(that.DADOS);
                            
                            that.Time1 = setTimeout(function(){
                                var firstInput = $(that.Modal._modal).find('input,select,textarea,div[contenteditable=true]').not('.not_tab_enter').filter(":visible:first");
                                firstInput.focus();
                                $timeout.cancel(that.Time1);
                            }, 300, false);

                        }else{

                            that.beforeFimGravar();
                            that.getFimGravar();

                            angular.forEach(that.BACKUP_ITENS_MARCADOS, function (selected, key){
                                var add = false;
                                angular.forEach(that.DADOS, function (item, key){
                                    if(item[that.CAMPO_INDEX] == selected[that.CAMPO_INDEX]){
                                        add = true;
                                    }
                                });
                                
                                if(add == false){
                                    that.DADOS.push(angular.copy(selected)); 
                                }
							});
							
							that.onMergeItens();
                            
                            that.Tabela.merge(that.DADOS);

                            that.SELECTED = that.setDadosIncluir();

                            if(typeof that.CONFIRMACAO_SEM_TABELA_ITENS == 'undefined' && that.TIPO_ADD == 3){
                                that.fecharModalItensSelected();
                                that.Modal.hide();
                                that.BACKUP_ITENS_MARCADOS = [];
                                that.TabelaAddItens.apagar();
                            }
                            
                        }

                        desativarBeforeunload(that.factory_principal);
                        that.fimGravar({});
                        resolve();
                    }else{

                        desativarBeforeunload(that.factory_principal);
                        that.fimGravar({});
                        reject();
                    }
                }
            });
        }

        function formatDataMerge(obj){

        }

        function formatDataMergeItens(obj){

        }
        
        /**
         * Retorna a view da factory
         */
        function merge(response) {
            var that = this;
            
            that.beforeMerge(response);

            // sanitizeJson(response);
            // gcCollection.merge(that.DADOS , response, ['ID']);
            that.DADOS = response;
            that.formatDataMerge(that);
            that.formatDataMergeItens(that);
            that.Tabela.merge(that.DADOS);

            if(that.Tabela.tipo_tabela == 'accordion'){
                that.Tabela.getDadosRender();
            }

            that.onMerge();
            
        }
        
        function setDadosIncluir(){

            var dados = {
                DESCRICAO    : '',
                STATUS       : '1'
            }

            return dados;
        }

        function incluir() {
            var that = this;

            that.validar_incluir = true;

            that.onValidarIncluir();

            if(that.validar_incluir == true){
                
                that.BACKUP     = {};

                that.SELECTED   = that.setDadosIncluir();
                
                that.ALTERANDO           = true;
                that.INCLUINDO           = true;
                that.COPIANDO            = false;
                that.EXCLUINDO_MULTIPLOS = false;
                
                if(that.habilita_itens == true){
                    that.Itens.ITENS_EXCLUIDOS  = [];
                    that.Itens.DADOS            = [];
                    that.Itens.Tabela.DADOS     = [];
                }
                
                if(that.consultas.length > 0){
                    angular.forEach(that.consultas, function(consulta, key){
                        consulta.OBJ.apagar();
                        consulta.OBJ.Input.disabled = false;
                        consulta.OBJ.btn_filtro.disabled = false;
                    });
                }
                
                if(typeof that.CONFIRMACAO_SEM_TABELA_ITENS == 'undefined' && that.TIPO_ADD == 3){
                    that.FILTRO_DADOS = '';
                    that.FILTRO_DADOS_ADD = '';
                    that.BACKUP_ITENS_MARCADOS = [];
                    that.TabelaAddItens.apagar();
                }

				that.Modal.show();
				if(that.clearTabela == true){
					that.Itens.limparTabela();
					that.Itens.compileTabela();                    
                }	

                ativarBeforeunload(that.factory_principal);
                that.onIncluir();
            }
        }

        function incluirNovo(){
            var that = this;

            that.Modal.hide();

			var timer = $timeout(function (){
                that.incluir();
                
				$timeout.cancel(timer);
			}, 0);

		}
        
        function nextRecord(){
            var that = this;

            var ret = that.Tabela.next(that.SELECTED);

            if(ret.POS > 0){
                that.SELECTED = ret.ITEM;
                that.visualizar();

                that.onNextRecord();
            }

        }
        
        function previousRecord(){
            var that = this;

            var ret = that.Tabela.previous(that.SELECTED);

            if(ret.POS > 0){
                that.SELECTED = ret.ITEM;
                that.visualizar();

                that.onPreviousRecord();
            }

		}

        function alterar() {     
            var that = this;
            
            that.validar_alterar = true;

            that.onValidarAlterar();

            if(that.validar_alterar == true){

                angular.copy(that.SELECTED, that.BACKUP);
                
                if(that.habilita_itens == true){
                    if(that.Itens.TIPO_ADD == 2){
                        angular.copy(that.Itens.DADOS, that.BACKUP_ITENS);
                    }
                }

                that.ALTERANDO = true;
                
                /*$('#tab1-tab').trigger('click');*/
                
                that.Modal.focus();
                
                
                if(that.consultas.length > 0){
                    angular.forEach(that.consultas, function(consulta, key){
                        if(typeof consulta.ALTERAR == 'undefined' || consulta.ALTERAR == true){
                            consulta.OBJ.btn_apagar_filtro.disabled = false;
                            consulta.OBJ.Input.disabled = false;
                            consulta.OBJ.btn_filtro.disabled = false;
                        }
                        
                    });
                }
                
                ativarBeforeunload(that.factory_principal);
                that.onAlterar();

            }
        };   
        
        function copiar(){
            var that = this;

            that.validar_copiar = true;
        
            that.onValidarCopiar();
        
            if(that.validar_copiar == true){
                
                angular.copy(that.SELECTED, that.BACKUP);
                that.SELECTED = angular.copy(that.SELECTED);
        
                if(that.habilita_itens == true){
                    if(that.Itens.TIPO_ADD == 2){
                        angular.copy(that.Itens.DADOS, that.BACKUP_ITENS);

                        var indice = -1;
                        for (var index = 0; index < that.Itens.DADOS.length; index++) {
                            var element = that.Itens.DADOS[index];
                        
                            element.ID = indice--;
                            element.DESC_ID = undefined;
                        }
                    }
                }
                
                that.COPIANDO            = true;
                that.ALTERANDO           = true;
                that.INCLUINDO           = false;
                that.EXCLUINDO_MULTIPLOS = false;                
        
                that.Modal.focus();
                
                if(that.consultas.length > 0){
                    angular.forEach(that.consultas, function(consulta, key){
                        if(typeof consulta.ALTERAR == 'undefined' || consulta.ALTERAR == true){
                            consulta.OBJ.btn_apagar_filtro.disabled = false;
                            consulta.OBJ.Input.disabled = false;
                            consulta.OBJ.btn_filtro.disabled = false;
                        }
                        
                    });
                }

                that.BACKUP_ID_COPY     = that.SELECTED[that.CAMPO_INDEX];
        
                if(that.TIPO_ADD == 2){
					var valor_ID = -1 * (that.Tabela.DADOS.length + 1);
					angular.forEach(that.Tabela.DADOS, function(item, key){
						if(item[that.CAMPO_INDEX] < valor_ID){
							valor_ID = item[that.CAMPO_INDEX] + -1
						}
					})
					that.SELECTED[that.CAMPO_INDEX]		        = valor_ID;
					that.SELECTED['DESC_'+that.CAMPO_INDEX]     = valor_ID;
				}else{
					that.SELECTED[that.CAMPO_INDEX]             = undefined;
					that.SELECTED['DESC_'+that.CAMPO_INDEX]     = undefined;
				}
        
                ativarBeforeunload(that.factory_principal);
                that.onCopiar();
        
            }
        };
                
        function cancelar() {
            var that = this;

            var selected = angular.toJson(that.SELECTED);
            var backup   = angular.toJson(that.BACKUP);
                        
            function close() {

                if(Object.keys(that.BACKUP).length != 0){
                    angular.extend(that.SELECTED, that.BACKUP); 

                    if(that.habilita_itens == true){
                        if(that.Itens.TIPO_ADD == 2){
                            that.Itens.DADOS =  angular.copy(that.BACKUP_ITENS); 
                            that.Itens.ITENS_EXCLUIDOS = [];
                            that.Itens.Tabela.merge(that.Itens.DADOS);
                        }
                    }
                    
                    if(that.consultas.length > 0){
                        angular.forEach(that.consultas, function(consulta, key){
                            var nome = consulta.NOME;

                            if(that.INCLUINDO == false){
                                if(typeof that.SELECTED[nome+'_JSON'] != 'undefined' && that.SELECTED[nome+'_JSON'] != '' && that.SELECTED[nome+'_JSON'] != null){
                                    consulta.OBJ.setSelected(JSON.parse(that.SELECTED[nome+'_JSON']));
                                    consulta.OBJ.btn_apagar_filtro.disabled = true;
                                }else{
                                    if(typeof that.SELECTED[nome+'_BKP'] == 'undefined' || that.SELECTED[nome+'_BKP'] == null){
                                        consulta.OBJ.apagar();
                                        consulta.OBJ.Input.disabled = true;
                                        consulta.OBJ.btn_filtro.disabled = true;     
                                    }else{
                                        consulta.OBJ.setSelected(that.SELECTED[nome+'_BKP']);
                                        consulta.OBJ.btn_apagar_filtro.disabled = true;
                                    }     
                                }
                            }

                        });
                    }
                }
                
                if(that.INCLUINDO == true || that.EXCLUINDO_MULTIPLOS == true){
                    that.Modal.hide();
                }

                that.beforeCancelar();
                
                that.ALTERANDO           = false;
                that.INCLUINDO           = false;
                that.COPIANDO            = false;
                that.EXCLUINDO_MULTIPLOS = false;

                if(typeof that.CONFIRMACAO_SEM_TABELA_ITENS == 'undefined' && that.TIPO_ADD == 3){
                    that.BACKUP_ITENS_MARCADOS = [];
                    that.TabelaAddItens.apagar();
                }

                desativarBeforeunload(that.factory_principal);
                that.onCancelar();
            }
            
            if ( selected != backup || that.force_confirmar_cancelar == true) {

                if(that.confirmar_cancelar == true || that.force_confirmar_cancelar == true){
                    addConfirme('<h4>Confirmação</h4>',
                        'Deseja realmente cancelar esta operação?',
                        [obtn_sim,obtn_nao],
                        [{ret:1,func:function(){
                            $rootScope.$apply(function(){
                                
                                that.ALTERANDO = false;
                
                                close();
                            });
                        }}]     
                    );
                }else{
                    that.ALTERANDO = false;
                    close();
                }

            } else {
                close();
            }     
        }
        
        function excluir() {
			var that = this;
			that.validar_excluir = true;
            that.onExcluir();

			if(that.validar_excluir == true){
				if(that.confirmar_excluir == true){ 

					var re2 = {ret:2,func: function(){}};
	
					if(that.Tabela.delete_item == true){
						re2 = {ret:2,func:function(){
							$rootScope.$apply(function(){
								var tabela_item = $(that.Tabela.componente).find('.selected:focusable');
								if(tabela_item.length > 0){
									tabela_item.first().focus();
								}	
							});
						}}  
					}
	
					addConfirme('<h4>Confirmação</h4>',
						'Deseja realmente excluir este registro?',
						[obtn_sim,obtn_nao],
						[{ret:1,func:function(){
							$rootScope.$apply(function(){
								that.confirmarExcluir();
							});
						}}, re2]     
					);
				}else{
					that.confirmarExcluir();
				}
			}            
		}
		        
        function gravar() {
            var that = this;

            that.validar_gravar = true;

            that.onGravar();

            that.TimeGravar = $timeout(function (){

                if(that.validar_gravar == true){
                    if(that.confirmar_gravar == true){
                        addConfirme('<h4>Confirmação</h4>', that.MSG_GRAVAR,
                            [obtn_sim,obtn_nao],
                            [{ret:1,func:function(){
                                $rootScope.$apply(function(){
                                    that.confirmarGravar();
                                });
                            }},
                            {ret:2,func:function(){
                                $rootScope.$apply(function(){
                                    that.onCancelarGravar();
                                });
                            }}]     
                        );
                    }else{
                        that.confirmarGravar();
                    }
                }
                $timeout.cancel(that.TimeGravar);
            });
        }           

        function getNew(){
            var that         = this;
            var table        = angular.copy(that.default_item);
            table.factory_id = 'Factory_'+Math.floor((Math.random() * 999999) + 1);
            table.init(table);
            return table;
        }
            
        /**
         * Return the constructor function
         */
        return FactoryDefault;
    };

})(window, window.angular);
