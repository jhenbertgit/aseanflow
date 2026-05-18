import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

const logLevel = process.env.LOG_LEVEL ?? 'info';

export const winstonConfig: winston.transport[] = [
  new winston.transports.Console({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('ASEANFlow', {
        colors: true,
        prettyPrint: true,
      }),
    ),
  }),
];
