_.extend(DV.Schema.helpers, {
  getSearchResponse: function(query){
    var handleResponse = $j.proxy(function(response){
      this.application.searchResponse = response;
      var hasResults = (response.results.length > 0) ? true : false;

      var text = hasResults ? 'of '+response.results.length + ' ' : ' ';
      $j('span#DV-totalSearchResult').text(text);
      $j('span#DV-searchQuery').text(response.query);
      if (hasResults) {
        DV.history.save('search/p'+response.results[0]+'/'+response.query);
        this.events.loadText(response.results[0] - 1, this.highlightSearchResponses);
      } else {
        this.highlightSearchResponses();
      }
    }, this);

    var failResponse = function() {
      $j('#DV-currentSearchResult').text('Search is not available at this time');
      $j('span#DV-searchQuery').text(query);
      $j('#DV-searchResults').addClass('DV-noResults');
    };

    var searchURI = DV.Schema.document.resources.search.replace('{query}', encodeURIComponent(query));
    if (DV.controller.helpers.isCrossDomain(searchURI)) searchURI += '&callback=?';
    $j.ajax({url : searchURI, dataType : 'json', success : handleResponse, error : failResponse});
  },
  acceptInputCallBack: function(){
    var pageIndex = parseInt(this.elements.currentPage.text(),10) - 1;
    // sanitize input

    pageIndex       = (pageIndex === '') ? 0 : pageIndex;
    pageIndex       = (pageIndex < 0) ? 0 : pageIndex;
    pageIndex       = (pageIndex+1 > this.models.document.totalPages) ? this.models.document.totalPages-1 : pageIndex;
    var pageNumber  = pageIndex+1;

    this.elements.currentPage.text(pageNumber);
    $j('.DV-pageNumberContainer input').val(pageNumber);

    if(this.application.state === 'ViewDocument'){
      DV.history.save('document/p'+pageNumber);
      this.jump(pageIndex);
    }else if(this.application.state === 'ViewText'){
      DV.history.save('text/p'+pageNumber);
      this.events.loadText(pageIndex);
    }

  },
  highlightSearchResponses: function(){

    var application = this.application;
    var response    = application.searchResponse;

    if(!response) return false;

    var results         = response.results;
    var currentResultEl = $j('#DV-currentSearchResult');

    if (results.length == 0){
      currentResultEl.text('No Results');
      $j('#DV-searchResults').addClass('DV-noResults');
    }else{
      $j('#DV-searchResults').removeClass('DV-noResults');
    }
    for(var i = 0; i < response.results.length; i++){
      if(this.models.document.currentPage() === response.results[i]){
        currentResultEl.text('Page ' + (i+1) + ' ');
        break;
      }
    }
    var textContent       = $j('#DV-textContents');
    var currentPageText   = textContent.text();
    var pattern           = new RegExp(response.query,"ig");
    var replacement       = currentPageText.replace(pattern,'<span class="DV-searchMatch">$&</span>');

    textContent.html(replacement);

    var highlightIndex = (application.toHighLight) ? application.toHighLight : 0;
    this.highlightMatch(highlightIndex);

    // cleanup
    currentResultEl = null;
    textContent     = null;

  },
  // Highlight a single instance of an entity on the page. Make sure to
  // convert into proper UTF8 before trying to get the entity length, and
  // then back into UTF16 again.
  highlightEntity: function(offset, length) {
    $j('#DV-searchResults').addClass('DV-noResults');
    var textContent = $j('#DV-textContents');
    var text        = textContent.text();
    var pre         = text.substr(0, offset);
    var entity      = text.substr(offset, length);
    var post        = text.substr(offset + length);
    text            = [pre, '<span class="DV-searchMatch">', entity, '</span>', post].join('');
    textContent.html(text);
    this.highlightMatch(0);
  },

  highlightMatch: function(index){
    var highlightsOnThisPage   = $j('#DV-textContents span.DV-searchMatch');
    if (highlightsOnThisPage.length == 0) return false;
    var currentPageIndex    = this.getCurrentSearchPageIndex();
    var toHighLight         = this.application.toHighLight;

    if(toHighLight){
      if(toHighLight !== false){
        if(toHighLight === 'last'){
          index = highlightsOnThisPage.length - 1;
        }else if(toHighLight === 'first'){
          index = 0;
        }else{
          index = toHighLight;
        }
      }
      toHighLight = false;
    }
    var searchResponse = this.application.searchResponse;
    if (searchResponse) {
      if(index === (highlightsOnThisPage.length)){

        if(searchResponse.results.length === currentPageIndex+1){
          return;
        }
        toHighLight = 'first';
        this.events.loadText(searchResponse.results[currentPageIndex + 1] - 1,this.highlightSearchResponses);

        return;
      }else if(index === -1){
        if(currentPageIndex-1 < 0){
          return  false;
        }
        toHighLight = 'last';
        this.events.loadText(searchResponse.results[currentPageIndex - 1] - 1,this.highlightSearchResponses);

        return;
      }
      highlightsOnThisPage.removeClass('DV-highlightedMatch');
    }

    var match = $j('#DV-textContents span.DV-searchMatch:eq('+index+')');
    match.addClass('DV-highlightedMatch');

    this.elements.window.scrollTo(match.position().top-50,{  axis: 'y' });
    if (searchResponse) searchResponse.highlighted = index;

    // cleanup
    highlightsOnThisPage = null;
    match = null;
  },
  getCurrentSearchPageIndex: function(){
    var searchResponse = this.application.searchResponse;
    if(!searchResponse) {
      return false;
    }
    var docModel = this.models.document;
    for(var i = 0,len = searchResponse.results.length; i<len;i++){
      if(searchResponse.results[i] === docModel.currentPage()){
        return i;
      }
    }
  },
  highlightPreviousMatch: function(e){
    e.preventDefault();
    this.highlightMatch(this.application.searchResponse.highlighted-1);
  },
  highlightNextMatch: function(e){
    e.preventDefault(e);
    this.highlightMatch(this.application.searchResponse.highlighted+1);
  },

  showEntity: function(name, offset, length) {
    $j('span#DV-totalSearchResult').text('');
    $j('span#DV-searchQuery').text(name);
    $j('span#DV-currentSearchResult').text("Searching");
    this.events.loadText(this.models.document.currentIndex(), _.bind(DV.controller.helpers.highlightEntity, DV.controller.helpers, offset, length));
  },
  cleanUpSearch: function(){
    var application = this.application;
    application.searchResponse   = null;
    application.toHighLight      = null;
  }
});