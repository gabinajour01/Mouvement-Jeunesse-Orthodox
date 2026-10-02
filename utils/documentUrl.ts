export function formatDocumentUrl(url: string): string {
  if (!url) return '#'
  
  // Extract ID from drive.google.com/file/d/ID or docs.google.com/.../d/ID
  const match = url.match(/\/(?:file|document|presentation|spreadsheets)\/d\/([-\w]+)/)
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`
  }

  return url
}
