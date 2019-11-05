const childProcess = require('child_process');
const moment = require('moment');

function getLogMetrics(daysCount = 0) {
    let gitCommand = `git log --numstat --pretty=format:"%ad"`;

    if (daysCount > 0) {
        const startDate = moment()
            .subtract(daysCount, 'days')
            .toISOString();

        gitCommand = `${gitCommand} --since="${startDate}"`;
    }

    return childProcess.execSync(gitCommand, { encoding: "utf-8" });
}

function getMetricTokens(logLines) {
    const dataPattern = /^([0-9]+)\s+([0-9]+)\s+([^\s].+)$/i;

    let something = logLines
        .filter(line => {
            return line.trim() !== ''
                && !line.includes('=>');
        });

    let lastDate = null;

    const somethingSomething = something.reduce((logData, logLine) => {
        if(dataPattern.test(logLine)){
            return logData.concat({
                date: lastDate,
                tokens: logLine.split('\t')
            });
        } else {
            lastDate = logLine;
            return logData;
        }
    }, []);

    return somethingSomething.map(line => line.tokens.concat(line.date));
}

function buildFileMetricsMap(metricValues) {
    return metricValues
        .reduce((finalMetrics, logValues) => {
            const fileName = logValues[2];
            const logDate = logValues[3];

            const hasMetrics = typeof finalMetrics[fileName] !== 'undefined';

            const currentValue = hasMetrics ? finalMetrics[fileName].churnCount : 0;
            const startDate = hasMetrics ? finalMetrics[fileName].startDate : logDate;

            finalMetrics[fileName] = {
                churnCount: currentValue + 1,
                startDate: startDate,
                endDate: logDate
            };

            return finalMetrics;
        }, {});
}

function descendingMetricSort(metric1, metric2) {
    return metric2.churnCount - metric1.churnCount;
}

function buildSortedOutputValues(fileMetricsMap) {
    const extractedOutputValues = Object
        .keys(fileMetricsMap)
        .map(key => ({
            fileName: key,
            churnCount: fileMetricsMap[key].churnCount,
            startDate: fileMetricsMap[key].startDate,
            endDate: fileMetricsMap[key].endDate
        }));

    extractedOutputValues.sort(descendingMetricSort);

    return extractedOutputValues;
}

function getSortedLogMetrics(dayCount) {
    const logMetrics = getLogMetrics(dayCount);

    const logLines = logMetrics.split('\n');
    const metricTokens = getMetricTokens(logLines);
    const fileMetricsMap = buildFileMetricsMap(metricTokens);

    return buildSortedOutputValues(fileMetricsMap);
}

module.exports = {
    getSortedLogMetrics
};