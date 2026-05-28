export interface DeckMetadata {
  slug: string;
  title: string;
  category: string;
  slideCount: number;
  description: string;
  pdfPath: string;
  statusBadge: string;
  disclaimer: string;
}

export const RESOURCE_LEVEL_DISCLAIMER = 
  "These resources are educational and strategic materials. They do not provide diagnosis, prescriptions, emergency guidance, or doctor replacement. Some content may be refined over time. For medical decisions, consult a qualified doctor.";

export const DECKS: DeckMetadata[] = [
  {
    slug: "body-mind-os",
    title: "Body & Mind OS — A Health Curriculum for Indian Families",
    category: "Health Curriculum",
    slideCount: 72,
    description: "A structured family health curriculum covering prevention, nutrition, movement, sleep, screening, and family health systems.",
    pdfPath: "/resources/decks/body-mind-os/body-mind-os.pdf",
    statusBadge: "Educational Draft",
    disclaimer: "Educational curriculum draft. Clinical facts should be reviewed before formal medical distribution."
  }
];

export function getDeckBySlug(slug: string): DeckMetadata | undefined {
  return DECKS.find(deck => deck.slug === slug);
}
