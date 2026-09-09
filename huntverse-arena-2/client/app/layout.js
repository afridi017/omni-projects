import "./arena/arena.css";
import "./globals.css";
export const metadata = {
  title: "HuntVerse Arena 2.0",
  description: "Real-time multiplayer CTF arena by IB Afridi",
};
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
