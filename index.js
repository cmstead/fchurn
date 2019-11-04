const childProcess = require('child_process');

function getLogMetrics() {
    const gitCommand = `git log --numstat --oneline`;

    return childProcess.execSync(gitCommand, { encoding: "utf-8" });
}

function getMetricTokens(logLines) {
    const dataPattern = /^([0-9]+)\s+([0-9]+)\s+([^\s].+)$/i;

    return logLines
        .filter(line => {
            return dataPattern.test(line)
                && !line.includes('=>');
        })
        .map(line =>
            line
                .trim()
                .match(dataPattern))
        .filter(lineValues => lineValues !== null);
}

function getMetricValues(metricTokens) {
    return metricTokens
        .map(lineValues => lineValues.slice(1, 4));
}

function buildFileMetricsMap(metricValues) {
    return metricValues
        .reduce((finalMetrics, logValues) => {
            const fileName = logValues[2];
            const hasMetrics = typeof finalMetrics[fileName] !== 'undefined';
            const currentValue = hasMetrics ? finalMetrics[fileName] : 0;

            finalMetrics[fileName] = currentValue + 1;

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
            churnCount: fileMetricsMap[key]
        }));

    extractedOutputValues.sort(descendingMetricSort);

    return extractedOutputValues;
}

function getSortedLogMetrics() {
    const logMetrics = getLogMetrics();
    const logLines = logMetrics.split('\n');
    const metricTokens = getMetricTokens(logLines);

    console.log(metricTokens);

    const metricValues = getMetricValues(metricTokens);
    const fileMetricsMap = buildFileMetricsMap(metricValues);

    return buildSortedOutputValues(fileMetricsMap);    
}

const outputValues = getSortedLogMetrics();

outputValues.forEach(metric => console.log(`\nChurn: ${metric.churnCount} \nFile Name: ${metric.fileName}`));


