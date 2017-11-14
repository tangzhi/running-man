RunningMan.services = {
  inbox: {
    create: function create(data) {
      var template = document.createElement('div');
      template.innerHTML =
      '<ons-list-item tappable>' +
        '<label class="left">' +
          '<ons-checkbox></ons-checkbox>' +
        '</label>' +
        '<div class="center" onclick="navi.pushPage(\'templates/detail.html\',' +
        ' {source: 0})">' +
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
      console.log(event);
    },

    clear: function clear() {
      document.querySelectorAll('#inbox-list ons-list-item').forEach(function fun(item) {
        item.primaryKey = null;
        item.remove();
      })
    }
  }
};
