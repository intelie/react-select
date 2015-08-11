'use strict';

function isImmutable(obj){
	return typeof obj.toJS != 'undefined'
}

function getValueProp(obj, property){
  if(!obj) {
    return null;
  }
  if(isImmutable(obj)) {
    return obj.get(property);
  }
  return obj[property];
}

function getValue(obj){
  return getValueProp(obj, 'value');
}

function getLabel(obj){
  return getValueProp(obj, 'label');
}

function getLength(obj){
	if(!obj) {
    return 0;
  }
  if(isImmutable(obj)) {
    return obj.size
  }
  return obj.length;
}

function getAt(obj, index) {
	if(!obj){
		return null;
	}
	if(isImmutable(obj)){
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
