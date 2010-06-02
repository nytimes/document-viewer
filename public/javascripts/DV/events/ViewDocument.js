DV.Schema.events.ViewDocument = {
  next: function(){
    var nextPage = this.models.document.nextPage();
    this.helpers.jump(nextPage);
    
    DV.history.save('document/p'+(nextPage+1));
  },
  previous: function(e){
    var previousPage = this.models.document.previousPage();
    this.helpers.jump(previousPage);

    DV.history.save('document/p'+(previousPage+1));
  },
  search: function(e){
    e.preventDefault();

    this.states.ViewSearch();
    return false;
  }
}  