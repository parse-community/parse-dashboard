module.exports.SLOW_QUERY_MOCK_DATA = [
  ['User', 'find()', '20', '12', '32', '42', '51', '13'],
  ['GameScore', 'equalTo("playerName", "Dan Stemkoski")', '33', '21', '2', '11', '22', '23'],
  ['GameScore', 'greaterThan("playerAge", 18)', '20', '33', '34', '44', '55', '34'],
  ['Team', 'greaterThan("winPct", 0.5)', '20', '12', '32', '42', '51', '13'],
  ['Comment', 'equalTo("post", myPost)', '32', '12', '32', '42', '51', '13'],
  ['Post', 'exists("image")', '20', '12', '32', '45', '51', '13'],
  ['Player', 'greaterThan("wins", 150)', '20', '12', '65', '76', '51', '13'],
  ['Player', 'lessThan("wins", 5)', '20', '12', '32', '42', '51', '11'],
  ['GameScore', 'equalTo("playerEmail", "dstemkoski@example.com")', '5', '12', '31', '42', '51', '13'],
]
// [1, 2, 3, 4, 5, 6, 7, 8, 14, 21, 28]

module.exports.RETENTION_MOCK_DATA = {
  'days_old_28': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 23,
      active: 11
    },
    'day_3': {
      total: 32,
      active: 5
    },
    'day_4': {
      total: 54,
      active: 23
    },
    'day_5': {
      total: 67,
      active: 54
    },
    'day_6': {
      total: 33,
      active: 5
    },
    'day_7': {
      total: 12,
      active: 6
    },
    'day_8': {
      total: 21,
      active: 14
    },
    'day_14': {
      total: 33,
      active: 21
    },
    'day_21': {
      total: 22,
      active: 11
    },
    'day_28': {
      total: 11,
      active: 4
    }
  },
  'days_old_21': {
    'day_1': {
      total: 34,
      active: 23
    },
    'day_2': {
      total: 22,
      active: 9
    },
    'day_3': {
      total: 56,
      active: 12
    },
    'day_4': {
      total: 55,
      active: 31
    },
    'day_5': {
      total: 45,
      active: 12
    },
    'day_6': {
      total: 34,
      active: 21
    },
    'day_7': {
      total: 33,
      active: 27
    },
    'day_8': {
      total: 30,
      active: 24
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 12,
      active: 2
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_14': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 21,
      active: 12
    },
    'day_3': {
      total: 67,
      active: 12
    },
    'day_4': {
      total: 87,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_8': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 30,
      active: 12
    },
    'day_3': {
      total: 30,
      active: 12
    },
    'day_4': {
      total: 30,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_7': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 30,
      active: 12
    },
    'day_3': {
      total: 30,
      active: 12
    },
    'day_4': {
      total: 30,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_6': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 30,
      active: 12
    },
    'day_3': {
      total: 30,
      active: 12
    },
    'day_4': {
      total: 30,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_5': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 30,
      active: 12
    },
    'day_3': {
      total: 30,
      active: 12
    },
    'day_4': {
      total: 30,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_4': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 30,
      active: 12
    },
    'day_3': {
      total: 30,
      active: 12
    },
    'day_4': {
      total: 30,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_3': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 30,
      active: 12
    },
    'day_3': {
      total: 30,
      active: 12
    },
    'day_4': {
      total: 30,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_2': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 30,
      active: 12
    },
    'day_3': {
      total: 30,
      active: 12
    },
    'day_4': {
      total: 30,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  },
  'days_old_1': {
    'day_1': {
      total: 30,
      active: 12
    },
    'day_2': {
      total: 30,
      active: 12
    },
    'day_3': {
      total: 30,
      active: 12
    },
    'day_4': {
      total: 30,
      active: 12
    },
    'day_5': {
      total: 30,
      active: 12
    },
    'day_6': {
      total: 30,
      active: 12
    },
    'day_7': {
      total: 30,
      active: 12
    },
    'day_8': {
      total: 30,
      active: 12
    },
    'day_14': {
      total: 30,
      active: 12
    },
    'day_21': {
      total: 30,
      active: 12
    },
    'day_28': {
      total: 30,
      active: 12
    }
  }
}

// value: [current, 1 week ago, 2 weeks ago] or current

module.exports.OVERVIEW_MOCK_DATA = {
  'dailyActiveUsers': {
    value: [30, 33, 17]
  },
  'weeklyActiveUsers': {
    value: [98, 99, 77]
  },
  'monthlyActiveUsers': {
    value: [231, 223, 217]
  },
  'totalUsers': {
    value: [453, 423, 417]
  },
  'dailyActiveInstallations': {
    value: [23, 33, 17]
  },
  'weeklyActiveInstallations': {
    value: [56, 33, 17]
  },
  'monthlyActiveInstallations': {
    value: [187, 33, 17]
  },
  'totalInstallations': {
    value: [453, 33, 17]
  },
  'billingFileStorage': {
    value: {
      total: 11.7,
      limit: 20
    }
  },
  'billingDatabasetorage': {
    value: {
      total: 0.73,
      limit: 1
    }
  },
  'billingDataTransfer': {
    value: {
      total: 1.24,
      limit: 2
    }
  }
}
