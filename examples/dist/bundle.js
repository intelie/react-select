require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// from
// https://raw.githubusercontent.com/onefinestay/react-lazy-render/master/src/LazyRender.jsx
// Modificações para aceitar lazy immutable seq.

var React = require('react');
var ReactDOM = require('react-dom');
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
    var container = this.refs.container;
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
    if (typeof element.render === "function") {
      element = ReactDOM.findDOMNode(element);
    }
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
    var el = firstChild;
    return this.getElementHeight(el);
  },

  render: function render() {
    if (!this.props.children.slice) {
      return this.props.children;
    }

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

},{"element-size":undefined,"immutable":undefined,"react":undefined,"react-dom":undefined}],2:[function(require,module,exports){
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

},{"./immutable/utils":6,"react":undefined}],3:[function(require,module,exports){
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

},{"react":undefined}],4:[function(require,module,exports){
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

},{"./immutable/utils":6,"react":undefined}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
var ReactDOM = require('react-dom');
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
  return Immutable.is(v1, v2) || v1 && v2 && v1.has && v1.has('eid') && v2.get && Immutable.is(v1.get('eid'), v2.get('eid'));
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
      var menuElem = _this.refs.selectMenuContainer;
      var controlElem = _this.refs.control;

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
        var focusedDOM = this.refs.focused;
        var menuDOM = this.refs.menu;
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

    // Normaliza implementação passando ás veses value, ás vezes option aqui:
    if (value != null && typeof value == 'object' && value.value != null && value.label != null || value instanceof Immutable.Map && value.has('value') && value.has('label')) {
      value = getValue(value);
    }

    // reset internal filter string
    this._optionsFilterString = '';

    var values = this.initValuesArray(value, options);
    var filteredOptions = this.filterOptions(options, values);

    var focusedOption;
    var valueForState = null;
    if (!this.props.multi && getLength(values)) {
      focusedOption = getAt(values, 0);
      valueForState = getValue(focusedOption);
    } else if (this.props.multi) {
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
    return this.refs.input;
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
    //  var inputValue = this.state.inputValue;
    //  options = options.slice();
    //  var newOption = this.props.newOptionCreator ? this.props.newOptionCreator(inputValue) : {
    //      value: inputValue,
    //      label: inputValue,
    //      create: true
    //  };
    //  options.unshift(newOption);
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
      'has-value': !(this.state.value == null || this.state.value === "")
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

},{"./LazyRender":1,"./Option":2,"./SingleValue":3,"./Value":4,"./arrayFindPolyfill":5,"./immutable/utils":6,"classnames":undefined,"immutable":undefined,"react":undefined,"react-dom":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvTGF6eVJlbmRlci9pbmRleC5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3Qvc3JjL09wdGlvbi5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3Qvc3JjL1NpbmdsZVZhbHVlLmpzIiwiL1VzZXJzL2JyZW5vZmVycmVpcmEvRG9jdW1lbnRzL0RldmVsb3Blci9JbnRlbGllL3JlYWN0LXNlbGVjdC9zcmMvVmFsdWUuanMiLCIvVXNlcnMvYnJlbm9mZXJyZWlyYS9Eb2N1bWVudHMvRGV2ZWxvcGVyL0ludGVsaWUvcmVhY3Qtc2VsZWN0L3NyYy9hcnJheUZpbmRQb2x5ZmlsbC5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3Qvc3JjL2ltbXV0YWJsZS91dGlscy5qcyIsIi9Vc2Vycy9icmVub2ZlcnJlaXJhL0RvY3VtZW50cy9EZXZlbG9wZXIvSW50ZWxpZS9yZWFjdC1zZWxlY3Qvc3JjL1NlbGVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7Ozs7O0FBTWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNwQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckMs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dCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIGZyb21cbi8vIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9vbmVmaW5lc3RheS9yZWFjdC1sYXp5LXJlbmRlci9tYXN0ZXIvc3JjL0xhenlSZW5kZXIuanN4XG4vLyBNb2RpZmljYcOnw7VlcyBwYXJhIGFjZWl0YXIgbGF6eSBpbW11dGFibGUgc2VxLlxuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG52YXIgZWxlbWVudFNpemUgPSByZXF1aXJlKFwiZWxlbWVudC1zaXplXCIpO1xuXG5mdW5jdGlvbiBjb3VudChjaGlsZHJlbikge1xuICByZXR1cm4gY2hpbGRyZW4uY291bnQgPyBjaGlsZHJlbi5jb3VudCgpIDogY2hpbGRyZW4ubGVuZ3RoO1xufVxuXG52YXIgTGF6eVJlbmRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgY2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5pbnN0YW5jZU9mKEltbXV0YWJsZS5JdGVyYWJsZSksXG4gICAgbWF4SGVpZ2h0OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG5cbiAgICBjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgaXRlbVBhZGRpbmc6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpdGVtUGFkZGluZzogM1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hpbGRyZW5Ub3A6IDAsXG4gICAgICBjaGlsZHJlblRvUmVuZGVyOiAxMCxcbiAgICAgIHNjcm9sbFRvcDogMCxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5tYXhIZWlnaHQsXG4gICAgICBjb3VudDogY291bnQodGhpcy5wcm9wcy5jaGlsZHJlbilcbiAgICB9O1xuICB9LFxuXG4gIG9uU2Nyb2xsOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5yZWZzLmNvbnRhaW5lcjtcbiAgICB2YXIgc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbFRvcDtcblxuICAgIHZhciBjaGlsZHJlblRvcCA9IE1hdGguZmxvb3Ioc2Nyb2xsVG9wIC8gdGhpcy5zdGF0ZS5jaGlsZEhlaWdodCk7XG4gICAgdmFyIGNoaWxkcmVuQm90dG9tID0gKHRoaXMuc3RhdGUuY291bnQgLSBjaGlsZHJlblRvcCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY2hpbGRyZW5Ub1JlbmRlcik7XG5cbiAgICBpZiAoY2hpbGRyZW5Cb3R0b20gPCAwKSB7XG4gICAgICBjaGlsZHJlbkJvdHRvbSA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaGlsZHJlblRvcDogY2hpbGRyZW5Ub3AsXG4gICAgICBjaGlsZHJlbkJvdHRvbTogY2hpbGRyZW5Cb3R0b20sXG4gICAgICBzY3JvbGxUb3A6IHNjcm9sbFRvcFxuICAgIH0pO1xuICB9LFxuXG4gIGdldEhlaWdodDogZnVuY3Rpb24obnVtQ2hpbGRyZW4sIGNoaWxkSGVpZ2h0LCBtYXhIZWlnaHQpIHtcbiAgICB2YXIgZnVsbEhlaWdodCA9IG51bUNoaWxkcmVuICogY2hpbGRIZWlnaHQ7XG4gICAgaWYgKGZ1bGxIZWlnaHQgPCBtYXhIZWlnaHQpIHtcbiAgICAgIHJldHVybiBmdWxsSGVpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF4SGVpZ2h0O1xuICAgIH1cbiAgfSxcblxuICBnZXRFbGVtZW50SGVpZ2h0OiBmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0aWYodHlwZW9mKGVsZW1lbnQucmVuZGVyKSA9PT0gXCJmdW5jdGlvblwiKXsgZWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKGVsZW1lbnQpOyB9XG4gICAgdmFyIG1hcmdpblRvcCA9IHBhcnNlSW50KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLm1hcmdpblRvcCk7XG4gICAgcmV0dXJuIGVsZW1lbnRTaXplKGVsZW1lbnQpWzFdIC0gbWFyZ2luVG9wOyAvL3JlbW92ZSBvbmUgbWFyZ2luIHNpbmNlIHRoZSBtYXJnaW5zIGFyZSBzaGFyZWQgYnkgYWRqYWNlbnQgZWxlbWVudHNcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB2YXIgbGVuZ3RoID0gY291bnQobmV4dFByb3BzLmNoaWxkcmVuKTtcbiAgICB2YXIgY2hpbGRIZWlnaHQgPSB0aGlzLnN0YXRlLmNoaWxkSGVpZ2h0O1xuICAgIHZhciBjaGlsZHJlblRvcCA9IE1hdGguZmxvb3IodGhpcy5zdGF0ZS5zY3JvbGxUb3AgLyBjaGlsZEhlaWdodCk7XG4gICAgdmFyIGNoaWxkcmVuQm90dG9tID0gKGxlbmd0aCAtIGNoaWxkcmVuVG9wIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5jaGlsZHJlblRvUmVuZGVyKTtcblxuICAgIGlmIChjaGlsZHJlbkJvdHRvbSA8IDApIHtcbiAgICAgIGNoaWxkcmVuQm90dG9tID0gMDtcbiAgICB9XG5cbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoXG4gICAgICBsZW5ndGgsXG4gICAgICBjaGlsZEhlaWdodCxcbiAgICAgIG5leHRQcm9wcy5tYXhIZWlnaHRcbiAgICApO1xuXG4gICAgdmFyIG51bWJlck9mSXRlbXMgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gY2hpbGRIZWlnaHQpO1xuXG4gICAgaWYgKGhlaWdodCA9PT0gdGhpcy5wcm9wcy5tYXhIZWlnaHQpIHtcbiAgICAgIG51bWJlck9mSXRlbXMgKz0gdGhpcy5wcm9wcy5pdGVtUGFkZGluZztcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNoaWxkcmVuVG9wOiBjaGlsZHJlblRvcCxcbiAgICAgIGNoaWxkcmVuQm90dG9tOiBjaGlsZHJlbkJvdHRvbSxcbiAgICAgIGNoaWxkcmVuVG9SZW5kZXI6IG51bWJlck9mSXRlbXMsXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgIGNvdW50OiBsZW5ndGhcbiAgICB9KTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNoaWxkSGVpZ2h0ID0gdGhpcy5nZXRDaGlsZEhlaWdodCgpO1xuICAgIHZhciBsZW5ndGggPSBjb3VudCh0aGlzLnByb3BzLmNoaWxkcmVuKTtcblxuICAgIHZhciBoZWlnaHQgPSB0aGlzLmdldEhlaWdodChcbiAgICAgIGxlbmd0aCxcbiAgICAgIGNoaWxkSGVpZ2h0LFxuICAgICAgdGhpcy5wcm9wcy5tYXhIZWlnaHRcbiAgICApO1xuXG4gICAgdmFyIG51bWJlck9mSXRlbXMgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gY2hpbGRIZWlnaHQpO1xuXG4gICAgaWYgKGhlaWdodCA9PT0gdGhpcy5wcm9wcy5tYXhIZWlnaHQpIHtcbiAgICAgIG51bWJlck9mSXRlbXMgKz0gdGhpcy5wcm9wcy5pdGVtUGFkZGluZztcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNoaWxkSGVpZ2h0OiBjaGlsZEhlaWdodCxcbiAgICAgIGNoaWxkcmVuVG9SZW5kZXI6IG51bWJlck9mSXRlbXMsXG4gICAgICBjaGlsZHJlblRvcDogMCxcbiAgICAgIGNoaWxkcmVuQm90dG9tOiBsZW5ndGggLSBudW1iZXJPZkl0ZW1zLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9KTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIC8vaW1wb3J0YW50IHRvIHVwZGF0ZSB0aGUgY2hpbGQgaGVpZ2h0IGluIHRoZSBjYXNlIHRoYXQgdGhlIGNoaWxkcmVuIGNoYW5nZShleGFtcGxlOiBhamF4IGNhbGwgZm9yIGRhdGEpXG4gICAgaWYgKHRoaXMuc3RhdGUuY2hpbGRIZWlnaHQgIT09IHRoaXMuZ2V0Q2hpbGRIZWlnaHQoKSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7Y2hpbGRIZWlnaHQ6IHRoaXMuZ2V0Q2hpbGRIZWlnaHQoKX0pO1xuICAgIH1cbiAgfSxcblxuICBnZXRDaGlsZEhlaWdodDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpcnN0Q2hpbGQgPSB0aGlzLnJlZnNbJ2NoaWxkLTAnXTtcbiAgICB2YXIgZWwgPSBmaXJzdENoaWxkO1xuICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnRIZWlnaHQoZWwpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgaWYoIXRoaXMucHJvcHMuY2hpbGRyZW4uc2xpY2UpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIH1cblxuICAgIHZhciBzdGFydCA9IHRoaXMuc3RhdGUuY2hpbGRyZW5Ub3A7XG4gICAgdmFyIGVuZCA9IHRoaXMuc3RhdGUuY2hpbGRyZW5Ub3AgKyB0aGlzLnN0YXRlLmNoaWxkcmVuVG9SZW5kZXI7XG5cbiAgICB2YXIgY2hpbGRyZW5Ub1JlbmRlciA9IHRoaXMucHJvcHMuY2hpbGRyZW4uc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgdmFyIGNoaWxkcmVuID0gY2hpbGRyZW5Ub1JlbmRlci5tYXAoZnVuY3Rpb24oY2hpbGQsIGluZGV4KSB7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudChjaGlsZCwge3JlZjogJ2NoaWxkLScgKyBpbmRleCwga2V5OiBpbmRleH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH0pO1xuXG5cbiAgICBjaGlsZHJlbiA9IEltbXV0YWJsZS5TZXEub2YoXG4gICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogdGhpcy5zdGF0ZS5jaGlsZHJlblRvcCAqIHRoaXMuc3RhdGUuY2hpbGRIZWlnaHQgfX1cbiAgICAgICAgICAga2V5PVwidG9wXCIgLz5cbiAgICApLmNvbmNhdChjaGlsZHJlbikuY29uY2F0KFxuICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6IHRoaXMuc3RhdGUuY2hpbGRyZW5Cb3R0b20gKiB0aGlzLnN0YXRlLmNoaWxkSGVpZ2h0IH19XG4gICAgICAgICAgIGtleT1cImJvdHRvbVwiIC8+XG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogdGhpcy5zdGF0ZS5oZWlnaHQsIG92ZXJmbG93WTogJ2F1dG8nIH19XG4gICAgICAgIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9XG4gICAgICAgIHJlZj1cImNvbnRhaW5lclwiXG4gICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uU2Nyb2xsfT5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eVJlbmRlcjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgZ2V0TGFiZWwgPSByZXF1aXJlKCcuL2ltbXV0YWJsZS91dGlscycpLmdldExhYmVsO1xuXG52YXIgT3B0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRhZGRMYWJlbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIHN0cmluZyByZW5kZXJlZCBpbiBjYXNlIG9mIGFsbG93Q3JlYXRlIG9wdGlvbiBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAgIC8vIGNsYXNzTmFtZSAoYmFzZWQgb24gbW91c2UgcG9zaXRpb24pXG5cdFx0bW91c2VEb3duOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIGNsaWNrIG9uIG9wdGlvbiBlbGVtZW50XG5cdFx0bW91c2VFbnRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIG1vdXNlRW50ZXIgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRtb3VzZUxlYXZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgbW91c2VMZWF2ZSBvbiBvcHRpb24gZWxlbWVudFxuXHRcdG9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgLy8gb2JqZWN0IHRoYXQgaXMgYmFzZSBmb3IgdGhhdCBvcHRpb25cblx0XHRyZW5kZXJGdW5jOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyAgICAgICAgICAgICAgIC8vIG1ldGhvZCBwYXNzZWQgdG8gUmVhY3RTZWxlY3QgY29tcG9uZW50IHRvIHJlbmRlciBsYWJlbCB0ZXh0XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb2JqID0gdGhpcy5wcm9wcy5vcHRpb247XG5cdFx0dmFyIHJlbmRlcmVkTGFiZWwgPSB0aGlzLnByb3BzLnJlbmRlckZ1bmMob2JqKTtcblxuXHRcdHJldHVybiBvYmouZGlzYWJsZWQgPyAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9PntyZW5kZXJlZExhYmVsfTwvZGl2PlxuXHRcdCkgOiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9XG5cdFx0XHRcdG9uTW91c2VFbnRlcj17dGhpcy5wcm9wcy5tb3VzZUVudGVyfVxuXHRcdFx0XHRvbk1vdXNlTGVhdmU9e3RoaXMucHJvcHMubW91c2VMZWF2ZX1cblx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMucHJvcHMubW91c2VEb3dufVxuXHRcdFx0XHRvbkNsaWNrPXt0aGlzLnByb3BzLm1vdXNlRG93bn0+XG5cdFx0XHRcdHsgb2JqLmNyZWF0ZSA/IHRoaXMucHJvcHMuYWRkTGFiZWxUZXh0LnJlcGxhY2UoJ3tsYWJlbH0nLCBnZXRMYWJlbChvYmopKSA6IHJlbmRlcmVkTGFiZWwgfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9uO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIFNpbmdsZVZhbHVlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gdGhpcyBpcyBkZWZhdWx0IHZhbHVlIHByb3ZpZGVkIGJ5IFJlYWN0LVNlbGVjdCBiYXNlZCBjb21wb25lbnRcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCAgICAgICAgICAgICAgLy8gc2VsZWN0ZWQgb3B0aW9uXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LXBsYWNlaG9sZGVyXCI+e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2luZ2xlVmFsdWU7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGdldExhYmVsID0gcmVxdWlyZSgnLi9pbW11dGFibGUvdXRpbHMnKS5nZXRMYWJlbDtcblxudmFyIFZhbHVlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnVmFsdWUnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAgICAgLy8gZGlzYWJsZWQgcHJvcCBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgY2xpY2sgb24gdmFsdWUgbGFiZWxcblx0XHRvblJlbW92ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgcmVtb3ZlIG9mIHRoYXQgdmFsdWVcblx0XHRvcHRpb246IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCwgICAgICAgIC8vIG9wdGlvbiBwYXNzZWQgdG8gY29tcG9uZW50XG5cdFx0b3B0aW9uTGFiZWxDbGljazogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAvLyBpbmRpY2F0ZXMgaWYgb25PcHRpb25MYWJlbENsaWNrIHNob3VsZCBiZSBoYW5kbGVkXG5cdFx0cmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jICAgICAgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gcmVuZGVyIG9wdGlvbiBsYWJlbCBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0fSxcblxuXHRibG9ja0V2ZW50OiBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9LFxuXG5cdGhhbmRsZU9uUmVtb3ZlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuXHRcdFx0dGhpcy5wcm9wcy5vblJlbW92ZShldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxhYmVsID0gZ2V0TGFiZWwodGhpcy5wcm9wcy5vcHRpb24pO1xuXHRcdGlmICh0aGlzLnByb3BzLnJlbmRlcmVyKSB7XG5cdFx0XHRsYWJlbCA9IHRoaXMucHJvcHMucmVuZGVyZXIodGhpcy5wcm9wcy5vcHRpb24pO1xuXHRcdH1cblxuXHRcdGlmKCF0aGlzLnByb3BzLm9uUmVtb3ZlICYmICF0aGlzLnByb3BzLm9wdGlvbkxhYmVsQ2xpY2spIHtcblx0XHRcdHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC12YWx1ZVwiPntsYWJlbH08L2Rpdj47XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvcHMub3B0aW9uTGFiZWxDbGljaykge1xuXHRcdFx0bGFiZWwgPSAoXG5cdFx0XHRcdDxhIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWxhYmVsX19hXCJcblx0XHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5ibG9ja0V2ZW50fVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfT5cblx0XHRcdFx0XHR7bGFiZWx9XG5cdFx0XHRcdDwvYT5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW1cIj5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW0taWNvblwiXG5cdFx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuYmxvY2tFdmVudH1cblx0XHRcdFx0XHRvbkNsaWNrPXt0aGlzLmhhbmRsZU9uUmVtb3ZlfVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlT25SZW1vdmV9PiZ0aW1lczs8L3NwYW4+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmFsdWU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vc291cmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9maW5kXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gIEFycmF5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgaWYgKHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LnByb3RvdHlwZS5maW5kIGNhbGxlZCBvbiBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICB2YXIgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBpc0ltbXV0YWJsZShvYmope1xuXHRyZXR1cm4gb2JqICE9IG51bGwgJiYgdHlwZW9mIG9iai50b0pTID09ICdmdW5jdGlvbidcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVQcm9wKG9iaiwgcHJvcGVydHkpe1xuICBpZighb2JqKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYoaXNJbW11dGFibGUob2JqKSkge1xuICAgIHJldHVybiBvYmouZ2V0KHByb3BlcnR5KTtcbiAgfVxuICByZXR1cm4gb2JqW3Byb3BlcnR5XTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWUob2JqKXtcbiAgcmV0dXJuIGdldFZhbHVlUHJvcChvYmosICd2YWx1ZScpO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbChvYmope1xuICByZXR1cm4gZ2V0VmFsdWVQcm9wKG9iaiwgJ2xhYmVsJyk7XG59XG5cbmZ1bmN0aW9uIGdldExlbmd0aChvYmope1xuXHRpZighb2JqKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgaWYoaXNJbW11dGFibGUob2JqKSkge1xuICAgIHJldHVybiBvYmouc2l6ZVxuICB9XG4gIHJldHVybiBvYmoubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRBdChvYmosIGluZGV4KSB7XG5cdGlmKCFvYmope1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmKGlzSW1tdXRhYmxlKG9iaikpe1xuXHRcdHJldHVybiBvYmouZ2V0KGluZGV4KTtcblx0fVxuXG5cdHJldHVybiBvYmpbaW5kZXhdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0aXNJbW11dGFibGU6IGlzSW1tdXRhYmxlLFxuXHRnZXRWYWx1ZTogZ2V0VmFsdWUsXG5cdGdldExhYmVsOiBnZXRMYWJlbCxcblx0Z2V0VmFsdWVQcm9wOiBnZXRWYWx1ZVByb3AsXG5cdGdldExlbmd0aDogZ2V0TGVuZ3RoLFxuXHRnZXRBdDogZ2V0QXRcbn07XG4iLCIvKiBkaXNhYmxlIHNvbWUgcnVsZXMgdW50aWwgd2UgcmVmYWN0b3IgbW9yZSBjb21wbGV0ZWx5OyBmaXhpbmcgdGhlbSBub3cgd291bGRcbiAgIGNhdXNlIGNvbmZsaWN0cyB3aXRoIHNvbWUgb3BlbiBQUnMgdW5uZWNlc3NhcmlseS4gKi9cbi8qIGVzbGludCByZWFjdC9qc3gtc29ydC1wcm9wLXR5cGVzOiAwLCByZWFjdC9zb3J0LWNvbXA6IDAsIHJlYWN0L3Byb3AtdHlwZXM6IDAgKi9cblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xudmFyIElucHV0ID0gcmVxdWlyZSgncmVhY3QtaW5wdXQtYXV0b3NpemUnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xudmFyIFZhbHVlID0gcmVxdWlyZSgnLi9WYWx1ZScpO1xudmFyIFNpbmdsZVZhbHVlID0gcmVxdWlyZSgnLi9TaW5nbGVWYWx1ZScpO1xudmFyIE9wdGlvbiA9IHJlcXVpcmUoJy4vT3B0aW9uJyk7XG52YXIgTGF6eVJlbmRlciA9IHJlcXVpcmUoJy4vTGF6eVJlbmRlcicpO1xudmFyIGltbXV0YWJsZVV0aWxzID0gcmVxdWlyZSgnLi9pbW11dGFibGUvdXRpbHMnKTtcbnJlcXVpcmUoJy4vYXJyYXlGaW5kUG9seWZpbGwnKTtcblxudmFyIGlzSW1tdXRhYmxlID0gaW1tdXRhYmxlVXRpbHMuaXNJbW11dGFibGUsXG5nZXRWYWx1ZSA9IGltbXV0YWJsZVV0aWxzLmdldFZhbHVlLFxuZ2V0TGFiZWwgPSBpbW11dGFibGVVdGlscy5nZXRMYWJlbCxcbmdldFZhbHVlUHJvcCA9IGltbXV0YWJsZVV0aWxzLmdldFZhbHVlUHJvcCxcbmdldExlbmd0aCA9IGltbXV0YWJsZVV0aWxzLmdldExlbmd0aCxcbmdldEF0ID0gaW1tdXRhYmxlVXRpbHMuZ2V0QXQ7XG5cbnZhciByZXF1ZXN0SWQgPSAwO1xuXG4vLyB0ZXN0IGJ5IHZhbHVlLCBwb3IgZWlkIGlmIGF2YWlsYWJsZVxudmFyIGlzRXF1YWxWYWx1ZSA9IGZ1bmN0aW9uKHYxLCB2Mikge1xuICByZXR1cm4gSW1tdXRhYmxlLmlzKHYxLCB2MikgfHwgKFxuICAgIHYxICYmIHYyICYmIHYxLmhhcyAmJiB2MS5oYXMoJ2VpZCcpICYmIHYyLmdldCAmJlxuICAgICAgSW1tdXRhYmxlLmlzKHYxLmdldCgnZWlkJyksIHYyLmdldCgnZWlkJykpXG4gICk7XG59O1xuXG52YXIgY29tcGFyZU9wdGlvbnMgPSBmdW5jdGlvbihvcHMxLCBvcHMyKXtcbiAgcmV0dXJuIGlzSW1tdXRhYmxlKG9wczEsIG9wczIpID9cbiAgICBJbW11dGFibGUuaXMob3BzMSwgb3BzMikgOlxuICAgIEpTT04uc3RyaW5naWZ5KG9wczEpID09PSBKU09OLnN0cmluZ2lmeShvcHMyKTtcbn07XG5cbnZhciBTZWxlY3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIGFkZExhYmVsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAvLyBwbGFjZWhvbGRlciBkaXNwbGF5ZWQgd2hlbiB5b3Ugd2FudCB0byBhZGQgYSBsYWJlbCBvbiBhIG11bHRpLXZhbHVlIGlucHV0XG4gICAgYWxsb3dDcmVhdGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgIC8vIHdoZXRoZXIgdG8gYWxsb3cgY3JlYXRpb24gb2YgbmV3IGVudHJpZXNcbiAgICBhc3luY09wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gZnVuY3Rpb24gdG8gY2FsbCB0byBnZXQgb3B0aW9uc1xuICAgIGF1dG9sb2FkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAvLyB3aGV0aGVyIHRvIGF1dG8tbG9hZCB0aGUgZGVmYXVsdCBhc3luYyBvcHRpb25zIHNldFxuICAgIGJhY2tzcGFjZVJlbW92ZXM6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAvLyB3aGV0aGVyIGJhY2tzcGFjZSByZW1vdmVzIGFuIGl0ZW0gaWYgdGhlcmUgaXMgbm8gdGV4dCBpbnB1dFxuICAgIGNhY2hlQXN5bmNSZXN1bHRzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAvLyB3aGV0aGVyIHRvIGFsbG93IGNhY2hlXG4gICAgY2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIGNsYXNzTmFtZSBmb3IgdGhlIG91dGVyIGVsZW1lbnRcbiAgICBjbGVhckFsbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgLy8gdGl0bGUgZm9yIHRoZSBcImNsZWFyXCIgY29udHJvbCB3aGVuIG11bHRpOiB0cnVlXG4gICAgY2xlYXJWYWx1ZVRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgIC8vIHRpdGxlIGZvciB0aGUgXCJjbGVhclwiIGNvbnRyb2xcbiAgICBjbGVhcmFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgLy8gc2hvdWxkIGl0IGJlIHBvc3NpYmxlIHRvIHJlc2V0IHZhbHVlXG4gICAgZGVsaW1pdGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIGRlbGltaXRlciB0byB1c2UgdG8gam9pbiBtdWx0aXBsZSB2YWx1ZXNcbiAgICBkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgLy8gd2hldGhlciB0aGUgU2VsZWN0IGlzIGRpc2FibGVkIG9yIG5vdFxuICAgIGZpbHRlck9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAvLyBtZXRob2QgdG8gZmlsdGVyIGEgc2luZ2xlIG9wdGlvbjogZnVuY3Rpb24ob3B0aW9uLCBmaWx0ZXJTdHJpbmcpXG4gICAgZmlsdGVyT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgIC8vIG1ldGhvZCB0byBmaWx0ZXIgdGhlIG9wdGlvbnMgYXJyYXk6IGZ1bmN0aW9uKFtvcHRpb25zXSwgZmlsdGVyU3RyaW5nLCBbdmFsdWVzXSlcbiAgICBpZ25vcmVDYXNlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgLy8gd2hldGhlciB0byBwZXJmb3JtIGNhc2UtaW5zZW5zaXRpdmUgZmlsdGVyaW5nXG4gICAgaW5wdXRQcm9wczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCwgICAgICAgIC8vIGN1c3RvbSBhdHRyaWJ1dGVzIGZvciB0aGUgSW5wdXQgKGluIHRoZSBTZWxlY3QtY29udHJvbCkgZS5nOiB7J2RhdGEtZm9vJzogJ2Jhcid9XG4gICAgbWF0Y2hQb3M6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIChhbnl8c3RhcnQpIG1hdGNoIHRoZSBzdGFydCBvciBlbnRpcmUgc3RyaW5nIHdoZW4gZmlsdGVyaW5nXG4gICAgbWF0Y2hQcm9wOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIChhbnl8bGFiZWx8dmFsdWUpIHdoaWNoIG9wdGlvbiBwcm9wZXJ0eSB0byBmaWx0ZXIgb25cbiAgICBtdWx0aTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgICAgLy8gbXVsdGktdmFsdWUgaW5wdXRcbiAgICBuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgICAgLy8gZmllbGQgbmFtZSwgZm9yIGhpZGRlbiA8aW5wdXQgLz4gdGFnXG4gICAgbmV3T3B0aW9uQ3JlYXRvcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgIC8vIGZhY3RvcnkgdG8gY3JlYXRlIG5ldyBvcHRpb25zIHdoZW4gYWxsb3dDcmVhdGUgc2V0XG4gICAgbm9SZXN1bHRzVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgIC8vIHBsYWNlaG9sZGVyIGRpc3BsYXllZCB3aGVuIHRoZXJlIGFyZSBubyBtYXRjaGluZyBzZWFyY2ggcmVzdWx0c1xuICAgIG9uQmx1cjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBvbkJsdXIgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIHt9XG4gICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgIC8vIG9uQ2hhbmdlIGhhbmRsZXI6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7fVxuICAgIG9uRm9jdXM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAvLyBvbkZvY3VzIGhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7fVxuICAgIG9uT3B0aW9uTGFiZWxDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAvLyBvbkNMaWNrIGhhbmRsZXIgZm9yIHZhbHVlIGxhYmVsczogZnVuY3Rpb24gKHZhbHVlLCBldmVudCkge31cbiAgICBvcHRpb25Db21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgLy8gb3B0aW9uIGNvbXBvbmVudCB0byByZW5kZXIgaW4gZHJvcGRvd25cbiAgICBvcHRpb25SZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgLy8gb3B0aW9uUmVuZGVyZXI6IGZ1bmN0aW9uKG9wdGlvbikge31cbiAgICBvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5hcnJheSxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5pbnN0YW5jZU9mKEltbXV0YWJsZS5MaXN0KVxuICAgIF0pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFycmF5IG9mIG9wdGlvbnNcbiAgICBwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gZmllbGQgcGxhY2Vob2xkZXIsIGRpc3BsYXllZCB3aGVuIHRoZXJlJ3Mgbm8gdmFsdWVcbiAgICBzZWFyY2hhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgLy8gd2hldGhlciB0byBlbmFibGUgc2VhcmNoaW5nIGZlYXR1cmUgb3Igbm90XG4gICAgc2VhcmNoUHJvbXB0VGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgIC8vIGxhYmVsIHRvIHByb21wdCBmb3Igc2VhcmNoIGlucHV0XG4gICAgc2luZ2xlVmFsdWVDb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLC8vIHNpbmdsZSB2YWx1ZSBjb21wb25lbnQgd2hlbiBtdWx0aXBsZSBpcyBzZXQgdG8gZmFsc2VcbiAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLmFueSwgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBmaWVsZCB2YWx1ZVxuICAgIHZhbHVlQ29tcG9uZW50OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAvLyB2YWx1ZSBjb21wb25lbnQgdG8gcmVuZGVyIGluIG11bHRpcGxlIG1vZGVcbiAgICB2YWx1ZVJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgLy8gdmFsdWVSZW5kZXJlcjogZnVuY3Rpb24ob3B0aW9uKSB7fVxuICAgIHN0eWxlTWVudU91dGVyOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LCAgICAgIC8vIHN0eWxlTWVudU91dGVyOiBzdHlsZSBvYmplY3QgdXNlZCBieSBtZW51IGRyb3Bkb3duXG4gICAgbGF6eTogUmVhY3QuUHJvcFR5cGVzLmJvb2wgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGF6eTogdXNlIExhenlSZW5kZXIgZm9yIGRyb3Bkb3duIGl0ZW1zXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYWRkTGFiZWxUZXh0OiAnQWRpY2lvbmFyIHtsYWJlbH0gPycsXG4gICAgICBhbGxvd0NyZWF0ZTogZmFsc2UsXG4gICAgICBhc3luY09wdGlvbnM6IHVuZGVmaW5lZCxcbiAgICAgIGF1dG9sb2FkOiB0cnVlLFxuICAgICAgYmFja3NwYWNlUmVtb3ZlczogdHJ1ZSxcbiAgICAgIGNhY2hlQXN5bmNSZXN1bHRzOiB0cnVlLFxuICAgICAgY2xhc3NOYW1lOiB1bmRlZmluZWQsXG4gICAgICBjbGVhckFsbFRleHQ6ICdMaW1wYXIgdG9kb3MnLFxuICAgICAgY2xlYXJWYWx1ZVRleHQ6ICdMaW1wYXInLFxuICAgICAgY2xlYXJhYmxlOiB0cnVlLFxuICAgICAgZGVsaW1pdGVyOiAnLCcsXG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICBpZ25vcmVDYXNlOiB0cnVlLFxuICAgICAgaW5wdXRQcm9wczoge30sXG4gICAgICBtYXRjaFBvczogJ2FueScsXG4gICAgICBtYXRjaFByb3A6ICdhbnknLFxuICAgICAgbmFtZTogdW5kZWZpbmVkLFxuICAgICAgbmV3T3B0aW9uQ3JlYXRvcjogdW5kZWZpbmVkLFxuICAgICAgbm9SZXN1bHRzVGV4dDogJ05lbmh1bSByZXN1bHRhZG8gZW5jb250cmFkbycsXG4gICAgICBvbkNoYW5nZTogdW5kZWZpbmVkLFxuICAgICAgb25PcHRpb25MYWJlbENsaWNrOiB1bmRlZmluZWQsXG4gICAgICBvcHRpb25Db21wb25lbnQ6IE9wdGlvbixcbiAgICAgIG9wdGlvbnM6IHVuZGVmaW5lZCxcbiAgICAgIHBsYWNlaG9sZGVyOiAnU2VsZWNpb25lLi4uJyxcbiAgICAgIHNlYXJjaGFibGU6IHRydWUsXG4gICAgICBzZWFyY2hQcm9tcHRUZXh0OiAnRGlnaXRlIHBhcmEgYnVzY2FyJyxcbiAgICAgIHNpbmdsZVZhbHVlQ29tcG9uZW50OiBTaW5nbGVWYWx1ZSxcbiAgICAgIHZhbHVlOiB1bmRlZmluZWQsXG4gICAgICB2YWx1ZUNvbXBvbmVudDogVmFsdWUsXG4gICAgICBsYXp5OiBmYWxzZSxcbiAgICAgIHN0eWxlTWVudU91dGVyOiB7fVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLypcbiAgICAgICAqIHNldCBieSBnZXRTdGF0ZUZyb21WYWx1ZSBvbiBjb21wb25lbnRXaWxsTW91bnQ6XG4gICAgICAgKiAtIHZhbHVlXG4gICAgICAgKiAtIHZhbHVlc1xuICAgICAgICogLSBmaWx0ZXJlZE9wdGlvbnNcbiAgICAgICAqIC0gaW5wdXRWYWx1ZVxuICAgICAgICogLSBwbGFjZWhvbGRlclxuICAgICAgICogLSBmb2N1c2VkT3B0aW9uXG4gICAgICAgKi9cbiAgICAgIGlzRm9jdXNlZDogZmFsc2UsXG4gICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgaXNPcGVuOiBmYWxzZSxcbiAgICAgIG9wdGlvbnM6IHRoaXMucHJvcHMub3B0aW9uc1xuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9vcHRpb25zQ2FjaGUgPSB7fTtcbiAgICB0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nID0gJyc7XG4gICAgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzT3Blbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgbWVudUVsZW0gPSB0aGlzLnJlZnMuc2VsZWN0TWVudUNvbnRhaW5lcjtcbiAgICAgIHZhciBjb250cm9sRWxlbSA9IHRoaXMucmVmcy5jb250cm9sO1xuXG4gICAgICB2YXIgZXZlbnRPY2N1cmVkT3V0c2lkZU1lbnUgPSB0aGlzLmNsaWNrZWRPdXRzaWRlRWxlbWVudChtZW51RWxlbSwgZXZlbnQpO1xuICAgICAgdmFyIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sID0gdGhpcy5jbGlja2VkT3V0c2lkZUVsZW1lbnQoY29udHJvbEVsZW0sIGV2ZW50KTtcblxuICAgICAgLy8gSGlkZSBkcm9wZG93biBtZW51IGlmIGNsaWNrIG9jY3VycmVkIG91dHNpZGUgb2YgbWVudVxuICAgICAgaWYgKGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ICYmIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGlzT3BlbjogZmFsc2VcbiAgICAgICAgfSwgdGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICYmIGRvY3VtZW50LmF0dGFjaEV2ZW50KSB7XG4gICAgICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KCdvbmNsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICYmIGRvY3VtZW50LmRldGFjaEV2ZW50KSB7XG4gICAgICAgIGRvY3VtZW50LmRldGFjaEV2ZW50KCdvbmNsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlRnJvbVZhbHVlKHRoaXMucHJvcHMudmFsdWUpKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuYXN5bmNPcHRpb25zICYmIHRoaXMucHJvcHMuYXV0b2xvYWQpIHtcbiAgICAgIHRoaXMuYXV0b2xvYWRBc3luY09wdGlvbnMoKTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9ibHVyVGltZW91dCk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2ZvY3VzVGltZW91dCk7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG4gICAgICB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5ld1Byb3BzKSB7XG4gICAgdmFyIG9wdGlvbnNDaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKCFjb21wYXJlT3B0aW9ucyhuZXdQcm9wcy5vcHRpb25zLCB0aGlzLnByb3BzLm9wdGlvbnMpKSB7XG4gICAgICBvcHRpb25zQ2hhbmdlZCA9IHRydWU7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgb3B0aW9uczogbmV3UHJvcHMub3B0aW9ucyxcbiAgICAgICAgZmlsdGVyZWRPcHRpb25zOiB0aGlzLmZpbHRlck9wdGlvbnMobmV3UHJvcHMub3B0aW9ucylcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIWlzRXF1YWxWYWx1ZShuZXdQcm9wcy52YWx1ZSwgdGhpcy5zdGF0ZS52YWx1ZSkgfHwgbmV3UHJvcHMucGxhY2Vob2xkZXIgIT09IHRoaXMucHJvcHMucGxhY2Vob2xkZXIgfHwgb3B0aW9uc0NoYW5nZWQpIHtcbiAgICAgIHZhciBzZXRTdGF0ZSA9IChuZXdTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUobmV3UHJvcHMudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobmV3U3RhdGUgJiYgbmV3U3RhdGUub3B0aW9ucykgfHwgbmV3UHJvcHMub3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Byb3BzLnBsYWNlaG9sZGVyKVxuICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5wcm9wcy5hc3luY09wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5sb2FkQXN5bmNPcHRpb25zKG5ld1Byb3BzLnZhbHVlLCB7fSwgc2V0U3RhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0U3RhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMuZGlzYWJsZWQgJiYgdGhpcy5fZm9jdXNBZnRlclVwZGF0ZSkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2JsdXJUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2ZvY3VzVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG4gICAgICAgIHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgPSBmYWxzZTtcbiAgICAgIH0sIDUwKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwpIHtcbiAgICAgIGlmICh0aGlzLnJlZnMuZm9jdXNlZCAmJiB0aGlzLnJlZnMubWVudSkge1xuICAgICAgICB2YXIgZm9jdXNlZERPTSA9IHRoaXMucmVmcy5mb2N1c2VkO1xuICAgICAgICB2YXIgbWVudURPTSA9IHRoaXMucmVmcy5tZW51O1xuICAgICAgICB2YXIgZm9jdXNlZFJlY3QgPSBmb2N1c2VkRE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB2YXIgbWVudVJlY3QgPSBtZW51RE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIGlmIChmb2N1c2VkUmVjdC5ib3R0b20gPiBtZW51UmVjdC5ib3R0b20gfHwgZm9jdXNlZFJlY3QudG9wIDwgbWVudVJlY3QudG9wKSB7XG4gICAgICAgICAgbWVudURPTS5zY3JvbGxUb3AgPSAoZm9jdXNlZERPTS5vZmZzZXRUb3AgKyBmb2N1c2VkRE9NLmNsaWVudEhlaWdodCAtIG1lbnVET00ub2Zmc2V0SGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCA9IGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICBmb2N1czogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuICB9LFxuXG4gIGNsaWNrZWRPdXRzaWRlRWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCwgZXZlbnQpIHtcbiAgICB2YXIgZXZlbnRUYXJnZXQgPSAoZXZlbnQudGFyZ2V0KSA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnNyY0VsZW1lbnQ7XG4gICAgd2hpbGUgKGV2ZW50VGFyZ2V0ICE9IG51bGwpIHtcbiAgICAgIGlmIChldmVudFRhcmdldCA9PT0gZWxlbWVudCkgcmV0dXJuIGZhbHNlO1xuICAgICAgZXZlbnRUYXJnZXQgPSBldmVudFRhcmdldC5vZmZzZXRQYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGdldFN0YXRlRnJvbVZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucywgcGxhY2Vob2xkZXIpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnM7XG4gICAgfVxuICAgIGlmICghcGxhY2Vob2xkZXIpIHtcbiAgICAgIHBsYWNlaG9sZGVyID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlcjtcbiAgICB9XG5cbiAgICAvLyBOb3JtYWxpemEgaW1wbGVtZW50YcOnw6NvIHBhc3NhbmRvIMOhcyB2ZXNlcyB2YWx1ZSwgw6FzIHZlemVzIG9wdGlvbiBhcXVpOlxuICAgIGlmKCgodmFsdWUgIT0gbnVsbCkgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmICh2YWx1ZS52YWx1ZSAhPSBudWxsKSAmJiAodmFsdWUubGFiZWwgIT0gbnVsbCkpIHx8XG4gICAgICAgKHZhbHVlIGluc3RhbmNlb2YgSW1tdXRhYmxlLk1hcCAmJiB2YWx1ZS5oYXMoJ3ZhbHVlJykgJiYgdmFsdWUuaGFzKCdsYWJlbCcpKSkge1xuICAgICAgdmFsdWUgPSBnZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gcmVzZXQgaW50ZXJuYWwgZmlsdGVyIHN0cmluZ1xuICAgIHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblxuICAgIHZhciB2YWx1ZXMgPSB0aGlzLmluaXRWYWx1ZXNBcnJheSh2YWx1ZSwgb3B0aW9ucyk7XG4gICAgdmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zLCB2YWx1ZXMpO1xuXG4gICAgdmFyIGZvY3VzZWRPcHRpb247XG4gICAgdmFyIHZhbHVlRm9yU3RhdGUgPSBudWxsO1xuICAgIGlmICghdGhpcy5wcm9wcy5tdWx0aSAmJiBnZXRMZW5ndGgodmFsdWVzKSkge1xuICAgICAgZm9jdXNlZE9wdGlvbiA9IGdldEF0KHZhbHVlcywgMCk7XG4gICAgICB2YWx1ZUZvclN0YXRlID0gZ2V0VmFsdWUoZm9jdXNlZE9wdGlvbik7XG4gICAgfVxuICAgIGVsc2UgaWYodGhpcy5wcm9wcy5tdWx0aSkge1xuICAgICAgZm9yICh2YXIgb3B0aW9uSW5kZXggPSAwOyBvcHRpb25JbmRleCA8IGdldExlbmd0aChmaWx0ZXJlZE9wdGlvbnMpOyArK29wdGlvbkluZGV4KSB7XG4gICAgICAgIHZhciBvcHRpb24gPSBnZXRBdChmaWx0ZXJlZE9wdGlvbnMsIG9wdGlvbkluZGV4KTtcbiAgICAgICAgaWYgKCFnZXRWYWx1ZVByb3Aob3B0aW9uLCAnZGlzYWJsZWQnKSkge1xuICAgICAgICAgIGZvY3VzZWRPcHRpb24gPSBvcHRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhbHVlRm9yU3RhdGUgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uKHYpIHsgcmV0dXJuIGdldFZhbHVlKHYpOyB9KS5qb2luKHRoaXMucHJvcHMuZGVsaW1pdGVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHZhbHVlRm9yU3RhdGUsXG4gICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgIGlucHV0VmFsdWU6ICcnLFxuICAgICAgZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgICBwbGFjZWhvbGRlcjogIXRoaXMucHJvcHMubXVsdGkgJiYgZ2V0TGVuZ3RoKHZhbHVlcykgPyBnZXRMYWJlbChnZXRBdCh2YWx1ZXMsIDApKSA6IHBsYWNlaG9sZGVyLFxuICAgICAgZm9jdXNlZE9wdGlvbjogZm9jdXNlZE9wdGlvblxuICAgIH07XG4gIH0sXG5cblx0aW5pdFZhbHVlc0FycmF5OiBmdW5jdGlvbih2YWx1ZXMsIG9wdGlvbnMpIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSAmJiAhSW1tdXRhYmxlLkl0ZXJhYmxlLmlzSW5kZXhlZCh2YWx1ZXMpKSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlcyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0dmFsdWVzID0gdmFsdWVzID09PSAnJyA/IEltbXV0YWJsZS5MaXN0KCkgOiBJbW11dGFibGUuTGlzdCh2YWx1ZXMuc3BsaXQodGhpcy5wcm9wcy5kZWxpbWl0ZXIpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbHVlcyA9IHZhbHVlcyAhPT0gdW5kZWZpbmVkICYmIHZhbHVlcyAhPT0gbnVsbCA/IEltbXV0YWJsZS5MaXN0KFt2YWx1ZXNdKSA6IEltbXV0YWJsZS5MaXN0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB2YWx1ZXMubWFwKGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0aWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdHJldHVybiBvcHRpb25zLmZpbmQob3AgPT4ge1xuXHRcdFx0XHRcdFx0dmFyIG9wVmFsdWUgPSBnZXRWYWx1ZShvcCk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBpc0VxdWFsVmFsdWUob3BWYWx1ZSwgdmFsKSB8fCB0eXBlb2Ygb3BWYWx1ZSA9PT0gJ251bWJlcicgJiYgb3BWYWx1ZS50b1N0cmluZygpID09PSB2YWxcblx0XHRcdFx0XHR9KSB8fCBJbW11dGFibGUuTWFwKHsgdmFsdWU6IHZhbCwgbGFiZWw6IHZhbCB9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB2YWw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cbiAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBmb2N1c0FmdGVyVXBkYXRlKSB7XG4gICAgaWYgKGZvY3VzQWZ0ZXJVcGRhdGUgfHwgZm9jdXNBZnRlclVwZGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9mb2N1c0FmdGVyVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIG5ld1N0YXRlID0gdGhpcy5nZXRTdGF0ZUZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgbmV3U3RhdGUuaXNPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5maXJlQ2hhbmdlRXZlbnQobmV3U3RhdGUpO1xuICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuICB9LFxuXG4gIHNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdGhpcy5wcm9wcy5tdWx0aSkge1xuICAgICAgdGhpcy5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5hZGRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICAgIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcbiAgfSxcblxuICBhZGRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZihpc0ltbXV0YWJsZSh2YWx1ZSkgJiYgaXNJbW11dGFibGUodGhpcy5zdGF0ZS52YWx1ZXMpKXtcbiAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5zdGF0ZS52YWx1ZXMucHVzaCh2YWx1ZSkpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5jb25jYXQodmFsdWUpKTtcbiAgICB9XG4gIH0sXG5cbiAgcG9wVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0VmFsdWUodGhpcy5zdGF0ZS52YWx1ZXMuc2xpY2UoMCwgZ2V0TGVuZ3RoKHRoaXMuc3RhdGUudmFsdWVzKSAtIDEpKTtcbiAgfSxcblxuICByZW1vdmVWYWx1ZTogZnVuY3Rpb24odmFsdWVUb1JlbW92ZSkge1xuICAgIHRoaXMuc2V0VmFsdWUodGhpcy5zdGF0ZS52YWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgIT09IHZhbHVlVG9SZW1vdmU7XG4gICAgfSkpO1xuICB9LFxuXG4gIGNsZWFyVmFsdWU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuICAgIC8vIGJ1dHRvbiwgaWdub3JlIGl0LlxuICAgIGlmIChldmVudCAmJiBldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnNldFZhbHVlKG51bGwpO1xuICB9LFxuXG4gIHJlc2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0VmFsdWUodGhpcy5zdGF0ZS52YWx1ZSA9PT0gJycgPyBudWxsIDogdGhpcy5zdGF0ZS52YWx1ZSk7XG4gIH0sXG5cbiAgZ2V0SW5wdXROb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy5pbnB1dDtcbiAgfSxcblxuICBmaXJlQ2hhbmdlRXZlbnQ6IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgaWYgKG5ld1N0YXRlLnZhbHVlICE9PSB0aGlzLnN0YXRlLnZhbHVlICYmIHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3U3RhdGUudmFsdWUsIG5ld1N0YXRlLnZhbHVlcyk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZU1vdXNlRG93bjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG4gICAgLy8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG4gICAgaWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0ZvY3VzZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc09wZW46IHRydWVcbiAgICAgIH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fb3BlbkFmdGVyRm9jdXMgPSB0cnVlO1xuICAgICAgdGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuICAgIH1cbiAgfSxcblxuICBoYW5kbGVNb3VzZURvd25PbkFycm93OiBmdW5jdGlvbihldmVudCkge1xuICAgIC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcbiAgICAvLyBidXR0b24sIG9yIGlmIHRoZSBjb21wb25lbnQgaXMgZGlzYWJsZWQsIGlnbm9yZSBpdC5cbiAgICBpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBJZiBub3QgZm9jdXNlZCwgaGFuZGxlTW91c2VEb3duIHdpbGwgaGFuZGxlIGl0XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzT3Blbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNPcGVuOiBmYWxzZVxuICAgIH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuICB9LFxuXG4gIGhhbmRsZUlucHV0Rm9jdXM6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIG5ld0lzT3BlbiA9IHRoaXMuc3RhdGUuaXNPcGVuIHx8IHRoaXMuX29wZW5BZnRlckZvY3VzO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNGb2N1c2VkOiB0cnVlLFxuICAgICAgaXNPcGVuOiBuZXdJc09wZW5cbiAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgIGlmKG5ld0lzT3Blbikge1xuICAgICAgICB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9vcGVuQWZ0ZXJGb2N1cyA9IGZhbHNlO1xuICAgIGlmICh0aGlzLnByb3BzLm9uRm9jdXMpIHtcbiAgICAgIHRoaXMucHJvcHMub25Gb2N1cyhldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUlucHV0Qmx1cjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLl9ibHVyVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUpIHJldHVybjtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc0ZvY3VzZWQ6IGZhbHNlLFxuICAgICAgICBpc09wZW46IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LCA1MCk7XG4gICAgaWYgKHRoaXMucHJvcHMub25CbHVyKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQmx1cihldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZUtleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMucHJvcHMuZGlzYWJsZWQpIHJldHVybjtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICBjYXNlIDg6IC8vIGJhY2tzcGFjZVxuICAgICAgaWYgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUgJiYgdGhpcy5wcm9wcy5iYWNrc3BhY2VSZW1vdmVzKSB7XG4gICAgICAgIHRoaXMucG9wVmFsdWUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICBjYXNlIDk6IC8vIHRhYlxuICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5IHx8ICF0aGlzLnN0YXRlLmlzT3BlbiB8fCAhdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxMzogLy8gZW50ZXJcbiAgICAgIGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHJldHVybjtcblxuICAgICAgdGhpcy5zZWxlY3RGb2N1c2VkT3B0aW9uKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI3OiAvLyBlc2NhcGVcbiAgICAgIGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuICAgICAgICB0aGlzLnJlc2V0VmFsdWUoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5jbGVhcmFibGUpIHtcbiAgICAgICAgdGhpcy5jbGVhclZhbHVlKGV2ZW50KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzg6IC8vIHVwXG4gICAgICB0aGlzLmZvY3VzUHJldmlvdXNPcHRpb24oKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDA6IC8vIGRvd25cbiAgICAgIHRoaXMuZm9jdXNOZXh0T3B0aW9uKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE4ODogLy8gLFxuICAgICAgaWYgKHRoaXMucHJvcHMuYWxsb3dDcmVhdGUgJiYgdGhpcy5wcm9wcy5tdWx0aSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5zZWxlY3RGb2N1c2VkT3B0aW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH0sXG5cbiAgLy8gRW5zdXJlcyB0aGF0IHRoZSBjdXJyZW50bHkgZm9jdXNlZCBvcHRpb24gaXMgYXZhaWxhYmxlIGluIGZpbHRlcmVkT3B0aW9ucy5cbiAgLy8gSWYgbm90LCByZXR1cm5zIHRoZSBmaXJzdCBhdmFpbGFibGUgb3B0aW9uLlxuICBfZ2V0TmV3Rm9jdXNlZE9wdGlvbjogZnVuY3Rpb24oZmlsdGVyZWRPcHRpb25zKSB7XG4gICAgdmFyIGZvY3VzZWRPcHRpb24gPSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb25cbiAgICByZXR1cm4gZmlsdGVyZWRPcHRpb25zLmZpbmQob3AgPT4gb3AgPT09IGZvY3VzZWRPcHRpb24pIHx8IGdldEF0KGZpbHRlcmVkT3B0aW9ucywgMCk7XG4gIH0sXG5cbiAgaGFuZGxlSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gYXNzaWduIGFuIGludGVybmFsIHZhcmlhYmxlIGJlY2F1c2Ugd2UgbmVlZCB0byB1c2VcbiAgICAvLyB0aGUgbGF0ZXN0IHZhbHVlIGJlZm9yZSBzZXRTdGF0ZSgpIGhhcyBjb21wbGV0ZWQuXG4gICAgdGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuICAgIGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgaW5wdXRWYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlXG4gICAgICB9KTtcbiAgICAgIHRoaXMubG9hZEFzeW5jT3B0aW9ucyhldmVudC50YXJnZXQudmFsdWUsIHtcbiAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgaXNPcGVuOiB0cnVlXG4gICAgICB9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc09wZW46IHRydWUsXG4gICAgICAgIGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSxcbiAgICAgICAgZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgICAgIGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuICAgICAgfSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuICAgIH1cbiAgfSxcblxuICBhdXRvbG9hZEFzeW5jT3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkQXN5bmNPcHRpb25zKCh0aGlzLnByb3BzLnZhbHVlIHx8ICcnKSwge30sICgpID0+IHtcbiAgICAgIC8vIHVwZGF0ZSB3aXRoIGZldGNoZWQgYnV0IGRvbid0IGZvY3VzXG4gICAgICB0aGlzLnNldFZhbHVlKHRoaXMucHJvcHMudmFsdWUsIGZhbHNlKTtcbiAgICB9KTtcbiAgfSxcblxuICBsb2FkQXN5bmNPcHRpb25zOiBmdW5jdGlvbihpbnB1dCwgc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHRoaXNSZXF1ZXN0SWQgPSB0aGlzLl9jdXJyZW50UmVxdWVzdElkID0gcmVxdWVzdElkKys7XG4gICAgaWYgKHRoaXMucHJvcHMuY2FjaGVBc3luY1Jlc3VsdHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjYWNoZUtleSA9IGlucHV0LnNsaWNlKDAsIGkpO1xuICAgICAgICBpZiAodGhpcy5fb3B0aW9uc0NhY2hlW2NhY2hlS2V5XSAmJiAoaW5wdXQgPT09IGNhY2hlS2V5IHx8IHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0uY29tcGxldGUpKSB7XG4gICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLm9wdGlvbnM7XG4gICAgICAgICAgdmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgICB2YXIgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgICAgICAgICBmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcbiAgICAgICAgICB9O1xuICAgICAgICAgIGZvciAodmFyIGtleSBpbiBzdGF0ZSkge1xuICAgICAgICAgICAgaWYgKHN0YXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgbmV3U3RhdGVba2V5XSA9IHN0YXRlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2suY2FsbCh0aGlzLCBuZXdTdGF0ZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcy5hc3luY09wdGlvbnMoaW5wdXQsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgIGlmICh0aGlzLnByb3BzLmNhY2hlQXN5bmNSZXN1bHRzKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbnNDYWNoZVtpbnB1dF0gPSBkYXRhO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXNSZXF1ZXN0SWQgIT09IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhkYXRhLm9wdGlvbnMpO1xuICAgICAgdmFyIG5ld1N0YXRlID0ge1xuICAgICAgICBvcHRpb25zOiBkYXRhLm9wdGlvbnMsXG4gICAgICAgIGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuICAgICAgICBmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcbiAgICAgIH07XG4gICAgICBmb3IgKHZhciBrZXkgaW4gc3RhdGUpIHtcbiAgICAgICAgaWYgKHN0YXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBuZXdTdGF0ZVtrZXldID0gc3RhdGVba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrLmNhbGwodGhpcywgbmV3U3RhdGUpO1xuICAgIH0pO1xuICB9LFxuXG4gIGZpbHRlck9wdGlvbnM6IGZ1bmN0aW9uKG9wdGlvbnMsIHZhbHVlcykge1xuICAgIHZhciBmaWx0ZXJWYWx1ZSA9IHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmc7XG4gICAgdmFyIGV4Y2x1ZGUgPSAodmFsdWVzIHx8IHRoaXMuc3RhdGUudmFsdWVzKS5tYXAoZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIGdldFZhbHVlKHYpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zLCBmaWx0ZXJWYWx1ZSwgZXhjbHVkZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmaWx0ZXJPcHRpb24gPSBmdW5jdGlvbihvcCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tdWx0aSAmJiBleGNsdWRlLmluZGV4T2YoZ2V0VmFsdWUob3ApKSA+IC0xKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbikgcmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uLmNhbGwodGhpcywgb3AsIGZpbHRlclZhbHVlKTtcbiAgICAgICAgdmFyIHZhbHVlVGVzdCA9IFN0cmluZyhnZXRWYWx1ZShvcCkpLCBsYWJlbFRlc3QgPSBTdHJpbmcoZ2V0TGFiZWwob3ApKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaWdub3JlQ2FzZSkge1xuICAgICAgICAgIHZhbHVlVGVzdCA9IHZhbHVlVGVzdC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGxhYmVsVGVzdCA9IGxhYmVsVGVzdC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGZpbHRlclZhbHVlID0gZmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gIWZpbHRlclZhbHVlIHx8ICh0aGlzLnByb3BzLm1hdGNoUG9zID09PSAnc3RhcnQnKSA/IChcbiAgICAgICAgICAodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICdsYWJlbCcgJiYgdmFsdWVUZXN0LnN1YnN0cigwLCBmaWx0ZXJWYWx1ZS5sZW5ndGgpID09PSBmaWx0ZXJWYWx1ZSkgfHxcbiAgICAgICAgICAgICh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3Quc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKVxuICAgICAgICApIDogKFxuICAgICAgICAgICh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3QuaW5kZXhPZihmaWx0ZXJWYWx1ZSkgPj0gMCkgfHxcbiAgICAgICAgICAgICh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3QuaW5kZXhPZihmaWx0ZXJWYWx1ZSkgPj0gMClcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gKG9wdGlvbnMgfHwgW10pLmZpbHRlcihmaWx0ZXJPcHRpb24sIHRoaXMpO1xuICAgIH1cbiAgfSxcblxuICBzZWxlY3RGb2N1c2VkT3B0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5hbGxvd0NyZWF0ZSAmJiAhdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLnN0YXRlLmlucHV0VmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pO1xuICB9LFxuXG4gIGZvY3VzT3B0aW9uOiBmdW5jdGlvbihvcCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZm9jdXNlZE9wdGlvbjogb3BcbiAgICB9KTtcbiAgfSxcblxuICBmb2N1c05leHRPcHRpb246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbignbmV4dCcpO1xuICB9LFxuXG4gIGZvY3VzUHJldmlvdXNPcHRpb246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbigncHJldmlvdXMnKTtcbiAgfSxcblxuICBmb2N1c0FkamFjZW50T3B0aW9uOiBmdW5jdGlvbihkaXIpIHtcbiAgICB0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsID0gdHJ1ZTtcbiAgICB2YXIgb3BzID0gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMuZmlsdGVyKGZ1bmN0aW9uKG9wKSB7XG4gICAgICByZXR1cm4gIWdldFZhbHVlUHJvcChvcCwgJ2Rpc2FibGVkJyk7XG4gICAgfSk7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzT3Blbikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzT3BlbjogdHJ1ZSxcbiAgICAgICAgaW5wdXRWYWx1ZTogJycsXG4gICAgICAgIGZvY3VzZWRPcHRpb246IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiB8fCBnZXRBdChvcHMsIGRpciA9PT0gJ25leHQnID8gMCA6IGdldExlbmd0aChvcHMpIC0gMSlcbiAgICAgIH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFnZXRMZW5ndGgob3BzKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZm9jdXNlZEluZGV4ID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnZXRMZW5ndGgob3BzKTsgaSsrKSB7XG4gICAgICBpZiAoaXNFcXVhbFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiwgZ2V0QXQob3BzLGkpKSkge1xuICAgICAgICBmb2N1c2VkSW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIDApO1xuICAgIGlmIChkaXIgPT09ICduZXh0JyAmJiBmb2N1c2VkSW5kZXggPiAtMSAmJiBmb2N1c2VkSW5kZXggPCBnZXRMZW5ndGgob3BzKSAtIDEpIHtcbiAgICAgIGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIGZvY3VzZWRJbmRleCArIDEpO1xuICAgIH0gZWxzZSBpZiAoZGlyID09PSAncHJldmlvdXMnKSB7XG4gICAgICBpZiAoZm9jdXNlZEluZGV4ID4gMCkge1xuICAgICAgICBmb2N1c2VkT3B0aW9uID0gZ2V0QXQob3BzLCBmb2N1c2VkSW5kZXggLSAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvY3VzZWRPcHRpb24gPSBnZXRBdChvcHMsIGdldExlbmd0aChvcHMpIC0gMSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZm9jdXNlZE9wdGlvbjogZm9jdXNlZE9wdGlvblxuICAgIH0pO1xuICB9LFxuXG4gIHVuZm9jdXNPcHRpb246IGZ1bmN0aW9uKG9wKSB7XG4gICAgaWYgKGlzRXF1YWxWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24sIG9wKSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGZvY3VzZWRPcHRpb246IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBidWlsZE1lbnU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmb2N1c2VkVmFsdWUgPSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPyBnZXRWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIDogbnVsbDtcbiAgICB2YXIgcmVuZGVyTGFiZWwgPSB0aGlzLnByb3BzLm9wdGlvblJlbmRlcmVyIHx8IGZ1bmN0aW9uKG9wKSB7XG4gICAgICByZXR1cm4gZ2V0TGFiZWwob3ApO1xuICAgIH07XG4gICAgaWYgKGdldExlbmd0aCh0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucykgPiAwKSB7XG4gICAgICBmb2N1c2VkVmFsdWUgPSBmb2N1c2VkVmFsdWUgPT0gbnVsbCA/IGdldEF0KHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLCAwKSA6IGZvY3VzZWRWYWx1ZTtcbiAgICB9XG5cbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zO1xuXG4gICAgLy9UT0RPOiBzdXBwb3J0IGFsbG93Q3JlYXRlIChpdCBtdXRhdGVzIGBvcHRpb25zYCwgd2hpY2ggaXMgc3VwcG9zZWQgdG8gYmUgaW1tdXRhYmxlLCBjYWxsaW5nIGB1bnNoaWZ0YCBiZWxvdylcbiAgICAvLyBBZGQgdGhlIGN1cnJlbnQgdmFsdWUgdG8gdGhlIGZpbHRlcmVkIG9wdGlvbnMgaW4gbGFzdCByZXNvcnRcbiAgICAvLyBpZiAodGhpcy5wcm9wcy5hbGxvd0NyZWF0ZSAmJiB0aGlzLnN0YXRlLmlucHV0VmFsdWUudHJpbSgpKSB7XG4gICAgLy8gIHZhciBpbnB1dFZhbHVlID0gdGhpcy5zdGF0ZS5pbnB1dFZhbHVlO1xuICAgIC8vICBvcHRpb25zID0gb3B0aW9ucy5zbGljZSgpO1xuICAgIC8vICB2YXIgbmV3T3B0aW9uID0gdGhpcy5wcm9wcy5uZXdPcHRpb25DcmVhdG9yID8gdGhpcy5wcm9wcy5uZXdPcHRpb25DcmVhdG9yKGlucHV0VmFsdWUpIDoge1xuICAgIC8vICAgICAgdmFsdWU6IGlucHV0VmFsdWUsXG4gICAgLy8gICAgICBsYWJlbDogaW5wdXRWYWx1ZSxcbiAgICAvLyAgICAgIGNyZWF0ZTogdHJ1ZVxuICAgIC8vICB9O1xuICAgIC8vICBvcHRpb25zLnVuc2hpZnQobmV3T3B0aW9uKTtcbiAgICAvLyB9XG4gICAgdmFyIG9wcyA9IG9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wLCBrZXkpIHtcbiAgICAgIHZhciBpc1NlbGVjdGVkID0gaXNFcXVhbFZhbHVlKHRoaXMuc3RhdGUudmFsdWUsIGdldFZhbHVlKG9wKSk7XG4gICAgICB2YXIgaXNGb2N1c2VkID0gaXNFcXVhbFZhbHVlKGZvY3VzZWRWYWx1ZSwgZ2V0VmFsdWUob3ApKTtcbiAgICAgIHZhciBvcHRpb25DbGFzcyA9IGNsYXNzZXMoe1xuICAgICAgICAnU2VsZWN0LW9wdGlvbic6IHRydWUsXG4gICAgICAgICdpcy1zZWxlY3RlZCc6IGlzU2VsZWN0ZWQsXG4gICAgICAgICdpcy1mb2N1c2VkJzogaXNGb2N1c2VkLFxuICAgICAgICAnaXMtZGlzYWJsZWQnOiBnZXRWYWx1ZVByb3Aob3AsICdkaXNhYmxlZCcpXG4gICAgICB9KTtcbiAgICAgIHZhciByZWYgPSBpc0ZvY3VzZWQgPyAnZm9jdXNlZCcgOiBudWxsO1xuICAgICAgdmFyIG1vdXNlRW50ZXIgPSB0aGlzLmZvY3VzT3B0aW9uLmJpbmQodGhpcywgb3ApO1xuICAgICAgdmFyIG1vdXNlTGVhdmUgPSB0aGlzLnVuZm9jdXNPcHRpb24uYmluZCh0aGlzLCBvcCk7XG4gICAgICB2YXIgbW91c2VEb3duID0gdGhpcy5zZWxlY3RWYWx1ZS5iaW5kKHRoaXMsIG9wKTtcbiAgICAgIHZhciBvcHRpb25SZXN1bHQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMub3B0aW9uQ29tcG9uZW50LCB7XG4gICAgICAgIGtleTogJ29wdGlvbi0nICsgZ2V0VmFsdWUob3ApLFxuICAgICAgICBjbGFzc05hbWU6IG9wdGlvbkNsYXNzLFxuICAgICAgICByZW5kZXJGdW5jOiByZW5kZXJMYWJlbCxcbiAgICAgICAgbW91c2VFbnRlcjogbW91c2VFbnRlcixcbiAgICAgICAgbW91c2VMZWF2ZTogbW91c2VMZWF2ZSxcbiAgICAgICAgbW91c2VEb3duOiBtb3VzZURvd24sXG4gICAgICAgIGNsaWNrOiBtb3VzZURvd24sXG4gICAgICAgIGFkZExhYmVsVGV4dDogdGhpcy5wcm9wcy5hZGRMYWJlbFRleHQsXG4gICAgICAgIG9wdGlvbjogb3AsXG4gICAgICAgIHJlZjogcmVmXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBvcHRpb25SZXN1bHQ7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIGdldExlbmd0aChvcHMpID8gb3BzIDogKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1ub3Jlc3VsdHNcIj5cbiAgICAgICAge3RoaXMucHJvcHMuYXN5bmNPcHRpb25zICYmICF0aGlzLnN0YXRlLmlucHV0VmFsdWUgPyB0aGlzLnByb3BzLnNlYXJjaFByb21wdFRleHQgOiB0aGlzLnByb3BzLm5vUmVzdWx0c1RleHR9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG4gIGhhbmRsZU9wdGlvbkxhYmVsQ2xpY2s6IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2spIHtcbiAgICAgIHRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrKHZhbHVlLCBldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGVjdENsYXNzID0gY2xhc3NlcygnU2VsZWN0JywgdGhpcy5wcm9wcy5jbGFzc05hbWUsIHtcbiAgICAgICdpcy1tdWx0aSc6IHRoaXMucHJvcHMubXVsdGksXG4gICAgICAnaXMtc2VhcmNoYWJsZSc6IHRoaXMucHJvcHMuc2VhcmNoYWJsZSxcbiAgICAgICdpcy1vcGVuJzogdGhpcy5zdGF0ZS5pc09wZW4sXG4gICAgICAnaXMtZm9jdXNlZCc6IHRoaXMuc3RhdGUuaXNGb2N1c2VkLFxuICAgICAgJ2lzLWxvYWRpbmcnOiB0aGlzLnN0YXRlLmlzTG9hZGluZyxcbiAgICAgICdpcy1kaXNhYmxlZCc6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAnaGFzLXZhbHVlJzogISh0aGlzLnN0YXRlLnZhbHVlID09IG51bGwgfHwgdGhpcy5zdGF0ZS52YWx1ZSA9PT0gXCJcIilcbiAgICB9KTtcbiAgICB2YXIgdmFsdWUgPSBbXTtcbiAgICBpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuICAgICAgdGhpcy5zdGF0ZS52YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgdmFyIG9uT3B0aW9uTGFiZWxDbGljayA9IHRoaXMuaGFuZGxlT3B0aW9uTGFiZWxDbGljay5iaW5kKHRoaXMsIHZhbCk7XG4gICAgICAgIHZhciBvblJlbW92ZSA9IHRoaXMucmVtb3ZlVmFsdWUuYmluZCh0aGlzLCB2YWwpO1xuICAgICAgICB2YXIgdmFsdWVDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMudmFsdWVDb21wb25lbnQsIHtcbiAgICAgICAgICBrZXk6IGdldFZhbHVlKHZhbCksXG4gICAgICAgICAgb3B0aW9uOiB2YWwsXG4gICAgICAgICAgcmVuZGVyZXI6IHRoaXMucHJvcHMudmFsdWVSZW5kZXJlcixcbiAgICAgICAgICBvcHRpb25MYWJlbENsaWNrOiAhIXRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrLFxuICAgICAgICAgIG9uT3B0aW9uTGFiZWxDbGljazogb25PcHRpb25MYWJlbENsaWNrLFxuICAgICAgICAgIG9uUmVtb3ZlOiBvblJlbW92ZSxcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZFxuICAgICAgICB9KTtcbiAgICAgICAgdmFsdWUucHVzaCh2YWx1ZUNvbXBvbmVudCk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSAmJiAoIXRoaXMucHJvcHMubXVsdGkgfHwgIXZhbHVlLmxlbmd0aCkpIHtcbiAgICAgIHZhciB2YWwgPSBnZXRBdCh0aGlzLnN0YXRlLnZhbHVlcywgMCkgfHwgbnVsbDtcbiAgICAgIGlmICh0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXIgJiYgISFnZXRMZW5ndGgodGhpcy5zdGF0ZS52YWx1ZXMpKSB7XG4gICAgICAgIHZhbHVlLnB1c2goPFZhbHVlXG4gICAgICAgICAgICAgICAgICAga2V5PXswfVxuICAgICAgICAgICAgICAgICAgIG9wdGlvbj17dmFsfVxuICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyPXt0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXJ9XG4gICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzaW5nbGVWYWx1ZUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5zaW5nbGVWYWx1ZUNvbXBvbmVudCwge1xuICAgICAgICAgIGtleTogJ3BsYWNlaG9sZGVyJyxcbiAgICAgICAgICB2YWx1ZTogdmFsLFxuICAgICAgICAgIHBsYWNlaG9sZGVyOiB0aGlzLnN0YXRlLnBsYWNlaG9sZGVyXG4gICAgICAgIH0pO1xuICAgICAgICB2YWx1ZS5wdXNoKHNpbmdsZVZhbHVlQ29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbG9hZGluZyA9IHRoaXMuc3RhdGUuaXNMb2FkaW5nID8gPHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWxvYWRpbmdcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGw7XG4gICAgdmFyIGNsZWFyID0gdGhpcy5wcm9wcy5jbGVhcmFibGUgJiYgdGhpcy5zdGF0ZS52YWx1ZSAmJiAhdGhpcy5wcm9wcy5kaXNhYmxlZCA/IDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1jbGVhclwiIHRpdGxlPXt0aGlzLnByb3BzLm11bHRpID8gdGhpcy5wcm9wcy5jbGVhckFsbFRleHQgOiB0aGlzLnByb3BzLmNsZWFyVmFsdWVUZXh0fSBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLm11bHRpID8gdGhpcy5wcm9wcy5jbGVhckFsbFRleHQgOiB0aGlzLnByb3BzLmNsZWFyVmFsdWVUZXh0fSBvbk1vdXNlRG93bj17dGhpcy5jbGVhclZhbHVlfSBvbkNsaWNrPXt0aGlzLmNsZWFyVmFsdWV9IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogJyZ0aW1lczsnIH19IC8+IDogbnVsbDtcblxuICAgIHZhciBtZW51O1xuICAgIHZhciBtZW51UHJvcHM7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG4gICAgICBtZW51UHJvcHMgPSB7XG4gICAgICAgIHJlZjogJ21lbnUnLFxuICAgICAgICBjbGFzc05hbWU6ICdTZWxlY3QtbWVudSdcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuICAgICAgICBtZW51UHJvcHMub25Nb3VzZURvd24gPSB0aGlzLmhhbmRsZU1vdXNlRG93bjtcbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5wcm9wcy5sYXp5KXtcbiAgICAgICAgbWVudSA9IChcbiAgICAgICAgICAgIDxkaXYgcmVmPVwic2VsZWN0TWVudUNvbnRhaW5lclwiIGNsYXNzTmFtZT1cIlNlbGVjdC1tZW51LW91dGVyXCIgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGVNZW51T3V0ZXJ9PlxuICAgICAgICAgICAgPExhenlSZW5kZXIgbWF4SGVpZ2h0PXt0aGlzLnByb3BzLnN0eWxlTWVudU91dGVyLm1heEhlaWdodCB8fCAyMDB9XG4gICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgICByZWY9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgIHt0aGlzLmJ1aWxkTWVudSgpfVxuICAgICAgICAgIDwvTGF6eVJlbmRlcj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgbWVudSA9IChcbiAgICAgICAgICAgIDxkaXYgcmVmPVwic2VsZWN0TWVudUNvbnRhaW5lclwiIGNsYXNzTmFtZT1cIlNlbGVjdC1tZW51LW91dGVyXCIgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGVNZW51T3V0ZXJ9PlxuICAgICAgICAgICAgPGRpdiB7Li4ubWVudVByb3BzfT57dGhpcy5idWlsZE1lbnUoKX08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpbnB1dDtcbiAgICB2YXIgaW5wdXRQcm9wcyA9IHtcbiAgICAgIHJlZjogJ2lucHV0JyxcbiAgICAgIGNsYXNzTmFtZTogJ1NlbGVjdC1pbnB1dCAnICsgKHRoaXMucHJvcHMuaW5wdXRQcm9wcy5jbGFzc05hbWUgfHwgJycpLFxuICAgICAgdGFiSW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXggfHwgMCxcbiAgICAgIG9uRm9jdXM6IHRoaXMuaGFuZGxlSW5wdXRGb2N1cyxcbiAgICAgIG9uQmx1cjogdGhpcy5oYW5kbGVJbnB1dEJsdXJcbiAgICB9O1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLnByb3BzLmlucHV0UHJvcHMpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmlucHV0UHJvcHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09ICdjbGFzc05hbWUnKSB7XG4gICAgICAgIGlucHV0UHJvcHNba2V5XSA9IHRoaXMucHJvcHMuaW5wdXRQcm9wc1trZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuc2VhcmNoYWJsZSkge1xuICAgICAgICBpbnB1dCA9IDxJbnB1dCB2YWx1ZT17dGhpcy5zdGF0ZS5pbnB1dFZhbHVlfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVJbnB1dENoYW5nZX0gbWluV2lkdGg9XCI1XCIgey4uLmlucHV0UHJvcHN9IC8+O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5wdXQgPSA8ZGl2IHsuLi5pbnB1dFByb3BzfT4mbmJzcDs8L2Rpdj47XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy5tdWx0aSB8fCAhZ2V0TGVuZ3RoKHRoaXMuc3RhdGUudmFsdWVzKSkge1xuICAgICAgaW5wdXQgPSA8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1pbnB1dFwiPiZuYnNwOzwvZGl2PjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IHJlZj1cIndyYXBwZXJcIiBjbGFzc05hbWU9e3NlbGVjdENsYXNzfT5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiByZWY9XCJ2YWx1ZVwiIG5hbWU9e3RoaXMucHJvcHMubmFtZX0gdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9IGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfSAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1jb250cm9sXCIgcmVmPVwiY29udHJvbFwiIG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlEb3dufSBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlTW91c2VEb3dufT5cbiAgICAgICAge3ZhbHVlfVxuICAgICAge2lucHV0fVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtYXJyb3ctem9uZVwiIG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bk9uQXJyb3d9IC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvd1wiIG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bk9uQXJyb3d9IC8+XG4gICAgICAgIHtsb2FkaW5nfVxuICAgICAge2NsZWFyfVxuICAgICAgPC9kaXY+XG4gICAgICAgIHttZW51fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Q7XG4iXX0=
