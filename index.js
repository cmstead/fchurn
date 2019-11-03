const childProcess = require('child_process');
const gitCommand = `git log --numstat --oneline`;

const logMetrics = childProcess.execSync(gitCommand, { encoding: "utf-8" });
const dataPattern = /^([0-9]+)\s*([0-9]+)\s*([^\s].+)$/i;

const fileMetrics = logMetrics
    .split('\n')
    .map(line => 
            line
            .trim()
            .match(dataPattern))
    .filter(lineValues => lineValues !== null)
    .map(lineValues => lineValues.slice(1, 4))
    .reduce((finalMetrics, logValues) => {
        const fileName = logValues[2];
        const hasMetrics = typeof finalMetrics[fileName] !== 'undefined';
        const currentValue = hasMetrics ? finalMetrics[fileName] : 0; 

        finalMetrics[fileName] = currentValue + 1;

        return finalMetrics;
    }, {});

const outputValues = Object
    .keys(fileMetrics)
    .map(key => [key, fileMetrics[key]]);

outputValues.sort((a, b) => b[1] - a[1]);

outputValues.forEach(value => console.log(`\nChurn: ${value[1]} \nFile Name: ${value[0]}`));


