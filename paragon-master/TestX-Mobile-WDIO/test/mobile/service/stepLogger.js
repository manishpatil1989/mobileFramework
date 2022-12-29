const logger = require('@wdio/logger').default;
const log = logger('StepLogger');

class StepLogger {
  beforeStep(step, scenario, context) {
    log.info(`[${scenario.name}] ${step.text}]`);
  }
}

exports.default = StepLogger;

