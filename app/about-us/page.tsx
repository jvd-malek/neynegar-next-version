// next
import type { Metadata } from "next";

// components
import IntroductionSection from "@/public/components/about-us/IntroductionSection";
import Header from "@/public/components/header/Header";
import Footer from "@/public/components/footer/Footer";
import PaymentSection from '@/public/components/about-us/PaymentSection';
import AboutUsSection from '@/public/components/about-us/AboutUsSection';
import TransmissionSection from '@/public/components/about-us/TransmissionSection';
import ReturnedPurchaseSection from '@/public/components/about-us/ReturnedPurchaseSection';

export const metadata: Metadata = {
    title: "درباره نی‌نگار",
    description: "به دنیای هنر و قلم خوش آمدید! نی‌نگار، گنجینه‌ای از بهترین‌ها برای علاقه‌مندان به کتاب‌های نفیس و تخصصی در حوزه هنر، خوشنویسی و صنایع دستی، و همچنین مرکز عرضه لوازم باکیفیت هنری است. ما اینجا هستیم تا با ارائه محصولاتی منحصر به فرد و آموزشی، شما را در مسیر خلاقیت و شکوفایی هنری همراهی کنیم."
};

const AboutUs = () => {
    return (
        <>
            <Header />
            <main className="container mx-auto px-3">
                <AboutUsSection />
                <IntroductionSection />
                <PaymentSection />
                <TransmissionSection />
                <ReturnedPurchaseSection />
            </main>
            <Footer />
        </>
    );
}

export default AboutUs;