import { create } from 'zustand';
import type { LayoutMode } from '../components/LayoutDensityMenu';

const KEY = 'enderloom-library-layout';
function initial() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { layout: (['tiles','list','table'].includes(value.layout) ? value.layout : 'tiles') as LayoutMode,
      tileSize: Number.isInteger(value.tileSize) && value.tileSize >= 0 && value.tileSize <= 4 ? value.tileSize : 0 };
  } catch { return { layout: 'tiles' as LayoutMode, tileSize: 0 }; }
}
export const useLibraryLayout = create<ReturnType<typeof initial> & { setLayout: (layout: LayoutMode) => void; setTileSize: (size: number) => void }>((set, get) => ({
  ...initial(),
  setLayout: layout => { set({ layout }); const { tileSize } = get(); localStorage.setItem(KEY, JSON.stringify({ layout, tileSize })); },
  setTileSize: size => { const tileSize = Math.max(0, Math.min(4, Math.round(size))); set({ tileSize }); const { layout } = get(); localStorage.setItem(KEY, JSON.stringify({ layout, tileSize })); },
}));
window.addEventListener('storage', event => { if (event.key === KEY) useLibraryLayout.setState(initial()); });
