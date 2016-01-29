export default function hasAncestor(node, ancestor) {
  let cur = node.parentNode;
  while (cur && cur.nodeType === 1) {
    if (cur === ancestor) {
      return true;
    }
    cur = cur.parentNode;
  }
  return false;
}
