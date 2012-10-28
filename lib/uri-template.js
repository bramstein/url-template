module.exports = function (template) {
    var operators = ['+', '#', '.', '/', ';', '?', '&'];

    function encodeReserved(str) {
        var parts = str.split(/(%[0-9A-Fa-f]{2})/g);

        for (var i = 0; i < parts.length; i += 1) {
            if (!/%[0-9A-Fa-f]/.test(parts[i])) {
                parts[i] = encodeURI(parts[i]);
            }
        }
        return parts.join('');
    }

    function encodeValue(operator, value, key) {
        value = (operator === '+' || operator === '#') ? encodeReserved(value) : encodeURIComponent(value);

        if (key) {
            return encodeURIComponent(key) + '=' + value;
        } else {
            return value;
        }
    }

    function getValues(context, operator, key, modifier) {
        var value = context[key],
            result = [];

        if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                value = value.toString();

                if (modifier && modifier !== '*') {
                    value = value.substring(0, parseInt(modifier, 10));
                }

                if (operator === ';' || operator === '&' || operator === '?') {
                    result.push(encodeValue(operator, value, key));
                } else {
                    result.push(encodeValue(operator, value));
                }
            } else if (Array.isArray(value)) {
                if (modifier === '*') {
                    for (var j = 0; j < value.length; j += 1) {
                        result.push(encodeValue(operator, value[j], (operator === ';' || operator === '&' || operator === '?') ? key : null));
                    }
                } else {
                    var tmp = [];

                    for (var j = 0; j < value.length; j += 1) {
                        tmp[j] = encodeValue(operator, value[j]);
                    }

                    if (operator === ';' || operator === '&' || operator === '?') {
                        result.push(encodeURIComponent(key) + '=' + tmp.join(','));
                    } else if (tmp.length !== 0) {
                        result.push(tmp.join(','));
                    }
                }
            } else {
                if (modifier === '*') {
                    Object.keys(value).forEach(function (k) {
                        if (value[k] !== undefined && value[k] !== null) {
                            result.push(encodeValue(operator, value[k], k));
                        }
                    });
                } else {
                    var tmp = [];

                    Object.keys(value).forEach(function (k) {
                        if (value[k] !== undefined && value[k] !== null) {
                            tmp.push(encodeURIComponent(k));
                            tmp.push(encodeValue(operator, value[k].toString()));
                        }
                    });

                    if (operator === ';' || operator === '&' || operator === '?') {
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
            }
        }
        return result;
    }

    return function (context) {
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
            if (expression) {
                var operator = null,
                    variables = [],
                    values = [];

                if (operators.indexOf(expression.charAt(0)) !== -1) {
                    operator = expression.charAt(0);
                    expression = expression.substr(1);
                }

                variables = expression.split(/,/g);

                for (var i = 0; i < variables.length; i += 1) {
                    var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variables[i]);

                    values.push.apply(values, getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                }

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
                return encodeReserved(literal);
            }
        });
    };
};
