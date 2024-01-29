import moment from 'moment'

/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */

// 日期格式化
 export function momentTime(time, pattern) {
  var hm ;
  if (typeof time === 'string') {
    let last = time.lastIndexOf('.');
    hm = time.substring(last).replace('Z', '');
  }
  const format = pattern || 'YYYY-MM-DD HH:mm:ss'
  return moment(time).format(format) + hm;
 }
// moment日期格式化UTC
export function momentUTC(time, pattern) {
  const format = pattern || 'YYYY-MM-DDTHH:mm:ssZ'
  return moment(time).format(format);
 }

// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/').replace('T', ' ').replace('Z', '').replace(new RegExp(/\.[\d]{3,}/gm), '');
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(), 
    a: date.getDay() 
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

// 获取当前日期 yy-mm-dd
export function getDate() {
  let yy = new Date().getFullYear();
  let mm = new Date().getMonth() + 1;
  let dd = new Date().getDate();
  return yy + '-' + mm + '-' + dd;
}
// 获取当前日期 hh-mm-ss
export function getTime() {
  let hh = new Date().getHours();
  let mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes();
  let ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds();
  return hh + ':' + mf + ':' + ss;
}


// 获取当前日期数据 yy-mm-dd hh:mf:ss
export function getDateTime() {
  let yy = new Date().getFullYear();
  let mm = new Date().getMonth() + 1;
  let dd = new Date().getDate();
  let hh = new Date().getHours();
  let mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes();
  let ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds();
  return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + mf + ':' + ss;
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
  let search = params;
  search.params = typeof (search.params) === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};
  dateRange = Array.isArray(dateRange) ? dateRange : [];
  if (typeof (propName) === 'undefined') {
    search.params['beginTime'] = dateRange[0];
    search.params['endTime'] = dateRange[1];
  } else {
    search.params['begin' + propName] = dateRange[0];
    search.params['end' + propName] = dateRange[1];
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  if (value === undefined) {
    return "";
  }
  var actions = [];
  Object.keys(datas).some((key) => {
    if (datas[key].value == ('' + value)) {
      actions.push(datas[key].label);
      return true;
    }
  })
  if (actions.length === 0) {
    actions.push(value);
  }
  return actions.join('');
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
  if (value === undefined || value.length ===0) {
    return "";
  }
  if (Array.isArray(value)) {
    value = value.join(",");
  }
  var actions = [];
  var currentSeparator = undefined === separator ? "," : separator;
  var temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some((val) => {
    var match = false;
    Object.keys(datas).some((key) => {
      if (datas[key].value == ('' + temp[val])) {
        actions.push(datas[key].label + currentSeparator);
        match = true;
      }
    })
    if (!match) {
      actions.push(temp[val] + currentSeparator);
    }
  })
  return actions.join('').substring(0, actions.join('').length - 1);
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments, flag = true, i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return arg;
  });
  return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}

// 数据合并
export function mergeRecursive(source, target) {
  for (var p in target) {
    try {
      if (target[p].constructor == Object) {
        source[p] = mergeRecursive(source[p], target[p]);
      } else {
        source[p] = target[p];
      }
    } catch (e) {
      source[p] = target[p];
    }
  }
  return source;
};

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  let config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  };

  var childrenListMap = {};
  var nodeIds = {};
  var tree = [];

  for (let d of data) {
    let parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (let d of data) {
    let parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (let t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (let c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
}

/**
* 参数处理
* @param {*} params  参数
*/
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result
}


// 返回项目路径
export function getNormalPath(p) {
  if (p.length === 0 || !p || p == 'undefined') {
    return p
  };
  let res = p.replace('//', '/')
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1)
  }
  return res;
}

// 验证是否为blob格式
export function blobValidate(data) {
  return data.type !== 'application/json'
}

export function validateIP(ip) {
  var ipPattern = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3})$/;
  
  if (ipPattern.test(ip)) {
      return true; // IP地址格式有效
  } else {
      return false; // IP地址格式无效
  }
}

/**
 * @name  getTableData
 * @desc  纯JS前端分页方法
 * @param  {Number} page 当前页码，默认1
 * @param  {Number} pageSize 每页最多显示条数，默认10
 * @param  {Array} totalData 总的数据集，默认为空数组
 * @return {Object} {
    data, //当前页展示数据，数组
    page, //当前页码
    pageSize, //每页最多显示条数
    length, //总的数据条数
  }
**/

export function  getTableData (page = 1, pageSize = 10, totalData = [])  {
  const { length } = totalData;
  const tableData = {
    data: [],
    page,
    pageSize,
    length,
  };
  if (pageSize >= length) { //pageSize大于等于总数据长度，说明只有1页数据或没有数据
    tableData.data = totalData;
    tableData.page = 1;//直接取第一页
  } else { //pageSize小于总数据长度，数据多余1页
    const num = pageSize * (page - 1);//计算当前页（不含）之前的所有数据总条数
    if (num < length) { //如果当前页之前所有数据总条数小于（不能等于）总的数据集长度，则说明当前页码没有超出最大页码
      const startIndex = num;//当前页第一条数据在总数据集中的索引
      const endIndex = num + pageSize - 1;//当前页最后一条数据索引
      tableData.data = totalData.filter((_, index) => index >= startIndex && index <= endIndex);//当前页数据条数小于每页最大条数时，也按最大条数范围筛取数据
    } else { //当前页码超出最大页码，则计算实际最后一页的page，自动返回最后一页数据
      const size = parseInt(length / pageSize); //取商
      const rest = length % pageSize; //取余数
      if (rest > 0) { //余数大于0，说明实际最后一页数据不足pageSize，应该取size+1为最后一条的页码
        tableData.page = size + 1;//当前页码重置，取size+1
        tableData.data = totalData.filter((_, index) => index >= (pageSize * size) && index <= length);
      } else if (rest === 0) { //余数等于0，最后一页数据条数正好是pageSize
        tableData.page = size;//当前页码重置，取size
        tableData.data = totalData.filter((_, index) => index >= (pageSize * (size - 1)) && index <= length);
      } //注：余数不可能小于0
    }
  }
  return tableData;
};