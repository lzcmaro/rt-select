export const TREE_ELEMENT = 'Tree'
export const LIST_ELEMENT = 'List'
export const ACTION_SELECT = 'SELECT'
export const ACTION_CHECK = 'CHECK'
export const CHECKBOX_CHECKED = 1
export const CHECKBOX_UNCHECKED = 0
export const CHECKBOX_PARTIAL = 2
export const ROOT_ID = '-1'

export function noop() {}

export function prefix(props = {}, variant) {
  return props.prefixCls + (variant ? '-' + variant : '');
}

export function checkStateToBoolean(state) {
  return state === CHECKBOX_CHECKED ? true : false
}

export function booleanToCheckState(state) {
  return state ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED
}

export function ownerDocument(node) {
  return node && node.ownerDocument || document;
}

export function ownerWindow(node) {
  var doc = ownerDocument(node);
  return doc && doc.defaultView || doc.parentWindow;
}

export const on = (function () {
  if (document.addEventListener) return function (node, eventName, handler, capture) {
    return node.addEventListener(eventName, handler, capture || false);
  };else if (document.attachEvent) return function (node, eventName, handler) {
    return node.attachEvent('on' + eventName, handler);
  };
})()

export const off = (function () {
	if (document.addEventListener) return function (node, eventName, handler, capture) {
	  return node.removeEventListener(eventName, handler, capture || false);
	};else if (document.attachEvent) return function (node, eventName, handler) {
	  return node.detachEvent('on' + eventName, handler);
	};
})()

export function addEventListener(node, event, handler, capture) {
  on(node, event, handler, capture);
  return {
    remove(){
      off(node, event, handler);
    }
  };
}