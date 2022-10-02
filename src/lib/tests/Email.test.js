/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { dist, suggestion } from '../Email';

describe('dist', () => {
  it('calculates the edit distance between strings', () => {
    expect(dist('aaa', 'aaa')).toBe(0);
    expect(dist('', 'aaa')).toBe(3);
    expect(dist('aaa', '')).toBe(3);

    expect(dist('sit', 'sits')).toBe(1);
    expect(dist('sit', 'hit')).toBe(1);
    expect(dist('sit', 'hat')).toBe(2);
    expect(dist('kitten', 'sitting')).toBe(3);

    expect(dist('sits', 'sit')).toBe(1);
    expect(dist('hit', 'sit')).toBe(1);
    expect(dist('hat', 'sit')).toBe(2);
    expect(dist('sitting', 'kitten')).toBe(3);

    expect(dist('gmail.com', 'gamil.com')).toBe(2);
    expect(dist('gmail.com', 'gmaail.com')).toBe(1);
    expect(dist('gmaail.com', 'gmail.com')).toBe(1);
  });

  it('suggests corrections for typos', () => {
    expect(suggestion('andrew@gmail.com')).toBe(null);
    expect(suggestion('andrew@gamil.com')).toBe('andrew@gmail.com');
    expect(suggestion('andrew@gmaiil.com')).toBe('andrew@gmail.com');
    expect(suggestion('andrew@liamg.com')).toBe(null);

    expect(suggestion('andrew@gmail.org')).toBe(null);
    expect(suggestion('andrew@gmail.org', true)).toBe('andrew@gmail.com');
  });
});
