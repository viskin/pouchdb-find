(function ($) {
  'use strict';

  // set up editor
  var snippets = [
    "// The _id field is the primary index\ndb.find({\n  selector: {_id: {$gt: 'a'}},\n  sort: ['_id']\n});",
    "// For other fields, you must create an index first\ndb.createIndex({\n  index: {fields: ['name']}\n}).then(function () {\n  return db.find({\n    selector: {name: {$exists: true}},\n    sort: ['name']\n  });\n});",
    "// Available selectors are $gt, $gte, $lt, $lte, \n// $eq, $ne, $exists, $type, and more\ndb.createIndex({\n  index: {fields: ['debut']}\n}).then(function () {\n  return db.find({\n    selector: {debut: {$gt: 1990}}\n  });\n});",
    "// Multi-field querying is also supported\ndb.createIndex({\n  index: {fields: ['series', 'debut']}\n}).then(function () {\n  return db.find({\n    selector: {series: {$eq: 'Mario'}},\n    sort: [{series: 'desc'}, {debut: 'desc'}]\n  });\n});"
  ];

  var editor = ace.edit("editor");
  editor.setValue(snippets[0]);
  editor.setTheme("ace/theme/xcode");
  var session = editor.getSession();
  session.setMode("ace/mode/javascript");
  session.setTabSize(2);
  var editorDiv = $('#editor');
  editorDiv.addClass('shown');

  // set up pouch
  var template = Handlebars.compile($("#smashers-template").html());
  var div = $('#smashers');

  function updateList(res) {
    div.empty().append(template({smashers: res.docs})).addClass('shown');
  }

  function showError(err) {
    div.empty().append($('<pre/>').append(err.stack)).addClass('shown');
  }

  var smashers = [
    { name: 'Mario', _id: 'mario', rank: 5, series: 'Mario', debut: 1981 },
    { name: 'Jigglypuff', _id: 'puff', rank: 8, series: 'Pokemon', debut: 1996 },
    { name: 'Link', rank: 10, _id: 'link', series: 'Zelda', debut: 1986 },
    { name: 'Donkey Kong', rank: 7, _id: 'dk', series: 'Mario', debut: 1981 },
    { name: 'Pikachu', series: 'Pokemon', _id: 'pikachu', rank: 1, debut: 1996 },
    { name: 'Captain Falcon', _id: 'falcon', rank: 4, series: 'F-Zero', debut: 1990 },
    { name: 'Luigi', rank: 11, _id: 'luigi', series: 'Mario', debut: 1983 },
    { name: 'Fox', _id: 'fox', rank: 3, series: 'Star Fox', debut: 1993 },
    { name: 'Ness', rank: 9, _id: 'ness', series: 'Earthbound', debut: 1994 },
    { name: 'Samus', rank: 12, _id: 'samus', series: 'Metroid', debut: 1986 },
    { name: 'Yoshi', _id: 'yoshi', rank: 6, series: 'Mario', debut: 1990 },
    { name: 'Kirby', _id: 'kirby', series: 'Kirby', rank: 2, debut: 1992 }
  ];
  var db = new PouchDB('smashers');
  db.info().then(function (info) {
    if (info.update_seq === 0) {
      return db.bulkDocs(smashers); // initial DB
    }
  }).then(function () {
    return eval(snippets[0]);
  }).then(updateList);

  // set up buttons
  $('.sortable').each(function (i, btn) {
    $(btn).click(function () {
      editor.setValue(snippets[i]);
      $('.sortable').each(function (j, otherBtn) {
        $(otherBtn).toggleClass('btn-selected', i === j);
      });
    });
  });

  // set up "Run code"

  $('.run-code').click(function () {
    div.removeClass('shown');
    setTimeout(function () {
      var promise = eval(editor.getValue());
      promise.then(updateList).catch(showError);
    }, 200);
  });

})(jQuery);