//----------rx javascript----------
//edition：1.0.0.0 
//work begin date：2018-02-03
//作者：阮旭

//ajax方法 与JQuery的ajax方法基本一致
function ajax(options) {
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.data_type = (options.data_type || "auto").toLowerCase();
    options.data = options.data || {};
    var params = ajax.format_params(options.data, options.is_encryption);
    var xhr;
    //创建 - 第一步
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveObject) {         //IE6及以下
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //连接 和 发送 - 第二步
    if (options.type != "POST") {
        xhr.open(options.type, options.url + (options.url.indexOf("?") != -1 ? "&" : "?") + params, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send();
    }
    else {
        xhr.open(options.type, options.url, true);
        //设置表单提交时的内容类型
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300 || status == 304) {
                switch (options.data_type) {
                    case "auto":
                        if (ajax.text_is_json(xhr.responseText)) {
                            options.success && options.success(JSON.parse(xhr.responseText), xhr.responseXML);
                        }
                        else {
                            options.success && options.success(xhr.responseText, xhr.responseXML);
                        }
                        break;
                    case "text":
                        options.success && options.success(xhr.responseText, xhr.responseXML);
                        break;
                    case "json":
                        options.success && options.success(JSON.parse(xhr.responseText), xhr.responseXML);
                        break;
                    case "xml":
                        alert("XML类型格式化未实现！")
                        break;
                    default:
                        options.success && options.success(xhr.responseText, xhr.responseXML);
                        break;
                }

            } else {
                options.error && options.error(xhr.responseText, xhr.responseXML, status, xhr.statusText);
            }
        }
    }
}

//ajax get 请求
ajax.get = function (url, data, success, is_encryption, data_type, error) {
    data_type = data_type || "auto";
    data = data || {};
    var params = ajax.format_params(data, is_encryption);
    var xhr;

    //创建 - 第一步
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveObject) {         //IE6及以下
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //连接 和 发送 - 第二步
    xhr.open("GET", url + (options.url.indexOf("?") != -1 ? "&" : "?") + params, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(null);

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300 || status == 304) {
                switch (data_type.toLowerCase()) {
                    case "auto":
                        if (ajax.text_is_json(xhr.responseText)) {
                            success && success(JSON.parse(xhr.responseText), xhr.responseXML);
                        }
                        else {
                            success && success(xhr.responseText, xhr.responseXML);
                        }
                        break;
                    case "text":
                        success && success(xhr.responseText, xhr.responseXML);
                        break;
                    case "json":
                        success && success(JSON.parse(xhr.responseText), xhr.responseXML);
                        break;
                    case "xml":
                        alert("XML类型格式化未实现！")
                        break;
                    default:
                        success && success(xhr.responseText, xhr.responseXML);
                        break;
                }

            } else {
                error && error(xhr.responseText, xhr.responseXM, status, xhr.statusText);
            }
        }
    }
}

//ajax post 请求
ajax.post = function (url, data, success, is_encryption, data_type, error) {
    data_type = data_type || "auto";
    data = data || {};
    var params = ajax.format_params(data, is_encryption);
    var xhr;

    //创建 - 第一步
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveObject) {         //IE6及以下
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //连接 和 发送 - 第二步
    xhr.open("POST", url, true);
    //设置表单提交时的内容类型
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(params);

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300 || status == 304) {
                switch (data_type.toLowerCase()) {
                    case "auto":
                        if (ajax.text_is_json(xhr.responseText)) {
                            success && success(JSON.parse(xhr.responseText), xhr.responseXML);
                        }
                        else {
                            success && success(xhr.responseText, xhr.responseXML);
                        }
                        break;
                    case "text":
                        success && success(xhr.responseText, xhr.responseXML);
                        break;
                    case "json":
                        success && success(JSON.parse(xhr.responseText), xhr.responseXML);
                        break;
                    case "xml":
                        alert("XML类型格式化未实现！")
                        break;
                    default:
                        success && success(xhr.responseText, xhr.responseXML);
                        break;
                }

            } else {
                error && error(xhr.responseText, xhr.responseXM, status, xhr.statusText);
            }
        }
    }
}

//ajax put 请求
ajax.put = function (url, data, success, is_encryption, data_type, error) {
    data_type = data_type || "auto";
    data = data || {};
    var params = ajax.format_params(data, is_encryption);
    var xhr;

    //创建 - 第一步
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveObject) {         //IE6及以下
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //连接 和 发送 - 第二步
    xhr.open("PUT", url + (options.url.indexOf("?") != -1 ? "&" : "?") + params, true);
    //设置表单提交时的内容类型
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(null);

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300 || status == 304) {
                switch (data_type.toLowerCase()) {
                    case "auto":
                        if (ajax.text_is_json(xhr.responseText)) {
                            success && success(JSON.parse(xhr.responseText), xhr.responseXML);
                        }
                        else {
                            success && success(xhr.responseText, xhr.responseXML);
                        }
                        break;
                    case "text":
                        success && success(xhr.responseText, xhr.responseXML);
                        break;
                    case "json":
                        success && success(JSON.parse(xhr.responseText), xhr.responseXML);
                        break;
                    case "xml":
                        alert("XML类型格式化未实现！")
                        break;
                    default:
                        success && success(xhr.responseText, xhr.responseXML);
                        break;
                }

            } else {
                error && error(xhr.responseText, xhr.responseXM, status, xhr.statusText);
            }
        }
    }
}

//ajax delete 请求
ajax.delete = function (url, data, success, is_encryption, data_type, error) {
    data_type = data_type || "auto";
    data = data || {};
    var params = ajax.format_params(data, is_encryption);
    var xhr;

    //创建 - 第一步
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveObject) {         //IE6及以下
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //连接 和 发送 - 第二步
    xhr.open("DELETE", url + (options.url.indexOf("?") != -1 ? "&" : "?") + params, true);
    //设置表单提交时的内容类型
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(null);

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300 || status == 304) {
                switch (data_type.toLowerCase()) {
                    case "auto":
                        if (ajax.text_is_json(xhr.responseText)) {
                            success && success(JSON.parse(xhr.responseText), xhr.responseXML);
                        }
                        else {
                            success && success(xhr.responseText, xhr.responseXML);
                        }
                        break;
                    case "text":
                        success && success(xhr.responseText, xhr.responseXML);
                        break;
                    case "json":
                        success && success(JSON.parse(xhr.responseText), xhr.responseXML);
                        break;
                    case "xml":
                        alert("XML类型格式化未实现！")
                        break;
                    default:
                        success && success(xhr.responseText, xhr.responseXML);
                        break;
                }

            } else {
                error && error(xhr.responseText, xhr.responseXM, status, xhr.statusText);
            }
        }
    }
}

//格式化参数
ajax.format_params = function (data, is_encryption) {
    is_encryption = is_encryption || false;
    var arr = [];
    var sign_arr = [];
    for (var name in data) {
        arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        sign_arr.push(name + "=" + data[name]);
    }
    var v = ("v=" + Math.random()).replace(".", "");
    arr.push(v);
    sign_arr.push(v);

    if (is_encryption) {
        arr.push("sign=" + md5(sign_arr.join("")));
    }

    return arr.join("&");
}

//字符串是否是json
ajax.text_is_json = function (text) {
    if (text.trim() == "") return false;
    return (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
    replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
}

/* 用于获取url地址中的参数 */
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

//与C#中的String.Format方法用法一致
String.Format = function (text) {
    for (var i = 1; i < arguments.length; i++) {
        text = text.replace("{" + (i - 1) + "}", arguments[i]);
    }
    return text;
}

//检测是否存在这个id的dom元素,存在会返回该dom元素，不存在会抛出异常或者false【is_throw】
function try_dom_by_id(id, is_throw) {
    is_throw = is_throw || true;
    var obj = document.getElementById(id);
    if (obj == null) {
        if (is_throw) {
            throw String.Format("id:{0} 不存在！", id);
        }
        else {
            return false;
        }
    }
    else {
        return obj;
    }
}

//删除这个dom元素
function remove_element(element) {
    if (element == null || element == undefined)
        throw "remove_element方法的参数element是必须存在的，可以是一个dom对象或者是一个dom对象的id";

    if (typeof (element) == "string") {
        element = try_dom_by_id(element);
    }
    if (element.parentNode != null)
        element.parentNode.removeChild(element);
}

//在ref_element之前添加element
function before_element(element, ref_element) {
    if (element == null || element == undefined)
        throw "before_element方法的参数element是必须存在的，可以是一个dom对象或者是一个dom对象的id";
    else if (ref_element == null || ref_element == undefined)
        throw "before_element方法的参数ref_element是必须存在的，可以是一个dom对象或者是一个dom对象的id";

    if (typeof (element) == "string") {
        element = try_dom_by_id(element);
    }
    if (typeof (ref_element) == "string") {
        ref_element = try_dom_by_id(ref_element);
    }
    ref_element.parentNode.insertBefore(element, ref_element);
}

//在ref_element之后添加element
function after_element(element, ref_element) {
    if (element == null || element == undefined)
        throw "after_element方法的参数element是必须存在的，可以是一个dom对象或者是一个dom对象的id";
    else if (ref_element == null || ref_element == undefined)
        throw "after_element方法的参数ref_element是必须存在的，可以是一个dom对象或者是一个dom对象的id";

    if (typeof (element) == "string") {
        element = try_dom_by_id(element);
    }
    if (typeof (ref_element) == "string") {
        ref_element = try_dom_by_id(ref_element);
    }
    ref_element.parentNode.insertBefore(element, ref_element.nextSibling);
}

//显示一个dom元素
function show_element(element) {
    if (element == null || element == undefined)
        throw "show_element方法的参数element是必须存在的，可以是一个dom对象或者是一个dom对象的id";
    if (typeof (element) == "string") {
        element = try_dom_by_id(element);
    }
    if (element.style.display == "none") {
        element.style.display = "";
    }
}

//隐藏一个dom元素
function hide_element(element) {
    if (element == null || element == undefined)
        throw "hide_element方法的参数element是必须存在的，可以是一个dom对象或者是一个dom对象的id";
    if (typeof (element) == "string") {
        element = try_dom_by_id(element);
    }
    if (element.style.display != "none") {
        element.style.display = "none";
    }
}

//动态切换一个dom元素的显示和隐藏
function toggle_element(element) {
    if (element == null || element == undefined)
        throw "toggle_element方法的参数element是必须存在的，可以是一个dom对象或者是一个dom对象的id";
    if (typeof (element) == "string") {
        element = try_dom_by_id(element);
    }
    if (element.style.display != "none") {
        element.style.display = "none";
    }
    else {
        element.style.display = "";
    }
}

//根据html字符串动态创建一个dom元素,或者dom的数组（一个根节点返回一个dom对象，多个根节点返回dom的数组）
function create_element(html_tag) {
    // 创建一个可复用的包装元素  
    var recycled = document.createElement('div'),
    // 创建标签简易匹配  
    reg = /^<([a-zA-Z]+)(?=\s|\/>|>)[\s\S]*>$/,
    // 某些元素HTML标签必须插入特定的父标签内，才能产生合法元素  
    // 另规避：ie7-某些元素innerHTML只读  
    // 创建这些需要包装的父标签hash  
    hash = {
        'colgroup': 'table',
        'col': 'colgroup',
        'thead': 'table',
        'tfoot': 'table',
        'tbody': 'table',
        'tr': 'tbody',
        'th': 'tr',
        'td': 'tr',
        'optgroup': 'select',
        'option': 'optgroup',
        'legend': 'fieldset'
    };
    // 闭包重载方法（预定义变量避免重复创建，调用执行更快，成员私有化）  
    create_element = function (html_tag) {
        // 若不包含标签，调用内置方法创建并返回元素
        if (!reg.test(html_tag)) {
            return document.createElement(html_tag);
        }
        // hash中是否包含匹配的标签名  
        var tagName = hash[RegExp.$1.toLowerCase()];
        // 若无，向包装元素innerHTML，返回元素  
        if (!tagName) {
            recycled.innerHTML = html_tag;
            return (recycled.children.length > 1 ? recycled.children : recycled.children[0]);
        }
        // 若匹配hash标签，迭代包装父标签，并保存迭代层次  
        var deep = 0, element = recycled;
        do {
            html_tag = '<' + tagName + '>' + html_tag + '</' + tagName + '>';
            deep++;
        }
        while (tagName = hash[tagName]);
        element.innerHTML = html_tag;

        // 根据迭代层次截取被包装的子元素  
        do {
            if (deep == 0) {
                element = element.children;
                break;
            }
            element = element.children[0];
        }
        while (--deep > -1);
        // 最终返回需要创建的元素  
        return (element.length > 1 ? element : element[0]);
    }
    // 执行方法并返回结果  

    return create_element(html_tag);

}

/* 显示加载中弹出层
* parent_tag 弹出层的父容器,可以是一个dom元素或者是dom的id，默认为body
* loading_text 加载中的文本
* is_fade 是否为谈进弹出，默认值true
* background_color 弹出背景颜色，默认值rgba(0,0,0,0.75)
* z_index 默认值100
*/
function show_loading(loading_text, parent_tag, is_fade, background_color, z_index) {
    if (parent_tag == undefined) parent_tag = document.body;
    else if (typeof (parent_tag) == "string") parent_tag = try_dom_by_id(parent_tag);
    loading_text = (loading_text == undefined ? (is_pc() ? "l o a d i n g . . ." : "loading...") : loading_text.toString());
    is_fade = (is_fade == undefined || (typeof (is_fade)).toLowerCase() != "boolean" ? true : is_fade);
    background_color = (background_color == undefined || (typeof (background_color)).toLowerCase() != "string" ? "rgba(0,0,0,0.75)" : background_color.replace(";", ""));
    z_index = (z_index == undefined || parseInt(z_index).toString() == "NaN" ? 100 : z_index);
    var loading_view = create_element(String.Format(
        "<div style='transition:{0}; z_index:{1}; left:0px; top:0px; width:100%; height:100%; opacity:0; cursor:default; -moz-user-select:none;'>{2}</div>",
        (is_fade ? "0.3s" : "0.0s"),
        z_index,
        "<div style='width:15%; height:10%; min-width:48px; min-height:32px; margin:auto; position:relative; top:45%; text-shadow:0px 0px 12px white; font-family:Juice ITC;'><div style='width:48px; height:20px; margin:auto; margin-top:-24px; color:white; text-align:center;'><nobr>" + loading_text + "</nobr></div><div style='width:48px; height:48px; transform:rotate(0deg); text-align:center; transition:120s; line-height:48px; margin:auto; color:white; font-size:3em;' class='load_elm'>↻</div></div>"
        ));
    loading_view.setAttribute("name", "loading_view");
    if (parent_tag.tagName.toLocaleLowerCase() == "body") {
        loading_view.style.position = "fixed";
    }
    else {
        if (parent_tag.style.position != "fixed" && parent_tag.style.position != "absolute" && parent_tag.style.position != "relative") {
            parent_tag.style.position = "relative";
        }
        loading_view.style.position = "absolute";
    }
    parent_tag.appendChild(loading_view);


    setTimeout(function () {
        loading_view.style.backgroundColor = background_color;
        loading_view.style.opacity = "1";
        loading_view.getElementsByClassName("load_elm")[0].style.transform = "rotate(28800deg)";
    }, 20);

    this.hide = function () {
        loading_view.style.opacity = "0";
    }

    this.remove = function () {
        if (parseFloat(loading_view.style.opacity) > 0) {
            this.hide();
            setTimeout(function () {
                remove_element(loading_view);
            }, parseFloat(loading_view.style.transition.replace("s", "")) * 1000)
        }
        else {
            remove_element(loading_view);
        }
    }
}

//关闭【所有的】加载中弹出层
function hide_loading() {
    var views = document.getElementsByName("loading_view");
    for (var i = 0; i < views.length; i++) {
        views[i].style.opacity = "0";
        hide_loading.do_remove(views[i], parseFloat(views[i].style.transition.replace("s", "")) * 1000);
    }
}
hide_loading.do_remove = function (view, times) {
    setTimeout(function () { remove_element(view); }, times);
}

/* 消息提示
* text_or_html 需要显示的文本或者html字符串
* show_times 显示持续的时间，默认是3000毫秒
* show_close 是否显示关闭按钮
* z_index 默认值100
*/
function show_message(text_or_html, show_times, show_close, z_index) {
    text_or_html = text_or_html || "";
    show_close = show_close || false;
    z_index = z_index || 100;
    var message_tag = create_element(String.Format("<div style='max-width:{0} overflow: hidden; text-align:center; padding:12px; font-size:18px; margin:auto; border-radius:16px; color:white; background-color:rgba(0,0,0,0.6); position:fixed; left:0px; top:0px; opacity:0; word-wrap:break-word; box-shadow:0px 0px 3px rgba(0,0,0,1); z-index:{1};'><div style='width:100%; overflow:auto;'>{2}</div>{3}</div>",
        is_pc() ? "480px;" : "95%; max-height:70%;",
        z_index,
        text_or_html,
        show_close ? "<p onclick='remove_element(this.parentNode)' style='background-color:white; border:1px solid black; box-shadow:0px 0px 3px black; text-shadow:0px 0px 3px rgba(0,0,0,0.5); border-radius:50%; width:24px; height:24px; position:absolute; right:4px; top:4px; cursor: pointer;'><b style='color:black; font-size:18px;'>×</b></p>" : ""
        ));
    show_times = ((typeof show_times).toString().toLocaleLowerCase() != "number" ? 3000 : show_times);

    document.body.appendChild(message_tag);
    message_tag.style.left = -message_tag.clientWidth / 2 + "px";
    message_tag.style.marginLeft = "50%";

    setTimeout(function () {
        message_tag.style.transition = "0.4s";
        message_tag.style.top = "80px";
        message_tag.style.opacity = 1;
    }, 20);

    setTimeout(function () {
        message_tag.style.opacity = 0;
        setTimeout(function () {
            remove_element(message_tag);
        }, 400);
    }, show_times);

    return message_tag;
}


//判断设备，pc设备（true），移动设备（false）
function is_pc() {
    var user_agent_info = navigator.userAgent;
    var agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < agents.length; v++) {
        if (user_agent_info.indexOf(agents[v]) > 0) { flag = false; break; }
    }
    return flag;
}

/* js多线程
* 允许当前浏览器窗口分出一个单独执行js的线程
* 不能使用任何js中的全局dom对象与函数（window、document、alert()）
*/
function thread(using_scripts) {
    if (using_scripts != undefined) {
        if (!(using_scripts instanceof Array)) {
            throw 'using_scripts必须是一个数组，元素是字符串（需要引入到线程中的js文件）';
        }
    }
    var all_script_url = using_scripts || [];
    var all_script_code = [];

    for (var i = 0; i < all_script_url.length; i++) {
        if (all_script_url[i] != null && all_script_url[i] != undefined && all_script_url[i].trim() != "") {
            ajax({
                url: all_script_url[i],
                type: "get",
                data: {},
                success: function (data, xml) {
                    all_script_code[all_script_code.length] = data;
                },
                error: function (response_text, xml, status, status_text) {
                    throw ("脚本地址：" + all_script_url[i].src + " ，status：" + status + "，response_text：" + response_text);
                }
            });
        }
    }

    worker = null;//new Worker();
    var alignment = [];
    this.onmessage = null;

    var load_interval = setInterval(function () {
        if (all_script_url.length == all_script_code.length) {
            worker = new Worker(thread.thread_js_url);
            clearInterval(load_interval);

            worker.postMessage(JSON.stringify({
                send_thread_js_url: thread.thread_js_url,
                send_using_scripts: all_script_code
            }));
            for (var i = 0; i < alignment.length; i++) {
                worker.postMessage(alignment[i]);
            }
        }
    }, 100);

    //发送一个委托函数让线程执行
    this.send_delegate = function (delegate) {
        if (!(delegate instanceof Function)) {
            throw '发送的委托必须是一个js方法！';
        }
        delegate = delegate.toString().split("\n");
        if (worker != null) {
            var obj = JSON.stringify({ send_delegate: delegate });
            worker.postMessage(obj);
        }
        else {
            alignment[alignment.length] = '{"send_delegate":' + JSON.stringify(delegate) + '}';
        }
    }

    //关闭并销毁线程
    this.close = function () {
        do_thread.worker.terminate();
    }

    //获取回传的数据,函数参数为data
    this.message = function (fn) {
        if (!(fn instanceof Function)) {
            throw 'fu必须是一个Funtion,参数为data';
        }
        var message_interval = setInterval(function () {
            if (worker != null) {
                worker.onmessage = function (event) {
                    fn(event.data);
                }
            }
            clearInterval(message_interval);
        }, 100);
    }
}
try {
    thread.thread_js_url = document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1].src;
} catch (e) {
    thread.thread_js_url = "";
}
thread.using_script_codes = undefined;
onmessage = function (event) {
    if (event == undefined) return;
    if (ajax.text_is_json(event.data)) {
        var obj = JSON.parse(event.data);
        for (var key in obj) {
            switch (key) {
                case "send_thread_js_url":
                    thread.thread_js_url = obj[key];
                    break;
                case "send_using_scripts":
                    for (var code_index in obj[key]) {
                        thread.using_script_codes = obj[key];
                    }
                    break;
                case "send_delegate":
                    var fun = "";
                    if (thread.using_script_codes != undefined) {
                        for (var code_index = 0; code_index < thread.using_script_codes.length; code_index++) {
                            fun += thread.using_script_codes[code_index] + "\n";
                        }
                    }
                    fun += "\n new ";
                    for (var fun_index in obj[key]) {
                        if (!(obj[key][fun_index] instanceof Function)) {
                            fun += obj[key][fun_index] + "\n";
                        }
                    }
                    eval(fun);
                    break;
            }
        }
    }
}

/* md5加密 */
(function ($) {
    'use strict';
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }
    function binl_md5(x, len) {
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a = 1732584193,
            b = -271733879,
            c = -1732584194,
            d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return md5;
        });
    } else {
        $.md5 = md5;
    }
}(this));

/* html 转码&解码 */
var html_utility = {
    /*1.用浏览器内部转换器实现html转码*/
    html_encode: function (html) {
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
        (temp.textContent != undefined) ? (temp.textContent = html) : (temp.innerText = html);
        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        var output = temp.innerHTML;
        temp = null;
        return output;
    },
    /*2.用浏览器内部转换器实现html解码*/
    html_decode: function (text) {
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
        temp.innerHTML = text;
        //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    }
};