/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

// Determines the points marked on the x-axis of a chart
export function timeAxisBuckets(minRaw, maxRaw) {
  let min = new Date(minRaw);
  let max = new Date(maxRaw);

  if (max - min <= DAY * 2) {
    let buckets = [];
    let bucket = new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth(), min.getUTCDate(), min.getUTCHours()));
    while (bucket < max) {
      buckets.push(bucket);
      bucket = new Date(bucket.getTime() + HOUR);
    }
    buckets.push(bucket);
    return buckets;
  }

  if (max - min <= DAY * 60) {
    let buckets = [];
    let bucket = new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth(), min.getUTCDate()));
    while (bucket < max) {
      buckets.push(bucket);
      bucket = new Date(bucket.getTime());
      bucket.setUTCDate(bucket.getUTCDate() + 1);
    }
    buckets.push(bucket);

    return buckets;
  }

  let buckets = [];
  let bucket = new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth()));
  while (bucket < max) {
    buckets.push(bucket);
    bucket = new Date(bucket.getTime());
    bucket.setUTCMonth(bucket.getUTCMonth() + 1);
  }
  buckets.push(bucket);
  return buckets;
}

// Determines the points marked on the y-axis of a chart
export function valueAxisBuckets(max) {
  if (max === 0) { // prevent horrible crash when max is zero value
    console.warn('max param should be a non zero value');
    return [];
  }

  let magnitude = Math.floor(Math.log10(max));
  if (max / Math.pow(10, magnitude) < 1.5) {
    magnitude--;
  }
  let skip = Math.pow(10, magnitude);
  let buckets = [];
  let bucket = 0;
  while (bucket <= max) {
    buckets.push(bucket);
    bucket += skip;
  }
  buckets.push(bucket);
  return buckets;
}

// Determines the x,y points on the chart for each data point
export function getDataPoints(chartWidth, chartHeight, timeBuckets, valueBuckets, dataPoints) {
  let xLength = timeBuckets[timeBuckets.length - 1] - timeBuckets[0];
  let yLength = valueBuckets[valueBuckets.length - 1] - valueBuckets[0];
  return dataPoints.map(([x, y]) => {
    return [chartWidth * (x - timeBuckets[0]) / xLength, chartHeight - (chartHeight * y / yLength)];
  });
}
