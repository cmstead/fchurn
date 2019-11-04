function showHelpInfo() {
    console.log(`
FChurn -- The file churn CLI utility
====================================

fchurn [--help][--flag value]

Flag options:

fileName
    Value: file name string
    Description: Get the churn for all files matching file name string

help
    Value: none
    Description: display help info

json
    Value: none
    Description: Display churn metrics in JSON format

showTop
    Value: Number of churn records to show
    Description: Show the top X churned files

snapshotDayCount
    Value: Number of days to include in the churn snapshot
    Description: Build a churn snapshot of the past X days

Examples:
---------

Show the 10 files with the highest churn over the last 30 days
fchurn --showTop 10 --snapshotDayCount 30

Show the churn of the package file over the past year
fchurn --fileName "package.json" --snapshotDayCount 365
`);
}

module.exports = {
    showHelpInfo
};