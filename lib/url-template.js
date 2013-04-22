function UrlTemplate() {
}

UrlTemplate.prototype.encodeReserved = function (str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part);
    }
    return part;
  }).join('');
};

UrlTemplate.prototype.encodeValue = function (operator, value, key) {
  value = (operator === '+' || operator === '#') ? this.encodeReserved(value) : encodeURIComponent(value);

  if (key) {
    return encodeURIComponent(key) + '=' + value;
  } else {
    return value;
  }
};

UrlTemplate.prototype.isDefined = function (value) {
  return value !== undefined && value !== null;
};

UrlTemplate.prototype.isKeyOperator = function (operator) {
  return operator === ';' || operator === '&' || operator === '?';
};

UrlTemplate.prototype.getValues = function (context, operator, key, modifier) {
  var value = context[key],
      result = [];

  if (this.isDefined(value) && value !== '') {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      value = value.toString();

      if (modifier && modifier !== '*') {
        value = value.substring(0, parseInt(modifier, 10));
      }

      result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
    } else {
      if (modifier === '*') {
        if (Array.isArray(value)) {
          value.filter(this.isDefined).forEach(function (value) {
            result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
          }, this);
        } else {
          Object.keys(value).forEach(function (k) {
            if (this.isDefined(value[k])) {
              result.push(this.encodeValue(operator, value[k], k));
            }
          }, this);
        }
      } else {
        var tmp = [];

        if (Array.isArray(value)) {
          value.filter(this.isDefined).forEach(function (value) {
            tmp.push(this.encodeValue(operator, value));
          }, this);
        } else {
          Object.keys(value).forEach(function (k) {
            if (this.isDefined(value[k])) {
              tmp.push(encodeURIComponent(k));
              tmp.push(this.encodeValue(operator, value[k].toString()));
            }
          }, this);
        }

        if (this.isKeyOperator(operator)) {
          result.push(encodeURIComponent(key) + '=' + tmp.join(','));
        } else if (tmp.length !== 0) {
          result.push(tmp.join(','));
        }
      }
    }
  } else {
    if (operator === ';') {
      result.push(encodeURIComponent(key));
    } else if (operator === '&' || operator === '?') {
      result.push(encodeURIComponent(key) + '=');
    } else if (value === '') {
      result.push('');
    }
  }
  return result;
};

UrlTemplate.prototype.parse = function (template) {
  var that = this;
  var operators = ['+', '#', '.', '/', ';', '?', '&'];

  return {
    expand: function (context) {
      return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
        if (expression) {
          var operator = null,
              values = [];

          if (operators.indexOf(expression.charAt(0)) !== -1) {
            operator = expression.charAt(0);
            expression = expression.substr(1);
          }

          expression.split(/,/g).forEach(function (variable) {
            var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
            values.push.apply(values, that.getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
          });

          if (operator && operator !== '+') {
            var separator = ',';

            if (operator === '?') {
              separator = '&';
            } else if (operator !== '#') {
              separator = operator;
            }
            return (values.length !== 0 ? operator : '') + values.join(separator);
          } else {
            return values.join(',');
          }
        } else {
          return that.encodeReserved(literal);
        }
      });
    }
  };
};

if(typeof module !== 'undefined' && module.exports){
  module.exports = UrlTemplate;
}
