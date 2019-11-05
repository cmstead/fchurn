#!/usr/bin/env node

const logMetricTooling = require('./logMetricTooling');
const helpService = require('./helpService');
const path = require('path');

const args = process.argv.slice(2);
const argsMap = {};

const FILENAME = '--fileName';
const HELP = '--help';
const JSONKEY = '--json';
const SNAPSHOTDAYCOUNT = '--snapshotDayCount';
const SHOWTOP = '--showTop';

for (let i = 0; i < args.length; i++) {
    if (args[i] === HELP) {
        argsMap[HELP] = true;
    } else if (args[i] === JSONKEY) {
        argsMap[JSONKEY] = true;
    } else {
        argsMap[args[i]] = args[i + 1];
        i++;
    }
}

if (argsMap[HELP]) {
    helpService.showHelpInfo();
    process.exit();
}

const dayCount = typeof argsMap[SNAPSHOTDAYCOUNT] === 'string'
    ? parseInt(argsMap[SNAPSHOTDAYCOUNT]) : 0;

const fileDisplayCount = typeof argsMap[SHOWTOP] === 'string'
    ? parseInt(argsMap[SHOWTOP]) : 0;

let outputValues = logMetricTooling.getSortedLogMetrics(dayCount);

if (fileDisplayCount > 0) {
    outputValues = outputValues.slice(0, fileDisplayCount);
} else if (argsMap[FILENAME]) {
    outputValues = outputValues.filter(value => value.fileName.endsWith(argsMap[FILENAME]));
}

if(argsMap[JSONKEY]) {
    console.log(JSON.stringify(outputValues, null, 4));
} else {
    outputValues.forEach(metric => console.log(`
Churn: ${metric.churn}
Modification Count: ${metric.modificationCount}
File Churn Window: ${metric.churnWindow} day(s)
File Path: .${path.sep}${metric.fileName}`));
}

console.log('');