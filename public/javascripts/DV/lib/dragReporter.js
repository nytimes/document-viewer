(function(){
  var dragReporter = function(toWatch,dispatcher,argHash){
    if(!jQuery){
      throw('You need jQuery for the dragReporter!');
      return;
    }
    if(!toWatch || !dispatcher){
      throw('You need jQuery for the dragReporter!');
      return;
    }
    for(var key in argHash){
      this[key] = argHash[key];
    }
    this.dispatcher             = dispatcher;
    this.toWatch                = jQuery(toWatch);
    this.boundReporter          = jQuery.proxy(this.mouseMoveReporter,this);
    this.boundMouseUpReporter   = jQuery.proxy(this.mouseUpReporter,this);
    this.boundMouseDownReporter = jQuery.proxy(this.mouseDownReporter,this);
    this.boundEase              = jQuery.proxy(this.boundEase,this);    

    this.setBinding();
  };
  dragReporter.prototype.pageY                    = null;
  dragReporter.prototype.pageX                    = null;
  dragReporter.prototype.oldPageY                 = 0;  
  dragReporter.prototype.dispatcher               = null;
  dragReporter.prototype.boundReporter            = null;
  dragReporter.prototype.boundMouseUpReporter     = null;
  dragReporter.prototype.boundMouseDownReporter   = null;
  dragReporter.prototype.boundEase                = null;  
  dragReporter.prototype.toWatch                  = null;
  dragReporter.prototype.sensativity              = 1.5;
  dragReporter.prototype.updateTimer              = null;
  dragReporter.prototype.ignoreSelector           = null;
  dragReporter.prototype.dragClassName            = 'DV-dragging';

  dragReporter.prototype.shouldIgnore = function(e) {
    if (!this.ignoreSelector) return false;
    var el = jQuery(e.target);
    return el.parents().is(this.ignoreSelector) || el.is(this.ignoreSelector);
  };

  dragReporter.prototype.mouseUpReporter     = function(e){
    if (this.shouldIgnore(e)) return true;
    e.preventDefault();
    clearInterval(this.updateTimer);        
    // this.boundEase(this.oldPageY-this.pageY);

    this.stop();
  };
  
  dragReporter.prototype.oldPositionUpdater   = function(){
    this.oldPageY = this.pageY;
  };
    
  dragReporter.prototype.stop         = function(){
    this.toWatch.removeClass(this.dragClassName);
    this.toWatch.unbind('mousemove');
  };
  dragReporter.prototype.setBinding         = function(){
    this.toWatch.mouseup(this.boundMouseUpReporter);
    this.toWatch.mousedown(this.boundMouseDownReporter);
  };
  dragReporter.prototype.unBind           = function(){
    this.toWatch.unbind('mouseup',this.boundMouseUpReporter);
    this.toWatch.unbind('mousedown',this.boundMouseDownReporter);
  };
  dragReporter.prototype.destroy           = function(){
    this.unBind();
    this.toWatch = null;
  };
  dragReporter.prototype.mouseDownReporter   = function(e){
     if (this.shouldIgnore(e)) return true;
    e.preventDefault();
    this.pageY    = e.pageY;
    this.pageX    = e.pageX;
    this.oldPageY = e.pageY;    
    
    this.updateTimer = setInterval(jQuery.proxy(this.oldPositionUpdater,this),1200);
    
    this.toWatch.addClass(this.dragClassName);
    this.toWatch.mousemove(this.boundReporter);

  };
  dragReporter.prototype.mouseMoveReporter     = function(e){
    if (this.shouldIgnore(e)) return true;
    e.preventDefault();
    var delta       = Math.round(this.sensativity * (this.pageY - e.pageY));
    var direction   = (delta > 0) ? 'down' : 'up';
    this.pageY      = e.pageY;

    if(delta === 0){
      return;
    }else{
      this.dispatcher({ event: e, delta: delta, direction: direction });
    }
  };

  DV.register('dragReporter',dragReporter);

}).call(this);
