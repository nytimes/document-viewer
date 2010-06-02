DV.Schema.events.ViewAnnotation = {
  next: function(e){
    var application         = this.application;
    var activeAnnotationId  = application.activeAnnotationId;
    var annotationsModel    = this.models.annotations;
    var nextAnnotation      = (activeAnnotationId === null) ?
        annotationsModel.getFirstAnnotation() : annotationsModel.getNextAnnotation(activeAnnotationId);

    if (!nextAnnotation){
      return false;
    }

    application.pageSet.showAnnotation(nextAnnotation);
    this.helpers.setAnnotationPosition(nextAnnotation.position);


  },
  previous: function(e){
    var application         = this.application;
    var activeAnnotationId  = application.activeAnnotationId;
    var annotationsModel    = this.models.annotations;

    var previousAnnotation = (!activeAnnotationId) ?
    annotationsModel.getFirstAnnotation() : annotationsModel.getPreviousAnnotation(activeAnnotationId);
    if (!previousAnnotation){
      return false;
    }

    application.pageSet.showAnnotation(previousAnnotation);
    this.helpers.setAnnotationPosition(previousAnnotation.position);


  },
  search: function(e){
    e.preventDefault();
    this.states.ViewSearch();

    return false;
  }
};