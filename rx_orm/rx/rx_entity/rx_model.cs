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
    /// 这个类是rx类型orm强实体类【表 table】的父类
    /// </summary>
    public class rx_model<T> : rx_model_base, i_rx_model<T> where T : rx_model<T>, new()
    {
        private static string _entity_name = typeof(T).Name;
        
        /// <summary>
        /// 实体名称
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public static string entity_name
        {
            get
            {
                return rx_model<T>._entity_name;
            }
        }

        /// <summary>
        /// 如果你继承了这个类型，那么子类必须是存在表或者视图的名字，否则会发生异常
        /// </summary>
        public rx_model() : base(rx_model<T>._entity_name) { }

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
            
            if (where_keys != null && where_keys.Length > 0)
            {
                //优先使用where_keys参数填充where_keys
                this.set_where_keys(where_keys);
            }
            else
            {
                //如果where_keys参数为空且where_keys属性为空就根据不为空的字段进行条件查询
                if ((where_keys == null || where_keys.Length == 0) && (this.where_keys == null || this.where_keys.Count == 0))
                {
                    where_keys = this.Keys.Join(rx_manager.empty_entity_keys[rx_model<T>.entity_name], a => a, b => b, (a, b) => a).Where(a => this[a].value != null).ToArray();
                    this.set_where_keys(where_keys);
                }
            }
            return rx_manager.get_entitys_by_where_keys<T>(this as T);
        }

        /// <summary>
        /// <para>直接根据实体对象进行添加或者修改操作</para>
        /// <para>对象的id为0或者null进行添加操作，否则会根据id进行修改操作</para>
        /// <para>添加操作时id会进行out</para>
        /// <para>如果实体is_use_null为true时，无论是添加还是修改操作null属性都会参与，默认为false</para>
        /// </summary>
        /// <returns>dml_result结果，dml_result成员请参照注释摘要</returns>
        public dml_result insert_or_update_entity()
        {
            return rx_manager.insert_or_update_entity(this);
        }

        /// <summary>
        /// 更新当前的实体对象至数据库
        /// <para>默认根据id进行更新，实体的is_user_null为false将不会使用null值的属性参与更新操作，默认为false</para>
        /// <para>如果where_key不为空就根据where_key指定字段进行where条件更新</para>
        /// <para>可以使用参数设置where_keys</para>
        /// <para>where_keys参数可以多次指定参与where条件运算的key，并且可以指定顺序</para>
        /// <param name="where_keys">需要参与where条件的key,必须是当前实体中存在的key,否则会出现异常,该参数不指定则按照id进行更新操作</param>
        /// </summary>
        /// <returns>dml_result结果，dml_result成员请参照注释摘要</returns>
        public dml_result update_entity(params string[] where_keys)
        {
            if (where_keys != null && where_keys.Length > 0)
            {
                this.set_where_keys(where_keys);
            }
            if (this.rx_entity.where_keys != null && this.rx_entity.where_keys.Count > 0)
            {
                return rx_manager.update_entity_by_where_keys(this);
            }
            return rx_manager.update_entity_by_id(this);
        }

        /// <summary>
        /// 将当前的实体对象添加至数据库，添加成功后id会进行out
        /// <para>实体的is_user_null为false将不会使用null值的属性进行添加操作，默认为false</para>
        /// </summary>
        /// <returns>dml_result结果，dml_result成员请参照注释摘要</returns>
        public dml_result insert_entity()
        {
            return rx_manager.insert_entity(this);
        }

        /// <summary>
        /// 删除当前实体在数据库中的行数据
        /// <para>默认根据id进行删除</para>
        /// <para>如果where_key不为空就根据where_key指定字段进行where条件删除</para>
        /// <para>可以使用参数设置where_keys</para>
        /// <para>where_keys参数可以多次指定参与where条件运算的key，并且可以指定顺序</para>
        /// <param name="where_keys">需要参与where条件的key,必须是当前实体中存在的key,否则会出现异常,该参数不指定则按照id进行删除操作</param>
        /// </summary>
        /// <returns>dml_result结果，dml_result成员请参照注释摘要</returns>
        public dml_result delete_entity(params string[] where_keys)
        {
            if (where_keys != null && where_keys.Length > 0)
            {
                this.set_where_keys(where_keys);
            }
            if (this.rx_entity.where_keys != null && this.rx_entity.where_keys.Count > 0)
            {
                return rx_manager.delete_entity_by_where_keys(this);
            }
            return rx_manager.delete_entity_by_id(rx_model<T>.entity_name, this["id"].value.to_int());
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
            this[key].compare_symbol = compare ?? this[key].compare_symbol;
            this[key].logic_symbol = logic ?? this[key].logic_symbol;
            this[key].date_format_type = date_format_type ?? this[key].date_format_type;
            this[key].auto_remove = auto_remove ?? this[key].auto_remove;
            this[key].build_quote = build_quote ?? this[key].build_quote;
            this[key].value = value ?? this[key].value;
            if (this.where_keys == null)
                this.where_keys = new List<string>();
            if(!this.where_keys.Contains(key))
            {
                List<string> do_list = new List<string>();
                do_list.AddRange(this.where_keys);
                do_list.Add(key);
                this.set_where_keys(do_list.ToArray());
            }
            return this as T;
        }

        /// <summary>
        /// 获取这个实体所有的对象集合
        /// </summary>
        /// <returns>实体的List集合</returns>
        public static List<T> get_all_entitys()
        {
            return rx_manager.get_all_entitys<T>(rx_model<T>.entity_name);
        }

        /// <summary>
        /// 根据id获取一个实体对象,未找到数据返回结果为null
        /// </summary>
        /// <param name="id">实体的id</param>
        /// <returns></returns>
        public static T get_entity_by_id(int id)
        {
            return rx_manager.get_entity_by_id<T>(rx_model<T>.entity_name, id);
        }

        /// <summary>
        /// 根据id的集合获取多个实体对象,未找到数据返回结果集合长度为0，id_array为传入返回结果为null
        /// </summary>
        /// <param name="id_array">实体的id的数组，params传参</param>
        public static List<T> get_entitys_in_id(params int[] id_array)
        {
            if (id_array == null || id_array.Length == 0) return null;
            return rx_manager.get_entitys_in_id<T>(id_array);
        }

        /// <summary>
        /// 根据where条件字符串来查询这个表
        /// </summary>
        /// <param name="where_string">例子：and id = 1 or name = 'jack'</param>
        /// <returns></returns>
        public static List<T> get_entitys_by_where_string(string where_string)
        {
            return rx_manager.get_entitys_by_where_string<T>(where_string);
        }

        /// <summary>
        /// 批量添加当前的实体对象
        /// </summary>
        /// <param name="entitys">实体的数组对象，params传参</param>
        /// <returns>dml_result结果，dml_result成员请参照注释摘要</returns>
        public static dml_result insert_entitys(params T[] entitys)
        {
            return rx_manager.insert_entitys(entitys);
        }

        /// <summary>
        /// 根据id的数组进行多行in删除操作
        /// <para>单行删除可以只传一个id</para>
        /// </summary>
        /// <param name="id_array">id的int类型数组，params传参</param>
        /// <returns>dml_result结果，dml_result成员请参照注释摘要</returns>
        public static dml_result delete_entity_in_id(params int[] id_array)
        {
            return rx_manager.delete_entity_in_id(rx_model<T>.entity_name, id_array);
        }

        /// <summary>
        /// 分页获取实体对象的集合
        /// </summary>
        /// <param name="page_index">页码（0开始）</param>
        /// <param name="page_size">该页数据的行数</param>
        /// <param name="order_identity_string">排序字段字符串，例子：id acs,name desc</param>
        /// <param name="where_string">条件字符串，例子： and id = 1 and name = 'jack' </param>
        /// <param name="date_time_format">date_format_type的枚举，用于对时间字段值进行指定的字符串输出格式化</param>
        public static List<T> get_entitys_by_page(int page_index, int page_size, string order_identity_string = "id asc", string where_string = "")
        {
            int row_count = 0;
            return rx_manager.get_entitys_by_page<T>(page_index, page_size, ref row_count, rx_model<T>.entity_name, order_identity_string, "*", where_string);
        }

        /// <summary>
        /// 分页获取实体对象的集合，可以ref总行数
        /// </summary>
        /// <param name="page_index">页码（0开始）</param>
        /// <param name="page_size">该页数据的行数</param>
        /// <param name="row_count">总数据的条数，ref引用传递</param>
        /// <param name="order_identity_string">排序字段字符串，例子：id acs,name desc</param>
        /// <param name="where_string">条件字符串，例子： and id = 1 and name = 'jack' </param>
        /// <param name="date_time_format">date_format_type的枚举，用于对时间字段值进行指定的字符串输出格式化</param>
        public static List<T> get_entitys_by_page(int page_index, int page_size, ref int row_count, string order_identity_string = "id asc", string where_string = "")
        {
            return rx_manager.get_entitys_by_page<T>(page_index, page_size, ref row_count, rx_model<T>.entity_name, order_identity_string, "*", where_string);
        }

        /// <summary>
        /// 为实体类强行添加一个rx_field，被添加rx_field只能通过rx_entity的键值对进行访问
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        /// <param name="value">value</param>
        public T add(string key, object value)
        {
            return base.add<rx_model<T>>(key, new rx_field(key, value, this)) as T;
        }

        /// <summary>
        /// 为实体类强行删除一个rx_field，如果删除的是一个强属性，那么这个属性在使用时会发生异常
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        public T remove(string key)
        {
            return base.remove<rx_model<T>>(key) as T;
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

    }

}
