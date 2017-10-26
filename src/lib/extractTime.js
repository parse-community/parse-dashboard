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

export function extractExpiration(changes) {
  const {
    local_time: isLocalTime,
    push_time,
    push_expires,
    expiration_time_type,
    expiration_interval_unit,
    expiration_interval_num,
    expiration_time
  } = changes;

  if (push_expires) {
    if (expiration_time_type === 'interval') {
      let time = parseInt(expiration_interval_num, 10);
      if (expiration_interval_unit === 'hours') {
        time *= 60 * 60;
      } else if (expiration_interval_unit === 'days') {
        time *= 60 * 60 * 24;
      }

      return { expiration_interval: time };
    } else if (expiration_time_type === 'time') {
      if (isLocalTime) {
        const pushTime = new Date(push_time);
        const expirationTime = new Date(expiration_time);
        const diffSeconds = Math.floor((expirationTime - pushTime) / 1000);
        return { expiration_interval: diffSeconds };
      }

      return { expiration_time };
    }
  }

  return {};
}
