var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');
var getLabel = require('./immutable/utils').getLabel;

var Option = createClass({
	propTypes: {
		addLabelText: PropTypes.string,          // string rendered in case of allowCreate option passed to ReactSelect
		className: PropTypes.string,             // className (based on mouse position)
		mouseDown: PropTypes.func,               // method to handle click on option element
		mouseEnter: PropTypes.func,              // method to handle mouseEnter on option element
		mouseLeave: PropTypes.func,              // method to handle mouseLeave on option element
		option: PropTypes.object.isRequired,     // object that is base for that option
		renderFunc: PropTypes.func               // method passed to ReactSelect component to render label text
	},

	render: function() {
		var obj = this.props.option;
		var renderedLabel = this.props.renderFunc(obj);

		return obj.disabled ? (
			<div className={this.props.className}>{renderedLabel}</div>
		) : (
			<div className={this.props.className}
				onMouseEnter={this.props.mouseEnter}
				onMouseLeave={this.props.mouseLeave}
				onMouseDown={this.props.mouseDown}
				onClick={this.props.mouseDown}>
				{ obj.create ? this.props.addLabelText.replace('{label}', getLabel(obj)) : renderedLabel }
			</div>
		);
	}
});

module.exports = Option;
