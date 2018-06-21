using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http.Formatting;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Script.Serialization;

namespace rx
{
    public abstract class rx_mvc_api_controller : ApiController
    {
        private static string[] date_format_type_names = typeof(date_format_type).GetEnumNames();
        public string version { get; set; }
        private string api_action { get; set; }
        public HttpContextBase context { get; set; }
        private static string index_route_template { get; set; }
        private static string[] route_template_split { get; set; }
        private static int version_index { get; set; }
        private static string[] versions { get; set; }
        /// <summary>
        /// 是否开启签名信息
        /// </summary>
        protected string sign { get; set; }
        public override Task<System.Net.Http.HttpResponseMessage> ExecuteAsync(System.Web.Http.Controllers.HttpControllerContext controllerContext, System.Threading.CancellationToken cancellationToken)
        {
            return base.ExecuteAsync(controllerContext, cancellationToken);
        }

        /// <summary>
        /// 用这个方法来设置api的版本，必须设置
        /// </summary>
        /// <param name="versions">如"v1","v2","v3"......</param>
        public static void set_version_info(params string[] versions)
        {
            if (versions == null || versions.Length == 0)
            {
                throw new Exception("不能指定空的版本序列！");
            }
            rx_mvc_api_controller.versions = versions;
        }

        protected override void Initialize(System.Web.Http.Controllers.HttpControllerContext controllerContext)
        {
            if (versions == null || versions.Length == 0)
            {
                throw new Exception("请先使用rx_mvc_api_controller的静态方法set_version_info方法指定存在的版本序列规则！可以在Global中指定，例如：v1,v2,v3....");
            }

            context = (HttpContextBase)controllerContext.Request.Properties["MS_HttpContext"];
            version = context.Request.Path.Split('/')[version_index + 1];
            if (!versions.Contains(version))
            {
                throw new Exception(string.Format("版本:{0} 不存在,set_version_info未指定该版本！", version));
            }
            api_action = context.Request["api_action"];
            base.Initialize(controllerContext);
        }

        private static int init()
        {
            HttpConfiguration config = GlobalConfiguration.Configuration;
            bool reg = false;
            foreach (var item in config.Routes)
            {
                if (!Regex.IsMatch(item.RouteTemplate.Trim(), @"^[a-zA-Z0-9_\-\{\}\./]{1,}/{version}/{controller}$"))
                {
                    throw new Exception(@"rx_manager要求api路由规则中至少存在一个规则，而且第1位的RouteTemplate必须是“*/{version}/{controller}”");
                }
                index_route_template = item.RouteTemplate.Trim();
                route_template_split = index_route_template.Split('/');
                for (int i = 0; i < route_template_split.Length; i++)
                {
                    if (route_template_split[i] == "{version}")
                    {
                        version_index = i;
                        break;
                    }
                }
                reg = true;
                break;
            }
            if (!reg)
            {
                throw new Exception(@"rx_manager要求mvc web api的api路由规则中至少存在一个规则，而且第1位的RouteTemplate必须是“*/{version}/{controller}/{id}”");
            }

            GlobalConfiguration.Configuration.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
            //默认返回 json  
            GlobalConfiguration.Configuration.Formatters.JsonFormatter.MediaTypeMappings.Add(
                new QueryStringMapping("datatype", "json", "application/json"));
            //返回格式选择 datatype 可以替换为任何参数   
            GlobalConfiguration.Configuration.Formatters.XmlFormatter.MediaTypeMappings.Add(
                new QueryStringMapping("datatype", "xml", "application/xml"));

            return 0;
        }
        private static int a = init();

        public virtual object Get()
        {
            return rx_index_action(api_action);
        }

        public virtual object Post()
        {
            return rx_index_action(api_action);
        }

        public virtual object Put()
        {
            return rx_index_action(api_action);
        }

        public virtual object Delete()
        {
            return rx_index_action(api_action);
        }

        //chrome 会先进行Options动作请求验证
        public virtual object Options()
        {
            return "success";
        }

        private object invoke_method(string api_action)
        {
            if (api_action == null || api_action.Trim() == "")
            {
                return api_action + "无效，该控制器继承了rx_mvc_api_controller,所以请按照api路由规则或者rx_manager前端sdk进行调用！";
            }
            string method = context.Request.HttpMethod.ToLower();
            MethodInfo method_info = this.GetType().GetMethod(api_action, BindingFlags.Instance | BindingFlags.NonPublic);
            bool is_method_error = false;
            switch (method)
            {
                case "get":
                    if (method_info.GetCustomAttribute(typeof(HttpGetAttribute)) == null)
                        is_method_error = true;
                    break;
                case "post":
                    if (method_info.GetCustomAttribute(typeof(HttpPostAttribute)) == null)
                        is_method_error = true;
                    break;
                case "put":
                    if (method_info.GetCustomAttribute(typeof(HttpPutAttribute)) == null)
                        is_method_error = true;
                    break;
                case "delete":
                    if (method_info.GetCustomAttribute(typeof(HttpDeleteAttribute)) == null)
                        is_method_error = true;
                    break;
                default:
                    is_method_error = true;
                    break;
            }
            if (is_method_error) return api_action + " 动作错误";

            return rx_obj_build(this.GetType().GetMethod(api_action, BindingFlags.Instance | BindingFlags.NonPublic).Invoke(this, null));
        }

        private object rx_index_action(string api_action)
        {
            if (context.Request["rx_orm_addin_test"] == "rx_orm_addin_test")
            {
                return new
                {
                    version = rx_manager.version,
                    api_type = "asp_net_mvc_api",
                    i_rx_risk = this is i_rx_risk,
                    i_rx_risk_proc = this is i_rx_risk_proc,
                    i_rx_risk_update = this is i_rx_risk_update,
                    i_rx_risk_delete = this is i_rx_risk_delete,
                    i_rx_risk_insert = this is i_rx_risk_insert,
                    i_rx_sign = this is i_rx_sign
                };
            }

            if (this is i_rx_sign && !sign_validate())
            {
                return new dml_result("")
                {
                    result_code = dml_result_code.error,
                    message = "sign 签名不正确"
                };
            }

            if (!(this is i_rx_risk))
            {
                throw new Exception("当前控制器或者handle必须继承i_rx_risk才能开启前端orm调用接口");
            }

            if (rx_manager.rx_function_md5.ContainsKey(api_action))
            {
                if (rx_manager.rx_function_md5[api_action] != context.Request["rx_function"])
                {
                    return new dml_result("")
                    {
                        result_code = dml_result_code.error,
                        message = "检测到非法的调用，你是否调用了尝试修改rx_manager进行注入调用？"
                    };
                }
            }

            List<MethodInfo> methods = rx_manager.method_list.Where(a => a.Name == api_action).OrderByDescending(a => a.GetParameters().Length).ToList();

            if (methods.Count == 0)
            {
                return invoke_method(api_action);
            }


            JavaScriptSerializer jss = new JavaScriptSerializer();
            for (int i = 0; i < methods.Count; i++)
            {
                bool is_continue = false;
                ParameterInfo[] parameters = methods[i].GetParameters();
                object[] input_parameters = new object[parameters.Length];
                Dictionary<string, object> result = new Dictionary<string, object>();
                Dictionary<string, int> ref_index = new Dictionary<string, int>();
                for (int j = 0; j < parameters.Length; j++)
                {
                    if (context.Request[parameters[j].Name] == null && !parameters[j].ParameterType.IsByRef)
                    {
                        is_continue = true;
                        break;
                    }

                    if (parameters[j].ParameterType.IsByRef)
                    {
                        input_parameters[j] = Activator.CreateInstance(Type.GetType(parameters[j].ParameterType.FullName.Replace("&", "")));
                        result.Add(parameters[j].Name, null);
                        ref_index.Add(parameters[j].Name, j);
                    }
                    else if (parameters[j].ParameterType.IsAnsiClass && parameters[j].ParameterType.FullName.ToLower() == "system.string")
                    {
                        input_parameters[j] = context.Request[parameters[j].Name];
                    }
                    else if (parameters[j].ParameterType.IsEnum)
                    {
                        input_parameters[j] = Enum.Parse(parameters[j].ParameterType, context.Request[parameters[j].Name], true);
                    }
                    else if (parameters[j].ParameterType.FullName.ToLower() == "system.data.sqlclient.sqlparameter[]")
                    {
                        List<Dictionary<string, object>> dic_list = jss.Deserialize<List<Dictionary<string, object>>>(context.Request[parameters[j].Name]);
                        if (dic_list == null)
                        {
                            input_parameters[j] = null;
                            continue;
                        }
                        SqlParameter[] paras = new SqlParameter[dic_list.Count];
                        for (int k = 0; k < dic_list.Count; k++)
                        {
                            paras[k] = new SqlParameter(dic_list[k]["ParameterName"].ToString(), dic_list[k]["Value"].ToString())
                            {
                                Direction = dic_list[k]["Value"] == null ? ParameterDirection.Input : (ParameterDirection)Enum.Parse(typeof(ParameterDirection), dic_list[k]["Direction"].ToString(), true),
                                Size = 9999999
                            };
                        }
                        input_parameters[j] = paras;
                    }
                    else if (parameters[j].ParameterType.FullName.ToLower() == "rx.rx_entity[]")
                    {
                        List<Dictionary<string, object>> dic_list = jss.Deserialize<List<Dictionary<string, object>>>(context.Request[parameters[j].Name]);
                        rx_entity[] entitys = new rx_entity[dic_list.Count];
                        for (int k = 0; k < dic_list.Count; k++)
                        {
                            entitys[k] = new rx_entity(dic_list[k]["entity_name"].ToString());
                            entitys[k].command_type = (dml_command_type)Enum.Parse(typeof(dml_command_type), dic_list[k]["command_type"].ToString(), true);
                            entitys[k].is_use_null = Convert.ToBoolean(dic_list[k]["is_use_null"]);
                            entitys[k].where_keys = dic_list[k]["where_keys"] as List<string>;
                            entitys[k].select_display_keys = dic_list[k]["select_display_keys"] as string;
                            ArrayList rx_fields = (ArrayList)dic_list[k]["rx_fields"];
                            for (int l = 0; l < rx_fields.Count; l++)
                            {
                                Dictionary<string, object> rx_field = (Dictionary<string, object>)rx_fields[l];
                                entitys[k].Add(
                                    rx_field["key"].ToString(),
                                    new rx_field(
                                        rx_field["key"].ToString(),
                                        rx_field["value"],
                                        entitys[k],
                                        (date_format_type)Enum.Parse(typeof(date_format_type), rx_field["date_format_type"].ToString(), true)
                                        )
                                    {
                                        compare_symbol = (compare_symbol)Enum.Parse(typeof(compare_symbol), rx_field["compare_symbol"].ToString(), true),
                                        logic_symbol = (logic_symbol)Enum.Parse(typeof(logic_symbol), rx_field["logic_symbol"].ToString(), true),
                                        auto_remove = Convert.ToBoolean(rx_field["auto_remove"]),
                                        build_quote = Convert.ToBoolean(rx_field["build_quote"])
                                    }
                                    );
                            }
                            entitys[k].select_display_keys = dic_list[k]["select_display_keys"] == null ? null : dic_list[k]["select_display_keys"].ToString();
                            entitys[k].where_keys = dic_list[k]["where_keys"] == null ? null : ((ArrayList)dic_list[k]["where_keys"]).OfType<string>().ToList();
                        }

                        input_parameters[j] = entitys;
                    }
                    else if (parameters[j].ParameterType.FullName.ToLower() == "rx.rx_entity")
                    {
                        Dictionary<string, object> dic = jss.Deserialize<Dictionary<string, object>>(context.Request[parameters[j].Name]);
                        if (!rx_manager.empty_entity_and_view_keys.Keys.Contains(dic["entity_name"].ToString()))
                        {
                            throw new Exception("表或者视图 " + dic["entity_name"].ToString() + " 不存在");
                        }
                        rx_entity entity = new rx_entity(dic["entity_name"].ToString());

                        entity.command_type = (dml_command_type)Enum.Parse(typeof(dml_command_type), dic["command_type"].ToString(), true);
                        entity.is_use_null = Convert.ToBoolean(dic["is_use_null"]);
                        entity.where_keys = dic["where_keys"] as List<string>;
                        entity.select_display_keys = dic["select_display_keys"] as string;
                        ArrayList rx_fields = (ArrayList)dic["rx_fields"];
                        for (int l = 0; l < rx_fields.Count; l++)
                        {
                            Dictionary<string, object> rx_field = (Dictionary<string, object>)rx_fields[l];
                            entity.Add(
                                rx_field["key"].ToString(),
                                new rx_field(
                                    rx_field["key"].ToString(),
                                    rx_field["value"],
                                    entity,
                                    (date_format_type)Enum.Parse(typeof(date_format_type), rx_field["date_format_type"].ToString(), true)
                                    )
                                {
                                    compare_symbol = (compare_symbol)Enum.Parse(typeof(compare_symbol), rx_field["compare_symbol"].ToString(), true),
                                    logic_symbol = (logic_symbol)Enum.Parse(typeof(logic_symbol), rx_field["logic_symbol"].ToString(), true),
                                    auto_remove = Convert.ToBoolean(rx_field["auto_remove"]),
                                    build_quote = Convert.ToBoolean(rx_field["build_quote"])
                                }
                                );
                        }
                        entity.select_display_keys = dic["select_display_keys"] == null ? null : dic["select_display_keys"].ToString();
                        entity.where_keys = dic["where_keys"] == null ? null : ((ArrayList)dic["where_keys"]).OfType<string>().ToList();

                        input_parameters[j] = entity;
                    }
                    else
                    {
                        if (!parameters[j].ParameterType.IsArray)
                        {
                            input_parameters[j] = jss.DeserializeObject(context.Request[parameters[j].Name]);
                        }
                        else
                        {
                            switch (parameters[j].ParameterType.FullName.ToLower())
                            {
                                case "system.string[]":
                                    input_parameters[j] = Regex.Split(context.Request[parameters[j].Name], @"\[{@}\]", RegexOptions.Compiled);
                                    break;
                                case "system.int32[]":
                                    input_parameters[j] = Regex.Split(context.Request[parameters[j].Name], @"\[{@}\]", RegexOptions.Compiled).Select(a => a.to_int()).ToArray();
                                    break;
                            }

                        }

                    }
                }

                if (is_continue) continue;

                if (result.Count != 0)
                {
                    result.Add("rows", invoke_method(methods[i], input_parameters, true));
                    foreach (string key in ref_index.Keys)
                    {
                        result[key] = input_parameters[ref_index[key]];
                    }
                    return result;
                }
                else
                {
                    return invoke_method(methods[i], input_parameters, true);
                }
            }

            return new
            {
                message = string.Format("rx_manager中不存在 {0} 这个静态方法,或者没有找到符合该方法参数列表的重载匹配", api_action)
            };
        }

        private object invoke_method(MethodInfo method, object[] input_parameters, bool is_mvc_api = false)
        {
            List<Attribute> attrs = method.GetCustomAttributes().ToList();
            string http_method = context.Request.HttpMethod.ToLower().Trim();
            List<string> api_methods = new List<string>();
            for (int i = 0; i < attrs.Count; i++)
            {
                if (attrs[i] is rx_risk_procAttribute && !(this is i_rx_risk_proc))
                {
                    throw new Exception("当前控制器或者handle必须继承i_rx_risk_proc才能使用" + method.Name);
                }
                else if (attrs[i] is rx_risk_insertAttribute && !(this is i_rx_risk_insert))
                {
                    throw new Exception("当前控制器或者handle必须继承i_rx_risk_insert才能使用" + method.Name);
                }
                else if (attrs[i] is rx_risk_updateAttribute && !(this is i_rx_risk_update))
                {
                    throw new Exception("当前控制器或者handle必须继承i_rx_risk_update才能使用" + method.Name);
                }
                else if (attrs[i] is rx_risk_deleteAttribute && !(this is i_rx_risk_delete))
                {
                    throw new Exception("当前控制器或者handle必须继承i_rx_risk_delete才能使用" + method.Name);
                }
                if (is_mvc_api)
                {
                    if (attrs[i] is System.Web.Http.HttpGetAttribute || attrs[i] is System.Web.Mvc.HttpGetAttribute)
                    {
                        api_methods.Add("get");
                    }
                    else if (attrs[i] is System.Web.Http.HttpPostAttribute || attrs[i] is System.Web.Mvc.HttpPostAttribute)
                    {
                        api_methods.Add("post");
                    }
                    else if (attrs[i] is System.Web.Http.HttpPutAttribute || attrs[i] is System.Web.Mvc.HttpPutAttribute)
                    {
                        api_methods.Add("put");
                    }
                    else if (attrs[i] is System.Web.Http.HttpDeleteAttribute || attrs[i] is System.Web.Mvc.HttpDeleteAttribute)
                    {
                        api_methods.Add("delete");
                    }
                }
            }
            if (is_mvc_api)
            {
                api_methods = api_methods.Distinct().ToList() ;
                if (!api_methods.Contains(http_method))
                {
                    throw new Exception(method.Name + " 在 asp.net mvc api 模式中可以使用的动作有 " + string.Join(" ", api_methods) + "，而且调用该接口的动作为 " + http_method);
                }
            }
            return rx_obj_build(method.Invoke(null, input_parameters));
        }

        private object rx_obj_build(object data)
        {
            if (data is List<rx_entity>)
            {
                data = (data as List<rx_entity>).to_dictionary_array();
            }
            else if (data is rx_entity[])
            {
                data = (data as rx_entity[]).to_dictionary_array();
            }
            else if (data is rx_entity)
            {
                data = ((rx_entity)data).to_dictionary();
            }
            else if (data is rx_table_entity)
            {
                rx_table_entity rx = data as rx_table_entity;

                data = new
                {
                    row_count = rx.row_count,
                    rows = rx.rows.to_dictionary_array()
                };
            }

            return data;
        }

        private bool sign_validate()
        {
            this.sign = context.Request["sign"];
            StringBuilder query = new StringBuilder();
            foreach (string key in context.Request.QueryString)
            {
                if (key == "sign" || key == "api_action") continue;
                query.Append(key + "=" + context.Request.QueryString[key]);
            }
            foreach (string key in context.Request.Form)
            {
                if (key == "sign" || key == "api_action") continue;
                query.Append(key + "=" + context.Request.Form[key]);
            }
            byte[] sor = Encoding.UTF8.GetBytes(query.ToString());
            MD5 md5 = MD5.Create();
            byte[] result = md5.ComputeHash(sor);
            StringBuilder md5_string = new StringBuilder();
            for (int i = 0; i < result.Length; i++)
            {
                md5_string.Append(result[i].ToString("x2"));//加密结果"x2"结果为32位,"x3"结果为48位,"x4"结果为64位
            }

            return md5_string.ToString() == sign;
        }
    }
}
