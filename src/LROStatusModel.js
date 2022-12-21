const assertionErrMsg = require('@eluvio/elv-js-helpers/assertionErrMsg')
const defCheckedKVObjModel = require('@eluvio/elv-js-helpers/defCheckedKVObjModel')

const LROIdModel = require('./LROIdModel')
const LROStatusEntryModel = require('./LROStatusEntryModel')

/**
 * An [ObjectModel](http://objectmodel.js.org/) to validate the response from an LROStatus() API call
 *
 * Throws an exception if passed in an invalid value or an empty object.
 *
 * @class
 * @category Model
 * @sig * -> Object | THROW
 * @param {*} - The input to validate
 * @returns {Object} The validated input, proxied by ObjectModel
 * @example
 *
 * const LROStatusModel = require('@eluvio/elv-lro-status/LROStatusModel')
 *
 * LROStatusModel({})   //=> Exception: "Value must not be empty (got: {})"
 *
 * LROStatusModel({
 *    tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh: {
 *      duration: 0,
 *      duration_ms: 0,
 *      progress: {
 *        percentage: 0
 *      },
 *      run_state: 'running',
 *      start: '2022-04-08T21:05:00Z'
 *    }
 *  })                  //=> (copy of input object) // proxied by ObjectModel
 *
 * LROStatusModel({
 *    foo: {
 *      duration: 0,
 *      duration_ms: 0,
 *      progress: {
 *        percentage: 0
 *      },
 *      run_state: 'running',
 *      start: '2022-04-08T21:05:00Z'
 *    }
 *  })                  //=> EXCEPTION: 'invalid property name 'foo' (is not a valid LROId)'
 *
 * LROStatusModel({
 *    tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh: {}
 *  })                  //=> EXCEPTION: 'TypeError: key 'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh' points to a value that is an invalid LROStatusEntry (LROStatusEntry: expecting duration to be Number, got undefined...'
 *
 * LROStatusModel(3)    //=> EXCEPTION: 'expecting Object, got Number 3'
 */
const LROStatusModel = defCheckedKVObjModel(
  'LROStatus',
  LROIdModel,
  LROStatusEntryModel
).assert(
  x => Object.keys(x).length > 0,
  assertionErrMsg('must not be empty')
)

module.exports = LROStatusModel
