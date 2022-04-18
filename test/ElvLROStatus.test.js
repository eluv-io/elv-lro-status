const chai = require('chai')
chai.should()

// noinspection JSCheckFunctionSignatures
chai.use(require('chai-things'))
const expect = chai.expect

const {DateTime} = require('luxon')

const R = require('ramda')

const L = require('../src/ElvLROStatus')
const {EnhancedStatus} = require('../src/ElvLROStatus')
const {dump} = require('../src/lib/utils')

// compute minimum possible 'current time' given LRO status return data
const testCaseMinCurrentTime = lroStatus => {
  // filter out non-running items
  const runningItems = R.values(R.filter(s => s.run_state === L.STATE_RUNNING, lroStatus))
  // find the one updated most recently
  const withStartMs = runningItems.map(s => R.assoc('start_ms', DateTime.fromISO(s.start).toMillis(), s))
  const withLastUpdatedMs = withStartMs.map(s => R.assoc('last_updated_ms', s.start_ms + s.duration_ms, s))
  const mostRecentlyUpdated = R.last(R.sort(R.prop('last_updated_ms'), withLastUpdatedMs))

  return DateTime.fromMillis(mostRecentlyUpdated.last_updated_ms).toUTC().toJSDate()
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

const LRO_NO_PROGRESS_YET = {
  tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh: {
    duration: 0,
    duration_ms: 0,
    progress: {
      percentage: 0
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
  const retValRunningWithProgress = EnhancedStatus(LRO_1_FINISHED_1_RUNNING, testCaseMinCurrentTime(LRO_1_FINISHED_1_RUNNING))
  const retValRunningNoProgress = EnhancedStatus(LRO_NO_PROGRESS_YET, testCaseMinCurrentTime(LRO_NO_PROGRESS_YET))
  const stallTime = new Date()
  stallTime.setTime(testCaseMinCurrentTime(LRO_1_FINISHED_1_RUNNING).getTime() + 1000 * (L.DEFAULT_STALL_THRESHOLD + 60))
  const retValStalled = EnhancedStatus(LRO_1_FINISHED_1_RUNNING, stallTime)
  const retValBadDta = EnhancedStatus(LRO_BAD_DATA, new Date)


  it('should return ok true for valid data', () => {
    if (!retValRunningWithProgress.ok) dump(retValRunningWithProgress)
    retValRunningWithProgress.ok.should.be.true

    if (!retValRunningNoProgress.ok) dump(retValRunningNoProgress)
    retValRunningNoProgress.ok.should.be.true

    if (!retValStalled.ok) dump(retValStalled)
    retValStalled.ok.should.be.true
  })

  it('should return summary status of "running" for non-stalled running LRO', () => {
    retValRunningWithProgress.result.summary.run_state.should.equal(L.STATE_RUNNING)
    retValRunningNoProgress.result.summary.run_state.should.equal(L.STATE_RUNNING)
  })

  it('should return no estimated_time_left_seconds for running LRO with zero progress', () => {
    retValRunningNoProgress.result.summary.should.not.haveOwnProperty('estimated_time_left_seconds')
  })

  it('should return no local eta for running LRO with zero progress', () => {
    retValRunningNoProgress.result.summary.should.not.haveOwnProperty('eta_local')
  })

  it('should return estimated_time_left_h_m_s of "unknown" for running LRO with zero progress', () => {
    expect(retValRunningNoProgress.result.summary.estimated_time_left_h_m_s.startsWith('unknown')).to.be.true
  })

  it('should return summary status of "stalled" when stall threshold is exceeded', () => {
    retValStalled.result.summary.run_state.should.equal(L.STATE_STALLED)
  })

  it('should return ok false for bad data', () => {
    retValBadDta.ok.should.be.false
    // console.log(JSON.stringify(retValBadDta,null,2))
  })
})
