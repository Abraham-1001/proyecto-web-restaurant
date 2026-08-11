(function () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function isEmpty(value) {
        return value === undefined || value === null || value === '';
    }

    function validateField(value, rules) {
        if (!rules) {
            return null;
        }

        if (rules.required && isEmpty(value)) {
            return rules.message || 'Este campo es obligatorio.';
        }

        if (isEmpty(value)) {
            return null;
        }

        if (rules.type === 'email' && !emailRegex.test(String(value).trim())) {
            return rules.message || 'Ingresa un correo válido.';
        }

        if (rules.type === 'string' && typeof value !== 'string') {
            return rules.message || 'Este campo debe ser texto.';
        }

        if (rules.type === 'number') {
            const number = Number(value);
            if (!Number.isFinite(number)) {
                return rules.message || 'Este campo debe ser un número válido.';
            }
            if (rules.min !== undefined && number < rules.min) {
                return rules.message || `El valor debe ser mayor o igual a ${rules.min}.`;
            }
        }

        if (rules.type === 'integer') {
            const number = Number(value);
            if (!Number.isInteger(number)) {
                return rules.message || 'Este campo debe ser un número entero.';
            }
            if (rules.min !== undefined && number < rules.min) {
                return rules.message || `El valor debe ser mayor o igual a ${rules.min}.`;
            }
        }

        if (rules.minLength !== undefined && String(value).trim().length < rules.minLength) {
            return rules.message || `Este campo debe tener al menos ${rules.minLength} caracteres.`;
        }

        if (rules.enum && Array.isArray(rules.enum) && !rules.enum.includes(value)) {
            return rules.message || `El valor debe ser uno de: ${rules.enum.join(', ')}.`;
        }

        if (rules.pattern) {
            try {
                const re = (rules.pattern instanceof RegExp) ? rules.pattern : new RegExp(rules.pattern);
                if (!re.test(String(value).trim())) {
                    return rules.message || 'Formato inválido.';
                }
            } catch (e) {
                // invalid pattern - ignore and continue
            }
        }

        return null;
    }

    function validateForm(data, schema) {
        const errors = [];
        for (const key in schema) {
            if (Object.prototype.hasOwnProperty.call(schema, key)) {
                const fieldRules = schema[key];
                const error = validateField(data[key], fieldRules);
                if (error) {
                    errors.push({ field: key, message: error });
                }
            }
        }
        return errors;
    }

    window.formValidators = {
        validateForm
    };
})();
