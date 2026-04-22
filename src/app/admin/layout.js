export const metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
  alternates: {
    canonical: "/admin",
  },
};

export default function AdminLayout({ children }) {
  return children;
}
