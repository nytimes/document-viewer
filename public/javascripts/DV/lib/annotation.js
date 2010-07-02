DV.Annotation = DV.Class.extend({

  init: function(argHash){
    this.position     = { top: argHash.top, left: argHash.left };
    this.dimensions   = { width: argHash.width, height: argHash.height };
    this.page         = argHash.page;
    this.pageEl       = argHash.pageEl;
    this.annotationContainerEl = argHash.annotationContainerEl;
    this.application  = this.page.set.application;
    this.annotationEl = null;
    this.renderedHTML = argHash.renderedHTML;
    this.type         = argHash.type;
    this.id           = argHash.id;
    this.model        = this.application.models.annotations.getAnnotation(this.id);
    this.state        = 'collapsed';
    this.active       = false;
    this.remove();
    this.add();

    if(argHash.active){
      this.application.helpers.setActiveAnnotationLimits(this);
      this.application.events.resetTracker();
      this.active = null;
      // this.application.elements.window[0].scrollTop += this.annotationEl.offset().top;
      this.show();
      if (argHash.showEdit) this.showEdit();
    }
  },

  // Add annotation to page
  add: function(){
    if(this.type === 'page'){
      this.annotationEl = this.renderedHTML.insertBefore(this.annotationContainerEl);
    }else{
      if(this.page.annotations.length > 0){
        for(var i = 0,len = this.page.annotations.length;i<len;i++){
          if(this.page.annotations[i].id === this.id){

            return false;
          }else{

            this.annotationEl = this.renderedHTML.appendTo(this.annotationContainerEl);
          }
        }
      }else{

        this.annotationEl = this.renderedHTML.appendTo(this.annotationContainerEl);
      }
    }
  },

  // Jump to next annotation
  next: function(){
    this.hide.preventRemovalOfCoverClass = true;

    var annotation = this.application.models.annotations.getNextAnnotation(this.id);
    if(!annotation){
      return;
    }

    this.page.set.showAnnotation({ index: annotation.index, id: annotation.id, top: annotation.y1 });
  },

  // Jump to previous annotation
  previous: function(){
    this.hide.preventRemovalOfCoverClass = true;
    var annotation = this.application.models.annotations.getPreviousAnnotation(this.id);
    if(!annotation) {
      return;
    }
    this.page.set.showAnnotation({ index: annotation.index, id: annotation.id, top: annotation.y1 });
  },

  // Show annotation
  show: function(argHash) {


    if (this.application.activeAnnotation && this.application.activeAnnotation.id != this.id) {
      this.application.activeAnnotation.hide();
    }
    this.application.annotationToLoadId = null;
    this.application.elements.window.addClass('DV-coverVisible');

    this.annotationEl.find('div.DV-annotationBG').css({ display: 'block', opacity: 1 });
    this.annotationEl.addClass('DV-activeAnnotation');
    this.page.activeAnnotation          = this;
    this.application.activeAnnotation   = this;

    // Enable annotation tracking to ensure the active state hides on scroll
    this.application.helpers.addObserver('trackAnnotation');
    this.application.helpers.setActiveAnnotationInNav(this.id);
    this.active                         = true;
    this.pageEl.parent('.DV-set').addClass('DV-activePage');
    DV.history.save('document/p'+(parseInt(this.page.index,10)+1)+'/a'+this.id);

    if (argHash && argHash.edit) {
      this.showEdit();
    }
  },

  // Hide annotation
  hide: function(forceOverlayHide){

    if(this.type !== 'page'){
      this.annotationEl.find('div.DV-annotationBG').css({ opacity: 0, display: 'none' });
    }

    if (this.annotationEl.hasClass('DV-editing')) {
      this.application.helpers.saveAnnotation({target : this.annotationEl}, 'onlyIfText');
    }

    this.annotationEl.removeClass('DV-editing DV-activeAnnotation');
    if(forceOverlayHide === true){
      this.application.elements.window.removeClass('DV-coverVisible');
    }
    if(this.hide.preventRemovalOfCoverClass === false || !this.hide.preventRemovalOfCoverClass){
      this.application.elements.window.removeClass('DV-coverVisible');
      this.hide.preventRemovalOfCoverClass = false;
    }

    this.page.activeAnnotation         = null;
    this.application.activeAnnotation  = null;

    // stop tracking this annotation
    this.application.helpers.removeObserver('trackAnnotation');
    this.application.pageSet.setActiveAnnotation(null);
    this.application.activeAnnotation     = null;
    this.application.events.trackAnnotation.h         = null;
    this.application.events.trackAnnotation.id        = null;
    this.application.events.trackAnnotation.combined  = null;


    this.application.helpers.setActiveAnnotationInNav();
    this.active = false;
    this.pageEl.parent('.DV-set').removeClass('DV-activePage');
    // cleanup active state
    this.removeConnector(true);

  },

  // Toggle annotation
  toggle: function(argHash){
    if (this.application.activeAnnotation && (this.application.activeAnnotation != this)){
      this.application.activeAnnotation.hide();
    }

    if(this.type === 'page'){
     return;
    }

    var bg = this.annotationEl.find('div.DV-annotationBG');

    this.annotationEl.toggleClass('DV-activeAnnotation');
    if(this.active == true){
      this.hide(true);
    }else{
      this.show();
    }

  },

  // Show hover annotation state
  drawConnector: function(){
    if(this.active != true){
      this.application.elements.window.addClass('DV-annotationActivated');
      this.annotationEl.addClass('DV-annotationHover');
    }
  },

  // Remove hover annotation state
  removeConnector: function(force){
    if(this.active != true){
      this.application.elements.window.removeClass('DV-annotationActivated');
      this.annotationEl.removeClass('DV-annotationHover');
    }
  },

  // Show edit controls
  showEdit : function() {
    this.annotationEl.addClass('DV-editing');
    $j('.DV-annotationTitleInput', this.annotationEl).focus();
  },

  // Remove the annotation from the page
  remove: function(){

    $j('#DV-annotation-'+this.id).remove();
  }

});