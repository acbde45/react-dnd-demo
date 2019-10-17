import React from 'react'
import { useDrag } from 'react-dnd-cjs'
import PropTypes from 'prop-types'
import ItemTypes from './ItemTypes'

const style = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  marginRight: '1.5rem',
  marginBottom: '1.5rem',
  cursor: 'move',
  float: 'left',
}

const Operation = ({ type, name, onEnd }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { name, itemType: type, type: ItemTypes.OPERATION },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        onEnd(item.itemType, item.name)
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0.4 : 1
  return (
    <div ref={drag} style={{ ...style, opacity }}>
      {name}
    </div>
  )
}

Operation.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onEnd: PropTypes.func.isRequired,
}

export default Operation
