const pa11y = require('pa11y');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
const slugify = require('slugify');

runAccessibilityTest();

async function runAccessibilityTest() {
    try {

        // Read URLs from [Jenkins] env variable
        let urls = process.env.A11Y_URLS.split('\n');

        // Create reports dir if it doesn't exist
        if (urls.length > 0 && !fs.existsSync('./reports')) {
            fs.mkdirSync('./reports');
        }

        // Global options
        let options = {
            'includeWarnings': true,
            'includeNotices': true
        };

        // Run tests against multiple URLs
        let results = await Promise.all(urls.map((url) => pa11y(url, options)));

        // Write summary results to CSV
        let summaryWriter = csvWriter({ headers: ['URL', 'Errors', 'Warnings', 'Notices']})
        summaryWriter.pipe(fs.createWriteStream('summary.csv'))

        // Save summary to return to Jenkins job for email notification
        let summary = [];

        results.map((r) => {

            // Write single row summary for URL
            let summaryRow = [
                r.pageUrl,
                r.issues.filter((i) => i.typeCode === 1).length,
                r.issues.filter((i) => i.typeCode === 2).length,
                r.issues.filter((i) => i.typeCode === 3).length
            ]

            summaryWriter.write(summaryRow);
            summary.push(summaryRow)

            // Write complete report for URL
            let reportWriter = csvWriter()
            reportWriter.pipe(fs.createWriteStream(`reports/${slugify(r.documentTitle)}.csv`))
            for(i = 0; i < r.issues.length; i++) {
                reportWriter.write(r.issues[i])
            }
            reportWriter.end()

        })

        summaryWriter.end()
        return summary;

    } catch (error) {
        console.error(error.message);
    }
}
