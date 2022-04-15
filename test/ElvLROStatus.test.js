const chai = require('chai')
chai.should()

// noinspection JSCheckFunctionSignatures
chai.use(require('chai-things'))
// const expect = chai.expect

const {DateTime} = require('luxon')

const R = require('ramda')

const L = require('../src/ElvLROStatus')
const {EnhancedStatus} = require('../src/ElvLROStatus')

const shiftUtcString = (offsetMs, timeString) => timeString === undefined ?
  undefined :
  DateTime.fromMillis(
    DateTime.fromISO(timeString).toMillis() + offsetMs
  ).toUTC().toFormat('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'')


// Used to shift forward in time test data containing running LROs
// so that we don't have to stub system time
const shiftTimes = (lroStatus, extraSeconds = 0) => {
  // filter out non-running items
  const runningItems = R.values(R.filter(s => s.run_state === L.STATE_RUNNING, lroStatus))
  // find the one updated most recently
  const withStartMs = runningItems.map(s => R.assoc('start_ms', DateTime.fromISO(s.start).toMillis(), s))
  const withLastUpdatedMs = withStartMs.map(s => R.assoc('last_updated_ms', s.start_ms + s.duration_ms, s))
  const mostRecentlyUpdated = R.last(R.sort(R.prop('last_updated_ms'), withLastUpdatedMs))

  const oldMinCurrentTimeMs = DateTime.fromMillis(mostRecentlyUpdated.last_updated_ms)
  const currentTimeMs = DateTime.now().toMillis()
  const offset = -extraSeconds * 1000 + currentTimeMs - oldMinCurrentTimeMs
  return R.map(
    s => R.assoc('end', shiftUtcString(offset, s.end), R.assoc('start', shiftUtcString(offset, s.start), s)),
    R.clone(lroStatus)
  )
}

const LRO_1_FINISHED_1_RUNNING = {
  tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU: {
    duration: 335613000000,
    duration_ms: 335613,
    end: '2022-04-08T21:10:34Z',
    progress: {
      percentage: 100
    },
    run_state: 'finished',
    start: '2022-04-08T21:05:00Z'
  },
  tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh: {
    duration: 1390740000000,
    duration_ms: 1390740,
    progress: {
      percentage: 76.66666666666667
    },
    run_state: 'running',
    start: '2022-04-08T21:05:00Z'
  }
}
const LRO_BAD_DATA = {
  tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU: {
    duration: -335613000000,
    duration_ms: -335613,
    end: '2022-04-08T21:10:34Z',
    progress: {
      percentage: 100
    },
    run_state: 'finished',
    start: '2022-04-08T21:05:00Z'
  }
}


describe('EnhancedStatus', function () {
  const now = new Date
  const retVal1 = EnhancedStatus(shiftTimes(LRO_1_FINISHED_1_RUNNING, 0), now)
  const retVal2 = EnhancedStatus(shiftTimes(LRO_1_FINISHED_1_RUNNING, L.DEFAULT_STALL_THRESHOLD + 60), now)
  const retVal3 = EnhancedStatus(LRO_BAD_DATA, now)


  it('should return ok true for valid data', () => {
    retVal1.ok.should.be.true
    retVal2.ok.should.be.true
  })
  it('should return summary status of "running" for non-stalled running LRO', () => {
    retVal1.result.summary.run_state.should.equal(L.STATE_RUNNING)
  })
  it('should return summary status of "stalled" when stall threshold is exceeded', () => {
    retVal2.result.summary.run_state.should.equal(L.STATE_STALLED)
  })

  it('should return ok false for bad data', () => {
    retVal3.ok.should.be.false
    // console.log(JSON.stringify(retVal3,null,2))
  })
})
