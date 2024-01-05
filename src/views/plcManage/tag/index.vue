<template>
    <div class="app-container">
       <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="TAG名称" prop="tagName">
             <el-input v-model="queryParams.tagName" placeholder="请输入TAG名称" clearable style="width: 240px"
                @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="TAG类型" prop="tagType">
             <el-input v-model="queryParams.tagType" placeholder="请输入TAG类型" clearable style="width: 240px"
                @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
             <el-select v-model="queryParams.status" placeholder="TAG状态" clearable style="width: 240px">
                <el-option v-for="tag in sys_normal_disable" :key="tag.value" :label="tag.label" :value="tag.value" />
             </el-select>
          </el-form-item>
          <el-form-item label="创建时间" style="width: 308px">
             <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
                start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item>
             <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
             <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
       </el-form>
 
       <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
             <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:tag:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
             <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                v-hasPermi="['system:tag:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
             <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                v-hasPermi="['system:tag:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
             <el-button type="warning" plain icon="Download" @click="handleExport"
                v-hasPermi="['system:tag:export']">导出</el-button>
          </el-col> 
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
       </el-row>
 
       <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="TAG编号" align="center" prop="tagId" />
          <el-table-column label="TAG名称" align="center" prop="tagName" :show-overflow-tooltip="true" />
          <el-table-column label="TAG类型" align="center" :show-overflow-tooltip="true">
             <template #default="scope">
                <router-link :to="'/system/tag-data/index/' + scope.row.tagId" class="link-type">
                   <span>{{ scope.row.tagType }}</span>
                </router-link>
             </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status">
             <template #default="scope">
                <tag-tag :options="sys_normal_disable" :value="scope.row.status" />
             </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
             <template #default="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
             </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
             <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                   v-hasPermi="['system:tag:edit']">修改</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                   v-hasPermi="['system:tag:remove']">删除</el-button>
             </template>
          </el-table-column>
       </el-table>
 
       <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
          @pagination="getList" />
 
       <!-- 添加或修改参数配置对话框 -->
       <el-dialog :title="title" v-model="open" width="500px" append-to-body>
          <el-form ref="tagRef" :model="form" :rules="rules" label-width="80px">
             <el-form-item label="TAG名称" prop="tagName">
                <el-input v-model="form.tagName" placeholder="请输入TAG名称" />
             </el-form-item>
             <el-form-item label="TAG类型" prop="tagType">
                <el-input v-model="form.tagType" placeholder="请输入TAG类型" />
             </el-form-item>
             <el-form-item label="状态" prop="status">
                <el-radio-group v-model="form.status">
                   <el-radio v-for="tag in sys_normal_disable" :key="tag.value" :label="tag.value">{{ tag.label
                   }}</el-radio>
                </el-radio-group>
             </el-form-item>
             <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
             </el-form-item>
          </el-form>
          <template #footer>
             <div class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
             </div>
          </template>
       </el-dialog>
    </div>
 </template>
 
 <script setup name="Tag"> 
 import { listTag, getTag, delTag, addTag, updateTag, refreshCache } from "@/api/tagManage/tag";
 
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
       tagType: undefined,
       status: undefined
    },
    rules: {
       tagName: [{ required: true, message: "TAG名称不能为空", trigger: "blur" }],
       tagType: [{ required: true, message: "TAG类型不能为空", trigger: "blur" }]
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
       tagType: undefined,
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
    title.value = "添加TAG类型";
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
       title.value = "修改TAG类型";
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
    proxy.$modal.confirm('是否确认删除TAG编号为"' + tagIds + '"的数据项？').then(function () {
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
 