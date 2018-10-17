using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace rx_javaScript.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/

        public ActionResult Index()
        {
            return View();
        }

        public JsonResult GetData()
        {
            List<object> list = new List<object>() { 
                new { id= 1, 学期 = "第一学期", 语文 = "10",数学 = "20",英语 = "30", name= "jack" },
                new { id= 2, 学期 = "第一学期", 语文 = "11",数学 = "21",英语 = "31", name= "jack" },
                new { id= 3, 学期 = "第二学期", 语文 = "12",数学 = "22",英语 = "32", name= "jack" },
                new { id= 4, 学期 = "第三学期", 语文 = "13",数学 = "23",英语 = "33", name= "jack" },
                new { id= 5, 学期 = "第一学期", 语文 = "20",数学 = "30",英语 = "40", name= "tom" },
                new { id= 6, 学期 = "第二学期", 语文 = "24",数学 = "34",英语 = "44", name= "tom" },
                new { id= 7, 学期 = "第三学期", 语文 = "24",数学 = "34",英语 = "44", name= "tom" },
                new { id= 8, 学期 = "第一学期", 语文 = "30",数学 = "40",英语 = "50", name= "cindy" },
            };

            //for (int i = 0; i < 5; i++)
            //{
            //    list.Add(list[list.Count - 1]);
            //}
            //list.Add(
            //    new { id = 8, 学期 = "第二学期", 语文 = "30", 数学 = "40", 英语 = "50", name = "cindy" }
                
            //    );

            //list.Add(new { id = 8, 学期 = "第二学期", 语文 = "30", 数学 = "40", 英语 = "50", name = "cindy" });
            return Json(list);
        }

        [ValidateInput(false)]
        public FileResult download_excel(string Excel, string FileName)
        {
            MemoryStream stream = mstf.common.npoi_helper.build_excel_stream(Excel);
            return File(stream.ToArray(), "application/ms-excel", FileName + ".xls");
        }
    }
}
