var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');

var SingleValue = createClass({
	propTypes: {
		placeholder: PropTypes.string,       // this is default value provided by React-Select based component
		value: PropTypes.object              // selected option
	},
	render: function() {
		return (
			<div className="Select-placeholder">{this.props.placeholder}</div>
		);
	}
});

module.exports = SingleValue;
