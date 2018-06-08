using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using Newtonsoft.Json;

namespace rx
{
    /// <summary>
    /// 这个类是rx类型orm强类型的公共父类
    /// </summary>
    public abstract class rx_strong_type
    {
        internal rx_strong_type(string entity_name)
        {
            this.rx_entity = new rx_entity(entity_name);
            string[] keys = rx_manager.empty_entity_and_view_keys[entity_name];
            int length = keys.Length;
            for (int i = 0; i < length; i++)
            {
                this.rx_entity.Add(keys[i], new rx_field(keys[i], null, this.rx_entity));
            }
        }

        private rx_entity _rx_entity;

        /// <summary>
        /// 实体本质rx_entity对象
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public rx_entity rx_entity
        {
            get { return _rx_entity; }
            protected internal set { _rx_entity = value; }
        }

        /// <summary>
        /// rx_entity的Keys
        /// </summary>
        protected internal Dictionary<string, rx_field>.KeyCollection Keys { get { return this.rx_entity.Keys; } }

        /// <summary>
        /// 直接通过键值对访问rx_entity中的rx_field
        /// </summary>
        /// <param name="key">key</param>
        /// <returns>rx_field</returns>
        public rx_field this[string key]
        {
            get
            {
                return this._rx_entity[key];
            }
            set
            {
                this._rx_entity[key] = value;
            }
        }

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
            get { return this.rx_entity.command_type; }
            set { this.rx_entity.command_type = value; }
        }

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
            get { return this.rx_entity.is_use_null; }
            set { this.rx_entity.is_use_null = value; }
        }

        /// <summary>
        /// <para>获取实体的where_key属性</para>
        /// <para>强制指定在执行各类sql语句参与where子句条件查询时使用实体的哪些key</para>
        /// <para>会受到is_use_null属性的影响</para>
        /// </summary>
        [JsonIgnore]
        [ScriptIgnore]
        public List<string> where_keys
        {
            get
            {
                return this.rx_entity.where_keys;
            }
            internal set
            {
                this.rx_entity.where_keys = value;
            }
        }

        /// <summary>
        /// 设置实体的where_key属性
        /// 指定的key要存在与实体的key中
        /// </summary>
        /// <param name="where_keys"></param>
        public rx_strong_type set_where_keys(params string[] where_keys)
        {
            this.rx_entity.set_where_keys(where_keys);
            return this;
        }

        /// <summary>
        /// 删除所有的where_keys
        /// </summary>
        public rx_strong_type clear_where_keys()
        {
            this.rx_entity.clear_where_keys();
            return this;
        }

        /// <summary>
        /// 原型克隆方法
        /// </summary>
        /// <typeparam name="T">rx_model&lt;T&gt;</typeparam>
        /// <returns>rx_model&lt;T&gt;</returns>
        protected internal T clone<T>()
            where T : rx_strong_type, new()
        {
            T model = new T();
            model.command_type = this.rx_entity.command_type;
            model.is_use_null = this.rx_entity.is_use_null;
            model.rx_entity.where_keys = this.rx_entity.where_keys;
            model.rx_entity._select_display_keys = this.rx_entity._select_display_keys;

            string[] keys = this.rx_entity.Keys.ToArray();
            int length = keys.Length;
            for (int i = 0; i < length; i++)
            {
                model._rx_entity[keys[i]] = this.rx_entity[keys[i]].clone();
            }
            return model;
        }

        /// <summary>
        /// 为实体类强行添加一个rx_field，被添加rx_field只能通过rx_entity的键值对进行访问
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        /// <param name="field">rx_field</param>
        protected abstract T add<T>(string key, rx_field field)
            where T : rx_strong_type, new();

        /// <summary>
        /// 为实体类强行删除一个rx_field，如果删除的是一个强属性，那么这个属性在使用时会发生异常
        /// <para>链式操作</para>
        /// </summary>
        /// <param name="key">key</param>
        protected abstract T remove<T>(string key)
            where T : rx_strong_type, new();

    }
}
