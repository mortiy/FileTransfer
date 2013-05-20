"use strict"

var Sender = function () {

    this.transferId = '';
    this.file = {}; // [File] reference
    this.fileInfo = {}; // [Object] reference
    this.progress = 0;

    this.connectServer();
};

/**
 * Подключение к серверу:
 */
Sender.prototype.connectServer = function(){
    var _this = this;
    // Создаём двоичный веб-сокет клиент:
    this.client = new BinaryClient('ws://' + location.host);
    this.client.on('open', function () {
        UI.Dropbox.init(_this);
    });
}

/**
 * Инициализировать передачу файла
 * @param file Файл для передачи
 */
Sender.prototype.newTransfer = function (file) {
    var _this = this;
    this.file = file;

    // Конвертируем [File] в [Object]:
    this.fileInfo = {
        index : 0,

        // Также у binary-pack проблема с кириллицей, транслитим:
        name : this.file.name.translit(),
        size : this.file.size
    };

    // Создаём окно прогресса передачи:
    UI.createProgressWindow(this.fileInfo);

    // Инициализируем новую передачу:
    // (В binary-pack есть бага с отправкой целых чисел > UINT_MAX
    // Переведём байты в килобайты ( по получению на сервере произведём обратную операцию ):
    var stream = this.client.send({}, {
        command: 'newTransfer',
        fileInfo: {
            name : this.fileInfo.name,
            size : this.fileInfo.size / 1024
        }
    });

    // Слушаем комманды от сервера:
    stream.on("data", function (data) {

        switch (data.command) {

            // Передача инициализирована, получен ай-ди передачи:
            case "transferInitialized":
                _this.setTransferId(data.transferId);
                break;

            // Получатель запросил передачу файла:
            case "requestFile":
                _this.sendFile();
                break;

            // Получен статус передачи файла:
            case "transferStatus":
                _this.updateProgress(data);
                break;
        }

    });
}

/**
 * Сохранить идентификатор передачи и сгенерировать ссылку
 * @param transferId Идентификатор передачи
 */
Sender.prototype.setTransferId = function(transferId){
    this.transferId = transferId;
    $("#transfer-url").val("http://" + location.host + "/file/" + this.transferId);
    console.log("Transfer Id: " + this.transferId);
}

/**
 * Отправить файл:
 */
Sender.prototype.sendFile = function(){

    // Обнуляем прогресс:
    this.progress = 0;

    // Шлём
    var stream = this.client.send(this.file, {
        command: 'sendFile',
        transferId: this.transferId
    });

    stream.on("end", function () {
        console.log("Загрузка завершена!");
    })

}

/**
 * Обновить прогресс передачи файла
 */
Sender.prototype.updateProgress = function(data){

    this.progress += data.rx * 100;
    UI.updateProgress(this.fileInfo, this.progress);
}