/// <reference path="rx.js" />
//服务器项目类型枚举
var server_project_type = {
    asp_net_handle: "asp_net_handle",
    asp_net_web_form: "asp_net_web_form",
    asp_net_mvc: "asp_net_mvc",
    asp_net_mvc_api: "asp_net_mvc_api"
};

/*前端rx_maager，与后端rx_manager一
 * 所有回调函数call_back的参数都是data与xml
*/
var rx_manager = {
    /*-----------------------------配置begin*/
    /*服务接口地址需要在使用前或者使用中进行配置
    * asp.net mvc项目server_url要指定继承rx_mvc_controller的控制器的地址
    * asp.net mvc api项目server_url要指定继承rx_mvc_api_controller的api控制器的地址
    * asp.net web_form项目server_url要指定继承rx_handle的一般处理程序的地址
    */
    server_url: "http://localhost:24793/api/v1/TestApi",
    //项目类型，具体参考枚举server_project_type中的值
    project_type: server_project_type.asp_net_mvc_api,
    //是否启用默认的error事件
    is_show_error: true,
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
                    page_index: page_index,
                    page_size: page_size,
                    table_or_view_name: table_or_view_name,
                    order_identity_string: order_identity_string,
                    field_string: field_string,
                    where_string: where_string,
                    date_time_format: date_time_format
                },
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
                    view_name: view_name,
                    where_string: where_string,
                    select_display_keys: select_display_keys,
                    date_time_format: date_time_format
                },
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
                    proc_name: proc_name,
                    proc_params: JSON.stringify(proc_params),
                    date_time_format: date_time_format
                },
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

        try {
            ajax({
                url: server_project_type.build_url("transaction_execute_non_query"),
                type: rx_manager.project_type == server_project_type.asp_net_mvc_api ? "put" : "post",
                data: data,
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
                    sql: sql,
                    date_time_format: date_time_format
                },
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
                    sql_or_proc_name: sql_or_proc_name,
                    param_array: JSON.stringify(param_array),
                    command_type: command_type
                },
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
                    table_or_view_name: table_or_view_name,
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
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
    /* 根据表名和id获取实体的单个对象
     * call_back 回调函数，参数data与xml【必选】
     * table_name 表名，必须是存在的表【必选】
     * id 表的id值,必须是一个数字【必选】
     * date_time_format 服务端对数据中时间类型对象的格式化方式，默认值：date_format_type.date_time。例:date_format_type中的的枚举值
     * select_display_keys:指定需要显示的列名，null或者undefined为*，分隔符","，例：id,name,age
     */
    get_entity_by_id: function (call_back, table_name, id, date_time_format, select_display_keys) {
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
                    table_name: table_name,
                    id: id,
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
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
                    table_name: table_name,
                    id_array: id_array.join("[{@}]"),
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
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
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }

        do_entity = { rx_fields: [] };
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
                    entity: JSON.stringify(do_entity),
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
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
                    table_name: table_name,
                    where_string: where_string,
                    date_time_format: date_time_format,
                    select_display_keys: select_display_keys
                },
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
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (!(entity instanceof rx_entity)) {
            throw "entity必须是一个rx_entity对象！";
        }

        do_entity = { rx_fields: [] };
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
                    entity: JSON.stringify(do_entity)
                },
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
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (!(entity instanceof rx_entity)) {
            throw "entity必须是一个rx_entity对象！";
        }

        do_entity = { rx_fields: [] };
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
                    entity: JSON.stringify(do_entity)
                },
                success: function (data, xml) {
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

        try {
            ajax({
                url: server_project_type.build_url("insert_entitys"),
                type: "post",
                data: data,
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
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }
        if (!(entity instanceof rx_entity)) {
            throw "entity必须是一个rx_entity对象！";
        }

        do_entity = { rx_fields: [] };
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
                    entity: JSON.stringify(do_entity)
                },
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
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }

        do_entity = { rx_fields: [] };
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
                    entity: JSON.stringify(do_entity)
                },
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
                    table_name: table_name,
                    id: id
                },
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
                    table_name: table_name,
                    id_array: id_array
                },
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
                    table_name: table_name,
                    where_string: where_string
                },
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
        if (!(call_back instanceof Function)) {
            throw "回调函数call_back是必须传入的，且必须是一个function,参数data与xml！";
        }

        do_entity = { rx_fields: [] };
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
                    entity: JSON.stringify(do_entity)
                },
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
    }
    /*-----------------------------各种orm方法end*/
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
    // 模糊匹配 例:"%张%"
    like: "like",
    // 头模糊匹配 例:"%张"
    begin_like: "begin_like",
    // 尾模糊匹配 例:"张%"
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
            if (!(value instanceof rx_field)) {
                throw "rx强实体对象的rx_field强属性成员" + property_name + "的set(赋值)操作必须给予rx_field类型的值";
            }
            this.get_rx_field(property_name).value = value;
        }
    });
}

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

    /*克隆对象*/
    this.clone = function () {
        var field = new rx_field(this.key, entity, this.date_format_type);
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

    /* js键值对和属性get|set不能同时使用，这里使用get_field代替后端的键值对设置rx_field对象
    * 参数列表与后端rx_entity的Add方法一致
    * 【如果你一定要用键值对也可以，例子obj["id"] = new rx_field("id", 1, obj); 必须这样写才能识别为添加（Add）rx_field对象】
    * 链式操作
    */
    this.Add = function (key, field) {
        if (!(field instanceof rx_field))
            throw "field必须是rx_field的对象";
        this[key] = field;
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

    create_get_and_set_property(this, "length", "Count");

    if (instance_json != undefined) {
        for (var key in instance_json) {
            if (!(instance_json[key] instanceof Function)) {
                if (this[key] == undefined)
                    this.Add(key, new rx_field(key, instance_json[key], this));
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
            model.rx_entity.Add(values[i].key, values[i].clone());
        }
        return model;
    }

    /*为实体类强行添加一个rx_field，被添加rx_field只能通过rx_entity的get_rx_field进行访问
    * 链式操作
    */
    this.add = function (key, value) {
        this.rx_entity.Add(key, new rx_field(key, value, this.rx_entity));
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
            order_identity_string = order_identity_string || eval(entity_name + ".view_first_column") + " asc";
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

