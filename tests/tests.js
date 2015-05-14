var i18n = require('../lib/i18n-merge'),
    _ = require('lodash');

should = require('should');

describe('i18n tests', function(){

    var testObj = {
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
            },
            {
                Name: "common de",
                commonVal: "common de",
                Language: {
                    IETF: "de",
                    Code: "de",
                    Region: null
                }
            },
            {
                Name: "specific de",
                Language: {
                    IETF: "de-DE",
                    Code: "de",
                    Region: 'DE'
                }
            },
            {
                Name: "common fr",
                Language: {
                    IETF: "fr",
                    Code: "fr",
                    Region: null
                }
            }
        ]
    };

    it('should merge the fields for the specified language', function(){

        var result = _.cloneDeep(testObj);
        i18n.merge(result, [ { code: "en", region: "US", quality: 1.0 } ]);

        result.I18n.Name.should.eql("gonna drink some beer and shoot some stuff y'all");
        result.I18n.Language.IETF.should.eql("en-US");
    });

    it('should handle arrays of source objects', function(){
        var result = []
        result.push(_.cloneDeep(testObj));
        result.push(_.cloneDeep(testObj));
        i18n.merge(result, [ { code: "en", region: "US", quality: 1.0 } ]);

        result.length.should.eql(2);
        result[0].I18n.Name.should.eql("gonna drink some beer and shoot some stuff y'all");
        result[1].I18n.Name.should.eql("gonna drink some beer and shoot some stuff y'all");
    });

    it('should automatically fallback to the parent language', function(){
        var result = _.cloneDeep(testObj);
        i18n.merge(result, [ { code: "fr", region: "FR", quality: 1.0 } ]);

        result.I18n.Name.should.eql("common fr");
    });

    it('should automatically merge fields from the parent language', function(){
        var result = _.cloneDeep(testObj);
        i18n.merge(result, [ { code: "de", region: "DE", quality: 1.0 } ]);

        result.I18n.commonVal.should.eql("common de");
    });

    it('should sort the language set based on quality', function(){
        var result = _.cloneDeep(testObj);
        i18n.merge(result, [ { code: "en", region: "GB", quality: 0.6 }, { code: "de", region: "DE", quality: 1.0 }  ]);

        result.I18n.Name.should.eql("specific de");
    });

    it('should compare language codes in a case-insensitive manner', function(){
        var result = _.cloneDeep(testObj);

        i18n.merge(result, [ { code: "En", region: "Us", quality: 1.0 } ]);
        result.I18n.Language.IETF.should.eql("en-US");
    });

    it('should treat * as en', function(){
        var result = _.cloneDeep(testObj);

        i18n.merge(result, [ { code: "*", region: null, quality: 1.0 } ]);
        result.I18n.Language.IETF.should.eql("en");
    });

});