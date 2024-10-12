// Needed for smart complete export
import { createRulesetFunction } from "@stoplight/spectral-core";

/**
 * Checks if the request and body schema reference of an operation match.
 * We can have request === response or request+functionOptions.requestSuffix === response.
 * To be used in a rule targeting post and put operations with a `resolved: false`.
 * NOTE: the function name to use in the rule is this file name minus extension.
 * Read more about Spectral custom functions at https://github.com/stoplightio/spectral/blob/develop/docs/guides/5-custom-functions.md
 * 
 * @param {Object} input A value found by given
 * @param {Object} options The `functionOptions` content
 * @param {Object} context The execution context (full document and more)
 * @returns Two problems if references doesn't match (one on the request, the other on response)
 */
function compareReferences(input, options, context) {

  // The list of problems detected by the custom function
  // A problem is an object with a message and optional path
  // If no path is provided, Spectral show the path of input (context.path)
  // path can be completed with [...context.path, some, path]
  const problems = [];

  // Retrieving the request body reference
  const requestBodyReference = input.requestBody
                                    .content["application/json"]
                                    .schema["$ref"];

  if(!requestBodyReference){
    problems.push({
      message: `Request body doesn't use a $ref`,
      path: [...context.path, "requestBody", 
        "content", "application/json", "schema"]
    });
  }

  // Retrieving the success response body reference
  const successResponseStatus = Object.keys(input.responses)
                               .find(k => k.match(/^2/));
  const responseBodyReference = input.responses[successResponseStatus]
                                     .content["application/json"]
                                     .schema["$ref"];
  
  if(!responseBodyReference){
    problems.push({
      message: `Response body doesn't use a $ref`,
      path: [...context.path, "responses", successResponseStatus, 
        "content", "application/json", "schema"]
    });
  }

  // We'll now compare request and response references
  if(requestBodyReference && responseBodyReference){

    // Optional suffix defined in functionOptions
    let requestSuffix = "";
    if(options && options.requestSuffix) {
      requestSuffix = options.requestSuffix;
    }

    // Do we have an exact match or match with suffix
    const consistentReferences =  
                        // Same read-write schema in request and response
                        requestBodyReference === responseBodyReference ||
                        // Request has a dedicated schema
                        requestBodyReference === `${responseBodyReference}${requestSuffix}`
    
    // NOTE: if request has a dedicated schema we're not 100% sure 
    // it's an actual subset of the response, a more complex function could do 
    // such a comparison (comparing actual schemas of request and response)

    if(!consistentReferences){
      // We return 2 problems if request and response reference don't match

      const matchType = requestSuffix.length === 0? "exact match": `request suffix: ${requestSuffix}`;

      // 1 - At the request body level
      problems.push({
        message: `Request schema must match response schema (${matchType})`,
        path: [...context.path, "requestBody", 
              "content", "application/json", "schema", "$ref"]
      });
      // 2 - At the response body level
      problems.push({
        message: `Response schema must match request schema (${matchType})`,
        path: [...context.path, "responses", successResponseStatus, 
              "content", "application/json", "schema", "$ref"]
      });
    }
  }

  return problems;
}

// Simple export
// export default compareReferences;

// More complete export (recommended)
export default createRulesetFunction(
    {
      // JSON Schema of the input parameter (an element found by rule's "given")
      // Elements that don't match this schema are ignored (can help simplify checks in code)
      input: {
        type: "object",
        required: ["requestBody", "responses"],
        properties: {
          requestBody: {
            type: "object",
          },
          responses: {
            type: "object"
          }
        },
      },
      // JSON Schema of the "functionOptions"
      // Enable better feedback when incorrect functionOptions is provided in the rule's "then"
      options: {
        type: ["object", "null"],
        oneOf: [
          // Possible to have no options
          { type: "null" }, 
          // If functionsOptions is provided, it must define requestSuffix
          {
            type: "object",
            properties: {
              requestSuffix: {
                description: "An optional suffix from the request schema reference", 
                type: "string" 
              }
            },
            required: ["requestSuffix"],
            additionalProperties: false
          }
        ]
      }
    },
    // The actual custom function to execute
    compareReferences,
  );

