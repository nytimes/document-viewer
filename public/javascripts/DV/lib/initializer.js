window.$j = jQuery.noConflict();
window.DV = window.DV || {};

DV.register = function(_name, _instance) {
  if(!window.DV[_name]){
    window.DV[_name] = _instance;
  }
};
// IE6 backgroundImageCache hack
if($j.browser.msie === true && $j.browser.version == 6){
  document.execCommand('BackgroundImageCache', false, true);
}
