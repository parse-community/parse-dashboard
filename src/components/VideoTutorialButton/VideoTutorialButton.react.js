import React            from 'react';
import PropTypes        from 'lib/PropTypes';
import styles           from 'components/VideoTutorialButton/VideoTutorialButton.scss';

const VideoTutorialButton = props => {
  const classes = [styles.button, styles['b4a-green'], styles.unselectable];
  const clickHandler = () => {
    const { url } = props;
    // openVideoTutorialModal(url);
    console.log("SHOULD OPEN MODAL WITH URL " + url);
  };
  return (
    <a
      href='javascript:;'
      role='button'
      className={classes.join(' ')}
      style={props.additionalStyles}
      onClick={clickHandler}>
      <span>Video Tutorial</span>
    </a>
  );
}

// Props validations
VideoTutorialButton.propTypes = {
  url: PropTypes.string,
  additionalStyles: PropTypes.object.describe(
    'Additional styles for <a> tag.'
  )
};

export default VideoTutorialButton;
