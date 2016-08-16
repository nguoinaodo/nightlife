'use strict';

var appUrl = window.location.origin;

function ready (fn) {
   if (typeof fn !== 'function') {
      return;
   }

   if (document.readyState === 'complete') {
      return fn();
   }

   document.addEventListener('DOMContentLoaded', fn, false);
}
   
function ajaxRequest (method, url, callback) {
   var xmlhttp = new XMLHttpRequest();

   xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
         callback(JSON.parse(xmlhttp.responseText));
      }
   };

   xmlhttp.open(method, url, true);
   xmlhttp.send();
}

