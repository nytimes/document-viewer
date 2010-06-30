(function(){

  // The PageModel represents the set of pages in the document, containing the
  // image sources for each page, and the page proportions.
  var pageModel = new DV.model(DV.Schema, {

    // Real page heights
    pageHeights   : [],

    // In pixels.
    BASE_WIDTH    : 700,
    BASE_HEIGHT   : 906,

    // Factors for scaling from image size to zoomlevel.
    SCALE_FACTORS : {'500': 0.714, '700': 1.0, '800': 0.8, '900': 0.9, '1000': 1.0},

    // For viewing page text.
    TEXT_PADDING  : 100,

    // Initializing the page model guesses at a default pageHeight -- we'll
    // know for sure when the first page image is loaded.
    init: function() {

      this.zoomLevel  = DV.controller.models.document.zoomLevel;
      this.baseWidth  = this.BASE_WIDTH;
      this.baseHeight = this.BASE_HEIGHT;
      this.width      = this.zoomLevel;
      this.height     = this.baseHeight * this.zoomFactor();
      this.numPagesLoaded = 0;

      zoomRanges      = DV.controller.models.document.ZOOM_RANGES;
    },

    // Get the complete image URL for a particular page.
    imageURL: function(index) {
      var url  = DV.Schema.document.resources.page.image;
      var size = this.zoomLevel > this.BASE_WIDTH ? 'large' : 'normal';
      var pageNumber = index + 1;
      if (DV.Schema.document.resources.page.zeropad) pageNumber = this.zeroPad(pageNumber, 5);
      url = url.replace(/\{size\}/, size);
      url = url.replace(/\{page\}/, pageNumber);
      return url;
    },

    zeroPad : function(num, count) {
      var string = num.toString();
      while (string.length < count) string = '0' + string;
      return string;
    },

    // The zoom factor is the ratio of the image width to the baseline width.
    zoomFactor : function() {
      return this.zoomLevel / this.BASE_WIDTH;
    },

    // Resize or zoom the pages width and height.
    resize : function(zoomLevel) {
      if (zoomLevel) {
        if (zoomLevel == this.zoomLevel) return;
        var previousFactor  = this.zoomFactor();
        this.zoomLevel      = zoomLevel || this.zoomLevel;
        var scale           = this.zoomFactor() - previousFactor + 1;
        this.width          = Math.round(this.baseWidth * this.zoomFactor());
        this.height         = Math.round(this.height * scale);
        this.averageHeight  = Math.round(this.averageHeight * scale);
      }
      DV.controller.elements.sets.width(this.zoomLevel);
      DV.controller.elements.collection.css({width : this.width + 110 });
    },

    // TODO: figure out why this isn't working on the demo doc.
    updateHeight: function(image, pageIndex) {
      var h = this.getPageHeight(pageIndex);
      if (h === image.height) return;

      var height = image.height * (this.zoomLevel > this.BASE_WIDTH ? 0.7 : 1.0);
      this.setPageHeight(pageIndex, height);
      this.updateBaseHeightBasedOnAveragePageHeight(image);
      DV.controller.models.document.computeOffsets();
      // DV.controller.pageSet.reflowPages();
      DV.controller.pageSet.simpleReflowPages();
    },

    // Update the base height
    // TODO ... either adjust this or reset it on Zoom.
    updateBaseHeightBasedOnAveragePageHeight: function(image) {
      this.averageHeight = ((this.averageHeight * this.numPagesLoaded) + image.height) / (this.numPagesLoaded + 1);
      this.numPagesLoaded += 1;
      if (this.updateTimeout) clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout($j.proxy(function() {
        this.updateTimeout = null;
        var newAverage = Math.round(this.averageHeight);
        if (Math.abs(newAverage - this.height) > 10) {
          this.height = newAverage;
          this.baseHeight = Math.round(this.height / this.zoomFactor());
        }
      }, this), 500);
    },

    // set the real page height
    setPageHeight: function(pageIndex, pageHeight){
      this.pageHeights[pageIndex] = pageHeight;
    },

    // get the real page height
    getPageHeight: function(pageIndex) {
      var realHeight = this.pageHeights[pageIndex];
      return realHeight ? realHeight * this.zoomFactor() : this.height;
    }

  });

  DV.Schema.models.pages = pageModel;

}).call(this);
