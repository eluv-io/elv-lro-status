const curry = require('@eluvio/elv-js-helpers/curry')
const validator = require('@eluvio/elv-js-helpers/validator')

const _enhanceNonRunningEntry = require('./internal/_enhanceNonRunningEntry')
const _enhanceRunningEntry = require('./internal/_enhanceRunningEntry')
const ERS = require('./enhancedRunState')
const OptionsModel = require('./OptionsModel')

/**
 * Returns an enhanced copy of the status entry for a single LRO, wrapped in a
 * [Crocks Result](https://crocks.dev/docs/crocks/Result.html).
 *
 * * Checks for bad options
 * * Checks for bad reported progress percentage
 * * Checks if LRO may be stalled
 * * Adds ETA fields if applicable
 *
 * Bad options will cause an `Err` to be returned
 *
 * @function
 * @curried
 * @category Conversion
 * @sig Pair String Object -> Ok Pair String Object | Err Array
 * @param {Object} options
 * @param {Date} options.currentTime - The value to use for current time when calculating ETA fields
 * @param {String} options.locale - The locale to use when formatting the `eta_local` field
 * @param {Number} options.stallThreshold - How many seconds to allow to pass between LRO info updates before warning that LRO may have terminated
 * @param {String} options.timezone - The timezone to use when formatting the `eta_local` field
 * @param {Pair} lro - A Crocks Pair with LRO ID as first element and LRO Status Entry as second element
 * @returns {Result} Either `Err([errors])` or `Ok(Pair(lroId, enhancedStatusObject))`
 * @example
 *
 * const Pair = require('@eluvio/elv-js-helpers/Pair')
 *
 * const defaultOptions = require('@eluvio/elv-lro-status/defaultOptions')
 *
 * const options = Object.assign(defaultOptions(), {currentTime: new Date})
 *
 * const singleLRO = Pair(
 *   'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU',
 *   {
 *     "duration": 335613000000,
 *     "duration_ms": 335613,
 *     "end": "2022-04-08T21:10:34Z",
 *     "progress": {
 *       "percentage": 100
 *     },
 *     "run_state": "finished",
 *     "start": "2022-04-08T21:05:00Z"
 *   }
 * )
 *
 * // EXAMPLE: Successful call
 * enhanceLROStatusEntry(options, singleLRO)          //=> Ok Pair('tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjJ2kukiD5NmnEgCP7iFFBjU', {...})
 *
 * // EXAMPLE: Failed call
 * enhanceLROStatusEntry(defaultOptions(), singleLRO) //=> Err [error objects]
 *
 */
// TODO: add example above
const enhanceLROStatusEntry = curry(
  (options, lro) => validator(OptionsModel)(options).map(
    validatedOptions => lro.snd().run_state === ERS.STATE_RUNNING ?
      _enhanceRunningEntry(validatedOptions, lro) :
      _enhanceNonRunningEntry(lro)
  )
)

module.exports = enhanceLROStatusEntry
