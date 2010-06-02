(function(){
  // When the next click or keypress happens, anywhere on the screen, hide the
  // element. 'clickable' makes the element and its contents clickable without
  // hiding. The 'onHide' callback runs when the hide fires, and has a chance
  // to cancel it.  
  jQuery.fn.autohide = function(options) {
    var me = this;
    options = _.extend({clickable : null, onHide : null}, options || {});
    me._autoignore = true;
    setTimeout(function(){ delete me._autoignore; }, 0);

    if (!me._autohider) {
      me.forceHide = function(e) {
        if (!e && options.onHide) options.onHide();
        me.hide();

        jQuery(document).unbind('click', me._autohider);
        jQuery(document).unbind('keypress', me._autohider);
        me._autohider = null;
        me.forceHide = null;
      };
      me._autohider = function(e) {        
        if (me._autoignore) return;
        if (options.clickable && (me[0] == e.target || _.include(jQuery(e.target).parents(), me[0]))) return;
        if (options.onHide && !options.onHide(e)) return;
        me.forceHide(e);
      };
      jQuery(document).bind('click', this._autohider);
      jQuery(document).bind('keypress', this._autohider);
    }
  };
 
  jQuery.fn.acceptInput = function(options) {
    var config = { 
      delay:                  1000,
      callback:               null,
      className:              'acceptInput',
      initialStateClassName:  'acceptInput-awaitingActivity',
      typingStateClassName:   'acceptInput-acceptingInput',
      inputClassName:         'acceptInput-textField'
    };

    if (options){
      jQuery.extend(config, options);
    }
    this.editTimer = null;
      
    this.deny = function(){
      this.parent().addClass('stopAcceptingInput');
    };
    
    this.allow = function(){
      this.parent().removeClass('stopAcceptingInput');
    };      

    
    this.each(function(i,el){
      // element-specific code here
      if(jQuery(el).parent().hasClass(config.initialStateClassName)){
        return true;
      }
      el = jQuery(el);
      
      var elWrapped = el.wrap('<span class="'+config.initialStateClassName+'"></span>');
      elWrapped     = elWrapped.parent();
      
      var inputElement = jQuery('<input type="text" class="'+config.inputClassName+'" style="display:none;" />').appendTo(elWrapped);
      
      inputElement.bind('blur',function(){
      
        elWrapped.addClass(config.initialStateClassName).removeClass(config.typingStateClassName);
        inputElement.hide();
        el.show();
               
      });


      inputElement.bind('keyup',function(){
        var val = inputElement.attr('value');
        el.text(val);
        if(config.changeCallBack){
          jQuery.fn.acceptInput.editTimer = setTimeout(config.changeCallBack,500);
        }
      });
      
      inputElement.bind('keydown',function(){
        if(jQuery.fn.acceptInput.editTimer){
          clearTimeout(jQuery.fn.acceptInput.editTimer);
        }
      });

      elWrapped.bind('click', function(){
        if(elWrapped.hasClass('stopAcceptingInput')) return;
        if(elWrapped.hasClass(config.initialStateClassName)){
          
          var autoHider = function(){
            elWrapped.addClass(config.initialStateClassName).removeClass(config.typingStateClassName);
          };

          jQuery(inputElement).autohide({ clickable: true, onHide: $j.proxy(autoHider,this) });
          
          el.hide();
          inputElement.attr('value',el.text()).show()[0].focus();
          inputElement[0].select();
          elWrapped.addClass(config.typingStateClassName).removeClass(config.initialStateClassName);
                    
        }
      });
    });
       
    return this;

  };

}).call(this);
