(function(window, angular) {
    'use strict';

	AngularFindModule.factory('Historico' , Historico );
	
	Historico.$inject = [
        '$ajax',
		'$q',
		'$parse',
		'$rootScope',		
        '$compile',
		'$timeout',
		'TabelaJS',
		'gScope'
		
    ];

	function Historico($ajax, $q, $parse, $rootScope, $compile, $timeout, TabelaJS, gScope) {

		var lista = [];
	    /**
	     * Constructor, with class name
	     */
	    function Historico(object,arg_scope) {
			
			if ( object != undefined ) {
                this._object = object;
            } else {
                this._object = 'vm.Historico';
			}

			var that = this;
			this.consultar    					= consultar;
			this.getHistorico 					= consultar;
			this.FILTRO_DADOS 					= '';
			this.Tabela 						= new TabelaJS();
			this.tabela_id 						= 'tabela_historico_'+(Math.floor(Math.random() * 99999))
			this.TabelaHistorico 				= this.Tabela.getNew();
			this.TabelaHistorico.componente     = ('#'+this.tabela_id);
			this.TabelaHistorico.ID             = (Math.floor(Math.random() * 99999))+'_TBHISTORICO';
			this.TabelaHistorico.HEIGHT         = 'calc(100vh - 260px)';
			this.TabelaHistorico.WIDTH          = 'calc(100%)';
			this.TabelaHistorico.ORDER_BY       = 'DESCRICAO';
			this.TabelaHistorico.filtro       	= this.FILTRO_DADOS;
			this.TabelaHistorico.zoom           = 90;
			this.TabelaHistorico.model_selected = this._object;
			this.TabelaHistorico.model_tabela 	= that;
			this.TabelaHistorico.model 			= this._object+'.TabelaHistorico';	
			this.TabelaHistorico.tipo_tabela 	= 'normal';	
			this.TabelaHistorico.total_dados	= 0;
			this.TabelaHistorico.vs_scroll      = false;
			this.TabelaHistorico.filtro_visible = false;
			this.TabelaHistorico.filtro_change  = true;
			this.TabelaHistorico.status_visible = true;
			this.TabelaHistorico.infinite_scroll= true;
			this.TabelaHistorico.total_registros= true;
			this.TabelaHistorico.COLUNAS = [
				{CAMPO: "DATAHORA_TEXT"	, SIZE_CELL : '90px' , ATTR: 'auto-title', PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "DATAHORA"	, VISIBLE: true , SIZE: 0, STYLE: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', DECIMAL: 0, ORDEM:"01", DESCRICAO:"Data/Hora"},
				{CAMPO: "USUARIO"		, SIZE_CELL : '100px', ATTR: 'auto-title', PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "USUARIO"	, VISIBLE: true , SIZE: 0, STYLE: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', DECIMAL: 0, ORDEM:"02", DESCRICAO:"Usuário"  },
				{CAMPO: "HISTORICO"		, SIZE_CELL : '300px', ATTR: 'auto-title', PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "HISTORICO"	, VISIBLE: true , SIZE: 0, STYLE: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', DECIMAL: 0, ORDEM:"03", DESCRICAO:"Histórico"},
				{CAMPO: "IP"			, SIZE_CELL : '110px', ATTR: 'auto-title', PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "IP"			, VISIBLE: true , SIZE: 0, STYLE: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', DECIMAL: 0, ORDEM:"04", DESCRICAO:"End. IP"  },
				{CAMPO: "VERSAO"		, SIZE_CELL : '80px' , ATTR: 'auto-title', PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "VERSAO"		, VISIBLE: true , SIZE: 0, STYLE: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', DECIMAL: 0, ORDEM:"05", DESCRICAO:"Vs. Sist."}
			];
            this.DADOS = [];
            this.ARGS  = {};
			this.FILTRO = '';
			this.key_object_scop = -1;
            
            this._button_attr  = '[data-consulta-historico]';
            this._button       = null;
            this._modal        = function(){return $('#modal-historico')};
            this._controller   = function(){
            	var scope = $('#main').find('[ng-controller]').first();
            	if(scope.length == 0){
            		scope = $('#main').find('.ng-isolate-scope').first();
            	}
            	return scope; 
            };

            var scope = null;

        	if ( arg_scope != undefined ) {
        		scope = arg_scope;
        	} else {
            	scope = that._controller().scope();
			}

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

			childScope = scope.$new();
			gScope.childScopes[that.key_object_scop] = childScope;

			that.compiledElement = $compile(that.html())(childScope);
			childScope.$on("$destroy", function() {
				that.compiledElement.remove();
			});

			that._controller().append(that.compiledElement);

			//that._controller().append($compile(that.html())(scope));

			that.TabelaHistorico.compile();
            
            $(document).on('click',that._button_attr,function(){
                var button = $(this);
                $rootScope.$apply(function(){
                    
                    that._button = button;
		
					that.FILTRO = '';
					that.FILTRO_DADOS = '';
                    that.ARGS = {
                        TABELA    		: button.attr('data-tabela'),
                        TABELA_ID 		: button.attr('data-tabela-id'),
                        TIPO_TABELA 	: button.attr('data-tipo-tabela'),
					};     
					
					that.FILTRO_TABELA_ID = that.ARGS.TABELA_ID;
                    
                    that.getHistorico(1).then(function(){
                        that._modal().modal('show');
                    });

                });
            });  
	    }
        
        Historico.prototype.getArgs = function(){        
            var that = this;
        }
        
		// Historico.prototype.getHistorico = consultar;
// 		= function(e){
            
//             var that = this;
            
// 			if(typeof e != undefined){
// 				that.TabelaHistorico.consulta_pagina = 0;
// 			}
            
// 			that.ARGS.FILTRO = that.FILTRO_DADOS;
// 			that.ARGS.QTD 	 = that.TabelaHistorico.consulta_qtd;
// 			that.ARGS.PAGINA = that.TabelaHistorico.consulta_pagina * that.TabelaHistorico.consulta_qtd;
			
// //          that.getArgs();
            
//             return $q(function(resolve,reject){
//                 $ajax.post('/api/historico', that.ARGS)
//                     .then(function(response) {
// 						that.DADOS = response;
// 						that.TabelaHistorico.merge(that.DADOS);
// 						var titulo = ($('#_div_titulo_tela').val()).trim();
// 						var datahora = moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
// 						that.TabelaHistorico.titulo = titulo+' - Histórico';
// 						that.TabelaHistorico.filtro = that.TabelaHistorico.FILTRO; 
// 						$timeout(function(){
// 							if(that.TabelaHistorico.DADOS.length > 0){
// 								that.SELECTED = that.TabelaHistorico.DADOS[0];
// 							}
// 						});
//                         resolve(response);
//                     },
//                     function(e){
//                         reject(e);
//                     }
//                 );
//             });
// 		}

        var consultar = function(e){
            
            var that = this;
            console.log(e);
			if(typeof e != 'undefined'){
				that.TabelaHistorico.consulta_pagina = 0;
			}
            
			that.ARGS.FILTRO 		   = that.FILTRO_DADOS;
			that.ARGS.FILTRO_TABELA_ID = that.FILTRO_TABELA_ID;
			that.ARGS.QTD 	 		   = that.TabelaHistorico.consulta_qtd;
			that.ARGS.PAGINA 		   = that.TabelaHistorico.consulta_pagina * that.TabelaHistorico.consulta_qtd;			
//          that.getArgs();
            
            return $q(function(resolve,reject){
                $ajax.post('/api/historico', that.ARGS)
                    .then(function(response) {
						that.DADOS = response;
						that.TabelaHistorico.merge(response);
						var titulo = ($('#_div_titulo_tela').val()).trim();
						var datahora = moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
						that.TabelaHistorico.titulo = titulo+' - Histórico';
						that.TabelaHistorico.filtro = that.FILTRO_DADOS; 
						that.Time1 = $timeout(function(){
							if(that.TabelaHistorico.DADOS.length > 0){
								that.SELECTED = that.TabelaHistorico.DADOS[0];
							}
							$timeout.cancel(that.Time1);
						});
                        resolve(response);
                    },
                    function(e){
                        reject(e);
                    }
                );
            });
		}

	    /**
	     * Public method, assigned to prototype
	     */
	    Historico.prototype.html = function(){

            var that = this;
            
            var html = '';
            
            html += '<div class="modal fade" id="modal-historico" role="dialog" data-keyboard="false" data-backdrop="static">                         ';
            html += '	<div class="modal-dialog modal-lg" role="document" style="height: calc(100% - 70px);">                                        ';
            html += '		<div class="modal-content" style="height: 100%;">                                                                         ';
            html += '			<div class="modal-header">                                                                                            ';
            html += '				<div class="modal-header-left">                                                                                   ';
            html += '					<h4 class="modal-title" id="myModalLabel">Histórico</h4>                                                      ';
            html += '				</div>                                                                                                            ';
            html += '				<div class="modal-header-center">                                                                                 ';
            html += '				</div>                                                                                                            ';
            html += '				<div class="modal-header-right">                                                                                  ';
            html += '					<button type="button" class="btn btn-default btn-voltar" data-hotkey="esc" data-dismiss="modal">              ';
            html += '						<span class="glyphicon glyphicon-chevron-left"></span>                                                    ';
            html += '						Voltar                                                                                                    ';
            html += '					</button>                                                                                                     ';
            html += '				</div>                                                                                                            ';
            html += '			</div>                                                                                                                ';
			html += '			<div class="modal-body" style="height: 100%;">                                                                        ';
			html += '  <form ng-submit="'+that._object+'.consultar(10)" class="form-inline">	                      							  	  ';	
			html += '    <div class="table-filter collapse in" aria-expanded="true"                      											  ';
			html += '		 style="margin-bottom: 4px; background: rgba(221,221,221,.33);                              							  ';
			html += '				padding: 2px 10px 7px; border-radius: 5px;">                                        							  ';
			html += '		<div class="form-group" style="width: calc(65%); padding-top: 15px; min-width: 200px;">     							  ';
			html += '			<input type="text" style="width: 100% !important; min-width: 170px; height: 26px !important;"						  ';
			html += '				placeholder="Filtragem por Usuário e Histórico"                                      							  ';
			html += '				ng-keydown="$event.keyCode === 13 && '+that._object+'.consultar(10)" 											  ';
			html += '				class="form-control input-maior"                                        							  			  ';
			html += '				ng-model="'+that._object+'.FILTRO_DADOS">                                   							  		  ';
			html += '		</div>                                                                                      							  ';
			html += '		<div class="form-group" style="width: calc(15%); padding-top: 15px; min-width: 75px;">     							 	  ';
			html += '			<input type="text" style="width: 100% !important; min-width: 70px; height: 26px !important;"						  ';
			html += '				placeholder="Registro ID" only-digits2											                   							  ';
			html += '				ng-keydown="$event.keyCode === 13 && '+that._object+'.consultar(10)" 											  ';
			html += '				class="form-control input-maior"                                        							  			  ';
			html += '				ng-model="'+that._object+'.FILTRO_TABELA_ID">                                   							  	  ';
			html += '		</div>   																												  ';
			html += '		                                                                                            							  ';
			html += '		<div class="form-group" style="padding-top: 11px; width: fit-content; padding-right: 10px;">							  ';
			html += '			<button type="submit" class="btn btn-xs btn-primary btn-filtrar"                        							  ';
			html += '					data-hotkey="alt+f" id="btn-table-filter-h">                                      							  ';
			html += '				<span class="glyphicon glyphicon-filter"></span> Filtrar                            							  ';
			html += '			</button>                                                                               							  ';
			html += '		</div>	                                                                                    							  ';
			html += '	</div>																														  ';
			html += ' </form>	 																													  ';
			html += '			<div class="'+that.tabela_id+'" id="'+that.tabela_id+'">   	</div>													  ';
            html += '			</div>                                                                                                                ';
            html += '			                                                                                                                      ';
            html += '		</div>                                                                                                                    ';
            html += '	</div>                                                                                                                        ';
            html += '</div>                                                                                                                 	      ';

            return html;	

        };    

	    /**
	     * Return the constructor function
	     */
	    return Historico;
	};

})(window, window.angular);