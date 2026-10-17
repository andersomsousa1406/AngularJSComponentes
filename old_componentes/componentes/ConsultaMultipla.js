(function(window, angular) {
    'use strict';

	AngularFindModule.factory('ConsultaMultipla' , ConsultaMultipla );
	
	ConsultaMultipla.$inject = [
        '$ajax',
        '$q',
        '$rootScope',
        'gScope',
        '$compile',
		'$timeout',
		'$sce',
        'TabelaJS'
    ];

	function ConsultaMultipla($ajax, $q, $rootScope, gScope, $compile,$timeout, $sce, TabelaJS) {

		var lista = [];

	    /**
	     * Constructor, with class name
	     */
	    function ConsultaMultipla(data) {
	        if (data) {
	            this.setData(data);
	        }
	    }

	    /**
	     * Public method, assigned to prototype
	     */
	    var obj_ConsultaMultipla = {
            model:'',
            componente:'',
            consulta_qtd: 0,
            FILTRO_DADOS: '',
            PARAM_RELATORIO:{},
            NUM_LISTA_MULTIPLA : 0,
            DADOS_SELECAO_MULTIPLA: {
                SELECTED : {},
                visualizar: function(){}
            },
            CONSULTAS : [],
            limpar: function(){
                var that = this;
                var obgRet = {};

                angular.forEach(that.CONSULTAS,function(item, key1){
                    item.ITENS = [];
                });

                return obgRet;
            },
            getItensSelecionado: function(){
                var that = this;
                var obgRet = {};

                angular.forEach(that.CONSULTAS,function(item, key1){
                    obgRet[item.NOME] = {
                        LISTA_RR : [],
                        LISTA_SI : ',,',
                        LISTA_SS : ',,',
                        ITENS    : item.ITENS
                    };

                    angular.forEach(item.ITENS,function(reg, key2){
                        obgRet[item.NOME].LISTA_RR.push(reg[item.campo_index]);
                        obgRet[item.NOME].LISTA_SI += ','+reg[item.campo_index];
                        obgRet[item.NOME].LISTA_SS += ",'"+reg[item.campo_index]+"'";
                    });

                    obgRet[item.NOME].LISTA_SI = obgRet[item.NOME].LISTA_SI.replace(',,,','').replace(',,','');
                    obgRet[item.NOME].LISTA_SS = obgRet[item.NOME].LISTA_SS.replace(',,,','').replace(',,','');
                });

                return obgRet;
            },
            add: function(consulta, nome, titulo, ttitulo, ordem, consulta_qtd, campo_index){
                var that = this;
                consulta.option.label_descricao = '';

                that.CONSULTAS.push({
                    NOME        : nome,
                    PARAMETRO 	: titulo,
                    ORDEM 		: ordem,
                    DESCRICAO 	: titulo,
                    TTITLE 		: ttitulo,
                    TAG 		: consulta.componente.replace('.',''),
                    ITENS 		: [],
                    SELECTED 	: {},
                    Consulta 	: consulta,
                    VISIVEL     : true,
                    consulta_qtd: consulta_qtd,
                    campo_index : campo_index
                });

                consulta.NUM_LISTA_MULTIPLA = that.NUM_LISTA_MULTIPLA;
                consulta.LISTA_MULTIPLA     = that.CONSULTAS[consulta.NUM_LISTA_MULTIPLA];
                that.NUM_LISTA_MULTIPLA     = that.NUM_LISTA_MULTIPLA + 1;

                consulta.onSelectMultipla = function(item){
                    var that = this;

                    var ja_na_lista = false;
        
                    angular.forEach(that.LISTA_MULTIPLA.ITENS, function(ls, key){
                        if(trim_null(ls[that.LISTA_MULTIPLA.campo_index]) == trim_null(item[that.LISTA_MULTIPLA.campo_index])){
                            ja_na_lista = true;
                        }
                    });
        
                    if(ja_na_lista == false){
                        that.LISTA_MULTIPLA.ITENS.push(item);
                    }
        
                    $timeout(function(){
                        that.clear();
                    });
                }
            },
            fimCompile: function(){

            },
            fimTabela: function(){

            },
            compile: function(){
                var that = this;
                that.Tabela = new TabelaJS();

                that.TabelaMultiplos                 = that.Tabela.getNew();
                that.TabelaMultiplos.componente      = '#tabela_consulta_incluir_multiplos_';
                that.TabelaMultiplos.model           = that.model+'.TabelaMultiplos';
                that.TabelaMultiplos.titulo          = 'TabelaMultiplos';
                that.TabelaMultiplos.filtro          = '';
                that.TabelaMultiplos.ID              = 'TabelaMultiplos';
                that.TabelaMultiplos.HEIGHT          = 'calc(100vh - 435px)';
                that.TabelaMultiplos.ORDER_BY        = 'ID';
                that.TabelaMultiplos.model_selected  = that.model+'.DADOS_SELECAO_MULTIPLA';
                that.TabelaMultiplos.model_tabela    = that.DADOS_SELECAO_MULTIPLA;
                that.TabelaMultiplos.tipo_tabela	 = 'normal';
                that.TabelaMultiplos.campo_model	 = 'item.CHECKED';
                that.TabelaMultiplos.zoom            = 90;        
                that.TabelaMultiplos.filtro_visible  = false;
                that.TabelaMultiplos.status_visible  = false;
                that.TabelaMultiplos.input_visible   = true;
                that.TabelaMultiplos.linhas_marcadas = false;
                that.TabelaMultiplos.marcar_linhas   = true;
                that.TabelaMultiplos.total_visible   = false;
                that.TabelaMultiplos.filtro_status_v = false;
                that.TabelaMultiplos.total_registros = true;
                that.TabelaMultiplos.total_dados	 = 0;
                that.TabelaMultiplos.infinite_scroll = false;
                that.TabelaMultiplos.vs_scroll       = true;
                that.TabelaMultiplos.COLUNAS         = [];
                
                that.fimTabela();
                that.MontarHtml(that);
                that.fimCompile();

                $timeout(function(){
                    angular.forEach(that.CONSULTAS, function(item, key){
                        item.Consulta.compile();
                    });
                });
            },
            tratarTabela:function(){
                var that = this;
            },
	        setData: function(data) {
	            angular.extend(this, data);
	        },
            removerItemTabelaParan: function(item, lista){
                var index = -1;
    
                angular.forEach(lista, function(iten , key){
                    if(item == iten){
                        index = key;
                    }
                });
    
                if(index >= 0){
                    lista.splice(index, 1);
                }
            },
            atalhoTabelaItenParan: function(item, classe, event){
                var that = this;
    
                if(event.keyCode == 46){
    
                    var btn_excluir = $(event.target).find('button:enabled').has('span.glyphicon-trash');
                    var btn_excluir_in_list = $(event.target).find('button:enabled').has('span.glyphicon-th-list');
    
                    function forcarTabela(trA, trP){
                        if(trA.length > 0){
                            $(trA).focus();
                        }else{
                            if(trP.length > 0){
                                $(trP).focus();
                            }else{
                                $(classe).find('input').focus();
                            }
                        }
                    }
    
                    if(btn_excluir.length){
                        $timeout(function(){
                            var trA = $(btn_excluir.first()).parent().parent().prev();
                            var trP = $(btn_excluir.first()).parent().parent().next();
                            btn_excluir.first().click();
                            forcarTabela(trA, trP);
                        });
                    }else if (btn_excluir_in_list.length){
                        var link_excluir = $(event.target).find('a').has('span.glyphicon-trash');
                        if(link_excluir.length){
                            $timeout(function(){
                                var trA = $(btn_excluir.first()).parent().parent().prev();
                                var trP = $(btn_excluir.first()).parent().parent().next();
                                link_excluir.first().click();
                                forcarTabela(trA, trP);
                            });
                        }
                    }

                }
            },
            tabParanClick: function(paran, classe){
                $timeout(function(){
                    var con = $(classe);
                    var imp = $(con).find('input');
                    imp.focus();
                },150);
            },
            incluirVarios: function(param, index){
                var that = this;
                
                angular.forEach(param.Consulta.option.campos_tabela, function(item, key) {
                    that.TabelaMultiplos.COLUNAS.push({
                        CAMPO: `${item[0]}`,
                        PREFIXO: '',
                        SUFIXO: '',
                        TIPO: 'string',
                        TTITLE: '',
                        FIXO: true,
                        TOTAL: false,
                        ALIGN: 'left',
                        CAMPO_FILTRO: `${item[0]}`,
                        VISIBLE: true,
                        SIZE: 0,
                        STYLE: '',
                        DECIMAL: 0,
                        ORDEM: key,
                        DESCRICAO:`${item[1]}`
                    })
    
                    that.TabelaMultiplos.consulta_pagina = 0;
                })
    
                that.PARAM_RELATORIO = angular.copy(param);
    
                var a = gScope.Confirme.add(1,'<h4>Incluir Múltiplos</h4>',
                    '<div class="form-group">'+
                    '    <div class="row" style="margin-left: 15px; margin-right: 15px;">'+
                    '       <div class="form-inline"> '+
                    '           <div id="filtro_main" class="table-filter collapse in" aria-expanded="true" '+
                    '                       style="margin-bottom: 4px; '+
                    '                       background: rgba(221,221,221,.33); '+
                    '                       padding: 10px 10px 7px; '+
                    '                       border-radius: 5px;"> '+                       
                    '               <div class="form-group" style="width: calc(100% - 225px); min-width: 200px;"> '+
                    '                   <input style="width: 100% !important; min-width: 170px;" '+
                    '                        placeholder="FILTRAGEM RÁPIDA..." '+
                    '                        ng-keypress="$event.which == 13 ? '+that.model+'.execFiltrarConsultaSelecaoMultipla('+that.model+'.PARAM_RELATORIO) : false" '+    
                    '                        class="form-control input-maior filter_main_html" '+
                    '                        ng-model="'+that.model+'.FILTRO_DADOS"> '+
                    '               </div> '+
                    '               <div class="form-group" style="width: fit-content; margin-left: 15px; padding-right: 10px;">'+
                    '                   <button type="button" ng-click="'+that.model+'.execFiltrarConsultaSelecaoMultipla('+that.model+'.PARAM_RELATORIO)" '+
                    '                       class="btn btn-xs btn-primary btn-filtrar-html" data-hotkey="alt+f" id="btn-table-filter-html"> '+
                    '                       <span class="glyphicon glyphicon-filter"></span> Filtrar'+
                    '                   </button>'+
                    '               </div> '+
                    '           </div>'+
                    '       </div>'+               
                    '       <fieldset>'+                
                    '            <div class="tabela_consulta_incluir_multiplos_" id="tabela_consulta_incluir_multiplos_"></div> '+
                    '       </fieldset> '+
                    '    </div> '+
                    '</div>'
                , [
                    {desc:'Confirmar',class:'btn-success' ,ret:'1' ,hotkey:'f1' ,glyphicon:'glyphicon glyphicon-ok' 	},
                    {desc:'Cancelar' ,class:'btn-danger'  ,ret:'2' ,hotkey:'esc',glyphicon:'glyphicon glyphicon-remove' }
                    ],[
                    function (e, btn){
                        $rootScope.$apply(function(){
                            that.gravarItensConsultaSelecaoMultipla(param, index);
                        });
                    },
                    function (e, btn){
                        that.limparColunasConsultaSelecaoMultipla();
                    },
                ]);
                
                console.log(a.id);
                if(typeof a.id != 'undefined'){
                    var b  = angular.element('#'+a.id).find('div.modal-dialog');
                    if(b.length > 0){
                        angular.element(b).addClass('modal-lg');
                    }
                }
    
                $timeout(function(){
                    that.tratarTabela(param);

                    that.TabelaMultiplos.apagar();
                    that.TabelaMultiplos.compile();
                    that.filtrarConsultaSelecaoMultipla(param);
                },100)
            },
            gravarItensConsultaSelecaoMultipla: function(param, posicao) {
                var that = this;
                var eleConsulta = param.Consulta.LISTA_MULTIPLA;

                for(var index = 0; index < that.TabelaMultiplos.DADOS.length; index++) {
                    var element = that.TabelaMultiplos.DADOS[index];	
                    var ja_na_lista = false;
    
                    if(element.CHECKED){
    
                        angular.forEach(eleConsulta.ITENS, function(ls, key){ 
                            if(element[param.campo_index] == ls[param.campo_index]) {
                                ja_na_lista = true;
                            }
                        });
            
                        if(ja_na_lista == false){
                            eleConsulta.ITENS.push(element);
                        }
                    }
                }
    
                that.limparColunasConsultaSelecaoMultipla();
            },
            execFiltrarConsultaSelecaoMultipla: function(param){
                var that = this;
                    that.TabelaMultiplos.consulta_pagina = 0;
    
                var BACKUP_MARCADOS = [];
                angular.forEach(that.TabelaMultiplos.DADOS, function(item, key) {
                    if(item.CHECKED == true) {
                        BACKUP_MARCADOS.push(item);
                    }
                });
    
                that.TabelaMultiplos.merge(BACKUP_MARCADOS);
                that.filtrarConsultaSelecaoMultipla(param);
            },
            filtrarConsultaSelecaoMultipla: function(param){
                var that = this;
    
                return $q(function(resolve, reject){
    
                    if(trim_null(that.FILTRO_DADOS).length > 0){
                        that.TabelaMultiplos.consulta_pagina = 0;
                    }
                    
                    var dados = {
                        CONSULTA : {
                            QTD	  			: param.consulta_qtd,
                            PAGINA			: that.TabelaMultiplos.consulta_pagina * param.consulta_qtd,
                            TIPO			: param.Consulta.option.consulta_tipo,
                            INFINITE_SCROLL	: 1
                        },
                        OPTIONS : param.Consulta.option.filtro_sql,
                        FILTRO  : that.FILTRO_DADOS,
                        PARAN   : Object.assign({}, param.Consulta.option.paran)
                    };
    
                    $ajax.post(param.Consulta.option.obj_consulta, dados).then(function(response) {
                        
                        var BACKUP_MARCADOS = [];
                        angular.forEach(that.TabelaMultiplos.DADOS, function(item, key) {
                            if(item.CHECKED == true) {
                                BACKUP_MARCADOS.push(item);
                            }
                        });
    
                        if(BACKUP_MARCADOS.length > 0) {
                            var campo_index = param.campo_index;
    
                            angular.forEach(response, function(item, valor){
                                item.CHECKED = false;
                            });
    
                            angular.forEach(BACKUP_MARCADOS, function(dados, key){
                                var encontrado = false;
    
                                angular.forEach(response, function(item, valor){
                                    if(item[campo_index] == dados[campo_index]){
                                        encontrado = true;
                                        item.CHECKED = true;
                                    }
                                });
    
                                if(!encontrado){
                                    response.push(dados);
                                }
                            });
                        }
    
                        that.TabelaMultiplos.merge(response);
                        that.TabelaMultiplos.count_marcados();
                        that.TabelaMultiplos.counter_selected = BACKUP_MARCADOS.length;
    
                        if(that.TabelaMultiplos.counter_selected == that.TabelaMultiplos.DADOS.length){
                            that.TabelaMultiplos.linhas_marcadas = true;
                        }else{
                            that.TabelaMultiplos.linhas_marcadas = false;
                        }
    
                        resolve(response);
    
                    });
                });
    
            },
            limparColunasConsultaSelecaoMultipla: function() {
                var that = this;

                that.TabelaMultiplos.COLUNAS = [];
                that.FILTRO_DADOS = '';
            },
            width: 600,
            height: 262,
            MontarHtml: function(obj){
				var that = this;

	            var html = `<div style="width: `+that.width+`px;">

                                <div  style="width: 115px; float: left;">
                                    <ul id="tab" class="nav nav-tabs" role="tablist"> 
                                        <li  style="text-align: end;
                                                border: 1px solid #7e7979;
                                                border-radius: 5px 0px 0px 5px;
                                                border-right: 0px;
                                                background-color: #f1efef;
                                                margin-bottom: 3px;
                                                width: 100%;" 

                                            ng-if="param.VISIVEL == true"
                                            ng-click="`+that.model+`.tabParanClick(param, '.consulta-g-' + param.TAG);"
                                            role="presentation"
                                            class="{{$index == 0 ? 'active' : ''}} tab-detalhamento"
                                            ng-repeat="param in `+that.model+`.CONSULTAS  | orderBy:'ORDEM' track by $index">
                        
                                            <a style=" padding: 8px 15px 9px 0px;
                                                        float: right;
                                                        border-radius: 5px 1px 1px 4px;
                                                        width: calc(100% - 2px);
                                                        border: 0px;
                                                        font-weight: bold;
                                                        height: 35px;
                                                        margin-right: -2px;"
                                                href="#{{param.TAG}}-container" id="{{param.TAG}}-tab" data-hotkey="alt+{{$index+1}}" role="tab" data-toggle="tab" aria-controls="{{param.TAG}}-container" aria-expanded="true">
                                            
                                                <label ng-if="(param.TTITLE+'').length == 0">{{param.DESCRICAO}}</label>
                                                <label ttitle="{{param.TTITLE}}" ng-if="(param.TTITLE+'').length > 0">{{param.DESCRICAO}}</label>
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                <div  style="width: calc(100% - 115px);
                                        float: right;
                                        padding: 5px;
                                        border: 1px solid #7e7979;
                                        border-radius: 0px 4px 5px 5px;
                                        background-color: #ffffff;">

                                <div id="tab-content" class="tab-content"  style="height: calc(100% - 45px); padding: 3px; border: 0px;">
                                    <div
                                        ng-repeat="param in `+that.model+`.CONSULTAS | orderBy:'ORDEM' track by $index"
                                        role="tabpanel" class="tab-item-aconsulta tab-pane {{$index == 0 ? 'active' : ''}}"
                                        id="{{param.TAG}}-container" 
                                        aria-labelledby="{{param.TAG}}-tab">
                                        
                                        <div style="width: 100% !important; display: inline-flex;">
                                            <div class="{{param.TAG}} consulta-multipla-lista" id="{{param.TAG}}"></div>

                                            <button type="button" style="height: 36px; margin-top: 5px;" class="btn btn-primary" ng-click="`+that.model+`.incluirVarios(param, $index);">
                                                <span class="glyphicon glyphicon glyphicon-plus" style="margin-top: -4px !important; margin-left: 1px !important;"></span>
                                            </button>
                                        </div>

                                        <div class="table-ec table-scroll" style="height: `+that.height+`px;" >
                                            <table class="table table-striped tab-enter table-bordered table-condensed table-no-break table-middle table-low tabelaJS">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" ng-repeat="campo in param.Consulta.option.campos_tabela">{{campo[1]}}</th>
                                                        <th style="width: 50px;"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr ng-repeat="item in param.ITENS"
                                                        ng-keydown="`+that.model+`.atalhoTabelaItenParan(item, '.consulta-g-' + param.TAG, $event)"
                                                        ng-focus="param.SELECTED = item;"
                                                        ng-class="{ 'selected' : param.SELECTED == item }"
                                                        tabindex="0">
                                                        <th ng-repeat="campo in param.Consulta.option.campos_tabela">{{item[campo[0]]}}</th>
                                                        <th  style="width: 50px; padding: 3px;">
                                                            <button
                                                                type="button"
                                                                class="btn btn-sm btn-danger "
                                                                style="margin-left: 6px;"
                                                                data-toggle="dropdown"
                                                                aria-expanded="false"
                                                                ng-disabled="param.Consulta.usuario_vinculado == true"
                                                                ng-click="`+that.model+`.removerItemTabelaParan(item, param.ITENS);">
                                                                <span class="glyphicon glyphicon-trash"></span>
                                                            </button>
                                                        </th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                `;

                var obj = $(obj.componente);

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

			},
			key_object_scop: -1
	    }

        ConsultaMultipla.prototype = {
	        Consulta: function(data) {
	            if (data) {
	                this.setData(data);
	            }
	        },
	        getNew: function(set_this) {
                
	        	var item = angular.copy(obj_ConsultaMultipla);
				lista.push(item);
				
				item.consulta_id = 'consultaMultipla_'+Math.floor((Math.random() * 9999999) + 1);
	        	item.pageScroll = $(document).scrollTop();
                
                if ( set_this != undefined ) {
                    item.set_this = true;
				}

	        	return item;
			}
	    }

	    /**
	     * Return the constructor function
	     */
	    return ConsultaMultipla;
	};

})(window, window.angular);
