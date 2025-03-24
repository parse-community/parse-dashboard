import React from 'react';
import styles from './AggregationPanel.scss';

// Text Element Component
export const TextElement = ({ text }) => (
  <div className="text-element">
    <p>{text}</p>
  </div>
);

// Key-Value Element Component
export const KeyValueElement = ({ item, appName }) => (
  <div className={styles.keyValue}>
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
export const TableElement = ({ columns, rows }) => (
  <div className="table-element">
    <table>
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
export const ImageElement = ({ url }) => (
  <div className="image-element">
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={url} alt="Image" className={styles.image} />
    </a>
  </div>
);

// Video Element Component
export const VideoElement = ({ url }) => (
  <div className="video-element">
    <video controls className={styles.video}>
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
);

// Audio Element Component
export const AudioElement = ({ url }) => (
  <div className="audio-element">
    <audio controls className={styles.audio}>
      <source src={url} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </div>
);

// Button Element Component
export const ButtonElement = ({ item, showNote }) => {
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
      <button onClick={handleClick} className={styles.button}>
        {item.text}
      </button>
    </div>
  );
};
