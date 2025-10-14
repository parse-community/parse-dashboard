/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { GeoPoint } from 'parse';
import React from 'react';
import styles from 'components/GeoPointEditor/GeoPointEditor.scss';
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

    this.latitudeRef = React.createRef();
    this.longitudeRef = React.createRef();
  }

  componentDidMount() {
    if (!this.props.disableAutoFocus) {
      this.latitudeRef.current.focus();
    }
    this.latitudeRef.current.setSelectionRange(0, String(this.state.latitude).length);
    this.latitudeRef.current.addEventListener('keydown', this.handleKeyLatitude);
    this.longitudeRef.current.addEventListener('keydown', this.handleKeyLongitude);
  }

  componentWillReceiveProps(props) {
    if (props.value) {
      if (props.value.latitude !== this.state.latitude) {
        this.setState({ latitude: props.value.latitude });
      }
      if (props.value.longitude !== this.state.longitude) {
        this.setState({ longitude: props.value.longitude });
      }
    }
  }

  componentWillUnmount() {
    this.latitudeRef.current.removeEventListener('keydown', this.handleKeyLatitude);
    this.longitudeRef.current.removeEventListener('keydown', this.handleKeyLongitude);
  }

  checkExternalClick() {
    // timeout needed because activeElement is set after onBlur event is done
    setTimeout(
      function () {
        // check if activeElement is something else from input fields,
        // to avoid commiting new value on every switch of focus beetween latitude and longitude fields
        if (
          document.activeElement !== this.latitudeRef.current &&
          document.activeElement !== this.longitudeRef.current
        ) {
          this.commitValue();
        }
      }.bind(this),
      1
    );
  }

  handleKeyLatitude(e) {
    if (e.keyCode === 13 || e.keyCode === 44) {
      this.longitudeRef.current.focus();
      this.longitudeRef.current.setSelectionRange(0, String(this.state.longitude).length);
      e.preventDefault();
    } else if (e.keyCode === 27) {
      // ESC key - cancel editing
      if (this.props.onCancel) {
        this.props.onCancel();
      } else {
        this.props.onCommit(this.props.value);
      }
      e.preventDefault();
      e.stopPropagation();
    }
  }

  handleKeyLongitude(e) {
    if (e.keyCode === 13) {
      this.commitValue();
      e.preventDefault();
    } else if (e.keyCode === 27) {
      // ESC key - cancel editing
      if (this.props.onCancel) {
        this.props.onCancel();
      } else {
        this.props.onCommit(this.props.value);
      }
      e.preventDefault();
      e.stopPropagation();
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
    if (
      this.props.value &&
      latitude === this.props.value.latitude &&
      longitude === this.props.value.longitude
    ) {
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
    const onChange = (target, e) => {
      const value = e.target.value;

      if (!validateNumeric(value)) {
        const regex = /[[("' ]?(?<x>[0-9.]+)["' ]?,["' ]?(?<y>[0-9.]+)["' )\]]?/;
        const match = regex.exec(value);

        if (!match) {
          return null;
        }

        const values = [match.groups.x, match.groups.y];

        if (values[0].length > 0 && validateNumeric(values[0])) {
          if (values[1].length <= 0 || !validateNumeric(values[1])) {
            this.setState({ latitude: values[0] });
            this.longitudeRef.current.focus();
            this.longitudeRef.current.setSelectionRange(0, String(this.state.longitude).length);
            return;
          }

          if (validateNumeric(values[1])) {
            this.setState({ latitude: values[0] });
            this.setState({ longitude: values[1] });
            this.longitudeRef.current.focus();
            return;
          }
        }
      }

      this.setState({
        [target]: validateNumeric(value) ? value : this.state[target],
      });
    };
    return (
      <div style={{ width: this.props.width, ...this.props.style }} className={styles.editor}>
        <input
          ref={this.latitudeRef}
          value={this.state.latitude}
          onBlur={this.checkExternalClick}
          onChange={onChange.bind(this, 'latitude')}
        />
        <input
          ref={this.longitudeRef}
          value={this.state.longitude}
          onBlur={this.checkExternalClick}
          onChange={onChange.bind(this, 'longitude')}
        />
      </div>
    );
  }
}
