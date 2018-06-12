/// <reference path="jquery-3.3.1.min.js" />

$(function () {
    var dot = window.location.href.split("#")[1];
    if (dot != undefined) {
        window.scrollTo(0, $("input[name='" + dot + "']").offset().top);
    }
    $("table a").click(function () {
        window.scrollTo(0, $("input[name='" + this.href.split("#")[1] + "']").offset().top);
    });
});