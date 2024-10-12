// Needed for smart complete export
import { createRulesetFunction } from "@stoplight/spectral-core";

/**
 * Checks if a data model use correct vocarbulary.
 * Read more about Spectral custom functions at https://github.com/stoplightio/spectral/blob/develop/docs/guides/5-custom-functions.md
 * 
 * @param {Object} input A value found by given
 * @param {Object} options The `functionOptions` content
 * @param {Object} context The execution context (full document and more)
 * @returns Problems
 */
function vocabularyCheck(input, options, context) {

  const problems = [];

  // Magic goes here

  return problems;
}

// Simple export
export default vocabularyCheck;

// More complete export (recommended)
//export default createRulesetFunction( ...) # Check 17.6.6
