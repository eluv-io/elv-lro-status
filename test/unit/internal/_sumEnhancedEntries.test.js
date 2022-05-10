const chai = require('chai')
chai.should()

const _sumEnhancedEntries = require('../../../src/internal/_sumEnhancedEntries')

describe('_sumEnhancedEntries', function () {

  it('should return expected values', () => {
    const enhancedEntriesNoProgress = {
      'tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSv3L57AV3CPYHbLmk3E9SF1b': {
        'duration': 0,
        'duration_ms': 0,
        'progress': {
          'percentage': 0
        },
        'estimated_time_left_h_m_s': 'unknown (not enough progress yet)',
        'run_state': 'running',
        'start': '2022-04-09T05:09:00Z',
        'seconds_since_last_update': 84
      },
      'tlro1Ejh9gNWAaTmfWJKeuu99V2MZ17XXkSvGJyKKJpmqtmJ2fzo5Fb3Be': {
        'duration': 12747000000,
        'duration_ms': 12747,
        'end': '2022-04-09T05:09:13Z',
        'progress': {
          'percentage': 100
        },
        'run_state': 'finished',
        'start': '2022-04-09T05:09:00Z'
      }
    }

    const noProgressResult = _sumEnhancedEntries(enhancedEntriesNoProgress)
    JSON.stringify(noProgressResult).should.equal(
      JSON.stringify(
        {
          'run_state': 'running',
          'estimated_time_left_h_m_s': 'unknown (not enough progress yet)'
        }
      )
    )

    const enhancedEntriesWithProgress = {
      'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU': {
        'duration': 1390740000000,
        'duration_ms': 1390740,
        'progress': {
          'percentage': 76.66666666666667
        },
        'run_state': 'running',
        'start': '2022-04-08T21:05:00Z',
        'seconds_since_last_update': 359,
        'estimated_time_left_seconds': 424,
        'estimated_time_left_h_m_s': '7m 04s',
        'eta_local': '2:41:14 PM PDT'
      },
      'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh': {
        'duration': 1390740000000,
        'duration_ms': 1390740,
        'progress': {
          'percentage': 76.66666666666667
        },
        'run_state': 'running',
        'start': '2022-04-08T21:05:00Z',
        'seconds_since_last_update': 359,
        'estimated_time_left_seconds': 423,
        'estimated_time_left_h_m_s': '7m 03s',
        'eta_local': '2:41:13 PM PDT'
      }
    }

    const progressResult = _sumEnhancedEntries(enhancedEntriesWithProgress)
    JSON.stringify(progressResult).should.equal(
      JSON.stringify(
        {
          'run_state': 'running',
          'estimated_time_left_seconds': 424,
          'estimated_time_left_h_m_s': '7m 04s',
          'eta_local': '2:41:14 PM PDT'
        }
      )
    )
  })

})
