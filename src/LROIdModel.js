const defRegexMatchedStrModel = require('@eluvio/elv-js-helpers/defRegexMatchedStrModel')

const _LRO_ID_REGEX = /(^tlro[1-9A-HJ-NP-Za-km-z]+$)|(^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$)/

/**
 * An [ObjectModel](http://objectmodel.js.org/) which validates that an input
 * is:
 *
 *  * A [Javascript String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
 *  * Matches the regex for an LRO ID
 *
 * If input passes validation, will return the input (proxied by ObjectModel)
 *
 * Throws an exception if passed in an invalid value.
 *
 * @class
 * @category Model
 * @sig * -> String | THROW
 * @param {*} - The input to validate
 * @returns {String} The validated input, proxied by ObjectModel
 * @example
 *
 * const LROIdModel = require('@eluvio/elv-lro-status/LROIdModel')
 *
 * LROIdModel('tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh')  //=> 'tlro1EjdMMAvWb5iJn2isHdgESes1dq12kpjXCExCepbpWfwMpo2haCxnh' (proxied by ObjectModel)
 *
 * LROIdModel(42)                                                            //=> EXCEPTION: 'expecting String, got Number 42'
 *
 * LROIdModel('foo')                                                         //=> EXCEPTION: 'Value is not a valid LRO ID string 'tlro...'  (got: foo)'
 *
 */
const LROIdModel = defRegexMatchedStrModel(
  'LROId',
  _LRO_ID_REGEX,
  'is not a valid LRO ID string \'tlro...\' ')

module.exports = LROIdModel
