"use client"
import Link from "next/link";
import { useState } from "react";

function LinkBar() {

    const [activeLink, setActiveLink] = useState("خانه");

    const links = [
        { id: 1, txt: 'خانه' },
        { id: 2, txt: 'سفارشات' },
        { id: 3, txt: 'جزییات حساب' },
        { id: 4, txt: 'نظرات' },
        { id: 5, txt: 'پرسش و پاسخ' },
    ];

    return (
        <>
            {
                links.map(link => (
                    <button key={link.id} onClick={() => setActiveLink(link.txt)} className={`mt-5 shadow-cs py-2 px-4 cursor-pointer transition-all rounded-xl relative ${(activeLink === link.txt) ? "bg-black text-white" : "bg-white text-black"}`}>
                        {link.txt}
                    </button>
                ))
            }
        </>
    );
}

export default LinkBar;