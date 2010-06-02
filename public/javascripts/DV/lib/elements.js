DV.Elements = DV.Class.extend({
  init: function(elements){
    if(!elements){
      throw('Elements to query must be defined');
      return;
    }
    this.names = [];
    
    if(elements.constructor === Array){
      return this.getElements(elements);
    }else{
      return this.getElement(elements);
    }
  },
  // Get and store an element reference
  getElement: function(elementQuery,force){
    if(this[elementQuery.name] && force === null){
      return;
    }else{
      this[elementQuery.name] = jQuery(elementQuery.query);
      this.names.push(elementQuery.name);
      return this;
    }
  },
  // Get a collection of elements
  getElements: function(querySet,force){
    for (var i = querySet.length - 1; i >= 0; i--){
      this.getElement(querySet[i],force);
    };
    return this;    
  },
  
  // Remove all references and bindings
  destroy: function(){
    for(var i = 0,len=this.names.length; i < len; i++){
      this[this.names[i]].unbind();
      this[this.names[i]].die();      
      delete this[this.names[i]];
    }
    delete this.names;    
  }
});