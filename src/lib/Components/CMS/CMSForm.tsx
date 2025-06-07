"use client"
import { useEffect, useState } from "react"
import { productAndArticleInputType, productInputHandlerType, productSingleType } from "@/lib/Types/product"
import { animateScroll } from "react-scroll"
import { getCookie } from "cookies-next";


function CMSForm({ article = false, put = false, id }: { article?: boolean, put?: boolean, id?: string }) {
    const jwt = getCookie("jwt") as string;

    const [Author, setAuthor] = useState<{ firstname: string, lastname: string, _id: string }[]>([])
    const [img, setImg] = useState<any>()
    const [links, setLinks] = useState<any[]>([])
    const clear = {
        title: "",
        desc: "",
        count: "",
        size: "",
        author: "",
        brand: "",
        weight: "",
        publisher: "",
        price: "",
        cost: "",
        publishDate: "",
        status: "",
        discount: "",
        majorCat: "",
        minorCat: "",
        discountDate: "",
        showCount: "",
        id: ""
    }
    const [state, setState] = useState<productAndArticleInputType>(clear)

    const inputHndler = ({
        title,
        desc,
        count,
        size,
        author,
        brand,
        weight,
        publisher,
        price,
        cost,
        publishDate,
        status,
        discount,
        majorCat,
        minorCat,
        discountDate,
        showCount,
        id
    }: productInputHandlerType) => {
        let productInput = {
            title: title ? title : state.title,
            desc: desc ? desc : state.desc,
            count: count ? count : state.count,
            size: size ? size : state.size,
            author: author ? author : state.author,
            brand: brand ? brand : state.brand,
            weight: weight ? weight : state.weight,
            publisher: publisher ? publisher : state.publisher,
            price: price ? price : state.price,
            cost: cost ? cost : state.cost,
            publishDate: publishDate ? publishDate : state.publishDate,
            status: status ? status : state.status,
            discount: discount ? discount : state.discount,
            majorCat: majorCat ? majorCat : state.majorCat,
            minorCat: minorCat ? minorCat : state.minorCat,
            discountDate: discountDate ? discountDate : state.discountDate,
            showCount: showCount ? showCount : state.showCount,
            id: id ? id : state.id
        }
        setState(productInput)
    }

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!article) {
            let product = new FormData()
            if (img) {
                product.append("img", img[0])
                img[1] && product.append("img", img[1])
                img[2] && product.append("img", img[2])
                img[3] && product.append("img", img[3])
            }

            state?.title && product.append("title", state.title)
            state?.desc && product.append("desc", state.desc)
            state?.price && product.append("price", state.price)
            state?.cost && product.append("cost", state.cost)
            state?.count && product.append("count", state.count)
            state?.showCount && product.append("showCount", state.showCount)
            state?.discount && state.discountDate && product.append("discount", `${state.discount},${state.discountDate}`)
            state?.majorCat && product.append("majorCat", state.majorCat)
            state?.minorCat && product.append("minorCat", state.minorCat)
            state?.brand && product.append("brand", state?.brand)
            if (jwt && state?.author && state.author.includes("/")) {
                let name = state?.author.split("/")
                await fetch(`https://api.neynegar1.ir/authors/post`, {
                    headers: {
                        'authorization': jwt,
                        "content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        firstname: name[0],
                        lastname: name[1]
                    })
                })
                    .then(res => res.json())
                    .then(data => { console.log(data); product.append("authorId", data.author._id) })
            } else if (state?.author) {
                product.append("authorId", state.author)
            }
            state?.publisher && product.append("publisher", state.publisher)
            state?.publishDate && product.append("publishDate", state.publishDate)
            state?.size && product.append("size", state.size)
            state?.weight && product.append("weight", state.weight)
            state?.status && product.append("status", state.status)

            if (jwt) {
                if (state?.id.length > 0) {
                    await fetch(`https://api.neynegar1.ir/products/update/${state.id}`, {
                        headers: {
                            'authorization': jwt,
                        },
                        method: "PUT",
                        body: product
                    })
                        .then(res => res.json())
                        .then(data => console.log(data))
                } else {
                    await fetch(`https://api.neynegar1.ir/products`, {
                        headers: {
                            'authorization': jwt,
                        },
                        method: "POST",
                        body: product
                    })
                        .then(res => res.json())
                        .then(data => console.log(data))
                }
            }
        } else {
            // let article = {
            //     title: state?.title,
            //     desc: state?.desc,
            //     articleBody: state?.articleBody,
            //     author: state?.author,
            //     majorCat: state?.majorCat,
            //     img: state?.img,
            // }
            // setArticle(article)
        }
        setState(clear)
        setImg(undefined)
        animateScroll.scrollToTop({
            duration: 300,
            smooth: 'easeInOutQuart'
        })
    }

    const imgHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImg(e.target.files)
        }
    }

    return (
        <>
            <form action="" className="md:grid grid-cols-2 flex flex-col justify-center items-center gap-y-4 gap-x-4 my-20 w-[90%] mx-auto" onSubmit={submitHandler}>

                <div className="flex items-center justify-between sm:w-80 w-72">
                    {/* <TxtBox errTxt={errTxt}
                        setErrTxt={setErrTxt} type={"string"} id="txt1" val={FirstName} setVal={setFirstName} txt="نام" /> */}
                    <label htmlFor="name" className="">
                        {article ? 'نام مقاله' : "نام محصول"}
                    </label>
                    <input value={state.title} onChange={e => inputHndler({ title: e.target.value })} type="text" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="name" required autoComplete="true" />
                </div>

                <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                    <label htmlFor="desc" className="">
                        {article ? 'مقدمه' : "توضیحات"}
                    </label>
                    <textarea value={state.desc} onChange={e => inputHndler({ desc: e.target.value })} className=" rounded text-black bg-white py-2 px-4 w-2/3" id="desc" required />
                </div>

                {!article ?
                    <>
                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="cost" className="">قیمت خرید</label>
                            <input value={state.cost} onChange={e => inputHndler({ cost: e.target.value })} type="number" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="cost" required />
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="price" className="">قیمت فروش</label>
                            <input value={state.price} onChange={e => inputHndler({ price: e.target.value })} type="number" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="price" required />
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="discount" className="">تخفیف</label>
                            <input value={state.discount} onChange={e => inputHndler({ discount: e.target.value })} type="number" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="discount" />
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="discountDate" className="">مدت تخفیف</label>
                            <input value={state.discountDate} onChange={e => inputHndler({ discountDate: e.target.value })} type="number" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="discountDate" />
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="count" className="">تعداد</label>
                            <input value={state.count} onChange={e => inputHndler({ count: e.target.value })} type="number" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="count" required />
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="showCount" className="">تعداد نمایشی</label>
                            <input value={state.showCount} onChange={e => inputHndler({ showCount: e.target.value })} type="number" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="showCount" />
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="majorCat" className="">دسته‌بندی کلی</label>
                            <select value={state.majorCat} onChange={e => { inputHndler({ majorCat: e.target.value }); inputHndler({ minorCat: "" }) }} name="دسته‌بندی" id="majorCat" className="text-black bg-white w-2/3 py-2 px-4 rounded" required>
                                <option value="">__ انتخاب کنید __</option>
                                {links.map((c: any, i: any) => (
                                    <option value={c.txt} key={i}>{c.txt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="category" className="">دسته‌بندی</label>
                            <select value={state.minorCat} onChange={e => inputHndler({ minorCat: e.target.value })} name="دسته‌بندی" id="category" className="text-black bg-white w-2/3 py-2 px-4 rounded" required>
                                {state.majorCat ?
                                    <option value="">__ انتخاب کنید __</option> :
                                    <option value="">دسته‌بندی کلی را انتخاب کنید</option>}
                                {state.majorCat &&
                                    links.filter((c: any) => (
                                        c.txt === state.majorCat
                                    ))[0].subLinks
                                        .map((c: any, i: any) => (
                                            <option value={c.link} key={i + 20}>{c.link}</option>
                                        ))
                                }
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="brand" className="">مدل</label>
                            <select value={state.brand} onChange={e => inputHndler({ brand: e.target.value })} name="مدل" id="brand" className="text-black bg-white w-2/3 py-2 px-4 rounded" required >
                                {state.minorCat ?
                                    <option value="">__ انتخاب کنید __</option> :
                                    <option value="">دسته‌بندی را انتخاب کنید</option>}
                                {state.minorCat &&
                                    links.filter((c: any) => (
                                        c.txt === state.majorCat
                                    ))[0].subLinks.filter((c: any) => (
                                        c.link === state.minorCat
                                    ))[0].brand
                                        .map((c: any, i: any) => (
                                            <option value={c} key={i + 40}>{c}</option>
                                        ))
                                }
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="size" className="">سایز</label>
                            {state.minorCat === "کتاب" ?
                                <select value={state.size} onChange={e => inputHndler({ size: e.target.value })} name="سایز" id="size" className="text-black bg-white w-2/3 py-2 px-4 rounded">
                                    <option value="">__ انتخاب کنید __</option>
                                    <option value="رحلی">رحلی‌بزرگ</option>
                                    <option value="رحلی">رحلی</option>
                                    <option value="نیم‌رحلی">نیم‌رحلی</option>
                                    <option value="وزیری">وزیری</option>
                                    <option value="وزیری">پالتویی</option>
                                    <option value="وزیری">جیبی</option>
                                </select> :
                                <input value={state.size} onChange={e => inputHndler({ size: e.target.value })} type="text" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="size" />
                            }
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="status" className="">وضعیت</label>
                            <select value={state.status} onChange={e => inputHndler({ status: e.target.value })} name="وضعیت" id="status" className="text-black bg-white w-2/3 py-2 px-4 rounded">
                                <option value="">__ انتخاب کنید __</option>
                                <option value="نو">نو</option>
                                <option value="درحد‌نو">درحد‌نو</option>
                                <option value="دسته‌دوم">دسته‌دوم</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="author" className="">نویسنده</label>
                            <div className="flex w-2/3">
                                <input value={state.author} onChange={e => inputHndler({ author: e.target.value })} type="text" className=" rounded-r text-black bg-white py-2 px-4 w-full" id="author" />
                                <select value={state.author} onChange={e => inputHndler({ author: e.target.value })} name="وضعیت" className="text-black bg-white w-0 py-2 px-4 rounded-l">
                                    <option value="">__ انتخاب کنید __</option>
                                    {state.author &&
                                        Author.filter((i) => (
                                            i.lastname.includes(state.author.trim()) ||
                                            i.firstname.includes(state.author.trim())
                                        ))
                                            .map((c) => (
                                                <option value={c._id} key={c._id}>{`${c.firstname} ${c.lastname}`}</option>
                                            ))
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="publisher" className="">انتشارات</label>
                            <input value={state.publisher} onChange={e => inputHndler({ publisher: e.target.value })} type="text" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="publisher" />
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="publishDate" className="">نوبت چاپ</label>
                            <input value={state.publishDate} onChange={e => inputHndler({ publishDate: e.target.value })} type="text" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="publishDate" />
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="weight" className="">وزن محصول</label>
                            <input value={state.weight} onChange={e => inputHndler({ weight: e.target.value })} type="number" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="weight" />
                        </div>
                    </>
                    :
                    <>
                        <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="author" className="">نویسنده</label>
                            <input value={state.author} onChange={e => inputHndler({ author: e.target.value })} type="text" className=" rounded text-black bg-white py-2 px-4 w-2/3" id="author" />
                        </div>

                        {/* <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                            <label htmlFor="articleBody" className="">
                                متن مقاله
                            </label>
                            <textarea value={state.articleBody} onChange={e => dispatch(change({ input: 'articleBody', value: e.target.value }))} className=" rounded text-black bg-white py-2 px-4 w-2/3" id="articleBody" />
                        </div> */}
                    </>
                }

                <div className="flex items-center justify-between gap-4 sm:w-80 w-72">
                    <label htmlFor="img" className="">تصاویر</label>
                    <input onChange={e => imgHandler(e)} type="file" multiple className=" rounded text-black bg-white py-2 px-4 w-2/3" id="img" />
                </div>

                <button className={`transition-all duration-75 active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2.5 w-full rounded-lg text-white border-b-4 border-solid active:translate-y-1 col-start-1 col-end-3`}
                    type='submit'
                >
                    {article ? 'ثبت مقاله' : "ثبت محصول"}
                </button>
            </form>
        </>
    );
}

export default CMSForm;