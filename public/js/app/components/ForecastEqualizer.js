var React = require('react');
var ReactDOM = require('react-dom');
var cx = require('classnames');
var toast = require('../../lib/toast');

var ScenarioTab = require('./ScenarioTab');
var ScenarioBox = require('./ScenarioBox');
var ForecastBaselineBox = require('./ForecastBaselineBox');

var ForecastEqualizer = React.createClass({
	getInitialState: function() {
		var tabs = this.props.scenarioData.scenario || [];
		return {
			scenarios: this.props.scenarioData.scenario,
			tabCount: tabs.length,
			currentScenario: 'baseline'
		}
	},
	copyScenarioHandler: function() {
		//  @attributes
		var scenarioContainer = ReactDOM.findDOMNode(
			this.refs.scenarioContainer
		);

		var existingScenario = $(scenarioContainer).find(
			'.tab-pane.active.scenario');
		var intercept = existingScenario.find('input').data('intercept');
		var residualStandardError = existingScenario.find('input').data(
			'residualstandarderror');
		var degreesOfFreedom = existingScenario.find('input').data(
			'degreesoffreedom');
    var baselineMatrix = existingScenario.find('input').data(
      'baselinematrix');
		var forecastPeriod = existingScenario.find('.forecast-period').text();
		var forecastDate = existingScenario.find('.forecast-date').text();

		var factors = [];
		var forecast = existingScenario.find('.factorRow');
		for(var i = 0; i < forecast.length; i++) {
			var alpha = null;
      var minValue = $(existingScenario.find('.forecast-slider')[i]).slider('option', 'min');
      var paramValue = $(existingScenario.find('.forecast-slider')[i]).slider('option', 'value');
      var maxValue = $(existingScenario.find('.forecast-slider')[i]).slider('option', 'max');
      var step = $(existingScenario.find('.forecast-slider')[i]).slider('option', 'step');
      var disabled = $(existingScenario.find('.forecast-slider')[i]).slider('option', 'disabled');
      var color = $(existingScenario.find('.forecast-slider')[i]).find("div.ui-slider-range").css("background-color");

			if(i==0){
				factors.push({
					datastreamname: $(forecast[i]).find('.datastream-name').text(),
					datastreamid: $(forecast[i]).find('input').data('stream-id'),
					state: {
						alpha: $(forecast[i]).find('input').data('resetvalue'),
						value: $(forecast[i]).find('input').data('resetvalue'),
						solveId: $(forecast[i]).find('input').data('solve-id') || true,
					},
					sliderParams: {
						orientation: 'horizontal',
						range: 'min',
						min: minValue,
						max: maxValue,
						value: paramValue,
						disabled: disabled,
						step: step,
						color: color,
					}
				});
			} else {
				factors.push({
					datastreamname: $(forecast[i]).find('.datastream-name').text(),
					shiftfactor: $(forecast[i]).find('.shift-factor').text(),
					rank: $(forecast[i]).find('.rank').text(),
					pvalformatted: $(forecast[i]).find('.pval').data('pvalformatted'),
					coefficientFormatted: $(forecast[i]).find('.coefficient-formatted').text(),
					coefficient: $(forecast[i]).find('input').data('coefficient'),
					datastreamid: $(forecast[i]).find('input').data('stream-id'),
					state: {
						value: $(existingScenario.find('.forecast')[i]).data('resetvalue'),
						solveId: $(forecast[i]).data('solve-id') || false,
					},
					sliderParams: {
						orientation: 'horizontal',
						range: 'min',
						min: minValue,
						max: maxValue,
						value: paramValue,
						disabled: disabled,
						step: step,
						color: color
					}
				});

			}
		}

		console.log('factors', factors);

		var newScenarioData = {
			title: 'New Scenario ' + (this.state.tabCount + 1),
			period: forecastPeriod,
			forecastDate: forecastDate,
      baselinematrix: baselineMatrix,
			intercept: intercept,
			residualStandardError: residualStandardError,
			degreesOfFreedom: degreesOfFreedom,
			factors: factors,
		};

		var scenarios = this.state.scenarios;
		scenarios.push(newScenarioData);

		var self = this;
    $.isLoading({ text: "Loading Scenario"});
    this.createScenario($(scenarioContainer), newScenarioData.title, 
    	factors, function(response) {
        $.isLoading('hide');
        var newScenario = scenarios[scenarios.length-1]
        newScenario.id = response.id;
      	if (response.created) {
          	toast.notifySuccess('Success', 'Scenario created successfully.');
    				self.setState({
    					scenarios: scenarios,
    					currentScenario: response.id,
    					tabCount: self.state.tabCount+1
    				}, function(){
              self.props.forceRender();
            });
        } else {
            toast.notifyError('Error', 'Unable to save new scenario.');
        }
      }
    );

	},
	getCurrentTab: function() {
		return $('.btn-tab.active');
	},
	forecastSlideHandler: function(e, ui) {
      $(e.currentTarget).closest('tr').find('.forecast').val(ui.value);
	},
	forecastSlideChangeHandler: function(e, ui) {
    console.log('[ForecastEqualizer] forecastSlideHandler triggered !!!!!')
		var $scenario = $(e.currentTarget).closest('#scenario-content .tab-pane.scenario');
		var $solveRow = $scenario.find('.solving').closest('tr');
		var existingResult = parseFloat($solveRow.find('input.forecast').val());
		//todo: use the data object rather than the container
		var result = this.solve($scenario);
		if (result != existingResult) {
    		//update with the new solution
    		$solveRow.find('.forecast').val(result);
    		$solveRow.find('.forecast-slider').slider('value', result);

    		//update the ui confidence interval
    		var range = $scenario.find('.forecast-slider:first').slider('option', 'max');
    		var min = $scenario.find('.forecast-slider:first').slider('option', 'min');
    		var offset = parseFloat(min + (range - min) / 2);
    		range += (range / 3);
    		var bound = this.getBounds();
    		var interval = bound.upper - bound.lower;

    		if (isNaN(interval)) {
    		  $scenario.find('.confidenceWindow').hide();
    		} else {
    		  //get percentage of range represented by the conf window
    		  var widthPercentage = 100 * (interval) / range;
    		  var dependent = this.getDependent();
    		  var leftPercentage = 100 * (dependent + offset) / range - .5 * widthPercentage;

    		  var places = 0;
    		  if ((result % 1) != 0) {
    		    places = result.toString().split(".")[1].length + 1;
    		  }

    		  $scenario.find('.confidenceWindow').css('width', widthPercentage + '%')
    		    .css('left', leftPercentage + '%')
    		    .attr('data-original-title', bound.lower.toFixed(places) + ' ... [\u00b1' + (interval / 2).toFixed(places) + '] ... ' + bound.upper.toFixed(places))
    		    .show();
    		}
    		var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
    		$scenarioContainer.find('.btn.btn-scenario.active i.status').addClass('icon-asterisk unsaved-indicator');
    		this.updateStatus($scenarioContainer);
    }

	},

    alphaLevel: 0.025,
    residualStandardError: 0.0,
    intercept: 0.0,
    degreesOfFreedom: 0,
    startMatrix: [],
    startTransposeMatrix: [],
    sscpMatrix: [],
    sscpInverseMatrix: [],
    newMatrix: [],
    newTransposeMatrix: [],
    insideSquareRoot: 0.0,
    meanSquare: 0.0,
    tStatInv: 0.0,
    yPredicted: 0.0,
    upperBound: 0.0,
    lowerBound: 0.0,

    scenarioBtnHandler: function(scenarioId, e) {
      // get scenario clicked
      // set scenario to currentScenario
      // ensure if the scenario is not current scenario, that it is hidden
      console.log('[ForecastEqualizer] change scenario', scenarioId);

      this.setState({
        currentScenario: scenarioId
      }, () => {
        var saveScenarioElem = ReactDOM.findDOMNode(this.refs.saveScenarioElem);
        var renameScenarioElem = ReactDOM.findDOMNode(this.refs.renameScenarioElem);
        if(scenarioId === 'baseline'){
            $(saveScenarioElem).hide()
            $(renameScenarioElem).hide()
        } else {
            $(saveScenarioElem).show()
            $(renameScenarioElem).show()
        }
      })

      // var thisName = $(e.currentTarget).data('section');
      // var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      // $scenarioContainer.find('#scenario-content .scenario')
      //   .removeClass('active')
      //   .hide();
      // $scenarioContainer.find('#scenario-content ' + thisName)
      //   .addClass('active')
      //   .show();
      // $scenarioContainer.find('.btn-scenario').removeClass('active');
      // $scenarioContainer.find('.btn-scenario[data-section="' + thisName + '"]').addClass('active');
      // if ($(this).closest('.baseline').length > 0) {
      //   $scenarioContainer.find('#scenario-content .btn-save-scenario').hide()
      //   $scenarioContainer.find('#scenario-content .btn-rename-scenario').hide()
      // } else {
      //   $scenarioContainer.find('#scenario-content .btn-save-scenario').show()
      //   $scenarioContainer.find('#scenario-content .btn-rename-scenario').show()
      // }
    },
    navigateScenario: function(){

    },
    forecastKeyDownHandler: function(e) {
      if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        // let it happen, don't do anything
        return;
      } else {
        // Ensure that it is a number and stop the keypress
        if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
        }
      }
    },

    getBounds: function() {
      return {
        'lower': this.lowerBound,
        'upper': this.upperBound
      };
    },

    getDependent: function() {
      return this.yPredicted;
    },

    setBaselineMatrices: function(matrix) {
      if (matrix.length) {
        var baselineMatrix = new Array();
        for (var i = 0; i < matrix.length; i++) {
          baselineMatrix[i] = matrix[i];
        }
        var intercept = new Array();
        for (var i = 0; i < matrix[0].length; i++) {
          intercept.push(1);
        }
        baselineMatrix.unshift(intercept);
        this.startTransposeMatrix = baselineMatrix;
        //step 5 - Transpose
        this.startMatrix = jStat.transpose(this.startTransposeMatrix);
        return true;
      } else {
        return false;
      }
    },

    insertIntercept: function(matrix) {
      var intercept = new Array();
      for (var i = 0; i < matrix.length; i++) {
        matrix[i].unshift(1);
      }
    },
    forecastKeyUpHandler: function(e) {
      $(e.currentTarget).change();
    },

    updateSlider: function(elem) {
     var sliderVal = $(elem)
      	.closest('tr')
      	.find('.forecast-slider')
      	.slider("value");
      if(sliderVal){
        $(elem)
        	.closest('tr')
        	.find('.forecast-slider')
        	.slider("value", $(elem).prop('value'));
    	}
    },
    forecastChangeHandler: function(e) {
      this.updateSlider(e.currentTarget);
    },
    solveHandler: function(e) {
      var $scenario = $(e.currentTarget).closest('.scenario');
      $scenario.find('tr').removeClass('warning');
      $scenario.find('.solve')
      	.removeClass('icon-star')
        .removeClass('solving')
        .addClass('icon-star-empty')
        .attr('data-original-title', 'Click to solve for this test value');
      $scenario.find('.solve.dependent').attr('data-original-title', 'Click to solve for the reference value');
      $scenario.find('.forecast').prop("disabled", false);
      $scenario.find('.forecast-slider').slider("enable");
      //modify this member
      var $row = $(e.currentTarget).closest('tr');
      $row.addClass('warning');
      $row.find('.forecast-slider').slider("disable");
      $row.find('.forecast').prop("disabled", true);
      //$(this).closest('tr').find('.forecast-slider').slider("disable");
      //$(this).closest('tr').find('.forecast').prop("disabled", true);
      $(e.currentTarget).removeClass('icon-star-empty');
      $(e.currentTarget).addClass('icon-star');
      $(e.currentTarget).addClass('solving');
      if ($(e.currentTarget).hasClass('dependent')) {
        $(e.currentTarget).attr('data-original-title', 'Currently solving for the reference value');
      } else {
        $(e.currentTarget).attr('data-original-title', 'Currently solving for this test value');
      }
      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      $scenarioContainer.find('.btn.btn-scenario.active i.status').addClass('icon-asterisk unsaved-indicator');
      this.updateStatus($scenarioContainer);
    },
    setConfidenceInterval: function() {
      //purpose: Step through process to compute confidence interval

      //step 6 - Sum of Squares and Cross Products (SSCP)
      this.sscpMatrix = jStat.multiply(this.startTransposeMatrix, this.startMatrix);
      //step 7 - Inverse of the SSCP Matrix
      this.sscpInverseMatrix = jStat.inv(this.sscpMatrix);
      //step 8a - Create matrix of new variables
      this.newTransposeMatrix = jStat.transpose(this.newMatrix);
      //step 8b - Calculate inside square root
      var insideStepA = jStat.multiply(this.sscpInverseMatrix, this.newTransposeMatrix);
      var insideStepATranspose = jStat.transpose(insideStepA);
      this.insideSquareRoot = jStat.dot(insideStepATranspose, this.newMatrix);
      //step 9 - Calculate Mean Square Error
      this.meanSquareError = this.residualStandardError * this.residualStandardError;
      //step 10 - Calculate value inside square root
      this.insideSquareRootValue = Math.sqrt(this.meanSquareError * this.insideSquareRoot);
      //step 11 - Calculate t-statistic
      this.tStatInv = jStat.studentt.inv(this.alphaLevel, this.degreesOfFreedom);
      //step 12 - Calculate Prediction Value
      //yPredicted = 0; // should be previously solved
      //step 13 - Calculate lower bound
      var plusMinus = this.tStatInv * this.insideSquareRootValue;
      this.lowerBound = this.yPredicted - plusMinus;
      //step 14 - Calculate upper bound
      this.upperBound = this.yPredicted + plusMinus;
    },

    solve: function($scenario) {
      //accepts a jQuery object
      //creates a linear equation by iterating through forecast values
      //returns a value representing the solved linear equation
      var dependent = 0.0;
      var coefficient = [];
      var independents = 0.0;
      var error = 0.0;
      var forecast = $scenario.find('.forecast');
      //var intercept = 0.0;

      var result = 0.0;

      //TODO: use better data package than ui elements
      if ($(forecast[0]).data('baselinematrix') && this.setBaselineMatrices($(forecast[0]).data('baselinematrix'))) {

        this.intercept = $(forecast[0]).data('intercept');
        this.residualStandardError = $(forecast[0]).data('residualstandarderror');
        this.degreesOfFreedom = $(forecast[0]).data('degreesoffreedom');


        var independent = [1];
        for (var i = 1; i < forecast.length; i++) {
          //independent.push(parseFloat($(forecast[i]).val()));
          independent.push(parseFloat($scenario.find('#forecast-' + i).val()));
        }
        this.newMatrix = independent;

        //TODO: Could jstat linear algebra library solve this more generically?

        var independent = [];
        if ($scenario.find('#solve-0').hasClass('solving')) {
          //solve for the dependent variable (reference data set)
          for (var i = 1; i < forecast.length; i++) {
            coefficient[i - 1] = $(forecast[i]).data('coefficient');
            independent[i - 1] = parseFloat($(forecast[i]).val());
            independents += coefficient[i - 1] * independent[i - 1];
          }
          result = this.yPredicted = this.intercept + independents + error;
        } else {
          //olve for an independent variable (test data sets)
          //TODO: use the high precision value rather than the integer display value as default.
          dependent = this.yPredicted = parseFloat($(forecast[0]).val());
          for (var k = 1; k < forecast.length; k++) {
            if ($scenario.find('#solve-' + k).hasClass('solving')) {
              var coefDivisor = $(forecast[k]).data('coefficient');
            } else {
              independents += $(forecast[k]).data('coefficient') * $(forecast[k]).val();
            }
          }
          result = (dependent - error - this.intercept - independents) / coefDivisor;
        }

        var places = 0;
        this.setConfidenceInterval();
        if (Math.abs(result) < 1) {
          places = 2;
        } else {
          if (Math.abs(result) < 10) {
            places = 1;
          }
        }


        return Math.round(result * Math.pow(10, places)) / Math.pow(10, places);
      } else {
        return 0;
      }
    },

    removeScenario: function($scenarioContainer, scenarioId) {
      	var self = this;

  	    var scenarios = this.state.scenarios.filter(function(scenario){
  	      	return scenario.id !== scenarioId;
  	    });
        var lastScenario = scenarios[scenarios.length-1];
        if(typeof lastScenario === 'undefined'){
          lastScenario = 'baseline';
        } else {
          lastScenario = lastScenario.id;
        }

        // remove
        self.deleteScenario($scenarioContainer, function(response) {
          if (response && response.success) {
            //default action displays the baseline when a scenario is removed
            self.setState({
            	scenarios: scenarios,
            	currentScenario: lastScenario
            })
            toast.notifySuccess('Success', 'Scenario removed successfully.');
          } else {
            toast.notifyError('Error', 'Unable to remove scenario.');
          }
        });

      // get scenario id
      // remove from scenarios list
      // get last scenario in scenarios list
      // and set to currentScenario
      // setState

      // var $scenarioTab = $(e.currentTarget).closest('button');
      // if ($scenarioTab.hasClass('active')) {
      //   var $scenarioContent = $($scenarioTab.data('section'));
      //   var $scenarioToolbar = $(e.currentTarget).closest('.btn-toolbar');

      //   var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      //   // remove
      //   self.deleteScenario($scenarioContainer, function(response) {
      //     if (response.success) {
      //       $scenarioTab.remove();
      //       $scenarioContent.remove();
      //       //default action displays the baseline when a scenario is removed
      //       $scenarioToolbar.find("button[data-section='#forecast-scenario-baseline']").click();
      //       toast.notifySuccess('Success', 'Scenario removed successfully.');
      //     } else {
      //       toast.notifyError('Error', 'Unable to remove scenario.');
      //     }
      //   });
      // }
    },
    createScenario: function($scenarioContainer, tabName, factors, cb){
      var newData = {
        title: tabName,
        factors: factors
      };
      var data_scenario = this.getScenarioState($scenarioContainer, '', newData);
      var $tab = $('.tab-buttons .btn.active');
      // make sure $tab has a length of 1
      // var rawData = JSON.parse($tab.data('data_raw'));
      // rawData.scenario = data_scenario;
      // var rawDataText = JSON.stringify(rawData);
      // $tab.data('data_raw', rawDataText);
      var data = {
        name: tabName,
        data: JSON.stringify(data_scenario)
      }

      var snapshotId = this.props.data.worksheetId;

      if(snapshotId !== null){
	      $.ajax({
	        url: '/api/snapshots/'+snapshotId+'/forecasts/add',
	        data: data,
	        method: 'post',
	        dataType: 'json',
	        success: cb
	      });

      } else {
      	cb(null);	
      }


    },
    deleteScenario: function($scenarioContainer, cb){
      var $currentTab = $scenarioContainer.find('.btn-scenario.active');
      var forecastId = $('.btn.active').find('#forecastId').val();

      var snapshotId = this.props.data.worksheetId;

      if(snapshotId){
	      $.ajax({
	        url: '/api/snapshots/'+snapshotId+'/forecasts/delete/'+forecastId,
	        method: 'get',
	        dataType: 'json',
	        success: cb
	      });
      } else {
      	cb(null);
      }

    },

    renameScenarioHandler: function(e) {
      var self = this;
      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      var $currentTab = $scenarioContainer.find('.btn-scenario.active');
      var currentTabName = $currentTab.find('span.name').text();
      var $scenarioTab = $scenarioContainer.find('.btn-scenario');
      var scenarioNames = $scenarioTab.find('span.name').map(function() {
        return $(e.currentTarget).text();
      }).get();

      bootbox.prompt('Rename Scenario', 'Cancel', 'Ok', function(tabName) {
        if (_.contains(scenarioNames, tabName)) {
          toastr.error("Scenario Name Already Exists", '<i class="icon-ban-circle"></i> <span>' + "Error" + '</span>');
          return;
        }
        if (tabName === null) {
          tabName = currentTabName;
        } else {
          // update (rename)
          self.updateScenarios($scenarioContainer, tabName, function(response) {
            if (response.success) {
              $currentTab.find('span.name').text(tabName);
              //$scenarioContainer.find('.btn.btn-scenario.active i.status').addClass('icon-asterisk unsaved-indicator');
              toast.notifySuccess('Success', 'Scenario renamed successfully.');
            } else {
              toast.notifyError('Error', 'Unable to rename scenario.');
            }
          });
        }
      }, currentTabName);
    },

    saveScenarioHandler: function(e, behavior) {
      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      var $scenario = $(e.currentTarget).closest('#scenario-content').find('.active.scenario');
      var $currentTab = $scenarioContainer.find('.btn-scenario.active');
      var currentTabName = $currentTab.find('span.name').text();
      // update
      var self = this;
      this.updateScenarios($scenarioContainer, currentTabName, function(response) {
        if (response.success) {
          // update resetvalue attributes
          $scenario.find(".solve").data('resetvalue', '').attr('data-resetvalue', '');
          $scenario.find(".solving").data('resetvalue', 'true').attr('data-resetvalue', 'true');
          var elemForecast = $scenario.find('.forecast');
          for (var i = 0; i < elemForecast.length; i++) {
            $(elemForecast[i]).data('resetvalue', $(elemForecast[i]).val());
          }
          toast.notifySuccess('Success', 'Scenario saved successfully.');
          $scenarioContainer.find('.btn.btn-scenario.active i.status').removeClass('icon-asterisk unsaved-indicator');
          self.updateStatus($scenarioContainer);
        } else {
          toast.notifyError('Error', 'Unable to save scenario.');
        }
      });
    },
    resetBaseline: function(){
      var resetScenarioElem = ReactDOM.findDOMNode(this.refs.resetScenarioElem);
      var $scenario = $(resetScenarioElem).closest('#scenario-content').find(
          '.scenario.baseline');
      $scenario.find(".solve[data-resetvalue='true']").click();
      var elemForecast = $scenario.find('.forecast');
      for (var i = 0; i < elemForecast.length; i++) {
        //reset the slider and input field value
        $(elemForecast[i]).val($(elemForecast[i]).data('resetvalue'));
        $(elemForecast[i]).change();
        this.updateSlider(elemForecast[i]);
      }
    },
    resetScenario: function(resetAll){
      var $scenario;
      var resetScenarioElem = ReactDOM.findDOMNode(this.refs.resetScenarioElem);
      if(resetAll){
        $scenario = $(resetScenarioElem).closest('#scenario-content').find(
          '.scenario');
      } else {
        $scenario = $(resetScenarioElem).closest('#scenario-content').find(
          '.active.scenario');
      }
      $scenario.find(".solve[data-resetvalue='true']").click();
      var elemForecast = $scenario.find('.forecast');
      for (var i = 0; i < elemForecast.length; i++) {
        //reset the slider and input field value
        $(elemForecast[i]).val($(elemForecast[i]).data('resetvalue'));
        $(elemForecast[i]).change();
        this.updateSlider(elemForecast[i]);
      }

      var $scenarioContainer = $(resetScenarioElem).closest('.scenarioContainer');
      $scenarioContainer.find('.btn.btn-scenario.active i.status').removeClass(
      	'icon-asterisk unsaved-indicator');
      this.updateStatus($scenarioContainer);
    },
    resetScenarioHandler: function(e) {
      e.preventDefault();
      this.resetScenario();
    },

    updateScenarios: function($scenarioContainer, tabName, cb) {

      var data_scenario = this.getScenarioState($scenarioContainer, '');

      var $currentTab = $scenarioContainer.find('.btn-scenario.active');
      var forecastId = $currentTab.find('#forecastId').val();
      var snapshotId = this.props.data.worksheetId;

      var data = {
        name: tabName,
        data: JSON.stringify(data_scenario)
      }

      $.ajax({
        url: '/api/snapshots/'+snapshotId+'/forecasts/update/'+forecastId,
        data: data,
        method: 'post',
        dataType: 'json',
        success: cb
      });

    },
    getScenarioState: function($scenarioContainer, action, newScenarioData) {

      //return all current data of the active scenario as well as all the reset value data of all other scenarios
      //action is optional and can be 'rename' or 'remove'

      var $scenarioTab = $scenarioContainer.find('.scenario-buttons.scenario');
      var scenarioNames = $scenarioTab.find('span.name').map(function() {
        if (action == 'remove' && $(this).closest('button').hasClass('active')) {
          //ignore to remove it
        } else {
          return {
            title: $(this).text()
          };
        }
      }).get();
      var data_scenario = {};
      data_scenario.titles = scenarioNames;
      data_scenario.factors = [];

      //todo: save the table sort order for each scenario
      //scrape each scenario interface to get current values of the active scenario and reset values of other scenarios
      var $factorRows = $scenarioContainer.find('.tab-pane.scenario.baseline .factorRow');
      for (var factorIndex = 0; factorIndex < $factorRows.length; factorIndex++) {
        var thisFactor = {};
        thisFactor.state = [];

        $scenarioContainer.find('.tab-pane.scenario.user #factorRow-' + factorIndex).each(function(scenarioIndex) {
          var scenarioPane = $(this).closest('.tab-pane.scenario.user');
          if (action == 'remove' && $(scenarioPane).hasClass('active')) {
            //skip this one to delete it
          } else {
            var thisState = {};
            thisState.datasetId = $(this).find('.forecast').data('stream-id');
            if (action == '' && $(scenarioPane).hasClass('active')) {
              //this is the one we are saving, use current values
              if (factorIndex == 0) {
                thisState.alpha = $(this).find('.alpha').data('resetvalue');
                //thisState.alpha = $(this).find('.alpha').val();
              }
              thisState.value = $(this).find('.forecast').val();
              if ($(this).find('.solve').hasClass('solving')) {
                thisState.solveId = true;
              }
            } else {
              //use reset values for all other scenarios
              if (factorIndex == 0) {
                thisState.alpha = $(this).find('.alpha').data('resetvalue');
              }
              thisState.value = $(this).find('.forecast').data('resetvalue');
              if ($(this).find('.solve').data('resetvalue')) {
                thisState.solveId = true;
              }
            }
            thisFactor.state.push(thisState);
          }
        });
        if (thisFactor.state.length > 0) {
          data_scenario.factors.push(thisFactor);
        }
      }


      if(newScenarioData){
        data_scenario.titles.push(newScenarioData.title);
        _.each(newScenarioData.factors, function(factor, index){
            if(index === 0){
                var newScenarioState = {
                  alpha: factor.state.alpha,
                  value: factor.state.value,
                  solveId: factor.state.solveId 
                };

            } else {
              var newScenarioState = {
                value: factor.state.value
              };
            }
            data_scenario.factors[index]['state'].push(newScenarioState);
        });
      }
      return data_scenario
    },
    updateStatus: function($scenarioContainer) {
      var $changedScenario = $scenarioContainer.find('.btn-scenario i.icon-asterisk.unsaved-indicator');
      var sectionName = $scenarioContainer.closest('.trending-charts').find('li.active a').attr('href');

      if ($changedScenario.length > 0) {
        $scenarioContainer.closest('.trending-charts').find('li.active a i').addClass('icon-asterisk unsaved-indicator');
        //$('#analyzeToolbar').find('[data-section="' + sectionName.replace('#forecast-chart-','') + '"]').prepend('<i class="icon-asterisk unsaved-indicator"></i>');
      } else {
        $scenarioContainer.closest('.trending-charts').find('li.active a i').removeClass('icon-asterisk unsaved-indicator');
        //$('#analyzeToolbar').find('[data-section="' + sectionName.replace('#forecast-chart-','') + '"]').removeClass('icon-asterisk unsaved-indicator');
      }
    },

	componentDidMount: function() {

		// setTimeout(function(){
  //     console.log('[ForecastEqualizer] call resetScenario')
		// 	this.resetBaseline(true);
		// }.bind(this), 5000);
	},
  componentDidUpdate: function(prevProps, prevState) {
    var saveScenarioElem = ReactDOM.findDOMNode(this.refs.saveScenarioElem);
    var renameScenarioElem = ReactDOM.findDOMNode(this.refs.renameScenarioElem);
    if(this.state.currentScenario === 'baseline'){
        $(saveScenarioElem).hide()
        $(renameScenarioElem).hide()
    } else {
        $(saveScenarioElem).show()
        $(renameScenarioElem).show()
    }

    if(this.props.hasOwnProperty('forceChartUpdate') 
        && this.props.forceChartUpdate === true){
      console.log('FORCE CHART UPDATE CALLED');
      setTimeout(function(){
        this.resetBaseline(true);
      }.bind(this), 500);
    }

  },
	render: function() {
		var scenarioTabs = this.state.scenarios.map(function(sc, idx){
			return (
				<ScenarioTab 
					key={idx} 
					index={idx} 
					scenario={sc} 
					removeScenario={this.removeScenario}
          currentScenario={this.state.currentScenario}
					scenarioBtnHandler={this.scenarioBtnHandler}
				/>
			);
		}, this);

    console.log('FE render', this.props.isSliderReady);
    console.log('[ForecastEqualizer] scenarioData', this.state.scenarios)

		var scenarioBoxes = this.state.scenarios.map(function(sc, idx){
			return (
				<ScenarioBox 
					key={idx} 
					index={idx} 
          isSliderReady={this.props.isSliderReady}
					baseline={this.props.scenarioData.baseline} 
          currentScenario={this.state.currentScenario}
        	forecastKeyUpHandler={this.forecastKeyUpHandler}
        	forecastKeyDownHandler={this.forecastKeyDownHandler}
        	forecastChangeHandler={this.forecastChangeHandler}
        	updateSlider={this.updateSlider}
					solveHandler={this.solveHandler}
					forecastSlideHandler={this.forecastSlideHandler}
					forecastSlideChangeHandler={this.forecastSlideChangeHandler}
					scenario={sc} />
			);
		}, this);
    
    var classes = cx({
        "btn": true,
        "btn-scenario": true,
        "active": this.state.currentScenario == "baseline"
    });

		return (
			<div ref="scenarioContainer" 
				className="scenarioContainer">
			    <div id="scenario-tab">
			        <div className="row-fluid">
			            <div className="span12">
			                <div className="btn-toolbar">
			                    <div className="btn-group scenario-buttons baseline">
			                        <button 
			                        	onClick={this.scenarioBtnHandler.bind(null, 'baseline')} 
			                        	className={classes} 
			                        	data-section="#forecast-scenario-baseline">
			                            <span className="name">Baseline</span>
			                        </button>
			                     </div>
			                    <div className="btn-group scenario-buttons scenario">
			                    	{scenarioTabs}
			                    </div>
			                </div>
			            </div>
			        </div>
			    </div>
			    <div id="scenario-content" className="tab-content">
			        <div className="row-fluid">
			            <div className="span12 btn-toolbar">
			                <div className="btn-group pull-right">
			                    <div onClick={this.resetScenarioHandler} 
			                    	ref="resetScenarioElem"
			                    	className="btn btn-reset-scenario">
			                        <i className="icon-retweet"></i> Reset
			                    </div>
			                    <div onClick={this.saveScenarioHandler} 
                            ref="saveScenarioElem"
			                    	className="btn btn-save-scenario">
			                        <i className="icon-save"></i> Save
			                    </div>
			                    <div onClick={this.renameScenarioHandler} 
                            ref="renameScenarioElem"
			                    	className="btn btn-rename-scenario">
			                        <i className="icon-pencil"></i> Rename
			                    </div>
			                    {function(){
			                    	if(this.props.data.worksheetId !== null){
			                    		return (
			                    			<div 
					                    		onClick={this.copyScenarioHandler} 
					                    		className="btn btn-copy-scenario">
						                        <i className="icon-share-alt"></i> Copy
						                    </div>
						                );
					                }
				                 }.call(this)}
			                </div>
			            </div>
			        </div>
              <ForecastBaselineBox
                forecastKeyUpHandler={this.forecastKeyUpHandler}
                forecastKeyDownHandler={this.forecastKeyDownHandler}
                forecastChangeHandler={this.forecastChangeHandler}
                scenarioData={this.props.scenarioData}
                solveHandler={this.solveHandler}
                updateSlider={this.updateSlider}
                resetScenario={this.resetScenario}
                currentScenario={this.state.currentScenario}
                forecastSlideHandler={this.forecastSlideHandler}
                forecastSlideChangeHandler={this.forecastSlideChangeHandler} />
              {scenarioBoxes}
			    </div>
			</div>
		);
	}
});

ForecastEqualizer.propTypes = {
	data: React.PropTypes.object.isRequired,
	currentTab: React.PropTypes.string.isRequired,
	tabCount: React.PropTypes.number.isRequired,
	scenarioData: React.PropTypes.object.isRequired
};

module.exports = ForecastEqualizer;