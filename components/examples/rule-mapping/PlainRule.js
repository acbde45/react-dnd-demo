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
      box-sizing: border-box;
      margin: 8px 0 0 0;
      padding: 0;
      text-align: center;
      font-variant: tabular-nums;
      -webkit-font-feature-settings: 'tnum';
      font-feature-settings: 'tnum';
      position: relative;
      display: inline-block;
      width: 100%;
      height: 32px;
      padding: 4px 11px;
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
      line-height: 1.5;
      background-color: #fff;
      background-image: none;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      transition: all 0.3s;
    }
  `}</style>
</div>

PlainRule.propTypes = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
}

export default PlainRule