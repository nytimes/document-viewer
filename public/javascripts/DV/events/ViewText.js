DV.Schema.events.ViewText = {
  next: function(e){
    var nextPage = this.models.document.nextPage();
    this.loadText(nextPage);
    
    DV.history.save('text/p'+(nextPage+1));
  },
  previous: function(e){
    var previousPage = this.models.document.previousPage();
    this.loadText(previousPage);

    DV.history.save('text/p'+(previousPage+1));

  },
  search: function(e){
    e.preventDefault();
    this.states.ViewSearch();

    return false;
  }
};