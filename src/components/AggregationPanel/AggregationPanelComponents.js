import React from 'react';
import styles from './AggregationPanel.scss';

// Text Element Component
export const TextElement = ({ text, style}) => (
  <div className="text-element" style={style}>
    <p>{text}</p>
  </div>
);

// Key-Value Element Component
export const KeyValueElement = ({ item, appName, style }) => (
  <div className={styles.keyValue} style={style}>
    {item.key}:
    {item.url ? (
      <a href={item.isRelativeUrl ? `apps/${appName}/${item.url}` : item.url} target="_blank" rel="noreferrer">
        {item.value}
      </a>
    ) : (
      <span>{item.value}</span>
    )}
  </div>
);

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
