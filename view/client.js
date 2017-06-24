var socket = io('/');

socket.on('connect', function (d) {
  socket.emit("reqUpdate");
  
});

var idSet = {};

function ping(item) {
  socket.emit("command", item);
}
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
        for (var t = 0; t < tabs.length; t++) {
          var tab = tabs[t];
          console.log(tab)
          
          //document.querySelectorAll("a[href='" + id + "']"
          new MaterialLayoutTab(tab, tabs, panels, layout.MaterialLayout);
        }
        componentHandler.upgradeDom()
      }, 100)
    } else {
      idSet[data[i].id].lastSync = Date.now();
      idSet[data[i].id].value = data[i].value;
    }
  }
});

socket.on('serverAlive', function (data) {
  dt.server.lastSync = Date.now();
});

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}


for(var i in map.cities) {
  map.cities[i].pinyin = pinyinlite(map.cities[i].name).toString()
}
for(var i in map.provinces) {
  map.provinces[i].pinyin = pinyinlite(map.provinces[i].name).toString()
}
for(var i in map.counties) {
  map.counties[i].pinyin = pinyinlite(map.counties[i].name).toString()
}


var dt = {
  server: {
    timeStamp: Date.now(),
    lastSync: Date.now()
  },
  labels: {
    cities: raw_city_labels,
    counties: raw_county_labels
  },
  map: map,
  search: "",
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

    {
      tab: "维护", group: "推拉屏",
      value: 0,
      type: "bang",
      name: "起始侧校准",
      icon: "settings_overscan",
      lastSync: Date.now(),
      timeStamp: Date.now()
    },
    {
      tab: "维护", group: "推拉屏",
      value: 0,
      type: "bang",
      name: "结束侧校准",
      icon: "settings_overscan",
      lastSync: Date.now(),
      timeStamp: Date.now()
    }
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
    hash: hashCode,
    filteredmap: function() {
      return {
        provinces: map.provinces.map(function(v, i, a){
          var m1 = fuzzy.match(dt.search, v.pinyin);
          var m2 = fuzzy.match(dt.search, v.name);
          if(m1) m1.raw = v.name;
          if(m2) m2.raw = v.name;
          if(m1 && m2) return m1.score > m2.score ? m1 : m2;
          return m1 || m2;
        }).filter(function(j) {
          return j;
        }).sort(function(t,q) {
          return t.score - q.score;
        }),
        cities: map.cities.map(function(v, i, a){
          var m1 = fuzzy.match(dt.search, v.pinyin);
          var m2 = fuzzy.match(dt.search, v.name);
          if(m1) m1.raw = v.name;
          if(m2) m2.raw = v.name;
          if(m1 && m2) return m1.score > m2.score ? m1 : m2;
          return m1 || m2;
        }).filter(function(j) {
          return j;
        }).sort(function(t,q) {
          return t.score - q.score;
        }),
        counties: map.counties.map(function(v, i, a){
          var m1 = fuzzy.match(dt.search, v.pinyin);
          var m2 = fuzzy.match(dt.search, v.name);
          if(m1) m1.raw = v.name;
          if(m2) m2.raw = v.name;
          if(m1 && m2) return m1.score > m2.score ? m1 : m2;
          return m1 || m2;
        }).filter(function(j) {
          return j;
        }).sort(function(t,q) {
          return t.score - q.score;
        })
      };
    },
    bang: function (item) {
      item.value = !item.value;
      ping(item);
    },
    sw: function (item, $event) {
      $event.preventDefault();
      item.value = !item.value;
      ping(item);
    },
    pick: function(item, type, q) {
      q.value = {
        id: item,
        type: type
      }
      console.log(JSON.stringify(q.value));
      ping(q);
    },
    pickData: function(item, type, q) {
      q.value = {
        id: item,
        type: type
      }
      console.log(JSON.stringify(q.value));
      ping(q);
    },
    health: function (item) {
      var span = item.timeStamp - item.lastSync;
      if (span < 2000) {
        return "可靠";
      } else if (span < 6000) {
        return "不稳定";
      } else {
        return "离线..";
      }
    },
    health_icon: function (item) {
      var span = item.timeStamp - item.lastSync;
      if (span < 1000) {
        return "compare_arrows";
      } else if (span < 6000) {
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