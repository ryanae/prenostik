var jest = request('jest');


jest.dontMock('app/components/analyze.js');

describe('Analyze', function() {
	it('renders', function(){
		var React = require('react/addons');
		var Analyze = require('app/components/analyze.js');
		var TestUtils = React.addons.TestUtils;

		var datasets = {}

		var analyzeBox = TestUtils.renderIntoDocument(
			<Analyze datasets={datasets}/>
		);

		var analyzeView = TestUtils.findRenderedDOMComponentWithClass(analyzeBox, 'analyze-view')
		expect(analyzeView).toNotEqual(null);
	});
});