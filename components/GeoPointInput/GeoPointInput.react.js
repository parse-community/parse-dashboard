import React  from 'react';
import styles from 'components/GeoPointInput/GeoPointInput.scss';

export default class GeoPointInput extends React.Component {
  handleLatitude(e) {
    if (isNaN(e.target.value)) {
      this.props.onChange(this.props.value || { latitude: '0.0', longitude: '0.0' });
      return;
    }
    this.props.onChange({
      latitude: e.target.value,
      longitude: this.props.value ? this.props.value.longitude : '0.0'
    });
  }

  handleLongitude(e) {
    if (isNaN(e.target.value)) {
      this.props.onChange(this.props.value || { latitude: '0.0', longitude: '0.0' });
      return;
    }
    this.props.onChange({
      latitude: this.props.value ? this.props.value.latitude : '0.0',
      longitude: e.target.value
    });
  }

  render() {
    let value = this.props.value || { latitude: '0.0', longitude: '0.0' };
    return (
      <div className={styles.geopoint}>
        <div className={styles.labels}>
          <span>Latitude</span>
          <span>Longitude</span>
        </div>
        <div className={styles.inputs}>
          <input
            type='text'
            value={String(value.latitude)}
            onChange={this.handleLatitude.bind(this)} />
          <input
            type='text'
            value={String(value.longitude)}
            onChange={this.handleLongitude.bind(this)} />
        </div>
      </div>
    );
  }
}