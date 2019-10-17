import React from 'react'
import uuid from 'uuid'
import update from 'immutability-helper'
import Container from './Container'
import Operation from './Operation'
import { OperationTypes, OperationalSigns, OperationalSignValues } from './Contants';

function genRules(times = 1) {
  return new Array(times).fill(null).map((r, i) => ({
    type: OperationTypes.PROPERTY, id: uuid(), name: '属性', value: [i.toString(), i.toString()],
  }))
}

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.drawFrame = () => {
      const nextState = update(this.state, this.pendingUpdateFn)
      this.setState(nextState)
      this.pendingUpdateFn = undefined
      this.requestedFrame = undefined
    }
    this.state = {
      rules: genRules(1)
    }
  }

  componentWillUnmount() {
    if (this.requestedFrame !== undefined) {
      cancelAnimationFrame(this.requestedFrame)
    }
  }

  handleonOperationEnd = (itemType, name) => {
    // 拖拽结束添加对应类型的Operation
    this.setState(({ rules }) => ({
      rules: [ ...rules, {
        type: itemType, id: uuid(), name, value: this.getDefaultValue(itemType, name),
      } ]
    }))
  }

  getDefaultValue(itemType, sign) {
    if (itemType === OperationTypes.PROPERTY) {
      return ['', '']
    } else if (itemType === OperationTypes.NUMBER) {
      return 0
    } else if (itemType === OperationTypes.OPERATIONAL_SIGN) {
      return this.getOperationSignDefaultValue(sign)
    }
  }

  getOperationSignDefaultValue(sign) {
    if (sign === OperationalSigns.ADD) {
      return '+'
    } else if (sign === OperationalSigns.SUBTRACT) {
      return '-'
    } else if (sign === OperationalSigns.MULTIPLY) {
      return '*'
    } else if (sign === OperationalSigns.DIVIDE) {
      return '/'
    } else if (sign === OperationalSigns.LEFT_PARENTHESIS) {
      return '('
    } else if (sign === OperationalSigns.RIGHT_PARENTHESIS) {
      return ')'
    }
  }

  findRule = (id) => {
    const { rules } = this.state
    const rule = rules.filter(r => `${r.id}` === id)[0]
    return {
      rule,
      index: rules.indexOf(rule),
    }
  }

  moveRule = (id, atIndex) => {
    const { rule, index } = this.findRule(id)
    this.scheduleUpdate({
      rules: {
        $splice: [[index, 1], [atIndex, 0, rule]],
      },
    })
  }

  deleteRule = (id) => {
    const { index } = this.findRule(id)
    this.scheduleUpdate({
      rules: {
        $splice: [[index, 1]],
      },
    })
  }

  scheduleUpdate(updateFn) {
    this.pendingUpdateFn = updateFn
    if (!this.requestedFrame) {
      this.requestedFrame = requestAnimationFrame(this.drawFrame)
    }
  }

  render() {
    const { rules } = this.state

    return (
      <div style={{ padding: 24 }}>
        <Container
          rules={rules}
          findRule={this.findRule}
          moveRule={this.moveRule}
          deleteRule={this.deleteRule}
        />
        <div style={{ marginBottom: 12 }}>你可以添加：</div>
        <div>
          <Operation type={OperationTypes.PROPERTY} name='属性' onEnd={this.handleonOperationEnd} />
          <Operation type={OperationTypes.NUMBER} name='数值' onEnd={this.handleonOperationEnd} />
          <Operation type={OperationTypes.OPERATIONAL_SIGN} name='+' onEnd={this.handleonOperationEnd} />
          <Operation type={OperationTypes.OPERATIONAL_SIGN} name='-' onEnd={this.handleonOperationEnd} />
          <Operation type={OperationTypes.OPERATIONAL_SIGN} name='x' onEnd={this.handleonOperationEnd} />
          <Operation type={OperationTypes.OPERATIONAL_SIGN} name='÷' onEnd={this.handleonOperationEnd} />
          <Operation type={OperationTypes.OPERATIONAL_SIGN} name='(' onEnd={this.handleonOperationEnd} />
          <Operation type={OperationTypes.OPERATIONAL_SIGN} name=')' onEnd={this.handleonOperationEnd} />
        </div>
      </div>
    )
  }
}
