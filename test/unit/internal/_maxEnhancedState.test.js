const chai = require('chai')
chai.should()

const _maxEnhancedState = require('../../../src/internal/_maxEnhancedState')
const ERS = require('../../../src/enhancedRunState')

describe('_maxEnhancedState', function () {

  it('should return expected values', () => {
    _maxEnhancedState([ERS.STATE_RUNNING, ERS.STATE_STALLED])
      .should.equal(ERS.STATE_STALLED)

    _maxEnhancedState([])
      .should.equal(ERS.STATE_UNKNOWN)
  })
})
