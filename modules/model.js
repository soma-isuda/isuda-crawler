/**
 * Created by Phangji on 9/22/14.
 */

var async   = require('async'),
    db      = require('../config/database');

//exports.list = function(callback) {
//    db.pool.acquire(function(err, conn) {
//        if(err) console.error('err', err);
//        async.waterfall([
//                function(done) {
//                    conn.query('select * from number', function(err, result) {
//                        console.log('result\n', result);
//                        done(null);
//                    });
//                }
//            ],
//            function(err, results) {
//                if(err) console.error('error : ', err);
//                console.log('results : ', results);
//                callback(err, results);
//            });
//        db.pool.release(conn);
//    });
//};

exports.insertProductInfo = function(data, callback) {
    db.pool.acquire(function(err, conn) {
        if(err) console.error('err', err);
        conn.query('insert into productInfo(id, productName, productPrice, productStartTime, productEndTime, providerId, productPgURL, productImgURL) values(?, ?, ?, ?, ?, ?, ?, ?)', data, function(err, result) {
            console.log('insertProductInfo insert result', result);
            callback(err, result);
        });
        db.pool.release(conn);
    });
};

//TODO: data = [firstCate, secondCate, id]
exports.updateCategory = function(data, callback) {
    db.pool.acquire(function(err, conn) {
        if(err) console.error('err', err);
        conn.query('UPDATE productInfo SET firstId = (SELECT id FROM firstCategory WHERE NAME = ?), secondId = (SELECT id FROM secondCategory WHERE NAME = ?) WHERE id= ?', data, function(err, result) {
            console.log('updateCategory update result', result);
            callback(err, result);
        });
        db.pool.release(conn);
    });
};

//TODO: [{id, productName}, , ] object Array
exports.selectProductName_Id = function(callback, whereClause) {
    db.pool.acquire(function(err, conn) {
        if(err) console.error('err', err);
        conn.query('select id, productName from productInfo' + whereClause , function(err, result) {
            console.log('selectProductName_Id result');
            callback(err, result);
        });
        db.pool.release(conn);
    });
};

//TODO: [{id, productPgURL, providerId}, , ] object Array
exports.selectProductURL_Id = function(callback) {
    db.pool.acquire(function(err, conn) {
        if(err) console.error('err', err);
        conn.query('select id, productPgURL, providerId from productInfo where id = "LH201410030400"', function(err, result) {
            console.log('selectProductURL_Id result');
            callback(err, result);
        });
        db.pool.release(conn);
    });
};