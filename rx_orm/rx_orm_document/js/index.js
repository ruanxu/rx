/// <reference path="jquery-3.3.1.min.js" />

$(function () {
    $("#main").height(window.innerHeight);
    window.onresize = function () { $("#main").height(window.innerHeight); };
 
});

function slide_toggle(obj) {
    $(obj).parent().find("ul").slideToggle(300);
}