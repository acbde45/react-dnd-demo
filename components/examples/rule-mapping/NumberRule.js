import PropTypes from 'prop-types'
import { InputNumber } from 'antd'

const NumberRule =  ({ value, type, onChange, id }) => <div>
  <div className="label">{type} :</div>
  <div className="display-area">
    <InputNumber value={value} onChange={(newValue) => onChange(id, newValue)} />
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

NumberRule.propTypes = {
  value: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  id: PropTypes.string.isRequired,
}

export default NumberRule