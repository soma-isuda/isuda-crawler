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

//TODO : 원하는 channel의 코드를 넣으면, 크롤링을 해온다.
var createPhantom = function (channel){
    phantom.create(function (ph) {
        ph.createPage(function (page) {

            if(channel == 'HM')
                util.setUserAgent(page);
//            page.set('scrollPosition', {top:800,left:0});
            page.open(chSchedule[channel], function (status) {
                console.log("crawler - opening page", chSchedule[channel], status);
                if(channel == 'CJ') {
                    evaluater.evaluateCJPage(page, ph);
                }else if(channel == 'GS'){
                    evaluater.evaluateGSPage(page, ph);
                }else if(channel == 'HM'){
                    evaluater.evaluateHMPage(page, ph);
                }else if(channel == 'HS'){
                    evaluater.evaluateHSPage(page, ph);
                }else if(channel == 'LH'){
                    evaluater.evaluateLHPage(page, ph);
                }else if(channel == 'NS'){
                    evaluater.evaluateNSPage(page, ph);
                }else{
                    console.log('not supported channel..');
                    ph.exit();

                }
            });
        });
    });
};
var args = process.argv.slice(2);
createPhantom(args);    //node crawlingBot 'CJ'

/*
for(var key in chSchedule){
    setTimeout((function(key){
        return function(){
            if(key == 'CJ'){
                createPhantom(key);
            }
        }
    })(key), 1000);
}
*/