#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const fu = require('core-fu');

const packageData = require('./package.json');
const argumentProcessor = require('./lib/argumentProcessor');
const sqlCheck = require('./sqlCheck');

const switches = processCommandLineArguments();

function processCommandLineArguments() {
    let { switches, errors, warnings } = argumentProcessor.process(process.argv, require('./lib/command-line-arguments-definition'));
    argumentProcessor.showErrorsAndWarnings({ errors, warnings });

    if (!switches) {
        process.exit(1);
    }

    argumentProcessor.showSwitches({ switches });

    return switches;
}
//console.info(`BBCheck - v${packageData.version}`);

function resultLevel() {
    return switches['--output'].values[0];
}

async function processDirectory(targetDirectory) {
    let files = fs.readdirSync(targetDirectory);
    let targetFiles = files.filter(fileName => fileName.indexOf('.bbcheck.') !== -1);

    if (targetFiles.length > 0) {

        let results = [];

        await fu.forEachAsync(targetFiles, async fileName => {
            let fullPath = path.join('./', fileName);

            if (fullPath.indexOf('.sql') !== -1) {
                await sqlCheck.processFileAsync(fullPath, results);
            } else {
                console.error(`Currently, only sql files are supported.`);
            }

        });

        let outputResults = prepareOutput(results, resultLevel());
        console.log(JSON.stringify(outputResults, null, 3));


    } else {
        console.info(`No .bbcheck. files found.`);
    }
}

function prepareSummaryOutput(results) {
    let output = [];

    let summaryMap = {};

    results.forEach(result => {
        let summaryKey = result.context + ':::' + result.issue;
        let summary = summaryMap[summaryKey];

        if (summary) {
            summary.count++;
        } else {
            summary = {
                "context": result.context,
                "issue": result.issue,
                "count": 1
            };
            summaryMap[summaryKey] = summary;
            output.push(summary);
        }

    });


    return output;
}

function prepareOutput(results, level) {
    if (level === 'summary') {
        return prepareSummaryOutput(results);
    }


    let output = [];

    results.forEach(result => {
        let outputResult = {};
        output.push(outputResult);

        if (level === 'full') {
            outputResult.rank = result.rank;
        }
        outputResult.subject = result.subject;
        outputResult.context = result.context;
        outputResult.issue = result.issue;
        outputResult.effect = result.effect;
        outputResult.basis = result.basis;
        outputResult.proposal = result.proposal;

        if (level === 'full') {
            Object.keys(result).forEach(key => {
                if (key.startsWith('evidence-') || key.startsWith('evidence_')) {
                    outputResult[key] = result[key];
                }

            });
            outputResult.ticket = result.ticket;
            outputResult.meta_table_name = result.meta_table_name;
            outputResult.meta_column_name = result.meta_column_name;
            outputResult.meta_check_file = result.meta_check_file;
        }

    });
    return output;
}


processDirectory('./');