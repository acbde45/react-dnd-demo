import React, { Component } from 'react';
import { Button, Icon, message } from 'antd';
import * as XLSX from 'xlsx';
import {
  ACCEPTABLE_FILE_TYPE,
  CONVERTED_DATA_TYPE,
  readExcel,
  exportExcel,
  exportExcelByTable,
  exportExcelByAOA,
  getWorksheetFromWorkbookBySheetIndex,
  appendAOAToWorksheet,
  genWorkbook,
} from '../../../components/common/JSExcel';
import './index.css';

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workbook: null,
      fileName: null,
    }
  }

  readWorkbookFromLocalFile = async event => {
    try {
      const { workbook, data, file } = await readExcel(event, CONVERTED_DATA_TYPE.CSV);
      console.log(workbook);
      this.setState({
        workbook,
        fileName: file.name,
      })
      this.readWorkbook(data);
    } catch(e) {
      message.error(e.message);
    }
  };

  readWorkbook = csv => {
    document.getElementById('result').innerHTML = this.csv2table(csv);
  };

  csv2table = csv => {
    let html = '<table border="1" cellspacing="0" cellpadding="8">';
    const rows = csv.split('\n');
    rows.pop(); // 最后一行没用的
    rows.forEach(function(row, idx) {
      var columns = row.split(',');
      columns.unshift(idx + 1); // 添加行索引
      if (idx == 0) {
        // 添加列索引
        html += '<tr>';
        for (var i = 0; i < columns.length; i++) {
          html +=
            '<th>' + (i == 0 ? '' : String.fromCharCode(65 + i - 1)) + '</th>';
        }
        html += '</tr>';
      }
      html += '<tr>';
      columns.forEach(function(column) {
        html += '<td>' + column + '</td>';
      });
      html += '</tr>';
    });
    html += '</table>';
    return html;
  };

  exportExcel = () => {
    const { workbook, fileName } = this.state;
    exportExcel(workbook, fileName);
  }

  exportSpecialExcel = () => {
    const _headers = ['id', 'name', 'age', 'country', 'remark'];
    const _data = [
      { id: '1', name: 'test1', age: '30', country: 'China', remark: 'hello' },
      {
        id: '2',
        name: 'test2',
        age: '20',
        country: 'America',
        remark: 'world'
      },
      { id: '3', name: 'test3', age: '18', country: 'Unkonw', remark: '???' }
    ];

    // 导出 Excel
    exportExcelByTable({
      header: _headers,
      data: _data,
    }, '一个普通的Excel.xlsx');
  };

  exportAOA2Excel = () => {
    const aoa = [
      [ 'S', 'h', 'e', 'e', 't', 'J', 'S' ],
      [  1 ,  2 ,  3 ,  4 ,  5 ]
    ];

    exportExcelByAOA(wxData, 'aoa.xlsx');
  }

  testAppendAOAToWorkSheet = () => {
    const { workbook } = this.state;
    const worksheet = getWorksheetFromWorkbookBySheetIndex(0, workbook);
    const aoa = [
      [ 'S', 'h', 'e', 'e', 't', 'J', 'S' ],
      [  1 ,  2 ,  3 ,  4 ,  5 ]
    ];
    appendAOAToWorksheet(worksheet, aoa);
    this.exportExcel();
  }

  render() {
    const { workbook, fileName } = this.state;

    return ( 
      <div style={{ padding: 24 }}>
        <Button className="upload-wrap">
          <Icon type="upload" />
          <input
            className="file-uploader"
            type="file"
            accept={ACCEPTABLE_FILE_TYPE}
            onChange={this.readWorkbookFromLocalFile}
          />
          <span className="upload-text">上传文件</span>
        </Button>
        <p className="upload-tip">支持 .xlsx、.xls 格式的文件</p>
        <Button style={{ marginTop: 16, marginLeft: 16 }} onClick={this.testAppendAOAToWorkSheet}>
          导出
        </Button>
        <p>结果输出：</p>
        <div id="result"></div>

        <Button style={{ marginTop: 16 }} onClick={this.exportSpecialExcel}>
          导出指定Excel
        </Button>

        <br />
        <Button style={{ marginTop: 16 }} onClick={this.exportAOA2Excel}>
          导出Excel通过aoa的形式
        </Button>
      </div>
    );
  }
}
