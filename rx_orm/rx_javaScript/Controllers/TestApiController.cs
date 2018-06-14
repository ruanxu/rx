using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using rx;

namespace rx_javaScript.Controllers
{
    public class TestApiController : rx_mvc_api_controller, i_rx_risk, i_rx_risk_proc, i_rx_risk_delete, i_rx_risk_update, i_rx_risk_insert, i_rx_sign
    {
    }
}
