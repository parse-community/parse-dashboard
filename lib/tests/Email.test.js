/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../Email');
const Email = require('../Email');

describe('dist', () => {
  it('calculates the edit distance between strings', () => {
    expect(Email.dist('aaa', 'aaa')).toBe(0);
    expect(Email.dist('', 'aaa')).toBe(3);
    expect(Email.dist('aaa', '')).toBe(3);

    expect(Email.dist('sit', 'sits')).toBe(1);
    expect(Email.dist('sit', 'hit')).toBe(1);
    expect(Email.dist('sit', 'hat')).toBe(2);
    expect(Email.dist('kitten', 'sitting')).toBe(3);

    expect(Email.dist('sits', 'sit')).toBe(1);
    expect(Email.dist('hit', 'sit')).toBe(1);
    expect(Email.dist('hat', 'sit')).toBe(2);
    expect(Email.dist('sitting', 'kitten')).toBe(3);

    expect(Email.dist('gmail.com', 'gamil.com')).toBe(2);
    expect(Email.dist('gmail.com', 'gmaail.com')).toBe(1);
    expect(Email.dist('gmaail.com', 'gmail.com')).toBe(1);
  });

  it('suggests corrections for typos', () => {
    expect(Email.suggestion('andrew@gmail.com')).toBe(null);
    expect(Email.suggestion('andrew@gamil.com')).toBe('andrew@gmail.com');
    expect(Email.suggestion('andrew@gmaiil.com')).toBe('andrew@gmail.com');
    expect(Email.suggestion('andrew@liamg.com')).toBe(null);

    expect(Email.suggestion('andrew@gmail.org')).toBe(null);
    expect(Email.suggestion('andrew@gmail.org', true)).toBe('andrew@gmail.com');
  });
});
