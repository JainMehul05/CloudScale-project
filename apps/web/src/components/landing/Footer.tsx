"use client";

import Link from "next/link";
import { GitBranch, Mail, Globe, Heart, MessageSquare } from "lucide-react";
import { CloudScaleLogo } from "@/components/ui/CloudScaleLogo";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Architecture", href: "#architecture" },
    { label: "Technology", href: "#technology" },
    { label: "Security", href: "#security" },
    { label: "Changelog", href: "/changelog" },
  ],
  Developers: [
    { label: "Documentation", href: "https://github.com/JainMehul05/CloudScale-project#readme" },
    { label: "API Reference", href: "https://github.com/JainMehul05/CloudScale-project" },
    { label: "CLI Reference", href: "https://github.com/JainMehul05/CloudScale-project" },
    { label: "SDK", href: "https://github.com/JainMehul05/CloudScale-project" },
    { label: "Examples", href: "https://github.com/JainMehul05/CloudScale-project" },
  ],
  Company: [
    { label: "About", href: "https://github.com/JainMehul05/CloudScale-project" },
    { label: "Blog", href: "https://github.com/JainMehul05/CloudScale-project" },
    { label: "Careers", href: "https://github.com/JainMehul05/CloudScale-project" },
    { label: "Contact", href: "mailto:hello@cloudscale.dev" },
    { label: "Press", href: "https://github.com/JainMehul05/CloudScale-project" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Security", href: "#security" },
    { label: "Cookies", href: "#cookies" },
  ],
};

const SOCIAL_LINKS = [
  { icon: GitBranch, href: "https://github.com/JainMehul05/CloudScale-project", label: "GitHub" },
  { icon: MessageSquare, href: "https://twitter.com/cloudscale", label: "Twitter" },
  { icon: Mail, href: "mailto:hello@cloudscale.dev", label: "Email" },
  { icon: Globe, href: "https://cloudscale.dev", label: "Website" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 text-white mb-6" aria-label="CloudScale Home">
              <CloudScaleLogo size="md" />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-300 to-[#00E5FF] bg-clip-text text-transparent">
                CloudScale
              </span>
            </Link>
            <p className="text-sm text-zinc-500 mb-6 max-w-xs">
              AI-powered cloud deployment infrastructure for modern developers.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-[#00E5FF] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product links">
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.Product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-[#00E5FF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Developers */}
          <nav aria-label="Developer links">
            <h3 className="font-semibold text-white mb-4">Developers</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.Developers.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-[#00E5FF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.Company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-[#00E5FF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.Legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-[#00E5FF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} CloudScale. Built with{" "}
              <Heart className="inline h-3.5 w-3.5 text-[#FF3366]" aria-hidden="true" />
              {" for developers."}
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-zinc-500 hover:text-[#00E5FF] transition-colors"
              >
                Status
              </Link>
              <Link
                href="#"
                className="text-sm text-zinc-500 hover:text-[#00E5FF] transition-colors"
              >
                System Health
              </Link>
              <Link
                href="#"
                className="text-sm text-zinc-500 hover:text-[#00E5FF] transition-colors"
              >
                API Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}