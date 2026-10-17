(function(window, angular) {
    'use strict';

	AngularFindModule.factory('Devices' , Devices );
	
    Devices.$inject = [
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

	function Devices($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce,gScope) {

        // Private variables.
        var obj = null;
        
	    /**
	     * Constructor, with class name
	     */
		function Devices() {
            
            obj = this; 

			obj.server	    = 'http://127.0.0.1:8081';
			obj.serverPrint = 'https://www.gcwebmfe.com:8080';

            obj.server_url  = obj.server + '/datasnap/rest/TServerMethods1/';
            obj.printer_url = obj.serverPrint + '/datasnap/rest/TServerMethods1/';

			obj.execComando         = execComando;
			obj.execComando2		= execComando2;
            obj.imprimirEtiqueta    = imprimirEtiqueta;
			obj.imprimirCupom       = imprimirCupom;
			obj.iniciarServidor		= iniciarServidor;
			obj.testarServer		= testarServer;
			obj.imprimirEspelhoPonto= imprimirEspelhoPonto;
			obj.imprimirRelatorio   = imprimirRelatorio;
			obj.ligarBalanca		= ligarBalanca;
			obj.desligarBalanca		= desligarBalanca;
			obj.imprimirCheque		= imprimirCheque;
			obj.pesoBalanca			= pesoBalanca;
			obj.conectarHenry		= conectarHenry;
			obj.conectarInner		= conectarInner;
			obj.lerPedidoBihands	= lerPedidoBihands;
			obj.execComandoProgress	= execComandoProgress;
			obj.htmlToPDF			= htmlToPDF;
			obj.getImpressoras		= getImpressoras;
			obj.postImpressoras1	= postImpressoras1;
			obj.postImpressoras2	= postImpressoras2;
			obj.printAuto			= printAuto;

			obj.iniciandoServer		= false;
		}
		
		function iniciarServidor(){
            var that = this;

            function executar(){
				document.location.href = "clientprint:";

				showAlert('Tentando iniciar servidor...');

				$timeout(function(){

					that.testarServer().then(function(contents){
					
						if(!contents.valido){
							
							$timeout(function(){

								that.testarServer().then(function(contents){
								
									if(!contents.valido){
										gScope.Confirme.add(1,'<h4>Erro ao iniciar</h4>',
										'O servidor de dispositivos do GCWeb não pode ser iniciado, baixar instalador?'
										, [gScope.Confirme.obtn_sim , gScope.Confirme.obtn_nao],[
											function (e, btn){
												that.iniciandoServer = false;
												document.location.href = 'https://cdn.gcweb.app.br/p/out/GCWebDevices_Setup.exe';
											},
											function (e, btn){ 
												that.iniciandoServer = false;
											},
										]);
									}else{
										showSuccess('Servidor iniciado.');
										that.iniciandoServer = false;
									}
								
								});
			
							},3000);
							
						}else{
							showSuccess('Servidor iniciado.');
							that.iniciandoServer = false;
						}
					
					});

				},3000);
			}

			if(that.iniciandoServer == false){

				that.iniciandoServer = true;

				gScope.Confirme.add(1,'<h4>Confirmação</h4>',
				'O servidor de dispositivos do GCWeb não respondeu, deseja tentar iniciar o servidor?'
				, [gScope.Confirme.obtn_sim , gScope.Confirme.obtn_nao],[
					function (e, btn){
						executar();
					},
					function (e, btn){ 
						that.iniciandoServer = false;
					},
				]);

			}
        }

		function printAuto(text) {
            var that = this;
           
			var TipoPrint = 1;
			const userAgent = window.navigator.userAgent;
			if (/Linux/.test(userAgent)) {TipoPrint = 2;}

            if(TipoPrint == 1){
                postprint(text);
            }else{
                if(TipoPrint == 2){
                    that.postImpressoras1(text);
                }else{
                    that.postImpressoras2(text);
                }
            }
        }

        function getImpressoras(){
            var that = this;

            return $q(function(resolve, reject){

                that.execComando( that.printer_url + 'getImpressoras', {CODIGO: ''}).then(function(dados){
					resolve(dados);
                });
                
            });
		}

        function postImpressoras1(etiqueta){
            var that = this;

            return $q(function(resolve, reject){

                that.execComando( that.printer_url + 'postImpressoras1', {ETIQUETA: etiqueta}).then(function(dados){
					resolve(dados);
                });
                
            });
		}

        function postImpressoras2(etiqueta){
            var that = this;

			return $q(function(resolve, reject){
				that.getImpressoras().then(function(contents){

					console.log(contents);
					that.IMPRESSORAS = contents.retorno;
					that.IMPRESSORA_SELECTED = {};

					angular.forEach(that.IMPRESSORAS, function(item, key){
						if(item.PADRAO == 1){
							that.IMPRESSORA_SELECTED = item;
						}
					});

					gScope.Confirme.add(1,'<h4>Selecione a Impressora</h4>',
					'<div class="form-group">'+
					'    <label>Impressora:</label>'+
					'    <div class="input-group">'+
					'        <select '+
					'            name="repeatSelect" '+
					'            id="repeatSelect"  '+
					'            ng-model="vm.Devices.IMPRESSORA_SELECTED">'+
					'            <option ng-value="printer" ng-repeat="printer in vm.Devices.IMPRESSORAS">{{ printer.PRINTER }}</option>'+
					'        </select>'+
					'    </div>'+
					'</div>'
					, [gScope.Confirme.obtn_sim , gScope.Confirme.obtn_nao],[
						function (e, btn){

							that.execComando( that.printer_url + 'postImpressoras2', {ETIQUETA: etiqueta, IMPRESSORA: that.IMPRESSORA_SELECTED.PRINTER}).then(function(dados){
								resolve(dados);
							});
							
						},
						function (e, btn){ 

						},
					]);

				});					
			});
		}
		
        function imprimirEtiqueta(codigo){
            var that = this;

            return $q(function(resolve, reject){

                that.execComando( that.server_url + 'imprimirEtiqueta', {CODIGO: codigo}).then(function(dados){
					resolve(dados);
                });
                
            });
		}
		
		function imprimirCheque(dados){
            var that = this;

            return $q(function(resolve, reject){

                that.execComando( that.server_url + 'imprimirCheque', dados).then(function(dados){
					resolve(dados);
                });
                
            });
        }
		
        function ligarBalanca(){
            var that = this;
            return $q(function(resolve, reject){
                that.execComando( that.server_url + 'ligarBalanca', {}).then(function(dados){
					resolve(dados);
                });
            });
		}
		
        function pesoBalanca(){
            var that = this;

            return $q(function(resolve, reject){
                that.execComando2( that.server_url + 'pesoBalanca', {}).then(function(dados){
					resolve(dados);
                });
            });
		}

        function conectarHenry(dados){
            var that = this;

            return $q(function(resolve, reject){
                that.execComando2( that.server_url + 'loginHenry', dados).then(function(dados){
					resolve(dados);
                });
            });
		}
		
		function lerPedidoBihands(dados){
            var that = this;

            return $q(function(resolve, reject){
                that.execComando2( that.server_url + 'lerPedidoBihands', dados).then(function(dados){
					resolve(dados);
                });
            });
		}

        function conectarInner(dados){
            var that = this;

            return $q(function(resolve, reject){
                that.execComando2( that.server_url + 'loginInner', dados).then(function(dados){
					resolve(dados);
                });
            });
		}

		function desligarBalanca(){
            var that = this;

            return $q(function(resolve, reject){
                that.execComando( that.server_url + 'desligarBalanca', {}).then(function(dados){
					resolve(dados);
                });
            });
		}

		function imprimirEspelhoPonto(colaboradores){
            var that = this;

            return $q(function(resolve, reject){

                that.execComando( that.server_url + 'imprimirEspelhoPonto', {COLABORADORES: colaboradores}).then(function(dados){
					resolve(dados);
                });
                
            });
		}

		function imprimirRelatorio(dados){
            var that = this;

            return $q(function(resolve, reject){

                that.execComando( that.server_url + 'imprimirRelatorio', {DADOS: dados}).then(function(dados){
					resolve(dados);
                });
                
            });
		}

		function htmlToPDF(html){
            var that = this;

            return $q(function(resolve, reject){

                that.execComandoProgress( that.server_url + 'htmlToPDF', {HTML: html}).then(function(dados){
					resolve(dados);
                });
                
            });
		}

		function imprimirCupom(codigo){
            var that = this;

            return $q(function(resolve, reject){

                that.execComando( that.server_url + 'imprimirCupom', {CODIGO: codigo}).then(function(dados){
					resolve(dados);
                });
                
            });
		}
		
		function testarServer(){
			var that = this;

			return $q(function(resolve, reject){
				var xhttp= new XMLHttpRequest();

				try{

					xhttp.onreadystatechange = function() {
						
						if (xhttp.readyState == 4 && xhttp.status == 200) {
							resolve({valido : true, retorno : ''});
						}else{
							if (xhttp.readyState == 4 && xhttp.status == 0) {
								resolve({valido : false, retorno : ''});
							}else{
								if (xhttp.readyState == 4 && xhttp.status > 200) {
									resolve({valido : false, retorno : ''});
								}
							}
						}
					};

					xhttp.open("GET", that.server , true);
					xhttp.send();

				}catch(e){
					resolve({valido : false, retorno : ''});
				}

			});

		}

		//tenta abrir o servidor
        function execComando(url, parans) {
            var that = this;
			var urlparan = '';

			if(typeof parans == 'undefined'){
				parans = [];
			}else{
				urlparan = '/' + encodeURIComponent(JSON.stringify(parans));
			}

            return $q(function(resolve, reject){
				
				var xhttp= new XMLHttpRequest();

				xhttp.onreadystatechange = function() {

					if (xhttp.readyState == 4 && xhttp.status == 0) {
						that.iniciarServidor();
						resolve({valido : false, retorno : 'Erro ao conectar com o servidor de dispositivos do GCWeb.'});	
					}else{
						
						if (xhttp.readyState == 4 && xhttp.status == 200) {
							var dados = JSON.parse(xhttp.responseText);
		
							if(typeof dados.error == 'undefined' || dados.error == ''){

								dados = JSON.parse(dados.result[0]);
			
								if(typeof dados.error == 'undefined' || dados.error == ''){
									resolve({valido : true, retorno : dados});
								}else{
									resolve({valido : false, retorno : dados});
								}
								
							}else{
								resolve({valido : false, retorno : dados});
							}
						}else{
							if (xhttp.readyState == 4 && xhttp.status != 200) {
								resolve({valido : false, retorno : {error : 'erro ao conectar'}});
							}
						}
					}
				};

				xhttp.open("GET", url + urlparan , true);
				xhttp.send();
			});

		}

		/**
		 * Setar valor do progressbar.
		 * @param {event} e
		 */
		function progressPagina(progress) {

			$('.carregando-pagina').fadeIn(200);

			$('.carregando-pagina .progress-bar')
				.attr({'aria-valuenow': progress, 'aria-valuemax': progress})
				.css('width', progress+'%');
		}

		function ocutarProgress(){
			//progress 1
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
		}

		//tenta abrir o servidor
        function execComandoProgress(url, parans) {
            var that = this;
			var urlparan = '';

			if(typeof parans == 'undefined'){
				parans = [];
			}else{
				urlparan = '/' + encodeURIComponent(JSON.stringify(parans));
			}

			progressPagina(100);

            return $q(function(resolve, reject){
				
				var xhttp= new XMLHttpRequest();

				xhttp.onreadystatechange = function() {

					if (xhttp.readyState == 4 && xhttp.status == 0) {
						that.iniciarServidor();
						resolve({valido : false, retorno : 'Erro ao conectar com o servidor de dispositivos do GCWeb.'});	
					}else{
						
						if (xhttp.readyState == 4 && xhttp.status == 200) {
							var dados = JSON.parse(xhttp.responseText);
		
							if(typeof dados.error == 'undefined' || dados.error == ''){

								dados = JSON.parse(dados.result[0]);
			
								if(typeof dados.error == 'undefined' || dados.error == ''){
									ocutarProgress();
									resolve({valido : true, retorno : dados});
								}else{
									showErro(dados.error);
									ocutarProgress();
									resolve({valido : false, retorno : dados});
								}
								
							}else{
								ocutarProgress();
								resolve({valido : false, retorno : dados});
							}
						}else{
							if (xhttp.readyState == 4 && xhttp.status != 200) {
								ocutarProgress();
								resolve({valido : false, retorno : {error : 'erro ao conectar'}});
							}
						}

						ocutarProgress();
					}
				};

				xhttp.open("GET", url + urlparan , true);
				xhttp.send();
			});

		}

		//não tenta abrir o servidor
		function execComando2(url, parans) {
            var that     = this;
			var urlparan = '';

			if(typeof parans == 'undefined'){
				parans = [];
			}else{
				urlparan = '/' + encodeURIComponent(JSON.stringify(parans));
			}

            return $q(function(resolve, reject){
				
				var xhttp= new XMLHttpRequest();

				xhttp.onreadystatechange = function() {

					if (xhttp.readyState == 4 && xhttp.status == 0) {
						resolve({valido : false, retorno : 'Erro ao conectar com o servidor de dispositivos do GCWeb.'});	
					}else{
						
						if (xhttp.readyState == 4 && xhttp.status == 200) {
							var dados = JSON.parse(xhttp.responseText);
		
							if(typeof dados.error == 'undefined' || dados.error == ''){

								dados = JSON.parse(dados.result[0]);
			
								if(typeof dados.error == 'undefined' || dados.error == ''){
									resolve({valido : true, retorno : dados});
								}else{
									resolve({valido : false, retorno : dados});
								}
								
							}else{
								resolve({valido : false, retorno : dados});
							}
						}else{
							if (xhttp.readyState == 4 && xhttp.status != 200) {
								resolve({valido : false, retorno : {error : 'erro ao conectar'}});
							}
						}
					}
				};

				xhttp.open("GET", url + urlparan , true);
				xhttp.send();
			});

		}
            
	    /**
	     * Return the constructor function
	     */
	    return Devices;
	};
	
})(window, window.angular);