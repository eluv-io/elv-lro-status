const chai = require('chai')
chai.should()

const equals = require('ramda/src/equals')

const Pair = require('@eluvio/elv-js-helpers/Pair')

const _enhanceNonRunningEntry = require('../../../src/internal/_enhanceNonRunningEntry')


describe('_enhanceNonRunningEntry', function () {

  it('should return expected values', () => {
    const lro = Pair(
      'tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be',
      {
        'duration': 12747000000,
        'duration_ms': 12747,
        'end': '2022-04-09T05:09:13Z',
        'progress': {
          'percentage': 100
        },
        'run_state': 'finished',
        'start': '2022-04-09T05:09:00Z'
      }
    )

    const goodResult = _enhanceNonRunningEntry(lro)
    equals(
      goodResult.snd(),
      {
        'duration': 12747000000,
        'duration_ms': 12747,
        'end': '2022-04-09T05:09:13Z',
        'progress': {
          'percentage': 100
        },
        'run_state': 'finished',
        'start': '2022-04-09T05:09:00Z'
      }
    ).should.be.true

    lro.map(x => x.progress.percentage = 120)
    const badResult = _enhanceNonRunningEntry(lro)
    equals(
      badResult.snd(),
      {
        'duration': 12747000000,
        'duration_ms': 12747,
        'end': '2022-04-09T05:09:13Z',
        'progress': {
          'percentage': 120
        },
        'run_state': 'bad percentage',
        'start': '2022-04-09T05:09:00Z',
        'reported_run_state': 'finished',
        'warning': 'Job tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be has run_state \'finished\', but progress pct is 120'
      }
    ).should.be.true
  })
})
