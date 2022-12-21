
const validator = require('@eluvio/elv-js-helpers/validator')

const mergeDeepRight = require('@eluvio/ramda-fork/src/mergeDeepRight')

const defaultOptions = require('./defaultOptions')
const OptionsModel = require('./OptionsModel')

/**
 * Fills in missing options for `enhanceLROStatus()` with default values, validates after merging, then returns a
 * [Crocks Result](https://crocks.dev/docs/crocks/Result.html), either an `Ok` wrapping the final options or an `Err`
 * wrapping an array of errors.
 *
 * @function
 * @category Conversion
 * @sig * -> Result
 * @param {Object} options - The options to validate
 * @returns {Result} A [Crocks Result](https://crocks.dev/docs/crocks/Result.html)
 * @example
 *
 * const mergeDefaultOptions = require('@eluvio/elv-lro-status/mergeDefaultOptions')
 *
 * mergeDefaultOptions({
 *   currentTime: new Date,
 *   locale: 'en-US',
 *   timezone: 'America/Los_Angeles'
 * })                                  //=> Ok() wrapping a copy of input object with {stallThreshold: 900} merged in
 *
 * OptionsModel({
 *   locale: 'en-US',
 *   stallThreshold: 900,
 *   timezone: 'America/Los_Angeles'
 * })                                  //=> Err([error object])
 *
 *
 */
const mergeDefaultOptions = options => validator(OptionsModel)(mergeDeepRight(defaultOptions(),options))

module.exports = mergeDefaultOptions
