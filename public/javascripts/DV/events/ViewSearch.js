DV.Schema.events.ViewSearch = {
  next: function(e){
    var nextPage = this.models.document.nextPage();
    this.loadText(nextPage);

  },
  previous: function(e){
    var previousPage = this.models.document.previousPage();
    this.loadText(previousPage);

  },
  search: function(e){
    this.helpers.getSearchResponse(this.elements.searchInput.val());

    return false;
  }
};