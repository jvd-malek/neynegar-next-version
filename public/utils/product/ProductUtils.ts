
type calculateFinalPriceProps = {
    isPackage?: boolean;
    price: { price: number, date: string }[];
    discount: { discount: number, date: number }[];
    finalPrice?: number;
}

export const calculateFinalPrice = ({ isPackage, finalPrice, price, discount }: calculateFinalPriceProps) => {
    if (isPackage && typeof finalPrice === "number") {
        return finalPrice;
    }

    if (!price?.length) return 0;

    const lastPrice = price.at(-1)?.price || 0;
    const lastDiscount = discount?.at(-1);

    const DiscountIsValid =
        lastDiscount &&
        lastDiscount.discount > 0 &&
        new Date(lastDiscount.date) > new Date();

    return DiscountIsValid
        ? Math.round(lastPrice * (100 - lastDiscount.discount) / 100)
        : lastPrice;
};