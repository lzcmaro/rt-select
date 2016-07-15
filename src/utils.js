export function prefix(props = {}, variant) {
  return props.prefixCls + (variant ? '-' + variant : '');
}