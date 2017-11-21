RunningMan.stores = {
  db: null,

  onError: function err(tx, request) {
    if (request) {
      request.onerror = function err1() {
        ons.notification.toast({ message: request.error, timeout: 2000 });
      };
    }
    if (tx) {
      tx.onabort = function err2() {
        ons.notification.toast({ message: tx.error, timeout: 2000 });
      };
    }
  },

  newTask: function simple(title, cb) {
    var tx = this.db.transaction('tasks', 'readwrite');
    var store = tx.objectStore('tasks');
    var def = { mode: -1, project: -1, context: -1, state: 0 };
    var request;
    if (typeof title === 'object') {
      this.extend(def, title);
    } else {
      def.title = title;
    }
    def.in_date = new Date();
    request = store.put(def);
    this.onError(tx, request);
    request.onsuccess = function ok(e) {
      cb({ _id: e.target.result, title: title, end_date: def.end_date });
    };
  },

  saveTask: function save(id, task) {
    var tx = this.db.transaction('tasks', 'readwrite');
    var store = tx.objectStore('tasks');
    var request = store.put(task, id);
    this.onError(tx, request);
  },

  removeTask: function rm(id) {
    var tx = this.db.transaction('tasks', 'readwrite');
    var store = tx.objectStore('tasks');
    store.delete(id);
  },

  extend: function fun(obj) {
    var index;
    var source;
    var keys;
    var key;
    var l;
    var i;
    var length = arguments.length;
    if (length < 2 || obj === null) return obj;
    for (index = 1; index < length; index++) {
      source = arguments[index];
      keys = [];
      for (key in source) {
        if (hasOwnProperty.call(source, key)) keys.push(key);
      }
      l = keys.length;
      for (i = 0; i < l; i++) {
        key = keys[i];
        obj[key] = source[key];
      }
    }
    return obj;
  },

  queryTask: function query(id, cb) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var request = store.openCursor(id);
    var that = this;
    request.onsuccess = function finded() {
      var cursor = request.result;
      if (cursor) {
        console.log(cursor.value);
        cb(that.extend({ _id: cursor.primaryKey }, cursor.value));
      }
    };
  },

  // 查询将来计划任务
  queryFuture: function query(cb) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var index = store.index('by_mode');
    var request = index.openCursor(IDBKeyRange.only([3, 0])); // 尽快处理  未完成
    var that = this;
    request.onsuccess = function success() {
      var cursor = request.result;
      if (cursor) {
        console.log(cursor.value);
        cb(that.extend({ _id: cursor.primaryKey }, cursor.value));
        cursor.continue();
      }
    };
  },

  // 查询某天任务
  queryDayTask: function query(day, cb) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var index = store.index('by_end_date');
    var today = new Date();
    var theDay = today.setDate(today.getDate() + day) && today;
    var request = index.openCursor(IDBKeyRange.only(
        [RunningMan.utils.dateFormat(theDay, 'YYYY-MM-dd'), 0]));
    var that = this;
    request.onsuccess = function success() {
      var cursor = request.result;
      if (cursor) {
        cb(that.extend({ _id: cursor.primaryKey }, cursor.value));
        cursor.continue();
      }
    };
  },

  // 查询尽快处理任务
  queryNextTask: function query(cb) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var index = store.index('by_mode');
    var request = index.openCursor(IDBKeyRange.only([0, 0])); // 尽快处理  未完成
    var that = this;
    request.onsuccess = function success() {
      var cursor = request.result;
      if (cursor) {
        console.log(cursor.value);
        cb(that.extend({ _id: cursor.primaryKey }, cursor.value));
        cursor.continue();
      }
    };
  },

  // 查询过期任务
  queryExpire: function query(cb) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var index = store.index('by_end_date');
    var request = index.openCursor(IDBKeyRange.lowerBound(
        [RunningMan.utils.dateFormat(new Date(), 'YYYY-MM-dd'), 0]));
    var that = this;
    request.onsuccess = function success() {
      var cursor = request.result;
      if (cursor) {
        if (cursor.value.state === 0) {
          cb(that.extend({ _id: cursor.primaryKey }, cursor.value));
        }
        cursor.continue();
      }
    };
  },

  // 查询将来计划任务
  queryComing: function query(cb) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var index = store.index('by_end_date');
    var today = new Date();
    var theDay = today.setDate(today.getDate() + 3) && today;
    var request = index.openCursor(IDBKeyRange.upperBound(
        [RunningMan.utils.dateFormat(theDay, 'YYYY-MM-dd'), 0]));
    var that = this;
    request.onsuccess = function success() {
      var cursor = request.result;
      if (cursor) {
        if (cursor.value.state === 0) {
          cb(that.extend({ _id: cursor.primaryKey }, cursor.value));
        }
        cursor.continue();
      }
    };
  },

  // 查询收件箱
  queryInbox: function query(iter) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var index = store.index('by_mode');
    var request = index.openCursor(IDBKeyRange.only([-1, 0]));  // 收件箱  未完成
    var that = this;
    request.onsuccess = function success() {
      var cursor = request.result;
      if (cursor) {
        iter(that.extend({ _id: cursor.primaryKey }, cursor.value));
        cursor.continue();
      }
    };
  },

  openDatabase: function openDB() {
    var request = indexedDB.open('running-man');
    var that = this;
    request.onupgradeneeded = function fun(event) {
      var store;
      that.db = request.result;
      if (event.oldVersion < 1) {
        // Version 1 is the first version of the database.
        store = that.db.createObjectStore('tasks', { autoIncrement: true });
        ['end_date', 'mode']
          .forEach(function addIndex(item) {
            store.createIndex('by_' + item, [item, 'state']);
          });

        store = that.db.createObjectStore('project', { autoIncrement: true });
        store.put('无', -1);
        ['杂事', '个人', '工作'].forEach(function add(item) {
          store.put(item);
        });

        store = that.db.createObjectStore('context', { autoIncrement: true });
        store.put('无', -1);
        ['@家', '@办公室', '@路上', '@电话', '@电脑'].forEach(function add(item) {
          store.put(item);
        });
      }
    };

    request.onsuccess = function success() {
      that.db = request.result;
      console.log('openDatabase db open.');
    };
    console.log('openDatabase ...');
  },

  closeDatabase: function closeDB() {
    this.db.close();
  },

  removeDatabase: function removeDB() {
    var that = this;
    this.db.close();
    indexedDB.deleteDatabase('running-man')
      .onsuccess = function success() {
        that.db = null;
        console.log('removeDatabase db deleted.');
      };
    console.log('removeDatabase ...');
  }
};
