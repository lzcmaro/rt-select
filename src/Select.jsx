import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import DataTree from './helpers/dataTree'
import { 
  ownerDocument, 
  addEventListener,
  TREE_ELEMENT, 
  LIST_ELEMENT
} from './helpers/util'

const noop = () => {};

const CLICK_WAS_INSIDE = '__click_was_inside__';
let counter = 0;

function getSuppressRootClose() {
  let id = CLICK_WAS_INSIDE + counter++;
  return {
    id,
    suppressRootClose(event) {
      // Tag the native event to prevent the root close logic on document click.
      // This seems safer than using event.nativeEvent.stopImmediatePropagation(),
      // which is only supported in IE >= 9.
      event.nativeEvent[id] = true;
      event.stopPropagation();
    }
  };
}

class Select extends React.Component {

  constructor(props) {
    super(props);

    [
      'onExpand',
      'onSelect',
      'onCheck',
      'onChange',
      'toggleMenuVisible',
      'handleSearchInputChange',
      'handleDocumentClick'
    ].forEach((m)=> {
      this[m] = this[m].bind(this);
    });

    this.state = {
      /**
       * 用于渲染下拉菜单的数据，取自于Tree.props.data或List.props.data
       * 因为有搜索功能，这个data在搜索时会发生变化
       * @type {[type]}
       */
      data: [],
      /**
       * 显示、隐藏下拉菜单的标识
       * @type {Boolean}
       */
      menuVisible: false,
      /**
       * 树节点展开列表（搜索时用到，这里需要接管Tree.props.expanded）
       * @type {Array}
       */
      expanded: [],
      /**
       * 下拉框在选择后，输入框显示的值
       * @type {String}
       */
      inputValue: props.inputValue,
      /**
       * 搜索框显示的值
       * @type {String}
       */
      searchInputValue: undefined
    }

    /**
     * 存储Tree, List组件的原有数据和事件
     */
    this.menuProps = {
      data: [],
      onExpand: noop,
      onSelect: noop,
      onCheck: noop,
      onChange: noop
    }
    /**
     * 当前下拉菜单中的有效组件类型，Tree, List
     */
    this.menuType = null
    this.searchInputRef = 'search-input'
    this.initializeMenuProps(props)

    /**
     * 存储tree数据的类对象，用于数据搜索
     */
    this.dataTree// = new DataTree().import()

    /**
     * 用于阻止事件冒泡，参考react-overlay的做法
     */
    const { id, suppressRootClose } = getSuppressRootClose()
    this._suppressRootId = id;
    this._suppressRootCloseHandler = suppressRootClose
  }

  componentDidMount() {
    const { 
      data,
      commbox, 
      selected, 
      defaultSeleced, 
      checked, 
      defaultChecked
    } = this.menuProps

    const dataList = this.menuProps['data']
    let selectedValues = (commbox ? (checked || defaultChecked) : (selected || defaultSeleced)) || []
    let selectedDatas = []
    // 根据节点选中项设置inputValue
    selectedValues.forEach(value => {
      const node = this.dataTree.searchDFS((data) => {
        return data.id === value
      })
      node && selectedDatas.push(node.data())
    })

    this.setInputValue(selectedDatas)
  }

  componentWillUnmount() {
    this.unbindRootCloseHandlers()
  }

  componentWillReceiveProps(nextProps) {
    
  }

  render() {
  	const { className, prefixCls, children, ...otherProps } = this.props

    return (
    	<div {...otherProps} className={classnames(className, prefixCls)}>
    		<div className={`${prefixCls}-head`}>
          <label>{this.state.inputValue}</label>
          <div className="dropdown-toggle" onClick={this.toggleMenuVisible}><i/></div>
        </div>
        {this.renderMenu()}
    	</div>      
    );
  }

  renderMenu() {
    const { prefixCls, children, menuStyle, emptyDataText, search, searchInputPlaceholder } = this.props
    const { menuVisible, searchInputValue } = this.state
    const style = {...(menuStyle || {}), display: menuVisible ? 'block' : 'none'}
    
    return (
      <div 
        ref="menu" 
        style={style} 
        className={`${prefixCls}-menu`} 
        onClick={this._suppressRootCloseHandler} >
        {/** TODO: 是否有递归遍历其所有子节点，找到这里需要接管的组件（Tree, List）？**/}
        {React.Children.map(children, child => {
          // 节点为Tree组件时，给它添加相应的属性与事件，以便Tree和Select关联起来
          const elementType = this.isValidElement(child)
          if (elementType) {

            // 检查数据是否有更新
            if (child.props !== this.menuProps) {
              this.setMenuProps(child, elementType)
            }

            // 这里获取最新数据
            const { data, expanded } = this.state
            let element
            
            if (!data || data.length <= 0) {
              element = (<p className="empty-data-text">{emptyDataText}</p>)
            } else {
              let props = {
                data: data,
                bordered: false, 
                expanded,
                onExpand: this.onExpand,
                onSelect: this.onSelect,
                onCheck: this.onCheck,
                onChange: this.onChange
              }

              element = React.cloneElement(child, props)
            }

            console.log('search', search)
            
            // 添加搜索框
            if (search) {
              element = (
                <div>
                  <div className="search-input-wrapper">
                    <input 
                      ref={this.searchInputRef} 
                      type="text" 
                      placeholder={searchInputPlaceholder}
                      value={searchInputValue}
                      onChange={this.handleSearchInputChange}/>
                  </div>
                  {element}
                </div>
              )
            }

            return element
          }

          return child
        })}
      </div>
    )
  }

  initializeMenuProps(props) {
    // TODO: 是否有必要遍历其所有子节点，找到这里需要接管的组件（Tree, List）？
    React.Children.forEach(props.children, child => {
      // 节点为Tree, List组件时，给它添加相应的属性与事件，以便Tree和Select关联起来
      const elementType = this.isValidElement(child)
      if (elementType) {
        this.setMenuProps(child, elementType, true)
        return;
      }
    })

  }

  setMenuProps(node, elementType, initial) {
    // 把要接管的组件props存储起来，方便后面使用
    const { data, expanded, defaultExpanded } = node.props
    
    if (data !== this.menuProps.data ) {
      // 重置state
      this.state.data = data
      this.state.expanded = (initial ? expanded || defaultExpanded : expanded) || []
      this.state.inputValue = null
      this.state.searchInputValue = null

      if (this.isTreeElement(elementType)) {
        this.dataTree = new DataTree().import(data.slice())
        this.state.data = this.dataTree.export()
      }
    }

    this.menuProps = node.props
    this.menuType = elementType
    
  }

  /**
   * 判断是否有效的Tree, List组件，如果是，返回组件的类型，否则还回false
   * 由于并不依懒于Tree, List组件，所以这里仅以它的displayName来判断
   */
  isValidElement(element) {
    const elementType = element.type ? element.type.displayName : undefined
    return elementType && (this.isTreeElement(elementType) || this.isListElement(elementType)) ? elementType : false
  }

  isTreeElement(elementType) {
    return (elementType || this.menuType) === TREE_ELEMENT
  }

  isListElement(elementType) {
    return (elementType || this.menuType) === LIST_ELEMENT
  }

  bindRootCloseHandlers() {
    const doc = ownerDocument(this);
    this._onDocumentClickListener = addEventListener(doc, 'click', this.handleDocumentClick);
  }

  unbindRootCloseHandlers() {
    if (this._onDocumentClickListener) {
      this._onDocumentClickListener.remove();
    }
  }

  handleDocumentClick(e) {
    // This is now the native event.
    if (e[this._suppressRootId]) {
      return;
    }

    this.toggleMenuVisible()
  }

  toggleMenuVisible() {
    this.setState({
      menuVisible: !this.state.menuVisible
    }, () => {
      if (this.state.menuVisible) {
        this.bindRootCloseHandlers()
        
        // 让搜索框获得焦点
        if (this.props.search) {
          const input = this.refs[this.searchInputRef]
          input && input.focus()
        }
      } else if (!this.state.menuVisible) {
        this.unbindRootCloseHandlers()
      }
    })
  }

  onExpand(expanded, node) {
    const nodeValue = node.props.value
    this.setState({
      expanded: expanded ? [...this.state.expanded, nodeValue] : this.state.expanded.filter(item => item !== nodeValue)
    })
    this.menuProps.onExpand(expanded, node)
  }

  onSelect(selected, value, data, node) {
    this.menuProps.onSelect(selected, value, data, node)
  }

  onCheck(checked, value, data, node) {
    this.menuProps.onCheck(checked, value, data, node)
  }

  onChange(value, data, node) {
    this.setInputValue(data)
    this.menuProps.onChange(value, data, node)
  }

  setInputValue(data) {
    let inputValue
    // 把数据更新到input
    if (data) {
      if (Array.isArray(data)) {
        data.length > 0 && (inputValue = data.map(o => o.text).join(', '))
      } else {
        inputValue = data.text
      }  
    }
    this.setState({ inputValue })
  }

  handleSearchInputChange() {
    const searchInputValue = this.refs[this.searchInputRef].value
    let result

    // 使用输入法时，每次keyDown都会触发该onChange事件，但input的值实际上还没变更，这里判断一下
    if (searchInputValue !== this.state.searchInputValue) {
      // 过滤节点数据
      if (this.isTreeElement()) {
        result = this.filterTreeDatas(searchInputValue)
      } else {
        result = this.filterListDatas(searchInputValue)
      }
      
      this.setState({
        ...(result || {}),
        searchInputValue
      })
    }
  }

  filterTreeDatas(keyWord) {
    const { data } = this.menuProps
    let expanded = []

    if (!keyWord) {
      return {data}
    }

    // 重置树节点数据
    const tree = this.dataTree
    tree.import(data.slice())

    // 使用深度优先搜索算法搜索树节点
    tree.traverseDFS((node) => {
      const nodeData = node.data()
      if (nodeData.text.indexOf( keyWord ) > -1) {
        expanded.push( nodeData.id )
        //获取它所有的祖先节点，把它的ID放到map中
        node.getAncestry().forEach(item => {
          expanded.push( item.data().id )
        })
      }
    })

    // 只搜索到一个节点时，不展开该节点
    if (expanded.length === 1) return { data, expanded: [] };
    else if (expanded.length > 1) return { data, expanded };
    else return { data: null }

  }

  filterListDatas(keyWord) {
    // TODO
  }

}

Select.propTypes = {
  /**
   * 下拉菜单的style
   * @type {Object}
   */
  menuStyle: PropTypes.object,
  /**
   * 数据为空时，显示的文本信息
   * @type {String}
   */
  emptyDataText: PropTypes.string,

  inputValue: PropTypes.string,
  /**
   * 是否启用节点过滤功能
   * @type {Boolean}
   */
  search: PropTypes.bool,
  /**
   * 查询框的placeholder值
   */
  searchInputPlaceholder: PropTypes.string,
  /**
   * 在输入文字进行节点过滤时的回调事件（仅useSearch=true时有效）
   */
  onFilter: PropTypes.func
}

Select.defaultProps = {
  prefixCls: 'rc-select',
  emptyDataText: '没有可显示的数据',
  searchInputPlaceholder: '搜索',
  onFilter: noop
}

export default Select;
