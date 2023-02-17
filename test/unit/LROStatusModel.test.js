const chai = require('chai')
const LROStatusModel = require('../../src/LROStatusModel')
chai.should()
const expect = chai.expect

const oldInfo = {
  '3326b297-20b5-4484-af9f-c92234f73837': {
    'duration': 11329000000,
    'duration_ms': 11329,
    'end': '2020-05-19T19:43:50Z',
    'progress': {
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2020-05-19T19:43:39Z'
  },
  '4aefec26-1d07-47bf-bd21-d1807a6ceee4': {
    'duration': 11493000000,
    'duration_ms': 11493,
    'end': '2020-05-19T19:43:50Z',
    'progress': {
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2020-05-19T19:43:39Z'
  },
  '80f8f36b-919d-4b77-ae65-858e2fa06191': {
    'duration': 5605094000000,
    'duration_ms': 5605094,
    'end': '2020-05-19T21:17:04Z',
    'progress': {
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2020-05-19T19:43:39Z'
  },
  '897d5199-229c-478a-8ac2-16449b1ccab2': {
    'duration': 5687096000000,
    'duration_ms': 5687096,
    'end': '2020-05-16T21:38:09Z',
    'progress': {
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2020-05-16T20:03:22Z'
  },
  '9a8160a8-5e33-4ad0-8046-8b1b5e2984c8': {
    'duration': 11392000000,
    'duration_ms': 11392,
    'end': '2020-05-19T19:43:50Z',
    'progress': {
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2020-05-19T19:43:39Z'
  },
  'be79921e-1096-4f7b-b538-5062b98114be': {
    'duration': 10053000000,
    'duration_ms': 10053,
    'end': '2020-05-16T20:03:32Z',
    'progress': {
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2020-05-16T20:03:22Z'
  },
  'tlro1EjjMG2jAvkrkh85psbfEPJooB3932rEB59Kqz1Nv5GHpZCKDo6C1u': {
    'duration': 1539437000000,
    'duration_ms': 1539437,
    'progress': {
      'details': {},
      'percentage': 20.833333333333336
    },
    'run_state': 'running',
    'start': '2023-02-17T00:21:32Z'
  },
  'tlro1EjjMG2jAvkrkh85psbfEPJooB3932rEMPA3jRxZF9EKNqaPH1m3sM': {
    'duration': 16913000000,
    'duration_ms': 16913,
    'end': '2023-02-17T00:21:49Z',
    'progress': {
      'details': {},
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2023-02-17T00:21:32Z'
  },
  'tlro1EjjMG2jAvkrkh85psbfEPJooB3932rEP4Qoctzm1ddZHy8P2WDUMC': {
    'duration': 15093000000,
    'duration_ms': 15093,
    'end': '2023-02-17T00:21:47Z',
    'progress': {
      'details': {},
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2023-02-17T00:21:32Z'
  },
  'tlro1EjjMG2jAvkrkh85psbfEPJooB3932rEZufj1YpYcqLDaCtTWyDgtT': {
    'duration': 15004000000,
    'duration_ms': 15004,
    'end': '2023-02-17T00:21:47Z',
    'progress': {
      'details': {},
      'percentage': 100
    },
    'run_state': 'finished',
    'start': '2023-02-17T00:21:32Z'
  }
}

describe('LROStatusModel', () => {
  it('should work as expected', () => {
    expect(() => LROStatusModel({})).to.throw('Value must not be empty (got: {})')
  })

  it('should accept data that has old-format LRO IDs', () => {
    LROStatusModel(oldInfo)
  })
})
