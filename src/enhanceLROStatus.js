// @eluvio/elv-lro-status
// A library for enhancing the transcoding progress info returned by the elv-client-js LROStatus() API call

const curry = require('@eluvio/elv-js-helpers/curry')
const DatetimeModel = require('@eluvio/elv-js-helpers/DatetimeModel')
const defObjModel = require('@eluvio/elv-js-helpers/defObjModel')
const fromPairs = require('@eluvio/elv-js-helpers/fromPairs')
const liftA2 = require('@eluvio/elv-js-helpers/liftA2')
const liftA2Join = require('@eluvio/elv-js-helpers/liftA2Join')
const List = require('@eluvio/elv-js-helpers/List')
const listPush = require('@eluvio/elv-js-helpers/listPush')
const {Ok} = require('@eluvio/elv-js-helpers/Result')
const PositiveNumModel = require('@eluvio/elv-js-helpers/PositiveNumModel')
const resultToPOJO = require('@eluvio/elv-js-helpers/resultToPOJO')
const toPairs = require('@eluvio/elv-js-helpers/toPairs')
const validator = require('@eluvio/elv-js-helpers/validator')

const _sumEnhancedEntries = require('./internal/_sumEnhancedEntries')
const defaultOptions = require('./defaultOptions')
const enhanceLROStatusEntry = require('./enhanceLROStatusEntry')
const LROStatusModel = require('./LROStatusModel')


/**
 * An [ObjectModel](http://objectmodel.js.org/) which validates that an input is:
 *
 * * A [Javascript Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
 * * Satisfies the field definitions for `enhanceLROStatus`'s `options` argument.
 *
 * It also populates defaults.
 *
 * @function
 * @private
 * @category Model
 * @sig * -> Object -> Object | THROW
 * @param {Object} - The options to validate
 * @returns {Object} The validated options object
 *
 * @example
 *
 * _enhLROStatusOptsModel({})
 *
 */
// TODO: add example above
const _enhLROStatusOptsModel = defObjModel(
  'enhanceLROStatusEntry',
  {
    currentTime: DatetimeModel,
    locale: String,
    stallThreshold: PositiveNumModel,
    timezone: String
  }
).defaultTo(defaultOptions())

// returns either Ok(enhancedLROStatus) or Err
const _lroStatusEnhance = curry(
  (options, lroStatus) => {

    const kvPairs = toPairs(lroStatus) // convert to Crocks List of Pairs

    const processedPairList = kvPairs.map(enhanceLROStatusEntry(options))

    // At this point, we have List( Ok(Pair(lroID, status)) |  Err([errorMsgStrings])
    // Consolidate, convert to Ok(List(Pair)) | Err([errorMsgStrings])
    const reducedResult = processedPairList.reduce(
      liftA2(listPush),
      Ok(List([]))  // start with empty list
    )

    // we now have either an Ok(List(Pair)) or an Err
    return reducedResult.map(
      list => {
        const enhancedEntries = fromPairs(list)
        return Object({
          LROs: enhancedEntries,
          summary: _sumEnhancedEntries(enhancedEntries)
        })
      }
    )
  }
)

const enhanceLROStatus = (options, lroStatus) => {
  const checkedLROStatus = validator(LROStatusModel)(lroStatus)
  const checkedOptions = validator(_enhLROStatusOptsModel)(options)
  const result = liftA2Join(_lroStatusEnhance, checkedOptions, checkedLROStatus)

  return resultToPOJO(result)
}

module.exports = enhanceLROStatus
