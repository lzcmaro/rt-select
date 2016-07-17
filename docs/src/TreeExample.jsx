import React from 'react'

import Tree from '../../src/Tree'
import TreeNode from '../../src/TreeNode'
import { generateData } from './util'

import '../../src/less/tree-select.less'

class TreeExample extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
  	
    return (
    	<div>
        <h3>单选</h3>
        <Tree commbox width={250} height={350} data={generateData()}  defaultChecked={['0-1-0']} defaultExpanded={['0-1']}/>

        <h3>多选</h3>
    		<Tree multiple commbox data={generateData()}  defaultChecked={['0-0-0', '0-1-0', '0-1-1', '0-1-2']} defaultExpanded={['0-1']}/>

        <h3>多选</h3>
        <Tree multiple commbox data={generateData(10, 5, 2)} defaultChecked={['0-7']}/>
    	</div>     
    );

  }
}

export default TreeExample;
