const kindOf = require('kind-of')

const find = require('ramda/src/find')
const filter = require('ramda/src/filter')
const last = require('ramda/src/last')
const pluck = require('ramda/src/pluck')
const sortBy = require('ramda/src/sortBy')
const values = require('ramda/src/values')

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
 * _sumEnhancedEntries({
 *   key1: {},
 *   key2: {}
 * })
 *
 */
// TODO: add example above
const _sumEnhancedEntries = enhancedLROStatus => {
  const enhancedLROStatusEntries = values(enhancedLROStatus)
  const summary = {
    run_state: _maxEnhancedState(pluck('run_state', enhancedLROStatusEntries))
  }

  if (summary.run_state === STATE_RUNNING) { // presence of any cancelled/error states will suppress summary ETA fields

    const runningLROs = filter(x=>x.run_state === STATE_RUNNING, enhancedLROStatusEntries)
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
