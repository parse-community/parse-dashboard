import React, { useState, useEffect } from 'react';
import Chart from 'components/Chart/Chart.react';
import { ChartColorSchemes } from 'lib/Constants';
import styles from './GraphPanel.scss';

function parseDate(val) {
  if (!val) {
    return null;
  }
  if (val instanceof Date) {
    return val.getTime();
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d) ? null : d.getTime();
  }
  if (val.iso) {
    const d = new Date(val.iso);
    return isNaN(d) ? null : d.getTime();
  }
  return null;
}

export default function GraphPanel({ selectedCells, order, data, columns, width }) {
  if (!selectedCells || selectedCells.rowStart < 0) {
    return null;
  }
  const { rowStart, rowEnd, colStart, colEnd } = selectedCells;
  const columnNames = order.slice(colStart, colEnd + 1).map(o => o.name);
  const columnTypes = columnNames.map(name => columns[name]?.type);

  const initialUseXAxis =
    columnNames.length > 1 &&
    (columnTypes[0] === 'Date' || columnTypes[0] === 'Number') &&
    columnTypes.slice(1).some(t => t === 'Number');

  const [useXAxis, setUseXAxis] = useState(initialUseXAxis);

  useEffect(() => {
    setUseXAxis(initialUseXAxis);
  }, [selectedCells?.rowStart, selectedCells?.rowEnd, selectedCells?.colStart, selectedCells?.colEnd]);

  const chartData = {};

  if (useXAxis) {
    let seriesIndex = 0;
    for (let j = 1; j < columnNames.length; j++) {
      if (columnTypes[j] === 'Number') {
        chartData[columnNames[j]] = {
          color: ChartColorSchemes[seriesIndex],
          points: [],
        };
        seriesIndex++;
      }
    }
    for (let i = rowStart; i <= rowEnd; i++) {
      const row = data[i];
      if (!row) continue;
      let x = row.attributes[columnNames[0]];
      if (columnTypes[0] === 'Date') {
        x = parseDate(x);
      } else if (typeof x === 'string') {
        x = parseFloat(x);
      }
      if (typeof x !== 'number' || isNaN(x)) {
        continue;
      }
      for (let j = 1; j < columnNames.length; j++) {
        if (columnTypes[j] !== 'Number') continue;
        const val = row.attributes[columnNames[j]];
        if (typeof val === 'number' && !isNaN(val)) {
          chartData[columnNames[j]].points.push([x, val]);
        }
      }
    }
  } else {
    let seriesIndex = 0;
    columnNames.forEach((col, idx) => {
      if (columnTypes[idx] === 'Number') {
        chartData[col] = { color: ChartColorSchemes[seriesIndex], points: [] };
        seriesIndex++;
      }
    });
    let x = 0;
    for (let i = rowStart; i <= rowEnd; i++, x++) {
      const row = data[i];
      if (!row) continue;
      columnNames.forEach((col, idx) => {
        if (columnTypes[idx] !== 'Number') return;
        const val = row.attributes[col];
        if (typeof val === 'number' && !isNaN(val)) {
          chartData[col].points.push([x, val]);
        }
      });
    }
  }

  if (Object.keys(chartData).length === 0) {
    return <div className={styles.empty}>No numeric data selected.</div>;
  }

  const chartWidth = width - 20;
  return (
    <div className={styles.graphPanel}>
      <div className={styles.options}>
        <label>
          <input
            type="checkbox"
            checked={useXAxis}
            onChange={() => setUseXAxis(!useXAxis)}
          />{' '}
          Use first column as X-axis
        </label>
      </div>
      <Chart width={chartWidth} height={400} data={chartData} />
    </div>
  );
}
