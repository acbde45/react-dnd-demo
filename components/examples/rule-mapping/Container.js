import { useDrop } from 'react-dnd-cjs'
import PropTypes from 'prop-types'
import HandleWrapper from './HandleWrapper'
import PlainRule from './PlainRule'
import ItemTypes from './ItemTypes'

const style = {
  height: 'auto',
  width: '100%',
  marginRight: '1.5rem',
  marginBottom: '24px',
  color: 'white',
  padding: '1rem',
  textAlign: 'center',
  fontSize: '1rem',
  lineHeight: 'normal',
  display: 'flex',
  flexWrap: 'wrap',
}

const Container = ({ rules, findRule, moveRule, deleteRule }) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: [ ItemTypes.OPERATION, ItemTypes.HANDLE_WRAPPER ],
    drop: () => ({ name: 'container' }),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })
  const isActive = canDrop && isOver
  let backgroundColor = '#222'
  if (isActive) {
    backgroundColor = 'darkgreen'
  } else if (canDrop) {
    backgroundColor = 'darkkhaki'
  }

  return (
    <div ref={drop} style={{ ...style, backgroundColor }}>
      {
        rules.map(r => (
          <HandleWrapper
            key={r.id}
            id={r.id}
            findRule={findRule}
            moveRule={moveRule}
            deleteRule={deleteRule}
          >
            <PlainRule type={r.type} value={r.name} />
          </HandleWrapper>
        ))
      }
    </div>
  )
}

Container.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string).isRequired,
      PropTypes.string.isRequired,
      PropTypes.number.isRequired,
    ]).isRequired,
  })),
  findRule: PropTypes.func.isRequired,
  moveRule: PropTypes.func.isRequired,
  deleteRule: PropTypes.func,
}

export default Container
