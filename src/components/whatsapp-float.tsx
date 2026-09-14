import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const message = encodeURIComponent(
    "Olá, Dra. Stefany! Gostaria de saber mais sobre os procedimentos.",
  );
  return (
    <a
      href={`https://wa.me/?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-rosedeep text-primary-foreground shadow-xl transition-transform hover:-translate-y-1"
    >
      <MessageCircle />
    </a>
  );
}
