
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

var displayOutput = function() {
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
  $('#trexOutput').text(trex);
  renderCode();
  $('#outputCard').show();
}

var renderCode = function() {
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}

$(document).ready(function () {
  getTemplates(function(latest) {
    onTemplateClick();
    loadFirstTemplate('developer-prerelease.trex');
  });
  $('#generate').click(function() {
    displayOutput();
  });
});
