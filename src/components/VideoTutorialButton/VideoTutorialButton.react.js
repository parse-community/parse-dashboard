import React, { Component } from 'react';
import PropTypes from 'lib/PropTypes';
import styles from 'components/VideoTutorialButton/VideoTutorialButton.scss';
import Position from 'lib/Position';
import Popover from 'components/Popover/Popover.react';
import ReactPlayer from 'react-player';

export default class VideoTutorialButton extends Component {

  constructor(props) {
    super(props);

    this.state = {
      videoTutorialModal: null
    };
  }

  componentWillMount() {
    if (this.props.playing) {
      this.openVideoTutorialModal();
    }
  }

  openVideoTutorialModal() {
    const { url } = this.props;
    this.setState({
      videoTutorialModal: (
        <Popover
          fadeIn={true}
          fixed={true}
          position={new Position(0, 0)}
          modal={true}
          color='rgba(17,13,17,0.8)'
          onExternalClick={() => this.setState({ videoTutorialModal: null })}>
          <div className={styles.modal}>
            <ReactPlayer
              url={url}
              controls
              width="100%"
              height="100%"
              playing
            />
          </div>
        </Popover>
      )
    });
  }

  render() {
    const classes = [styles.button, styles['b4a-green'], styles.unselectable];
    return (
      <a
        href='javascript:;'
        role='button'
        className={classes.join(' ')}
        style={this.props.additionalStyles}
        onClick={() => this.openVideoTutorialModal()}>
        <span>Video Tutorial</span>
        {this.state.videoTutorialModal}
      </a>
    );
  }
}

// Props validations
VideoTutorialButton.propTypes = {
  url: PropTypes.string,
  additionalStyles: PropTypes.object.describe(
    'Additional styles for <a> tag.'
  )
};
