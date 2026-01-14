import { Instagram, Facebook, Linkedin, Mail, Phone, Lock, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

interface FooterProps {
  corretorNome?: string;
  whatsapp?: string | null;
  email?: string | null;
  creci?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer = ({ 
  corretorNome,
  whatsapp, 
  email, 
  creci, 
  instagram, 
  facebook, 
  linkedin, 
  tiktok, 
  youtube 
}: FooterProps) => {
  const currentYear = new Date().getFullYear();
  
  // Format phone for display
  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  const displayName = corretorNome || "Corretor";
  const displayPhone = whatsapp ? formatPhone(whatsapp) : null;
  const displayEmail = email || null;
  const displayCreci = creci || null;

  const socialLinks = [
    { url: instagram, icon: Instagram, label: "Instagram" },
    { url: facebook, icon: Facebook, label: "Facebook" },
    { url: linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: tiktok, icon: TikTokIcon, label: "TikTok" },
    { url: youtube, icon: Youtube, label: "YouTube" },
  ].filter(link => link.url);

  // Default social links if none provided
  const defaultSocialLinks = [
    { url: "https://instagram.com", icon: Instagram, label: "Instagram" },
    { url: "https://facebook.com", icon: Facebook, label: "Facebook" },
    { url: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
  ];

  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : defaultSocialLinks;

  return (
    <footer className="bg-background border-t border-border py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="text-center">
            <span className="text-xl font-semibold text-foreground">
              {displayName}
            </span>
            <span className="text-muted-foreground mx-2">|</span>
            <span className="text-sm text-muted-foreground">
              Corretor de Imóveis
            </span>
          </div>

          {/* Contact Info */}
          {(displayPhone || displayEmail) && (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              {displayPhone && (
                <a
                  href={`tel:+55${whatsapp}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {displayPhone}
                </a>
              )}
              {displayEmail && (
                <a
                  href={`mailto:${displayEmail}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {displayEmail}
                </a>
              )}
            </div>
          )}

          {/* Social Links */}
          <div className="flex gap-4">
            {displaySocialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border w-full">
            <p>
              © {currentYear} {displayName} Corretor de Imóveis. Todos os
              direitos reservados.
            </p>
            {displayCreci && <p className="text-xs mt-1">CRECI: {displayCreci}</p>}
            <Link
              to="/auth"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-primary transition-colors mt-2"
            >
              <Lock className="w-3 h-3" />
              Área Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
