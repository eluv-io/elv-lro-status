const curry = require('@eluvio/elv-js-helpers/curry')
const fromPairs = require('@eluvio/elv-js-helpers/fromPairs')
const liftA2 = require('@eluvio/elv-js-helpers/liftA2')
const listPush = require('@eluvio/elv-js-helpers/listPush')
const Ok = require('@eluvio/elv-js-helpers/Ok')
const List = require('@eluvio/elv-js-helpers/List')
const toPairs = require('@eluvio/elv-js-helpers/toPairs')

const enhanceLROStatusEntry = require('../enhanceLROStatusEntry')
const _sumEnhancedEntries = require('./_sumEnhancedEntries')

/**
 * Enhance lroResult data obtained via [ElvClient.LROStatus()](https://eluv-io.github.io/elv-client-js/module-ElvClient_ABRPublishing.html#.LROStatus).
 *
 * Returns a [Crocks Result](https://crocks.dev/docs/crocks/Result.html), either Ok(enhancedLROStatus)
 * or Err(array of errors)
 *
 * Internal function, does not validate inputs or unwrap return value to supply a plain object to caller. See source code
 * for public counterpart [enhanceLROStatus](#enhanceLROStatus) for example usage.
 *
 * @function
 * @curried
 * @private
 * @category Conversion
 * @sig Object -> Object -> Result
 * @param {Object} options - An object containing options for enhanceLROStatus call
 * @param {Object} lroStatus - Data from an `ElvClient.LROStatus()` call - a key/value map with LRO ID key and LRO status value
 * @returns {Result} A [Crocks Result](https://crocks.dev/docs/crocks/Result.html) wrapping either the enhanced lroStatus object or an array of errors
 *
 */
const _enhanceLROStatus = curry(
  (options, lroStatus) => {

    const kvPairs = toPairs(lroStatus) // convert to Crocks List of Pairs

    // enhance each individual LRO status entry
    const processedPairList = kvPairs.map(enhanceLROStatusEntry(options))

    // At this point, we have List( Ok(Pair(lroID, status)) |  Err([errors])
    // Consolidate, convert to Ok(List(Pair)) | Err([errors])
    // (inverts structure from List(Ok|Err) to Ok(List) | Err(array of errors) )
    const reducedResult = processedPairList.reduce(
      liftA2(listPush),
      Ok(List([]))  // start with empty list
    )

    // We now have either an Ok(List(Pair)) or an Err. If we have an Ok, construct a summary and return it along
    // with enhanced entries. (If we have an Err, `map()` will be short-circuited and the Err will be returned)
    return reducedResult.map(
      list => {
        const enhancedEntries = fromPairs(list) // convert back into object from k/v pairs
        return Object({
          LROs: enhancedEntries, // demote former top level keys, put under 'LROs'
          summary: _sumEnhancedEntries(enhancedEntries) // 'summary' is new top level key
        })
      }
    )
  }
)

module.exports = _enhanceLROStatus
