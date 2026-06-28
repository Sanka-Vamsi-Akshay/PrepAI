import winston from 'winston';
import { env } from '@backend/config/env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

import { asyncLocalStorage } from '@backend/utils/als';

// Custom format to inject request ID from async local storage
const addRequestId = winston.format((info) => {
  const store = asyncLocalStorage.getStore();
  const requestId = store?.get('requestId');
  if (requestId) {
    info.requestId = requestId;
  }
  return info;
});

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  addRequestId()
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => {
          const reqIdStr = info.requestId ? ` [reqId=${info.requestId}]` : '';
          return `[${info.timestamp}] [${info.level}]${reqIdStr}: ${info.message}`;
        }
      )
    ),
  }),
];

if (env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }) as any,
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }) as any
  );
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});
