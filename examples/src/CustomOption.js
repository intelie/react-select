var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');

var Gravatar = require('react-gravatar');

var Option = createClass({
  propTypes: {
    addLabelText: PropTypes.string,
    className: PropTypes.string,
    mouseDown: PropTypes.func,
    mouseEnter: PropTypes.func,
    mouseLeave: PropTypes.func,
    option: PropTypes.object.isRequired,
    renderFunc: PropTypes.func
  },

  render: function() {
    var obj = this.props.option;
    var size = 15;

    return (
      <div className={this.props.className}
        onMouseEnter={this.props.mouseEnter}
        onMouseLeave={this.props.mouseLeave}
        onMouseDown={this.props.mouseDown}
        onClick={this.props.mouseDown}>
        <Gravatar email={obj.email} size={size}/>
        {obj.value}
      </div>
    );
  }
});

module.exports = Option;
