
const express = require('express');
var port = process.env.PORT || 3000;
var http = require('http'),
    app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

var readTemplate = function (file, callback) {
  fs.readFile("templates/"+file, 'utf8', function(err, trex) {
     if (err) throw err;
     var re = /({{[A-Za-z0-9\-\_\#\s\.\/\:\(\)\?]+}})/g;
     var placeholders = trex.toString().match(re);
     callback(trex, placeholders);
  });
}

var getTemplates = function(callback) {
  fs.readdir("templates/", function(err, files) {
    if (err) throw err;
    callback(files);
  });
};

var getIcons = function(callback) {
  fs.readdir("public/icons/", function(err, files) {
    if (err) throw err;
    callback(files);
  });
};

app.use( bodyParser.json({limit: '5000mb'}) );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({ extended:true, limit: '5000mb', parameterLimit: 10000000}));

app.use('/healthcheck', require('express-healthcheck')());

app.get('/api/templates', function(req, res) {
  getTemplates(function(templates) {
    res.send(templates);
  });
});

app.get('/api/icons', function(req, res) {
  getIcons(function(icons) {
    var list = "";
    for (var i=0; i<icons.length; i++) {
      var icon = icons[i];
      icon = icon.replace('ic_','');
      icon = icon.replace('_black_48dp.png','');
      if (icon.indexOf('.DS_Store') == -1 && icon.indexOf('battery_') == -1 && icon.indexOf('signal_cellular_') == -1 && icon.indexOf('signal_wifi_') == -1) {
        list += '<i class="iconbutton material-icons">'+icon+'</i>';
      }
    }
    res.send(list);
  });
});

app.post('/api/template', function(req, res) {
  readTemplate(req.body.file, function(trex, ph) {
    var resp = {
      trex: trex,
      placeholders: ph
    };
    res.send(resp);
  });
});

app.use(express.static('public'));

app.listen(port, function() {
  console.log("Listening on http://127.0.0.1:3000");
});
