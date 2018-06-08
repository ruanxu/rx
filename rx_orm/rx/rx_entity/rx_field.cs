using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace rx
{
    /// <summary>
    /// rx系列orm中【字段的】类型
    /// </summary>
    public class rx_field
    {
        public rx_field(string key, object value, rx_entity entity, date_format_type date_format_type)
        {
            this.date_format_type = date_format_type;
            this._base_value = value == DBNull.Value ? null : value;
            this._key = key;
            this.value = this._base_value;
            this.entity = entity;
        }

        public rx_field(string key, object value, rx_entity entity)
        {
            this._base_value = value == DBNull.Value ? null : value;
            this._key = key;
            this.value = this._base_value;
            this.entity = entity;
        }

        public rx_field(string key, object value, rx_strong_type model, date_format_type date_format_type)
        {
            this.date_format_type = date_format_type;
            this._base_value = value == DBNull.Value ? null : value;
            this._key = key;
            this.value = this._base_value;
            this.entity = model.rx_entity;
        }

        public rx_field(string key, object value, rx_strong_type model)
        {
            this._base_value = value == DBNull.Value ? null : value;
            this._key = key;
            this.value = this._base_value;
            this.entity = model.rx_entity;
        }

        private rx_entity entity { get; set; }

        private string _key;

        [JsonIgnore]
        [ScriptIgnore]
        public string key
        {
            get { return _key; }
        }

        private object _base_value;

        /// <summary>
        /// 本质value
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public object base_value
        {
            get { return _base_value; }
        }

        private object _value;

        /// <summary>
        /// 字段存放的值，与base_value区别只要体现在DateTime类型的值，base_value不受date_format_type的影响，value会受date_format_type的影响
        /// </summary>
        public object value
        {
            get { return this._value; }
            set
            {
                this._value = value;
                this._base_value = value;
                if (this._value is DateTime)
                {
                    build_date_string();
                }
            }
        }

        /// <summary>
        /// base_value的class类型名称
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public string base_value_class_name
        {
            get
            {
                if (this._base_value != null)
                    return this._base_value.GetType().FullName;
                return "";
            }
        }

        private bool _auto_remove = true;
        /// <summary>
        /// 在处理时是否自动删除该字段，默认值true,可以防止某些特殊情况下id字段被删除
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public bool auto_remove
        {
            get
            {
                return this._auto_remove;
            }
            set
            {
                this._auto_remove = value;
            }
        }

        private compare_symbol _compare_symbol = compare_symbol.equal;
        /// <summary>
        /// 字段的where比较条件运算符枚举，equal, not_equal, greater, greater_equal, less, less_equal, like, contain, not_contain
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public compare_symbol compare_symbol
        {
            get
            {
                return this._compare_symbol;
            }
            set
            {
                switch (value)
                {
                    case compare_symbol.equal:
                    case compare_symbol.not_equal:
                    case compare_symbol.greater:
                    case compare_symbol.greater_equal:
                    case compare_symbol.less:
                    case compare_symbol.less_equal:
                    case compare_symbol.like:
                    case compare_symbol.begin_like:
                    case compare_symbol.end_like:
                    case compare_symbol.null_like:
                        this.build_quote = true;
                        break;
                    case compare_symbol.contain:
                    case compare_symbol.not_contain:
                        this.build_quote = false;
                        break;
                    case compare_symbol.contain_arr:
                        break;
                }
                this._compare_symbol = value;
            }
        }

        private logic_symbol _logic_symbol = logic_symbol.and;
        /// <summary>
        /// 字段的逻辑运算符，and，or
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public logic_symbol logic_symbol
        {
            get
            {
                return this._logic_symbol;
            }
            set
            {
                this._logic_symbol = value;
            }
        }

        private bool _build_quote = true;
        /// <summary>
        /// 该字段生成时是否生成单引号（'），如：where field = 'value' 或者 set field = 'value'，默认值为true
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public bool build_quote
        {
            get { return this._build_quote; }
            set { this._build_quote = value; }
        }

        private date_format_type _date_format_type = date_format_type.date_time;

        /// <summary>
        /// 时间格式化枚举，value为DateTime类型时会格式化为指定格式的时间字符串
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public date_format_type date_format_type
        {
            get { return _date_format_type; }
            set
            {
                _date_format_type = value;
                if (this._base_value is DateTime)
                {
                    build_date_string();
                }
            }
        }

        private static Random random = new Random();

        /// <summary>
        /// 运算符转换where字符串的方法
        /// </summary>
        /// <param name="show_entity_name">是否在生成SQL语句的字段时加入实体名称。 false：[字段名]   true:[表名].[字段名]</param>
        /// <returns></returns>
        internal string build_query(bool show_entity_name = false)
        {
            string build_string = "";

            string compare = compare_dic[this.compare_symbol.ToString()];
            if (this.value == null)
            {
                switch (this.compare_symbol)
                {
                    case compare_symbol.equal:
                    case compare_symbol.greater:
                    case compare_symbol.greater_equal:
                    case compare_symbol.like:
                    case compare_symbol.begin_like:
                    case compare_symbol.end_like:
                    case compare_symbol.null_like:
                    case compare_symbol.contain:
                    case compare_symbol.contain_arr:
                        compare = "is";
                        break;
                    case compare_symbol.not_equal:
                    case compare_symbol.not_contain:
                    case compare_symbol.less:
                    case compare_symbol.less_equal:
                        compare = "is not";
                        break;
                }
            }
            string quote = this.build_quote && this.value != null ? "'" : "";
            string begin_like = "", end_like = "";
            if (this.value != null)
            {
                switch (this.compare_symbol)
                {
                    case compare_symbol.like:
                        begin_like = "%"; end_like = "%";
                        break;
                    case compare_symbol.begin_like:
                        end_like = "%";
                        break;
                    case compare_symbol.end_like:
                        begin_like = "%";
                        break;
                    case compare_symbol.contain:
                    case compare_symbol.not_contain:
                        quote = "";
                        break;
                }
            }

            bool is_null_value = this.value == null;
            int right_num = is_null_value ? 0 : this.value.ToString().Count(a => a == ')');
            int num = random.Next(1 + right_num, 11 + right_num);
            string left = is_null_value ? "" : new string('(', num);
            string right = is_null_value ? "" : new string(')', num);

            //if (this.value != null)
            //{
            //    if (Regex.Replace(this.value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
            //    {
            //        throw new Exception(string.Format("实体字段{0}中疑似存在危险的字符串，请再次尝试！", this.key));
            //    }
            //}

            if (this.compare_symbol != compare_symbol.contain && this.compare_symbol != compare_symbol.not_contain)
            {
                if (this.compare_symbol != compare_symbol.contain_arr)
                {
                    build_string = string.Format(" {0} {1} {2} {3}{4}{5} ",
                        this.logic_symbol.ToString(),
                        (!show_entity_name ? "" : "[" + this.entity.entity_name + "].") + "[" + this.key + "]",
                        compare,
                        left,
                        this.value == null ? "null" : string.Format("{0}{1}{2}{3}{4}",
                            quote,
                            begin_like,
                            this.value,
                            end_like,
                            quote),
                        right
                        );
                }
                else
                {
                    build_string = string.Format(" {0} dbo.rx_contains_arr({1},'{2}',',') = 1 ", this.logic_symbol.ToString(), (!show_entity_name ? "" : "[" + this.entity.entity_name + "].") + "[" + this.key + "]", this.value);
                }
            }
            else
            {
                build_string = string.Format(" {0} {1}{2} {3}{4}{5} ",
                    this.logic_symbol.ToString(),
                    left,
                    (!show_entity_name ? "" : "[" + this.entity.entity_name + "].") + "[" + this.key + "]",
                    compare,
                    this.value == null ? "null" : string.Format("({0}{1}{2}{3}{4})",
                        quote,
                        begin_like,
                        this.value,
                        end_like,
                        quote),
                    right
                    );
            }
            return build_string;
        }

        /// <summary>
        /// 转换key=value字符串的方法
        /// </summary>
        /// <param name="show_entity_name">是否在生成SQL语句的字段时加入实体名称。 false：[字段名]   true:[表名].[字段名]</param>
        /// <returns></returns>
        internal string build_query_not_symbol(bool show_entity_name = false)
        {
            bool is_null_value = this.value == null;
            int right_num = is_null_value ? 0 : this.value.ToString().Count(a => a == ')');
            int num = random.Next(1 + right_num, 11 + right_num);
            string left = is_null_value ? "" : new string('(', num);
            string right = is_null_value ? "" : new string(')', num);
            //return new StringBuilder(!show_entity_name ? " " : " " + this.entity.entity_name + ".")
            //    .Append("[")
            //    .Append(this.key)
            //    .Append("] = " + left)
            //    .Append(this.value == null ? "null" : (this.build_quote ? "'" : "") + this.value + (this.build_quote ? "'" : ""))
            //    .Append(right + " ")
            //    .ToString();

            //if (this.value != null)
            //{
            //    if (Regex.Replace(this.value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
            //    {
            //        throw new Exception(string.Format("实体字段{0}中疑似存在危险的字符串，请再次尝试！", this.key));
            //    }
            //}

            return
            (!show_entity_name ? " " : " [" + this.entity.entity_name + "].")
            + "[" + this.key + "] = "
            + left +
            (this.value == null ? "null" : (this.build_quote ? "'" : "") + this.value + (this.build_quote ? "'" : ""))
            + right + " ";
        }
        /// <summary>
        /// 生成一个空的rx_field
        /// </summary>
        /// <param name="key"></param>
        /// <param name="entity"></param>
        /// <returns></returns>
        internal static rx_field empty(string key, rx_entity entity)
        {
            return new rx_field(key, null, entity);
        }

        internal rx_field clone()
        {
            return new rx_field(this.key, this.value, this.entity)
            {
                compare_symbol = this.compare_symbol,
                logic_symbol = this.logic_symbol,
                date_format_type = this.date_format_type,
                build_quote = this.build_quote,
                auto_remove = this.auto_remove
            };
        }

        internal rx_field clone(rx_entity entity)
        {
            return new rx_field(this.key, this.value, entity, this._date_format_type)
            {
                compare_symbol = this.compare_symbol,
                logic_symbol = this.logic_symbol,
                date_format_type = this.date_format_type,
                build_quote = this.build_quote,
                auto_remove = this.auto_remove
            };
        }

        private static Dictionary<string, string> compare_dic = new Dictionary<string, string>() { { "equal", "=" }, { "not_equal", "!=" }, { "greater", ">" }, { "greater_equal", ">=" }, { "less", "<" }, { "less_equal", "<=" }, { "like", "like" }, { "begin_like", "like" }, { "end_like", "like" }, { "null_like", "like" }, { "contain", "in" }, { "not_contain", "not in" }, { "contain_arr", "" } };

        private void build_date_string()
        {
            DateTime dateTime = (DateTime)this._base_value;
            switch (date_format_type)
            {
                case date_format_type.date_time:
                    this._value = dateTime.ToString("yyyy-MM-dd HH:mm:ss");
                    break;
                case date_format_type.year_month_day_hour_minute:
                    this._value = dateTime.ToString("yyyy-MM-dd HH:mm");
                    break;
                case date_format_type.year_month_day_hour:
                    this._value = dateTime.ToString("yyyy-MM-dd HH");
                    break;
                case date_format_type.year_month:
                    this._value = dateTime.ToString("yyyy-MM");
                    break;
                case date_format_type.hour_minute:
                    this._value = dateTime.ToString("HH:mm");
                    break;
                case date_format_type.date:
                    this._value = dateTime.ToString("yyyy-MM-dd");
                    break;
                case date_format_type.time:
                    this._value = dateTime.ToString("HH:mm:ss");
                    break;
                case date_format_type.year:
                    this._value = dateTime.Year;
                    break;
                case date_format_type.month:
                    this._value = dateTime.Month;
                    break;
                case date_format_type.day:
                    this._value = dateTime.Day;
                    break;
                case date_format_type.hour:
                    this._value = dateTime.Hour;
                    break;
                case date_format_type.minute:
                    this._value = dateTime.Minute;
                    break;
                case date_format_type.second:
                    this._value = dateTime.Second;
                    break;
                case date_format_type.day_of_week:
                    this._value = dateTime.DayOfWeek;
                    break;
                case date_format_type.day_of_year:
                    this._value = dateTime.DayOfYear;
                    break;
            }
        }

        /// <summary>
        /// 直接ToString()这个rx_field会返回value.ToString()
        /// </summary>
        /// <returns></returns>
        public override string ToString()
        {
            return this.value == null ? null : this.value.ToString();
        }
    }

    /// <summary>
    /// 字段的sql条件匹配符号
    /// equal: 等于
    /// not_equal: 不等于
    /// greater: 大于
    /// greater_equal: 大于等于
    /// less： 小于
    /// less_equal: 小于等于
    /// like: like '%value%'
    /// begin_like: like 'value%'
    /// end_like: like '%value'
    /// null_like: like 'value' 通配符自己写
    /// contain: in (value)
    /// not_contain: not in (value)
    /// contain_arr:特殊的数组包含比较
    /// </summary>
    public enum compare_symbol
    {
        /// <summary>
        /// 等值匹配
        /// </summary>
        equal,
        /// <summary>
        /// 不等值匹配
        /// </summary>
        not_equal,
        /// <summary>
        /// 大于匹配
        /// </summary>
        greater,
        /// <summary>
        /// 大于等于匹配
        /// </summary>
        greater_equal,
        /// <summary>
        /// 小于匹配
        /// </summary>
        less,
        /// <summary>
        /// 小于等于匹配
        /// </summary>
        less_equal,
        /// <summary>
        /// 模糊匹配 例:"%张%"
        /// </summary>
        like,
        /// <summary>
        /// 头模糊匹配 例:"%张"
        /// </summary>
        begin_like,
        /// <summary>
        /// 尾模糊匹配 例:"张%"
        /// </summary>
        end_like,
        /// <summary>
        /// 无通配符匹配，需要自行在value写入通配符
        /// </summary>
        null_like,
        /// <summary>
        /// 包含匹配（in）
        /// </summary>
        contain,
        /// <summary>
        /// 不包含匹配（not in）
        /// </summary>
        not_contain,
        /// <summary>
        /// 特殊包含匹配（数组与数组的交集匹配） 比如："1,2,3,4,5" 与 "2,3,4" 发生交集，"1,2,3,4,5" 与 "6,7,8" 未发生交集
        /// </summary>
        contain_arr
    }

    /// <summary>
    /// 字段sql逻辑运算符
    /// and: 并且
    /// or: 或者
    /// </summary>
    public enum logic_symbol
    {
        and, or
    }

    /// <summary>
    /// 时间格式化类型枚举
    /// </summary>
    public enum date_format_type
    {
        /// <summary>
        /// yyyy-MM-dd HH:mm:ss
        /// </summary>
        date_time,
        /// <summary>
        /// yyyy-MM-dd
        /// </summary>
        date,
        /// <summary>
        /// HH:mm:ss
        /// </summary>
        time,
        /// <summary>
        /// yyyy-MM-dd HH:mm
        /// </summary>
        year_month_day_hour_minute,
        /// <summary>
        /// yyyy-MM-dd HH
        /// </summary>
        year_month_day_hour,
        /// <summary>
        /// yyyy-MM
        /// </summary>
        year_month,
        /// <summary>
        /// HH:mm
        /// </summary>
        hour_minute,
        /// <summary>
        /// yyyy
        /// </summary>
        year,
        /// <summary>
        /// MM
        /// </summary>
        month,
        /// <summary>
        /// dd
        /// </summary>
        day,
        /// <summary>
        /// HH
        /// </summary>
        hour,
        /// <summary>
        /// mm
        /// </summary>
        minute,
        /// <summary>
        /// ss
        /// </summary>
        second,
        /// <summary>
        /// 这一天是星期几
        /// </summary>
        day_of_week,
        /// <summary>
        /// 这一年的第几天
        /// </summary>
        day_of_year
    }

}
