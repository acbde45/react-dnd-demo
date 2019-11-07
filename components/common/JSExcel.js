import * as XLSX from 'xlsx';

export const JSEXCEL_ERRORS = {
  NOT_FILE_AND_NOT_FILE_UPLOAD_EVENT: 'not file and not file upload event', // 既不是文件也不是文件上传事件
  FILE_TYPE_NOT_RIGHT: 'file type not right', // 文件类型不正确
  EXCEL_FILE_READ_ERROR: 'excel file read error', // excel文件读取错误
  CONVERT_DATA_TYPE_NOT_EXIST: 'convert data type not exist', // 想要转化的数据类型不存在
}

export const CONVERTED_DATA_TYPE = {
  CSV: 'csv',
  JSON: 'json',
  FORMULAE: 'formulae',
  TABLE: 'table',
  AOA: 'aoa',
}

export const EXPORT_BY = {
  TABLE: 'table',
  WORKBOOK: 'workbook',
  AOA: 'aoa',
}

/**
 * 可接受的文件类型
 * 提供一个常量，提供给input[file]的accept属性
 */
export const ACCEPTABLE_FILE_TYPE = '.xls, .xlsx';

/**
 * 提供一个断言方法，确认某个文件类型是否可接受
 * @param fileType 类似.xls, .xlsx, 如果是多个，以`,`分割
 * @return(boolean) true 表示通过
 */
export function assertFileTypeAcceptable(fileType) {
  const pattern = /(^\s*)|(\s*$)/g;
  const accepts = ACCEPTABLE_FILE_TYPE.split(',').map(t => t.replace(pattern, ''));
  const customs = fileType.split(',').map(t => t.replace(pattern, ''));

  return customs.every(c => accepts.includes(c));
}

/**
 * 解析工作表的方法
 * @param worksheet 工作表对象
 * @param type [csv|json|formulae|aoa|table] 默认aoa
 */
export function parseWorksheet(worksheet, type = CONVERTED_DATA_TYPE.AOA) {
  if (!Object.values(CONVERTED_DATA_TYPE).includes(type)) {
    throw new Error(JSEXCEL_ERRORS.CONVERT_DATA_TYPE_NOT_EXIST);
  }
  if (type === CONVERTED_DATA_TYPE.CSV) {
    return XLSX.utils.sheet_to_csv(worksheet);
  } else if (type === CONVERTED_DATA_TYPE.FORMULAE) {
    return XLSX.utils.sheet_to_formulae(worksheet);
  } else if (type === CONVERTED_DATA_TYPE.JSON) {
    return XLSX.utils.sheet_to_json(worksheet);
  } else {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const rows = csv.split('\n');
    rows.pop();
    const aoa = rows.map(row => row.split(','));

    if (type === CONVERTED_DATA_TYPE.AOA) {
      return aoa;
    } else if (type === CONVERTED_DATA_TYPE.TABLE) {
      let header = aoa.shift() || [];
      let emptyCount = 0;
      header = header.map((v, i) => {
        const affix = emptyCount === 0 ? '' : `_${emptyCount}`;
        if (v) {
          return v;
        } else {
          emptyCount++;
          return `__EMPTY${affix}`;
        }
      });
      
      const data = aoa.map(row => row.reduce((p, c, ci) => ({
        ...p,
        [header[ci]]: c,
      }), {}));

      return { header, data };
    }
  }
}

/**
 * 通用导入Excel文件方法
 * @param file file文件或者input[file]上传文件的事件
 * @param dataType 返回格式  csv，json，formulae，aoa (这个是自定义的，也是默认返回的格式) table
 * @param sheetIndex 导出第几张sheet，默认导出第一张
 */
export function readExcel(file, dataType = CONVERTED_DATA_TYPE.AOA, sheetIndex = 0) {
  return new Promise((resolve, reject) => {
    let currentFile = null;
    if (file instanceof File) {
      currentFile = file;
    } else if (file.target) {
      const { files } = file.target;
      currentFile = files[0];
    } else {
      reject(new Error(JSEXCEL_ERRORS.NOT_FILE_AND_NOT_FILE_UPLOAD_EVENT));
    }
    if (!currentFile) return;
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.onload = event => {
      let worksheet, workbook, parsed;
      try {
        const { result } = event.target;
        // 以二进制流方式读取得到整份excel表格对象
        workbook = XLSX.read(result, { type: 'binary' });
        worksheet = getWorksheetFromWorkbookBySheetIndex(sheetIndex, workbook);
      } catch (e) {
        reject(new Error(JSEXCEL_ERRORS.EXCEL_FILE_READ_ERROR));
      }

      try {
        parsed = parseWorksheet(worksheet, dataType);
      } catch(e) {
        reject(e);
      }
      resolve({
        workbook,
        data: parsed,
        currentSheetIndex: sheetIndex,
        file: currentFile,
      });
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(currentFile);
  });
}

export function exportExcel(data, fileName, by = EXPORT_BY.WORKBOOK) {
  if (EXPORT_BY.JSON === by) {
    return exportExcelByTable(data, fileName);
  } else if (EXPORT_BY.AOA === by) {
    return exportExcelByAOA(data, fileName);
  } else {
    return exportExcelByWorkbook(data, fileName);
  }
}

/**
 * 通用导出Excel文件方法
 * @param table
 * @param options
 * @param fileName
 */
export function exportExcelByTable(table, fileName) {
  const worksheet = genWorksheetByTable(table);
  const workbook = genWorkbook(worksheet);
  // 导出 Excel
  XLSX.writeFile(wb, fileName);
}

/**
 * 通用导出Excel文件方法通过aoa的形式
 * @param workbook
 * @param fileName
 */
export function exportExcelByAOA(aoa, fileName) {
  const worksheet = genWorksheetByAOA(aoa);
  const workbook = genWorkbook(worksheet);
  XLSX.writeFile(workbook, fileName);
}

/**
 * 通用导出Excel文件方法通过Workbook
 * @param workbook
 * @param fileName
 */
export function exportExcelByWorkbook(workbook, fileName) {
  XLSX.writeFile(workbook, fileName);
}

/**
 * 获取工作表名称集合
 * @param workbook
 */
export function getSheetNames(workbook) {
  return workbook.SheetNames;
}

/**
 * 获取指定工作表名称的工作表
 * @param sheetName
 * @param workbook
 */
export function getWorksheetFromWorkbookBySheetName(sheetName, workbook) {
  return workbook.Sheets[sheetName];
}

/**
 * 获取指定工作表索引的工作表
 * @param sheetIndex
 * @param workbook
 */
export function getWorksheetFromWorkbookBySheetIndex(sheetIndex, workbook) {
  const sheetNames = getSheetNames(workbook); // 工作表名称集合
  return getWorksheetFromWorkbookBySheetName(sheetNames[sheetIndex], workbook);
}

/**
 * 向一个已经存在的工作表里添加数据
 * @param worksheet
 * @param aoa
 */
export function appendAOAToWorksheet(worksheet, aoa, opts = {}) {
  return XLSX.utils.sheet_add_aoa(worksheet, aoa, Object.assign({ origin: -1 }, opts));
}

/**
 * 生成一个workbook对象
 */
export function genWorkbook(worksheet, sheetName = 'mySheet') {
  const workbook = XLSX.utils.book_new();

  if (worksheet) {
    appendWorksheetToWorkbook(workbook, worksheet, sheetName);
  }
  return workbook;
}

/**
 * 根据table生成一个工作表
 */
export function genWorksheetByTable(table) {
  const { header, data } = table; 
  if(!header || !data) return;
  const parsedHeader = header.map((v, i) =>
    Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 1 })
  )
  .reduce(
    (prev, next) =>
      Object.assign({}, prev, { [next.position]: { v: next.v } }),
    {}
  );
  const parsedData = data.map((v, i) =>
    header.map((k, j) =>
      Object.assign(
        {},
        { v: v[k], position: String.fromCharCode(65 + j) + (i + 2) }
      )
    )
  )
  .reduce((prev, next) => prev.concat(next))
  .reduce(
    (prev, next) =>
      Object.assign({}, prev, { [next.position]: { v: next.v } }),
    {}
  );

  // 合并 headers 和 data
  const output = Object.assign({}, parsedHeader, parsedData);
  // 获取所有单元格的位置
  const outputPos = Object.keys(output);
  // 计算出范围
  const ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];

  return Object.assign({}, output, { '!ref': ref });
}

/**
 * 根据json生成一个工作表
 */
export function genWorksheetByAOA(aoa) {
  return XLSX.utils.aoa_to_sheet(aoa);
}

/**
 * 将worksheet添加到一个已存在的workbook里
 * @param workbook 
 * @param worksheet 
 * @param sheetName 
 */
export function appendWorksheetToWorkbook(workbook, worksheet, sheetName) {
  return XLSX.utils.book_new(workbook, worksheet, sheetName);
}
