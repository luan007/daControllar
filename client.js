
var items = [{
    tab: "视频控制", group: "青花瓷",
    value: 0,
    type: "bang",
    name: "重播",
    icon: "play_arrow"
}];

function idFor(item) {
    return hashCode(item.name + item.group + item.tab + item.desc);
}

for (var i = 0; i < items.length; i++) {
    items[i].id = idFor(items[i]);
}

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

function start(path, items) {
    var items = items;
    var socket = require('socket.io-client')(path);
    socket.on('connect', function () {
        console.log("connected to server");
    });
    socket.on('update', function (data) {
        socket.emit('packet', items);
    });
    socket.on('disconnect', function () {
        console.log("disconnected from server");
    });
    socket.connect();
}

start('http://localhost:9999', items);