import React from 'react';
import copy from 'copy-to-clipboard';
import Icon from 'components/Icon/Icon.react';
import styles from './AggregationPanel.scss';

// Text Element Component
export const TextElement = ({ text, style }) => (
  <div className="text-element" style={style}>
    <p>{text}</p>
  </div>
);

// Key-Value Element Component
export const KeyValueElement = ({ item, appName, style, showNote }) => {
  let values = [];

  if (Array.isArray(item.value)) {
    values = item.value.map((val, idx) => ({
      value: val,
      url: Array.isArray(item.url) ? item.url[idx] : item.url,
      isRelativeUrl: Array.isArray(item.isRelativeUrl) ? item.isRelativeUrl[idx] : item.isRelativeUrl,
    }));
  } else {
    values = [
      {
        value: item.value,
        url: Array.isArray(item.url) ? item.url[0] : item.url,
        isRelativeUrl: Array.isArray(item.isRelativeUrl) ? item.isRelativeUrl[0] : item.isRelativeUrl,
      },
    ];
  }

  if (Array.isArray(item.values)) {
    values = values.concat(item.values);
  }

  const handleCopy = () => {
    const copyValue = Array.isArray(item.value) ? item.value[0] : item.value;
    copy(String(copyValue));
    if (showNote) {
      showNote('Value copied to clipboard', false);
    }
  };

  const renderValue = ({ value, url, isRelativeUrl }) => {
    if (url) {
      return (
        <a href={isRelativeUrl ? `apps/${appName}/${url}` : url} target="_blank" rel="noreferrer">
          {value}
        </a>
      );
    }

    return <span>{value}</span>;
  };

  return (
    <div className={styles.keyValue} style={style}>
      {item.key}:
      {values.map((val, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && ' '}
          {renderValue(val)}
        </React.Fragment>
      ))}
      <span className={styles.copyIcon} onClick={handleCopy}>
        <Icon name="clone-icon" width={12} height={12} fill="currentColor" />
      </span>
    </div>
  );
};

// Table Element Component
export const TableElement = ({ columns, rows, style }) => (
  <div className="table-element">
    <table style={style}>
      <thead>
        <tr>
          {columns.map((column, idx) => (
            <th key={idx}>{column.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {columns.map((column, colIdx) => (
              <td key={colIdx}>{row[column.name]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Image Element Component
export const ImageElement = ({ url, style }) => (
  <div className="image-element" style={style}>
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={url} alt="Image" className={styles.image} />
    </a>
  </div>
);

// Video Element Component
export const VideoElement = ({ url, style }) => (
  <div className="video-element">
    <video controls className={styles.video} style={style}>
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
);

// Audio Element Component
export const AudioElement = ({ url, style }) => (
  <div className="audio-element">
    <audio controls className={styles.audio} style={style}>
      <source src={url} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </div>
);

// Button Element Component
export const ButtonElement = ({ item, showNote, style }) => {
  const handleClick = () => {
    fetch(item.action.url, {
      method: item.action.method,
      headers: item.action.headers,
      body: JSON.stringify(item.action.body),
    })
      .then(response => response.json())
      .then(data => {
        const formattedData = JSON.stringify(data, null, 2);
        showNote(`${formattedData}`, false);
      })
      .catch(error => {
        showNote(`${error}`, true);
      });
  };

  return (
    <div className={styles.buttonContainer}>
      <button onClick={handleClick} className={styles.button} style={style}>
        {item.text}
      </button>
    </div>
  );
};
