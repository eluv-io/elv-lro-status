const chai = require('chai')
chai.should()

describe('elv-lro-status', () => {
  it('should not throw an exception when requiring the entire library', () => {
    const L = require('../../src/main')
    L.defaultOptions()
  })
})
