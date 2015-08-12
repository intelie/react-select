require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./immutable/utils":5,"react":undefined}],2:[function(require,module,exports){
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

},{"react":undefined}],3:[function(require,module,exports){
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

},{"./immutable/utils":5,"react":undefined}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

function isImmutable(obj) {
  return obj != null && typeof obj.toJS != 'undefined';
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
		valueRenderer: React.PropTypes.func // valueRenderer: function(option) {}
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
			valueComponent: Value
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
			menu = React.createElement(
				'div',
				{ ref: 'selectMenuContainer', className: 'Select-menu-outer' },
				React.createElement(
					'div',
					menuProps,
					this.buildMenu()
				)
			);
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

},{"./Option":1,"./SingleValue":2,"./Value":3,"./arrayFindPolyfill":4,"./immutable/utils":5,"classnames":undefined,"immutable":undefined,"react":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvT3B0aW9uLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvU2luZ2xlVmFsdWUuanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L3NyYy9WYWx1ZS5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3Qvc3JjL2FycmF5RmluZFBvbHlmaWxsLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvaW1tdXRhYmxlL3V0aWxzLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvU2VsZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsUUFBUSxDQUFDOztBQUVyRCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDOUIsVUFBUyxFQUFFO0FBQ1YsY0FBWSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtBQUNwQyxXQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ2pD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RUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQUFBQyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQUFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQUFBQyxHQUFHO0dBQ2xIOztNQUFLLFNBQVMsRUFBQyxnQkFBZ0IsRUFBQyxHQUFHLEVBQUMsU0FBUyxFQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxBQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUMsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQztJQUMvSSxLQUFLO0lBQ0wsS0FBSztJQUNOLDhCQUFNLFNBQVMsRUFBQyxtQkFBbUIsRUFBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixBQUFDLEdBQUc7SUFDaEYsOEJBQU0sU0FBUyxFQUFDLGNBQWMsRUFBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixBQUFDLEdBQUc7SUFDMUUsT0FBTztJQUNQLEtBQUs7SUFDRDtHQUNMLElBQUk7R0FDQSxDQUNMO0VBQ0Y7O0NBRUQsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgZ2V0TGFiZWwgPSByZXF1aXJlKCcuL2ltbXV0YWJsZS91dGlscycpLmdldExhYmVsO1xuXG52YXIgT3B0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRhZGRMYWJlbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIHN0cmluZyByZW5kZXJlZCBpbiBjYXNlIG9mIGFsbG93Q3JlYXRlIG9wdGlvbiBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAgIC8vIGNsYXNzTmFtZSAoYmFzZWQgb24gbW91c2UgcG9zaXRpb24pXG5cdFx0bW91c2VEb3duOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIGNsaWNrIG9uIG9wdGlvbiBlbGVtZW50XG5cdFx0bW91c2VFbnRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIG1vdXNlRW50ZXIgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRtb3VzZUxlYXZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgbW91c2VMZWF2ZSBvbiBvcHRpb24gZWxlbWVudFxuXHRcdG9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgLy8gb2JqZWN0IHRoYXQgaXMgYmFzZSBmb3IgdGhhdCBvcHRpb25cblx0XHRyZW5kZXJGdW5jOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyAgICAgICAgICAgICAgIC8vIG1ldGhvZCBwYXNzZWQgdG8gUmVhY3RTZWxlY3QgY29tcG9uZW50IHRvIHJlbmRlciBsYWJlbCB0ZXh0XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb2JqID0gdGhpcy5wcm9wcy5vcHRpb247XG5cdFx0dmFyIHJlbmRlcmVkTGFiZWwgPSB0aGlzLnByb3BzLnJlbmRlckZ1bmMob2JqKTtcblxuXHRcdHJldHVybiBvYmouZGlzYWJsZWQgPyAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9PntyZW5kZXJlZExhYmVsfTwvZGl2PlxuXHRcdCkgOiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9XG5cdFx0XHRcdG9uTW91c2VFbnRlcj17dGhpcy5wcm9wcy5tb3VzZUVudGVyfVxuXHRcdFx0XHRvbk1vdXNlTGVhdmU9e3RoaXMucHJvcHMubW91c2VMZWF2ZX1cblx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMucHJvcHMubW91c2VEb3dufVxuXHRcdFx0XHRvbkNsaWNrPXt0aGlzLnByb3BzLm1vdXNlRG93bn0+XG5cdFx0XHRcdHsgb2JqLmNyZWF0ZSA/IHRoaXMucHJvcHMuYWRkTGFiZWxUZXh0LnJlcGxhY2UoJ3tsYWJlbH0nLCBnZXRMYWJlbChvYmopKSA6IHJlbmRlcmVkTGFiZWwgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9uO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIFNpbmdsZVZhbHVlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gdGhpcyBpcyBkZWZhdWx0IHZhbHVlIHByb3ZpZGVkIGJ5IFJlYWN0LVNlbGVjdCBiYXNlZCBjb21wb25lbnRcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCAgICAgICAgICAgICAgLy8gc2VsZWN0ZWQgb3B0aW9uXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LXBsYWNlaG9sZGVyXCI+e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2luZ2xlVmFsdWU7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGdldExhYmVsID0gcmVxdWlyZSgnLi9pbW11dGFibGUvdXRpbHMnKS5nZXRMYWJlbDtcblxudmFyIFZhbHVlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnVmFsdWUnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAgICAgLy8gZGlzYWJsZWQgcHJvcCBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgY2xpY2sgb24gdmFsdWUgbGFiZWxcblx0XHRvblJlbW92ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgcmVtb3ZlIG9mIHRoYXQgdmFsdWVcblx0XHRvcHRpb246IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCwgICAgICAgIC8vIG9wdGlvbiBwYXNzZWQgdG8gY29tcG9uZW50XG5cdFx0b3B0aW9uTGFiZWxDbGljazogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAvLyBpbmRpY2F0ZXMgaWYgb25PcHRpb25MYWJlbENsaWNrIHNob3VsZCBiZSBoYW5kbGVkXG5cdFx0cmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jICAgICAgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gcmVuZGVyIG9wdGlvbiBsYWJlbCBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0fSxcblxuXHRibG9ja0V2ZW50OiBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9LFxuXG5cdGhhbmRsZU9uUmVtb3ZlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuXHRcdFx0dGhpcy5wcm9wcy5vblJlbW92ZShldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxhYmVsID0gZ2V0TGFiZWwodGhpcy5wcm9wcy5vcHRpb24pO1xuXHRcdGlmICh0aGlzLnByb3BzLnJlbmRlcmVyKSB7XG5cdFx0XHRsYWJlbCA9IHRoaXMucHJvcHMucmVuZGVyZXIodGhpcy5wcm9wcy5vcHRpb24pO1xuXHRcdH1cblxuXHRcdGlmKCF0aGlzLnByb3BzLm9uUmVtb3ZlICYmICF0aGlzLnByb3BzLm9wdGlvbkxhYmVsQ2xpY2spIHtcblx0XHRcdHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC12YWx1ZVwiPntsYWJlbH08L2Rpdj47XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvcHMub3B0aW9uTGFiZWxDbGljaykge1xuXHRcdFx0bGFiZWwgPSAoXG5cdFx0XHRcdDxhIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWxhYmVsX19hXCJcblx0XHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5ibG9ja0V2ZW50fVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfT5cblx0XHRcdFx0XHR7bGFiZWx9XG5cdFx0XHRcdDwvYT5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW1cIj5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW0taWNvblwiXG5cdFx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuYmxvY2tFdmVudH1cblx0XHRcdFx0XHRvbkNsaWNrPXt0aGlzLmhhbmRsZU9uUmVtb3ZlfVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlT25SZW1vdmV9PiZ0aW1lczs8L3NwYW4+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmFsdWU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vc291cmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9maW5kXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gIEFycmF5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgaWYgKHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LnByb3RvdHlwZS5maW5kIGNhbGxlZCBvbiBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICB2YXIgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBpc0ltbXV0YWJsZShvYmope1xuXHRyZXR1cm4gb2JqICE9IG51bGwgJiYgdHlwZW9mIG9iai50b0pTICE9ICd1bmRlZmluZWQnXG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlUHJvcChvYmosIHByb3BlcnR5KXtcbiAgaWYoIW9iaikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmKGlzSW1tdXRhYmxlKG9iaikpIHtcbiAgICByZXR1cm4gb2JqLmdldChwcm9wZXJ0eSk7XG4gIH1cbiAgcmV0dXJuIG9ialtwcm9wZXJ0eV07XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlKG9iail7XG4gIHJldHVybiBnZXRWYWx1ZVByb3Aob2JqLCAndmFsdWUnKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWwob2JqKXtcbiAgcmV0dXJuIGdldFZhbHVlUHJvcChvYmosICdsYWJlbCcpO1xufVxuXG5mdW5jdGlvbiBnZXRMZW5ndGgob2JqKXtcblx0aWYoIW9iaikge1xuICAgIHJldHVybiAwO1xuICB9XG4gIGlmKGlzSW1tdXRhYmxlKG9iaikpIHtcbiAgICByZXR1cm4gb2JqLnNpemVcbiAgfVxuICByZXR1cm4gb2JqLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gZ2V0QXQob2JqLCBpbmRleCkge1xuXHRpZighb2JqKXtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZihpc0ltbXV0YWJsZShvYmopKXtcblx0XHRyZXR1cm4gb2JqLmdldChpbmRleCk7XG5cdH1cblxuXHRyZXR1cm4gb2JqW2luZGV4XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGlzSW1tdXRhYmxlOiBpc0ltbXV0YWJsZSxcblx0Z2V0VmFsdWU6IGdldFZhbHVlLFxuXHRnZXRMYWJlbDogZ2V0TGFiZWwsXG5cdGdldFZhbHVlUHJvcDogZ2V0VmFsdWVQcm9wLFxuXHRnZXRMZW5ndGg6IGdldExlbmd0aCxcblx0Z2V0QXQ6IGdldEF0XG59O1xuIiwiLyogZGlzYWJsZSBzb21lIHJ1bGVzIHVudGlsIHdlIHJlZmFjdG9yIG1vcmUgY29tcGxldGVseTsgZml4aW5nIHRoZW0gbm93IHdvdWxkXG4gICBjYXVzZSBjb25mbGljdHMgd2l0aCBzb21lIG9wZW4gUFJzIHVubmVjZXNzYXJpbHkuICovXG4vKiBlc2xpbnQgcmVhY3QvanN4LXNvcnQtcHJvcC10eXBlczogMCwgcmVhY3Qvc29ydC1jb21wOiAwLCByZWFjdC9wcm9wLXR5cGVzOiAwICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgSW5wdXQgPSByZXF1aXJlKCdyZWFjdC1pbnB1dC1hdXRvc2l6ZScpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG52YXIgVmFsdWUgPSByZXF1aXJlKCcuL1ZhbHVlJyk7XG52YXIgU2luZ2xlVmFsdWUgPSByZXF1aXJlKCcuL1NpbmdsZVZhbHVlJyk7XG52YXIgT3B0aW9uID0gcmVxdWlyZSgnLi9PcHRpb24nKTtcbnZhciBpbW11dGFibGVVdGlscyA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlL3V0aWxzJyk7XG5yZXF1aXJlKCcuL2FycmF5RmluZFBvbHlmaWxsJyk7XG5cbnZhciBpc0ltbXV0YWJsZSA9IGltbXV0YWJsZVV0aWxzLmlzSW1tdXRhYmxlLFxuXHRcdGdldFZhbHVlID0gaW1tdXRhYmxlVXRpbHMuZ2V0VmFsdWUsXG5cdFx0Z2V0TGFiZWwgPSBpbW11dGFibGVVdGlscy5nZXRMYWJlbCxcblx0XHRnZXRWYWx1ZVByb3AgPSBpbW11dGFibGVVdGlscy5nZXRWYWx1ZVByb3AsXG5cdFx0Z2V0TGVuZ3RoID0gaW1tdXRhYmxlVXRpbHMuZ2V0TGVuZ3RoLFxuXHRcdGdldEF0ID0gaW1tdXRhYmxlVXRpbHMuZ2V0QXQ7XG5cbnZhciByZXF1ZXN0SWQgPSAwO1xuXG4vLyB0ZXN0IGJ5IHZhbHVlLCBwb3IgZWlkIGlmIGF2YWlsYWJsZVxudmFyIGlzRXF1YWxWYWx1ZSA9IGZ1bmN0aW9uKHYxLCB2Mikge1xuICByZXR1cm4gSW1tdXRhYmxlLmlzKHYxLCB2MikgfHwgKFxuICAgIHYxICYmIHYyICYmIHYxLmhhcyAmJiB2MS5oYXMoJ2VpZCcpICYmXG4gICAgSW1tdXRhYmxlLmlzKHYxLmdldCgnZWlkJyksIHYyLmdldCgnZWlkJykpXG4gICk7XG59O1xuXG52YXIgY29tcGFyZU9wdGlvbnMgPSBmdW5jdGlvbihvcHMxLCBvcHMyKXtcblx0cmV0dXJuIGlzSW1tdXRhYmxlKG9wczEsIG9wczIpID8gXG5cdFx0XHRcdFx0SW1tdXRhYmxlLmlzKG9wczEsIG9wczIpIDogXG5cdFx0XHRcdFx0SlNPTi5zdHJpbmdpZnkob3BzMSkgPT09IEpTT04uc3RyaW5naWZ5KG9wczIpO1xufTtcblxudmFyIFNlbGVjdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRkaXNwbGF5TmFtZTogJ1NlbGVjdCcsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0YWRkTGFiZWxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgIC8vIHBsYWNlaG9sZGVyIGRpc3BsYXllZCB3aGVuIHlvdSB3YW50IHRvIGFkZCBhIGxhYmVsIG9uIGEgbXVsdGktdmFsdWUgaW5wdXRcblx0XHRhbGxvd0NyZWF0ZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgLy8gd2hldGhlciB0byBhbGxvdyBjcmVhdGlvbiBvZiBuZXcgZW50cmllc1xuXHRcdGFzeW5jT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAvLyBmdW5jdGlvbiB0byBjYWxsIHRvIGdldCBvcHRpb25zXG5cdFx0YXV0b2xvYWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdG8gYXV0by1sb2FkIHRoZSBkZWZhdWx0IGFzeW5jIG9wdGlvbnMgc2V0XG5cdFx0YmFja3NwYWNlUmVtb3ZlczogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgIC8vIHdoZXRoZXIgYmFja3NwYWNlIHJlbW92ZXMgYW4gaXRlbSBpZiB0aGVyZSBpcyBubyB0ZXh0IGlucHV0XG5cdFx0Y2FjaGVBc3luY1Jlc3VsdHM6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgIC8vIHdoZXRoZXIgdG8gYWxsb3cgY2FjaGVcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gY2xhc3NOYW1lIGZvciB0aGUgb3V0ZXIgZWxlbWVudFxuXHRcdGNsZWFyQWxsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sIHdoZW4gbXVsdGk6IHRydWVcblx0XHRjbGVhclZhbHVlVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgLy8gdGl0bGUgZm9yIHRoZSBcImNsZWFyXCIgY29udHJvbFxuXHRcdGNsZWFyYWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAvLyBzaG91bGQgaXQgYmUgcG9zc2libGUgdG8gcmVzZXQgdmFsdWVcblx0XHRkZWxpbWl0ZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gZGVsaW1pdGVyIHRvIHVzZSB0byBqb2luIG11bHRpcGxlIHZhbHVlc1xuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAvLyB3aGV0aGVyIHRoZSBTZWxlY3QgaXMgZGlzYWJsZWQgb3Igbm90XG5cdFx0ZmlsdGVyT3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIG1ldGhvZCB0byBmaWx0ZXIgYSBzaW5nbGUgb3B0aW9uOiBmdW5jdGlvbihvcHRpb24sIGZpbHRlclN0cmluZylcblx0XHRmaWx0ZXJPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciB0aGUgb3B0aW9ucyBhcnJheTogZnVuY3Rpb24oW29wdGlvbnNdLCBmaWx0ZXJTdHJpbmcsIFt2YWx1ZXNdKVxuXHRcdGlnbm9yZUNhc2U6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyB3aGV0aGVyIHRvIHBlcmZvcm0gY2FzZS1pbnNlbnNpdGl2ZSBmaWx0ZXJpbmdcblx0XHRpbnB1dFByb3BzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LCAgICAgICAgLy8gY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIHRoZSBJbnB1dCAoaW4gdGhlIFNlbGVjdC1jb250cm9sKSBlLmc6IHsnZGF0YS1mb28nOiAnYmFyJ31cblx0XHRtYXRjaFBvczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgLy8gKGFueXxzdGFydCkgbWF0Y2ggdGhlIHN0YXJ0IG9yIGVudGlyZSBzdHJpbmcgd2hlbiBmaWx0ZXJpbmdcblx0XHRtYXRjaFByb3A6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gKGFueXxsYWJlbHx2YWx1ZSkgd2hpY2ggb3B0aW9uIHByb3BlcnR5IHRvIGZpbHRlciBvblxuXHRcdG11bHRpOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAvLyBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdG5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAgICAvLyBmaWVsZCBuYW1lLCBmb3IgaGlkZGVuIDxpbnB1dCAvPiB0YWdcblx0XHRuZXdPcHRpb25DcmVhdG9yOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgLy8gZmFjdG9yeSB0byBjcmVhdGUgbmV3IG9wdGlvbnMgd2hlbiBhbGxvd0NyZWF0ZSBzZXRcblx0XHRub1Jlc3VsdHNUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoaW5nIHNlYXJjaCByZXN1bHRzXG5cdFx0b25CbHVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG9uQmx1ciBoYW5kbGVyOiBmdW5jdGlvbihldmVudCkge31cblx0XHRvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgLy8gb25DaGFuZ2UgaGFuZGxlcjogZnVuY3Rpb24obmV3VmFsdWUpIHt9XG5cdFx0b25Gb2N1czogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgIC8vIG9uRm9jdXMgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIHt9XG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgIC8vIG9uQ0xpY2sgaGFuZGxlciBmb3IgdmFsdWUgbGFiZWxzOiBmdW5jdGlvbiAodmFsdWUsIGV2ZW50KSB7fVxuXHRcdG9wdGlvbkNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAvLyBvcHRpb24gY29tcG9uZW50IHRvIHJlbmRlciBpbiBkcm9wZG93blxuXHRcdG9wdGlvblJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAvLyBvcHRpb25SZW5kZXJlcjogZnVuY3Rpb24ob3B0aW9uKSB7fVxuXHRcdG9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLmFycmF5LFxuICAgICAgUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoSW1tdXRhYmxlLkxpc3QpXG4gICAgXSksICAgICAgICAgICBcdCBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCAvLyBhcnJheSBvZiBvcHRpb25zXG5cdFx0cGxhY2Vob2xkZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgIC8vIGZpZWxkIHBsYWNlaG9sZGVyLCBkaXNwbGF5ZWQgd2hlbiB0aGVyZSdzIG5vIHZhbHVlXG5cdFx0c2VhcmNoYWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgIC8vIHdoZXRoZXIgdG8gZW5hYmxlIHNlYXJjaGluZyBmZWF0dXJlIG9yIG5vdFxuXHRcdHNlYXJjaFByb21wdFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAvLyBsYWJlbCB0byBwcm9tcHQgZm9yIHNlYXJjaCBpbnB1dFxuXHRcdHNpbmdsZVZhbHVlQ29tcG9uZW50OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywvLyBzaW5nbGUgdmFsdWUgY29tcG9uZW50IHdoZW4gbXVsdGlwbGUgaXMgc2V0IHRvIGZhbHNlXG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5hbnksICAgICAgICAgICAgICAgIC8vIGluaXRpYWwgZmllbGQgdmFsdWVcblx0XHR2YWx1ZUNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgLy8gdmFsdWUgY29tcG9uZW50IHRvIHJlbmRlciBpbiBtdWx0aXBsZSBtb2RlXG5cdFx0dmFsdWVSZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMgICAgICAgIC8vIHZhbHVlUmVuZGVyZXI6IGZ1bmN0aW9uKG9wdGlvbikge31cblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhZGRMYWJlbFRleHQ6ICdBZGljaW9uYXIge2xhYmVsfSA/Jyxcblx0XHRcdGFsbG93Q3JlYXRlOiBmYWxzZSxcblx0XHRcdGFzeW5jT3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0YXV0b2xvYWQ6IHRydWUsXG5cdFx0XHRiYWNrc3BhY2VSZW1vdmVzOiB0cnVlLFxuXHRcdFx0Y2FjaGVBc3luY1Jlc3VsdHM6IHRydWUsXG5cdFx0XHRjbGFzc05hbWU6IHVuZGVmaW5lZCxcblx0XHRcdGNsZWFyQWxsVGV4dDogJ0xpbXBhciB0b2RvcycsXG5cdFx0XHRjbGVhclZhbHVlVGV4dDogJ0xpbXBhcicsXG5cdFx0XHRjbGVhcmFibGU6IHRydWUsXG5cdFx0XHRkZWxpbWl0ZXI6ICcsJyxcblx0XHRcdGRpc2FibGVkOiBmYWxzZSxcblx0XHRcdGlnbm9yZUNhc2U6IHRydWUsXG5cdFx0XHRpbnB1dFByb3BzOiB7fSxcblx0XHRcdG1hdGNoUG9zOiAnYW55Jyxcblx0XHRcdG1hdGNoUHJvcDogJ2FueScsXG5cdFx0XHRuYW1lOiB1bmRlZmluZWQsXG5cdFx0XHRuZXdPcHRpb25DcmVhdG9yOiB1bmRlZmluZWQsXG5cdFx0XHRub1Jlc3VsdHNUZXh0OiAnTmVuaHVtIHJlc3VsdGFkbyBlbmNvbnRyYWRvJyxcblx0XHRcdG9uQ2hhbmdlOiB1bmRlZmluZWQsXG5cdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IHVuZGVmaW5lZCxcblx0XHRcdG9wdGlvbkNvbXBvbmVudDogT3B0aW9uLFxuXHRcdFx0b3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0cGxhY2Vob2xkZXI6ICdTZWxlY2lvbmUuLi4nLFxuXHRcdFx0c2VhcmNoYWJsZTogdHJ1ZSxcblx0XHRcdHNlYXJjaFByb21wdFRleHQ6ICdEaWdpdGUgcGFyYSBidXNjYXInLFxuXHRcdFx0c2luZ2xlVmFsdWVDb21wb25lbnQ6IFNpbmdsZVZhbHVlLFxuXHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdHZhbHVlQ29tcG9uZW50OiBWYWx1ZVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Lypcblx0XHRcdCAqIHNldCBieSBnZXRTdGF0ZUZyb21WYWx1ZSBvbiBjb21wb25lbnRXaWxsTW91bnQ6XG5cdFx0XHQgKiAtIHZhbHVlXG5cdFx0XHQgKiAtIHZhbHVlc1xuXHRcdFx0ICogLSBmaWx0ZXJlZE9wdGlvbnNcblx0XHRcdCAqIC0gaW5wdXRWYWx1ZVxuXHRcdFx0ICogLSBwbGFjZWhvbGRlclxuXHRcdFx0ICogLSBmb2N1c2VkT3B0aW9uXG5cdFx0XHQqL1xuXHRcdFx0aXNGb2N1c2VkOiBmYWxzZSxcblx0XHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0b3B0aW9uczogdGhpcy5wcm9wcy5vcHRpb25zXG5cdFx0fTtcblx0fSxcblxuXHRjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX29wdGlvbnNDYWNoZSA9IHt9O1xuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblx0XHR0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBtZW51RWxlbSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5zZWxlY3RNZW51Q29udGFpbmVyKTtcblx0XHRcdHZhciBjb250cm9sRWxlbSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5jb250cm9sKTtcblxuXHRcdFx0dmFyIGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ID0gdGhpcy5jbGlja2VkT3V0c2lkZUVsZW1lbnQobWVudUVsZW0sIGV2ZW50KTtcblx0XHRcdHZhciBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCA9IHRoaXMuY2xpY2tlZE91dHNpZGVFbGVtZW50KGNvbnRyb2xFbGVtLCBldmVudCk7XG5cblx0XHRcdC8vIEhpZGUgZHJvcGRvd24gbWVudSBpZiBjbGljayBvY2N1cnJlZCBvdXRzaWRlIG9mIG1lbnVcblx0XHRcdGlmIChldmVudE9jY3VyZWRPdXRzaWRlTWVudSAmJiBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCkge1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0XHRcdH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICghZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAmJiBkb2N1bWVudC5hdHRhY2hFdmVudCkge1xuXHRcdFx0XHRkb2N1bWVudC5hdHRhY2hFdmVudCgnb25jbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICghZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAmJiBkb2N1bWVudC5kZXRhY2hFdmVudCkge1xuXHRcdFx0XHRkb2N1bWVudC5kZXRhY2hFdmVudCgnb25jbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5nZXRTdGF0ZUZyb21WYWx1ZSh0aGlzLnByb3BzLnZhbHVlKSk7XG5cdH0sXG5cblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiB0aGlzLnByb3BzLmF1dG9sb2FkKSB7XG5cdFx0XHR0aGlzLmF1dG9sb2FkQXN5bmNPcHRpb25zKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fYmx1clRpbWVvdXQpO1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9mb2N1c1RpbWVvdXQpO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXdQcm9wcykge1xuXHRcdHZhciBvcHRpb25zQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdGlmICghY29tcGFyZU9wdGlvbnMobmV3UHJvcHMub3B0aW9ucywgdGhpcy5wcm9wcy5vcHRpb25zKSkge1xuXHRcdFx0b3B0aW9uc0NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG9wdGlvbnM6IG5ld1Byb3BzLm9wdGlvbnMsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogdGhpcy5maWx0ZXJPcHRpb25zKG5ld1Byb3BzLm9wdGlvbnMpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKCFpc0VxdWFsVmFsdWUobmV3UHJvcHMudmFsdWUsIHRoaXMuc3RhdGUudmFsdWUpIHx8IG5ld1Byb3BzLnBsYWNlaG9sZGVyICE9PSB0aGlzLnByb3BzLnBsYWNlaG9sZGVyIHx8IG9wdGlvbnNDaGFuZ2VkKSB7XG5cdFx0XHR2YXIgc2V0U3RhdGUgPSAobmV3U3RhdGUpID0+IHtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlRnJvbVZhbHVlKG5ld1Byb3BzLnZhbHVlLFxuXHRcdFx0XHRcdChuZXdTdGF0ZSAmJiBuZXdTdGF0ZS5vcHRpb25zKSB8fCBuZXdQcm9wcy5vcHRpb25zLFxuXHRcdFx0XHRcdG5ld1Byb3BzLnBsYWNlaG9sZGVyKVxuXHRcdFx0XHQpO1xuXHRcdFx0fTtcblx0XHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuXHRcdFx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMobmV3UHJvcHMudmFsdWUsIHt9LCBzZXRTdGF0ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZXRTdGF0ZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCAmJiB0aGlzLl9mb2N1c0FmdGVyVXBkYXRlKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5fYmx1clRpbWVvdXQpO1xuXHRcdFx0dGhpcy5fZm9jdXNUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZ2V0SW5wdXROb2RlKCkuZm9jdXMoKTtcblx0XHRcdFx0dGhpcy5fZm9jdXNBZnRlclVwZGF0ZSA9IGZhbHNlO1xuXHRcdFx0fSwgNTApO1xuXHRcdH1cblx0XHRpZiAodGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCkge1xuXHRcdFx0aWYgKHRoaXMucmVmcy5mb2N1c2VkICYmIHRoaXMucmVmcy5tZW51KSB7XG5cdFx0XHRcdHZhciBmb2N1c2VkRE9NID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmZvY3VzZWQpO1xuXHRcdFx0XHR2YXIgbWVudURPTSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5tZW51KTtcblx0XHRcdFx0dmFyIGZvY3VzZWRSZWN0ID0gZm9jdXNlZERPTS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0dmFyIG1lbnVSZWN0ID0gbWVudURPTS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdFx0XHRpZiAoZm9jdXNlZFJlY3QuYm90dG9tID4gbWVudVJlY3QuYm90dG9tIHx8IGZvY3VzZWRSZWN0LnRvcCA8IG1lbnVSZWN0LnRvcCkge1xuXHRcdFx0XHRcdG1lbnVET00uc2Nyb2xsVG9wID0gKGZvY3VzZWRET00ub2Zmc2V0VG9wICsgZm9jdXNlZERPTS5jbGllbnRIZWlnaHQgLSBtZW51RE9NLm9mZnNldEhlaWdodCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0Zm9jdXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZ2V0SW5wdXROb2RlKCkuZm9jdXMoKTtcblx0fSxcblxuXHRjbGlja2VkT3V0c2lkZUVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGV2ZW50KSB7XG5cdFx0dmFyIGV2ZW50VGFyZ2V0ID0gKGV2ZW50LnRhcmdldCkgPyBldmVudC50YXJnZXQgOiBldmVudC5zcmNFbGVtZW50O1xuXHRcdHdoaWxlIChldmVudFRhcmdldCAhPSBudWxsKSB7XG5cdFx0XHRpZiAoZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQpIHJldHVybiBmYWxzZTtcblx0XHRcdGV2ZW50VGFyZ2V0ID0gZXZlbnRUYXJnZXQub2Zmc2V0UGFyZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRnZXRTdGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMsIHBsYWNlaG9sZGVyKSB7XG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHRvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zO1xuXHRcdH1cblx0XHRpZiAoIXBsYWNlaG9sZGVyKSB7XG5cdFx0XHRwbGFjZWhvbGRlciA9IHRoaXMucHJvcHMucGxhY2Vob2xkZXI7XG5cdFx0fVxuXG5cdFx0Ly8gcmVzZXQgaW50ZXJuYWwgZmlsdGVyIHN0cmluZ1xuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblxuXHRcdHZhciB2YWx1ZXMgPSB0aGlzLmluaXRWYWx1ZXNBcnJheSh2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zLCB2YWx1ZXMpO1xuXG5cdFx0dmFyIGZvY3VzZWRPcHRpb247XG5cdFx0dmFyIHZhbHVlRm9yU3RhdGUgPSBudWxsO1xuXHRcdGlmICghdGhpcy5wcm9wcy5tdWx0aSAmJiBnZXRMZW5ndGgodmFsdWVzKSkge1xuXHRcdFx0Zm9jdXNlZE9wdGlvbiA9IGdldEF0KHZhbHVlcywgMCk7O1xuXHRcdFx0dmFsdWVGb3JTdGF0ZSA9IGdldFZhbHVlKGdldEF0KHZhbHVlcywgMCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKHZhciBvcHRpb25JbmRleCA9IDA7IG9wdGlvbkluZGV4IDwgZ2V0TGVuZ3RoKGZpbHRlcmVkT3B0aW9ucyk7ICsrb3B0aW9uSW5kZXgpIHtcblx0XHRcdFx0dmFyIG9wdGlvbiA9IGdldEF0KGZpbHRlcmVkT3B0aW9ucywgb3B0aW9uSW5kZXgpO1xuXHRcdFx0XHRpZiAoIWdldFZhbHVlUHJvcChvcHRpb24sICdkaXNhYmxlZCcpKSB7XG5cdFx0XHRcdFx0Zm9jdXNlZE9wdGlvbiA9IG9wdGlvbjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFsdWVGb3JTdGF0ZSA9IHZhbHVlcy5tYXAoZnVuY3Rpb24odikgeyByZXR1cm4gZ2V0VmFsdWUodik7IH0pLmpvaW4odGhpcy5wcm9wcy5kZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogdmFsdWVGb3JTdGF0ZSxcblx0XHRcdHZhbHVlczogdmFsdWVzLFxuXHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdHBsYWNlaG9sZGVyOiAhdGhpcy5wcm9wcy5tdWx0aSAmJiBnZXRMZW5ndGgodmFsdWVzKSA/IGdldExhYmVsKGdldEF0KHZhbHVlcywgMCkpIDogcGxhY2Vob2xkZXIsXG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fTtcblx0fSxcblxuXHRpbml0VmFsdWVzQXJyYXk6IGZ1bmN0aW9uKHZhbHVlcywgb3B0aW9ucykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpICYmICFJbW11dGFibGUuSXRlcmFibGUuaXNJbmRleGVkKHZhbHVlcykpIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsdWVzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMgPT09ICcnID8gSW1tdXRhYmxlLkxpc3QoKSA6IEltbXV0YWJsZS5MaXN0KHZhbHVlcy5zcGxpdCh0aGlzLnByb3BzLmRlbGltaXRlcikpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzID0gdmFsdWVzICE9PSB1bmRlZmluZWQgJiYgdmFsdWVzICE9PSBudWxsID8gSW1tdXRhYmxlLkxpc3QoW3ZhbHVlc10pIDogSW1tdXRhYmxlLkxpc3QoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuZmluZChvcCA9PiB7XG5cdFx0XHRcdFx0dmFyIG9wVmFsdWUgPSBnZXRWYWx1ZShvcCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gaXNFcXVhbFZhbHVlKG9wVmFsdWUsIHZhbCkgfHwgdHlwZW9mIG9wVmFsdWUgPT09ICdudW1iZXInICYmIG9wVmFsdWUudG9TdHJpbmcoKSA9PT0gdmFsXG5cdFx0XHRcdH0pIHx8IEltbXV0YWJsZS5NYXAoeyB2YWx1ZTogdmFsLCBsYWJlbDogdmFsIH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHZhbDtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUsIGZvY3VzQWZ0ZXJVcGRhdGUpIHtcblx0XHRpZiAoZm9jdXNBZnRlclVwZGF0ZSB8fCBmb2N1c0FmdGVyVXBkYXRlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgPSB0cnVlO1xuXHRcdH1cblx0XHR2YXIgbmV3U3RhdGUgPSB0aGlzLmdldFN0YXRlRnJvbVZhbHVlKHZhbHVlKTtcblx0XHRuZXdTdGF0ZS5pc09wZW4gPSBmYWxzZTtcblx0XHR0aGlzLmZpcmVDaGFuZ2VFdmVudChuZXdTdGF0ZSk7XG5cdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdH0sXG5cblx0c2VsZWN0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKHZhbHVlKTtcblx0XHR9IGVsc2UgaWYgKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmFkZFZhbHVlKHZhbHVlKTtcblx0XHR9XG5cdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHR9LFxuXG5cdGFkZFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmKGlzSW1tdXRhYmxlKHZhbHVlKSAmJiBpc0ltbXV0YWJsZSh0aGlzLnN0YXRlLnZhbHVlcykpe1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5wdXNoKHZhbHVlKSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmNvbmNhdCh2YWx1ZSkpO1xuXHRcdH1cblx0fSxcblxuXHRwb3BWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5zbGljZSgwLCBnZXRMZW5ndGgodGhpcy5zdGF0ZS52YWx1ZXMpIC0gMSkpO1xuXHR9LFxuXG5cdHJlbW92ZVZhbHVlOiBmdW5jdGlvbih2YWx1ZVRvUmVtb3ZlKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5maWx0ZXIoZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHJldHVybiB2YWx1ZSAhPT0gdmFsdWVUb1JlbW92ZTtcblx0XHR9KSk7XG5cdH0sXG5cblx0Y2xlYXJWYWx1ZTogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBpZ25vcmUgaXQuXG5cdFx0aWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuc2V0VmFsdWUobnVsbCk7XG5cdH0sXG5cblx0cmVzZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlID09PSAnJyA/IG51bGwgOiB0aGlzLnN0YXRlLnZhbHVlKTtcblx0fSxcblxuXHRnZXRJbnB1dE5vZGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaW5wdXQgPSB0aGlzLnJlZnMuaW5wdXQ7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuc2VhcmNoYWJsZSA/IGlucHV0IDogUmVhY3QuZmluZERPTU5vZGUoaW5wdXQpO1xuXHR9LFxuXG5cdGZpcmVDaGFuZ2VFdmVudDogZnVuY3Rpb24obmV3U3RhdGUpIHtcblx0XHRpZiAobmV3U3RhdGUudmFsdWUgIT09IHRoaXMuc3RhdGUudmFsdWUgJiYgdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZShuZXdTdGF0ZS52YWx1ZSwgbmV3U3RhdGUudmFsdWVzKTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIG9yIGlmIHRoZSBjb21wb25lbnQgaXMgZGlzYWJsZWQsIGlnbm9yZSBpdC5cblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzRm9jdXNlZCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9vcGVuQWZ0ZXJGb2N1cyA9IHRydWU7XG5cdFx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZU1vdXNlRG93bk9uQXJyb3c6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdC8vIGJ1dHRvbiwgb3IgaWYgdGhlIGNvbXBvbmVudCBpcyBkaXNhYmxlZCwgaWdub3JlIGl0LlxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8IChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIElmIG5vdCBmb2N1c2VkLCBoYW5kbGVNb3VzZURvd24gd2lsbCBoYW5kbGUgaXRcblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0fSwgdGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRGb2N1czogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgbmV3SXNPcGVuID0gdGhpcy5zdGF0ZS5pc09wZW4gfHwgdGhpcy5fb3BlbkFmdGVyRm9jdXM7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc0ZvY3VzZWQ6IHRydWUsXG5cdFx0XHRpc09wZW46IG5ld0lzT3BlblxuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYobmV3SXNPcGVuKSB7XG5cdFx0XHRcdHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gZmFsc2U7XG5cdFx0aWYgKHRoaXMucHJvcHMub25Gb2N1cykge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkZvY3VzKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRCbHVyOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHRoaXMuX2JsdXJUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5fZm9jdXNBZnRlclVwZGF0ZSkgcmV0dXJuO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzRm9jdXNlZDogZmFsc2UsXG5cdFx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0sIDUwKTtcblx0XHRpZiAodGhpcy5wcm9wcy5vbkJsdXIpIHtcblx0XHRcdHRoaXMucHJvcHMub25CbHVyKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlS2V5RG93bjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkgcmV0dXJuO1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSA4OiAvLyBiYWNrc3BhY2Vcblx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUgJiYgdGhpcy5wcm9wcy5iYWNrc3BhY2VSZW1vdmVzKSB7XG5cdFx0XHRcdFx0dGhpcy5wb3BWYWx1ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIDk6IC8vIHRhYlxuXHRcdFx0XHRpZiAoZXZlbnQuc2hpZnRLZXkgfHwgIXRoaXMuc3RhdGUuaXNPcGVuIHx8ICF0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZWxlY3RGb2N1c2VkT3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTM6IC8vIGVudGVyXG5cdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHJldHVybjtcblxuXHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAyNzogLy8gZXNjYXBlXG5cdFx0XHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0XHRcdHRoaXMucmVzZXRWYWx1ZSgpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMucHJvcHMuY2xlYXJhYmxlKSB7XG5cdFx0XHRcdFx0dGhpcy5jbGVhclZhbHVlKGV2ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM4OiAvLyB1cFxuXHRcdFx0XHR0aGlzLmZvY3VzUHJldmlvdXNPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA0MDogLy8gZG93blxuXHRcdFx0XHR0aGlzLmZvY3VzTmV4dE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDE4ODogLy8gLFxuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5hbGxvd0NyZWF0ZSAmJiB0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogcmV0dXJuO1xuXHRcdH1cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXG5cdC8vIEVuc3VyZXMgdGhhdCB0aGUgY3VycmVudGx5IGZvY3VzZWQgb3B0aW9uIGlzIGF2YWlsYWJsZSBpbiBmaWx0ZXJlZE9wdGlvbnMuXG5cdC8vIElmIG5vdCwgcmV0dXJucyB0aGUgZmlyc3QgYXZhaWxhYmxlIG9wdGlvbi5cblx0X2dldE5ld0ZvY3VzZWRPcHRpb246IGZ1bmN0aW9uKGZpbHRlcmVkT3B0aW9ucykge1xuXHRcdHZhciBmb2N1c2VkT3B0aW9uID0gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uXG5cdFx0cmV0dXJuIGZpbHRlcmVkT3B0aW9ucy5maW5kKG9wID0+IG9wID09PSBmb2N1c2VkT3B0aW9uKSB8fCBnZXRBdChmaWx0ZXJlZE9wdGlvbnMsIDApO1xuXHR9LFxuXG5cdGhhbmRsZUlucHV0Q2hhbmdlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGFzc2lnbiBhbiBpbnRlcm5hbCB2YXJpYWJsZSBiZWNhdXNlIHdlIG5lZWQgdG8gdXNlXG5cdFx0Ly8gdGhlIGxhdGVzdCB2YWx1ZSBiZWZvcmUgc2V0U3RhdGUoKSBoYXMgY29tcGxldGVkLlxuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSBldmVudC50YXJnZXQudmFsdWU7XG5cblx0XHRpZiAodGhpcy5wcm9wcy5hc3luY09wdGlvbnMpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc0xvYWRpbmc6IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMoZXZlbnQudGFyZ2V0LnZhbHVlLCB7XG5cdFx0XHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0XHRcdGlzT3BlbjogdHJ1ZVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKHRoaXMuc3RhdGUub3B0aW9ucyk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiBldmVudC50YXJnZXQudmFsdWUsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9XG5cdH0sXG5cblx0YXV0b2xvYWRBc3luY09wdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucygodGhpcy5wcm9wcy52YWx1ZSB8fCAnJyksIHt9LCAoKSA9PiB7XG5cdFx0XHQvLyB1cGRhdGUgd2l0aCBmZXRjaGVkIGJ1dCBkb24ndCBmb2N1c1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnByb3BzLnZhbHVlLCBmYWxzZSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0bG9hZEFzeW5jT3B0aW9uczogZnVuY3Rpb24oaW5wdXQsIHN0YXRlLCBjYWxsYmFjaykge1xuXHRcdHZhciB0aGlzUmVxdWVzdElkID0gdGhpcy5fY3VycmVudFJlcXVlc3RJZCA9IHJlcXVlc3RJZCsrO1xuXHRcdGlmICh0aGlzLnByb3BzLmNhY2hlQXN5bmNSZXN1bHRzKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8PSBpbnB1dC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgY2FjaGVLZXkgPSBpbnB1dC5zbGljZSgwLCBpKTtcblx0XHRcdFx0aWYgKHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0gJiYgKGlucHV0ID09PSBjYWNoZUtleSB8fCB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLmNvbXBsZXRlKSkge1xuXHRcdFx0XHRcdHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9uc0NhY2hlW2NhY2hlS2V5XS5vcHRpb25zO1xuXHRcdFx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMob3B0aW9ucyk7XG5cdFx0XHRcdFx0dmFyIG5ld1N0YXRlID0ge1xuXHRcdFx0XHRcdFx0b3B0aW9uczogb3B0aW9ucyxcblx0XHRcdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5fZ2V0TmV3Rm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gc3RhdGUpIHtcblx0XHRcdFx0XHRcdGlmIChzdGF0ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRcdFx0XHRcdG5ld1N0YXRlW2tleV0gPSBzdGF0ZVtrZXldO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcblx0XHRcdFx0XHRpZiAoY2FsbGJhY2spIGNhbGxiYWNrLmNhbGwodGhpcywgbmV3U3RhdGUpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMucHJvcHMuYXN5bmNPcHRpb25zKGlucHV0LCAoZXJyLCBkYXRhKSA9PiB7XG5cdFx0XHRpZiAoZXJyKSB0aHJvdyBlcnI7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5jYWNoZUFzeW5jUmVzdWx0cykge1xuXHRcdFx0XHR0aGlzLl9vcHRpb25zQ2FjaGVbaW5wdXRdID0gZGF0YTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzUmVxdWVzdElkICE9PSB0aGlzLl9jdXJyZW50UmVxdWVzdElkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMoZGF0YS5vcHRpb25zKTtcblx0XHRcdHZhciBuZXdTdGF0ZSA9IHtcblx0XHRcdFx0b3B0aW9uczogZGF0YS5vcHRpb25zLFxuXHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5fZ2V0TmV3Rm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIHN0YXRlKSB7XG5cdFx0XHRcdGlmIChzdGF0ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRcdFx0bmV3U3RhdGVba2V5XSA9IHN0YXRlW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuXHRcdFx0aWYgKGNhbGxiYWNrKSBjYWxsYmFjay5jYWxsKHRoaXMsIG5ld1N0YXRlKTtcblx0XHR9KTtcblx0fSxcblxuXHRmaWx0ZXJPcHRpb25zOiBmdW5jdGlvbihvcHRpb25zLCB2YWx1ZXMpIHtcblx0XHR2YXIgZmlsdGVyVmFsdWUgPSB0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nO1xuXHRcdHZhciBleGNsdWRlID0gKHZhbHVlcyB8fCB0aGlzLnN0YXRlLnZhbHVlcykubWFwKGZ1bmN0aW9uKHYpIHtcblx0XHRcdHJldHVybiBnZXRWYWx1ZSh2KTtcblx0XHR9KTtcblx0XHRpZiAodGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucywgZmlsdGVyVmFsdWUsIGV4Y2x1ZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZmlsdGVyT3B0aW9uID0gZnVuY3Rpb24ob3ApIHtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMubXVsdGkgJiYgZXhjbHVkZS5pbmRleE9mKGdldFZhbHVlKG9wKSkgPiAtMSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5maWx0ZXJPcHRpb24pIHJldHVybiB0aGlzLnByb3BzLmZpbHRlck9wdGlvbi5jYWxsKHRoaXMsIG9wLCBmaWx0ZXJWYWx1ZSk7XG5cdFx0XHRcdHZhciB2YWx1ZVRlc3QgPSBTdHJpbmcoZ2V0VmFsdWUob3ApKSwgbGFiZWxUZXN0ID0gU3RyaW5nKGdldExhYmVsKG9wKSk7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmlnbm9yZUNhc2UpIHtcblx0XHRcdFx0XHR2YWx1ZVRlc3QgPSB2YWx1ZVRlc3QudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRsYWJlbFRlc3QgPSBsYWJlbFRlc3QudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRmaWx0ZXJWYWx1ZSA9IGZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuICFmaWx0ZXJWYWx1ZSB8fCAodGhpcy5wcm9wcy5tYXRjaFBvcyA9PT0gJ3N0YXJ0JykgPyAoXG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAnbGFiZWwnICYmIHZhbHVlVGVzdC5zdWJzdHIoMCwgZmlsdGVyVmFsdWUubGVuZ3RoKSA9PT0gZmlsdGVyVmFsdWUpIHx8XG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAndmFsdWUnICYmIGxhYmVsVGVzdC5zdWJzdHIoMCwgZmlsdGVyVmFsdWUubGVuZ3RoKSA9PT0gZmlsdGVyVmFsdWUpXG5cdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAnbGFiZWwnICYmIHZhbHVlVGVzdC5pbmRleE9mKGZpbHRlclZhbHVlKSA+PSAwKSB8fFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3QuaW5kZXhPZihmaWx0ZXJWYWx1ZSkgPj0gMClcblx0XHRcdFx0KTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gKG9wdGlvbnMgfHwgW10pLmZpbHRlcihmaWx0ZXJPcHRpb24sIHRoaXMpO1xuXHRcdH1cblx0fSxcblxuXHRzZWxlY3RGb2N1c2VkT3B0aW9uOiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5hbGxvd0NyZWF0ZSAmJiAhdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLnN0YXRlLmlucHV0VmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pO1xuXHR9LFxuXG5cdGZvY3VzT3B0aW9uOiBmdW5jdGlvbihvcCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Zm9jdXNlZE9wdGlvbjogb3Bcblx0XHR9KTtcblx0fSxcblxuXHRmb2N1c05leHRPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbignbmV4dCcpO1xuXHR9LFxuXG5cdGZvY3VzUHJldmlvdXNPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbigncHJldmlvdXMnKTtcblx0fSxcblxuXHRmb2N1c0FkamFjZW50T3B0aW9uOiBmdW5jdGlvbihkaXIpIHtcblx0XHR0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsID0gdHJ1ZTtcblx0XHR2YXIgb3BzID0gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMuZmlsdGVyKGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHRyZXR1cm4gIWdldFZhbHVlUHJvcChvcCwgJ2Rpc2FibGVkJyk7XG5cdFx0fSk7XG5cdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiB8fCBnZXRBdChvcHMsIGRpciA9PT0gJ25leHQnID8gMCA6IGdldExlbmd0aChvcHMpIC0gMSlcblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCFnZXRMZW5ndGgob3BzKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgZm9jdXNlZEluZGV4ID0gLTE7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBnZXRMZW5ndGgob3BzKTsgaSsrKSB7XG5cdFx0XHRpZiAoaXNFcXVhbFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiwgZ2V0QXQob3BzLGkpKSkge1xuXHRcdFx0XHRmb2N1c2VkSW5kZXggPSBpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFyIGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIDApO1xuXHRcdGlmIChkaXIgPT09ICduZXh0JyAmJiBmb2N1c2VkSW5kZXggPiAtMSAmJiBmb2N1c2VkSW5kZXggPCBnZXRMZW5ndGgob3BzKSAtIDEpIHtcblx0XHRcdGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIGZvY3VzZWRJbmRleCArIDEpO1xuXHRcdH0gZWxzZSBpZiAoZGlyID09PSAncHJldmlvdXMnKSB7XG5cdFx0XHRpZiAoZm9jdXNlZEluZGV4ID4gMCkge1xuXHRcdFx0XHRmb2N1c2VkT3B0aW9uID0gZ2V0QXQob3BzLCBmb2N1c2VkSW5kZXggLSAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIGdldExlbmd0aChvcHMpIC0gMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Zm9jdXNlZE9wdGlvbjogZm9jdXNlZE9wdGlvblxuXHRcdH0pO1xuXHR9LFxuXG5cdHVuZm9jdXNPcHRpb246IGZ1bmN0aW9uKG9wKSB7XG5cdFx0aWYgKGlzRXF1YWxWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24sIG9wKSkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IG51bGxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRidWlsZE1lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmb2N1c2VkVmFsdWUgPSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPyBnZXRWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIDogbnVsbDtcblx0XHR2YXIgcmVuZGVyTGFiZWwgPSB0aGlzLnByb3BzLm9wdGlvblJlbmRlcmVyIHx8IGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHRyZXR1cm4gZ2V0TGFiZWwob3ApO1xuXHRcdH07XG5cdFx0aWYgKGdldExlbmd0aCh0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucykgPiAwKSB7XG5cdFx0XHRmb2N1c2VkVmFsdWUgPSBmb2N1c2VkVmFsdWUgPT0gbnVsbCA/IGdldEF0KHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLCAwKSA6IGZvY3VzZWRWYWx1ZTtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucztcblxuXHRcdC8vVE9ETzogc3VwcG9ydCBhbGxvd0NyZWF0ZSAoaXQgbXV0YXRlcyBgb3B0aW9uc2AsIHdoaWNoIGlzIHN1cHBvc2VkIHRvIGJlIGltbXV0YWJsZSwgY2FsbGluZyBgdW5zaGlmdGAgYmVsb3cpXG5cdFx0Ly8gQWRkIHRoZSBjdXJyZW50IHZhbHVlIHRvIHRoZSBmaWx0ZXJlZCBvcHRpb25zIGluIGxhc3QgcmVzb3J0XG5cdFx0Ly8gaWYgKHRoaXMucHJvcHMuYWxsb3dDcmVhdGUgJiYgdGhpcy5zdGF0ZS5pbnB1dFZhbHVlLnRyaW0oKSkge1xuXHRcdC8vIFx0dmFyIGlucHV0VmFsdWUgPSB0aGlzLnN0YXRlLmlucHV0VmFsdWU7XG5cdFx0Ly8gXHRvcHRpb25zID0gb3B0aW9ucy5zbGljZSgpO1xuXHRcdC8vIFx0dmFyIG5ld09wdGlvbiA9IHRoaXMucHJvcHMubmV3T3B0aW9uQ3JlYXRvciA/IHRoaXMucHJvcHMubmV3T3B0aW9uQ3JlYXRvcihpbnB1dFZhbHVlKSA6IHtcblx0XHQvLyBcdFx0dmFsdWU6IGlucHV0VmFsdWUsXG5cdFx0Ly8gXHRcdGxhYmVsOiBpbnB1dFZhbHVlLFxuXHRcdC8vIFx0XHRjcmVhdGU6IHRydWVcblx0XHQvLyBcdH07XG5cdFx0Ly8gXHRvcHRpb25zLnVuc2hpZnQobmV3T3B0aW9uKTtcblx0XHQvLyB9XG5cdFx0dmFyIG9wcyA9IG9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wLCBrZXkpIHtcblx0XHRcdHZhciBpc1NlbGVjdGVkID0gaXNFcXVhbFZhbHVlKHRoaXMuc3RhdGUudmFsdWUsIGdldFZhbHVlKG9wKSk7XG5cdFx0XHR2YXIgaXNGb2N1c2VkID0gaXNFcXVhbFZhbHVlKGZvY3VzZWRWYWx1ZSwgZ2V0VmFsdWUob3ApKTtcblx0XHRcdHZhciBvcHRpb25DbGFzcyA9IGNsYXNzZXMoe1xuXHRcdFx0XHQnU2VsZWN0LW9wdGlvbic6IHRydWUsXG5cdFx0XHRcdCdpcy1zZWxlY3RlZCc6IGlzU2VsZWN0ZWQsXG5cdFx0XHRcdCdpcy1mb2N1c2VkJzogaXNGb2N1c2VkLFxuXHRcdFx0XHQnaXMtZGlzYWJsZWQnOiBnZXRWYWx1ZVByb3Aob3AsICdkaXNhYmxlZCcpXG5cdFx0XHR9KTtcblx0XHRcdHZhciByZWYgPSBpc0ZvY3VzZWQgPyAnZm9jdXNlZCcgOiBudWxsO1xuXHRcdFx0dmFyIG1vdXNlRW50ZXIgPSB0aGlzLmZvY3VzT3B0aW9uLmJpbmQodGhpcywgb3ApO1xuXHRcdFx0dmFyIG1vdXNlTGVhdmUgPSB0aGlzLnVuZm9jdXNPcHRpb24uYmluZCh0aGlzLCBvcCk7XG5cdFx0XHR2YXIgbW91c2VEb3duID0gdGhpcy5zZWxlY3RWYWx1ZS5iaW5kKHRoaXMsIG9wKTtcblx0XHRcdHZhciBvcHRpb25SZXN1bHQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMub3B0aW9uQ29tcG9uZW50LCB7XG5cdFx0XHRcdGtleTogJ29wdGlvbi0nICsgZ2V0VmFsdWUob3ApLFxuXHRcdFx0XHRjbGFzc05hbWU6IG9wdGlvbkNsYXNzLFxuXHRcdFx0XHRyZW5kZXJGdW5jOiByZW5kZXJMYWJlbCxcblx0XHRcdFx0bW91c2VFbnRlcjogbW91c2VFbnRlcixcblx0XHRcdFx0bW91c2VMZWF2ZTogbW91c2VMZWF2ZSxcblx0XHRcdFx0bW91c2VEb3duOiBtb3VzZURvd24sXG5cdFx0XHRcdGNsaWNrOiBtb3VzZURvd24sXG5cdFx0XHRcdGFkZExhYmVsVGV4dDogdGhpcy5wcm9wcy5hZGRMYWJlbFRleHQsXG5cdFx0XHRcdG9wdGlvbjogb3AsXG5cdFx0XHRcdHJlZjogcmVmXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBvcHRpb25SZXN1bHQ7XG5cdFx0fSwgdGhpcyk7XG5cdFx0cmV0dXJuIGdldExlbmd0aChvcHMpID8gb3BzIDogKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3Qtbm9yZXN1bHRzXCI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiAhdGhpcy5zdGF0ZS5pbnB1dFZhbHVlID8gdGhpcy5wcm9wcy5zZWFyY2hQcm9tcHRUZXh0IDogdGhpcy5wcm9wcy5ub1Jlc3VsdHNUZXh0fVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fSxcblxuXHRoYW5kbGVPcHRpb25MYWJlbENsaWNrOiBmdW5jdGlvbiAodmFsdWUsIGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljayh2YWx1ZSwgZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3RDbGFzcyA9IGNsYXNzZXMoJ1NlbGVjdCcsIHRoaXMucHJvcHMuY2xhc3NOYW1lLCB7XG5cdFx0XHQnaXMtbXVsdGknOiB0aGlzLnByb3BzLm11bHRpLFxuXHRcdFx0J2lzLXNlYXJjaGFibGUnOiB0aGlzLnByb3BzLnNlYXJjaGFibGUsXG5cdFx0XHQnaXMtb3Blbic6IHRoaXMuc3RhdGUuaXNPcGVuLFxuXHRcdFx0J2lzLWZvY3VzZWQnOiB0aGlzLnN0YXRlLmlzRm9jdXNlZCxcblx0XHRcdCdpcy1sb2FkaW5nJzogdGhpcy5zdGF0ZS5pc0xvYWRpbmcsXG5cdFx0XHQnaXMtZGlzYWJsZWQnOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuXHRcdFx0J2hhcy12YWx1ZSc6IHRoaXMuc3RhdGUudmFsdWVcblx0XHR9KTtcblx0XHR2YXIgdmFsdWUgPSBbXTtcblx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuXHRcdFx0dGhpcy5zdGF0ZS52YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWwpIHtcblx0XHRcdFx0dmFyIG9uT3B0aW9uTGFiZWxDbGljayA9IHRoaXMuaGFuZGxlT3B0aW9uTGFiZWxDbGljay5iaW5kKHRoaXMsIHZhbCk7XG5cdFx0XHRcdHZhciBvblJlbW92ZSA9IHRoaXMucmVtb3ZlVmFsdWUuYmluZCh0aGlzLCB2YWwpO1xuXHRcdFx0XHR2YXIgdmFsdWVDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMudmFsdWVDb21wb25lbnQsIHtcblx0XHRcdFx0XHRrZXk6IGdldFZhbHVlKHZhbCksXG5cdFx0XHRcdFx0b3B0aW9uOiB2YWwsXG5cdFx0XHRcdFx0cmVuZGVyZXI6IHRoaXMucHJvcHMudmFsdWVSZW5kZXJlcixcblx0XHRcdFx0XHRvcHRpb25MYWJlbENsaWNrOiAhIXRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrLFxuXHRcdFx0XHRcdG9uT3B0aW9uTGFiZWxDbGljazogb25PcHRpb25MYWJlbENsaWNrLFxuXHRcdFx0XHRcdG9uUmVtb3ZlOiBvblJlbW92ZSxcblx0XHRcdFx0XHRkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0dmFsdWUucHVzaCh2YWx1ZUNvbXBvbmVudCk7XG5cdFx0XHR9LCB0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSAmJiAoIXRoaXMucHJvcHMubXVsdGkgfHwgIXZhbHVlLmxlbmd0aCkpIHtcblx0XHRcdHZhciB2YWwgPSBnZXRBdCh0aGlzLnN0YXRlLnZhbHVlcywgMCkgfHwgbnVsbDtcblx0XHRcdGlmICh0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXIgJiYgISFnZXRMZW5ndGgodGhpcy5zdGF0ZS52YWx1ZXMpKSB7XG5cdFx0XHRcdHZhbHVlLnB1c2goPFZhbHVlXG5cdFx0XHRcdFx0XHRrZXk9ezB9XG5cdFx0XHRcdFx0XHRvcHRpb249e3ZhbH1cblx0XHRcdFx0XHRcdHJlbmRlcmVyPXt0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXJ9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH0gLz4pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIHNpbmdsZVZhbHVlQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudCh0aGlzLnByb3BzLnNpbmdsZVZhbHVlQ29tcG9uZW50LCB7XG5cdFx0XHRcdFx0a2V5OiAncGxhY2Vob2xkZXInLFxuXHRcdFx0XHRcdHZhbHVlOiB2YWwsXG5cdFx0XHRcdFx0cGxhY2Vob2xkZXI6IHRoaXMuc3RhdGUucGxhY2Vob2xkZXJcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHZhbHVlLnB1c2goc2luZ2xlVmFsdWVDb21wb25lbnQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBsb2FkaW5nID0gdGhpcy5zdGF0ZS5pc0xvYWRpbmcgPyA8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtbG9hZGluZ1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbDtcblx0XHR2YXIgY2xlYXIgPSB0aGlzLnByb3BzLmNsZWFyYWJsZSAmJiB0aGlzLnN0YXRlLnZhbHVlICYmICF0aGlzLnByb3BzLmRpc2FibGVkID8gPHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWNsZWFyXCIgdGl0bGU9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IG9uTW91c2VEb3duPXt0aGlzLmNsZWFyVmFsdWV9IG9uQ2xpY2s9e3RoaXMuY2xlYXJWYWx1ZX0gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiAnJnRpbWVzOycgfX0gLz4gOiBudWxsO1xuXG5cdFx0dmFyIG1lbnU7XG5cdFx0dmFyIG1lbnVQcm9wcztcblx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdG1lbnVQcm9wcyA9IHtcblx0XHRcdFx0cmVmOiAnbWVudScsXG5cdFx0XHRcdGNsYXNzTmFtZTogJ1NlbGVjdC1tZW51J1xuXHRcdFx0fTtcblx0XHRcdGlmICh0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHRcdG1lbnVQcm9wcy5vbk1vdXNlRG93biA9IHRoaXMuaGFuZGxlTW91c2VEb3duO1xuXHRcdFx0fVxuXHRcdFx0bWVudSA9IChcblx0XHRcdFx0PGRpdiByZWY9XCJzZWxlY3RNZW51Q29udGFpbmVyXCIgY2xhc3NOYW1lPVwiU2VsZWN0LW1lbnUtb3V0ZXJcIj5cblx0XHRcdFx0XHQ8ZGl2IHsuLi5tZW51UHJvcHN9Pnt0aGlzLmJ1aWxkTWVudSgpfTwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dmFyIGlucHV0O1xuXHRcdHZhciBpbnB1dFByb3BzID0ge1xuXHRcdFx0cmVmOiAnaW5wdXQnLFxuXHRcdFx0Y2xhc3NOYW1lOiAnU2VsZWN0LWlucHV0ICcgKyAodGhpcy5wcm9wcy5pbnB1dFByb3BzLmNsYXNzTmFtZSB8fCAnJyksXG5cdFx0XHR0YWJJbmRleDogdGhpcy5wcm9wcy50YWJJbmRleCB8fCAwLFxuXHRcdFx0b25Gb2N1czogdGhpcy5oYW5kbGVJbnB1dEZvY3VzLFxuXHRcdFx0b25CbHVyOiB0aGlzLmhhbmRsZUlucHV0Qmx1clxuXHRcdH07XG5cdFx0Zm9yICh2YXIga2V5IGluIHRoaXMucHJvcHMuaW5wdXRQcm9wcykge1xuXHRcdFx0aWYgKHRoaXMucHJvcHMuaW5wdXRQcm9wcy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPT0gJ2NsYXNzTmFtZScpIHtcblx0XHRcdFx0aW5wdXRQcm9wc1trZXldID0gdGhpcy5wcm9wcy5pbnB1dFByb3BzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnByb3BzLmRpc2FibGVkKSB7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5zZWFyY2hhYmxlKSB7XG5cdFx0XHRcdGlucHV0ID0gPElucHV0IHZhbHVlPXt0aGlzLnN0YXRlLmlucHV0VmFsdWV9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUlucHV0Q2hhbmdlfSBtaW5XaWR0aD1cIjVcIiB7Li4uaW5wdXRQcm9wc30gLz47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbnB1dCA9IDxkaXYgey4uLmlucHV0UHJvcHN9PiZuYnNwOzwvZGl2Pjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCF0aGlzLnByb3BzLm11bHRpIHx8ICFnZXRMZW5ndGgodGhpcy5zdGF0ZS52YWx1ZXMpKSB7XG5cdFx0XHRpbnB1dCA9IDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWlucHV0XCI+Jm5ic3A7PC9kaXY+O1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IHJlZj1cIndyYXBwZXJcIiBjbGFzc05hbWU9e3NlbGVjdENsYXNzfT5cblx0XHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiByZWY9XCJ2YWx1ZVwiIG5hbWU9e3RoaXMucHJvcHMubmFtZX0gdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9IGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfSAvPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1jb250cm9sXCIgcmVmPVwiY29udHJvbFwiIG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlEb3dufSBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlTW91c2VEb3dufT5cblx0XHRcdFx0XHR7dmFsdWV9XG5cdFx0XHRcdFx0e2lucHV0fVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvdy16b25lXCIgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3duT25BcnJvd30gLz5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtYXJyb3dcIiBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd25PbkFycm93fSAvPlxuXHRcdFx0XHRcdHtsb2FkaW5nfVxuXHRcdFx0XHRcdHtjbGVhcn1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdHttZW51fVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Q7XG4iXX0=
