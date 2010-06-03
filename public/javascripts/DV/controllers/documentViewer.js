DV.controller   = new DV.stateMachine(DV.Schema.states,
  {
    events      : DV.Schema.events,
    elements    : DV.Schema.elements,
    helpers     : DV.Schema.helpers,
    models      : DV.Schema.models
  }
);

// The origin function, kicking off the entire documentViewer render.
DV.load = function(documentRep, options) {
  options       = options || {};
  DV.container  = options.container || document.body;
  DV.options    = options;

  // Once we have the JSON representation in-hand, finish loading the viewer.
  var continueLoad = DV.loadJSON = function(json) {
    DV.Schema.importCanonicalDocument(json);
    DV.controller.states.InitialLoad();
    if (options.afterLoad) options.afterLoad();
    if (DV.afterLoad) DV.afterLoad();
  };

  // If we've been passed the JSON directly, we can go ahead,
  // otherwise make a JSONP request to fetch it.
  var jsonLoad = function() {
    if (_.isString(documentRep)) {
      if (documentRep.match(/\.js$/)) {
        $j.getScript(documentRep);
      } else {
        var crossDomain = DV.controller.helpers.isCrossDomain(documentRep);
        if (crossDomain) documentRep = documentRep + '?callback=?';
        $j.getJSON(documentRep, continueLoad);
      }
    } else {
      continueLoad(documentRep);
    }
  };

  // If we're being asked the fetch the templates, load them remotely before
  // continuing.
  if (options.templates) {
    $j.getScript(options.templates, jsonLoad);
  } else {
    jsonLoad();
  }
};

// If the document viewer has been loaded dynamically, allow the external
// script to specify the onLoad behavior.
if (DV.onload) setTimeout(DV.onload, 0);

