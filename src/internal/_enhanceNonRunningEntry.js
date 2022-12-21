const clone = require('@eluvio/ramda-fork/src/clone')
const mergeRight = require('@eluvio/ramda-fork/src/mergeRight')

const Pair = require('@eluvio/elv-js-helpers/Pair')

const _progressPct = require('./_progressPct')
const ERS = require('../enhancedRunState')

/**
 * Returns an enhanced copy of an LRO Status Entry for an LRO that does not have a `run_state` of `running`.
 * Checks for bad reported progress percentage.
 *
 * @function
 * @private
 * @category Conversion
 * @sig Pair String Object -> Pair String Object
 * @param {Pair} lro - A Crocks Pair with LRO ID as first element and LRO Status Entry as second element
 * @returns {Pair}  A Crocks Pair with LRO ID as first element and the enhanced copy of LRO Status Entry object with additional fields as second element
 * @example
 *
 * const Pair = require('@eluvio/elv-js-helpers/Pair')
 *
 * const _enhanceNonRunningEntry = require('@eluvio/elv-lro-status/internal/_enhanceNonRunningEntry')
 *
 * const lro = Pair(
 *   'tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be',
 *   {
 *     "duration": 12747000000,
 *     "duration_ms": 12747,
 *     "end": "2022-04-09T05:09:13Z",
 *     "progress": {
 *       "percentage": 100
 *     },
 *     "run_state": "finished",
 *     "start": "2022-04-09T05:09:00Z"
 *   }
 * )
 *
 * const enhanced = _enhanceNonRunningEntry(lro)
 *
 * console.log(Pair.fst())
 * 'tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be'
 *
 * console.log(JSON.stringify(enhanced.snd(), null, 2)
 * `{
 *   "duration": 12747000000,
 *   "duration_ms": 12747,
 *   "end": "2022-04-09T05:09:13Z",
 *   "progress": {
 *     "percentage": 100
 *   },
 *   "run_state": "finished",
 *   "start": "2022-04-09T05:09:00Z"
 * }`
 *
 * // change lro.progress.percentage to a bad value
 * lro.map(x => x.progress.percentage = 120)
 *
 * const enhancedBadData = _enhanceNonRunningEntry(lro)
 * console.log(JSON.stringify(enhancedBadData.snd(), null, 2))
 * `{
 *   "duration": 12747000000,
 *   "duration_ms": 12747,
 *   "end": "2022-04-09T05:09:13Z",
 *   "progress": {
 *     "percentage": 120
 *   },
 *   "run_state": "bad percentage",
 *   "start": "2022-04-09T05:09:00Z",
 *   "reported_run_state": "finished",
 *   "warning": "Job tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be has run_state 'finished', but progress pct is 120"
 * }`
 *
 *
 */
// TODO: add example above
const _enhanceNonRunningEntry = (lro) => {
  const lroKey = lro.fst()
  const statusEntry = lro.snd()

  return Pair(
    lroKey,
    statusEntry.run_state === ERS.STATE_FINISHED && _progressPct(statusEntry) !== 100 ? // check for bad final percentage
      // final percentage is bad, return an object with warnings and substituted run_state
      mergeRight(
        statusEntry,
        {
          reported_run_state: statusEntry.run_state,
          run_state: ERS.STATE_BAD_PCT,
          warning: `Job ${lroKey} has run_state '${ERS.STATE_FINISHED}', but progress pct is ${_progressPct(statusEntry)}`,
        }
      ) :
      // final percentage ok, or run_state is not 'finished' - return a clone
      clone(statusEntry)
  )
}

module.exports = _enhanceNonRunningEntry
