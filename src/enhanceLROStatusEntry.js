const curry = require('@eluvio/elv-js-helpers/curry')
const DatetimeModel = require('@eluvio/elv-js-helpers/DatetimeModel')
const defObjModel = require('@eluvio/elv-js-helpers/defObjModel')
const PositiveNumModel = require('@eluvio/elv-js-helpers/PositiveNumModel')
const validator = require('@eluvio/elv-js-helpers/validator')

const _enhanceNonRunningEntry = require('./internal/_enhanceNonRunningEntry')
const _enhanceRunningEntry = require('./internal/_enhanceRunningEntry')
const defaultOptions = require('./defaultOptions')
const ERS = require('./enhancedRunState')

/**
 * An [ObjectModel](http://objectmodel.js.org/) which validates that an input is:
 *
 * * A [Javascript Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
 * * Satisfies the field definitions for `enhanceLROStatusEntry`'s `options` argument.
 *
 * @function
 * @private
 * @category Model
 * @sig * -> Object -> Object | THROW
 * @param {Object} - The options to validate
 * @returns {Object} The validated options object
 *
 * @example
 *
 * _enhLROStatusEntryOptsModel({})
 *
 */
// TODO: add example above
const _enhLROStatusEntryOptsModel = defObjModel(
  'enhanceLROStatusEntry',
  {
    currentTime: DatetimeModel,
    locale: String,
    stallThreshold: PositiveNumModel,
    timezone: String
  }
).defaultTo(defaultOptions())

/**
 * Returns an enhanced copy of an LRO Status Entry for a non-running LRO, wrapped in a Crocks Result
 * Checks for bad options.
 * Checks for bad reported progress percentage.
 *
 * Bad options will cause an Err to be returned
 *
 * @function
 * @curried
 * @category Conversion
 * @sig String -> Object -> Object
 * @param {Object} options
 * @param {Date} options.currentTime - The value to use for current time when calculating ETA fields
 * @param {String} options.locale - The locale to use when formatting the `eta_local` field
 * @param {Number} options.stallThreshold - How many seconds to allow to pass between LRO info updates before warning that LRO may have terminated
 * @param {String} options.timezone - The timezone to use when formatting the `eta_local` field
 * @param {Pair} lro - A Crocks Pair with LRO ID as first element and LRO Status Entry as second element
 * @returns {Result} Either Err([errorMessages]) or Ok(Pair(lroId, enhancedStatusObject))
 *
 * @example
 *
 * enhanceLROStatusEntry('',{})
 *
 *
 */
// TODO: add example above
const enhanceLROStatusEntry = curry(
  (options, lro) => validator(_enhLROStatusEntryOptsModel)(options).map(
    processedOptions => lro.snd().run_state === ERS.STATE_RUNNING ?
      _enhanceRunningEntry(processedOptions, lro) :
      _enhanceNonRunningEntry(lro)
  )
)

module.exports = enhanceLROStatusEntry
