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
  style,
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

  const isLoadingInfoPanel = useMemo(
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
    <div key={index} className={styles.segmentContainer} style={segment.style}>
      <h2 className={styles.heading} style={segment.titleStyle}>{segment.title}</h2>
      <div className={styles.segmentItems}>
        {segment.items.map((item, idx) => {
          switch (item.type) {
            case 'text':
              return <TextElement key={idx} text={item.text} style={item.style} />;
            case 'keyValue':
              return (
                <KeyValueElement
                  key={idx}
                  item={item}
                  appName={appName}
                  showNote={showNote}
                  style={item.style}
                />
              );
            case 'table':
              return <TableElement key={idx} columns={item.columns} rows={item.rows} style={item.style} />;
            case 'image':
              return <ImageElement key={idx} url={item.url} style={item.style} />;
            case 'video':
              return <VideoElement key={idx} url={item.url} style={item.style} />;
            case 'audio':
              return <AudioElement key={idx} url={item.url} style={item.style} />;
            case 'button':
              return <ButtonElement key={idx} item={item} showNote={showNote} style={item.style} />;
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
                    style={item.style}
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
          style={style}
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

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        // Stop the event from propagating to parent handlers
        e.stopPropagation();
        // Let the default copy behavior happen by not calling preventDefault
        return;
      }
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {isLoadingInfoPanel ? (
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
