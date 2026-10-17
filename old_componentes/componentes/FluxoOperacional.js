(function(window, angular) {
    'use strict';

	AngularFindModule.factory('FluxoOperacional' , FluxoOperacional );
	
	FluxoOperacional.$inject = [
        '$ajax',
		'$q',
		'$parse',
		'$rootScope',		
        '$compile',
		'$timeout',
		'TabelaJS',
		'gScope'
		
    ];

	function FluxoOperacional($ajax, $q, $parse, $rootScope, $compile, $timeout, TabelaJS, gScope) {

		var lista = [];
	    /**
	     * Constructor, with class name
	     */
	    function FluxoOperacional(object,arg_scope) {
			
			if ( object != undefined ) {
                this._object = object;
            } else {
                this._object = 'vm.FluxoOperacional';
			}

			var that 									= this;
			this._object_historico 					    = 'vm.FluxoOperacional.HISTORICO';
			this.executar								= executar;
			this.consultarProgresso						= consultarProgresso;
			this.consultarHistorico						= consultarHistorico;
			this.atalhoValidarUsuario					= atalhoValidarUsuario;
			this.validarUsuario							= validarUsuario;
			this.FILTRO_DADOS 						    = '';
			this.executando_operacao					= false;
			this.Tabela 							    = new TabelaJS();
			this.tabela_id 							    = 'tabela_FluxoOperacional_'+(Math.floor(Math.random() * 99999))
			this.TabelaFluxoOperacional 			    = this.Tabela.getNew();
			this.TabelaFluxoOperacional.componente      = ('#'+this.tabela_id);
			this.TabelaFluxoOperacional.ID              = (Math.floor(Math.random() * 99999))+'_TBFluxoOperacional';
			this.TabelaFluxoOperacional.HEIGHT          = 'calc(260px)';
			this.TabelaFluxoOperacional.WIDTH           = 'calc(100%)';
			this.TabelaFluxoOperacional.ORDER_BY        = 'DATA_HORA';
			this.TabelaFluxoOperacional.filtro       	= this.FILTRO_DADOS;
			this.TabelaFluxoOperacional.zoom            = 90;
			this.TabelaFluxoOperacional.model_selected  = this._object;
			this.TabelaFluxoOperacional.model_tabela 	= that;
			this.TabelaFluxoOperacional.model 			= this._object+'.TabelaFluxoOperacional';	
			this.TabelaFluxoOperacional.tipo_tabela 	= 'compilado';	
			this.TabelaFluxoOperacional.total_dados		= 0;
			this.TabelaFluxoOperacional.vs_scroll       = false;
			this.TabelaFluxoOperacional.filtro_visible  = true;
			this.TabelaFluxoOperacional.filtro_status_v	= false; 
			this.TabelaFluxoOperacional.filtro_change   = true;
			this.TabelaFluxoOperacional.status_visible  = true;
			this.TabelaFluxoOperacional.infinite_scroll = false;
			this.TabelaFluxoOperacional.total_registros = true;
			this.TabelaFluxoOperacional.legendas = '' +
						'<div class="legenda_padrao">'+
						'	<span style="font-weight: bold;">Status:</span>'+
						'	<span style="margin-top: 4px;" class="t-status status-0"></span><span style="margin-left: 1px;margin-right: 5px;">Pendente</span>'+
						'	<span style="margin-top: 4px;" class="t-status status-1"></span><span style="margin-left: 1px;margin-right: 5px;">Aprovado</span>'+
						'</div>';

			var btn_hist = [
				{
					funcao : function(event, objeto){
						var ctrl_hist = $('#historico_main_fluxo_operacional_plugin');
						that.SELECTED = objeto;
						if(ctrl_hist.length > 0){
							$(ctrl_hist).attr('data-tabela-id',that.SELECTED.ID);
							$(ctrl_hist).attr('disabled',false);
							$timeout(function(){
								$(ctrl_hist).click();
								$(ctrl_hist).attr('disabled',true);
							});						
						}
					},
					icone : 'glyphicon glyphicon-time',
					type  : 'gerar-historico',
					class : '',
					label : '',
					disabled : function(objeto){ return that.executando_operacao == true;},
					readonly : function(objeto){ return false;},
					visible  : function(objeto){ return true; }
				}
			];

			
		function fnFluxoEtapas(){
			var html = "";

			html = html +
			'<span'+
			'	class="glyphicon glyphicon-info-sign ng-scope"'+
			'	ng-if="item.TAREFAS.length > 0"'+
			'	data-toggle="popover"'+
			'	data-placement="bottom"'+
			'	title=""'+
			'	style="margin-left: 4px; color: #a90f0f;"'+
			'	data-element-content="#info-componente-fluxo-etapas-{{ item.DESC_ID }}"'+
			'	on-finish-render="bs-init"'+
				'	data-original-title=""'+
			'></span>';

			html = html +
			'<div ng-if="item.TAREFAS.length > 0" id="info-componente-fluxo-etapas-{{ item.DESC_ID }}" style="display: none">'+
			'	<div class="origem-container">'+
			'		<table class="table table-striped table-bordered">'+
			'			<thead>'+
			'				<tr>'+
			'					<th class="text-left">Etapa</th>'+
			'					<th class="text-left">Status</th>'+
			'				</tr>'+
			'			</thead>'+
			'			<tbody>';

			html = html + 
			'	<tr ng-repeat="tarefa_info in item.TAREFAS track by $index">'+
			'		<td class="text-right" ng-bind="tarefa_info.DESCRICAO"></td>'+
			'		<td class="text-center"><span ng-if="tarefa_info.STATUS == 1" style="color: green;" class="glyphicon glyphicon-ok"></span><span ng-if="tarefa_info.STATUS == 2" style="color: red;" class="glyphicon glyphicon-remove"></span></td>'+
			'	</tr>';


			html = html + 
			'			</tbody>'+
			'		</table>'+
			'	</div>'+
			'</div>';

			return html;
		}

			this.TabelaFluxoOperacional.COLUNAS 		= [
				{CAMPO: "FDATA_HORA" 		 	, SIZE_CELL : '120px' , ATTR: 'auto-title', PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "DATA_HORA"	 		   , VISIBLE: true , SIZE: 0, STYLE: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', DECIMAL: 0, ORDEM:"01", DESCRICAO:"Dt.Hora Solicitação"  },
				{CAMPO: "DESC_FLUXO"		 	, SIZE_CELL : '400px' , ATTR: 'auto-title', PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "DESC_FLUXO" 		   , VISIBLE: true , SIZE: 0, STYLE: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', DECIMAL: 0, ORDEM:"02", DESCRICAO:"Fluxo"		 	     },
				{CAMPO: "FDATA_HORA_ATUALIZACAO", SIZE_CELL : '120px' , ATTR: 'auto-title', PREFIXO: '', SUFIXO: '', TIPO: 'string', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "DATA_HORA_ATUALIZACAO", VISIBLE: true , SIZE: 0, STYLE: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', DECIMAL: 0, ORDEM:"03", DESCRICAO:"Dt.Hora Atualização"  },
				{CAMPO: "ETAPAS", 				  HTML: fnFluxoEtapas(), 					PREFIXO: '', SUFIXO: '', TIPO: 'htmlcp', TTITLE: '', FIXO: true, TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "ETAPAS"			   , VISIBLE: true , SIZE: 0, STYLE: '', 																DECIMAL: 0, ORDEM:"04", DESCRICAO:"Etapas"  			 },
				{CAMPO: "OPCAO",	 			  						 					PREFIXO: '', SUFIXO: '', TIPO: 'btn2'  , TTITLE: '', FIXO: false,TOTAL: false, ALIGN: 'left', CAMPO_FILTRO: "OPCAO"				   , VISIBLE: true , SIZE: 0, STYLE: 'width: 50px !important;',											DECIMAL: 0, ORDEM:"05", DESCRICAO:"Opções",BTN2: btn_hist}
			];
			
			this.HISTORICO						= {
				visualizar: function(){},
				consultar: consultarHistorico,
				SELECTED:{},
				DADOS: [],
				BACKUP_DADOS: [],
			};
			this.Tabela2 						= new TabelaJS();
			this.tabela2_id 					= 'tabela_historico_'+(Math.floor(Math.random() * 99999))
			this.TabelaHistorico 				= this.Tabela2.getNew();
			this.TabelaHistorico.componente     = ('#'+this.tabela2_id);
			this.TabelaHistorico.ID             = (Math.floor(Math.random() * 99999))+'_TBHISTORICO';
			this.TabelaHistorico.HEIGHT         = 'calc(100vh - 260px)';
			this.TabelaHistorico.WIDTH          = 'calc(100%)';
			this.TabelaHistorico.ORDER_BY       = '-DATAHORA';
			this.TabelaHistorico.filtro       	= this.FILTRO_DADOS;
			this.TabelaHistorico.zoom           = 90;
			this.TabelaHistorico.model_selected = this._object+'.HISTORICO';
			this.TabelaHistorico.model_tabela 	= that.HISTORICO;
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
            this.DADOS  		 						= [];
            this.ARGS   		 						= {};
			this.FILTRO 		 						= '';
			this.key_object_scop 						= -1;
			this.visualizar								= function(){
				console.log(that.SELECTED);
			};
			

			this.limparParaEnvio 						= function(obj) {
				// Se não for objeto ou for nulo, retorna o valor (exceto se for função)
				if (obj === null || typeof obj !== 'object') {
					return (typeof obj === 'function') ? undefined : obj;
				}

				// Se for um Array, limpa cada item
				if (Array.isArray(obj)) {
					return obj.map(function(item) {
						return this.limparParaEnvio(item);
					});
				}

				// Se for objeto, reconstrói apenas com propriedades válidas
				var clone = {};
				Object.keys(obj).forEach(function(key) {
					// 1. Remove propriedades internas do AngularJS ($$hashKey, etc)
					// 2. Verifica recursivamente o valor
					if (!key.startsWith('$$')) {
						var valorLimpo = this.limparParaEnvio(obj[key]);
						if (typeof valorLimpo !== 'undefined') {
							clone[key] = valorLimpo;
						}
					}
				});
				
				return clone;
			}
            
			//Botão de execução de validação
            this._button_attr    						= '[data-consulta-fluxo-operacional]';
            //Botão de consulta de atualizações de solicitações...
            this._button_progress_attr					= '[data-consulta-fluxo-operacional-progresso]';
            this._button_historico_attr					= '[data-consulta-fluxo-operacional-historico]';

            this._button         						= null;
            this._modal          						= function(){return $('#modal-fluxo-operacional')};
            this._modal_login      						= function(){return $('#modal-fluxo-operacional-login')};
			this._modal_historico  						= function(){return $('#modal-fluxo-operacional-historico')};
			this._modal_motivo		 					= function(){return $('#modal-fluxo-operacional-motivo')};
            this._controller     						= function(){
            	var scope = $('#main').find('[ng-controller]').first();
            	if(scope.length == 0){
            		scope = $('#main').find('.ng-isolate-scope').first();
            	}
            	return scope; 
            };

			this.processarValidacaoJavascript			= function(scripts){
				var defer = $q.defer(); // Cria uma promessa de retorno
				var that = this;
				
				// Captura os dados da factory (seu código original de busca)

				var dadosParaValidar = angular.copy(gScope.Ctrl[that.dadosValidacaoJS].SELECTED);

				var executarLimpeza = function(obj) {
					if (obj === null || typeof obj !== 'object') {
						return (typeof obj === 'function') ? undefined : obj;
					}

					if (Array.isArray(obj)) {
						return obj.map(executarLimpeza); // Recursão simples em arrays
					}

					var clone = {};
					Object.keys(obj).forEach(function(key) {
						// Ignora propriedades internas do Angular ($$hashKey)
						if (key.indexOf('$$') !== 0) { 
							var valorLimpo = executarLimpeza(obj[key]); // Chama a si mesma sem precisar de 'this'
							if (typeof valorLimpo !== 'undefined') {
								clone[key] = valorLimpo;
							}
						}
					});
					return clone;
				};
				dadosParaValidar 	 = executarLimpeza(dadosParaValidar);
    			//var script_final 	 = '\n' + scripts.join('\n') + '\n return true;';
				
				var iframe = document.createElement('iframe');
				iframe.style.display = 'none';
				// CRÍTICO: Ativa o sandbox para segurança
				iframe.setAttribute('sandbox', 'allow-scripts');

				// Listener para as respostas do Sandbox
				var onMessage = function(event) {
					// Se a mensagem for o resultado da validação
					if (event.data && typeof event.data.sucesso !== 'undefined') {
						window.removeEventListener('message', onMessage);
						if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
						URL.revokeObjectURL(iframe.src);
						defer.resolve(event.data);
					}
					
					// Se o Iframe avisar que está pronto para receber os dados
					if (event.data === 'READY') {
						iframe.contentWindow.postMessage({
							tipo: 'DADOS_PARA_VALIDAR',
							vm: dadosParaValidar,
							script: scripts
						}, '*');
					}
				};

				window.addEventListener('message', onMessage);

				// Conteúdo do Iframe que espera pelos dados
				var conteudoIframe = `
					<html>
					<body>
						<script>
							(function() {
								var mensagensDeErro = [];
								var showErro = function(msg) { mensagensDeErro.push(msg); };

								// Avisa ao pai que o sandbox carregou e está pronto
								window.parent.postMessage('READY', '*');

								window.addEventListener('message', function(event) {
									if (event.data.tipo === 'DADOS_PARA_VALIDAR') {
										try {
											var vm = event.data.vm;
											var scripts = event.data.scripts;
											var falhas = []; // Guardará os índices dos scripts que retornaram false

											// Percorre cada script individualmente
											scripts.forEach(function(scriptCorpo, index) {
												// Adicionamos o return true automático para cada script individual
												var corpoComRetorno = scriptCorpo + '\\n return true;';
												
												try {
													var regra = new Function('vm', 'showErro', corpoComRetorno);
													var resultado = regra(vm, showErro);
													
													if (resultado === false) {
														falhas.push(index); // Salva qual script barrou a operação
													}
												} catch (e) {
													mensagensDeErro.push("Erro no script " + index + ": " + e.message);
													falhas.push(index);
												}
											});

											window.parent.postMessage({
												sucesso: (falhas.length === 0),
												erros: mensagensDeErro,
												indicesFalhas: falhas // Devolvemos os índices para o Angular
											}, '*');

										} catch (err) {
											window.parent.postMessage({ erro: true, msg: err.message }, '*');
										}
									}
								});
							})();
						<\/script>
					</body>
					</html>
				`;

				var blob = new Blob([conteudoIframe], { type: 'text/html' });
				iframe.src = URL.createObjectURL(blob);
				document.body.appendChild(iframe);

				return defer.promise;
			};

			this.opcaoAprovar							= function(){
				that.ARGS.DADOS_TAREFA   = that.TAREFA_SELECTED;
				that.ARGS.OPCAO_TAREFA   = 1;

				that.validarOpcao();
			}
			this.opcaoRecusar							= function(){
				that.ARGS.DADOS_TAREFA   = that.TAREFA_SELECTED;
				that.ARGS.OPCAO_TAREFA   = 2;

				that.validarOpcao();

			}
			this.opcaoVoltar							= function(){
				that.ARGS.DADOS_TAREFA   = that.TAREFA_SELECTED;
				that.ARGS.OPCAO_TAREFA   = 3;

				that.validarOpcao();
			}

			this.opcaoVerMotivo							= function(tipo){
				that.TIPO_MOTIVO = tipo;

				that._modal_motivo().modal('show');

			}

			this.PANEL_SOLICITACOES_ABERTO  			= false;
			this.changePainel 							= function(e){
				switch (e) {
					case 'dadosSolicitacoes1':
						vm.PANEL_SOLICITACOES_ABERTO  = !vm.PANEL_SOLICITACOES_ABERTO;										
						break;			
					default:
						break;
				}
			}

			this.checkPainel 							= function(painel,container){			
				$timeout(function(){
					//var a = $('#'+painel).hasClass('in');
					var a = angular.element('#'+painel);
					if(a.hasClass('in') == false){
						$('#'+container).click();
					}
				});
			}

			this.validarOpcao							= function(){

				that.executando_operacao = true;
				
				return $q(function(resolve,reject){
					$ajax.post('/api/validarOpcaoTarefa', that.ARGS)
						.then(function(response) {

							if(response.length > 0){
								response.forEach(element => {
									if(element.erro == 1){
										showErro(element.msg);	
									}	
									if(element.alert == 1){
										showAlert(element.msg);	
									}
								});								
							}
							
							if(response.length == 0){
								that.SENHA_INFORMADA = '';
								that.MOTIVO_RETORNO	 = '';
								that.MOTIVO_RECUSA	 = '';
								that._modal_login().modal('show');
								$timeout(function(){
									if(that.ARGS.OPCAO_TAREFA == 2){
										$('.motivo_recusa').focus();
									}

									if(that.ARGS.OPCAO_TAREFA == 3){
										$('.motivo_retorno').focus();
									}

									if(that.ARGS.OPCAO_TAREFA == 1){
										$('#auth_key_validation').focus();
									}
									
								});
							}

							that.executando_operacao = false;

							resolve(response);
						},
						function(e){
							that.executando_operacao = false;
							reject(e);
						}
					);
				});

			}

            var scope 									= null;

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

			that.compiledElement  	  	  = $compile(that.html())(childScope);
			that.compiledElementLogin 	  = $compile(that.html_login())(childScope);
			that.compiledElementHistorico = $compile(that.html_historico())(childScope);
			that.compiledElementMotivo 	  = $compile(that.html_motivo())(childScope);
			childScope.$on("$destroy", function() {
				that.compiledElement.remove();
				that.compiledElementLogin.remove();
				that.compiledElementHistorico.remove();
				that.compiledElementMotivo.remove();
			});

			that._controller().append(that.compiledElement);
			that._controller().append(that.compiledElementLogin);
			that._controller().append(that.compiledElementHistorico);
			that._controller().append(that.compiledElementMotivo);

			//that._controller().append($compile(that.html())(scope));

			that.TabelaFluxoOperacional.compile();
			that.TabelaHistorico.compile();
            
            $(document).on('click',that._button_attr,function(){
                var button = $(this);
                $rootScope.$apply(function(){
                    
                    that._button = button;
		
					that.FILTRO 	  = '';
					that.FILTRO_DADOS = '';
                    that.ARGS 		  = {
                        MENU    		: button.attr('data-tela-id'),
                        TABELA_ID 		: button.attr('data-tabela-id')
					};     
					                    
                    that.executar(1).then(function(){
                        //that._modal().modal('show');
                    });

                });
            }); 
            
            $(document).on('click',that._button_progress_attr,function(){
                var button = $(this);
                $rootScope.$apply(function(){
                    
                    that._button = button;
		
					that.FILTRO 	  = '';
					that.FILTRO_DADOS = '';
                    that.ARGS 		  = {
                        MENU    		: button.attr('data-tela-id'),
                        TABELA_ID 		: button.attr('data-tabela-id')
					};     
					                    
                    that.consultarProgresso(1).then(function(){
                        //that._modal().modal('show');
                    });

                });
            }); 
            
            $(document).on('click',that._button_historico_attr,function(){
                var button = $(this);
                $rootScope.$apply(function(){
                    
                    that._button = button;
		
					that.FILTRO 	      			  = '';
					that.FILTRO_DADOS     			  = '';
					that.FILTRO_TABELA_ID 			  = button.attr('data-tabela-id');
					that.FILTRO_HISTORICO 			  = {}
                    that.FILTRO_HISTORICO.TABELA      = button.attr('data-tabela'),
                    that.FILTRO_HISTORICO.TABELA_ID   = button.attr('data-tabela-id');
					                    
                    that.consultarHistorico(1).then(function(){
                        that._modal_historico().modal('show');
                    });
                });
            }); 
			
	    }
        
        FluxoOperacional.prototype.getArgs = function(){        
            var that = this;
        }
        
        var executar  = function(e){
            
            var that = this;
			that.ARGS.USUARIO_ID 	 = $('#usuario-id').val();

			that.permitir_operacao   = true;
			that.executando_operacao = true;
            
            return $q(function(resolve,reject){
                $ajax.post('/api/executarFluxoOperacional', that.ARGS)
                    .then(function(response) {
						
						that.SELECTED	= {};

						

						var possui_pendentes = false;
						response.REGISTRO_REQUISICOES.forEach(function(item){
							if(item.STATUS == 0){
								possui_pendentes = true;
							}
						})

						if(response.REGISTRO_REQUISICOES.length > 0 && possui_pendentes == true && response.ULTIMA_VALIDACAO_AUTORIZADA == 0){
							that.TabelaFluxoOperacional.merge(response.REGISTRO_REQUISICOES);
							that.TabelaFluxoOperacional.DADOS.forEach(function(item){
								if(item.STATUS == 0){
									that.SELECTED = item;
								}
							})
							that._modal().modal('show');
						}

						if(response.POSSUI_VALIDACAO_PENDENTE == 0 && possui_pendentes == false/* && response.ULTIMA_VALIDACAO_AUTORIZADA == 1*/){
							that.execPosValidar();
						}

						that.executando_operacao = false;

						//Por enquanto as regras não serão utilizadas

						/*if(response.POSSUI_VALIDACAO_PENDENTE > 0){
							that.permitir_operacao = false;
							showAlert('Você possui uma solicitação de alteração pendente!');
						}

						if(that.permitir_operacao == true && response.RESULTADO_VALIDACAO.length > 0){
							that.permitir_operacao = false;
							response.RESULTADO_VALIDACAO.forEach(function(msg) {
								showErro(msg);
							});
						}

						if(that.permitir_operacao == true && response.JAVASCRIPT_VALIDACAO.length > 0){
							that.processarValidacaoJavascript(response.JAVASCRIPT_VALIDACAO).then(function(resultado) {
								if (resultado.erros && resultado.erros.length > 0) {
									resultado.erros.forEach(function(msg) {
										showErro(msg); // Aqui você chama a função REAL do seu sistema
									});
								}

								that.permitir_operacao   = (resultado.sucesso === true);

								that.executando_operacao = false;

								if(that.permitir_operacao){
									that.execPosValidar();
								}
							});
						}
						
						if(that.permitir_operacao == true && response.JAVASCRIPT_VALIDACAO.length == 0){
							

							if(that.permitir_operacao){
								that.execPosValidar();
							}
						}
						if(that.permitir_operacao == false ){};*/

                        resolve(response);
                    },
                    function(e){
						that.executando_operacao = false;
                        reject(e);
                    }
                );
            });
		}

        var consultarProgresso  = function(e){
            
            var that = this;
			that.ARGS.USUARIO_ID = $('#usuario-id').val();
			that.consultando_operacao_progresso = true;
            
            return $q(function(resolve,reject){
                $ajax.post('/api/consultarProgressoFluxoOperacional', that.ARGS)
                    .then(function(response) {

						that.SELECTED	= {};

						if(response.REGISTRO_REQUISICOES.length > 0){
							that.DADOS = response.REGISTRO_REQUISICOES;
							that.TabelaFluxoOperacional.merge(that.DADOS);
							that._modal().modal('show');
						}

						if(response.REGISTRO_REQUISICOES.length == 0){
							showErro('Não há registros de solicitações em seu usuário.');
						}

						that.consultando_operacao_progresso = false;
						
                        resolve(response);
                    },
                    function(e){
						that.consultando_operacao_progresso = false;
                        reject(e);
                    }
                );
            });
		}

        var consultarHistorico = function(e){
            
            var that = this;
            console.log(e);
			if(typeof e != 'undefined'){
				that.TabelaHistorico.consulta_pagina = 0;
			}

			that.FILTRO_HISTORICO.FILTRO 		   = that.FILTRO_DADOS;
			that.FILTRO_HISTORICO.FILTRO_TABELA_ID = that.FILTRO_TABELA_ID;
			that.FILTRO_HISTORICO.QTD 	 		   = that.TabelaHistorico.consulta_qtd;
			that.FILTRO_HISTORICO.PAGINA 		   = that.TabelaHistorico.consulta_pagina * that.TabelaHistorico.consulta_qtd;			
//          that.getArgs();
            
            return $q(function(resolve,reject){
                $ajax.post('/api/historico', that.FILTRO_HISTORICO)
                    .then(function(response) {
						that.DADOS = response;
						that.TabelaHistorico.merge(response);
						var titulo = ($('#_div_titulo_tela').val()).trim();
						var datahora = moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
						that.TabelaHistorico.titulo = titulo+' - Histórico';
						that.TabelaHistorico.filtro = that.FILTRO_DADOS; 
						that.Time1 = $timeout(function(){
							/*if(that.TabelaHistorico.DADOS.length > 0){
								that.SELECTED = that.TabelaHistorico.DADOS[0];
							}*/
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

		var atalhoValidarUsuario= function(e){
			var that = this;
			if(that.consultando_operacao_progresso != true){
				that.validarUsuario();	
			};
		}

		var validarUsuario  	= function(e){            
            var that 							= this;
			that.TABELA_ID						= that.DADOS_TAREFA
			that.ARGS.SENHA_INFORMADA 			= that.SENHA_INFORMADA;
			that.ARGS.MOTIVO_RETORNO	 		= that.MOTIVO_RETORNO;
			that.ARGS.MOTIVO_RECUSA				= that.MOTIVO_RECUSA;

			if(trim_null(that.SENHA_INFORMADA) == ''){
				showErro('Informe uma credencial válida!');
				$('#auth_key_validation').focus();
				that.consultando_operacao_progresso = false;
			}else if(trim_null(that.MOTIVO_RECUSA) == '' && trim_null(that.MOTIVO_RECUSA).length < 10 && that.ARGS.OPCAO_TAREFA == 2){
				showErro('Informe um motivo de recusa válido!<br> Mínimo de 10 caracteres');
				$('.motivo_recusa').focus();
				that.consultando_operacao_progresso = false;
			}else if(trim_null(that.MOTIVO_RETORNO) == '' && trim_null(that.MOTIVO_RETORNO).length < 10 && that.ARGS.OPCAO_TAREFA == 3){
				showErro('Informe um motivo de retorno válido!<br> Mínimo de 10 caracteres');
				$('.motivo_retorno').focus();				
				that.consultando_operacao_progresso = false;
			}

			if(trim_null(that.SENHA_INFORMADA) != ''){
			
				that.consultando_operacao_progresso = true;
				
				return $q(function(resolve,reject){
					$ajax.post('/api/executarOpcaoTarefa', that.ARGS)
						.then(function(response) {

							//Se usuário não possui permissão...
							if(response.USUARIO_SEM_PERMISSAO == 1){
								showErro('Credenciais informadas não possuem permissão para esta operação.<br> Tente novamente com credenciais válidas!.');
							}

							//Se foram encontrados erros durante a validação...
							if(response.RESULTADO_VALIDACAO.length > 0){
								response.RESULTADO_VALIDACAO.forEach(element => {
									if(element.erro == 1){
										showErro(element.msg);	
									}	
									if(element.alert == 1){
										showAlert(element.msg);	
									}
								});								
							}

							var possui_pendentes = false;
							response.REGISTRO_REQUISICOES.forEach(function(item){
								if(item.STATUS == 0){
									possui_pendentes = true;
								}
							})

							//Se houver solicitações em aberto atualizar em tela
							if(response.RESULTADO_VALIDACAO.length == 0 && response.USUARIO_SEM_PERMISSAO == 0 && possui_pendentes == true){
								that.TabelaFluxoOperacional.merge(response.REGISTRO_REQUISICOES);
								
								for(const element of that.TabelaFluxoOperacional.DADOS) {
									if (element.ID == that.ARGS.DADOS_TAREFA.REGISTRO_FLUXO_OPERACIONAL_ID) {
										that.SELECTED = element;
										break; // Works here
									}
								}

							}

							//Se não houver mais pendências, prosseguir com a função declarada para excução ao final do fluxo...
							if(response.RESULTADO_VALIDACAO.length == 0 && response.USUARIO_SEM_PERMISSAO == 0 && possui_pendentes == false){
								that.execPosValidar();
								that._modal().modal('hide');
							}

							that.consultando_operacao_progresso = false;
							that.SENHA_INFORMADA 				= '';

							that._modal_login().modal('hide');
							
							resolve(response);
						},
						function(e){
							that.consultando_operacao_progresso = false;
							reject(e);
						}
					);
				});

			}
		}

	    /**
	     * Public method, assigned to prototype
	     */
	    FluxoOperacional.prototype.html = function(){

            var that = this;
            
            var html = '';
            
            html += '<div class="modal fade" id="modal-fluxo-operacional" role="dialog" data-keyboard="false" data-backdrop="static">                 																										 ';
            html += '	<div class="modal-dialog modal-lg" role="document" style="height: calc(100% - 70px);">                                        																										 ';
            html += '		<div class="modal-content" style="height: 100%;">                                                                         																										 ';
            html += '			<div class="modal-header">                                                                                            																										 ';
            html += '				<div class="modal-header-left">                                                                                   																										 ';
            html += '					<h4 class="modal-title" id="myModalLabel">Solicitações Pendentes</h4>                                         																										 ';
            html += '				</div>                                                                                                            																										 ';
            html += '				<div class="modal-header-center">                                                                                 																										 ';
            html += '				</div>                                                                                                            																										 ';
            html += '				<div class="modal-header-right">                                                                                  																										 ';
            html += '					<button type="button" class="btn btn-default btn-voltar" data-hotkey="esc" data-dismiss="modal">              																										 ';
            html += '						<span class="glyphicon glyphicon-chevron-left"></span>                                                    																										 ';
            html += '						Voltar                                                                                                    																										 ';
            html += '					</button>                                                                                                     																										 ';
            html += '				</div>                                                                                                            																										 ';
            html += '			</div>                                                                                                                																										 ';
			html += '			<div class="modal-body" style="height: 100%;">                                                                        																										 ';
			html += ' 					<form ng-submit="'+that._object+'.consultarProgresso(10)"  class="form-inline">	              							  	  																						 ';	
			html += ' 					   <div class="table-filter collapse in" aria-expanded="true"                      											  																						 ';
			html += '							 style="margin-bottom: 4px; background: rgba(221,221,221,.33);                              							  																					';
			html += '									padding: 2px 10px 7px; border-radius: 5px;">                                        							  																					 ';
			html += '								<button style="display: none;" id="historico_main_fluxo_operacional_plugin" disabled="true" 						  																					 ';
			html += '									data-consulta-fluxo-operacional-historico data-tabela="TBREGISTRO_FLUXO_OPERACIONAL" 							  																					 ';
			html += '									data-tabela-id="{{ vm.FluxoOperacional.SELECTED.ID }}" type="button"  											  																					 ';
			html += '									class="btn gerar-historico"><span class="glyphicon glyphicon-time"></span> Histórico 							  																					 ';
			html += '								</button>                                                                                   						  																					 ';
			html += '							                                                                                            							  																					 ';
			html += '							<div class="form-group" style="padding-top: 11px; width: fit-content; padding-right: 10px;">							  																					 ';
			html += '								<button type="submit" class="btn btn-xs btn-primary btn-filtrar"                        							  																					 ';
			html += '										data-hotkey="alt+f" id="btn-table-filter-atualizar-fluxos">                       							  																					 ';
			html += '									<span class="glyphicon glyphicon-filter"></span> Atualizar                            							  																					 ';
			html += '								</button>                                                                               							  																					 ';
			html += '							</div>	                                                                                    							  																					 ';
			html += '						</div>																														  																					 ';
			html += ' 					</form>	 																													  																						 ';
			html += '		  			<legend ng-if="'+that._object+'.SELECTED.TAREFAS.length > 0" style="margin-top: 15px;">Etapas</legend>											  																	 ';
			html += '		  			<div ng-if="'+that._object+'.SELECTED.TAREFAS.length > 0" style="display: -webkit-inline-box;">							  																							 ';
			html += '		  				<div ng-repeat-start="tarefa in '+that._object+'.SELECTED.TAREFAS track by $index" style="border-radius: 15px; 		  																							 ';
			html += '		  					height: 90px; width: 140px; background-color: {{tarefa.STATUS == 0 ? \'#a59c9c;\' : \'\'}} 					  																							';
			html += '		  					{{tarefa.STATUS == 1 ? \'green;\' : \'\'}} {{tarefa.STATUS == 2 ? \'red;\' : \'\'}}; color: white; 				  																							 ';
			html += '		  						cursor: pointer; padding: 2px; font-size: 11px; font-weight: bolder; text-overflow: ellipsis; display: flex;">																							 ';
			html += '		  					<div style="border-radius: 15px 0px 0px 15px; height: 86px; width: 108px; background-color: 					  																							 ';
			html += '		  						{{tarefa.STATUS == 0 ? \'#a59c9c;\' : \'\'}} {{tarefa.STATUS == 1 ? \'green;\' : \'\'}} 					  																							';
			html += '		  						{{tarefa.STATUS == 2 ? \'red;\' : \'\'}};;color: white; cursor: pointer; padding: 9px;font-size: 9px; 		  																							 ';
			html += '		  						font-weight: bolder; text-overflow: ellipsis; overflow: hidden; border: 1px solid white; white-space: normal;">																							 ';
			html += '		  						<span> {{tarefa.DESCRICAO}}</span>  																		  																							 ';
			html += '		  					</div>																											  																							 ';
			html += '		  					<div style="padding: 2px; display: inline-flex; flex-direction: column; justify-content: space-between; border-radius: 0px 13px 13px 0px; border: 1px solid white; width: 42px;"> 							 ';
			html += '		  						<button class="btn btn-success btn-sm" ng-if="tarefa.STATUS == 0 || tarefa.STATUS == 2" 					  																							 ';
			html += '		  							ng-click="'+that._object+'.TAREFA_SELECTED = tarefa; '+that._object+'.opcaoAprovar();" style="border-radius: 0px 9px 2px 2px;																		 ';
			html += '		  							 border: 1px solid white;"> <span class="glyphicon glyphicon-ok"></span></button> 																													 ';			
			html += '		  						<button class="btn btn-warning btn-sm" ng-if="tarefa.STATUS == 2 && tarefa.MOTIVO_RECUSA != \'\'" ng-click="'+that._object+'.TAREFA_SELECTED = tarefa; '+that._object+'.opcaoVerMotivo(2);" 			 ';
			html += '		  							style=" border-radius: 0px 0px 0px 2px; border: 1px solid white;"> <span class="glyphicon glyphicon glyphicon-list-alt"></span></button> 															 ';
			html += '		  						<button class="btn btn-warning btn-sm" ng-if="tarefa.STATUS == 0 && tarefa.MOTIVO_RETORNO != \'\'" ng-click="'+that._object+'.TAREFA_SELECTED = tarefa; '+that._object+'.opcaoVerMotivo(1);" 			 ';
			html += '		  							style=" border-radius: 0px 0px 0px 2px; border: 1px solid white;"> <span class="glyphicon glyphicon glyphicon-list-alt"></span></button> 															 ';
			html += '		  						<button class="btn btn-danger  btn-sm" ng-if="tarefa.STATUS == 0" ng-click="'+that._object+'.TAREFA_SELECTED = tarefa; '+that._object+'.opcaoRecusar();"												 ';
			html += '		  							style="border: 1px solid white; border-radius: {{$first ? \'0px 0px 10px 2px\' : \'\'}}"> <span class="glyphicon glyphicon-remove"></span></button>													 ';
			html += '		  						<button class="btn btn-warning btn-sm" ng-if="tarefa.ORDEM   > 1 && tarefa.STATUS == 0" ng-click="'+that._object+'.TAREFA_SELECTED = tarefa; '+that._object+'.opcaoVoltar();" 							 ';
			html += '		  							style=" border-radius: 0px 0px 10px 2px; border: 1px solid white;"> <span class="glyphicon glyphicon-chevron-left"></span></button> 																 ';
			html += '		  					</div>																																																		 ';
			html += '		  				</div>																																																			 ';
			html += '		  				<span class="glyphicon glyphicon-chevron-right" ng-if="!$last" style="font-size: 20px; margin-top: 30px; margin-left: 10px;"></span>																			 ';
			html += '		  				<div ng-repeat-end></div>																																														 ';			
			html += '		  		     </div>																																																				 ';
			html += '		 	    <br ng-if="'+that._object+'.SELECTED.TAREFAS.length > 0"><div ng-if="'+that._object+'.SELECTED.TAREFAS.length > 0" class="legenda_padrao" style="margin-top: 20px !important;">	 										 ';
			html += '		 		 		<span style="font-weight: bold;">Situação:</span>	 																																			 			 	 ';
			html += '		 		 		<span style="margin-top: 4px;" class="t-status status_fluxo_operacional-0"></span>																														 		 ';
			html += '		 		 		<span style="margin-left: 1px;margin-right: 5px;">Pendente</span>	 																																	 		 ';
			html += '		 		 		<span style="margin-top: 4px;" class="t-status status_fluxo_operacional-1"></span>																														 		 ';
			html += '		 		 		<span style="margin-left: 1px;margin-right: 5px;">Aprovado</span>	 																																	 		 ';
			html += '		 		 		<span style="margin-top: 4px;" class="t-status status_fluxo_operacional-2"></span>																														 		 ';
			html += '		 		 		<span style="margin-left: 1px;margin-right: 5px;">Recusado</span> 																																		 		 ';
			html += '		 		 	</div> 																																																			 	 ';
			html += '					<div class="panel panel-primary" style="margin-bottom: 5px !important; margin-top: 20px;"> 																															 ';
			html += '						<div class="panel-heading collapsed" style="cursor: pointer !important;" tabindex="-1" id="containerSolicitacoes1" data-toggle="collapse" data-target="#dadosSolicitacoes1" aria-expanded="true" 				 ';
			html += '							aria-controls="dadosSolicitacoes1" ng-click="'+that._object+'.changePainel(\'dadosSolicitacoes1\');">																										 ';
			html += '							<h3 class="panel-title">Solicitações																																										 ';
			html += '								<i class="fa fa-chevron-circle-down" style="float: right; cursor: pointer;"																																 ';
			html += '								ng-class="{\'fa-chevron-circle-down\': !vm.PANEL_SOLICITACOES_ABERTO,																																	 ';
			html += '											\'fa-chevron-circle-up\': vm.PANEL_SOLICITACOES_ABERTO}" aria-hidden="true">																												 ';
			html += '								</i></h3>																																																 ';
			html += '						</div> 																																																			 ';
			html += '						<div class="panel-body collapse" id="dadosSolicitacoes1" aria-expanded="false" style="padding: 30px;">																											 ';
			html += '							<div class="row">																																															 ';
			html += '							  	<div class="'+that.tabela_id+'" id="'+that.tabela_id+'">   	</div>													  		  																			 ';
			html += '							</div>																																																		 ';
			html += '						</div>																																																			 ';
			html += '					</div>																																																				 ';
            html += '			</div>                                                                                                                	  																									 ';			
            html += '		</div>                                                                                                                    																										 ';
            html += '	</div>                                                                                                                        																										 ';
            html += '</div>                                                                                                                 	      																										 ';

            return html;	

        };

	    FluxoOperacional.prototype.html_login = function(){

            var that = this;
            
            var html = '';
            
            html += '<div class="modal fade" id="modal-fluxo-operacional-login" role="dialog" data-keyboard="false" data-backdrop="static">           							 	';
            html += '	<div class="modal-dialog {{'+that._object+'.ARGS.OPCAO_TAREFA == 1 ? \'modal-sm\' : \'modal-lg\'}}}" role="document" style="height: calc(100% - 70px);"> 	';
            html += '		<div class="modal-content">							                                                                     								';
            html += '			<div class="modal-header">                                                                                           								';
            html += '				<div class="modal-header-left">                                                                                  								';
            html += '					<h4 class="modal-title" id="myModalLabel">Atenção</h4>                                         				 								';
            html += '				</div>                                                                                                           								';
            html += '				<div class="modal-header-center">                                                                                								';
            html += '				</div>                                                                                                           								';
            html += '				<div class="modal-header-right">                                                                                 								';
            html += '					<button type="button" class="btn btn-default btn-voltar" data-hotkey="esc" data-dismiss="modal"			  	 								';
			html += '						ng-disabled="'+that._object+'.consultando_operacao_progresso == true">              					 								';
            html += '						<span class="glyphicon glyphicon-chevron-left"></span>                                                   								';
            html += '						Voltar                                                                                                   								';
            html += '					</button>                                                                                                    								';
            html += '				</div>                                                                                                           								';
            html += '			</div>                                                                                                               								';
			html += '			 <div class="modal-body">                                                                        					 								';			
			html += '				<div class="table-filter collapse in" aria-expanded="true"  ng-if="'+that._object+'.ARGS.OPCAO_TAREFA == 2"           							';
			html += '				   style="margin-bottom: 4px; background: rgba(221,221,221,.33);                              			 		 					  		   ';
			html += '				  		padding: 2px 10px 7px; border-radius: 5px; display: flex;">                            			 		 								';
			html += '				    <div class="form-group" style="min-width: 160px;">					     			      					 								';
			html += '				   	  <textarea rows="10" cols="100" style="width: 100% !important; height: 100% !important;"				  	 								'; 
			html += '				   	  	  placeholder="Informe um motivo para recusa" class="form-control motivo_recusa"  		  	  	 		 								'; 
			html += '						  ng-model="'+that._object+'.MOTIVO_RECUSA">                            					  	  		 								';
			html += '						  </textarea>                                                                                    		 								';
			html += '				    </div>                                                                                      			  	 								';
			html += '				</div>																										  	 								';
			html += '				<div class="table-filter collapse in" aria-expanded="true" ng-if="'+that._object+'.ARGS.OPCAO_TAREFA == 3"         								';
			html += '				   style="margin-bottom: 4px; background: rgba(221,221,221,.33);                              			 		 					  		   ';
			html += '				  		padding: 2px 10px 7px; border-radius: 5px; display: flex;">                            			 		 								';
			html += '				    <div class="form-group" style="min-width: 160px;">					     			      					 								';
			html += '				   	  <textarea rows="10" cols="100" style="width: 100% !important; height: 100% !important;"				  	 								'; 
			html += '				   	  	  placeholder="Informe um motivo para retorno" class="form-control motivo_retorno" 		  	  	 		 								'; 
			html += '						  ng-model="'+that._object+'.MOTIVO_RETORNO">                            					  	  		 								';
			html += '						  </textarea>                                                                                    		 								';
			html += '				    </div>                                                                                      			  	 								';
			html += '				</div>																										  	 								';
			html += '				<div class="table-filter collapse in" aria-expanded="true"                      								 								';
			html += '				   style="margin-bottom: 4px; background: rgba(221,221,221,.33);                              			 		 					  		   ';
			html += '				  		padding: 2px 10px 7px; border-radius: 5px; display: flex;">                            			 		 								';
			html += '				    <div class="form-group" style="padding-top: 15px; min-width: 160px;">					     			     								';
			html += '				   	  <input type="text"                                                                 					  	 								';
			html += '						  style="width: 100% !important; min-width: 170px; 														 								';
			html += '						  height: 26px !important; text-security: disc; -webkit-text-security: disc;"	  	      				 								';
			html += '						  placeholder="Senha do Responsável" autocomplete="off"                     						  	 								';
			html += '						  ng-keydown="$event.keyCode === 13 && '+that._object+'.atalhoValidarUsuario(10)"					  	 								';
			html += '						  class="form-control normal-case" id="auth_key_validation" name="auth_key_validation"			  	  	 								'; 
			html += '						  ng-model="'+that._object+'.SENHA_INFORMADA">                                   					  	 								';
			html += '				    </div>                                                                                      			  	 								';
			html += '				                                                                                            			  	  	 								';
			html += '				    <div class="form-group" style="padding-top: 15px; width: fit-content; padding-right: 10px;">			  	 								';
			html += '					  <button type="button" ng-disabled="'+that._object+'.consultando_operacao_progresso == true"			  	 								';
			html += '						  class="btn btn-xs btn-primary btn-filtrar" ng-click="'+that._object+'.validarUsuario(10)" 		  	 								';
			html += '						  id="btn-table-logar-responsavel">												              	      	 								';
			html += '						  <span class="glyphicon glyphicon-ok"></span> Confirmar                            				  	 								';
			html += '				  	  </button>                                                                               			      	 								';
			html += '				    </div>	                                                                                    			  	 								';
			html += '				</div>																										  	 								';
			html += '			</div>                                                                                                               								';
            html += '		</div>                                                                                                                   								';
            html += '	</div>                                                                                                                       								';
            html += '</div>                                                                                                                 	     								';

            return html;	

        };   

	    FluxoOperacional.prototype.html_historico = function(){

            var that = this;
            
            var html = '';
            
            html += '<div class="modal fade" id="modal-fluxo-operacional-historico" role="dialog" data-keyboard="false" data-backdrop="static">       ';
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
			html += ' 				 <form ng-submit="'+that._object+'.consultar(10)" class="form-inline">	                      					  ';
			html += ' 				   <div class="table-filter collapse in" aria-expanded="true"                      								  ';
			html += '						 style="margin-bottom: 4px; background: rgba(221,221,221,.33);                              			 ';
			html += '								padding: 2px 10px 7px; border-radius: 5px;">                                        			  ';
			html += '						<div class="form-group" style="width: calc(65%); padding-top: 15px; min-width: 200px;">     			  ';
			html += '							<input type="text" style="width: 100% !important; min-width: 170px; height: 26px !important;"		  ';
			html += '								placeholder="Filtragem por Usuário e Histórico"                                      			  ';
			html += '								ng-keydown="$event.keyCode === 13 && '+that._object+'.consultarHistorico(10)"					  ';
			html += '								class="form-control input-maior"                                        						  ';
			html += '								ng-model="'+that._object+'.FILTRO_DADOS">                                   					  ';
			html += '						</div>                                                                                      			  ';
			html += '						<div class="form-group" style="width: calc(15%); padding-top: 15px; min-width: 75px;">     				  ';
			html += '							<input type="text" style="width: 100% !important; min-width: 70px; height: 26px !important;"		  ';
			html += '								placeholder="Registro ID" only-digits2											                  ';
			html += '								ng-keydown="$event.keyCode === 13 && '+that._object+'.consultarHistorico(10)"					  ';
			html += '								class="form-control input-maior"                                        						  ';
			html += '								ng-model="'+that._object+'.FILTRO_TABELA_ID">                                   				  ';
			html += '						</div>   																								  ';
			html += '						                                                                                            			  ';
			html += '						<div class="form-group" style="padding-top: 11px; width: fit-content; padding-right: 10px;">			  ';
			html += '							<button type="submit" class="btn btn-xs btn-primary btn-filtrar"                        			  ';
			html += '									data-hotkey="alt+f" id="btn-table-filter-h">                                      			  ';
			html += '								<span class="glyphicon glyphicon-filter"></span> Filtrar                            			  ';
			html += '							</button>                                                                               			  ';
			html += '						</div>	                                                                                    			  ';
			html += '					</div>																										  ';
			html += ' 				</form>	 																										  ';
			html += '				<div class="'+that.tabela2_id+'" id="'+that.tabela2_id+'">   	</div>											  ';
            html += '			</div>                                                                                                                ';
            html += '			                                                                                                                      ';
            html += '		</div>                                                                                                                    ';
            html += '	</div>                                                                                                                        ';
            html += '</div>                                                                                                                 	      ';

            return html;	

        };  

	    FluxoOperacional.prototype.html_motivo = function(){

            var that = this;
            
            var html = '';
            
            html += '<div class="modal fade" id="modal-fluxo-operacional-motivo" role="dialog" data-keyboard="false" data-backdrop="static">           							 	';
            html += '	<div class="modal-dialog modal-lg" role="document" style="height: calc(100% - 70px);"> 																		';
            html += '		<div class="modal-content">							                                                                     								';
            html += '			<div class="modal-header">                                                                                           								';
            html += '				<div class="modal-header-left">                                                                                  								';
            html += '					<h4 class="modal-title" ng-if="'+that._object+'.TIPO_MOTIVO == 1">Motivo p/ Retorno</h4> 					                              	';
			html += '					<h4 class="modal-title" ng-if="'+that._object+'.TIPO_MOTIVO == 2">Motivo p/ Recusa</h4> 					                              	';
            html += '				</div>                                                                                                           								';
            html += '				<div class="modal-header-center">                                                                                								';
            html += '				</div>                                                                                                           								';
            html += '				<div class="modal-header-right">                                                                                 								';
            html += '					<button type="button" class="btn btn-default btn-voltar" data-hotkey="esc" data-dismiss="modal"			  	 								';
			html += '						ng-disabled="'+that._object+'.consultando_operacao_progresso == true">              					 								';
            html += '						<span class="glyphicon glyphicon-chevron-left"></span>                                                   								';
            html += '						Voltar                                                                                                   								';
            html += '					</button>                                                                                                    								';
            html += '				</div>                                                                                                           								';
            html += '			</div>                                                                                                               								';
			html += '			 <div class="modal-body">                                                                        					 								';
			html += '				<div class="table-filter collapse in" aria-expanded="true" ng-if="'+that._object+'.TIPO_MOTIVO == 1"         									';
			html += '				   style="margin-bottom: 4px; background: rgba(221,221,221,.33);                              			 		 					  		   ';
			html += '				  		padding: 2px 10px 7px; border-radius: 5px; display: flex;">                            			 		 								';
			html += '				    <div class="form-group" style="min-width: 160px;">					     			      					 								';
			html += '				   	  <textarea rows="10" cols="100" style="width: 100% !important; height: 100% !important;"				  	 								'; 
			html += '				   	  	  placeholder="Informe um motivo para retorno" class="form-control motivo_retorno" 		  	  	 		 								'; 
			html += '						  ng-model="'+that._object+'.TAREFA_SELECTED.MOTIVO_RETORNO" ng-disabled="true" ng-readonly="true">                  			  	  	';
			html += '						  </textarea>                                                                                    		 								';
			html += '				    </div>                                                                                      			  	 								';
			html += '				</div>																										  	 								';
			html += '				<div class="table-filter collapse in" aria-expanded="true"  ng-if="'+that._object+'.TIPO_MOTIVO == 2"           								';
			html += '				   style="margin-bottom: 4px; background: rgba(221,221,221,.33);                              			 		 					  		   ';
			html += '				  		padding: 2px 10px 7px; border-radius: 5px; display: flex;">                            			 		 								';
			html += '				    <div class="form-group" style="min-width: 160px;">					     			      					 								';
			html += '				   	  <textarea rows="10" cols="100" style="width: 100% !important; height: 100% !important;"				  	 								'; 
			html += '				   	  	  placeholder="Informe um motivo para recusa" class="form-control motivo_recusa"  		  	  	 		 								'; 
			html += '						  ng-model="'+that._object+'.TAREFA_SELECTED.MOTIVO_RECUSA" ng-disabled="true" ng-readonly="true">                    	  	  		 	';
			html += '						  </textarea>                                                                                    		 								';
			html += '				    </div>                                                                                      			  	 								';
			html += '				</div>																										  	 								';
			html += '			</div>                                                                                                               								';
            html += '		</div>                                                                                                                   								';
            html += '	</div>                                                                                                                       								';
            html += '</div>                                                                                                                 	     								';

            return html;	

        };     
    

	    /**
	     * Return the constructor function
	     */
	    return FluxoOperacional;
	};

})(window, window.angular);