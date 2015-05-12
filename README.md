#i18n-merge
Merge together objects according to their languages

## Methods

### `.merge({source}, [languages], options);`

#### source

The source object to be transformed must include an `i18n` field, with the following schema:

```
{
    ...
    "i18n": [
        {
            ...
            "language": {
                "code": "en",  // two letter language code
                "region": "GB" // iso8601 region code
            },
            ...
        },
        ...
    ],
    ...
}
```

The source can either be a single object or an array of objects.

####languages

The languages array should be an array of objects with the following schema:

```
[
    {
        "code": "en",
        "region": "GB",
        "quality": 1.0
    }
]
```

(the accept-language-parser module can break apart an accept language string and return it in the correct format)


####options

The options object can consist of any of the following:

```
{
    fnI18nLocator: function(source) //get the i18n array out of the source object, defaults to returning i18n
    fnLanguageLocator: function(i18nSource) //get the language out of the i18n object. Defaults to returning language
    fnPostMerge: function(source, mergedI18n) //what to do with the merged object, defaults to replaceing the i18n array
    autoLanguageFallback: bool //should we fallback to parent languages (en-US -> en) automatically, defaults to true
}
```

By overriding the optional functions this module should be able to work with most structures



