RunningMan.controllers = {
  menuPage: function initMenuPage() {
  },

  homePage: function init() {
    RunningMan.stores.openDatabase(function initFirstPage() {
      RunningMan.stores.querySysParam('firstPage', function cb(o) {
        if (o.value && o.value !== 'home.html') {
          navi.pushPage('templates/' + o.value);
        }
      });
    });

    // 点击任务状态复选框，任务完成
    $('body').on('change', 'ons-checkbox.task_state input[type="checkbox"]', function change(event) {
      console.log(this.checked);
      if (this.checked) {
        RunningMan.services.inbox.finish(event);
      }
    });

    $(document).on('click', 'ons-toolbar-button ons-icon.addTask', function click(event) {
      navi.pushPage('templates/detail.html', {
        data: {
          source: parseInt($(event.target).attr('source'), 10)
        }
      });
    });
  },

  'homePage.show': function show() {
    $('ons-toolbar div.center').html('逐日');
    if (RunningMan.stores.db) {
      RunningMan.stores.setSysParam('firstPage', 'home.html');
    }
  },

  inboxPage: function init(page) {
    $('#addItem').on('click', function click() {
      RunningMan.stores.newTask(page.querySelector('#stuff').value, RunningMan.services.inbox.create);
      console.log($('#stuff'));
      $('#stuff').val('');
    });

    $('ons-toolbar ons-toolbar-button ons-icon').on('click', function cl() {
      //
    });

    $('#inbox-list').on('click', 'ons-list-item div.right ons-icon', function cl(event) {
      RunningMan.services.inbox.remove(event);
    });
  },

  'inboxPage.show': function show() {
    $('ons-toolbar span.back-button__label').html('首页');
    $('ons-toolbar div.center').html('收集箱');
    RunningMan.stores.setSysParam('firstPage', 'inbox.html');
    $('#inbox-list ons-list-item').remove();
    RunningMan.stores.queryInbox(RunningMan.services.inbox.create);
  },

  // data.category
  // data.parent_id
  itemsPage: function init() {

  },

  'scheduleContainerPage.show': function show() {
    $('ons-toolbar span.back-button__label').html('首页');
    $('ons-toolbar div.center').html('日程表');
    RunningMan.stores.setSysParam('firstPage', 'schedule.html');
  },

  scheduleContainerPage: function init() {
    // 计算日期
    switch (new Date().getDay()) {
      case 0: // 今天是星期日
        $('#tomorrowtab div.tabbar__label').html('周一');
        $('#tomorrow2tab div.tabbar__label').html('周二');
        $('#tomorrow3tab div.tabbar__label').html('周三');
        break;
      case 1:
        $('#tomorrowtab div.tabbar__label').html('周二');
        $('#tomorrow2tab div.tabbar__label').html('周三');
        $('#tomorrow3tab div.tabbar__label').html('周四');
        break;
      case 2:
        $('#tomorrowtab div.tabbar__label').html('周三');
        $('#tomorrow2tab div.tabbar__label').html('周四');
        $('#tomorrow3tab div.tabbar__label').html('周五');
        break;
      case 3:
        $('#tomorrowtab div.tabbar__label').html('周四');
        $('#tomorrow2tab div.tabbar__label').html('周五');
        $('#tomorrow3tab div.tabbar__label').html('周六');
        break;
      case 4:
        $('#tomorrowtab div.tabbar__label').html('周五');
        $('#tomorrow2tab div.tabbar__label').html('周六');
        $('#tomorrow3tab div.tabbar__label').html('周日');
        break;
      case 5:
        $('#tomorrowtab div.tabbar__label').html('周六');
        $('#tomorrow2tab div.tabbar__label').html('周日');
        $('#tomorrow3tab div.tabbar__label').html('周一');
        break;
      case 6:
        $('#tomorrowtab div.tabbar__label').html('周日');
        $('#tomorrow2tab div.tabbar__label').html('周一');
        $('#tomorrow3tab div.tabbar__label').html('周二');
        break;
      default:
        $('#tomorrowtab div.tabbar__label').html('周不');
        $('#tomorrow2tab div.tabbar__label').html('周可');
        $('#tomorrow3tab div.tabbar__label').html('周能');
        break;
    }

    // 计算数量
    RunningMan.stores.queryCount(function showCount(count) {
      console.log(count);
      $('#expiretab div.tabbar__badge.notification').html(count[0] ? count[0] : '');
      $('#todaytab div.tabbar__badge.notification').html((count[1] + count[2]) ? (count[1] + count[2]) : '');
      $('#tomorrowtab div.tabbar__badge.notification').html(count[3] ? count[3] : '');
      $('#tomorrow2tab div.tabbar__badge.notification').html(count[4] ? count[4] : '');
      $('#tomorrow3tab div.tabbar__badge.notification').html(count[5] ? count[5] : '');
      $('#futuretab div.tabbar__badge.notification').html((count[6] + count[7]) ? (count[6] + count[7]) : '');
    });
  },

  'futurePage.show': function init() {
    var hasComing = false;
    var hasFuture = false;
    $('#coming-list ons-list-item').remove();
    $('#futurePage ons-list-header:first').hide();
    RunningMan.stores.queryComing(function create(data) {
      if (!hasComing) {
        $('#futurePage ons-list-header:first').show();
        hasComing = true;
      }
      return RunningMan.services.schedule.createItem(data, 0, '#coming-list');
    });

    $('#future-list ons-list-item').remove();
    $('#futurePage ons-list-header:last').hide();
    RunningMan.stores.queryFuture(function create(data) {
      if (!hasFuture) {
        $('#futurePage ons-list-header:last').show();
        hasFuture = true;
      }
      return RunningMan.services.schedule.createItem(data, 0, '#future-list');
    });
  },

  'tomorrow3Page.show': function init() {
    var has = false;
    $('#tomorrow3-list ons-list-item').remove();
    $('#tomorrow3-list ons-list-header').hide();
    RunningMan.stores.queryDayTask(3, function create(data) {
      if (!has) {
        $('#tomorrow3-list ons-list-header').show();
        has = true;
      }
      return RunningMan.services.schedule.createTimeItem(data, 0, '#tomorrow3-list');
    });
  },

  'tomorrow2Page.show': function init() {
    var has = false;
    $('#tomorrow2-list ons-list-item').remove();
    $('#tomorrow2-list ons-list-header').hide();
    RunningMan.stores.queryDayTask(2, function create(data) {
      if (!has) {
        $('#tomorrow2-list ons-list-header').show();
        has = true;
      }
      return RunningMan.services.schedule.createTimeItem(data, 0, '#tomorrow2-list');
    });
  },

  'tomorrowPage.show': function init() {
    var has = false;
    $('#tomorrow-list ons-list-item').remove();
    $('#tomorrow-list ons-list-header').hide();
    RunningMan.stores.queryDayTask(1, function create(data) {
      if (!has) {
        $('#tomorrow-list ons-list-header').show();
        has = true;
      }
      return RunningMan.services.schedule.createTimeItem(data, 0, '#tomorrow-list');
    });
  },

  'todayPage.show': function init() {
    var hasNext = false;
    var hasToday = false;
    $('#next-list ons-list-item').remove();
    $('#todayPage ons-list-header:last').hide();
    RunningMan.stores.queryNextTask(function create(data) {
      if (!hasNext) {
        $('#todayPage ons-list-header:last').show();
        hasNext = true;
      }
      return RunningMan.services.schedule.createItem(data, 0, '#next-list');
    });

    $('#today-list ons-list-item').remove();
    $('#todayPage ons-list-header:first').hide();
    RunningMan.stores.queryDayTask(0, function create(data) {
      if (!hasToday) {
        $('#todayPage ons-list-header:first').show();
        hasToday = true;
      }
      return RunningMan.services.schedule.createTimeItem(data, 0, '#today-list');
    });
  },

  'expirePage.show': function init() {
    var noData = true;
    var parent = '#expire-list';
    $(parent + ' ons-list-item').remove();
    RunningMan.stores.queryExpire(function create(data) {
      if (noData) {
        $(parent + ' ons-list-header').html('已经延误：');
        noData = false;
      }
      return RunningMan.services.schedule.createItem(data, 0, parent);
    });
  },

  'timePage.destroy': function destroy() {
    $('body').off('change', '#timePage ons-switch');
    $('body').off('click', '#timePageDone');
    $('body').off('click', '#timePage #next-list ons-list-item:first ons-icon');
  },

  timePage: function init(page) {
    var repeat = {};
    // 切换重复类型
    var changeNextType = function change(type) {
      $('input[name="' + type + '"]').on('change', function change() {
        // console.log($('input[type="radio"]:checked').val());
        switch ($('input[name="' + type + '"]:checked').val()) {
          case '0': // 天
            repeat.next_type = 0;
            break;
          case '1': // 周
            repeat.next_type = 1;
            break;
          case '2': // 月
            repeat.next_type = 2;
            break;
          default:
            repeat.next_type = 2;
        }
        showNextTime()
      });
    };
    var calculateNextTime = function cal() {
      var day;
      if (!$('#alerttime').val() || !repeat.next_step) {
        return '';
      }
      day = new Date($('#alerttime').val());
      console.log('day:%o,step:%d,type:%s', day, repeat.next_step, repeat.next_type);
      switch (repeat.next_type) {
        case 0: // 日
          day.setDate(day.getDate() + repeat.next_step);
          break;
        case 1: // 周
          day.setDate(day.getDate() + (repeat.next_step * 7));
          break;
        case 2: // 月
          day.setMonth(day.getMonth() + repeat.next_step);
          break;
        default:
      }
      console.log(day);
      return RunningMan.utils.dateFormat(day, 'yyyy-MM-dd hh:mm');
    };
    var showNextTime = function show() {
      switch (repeat.next_type) {
        case 0:
          $('#timePage #next-list ons-list-item:first div.right label').html('天');
          break;
        case 1:
          $('#timePage #next-list ons-list-item:first div.right label').html('周');
          break;
        case 2:
          $('#timePage #next-list ons-list-item:first div.right label').html('月');
          break;
        default:
      }
      // 计算时间
      $('#timePage #next-list ons-list-item:last div.right').html(calculateNextTime());
    };
    changeNextType('next-segment-a');
    changeNextType('next-segment-b');

    // 默认不重复
    $('#timePage ons-list-header:last').hide();
    $('#timePage #next-list').hide();

    // 设置时间
    if (page.data) {
      console.log(page.data);
      if (page.data.datetime) {
        $('#alerttime').val(page.data.datetime);
      }
      if (page.data.next_step > 0) {
        console.log(1111111);
        $('#timePage ons-switch').prop('checked', true);
        repeat.next_step = page.data.next_step;
        repeat.next_type = page.data.next_type;
        $('#timePage ons-list-header:last').show();
        $('#timePage #next-list').show();
        $('#timePage #next-list ons-list-item:first div.right span').html(repeat.next_step);
        showNextTime();
      }
    }

    // 重复选项
    $('body').on('change', '#timePage ons-switch', function sw() {
      console.log(111111111);
      console.log(this.checked);
      $('#timePage ons-list-header:last').toggle(this.checked);
      $('#timePage #next-list').toggle(this.checked);
      if (this.checked) {
        repeat.next_step = 1;
        repeat.next_type = 2; // 月
      } else {
        repeat.next_step = 0;
        repeat.next_type = 0; // 日
      }
      $('#timePage #next-list ons-list-item:first div.right span').html(repeat.next_step);
      $('#timePage #next-list ons-list-item:last div.right').html(calculateNextTime());
    });
    // 点击 加减
    $('body').on('click', '#timePage #next-list ons-list-item:first ons-icon', function fn() {
      console.log($(this).attr('direction'));
      switch ($(this).attr('direction')) {
        case 'remove':
          if (repeat.next_step > 1) {
            repeat.next_step -= 1;
          }
          break;
        case 'add':
          repeat.next_step += 1;
          break;
        default:
      }
      console.log(repeat.next_step);
      $('#timePage #next-list ons-list-item:first div.right span').html(repeat.next_step);
      $('#timePage #next-list ons-list-item:last div.right').html(calculateNextTime());
    });

    // 提交
    $('body').on('click', '#timePageDone', function ok() {
      console.log(repeat.next_step + ' ' + Math.random());
      if (repeat.next_step !== undefined) {
        $('#next_step').val(repeat.next_step);
        $('#next_type').val(repeat.next_type);
        console.log($('#next_step').val());
      }
      if (repeat.next_step > 0) {
        $('#time_title').html($('#alerttime').val().replace('T', ' ') + ' 重复');
      } else {
        $('#time_title').html($('#alerttime').val().replace('T', ' '));
      }
      $('#detailPage input[name="mode"][value="1"]').prop('checked', true);
      navi.popPage();
    });
  },

  'detailPage.destroy': function destroy() {
    $('#detail_del').off('click');
    $('#detailPageDone').off('click');
  },

  detailPage: function init(page) {
    var theTask = {}; // 当前任务
    var showTaskDetail;
    // 设置标题
    var source = page.data.source;
    var back;
    var title;
    // 属性页与详细页 切换事件
    var selectAttrPage = function sel(type) {
      $('input[name="' + type + '"]').on('change', function change() {
        // console.log($('input[type="radio"]:checked').val());
        switch ($('input[name="' + type + '"]:checked').val()) {
          case 'd':
            $('#attributes').css('display', 'none');
            $('#detail').css('display', '');
            break;
          case 'a':
          default:
            $('#attributes').css('display', '');
            $('#detail').css('display', 'none');
        }
      });
    };
    selectAttrPage('attr-segment-a');
    selectAttrPage('attr-segment-b');

    console.log(page.data);
    console.log('source:' + source);
    switch (source) {
      case -1: // 来自收件箱
        back = '收集箱';
        title = '待整理项';
        break;
      default:
        back = '返回';
        title = '动作';
    }
    console.log('back:%s, title:%s', back, title);
    $('ons-toolbar span.back-button__label').html(back);
    $('ons-toolbar div.center').html(title);

    // 详细页 默认不显示
    $('#detail').css('display', 'none');

    // 选择 项目
    // $('#choose-project').on('change', function change() {
    //
    // });

    // 选择 处理方式
    $('input[name="mode"]').on('click', function change() {
      console.log($('input[name="mode"]:checked').val());
      if (parseInt($('input[name="mode"]:checked').val(), 10) === 1) {
        console.log($('#time_title').html().replace(' ', 'T'));
        navi.pushPage('templates/time.html', {
          data: {
            datetime: $('#time_title').html().replace(' ', 'T').split(' ')[0],
            next_step: parseInt($('#next_step').val(), 10),
            next_type: parseInt($('#next_type').val(), 10)
          }
        });
        return false;
      } else if (parseInt($('input[name="mode"]:checked').val(), 10) === 2) {
        return false;
      }
      return true;
    });

    // 删除任务
    $('#detail_del').on('click', function rm() {
      if (theTask._id) {
        RunningMan.stores.removeTask(theTask._id);
      }
      navi.popPage();
    });

    // 保存任务
    $('#detailPageDone').on('click', function ok() {
      var id = theTask._id;
      var datetime;
      theTask.state = $('#detailPageDone input[type="checkbox"]').is(':checked') ? 1 : 0;
      theTask.title = $('#detail_title').val();
      theTask.detail = $('#desc').val() || '';
      theTask.mode = $('input[name="mode"]:checked').val() ?
        parseInt($('input[name="mode"]:checked').val(), 10) : -1;
      theTask.project = $('#choose-project').val();
      theTask.context = $('#choose-context').val();
      theTask.end_date = '';
      theTask.end_time = '';
      if (theTask.mode === 1) {
        datetime = $('#time_title').html();
        theTask.end_date = datetime.split(' ')[0];
        theTask.end_time = datetime.split(' ')[1];
      }
      if ($('#next_step').val()) {
        theTask.next_step = parseInt($('#next_step').val(), 10);
        theTask.next_type = parseInt($('#next_type').val(), 10);
      }
      delete theTask._id;
      console.log(theTask);
      RunningMan.stores.saveTask(id, theTask);

      // 修改前一个页面的显示
      switch (source) {
        case -1: // 来自收件箱
          RunningMan.services.inbox.clear();
          RunningMan.stores.queryInbox(RunningMan.services.inbox.create);
          break;
        default:
      }
      //
      navi.popPage();
    });

    // 显示明细
    showTaskDetail = function show(task) {
      theTask = task;
      console.log(theTask);
      $('#detail_title').val(theTask.title || 'new task');
      $('#desc').val(theTask.detail || '');
      if (!theTask._id && page.data.source === 0) {
        var theDay = new Date();
        theTask.mode = 1;
        switch (document.getElementById('scheduletabs').getActiveTabIndex()) {
          case 0:
            theTask.mode = 4;
            break;
          case 5:
            theTask.mode = 3;
            break;
          default:
            var theDay = new Date();
            theDay.setDate(theDay.getDate() + document.getElementById('scheduletabs').getActiveTabIndex() - 1);
            theTask.end_date = RunningMan.utils.dateFormat(theDay, 'yyyy-MM-dd');
            theTask.end_time = RunningMan.utils.dateFormat(theDay, 'hh:mm');
        }
      }
      $('input[name="mode"][value="' + theTask.mode + '"]').prop('checked', true);
      if (theTask.mode === 1) {
        if (theTask.next_step > 0) {
          $('#next_step').val(theTask.next_step);
          $('#next_type').val(theTask.next_type);
          $('#time_title').html(theTask.end_date + ' ' + theTask.end_time + ' 重复');
        } else {
          $('#time_title').html(theTask.end_date + ' ' + theTask.end_time);
        }
      } else {
        $('#time_title').html('');
      }
      $('#choose-project').val(theTask.project);
      $('#choose-context').val(theTask.context);
    };

    // 如果有 任务_id, 则显示任务信息
    if (page.data.taskId) {
      RunningMan.stores.queryTask(page.data.taskId, showTaskDetail);
    } else {
      showTaskDetail({});
    }
  }
};
