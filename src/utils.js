export function prefix(props = {}, variant) {
  return props.prefixCls + (variant ? '-' + variant : '');
}

export function toArray(value) {
  let ret = value;
  if (value === undefined) {
    ret = [];
  } else if (!Array.isArray(value)) {
    ret = [value];
  }
  return ret;
}