using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace rx
{
    /// <summary>
    /// dml操作的结果类型
    /// </summary>
    public class dml_result
    {
        /// <summary>
        /// 实例化一个dml操作结果对象
        /// </summary>
        /// <param name="entity_name">实体名称</param>
        /// <param name="result_type">dml操作结果类型</param>
        public dml_result(string entity_name, dml_command_type result_type = dml_command_type.vague)
        {
            this.result_code = dml_result_code.vague;
            this.len = 0;
            this.message = "";
            this.entity_name = entity_name;
            this.command_type = result_type;
            this._date = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        }

        private dml_result_code _result_code;

        /// <summary>
        /// dml操作结果的枚举值，success, fail, error, vague 
        /// </summary>
        public dml_result_code result_code
        {
            get { return _result_code; }
            set 
            {
                this._code = value.ToString();
                _result_code = value; 
            }
        }

        private string _code;

        /// <summary>
        /// 获取dml操作结果的枚举值字符串，"success", "fail", "error", "vague" 
        /// </summary>
        public string code
        {
            get { return _code; }
        }

        /// <summary>
        /// dml操作的影响行数
        /// </summary>
        public int len { get; set; }

        /// <summary>
        /// dml操作的信息
        /// </summary>
        public string message { get; set; }

        /// <summary>
        /// dml操作的实体名称，与数据库中对应的标明一致
        /// </summary>
        public string entity_name { get; set; }

        private dml_command_type _command_type;

        /// <summary>
        /// 执行dml操作的类型枚举值，update, delete, insert, vague
        /// </summary>
        public dml_command_type command_type
        {
            get { return _command_type; }
            set 
            {
                _command = value.ToString();
                _command_type = value; 
            }
        }

        private string _command;

        /// <summary>
        /// 获取执行dml操作的类型枚举值的字符串，"update", "delete", "insert", "vague"
        /// </summary>
        public string command
        {
            get { return _command; }
        }

        private string _date;

        /// <summary>
        /// 信息产生的时间
        /// </summary>
        public string date
        {
            get { return _date; }
        }

        /// <summary>
        /// 被执行的sql语句
        /// </summary>
        public string sql_query { get; set; }

        /// <summary>
        /// 任意存储容器属性
        /// </summary>
        public object tag { get; set; }
    }

    /// <summary>
    /// dml操作结果的枚举类型
    /// success：成功
    /// fail：失败
    /// error：异常
    /// vague：不明确的
    /// </summary>
    public enum dml_result_code
    {
        success, fail, error, vague 
    }

}
