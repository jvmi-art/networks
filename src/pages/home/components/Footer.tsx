import { Github, Instagram } from 'lucide-react';

interface FooterProps {
  xUrl?: string;
  instagramUrl?: string;
  githubUrl?: string;
}

export function Footer({ 
  xUrl = 'https://x.com',
  instagramUrl = 'https://instagram.com',
  githubUrl = 'https://github.com'
}: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-between px-6 py-4">
      {/* Social Links - Bottom Left */}
      <div className="flex items-center gap-4">
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white transition-colors"
          aria-label="X (Twitter)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Instagram"
        >
          <Instagram size={20} />
        </a>
        
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white transition-colors"
          aria-label="GitHub"
        >
          <Github size={20} />
        </a>
      </div>

      {/* JVMI Logo - Bottom Right */}
      <div className="opacity-60 hover:opacity-100 transition-opacity">
        <img 
          src="/jvmi.svg" 
          alt="JVMI" 
          className="h-6 w-auto"
        />
      </div>
    </footer>
  );
}