'use strict';

const fs = require('fs');
const process = require('process');

const sqlLib = require('async-mssql-client');

async function processFileAsync(fileName, results) {
    let sql = fs.readFileSync(fileName, 'utf8');
	
    let connection;
    try {
        connection = await sqlLib.getOpenConnectionAsync(wrapSqlConfig({}));
        let request = new sqlLib.Request(sql);
        let rows = await request.getExecSqlResultsAsync(connection);
        rows.forEach(row => {
            row.meta_check_file = fileName;
            results.push(row);
        });
    } finally {
        if (connection) {
            await connection.closeAsync();
        }
    }

}


function wrapSqlConfig(config) {

    let env = process.env;
    if (env.BBCHECK_SQL_SERVER) {
        config.server = env.BBCHECK_SQL_SERVER;
    }
    if (env.BBCHECK_SQL_USERNAME) {
        config.username = env.BBCHECK_SQL_USERNAME;
    }
    if (env.BBCHECK_SQL_PASSWORD) {
        config.password = env.BBCHECK_SQL_PASSWORD;
    }

    return {


        getRequired: function (key) {
            let value = config[key];

            return value;
        }
    };
}

module.exports.processFileAsync = processFileAsync;