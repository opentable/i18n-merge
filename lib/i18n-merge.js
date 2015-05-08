var _ = require('lodash');

function getLanguageId(code, region) {
    var languageId =  code;
    if (region) {
        languageId += "-" + region;
    }

    return languageId;
}

function orderLanguageListAndGetCodes(languages, autoFallback) {
    var orderedLanguages = _.sortBy(languages, "quality");
    var languageCodes = [];
    var fallbacks = [];

    for (var i = 0; i < orderedLanguages.length; i++) {
        var language = orderedLanguages[i];
        var code = language.code || language.Code;
        var region = language.region || language.Region;

        if (autoFallback && !_.includes(fallbacks, code)) {
            fallbacks.push(code);
            languageCodes.push(code);
        }

        languageCodes.push(getLanguageId(code, region));
    }

    return languageCodes;
}

function mergeForSingleObj(source, orderedLanguages, fnI18nLocation, fnLanguageLocator, fnPostMerge) {
    var i18nCollection = fnI18nLocation(source);

    if (!i18nCollection) {
        return source;
    }

    var mappedI18n = {};
    i18nCollection.forEach(function(i18nObj) {
        var languageId = fnLanguageLocator(i18nObj);
        if (languageId) {
            mappedI18n[languageId] = i18nObj;
        }
    });

    var objsToMerge = [];
    orderedLanguages.forEach(function(language) {
        if (mappedI18n[language]) {
            objsToMerge.push(mappedI18n[language]);
        }
    });

    if (objsToMerge.length === 0) {
        return null;
    } else if (objsToMerge.length === 1) {
        return objsToMerge[0];
    }

    var mergedObj = objsToMerge.shift();
    objsToMerge.forEach(function(mergeObj) {
        _.assign(mergedObj, mergeObj, function(value, other) {
            return (_.isUndefined(other) || _.isNull(other)) ? value : other;
        });
    });

    fnPostMerge(source, mergedObj);
    return source;
}

module.exports.merge = function(sourceObj, languages, options) {

    var fnI18nLocator = function(source) {
        return (source.i18n || source.I18n);
    };

    var fnLanguageLocator = function(i18nSource) {
        var language = (i18nSource.language || i18nSource.Language);
        if (!language) {
            return null;
        }

        var code = (language.code || language.Code);
        var region = (language.region || language.Region);

        return getLanguageId(code, region);
    };

    var fnPostMerge = function(source, mergedI18n) {
        if (source.i18n) {
            source.i18n = mergedI18n;
        }

        if (source.I18n) {
            source.I18n = mergedI18n;
        }
    };

    var autoLanguageFallback = true;

    if (options) {
        if (options.autoLanguageFallback !== undefined) {
            autoLanguageFallback = options.autoLanguageFallback;
        }

        if (options.fnPostMerge !== undefined) {
            fnPostMerge = options.fnPostMerge;
        }

        if (options.fnI18nLocator !== undefined) {
            fnI18nLocator = options.fnI18nLocator;
        }

        if (options.fnLanguageLocator !== undefined) {
            fnLanguageLocator = options.fnLanguageLocator;
        }
    }

    var orderedLanguageIds = orderLanguageListAndGetCodes(languages, autoLanguageFallback);

    if (_.isArray(sourceObj)) {
        sourceObj.forEach(function(src) {
            mergeForSingleObj(src, orderedLanguageIds, fnI18nLocator, fnLanguageLocator, fnPostMerge);
        });
    } else {
        mergeForSingleObj(sourceObj, orderedLanguageIds, fnI18nLocator, fnLanguageLocator, fnPostMerge);
    }
};