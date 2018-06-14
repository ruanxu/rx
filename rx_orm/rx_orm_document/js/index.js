/// <reference path="jquery-3.3.1.min.js" />

$(function () {
    $("#frame_content").attr("src", "what_is_rx_orm.html?v=" + parseInt(Math.random() * 10000000));
    $("#main").height(window.innerHeight);
    window.onresize = function () { $("#main").height(window.innerHeight); };

    $("a").click(function () {
        if ($(this).attr("href").indexOf("?") == -1) {
            $(this).attr("href", $(this).attr("href") + "?v=" + parseInt(Math.random() * 10000000))
        }
        else {
            $(this).attr("href", $(this).attr("href").split("?")[0] + "?v=" + parseInt(Math.random() * 10000000))
        }
    });

    var frame_url = get_url_param("frame_url");
    if (frame_url != undefined) {
        $("#frame_content").attr("src", frame_url + "?v=" + parseInt(Math.random() * 10000000));
    }
});

function slide_toggle(obj) {
    $(obj).parent().find("ul").slideToggle(300);
}

function get_url_param(key) {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars[key];
}
