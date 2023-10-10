(() => {
    'use strict';

    const isDev = !true;
    const EOL = '\n';
    const FIELD_SEPARATOR = ',';
    const UTF8_BOM = Uint8Array.from([0xEF, 0xBB, 0xBF]);
    const CSV_HEADER = 'Position,Website,Page Title,Description,Source';
    const FILENAME = 'SERP Results by Linkpitch.io.csv';

    const l = console.log;
    const nl = console.log.bind(null, '');

    if (location.hostname !== 'www.google.com') {
        alert('Google.com page is required!');
        return;
    }

    const query = document.querySelector('[name=q]').value;
    l(query);

    if (document.querySelector('#search') === null) {
        alert('Too early!');
        return;
    }

    /* scrape results */
    const results = [];
    let num = 0;

    document.querySelectorAll('h3.LC20lb').forEach(function (titleElem) {
        nl();
        nl();
        l(titleElem);

        if (titleElem.closest('[data-q]')) {
            l('skip &quot;People also ask&quot; block');
            return;
        }

        if (isDev) {
            titleElem.style.border = '2px solid green';
        }

        const contentDiv = titleElem.closest('.srKDX, .N54PNb, .tF2Cxc, .PmEWq');
        l(contentDiv);

        const result = {
            position: ++num,
            url: contentDiv.querySelector('a').href,
            title: titleElem.textContent,
        };

        let descDiv = contentDiv.querySelector('[data-snf=nke7rc], [data-snf=qNNggc], .IsZvec, .fzUZNc, [data-snf=jJxsYb]');
        l(descDiv);

        result.desc = descDiv ? descDiv.textContent : '';

        if (isDev) {
            descDiv.style.border = '2px solid magenta';
        }

        l(result);
        results.push(result);
    });

    if (results.length === 0) {
        alert('Zero results!');
        return;
    }

    console.table(results);

    if (isDev) {
        return;
    }

    /* convert to CSV */
    const csvData = [CSV_HEADER].concat(results.map(result => [
        result.position,
        sanitizeStrToCSV(result.url),
        sanitizeStrToCSV(result.title),
        sanitizeStrToCSV(result.desc),
        sanitizeStrToCSV(query),
    ].join(FIELD_SEPARATOR))).join(EOL);

    l(csvData);

    /* save file */
    const a = document.createElement('a');
    a.download = FILENAME;
    a.href = URL.createObjectURL(new Blob([UTF8_BOM, csvData], {
        type: 'text/csv',
    }));
    a.click();
    URL.revokeObjectURL(a.href);

    function sanitizeStrToCSV(str) {
        if (!str) {
            return '';
        }

        if (typeof str !== 'string') {
            str = String(str);
        }

        let isNeedQuotesAround = false;

        if (/&quot;|\r|\n/.test(str)) {
            str = str.replace(/&quot;/g, '&quot;&quot;');
            isNeedQuotesAround = true;
        } else if (str.includes(',')) {
            isNeedQuotesAround = true;
        }

        if (isNeedQuotesAround) {
            str = '&quot;' + str + '&quot;';
        }

        return str;
    }
})();