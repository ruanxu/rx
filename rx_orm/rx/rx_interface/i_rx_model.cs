using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace rx
{
    public interface i_rx_model<T> where T : rx_model<T>, new()
    {
        T add(string key, object value);

        T remove(string key);
    }
}
