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
  propTypes: {
    children: React.PropTypes.instanceOf(Immutable.Iterable),
    maxHeight: React.PropTypes.number.isRequired,

    className: React.PropTypes.string,
    itemPadding: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      itemPadding: 3
    };
  },

  getInitialState: function() {
    return {
      childrenTop: 0,
      childrenToRender: 10,
      scrollTop: 0,
      height: this.props.maxHeight,
      count: count(this.props.children)
    };
  },

  onScroll: function() {
    var container = this.refs.container;
    var scrollTop = container.scrollTop;

    var childrenTop = Math.floor(scrollTop / this.state.childHeight);
    var childrenBottom = (this.state.count - childrenTop -
                          this.state.childrenToRender);

    if (childrenBottom < 0) {
      childrenBottom = 0;
    }

    this.setState({
      childrenTop: childrenTop,
      childrenBottom: childrenBottom,
      scrollTop: scrollTop
    });
  },

  getHeight: function(numChildren, childHeight, maxHeight) {
    var fullHeight = numChildren * childHeight;
    if (fullHeight < maxHeight) {
      return fullHeight;
    } else {
      return maxHeight;
    }
  },

  getElementHeight: function(element) {
		if(typeof(element.render) === "function"){ element = ReactDOM.findDOMNode(element); }
    var marginTop = parseInt(window.getComputedStyle(element).marginTop);
    return elementSize(element)[1] - marginTop; //remove one margin since the margins are shared by adjacent elements
  },

  componentWillReceiveProps: function(nextProps) {
    var length = count(nextProps.children);
    var childHeight = this.state.childHeight;
    var childrenTop = Math.floor(this.state.scrollTop / childHeight);
    var childrenBottom = (length - childrenTop -
                          this.state.childrenToRender);

    if (childrenBottom < 0) {
      childrenBottom = 0;
    }

    var height = this.getHeight(
      length,
      childHeight,
      nextProps.maxHeight
    );

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

  componentDidMount: function() {
    var childHeight = this.getChildHeight();
    var length = count(this.props.children);

    var height = this.getHeight(
      length,
      childHeight,
      this.props.maxHeight
    );

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

  componentDidUpdate: function() {
    //important to update the child height in the case that the children change(example: ajax call for data)
    if (this.state.childHeight !== this.getChildHeight()) {
      this.setState({childHeight: this.getChildHeight()});
    }
  },

  getChildHeight: function() {
    var firstChild = this.refs['child-0'];
    var el = firstChild;
    return this.getElementHeight(el);
  },

  render: function() {
    if(!this.props.children.slice) {
      return this.props.children;
    }

    var start = this.state.childrenTop;
    var end = this.state.childrenTop + this.state.childrenToRender;

    var childrenToRender = this.props.children.slice(start, end);
    var children = childrenToRender.map(function(child, index) {
      if (index === 0) {
        return React.cloneElement(child, {ref: 'child-' + index, key: index});
      }
      return child;
    });


    children = Immutable.Seq.of(
      <div style={{ height: this.state.childrenTop * this.state.childHeight }}
           key="top" />
    ).concat(children).concat(
      <div style={{ height: this.state.childrenBottom * this.state.childHeight }}
           key="bottom" />
    );

    return (
      <div style={{ height: this.state.height, overflowY: 'auto' }}
        className={this.props.className}
        ref="container"
        onScroll={this.onScroll}>
        {children}
      </div>
    );
  }
});

module.exports = LazyRender;
