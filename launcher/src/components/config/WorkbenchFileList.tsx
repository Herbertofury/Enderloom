import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";

export interface WorkbenchRow { key: string; render: () => ReactNode }

/** Window the presentation, never the inventory. Search, groups and validation
 * always operate on every file. Keyboard focus remains mounted while scrolling. */
export function WorkbenchFileList({ rows, grid, scrollElement }: {
  rows: WorkbenchRow[];
  grid: boolean;
  scrollElement: () => HTMLElement | null;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [margin, setMargin] = useState(0);
  const [focused, setFocused] = useState<string | null>(null);
  const nextFocus = useRef<number | null>(null);
  const virtual = !grid && rows.length > 120;
  const focusedIndex = rows.findIndex(row => row.key === focused);
  const list = useVirtualizer({
    count: rows.length,
    getScrollElement: scrollElement,
    getItemKey: index => rows[index].key,
    estimateSize: () => 78,
    overscan: 8,
    enabled: virtual,
    scrollMargin: margin,
    rangeExtractor: range => [...new Set([...defaultRangeExtractor(range), ...(focusedIndex >= 0 ? [focusedIndex] : [])])].sort((a,b)=>a-b),
  });
  useLayoutEffect(() => {
    if (!virtual || !root.current) return;
    const element = root.current, scroll = scrollElement();
    if (!scroll) return;
    const measure = () => setMargin(element.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroll);
    if (element.parentElement) observer.observe(element.parentElement);
    return () => observer.disconnect();
  }, [virtual, scrollElement]);
  const visible = list.getVirtualItems();
  useLayoutEffect(() => {
    if (nextFocus.current == null) return;
    const button = root.current?.querySelector<HTMLButtonElement>(`[data-index="${nextFocus.current}"] button`);
    if (button) { nextFocus.current = null; button.focus({ preventScroll: true }); }
  });
  if (!virtual) return <div className={`wb-file-list ${grid ? "wb-addon-grid" : ""}`} role="list" aria-label="Config and addon files">{rows.map((row,index)=><div key={row.key} role="listitem" aria-posinset={index+1} aria-setsize={rows.length}>{row.render()}</div>)}</div>;
  return <div ref={root} className="wb-file-list wb-virtual-list" role="list" aria-label="Config and addon files" style={{height:list.getTotalSize(),position:"relative"}}>
    {visible.map(item=><div key={item.key} data-index={item.index} ref={list.measureElement} role="listitem" aria-posinset={item.index+1} aria-setsize={rows.length}
      style={{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${item.start-margin}px)`}}
      onFocusCapture={()=>setFocused(rows[item.index].key)}
      onKeyDown={event=>{
        const destination = event.key === "ArrowDown" ? item.index+1 : event.key === "ArrowUp" ? item.index-1 : event.key === "Home" ? 0 : event.key === "End" ? rows.length-1 : null;
        if (destination == null || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        const index = Math.max(0,Math.min(rows.length-1,destination));
        nextFocus.current = index;
        list.scrollToIndex(index,{align:"auto"});
        setFocused(rows[index].key);
      }}>{rows[item.index].render()}</div>)}
  </div>;
}
