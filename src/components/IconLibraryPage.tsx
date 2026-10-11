import IconLibraryPanel from "./IconLibraryPanel";

interface IconLibraryPageProps {
  onBack: () => void;
}

export default function IconLibraryPage({ onBack }: IconLibraryPageProps) {
  return (
    <main className="icon-library-page">
      <IconLibraryPanel onBack={onBack} />
    </main>
  );
}
