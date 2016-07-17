
class Traverser {
	constructor(tree) {
		this._tree = tree
	}

	/**
   * Searches a tree in DFS fashion. Requires a search criteria to be provided.
   *
   * @method searchDFS
   * @memberof Traverser
   * @instance
   * @param {function} criteria - MUST BE a callback function that specifies the search criteria.
   * Criteria callback here receives {@link TreeNode#_data} in parameter and MUST return boolean
   * indicating whether that data satisfies your criteria.
   * @return {object} - first {@link TreeNode} in tree that matches the given criteria.
   * @example
   * // Search DFS
   * var node = tree.searchDFS(function(data){
   *  return data.key === '#greenapple';
   * });
   */
  searchDFS(criteria) {

    // Hold the node when found
    var foundNode = null;

    // Find node recursively
    (function recur(node) {
      if(node.matchCriteria(criteria)) {
        foundNode = node;
        return foundNode;
      } else {
        node._childNodes.some(recur);
      }
    }(this._tree._rootNode));

    return foundNode;
  }

  /**
   * Searches a tree in BFS fashion. Requires a search criteria to be provided.
   *
   * @method searchBFS
   * @memberof Traverser
   * @instance
   * @param {function} criteria - MUST BE a callback function that specifies the search criteria.
   * Criteria callback here receives {@link TreeNode#_data} in parameter and MUST return boolean
   * indicating whether that data satisfies your criteria.
   * @return {object} - first {@link TreeNode} in tree that matches the given criteria.
   * @example
   * // Search BFS
   * var node = tree.searchBFS(function(data){
   *  return data.key === '#greenapple';
   * });
   */
  searchBFS(criteria) {

    // Hold the node when found
    let foundNode = null;

    // Find nodes recursively
    (function expand(queue) {
      while(queue.length){
        var current = queue.splice(0, 1)[0];
        if(current.matchCriteria(criteria)){
          foundNode = current;
          return;
        }
        current._childNodes.forEach(function(_child) {
          queue.push(_child);
        });
      }
    }([this._tree._rootNode]));

    return foundNode;

  }

  /**
   * Traverses an entire tree in DFS fashion.
   *
   * @method traverseDFS
   * @memberof Traverser
   * @instance
   * @param {function} callback - Gets triggered when @{link TreeNode} is explored. Explored node is passed as parameter to callback.
   * @example
   * // Traverse DFS
   * tree.traverseDFS(function(node){
   *  console.log(node.data);
   * });
   */
  traverseDFS (callback) {
    (function recur(node) {
      callback(node);
      node._childNodes.forEach(recur);
    }(this._tree._rootNode));
  }

  /**
   * Traverses an entire tree in BFS fashion.
   *
   * @method traverseBFS
   * @memberof Traverser
   * @instance
   * @param {function} callback - Gets triggered when node is explored. Explored node is passed as parameter to callback.
   * @example
   * // Traverse BFS
   * tree.traverseBFS(function(node){
   *  console.log(node.data);
   * });
   */
  traverseBFS(callback) {
    (function expand(queue) {
      while(queue.length) {
        var current = queue.splice(0, 1)[0];
        callback(current);
        current._childNodes.forEach(function(_child) {
          queue.push(_child);
        });
      }
    }([this._tree._rootNode]));
  }
}

class TreeNode {
	constructor(data) {
		/**
     * Represents the parent node
     *
     * @property _parentNode
     * @type {object}
     * @default "null"
     */
    this._parentNode = null;

    /**
     * Represents the child nodes
     *
     * @property _childNodes
     * @type {array}
     * @default "[]"
     */
    this._childNodes = [];

    /**
     * Represents the data node has
     *
     * @property _data
     * @type {object}
     * @default "null"
     */
    this._data = data;

    /**
     * Depth of the node represents level in hierarchy
     *
     * @property _depth
     * @type {number}
     * @default -1
     */
    this._depth = -1;
	}

	parentNode() {
		return this._parentNode
	}

	childNodes() {
		return this._childNodes
	}

	data(data) {
		if(arguments.length > 0){
      this._data = data;
    } else {
      return this._data;
    }
	}

	depth() {
		return this._depth
	}

	matchCriteria(criteria) {
		return criteria(this._data)
	}

	/**
   * get sibling nodes.
   *
   * @method siblings
   * @memberof TreeNode
   * @instance
   * @return {array} - array of instances of {@link TreeNode}
   */
  siblings() {
    return !this._parentNode ? [] : this._parentNode._childNodes.filter((_child) => _child !== this);
  }

  /**
   * Gets an array of all ancestor nodes
   *
   * @method getAncestry
   * @memberof TreeNode
   * @instance
   * @return {Array} - array of ancestor nodes
   */
  getAncestry() {
    // Initialize empty array and node
    let ancestors = [],
        node = this;

    // Loop over ancestors and add them in array
    while(node.parentNode()){
      ancestors.push(node.parentNode());
      node = node.parentNode();
    }

    return ancestors;
  }

	export(criteria = (data) => data) {
		// Check if criteria is specified
    if(!criteria || typeof criteria !== 'function')
      throw new Error('Export criteria not specified');

    // Export every node recursively
    const exportRecur = (node) => {
      let exported = node.matchCriteria(criteria);
      
      if(!exported || typeof exported !== 'object'){
        throw new Error('Export criteria should always return an object and it cannot be null.');
      } else {
        exported.children = [];
        node._childNodes.forEach((_child) => {
          exported.children.push(exportRecur(_child));
        });

        return exported;
      }
    };

    return exportRecur(this);
	}
}

class Tree {
	constructor() {
		this._rootNode = null;
    this._currentNode = null;
    this._traverser = new Traverser(this)
	}

	traverser() {
		return this._traverser
	}

	searchBFS(criteria) {
		return this.traverser().searchBFS(criteria)
	}

	searchDFS(criteria) {
		return this.traverser().searchDFS(criteria)
	}

	traverseBFS(callback) {
		return this.traverser().traverseBFS(callback)
	}

	traverseDFS(callback) {
		return this.traverser().traverseDFS(callback)
	}

	isEmpty() {
		return this._rootNode === null && this._currentNode === null;
	}

	insert(data) {
    let node = new TreeNode(data);
    if(this.isEmpty()){
      node._depth = 1;
      this._rootNode = this._currentNode = node;
    } else {
      node._parentNode = this._currentNode;
      this._currentNode._childNodes.push(node);
      this._currentNode = node;
      node.depth = node._parentNode._depth + 1;
    }
    return node;
  }

  insertToNode(node, data) {
    let newNode = new TreeNode(data);
    newNode._parentNode = node;
    newNode._depth = newNode._parentNode._depth + 1;
    node._childNodes.push(newNode);
    this._currentNode = newNode;
    return newNode;
  }

  trimBranchFrom(node) {
    // trim brach recursively
    (function recur(node){
      node._childNodes.forEach(recur);
      node._childNodes = [];
      node._data = null;
    }(node));

    // Update Current Node
    if(node._parentNode){
      node._parentNode._childNodes.splice(node._parentNode._childNodes.indexOf(node), 1);
      this._currentNode = node._parentNode;
    } else {
      this._rootNode = this._currentNode = null;
    }
  }

  export(criteria) {
    // Check if rootNode is not null
    if(!this._rootNode){
      return null;
    }

    let treeData = this._rootNode.export(criteria)

    if (treeData['__root']) {
    	return treeData.children
    }

    return [treeData];
  }

	import(data, criteria = (data) => (data)) {
    // Empty all tree
    if(this._rootNode) this.trimBranchFrom(this._rootNode);

    // Set Current Node to root node as null
    this._currentNode = this._rootNode = null;

    // Import recursively
    const importRecur = (node, recurData) => {

      // Format data from given criteria
      let _data = criteria(recurData);

      // Create Root Node
      if(!node){
        node = this.insert(_data);
      } else {
        node = this.insertToNode(node, _data);
      }

      // For Every Child
      recurData.children && recurData.children.forEach((_child) => {
      	importRecur(node, _child);
      });

    }

    let treeData

    if (Array.isArray(data)) {
    	if (data.length === 1) {
    		treeData = data[0]
    	} else {
    		treeData = {__root: !0, children: data}
    	} 	
    } else {
    	treeData = data
    }

    importRecur(this._rootNode, treeData)

    // Set Current Node to root node
    this._currentNode = this._rootNode;

    return this;

  }
}

export default Tree