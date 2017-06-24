var socket = io('/');

socket.on('connect', function (d) {
  socket.emit("reqUpdate");
});

var idSet = {};


socket.on('collect', function (data) {
  for (var i = 0; i < data.length; i++) {
    if (!idSet[data[i].id]) {
      idSet[data[i].id] = data[i];
      idSet[data[i].id].timeStamp = Date.now();
      idSet[data[i].id].lastSync = Date.now();
      dt.states.push(idSet[data[i].id]);
      setTimeout(function () {
        var layout = document.getElementsByClassName('mdl-layout')[0];;
        var tabs = document.getElementsByClassName('mdl-layout__tab-bar')[0].getElementsByTagName('a');
        var panels = document.getElementsByClassName('mdl-layout__content')[0].getElementsByClassName('mdl-layout__tab-panel ');
        for (var tab of tabs) {
          //document.querySelectorAll("a[href='" + id + "']"
          new MaterialLayoutTab(tab, tabs, panels, layout.MaterialLayout);
        }
      }, 100)
    }
  }
});

socket.on('serverAlive', function (data) {
  dt.server.lastSync = Date.now();
});

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

var dt = {
  server: {
    timeStamp: Date.now(),
    lastSync: Date.now()
  },
  states: [
    // {
    //   tab: "视频控制", group: "青花瓷",
    //   value: 0,
    //   type: "bang",
    //   name: "重播2",
    //   icon: "play_arrow",
    //   lastSync: Date.now(),
    //   timeStamp: Date.now()
    // },
    // {
    //   tab: "视频控制", group: "青花瓷",
    //   value: 0,
    //   type: "switch",
    //   name: "循环播放",
    //   icon: "repeat",
    //   lastSync: Date.now(),
    //   timeStamp: Date.now()
    // },
    // {
    //   tab: "视频控制", group: "放心菜肉板块",
    //   value: 0,
    //   type: "switch",
    //   name: "循环播放",
    //   icon: "repeat",
    //   lastSync: Date.now(),
    //   timeStamp: Date.now()
    // }
  ]
};

var app = new Vue({
  el: '#app',
  data: dt,
  computed: {
    tabs: function () {
      var t = {};
      for (var i in dt.states) {
        var tab = dt.states[i].tab;
        t[tab] = t[tab] || {};
        t[tab][dt.states[i].group] = t[tab][dt.states[i].group] || [];
        t[tab][dt.states[i].group].push(dt.states[i]);
      }
      return t;
    }
  },
  methods: {
    health: function (item) {
      var span = item.timeStamp - item.lastSync;
      if (span < 2000) {
        return "在线 (即时)";
      } else if (span < 5000) {
        return "在线";
      } else if (span < 10000) {
        return "不稳定";
      } else {
        return "离线..";
      }
    },
    health_icon: function (item) {
      var span = item.timeStamp - item.lastSync;
      if (span < 2000) {
        return "compare_arrows";
      } else if (span < 5000) {
        return "network_wifi";
      } else if (span < 10000) {
        return "perm_scan_wifi";
      } else {
        return "warning";
      }
    },
    idFor: function (item) {
      return hashCode(item.name + item.group + item.tab + item.desc);
    },
    serverHealth: function () {
      var span = dt.server.timeStamp - dt.server.lastSync;
      if (span < 1000) {
        return "network_wifi";
      } else if (span < 5000) {
        return "perm_scan_wifi";
      }
      else
        return "warning";
    }
  }
})

setInterval(function () {
  dt.server.timeStamp = Date.now();
  //send update
  for (var i in dt.states) {
    dt.states[i].timeStamp = Date.now();
  }
  socket.emit("reqUpdate", {});
}, 2000);