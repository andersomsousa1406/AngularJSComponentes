(function(window, angular) {
    'use strict';

	AngularFindModule.factory('DevicesRequest' , DevicesRequest );
	
    DevicesRequest.$inject = [
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

	function DevicesRequest($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce,gScope) {

        // Private variables.
        var obj = null;
        
	    /**
	     * Constructor, with class name
	     */
		function DevicesRequest() {
            
            obj = this; 
            obj.developing = 0;
            obj.requestExc = requestExc;

            obj.balanca = {
                pai: obj,
                conectar: function(){
                    var that = this.pai;
                    
                    return $q(function(resolve, reject){
                        that.requestExc('GET', 'conectar', [], 'conectar_balanca').then(function(dados){
                            resolve(dados);
                        }).catch(function(e){;
                            reject(e);
                        });
                    });
                },
                desconectar: function(){
                    var that = this.pai;
                    
                    return $q(function(resolve, reject){
                        that.requestExc('GET', 'desconectar', [], 'desconectar_balanca').then(function(dados){
                            resolve(dados);
                        }).catch(function(e){;
                            reject(e);
                        });
                    });
                },
                lerPeso: function(){
                    var thet = this;
                    var that = this.pai;
                    
                    return $q(function(resolve, reject){
                        that.requestExc('GET', 'peso', [], 'peso_balanca').then(function(dados){
                            var peso = thet.tratarPeso(dados.peso);
                            resolve(peso);
                        }).catch(function(e){;
                            reject(e);
                        });
                    });
                },
                tratarPeso: function(peso){
                    var thet = this;
                    var that = this.pai;

                    var npeso = peso;

                    return npeso;
                }
            };

            obj.digital = {
                pai: obj,
                backdrop: function(open){
                    var that = this.pai;
                    var thet = this;

                    if(open){
                        let backdrop = document.getElementById('meu-backdrop');
                        if (!backdrop) {
                            // Cria o elemento
                            backdrop = document.createElement('div');
                            backdrop.id = 'meu-backdrop';
                            backdrop.style.position = 'fixed';
                            backdrop.style.top = '0';
                            backdrop.style.left = '0';
                            backdrop.style.width = '100%';
                            backdrop.style.height = '100%';
                            backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
                            backdrop.style.zIndex = '1040';
                            backdrop.style.display = 'none';
                            backdrop.style.zIndex = '9999';

                            // Adiciona ao body
                            document.body.appendChild(backdrop);
                        }

                        // Exibe
                        backdrop.style.display = 'block';
                    }else{
                        const backdrop = document.getElementById('meu-backdrop');
                        if (backdrop) {
                          backdrop.style.display = 'none';
                        }
                    }

                },
                cadastrar: function(tabela, tabela_id){
                    var that = this.pai;
                    var thet = this;

                    return $q(function(resolve, reject){

                        thet.backdrop(true);

                        that.requestExc('POST', 'capiturarDigital', {user_name: tabela, user_id: tabela_id}, 'capiturar_digital').then(function(dados1){

                            var dados = JSON.parse(dados1);

                            if(dados.DIGITAL != "" && dados.DIGITAL != "vazio" && dados.DIGITAL != null && dados.DIGITAL.length > 100){
                                thet.gravarDigital(tabela, tabela_id, dados.DIGITAL, dados.TIPO).then(function(dados2){
                                    thet.backdrop(false);
                                    resolve(dados1);
                                }).catch(function(e){
                                    thet.backdrop(false);
                                    reject(e);
                                });
                            }else{
                                thet.backdrop(false);
                                showErro("Digital não capturada, tente novamente!");
                                resolve([]);
                            }

                        }).catch(function(e){
                            thet.backdrop(false);
                            reject(e);
                        });
                    });

                },
                identificar: function(tabela, tabela_id){
                    var that = this.pai;
                    var thet = this;

                    return $q(function(resolve, reject){

                        thet.backdrop(true);

                        thet.digitaisVersao().then(function(versao){
                            that.requestExc('POST', 'identificarDigital', {version_db: versao, tabela: tabela}, 'identificar_digital').then(function(dados1){
                                var valido = false;

                                if((dados1+"").indexOf("Erro") == -1){
                                    dados1.split(',').forEach(function(dig){
                                        if(dig != ""){
                                            var digital = dig.split('.');
                                            var tab = digital[0];
                                            var id  = digital[1];

                                            if(tab == tabela && id == tabela_id){
                                                valido = true 
                                            }
                                        }
                                    });
                                }else{
                                    showErro("Digital não capturada, tente novamente!");
                                }

                                thet.backdrop(false);
                                resolve(valido);

                            }).catch(function(e){
                                thet.backdrop(false);
                                reject(e);
                            });
                        }).catch(function(e){
                            thet.backdrop(false);
                            reject(e);
                        });
                    });

                },
                removerDigital: function(digital){
                    var that = this.pai;
                    
                    var dados = {
                        digital : digital
                    };

                    return $q(function(resolve, reject){
                        $ajax.post('/digitais/remover',dados).then(function(response){                            
                            resolve(response);
                        },function(e){
                            reject(e);
                        });
                    });
                },
                gravarDigital: function(tabela, tabela_id, digitais, tipo_leitor){
                    var that = this.pai;
                    
                    var dados = {
                        TABELA      : tabela, 
                        TABELA_ID   : tabela_id, 
                        DIGITAIS    : digitais, 
                        TIPO_LEITOR : tipo_leitor
                    };

                    return $q(function(resolve, reject){
                        $ajax.post('/digitais/gravar',dados).then(function(response){                            
                            resolve(response);
                        },function(e){
                            reject(e);
                        });
                    });
                },
                digitaisVersao: function(tipo_leitor){
                    var that = this.pai;
                    
                    var dados = {
                        TIPO_LEITOR : tipo_leitor
                    };

                    return $q(function(resolve, reject){
                        $ajax.post('/digitais/versao',dados).then(function(response){
                            resolve(response.VERSAO);
                        },function(e){
                            reject(e);
                        });
                    });
                },
                getDigitais: function(tabela, tabela_id){
                    var that = this.pai;
                    
                    var dados = {
                        TABELA      : tabela,
                        TABELA_ID   : tabela_id
                    };

                    return $q(function(resolve, reject){
                        $ajax.post('/digitais/getLista',dados).then(function(response){                            
                            resolve(response);
                        },function(e){
                            reject(e);
                        });
                    });
                }
            }
            
		}

		function requestExc(method, url, dados_env) {
            var that = this;
        
            return new Promise(function(resolve, reject) {
                
                $.ajax({
                    url: "http://localhost:8433/"+url,
                    method: method,
                    timeout: 0,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(dados_env),
                    success: function (response) {
                        if(response.status == 'success'){
        
                            var ret = response.data;
        
                            resolve(ret);
                        }else{
                            reject(response.data);
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Erro na requisição:", status, error);
                        reject(error);
                    }
                });
        
            });
        }    
            
	    /**
	     * Return the constructor function
	     */
	    return DevicesRequest;

	};
	
})(window, window.angular);