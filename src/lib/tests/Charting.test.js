/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../Charting');
const Charting = require('../Charting');

describe('timeAxisBuckets', () => {
  it('determines an appropriate bucket size and boundaries', () => {
    expect(Charting.timeAxisBuckets(new Date(Date.UTC(2015, 2, 1, 10, 10, 10)), new Date(Date.UTC(2015, 2, 2, 10, 10, 10)))).toEqual(
      [
        new Date(Date.UTC(2015, 2, 1, 10, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 11, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 12, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 13, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 14, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 15, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 16, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 17, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 18, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 19, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 20, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 21, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 22, 0, 0)),
        new Date(Date.UTC(2015, 2, 1, 23, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 0, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 1, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 2, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 3, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 4, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 5, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 6, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 7, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 8, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 9, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 10, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 11, 0, 0)),
      ]
    );

    expect(Charting.timeAxisBuckets(new Date(Date.UTC(2015, 2, 1, 10, 10, 10)), new Date(Date.UTC(2015, 2, 7, 10, 10, 10)))).toEqual(
      [
        new Date(Date.UTC(2015, 2, 1, 0, 0, 0)),
        new Date(Date.UTC(2015, 2, 2, 0, 0, 0)),
        new Date(Date.UTC(2015, 2, 3, 0, 0, 0)),
        new Date(Date.UTC(2015, 2, 4, 0, 0, 0)),
        new Date(Date.UTC(2015, 2, 5, 0, 0, 0)),
        new Date(Date.UTC(2015, 2, 6, 0, 0, 0)),
        new Date(Date.UTC(2015, 2, 7, 0, 0, 0)),
        new Date(Date.UTC(2015, 2, 8, 0, 0, 0)),
      ]
    );

    expect(Charting.timeAxisBuckets(
      new Date(Date.UTC(2015, 2, 1, 10, 10, 10)),
      new Date(Date.UTC(2015, 3, 7, 10, 10, 10))
    ).length).toBe(39);

    expect(Charting.timeAxisBuckets(new Date(Date.UTC(2015, 2, 1, 10, 10, 10)), new Date(Date.UTC(2015, 4, 1, 10, 10, 10)))).toEqual(
      [
        new Date(Date.UTC(2015, 2, 1, 0, 0, 0)),
        new Date(Date.UTC(2015, 3, 1, 0, 0, 0)),
        new Date(Date.UTC(2015, 4, 1, 0, 0, 0)),
        new Date(Date.UTC(2015, 5, 1, 0, 0, 0)),
      ]
    );
  });
});

describe('valueAxisBuckets', () => {
  it('determines an appropriate bucket size and boundaries', () => {
    expect(Charting.valueAxisBuckets(4)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(Charting.valueAxisBuckets(6)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(Charting.valueAxisBuckets(14)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(Charting.valueAxisBuckets(15)).toEqual([0, 10, 20]);
    expect(Charting.valueAxisBuckets(62)).toEqual([0, 10, 20, 30, 40, 50, 60, 70]);
    expect(Charting.valueAxisBuckets(160)).toEqual([0, 100, 200]);
  });
});
