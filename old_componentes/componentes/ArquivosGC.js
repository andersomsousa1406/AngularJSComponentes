(function(window, angular) {
    'use strict';

	AngularFindModule.factory('ArquivosGC' , ArquivosGC );
	
	ArquivosGC.$inject = [
		'$ajax',
		'$q',
        '$compile',
		'Upload',
        '$rootScope',
        'gScope'
    ];

    function ArquivosGC($ajax, $q, $compile, Upload, $rootScope, gScope) {

        /**
         * Constructor, with class name
         */
        function ArquivosGC(data) {
            this.OBJ_JS = {};

            if (data) {
                this.setData(data);
            }
        }

        var arquivoPadrao = {
                ID      : 0,
                NOME 	: null,
                TABELA 	: null,
                TAML_IMG: null,
                TAMA_IMG: null,
                TIPO 	: null,
                TAMANHO	: null,
                BINARIO	: null,
                CONTEUDO: null,
                CSS     : null
        };

        /**
         * Public method, assigned to prototype
         */
        ArquivosGC.prototype = {
            data: [],
            data_excluir: [],
            comentario: '',
            vGravar: false,
            editando: false,
            TABELA : '',
            TAML_IMG: 600,
            TAMA_IMG: 600,
            componente : '.div_arquivos',
            disabled : true,
            montarLista: true,
            mostrarBotao: true,
            dadosbackup: [],
            excluirbackup: [],
            mostrar_nome : true,
            mostrar_descricao : false,
            mostrar_ordem : false,
            habilita_descricao : true,
            habilita_ordem : true,
            tamanho_arquivo : 2,
            allowedExtensions: ['*'],
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

                $(that.componente).css('border'				,'1px solid black'	);
                $(that.componente).css('display'			,'table'			);
                $(that.componente).css('padding'			,'6px'				);
                $(that.componente).css('border-radius'		,'5px'				);
                $(that.componente).css('background-color'	,'black'			);
                $(that.componente).css('width'				,'100%'				);
                        
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
                    arquivo.TAML_IMG    = that.TAML_IMG,
                    arquivo.TAMA_IMG    = that.TAMA_IMG;
                    arquivo.TIPO 	 	= file.EXTENSAO;
                    arquivo.TAMANHO	 	= file.TAMANHO;
                    arquivo.CSS      	= file.EXTENSAO;
                    arquivo.OBSERVACAO	= file.OBSERVACAO;
                    arquivo.SEQUENCIA	= file.SEQUENCIA;
                    arquivo.TYPE     	= (file.EXTENSAO + '').toUpperCase();
                    arquivo.BINARIO  	= file;

                    arquivo.BINARIO.$ngfBlobUrl = file.CAMINHO;
                });
            },
            setData: function(data) {
                angular.extend(this, data);
            },
            addArquivo: function() {
                var that = this;

                if(typeof that.data != 'array' && typeof that.data != 'object'){
                    that.data = [];
                }

                var validar = true;
                angular.forEach(that.data, function(iten, key) {

                    if(iten.NOME == null){
                        validar = false;
                    }
                });

                if(validar){
                    var arquivoNovo = {};
                    angular.copy(arquivoPadrao, arquivoNovo);

                    try {

                        that.data.push(arquivoNovo);

                    } catch (error) {

                        that.data = [];
                        that.data.push(arquivoNovo);

                    } 
                }

                setTimeout(function(){
                    var imputs = $('.arquivo-binario');
                    if (imputs.length > 0){
                        $(imputs[0]).trigger('click');
                    }
                },200);

            },
            enviarArquivo: function(email_user, file){

                var fd = file.BINARIO.$ngfBlobUrl;

                if((fd+'').indexOf('blob:') >= 0){
                    showErro('O arquivo ainda não foi gravdo.')
                }else{
                    opemEmailFile('', 'Arquivo em anexo', email_user, fd , '', file.TYPE);
                }

            },
            processarArquivo: function(event, arquivo) {
                that = this;
                that.arquivoAdicionado = false;

                angular.forEach(event.target.files, function(file, key) {

                    var size = (file.size / 1048576);

                    if(size <= that.tamanho_arquivo){

                        var qtd = that.data.length + key;

                        var html = '<div style="display: inline-flex;">';
                        
                            html = html + '<div class="form-group" style="'+(that.habilita_descricao == false ? 'display: none;' : '')+'">'
                                    +' 	<label>Descrição:</label>'
                                    +' 	<input' 
                                    +' 		type="text"'
                                    +' 		class="form-control input-maior input-descricao-file"' 
                                    +' 		required'
                                    +' 		id="desc_file_imput"'
                                    +'      value="'+file.name+'"'
                                    +' 		form-validate="true">'
                                    +' </div>';

                            html = html + '<div class="form-group" style="'+(that.habilita_ordem == false ? 'display: none; ' : '')+'margin-left: 10px;">'
                                    +' <label>Sequência:</label>'
                                    +' 	<input' 
                                    +' 		type="number"'
                                    +' 		class="form-control input-menor input-sequencia-file"' 
                                    +' 		required'
                                    +' 		id="sec_file_imput"'
                                    +'      value="'+qtd+'"'
                                    +' 		form-validate="true">'
                                    +' </div>';

                            html = html + '</div>';
                        

                        var msg = gScope.Confirme.add(1,'<h4>Confirmar Importação de Arquivo</h4>',html,
                            [gScope.Confirme.obtn_ok, gScope.Confirme.obtn_cancelar],[
                            function (e, btn){
                                var paimsg = this.pai;

                                var modelFile = paimsg.FILE;

                                var observacao = $('#desc_file_imput').val();
                                var sequencia  = $('#sec_file_imput').val();

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
                                arquivo.NOME 	 	= modelFile.name;
                                arquivo.TABELA 	 	= that.TABELA;
                                arquivo.TAML_IMG    = that.TAML_IMG;
                                arquivo.TAMA_IMG    = that.TAMA_IMG;
                                arquivo.TIPO 	 	= modelFile.type;
                                arquivo.TAMANHO	 	= modelFile.size;
                                arquivo.OBSERVACAO 	= observacao;
                                arquivo.SEQUENCIA	= Number(sequencia);

                                arquivo.BINARIO = modelFile;
                                arquivo.CAMINHO = modelFile.$ngfBlobUrl;

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

                                that.arquivoAdicionado = true;

                                if(paimsg.NUM == 0){
                                    if(that.arquivoAdicionado == true){
                                        setTimeout(function() {
                                            $('.arquivo-container .scroll .form-group:last-of-type input.arquivo-binario').focus();
                                        }, 100);
                                    }else{
                                        try {

                                            that.data.splice(that.data.length - 1, 1);
                                            
                                        } catch (error) {
                                            
                                            that.data = [];
                                            that.data.splice(that.data.length - 1, 1);

                                        }
                                    }
                                }

                                setTimeout(function() {
                                    if(that.habilita_descricao){
                                        $('.input-descricao-file').focus();
                                    }else{
                                        if(that.habilita_ordem){
                                            $('.input-sequencia-file').focus();
                                        }
                                    }
                                }, 300);
                            },
                            function (e, btn){
                                var paimsg = this.pai;

                                if(paimsg.NUM == 0){
                                    if(that.arquivoAdicionado == true){
                                        setTimeout(function() {
                                            $('.arquivo-container .scroll .form-group:last-of-type input.arquivo-binario').focus();
                                        }, 100);
                                    }else{
                                        try {

                                            that.data.splice(that.data.length - 1, 1);
                                            
                                        } catch (error) {
                                            
                                            that.data = [];
                                            that.data.splice(that.data.length - 1, 1);

                                        }   
                                    }
                                }

                                setTimeout(function() {
                                    if(that.habilita_descricao){
                                        $('.input-descricao-file').focus();
                                    }else{
                                        if(that.habilita_ordem){
                                            $('.input-sequencia-file').focus();
                                        }
                                    }
                                }, 300);
                            }
                        ]);

                        msg.FILE  = file;
                        msg.NUM   = key;

                        setTimeout(function() {
                            if(that.habilita_descricao){
                                $('.input-descricao-file').focus();
                            }else{
                                if(that.habilita_ordem){
                                    $('.input-sequencia-file').focus();
                                }
                            }
                        }, 300);

                    }else{
                        showErro('Não é possível adicionar anexos maiores de '+that.tamanho_arquivo+'MB e "'+file.name+'" tem '+size.toLocaleString('pt-BR')+'MB, diminua a resolução ou comprima o arquivo e tente novamente.');
                    }
                });

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
            formatDataEnvio: function(data){
                return moment(data).format('DD/MM/YYYY HH:mm');
            },
            getHtml: function() {
                const email = $('#usuario-email').val();
            
                const html = `
                    <div class="grupo-btn-arquivos top">
                        <button
                            ng-if="vm.Arquivos.mostrarBotao"
                            ng-disabled="vm.Arquivos.disabled"
                            type="button"
                            class="btn btn-sm btn-info"
                            ng-click="vm.Arquivos.addArquivo()"
                            data-hotkey="alt+a"
                            style="margin-bottom: 5px;">
                            <span class="glyphicon glyphicon-plus"></span>
                            Adicionar Arquivo
                        </button>
                    </div>
                    <div
                        ng-if="vm.Arquivos.montarLista"
                        ng-repeat="arq in vm.Arquivos.data.slice().reverse() track by $index" class="arquivo-container">
                        <div class="form-group">
                            <input
                                type="file" multiple
                                class="form-control input-maior arquivo-binario"
                                accept="{{ vm.Arquivos.allowedExtensions.toString() }}"
                                ngf-select="vm.Arquivos.processarArquivo($event, arq)"
                                ng-model="arq.BINARIO"
                                ng-if="!arq.BINARIO">
                            <img
                                class="pre-visualizacao-arquivo"
                                src="{{arq.BINARIO.$ngfBlobUrl}}"
                                ngf-src="arq.BINARIO"
                                ng-click="arq.VER = true" style="display: block !important;"
                                ng-if="
                                    (arq.TIPO.indexOf('image') > -1) 
                                    || (arq.TIPO.indexOf('png') > -1) 
                                    || (arq.TIPO.indexOf('jpg') > -1)
                                    || (arq.TIPO.indexOf('webp') > -1) 
                                    || (arq.TIPO.indexOf('gif') > -1)">
                            <span
                                class="pre-visualizacao-arquivo A{{arq.CSS != unknown ? arq.CSS : arq.TIPO}}"
                                ng-click="arq.VER = true"
                                ng-if="
                                    (arq.TIPO.indexOf('image') == -1) 
                                    && (arq.TIPO.indexOf('png') == -1) 
                                    && (arq.TIPO.indexOf('jpg') == -1) 
                                    && (arq.TIPO.indexOf('webp') == -1) 
                                    && (arq.TIPO.indexOf('gif') == -1)"></span>
                            <input ng-if="vm.Arquivos.mostrar_nome && arq.BINARIO"
                                type="text"
                                class="form-control input-maior normal-case arquivo-nome"
                                disabled
                                ng-model="arq.DESC"
                                ng-value="arq.ID 
                                    ? arq.ID +' - '+ arq.NOME 
                                    : arq.NOME"
                                ng-click="arq.VER = true">
                            <input ng-if="vm.Arquivos.mostrar_descricao && arq.BINARIO"
                                type="text"
                                class="form-control input-maior normal-case arquivo-nome"
                                disabled
                                ng-model="arq.OBSERVACAO"
                                ng-click="arq.VER = true">
                            <input ng-if="vm.Arquivos.mostrar_ordem && arq.BINARIO"
                                type="number"
                                class="form-control input-menor normal-case arquivo-nome"
                                disabled
                                ng-model="arq.SEQUENCIA"
                                ng-click="arq.VER = true">
                            <button
                                type="button"
                                class="btn btn-info btn-ver-arquivo"
                                ng-click="arq.VER = true"
                                ng-disabled="!arq.ID || !arq.BINARIO"
                                style="display: none">
                                <span class="glyphicon glyphicon-eye-open"></span>
                            </button>
                            <button
                                type="button"
                                ng-disabled="vm.Arquivos.disabled"
                                class="btn btn-danger"
                                ng-click="vm.Arquivos.excluirArquivo(arq)">
                                <span class="glyphicon glyphicon-trash"></span>
                            </button>
                            <div
                                id="visualizar-arquivo"
                                class="visualizar-arquivo"
                                ng-show="arq.VER">
                                <span style="position: fixed; top: 63px; left: 28px; color: white; font-size: 15px;" 
                                    id="visualizar-arquivo-detalhes"
                                    class="visualizar-arquivo-detalhes">
                                    <span style="font-weight: bold;">ID:</span> {{arq.ID}},
                                    <span style="font-weight: bold;">Observação:</span> {{arq.OBSERVACAO}},
                                    <span style="font-weight: bold;">Sequência:</span> {{arq.SEQUENCIA}},
                                    <span style="font-weight: bold;">Data/Hora de Envio:</span> {{ vm.Arquivos.formatDataEnvio(arq.DATAHORA) }}
                                </span>
                                <button ng-click="vm.Arquivos.enviarArquivo('${email}', arq)"
                                    style="position: fixed; top: 60px; right: 215px;" type="button" class="btn btn-default">
                                    <span class="glyphicon glyphicon-envelope"></span>
                                    Enviar
                                </button>
                                <a style="display: block !important;"
                                    class="btn btn-default download-arquivo"
                                    href="{{arq.BINARIO.$ngfBlobUrl}}"
                                    ngf-src="arq.BINARIO"
                                    download
                                    data-hotkey="alt+b">
                                    <span class="glyphicon glyphicon-download"></span>
                                    Baixar
                                </a>
                                <button
                                    type="button"
                                    class="btn btn-default esconder-arquivo"
                                    data-hotkey="esc"
                                    ng-click="arq.VER = false">
                                    <span class="glyphicon glyphicon-chevron-left"></span>
                                    Voltar
                                </button>
                                <object type="application/pdf"
                                    data-host="${urlhost}"
                                    data="{{ (arq.ID > 0 ? '${urlhost}' : '') + arq.BINARIO.$ngfBlobUrl }}"
                                    ng-class="{imagem: (arq.TIPO.indexOf('image') > -1) 
                                        || (arq.TIPO.indexOf('png') > -1) 
                                        || (arq.TIPO.indexOf('jpg') > -1) 
                                        || (arq.TIPO.indexOf('webp') > -1) 
                                        || (arq.TIPO.indexOf('gif') > -1)}"
                                    ng-if="(arq.TIPO.indexOf('pdf') > -1)"></object>
                                <img
                                    class=""
                                    style="width: 100%; object-fit: scale-down; height: calc(100vh - 160px); display: block !important;"
                                    src="{{arq.BINARIO.$ngfBlobUrl}}"
                                    ngf-src="arq.BINARIO"
                                    ng-if="(arq.TIPO.indexOf('image') > -1) 
                                        || (arq.TIPO.indexOf('png') > -1) 
                                        || (arq.TIPO.indexOf('jpg') > -1) 
                                        || (arq.TIPO.indexOf('webp') > -1) 
                                        || (arq.TIPO.indexOf('gif') > -1)">
                                <span
                                    style="width: calc(300px);
                                            position: absolute;
                                            height: 10%;
                                            background-position: center;
                                            background-repeat: no-repeat;
                                            background-size: contain;
                                            left: calc(50% - 150px);"
                                    class="A{{arq.CSS != unknown ? arq.CSS : arq.TIPO}}"
                                    ng-if=" (arq.TIPO.indexOf('image') == -1) 
                                        && (arq.TIPO.indexOf('pdf') == -1) 
                                        && (arq.TIPO.indexOf('png') == -1) 
                                        && (arq.TIPO.indexOf('jpg') == -1) 
                                        && (arq.TIPO.indexOf('webp') == -1) 
                                        && (arq.TIPO.indexOf('gif') == -1)"></span>
                                <label
                                    style="margin-top: 100px; 
                                    text-align: center; 
                                    font-size: 20px; 
                                    font-weight: normal; 
                                    color: white;"
                                    class="lbl-visualizacao-indisponivel"
                                    ng-if="(arq.TIPO.indexOf('image') == -1) 
                                        && (arq.TIPO.indexOf('pdf') == -1) 
                                        && (arq.TIPO.indexOf('png') == -1) 
                                        && (arq.TIPO.indexOf('jpg') == -1) 
                                        && (arq.TIPO.indexOf('webp') == -1) 
                                        && (arq.TIPO.indexOf('gif') == -1)">
                                    Visualização indisponível!
                                </label>
                            </div>
                        </div>
                    </div>
                `;
            
                return html;
            }    
        }

        /**
         * Return the constructor function
         */
        return ArquivosGC;

    }

})(window, window.angular);