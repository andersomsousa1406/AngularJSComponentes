(function(window, angular) {
    'use strict';

	AngularFindModule.factory('Arquivos', Arquivos);
	
    Arquivos.$inject = [
        '$ajax',
        '$q',
        '$rootScope',
        '$compile',
        '$timeout',
        'Upload',
        'Confirmacao',
    ];

	function Arquivos($ajax, $q, $rootScope, $compile, $timeout, Upload, Confirmacao) {   
    
        var arquivoPadrao = {
                ID          : 0,
                NOME        : null,
                TABELA      : null,
                TAML_IMG    : null,
                TAMA_IMG    : null,
                TAM_ARQ     : null,
                TIPO        : null,
                TAMANHO     : null,
                BINARIO     : null,
                CONTEUDO    : null,
                CSS         : null
        };

		var lista = [];
	    /**
	     * Constructor, with class name
	     */
	    function Arquivos(object,arg_scope) {

            this.DADOS = [];
            this.ARGS  = {};
            this.FILTRO = '';
            this.CIMPILADO =  false;
            
            this._button_attr  = '[data-consulta-arquivos]';
            this._button       = null;
            this._modal        = function(){return $('#modal-arquivos')};
            this._controller   = function(){
            	var scope = $('#main').find('[ng-controller]').first();

            	if(scope.length == 0){
            		scope = $('#main').find('.ng-isolate-scope').first();
            	}

            	return scope; 
            };
            
            if ( object != undefined ) {
                this._object = object;
            } else {
                this._object = 'vm.Arquivos';
            }
                
            var that = this;

            var scope = null;

        	if ( arg_scope != undefined ) {
        		scope = arg_scope;
        	} else {
            	scope = that._controller().scope();
        	}

            

            that.Confirmacao = new Confirmacao();
            that.Confirme    = that.Confirmacao.getNew(this._object +'.Confirme');
            
            $(document).on('click',that._button_attr,function(){
                var button = $(this);
                $rootScope.$apply(function(){
                    
                    that._button = button;
            
                    that.ARGS = {
                        TABELA    : button.attr('data-tabela'),
                        TABELA_ID : button.attr('data-tabela-id'),
                        TAML_IMG  : button.attr('data-tamL-img'),
                        TAMA_IMG  : button.attr('data-tamA-img'),
                        TAM_ARQ   : button.attr('data-tam-arq'),
                        EXTENSAO  : button.attr('ext-permitido'),
                    }; 
                    
                    that.TABELA     = that.ARGS.TABELA;
                    that.TABELA_ID  = that.ARGS.TABELA_ID;
                    that.TAML_IMG   = trim_null(that.ARGS.TAML_IMG) == '' ? 600 : that.ARGS.TAML_IMG;
                    that.TAMA_IMG   = trim_null(that.ARGS.TAMA_IMG) == '' ? 600 : that.ARGS.TAMA_IMG;
                    that.TAM_ARQ    = trim_null(that.ARGS.TAM_ARQ)  == '' ? 5   : that.ARGS.TAM_ARQ;
                    that.EXTENSAO   = trim_null(that.ARGS.EXTENSAO) == '' ? [] : (that.ARGS.EXTENSAO.toUpperCase()).split(',');

                    that.getFiles(that.ARGS.TABELA, that.ARGS.TABELA_ID).then(function(){
                        that.FILTRO = '';
                        console.log(that.data);
                        
                        that.aberto = true;
                        that.Time1 = $timeout(function(){
                            that._modal().modal('show');


                            $timeout(function() {
                                let drop_ = document.querySelector(".area-upload #upload-file");

                                drop_.addEventListener("dragenter", function() {
                                    document.querySelector(".area-upload .label-upload").classList.add("highlight");
                                });

                                drop_.addEventListener("dragleave", function() {
                                    document.querySelector(".area-upload .label-upload").classList.remove("highlight");
                                });

                                drop_.addEventListener("drop", function() {
                                    document.querySelector(".area-upload .label-upload").classList.remove("highlight");
                                });


                                document.querySelector("#upload-file").addEventListener("change", function() {
                                    var files = this.files;

                                    if (files.length > 0) {
                                        that.tratarArquivos(files);
                                    }
                                });
                            });

                            $timeout.cancel(that.Time1);
                        }, 400, false);

                    });
                });
            });  

            console.log('AngularFindModule...');

            /*
            angular.element(window).on('load', function () {
                console.log('AngularFindModule - Load');
                $timeout(function() {
                    if(!that.CIMPILADO){
                        console.log('AngularFindModule 1 - Compilando Arquivos.js');
                        that._controller().append($compile(that.html())(scope));
                        that.CIMPILADO = true;
                    }
                },5000);
            });

            $timeout(function() {
                if(!that.CIMPILADO){
                    console.log('AngularFindModule 2 - Compilando Arquivos.js');
                    that._controller().append($compile(that.html())(scope));
                    that.CIMPILADO = true;
                }
            },20000);
            */

            if(!that.CIMPILADO){
                console.log('AngularFindModule 2 - Compilando Arquivos.js');
                that._controller().append($compile(that.html())(scope));
                that.CIMPILADO = true;
            }
        }

        /**
         * Public method, assigned to prototype
         */
        Arquivos.prototype = {
            TABELA      : '',
            TAML_IMG    : 600,
            TAMA_IMG    : 600,
            TAM_ARQ     : 5,
            TABELA_ID   : 0,
            EXTENSAO    : [],

            aberto      : false,
            data        : [],
            data_excluir: [],
			componente  : '.div_arquivos',

            ///////////////////////////////////////////////////////////////////////////////////////

            substituirCaracteresEspeciais : function(str) {

                const substituicoes = {
                    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a',
                    'é': 'e', 'è': 'e', 'ê': 'e',
                    'í': 'i', 'ì': 'i', 'î': 'i',
                    'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o',
                    'ú': 'u', 'ù': 'u', 'û': 'u',
                    'ç': 'c',
                    'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A',
                    'É': 'E', 'È': 'E', 'Ê': 'E',
                    'Í': 'I', 'Ì': 'I', 'Î': 'I',
                    'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O',
                    'Ú': 'U', 'Ù': 'U', 'Û': 'U',
                    'Ç': 'C'
                };
            
                let resultado = str.replace(/[áàãâéèêíìîóòõôúùûçÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇ]/g, match => substituicoes[match] || match);
            
                resultado = resultado.replace(/\s+/g, '_');
            
                resultado = resultado.replace(/[^a-zA-Z0-9_]/g, '');
            
                return resultado;
            },
            removerExtensao : function(nomeArquivo) {
                
                const ultimoPontoIndex = nomeArquivo.lastIndexOf('.');
            
                if (ultimoPontoIndex > 0) {
                    let nome = nomeArquivo.substring(0, ultimoPontoIndex);
                    let exte = nomeArquivo.substring(ultimoPontoIndex, nomeArquivo.length);

                    return { NOME: trim_null(nome), EXTENSAO: trim_null(exte) };
                }
            
                return { NOME: trim_null(nomeArquivo), EXTENSAO: '' };
            },

            ///////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////
            // Inclusão via câmera/webcam

            cam_error: false,
            foto_gerada: false,
            width: 320,
            height: 0,
            streaming: false,
            video: null,
            canvas: null,
            photo: null,
            mode: "environment",

            incluirCamera: function() {
                var that = this;

                if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
                    $('#modal-arquivos-camera').modal("show");
                    that.cam_error = false;

                    $timeout(function() {
                        that.iniciarCamera();
                    }, 1000);
                } else {
                    showErro('Navegar não suporta esta função.');
                }
            },
            iniciarCamera: function() {
                var that = this;

                function showViewLiveResultButton() {
                    if (window.self !== window.top) {
                        document.querySelector(".contentarea-arquivo").remove();
                        
                        const button		= document.createElement("button");
                        button.textContent	= "Veja o resultado ao vivo do código de exemplo acima";
                        document.body.append(button);

                        button.addEventListener(
                            "click", () => {
                                window.open(location.href);
                            }
                        );

                        return true;
                    }

                    return false;
                }


                if (showViewLiveResultButton()) {
                    return;
                }

                that.video		= document.getElementById("video-arquivo");
                that.canvas		= document.getElementById("canvas-arquivo");
                that.photo		= document.getElementById("photo-arquivo");

                navigator.mediaDevices.getUserMedia({ video: { facingMode: trim_null(that.mode) }, audio: false })
                    .then((stream) => {
                        that.video.srcObject = stream;
                        that.video.play();
                    })
                    .catch((err) => {
                        that.cam_error = true;
                        console.error(`Ocorreu um erro: ${err}`);

                        showErro('Não foi possível acessar a câmera. Por favor, permita o uso da câmera no navegador e atualize a página.');
                    });

                that.video.addEventListener(
                    "canplay", (ev) => {
                        if (!that.streaming) {
                            that.height = that.video.videoHeight / (that.video.videoWidth / that.width);

                            if (isNaN(that.height)) {
                                that.height = that.width / (4 / 3);
                            }

                            that.video.setAttribute("width", that.width);
                            that.video.setAttribute("height", that.height);
                            that.canvas.setAttribute("width", that.width);
                            that.canvas.setAttribute("height", that.height);
                            that.streaming = true;
                        }
                    }, false,
                );

                that.clearphoto();

            },
            tirarFoto: function(ev) {
                var that = this;

				that.takepicture();
				ev.preventDefault();
			},
            clearphoto: function(e) {
				var that = this;

				const context			= that.canvas.getContext("2d");
				context.fillStyle		= "#AAA";
				context.fillRect(0, 0, that.canvas.width, that.canvas.height);

				const data				= that.canvas.toDataURL("image/png");
				that.photo.setAttribute("src", data);

				that.foto_gerada = false;
				document.getElementById("snapshot_arquivo_b64").value = '';


                if(typeof e != "undefined"){
                    if(!that.cam_error){
                        const stream	= that.video.srcObject;
                        const tracks	= stream.getTracks();

                        tracks.forEach((track) => {
                            track.stop();
                        });
                    }

                    that.video.srcObject	= null;

                    $timeout(function() {
                        $('#modal-arquivos-camera').modal("hide");
                    }, 300);
                }
			},
            takepicture: function() {
				var that = this;

				const context			= that.canvas.getContext("2d");
				if (that.width && that.height) {
					that.canvas.width	= that.width;
					that.canvas.height	= that.height;
					context.drawImage(that.video, 0, 0, that.width, that.height);

					const data			= that.canvas.toDataURL("image/png");
					that.photo.setAttribute("src", data);

					that.foto_gerada = true;
					document.getElementById("snapshot_arquivo_b64").value = data;
				} else {
					that.clearphoto();
				}
			},
            flipCam: function() {
				var that = this;

				const stream	= that.video.srcObject;
				const tracks	= stream.getTracks();

				tracks.forEach((track) => {
					track.stop();
				});

				that.video.srcObject	= null;


				that.mode		= trim_null(that.mode) == "environment" ? "user" : "environment";
				$timeout(function() {
					that.iniciarCamera();
				}, 300);
			},

            gravarCamera: function() {
                var that = this;

                function getFileSizeFromBase64(base64Content) {
					// Remove data URI prefix if present
					const base64Data = base64Content.replace(/^data:.*;base64,/, '');

					// Decode Base64 to binary data
					const binaryData = atob(base64Data);

					// Calculate the size in bytes
					const fileSizeInBytes = binaryData.length;

					// Convert to human-readable format (e.g., KB, MB, GB) for better representation
					const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
					const i = Math.floor(Math.log(fileSizeInBytes) / Math.log(1024));
					const fileSizeHumanReadable = (fileSizeInBytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];

					return {
						bytes: fileSizeInBytes,
						humanReadable: fileSizeHumanReadable,
					};
				}

				///////////////////////////////////////////////////////

                var validar_gravar = true;

                if(trim_null($('#snapshot_arquivo_b64').val()) == ''){
					validar_gravar = false;
					showErro('Imagem não encontrada!');
				}

                if(validar_gravar){

                    var file			= $('#snapshot_arquivo_b64').val();
                    var file_content	= file.substring(22, file.length);
                    var file_type		= file.slice((file.indexOf(':') + 1), file.lastIndexOf(';'));

                    var id_tabela		= that.TABELA_ID;

                    var size			= getFileSizeFromBase64(file)
                    var file_size		= size.bytes / 1048576;
                    var nome_arquivo	= 'foto-'+ trim_null(that.TABELA) +'-'+ id_tabela +'-item-'+ (that.data.length + 1) +'.'+ file_type.substring(6, file_type.length);
                
                    if(file_size <= that.TAM_ARQ){

                        return $q(function(resolve, reject) {

							var dados = {
								TABELA_ID		: id_tabela,
								TABELA			: that.TABELA,
								TAML_IMG		: that.TAML_IMG,
								TAMA_IMG		: that.TAMA_IMG,
                                TAM_ARQ         : that.TAM_ARQ,    

								NOME			: nome_arquivo.substring(0, 200),
								OBSERVACAO		: nome_arquivo.substring(0, 100),
								SEQUENCIA		: (that.data.length + 1),
								TIPO			: file_type,
								EXTENSAO		: "."+ file_type.substring(6, file_type.length),
								BINARIO			: file,
								CONTEUDO		: file_content,
								TAMANHO			: file_size,
							};

							$ajax.postFile('/api/gravarGFilesCamera', dados).then(function(response) {

								$timeout(function() {
									that.clearphoto(1);

                                    that.getFiles(that.ARGS.TABELA, that.ARGS.TABELA_ID).then(function(){
                                        that.FILTRO = '';
                                        console.log(that.data);
                                    });
								}, 300);

								resolve(response);
							}, function(e) {
								reject(e);
							});
						});
                    }else{
                        showErro('Não é possível adicionar anexos maiores de ' + that.TAM_ARQ + 'MB e "'+ nome_arquivo +'" tem '+ file_size.toLocaleString('pt-BR') +'MB, diminua a resolução ou comprima o arquivo e tente novamente.');
                    }
                }
            },

            ///////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////
            // Inclusão via tela intermediária por Qr Code

            qr_code: '',
            qr_code_exp: '',

            gerarQrCodeToken: function() {
                var that = this;

                var dados = {
                    TABELA      : that.TABELA,
                    TABELA_ID   : that.TABELA_ID,
                    TAML_IMG    : that.TAML_IMG,
                    TAMA_IMG    : that.TAMA_IMG
                };

                return $q(function(resolve, reject){
                    $ajax.post('/api/gerarTokenArquivos', dados, { progress : false }).then(function(response){

                        that.qr_code        = response;
                        that.qr_code_exp    = moment(new Date()).add(5, 'minutes').format('HH:mm');

                        resolve(response);
                    }, function(e) {
                        reject(e);
                    });
                });
            },
            removerQrCodeToken: function() {
                var that = this;

                var dados = {
                    TABELA      : that.TABELA,
                    TABELA_ID   : that.TABELA_ID,
                    TAML_IMG    : that.TAML_IMG,
                    TAMA_IMG    : that.TAMA_IMG
                };

                return $q(function(resolve, reject){
                    $ajax.post('/api/limparTokenArquivos', dados, { progress : false }).then(function(response){

                        that.qr_code        = '';
                        that.qr_code_exp    = '';

                        resolve(response);
                    }, function(e) {
                        reject(e);
                    });
                });
            },
            abrirQrCode: function() {
                var that = this;

                that.gerarQrCodeToken().then(function() {


                    that.Confirme.add(1, '', `

                        <div style="width: 100%; height: 200px; background-color: #fff; margin: auto; text-align: center;">

                            <img 
                                alt="QrCode de Inlcusão de Imagens - GcWeb - `+ that.TABELA +`" 
                                src="{{ `+that._object +`.qr_code }}" 
                                style="width: 170px; height: 170px;"/>

                        </div>

                        <br><br>

                        <div style="text-align: center;">
                            <span>Leia o Qr Code com seu Smartphone ou Tablet para ser redirecionado para a inclusão das imagens com a câmera</span> <br>
                            <!-- <span>Navegardor recomendado: Google Chrome</span> -->
                        </div>

                    `, [
                        that.Confirme.obtn_voltar,
                    ], [
                        function(e, btn) {

                            that.removerQrCodeToken().then(function() {

                                that.getFiles(that.ARGS.TABELA, that.ARGS.TABELA_ID).then(function(){
                                    that.FILTRO = '';
                                    console.log(that.data);
                                });

                            });

                        }
                    ]);


                });

            },

            ///////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////
            // Métodos padrões do Arquivos.js

            randomInt : function(min, max) {
                return min + Math.floor((max - min) * Math.random());
            },
            printPdf : function(caminho, id) {

                $('.visualizar-arquivo .visualizar-arquivo-'+id+'-pdf object').attr('data', '');
                $('.visualizar-arquivo iframe').attr('src' , '');

                setTimeout(function() {

                    if($('.visualizar-arquivo .visualizar-arquivo-'+id+'-pdf object').length > 0){
                        $('.visualizar-arquivo .visualizar-arquivo-'+id+'-pdf object').remove();

                        var obs  = document.createElement("object");

                        $('.visualizar-arquivo .visualizar-arquivo-'+id+'-pdf').append(obs);

                        $('.visualizar-arquivo .visualizar-arquivo-'+id+'-pdf object').attr('data-host', urlhost);
                        $('.visualizar-arquivo .visualizar-arquivo-'+id+'-pdf object').attr('type', 'application/pdf');
                        $('.visualizar-arquivo .visualizar-arquivo-'+id+'-pdf object').attr('data', urlhost + caminho +'?' + (randomInt(1,999999)+'')).parent().parent().fadeIn(200);

                    };

                    if($('.visualizar-arquivo iframe').length > 0){
                        $('.visualizar-arquivo iframe').attr('src', urlhost + caminho +'?' + (randomInt(1,999999)+'')).parent().fadeIn(200);
                        $('.visualizar-arquivo').fadeIn(200); 
                    };

                }, 500);

                /*
                $('.visualizar-arquivo iframe')
                    .attr('src','js/PDFJS/web/viewer.html?file=' + caminho)
                    .parent()
                    .fadeIn(200)
                ;
                //*/

            },

            tratarArquivos: function(files) {
                var that = this;
                var timeEnviar = 1000;

                angular.forEach(files, function(file, key) {
                    var validar_arquivo = true;

                    var size = (file.size / 1048576);
                    if(size > that.TAM_ARQ){
                        validar_arquivo = false;
                        showErro('Não é possível adicionar anexos maiores de ' + that.TAM_ARQ + 'MB e "'+ file.name +'" tem '+ size.toLocaleString('pt-BR') +'MB, diminua a resolução ou comprima o arquivo e tente novamente.');
                    }

                    var nome_ret    = that.removerExtensao(file.name);
                    var nome        = trim_null(nome_ret.NOME);
                    var extensao    = trim_null(nome_ret.EXTENSAO);
                    if(that.EXTENSAO.length > 0 && !that.EXTENSAO.includes((extensao.toUpperCase()))){
                        validar_arquivo = false;
                        showErro('Não é possível adicionar anexos da extensão "'+ extensao +'" nesta opção, selecione uma extensão válida. <br><br><strong>Extensões Válidas:</strong> '+ that.EXTENSAO.toString() +'');
                    }


                    if(validar_arquivo){

                        var qtd = that.data.length;

                        var observacao = file.name;
                        var sequencia  = that.data.length + 1;


                        var arquivoNovo = {};
                        angular.copy(arquivoPadrao, arquivoNovo);
                        that.data.push(arquivoNovo);

                        var arquivo     = that.data[that.data.length - 1];


                        arquivo.ID 	 	 	= (that.data.length + 1) * -1;
                        arquivo.NOME 	 	= trim_null(that.substituirCaracteresEspeciais(nome)).substring(0, 180) + extensao;
                        arquivo.TABELA 	 	= that.TABELA;
                        arquivo.TAML_IMG    = that.TAML_IMG;
                        arquivo.TAMA_IMG    = that.TAMA_IMG;
                        arquivo.TAM_ARQ     = that.TAM_ARQ;
                        arquivo.TIPO 	 	= file.type;
                        arquivo.TAMANHO	 	= file.size;
                        arquivo.OBSERVACAO 	= trim_null(observacao).substring(0, 100);
                        arquivo.SEQUENCIA	= sequencia;

                        //100ms para cada 100kb
                        timeEnviar = (Math.ceil(arquivo.TAMANHO / 1024) * 2);

                        arquivo.BINARIO = file;
                        arquivo.CAMINHO = file.$ngfBlobUrl;

                        arquivo.CSS  = 'unknown';
                        arquivo.TYPE = '';

                        if(arquivo.TIPO.indexOf('pdf'				) >= 0 ){arquivo.CSS = 'pdf'; arquivo.TYPE = 'PDF'; }
                        if(arquivo.TIPO.indexOf('octet-stream'		) >= 0 ){arquivo.CSS = 'exe'; arquivo.TYPE = 'EXE'; }
                        if(arquivo.TIPO.indexOf('zip'   			) >= 0 ){arquivo.CSS = 'zip'; arquivo.TYPE = 'ZIP'; }
                        if(arquivo.TIPO.indexOf('msword'   			) >= 0 ){arquivo.CSS = 'doc'; arquivo.TYPE = 'DOC'; }
                        if(arquivo.TIPO.indexOf('vnd.ms-excel'   	) >= 0 ){arquivo.CSS = 'xls'; arquivo.TYPE = 'XLS'; }
                        if(arquivo.TIPO.indexOf('vnd.ms-powerpoint' ) >= 0 ){arquivo.CSS = 'ppt'; arquivo.TYPE = 'PPT'; }
                        if(arquivo.TIPO.indexOf('gif'   			) >= 0 ){arquivo.CSS = 'gif'; arquivo.TYPE = 'GIF'; }
                        if(arquivo.TIPO.indexOf('png'   			) >= 0 ){arquivo.CSS = 'png'; arquivo.TYPE = 'PNG'; }
                        if(arquivo.TIPO.indexOf('jpg'   			) >= 0 ){arquivo.CSS = 'jpg'; arquivo.TYPE = 'JPG'; }
                        if(arquivo.TIPO.indexOf('jpeg'   			) >= 0 ){arquivo.CSS = 'jpeg';arquivo.TYPE = 'JPEG';}
                        if(arquivo.TIPO.indexOf('mpeg'   			) >= 0 ){arquivo.CSS = 'mpeg';arquivo.TYPE = 'MPEG';}
                        if(arquivo.TIPO.indexOf('webp'   			) >= 0 ){arquivo.CSS = 'webp';arquivo.TYPE = 'WEBP';}
                        if(arquivo.TIPO.indexOf('text/plain'   		) >= 0 ){arquivo.CSS = 'txt'; arquivo.TYPE = 'TXT'; }
                        if(arquivo.TIPO.indexOf('sheet'   			) >= 0 ){arquivo.CSS = 'xls'; arquivo.TYPE = 'XLS'; }
                        if(arquivo.TIPO.indexOf('wordprocessingml'  ) >= 0 ){arquivo.CSS = 'doc'; arquivo.TYPE = 'DOC'; } 
                        if(arquivo.TIPO.indexOf('presentation'   	) >= 0 ){arquivo.CSS = 'ppt'; arquivo.TYPE = 'PPT'; }

                    }
                });

                ////////////////////////////////////////

                $timeout(function() {

                    that.gravar().then(function() {

                        let inputFile = document.querySelector("#upload-file");
                        inputFile.value = "";

                    });

                }, timeEnviar);

            },

            limparFiles : function(){
                var that = this;
                var obj  = {};
                var excluir = false;

                angular.forEach(that.data, function(iten, key) {
                    if(typeof iten.BINARIO == 'undefined'){
                        obj = iten;
                        excluir = true;
                    }
                });

                if(excluir == true){
                    that.data.splice(that.data.indexOf(obj), 1);
                }
            },
            setDataFiles : function(dados){
                var that = this;

                that.limparFiles();

                dados.ARQUIVOS 		    = that.data;
                dados.ARQUIVOS_EXCLUIR  = that.data_excluir;
                dados.EXEC_GRAVAR_FILE  = true;

                var config = Upload.getConfig({url : '', data: dados});
                console.log(config);

                return config.data;
            },
            gravar: function(){
                var that = this;

                var dados = {
                    FILTRO: {},
                    TABELA    : that.TABELA,
                    TABELA_ID : that.TABELA_ID,
                    TAML_IMG  : that.TAML_IMG,
                    TAMA_IMG  : that.TAMA_IMG,
                };

                dados = that.setDataFiles(dados);

                return $q(function(resolve, reject){
                    $ajax.postFile('/api/gravarGFiles',dados).then(function(response){

                        that.load(response);

                        that.onFileGravar();
                        resolve(response);
                    },function(e){
                        reject(e);
                    });

                });

            },
            alterarArquivo: function(arquivo) {
                var that = this;


                that.sequencia_arquivo  = Number(arquivo.SEQUENCIA);
                that.observacao_arquivo = trim_null(arquivo.OBSERVACAO);

                var confirme_alt = that.Confirme.add(1, '<h4><span>Alterar Informações do Arquivo</span></h4>', `

                    <div style="width: 100%; text-align: center;">
                        <span>`+ ( arquivo.ID +' - '+ arquivo.NOME ) +`</span>
                    </div>

                    <br><br>

                    <div class="form-group">
                        <label>Sequência:</label>
                        <input 
                            type="number" 
                            class="form-control input-menor" 
                            min="1" 
                            max="9999" 
                            step="1"    
                            ng-model="`+ that._object +`.sequencia_arquivo" 
                            maxlength="100">
                    </div>

                    <div class="form-group">
                        <label>Observação:</label>
                        <input 
                            type="text" 
                            class="form-control input-medio normal-case" 
                            ng-model="`+ that._object +`.observacao_arquivo"
                            maxlength="100">
                    </div>

                `, [
                    that.Confirme.obtn_ok,
                    that.Confirme.obtn_cancelar,
                ], [
                    function(e, btn) {
                        var validar_alterar = true;

                        if(trim_null(that.observacao_arquivo) == ''){
                            validar_alterar = false;
                        }

                        if(validar_alterar){
                            arquivo.SEQUENCIA   = Number(that.sequencia_arquivo);
                            arquivo.OBSERVACAO  = trim_null(that.observacao_arquivo);

                            $timeout(function() {
                                that.gravar().then(function() {

                                    confirme_alt.fechar();

                                });
                            }, 500);

                        }
                    },
                    function(e, btn) {
                        confirme_alt.fechar();
                    }
                ], 'N');

            },
            excluirArquivo: function(arquivo) {
                var that = this;

                // Só adiciona para excluir do banco de dados se o arquivo tiver ID, ou seja, já está gravado no banco.
                if (arquivo.ID > 0) {
                    that.data_excluir = (typeof that.data_excluir != 'undefined') ? that.data_excluir : [];
                    that.data_excluir.push({
                        NOME	: arquivo.NOME,
                        TABELA	: arquivo.TABELA,
                        ID		: arquivo.ID
                    });
                }

                that.data.splice(that.data.indexOf(arquivo), 1);


                $timeout(function() {

                    that.gravar();

                }, 500);
            },

            fecharModal: function() {
                var that = this;

                that.aberto = false;
                that.removerQrCodeToken();
            },

            getFiles: function(tabela, tabela_id){

                var that = this;

                that.data = [];

                var dados = {
                    FILTRO: {},
                    TABELA    : tabela,
                    TABELA_ID : tabela_id
                };
                
                return $q(function(resolve, reject){
                    $ajax.post('/api/getFiles', dados).then(function(response){
                        
                        that.load(response);
                        
                        resolve(response);
                    },function(e){
                        reject(e);
                    });
                });

            },
            load: function(files){
                var that 			    = this;
                that.data_excluir       = [];
                that.data               = [];

                angular.forEach(files, function(file, key) {

                    var arquivo = {};
                    angular.copy(arquivoPadrao, arquivo);
                    that.data.push(arquivo);

                    arquivo = that.data[that.data.length - 1];

                    arquivo.ID 	 	 	    = file.ID;
                    arquivo.NOME 	 	    = file.ARQUIVO;
                    arquivo.TABELA 	 	    = that.TABELA;
                    arquivo.TAML_IMG        = that.TAML_IMG;
                    arquivo.TAMA_IMG        = that.TAMA_IMG;
                    arquivo.TAM_ARQ         = that.TAM_ARQ;
                    arquivo.TIPO 	 	    = file.EXTENSAO;
                    arquivo.TIPO_ARQUIVO    = file.TIPO_ARQUIVO;
                    arquivo.URL 	 	    = file.URL;
                    arquivo.TAMANHO	 	    = file.TAMANHO;
                    arquivo.CSS      	    = file.EXTENSAO;
                    arquivo.OBSERVACAO	    = file.OBSERVACAO;
                    arquivo.SEQUENCIA	    = file.SEQUENCIA;
                    arquivo.TYPE     	    = (file.EXTENSAO + '').toUpperCase();
                    arquivo.BINARIO  	    = file;

                    arquivo.BINARIO.$ngfBlobUrl = file.CAMINHO;

                    that.printPdf(file.CAMINHO, file.ID);
                });

                that.onFileLoad();
            },
            clear: function(){
                var that 			    = this;
                that.data_excluir       = [];
                that.data               = [];

                that.onFileClear();
            },

            onFileGravar: function(){},
            onFileLoad: function(){},
            onFileClear: function(){},

            enviarArquivo: function(email_user, file){

                var fd = file.BINARIO.$ngfBlobUrl;

                if((fd+'').indexOf('blob:') >= 0){
                    showErro('O arquivo ainda não foi gravdo.')
                }else{
                    opemEmailFile('', 'Arquivo em anexo', email_user, fd , '', file.TYPE);
                }

            },

            ///////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////

            montar : function(){
                var that = this;
                var html = that.getHtml();
                var obj  = $(that.componente);

                if ( obj.length > 0 ) {
                    var scope = obj.scope(); 
                    obj.html(html);
                    $compile(obj.contents())(scope);
                }

                $(that.componente).css('border'				,'1px solid black'	);
                $(that.componente).css('display'			,'table'			);
                $(that.componente).css('padding'			,'6px'				);
                $(that.componente).css('border-radius'		,'5px'				);
                $(that.componente).css('background-color'	,'black'			);
                $(that.componente).css('width'				,'100%'				);
                        
            },            
            getHtml: function(){
                var email = $('#usuario-email').val();

                var that = this;

                var html_ret = `
                    <div style="display: flex; justify-content: space-evenly; flex-wrap: nowrap; align-items: center; align-content: center; font-size: 10pt; font-weight: bold;">
                        <div style="color: #fff; background-color: #0000cd; border: solid 1px #0000cd; border-radius: 18px; padding: 5px; margin: -10px;">
                            <span>{{ `+ that._object +`.TABELA }}</span>
                        </div>
                        <div style="color: #fff; background-color: #0000cd; border: solid 1px #0000cd; border-radius: 18px; padding: 5px; margin: -10px;">
                            <span>ID: {{ `+ that._object +`.TABELA_ID }}</span>
                        </div>
                    </div>

                    <div class="area-upload" ng-if="`+ that._object +`.aberto">
                        <label for="upload-file" class="label-upload">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <div class="texto">Clique ou arraste o arquivo</div>
                        </label>
                        <input type="file" id="upload-file" multiple/>

                        <!-- <div class="lista-uploads"></div> -->
                    </div>

                    <div style="display: flex; flex-wrap: nowrap; align-items: center; justify-content: center; overflow: hidden auto; padding: 10px; margin: -10px 0px 10px 0px;">

                        <button ng-click="`+ that._object +`.incluirCamera();" type="button" class="btn btn-primary" data-hotkey="f8" style="margin-right: 10px;">
                            <span class="glyphicon glyphicon-camera"></span> Câmera
                        </button>

                        <button ng-click="`+ that._object +`.abrirQrCode();" type="button" class="btn btn-primary" data-hotkey="f9" style="margin-right: 10px;">
                            <span class="glyphicon glyphicon-qrcode"></span> Qr Code
                        </button>

                    </div>

                    <div class="lista-arquivos" ng-if="`+ that._object +`.CIMPILADO">

                        <div id="item-arquivo-{{ arq.ID }}" class="arquivo-container item-arquivo item-arquivo-{{ arq.ID }}" ng-repeat="arq in `+ that._object +`.data track by $index">

                            <button type="button" class="btn btn-primary" ng-click="`+ that._object +`.alterarArquivo(arq);" title="Alterar Informações do Arquivo" 
                                style="float: left; margin: -15px 0px -10px -15px; font-size: 10px; height: 34px; padding: 5px 5px 0px 15px; z-index: 9;">
                                <span class="glyphicon glyphicon-pencil"></span>
                            </button>
                            
                            <button type="button" class="btn btn-danger" ng-click="`+ that._object +`.excluirArquivo(arq);" title="Excluir Arquivo" 
                                style="float: right; margin: -25px -15px -10px 0px; font-size: 10px; height: 34px; padding: 5px 15px 0px 5px; z-index: 9;">
                                <span class="glyphicon glyphicon-trash"></span>
                            </button>

                            <div class="form-group" style="width: 100%; justify-content: center; margin: -15px 0px -5px 0px !important; padding: 0px 5px;">
                                <label>{{ arq.SEQUENCIA }}</label>
                            </div>

                            <div class="form-group pre-visualizacao-item-arquivo" style="margin: 0px !important;">

                                <video controls
                                    class="pre-visualizacao-arquivo" ng-click="arq.VER = true;" 
                                    style="display: block !important; margin-top: 5px; margin-left: 5px; height: 167px; width: 175px; transform: scale(1) !important;" 
                                    ng-if="arq.TIPO.indexOf('video') > -1 && (arq.TIPO_ARQUIVO == 1)">

                                    <source src="{{ arq.URL }}" type="application/x-shockwave-flash" />

                                </video>

                                <span style="display: block; margin-top: 5px; margin-left: 5px; height: 167px; width: 175px; transform: scale(1) !important;" 
                                    class="pre-visualizacao-arquivo A{{ ( arq.CSS != unknown ? arq.CSS : arq.TIPO ) }}" 
                                    ng-click="arq.VER = true;" 
                                    ng-if="(
                                              (arq.TIPO.indexOf('image') == -1) && 
                                              (arq.TIPO.indexOf('png')   == -1) && 
                                              (arq.TIPO.indexOf('jpg')   == -1) && 
                                              (arq.TIPO.indexOf('webp')  == -1) && 
                                              (arq.TIPO.indexOf('gif')   == -1) && 
                                              (arq.TIPO.indexOf('video') == -1)
                                            ) && (arq.TIPO_ARQUIVO ==  1)">
                                </span>

                                <img
                                    class="pre-visualizacao-arquivo" ng-click="arq.VER = true;" 
                                    src="{{arq.BINARIO.$ngfBlobUrl}}" ngf-src="arq.BINARIO" 
                                    style="display: block !important; margin-top: 5px; margin-left: 5px; height: 167px; width: 175px; transform: scale(1) !important;" 
                                    ng-if="(
                                              (arq.TIPO.indexOf('image') > -1) || 
                                              (arq.TIPO.indexOf('png')   > -1) || 
                                              (arq.TIPO.indexOf('jpg')   > -1) || 
                                              (arq.TIPO.indexOf('webp')  > -1) || 
                                              (arq.TIPO.indexOf('gif')   > -1)
                                            ) && (arq.TIPO_ARQUIVO == 0)">

                                <span style="display: block; margin-top: 5px; margin-left: 5px; height: 167px; width: 175px; transform: scale(1) !important;" 
                                    class="pre-visualizacao-arquivo A{{ ( arq.CSS != unknown ? arq.CSS : arq.TIPO ) }}" 
                                    ng-click="arq.VER = true;" 
                                    ng-if="(
                                              (arq.TIPO.indexOf('image') == -1) && 
                                              (arq.TIPO.indexOf('png')   == -1) && 
                                              (arq.TIPO.indexOf('jpg')   == -1) && 
                                              (arq.TIPO.indexOf('webp')  == -1) && 
                                              (arq.TIPO.indexOf('gif')   == -1)
                                            ) && (arq.TIPO_ARQUIVO ==  0)">
                                </span>

                            </div>

                            <div class="form-group" ng-click="`+ that._object +`.alterarArquivo(arq);"
                                style="text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; 
                                -webkit-box-orient: vertical; overflow: hidden; cursor: pointer;">
                                <!-- <label>Observação:</label> --> <br>
                                <span>{{ arq.OBSERVACAO }}</span>
                            </div>


                            <div class="visualizar-arquivo" ng-show="arq.VER">

                                <span style="position: fixed; top: 85px; left: 28px; color: white; font-size: 15px;">
                                    <span style="font-weight: bold;">ID:</span> {{arq.ID}}, 
                                    <span style="font-weight: bold;">Observação:</span> {{arq.OBSERVACAO}}, 
                                    <span style="font-weight: bold;">Sequência:</span> {{arq.SEQUENCIA}}, 
                                </span>

                                <button ng-click="`+ that._object +`.enviarArquivo('`+ email +`', arq)" type="button" 
                                    class="btn btn-default" style="position: fixed; top: 60px; right: 215px;">
                                    <span class="glyphicon glyphicon-envelope"></span> Enviar
                                </button>

                                <a style="display: block !important;" class="btn btn-default download-arquivo" download
                                    href="{{arq.BINARIO.$ngfBlobUrl}}" ngf-src="arq.BINARIO" data-hotkey="alt+b">
                                    <span class="glyphicon glyphicon-download"></span> Baixar
                                </a>

                                <button ng-click="arq.VER = false;" type="button" class="btn btn-default esconder-arquivo" data-hotkey="esc">
                                    <span class="glyphicon glyphicon-chevron-left"></span> Voltar
                                </button>


                                <div class="visualizar-arquivo-{{ arq.ID }}-pdf" ng-if="( arq.TIPO.indexOf('pdf') > -1 )" style="width: 100%; height: 100%;">

                                    <object ng-if="( arq.TIPO.indexOf('pdf') > -1 )" type="application/pdf" data-host="`+ urlhost +`" 
                                        data="{{ ( ( arq.ID > 0 ? '`+ urlhost +`' : '') + arq.BINARIO.$ngfBlobUrl ) }}" 
                                        ng-class="{ imagem : ( arq.TIPO.indexOf('image') > -1 ) ||
                                                             ( arq.TIPO.indexOf('png') > -1) ||
                                                             ( arq.TIPO.indexOf('jpg') > -1) ||
                                                             ( arq.TIPO.indexOf('webp') > -1) ||
                                                             ( arq.TIPO.indexOf('gif') > -1) }">
                                    </object>

                                </div>

                                <img class="" style="width: 100%; object-fit: scale-down; height: calc(100vh - 160px); display: block !important;" 
                                    src="{{arq.BINARIO.$ngfBlobUrl}}" ngf-src="arq.BINARIO" 
                                    ng-if="( arq.TIPO.indexOf('image') > -1 ) || 
                                            ( arq.TIPO.indexOf('png') > -1) ||
                                            ( arq.TIPO.indexOf('jpg') > -1) ||
                                            ( arq.TIPO.indexOf('webp') > -1) ||
                                            ( arq.TIPO.indexOf('gif') > -1)">

                                <span style=" width: calc(100% - 60px); position: absolute; height: 10%; background-position: center; background-repeat: no-repeat; background-size: contain;" 
                                    class="A{{ arq.CSS != unknown ? arq.CSS : arq.TIPO }}" 
                                    ng-if="( arq.TIPO.indexOf('image') == -1 ) && 
                                            ( arq.TIPO.indexOf('pdf') == -1) &&
                                            ( arq.TIPO.indexOf('png') == -1) &&
                                            ( arq.TIPO.indexOf('jpg') == -1) &&
                                            ( arq.TIPO.indexOf('webp') == -1) &&
                                            ( arq.TIPO.indexOf('gif') == -1)">
                                </span>

                                <label style="margin-top: 100px; text-align: center; font-size: 20px; font-weight: normal; color: white; display: block;" 
                                    class="lbl-visualizacao-indisponivel" 
                                    ng-if="( arq.TIPO.indexOf('image') == -1 ) && 
                                            ( arq.TIPO.indexOf('pdf') == -1) &&
                                            ( arq.TIPO.indexOf('png') == -1) &&
                                            ( arq.TIPO.indexOf('jpg') == -1) &&
                                            ( arq.TIPO.indexOf('webp') == -1) &&
                                            ( arq.TIPO.indexOf('gif') == -1)">
                                    Visualização indisponível!
                                </label>

                            </div>

                        </div>

                    </div>

                `;

                return html_ret;
            }
        }
        
        Arquivos.prototype.getArgs = function(){        
            var that = this;
        }
        
        Arquivos.prototype.getHistorico = function(){
            var that = this;

            that.TABELA
            
            return $q(function(resolve,reject){
                $ajax.post('/api/historico', that.ARGS)
                    .then(function(response) {
                        that.DADOS = response;
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
	    Arquivos.prototype.html = function(){
            var that = this;


            var files       = that.getHtml();

            var html_ret    = `

            <div class="modal fade" id="modal-arquivos" role="dialog" data-keyboard="false" data-backdrop="static">
                <div class="modal-dialog modal-lg" role="document" style="height: calc(100% - 80px);">
                    <div class="modal-content" style="height: 100%;">
                        <div class="modal-header">

                            <div class="modal-header-left">

                                <h4 class="modal-title"><span>Gerenciador de Arquivos</span></h4>

                            </div>
                            <div class="modal-header-center">
                            </div>
                            <div class="modal-header-right">

                                <button ng-click="`+ that._object +`.fecharModal()" type="button" class="btn btn-default btn-voltar" data-hotkey="esc" data-dismiss="modal">
                                    <span class="glyphicon glyphicon-chevron-left"></span> Voltar
                                </button>

                            </div>

                        </div>
                        <div class="modal-body" style="height: 100%;">

                            `+ files +`

                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="modal-arquivos-camera" role="dialog" data-keyboard="false" data-backdrop="static">
                <div class="modal-dialog modal-lg" role="document" style="height: calc(100% - 190px);">
                    <div class="modal-content" style="height: 100%;">
                        <div class="modal-header">

                            <div class="modal-header-left">

                                <h4 class="modal-title"><span>Câmera</span></h4>

                            </div>
                            <div class="modal-header-center">
                            </div>
                            <div class="modal-header-right">

                                <button ng-if="`+ that._object +`.foto_gerada" ng-click="`+ that._object +`.gravarCamera()" type="button" class="btn btn-success" data-hotkey="f1">
                                    <span class="glyphicon glyphicon-edit"></span> Gravar
                                </button>

                                <button ng-click="`+ that._object +`.clearphoto(1)" type="button" class="btn btn-danger btn-cancelar" data-hotkey="esc">
                                    <span class="glyphicon glyphicon-ban-circle"></span> Cancelar
                                </button>

                            </div>

                        </div>
                        <div class="modal-body" style="height: 95%;">

                            <input type="hidden" id="snapshot_arquivo_b64" value=""></input>

                            <ul class="list-inline">
                                <li ng-show="`+ that._object +`.foto_gerada">
                                    <button type="button" class="btn btn-default" 
                                    data-hotkey="f12" ng-disabled="!`+ that._object +`.foto_gerada" 
                                    ng-click="`+ that._object +`.clearphoto();">
                                    <span class=""></span> Nova Foto
                                </li>
                            </ul>

                            <div class="contentarea-arquivo">

                                <div class="camera-arquivo" ng-show="!`+ that._object +`.foto_gerada">
                                    <video id="video-arquivo">Video não disponível.</video>

                                    <button id="startbutton-arquivo" type="button" class="btn btn-success" ng-click="`+ that._object +`.tirarFoto($event);">
                                        <span class="glyphicon glyphicon-camera"></span>
                                    </button>

                                    <button id="flipcam-arquivo" type="button" class="btn btn-default" ng-click="`+ that._object +`.flipCam();">
                                        <span class="glyphicon glyphicon-refresh"></span>
                                    </button>
                                </div>

                                <canvas id="canvas-arquivo"></canvas>

                                <div class="output-arquivo" ng-show="`+ that._object +`.foto_gerada">
                                    <img id="photo-arquivo" alt="Sua foto irá aparecer nessa caixa"/>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </div>

            `;

            return html_ret;
        };    

	    /**
	     * Return the constructor function
	     */
	    return Arquivos;
    };

})(window, window.angular);