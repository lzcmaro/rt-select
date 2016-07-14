import React, { PropTypes } from 'react'
import classnames from 'classnames'

import TreeNode from './TreeNode'

import { prefix, toArray } from './utils'

const noop = () => {};
const CHECKBOX_CHECKED = 1
const CHECKBOX_UNCHECKED = 0
const CHECKBOX_PARTIAL = 2
let s

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
       * 用来存储当前树选中的checkbox状态
       * @type {Object} key为node.value，value值，1为选中，2为半选中
       */
      checkedMaps: this.getCheckedMaps(props),
      selectedMaps: this.getSelectedMaps(props),
      expandedMaps: this.getExpandedMaps(props)
    }

    /**
     * 存储当前树所有节点的对象，方便后面通过node.value可以获取
     * @type {Object}
     */
    this.nodeMaps = {}

    s = Date.now()
    // 初始化树节点数据
    this.initialTreeNodes()

    console.log( 'Tree.initialTreeNodes: ', Date.now() - s )
  }

  componentWillMount() {

  }

  componentDidMount() {
    console.log( 'Tree.componentDidMount: ', Date.now() - s )
    this.initialNodeCheckState()
  }

  componentDidUpdate() {

  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    const { root, bordered, className, children } = this.props
    const prefixCls = prefix(this.props)
    let classes = {
      [prefixCls]: true,
      [prefix(this.props, 'bordered')]: bordered
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
    	<div unselectable className="rc-tree-panel">
    		<ul ref="tree" className={classnames(className, classes)}>       
          {React.Children.map(children, this.renderTreeNode, this)}
        </ul>
    	</div>      
    );
  }

  _getOptions(props, keys, multiple) {
    let values = keys || [], map = {}

    if (multiple || props.multiple) {
      values.forEach(item => {
        map[item] = 1
      })
    } else {
      // 单选模式下，只选取第一个值
      map[values[0]] = 1
    }

    return map
  }

  getCheckedMaps(props) {
    return this._getOptions(props, props.checked || props.defaultChecked)
  }

  getSelectedMaps(props) {
    return this._getOptions(props, props.selected || props.defaultSelected)
  }

  getExpandedMaps(props) {
    let map = {}

    if (props.expandAll) {
      // TODO, 获取所有节点，未生成的如何处理？
    } else {
      let values = props.expanded || props.defaultExpanded || []
      values.forEach(item => {
        map[item] = 1
      })
    }

    return map
  }

  initialTreeNodes() {
    this.treeNodes = React.Children.map(this.props.children, this.renderTreeNode, this)
  }

  /**
   * 渲染树节点
   * @param  {TreeNode} child  子节点对象
   * @param  {Number} index  索引值
   * @param  {Number} prePath  节点路径，根节点的路径为0，它的子节点为0-0, 0-1, ...
   * @return {TreeNode}      节点对象
   */
  renderTreeNode(node, index, prePath = 0) {
    // console.log('Tree.renderTreeNode', parent)
    const nodeProps = node.props
    const { checkedMaps, selectedMaps, expandedMaps } = this.state
    const path = `${prePath}-${index}`

    const nodeValue = nodeProps.value
    const selected = selectedMaps[nodeValue] || CHECKBOX_UNCHECKED
    const checked = checkedMaps[nodeValue] || CHECKBOX_UNCHECKED
    const expanded = expandedMaps[nodeValue] || CHECKBOX_UNCHECKED
    

    let cloneProps = {
      ref: `node-${path}`,
      tree: this,
      path,
      selected, 
      checked,
      expanded,
      multiple: this.props.multiple,
      commbox: this.props.commbox,
      onExpand: this.onExpand,
      onSelect: this.onSelect,
      onCheck: this.onCheck
    }

    // 递归生成所有子节点
    let children = node.props.children

    if (children) {
      children = (
        <ul>
          {React.Children.map(children, (child, index) => {
            return this.renderTreeNode(child, index, path)
          })}
        </ul>
      )
    }

    const cloneNode = React.cloneElement(node, cloneProps, children)

    // 节点的ref为`node-${path}`的方式，为方便通过ID获取节点对象，这里把node缓存起来
    this.nodeMaps[nodeValue] = cloneNode

    return cloneNode
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
    this.props.onExpand(expanded, node)
  }

  onSelect(selected, node) {
    const { selectedMaps } = this.state
    const { multiple, onSelect } = this.props
    const value = node.props.value
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
    onSelect(value, selected, node)
  }

  onCheck(checked, node) {
    // console.log('Tree.onCheck', checked, node)
    const { multiple, checkStrictly } = this.props
    const value = node.props.value
    

    // 不是多选或开启多选严格模式时，选中哪个节点就仅仅选中哪个节点，不作关联操作
    if (!multiple) { // 单选
      this.state.checkedMaps = {[value]: checked}
    } else if(multiple && checkStrictly) { // 多选，且开启了多选的严格模式
      this.state.checkedMaps[value] = checked
    } else { // 多选

      if (checked) {
        // 子节点全设为checked
        this.cascade(this.setNodeCheckState, node, CHECKBOX_CHECKED)
        // 父节点全设为partial
        this.bubble(this.setNodeCheckState, node, CHECKBOX_PARTIAL)
      } else {
        // 子节点全设为unchecked
        this.cascade(this.setNodeCheckState, node, CHECKBOX_UNCHECKED)
        // 父节点全设为partial
        this.bubble(this.setNodeCheckState, node, CHECKBOX_PARTIAL)
      }

    }
    
    // 如果外面没有传递checked值过来，即调用setState()更新UI，否则就让外面维护这个状态
    if (!('checked' in this.props)) {
      this.setState({
        // 在遍历当前节点的父、子节点，并改变它的check state时，并没有调用setState()更新，这里统一处理
        checkedMaps: this.state.checkedMaps 
      })
    }  

    this.props.onCheck(value, checked, node)
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

  /**
   * 设置节点的checkbox的选中状态
   * @param {TreeNode} node       节点对象
   * @param {Number} checkState   选中状态：0，1，2
   */
  setNodeCheckState(node, checkState) {
    // console.log('Tree.check: ', node.props.value, checkState)
    const nodeValue = node.props.value
    let checkedMaps = this.state.checkedMaps, __checkState = checkState

    if (checkState === CHECKBOX_PARTIAL) { // 重新计算该节点的checked值

      let children = node.props.children, sumChecked = 0, sumPartial = 0
      
      // TreeNode的直接节点为ul，而不是TreeNode，见renderTreeNode()
      if (children.type !== TreeNode) {
        children = children.props.children
      }

      // 这里只处理当前节点的直接子节点即可，因为state的变更顺序是从子到父的
      React.Children.forEach(children, (child) => {
        // 节点的checked可能已发生变化，但UI还没更新，这里需要从checkedMaps中获取它最新的checkState
        const childCheckState = checkedMaps[child.props.value] !== undefined ? checkedMaps[child.props.value] : child.props.checked 

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
   * @param  {[type]}   node [description]
   * @param  {[type]}   checkState [description]
   * @return {[type]}        [description]
   */
  bubble(cb, node, checkState) {
    let p = this.findNode(this.getParentPath( node.props.path ));
    while (p) {
      if (cb.call(this, p, checkState) === false) {
        break;
      }
      p = this.findNode(this.getParentPath( p.props.path ));
    }
  }
  /**
   * 瀑布(遍历所有子节点)
   * @param  {Function} cb   [description]
   * @param  {[type]}   node [description]
   * @param  {[type]}   checkState [description]
   * @return {[type]}        [description]
   */
  cascade(cb, node, checkState) {
    // children为TreeNode节点时，才调用cb()
    if (node.type && node.type === TreeNode) { // TreeNode的react.element对象
      // 这里获取它的实例对象，方便在cb中处理
      let __node = this.refs[node.ref]
      if (cb.call(this, __node, checkState) === false) {
        return
      }
    } else if (node instanceof TreeNode) { // TreeNode的实例对象
      if (cb.call(this, node, checkState) === false) {
        return
      }
    }

    // 这里的children为react.element对象，可能包含其它不是TreeNode的节点
    React.Children.forEach(node.props.children, (child) => {
      this.cascade(cb, child, checkState)       
    })

  }

  cacheTreeNodes() {
    this.nodeMaps = {}

  }

  /**
   * 初始化节点的checkbox选中状态（因为节点的checkbox会有关联选择）
   * TODO: 应该放到TreeNode去更新？
   * @return {[type]} [description]
   */
  initialNodeCheckState() {
    const { multiple, commbox, checkStrictly } = this.props
    if ( multiple && commbox && !checkStrictly) {
      const nodeMaps = this.nodeMaps
      Object.keys(nodeMaps).forEach(key => {
        let node = this.refs[ nodeMaps[key].ref ]
        node && node.props.checked && this.onCheck(CHECKBOX_CHECKED, node)
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
  data: PropTypes.array,
  /**
   * 用于如何解析data，默认为[{id, text, parentId, children}, ...]
   */
  dataMode: PropTypes.object,
  /**
   * 根节点
   */
  root: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.element
    ]),
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
   * 选中节点时的回调事件
   * @type {[function(value, isSelected, node)]}
   */
  onSelect: PropTypes.func,
  /**
   * 选中节点时的回调事件（仅多选，commbox=true时有效）
   * @type {[function(value, isSelected, node)]}
   */
  onCheck: PropTypes.func,
  /**
   * 选中的节点发生变化时的回调事件
   * @type {[function(value, node)]}
   */
  onChange: PropTypes.func
}

Tree.defaultProps = {
  prefixCls: 'rc-tree',
  bordered: true,
  onExpand: noop,
  onSelect: noop,
  onCheck: noop,
  onChange: noop
}

export default Tree;
