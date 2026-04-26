// components
import Box from "@/public/components/product-boxes/Box";
import HomeHeader from "@/public/components/home/HomeHeader";

// utils
import { fetcher, revalidateOneHour } from "@/public/utils/fetcher";

// types and queries
import { GET_HOME_PAGE_PACKAGES } from "@/public/graphql/packageQueries";
import { packageCoverType } from "@/public/types/package";


const PackageSection = async () => {
  const packageData: packageCoverType[] = await fetcher(GET_HOME_PAGE_PACKAGES, {}, revalidateOneHour)
    .then(data => data.packages.packages)
    .catch(err => console.error(err))

  return (
    <>
      {packageData && (
        <section
          className="my-16 container mx-auto px-2"
          aria-label="بخش پکیج‌های لوازم خوشنویسی نی‌نگار"
        >
          <HomeHeader
            title="پکیج‌های لوازم خوشنویسی"
            link="/category/پکیج"
            ariaLabel="پکیج‌های لوازم خوشنویسی"
          />
          <Box packages={packageData} discount />
        </section>
      )}
    </>
  );
};

export default PackageSection;
