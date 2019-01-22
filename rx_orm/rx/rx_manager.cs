/**********************************************************************
 * Author：阮旭
 * Date：  2017/07/07
 * Function：rx业务逻辑（orm）类
 * ********************************************************************/
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;
using System.Threading;
using System.Reflection;
using System.Reflection.Emit;
using Dapper;
using mvc = System.Web.Mvc;
using mvc_api = System.Web.Http;
namespace rx
{
    /// <summary>
    /// <para>rx_manager要求数据库的任何一张表必须有（int）主键</para>
    /// <para>主键字段名必须是小写的id</para>
    /// <para>主键必须是自增的(1,1)</para>
    /// <para>我觉得这个要求不过分</para>
    /// <para>----------数据手动库配置----------</para>
    /// <para>rx_dbhelper配置方法</para>  
    /// <para>配置文件appSettings配置添加一个项，key="rx_db_type" value="sql或者access"</para>
    /// <para>(sqlserver)配置文件connectionStrings配置添加一个项，name="rx_ms_sql_conn_str" value="连接字符串"</para>
    /// <para>(access)配置文件connectionStrings配置添加一个项，name="rx_ms_access_conn_str" value="连接字符串"</para>
    /// <para>sqlserver或者access 二选一即可，目前只支持这两个数据库</para>
    /// </summary>
    public sealed class rx_manager
    {
        internal const string version = "1.0.0.5";

        /// <summary>
        /// 性能模式
        /// </summary>
        public static performance_mode performance_mode { get; set; }

        private static Random random = new Random();
        /// <summary>
        /// rx_manager初始化
        /// </summary>
        private static int init = rx_manager_init();

        /// <summary>
        /// 包含整个数据库的表名与对应的空实体
        /// </summary>
        public static Dictionary<string, rx_entity> empty_entitys { get; private set; }

        /// <summary>
        /// 包含整个数据库的表名与对应的字段名称
        /// </summary>
        public static Dictionary<string, string[]> empty_entity_keys { get; private set; }

        /// <summary>
        /// 包含整个数据库的视图名称与对应的空实体
        /// </summary>
        public static Dictionary<string, rx_entity> empty_view_entitys { get; private set; }

        /// <summary>
        /// 包含整个数据库的视图名称与对应的字段名称
        /// </summary>
        public static Dictionary<string, string[]> empty_view_entity_keys { get; private set; }

        public static Dictionary<string, rx_entity> empty_entitys_and_view_entitys { get; private set; }

        /// <summary>
        /// 包含整个数据库的表和视图的名称与对应的字段名称
        /// </summary>
        public static Dictionary<string, string[]> empty_entity_and_view_keys { get; private set; }

        /// <summary>
        /// 所有用户存储过程的名称
        /// </summary>
        public static List<string> proc_names { get; private set; }

        /// <summary>
        /// rx_manager中所有的静态方法的MethodInfo的集合
        /// </summary>
        public static List<MethodInfo> method_list { get; private set; }

        /// <summary>
        /// 前端orm用于验证的md5
        /// </summary>
        public static Dictionary<string, string[]> rx_function_md5 = new Dictionary<string, string[]>()
        {
            {"get_entitys_by_page",new string[2]{"264f74f838f6e76e9b6d6b2f9a8e78c4", "ede9b7faa3a2e1a4a83efd79b8d326ee"}},
            {"get_entitys_in_view",new string[2]{"990b7b48b7aa51651d2320e6cd6251f1","1803a419ff8626942bc97ccef333a2fa"}},
            {"get_entitys_in_proc",new string[2]{"1aab4b6de4a9d1142ff005f851788141","0c7d2f5517c903e990a33f6375b61fe6"}},
            {"transaction_execute_non_query",new string[2]{"03bea2db2c1466311bce8d414f4a1352","913e7b15c54f936192d2b994a01111ff"}},
            {"execute_select_sql",new string[2]{"6b87e3b7e245dfffe013250797097354","fad64e76ea98d4d34cf9e76ba95c16ab"}},
            {"execute_non_query",new string[2]{"e729b46cceede1e136523729a7350ab3","6210fc1d82c23c55206a38e1b3d1857e"}},
            {"get_all_entitys",new string[2]{"384e6022b7aa341aea392a523c7894ff","ec3d8c9e415d7c4d767160870065c217"}},
            {"get_entity_count", new string[2]{"3794ac58797c5918ac4e404b5cdc94c7","d9fe1a63d430d5e38f0e4265acc9bb4d"}},
            {"get_entity_by_id",new string[2]{"2cee9157d4237e645350a673c4f00fef","aaf01b968208caee7225653caf9fc0f1"}},
            {"get_entitys_in_id",new string[2]{"eaa6f9c512a729b545179b7003ebad24","098dc75f718df71b50f49fdad34fc54f"}},
            {"get_entitys_by_where_keys",new string[2]{"78a8e168c0eb60dc9b504a1465e944a1","b53029a02a6d1c7158897ac973d28a4e"}},
            {"get_entitys_by_where_string",new string[2]{"1dfaefbf89d72d46d430252feda090d9","a03196003993a5e698c0a29cafabeb08"}},
            {"insert_or_update_entity",new string[2]{"5cc99996656b8f999bb03968319c00da","7404bba1782ca1eb6fc75b106ffa980c"}},
            {"insert_entity",new string[2]{"119ea80584a7727a6508641bd8c2c2ed","694572bfc706d65d047aad089d047ade"}},
            {"insert_entitys",new string[2]{"1032d074d250ab42a347b3c45ee91f0b","5e8bd5a076f394eeaf07bf13ba3b6134"}},
            {"update_entity_by_id",new string[2]{"b692830ec98ba63e5b90caf981a6d4c0","1efefa78c3098d41d11562f0f4067da1"}},
            {"update_entity_by_where_keys",new string[2]{"8003ffdac234ff2f088aa603790b00f6","6b6d2b550dda2410c75025df0d4f0174"}},
            {"delete_entity_by_id",new string[2]{"2a74003a59ea2895cdac71cbecf83ddb","beb03de2b0a906b27fc3bd385f408d18"}},
            {"delete_entity_in_id",new string[2]{"47aefe32d5dd2198623fa1e72c6c5ee5","927cff6471034fa2e9c2fdc7eb690a49"}},
            {"delete_entity_by_where_string",new string[2]{"c0fc39ac86282160fb3fd034e2287731","79e4dea231c0ef6c16d8e9a2d5db91c8"}},
            {"delete_entity_by_where_keys",new string[2]{"0dd7189fd23f8ec0cf85759e8378d8d5","6fe0e757832ab307be00c5f9b8029f04"}}
        };

        /// <summary>
        /// rx_manager初始化
        /// </summary>
        /// <returns></returns>
        private static int rx_manager_init()
        {
            rx_manager.performance_mode = rx.performance_mode.pool_first;
            empty_entitys = new Dictionary<string, rx_entity>();
            empty_entity_keys = new Dictionary<string, string[]>();

            empty_view_entitys = new Dictionary<string, rx_entity>();
            empty_view_entity_keys = new Dictionary<string, string[]>();

            empty_entitys_and_view_entitys = new Dictionary<string, rx_entity>();
            empty_entity_and_view_keys = new Dictionary<string, string[]>();


            proc_names = new List<string>();

            set_empty_entitys();
            set_empty_view_entitys();
            set_proc_names();
            create_rx_sql_object();

            get_rx_public_static_method();

            return 0;
        }

        /// <summary>
        /// 根据表名创建空实体entity_dictionary的对象,key的值是表的字段，value的值是null
        /// </summary>
        /// <param name="entity_name">表名必须是当前数据库中存在的</param>
        /// <returns></returns>
        public static rx_entity instance_entity(string entity_name)
        {
            if (empty_entitys.ContainsKey(entity_name))
            {
                return empty_entitys[entity_name].clone();
            }
            throw new Exception(string.Format("未发现表entity_name：{0}的实体！", entity_name));
        }

        private static void set_empty_entitys()
        {
            string sql = "select(Select cast(name as varchar(max)) + ',' FROM SysObjects Where XType='U' for xml path('')) names";
            string[] db_table_names = null;
            List<rx_entity> list = rx_dbhelper.instance().execute_sql_or_proc(sql, null);
            if (list[0]["names"].value == null) return;
            string str = list[0]["names"].value.ToString();
            str = str.Substring(0, str.Length - 1);
            db_table_names = str.Split(',');


            for (int i = 0; i < db_table_names.Length; i++)
            {
                rx_entity empty_entity = new rx_entity(db_table_names[i]);
                sql = string.Format("select column_name from information_schema.columns where table_name = '{0}'", db_table_names[i]);
                list = rx_dbhelper.instance().execute_sql_or_proc(sql, null);

                for (int j = 0; j < list.Count; j++)
                {
                    string column_name = list[j]["column_name"].value.ToString();
                    empty_entity.Add(column_name, rx_field.empty(column_name, empty_entity));
                }

                empty_entity_keys.Add(empty_entity.entity_name, empty_entity.Keys.ToArray());
                empty_entitys.Add(empty_entity.entity_name, empty_entity);

                empty_entity_and_view_keys.Add(empty_entity.entity_name, empty_entity.Keys.ToArray());
                empty_entitys_and_view_entitys.Add(empty_entity.entity_name, empty_entity);
            }
        }

        private static void set_empty_view_entitys()
        {
            string sql = "select(select cast(name as varchar(max)) + ',' from sysobjects where xtype='V' for xml path('')) views";
            string[] view_names = null;
            List<rx_entity> list = rx_dbhelper.instance().execute_sql_or_proc(sql, null);
            if (list[0]["views"].value == null) return;
            string value = list[0]["views"].value.ToString();
            value = value.Substring(0, value.Length - 1);
            view_names = value.Split(',');

            for (int i = 0; i < view_names.Length; i++)
            {
                sql = string.Format("select column_name from information_schema.columns where table_name = '{0}'", view_names[i]);
                list = rx_dbhelper.instance().execute_sql_or_proc(sql, null);

                rx_entity empty_entity = new rx_entity(view_names[i]);
                for (int j = 0; j < list.Count; j++)
                {
                    string column_name = list[j]["column_name"].value.ToString();
                    empty_entity.Add(column_name, rx_field.empty(column_name, empty_entity));
                }
                empty_view_entity_keys.Add(empty_entity.entity_name, empty_entity.Keys.ToArray());
                empty_view_entitys.Add(empty_entity.entity_name, empty_entity);

                empty_entity_and_view_keys.Add(empty_entity.entity_name, empty_entity.Keys.ToArray());
                empty_entitys_and_view_entitys.Add(empty_entity.entity_name, empty_entity);
            }
        }

        private static void set_proc_names()
        {
            string sql = "select name from sysobjects where xtype='P'";
            List<rx_entity> list = rx_dbhelper.instance().execute_sql_or_proc(sql, null);
            proc_names = list.Select(a => a["name"].value.ToString()).ToList();
        }

        /// <summary>
        /// 创建rx_manager所需的所有数据库对象
        /// </summary>
        private static void create_rx_sql_object()
        {
            Dictionary<string, string> result = new Dictionary<string, string>();
            bool is_create_log = false;
            //返回ID的insert存储过程
            string sql = @"if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[pro_rx_insert_entity_out_id]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
	                       drop proc [dbo].pro_rx_insert_entity_out_id";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("删除存储过程pro_rx_insert_entity_out_id", "成功");
            }
            catch (Exception ex)
            {
                result.Add("删除存储过程pro_rx_insert_entity_out_id", "失败：" + ex.Message);
                is_create_log = true;
            }

            sql = @"create proc pro_rx_insert_entity_out_id
	                @id int output,
	                @insert_sql varchar(max)
	                as
	                exec (@insert_sql)
	                set @id = @@IDENTITY";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("创建存储过程pro_rx_insert_entity_out_id", "成功");
            }
            catch (Exception ex)
            {
                result.Add("创建存储过程pro_rx_insert_entity_out_id", "失败：" + ex.Message);
                is_create_log = true;
            }

            //分页存储过程
            sql = @"if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[pro_get_data_by_page]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
	                       drop proc [dbo].pro_get_data_by_page";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("删除存储过程pro_get_data_by_page", "成功");
            }
            catch (Exception ex)
            {
                result.Add("删除存储过程pro_get_data_by_page", "失败：" + ex.Message);
                is_create_log = true;
            }

            sql = @"CREATE proc [dbo].[pro_get_data_by_page]
                  @page_index int,
                  @page_size int,
                  @row_count bigint output,
                  @table_name varchar(max),
                  @order_identity_string varchar(max),
                  @field_string varchar(max) = '*',
                  @where_string varchar(max) = ''
                  as
                  begin 
                  declare @row_countSql nvarchar(max)
                  set @row_countSql = '(select ' + @field_string + ' from ' + @table_name + ' where 1 = 1 ' + @where_string + ') innerTable
                  '
                  set @row_countSql = 'select @row_count = count(*) from 
                  ' + @row_countSql
                  exec sp_executesql @row_countSql,N'@row_count nvarchar(50) output',@row_count output

                  declare @InnerTable nvarchar(max)
                  set @InnerTable = 'select top 99999999 ' + @field_string + ' from ' + @table_name + ' where 1 = 1 
                  ' + @where_string

                  declare @OuterTable nvarchar(max)
                  set @OuterTable = 'select ROW_NUMBER() over(order by ' + @order_identity_string + ') as row_index,* from (' + @InnerTable + ') InnerTable
                  '

                  declare @CurentTable nvarchar(max)
                  set @CurentTable = 'select * from (' + @OuterTable + ') OuterTable where row_index > ' + CONVERT(varchar(100), @page_index * @page_size) + ' and row_index <= 
                  ' + CONVERT(varchar(100), (@page_index + 1) * @page_size)
                  print @CurentTable
                  exec(@CurentTable)
                  end";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("创建存储过程pro_get_data_by_page", "成功");
            }
            catch (Exception ex)
            {
                result.Add("创建存储过程pro_get_data_by_page", "失败：" + ex.Message);
                is_create_log = true;
            }

            //批量执行dml存储过程
            sql = @"if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[pro_transaction_execute_sql]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
	                       drop proc [dbo].pro_transaction_execute_sql";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("删除存储过程pro_transaction_execute_sql", "成功");
            }
            catch (Exception ex)
            {
                result.Add("删除存储过程pro_transaction_execute_sql", "失败：" + ex.Message);
                is_create_log = true;
            }

            sql = @"CREATE proc [dbo].[pro_transaction_execute_sql]
                  @sql varchar(max)
                  as
                  begin
	                  begin tran
		                  exec (@sql)
	                  if(@@error = 0)
	                  begin 
		                  commit
	                  end
	                  else 
	                  begin
		                  rollback
	                  end
                  end";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("创建存储过程pro_transaction_execute_sql", "成功");
            }
            catch (Exception ex)
            {
                result.Add("创建存储过程pro_transaction_execute_sql", "失败：" + ex.Message);
                is_create_log = true;
            }

            //获取数组长度的函数
            sql = @"if  exists (select * from sys.objects where name = 'get_str_array_length')
                    drop function [get_str_array_length]";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("删除函数get_str_array_length", "成功");
            }
            catch (Exception ex)
            {
                result.Add("删除函数get_str_array_lengt", "失败：" + ex.Message);
                is_create_log = true;
            }
            sql = @"create function get_str_array_length
                  (
                  @str varchar(max),  --要分割的字符串
                  @split varchar(10)  --分隔符号
                  )
                  returns int
                  as
                   begin
                    declare @location int
                    declare @start int
                    declare @length int
                    set @str=ltrim(rtrim(@str))
                    set @location=charindex(@split,@str)
                    set @length=1
                     while @location<>0
                       begin
                        set @start=@location+1
                        set @location=charindex(@split,@str,@start)
                        set @length=@length+1
                       end
                     return @length
                   end";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("创建函数get_str_array_length", "成功");
            }
            catch (Exception ex)
            {
                result.Add("创建函数get_str_array_lengt", "失败：" + ex.Message);
                is_create_log = true;
            }

            //判断两个数组是否包含的函数
            sql = @"if  exists (select * from sys.objects where name = 'get_str_array_str_of_index')
                    drop function [get_str_array_str_of_index]";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("删除函数get_str_array_str_of_index", "成功");
            }
            catch (Exception ex)
            {
                result.Add("删除函数get_str_array_str_of_index", "失败：" + ex.Message);
                is_create_log = true;
            }
            sql = @"create function get_str_array_str_of_index
                  (
                   @str nvarchar(max),  --要分割的字符串
                   @split varchar(10),  --分隔符号
                   @index int --取第几个元素
                  )
                  returns nvarchar(max)
                  as
                  begin
                   declare @location int
                   declare @start int
                   declare @next int
                   declare @seed int
                   set @str=ltrim(rtrim(@str))
                   set @start=1
                   set @next=1
                   set @seed=len(@split)
                   set @location=charindex(@split,@str)
                   while @location<>0 and @index>@next
                     begin
                      set @start=@location+@seed
                      set @location=charindex(@split,@str,@start)
                      set @next=@next+1
                     end
                   if @location =0 select @location =len(@str)+1
                  
                  --这儿存在两种情况：1、字符串不存在分隔符号 2、字符串中存在分隔符号，跳出while循环后，@location为0，那默认为字符串后边有一个分隔符号。
                   return substring(@str,@start,@location-@start)
                  end";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("创建函数get_str_array_str_of_index", "成功");
            }
            catch (Exception ex)
            {
                result.Add("创建函数get_str_array_str_of_index", "失败：" + ex.Message);
                is_create_log = true;
            }

            //判断两个数组是否包含的函数
            sql = @"if  exists (select * from sys.objects where name = 'rx_contains_arr')
                    drop function [rx_contains_arr]";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("删除函数rx_contains_arr", "成功");
            }
            catch (Exception ex)
            {
                result.Add("删除函数rx_contains_arr", "失败：" + ex.Message);
                is_create_log = true;
            }

            sql = @"create function rx_contains_arr(@arr_1 varchar(max), @arr_2 varchar(max), @split varchar(10))
                    returns bit
                    as
                    begin
                    	declare @len_1 int = dbo.get_str_array_length(@arr_1,@split)
                    	declare @len_2 int = dbo.get_str_array_length(@arr_2,@split)
                    	declare @result bit = 0
                    	declare @i int = 1
                    	while(@i <= @len_1)
                    	begin
                    	declare @j int = 1
                    		while(@j <= @len_2)
                    		begin
                    			if(
                    				dbo.get_str_array_str_of_index(@arr_1,@split,@i)
                    				=
                    				dbo.get_str_array_str_of_index(@arr_2,@split,@j)
                    			)
                    			begin
                    				set @result = 1
                    				break
                    			end
                    			set @j += 1
                    		end
                    		if(@result = 1) break
                    		set @i += 1
                    	end
                    
                    	return @result
                    end";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("创建函数rx_contains_arr", "成功");
            }
            catch (Exception ex)
            {
                result.Add("创建函数rx_contains_arr", "失败：" + ex.Message);
                is_create_log = true;
            }

            //将逗号分隔字符串转换为只有一个id（string）列的table函数
            sql = @"if  exists (select * from sys.objects where name = 'rx_id_table')
                    drop function [rx_id_table]";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("删除函数rx_id_table", "成功");
            }
            catch (Exception ex)
            {
                result.Add("删除函数rx_id_table", "失败：" + ex.Message);
                is_create_log = true;
            }
            sql = @"create function rx_id_table(@str varchar(max),@split varchar(100))
                    returns @tmp table
                    (
	                    id varchar(max)
                    )
                    as
                    begin
	                    declare @len int = dbo.get_str_array_length(@str, @split)
	                    declare @i int = 1
	                    while(@i <= @len)
	                    begin
		                    declare @id varchar(max) = dbo.get_str_array_str_of_index(@str, @split, @i)
		                    set @i += 1
		                    insert into @tmp values(@id)
	                    end
	                    return 
                    end";
            try
            {
                rx_dbhelper.instance().execute_non_query(sql, null);
                result.Add("创建函数rx_id_table", "成功");
            }
            catch (Exception ex)
            {
                result.Add("创建函数rx_id_table", "失败：" + ex.Message);
                is_create_log = true; 
            }

            if (is_create_log)
            {
                string log_path = System.AppDomain.CurrentDomain.SetupInformation.ApplicationBase + @"rx_manager_init_error\";

                if (!Directory.Exists(log_path))
                {
                    Directory.CreateDirectory(log_path);
                }

                using (FileStream fs = new FileStream(log_path + DateTime.Now.ToString("yyyy_MM_dd HH_mm_ss") + ".txt", FileMode.Create))
                {
                    using (StreamWriter sw = new StreamWriter(fs, Encoding.UTF8))
                    {
                        foreach (string key in result.Keys)
                        {
                            sw.WriteLine(key + "\n");
                            sw.WriteLine(result[key] + "\n");
                            sw.WriteLine("----------------------------------\n");
                        }

                        sw.Flush();
                    }
                }
            }
        }

        private static void get_rx_public_static_method()
        {
            method_list = typeof(rx_manager).GetMethods(BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Static).ToList();
        }

        #region sql操作方法
        /// <summary>
        /// 通用分页查询方法
        /// </summary>
        /// <param name="page_index">页码（从0开始）</param>
        /// <param name="page_size">页大小</param>
        /// <param name="row_count">总数据行数 ref引用</param>
        /// <param name="table_or_view_name">表的名字或者视图的名字或者子查询字符串</param>
        /// <param name="order_identity_string">排序表示列名 例子：id 或者 id,role_id 或者 id desc,role_id asc (注意：必须得填入，不能为空)</param>
        /// <param name="field_string">指定查询结果显示的字段 例子：* 或者 id,name,age,card_id</param>
        /// <param name="where_string">查询条件字符串 例子： and a = 1 and b = 2 </param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns></returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<rx_entity> get_entitys_by_page(int page_index, int page_size, ref long row_count, string table_or_view_name, string order_identity_string = "id desc", string field_string = "*", string where_string = "", date_format_type date_time_format = date_format_type.date_time)
        {
            string sql = "pro_get_data_by_page";
            SqlParameter outputPara = new SqlParameter("@row_count", row_count);
            outputPara.Direction = ParameterDirection.Output;
            SqlParameter[] paras = new SqlParameter[]
            {
                new SqlParameter("@page_index", page_index),
                new SqlParameter("@page_size", page_size),
                outputPara,
                new SqlParameter("@table_name", table_or_view_name),
                new SqlParameter("@order_identity_string", order_identity_string),
                new SqlParameter("@field_string", field_string),
                new SqlParameter("@where_string", where_string)
            };
            string entity_name = "rx_entity";
            List<rx_entity> list = rx_dbhelper.instance().execute_sql_or_proc(sql, paras, CommandType.StoredProcedure, entity_name, date_time_format);
            try
            {
                row_count = (int)outputPara.Value;
            }
            catch (Exception)
            {
                row_count = 0;
            }
            return list;
        }

        /// <summary>
        /// 通用泛型分页查询方法
        /// </summary>
        /// <typeparam name="T">rx_model_base的子类型</typeparam>
        /// <param name="page_index">页码（从0开始）</param>
        /// <param name="page_size">页大小</param>
        /// <param name="row_count">总数据行数 ref引用</param>
        /// <param name="table_or_view_name">表的名字或者视图的名字或者子查询字符串</param>
        /// <param name="order_identity_string">排序表示列名 例子：id 或者 id,role_id 或者 id desc,role_id asc (注意：必须得填入，不能为空)</param>
        /// <param name="field_string">指定查询结果显示的字段 例子：* 或者 id,name,age,card_id</param>
        /// <param name="where_string">查询条件字符串 例子： and a = 1 and b = 2 </param>
        /// <returns></returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<T> get_entitys_by_page<T>(int page_index, int page_size, ref long row_count, string table_or_view_name, string order_identity_string = "id desc", string field_string = "*", string where_string = "")
            where T : rx_strong_type, new()
        {
            string sql = "pro_get_data_by_page";
            SqlParameter outputPara = new SqlParameter("@row_count", row_count);
            outputPara.Direction = ParameterDirection.Output;
            SqlParameter[] paras = new SqlParameter[]
            {
                new SqlParameter("@page_index", page_index),
                new SqlParameter("@page_size", page_size),
                outputPara,
                new SqlParameter("@table_name", table_or_view_name),
                new SqlParameter("@order_identity_string", order_identity_string),
                new SqlParameter("@field_string", field_string),
                new SqlParameter("@where_string", where_string)
            };
            List<T> list = rx_dbhelper.instance().execute_sql_or_proc<T>(sql, paras, CommandType.StoredProcedure);

            try
            {
                row_count = (int)outputPara.Value;
            }
            catch (Exception)
            {
                row_count = 0;
            }
            return list;
        }

        /// <summary>
        /// rxui中RXtable数据所需要的特殊分页方法，返回的object对象直接序列化为json字符串返回给RXtable即可
        /// </summary>
        /// <param name="table_or_view_name">表的名字或者视图的名字</param>
        /// <param name="order_identity_string">排序表示列名 例子：id 或者 id,role_id 或者 id desc,role_id asc (注意：必须得填入，不能为空)</param>
        /// <param name="field_string">指定查询结果显示的字段 例子：* 或者 id,name,age,card_id</param>
        /// <param name="where_string">查询条件字符串 例子： and a = 1 and b = 2 </param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns>row_count=总行数，rows=数据</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static rx_table_entity get_rxtable_data(string table_or_view_name, string order_identity_string, string field_string, string where_string, date_format_type date_time_format = date_format_type.date_time)
        {
            int page_index = 0;
            try
            {
                page_index = int.Parse(HttpContext.Current.Request["page_index"]);
            }
            catch (Exception) { page_index = 0; }
            int page_size = 10;
            try
            {
                page_size = int.Parse(HttpContext.Current.Request["page_size"]);
            }
            catch (Exception) { page_size = 10; }
            long row_count = 0;
            bool look_moreing = false;
            try
            {
                look_moreing = bool.Parse(HttpContext.Current.Request["look_moreing"]);
            }
            catch (Exception)
            {
                look_moreing = false;
            }

            if (where_string == null) where_string = "";
            List<rx_entity> list = null;
            if (look_moreing == false)
            {
                list = get_entitys_by_page(page_index, page_size, ref row_count, table_or_view_name, order_identity_string, field_string, where_string, date_time_format);
            }
            else if (look_moreing == true)
            {
                int current_row_count = int.Parse(HttpContext.Current.Request["current_row_count"]);
                int look_more_number = int.Parse(HttpContext.Current.Request["look_more_num"]);
                int skipCount = page_index * page_size + current_row_count;

                int comparatively_page_index = skipCount / 5;
                int comparatively_page_size = look_more_number;
                if (current_row_count < look_more_number) comparatively_page_size = 0;
                if (current_row_count % 5 != 0)
                {
                    get_entitys_by_page(page_index, page_size, ref row_count, table_or_view_name, order_identity_string, field_string, where_string, date_time_format);
                    list = new List<rx_entity>();
                }
                else list = get_entitys_by_page(comparatively_page_index, comparatively_page_size, ref row_count, table_or_view_name, order_identity_string, field_string, where_string, date_time_format);
            }

            return new rx_table_entity()
            {
                row_count = row_count,
                rows = list
            };
        }

        /// <summary>
        /// 获取指定view（视图）的实体的entity集合对象
        /// <para>视图不存在会报错</para>
        /// </summary>
        /// <param name="view_name">视图名称</param>
        /// <param name="where_string">条件字符串</param>
        /// <param name="select_display_keys">要显示的列</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns>entity集合对象</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<rx_entity> get_entitys_in_view(string view_name, string where_string = "", date_format_type date_time_format = date_format_type.date_time, params string[] select_display_keys)
        {
            if (!empty_view_entitys.ContainsKey(view_name))
            {
                throw new Exception(string.Format("视图{0}不存在", view_name));
            }
            char c = (char)(random.Next(0, 26) + 65);
            int right_num = where_string.Count(a => a == ')');
            int num = random.Next(3 + right_num, 20 + right_num);
            string left = new string('(', num);
            string right = new string(')', num);

            //if (Regex.Replace(where_string, @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
            //{
            //    throw new Exception("where_string中疑似存在危险的字符串，请再次尝试！");
            //}

            StringBuilder keys_query = new StringBuilder();
            if (select_display_keys == null || select_display_keys.Length == 0 || select_display_keys[0].Trim() == "" || select_display_keys[0].Trim() == "*")
            {
                keys_query.Append("*");
            }
            else
            {
                select_display_keys = select_display_keys.Distinct().ToArray();
                var keys = empty_entitys_and_view_entitys[view_name].Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("实体{0}中不包含key：{1}", view_name, select_display_keys[i]));
                    }
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", c, select_display_keys[i]);
                }
            }

            string sql = string.Format("select {0} from {1} {2} where 1 = 1 and{3}1 = 1 {4}{5}", keys_query.ToString(), view_name, c, left, where_string, right);
            return rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, view_name, date_time_format);
        }

        /// <summary>
        /// 获取指定view（视图）的实体的rx_view_base集合对象
        /// <para>视图不存在会报错</para>
        /// </summary>
        /// <param name="where_string">条件字符串</param>
        /// <param name="select_display_keys">要显示的列</param>
        /// <returns>rx_view_base集合对象</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<T> get_entitys_in_view<T>(string where_string = "", params string[] select_display_keys)
            where T : rx_view_base, new()
        {
            string view_name = typeof(T).Name;
            if (!empty_view_entitys.ContainsKey(view_name))
            {
                throw new Exception(string.Format("视图{0}不存在", view_name));
            }
            char c = (char)(random.Next(0, 26) + 65);
            int right_num = where_string.Count(a => a == ')');
            int num = random.Next(3 + right_num, 20 + right_num);
            string left = new string('(', num);
            string right = new string(')', num);

            //if (Regex.Replace(where_string, @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
            //{
            //    throw new Exception("where_string中疑似存在危险的字符串，请再次尝试！");
            //}

            StringBuilder keys_query = new StringBuilder();
            if (select_display_keys == null || select_display_keys.Length == 0 || select_display_keys[0].Trim() == "" || select_display_keys[0].Trim() == "*")
            {
                keys_query.Append("*");
            }
            else
            {
                select_display_keys = select_display_keys.Distinct().ToArray();
                var keys = empty_entitys_and_view_entitys[view_name].Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("实体{0}中不包含key：{1}", view_name, select_display_keys[i]));
                    }
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", c, select_display_keys[i]);
                }
            }

            string sql = string.Format("select {0} from {1} {2} where 1 = 1 and{3}1 = 1 {4}{5}", keys_query.ToString(), view_name, c, left, where_string, right);
            return rx_dbhelper.instance().execute_sql_or_proc<T>(sql, null, CommandType.Text);
        }

        /// <summary>
        /// 获取指定proc（存储过程）的实体的entity集合对象
        /// </summary>
        /// <param name="proc_name">存储过程名称</param>
        /// <param name="proc_params">存储过程参数,参数为null或者数组长度为0，则为执行无参存储过程</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns>entity集合对象</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        [rx_risk_proc]
        public static List<rx_entity> get_entitys_in_proc(string proc_name, SqlParameter[] proc_params, date_format_type date_time_format = date_format_type.date_time)
        {
            if (!proc_names.Contains(proc_name))
            {
                throw new Exception(string.Format("存储过程：{0} 不存在，proc_name必须是一个自定创建的存储过成名称", proc_name));
            }

            if (proc_params == null) proc_params = new SqlParameter[0];

            return rx_dbhelper.instance().execute_sql_or_proc(proc_name, proc_params, CommandType.StoredProcedure, proc_name, date_time_format);
        }

        /// <summary>
        /// dml批量执行的事务方法
        /// </summary>
        /// <param name="full_sql_string">多条dml（t-sql）语句的字符串</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_proc]
        [rx_risk_delete]
        [rx_risk_update]
        [rx_risk_insert]
        public static dml_result transaction_execute_non_query(string full_sql_string)
        {
            string sql = "pro_transaction_execute_sql";

            SqlParameter[] proc_param = new SqlParameter[] 
            {
                new SqlParameter("@sql", full_sql_string)
            };
            dml_result result = new dml_result("execute_non_query", dml_command_type.vague);
            result.sql_query = full_sql_string;
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(sql, proc_param);
                result.result_code = dml_result_code.success;
                result.message = string.Format("执行成功,影响了{0}行数据！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// dml批量执行的事务方法
        /// <para>entity对象受dml_command_type属性的影响，dml_command_type的值不能是默认值vague，必须是明确的update、delete、insert，根据dml_command_type属性值动态执行dml语句</para>
        /// <para>entity对象可以指定is_use_null</para>
        /// <para>entity对象可以指定where_keys</para>
        /// <para>如果entity对象的dml_command_type属性为update或者delete且对象的where_keys属性为null或者长度为0就会以对象的id为执行条件</para>
        /// <para>entity对象的entity_name必须包含在当前数据库的表名中</para>
        /// </summary>
        /// <param name="entity_array">entity的集合,实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_proc]
        [rx_risk_delete]
        [rx_risk_update]
        [rx_risk_insert]
        public static dml_result transaction_execute_non_query(params rx_entity[] entity_array)
        {
            string sql = "pro_transaction_execute_sql";

            StringBuilder full_sql_string = new StringBuilder();

            dml_result result = new dml_result("execute_non_query", dml_command_type.vague);
            for (int i = 0; i < entity_array.Length; i++)
            {
                if (entity_array[i] == null) continue;
                rx_entity entity = entity_array[i].clone();
                if (!empty_entitys.Keys.Contains(entity.entity_name))
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("实体集合索引{0}的对象的entity_name属性:{1}在数据库的表名中不存在！", i, entity.entity_name);
                    return result;
                }
                if (entity.command_type == dml_command_type.vague)
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("实体集合索引{0}的对象的command_type属性值不能为{1}，必须是一个明确的dml_command_type值（update、delete、insert）！", i, entity.command_type.ToString());
                    return result;
                }
                filtrate_entity(entity);

                if (!entity.ContainsKey("id") && entity.command_type != dml_command_type.insert)
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format(@"实体集合索引{0}的对象中没有值为""id""的key！", i);
                    return result;
                }
                //object id = entity["id"].value;
                //if (entity["id"].auto_remove)
                //{
                //    entity.Remove("id");
                //}

                if (!entity.is_use_null)
                {
                    while (true)
                    {
                        bool reg = false;
                        foreach (string key in entity.Keys)
                        {
                            if (entity[key].value == null)
                            {
                                reg = entity.Remove(key) != null;
                                break;
                            }
                        }
                        if (!reg) break;
                    }
                }

                switch (entity.command_type)
                {
                    case dml_command_type.update:
                        full_sql_string.Append(transaction_update_string_build(entity, result, i));
                        break;
                    case dml_command_type.delete:
                        full_sql_string.Append(transaction_delete_string_build(entity, result, i));
                        break;
                    case dml_command_type.insert:
                        full_sql_string.Append(transaction_insert_string_build(entity, result, i));
                        break;
                }
                if (result.result_code == dml_result_code.fail) return result;

            }

            SqlParameter[] proc_param = new SqlParameter[] 
            {
                new SqlParameter("@sql", full_sql_string.ToString())
            };
            result.sql_query = full_sql_string.ToString();
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(sql, proc_param);
                result.result_code = dml_result_code.success;
                result.message = string.Format("执行成功,影响了{0}行数据！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// dml批量执行的事务方法
        /// <para>model对象的entity对象受dml_command_type属性的影响，dml_command_type的值不能是默认值vague，必须是明确的update、delete、insert，根据dml_command_type属性值动态执行dml语句</para>
        /// <para>model对象的entity对象可以指定is_use_null</para>
        /// <para>model对象的entity对象可以指定where_keys</para>
        /// <para>如果model对象的entity对象的dml_command_type属性为update或者delete且对象的where_keys属性为null或者长度为0就会以对象的id为执行条件</para>
        /// <para>model对象的entity_name必须包含在当前数据库的表名中</para>
        /// </summary>
        /// <param name="model_array">强实体model的集合,实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_proc]
        [rx_risk_delete]
        [rx_risk_update]
        [rx_risk_insert]
        public static dml_result transaction_execute_non_query(params rx_model_base[] model_array)
        {
            string sql = "pro_transaction_execute_sql";

            StringBuilder full_sql_string = new StringBuilder();

            dml_result result = new dml_result("execute_non_query", dml_command_type.vague);
            for (int i = 0; i < model_array.Length; i++)
            {
                if (model_array[i] == null) continue;
                rx_entity entity = model_array[i].rx_entity.clone();
                if (!empty_entitys.Keys.Contains(entity.entity_name))
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("实体集合索引{0}的对象的entity_name属性:{1}在数据库的表名中不存在！", i, entity.entity_name);
                    return result;
                }
                if (entity.command_type == dml_command_type.vague)
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("实体集合索引{0}的对象的command_type属性值不能为{1}，必须是一个明确的dml_command_type值（update、delete、insert）！", i, entity.command_type.ToString());
                    return result;
                }
                filtrate_entity(entity);

                if (!entity.ContainsKey("id") && entity.command_type != dml_command_type.insert)
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format(@"实体集合索引{0}的对象中没有值为""id""的key！", i);
                    return result;
                }

                //object id = entity["id"].value;
                //if (entity["id"].auto_remove)
                //{
                //    entity.Remove("id");
                //}


                if (!entity.is_use_null)
                {
                    while (true)
                    {
                        bool reg = false;
                        foreach (string key in entity.Keys)
                        {
                            if (entity[key].value == null)
                            {
                                reg = entity.Remove(key) != null;
                                break;
                            }
                        }
                        if (!reg) break;
                    }
                }

                switch (entity.command_type)
                {
                    case dml_command_type.update:
                        full_sql_string.Append(transaction_update_string_build(entity, result, i));
                        break;
                    case dml_command_type.delete:
                        full_sql_string.Append(transaction_delete_string_build(entity, result, i));
                        break;
                    case dml_command_type.insert:
                        full_sql_string.Append(transaction_insert_string_build(entity, result, i));
                        break;
                }
                if (result.result_code == dml_result_code.fail) return result;

            }

            SqlParameter[] proc_param = new SqlParameter[] 
            {
                new SqlParameter("@sql", full_sql_string.ToString())
            };
            result.sql_query = full_sql_string.ToString();
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(sql, proc_param);
                result.result_code = dml_result_code.success;
                result.message = string.Format("执行成功,影响了{0}行数据！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        private static string transaction_update_string_build(rx_entity entity, dml_result result, int i)
        {
            StringBuilder sql = new StringBuilder(string.Format(" update {0} set ", entity.entity_name));
            StringBuilder where_query = new System.Text.StringBuilder();
            StringBuilder entity_query = new StringBuilder();
            if (entity.where_keys == null || entity.where_keys.Count == 0)
            {
                int right_num = entity["id"].ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = new string('(', num);
                string right = new string(')', num);
                //if (Regex.Replace(id.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                //{
                //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                //}
                where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].ToString(), right);
            }
            else
            {
                foreach (string where_key in entity.where_keys)
                {
                    if (entity.Keys.Contains(where_key))
                    {
                        if (where_query.Length == 0)
                        {
                            where_query.Append(entity[where_key].build_query(false).Replace(entity[where_key].logic_symbol.ToString(), "where"));
                        }
                        else
                        {
                            where_query.Append(entity[where_key].build_query(false));
                        }
                        entity.Remove(where_key);
                    }
                    else if (where_key == "id")
                    {
                        int right_num = entity["id"].ToString().ToString().Count(a => a == ')');
                        int num = random.Next(3 + right_num, 11 + right_num);
                        string left = new string('(', num);
                        string right = new string(')', num);
                        //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                        //{
                        //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                        //}
                        if (where_query.Length == 0)
                        {
                            where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                        else
                        {
                            where_query.AppendFormat(" and id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                    }
                    else
                    {
                        result.result_code = dml_result_code.fail;
                        result.message = string.Format("实体集合索引{0}的对象中where_keys属性中的值{1}在实体{2}中不存在,或者实体对象的is_use_null值为false而该key的值也为null！", i, where_key, entity.entity_name);
                        return "";
                    }
                }
            }

            if (entity.ContainsKey("id") && entity["id"].auto_remove)
            {
                entity.Remove("id");
            }

            foreach (string key in entity.Keys)
            {
                if (entity_query.Length > 0) entity_query.Append(",");
                entity_query.Append(entity[key].build_query_not_symbol(false));
            }
            if (entity_query.Length == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = string.Format("实体集合索引{0}的对象中需要修改操作的字段都为null或者不存在,或者实体对象的is_use_null值为false而需要修改的key值也为null！", i);
                return "";
            }
            sql.Append(entity_query.ToString());
            sql.Append(where_query.ToString());

            return sql.ToString();
        }

        private static string transaction_delete_string_build(rx_entity entity, dml_result result, int i)
        {
            StringBuilder sql = new StringBuilder(string.Format(" delete from {0} ", entity.entity_name));
            StringBuilder where_query = new System.Text.StringBuilder();

            if (entity.where_keys == null || entity.where_keys.Count == 0)
            {
                int right_num = entity["id"].ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = new string('(', num);
                string right = new string(')', num);
                //if (Regex.Replace(id.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                //{
                //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                //}
                where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].ToString(), right);
            }
            else
            {
                foreach (string where_key in entity.where_keys)
                {
                    if (entity.Keys.Contains(where_key))
                    {
                        if (where_query.Length == 0)
                        {
                            where_query.Append(entity[where_key].build_query(false).Replace(entity[where_key].logic_symbol.ToString(), "where"));
                        }
                        else
                        {
                            where_query.Append(entity[where_key].build_query(false));
                        }
                        entity.Remove(where_key);
                    }
                    else if (where_key == "id")
                    {
                        int right_num = entity["id"].ToString().Count(a => a == ')');
                        int num = random.Next(3 + right_num, 11 + right_num);
                        string left = new string('(', num);
                        string right = new string(')', num);
                        //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                        //{
                        //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                        //}
                        if (where_query.Length == 0)
                        {
                            where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                        else
                        {
                            where_query.AppendFormat(" and id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                    }
                    else
                    {
                        result.result_code = dml_result_code.fail;
                        result.message = string.Format("实体集合索引{0}的对象中where_keys属性中的值{1}在实体{2}中不存在,或者实体对象的is_use_null值为false而该key的值也为null！", i, where_key, entity.entity_name);
                        return "";
                    }
                }
            }
            sql.Append(where_query.ToString());

            return sql.ToString();
        }

        private static string transaction_insert_string_build(rx_entity entity, dml_result result, int i)
        {
            if (entity.ContainsKey("id") && entity["id"].auto_remove)
            {
                entity.Remove("id");
            }
            StringBuilder insert_field = new StringBuilder();
            StringBuilder insert_value = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                bool is_null_value = entity[key].value == null;
                int right_num = is_null_value ? 0 : entity[key].value.ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = is_null_value ? "" : new string('(', num);
                string right = is_null_value ? "" : new string(')', num);
                if (entity[key].value != null)
                {
                    //if (Regex.Replace(entity[key].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                    //{
                    //    throw new Exception(string.Format("实体的字段{0}中疑似存在危险的字符串，请再次尝试！", key));
                    //}
                    if (insert_field.Length > 0)
                    {
                        insert_field.Append(",");
                        insert_value.Append(",");
                    }
                    insert_field.Append("[" + key + "]");
                    insert_value.AppendFormat("{0}{1}{2}{3}{4}", left, entity[key].build_quote ? "'" : "", entity[key].value, entity[key].build_quote ? "'" : "", right);
                }
                else
                {
                    if (entity.is_use_null)
                    {
                        if (insert_field.Length > 0)
                        {
                            insert_field.Append(",");
                            insert_value.Append(",");
                        }
                        insert_field.Append("[" + key + "]");
                        insert_value.Append("null");
                    }
                }
            }

            if (insert_field.Length == 0 || insert_value.Length == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = string.Format("实体集合索引{0}的对象中所有需要进行添加操作的key中的值都为null,或者实体对象的is_use_null值为false而该key的值也为null！", i);
                return "";
            }

            return string.Format(" insert {0} ({1}) values({2}) ", entity.entity_name, insert_field, insert_value);
        }

        /// <summary>
        /// 查询用
        /// </summary>
        private static void filtrate_entity(rx_entity entity)
        {
            while (true)
            {
                bool reg = false;
                foreach (string key in entity.Keys)
                {
                    if (!empty_entitys_and_view_entitys[entity.entity_name].ContainsKey(key))
                    {
                        reg = entity.Remove(key) != null;
                        break;
                    }
                }
                if (!reg) break;
            }
        }

        /// <summary>
        /// dml用
        /// </summary>
        private static dml_result filtrate_entity(rx_entity entity, dml_command_type command_type)
        {
            dml_result result = new dml_result(entity.entity_name, command_type);
            if (!empty_entitys.Keys.Contains(entity.entity_name))
            {
                result.message = string.Format("实体的表名：{0}在数据库中不存在", entity.entity_name);
                result.result_code = dml_result_code.fail;
                return result;
            }

            while (true)
            {
                bool reg = false;
                foreach (string key in entity.Keys)
                {
                    if (!empty_entitys[entity.entity_name].ContainsKey(key))
                    {
                        reg = entity.Remove(key) != null;
                        break;
                    }
                }
                if (!reg) break;
            }

            return result;
        }

        /// <summary>
        /// 根据该实体的内容生成update语句
        /// <para>如：update table_name set a = 1,b = 2,c = 3 [where d = 1 and e = 2 or f = 3]</para>
        /// </summary>
        /// <param name="entity">会根据这个实体的机构和属性进行生成</param>
        /// <param name="result">生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成</param>
        /// <returns></returns>
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        public static string transaction_update_string_build(rx_entity entity, dml_result result = null)
        {
            if (result == null) result = new dml_result("update", dml_command_type.update);
            entity = entity.clone();
            StringBuilder sql = new StringBuilder(string.Format(" update {0} set ", entity.entity_name));
            StringBuilder where_query = new System.Text.StringBuilder();
            StringBuilder entity_query = new StringBuilder();
            if (entity.where_keys == null || entity.where_keys.Count == 0)
            {
                if (!entity.ContainsKey("id"))
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("实体对象where_keys属性为null并且不存在key为id的值！");
                    return "";
                }
                int right_num = entity["id"].value.ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = new string('(', num);
                string right = new string(')', num);
                //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                //{
                //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                //}
                where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                entity.Remove("id");
            }
            else
            {
                foreach (string where_key in entity.where_keys)
                {
                    if (entity.Keys.Contains(where_key))
                    {
                        if (where_query.Length == 0)
                        {
                            where_query.Append(entity[where_key].build_query(false).Replace(entity[where_key].logic_symbol.ToString(), "where"));
                        }
                        else
                        {
                            where_query.Append(entity[where_key].build_query(false));
                        }
                        entity.Remove(where_key);
                    }
                    else if (where_key == "id")
                    {
                        int right_num = entity["id"].ToString().Count(a => a == ')');
                        int num = random.Next(3 + right_num, 11 + right_num);
                        string left = new string('(', num);
                        string right = new string(')', num);
                        //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                        //{
                        //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                        //}
                        if (where_query.Length == 0)
                        {
                            where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                        else
                        {
                            where_query.AppendFormat(" and id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                    }
                    else
                    {
                        result.result_code = dml_result_code.fail;
                        result.message = string.Format("实体对象中where_keys属性中的值{0}在实体{1}中不存在,或者实体对象的is_use_null值为false而该key的值也为null！", where_key, entity.entity_name);
                        return "";
                    }
                }
            }
            if (entity.ContainsKey("id") && entity["id"].auto_remove)
            {
                entity.Remove("id");
            }
            foreach (string key in entity.Keys)
            {
                if (entity[key].value != null || entity[key].value == null && entity.is_use_null)
                {
                    if (entity_query.Length > 0) entity_query.Append(",");
                    entity_query.Append(entity[key].build_query_not_symbol(false));
                }
            }
            if (entity_query.Length == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = string.Format("实体对象中需要修改操作的字段都为null或者不存在,或者实体对象的is_use_null值为false而需要修改的key值也为null！");
                return "";
            }
            sql.Append(entity_query.ToString());
            sql.Append(where_query.ToString());

            result.result_code = dml_result_code.success;

            return sql.ToString();
        }

        /// <summary>
        /// 根据该实体的内容生成update语句
        /// <para>如：update table_name set a = 1,b = 2,c = 3 [where d = 1 and e = 2 or f = 3]</para>
        /// </summary>
        /// <param name="model">会根据这个实体的机构和属性进行生成</param>
        /// <param name="result">生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成</param>
        /// <returns></returns>
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        public static string transaction_update_string_build(rx_model_base model, dml_result result = null)
        {
            rx_entity entity = model.rx_entity;
            if (result == null) result = new dml_result("update", dml_command_type.update);
            entity = entity.clone();
            StringBuilder sql = new StringBuilder(string.Format(" update {0} set ", entity.entity_name));
            StringBuilder where_query = new System.Text.StringBuilder();
            StringBuilder entity_query = new StringBuilder();
            if (entity.where_keys == null || entity.where_keys.Count == 0)
            {
                if (!entity.ContainsKey("id"))
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("实体对象where_keys属性为null并且不存在key为id的值！");
                    return "";
                }
                int right_num = entity["id"].ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = new string('(', num);
                string right = new string(')', num);
                //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                //{
                //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                //}
                where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                entity.Remove("id");
            }
            else
            {
                foreach (string where_key in entity.where_keys)
                {
                    if (entity.Keys.Contains(where_key))
                    {
                        if (where_query.Length == 0)
                        {
                            where_query.Append(entity[where_key].build_query(false).Replace(entity[where_key].logic_symbol.ToString(), "where"));
                        }
                        else
                        {
                            where_query.Append(entity[where_key].build_query(false));
                        }
                        entity.Remove(where_key);
                    }
                    else if (where_key == "id")
                    {
                        int right_num = entity["id"].ToString().Count(a => a == ')');
                        int num = random.Next(3 + right_num, 11 + right_num);
                        string left = new string('(', num);
                        string right = new string(')', num);
                        //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                        //{
                        //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                        //}
                        if (where_query.Length == 0)
                        {
                            where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                        else
                        {
                            where_query.AppendFormat(" and id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                    }
                    else
                    {
                        result.result_code = dml_result_code.fail;
                        result.message = string.Format("实体对象中where_keys属性中的值{0}在实体{1}中不存在,或者实体对象的is_use_null值为false而该key的值也为null！", where_key, entity.entity_name);
                        return "";
                    }
                }
            }
            if (entity.ContainsKey("id") && entity["id"].auto_remove)
            {
                entity.Remove("id");
            }
            foreach (string key in entity.Keys)
            {
                if (entity[key].value != null || entity[key].value == null && entity.is_use_null)
                {
                    if (entity_query.Length > 0) entity_query.Append(",");
                    entity_query.Append(entity[key].build_query_not_symbol(false));
                }
            }
            if (entity_query.Length == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = string.Format("实体对象中需要修改操作的字段都为null或者不存在,或者实体对象的is_use_null值为false而需要修改的key值也为null！");
                return "";
            }
            sql.Append(entity_query.ToString());
            sql.Append(where_query.ToString());

            result.result_code = dml_result_code.success;

            return sql.ToString();
        }

        /// <summary>
        /// 根据该实体的内容生成delete语句
        /// <para>如 :delete from table_name [where a = 1 and b = 2 or c = 3]</para>
        /// </summary>
        /// <param name="entity">会根据这个实体的机构和属性进行生成</param>
        /// <param name="result">生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成</param>
        /// <returns></returns>
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_delete]
        public static string transaction_delete_string_build(rx_entity entity, dml_result result = null)
        {
            if (result == null) result = new dml_result("delete", dml_command_type.delete);
            entity = entity.clone();
            StringBuilder sql = new StringBuilder(string.Format(" delete from {0} ", entity.entity_name));
            StringBuilder where_query = new System.Text.StringBuilder();

            if (entity.where_keys == null || entity.where_keys.Count == 0)
            {
                if (entity.Keys.Contains("id"))
                {
                    int right_num = entity["id"].ToString().Count(a => a == ')');
                    int num = random.Next(3 + right_num, 11 + right_num);
                    string left = new string('(', num);
                    string right = new string(')', num);
                    //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                    //{
                    //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                    //}
                    where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                }
                else
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("实体对象的key中不存在id！");
                    return "";
                }
            }
            else
            {
                foreach (string where_key in entity.where_keys)
                {
                    if (entity.Keys.Contains(where_key))
                    {
                        if (where_query.Length == 0)
                        {
                            where_query.Append(entity[where_key].build_query(false).Replace(entity[where_key].logic_symbol.ToString(), "where"));
                        }
                        else
                        {
                            where_query.Append(entity[where_key].build_query(false));
                        }
                        entity.Remove(where_key);
                    }
                    else if (where_key == "id")
                    {
                        int right_num = entity["id"].ToString().Count(a => a == ')');
                        int num = random.Next(3 + right_num, 11 + right_num);
                        string left = new string('(', num);
                        string right = new string(')', num);
                        //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                        //{
                        //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                        //}
                        if (where_query.Length == 0)
                        {
                            where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                        else
                        {
                            where_query.AppendFormat(" and id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                    }
                    else
                    {
                        result.result_code = dml_result_code.fail;
                        result.message = string.Format("实体对象中where_keys属性中的值{0}在实体{1}中不存在,或者实体对象的is_use_null值为false而该key的值也为null！", where_key, entity.entity_name);
                        return "";
                    }
                }
            }
            sql.Append(where_query.ToString());

            result.result_code = dml_result_code.success;

            return sql.ToString();
        }

        /// <summary>
        /// 根据该实体的内容生成delete语句
        /// <para>如 :delete from table_name [where a = 1 and b = 2 or c = 3]</para>
        /// </summary>
        /// <param name="model">会根据这个实体的机构和属性进行生成</param>
        /// <param name="result">生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成</param>
        /// <returns></returns>
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_delete]
        public static string transaction_delete_string_build(rx_model_base model, dml_result result = null)
        {
            rx_entity entity = model.rx_entity;
            if (result == null) result = new dml_result("delete", dml_command_type.delete);
            entity = entity.clone();
            StringBuilder sql = new StringBuilder(string.Format(" delete from {0} ", entity.entity_name));
            StringBuilder where_query = new System.Text.StringBuilder();

            if (entity.where_keys == null || entity.where_keys.Count == 0)
            {
                if (entity.Keys.Contains("id"))
                {
                    int right_num = entity["id"].ToString().Count(a => a == ')');
                    int num = random.Next(3 + right_num, 11 + right_num);
                    string left = new string('(', num);
                    string right = new string(')', num);
                    //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                    //{
                    //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                    //}
                    where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                }
                else
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("实体对象的key中不存在id！");
                    return "";
                }
            }
            else
            {
                foreach (string where_key in entity.where_keys)
                {
                    if (entity.Keys.Contains(where_key))
                    {
                        if (where_query.Length == 0)
                        {
                            where_query.Append(entity[where_key].build_query(false).Replace(entity[where_key].logic_symbol.ToString(), "where"));
                        }
                        else
                        {
                            where_query.Append(entity[where_key].build_query(false));
                        }
                        entity.Remove(where_key);
                    }
                    else if (where_key == "id")
                    {
                        int right_num = entity["id"].ToString().Count(a => a == ')');
                        int num = random.Next(3 + right_num, 11 + right_num);
                        string left = new string('(', num);
                        string right = new string(')', num);
                        //if (Regex.Replace(entity["id"].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                        //{
                        //    throw new Exception("实体的字段id中疑似存在危险的字符串，请再次尝试！");
                        //}
                        if (where_query.Length == 0)
                        {
                            where_query.AppendFormat(" where id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                        else
                        {
                            where_query.AppendFormat(" and id = {0}'{1}'{2} ", left, entity["id"].value, right);
                        }
                    }
                    else
                    {
                        result.result_code = dml_result_code.fail;
                        result.message = string.Format("实体对象中where_keys属性中的值{0}在实体{1}中不存在,或者实体对象的is_use_null值为false而该key的值也为null！", where_key, entity.entity_name);
                        return "";
                    }
                }
            }
            sql.Append(where_query.ToString());

            result.result_code = dml_result_code.success;

            return sql.ToString();
        }

        /// <summary>
        /// 根据该实体的内容生成insert语句
        /// <para>如 :insert table_name (a,b,c) values('1','2','3')</para>
        /// </summary>
        /// <param name="entity">会根据这个实体的机构和属性进行生成</param>
        /// <param name="result">生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成</param>
        /// <returns></returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [rx_risk_insert]
        public static string transaction_insert_string_build(rx_entity entity, dml_result result = null)
        {
            if (result == null) result = new dml_result("insert", dml_command_type.insert);
            StringBuilder insert_field = new StringBuilder();
            StringBuilder insert_value = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                bool is_null_value = entity[key].value == null;
                int right_num = is_null_value ? 0 : entity[key].value.ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = is_null_value ? "" : new string('(', num);
                string right = is_null_value ? "" : new string(')', num);
                if (entity[key].value != null)
                {
                    if (key != "id")
                    {
                        //if (Regex.Replace(entity[key].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                        //{
                        //    throw new Exception(string.Format("实体的字段{0}中疑似存在危险的字符串，请再次尝试！", key));
                        //}
                        if (insert_field.Length > 0)
                        {
                            insert_field.Append(",");
                            insert_value.Append(",");
                        }
                        insert_field.Append("[" + key + "]");
                        insert_value.AppendFormat("{0}{1}{2}{3}{4}", left, entity[key].build_quote ? "'" : "", entity[key].value, entity[key].build_quote ? "'" : "", right);
                    }
                }
                else
                {
                    if (entity.is_use_null && key != "id")
                    {
                        if (insert_field.Length > 0)
                        {
                            insert_field.Append(",");
                            insert_value.Append(",");
                        }
                        insert_field.Append("[" + key + "]");
                        insert_value.Append("null");
                    }
                }
            }

            if (insert_field.Length == 0 || insert_value.Length == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = string.Format("实体的对象中所有需要进行添加操作的key中的值都为null,或者实体对象的is_use_null值为false而该key的值也为null！");
                return "";
            }

            result.result_code = dml_result_code.success;

            return string.Format(" insert {0} ({1}) values({2}) ", entity.entity_name, insert_field, insert_value);
        }

        /// <summary>
        /// 根据该实体的内容生成insert语句
        /// <para>如 :insert table_name (a,b,c) values('1','2','3')</para>
        /// </summary>
        /// <param name="model">会根据这个实体的机构和属性进行生成</param>
        /// <param name="result">生成过程中产生的结果，只要dml_result_code不为fail就是正确的生成</param>
        /// <returns></returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [rx_risk_insert]
        public static string transaction_insert_string_build(rx_model_base model, dml_result result = null)
        {
            rx_entity entity = model.rx_entity;
            if (result == null) result = new dml_result("insert", dml_command_type.insert);
            StringBuilder insert_field = new StringBuilder();
            StringBuilder insert_value = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                bool is_null_value = entity[key].value == null;
                int right_num = is_null_value ? 0 : entity[key].value.ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = is_null_value ? "" : new string('(', num);
                string right = is_null_value ? "" : new string(')', num);
                if (entity[key].value != null)
                {
                    if (key != "id")
                    {
                        //if (Regex.Replace(entity[key].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                        //{
                        //    throw new Exception(string.Format("实体的字段{0}中疑似存在危险的字符串，请再次尝试！", key));
                        //}
                        if (insert_field.Length > 0)
                        {
                            insert_field.Append(",");
                            insert_value.Append(",");
                        }
                        insert_field.Append("[" + key + "]");
                        insert_value.AppendFormat("{0}{1}{2}{3}{4}", left, entity[key].build_quote ? "'" : "", entity[key].value, entity[key].build_quote ? "'" : "", right);
                    }
                }
                else
                {
                    if (entity.is_use_null && key != "id")
                    {
                        if (insert_field.Length > 0)
                        {
                            insert_field.Append(",");
                            insert_value.Append(",");
                        }
                        insert_field.Append("[" + key + "]");
                        insert_value.Append("null");
                    }
                }
            }

            if (insert_field.Length == 0 || insert_value.Length == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = string.Format("实体的对象中所有需要进行添加操作的key中的值都为null,或者实体对象的is_use_null值为false而该key的值也为null！");
                return "";
            }

            result.result_code = dml_result_code.success;

            return string.Format(" insert {0} ({1}) values({2}) ", entity.entity_name, insert_field, insert_value);
        }

        /// <summary>
        /// 执行sql查询并带有时间格式化参数
        /// <para>临时列要指定列名</para>
        /// </summary>
        /// <param name="sql">只能写查询sql，你可以试一下注入看看</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns></returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<rx_entity> execute_select_sql(string sql, date_format_type date_time_format = date_format_type.date_time)
        {
            char c = (char)(random.Next(0, 26) + 65);
            int right_num = sql.Count(a => a == ')');
            int num = random.Next(3 + right_num, 20 + right_num);
            string left = new string('(', num);
            string right = new string(')', num);

            //if (Regex.Replace(sql, @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Replace(" ", "").Contains(right))
            //{
            //    throw new Exception("sql中疑似存在危险的字符串，请再次尝试！");
            //}


            string check_sql = sql.Replace(" ", "").Replace("　", "").ToLower();

            if (check_sql.Substring(0, 14) == "selectdistinct" && check_sql.Substring(14, 3) != "top")
            {
                int index1 = sql.ToLower().IndexOf("select");
                int index2 = sql.ToLower().IndexOf("distinct");

                sql = sql.Insert(14 + index2 - 6 + index1, " top(999999999) ");
            }
            else if (check_sql.Substring(0, 6) == "select" && check_sql.Substring(6, 3) != "top")
            {
                int index1 = sql.ToLower().IndexOf("select");

                sql = sql.Insert(6 + index1, " top(999999999) ");
            }

            sql = string.Format("select * from {0}{1}{2} execute_select_sql", left, sql, right);

            return rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, "rx_entity", date_time_format);
        }

        /// <summary>
        /// 执行sql增删改（或者存储过程）
        /// <para>这个方法多条dml语句同时执行没有事务机制</para>
        /// <para>建议使用transaction_execute_non_query</para>
        /// </summary>
        /// <param name="sql_or_proc_name">dml字符串</param>
        /// <param name="param_array">SqlParameter数组，null就是执行无参存储过程</param>
        /// <param name="command_type">CommandType不解释了</param>
        /// <returns></returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_delete]
        [rx_risk_update]
        [rx_risk_insert]
        public static dml_result execute_non_query(string sql_or_proc_name, SqlParameter[] param_array = null, CommandType command_type = CommandType.StoredProcedure)
        {
            dml_result result = new dml_result(null, dml_command_type.vague);

            result.sql_query = sql_or_proc_name;
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(sql_or_proc_name, param_array, command_type);
                result.result_code = dml_result_code.success;
                result.message = string.Format("执行成功,影响了{0}行！", result.len);
                if (param_array != null)
                {
                    Dictionary<string, object> output = new Dictionary<string, object>();
                    for (int i = 0; i < param_array.Length; i++)
                    {
                        if (param_array[i].Direction != ParameterDirection.Input)
                        {
                            output.Add(param_array[i].ParameterName, param_array[i].Value);
                        }
                    }
                    result.tag = output;
                }
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// <para>直接根据表名或者视图获取对应实体的所有对象</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// </summary>
        /// <param name="table_or_view_name">表名或视图名称</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns>rx_entity集合对象</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<rx_entity> get_all_entitys(string table_or_view_name, date_format_type date_time_format = date_format_type.date_time)
        {
            if (table_or_view_name == null)
                throw new Exception("table_or_view_name 不能为空！");
            if (!empty_entitys_and_view_entitys.Keys.Contains(table_or_view_name) && !empty_view_entitys.Keys.Contains(table_or_view_name))
                throw new Exception(string.Format("表或者视图：{0}不存在", table_or_view_name));

            string sql = string.Format("select * from {0}", table_or_view_name);

            return rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, table_or_view_name, date_time_format);
        }

        /// <summary>
        /// <para>直接根据表名或者视图获取对应实体的所有对象</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// </summary>
        /// <typeparam name="T">rx_model_base的子类</typeparam>
        /// <param name="table_or_view_name">表名或视图名称</param>
        /// <returns>rx_entity集合对象</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<T> get_all_entitys<T>(string table_or_view_name)
            where T : rx_strong_type, new()
        {
            if (table_or_view_name == null)
                throw new Exception("table_or_view_name 不能为空！");
            if (!empty_entitys_and_view_entitys.Keys.Contains(table_or_view_name) && !empty_view_entitys.Keys.Contains(table_or_view_name))
                throw new Exception(string.Format("表或者视图：{0}不存在", table_or_view_name));

            string sql = string.Format("select * from {0}", table_or_view_name);

            return rx_dbhelper.instance().execute_sql_or_proc<T>(sql, null, CommandType.Text);
        }

        /// <summary>
        /// <para>直接根据表名或者视图获取对应实体的所有对象</para>
        /// </summary>
        /// <param name="table_or_view_name">表或者视图的名字</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <param name="select_display_keys">指定需要显示的列名，空为*，不存在会出现异常</param>
        /// <returns>entity集合对象</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<rx_entity> get_all_entitys(string table_or_view_name, date_format_type date_time_format = date_format_type.date_time, params string[] select_display_keys)
        {
            if (table_or_view_name == null)
                throw new Exception("table_or_view_name 不能为空！");
            if (!empty_entitys_and_view_entitys.Keys.Contains(table_or_view_name) && !empty_view_entitys.Keys.Contains(table_or_view_name))
                throw new Exception(string.Format("表或者视图：{0}不存在", table_or_view_name));

            StringBuilder keys_query = new StringBuilder();
            if (select_display_keys == null || select_display_keys.Length == 0 || select_display_keys[0].Trim() == "" || select_display_keys[0].Trim() == "*")
            {
                keys_query.Append("*");
            }
            else
            {
                select_display_keys = select_display_keys.Distinct().ToArray();
                var keys = empty_entitys_and_view_entitys[table_or_view_name].Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("实体{0}中不包含key：{1}", table_or_view_name, select_display_keys[i]));
                    }
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", table_or_view_name, select_display_keys[i]);
                }
            }

            string sql = string.Format("select {0} from {1}", keys_query.ToString(), table_or_view_name);

            return rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, table_or_view_name, date_time_format);
        }

        /// <summary>
        /// 获取这个实体对象的总数量
        /// 会根据实体对象的where_keys产生查询条件
        /// </summary>
        /// <param name="entity">参与count计算的实体entity对象</param>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static long get_entity_count(rx_entity entity)
        {
            entity = entity.clone();
            filtrate_entity(entity);
            List<string> where_keys = entity.where_keys;

            if (where_keys != null && where_keys.Count > 0)
            {
                for (int i = 0; i < where_keys.Count; i++)
                {
                    if (!entity.Keys.Contains(where_keys[i]))
                    {
                        where_keys.RemoveAt(i);
                        i--;
                    }
                }
            }
            else
            {
                where_keys = new List<string>();
            }


            StringBuilder where_query = new StringBuilder();

            foreach (string key in where_keys)
            {
                if (where_query.Length == 0)
                    where_query.Append(entity[key].build_query(false).Replace(entity[key].logic_symbol.ToString(), "where"));
                else
                    where_query.Append(entity[key].build_query(false));
            }

            string sql = string.Format("select count(*) count from {0} {1}", entity.entity_name, where_query.ToString());

            return rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, entity.entity_name)[0]["count"].value.to_long();
        }

        /// <summary>
        /// 获取这个实体对象的总数量
        /// </summary>
        /// <param name="table_or_view_name">表或者视图的名字</param>
        /// <param name="where_string">条件字符串 and id = 1 and name = 'jack'</param>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static long get_entity_count(string table_or_view_name, string where_string = "")
        {
            if (table_or_view_name == null)
                throw new Exception("table_or_view_name 不能为空！");
            if (!empty_entitys_and_view_entitys.Keys.Contains(table_or_view_name) && !empty_view_entitys.Keys.Contains(table_or_view_name))
                throw new Exception(string.Format("表或者视图：{0}不存在", table_or_view_name));

            where_string = where_string ?? "";

            string sql = string.Format("select count(*) count from {0} where 1 = 1 {1}", table_or_view_name, where_string);

            return rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, table_or_view_name)[0]["count"].value.to_long();
        }

        /// <summary>
        /// <para>直接根据表名以及id获取对应实体的单个对象</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// <para>id为null会出现异常</para>
        /// </summary>
        /// <param name="table_name">表名</param>
        /// <param name="id">id</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns></returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static rx_entity get_entity_by_id(string table_name, long? id, date_format_type date_time_format = date_format_type.date_time)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在！", table_name));
            if (id == null)
                throw new Exception("id不能为空！");

            string sql = string.Format("select * from {0} where id = '{1}'", table_name, id);

            List<rx_entity> list = rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, table_name, date_time_format);

            return list.Count > 0 ? list[0] : null;
        }

        /// <summary>
        /// <para>直接根据表名以及id获取对应实体的单个对象</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// <para>id为null会出现异常</para>
        /// </summary>
        /// <typeparam name="T">rx_model_base的子类</typeparam>
        /// <param name="table_name">表名</param>
        /// <param name="id">id</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns></returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static T get_entity_by_id<T>(string table_name, long? id)
            where T : rx_strong_type, new()
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在！", table_name));
            if (id == null)
                throw new Exception("id不能为空！");

            string sql = string.Format("select * from {0} where id = '{1}'", table_name, id);

            List<T> list = rx_dbhelper.instance().execute_sql_or_proc<T>(sql, null, CommandType.Text);

            return list.Count > 0 ? list[0] : null;
        }

        /// <summary>
        /// <para>直接根据表名以及id获取对应实体的单个对象</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// <para>id为null会出现异常</para>
        /// </summary>
        /// <param name="table_name">表名</param>
        /// <param name="id">id</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <param name="select_display_keys">指定需要显示的列名，空为*，不存在会出现异常</param>
        /// <returns></returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static rx_entity get_entity_by_id(string table_name, long? id, date_format_type date_time_format = date_format_type.date_time, params string[] select_display_keys)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在！", table_name));
            if (id == null)
                throw new Exception("id不能为空！");

            StringBuilder keys_query = new StringBuilder();
            if (select_display_keys == null || select_display_keys.Length == 0 || select_display_keys[0].Trim() == "" || select_display_keys[0].Trim() == "*")
            {
                keys_query.Append("*");
            }
            else
            {
                select_display_keys = select_display_keys.Distinct().ToArray();
                var keys = empty_entitys[table_name].Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("实体{0}中不包含key：{1}", table_name, select_display_keys[i]));
                    }
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", table_name, select_display_keys[i]);
                }
            }

            string sql = string.Format("select {0} from {1} where id = '{2}'", keys_query.ToString(), table_name, id);

            List<rx_entity> list = rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, table_name, date_time_format);

            return list.Count == 0 ? null : list[0];
        }

        /// <summary>
        /// <para>直接根据表名以及id的数组进行in查询获取对应实体的集合对象</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// <para>id_array为null或者长度为0会出现异常</para>
        /// </summary>
        /// <param name="table_name">表名</param>
        /// <param name="id_array">id_array</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <param name="select_display_keys">指定需要显示的列名，空为*，不存在会出现异常</param>
        /// <returns></returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<rx_entity> get_entitys_in_id(string table_name, long[] id_array, date_format_type date_time_format = date_format_type.date_time, params string[] select_display_keys)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在！", table_name));
            if (id_array == null || id_array.Length == 0)
                throw new Exception("id_array不能为空！");

            StringBuilder keys_query = new StringBuilder();
            if (select_display_keys == null || select_display_keys.Length == 0 || select_display_keys[0].Trim() == "" || select_display_keys[0].Trim() == "*")
            {
                keys_query.Append("*");
            }
            else
            {
                select_display_keys = select_display_keys.Distinct().ToArray();
                var keys = empty_entitys[table_name].Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("实体{0}中不包含key：{1}", table_name, select_display_keys[i]));
                    }
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", table_name, select_display_keys[i]);
                }
            }

            string sql = string.Format("select {0} from {1} where id in ({2})", keys_query.ToString(), table_name, string.Join(",", id_array));

            List<rx_entity> list = rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, table_name, date_time_format);

            return list;
        }

        /// <summary>
        /// <para>直接根据表名以及id的数组进行in查询获取对应实体的集合对象</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// <para>id_array为null或者长度为0会出现异常</para>
        /// </summary>
        /// <param name="table_name">表名</param>
        /// <param name="id_array">id_array</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <param name="select_display_keys">指定需要显示的列名，空为*，不存在会出现异常</param>
        /// <returns></returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<T> get_entitys_in_id<T>(long[] id_array, date_format_type date_time_format = date_format_type.date_time, params string[] select_display_keys)
            where T : rx_strong_type, new()
        {
            string table_name = typeof(T).Name;
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在！", table_name));
            if (id_array == null || id_array.Length == 0)
                throw new Exception("id_array不能为空！");

            StringBuilder keys_query = new StringBuilder();
            if (select_display_keys == null || select_display_keys.Length == 0 || select_display_keys[0].Trim() == "" || select_display_keys[0].Trim() == "*")
            {
                keys_query.Append("*");
            }
            else
            {
                select_display_keys = select_display_keys.Distinct().ToArray();
                var keys = empty_entitys[table_name].Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("实体{0}中不包含key：{1}", table_name, select_display_keys[i]));
                    }
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", table_name, select_display_keys[i]);
                }
            }

            string sql = string.Format("select {0} from {1} where id in ({2})", keys_query.ToString(), table_name, string.Join(",", id_array));

            List<T> list = rx_dbhelper.instance().execute_sql_or_proc<T>(sql, null, CommandType.Text);

            return list;
        }

        /// <summary>
        /// 根据实体对象的where_keys属性进行指定的where条件查询
        /// </summary>
        /// <param name="entity">参与条件查询的rx_entity对象，需要参与where条件的where_keys属性,可以使用参数设置where_keys,也可以使用set_where_keys方法指定where条件字段的key,必须是当前实体中存在的key,否则会出现异常</param>
        /// <param name="select_display_keys">指定需要显示的列名，空为*，不存在会出现异常</param>
        /// <returns>dml_result结果，dml_result成员请参照注释摘要</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<rx_entity> get_entitys_by_where_keys(rx_entity entity, date_format_type date_time_format = date_format_type.date_time, params string[] select_display_keys)
        {
            entity = entity.clone();
            filtrate_entity(entity);
            List<string> where_keys = entity.where_keys;

            if (where_keys != null && where_keys.Count > 0)
            {
                for (int i = 0; i < where_keys.Count; i++)
                {
                    if (!entity.Keys.Contains(where_keys[i]))
                    {
                        where_keys.RemoveAt(i);
                        i--;
                    }
                }
            }
            else
            {
                throw new Exception("实体的where_keys不能为null，且长度不能为0！");
            }

            StringBuilder keys_query = new StringBuilder();
            if (select_display_keys == null || select_display_keys.Length == 0 || select_display_keys[0].Trim() == "" || select_display_keys[0].Trim() == "*")
            {
                keys_query.Append("*");
            }
            else
            {
                select_display_keys = select_display_keys.Distinct().ToArray();
                var keys = empty_entitys_and_view_entitys[entity.entity_name].Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("实体{0}中不包含key：{1}", entity.entity_name, select_display_keys[i]));
                    }
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", entity.entity_name, select_display_keys[i]);
                }
            }

            StringBuilder where_query = new StringBuilder();

            foreach (string key in where_keys)
            {
                if (where_query.Length == 0)
                    where_query.Append(entity[key].build_query(false).Replace(entity[key].logic_symbol.ToString(), "where"));
                else
                    where_query.Append(entity[key].build_query(false));
            }

            string sql = string.Format("select {0} from {1} {2}", keys_query.ToString(), entity.entity_name, where_query.ToString());

            return rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, entity.entity_name, date_time_format);
        }

        /// <summary>
        /// 根据实体对象的where_keys属性进行指定的where条件查询
        /// </summary>
        /// <typeparam name="T">rx_strong_type的子类</typeparam>
        /// <param name="model">参与条件查询的rx_model_base子类对象，需要参与where条件的where_keys属性,可以使用参数设置where_keys,也可以使用set_where_keys方法指定where条件字段的key,必须是当前实体中存在的key,否则会出现异常</param>
        /// <returns>dml_result结果，dml_result成员请参照注释摘要</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<T> get_entitys_by_where_keys<T>(T model)
            where T : rx_strong_type, new()
        {
            rx_entity entity = model.rx_entity.clone();
            filtrate_entity(entity);
            List<string> where_keys = entity.where_keys;

            if (where_keys != null && where_keys.Count > 0)
            {
                for (int i = 0; i < where_keys.Count; i++)
                {
                    if (!entity.Keys.Contains(where_keys[i]))
                    {
                        where_keys.RemoveAt(i);
                        i--;
                    }
                }
            }
            else
            {
                throw new Exception("实体的where_keys不能为null，且长度不能为0！");
            }

            StringBuilder where_query = new StringBuilder();

            foreach (string key in where_keys)
            {
                if (where_query.Length == 0)
                    where_query.Append(entity[key].build_query(false).Replace(entity[key].logic_symbol.ToString(), "where"));
                else
                    where_query.Append(entity[key].build_query(false));
            }

            string sql = string.Format("select * from {0} {1}", entity.entity_name, where_query);

            return rx_dbhelper.instance().execute_sql_or_proc<T>(sql, null, CommandType.Text);
        }

        /// <summary>
        /// 获取指定table（表）的实体的entity集合对象
        /// <para>视图不存在会报错</para>
        /// </summary>
        /// <param name="table_name">表名称</param>
        /// <param name="where_string">条件字符串</param>
        /// <param name="field_string">要显示的列</param>
        /// <param name="date_time_format">字段值为DataTime类型时格式化输出的字符串（yyyy-MM-dd HH:mm:ss）</param>
        /// <returns>entity集合对象</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<rx_entity> get_entitys_by_where_string(string table_name, string where_string = "", date_format_type date_time_format = date_format_type.date_time, params string[] select_display_keys)
        {
            if (!empty_entitys_and_view_entitys.ContainsKey(table_name))
            {
                throw new Exception(string.Format("表或者视图{0}不存在", table_name));
            }
            char c = (char)(random.Next(0, 26) + 65);
            int right_num = where_string.Count(a => a == ')');
            int num = random.Next(3 + right_num, 20 + right_num);
            string left = new string('(', num);
            string right = new string(')', num);

            //if (Regex.Replace(where_string, @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
            //{
            //    throw new Exception("where_string中疑似存在危险的字符串，请再次尝试！");
            //}
            StringBuilder keys_query = new StringBuilder();
            if (select_display_keys == null || select_display_keys.Length == 0 || select_display_keys[0].Trim() == "" || select_display_keys[0].Trim() == "*")
            {
                keys_query.Append("*");
            }
            else
            {
                select_display_keys = select_display_keys.Distinct().ToArray();
                var keys = empty_entitys_and_view_entitys[table_name].Keys;
                for (int i = 0; i < select_display_keys.Length; i++)
                {
                    if (!keys.Contains(select_display_keys[i]))
                    {
                        throw new Exception(string.Format("实体{0}中不包含key：{1}", table_name, select_display_keys[i]));
                    }
                    if (keys_query.Length > 0) keys_query.Append(",");
                    keys_query.AppendFormat("[{0}].[{1}]", c, select_display_keys[i]);
                }
            }


            string sql = string.Format("select {0} from {1} {2} where 1 = 1 and{3}1 = 1 {4}{5}", keys_query.ToString(), table_name, c, left, where_string, right);
            return rx_dbhelper.instance().execute_sql_or_proc(sql, null, CommandType.Text, table_name, date_time_format);
        }

        /// <summary>
        /// 获取指定table（表名）的实体的rx_strong_type集合对象
        /// <para>表或者视图不存在会报错</para>
        /// </summary>
        /// <param name="where_string">条件字符串</param>
        /// <param name="field_string">需要显示的字段，默认为*</param>
        /// <returns>rx_strong_type集合对象</returns>
        [mvc.HttpGet]
        [mvc_api.HttpGet]
        public static List<T> get_entitys_by_where_string<T>(string where_string = "", string field_string = "*")
            where T : rx_strong_type, new()
        {
            string table_name = typeof(T).Name;
            if (!empty_entitys.ContainsKey(table_name))
            {
                throw new Exception(string.Format("表{0}不存在", table_name));
            }
            char c = (char)(random.Next(0, 26) + 65);
            int right_num = where_string.Count(a => a == ')');
            int num = random.Next(3 + right_num, 20 + right_num);
            string left = new string('(', num);
            string right = new string(')', num);

            //if (Regex.Replace(where_string, @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
            //{
            //    throw new Exception("where_string中疑似存在危险的字符串，请再次尝试！");
            //}

            string sql = string.Format("select {0} from {1} {2} where 1 = 1 and{3}1 = 1 {4}{5}", field_string, table_name, c, left, where_string, right);
            return rx_dbhelper.instance().execute_sql_or_proc<T>(sql, null, CommandType.Text);
        }

        /// <summary>
        /// <para>直接根据表名进行添加或者修改操作</para>
        /// <para>id为0或者null进行添加操作，否则为修改操作</para>
        /// <para>Request值自动获取</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// </summary>
        /// <param name="table_name">表名</param>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        [rx_risk_insert]
        public static dml_result insert_or_update_entity(string table_name)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在", table_name));

            rx_entity entity = empty_entitys[table_name].clone().request_fill();

            if (entity["id"].value == null)
            {
                return insert_entity(entity);
            }
            else
            {
                return update_entity_by_id(entity);
            }

        }

        /// <summary>
        /// <para>直接根据实体对象进行添加或者修改操作</para>
        /// <para>id为0或者null进行添加操作，否则为修改操作</para>
        /// <para>实体的entity_name不存在或为null会出现异常</para>
        /// <para>可以置顶实体的is_use_null</para>
        /// </summary>
        /// <param name="entity">rx_entity的对象</param>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        [rx_risk_insert]
        public static dml_result insert_or_update_entity(rx_entity entity)
        {
            if (!empty_entitys.Keys.Contains(entity.entity_name))
                throw new Exception(string.Format("实体的entity_name（表名）：{0}不存在", entity.entity_name));

            dml_result result = new dml_result(entity.entity_name, dml_command_type.vague);
            if (entity["id"].value == null)
            {
                //result.command_type = dml_command_type.insert;
                //sql = transaction_insert_string_build(entity, result);
                result = insert_entity(entity);
            }
            else
            {
                //result.command_type = dml_command_type.update;
                //sql = transaction_update_string_build(entity, result);
                result = update_entity_by_id(entity);
            }
            if (result.result_code == dml_result_code.fail || result.result_code == dml_result_code.error)
                return result;

            return result;//transaction_execute_non_query(sql);
        }

        /// <summary>
        /// <para>直接根据实体对象进行添加或者修改操作</para>
        /// <para>id为0或者null进行添加操作，否则为修改操作</para>
        /// <para>实体的entity_name不存在或为null会出现异常</para>
        /// <para>可以置顶实体的is_use_null</para>
        /// </summary>
        /// <param name="model">rx_model_base的子类对象</param>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        [rx_risk_insert]
        public static dml_result insert_or_update_entity(rx_model_base model)
        {
            rx_entity entity = model.rx_entity;
            if (!empty_entitys.Keys.Contains(entity.entity_name))
                throw new Exception(string.Format("实体的entity_name（表名）：{0}不存在", entity.entity_name));

            dml_result result = new dml_result(entity.entity_name, dml_command_type.vague);
            if (entity["id"].value == null)
            {
                //result.command_type = dml_command_type.insert;
                //sql = transaction_insert_string_build(entity, result);
                result = insert_entity(entity);
            }
            else
            {
                //result.command_type = dml_command_type.update;
                //sql = transaction_update_string_build(entity, result);
                result = update_entity_by_id(entity);
            }
            if (result.result_code == dml_result_code.fail || result.result_code == dml_result_code.error)
                return result;

            return result;//transaction_execute_non_query(sql);
        }

        /// <summary>
        /// 在数据库中添加一条数据，表名要与数据库中存在的表名一致
        /// <para>对象自动根据Request值生成</para>
        /// <para>id会在dml_result中的tag属性进行out</para>
        /// </summary>
        /// <param name="table_name">entity对象，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [rx_risk_insert]
        public static dml_result insert_entity(string table_name)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在！", table_name));

            rx_entity current_entity = empty_entitys[table_name].clone().request_fill();
            rx_entity entity = current_entity.clone();
            bool is_use_null = entity.is_use_null;
            dml_result result = filtrate_entity(entity, dml_command_type.insert);
            if (result.result_code == dml_result_code.fail) return result;
            if (entity.ContainsKey("id"))
            {
                if (entity["id"].auto_remove)
                {
                    entity.Remove("id");
                }
            }
            StringBuilder insert_field = new StringBuilder();
            StringBuilder insert_value = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                bool is_null_value = entity[key].value == null;
                int right_num = is_null_value ? 0 : entity[key].value.ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = is_null_value ? "" : new string('(', num);
                string right = is_null_value ? "" : new string(')', num);
                if (entity[key].value != null)
                {
                    //if (Regex.Replace(entity[key].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                    //{
                    //    throw new Exception(string.Format("实体的字段{0}中疑似存在危险的字符串，请再次尝试！", key));
                    //}
                    if (insert_field.Length > 0)
                    {
                        insert_field.Append(",");
                        insert_value.Append(",");
                    }
                    insert_field.Append("[" + key + "]");
                    insert_value.AppendFormat("{0}{1}{2}{3}{4}", left, entity[key].build_quote ? "'" : "", entity[key].value, entity[key].build_quote ? "'" : "", right);
                }
                else
                {
                    if (is_use_null)
                    {
                        if (insert_field.Length > 0)
                        {
                            insert_field.Append(",");
                            insert_value.Append(",");
                        }
                        insert_field.Append("[" + key + "]");
                        insert_value.Append("null");
                    }
                }
            }

            if (insert_field.Length == 0 || insert_value.Length == 0)
            {
                result.message = "该实体字典中所有需要添加的字段的值都为null,或者没有key与该实体类实体的字段对映。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            string sql = string.Format("insert {0} ({1}) values({2})", entity.entity_name, insert_field.ToString(), insert_value.ToString());
            result.sql_query = sql;
            try
            {
                SqlParameter[] sql_params = new SqlParameter[]{
                    new SqlParameter("@id",0){Direction = ParameterDirection.Output},
                    new SqlParameter("@insert_sql", sql),
                };
                result.len = rx_dbhelper.instance().execute_non_query("pro_rx_insert_entity_out_id", sql_params);
                current_entity["id"].value = int.Parse(sql_params[0].Value.ToString());
                result.result_code = dml_result_code.success;
                result.message = string.Format("添加成功,添加了{0}行！", result.len);
                result.tag = current_entity["id"].value;
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// 在数据库中添加一条数据，表名与当前实体类的entity_name一致
        /// <para>entity对象不受dml_command_type属性的影响</para>
        /// <para>entity对象可以指定is_use_null</para>
        /// <para>id会进行out</para>
        /// </summary>
        /// <param name="entity">entity对象，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [rx_risk_insert]
        public static dml_result insert_entity(rx_entity entity)
        {
            rx_entity current_entity = entity;
            entity = current_entity.clone();
            bool is_use_null = entity.is_use_null;
            dml_result result = filtrate_entity(entity, dml_command_type.insert);
            if (result.result_code == dml_result_code.fail) return result;
            if (entity.ContainsKey("id"))
            {
                if (entity["id"].auto_remove)
                {
                    entity.Remove("id");
                }
            }
            StringBuilder insert_field = new StringBuilder();
            StringBuilder insert_value = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                bool is_null_value = entity[key].value == null;
                int right_num = is_null_value ? 0 : entity[key].value.ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = is_null_value ? "" : new string('(', num);
                string right = is_null_value ? "" : new string(')', num);
                if (entity[key].value != null)
                {
                    //if (Regex.Replace(entity[key].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                    //{
                    //    throw new Exception(string.Format("实体的字段{0}中疑似存在危险的字符串，请再次尝试！", key));
                    //}
                    if (insert_field.Length > 0)
                    {
                        insert_field.Append(",");
                        insert_value.Append(",");
                    }
                    insert_field.Append("[" + key + "]");
                    insert_value.AppendFormat("{0}{1}{2}{3}{4}", left, entity[key].build_quote ? "'" : "", entity[key].value, entity[key].build_quote ? "'" : "", right);
                }
                else
                {
                    if (is_use_null)
                    {
                        if (insert_field.Length > 0)
                        {
                            insert_field.Append(",");
                            insert_value.Append(",");
                        }
                        insert_field.Append("[" + key + "]");
                        insert_value.Append("null");
                    }
                }
            }

            if (insert_field.Length == 0 || insert_value.Length == 0)
            {
                result.message = "该实体字典中所有需要添加的字段的值都为null,或者没有key与该实体类实体的字段对映。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            string sql = string.Format("insert {0} ({1}) values({2})", entity.entity_name, insert_field.ToString(), insert_value.ToString());
            result.sql_query = sql;
            try
            {
                SqlParameter[] sql_params = new SqlParameter[]{
                    new SqlParameter("@id",0){Direction = ParameterDirection.Output},
                    new SqlParameter("@insert_sql", sql),
                };
                result.len = rx_dbhelper.instance().execute_non_query("pro_rx_insert_entity_out_id", sql_params);
                current_entity["id"].value = int.Parse(sql_params[0].Value.ToString());
                result.tag = current_entity["id"].value;
                result.result_code = dml_result_code.success;
                result.message = string.Format("添加成功,添加了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// 在数据库中添加一条数据，表名与当前实体类的entity_name一致
        /// <para>model对象不受dml_command_type属性的影响</para>
        /// <para>model对象可以指定is_use_null</para>
        /// <para>id会进行out</para>
        /// </summary>
        /// <param name="model">rx_model_base子类对象，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [rx_risk_insert]
        public static dml_result insert_entity(rx_model_base model)
        {
            rx_entity current_entity = model.rx_entity;
            rx_entity entity = current_entity.clone();
            bool is_use_null = entity.is_use_null;
            dml_result result = filtrate_entity(entity, dml_command_type.insert);
            if (result.result_code == dml_result_code.fail) return result;
            if (entity.ContainsKey("id"))
            {
                if (entity["id"].auto_remove)
                {
                    entity.Remove("id");
                }
            }
            StringBuilder insert_field = new StringBuilder();
            StringBuilder insert_value = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                bool is_null_value = entity[key].value == null;
                int right_num = is_null_value ? 0 : entity[key].value.ToString().Count(a => a == ')');
                int num = random.Next(3 + right_num, 11 + right_num);
                string left = is_null_value ? "" : new string('(', num);
                string right = is_null_value ? "" : new string(')', num);
                if (entity[key].value != null)
                {
                    //if (Regex.Replace(entity[key].value.ToString(), @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
                    //{
                    //    throw new Exception(string.Format("实体的字段{0}中疑似存在危险的字符串，请再次尝试！", key));
                    //}
                    if (insert_field.Length > 0)
                    {
                        insert_field.Append(",");
                        insert_value.Append(",");
                    }
                    insert_field.Append("[" + key + "]");
                    insert_value.AppendFormat("{0}{1}{2}{3}{4}", left, entity[key].build_quote ? "'" : "", entity[key].value, entity[key].build_quote ? "'" : "", right);
                }
                else
                {
                    if (is_use_null)
                    {
                        if (insert_field.Length > 0)
                        {
                            insert_field.Append(",");
                            insert_value.Append(",");
                        }
                        insert_field.Append("[" + key + "]");
                        insert_value.Append("null");
                    }
                }
            }

            if (insert_field.Length == 0 || insert_value.Length == 0)
            {
                result.message = "该实体字典中所有需要添加的字段的值都为null,或者没有key与该实体类实体的字段对映。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            string sql = string.Format("insert {0} ({1}) values({2})", entity.entity_name, insert_field.ToString(), insert_value.ToString());
            result.sql_query = sql;
            try
            {
                SqlParameter[] sql_params = new SqlParameter[]{
                    new SqlParameter("@id",0){Direction = ParameterDirection.Output},
                    new SqlParameter("@insert_sql", sql),
                };
                result.len = rx_dbhelper.instance().execute_non_query("pro_rx_insert_entity_out_id", sql_params);
                current_entity["id"].value = int.Parse(sql_params[0].Value.ToString());
                result.tag = current_entity["id"].value;
                result.result_code = dml_result_code.success;
                result.message = string.Format("添加成功,添加了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// 在数据库中添加多条数据，表名与当前实体的entity_name一致
        /// <para>entity对象不受dml_command_type属性的影响</para>
        /// <para>entity对象可以指定is_use_null</para>
        /// <para>id会进行out</para>
        /// </summary>
        /// <param name="entity_array">entity对象的数组，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [rx_risk_insert]
        public static dml_result insert_entitys(params rx_entity[] entity_array)
        {
            if (entity_array == null || entity_array.Length == 0)
            {
                throw new Exception("entitys不能为空，且长度不能为0");
            }
            for (int i = 0; i < entity_array.Length; i++)
            {
                dml_result result = filtrate_entity(entity_array[i], dml_command_type.insert);
                if (result.result_code == dml_result_code.fail)
                {
                    result.message += ",索引" + i;
                    return result;
                }
                entity_array[i].command_type = dml_command_type.insert;
            }

            return transaction_execute_non_query(entity_array);
        }

        /// <summary>
        /// 在数据库中添加多条数据，表名与这个实体的entity_name一致
        /// <para>entity对象不受dml_command_type属性的影响</para>
        /// <para>entity对象可以指定is_use_null</para>
        /// <para>id会进行out</para>
        /// </summary>
        /// <param name="model_array">rx_model对象的数组，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPut]
        [mvc_api.HttpPut]
        [rx_risk_insert]
        public static dml_result insert_entitys<T>(params rx_model<T>[] model_array)
            where T : rx_model<T>, new()
        {
            if (model_array == null || model_array.Length == 0)
            {
                throw new Exception("models不能为空，且长度不能为0");
            }
            for (int i = 0; i < model_array.Length; i++)
            {
                dml_result result = filtrate_entity(model_array[i].rx_entity, dml_command_type.insert);
                if (result.result_code == dml_result_code.fail)
                {
                    result.message += ",索引" + i;
                    return result;
                }
                model_array[i].command_type = dml_command_type.insert;
            }

            return transaction_execute_non_query(model_array);
        }

        /// <summary>
        /// 在数据库中按照对象的id更新当前实体的一条数据
        /// <para>对象自动根据Request值生成</para>
        /// </summary>
        /// <param name="table_name">表名</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        public static dml_result update_entity_by_id(string table_name)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在！", table_name));

            rx_entity entity = empty_entitys[table_name].clone().request_fill();
            bool is_use_null = entity.is_use_null;
            dml_result result = filtrate_entity(entity, dml_command_type.update);
            if (result.result_code == dml_result_code.fail) return result;

            if (!entity.ContainsKey("id"))
            {
                result.message = "该实体字典的key中没有找到id。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            object id = entity["id"].value;
            if (id == null)
            {
                result.message = "该实体的id值为null";
                result.result_code = dml_result_code.fail;
                return result;
            }
            if (entity["id"].auto_remove)
            {
                entity.Remove("id");
            }

            StringBuilder entity_query = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                if (entity[key].value != null || entity[key].value == null && is_use_null)
                {
                    if (entity_query.Length > 0) entity_query.Append(",");
                    entity_query.Append(entity[key].build_query_not_symbol(false));
                }
            }

            if (entity_query.Length == 0)
            {
                result.message = "该实体字典中所有需要修改的字段的值都为null,或者没有key与该实体类实体的字段对映。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            int num = random.Next(1, 11);
            string left = new string('(', num);
            string right = new string(')', num);
            result.sql_query = string.Format("update {0} set {1} where id = {2}'{3}'{4}", entity.entity_name, entity_query.ToString(), left, id, right);
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(result.sql_query, null);
                result.result_code = dml_result_code.success;
                result.message = string.Format("更新成功,更新了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// 在数据库中按照id更新当前实体的一条数据
        /// </summary>
        /// <param name="entity">entity对象where条件只是用key为id的值，其他key值作为更新数据，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        public static dml_result update_entity_by_id(rx_entity entity)
        {
            entity = entity.clone();
            bool is_use_null = entity.is_use_null;
            dml_result result = filtrate_entity(entity, dml_command_type.update);
            if (result.result_code == dml_result_code.fail) return result;

            if (!entity.ContainsKey("id"))
            {
                result.message = "该实体字典的key中没有找到id。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            object id = entity["id"].value;
            if (id == null)
            {
                result.message = "该实体的id值为null";
                result.result_code = dml_result_code.fail;
                return result;
            }
            if (entity["id"].auto_remove)
            {
                entity.Remove("id");
            }

            StringBuilder entity_query = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                if (entity[key].value != null || entity[key].value == null && is_use_null)
                {
                    if (entity_query.Length > 0) entity_query.Append(",");
                    entity_query.Append(entity[key].build_query_not_symbol(false));
                }
            }

            if (entity_query.Length == 0)
            {
                result.message = "该实体字典中所有需要修改的字段的值都为null,或者没有key与该实体类实体的字段对映。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            int num = random.Next(1, 11);
            string left = new string('(', num);
            string right = new string(')', num);
            result.sql_query = string.Format("update {0} set {1} where id = {2}'{3}'{4}", entity.entity_name, entity_query.ToString(), left, id, right);
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(result.sql_query, null);
                result.result_code = dml_result_code.success;
                result.message = string.Format("更新成功,更新了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// 在数据库中按照id更新当前实体的一条数据
        /// </summary>
        /// <param name="model">model的rx_entity对象中where条件只是用key为id的值，其他key值作为更新数据，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        public static dml_result update_entity_by_id(rx_model_base model)
        {
            rx_entity entity = model.rx_entity.clone();
            bool is_use_null = entity.is_use_null;
            dml_result result = filtrate_entity(entity, dml_command_type.update);
            if (result.result_code == dml_result_code.fail) return result;

            if (!entity.ContainsKey("id"))
            {
                result.message = "该实体字典的key中没有找到id。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            object id = entity["id"].value;
            if (id == null)
            {
                result.message = "该实体的id值为null";
                result.result_code = dml_result_code.fail;
                return result;
            }
            if (entity["id"].auto_remove)
            {
                entity.Remove("id");
            }

            StringBuilder entity_query = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                if (entity[key].value != null || entity[key].value == null && is_use_null)
                {
                    if (entity_query.Length > 0) entity_query.Append(",");
                    entity_query.Append(entity[key].build_query_not_symbol(false));
                }
            }

            if (entity_query.Length == 0)
            {
                result.message = "该实体字典中所有需要修改的字段的值都为null,或者没有key与该实体类实体的字段对映。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            int num = random.Next(1, 11);
            string left = new string('(', num);
            string right = new string(')', num);
            result.sql_query = string.Format("update {0} set {1} where id = {2}'{3}'{4}", entity.entity_name, entity_query.ToString(), left, id, right);
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(result.sql_query, null);
                result.result_code = dml_result_code.success;
                result.message = string.Format("更新成功,更新了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// 在数据库中按照where条件更新一个实体对象
        /// entity对象不受dml_command_type属性属性的影响
        /// entity对象可以指定is_use_null
        /// entity对象必须指定where_keys
        /// </summary>
        /// <param name="entity">entity对象where_keys不能为null</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        public static dml_result update_entity_by_where_keys(rx_entity entity)
        {
            entity = entity.clone();
            bool is_use_null = entity.is_use_null;
            List<string> where_keys = entity.where_keys;
            dml_result result = filtrate_entity(entity, dml_command_type.update);
            if (result.result_code == dml_result_code.fail) return result;
            if (where_keys == null || where_keys.Count == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = "实体对象的where_keys属性不能为null,且长度不能为0。";
                return result;
            }
            StringBuilder where_query = new System.Text.StringBuilder();
            for (int i = 0; i < where_keys.Count; i++)
            {
                if (!entity.ContainsKey(where_keys[i]))
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("该实体字典的key中没有找到{0}。", where_keys[i]);
                    return result;
                }

                if (where_query.Length == 0)
                    where_query.Append(entity[where_keys[i]].build_query(false).Replace(entity[where_keys[i]].logic_symbol.ToString(), "where"));
                else
                    where_query.Append(entity[where_keys[i]].build_query(false));

                entity.Remove(where_keys[i]);
            }

            if (entity.ContainsKey("id"))
            {
                if (entity["id"].auto_remove)
                {
                    entity.Remove("id");
                }
            }

            StringBuilder entity_query = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                if (entity[key].value != null || entity[key].value == null && is_use_null)
                {
                    if (entity_query.Length > 0) entity_query.Append(",");
                    entity_query.Append(entity[key].build_query_not_symbol(false));
                }
            }

            if (entity_query.Length == 0)
            {
                result.message = "该实体字典中所有需要修改的字段的值都为null,或者没有key与该实体类实体的字段对映。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            string sql = string.Format("update {0} set {1} {2}", entity.entity_name, entity_query.ToString(), where_query.ToString());
            result.sql_query = sql;
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(sql, null);
                result.result_code = dml_result_code.success;
                result.message = string.Format("更新成功,更新了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }
            return result;
        }

        /// <summary>
        /// 在数据库中按照where条件更新一个实体对象
        /// entity对象不受dml_command_type属性属性的影响
        /// entity对象可以指定is_use_null
        /// entity对象必须指定where_keys
        /// </summary>
        /// <param name="model">model对象的rx_entity中的where_keys不能为null</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpPost]
        [mvc_api.HttpPost]
        [rx_risk_update]
        public static dml_result update_entity_by_where_keys(rx_model_base model)
        {
            rx_entity entity = model.rx_entity.clone();
            bool is_use_null = entity.is_use_null;
            List<string> where_keys = entity.where_keys;
            dml_result result = filtrate_entity(entity, dml_command_type.update);
            if (result.result_code == dml_result_code.fail) return result;
            if (where_keys == null || where_keys.Count == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = "实体对象的where_keys属性不能为null,且长度不能为0。";
                return result;
            }
            StringBuilder where_query = new System.Text.StringBuilder();
            for (int i = 0; i < where_keys.Count; i++)
            {
                if (!entity.ContainsKey(where_keys[i]))
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("该实体字典的key中没有找到{0}。", where_keys[i]);
                    return result;
                }

                if (where_query.Length == 0)
                    where_query.Append(entity[where_keys[i]].build_query(false).Replace(entity[where_keys[i]].logic_symbol.ToString(), "where"));
                else
                    where_query.Append(entity[where_keys[i]].build_query(false));

                entity.Remove(where_keys[i]);
            }

            if (entity.ContainsKey("id"))
            {
                if (entity["id"].auto_remove)
                {
                    entity.Remove("id");
                }
            }

            StringBuilder entity_query = new StringBuilder();
            foreach (string key in entity.Keys)
            {
                if (entity[key].value != null || entity[key].value == null && is_use_null)
                {
                    if (entity_query.Length > 0) entity_query.Append(",");
                    entity_query.Append(entity[key].build_query_not_symbol(false));
                }
            }

            if (entity_query.Length == 0)
            {
                result.message = "该实体字典中所有需要修改的字段的值都为null,或者没有key与该实体类实体的字段对映。";
                result.result_code = dml_result_code.fail;
                return result;
            }

            string sql = string.Format("update {0} set {1} {2}", entity.entity_name, entity_query.ToString(), where_query.ToString());
            result.sql_query = sql;
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(sql, null);
                result.result_code = dml_result_code.success;
                result.message = string.Format("更新成功,更新了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }
            return result;
        }

        /// <summary>
        /// <para>根据表名进行单行删除操作</para>
        /// <para>id为null会出现异常</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// </summary>
        /// <param name="table_name">表名</param>
        /// <param name="id"></param>
        /// <returns></returns>
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_delete]
        public static dml_result delete_entity_by_id(string table_name, long? id)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在", table_name));
            if (id == null)
                throw new Exception("id不能为空！");

            rx_entity entity = empty_entitys[table_name].clone();
            entity["id"].value = id;
            entity.set_where_keys("id");
            dml_result result = new dml_result(entity.entity_name, dml_command_type.delete);
            string sql = transaction_delete_string_build(entity, result);
            if (result.result_code == dml_result_code.fail || result.result_code == dml_result_code.error)
                return result;
            result = transaction_execute_non_query(sql);
            result.command_type = dml_command_type.delete;
            return result;
        }

        /// <summary>
        /// <para>根据表名进行多行in删除操作</para>
        /// <para>id_array为null或者长度为0会出现异常</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// </summary>
        /// <param name="table_name">表名</param>
        /// <param name="id_array">需要删除的多个id</param>
        /// <returns></returns>
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_delete]
        public static dml_result delete_entity_in_id(string table_name, params long[] id_array)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在", table_name));
            if (id_array == null || id_array.Length == 0)
                throw new Exception("id_array不能为null且长度不能为0！");

            rx_entity entity = empty_entitys[table_name].clone();
            entity["id"].value = string.Join(",", id_array);
            entity["id"].compare_symbol = compare_symbol.contain;
            entity.set_where_keys("id");
            dml_result result = new dml_result(entity.entity_name, dml_command_type.delete);
            string sql = transaction_delete_string_build(entity, result);
            if (result.result_code == dml_result_code.fail || result.result_code == dml_result_code.error)
                return result;

            return transaction_execute_non_query(sql);
        }

        /// <summary>
        /// <para>直接根据表名与where_string进行删除操作</para>
        /// <para>where_string如果为null会出现异常</para>
        /// <para>table_name不存在或为null会出现异常</para>
        /// </summary>
        /// <param name="table_name"></param>
        /// <param name="where_string"></param>
        /// <returns></returns>
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_delete]
        public static dml_result delete_entity_by_where_string(string table_name, string where_string)
        {
            if (table_name == null)
                throw new Exception("表名（table_name）不能为空！");
            if (!empty_entitys.Keys.Contains(table_name))
                throw new Exception(string.Format("表：{0}不存在", table_name));
            if (where_string == null || where_string.Trim() == "")
                throw new Exception("where_string不能是null或者空串！");

            int right_num = where_string.Count(a => a == ')');
            int num = random.Next(3 + right_num, 20 + right_num);
            string left = new string('(', num);
            string right = new string(')', num);

            //if (Regex.Replace(where_string, @"\/\*|\*\/|\-\-| |", "", RegexOptions.Compiled).Contains(right))
            //{
            //    throw new Exception("where_string中疑似存在危险的字符串，请再次尝试！");
            //}


            string sql = string.Format("delete from {0} where 1 = 1 and {1}id != -99999 {2}{3}", table_name, left, where_string, right);

            return execute_non_query(sql, null);
        }

        /// <summary>
        /// 在数据库中按照实体指定的key值和value值删除这个实体的表数据
        /// entity对象不受dml_command_type属性属性的影响
        /// entity对象必须指定where_keys
        /// </summary>
        /// <param name="entity">entity对象where条件只用key为id的值，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_delete]
        public static dml_result delete_entity_by_where_keys(rx_entity entity)
        {
            entity = entity.clone();
            List<string> where_keys = entity.where_keys;
            dml_result result = filtrate_entity(entity, dml_command_type.delete);
            if (result.result_code == dml_result_code.fail) return result;
            if (where_keys == null || where_keys.Count == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = "实体对象的where_keys属性不能为null,且长度不能为0。";
                return result;
            }

            StringBuilder where_query = new System.Text.StringBuilder();

            for (int i = 0; i < where_keys.Count; i++)
            {
                if (!entity.ContainsKey(where_keys[i]))
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("该实体字典的key中没有找到{0}。", where_keys[i]);
                    return result;
                }

                if (where_query.Length == 0)
                    where_query.Append(entity[where_keys[i]].build_query(false).Replace(entity[where_keys[i]].logic_symbol.ToString(), "where"));
                else
                    where_query.Append(entity[where_keys[i]].build_query(false));

                entity.Remove(where_keys[i]);
            }

            string sql = string.Format("delete from {0} {1}", entity.entity_name, where_query.ToString());
            result.sql_query = sql;
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(sql, null);
                result.result_code = dml_result_code.success;
                result.message = string.Format("删除成功,删除了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }

        /// <summary>
        /// 在数据库中按照实体指定的key值和value值删除这个实体的表数据
        /// entity对象不受dml_command_type属性属性的影响
        /// entity对象必须指定where_keys
        /// </summary>
        /// <param name="model">model对象的rx_entity中where条件只用key为id的值，实体会与当前实体类进行匹配和过滤操作</param>
        /// <returns>dml操作结果对象</returns>
        [mvc.HttpDelete]
        [mvc_api.HttpDelete]
        [rx_risk_delete]
        public static dml_result delete_entity_by_where_keys(rx_model_base model)
        {
            rx_entity entity = model.rx_entity.clone();
            List<string> where_keys = entity.where_keys;
            dml_result result = filtrate_entity(entity, dml_command_type.delete);
            if (result.result_code == dml_result_code.fail) return result;
            if (where_keys == null || where_keys.Count == 0)
            {
                result.result_code = dml_result_code.fail;
                result.message = "实体对象的where_keys属性不能为null,且长度不能为0。";
                return result;
            }

            StringBuilder where_query = new System.Text.StringBuilder();

            for (int i = 0; i < where_keys.Count; i++)
            {
                if (!entity.ContainsKey(where_keys[i]))
                {
                    result.result_code = dml_result_code.fail;
                    result.message = string.Format("该实体字典的key中没有找到{0}。", where_keys[i]);
                    return result;
                }

                if (where_query.Length == 0)
                    where_query.Append(entity[where_keys[i]].build_query(false).Replace(entity[where_keys[i]].logic_symbol.ToString(), "where"));
                else
                    where_query.Append(entity[where_keys[i]].build_query(false));

                entity.Remove(where_keys[i]);
            }

            string sql = string.Format("delete from {0} {1}", entity.entity_name, where_query.ToString());
            result.sql_query = sql;
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(sql, null);
                result.result_code = dml_result_code.success;
                result.message = string.Format("删除成功,删除了{0}行！", result.len);
            }
            catch (Exception ex)
            {
                result.len = 0;
                result.result_code = dml_result_code.error;
                result.message = ex.Message + string.Format(",Source:{0},TargetSite:{1}", ex.Source, ex.TargetSite);
            }

            return result;
        }
        #endregion
    }
    /// <summary>
    /// rx_manager数据查询性能模式,主要影响的是直接对rx_entity对象和集合的sql查询性能模式
    /// <para>如果你使用的是rx_model与rx_view系列的强类型可以忽略，强类型使用Dapper进行底层查询交互</para>
    /// </summary>
    public enum performance_mode
    {
        /// <summary>
        /// 连接池优先，该模式查询速度会提升，默认的查询模式
        /// </summary>
        pool_first,
        /// <summary>
        /// 内存优先模式，该模式用于数据库连接池紧张的情况下使用
        /// </summary>
        memory_first
    }

    #region 数据库操作对象
    /// <summary>
    /// <para>rx_dbhelper配置方法</para>  
    /// <para>配置文件appSettings配置添加一个项，key="rx_db_type" value="sql或者access"</para>
    /// <para>(sqlserver)配置文件connectionStrings配置添加一个项，name="rx_ms_sql_conn_str" value="连接字符串"</para>
    /// <para>(access)配置文件connectionStrings配置添加一个项，name="rx_ms_access_conn_str" value="连接字符串"</para>
    /// <para>sqlserver或者access 二选一即可</para>
    /// </summary>
    public abstract class rx_dbhelper
    {
        protected rx_dbhelper() { }

        protected static string rx_db_type = get_db_type();

        private static string get_db_type()
        {
            try
            {
                return System.Configuration.ConfigurationManager.AppSettings["rx_db_type"].ToString();
            }
            catch (Exception)
            {
                return "sql";
            }
        }

        public static rx_dbhelper instance()
        {
            switch (rx_db_type.ToLower())
            {
                case "sql":
                    return new rx_ms_sql_dbhelper();
                case "access":
                    return new rx_ms_access_dbhelper();
            }
            throw new Exception("rx_db_type配置错误！");
        }

        public abstract List<rx_entity> execute_sql_or_proc(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure, string entity_name = "rx_entity", date_format_type date_time_format = date_format_type.date_time);
        public abstract List<T> execute_sql_or_proc<T>(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure)
            where T : rx_strong_type, new();
        public abstract int execute_non_query(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure);


        /// <summary>
        /// 微软sqlserver辅助类
        /// </summary>
        private class rx_ms_sql_dbhelper : rx_dbhelper
        {
            private static string conn_str = System.Configuration.ConfigurationManager.ConnectionStrings["rx_ms_sql_conn_str"].ToString();

            private SqlConnection _conn = null;

            private SqlConnection conn
            {
                get
                {
                    if (_conn == null)
                    {
                        _conn = new SqlConnection(conn_str);
                    }

                    if (_conn.State == ConnectionState.Closed)
                    {
                        _conn.Open();
                    }

                    if (_conn.State == ConnectionState.Broken)
                    {
                        _conn.Close();
                        _conn.Open();
                    }
                    return this._conn;
                }
            }

            public override List<rx_entity> execute_sql_or_proc(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure, string entity_name = "rx_entity", date_format_type date_time_format = date_format_type.date_time)
            {
                using (conn)
                {
                    using (SqlCommand com = new SqlCommand(sql, conn))
                    {
                        com.CommandTimeout = 1024;
                        if (param_array != null)
                        {
                            com.CommandType = sql_type;
                            if (param_array.Length > 0)
                            {
                                com.Parameters.AddRange(param_array);
                            }
                        }
                        List<rx_entity> list = new List<rx_entity>();
                        switch (rx_manager.performance_mode)
                        {
                            case performance_mode.pool_first:
                                using (SqlDataReader reader = com.ExecuteReader(CommandBehavior.CloseConnection))
                                {
                                    int field_count = reader.FieldCount;
                                    string[] keys = new string[field_count];
                                    for (int i = 0; i < field_count; i++) keys[i] = reader.GetName(i);

                                    while (reader.Read())
                                    {
                                        rx_entity entity = new rx_entity(entity_name);
                                        for (int i = 0; i < field_count; i++)
                                        {
                                            var obj = reader[keys[i]];
                                            entity[keys[i]] = new rx_field(keys[i], reader[keys[i]], entity, date_time_format);
                                        }
                                        list.Add(entity);
                                    }
                                    return list;
                                }
                            case performance_mode.memory_first:
                            default:
                                using (DataTable dt = new DataTable())
                                {
                                    using (SqlDataAdapter da = new SqlDataAdapter(com))
                                    {
                                        da.Fill(dt);
                                    }
                                    int row_count = dt.Rows.Count;
                                    string[] keys = new string[dt.Columns.Count];
                                    for (int i = 0; i < keys.Length; i++) keys[i] = dt.Columns[i].ColumnName;

                                    for (int i = 0; i < row_count; i++)
                                    {
                                        rx_entity obj = null;
                                        if (rx_manager.empty_entitys_and_view_entitys.ContainsKey(entity_name))
                                            obj = rx_manager.empty_entitys_and_view_entitys[entity_name].clone();
                                        else
                                            obj = new rx_entity(entity_name);
                                        for (int j = 0; j < keys.Length; j++)
                                            obj[keys[j]] = new rx_field(keys[j], dt.Rows[i][keys[j]], obj, date_time_format);

                                        list.Add(obj);
                                    }
                                    return list;
                                }
                        }
                    }
                }
            }

            public override List<T> execute_sql_or_proc<T>(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure)
            {
                using (conn)
                {
                    DynamicParameters dp = new DynamicParameters();
                    if (param_array != null)
                    {
                        for (int i = 0; i < param_array.Length; i++)
                        {
                            dp.Add(param_array[i].ParameterName, param_array[i].Value, param_array[i].DbType, param_array[i].Direction, 9999999);
                        }
                    }

                    List<T> list = conn.Query<T>(sql, param_array == null ? null : dp, null, true, 1024, sql_type).ToList();

                    if (param_array != null)
                    {
                        for (int i = 0; i < param_array.Length; i++)
                        {
                            if (param_array[i].Direction == ParameterDirection.Output)
                            {
                                param_array[i].Value = dp.Get<object>(param_array[i].ParameterName);
                            }
                        }
                    }

                    return list;
                }



                string entity_name = typeof(T).Name;
                using (conn)
                {
                    using (SqlCommand com = new SqlCommand(sql, conn))
                    {
                        if (param_array != null)
                        {
                            com.CommandType = sql_type;
                            if (param_array.Length > 0)
                            {
                                com.Parameters.AddRange(param_array);
                            }
                        }
                        List<T> list = new List<T>();
                        switch (rx_manager.performance_mode)
                        {
                            case performance_mode.pool_first:
                                using (SqlDataReader reader = com.ExecuteReader(CommandBehavior.CloseConnection))
                                {
                                    //int field_count = reader.FieldCount;
                                    //string[] keys = new string[field_count];
                                    //for (int i = 0; i < field_count; i++) keys[i] = reader.GetName(i);

                                    //while (reader.Read())
                                    //{
                                    //    T entity = new T();
                                    //    for (int i = 0; i < field_count; i++)
                                    //    {
                                    //        entity[keys[i]] = new rx_field(keys[i], reader[keys[i]], entity);
                                    //    }
                                    //    list.Add(entity);
                                    //}

                                    //return list;

                                    return entity_converter<T>.batch_data_loader(reader);
                                }
                            case performance_mode.memory_first:
                            default:
                                using (DataTable dt = new DataTable())
                                {
                                    using (SqlDataAdapter da = new SqlDataAdapter(com))
                                    {
                                        da.Fill(dt);
                                    }
                                    int row_count = dt.Rows.Count;
                                    string[] keys = new string[dt.Columns.Count];
                                    for (int i = 0; i < keys.Length; i++) keys[i] = dt.Columns[i].ColumnName;

                                    for (int i = 0; i < row_count; i++)
                                    {
                                        T entity = new T();
                                        for (int j = 0; j < keys.Length; j++)
                                            entity[keys[j]] = new rx_field(keys[j], dt.Rows[i][keys[j]], entity.rx_entity);
                                    }
                                    return list;
                                }
                        }
                    }
                }
            }

            public override int execute_non_query(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure)
            {
                using (conn)
                {
                    using (SqlCommand com = new SqlCommand(sql, conn))
                    {
                        com.CommandTimeout = 1024;
                        if (param_array != null)
                        {
                            com.CommandType = sql_type;
                            if (param_array.Length > 0)
                            {
                                com.Parameters.AddRange(param_array);
                            }
                        }
                        return com.ExecuteNonQuery();
                    }
                }
            }
        }

        /// <summary>
        /// 微软access辅助类
        /// </summary>
        private class rx_ms_access_dbhelper : rx_dbhelper
        {
            private static string conn_str = System.Configuration.ConfigurationManager.ConnectionStrings["rx_ms_access_conn_str"].ToString();

            private OleDbConnection _conn = null;

            private OleDbConnection conn
            {
                get
                {
                    if (_conn == null)
                    {
                        _conn = new OleDbConnection(conn_str);
                    }

                    if (_conn.State == ConnectionState.Closed)
                    {
                        _conn.Open();
                    }

                    if (_conn.State == ConnectionState.Broken)
                    {
                        _conn.Close();
                        _conn.Open();
                    }
                    return this._conn;
                }
            }

            public override List<rx_entity> execute_sql_or_proc(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure, string entity_name = "rx_entity", date_format_type date_time_format = date_format_type.date_time)
            {
                using (conn)
                {
                    using (OleDbCommand com = new OleDbCommand(sql, conn))
                    {
                        if (param_array != null)
                        {
                            com.CommandType = sql_type;
                            if (param_array.Length > 0)
                            {
                                com.Parameters.AddRange(param_array);
                            }
                        }
                        List<rx_entity> list = new List<rx_entity>();
                        switch (rx_manager.performance_mode)
                        {
                            case performance_mode.pool_first:
                                using (OleDbDataReader reader = com.ExecuteReader(CommandBehavior.CloseConnection))
                                {
                                    int field_count = reader.FieldCount;
                                    string[] keys = new string[field_count];
                                    for (int i = 0; i < field_count; i++) keys[i] = reader.GetName(i);

                                    while (reader.Read())
                                    {
                                        rx_entity entity = new rx_entity(entity_name);
                                        for (int i = 0; i < field_count; i++)
                                        {
                                            entity[keys[i]] = new rx_field(keys[i], reader[keys[i]], entity, date_time_format);
                                        }
                                        list.Add(entity);
                                    }
                                    return list;
                                }
                            case performance_mode.memory_first:
                            default:
                                using (DataTable dt = new DataTable())
                                {
                                    using (OleDbDataAdapter da = new OleDbDataAdapter(com))
                                    {
                                        da.Fill(dt);
                                    }
                                    int row_count = dt.Rows.Count;
                                    string[] keys = new string[dt.Columns.Count];
                                    for (int i = 0; i < keys.Length; i++) keys[i] = dt.Columns[i].ColumnName;

                                    for (int i = 0; i < row_count; i++)
                                    {
                                        rx_entity obj = null;
                                        if (rx_manager.empty_entitys_and_view_entitys.ContainsKey(entity_name))
                                            obj = rx_manager.empty_entitys_and_view_entitys[entity_name].clone();
                                        else
                                            obj = new rx_entity(entity_name);
                                        for (int j = 0; j < keys.Length; j++)
                                            obj[keys[j]] = new rx_field(keys[j], dt.Rows[i][keys[j]], obj, date_time_format);

                                        list.Add(obj);
                                    }
                                    return list;
                                }
                        }
                    }
                }
            }

            public override List<T> execute_sql_or_proc<T>(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure)
            {
                string entity_name = typeof(T).Name;
                using (conn)
                {
                    using (OleDbCommand com = new OleDbCommand(sql, conn))
                    {
                        if (param_array != null)
                        {
                            com.CommandType = sql_type;
                            if (param_array.Length > 0)
                            {
                                com.Parameters.AddRange(param_array);
                            }
                        }
                        List<T> list = new List<T>();
                        switch (rx_manager.performance_mode)
                        {
                            case performance_mode.pool_first:
                                using (OleDbDataReader reader = com.ExecuteReader(CommandBehavior.CloseConnection))
                                {
                                    return entity_converter<T>.batch_data_loader(reader);
                                }
                            case performance_mode.memory_first:
                            default:
                                using (DataTable dt = new DataTable())
                                {
                                    using (OleDbDataAdapter da = new OleDbDataAdapter(com))
                                    {
                                        da.Fill(dt);
                                    }
                                    int row_count = dt.Rows.Count;
                                    string[] keys = new string[dt.Columns.Count];
                                    for (int i = 0; i < keys.Length; i++) keys[i] = dt.Columns[i].ColumnName;

                                    for (int i = 0; i < row_count; i++)
                                    {
                                        T entity = new T();
                                        for (int j = 0; j < keys.Length; j++)
                                            entity[keys[j]] = new rx_field(keys[j], dt.Rows[i][keys[j]], entity.rx_entity);
                                    }
                                    return list;
                                }
                        }
                    }
                }
            }

            public override int execute_non_query(string sql, SqlParameter[] param_array, CommandType sql_type = CommandType.StoredProcedure)
            {
                using (conn)
                {
                    using (OleDbCommand com = new OleDbCommand(sql, conn))
                    {
                        com.CommandTimeout = 1024;
                        if (param_array != null)
                        {
                            com.CommandType = sql_type;
                            if (param_array.Length > 0)
                            {
                                com.Parameters.AddRange(param_array);
                            }
                        }
                        return com.ExecuteNonQuery();
                    }
                }
            }
        }

        private class entity_converter<T>
            where T : rx_strong_type, new()
        {
            private static Converter<IDataReader, List<T>> _batch_data_loader;

            public static Converter<IDataReader, List<T>> batch_data_loader
            {
                get
                {
                    if (_batch_data_loader == null)
                    {
                        List<db_column_info> column_infos = new List<db_column_info>();
                        List<PropertyInfo> childs = typeof(T).GetProperties().ToList();
                        List<PropertyInfo> bases = typeof(rx_entity).GetProperties().ToList();
                        for (int i = 0; i < childs.Count; i++)
                        {
                            for (int j = 0; j < bases.Count; j++)
                            {
                                if (childs[i].Name == bases[j].Name)
                                {
                                    childs.RemoveAt(i);
                                    i--;
                                }
                            }
                        }
                        for (int i = 0; i < childs.Count; i++)
                        {
                            column_infos.Add(new db_column_info(childs[i]));
                        }
                        _batch_data_loader = data_teader_extensions<T>.CreateBatchDataLoader(column_infos);
                    }
                    return _batch_data_loader;
                }
            }
        }

        public struct db_column_info
        {
            public readonly string property_name;
            public readonly string column_name;
            public readonly Type type;
            public readonly MethodInfo set_method;

            public db_column_info(PropertyInfo prop)
            {
                property_name = prop.Name;
                column_name = prop.Name;
                type = prop.PropertyType;
                set_method = prop.GetSetMethod(false);
            }
        }

        public class data_teader_extensions<T>
            where T : rx_strong_type, new()
        {
            private static readonly MethodInfo data_record_item_getter_Int =
                typeof(IDataRecord).GetMethod("get_Item", new Type[] { typeof(int) });
            private static readonly MethodInfo data_record_get_ordinal =
                   typeof(IDataRecord).GetMethod("GetOrdinal");
            private static readonly MethodInfo data_reader_read =
            typeof(IDataReader).GetMethod("Read");
            private static readonly MethodInfo convert_is_db_null =
            typeof(Convert).GetMethod("IsDBNull");

            public static Converter<IDataReader, List<T>> CreateBatchDataLoader(List<db_column_info> columnInfoes = null)
            {

                DynamicMethod dm = new DynamicMethod(string.Empty, typeof(List<T>),
                         new Type[] { typeof(IDataReader) }, typeof(entity_converter<T>));

                ILGenerator il = dm.GetILGenerator();

                //声明List<T>
                LocalBuilder list = il.DeclareLocal(typeof(List<T>));

                //声明T
                LocalBuilder item = il.DeclareLocal(typeof(T));

                Label exit = il.DefineLabel();

                Label loop = il.DefineLabel();

                // List<T> list = new List<T>();
                il.Emit(OpCodes.Newobj, typeof(List<T>).GetConstructor(Type.EmptyTypes));
                il.Emit(OpCodes.Stloc_S, list);

                // [ int %index% = arg.GetOrdinal(%ColumnName%); ]
                LocalBuilder[] col_indices = get_column_indices(il, columnInfoes);

                // while (arg.Read()) {
                il.MarkLabel(loop);
                il.Emit(OpCodes.Ldarg_0);
                il.Emit(OpCodes.Callvirt, data_reader_read);
                il.Emit(OpCodes.Brfalse, exit);

                //T item = new T { %Property% =  };
                build_item(il, columnInfoes, item, col_indices);
                //      list.Add(item);
                il.Emit(OpCodes.Ldloc_S, list);
                il.Emit(OpCodes.Ldloc_S, item);
                il.Emit(OpCodes.Callvirt, typeof(List<T>).GetMethod("Add"));

                // }
                il.Emit(OpCodes.Br, loop);
                il.MarkLabel(exit);

                // return list;
                il.Emit(OpCodes.Ldloc_S, list);
                il.Emit(OpCodes.Ret);

                return (Converter<IDataReader, List<T>>)dm.CreateDelegate(typeof(Converter<IDataReader, List<T>>));
            }

            private static LocalBuilder[] get_column_indices(ILGenerator il, List<db_column_info> columnInfoes)
            {
                LocalBuilder[] colIndices = new LocalBuilder[columnInfoes.Count];
                for (int i = 0; i < colIndices.Length; i++)
                {
                    // int %index% = arg.GetOrdinal(%ColumnName%);
                    colIndices[i] = il.DeclareLocal(typeof(int));
                    il.Emit(OpCodes.Ldarg_0);
                    il.Emit(OpCodes.Ldstr, columnInfoes[i].column_name);
                    il.Emit(OpCodes.Callvirt, data_record_get_ordinal);
                    il.Emit(OpCodes.Stloc_S, colIndices[i]);
                }
                return colIndices;
            }

            private static void build_item(ILGenerator il, List<db_column_info> columnInfoes, LocalBuilder item, LocalBuilder[] colIndices)
            {
                // T item = new T();
                il.Emit(OpCodes.Newobj, typeof(T).GetConstructor(Type.EmptyTypes));
                il.Emit(OpCodes.Stloc_S, item);
                for (int i = 0; i < colIndices.Length; i++)
                {
                    Label common = il.DefineLabel();
                    il.Emit(OpCodes.Ldloc_S, item);
                    il.Emit(OpCodes.Ldarg_0);
                    il.Emit(OpCodes.Ldloc_S, colIndices[i]);
                    il.Emit(OpCodes.Callvirt, data_record_item_getter_Int);
                    il.Emit(OpCodes.Dup);
                    il.Emit(OpCodes.Call, convert_is_db_null);
                    il.Emit(OpCodes.Brfalse_S, common);
                    il.Emit(OpCodes.Pop);
                    il.Emit(OpCodes.Ldnull);
                    il.MarkLabel(common);
                    il.Emit(OpCodes.Unbox_Any, columnInfoes[i].type);
                    il.Emit(OpCodes.Callvirt, columnInfoes[i].set_method);
                }
            }


        }
    }
    #endregion
}