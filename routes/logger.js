var log4js = require('log4js');

log4js.configure({ 
  appenders: {
    out: { type: 'console' }, 
    task: { type: 'dateFile', filename: 'logs/task',"pattern":"-dd.log", alwaysIncludePattern:true }, 
    result: { type: 'dateFile', filename: 'logs/result',"pattern":"-dd.log", alwaysIncludePattern:true}, 
    error: { type: 'dateFile', filename: 'logs/error', "pattern":"-dd.log",alwaysIncludePattern:true}, 
    default: { type: 'dateFile', filename: 'logs/default', "pattern":"-dd.log",alwaysIncludePattern:true}, 
    rate: { type: 'dateFile', filename: 'logs/rate', "pattern":"-dd.log",alwaysIncludePattern:true} 
  },
  categories: {
    default: { appenders: ['out','default'], level: 'info' },
    task: { appenders: ['task'], level: 'info'},
    result: { appenders: ['result'], level: 'info' },
    error: { appenders: ['error'], level: 'error' },
    rate: { appenders: ['rate'], level: 'info' }
  }
});

levels = {
    'trace': log4js.levels.TRACE,
    'debug': log4js.levels.DEBUG,
    'info': log4js.levels.INFO,
    'warn': log4js.levels.WARN,
    'error': log4js.levels.ERROR,
    'fatal': log4js.levels.FATAL
};

exports.logger = function (name, level) {
    var logger = log4js.getLogger(name);
    logger.setLevel(levels[level] || levels['debug']);
    return logger;
};

// 配合 express 使用的方法
exports.use = function (app, level) {
    app.use(log4js.connectLogger(log4js.getLogger('logInfo'), {
        level: levels[level] || levels['debug'],
        format: ':method :url :status'
    }));
};
