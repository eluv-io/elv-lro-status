const mergeRight = require('ramda/src/mergeRight')

const estRemainingDur = require('@eluvio/elv-js-helpers/estRemainingDur')
const etaDurationStr = require('@eluvio/elv-js-helpers/etaDurationStr')
const etaTimeStr = require('@eluvio/elv-js-helpers/etaTimeStr')
const Pair = require('@eluvio/elv-js-helpers/Pair')
const utcStrToDate = require('@eluvio/elv-js-helpers/utcStrToDate')

const _progressPct = require('./_progressPct')
const ERS = require('../enhancedRunState')

/**
 * Returns an enhanced copy of an LRO Status Entry for a running LRO.
 * Checks for bad reported progress percentage and stalled LROs
 * Adds ETA fields if possible
 *
 * @function
 * @private
 * @category Conversion
 * @sig Object -> String -> Object -> Object
 * @param {Object} options
 * @param {Date} options.currentTime - The value to use for current time when calculating ETA fields
 * @param {String} options.locale - The locale to use when formatting the `eta_local` field
 * @param {Number} options.stallThreshold - How many seconds to allow to pass between LRO info updates before warning that LRO may have terminated
 * @param {String} options.timezone - The timezone to use when formatting the `eta_local` field
 * @param {Pair} lro - A Crocks Pair with LRO ID as first element and LRO Status Entry as second element
 * @returns {Pair}  A Crocks Pair with LRO ID as first element and the enhanced copy of LRO Status Entry object with additional fields as second element
 *
 * @example
 *
 * _enhanceRunningEntry({},'',{})
 *
 *
 */
// TODO: add example above
const _enhanceRunningEntry = (options, lro) => {
  // compute derived values
  const lroKey = lro.fst()
  const statusEntry = lro.snd()
  const start = utcStrToDate(statusEntry.start)
  const actualElapsedSeconds = (options.currentTime - start) / 1000
  const reportedElapsed = statusEntry.duration_ms / 1000
  const secondsSinceLastUpdate = Math.round(actualElapsedSeconds - reportedElapsed)

  const mergeFields = {seconds_since_last_update: secondsSinceLastUpdate}

  const reportedRunState = statusEntry.run_state
  let runStateToReturn = statusEntry.run_state
  let warning = undefined

  const progressPct = _progressPct(statusEntry)

  // if 0 < progress <= 100 and elapsed > 0, calc ETA
  if (progressPct > 0 && progressPct <= 100 && actualElapsedSeconds > 0) {
    estRemainingDur(actualElapsedSeconds, progressPct / 100).map(
      estSecondsLeft => {
        const roundedSecondsLeft = Math.round(estSecondsLeft)
        mergeFields.estimated_time_left_seconds = roundedSecondsLeft
        mergeFields.estimated_time_left_h_m_s = etaDurationStr(roundedSecondsLeft)
        mergeFields.eta_local = etaTimeStr(
          options.currentTime,
          roundedSecondsLeft,
          options.timezone,
          options.locale
        )
      }
    )
  }

  if (progressPct === 0) {
    mergeFields.estimated_time_left_h_m_s = 'unknown (not enough progress yet)'
  }

  if (secondsSinceLastUpdate > options.stallThreshold) { // check for stall
    warning = 'status has not been updated in ' + secondsSinceLastUpdate + ' seconds, process may have terminated'
    runStateToReturn = ERS.STATE_STALLED
  } else if (progressPct > 100) { // check for bad pct (stall takes precedence)
    runStateToReturn = ERS.STATE_BAD_PCT
    warning = `Job ${lroKey} has progress percentage > 100, process has generated too much data`
  }

  if(reportedRunState !== runStateToReturn) {
    mergeFields.reported_run_state = reportedRunState
    mergeFields.run_state = runStateToReturn
  }
  mergeFields.warning = warning
  return Pair(lroKey, mergeRight(statusEntry, mergeFields))
}

module.exports = _enhanceRunningEntry
