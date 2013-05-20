var express = require('express')
    , http = require('http')
    , path = require('path')
    , fs = require('fs')
    , humanize = require('humanize')
    , Transfer = require('transfer');

var app = express();

app.set('port', process.env.PORT || 3015);
app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


/**
 * Экран отправки файла
 */
app.get('/', function (req, res) {
    app.render('send', {}, function (err, html) {
        res.render('layout', {body: html});
    })
});

/**
 * Получить информация о файле:
 */
app.get('/file/:transferId', function (req, res) {
    var transferId = req.params.transferId;
    var transfer = Transfer.transfers[transferId];
    if (!transfer) {
        return res.redirect('/');
    }

    var file = transfer.fileInfo;

    //noinspection JSValidateTypes
    app.render('file', {
        'transferId': req.params.transferId,
        'file': {
            name: file.name,
            size: humanize.filesize(file.size)
        }
    }, function (err, html) {
        res.render('layout', {body: html});
    })
});

/**
 * Получить файд:
 */
app.get('/get/:transferId', function (req, res) {
    var transferId = req.params.transferId;
    var transfer = Transfer.transfers[transferId];
    if (!transfer) {
        return res.redirect("/");
    }

    transfer.sendFile(res);
});

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log('Transfer server listening on port ' + app.get('port'));
});

Transfer.init(server);


