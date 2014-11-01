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
//            console.log('insertProductInfo insert result', result);
            callback(err, result);
        });
        db.pool.release(conn);
    });
};

exports.updateProductInfo = function(data, callback) {
    db.pool.acquire(function(err, conn) {
        if(err) console.error('err', err);
        var Query = 'UPDATE productInfo '
            +  'SET productName = ?, productPrice = ?, productStartTime = ?, productEndTime = ?, providerId = ?, productPgURL = ?, productImgURL = ?, secondId = -2 '
            + ' WHERE id = ?';
        conn.query(Query, data, function(err, result) {
//            console.log('updateProductInfo result', result);
            callback(err, result);
        });
        db.pool.release(conn);
    });
};

exports.selectPriceById = function(data, callback) {
    db.pool.acquire(function(err, conn) {
        if(err) console.error('err', err);
        var Query = 'select productPrice, productEndTime from productInfo WHERE providerId = ? AND id = ? ';
        conn.query(Query, data, function(err, result) {
// //            console.log('selectProductInfoPrice_Id result', result);
            callback(err, result);
        });
        db.pool.release(conn);
    });
};

//exports.selectPriceById_Price = function(data, callback) {
//    db.pool.acquire(function(err, conn) {
//        if(err) console.error('err', err);  //해당 가격, 아이디가 같다면, 가격 반환 // 다르다면 []
//        var Query = 'select productPrice from productInfo WHERE productEndTime > now() and providerId = ? AND id = ? and productPrice = ? ';
//        conn.query(Query, data, function(err, result) {
////            console.log(data[1], 'selectPriceById_Price result', result);
//            callback(err, result);
//        });
//        db.pool.release(conn);
//    });
//};

//TODO: data = [firstCate, secondCate, id]
exports.updateCategory = function(data, callback) {
    db.pool.acquire(function(err, conn) {
        if(err) console.error('err', err);
        conn.query('UPDATE productInfo SET firstId = (SELECT f.id FROM firstCategoryStandard f, secondCategoryStandard s WHERE f.NAME = ? and s.NAME = ? and s.firstStandardId = f.id), secondId = (SELECT s.id FROM firstCategoryStandard f, secondCategoryStandard s WHERE f.NAME = ? and s.NAME = ? and s.firstStandardId = f.id) WHERE id= ?',
            [data[0], data[1], data[0],data[1], data[2]], function(err, result) {
//            console.log('updateCategory update result', result);
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
//            console.log('selectProductName_Id result');
            callback(err, result);
        });
        db.pool.release(conn);
    });
};

//TODO: [{id, productPgURL, providerId}, , ] object Array
exports.selectProductURL_Id = function(whereClause, callback) {
    db.pool.acquire(function(err, conn) {
        if(err) console.error('err', err);
        conn.query('select id, productPgURL, providerId from productInfo ' + whereClause, function(err, result) {
//            console.log('selectProductURL_Id result');
            callback(err, result);
        });
        db.pool.release(conn);
    });
};