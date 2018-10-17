using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using System.Security.Cryptography;

namespace rx
{
    public class rx_web_form : System.Web.UI.Page
    {
        protected string sign { get; set; }

        private static string[] date_format_type_names = typeof(date_format_type).GetEnumNames();

        public rx_web_form()
        {
            this.Load += rx_web_form_Load;
        }

        void rx_web_form_Load(object sender, EventArgs e)
        {
            if (Request["rx_orm_addin_test"] == "rx_orm_addin_test")
            {
                response_write_json(new
                {
                    version = rx_manager.version,
                    api_type = "asp_net_web_form",
                    i_rx_risk = this is i_rx_risk,
                    i_rx_risk_proc = this is i_rx_risk_proc,
                    i_rx_risk_update = this is i_rx_risk_update,
                    i_rx_risk_delete = this is i_rx_risk_delete,
                    i_rx_risk_insert = this is i_rx_risk_insert,
                    i_rx_sign = this is i_rx_sign
                });
                return;
            }

            if (this is i_rx_sign && !sign_validate())
            {
                response_write_json(new dml_result("")
                {
                    result_code = dml_result_code.error,
                    message = "sign 签名不正确"
                });
                return;
            }

            string rx_method = Request["rx_method"];

            if (rx_manager.rx_function_md5.ContainsKey(rx_method))
            {
                if (!rx_manager.rx_function_md5[rx_method].Contains(Request["rx_function"]))
                {
                    response_write("检测到非法的调用，你是否调用了尝试修改rx_manager进行注入调用？");
                    return;
                }
            }

            if (rx_method == null || rx_method.Trim() == "")
            {
                response_write("该Web窗体承了rx_web_form,所以请按照规则或者rx_manager前端sdk进行调用！");
                return;
            }

            if (!(this is i_rx_risk))
            {
                throw new Exception("当前控制器或者handle必须继承i_rx_risk才能开启前端orm调用接口");
            }

            List<MethodInfo> methods = rx_manager.method_list.Where(a => a.Name == rx_method).OrderByDescending(a => a.GetParameters().Length).ToList();

            if (methods.Count == 0)
            {
                response_write_json(new
                {
                    message = string.Format("rx_manager中不存在 {0} 这个静态方法", rx_method)
                });
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
                    if (Request[parameters[j].Name] == null && !parameters[j].ParameterType.IsByRef)
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
                        input_parameters[j] = Request[parameters[j].Name];
                    }
                    else if (parameters[j].ParameterType.IsEnum)
                    {
                        input_parameters[j] = Enum.Parse(parameters[j].ParameterType, Request[parameters[j].Name], true);
                    }
                    else if (parameters[j].ParameterType.FullName.ToLower() == "system.data.sqlclient.sqlparameter[]")
                    {
                        List<Dictionary<string, object>> dic_list = jss.Deserialize<List<Dictionary<string, object>>>(Request[parameters[j].Name]);
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
                        List<Dictionary<string, object>> dic_list = jss.Deserialize<List<Dictionary<string, object>>>(Request[parameters[j].Name]);
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
                        Dictionary<string, object> dic = jss.Deserialize<Dictionary<string, object>>(Request[parameters[j].Name]);
                        rx_entity entity = new rx_entity(dic["entity_name"].ToString());
                        if (!rx_manager.empty_entity_and_view_keys.Keys.Contains(dic["entity_name"].ToString()))
                        {
                            throw new Exception("表或者视图 " + dic["entity_name"].ToString() + " 不存在");
                        }
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
                            input_parameters[j] = jss.DeserializeObject(Request[parameters[j].Name]);
                        }
                        else
                        {
                            switch (parameters[j].ParameterType.FullName.ToLower())
                            {
                                case "system.string[]":
                                    input_parameters[j] = Regex.Split(Request[parameters[j].Name], @"\[{@}\]", RegexOptions.Compiled);
                                    break;
                                case "system.int32[]":
                                    input_parameters[j] = Regex.Split(Request[parameters[j].Name], @"\[{@}\]", RegexOptions.Compiled).Select(a => a.to_int()).ToArray();
                                    break;
                            }

                        }

                    }
                }

                if (is_continue) continue;

                if (result.Count != 0)
                {
                    result.Add("rows", invoke_method(methods[i], input_parameters));
                    foreach (string key in ref_index.Keys)
                    {
                        result[key] = input_parameters[ref_index[key]];
                    }
                    response_write_json(result);
                    return;
                }
                else
                {
                    response_write_json(invoke_method(methods[i], input_parameters));
                    return;
                }
            }

            response_write_json(new
            {
                message = string.Format("rx_manager中不存在 {0} 这个静态方法,或者没有找到符合该方法参数列表的重载匹配", rx_method)
            });

        }

        /// <summary>
        /// 将RX系列的实体对象转换成易被json序列化的对象
        /// </summary>
        /// <param name="data"></param>
        private void rx_obj_build(ref object data)
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
        }

        protected void response_write(object obj)
        {
            Response.Write(obj);
        }

        /// <summary>
        /// 该方法适应了rx系列的所有对象json序列化
        /// </summary>
        /// <param name="obj"></param>
        protected void response_write_json(object obj)
        {
            rx_obj_build(ref obj);
            Response.Write(JsonConvert.SerializeObject(obj));
        }

        private object invoke_method(MethodInfo method, object[] input_parameters, bool is_mvc_api = false)
        {
            List<Attribute> attrs = method.GetCustomAttributes().ToList();
            string http_method = Request.HttpMethod.ToLower().Trim();
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
                api_methods = api_methods.Distinct().ToList();
                if (!api_methods.Contains(http_method))
                {
                    throw new Exception(method.Name + " 在 asp.net mvc api 模式中可以使用的动作有 " + string.Join(" ", api_methods) + "，而且调用该接口的动作为 " + http_method);
                }
            }
            return method.Invoke(null, input_parameters);
        }

        private bool sign_validate()
        {
            this.sign = Request["sign"];
            StringBuilder query = new StringBuilder();
            foreach (string key in Request.QueryString)
            {
                if (key == "sign" || key == "rx_method") continue;
                query.Append(key + "=" + Request.QueryString[key]);
            }
            foreach (string key in Request.Form)
            {
                if (key == "sign" || key == "rx_method") continue;
                query.Append(key + "=" + Request.Form[key]);
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
