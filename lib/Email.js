/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const domains = [
  'aol.com',
  'att.net',
  'bellsouth.net',
  'btinternet.com',
  'comcast.net',
  'cox.net',
  'earthlink.net',
  'gmail.com',
  'gmx.com',
  'gmx.de',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.de',
  'hotmail.fr',
  'live.com',
  'live.co.uk',
  'live.fr',
  'mail.ru',
  'naver.com',
  'o2.co.uk',
  'orange.net',
  'orange.fr',
  'sbcglobal.net',
  'sina.com',
  'sky.com',
  'verizon.net',
  'virgin.net',
  'virginmedia.com',
  'yahoo.com',
  'yahoo.co.id',
  'yahoo.co.in',
  'yahoo.co.jp',
  'yahoo.co.kr',
  'yahoo.co.ph',
  'yahoo.co.sp',
  'yahoo.co.uk',
  'yahoo.fr',
  'yandex.ru',
];

const domainMap = {};
for (let i = domains.length; i--;) {
  let levels = domains[i].split('.');
  let secondLevel = levels.shift();
  let tld = levels.join('.');
  let pairs = domainMap[secondLevel];
  if (!pairs) {
    domainMap[secondLevel] = [tld];
  } else {
    pairs.push(tld);
  }
}

export function dist(a, b) {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  let vectors = [];
  for (let i = 0; i <= a.length; i++) {
    let row = [];
    for (let j = 0; j <= b.length; j++) {
      row[j] = 0;
    }
    vectors[i] = row;
  }

  for (let i = 1; i <= a.length; i++) {
    vectors[i][0] = i;
  }
  for (let i = 1; i <= b.length; i++) {
    vectors[0][i] = i;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (a[i - 1] === b[j - 1]) {
        vectors[i][j] = vectors[i - 1][j - 1];
      } else {
        vectors[i][j] = Math.min(
          vectors[i - 1][j] + 1,
          Math.min(vectors[i][j - 1] + 1, vectors[i - 1][j - 1] + 1)
        );
      }
    }
  }

  return vectors[a.length][b.length];
}

export const emailRegex = /^([^@<>\s]+)@([^@<>\s]{2,}\.[^@<>\s]{2,})$/;

// If we think there's a typo, return a string suggesting a correction
// Return null if we have no suggestion
export function suggestion(email, checkTLD) {
  let match = email.match(emailRegex);
  if (!match) {
    return null;
  }
  let emailDomain = match[2].toLowerCase();
  let emailSecondLevel = emailDomain.split('.').shift();

  let closestDistance = Infinity;
  let closestDomain = '';
  let secondLevelDomains = Object.keys(domainMap);
  let i;
  let d;
  for (i = secondLevelDomains.length; i--;) {
    d = dist(emailSecondLevel, secondLevelDomains[i]);
    if (d < closestDistance && d < secondLevelDomains[i].length - 1) {
      closestDistance = d;
      closestDomain = secondLevelDomains[i];
    }
    if (d === 0) {
      break;
    }
  }
  if (closestDistance > 3 || (!checkTLD && closestDistance === 0)) {
    return null;
  }
  let selectedDomain = closestDomain;
  closestDistance = Infinity;

  let tlds = domainMap[selectedDomain];
  for (i = tlds.length; i--;) {
    let joined = selectedDomain + '.' + tlds[i];
    d = dist(emailDomain, joined);
    if (d < closestDistance) {
      closestDistance = d;
      closestDomain = joined;
    }
  }
  if (closestDistance === 0 || closestDistance > 3) {
    return null;
  }
  return match[1] + '@' + closestDomain;
}