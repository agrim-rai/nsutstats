export async function uploadImageToS3(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload image')
  }

  const data = await response.json()
  return data.file.fileUrl
}

export function generateImageFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `nsutstats/images/${timestamp}-${randomString}.${extension}`
}

export const uploadInlineImageToS3 = async (file: File): Promise<{ imageId: string, fileUrl: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch('/api/upload/inline-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload inline image')
  }

  const data = await response.json()
  return {
    imageId: data.imageId,
    fileUrl: data.file.fileUrl
  }
}