<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="PLC名称" prop="plcName">
            <el-input v-model="queryParams.plcName" placeholder="请输入PLC名称" clearable style="width: 240px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="PLC代码" prop="plcCode">
            <el-input v-model="queryParams.plcCode" placeholder="请输入PLC代码" clearable style="width: 240px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="PLC类型" prop="plcType">
            <el-select v-model="queryParams.plcType" placeholder="PLC类型" clearable style="width: 240px">
               <el-option v-for="item in sys_plc_type" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 240px">
               <el-option v-for="item in sys_normal_disable" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
         </el-form-item>
         <!-- <el-form-item label="创建时间" style="width: 308px">
             <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
                start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item> -->
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd"
               v-hasPermi="['plcManage:plc:add']">新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
               v-hasPermi="['plcManage:plc:edit']">修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
               v-hasPermi="['plcManage:plc:remove']">删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['plcManage:plc:export']">导出</el-button>
         </el-col>

         <el-col :span="1.5">
            <el-button type="warning" plain icon="Refresh" @click="handleAcquisition"
               v-hasPermi="['plcManage:plc:acquisition']">刷新采集作业</el-button>
         </el-col>

         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="PLC编号" align="center" prop="plcId" />
         <el-table-column label="PLC名称" align="center" prop="plcName" :show-overflow-tooltip="true" />
         <el-table-column label="PLC编码" align="center" prop="plcCode" :show-overflow-tooltip="true" />
         <el-table-column label="PLC类型" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
               <dict-tag :options="sys_plc_type" :value="scope.row.plcType" />
            </template>
         </el-table-column>
         <el-table-column label="型号/协议" align="center" prop="plcModelProtocol" :show-overflow-tooltip="true" />
         <el-table-column label="网络类型" align="center" prop="plcNetworkType" :show-overflow-tooltip="true" >
            <template #default="scope">
               {{ typeDictFormat(sys_network_type,scope.row.plcNetworkType) }} 
            </template>
         </el-table-column>
         <el-table-column label="采集驱动" align="center" prop="plcAcquisitionDriver" :show-overflow-tooltip="true" />
         <el-table-column label="IP" align="center" prop="plcIp" :show-overflow-tooltip="true" />
         <el-table-column label="端口" align="center" prop="plcPort" :show-overflow-tooltip="true" />
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
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
                  v-hasPermi="['plcManage:plc:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  v-hasPermi="['plcManage:plc:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
         @pagination="getList" />

      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="plcRef" :model="form" :rules="rules" label-width="120px">

            <el-row>
               <el-form-item label="PLC名称" prop="plcName">
                  <el-input v-model="form.plcName" placeholder="请输入PLC名称" />
               </el-form-item>
               <el-form-item label="PLC代码" prop="plcCode">
                  <el-input v-model="form.plcCode" placeholder="请输入PLC代码" :disabled="plcCodeIsDisabled" />
               </el-form-item>
            </el-row>

            <el-tabs type="border-card">
               <el-tab-pane label="基础属性">
                  <el-row>
                     <el-form-item label="PLC类型" prop="plcType">
                        <el-select v-model="form.plcType" placeholder="PLC类型" clearable @change="plcTypeChange">
                           <el-option v-for="item in sys_plc_type" :key="item.value" :label="item.label"
                              :value="item.value" />
                        </el-select>
                     </el-form-item>

                     <el-form-item label="采集驱动" prop="plcAcquisitionDriver">
                        <el-select v-model="form.plcAcquisitionDriver" placeholder="采集驱动" clearable
                           @change="plcAcquisitionDriverChange">
                           <el-option v-for="item in sys_acquisition_driver" :key="item.value" :label="item.label"
                              :value="item.value" :disabled="item.disabled" />
                        </el-select>
                     </el-form-item>
                  </el-row>

                  <el-row>
                     <el-form-item label="型号/协议" prop="plcModelProtocol">
                        <el-select v-model="form.plcModelProtocol" placeholder="型号/协议" clearable
                           @change="plcModelProtocolChange">
                           <el-option v-for="item in sys_model_protocol" :key="item.value" :label="item.label"
                              :value="item.value" />
                        </el-select>
                     </el-form-item>
                     <el-form-item label="网络类型" prop="plcNetworkType">
                        <el-select v-model="form.plcNetworkType" placeholder="网络类型" clearable
                           @change="plcNetworkTypeChange">
                           <el-option v-for="item in sys_network_type" :key="item.value" :label="item.label"
                              :value="item.value" :disabled="item.disabled" />
                        </el-select>
                     </el-form-item>
                     <el-row>
                        <el-form-item label="推送频率(ms)" prop="plcSendFrequ">
                           <el-input-number v-model.number="form.plcSendFrequ" placeholder="" />
                        </el-form-item>
                     </el-row>

                     <el-form-item label="状态" prop="status">
                        <el-radio-group v-model="form.status">
                           <el-radio v-for="item in sys_normal_disable" :key="item.value" :label="item.value">{{ item.label
                           }}</el-radio>
                        </el-radio-group>
                     </el-form-item>
                  </el-row>


                  <el-form-item label="备注" prop="remark">
                     <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
                  </el-form-item>

               </el-tab-pane>
               <el-tab-pane label="连接配置">

                  <!-- @*IP-Port参数显示------------------------------------------------------------------------------------*@ -->
                  <!-- @*IP-Port参数显示*@ -->
                  <div v-show="cardIpConfigShow">
                     <el-row>
                        <el-col :span="12">
                           <el-form-item label="IP地址" prop="plcIp" :required="cardIpConfigShow">
                              <el-input v-model="form.plcIp" placeholder="请输入IP地址" />
                           </el-form-item>
                        </el-col>
                        <el-col :span="12">
                           <el-form-item label="端口号" prop="plcPort" :required="cardIpConfigShow">
                              <el-input-number v-model="form.plcPort" />
                           </el-form-item>
                        </el-col>
                     </el-row>
                  </div>


                  <!-- @*modbus参数显示------------------------------------------------------------------------------------*@ -->
                  <!-- @*modbus参数显示*@ -->
                  <div v-show="cardModbusShow">
                     <el-row>
                        <el-col :span="24">
                           <el-divider content-position="left">modbus参数</el-divider>
                        </el-col>
                     </el-row>
                     <el-row>
                        <el-col :span="12">
                           <el-form-item label="设备站号" prop="plcModbusStation" :required="cardModbusShow">
                              <el-input-number v-model="form.plcModbusStation" />
                           </el-form-item>
                        </el-col>
                        <el-col :span="12">
                           <el-form-item label="数据格式" prop="plcModbusDataformat" :required="cardModbusShow">
                              <el-select v-model="form.plcModbusDataformat" placeholder="请选择数据格式">
                                 <el-option v-for="item in sys_data_format" :key="item.value" :label="item.label"
                                    :value="item.value"></el-option>
                              </el-select>
                           </el-form-item>
                        </el-col>
                     </el-row>
                     <el-row>
                        <el-col :span="12">
                           <el-form-item label="零为起始位" prop="plcModbusStartwithzero" :required="cardModbusShow">
                              <el-radio-group v-model="form.plcModbusStartwithzero">
                                 <el-radio v-for="item in sys_yes_no" :key="item.value" :label="item.value">{{ item.label
                                 }}</el-radio>
                              </el-radio-group>
                           </el-form-item>
                        </el-col>
                        <el-col :span="12">
                           <el-form-item label="字符串颠倒" prop="plcModbusStringreverse" :required="cardModbusShow">
                              <el-radio-group v-model="form.plcModbusStringreverse">
                                 <el-radio v-for="item in sys_yes_no" :key="item.value" :label="item.value">{{ item.label
                                 }}</el-radio>
                              </el-radio-group>
                           </el-form-item>
                        </el-col>
                     </el-row>
                  </div>

                  <!-- @*串口参数显示------------------------------------------------------------------------------------*@ -->
                  <!-- @*串口参数显示 *@ -->
                  <div v-show="cardComShow">
                     <el-row>
                        <el-col :span="24">
                           <el-divider content-position="left">串口参数</el-divider>
                        </el-col>
                     </el-row>
                     <el-row>
                        <el-col :span="12">
                           <el-form-item label="COM口名称" prop="plcComName" :required="cardComShow">
                              <el-select v-model="form.plcComName" placeholder="请选择COM口" clearable filterable allow-create
                                 default-first-option>
                                 <el-option v-for="item in dictComPorts" :key="item.value" :label="item.label"
                                    :value="item.value"></el-option>
                              </el-select>
                           </el-form-item>
                        </el-col>
                        <el-col :span="12">
                           <el-form-item label="波特率(bps)" prop="plcComBaudRate" :required="cardComShow">
                              <el-input-number v-model="form.plcComBaudRate" />
                           </el-form-item>
                        </el-col>
                     </el-row>
                     <el-row>
                        <el-col :span="12">
                           <el-form-item label="奇偶校验位" prop="plcComParity" :required="cardComShow">
                              <el-radio-group v-model="form.plcComParity">
                                 <el-radio v-for="item in sys_parity_options" :key="item.value" :label="item.value">{{
                                    item.label }}</el-radio>
                              </el-radio-group>
                           </el-form-item>
                        </el-col>
                     </el-row>
                     <el-row>
                        <el-col :span="12">
                           <el-form-item label="数据位" prop="plcComDataBits" :required="cardComShow">
                              <el-input-number v-model="form.plcComDataBits" />
                           </el-form-item>
                        </el-col>
                        <el-col :span="12">
                           <el-form-item label="停止位" prop="plcComStopBits" :required="cardComShow">
                              <el-input-number v-model="form.plcComStopBits" />
                           </el-form-item>
                        </el-col>
                     </el-row>
                  </div>

               </el-tab-pane>
               <el-tab-pane label="设备参数">
                  <div v-show="cardSiemensShow">
                     <el-row>
                        <el-col :span="12">
                           <el-form-item label="机架Rack" prop="plcSiemensRack" :required="cardSiemensShow">
                              <el-input-number v-model="form.plcSiemensRack" />
                           </el-form-item>
                        </el-col>
                        <el-col :span="12">
                           <el-form-item label="插槽Slot" prop="plcSiemensSlot" :required="cardSiemensShow">
                              <el-input-number v-model="form.plcSiemensSlot" />
                           </el-form-item>
                        </el-col>
                     </el-row>
                  </div>
               </el-tab-pane>
            </el-tabs>


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
 
<script setup name="Plc">
import { listPlc, getPlc, delPlc, addPlc, updatePlc, getPortNames, getConfig, acquisitionStart } from "@/api/plcManage/plc";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");
const { sys_yes_no } = proxy.useDict("sys_yes_no");
const { sys_plc_type } = proxy.useDict("sys_plc_type");
const { sys_network_type } = proxy.useDict("sys_network_type");
const { sys_parity_options } = proxy.useDict("sys_parity_options");
const { sys_data_format } = proxy.useDict("sys_data_format");

const sys_model_protocol = ref([]);
const sys_acquisition_driver = ref([]);

const optionNull = ref({ value: [] });

const isZsNumberValidate = inject('isZsNumberValidate');
const IPValidator = inject('IPValidator');


const isNetworkValidate = (rule, value, callback) => {
   if (rule.required) {
      if (value === '' || value === null || value === undefined) {
         callback(new Error('不能为空'));
      }
      else if (sys_network_type.value.filter((p) => p.value === value && p.disabled == true).length > 0) {
         callback(new Error('该选项不可用，请重新选择！'));
      }
      else {
         callback()
      }
   } else {
      callback();
   }
};


const typeList = ref([]);
const open = ref(false);
const actionAdd = ref(false);
const cardIpConfigShow = ref(false);
const cardComShow = ref(false);
const cardModbusShow = ref(false);
const cardSiemensShow = ref(false);

const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const dictComPorts = ref([]);
const plcCodeIsDisabled = ref(false);

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      plcName: undefined,
      plcType: undefined,
      status: undefined
   },
   rules: {
      plcName: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcType: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcSendFrequ: [
         { required: true, validator: isZsNumberValidate, trigger: "blur" },
      ],
      plcAcquisitionDriver: [
         { required: true, message: "不能为空", trigger: "blur" },
      ],
      plcNetworkType: [
         { required: true, message: "不能为空", trigger: "blur" },
         { required: true, validator: isNetworkValidate, trigger: "blur" }
      ],
      plcModelProtocol: [
         { required: true, message: "不能为空", trigger: "blur" }],
      plcIp: [
         { message: "不能为空", required: cardIpConfigShow.value, validator: IPValidator, trigger: "blur" }
      ],
      plcPort: [
         { type: 'number', required: true, validator: isZsNumberValidate, trigger: "blur" }
      ],
      plcComName: [
         { message: "不能为空", required: cardComShow.value, trigger: "blur" },
      ],
      plcComBaudRate: [
         { type: 'number', required: true, validator: isZsNumberValidate, trigger: "blur" }
      ],
      plcComDataBits: [
         { type: 'number', validator: isZsNumberValidate, trigger: "blur" }
      ],
      plcComStopBits: [
         { type: 'number', required: true, validator: isZsNumberValidate, trigger: "blur" }
      ],
      plcComParity: [
         { message: "不能为空", required: cardComShow.value, trigger: "blur" },
      ],
      plcModbusStation: [
         { message: "站号不能为空", required: cardModbusShow.value, trigger: "blur" },
         { type: 'number', required: cardModbusShow.value, validator: isZsNumberValidate, trigger: "blur" }
      ],
      plcModbusDataformat: [
         { message: "数据格式不能为空", required: cardModbusShow.value, trigger: "blur" },
      ],
      plcModbusStartwithzero: [
         { message: "不能为空", required: cardModbusShow.value, trigger: "blur" },
      ],
      plcModbusStringreverse: [
         { message: "不能为空", required: cardModbusShow.value, trigger: "blur" },
      ],
      plcSiemensRack: [
         { message: "不能为空", required: cardSiemensShow.value, trigger: "blur" },
         { type: 'number', required: cardSiemensShow.value, validator: isZsNumberValidate, trigger: "blur" }
      ],
      plcSiemensSlot: [
         { message: "不能为空", required: cardSiemensShow.value, trigger: "blur" },
         { type: 'number', required: cardSiemensShow.value, validator: isZsNumberValidate, trigger: "blur" }
      ],

   },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询PLC类型列表 */
function getList() {
   loading.value = true;
   listPlc(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
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
      plcId: undefined,
      plcName: undefined,
      plcType: undefined,
      status: "0",
      remark: undefined
   };

   cardIpConfigShow.value = false;
   cardComShow.value = false;
   cardModbusShow.value = false;
   cardSiemensShow.value = false;
   proxy.resetForm("plcRef");
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
   getComPortNames();
   form.value.plcSendFrequ = 1000;
   plcCodeIsDisabled.value = false;

   open.value = true;
   title.value = "添加PLC";
   actionAdd.value = true;

   plcTypeChange();
   plcAcquisitionDriverChange();
   plcModelProtocolChange();
   plcNetworkTypeChange();
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.plcId);
   single.value = selection.length != 1;
   multiple.value = !selection.length;
}
/** 修改按钮操作 */
function handleUpdate(row) {
   reset();
   plcCodeIsDisabled.value = true;
   const plcId = row.plcId || ids.value;
   getPlc(plcId).then(response => {
      form.value = response.data;
      open.value = true;
      title.value = "修改PLC";
      actionAdd.value = false;

      plcTypeChange(form.value.plcType);
      plcAcquisitionDriverChange(form.value.plcAcquisitionDriver);
      plcModelProtocolChange(form.value.plcModelProtocol);
      plcNetworkTypeChange(form.value.plcNetworkType);
   });

}
/** 提交按钮 */
function submitForm() {
   proxy.$refs["plcRef"].validate((valid, ValidateFieldsError) => {
      if (valid) {
         if (form.value.plcId != undefined) {
            updatePlc(form.value).then(response => {
               proxy.$modal.msgSuccess("修改成功");
               open.value = false;
               getList();
            });
         } else {
            addPlc(form.value).then(response => {
               proxy.$modal.msgSuccess("新增成功");
               open.value = false;
               getList();
            });
         }
      }
      else {
         console.log(rules);
         Object.keys(ValidateFieldsError).forEach((key, i) => {
            const propName = ValidateFieldsError[key][0].field
            if (i == 0) {
               proxy.$refs["plcRef"].scrollToField(propName)
               proxy.$modal.msgError("表单值验证失败,请检查" + propName);
            }
         })
      }
   });
}
/** 删除按钮操作 */
function handleDelete(row) {
   const plcIds = row.plcId || ids.value;
   proxy.$modal.confirm('是否确认删除PLC编号为"' + plcIds + '"的数据项？').then(function () {
      return delPlc(plcIds);
   }).then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
   }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport() {
   proxy.download("plc/export", {
      ...queryParams.value
   }, `plc_${new Date().getTime()}.xls`);
}

/** 重启采集 */
function handleAcquisition() {
   acquisitionStart(ids.value[0] );
}

/** plc类型选择 获取支持的驱动*/
async function plcTypeChange(value) {
   if (actionAdd.value) {
      form.value.plcModelProtocol = "";
      form.value.plcAcquisitionDriver = "";
      sys_model_protocol.value = toRefs(optionNull.value);
   }
   if (value) {
      // let dictTypeActive = value + "_model_protocol";
      // var list = await proxy.useDictDynamics(dictTypeActive);
      // sys_model_protocol.value = list[dictTypeActive].value;

      let driver = "sys_" + value + "_driver";
      var list = await proxy.useDictDynamics(driver);
      sys_acquisition_driver.value = list[driver].value;

      if (value == "siemens") {
         cardSiemensShow.value = true;
         cardModbusShow.value = false;

         if (actionAdd.value) {
            form.value.plcPort = 22;
            form.value.plcSiemensRack = 0;
            form.value.plcSiemensSlot = 1;
         }

      }
      if (value == "modbus") {
         cardSiemensShow.value = false;
         cardModbusShow.value = true;

         if (actionAdd.value) {
            form.value.plcModbusStation = 1;
            form.value.plcModbusDataformat = 'ABCD';
            form.value.plcModbusStringreverse = "N";
            form.value.plcModbusStartwithzero = 'Y';
         }
      }
   } else {
      // sys_model_protocol.value  = toRefs(optionNull.value);
      sys_acquisition_driver.value = toRefs(optionNull.value);
   }
}


/** plc采集驱动选择 获取驱动支持的设备类型或协议*/
async function plcAcquisitionDriverChange(value) {
   if (actionAdd.value) {
      form.value.plcModelProtocol = "";
      sys_network_type.value = toRefs(optionNull.value);
   }
   if (value) {
      
      let configKey = form.value.plcType + "_model_protocol_" + value;
      var list = await proxy.useDictDynamics(configKey);

      if (list) {
         sys_model_protocol.value = list[configKey].value;
      }
      else {
         sys_model_protocol.value = toRefs(optionNull.value);
      }
   }
   else {
      sys_model_protocol.value = toRefs(optionNull.value);
   }
}
/** plc型号/协议选择 选择后获取协议支持的网络类型*/
async function plcModelProtocolChange(value) {
   if (value) {
      let configKey = "sys." + value + ".networkType";
      var config = await getSingleConfig(configKey);
      if (typeof config.value == "undefined") {
         sys_network_type.value = await proxy.useDict("sys_network_type")["sys_network_type"].value;
      } else {
         var object = JSON.parse(config.value);
         sys_network_type.value = object;
      }
   }
   else {
      sys_network_type.value = await proxy.useDict("sys_network_type")["sys_network_type"].value;
   }
}

/** plc网络类型选择 控制对应属性的显示*/
function plcNetworkTypeChange(value) {
   if (value == '0') {//网络
      cardIpConfigShow.value = true;
      cardComShow.value = false;
   }
   else if (value == '1') {//串口
      cardIpConfigShow.value = false;
      cardComShow.value = true;

      if (actionAdd.value) {
         form.value.plcComBaudRate = 9600;
         form.value.plcComDataBits = 8;
         form.value.plcComStopBits = 1;
         form.value.plcComParity = "0";
      }
   }
}

/** 类型字典翻译 */
function typeDictFormat(dict, value) {
  return proxy.selectDictLabel(dict, value);
}


// 加载设备串口
function getComPortNames() {
   getPortNames().then(response => {
      dictComPorts.value = response.data;
   });
}
// 加载指定配置
async function getSingleConfig(key) {
   const value = ref(undefined);
   await getConfig(key).then(response => {
      if (response && response.data && response.data.length > 0) {
         value.value = response.data[0].configValue;
         return value;
      }
   });
   return value;
}

getList();
</script>
 