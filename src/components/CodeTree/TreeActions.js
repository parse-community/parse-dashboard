import $ from 'jquery'
import jstree from 'jstree';

let source = `// Some comment here
Parse.Cloud.define('hello', function(req, resp) {
  let someVariable = "<div>";
  let otherVariable = "</div>";
});`

const customMenu = node => {
  // The default set of all items
  let items = $('#tree').jstree.defaults.contextmenu.items();
  items.create.action = function (data) {
    let inst = $('#tree').jstree.reference(data.reference),
      obj = inst.get_node(data.reference);
    inst.create_node(obj, {
      type: 'folder',
      text: 'New Folder',
      state: {opened: true}
    });
  };
  items.remove.action = function (data) {
    let inst = $('#tree').jstree.reference(data.reference),
      obj = inst.get_node(data.reference);
    if (inst.is_selected(obj)) {
      inst.delete_node(inst.get_selected());
    } else {
      inst.delete_node(obj);
    }
  };
  delete items.ccp;
  if (node.type === 'default') {
    delete items.create;
    delete items.rename;
  }
  if (node.text === 'cloud' && node.parent === '#') {
    delete items.remove;
    delete items.rename;
    delete items.ccp;
  }
  if (node.text === 'public' && node.parent === '#') {
    delete items.remove;
    delete items.rename;
    delete items.ccp;
  }
  return items;
}

export const getConfig = () => {
  return {
    plugins: ['contextmenu', 'dnd', 'sort', 'types', 'unique'],
    core: {
      'data': [
        {
          "text": "Root node",
          "state": {"opened": true},
          "type": "folder",
          "children": [
            {
              "text": "main.js",
              "data": {
                "code": source
              }
            },
            {
              "text": "custom.js",
              "type": "new-file",
              "data": {
                "code": "console.log(\"Hello World !\")"
              }
            }
          ]
        }
      ]
    },
    contextmenu: {items: customMenu},
    types: {
      '#': {
        valid_children: ['folder'],
        max_children: 2
      },
      default: {
        icon: 'zmdi zmdi-file',
        max_children: 0
      },
      folder: {
        icon: 'zmdi zmdi-folder',
        max_depth: 10,
        max_children: 100
      },
      "new-folder": {
        icon: 'zmdi zmdi-folder new',
        max_depth: 10,
        max_children: 100
      },
      "new-file": {
        icon: 'zmdi zmdi-file new',
        max_children: 0
      }
    }
  }
}
