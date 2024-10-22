import LoaderDots from 'components/LoaderDots/LoaderDots.react';
import React, { useEffect, useMemo } from 'react';
import styles from './AggregationPanel.scss';
import {
  AudioElement,
  ButtonElement,
  ImageElement,
  KeyValueElement,
  TableElement,
  TextElement,
  VideoElement,
} from './AggregationPanelComponents';

const AggregationPanel = ({
  data,
  isLoadingCloudFunction,
  showAggregatedData,
  setErrorAggregatedData,
  errorAggregatedData,
  showNote,
  setSelectedObjectId,
  selectedObjectId
}) => {

  useEffect(() => {
    if (Object.keys(errorAggregatedData).length !== 0) {
      setSelectedObjectId(null);
      setErrorAggregatedData({});
    }
  }, [errorAggregatedData, setSelectedObjectId, setErrorAggregatedData]);

  const isLoading = useMemo(() =>
    selectedObjectId && isLoadingCloudFunction && showAggregatedData,
  [selectedObjectId, isLoadingCloudFunction, showAggregatedData]
  );

  const shouldShowAggregatedData = useMemo(() =>
    selectedObjectId && showAggregatedData && Object.keys(data).length !== 0 && Object.keys(errorAggregatedData).length === 0, [selectedObjectId, showAggregatedData, data, errorAggregatedData]
  );

  return (
    <>
      {isLoading ? (
        <div className={styles.center}>
          <LoaderDots />
        </div>
      ) : shouldShowAggregatedData ? (
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
                    return <ButtonElement key={idx} item={item} showNote={showNote} />;
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.loading}>
            No object selected.
        </div>
      )}
    </>
  );
};

export default AggregationPanel;
