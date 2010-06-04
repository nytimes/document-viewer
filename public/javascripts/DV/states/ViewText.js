DV.Schema.states.ViewText = {

  enter: function(sourceState){
    this.dragReporter.unBind();
    this.helpers.resetNavigationState();
    this.elements.window.scrollTop(0);
    this.acceptInput.allow();
    this.pageSet.zoomText();
    return true;
  },
  ViewText: function(){
    this.helpers.toggleContent('viewText');
    this.events.loadText();

    return true;
  },
  exit: function(destinationState){
    this.helpers.resetNavigationState();
    this.elements.collection.width(this.models.pages.width + 110);
    return true;
  }
};