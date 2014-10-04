/**
 * Created by Phangji on 9/28/14.
 */

var model = require('./model');

exports.evaluateCJPage = function (page, ph) {
    page.evaluate(function () {
            //evaluate를 하면 nodejs와 별개인 phantomjs
            var productInfoArr = [];
            var util = {
                toDateTime: function (str) {
                    return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8) + ' '
                        + str.substring(8, 10) + ':' + str.substring(10, 12) + ':00';
                },

                toCleanName: function (str) {

                    var first = str.search(/\[/);
                    var second = str.search(/\]/);
                    if (first == -1 || second == -1) {
                        return str;
                    }
                    return str.replace(str.slice(first, second + 1), '');
                }

            };

            function getData() {
                var productInfoArr = [];
                var frameArr = $('.mainpr');

                // 추출하는 정보 : productName, productStartTime, productEndTime, productPrice, productPgURL, productImgURL
                // 만드는 정보 : id, providerId

                var idx;
                for (idx = 0; idx < frameArr.length; idx++) {
                    var productInfo = {};
                    var frameEle = $(frameArr[idx]);  //main frame


                    var startTime = frameEle.find('.livetime').attr('st-time');

                    productInfo.providerId = 'CJ';
                    productInfo.id = productInfo.providerId + startTime;

                    if (startTime == undefined) {
                        continue;
                    }

                    productInfo.productStartTime = util.toDateTime(frameEle.find('.livetime').attr('st-time'));
                    productInfo.productEndTime = util.toDateTime(frameEle.find('.livetime').attr('end-time'));

                    var ele = frameEle.find('.mainitem').first();


                    productInfo.productName = util.toCleanName(ele.find('.prname div p').text());

                    var priceStr = ele.find('.price strong').text();
                    productInfo.productPrice = parseInt(priceStr.replace(/,/g, ''));

                    productInfo.productPgURL = 'http://mw.cjmall.com' + ele.find('a').attr('href');
                    productInfo.productImgURL = ele.find('.imgbx img').attr('src');
                    productInfo.productImgURL = 'http://' + productInfo.productImgURL.substring(2);

                    productInfoArr.push(productInfo);
                }

                return productInfoArr;
            }

            productInfoArr = getData();

            return  productInfoArr;
        },
        function (result) {
            ph.exit();
//            console.log(result);
            for (var idx in result) {
                var p = result[idx];
//                console.log(p);

                var data = [p.id, p.productName, p.productPrice, p.productStartTime,
                    p.productEndTime, p.providerId, p.productPgURL, p.productImgURL];
                console.log(data);

                storeProductInfo(data);
            }
        });
};

function storeProductInfo(data) {
    model.insertProductInfo(data, function (err) {
        if (err) console.error('err', err);
    });
}

exports.evaluateGSPage = function (page, ph) {
    page.evaluate(function () {
            var util = {
                toDateTime: function (str) {
                    return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8) + ' '
                        + str.substring(8, 10) + ':' + str.substring(10, 12) + ':00';
                },
                toCleanName: function (str) {
                    var removedTagStr;  var after;
                    var first = str.search(/\[/);
                    var second = str.search(/\]/);
                    if (first == -1 || second == -1) {
                        removedTagStr = str;
                    }
                    removedTagStr = str.replace(str.slice(first, second + 1), '');
                    after = removedTagStr.replace(/\t/g,'').replace(/\n/g,'');
                    return after;
                },
                toTomorrow : function (yy_mm_dd, HH_mm) {      //년월일, 시간분 --> 다음 날, 넣어준 시간으로.

//                                var yy_mm_dd = '20140131';	//년월일
//                                var HH_mm = '2010';	//시간분
                    var today = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));	//년, 월-1, 일
                    var tmr = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));

                    tmr.setDate(today.getDate()+1);
                    tmr.setHours(parseInt(HH_mm.substr(0,2)), parseInt(HH_mm.substr(2,2)));

                    var timeStr = ''+tmr.getFullYear()
                        +( tmr.getMonth()+1<10 ? '0'+(tmr.getMonth()+1) : (tmr.getMonth()+1) )
                        +( tmr.getDate()<10 ? '0'+tmr.getDate() : tmr.getDate() )
                        +( tmr.getHours()<10 ? '0'+tmr.getHours() : tmr.getHours() )
                        +( tmr.getMinutes()<10 ? '0'+tmr.getMinutes() : tmr.getMinutes() );
                    return timeStr;
                }
            };

            var productInfoArr = [];

            function getData() {
                var productInfoArr = [];
                var frameArr = $('.pro_li');
                var dateStr = $('.tvshopping_date_on .on').text();

                // 크롤링하는 시점의 년도 + 크롤링해온 월 일
                var cDateStr = new Date().getFullYear() + dateStr.substr(0, 2) + dateStr.substr(3, 2);  //20140929

                // 추출하는 정보 : productName, productStartTime, productEndTime, productPrice, productPgURL, productImgURL
                // 만드는 정보 : id, providerId

                var idx;
                for (idx = 0; idx < frameArr.length; idx++) {
                    var productInfo = {};
                    var frameEle = $(frameArr[idx]);  //main frame

                    var startTime = frameEle.find('.t_tv_time strong').text();  //01:00
                    startTime = cDateStr + startTime.substr(0, 2) + startTime.substr(3, 4); //201409290100

                    productInfo.providerId = 'GS';
                    productInfo.id = productInfo.providerId + startTime ;

                    productInfo.productStartTime = util.toDateTime(startTime);

                    var endTime = $(frameArr[idx + 1]).find('.t_tv_time strong').text();  //01:00

                    if(idx == frameArr.length-1){   //마지막 날짜면
                        endTime = util.toTomorrow(cDateStr, '0100');
                    }else{
                        endTime = cDateStr + endTime.substr(0, 2) + endTime.substr(3, 2);
                    }

                    productInfo.productEndTime = util.toDateTime(endTime);

                    var ele = frameEle.find('.listwrap');

                    productInfo.productName = util.toCleanName(ele.find('.pro_tit').first().text());

                    var priceStr = ele.find('.pro_price .low_num').text();
                    productInfo.productPrice = parseInt(priceStr.replace(/,/g, ''));

                    productInfo.productPgURL = 'http://m.gsshop.com' + ele.find('a').first().attr('href');

                    productInfo.productImgURL = ele.find('.thumb img').attr('src');

                    if(productInfo.productImgURL == undefined){
                        continue;
                    }

                    productInfoArr.push(productInfo);
                }

                return productInfoArr;
            }

            productInfoArr = getData();

            return  productInfoArr;
        },
        function (result) {
            ph.exit();
            console.log(result);
            for (var idx in result) {
                var p = result[idx];
//                console.log(p);

                var data = [p.id, p.productName, p.productPrice, p.productStartTime,
                    p.productEndTime, p.providerId, p.productPgURL, p.productImgURL];
                console.log(data);

                storeProductInfo(data);
            }
        });
};

//TODO(must): 현대 홈쇼핑 -- 페이지 새롭게 로딩 후 문제점 때문에 일단 보류.. 아 노답이다.. 콜백이고 뭐고 안됌.. ==> 되게함^^..
//TODO(done) : 끝나는 시간 날짜 예외처리 완료
//evaluate 안에서 타이머도 안먹고..비동기로 막 실행되는 것 같은데 콜백도 딱히 효과없고..
exports.evaluateHMPage = function (page, ph) {
    page.evaluate(function () {

            eval('javascript:showTable()'); //편성표로 이동
            eval(
                'setTimeout(function () { window.scrollTo(0, 2000); }, 2000)'
                //로딩 후 스크롤을 이동해 실데이터들을 불러온다. 이 웹페이지가 모바일 페이지에서 스크롤을 내려야 데이터가 불러와지는 구조이다.
            );
        },
        function () {
            console.log('first evaluate');

            //위 함수에서 eval이 실행만 시켜둔 상태에서(페이지는 로딩 중) 리턴되므로, 타이머를 이용해 DOM 추출을 2차 evaluate에서 해야 함.
            setTimeout(function () {
                console.log('going second evaluate');
                secondJob();
            }, 5000);   //render 함수로 확인해본 결과 2초면 될 듯

            function secondJob() { //홈쇼핑 편성표를 불러오는 것까지 성공.

                page.evaluate(function () {

                    var util = {
                        toDateTime: function (str) {
                            return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8) + ' '
                                + str.substring(8, 10) + ':' + str.substring(10, 12) + ':00';
                        },
                        toCleanName: function (str) {
                            var removedTagStr;  var after;
                            var first = str.search(/\[/);
                            var second = str.search(/\]/);
                            if (first == -1 || second == -1) {
                                removedTagStr = str;
                            }
                            removedTagStr = str.replace(str.slice(first, second + 1), '');
                            after = removedTagStr.replace(/\t/g,'').replace(/\n/g,'');
                            return after;
                        },
                        toTomorrow : function (yy_mm_dd, HH_mm) {      //년월일, 시간분 --> 다음 날, 넣어준 시간으로.

//                                var yy_mm_dd = '20140131';	//년월일
//                                var HH_mm = '2010';	//시간분
                            var today = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));	//년, 월-1, 일
                            var tmr = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));

                            tmr.setDate(today.getDate()+1);
                            tmr.setHours(parseInt(HH_mm.substr(0,2)), parseInt(HH_mm.substr(2,2)));

                            var timeStr = ''+tmr.getFullYear()
                                +( tmr.getMonth()+1<10 ? '0'+(tmr.getMonth()+1) : (tmr.getMonth()+1) )
                                +( tmr.getDate()<10 ? '0'+tmr.getDate() : tmr.getDate() )
                                +( tmr.getHours()<10 ? '0'+tmr.getHours() : tmr.getHours() )
                                +( tmr.getMinutes()<10 ? '0'+tmr.getMinutes() : tmr.getMinutes() );
                            return timeStr;
                        }
                    };



                    function getData() {
                        var productInfoArr = [];

                        var eleArr = $('#onair_list .goods_list .large_img a');
                        var dateStr = $('.btn_date #today').first().text();
                        var timeArr = $('#onair_list .live_time p');
                        // 추출하는 정보 : productName, productStartTime, productEndTime, productPrice, productPgURL, productImgURL
                        // 만드는 정보 : id, providerId
                        var isTomorrow = false;
                        var idx;
                        //순서대로인데!..
                        for (idx = 0; idx < eleArr.length; idx++) {

                            var ele = $(eleArr[idx]);
                            var productInfo = {};

                            var timeStr = timeArr[idx].innerHTML; //19:35 ~ 21:45 주방가전/주방용품
                            var strArr = timeStr.split(' ');
                            var startTime = strArr[0].replace(':','');   //1935
                            var endTime = strArr[2].replace(':','');     //2145

                            // 크롤링하는 시점의 년도 + 크롤링해온 월 일
                            var cDateStr = new Date().getFullYear() + dateStr.substr(0, 2) + dateStr.substr(3, 2);  //20140929

                            //마지막 날짜 예외 처리 - 다음 날로 넘어가는 | 다음 날
                            var startDateTime;
                            var endDateTime;

                            if(isTomorrow){
                                endDateTime = util.toTomorrow(cDateStr, endTime);
                                startDateTime = util.toTomorrow(cDateStr, startTime);
                            }else{
                                endDateTime = cDateStr + endTime;
                                startDateTime = cDateStr + startTime;

                            }

                            if(  Number(endTime.substr(0,2)) < Number(startTime.substr(0,2))  ){   //끝나는 시간이 시작하는 시간보다 작으면
                                isTomorrow = true;
                                endDateTime = util.toTomorrow(cDateStr, endTime);
                            }

                            productInfo.productStartTime = util.toDateTime(startDateTime);
                            productInfo.productEndTime = util.toDateTime(endDateTime);

                            //TODO(must): 'undefined' is not a function (evaluating 'ele.find('.goods_dsc')')

                            productInfo.productName = util.toCleanName(ele.find('.goods_dsc h4').text());

                            var priceStr = ele.find('.price2').text().replace('원','');
                            productInfo.productPrice = parseInt(priceStr.replace(/,/g, ''));

                            productInfo.productPgURL = 'http://m.hyundaihmall.com' + ele.attr('href');

                            productInfo.productImgURL = ele.find('.goods_img img').attr('src');
                            productInfo.providerId = 'HM';
                            productInfo.id = productInfo.providerId + startDateTime;

                            productInfoArr.push(productInfo);
                        }

                        return productInfoArr;
                    }

                    var productInfoArr = [];
                    productInfoArr = getData();
                    productInfoArr.pop();
                    productInfoArr.pop();   //문제생기는거 아니야??
                    //웹사이트에서 처음 로딩할 때 데이터 2개를 보여주므로 그게 누적되어있다. 그 2개 제거

                    return productInfoArr;

                }, function (result) {

                    console.log('second evaluate - result', result);

                    for (var idx in result) {
                        var p = result[idx];

                        var data = [p.id, p.productName, p.productPrice, p.productStartTime,
                            p.productEndTime, p.providerId, p.productPgURL, p.productImgURL];
                      storeProductInfo(data);
                    }

////                     setTimeout(function () {
//                     var dateStr = new Date().toString();
//                     page.render('../crawling_screenshots/hd ' + dateStr + '.jpeg');
//                     console.log('saving successed');
//                     ph.exit();
////                     }, 2000);    //1초는 로딩 중.


                });
            }
        });
};

exports.evaluateHSPage = function (page, ph) {
    page.evaluate(function () {
            var util = {
                toDateTime: function (str) {
                    return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8) + ' '
                        + str.substring(8, 10) + ':' + str.substring(10, 12) + ':00';
                },
                toCleanName: function (str) {
                    var removedTagStr;  var after;
                    var first = str.search(/\[/);
                    var second = str.search(/\]/);
                    if (first == -1 || second == -1) {
                        removedTagStr = str;
                    }
                    removedTagStr = str.replace(str.slice(first, second + 1), '');
                    after = removedTagStr.replace(/\t/g,'').replace(/\n/g,'');
                    return after;
                },
                toTomorrow : function (yy_mm_dd, HH_mm) {      //년월일, 시간분 --> 다음 날, 넣어준 시간으로.

//                                var yy_mm_dd = '20140131';	//년월일
//                                var HH_mm = '2010';	//시간분
                    var today = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));	//년, 월-1, 일
                    var tmr = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));

                    tmr.setDate(today.getDate()+1);
                    tmr.setHours(parseInt(HH_mm.substr(0,2)), parseInt(HH_mm.substr(2,2)));

                    var timeStr = ''+tmr.getFullYear()
                        +( tmr.getMonth()+1<10 ? '0'+(tmr.getMonth()+1) : (tmr.getMonth()+1) )
                        +( tmr.getDate()<10 ? '0'+tmr.getDate() : tmr.getDate() )
                        +( tmr.getHours()<10 ? '0'+tmr.getHours() : tmr.getHours() )
                        +( tmr.getMinutes()<10 ? '0'+tmr.getMinutes() : tmr.getMinutes() );
                    return timeStr;
                }
            };

            var productInfoArr = [];

            function getData() {
                var productInfoArr = [];
                var frameArr = $('.tvlist_wrap');
                var dateStr = $('#currentDate').text().replace('일', ''); //09월 29일

                // 크롤링하는 시점의 년도 + 크롤링해온 월 일
                var cDateStr = new Date().getFullYear() + dateStr.substr(0, 2) + dateStr.substr(4, 2);  //20140929

                // 추출하는 정보 : productName, productStartTime, productEndTime, productPrice, productPgURL, productImgURL
                // 만드는 정보 : id, providerId

                var idx;
                for (idx = 0; idx < frameArr.length; idx++) {
                    var productInfo = {};
                    var frameEle = $(frameArr[idx]);  //main frame

                    var timeStr = frameEle.find('h3').text();  //01:00 ~ 02:00
                    var strArr = timeStr.split(' ');
                    var startTime = strArr[0];   //19:35
                    var endTime = strArr[2];     //21:45

                    startTime = cDateStr + startTime.substr(0, 2) + startTime.substr(3, 2); //201409290100

                    //TODO : 시간 비교 알고리즘
//                    var endTime = '01:00';  //언제나 다음날 한 시에 끝남.
//                    if(parseInt(endTime) < parseInt(startTime)){
//                        endTime = cDateStr.slice(0, 6) + (parseInt(dateStr.substr(3, 5))+1) + '0100'; //201409300100
//                    }

                    if(idx == frameArr.length-1){   //마지막 날짜면
                        endTime = util.toTomorrow(cDateStr, endTime.substr(0, 2) + endTime.substr(3, 2));
                    }else{
                        endTime = cDateStr + endTime.substr(0, 2) + endTime.substr(3, 2);
                    }




                    productInfo.providerId = 'HS';
                    productInfo.id = productInfo.providerId + startTime;

                    productInfo.productStartTime = util.toDateTime(startTime);
                    productInfo.productEndTime = util.toDateTime(endTime);

                    var ele = frameEle.find('.product');

                    productInfo.productName = util.toCleanName(ele.find('.text').text());

                    var priceStr = ele.find('.price strong').first().text().replace('원', '');
                    productInfo.productPrice = parseInt(priceStr.replace(/,/g, ''));

                    productInfo.productPgURL = 'http://m.hnsmall.com' + ele.find('.text').attr('onclick').replace('goPage','').substring(2).replace('\')','').replace(/\\/g,'/');

                    productInfo.productImgURL = ele.find('.img img').attr('src');



                    productInfoArr.push(productInfo);
                }

                return productInfoArr;
            }

            productInfoArr = getData();

            return  productInfoArr;
        },
        function (result) {
            ph.exit();
            console.log(result);
            for (var idx in result) {
                var p = result[idx];
//                console.log(p);

                var data = [p.id, p.productName, p.productPrice, p.productStartTime,
                    p.productEndTime, p.providerId, p.productPgURL, p.productImgURL];
                console.log(data);

                storeProductInfo(data);
            }
        });
};

//TODO(done) : 현재 방송 중인 상품 데이터 누락(남은 시간으로 표시) --> 크롤링 스케줄링으로 해결하기
exports.evaluateLHPage = function (page, ph) {
    page.evaluate(function () {
            var url = $('nav .menu_liveTv .btn_lt03').first().attr('href');
            return  url;
        },
        function (result) {
            console.log('first evaluate');
            console.log('url', result);
            //위 함수에서 eval이 실행만 시켜둔 상태에서(페이지는 로딩 중) 리턴되므로, 타이머를 이용해 DOM 추출을 2차 evaluate에서 해야 함.
            setTimeout(function () {
                console.log('going second evaluate');
                secondJob(result);
            }, 3000);   //render 함수로 확인해본 결과 2초면 될 듯

            function secondJob(url) { //홈쇼핑 편성표를 불러오는 것까지 성공.
                page.open(url, function (status) {
                    page.evaluate(function () {

                        var util = {
                            toDateTime: function (str) {
                                return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8) + ' '
                                    + str.substring(8, 10) + ':' + str.substring(10, 12) + ':00';
                            },
                            toCleanName: function (str) {
                                var removedTagStr;
                                var after;
                                var first = str.search(/\[/);
                                var second = str.search(/\]/);
                                if (first == -1 || second == -1) {
                                    removedTagStr = str;
                                }
                                removedTagStr = str.replace(str.slice(first, second + 1), '');
                                after = removedTagStr.replace(/\t/g, '').replace(/\n/g, '');
                                return after;
                            },
                            toTomorrow : function (yy_mm_dd, HH_mm) {      //년월일, 시간분 --> 다음 날, 넣어준 시간으로.

//                                var yy_mm_dd = '20140131';	//년월일
//                                var HH_mm = '2010';	//시간분
                                var today = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));	//년, 월-1, 일
                                var tmr = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));

                                tmr.setDate(today.getDate()+1);
                                tmr.setHours(parseInt(HH_mm.substr(0,2)), parseInt(HH_mm.substr(2,2)));

                                var timeStr = ''+tmr.getFullYear()
                                    +( tmr.getMonth()+1<10 ? '0'+(tmr.getMonth()+1) : (tmr.getMonth()+1) )
                                    +( tmr.getDate()<10 ? '0'+tmr.getDate() : tmr.getDate() )
                                    +( tmr.getHours()<10 ? '0'+tmr.getHours() : tmr.getHours() )
                                    +( tmr.getMinutes()<10 ? '0'+tmr.getMinutes() : tmr.getMinutes() );
                               return timeStr;
                            }
                        };


                        function getData() {
                            var productInfoArr = [];
                            var frameArr = $('.onAirPrdLst');
                            var dateStr = $('#selDate').text(); //10월 02일 (목)

                            // 크롤링하는 시점의 년도 + 크롤링해온 월 일
                            var cDateStr = new Date().getFullYear() + dateStr.substring(0, 2) + dateStr.substring(4, 6);  //20140929

                            // 추출하는 정보 : productName, productStartTime, productEndTime, productPrice, productPgURL, productImgURL
                            // 만드는 정보 : id, providerId

                            var idx;
                            for (idx = 0; idx < frameArr.length; idx++) {
                                var productInfo = {};
                                var frameEle = $(frameArr[idx]);  //main frame

                                var timeArr = frameEle.find('.tvlive_header time').text().replace(/\s|:/g,'').split('~');  //0050, 0200
                                var startTime = cDateStr + timeArr[0]; //201410020820

                                productInfo.providerId = 'LH';
                                productInfo.id = productInfo.providerId + startTime ;

                                productInfo.productStartTime = util.toDateTime(startTime);

                                var endTime = cDateStr + timeArr[1] ; //201409300100

                                if(idx == frameArr.length-1){   //마지막 날짜면
                                    endTime = util.toTomorrow(cDateStr, timeArr[1]);
                                }

                                productInfo.productEndTime = util.toDateTime(endTime);

                                var ele = frameEle.find('.mainlist');

                                productInfo.productName = util.toCleanName(ele.find('.title').text());

                                var priceStr = ele.find('.price').text().replace(/,|원/g,'');   //71,910원 --> 71910
                                productInfo.productPrice = parseInt(priceStr);

                                var pdURLStr = ele.find('.goods_info a').attr('href');
                                var pdNumStr = pdURLStr.replace("javascript:fn_goodsCheckAdult({goods_no:",'').replace(/\s/g,'').split(',')[0];
                                productInfo.productPgURL = 'http://m.lotteimall.com/goods/viewGoodsDetail.lotte?goods_no=' + pdNumStr;

                                productInfo.productImgURL = ele.find('img').attr('src');

                                productInfoArr.push(productInfo);
                            }

                            return productInfoArr;
                        }

                        var productInfoArr = [];
                        productInfoArr = getData();

                        return productInfoArr;

                    }, function (result) {

                        console.log('second evaluate - result', result);

                        for (var idx in result) {
                            var p = result[idx];

                            var data = [p.id, p.productName, p.productPrice, p.productStartTime,
                                p.productEndTime, p.providerId, p.productPgURL, p.productImgURL];
                            storeProductInfo(data);
                        }
                    });

                });
            }
        });
};

//TODO(must) : 시간에 따라 편성표가 어떻게 변하는 지 확인해봐야 함.
exports.evaluateNSPage = function (page, ph) {
    page.evaluate(function () {
            var util = {
                toDateTime: function (str) {
                    return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8) + ' '
                        + str.substring(8, 10) + ':' + str.substring(10, 12) + ':00';
                },
                toCleanName: function (str) {
                    var removedTagStr;  var after;
                    var first = str.search(/\[/);
                    var second = str.search(/\]/);
                    if (first == -1 || second == -1) {
                        removedTagStr = str;
                    }
                    removedTagStr = str.replace(str.slice(first, second + 1), '');
                    after = removedTagStr.replace(/\t/g,'').replace(/\n/g,'');
                    return after;
                },
                toTomorrow : function (yy_mm_dd, HH_mm) {      //년월일, 시간분 --> 다음 날, 넣어준 시간으로.

//                                var yy_mm_dd = '20140131';	//년월일
//                                var HH_mm = '2010';	//시간분
                    var today = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));	//년, 월-1, 일
                    var tmr = new Date(parseInt(yy_mm_dd.substr(0, 4)), parseInt(yy_mm_dd.substr(4, 2))-1, parseInt(yy_mm_dd.substr(6, 2)));

                    tmr.setDate(today.getDate()+1);
                    tmr.setHours(parseInt(HH_mm.substr(0,2)), parseInt(HH_mm.substr(2,2)));

                    var timeStr = ''+tmr.getFullYear()
                        +( tmr.getMonth()+1<10 ? '0'+(tmr.getMonth()+1) : (tmr.getMonth()+1) )
                        +( tmr.getDate()<10 ? '0'+tmr.getDate() : tmr.getDate() )
                        +( tmr.getHours()<10 ? '0'+tmr.getHours() : tmr.getHours() )
                        +( tmr.getMinutes()<10 ? '0'+tmr.getMinutes() : tmr.getMinutes() );
                    return timeStr;
                }
            };

            var productInfoArr = [];

            function getData() {
                var productInfoArr = [];
                var frameArr = $('.tvTabView div').first().find('.nsDetalitype');   //원래 페이지의 오타
                var dateStr = $('.calendar .active').find('.month').text() + $('.calendar .active').find('.day').text();
                var timeStrArr = $('.times a'); //07:25 ~ 08:20 들의 배열

                // 크롤링하는 시점의 년도 + 크롤링해온 월 일
                var cDateStr = new Date().getFullYear() + dateStr.substr(0, 2) + dateStr.substr(3, 2);  //20140929

                // 추출하는 정보 : productName, productStartTime, productEndTime, productPrice, productPgURL, productImgURL
                // 만드는 정보 : id, providerId

                var isTomorrow = false;
                var idx;
                for (idx = 0; idx < frameArr.length; idx++) {
                    var productInfo = {};
                    var frameEle = $(frameArr[idx]);  //main frame
                    var timeEle = $(timeStrArr[idx]);

                    var timeStr = timeEle.text(); //19:35 ~ 21:45
                    var strArr = timeStr.split(' ');
                    var startTime = strArr[0].replace(':','');   //1935
                    var endTime = strArr[2].replace(':','');     //2145

                    //마지막 날짜 예외 처리 - 다음 날로 넘어가는 | 다음 날
                    var startDateTime;
                    var endDateTime;



                    if(isTomorrow){
                        endDateTime = util.toTomorrow(cDateStr, endTime);
                        startDateTime = util.toTomorrow(cDateStr, startTime);
                    }else{
                        endDateTime = cDateStr + endTime;
                        startDateTime = cDateStr + startTime;

                    }

                    if(  Number(endTime.substr(0,2)) < Number(startTime.substr(0,2))  ){   //끝나는 시간이 시작하는 시간보다 작으면
                        isTomorrow = true;
                        endDateTime = util.toTomorrow(cDateStr, endTime);
                    }

                    productInfo.productStartTime = util.toDateTime(startDateTime);
                    productInfo.productEndTime = util.toDateTime(endDateTime);

                    productInfo.providerId = 'NS';
                    productInfo.id = productInfo.providerId + startDateTime;


                    var ele = frameEle.find('.first_h_conts');

                    productInfo.productName = util.toCleanName(ele.find('.contents .con').text());

                    var priceStr = ele.find('.price strong').text();
                    productInfo.productPrice = Number(priceStr.replace(/,/g, '').replace('원', ''));

                    productInfo.productPgURL = '';  //NS는 비워두고 해당 시간에 퍼온다. 웹 페이지 주소를 미리 알 수가 없다.

                    productInfo.productImgURL = ele.find('.img img').attr('src');

                    productInfoArr.push(productInfo);
                }

                return productInfoArr;
            }

            productInfoArr = getData();

            return  productInfoArr;
        },
        function (result) {

            console.log(result);
            for (var idx in result) {
                var p = result[idx];

                var data = [p.id, p.productName, p.productPrice, p.productStartTime,
                    p.productEndTime, p.providerId, p.productPgURL, p.productImgURL];
                console.log(data);

                storeProductInfo(data);
            }
        });
};