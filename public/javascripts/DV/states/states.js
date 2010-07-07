DV.Schema.states = {
  // state values
  isFocus:            true,
  // IE activeElement tracker
  activeElement:      null,
  observers:          [],
  windowDimensions:   {},
  scrollPosition:     null,
  checkTimer:         {},
  busy:               false,
  annotationToLoadId: null,
  dragReporter:       null,
  compiled:           {},
  tracker:            {},

  InitialLoad: {
    enter: function(sourceState){
      // If we're in an unsupported browser ... bail.
      if (this.helpers.unsupportedBrowser()) return;

      // Insert the Document Viewer HTML into the DOM.
      this.helpers.renderViewer();
      this.scrollBarWidth = ($j.browser.msie === true) ? 19 : 17;

      // Assign element references.
      this.events.elements = this.helpers.elements = this.elements = new DV.Elements(this.pendingElements);

      // Build the data models
      this.models.document.init();
      this.models.pages.init();
      this.models.chapters.init();
      this.models.annotations.init();

      // Render included components, and hide unused portions of the UI.
      this.helpers.renderComponents();

      // Render chapters and notes navigation:
      this.helpers.renderNavigation();

      // Instantiate pageset and build accordingly
      this.pageSet = new DV.pageSet(this);
      this.pageSet.buildPages();

      // BindEvents
      this.helpers.bindEvents(this);
    },
    InitialLoad: function(){
      this.helpers.positionViewer();
      this.models.document.computeOffsets();
      this.helpers.addObserver('drawPages');
      this.helpers.registerHashChangeEvents();
      this.helpers.handleInitialState();
    },
    exit: function(destinationState){
      this.dragReporter = new DV.dragReporter('#DV-pageCollection',$j.proxy(this.helpers.shift, this), { ignoreSelector: '.DV-annotationRegion,.DV-annotationContent' });
      // Start polling every 100ms
      this.helpers.startCheckTimer();
    }
  }
};
