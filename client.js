var _items;
var idSet = {};
var cbs = {};

function idFor(item) {
    return hashCode(item.name + item.group + item.tab + item.desc);
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

var socket = undefined;

function sendUpdate() {
    if (socket) {
        socket.emit('packet', _items);
    }
}

function start(path, registry) {
    _items = registry;
    for (var i = 0; i < registry.length; i++) {
        registry[i].id = idFor(registry[i]);
        var cb = registry[i].cb;
        idSet[registry[i].id] = registry[i];
        cbs[registry[i].id] = cb;
        delete registry[i].cb;
    }

    socket = require('socket.io-client')(path);
    socket.on('connect', function () {
        console.log("connected to server");
    });
    socket.on('update', function (data) {
        sendUpdate();
    });
    socket.on('disconnect', function () {
        console.log("disconnected from server");
    });

    socket.on("command", function (dt) {
        if (!dt) return;
        if (!idSet[dt.id]) {
            return;
        }
        if (dt.value != idSet[dt.id].value) {
            if(idSet[dt.id].type == 'bang') {
                idSet[dt.id].value = dt.value;
            }
            cbs[dt.id](dt.value, idSet[dt.id].value, idSet[dt.id]);
            sendUpdate();
        }
    });
    socket.connect();
}

module.exports.start = start;
