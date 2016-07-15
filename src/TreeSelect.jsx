import React, { PropTypes } from 'react'
import classnames from 'classnames'
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
import createChainedFunction from 'react-overlays/lib/utils/createChainedFunction';

const noop = () => {};

class TreeSelect extends React.Component {

  constructor(props) {
    super(props);
    [
      'onExpand',
      'onSelect',
      'onCheck',
      'onChange',
      'toggleVisible'
    ].forEach((m)=> {
      this[m] = this[m].bind(this);
    });

    this.state = {
      /**
       * 显示、隐藏下拉菜单的标识
       * @type {Boolean}
       */
      menuVisible: false,
      /**
       * 下拉框在选择后，输入框显示的值
       * @type {String}
       */
      inputValue: undefined
    }

    /**
     * 存储Tree组件的原有数据和事件
     */
    this.treeProps = {}
  }

  componentWillMount() {

  }

  componentDidMount() {
    
  }

  componentDidUpdate() {

  }

  componentWillReceiveProps(nextProps) {
    
  }

  render() {
  	const { data, className, prefixCls, children, ...otherProps } = this.props

    return (
    	<div {...otherProps} className={classnames(className, prefixCls)}>
    		<div className={`${prefixCls}-head`}>
          <label>{this.state.inputValue}</label>
          <div className="dropdown-toggle" onClick={this.toggleVisible}><i/></div>
        </div>
        
          {this.renderMenu()}
    	</div>      
    );
  }

  renderMenu() {
    const { prefixCls, children, menuStyle } = this.props
    const { menuVisible } = this.state
    const style = {...(menuStyle || {}), display: menuVisible ? 'block' : 'none'}

    let menu = (
      <div ref="menu" style={style} className={`${prefixCls}-menu`}>
        {React.Children.map(children, child => {
          // 节点为Tree组件时，给它添加相应的属性与事件，以便Tree和Select关联起来
          if (child.type && child.type.displayName === 'Tree') {
            // 把相关数据和事件存储起来，方便后面回调用
            const { data, onExpand = noop, onSelect = noop, onCheck = noop, onChange = noop } = child.props
            this.treeProps = { data, onExpand, onSelect, onCheck, onChange }
            
            let props = {
              ref: 'tree',
              bordered: false, 
              onExpand: this.onExpand,
              onSelect: this.onSelect,
              onCheck: this.onCheck,
              onChange: this.onChange
            }
            return React.cloneElement(child, props)
          }

          return child
        })}
      </div>
    )

    if (menuVisible) {
      menu = (
        <RootCloseWrapper noWrap onRootClose={this.toggleVisible}>
          {menu}
        </RootCloseWrapper>
      )
    }
    
    return menu
  }

  toggleVisible() {
    this.setState({
      menuVisible: !this.state.menuVisible
    })
  }

  onExpand(expanded, node) {
    this.treeProps.onExpand(expanded, node)
  }

  onSelect(selected, value, data, node) {
    this.treeProps.onSelect(selected, value, data, node)
  }

  onCheck(checked, value, data, node) {
    this.treeProps.onCheck(checked, value, data, node)
  }

  onChange(value, data, node) {
    console.log('TreeSelect.onChange: ', data)
    // 把数据更新到input
    let inputValue
    if (data) {
      if (Array.isArray(data)) {
        data.length > 0 && (inputValue = data.map(o => o.text).join(', '))
      } else {
        inputValue = data.text
      }
      this.setState({ inputValue })
    }
    this.treeProps.onChange(value, data, node)
  }
}

TreeSelect.propTypes = {
  menuStyle: PropTypes.object,
  /**
   * 数据为空时，显示的文本信息
   * @type {[type]}
   */
  emptyDataText: PropTypes.string
}

TreeSelect.defaultProps = {
  prefixCls: 'rc-tree-select',
  emptyDataText: '没有可显示的数据',
  onExpand: noop,
  onSelect: noop,
  onCheck: noop,
  onChange: noop
}

export default TreeSelect;
