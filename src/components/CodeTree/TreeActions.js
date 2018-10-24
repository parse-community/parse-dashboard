import $ from 'jquery'
import jstree from 'jstree';

let source = []

const updateTreeContent = async (files) => {
  $('#tree').jstree(true).settings.core.data = files;
  await $('#tree').jstree(true).refresh();
}

const create = (data, file) => {
  let inst = $.jstree.reference(data),
    obj = inst.get_node(data);
  if (!file) {
    inst.create_node(obj, {
      type: 'new-folder',
      text: 'New Folder',
      state: { opened: true }
    });
  } else {
    inst.create_node(obj, {
      type: 'new-file',
      text: file.text.name,
      data: file.data
    });
  }
}

const remove = (data) => {
  let inst = $.jstree.reference(data)
  let obj = inst.get_node(data);
  if (inst.is_selected(obj)) {
    inst.delete_node(inst.get_selected());
  } else {
    inst.delete_node(obj);
  }
}

const decodeFile = code => {
  try {
    if (code) {
      let encodedCode = code.split(',')[1]
      let decodedCode = atob(encodedCode)
      code = decodedCode
    }
  } catch (err) {
    console.error(err)
  }
  return code
}

const readFile = (file, newTreeNodes) => {
  newTreeNodes.push({
    text: file.name,
    data: {
      code: file.code
    }
  })
  return newTreeNodes
}

const verifyFileNames = (data, newTreeNodes) => {
  let inst = $.jstree.reference(data)
  let currentCode = inst.get_node(data);
  for (let i = 0; i < currentCode.length; i++) {
    for (let j = 0; j < newTreeNodes.length; j++) {
      if (currentCode[i].text === newTreeNodes[j].text) {
        if (alert.confirm(newTreeNodes[j].text +
            ' file already exists. Do you want to overwrite?')) {
          currentCode.splice(i, 1);
        } else {
          newTreeNodes.splice(j, 1);
        }
      }
    }
  }
}

const getExtension = (fileName) => {
  let re = /(?:\.([^.]+))?$/
  return re.exec(fileName)[1]
}

const addFilesOnTree = (files, currentCode) => {
  let newTreeNodes = [];
  for (let i = 0; i < files.fileList.length; i++) {
    newTreeNodes = readFile({ name: files.fileList[i], code: files.base64[i] }, newTreeNodes);
  }
  let extension
  verifyFileNames(currentCode, newTreeNodes);

  newTreeNodes.forEach(node => {
    extension = getExtension(node.text.name);
    if (currentCode === '#') {
      let inst = $.jstree.reference(currentCode)
      let obj = inst.get_node(currentCode);
      if (extension === 'js') {
        currentCode += obj.children[0]
      }
      else {
        currentCode += obj.children[1]
      }
    }
    create(currentCode, node)
  })

  return currentCode;
}

const customMenu = node => {
  let items = $.jstree.defaults.contextmenu.items();
  items.create.action = function (data) {
    create(data.reference)
  };
  items.remove.action = function (data) {
    remove(data.reference)
  };
  delete items.ccp;
  if (node.type === 'default' || node.type === 'new-file') {
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

const getConfig = (files) => {
  return {
    plugins: ['contextmenu', 'dnd', 'sort', 'types', 'unique', 'changed'],
    core: {
      "check_callback": true,
      'data': files
    },
    contextmenu: {items: customMenu},
    types: {
      '#': {
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

const getFiles = () => {
  return $("#tree").jstree(true).get_json('#')
}

module.exports = {
  getConfig,
  remove,
  addFilesOnTree,
  readFile,
  getFiles,
  decodeFile,
  updateTreeContent,
  getExtension
}
