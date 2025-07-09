import React from 'react';
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
  const timeSeries =
    columnTypes.length > 1 &&
    columnTypes[0] === 'Date' &&
    columnTypes.slice(1).every(t => t === 'Number');

  const chartData = {};
  if (timeSeries) {
    for (let j = 1; j < columnNames.length; j++) {
      chartData[columnNames[j]] = { color: ChartColorSchemes[j - 1], points: [] };
    }
    for (let i = rowStart; i <= rowEnd; i++) {
      const row = data[i];
      if (!row) continue;
      const ts = parseDate(row.attributes[columnNames[0]]);
      if (ts === null) continue;
      for (let j = 1; j < columnNames.length; j++) {
        const val = row.attributes[columnNames[j]];
        if (typeof val === 'number' && !isNaN(val)) {
          chartData[columnNames[j]].points.push([ts, val]);
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
      columnNames.forEach(col => {
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
      <Chart width={chartWidth} height={400} data={chartData} />
    </div>
  );
}
