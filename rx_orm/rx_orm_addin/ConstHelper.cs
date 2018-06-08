using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace rx_orm_addin
{
    public class ConstHelper
    {
        public const string handler_class_content = @"<%@ WebHandler Language=""C#"" Class=""{$namespace}.{$routes}.{$action}"" %>
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using rx;
namespace {$namespace}{$routes}
{
    public class {$action} : rx_handle, {$jurisdiction}
    {
    }
}";
        public static string get_handler_class_content(string _namespace, string routes, string action, string jurisdiction)
        {
            return handler_class_content
                .Replace("{$namespace}", _namespace)
                .Replace("{$routes}", routes)
                .Replace("{$action}", action)
                .Replace("{$jurisdiction}", jurisdiction);
        }

        public const string web_form_content = @"<%@ Page Language=""C#"" AutoEventWireup=""true"" CodeBehind=""{$class_name}"" Inherits=""{$namespace}.{$routes}.{$action}"" %>";

        public static string get_web_form_content(string _namespace, string routes, string action, string class_name)
        {
            return web_form_content
                .Replace("{$namespace}", _namespace)
                .Replace("{$routes}", routes)
                .Replace("{$action}", action)
                .Replace("{$class_name}", class_name);
        }

        public const string web_form_class_content = @"using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using rx;

namespace {$namespace}{$routes}
{
    public class {$action} : rx_web_form, {$jurisdiction}
    {
    }
}";
        public static string get_web_form_class_content(string _namespace, string routes, string action, string jurisdiction)
        {
            return web_form_class_content
                .Replace("{$namespace}", _namespace)
                .Replace("{$routes}", routes)
                .Replace("{$action}", action)
                .Replace("{$jurisdiction}", jurisdiction);
        }

        public const string controller_class_content = @"using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using rx;

namespace {$namespace}{$routes}
{
    public class {$action} : rx_mvc_controller, {$jurisdiction}
    {
    }
}";

        public static string get_controller_content(string _namespace, string routes, string action, string jurisdiction)
        {
            return controller_class_content
                .Replace("{$namespace}", _namespace)
                .Replace("{$routes}", routes)
                .Replace("{$action}", action)
                .Replace("{$jurisdiction}", jurisdiction);
        }

        public const string api_controller_web_api_config_class_content = @"using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using rx;

namespace {$namespace}
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                name: ""DefaultApi"",
                routeTemplate: ""api/{version}/{controller}""
            );
            rx_mvc_api_controller.set_version_info(""v1"");
        }
    }
}
";

        public static string get_api_controller_web_api_config_class_content(string _namespace)
        {
            return api_controller_web_api_config_class_content.Replace("{$namespace}", _namespace);
        }

        public const string api_controller_class_content = @"using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using rx;

namespace {$namespace}{$routes}
{
    public class {$action} : rx_mvc_api_controller, {$jurisdiction}
    {
    }
}";

        public static string get_api_controller_class_content(string _namespace, string routes, string action, string jurisdiction)
        {
            return api_controller_class_content
                .Replace("{$namespace}", _namespace)
                .Replace("{$routes}", routes)
                .Replace("{$action}", action)
                .Replace("{$jurisdiction}", jurisdiction);
        }

    }
}
