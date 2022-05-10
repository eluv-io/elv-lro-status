const curry = require('@eluvio/elv-js-helpers/curry')
const fromPairs = require('@eluvio/elv-js-helpers/fromPairs')
const liftA2 = require('@eluvio/elv-js-helpers/liftA2')
const listPush = require('@eluvio/elv-js-helpers/listPush')
const Ok = require('@eluvio/elv-js-helpers/Ok')
const List = require('@eluvio/elv-js-helpers/List')
const toPairs = require('@eluvio/elv-js-helpers/toPairs')

const enhanceLROStatusEntry = require('../enhanceLROStatusEntry')
const _sumEnhancedEntries = require('./_sumEnhancedEntries')

// returns either Ok(enhancedLROStatus) or Err
/**
 * Returns the enhanced run state with maximum precedence from a list, or `STATE_UNKNOWN` if an empty list passed in
 *
 * @function
 * @private
 * @category Conversion
 * @sig [String] -> String
 * @param {String[]} list - An array of enhanced run states
 * @returns {String} The state with the highest precedence, or value or `STATE_UNKNOWN` if `list` is empty.
 * @example
 *
 * const _maxEnhancedState = require('@eluvio/elv-lro-status/internal/_maxEnhancedState')
 *
 * _maxEnhancedState(['running', 'stalled']) //=> 'stalled'
 *
 * _maxEnhancedState([])                     //=> 'unknown'
 *
 */
const _enhanceLROStatus = curry(
  (options, lroStatus) => {

    const kvPairs = toPairs(lroStatus) // convert to Crocks List of Pairs

    const processedPairList = kvPairs.map(enhanceLROStatusEntry(options))

    // At this point, we have List( Ok(Pair(lroID, status)) |  Err([errorMsgStrings])
    // Consolidate, convert to Ok(List(Pair)) | Err([errorMsgStrings])
    const reducedResult = processedPairList.reduce(
      liftA2(listPush),
      Ok(List([]))  // start with empty list
    )

    // We now have either an Ok(List(Pair)) or an Err. If we have an Ok, construct a summary and return it along
    // with enhanced entries. (If we have an Err, `map()` will be short-circuited and the Err will be returned)
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

module.exports = _enhanceLROStatus
