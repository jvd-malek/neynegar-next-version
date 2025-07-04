"use client"

import { getCookie } from "cookies-next";
import { useState } from "react"

function DiscountInput({ DiscountCode, setDiscountCode, user }: { DiscountCode: number, setDiscountCode: any, user: any }) {
    const jwt = getCookie('jwt');
    const [Discount, setDiscount] = useState('')
    const [isValidDiscount, setIsValidDiscount] = useState<{ msg: string, state: boolean }>()

    const setDiscountHandler = (val: string) => {
        setDiscount(val)
        if (!DiscountCode) {
            setIsValidDiscount(undefined)
        }
    }

    const discountHandler = () => {
        if (jwt) {
            if (Discount && !DiscountCode) {
                let isValid = user?.discount.find((d:any) => (
                    d.code == Discount
                ))
                
                if (isValid && isValid.date > Date.now()) {
                    setDiscountCode(isValid.discount)
                    setIsValidDiscount({ state: true, msg: "تخفیف اعمال شد." })
                } else if (isValid && isValid.date < Date.now()) {
                    setIsValidDiscount({ state: false, msg: "تخفیف منقضی شده است." })
                } else {
                    setIsValidDiscount({ state: false, msg: "تخفیفی با این کد برای شما فعال نیست." })
                }
            }
        } else {
            setIsValidDiscount({ state: false, msg: "ابتدا وارد حساب کاربری خود شوید." })
        }
    }

    return (
        <div className="flex md:items-center md:gap-8 gap-4 md:flex-row flex-col my-6 md:my-0">

            <input type="text" className={`py-2 pl-4 pr-6 rounded-lg border-2 focus:shadow-md border-solid outline-none transition-all border-black bg-slate-50 placeholder:text-slate-500`} placeholder='کد تخفیف'
                value={Discount}
                onChange={e => setDiscountHandler(e.target.value)}
                readOnly={Boolean(DiscountCode)}
            />

            <button className={`transition-all duration-75 active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2 w-20 rounded-lg text-white border-b-4 border-solid active:translate-y-1`}
                onClick={() => discountHandler()}>اعمال</button>

            <p className={`${isValidDiscount?.state ? "text-lime-500" : "text-rose-500"} text-xs`}>{isValidDiscount && isValidDiscount.msg}</p>

        </div>
    );
}

export default DiscountInput;