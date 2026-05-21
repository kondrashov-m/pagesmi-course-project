"use client";
import { useState, useEffect, useCallback } from "react";
import type { SavedBlock, CanvasElement } from "@/types/canvas-element";

function deepCloneWithNewIds(el: CanvasElement): CanvasElement {
  return {
    ...el,
    id: crypto.randomUUID(),
    children: el.children?.map(deepCloneWithNewIds),
  };
}

export function useSavedBlocks() {
  const [blocks, setBlocks] = useState<SavedBlock[]>([]);

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch('/api/blocks')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.blocks)) {
        const mapped: SavedBlock[] = data.blocks.map((b: any) => ({
          id: b.id,
          name: b.name,
          element: b.element as CanvasElement,
          createdAt: new Date(b.createdAt).getTime(),
        }))
        setBlocks(mapped)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  const save = useCallback(async (element: CanvasElement, name: string) => {
    const cloned = deepCloneWithNewIds(element)
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, element: cloned }),
      })
      if (!res.ok) return
      const data = await res.json()
      const newBlock: SavedBlock = {
        id: data.block.id,
        name: data.block.name,
        element: data.block.element as CanvasElement,
        createdAt: new Date(data.block.createdAt).getTime(),
      }
      setBlocks(prev => [newBlock, ...prev])
    } catch {}
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/blocks?id=${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setBlocks(prev => prev.filter(b => b.id !== id))
    } catch {}
  }, [])

  const instantiate = useCallback((block: SavedBlock): CanvasElement => {
    return deepCloneWithNewIds(block.element)
  }, [])

  return { blocks, save, remove, instantiate }
}
