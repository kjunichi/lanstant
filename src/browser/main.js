var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var path = require('path');
var ipc = require('ipc');
var execsyncs = require('execsyncs');
var exec = require('child_process').exec
var fs = require('fs');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  function updateRunstant(event) {
    var prefFolderPath = process.env.HOME + "/.lanstant";
    var prefFilePath = prefFolderPath + "/update.log";
    var updateInfo;

    // ~/.lanstant/update.logの確認
    try {
      updateInfo = fs.readFileSync(prefFilePath,{encoding:'utf-8'});
      event.sender.send('doneUpdateRunstant', 'ok');
    } catch (err) {
      console.log(err);
      if(err.code === "ENOENT") {
        // 初期設定ファイルが存在しない場合、DLする。

        // ~/.lanstantディレクトリの作成をする
        try {
          fs.mkdirSync(prefFolderPath);
        } catch(err) {
          // 既にディレクトリが存在していても無視する。
          if(err.code != "EEXIST") {
            console.log(err);
          }
        }
        // リソースの取得シェルを実行する
        var buildShellPath = path.resolve(__dirname, '..', '..', 'static','bin', 'build.sh');
        exec(buildShellPath,function(err,stdout,stderr){
          // ~/.lanstant/update.logを作成する
          try {
            fs.writeFileSync(prefFilePath,new Date(),{encoding:'utf-8'});
          } catch(err) {
            console.log(err);
          }
          // 更新完了を通知する。
          event.sender.send('doneUpdateRunstant', 'ok');
        });
      }
    }
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  var targetPath = path.resolve(__dirname, '..', '..', 'static', 'index.html');
  mainWindow.loadUrl('file://' + targetPath);
  ipc.on("updateRunstant",function(event,arg){
    console.log(arg);
    updateRunstant(event);

    //setTimeout(function() {
    //  event.sender.send('doneUpdateRunstant', 'ok');
    //},50000);
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
