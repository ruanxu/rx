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
    /// 这个类是rx类型orm强实体类【视图 view】的父类
    /// </summary>
    public class rx_view<T> : rx_view_base,i_rx_view<T> where T : rx_view<T>, new()
    {
        private static string _entity_name = typeof(T).Name;

        private static string _view_first_column = rx_manager.empty_view_entity_keys[_entity_name][0];//rx_manager.execute_select_sql(string.Format("SELECT top 1 column_name FROM INFORMATION_SCHEMA.columns WHERE TABLE_NAME='{0}' order by ORDINAL_POSITION", typeof(T).Name))[0]["column_name"].value.ToString();
        
        /// <summary>
        /// 实体名称
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public static string entity_name
        {
            get
            {
                return rx_view<T>._entity_name;
            }
        }

        /// <summary>
        /// 视图第一个列的名称
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public static string view_first_column
        {
            get
            {
                return rx_view<T>._view_first_column;
            }
        }

        /// <summary>
        /// 如果你继承了这个类型，那么子类必须是存在表或者视图的名字，否则会发生异常
        /// </summary>
        public rx_view() : base(rx_view<T>.entity_name) { }

        /// <summary>
        /// 泛型克隆当前这个实体的对象
        /// </summary>
        /// <returns>T</returns>
        public T clone()
        {
            return base.clone<T>();
        }

        /// <summary>
        /// 将web请求的request对象中的的值填充置这个model的rx_entity的对象中
        /// request中的key要和当前对象中的key对应才能正确填充，不一致的key将会忽略
        /// </summary>
        public T request_fill(HttpRequest request = null)
        {
            this.rx_entity.request_fill(request);
            return this as T;
        }

        /// <summary>
        /// 将web请求的request对象中的的值填充置这个model的rx_entity的对象中
        /// request中的key要和当前对象中的key对应才能正确填充，不一致的key将会忽略
        /// </summary>
        /// <param name="request">MVC项目某些情况下会使用到</param>
        /// <returns></returns>
        protected T request_fill(HttpRequestBase request)
        {
            this.rx_entity.request_fill(request);
            return this as T;
        }

        /// <summary>
        /// 默认根据实体中不为null的属性进行条件查询,也可以根据当前实体对象的where_keys属性进行指定key的where条件查询
        /// <para>where_keys参数可以多次指定参与where条件运算的key，并且可以指定顺序</para>
        /// <param name="where_keys">不传该参数就会使用所有不为null的属性进行条件查询，可以使用参数设置where_keys需要参与where条件的key,必须是当前实体中存在的key,否则会出现异常</param>
        /// </summary>
        /// <returns>满足查询条件的当前实体对象的集合</returns>
        public List<T> get_entitys(params string[] where_keys)
        {
            if (where_keys == null || where_keys.Length == 0)
            {
                where_keys = this.Keys.Join(rx_manager.empty_view_entity_keys[rx_view<T>.entity_name], a => a, b => b, (a, b) => a).Where(a => this[a].value != null).ToArray();
            }
            this.set_where_keys(where_keys);
            return rx_manager.get_entitys_by_where_keys<T>(this as T);
        }

        /// <summary>
        /// 这个方法是为了方便这个对象通过key设置rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name="key">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="compare">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name="logic">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name="date_format_type">base_value对时间数据的格式化方式</param>
        /// <param name="auto_remove">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name="build_quote">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name="value">条件语句(in或者not in)操作时因为属性id是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public T set_rx_field(string key, compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
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
            {
                List<string> do_list = new List<string>();
                do_list.AddRange(this.where_keys);
                do_list.Add(key);
                this.set_where_keys(do_list.ToArray());
            }
            return this as T;
        }

        /// <summary>
        /// 根据where条件字符串来查询这个视图
        /// </summary>
        /// <param name="where_string">例子：and id = 1 or name = 'jack'</param>
        /// <returns></returns>
        public static List<T> get_entitys_by_where_string(string where_string)
        {
            return rx_manager.get_entitys_in_view<T>(where_string);
        }

        /// <summary>
        /// 这个实体所有的对象集合
        /// </summary>
        /// <returns>实体web_user的List集合</returns>
        public static List<T> get_all_entitys()
        {
            return rx_manager.get_all_entitys<T>(rx_view<T>.entity_name);
        }

        /// <summary>
        /// 分页获取实体对象的集合
        /// </summary>
        /// <param name="page_index">页码（0开始）</param>
        /// <param name="page_size">该页数据的行数</param>
        /// <param name="order_identity_string">排序字段字符串，例子：id acs,name desc,默认值或者null时就是第一列asc排序</param>
        /// <param name="where_string">条件字符串，例子： and id = 1 and name = 'jack' </param>
        public static List<T> get_entitys_by_page(int page_index, int page_size, string order_identity_string = null, string where_string = "")
        {
            order_identity_string = order_identity_string ?? rx_view<T>.view_first_column + " asc";
            int row_count = 0;
            return rx_manager.get_entitys_by_page<T>(page_index, page_size, ref row_count, rx_view<T>.entity_name, order_identity_string, "*", where_string);
        }

        /// <summary>
        /// 分页获取实体对象的集合，可以ref总行数
        /// </summary>
        /// <param name="page_index">页码（0开始）</param>
        /// <param name="page_size">该页数据的行数</param>
        /// <param name="row_count">总数据的条数，ref引用传递</param>
        /// <param name="order_identity_string">排序字段字符串，例子：id acs,name desc,默认值或者null时就是第一列asc排序</param>
        /// <param name="where_string">条件字符串，例子： and id = 1 and name = 'jack' </param>
        public static List<T> get_entitys_by_page(int page_index, int page_size, ref int row_count, string order_identity_string = null, string where_string = "")
        {
            order_identity_string = order_identity_string ?? rx_view<T>.view_first_column + " asc";
            return rx_manager.get_entitys_by_page<T>(page_index, page_size, ref row_count, rx_view<T>.entity_name, order_identity_string, "*", where_string);
        }

        /// <summary>
        /// 为实体类强行添加一个rx_field，被添加rx_field只能通过rx_entity的键值对进行访问
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        /// <param name="value">rx_field</param>
        public T add(string key, object value)
        {
            return base.add<rx_view<T>>(key, new rx_field(key, value, this)) as T;
        }

        /// <summary>
        /// 为实体类强行删除一个rx_field，如果删除的是一个强属性，那么这个属性在使用时会发生异常
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        public T remove(string key)
        {
            return base.remove<rx_view<T>>(key) as T;
        }

        /// <summary>
        /// 设置实体的where_key属性
        /// 指定的key要存在与实体的key中
        /// </summary>
        /// <param name="where_keys"></param>
        public new T set_where_keys(params string[] where_keys)
        {
            return base.set_where_keys(where_keys) as T;
        }

        /// <summary>
        /// 删除所有的where_keys
        /// </summary>
        public new T clear_where_keys()
        {
            return base.clear_where_keys() as T;
        }

        /// <summary>
        /// 获取这个实体对象的总数量
        /// </summary>
        /// <param name="where_string">条件字符串 and id = 1 and name = 'jack'</param>
        public static int get_entity_count(string where_string = "")
        {
            return rx_manager.get_entity_count(entity_name, where_string);
        }

        /// <summary>
        /// 分页获取实体对象的集合
        /// <para>where条件根据实体字段的值与where_keys数据进行指定</para>
        /// </summary>
        /// <param name="page_index">页码（0开始）</param>
        /// <param name="page_size">该页数据的行数</param>
        /// <param name="order_identity_string">排序字段字符串，例子：id acs,name desc,默认值或者null时就是第一列asc排序</param>
        public List<T> get_page_entitys(int page_index, int page_size, string order_identity_string = null)
        {
            order_identity_string = order_identity_string ?? rx_view<T>.view_first_column + " asc";

            //如果where_keys参数为空且where_keys属性为空就根据不为空的字段进行条件查询
            if (this.where_keys == null || this.where_keys.Count == 0)
            {
                string[] where_keys = this.Keys.Join(rx_manager.empty_entity_keys[rx_view<T>._entity_name], a => a, b => b, (a, b) => a).Where(a => this[a].value != null).ToArray();
                this.set_where_keys(where_keys);
            }

            StringBuilder where_string = new StringBuilder();
            List<string> do_where_keys = this.where_keys;
            for (int i = 0; i < do_where_keys.Count; i++)
            {
                where_string.Append(this[do_where_keys[i]].build_query(false));
            }

            int row_count = 0;
            return rx_manager.get_entitys_by_page<T>(page_index, page_size, ref row_count, rx_view<T>._entity_name, order_identity_string, "*", where_string.ToString());
        }

        /// <summary>
        /// 分页获取实体对象的集合
        /// <para>where条件根据实体字段的值与where_keys数据进行指定</para>
        /// </summary>
        /// <param name="page_index">页码（0开始）</param>
        /// <param name="page_size">该页数据的行数</param>
        /// <param name="row_count">总数据的条数，ref引用传递</param>
        /// <param name="order_identity_string">排序字段字符串，例子：id acs,name desc,默认值或者null时就是第一列asc排序</param>
        public List<T> get_page_entitys(int page_index, int page_size, ref int row_count, string order_identity_string = null)
        {
            order_identity_string = order_identity_string ?? rx_view<T>.view_first_column + " asc";

            //如果where_keys参数为空且where_keys属性为空就根据不为空的字段进行条件查询
            if (this.where_keys == null || this.where_keys.Count == 0)
            {
                string[] where_keys = this.Keys.Join(rx_manager.empty_entity_keys[rx_view<T>._entity_name], a => a, b => b, (a, b) => a).Where(a => this[a].value != null).ToArray();
                this.set_where_keys(where_keys);
            }

            StringBuilder where_string = new StringBuilder();
            List<string> do_where_keys = this.where_keys;
            for (int i = 0; i < do_where_keys.Count; i++)
            {
                where_string.Append(this[do_where_keys[i]].build_query(false));
            }

            return rx_manager.get_entitys_by_page<T>(page_index, page_size, ref row_count, rx_view<T>._entity_name, order_identity_string, "*", where_string.ToString());
        }
    }

}
