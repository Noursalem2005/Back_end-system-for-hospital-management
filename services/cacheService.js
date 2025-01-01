const NodeCache = require('node-cache');
const cacheConfig = require('../config/cache');

class CacheService {
  constructor(ttlSeconds = cacheConfig.ttl) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: cacheConfig.checkPeriod,
      maxKeys: cacheConfig.maxKeys
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, data) {
    return this.cache.set(key, data);
  }

  delete(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }
}

module.exports = new CacheService(); 