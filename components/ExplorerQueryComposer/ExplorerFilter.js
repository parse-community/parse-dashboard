export const Constraints = {
  '$eq': {
    name: 'equals',
  },
  '$ne': {
    name: 'does not equal',
  },
  '$lt': {
    name: 'less than',
    field: 'Number',
    composable: true,
  },
  '$le': {
    name: 'less than or equal',
    field: 'Number',
    composable: true,
  },
  '$gt': {
    name: 'greater than',
    field: 'Number',
    composable: true,
  },
  '$ge': {
    name: 'greater than or equal',
    field: 'Number',
    composable: true,
  },
  '$contains': {
    name: 'contains string',
    field: 'String',
    composable: true,
  },
  'json_extract_scalar': {
    name: 'json',
    field: 'JSON',
    composable: true
  }
};

export const FieldConstraints = {
  'Boolean': [ '$eq' ],
  'Number': [ '$eq', '$ne', '$lt', '$le', '$gt', '$ge' ],
  'String': [ '$eq', '$ne', '$contains' ],
  'Date': [ '$eq', '$ne', '$lt', '$le', '$gt', '$ge' ],
  'JSON': [ '$eq', '$ne', 'json_extract_scalar' ],
  'JSONValue': [ '$eq', '$ne' ]
};
