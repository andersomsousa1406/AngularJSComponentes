(function(window, angular) {
    'use strict';

	AngularFindModule.factory('Confirmacao' , Confirmacao );
	
	Confirmacao.$inject = [
		'$rootScope',
		'$parse',
		'$q',
        '$compile',
		'gcCollection',
		'$ajax',		
		'$timeout',
        '$sce',
        'gScope'
    ];

	function Confirmacao($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce, gScope) {

        // Private variables.
        var obj      = null;
        
	    /**
	     * Constructor, with class name
	     */
		
		 function Confirmacao() {
            
            obj = this; 

            /**
			* Um input disfarçado de select - Souza, Anderson
			*/
            
            obj.getNew = getNew;
            obj.default = {
                ID               : '',
                confirmacao_id   : '',
                componente       : '',
                model            : '',
                titulo           : '',
                lista            : [],
                agendada_Confirmacao: function(){},
                alto_fechar      : false,
                obtn_sim         : {desc:'Sim'       ,class:'btn-primary' ,ret:'1' ,hotkey:'enter' ,glyphicon:'class-btn1 glyphicon-ok'           },
                obtn_ok          : {desc:'Confirmar' ,class:'btn-primary' ,ret:'1' ,hotkey:'enter' ,glyphicon:'class-btn2 glyphicon-ok'           },
                obtn_gravar      : {desc:'Gravar'    ,class:'btn-success' ,ret:'1' ,hotkey:'f1'    ,glyphicon:'class-btn2 glyphicon-ok'           },
                obtn_nao         : {desc:'Não'       ,class:'btn-danger ' ,ret:'2' ,hotkey:'esc'   ,glyphicon:'class-btn3 glyphicon-ban-circle'   },
                obtn_cancelar    : {desc:'Cancelar'  ,class:'btn-danger ' ,ret:'2' ,hotkey:'esc'   ,glyphicon:'class-btn4 glyphicon-ban-circle'   },
                obtn_voltar      : {desc:'Voltar'    ,class:'btn-default' ,ret:'2' ,hotkey:'esc'   ,glyphicon:'class-btn5 glyphicon-chevron-left' },
                Confirmacao : function(dados, elem, classe, classe_size){
                    
                    classe = typeof classe == 'undefined' ? '' : classe;
                    classe_size = typeof classe_size == 'undefined' ? '' : classe_size;
                    var layoutEspecial = classe.indexOf('epc-confirmacao-voturfid') >= 0;
                    var styleDialog = layoutEspecial ? ' style="width: calc(100% - 40px); max-width: 1400px; margin-top: 25px; margin-bottom: 20px;"' : '';
                    var styleContent = layoutEspecial ? ' style="display: flex; flex-direction: column; height: calc(100vh - 95px); min-height: 640px;"' : '';
                    var styleBody = layoutEspecial ? ' style="flex: 1 1 auto; max-height: none; overflow: auto; padding-bottom: 10px;"' : '';
                    var styleFooter = layoutEspecial ? ' style="flex-shrink: 0; position: relative; z-index: 2; background: #fff;"' : '';
                    var styleHeader = layoutEspecial ? ' style="display: flex; align-items: center; justify-content: space-between; gap: 15px;"' : '';
                    var styleTitulo = layoutEspecial ? ' style="display: inline-block; font-size: 15px; font-weight: bold; {{'+elem.model+'.CSS_TITULO }}; flex: 1 1 auto; text-align: left;"' : ' style="display: inline-block; font-size: 15px; font-weight: bold; {{'+elem.model+'.CSS_TITULO }}"';
                    var botoesHeader = layoutEspecial ? '<div class="confirme-header-actions" style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: wrap;">'+dados.botao+'</div>' : '';

                    var popup = '';
                    
                    popup += '<div class="'+classe+'-backdrop modal-backdrop confirm fade in" style="z-index: 99999;"></div>';
                    popup += '<div class="'+classe+' modal fade in confirm" tabindex="-1" role="dialog" style="display: block;z-index: 99999;">';
                    popup += '<div class="modal-dialog '+classe_size+'" role="document"'+styleDialog+'>';
                    popup += '<div class="modal-content"'+styleContent+'>';
                    popup += '<div class="modal-header"'+styleHeader+'>';
                    popup += '<span'+styleTitulo+'>'+dados.titulo+'</span>';
                    popup += '<button style="float: right;" ng-if="'+elem.model+'.tipo == 2" ng-click="'+elem.model+'.cancelar($event)" type="button" class="btn btn-danger btn-cancelar" data-hotkey="esc"><span class="glyphicon glyphicon-ban-circle"></span> Cancelar</button>'
                    popup += botoesHeader;
                    popup += '</div>';
                    popup += '<div class="modal-body confirme-body"'+styleBody+'>';
                    popup += dados.inter;
                    popup += '</div>';
                    if(!layoutEspecial){
                        popup += '<div class="modal-footer confirme-footer"'+styleFooter+'>';
                        popup += dados.botao;
                        popup += '</div>';
                    }
                    popup += '</div>';
                    popup += '</div>';
                    popup += '</div>';
                    popup += '</div>';                    var appMain = $('#main-app').find('.ng-scope');

                    if(appMain.length > 0){
                        $(appMain).first().append('<div id="'+dados.id+'"></div>');
                    }else{
                        var appMain = $('#main').find('.ng-scope');

                        if(appMain.length > 0){
                            $(appMain).first().append('<div id="'+dados.id+'"></div>');
                        }
                    }
                    
                    setTimeout(function(){
                        
                        if($(".modal.fade.in.confirm input").length == 0 && $(".modal.fade.in.confirm select").length == 0){
                            $('.modal.fade.in.confirm').focus();
                        }

                        $('.modal.fade.in.confirm').addClass('carregado');
                    },500);

                    return popup;
                },
                getbutom : function(btn, key, model){
                    var ret = '';

                    if(btn.aguardar2 == true){
                        ret = ret + '<button ng-disabled="'+model+'.botao['+key+'].TEMPO_AGUARDAR > 0" type="button" class="btn '+btn.class+'"';
                        ret = ret + ' ng-click="'+model+'.botao['+key+'].executar($event, '+model+'.botao['+key+']);" data-hotkey="'+btn.hotkey+'"';
                        ret = ret + '><span class="glyphicon '+btn.glyphicon+'"></span> '+btn.desc;
                        ret = ret + '<span ng-if="'+model+'.botao['+key+'].TEMPO_AGUARDAR > 0"> ({{'+model+'.botao['+key+'].TEMPO_AGUARDAR}})</span>';
                        ret = ret + '</button>';
                    }else{
                        ret = ret + '<button type="button" class="btn '+btn.class+'" ng-click="'+model+'.botao['+key+'].executar($event, '+model+'.botao['+key+']);"';
                        ret = ret + 'data-hotkey="'+btn.hotkey+'"><span class="glyphicon '+btn.glyphicon+'"></span> '+btn.desc;
                        ret = ret + '</button>';
                    }

                    return ret;
                },
                closeAll : function(){
                    var that = this;

                    angular.forEach(that.lista,function(item , key){
                        $('#'+item.id).remove();
                    });

                },
                add : function(tipo, titulo,pergunta,botao,func,fechar, classe, classe_size){
                    var that = this;

                    classe   = typeof classe   == 'undefined' ? ''    : classe;
                    classe_size = typeof classe_size == 'undefined' ? '' : classe_size;

                    var model = that.model+'.lista['+that.lista.length+']';

                    pergunta = (pergunta + '').replaceAll('#MODEL#', model);

                    var obj_Confirmacao = {
                        id          : that.lista.length+'_'+Math.floor((Math.random() * 999999) + 1),
                        tipo        : tipo,
                        titulo      : titulo,
                        pergunta    : pergunta,
                        botao       : botao,
                        func        : func,
                        alto_fechar : fechar == 'N' ? false : true,
                        model       : model,
                        html        : '',
                        botoes      : '',
                        CSS_TITULO  : '',
                        cancelar    : function(e){
                            var that = this;
                            if(that.alto_fechar){
                                if(that.key_object_scop >= 0){
                                    var childScope = gScope.childScopes[that.key_object_scop];
            
                                    if (typeof childScope != 'undefined') {
                                        that.compiledElement.remove();
                                        childScope.$destroy();
                                        gScope.childScopes[that.key_object_scop] = undefined;
                                    }
                                }
                                
                                $('#'+that.id).remove(); that = {};
                            }
                            if(e.isTrigger > 0 ){ $(".stop_propag_esc").val('true'); }
                        },
                        fechar     : function(e){
                            var that = this;

                            if(that.key_object_scop >= 0){
                                var childScope = gScope.childScopes[that.key_object_scop];
        
                                if (typeof childScope != 'undefined') {
                                    that.compiledElement.remove();
                                    childScope.$destroy();
                                    gScope.childScopes[that.key_object_scop] = undefined;
                                }
                            }

                            $('#'+that.id).remove();
                            that = {};
                        },
                        hide  : function(e){
                            var that = this;
                            $('#'+that.id).css('display', 'none');
                        },
                        show  : function(e){
                            var that = this;
                            $('#'+that.id).css('display', 'block');
                        }
                    };

                    that.lista.push(obj_Confirmacao);

                    obj_Confirmacao.botoes = '';
                    obj_Confirmacao.botao.reverse();
                    obj_Confirmacao.func.reverse();

                    for (var i = 0; i < obj_Confirmacao.botao.length; i++) { 

                        obj_Confirmacao.botao[i] = angular.copy(obj_Confirmacao.botao[i]);

                        var num = obj_Confirmacao.botao[i];
                        
                        num.aguardar  = typeof num.aguardar  == 'undefined' ? false : num.aguardar;
                        num.aguardar2 = typeof num.aguardar2 == 'undefined' ? false : num.aguardar2;
                        num.TEMPO_AGUARDAR = typeof num.TEMPO_AGUARDAR == 'undefined' ? 0 : num.TEMPO_AGUARDAR;

                        var cod = that.getbutom(num, i, obj_Confirmacao.model);
                        obj_Confirmacao.botoes = obj_Confirmacao.botoes + cod;

                        num.click    = obj_Confirmacao.func[i];
                        num.pai      = obj_Confirmacao;
                        num.executar = function(e, btn){
                            var objthat = this;
                            
                            $(e.target).focus();

                            that.Time1 = $timeout(function(){
                                try {
                                
                                    btn.click(e, btn);

                                    if(btn.pai.alto_fechar){

                                        if(objthat.pai.key_object_scop >= 0){
                                            var childScope = gScope.childScopes[objthat.pai.key_object_scop];
                    
                                            if (typeof childScope != 'undefined') {
                                                objthat.pai.compiledElement.remove();
                                                childScope.$destroy();
                                                gScope.childScopes[objthat.pai.key_object_scop] = undefined;
                                            }
                                        }

                                        $('#'+btn.pai.id).remove();
                                        btn.pai = {};
                                    }

                                    if(e.isTrigger > 0){
                                        $(".stop_propag_esc").val('true');	
                                    }

                                }catch(err) {
                                    showErro(err.message);
                                }

                                $timeout.cancel(that.Time1);
                            });
                        }

                        num.timeAguardar = function(){
                            var that = this;

                            that.TEMPO_AGUARDAR = that.TEMPO_AGUARDAR - 1;

                            $timeout(function(){
                                if(that.TEMPO_AGUARDAR > 0){
                                    that.timeAguardar();
                                }
                            }, 1000);
                        };

                        if(num.aguardar){
                            num.timeAguardar();
                        }

                        if(num.aguardar2){
                            num.timeAguardar();
                        }
                    }

                    obj_Confirmacao.html = that.Confirmacao({
                        titulo: titulo,
                        inter : pergunta,
                        botao : obj_Confirmacao.botoes,
                        id    : obj_Confirmacao.id
                    }, obj_Confirmacao, classe, classe_size);

                    var corpo  = $('#' + obj_Confirmacao.id);
                    var scope = corpo.scope(); 
					corpo.html(obj_Confirmacao.html);
                    
                    if(typeof gScope.childScopes == 'undefined'){ gScope.childScopes = []; }
                    
                    obj_Confirmacao.key_object_scop = gScope.childScopes.length;

                    var childScope = scope.$new();
                    gScope.childScopes[obj_Confirmacao.key_object_scop] = childScope;

                    obj_Confirmacao.compiledElement = $compile(corpo.contents())(childScope);

                    childScope.$on("$destroy", function() {
                        //pai.compiledElement.remove();
                    });

                    return obj_Confirmacao;

                },
                key_object_scop : -1,
                compile: function(){
                    var that = this;
                    var html = that.getHtml();
                    var obj  = $(that.componente);
                    var scope = obj.scope(); 
					obj.html(html);
                    //$compile(obj.contents())(scope);
                    
                    if (that.childScope) {
                        that.childScope.$destroy();
                        that.childScope = undefined;
                    }
            
                    that.childScope = scope.$new();
                    that.compiledElement = $compile(obj.contents())(that.childScope);
                    that.childScope.$on("$destroy", function() {
                        that.compiledElement.remove();
                    });
					
					console.log('compilei tudo');
				}
            };
        }

        function getNew(model){
            var that      = this;
            var Confirmacao  = angular.copy(that.default);

            Confirmacao.Confirmacao_id = 'input_'+Math.floor((Math.random() * 999999) + 1);
            Confirmacao.model = model;

            return Confirmacao;
        }

        return Confirmacao;
        
	};

})(window, window.angular);