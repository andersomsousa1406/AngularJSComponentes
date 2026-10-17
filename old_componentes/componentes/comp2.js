(function(window, angular) {
    'use strict';

	AngularFindModule.factory('TabelaHTML' , TabelaHTML );
	
    TabelaHTML.$inject = [
		'$rootScope',
		'$parse',
		'$q',
        '$compile',
		'gcCollection',
		'$ajax',		
		'$timeout',
		'$sce'
    ];

	function TabelaHTML($rootScope, $parse, $q, $compile, gcCollection, $ajax, $timeout, $sce) {

        // Private variables.
        var obj      = null;
        var selected = null;
        
	    /**
	     * Constructor, with class name
	     */
		
		 function TabelaHTML() {
            
            obj = this; 

            this.getNew = getNew;
            this.default_table = {
                
            };
        }

        function getNew(){
            var that    = this;
            var table   = angular.copy(that.default_table);

            table.tabela_id = 'tabela_html_'+Math.floor((Math.random() * 9999999) + 1);

            return table;
        }
		
            
	    /**
	     * Return the constructor function
	     */
	    return TabelaHTML;
	};
	
})(window, window.angular);