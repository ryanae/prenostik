module.exports = Bootstrap;
function Bootstrap(commandMap) {
    var baseDir = '../commands/client/';

    commandMap.mapEvent('CONNECTED', require(baseDir + 'LogClientConnected'));
    commandMap.mapEvent('CALCULATE_TRENDING_CHARTS', require(baseDir + 'CalculateTrendingCharts'));
    commandMap.mapEvent('INGEST_MULTI_COLUMN_DATA', require(baseDir + 'IngestMultiColumnData'));
}