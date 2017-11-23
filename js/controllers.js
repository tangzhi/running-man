RunningMan.controllers = {
  homePage: function init() {
    RunningMan.stores.openDatabase();
    // navi.on('postpush', function pp(event) {
    //
    //   navi.leavePage = event.leavePage;
    //   navi.enterPage = event.enterPage;
    // });
  },

  menuPage: function initMenuPage() {
  },

  inboxPage: function init(page) {
    RunningMan.stores.queryInbox(RunningMan.services.inbox.create);

    $('#addItem').on('click', function click() {
      RunningMan.stores.newTask(page.querySelector('#stuff').value,
        RunningMan.services.inbox.create);
      console.log($('#stuff'));
      $('#stuff').val('');
    });

    $('ons-toolbar ons-toolbar-button ons-icon').on('click', function cl() {
      // console.log($('#inbox-list ons-list-item div.right ons-icon'));
      //
    });

    $('#inbox-list').on('click', 'ons-list-item div.right ons-icon', function cl(event) {
      RunningMan.services.inbox.remove(event);
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

  timePage: function init(page) {
    if (page.data && page.data.datetime) {
      $('#alerttime').val(page.data.datetime);
    }

    $('ons-page').on('click', '#timePageDone', function ok() {
      $('#time_title').html($('#alerttime').val().replace('T', ' '));
      $('input[name="mode"][value="1"]').prop('checked', true);
      navi.popPage();
    });
  },

  detailPage: function init(page) {
    var theTask = {}; // 当前任务
    var showTaskDetail;
    // 设置标题
    var source = page.data.source ? page.data.source : -1;
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
    selectAttrPage('segment-a');
    selectAttrPage('segment-b');

    console.log('source:' + source);
    switch (source) {
      case -1:  // 来自收件箱
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
    $('#choose-project').on('change', function change() {

    });

    // 设置 时间

    // 选择 处理方式
    $('input[name="mode"]').on('click', function change() {
      console.log($('input[name="mode"]:checked').val());
      if (parseInt($('input[name="mode"]:checked').val(), 10) === 1) {
        console.log($('#time_title').html().replace(' ', 'T'));
        navi.pushPage('templates/time.html',
          { data: { datetime: $('#time_title').html().replace(' ', 'T') } });
        return false;
      } else if (parseInt($('input[name="mode"]:checked').val(), 10) === 2) {
        return false;
      }
    });

    $('#detailPageDone').on('click', function ok() {
      var id = theTask._id;
      var datetime;
      theTask.state = $('input[type="checkbox"]').is(':checked') ? 1 : 0;
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
      $('#detail_title').val(theTask.title);
      $('#desc').val(theTask.detail || '');
      $('input[name="mode"][value="' + theTask.mode + '"]').prop('checked', true);
      if (theTask.mode === 1) {
        $('#time_title').html(theTask.end_date + ' ' + theTask.end_time);
      } else {
        $('#time_title').html('');
      }
      $('#choose-project').val(theTask.project);
      $('#choose-context').val(theTask.context);
    };

    // 如果有 任务_id, 则显示任务信息
    if (page.data.taskId) {
      RunningMan.stores.queryTask(page.data.taskId, showTaskDetail);
    }
  }
};
