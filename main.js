/**
 * Created by Phangji on 9/22/14.
 */

var phantom = require('phantom');
var storeModel = require('./modules/model');
var $ = require('jquery');

//
//var toDateTime = (function(str){
//    return str.substring(0, 3) + '-' + str.substring(4, 5) + '-' + str.substring(6, 7) + ' '
//        + str.substring(8, 9) + ':' + str.substring(10, 11) + ':00';
//});

var chSchedule = {
    CJ: "http://mw.cjmall.com/m/tv/tvSchedule.jsp",
    GS: "http://m.gsshop.com/tv/tvScheduleMain.gs",
    HM: "http://www.hyundaihmall.com/front/bmc/brodFmtb.do",   //데스크탑에서 접속하면 데스크탑 페이지로.
    // http://m.hyundaihmall.com/front/index.do -- ajax
    HS: "http://m.hnsmall.com/display/tvtable.do",
    LH: "http://m.lotteimall.com/main/viewMain.lotte",
    // http://m.lotteimall.com/main/viewMain.lotte?mlog=90010_5#33 -- ajax
    NS: "http://www.nsmall.com/jsp/etv/shopping_schedule.jsp"  // 모바일 페이지가 없음
};

//job scheduler, agent, job stack
//db 할 때 return까지 session 끊어준다.


phantom.create(function (ph) {
    ph.createPage(function (page) {
        var naverShopping = 'http://shopping.naver.com';
//        console.log(page);

//        var flag = page.injectJs('./lib/jquery');
//        console.log(flag);

//        page.customHeaders = {
//            "X-Test": "foo",
//            "DNT": "1"
//        };



        page.open(naverShopping, function (status) {
            console.log("crawler - opening page", naverShopping, status);
//            console.log('page url' , page.url); 안됌

            page.evaluate( function (){

//                $('.prodDetailTabMenu').find('a[index="1"]').click();
//                $('.prodDetailTabMenu a[index="1"]').click();
//               $('.prodDetailTabMenu a[index="1"]').attr('href');
//                var frm = $('form[name="search"]');    //OK


                var input = $('input[name="query"]');
                input.value = '소다스프레스 스파클링정수기 (직수형 냉수/정수/탄산수 정수기)';

                var frm = $('form[name="search"]');    //OK
                var naverShopping = 'http://shopping.naver.com';
                $('form[name="search"]').submit();
                //window location doesn't move
                var loc = encodeURI(naverShopping + $('form[name="search"]').attr('action') + '?query=' + input.value);


                return loc;

            }, function (result){
                console.log(result);

                setTimeout(function () {
                    open2ndPg(page, ph, result);

                }, 400);


            });


/*
            page.evaluate(function(){

                $('form ._search_form').submit();
                return 'success 2nd';
            }, function (result) {
                console.log(result);
                var dateStr = new Date().toString();
                page.render('../crawling_screenshots/naver ' + dateStr + '.jpeg');
                page.release();
                ph.exit();

            });
            */

        });


    });



    /*
     ph.createPage(function (page) {
     page.open(chSchedule.CJ, function (status) {

     console.log("crawler - opening page", chSchedule.CJ, status);

     evaluateCjPage(page, ph);
     /*
     page.evaluate(function () {
     document.body.bgColor = '#fff';
     //                var clientElement = document.querySelectorAll('div#mobileGsRecommend');
     //
     //                var clipRect = clientElement.getBoundingClientRect();
     //                page.clipRect = {
     //                    top:    clipRect.top,
     //                    left:   clipRect.left,
     //                    width:  clipRect.width,
     //                    height: clipRect.height
     //                };

     return document.title;
     }, function (result) {
     page.render("../crawling_screenshots/cj_0924.jpeg");
     console.log('result \n' + result);
     ph.exit();
     });


     });
     });
     */






    /*
     var url = 'http://mw.cjmall.com/m/prd/detail_cate.jsp?app_cd=PDA&item_cd=29419121&pic=TALI02';
     ph.createPage(function (page) {
     page.open(url, function (status) {
     console.log("crawler - opening page", url, status);
     page.evaluate(function () {
     document.body.bgColor = '#fff';

     //                $('.prodDetailTabMenu').find('a[index="1"]').click();
     //                $('.prodDetailTabMenu a[index="1"]').click();
     //               $('.prodDetailTabMenu a[index="1"]').attr('href');

     var frm = $('form[name="moveHandlerForm"]');    //OK
     frm.action = "http://mw.cjmall.com/m/prd/detail_prd_spec.jsp?pic=PD02&app_cd=PDA";

     frm.submit();

     return $('form[name="moveHandlerForm"]').attr('method');
     }, function (result) {
     var dateStr = new Date().toString();
     //                page.render('../crawling_screenshots/cj '+ dateStr +'.jpeg');   //네트워크 혹은 비동기이벤트 방식때문에 렌더링이 안될때가 있음.
     console.log(result);
     ph.exit();
     });
     });
     })
     */


});

function open2ndPg(page, ph, url){

    page.open(url, function (status) {
        console.log("crawler - opening page", url, status);
        if(status == 'success') {
            page.evaluate(function () {
                //TODO : 카테고리 추출

                var cateArr = $('._product_list').first().find('.info .depth a');

                var firstCate = cateArr[0].text;
                var secondCate = cateArr[1].text;

                return firstCate + " " + secondCate;

            }, function (result) {
//                var dateStr = new Date().toString();
//                console.log(dateStr);
//                setTimeout(function () {
//                    page.render('../crawling_screenshots/naver ' + dateStr + '.jpeg');
//                    ph.exit();
//                }, 200);


                console.log(result);

                setTimeout(function () {


                    ph.exit();
                }, 200);



            });
        }else{

            setTimeout(function () {
                open2ndPg(page, ph, url);
            }, 400);
//

        }
    });

}
function crawlDefaultData(page, ph) {
    page.evaluate(function () {
            var productInfoArr = [];

            var util = {};

            util.toDateTime = function (str) {
                return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8) + ' '
                    + str.substring(8, 10) + ':' + str.substring(10, 12) + ':00';
            };


            function getData() {
                var productInfoArr = [];
                var frameArr = $('.mainpr');
//                var eleArr = document.querySelectorAll('.mainpr .mainitem');

                var i;
                for (i = 1; i < frameArr.length; i++) { //날짜 제외
                    var productInfo = { };
                    var frameEle = $(frameArr[i]);  //main frame

                    productInfo.providerId = 'CJ';
                    var startTime = frameEle.find('.livetime').attr('st-time');
                    productInfo.id = productInfo.providerId + startTime + 'N' + i;

                    if (startTime != undefined) {
                        productInfo.productStartTime = util.toDateTime(frameEle.find('.livetime').attr('st-time'));
                        productInfo.productEndTime = util.toDateTime(frameEle.find('.livetime').attr('end-time'));
                    }

                    var ele = frameEle.find('.mainitem').first();

                    productInfo.productName = ele.find('.prname div p').text();
//
                    var str = ele.find('.price strong').text();
                    var price = str.replace(/,/g, '');
                    productInfo.productPrice = parseInt(price);
//                    productInfo.productPrice = price;

                    productInfo.productPgURL = 'http://mw.cjmall.com' + ele.find('a').attr('href');
                    productInfo.productImgURL = ele.find('.imgbx img').attr('src');
                    if (productInfo.productImgURL != undefined)
                        productInfo.productImgURL = productInfo.productImgURL.substring(2);

                    productInfoArr.push(productInfo);

                }

                return productInfoArr;
            }

            productInfoArr = getData();
            return  productInfoArr;
        },
        function (result) {
//            console.log(result);
//            ph.exit();
            /*
             for (var idx in result) {
             //                console.log(result[idx]);
             var p = result[idx];
             var data = [p.id, p.productName, p.productPrice, p.productStartTime,
             p.productEndTime, p.providerId, p.productPgURL, p.productImgURL];
             console.log(data);


             model.insertProductInfo(data, function (err, results) {
             if (err) console.error('err', err);
             //                    console.log('finished');

             });

             }
             */

//            process.exit(1);

        });
}



