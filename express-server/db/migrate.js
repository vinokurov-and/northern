const { openDb } =  require("./Connect");

openDb().then(value => {
    value.migrate({
        table: 'migrations',
        migrationsPath: './db/migrations/'
    })
})
