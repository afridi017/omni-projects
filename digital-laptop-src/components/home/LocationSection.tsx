import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";

export default function LocationSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">Find Us</p>
        <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4">Visit Our Store</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Come visit us at our physical store in Peshawar. We&apos;re conveniently located near Gull Haji Plaza.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl min-h-[350px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.123456789!2d71.5709!3d34.0151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917b4b4b4b4b4%3A0x1234567890abcdef!2sAlharmian%20Market%2C%20Peshawar!5e0!3m2!1sen!2spk!4v1694000000000!5m2!1sen!2spk"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "350px" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="DIGITAL LAPTOP Location - Alharmian Market Peshawar"
          />
        </div>

        {/* Info Card */}
        <div className="flex flex-col gap-5">
          {/* Address */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Address</p>
              <p className="text-white font-semibold">Shop No 12A, Alharmian Market</p>
              <p className="text-slate-300 text-sm">Near Gull Haji Plaza, Peshawar</p>
            </div>
          </div>

          {/* Phone */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Call / SMS</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs">Zeeshan</p>
                  <a
                    href="tel:03109516681"
                    id="location-phone-zeeshan"
                    className="text-white font-semibold hover:text-green-400 transition-colors duration-200 text-lg"
                  >
                    0310-9516681
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href="https://wa.me/923109516681"
            id="location-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4 hover:bg-green-500/15 hover:border-green-500/40 transition-all duration-300 group hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-semibold text-base">Chat on WhatsApp</p>
              <p className="text-green-400/70 text-sm">Quick replies, 24/7 available</p>
            </div>
            <div className="ml-auto text-green-400 group-hover:translate-x-1 transition-transform duration-200">→</div>
          </a>

          {/* Hours */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Store Hours</p>
              <p className="text-white font-semibold">9:00 AM – 9:00 PM</p>
              <p className="text-slate-400 text-sm">Monday – Saturday</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
