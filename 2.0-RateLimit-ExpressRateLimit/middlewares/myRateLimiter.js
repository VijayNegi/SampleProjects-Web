// This code is from here -  https://www.npmjs.com/package/express-rate-limit 
// source/memory-store.ts
var calculateNextResetTime = (windowMs) => {
  const resetTime = new Date();
  resetTime.setMilliseconds(resetTime.getMilliseconds() + windowMs);
  return resetTime;
};
var MemoryStore = class {
  init(options) {
    this.windowMs = options.windowMs;
    this.resetTime = calculateNextResetTime(this.windowMs);
    this.hits = {};
    this.interval = setInterval(async () => {
      await this.resetAll();
    }, this.windowMs);
    if (this.interval.unref)
      this.interval.unref();
  }
  async increment(key) {
    var _a;
    const totalHits = ((_a = this.hits[key]) != null ? _a : 0) + 1;
    this.hits[key] = totalHits;
    return {
      totalHits,
      resetTime: this.resetTime
    };
  }
  async decrement(key) {
    const current = this.hits[key];
    if (current)
      this.hits[key] = current - 1;
  }
  async resetKey(key) {
    delete this.hits[key];
  }
  async resetAll() {
    this.hits = {};
    this.resetTime = calculateNextResetTime(this.windowMs);
  }
  shutdown() {
    clearInterval(this.interval);
  }
};

// source/lib.ts
var isLegacyStore = (store) => typeof store.incr === "function" && typeof store.increment !== "function";
var promisifyStore = (passedStore) => {
  if (!isLegacyStore(passedStore)) {
    return passedStore;
  }
  const legacyStore = passedStore;
  class PromisifiedStore {
    async increment(key) {
      return new Promise((resolve, reject) => {
        legacyStore.incr(
          key,
          (error, totalHits, resetTime) => {
            if (error)
              reject(error);
            resolve({ totalHits, resetTime });
          }
        );
      });
    }
    async decrement(key) {
      return legacyStore.decrement(key);
    }
    async resetKey(key) {
      return legacyStore.resetKey(key);
    }
    async resetAll() {
      if (typeof legacyStore.resetAll === "function")
        return legacyStore.resetAll();
    }
  }
  return new PromisifiedStore();
};
var parseOptions = (passedOptions) => {
  var _a, _b, _c;
  const notUndefinedOptions = omitUndefinedOptions(passedOptions);
  const config = {
    windowMs: 60 * 1e3,
    max: 5,
    message: "Too many requests, please try again later.",
    statusCode: 429,
    legacyHeaders: (_a = passedOptions.headers) != null ? _a : true,
    standardHeaders: (_b = passedOptions.draft_polli_ratelimit_headers) != null ? _b : false,
    requestPropertyName: "rateLimit",
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    requestWasSuccessful: (_request, response) => response.statusCode < 400,
    skip: (_request, _response) => false,
    keyGenerator(request, _response) {
      if (!request.ip) {
        console.error(
          "WARN | `express-rate-limit` | `request.ip` is undefined. You can avoid this by providing a custom `keyGenerator` function, but it may be indicative of a larger issue."
        );
      }
      return request.ip;
    },
    async handler(request, response, _next, _optionsUsed) {
      response.status(config.statusCode);
      const message = typeof config.message === "function" ? await config.message(
        request,
        response
      ) : config.message;
      if (!response.writableEnded) {
        response.send(message != null ? message : "Too many requests, please try again later.");
      }
    },
    onLimitReached(_request, _response, _optionsUsed) {
    },
    ...notUndefinedOptions,
    store: promisifyStore((_c = notUndefinedOptions.store) != null ? _c : new MemoryStore())
  };
  if (typeof config.store.increment !== "function" || typeof config.store.decrement !== "function" || typeof config.store.resetKey !== "function" || typeof config.store.resetAll !== "undefined" && typeof config.store.resetAll !== "function" || typeof config.store.init !== "undefined" && typeof config.store.init !== "function") {
    throw new TypeError(
      "An invalid store was passed. Please ensure that the store is a class that implements the `Store` interface."
    );
  }
  return config;
};
var handleAsyncErrors = (fn) => async (request, response, next) => {
  try {
    await Promise.resolve(fn(request, response, next)).catch(next);
  } catch (error) {
    next(error);
  }
};
var rateLimit = (passedOptions) => {
  const options = parseOptions(passedOptions != null ? passedOptions : {});
  if (typeof options.store.init === "function")
    options.store.init(options);
  const middleware = handleAsyncErrors(
    async (request, response, next) => {
      const skip = await options.skip(request, response);
      if (skip) {
        next();
        return;
      }
      const augmentedRequest = request;
      const key = await options.keyGenerator(request, response);
      const { totalHits, resetTime } = await options.store.increment(key);
      const retrieveQuota = typeof options.max === "function" ? options.max(request, response) : options.max;
      const maxHits = await retrieveQuota;
      augmentedRequest[options.requestPropertyName] = {
        limit: maxHits,
        current: totalHits,
        remaining: Math.max(maxHits - totalHits, 0),
        resetTime
      };
      if (options.legacyHeaders && !response.headersSent) {
        response.setHeader("X-RateLimit-Limit", maxHits);
        response.setHeader(
          "X-RateLimit-Remaining",
          augmentedRequest[options.requestPropertyName].remaining
        );
        if (resetTime instanceof Date) {
          response.setHeader("Date", new Date().toUTCString());
          response.setHeader(
            "X-RateLimit-Reset",
            Math.ceil(resetTime.getTime() / 1e3)
          );
        }
      }
      if (options.standardHeaders && !response.headersSent) {
        response.setHeader("RateLimit-Limit", maxHits);
        response.setHeader(
          "RateLimit-Remaining",
          augmentedRequest[options.requestPropertyName].remaining
        );
        if (resetTime) {
          const deltaSeconds = Math.ceil(
            (resetTime.getTime() - Date.now()) / 1e3
          );
          response.setHeader("RateLimit-Reset", Math.max(0, deltaSeconds));
        }
      }
      if (options.skipFailedRequests || options.skipSuccessfulRequests) {
        let decremented = false;
        const decrementKey = async () => {
          if (!decremented) {
            await options.store.decrement(key);
            decremented = true;
          }
        };
        if (options.skipFailedRequests) {
          response.on("finish", async () => {
            if (!options.requestWasSuccessful(request, response))
              await decrementKey();
          });
          response.on("close", async () => {
            if (!response.writableEnded)
              await decrementKey();
          });
          response.on("error", async () => {
            await decrementKey();
          });
        }
        if (options.skipSuccessfulRequests) {
          response.on("finish", async () => {
            if (options.requestWasSuccessful(request, response))
              await decrementKey();
          });
        }
      }
      if (maxHits && totalHits === maxHits + 1) {
        options.onLimitReached(request, response, options);
      }
      if (maxHits && totalHits > maxHits) {
        if ((options.legacyHeaders || options.standardHeaders) && !response.headersSent) {
          response.setHeader("Retry-After", Math.ceil(options.windowMs / 1e3));
        }
        options.handler(request, response, next, options);
        return;
      }
      next();
    }
  );
  middleware.resetKey = options.store.resetKey.bind(options.store);
  return middleware;
};
var omitUndefinedOptions = (passedOptions) => {
  const omittedOptions = {};
  for (const k of Object.keys(passedOptions)) {
    const key = k;
    if (passedOptions[key] !== void 0) {
      omittedOptions[key] = passedOptions[key];
    }
  }
  return omittedOptions;
};
var lib_default = rateLimit;
module.exports = rateLimit; module.exports.default = rateLimit; module.exports.rateLimit = rateLimit; module.exports.MemoryStore = MemoryStore;
