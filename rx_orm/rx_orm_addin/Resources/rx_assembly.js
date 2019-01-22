/// <reference path="rx.js" />
/// <reference path="rx_assembly_config.js" />

//table_element可以是一个dom对象或者是一个对象的选择器【必须是一个table】
function rx_table(table_element, setting) {
    if (table_element == undefined || table_element == null) {
        throw "rx_table的参数table_element需要一个table的dom元素或者table的dom元素的选择器！";
    }
    else if (typeof (table_element) == "string") {
        table_element = document.querySelector(table_element);
        if (table_element == null) {
            throw String.Format("rx_table的参数table_element在选择器模式下发现选择器：{0} 不存在！", table_element);
        }
    }
    if (table_element.tagName == undefined || table_element.tagName.toLowerCase() != "table") {
        throw "rx_table的参数table_element必须是一个table的dom元素(<table></table>)！";
    }
    if (setting == undefined) {
        throw "rx_table未设置参数setting！";
    }
    var table = table_element;

    var setting_cache = {};
    for (var key in setting) {
        setting_cache[key] = setting[key];
    }

    setting =
        {
            //指令方法 init|refresh|get_setting|get_page_index|get_page_size
            method: (setting.method == undefined ? "init" : setting.method.toString()),
            //样式配置信息的key
            class_config_key: (setting.class_config_key == undefined ? "default" : setting.class_config_key.toString()),
            //指定ajax请求地址
            url: setting.url == undefined ? null : setting.url.toString(),
            //是否开启查看更多
            is_look_more: (typeof setting.is_look_more != "boolean") ? false : setting.is_look_more,
            //查看更多的页数量
            look_more_num: setting.look_more_num == undefined ? null : parseInt(setting.look_more_num),
            //查看更多数据显示完成执行的事件
            look_more_success: !(setting.look_more_success instanceof Function) ? "function(){}" : setting.look_more_success.toString(),
            //是否开启分页
            page_ination: (typeof setting.page_ination != "boolean") ? false : setting.page_ination,
            //分页页大小集合
            page_list: !(setting.page_list instanceof Array) ? [5, 10, 15, 20, 25] : setting.page_list,
            //默认页大小
            default_page_size: setting.default_page_size != undefined ? 10 : parseInt(setting.default_page_size),
            //rx_table的离线json数据，当有离线数据时不会请求url的异步数据
            table_data: setting.table_data == undefined ? null : setting.table_data,
            //加载中显示的文本，可以是一系列html标签字符串
            loading_msg: setting.loading_msg == undefined ? "Loading......" : setting.loading_msg.toString(),
            //没有查到数据的时候显示的内容，可以一串html字符串
            no_data_msg: setting.no_data_msg == undefined ? "没有数据！" : setting.no_data_msg.toString(),
            //ajax请求的参数，请求方式默认为post，可以使用ajax_method_type进行调整
            data: setting.data == undefined ? {} : setting.data,
            //ajax请求的方式，请求方式默认为post
            ajax_method_type: setting.ajax_method_type == undefined ? "post" : setting.ajax_method_type,
            //列信息参数
            columns: !(setting.columns instanceof Array) ? [] : setting.columns,
            //*****事件参数*****
            //添加头行时执行的事件
            add_head_tr: !(setting.add_head_tr instanceof Function) ? null : setting.add_head_tr.toString(),
            //添加头列时执行的事件
            add_head_th: !(setting.add_head_th instanceof Function) ? null : setting.add_head_th.toString(),
            //添加行时执行的事件
            add_tr: !(setting.add_tr instanceof Function) ? null : setting.add_tr.toString(),
            //添加列时执行的事件
            add_td: !(setting.add_td instanceof Function) ? null : setting.add_td.toString(),
            //数据加载完毕时执行的事件
            load_success: !(setting.load_success instanceof Function) ? null : setting.load_success.toString(),
            //异常时执行的事件
            error: !(setting.error instanceof Function) ? null : setting.error.toString()
        };
    if (setting.columns.length == 0 && table.getAttribute("rx_table") == null) {
        throw "tx_table的setting参数中的columns属性是必须存在的，类型为数组(Array), 元素参考字段：title、html_tag、attr、style、ident！";
    }
    //默认页大小校正
    var reg_num = 0;
    for (var i = 0; i < setting.page_list.length; i++) {
        if (setting.default_page_size == setting.page_list[i]) {
            reg_num++;
            break;
        }
    }
    if (reg_num == 0) setting.default_page_size = setting.page_list[0];
    //页码校正
    setting.data.page_index = setting.data.page_index != undefined ? parseInt(setting.data.page_index) : 0;
    //页大小校正
    setting.data.page_size = setting.data.page_size != undefined ? parseInt(setting.data.page_size) : 10;
    if (table.getAttribute("rx_table") == null) setting.data.page_size = setting.default_page_size;
    //是否正在进行查看更多操作,这个参数是自动解析的，不需要手动传入
    setting.data.look_moreing = (typeof setting.data.look_moreing != "boolean") ? false : setting.data.look_moreing;

    if (table.getAttribute("setting") != null) {
        //初始化就清空setting
        if (setting.method == "init") {
            table.removeAttribute("setting");
        }
            //否则就替换和覆盖
        else {
            var c_setting = JSON.parse(table.getAttribute("setting"));
            for (var item in c_setting) {
                if (item == "data") {
                    for (var data_item in c_setting.data) {
                        if (setting.data[data_item] == undefined || setting.data[data_item] == null) {
                            setting.data[data_item] = c_setting.data[data_item];
                        }
                    }
                }
                else if (item == "columns") {
                    for (var c_index = 0; c_index < c_setting.columns.length; c_index++) {
                        for (var f in c_setting.columns[c_index]) {
                            if (setting.columns[c_index] == undefined)
                                setting.columns[c_index] = {};
                            if (setting.columns[c_index][f] == undefined || setting.columns[c_index][f] == null)
                                setting.columns[c_index][f] = c_setting.columns[c_index][f];
                        }
                    }
                }
                else {
                    if (setting_cache[item] == undefined || setting_cache[item] == null)
                        setting[item] = c_setting[item];
                }
            }
        }
    }
    //查看更多页大小校正
    if (setting.look_more_num == null || setting.look_more_num == undefined) {
        setting.look_more_num = 5;
    }

    //获取class配置
    var class_config = {};
    try {
        class_config = rx_assembly_config.class[setting.class_config_key].rx_table;
    } catch (e) {
        throw "未找到rx组件系列的配置文件，可能是未引入rx_assembly_config.js！";
    }

    table.setAttribute("setting", JSON.stringify(setting));
    if (table.getAttribute("id") == null) table.setAttribute("id", "rx_table_" + parseInt(Math.random() * 100000000));
    var table_id = table.getAttribute("id");

    switch (setting.method) {
        case "init": init(); break;
        case "refresh": refresh(); break;
        case "get_setting":
            return JSON.parse(table.getAttribute("setting"));
            break;
        case "get_page_index":
            return parseInt(document.getElementById(table_id + "_page_index").innerHTML) - 1;
            break;
        case "get_page_size":
            return parseInt(document.getElementById(table_id + "_page_list").value);
            break;
        default:
            throw String.Format("rx_table的参数setting的method属性（指令方法）:{0},未找到！\n-----参考列表-----\n初始化:{1}(默认值)\n刷新:{2}\n获取配置:{3}\n获取页码:{4}\n获取页大小:{5}",
                setting.method, "init", "refresh", "get_setting", "get_page_index", "get_page_size");
    }
    //对象标记
    table.setAttribute("rx_table", "rx_table");

    function init() {
        if (setting.url == null && setting.table_data == null) {
            throw "rx_table的参数setting中的url和table_data属性必须设置其中一个，优先使用table_data！";
        }
        if (setting.page_list.length == 0) throw "rx_table的参数setting中的page_list属性的长度不能为0！";
        for (var i = 0; i < setting.page_list.length; i++) {
            if (setting.page_list[i] % 5 != 0) {
                throw "rx_table的参数setting中的page_list属性中的元素必须是5的倍数！";
            }
        }

        if (class_config.table.trim() != "") {
            for (var i = 0; i < class_config.table.split(" ").length; i++) {
                table.classList.add(class_config.table.split(" ")[i]);
            }
        }
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "0");
        if (setting.page_ination) {
            if (document.getElementById(table_id + "_page_bar") != null) {
                remove_element(document.getElementById(table_id + "_page_bar"));
            }
            var page_list = "";
            for (var i = 0; i < setting.page_list.length; i++) {
                page_list += String.Format("<option {0} value='{1}'>{2}</option>",
                    setting.page_list[i] == setting.default_page_size ? "selected='selected'" : "",
                    setting.page_list[i],
                    setting.page_list[i]);
            }
            var page_bar = String.Format("<table cellspacing='0' cellpadding='0' class='{0}' id='{1}'><thead><tr><th style='width:40%; text-align:left;'>找到<span class='{2}' id='{3}'></span>条 <span style='color:lightgray;'>|</span> 当前第<span class='{4}' id='{5}'>1</span>页 <span style='color:lightgray;'>|</span> 一共<span class='{6}' id='{7}'></span>页 <span style='color:lightgray;'>|</span> 每页显示 <select class='{8}' id='{9}'>{10}</select></th><th style='width:20%; text-align:center;'>跳转至 <input style='width:60px;' type='number' class='{11}' id='{12}' value='1'/> <button type='button' class='{13}' id='{14}'>跳转</button></th><th style='width:40%; text-align:right;'><button style='letter-spacing: -6px; text-indent: -6px;' type='button' class='{15}' id='{16}'>◄◄</button> <button class='{17}' id='{18}' type='button'>◄</button> <span class='{19}' id='{20}'></span> <button class='{21}' id='{22}' type='button'>►</button> <button type='button' style='letter-spacing: -6px; text-indent: -6px;' class='{23}' id='{24}'>►►</button></th></tr></thead></table>",
                class_config.page_bar, table_id + "_page_bar",
                class_config.row_count, table_id + "_row_count",
                class_config.page_index, table_id + "_page_index",
                class_config.page_count, table_id + "_page_count",
                class_config.page_list, table_id + "_page_list", page_list,
                class_config.skip_txt, table_id + "_skip_txt",
                class_config.skip_btn, table_id + "_skip_btn",
                class_config.first_page_btn, table_id + "_first_page_btn",
                class_config.left_page_btn, table_id + "_left_page_btn",
                class_config.page_code, table_id + "_page_code",
                class_config.right_page_btn, table_id + "_right_page_btn",
                class_config.last_page_btn, table_id + "_last_page_btn"
                );
            before_element(create_element(page_bar), table);
        }
        if (setting.is_look_more == true) {
            if (document.getElementById(table_id + "_look_more") != null) {
                remove_element(table_id + "_look_more");
            }
            var look_more = document.createElement("div");
            look_more.setAttribute("id", table_id + "_look_more")
            look_more.setAttribute("class", class_config.look_more)
            var look_more_btn = document.createElement("button");
            look_more_btn.setAttribute("id", table_id + "_look_more_btn")
            look_more_btn.setAttribute("type", "button");
            look_more_btn.style.width = "100%";
            look_more_btn.setAttribute("class", class_config.look_more_btn)
            look_more_btn.innerHTML = "<b>⚡</b> 查看更多...";
            look_more.appendChild(look_more_btn);
            after_element(look_more, table);
        }

        var thead = document.createElement("thead");
        table.innerHTML = "";//清空这个table
        table.appendChild(thead);
        var thead_tr = document.createElement("tr");
        for (var i = 0; i < setting.columns.length; i++) {
            var attr = setting.columns[i].attr != undefined ? setting.columns[i].attr.toString() : "";
            var style = setting.columns[i].style != undefined ? setting.columns[i].style.toString() : "";
            if (setting.columns[i].title != undefined) {
                var th = create_element(String.Format("<th {0} {1} style='{2}'>{3}</th>",
                    attr,
                    (setting.columns[i].ident != undefined ? String.Format("ident='{0}_head'", setting.columns[i].ident.toString()) : ""),
                    style,
                    setting.columns[i].title
                    ));
            }

            thead_tr.appendChild(th);
            //表头列添加事件
            if (setting.add_head_th != null) {
                eval("var change = " + setting.add_head_th);
                change(th, i);
            }
        }
        thead.appendChild(thead_tr);
        //表头行添加事件
        if (setting.add_head_tr != null) {
            eval("var change = " + setting.add_head_tr)
            change(thead_tr);
        }
        if (setting.table_data != null) {
            generate(setting.table_data);
        }
        else if (setting.url != "") {
            ajax_get_json();
        }
    }

    //根据url异步获取json数据
    function ajax_get_json() {
        var tbody = "";
        if (setting.data.look_moreing != true) {
            tbody = table.getElementsByTagName("tbody");
            if (tbody.length > 0) remove_element(tbody[0]);
            tbody = create_element("<tbody><tr style='text-align:center;'><td colspan='" + setting.columns.length + "'><div>" + setting.loading_msg + "</div></td></tr></tbody>");
            table.appendChild(tbody);
        }
        else {
            tbody = table.getElementsByTagName("tbody")[0];
        }
        ajax({
            url: setting.url,
            type: setting.ajax_method_type,
            data: setting.data,
            success: function (data, xml) {
                generate(data);
            },
            error: function (response_text, xml, status, status_text) {
                if (setting.error != null) {
                    eval("var change = " + setting.error)
                    change(response_text, xml, status, status_text);
                }
                else {
                    if (confirm(String.Format("(rx_table)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                        xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            }
        });
    }

    //根据json数据生成table内容
    function generate(json_data) {
        var is_retiredness = false;//是否为离线数据
        if (json_data.row_count == undefined && json_data.rows == undefined) {
            json_data = {
                row_count: json_data.length,
                rows: json_data
            };
        }
        var tbody = table.getElementsByTagName("tbody")[0];
        var rows = json_data.rows;
        var row_count = json_data.row_count;
        var page_count = Math.ceil(row_count / setting.data.page_size); //总页数
        //没有点击查看更多

        if (setting.data.look_moreing != true) {
            tbody.innerHTML = "";
            if (row_count == 0) {
                tbody.appendChild(create_element("<tr><td no_data='no_data' colspan='" + table.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].getElementsByTagName("th").length + "' style='text-align:center;'>" + setting.no_data_msg + "</td></tr>"));
            }
        }

        //当前table中行的总数量，用于查看更多的延伸显示
        var current_table_row_count = tbody.getElementsByTagName("tr").length;
        for (var i = 0; i < rows.length; i++) {
            var new_tr = create_element("<tr></tr>");
            if (setting.columns.length > 0) {
                for (var j = 0; j < setting.columns.length; j++) {
                    var html_tag = setting.columns[j].html_tag == undefined ? "" : setting.columns[j].html_tag.toString();
                    var attr = setting.columns[j].attr == undefined ? "" : setting.columns[j].attr.toString();
                    var style = setting.columns[j].style == undefined ? "" : setting.columns[j].style.toString();
                    var ident = setting.columns[j].ident;
                    new_tr.setAttribute("data", JSON.stringify(rows[i]));
                    for (field in rows[i]) {
                        var reg = new RegExp("{@" + field + "}", "g");
                        if (html_tag != "") html_tag = html_tag.replace(reg, rows[i][field] == null ? "" : rows[i][field]);
                        //替换属性字符串
                        if (attr != "") attr = attr.replace(reg, rows[i][field]);
                        //替换样式字符串
                        if (style != "") style = style.replace(reg, rows[i][field]);
                    }

                    var new_td = create_element("<td " + attr + "></td>");
                    if (style != "") new_td.setAttribute("style", style);
                    if (ident != undefined) new_td.setAttribute("ident", ident);
                    new_td.innerHTML = html_tag;
                    new_tr.appendChild(new_td);
                    //列添加事件
                    if (setting.add_td != null) {
                        eval("var change = " + setting.add_td)
                        change(new_td, j, setting.columns[j].html_tag.replace(new RegExp("{@", "g"), "").replace(new RegExp("}", "g"), ""), i + current_table_row_count);
                    }
                }
            }
            else {
                var j = 0
                for (field in rows[i]) {
                    var new_td = create_element("<td>" + rows[i][field] + "</td>");
                    new_td.setAttribute("field", field);
                    new_tr.appendChild(new_td);
                    //列添加事件
                    if (setting.add_td != null) {
                        eval("var change = " + setting.add_td)
                        change(new_td, j, field, i + current_table_row_count);
                    }
                    j++;
                }
            }
            tbody.appendChild(new_tr)
            //行添加事件
            if (setting.add_tr != null) {
                eval("var change = " + setting.add_tr);
                change(new_tr, i + current_table_row_count, rows[i]);
            }
        }

        //加载与页码相关的所有元素
        if (setting.page_ination) {
            document.getElementById(table_id + "_row_count").innerHTML = " " + row_count + " ";
            document.getElementById(table_id + "_page_index").innerHTML = " " + (setting.data.page_index + 1) + " ";
            document.getElementById(table_id + "_page_count").innerHTML = " " + page_count + " ";
            //page_list翻页事件
            document.getElementById(table_id + "_page_list").onchange = function () {
                var refresh_data = setting.data;
                refresh_data.page_index = 0;
                refresh_data.page_size = this.value;
                rx_table("#" + table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }
            //跳转至按钮翻页事件
            document.getElementById(table_id + "_skip_btn").onclick = function () {
                this.blur();
                var skip_page_num = parseInt(document.getElementById(table_id + "_skip_txt").value);
                var page_count_num = parseInt(document.getElementById(table_id + "_page_count").innerHTML);
                if (skip_page_num > page_count_num) {
                    document.getElementById(table_id + "_skip_txt").value = page_count_num;
                }
                else if (skip_page_num <= 0) {
                    document.getElementById(table_id + "_skip_txt").value = 1;
                }
                else if (parseInt(skip_page_num).toString() == "NaN") {
                    document.getElementById(table_id + "_skip_txt").value = 1;
                }
                var refresh_data = setting.data;
                refresh_data.page_index = parseInt(document.getElementById(table_id + "_skip_txt").value) - 1;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table("#" + table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }
            //page_code翻页事件
            var btn_count = 5; // 最多显示5个按钮
            var begin_page_index = parseInt(document.getElementById(table_id + "_page_index").innerHTML) - 2;
            if (begin_page_index < 2) begin_page_index = 1;
            else if (begin_page_index >= page_count - 4) {
                begin_page_index = page_count - 4;
                if (begin_page_index < 1) begin_page_index = 1;
            }
            var end_page_index = parseInt(document.getElementById(table_id + "_page_index").innerHTML) + parseInt(btn_count / 2);
            if (end_page_index > page_count) end_page_index = page_count;
            else if (end_page_index < btn_count) {
                end_page_index = btn_count;
                if (end_page_index > page_count) end_page_index = page_count;
            }
            document.getElementById(table_id + "_page_code").innerHTML = "";
            for (var i = begin_page_index; i <= end_page_index; i++) {
                var obj = create_element("<button type='button' style='margin-left:1px; margin-right:1px;' value='" + i + "' class='" + class_config.page_code_btn + "'>" + i + "</button>");
                obj.onclick = function () {
                    var refresh_data = setting.data;
                    refresh_data.page_index = parseInt(this.value) - 1;
                    refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                    rx_table("#" + table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
                }
                document.getElementById(table_id + "_page_code").appendChild(obj)
            }
            //首页 尾页 翻页事件
            document.getElementById(table_id + "_first_page_btn").onclick = function () {
                if (setting.data.page_index == 0) return;
                var refresh_data = setting.data;
                refresh_data.page_index = 0;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table("#" + table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }
            document.getElementById(table_id + "_last_page_btn").onclick = function () {
                if (setting.data.page_index >= page_count - 1) return;
                var refresh_data = setting.data;
                refresh_data.page_index = page_count - 1;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table("#" + table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }

            //左 右 翻页事件
            document.getElementById(table_id + "_left_page_btn").onclick = function () {
                if (setting.data.page_index == 0) return;
                var refresh_data = setting.data;
                refresh_data.page_index = setting.data.page_index - 1 <= 0 ? 0 : setting.data.page_index - 1;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table("#" + table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }
            document.getElementById(table_id + "_right_page_btn").onclick = function () {
                if (setting.data.page_index >= page_count - 1) return;
                var refresh_data = setting.data;
                refresh_data.page_index = setting.data.page_index + 1 >= page_count ? page_count - 1 : setting.data.page_index + 1;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table("#" + table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }
        }
        if (setting.is_look_more == true) {
            if (setting.data.look_moreing == true) {
                if (rows.length < setting.look_more_num) {
                    document.getElementById(table_id + "_look_more_btn").innerHTML = "没有更多数据！";
                    document.getElementById(table_id + "_look_more_btn").setAttribute("disabled", "disabled");
                }
                else {
                    document.getElementById(table_id + "_look_more_btn").innerHTML = "<b>⚡</b> 查看更多...";
                    document.getElementById(table_id + "_look_more_btn").removeAttribute("disabled");
                }
                setting.data.look_moreing = false;
                if (setting.look_more_success != null) {
                    eval("var change = " + setting.look_more_success)
                    change(rows, table);
                }
            }
            document.getElementById(table_id + "_look_more_btn").onclick = function () {
                var refresh_data = setting.data;
                setting.data.look_moreing = true;
                refresh_data.page_index = setting.data.page_index;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                refresh_data.current_row_count = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;
                refresh_data.look_more_num = setting.look_more_num;
                refresh_data.look_moreing = setting.data.look_moreing;
                table.setAttribute("setting", JSON.stringify(setting));
                this.setAttribute("disabled", "disabled");
                this.innerHTML = "Loading.....";
                rx_table("#" + table_id, { method: "refresh", data: refresh_data, look_more_num: setting.look_more_num, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }
        }

        var jdata = JSON.parse(table.getAttribute("setting"));
        if (jdata.data.look_moreing == true) jdata.data.look_moreing = false;
        table.setAttribute("setting", JSON.stringify(jdata));

        //数据加载完毕事件
        if (setting.load_success != null) {
            eval("var change = " + setting.load_success);
            change(rows, row_count, page_count);
        }
    }

    //刷新这个rx_table
    function refresh() {
        if (table.getAttribute("rx_table") != "rx_table") {
            throw "这个table并不是rx_table的对象，不能直接进行刷新操作，请先初始化！";
        }

        if (setting.is_look_more == true) {
            document.getElementById(table_id + "_look_more_btn").innerHTML = "<b>⚡</b> 查看更多...";
            document.getElementById(table_id + "_look_more_btn").removeAttribute("disabled");
        }

        if (setting.table_data != null) {
            generate(setting.table_data);
        }
        else if (setting.url != "") {
            ajax_get_json();
        }
    }
}

//select_element可以是一个dom对象或者是一个对象的选择器【必须是一个select】
function rx_combobox(select_element, setting) {
    if (select_element == undefined || select_element == null) {
        throw "rx_combobox的参数select_element需要一个select的dom元素或者select的dom元素的选择器！";
    }
    else if (typeof (select_element) == "string") {
        select_element = document.querySelector(select_element);
        if (select_element == null) {
            throw String.Format("rx_combobox的参数select_element在id模式下发现选择器：{0} 不存在！");
        }
    }
    if (select_element.tagName == undefined || select_element.tagName.toLowerCase() != "select") {
        throw "rx_combobox的参数select_element必须是一个select的dom元素(<select></select>)！";
    }
    if (setting == undefined) {
        throw "rx_combobox未设置参数setting！";
    }
    var combobox = select_element;

    var setting_cache = {};
    for (var key in setting) {
        setting_cache[key] = setting[key];
    }

    setting =
        {
            //指令方法 init|refresh|get_setting
            method: (setting.method == undefined ? "init" : setting.method.toString()),
            //样式配置信息的key
            class_config_key: (setting.class_config_key == undefined ? "default" : setting.class_config_key.toString()),
            //指定ajax请求地址
            url: setting.url == undefined ? null : setting.url.toString(),
            //ajax请求的参数，请求方式默认为post，可以使用ajax_method_type进行调整
            data: setting.data == undefined ? {} : setting.data,
            //ajax请求的方式，请求方式默认为post
            ajax_method_type: setting.ajax_method_type == undefined ? "post" : setting.ajax_method_type,
            //option的value对应的字段
            value_field: setting.value_field == undefined ? null : setting.value_field.toString(),
            //option的text对应的字段
            text_field: setting.text_field == undefined ? null : setting.text_field.toString(),
            //加载中显示的文本
            loading_msg: setting.loading_msg == undefined ? "Loading......" : setting.loading_msg.toString(),
            //change事件
            change: !(setting.change instanceof Function) ? null : setting.change.toString(),
            //数据加载完毕时执行的事件
            load_success: !(setting.load_success instanceof Function) ? null : setting.load_success.toString(),
            //异常时执行的事件
            error: !(setting.error instanceof Function) ? null : setting.error.toString()
        }

    if (combobox.getAttribute("setting") != null) {
        //初始化就清空setting
        if (setting.method == "init") {
            combobox.removeAttribute("setting");
        }
            //否则就替换和覆盖
        else {
            var c_setting = JSON.parse(combobox.getAttribute("setting"));
            for (var item in c_setting) {
                if (item == "data") {
                    for (var data_item in c_setting.data) {
                        if (setting.data[data_item] == undefined || setting.data[data_item] == null) {
                            setting.data[data_item] = c_setting.data[data_item];
                        }
                    }
                }
                else {
                    if (setting_cache[item] == undefined || setting_cache[item] == null)
                        setting[item] = c_setting[item];
                }
            }
        }
    }
    if (setting.method == "init" || setting.method == "refresh") {
        if (setting.url == null)
            throw "rx_combobox在init或者refresh模式下的setting参数的url属性是必填的！";
        if (setting.value_field == null)
            throw "rx_combobox在init或者refresh模式下的setting参数的value_field属性是必填的！";
        if (setting.text_field == null)
            throw "rx_combobox在init或者refresh模式下的setting参数的text_field属性是必填的！";
    }
    //获取class配置
    var class_config = {};
    try {
        class_config = rx_assembly_config.class[setting.class_config_key].rx_combobox;
    } catch (e) {
        throw "未找到rx组件系列的配置文件，可能是未引入rx_assembly_config.js！";
    }

    combobox.setAttribute("setting", JSON.stringify(setting));
    if (combobox.getAttribute("id") == null) combobox.setAttribute("id", "rx_combobox_" + parseInt(Math.random() * 100000000));
    var combobox_id = combobox.getAttribute("id");

    switch (setting.method) {
        case "init": init(); break;
        case "refresh": refresh(); break;
        case "get_setting":
            return JSON.parse(table.getAttribute("setting"));
            break;
        default:
            throw String.Format("rx_combobox的参数setting的method属性（指令方法）:{0},未找到！\n-----参考列表-----\n初始化:{1}(默认值)\n刷新:{2}\n获取配置:{3}",
                setting.method, "init", "refresh", "get_setting");
    }

    //对象标记
    combobox.setAttribute("rx_combobox", "rx_combobox");

    function init() {
        combobox.innerHTML = "";
        if (class_config.select.trim() != "") {
            for (var i = 0; i < class_config.select.split(" ").length; i++) {
                combobox.classList.add(class_config.select.split(" ")[i]);
            }
        }
        ajax_get_json();
    }

    function ajax_get_json() {
        combobox.innerHTML = String.Format("<option>{0}</option>", setting.loading_msg);
        ajax({
            url: setting.url,
            type: setting.ajax_method_type,
            data: setting.data,
            success: function (data, xml) {
                generate(data);
            },
            error: function (response_text, xml, status, status_text) {
                if (setting.error != null) {
                    eval("var change = " + setting.error)
                    change(response_text, xml, status, status_text);
                }
                else {
                    if (confirm(String.Format("(rx_table)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                        xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            }
        });
    }

    function generate(json_data) {
        combobox.innerHTML = "";
        for (var i = 0; i < json_data.length; i++) {
            var op = create_element("<option value='" + json_data[i][setting.value_field] + "'>" + json_data[i][setting.text_field] + "</option>");
            op.setAttribute("item_data", JSON.stringify(json_data[i]));
            combobox.appendChild(op);
        }
        if (setting.change != null) {
            combobox.onchange = function () {
                var item_data = {};
                for (var i = 0; i < this.options.length; i++) {
                    if (this.options[i].getAttribute("value").toString() == this.value.toString()) {
                        item_data = JSON.parse(this.options[i].getAttribute("item_data"));
                    }
                }
                eval("var change =" + setting.change);
                change(item_data, this.selectedIndex, this);
            };
        }

        if (setting.load_success != undefined) {
            eval("var change =" + setting.load_success);
            change(json_data, combobox);
        }
    }

    function refresh() { init(); }
}

//repeater_element可以是任何一个html元素，用法和ASP.NET WebForm中的Repeater控件一致
function rx_repeater(repeater_element, setting) {
    if (repeater_element == undefined || repeater_element == null) {
        throw "rx_repeater的参数repeater_element需要一个dom元素或者是dom元素的选择器！";
    }
    else if (typeof (repeater_element) == "string") {
        repeater_element = document.querySelector(repeater_element);
        if (repeater_element == null) {
            throw String.Format("rx_repeater的参数repeater_element在选择器模式下发现选择器：{0} 不存在！");
        }
    }
    if (setting == undefined) {
        throw "rx_repeater未设置参数setting！";
    }
    var repeater = repeater_element;

    var setting_cache = {};
    for (var key in setting) {
        setting_cache[key] = setting[key];
    }

    setting =
        {
            //指令方法 init|refresh|get_setting
            method: (setting.method == undefined ? "init" : setting.method.toString()),
            //样式配置信息的key
            class_config_key: (setting.class_config_key == undefined ? "default" : setting.class_config_key.toString()),
            //指定ajax请求地址
            url: setting.url == undefined ? null : setting.url.toString(),
            //ajax请求的参数，请求方式默认为post，可以使用ajax_method_type进行调整
            data: setting.data == undefined ? {} : setting.data,
            //ajax请求的方式，请求方式默认为post
            ajax_method_type: setting.ajax_method_type == undefined ? "post" : setting.ajax_method_type,
            //加载中显示的内容，可以是html标签
            loading_msg: setting.loading_msg == undefined ? "Loading......" : setting.loading_msg.toString(),
            //头模版(只会出现一次)
            head: setting.head == undefined ? "" : setting.head.toString(),
            //身体模版（数据有多少条就会出现多少次）
            item: setting.item == undefined ? "" : setting.item.toString(),
            //脚模版(只会出现一次)
            foot: setting.foot == undefined ? "" : setting.foot.toString(),
            //rx_repeater的离线json数据，当有离线数据时不会请求url的异步数据
            repeater_data: setting.repeater_data == undefined ? null : setting.repeater_data,
            //数据的插入模式  替换：replace  之前：before 之后：after
            data_mode: setting.data_mode == undefined ? "replace" : setting.data_mode.toString(),
            //头部添加事件
            add_head: !(setting.add_head instanceof Function) ? null : setting.add_head.toString(),
            //没有查到数据的时候显示的内容，可以一串html字符串
            no_data_msg: setting.no_data_msg == undefined ? "没有数据！" : setting.no_data_msg.toString(),
            //身体添加事件（数据有多少条就会执行多少次）
            add_item: !(setting.add_item instanceof Function) ? null : setting.add_item.toString(),
            //脚步添加事件
            add_foot: !(setting.add_foot instanceof Function) ? null : setting.add_foot.toString(),
            //数据加载完毕时执行的事件
            load_success: !(setting.load_success instanceof Function) ? null : setting.load_success.toString(),
            //数据呈现完毕时执行的事件
            load_complete: !(setting.load_complete instanceof Function) ? null : setting.load_complete.toString(),
            //异常时执行的事件
            error: !(setting.error instanceof Function) ? null : setting.error.toString()
        }

    if (repeater.getAttribute("setting") != null) {
        //初始化就清空setting
        if (setting.method == "init") {
            repeater.removeAttribute("setting");
        }
            //否则就替换和覆盖
        else {
            var c_setting = JSON.parse(repeater.getAttribute("setting"));
            for (var item in c_setting) {
                if (item == "data") {
                    for (var data_item in c_setting.data) {
                        if (setting.data[data_item] == undefined || setting.data[data_item] == null) {
                            setting.data[data_item] = c_setting.data[data_item];
                        }
                    }
                }
                else {
                    if (setting_cache[item] == undefined || setting_cache[item] == null)
                        setting[item] = c_setting[item];
                }
            }
        }
    }

    if (setting.data_mode != "replace" && setting.data_mode != "before" && setting.data_mode != "after") {
        setting.data_mode != "replace";
    }

    if (setting.method == "init" || setting.method == "refresh") {
        if (setting.url == null && setting.data_mode == undefined)
            throw "rx_repeater在init或者refresh模式下的setting参数的url属性是必填的,除非data_mode属性不为replace！";
        if (setting.item == null)
            throw "rx_repeater在init或者refresh模式下的setting参数的item属性是必填的！";
    }

    //获取class配置
    var class_config = {};
    try {
        class_config = rx_assembly_config.class[setting.class_config_key].rx_repeater;
    } catch (e) {
        throw "未找到rx组件系列的配置文件，可能是未引入rx_assembly_config.js！";
    }

    if (repeater.getAttribute("setting") != null) {
        //初始化就清空setting
        if (setting.method == "init") {
            repeater.removeAttribute("setting");
        }
            //否则就替换和覆盖
        else {
            var c_setting = JSON.parse(repeater.getAttribute("setting"));
            for (var item in c_setting) {
                if (item == "data") {
                    for (var data_item in c_setting.data) {
                        if (setting.data[data_item] == undefined || setting.data[data_item] == null) {
                            setting.data[data_item] = c_setting.data[data_item];
                        }
                    }
                }
                else {
                    if (setting[item] == undefined || setting[item] == null)
                        setting[item] = c_setting[item];
                }
            }
        }
    }

    repeater.setAttribute("setting", JSON.stringify(setting));
    if (repeater.getAttribute("id") == null) repeater.setAttribute("id", "rx_repeater_" + parseInt(Math.random() * 100000000));
    var repeater_id = repeater.getAttribute("id");

    switch (setting.method) {
        case "init": init(); break;
        case "refresh": refresh(); break;
        case "get_setting":
            return JSON.parse(table.getAttribute("setting"));
            break;
        default:
            throw String.Format("rx_repeater的参数setting的method属性（指令方法）:{0},未找到！\n-----参考列表-----\n初始化:{1}(默认值)\n刷新:{2}\n获取配置:{3}",
                setting.method, "init", "refresh", "get_setting");
    }

    //对象标记
    repeater.setAttribute("rx_repeater", "rx_repeater");

    function init() {
        if (class_config.repeater.trim() != "") {
            for (var i = 0; i < class_config.repeater.split(" ").length; i++) {
                repeater.classList.add(class_config.repeater.split(" ")[i]);
            }
        }
        ajax_get_json();
    }

    function ajax_get_json() {
        if (setting.data_mode == "replace") repeater.innerHTML = setting.loading_msg;
        if (setting.repeater_data == undefined) {
            ajax({
                url: setting.url,
                type: setting.ajax_method_type,
                data: setting.data,
                success: function (data, xml) {
                    generate(data);
                },
                error: function (response_text, xml, status, status_text) {
                    if (setting.error != null) {
                        eval("var change = " + setting.error)
                        change(response_text, xml, status, status_text);
                    }
                    else {
                        if (confirm(String.Format("(rx_table)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                            alert(response_text);
                        }
                    }
                }
            });
        }
        else {
            generate(setting.repeater_data);
        }

    }

    function generate(json_data) {
        if (json_data.length == 0 && setting.data_mode == "replace") {
            repeater.innerHTML = setting.no_data_msg;
            return;
        }
        repeater.setAttribute("data", JSON.stringify(json_data));
        //头部添加事件，可以在添加前改变head的字符串(head是一个数组，只有一个元素，因为需要进行引用传递)
        var head = [setting.head];
        if (setting.add_head != null) {
            eval("var change =" + setting.add_head);
            change(head);
        }
        var html_text = head != undefined ? head[0] : "";

        //身体部分的代码
        for (var i = 0; i < json_data.length; i++) {
            var item = [setting.item];
            for (field in json_data[i]) {
                var reg = new RegExp("{@" + field + "}", "g");
                item[0] = item[0].replace(reg, json_data[i][field]);
            }
            //身体添加事件，可以在添加前改变item的字符串(item是一个数组，只有一个元素，因为需要进行引用传递)
            if (setting.add_item != null) {
                eval("var change =" + setting.add_item);
                change(item, json_data[i], i);
            }
            html_text += item[0];
        }

        //脚部添加事件，可以在添加前改变foot的字符串(foot是一个数组，只有一个元素，因为需要进行引用传递)
        var foot = [setting.foot]
        if (setting.add_foot != null) {
            eval("var change =" + setting.add_foot);
            change(foot);
        }
        html_text += foot != undefined ? foot[0] : "";

        //数据加载完毕事件，可以改变repeater_inner_text来改变的repeater内部呈现
        //repeater_inner_text是一个数组，只有一个元素，因为需要进行引用传递
        var repeater_inner_text = [html_text];
        if (setting.load_success != null) {
            eval("var change =" + setting.load_success);
            change(repeater_inner_text, json_data);
        }
        switch (setting.data_mode) {
            case "replace":
                repeater.innerHTML = repeater_inner_text[0];
                break;
            case "before":
                repeater.innerHTML = (repeater_inner_text[0] + repeater.innerHTML);
                break;
            case "after":
                repeater.innerHTML = (repeater.innerHTML + repeater_inner_text[0]);
                break;
            default:
                repeater.innerHTML = repeater_inner_text[0];
                break;
        }
        if (setting.load_complete != null) {
            eval("var change =" + setting.load_complete);
            change(json_data);
        }
    }

    function refresh() { init(); }
}

//form_element可以是任何一个html元素，不局限于form元素
function rx_form(form_element, setting) {
    if (form_element == undefined || form_element == null) {
        throw "rx_form的参数form_element需要一个dom元素或者是dom元素的选择器！";
    }
    else if (typeof (form_element) == "string") {
        form_element = document.querySelector(form_element);
        if (form_element == null) {
            throw String.Format("rx_form的参数form_element在选择器模式下发现选择器：{0} 不存在！");
        }
    }
    if (setting == undefined) {
        throw "rx_form未设置参数setting！";
    }
    var form = form_element;

    var setting_cache = {};
    for (var key in setting) {
        setting_cache[key] = setting[key];
    }

    setting =
        {
            //指令方法 submit|load|revert|get_setting
            method: (setting.method == undefined ? "submit" : setting.method.toString()),
            //样式配置信息的key
            class_config_key: (setting.class_config_key == undefined ? "default" : setting.class_config_key.toString()),
            //指定ajax请求地址
            url: setting.url == undefined ? null : setting.url.toString(),
            //ajax请求的参数，请求方式默认为post，可以使用ajax_method_type进行调整
            data: setting.data == undefined ? {} : setting.data,
            //ajax请求的方式，请求方式默认为post
            ajax_method_type: setting.ajax_method_type == undefined ? "post" : setting.ajax_method_type,
            //以表单元素中的哪个属性来作为字段依据，默认是name
            property_name: setting.property_name == undefined ? "name" : setting.property_name.toString(),
            //表单中的CheckBox没有选中的是否使用 '' （空字符串）来填充,默认值false
            is_checkbox_null: (typeof setting.is_checkbox_null != "boolean") ? false : setting.is_checkbox_null,
            //提交数据和加载数据的相同字段数据的所使用的分隔符，默认值','逗号
            split: setting.split == undefined ? "," : setting.url.toString(),
            //提交时的事件，用于进行验证（返回false阻止提交）
            on_submit: !(setting.on_submit instanceof Function) ? null : setting.on_submit.toString(),
            //提交完成后执行的事件
            submit_success: !(setting.submit_success instanceof Function) ? null : setting.submit_success.toString(),
            //数据加载完毕时执行的事件
            load_success: !(setting.load_success instanceof Function) ? null : setting.load_success.toString(),
            //异常时执行的事件
            error: !(setting.error instanceof Function) ? null : setting.error.toString()
        }

    if (form.getAttribute("setting") != null) {
        //提交就清空setting
        if (setting.method == "submit") {
            form.removeAttribute("setting");
        }
        else {
            //否则就替换和覆盖
            var c_setting = JSON.parse(form.getAttribute("setting"));
            var keys = [];
            for (var key in c_setting) {
                var reg = true;
                for (var i = 0; i < keys.length; i++) {
                    if (key == keys[i]) {
                        reg = false;
                        break;
                    }
                }
                if (reg) keys.push(key);
            }
            for (var key in setting_cache) {
                var reg = true;
                for (var i = 0; i < keys.length; i++) {
                    if (key == keys[i]) {
                        reg = false;
                        break;
                    }
                }
                if (reg) keys.push(key);
            }
            for (var i = 0; i < keys.length; i++) {
                var item = keys[i];
                if (setting_cache[item] != null && setting_cache[item] != undefined) {
                    setting[item] = setting_cache[item];
                }
                else {
                    setting[item] = c_setting[item]
                }
            }
        }
    }

    if (setting.method == "submit" || setting.method == "load") {
        if (setting.url == null)
            throw "rx_form在submit或者load模式下的setting参数的url属性是必填的！";
    }

    //获取class配置
    var class_config = {};
    try {
        class_config = rx_assembly_config.class[setting.class_config_key].rx_form;
    } catch (e) {
        throw "未找到rx组件系列的配置文件，可能是未引入rx_assembly_config.js！";
    }

    form.setAttribute("setting", JSON.stringify(setting));
    if (form.getAttribute("id") == null) form.setAttribute("id", "rx_form_" + parseInt(Math.random() * 100000000));
    var form_id = form.getAttribute("id");

    switch (setting.method) {
        case "submit": submit(); break;
        case "load": ajax_get_json(); break;
        case "revert": revert(); break;
        case "get_setting":
            return JSON.parse(table.getAttribute("setting"));
            break;
        default:
            throw String.Format("rx_form的参数setting的method属性（指令方法）:{0},未找到！\n-----参考列表-----\n提交:{1}(默认值)\n加载:{2}\n还原:{3}(必须先加载)\n获取配置:{4}",
                setting.method, "submit", "load", "revert", "get_setting");
    }

    //对象标记
    form.setAttribute("rx_form", "rx_form");

    function submit() {

        var form_elements = form.getElementsByTagName("*");
        for (var i = 0; i < form_elements.length; i++) {
            if (form_elements[i].getAttribute(setting.property_name) == null) continue;
            var tag_type = form_elements[i].getAttribute("type");
            var local_name = form_elements[i].localName.toLowerCase();

            switch (tag_type) {
                case "radio":
                case "checkbox":
                    if (form_elements[i].checked == true) {
                        if (setting.data[form_elements[i].getAttribute(setting.property_name)] == undefined)
                            setting.data[form_elements[i].getAttribute(setting.property_name)] = form_elements[i].value;
                        else
                            setting.data[form_elements[i].getAttribute(setting.property_name)] += setting.split + form_elements[i].value;
                    }
                    else {
                        if (tag_type == "checkbox" && setting.is_checkbox_null) {
                            if (setting.data[form_elements[i].getAttribute(setting.property_name)] == undefined)
                                setting.data[form_elements[i].getAttribute(setting.property_name)] = "";
                            else
                                setting.data[form_elements[i].getAttribute(setting.property_name)] += setting.split + "";
                        }
                    }
                    break;
                default:
                    if (local_name == "input" || local_name == "select" || local_name == "textarea" || local_name == "button") {
                        if (setting.data[form_elements[i].getAttribute(setting.property_name)] == undefined)
                            setting.data[form_elements[i].getAttribute(setting.property_name)] = form_elements[i].value;
                        else
                            setting.data[form_elements[i].getAttribute(setting.property_name)] += setting.split + form_elements[i].value;
                    }
                    else {
                        if (setting.data[form_elements[i].getAttribute(setting.property_name)] == undefined)
                            setting.data[form_elements[i].getAttribute(setting.property_name)] = form_elements[i].innerHTML;
                        else
                            setting.data[form_elements[i].getAttribute(setting.property_name)] += setting.split + form_elements[i].innerHTML;
                    }
                    break;
            }
        }

        //提交中的事件，可以用于验证和阻断提交
        if (setting.on_submit != null) {
            eval("var change =" + setting.on_submit);
            if (change(setting.data) == false) return;
        }
        ajax({
            url: setting.url,
            type: "post",
            data: setting.data,
            success: function (data, xml) {
                if (setting.submit_success != null) {
                    eval("var change =" + setting.submit_success);
                    change(data, xml);
                }
            },
            error: function (response_text, xml, status, status_text) {
                if (setting.error != null) {
                    eval("var change = " + setting.error)
                    change(response_text, xml, status, status_text);
                }
                else {
                    if (confirm(String.Format("(rx_table)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                        xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            }
        });
    }

    function ajax_get_json() {
        ajax({
            url: setting.url,
            type: setting.ajax_method_type,
            data: setting.data,
            success: function (data, xml) {
                load(data);
            },
            error: function (response_text, xml, status, status_text) {
                if (setting.error != null) {
                    eval("var change = " + setting.error)
                    change(response_text, xml, status, status_text);
                }
                else {
                    if (confirm(String.Format("(rx_table)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                        xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            }
        });
    }

    function load(json_data) {
        var form_elements = form.getElementsByTagName("*");
        for (var field in json_data) {
            for (var i = 0; i < form_elements.length; i++) {
                if (form_elements[i].getAttribute(setting.property_name) == field) {
                    var tag_type = form_elements[i].getAttribute("type");
                    var local_name = form_elements[i].localName.toLowerCase();
                    switch (tag_type) {
                        case "radio":
                        case "checkbox":
                            //form_elements[i].checked = false;
                            break;
                        default:
                            //form_elements[i].value = "";
                            //form_elements[i].innerHTML = "";
                            break;
                    }
                }
            }
            try {
                var values = json_data[field].split(setting.split);
            } catch (e) {
                var values = [json_data[field] == null ? "" : json_data[field].toString()];
            }
            var value_index = 0;
            for (var i = 0; i < form_elements.length; i++) {
                if (form_elements[i].getAttribute(setting.property_name) == field) {
                    var tag_type = form_elements[i].getAttribute("type");
                    var local_name = form_elements[i].localName.toLowerCase();
                    switch (tag_type) {
                        case "radio":
                        case "checkbox":
                            if (values[value_index] != undefined && form_elements[i].value.toString() == values[value_index].toString()) {
                                form_elements[i].checked = true;
                                value_index++;
                            }
                            break;
                        default:
                            if (local_name == "input" || local_name == "select" || local_name == "textarea" || local_name == "button") {
                                if (values[value_index] != undefined) {
                                    form_elements[i].value = values[value_index].toString();
                                    value_index++;
                                }
                            }
                            else {
                                if (values[value_index] != undefined) {
                                    form_elements[i].value = values[value_index].toString();
                                    value_index++;
                                }
                            }
                            break;
                    }
                }
            }
        }

        form.setAttribute("data", JSON.stringify(json_data));

        if (setting.load_success != null) {
            eval("var change =" + setting.load_success);
            change(json_data);
        }
    }

    function revert() {
        if (form.getAttribute("data") == null) {
            throw "rx_form必须先进行数据加载(load)才能使用revert还原数据";
        }

        load(JSON.parse(form.getAttribute("data")));
    }
}

//report_element可以是一个dom对象或者是一个对象的选择器【必须是一个table】
function rx_report(report_element, setting) {
    if (report_element == undefined || report_element == null) {
        throw "rx_report的参数report_element需要一个dom元素或者是dom元素的选择器！";
    }
    else if (typeof (report_element) == "string") {
        report_element = document.querySelector(report_element);
        if (report_element == null) {
            throw String.Format("rx_report的参数report_element在选择器模式下发现选择器：{0} 不存在！");
        }
    }
    if (report_element.tagName == undefined || report_element.tagName.toLowerCase() != "table") {
        throw "rx_report的参数report_element必须是一个table的dom元素(<table></table>)！";
    }
    if (setting == undefined) {
        throw "rx_report未设置参数setting！";
    }

    var report = report_element;
    report.style.borderCollapse = "collapse";

    var setting_cache = {};
    for (var key in setting) {
        setting_cache[key] = setting[key];
    }

    setting =
        {
            //指令方法 init|refresh|get_setting|
            method: (setting.method == undefined ? "init" : setting.method.toString()),
            //样式配置信息的key
            class_config_key: (setting.class_config_key == undefined ? "default" : setting.class_config_key.toString()),
            //指定ajax请求地址
            url: setting.url == undefined ? null : setting.url.toString(),
            //rx_report的离线json数据，当有离线数据时不会请求url的异步数据
            report_data: setting.report_data == undefined ? null : setting.report_data,
            //加载中显示的文本，可以是一系列html标签字符串
            loading_msg: setting.loading_msg == undefined ? "Loading......" : setting.loading_msg.toString(),
            //没有查到数据的时候显示的内容，可以一串html字符串
            no_data_msg: setting.no_data_msg == undefined ? "没有数据！" : setting.no_data_msg.toString(),
            //ajax请求的参数，请求方式默认为post，可以使用ajax_method_type进行调整
            data: setting.data == undefined ? {} : setting.data,
            //ajax请求的方式，请求方式默认为post
            ajax_method_type: setting.ajax_method_type == undefined ? "post" : setting.ajax_method_type,
            //列信息参数
            columns: !(setting.columns instanceof Array) ? [] : setting.columns,
            //*****事件参数*****
            //添加头行时执行的事件
            add_head_tr: !(setting.add_head_tr instanceof Function) ? null : setting.add_head_tr.toString(),
            //添加头列时执行的事件
            add_head_th: !(setting.add_head_th instanceof Function) ? null : setting.add_head_th.toString(),
            //添加行时执行的事件
            add_tr: !(setting.add_tr instanceof Function) ? null : setting.add_tr.toString(),
            //添加列时执行的事件
            add_td: !(setting.add_td instanceof Function) ? null : setting.add_td.toString(),
            //数据加载完毕时执行的事件
            load_success: !(setting.load_success instanceof Function) ? null : setting.load_success.toString(),
            //异常时执行的事件
            error: !(setting.error instanceof Function) ? null : setting.error.toString(),

            //***** 报表参数部分 *****//
            //报表标题，不填将没有
            report_title: setting.report_title == undefined ? null : setting.report_title.toString(),
            //报表标题的css样式
            report_title_style: setting.report_title_style == undefined ? "" : setting.report_title_style.toString(),
            //是否开启x轴统计
            x_statis: (typeof setting.x_statis != "boolean") ? false : setting.x_statis,
            //x轴统计小数点保留位数
            x_statis_fixed: setting.x_statis_fixed == undefined ? 2 : parseInt(setting.x_statis_fixed),
            //x轴统计类型，sum、avg、count
            x_statis_type: setting.x_statis_type == undefined ? "sum" : setting.x_statis_type.toString().toLocaleLowerCase(),
            //x轴统计标题名称
            x_statis_title: setting.x_statis_title == undefined ? null : setting.x_statis_title.toString(),
            //x轴统计标列的css样式
            x_statis_style: setting.x_statis_style == undefined ? "" : setting.x_statis_style.toString(),
            //x轴统计标列的html属性
            x_statis_attr: setting.x_statis_attr == undefined ? "" : setting.x_statis_attr.toString(),
            //是否开启y轴统计
            y_statis: (typeof setting.y_statis != "boolean") ? false : setting.y_statis,
            //y轴统计小数点保留位数
            y_statis_fixed: setting.y_statis_fixed == undefined ? 2 : parseInt(setting.y_statis_fixed),
            //y轴统计类型，sum、avg、count
            y_statis_type: setting.y_statis_type == undefined ? "sum" : setting.y_statis_type.toString().toLocaleLowerCase(),
            //y轴统计标题名称
            y_statis_title: setting.y_statis_title == undefined ? null : setting.y_statis_title.toString(),
            //x轴统计标列的css样式
            y_statis_style: setting.y_statis_style == undefined ? "" : setting.y_statis_style.toString(),
            //x轴统计标列的html属性
            y_statis_attr: setting.y_statis_attr == undefined ? "" : setting.y_statis_attr.toString(),
            //是否开启Excel编辑功能
            is_editor: (typeof setting.is_editor != "boolean") ? false : setting.is_editor,
            //对比列字段，指定后会开启列对比
            contrast_ident: setting.contrast_ident == undefined ? null : setting.contrast_ident.toString(),
            //参与列对比的ident,string的数组,不指定将所有ident列进行对比，基于contrast_ident
            use_contrast_ident: !(setting.use_contrast_ident instanceof Array) ? [] : setting.use_contrast_ident,
            //列对比显示位置，默认rigth（left），基于contrast_ident
            contrast_position: setting.contrast_position == undefined ? "right" : setting.contrast_position.toString(),
            //对比列格式化,默认{@value} %，基于contrast_ident
            contrast_format: setting.contrast_format == undefined ? "{@value} %" : setting.contrast_format.toString(),
            //进行行分组的ident数组
            row_group_idents: !(setting.row_group_idents instanceof Array) ? [] : setting.row_group_idents,
        };

    if (setting.columns.length == 0 && report.getAttribute("rx_report") == null) {
        throw "rx_report的setting参数中的columns属性是必须存在的，类型为数组(Array), 元素参考字段：title、html_tag、attr、style、ident！";
    }
    if (report.getAttribute("setting") != null) {
        //初始化就清空setting
        if (setting.method == "init") {
            report.removeAttribute("setting");
        }
        else {
            //否则就替换和覆盖
            var c_setting = JSON.parse(report.getAttribute("setting"));
            var keys = [];
            for (var key in c_setting) {
                var reg = true;
                for (var i = 0; i < keys.length; i++) {
                    if (key == keys[i]) {
                        reg = false;
                        break;
                    }
                }
                if (reg) keys.push(key);
            }
            for (var key in setting_cache) {
                var reg = true;
                for (var i = 0; i < keys.length; i++) {
                    if (key == keys[i]) {
                        reg = false;
                        break;
                    }
                }
                if (reg) keys.push(key);
            }
            for (var i = 0; i < keys.length; i++) {
                var item = keys[i];
                if (setting_cache[item] != null && setting_cache[item] != undefined) {
                    setting[item] = setting_cache[item];
                }
                else {
                    setting[item] = c_setting[item]
                }
            }
        }
    }

    if (setting.x_statis) {
        //x聚合函数矫正
        if (setting.x_statis_type != "sum" && setting.x_statis_type != "avg" && setting.x_statis_type != "count") {
            throw 'setting.x_statis_type 聚合只能是sum|avg|count';
        }
        if (setting.x_statis_title == null) {
            setting.x_statis_title = setting.x_statis_type;
        }
    }
    if (setting.y_statis) {
        //y聚合函数矫正
        if (setting.y_statis_type != "sum" && setting.y_statis_type != "avg" && setting.y_statis_type != "count") {
            throw 'setting.x_statis_type 聚合只能是sum|avg|count';
        }
        if (setting.y_statis_title == null) {
            setting.y_statis_title = setting.y_statis_type;
        }
    }

    //获取class配置
    var class_config = {};
    try {
        class_config = rx_assembly_config.class[setting.class_config_key].rx_report;
    } catch (e) {
        throw "未找到rx组件系列的配置文件，可能是未引入rx_assembly_config.js！";
    }

    report.setAttribute("setting", JSON.stringify(setting));
    if (report.getAttribute("id") == null) report.setAttribute("id", "rx_report_" + parseInt(Math.random() * 100000000));
    var report_id = report.getAttribute("id");

    switch (setting.method) {
        case "init": init(); break;
        case "refresh": refresh(); break;
        case "get_setting":
            return JSON.parse(report.getAttribute("setting"));
            break;
        default:
            throw String.Format("rx_report的参数setting的method属性（指令方法）:{0},未找到！\n-----参考列表-----\n初始化:{1}(默认值)\n刷新:{2}\n获取配置:{3}",
                setting.method, "init", "refresh", "get_setting");
    }
    //对象标记
    report.setAttribute("rx_report", "rx_report");

    function init() {
        if (setting.url == null && setting.report_data == null) {
            throw "rx_report的参数setting中的url和report_data属性必须设置其中一个，优先使用report_data！";
        }

        if (class_config.table.trim() != "") {
            for (var i = 0; i < class_config.table.split(" ").length; i++) {
                report.classList.add(class_config.table.split(" ")[i]);
            }
        }
        report.style.width = "";
        report.setAttribute("cellspacing", "0");
        report.setAttribute("cellpadding", "0");

        var thead = document.createElement("thead");
        report.innerHTML = "";//清空这个table
        report.appendChild(thead);
        var thead_tr = document.createElement("tr");
        thead_tr.setAttribute("ident", "report_head");
        //x轴统计的列参数
        if (setting.x_statis) {
            setting.columns[setting.columns.length] =
                {
                    title: setting.x_statis_title,
                    html_tag: "0",
                    attr: setting.x_statis_attr,
                    style: setting.x_statis_style,
                    ident: "x_statis"
                }
        }
        for (var i = 0; i < setting.columns.length; i++) {
            var attr = setting.columns[i].attr != undefined ? setting.columns[i].attr.toString() : "";
            var style = setting.columns[i].style != undefined ? setting.columns[i].style.toString() : "";
            if (setting.columns[i].title != undefined) {
                var th = create_element(String.Format("<th {0} {1} style='{2}'>{3}</th>",
                    attr,
                    (setting.columns[i].ident != undefined ? String.Format("ident='{0}_head'", setting.columns[i].ident.toString()) : ""),
                    style,
                    setting.columns[i].title
                    ));
            }

            thead_tr.appendChild(th);
            //表头列添加事件
            if (setting.add_head_th != null) {
                eval("var change = " + setting.add_head_th);
                change(th, i);
            }
        }

        //report_title添加
        if (setting.report_title != null) {
            thead.appendChild(create_element(String.Format("<tr><th ident='report_title' style='{0}' colspan='{1}'>{2}</th></tr>", setting.report_title_style, thead_tr.querySelectorAll("th").length, setting.report_title)));
        }

        thead.appendChild(thead_tr);
        //表头行添加事件
        if (setting.add_head_tr != null) {
            eval("var change = " + setting.add_head_tr)
            change(thead_tr);
        }
        if (setting.report_data != null) {
            generate(setting.report_data);
        }
        else if (setting.url != "") {
            ajax_get_json();
        }
    }

    //根据url异步获取json数据
    function ajax_get_json() {
        var tbody = report.getElementsByTagName("tbody");
        if (tbody.length > 0) remove_element(tbody[0]);
        tbody = create_element("<tbody><tr style='text-align:center;'><td colspan='" + setting.columns.length + "'><div>" + setting.loading_msg + "</div></td></tr></tbody>");
        report.appendChild(tbody);

        ajax({
            url: setting.url,
            type: setting.ajax_method_type,
            data: setting.data,
            success: function (data, xml) {
                generate(data);
            },
            error: function (response_text, xml, status, status_text) {
                if (setting.error != null) {
                    eval("var change = " + setting.error)
                    change(response_text, xml, status, status_text);
                }
                else {
                    if (confirm(String.Format("(rx_report)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                        xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            }
        });
    }

    //根据json数据生成report内容
    function generate(json_data) {
        var report_head_trs = report.getElementsByTagName("thead")[0].getElementsByTagName("tr");
        for (var i = 0; i < report_head_trs.length; i++) {
            if (report_head_trs[i].getAttribute("report_head") == "report_head") {
                show_element(report_head_trs[i]);
            }
        }
        var is_retiredness = false;//是否为离线数据
        var tbody = report.getElementsByTagName("tbody")[0];
        tbody.innerHTML = "";
        var rows = json_data;

        //当前report中行的总数量
        var current_table_row_count = tbody.getElementsByTagName("tr").length;
        var y_values = new Array(setting.columns.length);
        var y_counts = new Array(setting.columns.length);
        //y轴统计数据初始化
        for (var i = 0; i < y_values.length; i++) {
            y_values[i] = "";
            y_counts[i] = 0;
        }

        for (var i = 0; i < rows.length; i++) {
            var new_tr = create_element("<tr></tr>");
            //x轴的统计值
            var x_value = 0;
            var x_count = 0;
            for (var j = 0; j < setting.columns.length; j++) {
                var html_tag = setting.columns[j].html_tag == undefined ? "" : setting.columns[j].html_tag.toString();
                var attr = setting.columns[j].attr == undefined ? "" : setting.columns[j].attr.toString();
                var style = setting.columns[j].style == undefined ? "" : setting.columns[j].style.toString();
                var ident = setting.columns[j].ident;
                new_tr.setAttribute("data", JSON.stringify(rows[i]));
                for (field in rows[i]) {
                    var reg = new RegExp("{@" + field + "}", "g");
                    //替换html_tag
                    if (html_tag != "") html_tag = html_tag.replace(reg, rows[i][field] == null ? "" : rows[i][field]);
                    //替换属性字符串
                    if (attr != "") attr = attr.replace(reg, rows[i][field]);
                    //替换样式字符串
                    if (style != "") style = style.replace(reg, rows[i][field]);
                }
                var new_td = create_element("<td " + attr + "></td>");
                if (style != "") new_td.setAttribute("style", style);
                new_td.innerHTML = html_tag;
                //x&y轴统计数据记录
                if (!isNaN(html_tag) && html_tag.trim() != "") {
                    x_value += parseFloat(html_tag);
                    if (y_values[j] == "") y_values[j] = 0;
                    y_values[j] += parseFloat(html_tag);
                }
                if (html_tag != undefined && html_tag != null && html_tag.trim() != "") {
                    x_count++;
                    y_counts[j]++;
                }
                if (ident != undefined) {
                    new_td.setAttribute("ident", ident);
                    //x轴数据统计填充
                    if (ident == "x_statis") {
                        switch (setting.x_statis_type) {
                            case "sum":
                                new_td.innerHTML = x_value.toFixed(setting.x_statis_fixed);
                                break;
                            case "avg":
                                var c_tds = new_tr.querySelectorAll("td");
                                var avg_count = 0;
                                for (var o = 0; o < c_tds.length; o++) {
                                    if (!isNaN(c_tds[o].innerText) && c_tds[o].innerText.trim() != "") {
                                        avg_count++;
                                    }
                                }
                                new_td.innerHTML = (x_value / avg_count).toFixed(setting.x_statis_fixed);
                                break;
                            case "count":
                                new_td.innerHTML = x_count - 1;
                                break;
                        }
                    }
                }
                new_tr.appendChild(new_td);
                //列添加事件
                if (setting.add_td != null) {
                    eval("var change = " + setting.add_td)
                    change(new_td, j, setting.columns[j].html_tag.replace(new RegExp("{@", "g"), "").replace(new RegExp("}", "g"), ""), i + current_table_row_count);
                }
            }

            tbody.appendChild(new_tr)
            //行添加事件
            if (setting.add_tr != null) {
                eval("var change = " + setting.add_tr);
                change(new_tr, i + current_table_row_count, rows[i]);
            }
            //y轴数据统计填充
            if (i == rows.length - 1 && setting.y_statis) {
                var y_tr = create_element(new_tr.outerHTML);
                switch (setting.y_statis_type) {
                    case "sum":
                        y_tr.setAttribute("data", JSON.stringify(y_values));
                        for (var index in y_values) {
                            y_tr.querySelectorAll("td")[index].innerHTML = y_values[index] === "" ? "" : y_values[index].toFixed(setting.y_statis_fixed);
                            if (index == 0 && y_values[index] === "") y_tr.querySelectorAll("td")[index].innerHTML = setting.y_statis_title;
                            if (index != y_tr.querySelectorAll("td").length - 1 || !setting.x_statis) {
                                y_tr.querySelectorAll("td")[index].setAttribute("style", setting.y_statis_style);
                                y_tr.querySelectorAll("td")[index].setAttribute("ident", "y_statis");
                            }
                        }
                        break;
                    case "avg":
                        for (var index in y_values) {
                            if (y_values[index] != "") y_values[index] = y_values[index] / rows.length;
                            y_tr.querySelectorAll("td")[index].innerHTML = y_values[index] === "" ? "" : y_values[index].toFixed(setting.y_statis_fixed);
                            if (index == 0 && y_values[index] === "") y_tr.querySelectorAll("td")[index].innerHTML = setting.y_statis_title;
                            if (index != y_tr.querySelectorAll("td").length - 1 || !setting.x_statis) {
                                y_tr.querySelectorAll("td")[index].setAttribute("style", setting.y_statis_style);
                                y_tr.querySelectorAll("td")[index].setAttribute("ident", "y_statis");
                            }
                        }
                        y_tr.setAttribute("data", JSON.stringify(y_values));
                        break;
                    case "count":
                        y_tr.setAttribute("data", JSON.stringify(y_counts));
                        for (var index in y_counts) {
                            y_tr.querySelectorAll("td")[index].innerHTML = y_counts[index] === "" ? "" : y_counts[index];

                            if (index != y_tr.querySelectorAll("td").length - 1 || !setting.x_statis) {
                                y_tr.querySelectorAll("td")[index].setAttribute("style", setting.y_statis_style);
                                y_tr.querySelectorAll("td")[index].setAttribute("ident", "y_statis");
                            }
                        }
                        break;
                }
                if (setting.x_statis) {
                    y_tr.querySelectorAll("td")[y_tr.querySelectorAll("td").length - 1].setAttribute("ident", "xy_statis");
                    //y_tr.querySelectorAll("td")[y_tr.querySelectorAll("td").length - 1].removeAttribute("style");
                }
                tbody.appendChild(y_tr)
                //y统计行添加事件
                if (setting.add_tr != null) {
                    eval("var change = " + setting.add_tr);
                    change(y_tr, i + current_table_row_count + 1, JSON.parse(y_tr.getAttribute("data")));
                }
            }
        }

        //xy综合统计
        if (setting.x_statis && setting.y_statis) {
            var xy_statis = report.querySelector("td[ident='xy_statis']");
            xy_statis.style.backgroundColor = "";
            xy_statis.setAttribute("style", xy_statis.getAttribute("style") + " position:relative; text-align:center; xy_statis:on;");

            var a = xy_statis.clientWidth;
            var b = xy_statis.clientHeight;
            var c = Math.sqrt(a * a + b * b);
            var angle = 180 / Math.PI * Math.atan(b / a);
            xy_statis.innerHTML = String.Format("<div style='border-top:1px solid rgb(100,100,100); position:absolute; width:{0}px; left:-{1}px; overflow:hidden; transform: rotate({2}deg);'></div>", c, (c - a) / 2, angle);

            var x_value = 0;
            var x_statis = report.querySelectorAll("td[ident='x_statis']");
            for (var i = 0; i < x_statis.length; i++) {
                if (!isNaN(x_statis[i].innerHTML.trim()) && x_statis[i].innerHTML.trim() != "") {
                    x_value += parseFloat(x_statis[i].innerHTML.trim());
                }
            }
            switch (setting.x_statis_type) {
                case "avg":
                    var len = 0;
                    for (var i = 0; i < x_statis.length; i++) {
                        if (!isNaN(x_statis[i].innerHTML.trim()) && x_statis[i].innerHTML.trim() != "") {
                            len++;
                        }
                    }
                    x_value /= len;
                    break;
            }
            xy_statis.appendChild(create_element(String.Format("<span ident='x_statis' style='position:absolute; bottom:{0}px; left:{1}px;'>{2}</span>", b / 1.6, a / 2.5, x_value.toFixed(setting.x_statis_fixed))));
            xy_statis.appendChild(create_element("<span style='position:absolute; opacity:0; width:0.1px; height:0.1px; overflow:hidden;'>{@rx_break}</span>"));
            var y_value = 0;
            var y_statis = report.querySelectorAll("td[ident='y_statis']");
            for (var i = 0; i < y_statis.length; i++) {
                if (!isNaN(y_statis[i].innerHTML.trim()) && y_statis[i].innerHTML.trim() != "") {
                    y_value += parseFloat(y_statis[i].innerHTML.trim());
                }
            }

            switch (setting.y_statis_type) {
                case "avg":
                    var len = 0;
                    for (var i = 0; i < y_statis.length; i++) {
                        if (!isNaN(y_statis[i].innerHTML.trim()) && y_statis[i].innerHTML.trim() != "") {
                            len++;
                        }
                    }
                    y_value /= len;
                    break;
            }
            xy_statis.appendChild(create_element(String.Format("<span ident='y_statis' style='position:absolute; top:{0}px; right:{1}px;'>{2}</span>", b / 1.6, a / 2.5, y_value.toFixed(setting.y_statis_fixed))));
        }


        //Excel编辑事件添加
        if (setting.is_editor) {
            var x = 0;
            var y = 0;
            var retc = { x: 0, y: 0, w: 0, h: 0 };
            var is_mouse_down = false;
            report.onmousedown = function (e) {
                if (!is_mouse_down) {
                    x = e.x;
                    y = e.y;
                    is_mouse_down = true;

                    var len = mousemove_cells.length;
                    for (var i = 0; i < len; i++) {
                        var obj_retc = mousemove_cells[i].getBoundingClientRect();
                        if (obj_retc.left + obj_retc.width >= x
                            && obj_retc.left <= x
                            && obj_retc.top + obj_retc.height >= y
                            && obj_retc.top <= y) {
                            if (class_config.cell_selected.trim() != "") {
                                for (var j = 0; j < class_config.cell_selected.split(" ").length; j++) {
                                    mousemove_cells[i].classList.add(class_config.cell_selected.split(" ")[j]);
                                }
                            }
                        }
                        else {
                            if (class_config.cell_selected.trim() != "") {
                                for (var j = 0; j < class_config.cell_selected.split(" ").length; j++) {
                                    mousemove_cells[i].classList.remove(class_config.cell_selected.split(" ")[j]);
                                }
                            }
                        }
                    }
                }
            }
            report.onmouseup = function (e) {
                if (is_mouse_down) {
                    x = 0;
                    y = 0;
                    retc = { x: 0, y: 0, w: 0, h: 0 };
                    if (report.querySelectorAll(String.Format("td[class='{0}'],th[class='{1}']", class_config.cell_selected, class_config.cell_selected)).length == 0) {
                        return;
                    }
                    var html_arr = ['<div style="text-align:left;">',
                        '<div style="border-bottom: 1px solid rgb(211,211,211); overflow:hidden; padding:8px; margin-bottom:8px;">',
                        '<input tag="cell_text" type="text" style="width: 100%; padding:0px 6px; border-radius:2px; border:1px solid rgb(169,169,169); height:30px;" placeholder="填写单元格文本"/>',
                        '</div>',
                        '<div style="border-bottom: 1px solid rgb(211,211,211); overflow:hidden; padding:0px 8px 8px 8px;">',
                        '设置 ',
                        '<select tag="color" style="padding:0px 6px; border-radius:2px; border:1px solid rgb(169,169,169);">',
                        '<option value="background">背景</option>',
                        '<option value="text">文本</option>',
                        '</select>',
                        ' 颜色',
                        '<div style="padding-top:8px;">',
                        '{0}',
                        '</div>',
                        '</div>',
                        '<div style="border-bottom: 1px solid rgb(211,211,211); overflow:hidden; padding:8px;">',
                        '<div>设置字体样式<span state="down" tag="font_style_slide" style="float:right; text-shadow:0px 2px 6px rgb(100,100,100); font-size:20px; margin-top:-4px; transition:0.3s; user-select:none; cursor:pointer;">▼</span></div>',
                        '<div style="transition:0.3s; height:0px;">',
                        '<div style="padding-top:8px;">',
                        '<div style="overflow:hidden;">',
                        '<input tag="font_size" style="padding:0px 6px; border-radius:2px; border:1px solid rgb(169,169,169); height:28px; width:166px; float:left; margin-top:2px;" type="number" min="0" placeholder="字体大小 单位:像素px" />',
                        '<select tag="text_align" style="padding:0px 6px; border-radius:2px; border:1px solid rgb(169,169,169); height:28px; width:166px; float:right; margin-top:2px;">',
                        '<option value="initial">请选择文本布局</option>',
                        '<option value="left">居左 ┫</option>',
                        '<option value="center">居中 ╋</option>',
                        '<option value="right">居右 ┣</option>',
                        '</select>',
                        '</div>',
                        '</div>',
                        '<div style="padding-top:8px;">',
                        '<span style="padding-right:12px;">',
                        '<label style="cursor:pointer;"><input style="cursor:pointer;" type="checkbox" key="font-weight" value="bold"><b>粗体</b></label>',
                        '</span>',
                        '<span style="padding-right:12px;">',
                        '<label style="cursor:pointer;"><input style="cursor:pointer;" type="checkbox" key="font-style" value="italic"><i>斜体</i></label>',
                        '</span>',
                        '<span style="padding-right:12px;">',
                        '<label style="cursor:pointer;"><input style="cursor:pointer;" type="checkbox" key="text-decoration" value="underline"><u>下划线</u></label>',
                        '</span>',
                        '</div>',
                        '</div>',
                        '</div>',
                        '<div style="border-bottom: 1px solid rgb(211,211,211); margin:0px; overflow:hidden; padding:8px;">',
                        '<div>设置列宽&行高<span state="down" tag="size_slide" style="float:right; text-shadow:0px 2px 6px rgb(100,100,100); font-size:20px; margin-top:-4px; transition:0.3s; user-select:none; cursor:pointer;">▼</span></div>',
                        '<div style="transition:0.3s; height:0px;">',
                        '<div style="overflow:hidden; width:352px; padding-top:8px;">',
                        '<input tag="width" style="padding:0px 6px; border-radius:2px;  border:1px solid rgb(169,169,169); height:28px; float:left; width:166px;" type="number" min="0" placeholder="列宽 单位:像素px" />',
                        '<input tag="height" style="padding:0px 6px; border-radius:2px; border:1px solid rgb(169,169,169); height:28px; float:right; width:166px;" type="number" min="0" placeholder="行高 单位:像素px" />',
                        '</div>',
                        '</div>',
                        '</div>',
                        '<div style="text-align:center; padding:8px 0px 0px 0px;"><b>rx_report editions:2.0.0.0　author:RuanXu</b></div>',
                        '</div>'];
                    var colors = "";
                    for (var i = 0; i < npoi_colors.length; i++) {
                        colors += String.Format('<div tag="color_selector" title="{0}" style="cursor:pointer; box-shadow:0px 2px 8px rgba(0,0,0,0.5); border-radius:4px; margin:3px; float:left; width:16px; height:16px; background-color:{1};"></div>', npoi_colors[i], npoi_colors[i]);
                    }
                    var excel_content = String.Format(html_arr.join(""), colors);

                    var excel_box = new message_box({
                        width: 384,
                        title: "Excel 编辑面板",
                        content: excel_content,
                        is_confirm: true,
                        is_dialog: true,
                        call_back: function (message_result) {
                            var cells = report.querySelectorAll("td,th");
                            var len = cells.length;
                            for (var i = 0; i < len; i++) {
                                cells[i].classList.remove(class_config.cell_selected);
                            }
                            is_mouse_down = false;
                        }
                    });
                    excel_box.box_back.style.backgroundColor = "rgba(0,0,0,0)";
                    excel_box.box_back.onclick = function () { excel_box.implement_call_back(false); excel_box.box_back.onclick = null; }
                    excel_box.box.onclick = function (e) { e.cancelBubble = true; }
                    excel_box.content.style.border = "none";
                    remove_element(excel_box.foot);
                    //设置字体样式slide
                    excel_box.box.querySelector("span[tag='font_style_slide']").onmouseover = function () {
                        this.style.color = "rgb(255,100,255)";
                    }
                    excel_box.box.querySelector("span[tag='font_style_slide']").onmouseout = function () {
                        this.style.color = "rgb(0,0,0)";
                    }
                    excel_box.box.querySelector("span[tag='font_style_slide']").onclick = function () {
                        if (this.getAttribute("state") == "up") {
                            this.innerHTML = "▼";
                            this.setAttribute("state", "down");
                            this.parentElement.nextElementSibling.style.height = "0px";
                        }
                        else {
                            this.innerHTML = "▲";
                            this.setAttribute("state", "up");
                            this.parentElement.nextElementSibling.style.height = "67px";
                        }
                    }
                    //设置列宽&行高slide
                    excel_box.box.querySelector("span[tag='size_slide']").onmouseover = function () {
                        this.style.color = "rgb(255,100,255)";
                    }
                    excel_box.box.querySelector("span[tag='size_slide']").onmouseout = function () {
                        this.style.color = "rgb(0,0,0)";
                    }
                    excel_box.box.querySelector("span[tag='size_slide']").onclick = function () {
                        if (this.getAttribute("state") == "up") {
                            this.innerHTML = "▼";
                            this.setAttribute("state", "down");
                            this.parentElement.nextElementSibling.style.height = "0px";
                        }
                        else {
                            this.innerHTML = "▲";
                            this.setAttribute("state", "up");
                            this.parentElement.nextElementSibling.style.height = "38px";
                        }
                    }
                    var cells = report.querySelectorAll(String.Format("td[class='{0}'],th[class='{1}']", class_config.cell_selected, class_config.cell_selected));
                    var all_cells = report.querySelectorAll("td,th");
                    if (cells.length > 1) {
                        hide_element(excel_box.box.querySelector("input[tag='cell_text']").parentNode);
                    }
                    else {
                        if (cells[0].getAttribute("ident") == "xy_statis") {
                            hide_element(excel_box.box.querySelector("input[tag='cell_text']").parentNode);
                        }
                    }
                    excel_box.box.querySelector("input[tag='cell_text']").value = cells[0].innerText;
                    excel_box.box.querySelector("input[tag='cell_text']").onchange = function () {
                        cells[0].innerText = this.value;
                    }
                    var color_selector = excel_box.box.querySelectorAll("div[tag='color_selector']");
                    for (var i = 0; i < color_selector.length; i++) {
                        color_selector[i].onclick = function () {
                            var type = excel_box.box.querySelector("select[tag='color']").value;
                            for (var i = 0; i < cells.length; i++)
                                if (type == "background")
                                    cells[i].style.backgroundColor = this.getAttribute("title");
                                else
                                    cells[i].style.color = this.getAttribute("title");
                        }
                    }
                    excel_box.box.querySelector("input[tag='font_size']").onchange = function () {
                        for (var i = 0; i < cells.length; i++)
                            cells[i].style.fontSize = this.value + "px";
                    }
                    excel_box.box.querySelector("select[tag='text_align']").onchange = function () {
                        for (var i = 0; i < cells.length; i++)
                            cells[i].style.textAlign = this.value;
                    }
                    var check_box = excel_box.box.querySelectorAll("input[type='checkbox']");
                    for (var i = 0; i < check_box.length; i++) {
                        check_box[i].onchange = function () {
                            for (var j = 0; j < cells.length; j++) {
                                cells[j].style[this.getAttribute("key")] = this.checked ? this.value : "";
                                if (cells[j].getAttribute("ident") == "xy_statis") {
                                    var spans = cells[j].querySelectorAll("span");
                                    for (var item = 0; item < spans.length; item++) {
                                        spans[item].style[this.getAttribute("key")] = this.checked ? this.value : "";
                                    }
                                    cells[j].setAttribute("style", cells[j].getAttribute("style") + " xy_statis: on;");
                                }
                            }
                        }
                    }
                    excel_box.box.querySelector("input[tag='width']").onchange = function () {
                        //使报表有绝对宽度
                        var report_parent = create_element("<div tag='report_parent' style='position:relative;'></div>");
                        before_element(report_parent, report);
                        report_parent.appendChild(report);
                        report_parent.style.width = "9999999px";
                        report.style.width = "";

                        var cell_indexes = [];
                        for (var i = 0; i < cells.length; i++) {
                            if (cells[i].getAttribute("colspan") == null || parseInt(cells[i].getAttribute("colspan")) <= 1) {
                                var row_tds = cells[i].parentNode.querySelectorAll("td,th");
                                for (var j = 0; j < row_tds.length; j++) {
                                    if (row_tds[j] == cells[i]) {
                                        cell_indexes.push(cells[i].getAttribute("cell_index"));
                                    }
                                }
                            }
                        }
                        var do_cell_indexes = [cell_indexes[0]];
                        for (var i = 0; i < cell_indexes.length; i++) {
                            var reg = true;
                            for (var j = 0; j < do_cell_indexes.length; j++) {
                                if (do_cell_indexes[j] == cell_indexes[i]) {
                                    reg = false;
                                    break;
                                }
                            }
                            if (reg) do_cell_indexes.push(cell_indexes[i])
                        }

                        for (var i = 0; i < do_cell_indexes.length; i++) {
                            for (var j = 0; j < all_cells.length; j++) {
                                if (all_cells[j].getAttribute("cell_index") == do_cell_indexes[i]) {
                                    all_cells[j].style.width = this.value + "px";
                                }
                            }
                        }
                        for (var i = 0; i < all_cells.length; i++) {
                            //if (all_cells[i].getAttribute("colspan") == null || parseInt(all_cells[i].getAttribute("colspan")) <= 1) {
                            //all_cells[i].style.width = all_cells[i].offsetWidth;
                            if (all_cells[i].getAttribute("ident") == "xy_statis") {
                                var a = all_cells[i].clientWidth;
                                var b = all_cells[i].clientHeight;
                                var c = Math.sqrt(a * a + b * b);
                                var angle = 180 / Math.PI * Math.atan(b / a);
                                all_cells[i].querySelector("div").style.width = c + "px";
                                all_cells[i].querySelector("div").style.left = -((c - a) / 2) + "px";
                                all_cells[i].querySelector("div").style.transform = String.Format("rotate({0}deg)", angle);
                                all_cells[i].setAttribute("style", all_cells[i].getAttribute("style") + " xy_statis: on;");

                                all_cells[i].querySelector("span[ident='x_statis']").style.bottom = (b / 1.6) + "px";
                                all_cells[i].querySelector("span[ident='x_statis']").style.left = (a / 2.5) + "px";
                                all_cells[i].querySelector("span[ident='y_statis']").style.top = (b / 1.6) + "px";
                                all_cells[i].querySelector("span[ident='y_statis']").style.right = (a / 2.5) + "px";
                            }
                            //}
                        }

                        //使报表有绝对宽度
                        report.style.width = report.querySelector("tr").offsetWidth + "px";
                        report_parent.style.width = "";
                        before_element(report, report_parent);
                        remove_element(report_parent);
                    }
                    excel_box.box.querySelector("input[tag='height']").onchange = function () {
                        for (var i = 0; i < cells.length; i++) {
                            if (cells[i].getAttribute("rowspan") == null || parseInt(cells[i].getAttribute("rowspan")) <= 1) {
                                cells[i].parentNode.style.height = this.value + "px";
                                cells[i].style.height = this.value + "px";
                            }
                        }
                        for (var i = 0; i < all_cells.length; i++) {
                            if (all_cells[i].getAttribute("rowspan") == null || parseInt(all_cells[i].getAttribute("rowspan")) <= 1) {
                                all_cells[i].style.height = all_cells[i].parentNode.style.height;
                                if (all_cells[i].getAttribute("ident") == "xy_statis") {
                                    var b = all_cells[i].clientHeight;
                                    var c = Math.sqrt(a * a + b * b);
                                    var angle = 180 / Math.PI * Math.atan(b / a);
                                    all_cells[i].querySelector("div").style.width = c + "px";
                                    all_cells[i].querySelector("div").style.left = -((c - a) / 2) + "px";
                                    all_cells[i].querySelector("div").style.transform = String.Format("rotate({0}deg)", angle);
                                    all_cells[i].setAttribute("style", all_cells[i].getAttribute("style") + " xy_statis: on;");

                                    all_cells[i].querySelector("span[ident='x_statis']").style.bottom = (b / 1.6) + "px";
                                    all_cells[i].querySelector("span[ident='x_statis']").style.left = (a / 2.5) + "px";
                                    all_cells[i].querySelector("span[ident='y_statis']").style.top = (b / 1.6) + "px";
                                    all_cells[i].querySelector("span[ident='y_statis']").style.right = (a / 2.5) + "px";

                                }
                            }
                        }
                    }
                }
            }
            report.onmousemove = function (e) {
                if (is_mouse_down) {
                    retc.x = Math.min(x, e.x);
                    retc.y = Math.min(y, e.y);
                    retc.w = Math.abs(x - e.x);
                    retc.h = Math.abs(y - e.y);
                    var len = mousemove_cells.length;
                    for (var i = 0; i < len; i++) {
                        var obj_retc = mousemove_cells[i].getBoundingClientRect();
                        if (obj_retc.left + obj_retc.width >= retc.x
                            && obj_retc.left <= retc.x + retc.w
                            && obj_retc.top + obj_retc.height >= retc.y
                            && obj_retc.top <= retc.y + retc.h) {
                            if (class_config.cell_selected.trim() != "") {
                                for (var j = 0; j < class_config.cell_selected.split(" ").length; j++) {
                                    mousemove_cells[i].classList.add(class_config.cell_selected.split(" ")[j]);
                                }
                            }
                        }
                        else {
                            if (class_config.cell_selected.trim() != "") {
                                for (var j = 0; j < class_config.cell_selected.split(" ").length ; j++) {
                                    mousemove_cells[i].classList.remove(class_config.cell_selected.split(" ")[j]);
                                }
                            }
                        }
                    }
                }
            }
        }

        //列对比逻辑
        if (setting.contrast_ident != null) {
            var contrast_th = report.querySelector(String.Format("th[ident='{0}_head']", setting.contrast_ident));
            if (contrast_th == null) {
                throw String.Format('目前要进行列对比统计，但是找不到ident关键字 {0} 的头部！', setting.contrast_ident);
            }
            var contrast_tds = report.querySelectorAll(String.Format("td[ident='{0}']", setting.contrast_ident));
            if (contrast_tds.length != 0) {
                if (setting.use_contrast_ident == undefined || setting.use_contrast_ident.length == 0) {
                    setting.use_contrast_ident = [];
                    for (var i = 0; i < setting.columns.length; i++) {
                        if (setting.columns[i].ident != undefined && setting.columns[i].ident != setting.contrast_ident && setting.columns[i].ident != "x_statis") {
                            setting.use_contrast_ident.push(setting.columns[i].ident);
                        }
                    }
                }
                if (setting.use_contrast_ident.length == 0) {
                    throw 'rx_report要执行进行列对比操作，但是columns还没有任何列指定了ident属性';
                }
                for (var i = 0; i < setting.use_contrast_ident.length; i++) {
                    var th = report.querySelector(String.Format("th[ident='{0}_head']", setting.use_contrast_ident[i]));
                    if (th == null) {
                        throw String.Format('rx_report在执行行列对比操作时，发现任何列中都没有ident属性值{0}', setting.use_contrast_ident[i]);
                    }
                    th.setAttribute("colspan", 2);
                }
                for (var i = 0; i < contrast_tds.length; i++) {
                    var p_tr = contrast_tds[i].parentNode;
                    for (var j = 0; j < setting.use_contrast_ident.length; j++) {
                        var td = p_tr.querySelector(String.Format("td[ident='{0}']", setting.use_contrast_ident[j]));
                        var td_value = 0;
                        if (!isNaN(td.innerHTML.trim()) && td.innerHTML.trim() != "") {
                            td_value = parseFloat(td.innerHTML.trim());
                        }
                        var x_value = parseFloat(p_tr.querySelector(String.Format("td[ident='{0}']", setting.contrast_ident)).innerHTML.trim());
                        var value = ((td_value / x_value) * 100).toFixed(2);
                        var new_td = create_element(td.outerHTML);
                        new_td.innerHTML = setting.contrast_format.replace("{@value}", isNaN(value.toString() + "0") ? "0" : value);
                        after_element(new_td, td);
                    }


                }

                var report_title = report.querySelector("th[ident='report_title']");
                if (report_title.getAttribute("colspan") == null) {
                    report_title.setAttribute("colspan", "1");
                }
                report_title.setAttribute("colspan", parseInt(report_title.getAttribute("colspan")) + setting.use_contrast_ident.length);

                var head_ths = report.querySelectorAll("tr[ident='report_head'] th");
                var y_statis_tds = report.querySelectorAll("td[ident='y_statis']");
                if (y_statis_tds.length > 0) {
                    var y_value = 0;
                    if (setting.contrast_ident != "x_statis") {
                        var report_head_ths = report.querySelectorAll("tr[ident='report_head'] th");
                        var index = 0;
                        for (var i = 0; i < report_head_ths.length; i++) {
                            index = i;
                            if (report_head_ths[i].getAttribute("ident") == String.Format("{0}_head", setting.contrast_ident)) {
                                break;
                            }
                        }
                        var td = report.querySelectorAll("td[ident='y_statis']")[index];
                        if (!isNaN(td.innerHTML.trim()) && td.innerHTML.trim() != "") {
                            y_value = parseFloat(td.innerHTML.trim());
                        }
                    }
                    else {
                        var span = report.querySelector("span[ident='y_statis']");
                        if (!isNaN(span.innerHTML.trim()) && span.innerHTML.trim() != "") {
                            y_value = parseFloat(span.innerHTML.trim());
                        }
                    }

                    for (var i = 0; i < y_statis_tds.length; i++) {
                        if (head_ths[i].getAttribute("colspan") != null && parseInt(head_ths[i].getAttribute("colspan")) > 1) {
                            var new_td = create_element(y_statis_tds[i].outerHTML);
                            var y_statis_value = 0;
                            if (!isNaN(y_statis_tds[i].innerHTML.trim()) && y_statis_tds[i].innerHTML.trim() != "") {
                                y_statis_value = parseFloat(y_statis_tds[i].innerHTML.trim());
                            }
                            var value = ((y_statis_value / y_value) * 100).toFixed(2);
                            new_td.innerHTML = setting.contrast_format.replace("{@value}", isNaN(value.toString() + "0") ? "0" : value);
                            after_element(new_td, y_statis_tds[i]);
                        }
                    }
                }
            }
        }

        //给所有的列加上坐标属性 row_index cell_index,必须在行分组逻辑之前进行
        var all_rows = report.querySelectorAll("tr");
        for (var i = 0; i < all_rows.length; i++) {
            var row_tds = all_rows[i].querySelectorAll("td,th");
            for (var j = 0; j < row_tds.length; j++) {
                row_tds[j].setAttribute("row_index", i);
                row_tds[j].setAttribute("cell_index", j);
            }
        }

        //行分组逻辑
        if (setting.row_group_idents != undefined && setting.row_group_idents.length > 0) {
            for (var i = 0; i < setting.row_group_idents.length; i++) {
                var tds = report.querySelectorAll(String.Format("td[ident='{0}']", setting.row_group_idents[i]));
                if (tds.length == 0) {
                    console.warn("警告：rx_report在进行航分组操作时未发现ident：" + setting.row_group_idents[i]);
                    continue;
                }
                var index = 0;
                var row_span = 0;
                var text = ""
                for (var j = 0; j < tds.length; j++) {
                    if (j > 0) {
                        row_span++;
                        if (text != tds[j].innerHTML || j == tds.length - 1) {
                            if (j == tds.length - 1 && tds[j].innerHTML == text) row_span++;
                            tds[index].setAttribute("rowspan", row_span);
                            row_span = 0;
                            var last = ((j == tds.length - 1 && tds[j].innerHTML == text) ? 1 : 0);
                            for (var k = index + 1; k < j + last; k++) {
                                remove_element(tds[k])
                            }
                            index = j;
                        }
                    }
                    text = tds[j].innerHTML;
                }
            }
        }

        //Excel编辑需要使用的所有列，必须在这里执行
        var mousemove_cells = report.querySelectorAll("td,th");
        //使报表有绝对宽度
        var report_parent = create_element("<div tag='report_parent' style='position:relative;'></div>");
        before_element(report_parent, report);
        report_parent.appendChild(report);
        report_parent.style.width = "9999999px";
        report.style.width = "";
        report.style.width = report.querySelector("tr").offsetWidth + "px";
        report_parent.style.width = "";
        before_element(report, report_parent);
        remove_element(report_parent);

        //给所有行家height
        for (var i = 0; i < all_rows.length; i++) {
            all_rows[i].style.height = all_rows[i].offsetHeight + "px";
        }

        if (xy_statis_td != null) {
            var a = xy_statis_td.clientWidth;
            var b = xy_statis_td.clientHeight;
            var c = Math.sqrt(a * a + b * b);
            var angle = 180 / Math.PI * Math.atan(b / a);
            xy_statis_td.querySelector("div").style.width = c + "px";
            xy_statis_td.querySelector("div").style.left = -((c - a) / 2) + "px";
            xy_statis_td.querySelector("div").style.transform = String.Format("rotate({0}deg)", angle);
            xy_statis_td.setAttribute("style", xy_statis_td.getAttribute("style") + " xy_statis: on;");

            xy_statis_td.querySelector("span[ident='x_statis']").style.bottom = (b / 1.6) + "px";
            xy_statis_td.querySelector("span[ident='x_statis']").style.left = (a / 2.5) + "px";
            xy_statis_td.querySelector("span[ident='y_statis']").style.top = (b / 1.6) + "px";
            xy_statis_td.querySelector("span[ident='y_statis']").style.right = (a / 2.5) + "px";
        }

        //数据加载完毕事件
        if (setting.load_success != null) {
            eval("var change = " + setting.load_success);
            change(rows);
        }
    }

    //刷新这个rx_report
    function refresh() {
        if (report.getAttribute("rx_report") != "rx_report") {
            throw "这个table并不是rx_report的对象，不能直接进行刷新操作，请先初始化！";
        }

        init();
    }
}
var npoi_colors = ["rgb(0,0,0)", "rgb(255,255,255)", "rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)", "rgb(255,255,0)", "rgb(255,0,255)", "rgb(0,255,255)", "rgb(128,0,0)", "rgb(0,128,0)", "rgb(0,0,128)", "rgb(128,128,0)", "rgb(128,0,128)", "rgb(0,128,128)", "rgb(192,192,192)", "rgb(128,128,128)", "rgb(153,153,255)", "rgb(153,51,102)", "rgb(255,255,204)", "rgb(204,255,255)", "rgb(102,0,102)", "rgb(255,128,128)", "rgb(0,102,204)", "rgb(204,204,255)", "rgb(0,204,255)", "rgb(204,255,204)", "rgb(255,255,153)", "rgb(153,204,255)", "rgb(255,153,204)", "rgb(204,153,255)", "rgb(255,204,153)", "rgb(51,102,255)", "rgb(51,204,204)", "rgb(153,204,0)", "rgb(255,204,0)", "rgb(255,153,0)", "rgb(255,102,0)", "rgb(102,102,153)", "rgb(150,150,150)", "rgb(0,51,102)", "rgb(51,153,102)", "rgb(0,51,0)", "rgb(51,51,0)", "rgb(153,51,0)", "rgb(51,51,153)", "rgb(51,51,51)"];
rx_report.report_colors = {};
for (var i = 0; i < npoi_colors.length; i++) {
    rx_report.report_colors["rgb_" + npoi_colors[i].replace(/,/g, "_").replace("rgb(", "").replace(")", "")] = npoi_colors[i];
}

//rx_report的下载方法，可以给元素的点击事件进行执行
function rx_report_download(setting) {
    setting =
        {
            //一个json对象，键值对，key为sheet的名字，value为rx_report对象的选择器,可以指定多个rx_report对象（多个sheet）
            sheets: setting.sheets,
            //下载Excel所用的npoi接口地址
            handler_url: setting.handler_url,
            //Excel文件的名称，可选
            file_name: setting.file_name
        };
    if (setting.sheets == undefined)
        throw "下载rx_report请指定setting参数的sheets属性！";
    if (setting.sheets.length == 0)
        throw "下载rx_report时setting参数sheets的json对象长度不能为0！";
    if (setting.handler_url == undefined)
        throw "下载rx_report时setting参数的handler_url是必须指定的！";
    if (setting.file_name == undefined)
        setting.file_name = "rx_report_excel";
    var excel =
        {
            sheets: {},
            name: setting.file_name
        };
    for (var sheet in setting.sheets) {
        if (setting.sheets[sheet] == undefined) {
            alert(sheet + " 是无效的table文档！");
            return;
        }

        var table = document.querySelector(setting.sheets[sheet]);
        if (table == null) {
            throw '选择器 ' + setting.sheets[sheet] + ' 未找到任何元素';
        }
        if (table.getAttribute("rx_report") != "rx_report") {
            throw '选择器 ' + setting.sheets[sheet] + ' 找到的元素并不是一个rx_report对象';
        }

        var thead = table.querySelector("thead");

        var tbody = table.querySelector("tbody");

        var tfoot = table.querySelector("tfoot");

        var thead_trs = thead.querySelectorAll("tr");
        var thead_rows = new Array();
        for (var i = 0; i < thead_trs.length; i++) {
            thead_rows[i] = {
                //style: thead_trs[i].getAttribute("style") == null ? undefined : thead_trs[i].getAttribute("style"),
                cells: new Array()
            }
            var thead_ths = thead_trs[i].querySelectorAll("th,td");
            for (var j = 0; j < thead_ths.length; j++) {
                thead_rows[i].cells[j] = {
                    style: thead_ths[j].getAttribute("style") == null ? undefined : thead_ths[j].getAttribute("style"),
                    rowspan: thead_ths[j].getAttribute("rowspan") == null ? undefined : thead_ths[j].getAttribute("rowspan"),
                    colspan: thead_ths[j].getAttribute("colspan") == null ? undefined : thead_ths[j].getAttribute("colspan"),
                    text: thead_ths[j].innerText,
                }
            }
        }

        var tbody_trs = tbody.querySelectorAll("tr");
        var tbody_rows = new Array();
        for (var i = 0; i < tbody_trs.length; i++) {
            tbody_rows[i] = {
                //style: tbody_trs[i].getAttribute("style") == null ? undefined : tbody_trs[i].getAttribute("style"),
                cells: new Array()
            }
            var tbody_tds = tbody_trs[i].querySelectorAll("td");
            for (var j = 0; j < tbody_tds.length; j++) {
                tbody_rows[i].cells[j] = {
                    style: tbody_tds[j].getAttribute("style") == null ? undefined : tbody_tds[j].getAttribute("style"),
                    rowspan: tbody_tds[j].getAttribute("rowspan") == null ? undefined : tbody_tds[j].getAttribute("rowspan"),
                    colspan: tbody_tds[j].getAttribute("colspan") == null ? undefined : tbody_tds[j].getAttribute("colspan"),
                    text: tbody_tds[j].innerText,
                }
            }
        }

        if (tfoot != null) {
            var tfoot_trs = tfoot.querySelectorAll("tr");
            var tfoot_rows = new Array();
            for (var i = 0; i < tfoot_trs.length; i++) {
                tfoot_rows[i] = {
                    //style: tfoot_trs[i].getAttribute("style") == null ? undefined : tfoot_trs[i].getAttribute("style"),
                    cells: new Array()
                }
                var tfoot_tds = tfoot_trs[i].querySelectorAll("td");
                for (var j = 0; j < tfoot_tds.length; j++) {
                    tfoot_rows[i].cells[j] = {
                        style: tfoot_tds[j].getAttribute("style") == null ? undefined : tfoot_tds[j].getAttribute("style"),
                        rowspan: tfoot_tds[j].getAttribute("rowspan") == null ? undefined : tfoot_tds[j].getAttribute("rowspan"),
                        colspan: tfoot_tds[j].getAttribute("colspan") == null ? undefined : tfoot_tds[j].getAttribute("colspan"),
                        text: tfoot_tds[j].innerText,
                    }
                }
            }
        }

        var table_json = {
            style: table.getAttribute("style") == null ? undefined : table.getAttribute("style"),
            theadData: thead_rows,
            tbodyData: tbody_rows,
            tfootData: tfoot_rows
        };
        excel.sheets[sheet] = table_json;

        var form = create_element("<form style='display:none;' action='" + setting.handler_url + "' method='post'><input type='text' name='Excel' value='" + JSON.stringify(excel) + "'><input type='text' name='FileName' value='" + setting.file_name + "'></form>");
        document.body.appendChild(form);
        form.submit();
        remove_element(form);
    }
}

//消息对话框,setting参数详见源码,注意：使用示例（new）进行操作
function message_box(setting) {
    if (setting == undefined) {
        throw "message_box的setting是必须参数";
    }
    setting =
        {
            /* 对话框宽度默认值200px，手机锁定80% */
            width: setting.width || "200px",
            /* 对话的内容，可以是HTML代码 */
            content: setting.content || "",
            /* 对话框标题 */
            title: setting.title || "",
            /* 是否为确认框，true将会有两个按钮，确定和取消 */
            is_confirm: setting.is_confirm == undefined ? false : setting.is_confirm,
            /* 是否为模态消息框 */
            is_dialog: setting.is_dialog == undefined ? true : setting.is_dialog,
            //样式配置信息的key
            class_config_key: (setting.class_config_key == undefined ? "default" : setting.class_config_key.toString()),
            /* 点击按钮的回发事件，确定为true，取消为false */
            call_back: setting.call_back || function (message_result) { return true; },
            /* 对话框自动关闭事件，不设置该参数将不生效 */
            auto_close_times: setting.auto_close_times || null,
            /* 对话框标题处的图标样式class名称 */
            title_icon_class: setting.title_icon_class || null,
            /* 对话框的z-index 不设置将为100或者class值 */
            z_index: setting.z_index || 100,
            /* 是否执行实例后立即show出该对话框,可以使用show方面进行显示 */
            is_show: setting.is_show == undefined ? true : setting.is_show,
            /* 使用指定地址的内容来显示content中的内容，不指定将不生效,如果是html页面只会读取body中的内容 */
            url: setting.url || null,
            /* 使用指定地址的内容是否用iframe进行显示 */
            url_in_iframe: setting.url_in_iframe == undefined ? false : setting.url_in_iframe,
            /* 动画的时间（毫秒）， 默认300 */
            animate_times: setting.animate_times || 300,
            /* 是否能进行拖拽移动 */
            is_move: setting.is_move == undefined ? true : setting.is_move
        };
    if (setting.width.toString().indexOf("px") == -1) setting.width += "px";
    if (!is_pc()) setting.width = "80%";

    //获取class配置
    var class_config = {};
    try {
        class_config = rx_assembly_config.class[setting.class_config_key].rx_message_box;
    } catch (e) {
        throw "未找到rx组件系列的配置文件，可能是未引入rx_assembly_config.js！";
    }

    //对话框的容器，背景遮罩
    this.box_back = create_element(String.Format("<div style='opacity:0; position:fixed; word-break:break-all; z-index:{0};' class='{1}'></div>", setting.z_index, class_config.box_back));
    this.box_back.style.width = setting.is_dialog ? "100%" : "auto";
    this.box_back.style.height = setting.is_dialog ? "100%" : "auto";
    this.box_back.style.top = "0px";
    this.box_back.style.left = "0px";

    //对话框
    this.box = create_element(String.Format("<div class='{0}' style='width:{1};'></div>", class_config.box, setting.width));
    this.box.style.top = "0px";
    if (setting.is_dialog) {
        this.box.style.position = "absolute";
    }
    else {
        this.box_back.style.backgroundColor = "transparent";
    }
    this.box_back.appendChild(this.box);

    //对话框标题
    this.title = create_element(String.Format("<div class='{0}' style='overflow:hidden; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; cursor:move;'></div>", class_config.title));
    //对话框标题左上角图标
    this.title_icon = create_element(String.Format("<i class='{0}'></i>", setting.title_icon_class == null ? class_config.title_icon : setting.title_icon_class));
    //对话框标题右上角关闭按钮
    this.title_close = create_element(String.Format("<button style='float:right;' class='{0}'></button>", class_config.title_close));
    this.title.appendChild(this.title_icon);
    this.title.appendChild(create_element(String.Format("<span>{0}</span>", setting.title)));
    this.title.appendChild(this.title_close);
    this.box.appendChild(this.title);

    //对话框内容
    this.content = create_element(String.Format("<div class='{0}' style='max-height:520px; overflow:auto;'>{1}</div>", class_config.content, setting.content));
    if (setting.url != null) {
        var do_content = this.content;
        if (!setting.url_in_iframe) {
            ajax.get(setting.url, {}, function (data) {
                try {
                    //var do_data = data;
                    //do_data = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
                    //do_content.innerHTML = do_data;
                    do_content.innerHTML = data;
                } catch (e) {
                    do_content.innerHTML = data;
                }
            }, false, "text", function (e) { do_content.innerHTML = e; });
        }
        else {
            do_content.innerHTML = String.Format("<iframe frameborder='no'  style='width:{0}px; height:504px;' src='{1}'></iframe>", parseFloat(setting.width.replace("px")) - 16, setting.url);
        }
    }
    this.box.appendChild(this.content);

    //对话框底部
    this.foot = create_element(String.Format("<div class='{0}'></div>", class_config.foot));
    //对话框底部确定按钮
    this.okbtn = create_element(String.Format("<button class='{0}'></button>", class_config.okbtn));
    //对话框底部取消按钮
    this.cancelbtn = create_element(String.Format("<button class='{0}'></button>", class_config.cancelbtn));
    this.foot.appendChild(this.okbtn);
    if (setting.is_confirm) {
        this.foot.appendChild(this.cancelbtn);
    }
    this.box.appendChild(this.foot);

    var call_back_result = true;
    this.title_close.addEventListener("click", function () { call_back_result = setting.call_back(false); return false; });
    this.title_close.addEventListener("click", function () { if (call_back_result || call_back_result == undefined) { close(); } });
    this.okbtn.addEventListener("click", function () { call_back_result = setting.call_back(true); return false; });
    this.okbtn.addEventListener("click", function () { if (call_back_result || call_back_result == undefined) { close(); } });
    this.cancelbtn.addEventListener("click", function () { call_back_result = setting.call_back(false); return false; });
    this.cancelbtn.addEventListener("click", function () { if (call_back_result || call_back_result == undefined) { close(); } });

    document.body.appendChild(this.box_back);
    if (!setting.is_dialog) {
        this.box_back.style.left = window.innerWidth / 2 - this.box_back.offsetWidth / 2 + "px";
    }
    else {
        this.box.style.left = window.innerWidth / 2 - this.box.offsetWidth / 2 + "px";
    }

    var box_tag = this;

    setTimeout(function () {
        box_tag.box_back.style.transition = (parseInt(setting.animate_times) / 1000).toFixed(3) + "s";
        box_tag.box.style.transition = (parseInt(setting.animate_times) / 1000).toFixed(3) + "s";
        box_tag.box_back.style.opacity = setting.is_show ? 1 : 0;
        if (!setting.is_dialog) {
            box_tag.box_back.style.top = setting.is_show ? "40px" : "0px";
        }
        else {
            box_tag.box.style.top = setting.is_show ? "40px" : "0px";
        }
        if (!setting.is_show) {
            hide_element(box_tag.box_back);
        }

    }, 30);

    //show出对话框
    this.show = function () {
        if (this.box_back.style.display.toLocaleLowerCase() == "none") {
            show_element(this.box_back);
            setTimeout(function () {
                box_tag.box_back.style.transition = (parseInt(setting.animate_times) / 1000).toFixed(3) + "s";
                box_tag.box.style.transition = (parseInt(setting.animate_times) / 1000).toFixed(3) + "s";
                box_tag.box_back.style.opacity = 1;
                if (!setting.is_dialog) {
                    box_tag.box_back.style.top = "40px";
                }
                else {
                    box_tag.box.style.top = "40px";
                }
            }, 30);
        }
    }

    //关闭并释放对话框
    var close = function () {
        box_tag.title_close.setAttribute("disabled", "disabled");
        box_tag.cancelbtn.setAttribute("disabled", "disabled");
        box_tag.okbtn.setAttribute("disabled", "disabled");
        box_tag.box_back.style.opacity = 0;
        if (setting.is_dialog) {
            box_tag.box.style.top = parseFloat(box_tag.box.style.top.replace("px")) - 40 + "px";
        }
        else {
            box_tag.box_back.style.top = parseFloat(box_tag.box_back.style.top.replace("px")) - 40 + "px";
        }


        setTimeout(function () {
            remove_element(box_tag.box_back);
            box_tag = undefined;
        }, setting.animate_times)
    };
    this.close = close;

    //执行box回发函数
    this.implement_call_back = function (message_result) {
        call_back_result = setting.call_back(message_result);
        if (call_back_result || call_back_result == undefined) { close(); }
    }

    if (setting.is_move) {
        var last_x;
        var last_y;
        this.title.addEventListener("mousedown", function (event) {
            last_x = event.x;
            last_y = event.y;
            window.addEventListener("mousemove", move_box);
            window.addEventListener("mouseup", win_mouseup);

            box_tag.box_back.style.transition = "0s";
            box_tag.box.style.transition = "0s";
        });

        var move_box = function (event) {
            var x = event.x - last_x;
            var y = event.y - last_y;
            last_x = event.x;
            last_y = event.y;
            if (setting.is_dialog) {
                box_tag.box.style.left = parseFloat(box_tag.box.style.left.replace("px")) + x + "px";
                box_tag.box.style.top = parseFloat(box_tag.box.style.top.replace("px")) + y + "px";
            }
            else {
                box_tag.box_back.style.left = parseFloat(box_tag.box_back.style.left.replace("px")) + x + "px";
                box_tag.box_back.style.top = parseFloat(box_tag.box_back.style.top.replace("px")) + y + "px";
            }
        }
        var win_mouseup = function (event) {
            window.removeEventListener("mousemove", move_box);
            window.removeEventListener("mouseup", win_mouseup);
            box_tag.box_back.style.transition = (parseInt(setting.animate_times) / 1000).toFixed(3) + "s";
            box_tag.box.style.transition = (parseInt(setting.animate_times) / 1000).toFixed(3) + "s";

            setTimeout(function () {
                if (setting.is_dialog) {
                    if (parseFloat(box_tag.box.style.top.replace("px", "")) <= 0)
                        box_tag.box.style.top = "0px";

                    if (parseFloat(box_tag.box.style.top.replace("px", "")) + box_tag.box.offsetHeight >= window.innerHeight)
                        box_tag.box.style.top = (window.innerHeight - box_tag.box.offsetHeight) + "px";

                    if (parseFloat(box_tag.box.style.left.replace("px", "")) <= 0)
                        box_tag.box.style.left = "0px";

                    if (parseFloat(box_tag.box.style.left.replace("px", "")) + box_tag.box.offsetWidth >= window.innerWidth)
                        box_tag.box.style.left = (window.innerWidth - box_tag.box.offsetWidth) + "px";
                }
                else {
                    if (parseFloat(box_tag.box_back.style.top.replace("px", "")) <= 0)
                        box_tag.box_back.style.top = "0px";

                    if (parseFloat(box_tag.box_back.style.top.replace("px", "")) + box_tag.box_back.offsetHeight >= window.innerHeight)
                        box_tag.box_back.style.top = (window.innerHeight - box_tag.box_back.offsetHeight) + "px";

                    if (parseFloat(box_tag.box_back.style.left.replace("px", "")) <= 0)
                        box_tag.box_back.style.left = "0px";

                    if (parseFloat(box_tag.box_back.style.left.replace("px", "")) + box_tag.box_back.offsetWidth >= window.innerWidth)
                        box_tag.box_back.style.left = (window.innerWidth - box_tag.box_back.offsetWidth) + "px";
                }
            }, 30);
        }
    }
    else {
        this.title.style.cursor = "default";
    }

    if (setting.auto_close_times != null) {
        setTimeout(function () {
            box_tag.close();
        }, setting.auto_close_times)
    }

}


