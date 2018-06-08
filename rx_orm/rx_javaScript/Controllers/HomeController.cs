#define a1
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using rx;
using System.Diagnostics;
using System.Net.Http;
using moot.model;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using moot.model.Views;
using rx_javaScript.Models;

namespace rx_javaScript.Controllers
{
    public class HomeController : rx_mvc_controller, i_rx_risk, i_rx_risk_insert, i_rx_risk_delete, i_rx_risk_update, i_rx_risk_proc
    {
        public const string s = "a2";

        [ConditionalAttribute(s)]
        public void Fun()
        {
#if DEBUG
            int a = 0;
#endif
        }

        [HttpGet]
        public ActionResult Index()
        {
            



            int a = 1;
            //List<rx_entity> list = null;
            //list.to_dictionary_list();
            //string s = JsonConvert.SerializeObject(web_user.get_entity_by_id(1));
            //int a = 0;

            //rx_entity obj = rx_manager.get_entity_by_id("web_user",2);
            //var client = new HttpClient();

            //client.BaseAddress = new Uri("http://localhost:58805/api/Default/execute_non_query_proc");
            //var putTask = client.PutAsJsonAsync("http://localhost:58805/api/Default/execute_non_query_proc", "");
            //putTask.Wait();
            //var result = putTask.Result;
            return View();
        }

        public JsonResult Test(int num)
        {
            if (num == 1)
            {
                return Json(new
                {
                    a = 4,
                    b = 5,
                    c = 6
                });
            }
            else
                return Json(new
                {
                    a = 1,
                    b = 2,
                    c = 3
                });
        }

        public JsonResult TestTable()
        {
            return Json(rx.rx_manager.get_rxtable_data("v_web_user_list", "id", "*", null));
        }

        public JsonResult TestCombobox()
        {
            return Json(
                rx_manager.get_all_entitys("web_user")
                );
        }

        public JsonResult TestRepeater()
        {
            return Json(rx.rx_manager.get_entitys_in_view("v_web_user_list"));
        }

        public JsonResult LoadSubmit()
        {
            return Json(new
            {
                user_name = "嘿嘿",
                pwd = "123",
                sex = "女",
                lang = "c#,html5",
                desc = "123,234"
            });
        }

    }
}
