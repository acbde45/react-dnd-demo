import { Icon } from 'antd'
import { useDrag, useDrop } from 'react-dnd-cjs'
import PropTypes from 'prop-types'
import ItemTypes from './ItemTypes'

const HandleWrapper = ({ children, id, findRule, moveRule, deleteRule }) => {
  const [{ opacity }, drag, preview] = useDrag({
    item: { type: ItemTypes.HANDLE_WRAPPER, id },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
    end: ({ id }, monitor) => {
      if (!monitor.getDropResult() && deleteRule) { // 如果为null，则认为拖出Container范围
        deleteRule(id)
      }
    },
  })

  const [, drop] = useDrop({
    accept: ItemTypes.HANDLE_WRAPPER,
    canDrop: () => false,
    hover({ id: draggedId }) {
      if (draggedId !== id) {
        const { index: overIndex } = findRule(id)
        moveRule(draggedId, overIndex)
      }
    },
  })

  return (
    <div className="wrapper" ref={(node) => drop(preview(node))} style={{ opacity }}>
      {children}
      <span ref={drag} className="more">
        <Icon type="more" />
      </span>
      <style jsx>{`
        .wrapper {
          padding: 12px 24px 12px 12px;
          margin: 12px;
          border: 1px solid yellow;
          background: #ccc;
          position: relative;
        }
        .wrapper :global(.more) {
          right: 6px;
          top: 12px;
          font-size: 12px;
          position: absolute;
          cursor: move;
        }
      `}</style>
    </div>
  )
}

HandleWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
  findRule: PropTypes.func.isRequired,
  moveRule: PropTypes.func.isRequired,
  deleteRule: PropTypes.func,
}

export default HandleWrapper
