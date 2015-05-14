var _ = require('lodash');

function getLanguageId(code, region) {
    var languageId =  code;
    if (region) {
        languageId += "-" + region;
    }

    return languageId;
}

function orderLanguageListAndGetCodes(languages, autoFallback, starFallback) {
    var orderedLanguages = _.sortBy(languages, "quality");
    var languageCodes = [];
    var fallbacks = [];

    for (var i = 0; i < orderedLanguages.length; i++) {
        var language = orderedLanguages[i];
        var code = language.code || language.Code;

        if (code === '*') {
            code = starFallback;
        }

        var region = language.region || language.Region;

        if (region && autoFallback && !_.includes(fallbacks, code)) {
            fallbacks.push(code);
            languageCodes.push(code);
        }

        languageCodes.push(getLanguageId(code, region));
    }

    return languageCodes;
}

function mergeSingleObj(source, orderedLanguages, fnI18nLocation, fnLanguageLocator, fnPostMerge) {
    var i18nCollection = fnI18nLocation(source);

    if (!i18nCollection) {
        return source;
    }

    var mappedI18n = {};
    i18nCollection.forEach(function(i18nObj) {
        var languageId = fnLanguageLocator(i18nObj);
        if (languageId) {
            mappedI18n[languageId.toUpperCase()] = i18nObj;
        }
    });

    var objsToMerge = [];
    orderedLanguages.forEach(function(language) {
        var upperLanguage = language.toUpperCase();
        if (mappedI18n[upperLanguage]) {
            objsToMerge.push(mappedI18n[upperLanguage]);
        }
    });

    if (objsToMerge.length === 0) {
        fnPostMerge(source, null);
    } else if (objsToMerge.length === 1) {
        fnPostMerge(source, objsToMerge[0]);
        return objsToMerge[0];
    } else {
        var mergedObj = objsToMerge.shift();
        objsToMerge.forEach(function(mergeObj) {
            _.assign(mergedObj, mergeObj, function(value, other) {
                return (_.isUndefined(other) || _.isNull(other)) ? value : other;
            });
        });

        fnPostMerge(source, mergedObj);
    }

    return source;
}

function getAvailableLanguageParents(arrLanguageIds) {
    var parents = {};

    arrLanguageIds.forEach(function(languageId) {
        var dashIndex = languageId.indexOf('-');
        if (dashIndex > -1) {
            var code = languageId.substr(0, dashIndex);
            if (_.includes(arrLanguageIds, code)) {
                parents[languageId] = code;
            }
        }
    });

    return parents;
}

function collapseSingleObj(source, fnI18nLocation, fnLanguageLocator, fnPostCollapse) {
    var i18nCollection = fnI18nLocation(source);

    if (!i18nCollection) {
        return source;
    }

    var mappedI18n = {};
    var presentLanguages = [];
    i18nCollection.forEach(function(i18nObj) {
        var languageId = fnLanguageLocator(i18nObj);
        if (languageId) {
            var upperLanguage = languageId.toUpperCase();
            mappedI18n[upperLanguage] = i18nObj;
            presentLanguages.push(upperLanguage);
        }
    });

    var languageParents = getAvailableLanguageParents(presentLanguages);
    var mergedI18n = [];

    presentLanguages.forEach(function(i18nLanguage) {
        var parent = languageParents[i18nLanguage];
        if (parent){
            var mergedInfo = {};

            _.assign(mergedInfo, mappedI18n[parent], function(value, other) {
                return (_.isUndefined(other) || _.isNull(other)) ? value : other;
            });

            _.assign(mergedInfo, mappedI18n[i18nLanguage], function(value, other) {
                return (_.isUndefined(other) || _.isNull(other)) ? value : other;
            });

            mergedI18n.push(mergedInfo);
        } else {
            mergedI18n.push(mappedI18n[i18nLanguage])
        }
    });

    fnPostCollapse(source, mergedI18n);

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

    var fnPostCollapse = function(source, collapsedI18n) {
        if (source.i18n) {
            source.i18n = collapsedI18n;
        }

        if (source.I18n) {
            source.I18n = collapsedI18n;
        }
    };

    var starFallback = 'en';

    var autoLanguageFallback = true;

    if (options) {
        if (options.autoLanguageFallback !== undefined) {
            autoLanguageFallback = options.autoLanguageFallback;
        }

        if (options.fnPostMerge !== undefined) {
            fnPostMerge = options.fnPostMerge;
        }

        if (options.fnPostCollapse !== undefined) {
            fnPostCollapse = options.fnPostCollapse;
        }

        if (options.fnI18nLocator !== undefined) {
            fnI18nLocator = options.fnI18nLocator;
        }

        if (options.fnLanguageLocator !== undefined) {
            fnLanguageLocator = options.fnLanguageLocator;
        }

        if (options.starFallback != undefined) {
            starFallback = options.starFallback;
        }
    }

    var orderedLanguageIds = orderLanguageListAndGetCodes(languages, autoLanguageFallback, starFallback);

    if (orderedLanguageIds.length === 0) {
        if (_.isArray(sourceObj)) {
            sourceObj.forEach(function (src) {
                collapseSingleObj(src, fnI18nLocator, fnLanguageLocator, fnPostCollapse);
            });
        } else {
            collapseSingleObj(sourceObj, fnI18nLocator, fnLanguageLocator, fnPostCollapse);
        }
    } else {
        if (_.isArray(sourceObj)) {
            sourceObj.forEach(function (src) {
                mergeSingleObj(src, orderedLanguageIds, fnI18nLocator, fnLanguageLocator, fnPostMerge);
            });
        } else {
            mergeSingleObj(sourceObj, orderedLanguageIds, fnI18nLocator, fnLanguageLocator, fnPostMerge);
        }
    }
};