_.extend(DV.Schema.helpers,{ 
  showAnnotationEdit : function(e) {
    var annoEl = $j(e.target).closest(this.annotationClassName);
    annoEl.addClass('DV-editing');
    $j('.DV-annotationTextArea', annoEl).focus();
  },
  cancelAnnotationEdit : function(e) {
    var annoEl = $j(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    if (anno.unsaved) {
      this.models.annotations.removeAnnotation(anno);
    } else {
      annoEl.removeClass('DV-editing');
    }
  },
  saveAnnotation : function(e) {
    var annoEl = $j(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    anno.title = $j('.DV-annotationTitleInput', annoEl).val();
    anno.text  = $j('.DV-annotationTextArea', annoEl).val();
    this.models.annotations.refreshAnnotation(anno);
    annoEl.removeClass('DV-editing');
    DV.api.redraw();
    this.models.annotations.fireSaveCallbacks(anno);
  },
  deleteAnnotation : function(e) {
    var annoEl = $j(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    this.models.annotations.removeAnnotation(anno);
    this.models.annotations.fireDeleteCallbacks(anno);
  }  
});