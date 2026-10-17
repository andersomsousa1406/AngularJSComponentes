(function(window, angular) {
    'use strict';

	AngularFindModule.factory('InputJS' , InputJS );
	
	
    InputJS.$inject = [
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

	function InputJS($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce, gScope) {

        // Private variables.
        var obj      = null;
        
	    /**
	     * Constructor, with class name
	     */
		
		 function InputJS() {
            
            obj = this; 


            /**
			* Um input disfarçado de select - Souza, Anderson
			*/
            
            this.getNew = getNew;
            this.default_input = {
                ID               : '',
                input_id         : '',
                componente       : '',
                model            : '',
                titulo           : '',
                filtro           : '',
                zoom             : 100,
				DADOS            : [],
				DADOS_RENDER     : [],
				campos_filtro    : [],
				close_event		 : false,
				status_visible   : true,
				input_visible    : false,
				open_list    	 : false,
				total_visible	 : false,
				lista_visivel 	 : false,
				dados_consultados: false,
				tamanho_setado	 : '',
				model_selected   : '',
				margin_left   	 : '',
				titulo   		 : '',
				filtro_visible   : true,
				option        	 : {
					item_selected  : false,
					input_disabled : false,
					disabled 	   : false,
					required 	   : false,
					maxlength 	   : 20,
					filtros 	   : {}
				},
				FILTRO           : '',
                ORDER_BY         : 'ID',
				WIDTH            : '100%',
				HEIGHT			 : 'auto',
                MAX_HEIGHT       : 'calc(300px)',
				SELECTED         : {},
				BACKUP         	 : {},
				onSelect		 : null,
				onClear			 : null,
				getCampo: function(nivel){
					var that = this;
					var html = '';
					var item = 'item'
					var class1 = '';
					var class2 = '';
					if(nivel != 0){
						item = item+'_'+nivel;
					}

					if(typeof that.tipo_tabela == 'undefined' || that.tipo_tabela == 'normal'){
						class1 = '';
						class2 = 'no-print';
					}else if( that.tipo_tabela == 'accordion'){
						class1 = 'no-print';
						class2 = '';
					};
						
					return html;					
				},
				alterar: function(){
					var that = this;
					angular.copy(that.SELECTED, that.BACKUP);
				},
				restore: function(){
					var that = this;
					angular.extend(that.SELECTED, that.BACKUP);
					that.closeLista();
				},
				findInList: function(){
					var that = this;
					var array_dados = [];
					var recup_dados = [];
					var selecionado = angular.copy(that.SELECTED[that.campo]);
					var teste_dados = angular.copy(that.DADOS);
					for(var a = 0;a < teste_dados.length; a++){
						var registro = teste_dados[a][that.campo];
						if(trim_null(registro).length > 0){
							array_dados.push((registro+'').toUpperCase());
							recup_dados.push(registro);
						}						
					}	
					var index = array_dados.indexOf((selecionado+'').toUpperCase());
					if(index > -1){
						console.log('item encontrado e corrigido');
						that.SELECTED[that.campo] = recup_dados[index];
					}else{
						return that.SELECTED[that.campo] = selecionado;
					}
				},
				onBlur : function(){
					
				},
				apagar : function(){
					var that = this;
					that.SELECTED = {};
					that.SELECTED[that.campo]  = '';
					that.option.disabled 	   = false;
					that.option.item_selected  = false;
					that.option.input_disabled = false;					
				},
				bloquear: function(){
					var that = this;
					that.option.item_selected = false;					
					that.option.input_disabled = true;
					that.option.disabled = true;
				},
				CalcWidthLista : function(){
					var that = this;
					if(that.dados_consultados == false){
						var menu_lista  = $(that.componente).find('ul.dropdown-menu').first();
						var input_lista = $(that.componente).find('input.campo_'+that.input_id).first();
						var width_list  = input_lista.css('width');
						var width_formated = width_list.replace('px','');
						width_formated = (parseInt(width_formated) + 25);
						menu_lista.css("width", width_formated);
						menu_lista.css("marginLeft", '-'+width_list);
					}					
				},
				setFocusInput: function(){
					var that = this;
					var first = $(that.componente).find('input.campo_'+that.input_id).first();
					first.focus();
				},
				setSelected : function(dados,event){
					var that = this;
					// console.log(dados);
					that.SELECTED = dados;
					that.option.item_selected = true;
					that.closeLista(event,1);
					that.setFocusInput();
				},
				setChoosen : function(dados,event){
					var that = this;
					// console.log(dados);
					that.SELECTED = dados;
					that.option.item_selected = true;
					that.closeLista(event,1);
					that.setFocusInput();
					if(that.onSelect !== null){
						that.onSelect(dados);
					}
				},
				CheckDados : function(){
					var that = this;
					if(that.option.input_disabled == false && that.option.disabled == false){
						// if(that.dados_consultados == false){													
							that.CalcWidthLista();

							var dados = {
								FILTRO: that.option.filtros,
								DADOS : that.option.filtros
							};
								
							return $q(function(resolve, reject){
								$ajax.post(that.option.obj_consulta,dados).then(function(response){                    
									if(response.length > 0){
										that.merge(response);
									}else{
										that.dados_consultados = false;
										that.DADOS = [];
									}									
									resolve(response);
								},function(e){
									that.dados_consultados = false;
									// that.DADOS = [];
									reject(e);
								});
							});							
						// }else{
						// 	that.AbrirLista();
						// }
					}
				},
				console : function (item){
					var that = this;
					console.log(item)
				},
                merge : function(dados){
					var that = this;
					that.DADOS = dados;
					that.total_dados = that.DADOS.length;
					that.dados_consultados = true;
					// if(that.DADOS.length > 0){
					// 	// that.AbrirLista(model,dados,campo,1);
					// 	var a = $(that.componente).find('#dropdownMenuButton');
					// 	$timeout(function(){
					// 		if(a.length > 0){
					// 			a.first().click();
					// 		}
					// 	})						
					// 	// showAlert('Não há dados a serem exibidos');
					// }	
                },
				GeraHtml : function(string, feed){
					return $sce.trustAsHtml(string);
				},
                getHtml : function(){
					var that = this;
					var html = '';
					var normal_case = '';
					if(typeof that.campo_normal_case != 'undefined'){
						normal_case =  'normal-case';
					}
					var style = '';
					if(typeof that.input_style != 'undefined'){
						style = 'style="'+style+that.input_style+'"';
					}

					var required = '';
					if(typeof that.option.required != 'undefined' && that.option.required != false){
						required = ' required ';
					}
					
					var maxlength = 20;
					if(typeof that.option.maxlength != 'undefined'){
						maxlength = that.option.maxlength;
					}
					//ng-blur="'+that.model+'.closeLista($event);"
					html = html+'  <div class="form-group" ng-blur="'+that.model+'.closeLista();" style="width: fit-content; display: inline-grid;"> 	'+
								' 	 <label> '+that.label_descricao+' </label> 	'+			
								' 	 <div class="input-group"> 	'+								
								' 		<input type="text" maxlength="'+maxlength+'" '+required+' class="form-control '+normal_case+' '+that.model+'.input_class campo_'+that.input_id+'" ng-model="'+that.model+'.SELECTED.'+that.campo+'" 	'+
								' 			style="border-right: 0px;'+that.input_style+'" ng-readonly="'+that.model+'.option.input_disabled" list="tipos" ng-keydown="'+that.model+'.atalhos('+that.model_selected+',item,$event)">		'+
								' 		<div class="dropdown" id="drop_down_'+that.input_id+'" style="width: 10px; padding-right: 20px; padding-left: 6px; padding-top: 8px; border-width: 2px; border-radius: 0px; border-color: rgb(204, 204, 204); border: 1px solid #cccccc;  '+
								' 			border-left: 0px; border-radius: 1px 5px 5px 0px; box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); transition: border-color: ease-in-out 0.15s; box-shadow: ease-in-out 0.15s;{{'+that.model+'.option.input_disabled == true ? \'background-color: rgb(147, 206, 147); cursor: not-allowed;\' : \'background-color: rgb(92, 184, 92); cursor: pointer;\' }}"> 		'+
								' 			<span style="color: rgb(255, 255, 255);" class="glyphicon glyphicon-chevron-down" type="button" id="dropdownMenuButton" aria-haspopup="true" aria-expanded="'+that.model+'.lista_visivel" 	'+
								'				ng-click="'+that.model+'.CheckDados();'+that.model+'.AbrirLista('+that.model_selected+',item,$event);"> 	'+
								' 			</span> 	'+
								// ' 			<span class="glyphicon glyphicon-remove" type="button" ng-if="'+that.model+'.option.input_disabled"> 	'+
								// ' 			</span> 	'+
								' 			<ul class="dropdown-menu" ng-show="'+that.model+'.lista_visivel" aria-labelledby="dropdownMenuButton" style="top: 29px; height: auto; max-height: 200px; margin-left: -225px; width: 252px; margin-top: 3px;"> 	'+	 
								' 			<div ng-if="'+that.model+'.DADOS.length == 0 && '+that.model+'.lista_visivel == true" style=" z-index: 999; position: absolute; background-color: white; width: calc(100%); height: calc(100% - 10px); text-align: center; padding-top: 7px;"> Sem Registros </div> '+
								' 				<input ng-keydown="'+that.model+'.atalhosFiltro('+that.model_selected+',item,$event);" type="text" placeholder="Filtragem rápida..." ng-model="'+that.model+'.FILTRO" '+
								' 					style="margin-left: 8px; margin-bottom: 5px; height: 26px !important; font-size: 10pt; margin-top: 5px;" class="filtro-input-dropdown normal-case">  '+
								' 					<li class="item_lista" style="border-top: 1px solid rgb(204, 204, 204); border-bottom: 1px solid rgb(204,204,204); border-radius: 2px; overflow-y: auto; max-height: 130px; align-items: center; justify-content: center;"> 	'+ 								
								'						<a tabindex="0" ng-repeat="item in '+that.model+'.DADOS_RENDER = ( '+that.model+'.DADOS | orderBy : '+that.model+'.ORDER_BY | find: {model : '+that.model+'.FILTRO ,fields : \'all\'}) track by $index" '+ 
								'							ng-keydown="'+that.model+'.atalhosLista('+that.model_selected+',item,$event);" class="dropdown-item" ng-click="'+that.model+'.setChoosen(item,event);" style="cursor: pointer !important; height: 40px;">  '+
								'					 	{{item.'+that.campo+'}} </a>'+
								' 					</li> 	'+ 
								' 			</ul>   '+
								' 		</div>  '+
								' 	 </div>	  '+
								' </div> 	';
									
					return html;
				},
				closeLista : function(event,close){
					var that = this;
					that.Time1 = $timeout(function(){
						var menu   = $(that.componente).find('div#drop_down_'+that.input_id).first();
						var input  = $(that.componente).find('input.campo_'+that.input_id).first();
						var filtro = $(that.componente).find('input.filtro-input-dropdown').first();				
						var lista  = $(that.componente).find('li.item_lista').first();
						// $(this).off(event);			
						if(typeof close == 'undefined'){
							if(!menu.is(':focus') && !input.is(':focus') && !filtro.is(':focus') && lista.children(":focus").length == 0){
								if(menu.hasClass('open')){
									menu.removeClass('open');
									that.lista_visivel = false;
								};
							}
						}else{
							if(menu.hasClass('open')){
								menu.removeClass('open');
								that.lista_visivel = false;
							};
						}

						$timeout.cancel(that.Time1);
						
					});					
				},
				AbrirLista: function(model,dados,event,eris){
					var that = this;					
					if(that.option.input_disabled == false && that.option.disabled == false){
						if(typeof eris == 'undefined'){
							var menu = $(event.currentTarget.parentElement);					
						}else{
							var menu = $(event);					
						}
						
						var campo = $(that.componente).find('.campo_'+that.input_id).first();
						var filtro = $(that.componente).find('.filtro-input-dropdown').first();
						
						if(!menu.hasClass('open')){
							menu.addClass('open');
							that.lista_visivel = true;
							that.FILTRO = '';
							that.Time3 = $timeout(function(){
								filtro.focus();			
								$timeout.cancel(that.Time3);			
							})
						};

						var closeLista = function(e){
							that.Time2 = $timeout(function(){								
								var menu   = $(that.componente).find('div#drop_down_'+that.input_id).first();
								var input  = $(that.componente).find('input.campo_'+that.input_id).first();
								var filtro = $(that.componente).find('input.filtro-input-dropdown').first();					
								var lista  = $(that.componente).find('li.item_lista').first();	
												
								//$(this).off(e);
								if(!menu.is(':focus') && !input.is(':focus') && !filtro.is(':focus') && lista.children(":focus").length == 0){
									if(menu.hasClass('open')){
										menu.removeClass('open');
										that.lista_visivel = false;
									};
								}

								$timeout.cancel(that.Time2);
							});	
						}
						
						$('body').focusin(closeLista);
						// $('body').click(closeLista);
						menu.focusout(closeLista);
						menu.on('hide.bs.dropdown', function(){
							that.Time4 = $timeout(function(){
								campo.focus();
								$timeout.cancel(that.Time4);
							});
						});
					}
				},
				atalhos: function(model,dados,event){
					//Atalhos p/ o input do componente
					var that = this;
					if(event.keyCode == 13){
						if(that.option.input_disabled == false && that.option.disabled == false){
							event.stopPropagation();
							// var campo = $(event.currentTarget).next('div#drop_down'+that.input_id);
							var campo = $('div#drop_down_'+that.input_id);
							// // console.log(event.currentTarget);
							// that.CheckDados(model,dados,event);													
							console.log('enter pressionado');
							var a = $(that.componente).find('#dropdownMenuButton');
							that.Time5 = $timeout(function(){
								if(a.length > 0){
									a.first().click();
								}
								$timeout.cancel(that.Time5);
							})
							// that.visualizar();
						}					

					}else if(event.keyCode == 40){
						if(that.option.input_disabled == false && that.option.disabled == false){
							event.stopPropagation();
							var filtro = $(that.componente).find('.filtro-input-dropdown').first();
							filtro.focus();
						}
					}else if(event.keyCode == 27){
						that.closeLista(event,1);
					}
				},
				atalhosFiltro: function(model,dados,event){
					//Atalhos p/ o filtro da lista
					var that   = this;
					var campos = $(event.currentTarget);
					if(event.keyCode == 40){
						event.stopPropagation();
						event.preventDefault();
						var first = $(that.componente).find('li.item_lista > a').first();
						var scroll = $(that.componente).find('li.item_lista').first();
						// scroll.scrollTop(0);
						if(!first.is(':focus')){	
							// first[0].focus();	
							first[0].focus({
								preventScroll: true
							});									
							that.Time6 = $timeout(function(){
								// console.log(scroll.scrollTop());
								// scroll.scrollTop(0);
								scroll.animate({ scrollTop: 0 }, 600);
								// console.log(scroll.scrollTop());
								$timeout.cancel(that.Time6);
							})
						}						
					}else if(event.keyCode == 38){
						event.preventDefault();
						var first = $(that.componente).find('input.campo_'+that.input_id).first();
						if(!first.is(':focus')){
							first.focus();
						}
					}else if(event.keyCode == 27){
						that.closeLista(event,1);
					}
				},
				atalhosLista:function(model,dados,event){
					//Atalhos p/ o filtro da lista
					var that = this;
					var campos = $(event.currentTarget);
					if(event.keyCode == 40){
						event.stopPropagation();
						event.preventDefault();
						// console.log(campos.next());
						var a = campos.next();
						// var scroll = $(that.componente).find('li.item_lista').first();
						// console.log(scroll.scrollTop());
						// console.log(a);
						if(a.length > 0){
							a.focus();				
							// console.log(a.first().offsetTop());			
							// var lista = $(that.componente).find('li.item_lista');
							// lista.first().scrollTop();
							// a[0].scrollIntoView({ behavior: 'smooth'});							
						}
					}else if(event.keyCode == 38){
						// console.log(campos.prev());
						event.stopPropagation();
						event.preventDefault();
						// if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
						
						// }
						var b = campos.prev();
						// console.log(b);
						// var scroll = $(that.componente).find('li.item_lista').first();
						// console.log(scroll.scrollTop());
						if(b.length > 0){
							b.focus();
							// console.log(b.first().offsetTop());			
							//var lista = $(that.componente).find('li.item_lista');
							//lista.first().scrollTop();
							// $(that.componente).find('li.item_lista').scrollTop(b.scrollTop());
							// b[0].scrollIntoView({ behavior: 'smooth'});														
						}else{							
							var filtro = $(that.componente).find('.filtro-input-dropdown').first();
							filtro.focus();							
						}
					}else if(event.keyCode == 27){
						that.closeLista(event,1);
					}else if(event.keyCode == 13){
						that.setChoosen(dados,event);
					}
				},
				key_object_scop : -1,
                compile: function(){
                    var that = this;
                    var html = that.getHtml();
                    var obj  = $(that.componente);
                    var scope = obj.scope(); 
					obj.html(html);
					//$compile(obj.contents())(scope);

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

					that.compiledElement = $compile(obj.contents())(childScope);
					childScope.$on("$destroy", function() {
						that.compiledElement.remove();
					});
					
					console.log('compilei tudo');
				}
            };
		}
		
        function getNew(){
            var that    = this;
            var input   = angular.copy(that.default_input);

            input.input_id = 'input_'+Math.floor((Math.random() * 999999) + 1);
            
            return input;
        }
	    /**
	     * Return the constructed artifact function
	     */
	    return InputJS;
	};
	

})(window, window.angular);