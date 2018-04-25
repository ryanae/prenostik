var Util = require('util');
var Command = require('../../../lib/ClientCommand');
var dateFormat = require('dateformat');
var _ = require('underscore')._;

module.exports = MyCommand;
Util.inherits(MyCommand, Command);

function MyCommand(injector) {
	Command.call(this, injector);

	this.injector = injector;

	this.app = null

	injector.injectInto(this);
}


MyCommand.prototype.execute = function(sid, params) {
	var PrenostikRest = new (require('../../controllers/components/PrenostikRest'))(this.app, sid);

	var self = this;
	PrenostikRest.ready(function() {
		PrenostikRest.autoCorrelate(
			params.referenceData,
			params.testIDs,
			params.shiftRange || 0,
			params.shiftType,
			params.startDate,
			params.endDate,
			function(autoCorrelateResults) {

				console.log('autoCorrelateResults', autoCorrelateResults);

				if (typeof autoCorrelateResults.shifts === "undefined") {
					self.dispatch("CALCULATE_TRENDING_CHARTS_ERROR");
					return;
				}
				var shifts = _.map(autoCorrelateResults.shifts,function(o) {
					return o.datastreamid + ':' + o.shiftfactor;
				}).join('|');

				for (var i in autoCorrelateResults.shifts) {
					var shift = autoCorrelateResults.shifts[i];
					shift.adjustedpecentagecorrelated = (shift.negativecorrelation) ? parseFloat(shift.pecentagecorrelated.toFixed(2), 10) * -1 : parseFloat(shift.pecentagecorrelated.toFixed(2), 10);
					shift.adjustedpecentagecorrelated += '%';
                    shift.datastreamname = unescape(shift.datastreamname);
				}

				PrenostikRest.dataPoint(
					params.referenceData,
					params.testIDs,
					params.shiftType,
					params.startDate,
					params.endDate,
					0,//unshifted dataset (shift == 0)
                    true, //return interpolated points?
					function(unshiftedDataPointResults) {

						console.log('unshiftedDataPointResults', unshiftedDataPointResults);

						PrenostikRest.dataPoint(
							params.referenceData,
							params.testIDs,
							params.shiftType,
							params.startDate,
							params.endDate,
							shifts,
                            true, //return interpolated points?
							function(shiftedDataPointResults) {

								console.log('shiftedDataPointResults', shiftedDataPointResults);

								PrenostikRest.autoFactorReduce(
									params.referenceData,
									params.testIDs,
									params.shiftRange || 0,
									params.shiftType,
									params.startDate,
									params.endDate,
									function(autoFactorReduceResults) {

                                        for (var i in autoFactorReduceResults.factors) {
                                            var factor = autoFactorReduceResults.factors[i];
                                            factor.adjustedpercentagecorrelated = (factor.negativecorrelation) ? parseFloat(factor.percentagecorrelated.toFixed(2), 10) * -1 : parseFloat(factor.percentagecorrelated.toFixed(2), 10);
                                            factor.adjustedpercentagecorrelated += '%';
                                            factor.datastreamname = unescape(factor.datastreamname);
                                            factor.coefficientformatted  = (1 > factor.coefficient && factor.coefficient > -1) ? factor.coefficient.toExponential(3):factor.coefficient.toFixed(3);
                                            factor.pvalformatted = (factor.pval && factor.pval!=0) ? factor.pval.toExponential(3) : 0;
                                        }
										console.log('autoFactorReduceResults', autoFactorReduceResults);

										var results = {
											datapoints: unshiftedDataPointResults.datalist,
											datapoints_shifted: shiftedDataPointResults.datalist,
											autocorrelate: autoCorrelateResults,
											autofactorreduce: autoFactorReduceResults,
											params: params
										};

                                        function unescapeNameInDataset(object) {
                                            for (var i in object) {
                                                var data = object[i];
                                                if(data && data.datastreamname)
                                                {
                                                    data.datastreamname = unescape(data.datastreamname);
                                                }
                                            }
                                        }

                                        unescapeNameInDataset(results.datapoints);
                                        unescapeNameInDataset(results.datapoints_shifted);
                                        unescapeNameInDataset(results.autocorrelate);
                                        unescapeNameInDataset(results.autofactorreduce);


										self.dispatch('CALCULATE_TRENDING_CHARTS_COMPLETE', results);
									});
							}
						);
					}
				);
			}
		);
	});
};
