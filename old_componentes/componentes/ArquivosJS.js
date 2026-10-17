(function(window, angular) {
    'use strict';

	AngularFindModule.factory('ArquivosJS' , ArquivosJS );
	
	ArquivosJS.$inject = [
		'$ajax',
		'$q',
        '$compile',
		'Upload',
		'$rootScope'
    ];

    function ArquivosJS($ajax, $q, $compile, Upload, $rootScope) {

        /**
         * Constructor, with class name
         */
        function ArquivosJS(data) {
            this.OBJ_JS = {};

            if (data) {
                this.setData(data);
            }
        }

        var arquivoPadrao = {
                ID      : 0,
                NOME 	: null,
                TABELA 	: null,
                TIPO 	: null,
                TAMANHO	: null,
                BINARIO	: null,
                CONTEUDO: null,
                CSS     : null,
                NF_ID   : null,
                ORIGEM  : null,
        };

        /**
         * Public method, assigned to prototype
         */
        ArquivosJS.prototype = {
            data: [],
            data_excluir: [],
            comentario: '',
            vGravar: false,
            editando: false,
            selecao_multipla: true,
            style_inputs: 'width: 400px;',
            EDITOR : {},
            TABELA : '',
            componente : '.div_arquivos',
            disabled : true,
            montarLista: true,
            mostrarBotao: true,
            dadosbackup: [],
            excluirbackup: [],
            ORIGEM : 0,
            NF_ID : 0,
            backup : function(){
                var that = this;
                that.dadosbackup = [];
                that.excluirbackup = [];
                
                angular.copy(that.data			, that.dadosbackup	);
                angular.copy(that.data_excluir	, that.excluirbackup);
            },
            restore: function(){
                var that = this;
                angular.copy(that.dadosbackup	, that.data			);
                angular.copy(that.excluirbackup	, that.data_excluir	);
            },
            getFiles : function(id){

                var that = this;

                var dados = {
                    FILTRO: {},
                    TABELA    : that.TABELA,
                    TABELA_ID : id
                };
                
                return $q(function(resolve, reject){
                    $ajax.post('/api/getFiles',dados).then(function(response){
                        
                        that.load(response);
                        
                        resolve(response);
                    },function(e){
                        reject(e);
                    });
                });

            },
            setDataFiles : function(dados){
                var that = this;

                dados.ARQUIVOS 		    = that.data;
                dados.ARQUIVOS_EXCLUIR  = that.data_excluir;
                dados.EXEC_GRAVAR_FILE  = true;

                var config = Upload.getConfig({url : '', data: dados});
                console.log(config);

                return config.data;
            },
            montar : function(){
                var that = this;
                var html = that.getHtml();
                var obj  = $(that.componente);

                if ( obj.length > 0 ) {
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
                }

                // $(that.componente).css('border'				,'1px solid black'	);
                $(that.componente).css('display'			,'table'			);
                $(that.componente).css('padding'			,'0px'				);
                $(that.componente).css('border-radius'		,'5px'				);
                // $(that.componente).css('background-color'	,'black'			);
                $(that.componente).css('width'				,'100%'				);
                $(that.componente).css('margin-top'		    ,'10px'				);
                        
            },
            clear:function(){
                that 			  = this;
                that.data_excluir = [];
                that.data         = [];
            },
            load: function(files){
                that 			  = this;
                that.data_excluir = [];
                that.data         = [];

                angular.forEach(files, function(file, key) {

                    var arquivo = {};
                    angular.copy(arquivoPadrao, arquivo);
                    that.data.push(arquivo);

                    arquivo = that.data[that.data.length - 1];

                    arquivo.ID 	 	 	= file.ID;
                    arquivo.NOME 	 	= file.ARQUIVO;
                    arquivo.TABELA 	 	= that.TABELA;
                    arquivo.TIPO 	 	= file.EXTENSAO;
                    arquivo.TAMANHO	 	= file.TAMANHO;
                    arquivo.CSS      	= file.EXTENSAO;
                    arquivo.OBSERVACAO	= file.OBSERVACAO;
                    arquivo.SEQUENCIA	= file.SEQUENCIA;
                    arquivo.TYPE     	= (file.EXTENSAO + '').toUpperCase();
                    arquivo.BINARIO  	= file;
                    arquivo.NF_ID  	    = that.NF_ID;
                    arquivo.ORIGEM  	= that.ORIGEM;

                    arquivo.BINARIO.$ngfBlobUrl = file.CAMINHO;
                });
            },
            setData: function(data) {
                angular.extend(this, data);
            },
            addArquivo: function() {

                if(typeof this.data != 'array' && typeof this.data != 'object'){
                    this.data = [];
                }


                if(this.data.length >= 1){
                    showErro("Você já inseriu um arquivo XML");
                }else{
                    var validar = true;
                    angular.forEach(this.data, function(iten, key) {
    
                        if(iten.NOME == null){
                            validar = false;
                        }
                    });
    
                    if(validar){
                        var arquivoNovo = {};
                        angular.copy(arquivoPadrao, arquivoNovo);
                        this.data.push(arquivoNovo);
                    }
    
                    setTimeout(function(){
                        var imputs = $('.arquivo-binario');
                        if (imputs.length > 0){
                            $(imputs[0]).trigger('click');
                        }
                    },200);
                }

               

            },
            enviarArquivo: function(email_user, file){

                var fd = file.BINARIO.$ngfBlobUrl;

                if((fd+'').indexOf('blob:') >= 0){
                    showErro('O arquivo ainda não foi gravdo.')
                }else{
                    opemEmailFile('', 'Arquivo em anexo', email_user, fd , '', file.TYPE);
                }
                
            },
            carregarArquivo: function(evento, file){

                var fd = file.BINARIO.$ngfBlobUrl;

                console.log(fd);

                window.open(fd, '_blank');


                // $("#visualizacao_xml").attr("src", fd);

                // file.VER = true;
            },
            processarArquivo: function(event, arquivo) {

                that = this;
                var arquivoAdicionado = false;

                angular.forEach(event.target.files, function(file, key) {

                    var size = (file.size / 1048576);

                    if(size <= 2){

                        var qtd = that.data.length;

                        var html = '<div style="display: inline-flex;">'
                        +' <div class="form-group">'
                        +' 	<label>Descrição:</label>'
                        +' 	<input' 
                        +' 		type="text"'
                        +' 		style="'+ that.style_inputs + '"'
                        +' 		class="form-control"' 
                        +' 		required'
                        +' 		id="desc_file_imput"'
                        +'      value="'+file.name+'"'
                        +' 		form-validate="true">'
                        +' </div>'
                        +' <div class="form-group" style="margin-left: 10px;">'
                        +' 	<label>Sequência:</label>'
                        +' 	<input' 
                        +' 		type="number"'
                        +' 		class="form-control input-menor"' 
                        +' 		required'
                        +' 		id="sec_file_imput"'
                        +'      value="'+qtd+'"'
                        +' 		form-validate="true">'
                        +' </div></div>';

                        if(that.selecao_multipla == true){
                            addConfirme('<h4>'+file.name+'</h4>',html,
                                [obtn_sim,obtn_cancelar],
                                [{ret:1,func:function(){
                                    $rootScope.$apply(function(){
                                        
                                        var observacao = $('#desc_file_imput').val();
                                        var sequencia = $('#sec_file_imput').val();

                                        var validar = true;
                                        angular.forEach(that.data, function(iten, key) {
                                            if(iten.NOME == null){
                                                validar = false;
                                            }
                                        });

                                        if(validar){
                                            var arquivoNovo = {};
                                            angular.copy(arquivoPadrao, arquivoNovo);
                                            that.data.push(arquivoNovo);

                                            arquivo = that.data[that.data.length - 1];
                                        }

                                        that.vGravar = true;

                                        arquivo.ID 	 	 	= 0;
                                        arquivo.NOME 	 	= file.name;
                                        arquivo.TABELA 	 	= that.TABELA;
                                        arquivo.TIPO 	 	= file.type;
                                        arquivo.TAMANHO	 	= file.size;
                                        arquivo.OBSERVACAO 	= observacao;
                                        arquivo.SEQUENCIA	= sequencia;

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
                                        if(arquivo.TIPO.indexOf('webp'   			) >= 0 ){arquivo.CSS = 'webp';arquivo.TYPE = 'WEBP';}
                                        if(arquivo.TIPO.indexOf('mpeg'   			) >= 0 ){arquivo.CSS = 'mpeg';arquivo.TYPE = 'MPEG';}
                                        if(arquivo.TIPO.indexOf('text/plain'   		) >= 0 ){arquivo.CSS = 'txt'; arquivo.TYPE = 'TXT'; }
                                        if(arquivo.TIPO.indexOf('sheet'   			) >= 0 ){arquivo.CSS = 'xls'; arquivo.TYPE = 'XLS'; }
                                        if(arquivo.TIPO.indexOf('wordprocessingml'  ) >= 0 ){arquivo.CSS = 'doc'; arquivo.TYPE = 'DOC'; } 
                                        if(arquivo.TIPO.indexOf('presentation'   	) >= 0 ){arquivo.CSS = 'ppt'; arquivo.TYPE = 'PPT'; }

                                        arquivoAdicionado = true;
                                    });
                                }}]     
                            );
                        }else{
                                var observacao = file.name;
                                var sequencia = 1;

                                var validar = true;
                                angular.forEach(that.data, function(iten, key) {
                                    if(iten.NOME == null){
                                        validar = false;
                                    }
                                });

                                if(validar){
                                    var arquivoNovo = {};
                                    angular.copy(arquivoPadrao, arquivoNovo);
                                    that.data.push(arquivoNovo);

                                    arquivo = that.data[that.data.length - 1];
                                }

                                that.vGravar = true;

                                arquivo.ID 	 	 	= 0;
                                arquivo.NOME 	 	= file.name;
                                arquivo.TABELA 	 	= that.TABELA;
                                arquivo.TIPO 	 	= file.type;
                                arquivo.TAMANHO	 	= file.size;
                                arquivo.OBSERVACAO 	= observacao;
                                arquivo.SEQUENCIA	= sequencia;

                                arquivo.BINARIO     = file;
                                arquivo.CAMINHO     = file.$ngfBlobUrl;

                                arquivo.CSS  = 'unknown';
                                arquivo.TYPE = '';

                                if(arquivo.TIPO.indexOf('xml') >= 0 ){
                                    arquivo.CSS = 'xml'; 
                                    arquivo.TYPE = 'XML'; 

                                    var reader = new FileReader();
                                    reader.addEventListener('load', readFile);

                                    reader.readAsText(file);

                                    $("#visualizacao_xml").attr("src", arquivo.CAMINHO);

                                    arquivoAdicionado = true;

                                }else{
                                    arquivoAdicionado = false;
                                    showErro('Não é permitido inserir arquivos com extensões diferentes de XML');
                                }
                                // if(arquivo.TIPO.indexOf('pdf'				) >= 0 ){arquivo.CSS = 'pdf'; arquivo.TYPE = 'PDF'; }
                                // if(arquivo.TIPO.indexOf('octet-stream'		) >= 0 ){arquivo.CSS = 'exe'; arquivo.TYPE = 'EXE'; }
                                // if(arquivo.TIPO.indexOf('zip'   			) >= 0 ){arquivo.CSS = 'zip'; arquivo.TYPE = 'ZIP'; }
                                // if(arquivo.TIPO.indexOf('msword'   			) >= 0 ){arquivo.CSS = 'doc'; arquivo.TYPE = 'DOC'; }
                                // if(arquivo.TIPO.indexOf('vnd.ms-excel'   	) >= 0 ){arquivo.CSS = 'xls'; arquivo.TYPE = 'XLS'; }
                                // if(arquivo.TIPO.indexOf('vnd.ms-powerpoint' ) >= 0 ){arquivo.CSS = 'ppt'; arquivo.TYPE = 'PPT'; }
                                // if(arquivo.TIPO.indexOf('gif'   			) >= 0 ){arquivo.CSS = 'gif'; arquivo.TYPE = 'GIF'; }
                                // if(arquivo.TIPO.indexOf('png'   			) >= 0 ){arquivo.CSS = 'png'; arquivo.TYPE = 'PNG'; }
                                // if(arquivo.TIPO.indexOf('jpg'   			) >= 0 ){arquivo.CSS = 'jpg'; arquivo.TYPE = 'JPG'; }
                                // if(arquivo.TIPO.indexOf('jpeg'   			) >= 0 ){arquivo.CSS = 'jpeg';arquivo.TYPE = 'JPEG';}
                                // if(arquivo.TIPO.indexOf('webp'   			) >= 0 ){arquivo.CSS = 'webp';arquivo.TYPE = 'WEBP';}
                                // if(arquivo.TIPO.indexOf('mpeg'   			) >= 0 ){arquivo.CSS = 'mpeg';arquivo.TYPE = 'MPEG';}
                                // if(arquivo.TIPO.indexOf('text/plain'   		) >= 0 ){arquivo.CSS = 'txt'; arquivo.TYPE = 'TXT'; }
                                // if(arquivo.TIPO.indexOf('sheet'   			) >= 0 ){arquivo.CSS = 'xls'; arquivo.TYPE = 'XLS'; }
                                // if(arquivo.TIPO.indexOf('wordprocessingml'  ) >= 0 ){arquivo.CSS = 'doc'; arquivo.TYPE = 'DOC'; } 
                                // if(arquivo.TIPO.indexOf('presentation'   	) >= 0 ){arquivo.CSS = 'ppt'; arquivo.TYPE = 'PPT'; }
                        }

                    }else{
                        showErro('Não é possível adicionar anexos maiores de 2MB e "'+file.name+'" tem '+size.toLocaleString('pt-BR')+'MB, diminua a resolução ou comprima o arquivo e tente novamente.');
                    }
                });

                if(arquivoAdicionado == true){
                    setTimeout(function() {
                        $('.arquivo-container .scroll .form-group:last-of-type input.arquivo-binario').focus();
                    }, 100);
                }else{
                    that.data.splice(that.data.length - 1, 1);
                }

            },
            excluirArquivo: function(arquivo) {

                // Só adiciona para excluir do banco de dados se o arquivo tiver ID, ou seja, já está gravado no banco.
                if (arquivo.ID > 0) {
                    this.data_excluir = (typeof this.data_excluir != 'undefined') ? this.data_excluir : [];
                    this.data_excluir.push({
                        NOME	: arquivo.NOME,
                        TABELA	: arquivo.TABELA,
                        ID		: arquivo.ID
                    });
                }

                this.data.splice(this.data.indexOf(arquivo), 1);
                // Adiciona um arquivo vazio se não tiver mais nenhum outro.
                if (this.data.length == 0){
                    this.vGravar = false;
                }
            },
            getHtml: function(){
                var that = this;
                var email = $('#usuario-email').val();

                var html = ''
                +' <div class="grupo-btn-arquivos top"> '
                +' <button '
                +' ng-if="vm.ArquivosJS.mostrarBotao"'
                +' ng-disabled="vm.ArquivosJS.disabled"'
                +' type="button" '
                +' class="btn btn-sm btn-info" '
                +' ng-click="vm.ArquivosJS.addArquivo()" '
                +' style="margin-bottom: 5px;"> '
                +' '
                +' <span class="glyphicon glyphicon-plus"></span> '
                +' Adicionar Arquivo '
                +' </div> '
                +' '
                +' <div'
                +' ng-if="vm.ArquivosJS.montarLista"'
                +' ng-repeat="arq in vm.ArquivosJS.data.slice().reverse() track by $index" class="arquivo-container"> '
                +' '
                +' <div class="form-group"> '
                +' <input '
                +' 		style="'+ that.style_inputs + '"'
                +' type="file" ' + (that.selecao_multipla == true ? 'multiple' : '') +
                +' class="form-control arquivo-binario" '
                +' ngf-select="vm.ArquivosJS.processarArquivo($event, arq)" '
                +' ng-model="arq.BINARIO" '
                +' ng-if="!arq.BINARIO"> '
                +' '
               
                +' '
                +' <span '
                +' class="fa fa-file-code-o" '
                +' style="position: absolute; left: 14px; font-size: 23px; top: 5px; cursor: zoom-in;" '
                +' ng-if=" '
                +' (arq.TIPO.indexOf(\'image\') == -1) '
                +' && (arq.TIPO.indexOf(\'png\') == -1) '
                +' && (arq.TIPO.indexOf(\'jpg\') == -1) '
                +' && (arq.TIPO.indexOf(\'webp\') == -1) '
                +' && (arq.TIPO.indexOf(\'gif\') == -1)"'
                +' ng-click="vm.ArquivosJS.carregarArquivo($event, arq);" '
                +'></span> '
                +' '
                +' <input '
                +' type="text" '
                +' style="'+that.style_inputs+'" '
                +' class="form-control normal-case arquivo-nome" '
                +' disabled '
                +' ng-model="arq.NOME" '
                +' ng-value="arq.ID '
                +' ? arq.ID +\' - \'+ arq.NOME '
                +' : arq.NOME" '
                +' ng-click="arq.VER = true" '
                +' ng-if="arq.BINARIO"> '
                +' '
                +' <button '
                +' type="button" '
                +' class="btn btn-info btn-ver-arquivo" '
                +' ng-click="arq.VER = true" '
                +' ng-disabled="!arq.ID || !arq.BINARIO" '
                +' style="display: none"> '
                +' <span class="glyphicon glyphicon-eye-open"></span> '
                +' </button> '
                +' '
                +' <button '
                +' type="button" '
                +' ng-disabled="vm.ArquivosJS.disabled"'
                +' class="btn btn-danger" '
                +' ng-click="vm.ArquivosJS.excluirArquivo(arq)" '
                +' > '
                +' '
                +' <span class="glyphicon glyphicon-trash"></span> '
                +' </button> '
                +' '
                +' <div '
                +' class="visualizar-arquivo" '
                +' ng-show="arq.VER"> '
                +' '

                +'  <span style="position: fixed; top: 63px; left: 28px; color: white; font-size: 15px;"> '
                +'  	<span style="font-weight: bold;">ID:</span> {{arq.ID}}, '
                +'  	<span style="font-weight: bold;">Observação:</span> {{arq.OBSERVACAO}}, '
                +'  	<span style="font-weight: bold;">Sequência:</span> {{arq.SEQUENCIA}}, '
                +'  </span>'

                +' <button ng-click="vm.ArquivosJS.enviarArquivo(\''+email+'\', arq)" '
                +' style="position: fixed; top: 60px; right: 215px;" type="button" class="btn btn-default"> '
                +' <span class="glyphicon glyphicon-envelope"></span> '
                +' Enviar '
                +' </button> '
                +' '
                +' <a style="display: block !important;"'
                +' class="btn btn-default download-arquivo" '
                +' href="{{arq.BINARIO.$ngfBlobUrl}}" '
                +' ngf-src="arq.BINARIO" '
                +' '
                +' download '
                +' data-hotkey="alt+b"> '
                +' '
                +' <span class="glyphicon glyphicon-download"></span> '
                +' Baixar '
                +' </a> '
                +' '
                +' <button '
                +' type="button" '
                +' class="btn btn-default esconder-arquivo" '
                +' data-hotkey="esc" '
                +' ng-click="arq.VER = false"> '
                +' '
                +' <span class="glyphicon glyphicon-chevron-left"></span> '
                +' Voltar '
                +' </button> '
                +' '
                +' <object type="application/pdf"'
                +' data-host="'+urlhost+'" '
                +' data="{{ (arq.ID > 0 ? \''+urlhost+'\' : \'\') + arq.BINARIO.$ngfBlobUrl }}" '
                +' ng-class="{imagem: '
                +' (arq.TIPO.indexOf(\'image\') > -1) '
                +' || (arq.TIPO.indexOf(\'png\') > -1) '
                +' || (arq.TIPO.indexOf(\'jpg\') > -1) '
                +' || (arq.TIPO.indexOf(\'webp\') > -1) '
                +' || (arq.TIPO.indexOf(\'gif\') > -1)}" '
                +' ng-if="(arq.TIPO.indexOf(\'pdf\') > -1)"></object> '

                +' <iframe id="visualizacao_xml" src=""'
                +' ng-show="(arq.TIPO.indexOf(\'xml\') > -1)"></iframe> '

                +' '
                +' <img '
                +' class="" '
                +' style="width: 100%; object-fit: scale-down; height: calc(100vh - 160px); display: block !important; "'
                +' src="{{arq.BINARIO.$ngfBlobUrl}}"'
                +' ngf-src="arq.BINARIO" '
                +' ng-if=" '
                +' (arq.TIPO.indexOf(\'image\') > -1) '
                +' || (arq.TIPO.indexOf(\'png\') > -1) '
                +' || (arq.TIPO.indexOf(\'jpg\') > -1) '
                +' || (arq.TIPO.indexOf(\'webp\') > -1) '
                +' || (arq.TIPO.indexOf(\'gif\') > -1)"> '
                +' '
                +' <span '
                +' style=" width: calc(100% - 60px); '
                +' position: absolute; '
                +' height: 10%; '
                +' background-position: center; '
                +' background-repeat: no-repeat; '
                +' background-size: contain;" '
                +' class="A{{arq.CSS != unknown ? arq.CSS : arq.TIPO}}" '
                +' ng-if=" '
                +' (arq.TIPO.indexOf(\'image\') == -1) '
                +' && (arq.TIPO.indexOf(\'pdf\') == -1) '
                +' && (arq.TIPO.indexOf(\'png\') == -1) '
                +' && (arq.TIPO.indexOf(\'jpg\') == -1) '
                +' && (arq.TIPO.indexOf(\'webp\') == -1) '
                +' && (arq.TIPO.indexOf(\'gif\') == -1)"></span> '
                +' '
                +' </div> '
                +' </div> '
                +' </div> '
                +'';

                return html;
            }
        }

        function readFile(event) {
            var that = this;

            var conteudoArquivo = event.target.result;

            console.log(event);

            // var textarea_editor = document.getElementById("visualizacao_xml");

            

            // textarea_editor.value = conteudoArquivo; 

            // that.EDITOR = CodeMirror.fromTextArea(textarea_editor, {
            //     theme : 'mdn-like',
            //     mode: "htmlmixed",
            //     indentWithTabs: true,
            //     smartIndent: true,
            //     lineNumbers: true,
            //     matchBrackets : true,
            //     styleActiveLine: true,
            //     autofocus: true,
            //     readOnly: "nocursor"
               
            // });

            // that.EDITOR.setValue(conteudoArquivo);
            // that.EDITOR.setOption("theme", 'mdn-like');

        }

        /**
         * Return the constructor function
         */
        return ArquivosJS;

    }

})(window, window.angular);