(function(){

  var chaptersModel = new DV.model(DV.Schema,{

    init : function() {
      this.loadChapters();
    },

    // Load (or reload) the chapter model from the schema's defined sections.
    loadChapters : function() {
      var chapters = this.chapters = DV.Schema.data.chapters = [];
      _.each(DV.Schema.data.sections, function(sec) {
        sec.id    = sec.id || _.uniqueId();
        var range = sec.pages.split('-');
        var start = parseInt(range[0], 10);
        var end   = parseInt(range[0], 10);
        for (var i=range[0]-1; i<range[1]; i++) chapters[i] = sec.id;
      });
    },

    getChapterId: function(_index){
      return this.chapters[_index];
    },
    getChapterPosition: function(chapterId){
      for(var i = 0,len=this.chapters.length; i < len; i++){
        if(this.chapters[i] === chapterId){
          return i;
        }
      }
    }
  });

  DV.Schema.models.chapters = chaptersModel;

}).call(this);