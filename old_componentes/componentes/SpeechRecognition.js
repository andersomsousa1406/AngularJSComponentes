(function(window, angular) {
    'use strict';

	AngularFindModule.factory('SpeechRecognition' , SpeechRecognition );
	
	SpeechRecognition.$inject = [
		'$ajax',
		'$q',
        '$compile',
		'Upload',
        '$rootScope',
        '$timeout'
    ];

    function SpeechRecognition($ajax, $q, $compile, Upload, $rootScope, $timeout) {

        function SpeechRecognition(data) {

            LISTA_METODOS_RECOGNIZER.push(
                {
                    FUNCAO : function(msg){
                        try {
                            var menu = (msg[0]+'').replace(' ','');

                            if(Number(menu) >= 10000 && Number(menu) <= 99000){
                                window.open(urlhost+'/_'+menu, '_blank');
                            }
                        } catch (error) {
                            
                        }
                    },
                    variaveis: 1,
                    COMANDO : 'ABRIR MENU #VAR#'
                },
                {
                    FUNCAO : function(msg){
                        window.open(urlhost+'/js/gcweb.html', '_blank');
                    },
                    variaveis: 0,
                    COMANDO : 'ABRIR LOGO'
                },
                {
                    FUNCAO : function(msg){
                        var cliente = (msg[0]+'')
                        var nome = '';
                        var codigo = '';

                        if(isNumeric(cliente)){
                            codigo = cliente;
                        }else{
                            nome = cliente;
                        }

                        $ajax.post('_12201/api/consultaCliente',{ID: codigo, NOME: cliente},{contentType: 'application/json'})
                            .then(function(response) {
                                if(response.length > 0){
                                    window.open(urlhost+'/_12201?CLIENTE='+response[0].CODIGO+'&DESCLIENTE='+response[0].RAZAOSOCIAL, '_blank');
                                }else{
                                    showErro('Cliente "'+cliente+'" não encontrado');
                                } 
                            }
                        );

                    },
                    variaveis: 1,
                    COMANDO : 'ABRIR PEDIDOS #VAR#'
                },
                {
                    FUNCAO : function(msg){
                        var pedido = (msg[0]+'').replace(' ','');

                        if(isNumeric(pedido)){
                            window.open(urlhost+'/_12201?PEDIDO='+pedido, '_blank');
                        }else{
                            showErro('Pedido "'+pedido+'" não encontrado');
                        }

                    },
                    variaveis: 1,
                    COMANDO : 'ABRIR PEDIDO #VAR#'
                },
                {
                    FUNCAO : function(msg){
                        var pedido = (msg[0]+'').replace(' ','');

                        if(isNumeric(pedido)){
                            window.open(urlhost+'/_12201?PEDIDO='+pedido+'&GERAR_NOTA=1', '_blank');
                        }else{
                            showErro('Pedido "'+pedido+'" não encontrado');
                        }

                    },
                    variaveis: 1,
                    COMANDO : 'FATURAR PEDIDO #VAR#'
                }
            );

        }

        SpeechRecognition.prototype = {
            valido : false,
            executando : false,
            SpeechRecognitionObj : null,
            onstart : function(event){
                var that = this.pai;

                $rootScope.$apply(function(){
                    that.executando = true;      
                });      
            },
            comandoManual : function(msg){
                var that = this;
                that.tratarMensagem(msg);
            },
            onresult : function(event){
                var that = this.pai;
                that.interim_transcript = '';

                for (var i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {

                        $rootScope.$apply(function(){
                            that.executando = false;
                            that.tratarMensagem(event.results[i][0].transcript);
                        });

                    } else {

                        $rootScope.$apply(function(){
                            that.interim_transcript += event.results[i][0].transcript;
                        });

                    }
                }
            },
            onerror : function(event){
                var that = this.pai;

                $rootScope.$apply(function(){
                    that.executando = false;
                });

                showErro('Não foi possível ouvir o comando');
            },
            onend : function(event){
                var that = this.pai;
                
                $rootScope.$apply(function(){
                    that.executando = false;
                });
            },
            iniciar : function(){
                var that = this;

                try {
                     
                    if(that.valido == false){
                        var recognizer = new webkitSpeechRecognition();

                        that.SpeechRecognitionObj = recognizer;
                        that.SpeechRecognitionObj.pai = that;
                        that.SpeechRecognitionObj.onstart  = that.onstart;
                        that.SpeechRecognitionObj.onresult = that.onresult;
                        that.SpeechRecognitionObj.onerror  = that.onerror;
                        that.SpeechRecognitionObj.onend    = that.onend;

                        that.valido = true;
                    }

                    if(that.valido){
                        that.SpeechRecognitionObj.start();
                    }
                    
                } catch (error) {
                    showErro('Seu navegador não tem suporte');      
                }
            },
            tratarMensagem : function(msg){

                msg = (msg+'').toUpperCase();
                var tmp = msg;

                if(msg.length > 0){
                    var comando_encontrado = false;

                    angular.forEach(LISTA_METODOS_RECOGNIZER, function(item, key){
                        var textostr = (item.COMANDO+'').split("#VAR#");
                        var partes = [];

                        angular.forEach(textostr, function(tex, key1){
                            if((tex+'').length > 0){
                                partes.push(tex);
                            }
                        });

                        if(partes.length > 0){

                            var contem = 0;
                            angular.forEach(partes, function(tex, key1){
                                if((msg+'').indexOf(tex) >= 0){
                                    contem = contem + 1;
                                    tmp = tmp.replace(tex,'|');
                                }
                            });

                            if(contem == partes.length){
                                var variaveis = (tmp+'').split("|");
                                var variaveisl = [];

                                angular.forEach(variaveis, function(tex, key1){
                                    if((tex+'').length > 0){
                                        variaveisl.push(tex);
                                    }
                                });

                                if(item.variaveis == variaveisl.length){
                                    comando_encontrado = true;
                                    item.FUNCAO(variaveisl);
                                }
                            }
                        }

                    });

                    if(!comando_encontrado){
                        showErro('O comando <strong>"'+msg+'"</strong> não foi encontrado.');
                    }
                }else{
                    showErro('Não foi possível ouvir o comando');
                }
            }
        }

        return SpeechRecognition;

    }

})(window, window.angular);