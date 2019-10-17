import React from 'react'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'
import { RuleMapping } from '../../../components/examples/rule-mapping';

export default () => (
  <DndProvider backend={HTML5Backend}>
    <RuleMapping />
  </DndProvider>
)