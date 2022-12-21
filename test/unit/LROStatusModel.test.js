const chai = require('chai')
const LROStatusModel = require('../../src/LROStatusModel')
chai.should()
const expect = chai.expect

describe('LROStatusModel', () => {
  it('should work as expected', () => {
    expect(() => LROStatusModel({})).to.throw('Value must not be empty (got: {})')
  })
})
