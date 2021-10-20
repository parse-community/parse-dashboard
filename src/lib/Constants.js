/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
export const Anchors = {
  TOP: 'TOP',
  RIGHT: 'RIGHT',
  BOTTOM: 'BOTTOM',
  LEFT: 'LEFT'
};

export const AsyncStatus = {
  WAITING: 'WAITING',
  PROGRESS: 'PROGRESS',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
}

export const ChartColorSchemes = [
  '#169cee',
  '#EDA515',
  '#00DB7C',
  '#FF395E',
  '#555572',
  '#0E69A1',
  '#ED6815',
  '#11C24C',
  '#15D0ED',
  '#5858ED',
  '#15EDC8',
  '#B515ED'
];

export const Directions = {
  TOP_LEFT: 'TOP_LEFT',
  UP: 'UP',
  TOP_RIGHT: 'TOP_RIGHT',
  RIGHT: 'RIGHT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT',
  DOWN: 'DOWN',
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  LEFT: 'LEFT'
};

export const SpecialClasses = [
  '_User',
  '_Installation',
  '_Role',
  '_Product',
  '_Session',
  '_PushStatus',
];

export const DefaultColumns = {
  All: [ 'objectId', 'ACL', 'createdAt', 'updatedAt' ],

  _User: [ 'username', 'password', 'email', 'emailVerified', 'authData' ],
  _Installation: [ 'installationId', 'deviceToken', 'channels', 'deviceType', 'pushType', 'GCMSenderId', 'timeZone', 'localeIdentifier', 'badge' ],
  _Role: [ 'name', 'users', 'roles' ],
  _Product: [ 'order', 'productIdentifier', 'icon', 'title', 'subtitle', 'download', 'downloadName' ],
  _Session: [ 'restricted', 'user', 'installationId', 'sessionToken', 'expiresAt', 'createdWith' ],
  _PushStatus: [ 'pushTime', 'query', 'pushHash', 'payload', 'status', 'sentPerType', 'failedPerType', 'numSent', 'numFailed', 'errorMessage', 'source' ],
};

export const DataTypes = [
  'Boolean',
  'String',
  'Number',
  'Date',
  'Object',
  'Array',
  'GeoPoint',
  'Polygon',
  'File',
  'Pointer',
  'Relation',
];
