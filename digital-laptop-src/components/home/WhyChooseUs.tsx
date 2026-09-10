import { Shield, Wrench, Clock, Star, Truck, Headphones } from "lucide-react";

const REASONS = [
  {
    icon: Shield,
    title: "Genuine Products",
    description: "All laptops are verified and guaranteed genuine. No counterfeits, no compromises.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Wrench,
    title: "Expert Hardware Service",
    description: "Professional hardware repair and software installation by certified technicians.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Star,
    title: "Best Prices in Peshawar",
    description: "Competitive pricing with no hidden charges. Pay exactly what you see.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Truck,
    title: "Cash on Delivery",
    description: "Pay when you receive. No upfront payment required for in-city orders.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Clock,
    title: "Warranty Included",
    description: "Every laptop comes with a warranty period. Conditions apply per product.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: Headphones,
    title: "24/7 WhatsApp Support",
    description: "Get instant support through WhatsApp. We're always here for you.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">Why Us?</p>
          <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4">Why Choose DIGITAL LAPTOP?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We&apos;re not just a store — we&apos;re your technology partner in Peshawar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REASONS.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className={`p-6 rounded-2xl bg-slate-900/60 border border-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group`}
              >
                <div className={`w-12 h-12 rounded-2xl ${reason.bg} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${reason.color}`} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{reason.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
