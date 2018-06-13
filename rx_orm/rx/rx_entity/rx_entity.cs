using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;

namespace rx
{
    /// <summary>
    /// rx_orm中的基础实体类，弱类型
    /// <para>键值对规则</para>
    /// <para>直接使用rx_manager进行弱类型开发，性能高</para>
    /// <para>rx_manager要求物理表中必须存在字段id，类型int，自增(1,1)</para>
    /// </summary>
    public sealed class rx_entity : Dictionary<string, rx_field>
    {
        public new rx_field this[string key]
        {
            get
            {
                if (!base.ContainsKey(key)) base[key] = new rx_field(key, null, this);
                return base[key];
            }
            set
            {
                base[key] = value;
            }
        }

        //protected rx_entity()
        //{
        //    string[] keys = rx_manager.empty_entity_and_view_keys[this.entity_name];
        //    int length = keys.Length;
        //    for (int i = 0; i < length; i++)
        //    {
        //        this.Add(keys[i], new rx_field(keys[i], null, this));
        //    }
        //}

        /// <summary>
        /// 创建一个动态实体对象，本质是一个Dictionary<string, rx_field>
        /// 通常由对应的管理类(manager)的instance方法来创建
        /// </summary>
        /// <param name="entity_name">实体的名称，通常与数据库中对应的表名一致</param>
        internal rx_entity(string entity_name)
        {
            this._entity_name = entity_name;
        }

        private string _entity_name;

        /// <summary>
        /// entity_name名称与数据库对应的表名或者视图名是一致的
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public string entity_name
        {
            get
            {
                return _entity_name;
            }
            internal set
            {
                this._entity_name = value;
            }
        }

        /// <summary>
        /// 这个方法是为了一次性链式操作设置指定key的rx_field属性而存在的
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="key">rx_field的key</param>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性id是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns></returns>
        public rx_entity set_rx_field(string key, compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            if (!this.Keys.Contains(key))
            {
                throw new Exception("key:" + key + " 在这个实体中不存在！");
            }
            this[key].compare_symbol = compare ?? this[key].compare_symbol;
            this[key].logic_symbol = logic ?? this[key].logic_symbol;
            this[key].date_format_type = date_format_type ?? this[key].date_format_type;
            this[key].auto_remove = auto_remove ?? this[key].auto_remove;
            this[key].build_quote = build_quote ?? this[key].build_quote;
            this[key].value = value ?? this[key].value;

            if (this.where_keys == null)
                this.where_keys = new List<string>();
            if (!this.where_keys.Contains(key))
                this.where_keys.Add(key);

            return this;
        }

        private dml_command_type _command_type = dml_command_type.vague;

        /// <summary>
        /// 在执行指定dml操作时候需要指定的枚举值
        /// vague是默认值
        /// update执行更新操作
        /// delete执行删除操作
        /// insert执行添加操作
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public dml_command_type command_type
        {
            get { return this._command_type; }
            set { this._command_type = value; }
        }

        private bool _is_use_null = false;
        /// <summary>
        /// <para>sql指定执行【dml insert与update】操作时是否使用null值</para>
        /// <para>true:使用</para>
        /// <para>false:不使用</para>
        /// <para>默认值为false</para>
        /// <para>例子: key为"login_name",value为null,如果is_use_null为false，则不使用该字段。</para>
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public bool is_use_null
        {
            get { return this._is_use_null; }
            set { this._is_use_null = value; }
        }

        private string[] _where_keys = null;

        /// <summary>
        /// <para>获取实体的where_key属性</para>
        /// <para>强制指定在执行各类sql语句参与where子句条件查询时使用实体的哪些key</para>
        /// <para>会受到is_use_null属性的影响</para>
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public List<string> where_keys
        {
            get { return _where_keys == null ? null : _where_keys.ToList(); }
            internal set { _where_keys = value == null ? null : value.ToArray(); }
        }

        /// <summary>
        /// 设置实体的where_key属性
        /// 指定的key要存在与实体的key中
        /// </summary>
        /// <param name="where_keys"></param>
        public rx_entity set_where_keys(params string[] where_keys)
        {
            if (where_keys != null)
            {
                KeyCollection keys = this.Keys;
                for (int i = 0; i < where_keys.Length; i++)
                {
                    if (!keys.Contains(where_keys[i]))
                    {
                        throw new Exception(string.Format("该实体对象中不包含key：{0}", where_keys[i]));
                    }
                }
            }
            this._where_keys = where_keys;
            return this;
        }

        /// <summary>
        /// 删除所有的where_keys
        /// </summary>
        public rx_entity clear_where_keys()
        {
            this._where_keys = null;
            return this;
        }

        internal string[] _select_display_keys = null;

        /// <summary>
        /// <para>获取需要查询的字段字符串</para>
        /// <para>没有使用set_select_display_keys进行设置结果为*</para>
        /// /// <para>连式操作</para>
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public string select_display_keys
        {
            get
            {
                if (_select_display_keys == null || _select_display_keys.Length == 0)
                {
                    return "*";
                }
                KeyCollection keys = this.Keys;
                StringBuilder keys_query = new StringBuilder();
                for (int i = 0; i < _select_display_keys.Length; i++)
                {
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", this.entity_name, _select_display_keys[i]);
                }
                return keys_query.ToString();
            }
            internal set
            {
                this._select_display_keys = value == null ? null : value.Split(',');
            }
        }

        /// <summary>
        /// <para>设置实体的select_display_keys属性</para>
        /// <para>指定的key要存在与实体的key中</para>
        /// <para>连式操作</para>
        /// </summary>
        /// <param name="select_display_keys"></param>
        public rx_entity set_select_display_keys(params string[] select_display_keys)
        {
            if (select_display_keys != null)
            {
                KeyCollection keys = this.Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("该实体对象中不包含key：{0}", select_display_keys[i]));
                    }
                }
            }
            this._select_display_keys = select_display_keys;
            return this;
        }

        /// <summary>
        /// 删除所有的select_display_keys
        /// <para>连式操作</para>
        /// </summary>
        public rx_entity clear_select_display_keys()
        {
            this._select_display_keys = null;

            return this;
        }

        /// <summary>
        /// 克隆当前这个实体的对象
        /// </summary>
        /// <returns></returns>
        public rx_entity clone()
        {
            rx_entity obj = new rx_entity(this.entity_name)
            {
                command_type = this.command_type,
                is_use_null = this.is_use_null,
                _where_keys = this._where_keys,
                _select_display_keys = this._select_display_keys,
            };

            foreach (string key in this.Keys)
            {
                obj[key] = this[key].clone();
            }
            return obj;
        }

        /// <summary>
        /// 转换为Dictionary&lt;string, object&gt;，便于进行json序列化或者其他序列化
        /// </summary>
        /// <returns></returns>
        public Dictionary<string, object> to_dictionary()
        {
            Dictionary<string, object> dic = new Dictionary<string, object>();
            foreach (string key in this.Keys)
            {
                dic[key] = this[key].value;
            }
            return dic;
        }

        /// <summary>
        /// 转换为Dictionary&lt;string, object&gt;，便于进行json序列化或者其他序列化
        /// </summary>
        /// <param name="is_base_value">转换时是否使用base_value，主要针对时间字段</param>
        /// <returns></returns>
        public Dictionary<string, object> to_dictionary(bool is_base_value)
        {
            Dictionary<string, object> dic = new Dictionary<string, object>();
            if (is_base_value)
            {
                foreach (string key in this.Keys)
                {
                    dic[key] = this[key].base_value;
                }
            }
            else
            {
                foreach (string key in this.Keys)
                {
                    dic[key] = this[key].value;
                }
            }

            return dic;
        }

        /// <summary>
        /// 将web请求的request对象中的的值填充置这个实体的对象中
        /// request中的key要和当前对象中的key对应才能正确填充，不一致的key将会忽略
        /// <para>连式操作</para>
        /// </summary>
        public rx_entity request_fill(HttpRequest request = null)
        {
            if (request == null)
            {
                request = request ?? HttpContext.Current.Request;
            }
            string[] keys = this.Keys.ToArray();
            int length = keys.Length;
            for (int i = 0; i < length; i++)
            {
                if (request[keys[i]] != null)
                    this[keys[i]] = new rx_field(keys[i], request[keys[i]], this);
            }

            return this;
        }

        /// <summary>
        /// 将web请求的request对象中的的值填充置这个实体的对象中
        /// request中的key要和当前对象中的key对应才能正确填充，不一致的key将会忽略
        /// <para>连式操作</para>
        /// </summary>
        /// <param name="request">MVC项目某些情况下会使用到</param>
        /// <returns></returns>
        public rx_entity request_fill(HttpRequestBase request)
        {
            string[] keys = this.Keys.ToArray();
            int length = keys.Length;
            for (int i = 0; i < length; i++)
            {
                if (request[keys[i]] != null)
                    this[keys[i]] = new rx_field(keys[i], request[keys[i]], this);
            }

            return this;
        }

        /// <summary>
        /// 替换父类方法
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        /// <param name="field">rx_field</param>
        /// <returns></returns>
        public new rx_entity Add(string key, rx_field field)
        {
            base.Add(key, field);

            return this;
        }

        /// <summary>
        /// 替换父类方法
        /// <para>链式操作</para>
        /// <para>如果发生异常ArgumentNullException,将会返回null</para>
        /// </summary>
        /// <param name="key">key</param>
        /// <returns></returns>
        public new rx_entity Remove(string key)
        {
            try
            {
                base.Remove(key);
            }
            catch { return null; }

            return this;
        }

        /// <summary>
        /// 替换父类方法
        /// <para>链式操作</para>
        /// </summary>
        /// <returns></returns>
        public new rx_entity Clear()
        {
            base.Clear();
            return this;
        }
    }

    /// <summary>
    /// dml操作的枚举类型
    /// </summary>
    public enum dml_command_type
    {
        /// <summary>
        /// 更新操作
        /// </summary>
        update,
        /// <summary>
        /// 删除操作
        /// </summary>
        delete,
        /// <summary>
        /// 添加操作
        /// </summary>
        insert,
        /// <summary>
        /// 不明确的,默认值
        /// </summary>
        vague
    }

    public static class rx_object
    {
        public static short to_short(this object obj)
        {
            return Convert.ToInt16(obj);
        }

        public static int to_int(this object obj)
        {
            return Convert.ToInt32(obj);
        }

        public static long to_long(this object obj)
        {
            return Convert.ToInt64(obj);
        }

        public static float to_float(this object obj)
        {
            return (float)Convert.ToDecimal(obj);
        }

        public static decimal to_decimal(this object obj)
        {
            return Convert.ToDecimal(obj);
        }

        public static double to_double(this object obj)
        {
            return Convert.ToDouble(obj);
        }

        /// <summary>
        /// 将rx_entity类型List集合 转换为List集合的字典
        /// </summary>
        /// <param name="rx_entity_list"></param>
        /// <returns></returns>
        public static List<Dictionary<string, object>> to_dictionary_list(this List<rx_entity> rx_entity_list)
        {
            return rx_entity_list.Select(a => a.to_dictionary()).ToList();
        }

        /// <summary>
        /// 将rx_entity类型List集合 转换为数组的字典
        /// </summary>
        /// <param name="rx_entity_list"></param>
        /// <returns></returns>
        public static Dictionary<string, object>[] to_dictionary_array(this List<rx_entity> rx_entity_list)
        {
            return rx_entity_list.Select(a => a.to_dictionary()).ToArray();
        }

        /// <summary>
        /// 将rx_entity类型数组 转换为List集合的字典
        /// </summary>
        /// <returns></returns>
        public static List<Dictionary<string, object>> to_dictionary_list(this rx_entity[] rx_entity_array)
        {
            return rx_entity_array.Select(a => a.to_dictionary()).ToList();
        }

        /// <summary>
        /// 将rx_entity对象数字 转换字典数字
        /// </summary>
        /// <returns></returns>
        public static Dictionary<string, object>[] to_dictionary_array(this rx_entity[] rx_entity_array)
        {
            return rx_entity_array.Select(a => a.to_dictionary()).ToArray();
        }

        /// <summary>
        /// 转换为JSON字符串
        /// </summary>
        /// <param name="rx_entity"></param>
        /// <returns></returns>
        public static string to_json_string(this rx_entity rx_entity)
        {
            return new JavaScriptSerializer().Serialize(rx_entity.to_dictionary());
        }

        /// <summary>
        /// 转换为JSON字符串
        /// </summary>
        /// <param name="rx_entity_list"></param>
        /// <returns></returns>
        public static string to_json_string(this List<rx_entity> rx_entity_list)
        {
            return new JavaScriptSerializer().Serialize(rx_entity_list.to_dictionary_array());
        }

        /// <summary>
        /// 转换为JSON字符串
        /// </summary>
        /// <param name="rx_entity_array"></param>
        /// <returns></returns>
        public static string to_json_string(this rx_entity[] rx_entity_array)
        {
            return new JavaScriptSerializer().Serialize(rx_entity_array.to_dictionary_array());
        }

        /// <summary>
        /// 转换为JSON字符串
        /// </summary>
        /// <param name="rx_table_entity"></param>
        /// <returns></returns>
        public static string to_json_string(this rx_table_entity rx_table_entity)
        {
            return new JavaScriptSerializer().Serialize
                (
                    new
                    {
                        row_count = rx_table_entity.row_count,
                        rows = rx_table_entity.rows.to_dictionary_array()
                    }
                );
        }
    }
}
