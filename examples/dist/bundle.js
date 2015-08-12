require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = getSize

function getSize(element) {
  // Handle cases where the element is not already
  // attached to the DOM by briefly appending it
  // to document.body, and removing it again later.
  if (element === window || element === document.body) {
    return [window.innerWidth, window.innerHeight]
  }

  if (!element.parentNode) {
    var temporary = true
    document.body.appendChild(element)
  }

  var bounds = element.getBoundingClientRect()
  var styles = getComputedStyle(element)
  var height = (bounds.height|0)
    + parse(styles.getPropertyValue('margin-top'))
    + parse(styles.getPropertyValue('margin-bottom'))
  var width  = (bounds.width|0)
    + parse(styles.getPropertyValue('margin-left'))
    + parse(styles.getPropertyValue('margin-right'))

  if (temporary) {
    document.body.removeChild(element)
  }

  return [width, height]
}

function parse(prop) {
  return parseFloat(prop) || 0
}

},{}],2:[function(require,module,exports){
"use strict";

// from
// https://raw.githubusercontent.com/onefinestay/react-lazy-render/master/src/LazyRender.jsx
// Modificações para aceitar lazy immutable seq.

var React = require('react');
var Immutable = require('immutable');
var elementSize = require("element-size");

function count(children) {
  return children.count ? children.count() : children.length;
}

var LazyRender = React.createClass({
  displayName: 'LazyRender',

  propTypes: {
    children: React.PropTypes.instanceOf(Immutable.Iterable),
    maxHeight: React.PropTypes.number.isRequired,

    className: React.PropTypes.string,
    itemPadding: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      itemPadding: 3
    };
  },

  getInitialState: function getInitialState() {
    return {
      childrenTop: 0,
      childrenToRender: 10,
      scrollTop: 0,
      height: this.props.maxHeight,
      count: count(this.props.children)
    };
  },

  onScroll: function onScroll() {
    var container = this.refs.container.getDOMNode();
    var scrollTop = container.scrollTop;

    var childrenTop = Math.floor(scrollTop / this.state.childHeight);
    var childrenBottom = this.state.count - childrenTop - this.state.childrenToRender;

    if (childrenBottom < 0) {
      childrenBottom = 0;
    }

    this.setState({
      childrenTop: childrenTop,
      childrenBottom: childrenBottom,
      scrollTop: scrollTop
    });
  },

  getHeight: function getHeight(numChildren, childHeight, maxHeight) {
    var fullHeight = numChildren * childHeight;
    if (fullHeight < maxHeight) {
      return fullHeight;
    } else {
      return maxHeight;
    }
  },

  getElementHeight: function getElementHeight(element) {
    var marginTop = parseInt(window.getComputedStyle(element).marginTop);
    return elementSize(element)[1] - marginTop; //remove one margin since the margins are shared by adjacent elements
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var length = count(nextProps.children);
    var childHeight = this.state.childHeight;
    var childrenTop = Math.floor(this.state.scrollTop / childHeight);
    var childrenBottom = length - childrenTop - this.state.childrenToRender;

    if (childrenBottom < 0) {
      childrenBottom = 0;
    }

    var height = this.getHeight(length, childHeight, nextProps.maxHeight);

    var numberOfItems = Math.ceil(height / childHeight);

    if (height === this.props.maxHeight) {
      numberOfItems += this.props.itemPadding;
    }

    this.setState({
      childrenTop: childrenTop,
      childrenBottom: childrenBottom,
      childrenToRender: numberOfItems,
      height: height,
      count: length
    });
  },

  componentDidMount: function componentDidMount() {
    var childHeight = this.getChildHeight();
    var length = count(this.props.children);

    var height = this.getHeight(length, childHeight, this.props.maxHeight);

    var numberOfItems = Math.ceil(height / childHeight);

    if (height === this.props.maxHeight) {
      numberOfItems += this.props.itemPadding;
    }

    this.setState({
      childHeight: childHeight,
      childrenToRender: numberOfItems,
      childrenTop: 0,
      childrenBottom: length - numberOfItems,
      height: height
    });
  },

  componentDidUpdate: function componentDidUpdate() {
    //important to update the child height in the case that the children change(example: ajax call for data)
    if (this.state.childHeight !== this.getChildHeight()) {
      this.setState({ childHeight: this.getChildHeight() });
    }
  },

  getChildHeight: function getChildHeight() {
    var firstChild = this.refs['child-0'];
    var el = firstChild.getDOMNode();
    return this.getElementHeight(el);
  },

  render: function render() {
    var start = this.state.childrenTop;
    var end = this.state.childrenTop + this.state.childrenToRender;

    var childrenToRender = this.props.children.slice(start, end);
    var children = childrenToRender.map(function (child, index) {
      if (index === 0) {
        return React.cloneElement(child, { ref: 'child-' + index, key: index });
      }
      return child;
    });

    children = Immutable.Seq.of(React.createElement('div', { style: { height: this.state.childrenTop * this.state.childHeight },
      key: 'top' })).concat(children).concat(React.createElement('div', { style: { height: this.state.childrenBottom * this.state.childHeight },
      key: 'bottom' }));

    return React.createElement(
      'div',
      { style: { height: this.state.height, overflowY: 'auto' },
        className: this.props.className,
        ref: 'container',
        onScroll: this.onScroll },
      children
    );
  }
});

module.exports = LazyRender;

},{"element-size":1,"immutable":undefined,"react":undefined}],3:[function(require,module,exports){
'use strict';

var React = require('react');
var getLabel = require('./immutable/utils').getLabel;

var Option = React.createClass({
	displayName: 'Option',

	propTypes: {
		addLabelText: React.PropTypes.string, // string rendered in case of allowCreate option passed to ReactSelect
		className: React.PropTypes.string, // className (based on mouse position)
		mouseDown: React.PropTypes.func, // method to handle click on option element
		mouseEnter: React.PropTypes.func, // method to handle mouseEnter on option element
		mouseLeave: React.PropTypes.func, // method to handle mouseLeave on option element
		option: React.PropTypes.object.isRequired, // object that is base for that option
		renderFunc: React.PropTypes.func // method passed to ReactSelect component to render label text
	},

	render: function render() {
		var obj = this.props.option;
		var renderedLabel = this.props.renderFunc(obj);

		return obj.disabled ? React.createElement(
			'div',
			{ className: this.props.className },
			renderedLabel
		) : React.createElement(
			'div',
			{ className: this.props.className,
				onMouseEnter: this.props.mouseEnter,
				onMouseLeave: this.props.mouseLeave,
				onMouseDown: this.props.mouseDown,
				onClick: this.props.mouseDown },
			obj.create ? this.props.addLabelText.replace('{label}', getLabel(obj)) : renderedLabel
		);
	}
});

module.exports = Option;

},{"./immutable/utils":7,"react":undefined}],4:[function(require,module,exports){
"use strict";

var React = require('react');

var SingleValue = React.createClass({
	displayName: "SingleValue",

	propTypes: {
		placeholder: React.PropTypes.string, // this is default value provided by React-Select based component
		value: React.PropTypes.object // selected option
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

},{"react":undefined}],5:[function(require,module,exports){
'use strict';

var React = require('react');
var getLabel = require('./immutable/utils').getLabel;

var Value = React.createClass({

	displayName: 'Value',

	propTypes: {
		disabled: React.PropTypes.bool, // disabled prop passed to ReactSelect
		onOptionLabelClick: React.PropTypes.func, // method to handle click on value label
		onRemove: React.PropTypes.func, // method to handle remove of that value
		option: React.PropTypes.object.isRequired, // option passed to component
		optionLabelClick: React.PropTypes.bool, // indicates if onOptionLabelClick should be handled
		renderer: React.PropTypes.func // method to render option label passed to ReactSelect
	},

	blockEvent: function blockEvent(event) {
		event.stopPropagation();
	},

	handleOnRemove: function handleOnRemove(event) {
		if (!this.props.disabled) {
			this.props.onRemove(event);
		}
	},

	render: function render() {
		var label = getLabel(this.props.option);
		if (this.props.renderer) {
			label = this.props.renderer(this.props.option);
		}

		if (!this.props.onRemove && !this.props.optionLabelClick) {
			return React.createElement(
				'div',
				{ className: 'Select-value' },
				label
			);
		}

		if (this.props.optionLabelClick) {
			label = React.createElement(
				'a',
				{ className: 'Select-item-label__a',
					onMouseDown: this.blockEvent,
					onTouchEnd: this.props.onOptionLabelClick,
					onClick: this.props.onOptionLabelClick },
				label
			);
		}

		return React.createElement(
			'div',
			{ className: 'Select-item' },
			React.createElement(
				'span',
				{ className: 'Select-item-icon',
					onMouseDown: this.blockEvent,
					onClick: this.handleOnRemove,
					onTouchEnd: this.handleOnRemove },
				'×'
			),
			React.createElement(
				'span',
				{ className: 'Select-item-label' },
				label
			)
		);
	}

});

module.exports = Value;

},{"./immutable/utils":7,"react":undefined}],6:[function(require,module,exports){
'use strict';

//source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

},{}],7:[function(require,module,exports){
'use strict';

function isImmutable(obj) {
  return obj != null && typeof obj.toJS == 'function';
}

function getValueProp(obj, property) {
  if (!obj) {
    return null;
  }
  if (isImmutable(obj)) {
    return obj.get(property);
  }
  return obj[property];
}

function getValue(obj) {
  return getValueProp(obj, 'value');
}

function getLabel(obj) {
  return getValueProp(obj, 'label');
}

function getLength(obj) {
  if (!obj) {
    return 0;
  }
  if (isImmutable(obj)) {
    return obj.size;
  }
  return obj.length;
}

function getAt(obj, index) {
  if (!obj) {
    return null;
  }
  if (isImmutable(obj)) {
    return obj.get(index);
  }

  return obj[index];
}

module.exports = {
  isImmutable: isImmutable,
  getValue: getValue,
  getLabel: getLabel,
  getValueProp: getValueProp,
  getLength: getLength,
  getAt: getAt
};

},{}],"react-select":[function(require,module,exports){
/* disable some rules until we refactor more completely; fixing them now would
   cause conflicts with some open PRs unnecessarily. */
/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var Input = require('react-input-autosize');
var classes = require('classnames');
var Immutable = require('immutable');
var Value = require('./Value');
var SingleValue = require('./SingleValue');
var Option = require('./Option');
var LazyRender = require('./LazyRender');
var immutableUtils = require('./immutable/utils');
require('./arrayFindPolyfill');

var isImmutable = immutableUtils.isImmutable,
    getValue = immutableUtils.getValue,
    getLabel = immutableUtils.getLabel,
    getValueProp = immutableUtils.getValueProp,
    getLength = immutableUtils.getLength,
    getAt = immutableUtils.getAt;

var requestId = 0;

// test by value, por eid if available
var isEqualValue = function isEqualValue(v1, v2) {
	return Immutable.is(v1, v2) || v1 && v2 && v1.has && v1.has('eid') && Immutable.is(v1.get('eid'), v2.get('eid'));
};

var compareOptions = function compareOptions(ops1, ops2) {
	return isImmutable(ops1, ops2) ? Immutable.is(ops1, ops2) : JSON.stringify(ops1) === JSON.stringify(ops2);
};

var Select = React.createClass({

	displayName: 'Select',

	propTypes: {
		addLabelText: React.PropTypes.string, // placeholder displayed when you want to add a label on a multi-value input
		allowCreate: React.PropTypes.bool, // whether to allow creation of new entries
		asyncOptions: React.PropTypes.func, // function to call to get options
		autoload: React.PropTypes.bool, // whether to auto-load the default async options set
		backspaceRemoves: React.PropTypes.bool, // whether backspace removes an item if there is no text input
		cacheAsyncResults: React.PropTypes.bool, // whether to allow cache
		className: React.PropTypes.string, // className for the outer element
		clearAllText: React.PropTypes.string, // title for the "clear" control when multi: true
		clearValueText: React.PropTypes.string, // title for the "clear" control
		clearable: React.PropTypes.bool, // should it be possible to reset value
		delimiter: React.PropTypes.string, // delimiter to use to join multiple values
		disabled: React.PropTypes.bool, // whether the Select is disabled or not
		filterOption: React.PropTypes.func, // method to filter a single option: function(option, filterString)
		filterOptions: React.PropTypes.func, // method to filter the options array: function([options], filterString, [values])
		ignoreCase: React.PropTypes.bool, // whether to perform case-insensitive filtering
		inputProps: React.PropTypes.object, // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
		matchPos: React.PropTypes.string, // (any|start) match the start or entire string when filtering
		matchProp: React.PropTypes.string, // (any|label|value) which option property to filter on
		multi: React.PropTypes.bool, // multi-value input
		name: React.PropTypes.string, // field name, for hidden <input /> tag
		newOptionCreator: React.PropTypes.func, // factory to create new options when allowCreate set
		noResultsText: React.PropTypes.string, // placeholder displayed when there are no matching search results
		onBlur: React.PropTypes.func, // onBlur handler: function(event) {}
		onChange: React.PropTypes.func, // onChange handler: function(newValue) {}
		onFocus: React.PropTypes.func, // onFocus handler: function(event) {}
		onOptionLabelClick: React.PropTypes.func, // onCLick handler for value labels: function (value, event) {}
		optionComponent: React.PropTypes.func, // option component to render in dropdown
		optionRenderer: React.PropTypes.func, // optionRenderer: function(option) {}
		options: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.instanceOf(Immutable.List)]), // array of options
		placeholder: React.PropTypes.string, // field placeholder, displayed when there's no value
		searchable: React.PropTypes.bool, // whether to enable searching feature or not
		searchPromptText: React.PropTypes.string, // label to prompt for search input
		singleValueComponent: React.PropTypes.func, // single value component when multiple is set to false
		value: React.PropTypes.any, // initial field value
		valueComponent: React.PropTypes.func, // value component to render in multiple mode
		valueRenderer: React.PropTypes.func, // valueRenderer: function(option) {}
		styleMenuOuter: React.PropTypes.object, // styleMenuOuter: style object used by menu dropdown
		lazy: React.PropTypes.bool // lazy: use LazyRender for dropdown items
	},

	getDefaultProps: function getDefaultProps() {
		return {
			addLabelText: 'Adicionar {label} ?',
			allowCreate: false,
			asyncOptions: undefined,
			autoload: true,
			backspaceRemoves: true,
			cacheAsyncResults: true,
			className: undefined,
			clearAllText: 'Limpar todos',
			clearValueText: 'Limpar',
			clearable: true,
			delimiter: ',',
			disabled: false,
			ignoreCase: true,
			inputProps: {},
			matchPos: 'any',
			matchProp: 'any',
			name: undefined,
			newOptionCreator: undefined,
			noResultsText: 'Nenhum resultado encontrado',
			onChange: undefined,
			onOptionLabelClick: undefined,
			optionComponent: Option,
			options: undefined,
			placeholder: 'Selecione...',
			searchable: true,
			searchPromptText: 'Digite para buscar',
			singleValueComponent: SingleValue,
			value: undefined,
			valueComponent: Value,
			lazy: false,
			styleMenuOuter: {}
		};
	},

	getInitialState: function getInitialState() {
		return {
			/*
    * set by getStateFromValue on componentWillMount:
    * - value
    * - values
    * - filteredOptions
    * - inputValue
    * - placeholder
    * - focusedOption
   */
			isFocused: false,
			isLoading: false,
			isOpen: false,
			options: this.props.options
		};
	},

	componentWillMount: function componentWillMount() {
		var _this = this;

		this._optionsCache = {};
		this._optionsFilterString = '';
		this._closeMenuIfClickedOutside = function (event) {
			if (!_this.state.isOpen) {
				return;
			}
			var menuElem = React.findDOMNode(_this.refs.selectMenuContainer);
			var controlElem = React.findDOMNode(_this.refs.control);

			var eventOccuredOutsideMenu = _this.clickedOutsideElement(menuElem, event);
			var eventOccuredOutsideControl = _this.clickedOutsideElement(controlElem, event);

			// Hide dropdown menu if click occurred outside of menu
			if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
				_this.setState({
					isOpen: false
				}, _this._unbindCloseMenuIfClickedOutside);
			}
		};
		this._bindCloseMenuIfClickedOutside = function () {
			if (!document.addEventListener && document.attachEvent) {
				document.attachEvent('onclick', this._closeMenuIfClickedOutside);
			} else {
				document.addEventListener('click', this._closeMenuIfClickedOutside);
			}
		};
		this._unbindCloseMenuIfClickedOutside = function () {
			if (!document.removeEventListener && document.detachEvent) {
				document.detachEvent('onclick', this._closeMenuIfClickedOutside);
			} else {
				document.removeEventListener('click', this._closeMenuIfClickedOutside);
			}
		};
		this.setState(this.getStateFromValue(this.props.value));
	},

	componentDidMount: function componentDidMount() {
		if (this.props.asyncOptions && this.props.autoload) {
			this.autoloadAsyncOptions();
		}
	},

	componentWillUnmount: function componentWillUnmount() {
		clearTimeout(this._blurTimeout);
		clearTimeout(this._focusTimeout);
		if (this.state.isOpen) {
			this._unbindCloseMenuIfClickedOutside();
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(newProps) {
		var _this2 = this;

		var optionsChanged = false;
		if (!compareOptions(newProps.options, this.props.options)) {
			optionsChanged = true;
			this.setState({
				options: newProps.options,
				filteredOptions: this.filterOptions(newProps.options)
			});
		}
		if (!isEqualValue(newProps.value, this.state.value) || newProps.placeholder !== this.props.placeholder || optionsChanged) {
			var setState = function setState(newState) {
				_this2.setState(_this2.getStateFromValue(newProps.value, newState && newState.options || newProps.options, newProps.placeholder));
			};
			if (this.props.asyncOptions) {
				this.loadAsyncOptions(newProps.value, {}, setState);
			} else {
				setState();
			}
		}
	},

	componentDidUpdate: function componentDidUpdate() {
		var _this3 = this;

		if (!this.props.disabled && this._focusAfterUpdate) {
			clearTimeout(this._blurTimeout);
			this._focusTimeout = setTimeout(function () {
				_this3.getInputNode().focus();
				_this3._focusAfterUpdate = false;
			}, 50);
		}
		if (this._focusedOptionReveal) {
			if (this.refs.focused && this.refs.menu) {
				var focusedDOM = React.findDOMNode(this.refs.focused);
				var menuDOM = React.findDOMNode(this.refs.menu);
				var focusedRect = focusedDOM.getBoundingClientRect();
				var menuRect = menuDOM.getBoundingClientRect();

				if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
					menuDOM.scrollTop = focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight;
				}
			}
			this._focusedOptionReveal = false;
		}
	},

	focus: function focus() {
		this.getInputNode().focus();
	},

	clickedOutsideElement: function clickedOutsideElement(element, event) {
		var eventTarget = event.target ? event.target : event.srcElement;
		while (eventTarget != null) {
			if (eventTarget === element) return false;
			eventTarget = eventTarget.offsetParent;
		}
		return true;
	},

	getStateFromValue: function getStateFromValue(value, options, placeholder) {
		if (!options) {
			options = this.state.options;
		}
		if (!placeholder) {
			placeholder = this.props.placeholder;
		}

		// reset internal filter string
		this._optionsFilterString = '';

		var values = this.initValuesArray(value, options);
		var filteredOptions = this.filterOptions(options, values);

		var focusedOption;
		var valueForState = null;
		if (!this.props.multi && getLength(values)) {
			focusedOption = getAt(values, 0);;
			valueForState = getValue(getAt(values, 0));
		} else {
			for (var optionIndex = 0; optionIndex < getLength(filteredOptions); ++optionIndex) {
				var option = getAt(filteredOptions, optionIndex);
				if (!getValueProp(option, 'disabled')) {
					focusedOption = option;
					break;
				}
			}
			valueForState = values.map(function (v) {
				return getValue(v);
			}).join(this.props.delimiter);
		}

		return {
			value: valueForState,
			values: values,
			inputValue: '',
			filteredOptions: filteredOptions,
			placeholder: !this.props.multi && getLength(values) ? getLabel(getAt(values, 0)) : placeholder,
			focusedOption: focusedOption
		};
	},

	initValuesArray: function initValuesArray(values, options) {
		if (!Array.isArray(values) && !Immutable.Iterable.isIndexed(values)) {
			if (typeof values === 'string') {
				values = values === '' ? Immutable.List() : Immutable.List(values.split(this.props.delimiter));
			} else {
				values = values !== undefined && values !== null ? Immutable.List([values]) : Immutable.List();
			}
		}
		return values.map(function (val) {
			if (typeof val === 'string' || typeof val === 'number') {
				return options.find(function (op) {
					var opValue = getValue(op);

					return isEqualValue(opValue, val) || typeof opValue === 'number' && opValue.toString() === val;
				}) || Immutable.Map({ value: val, label: val });
			} else {
				return val;
			}
		});
	},

	setValue: function setValue(value, focusAfterUpdate) {
		if (focusAfterUpdate || focusAfterUpdate === undefined) {
			this._focusAfterUpdate = true;
		}
		var newState = this.getStateFromValue(value);
		newState.isOpen = false;
		this.fireChangeEvent(newState);
		this.setState(newState);
	},

	selectValue: function selectValue(value) {
		if (!this.props.multi) {
			this.setValue(value);
		} else if (value) {
			this.addValue(value);
		}
		this._unbindCloseMenuIfClickedOutside();
	},

	addValue: function addValue(value) {
		if (isImmutable(value) && isImmutable(this.state.values)) {
			this.setValue(this.state.values.push(value));
		} else {
			this.setValue(this.state.values.concat(value));
		}
	},

	popValue: function popValue() {
		this.setValue(this.state.values.slice(0, getLength(this.state.values) - 1));
	},

	removeValue: function removeValue(valueToRemove) {
		this.setValue(this.state.values.filter(function (value) {
			return value !== valueToRemove;
		}));
	},

	clearValue: function clearValue(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setValue(null);
	},

	resetValue: function resetValue() {
		this.setValue(this.state.value === '' ? null : this.state.value);
	},

	getInputNode: function getInputNode() {
		var input = this.refs.input;
		return this.props.searchable ? input : React.findDOMNode(input);
	},

	fireChangeEvent: function fireChangeEvent(newState) {
		if (newState.value !== this.state.value && this.props.onChange) {
			this.props.onChange(newState.value, newState.values);
		}
	},

	handleMouseDown: function handleMouseDown(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		if (this.state.isFocused) {
			this.setState({
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			this._openAfterFocus = true;
			this.getInputNode().focus();
		}
	},

	handleMouseDownOnArrow: function handleMouseDownOnArrow(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		// If not focused, handleMouseDown will handle it
		if (!this.state.isOpen) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setState({
			isOpen: false
		}, this._unbindCloseMenuIfClickedOutside);
	},

	handleInputFocus: function handleInputFocus(event) {
		var newIsOpen = this.state.isOpen || this._openAfterFocus;
		this.setState({
			isFocused: true,
			isOpen: newIsOpen
		}, function () {
			if (newIsOpen) {
				this._bindCloseMenuIfClickedOutside();
			} else {
				this._unbindCloseMenuIfClickedOutside();
			}
		});
		this._openAfterFocus = false;
		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
	},

	handleInputBlur: function handleInputBlur(event) {
		var _this4 = this;

		this._blurTimeout = setTimeout(function () {
			if (_this4._focusAfterUpdate) return;
			_this4.setState({
				isFocused: false,
				isOpen: false
			});
		}, 50);
		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
	},

	handleKeyDown: function handleKeyDown(event) {
		if (this.props.disabled) return;
		switch (event.keyCode) {
			case 8:
				// backspace
				if (!this.state.inputValue && this.props.backspaceRemoves) {
					this.popValue();
				}
				return;
			case 9:
				// tab
				if (event.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
					return;
				}
				this.selectFocusedOption();
				break;
			case 13:
				// enter
				if (!this.state.isOpen) return;

				this.selectFocusedOption();
				break;
			case 27:
				// escape
				if (this.state.isOpen) {
					this.resetValue();
				} else if (this.props.clearable) {
					this.clearValue(event);
				}
				break;
			case 38:
				// up
				this.focusPreviousOption();
				break;
			case 40:
				// down
				this.focusNextOption();
				break;
			case 188:
				// ,
				if (this.props.allowCreate && this.props.multi) {
					event.preventDefault();
					event.stopPropagation();
					this.selectFocusedOption();
				} else {
					return;
				}
				break;
			default:
				return;
		}
		event.preventDefault();
	},

	// Ensures that the currently focused option is available in filteredOptions.
	// If not, returns the first available option.
	_getNewFocusedOption: function _getNewFocusedOption(filteredOptions) {
		var focusedOption = this.state.focusedOption;
		return filteredOptions.find(function (op) {
			return op === focusedOption;
		}) || getAt(filteredOptions, 0);
	},

	handleInputChange: function handleInputChange(event) {
		// assign an internal variable because we need to use
		// the latest value before setState() has completed.
		this._optionsFilterString = event.target.value;

		if (this.props.asyncOptions) {
			this.setState({
				isLoading: true,
				inputValue: event.target.value
			});
			this.loadAsyncOptions(event.target.value, {
				isLoading: false,
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			var filteredOptions = this.filterOptions(this.state.options);
			this.setState({
				isOpen: true,
				inputValue: event.target.value,
				filteredOptions: filteredOptions,
				focusedOption: this._getNewFocusedOption(filteredOptions)
			}, this._bindCloseMenuIfClickedOutside);
		}
	},

	autoloadAsyncOptions: function autoloadAsyncOptions() {
		var _this5 = this;

		this.loadAsyncOptions(this.props.value || '', {}, function () {
			// update with fetched but don't focus
			_this5.setValue(_this5.props.value, false);
		});
	},

	loadAsyncOptions: function loadAsyncOptions(input, state, callback) {
		var _this6 = this;

		var thisRequestId = this._currentRequestId = requestId++;
		if (this.props.cacheAsyncResults) {
			for (var i = 0; i <= input.length; i++) {
				var cacheKey = input.slice(0, i);
				if (this._optionsCache[cacheKey] && (input === cacheKey || this._optionsCache[cacheKey].complete)) {
					var options = this._optionsCache[cacheKey].options;
					var filteredOptions = this.filterOptions(options);
					var newState = {
						options: options,
						filteredOptions: filteredOptions,
						focusedOption: this._getNewFocusedOption(filteredOptions)
					};
					for (var key in state) {
						if (state.hasOwnProperty(key)) {
							newState[key] = state[key];
						}
					}
					this.setState(newState);
					if (callback) callback.call(this, newState);
					return;
				}
			}
		}

		this.props.asyncOptions(input, function (err, data) {
			if (err) throw err;
			if (_this6.props.cacheAsyncResults) {
				_this6._optionsCache[input] = data;
			}
			if (thisRequestId !== _this6._currentRequestId) {
				return;
			}
			var filteredOptions = _this6.filterOptions(data.options);
			var newState = {
				options: data.options,
				filteredOptions: filteredOptions,
				focusedOption: _this6._getNewFocusedOption(filteredOptions)
			};
			for (var key in state) {
				if (state.hasOwnProperty(key)) {
					newState[key] = state[key];
				}
			}
			_this6.setState(newState);
			if (callback) callback.call(_this6, newState);
		});
	},

	filterOptions: function filterOptions(options, values) {
		var filterValue = this._optionsFilterString;
		var exclude = (values || this.state.values).map(function (v) {
			return getValue(v);
		});
		if (this.props.filterOptions) {
			return this.props.filterOptions.call(this, options, filterValue, exclude);
		} else {
			var filterOption = function filterOption(op) {
				if (this.props.multi && exclude.indexOf(getValue(op)) > -1) return false;
				if (this.props.filterOption) return this.props.filterOption.call(this, op, filterValue);
				var valueTest = String(getValue(op)),
				    labelTest = String(getLabel(op));
				if (this.props.ignoreCase) {
					valueTest = valueTest.toLowerCase();
					labelTest = labelTest.toLowerCase();
					filterValue = filterValue.toLowerCase();
				}
				return !filterValue || this.props.matchPos === 'start' ? this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue || this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue : this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0 || this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0;
			};
			return (options || []).filter(filterOption, this);
		}
	},

	selectFocusedOption: function selectFocusedOption() {
		if (this.props.allowCreate && !this.state.focusedOption) {
			return this.selectValue(this.state.inputValue);
		}
		return this.selectValue(this.state.focusedOption);
	},

	focusOption: function focusOption(op) {
		this.setState({
			focusedOption: op
		});
	},

	focusNextOption: function focusNextOption() {
		this.focusAdjacentOption('next');
	},

	focusPreviousOption: function focusPreviousOption() {
		this.focusAdjacentOption('previous');
	},

	focusAdjacentOption: function focusAdjacentOption(dir) {
		this._focusedOptionReveal = true;
		var ops = this.state.filteredOptions.filter(function (op) {
			return !getValueProp(op, 'disabled');
		});
		if (!this.state.isOpen) {
			this.setState({
				isOpen: true,
				inputValue: '',
				focusedOption: this.state.focusedOption || getAt(ops, dir === 'next' ? 0 : getLength(ops) - 1)
			}, this._bindCloseMenuIfClickedOutside);
			return;
		}
		if (!getLength(ops)) {
			return;
		}
		var focusedIndex = -1;
		for (var i = 0; i < getLength(ops); i++) {
			if (isEqualValue(this.state.focusedOption, getAt(ops, i))) {
				focusedIndex = i;
				break;
			}
		}
		var focusedOption = getAt(ops, 0);
		if (dir === 'next' && focusedIndex > -1 && focusedIndex < getLength(ops) - 1) {
			focusedOption = getAt(ops, focusedIndex + 1);
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedOption = getAt(ops, focusedIndex - 1);
			} else {
				focusedOption = getAt(ops, getLength(ops) - 1);
			}
		}
		this.setState({
			focusedOption: focusedOption
		});
	},

	unfocusOption: function unfocusOption(op) {
		if (isEqualValue(this.state.focusedOption, op)) {
			this.setState({
				focusedOption: null
			});
		}
	},

	buildMenu: function buildMenu() {
		var focusedValue = this.state.focusedOption ? getValue(this.state.focusedOption) : null;
		var renderLabel = this.props.optionRenderer || function (op) {
			return getLabel(op);
		};
		if (getLength(this.state.filteredOptions) > 0) {
			focusedValue = focusedValue == null ? getAt(this.state.filteredOptions, 0) : focusedValue;
		}

		var options = this.state.filteredOptions;

		//TODO: support allowCreate (it mutates `options`, which is supposed to be immutable, calling `unshift` below)
		// Add the current value to the filtered options in last resort
		// if (this.props.allowCreate && this.state.inputValue.trim()) {
		// 	var inputValue = this.state.inputValue;
		// 	options = options.slice();
		// 	var newOption = this.props.newOptionCreator ? this.props.newOptionCreator(inputValue) : {
		// 		value: inputValue,
		// 		label: inputValue,
		// 		create: true
		// 	};
		// 	options.unshift(newOption);
		// }
		var ops = options.map(function (op, key) {
			var isSelected = isEqualValue(this.state.value, getValue(op));
			var isFocused = isEqualValue(focusedValue, getValue(op));
			var optionClass = classes({
				'Select-option': true,
				'is-selected': isSelected,
				'is-focused': isFocused,
				'is-disabled': getValueProp(op, 'disabled')
			});
			var ref = isFocused ? 'focused' : null;
			var mouseEnter = this.focusOption.bind(this, op);
			var mouseLeave = this.unfocusOption.bind(this, op);
			var mouseDown = this.selectValue.bind(this, op);
			var optionResult = React.createElement(this.props.optionComponent, {
				key: 'option-' + getValue(op),
				className: optionClass,
				renderFunc: renderLabel,
				mouseEnter: mouseEnter,
				mouseLeave: mouseLeave,
				mouseDown: mouseDown,
				click: mouseDown,
				addLabelText: this.props.addLabelText,
				option: op,
				ref: ref
			});
			return optionResult;
		}, this);
		return getLength(ops) ? ops : React.createElement(
			'div',
			{ className: 'Select-noresults' },
			this.props.asyncOptions && !this.state.inputValue ? this.props.searchPromptText : this.props.noResultsText
		);
	},

	handleOptionLabelClick: function handleOptionLabelClick(value, event) {
		if (this.props.onOptionLabelClick) {
			this.props.onOptionLabelClick(value, event);
		}
	},

	render: function render() {
		var selectClass = classes('Select', this.props.className, {
			'is-multi': this.props.multi,
			'is-searchable': this.props.searchable,
			'is-open': this.state.isOpen,
			'is-focused': this.state.isFocused,
			'is-loading': this.state.isLoading,
			'is-disabled': this.props.disabled,
			'has-value': this.state.value
		});
		var value = [];
		if (this.props.multi) {
			this.state.values.forEach(function (val) {
				var onOptionLabelClick = this.handleOptionLabelClick.bind(this, val);
				var onRemove = this.removeValue.bind(this, val);
				var valueComponent = React.createElement(this.props.valueComponent, {
					key: getValue(val),
					option: val,
					renderer: this.props.valueRenderer,
					optionLabelClick: !!this.props.onOptionLabelClick,
					onOptionLabelClick: onOptionLabelClick,
					onRemove: onRemove,
					disabled: this.props.disabled
				});
				value.push(valueComponent);
			}, this);
		}

		if (!this.state.inputValue && (!this.props.multi || !value.length)) {
			var val = getAt(this.state.values, 0) || null;
			if (this.props.valueRenderer && !!getLength(this.state.values)) {
				value.push(React.createElement(Value, {
					key: 0,
					option: val,
					renderer: this.props.valueRenderer,
					disabled: this.props.disabled }));
			} else {
				var singleValueComponent = React.createElement(this.props.singleValueComponent, {
					key: 'placeholder',
					value: val,
					placeholder: this.state.placeholder
				});
				value.push(singleValueComponent);
			}
		}

		var loading = this.state.isLoading ? React.createElement('span', { className: 'Select-loading', 'aria-hidden': 'true' }) : null;
		var clear = this.props.clearable && this.state.value && !this.props.disabled ? React.createElement('span', { className: 'Select-clear', title: this.props.multi ? this.props.clearAllText : this.props.clearValueText, 'aria-label': this.props.multi ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onClick: this.clearValue, dangerouslySetInnerHTML: { __html: '&times;' } }) : null;

		var menu;
		var menuProps;
		if (this.state.isOpen) {
			menuProps = {
				ref: 'menu',
				className: 'Select-menu'
			};
			if (this.props.multi) {
				menuProps.onMouseDown = this.handleMouseDown;
			}

			if (this.props.lazy) {
				menu = React.createElement(
					'div',
					{ ref: 'selectMenuContainer', className: 'Select-menu-outer', style: this.props.styleMenuOuter },
					React.createElement(
						LazyRender,
						{ maxHeight: this.props.styleMenuOuter.maxHeight || 200,
							className: this.props.className,
							ref: 'container' },
						this.buildMenu()
					)
				);
			} else {
				menu = React.createElement(
					'div',
					{ ref: 'selectMenuContainer', className: 'Select-menu-outer', style: this.props.styleMenuOuter },
					React.createElement(
						'div',
						menuProps,
						this.buildMenu()
					)
				);
			}
		}

		var input;
		var inputProps = {
			ref: 'input',
			className: 'Select-input ' + (this.props.inputProps.className || ''),
			tabIndex: this.props.tabIndex || 0,
			onFocus: this.handleInputFocus,
			onBlur: this.handleInputBlur
		};
		for (var key in this.props.inputProps) {
			if (this.props.inputProps.hasOwnProperty(key) && key !== 'className') {
				inputProps[key] = this.props.inputProps[key];
			}
		}

		if (!this.props.disabled) {
			if (this.props.searchable) {
				input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: '5' }, inputProps));
			} else {
				input = React.createElement(
					'div',
					inputProps,
					' '
				);
			}
		} else if (!this.props.multi || !getLength(this.state.values)) {
			input = React.createElement(
				'div',
				{ className: 'Select-input' },
				' '
			);
		}

		return React.createElement(
			'div',
			{ ref: 'wrapper', className: selectClass },
			React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }),
			React.createElement(
				'div',
				{ className: 'Select-control', ref: 'control', onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
				value,
				input,
				React.createElement('span', { className: 'Select-arrow-zone', onMouseDown: this.handleMouseDownOnArrow }),
				React.createElement('span', { className: 'Select-arrow', onMouseDown: this.handleMouseDownOnArrow }),
				loading,
				clear
			),
			menu
		);
	}

});

module.exports = Select;

},{"./LazyRender":2,"./Option":3,"./SingleValue":4,"./Value":5,"./arrayFindPolyfill":6,"./immutable/utils":7,"classnames":undefined,"immutable":undefined,"react":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2VsZW1lbnQtc2l6ZS9pbmRleC5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3Qvc3JjL0xhenlSZW5kZXIvaW5kZXguanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L3NyYy9PcHRpb24uanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L3NyYy9TaW5nbGVWYWx1ZS5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3Qvc3JjL1ZhbHVlLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvYXJyYXlGaW5kUG9seWZpbGwuanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L3NyYy9pbW11dGFibGUvdXRpbHMuanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L3NyYy9TZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFPLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxBQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDLEdBQUc7R0FDbEg7O01BQUssU0FBUyxFQUFDLGdCQUFnQixFQUFDLEdBQUcsRUFBQyxTQUFTLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLEFBQUMsRUFBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDO0lBQy9JLEtBQUs7SUFDTCxLQUFLO0lBQ04sOEJBQU0sU0FBUyxFQUFDLG1CQUFtQixFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEFBQUMsR0FBRztJQUNoRiw4QkFBTSxTQUFTLEVBQUMsY0FBYyxFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEFBQUMsR0FBRztJQUMxRSxPQUFPO0lBQ1AsS0FBSztJQUNEO0dBQ0wsSUFBSTtHQUNBLENBQ0w7RUFDRjs7Q0FFRCxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBnZXRTaXplXG5cbmZ1bmN0aW9uIGdldFNpemUoZWxlbWVudCkge1xuICAvLyBIYW5kbGUgY2FzZXMgd2hlcmUgdGhlIGVsZW1lbnQgaXMgbm90IGFscmVhZHlcbiAgLy8gYXR0YWNoZWQgdG8gdGhlIERPTSBieSBicmllZmx5IGFwcGVuZGluZyBpdFxuICAvLyB0byBkb2N1bWVudC5ib2R5LCBhbmQgcmVtb3ZpbmcgaXQgYWdhaW4gbGF0ZXIuXG4gIGlmIChlbGVtZW50ID09PSB3aW5kb3cgfHwgZWxlbWVudCA9PT0gZG9jdW1lbnQuYm9keSkge1xuICAgIHJldHVybiBbd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodF1cbiAgfVxuXG4gIGlmICghZWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgdmFyIHRlbXBvcmFyeSA9IHRydWVcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW1lbnQpXG4gIH1cblxuICB2YXIgYm91bmRzID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICB2YXIgc3R5bGVzID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KVxuICB2YXIgaGVpZ2h0ID0gKGJvdW5kcy5oZWlnaHR8MClcbiAgICArIHBhcnNlKHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKCdtYXJnaW4tdG9wJykpXG4gICAgKyBwYXJzZShzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSgnbWFyZ2luLWJvdHRvbScpKVxuICB2YXIgd2lkdGggID0gKGJvdW5kcy53aWR0aHwwKVxuICAgICsgcGFyc2Uoc3R5bGVzLmdldFByb3BlcnR5VmFsdWUoJ21hcmdpbi1sZWZ0JykpXG4gICAgKyBwYXJzZShzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSgnbWFyZ2luLXJpZ2h0JykpXG5cbiAgaWYgKHRlbXBvcmFyeSkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZWxlbWVudClcbiAgfVxuXG4gIHJldHVybiBbd2lkdGgsIGhlaWdodF1cbn1cblxuZnVuY3Rpb24gcGFyc2UocHJvcCkge1xuICByZXR1cm4gcGFyc2VGbG9hdChwcm9wKSB8fCAwXG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy8gZnJvbVxuLy8gaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL29uZWZpbmVzdGF5L3JlYWN0LWxhenktcmVuZGVyL21hc3Rlci9zcmMvTGF6eVJlbmRlci5qc3hcbi8vIE1vZGlmaWNhw6fDtWVzIHBhcmEgYWNlaXRhciBsYXp5IGltbXV0YWJsZSBzZXEuXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG52YXIgZWxlbWVudFNpemUgPSByZXF1aXJlKFwiZWxlbWVudC1zaXplXCIpO1xuXG5mdW5jdGlvbiBjb3VudChjaGlsZHJlbikge1xuICByZXR1cm4gY2hpbGRyZW4uY291bnQgPyBjaGlsZHJlbi5jb3VudCgpIDogY2hpbGRyZW4ubGVuZ3RoO1xufVxuXG52YXIgTGF6eVJlbmRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgY2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5pbnN0YW5jZU9mKEltbXV0YWJsZS5JdGVyYWJsZSksXG4gICAgbWF4SGVpZ2h0OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG5cbiAgICBjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgaXRlbVBhZGRpbmc6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpdGVtUGFkZGluZzogM1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hpbGRyZW5Ub3A6IDAsXG4gICAgICBjaGlsZHJlblRvUmVuZGVyOiAxMCxcbiAgICAgIHNjcm9sbFRvcDogMCxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5tYXhIZWlnaHQsXG4gICAgICBjb3VudDogY291bnQodGhpcy5wcm9wcy5jaGlsZHJlbilcbiAgICB9O1xuICB9LFxuXG4gIG9uU2Nyb2xsOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5yZWZzLmNvbnRhaW5lci5nZXRET01Ob2RlKCk7XG4gICAgdmFyIHNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxUb3A7XG5cbiAgICB2YXIgY2hpbGRyZW5Ub3AgPSBNYXRoLmZsb29yKHNjcm9sbFRvcCAvIHRoaXMuc3RhdGUuY2hpbGRIZWlnaHQpO1xuICAgIHZhciBjaGlsZHJlbkJvdHRvbSA9ICh0aGlzLnN0YXRlLmNvdW50IC0gY2hpbGRyZW5Ub3AgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmNoaWxkcmVuVG9SZW5kZXIpO1xuXG4gICAgaWYgKGNoaWxkcmVuQm90dG9tIDwgMCkge1xuICAgICAgY2hpbGRyZW5Cb3R0b20gPSAwO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY2hpbGRyZW5Ub3A6IGNoaWxkcmVuVG9wLFxuICAgICAgY2hpbGRyZW5Cb3R0b206IGNoaWxkcmVuQm90dG9tLFxuICAgICAgc2Nyb2xsVG9wOiBzY3JvbGxUb3BcbiAgICB9KTtcbiAgfSxcblxuICBnZXRIZWlnaHQ6IGZ1bmN0aW9uKG51bUNoaWxkcmVuLCBjaGlsZEhlaWdodCwgbWF4SGVpZ2h0KSB7XG4gICAgdmFyIGZ1bGxIZWlnaHQgPSBudW1DaGlsZHJlbiAqIGNoaWxkSGVpZ2h0O1xuICAgIGlmIChmdWxsSGVpZ2h0IDwgbWF4SGVpZ2h0KSB7XG4gICAgICByZXR1cm4gZnVsbEhlaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1heEhlaWdodDtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RWxlbWVudEhlaWdodDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHZhciBtYXJnaW5Ub3AgPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5tYXJnaW5Ub3ApO1xuICAgIHJldHVybiBlbGVtZW50U2l6ZShlbGVtZW50KVsxXSAtIG1hcmdpblRvcDsgLy9yZW1vdmUgb25lIG1hcmdpbiBzaW5jZSB0aGUgbWFyZ2lucyBhcmUgc2hhcmVkIGJ5IGFkamFjZW50IGVsZW1lbnRzXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdmFyIGxlbmd0aCA9IGNvdW50KG5leHRQcm9wcy5jaGlsZHJlbik7XG4gICAgdmFyIGNoaWxkSGVpZ2h0ID0gdGhpcy5zdGF0ZS5jaGlsZEhlaWdodDtcbiAgICB2YXIgY2hpbGRyZW5Ub3AgPSBNYXRoLmZsb29yKHRoaXMuc3RhdGUuc2Nyb2xsVG9wIC8gY2hpbGRIZWlnaHQpO1xuICAgIHZhciBjaGlsZHJlbkJvdHRvbSA9IChsZW5ndGggLSBjaGlsZHJlblRvcCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY2hpbGRyZW5Ub1JlbmRlcik7XG5cbiAgICBpZiAoY2hpbGRyZW5Cb3R0b20gPCAwKSB7XG4gICAgICBjaGlsZHJlbkJvdHRvbSA9IDA7XG4gICAgfVxuXG4gICAgdmFyIGhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KFxuICAgICAgbGVuZ3RoLFxuICAgICAgY2hpbGRIZWlnaHQsXG4gICAgICBuZXh0UHJvcHMubWF4SGVpZ2h0XG4gICAgKTtcblxuICAgIHZhciBudW1iZXJPZkl0ZW1zID0gTWF0aC5jZWlsKGhlaWdodCAvIGNoaWxkSGVpZ2h0KTtcblxuICAgIGlmIChoZWlnaHQgPT09IHRoaXMucHJvcHMubWF4SGVpZ2h0KSB7XG4gICAgICBudW1iZXJPZkl0ZW1zICs9IHRoaXMucHJvcHMuaXRlbVBhZGRpbmc7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaGlsZHJlblRvcDogY2hpbGRyZW5Ub3AsXG4gICAgICBjaGlsZHJlbkJvdHRvbTogY2hpbGRyZW5Cb3R0b20sXG4gICAgICBjaGlsZHJlblRvUmVuZGVyOiBudW1iZXJPZkl0ZW1zLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICBjb3VudDogbGVuZ3RoXG4gICAgfSk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaGlsZEhlaWdodCA9IHRoaXMuZ2V0Q2hpbGRIZWlnaHQoKTtcbiAgICB2YXIgbGVuZ3RoID0gY291bnQodGhpcy5wcm9wcy5jaGlsZHJlbik7XG5cbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoXG4gICAgICBsZW5ndGgsXG4gICAgICBjaGlsZEhlaWdodCxcbiAgICAgIHRoaXMucHJvcHMubWF4SGVpZ2h0XG4gICAgKTtcblxuICAgIHZhciBudW1iZXJPZkl0ZW1zID0gTWF0aC5jZWlsKGhlaWdodCAvIGNoaWxkSGVpZ2h0KTtcblxuICAgIGlmIChoZWlnaHQgPT09IHRoaXMucHJvcHMubWF4SGVpZ2h0KSB7XG4gICAgICBudW1iZXJPZkl0ZW1zICs9IHRoaXMucHJvcHMuaXRlbVBhZGRpbmc7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaGlsZEhlaWdodDogY2hpbGRIZWlnaHQsXG4gICAgICBjaGlsZHJlblRvUmVuZGVyOiBudW1iZXJPZkl0ZW1zLFxuICAgICAgY2hpbGRyZW5Ub3A6IDAsXG4gICAgICBjaGlsZHJlbkJvdHRvbTogbGVuZ3RoIC0gbnVtYmVyT2ZJdGVtcyxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfSk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAvL2ltcG9ydGFudCB0byB1cGRhdGUgdGhlIGNoaWxkIGhlaWdodCBpbiB0aGUgY2FzZSB0aGF0IHRoZSBjaGlsZHJlbiBjaGFuZ2UoZXhhbXBsZTogYWpheCBjYWxsIGZvciBkYXRhKVxuICAgIGlmICh0aGlzLnN0YXRlLmNoaWxkSGVpZ2h0ICE9PSB0aGlzLmdldENoaWxkSGVpZ2h0KCkpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2NoaWxkSGVpZ2h0OiB0aGlzLmdldENoaWxkSGVpZ2h0KCl9KTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0Q2hpbGRIZWlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaXJzdENoaWxkID0gdGhpcy5yZWZzWydjaGlsZC0wJ107XG4gICAgdmFyIGVsID0gZmlyc3RDaGlsZC5nZXRET01Ob2RlKCk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudEhlaWdodChlbCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLnN0YXRlLmNoaWxkcmVuVG9wO1xuICAgIHZhciBlbmQgPSB0aGlzLnN0YXRlLmNoaWxkcmVuVG9wICsgdGhpcy5zdGF0ZS5jaGlsZHJlblRvUmVuZGVyO1xuXG4gICAgdmFyIGNoaWxkcmVuVG9SZW5kZXIgPSB0aGlzLnByb3BzLmNoaWxkcmVuLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIHZhciBjaGlsZHJlbiA9IGNoaWxkcmVuVG9SZW5kZXIubWFwKGZ1bmN0aW9uKGNoaWxkLCBpbmRleCkge1xuICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQoY2hpbGQsIHtyZWY6ICdjaGlsZC0nICsgaW5kZXgsIGtleTogaW5kZXh9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9KTtcblxuXG4gICAgY2hpbGRyZW4gPSBJbW11dGFibGUuU2VxLm9mKFxuICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6IHRoaXMuc3RhdGUuY2hpbGRyZW5Ub3AgKiB0aGlzLnN0YXRlLmNoaWxkSGVpZ2h0IH19XG4gICAgICAgICAgIGtleT1cInRvcFwiIC8+XG4gICAgKS5jb25jYXQoY2hpbGRyZW4pLmNvbmNhdChcbiAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiB0aGlzLnN0YXRlLmNoaWxkcmVuQm90dG9tICogdGhpcy5zdGF0ZS5jaGlsZEhlaWdodCB9fVxuICAgICAgICAgICBrZXk9XCJib3R0b21cIiAvPlxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6IHRoaXMuc3RhdGUuaGVpZ2h0LCBvdmVyZmxvd1k6ICdhdXRvJyB9fVxuICAgICAgICBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfVxuICAgICAgICByZWY9XCJjb250YWluZXJcIlxuICAgICAgICBvblNjcm9sbD17dGhpcy5vblNjcm9sbH0+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlSZW5kZXI7IiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBnZXRMYWJlbCA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlL3V0aWxzJykuZ2V0TGFiZWw7XG5cbnZhciBPcHRpb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHByb3BUeXBlczoge1xuXHRcdGFkZExhYmVsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgLy8gc3RyaW5nIHJlbmRlcmVkIGluIGNhc2Ugb2YgYWxsb3dDcmVhdGUgb3B0aW9uIHBhc3NlZCB0byBSZWFjdFNlbGVjdFxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgICAgLy8gY2xhc3NOYW1lIChiYXNlZCBvbiBtb3VzZSBwb3NpdGlvbilcblx0XHRtb3VzZURvd246IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgY2xpY2sgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRtb3VzZUVudGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgbW91c2VFbnRlciBvbiBvcHRpb24gZWxlbWVudFxuXHRcdG1vdXNlTGVhdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSBtb3VzZUxlYXZlIG9uIG9wdGlvbiBlbGVtZW50XG5cdFx0b3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsICAgICAvLyBvYmplY3QgdGhhdCBpcyBiYXNlIGZvciB0aGF0IG9wdGlvblxuXHRcdHJlbmRlckZ1bmM6IFJlYWN0LlByb3BUeXBlcy5mdW5jICAgICAgICAgICAgICAgLy8gbWV0aG9kIHBhc3NlZCB0byBSZWFjdFNlbGVjdCBjb21wb25lbnQgdG8gcmVuZGVyIGxhYmVsIHRleHRcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvYmogPSB0aGlzLnByb3BzLm9wdGlvbjtcblx0XHR2YXIgcmVuZGVyZWRMYWJlbCA9IHRoaXMucHJvcHMucmVuZGVyRnVuYyhvYmopO1xuXG5cdFx0cmV0dXJuIG9iai5kaXNhYmxlZCA/IChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0+e3JlbmRlcmVkTGFiZWx9PC9kaXY+XG5cdFx0KSA6IChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cblx0XHRcdFx0b25Nb3VzZUVudGVyPXt0aGlzLnByb3BzLm1vdXNlRW50ZXJ9XG5cdFx0XHRcdG9uTW91c2VMZWF2ZT17dGhpcy5wcm9wcy5tb3VzZUxlYXZlfVxuXHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5wcm9wcy5tb3VzZURvd259XG5cdFx0XHRcdG9uQ2xpY2s9e3RoaXMucHJvcHMubW91c2VEb3dufT5cblx0XHRcdFx0eyBvYmouY3JlYXRlID8gdGhpcy5wcm9wcy5hZGRMYWJlbFRleHQucmVwbGFjZSgne2xhYmVsfScsIGdldExhYmVsKG9iaikpIDogcmVuZGVyZWRMYWJlbCB9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBPcHRpb247XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgU2luZ2xlVmFsdWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHByb3BUeXBlczoge1xuXHRcdHBsYWNlaG9sZGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAvLyB0aGlzIGlzIGRlZmF1bHQgdmFsdWUgcHJvdmlkZWQgYnkgUmVhY3QtU2VsZWN0IGJhc2VkIGNvbXBvbmVudFxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0ICAgICAgICAgICAgICAvLyBzZWxlY3RlZCBvcHRpb25cblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtcGxhY2Vob2xkZXJcIj57dGhpcy5wcm9wcy5wbGFjZWhvbGRlcn08L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5nbGVWYWx1ZTtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgZ2V0TGFiZWwgPSByZXF1aXJlKCcuL2ltbXV0YWJsZS91dGlscycpLmdldExhYmVsO1xuXG52YXIgVmFsdWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0ZGlzcGxheU5hbWU6ICdWYWx1ZScsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgICAgICAvLyBkaXNhYmxlZCBwcm9wIHBhc3NlZCB0byBSZWFjdFNlbGVjdFxuXHRcdG9uT3B0aW9uTGFiZWxDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSBjbGljayBvbiB2YWx1ZSBsYWJlbFxuXHRcdG9uUmVtb3ZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSByZW1vdmUgb2YgdGhhdCB2YWx1ZVxuXHRcdG9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgICAgLy8gb3B0aW9uIHBhc3NlZCB0byBjb21wb25lbnRcblx0XHRvcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIGluZGljYXRlcyBpZiBvbk9wdGlvbkxhYmVsQ2xpY2sgc2hvdWxkIGJlIGhhbmRsZWRcblx0XHRyZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMgICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byByZW5kZXIgb3B0aW9uIGxhYmVsIHBhc3NlZCB0byBSZWFjdFNlbGVjdFxuXHR9LFxuXG5cdGJsb2NrRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdH0sXG5cblx0aGFuZGxlT25SZW1vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLmRpc2FibGVkKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uUmVtb3ZlKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGFiZWwgPSBnZXRMYWJlbCh0aGlzLnByb3BzLm9wdGlvbik7XG5cdFx0aWYgKHRoaXMucHJvcHMucmVuZGVyZXIpIHtcblx0XHRcdGxhYmVsID0gdGhpcy5wcm9wcy5yZW5kZXJlcih0aGlzLnByb3BzLm9wdGlvbik7XG5cdFx0fVxuXG5cdFx0aWYoIXRoaXMucHJvcHMub25SZW1vdmUgJiYgIXRoaXMucHJvcHMub3B0aW9uTGFiZWxDbGljaykge1xuXHRcdFx0cmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LXZhbHVlXCI+e2xhYmVsfTwvZGl2Pjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wcm9wcy5vcHRpb25MYWJlbENsaWNrKSB7XG5cdFx0XHRsYWJlbCA9IChcblx0XHRcdFx0PGEgY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW0tbGFiZWxfX2FcIlxuXHRcdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLmJsb2NrRXZlbnR9XG5cdFx0XHRcdFx0b25Ub3VjaEVuZD17dGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2t9XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2t9PlxuXHRcdFx0XHRcdHtsYWJlbH1cblx0XHRcdFx0PC9hPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbVwiPlxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbS1pY29uXCJcblx0XHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5ibG9ja0V2ZW50fVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMuaGFuZGxlT25SZW1vdmV9XG5cdFx0XHRcdFx0b25Ub3VjaEVuZD17dGhpcy5oYW5kbGVPblJlbW92ZX0+JnRpbWVzOzwvc3Bhbj5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW0tbGFiZWxcIj57bGFiZWx9PC9zcGFuPlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWYWx1ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy9zb3VyY2U6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbmRcbmlmICghQXJyYXkucHJvdG90eXBlLmZpbmQpIHtcbiAgQXJyYXkucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICBpZiAodGhpcyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkucHJvdG90eXBlLmZpbmQgY2FsbGVkIG9uIG51bGwgb3IgdW5kZWZpbmVkJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHZhciBsaXN0ID0gT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCA+Pj4gMDtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGlzSW1tdXRhYmxlKG9iail7XG5cdHJldHVybiBvYmogIT0gbnVsbCAmJiB0eXBlb2Ygb2JqLnRvSlMgPT0gJ2Z1bmN0aW9uJ1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZVByb3Aob2JqLCBwcm9wZXJ0eSl7XG4gIGlmKCFvYmopIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZihpc0ltbXV0YWJsZShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5nZXQocHJvcGVydHkpO1xuICB9XG4gIHJldHVybiBvYmpbcHJvcGVydHldO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmope1xuICByZXR1cm4gZ2V0VmFsdWVQcm9wKG9iaiwgJ3ZhbHVlJyk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsKG9iail7XG4gIHJldHVybiBnZXRWYWx1ZVByb3Aob2JqLCAnbGFiZWwnKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGVuZ3RoKG9iail7XG5cdGlmKCFvYmopIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICBpZihpc0ltbXV0YWJsZShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5zaXplXG4gIH1cbiAgcmV0dXJuIG9iai5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGdldEF0KG9iaiwgaW5kZXgpIHtcblx0aWYoIW9iail7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYoaXNJbW11dGFibGUob2JqKSl7XG5cdFx0cmV0dXJuIG9iai5nZXQoaW5kZXgpO1xuXHR9XG5cblx0cmV0dXJuIG9ialtpbmRleF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRpc0ltbXV0YWJsZTogaXNJbW11dGFibGUsXG5cdGdldFZhbHVlOiBnZXRWYWx1ZSxcblx0Z2V0TGFiZWw6IGdldExhYmVsLFxuXHRnZXRWYWx1ZVByb3A6IGdldFZhbHVlUHJvcCxcblx0Z2V0TGVuZ3RoOiBnZXRMZW5ndGgsXG5cdGdldEF0OiBnZXRBdFxufTtcbiIsIi8qIGRpc2FibGUgc29tZSBydWxlcyB1bnRpbCB3ZSByZWZhY3RvciBtb3JlIGNvbXBsZXRlbHk7IGZpeGluZyB0aGVtIG5vdyB3b3VsZFxuICAgY2F1c2UgY29uZmxpY3RzIHdpdGggc29tZSBvcGVuIFBScyB1bm5lY2Vzc2FyaWx5LiAqL1xuLyogZXNsaW50IHJlYWN0L2pzeC1zb3J0LXByb3AtdHlwZXM6IDAsIHJlYWN0L3NvcnQtY29tcDogMCwgcmVhY3QvcHJvcC10eXBlczogMCAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIElucHV0ID0gcmVxdWlyZSgncmVhY3QtaW5wdXQtYXV0b3NpemUnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xudmFyIFZhbHVlID0gcmVxdWlyZSgnLi9WYWx1ZScpO1xudmFyIFNpbmdsZVZhbHVlID0gcmVxdWlyZSgnLi9TaW5nbGVWYWx1ZScpO1xudmFyIE9wdGlvbiA9IHJlcXVpcmUoJy4vT3B0aW9uJyk7XG52YXIgTGF6eVJlbmRlciA9IHJlcXVpcmUoJy4vTGF6eVJlbmRlcicpO1xudmFyIGltbXV0YWJsZVV0aWxzID0gcmVxdWlyZSgnLi9pbW11dGFibGUvdXRpbHMnKTtcbnJlcXVpcmUoJy4vYXJyYXlGaW5kUG9seWZpbGwnKTtcblxudmFyIGlzSW1tdXRhYmxlID0gaW1tdXRhYmxlVXRpbHMuaXNJbW11dGFibGUsXG5cdFx0Z2V0VmFsdWUgPSBpbW11dGFibGVVdGlscy5nZXRWYWx1ZSxcblx0XHRnZXRMYWJlbCA9IGltbXV0YWJsZVV0aWxzLmdldExhYmVsLFxuXHRcdGdldFZhbHVlUHJvcCA9IGltbXV0YWJsZVV0aWxzLmdldFZhbHVlUHJvcCxcblx0XHRnZXRMZW5ndGggPSBpbW11dGFibGVVdGlscy5nZXRMZW5ndGgsXG5cdFx0Z2V0QXQgPSBpbW11dGFibGVVdGlscy5nZXRBdDtcblxudmFyIHJlcXVlc3RJZCA9IDA7XG5cbi8vIHRlc3QgYnkgdmFsdWUsIHBvciBlaWQgaWYgYXZhaWxhYmxlXG52YXIgaXNFcXVhbFZhbHVlID0gZnVuY3Rpb24odjEsIHYyKSB7XG4gIHJldHVybiBJbW11dGFibGUuaXModjEsIHYyKSB8fCAoXG4gICAgdjEgJiYgdjIgJiYgdjEuaGFzICYmIHYxLmhhcygnZWlkJykgJiZcbiAgICBJbW11dGFibGUuaXModjEuZ2V0KCdlaWQnKSwgdjIuZ2V0KCdlaWQnKSlcbiAgKTtcbn07XG5cbnZhciBjb21wYXJlT3B0aW9ucyA9IGZ1bmN0aW9uKG9wczEsIG9wczIpe1xuXHRyZXR1cm4gaXNJbW11dGFibGUob3BzMSwgb3BzMikgPyBcblx0XHRcdFx0XHRJbW11dGFibGUuaXMob3BzMSwgb3BzMikgOiBcblx0XHRcdFx0XHRKU09OLnN0cmluZ2lmeShvcHMxKSA9PT0gSlNPTi5zdHJpbmdpZnkob3BzMik7XG59O1xuXG52YXIgU2VsZWN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnU2VsZWN0JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRhZGRMYWJlbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4geW91IHdhbnQgdG8gYWRkIGEgbGFiZWwgb24gYSBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdGFsbG93Q3JlYXRlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAvLyB3aGV0aGVyIHRvIGFsbG93IGNyZWF0aW9uIG9mIG5ldyBlbnRyaWVzXG5cdFx0YXN5bmNPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGNhbGwgdG8gZ2V0IG9wdGlvbnNcblx0XHRhdXRvbG9hZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgLy8gd2hldGhlciB0byBhdXRvLWxvYWQgdGhlIGRlZmF1bHQgYXN5bmMgb3B0aW9ucyBzZXRcblx0XHRiYWNrc3BhY2VSZW1vdmVzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgLy8gd2hldGhlciBiYWNrc3BhY2UgcmVtb3ZlcyBhbiBpdGVtIGlmIHRoZXJlIGlzIG5vIHRleHQgaW5wdXRcblx0XHRjYWNoZUFzeW5jUmVzdWx0czogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgLy8gd2hldGhlciB0byBhbGxvdyBjYWNoZVxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyBjbGFzc05hbWUgZm9yIHRoZSBvdXRlciBlbGVtZW50XG5cdFx0Y2xlYXJBbGxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgIC8vIHRpdGxlIGZvciB0aGUgXCJjbGVhclwiIGNvbnRyb2wgd2hlbiBtdWx0aTogdHJ1ZVxuXHRcdGNsZWFyVmFsdWVUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sXG5cdFx0Y2xlYXJhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIHNob3VsZCBpdCBiZSBwb3NzaWJsZSB0byByZXNldCB2YWx1ZVxuXHRcdGRlbGltaXRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyBkZWxpbWl0ZXIgdG8gdXNlIHRvIGpvaW4gbXVsdGlwbGUgdmFsdWVzXG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdGhlIFNlbGVjdCBpcyBkaXNhYmxlZCBvciBub3Rcblx0XHRmaWx0ZXJPcHRpb246IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciBhIHNpbmdsZSBvcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgZmlsdGVyU3RyaW5nKVxuXHRcdGZpbHRlck9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAvLyBtZXRob2QgdG8gZmlsdGVyIHRoZSBvcHRpb25zIGFycmF5OiBmdW5jdGlvbihbb3B0aW9uc10sIGZpbHRlclN0cmluZywgW3ZhbHVlc10pXG5cdFx0aWdub3JlQ2FzZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgIC8vIHdoZXRoZXIgdG8gcGVyZm9ybSBjYXNlLWluc2Vuc2l0aXZlIGZpbHRlcmluZ1xuXHRcdGlucHV0UHJvcHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsICAgICAgICAvLyBjdXN0b20gYXR0cmlidXRlcyBmb3IgdGhlIElucHV0IChpbiB0aGUgU2VsZWN0LWNvbnRyb2wpIGUuZzogeydkYXRhLWZvbyc6ICdiYXInfVxuXHRcdG1hdGNoUG9zOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyAoYW55fHN0YXJ0KSBtYXRjaCB0aGUgc3RhcnQgb3IgZW50aXJlIHN0cmluZyB3aGVuIGZpbHRlcmluZ1xuXHRcdG1hdGNoUHJvcDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyAoYW55fGxhYmVsfHZhbHVlKSB3aGljaCBvcHRpb24gcHJvcGVydHkgdG8gZmlsdGVyIG9uXG5cdFx0bXVsdGk6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgIC8vIG11bHRpLXZhbHVlIGlucHV0XG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgICAgIC8vIGZpZWxkIG5hbWUsIGZvciBoaWRkZW4gPGlucHV0IC8+IHRhZ1xuXHRcdG5ld09wdGlvbkNyZWF0b3I6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAvLyBmYWN0b3J5IHRvIGNyZWF0ZSBuZXcgb3B0aW9ucyB3aGVuIGFsbG93Q3JlYXRlIHNldFxuXHRcdG5vUmVzdWx0c1RleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAvLyBwbGFjZWhvbGRlciBkaXNwbGF5ZWQgd2hlbiB0aGVyZSBhcmUgbm8gbWF0Y2hpbmcgc2VhcmNoIHJlc3VsdHNcblx0XHRvbkJsdXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgLy8gb25CbHVyIGhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7fVxuXHRcdG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAvLyBvbkNoYW5nZSBoYW5kbGVyOiBmdW5jdGlvbihuZXdWYWx1ZSkge31cblx0XHRvbkZvY3VzOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgLy8gb25Gb2N1cyBoYW5kbGVyOiBmdW5jdGlvbihldmVudCkge31cblx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgLy8gb25DTGljayBoYW5kbGVyIGZvciB2YWx1ZSBsYWJlbHM6IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHt9XG5cdFx0b3B0aW9uQ29tcG9uZW50OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgIC8vIG9wdGlvbiBjb21wb25lbnQgdG8gcmVuZGVyIGluIGRyb3Bkb3duXG5cdFx0b3B0aW9uUmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgIC8vIG9wdGlvblJlbmRlcmVyOiBmdW5jdGlvbihvcHRpb24pIHt9XG5cdFx0b3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuaW5zdGFuY2VPZihJbW11dGFibGUuTGlzdClcbiAgICBdKSwgICAgICAgICAgIFx0IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0IC8vIGFycmF5IG9mIG9wdGlvbnNcblx0XHRwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gZmllbGQgcGxhY2Vob2xkZXIsIGRpc3BsYXllZCB3aGVuIHRoZXJlJ3Mgbm8gdmFsdWVcblx0XHRzZWFyY2hhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgLy8gd2hldGhlciB0byBlbmFibGUgc2VhcmNoaW5nIGZlYXR1cmUgb3Igbm90XG5cdFx0c2VhcmNoUHJvbXB0VGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgIC8vIGxhYmVsIHRvIHByb21wdCBmb3Igc2VhcmNoIGlucHV0XG5cdFx0c2luZ2xlVmFsdWVDb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLC8vIHNpbmdsZSB2YWx1ZSBjb21wb25lbnQgd2hlbiBtdWx0aXBsZSBpcyBzZXQgdG8gZmFsc2Vcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLmFueSwgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBmaWVsZCB2YWx1ZVxuXHRcdHZhbHVlQ29tcG9uZW50OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAvLyB2YWx1ZSBjb21wb25lbnQgdG8gcmVuZGVyIGluIG11bHRpcGxlIG1vZGVcblx0XHR2YWx1ZVJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgLy8gdmFsdWVSZW5kZXJlcjogZnVuY3Rpb24ob3B0aW9uKSB7fVxuXHRcdHN0eWxlTWVudU91dGVyOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LCBcdCAvLyBzdHlsZU1lbnVPdXRlcjogc3R5bGUgb2JqZWN0IHVzZWQgYnkgbWVudSBkcm9wZG93blxuXHRcdGxhenk6IFJlYWN0LlByb3BUeXBlcy5ib29sXHRcdFx0XHRcdFx0XHRcdCAvLyBsYXp5OiB1c2UgTGF6eVJlbmRlciBmb3IgZHJvcGRvd24gaXRlbXNcblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhZGRMYWJlbFRleHQ6ICdBZGljaW9uYXIge2xhYmVsfSA/Jyxcblx0XHRcdGFsbG93Q3JlYXRlOiBmYWxzZSxcblx0XHRcdGFzeW5jT3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0YXV0b2xvYWQ6IHRydWUsXG5cdFx0XHRiYWNrc3BhY2VSZW1vdmVzOiB0cnVlLFxuXHRcdFx0Y2FjaGVBc3luY1Jlc3VsdHM6IHRydWUsXG5cdFx0XHRjbGFzc05hbWU6IHVuZGVmaW5lZCxcblx0XHRcdGNsZWFyQWxsVGV4dDogJ0xpbXBhciB0b2RvcycsXG5cdFx0XHRjbGVhclZhbHVlVGV4dDogJ0xpbXBhcicsXG5cdFx0XHRjbGVhcmFibGU6IHRydWUsXG5cdFx0XHRkZWxpbWl0ZXI6ICcsJyxcblx0XHRcdGRpc2FibGVkOiBmYWxzZSxcblx0XHRcdGlnbm9yZUNhc2U6IHRydWUsXG5cdFx0XHRpbnB1dFByb3BzOiB7fSxcblx0XHRcdG1hdGNoUG9zOiAnYW55Jyxcblx0XHRcdG1hdGNoUHJvcDogJ2FueScsXG5cdFx0XHRuYW1lOiB1bmRlZmluZWQsXG5cdFx0XHRuZXdPcHRpb25DcmVhdG9yOiB1bmRlZmluZWQsXG5cdFx0XHRub1Jlc3VsdHNUZXh0OiAnTmVuaHVtIHJlc3VsdGFkbyBlbmNvbnRyYWRvJyxcblx0XHRcdG9uQ2hhbmdlOiB1bmRlZmluZWQsXG5cdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IHVuZGVmaW5lZCxcblx0XHRcdG9wdGlvbkNvbXBvbmVudDogT3B0aW9uLFxuXHRcdFx0b3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0cGxhY2Vob2xkZXI6ICdTZWxlY2lvbmUuLi4nLFxuXHRcdFx0c2VhcmNoYWJsZTogdHJ1ZSxcblx0XHRcdHNlYXJjaFByb21wdFRleHQ6ICdEaWdpdGUgcGFyYSBidXNjYXInLFxuXHRcdFx0c2luZ2xlVmFsdWVDb21wb25lbnQ6IFNpbmdsZVZhbHVlLFxuXHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdHZhbHVlQ29tcG9uZW50OiBWYWx1ZSxcblx0XHRcdGxhenk6IGZhbHNlLFxuXHRcdFx0c3R5bGVNZW51T3V0ZXI6IHt9XG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHQvKlxuXHRcdFx0ICogc2V0IGJ5IGdldFN0YXRlRnJvbVZhbHVlIG9uIGNvbXBvbmVudFdpbGxNb3VudDpcblx0XHRcdCAqIC0gdmFsdWVcblx0XHRcdCAqIC0gdmFsdWVzXG5cdFx0XHQgKiAtIGZpbHRlcmVkT3B0aW9uc1xuXHRcdFx0ICogLSBpbnB1dFZhbHVlXG5cdFx0XHQgKiAtIHBsYWNlaG9sZGVyXG5cdFx0XHQgKiAtIGZvY3VzZWRPcHRpb25cblx0XHRcdCovXG5cdFx0XHRpc0ZvY3VzZWQ6IGZhbHNlLFxuXHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdGlzT3BlbjogZmFsc2UsXG5cdFx0XHRvcHRpb25zOiB0aGlzLnByb3BzLm9wdGlvbnNcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fb3B0aW9uc0NhY2hlID0ge307XG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9ICcnO1xuXHRcdHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSAoZXZlbnQpID0+IHtcblx0XHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1lbnVFbGVtID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnNlbGVjdE1lbnVDb250YWluZXIpO1xuXHRcdFx0dmFyIGNvbnRyb2xFbGVtID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmNvbnRyb2wpO1xuXG5cdFx0XHR2YXIgZXZlbnRPY2N1cmVkT3V0c2lkZU1lbnUgPSB0aGlzLmNsaWNrZWRPdXRzaWRlRWxlbWVudChtZW51RWxlbSwgZXZlbnQpO1xuXHRcdFx0dmFyIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sID0gdGhpcy5jbGlja2VkT3V0c2lkZUVsZW1lbnQoY29udHJvbEVsZW0sIGV2ZW50KTtcblxuXHRcdFx0Ly8gSGlkZSBkcm9wZG93biBtZW51IGlmIGNsaWNrIG9jY3VycmVkIG91dHNpZGUgb2YgbWVudVxuXHRcdFx0aWYgKGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ICYmIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sKSB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHRcdFx0fSwgdGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCFkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICYmIGRvY3VtZW50LmF0dGFjaEV2ZW50KSB7XG5cdFx0XHRcdGRvY3VtZW50LmF0dGFjaEV2ZW50KCdvbmNsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCFkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICYmIGRvY3VtZW50LmRldGFjaEV2ZW50KSB7XG5cdFx0XHRcdGRvY3VtZW50LmRldGFjaEV2ZW50KCdvbmNsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlRnJvbVZhbHVlKHRoaXMucHJvcHMudmFsdWUpKTtcblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zICYmIHRoaXMucHJvcHMuYXV0b2xvYWQpIHtcblx0XHRcdHRoaXMuYXV0b2xvYWRBc3luY09wdGlvbnMoKTtcblx0XHR9XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9ibHVyVGltZW91dCk7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2ZvY3VzVGltZW91dCk7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5ld1Byb3BzKSB7XG5cdFx0dmFyIG9wdGlvbnNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0aWYgKCFjb21wYXJlT3B0aW9ucyhuZXdQcm9wcy5vcHRpb25zLCB0aGlzLnByb3BzLm9wdGlvbnMpKSB7XG5cdFx0XHRvcHRpb25zQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0b3B0aW9uczogbmV3UHJvcHMub3B0aW9ucyxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiB0aGlzLmZpbHRlck9wdGlvbnMobmV3UHJvcHMub3B0aW9ucylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAoIWlzRXF1YWxWYWx1ZShuZXdQcm9wcy52YWx1ZSwgdGhpcy5zdGF0ZS52YWx1ZSkgfHwgbmV3UHJvcHMucGxhY2Vob2xkZXIgIT09IHRoaXMucHJvcHMucGxhY2Vob2xkZXIgfHwgb3B0aW9uc0NoYW5nZWQpIHtcblx0XHRcdHZhciBzZXRTdGF0ZSA9IChuZXdTdGF0ZSkgPT4ge1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUobmV3UHJvcHMudmFsdWUsXG5cdFx0XHRcdFx0KG5ld1N0YXRlICYmIG5ld1N0YXRlLm9wdGlvbnMpIHx8IG5ld1Byb3BzLm9wdGlvbnMsXG5cdFx0XHRcdFx0bmV3UHJvcHMucGxhY2Vob2xkZXIpXG5cdFx0XHRcdCk7XG5cdFx0XHR9O1xuXHRcdFx0aWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zKSB7XG5cdFx0XHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucyhuZXdQcm9wcy52YWx1ZSwge30sIHNldFN0YXRlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNldFN0YXRlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLmRpc2FibGVkICYmIHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9ibHVyVGltZW91dCk7XG5cdFx0XHR0aGlzLl9mb2N1c1RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHRcdFx0XHR0aGlzLl9mb2N1c0FmdGVyVXBkYXRlID0gZmFsc2U7XG5cdFx0XHR9LCA1MCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsKSB7XG5cdFx0XHRpZiAodGhpcy5yZWZzLmZvY3VzZWQgJiYgdGhpcy5yZWZzLm1lbnUpIHtcblx0XHRcdFx0dmFyIGZvY3VzZWRET00gPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZm9jdXNlZCk7XG5cdFx0XHRcdHZhciBtZW51RE9NID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLm1lbnUpO1xuXHRcdFx0XHR2YXIgZm9jdXNlZFJlY3QgPSBmb2N1c2VkRE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHR2YXIgbWVudVJlY3QgPSBtZW51RE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdGlmIChmb2N1c2VkUmVjdC5ib3R0b20gPiBtZW51UmVjdC5ib3R0b20gfHwgZm9jdXNlZFJlY3QudG9wIDwgbWVudVJlY3QudG9wKSB7XG5cdFx0XHRcdFx0bWVudURPTS5zY3JvbGxUb3AgPSAoZm9jdXNlZERPTS5vZmZzZXRUb3AgKyBmb2N1c2VkRE9NLmNsaWVudEhlaWdodCAtIG1lbnVET00ub2Zmc2V0SGVpZ2h0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCA9IGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHRmb2N1czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHR9LFxuXG5cdGNsaWNrZWRPdXRzaWRlRWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCwgZXZlbnQpIHtcblx0XHR2YXIgZXZlbnRUYXJnZXQgPSAoZXZlbnQudGFyZ2V0KSA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnNyY0VsZW1lbnQ7XG5cdFx0d2hpbGUgKGV2ZW50VGFyZ2V0ICE9IG51bGwpIHtcblx0XHRcdGlmIChldmVudFRhcmdldCA9PT0gZWxlbWVudCkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0ZXZlbnRUYXJnZXQgPSBldmVudFRhcmdldC5vZmZzZXRQYXJlbnQ7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdGdldFN0YXRlRnJvbVZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucywgcGxhY2Vob2xkZXIpIHtcblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnM7XG5cdFx0fVxuXHRcdGlmICghcGxhY2Vob2xkZXIpIHtcblx0XHRcdHBsYWNlaG9sZGVyID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlcjtcblx0XHR9XG5cblx0XHQvLyByZXNldCBpbnRlcm5hbCBmaWx0ZXIgc3RyaW5nXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9ICcnO1xuXG5cdFx0dmFyIHZhbHVlcyA9IHRoaXMuaW5pdFZhbHVlc0FycmF5KHZhbHVlLCBvcHRpb25zKTtcblx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKG9wdGlvbnMsIHZhbHVlcyk7XG5cblx0XHR2YXIgZm9jdXNlZE9wdGlvbjtcblx0XHR2YXIgdmFsdWVGb3JTdGF0ZSA9IG51bGw7XG5cdFx0aWYgKCF0aGlzLnByb3BzLm11bHRpICYmIGdldExlbmd0aCh2YWx1ZXMpKSB7XG5cdFx0XHRmb2N1c2VkT3B0aW9uID0gZ2V0QXQodmFsdWVzLCAwKTs7XG5cdFx0XHR2YWx1ZUZvclN0YXRlID0gZ2V0VmFsdWUoZ2V0QXQodmFsdWVzLCAwKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAodmFyIG9wdGlvbkluZGV4ID0gMDsgb3B0aW9uSW5kZXggPCBnZXRMZW5ndGgoZmlsdGVyZWRPcHRpb25zKTsgKytvcHRpb25JbmRleCkge1xuXHRcdFx0XHR2YXIgb3B0aW9uID0gZ2V0QXQoZmlsdGVyZWRPcHRpb25zLCBvcHRpb25JbmRleCk7XG5cdFx0XHRcdGlmICghZ2V0VmFsdWVQcm9wKG9wdGlvbiwgJ2Rpc2FibGVkJykpIHtcblx0XHRcdFx0XHRmb2N1c2VkT3B0aW9uID0gb3B0aW9uO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR2YWx1ZUZvclN0YXRlID0gdmFsdWVzLm1hcChmdW5jdGlvbih2KSB7IHJldHVybiBnZXRWYWx1ZSh2KTsgfSkuam9pbih0aGlzLnByb3BzLmRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHZhbHVlOiB2YWx1ZUZvclN0YXRlLFxuXHRcdFx0dmFsdWVzOiB2YWx1ZXMsXG5cdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0cGxhY2Vob2xkZXI6ICF0aGlzLnByb3BzLm11bHRpICYmIGdldExlbmd0aCh2YWx1ZXMpID8gZ2V0TGFiZWwoZ2V0QXQodmFsdWVzLCAwKSkgOiBwbGFjZWhvbGRlcixcblx0XHRcdGZvY3VzZWRPcHRpb246IGZvY3VzZWRPcHRpb25cblx0XHR9O1xuXHR9LFxuXG5cdGluaXRWYWx1ZXNBcnJheTogZnVuY3Rpb24odmFsdWVzLCBvcHRpb25zKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykgJiYgIUltbXV0YWJsZS5JdGVyYWJsZS5pc0luZGV4ZWQodmFsdWVzKSkge1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZXMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdHZhbHVlcyA9IHZhbHVlcyA9PT0gJycgPyBJbW11dGFibGUuTGlzdCgpIDogSW1tdXRhYmxlLkxpc3QodmFsdWVzLnNwbGl0KHRoaXMucHJvcHMuZGVsaW1pdGVyKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZXMgIT09IG51bGwgPyBJbW11dGFibGUuTGlzdChbdmFsdWVzXSkgOiBJbW11dGFibGUuTGlzdCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWVzLm1hcChmdW5jdGlvbih2YWwpIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucy5maW5kKG9wID0+IHtcblx0XHRcdFx0XHR2YXIgb3BWYWx1ZSA9IGdldFZhbHVlKG9wKTtcblxuXHRcdFx0XHRcdHJldHVybiBpc0VxdWFsVmFsdWUob3BWYWx1ZSwgdmFsKSB8fCB0eXBlb2Ygb3BWYWx1ZSA9PT0gJ251bWJlcicgJiYgb3BWYWx1ZS50b1N0cmluZygpID09PSB2YWxcblx0XHRcdFx0fSkgfHwgSW1tdXRhYmxlLk1hcCh7IHZhbHVlOiB2YWwsIGxhYmVsOiB2YWwgfSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdmFsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgZm9jdXNBZnRlclVwZGF0ZSkge1xuXHRcdGlmIChmb2N1c0FmdGVyVXBkYXRlIHx8IGZvY3VzQWZ0ZXJVcGRhdGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fZm9jdXNBZnRlclVwZGF0ZSA9IHRydWU7XG5cdFx0fVxuXHRcdHZhciBuZXdTdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUodmFsdWUpO1xuXHRcdG5ld1N0YXRlLmlzT3BlbiA9IGZhbHNlO1xuXHRcdHRoaXMuZmlyZUNoYW5nZUV2ZW50KG5ld1N0YXRlKTtcblx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcblx0fSxcblxuXHRzZWxlY3RWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUodmFsdWUpO1xuXHRcdH0gZWxzZSBpZiAodmFsdWUpIHtcblx0XHRcdHRoaXMuYWRkVmFsdWUodmFsdWUpO1xuXHRcdH1cblx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdH0sXG5cblx0YWRkVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYoaXNJbW11dGFibGUodmFsdWUpICYmIGlzSW1tdXRhYmxlKHRoaXMuc3RhdGUudmFsdWVzKSl7XG5cdFx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLnB1c2godmFsdWUpKTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMuc2V0VmFsdWUodGhpcy5zdGF0ZS52YWx1ZXMuY29uY2F0KHZhbHVlKSk7XG5cdFx0fVxuXHR9LFxuXG5cdHBvcFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLnNsaWNlKDAsIGdldExlbmd0aCh0aGlzLnN0YXRlLnZhbHVlcykgLSAxKSk7XG5cdH0sXG5cblx0cmVtb3ZlVmFsdWU6IGZ1bmN0aW9uKHZhbHVlVG9SZW1vdmUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmZpbHRlcihmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlICE9PSB2YWx1ZVRvUmVtb3ZlO1xuXHRcdH0pKTtcblx0fSxcblxuXHRjbGVhclZhbHVlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIGlnbm9yZSBpdC5cblx0XHRpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5zZXRWYWx1ZShudWxsKTtcblx0fSxcblxuXHRyZXNldFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWUgPT09ICcnID8gbnVsbCA6IHRoaXMuc3RhdGUudmFsdWUpO1xuXHR9LFxuXG5cdGdldElucHV0Tm9kZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpbnB1dCA9IHRoaXMucmVmcy5pbnB1dDtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5zZWFyY2hhYmxlID8gaW5wdXQgOiBSZWFjdC5maW5kRE9NTm9kZShpbnB1dCk7XG5cdH0sXG5cblx0ZmlyZUNoYW5nZUV2ZW50OiBmdW5jdGlvbihuZXdTdGF0ZSkge1xuXHRcdGlmIChuZXdTdGF0ZS52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSAmJiB0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1N0YXRlLnZhbHVlLCBuZXdTdGF0ZS52YWx1ZXMpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVNb3VzZURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdC8vIGJ1dHRvbiwgb3IgaWYgdGhlIGNvbXBvbmVudCBpcyBkaXNhYmxlZCwgaWdub3JlIGl0LlxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8IChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNGb2N1c2VkKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gdHJ1ZTtcblx0XHRcdHRoaXMuZ2V0SW5wdXROb2RlKCkuZm9jdXMoKTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duT25BcnJvdzogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly8gSWYgbm90IGZvY3VzZWQsIGhhbmRsZU1vdXNlRG93biB3aWxsIGhhbmRsZSBpdFxuXHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9LCB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0fSxcblxuXHRoYW5kbGVJbnB1dEZvY3VzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBuZXdJc09wZW4gPSB0aGlzLnN0YXRlLmlzT3BlbiB8fCB0aGlzLl9vcGVuQWZ0ZXJGb2N1cztcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzRm9jdXNlZDogdHJ1ZSxcblx0XHRcdGlzT3BlbjogbmV3SXNPcGVuXG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZihuZXdJc09wZW4pIHtcblx0XHRcdFx0dGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fb3BlbkFmdGVyRm9jdXMgPSBmYWxzZTtcblx0XHRpZiAodGhpcy5wcm9wcy5vbkZvY3VzKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uRm9jdXMoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVJbnB1dEJsdXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dGhpcy5fYmx1clRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGlmICh0aGlzLl9mb2N1c0FmdGVyVXBkYXRlKSByZXR1cm47XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNGb2N1c2VkOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0fSwgNTApO1xuXHRcdGlmICh0aGlzLnByb3BzLm9uQmx1cikge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkJsdXIoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVLZXlEb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSByZXR1cm47XG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIDg6IC8vIGJhY2tzcGFjZVxuXHRcdFx0XHRpZiAoIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSAmJiB0aGlzLnByb3BzLmJhY2tzcGFjZVJlbW92ZXMpIHtcblx0XHRcdFx0XHR0aGlzLnBvcFZhbHVlKCk7XG5cdFx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgOTogLy8gdGFiXG5cdFx0XHRcdGlmIChldmVudC5zaGlmdEtleSB8fCAhdGhpcy5zdGF0ZS5pc09wZW4gfHwgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxMzogLy8gZW50ZXJcblx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3BlbikgcmV0dXJuO1xuXG5cdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI3OiAvLyBlc2NhcGVcblx0XHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXNldFZhbHVlKCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5wcm9wcy5jbGVhcmFibGUpIHtcblx0XHRcdFx0XHR0aGlzLmNsZWFyVmFsdWUoZXZlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzg6IC8vIHVwXG5cdFx0XHRcdHRoaXMuZm9jdXNQcmV2aW91c09wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDQwOiAvLyBkb3duXG5cdFx0XHRcdHRoaXMuZm9jdXNOZXh0T3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTg4OiAvLyAsXG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmIHRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OiByZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cblx0Ly8gRW5zdXJlcyB0aGF0IHRoZSBjdXJyZW50bHkgZm9jdXNlZCBvcHRpb24gaXMgYXZhaWxhYmxlIGluIGZpbHRlcmVkT3B0aW9ucy5cblx0Ly8gSWYgbm90LCByZXR1cm5zIHRoZSBmaXJzdCBhdmFpbGFibGUgb3B0aW9uLlxuXHRfZ2V0TmV3Rm9jdXNlZE9wdGlvbjogZnVuY3Rpb24oZmlsdGVyZWRPcHRpb25zKSB7XG5cdFx0dmFyIGZvY3VzZWRPcHRpb24gPSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb25cblx0XHRyZXR1cm4gZmlsdGVyZWRPcHRpb25zLmZpbmQob3AgPT4gb3AgPT09IGZvY3VzZWRPcHRpb24pIHx8IGdldEF0KGZpbHRlcmVkT3B0aW9ucywgMCk7XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gYXNzaWduIGFuIGludGVybmFsIHZhcmlhYmxlIGJlY2F1c2Ugd2UgbmVlZCB0byB1c2Vcblx0XHQvLyB0aGUgbGF0ZXN0IHZhbHVlIGJlZm9yZSBzZXRTdGF0ZSgpIGhhcyBjb21wbGV0ZWQuXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzTG9hZGluZzogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucyhldmVudC50YXJnZXQudmFsdWUsIHtcblx0XHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH1cblx0fSxcblxuXHRhdXRvbG9hZEFzeW5jT3B0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5sb2FkQXN5bmNPcHRpb25zKCh0aGlzLnByb3BzLnZhbHVlIHx8ICcnKSwge30sICgpID0+IHtcblx0XHRcdC8vIHVwZGF0ZSB3aXRoIGZldGNoZWQgYnV0IGRvbid0IGZvY3VzXG5cdFx0XHR0aGlzLnNldFZhbHVlKHRoaXMucHJvcHMudmFsdWUsIGZhbHNlKTtcblx0XHR9KTtcblx0fSxcblxuXHRsb2FkQXN5bmNPcHRpb25zOiBmdW5jdGlvbihpbnB1dCwgc3RhdGUsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHRoaXNSZXF1ZXN0SWQgPSB0aGlzLl9jdXJyZW50UmVxdWVzdElkID0gcmVxdWVzdElkKys7XG5cdFx0aWYgKHRoaXMucHJvcHMuY2FjaGVBc3luY1Jlc3VsdHMpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDw9IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBjYWNoZUtleSA9IGlucHV0LnNsaWNlKDAsIGkpO1xuXHRcdFx0XHRpZiAodGhpcy5fb3B0aW9uc0NhY2hlW2NhY2hlS2V5XSAmJiAoaW5wdXQgPT09IGNhY2hlS2V5IHx8IHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0uY29tcGxldGUpKSB7XG5cdFx0XHRcdFx0dmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLm9wdGlvbnM7XG5cdFx0XHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zKTtcblx0XHRcdFx0XHR2YXIgbmV3U3RhdGUgPSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBzdGF0ZSkge1xuXHRcdFx0XHRcdFx0aWYgKHN0YXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRcdFx0bmV3U3RhdGVba2V5XSA9IHN0YXRlW2tleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuXHRcdFx0XHRcdGlmIChjYWxsYmFjaykgY2FsbGJhY2suY2FsbCh0aGlzLCBuZXdTdGF0ZSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9wcy5hc3luY09wdGlvbnMoaW5wdXQsIChlcnIsIGRhdGEpID0+IHtcblx0XHRcdGlmIChlcnIpIHRocm93IGVycjtcblx0XHRcdGlmICh0aGlzLnByb3BzLmNhY2hlQXN5bmNSZXN1bHRzKSB7XG5cdFx0XHRcdHRoaXMuX29wdGlvbnNDYWNoZVtpbnB1dF0gPSBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXNSZXF1ZXN0SWQgIT09IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhkYXRhLm9wdGlvbnMpO1xuXHRcdFx0dmFyIG5ld1N0YXRlID0ge1xuXHRcdFx0XHRvcHRpb25zOiBkYXRhLm9wdGlvbnMsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gc3RhdGUpIHtcblx0XHRcdFx0aWYgKHN0YXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRuZXdTdGF0ZVtrZXldID0gc3RhdGVba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdFx0XHRpZiAoY2FsbGJhY2spIGNhbGxiYWNrLmNhbGwodGhpcywgbmV3U3RhdGUpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGZpbHRlck9wdGlvbnM6IGZ1bmN0aW9uKG9wdGlvbnMsIHZhbHVlcykge1xuXHRcdHZhciBmaWx0ZXJWYWx1ZSA9IHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmc7XG5cdFx0dmFyIGV4Y2x1ZGUgPSAodmFsdWVzIHx8IHRoaXMuc3RhdGUudmFsdWVzKS5tYXAoZnVuY3Rpb24odikge1xuXHRcdFx0cmV0dXJuIGdldFZhbHVlKHYpO1xuXHRcdH0pO1xuXHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMpIHtcblx0XHRcdHJldHVybiB0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zLCBmaWx0ZXJWYWx1ZSwgZXhjbHVkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJPcHRpb24gPSBmdW5jdGlvbihvcCkge1xuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSAmJiBleGNsdWRlLmluZGV4T2YoZ2V0VmFsdWUob3ApKSA+IC0xKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbikgcmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uLmNhbGwodGhpcywgb3AsIGZpbHRlclZhbHVlKTtcblx0XHRcdFx0dmFyIHZhbHVlVGVzdCA9IFN0cmluZyhnZXRWYWx1ZShvcCkpLCBsYWJlbFRlc3QgPSBTdHJpbmcoZ2V0TGFiZWwob3ApKTtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMuaWdub3JlQ2FzZSkge1xuXHRcdFx0XHRcdHZhbHVlVGVzdCA9IHZhbHVlVGVzdC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdGxhYmVsVGVzdCA9IGxhYmVsVGVzdC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdGZpbHRlclZhbHVlID0gZmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gIWZpbHRlclZhbHVlIHx8ICh0aGlzLnByb3BzLm1hdGNoUG9zID09PSAnc3RhcnQnKSA/IChcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICdsYWJlbCcgJiYgdmFsdWVUZXN0LnN1YnN0cigwLCBmaWx0ZXJWYWx1ZS5sZW5ndGgpID09PSBmaWx0ZXJWYWx1ZSkgfHxcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScgJiYgbGFiZWxUZXN0LnN1YnN0cigwLCBmaWx0ZXJWYWx1ZS5sZW5ndGgpID09PSBmaWx0ZXJWYWx1ZSlcblx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICdsYWJlbCcgJiYgdmFsdWVUZXN0LmluZGV4T2YoZmlsdGVyVmFsdWUpID49IDApIHx8XG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAndmFsdWUnICYmIGxhYmVsVGVzdC5pbmRleE9mKGZpbHRlclZhbHVlKSA+PSAwKVxuXHRcdFx0XHQpO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiAob3B0aW9ucyB8fCBbXSkuZmlsdGVyKGZpbHRlck9wdGlvbiwgdGhpcyk7XG5cdFx0fVxuXHR9LFxuXG5cdHNlbGVjdEZvY3VzZWRPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmICF0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIHtcblx0XHRcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbik7XG5cdH0sXG5cblx0Zm9jdXNPcHRpb246IGZ1bmN0aW9uKG9wKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBvcFxuXHRcdH0pO1xuXHR9LFxuXG5cdGZvY3VzTmV4dE9wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCduZXh0Jyk7XG5cdH0sXG5cblx0Zm9jdXNQcmV2aW91c09wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCdwcmV2aW91cycpO1xuXHR9LFxuXG5cdGZvY3VzQWRqYWNlbnRPcHRpb246IGZ1bmN0aW9uKGRpcikge1xuXHRcdHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwgPSB0cnVlO1xuXHRcdHZhciBvcHMgPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24ob3ApIHtcblx0XHRcdHJldHVybiAhZ2V0VmFsdWVQcm9wKG9wLCAnZGlzYWJsZWQnKTtcblx0XHR9KTtcblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIHx8IGdldEF0KG9wcywgZGlyID09PSAnbmV4dCcgPyAwIDogZ2V0TGVuZ3RoKG9wcykgLSAxKVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoIWdldExlbmd0aChvcHMpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHZhciBmb2N1c2VkSW5kZXggPSAtMTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGdldExlbmd0aChvcHMpOyBpKyspIHtcblx0XHRcdGlmIChpc0VxdWFsVmFsdWUodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uLCBnZXRBdChvcHMsaSkpKSB7XG5cdFx0XHRcdGZvY3VzZWRJbmRleCA9IGk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgZm9jdXNlZE9wdGlvbiA9IGdldEF0KG9wcywgMCk7XG5cdFx0aWYgKGRpciA9PT0gJ25leHQnICYmIGZvY3VzZWRJbmRleCA+IC0xICYmIGZvY3VzZWRJbmRleCA8IGdldExlbmd0aChvcHMpIC0gMSkge1xuXHRcdFx0Zm9jdXNlZE9wdGlvbiA9IGdldEF0KG9wcywgZm9jdXNlZEluZGV4ICsgMSk7XG5cdFx0fSBlbHNlIGlmIChkaXIgPT09ICdwcmV2aW91cycpIHtcblx0XHRcdGlmIChmb2N1c2VkSW5kZXggPiAwKSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIGZvY3VzZWRJbmRleCAtIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbiA9IGdldEF0KG9wcywgZ2V0TGVuZ3RoKG9wcykgLSAxKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fSk7XG5cdH0sXG5cblx0dW5mb2N1c09wdGlvbjogZnVuY3Rpb24ob3ApIHtcblx0XHRpZiAoaXNFcXVhbFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiwgb3ApKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogbnVsbFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdGJ1aWxkTWVudTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZvY3VzZWRWYWx1ZSA9IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA/IGdldFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikgOiBudWxsO1xuXHRcdHZhciByZW5kZXJMYWJlbCA9IHRoaXMucHJvcHMub3B0aW9uUmVuZGVyZXIgfHwgZnVuY3Rpb24ob3ApIHtcblx0XHRcdHJldHVybiBnZXRMYWJlbChvcCk7XG5cdFx0fTtcblx0XHRpZiAoZ2V0TGVuZ3RoKHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zKSA+IDApIHtcblx0XHRcdGZvY3VzZWRWYWx1ZSA9IGZvY3VzZWRWYWx1ZSA9PSBudWxsID8gZ2V0QXQodGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMsIDApIDogZm9jdXNlZFZhbHVlO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zO1xuXG5cdFx0Ly9UT0RPOiBzdXBwb3J0IGFsbG93Q3JlYXRlIChpdCBtdXRhdGVzIGBvcHRpb25zYCwgd2hpY2ggaXMgc3VwcG9zZWQgdG8gYmUgaW1tdXRhYmxlLCBjYWxsaW5nIGB1bnNoaWZ0YCBiZWxvdylcblx0XHQvLyBBZGQgdGhlIGN1cnJlbnQgdmFsdWUgdG8gdGhlIGZpbHRlcmVkIG9wdGlvbnMgaW4gbGFzdCByZXNvcnRcblx0XHQvLyBpZiAodGhpcy5wcm9wcy5hbGxvd0NyZWF0ZSAmJiB0aGlzLnN0YXRlLmlucHV0VmFsdWUudHJpbSgpKSB7XG5cdFx0Ly8gXHR2YXIgaW5wdXRWYWx1ZSA9IHRoaXMuc3RhdGUuaW5wdXRWYWx1ZTtcblx0XHQvLyBcdG9wdGlvbnMgPSBvcHRpb25zLnNsaWNlKCk7XG5cdFx0Ly8gXHR2YXIgbmV3T3B0aW9uID0gdGhpcy5wcm9wcy5uZXdPcHRpb25DcmVhdG9yID8gdGhpcy5wcm9wcy5uZXdPcHRpb25DcmVhdG9yKGlucHV0VmFsdWUpIDoge1xuXHRcdC8vIFx0XHR2YWx1ZTogaW5wdXRWYWx1ZSxcblx0XHQvLyBcdFx0bGFiZWw6IGlucHV0VmFsdWUsXG5cdFx0Ly8gXHRcdGNyZWF0ZTogdHJ1ZVxuXHRcdC8vIFx0fTtcblx0XHQvLyBcdG9wdGlvbnMudW5zaGlmdChuZXdPcHRpb24pO1xuXHRcdC8vIH1cblx0XHR2YXIgb3BzID0gb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3AsIGtleSkge1xuXHRcdFx0dmFyIGlzU2VsZWN0ZWQgPSBpc0VxdWFsVmFsdWUodGhpcy5zdGF0ZS52YWx1ZSwgZ2V0VmFsdWUob3ApKTtcblx0XHRcdHZhciBpc0ZvY3VzZWQgPSBpc0VxdWFsVmFsdWUoZm9jdXNlZFZhbHVlLCBnZXRWYWx1ZShvcCkpO1xuXHRcdFx0dmFyIG9wdGlvbkNsYXNzID0gY2xhc3Nlcyh7XG5cdFx0XHRcdCdTZWxlY3Qtb3B0aW9uJzogdHJ1ZSxcblx0XHRcdFx0J2lzLXNlbGVjdGVkJzogaXNTZWxlY3RlZCxcblx0XHRcdFx0J2lzLWZvY3VzZWQnOiBpc0ZvY3VzZWQsXG5cdFx0XHRcdCdpcy1kaXNhYmxlZCc6IGdldFZhbHVlUHJvcChvcCwgJ2Rpc2FibGVkJylcblx0XHRcdH0pO1xuXHRcdFx0dmFyIHJlZiA9IGlzRm9jdXNlZCA/ICdmb2N1c2VkJyA6IG51bGw7XG5cdFx0XHR2YXIgbW91c2VFbnRlciA9IHRoaXMuZm9jdXNPcHRpb24uYmluZCh0aGlzLCBvcCk7XG5cdFx0XHR2YXIgbW91c2VMZWF2ZSA9IHRoaXMudW5mb2N1c09wdGlvbi5iaW5kKHRoaXMsIG9wKTtcblx0XHRcdHZhciBtb3VzZURvd24gPSB0aGlzLnNlbGVjdFZhbHVlLmJpbmQodGhpcywgb3ApO1xuXHRcdFx0dmFyIG9wdGlvblJlc3VsdCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5vcHRpb25Db21wb25lbnQsIHtcblx0XHRcdFx0a2V5OiAnb3B0aW9uLScgKyBnZXRWYWx1ZShvcCksXG5cdFx0XHRcdGNsYXNzTmFtZTogb3B0aW9uQ2xhc3MsXG5cdFx0XHRcdHJlbmRlckZ1bmM6IHJlbmRlckxhYmVsLFxuXHRcdFx0XHRtb3VzZUVudGVyOiBtb3VzZUVudGVyLFxuXHRcdFx0XHRtb3VzZUxlYXZlOiBtb3VzZUxlYXZlLFxuXHRcdFx0XHRtb3VzZURvd246IG1vdXNlRG93bixcblx0XHRcdFx0Y2xpY2s6IG1vdXNlRG93bixcblx0XHRcdFx0YWRkTGFiZWxUZXh0OiB0aGlzLnByb3BzLmFkZExhYmVsVGV4dCxcblx0XHRcdFx0b3B0aW9uOiBvcCxcblx0XHRcdFx0cmVmOiByZWZcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG9wdGlvblJlc3VsdDtcblx0XHR9LCB0aGlzKTtcblx0XHRyZXR1cm4gZ2V0TGVuZ3RoKG9wcykgPyBvcHMgOiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1ub3Jlc3VsdHNcIj5cblx0XHRcdFx0e3RoaXMucHJvcHMuYXN5bmNPcHRpb25zICYmICF0aGlzLnN0YXRlLmlucHV0VmFsdWUgPyB0aGlzLnByb3BzLnNlYXJjaFByb21wdFRleHQgOiB0aGlzLnByb3BzLm5vUmVzdWx0c1RleHR9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9LFxuXG5cdGhhbmRsZU9wdGlvbkxhYmVsQ2xpY2s6IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2spIHtcblx0XHRcdHRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrKHZhbHVlLCBldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdENsYXNzID0gY2xhc3NlcygnU2VsZWN0JywgdGhpcy5wcm9wcy5jbGFzc05hbWUsIHtcblx0XHRcdCdpcy1tdWx0aSc6IHRoaXMucHJvcHMubXVsdGksXG5cdFx0XHQnaXMtc2VhcmNoYWJsZSc6IHRoaXMucHJvcHMuc2VhcmNoYWJsZSxcblx0XHRcdCdpcy1vcGVuJzogdGhpcy5zdGF0ZS5pc09wZW4sXG5cdFx0XHQnaXMtZm9jdXNlZCc6IHRoaXMuc3RhdGUuaXNGb2N1c2VkLFxuXHRcdFx0J2lzLWxvYWRpbmcnOiB0aGlzLnN0YXRlLmlzTG9hZGluZyxcblx0XHRcdCdpcy1kaXNhYmxlZCc6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG5cdFx0XHQnaGFzLXZhbHVlJzogdGhpcy5zdGF0ZS52YWx1ZVxuXHRcdH0pO1xuXHRcdHZhciB2YWx1ZSA9IFtdO1xuXHRcdGlmICh0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHR0aGlzLnN0YXRlLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0XHR2YXIgb25PcHRpb25MYWJlbENsaWNrID0gdGhpcy5oYW5kbGVPcHRpb25MYWJlbENsaWNrLmJpbmQodGhpcywgdmFsKTtcblx0XHRcdFx0dmFyIG9uUmVtb3ZlID0gdGhpcy5yZW1vdmVWYWx1ZS5iaW5kKHRoaXMsIHZhbCk7XG5cdFx0XHRcdHZhciB2YWx1ZUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy52YWx1ZUNvbXBvbmVudCwge1xuXHRcdFx0XHRcdGtleTogZ2V0VmFsdWUodmFsKSxcblx0XHRcdFx0XHRvcHRpb246IHZhbCxcblx0XHRcdFx0XHRyZW5kZXJlcjogdGhpcy5wcm9wcy52YWx1ZVJlbmRlcmVyLFxuXHRcdFx0XHRcdG9wdGlvbkxhYmVsQ2xpY2s6ICEhdGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2ssXG5cdFx0XHRcdFx0b25PcHRpb25MYWJlbENsaWNrOiBvbk9wdGlvbkxhYmVsQ2xpY2ssXG5cdFx0XHRcdFx0b25SZW1vdmU6IG9uUmVtb3ZlLFxuXHRcdFx0XHRcdGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR2YWx1ZS5wdXNoKHZhbHVlQ29tcG9uZW50KTtcblx0XHRcdH0sIHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5zdGF0ZS5pbnB1dFZhbHVlICYmICghdGhpcy5wcm9wcy5tdWx0aSB8fCAhdmFsdWUubGVuZ3RoKSkge1xuXHRcdFx0dmFyIHZhbCA9IGdldEF0KHRoaXMuc3RhdGUudmFsdWVzLCAwKSB8fCBudWxsO1xuXHRcdFx0aWYgKHRoaXMucHJvcHMudmFsdWVSZW5kZXJlciAmJiAhIWdldExlbmd0aCh0aGlzLnN0YXRlLnZhbHVlcykpIHtcblx0XHRcdFx0dmFsdWUucHVzaCg8VmFsdWVcblx0XHRcdFx0XHRcdGtleT17MH1cblx0XHRcdFx0XHRcdG9wdGlvbj17dmFsfVxuXHRcdFx0XHRcdFx0cmVuZGVyZXI9e3RoaXMucHJvcHMudmFsdWVSZW5kZXJlcn1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfSAvPik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgc2luZ2xlVmFsdWVDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMuc2luZ2xlVmFsdWVDb21wb25lbnQsIHtcblx0XHRcdFx0XHRrZXk6ICdwbGFjZWhvbGRlcicsXG5cdFx0XHRcdFx0dmFsdWU6IHZhbCxcblx0XHRcdFx0XHRwbGFjZWhvbGRlcjogdGhpcy5zdGF0ZS5wbGFjZWhvbGRlclxuXHRcdFx0XHR9KTtcblx0XHRcdFx0dmFsdWUucHVzaChzaW5nbGVWYWx1ZUNvbXBvbmVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzLnN0YXRlLmlzTG9hZGluZyA/IDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1sb2FkaW5nXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsO1xuXHRcdHZhciBjbGVhciA9IHRoaXMucHJvcHMuY2xlYXJhYmxlICYmIHRoaXMuc3RhdGUudmFsdWUgJiYgIXRoaXMucHJvcHMuZGlzYWJsZWQgPyA8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtY2xlYXJcIiB0aXRsZT17dGhpcy5wcm9wcy5tdWx0aSA/IHRoaXMucHJvcHMuY2xlYXJBbGxUZXh0IDogdGhpcy5wcm9wcy5jbGVhclZhbHVlVGV4dH0gYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5tdWx0aSA/IHRoaXMucHJvcHMuY2xlYXJBbGxUZXh0IDogdGhpcy5wcm9wcy5jbGVhclZhbHVlVGV4dH0gb25Nb3VzZURvd249e3RoaXMuY2xlYXJWYWx1ZX0gb25DbGljaz17dGhpcy5jbGVhclZhbHVlfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6ICcmdGltZXM7JyB9fSAvPiA6IG51bGw7XG5cblx0XHR2YXIgbWVudTtcblx0XHR2YXIgbWVudVByb3BzO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0bWVudVByb3BzID0ge1xuXHRcdFx0XHRyZWY6ICdtZW51Jyxcblx0XHRcdFx0Y2xhc3NOYW1lOiAnU2VsZWN0LW1lbnUnXG5cdFx0XHR9O1xuXHRcdFx0aWYgKHRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdFx0bWVudVByb3BzLm9uTW91c2VEb3duID0gdGhpcy5oYW5kbGVNb3VzZURvd247XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmKHRoaXMucHJvcHMubGF6eSl7XG5cdFx0XHRcdG1lbnUgPSAoXG5cdFx0XHRcdFx0PGRpdiByZWY9XCJzZWxlY3RNZW51Q29udGFpbmVyXCIgY2xhc3NOYW1lPVwiU2VsZWN0LW1lbnUtb3V0ZXJcIiBzdHlsZT17dGhpcy5wcm9wcy5zdHlsZU1lbnVPdXRlcn0+XG5cdFx0XHRcdFx0XHQ8TGF6eVJlbmRlciBtYXhIZWlnaHQ9e3RoaXMucHJvcHMuc3R5bGVNZW51T3V0ZXIubWF4SGVpZ2h0IHx8IDIwMH1cblx0ICAgICAgICAgIFx0ICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9XG4gIFx0ICAgICAgICAgIFx0ICAgICAgICByZWY9XCJjb250YWluZXJcIj5cbiAgICBcdCAgICAgICAge3RoaXMuYnVpbGRNZW51KCl9XG4gIFx0ICAgICAgICA8L0xhenlSZW5kZXI+XG5cdCAgICAgICAgPC9kaXY+XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRtZW51ID0gKFxuXHRcdFx0XHRcdDxkaXYgcmVmPVwic2VsZWN0TWVudUNvbnRhaW5lclwiIGNsYXNzTmFtZT1cIlNlbGVjdC1tZW51LW91dGVyXCIgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGVNZW51T3V0ZXJ9PlxuXHRcdFx0XHRcdFx0PGRpdiB7Li4ubWVudVByb3BzfT57dGhpcy5idWlsZE1lbnUoKX08L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgaW5wdXQ7XG5cdFx0dmFyIGlucHV0UHJvcHMgPSB7XG5cdFx0XHRyZWY6ICdpbnB1dCcsXG5cdFx0XHRjbGFzc05hbWU6ICdTZWxlY3QtaW5wdXQgJyArICh0aGlzLnByb3BzLmlucHV0UHJvcHMuY2xhc3NOYW1lIHx8ICcnKSxcblx0XHRcdHRhYkluZGV4OiB0aGlzLnByb3BzLnRhYkluZGV4IHx8IDAsXG5cdFx0XHRvbkZvY3VzOiB0aGlzLmhhbmRsZUlucHV0Rm9jdXMsXG5cdFx0XHRvbkJsdXI6IHRoaXMuaGFuZGxlSW5wdXRCbHVyXG5cdFx0fTtcblx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5wcm9wcy5pbnB1dFByb3BzKSB7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5pbnB1dFByb3BzLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9PSAnY2xhc3NOYW1lJykge1xuXHRcdFx0XHRpbnB1dFByb3BzW2tleV0gPSB0aGlzLnByb3BzLmlucHV0UHJvcHNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXRoaXMucHJvcHMuZGlzYWJsZWQpIHtcblx0XHRcdGlmICh0aGlzLnByb3BzLnNlYXJjaGFibGUpIHtcblx0XHRcdFx0aW5wdXQgPSA8SW5wdXQgdmFsdWU9e3RoaXMuc3RhdGUuaW5wdXRWYWx1ZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlSW5wdXRDaGFuZ2V9IG1pbldpZHRoPVwiNVwiIHsuLi5pbnB1dFByb3BzfSAvPjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlucHV0ID0gPGRpdiB7Li4uaW5wdXRQcm9wc30+Jm5ic3A7PC9kaXY+O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIXRoaXMucHJvcHMubXVsdGkgfHwgIWdldExlbmd0aCh0aGlzLnN0YXRlLnZhbHVlcykpIHtcblx0XHRcdGlucHV0ID0gPGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtaW5wdXRcIj4mbmJzcDs8L2Rpdj47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgcmVmPVwid3JhcHBlclwiIGNsYXNzTmFtZT17c2VsZWN0Q2xhc3N9PlxuXHRcdFx0XHQ8aW5wdXQgdHlwZT1cImhpZGRlblwiIHJlZj1cInZhbHVlXCIgbmFtZT17dGhpcy5wcm9wcy5uYW1lfSB2YWx1ZT17dGhpcy5zdGF0ZS52YWx1ZX0gZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWNvbnRyb2xcIiByZWY9XCJjb250cm9sXCIgb25LZXlEb3duPXt0aGlzLmhhbmRsZUtleURvd259IG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0gb25Ub3VjaEVuZD17dGhpcy5oYW5kbGVNb3VzZURvd259PlxuXHRcdFx0XHRcdHt2YWx1ZX1cblx0XHRcdFx0XHR7aW5wdXR9XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWFycm93LXpvbmVcIiBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd25PbkFycm93fSAvPlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvd1wiIG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bk9uQXJyb3d9IC8+XG5cdFx0XHRcdFx0e2xvYWRpbmd9XG5cdFx0XHRcdFx0e2NsZWFyfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0e21lbnV9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdDtcbiJdfQ==
