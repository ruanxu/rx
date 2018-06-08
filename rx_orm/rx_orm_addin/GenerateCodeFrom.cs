using EnvDTE;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using EnvDTE90;
using EnvDTE80;
using VSLangProj80;
using System.Xml;
using System.Net;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;

namespace rx_orm_addin
{
    public partial class GenerateCodeFrom : Form
    {
        private Project active_project { get; set; }
        private List<string> conn_list { get; set; }
        private Solution3 solution3 { get; set; }
        private DTE2 application_object { get; set; }
        private bool is_runing = false;
        public GenerateCodeFrom(DTE2 application_object)
        {
            this.active_project = (Project)((object[])application_object.ActiveSolutionProjects)[0];
            this.solution3 = (Solution3)application_object.Solution;
            this.application_object = application_object;
            InitializeComponent();
        }

        private void set_enable(bool is_enable)
        {
            foreach (Control item in this.Controls) item.Enabled = is_enable;
            apiJurisdictionChk.Enabled = false;
            methodChk.Enabled = false;
        }

        private void GenerateCodeFrom_Shown(object sender, EventArgs e)
        {
            this.serverProjectTypeCob.SelectedIndex = 0;
            this.apiUrlTxt.Text = "";
            this.conn_list = get_conns();
            foreach (Project item in this.solution3.Projects)
            {
                this.projectCob.Items.Add(item.Name);
            }
            this.projectCob.Text = this.active_project.Name;
            this.projectCob.SelectedIndexChanged += projectCob_SelectedIndexChanged;
            this.connsCob.Tag = "";
            this.connsCob.Items.Clear();
            if (this.conn_list.Count > 0)
            {
                this.connsCob.Items.AddRange(this.conn_list.ToArray());
                this.connsCob.SelectedIndex = 0;
            }
            else
            {
                this.connsCob.Text = "";
            }
            get_sql_object_count();
            //this.generateStatusLabel.Text = "";
        }

        private void connsCob_SelectedIndexChanged(object sender, EventArgs e)
        {
            this.connsCob.Tag = this.connsCob.Text;
            set_config();
            get_sql_object_count();

        }

        private void connsCob_Leave(object sender, EventArgs e)
        {
            if (this.connsCob.Text != this.connsCob.Tag.ToString())
            {
                this.connsCob.Tag = this.connsCob.Text;
                set_config();
                get_sql_object_count();
            }
        }

        private void connsCob_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (e.KeyChar == 13)
            {
                if (this.connsCob.Text != this.connsCob.Tag.ToString())
                {
                    this.connsCob.Tag = this.connsCob.Text;
                    get_sql_object_count();
                    set_config();
                    e.Handled = true;
                }
            }
        }

        private void folderTxt_TextChanged(object sender, EventArgs e)
        {
            int index = this.folderTxt.SelectionStart;

            this.folderTxt.Text = this.folderTxt.Text.Replace(@"/", @"\");

            this.folderTxt.SelectionStart = index;
        }

        private void scriptFolderTxt_TextChanged(object sender, EventArgs e)
        {
            int index = this.scriptFolderTxt.SelectionStart;

            this.scriptFolderTxt.Text = this.scriptFolderTxt.Text.Replace(@"/", @"\");

            this.scriptFolderTxt.SelectionStart = index;
        }

        private void apiUrlTxt_TextChanged(object sender, EventArgs e)
        {
            int index = this.apiUrlTxt.SelectionStart;

            this.apiUrlTxt.Text = this.apiUrlTxt.Text.Replace(@"/", @"\");

            this.apiUrlTxt.SelectionStart = index;
        }

        private void apiUrlTxt_Leave(object sender, EventArgs e)
        {
            if (this.serverProjectTypeCob.Enabled)
            {
                switch (this.serverProjectTypeCob.Text)
                {
                    case "asp_net_handle":
                        if (this.apiUrlTxt.Text.Substring(this.apiUrlTxt.Text.Trim().Replace(" ", "").LastIndexOf(".")).ToLower() != ".ashx")
                        {
                            this.apiUrlTxt.Text = this.apiUrlTxt.Text.Replace(".", "").Replace("。", "") + ".ashx";
                        }
                        break;
                    case "asp_net_web_form":
                        if (this.apiUrlTxt.Text.Substring(this.apiUrlTxt.Text.Trim().Replace(" ", "").LastIndexOf(".")).ToLower() != ".aspx")
                        {
                            this.apiUrlTxt.Text += this.apiUrlTxt.Text.Replace(".", "").Replace("。", "") + ".aspx";
                        }
                        break;
                    case "asp_net_mvc":
                    case "asp_net_mvc_api":
                        this.apiUrlTxt.Text = Regex.Replace(this.apiUrlTxt.Text, ".cs|", "", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                        break;
                }
            }
            else
            {
                string out_string = "";
                if (validate_front_orm_api_url(this.apiUrlTxt.Text.Trim(), ref out_string).Contains("error"))
                {
                    MessageBox.Show("前端orm的接口地址验证无效\n" + out_string, "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    is_runing = false;
                    set_enable(true);
                    this.generateStatusLabel.Text = "请调整设置后再次生成！";
                    return;
                }
                else
                {
                    try
                    {
                        Dictionary<string, object> dic = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(out_string);
                        MessageBox.Show(string.Format("rx后端orm版本：{0}\n接口类型：{1}\n基础权限：{2}\n添加权限：{3}\n修改权限：{4}\n删除权限：{5}\n存储过程：{6}",
                                    dic["version"].ToString(),
                                    dic["api_type"].ToString(),
                                    dic["i_rx_risk"].ToString(),
                                    dic["i_rx_risk_insert"].ToString(),
                                    dic["i_rx_risk_update"].ToString(),
                                    dic["i_rx_risk_delete"].ToString(),
                                    dic["i_rx_risk_proc"].ToString()
                                    )
                                    , "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("远程http地址请求结果验证失败！\n" + ex.Message, "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        is_runing = false;
                        set_enable(true);
                        this.generateStatusLabel.Text = "请调整设置后重新生成！";
                        return;
                    }
                }
            }
        }

        private void projectCob_SelectedIndexChanged(object sender, EventArgs e)
        {
            foreach (Project pro in solution3.Projects)
            {
                if (pro.Name == projectCob.Text)
                {
                    this.active_project = pro;
                    //this.conns = get_conns(this.active_project);
                    this.connsCob.Tag = "";
                    this.connsCob.Items.Clear();
                    if (this.conn_list.Count > 0)
                    {
                        this.connsCob.Items.AddRange(this.conn_list.ToArray());
                        this.connsCob.SelectedIndex = 0;
                    }
                    else
                    {
                        this.connsCob.Text = "";
                    }
                    get_sql_object_count();
                    break;
                }
            }
        }

        private void GenerateCodeFrom_FormClosing(object sender, FormClosingEventArgs e)
        {
            e.Cancel = this.is_runing;
        }

        private List<string> get_conns()
        {
            this.application_object.Documents.SaveAll();
            this.application_object.Documents.CloseAll();
            List<string> conn_list = new List<string>();
            foreach (Project project in this.solution3.Projects)
            {
                //if (project.FullName.Trim() == "") return conns;
                try
                {
                    if (project.FullName.Trim() == "") continue;
                }
                catch (Exception) { continue; }
                string[] files = Directory.GetFiles(new FileInfo(project.FullName).DirectoryName);

                for (int i = 0; i < files.Length; i++)
                {
                    if (files[i].Substring(files[i].LastIndexOf(".")).ToLower() == ".config")
                    {
                        FileInfo file = new FileInfo(files[i]);
                        try
                        {
                            project.ProjectItems.Item(file.Name).Open();
                        }
                        catch (Exception) { continue; }


                        TextDocument td = null;
                        try
                        {
                            td = (application_object.Documents.Item(file.Name).Object("TextDocument") as TextDocument);
                            td.Selection.SelectAll();
                        }
                        catch (Exception) { continue; }


                        XmlDocument doc = new XmlDocument();
                        doc.InnerXml = td.Selection.Text;
                        XmlNodeList nodes = doc.GetElementsByTagName("connectionStrings");
                        if (nodes.Count > 0)
                        {
                            XmlNode node = nodes[0];
                            foreach (XmlNode n in node.ChildNodes)
                            {
                                if (n.Attributes != null && n.Attributes["connectionString"] != null)
                                {
                                    try
                                    {
                                        conn_list.Add(n.Attributes["connectionString"].Value);
                                    }
                                    catch (Exception) { }
                                }
                            }
                        }
                    }
                }
            }
            return conn_list.Distinct().ToList();
        }

        private int get_sql_object_count()
        {
            if (this.connsCob.Text.Trim() == "")
            {
                generateBtn.Enabled = false;
                this.entityCountLab.Text = "物理表数量：0";
                this.entityCountLab.Tag = null;
                this.viewCountLab.Text = "视图数量：0";
                this.viewCountLab.Tag = null;
                this.procedureCountLab.Text = "存储过程：0";
                this.procedureCountLab.Tag = null;

                this.generateStatusLabel.Text = "请填写连接字符串！";
                return 0;
            }
            int table_count = 0;
            int view_count = 0;
            int procedure_count = 0;
            try
            {
                rx_ms_sql_dbhelper.conn_str = this.connsCob.Text;
                string sql = "select(Select cast(name as varchar(max)) + ',' FROM SysObjects Where XType='U' for xml path(''))";
                string value = rx_ms_sql_dbhelper.execute_sql_or_proc(sql).Rows[0][0].ToString();
                value = value.Trim() == "" ? "" : value.Substring(0, value.Length - 1);
                this.entityCountLab.Text = "物理表数量：" + (value.Trim() == "" ? 0 : value.Split(',').Length);
                table_count += value.Trim() == "" ? 0 : value.Split(',').Length;
                this.entityCountLab.Tag = value;

                sql = "select (select cast(name as varchar(max)) + ',' from sysobjects where xtype='V' for xml path(''))";
                value = rx_ms_sql_dbhelper.execute_sql_or_proc(sql).Rows[0][0].ToString();
                value = value.Trim() == "" ? "" : value.Substring(0, value.Length - 1);
                this.viewCountLab.Text = "视图数量：" + (value.Trim() == "" ? 0 : value.Split(',').Length);
                view_count += value.Trim() == "" ? 0 : value.Split(',').Length;
                this.viewCountLab.Tag = value;

                sql = "select(select cast(name as varchar(max)) + ',' from sysobjects where xtype='P' for xml path(''))";
                value = rx_ms_sql_dbhelper.execute_sql_or_proc(sql).Rows[0][0].ToString();
                value = value.Trim() == "" ? "" : value.Substring(0, value.Length - 1);
                this.procedureCountLab.Text = "存储过程：" + (value.Trim() == "" ? 0 : value.Split(',').Length);
                procedure_count += value.Trim() == "" ? 0 : value.Split(',').Length;
                this.procedureCountLab.Tag = value;

                generateBtn.Enabled = true;
                this.generateStatusLabel.Text = "可以进行生成！";
            }
            catch (Exception ex)
            {
                generateBtn.Enabled = false;
                this.entityCountLab.Text = "物理表数量：0";
                this.entityCountLab.Tag = null;
                this.viewCountLab.Text = "视图数量：0";
                this.viewCountLab.Tag = null;
                this.procedureCountLab.Text = "存储过程：0";
                this.procedureCountLab.Tag = null;

                this.generateStatusLabel.Text = "连接到sql发生错误！";
                MessageBox.Show(ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            return table_count + view_count + procedure_count;
        }
        System.Threading.Thread thread = null;
        private string outer_project_type = "";
        private void generateBtn_Click(object sender, EventArgs e)
        {
            outer_project_type = "";
            if (!this.frontChk.Checked && !this.backChk.Checked)
            {
                MessageBox.Show("前端orm与后端orm不能都不选择！", "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            if (this.frontChk.Checked)
            {
                if (!validate_project_type(this.serverProjectTypeCob.Text, true))
                {
                    return;
                }
            }
            if (this.frontChk.Checked && this.apiUrlTxt.Text.Trim() == "")
            {
                MessageBox.Show("如何口选了前端orm就要求接口地址不能为空！", "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            is_runing = true;
            set_enable(false);

            string[] entity_array = this.entityCountLab.Tag.ToString().Trim() == "" ? new string[0] : this.entityCountLab.Tag.ToString().Trim().Split(',');
            int entity_count = entity_array.Length;
            string[] view_array = this.viewCountLab.Tag.ToString().Trim() == "" ? new string[0] : this.viewCountLab.Tag.ToString().Trim().Split(',');
            int view_count = view_array.Length;
            string[] procedure_array = this.procedureCountLab.Tag.ToString().Trim() == "" ? new string[0] : this.procedureCountLab.Tag.ToString().Trim().Split(',');
            int procedure_count = procedure_array.Length;

            int object_count = entity_count + view_count + procedure_count;

            thread = new System.Threading.Thread(delegate()
            {
                generateProgressBar.Value = 0;

                if (this.frontChk.Checked)
                {
                    if (!this.isProjectGenerateChk.Checked)
                    {
                        this.generateStatusLabel.Text = "正在验证前端orm接口地址......";
                        string out_string = "";
                        if (validate_front_orm_api_url(this.apiUrlTxt.Text.Trim(), ref out_string).Contains("error"))
                        {
                            MessageBox.Show("前端orm的接口地址验证无效\n" + out_string, "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            is_runing = false;
                            set_enable(true);
                            this.generateStatusLabel.Text = "请调整设置后重新生成！";
                            return;
                        }
                        else
                        {
                            try
                            {
                                Dictionary<string, object> dic = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(out_string);
                                dic["version"].ToString();
                                outer_project_type = dic["api_type"].ToString();
                                dic["i_rx_risk"].ToString();
                                dic["i_rx_risk_insert"].ToString();
                                dic["i_rx_risk_update"].ToString();
                                dic["i_rx_risk_delete"].ToString();
                                dic["i_rx_risk_proc"].ToString();
                            }
                            catch (Exception ex)
                            {
                                MessageBox.Show("远程http地址请求结果验证失败！\n" + ex.Message, "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                                is_runing = false;
                                set_enable(true);
                                this.generateStatusLabel.Text = "请调整设置后重新生成！";
                                return;
                            }
                        }
                    }
                    else
                    {
                        this.generateStatusLabel.Text = "正在生成前端api接口......";
                        generate_front_api_action(this.apiUrlTxt.Text.Trim());
                        //set_enable(true);
                        //is_runing = false;
                        //return;
                    }
                }

                FileInfo projectFile = new FileInfo(this.active_project.FullName);

                string[] folder_array = this.folderTxt.Text.Trim() != "" ? this.folderTxt.Text.Split('\\') : new string[0];

                this.generateStatusLabel.Text = "正在引用rx.dll......";
                import_rx_dll(this.active_project);

                this.generateStatusLabel.Text = "正在清理项目路径......";
                if (folder_array.Length > 0)
                {
                    try
                    {
                        this.active_project.ProjectItems.Item(folder_array[0]).Delete();
                    }
                    catch (Exception) { }

                    if (Directory.Exists(projectFile.DirectoryName + "\\" + folder_array[0]))
                    {
                        Directory.Delete(projectFile.DirectoryName + "\\" + folder_array[0], true);
                    }
                }

                try
                {
                    this.generateStatusLabel.Text = "正在创建实体目录......";
                    ProjectItems p_items = active_project.ProjectItems;
                    string director_name = new FileInfo(active_project.FullName).DirectoryName;
                    if (this.backChk.Checked)
                    {
                        for (int i = 0; i < folder_array.Length; i++)
                        {
                            p_items.AddFolder(folder_array[i]);
                            ProjectItem pItem = p_items.Item(folder_array[i]);
                            p_items = pItem.ProjectItems;
                            director_name += "//" + folder_array[i];
                        }
                    }

                    ProjectItems mode_project_items = p_items;

                    this.generateStatusLabel.Text = "正在获取CSharp Class模版......";
                    string templatePath = solution3.GetProjectItemTemplate("Class.zip", "CSharp");
                    this.generateStatusLabel.Text = "准备生成rx系列强实体类......";
                    this.application_object.Documents.CloseAll();
                    StringBuilder script_text = new StringBuilder();
                    for (int i = 0; i < object_count; i++)
                    {
                        //Model
                        script_text.Append("\r/*models ----------begin*/\r\r");
                        for (int j = 0; j < entity_array.Length; j++)
                        {
                            this.generateProgressBar.Value = (int)Math.Round(((float)(i + 1) / (float)object_count) * 100);
                            this.generateStatusLabel.Text = string.Format("M:{0}/{1}  {2} ......", j + 1, entity_array.Length, entity_array[j]);

                            try
                            {
                                p_items.Item(entity_array[j] + ".cs").Remove();
                            }
                            catch { }
                            try
                            {
                                File.Delete(director_name + "//" + entity_array[j] + ".cs");
                            }
                            catch { }

                            Document doc = null;
                            TextDocument text_doc = null;
                            if (this.backChk.Checked)
                            {
                                p_items.AddFromTemplate(templatePath, entity_array[j] + ".cs");

                                doc = this.application_object.Documents.Item(entity_array[j] + ".cs");
                                text_doc = (doc.Object("TextDocument") as TextDocument);
                                text_doc.Selection.LineDown(false, 5);
                                text_doc.Selection.Insert("using System.Web;\rusing Newtonsoft.Json;\rusing rx;\r");

                                text_doc.Selection.LineDown(false, 3);
                                text_doc.Selection.CharRight(false, 4);
                                text_doc.Selection.Insert("public ");

                                text_doc.Selection.EndOfLine(false);
                                text_doc.Selection.Insert(": rx_model<" + entity_array[j] + ">");

                                text_doc.Selection.LineDown(false, 1);
                            }
                            string sql = string.Format("SELECT COLUMN_NAME,IS_NULLABLE,DATA_TYPE FROM INFORMATION_SCHEMA.columns WHERE TABLE_NAME='{0}'", entity_array[j]);
                            StringBuilder code = new StringBuilder();
                            using (DataTable dt = rx_ms_sql_dbhelper.execute_sql_or_proc(sql))
                            {
                                bool contain_id = false;
                                script_text.Append(@"function " + entity_array[j] + @"(instance_json) {
    rx_model.call(this, """ + entity_array[j] + @""", instance_json);" + "\r");
                                foreach (DataRow row in dt.Rows)
                                {
                                    if (row["COLUMN_NAME"].ToString().Trim() == "id")
                                    {
                                        contain_id = true;
                                    }
                                    code.Append(
                                    db_type_to_property_code
                                    (
                                        entity_array[j],
                                        row["DATA_TYPE"].ToString().Trim(),
                                        row["COLUMN_NAME"].ToString().Trim(),
                                        row["IS_NULLABLE"].ToString().Trim()
                                    ) + "\r");

                                    script_text.Append(db_type_to_property_script_code
                                    (
                                    row["COLUMN_NAME"].ToString()
                                    ) + "\r");
                                }
                                script_text.Append("\r" + @"}
(function () { var Super = function () { }; Super.prototype = rx_model.prototype; " + entity_array[j] + @".prototype = new Super(); for (var key in rx_model.static_method) { " + entity_array[j] + @"[key] = rx_model.static_method[key]; } })();" + "\r");

                                if (!contain_id)
                                {
                                    MessageBox.Show("表：" + entity_array[j] + " 中不包含主键字段id，rx orm要物理表中必须存在一个主键int类型自增(1-N)字段id，必须是小写的id，这个要求并不过分！", "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                                    set_enable(true);
                                    is_runing = false;
                                    generateProgressBar.Value = 0;
                                    this.generateStatusLabel.Text = "生成已经中断";
                                    return;
                                }
                            }

                            code.Append(generate_entity_method_code(entity_array[j]));

                            if (this.backChk.Checked)
                            {
                                text_doc.Selection.Insert(code.ToString());

                                text_doc.Selection.SmartFormat();
                                doc.Save();
                            }

                            if (i % 10 == 0)
                            {
                                this.application_object.Documents.CloseAll();
                            }
                            i++;
                        }
                        script_text.Append("\r/*models ----------end*/\r");

                        //View
                        script_text.Append("\r/*views ----------begin*/\r\r");
                        try
                        {
                            p_items.Item("View").Delete();
                        }
                        catch (Exception) { }
                        if (Directory.Exists(projectFile.DirectoryName + "\\" + string.Join("\\", folder_array) + "\\Views"))
                        {
                            Directory.Delete(projectFile.DirectoryName + "\\" + string.Join("\\", folder_array) + "\\Views", true);
                        }
                        try
                        {
                            if (this.backChk.Checked)
                            {
                                p_items.AddFolder("Views");
                                ProjectItem pItem = p_items.Item("Views");
                                p_items = pItem.ProjectItems;
                                director_name += "//Views";
                            }
                        }
                        catch { }
                        for (int j = 0; j < view_array.Length; j++)
                        {
                            this.generateProgressBar.Value = (int)Math.Round(((float)(i + 1) / (float)object_count) * 100);
                            this.generateStatusLabel.Text = string.Format("V:{0}/{1}  {2} ......", j + 1, view_array.Length, view_array[j]);
                            try
                            {
                                p_items.Item(view_array[j] + ".cs").Remove();
                            }
                            catch { }
                            try
                            {
                                File.Delete(director_name + "//" + view_array[j] + ".cs");
                            }
                            catch { }

                            Document doc = null;
                            TextDocument text_doc = null;
                            if (this.backChk.Checked)
                            {
                                p_items.AddFromTemplate(templatePath, view_array[j] + ".cs");

                                doc = this.application_object.Documents.Item(view_array[j] + ".cs");
                                text_doc = (doc.Object("TextDocument") as TextDocument);
                                text_doc.Selection.LineDown(false, 5);
                                text_doc.Selection.Insert("using System.Web;\rusing Newtonsoft.Json;\rusing rx;\r");

                                text_doc.Selection.LineDown(false, 3);
                                text_doc.Selection.CharRight(false, 4);
                                text_doc.Selection.Insert("public ");

                                text_doc.Selection.EndOfLine(false);
                                text_doc.Selection.Insert(": rx_view<" + view_array[j] + ">");

                                text_doc.Selection.LineDown(false, 1);
                            }
                            string sql = string.Format("SELECT COLUMN_NAME,IS_NULLABLE,DATA_TYPE FROM INFORMATION_SCHEMA.columns WHERE TABLE_NAME='{0}'", view_array[j]);
                            StringBuilder code = new StringBuilder();
                            string view_first_column = null;
                            using (DataTable dt = rx_ms_sql_dbhelper.execute_sql_or_proc(sql))
                            {
                                script_text.Append(@"function " + view_array[j] + @"(instance_json) {
    rx_view.call(this, """ + view_array[j] + @""", instance_json);" + "\r");
                                foreach (DataRow row in dt.Rows)
                                {
                                    code.Append(
                                    db_type_to_property_code
                                    (
                                        view_array[j],
                                        row["DATA_TYPE"].ToString().Trim(),
                                        row["COLUMN_NAME"].ToString().Trim(),
                                        row["IS_NULLABLE"].ToString().Trim()
                                    ) + "\r");
                                    if (view_first_column == null) view_first_column = row["COLUMN_NAME"].ToString();

                                    script_text.Append(db_type_to_property_script_code
                                    (
                                    row["COLUMN_NAME"].ToString()
                                    ) + "\r");
                                }
                                script_text.Append("\r" + @"}
(function () { var Super = function () { }; Super.prototype = rx_view.prototype; " + view_array[j] + @".prototype = new Super(); for (var key in rx_view.static_method) { " + view_array[j] + @"[key] = rx_view.static_method[key]; } " + view_array[j] + @".view_first_column = """ + view_first_column + @"""; })();" + "\r");
                            }

                            code.Append(generate_view_method_code(view_array[j], view_first_column));

                            if (this.backChk.Checked)
                            {
                                text_doc.Selection.Insert(code.ToString());

                                text_doc.Selection.SmartFormat();
                                doc.Save();
                            }

                            if (i % 10 == 0)
                            {
                                this.application_object.Documents.CloseAll();
                            }
                            i++;
                        }
                        script_text.Append("\r/*views ----------end*/\r");

                        //Procedure
                        script_text.Append("\r/*procedures ----------begin*/\r\r");
                        try
                        {
                            p_items.Item("Procedures").Delete();
                        }
                        catch (Exception) { }
                        if (Directory.Exists(projectFile.DirectoryName + "\\" + string.Join("\\", folder_array) + "\\Procedures"))
                        {
                            Directory.Delete(projectFile.DirectoryName + "\\" + string.Join("\\", folder_array) + "\\Procedures", true);
                        }
                        try
                        {
                            if (this.backChk.Checked)
                            {
                                p_items = mode_project_items;
                                p_items.AddFolder("Procedures");
                                ProjectItem pItem = p_items.Item("Procedures");
                                p_items = pItem.ProjectItems;
                                director_name += "//Procedures";
                            }
                        }
                        catch { }
                        for (int j = 0; j < procedure_array.Length; j++)
                        {
                            this.generateProgressBar.Value = (int)Math.Round(((float)(i + 1) / (float)object_count) * 100);
                            this.generateStatusLabel.Text = string.Format("P:{0}/{1}  {2} ......", j + 1, procedure_array.Length, procedure_array[j]);
                            try
                            {
                                p_items.Item(procedure_array[j] + ".cs").Remove();
                            }
                            catch { }
                            try
                            {
                                File.Delete(director_name + "//" + procedure_array[j] + ".cs");
                            }
                            catch { }

                            Document doc = null;
                            TextDocument text_doc = null;
                            if (this.backChk.Checked)
                            {
                                p_items.AddFromTemplate(templatePath, procedure_array[j] + ".cs");

                                doc = this.application_object.Documents.Item(procedure_array[j] + ".cs");
                                text_doc = (doc.Object("TextDocument") as TextDocument);
                                text_doc.Selection.LineDown(false, 5);
                                text_doc.Selection.Insert("using System.Web;\rusing rx;\r");

                                text_doc.Selection.LineDown(false, 3);
                                text_doc.Selection.CharRight(false, 4);
                                text_doc.Selection.Insert("public ");

                                text_doc.Selection.EndOfLine(false);
                                text_doc.Selection.Insert("");

                                text_doc.Selection.LineDown(false, 1);
                            }
                            string sql = string.Format("select syscolumns.name,syscolumns.length,syscolumns.isnullable,syscolumns.isoutparam,sys.types.name as type_name from syscolumns join sys.types  on syscolumns.xusertype = sys.types.system_type_id where id=object_id('{0}') ", procedure_array[j]);
                            StringBuilder code = new StringBuilder();
                            List<Dictionary<string, object>> param_info = new List<Dictionary<string, object>>();
                            using (DataTable dt = rx_ms_sql_dbhelper.execute_sql_or_proc(sql))
                            {
                                foreach (DataRow row in dt.Rows)
                                {
                                    Dictionary<string, object> info = new Dictionary<string, object>();
                                    foreach (DataColumn key in dt.Columns)
                                    {
                                        info.Add(key.ColumnName, row[key.ColumnName]);
                                    }
                                    param_info.Add(info);
                                }
                            }
                            script_text.Append(@"var " + procedure_array[j] + @" = {" + "\r");
                            code.Append(generate_procedure_method_code(procedure_array[j], param_info));
                            script_text.Append(generate_procedure_method_script_code(procedure_array[j], param_info));
                            script_text.Append("\r" + "}" + "\r");
                            if (this.backChk.Checked)
                            {
                                text_doc.Selection.Insert(code.ToString());

                                text_doc.Selection.SmartFormat();
                                doc.Save();
                            }

                            if (i % 10 == 0)
                            {
                                this.application_object.Documents.CloseAll();
                            }
                            i++;
                        }
                        script_text.Append("\r/*procedures ----------end*/\r");
                    }
                    if (this.frontChk.Checked)
                    {
                        this.generateStatusLabel.Text = "正在导入rx前端orm脚本";
                        import_rx_javascript(this.active_project, script_text.ToString());
                    }

                }
                catch (Exception ex)
                {
                    generateProgressBar.Value = 0;
                    set_enable(true);
                    frontChk_CheckedChanged(this.frontChk, null);
                    this.application_object.Documents.SaveAll();
                    this.application_object.Documents.CloseAll();
                    this.generateStatusLabel.Text = "生成错误，生成结束！";
                    MessageBox.Show(ex.Message, "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    is_runing = false;
                }
                generateProgressBar.Value = 0;
                set_enable(true);
                frontChk_CheckedChanged(this.frontChk, null);
                this.active_project.Save();
                this.application_object.Documents.SaveAll();
                this.application_object.Documents.CloseAll();
                this.generateStatusLabel.Text = "生成完毕！";
                is_runing = false;
            });
            thread.IsBackground = true;
            thread.Start();
        }

        private void import_rx_dll(Project project)
        {
            VSProject2 pro = (VSProject2)project.Object;

            FileInfo projectFile = new FileInfo(project.FullName);

            if (pro.References.Find("rx") != null)
            {
                pro.References.Find("rx").Remove();
            }
            if (pro.References.Find("Newtonsoft.Json") != null)
            {
                pro.References.Find("Newtonsoft.Json").Remove();
            }
            if (pro.References.Find("System.Web") == null)
            {
                pro.References.Add("System.Web");
            }

            if (!Directory.Exists(projectFile.DirectoryName + "/lib"))
            {
                Directory.CreateDirectory(projectFile.DirectoryName + "/lib");
            }

            using (FileStream fs = new FileStream(projectFile.DirectoryName + "/lib/rx.dll", FileMode.Create))
            {
                fs.Write(rx_orm_addin.Properties.Resources.rx, 0, rx_orm_addin.Properties.Resources.rx.Length);
            }
            using (FileStream fs = new FileStream(projectFile.DirectoryName + "/lib/rx.xml", FileMode.Create))
            {
                using (StreamWriter sw = new StreamWriter(fs, System.Text.Encoding.UTF8))
                {
                    sw.Write(rx_orm_addin.Properties.Resources.rx_xml);
                    sw.Flush();
                }
            }
            using (FileStream fs = new FileStream(projectFile.DirectoryName + "/lib/Newtonsoft.Json.dll", FileMode.Create))
            {
                fs.Write(rx_orm_addin.Properties.Resources.Newtonsoft_Json, 0, rx_orm_addin.Properties.Resources.Newtonsoft_Json.Length);
            }


            pro.References.Add(projectFile.DirectoryName + @"\lib\rx.dll");
            pro.References.Add(projectFile.DirectoryName + @"\lib\Newtonsoft.Json.dll");
            pro.Refresh();
        }

        private void import_rx_javascript(Project project, string script_text = "")
        {
            try
            {
                string[] folder_array = this.scriptFolderTxt.Text.Trim() != "" ? this.scriptFolderTxt.Text.Split('\\') : new string[0];
                string director_name = new FileInfo(project.FullName).DirectoryName + "\\" + string.Join("\\", folder_array);
                ProjectItems p_items = project.ProjectItems;
                for (int i = 0; i < folder_array.Length; i++)
                {
                    try
                    {
                        bool reg = false;
                        foreach (ProjectItem item in p_items)
                        {
                            if (item.Name == folder_array[i])
                            {
                                p_items = item.ProjectItems;
                                reg = true;
                                break;
                            }
                        }
                        if (!reg)
                        {
                            p_items.AddFolder(folder_array[i]);
                            p_items = p_items.Item(folder_array[i]).ProjectItems;
                        }
                    }
                    catch
                    {
                        p_items.AddFolder(folder_array[i]);
                        p_items = p_items.Item(folder_array[i]).ProjectItems;
                    }
                }
                string templatePath = solution3.GetProjectItemTemplate("Class.zip", "CSharp");
                this.application_object.Documents.CloseAll();
                try { p_items.Item("rx.js").Remove(); }
                catch { }
                try { File.Delete(director_name + "\\" + "rx.js"); }
                catch { }
                p_items.AddFromTemplate(templatePath, "rx.js");
                Document doc = this.application_object.Documents.Item("rx.js");
                TextDocument textDoc = (doc.Object("TextDocument") as TextDocument);
                textDoc.Selection.SelectAll();
                textDoc.Selection.Delete();
                textDoc.Selection.Insert(Properties.Resources.rx_js);

                try { p_items.Item("rx_manager.js").Remove(); }
                catch { }
                try { File.Delete(director_name + "\\" + "rx_manager.js"); }
                catch { }
                p_items.AddFromTemplate(templatePath, "rx_manager.js");
                doc = this.application_object.Documents.Item("rx_manager.js");
                textDoc = (doc.Object("TextDocument") as TextDocument);
                textDoc.Selection.SelectAll();
                textDoc.Selection.Delete();
                textDoc.Selection.Insert(Properties.Resources.rx_manager.Replace("{$server_url}", (this.serverProjectTypeCob.Text == "asp_net_mvc_api" && this.isProjectGenerateChk.Checked ? "/api/v1" : "") + this.apiUrlTxt.Text.Replace("\\", "/").Trim()).Replace("{$project_type}", outer_project_type.Trim() != "" ? outer_project_type : this.serverProjectTypeCob.Text.Trim()) + "\r" + script_text);

                this.application_object.Documents.SaveAll();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.ToString());
                is_runing = false;
            }
        }

        private static Type sql_db_type = typeof(SqlDbType);
        private string db_type_to_property_code(string entity_name, string sql_db_type_string, string field_name, string is_nullable)
        {
            switch (sql_db_type_string.ToLower())
            {
                case "sql_variant":
                    sql_db_type_string = "Variant";
                    break;
                case "numeric":
                case "smallmoney":
                    sql_db_type_string = "decimal";
                    break;
                case "geography":
                case "geometry":
                case "hierarchyid":
                    sql_db_type_string = "Binary";
                    break;
            }

            SqlDbType type = (SqlDbType)Enum.Parse(sql_db_type, sql_db_type_string, true);

            bool is_null = is_nullable.ToLower() == "yes";
            string code = @"
        /// <summary>
        /// 表或视图 " + entity_name + @" 的字段 " + field_name + @"
        /// </summary>{@attribute}
        public {$type} " + field_name + @"
        {
            get
            {
                {$getcode}
            }
            set
            {
                this[""" + field_name + @"""].value = value;
            }
        }
        
        /// <summary>
        /// 这个方法是为了方便这个对象key值为" + field_name + @"的rx_field对象的成员进行属性和枚举的再赋值，常用于一次性where条件查询、删除、更新
        /// <para>【注意】执行这个方法会直接在where_key中加入这个key,已经存在同名key将不会重复加入</para>
        /// <para>链式操作，不需要再实例化对象的时候声明局部变量了,</para>
        /// <para>命名参数，可以使用命名参数的方式进行传值更加简化传参操作（例子: compare: compare_symbol.contain）</para>
        /// </summary>
        /// <param name=""compare"">sql语句中的条件运算符，compare_symbol枚举</param>
        /// <param name=""logic"">sql语句中的逻辑运算符，logic_symbol枚举</param>
        /// <param name=""date_format_type"">base_value对时间数据的格式化方式</param>
        /// <param name=""auto_remove"">在生成sql语句时这个字段是否会自动被删除</param>
        /// <param name=""build_quote"">在生成sql语句时这个字段是否会生成单引号(')</param>
        /// <param name=""value"">条件语句(in或者not in)操作时因为属性" + field_name + @"是强类型的，可能不能赋值你要求的值，这个时候可以使用这个参数来解决</param>
        /// <returns>正在被操作的实体对象</returns>
        public " + entity_name + @" set_" + field_name + @"_field(compare_symbol? compare = null, logic_symbol? logic = null, date_format_type? date_format_type = null, bool? auto_remove = null, bool? build_quote = null, object value = null)
        {
            return set_rx_field(""" + field_name + @""", compare, logic, date_format_type, auto_remove, build_quote, value);
        }";

            switch (type)
            {
                case SqlDbType.BigInt:
                    //long
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "long?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as long?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "long").
                               Replace("{$getcode}", @"return Convert.ToInt64(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Bit:
                    //bool
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "bool?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as bool?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "bool").
                               Replace("{$getcode}", @"return Convert.ToBoolean(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Char:
                case SqlDbType.NChar:
                case SqlDbType.NText:
                case SqlDbType.NVarChar:
                case SqlDbType.Text:
                case SqlDbType.Time:
                case SqlDbType.VarChar:
                case SqlDbType.Xml:
                    //string
                    code = code.
                           Replace("{$type}", "string").
                           Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as string;");
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Date:
                case SqlDbType.DateTime:
                case SqlDbType.DateTime2:
                case SqlDbType.SmallDateTime:
                    //DateTime
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "DateTime?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as DateTime?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "DateTime").
                               Replace("{$getcode}", @"return Convert.ToDateTime(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "\n        [JsonConverter(typeof(date_time_converter))]");
                    break;
                case SqlDbType.DateTimeOffset:
                    //DateTimeOffset
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "DateTimeOffset?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as DateTimeOffset?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "DateTimeOffset").
                               Replace("{$getcode}", @"return (DateTimeOffset)(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Decimal:
                case SqlDbType.Money:
                    //decimal
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "decimal?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as decimal?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "decimal").
                               Replace("{$getcode}", @"return Convert.ToDecimal(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Float:
                    //float
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "float?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as float?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "float").
                               Replace("{$getcode}", @"return (float)Convert.ToDecimal(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Binary:
                case SqlDbType.Image:
                case SqlDbType.Timestamp:
                case SqlDbType.VarBinary:
                    //byte[]
                    code = code.
                           Replace("{$type}", "byte[]").
                           Replace("{$getcode}", @"return (byte[])this[""" + field_name + @"""].base_value;");
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Int:
                    //int
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "int?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as int?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "int").
                               Replace("{$getcode}", @"return Convert.ToInt32(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Real:
                    //Single
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "Single?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as Single?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "Single").
                               Replace("{$getcode}", @"return Convert.ToSingle(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.SmallInt:
                    //short
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "short?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as short?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "short").
                               Replace("{$getcode}", @"return Convert.ToInt16(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.TinyInt:
                    //byte
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "byte?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as byte?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "byte").
                               Replace("{$getcode}", @"return Convert.ToByte(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.UniqueIdentifier:
                    //Guid
                    if (is_null)
                    {
                        code = code.
                               Replace("{$type}", "Guid?").
                               Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value as Guid?;");
                    }
                    else
                    {
                        code = code.
                               Replace("{$type}", "Guid").
                               Replace("{$getcode}", @"return (Guid)(this[""" + field_name + @"""].base_value);");
                    }
                    code = code.Replace("{@attribute}", "");
                    break;
                case SqlDbType.Structured:
                case SqlDbType.Udt:
                case SqlDbType.Variant:
                default:
                    //object
                    code = code.
                           Replace("{$type}", "object").
                           Replace("{$getcode}", @"return this[""" + field_name + @"""].base_value;");
                    code = code.Replace("{@attribute}", "");
                    break;
            }
            return code;
        }

        private string db_type_to_property_script_code(string field_name)
        {
            string code = @"    create_rx_get_and_set_property(this, """ + field_name + @""");
    this[""set_" + field_name + @"_field""] = function (json_option) { return this.set_rx_field(""" + field_name + @""", json_option); }";
            return code;
        }

        private string generate_entity_method_code(string entity_name)
        {
            StringBuilder code = new StringBuilder();

            string template = @"";

            return code.ToString();
        }

        private string generate_view_method_code(string view_name, string view_first_column)
        {
            StringBuilder code = new StringBuilder();

            string template = @"";

            return code.ToString();
        }

        private string generate_procedure_method_code(string proc_name, List<Dictionary<string, object>> param_info)
        {
            StringBuilder method_param = new StringBuilder();
            StringBuilder parameter_string = new StringBuilder();
            StringBuilder out_value_string = new StringBuilder();
            for (int i = 0; i < param_info.Count; i++)
            {
                bool is_null = Convert.ToInt32(param_info[i]["isnullable"]) == 1;
                bool is_out = Convert.ToInt32(param_info[i]["isoutparam"]) == 1;
                parameter_string.AppendFormat(@"{0}new System.Data.SqlClient.SqlParameter(""{1}"", {2}){3}", parameter_string.Length > 0 ? ",\n                " : "", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), is_out ? "{ Direction = System.Data.ParameterDirection.Output }" : "");
                string sql_db_type_string = param_info[i]["type_name"].ToString();
                switch (sql_db_type_string.ToLower())
                {
                    case "sql_variant":
                        sql_db_type_string = "Variant";
                        break;
                    case "numeric":
                    case "smallmoney":
                        sql_db_type_string = "decimal";
                        break;
                    case "geography":
                    case "geometry":
                    case "hierarchyid":
                        sql_db_type_string = "Binary";
                        break;
                }

                SqlDbType type = (SqlDbType)Enum.Parse(sql_db_type, sql_db_type_string, true);

                switch (type)
                {
                    case SqlDbType.BigInt:
                        //long
                        method_param.AppendFormat("{0}{1}long{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = Convert.ToInt64(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Bit:
                        //bool
                        method_param.AppendFormat("{0}{1}bool{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = Convert.ToBoolean(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Char:
                    case SqlDbType.NChar:
                    case SqlDbType.NText:
                    case SqlDbType.NVarChar:
                    case SqlDbType.Text:
                    case SqlDbType.Time:
                    case SqlDbType.VarChar:
                    case SqlDbType.Xml:
                        //string
                        method_param.AppendFormat("{0}{1}string {2}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value.ToString();{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Date:
                    case SqlDbType.DateTime:
                    case SqlDbType.DateTime2:
                    case SqlDbType.SmallDateTime:
                        //DateTime
                        method_param.AppendFormat("{0}{1}DateTime{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = Convert.ToDateTime(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.DateTimeOffset:
                        //DateTimeOffset
                        method_param.AppendFormat("{0}{1}DateTimeOffset{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = (DateTimeOffset)param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value;{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Decimal:
                    case SqlDbType.Money:
                        //decimal
                        method_param.AppendFormat("{0}{1}decimal{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = Convert.ToDecimal(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Float:
                        //float
                        method_param.AppendFormat("{0}{1}float{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = (float)Convert.ToDecimal(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Binary:
                    case SqlDbType.Image:
                    case SqlDbType.Timestamp:
                    case SqlDbType.VarBinary:
                        //byte[]
                        method_param.AppendFormat("{0}{1}byte[] {2}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = (byte[])param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value;{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Int:
                        //int
                        method_param.AppendFormat("{0}{1}int{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = Convert.ToInt32(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Real:
                        //Single
                        method_param.AppendFormat("{0}{1}Single{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = Convert.ToSingle(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.SmallInt:
                        //short
                        method_param.AppendFormat("{0}{1}short{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = Convert.ToInt16(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.TinyInt:
                        //byte
                        method_param.AppendFormat("{0}{1}byte{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = Convert.ToByte(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.UniqueIdentifier:
                        //Guid
                        method_param.AppendFormat("{0}{1}Guid{2} {3}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            is_null ? "?" : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = (Guid)(param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value);{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                    case SqlDbType.Structured:
                    case SqlDbType.Udt:
                    case SqlDbType.Variant:
                    default:
                        //object
                        method_param.AppendFormat("{0}{1}Guid {2}",
                            method_param.Length > 0 ? ", " : "",
                            is_out ? "ref " : "",
                            param_info[i]["name"].ToString()
                            );
                        if (is_out)
                            out_value_string.AppendFormat(@"{0} = param_array.Where(a => a.ParameterName == ""{1}"").SingleOrDefault().Value;{2}            ", param_info[i]["name"].ToString(), param_info[i]["name"].ToString(), "\n");
                        break;
                }
            }

            StringBuilder code = new StringBuilder();

            string template = @"
        /// <summary>
        /// 执行这个存储过程，获取【查询】结果
        /// <para>参数列表与sql存储程的参数列表一致</para>
        /// </summary>
        public static List<rx_entity> execute_select(" + method_param.ToString() + @")
        {
            System.Data.SqlClient.SqlParameter[] param_array = new System.Data.SqlClient.SqlParameter[]
            {
                " + parameter_string.ToString() + @"
            };
            List<rx_entity> list = rx_dbhelper.instance().execute_sql_or_proc(""" + proc_name + @""", param_array);
            
            " + out_value_string.ToString() + @"
            return list;
        }";
            code.Append(template + "\r");

            template = @"
        /// <summary>
        /// 执行这个存储过程，获取【dml_result】结果
        /// <para>参数列表与sql存储程的参数列表一致</para>
        /// </summary>
        public static dml_result execute_non_query(" + method_param.ToString() + @")
        {
            System.Data.SqlClient.SqlParameter[] param_array = new System.Data.SqlClient.SqlParameter[]
            {
                " + parameter_string.ToString() + @"
            };
            
            dml_result result = new dml_result(""rx_entity"");
            result.sql_query = """ + proc_name + @""";
            try
            {
                result.len = rx_dbhelper.instance().execute_non_query(""" + proc_name + @""", param_array);
                result.result_code = dml_result_code.success;
                result.message = string.Format(""执行成功,影响了{0}行！"", result.len);
                if (param_array != null)
                {
                    Dictionary<string, object> output = new Dictionary<string, object>();
                    for (int i = 0; i < param_array.Length; i++)
                    {
                        if (param_array[i].Direction != System.Data.ParameterDirection.Input)
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
                result.message = ex.Message + string.Format("",Source:{0},TargetSite:{1}"", ex.Source, ex.TargetSite);
            }
            
            " + out_value_string.ToString() + @"
            return result;
        }";
            code.Append(template + "\r");

            return code.ToString();
        }

        private string generate_procedure_method_script_code(string proc_name, List<Dictionary<string, object>> param_info)
        {
            StringBuilder out_error_if = new StringBuilder();
            StringBuilder method_param = new StringBuilder();
            StringBuilder parameter_string = new StringBuilder();
            StringBuilder out_value_string = new StringBuilder();
            for (int i = 0; i < param_info.Count; i++)
            {
                bool is_out = Convert.ToInt32(param_info[i]["isoutparam"]) == 1;
                if (is_out)
                {
                    out_error_if.Append(@"if (!(out_" + param_info[i]["name"].ToString().Replace("@", "") + @" instanceof Array)) { throw '因为参数out_" + param_info[i]["name"].ToString().Replace("@", "") + @"需要进行引用传递，所以必须定义为一个数组'; }
        out_" + param_info[i]["name"].ToString().Replace("@", "") + @"[0] = 0;" + "\r");
                    out_value_string.Append("out_" + param_info[i]["name"].ToString().Replace("@", "") + @"[0] = data.tag[""" + param_info[i]["name"].ToString() + @"""];");
                }
                method_param.Append(", " + (is_out ? "out_" : "") + param_info[i]["name"].ToString().Replace("@", ""));
                parameter_string.Append((i != 0 ? "                " : "") + @"new SqlParameter(""" + param_info[i]["name"] + @""", " + (is_out ? "out_" : "") + param_info[i]["name"].ToString().Replace("@", "") + (is_out ? "[0]" : "") + (is_out ? ", ParameterDirection.Output" : "") + ")" + (i != param_info.Count - 1 ? ",\r" : ""));

            }
            string code = @"
    /* 使用【查询】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    */
    execute_select: function (call_back" + method_param.ToString() + @") {
        " + out_error_if.ToString() + @"
        var param_array =
            [
                " + parameter_string.ToString() + @"
            ];
        do_call_back = function (data) {
            " + out_value_string.ToString() + @"
            call_back(data);
        }
        rx_manager.get_entitys_in_proc(do_call_back, """ + proc_name + @""", param_array);
    },
    /* 使用【DML】的方式执行该存储过程，参数列表与SQL存储过程的参数列表一致，call_back为异步回发参数，参数data
    * 因为js方法的参数无法引用传递，所以要进行out输出的参数要定义成一个数组
    * 同时out参数的返回值也会在data的tag中出现
    */
    execute_non_query: function (call_back" + method_param.ToString() + @") {
        " + out_error_if.ToString() + @"
        var param_array =
            [
                " + parameter_string.ToString() + @"
            ];
        do_call_back = function (data) {
            " + out_value_string.ToString() + @"
            call_back(data);
        }
        rx_manager.execute_non_query(do_call_back, """ + proc_name + @""", param_array);
    }";

            return code;
        }

        private void set_config()
        {
            this.application_object.Documents.SaveAll();
            this.application_object.Documents.CloseAll();
            foreach (Project project in this.solution3.Projects)
            {
                try
                {
                    if (project.FullName.Trim() == "") continue;
                }
                catch (Exception) { continue; }

                string[] files = Directory.GetFiles(new FileInfo(project.FullName).DirectoryName);
                for (int i = 0; i < files.Length; i++)
                {
                    if (files[i].Substring(files[i].LastIndexOf(".")).ToLower() == ".config")
                    {
                        FileInfo file = new FileInfo(files[i]);
                        try
                        {
                            project.ProjectItems.Item(file.Name).Open();
                        }
                        catch (Exception) { continue; }


                        TextDocument td = null;
                        try
                        {
                            td = (application_object.Documents.Item(file.Name).Object("TextDocument") as TextDocument);
                            td.Selection.SelectAll();
                        }
                        catch (Exception) { continue; }

                        XmlDocument doc = new XmlDocument();
                        doc.InnerXml = td.Selection.Text;
                        XmlNodeList nodes = doc.GetElementsByTagName("appSettings");
                        bool is_default_db_type = true;
                        if (nodes.Count > 0)
                        {
                            XmlNode node = nodes[0];
                            foreach (XmlNode n in node.ChildNodes)
                            {
                                try
                                {
                                    if (n.Attributes == null || n.Attributes["key"].Value != "rx_db_type") continue;
                                    string rx_db_type = n.Attributes["value"].Value;
                                    switch (rx_db_type)
                                    {
                                        case "sql":
                                            if (project == this.active_project)
                                            {
                                                this.sqlServerRadio.Checked = true;
                                                is_default_db_type = false;
                                            }
                                            break;
                                        //类型后期继续扩展
                                        default:
                                            if (project == this.active_project)
                                            {
                                                this.sqlServerRadio.Checked = true;
                                            }
                                            break;

                                    }
                                    break;
                                }
                                catch (Exception) { }
                            }
                        }
                        //rx_db_type设置
                        if (is_default_db_type)
                        {
                            XmlNode node = null;
                            if (nodes.Count > 0) node = nodes[0];
                            else node = doc.CreateElement("appSettings");

                            for (int j = 0; j < node.ChildNodes.Count; j++)
                            {
                                if (node.ChildNodes[j].Attributes != null && node.ChildNodes[j].Attributes["key"] != null && node.ChildNodes[j].Attributes["key"].Value == "rx_db_type")
                                {
                                    node.RemoveChild(node.ChildNodes[j]);
                                    j--;
                                }
                            }

                            XmlNode default_node = doc.CreateElement("add");

                            if (nodes.Count == 0)
                                node.AppendChild(default_node);

                            XmlAttribute key = doc.CreateAttribute("key");
                            key.Value = "rx_db_type";
                            default_node.Attributes.Append(key);

                            XmlAttribute value = doc.CreateAttribute("value");
                            value.Value = "sql";
                            default_node.Attributes.Append(value);

                            node.AppendChild(default_node);

                            try
                            {
                                if (nodes.Count == 0)
                                    doc.GetElementsByTagName("configuration")[0].AppendChild(node);
                            }
                            catch (Exception) { }
                        }

                        //连接字符串设置
                        nodes = doc.GetElementsByTagName("connectionStrings");
                        XmlNode conn_node = null;
                        if (nodes.Count > 0) conn_node = nodes[0];
                        else conn_node = doc.CreateElement("connectionStrings");

                        for (int j = 0; j < conn_node.ChildNodes.Count; j++)
                        {
                            if (conn_node.ChildNodes[j].Attributes != null && conn_node.ChildNodes[j].Attributes["name"] != null && conn_node.ChildNodes[j].Attributes["name"].Value == "rx_ms_sql_conn_str")
                            {
                                conn_node.RemoveChild(conn_node.ChildNodes[j]);
                                j--;
                            }
                        }
                        XmlNode conn_default_node = doc.CreateElement("add");

                        if (nodes.Count == 0)
                            conn_node.AppendChild(conn_default_node);

                        XmlAttribute name = doc.CreateAttribute("name");
                        name.Value = "rx_ms_sql_conn_str";
                        conn_default_node.Attributes.Append(name);

                        XmlAttribute connectionString = doc.CreateAttribute("connectionString");
                        connectionString.Value = this.connsCob.Text;
                        conn_default_node.Attributes.Append(connectionString);

                        conn_node.AppendChild(conn_default_node);

                        try
                        {
                            if (nodes.Count == 0)
                                doc.GetElementsByTagName("configuration")[0].AppendChild(conn_node);
                        }
                        catch (Exception) { }

                        td.Selection.SelectAll();
                        td.Selection.SetBookmark();
                        td.Selection.Delete();
                        td.Selection.Insert(doc.InnerXml.Trim().Replace("<!-- Ctrl + E + D 进行格式化 -->", "") + "\r\n\r\n");

                        td.Selection.LineDown(true, 2);
                        td.Selection.Insert("<!-- Ctrl + E + D 进行格式化 -->");

                        td.Selection.SelectAll();
                        td.Selection.SmartFormat();
                        td.Parent.Save();
                        this.sqlServerRadio.Checked = true;

                        this.application_object.Documents.SaveAll();
                        this.application_object.Documents.CloseAll();
                    }
                }
            }
        }

        private void serverProjectTypeDdl_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (this.frontChk.Checked)
            {
                validate_project_type(this.serverProjectTypeCob.Text, false);
            }
            switch (this.serverProjectTypeCob.Text)
            {
                case "asp_net_handle":
                    this.apiUrlTxt.Text = "\\rx_web_api\\rx_api_handle.ashx";
                    break;
                case "asp_net_web_form":
                    this.apiUrlTxt.Text = "\\rx_web_api\\rx_api_web_form.aspx";
                    break;
                case "asp_net_mvc":
                case "asp_net_mvc_api":
                    this.apiUrlTxt.Text = "\\rx_api";
                    break;
            }
        }

        private bool validate_project_type(string project_type_text, bool show_error_icon)
        {
            switch (project_type_text)
            {
                case "asp_net_handle":
                    break;
                case "asp_net_web_form":
                    break;
                case "asp_net_mvc":
                    try
                    {
                        if (this.active_project.ProjectItems.Item("App_Start") == null)
                        {
                            MessageBox.Show("这个项目的类型不支持asp_net_mvc", "提示信息", MessageBoxButtons.OK, show_error_icon ? MessageBoxIcon.Error : MessageBoxIcon.Information);
                            return false;
                        }
                        else
                        {
                            ProjectItem pi = this.active_project.ProjectItems.Item("App_Start");
                            if (pi.ProjectItems.Item("RouteConfig.cs") == null)
                            {
                                MessageBox.Show("这个项目的类型不支持asp_net_mvc，请使用ASP.NET MVC项目", "提示信息", MessageBoxButtons.OK, show_error_icon ? MessageBoxIcon.Error : MessageBoxIcon.Information);
                                return false;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("这个项目的类型不支持asp_net_mvc，请使用ASP.NET MVC项目！\n未在App_Start目录找到RouteConfig.cs\nerror:" + ex.Message, "提示信息", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return false;
                    }

                    break;
                case "asp_net_mvc_api":
                    try
                    {
                        if (this.active_project.ProjectItems.Item("App_Start") == null)
                        {
                            MessageBox.Show("这个项目的类型不支持asp_net_mvc_api", "提示信息", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            return false;
                        }
                        else
                        {
                            ProjectItem pi = this.active_project.ProjectItems.Item("App_Start");
                            if (pi.ProjectItems.Item("WebApiConfig.cs") == null)
                            {
                                MessageBox.Show("这个项目的类型不支持asp_net_mvc_api，请使用ASP.NET MVC WEB API项目", "提示信息", MessageBoxButtons.OK, show_error_icon ? MessageBoxIcon.Error : MessageBoxIcon.Information);
                                return false;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("这个项目的类型不支持asp_net_mvc_api，请使用ASP.NET MVC WEB API项目！\n未在App_Start目录找到WebApiConfig.cs\nerror:" + ex.Message, "提示信息", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return false;
                    }

                    break;
            }
            return true;
        }

        private void backChk_CheckedChanged(object sender, EventArgs e)
        {
            for (int i = 0; i < this.groupBox1.Controls.Count; i++)
            {
                this.groupBox1.Controls[i].Enabled = this.backChk.Checked;
            }
            this.backChk.Enabled = true;
        }

        private void frontChk_CheckedChanged(object sender, EventArgs e)
        {
            if (this.frontChk.Checked)
            {
                if (this.isProjectGenerateChk.Checked)
                {
                    validate_project_type(this.serverProjectTypeCob.Text, false);
                }
            }
            for (int i = 0; i < this.groupBox2.Controls.Count; i++)
            {
                this.groupBox2.Controls[i].Enabled = this.frontChk.Checked;
            }

            this.serverProjectTypeCob.Enabled = this.isProjectGenerateChk.Checked;

            this.frontChk.Enabled = true;
            this.apiJurisdictionChk.Enabled = false;
            this.methodChk.Enabled = false;
        }

        private void isProjectGenerateChk_CheckedChanged(object sender, EventArgs e)
        {
            this.serverProjectTypeCob.Enabled = this.isProjectGenerateChk.Checked;
            if (!this.isProjectGenerateChk.Checked)
            {
                this.apiUrlTxt.Text = "";
                this.groupBox2.Height = 125;
            }
            else
            {
                this.groupBox2.Height = 155;
                serverProjectTypeDdl_SelectedIndexChanged(this.serverProjectTypeCob, null);
            }
        }

        private string validate_front_orm_api_url(string api_url, ref string out_string)
        {
            api_url = api_url.Replace("\\", "/");
            if (api_url.ToLower().IndexOf("http") != 0)
            {
                out_string = "error: 无效的外部http地址";
                return out_string;
            }
            WebClient web_client = new WebClient();
            web_client.Encoding = Encoding.UTF8;
            //web_client.Headers.Add("Content-Type", "application/x-www-form-urlencoded");
            try
            {
                try
                {
                    out_string = web_client.DownloadString(api_url + (api_url.Contains("?") ? "&rx_orm_addin_test=rx_orm_addin_test" : "?rx_orm_addin_test=rx_orm_addin_test")).Trim();
                }
                catch
                {
                    out_string = web_client.DownloadString(api_url + "/rx_orm_addin_test").Trim();
                }
                
                return out_string;
            }
            catch (Exception ex)
            {
                out_string = "error:" + ex.Message;
                return out_string;
            }

        }

        private void generate_front_api_action(string api_url)
        {
            string project_namespace = get_project_namespace(this.active_project);
            if (api_url.IndexOf(@"\") == 0)
            {
                api_url = api_url.Substring(1);
            }
            List<string> routes = api_url.Split('\\').ToList();
            if (this.serverProjectTypeCob.Text != "asp_net_handle" && this.serverProjectTypeCob.Text != "asp_net_web_form")
            {
                routes.Insert(0, "Controllers");
            }
            string class_file_name = routes[routes.Count - 1];
            ProjectItems p_items = this.active_project.ProjectItems;
            string director_name = new FileInfo(this.active_project.FullName).DirectoryName;
            string base_director_name = director_name;
            for (int i = 0; i < routes.Count - 1; i++)
            {
                try
                {
                    if (p_items.Item(routes[i]) == null)
                        p_items.AddFolder(routes[i]);
                    p_items = p_items.Item(routes[i]).ProjectItems;
                }
                catch
                {
                    p_items.AddFolder(routes[i]);
                    p_items = p_items.Item(routes[i]).ProjectItems;
                }
                director_name += "//" + routes[i];
            }
            string templatePath = solution3.GetProjectItemTemplate("Class.zip", "CSharp");
            Document doc = null;
            TextDocument text_doc = null;

            string jurisdiction_text = string.Join(", ", jurisdiction);
            switch (this.serverProjectTypeCob.Text)
            {
                case "asp_net_handle":
                    try { p_items.Item(class_file_name).Remove(); }
                    catch { }
                    try { File.Delete(director_name + "//" + class_file_name); }
                    catch { }
                    p_items.AddFromTemplate(templatePath, class_file_name);
                    doc = this.application_object.Documents.Item(class_file_name);
                    text_doc = (doc.Object("TextDocument") as TextDocument);
                    text_doc.Selection.SelectAll();
                    text_doc.Selection.Delete();

                    text_doc.Selection.Insert
                        (
                            ConstHelper.get_handler_class_content
                            (
                                project_namespace,
                                routes.Count > 1 ? "." + string.Join(".", routes.Take(routes.Count - 1)) : "",
                                class_file_name.Replace(".ashx", ""),
                                jurisdiction_text
                            )
                        );
                    break;
                case "asp_net_web_form":
                    try { p_items.Item(class_file_name).Remove(); }
                    catch { }
                    try { File.Delete(director_name + "//" + class_file_name); }
                    catch { }
                    p_items.AddFromTemplate(templatePath, class_file_name);
                    doc = this.application_object.Documents.Item(class_file_name);
                    text_doc = (doc.Object("TextDocument") as TextDocument);
                    text_doc.Selection.SelectAll();
                    text_doc.Selection.Delete();
                    text_doc.Selection.Insert
                        (
                            ConstHelper.get_web_form_content
                            (
                                project_namespace,
                                routes.Count > 1 ? "." + string.Join(".", routes.Take(routes.Count - 1)) : "",
                                class_file_name.Replace(".aspx", ""),
                                class_file_name.Replace(".aspx", ".cs")
                            )
                        );

                    try { p_items.Item(class_file_name.Replace(".aspx", ".cs")).Remove(); }
                    catch { }
                    try { File.Delete(director_name + "//" + class_file_name.Replace(".aspx", ".cs")); }
                    catch { }
                    p_items.AddFromTemplate(templatePath, class_file_name.Replace(".aspx", ".cs"));
                    doc = this.application_object.Documents.Item(class_file_name.Replace(".aspx", ".cs"));
                    text_doc = (doc.Object("TextDocument") as TextDocument);
                    text_doc.Selection.SelectAll();
                    text_doc.Selection.Delete();
                    text_doc.Selection.Insert
                    (
                        ConstHelper.get_web_form_class_content
                        (
                            project_namespace,
                            routes.Count > 1 ? "." + string.Join(".", routes.Take(routes.Count - 1)) : "",
                            class_file_name.Replace(".aspx", ""),
                            jurisdiction_text
                        )
                    );
                    break;
                case "asp_net_mvc":
                    try { p_items.Item(class_file_name + "Controllers.cs").Remove(); }
                    catch { }
                    try { File.Delete(director_name + "//" + class_file_name + "Controllers.cs"); }
                    catch { }
                    p_items.AddFromTemplate(templatePath, class_file_name + "Controllers.cs");
                    doc = this.application_object.Documents.Item(class_file_name + "Controllers.cs");
                    text_doc = (doc.Object("TextDocument") as TextDocument);
                    text_doc.Selection.SelectAll();
                    text_doc.Selection.Delete();
                    text_doc.Selection.Insert
                        (
                            ConstHelper.get_controller_content
                            (
                                project_namespace,
                                routes.Count > 1 ? "." + string.Join(".", routes.Take(routes.Count - 1)) : "",
                                class_file_name + "Controller",
                                jurisdiction_text
                            )
                        );
                    break;
                case "asp_net_mvc_api":
                    try { this.active_project.ProjectItems.Item("App_Start").ProjectItems.Item("WebApiConfig.cs").Remove(); }
                    catch { }
                    try { File.Delete(base_director_name + "//App_Start//WebApiConfig.cs"); }
                    catch { }
                    this.active_project.ProjectItems.Item("App_Start").ProjectItems.AddFromTemplate(templatePath, "WebApiConfig.cs");
                    doc = this.application_object.Documents.Item("WebApiConfig.cs");
                    text_doc = (doc.Object("TextDocument") as TextDocument);
                    text_doc.Selection.SelectAll();
                    text_doc.Selection.Delete();
                    text_doc.Selection.Insert
                        (
                            ConstHelper.get_api_controller_web_api_config_class_content
                            (
                               project_namespace
                            )
                        );

                    try { p_items.Item(class_file_name + "Controllers.cs").Remove(); }
                    catch { }
                    try { File.Delete(director_name + "//" + class_file_name + "Controllers.cs"); }
                    catch { }
                    p_items.AddFromTemplate(templatePath, class_file_name + "Controllers.cs");
                    doc = this.application_object.Documents.Item(class_file_name + "Controllers.cs");
                    text_doc = (doc.Object("TextDocument") as TextDocument);
                    text_doc.Selection.SelectAll();
                    text_doc.Selection.Delete();
                    text_doc.Selection.Insert
                        (
                            ConstHelper.get_api_controller_class_content
                            (
                                project_namespace,
                                routes.Count > 1 ? "." + string.Join(".", routes.Take(routes.Count - 1)) : "",
                                class_file_name + "Controller",
                                jurisdiction_text
                            )
                        );
                    break;
            }

            this.application_object.Documents.SaveAll();
            this.application_object.Documents.CloseAll();
        }

        private string get_project_namespace(Project project)
        {
            XmlDocument doc = new XmlDocument();
            doc.Load(project.FullName);
            return doc.GetElementsByTagName("RootNamespace")[0].InnerText;
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            MessageBox.Show(@"这里主要说明一下【接口地址】与【在该项目中生成】的规则！
【接口地址】可以直接使用外部http地址，但是外部接口必须是使用rx orm的地址，否则验证不会通过。
【在该项目中生成】的接口分为4类，具体如下：
asp_net_handle 与 asp_net_web_form 很容易理解，会直接按照目录规则生成aspx与ashx。
asp_net_mvc 会在在Controllers目录下生成对应的Controller，类名无需包含Controller与后缀。
asp_net_mvc_api 也会在Controllers目录下生成对应的APIController，类名也无需包含Controller与后缀，但是会重新设定基本的API路由规则，如 api/{version}/{controller} （这是一个强制api路由规则），其中version是可以在子类中得到的，version默认为v1，具体有什么用我就不多说了，搞api开发的都很清楚！", "什么是前端的接口地址？", MessageBoxButtons.OK, MessageBoxIcon.Asterisk);
        }

        private List<string> jurisdiction = new List<string>() { "i_rx_risk" };
        private void jurisdictionChk_CheckedChanged(object sender, EventArgs e)
        {
            if (((CheckBox)sender).Checked)
            {
                jurisdiction.Add(((CheckBox)sender).Tag.ToString());
            }
            else
            {
                jurisdiction.Remove(((CheckBox)sender).Tag.ToString());
            }
        }

        private void pictureBox2_Click(object sender, EventArgs e)
        {
            MessageBox.Show(@"基础权限：前端接口中的基础查询权限，权限接口 i_rx_risk。
动作权限：web api标准中的四个动作 get post put delete，只会在asp.net mvc web api项目中体现这个规范。
添加权限：前端接口中对SQL进行添加（insert）操作时的权限，权限接口 i_rx_risk_insert。
修改权限：前端接口中对SQL进行修改（update）操作时的权限，权限接口 i_rx_risk_update。
删除权限：前端接口中对SQL进行删除（delete）操作时的权限，权限接口 i_rx_risk_delete。
存储过程：前端接口中对SQL进行存储过程（proc）操作时的权限，权限接口 i_rx_risk_proc。", "什么是前端接口的权限？", MessageBoxButtons.OK, MessageBoxIcon.Asterisk);
        }

        private void apiUrlTxt_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (e.KeyChar == 13)
            {
                if (serverProjectTypeCob.Enabled)
                {
                    string out_string = "";
                    if (validate_front_orm_api_url(this.apiUrlTxt.Text.Trim(), ref out_string).Contains("error"))
                    {
                        MessageBox.Show("前端orm的接口地址验证无效\n" + out_string, "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        is_runing = false;
                        set_enable(true);
                        this.generateStatusLabel.Text = "请调整设置后再次生成！";
                        return;
                    }
                    else
                    {
                        try
                        {
                            Dictionary<string, object> dic = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(out_string);
                            MessageBox.Show(string.Format("rx后端orm版本：{0}\n接口类型：{1}\n基础权限：{2}\n添加权限：{3}\n修改权限：{4}\n删除权限：{5}\n存储过程：{6}",
                                    dic["version"].ToString(),
                                    dic["api_type"].ToString(),
                                    dic["i_rx_risk"].ToString(),
                                    dic["i_rx_risk_insert"].ToString(),
                                    dic["i_rx_risk_update"].ToString(),
                                    dic["i_rx_risk_delete"].ToString(),
                                    dic["i_rx_risk_proc"].ToString()
                                    )
                                    , "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        }
                        catch (Exception ex)
                        {
                            MessageBox.Show("远程http地址请求结果验证失败！\n" + ex.Message, "系统提示", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            is_runing = false;
                            set_enable(true);
                            this.generateStatusLabel.Text = "请调整设置后重新生成！";
                            return;
                        }
                    }
                }
            }
        }
    }

    internal class rx_ms_sql_dbhelper
    {
        internal static string conn_str = null;

        private static SqlConnection _conn = null;

        private static SqlConnection conn
        {
            get
            {
                if (_conn == null)
                {
                    _conn = new SqlConnection(conn_str);
                }
                else
                {
                    if (_conn.State == ConnectionState.Open || _conn.State == ConnectionState.Broken)
                        _conn.Close();
                    _conn.ConnectionString = conn_str;
                    _conn.Open();
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
                return _conn;
            }
        }

        public static DataTable execute_sql_or_proc(string sql, SqlParameter[] param_array = null, CommandType sql_type = CommandType.StoredProcedure)
        {
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
                    using (SqlDataAdapter da = new SqlDataAdapter(com))
                    {
                        DataTable dt = new DataTable();
                        da.Fill(dt);
                        return dt;
                    }
                }
            }
        }
        public static int execute_non_query(string sql, SqlParameter[] param_array = null, CommandType sql_type = CommandType.StoredProcedure)
        {
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

                    return com.ExecuteNonQuery();
                }
            }
        }
    }
}
