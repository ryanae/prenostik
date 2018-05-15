var formLib = require('../../lib/form');
var React = require('react');


var dateToUTC = function(date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
};

var GroupLabel = React.createClass({
    render: function() {
      return (
        <optgroup label={this.props.categoryName}>
          {this.props.children}
        </optgroup>
      ) 
    }
});

var ReferenceDataOption = React.createClass({
  render: function () {
    var selectProps = {};

    if(this.props.dataset.selectedReference){
      selectProps.selected = true;
    }


    return (
      <option {...selectProps} 
        value={this.props.dataset.id} 
        data-start={this.props.dataset.start} 
        data-end={this.props.dataset.end}>{this.props.dataset.name}
          ({this.props.parseDate(this.props.dataset.start)} to {this.props.parseDate(this.props.dataset.end)})
      </option>
    ) 
  }
});

var TestDataOption = React.createClass({
  render: function () {
    var selectProps = {};

    if(this.props.dataset.selectedTest){
      selectProps.selected = true;
    }

    var labelProps = {}
    if(this.props.dataset.optGroup){
        labelProps.label = this.props.dataset.categoryName;
    } else {
      labelProps.label = "";
    }

    return (
      <option {...selectProps} 
        value={this.props.dataset.id} 
        data-start={this.props.dataset.start} 
        data-end={this.props.dataset.end}>{this.props.dataset.name}
          ({this.props.parseDate(this.props.dataset.start)} to {this.props.parseDate(this.props.dataset.end)})
      </option>
    ) 
  }
});

var SnapshotOptions = React.createClass({
  optionsSelector: '#trendingOptions',

  convertDate: function(date) {
    return moment(date).utc().format('YYYY-MM-DD');
  },

  getOptionValues: function() {
    var $el_trendingOptions = $('#trendingOptions'),
      $el_startDate = $('.field-start-date', $el_trendingOptions),
      $el_endDate = $('.field-end-date', $el_trendingOptions),
      $el_testData = $('.field-test-data', $el_trendingOptions),
      $el_referenceData = $('.field-reference-data', $el_trendingOptions),
      $el_offsetLimit = $('.field-offset-limit', $el_trendingOptions),
      $el_offsetType = $('.field-offset-type', $el_trendingOptions);

    var selectedOptions = $.makeArray($el_testData.find('option:selected')).concat($.makeArray($el_referenceData.find('option:selected'))),
      dataStreamStart = _.min(
        selectedOptions.map(function(o) {
          return $(o).attr('data-start');
        })
      ),
      dataStreamEnd = _.max(
        selectedOptions.map(function(o) {
          return $(o).attr('data-end');
        })
      );

    console.log('shiftRange', $el_offsetLimit.val());
    console.log('shiftType', $el_offsetType.select2('val'));

    return {
      startDate: $el_startDate.val(),
      endDate: $el_endDate.val(),
      testIDs: $el_testData.select2('val'),
      referenceData: $el_referenceData.select2('val'),
      shiftRange: $el_offsetLimit.val(),
      shiftType: $el_offsetType.select2('val'),
      dataStreamStart: dataStreamStart,
      dataStreamEnd: dataStreamEnd,
      section: this.props.currentTab
    };
  },


  setOptionValues: function(data) {
    this.clearOptionErrors();
    var $el_trendingOptions = $('#trendingOptions'),
      $el_startDate = $('.field-start-date', $el_trendingOptions),
      $el_endDate = $('.field-end-date', $el_trendingOptions),
      $el_testData = $('.field-test-data', $el_trendingOptions),
      $el_referenceData = $('.field-reference-data', $el_trendingOptions),
      $el_offsetLimit = $('.field-offset-limit', $el_trendingOptions),
      $el_offsetType = $('.field-offset-type', $el_trendingOptions);

    $el_startDate.val(data.startDate);
    $el_endDate.val(data.endDate);
    $el_testData.select2('val', data.testIDs);
    $el_referenceData.select2('val', data.referenceData);
    $el_offsetLimit.val(data.shiftRange);
    $el_offsetType.select2('val', data.shiftType);
  },
  clearOptionErrors: function() {
    $('.field-start-date', '#trendingOptions').removeClass('error').parent().find('.error-message').remove();
    $('.field-end-date', '#trendingOptions').removeClass('error').parent().find('.error-message').remove();
    $('.field-offset-limit', '#trendingOptions').removeClass('error');
    $('.errors', '#trendingOptions').html('');
  },
  addOptionError: function(msg) {
    $('.errors', this.optionsSelector).append('<div class="flat-alert flat-alert-error flat-alert-thin"><i class="icon-ban-circle"></i> ' + msg + '</div>');
  },
  addOptionWarning: function(msg) {
    $('.errors', this.optionsSelector).append('<div class="flat-alert flat-alert-thin"><i class="icon-warning-sign"></i> ' + msg + '</div>');
  },
  hasOptionErrors: function() {
    return $(this.optionsSelector).find('.error, .flat-alert-error').length > 0;
  },
  onDateChange: function() {
    this.calculateAdjustedDates();
    this.validateForm();
  },

  getQuarter: function(d) {
    var d = d || new Date();
    var q = [1, 2, 3, 4];
    return q[Math.floor(d.getMonth() / 3)];
  },
  onPresetDateClick: function() {
    var preset = $(this).data('preset');

    var $start = $('.field-start-date');
    var $end = $('.field-end-date');
    var start = Date.parseExact($start.val(), 'yyyy-MM-dd');
    var end = Date.parseExact($end.val(), 'yyyy-MM-dd');

    if (preset === 'today') {
      start = Date.today();
      end = Date.today();
    }
    if (preset === 'ytd') {
      start = Date.today().set({
        month: 0,
        day: 1
      });
      end = Date.today();
    }
    if (preset === 'qtd') {
      start = Date.today().set({
        month: this.getFirstMonthOfQuarter(this.getQuarter()),
        day: 1
      });
      end = Date.today();
    }
    if (preset === 'mtd') {
      start = Date.today().moveToFirstDayOfMonth();
      end = Date.today();
    }
    if (preset === 'wtd') {
      start = Date.today().moveToDayOfWeek(0, -1);
      end = Date.today();
    }

    if (preset === 'last-year') {
      start = Date.today().add({
        years: -1
      }).set({
        month: 0,
        day: 1
      });
      end = Date.today().add({
        years: -1
      }).set({
        month: 11
      }).moveToLastDayOfMonth();
    }
    if (preset === 'last-quarter') {
      var firstMonthOfCurrentQuarter = this.getFirstMonthOfQuarter(this.getQuarter());
      var dateInLastQuarter = Date.today().set({
        month: firstMonthOfCurrentQuarter,
        day: 1
      }).add({
        days: -1
      });
      var firstMonthOfLastQuarter = this.getFirstMonthOfQuarter(this.getQuarter(dateInLastQuarter));
      var lastMonthOfLastQuarter = firstMonthOfLastQuarter + 2;
      start = Date.today().set({
        month: firstMonthOfLastQuarter,
        day: 1
      });
      end = Date.today().set({
        month: lastMonthOfLastQuarter
      }).moveToLastDayOfMonth();
    }
    if (preset === 'last-month') {
      start = Date.today().add({
        months: -1
      }).set({
        day: 1
      });
      end = Date.today().add({
        months: -1
      }).moveToLastDayOfMonth();
    }
    if (preset === 'last-week') {
      start = Date.today().moveToDayOfWeek(0, -1).add({
        days: -1
      }).moveToDayOfWeek(0, -1);
      end = Date.today().moveToDayOfWeek(0, -1).add({
        days: -1
      }).moveToDayOfWeek(0, -1).add({
        days: 6
      });
    }

    $start.val(start.toString('yyyy-MM-dd'));
    $end.val(end.toString('yyyy-MM-dd'));

    this.calculateAdjustedDates();
    this.validateForm();

    var $dropdown = $('#preset-dates', this.optionsSelector);
    if ($dropdown.hasClass('open')) {
      $('a[data-dropdown="' + $dropdown.attr('id') + '"]').trigger('click');
    }
  },

  getFirstMonthOfQuarter: function(q) {
    return ((q - 1) * 3);
  },

  validateForm: function() {
    var _this = this;

    this.clearOptionErrors();

    var start = Date.parseExact($('.field-start-date').val(), 'yyyy-MM-dd');
    var end = Date.parseExact($('.field-end-date').val(), 'yyyy-MM-dd');
    var effectiveStart = Date.parseExact($('.adjusted-start-date').val(), 'yyyy-MM-dd');
    var effectiveEnd = Date.parseExact($('.adjusted-end-date').val(), 'yyyy-MM-dd');

    if (start === null) {
      $('.field-start-date').addClass('error').after('<small class="label label-important error error-message">Invalid Date</small>');
    }

    if (end === null) {
      $('.field-end-date').addClass('error').after('<small class="label label-important error error-message">Invalid Date</small>');
    }

    if (!$.isNumeric($('.field-offset-limit').customspinner('value'))) {
      $('.field-offset-limit').addClass('error');
    }

    // validate reference data ranges
    $('.field-reference-data').find('option:selected').each(function(i, el) {
      if (parseInt($(el).val() === 0)) return;
      var optionStart = Date.parse(dateToUTC(new Date($(el).data('start'))).toString('yyyy-MM-dd'), 'yyyy-MM-dd');
      var optionEnd = Date.parse(dateToUTC(new Date($(el).data('end'))).toString('yyyy-MM-dd'), 'yyyy-MM-dd');

      if (start !== null && start.compareTo(optionStart) < 0) {
        _this.addOptionWarning($(el).text() + ' data begins on ' + optionStart.toString('yyyy-MM-dd'));
      }
      if (end !== null && end.compareTo(optionEnd) > 0) {
        _this.addOptionWarning($(el).text() + ' data ends on ' + optionEnd.toString('yyyy-MM-dd'));
      }
    });

    // validate test-data ranges
    $('.field-test-data').find('option:selected').each(function(i, el) {
      if (parseInt($(el).val()) === 0) return;
      var optionStart = Date.parse(dateToUTC(new Date($(el).data('start'))).toString('yyyy-MM-dd'), 'yyyy-MM-dd');
      var optionEnd = Date.parse(dateToUTC(new Date($(el).data('end'))).toString('yyyy-MM-dd'), 'yyyy-MM-dd');

      if (effectiveStart.compareTo(optionStart) < 0) {
        _this.addOptionWarning($(el).text() + ' data begins on ' + optionStart.toString('yyyy-MM-dd'));
      }
      if (effectiveEnd.compareTo(optionEnd) > 0) {
        _this.addOptionWarning($(el).text() + ' data ends on ' + optionEnd.toString('yyyy-MM-dd'));
      }
    });

    if (start !== null && end !== null && start.compareTo(end) >= 0) {
      this.addOptionError('Analysis Start Date must occur before Analysis End Date');
    }

    if (this.hasOptionErrors()) {
      $('.btn-submit', this.optionsSelector).addClass('disabled').attr('disabled', 'disabled');
      return false;
    } else {
      $('.btn-submit', this.optionsSelector).removeClass('disabled').removeAttr('disabled');
      return true;
    }
  },
  calculateAdjustedDates: function() {
    var start = Date.parseExact($('.field-start-date').val(), 'yyyy-MM-dd');
    var end = Date.parseExact($('.field-end-date').val(), 'yyyy-MM-dd');

    var offset = $('.field-offset-limit').val();
    var offsetType = $('.field-offset-type').select2('val');

    if (start !== null && end !== null && $.isNumeric(offset)) {

      offset = parseInt(offset);

      if (offset != 0) {
        if (offsetType === 'day') {
          start.add({
            days: offset * -1
          });
          end.add({
            days: offset
          });
        }
        if (offsetType === 'week') {
          start.add({
            days: offset * 7 * -1
          });
          end.add({
            days: offset * 7
          });
        }
        if (offsetType === 'month') {
          start.add({
            months: offset * -1
          });
          end.add({
            months: offset
          });
        }
        if (offsetType === 'year') {
          start.add({
            years: offset * -1
          });
          end.add({
            years: offset
          });
        }
      }

      var startString = start.toString('yyyy-MM-dd');
      var endString = end.toString('yyyy-MM-dd');

      $('.adjusted-start-date', this.optionsSelector).val(startString);
      $('.adjusted-end-date', this.optionsSelector).val(endString);
    }
  },

  onOffsetChange: function() {
    //TODO validation and date adjustments
    this.calculateAdjustedDates();
    this.validateForm();
  },

  componentDidMount: function() {
    formLib.init();
    $('.field-offset-limit')
      .off('spinstop')
      .on('spinstop', this.onOffsetChange)
      .on('spinchange', this.onOffsetChange);
    this.setOptionValues(this.props.options);
    this.calculateAdjustedDates();
    $('select.selet2-multi, select.select2')
      .off().on('change', this.fieldTestChangeHandler);

    if(this.props.isNew && !this.props.hasData){
      this.props.openOptions();
    } else {
      this.props.hideOptions();
    }
  },

  componentDidUpdate: function() {
    this.setOptionValues(this.props.options);
    $('.field-offset-limit')
      .off('spinstop')
      .on('spinstop', this.onOffsetChange)
      .on('spinchange', this.onOffsetChange);
    this.calculateAdjustedDates();
    $('select.selet2-multi, select.select2')
      .off().on('change', this.fieldTestChangeHandler);
      
    if(this.props.isNew && !this.props.hasData){
      this.props.openOptions();
    } else {
      this.props.hideOptions();
    }
  },

  fieldTestChangeHandler: function() {
    this.calculateAdjustedDates();
    this.validateForm();
  },

  performChartCalculations: function(){
  	//TODO hide EmptyCalculatingMessage
  	//TODO somehow show chart loader???
  	this.props.calculateTrendingCharts(this.getOptionValues());
  },

  submitHandler: function(e) {
    e.preventDefault();
    console.log('IS NEW?', this.props.isNew);
    if(this.props.isNew){
      // hide trending options
      // run the calculations
      this.props.toggleOptions();
      this.performChartCalculations();
    } else {
      console.log('is not new');
      // create new tab
      // and run calculations
      this.props.copySnapshotToTab();

    }
  },

  cancelHandler: function(e) {
    e.preventDefault();
    this.props.toggleOptions();
  },

  render: function () {
    // build options dropdown
    var self = this;
    var groupLabels = {};
    var testGroupLabels = {};
    _.each(this.props.datasets, function(dataset, index){
      var cat = dataset.categoryName;
      if(dataset.optGroup){
        groupLabels[cat] = [];
        groupLabels[cat].push(dataset);
      } else {
        groupLabels[cat].push(dataset);
      }
    });
    var referenceDataOptions = _.map(groupLabels, function(groupLabel, index){
      var firstDataset = groupLabel[0];
      return (
        <GroupLabel categoryName={firstDataset.categoryName} key={index}>
          {function(){
            return groupLabel.map(function(dataset, j){
              return (
                <ReferenceDataOption 
                  parseDate={self.convertDate} 
                  dataset={dataset} 
                  key={j} />
              )
            })
          }.call(this)}
        </GroupLabel>
      )
    });
    _.each(this.props.datasets, function(dataset, index){
      var cat = dataset.categoryName;
      if(dataset.optGroup){
        testGroupLabels[cat] = [];
        testGroupLabels[cat].push(dataset);
      } else {
        testGroupLabels[cat].push(dataset);
      }
    });

    var testDataOptions = _.map(testGroupLabels, function(testGroupLabel, index){
      var firstDataset = testGroupLabel[0];
      return (
        <GroupLabel categoryName={firstDataset.categoryName} key={index}>
          {function(){
            return testGroupLabel.map(function(dataset, j){
              return (
                <TestDataOption 
                  parseDate={self.convertDate} 
                  dataset={dataset} 
                  key={j} />
              )
            })
          }.call(this)}
        </GroupLabel>
      )
    });

    return (
        <div className="row-fluid options-container">
          <div id="trendingOptions">
              <form action="">
                  <fieldset>
                      <div className="row-fluid">
                          <div className="span12">
                              <label>Reference Data</label>
                              <select 
                                ref="referenceOptions" 
                                name="reference_data" 
                                onChange={this.fieldTestChangeHandler} 
                                className="select2 field-reference-data">
                                  <option value="0">-- Choose Data --</option>
                                  {referenceDataOptions}
                              </select>
                          </div>
                      </div>

                      <div className="row-fluid">
                          <div className="span4">
                              <label>&nbsp;</label>

                              <div className="btn-group">
                                  <a href="#" className="btn btn-block dropdown-toggle" data-toggle="dropdown"><i
                                          className="icon-calendar"></i> Choose Preset</a>
                                  <ul id="preset-dates" className="dropdown-menu dropdown-inverse">
                                      <li><a href="#" data-preset="today">Today</a></li>
                                      <li><a href="#" data-preset="ytd">Year-To-Date</a></li>
                                      <li><a href="#" data-preset="qtd">Quarter-To-Date</a></li>
                                      <li><a href="#" data-preset="mtd">Month-To-Date</a></li>
                                      <li><a href="#" data-preset="wtd">Week-To-Date</a></li>
                                      <li><a href="#" data-preset="last-year">Last Year</a></li>
                                      <li><a href="#" data-preset="last-quarter">Last Quarter</a></li>
                                      <li><a href="#" data-preset="last-month">Last Month</a></li>
                                      <li><a href="#" data-preset="last-week">Last Week</a></li>
                                  </ul>
                              </div>
                          </div>
                          <div className="span4">
                              <label>Analysis Start Date</label>
                              <input type="text" className="flat-datepicker field-start-date" onChange={this.onDateChange} defaultValue="2011-01-01"/>
                          </div>
                          <div className="span4">
                              <label>Analysis End Date</label>
                              <input type="text" className="flat-datepicker field-end-date" onChange={this.onDateChange} defaultValue="2012-01-01" />
                          </div>
                      </div>
                      <div className="row-fluid">
                          <div className="span4">
                              <label>Correlation Offset (+/-)</label>
                              <input type="text" className="flat-spinner spinner field-offset-limit" defaultValue="6"/>
                              <select defaultValue="month" style={{width: '99px'}} onChange={this.onOffsetChange} className="field-offset-type select2-hidesearch">
                                  <option readOnly value="day">Days</option>
                                  <option readOnly value="week">Weeks</option>
                                  <option readOnly value="month">Months</option>
                                  <option readOnly value="year">Years</option>
                              </select>
                          </div>
                          <div className="span4">
                              <label data-toggle="tooltip" title="Effective start date considering correlation offset">Required
                                  Start Date</label>
                              <input type="text" className="disabled adjusted-start-date" disabled="disabled"/>
                          </div>
                          <div className="span4">
                              <label data-toggle="tooltip" title="Effective end date considering correlation offset">Required
                                  End Date</label>
                              <input type="text" className="disabled adjusted-end-date" disabled="disabled"/>
                          </div>
                      </div>

                      <div className="row-fluid">
                          <div className="span12">
                              <label>Test Data to Analyze</label>
                              <select style={{width: "578px"}} className="select2-multi field-test-data" onChange={this.fieldTestChangeHandler} multiple
                                      name="test_data">
                                      {testDataOptions}
                              </select>
                          </div>
                      </div>

                      <div className="row-fluid">
                          <div className="span12">
                              <div className="errors"></div>
                          </div>
                      </div>
                      <div className="row-fluid">
                          <div className="span12 text-right">
                              <button 
                                onClick={this.cancelHandler}
                                className="btn btn-cancel">Cancel</button>
                              <button 
                                onClick={this.submitHandler} 
                                className="btn btn-primary btn-submit">Submit</button>
                          </div>
                      </div>
                  </fieldset>
              </form>
          </div>
      </div>

    )
  }
});

SnapshotOptions.propTypes = {
  toggleOptions: React.PropTypes.func.isRequired,
  hideOptions: React.PropTypes.func.isRequired,
  openOptions: React.PropTypes.func.isRequired,
  calculateTrendingCharts: React.PropTypes.func.isRequired,
  copySnapshotToTab: React.PropTypes.func.isRequired,
  options: React.PropTypes.object.isRequired,
  isNew: React.PropTypes.bool,
  currentTab: React.PropTypes.string.isRequired,
  datasets: React.PropTypes.array.isRequired
}

module.exports = SnapshotOptions;