const kindOf = require('kind-of')

const find = require('@eluvio/ramda-fork/src/find')
const filter = require('@eluvio/ramda-fork/src/filter')
const last = require('@eluvio/ramda-fork/src/last')
const pluck = require('@eluvio/ramda-fork/src/pluck')
const sortBy = require('@eluvio/ramda-fork/src/sortBy')
const values = require('@eluvio/ramda-fork/src/values')

const _maxEnhancedState = require('./_maxEnhancedState')
const {STATE_RUNNING} = require('../enhancedRunState')

/**
 * Returns a summary for an object containing enhanced LRO Status Entries
 *
 * Returns an overall `run_state` and (if applicable) ETA fields.
 *
 * @function
 * @private
 * @category Conversion
 * @sig Object -> Object
 * @param {Object} enhancedLROStatus - An object where the keys are LRO IDs and the values are enhanced LRO Status Entries
 * @returns {Object} The summary object
 * @example
 *
 *  const _sumEnhancedEntries = require('@eluvio/elv-lro-status/internal/_sumEnhancedEntries')
 *
 * const enhancedEntriesNoProgress = {
 *   "tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSv3L57AV3CPYHbLmk3E9SF1b": {
 *     "duration": 0,
 *     "duration_ms": 0,
 *     "progress": {
 *       "percentage": 0
 *     },
 *     "estimated_time_left_h_m_s": "unknown (not enough progress yet)",
 *     "run_state": "running",
 *     "start": "2022-04-09T05:09:00Z",
 *     "seconds_since_last_update": 84
 *   },
 *   "tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be": {
 *     "duration": 12747000000,
 *     "duration_ms": 12747,
 *     "end": "2022-04-09T05:09:13Z",
 *     "progress": {
 *       "percentage": 100
 *     },
 *     "run_state": "finished",
 *     "start": "2022-04-09T05:09:00Z"
 *   }
 * }
 *
 * console.log(JSON.stringify(_sumEnhancedEntries(enhancedEntriesNoProgress), null, 2))
 * `{
 *   "run_state": "running",
 *   "estimated_time_left_h_m_s": "unknown (not enough progress yet)"
 * }`
 *
 *
 * const enhancedEntriesWithProgress = {
 *   'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU': {
 *     'duration': 335613000000,
 *     'duration_ms': 335613,
 *     'end': '2022-04-08T21:10:34Z',
 *     'progress': {
 *       'percentage': 100
 *     },
 *     'run_state': 'finished',
 *     'start': '2022-04-08T21:05:00Z'
 *   },
 *   'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh': {
 *     'duration': 1390740000000,
 *     'duration_ms': 1390740,
 *     'progress': {
 *       'percentage': 76.66666666666667
 *     },
 *     'run_state': 'running',
 *     'start': '2022-04-08T21:05:00Z',
 *     'seconds_since_last_update': 359,
 *     'estimated_time_left_seconds': 423,
 *     'estimated_time_left_h_m_s': '7m 03s',
 *     'eta_local': '2:41:13 PM PDT'
 *   }
 * }
 *
 * console.log(JSON.stringify(_sumEnhancedEntries(enhancedEntriesWithProgress), null, 2))
 * `{
 *   "run_state": "running",
 *   "estimated_time_left_seconds": 423,
 *   "estimated_time_left_h_m_s": "7m 03s",
 *   "eta_local": "2:41:13 PM PDT"
 * }`
 *  `

 */
// TODO: add example above
const _sumEnhancedEntries = enhancedLROStatus => {
  const enhancedLROStatusEntries = values(enhancedLROStatus)
  const summary = {
    run_state: _maxEnhancedState(pluck('run_state', enhancedLROStatusEntries))
  }

  if (summary.run_state === STATE_RUNNING) { // presence of any cancelled/error states will suppress summary ETA fields

    const runningLROs = filter(x => x.run_state === STATE_RUNNING, enhancedLROStatusEntries)
    const slowestLRO = find(
      x => kindOf(x.estimated_time_left_seconds) === 'undefined', // presence of any unknown ETAs will make summary ETA undefined
      runningLROs
    ) || last(
      sortBy(
        x => x.estimated_time_left_seconds,
        runningLROs
      )
    )

    summary.estimated_time_left_seconds = slowestLRO.estimated_time_left_seconds
    summary.estimated_time_left_h_m_s = slowestLRO.estimated_time_left_h_m_s
    summary.eta_local = slowestLRO.eta_local
  }
  return summary
}
module.exports = _sumEnhancedEntries
