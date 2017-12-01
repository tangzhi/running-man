RunningMan.utils = {
  /*
  // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
  // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
  */
  dateFormat: function format(dt, fmt) {
    var k;
    var result = fmt;
    var o = {
      'M+': dt.getMonth() + 1, // 月份
      'd+': dt.getDate(), // 日
      'h+': dt.getHours(), // 小时
      'm+': dt.getMinutes(), // 分
      's+': dt.getSeconds(), // 秒
      'q+': Math.floor((dt.getMonth() + 3) / 3), // 季度
      'S': dt.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) {
      result = result.replace(RegExp.$1, (dt.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        result = result.replace(RegExp.$1, (
            RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return result;
  },

  nextTime: function calc(curDateTime, step, type) {
    var day = new Date(curDateTime);
    switch (type) {
      case 0: // 日
        day.setDate(day.getDate() + step);
        break;
      case 1: // 周
        day.setDate(day.getDate() + (step * 7));
        break;
      case 2: // 月
        day.setMonth(day.getMonth() + step);
        break;
      default:
    }
    console.log(day);
    return this.dateFormat(day, 'yyyy-MM-dd hh:mm');
  }
};
