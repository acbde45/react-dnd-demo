import PropTypes from 'prop-types'
import { Input } from 'antd'

const InputGroup = Input.Group;

const KeyValueRule =  ({ value, type, onChange, id }) => {
  const [property, propertyValue] = value

  const handleOnChange = (newValue, at) => {
    const copyed = [ ...value ]
    copyed[at] = newValue
    onChange(id, copyed)
  }

  return (
    <div>
      <div className="label">{type} :</div>
      <div className="display-area">
        <InputGroup compact>
          <Input style={{ width: '50%' }} value={property} onChange={(e) => handleOnChange(e.target.value, 0)} />
          <Input style={{ width: '50%' }} value={propertyValue} onChange={(e) => handleOnChange(e.target.value, 1)} />
        </InputGroup>
      </div>
      <style jsx>{`
        .label {
          font-size: 12px;
          text-align: left;
        }
        .display-area {
          margin-top: 8px;
        }
      `}</style>
    </div>
  )
}

KeyValueRule.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  id: PropTypes.string.isRequired,
}

export default KeyValueRule