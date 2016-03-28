require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = require('react');

var Gravatar = require('react-gravatar');

var Option = React.createClass({
  displayName: 'Option',

  propTypes: {
    addLabelText: React.PropTypes.string,
    className: React.PropTypes.string,
    mouseDown: React.PropTypes.func,
    mouseEnter: React.PropTypes.func,
    mouseLeave: React.PropTypes.func,
    option: React.PropTypes.object.isRequired,
    renderFunc: React.PropTypes.func
  },

  render: function render() {
    var obj = this.props.option;
    var size = 15;

    return React.createElement(
      'div',
      { className: this.props.className,
        onMouseEnter: this.props.mouseEnter,
        onMouseLeave: this.props.mouseLeave,
        onMouseDown: this.props.mouseDown,
        onClick: this.props.mouseDown },
      React.createElement(Gravatar, { email: obj.email, size: size }),
      obj.value
    );
  }
});

module.exports = Option;

},{"react":undefined,"react-gravatar":9}],2:[function(require,module,exports){
'use strict';

var React = require('react');
var Gravatar = require('react-gravatar');

var SingleValue = React.createClass({
  displayName: 'SingleValue',

  propTypes: {
    placeholder: React.PropTypes.string,
    value: React.PropTypes.object
  },

  render: function render() {
    var obj = this.props.value;
    var size = 15;

    return React.createElement(
      'div',
      { className: 'Select-placeholder' },
      obj ? React.createElement(
        'div',
        null,
        React.createElement(Gravatar, { email: obj.email, size: size }),
        obj.value
      ) : this.props.placeholder
    );
  }
});

module.exports = SingleValue;

},{"react":undefined,"react-gravatar":9}],3:[function(require,module,exports){
/* eslint react/prop-types: 0 */

'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Select = require('react-select');
var Immutable = require('immutable');
var GravatarOption = require('./CustomOption');
var GravatarValue = require('./CustomSingleValue');

var STATES = require('./data/states');
var USERS = require('./data/users');
var id = 0;

function logChange() {
	console.log.apply(console, [].concat(['Select value changed: '], Array.prototype.slice.apply(arguments)));
}

var CountrySelect = React.createClass({
	displayName: 'CountrySelect',

	onClick: function onClick() {
		this.props.onSelect(this.props.value);
	},
	render: function render() {
		var className = this.props.value === this.props.selected ? 'active' : 'link';
		return React.createElement(
			'span',
			{ onClick: this.onClick, className: className },
			this.props.children
		);
	}
});

var UsersField = React.createClass({
	displayName: 'UsersField',

	getDefaultProps: function getDefaultProps() {
		return {
			searchable: true,
			label: 'Users: (with custom option and value component)'
		};
	},
	render: function render() {

		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				onOptionLabelClick: this.onLabelClick,
				placeholder: 'Select user',
				optionComponent: GravatarOption,
				singleValueComponent: GravatarValue,
				options: USERS.users })
		);
	}
});

var ValuesAsNumbersField = React.createClass({
	displayName: 'ValuesAsNumbersField',

	getInitialState: function getInitialState() {
		return {
			options: [{ value: 10, label: 'Ten' }, { value: 11, label: 'Eleven' }, { value: 12, label: 'Twelve' }, { value: 23, label: 'Twenty-three' }, { value: 24, label: 'Twenty-three' }],
			matchPos: 'any',
			matchValue: true,
			matchLabel: true,
			value: null,
			multi: false
		};
	},

	onChangeMatchStart: function onChangeMatchStart(event) {
		this.setState({
			matchPos: event.target.checked ? 'start' : 'any'
		});
	},

	onChangeMatchValue: function onChangeMatchValue(event) {
		this.setState({
			matchValue: event.target.checked
		});
	},

	onChangeMatchLabel: function onChangeMatchLabel(event) {
		this.setState({
			matchLabel: event.target.checked
		});
	},

	onChange: function onChange(value, values) {
		this.setState({
			value: value
		});
		logChange(value, values);
	},

	onChangeMulti: function onChangeMulti(event) {
		this.setState({
			multi: event.target.checked
		});
	},

	render: function render() {

		var matchProp = 'any';

		if (this.state.matchLabel && !this.state.matchValue) {
			matchProp = 'label';
		}

		if (!this.state.matchLabel && this.state.matchValue) {
			matchProp = 'value';
		}

		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				searchable: true,
				matchProp: matchProp,
				matchPos: this.state.matchPos,
				options: this.state.options,
				onChange: this.onChange,
				value: this.state.value,
				multi: this.state.multi
			}),
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					{ htmlFor: 'values-as-numbers-multi' },
					'Multi-Select?'
				),
				React.createElement('input', { type: 'checkbox', id: 'values-as-numbers-multi', checked: this.state.multi, onChange: this.onChangeMulti }),
				React.createElement(
					'label',
					{ htmlFor: 'values-as-numbers-matchstart' },
					'Match only at start?'
				),
				React.createElement('input', { type: 'checkbox', id: 'values-as-numbers-matchstart', checked: this.state.matchPos === 'start', onChange: this.onChangeMatchStart }),
				React.createElement(
					'label',
					{ htmlFor: 'values-as-numbers-matchvalue' },
					'Match value?'
				),
				React.createElement('input', { type: 'checkbox', id: 'values-as-numbers-matchvalue', checked: this.state.matchValue, onChange: this.onChangeMatchValue }),
				React.createElement(
					'label',
					{ htmlFor: 'values-as-numbers-matchlabel' },
					'Match label?'
				),
				React.createElement('input', { type: 'checkbox', id: 'values-as-numbers-matchlabel', checked: this.state.matchLabel, onChange: this.onChangeMatchLabel })
			)
		);
	}
});

var StatesField = React.createClass({
	displayName: 'StatesField',

	getDefaultProps: function getDefaultProps() {
		return {
			searchable: true,
			label: 'States:'
		};
	},
	getInitialState: function getInitialState() {
		return {
			country: 'AU',
			disabled: false,
			id: ++id,
			selectValue: 'new-south-wales'
		};
	},
	switchCountry: function switchCountry(newCountry) {
		console.log('Country changed to ' + newCountry);
		this.setState({
			country: newCountry,
			selectValue: null
		});
	},
	updateValue: function updateValue(newValue) {
		logChange('State changed to ' + newValue);
		this.setState({
			selectValue: newValue || null
		});
	},
	focusStateSelect: function focusStateSelect() {
		this.refs.stateSelect.focus();
	},
	toggleDisabled: function toggleDisabled(e) {
		this.setState({ disabled: e.target.checked });
	},
	render: function render() {
		var ops = STATES[this.state.country];
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, { ref: 'stateSelect', options: ops, disabled: this.state.disabled, value: this.state.selectValue, onChange: this.updateValue, searchable: this.props.searchable }),
			React.createElement(
				'div',
				{ className: 'switcher' },
				'Country:',
				React.createElement(
					CountrySelect,
					{ value: 'AU', selected: this.state.country, onSelect: this.switchCountry },
					'Australia'
				),
				React.createElement(
					CountrySelect,
					{ value: 'US', selected: this.state.country, onSelect: this.switchCountry },
					'US'
				),
				'  ',
				React.createElement(
					'button',
					{ type: 'button', onClick: this.focusStateSelect },
					'Focus Select'
				),
				'  ',
				React.createElement('input', { type: 'checkbox', checked: this.state.disabled, id: 'disable-states-' + this.state.id, onChange: this.toggleDisabled }),
				React.createElement(
					'label',
					{ htmlFor: 'disable-states-' + this.state.id },
					'Disable'
				)
			)
		);
	}
});

var RemoteSelectField = React.createClass({
	displayName: 'RemoteSelectField',

	loadOptions: function loadOptions(input, callback) {
		input = input.toLowerCase();
		var rtn = {
			options: [{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }],
			complete: true
		};
		if (input.slice(0, 1) === 'a') {
			if (input.slice(0, 2) === 'ab') {
				rtn = {
					options: [{ label: 'AB', value: 'ab' }, { label: 'ABC', value: 'abc' }, { label: 'ABCD', value: 'abcd' }],
					complete: true
				};
			} else {
				rtn = {
					options: [{ label: 'A', value: 'a' }, { label: 'AA', value: 'aa' }, { label: 'AB', value: 'ab' }],
					complete: false
				};
			}
		} else if (!input.length) {
			rtn.complete = false;
		}

		setTimeout(function () {
			callback(null, rtn);
		}, 500);
	},
	render: function render() {
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, { asyncOptions: this.loadOptions, className: 'remote-example' })
		);
	}
});

var MultiSelectField = React.createClass({
	displayName: 'MultiSelectField',

	getInitialState: function getInitialState() {
		return {
			disabled: false,
			value: []
		};
	},
	handleSelectChange: function handleSelectChange(value, values) {
		logChange('New value:', value, 'Values:', values);
		this.setState({ value: value });
	},
	toggleDisabled: function toggleDisabled(e) {
		this.setState({ 'disabled': e.target.checked });
	},
	render: function render() {
		var ops = [{ label: 'Chocolate', value: 'chocolate' }, { label: 'Vanilla', value: 'vanilla' }, { label: 'Strawberry', value: 'strawberry' }, { label: 'Caramel', value: 'caramel' }, { label: 'Cookies and Cream', value: 'cookiescream' }, { label: 'Peppermint', value: 'peppermint' }];
		return React.createElement(
			'span',
			null,
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					null,
					this.props.label
				),
				React.createElement(Select, { multi: true, disabled: this.state.disabled, value: this.state.value, placeholder: 'Select your favourite(s)', options: ops, onChange: this.handleSelectChange })
			),
			React.createElement(
				'div',
				null,
				React.createElement('input', { type: 'checkbox', checked: this.state.disabled, id: 'disable-multiselect', onChange: this.toggleDisabled }),
				React.createElement(
					'label',
					{ htmlFor: 'disable-multiselect' },
					'Disable'
				)
			)
		);
	}
});

var SelectedValuesField = React.createClass({
	displayName: 'SelectedValuesField',

	onLabelClick: function onLabelClick(data, event) {
		console.log(data, event);
	},
	render: function render() {
		var ops = [{ label: 'Chocolate', value: 'chocolate' }, { label: 'Vanilla', value: 'vanilla' }, { label: 'Strawberry', value: 'strawberry' }, { label: 'Caramel', value: 'caramel' }, { label: 'Cookies and Cream', value: 'cookiescream' }, { label: 'Peppermint', value: 'peppermint' }];
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				onOptionLabelClick: this.onLabelClick,
				value: 'chocolate,vanilla,strawberry',
				multi: true,
				placeholder: 'Select your favourite(s)',
				options: ops,
				onChange: logChange })
		);
	}
});

var SelectedValuesFieldDisabled = React.createClass({
	displayName: 'SelectedValuesFieldDisabled',

	onLabelClick: function onLabelClick(data, event) {
		console.log(data, event);
	},
	render: function render() {
		var ops = [{ label: 'Chocolate', value: 'chocolate' }, { label: 'Vanilla', value: 'vanilla' }, { label: 'Strawberry', value: 'strawberry' }, { label: 'Caramel (You don\'t like it, apparently)', value: 'caramel', disabled: true }, { label: 'Cookies and Cream', value: 'cookiescream' }, { label: 'Peppermint', value: 'peppermint' }];
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				onOptionLabelClick: this.onLabelClick,
				value: 'chocolate,vanilla,strawberry',
				multi: true,
				placeholder: 'Select your favourite(s)',
				options: ops,
				onChange: logChange })
		);
	}
});

var SelectedValuesFieldCreate = React.createClass({
	displayName: 'SelectedValuesFieldCreate',

	onLabelClick: function onLabelClick(data, event) {
		console.log(data, event);
	},
	render: function render() {
		var ops = [{ label: 'First Option', value: 'first' }, { label: 'Second Option', value: 'second' }, { label: 'Third Option', value: 'third' }];
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				value: 'first',
				delimiter: ',',
				multi: true,
				allowCreate: true,
				placeholder: 'Select your favourite(s)',
				options: ops,
				onChange: logChange })
		);
	}
});

var CustomRenderField = React.createClass({
	displayName: 'CustomRenderField',

	onLabelClick: function onLabelClick(data, event) {
		console.log(data, event);
	},
	renderOption: function renderOption(option) {
		return React.createElement(
			'span',
			{ style: { color: option.hex } },
			option.label,
			' (',
			option.hex,
			')'
		);
	},
	renderValue: function renderValue(option) {
		return React.createElement(
			'strong',
			{ style: { color: option.hex } },
			option.label
		);
	},
	render: function render() {
		var ops = [{ label: 'Red', value: 'red', hex: '#EC6230' }, { label: 'Green', value: 'green', hex: '#4ED84E' }, { label: 'Blue', value: 'blue', hex: '#6D97E2' }];
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				allowCreate: true,
				placeholder: 'Select your favourite',
				options: ops,
				optionRenderer: this.renderOption,
				valueRenderer: this.renderValue,
				onChange: logChange })
		);
	}
});

var CustomRenderMultiField = React.createClass({
	displayName: 'CustomRenderMultiField',

	onLabelClick: function onLabelClick(data, event) {
		console.log(data, event);
	},
	renderOption: function renderOption(option) {
		return React.createElement(
			'span',
			{ style: { color: option.hex } },
			option.label,
			' (',
			option.hex,
			')'
		);
	},
	renderValue: function renderValue(option) {
		return React.createElement(
			'strong',
			{ style: { color: option.hex } },
			option.label
		);
	},
	render: function render() {
		var ops = [{ label: 'Red', value: 'red', hex: '#EC6230' }, { label: 'Green', value: 'green', hex: '#4ED84E' }, { label: 'Blue', value: 'blue', hex: '#6D97E2' }];
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				delimiter: ',',
				multi: true,
				allowCreate: true,
				placeholder: 'Select your favourite(s)',
				options: ops,
				optionRenderer: this.renderOption,
				valueRenderer: this.renderValue,
				onChange: logChange })
		);
	}
});

var ImmutableField = React.createClass({
	displayName: 'ImmutableField',

	onLabelClick: function onLabelClick(data, event) {
		console.log(data, event);
	},
	render: function render() {
		var ops = Immutable.fromJS([{ label: 'First Option', value: 'first' }, { label: 'Second Option', value: 'second' }, { label: 'Third Option', value: 'third' }]);
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				delimiter: ',',
				multi: this.props.multi,
				placeholder: 'Select your favourite(s)',
				options: ops,
				onChange: logChange })
		);
	}
});

var LazyField = React.createClass({
	displayName: 'LazyField',

	onLabelClick: function onLabelClick(data, event) {
		console.log(data, event);
	},
	render: function render() {
		var ops = Immutable.Range(1, 1000).map(function (i) {
			return { label: i.toString(), value: i };
		}).toList();
		return React.createElement(
			'div',
			null,
			React.createElement(
				'label',
				null,
				this.props.label
			),
			React.createElement(Select, {
				delimiter: ',',
				multi: this.props.multi,
				placeholder: 'Select your favourite(s)',
				options: ops,
				onChange: logChange,
				lazy: true })
		);
	}
});

ReactDOM.render(React.createElement(
	'div',
	null,
	React.createElement(StatesField, null),
	React.createElement(StatesField, { label: 'States (non-searchable):', searchable: false }),
	React.createElement(UsersField, null),
	React.createElement(ValuesAsNumbersField, { label: 'Values as numbers' }),
	React.createElement(MultiSelectField, { label: 'Multiselect:' }),
	React.createElement(SelectedValuesField, { label: 'Clickable labels (labels as links):' }),
	React.createElement(SelectedValuesFieldDisabled, { label: 'Disabled option:' }),
	React.createElement(SelectedValuesFieldCreate, { label: 'Option Creation (tags mode):' }),
	React.createElement(CustomRenderField, { label: 'Custom rendering for options and values:' }),
	React.createElement(CustomRenderMultiField, { label: 'Custom rendering for multiple options and values:' }),
	React.createElement(RemoteSelectField, { label: 'Remote Options:' }),
	React.createElement(ImmutableField, { label: 'Immutable single:', multi: false }),
	React.createElement(ImmutableField, { label: 'Immutable multi:', multi: true }),
	React.createElement(LazyField, { label: 'Lazy with Immutable data' })
), document.getElementById('example'));

},{"./CustomOption":1,"./CustomSingleValue":2,"./data/states":4,"./data/users":5,"immutable":undefined,"react":undefined,"react-dom":undefined,"react-select":undefined}],4:[function(require,module,exports){
'use strict';

exports.AU = [{ value: 'australian-capital-territory', label: 'Australian Capital Territory' }, { value: 'new-south-wales', label: 'New South Wales' }, { value: 'victoria', label: 'Victoria' }, { value: 'queensland', label: 'Queensland' }, { value: 'western-australia', label: 'Western Australia' }, { value: 'south-australia', label: 'South Australia' }, { value: 'tasmania', label: 'Tasmania' }, { value: 'northern-territory', label: 'Northern Territory' }];

exports.US = [{ value: 'AL', label: 'Alabama', disabled: true }, { value: 'AK', label: 'Alaska' }, { value: 'AS', label: 'American Samoa' }, { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' }, { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'DC', label: 'District Of Columbia' }, { value: 'FM', label: 'Federated States Of Micronesia' }, { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' }, { value: 'GU', label: 'Guam' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' }, { value: 'MH', label: 'Marshall Islands' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' }, { value: 'MP', label: 'Northern Mariana Islands' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' }, { value: 'PW', label: 'Palau' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'PR', label: 'Puerto Rico' }, { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' }, { value: 'VI', label: 'Virgin Islands' }, { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }];

},{}],5:[function(require,module,exports){
'use strict';

exports.users = [{ value: 'John Smith', label: 'John Smith', email: 'john@smith.com' }, { value: 'Merry Jane', label: 'Merry Jane', email: 'merry@jane.com' }, { value: 'Stan Hoper', label: 'Stan Hoper', email: 'stan@hoper.com' }];

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],8:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":6,"./encode":7}],9:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var React, isRetina, md5, querystring;

React = require('react');

md5 = require('md5');

querystring = require('querystring');

isRetina = require('is-retina');

module.exports = React.createClass({
  displayName: 'Gravatar',
  propTypes: {
    email: React.PropTypes.string,
    md5: React.PropTypes.string,
    size: React.PropTypes.number,
    rating: React.PropTypes.string,
    https: React.PropTypes.bool,
    "default": React.PropTypes.string,
    className: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      size: 50,
      rating: 'g',
      https: false,
      "default": "retro"
    };
  },
  render: function() {
    var base, hash, modernBrowser, query, retinaQuery, retinaSrc, src;
    base = this.props.https ? "https://secure.gravatar.com/avatar/" : 'http://www.gravatar.com/avatar/';
    query = querystring.stringify({
      s: this.props.size,
      r: this.props.rating,
      d: this.props["default"]
    });
    retinaQuery = querystring.stringify({
      s: this.props.size * 2,
      r: this.props.rating,
      d: this.props["default"]
    });
    if (this.props.md5) {
      hash = this.props.md5;
    } else if (this.props.email) {
      hash = md5(this.props.email);
    } else {
      console.warn('Gravatar image can not be fetched. Either the "email" or "md5" prop must be specified.');
      return React.createElement("script", null);
    }
    src = base + hash + "?" + query;
    retinaSrc = base + hash + "?" + retinaQuery;
    modernBrowser = true;
    if (typeof window !== "undefined" && window !== null) {
      modernBrowser = 'srcset' in document.createElement('img');
    }
    if (!modernBrowser && isRetina()) {
      return React.createElement("img", React.__spread({
        "style": this.props.style,
        "className": "react-gravatar " + this.props.className,
        "src": retinaSrc,
        "height": this.props.size,
        "width": this.props.size
      }, this.props));
    } else {
      return React.createElement("img", React.__spread({
        "style": this.props.style,
        "className": "react-gravatar " + this.props.className,
        "src": src,
        "srcSet": retinaSrc + " 2x",
        "height": this.props.size,
        "width": this.props.size
      }, this.props));
    }
  }
});

},{"is-retina":10,"md5":11,"querystring":8,"react":undefined}],10:[function(require,module,exports){
module.exports = function() {
  var mediaQuery;
  if (typeof window !== "undefined" && window !== null) {
    mediaQuery = "(-webkit-min-device-pixel-ratio: 1.25), (min--moz-device-pixel-ratio: 1.25), (-o-min-device-pixel-ratio: 5/4), (min-resolution: 1.25dppx)";
    if (window.devicePixelRatio > 1.25) {
      return true;
    }
    if (window.matchMedia && window.matchMedia(mediaQuery).matches) {
      return true;
    }
  }
  return false;
};

},{}],11:[function(require,module,exports){
(function(){
  var crypt = require('crypt'),
      utf8 = require('charenc').utf8,
      isBuffer = require('is-buffer'),
      bin = require('charenc').bin,

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if(typeof message == 'undefined')
      return;

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();

},{"charenc":12,"crypt":13,"is-buffer":14}],12:[function(require,module,exports){
var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;

},{}],13:[function(require,module,exports){
(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();

},{}],14:[function(require,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9leGFtcGxlcy9zcmMvQ3VzdG9tT3B0aW9uLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9leGFtcGxlcy9zcmMvQ3VzdG9tU2luZ2xlVmFsdWUuanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L2V4YW1wbGVzL3NyYy9hcHAuanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L2V4YW1wbGVzL3NyYy9kYXRhL3N0YXRlcy5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3QvZXhhbXBsZXMvc3JjL2RhdGEvdXNlcnMuanMiLCJub2RlX21vZHVsZXMvcmVhY3QtY29tcG9uZW50LWd1bHAtdGFza3Mvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9kZWNvZGUuanMiLCJub2RlX21vZHVsZXMvcmVhY3QtY29tcG9uZW50LWd1bHAtdGFza3Mvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCJub2RlX21vZHVsZXMvcmVhY3QtY29tcG9uZW50LWd1bHAtdGFza3Mvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1ncmF2YXRhci9kaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LWdyYXZhdGFyL25vZGVfbW9kdWxlcy9pcy1yZXRpbmEvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVhY3QtZ3JhdmF0YXIvbm9kZV9tb2R1bGVzL21kNS9tZDUuanMiLCJub2RlX21vZHVsZXMvcmVhY3QtZ3JhdmF0YXIvbm9kZV9tb2R1bGVzL21kNS9ub2RlX21vZHVsZXMvY2hhcmVuYy9jaGFyZW5jLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LWdyYXZhdGFyL25vZGVfbW9kdWxlcy9tZDUvbm9kZV9tb2R1bGVzL2NyeXB0L2NyeXB0LmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LWdyYXZhdGFyL25vZGVfbW9kdWxlcy9tZDUvbm9kZV9tb2R1bGVzL2lzLWJ1ZmZlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU3QixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFekMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQzdCLFdBQVMsRUFBRTtBQUNULGdCQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ3BDLGFBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDakMsYUFBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUMvQixjQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGNBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDaEMsVUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDekMsY0FBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtHQUNqQzs7QUFFRCxRQUFNLEVBQUUsa0JB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgR3JhdmF0YXIgPSByZXF1aXJlKCdyZWFjdC1ncmF2YXRhcicpO1xuXG52YXIgT3B0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBhZGRMYWJlbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgY2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIG1vdXNlRG93bjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgbW91c2VFbnRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgbW91c2VMZWF2ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgcmVuZGVyRnVuYzogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvYmogPSB0aGlzLnByb3BzLm9wdGlvbjtcbiAgICB2YXIgc2l6ZSA9IDE1O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLnByb3BzLm1vdXNlRW50ZXJ9XG4gICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5wcm9wcy5tb3VzZUxlYXZlfVxuICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5wcm9wcy5tb3VzZURvd259XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMubW91c2VEb3dufT5cbiAgICAgICAgPEdyYXZhdGFyIGVtYWlsPXtvYmouZW1haWx9IHNpemU9e3NpemV9Lz5cbiAgICAgICAge29iai52YWx1ZX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgR3JhdmF0YXIgPSByZXF1aXJlKCdyZWFjdC1ncmF2YXRhcicpO1xuXG52YXIgU2luZ2xlVmFsdWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIHBsYWNlaG9sZGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb2JqID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICB2YXIgc2l6ZSA9IDE1O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LXBsYWNlaG9sZGVyXCI+XG4gICAgICAgIHtvYmogPyAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8R3JhdmF0YXIgZW1haWw9e29iai5lbWFpbH0gc2l6ZT17c2l6ZX0vPlxuICAgICAgICAgICAgICB7b2JqLnZhbHVlfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIHRoaXMucHJvcHMucGxhY2Vob2xkZXJcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZVZhbHVlO1xuIiwiLyogZXNsaW50IHJlYWN0L3Byb3AtdHlwZXM6IDAgKi9cblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xudmFyIFNlbGVjdCA9IHJlcXVpcmUoJ3JlYWN0LXNlbGVjdCcpO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xudmFyIEdyYXZhdGFyT3B0aW9uID0gcmVxdWlyZSgnLi9DdXN0b21PcHRpb24nKTtcbnZhciBHcmF2YXRhclZhbHVlID0gcmVxdWlyZSgnLi9DdXN0b21TaW5nbGVWYWx1ZScpO1xuXG52YXIgU1RBVEVTID0gcmVxdWlyZSgnLi9kYXRhL3N0YXRlcycpO1xudmFyIFVTRVJTID0gcmVxdWlyZSgnLi9kYXRhL3VzZXJzJyk7XG52YXIgaWQgPSAwO1xuXG5mdW5jdGlvbiBsb2dDaGFuZ2UoKSB7XG5cdGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIFtdLmNvbmNhdChbJ1NlbGVjdCB2YWx1ZSBjaGFuZ2VkOiAnXSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFyZ3VtZW50cykpKTtcbn1cblxudmFyIENvdW50cnlTZWxlY3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy52YWx1ZSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IHRoaXMucHJvcHMudmFsdWUgPT09IHRoaXMucHJvcHMuc2VsZWN0ZWQgPyAnYWN0aXZlJyA6ICdsaW5rJztcblx0XHRyZXR1cm4gPHNwYW4gb25DbGljaz17dGhpcy5vbkNsaWNrfSBjbGFzc05hbWU9e2NsYXNzTmFtZX0+e3RoaXMucHJvcHMuY2hpbGRyZW59PC9zcGFuPjtcblx0fVxufSk7XG5cbnZhciBVc2Vyc0ZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VhcmNoYWJsZTogdHJ1ZSxcblx0XHRcdGxhYmVsOiAnVXNlcnM6ICh3aXRoIGN1c3RvbSBvcHRpb24gYW5kIHZhbHVlIGNvbXBvbmVudCknXG5cdFx0fTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0PFNlbGVjdFxuXHRcdFx0XHRcdG9uT3B0aW9uTGFiZWxDbGljaz17dGhpcy5vbkxhYmVsQ2xpY2t9XG5cdFx0XHRcdFx0cGxhY2Vob2xkZXI9XCJTZWxlY3QgdXNlclwiXG5cdFx0XHRcdFx0b3B0aW9uQ29tcG9uZW50PXtHcmF2YXRhck9wdGlvbn1cblx0XHRcdFx0XHRzaW5nbGVWYWx1ZUNvbXBvbmVudD17R3JhdmF0YXJWYWx1ZX1cblx0XHRcdFx0XHRvcHRpb25zPXtVU0VSUy51c2Vyc30vPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbnZhciBWYWx1ZXNBc051bWJlcnNGaWVsZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0b3B0aW9uczogW1xuXHRcdFx0XHR7IHZhbHVlOiAxMCwgbGFiZWw6ICdUZW4nIH0sXG5cdFx0XHRcdHsgdmFsdWU6IDExLCBsYWJlbDogJ0VsZXZlbicgfSxcblx0XHRcdFx0eyB2YWx1ZTogMTIsIGxhYmVsOiAnVHdlbHZlJyB9LFxuXHRcdFx0XHR7IHZhbHVlOiAyMywgbGFiZWw6ICdUd2VudHktdGhyZWUnIH0sXG5cdFx0XHRcdHsgdmFsdWU6IDI0LCBsYWJlbDogJ1R3ZW50eS10aHJlZScgfVxuXHRcdFx0XSxcblx0XHRcdG1hdGNoUG9zOiAnYW55Jyxcblx0XHRcdG1hdGNoVmFsdWU6IHRydWUsXG5cdFx0XHRtYXRjaExhYmVsOiB0cnVlLFxuXHRcdFx0dmFsdWU6IG51bGwsXG5cdFx0XHRtdWx0aTogZmFsc2Vcblx0XHR9O1xuXHR9LFxuXG5cdG9uQ2hhbmdlTWF0Y2hTdGFydChldmVudCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bWF0Y2hQb3M6IGV2ZW50LnRhcmdldC5jaGVja2VkID8gJ3N0YXJ0JyA6ICdhbnknXG5cdFx0fSk7XG5cdH0sXG5cblx0b25DaGFuZ2VNYXRjaFZhbHVlKGV2ZW50KSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRtYXRjaFZhbHVlOiBldmVudC50YXJnZXQuY2hlY2tlZFxuXHRcdH0pO1xuXHR9LFxuXG5cdG9uQ2hhbmdlTWF0Y2hMYWJlbChldmVudCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bWF0Y2hMYWJlbDogZXZlbnQudGFyZ2V0LmNoZWNrZWRcblx0XHR9KTtcblx0fSxcblxuXHRvbkNoYW5nZSh2YWx1ZSwgdmFsdWVzKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHR2YWx1ZTogdmFsdWVcblx0XHR9KTtcblx0XHRsb2dDaGFuZ2UodmFsdWUsIHZhbHVlcyk7XG5cdH0sXG5cblx0b25DaGFuZ2VNdWx0aShldmVudCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bXVsdGk6IGV2ZW50LnRhcmdldC5jaGVja2VkXG5cdFx0fSk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgbWF0Y2hQcm9wID0gJ2FueSc7XG5cblx0XHRpZiAodGhpcy5zdGF0ZS5tYXRjaExhYmVsICYmICF0aGlzLnN0YXRlLm1hdGNoVmFsdWUpIHtcblx0XHRcdG1hdGNoUHJvcCA9ICdsYWJlbCc7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnN0YXRlLm1hdGNoTGFiZWwgJiYgdGhpcy5zdGF0ZS5tYXRjaFZhbHVlKSB7XG5cdFx0XHRtYXRjaFByb3AgPSAndmFsdWUnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0PFNlbGVjdFxuXHRcdFx0XHRcdHNlYXJjaGFibGU9e3RydWV9XG5cdFx0XHRcdFx0bWF0Y2hQcm9wPXttYXRjaFByb3B9XG5cdFx0XHRcdFx0bWF0Y2hQb3M9e3RoaXMuc3RhdGUubWF0Y2hQb3N9XG5cdFx0XHRcdFx0b3B0aW9ucz17dGhpcy5zdGF0ZS5vcHRpb25zfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuXHRcdFx0XHRcdHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfVxuXHRcdFx0XHRcdG11bHRpPXt0aGlzLnN0YXRlLm11bHRpfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDxkaXY+XG5cdFx0XHRcdFx0PGxhYmVsIGh0bWxGb3I9XCJ2YWx1ZXMtYXMtbnVtYmVycy1tdWx0aVwiPk11bHRpLVNlbGVjdD88L2xhYmVsPlxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cInZhbHVlcy1hcy1udW1iZXJzLW11bHRpXCIgY2hlY2tlZD17dGhpcy5zdGF0ZS5tdWx0aX0gb25DaGFuZ2U9e3RoaXMub25DaGFuZ2VNdWx0aX0gLz5cblx0XHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj1cInZhbHVlcy1hcy1udW1iZXJzLW1hdGNoc3RhcnRcIj5NYXRjaCBvbmx5IGF0IHN0YXJ0PzwvbGFiZWw+XG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwidmFsdWVzLWFzLW51bWJlcnMtbWF0Y2hzdGFydFwiIGNoZWNrZWQ9e3RoaXMuc3RhdGUubWF0Y2hQb3MgPT09ICdzdGFydCd9IG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlTWF0Y2hTdGFydH0gLz5cblx0XHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj1cInZhbHVlcy1hcy1udW1iZXJzLW1hdGNodmFsdWVcIj5NYXRjaCB2YWx1ZT88L2xhYmVsPlxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cInZhbHVlcy1hcy1udW1iZXJzLW1hdGNodmFsdWVcIiBjaGVja2VkPXt0aGlzLnN0YXRlLm1hdGNoVmFsdWV9IG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlTWF0Y2hWYWx1ZX0gLz5cblx0XHRcdFx0XHQ8bGFiZWwgaHRtbEZvcj1cInZhbHVlcy1hcy1udW1iZXJzLW1hdGNobGFiZWxcIj5NYXRjaCBsYWJlbD88L2xhYmVsPlxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cInZhbHVlcy1hcy1udW1iZXJzLW1hdGNobGFiZWxcIiBjaGVja2VkPXt0aGlzLnN0YXRlLm1hdGNoTGFiZWx9IG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlTWF0Y2hMYWJlbH0gLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxudmFyIFN0YXRlc0ZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VhcmNoYWJsZTogdHJ1ZSxcblx0XHRcdGxhYmVsOiAnU3RhdGVzOidcblx0XHR9O1xuXHR9LFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjb3VudHJ5OiAnQVUnLFxuXHRcdFx0ZGlzYWJsZWQ6IGZhbHNlLFxuXHRcdFx0aWQ6ICsraWQsXG5cdFx0XHRzZWxlY3RWYWx1ZTogJ25ldy1zb3V0aC13YWxlcydcblx0XHR9O1xuXHR9LFxuXHRzd2l0Y2hDb3VudHJ5OiBmdW5jdGlvbihuZXdDb3VudHJ5KSB7XG5cdFx0Y29uc29sZS5sb2coJ0NvdW50cnkgY2hhbmdlZCB0byAnICsgbmV3Q291bnRyeSk7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRjb3VudHJ5OiBuZXdDb3VudHJ5LFxuXHRcdFx0c2VsZWN0VmFsdWU6IG51bGxcblx0XHR9KTtcblx0fSxcblx0dXBkYXRlVmFsdWU6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG5cdFx0bG9nQ2hhbmdlKCdTdGF0ZSBjaGFuZ2VkIHRvICcgKyBuZXdWYWx1ZSk7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRzZWxlY3RWYWx1ZTogbmV3VmFsdWUgfHwgbnVsbFxuXHRcdH0pO1xuXHR9LFxuXHRmb2N1c1N0YXRlU2VsZWN0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnJlZnMuc3RhdGVTZWxlY3QuZm9jdXMoKTtcblx0fSxcblx0dG9nZ2xlRGlzYWJsZWQ6IGZ1bmN0aW9uKGUpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgZGlzYWJsZWQ6IGUudGFyZ2V0LmNoZWNrZWQgfSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wcyA9IFNUQVRFU1t0aGlzLnN0YXRlLmNvdW50cnldO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0PFNlbGVjdCByZWY9XCJzdGF0ZVNlbGVjdFwiIG9wdGlvbnM9e29wc30gZGlzYWJsZWQ9e3RoaXMuc3RhdGUuZGlzYWJsZWR9IHZhbHVlPXt0aGlzLnN0YXRlLnNlbGVjdFZhbHVlfSBvbkNoYW5nZT17dGhpcy51cGRhdGVWYWx1ZX0gc2VhcmNoYWJsZT17dGhpcy5wcm9wcy5zZWFyY2hhYmxlfSAvPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInN3aXRjaGVyXCI+XG5cdFx0XHRcdFx0Q291bnRyeTpcblx0XHRcdFx0XHQ8Q291bnRyeVNlbGVjdCB2YWx1ZT1cIkFVXCIgc2VsZWN0ZWQ9e3RoaXMuc3RhdGUuY291bnRyeX0gb25TZWxlY3Q9e3RoaXMuc3dpdGNoQ291bnRyeX0+QXVzdHJhbGlhPC9Db3VudHJ5U2VsZWN0PlxuXHRcdFx0XHRcdDxDb3VudHJ5U2VsZWN0IHZhbHVlPVwiVVNcIiBzZWxlY3RlZD17dGhpcy5zdGF0ZS5jb3VudHJ5fSBvblNlbGVjdD17dGhpcy5zd2l0Y2hDb3VudHJ5fT5VUzwvQ291bnRyeVNlbGVjdD5cblx0XHRcdFx0XHQmbmJzcDsgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5mb2N1c1N0YXRlU2VsZWN0fT5Gb2N1cyBTZWxlY3Q8L2J1dHRvbj5cblx0XHRcdFx0XHQmbmJzcDsgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3RoaXMuc3RhdGUuZGlzYWJsZWR9IGlkPXsnZGlzYWJsZS1zdGF0ZXMtJyArIHRoaXMuc3RhdGUuaWR9IG9uQ2hhbmdlPXt0aGlzLnRvZ2dsZURpc2FibGVkfS8+XG5cdFx0XHRcdFx0PGxhYmVsIGh0bWxGb3I9eydkaXNhYmxlLXN0YXRlcy0nICsgdGhpcy5zdGF0ZS5pZH0+RGlzYWJsZTwvbGFiZWw+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbnZhciBSZW1vdGVTZWxlY3RGaWVsZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bG9hZE9wdGlvbnM6IGZ1bmN0aW9uKGlucHV0LCBjYWxsYmFjaykge1xuXHRcdGlucHV0ID0gaW5wdXQudG9Mb3dlckNhc2UoKTtcblx0XHR2YXIgcnRuID0ge1xuXHRcdFx0b3B0aW9uczogW1xuXHRcdFx0XHR7IGxhYmVsOiAnT25lJywgdmFsdWU6ICdvbmUnIH0sXG5cdFx0XHRcdHsgbGFiZWw6ICdUd28nLCB2YWx1ZTogJ3R3bycgfSxcblx0XHRcdFx0eyBsYWJlbDogJ1RocmVlJywgdmFsdWU6ICd0aHJlZScgfVxuXHRcdFx0XSxcblx0XHRcdGNvbXBsZXRlOiB0cnVlXG5cdFx0fTtcblx0XHRpZiAoaW5wdXQuc2xpY2UoMCwgMSkgPT09ICdhJykge1xuXHRcdFx0aWYgKGlucHV0LnNsaWNlKDAsIDIpID09PSAnYWInKSB7XG5cdFx0XHRcdHJ0biA9IHtcblx0XHRcdFx0XHRvcHRpb25zOiBbXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnQUInLCB2YWx1ZTogJ2FiJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0FCQycsIHZhbHVlOiAnYWJjJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0FCQ0QnLCB2YWx1ZTogJ2FiY2QnIH1cblx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdGNvbXBsZXRlOiB0cnVlXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRydG4gPSB7XG5cdFx0XHRcdFx0b3B0aW9uczogW1xuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0EnLCB2YWx1ZTogJ2EnIH0sXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnQUEnLCB2YWx1ZTogJ2FhJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0FCJywgdmFsdWU6ICdhYicgfVxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0Y29tcGxldGU6IGZhbHNlXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghaW5wdXQubGVuZ3RoKSB7XG5cdFx0XHRydG4uY29tcGxldGUgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgcnRuKTtcblx0XHR9LCA1MDApO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0PFNlbGVjdCBhc3luY09wdGlvbnM9e3RoaXMubG9hZE9wdGlvbnN9IGNsYXNzTmFtZT1cInJlbW90ZS1leGFtcGxlXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5cbnZhciBNdWx0aVNlbGVjdEZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHR2YWx1ZTogW11cblx0XHR9O1xuXHR9LFxuXHRoYW5kbGVTZWxlY3RDaGFuZ2U6IGZ1bmN0aW9uKHZhbHVlLCB2YWx1ZXMpIHtcblx0XHRsb2dDaGFuZ2UoJ05ldyB2YWx1ZTonLCB2YWx1ZSwgJ1ZhbHVlczonLCB2YWx1ZXMpO1xuXHRcdHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogdmFsdWUgfSk7XG5cdH0sXG5cdHRvZ2dsZURpc2FibGVkOiBmdW5jdGlvbihlKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7ICdkaXNhYmxlZCc6IGUudGFyZ2V0LmNoZWNrZWQgfSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wcyA9IFtcblx0XHRcdHsgbGFiZWw6ICdDaG9jb2xhdGUnLCB2YWx1ZTogJ2Nob2NvbGF0ZScgfSxcblx0XHRcdHsgbGFiZWw6ICdWYW5pbGxhJywgdmFsdWU6ICd2YW5pbGxhJyB9LFxuXHRcdFx0eyBsYWJlbDogJ1N0cmF3YmVycnknLCB2YWx1ZTogJ3N0cmF3YmVycnknIH0sXG5cdFx0XHR7IGxhYmVsOiAnQ2FyYW1lbCcsIHZhbHVlOiAnY2FyYW1lbCcgfSxcblx0XHRcdHsgbGFiZWw6ICdDb29raWVzIGFuZCBDcmVhbScsIHZhbHVlOiAnY29va2llc2NyZWFtJyB9LFxuXHRcdFx0eyBsYWJlbDogJ1BlcHBlcm1pbnQnLCB2YWx1ZTogJ3BlcHBlcm1pbnQnIH1cblx0XHRdO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8c3Bhbj5cblx0XHRcdFx0PGRpdj5cblx0XHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0XHQ8U2VsZWN0IG11bHRpPXt0cnVlfSBkaXNhYmxlZD17dGhpcy5zdGF0ZS5kaXNhYmxlZH0gdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9IHBsYWNlaG9sZGVyPVwiU2VsZWN0IHlvdXIgZmF2b3VyaXRlKHMpXCIgb3B0aW9ucz17b3BzfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVTZWxlY3RDaGFuZ2V9IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2PlxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXt0aGlzLnN0YXRlLmRpc2FibGVkfSBpZD1cImRpc2FibGUtbXVsdGlzZWxlY3RcIiBvbkNoYW5nZT17dGhpcy50b2dnbGVEaXNhYmxlZH0vPlxuXHRcdFx0XHRcdDxsYWJlbCBodG1sRm9yPVwiZGlzYWJsZS1tdWx0aXNlbGVjdFwiPkRpc2FibGU8L2xhYmVsPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvc3Bhbj5cblx0XHQpO1xuXHR9XG59KTtcblxudmFyIFNlbGVjdGVkVmFsdWVzRmllbGQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG9uTGFiZWxDbGljazogZnVuY3Rpb24gKGRhdGEsIGV2ZW50KSB7XG5cdFx0Y29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHMgPSBbXG5cdFx0XHR7IGxhYmVsOiAnQ2hvY29sYXRlJywgdmFsdWU6ICdjaG9jb2xhdGUnIH0sXG5cdFx0XHR7IGxhYmVsOiAnVmFuaWxsYScsIHZhbHVlOiAndmFuaWxsYScgfSxcblx0XHRcdHsgbGFiZWw6ICdTdHJhd2JlcnJ5JywgdmFsdWU6ICdzdHJhd2JlcnJ5JyB9LFxuXHRcdFx0eyBsYWJlbDogJ0NhcmFtZWwnLCB2YWx1ZTogJ2NhcmFtZWwnIH0sXG5cdFx0XHR7IGxhYmVsOiAnQ29va2llcyBhbmQgQ3JlYW0nLCB2YWx1ZTogJ2Nvb2tpZXNjcmVhbScgfSxcblx0XHRcdHsgbGFiZWw6ICdQZXBwZXJtaW50JywgdmFsdWU6ICdwZXBwZXJtaW50JyB9XG5cdFx0XTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdj5cblx0XHRcdFx0PGxhYmVsPnt0aGlzLnByb3BzLmxhYmVsfTwvbGFiZWw+XG5cdFx0XHRcdDxTZWxlY3Rcblx0XHRcdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s9e3RoaXMub25MYWJlbENsaWNrfVxuXHRcdFx0XHRcdHZhbHVlPVwiY2hvY29sYXRlLHZhbmlsbGEsc3RyYXdiZXJyeVwiXG5cdFx0XHRcdFx0bXVsdGk9e3RydWV9XG5cdFx0XHRcdFx0cGxhY2Vob2xkZXI9XCJTZWxlY3QgeW91ciBmYXZvdXJpdGUocylcIlxuXHRcdFx0XHRcdG9wdGlvbnM9e29wc31cblx0XHRcdFx0XHRvbkNoYW5nZT17bG9nQ2hhbmdlfSAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cblxudmFyIFNlbGVjdGVkVmFsdWVzRmllbGREaXNhYmxlZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0b25MYWJlbENsaWNrOiBmdW5jdGlvbiAoZGF0YSwgZXZlbnQpIHtcblx0XHRjb25zb2xlLmxvZyhkYXRhLCBldmVudCk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wcyA9IFtcblx0XHRcdHsgbGFiZWw6ICdDaG9jb2xhdGUnLCB2YWx1ZTogJ2Nob2NvbGF0ZScgfSxcblx0XHRcdHsgbGFiZWw6ICdWYW5pbGxhJywgdmFsdWU6ICd2YW5pbGxhJyB9LFxuXHRcdFx0eyBsYWJlbDogJ1N0cmF3YmVycnknLCB2YWx1ZTogJ3N0cmF3YmVycnknIH0sXG5cdFx0XHR7IGxhYmVsOiAnQ2FyYW1lbCAoWW91IGRvblxcJ3QgbGlrZSBpdCwgYXBwYXJlbnRseSknLCB2YWx1ZTogJ2NhcmFtZWwnLCBkaXNhYmxlZDogdHJ1ZSB9LFxuXHRcdFx0eyBsYWJlbDogJ0Nvb2tpZXMgYW5kIENyZWFtJywgdmFsdWU6ICdjb29raWVzY3JlYW0nIH0sXG5cdFx0XHR7IGxhYmVsOiAnUGVwcGVybWludCcsIHZhbHVlOiAncGVwcGVybWludCcgfVxuXHRcdF07XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXY+XG5cdFx0XHRcdDxsYWJlbD57dGhpcy5wcm9wcy5sYWJlbH08L2xhYmVsPlxuXHRcdFx0XHQ8U2VsZWN0XG5cdFx0XHRcdFx0b25PcHRpb25MYWJlbENsaWNrPXt0aGlzLm9uTGFiZWxDbGlja31cblx0XHRcdFx0XHR2YWx1ZT1cImNob2NvbGF0ZSx2YW5pbGxhLHN0cmF3YmVycnlcIlxuXHRcdFx0XHRcdG11bHRpPXt0cnVlfVxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyPVwiU2VsZWN0IHlvdXIgZmF2b3VyaXRlKHMpXCJcblx0XHRcdFx0XHRvcHRpb25zPXtvcHN9XG5cdFx0XHRcdFx0b25DaGFuZ2U9e2xvZ0NoYW5nZX0gLz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG52YXIgU2VsZWN0ZWRWYWx1ZXNGaWVsZENyZWF0ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0b25MYWJlbENsaWNrOiBmdW5jdGlvbiAoZGF0YSwgZXZlbnQpIHtcblx0XHRjb25zb2xlLmxvZyhkYXRhLCBldmVudCk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wcyA9IFtcblx0XHRcdHsgbGFiZWw6ICdGaXJzdCBPcHRpb24nLCB2YWx1ZTogJ2ZpcnN0JyB9LFxuXHRcdFx0eyBsYWJlbDogJ1NlY29uZCBPcHRpb24nLCB2YWx1ZTogJ3NlY29uZCcgfSxcblx0XHRcdHsgbGFiZWw6ICdUaGlyZCBPcHRpb24nLCB2YWx1ZTogJ3RoaXJkJyB9XG5cdFx0XTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdj5cblx0XHRcdFx0PGxhYmVsPnt0aGlzLnByb3BzLmxhYmVsfTwvbGFiZWw+XG5cdFx0XHRcdDxTZWxlY3Rcblx0XHRcdFx0XHR2YWx1ZT1cImZpcnN0XCJcblx0XHRcdFx0XHRkZWxpbWl0ZXI9XCIsXCJcblx0XHRcdFx0XHRtdWx0aT17dHJ1ZX1cblx0XHRcdFx0XHRhbGxvd0NyZWF0ZT17dHJ1ZX1cblx0XHRcdFx0XHRwbGFjZWhvbGRlcj1cIlNlbGVjdCB5b3VyIGZhdm91cml0ZShzKVwiXG5cdFx0XHRcdFx0b3B0aW9ucz17b3BzfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXtsb2dDaGFuZ2V9IC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxudmFyIEN1c3RvbVJlbmRlckZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRvbkxhYmVsQ2xpY2s6IGZ1bmN0aW9uIChkYXRhLCBldmVudCkge1xuXHRcdGNvbnNvbGUubG9nKGRhdGEsIGV2ZW50KTtcblx0fSxcblx0cmVuZGVyT3B0aW9uOiBmdW5jdGlvbihvcHRpb24pIHtcblx0XHRyZXR1cm4gPHNwYW4gc3R5bGU9e3sgY29sb3I6IG9wdGlvbi5oZXggfX0+e29wdGlvbi5sYWJlbH0gKHtvcHRpb24uaGV4fSk8L3NwYW4+O1xuXG5cdH0sXG5cdHJlbmRlclZhbHVlOiBmdW5jdGlvbihvcHRpb24pIHtcblx0XHRyZXR1cm4gPHN0cm9uZyBzdHlsZT17eyBjb2xvcjogb3B0aW9uLmhleCB9fT57b3B0aW9uLmxhYmVsfTwvc3Ryb25nPjtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3BzID0gW1xuXHRcdFx0eyBsYWJlbDogJ1JlZCcsIHZhbHVlOiAncmVkJywgaGV4OiAnI0VDNjIzMCcgfSxcblx0XHRcdHsgbGFiZWw6ICdHcmVlbicsIHZhbHVlOiAnZ3JlZW4nLCBoZXg6ICcjNEVEODRFJyB9LFxuXHRcdFx0eyBsYWJlbDogJ0JsdWUnLCB2YWx1ZTogJ2JsdWUnLCBoZXg6ICcjNkQ5N0UyJyB9XG5cdFx0XTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdj5cblx0XHRcdFx0PGxhYmVsPnt0aGlzLnByb3BzLmxhYmVsfTwvbGFiZWw+XG5cdFx0XHRcdDxTZWxlY3Rcblx0XHRcdFx0XHRhbGxvd0NyZWF0ZT17dHJ1ZX1cblx0XHRcdFx0XHRwbGFjZWhvbGRlcj1cIlNlbGVjdCB5b3VyIGZhdm91cml0ZVwiXG5cdFx0XHRcdFx0b3B0aW9ucz17b3BzfVxuXHRcdFx0XHRcdG9wdGlvblJlbmRlcmVyPXt0aGlzLnJlbmRlck9wdGlvbn1cblx0XHRcdFx0XHR2YWx1ZVJlbmRlcmVyPXt0aGlzLnJlbmRlclZhbHVlfVxuXHRcdFx0XHRcdG9uQ2hhbmdlPXtsb2dDaGFuZ2V9IC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxudmFyIEN1c3RvbVJlbmRlck11bHRpRmllbGQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG9uTGFiZWxDbGljazogZnVuY3Rpb24gKGRhdGEsIGV2ZW50KSB7XG5cdFx0Y29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xuXHR9LFxuXHRyZW5kZXJPcHRpb246IGZ1bmN0aW9uKG9wdGlvbikge1xuXHRcdHJldHVybiA8c3BhbiBzdHlsZT17eyBjb2xvcjogb3B0aW9uLmhleCB9fT57b3B0aW9uLmxhYmVsfSAoe29wdGlvbi5oZXh9KTwvc3Bhbj47XG5cblx0fSxcblx0cmVuZGVyVmFsdWU6IGZ1bmN0aW9uKG9wdGlvbikge1xuXHRcdHJldHVybiA8c3Ryb25nIHN0eWxlPXt7IGNvbG9yOiBvcHRpb24uaGV4IH19PntvcHRpb24ubGFiZWx9PC9zdHJvbmc+O1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHMgPSBbXG5cdFx0XHR7IGxhYmVsOiAnUmVkJywgdmFsdWU6ICdyZWQnLCBoZXg6ICcjRUM2MjMwJyB9LFxuXHRcdFx0eyBsYWJlbDogJ0dyZWVuJywgdmFsdWU6ICdncmVlbicsIGhleDogJyM0RUQ4NEUnIH0sXG5cdFx0XHR7IGxhYmVsOiAnQmx1ZScsIHZhbHVlOiAnYmx1ZScsIGhleDogJyM2RDk3RTInIH1cblx0XHRdO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0PFNlbGVjdFxuXHRcdFx0XHRcdGRlbGltaXRlcj1cIixcIlxuXHRcdFx0XHRcdG11bHRpPXt0cnVlfVxuXHRcdFx0XHRcdGFsbG93Q3JlYXRlPXt0cnVlfVxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyPVwiU2VsZWN0IHlvdXIgZmF2b3VyaXRlKHMpXCJcblx0XHRcdFx0XHRvcHRpb25zPXtvcHN9XG5cdFx0XHRcdFx0b3B0aW9uUmVuZGVyZXI9e3RoaXMucmVuZGVyT3B0aW9ufVxuXHRcdFx0XHRcdHZhbHVlUmVuZGVyZXI9e3RoaXMucmVuZGVyVmFsdWV9XG5cdFx0XHRcdFx0b25DaGFuZ2U9e2xvZ0NoYW5nZX0gLz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG52YXIgSW1tdXRhYmxlRmllbGQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG9uTGFiZWxDbGljazogZnVuY3Rpb24gKGRhdGEsIGV2ZW50KSB7XG5cdFx0Y29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHMgPSBJbW11dGFibGUuZnJvbUpTKFtcblx0XHRcdHsgbGFiZWw6ICdGaXJzdCBPcHRpb24nLCB2YWx1ZTogJ2ZpcnN0JyB9LFxuXHRcdFx0eyBsYWJlbDogJ1NlY29uZCBPcHRpb24nLCB2YWx1ZTogJ3NlY29uZCcgfSxcblx0XHRcdHsgbGFiZWw6ICdUaGlyZCBPcHRpb24nLCB2YWx1ZTogJ3RoaXJkJyB9XG5cdFx0XSk7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXY+XG5cdFx0XHRcdDxsYWJlbD57dGhpcy5wcm9wcy5sYWJlbH08L2xhYmVsPlxuXHRcdFx0XHQ8U2VsZWN0XG5cdFx0XHRcdFx0ZGVsaW1pdGVyPVwiLFwiXG5cdFx0XHRcdFx0bXVsdGk9e3RoaXMucHJvcHMubXVsdGl9XG5cdFx0XHRcdFx0cGxhY2Vob2xkZXI9XCJTZWxlY3QgeW91ciBmYXZvdXJpdGUocylcIlxuXHRcdFx0XHRcdG9wdGlvbnM9e29wc31cblx0XHRcdFx0XHRvbkNoYW5nZT17bG9nQ2hhbmdlfSAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbnZhciBMYXp5RmllbGQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG9uTGFiZWxDbGljazogZnVuY3Rpb24gKGRhdGEsIGV2ZW50KSB7XG5cdFx0Y29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHMgPSBJbW11dGFibGUuUmFuZ2UoMSwgMTAwMCkubWFwKGkgPT4gKHsgbGFiZWw6IGkudG9TdHJpbmcoKSwgdmFsdWU6IGkgfSkpLnRvTGlzdCgpO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8bGFiZWw+e3RoaXMucHJvcHMubGFiZWx9PC9sYWJlbD5cblx0XHRcdFx0PFNlbGVjdFxuXHRcdFx0XHRcdGRlbGltaXRlcj1cIixcIlxuXHRcdFx0XHRcdG11bHRpPXt0aGlzLnByb3BzLm11bHRpfVxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyPVwiU2VsZWN0IHlvdXIgZmF2b3VyaXRlKHMpXCJcblx0XHRcdFx0XHRvcHRpb25zPXtvcHN9XG5cdFx0XHRcdFx0b25DaGFuZ2U9e2xvZ0NoYW5nZX1cblx0XHRcdFx0XHRsYXp5PXt0cnVlfSAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cblJlYWN0RE9NLnJlbmRlcihcblx0PGRpdj5cblx0XHQ8U3RhdGVzRmllbGQgLz5cblx0XHQ8U3RhdGVzRmllbGQgbGFiZWw9XCJTdGF0ZXMgKG5vbi1zZWFyY2hhYmxlKTpcIiBzZWFyY2hhYmxlPXtmYWxzZX0gLz5cblx0XHQ8VXNlcnNGaWVsZCAvPlxuXHRcdDxWYWx1ZXNBc051bWJlcnNGaWVsZCBsYWJlbD1cIlZhbHVlcyBhcyBudW1iZXJzXCIgLz5cblx0XHQ8TXVsdGlTZWxlY3RGaWVsZCBsYWJlbD1cIk11bHRpc2VsZWN0OlwiLz5cblx0XHQ8U2VsZWN0ZWRWYWx1ZXNGaWVsZCBsYWJlbD1cIkNsaWNrYWJsZSBsYWJlbHMgKGxhYmVscyBhcyBsaW5rcyk6XCIgLz5cblx0XHQ8U2VsZWN0ZWRWYWx1ZXNGaWVsZERpc2FibGVkIGxhYmVsPVwiRGlzYWJsZWQgb3B0aW9uOlwiIC8+XG5cdFx0PFNlbGVjdGVkVmFsdWVzRmllbGRDcmVhdGUgbGFiZWw9XCJPcHRpb24gQ3JlYXRpb24gKHRhZ3MgbW9kZSk6XCIgLz5cblx0XHQ8Q3VzdG9tUmVuZGVyRmllbGQgbGFiZWw9XCJDdXN0b20gcmVuZGVyaW5nIGZvciBvcHRpb25zIGFuZCB2YWx1ZXM6XCIgLz5cblx0XHQ8Q3VzdG9tUmVuZGVyTXVsdGlGaWVsZCBsYWJlbD1cIkN1c3RvbSByZW5kZXJpbmcgZm9yIG11bHRpcGxlIG9wdGlvbnMgYW5kIHZhbHVlczpcIiAvPlxuXHRcdDxSZW1vdGVTZWxlY3RGaWVsZCBsYWJlbD1cIlJlbW90ZSBPcHRpb25zOlwiLz5cblx0XHQ8SW1tdXRhYmxlRmllbGQgbGFiZWw9XCJJbW11dGFibGUgc2luZ2xlOlwiIG11bHRpPXtmYWxzZX0vPlxuXHRcdDxJbW11dGFibGVGaWVsZCBsYWJlbD1cIkltbXV0YWJsZSBtdWx0aTpcIiBtdWx0aT17dHJ1ZX0vPlxuXHRcdDxMYXp5RmllbGQgbGFiZWw9XCJMYXp5IHdpdGggSW1tdXRhYmxlIGRhdGFcIiAvPlxuXHQ8L2Rpdj4sXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleGFtcGxlJylcbik7XG4iLCJleHBvcnRzLkFVID0gW1xuXHR7IHZhbHVlOiAnYXVzdHJhbGlhbi1jYXBpdGFsLXRlcnJpdG9yeScsIGxhYmVsOiAnQXVzdHJhbGlhbiBDYXBpdGFsIFRlcnJpdG9yeScgfSxcblx0eyB2YWx1ZTogJ25ldy1zb3V0aC13YWxlcycsIGxhYmVsOiAnTmV3IFNvdXRoIFdhbGVzJyB9LFxuXHR7IHZhbHVlOiAndmljdG9yaWEnLCBsYWJlbDogJ1ZpY3RvcmlhJyB9LFxuXHR7IHZhbHVlOiAncXVlZW5zbGFuZCcsIGxhYmVsOiAnUXVlZW5zbGFuZCcgfSxcblx0eyB2YWx1ZTogJ3dlc3Rlcm4tYXVzdHJhbGlhJywgbGFiZWw6ICdXZXN0ZXJuIEF1c3RyYWxpYScgfSxcblx0eyB2YWx1ZTogJ3NvdXRoLWF1c3RyYWxpYScsIGxhYmVsOiAnU291dGggQXVzdHJhbGlhJyB9LFxuXHR7IHZhbHVlOiAndGFzbWFuaWEnLCBsYWJlbDogJ1Rhc21hbmlhJyB9LFxuXHR7IHZhbHVlOiAnbm9ydGhlcm4tdGVycml0b3J5JywgbGFiZWw6ICdOb3J0aGVybiBUZXJyaXRvcnknIH1cbl07XG5cbmV4cG9ydHMuVVMgPSBbXG4gICAgeyB2YWx1ZTogJ0FMJywgbGFiZWw6ICdBbGFiYW1hJywgZGlzYWJsZWQ6IHRydWUgfSxcbiAgICB7IHZhbHVlOiAnQUsnLCBsYWJlbDogJ0FsYXNrYScgfSxcbiAgICB7IHZhbHVlOiAnQVMnLCBsYWJlbDogJ0FtZXJpY2FuIFNhbW9hJyB9LFxuICAgIHsgdmFsdWU6ICdBWicsIGxhYmVsOiAnQXJpem9uYScgfSxcbiAgICB7IHZhbHVlOiAnQVInLCBsYWJlbDogJ0Fya2Fuc2FzJyB9LFxuICAgIHsgdmFsdWU6ICdDQScsIGxhYmVsOiAnQ2FsaWZvcm5pYScgfSxcbiAgICB7IHZhbHVlOiAnQ08nLCBsYWJlbDogJ0NvbG9yYWRvJyB9LFxuICAgIHsgdmFsdWU6ICdDVCcsIGxhYmVsOiAnQ29ubmVjdGljdXQnIH0sXG4gICAgeyB2YWx1ZTogJ0RFJywgbGFiZWw6ICdEZWxhd2FyZScgfSxcbiAgICB7IHZhbHVlOiAnREMnLCBsYWJlbDogJ0Rpc3RyaWN0IE9mIENvbHVtYmlhJyB9LFxuICAgIHsgdmFsdWU6ICdGTScsIGxhYmVsOiAnRmVkZXJhdGVkIFN0YXRlcyBPZiBNaWNyb25lc2lhJyB9LFxuICAgIHsgdmFsdWU6ICdGTCcsIGxhYmVsOiAnRmxvcmlkYScgfSxcbiAgICB7IHZhbHVlOiAnR0EnLCBsYWJlbDogJ0dlb3JnaWEnIH0sXG4gICAgeyB2YWx1ZTogJ0dVJywgbGFiZWw6ICdHdWFtJyB9LFxuICAgIHsgdmFsdWU6ICdISScsIGxhYmVsOiAnSGF3YWlpJyB9LFxuICAgIHsgdmFsdWU6ICdJRCcsIGxhYmVsOiAnSWRhaG8nIH0sXG4gICAgeyB2YWx1ZTogJ0lMJywgbGFiZWw6ICdJbGxpbm9pcycgfSxcbiAgICB7IHZhbHVlOiAnSU4nLCBsYWJlbDogJ0luZGlhbmEnIH0sXG4gICAgeyB2YWx1ZTogJ0lBJywgbGFiZWw6ICdJb3dhJyB9LFxuICAgIHsgdmFsdWU6ICdLUycsIGxhYmVsOiAnS2Fuc2FzJyB9LFxuICAgIHsgdmFsdWU6ICdLWScsIGxhYmVsOiAnS2VudHVja3knIH0sXG4gICAgeyB2YWx1ZTogJ0xBJywgbGFiZWw6ICdMb3Vpc2lhbmEnIH0sXG4gICAgeyB2YWx1ZTogJ01FJywgbGFiZWw6ICdNYWluZScgfSxcbiAgICB7IHZhbHVlOiAnTUgnLCBsYWJlbDogJ01hcnNoYWxsIElzbGFuZHMnIH0sXG4gICAgeyB2YWx1ZTogJ01EJywgbGFiZWw6ICdNYXJ5bGFuZCcgfSxcbiAgICB7IHZhbHVlOiAnTUEnLCBsYWJlbDogJ01hc3NhY2h1c2V0dHMnIH0sXG4gICAgeyB2YWx1ZTogJ01JJywgbGFiZWw6ICdNaWNoaWdhbicgfSxcbiAgICB7IHZhbHVlOiAnTU4nLCBsYWJlbDogJ01pbm5lc290YScgfSxcbiAgICB7IHZhbHVlOiAnTVMnLCBsYWJlbDogJ01pc3Npc3NpcHBpJyB9LFxuICAgIHsgdmFsdWU6ICdNTycsIGxhYmVsOiAnTWlzc291cmknIH0sXG4gICAgeyB2YWx1ZTogJ01UJywgbGFiZWw6ICdNb250YW5hJyB9LFxuICAgIHsgdmFsdWU6ICdORScsIGxhYmVsOiAnTmVicmFza2EnIH0sXG4gICAgeyB2YWx1ZTogJ05WJywgbGFiZWw6ICdOZXZhZGEnIH0sXG4gICAgeyB2YWx1ZTogJ05IJywgbGFiZWw6ICdOZXcgSGFtcHNoaXJlJyB9LFxuICAgIHsgdmFsdWU6ICdOSicsIGxhYmVsOiAnTmV3IEplcnNleScgfSxcbiAgICB7IHZhbHVlOiAnTk0nLCBsYWJlbDogJ05ldyBNZXhpY28nIH0sXG4gICAgeyB2YWx1ZTogJ05ZJywgbGFiZWw6ICdOZXcgWW9yaycgfSxcbiAgICB7IHZhbHVlOiAnTkMnLCBsYWJlbDogJ05vcnRoIENhcm9saW5hJyB9LFxuICAgIHsgdmFsdWU6ICdORCcsIGxhYmVsOiAnTm9ydGggRGFrb3RhJyB9LFxuICAgIHsgdmFsdWU6ICdNUCcsIGxhYmVsOiAnTm9ydGhlcm4gTWFyaWFuYSBJc2xhbmRzJyB9LFxuICAgIHsgdmFsdWU6ICdPSCcsIGxhYmVsOiAnT2hpbycgfSxcbiAgICB7IHZhbHVlOiAnT0snLCBsYWJlbDogJ09rbGFob21hJyB9LFxuICAgIHsgdmFsdWU6ICdPUicsIGxhYmVsOiAnT3JlZ29uJyB9LFxuICAgIHsgdmFsdWU6ICdQVycsIGxhYmVsOiAnUGFsYXUnIH0sXG4gICAgeyB2YWx1ZTogJ1BBJywgbGFiZWw6ICdQZW5uc3lsdmFuaWEnIH0sXG4gICAgeyB2YWx1ZTogJ1BSJywgbGFiZWw6ICdQdWVydG8gUmljbycgfSxcbiAgICB7IHZhbHVlOiAnUkknLCBsYWJlbDogJ1Job2RlIElzbGFuZCcgfSxcbiAgICB7IHZhbHVlOiAnU0MnLCBsYWJlbDogJ1NvdXRoIENhcm9saW5hJyB9LFxuICAgIHsgdmFsdWU6ICdTRCcsIGxhYmVsOiAnU291dGggRGFrb3RhJyB9LFxuICAgIHsgdmFsdWU6ICdUTicsIGxhYmVsOiAnVGVubmVzc2VlJyB9LFxuICAgIHsgdmFsdWU6ICdUWCcsIGxhYmVsOiAnVGV4YXMnIH0sXG4gICAgeyB2YWx1ZTogJ1VUJywgbGFiZWw6ICdVdGFoJyB9LFxuICAgIHsgdmFsdWU6ICdWVCcsIGxhYmVsOiAnVmVybW9udCcgfSxcbiAgICB7IHZhbHVlOiAnVkknLCBsYWJlbDogJ1ZpcmdpbiBJc2xhbmRzJyB9LFxuICAgIHsgdmFsdWU6ICdWQScsIGxhYmVsOiAnVmlyZ2luaWEnIH0sXG4gICAgeyB2YWx1ZTogJ1dBJywgbGFiZWw6ICdXYXNoaW5ndG9uJyB9LFxuICAgIHsgdmFsdWU6ICdXVicsIGxhYmVsOiAnV2VzdCBWaXJnaW5pYScgfSxcbiAgICB7IHZhbHVlOiAnV0knLCBsYWJlbDogJ1dpc2NvbnNpbicgfSxcbiAgICB7IHZhbHVlOiAnV1knLCBsYWJlbDogJ1d5b21pbmcnIH1cbl07XG4iLCJleHBvcnRzLnVzZXJzID0gW1xuICAgIHsgdmFsdWU6ICdKb2huIFNtaXRoJywgbGFiZWw6ICdKb2huIFNtaXRoJywgZW1haWw6ICdqb2huQHNtaXRoLmNvbScgfSxcbiAgICB7IHZhbHVlOiAnTWVycnkgSmFuZScsIGxhYmVsOiAnTWVycnkgSmFuZScsIGVtYWlsOiAnbWVycnlAamFuZS5jb20nIH0sXG4gICAgeyB2YWx1ZTogJ1N0YW4gSG9wZXInLCBsYWJlbDogJ1N0YW4gSG9wZXInLCBlbWFpbDogJ3N0YW5AaG9wZXIuY29tJyB9XG5dO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuMTAuMFxudmFyIFJlYWN0LCBpc1JldGluYSwgbWQ1LCBxdWVyeXN0cmluZztcblxuUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tZDUgPSByZXF1aXJlKCdtZDUnKTtcblxucXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xuXG5pc1JldGluYSA9IHJlcXVpcmUoJ2lzLXJldGluYScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdHcmF2YXRhcicsXG4gIHByb3BUeXBlczoge1xuICAgIGVtYWlsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIG1kNTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBzaXplOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHJhdGluZzogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBodHRwczogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgXCJkZWZhdWx0XCI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgY2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNpemU6IDUwLFxuICAgICAgcmF0aW5nOiAnZycsXG4gICAgICBodHRwczogZmFsc2UsXG4gICAgICBcImRlZmF1bHRcIjogXCJyZXRyb1wiXG4gICAgfTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYmFzZSwgaGFzaCwgbW9kZXJuQnJvd3NlciwgcXVlcnksIHJldGluYVF1ZXJ5LCByZXRpbmFTcmMsIHNyYztcbiAgICBiYXNlID0gdGhpcy5wcm9wcy5odHRwcyA/IFwiaHR0cHM6Ly9zZWN1cmUuZ3JhdmF0YXIuY29tL2F2YXRhci9cIiA6ICdodHRwOi8vd3d3LmdyYXZhdGFyLmNvbS9hdmF0YXIvJztcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICBzOiB0aGlzLnByb3BzLnNpemUsXG4gICAgICByOiB0aGlzLnByb3BzLnJhdGluZyxcbiAgICAgIGQ6IHRoaXMucHJvcHNbXCJkZWZhdWx0XCJdXG4gICAgfSk7XG4gICAgcmV0aW5hUXVlcnkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkoe1xuICAgICAgczogdGhpcy5wcm9wcy5zaXplICogMixcbiAgICAgIHI6IHRoaXMucHJvcHMucmF0aW5nLFxuICAgICAgZDogdGhpcy5wcm9wc1tcImRlZmF1bHRcIl1cbiAgICB9KTtcbiAgICBpZiAodGhpcy5wcm9wcy5tZDUpIHtcbiAgICAgIGhhc2ggPSB0aGlzLnByb3BzLm1kNTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZW1haWwpIHtcbiAgICAgIGhhc2ggPSBtZDUodGhpcy5wcm9wcy5lbWFpbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignR3JhdmF0YXIgaW1hZ2UgY2FuIG5vdCBiZSBmZXRjaGVkLiBFaXRoZXIgdGhlIFwiZW1haWxcIiBvciBcIm1kNVwiIHByb3AgbXVzdCBiZSBzcGVjaWZpZWQuJyk7XG4gICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiLCBudWxsKTtcbiAgICB9XG4gICAgc3JjID0gYmFzZSArIGhhc2ggKyBcIj9cIiArIHF1ZXJ5O1xuICAgIHJldGluYVNyYyA9IGJhc2UgKyBoYXNoICsgXCI/XCIgKyByZXRpbmFRdWVyeTtcbiAgICBtb2Rlcm5Ccm93c2VyID0gdHJ1ZTtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cgIT09IG51bGwpIHtcbiAgICAgIG1vZGVybkJyb3dzZXIgPSAnc3Jjc2V0JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICB9XG4gICAgaWYgKCFtb2Rlcm5Ccm93c2VyICYmIGlzUmV0aW5hKCkpIHtcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIFJlYWN0Ll9fc3ByZWFkKHtcbiAgICAgICAgXCJzdHlsZVwiOiB0aGlzLnByb3BzLnN0eWxlLFxuICAgICAgICBcImNsYXNzTmFtZVwiOiBcInJlYWN0LWdyYXZhdGFyIFwiICsgdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgIFwic3JjXCI6IHJldGluYVNyYyxcbiAgICAgICAgXCJoZWlnaHRcIjogdGhpcy5wcm9wcy5zaXplLFxuICAgICAgICBcIndpZHRoXCI6IHRoaXMucHJvcHMuc2l6ZVxuICAgICAgfSwgdGhpcy5wcm9wcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImltZ1wiLCBSZWFjdC5fX3NwcmVhZCh7XG4gICAgICAgIFwic3R5bGVcIjogdGhpcy5wcm9wcy5zdHlsZSxcbiAgICAgICAgXCJjbGFzc05hbWVcIjogXCJyZWFjdC1ncmF2YXRhciBcIiArIHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICBcInNyY1wiOiBzcmMsXG4gICAgICAgIFwic3JjU2V0XCI6IHJldGluYVNyYyArIFwiIDJ4XCIsXG4gICAgICAgIFwiaGVpZ2h0XCI6IHRoaXMucHJvcHMuc2l6ZSxcbiAgICAgICAgXCJ3aWR0aFwiOiB0aGlzLnByb3BzLnNpemVcbiAgICAgIH0sIHRoaXMucHJvcHMpKTtcbiAgICB9XG4gIH1cbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1lZGlhUXVlcnk7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdyAhPT0gbnVsbCkge1xuICAgIG1lZGlhUXVlcnkgPSBcIigtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuMjUpLCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjI1KSwgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDUvNCksIChtaW4tcmVzb2x1dGlvbjogMS4yNWRwcHgpXCI7XG4gICAgaWYgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID4gMS4yNSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYSAmJiB3aW5kb3cubWF0Y2hNZWRpYShtZWRpYVF1ZXJ5KS5tYXRjaGVzKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIihmdW5jdGlvbigpe1xyXG4gIHZhciBjcnlwdCA9IHJlcXVpcmUoJ2NyeXB0JyksXHJcbiAgICAgIHV0ZjggPSByZXF1aXJlKCdjaGFyZW5jJykudXRmOCxcclxuICAgICAgaXNCdWZmZXIgPSByZXF1aXJlKCdpcy1idWZmZXInKSxcclxuICAgICAgYmluID0gcmVxdWlyZSgnY2hhcmVuYycpLmJpbixcclxuXHJcbiAgLy8gVGhlIGNvcmVcclxuICBtZDUgPSBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xyXG4gICAgLy8gQ29udmVydCB0byBieXRlIGFycmF5XHJcbiAgICBpZiAobWVzc2FnZS5jb25zdHJ1Y3RvciA9PSBTdHJpbmcpXHJcbiAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZW5jb2RpbmcgPT09ICdiaW5hcnknKVxyXG4gICAgICAgIG1lc3NhZ2UgPSBiaW4uc3RyaW5nVG9CeXRlcyhtZXNzYWdlKTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG1lc3NhZ2UgPSB1dGY4LnN0cmluZ1RvQnl0ZXMobWVzc2FnZSk7XHJcbiAgICBlbHNlIGlmIChpc0J1ZmZlcihtZXNzYWdlKSlcclxuICAgICAgbWVzc2FnZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG1lc3NhZ2UsIDApO1xyXG4gICAgZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkobWVzc2FnZSkpXHJcbiAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnRvU3RyaW5nKCk7XHJcbiAgICAvLyBlbHNlLCBhc3N1bWUgYnl0ZSBhcnJheSBhbHJlYWR5XHJcblxyXG4gICAgdmFyIG0gPSBjcnlwdC5ieXRlc1RvV29yZHMobWVzc2FnZSksXHJcbiAgICAgICAgbCA9IG1lc3NhZ2UubGVuZ3RoICogOCxcclxuICAgICAgICBhID0gIDE3MzI1ODQxOTMsXHJcbiAgICAgICAgYiA9IC0yNzE3MzM4NzksXHJcbiAgICAgICAgYyA9IC0xNzMyNTg0MTk0LFxyXG4gICAgICAgIGQgPSAgMjcxNzMzODc4O1xyXG5cclxuICAgIC8vIFN3YXAgZW5kaWFuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbVtpXSA9ICgobVtpXSA8PCAgOCkgfCAobVtpXSA+Pj4gMjQpKSAmIDB4MDBGRjAwRkYgfFxyXG4gICAgICAgICAgICAgKChtW2ldIDw8IDI0KSB8IChtW2ldID4+PiAgOCkpICYgMHhGRjAwRkYwMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYWRkaW5nXHJcbiAgICBtW2wgPj4+IDVdIHw9IDB4ODAgPDwgKGwgJSAzMik7XHJcbiAgICBtWygoKGwgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTRdID0gbDtcclxuXHJcbiAgICAvLyBNZXRob2Qgc2hvcnRjdXRzXHJcbiAgICB2YXIgRkYgPSBtZDUuX2ZmLFxyXG4gICAgICAgIEdHID0gbWQ1Ll9nZyxcclxuICAgICAgICBISCA9IG1kNS5faGgsXHJcbiAgICAgICAgSUkgPSBtZDUuX2lpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkgKz0gMTYpIHtcclxuXHJcbiAgICAgIHZhciBhYSA9IGEsXHJcbiAgICAgICAgICBiYiA9IGIsXHJcbiAgICAgICAgICBjYyA9IGMsXHJcbiAgICAgICAgICBkZCA9IGQ7XHJcblxyXG4gICAgICBhID0gRkYoYSwgYiwgYywgZCwgbVtpKyAwXSwgIDcsIC02ODA4NzY5MzYpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKyAxXSwgMTIsIC0zODk1NjQ1ODYpO1xyXG4gICAgICBjID0gRkYoYywgZCwgYSwgYiwgbVtpKyAyXSwgMTcsICA2MDYxMDU4MTkpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKyAzXSwgMjIsIC0xMDQ0NTI1MzMwKTtcclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsgNF0sICA3LCAtMTc2NDE4ODk3KTtcclxuICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIG1baSsgNV0sIDEyLCAgMTIwMDA4MDQyNik7XHJcbiAgICAgIGMgPSBGRihjLCBkLCBhLCBiLCBtW2krIDZdLCAxNywgLTE0NzMyMzEzNDEpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKyA3XSwgMjIsIC00NTcwNTk4Myk7XHJcbiAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBtW2krIDhdLCAgNywgIDE3NzAwMzU0MTYpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKyA5XSwgMTIsIC0xOTU4NDE0NDE3KTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsxMF0sIDE3LCAtNDIwNjMpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKzExXSwgMjIsIC0xOTkwNDA0MTYyKTtcclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsxMl0sICA3LCAgMTgwNDYwMzY4Mik7XHJcbiAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBtW2krMTNdLCAxMiwgLTQwMzQxMTAxKTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsxNF0sIDE3LCAtMTUwMjAwMjI5MCk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krMTVdLCAyMiwgIDEyMzY1MzUzMjkpO1xyXG5cclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsgMV0sICA1LCAtMTY1Nzk2NTEwKTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsgNl0sICA5LCAtMTA2OTUwMTYzMik7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krMTFdLCAxNCwgIDY0MzcxNzcxMyk7XHJcbiAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBtW2krIDBdLCAyMCwgLTM3Mzg5NzMwMik7XHJcbiAgICAgIGEgPSBHRyhhLCBiLCBjLCBkLCBtW2krIDVdLCAgNSwgLTcwMTU1ODY5MSk7XHJcbiAgICAgIGQgPSBHRyhkLCBhLCBiLCBjLCBtW2krMTBdLCAgOSwgIDM4MDE2MDgzKTtcclxuICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIG1baSsxNV0sIDE0LCAtNjYwNDc4MzM1KTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsgNF0sIDIwLCAtNDA1NTM3ODQ4KTtcclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsgOV0sICA1LCAgNTY4NDQ2NDM4KTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsxNF0sICA5LCAtMTAxOTgwMzY5MCk7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krIDNdLCAxNCwgLTE4NzM2Mzk2MSk7XHJcbiAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBtW2krIDhdLCAyMCwgIDExNjM1MzE1MDEpO1xyXG4gICAgICBhID0gR0coYSwgYiwgYywgZCwgbVtpKzEzXSwgIDUsIC0xNDQ0NjgxNDY3KTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsgMl0sICA5LCAtNTE0MDM3ODQpO1xyXG4gICAgICBjID0gR0coYywgZCwgYSwgYiwgbVtpKyA3XSwgMTQsICAxNzM1MzI4NDczKTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsxMl0sIDIwLCAtMTkyNjYwNzczNCk7XHJcblxyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKyA1XSwgIDQsIC0zNzg1NTgpO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKyA4XSwgMTEsIC0yMDIyNTc0NDYzKTtcclxuICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIG1baSsxMV0sIDE2LCAgMTgzOTAzMDU2Mik7XHJcbiAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBtW2krMTRdLCAyMywgLTM1MzA5NTU2KTtcclxuICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIG1baSsgMV0sICA0LCAtMTUzMDk5MjA2MCk7XHJcbiAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBtW2krIDRdLCAxMSwgIDEyNzI4OTMzNTMpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKyA3XSwgMTYsIC0xNTU0OTc2MzIpO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKzEwXSwgMjMsIC0xMDk0NzMwNjQwKTtcclxuICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIG1baSsxM10sICA0LCAgNjgxMjc5MTc0KTtcclxuICAgICAgZCA9IEhIKGQsIGEsIGIsIGMsIG1baSsgMF0sIDExLCAtMzU4NTM3MjIyKTtcclxuICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIG1baSsgM10sIDE2LCAtNzIyNTIxOTc5KTtcclxuICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIG1baSsgNl0sIDIzLCAgNzYwMjkxODkpO1xyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKyA5XSwgIDQsIC02NDAzNjQ0ODcpO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKzEyXSwgMTEsIC00MjE4MTU4MzUpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKzE1XSwgMTYsICA1MzA3NDI1MjApO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKyAyXSwgMjMsIC05OTUzMzg2NTEpO1xyXG5cclxuICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIG1baSsgMF0sICA2LCAtMTk4NjMwODQ0KTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsgN10sIDEwLCAgMTEyNjg5MTQxNSk7XHJcbiAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBtW2krMTRdLCAxNSwgLTE0MTYzNTQ5MDUpO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKyA1XSwgMjEsIC01NzQzNDA1NSk7XHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krMTJdLCAgNiwgIDE3MDA0ODU1NzEpO1xyXG4gICAgICBkID0gSUkoZCwgYSwgYiwgYywgbVtpKyAzXSwgMTAsIC0xODk0OTg2NjA2KTtcclxuICAgICAgYyA9IElJKGMsIGQsIGEsIGIsIG1baSsxMF0sIDE1LCAtMTA1MTUyMyk7XHJcbiAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBtW2krIDFdLCAyMSwgLTIwNTQ5MjI3OTkpO1xyXG4gICAgICBhID0gSUkoYSwgYiwgYywgZCwgbVtpKyA4XSwgIDYsICAxODczMzEzMzU5KTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsxNV0sIDEwLCAtMzA2MTE3NDQpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKyA2XSwgMTUsIC0xNTYwMTk4MzgwKTtcclxuICAgICAgYiA9IElJKGIsIGMsIGQsIGEsIG1baSsxM10sIDIxLCAgMTMwOTE1MTY0OSk7XHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krIDRdLCAgNiwgLTE0NTUyMzA3MCk7XHJcbiAgICAgIGQgPSBJSShkLCBhLCBiLCBjLCBtW2krMTFdLCAxMCwgLTExMjAyMTAzNzkpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKyAyXSwgMTUsICA3MTg3ODcyNTkpO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKyA5XSwgMjEsIC0zNDM0ODU1NTEpO1xyXG5cclxuICAgICAgYSA9IChhICsgYWEpID4+PiAwO1xyXG4gICAgICBiID0gKGIgKyBiYikgPj4+IDA7XHJcbiAgICAgIGMgPSAoYyArIGNjKSA+Pj4gMDtcclxuICAgICAgZCA9IChkICsgZGQpID4+PiAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjcnlwdC5lbmRpYW4oW2EsIGIsIGMsIGRdKTtcclxuICB9O1xyXG5cclxuICAvLyBBdXhpbGlhcnkgZnVuY3Rpb25zXHJcbiAgbWQ1Ll9mZiAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgJiBjIHwgfmIgJiBkKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcbiAgbWQ1Ll9nZyAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgJiBkIHwgYyAmIH5kKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcbiAgbWQ1Ll9oaCAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgXiBjIF4gZCkgKyAoeCA+Pj4gMCkgKyB0O1xyXG4gICAgcmV0dXJuICgobiA8PCBzKSB8IChuID4+PiAoMzIgLSBzKSkpICsgYjtcclxuICB9O1xyXG4gIG1kNS5faWkgID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcclxuICAgIHZhciBuID0gYSArIChjIF4gKGIgfCB+ZCkpICsgKHggPj4+IDApICsgdDtcclxuICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XHJcbiAgfTtcclxuXHJcbiAgLy8gUGFja2FnZSBwcml2YXRlIGJsb2Nrc2l6ZVxyXG4gIG1kNS5fYmxvY2tzaXplID0gMTY7XHJcbiAgbWQ1Ll9kaWdlc3RzaXplID0gMTY7XHJcblxyXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcclxuICAgIGlmKHR5cGVvZiBtZXNzYWdlID09ICd1bmRlZmluZWQnKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgdmFyIGRpZ2VzdGJ5dGVzID0gY3J5cHQud29yZHNUb0J5dGVzKG1kNShtZXNzYWdlLCBvcHRpb25zKSk7XHJcbiAgICByZXR1cm4gb3B0aW9ucyAmJiBvcHRpb25zLmFzQnl0ZXMgPyBkaWdlc3RieXRlcyA6XHJcbiAgICAgICAgb3B0aW9ucyAmJiBvcHRpb25zLmFzU3RyaW5nID8gYmluLmJ5dGVzVG9TdHJpbmcoZGlnZXN0Ynl0ZXMpIDpcclxuICAgICAgICBjcnlwdC5ieXRlc1RvSGV4KGRpZ2VzdGJ5dGVzKTtcclxuICB9O1xyXG5cclxufSkoKTtcclxuIiwidmFyIGNoYXJlbmMgPSB7XG4gIC8vIFVURi04IGVuY29kaW5nXG4gIHV0Zjg6IHtcbiAgICAvLyBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIHN0cmluZ1RvQnl0ZXM6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgcmV0dXJuIGNoYXJlbmMuYmluLnN0cmluZ1RvQnl0ZXModW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBzdHJpbmdcbiAgICBieXRlc1RvU3RyaW5nOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoY2hhcmVuYy5iaW4uYnl0ZXNUb1N0cmluZyhieXRlcykpKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQmluYXJ5IGVuY29kaW5nXG4gIGJpbjoge1xuICAgIC8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgc3RyaW5nVG9CeXRlczogZnVuY3Rpb24oc3RyKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKylcbiAgICAgICAgYnl0ZXMucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIHN0cmluZ1xuICAgIGJ5dGVzVG9TdHJpbmc6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciBzdHIgPSBbXSwgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgc3RyLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSkpO1xuICAgICAgcmV0dXJuIHN0ci5qb2luKCcnKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2hhcmVuYztcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIGJhc2U2NG1hcFxuICAgICAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLycsXG5cbiAgY3J5cHQgPSB7XG4gICAgLy8gQml0LXdpc2Ugcm90YXRpb24gbGVmdFxuICAgIHJvdGw6IGZ1bmN0aW9uKG4sIGIpIHtcbiAgICAgIHJldHVybiAobiA8PCBiKSB8IChuID4+PiAoMzIgLSBiKSk7XG4gICAgfSxcblxuICAgIC8vIEJpdC13aXNlIHJvdGF0aW9uIHJpZ2h0XG4gICAgcm90cjogZnVuY3Rpb24obiwgYikge1xuICAgICAgcmV0dXJuIChuIDw8ICgzMiAtIGIpKSB8IChuID4+PiBiKTtcbiAgICB9LFxuXG4gICAgLy8gU3dhcCBiaWctZW5kaWFuIHRvIGxpdHRsZS1lbmRpYW4gYW5kIHZpY2UgdmVyc2FcbiAgICBlbmRpYW46IGZ1bmN0aW9uKG4pIHtcbiAgICAgIC8vIElmIG51bWJlciBnaXZlbiwgc3dhcCBlbmRpYW5cbiAgICAgIGlmIChuLmNvbnN0cnVjdG9yID09IE51bWJlcikge1xuICAgICAgICByZXR1cm4gY3J5cHQucm90bChuLCA4KSAmIDB4MDBGRjAwRkYgfCBjcnlwdC5yb3RsKG4sIDI0KSAmIDB4RkYwMEZGMDA7XG4gICAgICB9XG5cbiAgICAgIC8vIEVsc2UsIGFzc3VtZSBhcnJheSBhbmQgc3dhcCBhbGwgaXRlbXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbi5sZW5ndGg7IGkrKylcbiAgICAgICAgbltpXSA9IGNyeXB0LmVuZGlhbihuW2ldKTtcbiAgICAgIHJldHVybiBuO1xuICAgIH0sXG5cbiAgICAvLyBHZW5lcmF0ZSBhbiBhcnJheSBvZiBhbnkgbGVuZ3RoIG9mIHJhbmRvbSBieXRlc1xuICAgIHJhbmRvbUJ5dGVzOiBmdW5jdGlvbihuKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdOyBuID4gMDsgbi0tKVxuICAgICAgICBieXRlcy5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NikpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBiaWctZW5kaWFuIDMyLWJpdCB3b3Jkc1xuICAgIGJ5dGVzVG9Xb3JkczogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIHdvcmRzID0gW10sIGkgPSAwLCBiID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrLCBiICs9IDgpXG4gICAgICAgIHdvcmRzW2IgPj4+IDVdIHw9IGJ5dGVzW2ldIDw8ICgyNCAtIGIgJSAzMik7XG4gICAgICByZXR1cm4gd29yZHM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYmlnLWVuZGlhbiAzMi1iaXQgd29yZHMgdG8gYSBieXRlIGFycmF5XG4gICAgd29yZHNUb0J5dGVzOiBmdW5jdGlvbih3b3Jkcykge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgYiA9IDA7IGIgPCB3b3Jkcy5sZW5ndGggKiAzMjsgYiArPSA4KVxuICAgICAgICBieXRlcy5wdXNoKCh3b3Jkc1tiID4+PiA1XSA+Pj4gKDI0IC0gYiAlIDMyKSkgJiAweEZGKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBoZXggc3RyaW5nXG4gICAgYnl0ZXNUb0hleDogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIGhleCA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhleC5wdXNoKChieXRlc1tpXSA+Pj4gNCkudG9TdHJpbmcoMTYpKTtcbiAgICAgICAgaGV4LnB1c2goKGJ5dGVzW2ldICYgMHhGKS50b1N0cmluZygxNikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhleC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGhleCBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgaGV4VG9CeXRlczogZnVuY3Rpb24oaGV4KSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBjID0gMDsgYyA8IGhleC5sZW5ndGg7IGMgKz0gMilcbiAgICAgICAgYnl0ZXMucHVzaChwYXJzZUludChoZXguc3Vic3RyKGMsIDIpLCAxNikpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIGJhc2UtNjQgc3RyaW5nXG4gICAgYnl0ZXNUb0Jhc2U2NDogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIGJhc2U2NCA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIHZhciB0cmlwbGV0ID0gKGJ5dGVzW2ldIDw8IDE2KSB8IChieXRlc1tpICsgMV0gPDwgOCkgfCBieXRlc1tpICsgMl07XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgNDsgaisrKVxuICAgICAgICAgIGlmIChpICogOCArIGogKiA2IDw9IGJ5dGVzLmxlbmd0aCAqIDgpXG4gICAgICAgICAgICBiYXNlNjQucHVzaChiYXNlNjRtYXAuY2hhckF0KCh0cmlwbGV0ID4+PiA2ICogKDMgLSBqKSkgJiAweDNGKSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYmFzZTY0LnB1c2goJz0nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlNjQuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBiYXNlLTY0IHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBiYXNlNjRUb0J5dGVzOiBmdW5jdGlvbihiYXNlNjQpIHtcbiAgICAgIC8vIFJlbW92ZSBub24tYmFzZS02NCBjaGFyYWN0ZXJzXG4gICAgICBiYXNlNjQgPSBiYXNlNjQucmVwbGFjZSgvW15BLVowLTkrXFwvXS9pZywgJycpO1xuXG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBpID0gMCwgaW1vZDQgPSAwOyBpIDwgYmFzZTY0Lmxlbmd0aDtcbiAgICAgICAgICBpbW9kNCA9ICsraSAlIDQpIHtcbiAgICAgICAgaWYgKGltb2Q0ID09IDApIGNvbnRpbnVlO1xuICAgICAgICBieXRlcy5wdXNoKCgoYmFzZTY0bWFwLmluZGV4T2YoYmFzZTY0LmNoYXJBdChpIC0gMSkpXG4gICAgICAgICAgICAmIChNYXRoLnBvdygyLCAtMiAqIGltb2Q0ICsgOCkgLSAxKSkgPDwgKGltb2Q0ICogMikpXG4gICAgICAgICAgICB8IChiYXNlNjRtYXAuaW5kZXhPZihiYXNlNjQuY2hhckF0KGkpKSA+Pj4gKDYgLSBpbW9kNCAqIDIpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gY3J5cHQ7XG59KSgpO1xuIiwiLyoqXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIEJ1ZmZlclxuICpcbiAqIEF1dGhvcjogICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogTGljZW5zZTogIE1JVFxuICpcbiAqIGBucG0gaW5zdGFsbCBpcy1idWZmZXJgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiAhIShvYmogIT0gbnVsbCAmJlxuICAgIChvYmouX2lzQnVmZmVyIHx8IC8vIEZvciBTYWZhcmkgNS03IChtaXNzaW5nIE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IpXG4gICAgICAob2JqLmNvbnN0cnVjdG9yICYmXG4gICAgICB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmXG4gICAgICBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIob2JqKSlcbiAgICApKVxufVxuIl19
