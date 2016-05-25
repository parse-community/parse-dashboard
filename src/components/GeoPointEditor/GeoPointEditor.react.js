/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { GeoPoint }    from 'parse';
import hasAncestor     from 'lib/hasAncestor';
import React           from 'react';
import styles          from 'components/GeoPointEditor/GeoPointEditor.scss';
import validateNumeric from 'lib/validateNumeric';

export default class GeoPointEditor extends React.Component {
  constructor(props) {
    super();

    this.state = {
      latitude: props.value ? props.value.latitude : 0,
      longitude: props.value ? props.value.longitude : 0,
    };

    this.checkExternalClick = this.checkExternalClick.bind(this);
    this.handleKeyLatitude = this.handleKeyLatitude.bind(this);
    this.handleKeyLongitude = this.handleKeyLongitude.bind(this);
  }

  componentDidMount() {
    this.refs.latitude.focus();
    this.refs.latitude.setSelectionRange(0, String(this.state.latitude).length);
    document.body.addEventListener('click', this.checkExternalClick);
    this.refs.latitude.addEventListener('keypress', this.handleKeyLatitude);
    this.refs.longitude.addEventListener('keypress', this.handleKeyLongitude);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.checkExternalClick);
    this.refs.latitude.removeEventListener('keypress', this.handleKeyLatitude);
    this.refs.longitude.removeEventListener('keypress', this.handleKeyLongitude);
  }

  checkExternalClick(e) {
    if (!hasAncestor(e.target, this.refs.input)) {
      this.commitValue();
    }
  }

  handleKeyLatitude(e) {
    if (e.keyCode === 13 || e.keyCode === 44) {
      this.refs.longitude.focus();
      this.refs.longitude.setSelectionRange(0, String(this.state.longitude).length);
    }
  }

  handleKeyLongitude(e) {
    if (e.keyCode === 13) {
      this.commitValue();
    }
  }

  commitValue() {
    let latitude = this.state.latitude;
    let longitude = this.state.longitude;
    if (typeof this.state.latitude === 'string') {
      latitude = parseFloat(this.state.latitude);
    }
    if (typeof this.state.longitude === 'string') {
      longitude = parseFloat(this.state.longitude);
    }
    if (this.props.value && latitude === this.props.value.latitude && longitude === this.props.value.longitude) {
      // No change, return the original object
      this.props.onCommit(this.props.value);
    } else {
      this.props.onCommit(
        new GeoPoint(
          Math.max(Math.min(latitude, 90), -90),
          Math.max(Math.min(longitude, 180), -180)
        )
      );
    }
  }

  render() {
    let onChange = (target, e) => {
      let value = e.target.value;

      if (!validateNumeric(value)) {
        var values = value.split(",");

        if (values.length == 2) {
          values = values.map(val => val.trim());

          if (values[0].length > 0 && validateNumeric(values[0])) {

            if (values[1].length <= 0 || !validateNumeric(values[1])) {
              this.setState({ latitude: values[0] });
              this.refs.longitude.focus();
              this.refs.longitude.setSelectionRange(0, String(this.state.longitude).length);
              return;
            }

            if (validateNumeric(values[1])) {
              this.setState({ latitude: values[0] });
              this.setState({ longitude: values[1] });
              this.refs.longitude.focus();
              return;
            }
          }
        }
      }

      this.setState({ [target]: validateNumeric(value) ? value : this.state[target] });
    };
    return (
      <div ref='input' style={{ width: this.props.width }} className={styles.editor}>
        <input
          ref='latitude'
          value={this.state.latitude}
          onChange={onChange.bind(this, 'latitude')} />
        <input
          ref='longitude'
          value={this.state.longitude}
          onChange={onChange.bind(this, 'longitude')} />
      </div>
    );
  }
}
