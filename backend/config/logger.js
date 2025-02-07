import pino from "pino";

const logger = pino(
  {
    transport: {
      target: 'pino-pretty'
    }, 
  },
  pino.destination("./app.log") 
);

logger.customError = (req, err) => {
  if (err.logActive === false) {
    return;
  }
  logger.error(JSON.stringify({
    method: req.method,
    originalUrl: req.originalUrl,
    error: err,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: req.headers,
  }));
}

export default logger;

// logger.fatal('fatal');
// logger.error('error');
// logger.warn('warn');
// logger.info('info');