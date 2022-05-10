const RS = require('./lroRunState')

/**
 * An enhanced `run_state` (NOT used by Eluvio Content Fabric servers) to indicate that an LRO has reported a bad number
 * for progress percentage (i.e. either > 100 for any run_state, or < 100 for run_state 'finished')
 *
 * @constant
 * @default
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_BAD_PCT} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'bad percentage'
 *
 */
const STATE_BAD_PCT = 'bad percentage'

/**
 * An enhanced `run_state` (also used by Eluvio Content Fabric servers) to indicate that an LRO has been cancelled due
 * to a server shutdown.
 *
 * Note that in practice this `run_state` is almost never encountered. (TODO: check implementation details)
 *
 * @constant
 * @default cancelled by node shutdown
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_CANCELLED_SHUTDOWN} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'cancelled by node shutdown'
 *
 */
const STATE_CANCELLED_SHUTDOWN = RS.LRO_RS_CANCELLED_SHUTDOWN


/**
 * An enhanced `run_state` (also used by Eluvio Content Fabric servers) to indicate that an LRO has been cancelled due
 * to a timeout.
 *
 * Note that in practice this `run_state` is almost never encountered. (TODO: check implementation details)
 *
 * @constant
 * @default cancelled by timeout
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_CANCELLED_TIMEOUT} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'cancelled by timeout'
 *
 */
const STATE_CANCELLED_TIMEOUT = RS.LRO_RS_CANCELLED_TIMEOUT

/**
 * An enhanced `run_state` (also used by Eluvio Content Fabric servers) to indicate that an LRO has been cancelled by
 * the user.
 *
 * Note that in practice this `run_state` is almost never encountered. (TODO: check implementation details)
 *
 * @constant
 * @default cancelled by user
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_CANCELLED_USER} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'cancelled by user'
 *
 */
const STATE_CANCELLED_USER = RS.LRO_RS_CANCELLED_USER

/**
 * An enhanced `run_state` (also used by Eluvio Content Fabric servers) to indicate that an LRO has encountered an error
 * and has terminated.
 *
 * @constant
 * @default failed
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_FAILED} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'failed'
 *
 */
const STATE_FAILED = RS.LRO_RS_FAILED

/**
 * An enhanced `run_state` (also used by Eluvio Content Fabric servers) to indicate that an LRO has finished.
 *
 * Note that if the LRO reports a progress percentage that is not `100`, the `run_state` will be set to `STATE_BAD_PCT`
 * instead.
 *
 * @constant
 * @default finished
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_FINISHED} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'finished'
 *
 */
const STATE_FINISHED = RS.LRO_RS_FINISHED


/**
 * An enhanced `run_state` (also used by Eluvio Content Fabric servers) to indicate that an LRO has not started yet.
 *
 * Note that in practice this `run_state` is almost never encountered.
 *
 * @constant
 * @default not started
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_NOT_STARTED} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'not started'
 *
 */
const STATE_NOT_STARTED = RS.LRO_RS_NOT_STARTED

/**
 * An enhanced `run_state` (also used by Eluvio Content Fabric servers) to indicate that an LRO is running.
 * Note that this does not guarantee that the LRO is actually running.
 *
 * @constant
 * @default running
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_RUNNING} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'running'
 *
 */
const STATE_RUNNING = RS.LRO_RS_RUNNING

/**
 * An enhanced `run_state` (NOT used by Eluvio Content Fabric servers) to indicate that an LRO has not updated its
 * information in a while and may have terminated.
 *
 * @constant
 * @default
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_STALLED} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'stalled'
 *
 */
const STATE_STALLED = 'stalled'

/**
 * An enhanced `run_state` (NOT used by Eluvio Content Fabric servers) to indicate that `run_state` cannot be determined.
 *
 * @constant
 * @default
 * @type {String}
 * @category Constant
 * @example
 *
 * const {STATE_UNKNOWN} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> 'unknown'
 *
 */
const STATE_UNKNOWN = 'unknown'

/**
 * An array of all the enhanced `run_state` constants, ordered by increasing precedence. When creating a status summary,
 * states later in list will take precedence, e.g if one LRO is 'finished' and one LRO is 'running', the summary
 * `run_state` will be 'running'. Generally error/cancel states take precedence over `STATE_RUNNING`, which takes
 * precedence over the remaining states.
 *
 * The order is:
 * * STATE_UNKNOWN
 * * STATE_FINISHED
 * * STATE_NOT_STARTED
 * * STATE_RUNNING
 * * STATE_STALLED
 * * STATE_BAD_PCT
 * * STATE_FAILED
 * * STATE_CANCELLED_TIMEOUT
 * * STATE_CANCELLED_SHUTDOWN
 * * STATE_CANCELLED_USER
 *
 * @constant
 * @type {String[]}
 * @category Constant
 * @example
 *
 * const {STATES} = require('@eluvio/elv-lro-status/enhancedRunState')  //=> ['unknown', ..., 'cancelled by user']
 *
 */
const STATES = [
  STATE_UNKNOWN,
  STATE_FINISHED,
  STATE_NOT_STARTED,
  STATE_RUNNING,
  STATE_STALLED,
  STATE_BAD_PCT,
  STATE_FAILED,
  STATE_CANCELLED_TIMEOUT,
  STATE_CANCELLED_SHUTDOWN,
  STATE_CANCELLED_USER
]

module.exports = {
  STATE_BAD_PCT,
  STATE_CANCELLED_SHUTDOWN,
  STATE_CANCELLED_TIMEOUT,
  STATE_CANCELLED_USER,
  STATE_FAILED,
  STATE_FINISHED,
  STATE_NOT_STARTED,
  STATE_RUNNING,
  STATE_STALLED,
  STATE_UNKNOWN,
  STATES
}
