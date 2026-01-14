import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

interface SocialLinksFormProps {
  instagram: string;
  facebook: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
  onChange: (field: string, value: string) => void;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const SocialLinksForm = ({ instagram, facebook, linkedin, tiktok, youtube, onChange }: SocialLinksFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Instagram className="w-5 h-5 text-primary" />
        Redes Sociais
      </h3>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="instagram"
              placeholder="https://instagram.com/seuusuario"
              value={instagram}
              onChange={(e) => onChange("instagram_url", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <div className="relative">
            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="facebook"
              placeholder="https://facebook.com/suapagina"
              value={facebook}
              onChange={(e) => onChange("facebook_url", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/seuperfil"
              value={linkedin}
              onChange={(e) => onChange("linkedin_url", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktok">TikTok</Label>
          <div className="relative">
            <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="tiktok"
              placeholder="https://tiktok.com/@seuusuario"
              value={tiktok}
              onChange={(e) => onChange("tiktok_url", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <div className="relative">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="youtube"
              placeholder="https://youtube.com/@seucanal"
              value={youtube}
              onChange={(e) => onChange("youtube_url", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksForm;
