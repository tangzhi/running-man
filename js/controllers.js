RunningMan.controllers = {
  homePage: function init() {
    RunningMan.stores.openDatabase();
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
      RunningMan.stores.removeDatabase();
    });

    $('#inbox-list').on('click', 'ons-list-item div.right ons-icon', function cl(event) {
      RunningMan.services.inbox.remove(event);
    });
  },

  futurePage: function init() {
    RunningMan.stores.queryComing(1, function create(data) {
      return RunningMan.services.schedule.createItem(data, 0, '#comming-list');
    });

    RunningMan.stores.queryFuture(function create(data) {
      return RunningMan.services.schedule.createItem(data, 0, '#future-list');
    });
  },

  tomorrowPage: function init() {
    RunningMan.stores.queryDayTask(1, function create(data) {
      return RunningMan.services.schedule.createItem(data, 0, '#tomorrow-list');
    });
  },

  todayPage: function init() {
    RunningMan.stores.queryNextTask(function create(data) {
      return RunningMan.services.schedule.createItem(data, 0, '#next-list');
    });

    RunningMan.stores.queryDayTask(0, function create(data) {
      return RunningMan.services.schedule.createItem(data, 0, '#today-list');
    });
  },

  expirePage: function init() {
    RunningMan.stores.queryExpire(function create(data) {
      return RunningMan.services.schedule.createItem(data, 0, '#expire-list');
    });
  },

  detailPage: function init(page) {
    var theTask = {}; // 当前任务
    var showTaskDetail;
    // 设置标题
    var source = page.data.source ? page.data.source : -1;
    var back;
    var title;
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
    $('ons-toolbar span.back-button__label').textContent = back;
    $('ons-toolbar div.center').textContent = title;

    // 详细页 默认不显示
    $('#detail').css('display', 'none');

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
    /*
    $('input[type="radio"]').on('change', function change() {
      // console.log($('input[type="radio"]:checked').val());
      switch ($('input[type="radio"]:checked').val()) {
        case 'd':
          $('#attributes').css('display', 'none');
          $('#detail').css('display', '');
          break;
        case 'a':
        default:
          $('#attributes').css('display', '');
          $('#detail').css('display', 'none');
      }
    });*/

    // 选择 项目
    $('#choose-project').on('change', function change() {

    });

    // 选择 处理方式
    $('input[name="mode"]').on('click', function change() {
      console.log($('input[name="mode"]:checked').val());
      return false;
    });

    $('ons-toolbar-button').on('click', function ok() {
      var id = theTask._id;
      theTask.state = $('input[type="checkbox"]').is(':checked') ? 1 : 0;
      theTask.title = $('#detail_title').val();
      theTask.detail = $('#desc').val() || '';
      theTask.mode = $('input[name="mode"]:checked').val() ?
        parseInt($('input[name="mode"]:checked').val(), 10) : -1;
      theTask.project = $('#choose-project').val();
      theTask.context = $('#choose-context').val();
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
      $('#choose-project').val(theTask.project);
      $('#choose-context').val(theTask.context);
    };

    // 如果有 任务_id, 则显示任务信息
    if (page.data.taskId) {
      RunningMan.stores.queryTask(page.data.taskId, showTaskDetail);
    }
  }
};
