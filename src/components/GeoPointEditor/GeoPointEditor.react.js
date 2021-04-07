/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { GeoPoint }    from 'parse';
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
    this.latRef = React.createRef();
    this.lngRef = React.createRef();
  }

  get latitude() {
    return this.latRef.current
  }

  get longitude() {
    return this.lngRef.current
  }

  componentDidMount() {
    if (!this.props.disableAutoFocus) {
      this.latitude.focus();
    }
    this.latitude.setSelectionRange(0, String(this.state.latitude).length);
    this.latitude.addEventListener('keypress', this.handleKeyLatitude);
    this.longitude.addEventListener('keypress', this.handleKeyLongitude);
  }

  static getDerivedStateFromProps(props) {
    if (props.value) {
      const state = {}
      if (props.value.latitude !== this.state.latitude) {
        state.latitude = props.value.latitude
      }
      if (props.value.longitude !== this.state.longitude) {
        state.longitude = props.value.longitude
      }
      return state
    }
    return null
  }

  componentWillUnmount() {
    this.latitude.removeEventListener('keypress', this.handleKeyLatitude);
    this.longitude.removeEventListener('keypress', this.handleKeyLongitude);
  }

  checkExternalClick() {
    // timeout needed because activeElement is set after onBlur event is done
    setTimeout(function() {
      // check if activeElement is something else from input fields,
      // to avoid commiting new value on every switch of focus beetween latitude and longitude fields
      if (
        document.activeElement !== this.latitude &&
        document.activeElement !== this.longitude
      ) {
        this.commitValue();
      }
    }.bind(this), 1);
  }

  handleKeyLatitude(e) {
    if (e.keyCode === 13 || e.keyCode === 44) {
      this.longitude.focus();
      this.longitude.setSelectionRange(0, String(this.state.longitude).length);
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
        let values = value.split(',');

        if (values.length == 2) {
          values = values.map(val => val.trim());

          if (values[0].length > 0 && validateNumeric(values[0])) {

            if (values[1].length <= 0 || !validateNumeric(values[1])) {
              this.setState({ latitude: values[0] });
              this.longitude.focus();
              this.longitude.setSelectionRange(0, String(this.state.longitude).length);
              return;
            }

            if (validateNumeric(values[1])) {
              this.setState({ latitude: values[0] });
              this.setState({ longitude: values[1] });
              this.longitude.focus();
              return;
            }
          }
        }
      }

      this.setState(prevState => ({ [target]: validateNumeric(value) ? value : prevState[target] }));
    };
    return (
      <div style={{ width: this.props.width, ...this.props.style }} className={styles.editor}>
        <input
          ref={this.latRef}
          value={this.state.latitude}
          onBlur={this.checkExternalClick}
          onChange={onChange.bind(this, 'latitude')} />
        <input
          ref={this.lngRef}
          value={this.state.longitude}
          onBlur={this.checkExternalClick}
          onChange={onChange.bind(this, 'longitude')} />
      </div>
    );
  }
}
