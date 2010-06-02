DV.Schema.states.ViewAnnotation = {
  enter: function(sourceState){
    this.elements.window.scrollTop(0);
    this.activeAnnotationId = null;
    this.acceptInput.deny();
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