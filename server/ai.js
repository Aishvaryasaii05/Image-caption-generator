import https from 'https'

const STYLE_PROMPTS = {
  short: 'Generate a concise, one-sentence caption for this image.',
  detailed: 'Generate a detailed, descriptive caption that captures all important elements in this image.',
  funny: 'Generate a funny, humorous caption for this image that would make people smile.',
  instagram: 'Generate an engaging Instagram-style caption with relevant hashtags at the end.',
  professional: 'Generate a professional, business-appropriate caption for this image.',
  'alt-text': 'Generate a descriptive alt-text caption for accessibility, describing all important visual elements.',
}

const LANGUAGE_PROMPTS = {
  english: 'Respond in English.',
  telugu: 'Respond in Telugu language.',
  hindi: 'Respond in Hindi language.',
}

function makeRequest(hostname, path, options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname,
      path,
      ...options
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`))
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })
    req.on('error', reject)
    if (postData) req.write(postData)
    req.end()
  })
}

export async function generateCaption(imageBuffer, mimeType, style, language) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured on the server.')
  }

  // Convert image to base64
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64Image}`
  
  const prompt = `${STYLE_PROMPTS[style]} ${LANGUAGE_PROMPTS[language]}`
  
  const postData = JSON.stringify({
    model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl
            }
          }
        ]
      }
    ],
    temperature: 0.7,
    max_tokens: 300
  })
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  try {
    const result = await makeRequest(
      'api.groq.com',
      '/openai/v1/chat/completions',
      options,
      postData
    )
    
    // Extract caption from response
    const caption = result.choices?.[0]?.message?.content?.trim()
    
    if (!caption) {
      throw new Error('Groq returned an empty caption')
    }

    return caption
  } catch (error) {
    console.error('Groq API Error:', error.message)
    throw new Error(`Groq API error: ${error.message}`)
  }
}



