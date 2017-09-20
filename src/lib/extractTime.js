export function extractPushTime(changes) {
  const {
    local_time: isLocalTime,
    push_time_type,
    push_time,
    push_time_iso,
  } = changes;

  if (push_time_type === 'time') {
    if (isLocalTime) {
      return push_time;
    }
    return push_time_iso;
  }
}

export function extractExpirationTime(changes, extractedPushTime) {
  const {
    local_time: isLocalTime,
    push_time_type,

    push_expires,
    expiration_time_type,
    expiration_interval_unit,
    expiration_interval_num,
    expiration_time
  } = changes;

  let time;
  if (push_expires) {
    if (expiration_time_type === 'interval') {
      time = parseInt(expiration_interval_num, 10);
      if (expiration_interval_unit === 'hours') {
        time *= 60 * 60;
      } else if (expiration_interval_unit === 'days') {
        time *= 60 * 60 * 24;
      }

      if (push_time_type === 'time' && !isLocalTime) {
        time += Math.floor(Date.parse(extractedPushTime) / 1000);
      }
    } else if (expiration_time_type === 'time') {
      time = expiration_time;
    }
  }
  return time;
}
