const defSealedObjModel = require('@eluvio/elv-js-helpers/defSealedObjModel')
const NonNegativeNumModel = require('@eluvio/elv-js-helpers/NonNegativeNumModel')

/**
 * An [ObjectModel](http://objectmodel.js.org/) to validate the `progress` attribute of an LRO Status entry
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
 * const LROProgressModel = require('@eluvio/elv-lro-status/LROProgressModel')
 *
 * LROProgressModel({})                         //=> EXCEPTION: 'expecting percentage to be Number, got undefined'
 *
 * LROProgressModel({percentage: -2})           //=> EXCEPTION: 'percentage must be >= 0 (got: -2)'
 *
 * LROProgressModel({percentage: 10})           //=> {percentage: 10} // proxied by ObjectModel
 *
 * LROProgressModel({percentage: 10, files: 7}) //=> EXCEPTION: 'Unrecognized property name(s): files'
 *
 * LROProgressModel('foo')                      //=> EXCEPTION: `expecting Object, got String "foo"`
 *
 */
const LROProgressModel = defSealedObjModel(
  'LROProgress',
  {
    percentage: NonNegativeNumModel
  }
)

module.exports = LROProgressModel
