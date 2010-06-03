 // Renders the navigation sidebar for chapters and annotations.
_.extend(DV.Schema.helpers, {
  renderViewer: function(){
    var doc         = DV.Schema.document;
    var pagesHTML   = this.constructPages();
    var description = (doc.description) ? doc.description : null;
    var storyURL = doc.resources.related_article;

    var headerHTML  = JST.header(
    {
      id          : doc.id,
      search_type : (window.navigator.userAgent.match(/webkit/i)) ? 'search' : 'text',
      story_url   : storyURL,
      title       : doc.title || ''
    });

    var pdfURL   = doc.resources.pdf;
    pdfURL       = pdfURL ? '<a target="_blank" href="' + pdfURL + '">Original Document (PDF)</a>' : '';

    $j(DV.container).html(JST.viewer(
      { pages: pagesHTML,
        header: headerHTML,
        pdf_url: pdfURL,
        story_url: storyURL,
        descriptionContainer: JST.descriptionContainer({ description: description})
      }
    ));
  },
   renderNavigation : function() {
     var chapterViews = [], bolds = [], expandIcons = [], expanded = [], navigationExpander = JST.navigationExpander({}),nav=[],notes = [],chapters = [];

     /* ---------------------------------------------------- start the nav helper methods */
     var getAnnotionsByRange = function(rangeStart, rangeEnd){
       var annotations = [];
       for(var i = rangeStart, len = rangeEnd; i < len; i++){
         if(notes[i]){
           annotations.push(notes[i]);
           nav[i] = '';
         }
       }
       return annotations.join('');
     };

     var createChapter = function(chapter){
       var selectionRule = "#DV-selectedChapter-" + chapter.id + " #DV-chapter-" + chapter.id;

       bolds.push(selectionRule+" .DV-first span.DV-trigger");
       return (JST.chapterNav(chapter));
     };

     var createNavAnnotations = function(annotationIndex){
       var renderedAnnotations = [];
       var annotations = DV.Schema.data.annotationsByPage[annotationIndex];

       for (var j=0; j<annotations.length; j++) {
         var annotation = annotations[j];
         renderedAnnotations.push(JST.annotationNav(annotation));
         bolds.push("#DV-selectedAnnotation-" + annotation.id + " #DV-annotationMarker-" + annotation.id + " span.DV-trigger");
       }
       return renderedAnnotations.join('');
     };
     /* ---------------------------------------------------- end the nav helper methods */

     for(var i = 0,len = this.models.document.totalPages; i < len;i++){
       if(DV.Schema.data.annotationsByPage[i]){
         nav[i]   = createNavAnnotations(i);
         notes[i] = nav[i];
       }
     }

     if(DV.Schema.data.sections.length >= 1){
       for(var i=0; i<DV.Schema.data.sections.length; i++){
         var chapter        = DV.Schema.data.sections[i];
         var range          = chapter.pages.split('-');
         var annotations    = getAnnotionsByRange(range[0]-1,range[1]);
         chapter.pageNumber = range[0];

         if(annotations != ''){
           chapter.navigationExpander       = navigationExpander;
           chapter.navigationExpanderClass  = 'DV-hasChildren';
           chapter.noteViews                = annotations;
           nav[range[0]-1]                  = createChapter(chapter);
         }else{
           chapter.navigationExpanderClass  = 'DV-noChildren';
           chapter.noteViews                = '';
           chapter.navigationExpander       = '';
           nav[range[0]-1]                  = createChapter(chapter);
         }
       }
     }

     // insert and observe the nav
     var navigationView = nav.join('');

     var chaptersContainer = $j('div.DV-chaptersContainer');
     chaptersContainer.html(navigationView);
     chaptersContainer.live('click',this.events.compile('handleNavigation'));
     DV.Schema.data.sections.length || _.size(DV.Schema.data.annotationsById) ?
        chaptersContainer.show() : chaptersContainer.hide();

     $j('#DV-navigationBolds', document.head).remove();
     var boldsContents = bolds.join(", ") + ' { font-weight:bold; color:#000 !important; }';
     var navStylesheet = '<style id="DV-navigationBolds" type="text/css" media="screen,print">\n' + boldsContents +'\n</style>';
     $j('head').append(navStylesheet);
     // cleanup
     chaptersContainer = null;

   },

  // Hide or show all of the comoponents on the page that may or may not be
  // present, depending on what the document provides.
  renderComponents : function() {
    // Hide the overflow of the body, if we're at the top level.
    if (DV.container == document.body) {
      $j(document.body).css({margin : 0, padding : 0, overflow : 'hidden'});
    }

    // Hide annotations, if there are none:
    var showAnnotations = _.any(this.models.annotations.byId);
    $j('#DV-annotationView')[showAnnotations ? 'show' : 'hide']();

    // Hide the searchBox, if it's disabled.
    var showSearch = !!DV.Schema.document.resources.search;
    if (showSearch) this.elements.viewer.addClass('DV-searchable');

    // Hide the entire sidebar, if there are no annotations or sections.
    var showChapters = this.models.chapters.chapters.length > 0;

    // Remove and re-render the nav controls.
    $j('#DV-navControls').remove();
    var navControls = JST.navControls({
      totalPages: DV.Schema.data.totalPages,
      totalAnnotations: DV.Schema.data.totalAnnotations
    });

    $j('#DV-well .DV-navControlsContainer').html(navControls);
    $j('#DV-sidebar').show();

    // Set the currentPage element reference.
    this.elements.currentPage = $j('span#DV-currentPage');
    this.models.document.setPageIndex(this.models.document.currentIndex());
  }
});