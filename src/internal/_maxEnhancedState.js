const fromPairs = require('ramda/src/fromPairs') // not to be confused with @elv-js-helpers/fromPairs
const last = require('ramda/src/last')
const sortBy = require('ramda/src/sortBy')

const {STATE_UNKNOWN, STATES} = require('../enhancedRunState')
const mapWithIndex = require('@eluvio/elv-js-helpers/mapWithIndex')

/**
 * A lookup table for enhanced run state precedence {unknown: 0, finished: 1, ...}
 * @constant
 * @private
 * @type {Object}
 * @category Constant
 */
const _STATE_PRECEDENCE = fromPairs(mapWithIndex((e, i) => [e, i], STATES))

/**
 * Returns the enhanced run state with maximum precedence from a list, or `STATE_UNKNOWN` if an empty list passed in
 *
 * @function
 * @private
 * @category Conversion
 * @sig [String] -> String
 * @param {String[]} list - An array of enhanced run states
 * @returns {String} The state with the highest precedence, or value or `STATE_UNKNOWN` if `list` is empty.
 * @example
 *
 * const _maxEnhancedState = require('@eluvio/elv-lro-status/internal/_maxEnhancedState')
 *
 * _maxEnhancedState(['running', 'stalled']) //=> 'stalled'
 *
 * _maxEnhancedState([])                     //=> 'unknown'
 *
 */
const _maxEnhancedState = list => last(sortBy(state => _STATE_PRECEDENCE[state], list)) || STATE_UNKNOWN

module.exports = _maxEnhancedState
