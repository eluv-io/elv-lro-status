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
const Ok = require('@eluvio/elv-js-helpers/Ok')
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
// TODO: switch to sealed model (may need to add 'defaults' argument to defSealedObjModel)
const _enhLROStatusOptsModel = defObjModel(
  'enhanceLROStatus',
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
 * @param {Object} options
 * @param {Date} options:currentTime - The value to use for current time (this is used to compute `eta_local`)
 * @param {String} [options:locale=new Intl.DateTimeFormat().resolvedOptions().locale] - The [Javascript Intl.Locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) string to use to format `eta_local`
 * @param {Number} [options:stallThreshold=900] - How many seconds to wait since LRO info last updated before warning that LRO may have terminated
 * @param {String} [options:timezone=new Intl.DateTimeFormat().resolvedOptions().timeZone] - The [time zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/timeZones) to use to format `eta_local`
 * @param {Object} lroStatus - The data from `ElvClient.LROStatus()` call
 * @returns {Object} An object containing an `ok` attribute that is `true` if enhancement succeeded or `false` if
 * enhancement failed (generally due to bad `options` being passed in).
 * If enhancement was successful, a `result` attribute will contain the enhanced status object.
 * If enhancement failed, an `errors` attribute will contain an array of error message strings.
 *
 * @example
 *
 * const enhanceLROStatus = require('@eluvio/elv-lro-status/enhanceLROStatus')
 * const defaultOptions = require('@eluvio/elv-lro-status/defaultOptions')
 * const options = Object.assign(defaultOptions(), {currentTime: new Date})
 *
 * // assumes `client` contains a successfully prepared ElvClient instance
 * const statusResponse = await client.LROStatus({
 *   libraryId: 'ilib_YOUR_LIBRARY_ID',
 *   objectId: 'iq__YOUR_OBJECT_ID'
 * });
 *
 * // check to make sure we received data back
 * if (statusResponse === undefined) {
 *   throw Error("Received no job status information from server - no LROs started, or object already finalized?");
 * }
 *
 * const enhancedStatus = enhanceLROStatus(options, statusResponse)
 *
 * // EXAMPLE: SUCCESSFUL CALL
 * {
 *   "ok": true,
 *   "result": {
 *     "LROs": {
 *       "tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSv3L57AV3CPYHbLmk3E9SF1b": {
 *         "duration": 0,
 *         "duration_ms": 0,
 *         "progress": {
 *           "percentage": 0
 *         },
 *         "estimated_time_left_h_m_s": "unknown (not enough progress yet)",
 *         "run_state": "running",
 *         "start": "2022-04-09T05:09:00Z",
 *         "seconds_since_last_update": 84
 *       },
 *       "tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be": {
 *         "duration": 12747000000,
 *         "duration_ms": 12747,
 *         "end": "2022-04-09T05:09:13Z",
 *         "progress": {
 *           "percentage": 100
 *         },
 *         "run_state": "finished",
 *         "start": "2022-04-09T05:09:00Z"
 *       }
 *     },
 *     "summary": {
 *       "run_state": "running",
 *       "estimated_time_left_h_m_s": "unknown (not enough progress yet)"
 *     }
 *   }
 * }
 *
 * // EXAMPLE: FAILED CALL
 * const badOptions = defaultOptions() // failed to set currentTime
 * const failedEnhancement = enhanceLROStatus(badOptions, statusResponse)
 * {
 *   ok: false,
 *   errors: [
 *     'enhanceLROStatus: expecting currentTime to be Date, got undefined'
 *   ]
 * }
 *
 */
const enhanceLROStatus = (options, lroStatus) => {
  const checkedLROStatus = validator(LROStatusModel)(lroStatus)
  const checkedOptions = validator(_enhLROStatusOptsModel)(options)
  const result = liftA2Join(_lroStatusEnhance, checkedOptions, checkedLROStatus)

  return resultToPOJO(result)
}

module.exports = enhanceLROStatus
