var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');
var Gravatar = require('react-gravatar');

var SingleValue = createClass({
  propTypes: {
    placeholder: PropTypes.string,
    value: PropTypes.object
  },

  render: function() {
    var obj = this.props.value;
    var size = 15;

    return (
      <div className="Select-placeholder">
        {obj ? (
            <div>
              <Gravatar email={obj.email} size={size}/>
              {obj.value}
            </div>
          ) : (
            this.props.placeholder
          )
        }
      </div>
    );
  }
});

module.exports = SingleValue;
