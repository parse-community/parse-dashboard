import LoaderDots from 'components/LoaderDots/LoaderDots.react';
import Parse from 'parse';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  selectedObjectId,
  className,
  appName,
  depth = 0,
  cloudCodeFunction = null,
  panelTitle = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nestedData, setNestedData] = useState(null);
  const [isLoadingNested, setIsLoadingNested] = useState(false);

  useEffect(() => {
    if (Object.keys(errorAggregatedData).length !== 0) {
      setSelectedObjectId(null);
      setErrorAggregatedData({});
    }
  }, [errorAggregatedData, setSelectedObjectId, setErrorAggregatedData]);

  const isLoading = useMemo(
    () => depth === 0 && selectedObjectId && isLoadingCloudFunction && showAggregatedData,
    [depth, selectedObjectId, isLoadingCloudFunction, showAggregatedData]
  );

  const shouldShowAggregatedData = useMemo(
    () =>
      depth === 0
        ? selectedObjectId &&
          showAggregatedData &&
          Object.keys(data).length !== 0 &&
          Object.keys(errorAggregatedData).length === 0
        : true,
    [depth, selectedObjectId, showAggregatedData, data, errorAggregatedData]
  );

  const fetchNestedData = useCallback(async () => {
    setIsLoadingNested(true);
    try {
      const params = {
        object: Parse.Object.extend(className).createWithoutData(selectedObjectId).toPointer(),
      };
      const options = {
        useMasterKey: true,
      };
      const result = await Parse.Cloud.run(cloudCodeFunction, params, options);
      if (result?.panel?.segments) {
        setNestedData(result);
      } else {
        const errorMsg = 'Improper JSON format';
        showNote(errorMsg, true);
      }
    } catch (error) {
      const errorMsg = error.message;
      showNote(errorMsg, true);
    } finally {
      setIsLoadingNested(false);
    }
  }, [cloudCodeFunction, selectedObjectId, showNote]);

  const handleToggle = useCallback(async () => {
    if (!isExpanded && !nestedData && cloudCodeFunction) {
      fetchNestedData();
    }
    setIsExpanded(prev => !prev);
  }, [isExpanded, nestedData, cloudCodeFunction, fetchNestedData]);

  const handleRefresh = useCallback(() => {
    setNestedData(null);
    setIsExpanded(false);
    fetchNestedData();
  }, [fetchNestedData]);

  const renderSegmentContent = (segment, index) => (
    <div key={index} className={styles.segmentContainer}>
      <h2 className={styles.heading}>{segment.title}</h2>
      <div className={styles.segmentItems}>
        {segment.items.map((item, idx) => {
          switch (item.type) {
            case 'text':
              return <TextElement key={idx} text={item.text} />;
            case 'keyValue':
              return <KeyValueElement key={idx} item={item} appName={appName} />;
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
            case 'panel':
              return (
                <div key={idx} className={styles.nestedPanelContainer}>
                  <AggregationPanel
                    data={{}}
                    isLoadingCloudFunction={false}
                    showAggregatedData={true}
                    setErrorAggregatedData={setErrorAggregatedData}
                    errorAggregatedData={errorAggregatedData}
                    showNote={showNote}
                    setSelectedObjectId={setSelectedObjectId}
                    selectedObjectId={selectedObjectId}
                    className={className}
                    depth={depth + 1}
                    cloudCodeFunction={item.cloudCodeFunction}
                    panelTitle={item.title}
                  />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );

  if (depth > 0) {
    return (
      <div className={styles.nestedPanel}>
        <div
          className={`${styles.nestedPanelHeader} ${isExpanded ? styles.expanded : ''}`}
          onClick={handleToggle}
        >
          <span className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}>
            {panelTitle}
          </span>
          <div>
            {isExpanded && (
              <button
                onClick={handleRefresh}
                className={styles.refreshButton}
                disabled={isLoadingNested}
              >
                <span>↻</span>
              </button>
            )}
            <span>{isExpanded ? '▼' : '▲'}</span>
          </div>
        </div>
        {isExpanded && (
          <div className={styles.nestedPanelContent}>
            {isLoadingNested ? (
              <div className={styles.loader}>
                <LoaderDots />
              </div>
            ) : (
              nestedData &&
              nestedData.panel.segments.map((segment, index) =>
                renderSegmentContent(segment, index)
              )
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.aggregationPanel}>
      {isLoading ? (
        <div className={styles.center}>
          <LoaderDots />
        </div>
      ) : shouldShowAggregatedData ? (
        <div className={styles.mainContent}>
          {data.panel.segments.map((segment, index) => renderSegmentContent(segment, index))}
        </div>
      ) : (
        <div className={styles.center}>No object selected.</div>
      )}
    </div>
  );
};

export default AggregationPanel;
