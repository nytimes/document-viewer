DV.Schema.states.ViewSearch = {

  enter: function(sourceState){
    this.dragReporter.unBind();
    this.elements.window.scrollTop(0);

    if(this.elements.searchInput.val() == ''){
      this.elements.searchInput.val(searchRequest);
    }else{
      var searchRequest = this.elements.searchInput.val();
    }

    this.helpers.getSearchResponse(searchRequest);
    this.acceptInput.deny();
    return true;
  },
  ViewSearch: function(){
    this.helpers.toggleContent('viewSearch');

    return true;
  },
  exit: function(destinationState){
    this.elements.searchInput.val('');
    this.helpers.cleanUpSearch();
    return true;
  }
};