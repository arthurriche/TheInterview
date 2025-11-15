'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    requestDemo: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Message envoyé ! Nous vous répondrons sous 24h.");
    setFormData({ name: "", email: "", message: "", requestDemo: false });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nous contacter"
        subtitle="Une question ? Besoin d'une démo pour votre équipe ? Écrivez-nous."
      />

      <BentoCard padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#4A4E5E]">
              Nom
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-sm text-[#1F2432] placeholder:text-[#9CA3AF] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#4A4E5E]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-sm text-[#1F2432] placeholder:text-[#9CA3AF] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
              placeholder="votre.email@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-[#4A4E5E]">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-[var(--radius)] border border-[#E3E6EC] bg-white px-4 py-3 text-sm text-[#1F2432] placeholder:text-[#9CA3AF] shadow-[inset_6px_6px_12px_#D1D4D9,inset_-6px_-6px_12px_#FFFFFF] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
              placeholder="Décrivez votre demande..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requestDemo}
              onChange={(e) => setFormData({ ...formData, requestDemo: e.target.checked })}
              className="h-4 w-4 rounded-md border border-[#E3E6EC] text-[#4F46E5] focus:ring-[#4F46E5]"
            />
            <span className="text-sm text-[#4A4E5E]">Je souhaite demander une démo</span>
          </label>

          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Envoi en cours..." : "Envoyer le message"}
          </Button>
        </form>
      </BentoCard>
    </div>
  );
}
