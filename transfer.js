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
 * Send file screen
 */
app.get('/', function (req, res) {
    app.render('send', {}, function (err, html) {
        res.render('layout', {body: html});
    })
});

/**
 * Get file info
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
 * Receive file content
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


