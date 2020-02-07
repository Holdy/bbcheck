# bbcheck
Runner for various types of health-check.

To run .sql tests, create the environment variables:
```
BBCHECK_SQL_SERVER = 111.222.333.444
BBCHECK_SQL_USER = poncho
BBCHECK_SQL_PASSWORD = correcthorsebatterystaple
```
From a directory containing sql test files, you can run 'bbcheck'.
Only files that end with .bbcheck.sql will be ran - so no unintended sql statements are executed!

for a summary run:
```bbcheck --output summary```

for full details run:
```bbcheck --output full```
