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
        if (dataPattern.test(logLine)) {
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

            if(hasMetrics) {
                finalMetrics[fileName].churnCount += 1;
                finalMetrics[fileName].startDate = logDate;
            } else {
                finalMetrics[fileName] = {
                    churnCount: 1,
                    startDate: logDate
                };
            }

            return finalMetrics;
        }, {});
}

function descendingMetricSort(metric1, metric2) {
    return metric2.churn - metric1.churn;
}

function buildSortedOutputValues(fileMetricsMap) {
    const extractedOutputValues = Object
        .keys(fileMetricsMap)
        .map(key => {
            const startDate = new Date(fileMetricsMap[key].startDate);
            const endDate = new Date();

            const start = moment(startDate);
            const end = moment(endDate);

            const rawDuration = moment.duration(end.diff(start)).asDays();
            const duration = rawDuration ? Math.ceil(rawDuration) : 1;

            const churnCount = fileMetricsMap[key].churnCount;

            return {
                fileName: key,
                modificationCount: churnCount,
                churn: churnCount / duration,
                churnWindow: duration
            }
        });

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