(function(window, angular) {
    'use strict';

	AngularFindModule.factory('RFID' , RFID );
	
    RFID.$inject = [
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

	function RFID($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce,gScope) {

        // Private variables.
        var obj = null;
        
	    /**
	     * Constructor, with class name
	     */
		function RFID() {
            
            obj = this; 
			obj.server  = '';
            obj.LOTE    = '00';
            obj.rfid    = {};
            obj.requestExc = requestExc;

            obj.utiliza_epc_avulso      = $("._utiliza_epc").val();
            obj.sistema_mascara_ean 	= $('#_sistema_mascara_ean').val();

            obj.usar_gcweb_request      = 0;
            obj.configuracao            = {};
            obj.modal_erro_leitura      = {fechar:function(){} };
            obj.modal_leitura           = {fechar:function(){} };
            obj.modal_inventario        = {fechar:function(){} };

            obj.ZONAS_LEITURAS          = [];
            obj.ZONA_LEITURA_ID         = 0;
            obj.TIPO_SOLUCAO_RFID       = 0;
            obj.STATUS_RFID             = 0;
            obj.DADOS_ENVIAR            = {};
            obj.MOSTRANDO_ERRO          = false;

            obj.configurar              = configurar;
            obj.listarZonas             = listarZonas;
            obj.showModalLeitura        = showModalLeitura;
            obj.hideModalLeitura        = hideModalLeitura;
            obj.showModalErro           = showModalErro;
            obj.hideModalErroLeitura    = hideModalErroLeitura;
            obj.showModalInventario     = showModalInventario;
            obj.hideModalInventario     = hideModalInventario;
            obj.setDados                = setDados;
            obj.tocarAudio              = tocarAudio;
            obj.audioAlert              = new Audio('/assets/temp/mp3/incorrect.mp3?v=' + Date.now());
            obj.addConfirmeError        = addConfirmeError;

            obj.somar = function(number1, number2){
                number1 = numeral(Number(number1));
                number2 = numeral(Number(number2));
                return number1.add(number2.value()).value();
            };
                
			obj.subtrair = function(number1, number2){
                number1 = numeral(Number(number1));
                number2 = numeral(Number(number2));
                return number1.subtract(number2.value()).value();
            };

			obj.dividir = function(number1, number2){
                number1 = numeral(Number(number1));
                number2 = numeral(Number(number2));
                return number1.divide(number2.value()).value();
			};

			obj.multiplicar = function(number1, number2){
                number1 = numeral(Number(number1));
                number2 = numeral(Number(number2));
                return number1.multiply(number2.value()).value();
			};

            obj.onSetItens  = function(item){};

            obj.type_list = [
                { id: 3, tipo: 15, nome: 'itag',
                    iniciar_zona_leitura: function(that){
                        let url_zona = ''+that.ZONA.URL+'/ItagRFIDMonitor';
                        
                        return $q(function(resolve, reject){
                            that.requestExc('GET', url_zona+'/CarregaComando', 'comando=iniciar', [], 'iniciar_zona_leitura').then(function(dados){
                                console.log(dados);
                                resolve(dados);
                            }).catch(function(e){;
                                reject(e);
                            });
                        });
                    },
                    parar_zona_leitura: function(that){
                        let url_zona = ''+that.ZONA.URL+'/ItagRFIDMonitor';
                        return $q(function(resolve, reject){
                            that.requestExc('GET', url_zona+'/CarregaComando', 'comando=parar', [], 'parar_zona_leitura').then(function(dados){
                                console.log(dados);
                                resolve(dados);
                            }).catch(function(e){;
                                reject(e);
                            });
                        });
                    },
                    carregarItens: function(that){
                        let url_zona = ''+that.ZONA.URL+'/ItagRFIDMonitor';
                        return $q(function(resolve, reject){
                            that.requestExc('GET', url_zona+'/RetornaTag', '', [], 'carregarItens').then(function(dados){
                                resolve(dados);
                            }).catch(function(e){;
                                reject(e);
                            });
                        });
                    },
                    loadEPC: function(that, itens){
                        return $q(function(resolve, reject){                            
                            $ajax.post('_11821/api/loadEpcItens', {itens: itens, api_id: that.configuracao.ID, dados: that.DADOS_ENVIAR}, {new_job: true}).then(function(dados){
                                resolve(dados);
                            }).catch(function(e){
                                console.log(e);
                                reject(e);
                            })
                        });
                    },
                    iniciar_leitura: function(that){
                        var thet = this;
                        that.STATUS_RFID = 1;

                        thet.iniciar_zona_leitura(that).then(function(dados){

                            $timeout(function(){
                                thet.carregarItens(that).then(function(lista_epc){
                                    var epcs = lista_epc;
                                    
                                    thet.parar_zona_leitura(that).then(function(dados){
                                        thet.loadEPC(that, epcs).then(function(response){ 
                                            that.onSetItens(response);
                                            that.hideModalLeitura();
                                            that.hideModalErroLeitura();
                                            that.hideModalInventario();
                                        }).catch(function(e){
                                            thet.showErro(that, 'Erro ao carregar os itens.');
                                            that.STATUS_RFID = 0;
                                        });
                                    }).catch(function(e){
                                        thet.showErro(that, 'Erro ao parar a leitura.');
                                        that.STATUS_RFID = 0;
                                    });

                                }).catch(function(e){
                                    thet.showErro(that, 'Erro ao carregar os itens.');
                                    that.STATUS_RFID = 0;
                                });
                            }, 15000);

                            $timeout(function(){
                                showAlert('Leitura iniciada. Aguardando 15 segundos para captura dos EPCs.');
                            }, 15000);

                            showAlert('Leitura iniciada. Aguardando 15 segundos para captura dos EPCs.');
                            
                        }).catch(function(e){
                            thet.showErro(that, 'Erro ao iniciar a leitura.');
                            that.STATUS_RFID = 0;
                        });
                    },
                    parar_leitura: function(that){
                        this.parar_zona_leitura(that).then(function(dados){
                            console.log(dados);
                        }).catch(function(e){
                            console.log(e);
                            that.STATUS_RFID = 0;
                        });
                    },
                    itensInventario: function(that){
                        var thet = this;

                        return $q(function(resolve, reject){  
                            
                            thet.LOTE = that.INVENTARIO.ID+'';

                            $ajax.post('_11821/api/getItensInventario', {
                                CONFIGURACAO: that.configuracao,
                                INVENTARIO  : that.INVENTARIO,
                            }, {new_job: true}).then(function(response){

                                that.onSetItens(response);
                                that.hideModalLeitura();
                                that.hideModalErroLeitura();
                                that.hideModalInventario();

                            }).catch(function(e){
                                that.showModalInventario(that.INVENTARIO);

                                console.log(e);
                                reject(e);
                            })
                        });
                    },
                    iniciarInventario: function(that){
                        var thet = this;

                        return $q(function(resolve, reject){ 
                            
                            function criarNovo(){
                                $ajax.post('_11821/api/postInventario', {
                                    CONFIGURACAO: that.configuracao,
                                    INVENTARIO  : that.INVENTARIO,
                                }, {new_job: true}).then(function(dados){
                                    that.INVENTARIO = dados;
                                    that.showModalInventario(dados);
                                }).catch(function(e){
                                    console.log(e);
                                    reject(e);
                                });
                            }

                            function getExistente(){
                                that.hideModalLeitura();
                                that.rfid.itensInventario(that);
                            }

                            thet.modal_leitura_inv = gScope.Confirme.add(1,'<h4>Leitura de inventário</h4>',`
                            Informe um <strong>ID</strong> de inventário e click em <strong>Importar Itens</strong>, ou click em <strong>Criar Novo</strong> para criar um novo inventário.:

                            <br><br>

                            <div class="form-group">
                                <input 
                                    type="text" 
                                    class="form-control input-medio valor-id-inventario" 
                                    id="valor-id-inventario"
                                    ng-number-format="0" 
                                    min="0" 
                                    max="99999" 
                                    step="1" 
                                    ng-model="vm.RFID.INVENTARIO.ID" 
                                    style="text-align: right;"
                                >
                            </div>
                            `, [
                                {desc:'Cancelar'        , class:'btn-danger'  , ret:'2', hotkey:'esc'   ,glyphicon:'glyphicon glyphicon-ban-circle'},
                                {desc:'Criar Novo'      , class:'btn-success' , ret:'1', hotkey:'f2'    ,glyphicon:'glyphicon glyphicon-plus'      },
                                {desc:'Importar Itens'  , class:'btn-success' , ret:'1', hotkey:'enter' ,glyphicon:'glyphicon glyphicon-ok'        }
                            ], [
                                function (e, btn){ 						
                                    that.hideModalLeitura();
                                },
                                function (e, btn){ 						
                                    criarNovo();
                                },
                                function (e, btn){ 	
                                    if(typeof that.INVENTARIO.ID == 'undefined' || that.INVENTARIO.ID == 0){
                                        that.showModalErro('Informe um ID de inventário.');
                                    }else{
                                        getExistente();
                                    }
                                }
                            ],'S', 'epc-avulso-confirmacao');

                            $timeout(function(){
                                $('#valor-id-inventario').trigger( "focus" ).select();
                            }, 1000);

                            $timeout(function(){
                                $('#valor-id-inventario').trigger( "focus" ).select();
                            }, 2000);

                        });
                    },
                    showErro: function(that, erro){
                        that.showModalErro(erro);
                    }
                },

                { id: 3, tipo: 8, nome: 'votu-iframe',

                    login: function(that, itens){
                        let dados = {
                            CONFIGURACAO: that.configuracao,
                            METODO: {
                                TIPO: 0,
                                DESCRICAO: 'Login'
                            }
                        };

                        return $q(function(resolve, reject){                            
                            $ajax.post('_11821/api/executarMetodo', dados, {new_job: true}).then(function(dados){
                                resolve(dados);
                            }).catch(function(e){
                                console.log(e);
                                reject(e);
                            })
                        });
                    },

                    iniciar_zona_leitura: function(that){

                    },
                    parar_zona_leitura: function(that){

                    },
                    carregarItens: function(that){
                       
                    },
                    loadEPC: function(that, itens){
                        return $q(function(resolve, reject){                            
                            $ajax.post('_11821/api/loadEpcValidacao', {itens: itens, api_id: that.configuracao.ID, dados: that.DADOS_ENVIAR}, {new_job: true}).then(function(dados){
                                resolve(dados);
                            }).catch(function(e){
                                console.log(e);
                                reject(e);
                            })
                        });
                    },
                    iniciar_leitura: function(that){
                        
                    },
                    parar_leitura: function(that){
                        
                    },
                    itensInventario: function(that){
                        
                    },
                    iniciarInventario: function(that){
                        
                    },
                    showErro: function(that, erro){
                        that.showModalErro(erro);
                    }
                }
            ];

            obj.epcAvulso = {
                that: obj,
                QUANTIDADE_SIMPLIFICADA     : 1,
                EPC_SIMPLIFICADO            : '',
                BIPAGEM_INVERSA             : false,
                EXIBIR_DESCRICAO            : false,
                VISUALIZAR_EST_DISPONIVEL   : false,
                VISUALIZAR_VALOR_UNITARIO   : false,
                EXIBIR_BIPAGEM_INVERSA      : true,
                VISUALIZAR_LOTE             : false,
                CONFERENCIA                 : false,
                PRECO_PDV                   : false,
                ITENS_INCLUIR               : [],
                ITENS_LISTA                 : [],
                LOTE                        : '0',
                QUANTIDADE_TOTAL            : 0,
                QUANTIDADE_TOTAL_ITENS      : 0,
                QUANTIDADE_TOTAL_CONFERIDA  : 0,
                QUANTIDADE_TOTAL_CONFERIR   : 0,
                LOCALIZACAO_ID              : 0,
                ESTABELECIMENTO_ID          : 0,
                TABELA_PRECO_ID             : 0,
                PERFIL_PEDIDO               : '',
                SEND                        : {},
                focus: function(){
                    $timeout(function(){
                        $('#imput-codigo-epc').trigger("focus");                        
                    }, 600);
                },
                getConfiguracao: function(){
                    //deve sobrescrever esse metodo com o carregamento da configuração do sistema
                    
                },
                iniciar: function(paran){

                    var itens           = typeof paran.itens            == 'undefined' ? []     : paran.itens;
                    var ver_lote        = typeof paran.ver_lote         == 'undefined' ? false  : paran.ver_lote;
                    var ver_estoque     = typeof paran.ver_estoque      == 'undefined' ? false  : paran.ver_estoque;
                    var ver_remover     = typeof paran.ver_remover      == 'undefined' ? false  : paran.ver_remover;
                    var ver_valor       = typeof paran.ver_valor        == 'undefined' ? false  : paran.ver_valor;
                    var conferencia     = typeof paran.conferencia      == 'undefined' ? false  : paran.conferencia;
                    var conf_completa   = typeof paran.conf_completa    == 'undefined' ? true   : paran.conf_completa;
                    var preco_pdv       = typeof paran.preco_pdv        == 'undefined' ? false  : paran.preco_pdv;
                    var info_pedido     = typeof paran.info_pedido      == 'undefined' ? false  : paran.info_pedido;
                    var info_pdv        = typeof paran.info_pdv         == 'undefined' ? false  : paran.info_pdv;
                    
                    this.ITENS_INCLUIR             = [];
                    this.ITENS_LISTA               = itens.length > 0 ? angular.copy(itens) : [];
                    this.CONFERENCIA               = conferencia;
                    this.CONF_COMPLETA             = conf_completa;

                    this.LOTE                      = '';
                    this.EPC_SIMPLIFICADO          = '';

                    this.BIPAGEM_INVERSA           = false;
                    this.EXIBIR_DESCRICAO          = false;

                    this.QUANTIDADE_TOTAL          = 0;
                    this.QUANTIDADE_TOTAL_ITENS    = 0;
                    this.QUANTIDADE_TOTAL_CONFERIDA= 0;
                    this.QUANTIDADE_TOTAL_CONFERIR = 0;

                    this.VISUALIZAR_LOTE           = ver_lote;
                    this.VISUALIZAR_EST_DISPONIVEL = ver_estoque;
                    this.EXIBIR_BIPAGEM_INVERSA    = ver_remover;
                    this.VISUALIZAR_VALOR_UNITARIO = ver_valor;
                    this.PRECO_PDV                 = preco_pdv;
                    this.INFO_PEDIDO               = info_pedido;
                    this.INFO_PDV                  = info_pdv;

                    if(this.CONFERENCIA){
                        
                        this.EXIBIR_DESCRICAO = true;

                        this.ITENS_LISTA.forEach((item) => {
                            item.STATUS = 0;
                            item.CONFERIDO = 0;
                            item.EPCS = [];

                            this.QUANTIDADE_TOTAL_CONFERIR = this.that.somar(this.QUANTIDADE_TOTAL_CONFERIR, item.QUANTIDADE);
                        });

                        if(this.QUANTIDADE_TOTAL_CONFERIR > 0){
                            $('#ItensEPC-Avulso').modal('show');
                            this.focus();
                        }else{
                            this.that.addConfirmeError("Nenhum item encontrado na lista de conferência.").then(() => {
                                this.focus();
                            });
                        }

                    }else{

                        $('#ItensEPC-Avulso').modal('show');
                        this.focus();
                    }

                },
                onAddItens: function(itens, itens_erro){
                    return $q((resolve, reject) => {
                        resolve();
                    });
                },
                onRemoverItens: function(itens, itens_erro){
                    return $q((resolve, reject) => {
                        resolve();
                    });
                },
                gravar: function(){
                    if(this.ITENS_INCLUIR.length > 0){

                        this.ITENS_INCLUIR.forEach((item) => {
                            item.LOTE = trim_null(this.LOTE) == '' ? '0' : this.LOTE;
                            item.NAO_ENCONTRADO = 0;
                        });

                        if(!this.CONFERENCIA){
                            this.consultarListaProdutoEpc().then((retorno) => {
                                
                                if(retorno.ITENS_ERRO.length > 0){
                                    this.AbrirModalErro(retorno.ITENS_ERRO);
                                }

                                if(this.BIPAGEM_INVERSA){
                                    this.onRemoverItens(retorno.ITENS, retorno.ITENS_ERRO).then(() => {
                                        this.fechar();
                                    });
                                }else{
                                    this.onAddItens(retorno.ITENS, retorno.ITENS_ERRO).then(() => {
                                        this.fechar();
                                    });
                                }
                            });
                        }else{

                            var qtd_total = this.QUANTIDADE_TOTAL_CONFERIR;
                            var qtd_conferida = this.QUANTIDADE_TOTAL_CONFERIDA;

                            if(qtd_total == qtd_conferida || this.CONF_COMPLETA == false){
                                this.onAddItens(this.ITENS_INCLUIR, []).then(() => {
                                    this.fechar();
                                });
                            }else{
                                this.that.addConfirmeError("Quantidade total a ser conferida: " + qtd_total + ". Quantidade conferida: " + qtd_conferida + ".").then(() => {
                                    this.focus();
                                });
                            }
                        }

                    }else{
                        showErro("Nenhum item foi adicionado.");
                    }
                },
                fechar: function(){
                    $('#ItensEPC-Avulso').modal('hide');
                },
                fecharErro: function(){
                    $('#ItensEPC-Avulso-erro').modal('hide');
                },
                excluir: function($index, $event, item){
                    var validacao = this.validarItemExcluir(item);

                    if(validacao.STATUS){
                        var index = this.ITENS_INCLUIR.indexOf(item);

                        if(index > -1){
                            this.QUANTIDADE_TOTAL           = this.that.subtrair(this.QUANTIDADE_TOTAL, item.QUANTIDADE);
                            this.QUANTIDADE_TOTAL_ITENS     = this.that.subtrair(this.QUANTIDADE_TOTAL_ITENS, item.QUANTIDADE);
                            this.ITENS_INCLUIR.splice(index, 1);
                        }

                        this.focus();
                    }else{
                        this.that.addConfirmeError(validacao.MSG).then(() => {
                            this.EPC_SIMPLIFICADO = '';
                            this.focus();
                        });
                    }
                }, 
                AvaliarEPC: function($event){
                    
                    if($event.keyCode === 13){

                        if(trim_null(this.EPC_SIMPLIFICADO).length > 20){

                            var jaNaLista = this.jaNaLista(this.EPC_SIMPLIFICADO);

                            if(!jaNaLista){
                                if(this.EXIBIR_DESCRICAO != true){
                                    this.addListaItens();
                                }else{
                                    this.consultarProdutoEpc();
                                }
                            }else{
                                this.that.addConfirmeError("EPC " + angular.copy(this.EPC_SIMPLIFICADO) + ' já adicionado na lista.').then(() => {
                                    this.EPC_SIMPLIFICADO = '';
                                    this.focus();
                                });
                            }

                        }else{
                            this.that.addConfirmeError("EPC " + angular.copy(this.EPC_SIMPLIFICADO) + ' inválido.').then(() => {
                                this.EPC_SIMPLIFICADO = '';
                                this.focus();
                            });
                        } 
                    }
                    
                },
                jaNaLista: function(EPC){
                    var existe = false;
                    this.ITENS_INCLUIR.forEach(function(item){
                        if(item.EPC == EPC){
                            existe = true;
                        }
                    });
                    return existe;
                },
                addListaItens: function(response){

                    var item = {
                        EPC		 	   : angular.copy(this.EPC_SIMPLIFICADO),
                        EAN		 	   : '',
                        DESCRICAO	   : '',
                        SALDO	 	   : 0,
                        TAMANHO  	   : 0,
                        DESC_TAMANHO   : '',
                        VALOR_UNITARIO : 0,
                        QUANTIDADE     : angular.copy(this.QUANTIDADE_SIMPLIFICADA),
                        CONSULTADO     : false,
                        MODELO_ID      : 0,
                        COR_ID         : 0,
                    };

                    if(typeof response != 'undefined'){
                        item = {
                            EPC		 	  : response.EPC,
                            EAN		 	  : response.EAN,
                            DESCRICAO	  : response.DESCRICAO,
                            SALDO	 	  : response.SALDO,
                            TAMANHO  	  : response.TAMANHO,
                            DESC_TAMANHO  : response.DESC_TAMANHO,
                            VALOR_UNITARIO: response.VALOR_UNITARIO,
                            MODELO_ID     : response.MODELO_ID,
                            COR_ID        : response.COR_ID,
                            QUANTIDADE    : this.QUANTIDADE_SIMPLIFICADA,
                            CONSULTADO    : true
                        };
                    }
                    
                    var validacao = this.validarItemIncluir(item);

                    if(validacao.STATUS && this.CONFERENCIA){
                        validacao = this.validarItemConferencia(item);
                    }

                    if(validacao.STATUS){

                        this.QUANTIDADE_TOTAL           = this.that.somar(this.QUANTIDADE_TOTAL, item.QUANTIDADE);
                        this.QUANTIDADE_TOTAL_ITENS     = this.that.somar(this.QUANTIDADE_TOTAL_ITENS, item.QUANTIDADE);

                        this.EPC_SIMPLIFICADO           = '';
                        this.QUANTIDADE_SIMPLIFICADA    = 1;

                        this.ITENS_INCLUIR.push(item);

                        if(this.CONFERENCIA){
                            this.ITENS_LISTA.forEach((item_lista) => {
                                if(
                                    item.MODELO_ID  == item_lista.MODELO_ID &&
                                    item.COR_ID     == item_lista.COR_ID    &&   
                                    item.TAMANHO    == item_lista.TAMANHO
                                ){

                                    item_lista.EPCS.push({EPC: item.EPC, QUANTIDADE: item.QUANTIDADE});
                                    item_lista.CONFERIDO = this.that.somar(item_lista.CONFERIDO, item.QUANTIDADE);
                                    this.QUANTIDADE_TOTAL_CONFERIDA = this.that.somar(this.QUANTIDADE_TOTAL_CONFERIDA, item.QUANTIDADE);

                                    if(item_lista.CONFERIDO == item_lista.QUANTIDADE){
                                        item_lista.STATUS = 1; //conferido
                                    }
                                }
                            });
                        }

                    }else{
                        this.that.addConfirmeError(validacao.MSG).then(() => {
                            this.EPC_SIMPLIFICADO = '';
                            this.focus();
                        });
                    }
                    
                },
                validarItemConferencia : function(item){
                    var encontrado = false;
                    var com_saldo  = false;

                    this.ITENS_LISTA.forEach((item_lista) => {
                        if(
                            item.MODELO_ID  == item_lista.MODELO_ID &&
                            item.COR_ID     == item_lista.COR_ID    &&   
                            item.TAMANHO    == item_lista.TAMANHO
                        ){
                            encontrado = true;

                            if(item_lista.CONFERIDO < item_lista.QUANTIDADE){
                                com_saldo = true;
                            }
                        }
                    });

                    if(!encontrado){
                        return {STATUS: false, MSG: 'Item não encontrado na lista de conferência.'};
                    }else if(!com_saldo){
                        return {STATUS: false, MSG: 'Item já conferido.'};
                    }

                    return {STATUS: true, MSG: ''};
                },
                validarItemGravar: function(item){
                    /* Deve criar um metodo de validação dos itens */
                    return {STATUS: true, MSG: ''};
                },
                validarItemIncluir: function(item){
                    /* Deve criar um metodo de validação dos itens */
                    return {STATUS: true, MSG: ''};
                },
                validarItemExcluir: function(item){
                    /* Deve criar um metodo de validação dos itens */
                    return {STATUS: true, MSG: ''};
                },
                getRequest(com_itens){
                    this.SEND = {};

                    this.getConfiguracao();
                    var dados = angular.copy(this.SEND);

                    if(com_itens){
                        dados.ITENS = this.ITENS_INCLUIR;
                    }

                    dados.EPC   		    = this.EPC_SIMPLIFICADO;
                    dados.LOC	  		    = this.LOCALIZACAO_ID;
                    dados.ESTAB 		    = this.ESTABELECIMENTO_ID;
                    dados.TABELA_PRECO_ID   = this.TABELA_PRECO_ID;
                    dados.PERFIL		    = this.PERFIL_PEDIDO;
                    dados.VIS   		    = this.VISUALIZAR_EST_DISPONIVEL;
                    dados.PRECO_PDV         = this.PRECO_PDV   ? '1' : '0';
                    dados.INFO_PEDIDO       = this.INFO_PEDIDO ? '1' : '0';
                    dados.INFO_PDV          = this.INFO_PDV    ? '1' : '0';

                    return dados;
                },
                consultarProdutoEpc: function(){

                    return $q((resolve, reject) => {

                        var dados = this.getRequest(false);

                        var ean = angular.copy(this.EPC_SIMPLIFICADO);
                        this.EPC_SIMPLIFICADO = '';

                        $ajax.post('/rfid/consultarProdutoEPC',dados, {new_job: true}).then((response) => {

                            if(response.length > 0){
                                response = response[0];
                                this.addListaItens(response);
                                resolve(response);
                            }else{
                                this.that.addConfirmeError("EPC " + angular.copy(ean) + ' não encontrado na base de dados').then(() => {
                                    this.EPC_SIMPLIFICADO = '';
                                    this.focus();
                                });
                            }

                        },function(e){
                            reject(e);
                        });

                    });
                },
                consultarListaProdutoEpc: function(){

                    return $q((resolve, reject) => {

                        var dados = this.getRequest(true);

                        this.EPC_SIMPLIFICADO = '';

                        $ajax.post('/rfid/consultarListaProdutoEPC',dados, {new_job: true}).then((response) => {

                            if(response.length > 0){
                                var itens = [];
                                var itens_erro = [];

                                response.forEach((item) => {
                                    var validacao = this.validarItemGravar(item);

                                    if(item.CONSULTADO == true && validacao.STATUS == true){
                                        item.STATUS_ERRO = false;
                                        item.MSG = '';
                                        itens.push(item);
                                    }else{
                                        item.STATUS_ERRO = true;
                                        item.MSG = item.CONSULTADO ? validacao.MSG : 'EPC não encontrado na base de dados';
                                        itens_erro.push(item);
                                    }
                                });

                                resolve({ITENS: itens, ITENS_ERRO: itens_erro});
                            }else{
                                this.that.addConfirmeError('Erro ao gravar EPC').then(() => {
                                    this.EPC_SIMPLIFICADO = '';
                                    this.focus();
                                });
                            }

                        },function(e){
                            reject(e);
                        });
                    });
                },
                AbrirModalErro : function(itens_erro){
                    this.ITENS_ERRO_LISTA = itens_erro;
                    this.QUANTIDADE_TOTAL_ERROS = 0;

                    this.ITENS_ERRO_LISTA.forEach((item) => {
                        this.QUANTIDADE_TOTAL_ERROS = this.that.somar(this.QUANTIDADE_TOTAL_ERROS, item.QUANTIDADE);
                    });

                    $('#ItensEPC-Avulso-erro').modal('show');
                },
                verListaEPC : function($event, item){

                    this.DADOS_EPC = item;

                    var msgEpcList = gScope.Confirme.add(1,'<h4 class="modal-title"><span>EPCS Lidos</span></h4>',
                    `
                        <div class="bs-callout bs-callout-danger" id="callout-glyphicons-dont-mix" style="padding-top: 5px;"> 
                            <h3 style="color: #ce4844;" class="ng-binding">{{vm.RFID.epcAvulso.DADOS_EPC.DESC_MODELO}}</h3>
                            <h4 class="ng-binding">Cor: {{vm.RFID.epcAvulso.DADOS_EPC.DESC_COR}}</h4>
                            <h4 class="ng-binding">Tam: {{vm.RFID.epcAvulso.DADOS_EPC.DESC_TAMANHO}}</h4>
                        </div>

                        <div class="col-md-12" style="padding: 0px;">
                            <div class="table-ec table-scroll" style="height: calc(100vh - 500px); overflow-anchor: none !important;">
                                <table class="table table-striped table-bordered table-condensed table-no-break table-middle table-low">
                                    <thead>
                                        <tr>
                                            <th>EPC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr 
                                            ng-repeat="item in vm.RFID.epcAvulso.DADOS_EPC.EPCS | orderBy : '$index' : true track by $index" tabindex="@{{ $index }}">
                                            <td style="text-align: center;">
                                                <span>
                                                    {{ item.EPC }} 
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>  
                                            <td style="text-align: center; font-weight: bold; position: sticky; bottom: 0; background-color: #cccccc; color: black;">
                                                <span>
                                                    Total: {{ vm.RFID.epcAvulso.DADOS_EPC.EPCS.length }} EPCs
                                                </span>
                                            </td>  
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>		
                        </div>

                    `
                    ,[
                        { desc:'Ok', class:'btn-success button-confim-error', ret:'1', hotkey:'esc', glyphicon:'glyphicon glyphicon-ok' }
                    ],[
                        function (e, btn){ 
                        }
                    ],'S', 'epc-avulso-confirmacao');

                }
            }
		}

        function setDados(dados){
            var that = this;
            that.DADOS_ENVIAR = dados;
        }

        /* toca som de alerta nos erros */
		function tocarAudio() {
			obj.audioAlert.pause();
			obj.audioAlert.currentTime = 0;

			obj.audioAlert.play().catch(function(error) {
				console.error('Erro ao reproduzir som:', error);
			});
		}

        function addConfirmeError(msg) {
			var that = this;
			that.tocarAudio();

            return $q((resolve, reject) => {
                if(that.MOSTRANDO_ERRO == false){
                    that.MOSTRANDO_ERRO = true;
                    
                    var msgCodigoEAN = gScope.Confirme.add(1,'<h4 class="modal-title"><span>Detalhes do Erro</span></h4>',
                    `<div class="bs-callout bs-callout-danger" id="callout-glyphicons-dont-mix"> 
                        <h2 style="color: #ce4844;">Erros</h2>
                        <div class="alert alert-danger" role="alert">
                        ` + msg + `
                        </div>
                    </div>`
                    ,[
                        { desc:'Ok', class:'btn-success button-confim-error', ret:'1', hotkey:'esc', glyphicon:'glyphicon glyphicon-ok' }
                    ],[
                        function (e, btn){ 
                            that.MOSTRANDO_ERRO = false;
                            resolve();
                        }
                    ],'S', 'epc-avulso-confirmacao');
                }else{
                    resolve();
                }
            });
		}

        function showModalLeitura(){
            var that = this;

            that.hideModalErroLeitura();

            that.modal_leitura = gScope.Confirme.add(1,'<h4>Leitura RFID</h4>',	
            `   <section id="open-dev" class="wrap-content open-dev" ng-class="{'open-dev-no-animation': vm.RFID.STATUS_RFID == 0}">
                    <div class="wrap-two-up wrap-two-up-middle">
                        <div class="content content-two-up">
                        <div class="open-dev-radar">
                            <div class="open-dev-radar-pulse"></div>
                            <div class="open-dev-radar-pulse"></div>
                            <div class="open-dev-radar-pulse"></div>
                            <div class="open-dev-radar-pulse"></div>
                            <div class="open-dev-badge">
                                <img src="{{url('')}}/assets/images/pdv/icone_rfid_inclusao.png">
                            </div>
                        </div>
                        </div>
                    </div>
                </section>
            `, [
                {desc:'Cancelar' , class:'btn-danger' , ret:'2', hotkey:'esc',glyphicon:'glyphicon glyphicon-ban-circle'}
            ], [
                function (e, btn){ 						
                    that.hideModalLeitura();
                }
            ],'S', 'epc-avulso-confirmacao');
        }

        function hideModalLeitura(){
            var that = this;
            that.modal_leitura.fechar(1);
            that.rfid.parar_leitura(that);
        }

        function showModalErro(erro){
            var that = this;

            that.hideModalLeitura();

            that.modal_erro_leitura = gScope.Confirme.add(1,'<h4>Erro de leitura RFID</h4>',	
            `<div>
                `+erro+`
            </div>
            `, [
                {desc:'Cancelar' , class:'btn-danger' , ret:'2', hotkey:'esc',glyphicon:'glyphicon glyphicon-ban-circle'}
            ], [
                function (e, btn){ 						
                    that.hideModalErroLeitura();
                }
            ],'S', 'epc-avulso-confirmacao');
        }
        
        function hideModalErroLeitura(){
            var that = this;
            that.modal_erro_leitura.fechar(1);
        }

        function showModalInventario(dados){
            var that = this;

            that.hideModalLeitura();

            that.modal_inventario = gScope.Confirme.add(1,'<h4>Coleta</h4>',	
            `<div class="item-inventario" style="width: 100%; text-align: center; font-size: 50px;">
                Coleta: {{vm.RFID.INVENTARIO.ID}}
            </div>
            <div  style="width: 100%; text-align: center; font-size: 15px; color: red">
                Colete as peças e salve com o id: {{vm.RFID.INVENTARIO.ID}}
            </div>
            `, [
                {desc:'Cancelar'        , class:'btn-danger'  , ret:'2', hotkey:'esc',glyphicon:'glyphicon glyphicon-ban-circle'},
                {desc:'Importar Itens'  , class:'btn-success' , ret:'1', hotkey:'esc',glyphicon:'glyphicon glyphicon-ok'}
            ], [
                function (e, btn){ 						
                    that.hideModalInventario();
                },
                function (e, btn){ 						
                    that.rfid.itensInventario(that);
                }
            ],'S', 'epc-avulso-confirmacao');
        }

        function hideModalInventario(){
            var that = this;
            that.modal_inventario.fechar(1);
        }

        function listarZonas(TABELA_PRECO_ID, ESTABELECIMENTO_ID, PERFIL_PEDIDO, descricao){
            var that = this;

            //itag
            if(that.configuracao.TIPO == 15){
                //carregar zonas de leitura
                that.ZONAS_LEITURAS = that.configuracao.ZONAS;
                //selecionar primeira zona de leitura
                if(typeof that.configuracao.ZONAS != 'undefined' && that.configuracao.ZONAS.length > 0){
                    that.ZONA_LEITURA_ID = that.configuracao.ZONAS[0].ID;
                }
            }

            if(that.configuracao.TIPO == 8){


                that.rfid.login(that).then(function(response){ 

                    console.log(response);

                    if(trim_null(response.access_token) != ''){

                        let removeBarraOrigin   = trim_null(angular.copy(that.configuracao.URL_IFRAME)).replace('br/', 'br');
                        let urlRFId             = that.configuracao.URL_IFRAME + that.configuracao.ACCESS_TOKEN + response.access_token;
                        let epcs                = [];
                        let handlerMessage = null;

                        function removerIframeVotu(){
                            const iframe = document.getElementById('iframeVotuRFID');
                            if (iframe && iframe.parentNode) {
                                iframe.parentNode.removeChild(iframe);
                            }

                            if (handlerMessage !== null) {
                                window.removeEventListener('message', handlerMessage);
                                handlerMessage = null;
                            }
                        }
    
                        var modalIframe = gScope.Confirme.add(1,'<h4>Votu RFID</h4>',			
                        '<div class="row" style="margin: 0;">'   
                            +'<div class="itens-inputs" style="width: 100%;">'   
                            + '<iframe id="iframeVotuRFID" src="'+urlRFId+'"'+
                                ' width="100%" ' +
                                ' height="100%" ' + 
                                ' style="display: block; min-height: 620px; height: calc(100vh - 265px); border: 0;" ' + 
                                ' frameborder="0"> ' +
                                '</iframe>'
                            +'</div>'					
                        +'</div>'
                        , [
                            {desc:'Cancelar' , class:'btn-danger' , ret:'2', hotkey:'esc',glyphicon:'glyphicon glyphicon-ban-circle'},					
                            {desc:'Confirmar', class:'btn-primary', ret:'1', hotkey:'f1' ,glyphicon:'glyphicon glyphicon-ok'	    },
                        ], [
                            function (e, btn){ 						
                                // Botão "Cancelar"
    
                                removerIframeVotu();
                                
                            },
                            function (e, btn){ 						
                                // Botão "Confirmar"
    
                                that.rfid.loadEPC(that, epcs).then(function(response){ 
                                    removerIframeVotu();
                                    that.onSetItens(response);
                                    that.hideModalLeitura();
                                    that.hideModalErroLeitura();
                                    that.hideModalInventario();
                                }).catch(function(e){
                                    that.showErro(that, 'Erro ao carregar os itens.');
                                });
                
                            }
                        ],'S', 'epc-confirmacao-voturfid', 'modal-big');
    
    
                        handlerMessage = function(event){
                            // Verificar origem por segurança
                            if (event.origin !== removeBarraOrigin && event.origin !== 'https://meusite') return;
                            
                            if (event.data.type === 'RFID_TAGS') {
                                console.log('Tags recebidas:', event.data.tags);
                                epcs = angular.copy(event.data.tags);
                            }
    
                        };

                        window.addEventListener('message', handlerMessage);
                    }else{
                        that.showErro(that, 'Não foi possível autenticar. Verifique as credenciais e tente novamente');
                    }
                    

                }).catch(function(e){
                    that.showErro(that, 'Não foi possível autenticar. Verifique as credenciais e tente novamente');
                });
                

                

            }else{

                var dialogo_1 = gScope.Confirme.add(1,'<h4>Selecione a Zona de Leitura</h4>',			
                '<div class="row">'   
                    +'<div class="itens-inputs" style="width: 100%;">'   
                    +'  <div class="form-group" style="margin-left: 20px;">'
                        +'      <select class="form-control" style="width: 97%;" ng-model="vm.RFID.ZONA_LEITURA_ID">'
                            +'      <option ng-repeat="zonas in vm.RFID.ZONAS_LEITURAS track by $index" ng-value="zonas.ID">{{zonas.DESCRICAO}}</option>'											
                        +'  	</select>'
                        +'  </div>'
                    +'</div>'					
                +'</div>'
                , [
                    {desc:'Cancelar' , class:'btn-danger' , ret:'2', hotkey:'esc',glyphicon:'glyphicon glyphicon-ban-circle'},					
                    {desc:'Confirmar', class:'btn-primary', ret:'1', hotkey:'f1' ,glyphicon:'glyphicon glyphicon-ok'	    },
                ], [
                    function (e, btn){ 						
                        // Botão "Cancelar"
                    },
                    function (e, btn){ 						
                        // Botaõ "Confirmar"
    
                        var dadosRFID = {
                            DADOS: {
                                TABELA_PRECO_ID     : TABELA_PRECO_ID,
                                LOCALIZACAO_ID      : that.LOCALIZACAO_ID,
                                ESTABELECIMENTO_ID  : ESTABELECIMENTO_ID,
                                PERFIL_PEDIDO       : PERFIL_PEDIDO,
                                ZONA_LEITURA_ID     : that.ZONA_LEITURA_ID
                            }
                        };
    
                        var zona = that.ZONAS_LEITURAS.filter(function(item){
                            return item.ID == that.ZONA_LEITURA_ID;
                        });
    
                        zona = typeof zona == 'undefined' ? [] : zona[0];
            
                        that.showModalLeitura();
    
                        that.ZONA = zona;
                        that.dadosRFID = dadosRFID;
    
                        var desc = ''+(typeof descricao == 'undefined' ? '' : descricao)+'';
    
                        that.INVENTARIO = {
                            DESCRICAO: 'Coleta de Peças '+desc,
                        };
    
                        that.rfid.LOTE = '00';
    
                        if(that.ZONA.TIPO == 1){
                            that.rfid.iniciar_leitura(that);	
                        }else if(that.ZONA.TIPO == 2){
                            that.rfid.iniciarInventario(that);
                        }else{
                            that.showModalErro('Tipo de Zona de Leitura não encontrado.');
                            that.STATUS_RFID = 0;
                        }			
                    }
                ],'S', 'epc-avulso-confirmacao');
            }

        }
		
        function configurar(tipo){
            var that = this;

            var api_list = $('._api_list').val();
            api_list = typeof api_list == 'undefined' ? '[]' : api_list;

            var cont = 0;

            try {
                api_list = JSON.parse(api_list);
                cont = api_list.length;
            } catch (error) {
                cont = 0;
            }

            that.LISTA_API = api_list;
            that.TIPO_SOLUCAO_RFID = tipo;

            var configuracao = {};

            that.LISTA_API.forEach(function(item, index){
                if(that.TIPO_SOLUCAO_RFID == 3 && item.TIPO == 15){
                    configuracao = item;
                }

                if(that.TIPO_SOLUCAO_RFID == 3 && item.TIPO == 8){
                    configuracao = item;
                }
            });

            if(cont > 0 && configuracao.ID > 0){
                that.configuracao = configuracao;
                that.rfid = {};

                var encontrado = false;
                that.type_list.forEach(function(item){
                    if(item.tipo == configuracao.TIPO){
                        that.rfid = item;
                        encontrado = true;
                    }
                });

                if(!encontrado){
                    showErro('Configuração de RFID não encontrada.');
                }

            }else{
                showErro('Configuração de RFID não encontrada.');
            }
        }

		function requestExc(method, url, urlparan, dados_env, fileName) {
            var that = this;
            url = url + (urlparan === '' ? '' : '?' + urlparan);
        
            return new Promise(function(resolve, reject) {

                request(method, url, dados_env, fileName, 0).then((ret) => {
                    resolve(ret);
                }).catch((err) => {
                    reject(err);
                });

            });
        }     
            
	    /**
	     * Return the constructor function
	     */
	    return RFID;

	};
	
})(window, window.angular);

