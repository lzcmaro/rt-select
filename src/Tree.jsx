import React, { PropTypes } from 'react'
import classnames from 'classnames'

import TreeNode from './TreeNode'

import { prefix } from './utils'

const noop = () => {};
const CHECKBOX_CHECKED = 1
const CHECKBOX_UNCHECKED = 0
const CHECKBOX_PARTIAL = 2

class Tree extends React.Component {
  

  constructor(props) {
    super(props);

    [
      'onExpand',
      'onSelect',
      'onCheck'
    ].forEach((m)=> {
      this[m] = this[m].bind(this);
    });

    this.state = {
      /**
       * 展开、收缩所有节点
       * 该值需要在这里维护，因为通过props传值过来时，可能会和上次的值一样，导致state.expandedMaps不更新
       * 比如，在全部展开节点后，手动点击箭头收缩某节点，这时改变expanedAll，想再次全部展开会发现无效
       * @type {[type]}
       */
      expandAll: props.expandAll,
      /**
       * 用来存储当前树选中的checkbox状态
       * @type {Object} key为node.value，value值，1为选中，2为半选中
       */
      checkedMaps: this.getDefaultCheckedMaps(props),
      selectedMaps: this.getDefaultSelectedMaps(props),
      expandedMaps: this.getDefaultExpandedMaps(props, undefined, true)
    }

    /**
     * 存储当前树所有节点的对象，方便后面通过node.value可以获取
     * @type {Object}
     */
    this.nodeMaps = {}
  }

  componentWillMount() {

  }

  componentDidMount() {
    
  }

  componentDidUpdate() {

  }

  componentWillReceiveProps(nextProps) {
    const { data, checked, selected, expanded } = this.props
    let { checkedMaps, selectedMaps, expandedMaps, expandAll } = this.state

    // 数据改变时，重设nodeMaps，避免存在脏数据
    if (data !== nextProps.data) {
      this.nodeMaps = {}
    }

    if (checked !== nextProps.checked) {
      checkedMaps = this.getDefaultCheckedMaps(nextProps)
    }

    if (selected !== nextProps.selected) {
      selectedMaps = this.getDefaultSelectedMaps(nextProps)
    }

    if (expanded !== nextProps.expanded || expandAll !== nextProps.expandAll) {
      // 在getDefaultExpandedMaps()中，会获取state.expandAll的值来更新expandedMaps
      // 这里先给state赋值，然后再重置expandAll的值，不然再次传递expanedAll过来，可能会无效
      this.state.expandAll = nextProps.expandAll
      expandedMaps = this.getDefaultExpandedMaps(nextProps)
      this.state.expandAll = undefined
    }

    this.setState({checkedMaps, selectedMaps, expandedMaps})
  }

  render() {
    const { data, root, bordered, className, style, width, height, prefixCls, children, ...otherProps } = this.props
    const wrapperPrefixCls = prefix(this.props, 'panel')
    const wrapperStyle = {...(style || {}), width, height}
    const wrapperCls = {
      [wrapperPrefixCls]: true,
      [`${wrapperPrefixCls}-bordered`]: bordered
    }


    // const rootProps = {
    //   value: rootId,
    //   text: '根节点'
    // }
    // let nodes, path

    // if (root === true) {
    //   nodes = (<TreeNode {...rootProps}>{children}</TreeNode>)
    // } else if (root) {
    //   nodes = React.cloneElement(root, null, children)
    // } else {
    //   nodes = children
    //   path = '0'
    // }

    // TODO: 节点不需要每次都用React.cloneElement创建
  	
    return (
    	<div unselectable style={wrapperStyle} className={classnames(className, wrapperCls)}>
    		<ul {...otherProps} className={prefixCls}>       
          {data && data.length > 0 && data.map((item, index) => {
            return this.generateTreeNode(item, index)
          })}
        </ul>
    	</div>      
    );
  }

  getDefaultCheckedMaps(props) {
    const { data, multiple, commbox, checkStrictly, checked, defaultChecked } = props
    const values = checked || defaultChecked || []
    let map = {}

    if (commbox) {
      // 多选情况下，其父、子节点的选中状态不作处理，当它传递的值是“有效的”
      // 这和在外面维护checked这个值是一样的，它通过props传递过来，以更新commbox的选中状态
      multiple ? values.forEach(item => (map[item] = CHECKBOX_CHECKED)) : map[ values[0] ] = CHECKBOX_CHECKED
    }

    return map
  }

  getDefaultSelectedMaps(props) {
    const { multiple, selected, defaultSelected } = props, values = selected || defaultSelected || []
    let map = {}

    // 单选模式下，只选取第一个值
    multiple ? values.forEach(item => (map[item] = CHECKBOX_CHECKED)) : map[ values[0] ] = CHECKBOX_CHECKED

    return map
  }

  getDefaultExpandedMaps(props, data, initial) {
    // 由于该方法在初始化时会被调用，这时的this.state为undefined
    const expandAll = initial ? props.expandAll : this.state.expandAll
    let map = {}

    if (initial && !expandAll) {
      let values = props.expanded || props.defaultExpanded || []
      values.forEach(item => (map[item] = CHECKBOX_CHECKED))
    } else if (expandAll) {
      (data || props.data || []).forEach(item => {
        map[item.value] = CHECKBOX_CHECKED
        const children = item.children
        if (children && children.length > 0) {
          // 递归所有子节点，并合并到map中
          let _map = this.getDefaultExpandedMaps(props, children)
          Object.assign(map, _map)
        }
      })
    }

    return map
  }

  /**
   * 渲染树节点
   * @param  {Object} nodeData  节点数据
   * @param  {Number} index  索引值
   * @param  {Object} parentData 父节点数据
   * @param  {Number} prePath  节点路径，根节点的路径为0，它的子节点为0-0, 0-1, ...
   * @return {TreeNode}      节点对象
   */
  generateTreeNode(nodeData, index, parentData, prePath = 0) {
    if (!nodeData.value || !nodeData.text) {
      throw 'Error. 节点属性 {value} {text} 不能为空。'
    }

    const { expandedMaps, selectedMaps, checkedMaps } = this.state
    const { multiple, commbox } = this.props

    const { value, text, children } = nodeData
    const path = `${prePath}-${index}`
    const selected = selectedMaps[value] || CHECKBOX_UNCHECKED
    const checked = checkedMaps[value] || CHECKBOX_UNCHECKED
    const expanded = expandedMaps[value] || CHECKBOX_UNCHECKED
    const leaf = !children || children.length <= 0
    let childNodes

    let nodeProps = {
      ref: `node-${path}`,
      key: path,
      data: nodeData,
      childData: children,
      parentData,
      value,
      text,
      path,
      selected, 
      checked,
      expanded,
      leaf,
      multiple,
      commbox,
      onExpand: this.onExpand,
      onSelect: this.onSelect,
      onCheck: this.onCheck
    }

    // 生成已展开的子节点
    if (expanded && children && children.length) {
      childNodes = (
          <ul>
            {children.map((item, index) => {
              return this.generateTreeNode(item, index, nodeData, path)
            })}
          </ul>
        )
    }

    // 节点的ref为`node-${path}`的方式，为方便通过ID获取节点对象，这里把node缓存起来
    return this.nodeMaps[value] = (<TreeNode {...nodeProps}>{childNodes}</TreeNode>)
  }

  /**
   * 节点展开、收缩事件，从TreeNode回调过来
   * @param  {Boolean} expanded 标识当前是展开还是收缩动作
   * @param  {TreeNode} node   节点对象        
   */
  onExpand(expanded, node) {
    const { expandedMaps } = this.state
    // 如果外面没有传递expanded值过来，即调用setState()更新UI，否则就让外面维护这个状态
    if (!('expanded' in this.props)) {
      this.setState({
        expandedMaps: {...expandedMaps, [node.props.value]: expanded}
      })
    }
    this.props.onExpand(!!expanded, node)
  }

  onSelect(selected, node) {
    const { selectedMaps } = this.state
    const { multiple, onSelect } = this.props
    const { value, data } = node.props
    
    // 如果外面没有传递selected值过来，即调用setState()更新UI，否则就让外面维护这个状态
    if (!('selected' in this.props)) {
      if (multiple) {
        this.setState({
          selectedMaps: {...selectedMaps, [value]: selected}
        })
      } else {
        this.setState({
          selectedMaps: {[value]: selected}
        })
      }      
    }

    onSelect(!!selected, value, data, node)
    
    this.fireChange({selected, value, data, node, selectedMaps})

  }

  onCheck(checked, node) {
    // console.log('Tree.onCheck', checked, node)
    const { value, data } = node.props
    
    this.toggleCheckState(checked, data)

    // 如果外面没有传递checked值过来，即调用setState()更新UI，否则就让外面维护这个状态
    if (!('checked' in this.props)) {     
      this.setState({
        // 在遍历当前节点的父、子节点，并改变它的check state时，并没有调用setState()更新，这里统一处理
        checkedMaps: this.state.checkedMaps 
      })
    }

    const checkState = checked === CHECKBOX_CHECKED ? true : false

    this.props.onCheck(checkState, value, data, node)
    this.fireChange({selected: checkState, value, data, node, selectedMaps: this.state.checkedMaps})
  }

  fireChange(info) {
    const { multiple, onChange } = this.props
    const { selected, value, data, node, selectedMaps } = info

    if (multiple) {
      let values = [], datas = []

      if (selected) {
        values.push(value), datas.push(data)
      }

      for (let key in selectedMaps) {
        if (key !== value && selectedMaps[key] === CHECKBOX_CHECKED) {
          // 未展开的节点还没有生成，在nodeMaps找不到，需要从props.data中去获取它原来的数据
          let nodeData = this.nodeMaps[key] ? this.nodeMaps[key].props.data : this.findNodeData(key)
          values.push( key )
          datas.push( nodeData )
        }
      }

      onChange(values, datas, node)
    } else {
      // 单项选择，在取消选中时，返回空
      selected ? onChange(value, data, node) : onChange(undefined, undefined, node)
    }
  }

  toggleCheckState(checked, nodeData) {
    const { multiple, checkStrictly } = this.props    

    // 不是多选或开启多选严格模式时，选中哪个节点就仅仅选中哪个节点，不作关联操作
    if (!multiple) { // 单选
      this.state.checkedMaps = {[nodeData.value]: checked}
    } else if(multiple && checkStrictly) { // 多选，且开启了多选的严格模式
      this.state.checkedMaps[nodeData.value] = checked
    } else { // 多选

      if (checked) {
        // 子节点全设为checked
        this.cascade(this.setNodeCheckState, nodeData, CHECKBOX_CHECKED)
        // 父节点全设为partial
        this.bubble(this.setNodeCheckState, nodeData, CHECKBOX_PARTIAL)
      } else {
        // 子节点全设为unchecked
        this.cascade(this.setNodeCheckState, nodeData, CHECKBOX_UNCHECKED)
        // 父节点全设为partial
        this.bubble(this.setNodeCheckState, nodeData, CHECKBOX_PARTIAL)
      }

    }
  }

  /**
   * 根据路径获取节点对象
   * @param  {String} path 节点路径
   * @return {Object}      返回搜索到的节点对象
   */
  findNode(path) {
    return this.refs[`node-${path}`]
  }

  /**
   * 根据value值从props.data中获取节点数据
   * @param  {[type]} value [description]
   * @param  {[type]} datas [description]
   * @return {[type]}       [description]
   */
  findNodeData(value, datas) {
    const nodeDatas = datas || this.props.data
    const dataLength = nodeDatas.length
    let data

    for (var i = 0; i < dataLength; i++) {
      data = nodeDatas[i]
      if (data.value === value) {
        break;
      }

      if (data.children && data.children > 0) {
        data = this.findNodeData(value, data.children)
      }
    }

    return data
  }

  /**
   * 根据当前节点路径，获取它的父节点路径
   * @param  {String} path 节点路径
   * @return {String}      返回搜索到的节点路径，如果当前节点为根节点，返回空字符
   */
  getParentPath(path) {
    return path ? path.substring(0, path.lastIndexOf('-')) : ''
  }

  getParentNode(nodeData) {
    const node = this.nodeMaps[ nodeData.value ] || {props: {}}
    return this.findNode(this.getParentPath( node.props.path ))
  }

  /**
   * 设置节点的checkbox的选中状态
   * @param {TreeNode} node       节点对象
   * @param {Number} checkState   选中状态：0，1，2
   */
  setNodeCheckState(nodeData, checkState) {
    // console.log('Tree.check: ', node.props.value, checkState)
    const nodeValue = nodeData.value
    let checkedMaps = this.state.checkedMaps, __checkState = checkState

    if (checkState === CHECKBOX_PARTIAL) { // 重新计算该节点的checked值

      const children = nodeData.children
      let sumChecked = 0, sumPartial = 0

      children.forEach(child => {
        // 这里需要取到TreeNode节点对象，以便获取它现在的选择状态
        const node = this.nodeMaps[child.value]
        // 节点的checked可能已发生变化，但UI还没更新，这里需要从checkedMaps中获取它最新的checkState
        const childCheckState = checkedMaps[node.props.value] !== undefined ? checkedMaps[node.props.value] : node.props.checked 

        if (childCheckState === CHECKBOX_CHECKED) {
          sumChecked++
        } else if (childCheckState === CHECKBOX_PARTIAL) {
          sumPartial++
        }
      })

      __checkState = (children.length === sumChecked) ? CHECKBOX_CHECKED : (sumChecked > 0 || sumPartial > 0) ? CHECKBOX_PARTIAL : CHECKBOX_UNCHECKED

    }

    // 这里不使用setState()，避免多次更新UI，赋值完成后，将在onCheck()中统一更新
    checkedMaps[nodeValue] = __checkState

  }

  /**
   * 冒泡(遍历所有父节点)
   * @param  {Function} cb   [description]
   * @param  {[type]}   nodeData [description]
   * @param  {[type]}   checkState [description]
   * @return {[type]}        [description]
   */
  bubble(cb, nodeData, checkState) {
    let parentNode = this.getParentNode(nodeData)
    while (parentNode) {
      let parentData = parentNode.props.data
      if (cb.call(this, parentData, checkState) === false) {
        break;
      }
      parentNode = this.getParentNode(parentData)
    }
  }
  /**
   * 瀑布(遍历所有子节点)
   * @param  {Function} cb   [description]
   * @param  {[type]}   nodeData [description]
   * @param  {[type]}   checkState [description]
   * @return {[type]}        [description]
   */
  cascade(cb, nodeData, checkState) {    
    if (cb.call(this, nodeData, checkState) !== false) {
      nodeData.children && nodeData.children.length && nodeData.children.forEach(child => {
        this.cascade(cb, child, checkState)
      })
    }
  }

}

Tree.propTypes = {
  width: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
  height: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
  /**
   * 树组件的data数据集
   */
  data: PropTypes.array.isRequired,
  /**
   * 根节点
   */
  root: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.element
    ]),
  /**
   * 是否在展开、收缩节点时添加动画
   */
  animate: PropTypes.bool,
  /**
   * 是否展开所有节点
   */
  expandAll: PropTypes.bool,
  /**
   * 选中的节点
   */
  selected: PropTypes.array,
  /**
   * 默认选中的节点，注意与selected的区别
   * 当selected给了值后，在选中行时，Tree内部不会调用setState()更新UI，需要外面把更新后的selected传递过来
   * 下面的checked, defaultChecked也是如此
   */
  defaultSelected: PropTypes.array,
  /**
   * 选中的节点（指选中它的checkbox或radio，仅commbox=true时有效）
   */
  checked: PropTypes.array,
  /**
   * 默认选中的节点
   */
  defaultChecked: PropTypes.array,
  /**
   * 展开的节点
   */
  expanded: PropTypes.array,
  /**
   * 默认展开的节点
   */
  defaultExpanded: PropTypes.array,
  /**
   * 是否显示commbox
   */
  commbox: PropTypes.bool,
  /**
   * 是否多选
   * @type {[type]}
   */
  multiple: PropTypes.bool,
  /**
   * 是否开启多选的严格模式，开启时，选中节点时，不会同时选中它的父节点或子节点
   */
  checkStrictly: PropTypes.bool,
  /**
   * 是否显示border
   */
  bordered: PropTypes.bool,
  /**
   * 展开、收缩节点时的回调事件
   * @type {[function(isExpanded, node)]}
   */
  onExpand: PropTypes.func,
  /**
   * 选中节点时的回调事件（在commbox=true时无效）
   * @type {[function(isSelected, value, data, node)]}
   */
  onSelect: PropTypes.func,
  /**
   * 选中commbox时的回调事件（仅commbox=true时有效）
   * @type {[function(isChecked, value, data, node)]}
   */
  onCheck: PropTypes.func,
  /**
   * 选中的节点发生变化时的回调事件
   * @type {[function(value, data, node)]}
   */
  onChange: PropTypes.func
}

Tree.defaultProps = {
  prefixCls: 'rc-tree',
  bordered: true,
  useArrow: true,
  onExpand: noop,
  onSelect: noop,
  onCheck: noop,
  onChange: noop
}

export default Tree;
