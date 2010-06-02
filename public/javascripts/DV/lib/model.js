// basic model class
DV.model = function(_super,methods){
  this.set('application',_super);  
  if(methods != null){
    this.addMethods(methods);
  }
  if(this.setup){
    this.setup();
  }
};
// Used to add methods to your model
DV.model.prototype.addMethods = function(methods){
  for (var key in methods){
    this.set(key,methods[key]);
  };    
};
// base getter
DV.model.prototype.get = function(attr){
  return this[attr];
};
// base setter
DV.model.prototype.set = function(attr,value){
  if(attr !== 'set' && attr !== 'get' && attr !== 'bind'){
    this[attr] = value;
    return this[attr];    
  }else{
    return false;
  }
};
// Probably dont need this anymore
DV.model.prototype.bind = function(object, method){
  return function() {
    return method.apply(object, arguments);
  };
};

