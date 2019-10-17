import { useDrop } from 'react-dnd-cjs'
import PropTypes from 'prop-types'
import HandleWrapper from './HandleWrapper'
import PlainRule from './PlainRule'
import NumberRule from './NumberRule'
import KeyValueRule from './KeyValueRule'
import ItemTypes from './ItemTypes'
import { OperationTypes } from './Contants'

const style = {
  height: 'auto',
  width: '100%',
  marginRight: '1.5rem',
  marginBottom: '24px',
  color: 'white',
  padding: '1rem',
  fontSize: '1rem',
  lineHeight: 'normal',
  display: 'flex',
  flexWrap: 'wrap',
}

const Container = ({ rules, findRule, moveRule, deleteRule, changeRule }) => {
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

  const renderController = (r) => {
    if (r.type === OperationTypes.PROPERTY) {
      return <KeyValueRule type={r.type} id={r.id} value={r.value} onChange={changeRule} />
    } else if (r.type === OperationTypes.NUMBER) {
      return <NumberRule type={r.type} id={r.id} value={r.value} onChange={changeRule} />
    } else if (r.type === OperationTypes.OPERATIONAL_SIGN) {
      return <PlainRule type={r.type} value={r.name} />
    }
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
            { renderController(r) }
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
