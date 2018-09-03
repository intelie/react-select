"use strict";

var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');

var SingleValue = createClass({
	displayName: "SingleValue",

	propTypes: {
		placeholder: PropTypes.string, // this is default value provided by React-Select based component
		value: PropTypes.object // selected option
	},
	render: function render() {
		return React.createElement(
			"div",
			{ className: "Select-placeholder" },
			this.props.placeholder
		);
	}
});

module.exports = SingleValue;