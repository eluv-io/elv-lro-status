const defObjModel = require('@eluvio/elv-js-helpers/defObjModel')
const NonNegativeIntModel = require('@eluvio/elv-js-helpers/NonNegativeIntModel')
const UTCStrModel = require('@eluvio/elv-js-helpers/UTCStrModel')

const {LRO_RUN_STATES} = require('./lroRunState')
const LROProgressModel = require('./LROProgressModel')

/**
 * An [ObjectModel](http://objectmodel.js.org/) to validate the an LRO Status entry
 *
 * Throws an exception if passed in an invalid value.
 *
 * @class
 * @category Model
 * @sig * -> Object | THROW
 * @param {*} - The input to validate
 * @returns {Object} The validated input, proxied by ObjectModel
 * @example
 *
 * const LROStatusEntryModel = require('@eluvio/elv-lro-status/LROStatusEntryModel')
 *
 * LROStatusEntryModel({})          //=> EXCEPTION: 'expecting duration to be Number, got undefined...'
 *
 * LROStatusEntryModel({
 *   duration: 0,
 *   duration_ms: 0,
 *   progress: {
 *     percentage: 0
 *   },
 *   run_state: 'running',
 *   start: '2022-04-08T21:05:00Z'
 *  })                              //=> (copy of input object) // proxied by ObjectModel
 *
 * LROStatusEntryModel({
 *   duration: -1,
 *   duration_ms: 0,
 *   progress: {
 *     percentage: 0
 *   },
 *   run_state: 'running',
 *   start: '2022-04-08T21:05:00Z'
 * })                               //=> EXCEPTION: 'duration must be >= 0 (got: -1)'
 *
 * LROStatusEntryModel('foo')       //=> EXCEPTION: `expecting Object, got String "foo"`
 *
 */
// TODO: add assertions to check for `run_state` 'running' but no `start`, etc.
const LROStatusEntryModel = defObjModel(
  'LROStatusEntry',
  {
    duration: NonNegativeIntModel,
    duration_ms: NonNegativeIntModel,
    end: [UTCStrModel],
    progress: LROProgressModel,
    run_state: LRO_RUN_STATES,
    start: [UTCStrModel]
  })

module.exports = LROStatusEntryModel
