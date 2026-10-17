(function(window, angular) {
    'use strict';

	AngularFindModule.factory('ImportarArquivos' , ImportarArquivos );
	
    ImportarArquivos.$inject = [
		'$rootScope',
		'$parse',
		'$q',
        '$compile',
		'gcCollection',
		'$ajax',		
		'$timeout',
        '$sce',
        'Confirmacao',
        'TabelaJS'
    ];

	function ImportarArquivos($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce, Confirmacao, TabelaJS) {

        // Private variables.
        var obj      = null;
        
	    /**
	     * Constructor, with class name
	     */
		 function ImportarArquivos() {
            
            obj = this; 

            obj.Confirmacao  		= new Confirmacao();
		    obj.Confirme     		= obj.Confirmacao.getNew('vm.ImportarArquivos.Confirme');

            obj.SELECTED = {
                ARRAY_CABECALHO_CSV : [],
                ARRAY_DADOS_CSV 	: [],
                HABILITA_ROWS 	    : false,
                CABECALHO_ARQUIVO   : '1'
            };

            obj.COLUNAS = [];

            obj.INFO = {
                TITULO : 'Importação por Arquivo',
                EXT    : 'ALL',
                LEGEND : ''
            };

            obj.selectedFile        = selectedFile;
            obj.selectedFile2       = selectedFile2;
            obj.loadHeaderCsv       = loadHeaderCsv;
            obj.loadHeaderAll       = loadHeaderAll;
            obj.loadRows            = loadRows;
            obj.changeCabecalhoFile = changeCabecalhoFile;
            obj.init                = init;
            obj.importar            = importar;
            obj.cancelar1           = cancelar1;
            obj.cancelar2           = cancelar2;
            obj.iniciar             = iniciar;
            obj.setType             = setType;
            obj.formatData          = formatData;
            obj.validarDados        = validarDados;
            obj.validarCampos       = validarCampos;
            obj.postData            = postData;
            obj.confirmar           = confirmar;
            obj.montarTabela        = montarTabela;
            obj.loadFileConvert     = loadFileConvert;
            obj.selectedSeparator   = selectedSeparator;

            obj.model = {};

            $timeout(function(){
                obj.init();
            },100);
        }

        function montarTabela(colunas, campo){
            var that = this;

            if(typeof that.Tabela == 'undefined'){
                that.Tabela     	    	            = new TabelaJS();
                that.TabelaPrincipal                	= that.Tabela.getNew();
                that.TabelaPrincipal.componente     	= '#tabela_arquivo_importar';
                that.TabelaPrincipal.model          	= 'vm.ImportarArquivos.TabelaPrincipal';
                that.TabelaPrincipal.titulo         	= 'Importação de Arquivos';
                that.TabelaPrincipal.filtro         	= '';
                that.TabelaPrincipal.ID             	= 'tabela_impot_arquivo';
                that.TabelaPrincipal.HEIGHT         	= 'calc(100vh - 260px)';
                that.TabelaPrincipal.ORDER_BY       	= campo;
                that.TabelaPrincipal.zoom           	= 90;
                that.TabelaPrincipal.model_selected 	= 'vm.ImportarArquivos.model';
                that.TabelaPrincipal.infinite_scroll	= false;
                that.TabelaPrincipal.vs_scroll		    = false;
                that.TabelaPrincipal.model_tabela 	    = that.model;
                that.TabelaPrincipal.tipo_tabela	  	= 'normal';
                that.TabelaPrincipal.filtro_visible 	= true;
                that.TabelaPrincipal.filtro_status_v	= false;
                that.TabelaPrincipal.status_visible 	= true;
                that.TabelaPrincipal.total_visible  	= false;
                that.TabelaPrincipal.habilita_botao_next= false;
                that.TabelaPrincipal.total_registros	= true;
                that.TabelaPrincipal.total_dados	  	= 0;
                that.TabelaPrincipal.delete_item    	= false;
            }

            that.TabelaPrincipal.setTableCheckList(campo, 'item');
            that.TabelaPrincipal.COLUNAS = colunas;
            that.TabelaPrincipal.compile();
        }

        function postData(dados){
            return dados;
        }

        function formatData(dados){
            return dados;
        }

        function validarDados(dados){
            return $q(function(resolve, reject){
				resolve({valido : true, retorno : dados});
			});
        }
        
        function setType(tipo){
            var that = this;

            if(tipo == 'CSV'){
                that.INFO = {
                    TITULO  : 'Importação por Arquivo CSV',
                    EXT     : 'CSV',
                    LEGEND  : 'CSV'
                };
            }

            if(tipo == 'ALL'){
                that.INFO = {
                    TITULO  : 'Importação por Arquivo',
                    EXT     : 'ALL',
                    LEGEND  : ''
                };
            }
        }

        function iniciar(){
            var that = this;

            var html = '';

            that.SELECTED = {
                ARRAY_CABECALHO_CSV : [],
                ARRAY_DADOS_CSV 	: [],
                HABILITA_ROWS 	    : false,
                CABECALHO_ARQUIVO   : '1'
            };

            angular.forEach(that.COLUNAS , function(item, key){

                var desc_aux = '';

                if(typeof item.DESC_TIPO != 'undefined'){
                    desc_aux = '<small style="font-size: 80% !important; margin-left: 5px !important;">' + item.DESC_TIPO + '</small>';
                }
                
                html = html + '<div style="margin-top: 15px;">';
                html = html + '		<div class="labelOrdemCsv itn-imp-'+item.CAMPO+' '+(item.OBRIGATORIO == true ? 'required' : '')+'" data-campo="'+item.CAMPO+'">'+(key + 1)+'ª - ' + item.DESCRICAO + desc_aux + '</div>';
                html = html + '     <div class="box-site itn-camp-'+item.CAMPO+' inner-content colunas"></div>';
                html = html + '</div>';
            });

            $('.div-impor-file-campos').html(html);
            $('#modal-ImportarArquivos').modal('show');

            that.init();
        }

        function cancelar1(){
            $('#modal-ImportarArquivos').modal('hide');
        }

        function cancelar2(){
            $('#modal-ImportarArquivos-conf').modal('hide');
        }

        function validarCampos(){
            var that = this;

            var valido = true;
            var cmps   = [];

            that.SELECTED.DADOS_CSV = [];
            var dadosCsv = obj.SELECTED.ARRAY_DADOS_CSV;

            angular.forEach(that.COLUNAS, function(item, key){
                var ole = $(".itn-camp-"+item.CAMPO);
                    ole = $(ole).find("ul:first-child");
                    ole = $(ole).find('li');

                item.INDEX_CAMPO = $(ole).attr("id");
                item.INDEX_CAMPO = typeof item.INDEX_CAMPO != 'undefined' && !isNaN(Number(item.INDEX_CAMPO)) ? Number(item.INDEX_CAMPO) : -1;
            });

            var campos = '';

			angular.forEach(dadosCsv, function(item, key){
                var obj_add = {};

                angular.forEach(that.COLUNAS, function(coll, key){
                    if(coll.INDEX_CAMPO >= 0){
                        obj_add[coll.CAMPO] = item[coll.INDEX_CAMPO];
                    }else{
                        if(coll.OBRIGATORIO == true){
                            valido = false;
                            
                            var add = true;

                            angular.forEach(cmps, function(cmp, key){
                                if(coll.DESCRICAO == cmp){
                                    add = false;
                                }
                            });

                            if(add){
                                cmps.push(coll.DESCRICAO);
                                campos = campos == '' ? coll.DESCRICAO : campos + ', ' + coll.DESCRICAO;
                            }
                        }
                    }
                });

                that.SELECTED.DADOS_CSV.push(obj_add);
            });

            if(!valido){
                showAlert('Os campos "'+campos+'" são obrigatórios.');
            }

            return valido;
        }

        function confirmar(){
            var that = this;

            function executar(){
                var dados = [];

                angular.forEach(that.SELECTED.DADOS_CSV, function(item, key){
                    if(item.CHECKED == true){
                        dados.push(item);
                    }
                });

                if(dados.length > 0){
                    $('#modal-ImportarArquivos').modal('hide');
                    $('#modal-ImportarArquivos-conf').modal('hide');
                    that.postData(dados);
                }else{
                    showErro('Nenhum registro selecionado!');
                }
            }

            that.Confirme.add(1,'<h4>Confirmação</h4>',
            'Deseja realmente importar dados desse arquivo?'
            , [
                that.Confirme.obtn_sim,
                that.Confirme.obtn_cancelar                
                ],[
                function (e, btn){
                    executar();
                },
                function (e, btn){ 
                    
                }
            ]);

            $timeout(function(){
                $('.confirme-footer').find('.btn-primary').focus();
            },300);
        }

        function importar(){
            var that = this;

            function executar(){
                var dados = that.formatData(that.SELECTED.DADOS_CSV);

                if(dados.length > 0){
                    that.validarDados(dados)
                        .then(function(retorno){
                            var valido  = retorno.valido;
                            var retorno = retorno.retorno;

                            if(valido == true){
                                that.SELECTED.DADOS_CSV = retorno;

                                that.TabelaPrincipal.merge(retorno);
                                $('#modal-ImportarArquivos-conf').modal('show');
                            }
                        })
                        .catch(function(erro){
                            showErro(erro);
                        });
                }else{
                    showErro('Nenhum arquivo selecionado!');
                }
            }

            if(that.validarCampos()){
                executar();
            }
				
        }

        function init(){


			$(".box-site").sortable({
                connectWith: '.box-site',
                cursor      : 'move',               //Cursor enquanto arrasta itens
                tolerance   : 'pointer',            //Em que ponto poderá ser soltados os itens
                delay       : 150,                  //Tempo em milisegundos que demora para começar a arrastar os itens
                distance    : 5,    
                revert      : false,                 //Ativa o efeito ao soltar suavisado
                cursorAt    : { left: 5 , top: 5},          //Posição do cursor em relação ao item que está sendo arrastado
				receive: function(event, ui) {
					var classeList = $(this).attr('class').split(/\s+/);
					
					var boolean = false;

					for (var index = 0; index < classeList.length; index++) {
						if(trim_null(classeList[index]) == 'principal'){
							boolean = true;
						}
					}
					
					if(boolean == false){
						if ($(this).children().length > 1) {
							$(ui.sender).sortable('cancel');
						}
					}
					
                },
                placeholder: {
                    element: function(currentItem) {

                        var style= '';
                        style = style + 'padding: 0.12rem;';
                        style = style + 'background-color: #11a90f;';
                        style = style + 'color: white;';
                        style = style + 'text-align: center;';
                        style = style + 'border-radius: 3px;';
                        style = style + 'width: 200px !important;';
                        

                        console.log(currentItem);

                        return $('<ul><li style="'+style+'" class="soltar-aqui"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span> Soltar Aqui</li></ul>')[0];
                    },
                    update: function(container, p) {
                        return;
                    }
                }
			}).disableSelection();
			  
			$(".sup-box").sortable({ connectWith: '.sup-box' });
        }

        function selectedFile(file){
            var that    = this;

			var timer = $timeout(function (){
				if(typeof file != 'undefined' && file != null){
					that.SELECTED.FILE = file;

                    if(that.INFO.EXT == 'CSV'){
                        that.loadHeaderCsv();
                    }

                    if(that.INFO.EXT == 'ALL'){
                        that.loadHeaderAll();
                    }

                    if(that.INFO.EXT == 'CONV'){
                        that.loadFileConvert();
                    }

				}else{
					that.SELECTED.ARRAY_CABECALHO_CSV 	= [];
					that.SELECTED.ARRAY_DADOS_CSV 		= [];
					that.SELECTED.HABILITA_ROWS 	    = false;
				}

				$timeout.cancel(timer);
				
            });
            
        }

        function selectedFile2(file){
            var that    = this;

			var timer = $timeout(function (){
				if(typeof file != 'undefined' && file != null){
					that.SELECTED.FILE = file;
                    that.loadFileConvert();

				}else{
					that.SELECTED.ARRAY_CABECALHO_CSV 	= [];
					that.SELECTED.ARRAY_DADOS_CSV 		= [];
					that.SELECTED.HABILITA_ROWS 	    = false;
				}

				$timeout.cancel(timer);
				
            });
            
        }

        function selectedSeparator(){
            var that = this;

            that.SELECTED.SEPARATOR = ';';

            return $q(function(resolve, reject){
                function executar(){
                    var dados = that.SELECTED.SEPARATOR;

                    if(dados == 'TAB'){
                        dados = /\t/;
                    }

                    resolve(dados);
                }

                that.Confirme.add(1,'<h4>Confirmação</h4>',
                'Informe o Separador do Arquivo Selecionado: <br>'+
                '<div class="row" style="margin-left: 0px; margin-top: 10px;">'+
                '   <div class="form-group">'+
                '       <label ttitle="Informe o separador existente no arquivo. <br>Exemplos: <b>\';\'</b>, <b>\',\'</b>, <b>\'|\'</b>, <b>\'TAB\'</b>, ...">Separador:</label>'+
                '       <input type="text" class="form-control input-menor input-separator" required ng-model="vm.ImportarArquivos.SELECTED.SEPARATOR">'+
                '   </div>'+
                '</div>'
                , [
                    that.Confirme.obtn_sim,
                    that.Confirme.obtn_cancelar                
                    ],[
                    function (e, btn){
                        executar();
                    },
                    function (e, btn){
                        $('#modal-ImportarArquivos').modal('hide');
                        reject('Nenhum separador informado! Importação Cancelada.');
                    }
                ]);

                $timeout(function(){
                    $('.confirme-body').find('.input-separator').focus();
                },300);
            });
        }
        
        function loadHeaderCsv(){
            var that    = this;

            // var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
            
            var nome = that.SELECTED.FILE.name;
            var ext = nome.split('.').pop();
            // if(trim_null(ext) != ''){
            //     that.INFO.LEGEND = ext.toUpperCase();
            // }

            // if( that.SELECTED.FILE.type == 'application/vnd.ms-excel' || that.SELECTED.FILE.type == 'text/plain' ){
			// if (regex.test(that.SELECTED.FILE.name.toLowerCase())) {
			if ( ext.toUpperCase() == 'CSV' ) {
				if (typeof (FileReader) != "undefined") {
					var reader = new FileReader();
					
					reader.onload = function (e) {

						var allTextLines = e.target.result.split(/\r\n|\n/);
                        var headersCsv = allTextLines[0].split('","');
                        
                        if(headersCsv.length == 1){
                            headersCsv = allTextLines[0].split(',');
                        }
                        if(headersCsv.length == 1){
                            headersCsv = allTextLines[0].split('|');
                        }
                        if(headersCsv.length == 1){
                            headersCsv = allTextLines[0].split('    ');
                        }
                        if(headersCsv.length == 1){
                            headersCsv = allTextLines[0].split(';');
                        }

						var headers	   = [];
						var lines	   = [];

						for (var index = 0; index < headersCsv.length; index++){
							var header 			= {};
							header.INDEX 		= index;

							if(trim_null(that.SELECTED.CABECALHO_ARQUIVO) == '1'){
								header.HEADER 		= headersCsv[index].replace(/[^\w\s]/gi, '');
							}else{
								header.HEADER 		= 'Coluna ' + (index + 1);
							}
							
							headers.push(header);
						}
						
						for ( var i = 0; i < allTextLines.length; i++) {
							if(trim_null(that.SELECTED.CABECALHO_ARQUIVO) == '1'){
								if(i > 0){
									lines = that.loadRows(allTextLines, headers, lines, i);
								}
							}else{
								lines = that.loadRows(allTextLines, headers, lines, i);
							}
						}

						$rootScope.$apply(function(){
							that.SELECTED.HABILITA_ROWS 		= true;
							that.SELECTED.ARRAY_CABECALHO_CSV 	= headers;
							that.SELECTED.ARRAY_DADOS_CSV 		= lines;

							
							that.SELECTED.QUANTIDADE_TOTAL_REGISTROS = lines.length;
							console.log(that.SELECTED.ARRAY_DADOS_CSV);
					
						});
					}
					
					reader.readAsText(that.SELECTED.FILE);
					
				} else {
					that.SELECTED.HABILITA_ROWS 			= false;
					showErro("Esse Navegador não Suporta HTML5");
				}
			} else {
				that.SELECTED.HABILITA_ROWS 			= false;
				showErro("Informe um Arquivo CSV")
			}
        }

        function loadHeaderAll(){
            var that = this;

            that.SELECTED.SEPARATOR = '';

            function executar(){
                var nome = that.SELECTED.FILE.name;
                var ext = nome.split('.').pop();
                if(trim_null(ext) != ''){
                    that.INFO.LEGEND = ext.toUpperCase();
                }

                // if( that.SELECTED.FILE.type == 'application/vnd.ms-excel' || that.SELECTED.FILE.type == 'text/plain' ){
                // if (regex.test(that.SELECTED.FILE.name.toLowerCase())) {
                if ( ext.toUpperCase() == 'CSV' || ext.toUpperCase() == 'TXT') {
                    // var nome = that.SELECTED.FILE.name;
                    // var ext = nome.split('.').pop();
                    // if(trim_null(ext) != ''){
                    //     that.INFO.LEGEND = ext.toUpperCase();
                    // }
                    if (typeof (FileReader) != "undefined") {
                        var reader = new FileReader();

                        var readLanguage = "";
                        if(ext.toUpperCase() == 'TXT'){readLanguage = "UTF-8";}else if(ext.toUpperCase() == 'CSV'){readLanguage = "windows-1252";}

                        reader.onload = function () {

                            var allTextLines = '\ufeff'+reader.result;
                            allTextLines = allTextLines.split(/\r\n|\n/);

                            var headersAll = allTextLines[0].split(that.SELECTED.SEPARATOR);

                            // var headersAll = allTextLines[0].split('","');
                            //
                            // }
                            // if(headersAll.length == 1){
                            //     headersAll = allTextLines[0].split(',');
                            // }
                            // if(headersAll.length == 1){
                            //     headersAll = allTextLines[0].split('|');
                            // }
                            // if(headersAll.length == 1){
                            //     headersAll = allTextLines[0].split('    ');
                            // }
                            // if(headersAll.length == 1){
                            //     headersAll = allTextLines[0].split(';');
                            // }
                            if(headersAll.length == 1){
                                showErro('Falha ao identificar o separdor do arquivo! O separador informado não foi encontrado.');
                            }

                            var headers	   = [];
                            var lines	   = [];

                            for (var index = 0; index < headersAll.length; index++){
                                var header 			= {};
                                header.INDEX 		= index;

                                if(trim_null(that.SELECTED.CABECALHO_ARQUIVO) == '1'){
                                    header.HEADER 		= headersAll[index].replace(/[^\w\s]/gi, '');
                                }else{
                                    header.HEADER 		= 'Coluna ' + (index + 1);
                                }

                                headers.push(header);
                            }

                            var TextLines = [];
                            for ( var i = 0; i < allTextLines.length; i++) {
                                var element = allTextLines[i];

                                if(trim_null(that.SELECTED.CABECALHO_ARQUIVO) == '1'){
                                    if(i > 0){
                                        lines = that.loadRows(allTextLines, headers, lines, i);
                                        if(trim_null(element) != ''){
                                            TextLines.push(angular.copy(element));
                                        }
                                    }
                                }else{
                                    lines = that.loadRows(allTextLines, headers, lines, i);
                                    if(trim_null(element) != ''){
                                        TextLines.push(angular.copy(element));
                                    }
                                }
                            }

                            if(TextLines.length != lines.length){
                                showErro('O Separador informado não coincide com todas as linhas do arquivo.');
                            }

                            $rootScope.$apply(function(){
                                that.SELECTED.HABILITA_ROWS 		= true;
                                that.SELECTED.ARRAY_CABECALHO_CSV 	= headers;
                                that.SELECTED.ARRAY_DADOS_CSV 		= lines;


                                that.SELECTED.QUANTIDADE_TOTAL_REGISTROS = lines.length;
                                console.log(that.SELECTED.ARRAY_DADOS_CSV);
                        
                            });
                        }

                        reader.readAsText(that.SELECTED.FILE, readLanguage);

                    }else{
                        that.SELECTED.HABILITA_ROWS 			= false;
                        showErro("Esse Navegador não Suporta HTML5");
                    }
                }else{
                    that.SELECTED.HABILITA_ROWS 			= false;
                    showErro("Informe um Arquivo Válido")
                }

            }

            // var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;,
            that.selectedSeparator().then(function(dados){
                that.SELECTED.SEPARATOR = dados;
                executar();
            }, function(erro){
                showErro(erro);
            });

            
        }
        
        function loadFileConvert(){
            var that    = this;

            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                
                reader.onload = function (e) {
                    var allTextLines = e.target.result + "";
                    
                    allTextLines = allTextLines.replaceAll("Ã€", "À");
                    allTextLines = allTextLines.replaceAll("Ã‚", "Â");
                    allTextLines = allTextLines.replaceAll("Ãƒ", "Ã");
                    allTextLines = allTextLines.replaceAll("Ã„", "Ä");
                    allTextLines = allTextLines.replaceAll("Ã…", "Å");
                    allTextLines = allTextLines.replaceAll("Ã†", "Æ");
                    allTextLines = allTextLines.replaceAll("Ã‡", "Ç");
                    allTextLines = allTextLines.replaceAll("Ãˆ", "È");
                    allTextLines = allTextLines.replaceAll("Ã‰", "É");
                    allTextLines = allTextLines.replaceAll("ÃŠ", "Ê");
                    allTextLines = allTextLines.replaceAll("Ã‹", "Ë");
                    allTextLines = allTextLines.replaceAll("ÃŒ", "Ì");
                    allTextLines = allTextLines.replaceAll("ÃŽ", "Î");
                    allTextLines = allTextLines.replaceAll("Ã‘", "Ñ");
                    allTextLines = allTextLines.replaceAll("Ã’", "Ò");
                    allTextLines = allTextLines.replaceAll("Ã“", "Ó");
                    allTextLines = allTextLines.replaceAll("Ã”", "Ô");
                    allTextLines = allTextLines.replaceAll("Ã•", "Õ");
                    allTextLines = allTextLines.replaceAll("Ã–", "Ö");
                    allTextLines = allTextLines.replaceAll("Ã—", "×");
                    allTextLines = allTextLines.replaceAll("Ã˜", "Ø");
                    allTextLines = allTextLines.replaceAll("Ã™", "Ù");
                    allTextLines = allTextLines.replaceAll("Ãš", "Ú");
                    allTextLines = allTextLines.replaceAll("Ã›", "Û");
                    allTextLines = allTextLines.replaceAll("Ãœ", "Ü");
                    allTextLines = allTextLines.replaceAll("Ãž", "Þ");
                    allTextLines = allTextLines.replaceAll("ÃŸ", "ß");
                    allTextLines = allTextLines.replaceAll("Ã¡", "á");
                    allTextLines = allTextLines.replaceAll("Ã¢", "â");
                    allTextLines = allTextLines.replaceAll("Ã£", "ã");
                    allTextLines = allTextLines.replaceAll("Ã¤", "ä");
                    allTextLines = allTextLines.replaceAll("Ã¥", "å");
                    allTextLines = allTextLines.replaceAll("Ã¦", "æ");
                    allTextLines = allTextLines.replaceAll("Ã§", "ç");
                    allTextLines = allTextLines.replaceAll("Ã¨", "è");
                    allTextLines = allTextLines.replaceAll("Ã©", "é");
                    allTextLines = allTextLines.replaceAll("Ãª", "ê");
                    allTextLines = allTextLines.replaceAll("Ã«", "ë");
                    allTextLines = allTextLines.replaceAll("Ã¬", "ì");
                    allTextLines = allTextLines.replaceAll("Ã®", "î");
                    allTextLines = allTextLines.replaceAll("Ã¯", "ï");
                    allTextLines = allTextLines.replaceAll("Ã°", "ð");
                    allTextLines = allTextLines.replaceAll("Ã±", "ñ");
                    allTextLines = allTextLines.replaceAll("Ã²", "ò");
                    allTextLines = allTextLines.replaceAll("Ã³", "ó");
                    allTextLines = allTextLines.replaceAll("Ã´", "ô");
                    allTextLines = allTextLines.replaceAll("Ãµ", "õ");
                    allTextLines = allTextLines.replaceAll("Ã¶", "ö");
                    allTextLines = allTextLines.replaceAll("Ã·", "÷");
                    allTextLines = allTextLines.replaceAll("Ã¸", "ø");
                    allTextLines = allTextLines.replaceAll("Ã¹", "ù");
                    allTextLines = allTextLines.replaceAll("Ãº", "ú");
                    allTextLines = allTextLines.replaceAll("Ã»", "û");
                    allTextLines = allTextLines.replaceAll("Ã¼", "ü");
                    allTextLines = allTextLines.replaceAll("Ã½", "ý");
                    allTextLines = allTextLines.replaceAll("Ã¾", "þ");
                    allTextLines = allTextLines.replaceAll("Ã¿", "ÿ");
                    allTextLines = allTextLines.replaceAll("â‚", "€");
                    allTextLines = allTextLines.replaceAll("â€", "‚");
                    allTextLines = allTextLines.replaceAll("Æ’", "ƒ");
                    allTextLines = allTextLines.replaceAll("â€", "„");
                    allTextLines = allTextLines.replaceAll("â€", "…");
                    allTextLines = allTextLines.replaceAll("â€", "†");
                    allTextLines = allTextLines.replaceAll("â€", "‡");
                    allTextLines = allTextLines.replaceAll("Ë†", "ˆ");
                    allTextLines = allTextLines.replaceAll("â€", "‰");
                    allTextLines = allTextLines.replaceAll("â€", "‹");
                    allTextLines = allTextLines.replaceAll("Å’", "Œ");
                    allTextLines = allTextLines.replaceAll("Å½", "Ž");
                    allTextLines = allTextLines.replaceAll("â€˜", "‘");
                    allTextLines = allTextLines.replaceAll("â€", "’");
                    allTextLines = allTextLines.replaceAll("â€", "“");
                    allTextLines = allTextLines.replaceAll("â€", "”");
                    allTextLines = allTextLines.replaceAll("â€", "•");
                    allTextLines = allTextLines.replaceAll("â€", "–");
                    allTextLines = allTextLines.replaceAll("â€", "—");
                    allTextLines = allTextLines.replaceAll("Ëœ", " ");
                    allTextLines = allTextLines.replaceAll("â„", "™");
                    allTextLines = allTextLines.replaceAll("Å¡", "š");
                    allTextLines = allTextLines.replaceAll("â€", "›");
                    allTextLines = allTextLines.replaceAll("Å“", "œ");
                    allTextLines = allTextLines.replaceAll("Å¾", "ž");
                    allTextLines = allTextLines.replaceAll("Å¸", "Ÿ");
                    allTextLines = allTextLines.replaceAll("Â¡", "¡");
                    allTextLines = allTextLines.replaceAll("Â¢", "¢");
                    allTextLines = allTextLines.replaceAll("Â£", "£");
                    allTextLines = allTextLines.replaceAll("Â¤", "¤");
                    allTextLines = allTextLines.replaceAll("Â¥", "¥");
                    allTextLines = allTextLines.replaceAll("Â¦", "¦");
                    allTextLines = allTextLines.replaceAll("Â§", "§");
                    allTextLines = allTextLines.replaceAll("Â¨", "¨");
                    allTextLines = allTextLines.replaceAll("Â©", "©");
                    allTextLines = allTextLines.replaceAll("Âª", "ª");
                    allTextLines = allTextLines.replaceAll("Â«", "«");
                    allTextLines = allTextLines.replaceAll("Â¬", "¬");
                    allTextLines = allTextLines.replaceAll("Â®", "®");
                    allTextLines = allTextLines.replaceAll("Â¯", "¯");
                    allTextLines = allTextLines.replaceAll("Â°", "°");
                    allTextLines = allTextLines.replaceAll("Â±", "±");
                    allTextLines = allTextLines.replaceAll("Â²", "²");
                    allTextLines = allTextLines.replaceAll("Â³", "³");
                    allTextLines = allTextLines.replaceAll("Â´", "´");
                    allTextLines = allTextLines.replaceAll("Âµ", "µ");
                    allTextLines = allTextLines.replaceAll("Â¶", "¶");
                    allTextLines = allTextLines.replaceAll("Â·", "·");
                    allTextLines = allTextLines.replaceAll("Â¸", "¸");
                    allTextLines = allTextLines.replaceAll("Â¹", "¹");
                    allTextLines = allTextLines.replaceAll("Âº", "º");
                    allTextLines = allTextLines.replaceAll("Â»", "»");
                    allTextLines = allTextLines.replaceAll("Â¼", "¼");
                    allTextLines = allTextLines.replaceAll("Â½", "½");
                    allTextLines = allTextLines.replaceAll("Â¾", "¾");
                    allTextLines = allTextLines.replaceAll("Â¿", "¿");

                    var csvData = '\ufeff'+ allTextLines;
                    var blob = new Blob([ csvData ], {
                        type : "application/csv;charset=utf-8;"
                    });

                    var link = document.createElement("a");
                    var csvUrl = URL.createObjectURL(blob);
                    link.href = csvUrl;
                    link.style = "visibility:hidden";
                    link.download = 'file.txt';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    csvData = '';
                    blob    = '';
                }
                
                reader.readAsText(that.SELECTED.FILE);
                
            } else {
                that.SELECTED.HABILITA_ROWS = false;
                showErro("Esse Navegador não Suporta HTML5");
            }

		}

        function splitCSV(str, delimiter = ",") {
            const regex = new RegExp(
                `${delimiter}(?=(?:[^"]*"[^"]*")*[^"]*$)`
            );
            return str.split(regex).map(v => v.replace(/^"|"$/g, ""));
        }

		function loadRows(allTextLines, headers, lines, i){
            var that    = this;

            if(that.INFO.EXT == 'ALL'){
                var data = allTextLines[i].split(that.SELECTED.SEPARATOR);
            }else if(that.INFO.EXT == 'CSV'){

                var data = splitCSV(allTextLines[i], ',');
                
                if(data.length != headers.length){
                    data = splitCSV(allTextLines[i], ',');
                }
                if(data.length != headers.length){
                    data = splitCSV(allTextLines[i], '|');
                }
                if(data.length != headers.length){
                    data = splitCSV(allTextLines[i], '    ');
                }
                if(data.length != headers.length){
                    data = splitCSV(allTextLines[i], ';');
                }
            }

			if (data.length == headers.length) {
				var tarr = [];
				for ( var j = 0; j < headers.length; j++) {
					var dado = data[j].replaceAll('\"', '');
					var dado2 = dado.replaceAll('\"\"', '');
					var dado3 = dado2.replaceAll('\'', '');
					var dado4 = dado3.replaceAll('\'\'', '');

					tarr.push(dado4);
				}

                var naoVazios = false;

                angular.forEach(tarr, function(item, key){
                    if(trim_null(item) != ''){
                        naoVazios = true;
                    }
                });

                if(naoVazios){
				    lines.push(tarr);
                }
			}

			return lines;
		}

		function changeCabecalhoFile(){
            var that    = this;

			$("input[type=file]").val('');
			that.SELECTED.ARRAY_CABECALHO_CSV 	= [];
			that.SELECTED.ARRAY_DADOS_CSV 		= [];
			that.SELECTED.HABILITA_ROWS 			= false;
        }
        
	    /**
	     * Return the constructor function
	     */
	    return ImportarArquivos;
	};
	
})(window, window.angular);