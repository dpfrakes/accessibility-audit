const pa11y = require('pa11y');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
const csvParser = require('csv-parser');
const slugify = require('slugify');

runAccessibilityTest();

function writeSummary(content) {
    content.sort((a, b) => a.URL > b.URL)
    let writer = csvWriter({ headers: ['URL', 'Errors', 'Warnings', 'Notices', 'Last Update']});
    writer.pipe(fs.createWriteStream('summary.csv'));
    content.forEach((row) => writer.write(row));
    writer.end();
}

function outputHTML(data) {
    console.log('Exporting report...')
    let html = fs.readFileSync('./report_template.html', 'utf8');
    html = html.replace('REPLACEME', JSON.stringify(data));
    fs.writeFile('report/index.html', html, 'utf8', (err) => {
        if (err) throw err;
        console.log('Saved HTML report');
    });
}

async function runAccessibilityTest() {

    try {

        // Save all details in JSON object
        let allResults = {};

        // Runtime
        let datetime = new Date();

        // Read URLs from [Jenkins] env variable
        let urls = process.env.A11Y_URLS.split('\n');

        // Create reports dir if it doesn't exist
        if (urls.length > 0 && !fs.existsSync('./reports')) {
            fs.mkdirSync('./reports');
        }

        // Global options
        let options = {
            standard: 'WCAG2AA',
            timeout: 60000,
            includeWarnings: true,
            includeNotices: false
        };

        console.log(options);

        // Run tests against multiple URLs
        let results = await Promise.all(urls.map((url) => pa11y(url, options)));

        // Save summary to return to Jenkins job for email notification
        let summary = [];

        results.map((r) => {

            // Write single row summary for URL
            summary.push({
                'URL': r.pageUrl,
                'Errors': r.issues.filter((i) => i.typeCode === 1).length,
                'Warnings': r.issues.filter((i) => i.typeCode === 2).length,
                'Notices': r.issues.filter((i) => i.typeCode === 3).length,
                'Last Update': datetime.toLocaleString()
            });

            // Save details to single JS object
            let detailObj = r.issues.reduce((a, b) => {
                a[b.code] = b.code in a ? a[b.code] + 1 : 1;
                return a;
            }, {});

            allResults[r.pageUrl] = detailObj;

            // Write complete report for URL
            let reportWriter = csvWriter()
            reportWriter.pipe(fs.createWriteStream(`reports/${slugify(r.documentTitle)}.csv`));
            for(i = 0; i < r.issues.length; i++) {
                reportWriter.write(r.issues[i]);
            }
            reportWriter.end();
        });

        // If summary.csv already exists, read it and update only the necessary lines
        if (fs.existsSync('./summary.csv')) {
            fs.createReadStream('summary.csv')
                .pipe(csvParser())
                .on('data', function (data) {
                    // For each line, if new audit doesn't include previous URL, use previous URL
                    if (!summary.filter((row) => row.URL == data.URL)[0]) {
                        summary.push(data);
                    }
                })
                .on('end', () => writeSummary(summary));
        } else {
            writeSummary(summary);
        }

        // Write JSON to report HTML
        outputHTML(allResults);

    } catch (error) {
        console.error(error.message);
    }
}
