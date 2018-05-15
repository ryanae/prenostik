import React from 'react';
import expect from 'expect';
import {createRenderer} from 'react-addons-test-utils';
import expectJSX from 'expect-jsx';
import jsdom from 'mocha-jsdom';
expect.extend(expectJSX);

import {SnapshotListModal, SnapshotsTable} from '../SnapshotListModal';

describe('SnapshotListModal', () => {	
	jsdom();
	it('works', () => {
		let renderer = createRenderer();
		renderer.render(<SnapshotListModal snapshots={[]} />);
		let actualElement = renderer.getRenderOutput();
		var getExpectedElement = () => {
			return (
				<div ref="snapModal" className="modal hide fade" 
					id="openWorksheetModal">
					  <div className="modal-header">
					    <button
					      aria-hidden="true"
					      className="close"
					      data-dismiss="modal"
					      type="button"
					    >
					      ×
					    </button>
					    <h3>
					      Open Snapshot
					    </h3>
					  </div>
					  <div className="modal-body">
					    <SnapshotsTable
					      closeModal={function noRefCheck() {}}
					      snapshots={[]}
					    />
					  </div>
					  <div className="modal-footer">
					    <a
					      className="btn"
					      data-dismiss="modal"
					      href="#"
					    >
					      Cancel
					    </a>
					  </div>
			    </div>
			);
		};
		let expectedElement = getExpectedElement();
		expect(actualElement).toEqualJSX(expectedElement);
	})
});
