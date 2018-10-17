/// <reference path="rx.js" />
//服务器项目类型枚举
var server_project_type = {
    asp_net_handle: "asp_net_handle",
    asp_net_web_form: "asp_net_web_form",
    asp_net_mvc: "asp_net_mvc",
    asp_net_mvc_api: "asp_net_mvc_api"
};

/*前端rx_maager，与后端rx_manager一致
 * 所有回调函数call_back的参数都是data与xml
*/
var rx_manager = {
    /*-----------------------------配置begin*/
    /*服务接口地址需要在使用前或者使用中进行配置
    * asp.net mvc项目server_url要指定继承rx_mvc_controller的控制器的地址
    * asp.net mvc api项目server_url要指定继承rx_mvc_api_controller的api控制器的地址
    * asp.net handle项目server_url要指定继承rx_handle的一般处理程序的地址
    * asp.net web_form项目server_url要指定继承rx_web_form的web窗体的地址
    */
    server_url: "/rx_api",
    //项目类型，具体参考枚举server_project_type中的值
    project_type: server_project_type.asp_net_mvc,
    //是否启用默认的error事件
    is_show_error: true,
    //是否启用参数加密签名(sign)
    is_encryption: true,
    /*-----------------------------配置end*/

    /*-----------------------------各种orm方法begin*/
    /* 通用分页存储过程
     * call_back 回调函数，参数data与xml【必选】
     * page_index 页码，默认值0【必选】
     * page_size 页大小，默认值10【必选】
     * table_or_view_name 存在的表名或者视图名【必选】
     * order_identity_string 排序字段，默认值：id asc。例：id asc,name desc......
     * field_string 需要显示的列，默认值：*。例：id,name......
     * where_string 条件字符串，默认值：""。例： and id = 1 and name = 'jack'......
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     */
    get_entitys_by_page: function (call_back, page_index, page_size, table_or_view_name, order_identity_string, field_string, where_string, date_time_format) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        page_index = page_index || 0;
        page_size = page_size || 10;
        page_index = isNaN(page_index) ? 0 : page_index;
        page_size = isNaN(page_size) ? 10 : page_size;

        if (table_or_view_name == undefined || table_or_view_name == null || table_or_view_name.trim() == "") {
            throw "table_or_view_name必须是一个表名或者视图或者一个子查询的字符串！";
        }
        order_identity_string = (order_identity_string == undefined || order_identity_string == null) ? "id" : order_identity_string.toString();
        field_string = (field_string == undefined || field_string == null) ? "*" : field_string.toString();
        where_string = (where_string == undefined || where_string == null) ? "" : where_string.toString();
        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;

        try {
            ajax({
                url: server_project_type.build_url("get_entitys_by_page"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_entitys_by_page.toString().replace(/[ |\r|\n]/g, "")),
                    page_index: page_index,
                    page_size: page_size,
                    table_or_view_name: table_or_view_name,
                    order_identity_string: order_identity_string,
                    field_string: field_string,
                    where_string: where_string,
                    date_time_format: date_time_format
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_entitys_by_page)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }

    },
    /* 通过视图获取实体集合
     * call_back 回调函数，参数data与xml【必选】
     * view_name 一个存在视图名称，不存在服务端会出现异常【必选】
     * where_string 条件字符串，默认值：""。例： and id = 1 and name = 'jack'......
     * select_display_keys 需要显示的列，默认值：*。例：id,name......
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     */
    get_entitys_in_view: function (call_back, view_name, where_string, select_display_keys, date_time_format) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (view_name == undefined || view_name == null || view_name.trim() == "") {
            throw "view_name必须是一个存在的视图名称！";
        }
        where_string = (where_string == undefined || where_string == null) ? "" : where_string;
        select_display_keys = select_display_keys || "";
        select_display_keys = select_display_keys.replace(",", "[{@}]");
        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;
        try {
            ajax({
                url: server_project_type.build_url("get_entitys_in_view"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_entitys_in_view.toString().replace(/[ |\r|\n]/g, "")),
                    view_name: view_name,
                    where_string: where_string,
                    select_display_keys: select_display_keys,
                    date_time_format: date_time_format
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_entitys_in_view)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 通过存储过程获取实体集合，适用于查询操作
     * call_back 回调函数，参数data与xml【必选】
     * proc_name 存储过程的名称，存储过程必须是自定义创建必能是系统存储过程【必选】
     * proc_params 存储过程参数SqlParameter类型的数组（Array），可以为null或者undefined(调用无参存储过程)，使用方式与C#中的SqlParameter一直
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     */
    get_entitys_in_proc: function (call_back, proc_name, proc_params, date_time_format) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (proc_name == undefined || proc_name == null || proc_name.trim() == "") {
            throw "proc_name必须是一个存在的存储过程！";
        }
        proc_params = proc_params || null;
        if (proc_params != null && !(proc_params instanceof Array)) {
            throw "proc_params必须是一个数组（Array），其中元素的类型必须是SqlParameter类型，数组长度为0将执行无参存储过程！";
        }
        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;

        try {
            ajax({
                url: server_project_type.build_url("get_entitys_in_proc"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_entitys_in_proc.toString().replace(/[ |\r|\n]/g, "")),
                    proc_name: proc_name,
                    proc_params: JSON.stringify(proc_params),
                    date_time_format: date_time_format
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_entitys_in_proc)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 使用事物机制批量执行dml【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk才能使用这个危险的Action！】
     * call_back [回调函数，参数data与xml【必选】
     * rx_entitys_or_full_sql_string rx_entity(rx_model)的数组或者是多条dml（t-sql）语句的字符串【必选】
     * 【注意】如果是rx_entity(rx_model)的数组要求就与后端orm一致，
     * rx_entity(rx_model)对象受dml_command_type属性的影响，dml_command_type的值不能是默认值vague，必须是明确的update、delete、insert，根据dml_command_type属性值动态执行dml语句
     * rx_entity(rx_model)对象可以指定is_use_null
     * rx_entity(rx_model)对象可以指定where_keys
     * rx_entity(rx_model)对象的entity_name必须包含在当前数据库的表名中
     */
    transaction_execute_non_query: function (call_back, rx_entitys_or_full_sql_string) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (rx_entitys_or_full_sql_string == undefined || rx_entitys_or_full_sql_string == null) {
            rx_entitys_or_full_sql_string = "";
        }
        var data = {};
        if ((typeof rx_entitys_or_full_sql_string).toString().toLocaleLowerCase() == "string") {
            data.full_sql_string = rx_entitys_or_full_sql_string;
        }
        else if (rx_entitys_or_full_sql_string instanceof Array) {
            var entity_array = [];
            for (var i = 0; i < rx_entitys_or_full_sql_string.length; i++) {
                if (rx_entitys_or_full_sql_string[i] instanceof rx_model) {
                    rx_entitys_or_full_sql_string[i] = rx_entitys_or_full_sql_string[i].rx_entity;
                }
                if (!(rx_entitys_or_full_sql_string[i] instanceof rx_entity)) {
                    throw "rx_entitys_or_full_sql_string的索引 " + i + " 处的元素不是rx_entity(rx_model)对象";
                }
                entity_array[i] = { rx_fields: [] };
                var fields = [];
                for (var key in rx_entitys_or_full_sql_string[i]) {
                    if (!(rx_entitys_or_full_sql_string[i][key] instanceof rx_field))
                        entity_array[i][key] = rx_entitys_or_full_sql_string[i][key];
                    else
                        fields.push(rx_entitys_or_full_sql_string[i][key]);
                }
                entity_array[i].rx_fields = fields;
            }
            data.entity_array = JSON.stringify(entity_array);
        }
        else {
            throw "rx_entitys_or_full_sql_string必须是rx_entity(rx_model)的数组或者是多条dml（t-sql）语句的字符串";
        }
        data.rx_function = md5(this.transaction_execute_non_query.toString().replace(/[ |\r|\n]/g, ""));
        try {
            ajax({
                url: server_project_type.build_url("transaction_execute_non_query"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "put" : "post",
                data: data,
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(transaction_execute_non_query)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 执行sql查询，只能是查询语句，临时列要指定列名
     * call_back 回调函数，参数data与xml【必选】
     * sql sql查询语句的字符串，只能是查询语句，注入无门【必选】
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     */
    execute_select_sql: function (call_back, sql, date_time_format) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        sql = (sql == undefined || sql == null) ? "" : sql.toString();
        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;

        try {
            ajax({
                url: server_project_type.build_url("execute_select_sql"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.execute_select_sql.toString().replace(/[ |\r|\n]/g, "")),
                    sql: sql,
                    date_time_format: date_time_format
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(execute_select_sql)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 执行存储过程获取dml_result,适用于dml操作,output值可以在tag属性中得到
     * call_back 回调函数，参数data与xml【必选】
     * proc_name 存储过程的名称，存储过程必须是自定义创建必能是系统存储过程【必选】
     * param_array 存储过程参数SqlParameter类型的数组（Array），可以为null或者undefined(调用无参存储过程)，使用方式与C#中的SqlParameter一致
     * command_type 与ADO.NET的CommandType一致，默认为StoredProcedure（执行存储过程）
     */
    execute_non_query: function (call_back, sql_or_proc_name, param_array, command_type) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (sql_or_proc_name == undefined || sql_or_proc_name == null || sql_or_proc_name.trim() == "") {
            throw "sql_or_proc_name必须是一个存在的存储过程名称或者单条sql！";
        }
        param_array = param_array || null;
        command_type = command_type || CommandType.StoredProcedure;
        if (param_array != null && !(param_array instanceof Array)) {
            throw "param_array必须是一个数组（Array），其中元素的类型必须是SqlParameter类型，数组长度为0将执行无参存储过程！";
        }

        try {
            ajax({
                url: server_project_type.build_url("execute_non_query"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "put" : "post",
                data: {
                    rx_function: md5(this.execute_non_query.toString().replace(/[ |\r|\n]/g, "")),
                    sql_or_proc_name: sql_or_proc_name,
                    param_array: JSON.stringify(param_array),
                    command_type: command_type
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(execute_non_query)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 根据表名获取所有实体对象集合
     * call_back 回调函数，参数data与xml【必选】
     * table_or_view_name 表名或者视图名，必须是存在的表或者视图【必选】
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     * select_display_keys:指定需要显示的列名，null或者undefined为*，分隔符","，例：id,name,age
     */
    get_all_entitys: function (call_back, table_or_view_name, date_time_format, select_display_keys) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (table_or_view_name == undefined || table_or_view_name == null || table_or_view_name.trim() == "") {
            throw "table_or_view_name必须是一个存在的表名称！";
        }
        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;
        select_display_keys = select_display_keys || "";
        select_display_keys = select_display_keys.replace(",", "[{@}]");
        try {
            ajax({
                url: server_project_type.build_url("get_all_entitys"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_all_entitys.toString().replace(/[ |\r|\n]/g, "")),
                    table_or_view_name: table_or_view_name,
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_all_entitys)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 根据表名获取所有实体的总数量
     * call_back 回调函数，参数data与xml【必选】
     * table_or_view_name 表名或者视图名，必须是存在的表或者视图【必选】
     * where_string 条件字符串，默认值：""。例： and id = 1 and name = 'jack'......
     */
    get_entity_count: function (call_back, table_or_view_name, where_string) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (table_or_view_name == undefined || table_or_view_name == null || table_or_view_name.trim() == "") {
            throw "table_or_view_name必须是一个存在的表名称！";
        }
        where_string = (where_string == undefined || where_string == null) ? "" : where_string;
        try {
            ajax({
                url: server_project_type.build_url("get_entity_count"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_entity_count.toString().replace(/[ |\r|\n]/g, "")),
                    table_or_view_name: table_or_view_name,
                    where_string: where_string
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_entity_count)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 根据表名和id获取实体的单个对象
     * call_back 回调函数，参数data与xml【必选】
     * table_name 表名，必须是存在的表【必选】
     * id 表的id值,必须是一个数字【必选】
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     * select_display_keys:指定需要显示的列名，null或者undefined为*，分隔符","，例：id,name,age
     */
    get_entity_by_id: function (call_back, table_name, id, date_time_format, select_display_keys) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (table_name == undefined || table_name == null || table_name.trim() == "") {
            throw "table_name必须是一个存在的表名称！";
        }
        if (id == undefined || id == null) {
            throw "id不能为null或undefined，且必须是一个数字！";
        }
        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;
        select_display_keys = select_display_keys || "";
        select_display_keys = select_display_keys.replace(",", "[{@}]");
        try {
            ajax({
                url: server_project_type.build_url("get_entity_by_id"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_entity_by_id.toString().replace(/[ |\r|\n]/g, "")),
                    table_name: table_name,
                    id: id,
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_entity_by_id)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 根据表名和id的数组获取的对象的集合
     * call_back 回调函数，参数data与xml【必选】
     * table_name 表名，必须是存在的表【必选】
     * id_array 表的id值的数组(数组长度必须大于0),必须是数组且数组的元素必须是一个数字【必选】
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     * select_display_keys:指定需要显示的列名，null或者undefined为*，分隔符","，例：id,name,age
     */
    get_entitys_in_id: function (call_back, table_name, id_array, date_time_format, select_display_keys) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (table_name == undefined || table_name == null || table_name.trim() == "") {
            throw "table_name必须是一个存在的表名称！";
        }
        if (id_array == undefined || id_array == null || !(id_array instanceof Array) || id_array.length <= 0) {
            throw "id_array不能为null或undefined，且必须是一个数组(数组长度必须大于0)！";
        }
        for (var i = 0; i < id_array.length; i++) {
            if ((typeof id_array[i]).toString().toLowerCase() != "number") {
                throw "id_array索引" + i + "位置的元素不是一个数字！";
            }
        }
        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;
        select_display_keys = select_display_keys || "";
        select_display_keys = select_display_keys.replace(",", "[{@}]");
        try {
            ajax({
                url: server_project_type.build_url("get_entitys_in_id"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_entitys_in_id.toString().replace(/[ |\r|\n]/g, "")),
                    table_name: table_name,
                    id_array: id_array.join("[{@}]"),
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_entitys_in_id)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 根据实体对象的where_keys属性进行指定的where条件查询
    * entity 【必选】参与条件查询的rx_entity对象，需要参与where条件的where_keys属性,可以使用参数设置where_keys,也可以使用set_where_keys方法指定where条件字段的key,必须是当前实体中存在的key,否则会出现异常
    * select_display_keys 指定需要显示的列名，null或者undefined为*，分隔符","，例：id,name,age
    * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
    */
    get_entitys_by_where_keys: function (call_back, entity, select_display_keys, date_time_format) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }

        if (!(entity instanceof rx_entity)) {
            entity = entity.rx_entity;
            if (!(entity instanceof rx_entity)) {
                throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
            }
        }

        var do_entity = { rx_fields: [] };
        var fields = [];
        for (var key in entity) {
            if (!(entity[key] instanceof rx_field))
                do_entity[key] = entity[key];
            else
                fields.push(entity[key]);
        }
        do_entity.rx_fields = fields;

        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;
        select_display_keys = select_display_keys || "";
        select_display_keys = select_display_keys.replace(",", "[{@}]");
        try {
            ajax({
                url: server_project_type.build_url("get_entitys_by_where_keys"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_entitys_by_where_keys.toString().replace(/[ |\r|\n]/g, "")),
                    entity: JSON.stringify(do_entity),
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_entitys_by_where_keys)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 根据where_string查询符合条件的实体对象
     * call_back 回调函数，参数data与xml【必选】
     * table_name 表名，必须是存在的表【必选】
     * where_string 参与条件运算的自短传字符串，例子：and id = 1 or name = 'jack'【必选】
     * select_display_keys:指定需要显示的列名，null或者undefined为*，分隔符","，例：id,name,age
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     */
    get_entitys_by_where_string: function (call_back, table_name, where_string, select_display_keys, date_time_format) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (table_name == undefined || table_name == null || table_name.trim() == "") {
            throw "table_name必须是一个存在的表名！";
        }
        if (where_string == undefined || typeof (where_string).toString().toLowerCase() != "string") {
            throw "where_string必须是一个字符串";
        }

        date_time_format = (date_time_format == undefined || date_time_format == null || !date_format_type.contains(date_time_format)) ? date_format_type.date_time : date_time_format;
        select_display_keys = select_display_keys || "";
        select_display_keys = select_display_keys.replace(",", "[{@}]");
        try {
            ajax({
                url: server_project_type.build_url("get_entitys_by_where_string"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "get" : "post",
                data: {
                    rx_function: md5(this.get_entitys_by_where_string.toString().replace(/[ |\r|\n]/g, "")),
                    table_name: table_name,
                    where_string: where_string,
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(get_entitys_by_where_string)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }

    },
    /* 根据表名进行添加或者修改操作,对象的id为0或者null进行添加操作，否则就会根据id进行修改操作。进行添加操作时返回结果的tag属性是新数据的id值【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_insert与i_rx_risk_update接口才能使用这个危险的Action！】
     * call_back 回调函数，参数data与xml【必选】
     * entity 要进行添加的rx_entity的对象【必选】
     */
    insert_or_update_entity: function (call_back, entity) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (!(entity instanceof rx_entity)) {
            entity = entity.rx_entity;
            if (!(entity instanceof rx_entity)) {
                throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
            }
        }

        var do_entity = { rx_fields: [] };
        var fields = [];
        for (var key in entity) {
            if (!(entity[key] instanceof rx_field))
                do_entity[key] = entity[key];
            else
                fields.push(entity[key]);
        }
        do_entity.rx_fields = fields;

        try {
            ajax({
                url: server_project_type.build_url("insert_or_update_entity"),
                type: "post",
                data: {
                    rx_function: md5(this.insert_or_update_entity.toString().replace(/[ |\r|\n]/g, "")),
                    entity: JSON.stringify(do_entity)
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(insert_or_update_entity)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 指定表名进行单行添加操作,返回结果的tag属性是新数据的id值【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_insert接口才能使用这个危险的Action！】
     * call_back 回调函数，参数data与xml【必选】
     * entity 要进行添加的rx_entity的对象【必选】
     */
    insert_entity: function (call_back, entity) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (!(entity instanceof rx_entity)) {
            entity = entity.rx_entity;
            if (!(entity instanceof rx_entity)) {
                throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
            }
        }

        var do_entity = { rx_fields: [] };
        var fields = [];
        for (var key in entity) {
            if (!(entity[key] instanceof rx_field))
                do_entity[key] = entity[key];
            else
                fields.push(entity[key]);
        }
        do_entity.rx_fields = fields;

        try {
            ajax({
                url: server_project_type.build_url("insert_entity"),
                type: "post",
                data: {
                    rx_function: md5(this.insert_entity.toString().replace(/[ |\r|\n]/g, "")),
                    entity: JSON.stringify(do_entity)
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    if (data.code == "success") {
                        entity.id = new rx_field("id", data.tag, entity);
                    }
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(insert_entity)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 指定表名进行多行添加操作【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_insert接口才能使用这个危险的Action！】
     * call_back 回调函数，参数data与xml【必选】
     * entitys rx_entity的数组【必选】
     */
    insert_entitys: function (call_back, entitys) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }

        var data = {};
        if (entitys instanceof Array) {
            var entity_array = [];
            for (var i = 0; i < entitys.length; i++) {
                if (!(entitys[i] instanceof rx_entity)) {
                    throw "entitys的索引 " + i + " 处的元素不是rx_entity对象";
                }
                entity_array[i] = { rx_fields: [] };
                var fields = [];
                for (var key in entitys[i]) {
                    if (!(entitys[i][key] instanceof rx_field))
                        entity_array[i][key] = entitys[i][key];
                    else
                        fields.push(entitys[i][key]);
                }
                entity_array[i].rx_fields = fields;
            }
            data.entity_array = JSON.stringify(entity_array);
        }
        else {
            throw "entitys必须是rx_entity的数组";
        }
        data.rx_function = md5(this.insert_entitys.toString().replace(/[ |\r|\n]/g, ""));
        try {
            ajax({
                url: server_project_type.build_url("insert_entitys"),
                type: "post",
                data: data,
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(insert_entitys)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 指定表名进行单行修改操作,必须指定id【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_update接口才能使用这个危险的Action！】
     * call_back 回调函数，参数data与xml【必选】
     * entity 需要进行修改操作的rx_entity对象【必选】
     */
    update_entity_by_id: function (call_back, entity) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (!(entity instanceof rx_entity)) {
            throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
        }

        var do_entity = { rx_fields: [] };
        var fields = [];
        for (var key in entity) {
            if (!(entity[key] instanceof rx_field))
                do_entity[key] = entity[key];
            else
                fields.push(entity[key]);
        }
        do_entity.rx_fields = fields;

        try {
            ajax({
                url: server_project_type.build_url("update_entity_by_id"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "put" : "post",
                data: {
                    rx_function: md5(this.update_entity_by_id.toString().replace(/[ |\r|\n]/g, "")),
                    entity: JSON.stringify(do_entity)
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(update_entity_by_id)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 根据实体的where_keys修改符合条件的实体对象
     * call_back 回调函数，参数data与xml【必选】
     * entity 需要进行修改操作的rx_entity对象【必选】
     */
    update_entity_by_where_keys: function (call_back, entity) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }

        if (!(entity instanceof rx_entity)) {
            entity = entity.rx_entity;
            if (!(entity instanceof rx_entity)) {
                throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
            }
        }

        var do_entity = { rx_fields: [] };
        var fields = [];
        for (var key in entity) {
            if (!(entity[key] instanceof rx_field))
                do_entity[key] = entity[key];
            else
                fields.push(entity[key]);
        }
        do_entity.rx_fields = fields;

        try {
            ajax({
                url: server_project_type.build_url("update_entity_by_where_keys"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "put" : "post",
                data: {
                    rx_function: md5(this.update_entity_by_where_keys.toString().replace(/[ |\r|\n]/g, "")),
                    entity: JSON.stringify(do_entity)
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(update_entity_by_where_keys)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 指定表名进行单行删除操作【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_delete接口才能使用这个危险的Action！】
     * call_back 回调函数，参数data与xml【必选】
     * table_name 表名，必须是存在的表【必选】
     * id 表的id值,必须是一个数字【必选】
     */
    delete_entity_by_id: function (call_back, table_name, id) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (table_name == undefined || table_name == null || table_name.trim() == "") {
            throw "table_name必须是一个存在的表名称！";
        }
        if (id == undefined || id == null) {
            throw "id不能为null或undefined，且必须是一个数字！";
        }

        try {
            ajax({
                url: server_project_type.build_url("delete_entity_by_id"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "delete" : "post",
                data: {
                    rx_function: md5(this.delete_entity_by_id.toString().replace(/[ |\r|\n]/g, "")),
                    table_name: table_name,
                    id: id
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(delete_entity_by_id)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 指定表名进行多行in删除操作【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_delete接口才能使用这个危险的Action！】
     * call_back 回调函数，参数data与xml【必选】
     * table_name 表名，必须是存在的表【必选】
     * id_array 表的id值的数组,数组元素必须是数字【必选】
     */
    delete_entity_in_id: function (call_back, table_name, id_array) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (table_name == undefined || table_name == null || table_name.trim() == "") {
            throw "table_name必须是一个存在的表名称！";
        }
        if (!(id_array instanceof Array)) {
            throw "id_array必须是一个数组！";
        }
        id_array = id_array.join("[{@}]").toString();
        try {
            ajax({
                url: server_project_type.build_url("delete_entity_in_id"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "delete" : "post",
                data: {
                    rx_function: md5(this.delete_entity_in_id.toString().replace(/[ |\r|\n]/g, "")),
                    table_name: table_name,
                    id_array: id_array
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(delete_entity_in_id)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 指定表名进行where_string删除操作【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_delete接口才能使用这个危险的Action！】
     * call_back 回调函数，参数data与xml【必选】
     * table_name 表名，必须是存在的表【必选】
     * where_string 条件语句字符串【必选】
     */
    delete_entity_by_where_string: function (call_back, table_name, where_string) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (table_name == undefined || table_name == null || table_name.trim() == "") {
            throw "table_name必须是一个存在的表名称！";
        }
        if (where_string == undefined || where_string == null) {
            throw "where_string不能为null或undefined，且必须是一个条件语句字符串！";
        }

        try {
            ajax({
                url: server_project_type.build_url("delete_entity_by_where_string"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "delete" : "post",
                data: {
                    rx_function: md5(this.delete_entity_by_where_string.toString().replace(/[ |\r|\n]/g, "")),
                    table_name: table_name,
                    where_string: where_string
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(delete_entity_by_where_string)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /* 根据实体的where_keys删除符合条件的实体对象
     * call_back 回调函数，参数data与xml【必选】
     * entity 需要进行修改操作的rx_entity对象【必选】
     */
    delete_entity_by_where_keys: function (call_back, entity) {
        try { throw new Error(); } catch (e) { var stack = e.stack.toString().toLowerCase(); if (stack.indexOf("unknown") != -1 || stack.indexOf("anonymous") != -1 || stack.indexOf("debugger") != -1 || stack.indexOf("eval code") != -1) return; }
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }

        if (!(entity instanceof rx_entity)) {
            entity = entity.rx_entity;
            if (!(entity instanceof rx_entity)) {
                throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
            }
        }

        var do_entity = { rx_fields: [] };
        var fields = [];
        for (var key in entity) {
            if (!(entity[key] instanceof rx_field))
                do_entity[key] = entity[key];
            else
                fields.push(entity[key]);
        }
        do_entity.rx_fields = fields;

        try {
            ajax({
                url: server_project_type.build_url("delete_entity_by_where_keys"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "put" : "post",
                data: {
                    rx_function: md5(this.delete_entity_by_where_keys.toString().replace(/[ |\r|\n]/g, "")),
                    entity: JSON.stringify(do_entity)
                },
                is_encryption: this.is_encryption,
                success: function (data, xml) {
                    call_back(data, xml);
                },
                error: function (response_text, xml, status, status_text) {
                    if (!rx_manager.is_show_error) return;
                    if (confirm(String.Format("(delete_entity_by_where_keys)服务器异常！\nxml:{0}\nstatus:{1}\nstatus_text:{2}\n是否查看response_text？",
                            xml, status, status_text))) {
                        alert(response_text);
                    }
                }
            });
        } catch (e) {
            throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
        }
    },
    /*-----------------------------各种orm方法end*/

    /*-----------------------------各种orm辅助方法begin*/

    /* 根据该实体的内容生成update语句
    * 如：update table_name set a = 1,b = 2,c = 3 [where d = 1 and e = 2 or f = 3]
    * 会根据这个实体的机构和属性进行生成
    * 生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成
    */
    transaction_update_string_build: function (entity_or_model) {
        var entity = entity_or_model;
        if (!(entity instanceof rx_entity)) {
            entity = entity.rx_entity;
            if (!(entity instanceof rx_entity)) {
                throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
            }
        }

        entity = entity.clone();
        var sql = String.Format(" update {0} set ", entity.entity_name);
        var where_query = "";
        var entity_query = "";
        if (entity.where_keys == null || entity.where_keys.length == 0) {
            if (!(entity.id instanceof rx_field)) {
                throw String.Format("实体对象where_keys属性为null并且不存在key为id的rx_field！");
            }
            if (entity.id.value == null) {
                throw String.Format("实体对象where_keys属性为null并且id值不能为null");
            }

            var right_num = entity.id.value == null ? 0 : entity.id.value.toString().split(')').length;
            var num = 3 + right_num + Math.round(Math.random() * (11 + right_num));
            var left = new Array(num + 1).join('(');
            var right = new Array(num + 1).join(')');

            where_query += String.Format(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
            entity.Remove("id");
        }
        else {
            for (var i = 0; i < entity.where_keys.length; i++) {
                var where_key = entity.where_keys[i];
                if (entity.Keys.indexOf(where_key) != -1) {
                    if (where_query.length == 0) {
                        where_query += entity[where_key].build_query(false).replace(entity[where_key].logic_symbol.toString(), "where");
                    }
                    else {
                        where_query += entity[where_key].build_query(false);
                    }
                    entity.Remove(where_key);
                }
                else if (where_key == "id") {
                    var right_num = entity.id.value == null ? 0 : entity.id.value.toString().split(')').length;
                    var num = 3 + right_num + Math.round(Math.random() * (11 + right_num));
                    var left = new Array(num + 1).join('(');
                    var right = new Array(num + 1).join(')');
                    if (where_query.length == 0) {
                        where_query += String.Format(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                    }
                    else {
                        where_query += String.Format(" and id = {0}'{1}'{2} ", left, entity["id"].value, right);
                    }
                }
                else {
                    throw String.Format("实体对象中where_keys属性中的值{0}在实体{1}中不存在,或者实体对象的is_use_null值为false而该key的值也为null！", where_key, entity.entity_name);
                }
            }
        }
        if (entity.Keys.indexOf("id") != -1 && entity["id"].auto_remove) {
            entity.Remove("id");
        }
        for (var i = 0 ; i < entity.Keys.length; i++) {
            var key = entity.Keys[i];
            if (entity[key].value != null || entity[key].value == null && entity.is_use_null) {

                if (entity_query.length > 0) entity_query += (",");
                entity_query += (entity[key].build_query_not_symbol(false));
            }
        }
        if (entity_query.length == 0) {
            throw String.Format("实体对象中需要修改操作的字段都为null或者不存在,或者实体对象的is_use_null值为false而需要修改的key值也为null！");
        }
        sql += (entity_query);
        sql += (where_query);

        return sql;
    },
    /* 根据该实体的内容生成delete语句
    * 如 :delete from table_name [where a = 1 and b = 2 or c = 3]
    * <param name="entity">会根据这个实体的机构和属性进行生成
    * 生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成
    */
    transaction_delete_string_build: function (entity_or_model) {
        var entity = entity_or_model;
        if (!(entity instanceof rx_entity)) {
            entity = entity.rx_entity;
            if (!(entity instanceof rx_entity)) {
                throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
            }
        }

        entity = entity.clone();
        var sql = String.Format(" delete from {0} ", entity.entity_name);
        var where_query = "";

        if (entity.where_keys == null || entity.where_keys.length == 0) {
            if (entity.Keys.indexOf("id") != -1) {
                var right_num = entity.id.value == null ? 0 : entity.id.value.toString().split(')').length;
                var num = 3 + right_num + Math.round(Math.random() * (11 + right_num));
                var left = new Array(num + 1).join('(');
                var right = new Array(num + 1).join(')');

                where_query += String.Format(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
            }
            else {
                throw String.Format("实体对象的key中不存在id！");
            }
        }
        else {
            for (var i = 0; i < entity.where_keys.length; i++) {
                var where_key = entity.where_keys[i];
                if (entity.Keys.indexOf(where_key) != -1) {
                    if (where_query.length == 0) {
                        where_query += (entity[where_key].build_query(false).replace(entity[where_key].logic_symbol, "where"));
                    }
                    else {
                        where_query += (entity[where_key].build_query(false));
                    }
                    entity.Remove(where_key);
                }
                else if (where_key == "id") {
                    var right_num = entity.id.value == null ? 0 : entity.id.value.toString().split(')').length;
                    var num = 3 + right_num + Math.round(Math.random() * (11 + right_num));
                    var left = new Array(num + 1).join('(');
                    var right = new Array(num + 1).join(')');

                    if (where_query.length == 0) {
                        where_query += String.Format(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                    }
                    else {
                        where_query += String.Format(" and id = {0}'{1}'{2} ", left, entity["id"].value, right);
                    }
                }
                else {
                    throw String.Format("实体对象中where_keys属性中的值{0}在实体{1}中不存在,或者实体对象的is_use_null值为false而该key的值也为null！", where_key, entity.entity_name);
                }
            }
        }
        sql += (where_query);

        return sql;
    },
    /* 根据该实体的内容生成insert语句
    * 如 :insert table_name (a,b,c) values('1','2','3')
    * 会根据这个实体的机构和属性进行生成
    * 生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成
    */
    transaction_insert_string_build: function (entity_or_model) {
        var entity = entity_or_model;
        if (!(entity instanceof rx_entity)) {
            entity = entity.rx_entity;
            if (!(entity instanceof rx_entity)) {
                throw "entity_or_model必须是一个rx_entity对象或者rx_modeld对象！";
            }
        }

        var insert_field = "";
        var insert_value = "";
        for (var i = 0; i < entity.Keys.length; i++) {
            key = entity.Keys[i];
            var is_null_value = entity[key].value == null;
            var right_num = is_null_value ? 0 : entity[key].value.toString().split(')').length;
            var num = 3 + right_num + Math.round(Math.random() * (11 + right_num));
            var left = new Array(num + 1).join('(');
            var right = new Array(num + 1).join(')');
            if (entity[key].value != null) {
                if (key != "id") {
                    if (insert_field.length > 0) {
                        insert_field += (",");
                        insert_value += (",");
                    }
                    insert_field += ("[" + key + "]");
                    insert_value += String.Format("{0}{1}{2}{3}{4}", left, entity[key].build_quote ? "'" : "", entity[key].value, entity[key].build_quote ? "'" : "", right);
                }
            }
            else {
                if (entity.is_use_null && key != "id") {
                    if (insert_field.length > 0) {
                        insert_field += (",");
                        insert_value += (",");
                    }
                    insert_field += ("[" + key + "]");
                    insert_value += ("null");
                }
            }
        }

        if (insert_field.length == 0 || insert_value.length == 0) {
            throw String.Format("实体的对象中所有需要进行添加操作的key中的值都为null,或者实体对象的is_use_null值为false而该key的值也为null！");
        }

        return String.Format(" insert {0} ({1}) values({2}) ", entity.entity_name, insert_field, insert_value);
    }

    /*-----------------------------各种orm辅助方法end*/
};

server_project_type.build_url = function (method_name) {
    switch (rx_manager.project_type) {
        case server_project_type.asp_net_web_form:
            return rx_manager.server_url + "?rx_method=" + method_name;
            break;
        case server_project_type.asp_net_handle:
            return rx_manager.server_url + "?rx_method=" + method_name;
            break;
        case server_project_type.asp_net_mvc:
            return rx_manager.server_url + "/rx_index_action?rx_method=" + method_name;
            break;
        case server_project_type.asp_net_mvc_api:
            return rx_manager.server_url + "?api_action=" + method_name;
            break;
        default:
            throw "请检查rx_manager脚本中rx_manager.project_type的配置项！";
            break;
    }
}

/* C# SqlParameter
* parameterName【必选】
* value【必选】
* parameterDirection 默认值Input，参考枚举ParameterDirection
*/
function SqlParameter(parameterName, value, parameterDirection) {
    this.ParameterName = parameterName;
    this.Value = value;
    this.Direction = (parameterDirection != undefined && ParameterDirection.contains(parameterDirection)) ? parameterDirection : ParameterDirection.Input;
}

// ParameterDirection枚举
var ParameterDirection = {
    Input: "Input",
    Output: "Output",
    InputOutput: "InputOutput",
    ReturnValue: "ReturnValue",
    contains: function (value) {
        var reg = false;
        for (var key in ParameterDirection) {
            if (key != "contains") {
                if (ParameterDirection[key] == value.toString()) {
                    reg = true;
                    break;
                }
            }
        }
        return reg;
    }
};

// DBDommand的CommandType枚举，这里就不多解释了
var CommandType =
{
    Text: "Text",
    StoredProcedure: "StoredProcedure",
    TableDirect: "TableDirect"
}

// 时间格式化类型枚举
var date_format_type = {
    //yyyy-MM-dd HH:mm:ss
    date_time: "date_time",
    //yyyy-MM-dd
    date: "date",
    //HH:mm:ss
    time: "time",
    //yyyy-MM-dd HH:mm
    year_month_day_hour_minute: "year_month_day_hour_minute",
    //yyyy-MM-dd HH
    year_month_day_hour: "year_month_day_hour",
    //yyyy-MM
    year_month: "year_month",
    //HH:mm
    hour_minute: "hour_minute",
    //yyyy
    year: "year",
    //MM
    month: "month",
    //dd
    day: "day",
    //HH
    hour: "hour",
    //mm
    minute: "minute",
    //ss
    second: "second",
    //这一天是星期几
    day_of_week: "day_of_week",
    //这一年的第几天
    day_of_year: "day_of_year",
    contains: function (value) {
        var reg = false;
        for (var key in date_format_type) {
            if (key != "contains") {
                if (date_format_type[key] == value.toString()) {
                    reg = true;
                    break;
                }
            }
        }
        return reg;
    },
    build_date_string: function (date, type) {
        if (!(date instanceof Date)) throw "date的值不是一个时间对象";
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().length == 1 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
        var day = date.getDate().toString().length == 1 ? "0" + date.getDate() : date.getDate();
        var hour = (date.getHours().toString().length == 1 ? "0" + date.getHours() : date.getHours());
        var minute = (date.getMinutes().toString().length == 1 ? "0" + date.getMinutes() : date.getMinutes());
        var second = (date.getSeconds().toString().length == 1 ? "0" + date.getSeconds() : date.getSeconds());

        switch (type) {
            case date_format_type.date_time:
                return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
            case date_format_type.date:
                return year + "-" + month + "-" + day;
            case date_format_type.time:
                return hour + ":" + minute + ":" + second;
            case date_format_type.year_month_day_hour_minute:
                return year + "-" + month + "-" + day + " " + hour + ":" + minute;
            case date_format_type.year_month_day_hour:
                return year + "-" + month + "-" + day + " " + hour;
            case date_format_type.year_month:
                return year + "-" + month;
            case date_format_type.hour_minute:
                return hour + ":" + minute;
            case date_format_type.year:
                return year;
            case date_format_type.month:
                return month;
            case date_format_type.day:
                return day;
            case date_format_type.hour:
                return hour;
            case date_format_type.minute:
                return minute;
            case date_format_type.second:
                return second;
            case date_format_type.day_of_week:
                return date.getDay() == 0 ? 7 : date.getDay();
            case date_format_type.day_of_year:
                return Math.ceil((date - new Date(date.getFullYear().toString())) / (24 * 60 * 60 * 1000));
            default:
                throw type + " 这个date_format_type不存在";

        }
    },
    /*用于验证枚举值的正确性，不正确默认返回date_time*/
    validate: function (value) {
        for (var key in date_format_type) {
            if (!(date_format_type[key] instanceof Function)) {
                if (value.toString() == date_format_type[key]) {
                    return value.toString();
                }
            }
        }
        return date_format_type.date_time;
    }
}

//条件运算符,各类sql条件运算时使用
var compare_symbol = {
    // 等值匹配
    equal: "equal",
    // 不等值匹配
    not_equal: "not_equal",
    // 大于匹配
    greater: "greater",
    // 大于等于匹配
    greater_equal: "greater_equal",
    // 小于匹配
    less: "less",
    // 小于等于匹配
    less_equal: "less_equal",
    // 模糊匹配
    like: "like",
    // 头模糊匹配
    begin_like: "begin_like",
    // 尾模糊匹配
    end_like: "end_like",
    // 无通配符匹配，需要自行在value写入通配符
    null_like: "null_like",
    // 包含匹配（in）
    contain: "contain",
    // 不包含匹配（not in）
    not_contain: "not_contain",
    // 特殊包含匹配（数组与数组的交集匹配）
    contain_arr: "contain_arr",
    /*用于验证枚举值的正确性，不正确默认返回equal*/
    validate: function (value) {
        for (var key in compare_symbol) {
            if (!(compare_symbol[key] instanceof Function)) {
                if (value.toString() == compare_symbol[key]) {
                    return value.toString();
                }
            }
        }
        return compare_symbol.equal;
    }
};

// 字段sql逻辑运算符
var logic_symbol = {
    // and: 并且
    and: "and",
    // or: 或者
    or: "or",
    /*用于验证枚举值的正确性，不正确默认返回and*/
    validate: function (value) {
        for (var key in logic_symbol) {
            if (!(logic_symbol[key] instanceof Function)) {
                if (value.toString() == logic_symbol[key]) {
                    return value.toString();
                }
            }
        }
        return logic_symbol.and;
    }
}

/* <summary>
* dml操作的枚举类型
*/
var dml_command_type =
{
    /*更新操作*/
    update: "update",
    /*删除操作*/
    "delete": "delete",
    /*添加操作*/
    insert: "insert",
    /*不明，默认值*/
    vague: "vague",
    /*用于验证枚举值的正确性，不正确默认返回vague*/
    validate: function (value) {
        for (var key in dml_command_type) {
            if (!(dml_command_type[key] instanceof Function)) {
                if (value.toString() == dml_command_type[key]) {
                    return value.toString();
                }
            }
        }
        return dml_command_type.vague;
    }
}

//给字段创建读\写属性
function create_get_and_set_property(obj, field_name, property_name) {
    Object.defineProperty(obj, property_name, {
        get: function () {
            return this[field_name];
        },
        set: function (value) {
            this[field_name] = value;
        }
    });
}
//给字段创建读属性
function create_get_property(obj, field_name, property_name) {
    Object.defineProperty(obj, property_name, {
        get: function () {
            return this[field_name];
        }
    });
}
//给字段创建读属性
function create_set_property(obj, field_name, property_name) {
    Object.defineProperty(obj, property_name, {
        set: function (value) {
            this[field_name] = value;
        }
    });
}
//给rx强实体对象中的rx_field创建读\写属性
function create_rx_get_and_set_property(obj, property_name) {
    if (obj.rx_entity[property_name] == undefined) {
        obj.add(property_name, null);
    }
    Object.defineProperty(obj, property_name, {
        get: function () {
            return this.get_rx_field(property_name).value;
        },
        set: function (value) {
            this.get_rx_field(property_name).value = value;
        }
    });
}

//运算符的hash表
var compare_dic = {
    "equal": "=",
    "not_equal": "!=",
    "greater": ">",
    "greater_equal": ">=",
    "less": "<",
    "less_equal": "<=",
    "like": "like",
    "begin_like": "like",
    "end_like": "like",
    "null_like": "like",
    "contain": "in",
    "not_contain": "not in",
    "contain_arr": ""
};
/* rx系列orm对象中的rx_field，前端orm中你基本不需要使用这个类型，可以通过后端orm来了解这个类型
* key 字段的键【必选】
* value 字段的值【必选】
* entity_or_model 字段所属的实体【必选】
* date_time_format 【可选】字段如果为日期，则日期的格式化类型，参照date_format_type的枚举，默认为date_time
*/
function rx_field(key, value, entity_or_model, date_time_format) {
    if (entity_or_model == undefined) {
        throw "entity_or_model是必须的参数，可以为rx_entity或者rx_strong_type(以及子类)的类型";
    }
    var private_obj = [];
    this.key = key;
    private_obj["base_value"] = value;
    this.base_value = null;
    Object.defineProperty(this, "base_value", { get: function () { return private_obj["base_value"]; } });
    private_obj["value"] = value;
    this.value = null;
    Object.defineProperty(this, "value", {
        get: function () {
            return private_obj["value"];
        },
        set: function (value) {
            private_obj["value"] = value;
            private_obj["base_value"] = value;
            if (private_obj["base_value"] instanceof Date)
                private_obj["value"] = date_format_type.build_date_string(private_obj["base_value"], private_obj["date_format_type"]);
        }
    });
    var entity = (entity_or_model instanceof rx_entity ? entity_or_model : entity_or_model.rx_entity);
    private_obj["date_format_type"] = date_time_format || date_format_type.date_time;
    this.date_format_type = null;
    Object.defineProperty(this, "date_format_type", {
        get: function () {
            return private_obj["date_format_type"];
        },
        set: function (value) {
            private_obj["date_format_type"] = date_format_type.validate(value);
            if (private_obj["base_value"] instanceof Date)
                private_obj["value"] = date_format_type.build_date_string(private_obj["base_value"], private_obj["date_format_type"]);

        }
    });

    /* 某些字段进行sql生成时是否会自动删除，默认为true,错误赋值也为true */
    private_obj["auto_remove"] = true;
    this.auto_remove = private_obj["auto_remove"];
    Object.defineProperty(this, "auto_remove", { get: function () { return private_obj["auto_remove"]; }, set: function (value) { private_obj["auto_remove"] = ((typeof value).toLocaleLowerCase() == "boolean") ? value : true } });
    /* sql条件比较运算符 */
    private_obj["compare_symbol"] = compare_symbol.equal;
    this.compare_symbol = private_obj["compare_symbol"];
    Object.defineProperty(this, "compare_symbol", { get: function () { return private_obj["compare_symbol"]; }, set: function (value) { private_obj["compare_symbol"] = compare_symbol.validate(value); } });
    /* sql逻辑运算符 */
    private_obj["logic_symbol"] = logic_symbol.and;
    this.logic_symbol = private_obj["logic_symbol"];
    Object.defineProperty(this, "logic_symbol", { get: function () { return private_obj["logic_symbol"]; }, set: function (value) { private_obj["logic_symbol"] = logic_symbol.validate(value); } });

    /* 某些字段进行sql生成时是是否带有单引号，默认为true */
    private_obj["build_quote"] = true;
    this.build_quote = private_obj["build_quote"];
    Object.defineProperty(this, "build_quote", { get: function () { return private_obj["build_quote"]; }, set: function (value) { private_obj["build_quote"] = ((typeof value).toLocaleLowerCase() == "boolean") ? value : true } });

    /* 运算符转换where字符串的方法
    * 是否在生成SQL语句的字段时加入实体名称。 false：[字段名]   true:[表名].[字段名]
    */
    this.build_query = function (show_entity_name) {
        show_entity_name = show_entity_name || false;
        var build_string = "";

        var compare = compare_dic[this.compare_symbol];

        if (this.value == null) {
            switch (this.compare_symbol) {
                case compare_symbol.equal:
                case compare_symbol.greater:
                case compare_symbol.greater_equal:
                case compare_symbol.like:
                case compare_symbol.begin_like:
                case compare_symbol.end_like:
                case compare_symbol.null_like:
                case compare_symbol.contain:
                case compare_symbol.contain_arr:
                    compare = "is";
                    break;
                case compare_symbol.not_equal:
                case compare_symbol.not_contain:
                case compare_symbol.less:
                case compare_symbol.less_equal:
                    compare = "is not";
                    break;
            }
        }

        var quote = this.build_quote && this.value != null ? "'" : "";
        var begin_like = "", end_like = "";
        if (this.value != null) {
            switch (this.compare_symbol) {
                case compare_symbol.like:
                    begin_like = "%"; end_like = "%";
                    break;
                case compare_symbol.begin_like:
                    end_like = "%";
                    break;
                case compare_symbol.end_like:
                    begin_like = "%";
                    break;
                case compare_symbol.contain:
                case compare_symbol.not_contain:
                    quote = "";
                    break;
            }
        }

        var is_null_value = this.value == null;
        var right_num = is_null_value ? 0 : this.value.toString().split(")").length;
        var num = 1 + right_num + Math.round(Math.random() * (11 + right_num));
        var left = is_null_value ? "" : new Array(num + 1).join('(');
        var right = is_null_value ? "" : new Array(num + 1).join(')');

        if (this.compare_symbol != compare_symbol.contain && this.compare_symbol != compare_symbol.not_contain) {
            if (this.compare_symbol != compare_symbol.contain_arr) {
                build_string = String.Format(" {0} {1} {2} {3}{4}{5} ",
                    this.logic_symbol,
                    (!show_entity_name ? "" : "[" + entity.entity_name + "].") + "[" + this.key + "]",
                    compare,
                    left,
                    this.value == null ? " null" : String.Format("{0}{1}{2}{3}{4}",
                        quote,
                        begin_like,
                        this.value,
                        end_like,
                        quote),
                    right
                    );
            }
            else {
                build_string = String.Format(" {0} dbo.rx_contains_arr({1},'{2}',',') = 1 ", this.logic_symbol.ToString(), (!show_entity_name ? "" : "[" + entity.entity_name + "].") + "[" + this.key + "]", this.value);
            }
        }
        else {
            build_string = String.Format(" {0} {1}{2} {3}{4}{5} ",
                this.logic_symbol,
                left,
                (!show_entity_name ? "" : "[" + entity.entity_name + "].") + "[" + this.key + "]",
                compare,
                this.value == null ? " null" : String.Format("({0}{1}{2}{3}{4})",
                    quote,
                    begin_like,
                    this.value,
                    end_like,
                    quote),
                right
                );
        }
        return build_string;
    }

    /* 转换key=value字符串的方法
    * 是否在生成SQL语句的字段时加入实体名称。 false：[字段名]   true:[表名].[字段名]
    */
    this.build_query_not_symbol = function (show_entity_name) {
        show_entity_name = show_entity_name || false;

        var is_null_value = this.value == null;
        var right_num = is_null_value ? 0 : this.value.toString().split(")").length;
        var num = 1 + right_num + Math.round(Math.random() * (11 + right_num));
        var left = is_null_value ? "" : new Array(num + 1).join('(');
        var right = is_null_value ? "" : new Array(num + 1).join(')');

        return (!show_entity_name ? " " : " [" + entity.entity_name + "].")
        + "[" + this.key + "] = "
        + left +
        (this.value == null ? " null" : (this.build_quote ? "'" : "") + this.value + (this.build_quote ? "'" : ""))
        + right + " ";
    }

    /*克隆对象*/
    this.clone = function () {
        var field = new rx_field(this.key, this.value, entity, this.date_format_type);
        field.compare_symbol = this.compare_symbol;
        field.logic_symbol = this.logic_symbol;
        field.build_quote = this.build_quote;
        field.auto_remove = this.auto_remove;
        return field;
    }
}

/* 前端orm中rx_entity与后端orm保持一致
* entity_name 【必选】
* instance_json 【可选】用于快速初始化rx_entity成员与其中rx_field成员的json对象，键值对填充
*/
function rx_entity(entity_name, instance_json) {
    if (entity_name == undefined || entity_name == null) {
        throw "entity_name不能为null或者undefined";
    }
    var private_obj = [];

    private_obj["entity_name"] = entity_name;
    this.entity_name = private_obj["entity_name"];
    Object.defineProperty(this, "entity_name", { get: function () { return private_obj["entity_name"]; } });

    private_obj["command_type"] = dml_command_type.vague;
    this.command_type = private_obj["command_type"];
    Object.defineProperty(this, "command_type", { get: function () { return private_obj["command_type"]; }, set: function (value) { private_obj["command_type"] = dml_command_type.validate(value); } });

    private_obj["is_use_null"] = false;
    this.is_use_null = private_obj["is_use_null"];
    Object.defineProperty(this, "is_use_null", { get: function () { return private_obj["is_use_null"]; }, set: function (value) { private_obj["is_use_null"] = ((typeof value).toLocaleLowerCase() == "boolean") ? value : false } });

    private_obj["where_keys"] = null;
    this.where_keys = private_obj["where_keys"];
    Object.defineProperty(this, "where_keys", { get: function () { return private_obj["where_keys"]; } });
    /* 设置实体的where_key属性
    * 指定的key要存在与实体的key中
    * where_keys必须是一个string的数组
    * 链式操作
    */
    this.set_where_keys = function (where_keys) {
        if (where_keys == null) where_keys = [];
        if (!(where_keys instanceof Array))
            throw "where_keys必须是一个string的数组";
        for (var i = 0; i < where_keys.length; i++) {
            if ((typeof where_keys[i]).toString() != "string")
                throw "where_keys索引 " + i + " 处的元素不是一个字符串string";
        }
        private_obj["where_keys"] = where_keys.length == 0 ? null : where_keys;
        return this;
    }

    /* 清空实体的where_key属性
    * 链式操作
    */
    this.clear_where_keys = function () {
        private_obj["where_keys"] = null;
        return this;
    }

    private_obj["select_display_keys"] = null;
    this.select_display_keys = private_obj["select_display_keys"];
    Object.defineProperty(this, "select_display_keys", { get: function () { return private_obj["select_display_keys"] == null ? null : private_obj["select_display_keys"].join(","); } });
    /* 设置实体的select_display_keys属性
    * 指定的key要存在与实体的key中
    * select_display_keys必须是一个string的数组
    * 链式操作
    */
    this.set_select_display_keys = function (select_display_keys) {
        if (select_display_keys == null) select_display_keys = [];
        if (!(select_display_keys instanceof Array))
            throw "select_display_keys必须是一个string的数组";
        for (var i = 0; i < select_display_keys.length; i++) {
            if ((typeof select_display_keys[i]).toString() != "string")
                throw "select_display_keys索引 " + i + " 处的元素不是一个字符串string";
        }
        private_obj["select_display_keys"] = select_display_keys.length == 0 ? null : select_display_keys;
        return this;
    }

    /*类似后端orm中的request_fill，但是只能接受url地址栏显示传值，要求是这个rx_entity存在rx_field的key才会填充，所以H5手机APP比较适合
    * 弱实体对象在没有任何rx_field成员时使用这个方法是无效的
    * 链式操作
    */
    this.request_fill = function () {
        for (var key in this) {
            if (this[key] instanceof rx_field) {
                try {
                    this[key].value = get_url_param(key) == undefined ? this[key].value : get_url_param(key);
                } catch (e) {
                    throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
                }
            }
        }
        return this;
    }

    /* 这个方法是为了一次性链式操作设置指定key的rx_field属性而存在的,与后端orm的set_rx_field方式操作一致
    * 【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入
    * 链式操作，不需要再实例化对象的时候声明局部变量了
    * 因为js不能像C#一样命名参数，所以这里使用json对象代替（例子: {compare: compare_symbol.contain} 当然与后端orm一致有5个命名参数参数）
    * key rx_field的key
    * compare 【可选】sql语句中的条件运算符，compare_symbol枚举
    * logic 【可选】sql语句中的逻辑运算符，logic_symbol枚举
    * date_format_type 【可选】base_value对时间数据的格式化方式
    * auto_remove 【可选】在生成sql语句时这个字段是否会自动被删除
    * build_quote 【可选】在生成sql语句时这个字段是否会生成单引号(')
    * value 【可选】js可以忽略这个参数，因为js是弱类型，但是也可以用
    */
    this.set_rx_field = function (key, json_option) {
        if (!(this[key] instanceof rx_field))
            throw "这个key对应的值不是rx_field对象";
        if (json_option != undefined) {
            this[key].compare_symbol = json_option.compare || this[key].compare_symbol;
            this[key].logic_symbol = json_option.logic || this[key].logic_symbol;
            this[key].date_format_type = json_option.date_format_type || this[key].date_format_type;
            this[key].auto_remove = json_option.auto_remove == undefined ? this[key].auto_remove : json_option.auto_remove;
            this[key].build_quote = json_option.build_quote == undefined ? this[key].build_quote : json_option.build_quote;
            this[key].value = json_option.value || this[key].value
        }
        if (private_obj["where_keys"] == null)
            private_obj["where_keys"] = [key];
        else {
            var reg = false;
            for (var i = 0; i < private_obj["where_keys"].length; i++) {
                if (private_obj["where_keys"][i] == key) {
                    reg = true;
                    break;
                }
            }
            if (!reg) private_obj["where_keys"].push(key);
        }
        return this;
    }

    /* js键值对和属性get|set不能同时使用，这里使用Add代替后端的键值对设置rx_field对象
    * 【如果你一定要用键值对也可以，例子obj["id"] = new rx_field("id", 1, obj); 必须这样写才能识别为添加（Add）rx_field对象】
    * 链式操作
    */
    this.Add = function (key, value) {
        this[key] = new rx_field(key, value, this);
        return this;
    }

    /* 删除一个rx_field对象
    * 如果这个对象不是rx_field将会忽略
    * 链式操作
    */
    this.Remove = function (key) {
        if (this[key] instanceof rx_field) {
            delete this[key];
        }
        return this;
    }

    /* 清空所有的rx_field对象 
    * 链式操作
    */
    this.Clear = function () {
        for (var key in this) {
            if (this[key] instanceof rx_field) {
                delete this[key];
            }
        }
        return this;
    }

    this.clone = function () {
        var obj = new rx_entity(this.entity_name, {
            command_type: this.command_type,
            is_use_null: this.is_use_null,
        });
        obj.set_where_keys(this.where_keys == null ? null : this.where_keys);
        obj.set_select_display_keys(this.select_display_keys == null ? null : this.select_display_keys.select_display_keys.split(","));

        var values = this.Values;
        for (var i = 0; i < values.length; i++) {
            obj[values[i].key] = values[i].clone();
        }

        return obj;
    }

    create_get_and_set_property(this, "length", "Count");

    if (instance_json != undefined) {
        for (var key in instance_json) {
            if (!(instance_json[key] instanceof Function)) {
                if (this[key] == undefined)
                    this.Add(key, instance_json[key]);
                else
                    this[key] = instance_json[key];
            }
        }
    }

    Object.defineProperty(this, "Keys", {
        get: function () {
            var keys = [];
            for (var key in this) {
                if ((this[key] instanceof rx_field)) {
                    keys.push(key)
                }
            }
            return keys;
        }
    });

    Object.defineProperty(this, "Values", {
        get: function () {
            var arr = [];
            for (var key in this) {
                if ((this[key] instanceof rx_field)) {
                    arr.push(this[key])
                }
            }
            return arr;
        }
    });
}
(function () { var Super = function () { }; Super.prototype = Array.prototype; rx_entity.prototype = new Super(); })();

/* 前端orm中rx_strong_type与后端orm保持一致,用于被rx系类强实体类继承
* entity_name 【必选】
* instance_json 【可选】用于快速初始化rx_entity成员与其中rx_field成员的json对象，键值对填充
*/
function rx_strong_type(entity_name, instance_json) {
    var _entity_name = entity_name;
    Object.defineProperty(this, "entity_name", {
        get: function () {
            return _entity_name;
        }
    });

    /*实体本质rx_entity对象*/
    this.rx_entity = new rx_entity(entity_name, instance_json);

    Object.defineProperty(this, "Keys", {
        get: function () {
            var keys = [];
            for (var key in this.rx_entity) {
                if ((this.rx_entity[key] instanceof rx_field)) {
                    keys.push(key);
                }
            }
            return keys;
        }
    });

    Object.defineProperty(this, "command_type", {
        get: function () {
            return this.rx_entity.command_type;
        },
        set: function (value) {
            this.rx_entity.command_type = dml_command_type.validate(value);
        }
    });

    Object.defineProperty(this, "is_use_null", {
        get: function () {
            return this.rx_entity.is_use_null;
        },
        set: function (value) {
            this.rx_entity.is_use_null = ((typeof value).toLocaleLowerCase() == "boolean") ? value : false;
        }
    });

    Object.defineProperty(this, "where_keys", {
        get: function () {
            return this.rx_entity.where_keys;
        }
    });
    /* 设置实体rx_entity的where_key属性
    * 指定的key要存在与实体的key中
    * where_keys必须是一个string的数组
    * 链式操作
    */
    this.set_where_keys = function (where_keys) {
        this.rx_entity.set_where_keys(where_keys);
        return this;
    }

    /* 清空实体的where_key属性
    * 链式操作
    */
    this.clear_where_keys = function () {
        this.rx_entity.clear_where_keys();
        return this;
    }

    /*因为js不能与C#使用成员与键值对访问rx_entity中的rx_field成员，所以这里使用这个方法来进行访问, 如果key对应的值不是rx_field将返回null*/
    this.get_rx_field = function (key) {
        if (!(this.rx_entity[key] instanceof rx_field)) return null;
        return this.rx_entity[key];
    }

    /*原型克隆方法*/
    this.clone = function () {
        var model = new rx_strong_type(this.entity_name);
        model.command_type = this.command_type;
        model.is_use_null = this.is_use_null;
        model.rx_entity.set_where_keys(this.rx_entity.where_keys == null ? [] : this.rx_entity.where_keys);
        model.rx_entity.set_select_display_keys(this.rx_entity.select_display_keys == null ? [] : this.rx_entity.select_display_keys.split(","));

        var values = this.rx_entity.Values;
        for (var i = 0; i < values.length; i++) {
            model.rx_entity[values[i].key] = values[i].clone();
        }
        return model;
    }

    /*为实体类强行添加一个rx_field，被添加rx_field只能通过rx_entity的get_rx_field进行访问
    * 链式操作
    */
    this.add = function (key, value) {
        this.rx_entity.Add(key, value);
        return this;
    }
    /*为实体类强行删除一个rx_field，如果删除的是一个强属性，那么这个属性在使用时为undefined
    * 链式操作
    */
    this.remove = function (key) {
        this.rx_entity.Remove(key);
        return this;
    }

    /*类似后端orm中的request_fill，但是只能接受url地址栏显示传值，要求是实体中的rx_entity存在rx_field的key才会填充，所以H5手机APP比较适合
    * 弱实体对象在没有任何rx_field成员时使用这个方法是无效的，强实体可以忽略
    * 链式操作
    */
    this.request_fill = function () {
        for (var key in this.rx_entity) {
            if (this.rx_entity[key] instanceof rx_field) {
                try {
                    this.rx_entity[key].value = get_url_param(key) == undefined ? this.rx_entity[key].value : get_url_param(key);
                } catch (e) {
                    throw e.message + ',未找到ajax方法的依赖文件，请检查是否引入了rx.js！';
                }
            }
        }
        return this;
    }

    /* 这个方法是为了一次性链式操作设置指定key的rx_field属性而存在的,与后端orm的set_rx_field方式操作一致
    * 【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入
    * 链式操作，不需要再实例化对象的时候声明局部变量了
    * 因为js不能像C#一样命名参数，所以这里使用json对象代替（例子: {compare: compare_symbol.contain} 当然与后端orm一致有5个命名参数参数）
    * key rx_field的key
    * compare 【可选】sql语句中的条件运算符，compare_symbol枚举
    * logic 【可选】sql语句中的逻辑运算符，logic_symbol枚举
    * date_format_type 【可选】base_value对时间数据的格式化方式
    * auto_remove 【可选】在生成sql语句时这个字段是否会自动被删除
    * build_quote 【可选】在生成sql语句时这个字段是否会生成单引号(')
    * value 【可选】js可以忽略这个参数，因为js是弱类型，但是也可以用
    */
    this.set_rx_field = function (key, json_option) {
        this.rx_entity.set_rx_field(key, json_option);
        return this;
    }

    /* 获取这个实体对象的总数量,会根据实体对象的where_keys产生查询条件
    * call_back 【必选】回调函数，参数data
    * where_keys 参数可以多次指定参与where条件运算的key，并且可以指定顺序
    * where_keys 不传该参数就会使用所有不为null的属性进行条件查询，可以使用参数设置where_keys需要参与where条件的key,必须是当前实体中存在的key,否则会出现异常
    */ 
    this.get_entity_count = function (call_back, where_keys) {
        if (where_keys != null && where_keys.length > 0)
        {
            //优先使用where_keys参数填充where_keys
            this.set_where_keys(where_keys);
        }
        else
        {
            //如果where_keys参数为空且where_keys属性为空就根据不为空的字段进行条件查询
            if ((where_keys == null || where_keys.length == 0) && (this.where_keys == null || this.where_keys.Count == 0))
            {
                where_keys = [];
                for (var key in this.rx_entity) {
                    if ((this.rx_entity[key] instanceof rx_field) && this.rx_entity[key].value != null) {
                        where_keys.push(key);
                    }
                }
                this.set_where_keys(where_keys);
            }
        }
        var do_where_keys = this.where_keys;
        if (do_where_keys == undefined || do_where_keys == null) {
            do_where_keys = [];
        }
        var where_string = "";
        for (var i = 0; i < do_where_keys.length; i++) {
            if (this.rx_entity[do_where_keys[i]] instanceof rx_field) {
                where_string += this.rx_entity[do_where_keys[i]].build_query(false);
            }
            else {
                throw '字段' + do_where_keys[i] + "不在实体" + this.entity_name + "中,不能参与where_keys条件运算";
            }
        }
        
        rx_manager.get_entity_count(call_back, this.rx_entity.entity_name, where_string);
    }
}

/* 前端orm中rx_model与后端orm基本一致,因为js不能泛型，所以继承规则略微有所不同,用于被rx系类强实体类继承
* entity_name 【必选】
* instance_json 【可选】用于快速初始化rx_entity成员与其中rx_field成员的json对象，键值对填充
*/
function rx_model(entity_name, instance_json) {
    rx_strong_type.call(this, entity_name, instance_json);

    /* 默认根据实体中不为null的属性进行条件查询,也可以根据当前实体对象的where_keys属性进行指定key的where条件查询
    * call_back 【必选】回调函数，参数data
    * where_keys参数可以多次指定参与where条件运算的key，并且可以指定顺序
    * where_keys 不传该参数就会使用所有不为null的属性进行条件查询，可以使用参数设置where_keys需要参与where条件的key,必须是当前实体中存在的key,否则会出现异常
    */
    this.get_entitys = function (call_back, where_keys) {
        if (this.where_keys == null || this.where_keys.length == 0) {
            where_keys = [];
            for (var key in this.rx_entity) {
                if ((this.rx_entity[key] instanceof rx_field) && this.rx_entity[key].value != null) {
                    where_keys.push(key);
                }
            }
        }
        if (where_keys != undefined) {
            this.set_where_keys(where_keys);
        }

        rx_manager.get_entitys_by_where_keys(call_back, this.rx_entity);
    }

    /* 直接根据实体对象进行添加或者修改操作
    * call_back 【必选】回调函数，参数data
    * 对象的id为0或者null进行添加操作，否则会根据id进行修改操作
    * 添加操作时id会进行out
    * 如果实体is_use_null为true时，无论是添加还是修改操作null属性都会参与，默认为false
    */
    this.insert_or_update_entity = function (call_back) {
        rx_manager.insert_or_update_entity(call_back, this.rx_entity);
    }

    /* 更新当前的实体对象至数据库
    * call_back 【必选】回调函数，参数data
    * 默认根据id进行更新，实体的is_user_null为false将不会使用null值的属性参与更新操作，默认为false
    * 如果where_key不为空就根据where_key指定字段进行where条件更新
    * 可以使用参数设置where_keys
    * where_keys参数可以多次指定参与where条件运算的key，并且可以指定顺序
    * 需要参与where条件的key,必须是当前实体中存在的key,否则会出现异常,该参数不指定则按照id进行更新操作
    */
    this.update_entity = function (call_back, where_keys) {
        if (where_keys != undefined) {
            this.set_where_keys(where_keys);
        }
        if (this.where_keys != null && this.where_keys.length > 0) {
            rx_manager.update_entity_by_where_keys(call_back, this.rx_entity);
            return;
        }
        rx_manager.update_entity_by_id(call_back, this.rx_entity);
    }

    /*
    * call_back 【必选】回调函数，参数data
    * 将当前的实体对象添加至数据库，添加成功后id会进行out
    * 实体的is_user_null为false将不会使用null值的属性进行添加操作，默认为false
    */
    this.insert_entity = function (call_back) {
        rx_manager.insert_entity(call_back, this.rx_entity);
    }

    /* 删除当前实体在数据库中的行数据
    * call_back 【必选】回调函数，参数data
    * 默认根据id进行删除
    * 如果where_key不为空就根据where_key指定字段进行where条件删除
    * 可以使用参数设置where_keys
    * where_keys参数可以多次指定参与where条件运算的key，并且可以指定顺序
    * 需要参与where条件的key,必须是当前实体中存在的key,否则会出现异常,该参数不指定则按照id进行删除操作
    */
    this.delete_entity = function (call_back, where_keys) {
        if (where_keys != undefined) {
            this.set_where_keys(where_keys);
        }
        if (this.where_keys != null && this.where_keys.length > 0) {
            rx_manager.delete_entity_by_where_keys(call_back, this.rx_entity);
            return;
        }
        rx_manager.delete_entity_by_id(call_back, this.entity_name, this.get_rx_field("id").value);
    }

    /* 分页获取实体对象的集合,where条件根据实体字段的值与where_keys数据进行指定
    * call_back 【必选】回调函数，参数data(包含rows与row_count)
    * page_index 【必须】页码（0开始）
    * page_size 【必须】该页数据的行数 
    * order_identity_string 排序字段字符串,默认id asc，例子：id acs,name desc
    */
    this.get_page_entitys = function (call_back, page_index, page_size, order_identity_string) {
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data！";
        }
        if (page_index == undefined) {
            throw "page_index是必填参数";
        }
        if (page_size == undefined) {
            throw "page_size是必填参数";
        }
        order_identity_string = order_identity_string || "id asc";

        //如果where_keys属性为空就根据不为空的字段进行条件查询
        if ((this.where_keys == null || this.where_keys.Count == 0)) {
            where_keys = [];
            for (var key in this.rx_entity) {
                if ((this.rx_entity[key] instanceof rx_field) && this.rx_entity[key].value != null) {
                    where_keys.push(key);
                }
            }
            this.set_where_keys(where_keys);
        }
        var do_where_keys = this.where_keys;
        if (do_where_keys == undefined || do_where_keys == null) {
            do_where_keys = [];
        }
        var where_string = "";
        for (var i = 0; i < do_where_keys.length; i++) {
            if (this.rx_entity[do_where_keys[i]] instanceof rx_field) {
                where_string += this.rx_entity[do_where_keys[i]].build_query(false);
            }
            else {
                throw '字段' + do_where_keys[i] + "不在实体" + this.entity_name + "中,不能参与where_keys条件运算";
            }
        }

        rx_manager.get_entitys_by_page(call_back, page_index, page_size, this.entity_name, order_identity_string, "*", where_string);
    }
}
(function () {
    var Super = function () { };
    Super.prototype = rx_strong_type.prototype;
    rx_model.prototype = new Super();
    rx_model.static_method = {
        /* 获取这个实体所有的对象集合
        * call_back 【必选】回调函数，参数data
        */
        get_all_entitys: function (call_back) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.get_all_entitys(call_back, entity_name);
        },
        /* 获取这个实体对象的总数量,会根据实体对象的where_keys产生查询条件
        * call_back 【必选】回调函数，参数data
        * where_string 条件字符串，默认值：""。例： and id = 1 and name = 'jack'......
        */ 
        get_entity_count: function (call_back, where_string) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.get_entity_count(call_back, entity_name, where_string);
        },
        /* 根据id获取一个实体对象,未找到数据返回结果为null
        * call_back 【必选】回调函数，参数data
        * id 【必选】实体的id
        */
        get_entity_by_id: function (call_back, id) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.get_entity_by_id(call_back, entity_name, id);
        },
        /* 根据表名和id的数组获取的对象的集合
        * call_back 【必选】回调函数，参数data
        * id_array 【必选】表的id值的数组(数组长度必须大于0),必须是数组且数组的元素必须是一个数字
        */
        get_entitys_in_id: function (call_back, id_array) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.get_entitys_in_id(call_back, entity_name, id_array);
        },
        /* 根据where_string查询符合条件的实体对象集合
         * call_back 回调函数，参数data与xml【必选】
         * where_string 参与条件运算的自短传字符串，例子：and id = 1 or name = 'jack'【必选】
         */
        get_entitys_by_where_string: function (call_back, where_string) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.get_entitys_by_where_string(call_back, entity_name, where_string);
        },
        /* 添加多个实体对象至sql【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_insert接口才能使用这个危险的Action！】
         * call_back 回调函数，参数data与xml【必选】
         * models 当前类型的rx_model的数组【必选】
         */
        insert_entitys: function (call_back, models) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            if (!(models instanceof Array)) {
                throw "models必须是一个" + entity_name + "类型的数组";
            }
            var entitys = [];
            for (var i = 0; i < models.length; i++) {
                if (!eval("models[i] instanceof " + entity_name)) {
                    throw "models索引 " + i + " 处的元素不是" + entity_name + "对象";
                }
                entitys.push(models[i].rx_entity);
            }
            rx_manager.insert_entitys(call_back, entitys);
        },
        /* 对这个实体进行多行in删除操作【这是个危险的方法，要求服务端rx_mvc_controller或者rx_handle的子类必须继承i_rx_risk_delete接口才能使用这个危险的Action！】
         * call_back 回调函数，参数data与xml【必选】
         * id_array 表的id值的数组,数组元素必须是数字【必选】
         */
        delete_entity_in_id: function (call_back, id_array) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.delete_entity_in_id(call_back, entity_name, id_array);
        },
        /* 分页获取当前实体的集合
         * call_back 回调函数，参数data,data对象包含成员row_count(总数据行数)与rows(行数据)【必选】
         * page_index 页码，默认值0【必选】
         * page_size 页大小，默认值10【必选】
         * order_identity_string 排序字段，默认值：id asc。例：id asc,name desc......
         * where_string 条件字符串，默认值：""。例： and id = 1 and name = 'jack'......
         */
        get_entitys_by_page: function (call_back, page_index, page_size, order_identity_string, where_string) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            order_identity_string = order_identity_string || "id asc";
            rx_manager.get_entitys_by_page(call_back, page_index, page_size, entity_name, order_identity_string, "*", where_string);
        },
        /* 这个方法存在的目的是为了将异步回发的json数据或者其他json数据转化为当前实体的对象或者数组
        * json 【必选】如果json使用一个数组返回将是符合这个实体类的数组对象，否则为单个对象
        * 非异步操作，直接返回无需回发
        */
        json_fill: function (json) {
            if (json == undefined)
                throw "json必须的参数";
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            var json_array = [];
            if (json instanceof Array)
                json_array = json;
            else
                json_array = [json];
            var obj_array = [];
            for (var i = 0; i < json_array.length; i++) {
                var obj = eval("new " + entity_name + "(json_array[i])");
                obj_array.push(obj);
            }
            return obj_array.length > 1 ? obj_array : obj_array[0];
        }
    };
})();

var view_first_columns = [];
/* 前端orm中rx_view与后端orm基本一致,因为js不能泛型，所以继承规则略微有所不同,用于被rx系类强实体类继承
* entity_name 【必选】
* instance_json 【可选】用于快速初始化rx_entity成员与其中rx_field成员的json对象，键值对填充
* view_first_column 视图的第一个字段的名字，使用强实体可以忽略
*/
function rx_view(entity_name, instance_json) {
    rx_strong_type.call(this, entity_name, instance_json);
    /* 默认根据实体中不为null的属性进行条件查询,也可以根据当前实体对象的where_keys属性进行指定key的where条件查询
    * call_back 【必选】回调函数，参数data
    * where_keys参数可以多次指定参与where条件运算的key，并且可以指定顺序
    * where_keys 不传该参数就会使用所有不为null的属性进行条件查询，可以使用参数设置where_keys需要参与where条件的key,必须是当前实体中存在的key,否则会出现异常
    */
    this.get_entitys = function (call_back, where_keys) {
        if (this.where_keys == null || this.where_keys.length == 0) {
            where_keys = [];
            for (var key in this.rx_entity) {
                if ((this.rx_entity[key] instanceof rx_field) && this.rx_entity[key].value != null) {
                    where_keys.push(key);
                }
            }
        }
        if (where_keys != undefined) {
            this.set_where_keys(where_keys);
        }

        rx_manager.get_entitys_by_where_keys(call_back, this.rx_entity);
    }

    /* 分页获取实体对象的集合,where条件根据实体字段的值与where_keys数据进行指定
    * call_back 【必选】回调函数，参数data(包含rows与row_count)
    * page_index 【必须】页码（0开始）
    * page_size 【必须】该页数据的行数 
    * order_identity_string 排序字段字符串，例子：id acs,name desc,默认值或者null时就是第一列asc排序
    */
    this.get_page_entitys = function (call_back, page_index, page_size, order_identity_string) {
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data！";
        }
        if (page_index == undefined) {
            throw "page_index是必填参数";
        }
        if (page_size == undefined) {
            throw "page_size是必填参数";
        }
        order_identity_string = order_identity_string || view_first_columns[this.entity_name] + " asc";

        //如果where_keys属性为空就根据不为空的字段进行条件查询
        if ((this.where_keys == null || this.where_keys.Count == 0)) {
            where_keys = [];
            for (var key in this.rx_entity) {
                if ((this.rx_entity[key] instanceof rx_field) && this.rx_entity[key].value != null) {
                    where_keys.push(key);
                }
            }
            this.set_where_keys(where_keys);
        }
        var do_where_keys = this.where_keys;
        if (do_where_keys == undefined || do_where_keys == null) {
            do_where_keys = [];
        }
        var where_string = "";
        for (var i = 0; i < do_where_keys.length; i++) {
            if (this.rx_entity[do_where_keys[i]] instanceof rx_field) {
                where_string += this.rx_entity[do_where_keys[i]].build_query(false);
            }
            else {
                throw '字段' + do_where_keys[i] + "不在实体" + this.entity_name + "中,不能参与where_keys条件运算";
            }
        }

        rx_manager.get_entitys_by_page(call_back, page_index, page_size, this.entity_name, order_identity_string, "*", where_string);
    }
}
(function () {
    var Super = function () { };
    Super.prototype = rx_strong_type.prototype;
    rx_view.prototype = new Super();
    rx_view.static_method = {
        /* 获取这个实体所有的对象集合
        * call_back 【必选】回调函数，参数data
        */
        get_all_entitys: function (call_back) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.get_all_entitys(call_back, entity_name);
        },
        /* 获取这个实体对象的总数量,会根据实体对象的where_keys产生查询条件
        * call_back 【必选】回调函数，参数data
        * where_string 条件字符串，默认值：""。例： and id = 1 and name = 'jack'......
        */ 
        get_entity_count: function (call_back, where_string) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.get_entity_count(call_back, entity_name, where_string);
        },
        /* 根据where_string查询符合条件的实体对象集合
         * call_back 回调函数，参数data与xml【必选】
         * where_string 参与条件运算的自短传字符串，例子：and id = 1 or name = 'jack'【必选】
         */
        get_entitys_by_where_string: function (call_back, where_string) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            rx_manager.get_entitys_by_where_string(call_back, entity_name, where_string);
        },
        /* 分页获取当前实体的集合
         * call_back 回调函数，参数data,data对象包含成员row_count(总数据行数)与rows(行数据)【必选】
         * page_index 页码，默认值0【必选】
         * page_size 页大小，默认值10【必选】
         * order_identity_string 排序字段，默认值：[视图的第一个字段] asc。例：id asc,name desc......
         * where_string 条件字符串，默认值：""。例： and id = 1 and name = 'jack'......
         */
        get_entitys_by_page: function (call_back, page_index, page_size, order_identity_string, where_string) {
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            order_identity_string = order_identity_string || view_first_columns[entity_name] + " asc";
            rx_manager.get_entitys_by_page(call_back, page_index, page_size, entity_name, order_identity_string, "*", where_string);
        },
        /* 这个方法存在的目的是为了将异步回发的json数据或者其他json数据转化为当前实体的对象或者数组
        * json 【必选】如果json使用一个数组返回将是符合这个实体类的数组对象，否则为单个对象
        * 非异步操作，直接返回无需回发
        */
        json_fill: function (json) {
            if (json == undefined)
                throw "json必须的参数";
            var entity_name = this.toString();
            entity_name = entity_name.substring(entity_name.indexOf("function") + 8, entity_name.indexOf("(")).trim();
            var json_array = [];
            if (json instanceof Array)
                json_array = json;
            else
                json_array = [json];
            var obj_array = [];
            for (var i = 0; i < json_array.length; i++) {
                var obj = eval("new " + entity_name + "(json_array[i])");
                obj_array.push(obj);
            }
            return obj_array.length > 1 ? obj_array : obj_array[0];
        }
    };
})();
/*models ----------begin*/function article(instance_json) {
    rx_model.call(this, "article", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "index_img");
    this["set_index_img_field"] = function (json_option) { return this.set_rx_field("index_img", json_option); }    create_rx_get_and_set_property(this, "article_type");
    this["set_article_type_field"] = function (json_option) { return this.set_rx_field("article_type", json_option); }    create_rx_get_and_set_property(this, "short_content");
    this["set_short_content_field"] = function (json_option) { return this.set_rx_field("short_content", json_option); }    create_rx_get_and_set_property(this, "read_count");
    this["set_read_count_field"] = function (json_option) { return this.set_rx_field("read_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; article.prototype = new Super(); for (var key in rx_model.static_method) { article[key] = rx_model.static_method[key]; } })();function audio_play_log(instance_json) {
    rx_model.call(this, "audio_play_log", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "play_id");
    this["set_play_id_field"] = function (json_option) { return this.set_rx_field("play_id", json_option); }    create_rx_get_and_set_property(this, "audio_id");
    this["set_audio_id_field"] = function (json_option) { return this.set_rx_field("audio_id", json_option); }    create_rx_get_and_set_property(this, "play_duration");
    this["set_play_duration_field"] = function (json_option) { return this.set_rx_field("play_duration", json_option); }    create_rx_get_and_set_property(this, "current_times");
    this["set_current_times_field"] = function (json_option) { return this.set_rx_field("current_times", json_option); }    create_rx_get_and_set_property(this, "duration");
    this["set_duration_field"] = function (json_option) { return this.set_rx_field("duration", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "ip_address");
    this["set_ip_address_field"] = function (json_option) { return this.set_rx_field("ip_address", json_option); }    create_rx_get_and_set_property(this, "referer");
    this["set_referer_field"] = function (json_option) { return this.set_rx_field("referer", json_option); }    create_rx_get_and_set_property(this, "user_agent");
    this["set_user_agent_field"] = function (json_option) { return this.set_rx_field("user_agent", json_option); }    create_rx_get_and_set_property(this, "operating_system");
    this["set_operating_system_field"] = function (json_option) { return this.set_rx_field("operating_system", json_option); }    create_rx_get_and_set_property(this, "browser");
    this["set_browser_field"] = function (json_option) { return this.set_rx_field("browser", json_option); }    create_rx_get_and_set_property(this, "is_mobile");
    this["set_is_mobile_field"] = function (json_option) { return this.set_rx_field("is_mobile", json_option); }    create_rx_get_and_set_property(this, "created_time");
    this["set_created_time_field"] = function (json_option) { return this.set_rx_field("created_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; audio_play_log.prototype = new Super(); for (var key in rx_model.static_method) { audio_play_log[key] = rx_model.static_method[key]; } })();function auto_task_log(instance_json) {
    rx_model.call(this, "auto_task_log", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "task_time");
    this["set_task_time_field"] = function (json_option) { return this.set_rx_field("task_time", json_option); }    create_rx_get_and_set_property(this, "issuccess");
    this["set_issuccess_field"] = function (json_option) { return this.set_rx_field("issuccess", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; auto_task_log.prototype = new Super(); for (var key in rx_model.static_method) { auto_task_log[key] = rx_model.static_method[key]; } })();function course_assort(instance_json) {
    rx_model.call(this, "course_assort", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_assort.prototype = new Super(); for (var key in rx_model.static_method) { course_assort[key] = rx_model.static_method[key]; } })();function course_category(instance_json) {
    rx_model.call(this, "course_category", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "category_name");
    this["set_category_name_field"] = function (json_option) { return this.set_rx_field("category_name", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "root_id");
    this["set_root_id_field"] = function (json_option) { return this.set_rx_field("root_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_category.prototype = new Super(); for (var key in rx_model.static_method) { course_category[key] = rx_model.static_method[key]; } })();function course_classification(instance_json) {
    rx_model.call(this, "course_classification", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "desc");
    this["set_desc_field"] = function (json_option) { return this.set_rx_field("desc", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_classification.prototype = new Super(); for (var key in rx_model.static_method) { course_classification[key] = rx_model.static_method[key]; } })();function course_collection(instance_json) {
    rx_model.call(this, "course_collection", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "collection_time");
    this["set_collection_time_field"] = function (json_option) { return this.set_rx_field("collection_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_collection.prototype = new Super(); for (var key in rx_model.static_method) { course_collection[key] = rx_model.static_method[key]; } })();function course_comment(instance_json) {
    rx_model.call(this, "course_comment", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_comment.prototype = new Super(); for (var key in rx_model.static_method) { course_comment[key] = rx_model.static_method[key]; } })();function course_data(instance_json) {
    rx_model.call(this, "course_data", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "path");
    this["set_path_field"] = function (json_option) { return this.set_rx_field("path", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }    create_rx_get_and_set_property(this, "file_size");
    this["set_file_size_field"] = function (json_option) { return this.set_rx_field("file_size", json_option); }    create_rx_get_and_set_property(this, "total_down");
    this["set_total_down_field"] = function (json_option) { return this.set_rx_field("total_down", json_option); }    create_rx_get_and_set_property(this, "technical_labe");
    this["set_technical_labe_field"] = function (json_option) { return this.set_rx_field("technical_labe", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_data.prototype = new Super(); for (var key in rx_model.static_method) { course_data[key] = rx_model.static_method[key]; } })();function course_dirctory(instance_json) {
    rx_model.call(this, "course_dirctory", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "dir_name");
    this["set_dir_name_field"] = function (json_option) { return this.set_rx_field("dir_name", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "num");
    this["set_num_field"] = function (json_option) { return this.set_rx_field("num", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "pulish_state");
    this["set_pulish_state_field"] = function (json_option) { return this.set_rx_field("pulish_state", json_option); }    create_rx_get_and_set_property(this, "video_id");
    this["set_video_id_field"] = function (json_option) { return this.set_rx_field("video_id", json_option); }    create_rx_get_and_set_property(this, "audio_id");
    this["set_audio_id_field"] = function (json_option) { return this.set_rx_field("audio_id", json_option); }    create_rx_get_and_set_property(this, "test_id");
    this["set_test_id_field"] = function (json_option) { return this.set_rx_field("test_id", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_dirctory.prototype = new Super(); for (var key in rx_model.static_method) { course_dirctory[key] = rx_model.static_method[key]; } })();function course_example(instance_json) {
    rx_model.call(this, "course_example", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "grade");
    this["set_grade_field"] = function (json_option) { return this.set_rx_field("grade", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "topic");
    this["set_topic_field"] = function (json_option) { return this.set_rx_field("topic", json_option); }    create_rx_get_and_set_property(this, "strat_time");
    this["set_strat_time_field"] = function (json_option) { return this.set_rx_field("strat_time", json_option); }    create_rx_get_and_set_property(this, "stop_time");
    this["set_stop_time_field"] = function (json_option) { return this.set_rx_field("stop_time", json_option); }    create_rx_get_and_set_property(this, "full_score");
    this["set_full_score_field"] = function (json_option) { return this.set_rx_field("full_score", json_option); }    create_rx_get_and_set_property(this, "pass_score");
    this["set_pass_score_field"] = function (json_option) { return this.set_rx_field("pass_score", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }    create_rx_get_and_set_property(this, "time_limit");
    this["set_time_limit_field"] = function (json_option) { return this.set_rx_field("time_limit", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "class_id_list");
    this["set_class_id_list_field"] = function (json_option) { return this.set_rx_field("class_id_list", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_example.prototype = new Super(); for (var key in rx_model.static_method) { course_example[key] = rx_model.static_method[key]; } })();function course_info(instance_json) {
    rx_model.call(this, "course_info", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "full_description");
    this["set_full_description_field"] = function (json_option) { return this.set_rx_field("full_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "add_time");
    this["set_add_time_field"] = function (json_option) { return this.set_rx_field("add_time", json_option); }    create_rx_get_and_set_property(this, "is_closed");
    this["set_is_closed_field"] = function (json_option) { return this.set_rx_field("is_closed", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "search_attr_list");
    this["set_search_attr_list_field"] = function (json_option) { return this.set_rx_field("search_attr_list", json_option); }    create_rx_get_and_set_property(this, "assort_id");
    this["set_assort_id_field"] = function (json_option) { return this.set_rx_field("assort_id", json_option); }    create_rx_get_and_set_property(this, "course_code");
    this["set_course_code_field"] = function (json_option) { return this.set_rx_field("course_code", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_info.prototype = new Super(); for (var key in rx_model.static_method) { course_info[key] = rx_model.static_method[key]; } })();function course_info_show(instance_json) {
    rx_model.call(this, "course_info_show", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_info_id");
    this["set_course_info_id_field"] = function (json_option) { return this.set_rx_field("course_info_id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_info_show.prototype = new Super(); for (var key in rx_model.static_method) { course_info_show[key] = rx_model.static_method[key]; } })();function course_info_show_competitive(instance_json) {
    rx_model.call(this, "course_info_show_competitive", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_info_id");
    this["set_course_info_id_field"] = function (json_option) { return this.set_rx_field("course_info_id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_info_show_competitive.prototype = new Super(); for (var key in rx_model.static_method) { course_info_show_competitive[key] = rx_model.static_method[key]; } })();function course_package(instance_json) {
    rx_model.call(this, "course_package", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "img");
    this["set_img_field"] = function (json_option) { return this.set_rx_field("img", json_option); }    create_rx_get_and_set_property(this, "description");
    this["set_description_field"] = function (json_option) { return this.set_rx_field("description", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "short_desc");
    this["set_short_desc_field"] = function (json_option) { return this.set_rx_field("short_desc", json_option); }    create_rx_get_and_set_property(this, "study_target");
    this["set_study_target_field"] = function (json_option) { return this.set_rx_field("study_target", json_option); }    create_rx_get_and_set_property(this, "job");
    this["set_job_field"] = function (json_option) { return this.set_rx_field("job", json_option); }    create_rx_get_and_set_property(this, "display_price");
    this["set_display_price_field"] = function (json_option) { return this.set_rx_field("display_price", json_option); }    create_rx_get_and_set_property(this, "course_id_list");
    this["set_course_id_list_field"] = function (json_option) { return this.set_rx_field("course_id_list", json_option); }    create_rx_get_and_set_property(this, "search_attr_list");
    this["set_search_attr_list_field"] = function (json_option) { return this.set_rx_field("search_attr_list", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_package.prototype = new Super(); for (var key in rx_model.static_method) { course_package[key] = rx_model.static_method[key]; } })();function course_package_price(instance_json) {
    rx_model.call(this, "course_package_price", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "package_id");
    this["set_package_id_field"] = function (json_option) { return this.set_rx_field("package_id", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "last_update");
    this["set_last_update_field"] = function (json_option) { return this.set_rx_field("last_update", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_package_price.prototype = new Super(); for (var key in rx_model.static_method) { course_package_price[key] = rx_model.static_method[key]; } })();function course_package_show(instance_json) {
    rx_model.call(this, "course_package_show", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_package_Id");
    this["set_course_package_Id_field"] = function (json_option) { return this.set_rx_field("course_package_Id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_package_show.prototype = new Super(); for (var key in rx_model.static_method) { course_package_show[key] = rx_model.static_method[key]; } })();function course_package_show_valueadded(instance_json) {
    rx_model.call(this, "course_package_show_valueadded", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_package_Id");
    this["set_course_package_Id_field"] = function (json_option) { return this.set_rx_field("course_package_Id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_package_show_valueadded.prototype = new Super(); for (var key in rx_model.static_method) { course_package_show_valueadded[key] = rx_model.static_method[key]; } })();function course_registration(instance_json) {
    rx_model.call(this, "course_registration", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id_list");
    this["set_course_id_list_field"] = function (json_option) { return this.set_rx_field("course_id_list", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "reg_time");
    this["set_reg_time_field"] = function (json_option) { return this.set_rx_field("reg_time", json_option); }    create_rx_get_and_set_property(this, "state");
    this["set_state_field"] = function (json_option) { return this.set_rx_field("state", json_option); }    create_rx_get_and_set_property(this, "deny_desc");
    this["set_deny_desc_field"] = function (json_option) { return this.set_rx_field("deny_desc", json_option); }    create_rx_get_and_set_property(this, "group_id");
    this["set_group_id_field"] = function (json_option) { return this.set_rx_field("group_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_registration.prototype = new Super(); for (var key in rx_model.static_method) { course_registration[key] = rx_model.static_method[key]; } })();function course_registration_group(instance_json) {
    rx_model.call(this, "course_registration_group", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id_list");
    this["set_course_id_list_field"] = function (json_option) { return this.set_rx_field("course_id_list", json_option); }    create_rx_get_and_set_property(this, "user_id_list");
    this["set_user_id_list_field"] = function (json_option) { return this.set_rx_field("user_id_list", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "state");
    this["set_state_field"] = function (json_option) { return this.set_rx_field("state", json_option); }    create_rx_get_and_set_property(this, "desc");
    this["set_desc_field"] = function (json_option) { return this.set_rx_field("desc", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_registration_group.prototype = new Super(); for (var key in rx_model.static_method) { course_registration_group[key] = rx_model.static_method[key]; } })();function course_talk(instance_json) {
    rx_model.call(this, "course_talk", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "is_back");
    this["set_is_back_field"] = function (json_option) { return this.set_rx_field("is_back", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "root_id");
    this["set_root_id_field"] = function (json_option) { return this.set_rx_field("root_id", json_option); }    create_rx_get_and_set_property(this, "is_top");
    this["set_is_top_field"] = function (json_option) { return this.set_rx_field("is_top", json_option); }    create_rx_get_and_set_property(this, "img_url_list");
    this["set_img_url_list_field"] = function (json_option) { return this.set_rx_field("img_url_list", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_talk.prototype = new Super(); for (var key in rx_model.static_method) { course_talk[key] = rx_model.static_method[key]; } })();function course_talk_thumbs(instance_json) {
    rx_model.call(this, "course_talk_thumbs", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "thumbs_time");
    this["set_thumbs_time_field"] = function (json_option) { return this.set_rx_field("thumbs_time", json_option); }    create_rx_get_and_set_property(this, "talk_id");
    this["set_talk_id_field"] = function (json_option) { return this.set_rx_field("talk_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_talk_thumbs.prototype = new Super(); for (var key in rx_model.static_method) { course_talk_thumbs[key] = rx_model.static_method[key]; } })();function course_user(instance_json) {
    rx_model.call(this, "course_user", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "open_time");
    this["set_open_time_field"] = function (json_option) { return this.set_rx_field("open_time", json_option); }    create_rx_get_and_set_property(this, "open_type");
    this["set_open_type_field"] = function (json_option) { return this.set_rx_field("open_type", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; course_user.prototype = new Super(); for (var key in rx_model.static_method) { course_user[key] = rx_model.static_method[key]; } })();function entry_organize_examine(instance_json) {
    rx_model.call(this, "entry_organize_examine", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "invitation_code");
    this["set_invitation_code_field"] = function (json_option) { return this.set_rx_field("invitation_code", json_option); }    create_rx_get_and_set_property(this, "create_date");
    this["set_create_date_field"] = function (json_option) { return this.set_rx_field("create_date", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "student_num");
    this["set_student_num_field"] = function (json_option) { return this.set_rx_field("student_num", json_option); }    create_rx_get_and_set_property(this, "node");
    this["set_node_field"] = function (json_option) { return this.set_rx_field("node", json_option); }    create_rx_get_and_set_property(this, "state");
    this["set_state_field"] = function (json_option) { return this.set_rx_field("state", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; entry_organize_examine.prototype = new Super(); for (var key in rx_model.static_method) { entry_organize_examine[key] = rx_model.static_method[key]; } })();function example_latitude(instance_json) {
    rx_model.call(this, "example_latitude", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; example_latitude.prototype = new Super(); for (var key in rx_model.static_method) { example_latitude[key] = rx_model.static_method[key]; } })();function example_result(instance_json) {
    rx_model.call(this, "example_result", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "example_id");
    this["set_example_id_field"] = function (json_option) { return this.set_rx_field("example_id", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "is_pass");
    this["set_is_pass_field"] = function (json_option) { return this.set_rx_field("is_pass", json_option); }    create_rx_get_and_set_property(this, "submit_date");
    this["set_submit_date_field"] = function (json_option) { return this.set_rx_field("submit_date", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; example_result.prototype = new Super(); for (var key in rx_model.static_method) { example_result[key] = rx_model.static_method[key]; } })();function example_result_detail(instance_json) {
    rx_model.call(this, "example_result_detail", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "result_id");
    this["set_result_id_field"] = function (json_option) { return this.set_rx_field("result_id", json_option); }    create_rx_get_and_set_property(this, "subject_id");
    this["set_subject_id_field"] = function (json_option) { return this.set_rx_field("subject_id", json_option); }    create_rx_get_and_set_property(this, "answer_list");
    this["set_answer_list_field"] = function (json_option) { return this.set_rx_field("answer_list", json_option); }    create_rx_get_and_set_property(this, "is_right");
    this["set_is_right_field"] = function (json_option) { return this.set_rx_field("is_right", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; example_result_detail.prototype = new Super(); for (var key in rx_model.static_method) { example_result_detail[key] = rx_model.static_method[key]; } })();function example_subject(instance_json) {
    rx_model.call(this, "example_subject", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "example_id");
    this["set_example_id_field"] = function (json_option) { return this.set_rx_field("example_id", json_option); }    create_rx_get_and_set_property(this, "subject_type");
    this["set_subject_type_field"] = function (json_option) { return this.set_rx_field("subject_type", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "answer_list");
    this["set_answer_list_field"] = function (json_option) { return this.set_rx_field("answer_list", json_option); }    create_rx_get_and_set_property(this, "item_list");
    this["set_item_list_field"] = function (json_option) { return this.set_rx_field("item_list", json_option); }    create_rx_get_and_set_property(this, "latitude_id");
    this["set_latitude_id_field"] = function (json_option) { return this.set_rx_field("latitude_id", json_option); }    create_rx_get_and_set_property(this, "is_order");
    this["set_is_order_field"] = function (json_option) { return this.set_rx_field("is_order", json_option); }    create_rx_get_and_set_property(this, "lib_id");
    this["set_lib_id_field"] = function (json_option) { return this.set_rx_field("lib_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; example_subject.prototype = new Super(); for (var key in rx_model.static_method) { example_subject[key] = rx_model.static_method[key]; } })();function example_subject_lib(instance_json) {
    rx_model.call(this, "example_subject_lib", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "subject_type");
    this["set_subject_type_field"] = function (json_option) { return this.set_rx_field("subject_type", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "answer_list");
    this["set_answer_list_field"] = function (json_option) { return this.set_rx_field("answer_list", json_option); }    create_rx_get_and_set_property(this, "item_list");
    this["set_item_list_field"] = function (json_option) { return this.set_rx_field("item_list", json_option); }    create_rx_get_and_set_property(this, "latitude_id");
    this["set_latitude_id_field"] = function (json_option) { return this.set_rx_field("latitude_id", json_option); }    create_rx_get_and_set_property(this, "is_order");
    this["set_is_order_field"] = function (json_option) { return this.set_rx_field("is_order", json_option); }    create_rx_get_and_set_property(this, "difficulty");
    this["set_difficulty_field"] = function (json_option) { return this.set_rx_field("difficulty", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; example_subject_lib.prototype = new Super(); for (var key in rx_model.static_method) { example_subject_lib[key] = rx_model.static_method[key]; } })();function friend_link(instance_json) {
    rx_model.call(this, "friend_link", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "logo");
    this["set_logo_field"] = function (json_option) { return this.set_rx_field("logo", json_option); }    create_rx_get_and_set_property(this, "link_url");
    this["set_link_url_field"] = function (json_option) { return this.set_rx_field("link_url", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "num");
    this["set_num_field"] = function (json_option) { return this.set_rx_field("num", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; friend_link.prototype = new Super(); for (var key in rx_model.static_method) { friend_link[key] = rx_model.static_method[key]; } })();function integral_log(instance_json) {
    rx_model.call(this, "integral_log", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "current_integral");
    this["set_current_integral_field"] = function (json_option) { return this.set_rx_field("current_integral", json_option); }    create_rx_get_and_set_property(this, "integral_value");
    this["set_integral_value_field"] = function (json_option) { return this.set_rx_field("integral_value", json_option); }    create_rx_get_and_set_property(this, "sith_integral");
    this["set_sith_integral_field"] = function (json_option) { return this.set_rx_field("sith_integral", json_option); }    create_rx_get_and_set_property(this, "node");
    this["set_node_field"] = function (json_option) { return this.set_rx_field("node", json_option); }    create_rx_get_and_set_property(this, "log_date");
    this["set_log_date_field"] = function (json_option) { return this.set_rx_field("log_date", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; integral_log.prototype = new Super(); for (var key in rx_model.static_method) { integral_log[key] = rx_model.static_method[key]; } })();function live_check_user(instance_json) {
    rx_model.call(this, "live_check_user", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "room_id");
    this["set_room_id_field"] = function (json_option) { return this.set_rx_field("room_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "check_time");
    this["set_check_time_field"] = function (json_option) { return this.set_rx_field("check_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; live_check_user.prototype = new Super(); for (var key in rx_model.static_method) { live_check_user[key] = rx_model.static_method[key]; } })();function live_course_comment(instance_json) {
    rx_model.call(this, "live_course_comment", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "room_id");
    this["set_room_id_field"] = function (json_option) { return this.set_rx_field("room_id", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; live_course_comment.prototype = new Super(); for (var key in rx_model.static_method) { live_course_comment[key] = rx_model.static_method[key]; } })();function live_room(instance_json) {
    rx_model.call(this, "live_room", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "channel_id");
    this["set_channel_id_field"] = function (json_option) { return this.set_rx_field("channel_id", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "publisher");
    this["set_publisher_field"] = function (json_option) { return this.set_rx_field("publisher", json_option); }    create_rx_get_and_set_property(this, "channel_pass");
    this["set_channel_pass_field"] = function (json_option) { return this.set_rx_field("channel_pass", json_option); }    create_rx_get_and_set_property(this, "status");
    this["set_status_field"] = function (json_option) { return this.set_rx_field("status", json_option); }    create_rx_get_and_set_property(this, "display");
    this["set_display_field"] = function (json_option) { return this.set_rx_field("display", json_option); }    create_rx_get_and_set_property(this, "secret_key");
    this["set_secret_key_field"] = function (json_option) { return this.set_rx_field("secret_key", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; live_room.prototype = new Super(); for (var key in rx_model.static_method) { live_room[key] = rx_model.static_method[key]; } })();function live_timetable(instance_json) {
    rx_model.call(this, "live_timetable", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "channel_id");
    this["set_channel_id_field"] = function (json_option) { return this.set_rx_field("channel_id", json_option); }    create_rx_get_and_set_property(this, "begin_time");
    this["set_begin_time_field"] = function (json_option) { return this.set_rx_field("begin_time", json_option); }    create_rx_get_and_set_property(this, "end_time");
    this["set_end_time_field"] = function (json_option) { return this.set_rx_field("end_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; live_timetable.prototype = new Super(); for (var key in rx_model.static_method) { live_timetable[key] = rx_model.static_method[key]; } })();function message(instance_json) {
    rx_model.call(this, "message", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "index_img");
    this["set_index_img_field"] = function (json_option) { return this.set_rx_field("index_img", json_option); }    create_rx_get_and_set_property(this, "message_type");
    this["set_message_type_field"] = function (json_option) { return this.set_rx_field("message_type", json_option); }    create_rx_get_and_set_property(this, "short_content");
    this["set_short_content_field"] = function (json_option) { return this.set_rx_field("short_content", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; message.prototype = new Super(); for (var key in rx_model.static_method) { message[key] = rx_model.static_method[key]; } })();function message_read_record(instance_json) {
    rx_model.call(this, "message_read_record", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "message_id");
    this["set_message_id_field"] = function (json_option) { return this.set_rx_field("message_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "reading_time");
    this["set_reading_time_field"] = function (json_option) { return this.set_rx_field("reading_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; message_read_record.prototype = new Super(); for (var key in rx_model.static_method) { message_read_record[key] = rx_model.static_method[key]; } })();function moot_audio(instance_json) {
    rx_model.call(this, "moot_audio", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "audio_name");
    this["set_audio_name_field"] = function (json_option) { return this.set_rx_field("audio_name", json_option); }    create_rx_get_and_set_property(this, "file_name");
    this["set_file_name_field"] = function (json_option) { return this.set_rx_field("file_name", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }    create_rx_get_and_set_property(this, "duration");
    this["set_duration_field"] = function (json_option) { return this.set_rx_field("duration", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; moot_audio.prototype = new Super(); for (var key in rx_model.static_method) { moot_audio[key] = rx_model.static_method[key]; } })();function moot_class(instance_json) {
    rx_model.call(this, "moot_class", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "user_id_list");
    this["set_user_id_list_field"] = function (json_option) { return this.set_rx_field("user_id_list", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; moot_class.prototype = new Super(); for (var key in rx_model.static_method) { moot_class[key] = rx_model.static_method[key]; } })();function moot_professional(instance_json) {
    rx_model.call(this, "moot_professional", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; moot_professional.prototype = new Super(); for (var key in rx_model.static_method) { moot_professional[key] = rx_model.static_method[key]; } })();function moot_qrcode(instance_json) {
    rx_model.call(this, "moot_qrcode", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code_text");
    this["set_code_text_field"] = function (json_option) { return this.set_rx_field("code_text", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "material_id");
    this["set_material_id_field"] = function (json_option) { return this.set_rx_field("material_id", json_option); }    create_rx_get_and_set_property(this, "link_url");
    this["set_link_url_field"] = function (json_option) { return this.set_rx_field("link_url", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }    create_rx_get_and_set_property(this, "logo_id");
    this["set_logo_id_field"] = function (json_option) { return this.set_rx_field("logo_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; moot_qrcode.prototype = new Super(); for (var key in rx_model.static_method) { moot_qrcode[key] = rx_model.static_method[key]; } })();function moot_qrcode_logo(instance_json) {
    rx_model.call(this, "moot_qrcode_logo", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; moot_qrcode_logo.prototype = new Super(); for (var key in rx_model.static_method) { moot_qrcode_logo[key] = rx_model.static_method[key]; } })();function moot_search_attr(instance_json) {
    rx_model.call(this, "moot_search_attr", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "is_hot");
    this["set_is_hot_field"] = function (json_option) { return this.set_rx_field("is_hot", json_option); }    create_rx_get_and_set_property(this, "img_url1");
    this["set_img_url1_field"] = function (json_option) { return this.set_rx_field("img_url1", json_option); }    create_rx_get_and_set_property(this, "img_url2");
    this["set_img_url2_field"] = function (json_option) { return this.set_rx_field("img_url2", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; moot_search_attr.prototype = new Super(); for (var key in rx_model.static_method) { moot_search_attr[key] = rx_model.static_method[key]; } })();function moot_video(instance_json) {
    rx_model.call(this, "moot_video", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "mp4");
    this["set_mp4_field"] = function (json_option) { return this.set_rx_field("mp4", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "df");
    this["set_df_field"] = function (json_option) { return this.set_rx_field("df", json_option); }    create_rx_get_and_set_property(this, "times");
    this["set_times_field"] = function (json_option) { return this.set_rx_field("times", json_option); }    create_rx_get_and_set_property(this, "vid");
    this["set_vid_field"] = function (json_option) { return this.set_rx_field("vid", json_option); }    create_rx_get_and_set_property(this, "mp4_1");
    this["set_mp4_1_field"] = function (json_option) { return this.set_rx_field("mp4_1", json_option); }    create_rx_get_and_set_property(this, "mp4_2");
    this["set_mp4_2_field"] = function (json_option) { return this.set_rx_field("mp4_2", json_option); }    create_rx_get_and_set_property(this, "mp4_3");
    this["set_mp4_3_field"] = function (json_option) { return this.set_rx_field("mp4_3", json_option); }    create_rx_get_and_set_property(this, "cataid");
    this["set_cataid_field"] = function (json_option) { return this.set_rx_field("cataid", json_option); }    create_rx_get_and_set_property(this, "swf_link");
    this["set_swf_link_field"] = function (json_option) { return this.set_rx_field("swf_link", json_option); }    create_rx_get_and_set_property(this, "status");
    this["set_status_field"] = function (json_option) { return this.set_rx_field("status", json_option); }    create_rx_get_and_set_property(this, "seed");
    this["set_seed_field"] = function (json_option) { return this.set_rx_field("seed", json_option); }    create_rx_get_and_set_property(this, "playerwidth");
    this["set_playerwidth_field"] = function (json_option) { return this.set_rx_field("playerwidth", json_option); }    create_rx_get_and_set_property(this, "duration");
    this["set_duration_field"] = function (json_option) { return this.set_rx_field("duration", json_option); }    create_rx_get_and_set_property(this, "first_image");
    this["set_first_image_field"] = function (json_option) { return this.set_rx_field("first_image", json_option); }    create_rx_get_and_set_property(this, "original_definition");
    this["set_original_definition_field"] = function (json_option) { return this.set_rx_field("original_definition", json_option); }    create_rx_get_and_set_property(this, "context");
    this["set_context_field"] = function (json_option) { return this.set_rx_field("context", json_option); }    create_rx_get_and_set_property(this, "playerheight");
    this["set_playerheight_field"] = function (json_option) { return this.set_rx_field("playerheight", json_option); }    create_rx_get_and_set_property(this, "ptime");
    this["set_ptime_field"] = function (json_option) { return this.set_rx_field("ptime", json_option); }    create_rx_get_and_set_property(this, "source_filesize");
    this["set_source_filesize_field"] = function (json_option) { return this.set_rx_field("source_filesize", json_option); }    create_rx_get_and_set_property(this, "filesize");
    this["set_filesize_field"] = function (json_option) { return this.set_rx_field("filesize", json_option); }    create_rx_get_and_set_property(this, "md5checksum");
    this["set_md5checksum_field"] = function (json_option) { return this.set_rx_field("md5checksum", json_option); }    create_rx_get_and_set_property(this, "hls");
    this["set_hls_field"] = function (json_option) { return this.set_rx_field("hls", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; moot_video.prototype = new Super(); for (var key in rx_model.static_method) { moot_video[key] = rx_model.static_method[key]; } })();function moot_video_category(instance_json) {
    rx_model.call(this, "moot_video_category", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "text");
    this["set_text_field"] = function (json_option) { return this.set_rx_field("text", json_option); }    create_rx_get_and_set_property(this, "cataname");
    this["set_cataname_field"] = function (json_option) { return this.set_rx_field("cataname", json_option); }    create_rx_get_and_set_property(this, "catatree");
    this["set_catatree_field"] = function (json_option) { return this.set_rx_field("catatree", json_option); }    create_rx_get_and_set_property(this, "cataid");
    this["set_cataid_field"] = function (json_option) { return this.set_rx_field("cataid", json_option); }    create_rx_get_and_set_property(this, "parentid");
    this["set_parentid_field"] = function (json_option) { return this.set_rx_field("parentid", json_option); }    create_rx_get_and_set_property(this, "videos");
    this["set_videos_field"] = function (json_option) { return this.set_rx_field("videos", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; moot_video_category.prototype = new Super(); for (var key in rx_model.static_method) { moot_video_category[key] = rx_model.static_method[key]; } })();function news_type(instance_json) {
    rx_model.call(this, "news_type", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; news_type.prototype = new Super(); for (var key in rx_model.static_method) { news_type[key] = rx_model.static_method[key]; } })();function order_course(instance_json) {
    rx_model.call(this, "order_course", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "order_num");
    this["set_order_num_field"] = function (json_option) { return this.set_rx_field("order_num", json_option); }    create_rx_get_and_set_property(this, "shop_name");
    this["set_shop_name_field"] = function (json_option) { return this.set_rx_field("shop_name", json_option); }    create_rx_get_and_set_property(this, "trade_price");
    this["set_trade_price_field"] = function (json_option) { return this.set_rx_field("trade_price", json_option); }    create_rx_get_and_set_property(this, "trade_time");
    this["set_trade_time_field"] = function (json_option) { return this.set_rx_field("trade_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "user_mobile");
    this["set_user_mobile_field"] = function (json_option) { return this.set_rx_field("user_mobile", json_option); }    create_rx_get_and_set_property(this, "order_state");
    this["set_order_state_field"] = function (json_option) { return this.set_rx_field("order_state", json_option); }    create_rx_get_and_set_property(this, "pay_method");
    this["set_pay_method_field"] = function (json_option) { return this.set_rx_field("pay_method", json_option); }    create_rx_get_and_set_property(this, "pay_time");
    this["set_pay_time_field"] = function (json_option) { return this.set_rx_field("pay_time", json_option); }    create_rx_get_and_set_property(this, "pay_trade_num");
    this["set_pay_trade_num_field"] = function (json_option) { return this.set_rx_field("pay_trade_num", json_option); }    create_rx_get_and_set_property(this, "pay_account");
    this["set_pay_account_field"] = function (json_option) { return this.set_rx_field("pay_account", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; order_course.prototype = new Super(); for (var key in rx_model.static_method) { order_course[key] = rx_model.static_method[key]; } })();function order_course_package(instance_json) {
    rx_model.call(this, "order_course_package", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "package_id");
    this["set_package_id_field"] = function (json_option) { return this.set_rx_field("package_id", json_option); }    create_rx_get_and_set_property(this, "order_num");
    this["set_order_num_field"] = function (json_option) { return this.set_rx_field("order_num", json_option); }    create_rx_get_and_set_property(this, "shop_name");
    this["set_shop_name_field"] = function (json_option) { return this.set_rx_field("shop_name", json_option); }    create_rx_get_and_set_property(this, "trade_price");
    this["set_trade_price_field"] = function (json_option) { return this.set_rx_field("trade_price", json_option); }    create_rx_get_and_set_property(this, "trade_time");
    this["set_trade_time_field"] = function (json_option) { return this.set_rx_field("trade_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "user_mobile");
    this["set_user_mobile_field"] = function (json_option) { return this.set_rx_field("user_mobile", json_option); }    create_rx_get_and_set_property(this, "order_state");
    this["set_order_state_field"] = function (json_option) { return this.set_rx_field("order_state", json_option); }    create_rx_get_and_set_property(this, "pay_method");
    this["set_pay_method_field"] = function (json_option) { return this.set_rx_field("pay_method", json_option); }    create_rx_get_and_set_property(this, "pay_time");
    this["set_pay_time_field"] = function (json_option) { return this.set_rx_field("pay_time", json_option); }    create_rx_get_and_set_property(this, "pay_trade_num");
    this["set_pay_trade_num_field"] = function (json_option) { return this.set_rx_field("pay_trade_num", json_option); }    create_rx_get_and_set_property(this, "pay_account");
    this["set_pay_account_field"] = function (json_option) { return this.set_rx_field("pay_account", json_option); }    create_rx_get_and_set_property(this, "course_list");
    this["set_course_list_field"] = function (json_option) { return this.set_rx_field("course_list", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; order_course_package.prototype = new Super(); for (var key in rx_model.static_method) { order_course_package[key] = rx_model.static_method[key]; } })();function order_product(instance_json) {
    rx_model.call(this, "order_product", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "product_id");
    this["set_product_id_field"] = function (json_option) { return this.set_rx_field("product_id", json_option); }    create_rx_get_and_set_property(this, "order_num");
    this["set_order_num_field"] = function (json_option) { return this.set_rx_field("order_num", json_option); }    create_rx_get_and_set_property(this, "product_name");
    this["set_product_name_field"] = function (json_option) { return this.set_rx_field("product_name", json_option); }    create_rx_get_and_set_property(this, "spec_list");
    this["set_spec_list_field"] = function (json_option) { return this.set_rx_field("spec_list", json_option); }    create_rx_get_and_set_property(this, "trade_price");
    this["set_trade_price_field"] = function (json_option) { return this.set_rx_field("trade_price", json_option); }    create_rx_get_and_set_property(this, "trade_integral");
    this["set_trade_integral_field"] = function (json_option) { return this.set_rx_field("trade_integral", json_option); }    create_rx_get_and_set_property(this, "trade_time");
    this["set_trade_time_field"] = function (json_option) { return this.set_rx_field("trade_time", json_option); }    create_rx_get_and_set_property(this, "buy_number");
    this["set_buy_number_field"] = function (json_option) { return this.set_rx_field("buy_number", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "user_mobile");
    this["set_user_mobile_field"] = function (json_option) { return this.set_rx_field("user_mobile", json_option); }    create_rx_get_and_set_property(this, "order_state");
    this["set_order_state_field"] = function (json_option) { return this.set_rx_field("order_state", json_option); }    create_rx_get_and_set_property(this, "pay_method");
    this["set_pay_method_field"] = function (json_option) { return this.set_rx_field("pay_method", json_option); }    create_rx_get_and_set_property(this, "pay_time");
    this["set_pay_time_field"] = function (json_option) { return this.set_rx_field("pay_time", json_option); }    create_rx_get_and_set_property(this, "pay_trade_num");
    this["set_pay_trade_num_field"] = function (json_option) { return this.set_rx_field("pay_trade_num", json_option); }    create_rx_get_and_set_property(this, "pay_account");
    this["set_pay_account_field"] = function (json_option) { return this.set_rx_field("pay_account", json_option); }    create_rx_get_and_set_property(this, "receiver_name");
    this["set_receiver_name_field"] = function (json_option) { return this.set_rx_field("receiver_name", json_option); }    create_rx_get_and_set_property(this, "receiver_address");
    this["set_receiver_address_field"] = function (json_option) { return this.set_rx_field("receiver_address", json_option); }    create_rx_get_and_set_property(this, "receiver_mobile");
    this["set_receiver_mobile_field"] = function (json_option) { return this.set_rx_field("receiver_mobile", json_option); }    create_rx_get_and_set_property(this, "express");
    this["set_express_field"] = function (json_option) { return this.set_rx_field("express", json_option); }    create_rx_get_and_set_property(this, "express_num");
    this["set_express_num_field"] = function (json_option) { return this.set_rx_field("express_num", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; order_product.prototype = new Super(); for (var key in rx_model.static_method) { order_product[key] = rx_model.static_method[key]; } })();function play_log(instance_json) {
    rx_model.call(this, "play_log", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "playId");
    this["set_playId_field"] = function (json_option) { return this.set_rx_field("playId", json_option); }    create_rx_get_and_set_property(this, "videoId");
    this["set_videoId_field"] = function (json_option) { return this.set_rx_field("videoId", json_option); }    create_rx_get_and_set_property(this, "playDuration");
    this["set_playDuration_field"] = function (json_option) { return this.set_rx_field("playDuration", json_option); }    create_rx_get_and_set_property(this, "stayDuration");
    this["set_stayDuration_field"] = function (json_option) { return this.set_rx_field("stayDuration", json_option); }    create_rx_get_and_set_property(this, "currentTimes");
    this["set_currentTimes_field"] = function (json_option) { return this.set_rx_field("currentTimes", json_option); }    create_rx_get_and_set_property(this, "duration");
    this["set_duration_field"] = function (json_option) { return this.set_rx_field("duration", json_option); }    create_rx_get_and_set_property(this, "flowSize");
    this["set_flowSize_field"] = function (json_option) { return this.set_rx_field("flowSize", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "ipAddress");
    this["set_ipAddress_field"] = function (json_option) { return this.set_rx_field("ipAddress", json_option); }    create_rx_get_and_set_property(this, "country");
    this["set_country_field"] = function (json_option) { return this.set_rx_field("country", json_option); }    create_rx_get_and_set_property(this, "province");
    this["set_province_field"] = function (json_option) { return this.set_rx_field("province", json_option); }    create_rx_get_and_set_property(this, "city");
    this["set_city_field"] = function (json_option) { return this.set_rx_field("city", json_option); }    create_rx_get_and_set_property(this, "isp");
    this["set_isp_field"] = function (json_option) { return this.set_rx_field("isp", json_option); }    create_rx_get_and_set_property(this, "referer");
    this["set_referer_field"] = function (json_option) { return this.set_rx_field("referer", json_option); }    create_rx_get_and_set_property(this, "userAgent");
    this["set_userAgent_field"] = function (json_option) { return this.set_rx_field("userAgent", json_option); }    create_rx_get_and_set_property(this, "operatingSystem");
    this["set_operatingSystem_field"] = function (json_option) { return this.set_rx_field("operatingSystem", json_option); }    create_rx_get_and_set_property(this, "browser");
    this["set_browser_field"] = function (json_option) { return this.set_rx_field("browser", json_option); }    create_rx_get_and_set_property(this, "isMobile");
    this["set_isMobile_field"] = function (json_option) { return this.set_rx_field("isMobile", json_option); }    create_rx_get_and_set_property(this, "createdTime");
    this["set_createdTime_field"] = function (json_option) { return this.set_rx_field("createdTime", json_option); }    create_rx_get_and_set_property(this, "down_date");
    this["set_down_date_field"] = function (json_option) { return this.set_rx_field("down_date", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; play_log.prototype = new Super(); for (var key in rx_model.static_method) { play_log[key] = rx_model.static_method[key]; } })();function popularity_course_info(instance_json) {
    rx_model.call(this, "popularity_course_info", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_info_id");
    this["set_course_info_id_field"] = function (json_option) { return this.set_rx_field("course_info_id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; popularity_course_info.prototype = new Super(); for (var key in rx_model.static_method) { popularity_course_info[key] = rx_model.static_method[key]; } })();function problem_feedback(instance_json) {
    rx_model.call(this, "problem_feedback", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "img_url_list");
    this["set_img_url_list_field"] = function (json_option) { return this.set_rx_field("img_url_list", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; problem_feedback.prototype = new Super(); for (var key in rx_model.static_method) { problem_feedback[key] = rx_model.static_method[key]; } })();function product(instance_json) {
    rx_model.call(this, "product", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "detail_desc");
    this["set_detail_desc_field"] = function (json_option) { return this.set_rx_field("detail_desc", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "image_url");
    this["set_image_url_field"] = function (json_option) { return this.set_rx_field("image_url", json_option); }    create_rx_get_and_set_property(this, "image_id_list");
    this["set_image_id_list_field"] = function (json_option) { return this.set_rx_field("image_id_list", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "is_recommend");
    this["set_is_recommend_field"] = function (json_option) { return this.set_rx_field("is_recommend", json_option); }    create_rx_get_and_set_property(this, "is_integral");
    this["set_is_integral_field"] = function (json_option) { return this.set_rx_field("is_integral", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; product.prototype = new Super(); for (var key in rx_model.static_method) { product[key] = rx_model.static_method[key]; } })();function product_category(instance_json) {
    rx_model.call(this, "product_category", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "index_display");
    this["set_index_display_field"] = function (json_option) { return this.set_rx_field("index_display", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; product_category.prototype = new Super(); for (var key in rx_model.static_method) { product_category[key] = rx_model.static_method[key]; } })();function product_img(instance_json) {
    rx_model.call(this, "product_img", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "path");
    this["set_path_field"] = function (json_option) { return this.set_rx_field("path", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; product_img.prototype = new Super(); for (var key in rx_model.static_method) { product_img[key] = rx_model.static_method[key]; } })();function product_sku(instance_json) {
    rx_model.call(this, "product_sku", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "integral");
    this["set_integral_field"] = function (json_option) { return this.set_rx_field("integral", json_option); }    create_rx_get_and_set_property(this, "stock");
    this["set_stock_field"] = function (json_option) { return this.set_rx_field("stock", json_option); }    create_rx_get_and_set_property(this, "product_id");
    this["set_product_id_field"] = function (json_option) { return this.set_rx_field("product_id", json_option); }    create_rx_get_and_set_property(this, "spec_list");
    this["set_spec_list_field"] = function (json_option) { return this.set_rx_field("spec_list", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; product_sku.prototype = new Super(); for (var key in rx_model.static_method) { product_sku[key] = rx_model.static_method[key]; } })();function qq_user(instance_json) {
    rx_model.call(this, "qq_user", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "openid");
    this["set_openid_field"] = function (json_option) { return this.set_rx_field("openid", json_option); }    create_rx_get_and_set_property(this, "access_token");
    this["set_access_token_field"] = function (json_option) { return this.set_rx_field("access_token", json_option); }    create_rx_get_and_set_property(this, "refresh_token");
    this["set_refresh_token_field"] = function (json_option) { return this.set_rx_field("refresh_token", json_option); }    create_rx_get_and_set_property(this, "nickname");
    this["set_nickname_field"] = function (json_option) { return this.set_rx_field("nickname", json_option); }    create_rx_get_and_set_property(this, "gender");
    this["set_gender_field"] = function (json_option) { return this.set_rx_field("gender", json_option); }    create_rx_get_and_set_property(this, "figureurl");
    this["set_figureurl_field"] = function (json_option) { return this.set_rx_field("figureurl", json_option); }    create_rx_get_and_set_property(this, "figureurl_1");
    this["set_figureurl_1_field"] = function (json_option) { return this.set_rx_field("figureurl_1", json_option); }    create_rx_get_and_set_property(this, "figureurl_2");
    this["set_figureurl_2_field"] = function (json_option) { return this.set_rx_field("figureurl_2", json_option); }    create_rx_get_and_set_property(this, "figureurl_qq_1");
    this["set_figureurl_qq_1_field"] = function (json_option) { return this.set_rx_field("figureurl_qq_1", json_option); }    create_rx_get_and_set_property(this, "figureurl_qq_2");
    this["set_figureurl_qq_2_field"] = function (json_option) { return this.set_rx_field("figureurl_qq_2", json_option); }    create_rx_get_and_set_property(this, "unionid");
    this["set_unionid_field"] = function (json_option) { return this.set_rx_field("unionid", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; qq_user.prototype = new Super(); for (var key in rx_model.static_method) { qq_user[key] = rx_model.static_method[key]; } })();function read_history(instance_json) {
    rx_model.call(this, "read_history", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "object_type");
    this["set_object_type_field"] = function (json_option) { return this.set_rx_field("object_type", json_option); }    create_rx_get_and_set_property(this, "object_id");
    this["set_object_id_field"] = function (json_option) { return this.set_rx_field("object_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; read_history.prototype = new Super(); for (var key in rx_model.static_method) { read_history[key] = rx_model.static_method[key]; } })();function receive_class(instance_json) {
    rx_model.call(this, "receive_class", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "object_type");
    this["set_object_type_field"] = function (json_option) { return this.set_rx_field("object_type", json_option); }    create_rx_get_and_set_property(this, "object_id");
    this["set_object_id_field"] = function (json_option) { return this.set_rx_field("object_id", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; receive_class.prototype = new Super(); for (var key in rx_model.static_method) { receive_class[key] = rx_model.static_method[key]; } })();function site_access_log(instance_json) {
    rx_model.call(this, "site_access_log", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "ip");
    this["set_ip_field"] = function (json_option) { return this.set_rx_field("ip", json_option); }    create_rx_get_and_set_property(this, "equipment");
    this["set_equipment_field"] = function (json_option) { return this.set_rx_field("equipment", json_option); }    create_rx_get_and_set_property(this, "browser");
    this["set_browser_field"] = function (json_option) { return this.set_rx_field("browser", json_option); }    create_rx_get_and_set_property(this, "create_date");
    this["set_create_date_field"] = function (json_option) { return this.set_rx_field("create_date", json_option); }    create_rx_get_and_set_property(this, "session_id");
    this["set_session_id_field"] = function (json_option) { return this.set_rx_field("session_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "country");
    this["set_country_field"] = function (json_option) { return this.set_rx_field("country", json_option); }    create_rx_get_and_set_property(this, "area");
    this["set_area_field"] = function (json_option) { return this.set_rx_field("area", json_option); }    create_rx_get_and_set_property(this, "region");
    this["set_region_field"] = function (json_option) { return this.set_rx_field("region", json_option); }    create_rx_get_and_set_property(this, "city");
    this["set_city_field"] = function (json_option) { return this.set_rx_field("city", json_option); }    create_rx_get_and_set_property(this, "county");
    this["set_county_field"] = function (json_option) { return this.set_rx_field("county", json_option); }    create_rx_get_and_set_property(this, "isp");
    this["set_isp_field"] = function (json_option) { return this.set_rx_field("isp", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; site_access_log.prototype = new Super(); for (var key in rx_model.static_method) { site_access_log[key] = rx_model.static_method[key]; } })();function spec_lib(instance_json) {
    rx_model.call(this, "spec_lib", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "items");
    this["set_items_field"] = function (json_option) { return this.set_rx_field("items", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; spec_lib.prototype = new Super(); for (var key in rx_model.static_method) { spec_lib[key] = rx_model.static_method[key]; } })();function student_grade(instance_json) {
    rx_model.call(this, "student_grade", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "grade_name");
    this["set_grade_name_field"] = function (json_option) { return this.set_rx_field("grade_name", json_option); }    create_rx_get_and_set_property(this, "min_integral");
    this["set_min_integral_field"] = function (json_option) { return this.set_rx_field("min_integral", json_option); }    create_rx_get_and_set_property(this, "grade_icon");
    this["set_grade_icon_field"] = function (json_option) { return this.set_rx_field("grade_icon", json_option); }    create_rx_get_and_set_property(this, "color");
    this["set_color_field"] = function (json_option) { return this.set_rx_field("color", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; student_grade.prototype = new Super(); for (var key in rx_model.static_method) { student_grade[key] = rx_model.static_method[key]; } })();function subject_info(instance_json) {
    rx_model.call(this, "subject_info", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; subject_info.prototype = new Super(); for (var key in rx_model.static_method) { subject_info[key] = rx_model.static_method[key]; } })();function switch_img(instance_json) {
    rx_model.call(this, "switch_img", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "img_path");
    this["set_img_path_field"] = function (json_option) { return this.set_rx_field("img_path", json_option); }    create_rx_get_and_set_property(this, "img_title");
    this["set_img_title_field"] = function (json_option) { return this.set_rx_field("img_title", json_option); }    create_rx_get_and_set_property(this, "num");
    this["set_num_field"] = function (json_option) { return this.set_rx_field("num", json_option); }    create_rx_get_and_set_property(this, "redirect_url");
    this["set_redirect_url_field"] = function (json_option) { return this.set_rx_field("redirect_url", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; switch_img.prototype = new Super(); for (var key in rx_model.static_method) { switch_img[key] = rx_model.static_method[key]; } })();function systemt_right(instance_json) {
    rx_model.call(this, "systemt_right", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "group_tag");
    this["set_group_tag_field"] = function (json_option) { return this.set_rx_field("group_tag", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; systemt_right.prototype = new Super(); for (var key in rx_model.static_method) { systemt_right[key] = rx_model.static_method[key]; } })();function system_admin(instance_json) {
    rx_model.call(this, "system_admin", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "login_name");
    this["set_login_name_field"] = function (json_option) { return this.set_rx_field("login_name", json_option); }    create_rx_get_and_set_property(this, "login_pass");
    this["set_login_pass_field"] = function (json_option) { return this.set_rx_field("login_pass", json_option); }    create_rx_get_and_set_property(this, "role_id");
    this["set_role_id_field"] = function (json_option) { return this.set_rx_field("role_id", json_option); }    create_rx_get_and_set_property(this, "last_login_time");
    this["set_last_login_time_field"] = function (json_option) { return this.set_rx_field("last_login_time", json_option); }    create_rx_get_and_set_property(this, "last_login_address");
    this["set_last_login_address_field"] = function (json_option) { return this.set_rx_field("last_login_address", json_option); }    create_rx_get_and_set_property(this, "reg_date");
    this["set_reg_date_field"] = function (json_option) { return this.set_rx_field("reg_date", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "email");
    this["set_email_field"] = function (json_option) { return this.set_rx_field("email", json_option); }    create_rx_get_and_set_property(this, "qq_openid");
    this["set_qq_openid_field"] = function (json_option) { return this.set_rx_field("qq_openid", json_option); }    create_rx_get_and_set_property(this, "wx_openid");
    this["set_wx_openid_field"] = function (json_option) { return this.set_rx_field("wx_openid", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; system_admin.prototype = new Super(); for (var key in rx_model.static_method) { system_admin[key] = rx_model.static_method[key]; } })();function system_organize(instance_json) {
    rx_model.call(this, "system_organize", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }    create_rx_get_and_set_property(this, "short_name");
    this["set_short_name_field"] = function (json_option) { return this.set_rx_field("short_name", json_option); }    create_rx_get_and_set_property(this, "user_id_list");
    this["set_user_id_list_field"] = function (json_option) { return this.set_rx_field("user_id_list", json_option); }    create_rx_get_and_set_property(this, "invitation_code");
    this["set_invitation_code_field"] = function (json_option) { return this.set_rx_field("invitation_code", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; system_organize.prototype = new Super(); for (var key in rx_model.static_method) { system_organize[key] = rx_model.static_method[key]; } })();function system_role(instance_json) {
    rx_model.call(this, "system_role", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "desc");
    this["set_desc_field"] = function (json_option) { return this.set_rx_field("desc", json_option); }    create_rx_get_and_set_property(this, "rights");
    this["set_rights_field"] = function (json_option) { return this.set_rx_field("rights", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; system_role.prototype = new Super(); for (var key in rx_model.static_method) { system_role[key] = rx_model.static_method[key]; } })();function user_notice(instance_json) {
    rx_model.call(this, "user_notice", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "total_count");
    this["set_total_count_field"] = function (json_option) { return this.set_rx_field("total_count", json_option); }    create_rx_get_and_set_property(this, "total_read");
    this["set_total_read_field"] = function (json_option) { return this.set_rx_field("total_read", json_option); }    create_rx_get_and_set_property(this, "img_list");
    this["set_img_list_field"] = function (json_option) { return this.set_rx_field("img_list", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; user_notice.prototype = new Super(); for (var key in rx_model.static_method) { user_notice[key] = rx_model.static_method[key]; } })();function user_right(instance_json) {
    rx_model.call(this, "user_right", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "group_tag");
    this["set_group_tag_field"] = function (json_option) { return this.set_rx_field("group_tag", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; user_right.prototype = new Super(); for (var key in rx_model.static_method) { user_right[key] = rx_model.static_method[key]; } })();function user_search_tag(instance_json) {
    rx_model.call(this, "user_search_tag", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "ip");
    this["set_ip_field"] = function (json_option) { return this.set_rx_field("ip", json_option); }    create_rx_get_and_set_property(this, "equipment");
    this["set_equipment_field"] = function (json_option) { return this.set_rx_field("equipment", json_option); }    create_rx_get_and_set_property(this, "app_type");
    this["set_app_type_field"] = function (json_option) { return this.set_rx_field("app_type", json_option); }    create_rx_get_and_set_property(this, "system");
    this["set_system_field"] = function (json_option) { return this.set_rx_field("system", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; user_search_tag.prototype = new Super(); for (var key in rx_model.static_method) { user_search_tag[key] = rx_model.static_method[key]; } })();function user_task(instance_json) {
    rx_model.call(this, "user_task", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "total_read");
    this["set_total_read_field"] = function (json_option) { return this.set_rx_field("total_read", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; user_task.prototype = new Super(); for (var key in rx_model.static_method) { user_task[key] = rx_model.static_method[key]; } })();function web_user(instance_json) {
    rx_model.call(this, "web_user", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "login_name");
    this["set_login_name_field"] = function (json_option) { return this.set_rx_field("login_name", json_option); }    create_rx_get_and_set_property(this, "login_pass");
    this["set_login_pass_field"] = function (json_option) { return this.set_rx_field("login_pass", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "email");
    this["set_email_field"] = function (json_option) { return this.set_rx_field("email", json_option); }    create_rx_get_and_set_property(this, "qq_unionid");
    this["set_qq_unionid_field"] = function (json_option) { return this.set_rx_field("qq_unionid", json_option); }    create_rx_get_and_set_property(this, "wx_unionid");
    this["set_wx_unionid_field"] = function (json_option) { return this.set_rx_field("wx_unionid", json_option); }    create_rx_get_and_set_property(this, "reg_date");
    this["set_reg_date_field"] = function (json_option) { return this.set_rx_field("reg_date", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "gender");
    this["set_gender_field"] = function (json_option) { return this.set_rx_field("gender", json_option); }    create_rx_get_and_set_property(this, "current_integral");
    this["set_current_integral_field"] = function (json_option) { return this.set_rx_field("current_integral", json_option); }    create_rx_get_and_set_property(this, "total_integral");
    this["set_total_integral_field"] = function (json_option) { return this.set_rx_field("total_integral", json_option); }    create_rx_get_and_set_property(this, "student_num");
    this["set_student_num_field"] = function (json_option) { return this.set_rx_field("student_num", json_option); }    create_rx_get_and_set_property(this, "idcard");
    this["set_idcard_field"] = function (json_option) { return this.set_rx_field("idcard", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "short_info");
    this["set_short_info_field"] = function (json_option) { return this.set_rx_field("short_info", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "birthday");
    this["set_birthday_field"] = function (json_option) { return this.set_rx_field("birthday", json_option); }    create_rx_get_and_set_property(this, "teacher_type");
    this["set_teacher_type_field"] = function (json_option) { return this.set_rx_field("teacher_type", json_option); }    create_rx_get_and_set_property(this, "is_manager");
    this["set_is_manager_field"] = function (json_option) { return this.set_rx_field("is_manager", json_option); }    create_rx_get_and_set_property(this, "mobile");
    this["set_mobile_field"] = function (json_option) { return this.set_rx_field("mobile", json_option); }    create_rx_get_and_set_property(this, "state");
    this["set_state_field"] = function (json_option) { return this.set_rx_field("state", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; web_user.prototype = new Super(); for (var key in rx_model.static_method) { web_user[key] = rx_model.static_method[key]; } })();function weixin_user(instance_json) {
    rx_model.call(this, "weixin_user", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "openid");
    this["set_openid_field"] = function (json_option) { return this.set_rx_field("openid", json_option); }    create_rx_get_and_set_property(this, "access_token");
    this["set_access_token_field"] = function (json_option) { return this.set_rx_field("access_token", json_option); }    create_rx_get_and_set_property(this, "refresh_token");
    this["set_refresh_token_field"] = function (json_option) { return this.set_rx_field("refresh_token", json_option); }    create_rx_get_and_set_property(this, "nickname");
    this["set_nickname_field"] = function (json_option) { return this.set_rx_field("nickname", json_option); }    create_rx_get_and_set_property(this, "sex");
    this["set_sex_field"] = function (json_option) { return this.set_rx_field("sex", json_option); }    create_rx_get_and_set_property(this, "province");
    this["set_province_field"] = function (json_option) { return this.set_rx_field("province", json_option); }    create_rx_get_and_set_property(this, "city");
    this["set_city_field"] = function (json_option) { return this.set_rx_field("city", json_option); }    create_rx_get_and_set_property(this, "country");
    this["set_country_field"] = function (json_option) { return this.set_rx_field("country", json_option); }    create_rx_get_and_set_property(this, "headimgurl");
    this["set_headimgurl_field"] = function (json_option) { return this.set_rx_field("headimgurl", json_option); }    create_rx_get_and_set_property(this, "privilege");
    this["set_privilege_field"] = function (json_option) { return this.set_rx_field("privilege", json_option); }    create_rx_get_and_set_property(this, "unionid");
    this["set_unionid_field"] = function (json_option) { return this.set_rx_field("unionid", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; weixin_user.prototype = new Super(); for (var key in rx_model.static_method) { weixin_user[key] = rx_model.static_method[key]; } })();/*models ----------end*//*views ----------begin*/function v_system_organize_list(instance_json) {
    rx_view.call(this, "v_system_organize_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }    create_rx_get_and_set_property(this, "short_name");
    this["set_short_name_field"] = function (json_option) { return this.set_rx_field("short_name", json_option); }    create_rx_get_and_set_property(this, "user_id_list");
    this["set_user_id_list_field"] = function (json_option) { return this.set_rx_field("user_id_list", json_option); }    create_rx_get_and_set_property(this, "invitation_code");
    this["set_invitation_code_field"] = function (json_option) { return this.set_rx_field("invitation_code", json_option); }    create_rx_get_and_set_property(this, "user_name_list");
    this["set_user_name_list_field"] = function (json_option) { return this.set_rx_field("user_name_list", json_option); }    create_rx_get_and_set_property(this, "class_count");
    this["set_class_count_field"] = function (json_option) { return this.set_rx_field("class_count", json_option); }    create_rx_get_and_set_property(this, "student_count");
    this["set_student_count_field"] = function (json_option) { return this.set_rx_field("student_count", json_option); }    create_rx_get_and_set_property(this, "teacher_count");
    this["set_teacher_count_field"] = function (json_option) { return this.set_rx_field("teacher_count", json_option); }    create_rx_get_and_set_property(this, "assistant_count");
    this["set_assistant_count_field"] = function (json_option) { return this.set_rx_field("assistant_count", json_option); }    create_rx_get_and_set_property(this, "manager_count");
    this["set_manager_count_field"] = function (json_option) { return this.set_rx_field("manager_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_system_organize_list.prototype = new Super(); for (var key in rx_view.static_method) { v_system_organize_list[key] = rx_view.static_method[key]; } v_system_organize_list.view_first_column = "id"; view_first_columns['v_system_organize_list'] = 'id'; })();function v_backlog_info(instance_json) {
    rx_view.call(this, "v_backlog_info", instance_json);    create_rx_get_and_set_property(this, "zero_course_package_count");
    this["set_zero_course_package_count_field"] = function (json_option) { return this.set_rx_field("zero_course_package_count", json_option); }    create_rx_get_and_set_property(this, "no_full_package_price_count");
    this["set_no_full_package_price_count_field"] = function (json_option) { return this.set_rx_field("no_full_package_price_count", json_option); }    create_rx_get_and_set_property(this, "being_course_user_count");
    this["set_being_course_user_count_field"] = function (json_option) { return this.set_rx_field("being_course_user_count", json_option); }    create_rx_get_and_set_property(this, "zero_example_subject_count");
    this["set_zero_example_subject_count_field"] = function (json_option) { return this.set_rx_field("zero_example_subject_count", json_option); }    create_rx_get_and_set_property(this, "zero_organize_teacher_count");
    this["set_zero_organize_teacher_count_field"] = function (json_option) { return this.set_rx_field("zero_organize_teacher_count", json_option); }    create_rx_get_and_set_property(this, "zero_organize_manager_count");
    this["set_zero_organize_manager_count_field"] = function (json_option) { return this.set_rx_field("zero_organize_manager_count", json_option); }    create_rx_get_and_set_property(this, "zero_class_student_count");
    this["set_zero_class_student_count_field"] = function (json_option) { return this.set_rx_field("zero_class_student_count", json_option); }    create_rx_get_and_set_property(this, "pending_order_product_count");
    this["set_pending_order_product_count_field"] = function (json_option) { return this.set_rx_field("pending_order_product_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_backlog_info.prototype = new Super(); for (var key in rx_view.static_method) { v_backlog_info[key] = rx_view.static_method[key]; } v_backlog_info.view_first_column = "zero_course_package_count"; view_first_columns['v_backlog_info'] = 'zero_course_package_count'; })();function all_notice_list(instance_json) {
    rx_view.call(this, "all_notice_list", instance_json);    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "total_count");
    this["set_total_count_field"] = function (json_option) { return this.set_rx_field("total_count", json_option); }    create_rx_get_and_set_property(this, "total_read");
    this["set_total_read_field"] = function (json_option) { return this.set_rx_field("total_read", json_option); }    create_rx_get_and_set_property(this, "img_list");
    this["set_img_list_field"] = function (json_option) { return this.set_rx_field("img_list", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; all_notice_list.prototype = new Super(); for (var key in rx_view.static_method) { all_notice_list[key] = rx_view.static_method[key]; } all_notice_list.view_first_column = "name"; view_first_columns['all_notice_list'] = 'name'; })();function all_teacherhomework_list(instance_json) {
    rx_view.call(this, "all_teacherhomework_list", instance_json);    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "total_read");
    this["set_total_read_field"] = function (json_option) { return this.set_rx_field("total_read", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; all_teacherhomework_list.prototype = new Super(); for (var key in rx_view.static_method) { all_teacherhomework_list[key] = rx_view.static_method[key]; } all_teacherhomework_list.view_first_column = "name"; view_first_columns['all_teacherhomework_list'] = 'name'; })();function example_result_detail_list(instance_json) {
    rx_view.call(this, "example_result_detail_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "result_id");
    this["set_result_id_field"] = function (json_option) { return this.set_rx_field("result_id", json_option); }    create_rx_get_and_set_property(this, "example_id");
    this["set_example_id_field"] = function (json_option) { return this.set_rx_field("example_id", json_option); }    create_rx_get_and_set_property(this, "subject_id");
    this["set_subject_id_field"] = function (json_option) { return this.set_rx_field("subject_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "item_list");
    this["set_item_list_field"] = function (json_option) { return this.set_rx_field("item_list", json_option); }    create_rx_get_and_set_property(this, "latitude_id");
    this["set_latitude_id_field"] = function (json_option) { return this.set_rx_field("latitude_id", json_option); }    create_rx_get_and_set_property(this, "latitude_name");
    this["set_latitude_name_field"] = function (json_option) { return this.set_rx_field("latitude_name", json_option); }    create_rx_get_and_set_property(this, "answer_list");
    this["set_answer_list_field"] = function (json_option) { return this.set_rx_field("answer_list", json_option); }    create_rx_get_and_set_property(this, "select_answer_list");
    this["set_select_answer_list_field"] = function (json_option) { return this.set_rx_field("select_answer_list", json_option); }    create_rx_get_and_set_property(this, "is_right");
    this["set_is_right_field"] = function (json_option) { return this.set_rx_field("is_right", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "subject_type");
    this["set_subject_type_field"] = function (json_option) { return this.set_rx_field("subject_type", json_option); }    create_rx_get_and_set_property(this, "submit_date");
    this["set_submit_date_field"] = function (json_option) { return this.set_rx_field("submit_date", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; example_result_detail_list.prototype = new Super(); for (var key in rx_view.static_method) { example_result_detail_list[key] = rx_view.static_method[key]; } example_result_detail_list.view_first_column = "id"; view_first_columns['example_result_detail_list'] = 'id'; })();function teacherhomework_list(instance_json) {
    rx_view.call(this, "teacherhomework_list", instance_json);    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "total_read");
    this["set_total_read_field"] = function (json_option) { return this.set_rx_field("total_read", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; teacherhomework_list.prototype = new Super(); for (var key in rx_view.static_method) { teacherhomework_list[key] = rx_view.static_method[key]; } teacherhomework_list.view_first_column = "user_name"; view_first_columns['teacherhomework_list'] = 'user_name'; })();function v_all_notice_list(instance_json) {
    rx_view.call(this, "v_all_notice_list", instance_json);    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "total_count");
    this["set_total_count_field"] = function (json_option) { return this.set_rx_field("total_count", json_option); }    create_rx_get_and_set_property(this, "total_read");
    this["set_total_read_field"] = function (json_option) { return this.set_rx_field("total_read", json_option); }    create_rx_get_and_set_property(this, "img_list");
    this["set_img_list_field"] = function (json_option) { return this.set_rx_field("img_list", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_all_notice_list.prototype = new Super(); for (var key in rx_view.static_method) { v_all_notice_list[key] = rx_view.static_method[key]; } v_all_notice_list.view_first_column = "name"; view_first_columns['v_all_notice_list'] = 'name'; })();function v_all_order_list(instance_json) {
    rx_view.call(this, "v_all_order_list", instance_json);    create_rx_get_and_set_property(this, "order_id");
    this["set_order_id_field"] = function (json_option) { return this.set_rx_field("order_id", json_option); }    create_rx_get_and_set_property(this, "product_id");
    this["set_product_id_field"] = function (json_option) { return this.set_rx_field("product_id", json_option); }    create_rx_get_and_set_property(this, "image_url");
    this["set_image_url_field"] = function (json_option) { return this.set_rx_field("image_url", json_option); }    create_rx_get_and_set_property(this, "order_num");
    this["set_order_num_field"] = function (json_option) { return this.set_rx_field("order_num", json_option); }    create_rx_get_and_set_property(this, "product_name");
    this["set_product_name_field"] = function (json_option) { return this.set_rx_field("product_name", json_option); }    create_rx_get_and_set_property(this, "trade_price");
    this["set_trade_price_field"] = function (json_option) { return this.set_rx_field("trade_price", json_option); }    create_rx_get_and_set_property(this, "trade_integral");
    this["set_trade_integral_field"] = function (json_option) { return this.set_rx_field("trade_integral", json_option); }    create_rx_get_and_set_property(this, "trade_time");
    this["set_trade_time_field"] = function (json_option) { return this.set_rx_field("trade_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "user_mobile");
    this["set_user_mobile_field"] = function (json_option) { return this.set_rx_field("user_mobile", json_option); }    create_rx_get_and_set_property(this, "order_state");
    this["set_order_state_field"] = function (json_option) { return this.set_rx_field("order_state", json_option); }    create_rx_get_and_set_property(this, "pay_method");
    this["set_pay_method_field"] = function (json_option) { return this.set_rx_field("pay_method", json_option); }    create_rx_get_and_set_property(this, "pay_time");
    this["set_pay_time_field"] = function (json_option) { return this.set_rx_field("pay_time", json_option); }    create_rx_get_and_set_property(this, "pay_trade_num");
    this["set_pay_trade_num_field"] = function (json_option) { return this.set_rx_field("pay_trade_num", json_option); }    create_rx_get_and_set_property(this, "pay_account");
    this["set_pay_account_field"] = function (json_option) { return this.set_rx_field("pay_account", json_option); }    create_rx_get_and_set_property(this, "receiver_address");
    this["set_receiver_address_field"] = function (json_option) { return this.set_rx_field("receiver_address", json_option); }    create_rx_get_and_set_property(this, "buy_num");
    this["set_buy_num_field"] = function (json_option) { return this.set_rx_field("buy_num", json_option); }    create_rx_get_and_set_property(this, "order_type");
    this["set_order_type_field"] = function (json_option) { return this.set_rx_field("order_type", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_all_order_list.prototype = new Super(); for (var key in rx_view.static_method) { v_all_order_list[key] = rx_view.static_method[key]; } v_all_order_list.view_first_column = "order_id"; view_first_columns['v_all_order_list'] = 'order_id'; })();function v_article_news(instance_json) {
    rx_view.call(this, "v_article_news", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "index_img");
    this["set_index_img_field"] = function (json_option) { return this.set_rx_field("index_img", json_option); }    create_rx_get_and_set_property(this, "article_type");
    this["set_article_type_field"] = function (json_option) { return this.set_rx_field("article_type", json_option); }    create_rx_get_and_set_property(this, "short_content");
    this["set_short_content_field"] = function (json_option) { return this.set_rx_field("short_content", json_option); }    create_rx_get_and_set_property(this, "read_count");
    this["set_read_count_field"] = function (json_option) { return this.set_rx_field("read_count", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_article_news.prototype = new Super(); for (var key in rx_view.static_method) { v_article_news[key] = rx_view.static_method[key]; } v_article_news.view_first_column = "id"; view_first_columns['v_article_news'] = 'id'; })();function v_article_notice(instance_json) {
    rx_view.call(this, "v_article_notice", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "index_img");
    this["set_index_img_field"] = function (json_option) { return this.set_rx_field("index_img", json_option); }    create_rx_get_and_set_property(this, "article_type");
    this["set_article_type_field"] = function (json_option) { return this.set_rx_field("article_type", json_option); }    create_rx_get_and_set_property(this, "short_content");
    this["set_short_content_field"] = function (json_option) { return this.set_rx_field("short_content", json_option); }    create_rx_get_and_set_property(this, "read_count");
    this["set_read_count_field"] = function (json_option) { return this.set_rx_field("read_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_article_notice.prototype = new Super(); for (var key in rx_view.static_method) { v_article_notice[key] = rx_view.static_method[key]; } v_article_notice.view_first_column = "id"; view_first_columns['v_article_notice'] = 'id'; })();function v_audio_log_progress(instance_json) {
    rx_view.call(this, "v_audio_log_progress", instance_json);    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "audio_id");
    this["set_audio_id_field"] = function (json_option) { return this.set_rx_field("audio_id", json_option); }    create_rx_get_and_set_property(this, "dirctory_id");
    this["set_dirctory_id_field"] = function (json_option) { return this.set_rx_field("dirctory_id", json_option); }    create_rx_get_and_set_property(this, "user_count");
    this["set_user_count_field"] = function (json_option) { return this.set_rx_field("user_count", json_option); }    create_rx_get_and_set_property(this, "complete_count");
    this["set_complete_count_field"] = function (json_option) { return this.set_rx_field("complete_count", json_option); }    create_rx_get_and_set_property(this, "progress");
    this["set_progress_field"] = function (json_option) { return this.set_rx_field("progress", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_audio_log_progress.prototype = new Super(); for (var key in rx_view.static_method) { v_audio_log_progress[key] = rx_view.static_method[key]; } v_audio_log_progress.view_first_column = "class_id"; view_first_columns['v_audio_log_progress'] = 'class_id'; })();function v_course_comment_list(instance_json) {
    rx_view.call(this, "v_course_comment_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "gender");
    this["set_gender_field"] = function (json_option) { return this.set_rx_field("gender", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_comment_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_comment_list[key] = rx_view.static_method[key]; } v_course_comment_list.view_first_column = "id"; view_first_columns['v_course_comment_list'] = 'id'; })();function v_course_data_list(instance_json) {
    rx_view.call(this, "v_course_data_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "path");
    this["set_path_field"] = function (json_option) { return this.set_rx_field("path", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }    create_rx_get_and_set_property(this, "file_size");
    this["set_file_size_field"] = function (json_option) { return this.set_rx_field("file_size", json_option); }    create_rx_get_and_set_property(this, "total_down");
    this["set_total_down_field"] = function (json_option) { return this.set_rx_field("total_down", json_option); }    create_rx_get_and_set_property(this, "user_realname");
    this["set_user_realname_field"] = function (json_option) { return this.set_rx_field("user_realname", json_option); }    create_rx_get_and_set_property(this, "technical_labe");
    this["set_technical_labe_field"] = function (json_option) { return this.set_rx_field("technical_labe", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_data_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_data_list[key] = rx_view.static_method[key]; } v_course_data_list.view_first_column = "id"; view_first_columns['v_course_data_list'] = 'id'; })();function v_course_dirctory_list(instance_json) {
    rx_view.call(this, "v_course_dirctory_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "dir_name");
    this["set_dir_name_field"] = function (json_option) { return this.set_rx_field("dir_name", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "num");
    this["set_num_field"] = function (json_option) { return this.set_rx_field("num", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "pulish_state");
    this["set_pulish_state_field"] = function (json_option) { return this.set_rx_field("pulish_state", json_option); }    create_rx_get_and_set_property(this, "video_id");
    this["set_video_id_field"] = function (json_option) { return this.set_rx_field("video_id", json_option); }    create_rx_get_and_set_property(this, "video_name");
    this["set_video_name_field"] = function (json_option) { return this.set_rx_field("video_name", json_option); }    create_rx_get_and_set_property(this, "video_duration");
    this["set_video_duration_field"] = function (json_option) { return this.set_rx_field("video_duration", json_option); }    create_rx_get_and_set_property(this, "audio_id");
    this["set_audio_id_field"] = function (json_option) { return this.set_rx_field("audio_id", json_option); }    create_rx_get_and_set_property(this, "audio_name");
    this["set_audio_name_field"] = function (json_option) { return this.set_rx_field("audio_name", json_option); }    create_rx_get_and_set_property(this, "audio_duration");
    this["set_audio_duration_field"] = function (json_option) { return this.set_rx_field("audio_duration", json_option); }    create_rx_get_and_set_property(this, "test_id");
    this["set_test_id_field"] = function (json_option) { return this.set_rx_field("test_id", json_option); }    create_rx_get_and_set_property(this, "test_name");
    this["set_test_name_field"] = function (json_option) { return this.set_rx_field("test_name", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_dirctory_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_dirctory_list[key] = rx_view.static_method[key]; } v_course_dirctory_list.view_first_column = "id"; view_first_columns['v_course_dirctory_list'] = 'id'; })();function v_course_dirctory_tree(instance_json) {
    rx_view.call(this, "v_course_dirctory_tree", instance_json);    create_rx_get_and_set_property(this, "aid");
    this["set_aid_field"] = function (json_option) { return this.set_rx_field("aid", json_option); }    create_rx_get_and_set_property(this, "acourse_id");
    this["set_acourse_id_field"] = function (json_option) { return this.set_rx_field("acourse_id", json_option); }    create_rx_get_and_set_property(this, "adir_name");
    this["set_adir_name_field"] = function (json_option) { return this.set_rx_field("adir_name", json_option); }    create_rx_get_and_set_property(this, "alevel");
    this["set_alevel_field"] = function (json_option) { return this.set_rx_field("alevel", json_option); }    create_rx_get_and_set_property(this, "anum");
    this["set_anum_field"] = function (json_option) { return this.set_rx_field("anum", json_option); }    create_rx_get_and_set_property(this, "aparent_id");
    this["set_aparent_id_field"] = function (json_option) { return this.set_rx_field("aparent_id", json_option); }    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "dir_name");
    this["set_dir_name_field"] = function (json_option) { return this.set_rx_field("dir_name", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "num");
    this["set_num_field"] = function (json_option) { return this.set_rx_field("num", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_dirctory_tree.prototype = new Super(); for (var key in rx_view.static_method) { v_course_dirctory_tree[key] = rx_view.static_method[key]; } v_course_dirctory_tree.view_first_column = "aid"; view_first_columns['v_course_dirctory_tree'] = 'aid'; })();function v_course_example_list(instance_json) {
    rx_view.call(this, "v_course_example_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "grade");
    this["set_grade_field"] = function (json_option) { return this.set_rx_field("grade", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "topic");
    this["set_topic_field"] = function (json_option) { return this.set_rx_field("topic", json_option); }    create_rx_get_and_set_property(this, "strat_time");
    this["set_strat_time_field"] = function (json_option) { return this.set_rx_field("strat_time", json_option); }    create_rx_get_and_set_property(this, "stop_time");
    this["set_stop_time_field"] = function (json_option) { return this.set_rx_field("stop_time", json_option); }    create_rx_get_and_set_property(this, "full_score");
    this["set_full_score_field"] = function (json_option) { return this.set_rx_field("full_score", json_option); }    create_rx_get_and_set_property(this, "pass_score");
    this["set_pass_score_field"] = function (json_option) { return this.set_rx_field("pass_score", json_option); }    create_rx_get_and_set_property(this, "is_all");
    this["set_is_all_field"] = function (json_option) { return this.set_rx_field("is_all", json_option); }    create_rx_get_and_set_property(this, "time_limit");
    this["set_time_limit_field"] = function (json_option) { return this.set_rx_field("time_limit", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "class_id_list");
    this["set_class_id_list_field"] = function (json_option) { return this.set_rx_field("class_id_list", json_option); }    create_rx_get_and_set_property(this, "subject_count");
    this["set_subject_count_field"] = function (json_option) { return this.set_rx_field("subject_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_example_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_example_list[key] = rx_view.static_method[key]; } v_course_example_list.view_first_column = "id"; view_first_columns['v_course_example_list'] = 'id'; })();function v_course_info_list(instance_json) {
    rx_view.call(this, "v_course_info_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "full_description");
    this["set_full_description_field"] = function (json_option) { return this.set_rx_field("full_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "add_time");
    this["set_add_time_field"] = function (json_option) { return this.set_rx_field("add_time", json_option); }    create_rx_get_and_set_property(this, "is_closed");
    this["set_is_closed_field"] = function (json_option) { return this.set_rx_field("is_closed", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "type_name");
    this["set_type_name_field"] = function (json_option) { return this.set_rx_field("type_name", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "web_user_name");
    this["set_web_user_name_field"] = function (json_option) { return this.set_rx_field("web_user_name", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "category_name");
    this["set_category_name_field"] = function (json_option) { return this.set_rx_field("category_name", json_option); }    create_rx_get_and_set_property(this, "root_category_id");
    this["set_root_category_id_field"] = function (json_option) { return this.set_rx_field("root_category_id", json_option); }    create_rx_get_and_set_property(this, "root_category_name");
    this["set_root_category_name_field"] = function (json_option) { return this.set_rx_field("root_category_name", json_option); }    create_rx_get_and_set_property(this, "course_comment_count");
    this["set_course_comment_count_field"] = function (json_option) { return this.set_rx_field("course_comment_count", json_option); }    create_rx_get_and_set_property(this, "course_comment_score");
    this["set_course_comment_score_field"] = function (json_option) { return this.set_rx_field("course_comment_score", json_option); }    create_rx_get_and_set_property(this, "assort_id");
    this["set_assort_id_field"] = function (json_option) { return this.set_rx_field("assort_id", json_option); }    create_rx_get_and_set_property(this, "assort_name");
    this["set_assort_name_field"] = function (json_option) { return this.set_rx_field("assort_name", json_option); }    create_rx_get_and_set_property(this, "total_reg");
    this["set_total_reg_field"] = function (json_option) { return this.set_rx_field("total_reg", json_option); }    create_rx_get_and_set_property(this, "dirctory_count");
    this["set_dirctory_count_field"] = function (json_option) { return this.set_rx_field("dirctory_count", json_option); }    create_rx_get_and_set_property(this, "root_dirctory_count");
    this["set_root_dirctory_count_field"] = function (json_option) { return this.set_rx_field("root_dirctory_count", json_option); }    create_rx_get_and_set_property(this, "search_attr_list");
    this["set_search_attr_list_field"] = function (json_option) { return this.set_rx_field("search_attr_list", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_info_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_info_list[key] = rx_view.static_method[key]; } v_course_info_list.view_first_column = "id"; view_first_columns['v_course_info_list'] = 'id'; })();function v_course_info_list_index(instance_json) {
    rx_view.call(this, "v_course_info_list_index", instance_json);    create_rx_get_and_set_property(this, "course_info_id");
    this["set_course_info_id_field"] = function (json_option) { return this.set_rx_field("course_info_id", json_option); }    create_rx_get_and_set_property(this, "search_attr_list");
    this["set_search_attr_list_field"] = function (json_option) { return this.set_rx_field("search_attr_list", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "TeacherName");
    this["set_TeacherName_field"] = function (json_option) { return this.set_rx_field("TeacherName", json_option); }    create_rx_get_and_set_property(this, "CommentCount");
    this["set_CommentCount_field"] = function (json_option) { return this.set_rx_field("CommentCount", json_option); }    create_rx_get_and_set_property(this, "UserCount");
    this["set_UserCount_field"] = function (json_option) { return this.set_rx_field("UserCount", json_option); }    create_rx_get_and_set_property(this, "BookChapter");
    this["set_BookChapter_field"] = function (json_option) { return this.set_rx_field("BookChapter", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_info_list_index.prototype = new Super(); for (var key in rx_view.static_method) { v_course_info_list_index[key] = rx_view.static_method[key]; } v_course_info_list_index.view_first_column = "course_info_id"; view_first_columns['v_course_info_list_index'] = 'course_info_id'; })();function v_course_info_package_details(instance_json) {
    rx_view.call(this, "v_course_info_package_details", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "full_description");
    this["set_full_description_field"] = function (json_option) { return this.set_rx_field("full_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "add_time");
    this["set_add_time_field"] = function (json_option) { return this.set_rx_field("add_time", json_option); }    create_rx_get_and_set_property(this, "is_closed");
    this["set_is_closed_field"] = function (json_option) { return this.set_rx_field("is_closed", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "search_attr_list");
    this["set_search_attr_list_field"] = function (json_option) { return this.set_rx_field("search_attr_list", json_option); }    create_rx_get_and_set_property(this, "assort_id");
    this["set_assort_id_field"] = function (json_option) { return this.set_rx_field("assort_id", json_option); }    create_rx_get_and_set_property(this, "course_code");
    this["set_course_code_field"] = function (json_option) { return this.set_rx_field("course_code", json_option); }    create_rx_get_and_set_property(this, "TeacherName");
    this["set_TeacherName_field"] = function (json_option) { return this.set_rx_field("TeacherName", json_option); }    create_rx_get_and_set_property(this, "BookChapter");
    this["set_BookChapter_field"] = function (json_option) { return this.set_rx_field("BookChapter", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_info_package_details.prototype = new Super(); for (var key in rx_view.static_method) { v_course_info_package_details[key] = rx_view.static_method[key]; } v_course_info_package_details.view_first_column = "id"; view_first_columns['v_course_info_package_details'] = 'id'; })();function v_course_info_show_competitive_default(instance_json) {
    rx_view.call(this, "v_course_info_show_competitive_default", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_info_id");
    this["set_course_info_id_field"] = function (json_option) { return this.set_rx_field("course_info_id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "TeacherName");
    this["set_TeacherName_field"] = function (json_option) { return this.set_rx_field("TeacherName", json_option); }    create_rx_get_and_set_property(this, "CommentCount");
    this["set_CommentCount_field"] = function (json_option) { return this.set_rx_field("CommentCount", json_option); }    create_rx_get_and_set_property(this, "UserCount");
    this["set_UserCount_field"] = function (json_option) { return this.set_rx_field("UserCount", json_option); }    create_rx_get_and_set_property(this, "BookChapter");
    this["set_BookChapter_field"] = function (json_option) { return this.set_rx_field("BookChapter", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_info_show_competitive_default.prototype = new Super(); for (var key in rx_view.static_method) { v_course_info_show_competitive_default[key] = rx_view.static_method[key]; } v_course_info_show_competitive_default.view_first_column = "id"; view_first_columns['v_course_info_show_competitive_default'] = 'id'; })();function v_course_info_show_default(instance_json) {
    rx_view.call(this, "v_course_info_show_default", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }    create_rx_get_and_set_property(this, "course_info_id");
    this["set_course_info_id_field"] = function (json_option) { return this.set_rx_field("course_info_id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "TeacherName");
    this["set_TeacherName_field"] = function (json_option) { return this.set_rx_field("TeacherName", json_option); }    create_rx_get_and_set_property(this, "CommentCount");
    this["set_CommentCount_field"] = function (json_option) { return this.set_rx_field("CommentCount", json_option); }    create_rx_get_and_set_property(this, "UserCount");
    this["set_UserCount_field"] = function (json_option) { return this.set_rx_field("UserCount", json_option); }    create_rx_get_and_set_property(this, "BookChapter");
    this["set_BookChapter_field"] = function (json_option) { return this.set_rx_field("BookChapter", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_info_show_default.prototype = new Super(); for (var key in rx_view.static_method) { v_course_info_show_default[key] = rx_view.static_method[key]; } v_course_info_show_default.view_first_column = "id"; view_first_columns['v_course_info_show_default'] = 'id'; })();function v_course_info_show_details(instance_json) {
    rx_view.call(this, "v_course_info_show_details", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "full_description");
    this["set_full_description_field"] = function (json_option) { return this.set_rx_field("full_description", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "TeacherName");
    this["set_TeacherName_field"] = function (json_option) { return this.set_rx_field("TeacherName", json_option); }    create_rx_get_and_set_property(this, "short_info");
    this["set_short_info_field"] = function (json_option) { return this.set_rx_field("short_info", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "UserCount");
    this["set_UserCount_field"] = function (json_option) { return this.set_rx_field("UserCount", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_info_show_details.prototype = new Super(); for (var key in rx_view.static_method) { v_course_info_show_details[key] = rx_view.static_method[key]; } v_course_info_show_details.view_first_column = "id"; view_first_columns['v_course_info_show_details'] = 'id'; })();function v_course_info_statistic(instance_json) {
    rx_view.call(this, "v_course_info_statistic", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "category_name");
    this["set_category_name_field"] = function (json_option) { return this.set_rx_field("category_name", json_option); }    create_rx_get_and_set_property(this, "section");
    this["set_section_field"] = function (json_option) { return this.set_rx_field("section", json_option); }    create_rx_get_and_set_property(this, "kts");
    this["set_kts_field"] = function (json_option) { return this.set_rx_field("kts", json_option); }    create_rx_get_and_set_property(this, "evaluating_count");
    this["set_evaluating_count_field"] = function (json_option) { return this.set_rx_field("evaluating_count", json_option); }    create_rx_get_and_set_property(this, "video_count");
    this["set_video_count_field"] = function (json_option) { return this.set_rx_field("video_count", json_option); }    create_rx_get_and_set_property(this, "audio_count");
    this["set_audio_count_field"] = function (json_option) { return this.set_rx_field("audio_count", json_option); }    create_rx_get_and_set_property(this, "talk_count");
    this["set_talk_count_field"] = function (json_option) { return this.set_rx_field("talk_count", json_option); }    create_rx_get_and_set_property(this, "course_user_count");
    this["set_course_user_count_field"] = function (json_option) { return this.set_rx_field("course_user_count", json_option); }    create_rx_get_and_set_property(this, "organize_count");
    this["set_organize_count_field"] = function (json_option) { return this.set_rx_field("organize_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_info_statistic.prototype = new Super(); for (var key in rx_view.static_method) { v_course_info_statistic[key] = rx_view.static_method[key]; } v_course_info_statistic.view_first_column = "id"; view_first_columns['v_course_info_statistic'] = 'id'; })();function v_course_package_details(instance_json) {
    rx_view.call(this, "v_course_package_details", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "img");
    this["set_img_field"] = function (json_option) { return this.set_rx_field("img", json_option); }    create_rx_get_and_set_property(this, "description");
    this["set_description_field"] = function (json_option) { return this.set_rx_field("description", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "short_desc");
    this["set_short_desc_field"] = function (json_option) { return this.set_rx_field("short_desc", json_option); }    create_rx_get_and_set_property(this, "study_target");
    this["set_study_target_field"] = function (json_option) { return this.set_rx_field("study_target", json_option); }    create_rx_get_and_set_property(this, "job");
    this["set_job_field"] = function (json_option) { return this.set_rx_field("job", json_option); }    create_rx_get_and_set_property(this, "display_price");
    this["set_display_price_field"] = function (json_option) { return this.set_rx_field("display_price", json_option); }    create_rx_get_and_set_property(this, "course_id_list");
    this["set_course_id_list_field"] = function (json_option) { return this.set_rx_field("course_id_list", json_option); }    create_rx_get_and_set_property(this, "search_attr_list");
    this["set_search_attr_list_field"] = function (json_option) { return this.set_rx_field("search_attr_list", json_option); }    create_rx_get_and_set_property(this, "actual_price");
    this["set_actual_price_field"] = function (json_option) { return this.set_rx_field("actual_price", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_package_details.prototype = new Super(); for (var key in rx_view.static_method) { v_course_package_details[key] = rx_view.static_method[key]; } v_course_package_details.view_first_column = "id"; view_first_columns['v_course_package_details'] = 'id'; })();function v_course_package_list(instance_json) {
    rx_view.call(this, "v_course_package_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "img");
    this["set_img_field"] = function (json_option) { return this.set_rx_field("img", json_option); }    create_rx_get_and_set_property(this, "description");
    this["set_description_field"] = function (json_option) { return this.set_rx_field("description", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "short_desc");
    this["set_short_desc_field"] = function (json_option) { return this.set_rx_field("short_desc", json_option); }    create_rx_get_and_set_property(this, "study_target");
    this["set_study_target_field"] = function (json_option) { return this.set_rx_field("study_target", json_option); }    create_rx_get_and_set_property(this, "job");
    this["set_job_field"] = function (json_option) { return this.set_rx_field("job", json_option); }    create_rx_get_and_set_property(this, "display_price");
    this["set_display_price_field"] = function (json_option) { return this.set_rx_field("display_price", json_option); }    create_rx_get_and_set_property(this, "course_id_list");
    this["set_course_id_list_field"] = function (json_option) { return this.set_rx_field("course_id_list", json_option); }    create_rx_get_and_set_property(this, "search_attr_list");
    this["set_search_attr_list_field"] = function (json_option) { return this.set_rx_field("search_attr_list", json_option); }    create_rx_get_and_set_property(this, "price_count");
    this["set_price_count_field"] = function (json_option) { return this.set_rx_field("price_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_package_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_package_list[key] = rx_view.static_method[key]; } v_course_package_list.view_first_column = "id"; view_first_columns['v_course_package_list'] = 'id'; })();function v_course_package_show(instance_json) {
    rx_view.call(this, "v_course_package_show", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "short_desc");
    this["set_short_desc_field"] = function (json_option) { return this.set_rx_field("short_desc", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_package_show.prototype = new Super(); for (var key in rx_view.static_method) { v_course_package_show[key] = rx_view.static_method[key]; } v_course_package_show.view_first_column = "id"; view_first_columns['v_course_package_show'] = 'id'; })();function v_course_package_show_default(instance_json) {
    rx_view.call(this, "v_course_package_show_default", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }    create_rx_get_and_set_property(this, "course_package_Id");
    this["set_course_package_Id_field"] = function (json_option) { return this.set_rx_field("course_package_Id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "display_price");
    this["set_display_price_field"] = function (json_option) { return this.set_rx_field("display_price", json_option); }    create_rx_get_and_set_property(this, "img");
    this["set_img_field"] = function (json_option) { return this.set_rx_field("img", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_package_show_default.prototype = new Super(); for (var key in rx_view.static_method) { v_course_package_show_default[key] = rx_view.static_method[key]; } v_course_package_show_default.view_first_column = "id"; view_first_columns['v_course_package_show_default'] = 'id'; })();function v_course_package_show_default_valueadded(instance_json) {
    rx_view.call(this, "v_course_package_show_default_valueadded", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "display_price");
    this["set_display_price_field"] = function (json_option) { return this.set_rx_field("display_price", json_option); }    create_rx_get_and_set_property(this, "img");
    this["set_img_field"] = function (json_option) { return this.set_rx_field("img", json_option); }    create_rx_get_and_set_property(this, "course_package_Id");
    this["set_course_package_Id_field"] = function (json_option) { return this.set_rx_field("course_package_Id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_package_show_default_valueadded.prototype = new Super(); for (var key in rx_view.static_method) { v_course_package_show_default_valueadded[key] = rx_view.static_method[key]; } v_course_package_show_default_valueadded.view_first_column = "id"; view_first_columns['v_course_package_show_default_valueadded'] = 'id'; })();function v_course_package_show_valueadded(instance_json) {
    rx_view.call(this, "v_course_package_show_valueadded", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "short_desc");
    this["set_short_desc_field"] = function (json_option) { return this.set_rx_field("short_desc", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_package_show_valueadded.prototype = new Super(); for (var key in rx_view.static_method) { v_course_package_show_valueadded[key] = rx_view.static_method[key]; } v_course_package_show_valueadded.view_first_column = "id"; view_first_columns['v_course_package_show_valueadded'] = 'id'; })();function v_course_registration_list(instance_json) {
    rx_view.call(this, "v_course_registration_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id_list");
    this["set_course_id_list_field"] = function (json_option) { return this.set_rx_field("course_id_list", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "reg_time");
    this["set_reg_time_field"] = function (json_option) { return this.set_rx_field("reg_time", json_option); }    create_rx_get_and_set_property(this, "state");
    this["set_state_field"] = function (json_option) { return this.set_rx_field("state", json_option); }    create_rx_get_and_set_property(this, "deny_desc");
    this["set_deny_desc_field"] = function (json_option) { return this.set_rx_field("deny_desc", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "gender");
    this["set_gender_field"] = function (json_option) { return this.set_rx_field("gender", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "idcard");
    this["set_idcard_field"] = function (json_option) { return this.set_rx_field("idcard", json_option); }    create_rx_get_and_set_property(this, "mobile");
    this["set_mobile_field"] = function (json_option) { return this.set_rx_field("mobile", json_option); }    create_rx_get_and_set_property(this, "login_name");
    this["set_login_name_field"] = function (json_option) { return this.set_rx_field("login_name", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_registration_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_registration_list[key] = rx_view.static_method[key]; } v_course_registration_list.view_first_column = "id"; view_first_columns['v_course_registration_list'] = 'id'; })();function v_course_talk_back_content(instance_json) {
    rx_view.call(this, "v_course_talk_back_content", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "is_back");
    this["set_is_back_field"] = function (json_option) { return this.set_rx_field("is_back", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "parent_web_user_id");
    this["set_parent_web_user_id_field"] = function (json_option) { return this.set_rx_field("parent_web_user_id", json_option); }    create_rx_get_and_set_property(this, "parent_user_nick_name");
    this["set_parent_user_nick_name_field"] = function (json_option) { return this.set_rx_field("parent_user_nick_name", json_option); }    create_rx_get_and_set_property(this, "parent_user_type");
    this["set_parent_user_type_field"] = function (json_option) { return this.set_rx_field("parent_user_type", json_option); }    create_rx_get_and_set_property(this, "parent_organize_name");
    this["set_parent_organize_name_field"] = function (json_option) { return this.set_rx_field("parent_organize_name", json_option); }    create_rx_get_and_set_property(this, "root_id");
    this["set_root_id_field"] = function (json_option) { return this.set_rx_field("root_id", json_option); }    create_rx_get_and_set_property(this, "is_top");
    this["set_is_top_field"] = function (json_option) { return this.set_rx_field("is_top", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "thumbs_count");
    this["set_thumbs_count_field"] = function (json_option) { return this.set_rx_field("thumbs_count", json_option); }    create_rx_get_and_set_property(this, "talk_count");
    this["set_talk_count_field"] = function (json_option) { return this.set_rx_field("talk_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_talk_back_content.prototype = new Super(); for (var key in rx_view.static_method) { v_course_talk_back_content[key] = rx_view.static_method[key]; } v_course_talk_back_content.view_first_column = "id"; view_first_columns['v_course_talk_back_content'] = 'id'; })();function v_course_talk_back_content_list(instance_json) {
    rx_view.call(this, "v_course_talk_back_content_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "img_url_list");
    this["set_img_url_list_field"] = function (json_option) { return this.set_rx_field("img_url_list", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "is_back");
    this["set_is_back_field"] = function (json_option) { return this.set_rx_field("is_back", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "parent_web_user_id");
    this["set_parent_web_user_id_field"] = function (json_option) { return this.set_rx_field("parent_web_user_id", json_option); }    create_rx_get_and_set_property(this, "parent_user_nick_name");
    this["set_parent_user_nick_name_field"] = function (json_option) { return this.set_rx_field("parent_user_nick_name", json_option); }    create_rx_get_and_set_property(this, "parent_user_type");
    this["set_parent_user_type_field"] = function (json_option) { return this.set_rx_field("parent_user_type", json_option); }    create_rx_get_and_set_property(this, "parent_organize_name");
    this["set_parent_organize_name_field"] = function (json_option) { return this.set_rx_field("parent_organize_name", json_option); }    create_rx_get_and_set_property(this, "root_id");
    this["set_root_id_field"] = function (json_option) { return this.set_rx_field("root_id", json_option); }    create_rx_get_and_set_property(this, "is_top");
    this["set_is_top_field"] = function (json_option) { return this.set_rx_field("is_top", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "thumbs_count");
    this["set_thumbs_count_field"] = function (json_option) { return this.set_rx_field("thumbs_count", json_option); }    create_rx_get_and_set_property(this, "talk_count");
    this["set_talk_count_field"] = function (json_option) { return this.set_rx_field("talk_count", json_option); }    create_rx_get_and_set_property(this, "parent_content");
    this["set_parent_content_field"] = function (json_option) { return this.set_rx_field("parent_content", json_option); }    create_rx_get_and_set_property(this, "mobile_parent_content");
    this["set_mobile_parent_content_field"] = function (json_option) { return this.set_rx_field("mobile_parent_content", json_option); }    create_rx_get_and_set_property(this, "parent_img_url_list");
    this["set_parent_img_url_list_field"] = function (json_option) { return this.set_rx_field("parent_img_url_list", json_option); }    create_rx_get_and_set_property(this, "grade");
    this["set_grade_field"] = function (json_option) { return this.set_rx_field("grade", json_option); }    create_rx_get_and_set_property(this, "grade_icon");
    this["set_grade_icon_field"] = function (json_option) { return this.set_rx_field("grade_icon", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_talk_back_content_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_talk_back_content_list[key] = rx_view.static_method[key]; } v_course_talk_back_content_list.view_first_column = "id"; view_first_columns['v_course_talk_back_content_list'] = 'id'; })();function v_course_talk_back_content_list_v2(instance_json) {
    rx_view.call(this, "v_course_talk_back_content_list_v2", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "img_url_list");
    this["set_img_url_list_field"] = function (json_option) { return this.set_rx_field("img_url_list", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "is_back");
    this["set_is_back_field"] = function (json_option) { return this.set_rx_field("is_back", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "parent_web_user_id");
    this["set_parent_web_user_id_field"] = function (json_option) { return this.set_rx_field("parent_web_user_id", json_option); }    create_rx_get_and_set_property(this, "parent_user_nick_name");
    this["set_parent_user_nick_name_field"] = function (json_option) { return this.set_rx_field("parent_user_nick_name", json_option); }    create_rx_get_and_set_property(this, "parent_user_type");
    this["set_parent_user_type_field"] = function (json_option) { return this.set_rx_field("parent_user_type", json_option); }    create_rx_get_and_set_property(this, "parent_organize_name");
    this["set_parent_organize_name_field"] = function (json_option) { return this.set_rx_field("parent_organize_name", json_option); }    create_rx_get_and_set_property(this, "root_id");
    this["set_root_id_field"] = function (json_option) { return this.set_rx_field("root_id", json_option); }    create_rx_get_and_set_property(this, "is_top");
    this["set_is_top_field"] = function (json_option) { return this.set_rx_field("is_top", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "thumbs_count");
    this["set_thumbs_count_field"] = function (json_option) { return this.set_rx_field("thumbs_count", json_option); }    create_rx_get_and_set_property(this, "talk_count");
    this["set_talk_count_field"] = function (json_option) { return this.set_rx_field("talk_count", json_option); }    create_rx_get_and_set_property(this, "grade");
    this["set_grade_field"] = function (json_option) { return this.set_rx_field("grade", json_option); }    create_rx_get_and_set_property(this, "grade_color");
    this["set_grade_color_field"] = function (json_option) { return this.set_rx_field("grade_color", json_option); }    create_rx_get_and_set_property(this, "grade_icon");
    this["set_grade_icon_field"] = function (json_option) { return this.set_rx_field("grade_icon", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_talk_back_content_list_v2.prototype = new Super(); for (var key in rx_view.static_method) { v_course_talk_back_content_list_v2[key] = rx_view.static_method[key]; } v_course_talk_back_content_list_v2.view_first_column = "id"; view_first_columns['v_course_talk_back_content_list_v2'] = 'id'; })();function v_course_talk_list(instance_json) {
    rx_view.call(this, "v_course_talk_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "img_url_list");
    this["set_img_url_list_field"] = function (json_option) { return this.set_rx_field("img_url_list", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "is_back");
    this["set_is_back_field"] = function (json_option) { return this.set_rx_field("is_back", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "root_id");
    this["set_root_id_field"] = function (json_option) { return this.set_rx_field("root_id", json_option); }    create_rx_get_and_set_property(this, "is_top");
    this["set_is_top_field"] = function (json_option) { return this.set_rx_field("is_top", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "thumbs_count");
    this["set_thumbs_count_field"] = function (json_option) { return this.set_rx_field("thumbs_count", json_option); }    create_rx_get_and_set_property(this, "talk_count");
    this["set_talk_count_field"] = function (json_option) { return this.set_rx_field("talk_count", json_option); }    create_rx_get_and_set_property(this, "grade");
    this["set_grade_field"] = function (json_option) { return this.set_rx_field("grade", json_option); }    create_rx_get_and_set_property(this, "grade_icon");
    this["set_grade_icon_field"] = function (json_option) { return this.set_rx_field("grade_icon", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_talk_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_talk_list[key] = rx_view.static_method[key]; } v_course_talk_list.view_first_column = "id"; view_first_columns['v_course_talk_list'] = 'id'; })();function v_course_talk_list_v2(instance_json) {
    rx_view.call(this, "v_course_talk_list_v2", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "img_url_list");
    this["set_img_url_list_field"] = function (json_option) { return this.set_rx_field("img_url_list", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "is_back");
    this["set_is_back_field"] = function (json_option) { return this.set_rx_field("is_back", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "root_id");
    this["set_root_id_field"] = function (json_option) { return this.set_rx_field("root_id", json_option); }    create_rx_get_and_set_property(this, "is_top");
    this["set_is_top_field"] = function (json_option) { return this.set_rx_field("is_top", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "user_type_name");
    this["set_user_type_name_field"] = function (json_option) { return this.set_rx_field("user_type_name", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "thumbs_count");
    this["set_thumbs_count_field"] = function (json_option) { return this.set_rx_field("thumbs_count", json_option); }    create_rx_get_and_set_property(this, "talk_count");
    this["set_talk_count_field"] = function (json_option) { return this.set_rx_field("talk_count", json_option); }    create_rx_get_and_set_property(this, "grade");
    this["set_grade_field"] = function (json_option) { return this.set_rx_field("grade", json_option); }    create_rx_get_and_set_property(this, "grade_color");
    this["set_grade_color_field"] = function (json_option) { return this.set_rx_field("grade_color", json_option); }    create_rx_get_and_set_property(this, "grade_icon");
    this["set_grade_icon_field"] = function (json_option) { return this.set_rx_field("grade_icon", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_talk_list_v2.prototype = new Super(); for (var key in rx_view.static_method) { v_course_talk_list_v2[key] = rx_view.static_method[key]; } v_course_talk_list_v2.view_first_column = "id"; view_first_columns['v_course_talk_list_v2'] = 'id'; })();function v_course_user_info(instance_json) {
    rx_view.call(this, "v_course_user_info", instance_json);    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "total_reg");
    this["set_total_reg_field"] = function (json_option) { return this.set_rx_field("total_reg", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "add_time");
    this["set_add_time_field"] = function (json_option) { return this.set_rx_field("add_time", json_option); }    create_rx_get_and_set_property(this, "is_closed");
    this["set_is_closed_field"] = function (json_option) { return this.set_rx_field("is_closed", json_option); }    create_rx_get_and_set_property(this, "web_user_name");
    this["set_web_user_name_field"] = function (json_option) { return this.set_rx_field("web_user_name", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "category_name");
    this["set_category_name_field"] = function (json_option) { return this.set_rx_field("category_name", json_option); }    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "open_time");
    this["set_open_time_field"] = function (json_option) { return this.set_rx_field("open_time", json_option); }    create_rx_get_and_set_property(this, "open_type");
    this["set_open_type_field"] = function (json_option) { return this.set_rx_field("open_type", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_user_info.prototype = new Super(); for (var key in rx_view.static_method) { v_course_user_info[key] = rx_view.static_method[key]; } v_course_user_info.view_first_column = "name"; view_first_columns['v_course_user_info'] = 'name'; })();function v_course_user_list(instance_json) {
    rx_view.call(this, "v_course_user_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "login_name");
    this["set_login_name_field"] = function (json_option) { return this.set_rx_field("login_name", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "student_num");
    this["set_student_num_field"] = function (json_option) { return this.set_rx_field("student_num", json_option); }    create_rx_get_and_set_property(this, "gender");
    this["set_gender_field"] = function (json_option) { return this.set_rx_field("gender", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "idcard");
    this["set_idcard_field"] = function (json_option) { return this.set_rx_field("idcard", json_option); }    create_rx_get_and_set_property(this, "mobile");
    this["set_mobile_field"] = function (json_option) { return this.set_rx_field("mobile", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "current_integral");
    this["set_current_integral_field"] = function (json_option) { return this.set_rx_field("current_integral", json_option); }    create_rx_get_and_set_property(this, "total_integral");
    this["set_total_integral_field"] = function (json_option) { return this.set_rx_field("total_integral", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "course_count");
    this["set_course_count_field"] = function (json_option) { return this.set_rx_field("course_count", json_option); }    create_rx_get_and_set_property(this, "course_id_list");
    this["set_course_id_list_field"] = function (json_option) { return this.set_rx_field("course_id_list", json_option); }    create_rx_get_and_set_property(this, "grade");
    this["set_grade_field"] = function (json_option) { return this.set_rx_field("grade", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_user_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_user_list[key] = rx_view.static_method[key]; } v_course_user_list.view_first_column = "id"; view_first_columns['v_course_user_list'] = 'id'; })();function v_entry_organize_examine_list(instance_json) {
    rx_view.call(this, "v_entry_organize_examine_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "student_num");
    this["set_student_num_field"] = function (json_option) { return this.set_rx_field("student_num", json_option); }    create_rx_get_and_set_property(this, "invitation_code");
    this["set_invitation_code_field"] = function (json_option) { return this.set_rx_field("invitation_code", json_option); }    create_rx_get_and_set_property(this, "create_date");
    this["set_create_date_field"] = function (json_option) { return this.set_rx_field("create_date", json_option); }    create_rx_get_and_set_property(this, "node");
    this["set_node_field"] = function (json_option) { return this.set_rx_field("node", json_option); }    create_rx_get_and_set_property(this, "state");
    this["set_state_field"] = function (json_option) { return this.set_rx_field("state", json_option); }    create_rx_get_and_set_property(this, "professional_id");
    this["set_professional_id_field"] = function (json_option) { return this.set_rx_field("professional_id", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_entry_organize_examine_list.prototype = new Super(); for (var key in rx_view.static_method) { v_entry_organize_examine_list[key] = rx_view.static_method[key]; } v_entry_organize_examine_list.view_first_column = "id"; view_first_columns['v_entry_organize_examine_list'] = 'id'; })();function v_example_evaluating_result_list(instance_json) {
    rx_view.call(this, "v_example_evaluating_result_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "example_id");
    this["set_example_id_field"] = function (json_option) { return this.set_rx_field("example_id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "teacher_type");
    this["set_teacher_type_field"] = function (json_option) { return this.set_rx_field("teacher_type", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "user_id_list");
    this["set_user_id_list_field"] = function (json_option) { return this.set_rx_field("user_id_list", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "is_pass");
    this["set_is_pass_field"] = function (json_option) { return this.set_rx_field("is_pass", json_option); }    create_rx_get_and_set_property(this, "is_pass_name");
    this["set_is_pass_name_field"] = function (json_option) { return this.set_rx_field("is_pass_name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_example_evaluating_result_list.prototype = new Super(); for (var key in rx_view.static_method) { v_example_evaluating_result_list[key] = rx_view.static_method[key]; } v_example_evaluating_result_list.view_first_column = "id"; view_first_columns['v_example_evaluating_result_list'] = 'id'; })();function v_example_result_list(instance_json) {
    rx_view.call(this, "v_example_result_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "is_pass");
    this["set_is_pass_field"] = function (json_option) { return this.set_rx_field("is_pass", json_option); }    create_rx_get_and_set_property(this, "pass_score");
    this["set_pass_score_field"] = function (json_option) { return this.set_rx_field("pass_score", json_option); }    create_rx_get_and_set_property(this, "example_id");
    this["set_example_id_field"] = function (json_option) { return this.set_rx_field("example_id", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "submit_date");
    this["set_submit_date_field"] = function (json_option) { return this.set_rx_field("submit_date", json_option); }    create_rx_get_and_set_property(this, "check_count");
    this["set_check_count_field"] = function (json_option) { return this.set_rx_field("check_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_example_result_list.prototype = new Super(); for (var key in rx_view.static_method) { v_example_result_list[key] = rx_view.static_method[key]; } v_example_result_list.view_first_column = "id"; view_first_columns['v_example_result_list'] = 'id'; })();function v_example_subject_list(instance_json) {
    rx_view.call(this, "v_example_subject_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "example_id");
    this["set_example_id_field"] = function (json_option) { return this.set_rx_field("example_id", json_option); }    create_rx_get_and_set_property(this, "subject_type");
    this["set_subject_type_field"] = function (json_option) { return this.set_rx_field("subject_type", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "answer_list");
    this["set_answer_list_field"] = function (json_option) { return this.set_rx_field("answer_list", json_option); }    create_rx_get_and_set_property(this, "item_list");
    this["set_item_list_field"] = function (json_option) { return this.set_rx_field("item_list", json_option); }    create_rx_get_and_set_property(this, "latitude_id");
    this["set_latitude_id_field"] = function (json_option) { return this.set_rx_field("latitude_id", json_option); }    create_rx_get_and_set_property(this, "latitude_name");
    this["set_latitude_name_field"] = function (json_option) { return this.set_rx_field("latitude_name", json_option); }    create_rx_get_and_set_property(this, "is_order");
    this["set_is_order_field"] = function (json_option) { return this.set_rx_field("is_order", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_example_subject_list.prototype = new Super(); for (var key in rx_view.static_method) { v_example_subject_list[key] = rx_view.static_method[key]; } v_example_subject_list.view_first_column = "id"; view_first_columns['v_example_subject_list'] = 'id'; })();function v_get_audio_statistic_nums(instance_json) {
    rx_view.call(this, "v_get_audio_statistic_nums", instance_json);    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "nums");
    this["set_nums_field"] = function (json_option) { return this.set_rx_field("nums", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_get_audio_statistic_nums.prototype = new Super(); for (var key in rx_view.static_method) { v_get_audio_statistic_nums[key] = rx_view.static_method[key]; } v_get_audio_statistic_nums.view_first_column = "course_id"; view_first_columns['v_get_audio_statistic_nums'] = 'course_id'; })();function v_get_watch_statistic_nums(instance_json) {
    rx_view.call(this, "v_get_watch_statistic_nums", instance_json);    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "nums");
    this["set_nums_field"] = function (json_option) { return this.set_rx_field("nums", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_get_watch_statistic_nums.prototype = new Super(); for (var key in rx_view.static_method) { v_get_watch_statistic_nums[key] = rx_view.static_method[key]; } v_get_watch_statistic_nums.view_first_column = "course_id"; view_first_columns['v_get_watch_statistic_nums'] = 'course_id'; })();function v_live_course_comment_list(instance_json) {
    rx_view.call(this, "v_live_course_comment_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "room_id");
    this["set_room_id_field"] = function (json_option) { return this.set_rx_field("room_id", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_live_course_comment_list.prototype = new Super(); for (var key in rx_view.static_method) { v_live_course_comment_list[key] = rx_view.static_method[key]; } v_live_course_comment_list.view_first_column = "id"; view_first_columns['v_live_course_comment_list'] = 'id'; })();function v_live_room_list(instance_json) {
    rx_view.call(this, "v_live_room_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "channel_id");
    this["set_channel_id_field"] = function (json_option) { return this.set_rx_field("channel_id", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "publisher");
    this["set_publisher_field"] = function (json_option) { return this.set_rx_field("publisher", json_option); }    create_rx_get_and_set_property(this, "channel_pass");
    this["set_channel_pass_field"] = function (json_option) { return this.set_rx_field("channel_pass", json_option); }    create_rx_get_and_set_property(this, "status");
    this["set_status_field"] = function (json_option) { return this.set_rx_field("status", json_option); }    create_rx_get_and_set_property(this, "display");
    this["set_display_field"] = function (json_option) { return this.set_rx_field("display", json_option); }    create_rx_get_and_set_property(this, "secret_key");
    this["set_secret_key_field"] = function (json_option) { return this.set_rx_field("secret_key", json_option); }    create_rx_get_and_set_property(this, "on_begin_second");
    this["set_on_begin_second_field"] = function (json_option) { return this.set_rx_field("on_begin_second", json_option); }    create_rx_get_and_set_property(this, "on_begin_time");
    this["set_on_begin_time_field"] = function (json_option) { return this.set_rx_field("on_begin_time", json_option); }    create_rx_get_and_set_property(this, "on_begin_week");
    this["set_on_begin_week_field"] = function (json_option) { return this.set_rx_field("on_begin_week", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "comment_count");
    this["set_comment_count_field"] = function (json_option) { return this.set_rx_field("comment_count", json_option); }    create_rx_get_and_set_property(this, "check_user_count");
    this["set_check_user_count_field"] = function (json_option) { return this.set_rx_field("check_user_count", json_option); }    create_rx_get_and_set_property(this, "is_in_live_time");
    this["set_is_in_live_time_field"] = function (json_option) { return this.set_rx_field("is_in_live_time", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_live_room_list.prototype = new Super(); for (var key in rx_view.static_method) { v_live_room_list[key] = rx_view.static_method[key]; } v_live_room_list.view_first_column = "id"; view_first_columns['v_live_room_list'] = 'id'; })();function v_live_timetable_list(instance_json) {
    rx_view.call(this, "v_live_timetable_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "channel_id");
    this["set_channel_id_field"] = function (json_option) { return this.set_rx_field("channel_id", json_option); }    create_rx_get_and_set_property(this, "channel_name");
    this["set_channel_name_field"] = function (json_option) { return this.set_rx_field("channel_name", json_option); }    create_rx_get_and_set_property(this, "live_room_id");
    this["set_live_room_id_field"] = function (json_option) { return this.set_rx_field("live_room_id", json_option); }    create_rx_get_and_set_property(this, "status");
    this["set_status_field"] = function (json_option) { return this.set_rx_field("status", json_option); }    create_rx_get_and_set_property(this, "channel_pass");
    this["set_channel_pass_field"] = function (json_option) { return this.set_rx_field("channel_pass", json_option); }    create_rx_get_and_set_property(this, "begin_time");
    this["set_begin_time_field"] = function (json_option) { return this.set_rx_field("begin_time", json_option); }    create_rx_get_and_set_property(this, "end_time");
    this["set_end_time_field"] = function (json_option) { return this.set_rx_field("end_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_live_timetable_list.prototype = new Super(); for (var key in rx_view.static_method) { v_live_timetable_list[key] = rx_view.static_method[key]; } v_live_timetable_list.view_first_column = "id"; view_first_columns['v_live_timetable_list'] = 'id'; })();function v_message_list(instance_json) {
    rx_view.call(this, "v_message_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "content");
    this["set_content_field"] = function (json_option) { return this.set_rx_field("content", json_option); }    create_rx_get_and_set_property(this, "short_content");
    this["set_short_content_field"] = function (json_option) { return this.set_rx_field("short_content", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "index_img");
    this["set_index_img_field"] = function (json_option) { return this.set_rx_field("index_img", json_option); }    create_rx_get_and_set_property(this, "message_type");
    this["set_message_type_field"] = function (json_option) { return this.set_rx_field("message_type", json_option); }    create_rx_get_and_set_property(this, "message_type_name");
    this["set_message_type_name_field"] = function (json_option) { return this.set_rx_field("message_type_name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_message_list.prototype = new Super(); for (var key in rx_view.static_method) { v_message_list[key] = rx_view.static_method[key]; } v_message_list.view_first_column = "id"; view_first_columns['v_message_list'] = 'id'; })();function v_moot_qrcode_list_audio(instance_json) {
    rx_view.call(this, "v_moot_qrcode_list_audio", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code_text");
    this["set_code_text_field"] = function (json_option) { return this.set_rx_field("code_text", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }    create_rx_get_and_set_property(this, "material_id");
    this["set_material_id_field"] = function (json_option) { return this.set_rx_field("material_id", json_option); }    create_rx_get_and_set_property(this, "material_name");
    this["set_material_name_field"] = function (json_option) { return this.set_rx_field("material_name", json_option); }    create_rx_get_and_set_property(this, "link_url");
    this["set_link_url_field"] = function (json_option) { return this.set_rx_field("link_url", json_option); }    create_rx_get_and_set_property(this, "logo_id");
    this["set_logo_id_field"] = function (json_option) { return this.set_rx_field("logo_id", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_moot_qrcode_list_audio.prototype = new Super(); for (var key in rx_view.static_method) { v_moot_qrcode_list_audio[key] = rx_view.static_method[key]; } v_moot_qrcode_list_audio.view_first_column = "id"; view_first_columns['v_moot_qrcode_list_audio'] = 'id'; })();function v_moot_qrcode_list_evaluating(instance_json) {
    rx_view.call(this, "v_moot_qrcode_list_evaluating", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code_text");
    this["set_code_text_field"] = function (json_option) { return this.set_rx_field("code_text", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }    create_rx_get_and_set_property(this, "material_id");
    this["set_material_id_field"] = function (json_option) { return this.set_rx_field("material_id", json_option); }    create_rx_get_and_set_property(this, "material_name");
    this["set_material_name_field"] = function (json_option) { return this.set_rx_field("material_name", json_option); }    create_rx_get_and_set_property(this, "link_url");
    this["set_link_url_field"] = function (json_option) { return this.set_rx_field("link_url", json_option); }    create_rx_get_and_set_property(this, "logo_id");
    this["set_logo_id_field"] = function (json_option) { return this.set_rx_field("logo_id", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_moot_qrcode_list_evaluating.prototype = new Super(); for (var key in rx_view.static_method) { v_moot_qrcode_list_evaluating[key] = rx_view.static_method[key]; } v_moot_qrcode_list_evaluating.view_first_column = "id"; view_first_columns['v_moot_qrcode_list_evaluating'] = 'id'; })();function v_moot_qrcode_list_video(instance_json) {
    rx_view.call(this, "v_moot_qrcode_list_video", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code_text");
    this["set_code_text_field"] = function (json_option) { return this.set_rx_field("code_text", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }    create_rx_get_and_set_property(this, "material_id");
    this["set_material_id_field"] = function (json_option) { return this.set_rx_field("material_id", json_option); }    create_rx_get_and_set_property(this, "material_name");
    this["set_material_name_field"] = function (json_option) { return this.set_rx_field("material_name", json_option); }    create_rx_get_and_set_property(this, "link_url");
    this["set_link_url_field"] = function (json_option) { return this.set_rx_field("link_url", json_option); }    create_rx_get_and_set_property(this, "logo_id");
    this["set_logo_id_field"] = function (json_option) { return this.set_rx_field("logo_id", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_moot_qrcode_list_video.prototype = new Super(); for (var key in rx_view.static_method) { v_moot_qrcode_list_video[key] = rx_view.static_method[key]; } v_moot_qrcode_list_video.view_first_column = "id"; view_first_columns['v_moot_qrcode_list_video'] = 'id'; })();function v_order_course_list(instance_json) {
    rx_view.call(this, "v_order_course_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "course_name");
    this["set_course_name_field"] = function (json_option) { return this.set_rx_field("course_name", json_option); }    create_rx_get_and_set_property(this, "order_num");
    this["set_order_num_field"] = function (json_option) { return this.set_rx_field("order_num", json_option); }    create_rx_get_and_set_property(this, "shop_name");
    this["set_shop_name_field"] = function (json_option) { return this.set_rx_field("shop_name", json_option); }    create_rx_get_and_set_property(this, "trade_price");
    this["set_trade_price_field"] = function (json_option) { return this.set_rx_field("trade_price", json_option); }    create_rx_get_and_set_property(this, "trade_time");
    this["set_trade_time_field"] = function (json_option) { return this.set_rx_field("trade_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "user_mobile");
    this["set_user_mobile_field"] = function (json_option) { return this.set_rx_field("user_mobile", json_option); }    create_rx_get_and_set_property(this, "order_state");
    this["set_order_state_field"] = function (json_option) { return this.set_rx_field("order_state", json_option); }    create_rx_get_and_set_property(this, "pay_method");
    this["set_pay_method_field"] = function (json_option) { return this.set_rx_field("pay_method", json_option); }    create_rx_get_and_set_property(this, "pay_time");
    this["set_pay_time_field"] = function (json_option) { return this.set_rx_field("pay_time", json_option); }    create_rx_get_and_set_property(this, "pay_trade_num");
    this["set_pay_trade_num_field"] = function (json_option) { return this.set_rx_field("pay_trade_num", json_option); }    create_rx_get_and_set_property(this, "pay_account");
    this["set_pay_account_field"] = function (json_option) { return this.set_rx_field("pay_account", json_option); }    create_rx_get_and_set_property(this, "web_user_name");
    this["set_web_user_name_field"] = function (json_option) { return this.set_rx_field("web_user_name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_order_course_list.prototype = new Super(); for (var key in rx_view.static_method) { v_order_course_list[key] = rx_view.static_method[key]; } v_order_course_list.view_first_column = "id"; view_first_columns['v_order_course_list'] = 'id'; })();function v_order_course_package_list(instance_json) {
    rx_view.call(this, "v_order_course_package_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "package_id");
    this["set_package_id_field"] = function (json_option) { return this.set_rx_field("package_id", json_option); }    create_rx_get_and_set_property(this, "course_package_name");
    this["set_course_package_name_field"] = function (json_option) { return this.set_rx_field("course_package_name", json_option); }    create_rx_get_and_set_property(this, "order_num");
    this["set_order_num_field"] = function (json_option) { return this.set_rx_field("order_num", json_option); }    create_rx_get_and_set_property(this, "shop_name");
    this["set_shop_name_field"] = function (json_option) { return this.set_rx_field("shop_name", json_option); }    create_rx_get_and_set_property(this, "trade_price");
    this["set_trade_price_field"] = function (json_option) { return this.set_rx_field("trade_price", json_option); }    create_rx_get_and_set_property(this, "trade_time");
    this["set_trade_time_field"] = function (json_option) { return this.set_rx_field("trade_time", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "user_mobile");
    this["set_user_mobile_field"] = function (json_option) { return this.set_rx_field("user_mobile", json_option); }    create_rx_get_and_set_property(this, "order_state");
    this["set_order_state_field"] = function (json_option) { return this.set_rx_field("order_state", json_option); }    create_rx_get_and_set_property(this, "pay_method");
    this["set_pay_method_field"] = function (json_option) { return this.set_rx_field("pay_method", json_option); }    create_rx_get_and_set_property(this, "pay_time");
    this["set_pay_time_field"] = function (json_option) { return this.set_rx_field("pay_time", json_option); }    create_rx_get_and_set_property(this, "pay_trade_num");
    this["set_pay_trade_num_field"] = function (json_option) { return this.set_rx_field("pay_trade_num", json_option); }    create_rx_get_and_set_property(this, "pay_account");
    this["set_pay_account_field"] = function (json_option) { return this.set_rx_field("pay_account", json_option); }    create_rx_get_and_set_property(this, "course_list");
    this["set_course_list_field"] = function (json_option) { return this.set_rx_field("course_list", json_option); }    create_rx_get_and_set_property(this, "web_user_name");
    this["set_web_user_name_field"] = function (json_option) { return this.set_rx_field("web_user_name", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_order_course_package_list.prototype = new Super(); for (var key in rx_view.static_method) { v_order_course_package_list[key] = rx_view.static_method[key]; } v_order_course_package_list.view_first_column = "id"; view_first_columns['v_order_course_package_list'] = 'id'; })();function v_order_product_list(instance_json) {
    rx_view.call(this, "v_order_product_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "product_id");
    this["set_product_id_field"] = function (json_option) { return this.set_rx_field("product_id", json_option); }    create_rx_get_and_set_property(this, "order_num");
    this["set_order_num_field"] = function (json_option) { return this.set_rx_field("order_num", json_option); }    create_rx_get_and_set_property(this, "f_product_name");
    this["set_f_product_name_field"] = function (json_option) { return this.set_rx_field("f_product_name", json_option); }    create_rx_get_and_set_property(this, "product_name");
    this["set_product_name_field"] = function (json_option) { return this.set_rx_field("product_name", json_option); }    create_rx_get_and_set_property(this, "spec_list");
    this["set_spec_list_field"] = function (json_option) { return this.set_rx_field("spec_list", json_option); }    create_rx_get_and_set_property(this, "trade_price");
    this["set_trade_price_field"] = function (json_option) { return this.set_rx_field("trade_price", json_option); }    create_rx_get_and_set_property(this, "trade_integral");
    this["set_trade_integral_field"] = function (json_option) { return this.set_rx_field("trade_integral", json_option); }    create_rx_get_and_set_property(this, "trade_time");
    this["set_trade_time_field"] = function (json_option) { return this.set_rx_field("trade_time", json_option); }    create_rx_get_and_set_property(this, "buy_number");
    this["set_buy_number_field"] = function (json_option) { return this.set_rx_field("buy_number", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "user_name");
    this["set_user_name_field"] = function (json_option) { return this.set_rx_field("user_name", json_option); }    create_rx_get_and_set_property(this, "web_user_name");
    this["set_web_user_name_field"] = function (json_option) { return this.set_rx_field("web_user_name", json_option); }    create_rx_get_and_set_property(this, "user_mobile");
    this["set_user_mobile_field"] = function (json_option) { return this.set_rx_field("user_mobile", json_option); }    create_rx_get_and_set_property(this, "order_state");
    this["set_order_state_field"] = function (json_option) { return this.set_rx_field("order_state", json_option); }    create_rx_get_and_set_property(this, "pay_method");
    this["set_pay_method_field"] = function (json_option) { return this.set_rx_field("pay_method", json_option); }    create_rx_get_and_set_property(this, "pay_time");
    this["set_pay_time_field"] = function (json_option) { return this.set_rx_field("pay_time", json_option); }    create_rx_get_and_set_property(this, "pay_trade_num");
    this["set_pay_trade_num_field"] = function (json_option) { return this.set_rx_field("pay_trade_num", json_option); }    create_rx_get_and_set_property(this, "pay_account");
    this["set_pay_account_field"] = function (json_option) { return this.set_rx_field("pay_account", json_option); }    create_rx_get_and_set_property(this, "receiver_name");
    this["set_receiver_name_field"] = function (json_option) { return this.set_rx_field("receiver_name", json_option); }    create_rx_get_and_set_property(this, "receiver_address");
    this["set_receiver_address_field"] = function (json_option) { return this.set_rx_field("receiver_address", json_option); }    create_rx_get_and_set_property(this, "receiver_mobile");
    this["set_receiver_mobile_field"] = function (json_option) { return this.set_rx_field("receiver_mobile", json_option); }    create_rx_get_and_set_property(this, "express");
    this["set_express_field"] = function (json_option) { return this.set_rx_field("express", json_option); }    create_rx_get_and_set_property(this, "express_num");
    this["set_express_num_field"] = function (json_option) { return this.set_rx_field("express_num", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_order_product_list.prototype = new Super(); for (var key in rx_view.static_method) { v_order_product_list[key] = rx_view.static_method[key]; } v_order_product_list.view_first_column = "id"; view_first_columns['v_order_product_list'] = 'id'; })();function v_play_log_distinct(instance_json) {
    rx_view.call(this, "v_play_log_distinct", instance_json);    create_rx_get_and_set_property(this, "playId");
    this["set_playId_field"] = function (json_option) { return this.set_rx_field("playId", json_option); }    create_rx_get_and_set_property(this, "videoId");
    this["set_videoId_field"] = function (json_option) { return this.set_rx_field("videoId", json_option); }    create_rx_get_and_set_property(this, "playDuration");
    this["set_playDuration_field"] = function (json_option) { return this.set_rx_field("playDuration", json_option); }    create_rx_get_and_set_property(this, "stayDuration");
    this["set_stayDuration_field"] = function (json_option) { return this.set_rx_field("stayDuration", json_option); }    create_rx_get_and_set_property(this, "currentTimes");
    this["set_currentTimes_field"] = function (json_option) { return this.set_rx_field("currentTimes", json_option); }    create_rx_get_and_set_property(this, "duration");
    this["set_duration_field"] = function (json_option) { return this.set_rx_field("duration", json_option); }    create_rx_get_and_set_property(this, "flowSize");
    this["set_flowSize_field"] = function (json_option) { return this.set_rx_field("flowSize", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "ipAddress");
    this["set_ipAddress_field"] = function (json_option) { return this.set_rx_field("ipAddress", json_option); }    create_rx_get_and_set_property(this, "country");
    this["set_country_field"] = function (json_option) { return this.set_rx_field("country", json_option); }    create_rx_get_and_set_property(this, "province");
    this["set_province_field"] = function (json_option) { return this.set_rx_field("province", json_option); }    create_rx_get_and_set_property(this, "city");
    this["set_city_field"] = function (json_option) { return this.set_rx_field("city", json_option); }    create_rx_get_and_set_property(this, "isp");
    this["set_isp_field"] = function (json_option) { return this.set_rx_field("isp", json_option); }    create_rx_get_and_set_property(this, "referer");
    this["set_referer_field"] = function (json_option) { return this.set_rx_field("referer", json_option); }    create_rx_get_and_set_property(this, "userAgent");
    this["set_userAgent_field"] = function (json_option) { return this.set_rx_field("userAgent", json_option); }    create_rx_get_and_set_property(this, "operatingSystem");
    this["set_operatingSystem_field"] = function (json_option) { return this.set_rx_field("operatingSystem", json_option); }    create_rx_get_and_set_property(this, "browser");
    this["set_browser_field"] = function (json_option) { return this.set_rx_field("browser", json_option); }    create_rx_get_and_set_property(this, "isMobile");
    this["set_isMobile_field"] = function (json_option) { return this.set_rx_field("isMobile", json_option); }    create_rx_get_and_set_property(this, "createdTime");
    this["set_createdTime_field"] = function (json_option) { return this.set_rx_field("createdTime", json_option); }    create_rx_get_and_set_property(this, "isComplete");
    this["set_isComplete_field"] = function (json_option) { return this.set_rx_field("isComplete", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_play_log_distinct.prototype = new Super(); for (var key in rx_view.static_method) { v_play_log_distinct[key] = rx_view.static_method[key]; } v_play_log_distinct.view_first_column = "playId"; view_first_columns['v_play_log_distinct'] = 'playId'; })();function v_play_log_progress(instance_json) {
    rx_view.call(this, "v_play_log_progress", instance_json);    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "videoId");
    this["set_videoId_field"] = function (json_option) { return this.set_rx_field("videoId", json_option); }    create_rx_get_and_set_property(this, "dirctory_id");
    this["set_dirctory_id_field"] = function (json_option) { return this.set_rx_field("dirctory_id", json_option); }    create_rx_get_and_set_property(this, "user_count");
    this["set_user_count_field"] = function (json_option) { return this.set_rx_field("user_count", json_option); }    create_rx_get_and_set_property(this, "complete_count");
    this["set_complete_count_field"] = function (json_option) { return this.set_rx_field("complete_count", json_option); }    create_rx_get_and_set_property(this, "progress");
    this["set_progress_field"] = function (json_option) { return this.set_rx_field("progress", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_play_log_progress.prototype = new Super(); for (var key in rx_view.static_method) { v_play_log_progress[key] = rx_view.static_method[key]; } v_play_log_progress.view_first_column = "class_id"; view_first_columns['v_play_log_progress'] = 'class_id'; })();function v_play_progress_detail(instance_json) {
    rx_view.call(this, "v_play_progress_detail", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "dirctory_id");
    this["set_dirctory_id_field"] = function (json_option) { return this.set_rx_field("dirctory_id", json_option); }    create_rx_get_and_set_property(this, "video_id");
    this["set_video_id_field"] = function (json_option) { return this.set_rx_field("video_id", json_option); }    create_rx_get_and_set_property(this, "minute");
    this["set_minute_field"] = function (json_option) { return this.set_rx_field("minute", json_option); }    create_rx_get_and_set_property(this, "ruminant");
    this["set_ruminant_field"] = function (json_option) { return this.set_rx_field("ruminant", json_option); }    create_rx_get_and_set_property(this, "isComplete");
    this["set_isComplete_field"] = function (json_option) { return this.set_rx_field("isComplete", json_option); }    create_rx_get_and_set_property(this, "isCompleteCount");
    this["set_isCompleteCount_field"] = function (json_option) { return this.set_rx_field("isCompleteCount", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_play_progress_detail.prototype = new Super(); for (var key in rx_view.static_method) { v_play_progress_detail[key] = rx_view.static_method[key]; } v_play_progress_detail.view_first_column = "id"; view_first_columns['v_play_progress_detail'] = 'id'; })();function v_popularity_course_info_default(instance_json) {
    rx_view.call(this, "v_popularity_course_info_default", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "sort_num");
    this["set_sort_num_field"] = function (json_option) { return this.set_rx_field("sort_num", json_option); }    create_rx_get_and_set_property(this, "course_info_id");
    this["set_course_info_id_field"] = function (json_option) { return this.set_rx_field("course_info_id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "TeacherName");
    this["set_TeacherName_field"] = function (json_option) { return this.set_rx_field("TeacherName", json_option); }    create_rx_get_and_set_property(this, "CommentCount");
    this["set_CommentCount_field"] = function (json_option) { return this.set_rx_field("CommentCount", json_option); }    create_rx_get_and_set_property(this, "UserCount");
    this["set_UserCount_field"] = function (json_option) { return this.set_rx_field("UserCount", json_option); }    create_rx_get_and_set_property(this, "BookChapter");
    this["set_BookChapter_field"] = function (json_option) { return this.set_rx_field("BookChapter", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_popularity_course_info_default.prototype = new Super(); for (var key in rx_view.static_method) { v_popularity_course_info_default[key] = rx_view.static_method[key]; } v_popularity_course_info_default.view_first_column = "id"; view_first_columns['v_popularity_course_info_default'] = 'id'; })();function v_product_info(instance_json) {
    rx_view.call(this, "v_product_info", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "detail_desc");
    this["set_detail_desc_field"] = function (json_option) { return this.set_rx_field("detail_desc", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "image_url");
    this["set_image_url_field"] = function (json_option) { return this.set_rx_field("image_url", json_option); }    create_rx_get_and_set_property(this, "image_id_list");
    this["set_image_id_list_field"] = function (json_option) { return this.set_rx_field("image_id_list", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "is_recommend");
    this["set_is_recommend_field"] = function (json_option) { return this.set_rx_field("is_recommend", json_option); }    create_rx_get_and_set_property(this, "is_integral");
    this["set_is_integral_field"] = function (json_option) { return this.set_rx_field("is_integral", json_option); }    create_rx_get_and_set_property(this, "sku_id");
    this["set_sku_id_field"] = function (json_option) { return this.set_rx_field("sku_id", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "integral");
    this["set_integral_field"] = function (json_option) { return this.set_rx_field("integral", json_option); }    create_rx_get_and_set_property(this, "stock");
    this["set_stock_field"] = function (json_option) { return this.set_rx_field("stock", json_option); }    create_rx_get_and_set_property(this, "spec_list");
    this["set_spec_list_field"] = function (json_option) { return this.set_rx_field("spec_list", json_option); }    create_rx_get_and_set_property(this, "type_name");
    this["set_type_name_field"] = function (json_option) { return this.set_rx_field("type_name", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "index_display");
    this["set_index_display_field"] = function (json_option) { return this.set_rx_field("index_display", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_product_info.prototype = new Super(); for (var key in rx_view.static_method) { v_product_info[key] = rx_view.static_method[key]; } v_product_info.view_first_column = "id"; view_first_columns['v_product_info'] = 'id'; })();function v_product_integral(instance_json) {
    rx_view.call(this, "v_product_integral", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "detail_desc");
    this["set_detail_desc_field"] = function (json_option) { return this.set_rx_field("detail_desc", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "image_url");
    this["set_image_url_field"] = function (json_option) { return this.set_rx_field("image_url", json_option); }    create_rx_get_and_set_property(this, "image_id_list");
    this["set_image_id_list_field"] = function (json_option) { return this.set_rx_field("image_id_list", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "is_recommend");
    this["set_is_recommend_field"] = function (json_option) { return this.set_rx_field("is_recommend", json_option); }    create_rx_get_and_set_property(this, "is_integral");
    this["set_is_integral_field"] = function (json_option) { return this.set_rx_field("is_integral", json_option); }    create_rx_get_and_set_property(this, "integral");
    this["set_integral_field"] = function (json_option) { return this.set_rx_field("integral", json_option); }    create_rx_get_and_set_property(this, "type_name");
    this["set_type_name_field"] = function (json_option) { return this.set_rx_field("type_name", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "index_display");
    this["set_index_display_field"] = function (json_option) { return this.set_rx_field("index_display", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_product_integral.prototype = new Super(); for (var key in rx_view.static_method) { v_product_integral[key] = rx_view.static_method[key]; } v_product_integral.view_first_column = "id"; view_first_columns['v_product_integral'] = 'id'; })();function v_product_payment(instance_json) {
    rx_view.call(this, "v_product_payment", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "detail_desc");
    this["set_detail_desc_field"] = function (json_option) { return this.set_rx_field("detail_desc", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "image_url");
    this["set_image_url_field"] = function (json_option) { return this.set_rx_field("image_url", json_option); }    create_rx_get_and_set_property(this, "image_id_list");
    this["set_image_id_list_field"] = function (json_option) { return this.set_rx_field("image_id_list", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "is_recommend");
    this["set_is_recommend_field"] = function (json_option) { return this.set_rx_field("is_recommend", json_option); }    create_rx_get_and_set_property(this, "is_integral");
    this["set_is_integral_field"] = function (json_option) { return this.set_rx_field("is_integral", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "type_name");
    this["set_type_name_field"] = function (json_option) { return this.set_rx_field("type_name", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "index_display");
    this["set_index_display_field"] = function (json_option) { return this.set_rx_field("index_display", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_product_payment.prototype = new Super(); for (var key in rx_view.static_method) { v_product_payment[key] = rx_view.static_method[key]; } v_product_payment.view_first_column = "id"; view_first_columns['v_product_payment'] = 'id'; })();function v_recommend_live_room(instance_json) {
    rx_view.call(this, "v_recommend_live_room", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "channel_id");
    this["set_channel_id_field"] = function (json_option) { return this.set_rx_field("channel_id", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "publisher");
    this["set_publisher_field"] = function (json_option) { return this.set_rx_field("publisher", json_option); }    create_rx_get_and_set_property(this, "status");
    this["set_status_field"] = function (json_option) { return this.set_rx_field("status", json_option); }    create_rx_get_and_set_property(this, "status_name");
    this["set_status_name_field"] = function (json_option) { return this.set_rx_field("status_name", json_option); }    create_rx_get_and_set_property(this, "display");
    this["set_display_field"] = function (json_option) { return this.set_rx_field("display", json_option); }    create_rx_get_and_set_property(this, "today_timetable");
    this["set_today_timetable_field"] = function (json_option) { return this.set_rx_field("today_timetable", json_option); }    create_rx_get_and_set_property(this, "today_week");
    this["set_today_week_field"] = function (json_option) { return this.set_rx_field("today_week", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_recommend_live_room.prototype = new Super(); for (var key in rx_view.static_method) { v_recommend_live_room[key] = rx_view.static_method[key]; } v_recommend_live_room.view_first_column = "id"; view_first_columns['v_recommend_live_room'] = 'id'; })();function v_search_tag_statistics(instance_json) {
    rx_view.call(this, "v_search_tag_statistics", instance_json);    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "tag_count");
    this["set_tag_count_field"] = function (json_option) { return this.set_rx_field("tag_count", json_option); }    create_rx_get_and_set_property(this, "tourist_count");
    this["set_tourist_count_field"] = function (json_option) { return this.set_rx_field("tourist_count", json_option); }    create_rx_get_and_set_property(this, "student_count");
    this["set_student_count_field"] = function (json_option) { return this.set_rx_field("student_count", json_option); }    create_rx_get_and_set_property(this, "teacher_count");
    this["set_teacher_count_field"] = function (json_option) { return this.set_rx_field("teacher_count", json_option); }    create_rx_get_and_set_property(this, "assistant_count");
    this["set_assistant_count_field"] = function (json_option) { return this.set_rx_field("assistant_count", json_option); }    create_rx_get_and_set_property(this, "user_count");
    this["set_user_count_field"] = function (json_option) { return this.set_rx_field("user_count", json_option); }    create_rx_get_and_set_property(this, "phone_count");
    this["set_phone_count_field"] = function (json_option) { return this.set_rx_field("phone_count", json_option); }    create_rx_get_and_set_property(this, "pc_count");
    this["set_pc_count_field"] = function (json_option) { return this.set_rx_field("pc_count", json_option); }    create_rx_get_and_set_property(this, "browser_count");
    this["set_browser_count_field"] = function (json_option) { return this.set_rx_field("browser_count", json_option); }    create_rx_get_and_set_property(this, "app_count");
    this["set_app_count_field"] = function (json_option) { return this.set_rx_field("app_count", json_option); }    create_rx_get_and_set_property(this, "ios_count");
    this["set_ios_count_field"] = function (json_option) { return this.set_rx_field("ios_count", json_option); }    create_rx_get_and_set_property(this, "android_count");
    this["set_android_count_field"] = function (json_option) { return this.set_rx_field("android_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_search_tag_statistics.prototype = new Super(); for (var key in rx_view.static_method) { v_search_tag_statistics[key] = rx_view.static_method[key]; } v_search_tag_statistics.view_first_column = "tag"; view_first_columns['v_search_tag_statistics'] = 'tag'; })();function v_student_evaluating_list(instance_json) {
    rx_view.call(this, "v_student_evaluating_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "test_id");
    this["set_test_id_field"] = function (json_option) { return this.set_rx_field("test_id", json_option); }    create_rx_get_and_set_property(this, "example_id");
    this["set_example_id_field"] = function (json_option) { return this.set_rx_field("example_id", json_option); }    create_rx_get_and_set_property(this, "full_score");
    this["set_full_score_field"] = function (json_option) { return this.set_rx_field("full_score", json_option); }    create_rx_get_and_set_property(this, "pass_score");
    this["set_pass_score_field"] = function (json_option) { return this.set_rx_field("pass_score", json_option); }    create_rx_get_and_set_property(this, "num");
    this["set_num_field"] = function (json_option) { return this.set_rx_field("num", json_option); }    create_rx_get_and_set_property(this, "dir_name");
    this["set_dir_name_field"] = function (json_option) { return this.set_rx_field("dir_name", json_option); }    create_rx_get_and_set_property(this, "subject_count");
    this["set_subject_count_field"] = function (json_option) { return this.set_rx_field("subject_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_student_evaluating_list.prototype = new Super(); for (var key in rx_view.static_method) { v_student_evaluating_list[key] = rx_view.static_method[key]; } v_student_evaluating_list.view_first_column = "id"; view_first_columns['v_student_evaluating_list'] = 'id'; })();function v_system_admin_list(instance_json) {
    rx_view.call(this, "v_system_admin_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "login_name");
    this["set_login_name_field"] = function (json_option) { return this.set_rx_field("login_name", json_option); }    create_rx_get_and_set_property(this, "login_pass");
    this["set_login_pass_field"] = function (json_option) { return this.set_rx_field("login_pass", json_option); }    create_rx_get_and_set_property(this, "role_id");
    this["set_role_id_field"] = function (json_option) { return this.set_rx_field("role_id", json_option); }    create_rx_get_and_set_property(this, "last_login_time");
    this["set_last_login_time_field"] = function (json_option) { return this.set_rx_field("last_login_time", json_option); }    create_rx_get_and_set_property(this, "last_login_address");
    this["set_last_login_address_field"] = function (json_option) { return this.set_rx_field("last_login_address", json_option); }    create_rx_get_and_set_property(this, "reg_date");
    this["set_reg_date_field"] = function (json_option) { return this.set_rx_field("reg_date", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "email");
    this["set_email_field"] = function (json_option) { return this.set_rx_field("email", json_option); }    create_rx_get_and_set_property(this, "qq_openid");
    this["set_qq_openid_field"] = function (json_option) { return this.set_rx_field("qq_openid", json_option); }    create_rx_get_and_set_property(this, "wx_openid");
    this["set_wx_openid_field"] = function (json_option) { return this.set_rx_field("wx_openid", json_option); }    create_rx_get_and_set_property(this, "role_name");
    this["set_role_name_field"] = function (json_option) { return this.set_rx_field("role_name", json_option); }    create_rx_get_and_set_property(this, "desc");
    this["set_desc_field"] = function (json_option) { return this.set_rx_field("desc", json_option); }    create_rx_get_and_set_property(this, "rights");
    this["set_rights_field"] = function (json_option) { return this.set_rx_field("rights", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_system_admin_list.prototype = new Super(); for (var key in rx_view.static_method) { v_system_admin_list[key] = rx_view.static_method[key]; } v_system_admin_list.view_first_column = "id"; view_first_columns['v_system_admin_list'] = 'id'; })();function v_teacher_evaluating_list(instance_json) {
    rx_view.call(this, "v_teacher_evaluating_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id");
    this["set_course_id_field"] = function (json_option) { return this.set_rx_field("course_id", json_option); }    create_rx_get_and_set_property(this, "test_id");
    this["set_test_id_field"] = function (json_option) { return this.set_rx_field("test_id", json_option); }    create_rx_get_and_set_property(this, "example_id");
    this["set_example_id_field"] = function (json_option) { return this.set_rx_field("example_id", json_option); }    create_rx_get_and_set_property(this, "num");
    this["set_num_field"] = function (json_option) { return this.set_rx_field("num", json_option); }    create_rx_get_and_set_property(this, "dir_name");
    this["set_dir_name_field"] = function (json_option) { return this.set_rx_field("dir_name", json_option); }    create_rx_get_and_set_property(this, "subject_count");
    this["set_subject_count_field"] = function (json_option) { return this.set_rx_field("subject_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_teacher_evaluating_list.prototype = new Super(); for (var key in rx_view.static_method) { v_teacher_evaluating_list[key] = rx_view.static_method[key]; } v_teacher_evaluating_list.view_first_column = "id"; view_first_columns['v_teacher_evaluating_list'] = 'id'; })();function v_web_user_list(instance_json) {
    rx_view.call(this, "v_web_user_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "login_name");
    this["set_login_name_field"] = function (json_option) { return this.set_rx_field("login_name", json_option); }    create_rx_get_and_set_property(this, "login_pass");
    this["set_login_pass_field"] = function (json_option) { return this.set_rx_field("login_pass", json_option); }    create_rx_get_and_set_property(this, "nick_name");
    this["set_nick_name_field"] = function (json_option) { return this.set_rx_field("nick_name", json_option); }    create_rx_get_and_set_property(this, "picture");
    this["set_picture_field"] = function (json_option) { return this.set_rx_field("picture", json_option); }    create_rx_get_and_set_property(this, "user_type");
    this["set_user_type_field"] = function (json_option) { return this.set_rx_field("user_type", json_option); }    create_rx_get_and_set_property(this, "email");
    this["set_email_field"] = function (json_option) { return this.set_rx_field("email", json_option); }    create_rx_get_and_set_property(this, "qq_unionid");
    this["set_qq_unionid_field"] = function (json_option) { return this.set_rx_field("qq_unionid", json_option); }    create_rx_get_and_set_property(this, "wx_unionid");
    this["set_wx_unionid_field"] = function (json_option) { return this.set_rx_field("wx_unionid", json_option); }    create_rx_get_and_set_property(this, "reg_date");
    this["set_reg_date_field"] = function (json_option) { return this.set_rx_field("reg_date", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "gender");
    this["set_gender_field"] = function (json_option) { return this.set_rx_field("gender", json_option); }    create_rx_get_and_set_property(this, "current_integral");
    this["set_current_integral_field"] = function (json_option) { return this.set_rx_field("current_integral", json_option); }    create_rx_get_and_set_property(this, "total_integral");
    this["set_total_integral_field"] = function (json_option) { return this.set_rx_field("total_integral", json_option); }    create_rx_get_and_set_property(this, "student_num");
    this["set_student_num_field"] = function (json_option) { return this.set_rx_field("student_num", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "professional_name");
    this["set_professional_name_field"] = function (json_option) { return this.set_rx_field("professional_name", json_option); }    create_rx_get_and_set_property(this, "idcard");
    this["set_idcard_field"] = function (json_option) { return this.set_rx_field("idcard", json_option); }    create_rx_get_and_set_property(this, "system_organize_id");
    this["set_system_organize_id_field"] = function (json_option) { return this.set_rx_field("system_organize_id", json_option); }    create_rx_get_and_set_property(this, "system_organize_name");
    this["set_system_organize_name_field"] = function (json_option) { return this.set_rx_field("system_organize_name", json_option); }    create_rx_get_and_set_property(this, "system_organize_code");
    this["set_system_organize_code_field"] = function (json_option) { return this.set_rx_field("system_organize_code", json_option); }    create_rx_get_and_set_property(this, "note");
    this["set_note_field"] = function (json_option) { return this.set_rx_field("note", json_option); }    create_rx_get_and_set_property(this, "short_name");
    this["set_short_name_field"] = function (json_option) { return this.set_rx_field("short_name", json_option); }    create_rx_get_and_set_property(this, "birthday");
    this["set_birthday_field"] = function (json_option) { return this.set_rx_field("birthday", json_option); }    create_rx_get_and_set_property(this, "teacher_type");
    this["set_teacher_type_field"] = function (json_option) { return this.set_rx_field("teacher_type", json_option); }    create_rx_get_and_set_property(this, "is_manager");
    this["set_is_manager_field"] = function (json_option) { return this.set_rx_field("is_manager", json_option); }    create_rx_get_and_set_property(this, "mobile");
    this["set_mobile_field"] = function (json_option) { return this.set_rx_field("mobile", json_option); }    create_rx_get_and_set_property(this, "wx_head");
    this["set_wx_head_field"] = function (json_option) { return this.set_rx_field("wx_head", json_option); }    create_rx_get_and_set_property(this, "qq_head");
    this["set_qq_head_field"] = function (json_option) { return this.set_rx_field("qq_head", json_option); }    create_rx_get_and_set_property(this, "grade");
    this["set_grade_field"] = function (json_option) { return this.set_rx_field("grade", json_option); }    create_rx_get_and_set_property(this, "grade_icon");
    this["set_grade_icon_field"] = function (json_option) { return this.set_rx_field("grade_icon", json_option); }    create_rx_get_and_set_property(this, "state");
    this["set_state_field"] = function (json_option) { return this.set_rx_field("state", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_web_user_list.prototype = new Super(); for (var key in rx_view.static_method) { v_web_user_list[key] = rx_view.static_method[key]; } v_web_user_list.view_first_column = "id"; view_first_columns['v_web_user_list'] = 'id'; })();function v_course_classification_list(instance_json) {
    rx_view.call(this, "v_course_classification_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "tag");
    this["set_tag_field"] = function (json_option) { return this.set_rx_field("tag", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "hour");
    this["set_hour_field"] = function (json_option) { return this.set_rx_field("hour", json_option); }    create_rx_get_and_set_property(this, "short_description");
    this["set_short_description_field"] = function (json_option) { return this.set_rx_field("short_description", json_option); }    create_rx_get_and_set_property(this, "full_description");
    this["set_full_description_field"] = function (json_option) { return this.set_rx_field("full_description", json_option); }    create_rx_get_and_set_property(this, "img_url");
    this["set_img_url_field"] = function (json_option) { return this.set_rx_field("img_url", json_option); }    create_rx_get_and_set_property(this, "price");
    this["set_price_field"] = function (json_option) { return this.set_rx_field("price", json_option); }    create_rx_get_and_set_property(this, "add_time");
    this["set_add_time_field"] = function (json_option) { return this.set_rx_field("add_time", json_option); }    create_rx_get_and_set_property(this, "is_closed");
    this["set_is_closed_field"] = function (json_option) { return this.set_rx_field("is_closed", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "type_name");
    this["set_type_name_field"] = function (json_option) { return this.set_rx_field("type_name", json_option); }    create_rx_get_and_set_property(this, "user_id");
    this["set_user_id_field"] = function (json_option) { return this.set_rx_field("user_id", json_option); }    create_rx_get_and_set_property(this, "web_user_name");
    this["set_web_user_name_field"] = function (json_option) { return this.set_rx_field("web_user_name", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "category_name");
    this["set_category_name_field"] = function (json_option) { return this.set_rx_field("category_name", json_option); }    create_rx_get_and_set_property(this, "course_comment_count");
    this["set_course_comment_count_field"] = function (json_option) { return this.set_rx_field("course_comment_count", json_option); }    create_rx_get_and_set_property(this, "course_comment_score");
    this["set_course_comment_score_field"] = function (json_option) { return this.set_rx_field("course_comment_score", json_option); }    create_rx_get_and_set_property(this, "assort_id");
    this["set_assort_id_field"] = function (json_option) { return this.set_rx_field("assort_id", json_option); }    create_rx_get_and_set_property(this, "assort_name");
    this["set_assort_name_field"] = function (json_option) { return this.set_rx_field("assort_name", json_option); }    create_rx_get_and_set_property(this, "total_reg");
    this["set_total_reg_field"] = function (json_option) { return this.set_rx_field("total_reg", json_option); }    create_rx_get_and_set_property(this, "dirctory_count");
    this["set_dirctory_count_field"] = function (json_option) { return this.set_rx_field("dirctory_count", json_option); }    create_rx_get_and_set_property(this, "root_dirctory_count");
    this["set_root_dirctory_count_field"] = function (json_option) { return this.set_rx_field("root_dirctory_count", json_option); }    create_rx_get_and_set_property(this, "search_attr_list");
    this["set_search_attr_list_field"] = function (json_option) { return this.set_rx_field("search_attr_list", json_option); }    create_rx_get_and_set_property(this, "desc");
    this["set_desc_field"] = function (json_option) { return this.set_rx_field("desc", json_option); }    create_rx_get_and_set_property(this, "classification_id");
    this["set_classification_id_field"] = function (json_option) { return this.set_rx_field("classification_id", json_option); }    create_rx_get_and_set_property(this, "classification_tag");
    this["set_classification_tag_field"] = function (json_option) { return this.set_rx_field("classification_tag", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_classification_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_classification_list[key] = rx_view.static_method[key]; } v_course_classification_list.view_first_column = "id"; view_first_columns['v_course_classification_list'] = 'id'; })();function v_course_registration_group_list(instance_json) {
    rx_view.call(this, "v_course_registration_group_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "course_id_list");
    this["set_course_id_list_field"] = function (json_option) { return this.set_rx_field("course_id_list", json_option); }    create_rx_get_and_set_property(this, "user_id_list");
    this["set_user_id_list_field"] = function (json_option) { return this.set_rx_field("user_id_list", json_option); }    create_rx_get_and_set_property(this, "class_id");
    this["set_class_id_field"] = function (json_option) { return this.set_rx_field("class_id", json_option); }    create_rx_get_and_set_property(this, "class_name");
    this["set_class_name_field"] = function (json_option) { return this.set_rx_field("class_name", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "organize_name");
    this["set_organize_name_field"] = function (json_option) { return this.set_rx_field("organize_name", json_option); }    create_rx_get_and_set_property(this, "user_count");
    this["set_user_count_field"] = function (json_option) { return this.set_rx_field("user_count", json_option); }    create_rx_get_and_set_property(this, "course_count");
    this["set_course_count_field"] = function (json_option) { return this.set_rx_field("course_count", json_option); }    create_rx_get_and_set_property(this, "create_time");
    this["set_create_time_field"] = function (json_option) { return this.set_rx_field("create_time", json_option); }    create_rx_get_and_set_property(this, "state");
    this["set_state_field"] = function (json_option) { return this.set_rx_field("state", json_option); }    create_rx_get_and_set_property(this, "desc");
    this["set_desc_field"] = function (json_option) { return this.set_rx_field("desc", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_course_registration_group_list.prototype = new Super(); for (var key in rx_view.static_method) { v_course_registration_group_list[key] = rx_view.static_method[key]; } v_course_registration_group_list.view_first_column = "id"; view_first_columns['v_course_registration_group_list'] = 'id'; })();function v_example_subject_lib_list(instance_json) {
    rx_view.call(this, "v_example_subject_lib_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "category_name");
    this["set_category_name_field"] = function (json_option) { return this.set_rx_field("category_name", json_option); }    create_rx_get_and_set_property(this, "subject_type");
    this["set_subject_type_field"] = function (json_option) { return this.set_rx_field("subject_type", json_option); }    create_rx_get_and_set_property(this, "subject_type_name");
    this["set_subject_type_name_field"] = function (json_option) { return this.set_rx_field("subject_type_name", json_option); }    create_rx_get_and_set_property(this, "title");
    this["set_title_field"] = function (json_option) { return this.set_rx_field("title", json_option); }    create_rx_get_and_set_property(this, "score");
    this["set_score_field"] = function (json_option) { return this.set_rx_field("score", json_option); }    create_rx_get_and_set_property(this, "answer_list");
    this["set_answer_list_field"] = function (json_option) { return this.set_rx_field("answer_list", json_option); }    create_rx_get_and_set_property(this, "answer_count");
    this["set_answer_count_field"] = function (json_option) { return this.set_rx_field("answer_count", json_option); }    create_rx_get_and_set_property(this, "item_list");
    this["set_item_list_field"] = function (json_option) { return this.set_rx_field("item_list", json_option); }    create_rx_get_and_set_property(this, "item_count");
    this["set_item_count_field"] = function (json_option) { return this.set_rx_field("item_count", json_option); }    create_rx_get_and_set_property(this, "latitude_id");
    this["set_latitude_id_field"] = function (json_option) { return this.set_rx_field("latitude_id", json_option); }    create_rx_get_and_set_property(this, "latitude_name");
    this["set_latitude_name_field"] = function (json_option) { return this.set_rx_field("latitude_name", json_option); }    create_rx_get_and_set_property(this, "is_order");
    this["set_is_order_field"] = function (json_option) { return this.set_rx_field("is_order", json_option); }    create_rx_get_and_set_property(this, "is_order_name");
    this["set_is_order_name_field"] = function (json_option) { return this.set_rx_field("is_order_name", json_option); }    create_rx_get_and_set_property(this, "difficulty");
    this["set_difficulty_field"] = function (json_option) { return this.set_rx_field("difficulty", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_example_subject_lib_list.prototype = new Super(); for (var key in rx_view.static_method) { v_example_subject_lib_list[key] = rx_view.static_method[key]; } v_example_subject_lib_list.view_first_column = "id"; view_first_columns['v_example_subject_lib_list'] = 'id'; })();function v_moot_class_list(instance_json) {
    rx_view.call(this, "v_moot_class_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "organize_id");
    this["set_organize_id_field"] = function (json_option) { return this.set_rx_field("organize_id", json_option); }    create_rx_get_and_set_property(this, "user_id_list");
    this["set_user_id_list_field"] = function (json_option) { return this.set_rx_field("user_id_list", json_option); }    create_rx_get_and_set_property(this, "user_name_list");
    this["set_user_name_list_field"] = function (json_option) { return this.set_rx_field("user_name_list", json_option); }    create_rx_get_and_set_property(this, "in_year");
    this["set_in_year_field"] = function (json_option) { return this.set_rx_field("in_year", json_option); }    create_rx_get_and_set_property(this, "system_organize_name");
    this["set_system_organize_name_field"] = function (json_option) { return this.set_rx_field("system_organize_name", json_option); }    create_rx_get_and_set_property(this, "system_organize_code");
    this["set_system_organize_code_field"] = function (json_option) { return this.set_rx_field("system_organize_code", json_option); }    create_rx_get_and_set_property(this, "short_name");
    this["set_short_name_field"] = function (json_option) { return this.set_rx_field("short_name", json_option); }    create_rx_get_and_set_property(this, "system_organize_user_id_list");
    this["set_system_organize_user_id_list_field"] = function (json_option) { return this.set_rx_field("system_organize_user_id_list", json_option); }    create_rx_get_and_set_property(this, "system_organize_user_name_list");
    this["set_system_organize_user_name_list_field"] = function (json_option) { return this.set_rx_field("system_organize_user_name_list", json_option); }    create_rx_get_and_set_property(this, "student_count");
    this["set_student_count_field"] = function (json_option) { return this.set_rx_field("student_count", json_option); }    create_rx_get_and_set_property(this, "manager_count");
    this["set_manager_count_field"] = function (json_option) { return this.set_rx_field("manager_count", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_moot_class_list.prototype = new Super(); for (var key in rx_view.static_method) { v_moot_class_list[key] = rx_view.static_method[key]; } v_moot_class_list.view_first_column = "id"; view_first_columns['v_moot_class_list'] = 'id'; })();function v_moot_video_category_list(instance_json) {
    rx_view.call(this, "v_moot_video_category_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "category_name");
    this["set_category_name_field"] = function (json_option) { return this.set_rx_field("category_name", json_option); }    create_rx_get_and_set_property(this, "level");
    this["set_level_field"] = function (json_option) { return this.set_rx_field("level", json_option); }    create_rx_get_and_set_property(this, "parent_id");
    this["set_parent_id_field"] = function (json_option) { return this.set_rx_field("parent_id", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_moot_video_category_list.prototype = new Super(); for (var key in rx_view.static_method) { v_moot_video_category_list[key] = rx_view.static_method[key]; } v_moot_video_category_list.view_first_column = "id"; view_first_columns['v_moot_video_category_list'] = 'id'; })();function v_product_list(instance_json) {
    rx_view.call(this, "v_product_list", instance_json);    create_rx_get_and_set_property(this, "id");
    this["set_id_field"] = function (json_option) { return this.set_rx_field("id", json_option); }    create_rx_get_and_set_property(this, "name");
    this["set_name_field"] = function (json_option) { return this.set_rx_field("name", json_option); }    create_rx_get_and_set_property(this, "code");
    this["set_code_field"] = function (json_option) { return this.set_rx_field("code", json_option); }    create_rx_get_and_set_property(this, "detail_desc");
    this["set_detail_desc_field"] = function (json_option) { return this.set_rx_field("detail_desc", json_option); }    create_rx_get_and_set_property(this, "type");
    this["set_type_field"] = function (json_option) { return this.set_rx_field("type", json_option); }    create_rx_get_and_set_property(this, "image_url");
    this["set_image_url_field"] = function (json_option) { return this.set_rx_field("image_url", json_option); }    create_rx_get_and_set_property(this, "category_id");
    this["set_category_id_field"] = function (json_option) { return this.set_rx_field("category_id", json_option); }    create_rx_get_and_set_property(this, "category_name");
    this["set_category_name_field"] = function (json_option) { return this.set_rx_field("category_name", json_option); }    create_rx_get_and_set_property(this, "root_category_id");
    this["set_root_category_id_field"] = function (json_option) { return this.set_rx_field("root_category_id", json_option); }    create_rx_get_and_set_property(this, "sku_count");
    this["set_sku_count_field"] = function (json_option) { return this.set_rx_field("sku_count", json_option); }    create_rx_get_and_set_property(this, "is_integral");
    this["set_is_integral_field"] = function (json_option) { return this.set_rx_field("is_integral", json_option); }    create_rx_get_and_set_property(this, "is_integral_name");
    this["set_is_integral_name_field"] = function (json_option) { return this.set_rx_field("is_integral_name", json_option); }    create_rx_get_and_set_property(this, "min_price");
    this["set_min_price_field"] = function (json_option) { return this.set_rx_field("min_price", json_option); }    create_rx_get_and_set_property(this, "max_price");
    this["set_max_price_field"] = function (json_option) { return this.set_rx_field("max_price", json_option); }    create_rx_get_and_set_property(this, "min_integral");
    this["set_min_integral_field"] = function (json_option) { return this.set_rx_field("min_integral", json_option); }    create_rx_get_and_set_property(this, "max_integral");
    this["set_max_integral_field"] = function (json_option) { return this.set_rx_field("max_integral", json_option); }}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; v_product_list.prototype = new Super(); for (var key in rx_view.static_method) { v_product_list[key] = rx_view.static_method[key]; } v_product_list.view_first_column = "id"; view_first_columns['v_product_list'] = 'id'; })();/*views ----------end*//*procedures ----------begin*/var pro_rx_insert_entity_out_id = {
    /* 使用【查询】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    */
    execute_select: function (call_back, out_id, insert_sql) {
        if (!(out_id instanceof Array)) { throw '因为参数out_id需要进行引用传递，所以必须定义为一个数组'; }
        out_id[0] = 0;
        var param_array =
            [
                new SqlParameter("@id", out_id[0], ParameterDirection.Output),                new SqlParameter("@insert_sql", insert_sql)
            ];
        do_call_back = function (data) {
            out_id[0] = data.tag["@id"];
            call_back(data);
        }
        rx_manager.get_entitys_in_proc(do_call_back, "pro_rx_insert_entity_out_id", param_array);
    },
    /* 使用【DML】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    * 同时out参数的返回值也会在data的tag中出现
    */
    execute_non_query: function (call_back, out_id, insert_sql) {
        if (!(out_id instanceof Array)) { throw '因为参数out_id需要进行引用传递，所以必须定义为一个数组'; }
        out_id[0] = 0;
        var param_array =
            [
                new SqlParameter("@id", out_id[0], ParameterDirection.Output),                new SqlParameter("@insert_sql", insert_sql)
            ];
        do_call_back = function (data) {
            out_id[0] = data.tag["@id"];
            call_back(data);
        }
        rx_manager.execute_non_query(do_call_back, "pro_rx_insert_entity_out_id", param_array);
    }}var pro_get_data_by_page = {
    /* 使用【查询】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    */
    execute_select: function (call_back, page_index, page_size, out_row_count, table_name, order_identity_string, field_string, where_string) {
        if (!(out_row_count instanceof Array)) { throw '因为参数out_row_count需要进行引用传递，所以必须定义为一个数组'; }
        out_row_count[0] = 0;
        var param_array =
            [
                new SqlParameter("@page_index", page_index),                new SqlParameter("@page_size", page_size),                new SqlParameter("@row_count", out_row_count[0], ParameterDirection.Output),                new SqlParameter("@table_name", table_name),                new SqlParameter("@order_identity_string", order_identity_string),                new SqlParameter("@field_string", field_string),                new SqlParameter("@where_string", where_string)
            ];
        do_call_back = function (data) {
            out_row_count[0] = data.tag["@row_count"];
            call_back(data);
        }
        rx_manager.get_entitys_in_proc(do_call_back, "pro_get_data_by_page", param_array);
    },
    /* 使用【DML】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    * 同时out参数的返回值也会在data的tag中出现
    */
    execute_non_query: function (call_back, page_index, page_size, out_row_count, table_name, order_identity_string, field_string, where_string) {
        if (!(out_row_count instanceof Array)) { throw '因为参数out_row_count需要进行引用传递，所以必须定义为一个数组'; }
        out_row_count[0] = 0;
        var param_array =
            [
                new SqlParameter("@page_index", page_index),                new SqlParameter("@page_size", page_size),                new SqlParameter("@row_count", out_row_count[0], ParameterDirection.Output),                new SqlParameter("@table_name", table_name),                new SqlParameter("@order_identity_string", order_identity_string),                new SqlParameter("@field_string", field_string),                new SqlParameter("@where_string", where_string)
            ];
        do_call_back = function (data) {
            out_row_count[0] = data.tag["@row_count"];
            call_back(data);
        }
        rx_manager.execute_non_query(do_call_back, "pro_get_data_by_page", param_array);
    }}var pro_transaction_execute_sql = {
    /* 使用【查询】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    */
    execute_select: function (call_back, sql) {
        
        var param_array =
            [
                new SqlParameter("@sql", sql)
            ];
        do_call_back = function (data) {
            
            call_back(data);
        }
        rx_manager.get_entitys_in_proc(do_call_back, "pro_transaction_execute_sql", param_array);
    },
    /* 使用【DML】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    * 同时out参数的返回值也会在data的tag中出现
    */
    execute_non_query: function (call_back, sql) {
        
        var param_array =
            [
                new SqlParameter("@sql", sql)
            ];
        do_call_back = function (data) {
            
            call_back(data);
        }
        rx_manager.execute_non_query(do_call_back, "pro_transaction_execute_sql", param_array);
    }}var pro_class_audio_statistic = {
    /* 使用【查询】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    */
    execute_select: function (call_back, course_id, organize_id, in_year, class_id_list) {
        
        var param_array =
            [
                new SqlParameter("@course_id", course_id),                new SqlParameter("@organize_id", organize_id),                new SqlParameter("@in_year", in_year),                new SqlParameter("@class_id_list", class_id_list)
            ];
        do_call_back = function (data) {
            
            call_back(data);
        }
        rx_manager.get_entitys_in_proc(do_call_back, "pro_class_audio_statistic", param_array);
    },
    /* 使用【DML】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    * 同时out参数的返回值也会在data的tag中出现
    */
    execute_non_query: function (call_back, course_id, organize_id, in_year, class_id_list) {
        
        var param_array =
            [
                new SqlParameter("@course_id", course_id),                new SqlParameter("@organize_id", organize_id),                new SqlParameter("@in_year", in_year),                new SqlParameter("@class_id_list", class_id_list)
            ];
        do_call_back = function (data) {
            
            call_back(data);
        }
        rx_manager.execute_non_query(do_call_back, "pro_class_audio_statistic", param_array);
    }}var pro_class_watch_statistic = {
    /* 使用【查询】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    */
    execute_select: function (call_back, course_id, organize_id, in_year, class_id_list) {
        
        var param_array =
            [
                new SqlParameter("@course_id", course_id),                new SqlParameter("@organize_id", organize_id),                new SqlParameter("@in_year", in_year),                new SqlParameter("@class_id_list", class_id_list)
            ];
        do_call_back = function (data) {
            
            call_back(data);
        }
        rx_manager.get_entitys_in_proc(do_call_back, "pro_class_watch_statistic", param_array);
    },
    /* 使用【DML】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    * 同时out参数的返回值也会在data的tag中出现
    */
    execute_non_query: function (call_back, course_id, organize_id, in_year, class_id_list) {
        
        var param_array =
            [
                new SqlParameter("@course_id", course_id),                new SqlParameter("@organize_id", organize_id),                new SqlParameter("@in_year", in_year),                new SqlParameter("@class_id_list", class_id_list)
            ];
        do_call_back = function (data) {
            
            call_back(data);
        }
        rx_manager.execute_non_query(do_call_back, "pro_class_watch_statistic", param_array);
    }}var pro_get_access_info_statistic = {
    /* 使用【查询】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    */
    execute_select: function (call_back, type, year, month, group) {
        
        var param_array =
            [
                new SqlParameter("@type", type),                new SqlParameter("@year", year),                new SqlParameter("@month", month),                new SqlParameter("@group", group)
            ];
        do_call_back = function (data) {
            
            call_back(data);
        }
        rx_manager.get_entitys_in_proc(do_call_back, "pro_get_access_info_statistic", param_array);
    },
    /* 使用【DML】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    * 同时out参数的返回值也会在data的tag中出现
    */
    execute_non_query: function (call_back, type, year, month, group) {
        
        var param_array =
            [
                new SqlParameter("@type", type),                new SqlParameter("@year", year),                new SqlParameter("@month", month),                new SqlParameter("@group", group)
            ];
        do_call_back = function (data) {
            
            call_back(data);
        }
        rx_manager.execute_non_query(do_call_back, "pro_get_access_info_statistic", param_array);
    }}/*procedures ----------end*/