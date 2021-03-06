RunningMan.services = {
  common: {
    notify: function notify() {
      var msg = [];
      RunningMan.stores.queryNotification(function it(obj) {
        msg.push({
          id: obj.$id,
          title: obj.title,
          text: obj.detail,
          priority: 5, // android.support.v4.app.NotificationManagerCompat.IMPORTANCE_MAX
          at: new Date(
            parseInt(obj.end_date.substr(0, 4), 10),
            parseInt(obj.end_date.substr(5, 2), 10) - 1,
            parseInt(obj.end_date.substr(8, 2), 10),
            parseInt(obj.end_time.substr(0, 2), 10),
            parseInt(obj.end_time.substr(3, 2), 10)
          )
        });
      }, function ok() {
        cordova.plugins.notification.local.schedule(msg);
      });
    }
  },

  inbox: {
    create: function create(data) {
      var template = document.createElement('div');
      template.innerHTML =
      '<ons-list-item tappable>' +
        '<label class="left">' +
          '<ons-checkbox class="task_state"></ons-checkbox>' +
        '</label>' +
        '<div class="center" onclick="navi.pushPage(\'templates/detail.html\',' +
        ' {data: {source: -1, taskId: ' + data._id + '}})">' +
          '<span class="list-item__title" style="font-size: 16px;">' + data.title + '</span>' +
          (data.end_date ?
            ('<span class="list-item__subtitle" style="text-align: right;font-size: 12px;">截止于' +
            data.end_date + '</span>') : '') +
        '</div>' +
        '<div class="right">' +
          '<ons-icon size="30px" style="color: grey; padding-left: 4px" ' +
          'icon="ion-ios-trash-outline, material:md-delete"></ons-icon>' +
        '</div>' +
      '</ons-list-item>';
      template.firstChild.primaryKey = data._id;
      document.querySelector('#inbox-list').appendChild(template.firstChild);
    },

    remove: function remove(event) {
      $(event.target).parents('ons-list-item').each(function removeItem() {
        RunningMan.stores.removeTask(this.primaryKey);
        this.primaryKey = null;
        this.remove();
      });
    },

    finish: function finish(event) {
      $(event.target).parents('ons-list-item').each(function removeItem() {
        RunningMan.stores.finishTask(this.primaryKey);
        $(this).fadeOut(800);
      });
    },

    clear: function clear() {
      document.querySelectorAll('#inbox-list ons-list-item').forEach(function fun(item) {
        item.primaryKey = null;
        item.remove();
      });
    }
  },

  schedule: {
    createItem: function item(data, source, parent) {
      var template = document.createElement('div');
      template.innerHTML =
      '<ons-list-item tappable>' +
        '<label class="left">' +
          '<ons-checkbox class="task_state"></ons-checkbox>' +
        '</label>' +
        '<div class="center" onclick="navi.pushPage(\'templates/detail.html\',' +
        ' {data: {source: 0, taskId: ' + data._id + '}})">' +
          '<span class="list-item__title" style="font-size: 16px;">' + data.title + '</span>' +
          (data.end_date ?
            ('<span class="list-item__subtitle" style="text-align: right;font-size: 12px;">到期于' +
            data.end_date + ' ' + data.end_time + '</span>') : '') +
        '</div>' +
      '</ons-list-item>';
      template.firstChild.primaryKey = data._id;
      document.querySelector(parent).appendChild(template.firstChild);
    },

    createTimeItem: function item(data, source, parent) {
      var template = document.createElement('div');
      template.innerHTML =
      '<ons-list-item tappable>' +
        '<label class="left">' +
          '<ons-checkbox class="task_state"></ons-checkbox>' +
        '</label>' +
        '<div class="center" onclick="navi.pushPage(\'templates/detail.html\',' +
        ' {data: {source: 0, taskId: ' + data._id + '}})">' +
          '<span class="list-item__title" style="font-size: 16px;">' + data.title + '</span>' +
          (data.end_date ?
            ('<span class="list-item__subtitle" style="text-align: right;font-size: 12px;">到期于' +
            data.end_time + '</span>') : '') +
        '</div>' +
      '</ons-list-item>';
      template.firstChild.primaryKey = data._id;
      document.querySelector(parent).appendChild(template.firstChild);
    }

  },

  history: {
    createItem: function item(data, parent) {
      var template = document.createElement('div');
      template.innerHTML =
      '<ons-list-item tappable>' +
        '<div class="center" onclick="navi.pushPage(\'templates/detail.html\',' +
        ' {data: {source: 1, taskId: ' + data._id + '}})">' +
          '<span class="list-item__title" style="font-size: 16px;">' + data.title + '</span>' +
            ('<span class="list-item__subtitle" style="text-align: right;font-size: 12px;">完成于' +
            data.finish_datetime.split(' ')[0] + '</span>') +
        '</div>' +
      '</ons-list-item>';
      template.firstChild.primaryKey = data._id;
      document.querySelector(parent).appendChild(template.firstChild);
    },

    createTimeItem: function item(data, parent) {
      var template = document.createElement('div');
      template.innerHTML =
      '<ons-list-item tappable>' +
        '<div class="center" onclick="navi.pushPage(\'templates/detail.html\',' +
        ' {data: {source: 1, taskId: ' + data._id + '}})">' +
          '<span class="list-item__title" style="font-size: 16px;">' + data.title + '</span>' +
            ('<span class="list-item__subtitle" style="text-align: right;font-size: 12px;">完成于' +
            data.finish_datetime.split(' ')[1].substr(0, 5) + '</span>') +
        '</div>' +
      '</ons-list-item>';
      template.firstChild.primaryKey = data._id;
      document.querySelector(parent).appendChild(template.firstChild);
    }
  }
};
