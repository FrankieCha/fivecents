import "./globals.css";

export const metadata = {
  title: "FiveCents",
  description: "Contribution journals for the School of Infocomm",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
