// @eluvio/elv-lro-status
// A library for enhancing the transcoding progress info returned by the elv-client-js LROStatus() API call

const liftA2Join = require('@eluvio/elv-js-helpers/liftA2Join')
const resultToPOJO = require('@eluvio/elv-js-helpers/resultToPOJO')
const validator = require('@eluvio/elv-js-helpers/validator')

const _enhanceLROStatus = require('./internal/_enhanceLROStatus')
const LROStatusModel = require('./LROStatusModel')
const OptionsModel = require('./OptionsModel')

/**
 * Processes a response from an [ElvClient.LROStatus()](https://eluv-io.github.io/elv-client-js/module-ElvClient_ABRPublishing.html#.LROStatus)
 * API call, checking for stalled LROs and bad percentages, adding ETA fields if applicable, and adding a summary.
 *
 * @function
 * @category Model
 * @sig (Object, Object) -> Object
 * @param {Object} options
 * @param {Date} options:currentTime - The value to use for current time (this is used to compute `eta_local`)
 * @param {String} [options:locale=new Intl.DateTimeFormat().resolvedOptions().locale] - The [Javascript Intl.Locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) string to use to format `eta_local`
 * @param {Number} [options:stallThreshold=900] - How many seconds to wait since LRO info last updated before warning that LRO may have terminated
 * @param {String} [options:timezone=new Intl.DateTimeFormat().resolvedOptions().timeZone] - The [time zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/timeZones) to use to format `eta_local`
 * @param {Object} lroStatus - The data from `ElvClient.LROStatus()` call
 * @returns {Object} An object containing an `ok` attribute that is `true` if enhancement succeeded or `false` if
 * enhancement failed (generally due to bad `options` being passed in).
 * If enhancement was successful, a `result` attribute will contain the enhanced status object.
 * If enhancement failed, an `errors` attribute will contain an array of error message strings, and an `errorDetails`
 * attribute will contain an array with any available additional information.
 * @example
 *
 * const enhanceLROStatus = require('@eluvio/elv-lro-status/enhanceLROStatus')
 * const defaultOptions = require('@eluvio/elv-lro-status/defaultOptions')
 *
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
 * // EXAMPLE: SUCCESSFUL CALL
 * const enhancedStatus = enhanceLROStatus(options, statusResponse)
 * console.log(JSON.stringify(enhancedStatus, null, 2)
 * `{
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
 * }`
 *
 * // EXAMPLE: FAILED CALL
 * const badOptions = defaultOptions() // failed to set currentTime
 * const failedEnhancement = enhanceLROStatus(badOptions, statusResponse)
 * console.log(JSON.stringify(failedEnhancement, null, 2)
 * `{
 *   ok: false,
 *   errors: [
 *     "options: expecting currentTime to be Date, got undefined"
 *   ],
 *   errorDetails: [
 *     {
 *       "path": "currentTime",
 *       "message": "expecting currentTime to be Date, got undefined"
 *     }
 *   ]
 * }`
 *
 */
const enhanceLROStatus = (options, lroStatus) => {
  const checkedLROStatus = validator(LROStatusModel)(lroStatus)
  const checkedOptions = validator(OptionsModel)(options)
  const result = liftA2Join(_enhanceLROStatus, checkedOptions, checkedLROStatus)

  return resultToPOJO(result)
}

module.exports = enhanceLROStatus
