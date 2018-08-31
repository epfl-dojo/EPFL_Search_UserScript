// ==UserScript==
// @name        EPFL Search
// @namespace   none
// @description A script to improve browsing on search.epfl.ch
// @include     https://search.epfl.ch/*
// @version     0.2
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @require     https://code.jquery.com/jquery-3.3.1.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @downloadURL https://raw.githubusercontent.com/epfl-dojo/EPFL_Search_UserScript/master/EPFL_Search.user.js
// @author      EPFL-dojo
// ==/UserScript==

// Avoid conflicts
this.$ = this.jQuery = jQuery.noConflict(true);

// Handle page/URL changes without a proper reload
// see https://stackoverflow.com/a/17385193/960623
window.addEventListener('hashchange', fireOnNewPage,  false);
waitForKeyElements('.results', appMain);

function fireOnNewPage () {
  if (location.hash.toLowerCase() == '.results') {
    appMain();
  }
}
fireOnNewPage();   //-- Initial run on initial, full page load.

function appMain() {
  $('.result a[href*="https://people.epfl.ch/"]').each(function(i,e){
    profile_url = $(e).attr('href');
    $(e).parent().append('<div style="float: right;">'
                         + '<span class="sciper"></span>'
                         + '<span class="username"></span></div>');
    GM_xmlhttpRequest({
      method: 'GET',
      url: profile_url,
      onload: function(response) {

        var html = $.parseHTML(response.responseText);
        var sciper = $(html).find('a[href*="https://people.epfl.ch/cgi-bin/people?id="]').attr('href').match(/id=([0-9]{6})/)[1];
        if (sciper) {
          $('.sciper', $(e).parent()).html(sciper);
          $('.sciper', $(e).parent()).prepend('#');
        }

        if (!$('div.portrait.no-photo', $(html)).length) {
          var imgLink = 'https://people.epfl.ch//private/common/photos/links/' + sciper;
          $(e).parent().prepend('<img class="mugshot" style="margin-right: 10px; max-height: 1.35em;" src="' + imgLink + '">');
        }

        GM_xmlhttpRequest({
          method: 'GET',
          url: 'https://people.epfl.ch/cgi-bin/people?id=' + sciper + '&op=admindata&lang=en&cvlang=',
          onload: function(response) {
            var username = response.responseText.match(/Username: (\w+)\s/)[1];
            if (username) {
              $('.username', $(e).parent()).html(username);
              $('.username', $(e).parent()).prepend('/');
            }
          }
        });
      }
    });
  });
}
