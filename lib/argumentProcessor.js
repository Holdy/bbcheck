'use strict';

function process(args, argumentDefinitionMap) {
    let result = { switches: {} };

    parse(result, args, argumentDefinitionMap);
    validate(result, argumentDefinitionMap);

    return result;
}

function parse(result, args, argumentDefinitionMap) {
    let currentArgument;

    // First two args (node and module-name) are always present.
    args.slice(2).forEach(token => {

        // Regardless of weather we have a current argument or not, if this is an argument name - we start a new argument.
        let argumentDefinition = getArgument(token, argumentDefinitionMap);
        if (argumentDefinition) {
            if (result.switches[token]) {
                currentArgument = result.switches[token];
                addWarning(result, { message: `The switch '${token}' is present multiple times which may be confusing.` });
            } else {
                currentArgument = { definition: argumentDefinition, values: [] };
                result.switches[token] = currentArgument;
            }
        } else if (currentArgument) {
            // Add it as a value of the current argument.
            currentArgument.values.push(token);
        } else {
            // Presumably its a word before the first argument.
            addError(result, { message: `Did not recognize keyword ${token} as an argument`, listKeywords: true });
        }
    });
}

function validate(result, argumentDefinitionMap) {
    Object.keys(argumentDefinitionMap).forEach(key => {
        let definition = argumentDefinitionMap[key];
        let argument = result.switches[key];

        if (argument) {
            // Check argument number is valid
            if (!definition.maximumValueCount) {
                definition.maximumValueCount = 0;
            }
            if (argument.values.length > definition.maximumValueCount) {
                addError(result, { message: `'${key}' has a maximum value count of ${definition.maximumValueCount} but ${argument.values.length} arguments were supplied.` });
            } else if (argument.values.length < definition.minimumValueCount) {
                addError(result, { message: `Minimum value count for '${key}' is ${definition.minimumValueCount} but got ${argument.values.length}` });
            }

        } else {
            if (definition.default) {
                argument = { definition: definition, values: definition.default, defaulted: true };
                result.switches[key] = argument;
            } else if (!definition.optional) {
                addError(result, { message: `The switch '${key}' must be provided.` });
            }
        }
    });

    if (result.errors) {
        result.switches = null;
    }
}

function showSwitches(result) {
    console.log('Arguments:');
    Object.keys(result.switches).forEach(switchName => {
        let argument = result.switches[switchName];
        let extra = '';
        if (argument.defaulted) {
            extra += '(defaulted, not supplied)';
        }
        let displayValue = '';
        if (argument.values.length > 0) {
            displayValue = ': ' + JSON.stringify(argument.values);
        }
        console.log(`   ${switchName}${displayValue} ${extra}`);
    });
}

function showErrorsAndWarnings(result) {
    let flags = {};
    if (result.warnings) {
        console.log('Warnings');
        showList(result.warnings, flags);
    }
    if (result.errors) {
        console.log('Errors');
        showList(result.errors, flags);
    }
    if (flags.listKeywords) {
        //console.log('Would list keywords if the functionality was implemented.');
    }
}

function showList(list, flags) {
    list.forEach(item => {
        console.log('   ' + item.message);
        if (item.listKeywords) {
            flags.listKeywords = true;
        }
    });
}

function addError(result, message) {
    if (!result.errors) {
        result.errors = [];
    }
    result.errors.push(message);
}

function addWarning(result, message) {
    if (!result.warnings) {
        result.warnings = [];
    }
    result.warnings.push(message);
}

function getArgument(token, argumentDefinitionMap) {
    let result = argumentDefinitionMap[token];

    return result;
}

module.exports.process = process;
module.exports.showErrorsAndWarnings = showErrorsAndWarnings;
module.exports.showSwitches = showSwitches;