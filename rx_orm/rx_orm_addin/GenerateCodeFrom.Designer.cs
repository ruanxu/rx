namespace rx_orm_addin
{
    partial class GenerateCodeFrom
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(GenerateCodeFrom));
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.connsCob = new System.Windows.Forms.ComboBox();
            this.label3 = new System.Windows.Forms.Label();
            this.folderTxt = new System.Windows.Forms.TextBox();
            this.entityCountLab = new System.Windows.Forms.Label();
            this.statusStrip1 = new System.Windows.Forms.StatusStrip();
            this.generateStatusLabel = new System.Windows.Forms.ToolStripStatusLabel();
            this.generateProgressBar = new System.Windows.Forms.ToolStripProgressBar();
            this.generateBtn = new System.Windows.Forms.Button();
            this.projectCob = new System.Windows.Forms.ComboBox();
            this.label4 = new System.Windows.Forms.Label();
            this.sqlServerRadio = new System.Windows.Forms.RadioButton();
            this.radioButton1 = new System.Windows.Forms.RadioButton();
            this.viewCountLab = new System.Windows.Forms.Label();
            this.procedureCountLab = new System.Windows.Forms.Label();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.backChk = new System.Windows.Forms.CheckBox();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.pictureBox3 = new System.Windows.Forms.PictureBox();
            this.wxCheck = new System.Windows.Forms.CheckBox();
            this.isSignChk = new System.Windows.Forms.CheckBox();
            this.methodChk = new System.Windows.Forms.CheckBox();
            this.procChk = new System.Windows.Forms.CheckBox();
            this.deleteChk = new System.Windows.Forms.CheckBox();
            this.updateChk = new System.Windows.Forms.CheckBox();
            this.insertChk = new System.Windows.Forms.CheckBox();
            this.apiJurisdictionChk = new System.Windows.Forms.CheckBox();
            this.pictureBox2 = new System.Windows.Forms.PictureBox();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.isProjectGenerateChk = new System.Windows.Forms.CheckBox();
            this.frontChk = new System.Windows.Forms.CheckBox();
            this.serverProjectTypeCob = new System.Windows.Forms.ComboBox();
            this.apiUrlTxt = new System.Windows.Forms.TextBox();
            this.label7 = new System.Windows.Forms.Label();
            this.scriptFolderTxt = new System.Windows.Forms.TextBox();
            this.label8 = new System.Windows.Forms.Label();
            this.label5 = new System.Windows.Forms.Label();
            this.button1 = new System.Windows.Forms.Button();
            this.statusStrip1.SuspendLayout();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox3)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox2)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(6, 8);
            this.label1.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(77, 12);
            this.label1.TabIndex = 0;
            this.label1.Text = "　　　项目：";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(6, 56);
            this.label2.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(77, 12);
            this.label2.TabIndex = 1;
            this.label2.Text = "连接字符串：";
            // 
            // connsCob
            // 
            this.connsCob.FlatStyle = System.Windows.Forms.FlatStyle.System;
            this.connsCob.FormattingEnabled = true;
            this.connsCob.Location = new System.Drawing.Point(75, 53);
            this.connsCob.Margin = new System.Windows.Forms.Padding(2);
            this.connsCob.Name = "connsCob";
            this.connsCob.Size = new System.Drawing.Size(732, 20);
            this.connsCob.TabIndex = 2;
            this.connsCob.SelectedIndexChanged += new System.EventHandler(this.connsCob_SelectedIndexChanged);
            this.connsCob.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.connsCob_KeyPress);
            this.connsCob.Leave += new System.EventHandler(this.connsCob_Leave);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(4, 24);
            this.label3.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(71, 12);
            this.label3.TabIndex = 3;
            this.label3.Text = "　实体目录\\";
            // 
            // folderTxt
            // 
            this.folderTxt.Location = new System.Drawing.Point(74, 21);
            this.folderTxt.Margin = new System.Windows.Forms.Padding(2);
            this.folderTxt.Name = "folderTxt";
            this.folderTxt.Size = new System.Drawing.Size(721, 21);
            this.folderTxt.TabIndex = 4;
            this.folderTxt.Text = "Models";
            this.folderTxt.TextChanged += new System.EventHandler(this.folderTxt_TextChanged);
            // 
            // entityCountLab
            // 
            this.entityCountLab.AutoSize = true;
            this.entityCountLab.Location = new System.Drawing.Point(6, 80);
            this.entityCountLab.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.entityCountLab.Name = "entityCountLab";
            this.entityCountLab.Size = new System.Drawing.Size(83, 12);
            this.entityCountLab.TabIndex = 5;
            this.entityCountLab.Text = "物理表数量：0";
            // 
            // statusStrip1
            // 
            this.statusStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.generateStatusLabel,
            this.generateProgressBar});
            this.statusStrip1.Location = new System.Drawing.Point(0, 351);
            this.statusStrip1.Name = "statusStrip1";
            this.statusStrip1.Padding = new System.Windows.Forms.Padding(1, 0, 10, 0);
            this.statusStrip1.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.statusStrip1.Size = new System.Drawing.Size(811, 26);
            this.statusStrip1.TabIndex = 7;
            this.statusStrip1.Text = "statusStrip1";
            // 
            // generateStatusLabel
            // 
            this.generateStatusLabel.BorderSides = System.Windows.Forms.ToolStripStatusLabelBorderSides.Right;
            this.generateStatusLabel.Name = "generateStatusLabel";
            this.generateStatusLabel.Size = new System.Drawing.Size(386, 21);
            this.generateStatusLabel.Spring = true;
            this.generateStatusLabel.Text = "100/100   test.cs ......";
            this.generateStatusLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // generateProgressBar
            // 
            this.generateProgressBar.Name = "generateProgressBar";
            this.generateProgressBar.Size = new System.Drawing.Size(412, 20);
            // 
            // generateBtn
            // 
            this.generateBtn.Enabled = false;
            this.generateBtn.Location = new System.Drawing.Point(655, 323);
            this.generateBtn.Margin = new System.Windows.Forms.Padding(2);
            this.generateBtn.Name = "generateBtn";
            this.generateBtn.Size = new System.Drawing.Size(64, 26);
            this.generateBtn.TabIndex = 8;
            this.generateBtn.Text = "开始生成";
            this.generateBtn.UseVisualStyleBackColor = true;
            this.generateBtn.Click += new System.EventHandler(this.generateBtn_Click);
            // 
            // projectCob
            // 
            this.projectCob.Cursor = System.Windows.Forms.Cursors.Hand;
            this.projectCob.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.projectCob.FlatStyle = System.Windows.Forms.FlatStyle.System;
            this.projectCob.Font = new System.Drawing.Font("宋体", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
            this.projectCob.FormattingEnabled = true;
            this.projectCob.Location = new System.Drawing.Point(75, 5);
            this.projectCob.Margin = new System.Windows.Forms.Padding(2);
            this.projectCob.Name = "projectCob";
            this.projectCob.Size = new System.Drawing.Size(732, 20);
            this.projectCob.TabIndex = 9;
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(6, 32);
            this.label4.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(77, 12);
            this.label4.TabIndex = 10;
            this.label4.Text = "　　数据库：";
            // 
            // sqlServerRadio
            // 
            this.sqlServerRadio.AutoSize = true;
            this.sqlServerRadio.Checked = true;
            this.sqlServerRadio.Location = new System.Drawing.Point(75, 30);
            this.sqlServerRadio.Margin = new System.Windows.Forms.Padding(2);
            this.sqlServerRadio.Name = "sqlServerRadio";
            this.sqlServerRadio.Size = new System.Drawing.Size(83, 16);
            this.sqlServerRadio.TabIndex = 11;
            this.sqlServerRadio.TabStop = true;
            this.sqlServerRadio.Tag = "sql";
            this.sqlServerRadio.Text = "Sql Server";
            this.sqlServerRadio.UseVisualStyleBackColor = true;
            // 
            // radioButton1
            // 
            this.radioButton1.AutoSize = true;
            this.radioButton1.Enabled = false;
            this.radioButton1.Location = new System.Drawing.Point(170, 30);
            this.radioButton1.Margin = new System.Windows.Forms.Padding(2);
            this.radioButton1.Name = "radioButton1";
            this.radioButton1.Size = new System.Drawing.Size(95, 16);
            this.radioButton1.TabIndex = 11;
            this.radioButton1.Tag = "sql";
            this.radioButton1.Text = "扩展中......";
            this.radioButton1.UseVisualStyleBackColor = true;
            // 
            // viewCountLab
            // 
            this.viewCountLab.AutoSize = true;
            this.viewCountLab.Location = new System.Drawing.Point(156, 80);
            this.viewCountLab.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.viewCountLab.Name = "viewCountLab";
            this.viewCountLab.Size = new System.Drawing.Size(71, 12);
            this.viewCountLab.TabIndex = 12;
            this.viewCountLab.Text = "视图数量：0";
            // 
            // procedureCountLab
            // 
            this.procedureCountLab.AutoSize = true;
            this.procedureCountLab.Location = new System.Drawing.Point(306, 80);
            this.procedureCountLab.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.procedureCountLab.Name = "procedureCountLab";
            this.procedureCountLab.Size = new System.Drawing.Size(71, 12);
            this.procedureCountLab.TabIndex = 13;
            this.procedureCountLab.Text = "存储过程：0";
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.backChk);
            this.groupBox1.Controls.Add(this.label3);
            this.groupBox1.Controls.Add(this.folderTxt);
            this.groupBox1.Font = new System.Drawing.Font("宋体", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
            this.groupBox1.Location = new System.Drawing.Point(8, 104);
            this.groupBox1.Margin = new System.Windows.Forms.Padding(2);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Padding = new System.Windows.Forms.Padding(2);
            this.groupBox1.Size = new System.Drawing.Size(799, 51);
            this.groupBox1.TabIndex = 14;
            this.groupBox1.TabStop = false;
            // 
            // backChk
            // 
            this.backChk.AutoSize = true;
            this.backChk.Checked = true;
            this.backChk.CheckState = System.Windows.Forms.CheckState.Checked;
            this.backChk.Cursor = System.Windows.Forms.Cursors.Hand;
            this.backChk.Font = new System.Drawing.Font("宋体", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
            this.backChk.Location = new System.Drawing.Point(8, 0);
            this.backChk.Margin = new System.Windows.Forms.Padding(2);
            this.backChk.Name = "backChk";
            this.backChk.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.backChk.Size = new System.Drawing.Size(78, 16);
            this.backChk.TabIndex = 27;
            this.backChk.Text = "后端 orm";
            this.backChk.UseVisualStyleBackColor = true;
            this.backChk.CheckedChanged += new System.EventHandler(this.backChk_CheckedChanged);
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.pictureBox3);
            this.groupBox2.Controls.Add(this.wxCheck);
            this.groupBox2.Controls.Add(this.isSignChk);
            this.groupBox2.Controls.Add(this.methodChk);
            this.groupBox2.Controls.Add(this.procChk);
            this.groupBox2.Controls.Add(this.deleteChk);
            this.groupBox2.Controls.Add(this.updateChk);
            this.groupBox2.Controls.Add(this.insertChk);
            this.groupBox2.Controls.Add(this.apiJurisdictionChk);
            this.groupBox2.Controls.Add(this.pictureBox2);
            this.groupBox2.Controls.Add(this.pictureBox1);
            this.groupBox2.Controls.Add(this.isProjectGenerateChk);
            this.groupBox2.Controls.Add(this.frontChk);
            this.groupBox2.Controls.Add(this.serverProjectTypeCob);
            this.groupBox2.Controls.Add(this.apiUrlTxt);
            this.groupBox2.Controls.Add(this.label7);
            this.groupBox2.Controls.Add(this.scriptFolderTxt);
            this.groupBox2.Controls.Add(this.label8);
            this.groupBox2.Controls.Add(this.label5);
            this.groupBox2.Font = new System.Drawing.Font("宋体", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
            this.groupBox2.Location = new System.Drawing.Point(8, 164);
            this.groupBox2.Margin = new System.Windows.Forms.Padding(2);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Padding = new System.Windows.Forms.Padding(2);
            this.groupBox2.Size = new System.Drawing.Size(799, 100);
            this.groupBox2.TabIndex = 15;
            this.groupBox2.TabStop = false;
            // 
            // pictureBox3
            // 
            this.pictureBox3.BackColor = System.Drawing.Color.Transparent;
            this.pictureBox3.Cursor = System.Windows.Forms.Cursors.Hand;
            this.pictureBox3.Image = ((System.Drawing.Image)(resources.GetObject("pictureBox3.Image")));
            this.pictureBox3.Location = new System.Drawing.Point(612, 100);
            this.pictureBox3.Margin = new System.Windows.Forms.Padding(2);
            this.pictureBox3.Name = "pictureBox3";
            this.pictureBox3.Size = new System.Drawing.Size(18, 16);
            this.pictureBox3.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.pictureBox3.TabIndex = 29;
            this.pictureBox3.TabStop = false;
            this.pictureBox3.Click += new System.EventHandler(this.pictureBox3_Click);
            // 
            // wxCheck
            // 
            this.wxCheck.AutoSize = true;
            this.wxCheck.Cursor = System.Windows.Forms.Cursors.Hand;
            this.wxCheck.Enabled = false;
            this.wxCheck.Font = new System.Drawing.Font("宋体", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
            this.wxCheck.Location = new System.Drawing.Point(634, 102);
            this.wxCheck.Margin = new System.Windows.Forms.Padding(2);
            this.wxCheck.Name = "wxCheck";
            this.wxCheck.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.wxCheck.Size = new System.Drawing.Size(108, 16);
            this.wxCheck.TabIndex = 28;
            this.wxCheck.Text = "针对微信小程序";
            this.wxCheck.UseVisualStyleBackColor = true;
            // 
            // isSignChk
            // 
            this.isSignChk.AutoSize = true;
            this.isSignChk.Cursor = System.Windows.Forms.Cursors.Hand;
            this.isSignChk.Location = new System.Drawing.Point(465, 102);
            this.isSignChk.Margin = new System.Windows.Forms.Padding(2);
            this.isSignChk.Name = "isSignChk";
            this.isSignChk.Size = new System.Drawing.Size(96, 16);
            this.isSignChk.TabIndex = 27;
            this.isSignChk.Tag = "i_rx_sign";
            this.isSignChk.Text = "签名加密验证";
            this.isSignChk.UseVisualStyleBackColor = true;
            this.isSignChk.CheckedChanged += new System.EventHandler(this.jurisdictionChk_CheckedChanged);
            // 
            // methodChk
            // 
            this.methodChk.AutoSize = true;
            this.methodChk.Checked = true;
            this.methodChk.CheckState = System.Windows.Forms.CheckState.Checked;
            this.methodChk.Enabled = false;
            this.methodChk.Location = new System.Drawing.Point(90, 102);
            this.methodChk.Margin = new System.Windows.Forms.Padding(2);
            this.methodChk.Name = "methodChk";
            this.methodChk.Size = new System.Drawing.Size(72, 16);
            this.methodChk.TabIndex = 26;
            this.methodChk.Text = "动作权限";
            this.methodChk.UseVisualStyleBackColor = true;
            // 
            // procChk
            // 
            this.procChk.AutoSize = true;
            this.procChk.Cursor = System.Windows.Forms.Cursors.Hand;
            this.procChk.Location = new System.Drawing.Point(390, 102);
            this.procChk.Margin = new System.Windows.Forms.Padding(2);
            this.procChk.Name = "procChk";
            this.procChk.Size = new System.Drawing.Size(72, 16);
            this.procChk.TabIndex = 25;
            this.procChk.Tag = "i_rx_risk_proc";
            this.procChk.Text = "存储过程";
            this.procChk.UseVisualStyleBackColor = true;
            this.procChk.CheckedChanged += new System.EventHandler(this.jurisdictionChk_CheckedChanged);
            // 
            // deleteChk
            // 
            this.deleteChk.AutoSize = true;
            this.deleteChk.Cursor = System.Windows.Forms.Cursors.Hand;
            this.deleteChk.Location = new System.Drawing.Point(315, 102);
            this.deleteChk.Margin = new System.Windows.Forms.Padding(2);
            this.deleteChk.Name = "deleteChk";
            this.deleteChk.Size = new System.Drawing.Size(72, 16);
            this.deleteChk.TabIndex = 24;
            this.deleteChk.Tag = "i_rx_risk_delete";
            this.deleteChk.Text = "删除权限";
            this.deleteChk.UseVisualStyleBackColor = true;
            this.deleteChk.CheckedChanged += new System.EventHandler(this.jurisdictionChk_CheckedChanged);
            // 
            // updateChk
            // 
            this.updateChk.AutoSize = true;
            this.updateChk.Cursor = System.Windows.Forms.Cursors.Hand;
            this.updateChk.Location = new System.Drawing.Point(240, 102);
            this.updateChk.Margin = new System.Windows.Forms.Padding(2);
            this.updateChk.Name = "updateChk";
            this.updateChk.Size = new System.Drawing.Size(72, 16);
            this.updateChk.TabIndex = 23;
            this.updateChk.Tag = "i_rx_risk_update";
            this.updateChk.Text = "修改权限";
            this.updateChk.UseVisualStyleBackColor = true;
            this.updateChk.CheckedChanged += new System.EventHandler(this.jurisdictionChk_CheckedChanged);
            // 
            // insertChk
            // 
            this.insertChk.AutoSize = true;
            this.insertChk.Cursor = System.Windows.Forms.Cursors.Hand;
            this.insertChk.Location = new System.Drawing.Point(165, 102);
            this.insertChk.Margin = new System.Windows.Forms.Padding(2);
            this.insertChk.Name = "insertChk";
            this.insertChk.Size = new System.Drawing.Size(72, 16);
            this.insertChk.TabIndex = 22;
            this.insertChk.Tag = "i_rx_risk_insert";
            this.insertChk.Text = "添加权限";
            this.insertChk.UseVisualStyleBackColor = true;
            this.insertChk.CheckedChanged += new System.EventHandler(this.jurisdictionChk_CheckedChanged);
            // 
            // apiJurisdictionChk
            // 
            this.apiJurisdictionChk.AutoSize = true;
            this.apiJurisdictionChk.Checked = true;
            this.apiJurisdictionChk.CheckState = System.Windows.Forms.CheckState.Checked;
            this.apiJurisdictionChk.Enabled = false;
            this.apiJurisdictionChk.Location = new System.Drawing.Point(15, 102);
            this.apiJurisdictionChk.Margin = new System.Windows.Forms.Padding(2);
            this.apiJurisdictionChk.Name = "apiJurisdictionChk";
            this.apiJurisdictionChk.Size = new System.Drawing.Size(72, 16);
            this.apiJurisdictionChk.TabIndex = 21;
            this.apiJurisdictionChk.Text = "基础权限";
            this.apiJurisdictionChk.UseVisualStyleBackColor = true;
            // 
            // pictureBox2
            // 
            this.pictureBox2.BackColor = System.Drawing.Color.Transparent;
            this.pictureBox2.Cursor = System.Windows.Forms.Cursors.Hand;
            this.pictureBox2.Image = ((System.Drawing.Image)(resources.GetObject("pictureBox2.Image")));
            this.pictureBox2.Location = new System.Drawing.Point(560, 100);
            this.pictureBox2.Margin = new System.Windows.Forms.Padding(2);
            this.pictureBox2.Name = "pictureBox2";
            this.pictureBox2.Size = new System.Drawing.Size(18, 16);
            this.pictureBox2.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.pictureBox2.TabIndex = 20;
            this.pictureBox2.TabStop = false;
            this.pictureBox2.Click += new System.EventHandler(this.pictureBox2_Click);
            // 
            // pictureBox1
            // 
            this.pictureBox1.BackColor = System.Drawing.Color.Transparent;
            this.pictureBox1.Cursor = System.Windows.Forms.Cursors.Hand;
            this.pictureBox1.Image = ((System.Drawing.Image)(resources.GetObject("pictureBox1.Image")));
            this.pictureBox1.Location = new System.Drawing.Point(613, 23);
            this.pictureBox1.Margin = new System.Windows.Forms.Padding(2);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(18, 16);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.pictureBox1.TabIndex = 20;
            this.pictureBox1.TabStop = false;
            this.pictureBox1.Click += new System.EventHandler(this.pictureBox1_Click);
            // 
            // isProjectGenerateChk
            // 
            this.isProjectGenerateChk.AutoSize = true;
            this.isProjectGenerateChk.Cursor = System.Windows.Forms.Cursors.Hand;
            this.isProjectGenerateChk.Enabled = false;
            this.isProjectGenerateChk.Font = new System.Drawing.Font("宋体", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
            this.isProjectGenerateChk.Location = new System.Drawing.Point(684, 23);
            this.isProjectGenerateChk.Margin = new System.Windows.Forms.Padding(2);
            this.isProjectGenerateChk.Name = "isProjectGenerateChk";
            this.isProjectGenerateChk.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.isProjectGenerateChk.Size = new System.Drawing.Size(108, 16);
            this.isProjectGenerateChk.TabIndex = 19;
            this.isProjectGenerateChk.Text = "在该项目中生成";
            this.isProjectGenerateChk.UseVisualStyleBackColor = true;
            this.isProjectGenerateChk.CheckedChanged += new System.EventHandler(this.isProjectGenerateChk_CheckedChanged);
            // 
            // frontChk
            // 
            this.frontChk.AutoSize = true;
            this.frontChk.Cursor = System.Windows.Forms.Cursors.Hand;
            this.frontChk.Font = new System.Drawing.Font("宋体", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
            this.frontChk.Location = new System.Drawing.Point(8, 0);
            this.frontChk.Margin = new System.Windows.Forms.Padding(2);
            this.frontChk.Name = "frontChk";
            this.frontChk.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.frontChk.Size = new System.Drawing.Size(78, 16);
            this.frontChk.TabIndex = 16;
            this.frontChk.Text = "前端 orm";
            this.frontChk.UseVisualStyleBackColor = true;
            this.frontChk.CheckedChanged += new System.EventHandler(this.frontChk_CheckedChanged);
            // 
            // serverProjectTypeCob
            // 
            this.serverProjectTypeCob.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.serverProjectTypeCob.Enabled = false;
            this.serverProjectTypeCob.FormattingEnabled = true;
            this.serverProjectTypeCob.Items.AddRange(new object[] {
            "asp_net_mvc",
            "asp_net_mvc_api",
            "asp_net_handle",
            "asp_net_web_form"});
            this.serverProjectTypeCob.Location = new System.Drawing.Point(74, 45);
            this.serverProjectTypeCob.Margin = new System.Windows.Forms.Padding(2);
            this.serverProjectTypeCob.Name = "serverProjectTypeCob";
            this.serverProjectTypeCob.Size = new System.Drawing.Size(721, 20);
            this.serverProjectTypeCob.TabIndex = 18;
            this.serverProjectTypeCob.SelectedIndexChanged += new System.EventHandler(this.serverProjectTypeDdl_SelectedIndexChanged);
            // 
            // apiUrlTxt
            // 
            this.apiUrlTxt.Enabled = false;
            this.apiUrlTxt.Location = new System.Drawing.Point(74, 21);
            this.apiUrlTxt.Margin = new System.Windows.Forms.Padding(2);
            this.apiUrlTxt.Name = "apiUrlTxt";
            this.apiUrlTxt.Size = new System.Drawing.Size(536, 21);
            this.apiUrlTxt.TabIndex = 4;
            this.apiUrlTxt.TextChanged += new System.EventHandler(this.apiUrlTxt_TextChanged);
            this.apiUrlTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.apiUrlTxt_KeyPress);
            this.apiUrlTxt.Leave += new System.EventHandler(this.apiUrlTxt_Leave);
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(4, 72);
            this.label7.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(71, 12);
            this.label7.TabIndex = 3;
            this.label7.Text = "　脚本目录\\";
            // 
            // scriptFolderTxt
            // 
            this.scriptFolderTxt.Enabled = false;
            this.scriptFolderTxt.Location = new System.Drawing.Point(74, 69);
            this.scriptFolderTxt.Margin = new System.Windows.Forms.Padding(2);
            this.scriptFolderTxt.Name = "scriptFolderTxt";
            this.scriptFolderTxt.Size = new System.Drawing.Size(721, 21);
            this.scriptFolderTxt.TabIndex = 4;
            this.scriptFolderTxt.Text = "Scripts";
            this.scriptFolderTxt.TextChanged += new System.EventHandler(this.scriptFolderTxt_TextChanged);
            // 
            // label8
            // 
            this.label8.AutoSize = true;
            this.label8.Location = new System.Drawing.Point(4, 24);
            this.label8.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(77, 12);
            this.label8.TabIndex = 3;
            this.label8.Text = "　接口地址：";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(4, 48);
            this.label5.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(77, 12);
            this.label5.TabIndex = 17;
            this.label5.Text = "　接口类型：";
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(741, 323);
            this.button1.Margin = new System.Windows.Forms.Padding(2);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(64, 26);
            this.button1.TabIndex = 16;
            this.button1.Text = "取消";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // GenerateCodeFrom
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(811, 377);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.entityCountLab);
            this.Controls.Add(this.procedureCountLab);
            this.Controls.Add(this.groupBox2);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.viewCountLab);
            this.Controls.Add(this.radioButton1);
            this.Controls.Add(this.sqlServerRadio);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.projectCob);
            this.Controls.Add(this.generateBtn);
            this.Controls.Add(this.statusStrip1);
            this.Controls.Add(this.connsCob);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Margin = new System.Windows.Forms.Padding(2);
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "GenerateCodeFrom";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "rx_orm 强类型开发设置";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.GenerateCodeFrom_FormClosing);
            this.Shown += new System.EventHandler(this.GenerateCodeFrom_Shown);
            this.statusStrip1.ResumeLayout(false);
            this.statusStrip1.PerformLayout();
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.groupBox2.ResumeLayout(false);
            this.groupBox2.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox3)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox2)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.ComboBox connsCob;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox folderTxt;
        private System.Windows.Forms.Label entityCountLab;
        private System.Windows.Forms.StatusStrip statusStrip1;
        private System.Windows.Forms.ToolStripProgressBar generateProgressBar;
        private System.Windows.Forms.Button generateBtn;
        private System.Windows.Forms.ComboBox projectCob;
        private System.Windows.Forms.ToolStripStatusLabel generateStatusLabel;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.RadioButton sqlServerRadio;
        private System.Windows.Forms.RadioButton radioButton1;
        private System.Windows.Forms.Label viewCountLab;
        private System.Windows.Forms.Label procedureCountLab;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.CheckBox frontChk;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.TextBox scriptFolderTxt;
        private System.Windows.Forms.ComboBox serverProjectTypeCob;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.TextBox apiUrlTxt;
        private System.Windows.Forms.CheckBox isProjectGenerateChk;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.CheckBox methodChk;
        private System.Windows.Forms.CheckBox procChk;
        private System.Windows.Forms.CheckBox deleteChk;
        private System.Windows.Forms.CheckBox updateChk;
        private System.Windows.Forms.CheckBox insertChk;
        private System.Windows.Forms.CheckBox apiJurisdictionChk;
        private System.Windows.Forms.PictureBox pictureBox2;
        private System.Windows.Forms.CheckBox backChk;
        private System.Windows.Forms.CheckBox isSignChk;
        private System.Windows.Forms.PictureBox pictureBox3;
        private System.Windows.Forms.CheckBox wxCheck;
    }
}