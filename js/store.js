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
    var def = {
      mode: -1, project: -1, context: -1, state: 0
    };
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

  finishTask: function finish(id) {
    var tx = this.db.transaction('tasks', 'readwrite');
    var store = tx.objectStore('tasks');
    store.get(id).onsuccess = function o(e) {
      var value = e.target.result;
      value.finish_datetime = RunningMan.utils.dateFormat(new Date(), 'yyyy-MM-dd hh:mm');
      value.state = 1;
      store.put(value, id);
    };
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
    var request = index.openCursor(IDBKeyRange.only([
      RunningMan.utils.dateFormat(theDay, 'yyyy-MM-dd'), 0]));
    var that = this;
    console.log(RunningMan.utils.dateFormat(theDay, 'yyyy-MM-dd'));
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
    var request = index.openCursor(IDBKeyRange.bound(['1900-01-01', 0], [
      RunningMan.utils.dateFormat(new Date(), 'yyyy-MM-dd'), 0], true, true));
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
    var request = index.openCursor(IDBKeyRange.lowerBound([
      RunningMan.utils.dateFormat(theDay, 'yyyy-MM-dd'), 0], true));
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

  // 统计
  queryCount: function query(cb) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var bydate = store.index('by_end_date');
    var bymode = store.index('by_mode');
    var today = new Date();
    // queryExpire count
    async.parallel([
      function queryExpireCount(callback) {
        var request = bydate.count(IDBKeyRange.bound(['1900-01-01', 0], [
          RunningMan.utils.dateFormat(today, 'yyyy-MM-dd'), 0], true, true));
        request.onsuccess = function success() {
          callback(null, request.result);
        };
      },
      function queryTodayCount(callback) {
        var request = bydate.count(IDBKeyRange.only([
          RunningMan.utils.dateFormat(today, 'yyyy-MM-dd'), 0]));
        request.onsuccess = function success() {
          callback(null, request.result);
        };
      },
      function queryNextCount(callback) {
        var request = bymode.count(IDBKeyRange.only([0, 0]));
        request.onsuccess = function success() {
          callback(null, request.result);
        };
      },
      function queryTomorrowCount(callback) {
        var theDay = new Date();
        theDay.setDate(theDay.getDate() + 1);
        bydate.count(IDBKeyRange.only([
          RunningMan.utils.dateFormat(theDay, 'yyyy-MM-dd'), 0]))
          .onsuccess = function success() {
            callback(null, this.result);
          };
      },
      function queryTomorrow2Count(callback) {
        var theDay = new Date();
        theDay.setDate(theDay.getDate() + 2);
        bydate.count(IDBKeyRange.only([
          RunningMan.utils.dateFormat(theDay, 'yyyy-MM-dd'), 0]))
          .onsuccess = function success() {
            callback(null, this.result);
          };
      },
      function queryTomorrow3Count(callback) {
        var theDay = new Date();
        theDay.setDate(theDay.getDate() + 3);
        bydate.count(IDBKeyRange.only([
          RunningMan.utils.dateFormat(theDay, 'yyyy-MM-dd'), 0]))
          .onsuccess = function success() {
            callback(null, this.result);
          };
      },
      function queryComingCount(callback) {
        var theDay = new Date();
        theDay.setDate(theDay.getDate() + 3);
        bydate.count(IDBKeyRange.lowerBound([
          RunningMan.utils.dateFormat(theDay, 'yyyy-MM-dd'), 0], true))
          .onsuccess = function success() {
            callback(null, this.result);
          };
      },
      function queryFutureCount(callback) {
        var request = bymode.count(IDBKeyRange.only([3, 0]));
        request.onsuccess = function success() {
          callback(null, request.result);
        };
      }
    ], function end(err, results) {
      cb(results);
    });
  },

  // 查询收件箱
  queryInbox: function query(iter) {
    var tx = this.db.transaction('tasks');
    var store = tx.objectStore('tasks');
    var index = store.index('by_mode');
    var request = index.openCursor(IDBKeyRange.only([-1, 0])); // 收件箱  未完成
    var that = this;
    request.onsuccess = function success() {
      var cursor = request.result;
      if (cursor) {
        iter(that.extend({ _id: cursor.primaryKey }, cursor.value));
        cursor.continue();
      }
    };
  },

  setSysParam: function set(code, value) {
    var tx = this.db.transaction('sysparam', 'readwrite');
    var store = tx.objectStore('sysparam');
    store.put({ code: code, value: value });
  },

  // 查询首页
  querySysParam: function query(code, cb) {
    var tx = this.db.transaction('sysparam');
    var store = tx.objectStore('sysparam');
    store.get(code).onsuccess = function finded(e) {
      cb(e.target.result);
    };
  },

  queryItems: function query(category, parentId, cb) {
    var tx = this.db.transaction('items');
    var store = tx.objectStore('items');
  },

  openDatabase: function openDB(cb) {
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

        store = that.db.createObjectStore('items', { autoIncrement: true });
        // 项目
        store.put({
          parent_id: 0, category: 1, name: '项目', has_children: true
        }, 1);
        // 场景
        store.put({
          parent_id: 0, category: 2, name: '场景', has_children: true
        }, 2);

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

        store = that.db.createObjectStore('sysparam', { keyPath: 'code' });
        store.put({ code: 'firstPage', value: 'home.html' });
      }
    };

    request.onsuccess = function success() {
      that.db = request.result;
      if (cb) cb();
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
