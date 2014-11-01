/**
 * Created by Phangji on 9/28/14.
 */

var phantom = require('phantom');
var model = require('./modules/model');
var util = require('./modules/util');

var time = 4000;


//var url = 'http://mw.cjmall.com/m/prd/detail_cate.jsp?app_cd=PDA&item_cd=30414957&pic=TALI02';
//var url = 'http://www.nsmall.com/jsp/etv/shopping_schedule.jsp?sel_date=20140930';

var createPhantom = function (pd) {
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.set('viewportSize', {width: 720, height: 1080});  //브라우저가 보는 크기. 창.
//            console.log('start opeining page');

            //전처리
            if (pd.providerId == 'HM' || pd.providerId == 'LH')
                util.setUserAgent(page);
            else if(pd.providerId == 'HS')
                pd.productPgURL += '/detail';
            else if (pd.providerId == 'NS')
                pd.productPgURL.replace('itemview.jsp?', 'itemview_desc.jsp?popup=y&');


            page.open(pd.productPgURL, function (status) {
                console.log("pageshotBot - opening page", pd.productPgURL, status);
                if (status == 'fail')
                    ph.exit();

                if (pd.providerId == 'CJ') {
                    evaluateCJProductPg(page, ph, pd.id);
                } else if (pd.providerId == 'GS') {
                    evaluateGSProductPg(page, ph, pd.id);
                }
                else if (pd.providerId == 'HM') {
                    evaluateHMProductPg(page, ph, pd.id);
                }
                else if (pd.providerId == 'HS') {
                    evaluateHSProductPg(page, ph, pd.id);
                }
                else if (pd.providerId == 'LH') {
                    evaluateLHProductPg(page, ph, pd.id);
                }
                else if (pd.providerId == 'NS') {
                    console.log('NS : not supported channel..');
                    ph.exit();
//                    evaluateNSProductPg(page, ph, pd.id);
                } else {
                    console.log('not supported channel..');
                    ph.exit();
                }
            });


        });
    });
};


function excuteBot() {
    //실행하는 곳
    var args = process.argv.slice(2);
    var whereClause = ' where productStartTime > now() and providerId = "' + args + '"';
    model.selectProductURL_Id(whereClause, function (err, result) {
        if (err) console.error('err', err);
        console.log(result);
        var pdArr = result;

        for (var idx in pdArr) {
            var pdEle = pdArr[idx];
            setTimeout((function (pdEle) {
                return function () {
                    createPhantom(pdEle);
                }
            })(pdEle), 2000);
        }
    });
}
excuteBot();

// {id, productPgURL, providerId}

//function excuteBot(product) {
//    createPhantom(product);
//}
//
//var product2 = {
//    id: "HS201410131740",
//    productPgURL: "http://m.hnsmall.com/goods/view/10972410",
//    providerId: "HS"
//};
//
//excuteBot(product2);

// TODO : NS홈쇼핑의 경우에는, 현재 방송 중인 상품의 url로만 접근 가능.
//createPhantom(); ==> 스케줄링 하는 곳에서 호출

function evaluateCJProductPg(page, ph, id) {
    page.evaluate(function () {
            var data = $('.prodDetailTabMenu a[index="1"]').attr('href'); //javascript:moveHandler(2)
            eval(data);
        },
        function () {
            setTimeout(function () {
                secondJob();
            }, 3000);
            function secondJob(){
                page.evaluate(function () {
                    document.body.bgColor = '#fff';
                    var cmd = "$('head').append(\"<link rel='stylesheet' href='http://172.16.100.171:3000/css/cj.css' type='text/css' >\")";
                    eval(cmd);
                }, function () {
                    setTimeout(savePageShot(page, ph, id), 2000);
                });
            }

        });
}

function evaluateGSProductPg(page, ph, id) {
    page.evaluate(function () {
            document.body.bgColor = '#fff';
            var data = "$('.prdDescriptionTab').click()";
            eval(data);

            var cmd = "$('head').append(\"<link rel='stylesheet' href='http://172.16.100.171:3000/css/gs.css' type='text/css' >\")";
            eval(cmd);

            return data;
        },
        function (result) {
            setTimeout(savePageShot(page, ph, id), time);
        });
}


function evaluateHMProductPg(page, ph, id) {
    page.evaluate(function () {
        document.body.bgColor = '#fff';
        var cmd = "$('head').append(\"<link rel='stylesheet' href='http://172.16.100.171:3000/css/hm.css' type='text/css' >\")";
        eval(cmd);
    }, function () {
        setTimeout(savePageShot(page, ph, id), time);
    });

}


function evaluateNSProductPg(page, ph, id) {
    page.evaluate(function () {
            document.body.bgColor = '#fff';
            //  css 처리 안해줌.
            return cmd;
        },
        function (result) {
            console.log(result);
            setTimeout(savePageShot(page, ph, id), time);
        });
}


function evaluateHSProductPg(page, ph, id) {
    page.evaluate(function () {
            document.body.bgColor = '#fff';
            var cmd = "$('head').append(\"<link rel='stylesheet' href='http://172.16.100.171:3000/css/hs.css' type='text/css' >\")";
            eval(cmd);
            return cmd;
        },
        function (result) {
            console.log(result);
            setTimeout(savePageShot(page, ph, id), time);
        });
}

function evaluateLHProductPg(page, ph, id) {
    page.evaluate(function () {
            document.body.bgColor = '#fff';
            eval('goDetail();');
        },
        function () {
            setTimeout(savePageShot(page, ph, id), time);
        });
}

function savePageShot(page, ph, id) {
    return function () {
        page.render('../static/pageShots/' + id + '.jpeg');
        console.log('^_____^', id + '.jpeg', 'page saved');
        ph.exit();
    };
}