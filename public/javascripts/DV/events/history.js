_.extend(DV.Schema.events, {
  // [document-slug]#document/p[pageID]
  handleHashChangeViewDocumentPage: function(page){
    var pageIndex = parseInt(page,10) - 1;
    if(this.application.state === 'ViewDocument'){
      this.application.pageSet.cleanUp();
      this.helpers.jump(pageIndex);
    }else{
      this.models.document.setPageIndex(pageIndex);
      this.states.ViewDocument();
    }
  },
  // [document-slug]#p=1
  handleHashChangeLegacyViewDocumentPage: function(page){
    var pageIndex   = parseInt(page,10) - 1;
    this.handleHashChangeViewDocumentPage(page);
  },
  // [document-slug]#document/p[pageID]/a[annotationID]
  handleHashChangeViewDocumentAnnotation: function(page,annotation){
    var pageIndex   = parseInt(page,10) - 1;
    var annotation  = parseInt(annotation,10);

    if(this.application.state === 'ViewDocument'){
      this.application.pageSet.showAnnotation(this.application.models.annotations.byId[annotation]);
    }else{
      this.models.document.setPageIndex(pageIndex);
      this.application.pageSet.setActiveAnnotation(annotation);
      this.states.ViewDocument();
    }

  },
  // [document-slug]#annotation/a[annotationID]
  handleHashChangeViewAnnotationAnnotation: function(annotation){

    var annotation  = parseInt(annotation,10);
    var application = this.application;

    if(application.state === 'ViewAnnotation'){
      application.pageSet.showAnnotation(this.application.models.annotations.byId[annotation]);
    }else{
      application.activeAnnotationId = annotation;
      this.states.ViewAnnotation();
    }
  },
  // Default route if all else fails
  handleHashChangeDefault: function(){

    this.application.pageSet.cleanUp();
    this.models.document.setPageIndex(0);

    if(this.application.state === 'ViewDocument'){
      this.helpers.jump(0);
      DV.history.save('document/p1');
    }else{
      this.states.ViewDocument();
    }

  },
  // [document-slug]#text/p[pageID]
  handleHashChangeViewText: function(page){
    var pageIndex = parseInt(page,10) - 1;
    if(this.application.state === 'ViewText'){
      this.events.loadText(pageIndex);
    }else{
      this.models.document.setPageIndex(pageIndex);
      this.states.ViewText();
    }
  },
  // [document-slug]#search/[searchString]
  handleHashChangeViewSearchRequest: function(page,query){
    var pageIndex = parseInt(page,10) - 1;
    this.elements.searchInput.val(decodeURIComponent(query));

    if(this.application.state !== 'ViewSearch'){
      this.models.document.setPageIndex(pageIndex);
    }
    this.states.ViewSearch();
  },
  handleHashChangeViewEntity: function(page, name, offset, length) {
    page = parseInt(page,10) - 1;
    name = decodeURIComponent(name);
    this.elements.searchInput.val(name);
    this.models.document.setPageIndex(page);
    this.states.ViewEntity(name, parseInt(offset, 10), parseInt(length, 10));
  }
});
