/**
 * Created by Phangji on 9/28/14.
 */

var phantom = require('phantom');
//var model = require('./modules/model');
var util = require('./modules/util');
var evaluater = require('./modules/evaluater');

var chSchedule = {
    CJ: "http://mw.cjmall.com/m/tv/tvSchedule.jsp",
    GS: "http://m.gsshop.com/tv/tvScheduleMain.gs",
    HM: "http://m.hyundaihmall.com/front/index.do",   //userAgent 필요
    HS: "http://m.hnsmall.com/display/tvtable.do",
    LH: "http://m.lotteimall.com/main/viewMain.lotte",
    // http://m.lotteimall.com/main/viewMain.lotte?mlog=90010_5#33 -- ajax
    NS: "http://www.nsmall.com/jsp/etv/shopping_schedule.jsp"  // 모바일 페이지가 없음
};

var FROM_NOW = {
    TODAY: 0,
    TOMORROW: 1,
    TDAT: 2
};

//TODO : 원하는 channel의 코드를 넣으면, 크롤링을 해온다.
var createPhantom = function (channel, fromNow) {
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            if (channel == 'HM')
                util.setUserAgent(page);
//            page.set('scrollPosition', {top:800,left:0});
            page.open(chSchedule[channel], function (status) {
                console.log("crawler - opening page", chSchedule[channel], status);
                if (channel == 'CJ') {
                    switch (fromNow) {
                        case FROM_NOW.TODAY :
                            evaluater.evaluateCJPage(page, ph);
                            break;
                        case FROM_NOW.TOMORROW :
//                            evaluater.evaluateCJPageAhead(page, ph);
                            break;
                        case FROM_NOW.TDAT :
//                            evaluater.evaluateCJPageAhead2(page, ph);
                            break;
                    }
                } else if (channel == 'GS') {
                    switch (fromNow) {
                        case FROM_NOW.TODAY :
                            evaluater.evaluateGSPage(page, ph);
                            break;
                        case FROM_NOW.TOMORROW :
                            evaluater.evaluateGSPageAhead(page, ph);
                            break;
                        case FROM_NOW.TDAT :
                            evaluater.evaluateGSPageAhead2(page, ph);
                            break;
                    }
                } else if (channel == 'HM') {
                    switch (fromNow) {
                        case FROM_NOW.TODAY :
                            evaluater.evaluateHMPage(page, ph);
                            break;
                        case FROM_NOW.TOMORROW :
                            evaluater.evaluateHMPageAhead(page, ph);
                            break;
                        case FROM_NOW.TDAT :
                            evaluater.evaluateHMPageAhead2(page, ph);

                            break;
                    }

                } else if (channel == 'HS') {
                    switch (fromNow) {
                        case FROM_NOW.TODAY :
                            evaluater.evaluateHSPage(page, ph);
                            break;
                        case FROM_NOW.TOMORROW :
                            evaluater.evaluateHSPageAhead(page, ph);
                            break;
                        case FROM_NOW.TDAT :
                            evaluater.evaluateHSPageAhead2(page, ph);
                            break;
                    }

                } else if (channel == 'LH') {
                    switch (fromNow) {
                        case FROM_NOW.TODAY :
                            evaluater.evaluateLHPage(page, ph);
                            break;
                        case FROM_NOW.TOMORROW :
                            evaluater.evaluateLHPageAhead(page, ph);
                            break;
                        case FROM_NOW.TDAT :
                            evaluater.evaluateLHPageAhead2(page, ph);
                            break;
                    }

                } else if (channel == 'NS') {
                    switch (fromNow) {
                        case FROM_NOW.TODAY :
                            evaluater.evaluateNSPage(page, ph);
                            break;
                        case FROM_NOW.TOMORROW :
//                            evaluater.evaluateNSPageAhead(page, ph);
                            break;
                        case FROM_NOW.TDAT :
//                            evaluater.evaluateNSPageAhead2(page, ph);
                            break;
                    }
                } else {
                    console.log('not supported channel..');
                    ph.exit();  //phantomJS만 종료.
                }
            });
        });
    });
};


//var args = process.argv.slice(2);
//createPhantom(args);    //node crawlingBot 'CJ'



var excuteBot = function () {

//    createPhantom('CJ', FROM_NOW.TOMORROW);
//    createPhantom('GS', FROM_NOW.TODAY);
//    createPhantom('HM', FROM_NOW.TDAT);
//    createPhantom('HS', FROM_NOW.TDAT);
//    createPhantom('LH', FROM_NOW.TDAT);
//    createPhantom('NS', FROM_NOW.TDAT);


    var fromNow = FROM_NOW.TDAT;
    for (var key in chSchedule) {
        (function(key){
            console.log('********** key **********', key, '**********', Object.keys(FROM_NOW)[fromNow], '**********');
            setTimeout(function () {
                createPhantom(key, fromNow);
            }, 5000);
        })(key);
    }

};

excuteBot();