// components
import Box from "@/public/components/product-boxes/Box";
import HomeHeader from "@/public/components/home/HomeHeader";

// icons
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';

// utils
import { fetcher, revalidateOneHour } from "@/public/utils/fetcher";

// types and queries
import { GET_SUGGESTED_PRODUCTS } from "@/public/graphql/productQueries";
import { productCoverType } from "@/public/types/product";
import { GET_HOME_PAGE_PACKAGES } from "@/public/graphql/packageQueries";
import { packageCoverType } from "@/public/types/package";

type SuggestedProductsProps = {
    id: string,
    majorCat: string,
    minorCat?: string,
    cat?: string
    isPackage?: boolean
}

const SuggestedProducts = async ({ id, majorCat, minorCat, cat, isPackage }: SuggestedProductsProps) => {

    const query = isPackage ? GET_HOME_PAGE_PACKAGES : GET_SUGGESTED_PRODUCTS
    const variable = isPackage ?
        {
            page: 1,
            limit: 10
        } :
        {
            majorCat,
            minorCat,
            cat
        }

    const suggestedProductsData = await fetcher(query, variable, revalidateOneHour)

    const fillteredSuggestedProducts: productCoverType[] =
        isPackage ?
            []
            :
            suggestedProductsData?.suggestedProducts?.filter((s: productCoverType) => (
                s._id !== id
            ))

    const fillteredSuggestedPackages: packageCoverType[] =
        isPackage ?
            suggestedProductsData?.packages?.packages?.filter((s: packageCoverType) => (
                s._id !== id
            ))
            :
            []


    return (
        <section>

            <div className="bg-white rounded-lg px-2 py-4 w-full mt-8">
                <HomeHeader
                    title="محصولات مرتبط"
                    showAll={false}
                />
            </div>

            {(fillteredSuggestedProducts.length > 0 || fillteredSuggestedPackages.length > 0) ? (
                <div className="w-full mt-4">
                    {isPackage ?
                        <Box packages={fillteredSuggestedPackages} />
                        :
                        <Box products={fillteredSuggestedProducts} />
                    }
                </div>
            ) : (
                <p className="text-center flex items-center gap-2 mt-4 mb-4 justify-center w-full h-full">
                    محصول مرتبطی یافت نشد.
                    <SentimentDissatisfiedTwoToneIcon />
                </p>
            )}
        </section>
    )
}

export default SuggestedProducts;