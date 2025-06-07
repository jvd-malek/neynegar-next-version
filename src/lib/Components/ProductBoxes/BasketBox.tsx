"use client"
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import IconButton from '@mui/material/IconButton';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { getCookie, setCookie } from 'cookies-next';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DiscountTimer from './DiscountTimer';
import BookmarkIcon from '@mui/icons-material/Bookmark';

type BasketBoxType = {
    _id: string
    cover: string
    title: string
    account?: boolean
    count: number
    showCount: number
    price: number
    discount: number
    discountRaw: { discount: number, date: number }[]
}

type bas = {
    productId: string,
    count: number
}

function BasketBox({ _id, account = false, showCount, cover, title, count, price, discount, discountRaw }: BasketBoxType) {
    const [Count, setCount] = useState(count)
    const jwt = getCookie('jwt');
    const [alert, setAlert] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentDiscount = discountRaw[discountRaw.length - 1];

    useEffect(() => {
        const timer = setTimeout(() => {
            setAlert(false);
        }, 4000);
        return () => clearTimeout(timer);
    }, [alert]);

    const params = new URLSearchParams(searchParams.toString());
    const currentPage = parseInt(params.get('page') || '1');

    const updatePage = () => {
        // Update page parameter
        if (currentPage > 1) {
            params.set('page', "1");
            router.push(`${pathname}?${params.toString()}`);
        } else {
            router.refresh();
        }
    }

    const addLocalBascket = async (bas: bas) => {
        let bascket = getCookie("basket");
        if (bascket) {
            let newBas;
            let validBascket: bas[] = JSON.parse(bascket as string);

            let filBas = validBascket.filter((b: bas) => (
                b.productId == bas.productId
            ));

            if (filBas.length > 0) {
                if (filBas[0].count < showCount) {
                    filBas[0].count = filBas[0].count + 1;
                    let notFilBas = validBascket.filter((b: bas) => (
                        b.productId != filBas[0].productId
                    ));
                    newBas = [...notFilBas, filBas[0]];
                    setCookie("basket", JSON.stringify(newBas));
                    setCount(Count + 1);
                    router.refresh();
                } else {
                    setAlert(true);
                }
            } else {
                newBas = [...validBascket, bas];
                setCookie("basket", JSON.stringify(newBas));
                setCount(Count + 1);
                router.refresh();
            }
        } else {
            setCookie("basket", JSON.stringify([bas]));
            setCount(Count + 1);
            router.refresh();
        }
    }

    const removeLocalBascket = async (bas: bas) => {
        let bascket = getCookie("basket");

        if (bascket) {
            let newBas;
            let validBascket: bas[] = JSON.parse(bascket as string);

            let filBas = validBascket.filter((b: bas) => (
                b.productId == bas.productId
            ));

            if (filBas.length > 0) {
                filBas[0].count = filBas[0].count - 1;
                let notFilBas = validBascket.filter((b: bas) => (
                    b.productId != filBas[0].productId
                ));
                if (filBas[0].count == 0) {
                    newBas = [...notFilBas];
                } else {
                    newBas = [...notFilBas, filBas[0]];
                }
                setCookie("basket", JSON.stringify(newBas));
                setCount(Count - 1);
                updatePage()
            }
        }
    }

    const pushHandler = async () => {
        if (showCount > Count) {
            if (jwt) {
                await fetch(`https://api.neynegar1.ir/users/add-bascket`, {
                    method: "PUT",
                    headers: {
                        'authorization': jwt as string,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        bas: [{
                            productId: _id,
                            count: 1
                        }]
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (!data.state) {
                            console.log(data.msg)
                        } else {
                            setCount(Count + 1);
                            router.refresh();
                        }
                    })
            }
            else {
                addLocalBascket({ productId: _id, count: 1 });
            }
        } else {
            setAlert(true);
        }
    }

    const pullHandler = async () => {
        if (jwt) {
            await fetch(`https://api.neynegar1.ir/users/pop-bascket`, {
                method: "PUT",
                headers: {
                    'authorization': jwt as string,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bas: [{
                        productId: _id,
                        count: 1
                    }]
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.state) {
                        console.log(data.msg)
                    } else {
                        setCount(Count - 1);
                        updatePage()
                    }
                })
        }
        else {
            removeLocalBascket({ productId: _id, count: 1 });
        }
    }

    const customLoader = ({ src }: { src: string }) => {
        return `https://api.neynegar1.ir/imgs/${src}`;
    };

    return (
        <>
            {Count > 0 &&
                <div
                    className={`flex transition-all duration-700 bg-white w-full sm:pl-4 p-2 flex-col sm:flex-row items-center gap-6 rounded-2xl relative overflow-hidden`}>

                    <Link href={`/product/${_id}`} className=' relative'>
                        {cover ?
                            <Image src={cover} alt={title} className={`rounded-2xl object-cover`} width={300} height={300} loader={customLoader} /> :
                            <Skeleton variant="rectangular" className=' rounded-lg' height={150} />
                        }
                        {discount > 0 && (
                            <div className="absolute -top-[6px] right-1 z-20 text-red-600">
                                <BookmarkIcon sx={{ fontSize: 40 }} />
                                <p className="absolute text-xs right-[10px] top-3 text-white">
                                    {`%${discount.toLocaleString('fa-IR')}`}
                                </p>
                            </div>
                        )}
                    </Link>


                    <div className="flex sm:gap-10 gap-2 py-2 md:flex-row flex-col sm:items-start md:items-center items-center justify-between text-sm md:text-base w-full">
                        <div className="flex gap-2 flex-col sm:items-start items-center justify-center sm:text-start text-center h-full">
                            <h3 className="w-52">{title}</h3>
                            <h4 className="flex gap-2 items-center">
                                قیمت واحد:
                                {discount > 0 ? (
                                    <>
                                        <span className="line-through text-gray-500">
                                            {price.toLocaleString('fa-IR')}
                                        </span>
                                        <span className="text-red-600">
                                            {(price * ((100 - discount) / 100)).toLocaleString('fa-IR')}
                                        </span>
                                    </>
                                ) : (
                                    <span>{price.toLocaleString('fa-IR')}</span>
                                )}
                            </h4>
                            <h4 className="flex gap-2 items-center">
                                قیمت کل:
                                {discount > 0 ? (
                                    <>
                                        <span className="line-through text-gray-500">
                                            {(price * Count).toLocaleString('fa-IR')}
                                        </span>
                                        <span className="text-red-600">
                                            {((price * ((100 - discount) / 100)) * Count).toLocaleString('fa-IR')}
                                        </span>
                                    </>
                                ) : (
                                    <span>{(price * Count).toLocaleString('fa-IR')}</span>
                                )}
                            </h4>
                            <div className={`items-center gap-3 ${account ? 'flex' : 'hidden'}`}>
                                <p className="">
                                    تعداد:
                                </p>
                                <div className="px-2 py-[1px] text-center rounded-md bg-slate-100 border-2 text-blue-500 shadow border-solid text-lg">
                                    {Count.toLocaleString('fa-IR')}
                                </div>
                            </div>
                        </div>
                        <div className="flex transition-all duration-700 justify-center items-center flex-col">
                            {!account &&
                                <div className={`w-fit h-fit rounded-full bg-slate-100 border-2 text-blue-500 shadow border-solid flex items-center gap-2 text-lg sm:mb-0 mb-2 ${discount > 0 && "mt-4"}`}>
                                    <IconButton onClick={() => pushHandler()} color="primary">
                                        <AddCircleRoundedIcon />
                                    </IconButton>
                                    {Count.toLocaleString('fa-IR')}
                                    <IconButton onClick={() => pullHandler()} sx={{ color: 'red' }}>
                                        <CancelRoundedIcon />
                                    </IconButton>
                                </div>
                            }
                            {discount > 0 && (
                                <DiscountTimer endDate={currentDiscount.date} page />
                            )}
                            <p className={`text-xs text-red-700 mt-1 ${alert ? "block sm:whitespace-pre-line" : "hidden"}`}>
                                {`موجودی محصول
                             محدود است.`}
                            </p>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default BasketBox;