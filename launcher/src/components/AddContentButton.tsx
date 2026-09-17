import { Plus } from 'lucide-react';
export function AddContentButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="add-content-button"><Plus size={18} /> Add Content</button>;
}
