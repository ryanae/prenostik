/* snapshots model and collection */

var Backbone = require('backbone');

var Snapshot = Backbone.Model.extend({
});

// Snapshots Collection

// url: /manage/snapshots
var Snapshots = Backbone.Collection.extend({
	url: '/api/snapshots',
	model: Snapshot,
});


module.exports = Snapshots;