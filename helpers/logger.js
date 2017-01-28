/* eslint no-console: 0 */

const prependMessage = (log, pre) => (...args) => {
  const message = args.shift();

  log(`${pre} ${message}`, ...args);
};

// basic logger
const prependableLogger = (log, preInfo, preError) => {
  return {
    info: (...args) => prependMessage(log, preInfo)(...args),
    error: (...args) => prependMessage(log, preError)(...args),
  };
};

const nullLogger = {
  info: () => {},
  error: () => {},
};

const withRequestId = (logger, requestId) => {
  if (!requestId) {
    return logger;
  }

  return {
    info: (message) => logger.info(`request_id=${requestId} ${message}`),
    error: (message) => logger.error(`request_id=${requestId} ${message}`),
  };
};

exports.prependableLogger = prependableLogger;

exports.withRequestId = withRequestId;

exports.consoleLogger = (env) => {
  if (env === 'test') {
    return nullLogger;
  }

  return prependableLogger(console.log, '[info]', '[error]');
};