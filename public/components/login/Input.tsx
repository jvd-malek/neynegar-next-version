"use client"

// react
import { useEffect, memo } from "react"

// utils and types
import { notify } from "@/public/utils/notify"
import { formType } from "@/public/types/input"
import { Feature } from "@/public/types/product"

type InputProps = {
    label: string
    id: string
    form: formType
    setForm: React.Dispatch<React.SetStateAction<formType[]>>
    setFeatures?: React.Dispatch<React.SetStateAction<Feature[]>>
    disabled?: boolean
    required?: boolean
    autoFocus?: boolean
    box?: boolean
    type?: "input" | "select" | "textarea" | "radio" | "instagram-link" | "internal-link" | "features"
    placeholder?: string
    options?: { value: string; label: string; }[];
    descForm?: formType
    titleForm?: formType
}

const Input = memo(({ id, form, disabled, required, label, placeholder, setForm, setFeatures, type = "input", options, autoFocus, descForm, titleForm, box }: InputProps) => {

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
        <div className={`flex ${type == "radio" ? "flex-row justify-between" : "flex-col"} gap-2 ${box ? "w-30 sm:w-46" : "w-full"} `}>
            <label htmlFor={id} className={`text-xs sm:text-sm text-white text-shadow`}>
                {label}
                {required &&
                    <span className="text-red-400">*</span>
                }
            </label>

            {(type === "input" || type === "instagram-link" || type === "internal-link") &&
                <div className="relative">
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
                    {(type === "instagram-link" || type === "internal-link") &&
                        <button
                            type="button"
                            onClick={() => handleChangeLink(setForm, descForm, `${titleForm?.value ?? ""}`, form, type === "instagram-link")}
                            className={`${(disabled || !form.value || !titleForm?.value) ? "cursor-not-allowed" : "cursor-pointer"} text-xs px-3 sm:py-2 py-1.5 rounded-md bg-slate-600/80 text-neutral-200 hover:bg-slate-600 transition absolute sm:top-5 top-4 -translate-y-1/2 left-[1%]`}
                            disabled={disabled || !form.value}
                            aria-label="ثبت لینک"
                        >
                            ثبت
                        </button>
                    }
                </div>
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

            {type === "features" &&
                <div className="relative">
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

                    <button
                        type="button"
                        onClick={() => handleChangeFeature(setForm, setFeatures, titleForm, form)}
                        className={`${(disabled || !form.value || !titleForm?.value) ? "cursor-not-allowed" : "cursor-pointer"} text-xs px-3 sm:py-2 py-1.5 rounded-md bg-slate-600/80 text-neutral-200 hover:bg-slate-600 transition absolute sm:top-5 top-4 -translate-y-1/2 left-[1%]`}
                        disabled={disabled || !form.value}
                        aria-label="ثبت لینک"
                    >
                        ثبت
                    </button>

                </div>
            }

        </div>
    );
});

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

const placeholderForRequired = (label: string) => (`${label} الزامی است.`)

const handleChangeLink = (setForm: React.Dispatch<React.SetStateAction<formType[]>>, descForm: formType | undefined, title: string | undefined, form: formType, isInstagram: boolean) => {
    const Link = `[${title}](${form.value})`
    const value = isInstagram ?
        descForm?.value + '\n' + "مشاهده تصاویر این محصول در اینستاگرام" + '\n' + Link :
        descForm?.value + '\n' + Link

    // update Description field
    handleChangeForm(setForm, value, descForm?.name || "")

    // update Link field
    handleChangeForm(setForm, "", form.name)
}

const handleChangeFeature = (setForm: React.Dispatch<React.SetStateAction<formType[]>>, setFeatures: React.Dispatch<React.SetStateAction<Feature[]>> | undefined, title: formType | undefined, form: formType) => {
    const value = { key: `${title?.value}`.trim(), value: `${form.value}`.trim() }

    setFeatures && setFeatures(pervF => [...pervF, value])

    // update Features field
    handleChangeForm(setForm, "", form.name)
    title && handleChangeForm(setForm, "", title.name);
}

export {
    Input,
    handleChangeForm,
    handleClearInput,
    handleFormValidator,
    placeholderForRequired,
    handleClearForm
}