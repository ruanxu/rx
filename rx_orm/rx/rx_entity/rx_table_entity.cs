using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace rx
{
    public class rx_table_entity
    {
        public long row_count { get; set; }

        public List<rx_entity> rows { get; set; }
    }
}
