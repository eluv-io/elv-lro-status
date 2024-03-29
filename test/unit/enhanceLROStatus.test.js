const chai = require('chai')
chai.should()

// noinspection JSCheckFunctionSignatures
chai.use(require('chai-things'))
const expect = chai.expect

const kindOf = require('kind-of')

const R = require('@eluvio/ramda-fork')

const utcStrToDate = require('@eluvio/elv-js-helpers/utcStrToDate')

const defaultOptions = require('../../src/defaultOptions')
const enhanceLROStatus = require('../../src/enhanceLROStatus')
const ERS = require('../../src/enhancedRunState')

const dump = x => console.log(JSON.stringify(x, null, 2))

// Compute minimum possible 'current time' given LRO status return data
// (i.e. the last time the server touched the status data)
// Returns a Javascript Date
const testCaseMinCurrentTime = lroStatus => {
  // filter out non-running items
  const runningItems = R.filter(s => s.run_state === ERS.STATE_RUNNING, R.values(lroStatus))
  // find the one updated most recently
  const withStartMs = runningItems.map(s => R.assoc('start_ms', utcStrToDate(s.start).valueOf(), s))
  const withLastUpdatedMs = withStartMs.map(s => R.assoc('last_updated_ms', s.start_ms + s.duration_ms, s))
  const mostRecentlyUpdated = R.last(R.sort(R.prop('last_updated_ms'), withLastUpdatedMs))

  return new Date(mostRecentlyUpdated.last_updated_ms)
}

// minimum current time for this fixture: 2022-04-08T21:28:10.740Z (2:28pm PDT)
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

const LRO_1_FINISHED_1_NO_PROGRESS = {
  'tlro1EjchYzPaMx7VJV3JM8EmxaSfnyK4UDUp1rwBMcwwu7yXftKRfsPz4':
    {
      'desc': 'stream: video, offering: default, variant: default, masterHash: hq__7DGknRDhZrAcTH1rwF5ZjP6MjVHbYZNvuoKfCnAEJ8t6EAetSF5Mzvx5kjQuQaAYfQDWehQzJ2',
      'duration': 0,
      'duration_ms': 0,
      'key': 'video.default.xcVideo.Docu_Brujas_ESP.mp4.tqw__HSWkzAJ4ak4Qpg9sJtMRUY6eg4bJakCphJGJZTLqHrUU5oaGz3eGQXKgEPaNkBCvRy8AAhrhvw9detQ4sEo',
      'name': 'MEZMAKER VIDEO (stream key: video)',
      'progress':
        {
          'percentage': 0
        },
      'run_state': 'running',
      'start': '2023-01-31T21:57:39Z'
    },
  'tlro1EjchYzPaMx7VJV3JM8EmxaSfnyK4UDUpLK8VsuySE1V9YZvxGTyxK':
    {
      'desc': 'stream: audio, offering: default, variant: default, masterHash: hq__7DGknRDhZrAcTH1rwF5ZjP6MjVHbYZNvuoKfCnAEJ8t6EAetSF5Mzvx5kjQuQaAYfQDWehQzJ2',
      'duration': 796383000000,
      'duration_ms': 796383,
      'end': '2023-01-31T22:10:56Z',
      'key': 'audio.default.xcAudio.Docu_Brujas_ESP.mp4.tqw__HSWkzAJ4ak4Qpg9sJtMRUY6eg4bJakCphJGJZTLqHrUU5oaGz3eGQXKgEPaNkBCvRy8AAhrhvw9detQ4sEo',
      'name': 'MEZMAKER AUDIO (stream key: audio)',
      'progress':
        {
          'percentage': 100
        },
      'run_state': 'finished',
      'start': '2023-01-31T21:57:39Z'
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
    duration: 0,
    duration_ms: -1000,
    end: '2022-04-08T21:10:34Z',
    progress: {
      percentage: 100
    },
    run_state: 'finished',
    start: '2022-04-08T21:05:00Z'
  }
}

const TEST_CASE_2_RUNNING_NO_PROGRESS = {
  'tlro1EjdqrHgbbPyYcqzFMu7N59et384qkQwp4us7CTGq36GjZPptKgKHR': {
    'duration': 0,
    'duration_ms': 0,
    'progress': {
      'percentage': 0
    },
    'run_state': 'running',
    'start': '2022-05-18T21:37:59Z'
  },
  'tlro1EjdqrHgbbPyYcqzFMu7N59et384qkQwpRg8EDvAQiwVJgg9w6MQT2': {
    'duration': 0,
    'duration_ms': 0,
    'progress': {
      'percentage': 0
    },
    'run_state': 'running',
    'start': '2022-05-18T21:37:59Z'
  }
}

const TEST_CASE_EXTRA_DATA_LRO = {
  'tlro1EjdqrHgbbPyYcqzFMu7N59et384qkQwp4us7CTGq36GjZPptKgKHR': {
    'desc': 'description',
    'duration': 0,
    'duration_ms': 0,
    'key': 'LRO key',
    'name': 'LRO name',
    'progress': {
      'details': {},
      'percentage': 0
    },
    'run_state': 'running',
    'start': '2022-05-18T21:37:59Z'
  },
  'tlro1EjdqrHgbbPyYcqzFMu7N59et384qkQwpRg8EDvAQiwVJgg9w6MQT2': {
    'duration': 0,
    'duration_ms': 0,
    'progress': {
      'percentage': 0
    },
    'run_state': 'running',
    'start': '2022-05-18T21:37:59Z'
  }
}


const optionsPlusTime = t => R.assoc('currentTime', t, defaultOptions())

describe('enhanceLROStatus', function () {

  const retVal1Running1NoProgress = enhanceLROStatus(
    optionsPlusTime(testCaseMinCurrentTime(LRO_1_FINISHED_1_NO_PROGRESS)),
    LRO_1_FINISHED_1_NO_PROGRESS
  )

  const retVal2RunningNoProgress = enhanceLROStatus(
    optionsPlusTime(testCaseMinCurrentTime(TEST_CASE_2_RUNNING_NO_PROGRESS)),
    TEST_CASE_2_RUNNING_NO_PROGRESS
  )

  const retValRunningWithProgress = enhanceLROStatus(
    optionsPlusTime(testCaseMinCurrentTime(LRO_1_FINISHED_1_RUNNING)),
    LRO_1_FINISHED_1_RUNNING
  )

  const retValRunningWithProgress_1SecLater = enhanceLROStatus(
    optionsPlusTime(new Date(testCaseMinCurrentTime(LRO_1_FINISHED_1_RUNNING).valueOf() + 1000)),
    LRO_1_FINISHED_1_RUNNING
  )

  const retValRunningNoProgress = enhanceLROStatus(
    optionsPlusTime(testCaseMinCurrentTime(LRO_NO_PROGRESS_YET)),
    LRO_NO_PROGRESS_YET
  )

  const stallTime = new Date(
    testCaseMinCurrentTime(LRO_1_FINISHED_1_RUNNING).valueOf() +
    1000 * (defaultOptions().stallThreshold + 60)
  )

  const retValStalled = enhanceLROStatus(
    optionsPlusTime(stallTime),
    LRO_1_FINISHED_1_RUNNING
  )
  const retValBadData = enhanceLROStatus(
    optionsPlusTime(new Date),
    LRO_BAD_DATA
  )

  const retValExtraData = enhanceLROStatus(
    optionsPlusTime(testCaseMinCurrentTime(TEST_CASE_EXTRA_DATA_LRO)),
    TEST_CASE_EXTRA_DATA_LRO
  )

  it('should return ok true for valid data', () => {

    if (!retVal2RunningNoProgress.ok) dump(retVal2RunningNoProgress)
    retVal2RunningNoProgress.ok.should.be.true

    if (!retValRunningWithProgress.ok) dump(retValRunningWithProgress)
    retValRunningWithProgress.ok.should.be.true

    if (!retVal1Running1NoProgress.ok) dump(retVal1Running1NoProgress)
    retVal1Running1NoProgress.ok.should.be.true

    if (!retValRunningWithProgress_1SecLater.ok) dump(retValRunningWithProgress_1SecLater)
    retValRunningWithProgress_1SecLater.ok.should.be.true

    if (!retValRunningNoProgress.ok) dump(retValRunningNoProgress)
    retValRunningNoProgress.ok.should.be.true

    if (!retValStalled.ok) dump(retValStalled)
    retValStalled.ok.should.be.true

    if (!retValExtraData.ok) dump(retValExtraData)
    retValExtraData.ok.should.be.true
  })

  it('should return extra data if present', () => {
    retValExtraData.result.LROs.tlro1EjdqrHgbbPyYcqzFMu7N59et384qkQwp4us7CTGq36GjZPptKgKHR.progress.details.should.eql({})
    retValExtraData.result.LROs.tlro1EjdqrHgbbPyYcqzFMu7N59et384qkQwp4us7CTGq36GjZPptKgKHR.desc.should.equal('description')
    retValExtraData.result.LROs.tlro1EjdqrHgbbPyYcqzFMu7N59et384qkQwp4us7CTGq36GjZPptKgKHR.key.should.equal('LRO key')
    retValExtraData.result.LROs.tlro1EjdqrHgbbPyYcqzFMu7N59et384qkQwp4us7CTGq36GjZPptKgKHR.name.should.equal('LRO name')
    retVal1Running1NoProgress.result.LROs.tlro1EjchYzPaMx7VJV3JM8EmxaSfnyK4UDUp1rwBMcwwu7yXftKRfsPz4.name.should.equal('MEZMAKER VIDEO (stream key: video)')
  })


  it('should return expected data for "1 finished, 1 no progress case', () => {
    console.log(JSON.stringify(retVal1Running1NoProgress,null,2))
    retVal1Running1NoProgress.result.summary.run_state.should.equal('running')
    retVal1Running1NoProgress.result.summary.estimated_time_left_h_m_s.should.equal('unknown (not enough progress yet)')
    kindOf(retVal1Running1NoProgress.result.summary.estimated_time_left_seconds).should.equal('undefined')
    kindOf(retVal1Running1NoProgress.result.summary.eta_local).should.equal('undefined')
  })

  // note: this test depends on system locale and time zone
  it('should return expected data for "1 finished, 1 running case', () => {
    retValRunningWithProgress.result.summary.run_state.should.equal('running')
    retValRunningWithProgress.result.summary.estimated_time_left_h_m_s.should.equal('7m 03s')
    retValRunningWithProgress.result.summary.estimated_time_left_seconds.should.equal(423)
    retValRunningWithProgress.result.summary.eta_local.should.equal('2:35:13 PM PDT')
  })

  it('should decrement ETA according to time elapsed since last update', () => {
    retValRunningWithProgress_1SecLater.result.summary.estimated_time_left_seconds.should.equal(422)
  })

  it('should return summary status of "running" for non-stalled running LRO', () => {
    retValRunningWithProgress.result.summary.run_state.should.equal(ERS.STATE_RUNNING)
    retValRunningWithProgress_1SecLater.result.summary.run_state.should.equal(ERS.STATE_RUNNING)
    retValRunningNoProgress.result.summary.run_state.should.equal(ERS.STATE_RUNNING)
  })

  it('should return no estimated_time_left_seconds for running LRO with zero progress', () => {
    kindOf(retValRunningNoProgress.result.summary.estimated_time_left_seconds).should.equal('undefined')
  })

  it('should return no local eta for running LRO with zero progress', () => {
    kindOf(retValRunningNoProgress.result.summary.eta_local).should.equal('undefined')
  })

  it('should return estimated_time_left_h_m_s of "unknown" for running LRO with zero progress', () => {
    expect(retValRunningNoProgress.result.summary.estimated_time_left_h_m_s.startsWith('unknown')).to.be.true
  })

  it('should return summary status of "stalled" when stall threshold is exceeded', () => {
    retValStalled.result.summary.run_state.should.equal(ERS.STATE_STALLED)
  })

  it('should return ok false for bad data', () => {
    retValBadData.ok.should.be.false
  })
})
