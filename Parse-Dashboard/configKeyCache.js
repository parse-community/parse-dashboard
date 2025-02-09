class KeyCache {
  constructor() {
    this.cache = {};
  }

  async get(appId, key, ttl, callback) {
    key = `${appId}:${key}`;
    const cached = this.cache[key];
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const value = await Promise.resolve(callback());
    this.cache[key] = {
      value,
      expiry: Date.now() + ttl,
    };
    return value;
  }
}

module.exports = new KeyCache();
