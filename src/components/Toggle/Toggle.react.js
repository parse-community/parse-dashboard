/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import fieldStyles from 'components/Field/Field.scss';
import PropTypes from 'lib/PropTypes';
import React from 'react';
import styles from 'components/Toggle/Toggle.scss';
import baseStyles from 'stylesheets/base.scss';

export default class Toggle extends React.Component {
  toLeft() {
    if (this.props.type === Toggle.Types.TWO_WAY || this.props.type === Toggle.Types.CUSTOM) {
      this.props.onChange(this.props.optionLeft);
    } else {
      this.props.onChange(false);
    }
  }

  toRight() {
    if (this.props.type === Toggle.Types.TWO_WAY || this.props.type === Toggle.Types.CUSTOM) {
      this.props.onChange(this.props.optionRight);
    } else {
      this.props.onChange(true);
    }
  }

  toggle() {
    if (this.props.type === Toggle.Types.TWO_WAY || this.props.type === Toggle.Types.CUSTOM) {
      if (this.props.value === this.props.optionLeft) {
        this.props.onChange(this.props.optionRight);
      } else {
        this.props.onChange(this.props.optionLeft);
      }
    } else {
      this.props.onChange(!this.props.value);
    }
  }

  render() {
    const type = this.props.type;
    let labelLeft = '';
    let labelRight = '';
    let colored = false;
    let left = false;
    switch (type) {
      case Toggle.Types.ON_OFF:
        labelLeft = 'Off';
        labelRight = 'On';
        colored = true;
        left = !this.props.value;
        break;
      case Toggle.Types.TRUE_FALSE:
        labelLeft = 'False';
        labelRight = 'True';
        colored = true;
        left = !this.props.value;
        break;
      case Toggle.Types.TWO_WAY:
        if (!this.props.optionLeft || !this.props.optionRight) {
          throw new Error('TWO_WAY toggle must provide optionLeft and optionRight props.');
        }
        labelLeft = this.props.optionLeft;
        labelRight = this.props.optionRight;
        left = this.props.value === labelLeft;
        break;
      case Toggle.Types.CUSTOM:
        if (
          !this.props.optionLeft ||
          !this.props.optionRight ||
          !this.props.labelLeft ||
          !this.props.labelRight
        ) {
          throw new Error(
            'CUSTOM toggle must provide optionLeft, optionRight, labelLeft, and labelRight props.'
          );
        }
        labelLeft = this.props.labelLeft;
        labelRight = this.props.labelRight;
        left = this.props.value === this.props.optionLeft;
        colored = this.props.colored;
        break;
      case Toggle.Types.HIDE_LABELS:
        colored = true;
        left = !this.props.value;
        break;
      default:
        labelLeft = 'No';
        labelRight = 'Yes';
        colored = true;
        left = !this.props.value;
        break;
    }

    const switchClasses = [styles.switch];
    // Only use default colored class if no custom colors provided
    if (colored && !this.props.colorLeft && !this.props.colorRight) {
      switchClasses.push(styles.colored);
    }
    if (this.props.switchNoMargin) {
      switchClasses.push(styles.switchNoMargin);
    }
    const toggleClasses = [styles.toggle, baseStyles.unselectable, fieldStyles.input];
    if (left) {
      toggleClasses.push(styles.left);
    }
    if (this.props.darkBg) {
      toggleClasses.push(styles.darkBg);
    }

    // Custom colors for the switch
    let switchStyle = {};
    if (this.props.colorLeft || this.props.colorRight) {
      const colorLeft = this.props.colorLeft || '#999';
      const colorRight = this.props.colorRight || '#00db7c';
      switchStyle = {
        background: `linear-gradient(90deg, ${colorRight}, ${colorRight} 50%, ${colorLeft} 50%, ${colorLeft})`,
        backgroundSize: '200%',
        backgroundPosition: left ? '100%' : '0',
        transition: 'background-position 0.15s ease-out',
      };
    }

    return (
      <div className={toggleClasses.join(' ')} style={this.props.additionalStyles || {}}>
        {labelLeft && (
          <span className={styles.label} onClick={this.toLeft.bind(this)}>
            {labelLeft}
          </span>
        )}
        <span className={switchClasses.join(' ')} style={switchStyle} onClick={this.toggle.bind(this)}></span>
        {labelRight && (
          <span className={styles.label} onClick={this.toRight.bind(this)}>
            {labelRight}
          </span>
        )}
      </div>
    );
  }
}

Toggle.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  type: PropTypes.number.describe(
    'Controls the words that appear beside the toggle. Default is Toggle.Types.YES_NO. Other options are Toggle.Types.TRUE_FALSE, Toggle.Types.ON_OFF, Toggle.Types.TWO_WAY or  Toggle.Types.CUSTOM. If using TWO_WAY, supply your own text using optionLeft and optionRight. If using CUSTOM, supply your own text using labelLeft and labelRight, supply your own values using optionLeft and optionRight.'
  ),
  onChange: PropTypes.func.isRequired,
  optionleft: PropTypes.string,
  optionRight: PropTypes.string,
  labelLeft: PropTypes.string.describe(
    'Custom left toggle label, case when label does not equal content. [For Toggle.Type.CUSTOM]'
  ),
  labelRight: PropTypes.string.describe(
    'Custom right toggle label, case when label does not equal content. [For Toggle.Type.CUSTOM]'
  ),
  colored: PropTypes.bool.describe(
    'Flag describing is toggle is colored. [For Toggle.Type.CUSTOM]'
  ),
  colorLeft: PropTypes.string.describe('Custom color for the left (off) state of the toggle.'),
  colorRight: PropTypes.string.describe('Custom color for the right (on) state of the toggle.'),
  darkBg: PropTypes.bool,
  additionalStyles: PropTypes.object.describe('Additional styles for Toggle component.'),
};

Toggle.Types = {
  YES_NO: 1,
  TRUE_FALSE: 2,
  ON_OFF: 3,
  TWO_WAY: 4,
  CUSTOM: 5,
};
