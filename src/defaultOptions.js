const sysLocale = require('@eluvio/elv-js-helpers/sysLocale')
const sysTimezone = require('@eluvio/elv-js-helpers/sysTimezone')

const _DEFAULT_STALL_THRESHOLD = 15 * 60 // 15 minutes

/**
 * Returns an object containing default options for `enhanceLROStatus` and `enhanceLROStatusEntry`.
 *
 * Note that you must still add a `currentTime` property to the result before use.
 *
 * @function
 * @category Miscellaneous
 * @sig () -> Object
 * @returns {Object} Partially populated options  object
 * @example
 *
 * const defaultOptions = require('@eluvio/elv-lro-status/defaultOptions')
 *
 * // Output when system is set to US / Pacific timezone
 * console.log(JSON.stringify(defaultOptions(), null, 2))
 * `{
 *   "locale": "en-US",
 *   "stallThreshold": 900,
 *   "timezone": "America/Los_Angeles"
 * }`
 *
 */
const defaultOptions = () => Object({
  locale: sysLocale(),
  stallThreshold: _DEFAULT_STALL_THRESHOLD,
  timezone: sysTimezone()
})

module.exports = defaultOptions
