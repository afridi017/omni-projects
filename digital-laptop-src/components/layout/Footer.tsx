import Link from "next/link";
import { Monitor, Phone, MapPin, MessageCircle, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-slate-950">
      {/* Gradient fade */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold text-base tracking-wider">DIGITAL</span>
                <span className="text-blue-400 font-bold text-base tracking-widest">LAPTOP</span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Software Installation &amp; Hardware Service. Your trusted partner for premium laptops in Peshawar.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:03109516681"
                  id="footer-phone-link"
                  className="flex items-start gap-2.5 text-slate-400 hover:text-green-400 transition-colors duration-200 group"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-green-400" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Zeeshan</div>
                    <div className="text-sm">0310-9516681</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923109516681"
                  id="footer-whatsapp-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-slate-400 hover:text-green-400 transition-colors duration-200 group"
                >
                  <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-green-400" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">WhatsApp</div>
                    <div className="text-sm">0310-9516681</div>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Location</div>
                    <div className="text-sm leading-relaxed">
                      Shop No 12A, Alharmian Market<br />
                      Near Gull Haji Plaza, Peshawar
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Browse Laptops" },
                { href: "/cart", label: "Cart" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} DIGITAL LAPTOP — Service (DLS) Software Installation &amp; Hardware Service
          </p>
          {/* Developer credit */}
          <p className="text-slate-700 text-xs flex items-center gap-2">
            <span>Developed by</span>
            <a
              href="https://github.com/afridi017"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              IB Afridi
            </a>
            <span>·</span>
            <a
              href="mailto:ib.afridi.cs@gmail.com"
              className="text-slate-600 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              ib.afridi.cs@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
