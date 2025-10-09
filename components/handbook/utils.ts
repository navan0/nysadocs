export function findFirstMarkdown(tree: any[]): any | null {
  for (const node of tree) {
    if (node.type === "file" && node.name.endsWith(".md")) return node
    if (node.type === "dir" && node.children) {
      const found = findFirstMarkdown(node.children)
      if (found) return found
    }
  }
  return null
}
