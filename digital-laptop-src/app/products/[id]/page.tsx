import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/products/ProductGallery";
import ProductSpecs from "@/components/products/ProductSpecs";
import RelatedProducts from "@/components/products/RelatedProducts";
import ProductDetailClient from "./ProductDetailClient";
import { Product } from "@/types";

interface Props {
  params: { id: string };
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    return await prisma.product.findUnique({ where: { id } }) as unknown as Product | null;
  } catch {
    return null;
  }
}

async function getRelated(brand: string, id: string): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: { brand, id: { not: id }, stock: { gt: 0 } },
      take: 4,
      orderBy: { createdAt: "desc" },
    }) as unknown as Product[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | DIGITAL LAPTOP Peshawar`,
    description: `Buy ${product.name} — ${product.brand}, ${product.ram}, ${product.storage}. ${product.condition} condition. Available at DIGITAL LAPTOP, Peshawar.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const related = await getRelated(product.brand, product.id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Gallery */}
            <div>
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Details */}
            <div>
              <ProductDetailClient product={product} />
            </div>
          </div>

          {/* Specs */}
          <div className="mt-12">
            <ProductSpecs product={product} />
          </div>

          {/* Related */}
          <RelatedProducts products={related} />
        </div>
      </main>
      <Footer />
    </>
  );
}
