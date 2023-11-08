function domHasClass(el, className)
{
    if (el.classList)
        return el.classList.contains(className);
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function domAddClass(el, className)
{
    if (el.classList)
        el.classList.add(className)
    else if (!domHasClass(el, className))
        el.className += " " + className;
}

function domRemoveClass(el, className)
{
    if (el.classList)
        el.classList.remove(className)
    else if (domHasClass(el, className))
    {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}

function uiTreeSyncToggle(treeID, nodeID, args) {
  var tree = UI.components[treeID];
  if(tree) {
    tree.continueSync();
  }
}

function uiTreeNodeInserted(args) {
  var tree = UI.components[args["treeID"]];
  var nodeID = args['dragNodeID'];
  var targetNodeID = args['dropNodeID'];
  var relation = args['position'];
  tree.moveNode(nodeID, targetNodeID, relation);

//'dragNodeID': this.m_dragNode.id, 'dropNodeID': this.m_dragTargetNode.id, 'position':
}


function uiTreeNodeMouseClick(treeID, nodeID) {
  var tree = UI.components[treeID];
  tree.nodeClick(nodeID);
//  tree.selectNode(nodeID);
}

function uiTreeNodeMouseDblClick(treeID, nodeID) {
  var tree = UI.components[treeID];
  tree.nodeDblClick(nodeID);
//  tree.selectNode(nodeID);
}


function uiTreeNodeContextMenu(event, treeID, nodeID) {
  var tree = UI.components[treeID];
  tree.nodeContextMenu(nodeID, event);
  return false;
}
function uiTreeToggleNode(treeID, nodeID) {
  var tree = UI.components[treeID];

  tree.nodeToggleClick(nodeID);
}



function uiTreeNodeMouseDown(treeID, nodeID) {
  var tree = UI.components[treeID];

  tree.treeNodeMouseDown(nodeID);

//  UI.captureMouse(tree, 'default');
  return false;
}


function uiTreeNodeMouseOver(treeID, nodeID) {
  // drag code here
  var tree = UI.components[treeID];
  tree.treeNodeMouseOver(nodeID);
  return false;
}

function uiTreeNodeMouseOverRow(treeID, nodeID) {
  var tree = UI.components[treeID];
  tree.treeNodeMouseOverRow(nodeID);
  return false;
}
 

function uiTreeNodeMouseOut(treeID, nodeID) {
  var tree = UI.components[treeID];
  tree.treeNodeMouseOut(nodeID);
  return false;
}


/**
 * A Tree Node
 *
 *
 * @class UI.TreeNode
 */

UI.TreeNode = function(args) {
  
  this.m_tree = args.tree;
  this.m_treeID = this.m_tree.id + '-';
 

  if(typeof(args.id) != 'undefined') {
    this.id = args.id;
  } else {  
    this.id = this.m_tree.getNodeID();
  }
  this.m_state = 0;//-1;
  this.m_label = 'label';
  this.m_isLast = true;
  this.m_isLeaf = true;
  this.m_icon = 'file.png';
  this.m_type = 'node';
  this.m_attributes = null;
  this.m_selected = false;

  this.m_parent = null;
  
  this.m_children = new Array();

  /**
   * Get the root of the tree
   *
   * @method getDepth
   * @return {Number} The depth of the node
   */
  this.getDepth = function() {
    var depth = 0;
    var parent = this.m_parent;
    while(parent != null) {
      depth++;
      parent = parent.m_parent;
    }
    return depth;
  }

  /**
   * Get an attribute of the node
   *
   * @method getAttribute
   * @param name {String} The name of the attribute to return
   * @return {String} the value of the attribute
   */
  this.getAttribute = function(attributename) {
    if(this.m_attributes) {
      return this.m_attributes[attributename];
    }
    return null;
  }

  /**
   *  Get the parent node
   *
   *  @method getParentNode
   *  @return {Object} The parent node
   */
  this.getParentNode = function() {
    return this.m_parent;
  }

  this.getPath = function() {
    var parent = this.m_parent;

    var path = this.m_label;
    var count = 0;
    while(parent != null) {
      path = parent.m_label + '/' + path;
      parent = parent.getParentNode();

      count++;
      if(count > 100) {
        break;
      }
    }

    return path;
  }


   /**
   * Get the number of children of the node
   *
   * @method getChildCount
   * @return {Number} the value of the attribute
   */
  this.getChildCount = function() {
    return this.m_children.length;
  }

   /**
   * Get a child node by its index
   *
   * @method getChild
   * @param index {Number} The index of the child
   * @return {UI.TreeNode} The child node, or null if index is invalid
   */
  this.getChild = function(index) {
    if(index < this.m_children.length) {
      return this.m_children[index];
    }

    return null;

  }

  this.getChildByLabel = function(label) {
    for(var i = 0; i < this.m_children.length; i++) {
      if(this.m_children[i].m_label == label) {
        return this.m_children[i];
      }
    }
    return null;
  }


  this.deleteChildren = function() {
    for(var i = 0; i < this.m_children.length; i++) {
      this.m_tree.deleteNode(this.m_children[i].id);
    }
    this.m_children = [];
  }

  this.getType = function() {
    return this.m_type;
  }

  this.select = function() {
    this.m_tree.selectNode(this.id);    
  }

  this.addChild = function(args) {
    if(this.m_state == -1) {
      this.m_state = 0;
    }

    var childNodeID = 0;
    if(args.key) {
      childNodeID = args.key;
    } else {
      childNodeID = this.m_tree.getNodeID();
    }

    var node = this.m_tree.getNode(childNodeID, true);

/*
    var node = new UI.TreeNode({ tree: this.m_tree, id: childNodeID });
    this.m_tree.m_nodes['n' + childNodeID] = node;
*/
    node.m_parent = this;
    if(typeof(args.label) != 'undefined') {
      node.m_label = args.label;//.replace(/ /g, '&nbsp;');
    }
    if(typeof(args.type) != 'undefined') {
      node.m_type = args.type;
    }

    if(this.m_tree.m_iconMap[node.m_type]) {
      node.m_icon = this.m_tree.m_iconMap[node.m_type];
    } 

    if(args.attributes) {
      node.m_attributes = args.attributes;
    }

    node.m_allRead = true;
    if(typeof(args.allRead) != 'undefined') {
      node.m_allRead = args.allRead;
    }

    node.m_lockedForModeration = false;
    if(typeof(args.lockedForModeration) != 'undefined') {
      node.m_lockedForModeration = args.lockedForModeration;
    }
    if(typeof(args.isLeaf) != 'undefined') {
      node.m_isLeaf = args.isLeaf;
    }
    this.m_isLeaf = false;
    node.m_isLast = true;
    if(this.m_children.length > 0) {
      this.m_children[this.m_children.length - 1].m_isLast = false;
    }

    this.m_children[this.m_children.length] = node;

    return node; 
  }

  this.setKey = function(key) {
    this.m_tree.setNodeKey(key, this);
  }


  this.getDragHTML = function() {
    var html = '';
    var image = this.m_tree.m_imagesDir + this.m_icon;

    if(this.m_tree.m_getNodeIcon) {
      image = this.m_tree.m_getNodeIcon(this, image);
    }

//    html += '<span style="opacity: 0.9; filter:alpha(opacity=90);">';
    html += '<img width="18" height="16" style="width: 18px; height: 16px; margin: 0; padding: 0; border: 0" id="node' + this.id + 'icon" src="' + image + '"/>';
    html += '<span style="cursor: default; font-size: 12px; font-family: arial, tahoma, helvetica; position: absolute; top: 0px; padding: 2px; padding-top: 3px" >';
    html += this.m_label.replace(/ /g, '&nbsp;');
    html += '</span>';
//    html += '</span>';
    return html;
  }


  this.getHTML = function() {
    var html = '';
    var treeID = this.m_tree.id + '-';

    html += '<div id="' + treeID + 'n' + this.id + '" onmousedown="return false" onselectstart="return false">';

    var height = 16;
    if(this.id == 0) {
      height = 2;
    }
    html += '<div id="' + treeID + 'node' + this.id + 'row" style="height: ' + height + 'px; padding: 2px 0 4px 0; position: relative" ';
      html += ' class="ui-tree-row" onmouseover="uiTreeNodeMouseOverRow(\'' + this.m_tree.id + '\',' + this.id + ')" ';
      html += '  onclick="uiTreeNodeMouseClick(\'' + this.m_tree.id + '\',' + this.id + ')" ';
      html += ' ondblclick="uiTreeNodeMouseDblClick(\'' + this.m_tree.id + '\',' + this.id + ')" ';
      html += ' oncontextmenu="return uiTreeNodeContextMenu(event, \'' + this.m_tree.id + '\',' + this.id + ')" '
      html += ' onselectstart="return false">';
    html += this.getNodeHTML();
    html += '</div>';
    if(this.m_state == 1) {
      html += '<div id="' + treeID + 'node' + this.id + 'children" onmousedown="return false" onselectstart="return false">';
    } else {
      html += '<div id="' + treeID + 'node' + this.id + 'children" style="display: none" onmousedown="return false" onselectstart="return false">';
    }

    for(var i = 0; i < this.m_children.length; i++) {
      html += this.m_children[i].getHTML();
    }

    html += '</div>';

    html += '</div>';

    return html;
  }

  this.redraw = function() {
    if(this.id > 0) {
      var html = this.getNodeHTML();
      $('#' + this.m_tree.id + '-node' + this.id + 'row').html(html);
    }
    if(this.m_state == 1) {
      if(this.m_children.length == 0) {
        $('#' + this.m_tree.id + '-node' + this.id + 'children').hide();
        this.m_state = 0;
      } 
      for(var i = 0; i < this.m_children.length; i++) {
        this.m_children[i].redraw();
      }

    }

  }


  this.getNodeHTML = function() {
    var html = '';
    var treeID = this.m_tree.id + '-';

    if(this.m_parent != null) {
      var parent = this.m_parent;
      var image = '';

      while(parent.m_parent != null) {
        /*
        if(parent.m_isLast) {
          image = 'blank.gif';
        } else {
          image = 'line.gif';
        }
        image = this.m_tree.m_imagesDir + image;
        html = '<img width="18" height="16" onmousedown="return false" onselectstart="return false" style="width: 18px; height: 16px; margin: 0; padding: 0; border: 0" src="' + image + '">' + html;        

        */
        if(parent.m_type != 'folder') {
          html = '<div style="width: 10px; height: 16px; margin: 0; padding:0; border: 0; display: inline-block"></div>' + html;
        } else {
          html = '<div style="width: 10px; height: 16px; margin: 0; padding:0; border: 0; display: inline-block"></div>' + html;
        }
        parent = parent.m_parent;
      }

      if(this.m_state == -1 || this.m_state == 0) {
        image = this.m_tree.m_imagesDir + 'plus';
      } else {
        image = this.m_tree.m_imagesDir + 'minus';
      }

      /*
      if(this.m_isLast) {
        if(this.m_isLeaf) {
          image = this.m_tree.m_imagesDir + 'joinbottom.gif';
        } else {
          image = this.m_tree.m_imagesDir + image + 'bottom.gif';
        }
      } else {
        if(this.m_isLeaf) {
          image = this.m_tree.m_imagesDir + 'join.gif';
        } else {
          image = this.m_tree.m_imagesDir + image + '.gif';
        }
      }
      */

      image += '.png';
      html += '<div style="display: inline-block; width: 2px; height: 16px;">';
      html += '</div>';

      if(this.m_type == 'folder') {

        html += '<div style="display: inline-block; width: 16px; height: 16px;">';
        if(this.m_isLeaf) {
  //        html += '';
//          html += '<a href="javascript: uiTreeToggleNode(\'' + this.m_tree.id + '\',' + this.id + ')">';
          html += '<img class="ui-tree-toggle" width="8" height="8"  onmousedown="return false" onselectstart="return false" src="' + image + '" id="' + treeID + 'node' + this.id + 'toggle" style="margin: 0; padding: 2px 4px 2px 4px; border: 0; width: 8px; height: 8px" border="0"/>';
//          html += '</a>';
        } else {
//          html += '<a href="javascript: uiTreeToggleNode(\'' + this.m_tree.id + '\',' + this.id + ')">';
          html += '<img  class="ui-tree-toggle" width="8" height="8" onmousedown="return false" onselectstart="return false" src="' + image + '" id="' + treeID + 'node' + this.id + 'toggle" style="margin: 0; padding: 2px 4px 2px 4px; border: 0; width: 8px; height: 8px" border="0"/>';
//          html += '</a>';
        }
        html += '</div>';
      } else {
        html += '<div style="display: inline-block; width: 4px; height: 16px;">';
        html += '</div>';

      }

      image = this.m_tree.m_imagesDir + this.m_icon;

      if(this.m_tree.m_getNodeIcon) {
        image = this.m_tree.m_getNodeIcon(this, image);
      }

      var customIcon = this.m_tree.trigger('getnodeicon', this, image);
      if(typeof(customIcon) != 'undefined' && customIcon) {
        image = customIcon;
        if(image.indexOf('/') != 0) {
          image = this.m_tree.m_imagesDir + image;
        }
      }


      // html for the icon

      if(this.m_type !== 'folder') {
        html += '<div style="display: inline-block; width: 16px; height: 16px">';
        html += '<img class="ui-tree-icon" height="14" style="height: 14px; margin: 0; padding: 0; border: 0" id="' + treeID + 'node' + this.id + 'icon" src="' + image + '"  onmouseover="uiTreeNodeMouseOver(\'' + this.m_tree.id + '\',' + this.id + ')" onmouseout="uiTreeNodeMouseOut(\'' + this.m_tree.id + '\',' + this.id + ')" onmousedown="return uiTreeNodeMouseDown(\'' + this.m_tree.id + '\','  + this.id + ')" onselectstart="return false"/>';
        html += '</div>';
      }

      // html for the label
      var colour = 'black';
//      if(this.m_tree.m_selectedGuid == this.id) {
      if(this.m_selected) {
//        backgroundColour = '#009';
        //colour = 'white';
      }
      var label = String(this.m_label);
      if(this.m_tree.m_getNodeLabel) {
        label = this.m_tree.m_getNodeLabel(this, label);
      }

      label = label.replace(/ /g, '&nbsp;');

      var customLabel = this.m_tree.trigger('getnodelabel', this, label);
      if(typeof(customLabel) != 'undefined') {
        label = customLabel;
      }

      var padding = 3;
      html += '<div ';
      if(this.m_type == 'folder') {
//        html += ' ondblclick="uiTreeToggleNode(\'' + this.m_tree.id + '\',' + this.id + ')" ';
      }
      html += ' class="ui-tree-label" id="' + treeID + 'node' + this.id + 'label" style="white-space:nowrap; margin-left: 1px;border: 0px solid black; cursor: default; position: absolute; bottom: ' + padding + 'px; display: inline; font-size: 12px; font-family: arial, tahoma, helvetica;" onmouseover="uiTreeNodeMouseOver(\'' + this.m_tree.id + '\',' + this.id + ')" onmouseout="uiTreeNodeMouseOut(\'' + this.m_tree.id + '\',' + this.id + ')" onmousedown="return uiTreeNodeMouseDown(\'' + this.m_tree.id + '\','  + this.id + ')" onselectstart="return false">';
      html += label;
      html += '</div>';
      
    }
    return html;
  }

  this.setLabel = function(label) {
  }

  this.setSelected = function(selected) {
    this.m_selected = selected;
    var nodeRowElement = document.getElementById(this.m_treeID + 'node' + this.id + 'row');
    var nodeLabelElement = document.getElementById(this.m_treeID + 'node' + this.id + 'label');
    if(nodeLabelElement) {
      if(selected) {
        //nodeRowElement.style.backgroundColor = '#cccccc';//'#2266aa';//'#aaaaaa';
        //nodeLabelElement.style.color = '#111111';
        domAddClass(nodeRowElement, 'ui-tree-selected-row');
      } else {
//        nodeRowElement.style.backgroundColor = '#ffffff';
//        nodeLabelElement.style.color = '#000000';
        domRemoveClass(nodeRowElement, 'ui-tree-selected-row');
      }
    }

  }

  this.refreshChildren = function() {

    var html = '';
    for(var i = 0; i < this.m_children.length; i++) {
      html += this.m_children[i].getHTML();
    }
//      $('#' + node.m_treeID + 'node' + node.id + 'children').html(html);

    var childrenElement = document.getElementById( this.m_treeID + 'node' + this.id + 'children');
    childrenElement.innerHTML = html;
  }
  /*
  this.reload = function() {
    var query = this.m_query;
    query["Path"] = this.m_attributes["__guid"];
    
    var node = this;
    g_wtuiClient.FindNodes(query, function(data) {
      eval(data);

      if(typeof(wtNodeResults) != 'undefined') {
        node.m_label = wtNodeResults[0].m_name;
        node.m_type = wtNodeResults[0].m_type;
        node.m_isLeaf = wtNodeResults[0].m_isLeaf;
        node.m_attributes = wtNodeResults[0].m_attributes;
        node.m_allRead = wtNodeResults[0].m_allRead;
        node.m_lockedForModeration = wtNodeResults[0].__lockedForModeration;
        var nodeHTML = node.getNodeHTML();
        $('#' + node.m_tree.id + '-' + 'node' + node.id + 'row').html(nodeHTML);
      }
    });
  }

  this.reloadChildren = function() {
    this.loadChildren();
  }

  this.loadChildren = function(args, callback, callbackArgs) {


    this.m_children = new Array();
//    $('#' + this.m_treeID + 'node' + this.id + 'children').empty();

    var loadingIcon = this.m_tree.m_imagesDir + 'loading.gif';
    var iconElement = document.getElementById(this.m_treeID + 'node' + this.id + 'icon');

    if(iconElement) {
      iconElement.src = loadingIcon;
    }

    var query = new Object();

    if(this.id == 0) {
      query["Path"] = this.m_tree.m_rootPath;
    } else {
      query["Path"] = this.m_attributes["__guid"] + "/*";
    }

    query["Node Type"] = '';

       
    var customQuery = this.m_tree.onLoadChildren(this); 
    if(customQuery) {
      query = customQuery;
    }

    var node = this;
    g_wtuiClient.FindNodes(query, function(data) {
      if(iconElement) {
        iconElement.src = node.m_tree.m_imagesDir + node.m_icon;
      }
      eval(data);

      if(typeof(wtNodeResults) != 'undefined' && wtNodeResults) {
      for(var i = 0; i < wtNodeResults.length; i++) {
        var childNode = node.addChild({ "label": wtNodeResults[i].m_name, "type": wtNodeResults[i].m_type, "isLeaf": wtNodeResults[i].m_isLeaf, "attributes": wtNodeResults[i].m_attributes, "key": wtNodeResults[i].m_attributes["__guid"], "allRead": wtNodeResults[i].m_allRead, "lockedForModeration": wtNodeResults[i].__lockedForModeration });
        childNode.m_query = query;
      }
      }

      html = '';
      for(var i = 0; i < node.m_children.length; i++) {
        html += node.m_children[i].getHTML();
      }
//      $('#' + node.m_treeID + 'node' + node.id + 'children').html(html);

      var childrenElement = document.getElementById( node.m_treeID + 'node' + node.id + 'children');
      childrenElement.innerHTML = html;

      if(node.id == 0) {
        node.m_tree.onLoad();
      } 

      $('#' + node.m_treeID + 'node' + node.id + 'row').html(node.getNodeHTML());
      if(callback) {
        callback(node.m_tree.id, node.id, callbackArgs);
      }
      node.m_tree.onChildrenLoaded(node, args);


      if(node.id == 0) {
        if(node.getChildCount() == 1) {
          var child = node.getChild(0);
          if(child && child.m_state == -1) {
//            child.toggle();
          }
        }
      }

       
    });

  }
*/
  this.setDropHighlight = function(highlight) {
    var nodeLabelElement = document.getElementById(this.m_treeID + 'node' + this.id + 'label');
    if(nodeLabelElement) {
      if(highlight) {
        nodeLabelElement.style.backgroundColor = '#555';
        nodeLabelElement.style.color = '#fff';
      } else {
        nodeLabelElement.style.backgroundColor = '#fff';
        nodeLabelElement.style.color = '#000';
      }
    }

/*
    if(highlight) {
    } else {
    }
*/

  }


   /**
   * Toggle the state of a node
   *
   * @method toggle
   */

  this.toggle = function(toggleCallback, callbackArgs) {

    var childrenElement = document.getElementById(this.m_treeID + 'node' + this.id + 'children');

    if(childrenElement == null) {
      return;

    }

    if(this.m_state == -1) { 
      this.m_state = 1;
      childrenElement.style.display = '';
      this.loadChildren({}, toggleCallback, callbackArgs);
    } else if(this.m_state == 0) {
      this.m_state = 1;
      childrenElement.style.display = '';
      this.m_state = 1;
      if(toggleCallback) {
        toggleCallback(this.m_tree.id, this.id, callbackArgs);
      }
    } else if(this.m_state == 1) {
      childrenElement.style.display = 'none';
      this.m_state = 0;
      if(toggleCallback) {
        toggleCallback(this.m_tree.id, this.id, callbackArgs);
      }
    }

    var toggleElement = document.getElementById(this.m_treeID + 'node' + this.id + 'toggle');

    if(toggleElement) {
      var image = 'plus';
      if(this.m_state == -1 || this.m_state == 0) {
        image = 'plus';
      } else {
        image = 'minus';
      }

/*
      if(this.m_isLast) {
        if(this.m_isLeaf) {
          image = this.m_tree.m_imagesDir + 'joinbottom.gif';
        } else {
          image = this.m_tree.m_imagesDir + image + 'bottom.gif';
        }
      } else {
        if(this.m_isLeaf) {
          image = this.m_tree.m_imagesDir + 'join.gif';
        } else {
          image = this.m_tree.m_imagesDir + image + '.gif';
        }
      }
*/
      image += '.png';

      toggleElement.src = this.m_tree.m_imagesDir + image;
    }



  }



  
}



/**
 * A Tree
 *
 *
 * @class UI.Tree
 */

UI.Tree = function(args) {

  /** 
   * The tag for creating a tree
   *
   *
   * @method &lt;wtui:tree/&gt;
   * @tag
   * @param root {String} The path to the root of the tree
   */
  this.init = function(args) {
    this.m_args = args;
    this.m_nodeIDs = 0;


    this.m_selectedNodeID = -1;
    this.m_nodes = new Object();
    this.m_nodeKeys = new Object();

//  this.m_nodes[0] = new uiTreeNode(this, 0, -1, "root", '', -1, 0);


    this.m_rootPath = '/*';
    if(args.root) {
      this.m_rootPath = args.root;
    }

    this.m_imagesDir = 'images/tree/';//'/wtv2/include/images/tree/';//args['imagesdir'];
    this.m_iconMap = new Object();
    this.m_iconMap[''] =  'folderclosed.png';
    this.m_iconMap['folder'] =  'folderclosed.png';
    this.m_iconMap['Template'] =  'document.gif';
    this.m_iconMap['Contact'] =  'user.gif';
    this.m_iconMap['Page'] =  'file.png';

    this.m_iconMap['color palette'] =  'file.png';
    this.m_iconMap['tile set'] =  'file.png';
    this.m_iconMap['graphic'] =  'file.png';
    this.m_iconMap['music'] =  'file_type_package.svg';
    this.m_iconMap['asm'] =  'file_type_wasm.svg';
    this.m_iconMap['bin'] =  'file_type_binary.svg';
    this.m_iconMap['js'] =  'file_type_js.svg';
    this.m_iconMap['json'] =  'file_type_json.svg';
    this.m_iconMap['prg'] =  'file_type_binary.svg';


    this.m_rootNode = this.getNode(this.getNodeID(), true);
    this.m_rootNode.m_state = -1;
    this.m_parent = null;

    this.m_isControl = false;
    if(args.uicontrol) {
      this.m_isControl = args.uicontrol;
    }

    this.m_name = this.id;
    if(args.name) {
      this.m_name = args.name;
    }

    this.m_canDrag = true;

    if(typeof(args.candrag) != 'undefined') {
      if(args.candrag === false) {
        this.m_canDrag = false;
      } else {
        this.m_canDrag = args.candrag;
      }
    }


   // UI.registerDropTarget(this);
  } 

  this.setRoot = function(path) {
    this.m_nodeIDs = 0;

    this.m_selectedNodeID = -1;
    this.m_nodes = new Object();
    this.m_nodeKeys = new Object();

    this.m_rootPath = '/*';
    if(path && path != "") {
      this.m_rootPath = path;
    }
   
    this.m_rootNode = this.getNode(this.getNodeID(), true);
    this.m_rootNode.m_state = -1;
    this.m_parent = null;


    this.load();
     
  }

  this.getNode = function(nodeID, createIfNotFound) {

    if(!this.m_nodes['n' + nodeID]) {
      if(createIfNotFound) {
        this.m_nodes['n' + nodeID] = new UI.TreeNode({ tree: this, id: nodeID });
      } else {
        return null;
      }
    } 

    return this.m_nodes['n' + nodeID];
  }

  this.getNodeID = function() {
    return this.m_nodeIDs++; 
  }

  this.setNodeKey = function(key, node) {
    this.m_nodeKeys[key] = node;
  }

  this.getNodeFromKey = function(key) {
    if(this.m_nodeKeys.hasOwnProperty(key)) {
      return this.m_nodeKeys[key];
    }
    return null;    
  }

  this.getNodeFromPath = function(path) {
    var pathParts = path.split('/');
    var node = this.m_rootNode;
    for(var i = 0; i < pathParts.length; i++) {
      if(pathParts[i] != '') {
        node = node.getChildByLabel(pathParts[i]);
        if(node == null) {
          return null;
        }
      }
    }

    return node;
  }


  this.load = function() {
    var root = this.getRootNode();
    if(root.m_state != 1) {
      root.toggle();
    }

  }


  /**
   * Get the root of the tree
   *
   * @method getRootNode 
   * @return {UI.TreeNode} A UI.TreeNode object
   */

  this.getRootNode = function() {
    return this.m_rootNode;
  }


  this.continueSync = function() {
    if(this.m_syncpath != '') {
      this.sync(this.m_syncpath);
    }
  }

  this.sync = function(guidpath) {
    this.m_syncpath = guidpath;
    var pathParts = guidpath.split("/");
    if(pathParts.length > 0) {
      var node = this.m_nodes['n0'];
      for(var i = 0; i < pathParts.length; i++) {
        if(pathParts[i] != '') {

          if(node.m_state != 1) {
            var args = new Array();
            args['guidpath'] = guidpath;
            node.toggle(uiTreeSyncToggle, args);
            return;
          }
          node = this.m_nodes['n' + pathParts[i]];
          if(typeof(node) == 'undefined') {
//            alert("WTUITree: sync failed, node " + pathParts[i] + " not found. guidpath = (" + guidpath + ")");
            return;
          }
          if(i == pathParts.length - 1) {
            var onnodeselected = this.m_onnodeselected;
            this.m_onnodeselected = null;
            this.selectNode(node.id);
            this.m_onnodeselected = onnodeselected;
          }
        }
      }
    }
  }


  /**
   * This event is fired just before a node's children are loaded
   *
   * @event loadchildren
   * @param node {UI.TreeNode} The node who's children are bring loaded
   * @return {Object} Return the query to be used to load children, or false to use the default query
   */
  this.onLoadChildren = function(node) {
    return this.trigger('loadchildren', node);
  }

  this.onChildrenLoaded = function(node, args) {
    return this.trigger('childrenloaded', node, args);
  }

  /**
   * This event is fired when the root node's children are loaded
   *
   * @event load
   */
  this.onLoad = function() {
    return this.trigger('load');
  }


  this.getHTML = function() {
    var html = '';

    /*
    if(this.m_isControl) {
      html += '<div id="' + this.id + '" class="ui-tree" style="width: 300px; height: 300px; overflow-x: auto; overflow-y: auto;  padding: 5px; margin: 0px;"  onmousedown="return false" onselectstart="return false">';
      html += '<input type="hidden" name="' + this.m_name + '" id="' + this.id + 'value"/>';
      
    } else {
    }
    */
    html += '<div id="' + this.id + '" class="ui-tree" style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; overflow-x: auto; overflow-y: auto; padding: 0px; margin: 0px; border: 0px solid black"  onmousedown="return false" onselectstart="return false">';
    html += this.m_rootNode.getHTML();
    html += '</div>';
    
    var tree = this;
    UI.on('ready', function() {
      if(tree.m_rootPath != "-1") {
        tree.load();
      } else {
        tree.trigger("ready");
      }
    });
    return html;
  }

  this.nodeToggleClick = function(nodeID) {
    if(typeof(nodeID) == 'object' && nodeID.id) {
      nodeID = nodeID.id;
    }
    if(nodeID >= 0) {
      this.trigger('nodetoggleclick', this.m_nodes['n' + nodeID]);      
    }    
  }
  
  this.nodeContextMenu = function(nodeID, event) {
    if(typeof(nodeID) == 'object' && nodeID.id) {
      nodeID = nodeID.id;
    }
    if(nodeID >= 0) {
      this.trigger('nodecontextmenu', this.m_nodes['n' + nodeID], event);      
    }    
  }
  this.nodeClick = function(nodeID) {
    if(typeof(nodeID) == 'object' && nodeID.id) {
      nodeID = nodeID.id;
    }
    if(nodeID >= 0) {
      this.trigger('nodeclick', this.m_nodes['n' + nodeID]);      
    }

  }

  this.nodeDblClick = function(nodeID) {
    if(typeof(nodeID) == 'object' && nodeID.id) {
      nodeID = nodeID.id;
    }
    if(nodeID >= 0) {
      this.trigger('nodedblclick', this.m_nodes['n' + nodeID]);      
    }

  }
  /**
   * This event is fired when a node is selected
   *
   * @event selectnode
   * @param node {UI.TreeNode} The node that was selected
   */
  this.selectNode = function(nodeID) {
    if(typeof(nodeID) == 'object' && nodeID.id) {
      nodeID = nodeID.id;
    }
    if(nodeID >= 0) {
      if(true) { //this.m_selectedNodeID != nodeID) {
        if(this.m_nodes['n' + nodeID]) {
          this.m_nodes['n' + nodeID].setSelected(true);
        }
        if(this.m_selectedNodeID != nodeID && this.m_selectedNodeID != -1 && this.m_nodes['n' + this.m_selectedNodeID]) {
          this.m_nodes['n' + this.m_selectedNodeID].setSelected(false);
        }
        this.m_selectedNodeID = nodeID;
        this.trigger('nodeselect', this.m_nodes['n' + nodeID]);
        if(this.m_isControl) {
          $('#' + this.id + 'value').val(this.m_nodes['n' + nodeID].id);
        }

      }
    }
  }

  this.deleteNode = function(nodeID) {
    if(nodeID > 0) { 
      $('#' + this.id + '-' + 'n' + nodeID).remove();
      this.m_nodes['n' + nodeID] = null;
    }
  }



  this.m_inDrag = false;
  this.m_dragTargetNode = null;
  this.m_dragTargetElement = null;
  this.m_dragTargetRow = null;
  this.m_dragTargetPosition = 0;
  this.m_dragNode = null;

  this.m_mouseDownX = 0;
  this.m_mouseDownY = 0;


  this.treeNodeMouseDown = function(nodeID) {
    this.m_mouseDownX = UI.mouseX;
    this.m_mouseDownY = UI.mouseY;
    this.m_dragNode = this.m_nodes['n' + nodeID];

    if(this.m_canDrag) {
      UI.startDrag(this, this.m_dragNode.getDragHTML(), 12, 0);
    }
  }

  this.treeNodeMouseOverRow = function(nodeID) {

//    if(this.m_inDrag) {
    if(UI.m_inDrag) {
      if(this.m_dragTargetElement == null) {
        var mouseX = UI.mouseX;
        var mouseY = UI.mouseY;


        var rowID = this.id + '-' + 'node' + nodeID + 'row';
        var targetRow = document.getElementById(rowID);
        var position = $('#' + rowID).offset();

        if(position == null) {
          return;
        }
        
        var offset = mouseY - position.top;

        if(offset > 8) {
          if(this.m_dragTargetRow != targetRow || this.m_dragTargetPosition != 1) {
            if(this.m_dragTargetRow != null) {
              this.m_dragTargetRow.style.border = '0px';
            }
            this.m_dragTargetRow = targetRow;
            this.m_dragTargetPosition = 1;
            this.m_dragTargetRow.style.borderBottom = '1px dotted black';
          }
        } else {
          if(this.m_dragTargetRow != targetRow || this.m_dragTargetPosition != -1) {
            if(this.m_dragTargetRow != null) {
              this.m_dragTargetRow.style.border = '0px';
            }
            this.m_dragTargetRow = targetRow;
            this.m_dragTargetPosition = -1;
            this.m_dragTargetRow.style.borderTop = '1px dotted black';
          }

        }
        this.m_dragTargetNode = this.m_nodes['n' + nodeID];

      } else {
        if(this.m_dragTargetRow != null) {
          this.m_dragTargetRow.style.border = '0px';
        }
      }
    } 
  }

  this.treeNodeMouseOver = function(nodeID) {
    if(UI.m_inDrag) {
//    if(this.m_inDrag) {
     var node = this.m_nodes['n' + nodeID]; 

     if(this.m_dragTargetNode != null) {// && this.m_dragTargetNode.id != node.id) {
       this.m_dragTargetNode.setDropHighlight(false);
       this.m_dragTargetElement = null;
     }
     if(node) {
       this.m_dragTargetNode = node;
       this.m_dragTargetPosition = 0;
       this.m_dragTargetElement = document.getElementById(this.id + '-node' + nodeID + 'label');
       node.setDropHighlight(true);
     }
//      alert('drag');
    }
  }

  this.treeNodeMouseOut = function(nodeID) {
//    if(this.m_inDrag) {
     if(UI.m_inDrag) {
      var node = this.m_nodes['n' + nodeID];
      if(this.m_dragTargetNode != null) {// && this.m_dragTargetNode.id != node.id) {
       this.m_dragTargetNode.setDropHighlight(false);
       this.m_dragTargetElement = null;
     }

      if(node) {
        node.setDropHighlight(false);
        this.m_dragTargetNode = null;
        this.m_dragTargetElement = null;
      }
    }
  }


  this.m_mouseInComponent = false;

  this.mouseMove = function() {


    if(UI.m_inDrag) {

      var offset = $('#' + this.id).offset();
      var width = $('#' + this.id).width();
      var height = $('#' + this.id).height();
      var mouseX = UI.mouseX;
      var mouseY = UI.mouseY;


      if(mouseX >= offset.left && mouseX <= offset.left + width &&
         mouseY >= offset.top && mouseY <= offset.top + height) {

        if(!this.m_mouseInComponent) {
          // remove the overlay, so the nodes will get the mouse events
          $('#mousecapture').remove();
          this.m_mouseInComponent = true;
        }

      } else {
        if(this.m_mouseInComponent) {
          // mouse has left the component, cancel any drops

          if(this.m_dragTargetNode != null) {
            this.m_dragTargetNode.setDropHighlight(false);
            this.m_dragTargetNode = null;
          }
          if(this.m_dragTargetRow != null) {
            this.m_dragTargetRow.style.border = '0px';
          }

          $('#wtui').append('<div id="mousecapture" style=" position: absolute; top: 0; left: 0; bottom: 0; right: 0; z-index: 10000; "></div>');
          this.m_mouseInComponent = false;
        }
      }


    }

/*
    var mouseX = UI.mouseX;
    var mouseY = UI.mouseY;

    if(!this.m_inDrag) {
      this.m_inDrag = true;
      $('#wtui_dragcomponent').html(this.m_dragNode.getDragHTML());
      $('#wtui_dragcomponent').show();
    }

    mouseX += 12;
    $('#wtui_dragcomponent').css('left', mouseX + 'px');
    $('#wtui_dragcomponent').css('top', mouseY + 'px');
    

    // check if they are trying to insert between
    if(this.m_dragTargetNode == null) {
    }
*/

  }

  this.mouseUp = function() {

    this.m_mouseInComponent = false;
//    if(this.m_inDrag) {
    if(UI.m_inDrag) {

      if(this.m_dragTargetNode != null) {
        var dragOK = true;
        var parent = this.m_dragTargetNode;
        // make sure node is not dragged onto itself or children
        while(parent != null) {
          if(parent == this.m_dragNode) {
         //   alert('bad drag');
            dragOK = false;
          } 
          parent = parent.getParentNode();
        }
       
        if(dragOK) { 
          var args = { treeID: this.id, 'dragNodeID': this.m_dragNode.id, 'dropNodeID': this.m_dragTargetNode.id, 'position': this.m_dragTargetPosition };
          g_wtuiClient.Insert(this.m_dragNode.id, this.m_dragTargetNode.id, this.m_dragTargetPosition, uiTreeNodeInserted, args );
        }
        
      }
      if(this.m_dragTargetNode != null) {
        this.m_dragTargetNode.setDropHighlight(false);
        this.m_dragTargetNode = null;
      }
      if(this.m_dragTargetRow != null) {
        this.m_dragTargetRow.style.border = '0px';
      }

      this.m_inDrag = false;
      $('#wtui_dragcomponent').hide();
    }

    UI.releaseMouse();
  }

  this.moveNode = function(nodeID, targetNodeID, relation) {
    var node = this.m_nodes['n' + nodeID];
    if(!node) {
      return false;
    }
    var nodeElement = document.getElementById(this.id + '-n' + nodeID);
    var oldParentNode = node.getParentNode();
    var oldParentChildrenElement = document.getElementById(this.id + '-node' + oldParentNode.id + 'children');
    

    var newParentNode = this.m_nodes['n' + targetNodeID];
    
    
    if(relation == 0) {
      // add as a child
      var newParentNode = this.m_nodes['n' + targetNodeID];
      var newParentChildrenElement = document.getElementById(this.id + '-node' + targetNodeID + 'children');
      if(newParentNode.m_state >= 0) {
        newParentChildrenElement.appendChild(nodeElement);
      } else {
        oldParentChildrenElement.removeChild(nodeElement);
      }
      newParentNode.m_isLeaf = false;
      node.m_parent = newParentNode;

      for(var i = 0; i < oldParentNode.m_children.length; i++) {
        if(oldParentNode.m_children[i].id == node.id) {
          oldParentNode.m_children.splice(i, 1);
          break;
        }
      }
      newParentNode.m_children.push(node);
    } else {
      var targetNode = this.m_nodes['n' + targetNodeID];
      var targetElement = document.getElementById(this.id + '-n' + targetNodeID);
      newParentNode = targetNode.getParentNode();
      var newParentChildrenElement = document.getElementById(this.id + '-node' + newParentNode.id + 'children'); 

      if(relation == -1) {
        newParentChildrenElement.insertBefore(nodeElement, targetElement);
      } else if(relation == 1) {
        if(targetElement.nextSibling) {
          newParentChildrenElement.insertBefore(nodeElement, targetElement.nextSibling);
        } else {
          newParentChildrenElement.appendChild(node);
        }
      }

      node.m_parent = targetNode.m_parent;
      for(var i = 0; i < oldParentNode.m_children.length; i++) {
        if(oldParentNode.m_children[i].id == node.id) {
          oldParentNode.m_children.splice(i, 1);
          break;
        }
      }

      for(var i = 0; i < newParentNode.m_children.length; i++) {
        if(newParentNode.m_children[i].id == targetNodeID) {
          if(relation == -1) {
            newParentNode.m_children.splice(i, 0, node);
          } else {
            newParentNode.m_children.splice(i + 1, 0, node);
          }
          break;
        }
      }
    }

    if(oldParentNode) {
      if(oldParentNode.m_children.length == 0) {
        oldParentNode.m_isLeaf = true;
      }

      for(var i = 0; i < oldParentNode.m_children.length; i++) {
        oldParentNode.m_children[i].m_isLast = i == oldParentNode.m_children.length - 1;
      }

      oldParentNode.redraw();
    }

    if(newParentNode && newParentNode != oldParentNode) {

      for(var i = 0; i < newParentNode.m_children.length; i++) {
        newParentNode.m_children[i].m_isLast = i == newParentNode.m_children.length - 1;
      }
      newParentNode.redraw();
      
    }
    if(newParentNode.m_state != 1) {
      newParentNode.toggle();
    }

    this.trigger('nodemoved', node, oldParentNode, newParentNode, relation);

  }


  /**
   * <p>Get the selected node, return null if no node selected</p>
   *
   * @method getSelectedNode
   * @returns {UI.TreeNode} The selected node, or null if no node selected
   *
   */
   this.getSelectedNode = function() {
     if(this.m_selectedNodeID < 0) {
       return null;
     }    
     return this.m_nodes['n' + this.m_selectedNodeID];
   }
}
UI.registerComponentType("UI.Tree", UI.Tree);