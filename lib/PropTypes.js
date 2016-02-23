/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { PropTypes } from 'react';

/**
 * Provides a layer on top of React's PropTypes. This allows our code to be
 * self-documenting, while maintaining prop type checking.
 */

let Types = null;

function wrapType(type, id) {
  type._id = id;
  if (type.isRequired) {
    type.isRequired = wrapType(type.isRequired, id);
    type.isRequired._required = true;
    type.isRequired._classes = type._classes;
    type.isRequired._values = type._values;
  }
  type.describe = function(description) {
    let wrapped = function(...args) {
      return type.apply(type, args);
    }
    wrapped._id = type._id;
    wrapped._required = type._required;
    wrapped._description = description;
    wrapped._values = type._values;
    wrapped._classes = type._classes;
    return wrapped;
  };

  return type;
}

Types = {
  array: wrapType(PropTypes.array, 'Array'),
  bool: wrapType(PropTypes.bool, 'Boolean'),
  func: wrapType(PropTypes.func, 'Function'),
  number: wrapType(PropTypes.number, 'Number'),
  object: wrapType(PropTypes.object, 'Object'),
  string: wrapType(PropTypes.string, 'String'),

  node: wrapType(PropTypes.node, 'Node'),

  element: wrapType(PropTypes.element, 'Element'),

  any: wrapType(PropTypes.any, 'Any'),

  instanceOf: function(klass) {
    let name = klass.constructor.name;
    if (klass === Date) {
      name = 'Date';
    }
    return wrapType(PropTypes.instanceOf(klass), name);
  },

  oneOf: function(values) {
    let type = PropTypes.oneOf(values);
    type._values = values;
    type = wrapType(type, 'Enum');
    return type;
  },

  oneOfType: function(classes) {
    let type = PropTypes.oneOfType(classes);
    type._classes = classes;
    type = wrapType(type, 'Union');
    return type;
  },

  arrayOf: function(valueType) {
    return wrapType(PropTypes.arrayOf(valueType), `Array<${valueType._id}>`);
  },

  objectOf: function(valueType) {
    return wrapType(PropTypes.objectOf(valueType), `Object<String, ${valueType._id}>`);
  },

  shape: function(shape) {
    return wrapType(PropTypes.shape(shape), 'Object');
  },
};

export default Types;
