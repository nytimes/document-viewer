// This manages events for different states activated through DV interface actions like clicks, mouseovers, etc.
DV.Schema.events = {
  // Change zoom level and causes a reflow and redraw of pages.
  zoom: function(zoomLevel){
    this.application.pageSet.zoom({ zoomLevel: zoomLevel });

    // Adjust the drag sensativity for largest zoom level
    var ranges = this.application.models.document.ZOOM_RANGES;
    if(ranges[ranges.length-1] == zoomLevel){
      this.application.dragReporter.sensativity = 1.5;
    }else{
      this.application.dragReporter.sensativity = 1;
    }
  },

  // Draw (or redraw) the visible pages on the screen.
  drawPages: function() {
    if (DV.controller.state != 'ViewDocument') return;
    var doc           = this.models.document;
    var offsets       = doc.baseHeightsPortionOffsets;
    var scrollPos     = this.application.scrollPosition = this.elements.window[0].scrollTop;

    var currentPage   = _.sortedIndex(offsets, scrollPos);
    if (offsets[currentPage] == scrollPos) currentPage++;
    var currentIndex  = currentPage - 1;
    var pageIds       = this.helpers.sortPages(currentIndex);



    var total         = doc.totalPages;
    if (doc.currentPage() != currentPage) doc.setPageIndex(currentIndex);

    if (currentPage === 1)     return this.drawFirstPage(pageIds);
    if (currentPage === total) return this.drawLastPage(pageIds);
                               return this.drawPageAt(pageIds, currentIndex);
  },

  // Draw the first page of the document.
  drawFirstPage : function(pageIds) {
    this.application.pageSet.draw(
      [ { label: pageIds[0], index: 0, currentPage: true },
        { label: pageIds[1], index: 1 },
        { label: pageIds[2], index: 2 } ]
    );

  },

  // Draw the final page of the document.
  drawLastPage : function(pageIds) {
    var i = this.models.document.totalPages - 1;
    this.application.pageSet.draw(
      [ { label: pageIds[0], index: i-1 },
        { label: pageIds[1], index: i, currentPage: true } ]
    );
  },

  // Draw the page at the given index.
  drawPageAt : function(pageIds, index) {
    this.application.pageSet.draw(
      [ { label: pageIds[0], index: index - 1 },
        { label: pageIds[1], index: index, currentPage: true },
        { label: pageIds[2], index: index + 1 } ]
    );
  },

  check: function(){
    var application = this.application;
    if(application.busy === false){
      application.busy = true;

      for(var i = 0; i < this.application.observers.length; i++){
        this[application.observers[i]].call(this);
      }
      application.busy = false;
    }
  },

  loadText: function(pageIndex,afterLoad){

    pageIndex = (!pageIndex) ? this.models.document.currentIndex() : parseInt(pageIndex,10);
    this._previousTextIndex = pageIndex;

    var me = this;

    var processText = function(text) {

      var pageNumber = parseInt(pageIndex,10)+1;
      me.handleTextResponse(text);
      me.elements.currentPage.text(pageNumber);
      me.elements.textCurrentPage.text('p. '+(pageNumber));
      me.models.document.setPageIndex(pageIndex);
      me.helpers.setActiveChapter(me.models.chapters.getChapterId(pageIndex));


      if(afterLoad) afterLoad.call(me.helpers);
    };

    if (DV.Schema.text[pageIndex]) {
      return processText(DV.Schema.text[pageIndex]);
    }

    var handleResponse = $j.proxy(function(response) {

      processText(DV.Schema.text[pageIndex] = response);
    }, this);

    $j('#DV-textContents').text('');

    var textURI = DV.Schema.document.resources.page.text.replace('{page}', pageIndex + 1);
    var crossDomain = this.helpers.isCrossDomain(textURI);
    if (crossDomain) textURI += '?callback=?';
    $j[crossDomain ? 'getJSON' : 'get'](textURI, {}, handleResponse);
  },

  handleTextResponse: function(text){
    $j('#DV-textContents').text(text);
  },
  resetTracker: function(){
    this.application.activeAnnotation = null;
    this.trackAnnotation.combined     = null;
    this.trackAnnotation.h            = null;
  },
  trackAnnotation: function(){
    var application     = this.application;
    var helpers         = this.helpers;
    var scrollPosition  = this.elements.window[0].scrollTop;

    if(application.activeAnnotation){
      var annotation      = application.activeAnnotation;
      var trackAnnotation = this.trackAnnotation;


      if(trackAnnotation.id != annotation.id){
        trackAnnotation.id = annotation.id;
        helpers.setActiveAnnotationLimits(annotation);
      }

      if(scrollPosition > trackAnnotation.h || scrollPosition < trackAnnotation.combined){


        annotation.hide(true);
        application.pageSet.setActiveAnnotation(null);
        application.activeAnnotation      = null;
        trackAnnotation.h                 = null;
        trackAnnotation.id                = null;
        trackAnnotation.combined          = null;
      }
    }else{
      application.pageSet.setActiveAnnotation(null);
      application.activeAnnotation      = null;
      trackAnnotation.h                 = null;
      trackAnnotation.id                = null;
      trackAnnotation.combined          = null;
      helpers.removeObserver('trackAnnotation');
    }
  }
};