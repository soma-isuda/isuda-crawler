/**
 * Created by Phangji on 9/28/14.
 */

var $ = require('jquery');
var phantom = require('phantom');
var model = require('./modules/model');

var excuteBot = function (whereClause) {
    model.selectProductName_Id(function (err, result) {
        if (err) console.error('err', err);
        var pdArr = result;

        for(var idx in pdArr){
            var pdEle = pdArr[idx];
            setTimeout((function(pdEle){
                return function(){
                    createPhantom(pdEle);
                }
            })(pdEle), 0);
        }
    }, whereClause);
};


var createPhantom = function (pdEle) {
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            openNaverShoppingPage(page, ph, pdEle);
        });
    });
};
var args = process.argv.slice(2);
var whereClause = ' where providerId = "' + args + '"  and (secondId is null or secondId = -2)';
//whereClause = '';
excuteBot(whereClause);

function openNaverShoppingPage(page, ph, pdNameId){
    var url = 'http://shopping.naver.com/search/all_search.nhn?query='
        + encodeURI(pdNameId.productName);

    page.open(url, function (status) {
//        console.log("categoryBot - opening page", url, status);
        console.log('product' , pdNameId);

        if(status == 'success'){
            page.evaluate(function(){
                var data = [];
                if($('._product_list') == null){
                    data.push('');
                    data.push('');
                    return data;
                }
                var cateArr = $('._product_list').first().find('.info .depth a');


                if(cateArr[0] != undefined) {
                    data.push(cateArr[0].text); //대분류
                    data.push(cateArr[1].text); //중분류
                }else{
                    data.push('');
                    data.push('empty');
                }

                return data;
            }, function (data) {
                data.push(pdNameId.id);
                console.log('success data', data);

                //TODO: 상품 정보 테이블에서 상품 카테고리 업데이트
                model.updateCategory(data, function (err, result) {
                    if (err) console.error('err', err);
                    ph.exit();
                });
            });
        }else{
            console.log('fail....try again TT');

            // 실패하면.
            /*
            this.setTimeout(function () {
                openNaverShoppingPage(page, ph, url);
            }, 2000);
            */
            ph.exit();

        }
    });
}


