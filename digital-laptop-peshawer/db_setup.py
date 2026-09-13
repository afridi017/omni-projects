"""Connect to Neon PostgreSQL and create all app tables + seed products."""
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = "postgresql://neondb_owner:npg_ptDR6bWjFYL4@ep-proud-hat-a5m3ej53-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

CREATE_STATEMENTS = [
    # condition enum
    """
    DO $$ BEGIN
        CREATE TYPE "condition" AS ENUM ('NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    """,
    # order_status enum
    """
    DO $$ BEGIN
        CREATE TYPE "order_status" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    """,
    # settings
    """
    CREATE TABLE IF NOT EXISTS "settings" (
        "key" text PRIMARY KEY,
        "value" text NOT NULL,
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    )
    """,
    # products
    """
    CREATE TABLE IF NOT EXISTS "products" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "brand" text NOT NULL,
        "model" text NOT NULL,
        "price" integer NOT NULL,
        "original_price" integer,
        "condition" "condition" NOT NULL DEFAULT 'NEW',
        "stock" integer NOT NULL DEFAULT 0,
        "processor" text NOT NULL,
        "ram" text NOT NULL,
        "storage" text NOT NULL,
        "gpu" text NOT NULL,
        "display" text NOT NULL,
        "battery" text,
        "description" text NOT NULL,
        "warranty" text NOT NULL DEFAULT '1 Month Service Warranty',
        "images" text[] NOT NULL DEFAULT '{}',
        "featured" boolean NOT NULL DEFAULT false,
        "created_at" timestamp with time zone NOT NULL DEFAULT now()
    )
    """,
    # customers
    """
    CREATE TABLE IF NOT EXISTS "customers" (
        "id" serial PRIMARY KEY,
        "full_name" text NOT NULL,
        "phone" text NOT NULL,
        "city" text NOT NULL,
        "address" text NOT NULL,
        "created_at" timestamp with time zone NOT NULL DEFAULT now()
    )
    """,
    # orders
    """
    CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY,
        "customer_id" integer NOT NULL REFERENCES "customers"("id"),
        "total" integer NOT NULL,
        "status" "order_status" NOT NULL DEFAULT 'PENDING',
        "payment_method" text NOT NULL DEFAULT 'COD',
        "created_at" timestamp with time zone NOT NULL DEFAULT now()
    )
    """,
    # order_items
    """
    CREATE TABLE IF NOT EXISTS "order_items" (
        "id" serial PRIMARY KEY,
        "order_id" integer NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "product_id" integer REFERENCES "products"("id") ON DELETE SET NULL,
        "name" text NOT NULL,
        "price" integer NOT NULL,
        "quantity" integer NOT NULL
    )
    """,
]

SEED_PRODUCTS = [
    {
        "name": 'Apple MacBook Air M2 13.6"',
        "brand": "Apple",
        "model": "MacBook Air M2 (2022)",
        "price": 224999,
        "original_price": 249999,
        "condition": "NEW",
        "stock": 4,
        "processor": "Apple M2 chip, 8-core CPU",
        "ram": "8GB Unified Memory",
        "storage": "256GB SSD",
        "gpu": "Apple 8-core GPU",
        "display": '13.6" Liquid Retina, 500 nits',
        "battery": "Up to 18 hours, 52.6Wh",
        "description": "Box-packed MacBook Air M2 in Midnight finish. Featherlight, silent and insanely fast for office work, freelancing, coding and everyday use. Full box, charger and cable included. Activated and checked by the DLS lab before dispatch.",
        "warranty": "1 Year Apple Pakistan Warranty",
        "images": ["/images/laptop-silver.jpg"],
        "featured": True,
    },
    {
        "name": 'Apple MacBook Pro 14" M3 Pro',
        "brand": "Apple",
        "model": "MacBook Pro 14 (M3 Pro)",
        "price": 489999,
        "original_price": 529999,
        "condition": "NEW",
        "stock": 2,
        "processor": "Apple M3 Pro, 11-core CPU",
        "ram": "18GB Unified Memory",
        "storage": "512GB SSD",
        "gpu": "Apple 14-core GPU",
        "display": '14.2" Liquid Retina XDR, 120Hz ProMotion',
        "battery": "Up to 18 hours, 70Wh",
        "description": "The professional's choice — M3 Pro power for video editing, 3D work and heavy development workloads. Space Black, sealed box. Best price in Peshawar, guaranteed by DIGITAL LAPTOP.",
        "warranty": "1 Year Apple Pakistan Warranty",
        "images": ["/images/laptop-white.jpg", "/images/laptop-silver.jpg"],
        "featured": True,
    },
    {
        "name": "Dell XPS 15 9530 OLED Touch",
        "brand": "Dell",
        "model": "XPS 15 9530",
        "price": 349999,
        "original_price": 389999,
        "condition": "LIKE_NEW",
        "stock": 2,
        "processor": "Intel Core i7-13700H (13th Gen)",
        "ram": "16GB DDR5 4800MHz",
        "storage": "1TB NVMe SSD",
        "gpu": "NVIDIA RTX 4050 6GB",
        "display": '15.6" 3.5K OLED Touch, 100% DCI-P3',
        "battery": "6–7 hrs real-world, 86Wh",
        "description": "Flagship creator machine in 9.5/10 condition — barely used US import. OLED panel is perfect for design and color-critical work. With original Dell 130W charger. Battery health 96%.",
        "warranty": "3 Months DLS Service Warranty",
        "images": ["/images/laptop-creator.jpg"],
        "featured": True,
    },
    {
        "name": "HP Spectre x360 14 (2024)",
        "brand": "HP",
        "model": "Spectre x360 14-eu",
        "price": 265000,
        "condition": "EXCELLENT",
        "stock": 2,
        "processor": "Intel Core Ultra 7 155H",
        "ram": "16GB LPDDR5x",
        "storage": "1TB NVMe SSD",
        "gpu": "Intel Arc Graphics",
        "display": '14" 2.8K OLED Touch, 360° convertible',
        "battery": "7–8 hrs, 68Wh",
        "description": "Premium 2-in-1 with stunning OLED touch display — folds into a tablet for note-taking and presentations. UK import, A+ grade. Includes HP stylus and fast charger.",
        "warranty": "3 Months DLS Service Warranty",
        "images": ["/images/laptop-blue.jpg"],
        "featured": True,
    },
    {
        "name": "Lenovo ThinkPad X1 Carbon Gen 11",
        "brand": "Lenovo",
        "model": "X1 Carbon Gen 11",
        "price": 235000,
        "condition": "LIKE_NEW",
        "stock": 3,
        "processor": "Intel Core i7-1355U (13th Gen)",
        "ram": "16GB LPDDR5",
        "storage": "512GB NVMe SSD",
        "gpu": "Intel Iris Xe",
        "display": '14" 2.2K IPS, anti-glare',
        "battery": "8+ hrs, 57Wh",
        "description": "The legendary business ultrabook — 1.1kg carbon fiber body, best-in-class keyboard, military-grade durability. Corporate off-lease unit in superb condition.",
        "warranty": "3 Months DLS Service Warranty",
        "images": ["/images/laptop-business.jpg"],
        "featured": False,
    },
    {
        "name": "ASUS ROG Strix G16 RTX 4060",
        "brand": "ASUS",
        "model": "ROG Strix G16 G614",
        "price": 389999,
        "original_price": 419999,
        "condition": "NEW",
        "stock": 3,
        "processor": "Intel Core i7-13650HX",
        "ram": "16GB DDR5 4800MHz",
        "storage": "1TB NVMe Gen4 SSD",
        "gpu": "NVIDIA RTX 4060 8GB (140W)",
        "display": '16" FHD+ 165Hz, 100% sRGB',
        "battery": "90Wh, fast charge 0–50% in 30 min",
        "description": "Box-packed gaming beast — runs GTA V, Valorant, Warzone and every modern title at high FPS. MUX switch + Advanced Optimus for maximum performance. Free Windows 11 Pro + driver setup by DLS.",
        "warranty": "1 Year Local Warranty + DLS Support",
        "images": ["/images/laptop-gaming.jpg", "/images/laptop-gaming-2.jpg"],
        "featured": True,
    },
    {
        "name": "MSI Katana 15 RTX 4050",
        "brand": "MSI",
        "model": "Katana 15 B13V",
        "price": 274500,
        "condition": "NEW",
        "stock": 4,
        "processor": "Intel Core i7-13620H",
        "ram": "16GB DDR5",
        "storage": "512GB NVMe SSD",
        "gpu": "NVIDIA RTX 4050 6GB",
        "display": '15.6" FHD 144Hz',
        "battery": "53.5Wh",
        "description": "Best-value RTX gaming laptop in Peshawar right now. Cooler Boost 5 thermals, 4-zone RGB keyboard, upgradeable RAM & SSD. Box-packed with official warranty card.",
        "warranty": "1 Year Local Warranty + DLS Support",
        "images": ["/images/laptop-gaming-2.jpg"],
        "featured": False,
    },
    {
        "name": "Dell Latitude 5440 Business",
        "brand": "Dell",
        "model": "Latitude 5440",
        "price": 118000,
        "original_price": 139000,
        "condition": "GOOD",
        "stock": 6,
        "processor": "Intel Core i5-1335U (13th Gen)",
        "ram": "16GB DDR4",
        "storage": "256GB NVMe SSD",
        "gpu": "Intel Iris Xe",
        "display": '14" FHD IPS',
        "battery": "4–5 hrs",
        "description": "Solid corporate workhorse at a budget price — perfect for students, office work and online classes. Signs of previous use on lid; internally perfect. Fresh Windows 11 + MS Office installed by DLS.",
        "warranty": "1 Month DLS Service Warranty",
        "images": ["/images/laptop-business.jpg"],
        "featured": False,
    },
    {
        "name": "HP EliteBook 840 G10",
        "brand": "HP",
        "model": "EliteBook 840 G10",
        "price": 158500,
        "condition": "EXCELLENT",
        "stock": 3,
        "processor": "Intel Core i7-1355U vPro",
        "ram": "16GB DDR5",
        "storage": "512GB NVMe SSD",
        "gpu": "Intel Iris Xe",
        "display": '14" FHD IPS, low power',
        "battery": "6–7 hrs",
        "description": "Premium aluminum business machine with vPro security and crystal-clear 5MP webcam. A-grade UK corporate import, battery health above 90%.",
        "warranty": "3 Months DLS Service Warranty",
        "images": ["/images/laptop-white.jpg"],
        "featured": False,
    },
    {
        "name": "Lenovo Legion 5 Pro RTX 4070",
        "brand": "Lenovo",
        "model": "Legion Pro 5 16ARX8",
        "price": 425000,
        "original_price": 455000,
        "condition": "NEW",
        "stock": 2,
        "processor": "AMD Ryzen 7 7745HX",
        "ram": "32GB DDR5 5200MHz",
        "storage": "1TB NVMe Gen4 SSD",
        "gpu": "NVIDIA RTX 4070 8GB (140W)",
        "display": '16" WQXGA 240Hz, 500 nits',
        "battery": "80Wh",
        "description": "No-compromise gaming & streaming machine. 240Hz QHD panel, full-power RTX 4070, legendary Legion cooling. Box-packed, sealed. Ideal for gaming, AI workloads and 4K video editing.",
        "warranty": "1 Year Local Warranty + DLS Support",
        "images": ["/images/laptop-gaming-2.jpg", "/images/laptop-gaming.jpg"],
        "featured": True,
    },
    {
        "name": "Acer Swift Go 14 OLED",
        "brand": "Acer",
        "model": "Swift Go 14 SFG14",
        "price": 172999,
        "condition": "NEW",
        "stock": 4,
        "processor": "Intel Core Ultra 5 125H",
        "ram": "16GB LPDDR5x",
        "storage": "512GB NVMe SSD",
        "gpu": "Intel Arc Graphics",
        "display": '14" 2.8K OLED, 90Hz',
        "battery": "8+ hrs, 65Wh",
        "description": "Ultra-portable with a gorgeous OLED panel and all-day battery — the perfect university and freelancing companion. 1.3kg only.",
        "warranty": "1 Year Local Warranty + DLS Support",
        "images": ["/images/laptop-thin.jpg"],
        "featured": False,
    },
    {
        "name": "HP Pavilion 15 (Budget King)",
        "brand": "HP",
        "model": "Pavilion 15-eg3",
        "price": 96500,
        "original_price": 115000,
        "condition": "GOOD",
        "stock": 5,
        "processor": "Intel Core i5-1235U (12th Gen)",
        "ram": "8GB DDR4 (upgradeable)",
        "storage": "512GB NVMe SSD",
        "gpu": "Intel Iris Xe",
        "display": '15.6" FHD IPS',
        "battery": "3–4 hrs",
        "description": "Best budget laptop under Rs. 100k — fast SSD, backlit keyboard and big display for office work, online classes and browsing. Free RAM upgrade advice — ask about our 16GB upgrade deal.",
        "warranty": "1 Month DLS Service Warranty",
        "images": ["/images/laptop-blue.jpg"],
        "featured": False,
    },
]

# Logo + default settings (used by the site header/footer)
DEFAULT_SETTINGS = {
    "site_name": "DIGITAL LAPTOP",
    "tagline": "Service (DLS) Software Installation & Hardware Service",
    "logo_url": "/images/logo.png",
    "phone_owner": "0310-9516681",
    "phone_display": "Zeeshan: 0310-9516681",
    "whatsapp_number": "923109516681",
    "address": "Shop No 12A, Alharmian Market Near Gull Haji Plaza, Peshawar",
    "map_embed": "",
    "opening_hours": "Mon – Sat · 10:00 AM – 9:00 PM",
    "hero_badge": "Alharmian Market · Near Gull Haji Plaza · Peshawar",
    "hero_title": "Premium Laptops.",
    "hero_title_accent": "Honest Prices.",
    "hero_subtitle": "Hand-picked new & imported machines, fully tested by our service lab, with Cash on Delivery across Peshawar.",
    "hero_image_url": "/images/hero-laptop.svg",
    "hero_badge_title": "Core i5 – Ultra 9",
    "hero_badge_subtitle": "Latest Gen Processors",
    "service_badge_title": "DLS Service Lab",
    "service_badge_subtitle": "Software + Hardware",
    "service_image_url": "/images/service-desk.svg",
    "service_title": "Software Installation & Hardware Service",
    "service_description": "Windows & licensed software installation, data recovery, SSD/RAM upgrades, screen & battery replacement and board-level repairs — all under one roof.",
    "service_phone_display": "Zeeshan: 0310-9516681",
    "footer_note": "Peshawar's trusted destination for premium new & imported laptops — checked, tested and serviced by experts.",
}


def main():
    print("Connecting to Neon...")
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        # Create all tables
        with conn.cursor() as cur:
            for stmt in CREATE_STATEMENTS:
                cur.execute(stmt)
        conn.commit()
        print("All tables created/verified.")

        # Seed products (clear first so re-runs are idempotent)
        with conn.cursor() as cur:
            cur.execute("TRUNCATE products RESTART IDENTITY CASCADE")
            for p in SEED_PRODUCTS:
                cur.execute(
                    """
                    INSERT INTO products
                        (name, brand, model, price, original_price, condition,
                         stock, processor, ram, storage, gpu, display, battery,
                         description, warranty, images, featured)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        p["name"], p["brand"], p["model"], p["price"],
                        p.get("original_price"), p["condition"], p["stock"],
                        p["processor"], p["ram"], p["storage"], p["gpu"],
                        p["display"], p.get("battery"), p["description"],
                        p["warranty"], p["images"], p["featured"],
                    ),
                )
        conn.commit()
        print(f"Seeded {len(SEED_PRODUCTS)} products.", flush=True)

        # Seed default settings (upsert)
        with conn.cursor() as cur:
            for key, value in DEFAULT_SETTINGS.items():
                cur.execute(
                    """
                    INSERT INTO settings ("key", "value") VALUES (%s, %s)
                    ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value"
                    """,
                    (key, value),
                )
        conn.commit()
        print(f"Seeded {len(DEFAULT_SETTINGS)} settings.", flush=True)

        # Verify
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, price::text FROM products ORDER BY id LIMIT 5")
            rows = cur.fetchall()
            print(f"PRODUCTS IN DB: {len(rows)}")
            for row in rows:
                print(" -", row["id"], row["name"], "PKR", row["price"])

    print("DONE ✅")


if __name__ == "__main__":
    main()