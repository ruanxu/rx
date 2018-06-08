using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using rx;

namespace rx_javaScript
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{version}/{controller}"
            );
            rx_mvc_api_controller.set_version_info("v1");
        }
    }
}
