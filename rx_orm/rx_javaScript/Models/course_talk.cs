using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;
using rx;

namespace rx_javaScript.Models
{
    public class course_talk : rx_model<course_talk>
    {
        /// <summary>
        /// 表或视图 course_talk 的字段 id
        /// </summary>
        public int id
        {
            get
            {
                return Convert.ToInt32(this["id"].base_value);
            }
            set
            {
                this["id"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为id的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性id是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_id_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("id", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 course_id
        /// </summary>
        public int? course_id
        {
            get
            {
                return this["course_id"].base_value as int?;
            }
            set
            {
                this["course_id"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为course_id的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性course_id是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_course_id_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("course_id", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 user_id
        /// </summary>
        public int? user_id
        {
            get
            {
                return this["user_id"].base_value == null ? null : (int?)Convert.ToInt32(this["user_id"].base_value);
            }
            set
            {
                this["user_id"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为user_id的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性user_id是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_user_id_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("user_id", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 title
        /// </summary>
        public string title
        {
            get
            {
                return this["title"].base_value as string;
            }
            set
            {
                this["title"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为title的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性title是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_title_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("title", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 content
        /// </summary>
        public string content
        {
            get
            {
                return this["content"].base_value as string;
            }
            set
            {
                this["content"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为content的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性content是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_content_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("content", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 create_time
        /// </summary>
        [JsonConverter(typeof(date_time_converter))]
        public DateTime? create_time
        {
            get
            {
                return this["create_time"].base_value as DateTime?;
            }
            set
            {
                this["create_time"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为create_time的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性create_time是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_create_time_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("create_time", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 is_back
        /// </summary>
        public int? is_back
        {
            get
            {
                return this["is_back"].base_value as int?;
            }
            set
            {
                this["is_back"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为is_back的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性is_back是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_is_back_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("is_back", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 parent_id
        /// </summary>
        public int? parent_id
        {
            get
            {
                return this["parent_id"].base_value as int?;
            }
            set
            {
                this["parent_id"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为parent_id的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性parent_id是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_parent_id_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("parent_id", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 root_id
        /// </summary>
        public int? root_id
        {
            get
            {
                return this["root_id"].base_value as int?;
            }
            set
            {
                this["root_id"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为root_id的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性root_id是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_root_id_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("root_id", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 is_top
        /// </summary>
        public int? is_top
        {
            get
            {
                return this["is_top"].base_value as int?;
            }
            set
            {
                this["is_top"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为is_top的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性is_top是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_is_top_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("is_top", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

        /// <summary>
        /// 表或视图 course_talk 的字段 img_url_list
        /// </summary>
        public string img_url_list
        {
            get
            {
                return this["img_url_list"].base_value as string;
            }
            set
            {
                this["img_url_list"].value = value;
            }
        }

        /// <summary>
        /// 这个方法是为了方便这个对象key值为img_url_list的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性img_url_list是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public course_talk set_img_url_list_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field("img_url_list", compare, logic, date_format_type, auto_remove, build_quote, value);
        }

    }
}
