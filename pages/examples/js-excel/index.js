import React, { Component } from "react";
import { Button, Icon, message } from "antd";
import * as XLSX from "xlsx";
import "./index.css";

const Blob = require("node-blob");

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workbook: null,
      fileName: null,
    }
  }

  readWorkbookFromLocalFile = file => {
    // 获取上传的文件对象
    const { files } = file.target;
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.onload = event => {
      try {
        const { result } = event.target;
        // 以二进制流方式读取得到整份excel表格对象
        const workbook = XLSX.read(result, { type: "binary" });
        this.setState({ workbook, fileName: files[0].name });
        // 存储获取到的数据
        this.readWorkbook(workbook);
      } catch (e) {
        // 这里可以抛出文件类型错误不正确的相关提示
        message.error("文件类型不正确！");
      }
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);
  };

  readWorkbook = workbook => {
    var sheetNames = workbook.SheetNames; // 工作表名称集合
    var worksheet = workbook.Sheets[sheetNames[0]]; // 这里我们只读取第一张sheet
    var csv = XLSX.utils.sheet_to_csv(worksheet);
    document.getElementById("result").innerHTML = this.csv2table(csv);
  };

  csv2table = csv => {
    let html = '<table border="1" cellspacing="0" cellpadding="8">';
    const rows = csv.split("\n");
    rows.pop(); // 最后一行没用的
    rows.forEach(function(row, idx) {
      var columns = row.split(",");
      columns.unshift(idx + 1); // 添加行索引
      if (idx == 0) {
        // 添加列索引
        html += "<tr>";
        for (var i = 0; i < columns.length; i++) {
          html +=
            "<th>" + (i == 0 ? "" : String.fromCharCode(65 + i - 1)) + "</th>";
        }
        html += "</tr>";
      }
      html += "<tr>";
      columns.forEach(function(column) {
        html += "<td>" + column + "</td>";
      });
      html += "</tr>";
    });
    html += "</table>";
    return html;
  };

  exportExcel = () => {
    const { workbook, fileName } = this.state;
    XLSX.writeFile(workbook, fileName);
  }

  exportSpecialExcel = () => {
    const _headers = ["id", "name", "age", "country", "remark"];
    const _data = [
      { id: "1", name: "test1", age: "30", country: "China", remark: "hello" },
      {
        id: "2",
        name: "test2",
        age: "20",
        country: "America",
        remark: "world"
      },
      { id: "3", name: "test3", age: "18", country: "Unkonw", remark: "???" }
    ];

    const headers = _headers
      // 为 _headers 添加对应的单元格位置
      // [ { v: 'id', position: 'A1' },
      //   { v: 'name', position: 'B1' },
      //   { v: 'age', position: 'C1' },
      //   { v: 'country', position: 'D1' },
      //   { v: 'remark', position: 'E1' } ]
      .map((v, i) =>
        Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 1 })
      )
      // 转换成 worksheet 需要的结构
      // { A1: { v: 'id' },
      //   B1: { v: 'name' },
      //   C1: { v: 'age' },
      //   D1: { v: 'country' },
      //   E1: { v: 'remark' } }
      .reduce(
        (prev, next) =>
          Object.assign({}, prev, { [next.position]: { v: next.v } }),
        {}
      );

    const data = _data
      // 匹配 headers 的位置，生成对应的单元格数据
      // [ [ { v: '1', position: 'A2' },
      //     { v: 'test1', position: 'B2' },
      //     { v: '30', position: 'C2' },
      //     { v: 'China', position: 'D2' },
      //     { v: 'hello', position: 'E2' } ],
      //   [ { v: '2', position: 'A3' },
      //     { v: 'test2', position: 'B3' },
      //     { v: '20', position: 'C3' },
      //     { v: 'America', position: 'D3' },
      //     { v: 'world', position: 'E3' } ],
      //   [ { v: '3', position: 'A4' },
      //     { v: 'test3', position: 'B4' },
      //     { v: '18', position: 'C4' },
      //     { v: 'Unkonw', position: 'D4' },
      //     { v: '???', position: 'E4' } ] ]
      .map((v, i) =>
        _headers.map((k, j) =>
          Object.assign(
            {},
            { v: v[k], position: String.fromCharCode(65 + j) + (i + 2) }
          )
        )
      )
      // 对刚才的结果进行降维处理（二维数组变成一维数组）
      // [ { v: '1', position: 'A2' },
      //   { v: 'test1', position: 'B2' },
      //   { v: '30', position: 'C2' },
      //   { v: 'China', position: 'D2' },
      //   { v: 'hello', position: 'E2' },
      //   { v: '2', position: 'A3' },
      //   { v: 'test2', position: 'B3' },
      //   { v: '20', position: 'C3' },
      //   { v: 'America', position: 'D3' },
      //   { v: 'world', position: 'E3' },
      //   { v: '3', position: 'A4' },
      //   { v: 'test3', position: 'B4' },
      //   { v: '18', position: 'C4' },
      //   { v: 'Unkonw', position: 'D4' },
      //   { v: '???', position: 'E4' } ]
      .reduce((prev, next) => prev.concat(next))
      // 转换成 worksheet 需要的结构
      //   { A2: { v: '1' },
      //     B2: { v: 'test1' },
      //     C2: { v: '30' },
      //     D2: { v: 'China' },
      //     E2: { v: 'hello' },
      //     A3: { v: '2' },
      //     B3: { v: 'test2' },
      //     C3: { v: '20' },
      //     D3: { v: 'America' },
      //     E3: { v: 'world' },
      //     A4: { v: '3' },
      //     B4: { v: 'test3' },
      //     C4: { v: '18' },
      //     D4: { v: 'Unkonw' },
      //     E4: { v: '???' } }
      .reduce(
        (prev, next) =>
          Object.assign({}, prev, { [next.position]: { v: next.v } }),
        {}
      );

    // 合并 headers 和 data
    const output = Object.assign({}, headers, data);
    // 获取所有单元格的位置
    const outputPos = Object.keys(output);
    // 计算出范围
    const ref = outputPos[0] + ":" + outputPos[outputPos.length - 1];

    // 构建 workbook 对象
    const wb = {
      SheetNames: ["mySheet"],
      Sheets: {
        mySheet: Object.assign({}, output, { "!ref": ref })
      }
    };

    // 导出 Excel
    XLSX.writeFile(wb, "一个普通的Excel.xlsx");
  };

  render() {
    const { workbook, fileName } = this.state;

    return (
      <div style={{ padding: 24 }}>
        <Button className="upload-wrap">
          <Icon type="upload" />
          <input
            className="file-uploader"
            type="file"
            accept=".xlsx, .xls"
            onChange={this.readWorkbookFromLocalFile}
          />
          <span className="upload-text">上传文件</span>
        </Button>
        <p className="upload-tip">支持 .xlsx、.xls 格式的文件</p>
        {
          workbook && fileName && <Button style={{ marginTop: 16, marginLeft: 16 }} onClick={this.exportExcel}>
            导出
          </Button>
        }
        <p>结果输出：</p>
        <div id="result"></div>

        <Button style={{ marginTop: 16 }} onClick={this.exportSpecialExcel}>
          导出指定Excel
        </Button>
      </div>
    );
  }
}
