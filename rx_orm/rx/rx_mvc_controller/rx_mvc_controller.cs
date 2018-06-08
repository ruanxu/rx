using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using System.Data;
using System.Web.Script.Serialization;
using System.Reflection;
using System.Runtime.Serialization.Json;
using System.IO;
using System.Collections;
namespace rx
{
    /// <summary>
    /// rx_mvc_controller
    /// <para>操作数据库的所以方法都是在js中进行完成</para>
    /// <para>sql防注入机制请自行编写，可以在Global中进行过滤编写</para>
    /// </summary>
    public abstract class rx_mvc_controller : Controller
    {
        #region 让Controller的Json方法能适应rx_entity
        protected new JsonResult Json(object data)
        {
            rx_obj_build(ref data);
            return base.Json(data);
        }

        protected new JsonResult Json(object data, JsonRequestBehavior behavior)
        {
            rx_obj_build(ref data);

            return base.Json(data, behavior);
        }

        protected new JsonResult Json(object data, string contentType)
        {
            rx_obj_build(ref data);
            return base.Json(data, contentType);
        }

        protected new JsonResult Json(object data, string contentType, JsonRequestBehavior behavior)
        {
            rx_obj_build(ref data);
            return base.Json(data, contentType, behavior);
        }

        protected override JsonResult Json(object data, string contentType, System.Text.Encoding contentEncoding)
        {
            rx_obj_build(ref data);

            return base.Json(data, contentType, contentEncoding);
        }

        protected override JsonResult Json(object data, string contentType, System.Text.Encoding contentEncoding, JsonRequestBehavior behavior)
        {
            rx_obj_build(ref data);

            return base.Json(data, contentType, contentEncoding, behavior);
        }

        /// <summary>
        /// 将RX系列的实体对象转换成易被json序列化的对象
        /// </summary>
        /// <param name="data"></param>
        protected virtual void rx_obj_build(ref object data)
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
        #endregion

        [HttpGet]
        public JsonResult rx_orm_addin_test()
        {
            return Json(new
            {
                version = rx_manager.version,
                api_type = "asp_net_mvc",
                i_rx_risk = this is i_rx_risk,
                i_rx_risk_proc = this is i_rx_risk_proc,
                i_rx_risk_update = this is i_rx_risk_update,
                i_rx_risk_delete = this is i_rx_risk_delete,
                i_rx_risk_insert = this is i_rx_risk_insert
            }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 通过这个action反射执行rx_manager的静态方法，参数列表与前端orm有关
        /// </summary>
        /// <param name="rx_method">rx_manager中静态方法的名称</param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult rx_index_action(string rx_method)
        {
            if (!(this is i_rx_risk))
            {
                throw new Exception("当前控制器或者handle必须继承i_rx_risk才能开启前端orm调用接口");
            }

            List<MethodInfo> methods = rx_manager.method_list.Where(a => a.Name == rx_method).OrderByDescending(a => a.GetParameters().Length).ToList();

            if (methods.Count == 0)
            {
                return Json(new
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

                        entity = new rx_entity(dic["entity_name"].ToString());
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
                    var obj = invoke_method(methods[i], input_parameters);
                    rx_obj_build(ref obj);
                    result.Add("rows", obj);
                    foreach (string key in ref_index.Keys)
                    {
                        result[key] = input_parameters[ref_index[key]];
                    }
                    return Json(result);
                }
                else
                {
                    return Json(invoke_method(methods[i], input_parameters));
                }
            }

            return Json(new
            {
                message = string.Format("rx_manager中不存在 {0} 这个静态方法,或者没有找到符合该方法参数列表的重载匹配", rx_method)
            });
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

    }
}
