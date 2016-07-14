import React from 'react'

import Tree from '../../src/Tree'
import TreeNode from '../../src/TreeNode'
import { generateData } from './util'

import '../../src/less/tree-select.less'

const treeData = generateData(10, 5, 2);

class TreeExample extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
  	// let s = Date.now()
   //  const treeNodes = this.renderTreeNodes(treeData)
   //  console.log(Date.now() - s)
    return (
    	<div>
        <h3>单选</h3>
        <Tree multiple defaultSelected={['0-1-0', '0-1-1']} defaultExpanded={['0-1']}>
          <TreeNode value='0-0' text='0-0'>
            <TreeNode value='0-0-0' text='0-0-0'>
              <TreeNode value='0-0-0-0' text='0-0-0-0' />
              <TreeNode value='0-0-0-1' text='0-0-0-1' />
            </TreeNode>
          </TreeNode>
          <TreeNode value='0-1' text='0-1'>
            <TreeNode value='0-1-0' text='0-1-0' />
            <TreeNode value='0-1-1' text='0-1-1'>
              <TreeNode value='0-1-1-0' text='0-1-1-0' />
            </TreeNode>
          </TreeNode>
        </Tree>

        <h3>单选</h3>
        <Tree commbox defaultChecked={['0-1-1']} defaultExpanded={['0-1']}>
          <TreeNode value='0-0' text='0-0'>
            <TreeNode value='0-0-0' text='0-0-0'>
              <TreeNode value='0-0-0-0' text='0-0-0-0' />
              <TreeNode value='0-0-0-1' text='0-0-0-1' />
            </TreeNode>
          </TreeNode>
          <TreeNode value='0-1' text='0-1'>
            <TreeNode value='0-1-0' text='0-1-0' />
            <TreeNode value='0-1-1' text='0-1-1'>
              <TreeNode value='0-1-1-0' text='0-1-1-0' />
            </TreeNode>
          </TreeNode>
        </Tree>

        <h3>多选</h3>
    		<Tree multiple commbox defaultChecked={['0-0-0-1', '0-1-1']} defaultExpanded={['0-1']}>
    			<TreeNode value='0-0' text='0-0'>
    				<TreeNode value='0-0-0' text='0-0-0'>
    					<TreeNode value='0-0-0-0' text='0-0-0-0' />
    					<TreeNode value='0-0-0-1' text='0-0-0-1' />
    				</TreeNode>
    			</TreeNode>
    			<TreeNode value='0-1' text='0-1'>
    				<TreeNode value='0-1-0' text='0-1-0' />
            <TreeNode value='0-1-1' text='0-1-1'>
              <TreeNode value='0-1-1-0' text='0-1-1-0' />
            </TreeNode>
    			</TreeNode>
    		</Tree>

        <h3>多选</h3>
        <Tree multiple commbox data={treeData} defaultChecked={['0-1-1']}>
          
        </Tree>
    	</div>     
    );
  }

  renderTreeNodes(data) {
    return data && data.length && data.map((item, index) => {
      const { children, ...otherProps } = item
      return (
        <TreeNode {...otherProps} key={index}>{this.renderTreeNodes(children)}</TreeNode>
      )
    })
  }
}

export default TreeExample;
