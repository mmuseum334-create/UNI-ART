import VirtualMuseumScene from '../../components/ui/VirtualMuseumScene';

export const metadata = {
  title: 'Museo Virtual | UNI-ART',
  description: 'Explora nuestra galería de arte en Realidad Virtual y Aumentada',
};

export default function VirtualMuseumPage() {
  return (
    <main className="bg-black min-h-screen">
      <VirtualMuseumScene />
    </main>
  );
}
