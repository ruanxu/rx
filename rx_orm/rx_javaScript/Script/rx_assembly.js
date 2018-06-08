/// <reference path="rx.js" />
/// <reference path="rx_assembly_config.js" />

//table_element可以是一个dom对象或者是一个对象的id【必须是一个table】
function rx_table(table_element, setting) {
    if (table_element == undefined || table_element == null) {
        throw "rx_table的参数table_element需要一个table的dom元素或者table的dom元素的id！";
    }
    else if (typeof (table_element) == "string") {
        table_element = try_dom_by_id(table_element, false);
        if (table_element == false) {
            throw String.Format("rx_table的参数table_element在id模式下发现id：{0} 不存在！");
        }
    }
    if (table_element.tagName == undefined || table_element.tagName.toLowerCase() != "table") {
        throw "rx_table的参数table_element必须是一个table的dom元素(<table></table>)！";
    }
    if (setting == undefined) {
        throw "rx_table未设置参数setting！";
    }
    var table = table_element;

    setting =
        {
            //指令方法 init|refresh|get_data_setting|get_page_index|get_page_size
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
                    if (setting[item] == undefined || setting[item] == null)
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
            return parseInt(document.getElementById(table_id + "_page_index").innerHTML);
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

        if (class_config.table.trim() != "" && !table.classList.contains(class_config.table)) {
            table.classList.add(class_config.table);
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
            var page_bar = String.Format("<table cellspacing='0' cellpadding='0' class='{0}' id='{1}'><thead><tr><th style='width:40%; text-align:left;'>找到<span class='{2}' id='{3}'></span>条 <span style='color:lightgray;'>|</span> 当前第<span class='{4}' id='{5}'>1</span>页 <span style='color:lightgray;'>|</span> 一共<span class='{6}' id='{7}'></span>页 <span style='color:lightgray;'>|</span> 每页显示 <select class='{8}' id='{9}' style='height:22px; padding:0px;'>{10}</select></th><th style='width:20%; text-align:center;'>跳转至 <input type='number' class='{11}' id='{12}' value='1'/> <button type='button' class='{13}' id='{14}'>跳转</button></th><th style='width:40%; text-align:right;'><button type='button' class='{15}' id='{16}'>◄◄</button> <button class='{17}' id='{18}' type='button'>◄</button> <span class='{19}' id='{20}'></span> <button class='{21}' id='{22}' type='button'>►</button> <button type='button' class='{23}' id='{24}'>►►</button></th></tr></thead></table>",
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
                    (setting.columns[i].ident != undefined ? String.Format("ident='{0}'", setting.columns[i].ident.toString()) : ""),
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
        var report_head_trs = table.getElementsByTagName("thead")[0].getElementsByTagName("tr");
        for (var i = 0; i < report_head_trs.length; i++) {
            if (report_head_trs[i].getAttribute("report_head") == "report_head") {
                show_element(report_head_trs[i]);
            }
        }
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
            if (json_data.length == 0) {
                for (var i = 0; i < report_head_trs.length; i++) {
                    if (report_head_trs[i].getAttribute("report_head") == "report_head") {
                        hide_element(report_head_trs[i]);
                    }
                }
                tbody.appendChild(create_element("<tr><td no_data='no_data' colspan='" + table.children("thead").children("tr").children("th").length + "' style='text-align:center;'>" + setting.no_data_msg + "</td></tr>"));
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
                        //替换html_tag
                        if (html_tag != "") html_tag = html_tag.replace(reg, rows[i][field]);
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
                rx_table(table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
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
                rx_table(table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
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
                var obj = create_element("<button type='button' value='" + i + "' class='" + class_config.page_code_btn + "'>" + i + "</button>");
                obj.onclick = function () {
                    var refresh_data = setting.data;
                    refresh_data.page_index = parseInt(this.value) - 1;
                    refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                    rx_table(table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
                }
                document.getElementById(table_id + "_page_code").appendChild(obj);
            }
            //首页 尾页 翻页事件
            document.getElementById(table_id + "_first_page_btn").onclick = function () {
                if (setting.data.page_index == 0) return;
                var refresh_data = setting.data;
                refresh_data.page_index = 0;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table(table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }
            document.getElementById(table_id + "_last_page_btn").onclick = function () {
                if (setting.data.page_index >= page_count - 1) return;
                var refresh_data = setting.data;
                refresh_data.page_index = page_count - 1;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table(table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }

            //左 右 翻页事件
            document.getElementById(table_id + "_left_page_btn").onclick = function () {
                if (setting.data.page_index == 0) return;
                var refresh_data = setting.data;
                refresh_data.page_index = setting.data.page_index - 1 <= 0 ? 0 : setting.data.page_index - 1;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table(table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
            }
            document.getElementById(table_id + "_right_page_btn").onclick = function () {
                if (setting.data.page_index >= page_count - 1) return;
                var refresh_data = setting.data;
                refresh_data.page_index = setting.data.page_index + 1 >= page_count ? page_count - 1 : setting.data.page_index + 1;
                refresh_data.page_size = document.getElementById(table_id + "_page_list").value;
                rx_table(table_id, { method: "refresh", data: refresh_data, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
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
                rx_table(table_id, { method: "refresh", data: refresh_data, look_more_num: setting.look_more_num, page_ination: setting.page_ination, is_look_more: setting.is_look_more });
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

        var trs;
        var thead = table.getElementsByTagName("thead");
        if (thead.length > 0) {
            trs = thead[0].getElementsByTagName("tr");
            for (var i = 0; i < trs.length; i++) {
                if (trs[i].getAttribute("report_title") == "report_title") {
                    remove_element(trs[i]);
                }
            }
        }
        var tbody = table.getElementsByTagName("tbody");
        if (tbody.length > 0) {
            trs = tbody[0].getElementsByTagName("tr");
            for (var i = 0; i < trs.length; i++) {
                if (trs[i].getAttribute("report_body") == "report_body") {
                    remove_element(trs[i]);
                }
            }
        }
        var tfoot = table.getElementsByTagName("tfoot");
        if (tfoot.length > 0) {
            trs = tfoot[0].getElementsByTagName("tr");
            for (var i = 0; i < trs.length; i++) {
                if (trs[i].getAttribute("report_foot") == "report_foot") {
                    remove_element(trs[i]);
                }
            }
        }

        if (setting.is_look_more == true) {
            document.getElementById(table_id + "_look_more_btn").innerHTML = "<b>⚡</b> 查看更多...";
            document.getElementById(table_id + "_look_more_btn").removeAttribute("disabled");
        }

        ajax_get_json();
    }
}

//select_element可以是一个dom对象或者是一个对象的id【必须是一个select】
function rx_combobox(select_element, setting) {
    if (select_element == undefined || select_element == null) {
        throw "rx_combobox的参数select_element需要一个select的dom元素或者select的dom元素的id！";
    }
    else if (typeof (select_element) == "string") {
        select_element = try_dom_by_id(select_element, false);
        if (select_element == false) {
            throw String.Format("rx_combobox的参数select_element在id模式下发现id：{0} 不存在！");
        }
    }
    if (select_element.tagName == undefined || select_element.tagName.toLowerCase() != "select") {
        throw "rx_combobox的参数select_element必须是一个select的dom元素(<select></select>)！";
    }
    if (setting == undefined) {
        throw "rx_combobox未设置参数setting！";
    }
    var combobox = select_element;

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
                    if (setting[item] == undefined || setting[item] == null)
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
        if (class_config.select.trim() != "" && !combobox.contains(class_config.select)) {
            combobox.classList.add(class_config.select)
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
        throw "rx_repeater的参数repeater_element需要一个dom元素或者是dom元素的id！";
    }
    else if (typeof (repeater_element) == "string") {
        repeater_element = try_dom_by_id(repeater_element, false);
        if (repeater_element == false) {
            throw String.Format("rx_repeater的参数repeater_element在id模式下发现id：{0} 不存在！");
        }
    }
    if (setting == undefined) {
        throw "rx_repeater未设置参数setting！";
    }
    var repeater = repeater_element;
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
                    if (setting[item] == undefined || setting[item] == null)
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
        if (class_config.repeater.trim() != "" && !repeater.contains(class_config.repeater)) {
            repeater.classList.add(class_config.repeater);
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
        html_text += foot != undefined ?  foot[0] : "";

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
        
    }

    function refresh() { init(); }
}

//form_element可以是任何一个html元素，不局限于form元素
function rx_form(form_element, setting) {
    if (form_element == undefined || form_element == null) {
        throw "rx_form的参数form_element需要一个dom元素或者是dom元素的id！";
    }
    else if (typeof (form_element) == "string") {
        form_element = try_dom_by_id(form_element, false);
        if (form_element == false) {
            throw String.Format("rx_form的参数form_element在id模式下发现id：{0} 不存在！");
        }
    }
    if (setting == undefined) {
        throw "rx_form未设置参数setting！";
    }
    var form = form_element;

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
        //初始化就清空setting
        if (setting.method == "init") {
            form.removeAttribute("setting");
        }
            //否则就替换和覆盖
        else {
            var c_setting = JSON.parse(form.getAttribute("setting"));
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
                            form_elements[i].checked = false;
                            break;
                        default:
                            form_elements[i].value = "";
                            form_elements[i].innerHTML = "";
                            break;
                    }
                }
            }
            var values = json_data[field].split(setting.split);
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
            change(json_data, xml);
        }
    }

    function revert() {
        if (form.getAttribute("data") == null) {
            throw "rx_form必须先进行数据加载(load)才能使用revert还原数据";
        }

        load(JSON.parse(form.getAttribute("data")));
    }
}

function message_box_show() {
    return "未实现";
}


