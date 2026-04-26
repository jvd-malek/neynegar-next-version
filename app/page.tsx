// next
import dynamic from 'next/dynamic';

// components
import Footer from "@/public/components/footer/Footer";
import Header from "@/public/components/header/Header";
import { ArticlesSectionSkeleton, BooksSectionSkeleton, CoursesSectionSkeleton } from '@/public/components/home/HomeSkeleton';

// Lazy load heavy components with better loading states
const CoursesSection = dynamic(() => import('@/public/components/home/CoursesSection'), {
  loading: CoursesSectionSkeleton
});

const ArticlesSection = dynamic(() => import('@/public/components/home/ArticlesSection'), {
  loading: ArticlesSectionSkeleton
});

const BooksSection = dynamic(() => import('@/public/components/home/BooksSection'), {
  loading: BooksSectionSkeleton
});

const PackagesSection = dynamic(() => import('@/public/components/home/PackageSection'), {
  loading: BooksSectionSkeleton
});

const HeroSection = dynamic(() => import('@/public/components/home/HeroSection'), {
  loading: BooksSectionSkeleton
});


export default async function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PackagesSection />
        <BooksSection />
        <ArticlesSection />
        <CoursesSection />
      </main>
      <Footer />
    </>
  );
}
