// --------------------------------------
// external modules
// --------------------------------------

const liftA3 = require('crocks/helpers/liftA3')
const kindOf = require('kind-of')
const {DateTime} = require('luxon')
const moment = require('moment')
const R = require('ramda')


// --------------------------------------
// internal modules
// --------------------------------------

const M = require('./lib/models')

const {
  LRO_RUN_STATE_CANCELLED_SHUTDOWN,
  LRO_RUN_STATE_CANCELLED_TIMEOUT,
  LRO_RUN_STATE_CANCELLED_USER,
  LRO_RUN_STATE_FAILED,
  LRO_RUN_STATE_FINISHED,
  LRO_RUN_STATE_NOT_STARTED,
  LRO_RUN_STATE_RUNNING,
  LROStatusModel
} = require('./models/LROStatusModel')

// --------------------------------------
// external functions
// --------------------------------------


const DEFAULT_STALL_THRESHOLD = 15 * 60 // 15 minutes

const STATE_BAD_PCT = 'bad_percentage'
const STATE_CANCELLED_SHUTDOWN = LRO_RUN_STATE_CANCELLED_SHUTDOWN
const STATE_CANCELLED_TIMEOUT = LRO_RUN_STATE_CANCELLED_TIMEOUT
const STATE_CANCELLED_USER = LRO_RUN_STATE_CANCELLED_USER
const STATE_FAILED = LRO_RUN_STATE_FAILED
const STATE_FINISHED = LRO_RUN_STATE_FINISHED
const STATE_NOT_STARTED = LRO_RUN_STATE_NOT_STARTED
const STATE_RUNNING = LRO_RUN_STATE_RUNNING
const STATE_STALLED = 'stalled'
const STATE_UNKNOWN = 'unknown'

// When creating an overall status summary, statuses with higher numbers
// take precedence, e.g if one LRO is 'finished' and one LRO is 'running', the summary status will be 'running'
const ROLLUP_PRECEDENCE = {
  [STATE_UNKNOWN]: 0,
  [STATE_FINISHED]: 1,
  [STATE_RUNNING]: 2,
  [STATE_NOT_STARTED]: 3,
  [STATE_STALLED]: 4,
  [STATE_BAD_PCT]: 5,
  [STATE_FAILED]: 6,
  [STATE_CANCELLED_TIMEOUT]: 7,
  [STATE_CANCELLED_SHUTDOWN]: 8,
  [STATE_CANCELLED_USER]: 9
}

const padStart = width => str => str.padStart(width)

const etaLocalString = (currentTime, seconds) => {
  if (seconds < 0) {
    return 'n/a'
  }
  const now = DateTime.local(currentTime)
  const localEta = now.plus({seconds})
  // if ETA is same day, return just time
  if (now.toLocaleString(DateTime.DATE_FULL) === localEta.toLocaleString(DateTime.DATE_FULL)) {
    return localEta.toLocaleString(DateTime.TIME_WITH_SHORT_OFFSET)
  } else {
    // else include date in returned string
    return localEta.toLocaleString({
      hour: 'numeric',
      day: 'numeric',
      minute: 'numeric',
      month: 'short',
      second: 'numeric',
      timeZoneName: 'short'
    })
  }
}

// Converts seconds to right-aligned string in "##d ##h ##m ##s " format
// Unneeded larger units are omitted, e.g.
//
// etaDurString(0)      == "             0s"
// etaDurString(1)      == "             1s"
// etaDurString(61)     == "         1m 01s"
// etaDurString(3661)   == "     1h 01m 01s"
// etaDurString(90061)  == " 1d 01h 01m 01s"
// etaDurString(954061) == "11d 01h 01m 01s"

const etaDurString = seconds => {
  if (seconds < 0) {
    return 'n/a'
  }
  const unixTimestamp = moment.unix(seconds).utc()
  let dataStarted = false
  let pieces = []

  const days = Math.trunc(seconds / 86400)
  if (days > 0) dataStarted = true
  pieces.push(dataStarted ? days.toString() + 'd' : '')

  const hoursString = unixTimestamp.format(dataStarted ? 'HH\\h' : 'H\\h')
  dataStarted = dataStarted || hoursString !== '0h'
  pieces.push(dataStarted ? hoursString : '')

  const minutesString = unixTimestamp.format(dataStarted ? 'mm\\m' : 'm\\m')
  dataStarted = dataStarted || minutesString !== '0m'
  pieces.push(dataStarted ? minutesString : '')

  const secondsString = unixTimestamp.format(dataStarted ? 'ss\\s' : 's\\s')
  pieces.push(secondsString)
  return pieces.map(padStart(3)).join(' ').trim()
}

const estJobTotalSeconds = (duration_ms, progress_pct) => duration_ms / (10 * progress_pct) // === (duration_ms/1000) / (progress_pct/100)
const safePct = statusEntry => R.path(['progress', 'percentage'], statusEntry)

const estSecondsLeft = statusEntry => {
  const pct = safePct(statusEntry)
  if (pct) {
    if (pct === 100) return 0
    if (pct > 100) {
      statusEntry.warning = 'Progress percentage > 100, process has generated too much data'
      setBadRunState(statusEntry, STATE_BAD_PCT)
      return null
    }
    const result = Math.round(
      estJobTotalSeconds(statusEntry.duration_ms, pct)
      - (statusEntry.duration_ms / 1000)
      - statusEntry.seconds_since_last_update
    )
    return result < 0 ? 0 : result
  }
  return null // percent progress = 0
}

const highestReduce = (statusMap, propName, reducer, startVal) => Object.entries(statusMap).map((pair) => pair[1][propName]).reduce(reducer, startVal)
const higherRunState = (a, b) => ROLLUP_PRECEDENCE[a] > ROLLUP_PRECEDENCE[b] ? a : b
const highestRunState = statusMap => highestReduce(statusMap, 'run_state', higherRunState, STATE_UNKNOWN)
const higherSecondsLeft = (a, b) => kindOf(a) === 'undefined'
  ? a
  : kindOf(b) === 'undefined'
    ? b
    : a > b ? a : b

const highestSecondsLeft = statusMap => highestReduce(R.filter(isRunning, statusMap), 'estimated_time_left_seconds', higherSecondsLeft, null)

const isRunning = x => x.run_state === STATE_RUNNING

const setBadRunState = (statusEntry, state) => {
  statusEntry.reported_run_state = statusEntry.run_state
  statusEntry.run_state = state
}


const lroStatusEnhance = R.curry(
  (currentTime, stallThreshold, lroStatus) => {
    const result = {LROs: R.clone(lroStatus)}

    // examine each entry, add fields
    for (const [lroKey, statusEntry] of Object.entries(result.LROs)) {
      if (statusEntry.run_state === STATE_RUNNING) {
        const start = moment.utc(statusEntry.start).valueOf()
        const now = moment.utc(currentTime).valueOf()
        const actualElapsedSeconds = Math.round((now - start) / 1000)
        const reportedElapsed = Math.round(statusEntry.duration_ms / 1000)
        const secondsSinceLastUpdate = actualElapsedSeconds - reportedElapsed
        statusEntry.seconds_since_last_update = secondsSinceLastUpdate

        // off by more than tolerance?
        if (secondsSinceLastUpdate > stallThreshold) {
          statusEntry.warning = 'status has not been updated in ' + secondsSinceLastUpdate + ' seconds, process may have terminated'
          setBadRunState(statusEntry, STATE_STALLED)
        } else if (safePct(statusEntry) > 100) {
          statusEntry.warning = `Job ${lroKey} has progress > 100`
          setBadRunState(statusEntry, STATE_BAD_PCT)
        } else {
          const secondsLeft = estSecondsLeft(statusEntry)
          if (kindOf(secondsLeft) !== 'null') {
            statusEntry.estimated_time_left_seconds = secondsLeft
            statusEntry.estimated_time_left_h_m_s = etaDurString(secondsLeft)
            statusEntry.eta_local = etaLocalString(secondsLeft)
          }
        }
      } else {
        if (safePct(statusEntry) !== 100 && statusEntry.run_state === STATE_FINISHED) {
          statusEntry.warning = `Job ${lroKey} has run_state '${STATE_FINISHED}', but progress pct is ${safePct(statusEntry)}`
          setBadRunState(statusEntry, STATE_BAD_PCT)
        }
      }
    }
    result.summary = statusSummary(result.LROs)
    return result
  }
)

const _resultToPOJO = result => result.either(
  errVal => Object({ok: false, errors: R.uniq(R.flatten(errVal.map(R.prop('message')).map(R.split('\n'))))}),
  okVal => Object({ok: true, result: okVal})
)


const statusSummary = enhancedLROStatusEntries => {
  const summary = {run_state: highestRunState(enhancedLROStatusEntries)}
  if (summary.run_state === STATE_RUNNING) {
    const estSecondsLeft = highestSecondsLeft(enhancedLROStatusEntries)
    if (kindOf(estSecondsLeft) === 'undefined') {
      summary.estimated_time_left_h_m_s = 'unknown (not enough progress yet)'
    } else {
      summary.estimated_time_left_seconds = estSecondsLeft
      summary.estimated_time_left_h_m_s = etaDurString(summary.estimated_time_left_seconds)
      summary.eta_local = etaLocalString(summary.estimated_time_left_seconds)
    }
  }
  return summary
}


const EnhancedStatus = (lroStatus, currentTime, stallThreshold = DEFAULT_STALL_THRESHOLD) => {
  const checkedLROStatus = M.validator(LROStatusModel)(lroStatus)
  const checkedCurrentTime = M.validator(M.DatetimeModel)(currentTime)
  const checkedStallThreshold = M.validator(M.PositiveIntegerModel)(stallThreshold)
  return _resultToPOJO(liftA3(lroStatusEnhance, checkedCurrentTime, checkedStallThreshold, checkedLROStatus))
}

module.exports = {
  DEFAULT_STALL_THRESHOLD,
  EnhancedStatus,
  STATE_BAD_PCT,
  STATE_CANCELLED_SHUTDOWN,
  STATE_CANCELLED_TIMEOUT,
  STATE_CANCELLED_USER,
  STATE_FAILED,
  STATE_FINISHED,
  STATE_NOT_STARTED,
  STATE_RUNNING,
  STATE_STALLED,
  STATE_UNKNOWN
}
