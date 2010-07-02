DV.Schema.states.ViewAnnotation = {
  enter: function(sourceState){
    this.elements.window.scrollTop(0);
    this.activeAnnotationId = null;
    this.acceptInput.deny();
    // Nudge IE to force the annotations to repaint.
    if (jQuery.browser.msie) {
      this.elements.annotations.css({zoom : 0});
      this.elements.annotations.css({zoom : 1});
    }
    return true;
  },
  ViewAnnotation: function(){

    this.helpers.toggleContent('viewAnnotations');
    this.compiled.next();


    return true;
  },
  exit: function(destinationState){
    this.helpers.resetNavigationState();
    this.activeAnnotationId = null;
    return true;
  }
};