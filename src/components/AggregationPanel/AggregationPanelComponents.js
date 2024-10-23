import React, { useState } from 'react';
import LoaderDots from 'components/LoaderDots/LoaderDots.react';
import styles from './AggregationPanel.scss';
import Parse from 'parse';

// Text Element Component
export const TextElement = ({ text }) => (
  <div className="text-element">
    <p>{text}</p>
  </div>
);

// Key-Value Element Component
export const KeyValueElement = ({ item }) => (
  <div className={styles.keyValue}>
    {item.key}:
    {item.url ? <a href={item.url} target="_blank">{item.value}</a> : <span>{item.value}</span>}
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
        showNote(`${formattedData}`,false)
      })
      .catch(error => {
        showNote(`${error}`,true)
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

export const PanelElement = ({ item, showNote, objectId, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [panelData, setPanelData] = useState(null);

  const fetchPanelData = async () => {
    setIsLoading(true);
    try {
      const params = { objectId };
      const result = await Parse.Cloud.run(item.cloudCodeFunction, params);
      if (result?.panel?.segments) {
        setPanelData(result);
      } else {
        const errorMsg = 'Improper JSON format';
        showNote(errorMsg, true);
      }
    } catch (error) {
      const errorMsg = error.message;
      showNote(errorMsg, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if ((!isExpanded && !panelData)) {
      fetchPanelData();
    }
    setIsExpanded(prev => !prev);
  };

  const handleRefresh = () => {
    setPanelData(null);
    fetchPanelData();
  };

  const indentStyle = {
    marginLeft: `${depth * 20}px`
  };

  return (
    <div className={styles.panelElement} style={indentStyle}>
      <div className={styles.panelHeader}>
        <button
          onClick={handleToggle}
          className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
        >
          {isExpanded ? '▼' : '▶'}
          {item.title}
        </button>
        {isExpanded && (
          <button
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={isLoading}
          >
            ↻
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={styles.panelContent}>
          {isLoading ? (
            <div className={styles.loader}>
              <LoaderDots />
            </div>
          ) : panelData && (
            <div className={styles.nestedPanel}>
              {panelData.panel.segments.map((segment, index) => (
                <div key={index}>
                  <h3 className={styles.heading}>{segment.title}</h3>
                  <div className={styles.segmentItems}>
                    {segment.items.map((nestedItem, idx) => {
                      switch (nestedItem.type) {
                        case 'panel':
                          return (
                            <PanelElement
                              key={idx}
                              item={nestedItem}
                              showNote={showNote}
                              depth={depth + 1}
                            />
                          );
                        case 'text':
                          return <TextElement key={idx} text={nestedItem.text} />;
                        case 'keyValue':
                          return <KeyValueElement key={idx} item={nestedItem} />;
                        case 'table':
                          return <TableElement key={idx} columns={nestedItem.columns} rows={nestedItem.rows} />;
                        case 'image':
                          return <ImageElement key={idx} url={nestedItem.url} />;
                        case 'video':
                          return <VideoElement key={idx} url={nestedItem.url} />;
                        case 'audio':
                          return <AudioElement key={idx} url={nestedItem.url} />;
                        case 'button':
                          return <ButtonElement key={idx} item={nestedItem} showNote={showNote} />;
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
