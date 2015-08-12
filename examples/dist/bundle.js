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
  return typeof obj.toJS != 'undefined';
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
		options: React.PropTypes.array, // array of options
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
		if (JSON.stringify(newProps.options) !== JSON.stringify(this.props.options)) {
			optionsChanged = true;
			this.setState({
				options: newProps.options,
				filteredOptions: this.filterOptions(newProps.options)
			});
		}
		if (newProps.value !== this.state.value || newProps.placeholder !== this.props.placeholder || optionsChanged) {
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

					return opValue === val || typeof opValue === 'number' && opValue.toString() === val;
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
		this.setValue(this.state.values.concat(value));
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
			if (this.state.focusedOption === getAt(ops, i)) {
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
				focusedOption = getAt(ops, ops.length - 1);
			}
		}
		this.setState({
			focusedOption: focusedOption
		});
	},

	unfocusOption: function unfocusOption(op) {
		if (this.state.focusedOption === op) {
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
			var isSelected = this.state.value === getValue(op);
			var isFocused = focusedValue === getValue(op);
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
		return ops.length ? ops : React.createElement(
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvT3B0aW9uLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvU2luZ2xlVmFsdWUuanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L3NyYy9WYWx1ZS5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3Qvc3JjL2FycmF5RmluZFBvbHlmaWxsLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvaW1tdXRhYmxlL3V0aWxzLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvU2VsZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsUUFBUSxDQUFDOztBQUVyRCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDOUIsVUFBUyxFQUFFO0FBQ1YsY0FBWSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtBQUNwQyxXQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ2pD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QUFDLE9BQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEFBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUMsR0FBRztHQUNsSDs7TUFBSyxTQUFTLEVBQUMsZ0JBQWdCLEVBQUMsR0FBRyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQUFBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7SUFDL0ksS0FBSztJQUNMLEtBQUs7SUFDTiw4QkFBTSxTQUFTLEVBQUMsbUJBQW1CLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQUFBQyxHQUFHO0lBQ2hGLDhCQUFNLFNBQVMsRUFBQyxjQUFjLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQUFBQyxHQUFHO0lBQzFFLE9BQU87SUFDUCxLQUFLO0lBQ0Q7R0FDTCxJQUFJO0dBQ0EsQ0FDTDtFQUNGOztDQUVELENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGdldExhYmVsID0gcmVxdWlyZSgnLi9pbW11dGFibGUvdXRpbHMnKS5nZXRMYWJlbDtcblxudmFyIE9wdGlvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG5cdFx0YWRkTGFiZWxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyBzdHJpbmcgcmVuZGVyZWQgaW4gY2FzZSBvZiBhbGxvd0NyZWF0ZSBvcHRpb24gcGFzc2VkIHRvIFJlYWN0U2VsZWN0XG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgICAvLyBjbGFzc05hbWUgKGJhc2VkIG9uIG1vdXNlIHBvc2l0aW9uKVxuXHRcdG1vdXNlRG93bjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSBjbGljayBvbiBvcHRpb24gZWxlbWVudFxuXHRcdG1vdXNlRW50ZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSBtb3VzZUVudGVyIG9uIG9wdGlvbiBlbGVtZW50XG5cdFx0bW91c2VMZWF2ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIG1vdXNlTGVhdmUgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRvcHRpb246IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCwgICAgIC8vIG9iamVjdCB0aGF0IGlzIGJhc2UgZm9yIHRoYXQgb3B0aW9uXG5cdFx0cmVuZGVyRnVuYzogUmVhY3QuUHJvcFR5cGVzLmZ1bmMgICAgICAgICAgICAgICAvLyBtZXRob2QgcGFzc2VkIHRvIFJlYWN0U2VsZWN0IGNvbXBvbmVudCB0byByZW5kZXIgbGFiZWwgdGV4dFxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9iaiA9IHRoaXMucHJvcHMub3B0aW9uO1xuXHRcdHZhciByZW5kZXJlZExhYmVsID0gdGhpcy5wcm9wcy5yZW5kZXJGdW5jKG9iaik7XG5cblx0XHRyZXR1cm4gb2JqLmRpc2FibGVkID8gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfT57cmVuZGVyZWRMYWJlbH08L2Rpdj5cblx0XHQpIDogKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfVxuXHRcdFx0XHRvbk1vdXNlRW50ZXI9e3RoaXMucHJvcHMubW91c2VFbnRlcn1cblx0XHRcdFx0b25Nb3VzZUxlYXZlPXt0aGlzLnByb3BzLm1vdXNlTGVhdmV9XG5cdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLnByb3BzLm1vdXNlRG93bn1cblx0XHRcdFx0b25DbGljaz17dGhpcy5wcm9wcy5tb3VzZURvd259PlxuXHRcdFx0XHR7IG9iai5jcmVhdGUgPyB0aGlzLnByb3BzLmFkZExhYmVsVGV4dC5yZXBsYWNlKCd7bGFiZWx9JywgZ2V0TGFiZWwob2JqKSkgOiByZW5kZXJlZExhYmVsIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBTaW5nbGVWYWx1ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG5cdFx0cGxhY2Vob2xkZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgIC8vIHRoaXMgaXMgZGVmYXVsdCB2YWx1ZSBwcm92aWRlZCBieSBSZWFjdC1TZWxlY3QgYmFzZWQgY29tcG9uZW50XG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QgICAgICAgICAgICAgIC8vIHNlbGVjdGVkIG9wdGlvblxuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1wbGFjZWhvbGRlclwiPnt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfTwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZVZhbHVlO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBnZXRMYWJlbCA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlL3V0aWxzJykuZ2V0TGFiZWw7XG5cbnZhciBWYWx1ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRkaXNwbGF5TmFtZTogJ1ZhbHVlJyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgICAgICAgIC8vIGRpc2FibGVkIHByb3AgcGFzc2VkIHRvIFJlYWN0U2VsZWN0XG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIGNsaWNrIG9uIHZhbHVlIGxhYmVsXG5cdFx0b25SZW1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIHJlbW92ZSBvZiB0aGF0IHZhbHVlXG5cdFx0b3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsICAgICAgICAvLyBvcHRpb24gcGFzc2VkIHRvIGNvbXBvbmVudFxuXHRcdG9wdGlvbkxhYmVsQ2xpY2s6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgLy8gaW5kaWNhdGVzIGlmIG9uT3B0aW9uTGFiZWxDbGljayBzaG91bGQgYmUgaGFuZGxlZFxuXHRcdHJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyAgICAgICAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIHJlbmRlciBvcHRpb24gbGFiZWwgcGFzc2VkIHRvIFJlYWN0U2VsZWN0XG5cdH0sXG5cblx0YmxvY2tFdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0fSxcblxuXHRoYW5kbGVPblJlbW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMuZGlzYWJsZWQpIHtcblx0XHRcdHRoaXMucHJvcHMub25SZW1vdmUoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsYWJlbCA9IGdldExhYmVsKHRoaXMucHJvcHMub3B0aW9uKTtcblx0XHRpZiAodGhpcy5wcm9wcy5yZW5kZXJlcikge1xuXHRcdFx0bGFiZWwgPSB0aGlzLnByb3BzLnJlbmRlcmVyKHRoaXMucHJvcHMub3B0aW9uKTtcblx0XHR9XG5cblx0XHRpZighdGhpcy5wcm9wcy5vblJlbW92ZSAmJiAhdGhpcy5wcm9wcy5vcHRpb25MYWJlbENsaWNrKSB7XG5cdFx0XHRyZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtdmFsdWVcIj57bGFiZWx9PC9kaXY+O1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnByb3BzLm9wdGlvbkxhYmVsQ2xpY2spIHtcblx0XHRcdGxhYmVsID0gKFxuXHRcdFx0XHQ8YSBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbS1sYWJlbF9fYVwiXG5cdFx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuYmxvY2tFdmVudH1cblx0XHRcdFx0XHRvblRvdWNoRW5kPXt0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGlja31cblx0XHRcdFx0XHRvbkNsaWNrPXt0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGlja30+XG5cdFx0XHRcdFx0e2xhYmVsfVxuXHRcdFx0XHQ8L2E+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtXCI+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWljb25cIlxuXHRcdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLmJsb2NrRXZlbnR9XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy5oYW5kbGVPblJlbW92ZX1cblx0XHRcdFx0XHRvblRvdWNoRW5kPXt0aGlzLmhhbmRsZU9uUmVtb3ZlfT4mdGltZXM7PC9zcGFuPlxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZhbHVlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL3NvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZmluZFxuaWYgKCFBcnJheS5wcm90b3R5cGUuZmluZCkge1xuICBBcnJheS5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuICAgIGlmICh0aGlzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheS5wcm90b3R5cGUuZmluZCBjYWxsZWQgb24gbnVsbCBvciB1bmRlZmluZWQnKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ByZWRpY2F0ZSBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG4gICAgdmFyIGxpc3QgPSBPYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoID4+PiAwO1xuICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgIHZhciB2YWx1ZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgbGlzdCkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gaXNJbW11dGFibGUob2JqKXtcblx0cmV0dXJuIHR5cGVvZiBvYmoudG9KUyAhPSAndW5kZWZpbmVkJ1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZVByb3Aob2JqLCBwcm9wZXJ0eSl7XG4gIGlmKCFvYmopIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZihpc0ltbXV0YWJsZShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5nZXQocHJvcGVydHkpO1xuICB9XG4gIHJldHVybiBvYmpbcHJvcGVydHldO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmope1xuICByZXR1cm4gZ2V0VmFsdWVQcm9wKG9iaiwgJ3ZhbHVlJyk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsKG9iail7XG4gIHJldHVybiBnZXRWYWx1ZVByb3Aob2JqLCAnbGFiZWwnKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGVuZ3RoKG9iail7XG5cdGlmKCFvYmopIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICBpZihpc0ltbXV0YWJsZShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5zaXplXG4gIH1cbiAgcmV0dXJuIG9iai5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGdldEF0KG9iaiwgaW5kZXgpIHtcblx0aWYoIW9iail7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYoaXNJbW11dGFibGUob2JqKSl7XG5cdFx0cmV0dXJuIG9iai5nZXQoaW5kZXgpO1xuXHR9XG5cblx0cmV0dXJuIG9ialtpbmRleF07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRpc0ltbXV0YWJsZTogaXNJbW11dGFibGUsXG5cdGdldFZhbHVlOiBnZXRWYWx1ZSxcblx0Z2V0TGFiZWw6IGdldExhYmVsLFxuXHRnZXRWYWx1ZVByb3A6IGdldFZhbHVlUHJvcCxcblx0Z2V0TGVuZ3RoOiBnZXRMZW5ndGgsXG5cdGdldEF0OiBnZXRBdFxufTtcbiIsIi8qIGRpc2FibGUgc29tZSBydWxlcyB1bnRpbCB3ZSByZWZhY3RvciBtb3JlIGNvbXBsZXRlbHk7IGZpeGluZyB0aGVtIG5vdyB3b3VsZFxuICAgY2F1c2UgY29uZmxpY3RzIHdpdGggc29tZSBvcGVuIFBScyB1bm5lY2Vzc2FyaWx5LiAqL1xuLyogZXNsaW50IHJlYWN0L2pzeC1zb3J0LXByb3AtdHlwZXM6IDAsIHJlYWN0L3NvcnQtY29tcDogMCwgcmVhY3QvcHJvcC10eXBlczogMCAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIElucHV0ID0gcmVxdWlyZSgncmVhY3QtaW5wdXQtYXV0b3NpemUnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xudmFyIFZhbHVlID0gcmVxdWlyZSgnLi9WYWx1ZScpO1xudmFyIFNpbmdsZVZhbHVlID0gcmVxdWlyZSgnLi9TaW5nbGVWYWx1ZScpO1xudmFyIE9wdGlvbiA9IHJlcXVpcmUoJy4vT3B0aW9uJyk7XG52YXIgaW1tdXRhYmxlVXRpbHMgPSByZXF1aXJlKCcuL2ltbXV0YWJsZS91dGlscycpO1xucmVxdWlyZSgnLi9hcnJheUZpbmRQb2x5ZmlsbCcpO1xuXG52YXIgaXNJbW11dGFibGUgPSBpbW11dGFibGVVdGlscy5pc0ltbXV0YWJsZSxcblx0XHRnZXRWYWx1ZSA9IGltbXV0YWJsZVV0aWxzLmdldFZhbHVlLFxuXHRcdGdldExhYmVsID0gaW1tdXRhYmxlVXRpbHMuZ2V0TGFiZWwsXG5cdFx0Z2V0VmFsdWVQcm9wID0gaW1tdXRhYmxlVXRpbHMuZ2V0VmFsdWVQcm9wLFxuXHRcdGdldExlbmd0aCA9IGltbXV0YWJsZVV0aWxzLmdldExlbmd0aCxcblx0XHRnZXRBdCA9IGltbXV0YWJsZVV0aWxzLmdldEF0O1xuXG52YXIgcmVxdWVzdElkID0gMDtcblxudmFyIFNlbGVjdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRkaXNwbGF5TmFtZTogJ1NlbGVjdCcsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0YWRkTGFiZWxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgIC8vIHBsYWNlaG9sZGVyIGRpc3BsYXllZCB3aGVuIHlvdSB3YW50IHRvIGFkZCBhIGxhYmVsIG9uIGEgbXVsdGktdmFsdWUgaW5wdXRcblx0XHRhbGxvd0NyZWF0ZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgLy8gd2hldGhlciB0byBhbGxvdyBjcmVhdGlvbiBvZiBuZXcgZW50cmllc1xuXHRcdGFzeW5jT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAvLyBmdW5jdGlvbiB0byBjYWxsIHRvIGdldCBvcHRpb25zXG5cdFx0YXV0b2xvYWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdG8gYXV0by1sb2FkIHRoZSBkZWZhdWx0IGFzeW5jIG9wdGlvbnMgc2V0XG5cdFx0YmFja3NwYWNlUmVtb3ZlczogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgIC8vIHdoZXRoZXIgYmFja3NwYWNlIHJlbW92ZXMgYW4gaXRlbSBpZiB0aGVyZSBpcyBubyB0ZXh0IGlucHV0XG5cdFx0Y2FjaGVBc3luY1Jlc3VsdHM6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgIC8vIHdoZXRoZXIgdG8gYWxsb3cgY2FjaGVcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gY2xhc3NOYW1lIGZvciB0aGUgb3V0ZXIgZWxlbWVudFxuXHRcdGNsZWFyQWxsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sIHdoZW4gbXVsdGk6IHRydWVcblx0XHRjbGVhclZhbHVlVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgLy8gdGl0bGUgZm9yIHRoZSBcImNsZWFyXCIgY29udHJvbFxuXHRcdGNsZWFyYWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAvLyBzaG91bGQgaXQgYmUgcG9zc2libGUgdG8gcmVzZXQgdmFsdWVcblx0XHRkZWxpbWl0ZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gZGVsaW1pdGVyIHRvIHVzZSB0byBqb2luIG11bHRpcGxlIHZhbHVlc1xuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAvLyB3aGV0aGVyIHRoZSBTZWxlY3QgaXMgZGlzYWJsZWQgb3Igbm90XG5cdFx0ZmlsdGVyT3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIG1ldGhvZCB0byBmaWx0ZXIgYSBzaW5nbGUgb3B0aW9uOiBmdW5jdGlvbihvcHRpb24sIGZpbHRlclN0cmluZylcblx0XHRmaWx0ZXJPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciB0aGUgb3B0aW9ucyBhcnJheTogZnVuY3Rpb24oW29wdGlvbnNdLCBmaWx0ZXJTdHJpbmcsIFt2YWx1ZXNdKVxuXHRcdGlnbm9yZUNhc2U6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyB3aGV0aGVyIHRvIHBlcmZvcm0gY2FzZS1pbnNlbnNpdGl2ZSBmaWx0ZXJpbmdcblx0XHRpbnB1dFByb3BzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LCAgICAgICAgLy8gY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIHRoZSBJbnB1dCAoaW4gdGhlIFNlbGVjdC1jb250cm9sKSBlLmc6IHsnZGF0YS1mb28nOiAnYmFyJ31cblx0XHRtYXRjaFBvczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgLy8gKGFueXxzdGFydCkgbWF0Y2ggdGhlIHN0YXJ0IG9yIGVudGlyZSBzdHJpbmcgd2hlbiBmaWx0ZXJpbmdcblx0XHRtYXRjaFByb3A6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgLy8gKGFueXxsYWJlbHx2YWx1ZSkgd2hpY2ggb3B0aW9uIHByb3BlcnR5IHRvIGZpbHRlciBvblxuXHRcdG11bHRpOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAvLyBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdG5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAgICAvLyBmaWVsZCBuYW1lLCBmb3IgaGlkZGVuIDxpbnB1dCAvPiB0YWdcblx0XHRuZXdPcHRpb25DcmVhdG9yOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgLy8gZmFjdG9yeSB0byBjcmVhdGUgbmV3IG9wdGlvbnMgd2hlbiBhbGxvd0NyZWF0ZSBzZXRcblx0XHRub1Jlc3VsdHNUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoaW5nIHNlYXJjaCByZXN1bHRzXG5cdFx0b25CbHVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG9uQmx1ciBoYW5kbGVyOiBmdW5jdGlvbihldmVudCkge31cblx0XHRvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgLy8gb25DaGFuZ2UgaGFuZGxlcjogZnVuY3Rpb24obmV3VmFsdWUpIHt9XG5cdFx0b25Gb2N1czogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgIC8vIG9uRm9jdXMgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIHt9XG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgIC8vIG9uQ0xpY2sgaGFuZGxlciBmb3IgdmFsdWUgbGFiZWxzOiBmdW5jdGlvbiAodmFsdWUsIGV2ZW50KSB7fVxuXHRcdG9wdGlvbkNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAvLyBvcHRpb24gY29tcG9uZW50IHRvIHJlbmRlciBpbiBkcm9wZG93blxuXHRcdG9wdGlvblJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAvLyBvcHRpb25SZW5kZXJlcjogZnVuY3Rpb24ob3B0aW9uKSB7fVxuXHRcdG9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheSwgICAgICAgICAgICAvLyBhcnJheSBvZiBvcHRpb25zXG5cdFx0cGxhY2Vob2xkZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgIC8vIGZpZWxkIHBsYWNlaG9sZGVyLCBkaXNwbGF5ZWQgd2hlbiB0aGVyZSdzIG5vIHZhbHVlXG5cdFx0c2VhcmNoYWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgIC8vIHdoZXRoZXIgdG8gZW5hYmxlIHNlYXJjaGluZyBmZWF0dXJlIG9yIG5vdFxuXHRcdHNlYXJjaFByb21wdFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAvLyBsYWJlbCB0byBwcm9tcHQgZm9yIHNlYXJjaCBpbnB1dFxuXHRcdHNpbmdsZVZhbHVlQ29tcG9uZW50OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywvLyBzaW5nbGUgdmFsdWUgY29tcG9uZW50IHdoZW4gbXVsdGlwbGUgaXMgc2V0IHRvIGZhbHNlXG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5hbnksICAgICAgICAgICAgICAgIC8vIGluaXRpYWwgZmllbGQgdmFsdWVcblx0XHR2YWx1ZUNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgLy8gdmFsdWUgY29tcG9uZW50IHRvIHJlbmRlciBpbiBtdWx0aXBsZSBtb2RlXG5cdFx0dmFsdWVSZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMgICAgICAgIC8vIHZhbHVlUmVuZGVyZXI6IGZ1bmN0aW9uKG9wdGlvbikge31cblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhZGRMYWJlbFRleHQ6ICdBZGljaW9uYXIge2xhYmVsfSA/Jyxcblx0XHRcdGFsbG93Q3JlYXRlOiBmYWxzZSxcblx0XHRcdGFzeW5jT3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0YXV0b2xvYWQ6IHRydWUsXG5cdFx0XHRiYWNrc3BhY2VSZW1vdmVzOiB0cnVlLFxuXHRcdFx0Y2FjaGVBc3luY1Jlc3VsdHM6IHRydWUsXG5cdFx0XHRjbGFzc05hbWU6IHVuZGVmaW5lZCxcblx0XHRcdGNsZWFyQWxsVGV4dDogJ0xpbXBhciB0b2RvcycsXG5cdFx0XHRjbGVhclZhbHVlVGV4dDogJ0xpbXBhcicsXG5cdFx0XHRjbGVhcmFibGU6IHRydWUsXG5cdFx0XHRkZWxpbWl0ZXI6ICcsJyxcblx0XHRcdGRpc2FibGVkOiBmYWxzZSxcblx0XHRcdGlnbm9yZUNhc2U6IHRydWUsXG5cdFx0XHRpbnB1dFByb3BzOiB7fSxcblx0XHRcdG1hdGNoUG9zOiAnYW55Jyxcblx0XHRcdG1hdGNoUHJvcDogJ2FueScsXG5cdFx0XHRuYW1lOiB1bmRlZmluZWQsXG5cdFx0XHRuZXdPcHRpb25DcmVhdG9yOiB1bmRlZmluZWQsXG5cdFx0XHRub1Jlc3VsdHNUZXh0OiAnTmVuaHVtIHJlc3VsdGFkbyBlbmNvbnRyYWRvJyxcblx0XHRcdG9uQ2hhbmdlOiB1bmRlZmluZWQsXG5cdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IHVuZGVmaW5lZCxcblx0XHRcdG9wdGlvbkNvbXBvbmVudDogT3B0aW9uLFxuXHRcdFx0b3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0cGxhY2Vob2xkZXI6ICdTZWxlY2lvbmUuLi4nLFxuXHRcdFx0c2VhcmNoYWJsZTogdHJ1ZSxcblx0XHRcdHNlYXJjaFByb21wdFRleHQ6ICdEaWdpdGUgcGFyYSBidXNjYXInLFxuXHRcdFx0c2luZ2xlVmFsdWVDb21wb25lbnQ6IFNpbmdsZVZhbHVlLFxuXHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdHZhbHVlQ29tcG9uZW50OiBWYWx1ZVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Lypcblx0XHRcdCAqIHNldCBieSBnZXRTdGF0ZUZyb21WYWx1ZSBvbiBjb21wb25lbnRXaWxsTW91bnQ6XG5cdFx0XHQgKiAtIHZhbHVlXG5cdFx0XHQgKiAtIHZhbHVlc1xuXHRcdFx0ICogLSBmaWx0ZXJlZE9wdGlvbnNcblx0XHRcdCAqIC0gaW5wdXRWYWx1ZVxuXHRcdFx0ICogLSBwbGFjZWhvbGRlclxuXHRcdFx0ICogLSBmb2N1c2VkT3B0aW9uXG5cdFx0XHQqL1xuXHRcdFx0aXNGb2N1c2VkOiBmYWxzZSxcblx0XHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0b3B0aW9uczogdGhpcy5wcm9wcy5vcHRpb25zXG5cdFx0fTtcblx0fSxcblxuXHRjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX29wdGlvbnNDYWNoZSA9IHt9O1xuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblx0XHR0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBtZW51RWxlbSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5zZWxlY3RNZW51Q29udGFpbmVyKTtcblx0XHRcdHZhciBjb250cm9sRWxlbSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5jb250cm9sKTtcblxuXHRcdFx0dmFyIGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ID0gdGhpcy5jbGlja2VkT3V0c2lkZUVsZW1lbnQobWVudUVsZW0sIGV2ZW50KTtcblx0XHRcdHZhciBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCA9IHRoaXMuY2xpY2tlZE91dHNpZGVFbGVtZW50KGNvbnRyb2xFbGVtLCBldmVudCk7XG5cblx0XHRcdC8vIEhpZGUgZHJvcGRvd24gbWVudSBpZiBjbGljayBvY2N1cnJlZCBvdXRzaWRlIG9mIG1lbnVcblx0XHRcdGlmIChldmVudE9jY3VyZWRPdXRzaWRlTWVudSAmJiBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCkge1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0XHRcdH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICghZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAmJiBkb2N1bWVudC5hdHRhY2hFdmVudCkge1xuXHRcdFx0XHRkb2N1bWVudC5hdHRhY2hFdmVudCgnb25jbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICghZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAmJiBkb2N1bWVudC5kZXRhY2hFdmVudCkge1xuXHRcdFx0XHRkb2N1bWVudC5kZXRhY2hFdmVudCgnb25jbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5nZXRTdGF0ZUZyb21WYWx1ZSh0aGlzLnByb3BzLnZhbHVlKSk7XG5cdH0sXG5cblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiB0aGlzLnByb3BzLmF1dG9sb2FkKSB7XG5cdFx0XHR0aGlzLmF1dG9sb2FkQXN5bmNPcHRpb25zKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fYmx1clRpbWVvdXQpO1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9mb2N1c1RpbWVvdXQpO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXdQcm9wcykge1xuXHRcdHZhciBvcHRpb25zQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdGlmIChKU09OLnN0cmluZ2lmeShuZXdQcm9wcy5vcHRpb25zKSAhPT0gSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5vcHRpb25zKSkge1xuXHRcdFx0b3B0aW9uc0NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG9wdGlvbnM6IG5ld1Byb3BzLm9wdGlvbnMsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogdGhpcy5maWx0ZXJPcHRpb25zKG5ld1Byb3BzLm9wdGlvbnMpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKG5ld1Byb3BzLnZhbHVlICE9PSB0aGlzLnN0YXRlLnZhbHVlIHx8IG5ld1Byb3BzLnBsYWNlaG9sZGVyICE9PSB0aGlzLnByb3BzLnBsYWNlaG9sZGVyIHx8IG9wdGlvbnNDaGFuZ2VkKSB7XG5cdFx0XHR2YXIgc2V0U3RhdGUgPSAobmV3U3RhdGUpID0+IHtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlRnJvbVZhbHVlKG5ld1Byb3BzLnZhbHVlLFxuXHRcdFx0XHRcdChuZXdTdGF0ZSAmJiBuZXdTdGF0ZS5vcHRpb25zKSB8fCBuZXdQcm9wcy5vcHRpb25zLFxuXHRcdFx0XHRcdG5ld1Byb3BzLnBsYWNlaG9sZGVyKVxuXHRcdFx0XHQpO1xuXHRcdFx0fTtcblx0XHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuXHRcdFx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMobmV3UHJvcHMudmFsdWUsIHt9LCBzZXRTdGF0ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZXRTdGF0ZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCAmJiB0aGlzLl9mb2N1c0FmdGVyVXBkYXRlKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5fYmx1clRpbWVvdXQpO1xuXHRcdFx0dGhpcy5fZm9jdXNUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZ2V0SW5wdXROb2RlKCkuZm9jdXMoKTtcblx0XHRcdFx0dGhpcy5fZm9jdXNBZnRlclVwZGF0ZSA9IGZhbHNlO1xuXHRcdFx0fSwgNTApO1xuXHRcdH1cblx0XHRpZiAodGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCkge1xuXHRcdFx0aWYgKHRoaXMucmVmcy5mb2N1c2VkICYmIHRoaXMucmVmcy5tZW51KSB7XG5cdFx0XHRcdHZhciBmb2N1c2VkRE9NID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLmZvY3VzZWQpO1xuXHRcdFx0XHR2YXIgbWVudURPTSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5tZW51KTtcblx0XHRcdFx0dmFyIGZvY3VzZWRSZWN0ID0gZm9jdXNlZERPTS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0dmFyIG1lbnVSZWN0ID0gbWVudURPTS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdFx0XHRpZiAoZm9jdXNlZFJlY3QuYm90dG9tID4gbWVudVJlY3QuYm90dG9tIHx8IGZvY3VzZWRSZWN0LnRvcCA8IG1lbnVSZWN0LnRvcCkge1xuXHRcdFx0XHRcdG1lbnVET00uc2Nyb2xsVG9wID0gKGZvY3VzZWRET00ub2Zmc2V0VG9wICsgZm9jdXNlZERPTS5jbGllbnRIZWlnaHQgLSBtZW51RE9NLm9mZnNldEhlaWdodCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0Zm9jdXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZ2V0SW5wdXROb2RlKCkuZm9jdXMoKTtcblx0fSxcblxuXHRjbGlja2VkT3V0c2lkZUVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGV2ZW50KSB7XG5cdFx0dmFyIGV2ZW50VGFyZ2V0ID0gKGV2ZW50LnRhcmdldCkgPyBldmVudC50YXJnZXQgOiBldmVudC5zcmNFbGVtZW50O1xuXHRcdHdoaWxlIChldmVudFRhcmdldCAhPSBudWxsKSB7XG5cdFx0XHRpZiAoZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQpIHJldHVybiBmYWxzZTtcblx0XHRcdGV2ZW50VGFyZ2V0ID0gZXZlbnRUYXJnZXQub2Zmc2V0UGFyZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRnZXRTdGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMsIHBsYWNlaG9sZGVyKSB7XG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHRvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zO1xuXHRcdH1cblx0XHRpZiAoIXBsYWNlaG9sZGVyKSB7XG5cdFx0XHRwbGFjZWhvbGRlciA9IHRoaXMucHJvcHMucGxhY2Vob2xkZXI7XG5cdFx0fVxuXG5cdFx0Ly8gcmVzZXQgaW50ZXJuYWwgZmlsdGVyIHN0cmluZ1xuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblxuXHRcdHZhciB2YWx1ZXMgPSB0aGlzLmluaXRWYWx1ZXNBcnJheSh2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zLCB2YWx1ZXMpO1xuXG5cdFx0dmFyIGZvY3VzZWRPcHRpb247XG5cdFx0dmFyIHZhbHVlRm9yU3RhdGUgPSBudWxsO1xuXHRcdGlmICghdGhpcy5wcm9wcy5tdWx0aSAmJiBnZXRMZW5ndGgodmFsdWVzKSkge1xuXHRcdFx0Zm9jdXNlZE9wdGlvbiA9IGdldEF0KHZhbHVlcywgMCk7O1xuXHRcdFx0dmFsdWVGb3JTdGF0ZSA9IGdldFZhbHVlKGdldEF0KHZhbHVlcywgMCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKHZhciBvcHRpb25JbmRleCA9IDA7IG9wdGlvbkluZGV4IDwgZ2V0TGVuZ3RoKGZpbHRlcmVkT3B0aW9ucyk7ICsrb3B0aW9uSW5kZXgpIHtcblx0XHRcdFx0dmFyIG9wdGlvbiA9IGdldEF0KGZpbHRlcmVkT3B0aW9ucywgb3B0aW9uSW5kZXgpO1xuXHRcdFx0XHRpZiAoIWdldFZhbHVlUHJvcChvcHRpb24sICdkaXNhYmxlZCcpKSB7XG5cdFx0XHRcdFx0Zm9jdXNlZE9wdGlvbiA9IG9wdGlvbjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFsdWVGb3JTdGF0ZSA9IHZhbHVlcy5tYXAoZnVuY3Rpb24odikgeyByZXR1cm4gZ2V0VmFsdWUodik7IH0pLmpvaW4odGhpcy5wcm9wcy5kZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogdmFsdWVGb3JTdGF0ZSxcblx0XHRcdHZhbHVlczogdmFsdWVzLFxuXHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdHBsYWNlaG9sZGVyOiAhdGhpcy5wcm9wcy5tdWx0aSAmJiBnZXRMZW5ndGgodmFsdWVzKSA/IGdldExhYmVsKGdldEF0KHZhbHVlcywgMCkpIDogcGxhY2Vob2xkZXIsXG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fTtcblx0fSxcblxuXHRpbml0VmFsdWVzQXJyYXk6IGZ1bmN0aW9uKHZhbHVlcywgb3B0aW9ucykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpICYmICFJbW11dGFibGUuSXRlcmFibGUuaXNJbmRleGVkKHZhbHVlcykpIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsdWVzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMgPT09ICcnID8gSW1tdXRhYmxlLkxpc3QoKSA6IEltbXV0YWJsZS5MaXN0KHZhbHVlcy5zcGxpdCh0aGlzLnByb3BzLmRlbGltaXRlcikpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzID0gdmFsdWVzICE9PSB1bmRlZmluZWQgJiYgdmFsdWVzICE9PSBudWxsID8gSW1tdXRhYmxlLkxpc3QoW3ZhbHVlc10pIDogSW1tdXRhYmxlLkxpc3QoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnMuZmluZChvcCA9PiB7XG5cdFx0XHRcdFx0dmFyIG9wVmFsdWUgPSBnZXRWYWx1ZShvcCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gb3BWYWx1ZSA9PT0gdmFsIHx8IHR5cGVvZiBvcFZhbHVlID09PSAnbnVtYmVyJyAmJiBvcFZhbHVlLnRvU3RyaW5nKCkgPT09IHZhbFxuXHRcdFx0XHR9KSB8fCBJbW11dGFibGUuTWFwKHsgdmFsdWU6IHZhbCwgbGFiZWw6IHZhbCB9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB2YWw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0c2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBmb2N1c0FmdGVyVXBkYXRlKSB7XG5cdFx0aWYgKGZvY3VzQWZ0ZXJVcGRhdGUgfHwgZm9jdXNBZnRlclVwZGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLl9mb2N1c0FmdGVyVXBkYXRlID0gdHJ1ZTtcblx0XHR9XG5cdFx0dmFyIG5ld1N0YXRlID0gdGhpcy5nZXRTdGF0ZUZyb21WYWx1ZSh2YWx1ZSk7XG5cdFx0bmV3U3RhdGUuaXNPcGVuID0gZmFsc2U7XG5cdFx0dGhpcy5maXJlQ2hhbmdlRXZlbnQobmV3U3RhdGUpO1xuXHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuXHR9LFxuXG5cdHNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICghdGhpcy5wcm9wcy5tdWx0aSkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSkge1xuXHRcdFx0dGhpcy5hZGRWYWx1ZSh2YWx1ZSk7XG5cdFx0fVxuXHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0fSxcblxuXHRhZGRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmNvbmNhdCh2YWx1ZSkpO1xuXHR9LFxuXG5cdHBvcFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLnNsaWNlKDAsIGdldExlbmd0aCh0aGlzLnN0YXRlLnZhbHVlcykgLSAxKSk7XG5cdH0sXG5cblx0cmVtb3ZlVmFsdWU6IGZ1bmN0aW9uKHZhbHVlVG9SZW1vdmUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmZpbHRlcihmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlICE9PSB2YWx1ZVRvUmVtb3ZlO1xuXHRcdH0pKTtcblx0fSxcblxuXHRjbGVhclZhbHVlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIGlnbm9yZSBpdC5cblx0XHRpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5zZXRWYWx1ZShudWxsKTtcblx0fSxcblxuXHRyZXNldFZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWUgPT09ICcnID8gbnVsbCA6IHRoaXMuc3RhdGUudmFsdWUpO1xuXHR9LFxuXG5cdGdldElucHV0Tm9kZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpbnB1dCA9IHRoaXMucmVmcy5pbnB1dDtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5zZWFyY2hhYmxlID8gaW5wdXQgOiBSZWFjdC5maW5kRE9NTm9kZShpbnB1dCk7XG5cdH0sXG5cblx0ZmlyZUNoYW5nZUV2ZW50OiBmdW5jdGlvbihuZXdTdGF0ZSkge1xuXHRcdGlmIChuZXdTdGF0ZS52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSAmJiB0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1N0YXRlLnZhbHVlLCBuZXdTdGF0ZS52YWx1ZXMpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVNb3VzZURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdC8vIGJ1dHRvbiwgb3IgaWYgdGhlIGNvbXBvbmVudCBpcyBkaXNhYmxlZCwgaWdub3JlIGl0LlxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8IChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNGb2N1c2VkKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gdHJ1ZTtcblx0XHRcdHRoaXMuZ2V0SW5wdXROb2RlKCkuZm9jdXMoKTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duT25BcnJvdzogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly8gSWYgbm90IGZvY3VzZWQsIGhhbmRsZU1vdXNlRG93biB3aWxsIGhhbmRsZSBpdFxuXHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9LCB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0fSxcblxuXHRoYW5kbGVJbnB1dEZvY3VzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBuZXdJc09wZW4gPSB0aGlzLnN0YXRlLmlzT3BlbiB8fCB0aGlzLl9vcGVuQWZ0ZXJGb2N1cztcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzRm9jdXNlZDogdHJ1ZSxcblx0XHRcdGlzT3BlbjogbmV3SXNPcGVuXG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZihuZXdJc09wZW4pIHtcblx0XHRcdFx0dGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fb3BlbkFmdGVyRm9jdXMgPSBmYWxzZTtcblx0XHRpZiAodGhpcy5wcm9wcy5vbkZvY3VzKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uRm9jdXMoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVJbnB1dEJsdXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dGhpcy5fYmx1clRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGlmICh0aGlzLl9mb2N1c0FmdGVyVXBkYXRlKSByZXR1cm47XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNGb2N1c2VkOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0fSwgNTApO1xuXHRcdGlmICh0aGlzLnByb3BzLm9uQmx1cikge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkJsdXIoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVLZXlEb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSByZXR1cm47XG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIDg6IC8vIGJhY2tzcGFjZVxuXHRcdFx0XHRpZiAoIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSAmJiB0aGlzLnByb3BzLmJhY2tzcGFjZVJlbW92ZXMpIHtcblx0XHRcdFx0XHR0aGlzLnBvcFZhbHVlKCk7XG5cdFx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgOTogLy8gdGFiXG5cdFx0XHRcdGlmIChldmVudC5zaGlmdEtleSB8fCAhdGhpcy5zdGF0ZS5pc09wZW4gfHwgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxMzogLy8gZW50ZXJcblx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3BlbikgcmV0dXJuO1xuXG5cdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI3OiAvLyBlc2NhcGVcblx0XHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXNldFZhbHVlKCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5wcm9wcy5jbGVhcmFibGUpIHtcblx0XHRcdFx0XHR0aGlzLmNsZWFyVmFsdWUoZXZlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzg6IC8vIHVwXG5cdFx0XHRcdHRoaXMuZm9jdXNQcmV2aW91c09wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDQwOiAvLyBkb3duXG5cdFx0XHRcdHRoaXMuZm9jdXNOZXh0T3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTg4OiAvLyAsXG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmIHRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OiByZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cblx0Ly8gRW5zdXJlcyB0aGF0IHRoZSBjdXJyZW50bHkgZm9jdXNlZCBvcHRpb24gaXMgYXZhaWxhYmxlIGluIGZpbHRlcmVkT3B0aW9ucy5cblx0Ly8gSWYgbm90LCByZXR1cm5zIHRoZSBmaXJzdCBhdmFpbGFibGUgb3B0aW9uLlxuXHRfZ2V0TmV3Rm9jdXNlZE9wdGlvbjogZnVuY3Rpb24oZmlsdGVyZWRPcHRpb25zKSB7XG5cdFx0dmFyIGZvY3VzZWRPcHRpb24gPSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb25cblx0XHRyZXR1cm4gZmlsdGVyZWRPcHRpb25zLmZpbmQob3AgPT4gb3AgPT09IGZvY3VzZWRPcHRpb24pIHx8IGdldEF0KGZpbHRlcmVkT3B0aW9ucywgMCk7XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gYXNzaWduIGFuIGludGVybmFsIHZhcmlhYmxlIGJlY2F1c2Ugd2UgbmVlZCB0byB1c2Vcblx0XHQvLyB0aGUgbGF0ZXN0IHZhbHVlIGJlZm9yZSBzZXRTdGF0ZSgpIGhhcyBjb21wbGV0ZWQuXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzTG9hZGluZzogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucyhldmVudC50YXJnZXQudmFsdWUsIHtcblx0XHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH1cblx0fSxcblxuXHRhdXRvbG9hZEFzeW5jT3B0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5sb2FkQXN5bmNPcHRpb25zKCh0aGlzLnByb3BzLnZhbHVlIHx8ICcnKSwge30sICgpID0+IHtcblx0XHRcdC8vIHVwZGF0ZSB3aXRoIGZldGNoZWQgYnV0IGRvbid0IGZvY3VzXG5cdFx0XHR0aGlzLnNldFZhbHVlKHRoaXMucHJvcHMudmFsdWUsIGZhbHNlKTtcblx0XHR9KTtcblx0fSxcblxuXHRsb2FkQXN5bmNPcHRpb25zOiBmdW5jdGlvbihpbnB1dCwgc3RhdGUsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHRoaXNSZXF1ZXN0SWQgPSB0aGlzLl9jdXJyZW50UmVxdWVzdElkID0gcmVxdWVzdElkKys7XG5cdFx0aWYgKHRoaXMucHJvcHMuY2FjaGVBc3luY1Jlc3VsdHMpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDw9IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBjYWNoZUtleSA9IGlucHV0LnNsaWNlKDAsIGkpO1xuXHRcdFx0XHRpZiAodGhpcy5fb3B0aW9uc0NhY2hlW2NhY2hlS2V5XSAmJiAoaW5wdXQgPT09IGNhY2hlS2V5IHx8IHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0uY29tcGxldGUpKSB7XG5cdFx0XHRcdFx0dmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLm9wdGlvbnM7XG5cdFx0XHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zKTtcblx0XHRcdFx0XHR2YXIgbmV3U3RhdGUgPSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBzdGF0ZSkge1xuXHRcdFx0XHRcdFx0aWYgKHN0YXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRcdFx0bmV3U3RhdGVba2V5XSA9IHN0YXRlW2tleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuXHRcdFx0XHRcdGlmIChjYWxsYmFjaykgY2FsbGJhY2suY2FsbCh0aGlzLCBuZXdTdGF0ZSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9wcy5hc3luY09wdGlvbnMoaW5wdXQsIChlcnIsIGRhdGEpID0+IHtcblx0XHRcdGlmIChlcnIpIHRocm93IGVycjtcblx0XHRcdGlmICh0aGlzLnByb3BzLmNhY2hlQXN5bmNSZXN1bHRzKSB7XG5cdFx0XHRcdHRoaXMuX29wdGlvbnNDYWNoZVtpbnB1dF0gPSBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXNSZXF1ZXN0SWQgIT09IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhkYXRhLm9wdGlvbnMpO1xuXHRcdFx0dmFyIG5ld1N0YXRlID0ge1xuXHRcdFx0XHRvcHRpb25zOiBkYXRhLm9wdGlvbnMsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gc3RhdGUpIHtcblx0XHRcdFx0aWYgKHN0YXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRuZXdTdGF0ZVtrZXldID0gc3RhdGVba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdFx0XHRpZiAoY2FsbGJhY2spIGNhbGxiYWNrLmNhbGwodGhpcywgbmV3U3RhdGUpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGZpbHRlck9wdGlvbnM6IGZ1bmN0aW9uKG9wdGlvbnMsIHZhbHVlcykge1xuXHRcdHZhciBmaWx0ZXJWYWx1ZSA9IHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmc7XG5cdFx0dmFyIGV4Y2x1ZGUgPSAodmFsdWVzIHx8IHRoaXMuc3RhdGUudmFsdWVzKS5tYXAoZnVuY3Rpb24odikge1xuXHRcdFx0cmV0dXJuIGdldFZhbHVlKHYpO1xuXHRcdH0pO1xuXHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMpIHtcblx0XHRcdHJldHVybiB0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zLCBmaWx0ZXJWYWx1ZSwgZXhjbHVkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJPcHRpb24gPSBmdW5jdGlvbihvcCkge1xuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSAmJiBleGNsdWRlLmluZGV4T2YoZ2V0VmFsdWUob3ApKSA+IC0xKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbikgcmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uLmNhbGwodGhpcywgb3AsIGZpbHRlclZhbHVlKTtcblx0XHRcdFx0dmFyIHZhbHVlVGVzdCA9IFN0cmluZyhnZXRWYWx1ZShvcCkpLCBsYWJlbFRlc3QgPSBTdHJpbmcoZ2V0TGFiZWwob3ApKTtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMuaWdub3JlQ2FzZSkge1xuXHRcdFx0XHRcdHZhbHVlVGVzdCA9IHZhbHVlVGVzdC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdGxhYmVsVGVzdCA9IGxhYmVsVGVzdC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdGZpbHRlclZhbHVlID0gZmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gIWZpbHRlclZhbHVlIHx8ICh0aGlzLnByb3BzLm1hdGNoUG9zID09PSAnc3RhcnQnKSA/IChcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICdsYWJlbCcgJiYgdmFsdWVUZXN0LnN1YnN0cigwLCBmaWx0ZXJWYWx1ZS5sZW5ndGgpID09PSBmaWx0ZXJWYWx1ZSkgfHxcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScgJiYgbGFiZWxUZXN0LnN1YnN0cigwLCBmaWx0ZXJWYWx1ZS5sZW5ndGgpID09PSBmaWx0ZXJWYWx1ZSlcblx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICdsYWJlbCcgJiYgdmFsdWVUZXN0LmluZGV4T2YoZmlsdGVyVmFsdWUpID49IDApIHx8XG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAndmFsdWUnICYmIGxhYmVsVGVzdC5pbmRleE9mKGZpbHRlclZhbHVlKSA+PSAwKVxuXHRcdFx0XHQpO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiAob3B0aW9ucyB8fCBbXSkuZmlsdGVyKGZpbHRlck9wdGlvbiwgdGhpcyk7XG5cdFx0fVxuXHR9LFxuXG5cdHNlbGVjdEZvY3VzZWRPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmICF0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIHtcblx0XHRcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbik7XG5cdH0sXG5cblx0Zm9jdXNPcHRpb246IGZ1bmN0aW9uKG9wKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBvcFxuXHRcdH0pO1xuXHR9LFxuXG5cdGZvY3VzTmV4dE9wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCduZXh0Jyk7XG5cdH0sXG5cblx0Zm9jdXNQcmV2aW91c09wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCdwcmV2aW91cycpO1xuXHR9LFxuXG5cdGZvY3VzQWRqYWNlbnRPcHRpb246IGZ1bmN0aW9uKGRpcikge1xuXHRcdHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwgPSB0cnVlO1xuXHRcdHZhciBvcHMgPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24ob3ApIHtcblx0XHRcdHJldHVybiAhZ2V0VmFsdWVQcm9wKG9wLCAnZGlzYWJsZWQnKTtcblx0XHR9KTtcblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIHx8IGdldEF0KG9wcywgZGlyID09PSAnbmV4dCcgPyAwIDogZ2V0TGVuZ3RoKG9wcykgLSAxKVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoIWdldExlbmd0aChvcHMpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHZhciBmb2N1c2VkSW5kZXggPSAtMTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGdldExlbmd0aChvcHMpOyBpKyspIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPT09IGdldEF0KG9wcyxpKSkge1xuXHRcdFx0XHRmb2N1c2VkSW5kZXggPSBpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFyIGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIDApO1xuXHRcdGlmIChkaXIgPT09ICduZXh0JyAmJiBmb2N1c2VkSW5kZXggPiAtMSAmJiBmb2N1c2VkSW5kZXggPCBnZXRMZW5ndGgob3BzKSAtIDEpIHtcblx0XHRcdGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIGZvY3VzZWRJbmRleCArIDEpO1xuXHRcdH0gZWxzZSBpZiAoZGlyID09PSAncHJldmlvdXMnKSB7XG5cdFx0XHRpZiAoZm9jdXNlZEluZGV4ID4gMCkge1xuXHRcdFx0XHRmb2N1c2VkT3B0aW9uID0gZ2V0QXQob3BzLCBmb2N1c2VkSW5kZXggLSAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIG9wcy5sZW5ndGggLSAxKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fSk7XG5cdH0sXG5cblx0dW5mb2N1c09wdGlvbjogZnVuY3Rpb24ob3ApIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID09PSBvcCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IG51bGxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRidWlsZE1lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmb2N1c2VkVmFsdWUgPSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPyBnZXRWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIDogbnVsbDtcblx0XHR2YXIgcmVuZGVyTGFiZWwgPSB0aGlzLnByb3BzLm9wdGlvblJlbmRlcmVyIHx8IGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHRyZXR1cm4gZ2V0TGFiZWwob3ApO1xuXHRcdH07XG5cdFx0aWYgKGdldExlbmd0aCh0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucykgPiAwKSB7XG5cdFx0XHRmb2N1c2VkVmFsdWUgPSBmb2N1c2VkVmFsdWUgPT0gbnVsbCA/IGdldEF0KHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLCAwKSA6IGZvY3VzZWRWYWx1ZTtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucztcblxuXHRcdC8vVE9ETzogc3VwcG9ydCBhbGxvd0NyZWF0ZSAoaXQgbXV0YXRlcyBgb3B0aW9uc2AsIHdoaWNoIGlzIHN1cHBvc2VkIHRvIGJlIGltbXV0YWJsZSwgY2FsbGluZyBgdW5zaGlmdGAgYmVsb3cpXG5cdFx0Ly8gQWRkIHRoZSBjdXJyZW50IHZhbHVlIHRvIHRoZSBmaWx0ZXJlZCBvcHRpb25zIGluIGxhc3QgcmVzb3J0XG5cdFx0Ly8gaWYgKHRoaXMucHJvcHMuYWxsb3dDcmVhdGUgJiYgdGhpcy5zdGF0ZS5pbnB1dFZhbHVlLnRyaW0oKSkge1xuXHRcdC8vIFx0dmFyIGlucHV0VmFsdWUgPSB0aGlzLnN0YXRlLmlucHV0VmFsdWU7XG5cdFx0Ly8gXHRvcHRpb25zID0gb3B0aW9ucy5zbGljZSgpO1xuXHRcdC8vIFx0dmFyIG5ld09wdGlvbiA9IHRoaXMucHJvcHMubmV3T3B0aW9uQ3JlYXRvciA/IHRoaXMucHJvcHMubmV3T3B0aW9uQ3JlYXRvcihpbnB1dFZhbHVlKSA6IHtcblx0XHQvLyBcdFx0dmFsdWU6IGlucHV0VmFsdWUsXG5cdFx0Ly8gXHRcdGxhYmVsOiBpbnB1dFZhbHVlLFxuXHRcdC8vIFx0XHRjcmVhdGU6IHRydWVcblx0XHQvLyBcdH07XG5cdFx0Ly8gXHRvcHRpb25zLnVuc2hpZnQobmV3T3B0aW9uKTtcblx0XHQvLyB9XG5cdFx0dmFyIG9wcyA9IG9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wLCBrZXkpIHtcblx0XHRcdHZhciBpc1NlbGVjdGVkID0gdGhpcy5zdGF0ZS52YWx1ZSA9PT0gZ2V0VmFsdWUob3ApO1xuXHRcdFx0dmFyIGlzRm9jdXNlZCA9IGZvY3VzZWRWYWx1ZSA9PT0gZ2V0VmFsdWUob3ApO1xuXHRcdFx0dmFyIG9wdGlvbkNsYXNzID0gY2xhc3Nlcyh7XG5cdFx0XHRcdCdTZWxlY3Qtb3B0aW9uJzogdHJ1ZSxcblx0XHRcdFx0J2lzLXNlbGVjdGVkJzogaXNTZWxlY3RlZCxcblx0XHRcdFx0J2lzLWZvY3VzZWQnOiBpc0ZvY3VzZWQsXG5cdFx0XHRcdCdpcy1kaXNhYmxlZCc6IGdldFZhbHVlUHJvcChvcCwgJ2Rpc2FibGVkJylcblx0XHRcdH0pO1xuXHRcdFx0dmFyIHJlZiA9IGlzRm9jdXNlZCA/ICdmb2N1c2VkJyA6IG51bGw7XG5cdFx0XHR2YXIgbW91c2VFbnRlciA9IHRoaXMuZm9jdXNPcHRpb24uYmluZCh0aGlzLCBvcCk7XG5cdFx0XHR2YXIgbW91c2VMZWF2ZSA9IHRoaXMudW5mb2N1c09wdGlvbi5iaW5kKHRoaXMsIG9wKTtcblx0XHRcdHZhciBtb3VzZURvd24gPSB0aGlzLnNlbGVjdFZhbHVlLmJpbmQodGhpcywgb3ApO1xuXHRcdFx0dmFyIG9wdGlvblJlc3VsdCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5vcHRpb25Db21wb25lbnQsIHtcblx0XHRcdFx0a2V5OiAnb3B0aW9uLScgKyBnZXRWYWx1ZShvcCksXG5cdFx0XHRcdGNsYXNzTmFtZTogb3B0aW9uQ2xhc3MsXG5cdFx0XHRcdHJlbmRlckZ1bmM6IHJlbmRlckxhYmVsLFxuXHRcdFx0XHRtb3VzZUVudGVyOiBtb3VzZUVudGVyLFxuXHRcdFx0XHRtb3VzZUxlYXZlOiBtb3VzZUxlYXZlLFxuXHRcdFx0XHRtb3VzZURvd246IG1vdXNlRG93bixcblx0XHRcdFx0Y2xpY2s6IG1vdXNlRG93bixcblx0XHRcdFx0YWRkTGFiZWxUZXh0OiB0aGlzLnByb3BzLmFkZExhYmVsVGV4dCxcblx0XHRcdFx0b3B0aW9uOiBvcCxcblx0XHRcdFx0cmVmOiByZWZcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG9wdGlvblJlc3VsdDtcblx0XHR9LCB0aGlzKTtcblx0XHRyZXR1cm4gb3BzLmxlbmd0aCA/IG9wcyA6IChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LW5vcmVzdWx0c1wiPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5hc3luY09wdGlvbnMgJiYgIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSA/IHRoaXMucHJvcHMuc2VhcmNoUHJvbXB0VGV4dCA6IHRoaXMucHJvcHMubm9SZXN1bHRzVGV4dH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH0sXG5cblx0aGFuZGxlT3B0aW9uTGFiZWxDbGljazogZnVuY3Rpb24gKHZhbHVlLCBldmVudCkge1xuXHRcdGlmICh0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljaykge1xuXHRcdFx0dGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2sodmFsdWUsIGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0Q2xhc3MgPSBjbGFzc2VzKCdTZWxlY3QnLCB0aGlzLnByb3BzLmNsYXNzTmFtZSwge1xuXHRcdFx0J2lzLW11bHRpJzogdGhpcy5wcm9wcy5tdWx0aSxcblx0XHRcdCdpcy1zZWFyY2hhYmxlJzogdGhpcy5wcm9wcy5zZWFyY2hhYmxlLFxuXHRcdFx0J2lzLW9wZW4nOiB0aGlzLnN0YXRlLmlzT3Blbixcblx0XHRcdCdpcy1mb2N1c2VkJzogdGhpcy5zdGF0ZS5pc0ZvY3VzZWQsXG5cdFx0XHQnaXMtbG9hZGluZyc6IHRoaXMuc3RhdGUuaXNMb2FkaW5nLFxuXHRcdFx0J2lzLWRpc2FibGVkJzogdGhpcy5wcm9wcy5kaXNhYmxlZCxcblx0XHRcdCdoYXMtdmFsdWUnOiB0aGlzLnN0YXRlLnZhbHVlXG5cdFx0fSk7XG5cdFx0dmFyIHZhbHVlID0gW107XG5cdFx0aWYgKHRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdHRoaXMuc3RhdGUudmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRcdHZhciBvbk9wdGlvbkxhYmVsQ2xpY2sgPSB0aGlzLmhhbmRsZU9wdGlvbkxhYmVsQ2xpY2suYmluZCh0aGlzLCB2YWwpO1xuXHRcdFx0XHR2YXIgb25SZW1vdmUgPSB0aGlzLnJlbW92ZVZhbHVlLmJpbmQodGhpcywgdmFsKTtcblx0XHRcdFx0dmFyIHZhbHVlQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudCh0aGlzLnByb3BzLnZhbHVlQ29tcG9uZW50LCB7XG5cdFx0XHRcdFx0a2V5OiBnZXRWYWx1ZSh2YWwpLFxuXHRcdFx0XHRcdG9wdGlvbjogdmFsLFxuXHRcdFx0XHRcdHJlbmRlcmVyOiB0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXIsXG5cdFx0XHRcdFx0b3B0aW9uTGFiZWxDbGljazogISF0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IG9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvblJlbW92ZTogb25SZW1vdmUsXG5cdFx0XHRcdFx0ZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHZhbHVlLnB1c2godmFsdWVDb21wb25lbnQpO1xuXHRcdFx0fSwgdGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUgJiYgKCF0aGlzLnByb3BzLm11bHRpIHx8ICF2YWx1ZS5sZW5ndGgpKSB7XG5cdFx0XHR2YXIgdmFsID0gZ2V0QXQodGhpcy5zdGF0ZS52YWx1ZXMsIDApIHx8IG51bGw7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy52YWx1ZVJlbmRlcmVyICYmICEhZ2V0TGVuZ3RoKHRoaXMuc3RhdGUudmFsdWVzKSkge1xuXHRcdFx0XHR2YWx1ZS5wdXNoKDxWYWx1ZVxuXHRcdFx0XHRcdFx0a2V5PXswfVxuXHRcdFx0XHRcdFx0b3B0aW9uPXt2YWx9XG5cdFx0XHRcdFx0XHRyZW5kZXJlcj17dGhpcy5wcm9wcy52YWx1ZVJlbmRlcmVyfVxuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBzaW5nbGVWYWx1ZUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5zaW5nbGVWYWx1ZUNvbXBvbmVudCwge1xuXHRcdFx0XHRcdGtleTogJ3BsYWNlaG9sZGVyJyxcblx0XHRcdFx0XHR2YWx1ZTogdmFsLFxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyOiB0aGlzLnN0YXRlLnBsYWNlaG9sZGVyXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR2YWx1ZS5wdXNoKHNpbmdsZVZhbHVlQ29tcG9uZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgbG9hZGluZyA9IHRoaXMuc3RhdGUuaXNMb2FkaW5nID8gPHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWxvYWRpbmdcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGw7XG5cdFx0dmFyIGNsZWFyID0gdGhpcy5wcm9wcy5jbGVhcmFibGUgJiYgdGhpcy5zdGF0ZS52YWx1ZSAmJiAhdGhpcy5wcm9wcy5kaXNhYmxlZCA/IDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1jbGVhclwiIHRpdGxlPXt0aGlzLnByb3BzLm11bHRpID8gdGhpcy5wcm9wcy5jbGVhckFsbFRleHQgOiB0aGlzLnByb3BzLmNsZWFyVmFsdWVUZXh0fSBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLm11bHRpID8gdGhpcy5wcm9wcy5jbGVhckFsbFRleHQgOiB0aGlzLnByb3BzLmNsZWFyVmFsdWVUZXh0fSBvbk1vdXNlRG93bj17dGhpcy5jbGVhclZhbHVlfSBvbkNsaWNrPXt0aGlzLmNsZWFyVmFsdWV9IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogJyZ0aW1lczsnIH19IC8+IDogbnVsbDtcblxuXHRcdHZhciBtZW51O1xuXHRcdHZhciBtZW51UHJvcHM7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRtZW51UHJvcHMgPSB7XG5cdFx0XHRcdHJlZjogJ21lbnUnLFxuXHRcdFx0XHRjbGFzc05hbWU6ICdTZWxlY3QtbWVudSdcblx0XHRcdH07XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuXHRcdFx0XHRtZW51UHJvcHMub25Nb3VzZURvd24gPSB0aGlzLmhhbmRsZU1vdXNlRG93bjtcblx0XHRcdH1cblx0XHRcdG1lbnUgPSAoXG5cdFx0XHRcdDxkaXYgcmVmPVwic2VsZWN0TWVudUNvbnRhaW5lclwiIGNsYXNzTmFtZT1cIlNlbGVjdC1tZW51LW91dGVyXCI+XG5cdFx0XHRcdFx0PGRpdiB7Li4ubWVudVByb3BzfT57dGhpcy5idWlsZE1lbnUoKX08L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHZhciBpbnB1dDtcblx0XHR2YXIgaW5wdXRQcm9wcyA9IHtcblx0XHRcdHJlZjogJ2lucHV0Jyxcblx0XHRcdGNsYXNzTmFtZTogJ1NlbGVjdC1pbnB1dCAnICsgKHRoaXMucHJvcHMuaW5wdXRQcm9wcy5jbGFzc05hbWUgfHwgJycpLFxuXHRcdFx0dGFiSW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXggfHwgMCxcblx0XHRcdG9uRm9jdXM6IHRoaXMuaGFuZGxlSW5wdXRGb2N1cyxcblx0XHRcdG9uQmx1cjogdGhpcy5oYW5kbGVJbnB1dEJsdXJcblx0XHR9O1xuXHRcdGZvciAodmFyIGtleSBpbiB0aGlzLnByb3BzLmlucHV0UHJvcHMpIHtcblx0XHRcdGlmICh0aGlzLnByb3BzLmlucHV0UHJvcHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09ICdjbGFzc05hbWUnKSB7XG5cdFx0XHRcdGlucHV0UHJvcHNba2V5XSA9IHRoaXMucHJvcHMuaW5wdXRQcm9wc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuXHRcdFx0aWYgKHRoaXMucHJvcHMuc2VhcmNoYWJsZSkge1xuXHRcdFx0XHRpbnB1dCA9IDxJbnB1dCB2YWx1ZT17dGhpcy5zdGF0ZS5pbnB1dFZhbHVlfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVJbnB1dENoYW5nZX0gbWluV2lkdGg9XCI1XCIgey4uLmlucHV0UHJvcHN9IC8+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aW5wdXQgPSA8ZGl2IHsuLi5pbnB1dFByb3BzfT4mbmJzcDs8L2Rpdj47XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghdGhpcy5wcm9wcy5tdWx0aSB8fCAhZ2V0TGVuZ3RoKHRoaXMuc3RhdGUudmFsdWVzKSkge1xuXHRcdFx0aW5wdXQgPSA8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1pbnB1dFwiPiZuYnNwOzwvZGl2Pjtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiByZWY9XCJ3cmFwcGVyXCIgY2xhc3NOYW1lPXtzZWxlY3RDbGFzc30+XG5cdFx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgcmVmPVwidmFsdWVcIiBuYW1lPXt0aGlzLnByb3BzLm5hbWV9IHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfSBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH0gLz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtY29udHJvbFwiIHJlZj1cImNvbnRyb2xcIiBvbktleURvd249e3RoaXMuaGFuZGxlS2V5RG93bn0gb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3dufSBvblRvdWNoRW5kPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0+XG5cdFx0XHRcdFx0e3ZhbHVlfVxuXHRcdFx0XHRcdHtpbnB1dH1cblx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtYXJyb3ctem9uZVwiIG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bk9uQXJyb3d9IC8+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWFycm93XCIgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3duT25BcnJvd30gLz5cblx0XHRcdFx0XHR7bG9hZGluZ31cblx0XHRcdFx0XHR7Y2xlYXJ9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7bWVudX1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0O1xuIl19
