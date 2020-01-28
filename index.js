#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const packageData = require('./package.json');
const fu = require('core-fu');

const sqlCheck = require('./sqlCheck');

//console.info(`BBCheck - v${packageData.version}`);

function resultLevel() {
    if (process.argv.length === 3) {
        return process.argv[2];
    } 
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


function prepareSimpleOutput(results) {

    return prepareOutput(results, 'simple');
}

function prepareFullOutput(results) {
    return prepareOutput(results, 'full');

}

function prepareOutput(results, level) {
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

        if (level === 'full') {
            Object.keys(result).forEach(key => {
                if (key.startsWith('evidence-')) {
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


function processSqlFile(filePath, results) {
    let sql = fs.readFileSync(filePath);




}


processDirectory('./');