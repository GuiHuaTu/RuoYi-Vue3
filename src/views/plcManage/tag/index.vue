<template>
   <div class="app-container">
       <el-form :model="tags" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
           <el-form-item label="设备名称" prop="equipId">
               <el-select v-model="tags.queryParams.equipId" placeholder="请选择设备"
                          clearable size="mini"
                          @keyup.enter.native="handleQuery"
                          @change="changeSelectData($event)">
                   <el-option v-for="dict in dictEquipName"
                              :key="dict.value"
                              :label="dict.descprtion"
                              :value="dict.value"></el-option>
               </el-select>
           </el-form-item>
                      <el-form-item label="点位代码" prop="tagCode" v-show="false">
           <el-input v-model="tags.queryParams.tagCode"
           placeholder="请输入点位代码"
           clearable size="mini"
           @keyup.enter.native="handleQuery" />
           </el-form-item>
           <el-form-item label="点位名称" prop="tagName">
               <el-input v-model="tags.queryParams.tagName"
                         placeholder="请输入点位名称"
                         clearable size="mini"
                         @keyup.enter.native="handleQuery" />
           </el-form-item>

           <el-form-item label="启用状态" prop="isValid">
               <el-select v-model="tags.queryParams.isValid" placeholder="启用状态"
                          clearable size="mini">
                   <el-option v-for="item in isValidOptions" :key="item.value" :label="item.descprtion" :value="item.value" />
               </el-select>
           </el-form-item>
           <el-form-item>
               <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
               <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
           </el-form-item>
       </el-form>

       <el-row :gutter="10" class="mb8">
           <el-col :span="1.5">
               <el-button type="primary"
                          plain
                          icon="el-icon-plus"
                          size="mini"
                          @click="handleAdd"
                          v-hasPermi="['equipmentTags:add']">新增</el-button>
           </el-col>
           <el-col :span="1.5">
               <el-button type="success"
                          plain
                          icon="el-icon-edit"
                          size="mini"
                          :disabled="single"
                          @click="handleUpdate"
                          v-hasPermi="['equipmentTags:edit']">修改</el-button>
           </el-col>
           <el-col :span="1.5">
               <el-button type="danger"
                          plain
                          icon="el-icon-delete"
                          size="mini"
                          :disabled="multiple"
                          @click="handleDelete"
                          v-hasPermi="['equipmentTags:remove']">删除</el-button>
           </el-col>
           <el-col :span="1.5">
               <el-button type="primary" size="mini" icon="el-icon-setting"
                          @click="handleTagDataMonitorManage">
                   数据监控
               </el-button>
           </el-col>
           <el-col :span="1.5">
               <el-button type="info"
                          plain
                          icon="el-icon-upload2"
                          size="mini"
                          @click="handleImport"
                          v-hasPermi="['equipmentTags:import']">
                   导入
               </el-button>
           </el-col>
           <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
       </el-row>

       <el-table v-loading="loading" :data="tagList" @selection-change="handleSelectionChange" :row-key="getRowId">
           <el-table-column type="selection" width="55" align="center" :reserve-selection="true">
           </el-table-column>
           <el-table-column label="ID" align="center" prop="id">
           </el-table-column>
           <el-table-column label="设备名称" align="center" prop="equipId">
               <template slot-scope="scope">
                   {{typeFormat(scope.row.equipId ,'',dictEquipName)}}
               </template>
           </el-table-column>
           @*          <el-table-column label="点位代码" align="center" prop="tagCode" >
           </el-table-column>*@
           <el-table-column label="点位名称" align="center" prop="tagName">
           </el-table-column>
           <el-table-column label="地址类型" align="center" prop="tagAddressType">
           </el-table-column>
           <el-table-column label="数据类型" align="center" prop="tagDataType">
               <template slot-scope="scope">
                   {{typeFormat(scope.row.tagDataType ,'',dictPlcDataTypeEnum)}}
               </template>
           </el-table-column>
           <el-table-column label="主地址" align="center" prop="tagPrimAddress">
           </el-table-column>
           <el-table-column label="子地址" align="center" prop="tagSubAddress">
           </el-table-column>
           <el-table-column label="采集地址" align="center" prop="tagAddress">
           </el-table-column>
           <el-table-column label="地址字节长度" align="center" prop="tagAddressByteLength">
           </el-table-column>
           @*  <el-table-column label="数据个数" align="center" prop="tagDataLength">
           </el-table-column>*@
           <el-table-column label="采集频率(ms)" align="center" prop="tagAcquisitionFrequency">
           </el-table-column>
           <el-table-column label="读写权限" align="center" prop="tagReadWrite">
               <template slot-scope="scope">
                   {{typeFormat(scope.row.tagReadWrite,'',dictReadWrite)}}
               </template>
           </el-table-column>
           <el-table-column label="推送规则" align="center" prop="tagChangeTrueSend">
               <template slot-scope="scope">
                   <el-tag>{{ scope.row.tagChangeTrueSend | isChangeTrueSendFilter }}</el-tag>
               </template>
           </el-table-column>
           @*         <el-table-column label="最后采集值" align="center" prop="tagValue">
           </el-table-column>*@
           <el-table-column label="启用状态" align="center" prop="isValid">
               <template slot-scope="scope">
                   <el-tag v-if="scope.row.isValid">{{ scope.row.isValid | isValidFilter }}</el-tag>
                   <el-tag v-else type="info">{{ scope.row.isValid | isValidFilter }}</el-tag>
               </template>
           </el-table-column>
           <el-table-column label="创建时间" align="center" prop="createTime" width="180">
               <template slot-scope="scope">
                   <span>{{ parseTime(scope.row.createTime) }}</span>
               </template>
           </el-table-column>
           <el-table-column label="创建人" align="center" prop="createUser" width="120">
           </el-table-column>
           <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
               <template slot-scope="scope">
                   <span>{{ parseTime(scope.row.updateTime) }}</span>
               </template>
           </el-table-column>
           <el-table-column label="更新人" align="center" prop="updateUser" width="120">
           </el-table-column>
           <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width"
                            fixed="right">
               <template slot-scope="scope">
                   <el-button size="mini"
                              type="text"
                              icon="el-icon-edit"
                              @click="handleUpdate(scope.row)"
                              v-hasPermi="['equipmentTags:edit']">修改</el-button>
                   <el-button size="mini"
                              type="text"
                              icon="el-icon-delete"
                              @click="handleDelete(scope.row)"
                              v-hasPermi="['equipTag:remove']">删除</el-button>
               </template>
           </el-table-column>
       </el-table>


       <!-- 添加或修改对话框 -->
       <el-dialog :title="title" :visible.sync="open" width="750px" append-to-body>
           <el-form ref="form" :model="form" :rules="rules" label-width="145px">
               <el-row>
                   <el-col :span="12">
                       <el-form-item label="设备名称" prop="equipId">
                           <el-select v-model="form.equipId" placeholder="请选择设备"
                                      @change="changeSelectEquipIdData($event)">
                               <el-option v-for="dict in dictEquipName"
                                          :key="dict.value"
                                          :label="dict.descprtion"
                                          :value="dict.value"></el-option>
                           </el-select>
                       </el-form-item>
                   </el-col>
                   <el-col :span="12">
                       <el-form-item label="点位名称" prop="tagName">
                           <el-input v-model="form.tagName" placeholder="请输入名称" />
                       </el-form-item>
                   </el-col>

               </el-row>
               <el-row>
                   <el-col :span="12">
                       <el-form-item label="数据类型" prop="tagDataType">
                           <el-select v-model="form.tagDataType" placeholder="请选择类型"
                                      @change="changeSelectDataType($event)">
                               <el-option v-for="dict in dictPlcDataTypeEnum"
                                          :key="dict.value"
                                          :label="dict.descprtion"
                                          :value="dict.value"></el-option>
                           </el-select>
                       </el-form-item>
                   </el-col>
                   <el-col :span="12">
                       <el-form-item label="采集频率(ms)" prop="tagAcquisitionFrequency" width="100">
                           <el-input-number v-model="form.tagAcquisitionFrequency" :min="10" />
                       </el-form-item>
                   </el-col>
               </el-row>



               <el-row>
                   <el-col :span="12"  v-show="!modbusAddressTypeShow">
                       <el-form-item label="地址类型/功能码" prop="tagAddressType">
                           <el-input v-model="form.tagAddressType" placeholder="请输入地址类型/功能码" />  
                       </el-form-item>
                   </el-col>
                   <el-col :span="12"  v-show="modbusAddressTypeShow">
                       <el-form-item label="地址类型/功能码" prop="tagAddressType">
                           <el-select v-model="form.tagAddressType" placeholder="请选择功能码">
                               <el-option v-for="dict in modbusAddressTypeOptions"
                                         :key="dict.value"
                                         :value="dict.value"
                                         :label="dict.descprtion"></el-option>
                           </el-select>
                       </el-form-item>
                   </el-col>
                   <el-col :span="12" v-show="!siemensPrimAddressShow">
                       <el-form-item label="地址" prop="tagAddress" :required="!siemensPrimAddressShow">
                           <el-input v-model="form.tagAddress" />

                       </el-form-item>
                   </el-col>
                   <el-col :span="12" v-show="siemensPrimAddressShow">
                       <div>
                           <el-form-item label="字节.位地址" :required="siemensPrimAddressShow">
                               <el-col :span="11">
                                   <el-input v-model="form.tagPrimAddress" placeholder="主地址" />
                               </el-col>
                               <el-col class="line" :span="2">-</el-col>
                               <el-col :span="11">
                                   <el-input v-model="form.tagSubAddress" placeholder="子地址" />
                               </el-col>
                           </el-form-item>
                       </div>
                   </el-col>
               </el-row>
               <el-row v-if="tagAddressByteLengthShow || tagDataLengthShow">
                   <el-col :span="12" v-show="tagAddressByteLengthShow">
                       <el-form-item label="地址字节长度" prop="tagAddressByteLength" width="100" >
                           <el-input-number v-model="form.tagAddressByteLength" :min="1"  />
                       </el-form-item>
                   </el-col>
                   <el-col :span="12" v-show="tagDataLengthShow">
                       <el-form-item label="数据长度" prop="tagDataLength">
                           <el-input-number v-model="form.tagDataLength" :min="1" />
                       </el-form-item>
                   </el-col>
               </el-row> 
               
               <el-row>
                   <el-col :span="12">
                       <el-form-item label="读写权限" prop="tagReadWrite">
                           <el-radio-group v-model="form.tagReadWrite" size="mini">
                               <el-radio v-for="dict in dictReadWrite"
                                         :key="dict.value" :value="dict.value"
                                         :label="dict.value">{{dict.descprtion}}</el-radio>
                           </el-radio-group>
                       </el-form-item>
                   </el-col>
                   <el-col :span="12">
                       <el-form-item label="推送规则" prop="tagChangeTrueSend" width="100">
                           <el-radio-group v-model="form.tagChangeTrueSend" size="mini">
                               <el-radio v-for="dict in isChangeTrueSendOptions"
                                         :key="dict.value" :value="dict.value"
                                         :label="dict.value">{{dict.descprtion}}</el-radio>
                           </el-radio-group>
                       </el-form-item>
                   </el-col>
               </el-row>
               <el-row>
                   <el-col :span="12">
                       @*          
                       <el-form-item label="点位代码" prop="tagCode" v-show="false">
                           <el-input v-model="form.tagCode" placeholder="请输入代码" :disabled="IsDisabled" />
                       </el-form-item>
                       *@
                       <el-form-item label="是否启用" prop="isValid">
                           <el-radio-group v-model="form.isValid">
                               <el-radio v-for="dict in isValidOptions"
                                         :key="dict.value" :value="dict.value"
                                         :label="dict.value">{{dict.descprtion}}</el-radio>
                           </el-radio-group>
                       </el-form-item> 
                   </el-col>
               </el-row>
               <el-row>
                   <el-col :span="24">
                       <el-form-item label="备注" prop="remark">
                           <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                       </el-form-item>
                   </el-col>
               </el-row>
           </el-form>
           <div slot="footer" class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
           </div>
       </el-dialog>


       <!-- 导入对话框 -->
       <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body
                  :before-close="handleClose">

           <el-form ref="uploadForm" :model="upload" :rules="rules" label-width="125px">
               <el-form-item label="设备名称" prop="equipId" :rules="rules.equipId">
                   <el-select v-model="upload.equipId" placeholder="请选择设备" clearable size="mini">
                       <el-option v-for="dict in dictEquipName"
                                  :key="dict.value"
                                  :label="dict.descprtion"
                                  :value="dict.value"></el-option>
                   </el-select>
               </el-form-item>
           </el-form>

           <el-upload ref="upload"
                      :limit="1"
                      accept=".xlsx, .xls"
                      :headers="upload.headers"
                      :action="upload.url + '/' + upload.updateSupport+ '/' + upload.equipId"
                      :disabled="upload.isUploading"
                      :on-progress="handleFileUploadProgress"
                      :on-success="handleFileSuccess"
                      :on-error="handleUploadError"
                      @*:auto-upload="false" *@
                      drag>

               <i class="el-icon-upload"></i>
               <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
               <div class="el-upload__tip text-center" slot="tip">
                   <span>仅允许导入xls、xlsx格式文件。</span>
                   <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
               </div>
           </el-upload>
           <div slot="footer" class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">确 定</el-button>
               <el-button @click="upload.open = false">取 消</el-button>
           </div>
       </el-dialog>


       <pagination v-show="total>0"
                   :total="total"
                   :page.sync="tags.pageNum"
                   :limit.sync="tags.pageSize"
                   @pagination="getList" />

   </div>
</template>

 <script setup name="Tag"> 
 import { listTag, getTag, delTag, addTag, updateTag } from "@/api/plcManage/tag";
 
 const { proxy } = getCurrentInstance();
 const { sys_normal_disable } = proxy.useDict("sys_normal_disable");
 
 const typeList = ref([]);
 const open = ref(false);
 const loading = ref(true);
 const showSearch = ref(true);
 const ids = ref([]);
 const single = ref(true);
 const multiple = ref(true);
 const total = ref(0);
 const title = ref("");
 const dateRange = ref([]);
 
 const data = reactive({
    form: {},
    queryParams: {
       pageNum: 1,
       pageSize: 10,
       tagName: undefined,
       tagCode: undefined,
       status: undefined
    },
    rules: {
       tagName: [{ required: true, message: "不能为空", trigger: "blur" }],
       tagCode: [{ required: true, message: "不能为空", trigger: "blur" }]
    },
 });
 
 const { queryParams, form, rules } = toRefs(data);
 
 /** 查询TAG类型列表 */
 function getList() {
    loading.value = true;
    listTag(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
       typeList.value = response.data;
       total.value = response.total;
       loading.value = false;
    });
 }
 /** 取消按钮 */
 function cancel() {
    open.value = false;
    reset();
 }
 /** 表单重置 */
 function reset() {
    form.value = {
       tagId: undefined,
       tagName: undefined,
       tagCode: undefined,
       status: "0",
       remark: undefined
    };
    proxy.resetForm("tagRef");
 }
 /** 搜索按钮操作 */
 function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
 }
 /** 重置按钮操作 */
 function resetQuery() {
    dateRange.value = [];
    proxy.resetForm("queryRef");
    handleQuery();
 }
 /** 新增按钮操作 */
 function handleAdd() {
    reset();
    open.value = true;
    title.value = "添加点位";
 }
 /** 多选框选中数据 */
 function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.tagId);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
 }
 /** 修改按钮操作 */
 function handleUpdate(row) {
    reset();
    const tagId = row.tagId || ids.value;
    getTag(tagId).then(response => {
       form.value = response.data;
       open.value = true;
       title.value = "修改点位";
    });
 }
 /** 提交按钮 */
 function submitForm() {
    proxy.$refs["tagRef"].validate(valid => {
       if (valid) {
          if (form.value.tagId != undefined) {
             updateTag(form.value).then(response => {
                proxy.$modal.msgSuccess("修改成功");
                open.value = false;
                getList();
             });
          } else {
             addTag(form.value).then(response => {
                proxy.$modal.msgSuccess("新增成功");
                open.value = false;
                getList();
             });
          }
       }
    });
 }
 /** 删除按钮操作 */
 function handleDelete(row) {
    const tagIds = row.tagId || ids.value;
    proxy.$modal.confirm('是否确认删除点位编号为"' + tagIds + '"的数据项？').then(function () {
       return delTag(tagIds);
    }).then(() => {
       getList();
       proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
 }
 /** 导出按钮操作 */
 function handleExport() {
    proxy.download("tag/export", {
       ...queryParams.value
    }, `tag_${new Date().getTime()}.xls`);
 }
 
 
 getList();
 </script>
 