module.exports = Bootstrap;
function Bootstrap(commandMap) {
    var baseDir = '../commands/server/';
    // Configuration
    commandMap.mapEvent('STARTUP_COMPLETE', require(baseDir + 'LoadConfiguration'));
    commandMap.mapEvent('LOAD_CONFIGURATION_COMPLETE', require(baseDir + 'SetupExceptionMailer'));

    // Express.   
	commandMap.mapEvent('LOAD_CONFIGURATION_COMPLETE', require(baseDir + 'CreateExpressApplication'));
    commandMap.mapEvent('CREATE_EXPRESS_APPLICATION_COMPLETE', require(baseDir + 'SetupExpressEnvironment'));
    commandMap.mapEvent('SETUP_EXPRESS_ENVIRONMENT_COMPLETE', require(baseDir + 'ConfigureExpressRoutes'));
    commandMap.mapEvent('CONFIGURE_EXPRESS_ROUTES_COMPLETE', require(baseDir + 'CreateExpressHttpServer'));

    // Socket
    commandMap.mapEvent('CREATE_EXPRESS_HTTP_SERVER_COMPLETE', require(baseDir + 'SetupSocketServer'));
    commandMap.mapEvent('SOCKET_CONNECTION_COMPLETE', require(baseDir + 'SetupClientBootstrap'));
}