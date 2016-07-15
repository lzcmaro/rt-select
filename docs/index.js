import React from 'react';
import { render } from 'react-dom';

import TreeExample from './src/TreeExample';
import TreeSelectExample from './src/TreeSelectExample';

import '../src/less/tree.less'
import '../src/less/tree-select.less'
import './app.less'

class App extends React.Component {
	render() {
		return (
				<main className="main">
					<section className="section">
						<h3>TreeSelect examples.</h3>
						<TreeSelectExample />
					</section>

					<section className="section">
						<h3>Tree examples.</h3>
						<TreeExample />
					</section>			
				</main>
			)
	}
}

render(<App />, document.getElementById('root'));
