/* disable some rules until we refactor more completely; fixing them now would
   cause conflicts with some open PRs unnecessarily. */
/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */

var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');
var Input = require('react-input-autosize');
var ReactDOM = require('react-dom');
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


function hasValue(value) {
  return value != null && value !== '';
}

var requestId = 0;

// test by value, por eid if available
var isEqualValue = function(v1, v2) {
  return Immutable.is(v1, v2) || (
    v1 && v2 && v1.has && v1.has('eid') && v2.get &&
      Immutable.is(v1.get('eid'), v2.get('eid'))
  );
};

var compareOptions = function(ops1, ops2){
  return isImmutable(ops1, ops2) ?
    Immutable.is(ops1, ops2) :
    JSON.stringify(ops1) === JSON.stringify(ops2);
};

var Select = createClass({

  displayName: 'Select',

  propTypes: {
    addLabelText: PropTypes.string,      // placeholder displayed when you want to add a label on a multi-value input
    allowCreate: PropTypes.bool,         // whether to allow creation of new entries
    asyncOptions: PropTypes.func,        // function to call to get options
    autoload: PropTypes.bool,            // whether to auto-load the default async options set
    backspaceRemoves: PropTypes.bool,    // whether backspace removes an item if there is no text input
    cacheAsyncResults: PropTypes.bool,   // whether to allow cache
    className: PropTypes.string,         // className for the outer element
    clearAllText: PropTypes.string,      // title for the "clear" control when multi: true
    clearValueText: PropTypes.string,    // title for the "clear" control
    clearable: PropTypes.bool,           // should it be possible to reset value
    delimiter: PropTypes.string,         // delimiter to use to join multiple values
    disabled: PropTypes.bool,            // whether the Select is disabled or not
    filterOption: PropTypes.func,        // method to filter a single option: function(option, filterString)
    filterOptions: PropTypes.func,       // method to filter the options array: function([options], filterString, [values])
    ignoreCase: PropTypes.bool,          // whether to perform case-insensitive filtering
    inputProps: PropTypes.object,        // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
    matchPos: PropTypes.string,          // (any|start) match the start or entire string when filtering
    matchProp: PropTypes.string,         // (any|label|value) which option property to filter on
    multi: PropTypes.bool,               // multi-value input
    name: PropTypes.string,              // field name, for hidden <input /> tag
    newOptionCreator: PropTypes.func,    // factory to create new options when allowCreate set
    noResultsText: PropTypes.string,     // placeholder displayed when there are no matching search results
    onBlur: PropTypes.func,              // onBlur handler: function(event) {}
    onChange: PropTypes.func,            // onChange handler: function(newValue) {}
    onFocus: PropTypes.func,             // onFocus handler: function(event) {}
    onItemMouseEnter: PropTypes.func,    // triggered on option focus
    onDropDownClose: PropTypes.func,     // trigerred both when select option and when menu close
    onOptionLabelClick: PropTypes.func,  // onCLick handler for value labels: function (value, event) {}
    optionComponent: PropTypes.func,     // option component to render in dropdown
    optionRenderer: PropTypes.func,      // optionRenderer: function(option) {}
    options: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.instanceOf(Immutable.List)
    ]),                                                                  // array of options
    placeholder: PropTypes.string,       // field placeholder, displayed when there's no value
    searchable: PropTypes.bool,          // whether to enable searching feature or not
    searchPromptText: PropTypes.string,  // label to prompt for search input
    singleValueComponent: PropTypes.func,// single value component when multiple is set to false
    value: PropTypes.any,                // initial field value
    valueComponent: PropTypes.func,      // value component to render in multiple mode
    valueRenderer: PropTypes.func,       // valueRenderer: function(option) {}
    styleMenuOuter: PropTypes.object,      // styleMenuOuter: style object used by menu dropdown
    lazy: PropTypes.bool                               // lazy: use LazyRender for dropdown items
  },

  getDefaultProps: function() {
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

  getInitialState: function() {
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

  componentWillMount: function() {
    this._optionsCache = {};
    this._optionsFilterString = '';
    this._closeMenuIfClickedOutside = (event) => {
      if (_this.props.onDropDownClose) {
        _this.props.onDropDownClose();
      }
      if (!this.state.isOpen) {
        return;
      }
      var menuElem = ReactDOM.findDOMNode(this.refs.selectMenuContainer);
      var controlElem = ReactDOM.findDOMNode(this.refs.control);

      var eventOccuredOutsideMenu = this.clickedOutsideElement(menuElem, event);
      var eventOccuredOutsideControl = this.clickedOutsideElement(controlElem, event);

      // Hide dropdown menu if click occurred outside of menu
      if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
        this.setState({
          isOpen: false
        }, this._unbindCloseMenuIfClickedOutside);
      }
    };
    this._bindCloseMenuIfClickedOutside = function() {
      if (!document.addEventListener && document.attachEvent) {
        document.attachEvent('onclick', this._closeMenuIfClickedOutside);
      } else {
        document.addEventListener('click', this._closeMenuIfClickedOutside);
      }
    };
    this._unbindCloseMenuIfClickedOutside = function() {
      if (!document.removeEventListener && document.detachEvent) {
        document.detachEvent('onclick', this._closeMenuIfClickedOutside);
      } else {
        document.removeEventListener('click', this._closeMenuIfClickedOutside);
      }
    };
    this.setState(this.getStateFromValue(this.props.value));
  },

  componentDidMount: function() {
    if (this.props.asyncOptions && this.props.autoload) {
      this.autoloadAsyncOptions();
    }
  },

  componentWillUnmount: function() {
    clearTimeout(this._blurTimeout);
    clearTimeout(this._focusTimeout);
    if (this.state.isOpen) {
      this._unbindCloseMenuIfClickedOutside();
    }
  },

  componentWillReceiveProps: function(newProps) {
    var optionsChanged = false;
    if (!compareOptions(newProps.options, this.props.options)) {
      optionsChanged = true;
      this.setState({
        options: newProps.options,
        filteredOptions: this.filterOptions(newProps.options)
      });
    }
    if (!isEqualValue(newProps.value, this.state.value) || newProps.placeholder !== this.props.placeholder || optionsChanged) {
      var setState = (newState) => {
        this.setState(this.getStateFromValue(newProps.value,
                                             (newState && newState.options) || newProps.options,
                                             newProps.placeholder)
                     );
      };
      if (this.props.asyncOptions) {
        this.loadAsyncOptions(newProps.value, {}, setState);
      } else {
        setState();
      }
    }
  },

  componentDidUpdate: function() {
    if (!this.props.disabled && this._focusAfterUpdate) {
      clearTimeout(this._blurTimeout);
      this._focusTimeout = setTimeout(() => {
        this.getInputNode().focus();
        this._focusAfterUpdate = false;
      }, 50);
    }
    if (this._focusedOptionReveal) {
      if (this.refs.focused && this.refs.menu) {
        var focusedDOM = ReactDOM.findDOMNode(this.refs.focused);
        var menuDOM = ReactDOM.findDOMNode(this.refs.menu);
        var focusedRect = focusedDOM.getBoundingClientRect();
        var menuRect = menuDOM.getBoundingClientRect();

        if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
          menuDOM.scrollTop = (focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight);
        }
      }
      this._focusedOptionReveal = false;
    }
  },

  focus: function() {
    this.getInputNode().focus();
  },

  clickedOutsideElement: function(element, event) {
    var eventTarget = (event.target) ? event.target : event.srcElement;
    while (eventTarget != null) {
      if (eventTarget === element) return false;
      eventTarget = eventTarget.offsetParent;
    }
    return true;
  },

  getStateFromValue: function(value, options, placeholder) {
    if (!options) {
      options = this.state.options;
    }
    if (!placeholder) {
      placeholder = this.props.placeholder;
    }

    // Normaliza implementação passando às vezes value, às vezes option aqui:
    if(((value != null) && typeof value == 'object' && (value.value != null) && (value.label != null)) ||
       (value instanceof Immutable.Map && value.has('value') && value.has('label'))) {
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
    }
    else if(this.props.multi) {
      for (var optionIndex = 0; optionIndex < getLength(filteredOptions); ++optionIndex) {
        var option = getAt(filteredOptions, optionIndex);
        if (!getValueProp(option, 'disabled')) {
          focusedOption = option;
          break;
        }
      }
      valueForState = values.map(function(v) { return getValue(v); }).join(this.props.delimiter);
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

  initValuesArray: function(values, options) {
    if (!Array.isArray(values) && !Immutable.Iterable.isIndexed(values)) {
      if (typeof values === 'string') {
        values = values === '' ? Immutable.List() : Immutable.List(values.split(this.props.delimiter));
      } else {
        values = values !== undefined && values !== null ? Immutable.List([values]) : Immutable.List();
      }
    }
    return values.map(function(val) {

      return options.find(op => {
        var opValue = getValue(op);
        return isEqualValue(opValue, val) || (typeof opValue === 'number' && opValue.toString() === val);

        // auto create option
      }) || Immutable.Map({ value: val, label: val });

    });
  },

  setValue: function(value, focusAfterUpdate) {
    if (focusAfterUpdate || focusAfterUpdate === undefined) {
      this._focusAfterUpdate = true;
    }
    var newState = this.getStateFromValue(value);
    newState.isOpen = false;
    this.fireChangeEvent(newState);
    this.setState(newState);
  },

  selectValue: function(value) {
    if (this.props.onDropDownClose) {
      this.props.onDropDownClose();
    }
    if (!this.props.multi) {
      this.setValue(value);
    } else if (value != null) {
      this.addValue(value);
    }
    this._unbindCloseMenuIfClickedOutside();
  },

  addValue: function(value) {
    if(isImmutable(value) && isImmutable(this.state.values)){
      this.setValue(this.state.values.push(value));
    }
    else{
      this.setValue(this.state.values.concat(value));
    }
  },

  popValue: function() {
    this.setValue(this.state.values.slice(0, getLength(this.state.values) - 1));
  },

  removeValue: function(valueToRemove) {
    this.setValue(this.state.values.filter(function(value) {
      return value !== valueToRemove;
    }));
  },

  clearValue: function(event) {
    // if the event was triggered by a mousedown and not the primary
    // button, ignore it.
    if (event && event.type === 'mousedown' && event.button !== 0) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    this.setValue(null);
  },

  resetValue: function() {
    this.setValue(!hasValue(this.state.value) ? null : this.state.value);
  },

  getInputNode: function () {
    var input = this.refs.input;
    return this.props.searchable ? input : ReactDOM.findDOMNode(input);
  },

  fireChangeEvent: function(newState) {
    if (newState.value !== this.state.value && this.props.onChange) {
      this.props.onChange(newState.value, newState.values);
    }
  },

  handleMouseDown: function(event) {
    // if the event was triggered by a mousedown and not the primary
    // button, or if the component is disabled, ignore it.
    if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
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

  handleMouseDownOnArrow: function(event) {
    // if the event was triggered by a mousedown and not the primary
    // button, or if the component is disabled, ignore it.
    if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
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

  handleInputFocus: function(event) {
    var newIsOpen = this.state.isOpen || this._openAfterFocus;
    this.setState({
      isFocused: true,
      isOpen: newIsOpen
    }, function() {
      if(newIsOpen) {
        this._bindCloseMenuIfClickedOutside();
      }
      else {
        this._unbindCloseMenuIfClickedOutside();
      }
    });
    this._openAfterFocus = false;
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  },

  handleInputBlur: function(event) {
    this._blurTimeout = setTimeout(() => {
      if (this._focusAfterUpdate) return;
      this.setState({
        isFocused: false,
        isOpen: false
      });
    }, 50);
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  },

  handleKeyDown: function(event) {
    if (this.props.disabled) return;
    switch (event.keyCode) {
    case 8: // backspace
    case 48: // delete
      if (!hasValue(this.state.inputValue) && this.props.backspaceRemoves) {
        this.popValue();
      }
      return;
    case 9: // tab
      if (event.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
        return;
      }
      this.selectFocusedOption();
      break;
    case 13: // enter
      if (!this.state.isOpen) return;

      this.selectFocusedOption();
      break;
    case 27: // escape
      if (this.state.isOpen) {
        this.resetValue();
      } else if (this.props.clearable) {
        this.clearValue(event);
      }
      break;
    case 38: // up
      this.focusPreviousOption();
      break;
    case 40: // down
      this.focusNextOption();
      break;
    case 188: // ,
      if (this.props.allowCreate && this.props.multi) {
        event.preventDefault();
        event.stopPropagation();
        this.selectFocusedOption();
      } else {
        return;
      }
      break;
    default: return;
    }
    event.preventDefault();
  },

  // Ensures that the currently focused option is available in filteredOptions.
  // If not, returns the first available option.
  _getNewFocusedOption: function(filteredOptions) {
    var focusedOption = this.state.focusedOption
    return filteredOptions.find(op => op === focusedOption) || getAt(filteredOptions, 0);
  },

  handleInputChange: function(event) {
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

  autoloadAsyncOptions: function() {
    this.loadAsyncOptions((this.props.value || ''), {}, () => {
      // update with fetched but don't focus
      this.setValue(this.props.value, false);
    });
  },

  loadAsyncOptions: function(input, state, callback) {
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

    this.props.asyncOptions(input, (err, data) => {
      if (err) throw err;
      if (this.props.cacheAsyncResults) {
        this._optionsCache[input] = data;
      }
      if (thisRequestId !== this._currentRequestId) {
        return;
      }
      var filteredOptions = this.filterOptions(data.options);
      var newState = {
        options: data.options,
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
    });
  },

  filterOptions: function(options, values) {
    var filterValue = this._optionsFilterString;
    var exclude = (values || this.state.values).map(function(v) {
      return getValue(v);
    });
    if (this.props.filterOptions) {
      return this.props.filterOptions.call(this, options, filterValue, exclude);
    } else {
      var filterOption = function(op) {
        if (this.props.multi && exclude.indexOf(getValue(op)) > -1) return false;
        if (this.props.filterOption) return this.props.filterOption.call(this, op, filterValue);
        var valueTest = String(getValue(op)), labelTest = String(getLabel(op));
        if (this.props.ignoreCase) {
          valueTest = valueTest.toLowerCase();
          labelTest = labelTest.toLowerCase();
          filterValue = filterValue.toLowerCase();
        }
        return !filterValue || (this.props.matchPos === 'start') ? (
          (this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue) ||
            (this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue)
        ) : (
          (this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0) ||
            (this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0)
        );
      };
      return (options || []).filter(filterOption, this);
    }
  },

  selectFocusedOption: function() {
    if (this.props.allowCreate && !this.state.focusedOption) {
      return this.selectValue(this.state.inputValue);
    }
    return this.selectValue(this.state.focusedOption);
  },

  focusOption: function(op) {
    if (this.props.onItemMouseEnter) {
      this.props.onItemMouseEnter(op);
    }
    this.setState({
      focusedOption: op
    });
  },

  focusNextOption: function() {
    this.focusAdjacentOption('next');
  },

  focusPreviousOption: function() {
    this.focusAdjacentOption('previous');
  },

  focusAdjacentOption: function(dir) {
    this._focusedOptionReveal = true;
    var ops = this.state.filteredOptions.filter(function(op) {
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
      if (isEqualValue(this.state.focusedOption, getAt(ops,i))) {
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

  unfocusOption: function(op) {
    if (isEqualValue(this.state.focusedOption, op)) {
      this.setState({
        focusedOption: null
      });
    }
  },

  buildMenu: function() {
    var focusedValue = this.state.focusedOption ? getValue(this.state.focusedOption) : null;
    var renderLabel = this.props.optionRenderer || function(op) {
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
    var ops = options.map(function(op, key) {
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
        key: 'option-' + key,
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
    return getLength(ops) ? ops : (
        <div className="Select-noresults">
        {this.props.asyncOptions && !this.state.inputValue ? this.props.searchPromptText : this.props.noResultsText}
      </div>
    );
  },

  handleOptionLabelClick: function (value, event) {
    if (this.props.onOptionLabelClick) {
      this.props.onOptionLabelClick(value, event);
    }
  },

  render: function() {
    var selectClass = classes('Select', this.props.className, {
      'is-multi': this.props.multi,
      'is-searchable': this.props.searchable,
      'is-open': this.state.isOpen,
      'is-focused': this.state.isFocused,
      'is-loading': this.state.isLoading,
      'is-disabled': this.props.disabled,
      'has-value': hasValue(this.state.value)
    });
    var value = [];
    if (this.props.multi) {
      this.state.values.forEach(function(val) {
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

    if (!hasValue(this.state.inputValue) && (!this.props.multi || !value.length)) {
      var val = getAt(this.state.values, 0) || null;
      if (this.props.valueRenderer && !!getLength(this.state.values)) {
        value.push(<Value
                   key={0}
                   option={val}
                   renderer={this.props.valueRenderer}
                   disabled={this.props.disabled} />);
      } else {
        var singleValueComponent = React.createElement(this.props.singleValueComponent, {
          key: 'placeholder',
          value: val,
          placeholder: this.state.placeholder
        });
        value.push(singleValueComponent);
      }
    }

    var loading = this.state.isLoading ? <span className="Select-loading" aria-hidden="true" /> : null;
    var clear = this.props.clearable && hasValue(this.state.value) && !this.props.disabled ? <span className="Select-clear" title={this.props.multi ? this.props.clearAllText : this.props.clearValueText} aria-label={this.props.multi ? this.props.clearAllText : this.props.clearValueText} onMouseDown={this.clearValue} onClick={this.clearValue} dangerouslySetInnerHTML={{ __html: '&times;' }} /> : null;

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

      if(this.props.lazy){
        menu = (
            <div ref="selectMenuContainer" className="Select-menu-outer" style={this.props.styleMenuOuter}>
            <LazyRender maxHeight={this.props.styleMenuOuter.maxHeight || 200}
          className={this.props.className}
          ref="container">
            {this.buildMenu()}
          </LazyRender>
            </div>
        );
      }
      else{
        menu = (
            <div ref="selectMenuContainer" className="Select-menu-outer" style={this.props.styleMenuOuter}>
            <div {...menuProps}>{this.buildMenu()}</div>
            </div>
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
        input = <Input value={this.state.inputValue} onChange={this.handleInputChange} minWidth="5" {...inputProps} />;
      } else {
        input = <div {...inputProps}>&nbsp;</div>;
      }
    } else if (!this.props.multi || !getLength(this.state.values)) {
      input = <div className="Select-input">&nbsp;</div>;
    }

    return (
        <div ref="wrapper" className={selectClass}>
        <input type="hidden" ref="value" name={this.props.name} value={this.state.value} disabled={this.props.disabled} />
        <div className="Select-control" ref="control" onKeyDown={this.handleKeyDown} onMouseDown={this.handleMouseDown} onTouchEnd={this.handleMouseDown}>
        {value}
      {input}
        <span className="Select-arrow-zone" onMouseDown={this.handleMouseDownOnArrow} />
        <span className="Select-arrow" onMouseDown={this.handleMouseDownOnArrow} />
        {loading}
      {clear}
      </div>
        {menu}
      </div>
    );
  }

});

module.exports = Select;
