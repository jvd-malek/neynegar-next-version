"use client"

// react
import { useEffect } from "react"

// utils and types
import { notify } from "@/public/utils/notify"
import { formType } from "@/public/types/input"

type InputProps = {
    label: string
    id: string
    form: formType
    setForm: React.Dispatch<React.SetStateAction<formType[]>>
    disabled?: boolean
    required?: boolean
    autoFocus?: boolean
    type?: "input" | "select" | "textarea" | "radio"
    placeholder?: string
    options?: { value: string; label: string; }[];
}

const Input = ({ id, form, disabled, required, label, placeholder, setForm, type = "input", options, autoFocus }: InputProps) => {

    // validate input value with form.validateRule function and onBlur event
    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, Element>) => {
        form.validateRule &&
            !form.validateRule(event.target.value) && setForm(prev => prev.map(pervForm =>
                pervForm.name === form.name ? { ...form, error: true } : pervForm
            ));
    }

    // notif error when validate failed
    useEffect(() => {
        if (form?.error) {
            notify(form.errorMessage, "error")
        }
    }, [form?.error])

    return (
        <div className={`flex ${type == "radio" ? "flex-row justify-between" : "flex-col"} gap-2 w-full`}>
            <label htmlFor={id} className={`text-xs sm:text-sm text-white text-shadow`}>
                {label}
                {required &&
                    <span className="text-red-400">*</span>
                }
            </label>

            {type === "input" &&
                <input
                    id={id}
                    name={id}
                    type={form.type}
                    value={form.value}
                    placeholder={placeholder}
                    onChange={(e) => handleChangeForm(setForm, e.target.value, form.name)}
                    onBlur={(e) => handleBlur(e)}
                    className={`rounded-lg p-1.5 placeholder:text-mist-600 sm:p-2 border text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${form.error ? 'border-red-500 bg-rose-100' : 'border-gray-300 bg-slate-50'} ${disabled && 'opacity-50 cursor-not-allowed'}`}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    required={required}
                />
            }

            {type === "select" &&
                <select
                    id={id}
                    name={id}
                    value={form.value}
                    onChange={(e) => handleChangeForm(setForm, e.target.value, form.name)}
                    onBlur={(e) => handleBlur(e)}
                    className={`rounded-lg p-1.5 placeholder:text-mist-600 sm:p-2 border text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${form.error ? 'border-red-500 bg-rose-100' : 'border-gray-300 bg-slate-50'} ${disabled && 'opacity-50 cursor-not-allowed'}`}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    required={required}

                >
                    {options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            }

            {type === "radio" &&
                <input
                    id={id}
                    type="radio"
                    name="delivery"
                    className="cursor-pointer"
                    onChange={() => handleChangeForm(setForm, id, form.name)}
                />
            }

            {type === "textarea" &&
                <textarea
                    name={id}
                    id={id}
                    value={form.value}
                    placeholder={placeholder}
                    onChange={(e) => handleChangeForm(setForm, e.target.value, form.name)}
                    onBlur={(e) => handleBlur(e)}
                    className={`rounded-lg p-1.5 placeholder:text-mist-600 sm:p-2 border text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${form.error ? 'border-red-500 bg-rose-100' : 'border-gray-300 bg-slate-50'} ${disabled && 'opacity-50 cursor-not-allowed'}`}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    required={required}
                >
                </textarea>
            }

        </div>
    );
}

const handleChangeForm = (setForm: React.Dispatch<React.SetStateAction<formType[]>>, value: string, name: string) => {
    setForm(prev => prev.map(pervForm =>
        pervForm.name === name ? { ...pervForm, error: false, value } : pervForm
    ));
};

const handleFormValidator = (formData: formType[]) => {
    const errors = formData.filter(form => form.error)
    if (errors.length > 0) {
        errors.forEach(error => notify(error.errorMessage, "error"))
        return false
    }
    return true
}

const handleClearForm = (setForm: React.Dispatch<React.SetStateAction<formType[]>>) => {
    setForm(prev => prev.map(form => { return { ...form, error: false, value: "" } }));
};

const handleClearInput = (setForm: React.Dispatch<React.SetStateAction<formType[]>>, name: string) => {
    setForm(prev => prev.map(pervForm =>
        pervForm.name === name ? { ...pervForm, error: false, value: "" } : pervForm
    ));
};

export {
    Input,
    handleChangeForm,
    handleClearInput,
    handleFormValidator,
    handleClearForm
}