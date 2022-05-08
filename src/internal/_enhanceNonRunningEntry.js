
const clone = require('ramda/src/clone')
const mergeRight = require('ramda/src/mergeRight')

const Pair = require('@eluvio/elv-js-helpers/Pair')

const _progressPct = require('./_progressPct')
const ERS = require('../enhancedRunState')

/**
 * Returns an enhanced copy of an LRO Status Entry for a non-running LRO.
 * Checks for bad reported progress percentage
 *
 * @function
 * @private
 * @category Conversion
 * @sig String -> Object -> Object
 * @param {Pair} lro - A Crocks Pair with LRO ID as first element and LRO Status Entry as second element
 * @returns {Pair}  A Crocks Pair with LRO ID as first element and the enhanced copy of LRO Status Entry object with additional fields as second element
 *
 * @example
 *
 * _enhanceNonRunningEntry('',{})
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
