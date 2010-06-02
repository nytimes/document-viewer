(function(){

  var annotationModel = new DV.model(DV.Schema,{
    offsetsAdjustments:     [],
    offsetAdjustmentSum:    0,

    init: function(){
      this.saveCallbacks            = [];
      this.deleteCallbacks          = [];
      this.byId                     = DV.Schema.data.annotationsById;
      this.byPage                   = DV.Schema.data.annotationsByPage;
      this.bySortOrder              = this.sortAnnotations();
      this.annotationLeftPageBuffer = 25;
      this.renderAnnotations();
    },

    render: function(annotation){
      var documentModel             = this.application.models.document;
      var pageModel                 = this.application.models.pages;
      var zoom                      = pageModel.zoomFactor();
      var adata                     = annotation;
      var _default = 0;

      if(adata.type === 'page'){

        adata._y1                   = _default;
        adata._y2                   = _default;
        adata._x1                   = _default;
        adata._x2                   = _default;
        adata.top                   = _default;

      }else{
        adata._y1                   = Math.round(adata.y1 * zoom);
        adata._y2                   = Math.round(adata.y2 * zoom);
        if(adata.x1 < this.annotationLeftPageBuffer){
          adata.x1 = this.annotationLeftPageBuffer;
        }
        adata._x1                   = Math.round(adata.x1 * zoom);
        adata._x2                   = Math.round(adata.x2 * zoom);
        adata.top                   = adata._y1;
      }
      adata.width                   = pageModel.width;
      adata.pageNumber              = adata.page;
      adata.bgWidth                 = adata.width;
      adata.bWidth                  = adata.width - 66;
      adata.excerptWidth            = adata._x2 - adata._x1;
      adata.excerptMarginLeft       = adata._x1 - 27;
      adata.excerptHeight           = adata._y2 - adata._y1;
      adata.index                   = adata.page - 1;
      adata.image                   = pageModel.imageURL(adata.index);
      adata.imageLeft               = adata._x1;
      adata.imageTop                = adata._y1 + 2;
      adata.imageWidth              = pageModel.width;
      adata.imageHeight             = pageModel.height;
      adata.regionLeft              = adata._x1;
      adata.regionWidth             = adata._x2 - adata._x1 ;
      adata.regionHeight            = adata._y2 - adata._y1;
      adata.excerptDSHeight         = adata.excerptHeight - 6;
      adata.DSOffset                = 3;

      adata.orderClass = '';
      if (adata.first == true) adata.orderClass += ' DV-firstAnnotation';
      if (adata.last == true)  adata.orderClass += ' DV-lastAnnotation';

      var template = (adata.type === 'page') ? 'pageAnnotation' : 'annotation';
      return JST[template](adata);
    },

    // Re-sort the list of annotations when its contents change.
    sortAnnotations : function() {
      return this.bySortOrder = _.sortBy(_.values(this.byId), function(anno) {
        return anno.page * 10000 + anno.y1;
      });
    },

    // Renders each annotation into it's HTML format.
    renderAnnotations: function(){
      for (var i=0; i<this.bySortOrder.length; i++) {
        var anno      = this.bySortOrder[i];
        anno.of       = _.indexOf(this.byPage[anno.page - 1], anno);
        anno.position = i + 1;
        anno.first    = (i==0) ? true : false;
        anno.last     = (i==this.bySortOrder.length-1) ? true : false;
        anno.html     = this.render(anno);
      }
      this.renderAnnotationsByIndex();
    },

    // Renders each annotation for the "Annotation List" tab, in order.
    renderAnnotationsByIndex: function(){
      var rendered = _.map(this.bySortOrder, function(anno){ return anno.html; });
      var html     = rendered.join('').replace(/id="DV-annotation-(\d+)"/g, function(match, id) {
        return 'id="DV-listAnnotation-' + id + '" rel="aid-' + id + '"';
      });

      $j('div#DV-annotations').html(html);

      this.renderAnnotationsByIndex.rendered  = true;
      this.renderAnnotationsByIndex.zoomLevel = this.zoomLevel;
      this.updateAnnotationOffsets();
    },

    // Refresh the annotation's title and content from the model, in both
    // The document and list views.
    refreshAnnotation : function(anno) {
      $j('#DV-annotation-' + anno.id + ', #DV-listAnnotation-' + anno.id).each(function() {
        $j('.DV-annotationTitleInput', this).val(anno.title);
        $j('.DV-annotationLabel', this).html(anno.title);
        $j('.DV-annotationTextArea', this).val(anno.text);
        $j('.DV-annotationText', this).html(anno.text);
      });
    },

    // Removes a given annotation from the Annotations model (and DOM).
    removeAnnotation : function(anno) {
      delete this.byId[anno.id];
      var i = anno.page - 1;
      this.byPage[i] = _.without(this.byPage[i], anno);
      this.sortAnnotations();
      $j('#DV-annotation-' + anno.id + ', #DV-listAnnotation-' + anno.id).remove();
      DV.api.redraw(true);
    },

    // Offsets all document pages based on interleaved page annotations.
    updateAnnotationOffsets: function(){
      this.offsetsAdjustments = [];
      // console.time('updateAnnotationOffsets')
      var documentModel         = this.application.models.document;
      // asking for all, but css class .DV-getHeights sets the height to 0 for all annotations besides pageNotes
      // Why do this? To avoid making that loop any more exspensive than it already is
      var pageAnnotations       = $j('div#DV-annotations').find('.DV-annotation');
      var annotationsContainer  = $j('div#DV-annotations');
      if($j('div#DV-docViewer').hasClass('DV-viewAnnotations') == false){
        annotationsContainer.addClass('DV-getHeights');
      }

      // Start with a zero offset, add on as we find pageNotes
      var me          = this;
      var annos       = this.bySortOrder;

      // IE seems to incorrectly calculate outerheight
      var measurement = ($j.browser.msie === true && $j.browser.version == 6) ? 'height' : 'outerHeight';

      $j(pageAnnotations).each(function(n,_el){
        var _height = $j(_el)[measurement]();
        if(_.isNumber(_height) && _height != 0){
          me.offsetsAdjustments[annos[n].pageNumber] = _height;
          me.offsetAdjustmentSum                += _height;
        }

        _height = 0;
      });

      var offset      = 0;
      for(var i = 0,len = documentModel.totalPages; i < len; i++){

        if(me.offsetsAdjustments[i]){
          offset += me.offsetsAdjustments[i];
        }
        me.offsetsAdjustments[i]  = offset;
      }


      annotationsContainer.removeClass('DV-getHeights');
    },

    // When an annotation is successfully saved, fire any registered
    // save callbacks.
    fireSaveCallbacks : function(anno) {
      _.each(this.saveCallbacks, function(c){ c(anno); });
    },

    // When an annotation is successfully removed, fire any registered
    // delete callbacks.
    fireDeleteCallbacks : function(anno) {
      _.each(this.deleteCallbacks, function(c){ c(anno); });
    },

    // Returns the list of annotations on a given page.
    getAnnotations: function(_index){
      return this.byPage[_index];
    },

    getFirstAnnotation: function(){
      return _.first(this.bySortOrder);
    },

    getNextAnnotation: function(currentId) {
      var anno = this.byId[currentId];
      return this.bySortOrder[_.indexOf(this.bySortOrder, anno) + 1];
    },

    getPreviousAnnotation: function(currentId) {
      var anno = this.byId[currentId];
      return this.bySortOrder[_.indexOf(this.bySortOrder, anno) - 1];
    },

    // Get an annotation by id, with backwards compatibility for argument hashes.
    getAnnotation: function(identifier) {
      if (identifier.id) return this.byId[identifier.id];
      if (identifier.index && !identifier.id) throw new Error('looked up an annotation without an id');
      return this.byId[identifier];
    }

  });

  DV.Schema.models.annotations = annotationModel;

}).call(this);
