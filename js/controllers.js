RunningMan.controllers = {
  homePage: function init() {
    RunningMan.stores.openDatabase();
  },

  menuPage: function initMenuPage() {
  },

  inboxPage: function init(page) {
    RunningMan.stores.queryInbox(RunningMan.services.inbox.create);

    $('#addItem').on('click', function click() {
      RunningMan.stores.newTask(page.querySelector('#stuff').value);
      RunningMan.services.inbox.clear();
      RunningMan.stores.queryInbox(RunningMan.services.inbox.create);

      $('#stuff').value = '';
    });

    $('ons-toolbar ons-toolbar-button ons-icon').on('click', function cl() {
      console.log($('#inbox-list ons-list-item div.right ons-icon'));
    });

    $('#inbox-list').on('click', 'ons-list-item div.right ons-icon', function cl(event) {
      RunningMan.services.inbox.remove(event);
    });
  },

  detailPage: function init(page) {
    var source = page.source ? page.source : 0;
    var back;
    var title;
    switch (source) {
      case 0:
        back = '收集箱';
        title = '待整理项';
        break;
      default:
        back = '返回';
        title = '动作';
    }
    $('ons-toolbar span.back-button__label').textContent = back;
    $('ons-toolbar div.center').textContent = title;

    $('#detail').css('display', 'none');

    $('input[type="radio"]').on('change', function change() {
      console.log($('input[type="radio"]:checked').val());
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
    });

    $('#choose-project').on('change', function change() {

    });
  }
};
