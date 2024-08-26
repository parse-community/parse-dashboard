import React from 'react';
import {
  TextElement,
  KeyValueElement,
  TableElement,
  ImageElement,
  VideoElement,
  AudioElement,
  ButtonElement,
} from './AggregationPanelComponents';
import styles from './AggregationPanel.scss';

const BeatLoader = () => {
  return (
    <div className={styles.beatloader}>
      <div className={styles.beat}></div>
      <div className={styles.beat}></div>
      <div className={styles.beat}></div>
    </div>
  );
};

const AggregationPanel = ({ data , isLoadingCloudFunction}) => {
  return (
    <>
      { isLoadingCloudFunction ? <BeatLoader /> : Object.keys(data).length !== 0 ? (
        data.panel.segments.map((segment, index) => (
          <div key={index}>
            <h2 className={styles.heading}>{segment.title}</h2>
            <div className={styles.segmentItems}>
              {segment.items.map((item, idx) => {
                switch (item.type) {
                  case 'text':
                    return <TextElement key={idx} text={item.text} />;
                  case 'keyValue':
                    return <KeyValueElement key={idx} item={item} />;
                  case 'table':
                    return <TableElement key={idx} columns={item.columns} rows={item.rows} />;
                  case 'image':
                    return <ImageElement key={idx} url={item.url} />;
                  case 'video':
                    return <VideoElement key={idx} url={item.url} />;
                  case 'audio':
                    return <AudioElement key={idx} url={item.url} />;
                  case 'button':
                    return <ButtonElement key={idx} item={item} />;
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.loading}>No object selected. Select an object to see aggregated data.</div>
      )}
    </>
  );
};

export default AggregationPanel;