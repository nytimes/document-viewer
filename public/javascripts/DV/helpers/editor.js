_.extend(DV.Schema.helpers,{
  showAnnotationEdit : function(e) {
    var annoEl = $j(e.target).closest(this.annotationClassName);
    annoEl.addClass('DV-editing');
    $j('.DV-annotationTextArea', annoEl).focus();
  },
  cancelAnnotationEdit : function(e) {
    var annoEl = $j(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    $j('.DV-annotationTitleInput', annoEl).val(anno.title);
    $j('.DV-annotationTextArea', annoEl).val(anno.text);
    if (anno.unsaved) {
      this.models.annotations.removeAnnotation(anno);
    } else {
      annoEl.removeClass('DV-editing');
    }
  },
  saveAnnotation : function(e, option) {
    var annoEl = $j(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    if (!anno) return;
    anno.title = $j('.DV-annotationTitleInput', annoEl).val();
    anno.text  = $j('.DV-annotationTextArea', annoEl).val();
    if (option == 'onlyIfText' && (!anno.title || anno.title == 'Untitled Note') && !anno.text) {
      return this.models.annotations.removeAnnotation(anno);
    }
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