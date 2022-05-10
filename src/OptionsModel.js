const defObjModel = require('@eluvio/elv-js-helpers/defObjModel')
const DatetimeModel = require('@eluvio/elv-js-helpers/DatetimeModel')
const PositiveNumModel = require('@eluvio/elv-js-helpers/PositiveNumModel')
const defaultOptions = require('./defaultOptions')

/**
 * An [ObjectModel](http://objectmodel.js.org/) which validates that an input is:
 *
 * * A [Javascript Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
 * * Satisfies the field definitions for `options` argument used by `enhanceLROStatus` and `enhanceLROStatusEntry`.
 *
 * It also populates defaults for `locale`, `stallThreshold`, and `timezone` if missing.
 *
 * @function
 * @category Model
 * @sig * -> Object -> Object | THROW
 * @param {Object} - The options to validate
 * @returns {Object} The validated options object
 * @example
 *
 * const OptionsModel = require('@eluvio/elv-lro-status/OptionsModel')
 *
 * OptionsModel({
 *   currentTime: new Date,
 *   locale: 'en-US',
 *   stallThreshold: 900,
 *   timezone: 'America/Los_Angeles'
 * })                                  //=> Object (proxied by ObjectModel)
 *
 * OptionsModel({
 *   locale: 'en-US',
 *   stallThreshold: 900,
 *   timezone: 'America/Los_Angeles'
 * })                                  //=> EXCEPTION: 'expecting currentTime to be Date, got undefined'
 *
 *
 */
// TODO: switch to sealed model (may need to add 'defaults' argument to defSealedObjModel)
const OptionsModel = defObjModel(
  'options',
  {
    currentTime: DatetimeModel,
    locale: String,
    stallThreshold: PositiveNumModel,
    timezone: String
  }
).defaultTo(defaultOptions())

module.exports = OptionsModel
