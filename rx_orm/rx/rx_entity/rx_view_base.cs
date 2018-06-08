using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace rx
{
    /// <summary>
    /// 这个类是rx类型orm强实体类【视图 view】的最终基类
    /// </summary>
    public abstract class rx_view_base : rx_strong_type
    {
        internal rx_view_base(string entity_name) : base(entity_name) { }

        /// <summary>
        /// 为实体类强行添加一个rx_field，被添加rx_field只能通过rx_entity的键值对进行访问
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        /// <param name="field">rx_field</param>
        protected sealed override T add<T>(string key, rx_field field)
        {
            this.rx_entity.Add(key, field);
            return this as T;
        }

        /// <summary>
        /// 为实体类强行删除一个rx_field，如果删除的是一个强属性，那么这个属性在使用时会发生异常
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        protected sealed override T remove<T>(string key)
        {
            this.rx_entity.Remove(key);
            return this as T;
        }

        /// <summary>
        /// 设置实体的where_key属性
        /// 指定的key要存在与实体的key中
        /// </summary>
        /// <param name="where_keys"></param>
        public new rx_view_base set_where_keys(params string[] where_keys)
        {
            return base.set_where_keys(where_keys) as rx_view_base;
        }

        /// <summary>
        /// 删除所有的where_keys
        /// </summary>
        public new rx_view_base clear_where_keys()
        {
            return base.clear_where_keys() as rx_view_base;
        }

    
    }
}
