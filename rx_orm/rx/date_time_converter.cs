using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace rx
{
    public class date_time_converter : JsonConverter
    {
        public override bool CanConvert(Type object_type)
        {
            return object_type == typeof(DateTime) || object_type == typeof(DateTime?);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            return Convert.ToDateTime(reader.Value);
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value == null)
            {
                writer.WriteValue(value);
                return;
            }

            writer.WriteValue(Convert.ToDateTime(value).ToString("yyyy-MM-dd HH:mm:ss"));
        }
    }
}
