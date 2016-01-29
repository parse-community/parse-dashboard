export default class Position {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  transform(x, y) {
    return new Position(this.x + x, this.y + y);
  }

  static inDocument(node) {
    let pos = Position.inWindow(node);
    pos.x += window.pageXOffset;
    pos.y += window.pageYOffset;
    return pos;
  }

  static inWindow(node) {
    let rect = node.getBoundingClientRect();
    return new Position(rect.left, rect.top);
  }
}
