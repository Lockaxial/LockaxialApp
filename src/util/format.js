/**
*格式转换工具类
*/
export default class Format{
  /**
  *将日期转换成字符串，第二个参数是格式
  */
  static fromDateToStr(date, fmt) {
      var o = {
          "M+": date.getMonth() + 1,                 //月份
          "d+": date.getDate(),                    //日
          "h+": date.getHours(),                   //小时
          "m+": date.getMinutes(),                 //分
          "s+": date.getSeconds(),                 //秒
          "q+": Math.floor((date.getMonth() + 3) / 3), //季度
          "S": date.getMilliseconds()             //毫秒
      };
      if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt))
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
  };

  /**
  *将字符串转换成日期格式
  */
  static fromStrToDate(str) {  //如:fromStrToDate("2014-12-12 18:00:00")
      var splitChar=str.substring(10,11);
      var tempStrs = str.split(splitChar);
      var dateStrs = tempStrs[0].split("-");
      var year = parseInt(dateStrs[0], 10);
      var month = parseInt(dateStrs[1], 10) - 1;
      var day = parseInt(dateStrs[2], 10);   //

      if (tempStrs.length > 1) {
          var timeStrs = tempStrs[1].split(":");
          var hour = parseInt(timeStrs [0], 10);
          var minute = parseInt(timeStrs[1], 10);
          var second = parseInt(timeStrs[2], 10);
          var date = new Date(year, month, day, hour, minute, second);
          return date;
      } else {
          var date = new Date(year, month, day);
          return date;
      }
  }

  /**
  *
  */
  static isMobileNo(phone){
    if(!(/^1[34578]\d{9}$/.test(phone))){
      return false; 
    }else{
      return true;
    }
  }
}
