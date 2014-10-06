var generic_pool = require('generic-pool'),
    mysql        = require('mysql');

var db = {};

db.pool = generic_pool.Pool({
    name: 'mysql',
    create: function(callback) {
        var config = {
            host: '127.0.0.1',
            port: '3306',
            user: 'root',
            password: 'wldus1004',
            database: 'isuda'
        };
        var client = mysql.createConnection(config);
        client.connect(function(err) {
//            if(err) console.error('err', err);
            callback(err, client);
        });
    },
    destroy: function(client) {
        client.end();
    },
    max: 10,
    min: 2,
    idleTimeoutMillis : 30000,
    log : false
});

db.process = process.on('exit', function (){
    db.pool.drain(function() {
        db.pool.destroyAllNow();
    });
});


module.exports = db;