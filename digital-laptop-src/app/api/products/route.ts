import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brands = searchParams.getAll("brand");
    const conditions = searchParams.getAll("condition");
    const rams = searchParams.getAll("ram");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const where: any = {};

    if (brands.length > 0) where.brand = { in: brands };
    if (conditions.length > 0) where.condition = { in: conditions };
    if (rams.length > 0) where.ram = { in: rams };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { processor: { contains: search, mode: "insensitive" } },
      ];
    }
    if (featured === "true") where.featured = true;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        brand: body.brand,
        model: body.model,
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        condition: body.condition || "NEW",
        stock: parseInt(body.stock) || 1,
        processor: body.processor || null,
        ram: body.ram || null,
        storage: body.storage || null,
        gpu: body.gpu || null,
        display: body.display || null,
        battery: body.battery || null,
        description: body.description || null,
        warranty: body.warranty || null,
        images: body.images || [],
        featured: body.featured || false,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
