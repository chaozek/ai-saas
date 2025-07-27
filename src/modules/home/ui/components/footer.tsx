import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Fitness Plány", href: "/plans" },
      { name: "Jídelníčky", href: "/meal-plans" },
      { name: "Sledování Pokroku", href: "/progress" },
      { name: "AI Trenér", href: "/ai-trainer" },
    ],
    resources: [
      { name: "Fitness Blog", href: "/blog" },
      { name: "Recepty", href: "/recipes" },
      { name: "Fitness Kalkulačky", href: "/calculators" },
      { name: "FAQ", href: "/faq" }
    ],
    company: [
      { name: "O nás", href: "/about" },
      { name: "Kariéra", href: "/careers" },
      { name: "Partneři", href: "/partners" },
      { name: "Kontakt", href: "/contact" }
    ],
    support: [
      { name: "Nápověda", href: "/help" },
      { name: "Podpora", href: "/support" },
      { name: "Soukromí", href: "/privacy" }
    ]
  };

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💪</span>
              </div>
              <Logo alt="FitnessAI" width={120} height={28} className="text-white" />
            </div>
            <p className="text-slate-300 leading-relaxed">
              Transformujte svou fitness cestu s AI-powered trenérem. Personalizované plány,
              sledování pokroku a odborné vedení v jedné aplikaci.
            </p>

            {/* Newsletter Signup */}
           {/*  <div className="space-y-3">
              <h4 className="font-semibold">Přihlaste se k odběru novinek</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Váš email"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div> */}

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">Zdroje</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Společnost</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Podpora</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-slate-300">support@fitnessai.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">Telefon</p>
                <p className="text-slate-300">+420 123 456 789</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">Adresa</p>
                <p className="text-slate-300">Praha, Česká republika</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <span>© {currentYear} FitnessAI. Vytvořeno s</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>v České republice</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-300">
              <a href="/privacy" className="hover:text-white transition-colors">
                Ochrana osobních údajů
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Podmínky použití
              </a>
              <a href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}