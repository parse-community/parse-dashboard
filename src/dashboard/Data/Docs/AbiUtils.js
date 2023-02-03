
/**
 * @param {Object} abiElement - A single element from the ABI array
 * @returns {string} - The function signature in the format of "functionName(argName1, argName2, ...)" and uses type if name is not available
 */
export function getSimpleFunctionSignature(abiElement) {
    const inputText = abiElement.inputs?.map((input) => (input.name || input.type)).join(', ');
    return `${abiElement.name}(${inputText})`
}

/**
 * @param {Object} abiElement - A single element from the ABI array
 * @param {boolean} showTupleDetails - If true, args of type tuple will have their details listed 
 * @returns {string} - The function signature in the format of "functionName(type1 argName1, type2 argName2, ...)"
 */
export function getFullFunctionSignature(abiElement, showTupleDetails = false) {
    const mappingFn = (item) => { 
        let result = `${item.type}`;
        if (item.name) {
            result += ` ${item.name}`;
        }
        if (showTupleDetails && item.type.startsWith('tuple')) {
            const tupleDetails = item.components.map(mappingFn);
            result += ` [${tupleDetails.join(', ')}]`;
        }
        return result;
    };

    const inputText = abiElement.inputs?.map(mappingFn).join(', ');
    return `${abiElement.name}(${inputText})`;
}

export default {
    getSimpleFunctionSignature,
    getFullFunctionSignature
}
