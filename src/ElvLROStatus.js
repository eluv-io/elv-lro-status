// ElvLROStatus.js
//
// A library for enhancing the transcoding progress info returned by the elv-client-js LROStatus() API call

// --------------------------------------
// external modules
// --------------------------------------

const liftA3 = require('crocks/helpers/liftA3')
const kindOf = require('kind-of')
const {DateTime, Duration} = require('luxon')
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

// Converts seconds to string in "##d ##h ##m ##s " format
// Unneeded larger units are omitted, and zero padding is suppressed for first number e.g.
//
// etaDurString(0)      == "0s"
// etaDurString(1)      == "1s"
// etaDurString(61)     == "1m 01s"
// etaDurString(3661)   == "1h 01m 01s"
// etaDurString(90061)  == "1d 01h 01m 01s"
// etaDurString(954061) == "11d 01h 01m 01s"
//
// seconds must be >= 0, else 'n/a' is returned

const etaDurString = seconds =>
  seconds < 0 ?
    'n/a' :
    R.pipe(
      R.splitWhen(R.compose(R.not, R.equals('00'))),  // split list in 2 - [leading '00' entries] and [first non-'00' entry plus rest]
      R.last, // discard leading '00' entries
      R.ifElse(R.isEmpty, R.always(['00']), R.identity), // if nothing is left, use a single entry ['00'] so we end up with '0s'
      R.reverse, // reverse to put seconds first, minutes next, etc. because zipWith() operates from beginning of array to end
      R.zipWith((suffix, value) => `${value}${suffix}`, ['s', 'm', 'h', 'd']), // pair each remaining entry with appropriate suffix
      R.reverse, // put back in normal order
      R.join(' '),
      R.ifElse(R.startsWith('0'), R.tail, R.identity) // remove leading zero if found
    )(Duration.fromMillis(seconds * 1000).toFormat('dd hh mm ss').split(' '))

const _eta_hms = estSeconds => R.isNil(estSeconds) ? 'unknown (not enough progress yet)' : etaDurString(estSeconds)

const estJobTotalSeconds = (duration_ms, progress_pct) => duration_ms / (10 * progress_pct) // === (duration_ms/1000) / (progress_pct/100)
const safePct = R.path(['progress', 'percentage'])

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
  return undefined // percent progress = 0
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
        const start = DateTime.fromISO(statusEntry.start).toMillis()
        const now = DateTime.fromJSDate(currentTime).toMillis()
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
          statusEntry.estimated_time_left_h_m_s = _eta_hms(secondsLeft)
          if (!R.isNil(secondsLeft)) {
            statusEntry.estimated_time_left_seconds = secondsLeft
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
    summary.estimated_time_left_h_m_s = _eta_hms(estSecondsLeft)
    if (!R.isNil(estSecondsLeft)) {
      summary.estimated_time_left_seconds = estSecondsLeft
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
