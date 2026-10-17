'use strict';

window.AngularFindModule = angular.module('gcLegacyEngine', []);

require('../../old_componentes/componentes/TabelaHTML.js');
require('../../old_componentes/componentes/Confirmacao.js');
require('../../old_componentes/componentes/TabelaJS.js');
require('../../old_componentes/componentes/Consulta.js');
require('../../old_componentes/componentes/ConsultaBootstrap4.js');
require('../../old_componentes/componentes/ConsultaBootstrap5.js');
require('../../old_componentes/componentes/ConsultaMultipla.js');
require('../../old_componentes/componentes/InputJS.js');
require('../../old_componentes/componentes/Arquivos.js');
require('../../old_componentes/componentes/ArquivosGC.js');
require('../../old_componentes/componentes/ArquivosJS.js');
require('../../old_componentes/componentes/ImportarArquivos.js');
require('../../old_componentes/componentes/Historico.js');
require('../../old_componentes/componentes/FluxoOperacional.js');
require('../../old_componentes/componentes/FactoryDefault.js');
require('../../old_componentes/componentes/ControllerService.js');
require('../../old_componentes/componentes/Devices.js');
require('../../old_componentes/componentes/DevicesRequest.js');
require('../../old_componentes/componentes/RFID.js');
require('../../old_componentes/componentes/SpeechRecognition.js');
require('../../old_componentes/componentes/TesteSpeed.js');

window.GcLegacyEngine = {
  module: 'gcLegacyEngine',
  factories: [
    'TabelaHTML', 'Confirmacao', 'TabelaJS', '$consulta', 'ConsultaBootstrap4',
    'ConsultaBootstrap5', 'ConsultaMultipla', 'InputJS', 'Arquivos', 'ArquivosGC',
    'ArquivosJS', 'ImportarArquivos', 'Historico', 'FluxoOperacional', 'FactoryDefault',
    'ControllerService', 'Devices', 'DevicesRequest', 'RFID', 'SpeechRecognition', 'TesteSpeed'
  ]
};
