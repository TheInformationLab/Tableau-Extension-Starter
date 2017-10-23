
var getIcons = function() {
  var settings = {
        url : "/api/icons",
        method : "GET"
      }
  $.ajax(settings).done(function (icons) {
    $('#icons').html(icons);
  });
};

var getTemplates = function(callback) {
  var settings = {
        url : "/api/templates",
        method : "GET"
      }
  $.ajax(settings).done(function (templates) {
    var items = "";
    for (var i = 0; i < templates.length; i++) {
      items += '<li class="mdl-menu__item">'+templates[i]+'</li>\n\r'
    }
    $('#template-menu').html(items);
    callback(templates[0]);
  });
};

var onTemplateClick = function() {
  $('ul#template-menu li').click(function(e)
  {
    var settings = {
      "url": "/api/template",
      "method": "POST",
      "headers": {
        "content-type": "application/json"
      },
      "processData": false,
      "data": "{ \"file\": \""+$(this).html()+"\" }"
    }

    $.ajax(settings).done(function (response) {
      populateConfig(response.trex, response.placeholders);
    });
  });
}

var loadFirstTemplate = function(template) {
  var settings = {
    "url": "/api/template",
    "method": "POST",
    "headers": {
      "content-type": "application/json"
    },
    "processData": false,
    "data": "{ \"file\": \""+template+"\" }"
  }

  $.ajax(settings).done(function (response) {
    populateConfig(response.trex, response.placeholders);
  });
}

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

var populateConfig = function(trex, fields) {
  $('#trexHolder').html(trex);
  $('#configForm').html('');
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    field = field.replace('{{','');
    field = field.replace('}}','');
    var fieldArr = field.split('#');
    var label = fieldArr[0].replace('-',' ');
    if (fieldArr[1]) {
      var tooltip = fieldArr[1];
    } else {
      var tooltip = null;
    }
    label = label.toProperCase();
    if (field != 'addin-id' && field != 'icon') {
      var div = document.createElement('div');
      var input = document.createElement('input');
      var lbl = document.createElement('label');
      div.className = "mdl-textfield mdl-js-textfield mdl-textfield--floating-label";
      input.className = "mdl-textfield__input";
      input.setAttribute("type", "text");
      input.setAttribute("id", field);
      div.appendChild(input);
      lbl.className = "mdl-textfield__label";
      lbl.setAttribute('for',field);
      var l = document.createTextNode(label);
      lbl.appendChild(l);
      div.appendChild(lbl);
      componentHandler.upgradeElement(div);
      document.getElementById('configForm').appendChild(div);
      if (tooltip) {
        var ttip = document.createElement('div');
        ttip.className = "mdl-tooltip";
        ttip.setAttribute('for', field);
        var t = document.createTextNode(tooltip);
        ttip.appendChild(t);
        componentHandler.upgradeElement(ttip);
        document.getElementById('configForm').appendChild(ttip);
      }
    } else if (field == '{{icon}}') {

    }
  }
  $("#selected-icon-container").show();
  $(".icon-title").show();
  $("#selected-icon-container").on('click', function() {
    $("#icons").toggle();
  });
  document.getElementById("icons").addEventListener("click", function (e) {
    var target = e.target;
    if (target.classList.contains("iconbutton")) {
      document.getElementById("selected-icon").textContent = target.textContent;
    }
    $("#icons").hide();
  });
}

var displayOutput = function(image) {
  var inputs = $('.mdl-textfield__input');
  var trex = $('#trexHolder').html();
  var company = "org";
  var name = "myextension";
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id == "organisation" && inputs[i].value != '') {
      company = inputs[i].value;
      company = company.toLowerCase();
      company = company.replace(/[^0-9a-zA-Z]/g, '');
    }
    if (inputs[i].id == "name-en_US#Name (in english) for your extension" && inputs[i].value != '') {
      name = inputs[i].value;
      name = name.toLowerCase();
      name = name.replace(/[^0-9a-zA-Z]/g, '');
    }
    trex = trex.replace('{{' + inputs[i].id + '}}', inputs[i].value);
  }
  trex = trex.replace('{{addin-id}}', 'com.' + company + '.extensions.' + name);
  trex = trex.replace('{{icon}}', image);
  $('#trexOutput').text(trex);
  renderCode();
  $('#saveas').click(function() {
    saveAs(name);
  });
  $('#outputCard').show();
}

var renderCode = function() {
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}

var base64Encode = function(str) {
        var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var out = "", i = 0, len = str.length, c1, c2, c3;
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += CHARS.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += CHARS.charAt(c3 & 0x3F);
        }
        return out;
    }

var getIcon = function(file, callback) {
  $.ajax({
      url: "/icons/ic_"+file+"_black_48dp.png",
      type: "GET",
      mimeType: "text/plain; charset=x-user-defined"
  }).done(function( data, textStatus, jqXHR ) {
      callback(base64Encode(data));
  }).fail(function( jqXHR, textStatus, errorThrown ) {
      console.log("get icon fail: " + errorThrown);
  });
}

var saveAs = function(name){
    var a = document.body.appendChild(
        document.createElement("a")
    );
    a.download = name + ".trex";
    a.href = "data:text/xml," + document.getElementById("trexOutput").innerText;
    a.click();
}

$(document).ready(function () {
  getTemplates(function(latest) {
    onTemplateClick();
    loadFirstTemplate('developer-prerelease.trex');
  });
  getIcons();
  $('#generate').click(function() {
    getIcon($('#selected-icon').html(), function(base64) {
      displayOutput(base64);
    });
  });
});
