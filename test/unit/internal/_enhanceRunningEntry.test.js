const chai = require('chai')
chai.should()

const Pair = require('@eluvio/elv-js-helpers/Pair')
const utcStrToDate = require('@eluvio/elv-js-helpers/utcStrToDate')

const _enhanceRunningEntry = require('../../../src/internal/_enhanceRunningEntry')
const defaultOptions = require('../../../src/defaultOptions')

describe('_enhanceRunningEntry', function () {

  it('should return expected values', () => {
    const options = Object.assign(defaultOptions(), {currentTime: utcStrToDate('2022-04-08T21:34:10Z')})

    const lro = Pair(
      'tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be',
      {
        'duration': 1390740000000,
        'duration_ms': 1390740,
        'progress': {
          'percentage': 76.66666666666667
        },
        'run_state': 'running',
        'start': '2022-04-08T21:05:00Z'
      }
    )

    const goodResult = _enhanceRunningEntry(options, lro)
    JSON.stringify(goodResult.snd()).should.equal(
      JSON.stringify({
        'duration': 1390740000000,
        'duration_ms': 1390740,
        'progress': {
          'percentage': 76.66666666666667
        },
        'run_state': 'running',
        'start': '2022-04-08T21:05:00Z',
        'seconds_since_last_update': 359,
        'estimated_time_left_seconds': 64,
        'estimated_time_left_h_m_s': '1m 04s',
        'eta_local': '2:35:14 PM PDT'
      })
    )

    lro.map(x => x.progress.percentage = 120)
    const badResult = _enhanceRunningEntry(options, lro)
    JSON.stringify(badResult.snd()).should.equal(
      JSON.stringify(
        {
          'duration': 1390740000000,
          'duration_ms': 1390740,
          'progress': {
            'percentage': 120
          },
          'run_state': 'bad percentage',
          'start': '2022-04-08T21:05:00Z',
          'seconds_since_last_update': 359,
          'reported_run_state': 'running',
          'warning': 'Job tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be has progress percentage > 100, process has generated too much data'
        }
      )
    )

    const badOptions = Object.assign(defaultOptions(), {currentTime: utcStrToDate('2022-04-08T22:34:10Z')})
    lro.map(x => x.progress.percentage = 76.66666666666667)
    const stalledResult = _enhanceRunningEntry(badOptions, lro)
    JSON.stringify(stalledResult.snd()).should.equal(
      JSON.stringify(
        {
          'duration': 1390740000000,
          'duration_ms': 1390740,
          'progress': {
            'percentage': 76.66666666666667
          },
          'run_state': 'stalled',
          'start': '2022-04-08T21:05:00Z',
          'seconds_since_last_update': 3959,
          'estimated_time_left_seconds': 0,
          'estimated_time_left_h_m_s': '0s',
          'eta_local': '3:34:10 PM PDT',
          'reported_run_state': 'running',
          'warning': 'status has not been updated in 3959 seconds, process may have terminated'
        }
      )
    )

  })


})
