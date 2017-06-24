
var client = require('./client.js');
var config = require('./config.json');

var items = [{
    tab: "视频控制", group: config.sector,
    value: 0,
    type: "bang",
    name: "重播",
    icon: "play_arrow",
    cb: function(cur, prev, me) {
        console.log(cur, prev, me);
    }
},{
    tab: "视频控制", group: config.sector,
    value: 0,
    type: "switch",
    name: "循环播放",
    icon: "loop",
    cb: function(cur, prev, me) {
        me.value = cur;
        console.log(me);
    }
}
,{
    tab: "视频控制", group: config.sector,
    value: 0,
    type: "bang",
    name: "重启",
    icon: "loop",
    cb: function(cur, prev, me) {
        console.log(cur, prev, me);
    }
}
];

client.start(config.server, items);