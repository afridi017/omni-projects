import Link from "next/link";

const CATEGORIES = [
  { brand: "Dell", emoji: "💻", color: "from-blue-500/20 to-blue-600/10 border-blue-500/20", hoverColor: "hover:border-blue-500/50" },
  { brand: "HP", emoji: "🖥️", color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20", hoverColor: "hover:border-cyan-500/50" },
  { brand: "Lenovo", emoji: "⌨️", color: "from-red-500/20 to-red-600/10 border-red-500/20", hoverColor: "hover:border-red-500/50" },
  { brand: "Apple", emoji: "🍎", color: "from-slate-400/20 to-slate-500/10 border-slate-400/20", hoverColor: "hover:border-slate-400/50" },
  { brand: "Asus", emoji: "🎮", color: "from-violet-500/20 to-violet-600/10 border-violet-500/20", hoverColor: "hover:border-violet-500/50" },
  { brand: "Acer", emoji: "🌊", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20", hoverColor: "hover:border-emerald-500/50" },
];

export default function Categories() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">Shop By Brand</p>
        <h2 className="text-white text-3xl sm:text-4xl font-bold">Browse Categories</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.brand}
            href={`/products?brand=${cat.brand}`}
            id={`category-${cat.brand.toLowerCase()}`}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.hoverColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group`}
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
            <span className="text-white font-semibold text-sm">{cat.brand}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
