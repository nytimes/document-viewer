DV.api = {

  // Return the current page of the document.
  currentPage : function() {
    return DV.controller.models.document.currentPage();
  },

  // Return the current zoom factor of the document.
  currentZoom : function() {
    var doc = DV.controller.models.document;
    return doc.zoomLevel / doc.ZOOM_RANGES[1];
  },

  // Return the total number of pages in the document.
  numberOfPages : function() {
    return DV.controller.models.document.totalPages;
  },

  // Change the documents' sections, re-rendering the navigation. "sections"
  // should be an array of sections in the canonical format:
  // {title: "Chapter 1", pages: "1-12"}
  setSections : function(sections) {
    DV.Schema.data.sections = sections;
    DV.controller.models.chapters.loadChapters();
    this.redraw();
  },

  // Get a list of every section in the document.
  getSections : function() {
    return _.clone(DV.Schema.data.sections || []);
  },

  // Get the document's description.
  getDescription : function() {
    return DV.Schema.document.description;
  },

  // Set the document's description and update the sidebar.
  setDescription : function(desc) {
    DV.Schema.document.description = desc;
    $j('#DV-description').remove();
    $j('.DV-navigation').prepend(JST.descriptionContainer({description: desc}));
  },

  // Get the document's related article url.
  getRelatedArticle : function() {
    return DV.Schema.document.resources.related_article;
  },

  // Set the document's related article url.
  setRelatedArticle : function(url) {
    DV.Schema.document.resources.related_article = url;
    $('#DV-storyLink a').attr({href : url});
    $('#DV-storyLink').toggle(!!url);
  },

  // Get the document's title.
  getTitle : function() {
    return DV.Schema.document.title;
  },

  // Set the document's title.
  setTitle : function(title) {
    DV.Schema.document.title = title;
    document.title = title;
  },

  // Set the page text for the given page of a document in the local cache.
  setPageText : function(text, pageNumber) {
    DV.Schema.text[pageNumber - 1] = text;
  },

  // Redraw the UI. Call redraw(true) to also redraw annotations and pages.
  redraw : function(redrawAll) {
    if (redrawAll) DV.controller.models.annotations.renderAnnotations();
    DV.controller.helpers.renderNavigation();
    DV.controller.helpers.renderComponents();
    if (redrawAll) {
      DV.controller.elements.window.removeClass('DV-coverVisible');
      DV.controller.pageSet.buildPages({noNotes : true});
    }
  },

  // Add a new annotation to the document, prefilled to any extent.
  addAnnotation : function(anno) {
    anno = DV.Schema.loadAnnotation(anno);
    DV.controller.models.annotations.sortAnnotations();
    this.redraw(true);
    DV.controller.pageSet.showAnnotation(anno, {active: true, noJump : true, edit : true});
    return anno;
  },

  // Register a callback for when an annotation is saved.
  onAnnotationSave : function(callback) {
    DV.controller.models.annotations.saveCallbacks.push(callback);
  },

  // Register a callback for when an annotation is deleted.
  onAnnotationDelete : function(callback) {
    DV.controller.models.annotations.deleteCallbacks.push(callback);
  },

  // Request the loading of an external CSS file.
  loadCSS : function(url) {
    var link = document.createElement('link');
    $j(link).attr({
      rel:  "stylesheet",
      type: "text/css",
      href: url
    }).appendTo($j('head'));
  },

  // Request the loading of an external JS file.
  loadJS : function(url, callback) {
    $j.getScript(url, callback);
  }

};
