import React from 'react';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Button from 'components/Button/Button.react';
import ColumnConfigurationItem from 'components/ColumnsConfiguration/ColumnConfigurationItem.react';
import styles from 'components/ColumnsConfiguration/ColumnsConfiguration.scss';
import Icon from 'components/Icon/Icon.react';
import Popover from 'components/Popover/Popover.react';
import Position from 'lib/Position';

const POPOVER_CONTENT_ID = 'columnsConfigurationPopover';

export default class ColumnsConfiguration extends React.Component {
  constructor() {
    super();

    this.state = {
      open: false
    };
    this.toggle = this.toggle.bind(this);
    this.codeRef = React.createRef();
  }

  static getDerivedStateFromProps(props, prevState) {
    if (props.schema !== prevState.schema) {
      return {
        schema: props.schema,
        open: false
      }
    }
  }

  toggle() {
    this.setState(prevState => ({
      open: !prevState.open
    }));
  }

  showAll() {
    this.props.handleColumnsOrder(this.props.order.map(order => ({ ...order, visible: true })));
  }

  hideAll() {
    this.props.handleColumnsOrder(this.props.order.map(order => ({ ...order, visible: false })));
  }

  render() {
    const { handleColumnDragDrop, handleColumnsOrder, order } = this.props;
    const [ title, entry ] = [styles.title, styles.entry ].map((className, i) => (
      <div key={i} className={className} onClick={this.toggle}>
        <Icon name='manage-columns' width={14} height={14} />
        <span>Manage Columns</span>
      </div>
    ));

    let popover = null;
    if (this.state.open) {
      popover = (
        <Popover fixed={true} position={Position.inDocument(this.nodeRef.current)} onExternalClick={this.toggle} contentId={POPOVER_CONTENT_ID}>
          <div className={styles.popover} id={POPOVER_CONTENT_ID}>
            {title}
            <div className={styles.body}>
              <div className={styles.columnConfigContainer}>
                <DndProvider backend={HTML5Backend}>
                  {order.map(({ name, visible, ...rest }, index) => {
                    return <ColumnConfigurationItem
                      key={index}
                      index={index}
                      name={name}
                      visible={visible}
                      onChangeVisible={visible => {
                        const updatedOrder = [...order];
                        updatedOrder[index] = {
                          ...rest,
                          name,
                          visible
                        };
                        handleColumnsOrder(updatedOrder);
                      }}
                      handleColumnDragDrop={handleColumnDragDrop} />
                  })}
                </DndProvider>
              </div>
              <div className={styles.footer}>
                <Button
                  color='white'
                  value='Hide All'
                  width='85px'
                  onClick={this.hideAll.bind(this)} />
                <Button
                  color='white'
                  value='Show all'
                  width='85px'
                  onClick={this.showAll.bind(this)} />
              </div>
            </div>
          </div>
        </Popover>
      );
    }
    return (
      <React.Fragment ref={this.codeRef}>
        {entry}
        {popover}
      </React.Fragment>
    );
  }
}
