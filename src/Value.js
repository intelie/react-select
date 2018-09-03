var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');
var getLabel = require('./immutable/utils').getLabel;

var Value = createClass({

	displayName: 'Value',

	propTypes: {
		disabled: PropTypes.bool,                   // disabled prop passed to ReactSelect
		onOptionLabelClick: PropTypes.func,         // method to handle click on value label
		onRemove: PropTypes.func,                   // method to handle remove of that value
		option: PropTypes.object.isRequired,        // option passed to component
		optionLabelClick: PropTypes.bool,           // indicates if onOptionLabelClick should be handled
		renderer: PropTypes.func                    // method to render option label passed to ReactSelect
	},

	blockEvent: function(event) {
		event.stopPropagation();
	},

	handleOnRemove: function(event) {
		if (!this.props.disabled) {
			this.props.onRemove(event);
		}
	},

	render: function() {
		var label = getLabel(this.props.option);
		if (this.props.renderer) {
			label = this.props.renderer(this.props.option);
		}

		if(!this.props.onRemove && !this.props.optionLabelClick) {
			return <div className="Select-value">{label}</div>;
		}

		if (this.props.optionLabelClick) {
			label = (
				<a className="Select-item-label__a"
					onMouseDown={this.blockEvent}
					onTouchEnd={this.props.onOptionLabelClick}
					onClick={this.props.onOptionLabelClick}>
					{label}
				</a>
			);
		}

		return (
			<div className="Select-item">
				<span className="Select-item-icon"
					onMouseDown={this.blockEvent}
					onClick={this.handleOnRemove}
					onTouchEnd={this.handleOnRemove}>&times;</span>
				<span className="Select-item-label">{label}</span>
			</div>
		);
	}

});

module.exports = Value;
