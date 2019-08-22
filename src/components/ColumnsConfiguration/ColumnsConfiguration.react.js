import React from 'react';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import ReactDOM from 'react-dom';

import Button from 'components/Button/Button.react';
import ColumnConfigurationItem from 'components/ColumnsConfiguration/ColumnConfigurationItem.react';
import styles from 'components/ColumnsConfiguration/ColumnsConfiguration.scss';
import Icon from 'components/Icon/Icon.react';
import Popover from 'components/Popover/Popover.react';
import Position from 'lib/Position';

export default class ColumnsConfiguration extends React.Component {
  constructor() {
    super();

    this.state = {
      open: false
    };
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
  }

  componentWillReceiveProps(props) {
    if (props.schema !== this.props.schema) {
      this.setState({
        open: false
      });
    }
  }

  toggle() {
    this.setState({
      open: !this.state.open
    })
  }

  showAll() {
    this.props.handleColumnsOrder(this.props.order.map(order => ({ ...order, visible: true })));
  }

  hideAll() {
    this.props.handleColumnsOrder(this.props.order.map(order => ({ ...order, visible: false })));
  }

  render() {
    const { handleColumnDragDrop, handleColumnsOrder, order } = this.props;
    const [ title, entry ] = [styles.title, styles.entry ].map(className => (
      <div className={className} onClick={this.toggle.bind(this)}>
        <Icon name='manage-columns' width={14} height={14} />
        <span>Manage Columns</span>
      </div>
    ));

    let popover = null;
    if (this.state.open) {
      popover = (
        <Popover fixed={true} position={Position.inDocument(this.node)} onExternalClick={this.toggle.bind(this)}>
          <div className={styles.popover}>
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
      <>
        {entry}
        {popover}
      </>
    );
  }
}
