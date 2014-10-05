/**
 * Created by Phangji on 9/28/14.
 */

exports.setUserAgent = function (page) {
    page.set('settings.userAgent', 'Mozilla/5.0 (Linux; Android 4.4; Nexus 5 Build/_BuildID_) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36');
};

/*
exports.toDateTime = function (str) {
    return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8) + ' '
        + str.substring(8, 10) + ':' + str.substring(10, 12) + ':00';
};

exports.toCleanName = function (str) {

    var first = str.search(/\[/);
    var second = str.search(/\]/);
    if (first == -1 || second == -1) {
        return str;
    }
    return str.replace(str.slice(first, second + 1), '');
};
*/


exports.getDateStrAfter = function (days) {
    var today = new Date();	//년, 월-1, 일
    var tmr = new Date();
    tmr.setDate(today.getDate() + days);

    var timeStr = ''+tmr.getFullYear()
        +( tmr.getMonth()+1<10 ? '0'+(tmr.getMonth()+1) : (tmr.getMonth()+1) )
        +( tmr.getDate()<10 ? '0'+tmr.getDate() : tmr.getDate() );
    return timeStr;
};