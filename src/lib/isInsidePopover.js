export default function isInsidePopover(node) {
    let cur = node.parentNode;
    while (cur && cur.nodeType === 1) {
      // If id starts with "fixed_wrapper", we consider it as the
      // root element of the Popover component
      if (/^fixed_wrapper/g.test(cur.id)) {
        return true;
      }
      cur = cur.parentNode;
  }
  return false;
}
