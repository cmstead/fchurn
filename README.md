# FChurn #

File churn is a great way to see that a part of your application might be modified too often.  This can indicate issues like a "god module/class" or logical pieces are too tightly coupled, making the software harder to change over time.

FChurn (File Churn) helps get a quick read on which files are seeing the most development and which are being created and then left alone.

## Setup ##

Be sure you have a current version of Node.js installed.

To install:

`npm install -g fchurn`

## Usage ##

Open a terminal window (terminal, powershell, cmd.exe, etc.) in a folder containing a git repository.

Run: `fchurn`.

For a full list of options, run `fchurn --help`.

## Help Output ##

fchurn [--help][--flag value]

Flag options:

- fileName
    - Value: file name string
    - Description: Get the churn for all files matching file name string

- help
    - Value: none
    - Description: display help info

- json
    - Value: none
    - Description: Display churn metrics in JSON format

- showTop
    - Value: Number of churn records to show
    - Description: Show the top X churned files

- snapshotDayCount
    - Value: Number of days to include in the churn snapshot
    - Description: Build a churn snapshot of the past X days

Examples:
---------

Show the 10 files with the highest churn over the last 30 days

`fchurn --showTop 10 --snapshotDayCount 30`

Show the churn of the package file over the past year

`fchurn --fileName "package.json" --snapshotDayCount 365`
