import React from 'react';
import { IndianRupee, PlusCircle, MinusCircle } from 'lucide-react';

const InputRow = ({
    label,
    value,
    onChange,
    onRemove,
    onAdd,
    type = 'text',
    placeholder = '',
    icon: Icon,
    id,
    showRemoveButton = true,
    showAddButton = false,
    accentColor = 'blue',
    className = '',
    inputClassName = '',
    labelClassName = '',
    currency = false,
}) => {
    const inputId = `input-row-${id || label?.toLowerCase().replace(/\s/g, '-') || Math.random().toString(36).substring(7)}`;

    const focusRingColor = {
        blue: 'focus:ring-blue-500',
        green: 'focus:ring-green-500',
        red: 'focus:ring-red-500',
        teal: 'focus:ring-teal-500',
        indigo: 'focus:ring-indigo-500',
    }[accentColor] || 'focus:ring-gray-500';

    const hoverTextColor = {
        blue: 'hover:text-blue-700',
        green: 'hover:text-green-700',
        red: 'hover:text-red-700',
        teal: 'hover:text-teal-700',
        indigo: 'hover:text-indigo-700',
    }[accentColor] || 'hover:text-gray-700';

    const textColor = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        teal: 'text-teal-600',
        indigo: 'text-indigo-600',
    }[accentColor] || 'text-gray-600';

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            {label && (<label htmlFor={inputId} className={`text-sm font-medium text-gray-700 shrink-0 ${labelClassName}`}>{label}</label>)}
            <div className="relative flex-1">
                {currency && <IndianRupee className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />}
                {Icon && !currency && <Icon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />}
                <input id={inputId} type={type} placeholder={placeholder} value={value} onChange={onChange} className={`w-full ${currency || Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg ${focusRingColor} focus:border-transparent ${inputClassName}`} />
            </div>
            {showAddButton && onAdd && (<button onClick={onAdd} className={`${textColor} ${hoverTextColor} flex items-center text-sm`} aria-label={`Add ${label || 'item'}`}><PlusCircle className="w-5 h-5" /></button>)}
            {showRemoveButton && onRemove && (<button onClick={onRemove} className="text-red-500 hover:text-red-700" aria-label={`Remove ${label || 'item'}`}><MinusCircle className="w-5 h-5" /></button>)}
        </div>
    );
};

export default InputRow;