"use strict"

var Template = {
    FILE_PROGRESS: "file-progress",
    cache: {},
    render: function (templateName, data, callback) {
        var cache = this.cache;
        if (!cache[templateName]) {
            $.get("/partials/" + templateName + ".hjs", function (template) {
                cache[templateName] = Hogan.compile(template);
                callback(cache[templateName].render(data));
            })
            return;
        }
        callback(cache[templateName].render(data));
    }
};

var UI = {
    Dropbox: {
        init: function (sender) {
            var DRAG_STRING = 'Перетащите сюда файл для отправки...';
            var DROP_STRING = 'Отпускайте!';
            var SEND_LINK = 'Скопируйте и отошлите ссылку получателю:';

            var dropbox = $('#dropbox');

            dropbox.text(DRAG_STRING);

            dropbox.on("dragenter", function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).addClass("drag-over");
                $(this).removeClass("drop-done");
                $(this).text(DROP_STRING)
            });
            dropbox.on("dragleave", function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).removeClass("drag-over");
                $(this).text(DRAG_STRING);
            });
            dropbox.on("dragover", function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            dropbox.on("drop", function (e) {
                e.originalEvent.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    $(this).removeClass("drag-over");
                    $(this).addClass("drop-done");
                    $(this).text(SEND_LINK);
                    sender.newTransfer(files[0]);
                }
            });
        }
    },

    createProgressWindow: function (fileInfo) {
        var _this = this;

        Template.render(Template.FILE_PROGRESS, {file: fileInfo}, function (html) {
            $("#transfer-progress").html(html);
            _this.fileTransfers = $("#transfer-progress").find(".file-transfer");
        })
    },
    updateProgress: function (fileInfo, fileProgress) {

        var fileProgressContainer = this.fileTransfers.eq(0);

        if (Math.round(fileProgress) >= 100) {
            fileProgressContainer.addClass("finished");
            fileProgress = 100;
        }
        var downloadedSize = Math.round(fileInfo.size * (fileProgress / 100));

        fileProgressContainer.find(".complete").text(downloadedSize);
        fileProgressContainer.find(".file-progress").val(fileProgress);
    }
};


String.prototype.translit = function () {

    var transl = new Array();
    transl['А'] = 'A';
    transl['а'] = 'a';
    transl['Б'] = 'B';
    transl['б'] = 'b';
    transl['В'] = 'V';
    transl['в'] = 'v';
    transl['Г'] = 'G';
    transl['г'] = 'g';
    transl['Д'] = 'D';
    transl['д'] = 'd';
    transl['Е'] = 'E';
    transl['е'] = 'e';
    transl['Ё'] = 'Yo';
    transl['ё'] = 'yo';
    transl['Ж'] = 'Zh';
    transl['ж'] = 'zh';
    transl['З'] = 'Z';
    transl['з'] = 'z';
    transl['И'] = 'I';
    transl['и'] = 'i';
    transl['Й'] = 'J';
    transl['й'] = 'j';
    transl['К'] = 'K';
    transl['к'] = 'k';
    transl['Л'] = 'L';
    transl['л'] = 'l';
    transl['М'] = 'M';
    transl['м'] = 'm';
    transl['Н'] = 'N';
    transl['н'] = 'n';
    transl['О'] = 'O';
    transl['о'] = 'o';
    transl['П'] = 'P';
    transl['п'] = 'p';
    transl['Р'] = 'R';
    transl['р'] = 'r';
    transl['С'] = 'S';
    transl['с'] = 's';
    transl['Т'] = 'T';
    transl['т'] = 't';
    transl['У'] = 'U';
    transl['у'] = 'u';
    transl['Ф'] = 'F';
    transl['ф'] = 'f';
    transl['Х'] = 'X';
    transl['х'] = 'x';
    transl['Ц'] = 'C';
    transl['ц'] = 'c';
    transl['Ч'] = 'Ch';
    transl['ч'] = 'ch';
    transl['Ш'] = 'Sh';
    transl['ш'] = 'sh';
    transl['Щ'] = 'Shh';
    transl['щ'] = 'shh';
    transl['Ъ'] = '"';
    transl['ъ'] = '"';
    transl['Ы'] = 'Y\'';
    transl['ы'] = 'y\'';
    transl['Ь'] = '\'';
    transl['ь'] = '\'';
    transl['Э'] = 'E\'';
    transl['э'] = 'e\'';
    transl['Ю'] = 'Yu';
    transl['ю'] = 'yu';
    transl['Я'] = 'Ya';
    transl['я'] = 'ya';

    var buffer = [];
    for (var i = 0, j = this.length; i < j; i++) {
        var letter = this[i];
        buffer.push(transl[letter] ? transl[letter] : letter);
    }
    return buffer.join("");
}

Math.roundTo = function (number, precision) {
    var multiplier = Math.pow(10, precision);
    return Math.round(number * multiplier) / multiplier;
}

