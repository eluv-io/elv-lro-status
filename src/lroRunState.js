/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 * @example
 *
 * const {LRO_RS_NOT_STARTED} = require('@eluvio/elv-lro-status/lroRunState')  //=> 'not started'
 *
 */
const LRO_RS_NOT_STARTED = 'not started'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 * @example
 *
 * const {LRO_RS_RUNNING} = require('@eluvio/elv-lro-status/lroRunState')  //=> 'running'
 *
 */
const LRO_RS_RUNNING = 'running'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 * @example
 *
 * const {LRO_RS_FINISHED} = require('@eluvio/elv-lro-status/lroRunState')  //=> 'finished'
 *
 */
const LRO_RS_FINISHED = 'finished'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 * @example
 *
 * const {LRO_RS_FAILED} = require('@eluvio/elv-lro-status/lroRunState')  //=> 'failed'
 *
 */
const LRO_RS_FAILED = 'failed'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 * @example
 *
 * const {LRO_RS_CANCELLED_TIMEOUT} = require('@eluvio/elv-lro-status/lroRunState')  //=> 'cancelled by timeout'
 *
 */
const LRO_RS_CANCELLED_TIMEOUT = 'cancelled by timeout'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 * @example
 *
 * const {LRO_RS_CANCELLED_USER} = require('@eluvio/elv-lro-status/lroRunState')  //=> 'cancelled by user'
 *
 */
const LRO_RS_CANCELLED_USER = 'cancelled by user'

/**
 * `run_state` string returned by server for LROs
 * @constant
 * @type {String}
 * @default
 * @category Constant
 * @example
 *
 * const {LRO_RS_CANCELLED_SHUTDOWN} = require('@eluvio/elv-lro-status/lroRunState')  //=> 'cancelled by node shutdown'
 *
 */
const LRO_RS_CANCELLED_SHUTDOWN = 'cancelled by node shutdown'

/**
 * A list of all the possible values returned by server for LRO `run_state`
 *
 * @constant
 * @type {String[]}
 * @category Constant
 * @example
 *
 * const {LRO_RUN_STATES} = require('@eluvio/elv-lro-status/lroRunState')  //=> ['not started', ..., 'cancelled by node shutdown']
 *
 */
const LRO_RUN_STATES = [
  LRO_RS_NOT_STARTED,
  LRO_RS_RUNNING,
  LRO_RS_FINISHED,
  LRO_RS_FAILED,
  LRO_RS_CANCELLED_TIMEOUT,
  LRO_RS_CANCELLED_USER,
  LRO_RS_CANCELLED_SHUTDOWN
]

module.exports = {
  LRO_RS_NOT_STARTED,
  LRO_RS_RUNNING,
  LRO_RS_FINISHED,
  LRO_RS_FAILED,
  LRO_RS_CANCELLED_TIMEOUT,
  LRO_RS_CANCELLED_USER,
  LRO_RS_CANCELLED_SHUTDOWN,
  LRO_RUN_STATES
}
