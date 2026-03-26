import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf((info) => {
  const level = info.level;
  const message = info.message as string;
  const ts = info['timestamp'] as string;
  const stack = info['stack'] as string | undefined;
  const context = info['context'] as string | undefined;
  const ctx = context ? `[${context}]` : '';
  return `${ts} ${level} ${ctx}: ${stack || message}`;
});

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat,
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat,
      ),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat,
      ),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
};
