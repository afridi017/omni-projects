import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Categories from "@/components/home/Categories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import LocationSection from "@/components/home/LocationSection";

export const metadata: Metadata = {
  title: "DIGITAL LAPTOP Peshawar | Premium Laptops — New & Refurbished",
  description:
    "DIGITAL LAPTOP Peshawar — Buy premium new & refurbished laptops. Expert Software Installation & Hardware Service. Shop No 12A, Alharmian Market, Peshawar. Call 0310-9516681.",
};

function LoadingSkeleton() {
  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-900/60 border border-white/8 overflow-hidden">
            <div className="aspect-[4/3] shimmer bg-slate-800" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-800 rounded shimmer w-1/3" />
              <div className="h-5 bg-slate-800 rounded shimmer w-3/4" />
              <div className="h-4 bg-slate-800 rounded shimmer w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Suspense fallback={<LoadingSkeleton />}>
          <FeaturedProducts />
        </Suspense>
        <WhyChooseUs />
        <LocationSection />
      </main>
      <Footer />
    </>
  );
}
