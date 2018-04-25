var React = require('react');
var PendingDatasetBox = require('./PendingDatasetBox');
var HighChartsBox = require('./HighChartsBox');
var CorrelationTable = require('./CorrelationTable');

var CorrelationChart = React.createClass({
  setUpChart: function(){
    var self = this;

    var mathMin = Math.min,
    mathMax = Math.max,
    mathRound = Math.round;
    Highcharts.wrap(Highcharts.Legend.prototype, 'handleOverflow', function (proceed, legendHeight) {
            var legend = this,
                chart = this.chart,
                renderer = chart.renderer,
                options = this.options,
                optionsY = options.y,
                alignTop = options.verticalAlign === 'top',
                spaceHeight = chart.spacingBox.height + (alignTop ? -optionsY : optionsY) - this.padding,
                maxHeight = options.maxHeight,
                clipHeight,
                clipRect = this.clipRect,
                navOptions = options.navigation,
                animation = Highcharts.pick(navOptions.animation, true),
                arrowSize = navOptions.arrowSize || 12,
                nav = this.nav,
                pages = this.pages,
                padding = this.padding,
                lastY,
                allItems = this.allItems,
                clipToHeight = function (height) {
                    clipRect.attr({
                        height: height
                    });

                    // useHTML
                    if (legend.contentGroup.div) {
                        legend.contentGroup.div.style.clip = 'rect(' + padding + 'px,9999px,' + (padding + height) + 'px,0)';
                    }
                };


              var currentPageNumber = self.props.currentPageNumber;
              console.log('page number', currentPageNumber)
              legend.scroll(currentPageNumber, animation);


            // Adjust the height
            if (options.layout === 'horizontal') {
                spaceHeight /= 2;
            }
            if (maxHeight) {
                spaceHeight = mathMin(spaceHeight, maxHeight);
            }

            // Reset the legend height and adjust the clipping rectangle
            pages.length = 0;
            if (legendHeight > spaceHeight) {

                this.clipHeight = clipHeight = mathMax(spaceHeight - 20 - this.titleHeight - padding, 0);
                this.currentPage = Highcharts.pick(this.currentPage, 1);
                this.fullHeight = legendHeight;

                // Fill pages with Y positions so that the top of each a legend item defines
                // the scroll top for each page (#2098)
                Highcharts.each(allItems, function (item, i) {
                    var y = item._legendItemPos[1],
                        h = mathRound(item.legendItem.getBBox().height),
                        len = pages.length;

                    if (!len || (y - pages[len - 1] > clipHeight && (lastY || y) !== pages[len - 1])) {
                        pages.push(lastY || y);
                        len++;
                    }

                    if (i === allItems.length - 1 && y + h - pages[len - 1] > clipHeight) {
                        pages.push(y);
                    }
                    if (y !== lastY) {
                        lastY = y;
                    }
                });

                // Only apply clipping if needed. Clipping causes blurred legend in PDF export (#1787)
                if (!clipRect) {
                    clipRect = legend.clipRect = renderer.clipRect(0, padding, 9999, 0);
                    legend.contentGroup.clip(clipRect);
                }

                clipToHeight(clipHeight);

                // Add navigation elements
                if (!nav) {
                    this.nav = nav = renderer.g().attr({
                        zIndex: 1
                    }).add(this.group);
                    this.up = renderer.symbol('triangle', 0, 0, arrowSize, arrowSize)
                        .on('click', function () {//UP

                        // Instead look up the current page number
                        legend.scroll(-1, animation);
                        self.props.updatePageNumber(currentPageNumber - 1);
                        //self.loadSnapshot(parseInt(self.snapshotId), true, true, '?datasetfilter=879,487,876,875,877,866' );
                    })
                        .add(nav);
                    this.pager = renderer.text('', 15, 10)
                        .css(navOptions.style)
                        .add(nav);
                    this.down = renderer.symbol('triangle-down', 0, 0, arrowSize, arrowSize)
                        .on('click', function () {//DOWN

                          legend.scroll(1, animation);
                          self.props.updatePageNumber(currentPageNumber + 1);

                    })
                        .add(nav);
                }

                // Set initial position
                legend.scroll(0);

                legendHeight = spaceHeight;

            } else if (nav) {
                clipToHeight(chart.chartHeight);
                nav.hide();
                this.scrollGroup.attr({
                    translateY: 1
                });
                this.clipHeight = 0; // #1379
            }

            return legendHeight;


        });

  },
  componentDidUpdate: function() {
    // console.log(this.props.shiftData);
    // this.setUpChart();
    console.log('[CorrelationChart]', this.props.chartOptions.series)
  },
  componentDidMount: function() {
    // this.setUpChart();
  },
  togglePairs: function() {

  },
  render: function () {
    var styles = {
      position: 'absolute',
      right: '10px',
      top: '82px',
      width: '300px',
      zIndex: '1'
    };

    return (
        <div className="tab-pane active" id={"correlation-chart-"+this.props.data.tabId}>
          <div className="well">
            <div className="row-fluid analyze-error">
                <div className="span12 flashMessages">
                    <div id="correlation-error" className="alert flash-error"></div>
                </div>
            </div>
            <div 
              style={styles}>
                <div>Show w/ pairs2? &nbsp;<input 
                  data-size="mini" 
                  style={{width:"auto"}}
                  type="checkbox" 
                  name={"my-checkbox"+this.props.tabCount} 
                  onChange={this.props.togglePairs}
                  defaultChecked={true}>
                  </input>
                </div>
            </div>
            {function(){
              if(this.props.pendingDatasets.length > 0){
                return (
                  <PendingDatasetBox 
                    pendingDatasets={this.props.pendingDatasets}/>
                );
              }
            }.call(this)}
            <HighChartsBox 
              chartName={'correlation-chart'} 
              chartOptions={this.props.chartOptions}
              forceChartUpdate={this.props.forceChartUpdate}
              />
            <div className="correlation-table">
            {function(){
              if(!_.isEmpty(this.props.shiftData)){
                return (
                  <CorrelationTable 
                  shiftData={this.props.shiftData} />
                );
              }
            }.call(this)}
            </div>
          </div>
        </div>
    )
  }
});

CorrelationChart.propTypes = {
	chartOptions: React.PropTypes.object.isRequired,
	data: React.PropTypes.object.isRequired,
	pendingDatasets: React.PropTypes.arrayOf(React.PropTypes.string),
	shiftData: React.PropTypes.object.isRequired,
	tabCount: React.PropTypes.number.isRequired,
  forceChartUpdate: React.PropTypes.bool
};

module.exports = CorrelationChart;