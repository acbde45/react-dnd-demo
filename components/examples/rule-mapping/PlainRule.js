import ItemTypes from './ItemTypes'
import PropTypes from 'prop-types'

const PlainRule =  ({ value, type }) => <div>
  <div className="label">{type} :</div>
  <div className="display-area">{value}</div>
  <style jsx>{`
    .label {
      font-size: 12px;
      text-align: left;
    }
    .display-area {
      background: #fff;
      color: #666;
      border: 1px solid blue;
      padding: 4px 8px;
      margin-top: 8px;
    }
  `}</style>
</div>

PlainRule.propTypes = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
}

export default PlainRule