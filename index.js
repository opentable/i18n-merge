var i18n = require('./lib/i18n-merge');

var testObj = [{
    filddd: "tt",
    I18n: [
        {
            Name: "gonna drink some beer and shoot some stuff y'all",
            ukval: null,
            Language: {
                IETF: "en-US",
                Code: "en",
                Region: "US"
            }
        },
        {
            Name: "pip pip tally ho crumpets and tea",
            ukval: "uk",
            Language: {
                IETF: "en-GB",
                Code: "en",
                Region: "GB"
            }
        }
    ]
}];

var languages = [
    { code: "en", region: "US", quality: 1.0 },
    { code: "de", region: "DE", quality: 0.8 },
    { code: "en", region: "GB", quality: 0.9 }
];

i18n.merge(testObj, languages);
console.dir(testObj);