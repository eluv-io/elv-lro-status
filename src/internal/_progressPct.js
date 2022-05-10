const path = require('ramda/src/path')

/**
 * Retrieves progress percent from LRO Status entry, protecting against missing keys
 *
 * @function
 * @private
 * @category Conversion
 * @sig Object -> Number | undefined
 * @param {Object} - An LRO Status Entry object
 * @returns {(Number | undefined)} The value or `undefined` if not found
 * @example
 *
 * const _progressPct = require('@eluvio/elv-lro-status/internal/_progressPct')
 *
 * _progressPct({progress: {pct: 10}}) //=> 10
 *
 * _progressPct({})                    //=> undefined
 *
 */
const _progressPct = path(['progress', 'percentage'])

module.exports = _progressPct
