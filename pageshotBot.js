/**
 * Created by Phangji on 9/28/14.
 */

var phantom = require('phantom');
//var model = require('./modules/model');
var $ = require('jquery');
var util = require('./modules/util');

//var url = 'http://mw.cjmall.com/m/prd/detail_cate.jsp?app_cd=PDA&item_cd=30414957&pic=TALI02';
//var url = 'http://www.nsmall.com/jsp/etv/shopping_schedule.jsp?sel_date=20140930';

var createPhantom = function (pd){
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.set('viewportSize', {width:720,height:1080});
            console.log('start opeining page');

            //전처리
            if(pd.providerId == 'HM')
                util.setUserAgent(page);
            else if(pd.providerId == 'HS')
                pd.productPgURL += '/detail';
            else if(pd.providerId == 'NS')
                pd.productPgURL.replace('itemview.jsp?', 'itemview_desc.jsp?popup=y&');

            page.open(pd.productPgURL, function (status) {
                console.log("pageshotBot - opening page", pd.productPgURL, status);

                if(pd.providerId == 'CJ') {
                    evaluateCjProductPg(page, ph, pd.id);
                }else if(pd.providerId == 'GS'){
                    evaluateGSProductPg(page, ph, pd.id);
                }
                else if(pd.providerId == 'HM'){
                    evaluateProductPg(page, ph, pd.id);
                }
                else if(pd.providerId == 'HS'){
                    evaluateProductPg(page, ph, pd.id);
                }
// else if(pd.providerId == 'LH'){
//                    evaluater.evaluateLHPage(page, ph);
//                }
                else if(pd.providerId == 'NS'){
                    evaluateProductPg(page, ph, pd.id);
                }else{
                    console.log('not supported channel..');
                    ph.exit();
                }
            });


        });
    });
};

createPhantom({ id : 'CJ_TEST2', productPgURL: 'http://mw.cjmall.com/m/prd/detail_cate.jsp?app_cd=PDA&item_cd=30185482&pic=TALI02',
    providerId: 'CJ' });

// http://www.nsmall.com/jsp/item/itemview.jsp?good_id=14431720
// http://www.nsmall.com/jsp/item/itemview_desc.jsp?popup=y&good_id=14431720



//현재 실행하는 곳

//model.selectProductURL_Id(function (err, result) {
//    if (err) console.error('err', err);
//    console.log(result);
//    var pdArr = result;
//
//    for(var idx in pdArr){
//        var pdEle = pdArr[idx];
//        setTimeout((function(pdEle){
//            return function(){
//                createPhantom(pdEle);
//            }
//        })(pdEle), 2000);
//    }
//});

// TODO : NS홈쇼핑의 경우에는, 현재 방송 중인 상품의 url로만 접근 가능.
//createPhantom(); ==> 스케줄링 하는 곳에서 호출

function evaluateCjProductPg(page, ph, id) {
    page.evaluate(function () {
            document.body.bgColor = '#fff';
            var data = $('.prodDetailTabMenu a[index="1"]').attr('href'); //javascript:moveHandler(2)
            eval(data);

            return data;
        },
        function (result) {
            console.log(result);

            setTimeout((function () {
                return function () {
//                    var dateStr = new Date().toString();

                    page.render('../static/pageShots/' + id + '.jpeg');
                    console.log(id + '.jpeg', 'page saved');
                    ph.exit();
                };
            })(), 1000);

        });
}

function evaluateGSProductPg(page, ph, id){
    page.evaluate(function () {
            document.body.bgColor = '#fff';

            var data = "$('.prdDescriptionTab').click()";
            eval(data);

            return data;
        },
        function (result) {
            console.log(result);

            setTimeout((function () {
                return function () {
                    page.render('../static/pageShots/' + id + '.jpeg');
                    console.log(id + '.jpeg', 'page saved');
                    ph.exit();

                };
            })(), 2000);

        });
}

/*
function evaluateHMProductPg(page, ph, id){
    page.evaluate(function () {
            document.body.bgColor = '#fff';
//
        },
        function () {
//            console.log('result', result);

            setTimeout((function () {
                return function () {
                    page.render('../static/pageShots/' + id + '.jpeg');
                    console.log('^_____^', id + '.jpeg', 'page saved');
                    ph.exit();
                };
            })(), 2000);

        });
}
*/

function evaluateProductPg(page, ph, id){
    page.evaluate(function () {
            document.body.bgColor = '#fff';
        },
        function () {
            setTimeout((function () {
                return function () {
                    page.render('../static/pageShots/' + id + '.jpeg');
                    console.log('^_____^', id + '.jpeg', 'page saved');
                    ph.exit();
                };
            })(), 2000);

        });
}
