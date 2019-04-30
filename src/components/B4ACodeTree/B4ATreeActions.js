import React            from 'react';
import $                from 'jquery'
import jstree           from 'jstree';
import Swal             from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Base64 }       from 'js-base64'

// Alert parameters
const MySwal = withReactContent(Swal)
const overwriteFileModal = {
  title: 'Are you sure?',
  text: "",
  type: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#169cee',
  cancelButtonColor: '#ff395e',
  confirmButtonText: 'Yes, overwrite it!'
}

// Function used to force an update on jstree element. Useful to re-render tree
// after deploy changes
export const updateTreeContent = async (files) => {
  $('#tree').jstree(true).settings.core.data = files;
  await $('#tree').jstree(true).refresh();
}

// Create a new-node on tree
const create = (data, file) => {
  let inst = $.jstree.reference(data),
    obj = inst.get_node(data);
  if (!file) {
    return inst.create_node(obj, {
      type: 'new-folder',
      text: 'New Folder',
      state: { opened: true }
    });
  } else {
    return inst.create_node(obj, {
      type: 'new-file',
      text: file.text.name,
      data: file.data
    });
  }
}

// Remove a node on tree
const remove = (data) => {
  let inst = $.jstree.reference(data)
  let obj = inst.get_node(data);
  if (inst.is_selected(obj)) return inst.delete_node(inst.get_selected());
  else return inst.delete_node(obj);
}

// Decode base64 file content.
const decodeFile = code => {
  try {
    if (code) {
      // Expected format data:[<mediatype>][;base64],<data>
      let encodedCode = code.split(',')[1]
      let decodedCode = Base64.decode(encodedCode)
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

// Iterate over current files on the tree to verify if exist a file with the
// same name at the new files to insert and ask the user if he wants to overwrite it
const verifyFileNames = async (data, newNode) => {
  let currentCode = getFiles(data)
  currentCode = currentCode && currentCode.children

  for (let i = 0; i < currentCode.length; i++) {
    if (newNode.text && currentCode[i].text === newNode.text.name) {
      overwriteFileModal.text = currentCode[i].text + ' file already exists. Do you want to overwrite?'
      let currentId = currentCode[i].id
      // Show alert and wait for the user response
      let alertResponse = await MySwal.fire(overwriteFileModal)
      if (alertResponse.value) {
        await remove(`#${currentId}`)
      }
    }
  }
}

const getExtension = (fileName) => {
  let re = /(?:\.([^.]+))?$/
  return re.exec(fileName)[1]
}

// Function used to add files on tree.
const addFilesOnTree = async (files, currentCode) => {
  let newTreeNodes = [];
  let folder
  for (let i = 0; i < files.fileList.length; i++) {
    newTreeNodes = readFile({ name: files.fileList[i], code: files.base64[i] }, newTreeNodes);
  }

  let extension

  for (let j = 0; j < newTreeNodes.length; j++ ) {
    extension = getExtension(newTreeNodes[j].text.name);
    if (currentCode === '#') {
      let inst = $.jstree.reference(currentCode)
      let obj = inst.get_node(currentCode);

      // Select the folder to insert based on file extension. If is a js file,
      // insert on "cloud" folder, else insert on "public" folder. This logic is
      // a legacy from the old Cloud Code page
      if (extension === 'js') {
        folder = obj.children[0]
      } else {
        folder = obj.children[1]
      }
    }
    await verifyFileNames(folder, newTreeNodes[j]);
    create(`#${folder}`, newTreeNodes[j])
  }
  return currentCode;
}

// Configure the menu that is shown on right-click based on files type
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

// Return the jstree config
const getConfig = (files) => {
  if (files && files[0] && files[0].state) files[0].state.selected = true
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
        max_children: 200
      },
      "new-folder": {
        icon: 'zmdi zmdi-folder new',
        max_depth: 10,
        max_children: 200
      },
      "new-file": {
        icon: 'zmdi zmdi-file new',
        max_children: 0
      }
    }
  }
}

// Get the current files on jstree element
export const getFiles = (reference = '#') => {
  return $("#tree").jstree(true).get_json(reference)
}

export default {
  getConfig,
  remove,
  addFilesOnTree,
  readFile,
  getFiles,
  decodeFile,
  updateTreeContent,
  getExtension
}
