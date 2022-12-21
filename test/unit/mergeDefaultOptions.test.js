const chai = require('chai')
chai.should()
// const expect = chai.expect

const mergeDefaultOptions = require('../../src/mergeDefaultOptions')
const resultToPOJO = require('@eluvio/elv-js-helpers/resultToPOJO')

describe('const mergeDefaultOptions = require(\'../../src/mergeDefaultOptions\')\n', () => {
  it('should work as expected', () => {

    resultToPOJO(
      mergeDefaultOptions({
        currentTime: new Date(0),
        locale: 'en-US',
        timezone: 'America/Los_Angeles'
      })
    ).should.eql({
      ok: true,
      result: {
        currentTime: new Date(0),
        locale: 'en-US',
        stallThreshold: 900,
        timezone: 'America/Los_Angeles'
      }
    })

    const errResult = resultToPOJO(
      mergeDefaultOptions({
        locale: 'en-US',
        stallThreshold: 900,
        timezone: 'America/Los_Angeles'
      })
    )
    errResult.ok.should.be.false
    errResult.errors.should.eql(['options: expecting currentTime to be Date, got undefined'])
  })
})
