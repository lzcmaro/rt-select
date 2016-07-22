import React from 'react'

import Tree from '../../src/Tree'
import Select from '../../src/Select'
import { generateData } from './util'

// const treeData = generateData(10, 5, 2)
const treeData = [{
	id: '1',
	text: '北京市',
	children: [{
			id: '1-0',
			text: '平谷区',
			children: [{
					id: '1-0-0',
						text: '夏谷庄镇',
						children: [{
								id: '1-0-0-0',
								text: '马各庄村'
							}]
				}]
		}, {
			id: '1-1',
			text: '顺义区',
			children: [{
					id: '1-1-0',
						text: '杨镇',
						children: [{
								id: '1-1-0-0',
								text: '李各庄村'
							}, {
								id: '1-1-0-1',
								text: '一街村'
							}, {
								id: '1-1-0-2',
								text: '二郎庙村'
							}]
				}, {
					id: '1-1-1',
						text: '木林镇',
						children: [{
								id: '1-1-1-0',
								text: '荣各庄村'
							}]
				}]
		}]
},{
  id: '2',
  text: '北京市',
  children: [{
      id: '2-0',
      text: '平谷区',
      children: [{
          id: '2-0-0',
            text: '夏谷庄镇',
            children: [{
                id: '2-0-0-0',
                text: '马各庄村'
              }]
        }]
    }, {
      id: '2-1',
      text: '顺义区',
      children: [{
          id: '2-1-0',
            text: '杨镇',
            children: [{
                id: '2-1-0-0',
                text: '李各庄村'
              }, {
                id: '2-1-0-1',
                text: '一街村'
              }, {
                id: '2-1-0-2',
                text: '二郎庙村'
              }]
        }, {
          id: '2-1-1',
            text: '木林镇',
            children: [{
                id: '1-1-1-0',
                text: '荣各庄村'
              }]
        }]
    }]
}]

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
    	treeData: [],
    	expandAll: false,
    	checked: []
    }
  }

  componentDidMount() {
  	setTimeout(() => {
  		this.setState({
  			treeData,
        checked: ['1-0']
  		})
  	}, 2000)
  }

  render() {

  	const toolbarStyle = {
  		height: '30px',
  		lineHeight: '30px',
  		borderBottom: '1px solid #e7e7eb',
  		textAlign: 'center'
  	}

  	const linkStyle = {
  		marginRight: '10px'
  	}

  	const { expandAll, checked, treeData } = this.state
  	
    return (
    	<Select search style={{width: 200}} menuStyle={{minWidth: 200, maxHeight: 300}}>
    		<div style={toolbarStyle}>
    			<a href="javascript:;" style={linkStyle} onClick={this.toggleExpand.bind(this)}>展开 / 收缩</a>
    		</div>
    		<Tree 
    			multiple
    			commbox
    			expandAll={expandAll} 
          defaultExpanded={['1', '0-1']}
    			data={treeData}
    			checked={checked}
    			onExpand={this.onExpand}
    			onSelect={this.onSelect}
    			onCheck={this.onCheck}
    			onChange={this.onChange}/>
    	</Select>      
    );
  }

  onExpand(expanded, node) {
  	// console.log('onExpand: ', expanded, node)
  }

  onSelect(selected, value, data, node) {
  	// console.log('onSelect: ', selected, value, data, node)
    // return false 
  }

  onCheck(checked, value, data, node) {
  	// console.log('onCheck: ', checked, value, data, node)
    // return false 
  }

  onChange(value, data, node) {
  	// console.log('onChange: ', value)
  	this.setState({checked: value})
  }

  toggleExpand() {
  	this.setState({
  		expandAll: !this.state.expandAll
  	})
  }
}

export default TreeSelectExample;
