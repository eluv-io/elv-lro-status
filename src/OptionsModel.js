const defSealedObjModel = require('@eluvio/elv-js-helpers/defSealedObjModel')
const DatetimeModel = require('@eluvio/elv-js-helpers/DatetimeModel')
const PositiveNumModel = require('@eluvio/elv-js-helpers/PositiveNumModel')

/**
 * An [ObjectModel](http://objectmodel.js.org/) which validates that an input is:
 *
 * * A [Javascript Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
 * * Satisfies the field definitions for `options` argument used by `enhanceLROStatus` and `enhanceLROStatusEntry`.
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
const OptionsModel = defSealedObjModel(
  'options',
  {
    currentTime: DatetimeModel,
    locale: String,
    stallThreshold: PositiveNumModel,
    timezone: String
  }
)

module.exports = OptionsModel
