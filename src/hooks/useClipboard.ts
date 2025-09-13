export default function useClipboard() {
  const copy = async (text: string) => {
    navigator.permissions
      .query({ name: 'clipboard-write' as PermissionName })
      .then((result) => {
        if (result.state === 'granted') {
          navigator.clipboard.writeText(text)
        } else {
          // fallback for old browser and unsecure context
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
        }
      })
      .catch(console.error)
  }

  return {
    copy
  }
}
