const chai = require('chai')
const LROProgressModel = require('../../src/LROProgressModel')
chai.should()
const expect = chai.expect

describe('LROProgressModel', () => {
  it('should work as expected', () => {
    expect(() => LROProgressModel({})).to.throw('expecting percentage to be Number, got undefined')
    expect(() => LROProgressModel({percentage: -2})).to.throw('percentage must be >= 0 (got: -2)')

    const normal = LROProgressModel({percentage: 10})
    normal.percentage.should.equal(10)

    const extra = LROProgressModel({percentage: 10, files: 7})
    extra.percentage.should.equal(10)
    extra.files.should.equal(7)
    JSON.stringify(extra).should.equal('{"percentage":10}')

    expect(() => LROProgressModel('foo')).to.throw('expecting Object, got String "foo"')
  })
})
