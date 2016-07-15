import React from 'react'

import Tree from '../../src/Tree'
import TreeSelect from '../../src/TreeSelect'
import { generateData } from './util'

import '../../src/less/tree-select.less'

const treeData = generateData(10, 5, 2)

class TreeSelectExample extends React.Component {

  constructor(props) {
    super(props);

    [
      'onExpand',
      'onSelect',
      'onCheck',
      'onChange'
    ].forEach((m)=> {
      this[m] = this[m].bind(this);
    });

    this.state = {
    	expandAll: false,
    	checked: []
    }
  }

  render() {

  	const toolbarStyle = {
  		height: '30px',
  		lineHeight: '30px',
  		borderBottom: '1px solid #ccc',
  		textAlign: 'center'
  	}

  	const linkStyle = {
  		marginRight: '10px'
  	}

  	const { expandAll, checked } = this.state
  	
    return (
    	<TreeSelect style={{width: 200}} menuStyle={{minWidth: 200, maxHeight: 300}}>
    		<div style={toolbarStyle}>
    			<a href="javascript:;" style={linkStyle} onClick={this.toggleExpand.bind(this, true)}>全部展开</a>
    			<a href="javascript:;" style={linkStyle} onClick={this.toggleExpand.bind(this, false)}>全部收缩</a>
    		</div>
    		<Tree 
    			multiple 
    			commbox 
    			expandAll={expandAll} 
    			defaultExpanded={['0-1']}
    			data={treeData}
    			checked={checked}
    			onExpand={this.onExpand}
    			onSelect={this.onSelect}
    			onCheck={this.onCheck}
    			onChange={this.onChange}/>
    	</TreeSelect>      
    );
  }

  onExpand(expanded, node) {
  	console.log('onExpand: ', expanded, node)
  }

  onSelect(selected, value, data, node) {
  	console.log('onSelect: ', selected, value, data, node)
  }

  onCheck(checked, value, data, node) {
  	console.log('onCheck: ', checked, value, data, node)
  }

  onChange(value, data, node) {
  	this.setState({
  		checked: value
  	})
  }

  toggleExpand(state) {
  	this.setState({
  		expandAll: state
  	})
  }
}

export default TreeSelectExample;
