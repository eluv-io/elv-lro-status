const sysLocale = require('@eluvio/elv-js-helpers/sysLocale')
const sysTimezone = require('@eluvio/elv-js-helpers/sysTimezone')

const _DEFAULT_STALL_THRESHOLD = 15 * 60 // 15 minutes

/**
 * Returns an object containing default options for `enhanceLROStatus` and `enhanceLROStatusEntry`.
 *
 * Note that you must still add a currentTime property to the result before use.
 *
 * @function
 * @category Miscellaneous
 * @sig () -> Object
 * @returns {Object} Partially populated options  object
 *
 * @example
 *
 * _enhLROStatusOptsModel({})
 *
 */
const defaultOptions = () => Object({
  locale: sysLocale(),
  stallThreshold: _DEFAULT_STALL_THRESHOLD,
  timezone: sysTimezone()
})

module.exports = defaultOptions
