export type SiteConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github: string;
  };
  contacts: {
    email: string;
  };
};

export const siteConfig: SiteConfig = {
  name: "DA Hacks 3.5 Application Portal",
  title: "DA Hacks 3.5 Application Portal",
  description: "Apply for DA Hacks 3.5 - A hackathon for students to showcase their skills and creativity.",
  url: "https://portal.deanzahacks.com",
  ogImage: "https://github.com/da-hacks/da-hacks-3.5-application-portal/blob/main/public/og.png",
  links: {
    github: "https://github.com/da-hacks/hackathon-dashboard",
  },
  contacts: {
    email: "inky@deanzahacks.com",
  },
};

export const metaConfig = {
  generator: 'Next.js',
  applicationName: 'DA Hacks Application Portal',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Hackathon', 'DA Hacks', 'De Anza College', 'Programming', 'Coding',
    'Web Development', 'Mobile Development', 'Hardware', 'Software',
    'Student Projects', 'Innovation', 'Technology', 'STEM'
  ],
  authors: [{ name: 'DA Hacks Team', url: 'https://portal.deanzahacks.com' }],
  creator: 'DA Hacks Team',
  publisher: 'DA Hacks Team',
};