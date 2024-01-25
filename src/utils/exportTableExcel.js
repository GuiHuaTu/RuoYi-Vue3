import ExportJsonExcel from 'js-export-excel';
import { parseTime ,momentTime} from '@/utils/tool'; 

// 只支持单sheet 导出
//data 为所需要导出的表格数据
//dataTables [{field:key,displayName:name,columnSize:10}] displayName 为表头数据， key 为每一列data表格的key columnSize 列宽
const exportExcel = (
  data,
  dataTables,
  fileName,
  sheetName
) => {
  // console.log('data', data);
  if (data.length == 0) {
    message.error('没有数据需要导出');
    return;
  }
  let option = { fileName: '', datas: [] };
  let sheetData = [];
  let header = [];
  let columnWidths = [];

  dataTables.forEach((item) => {
    header.push(item.displayName);
    columnWidths.push(item.columnSize);
  });

  if (data) {
    for (let i in data) {
      if (data) {
        let obj = {};

        dataTables.forEach((item) => {
          var value = data[i][item.field];
          // 筛选并格式化时间数据 
          if (item.field == 'createTime') {
            value = parseTime(value);
          }
          if (item.field == '_time') {
            value = momentTime(value);
          }
          if (item.field == '_start') {
            value = parseTime(value);
          }
          if (item.field == '_stop') {
            value = parseTime(value);
          }
          obj[item.displayName] = value;
        });
        sheetData.push(obj);
      }
    }
  }
  // console.log('sheetData', header);
  option.fileName = fileName; //导出的Excel文件名
  option.datas = [
    {
      sheetData: sheetData,
      sheetName: sheetName,
      sheetFilter: header,
      sheetHeader: header, //表头
      columnWidths: columnWidths
    },
  ];

  var toExcel = new ExportJsonExcel(option);
  let file = toExcel.saveExcel();
 
};

export default exportExcel;
