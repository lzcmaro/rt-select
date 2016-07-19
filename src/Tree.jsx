import React, { PropTypes } from 'react'
import classnames from 'classnames'
import TreeNode from './TreeNode'
import DataTree from './helpers/dataTree'

import { 
  prefix,
  noop, 
  checkStateToBoolean,
  booleanToCheckState,
  CHECKBOX_CHECKED,
  CHECKBOX_UNCHECKED,
  CHECKBOX_PARTIAL 
} from './helpers/util'

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

    this.dataTree = new DataTree().import(props.data.slice())

    this.state = {
      treeDatas: this.dataTree.export(),
      /**
       * 用来存储当前树选中的checkbox状态
       * @type {Object} key为node.value，value值，1为选中，2为半选中
       */
      checkedMaps: this.getCheckedMaps(props, true),
      selectedMaps: this.getSelectedMaps(props, true),
      expandedMaps: this.getExpandedMaps(props, props.data, true)
    }

    /**
     * 存储当前树所有节点的对象，方便后面通过node.value可以获取
     * @type {Object}
     */
    this.nodeMaps = {}
    /**
     * 这里存储的是选中的节点对象，与state.selectedMaps不同
     * 用于回调props.onChange时使用
     */
    this.selectedNodes = []
    this.checkedNodes = []
  }

  componentWillReceiveProps(nextProps) {
    const { data, dataMode, checked, selected, expanded, expandAll } = this.props
    let { treeDatas, checkedMaps, selectedMaps, expandedMaps } = this.state

    // 数据改变时，重设map数据，避免存在脏数据
    if (data !== nextProps.data || dataMode !== nextProps.dataMode) {
      this.dataTree = new DataTree({dataMode})
      this.nodeMaps = {}
      this.state.selectedMaps = {}
      this.state.checkedMaps = {}
      this.state.expandedMaps = {}

      treeDatas = this.dataTree.import(data).export()
    }

    if (checked !== nextProps.checked) {
      checkedMaps = this.getCheckedMaps(nextProps)
    }

    if (selected !== nextProps.selected) {
      selectedMaps = this.getSelectedMaps(nextProps)
    }

    if (expanded !== nextProps.expanded || expandAll !== nextProps.expandAll) {
      expandedMaps = this.getExpandedMaps(nextProps, nextProps.data)
    }

    this.setState({treeDatas, checkedMaps, selectedMaps, expandedMaps})
      
  }

  render() {
    const { data, bordered, className, style, width, height, prefixCls, children, ...otherProps } = this.props
    const { treeDatas } = this.state
    const wrapperPrefixCls = prefix(this.props, 'panel')
    const wrapperStyle = {...(style || {}), width, height}
    const wrapperCls = {
      [wrapperPrefixCls]: true,
      [`${wrapperPrefixCls}-bordered`]: bordered
    }
  	
    return (
    	<div unselectable style={wrapperStyle} className={classnames(className, wrapperCls)}>
    		<ul {...otherProps} className={prefixCls}>       
          {treeDatas.map((item, index) => {
            return this.generateTreeNode(item, index)
          })}
        </ul>
    	</div>      
    );
  }

  getCheckedMaps(props, initial) {
    const { data, multiple, commbox, checked, defaultChecked } = props
    // 不是初始化时，只取checked的值，否则优先取值于checked
    const values = (initial ? checked || defaultChecked : checked) || []
    let map = {}

    if (commbox) {
      // 多选情况下，其父、子节点的级联选中状态不作处理，当它传递的值是“有效的”
      // 这和在外面维护checked这个值是一样的，它通过props传递过来，以更新commbox的选中状态
      multiple ? values.forEach(item => (map[item] = CHECKBOX_CHECKED)) : map[ values[0] ] = CHECKBOX_CHECKED
    }

    return map
  }

  getSelectedMaps(props, initial) {
    const { multiple, selected, defaultSelected } = props
    // 不是初始化时，只取selected的值，否则优先取值于selected
    const values = (initial ? selected || defaultSelected : selected) || []
    let map = {}

    // 单选模式下，只选取第一个值
    multiple ? values.forEach(item => (map[item] = true)) : map[ values[0] ] = true

    return map
  }

  getExpandedMaps(props, data, initial) {
    const { expandAll, expanded, defaultExpanded } = props
    let map = {}

    if (expandAll) {
      (data || []).forEach(item => {
        map[item.id] = true
        const children = item.children
        if (children && children.length > 0) {
          // 递归所有子节点，并合并到map中
          let _map = this.getExpandedMaps(props, children)
          Object.assign(map, _map)
        }
      })
    } else {
      // 不是初始化时，只取expanded的值，否则优先取值于expanded
      let values = (initial ? expanded || defaultExpanded : expanded) || []
      values.forEach(item => (map[item] = true))
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
    if (!nodeData.id || !nodeData.text) {
      throw `Error. 节点属性 {id} {text} 不能为空。`
    }

    const { expandedMaps, selectedMaps, checkedMaps } = this.state
    const { multiple, commbox } = this.props
    const { id: value, text, children } = nodeData
    const path = nodeData.path || `${prePath}-${index}`
    const selected = selectedMaps[value] || false
    const checked = checkedMaps[value] || CHECKBOX_UNCHECKED
    const expanded = expandedMaps[value] || false
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
    // console.log('Tree.onExpand', expanded, node)
    const { expandedMaps } = this.state
    // 如果外面没有传递expanded值过来，即调用setState()更新UI，否则就让外面维护这个状态
    if (!('expanded' in this.props)) {
      this.setState({
        expandedMaps: {...expandedMaps, [node.props.value]: expanded}
      })
    }
    this.props.onExpand(expanded, node)
  }

  onSelect(selected, node) {
    const { selectedMaps } = this.state
    const { multiple, commbox, onSelect } = this.props
    const { value, data } = node.props

    if (onSelect(selected, value, data, node) === false) {
      return
    }
    
    // 如果外面没有传递selected值过来，即调用setState()更新UI，否则就让外面维护这个状态
    if (!('selected' in this.props)) {
      // 多选且没有commbox时，才允许选择多个，否则它的选中以commbox为主
      if (multiple && !commbox) {
        this.setState({
          selectedMaps: {...selectedMaps, [value]: selected}
        })
      } else {
        this.setState({
          selectedMaps: {[value]: selected}
        })
      }      
    }

    // 多选，且有commbox时，不触发其onChange事件，以commbox的check为主
    // 单选，且有commbox时，该onSelect不会被触发，这里不需处理
    if (!(multiple && commbox)) {
      this.setSelectedNodes(selected, data, 'selectedNodes')
      this.fireChange({selected, value, data, node, selectedNodes: this.selectedNodes})
    }

  }

  onCheck(checked, node) {
    // console.log('Tree.onCheck', checked, node)
    const { multiple, commbox } = this.props
    const { value, data } = node.props
    const checkState = checkStateToBoolean(checked)

    if (this.props.onCheck(checkState, value, data, node) === false) {
      return
    }

    this.toggleCheckState(checked, data)

    // 如果外面没有传递checked值过来，即调用setState()更新UI，否则就让外面维护这个状态
    if (!('checked' in this.props)) {     
      this.setState({
        // 在遍历当前节点的父、子节点，并改变它的check state时，并没有调用setState()更新，这里统一处理
        checkedMaps: this.state.checkedMaps,
        // 单选情况下，把selected一起更新
        selectedMaps: !multiple ? {[value]: checkStateToBoolean(checked)} : this.state.selectedMaps
      })
    }
    
    this.fireChange({selected: checkState, value, data, node, selectedNodes: this.checkedNodes})
    
  }

  setSelectedNodes(selected, data, dataKey) {
    const { multiple } = this.props
    if (multiple) {
      if (selected) {
        this[dataKey].push( data )
      } else {
        this[dataKey] = this[dataKey].filter(item => item.id !== data.id)
      } 
    } else {
      this[dataKey] = [data]
    }
  }

  fireChange(info) {
    const { multiple, commbox, onChange } = this.props
    const { selected, value, data, node, selectedNodes } = info

    if (multiple) {
      let values = [], datas = []
      selectedNodes.forEach(data => {
        values.push( data.id )
        datas.push( data )
      })

      onChange(values, datas, node)
    } else {
      // 单项选择，在取消选中时，返回空
      selected ? onChange([value], [data], node) : onChange(undefined, undefined, node)
    }
  }

  toggleCheckState(checked, nodeData) {
    const { multiple, checkStrictly } = this.props    

    // 不是多选或开启多选严格模式时，选中哪个节点就仅仅选中哪个节点，不作关联操作
    if (!multiple) { // 单选
      this.state.checkedMaps = {[nodeData.id]: checked}
    } else if(multiple && checkStrictly) { // 多选，且开启了多选的严格模式
      this.state.checkedMaps[nodeData.id] = checked
    } else { // 级联多选

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
   * 根据当前节点路径，获取它的父节点路径
   * @param  {String} path 节点路径
   * @return {String}      返回搜索到的节点路径，如果当前节点为根节点，返回空字符
   */
  getParentPath(path) {
    return path ? path.substring(0, path.lastIndexOf('-')) : ''
  }

  getParentNode(nodeData) {
    const node = this.nodeMaps[ nodeData.id ] || {props: {}}
    return this.findNode(this.getParentPath( node.props.path ))
  }

  /**
   * 设置节点的checkbox的选中状态
   * @param {TreeNode} node       节点对象
   * @param {Number} checkState   选中状态：0，1，2
   */
  setNodeCheckState(nodeData, checkState) {
    // console.log('Tree.check: ', node.props.value, checkState)
    const nodeValue = nodeData.id
    let checkedMaps = this.state.checkedMaps, __checkState = checkState

    if (checkState === CHECKBOX_PARTIAL) { // 重新计算该节点的checked值

      const children = nodeData.children
      let sumChecked = 0, sumPartial = 0

      children.forEach(child => {
        // 这里需要取到TreeNode节点对象，以便获取它现在的选择状态
        const node = this.nodeMaps[ child.id ]
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

    this.setSelectedNodes(checkStateToBoolean(__checkState), nodeData, 'checkedNodes')
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
  rootNode: PropTypes.oneOfType([
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
  prefixCls: 'rt-tree',
  bordered: true,
  useArrow: true,
  onExpand: noop,
  onSelect: noop,
  onCheck: noop,
  onChange: noop
}

Tree.elementType = 'Tree'

export default Tree;
