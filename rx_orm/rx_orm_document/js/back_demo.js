/// <reference path="jquery-3.3.1.min.js" />

$(function () {
    try {
        var dot = window.location.href.split("#")[1].split("?")[0];
        if (dot != undefined) {
            window.scrollTo(0, $("input[name='" + dot + "']").offset().top);
        }
    } catch (e) {}
    
    $("table a").click(function () {
        window.scrollTo(0, $("input[name='" + this.href.split("#")[1] + "']").offset().top);
    });
    
    $("a").click(function () {
        if ($(this).attr("href").indexOf("?") == -1) {
            $(this).attr("href", $(this).attr("href") + "?v=" + parseInt(Math.random() * 10000000))
        }
        else {
            $(this).attr("href", $(this).attr("href").split("?")[0] + "?v=" + parseInt(Math.random() * 10000000))
        }
    });
});