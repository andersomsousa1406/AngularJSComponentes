(function(window, angular) {
    'use strict';

	AngularFindModule.factory('ControllerService' , ControllerService );
	
    ControllerService.$inject = [
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

	function ControllerService($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce, gScope) {

        // Private variables.
        var obj = null;
        
	    /**
	     * Constructor, with class name
	     */
		function ControllerService(controler = {}, actions = {}) {
            
            obj = this; 
            obj.defaultActions = defaultActions;

            obj.init = function() {
                try {
                    console.log(' ----> ControllerService');

                    let action = $('#_action_app_page').val();

                    if(!(typeof action === 'undefined' || action === null || action === '')) {
                        if(typeof actions[action] !== 'undefined' && typeof actions[action] == 'function') {
                            actions[action](controler, obj);
                        }else{
                            if(typeof obj.defaultActions[action] !== 'undefined' && typeof obj.defaultActions[action] == 'function') {
                                obj.defaultActions[action](controler, obj);
                            }
                        }
                    }
                } catch (error) {
                    console.log('Error in ControllerService:', error);
                }
            }

            $timeout(function() {
                obj.init();
            },1000);
        }

        var defaultActions = {
            create: function(controler, obj) {
                if(typeof controler.TabelaPrincipal !== 'undefined') {
                    let tabela = controler.TabelaPrincipal;

                    if(typeof tabela.model_tabela !== 'undefined' && typeof tabela.model_tabela.incluir == 'function') {
                        tabela.model_tabela.incluir();
                    }else {
                        showErro('Método incluir não encontrado, entre em contato o suporte.');
                    }
                }else {
                    showErro('Método incluir não encontrado, entre em contato o suporte.');
                }
            }
        };
            
	    /**
	     * Return the constructor function
	     */
	    return ControllerService;
	};
	
})(window, window.angular);