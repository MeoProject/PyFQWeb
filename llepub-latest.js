/*!
 * llepub-saver - v1.0.3
 * An EPUB ebook saving library for browser.
 * License: GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
 *
 * Dependencies:
 * - Moment.js (https://momentjs.com/) - MIT License
 * - JSZip (https://stuk.github.io/jszip/) - Dual-licensed under MIT and GPLv3.
 */

class EpubSaver {
  constructor() {
    this.zip = new JSZip()
    this.metadata = new Map()
    this.volumes = new Map()
    this.cssFiles = new Map()
    this.cssMap = new Map()
    this.cssPathMapping = new Map() // Maps original CSS paths to final EPUB paths
    this.images = new Map() // Store downloaded images: filename -> {buffer, extension}
    this.coverBuffer = null
    this.coverExtension = null

    // Internationalization configuration
    this.i18n = {
      en: {
        cover: 'Cover',
        tableOfContents: 'Table of Contents',
        chapters: 'Chapters',
      },
      'zh-CN': {
        cover: '封面',
        tableOfContents: '目录',
        chapters: '章节',
      },
      'zh-TW': {
        cover: '封面',
        tableOfContents: '目錄',
        chapters: '章節',
      },
      es: {
        cover: 'Portada',
        tableOfContents: 'Índice',
        chapters: 'Capítulos',
      },
      fr: {
        cover: 'Couverture',
        tableOfContents: 'Table des matières',
        chapters: 'Chapitres',
      },
      de: {
        cover: 'Cover',
        tableOfContents: 'Inhaltsverzeichnis',
        chapters: 'Kapitel',
      },
      ja: {
        cover: '表紙',
        tableOfContents: '目次',
        chapters: '章',
      },
      ko: {
        cover: '표지',
        tableOfContents: '목차',
        chapters: '장',
      },
      ru: {
        cover: 'Обложка',
        tableOfContents: 'Содержание',
        chapters: 'Главы',
      },
      pt: {
        cover: 'Capa',
        tableOfContents: 'Índice',
        chapters: 'Capítulos',
      },
      it: {
        cover: 'Copertina',
        tableOfContents: 'Indice',
        chapters: 'Capitoli',
      },
    }

    // Set default metadata
    this.setInfo('identifier', crypto.randomUUID(), {
      scheme: 'uuid',
    })
    this.setInfo('date', moment().format('YYYY-MM-DDTHH:mm:ss[Z]'), {
      'opf:event': 'modification',
    })
    this.setInfo('language', 'en')
    this.setInfo('title', 'Untitled Book')
    this.setInfo('creator', 'Unknown Author')
  }

  setI18n(language, translations) {
    this.i18n[language] = {
      ...this.i18n[language],
      ...translations,
    }
  }

  _t(key) {
    const language = this.metadata.get('language')?.value || 'en'
    return this.i18n[language]?.[key] || this.i18n['en'][key] || key
  }

  async setInfo(key, value, options = {}) {
    this.metadata.set(key, {
      value,
      options,
    })
  }

  async cover(input) {
    if (typeof input === 'string') {
      // It's a URL, fetch it
      try {
        const response = await fetch(input)
        if (!response.ok) {
          throw new Error(`Failed to fetch cover: ${response.statusText}`)
        }
        this.coverBuffer = await response.arrayBuffer()

        // Determine extension from content type or URL
        const contentType = response.headers.get('content-type')
        if (contentType) {
          if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            this.coverExtension = 'jpg'
          } else if (contentType.includes('png')) {
            this.coverExtension = 'png'
          } else if (contentType.includes('gif')) {
            this.coverExtension = 'gif'
          } else {
            this.coverExtension = 'jpg' // default
          }
        } else {
          // Try to determine from URL
          const ext = input.split('.').pop().toLowerCase()
          this.coverExtension = ['jpg', 'jpeg', 'png', 'gif'].includes(ext) ? ext : 'jpg'
        }
      } catch (error) {
        throw new Error(`Failed to fetch cover image: ${error.message}`)
      }
    } else {
      // It's a buffer
      this.coverBuffer = input
      this.coverExtension = 'jpg' // default, could be enhanced to detect type
    }
  }

  async addVolume(idx, title, options = {}) {
    const volume = new EpubVolume(idx, title, this, options)
    this.volumes.set(idx, volume)
    return volume
  }

  async addCSS(idx, content, mappath) {
    if (this.cssFiles.has(idx) && mappath && this.cssFiles.get(idx).mappath !== mappath) {
      throw new Error(`CSS index ${idx} already exists with different mappath`)
    }

    this.cssFiles.set(idx, {
      content,
      mappath,
    })
  }

  async addCSSMap(pathMap) {
    for (const [originalPath, urlOrContent] of Object.entries(pathMap)) {
      // Normalize the original path (remove leading "Styles/" if present)
      const normalizedOriginal = originalPath.startsWith('Styles/') ? originalPath.substring(7) : originalPath

      // Check for conflicts with addCSS files (style0.css, style1.css, etc.)
      let finalPath = normalizedOriginal
      if (finalPath.match(/^style\d+\.css$/)) {
        // Rename to avoid conflict with addCSS files
        let counter = 1000 // Start high to avoid conflicts
        while (this.cssFiles.has(counter) || this.cssMap.has(`style${counter}.css`)) {
          counter++
        }
        finalPath = `style${counter}.css`
        console.warn(`CSS conflict detected, renamed ${normalizedOriginal} to ${finalPath}`)
      }

      // Store the mapping for reference updates
      this.cssPathMapping.set(originalPath, `../Styles/${finalPath}`)

      if (typeof urlOrContent === 'string' && urlOrContent.startsWith('http')) {
        // It's a URL, fetch it
        try {
          const response = await fetch(urlOrContent)
          if (!response.ok) {
            throw new Error(`Failed to fetch CSS from ${urlOrContent}: ${response.statusText}`)
          }
          const content = await response.text()
          this.cssMap.set(finalPath, content)
        } catch (error) {
          throw new Error(`Failed to fetch CSS: ${error.message}`)
        }
      } else {
        // It's content
        this.cssMap.set(finalPath, urlOrContent)
      }
    }
  }

  async _processCSSLinksInContent(content) {
    if (typeof content !== 'string') return content

    // Decode Unicode escape sequences if present
    let decodedContent = content
    try {
      decodedContent = JSON.parse('"' + content.replace(/"/g, '\\"') + '"')
    } catch (error) {
      // If JSON parsing fails, use original content
      decodedContent = content
    }

    try {
      const parser = new DOMParser()
      let doc

      // Try to parse as HTML first
      if (decodedContent.includes('<html') || decodedContent.includes('<!DOCTYPE')) {
        doc = parser.parseFromString(decodedContent, 'text/html')
      } else {
        // Wrap fragment in temporary HTML for parsing
        const wrapped = `<html><head></head><body>${decodedContent}</body></html>`
        doc = parser.parseFromString(wrapped, 'text/html')
      }

      const cssLinks = doc.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]')

      for (const link of cssLinks) {
        const href = link.getAttribute('href')
        if (href) {
          // Check if this CSS path is in our mapping
          if (this.cssPathMapping.has(href)) {
            // Update to mapped path
            const mappedPath = this.cssPathMapping.get(href)
            link.setAttribute('href', mappedPath)
            console.log(`Updated CSS reference: ${href} -> ${mappedPath}`)
          } else {
            // CSS not in map, warn and remove the link
            console.warn(`CSS reference not found in CSSMap, removing: ${href}`)
            link.remove()
          }
        }
      }

      // Return updated content
      if (decodedContent.includes('<html') || decodedContent.includes('<!DOCTYPE')) {
        const serializer = new XMLSerializer()
        return serializer.serializeToString(doc.documentElement)
      } else {
        // Extract just the body content for fragments
        return doc.body.innerHTML
      }
    } catch (error) {
      console.warn('Error processing CSS links in content:', error)
      return decodedContent
    }
  }

  async _downloadImagesFromContent(content) {
    if (typeof content !== 'string') return content

    // Decode Unicode escape sequences if present (content might already be decoded by CSS processing)
    let decodedContent = content
    if (content.includes('\\u')) {
      try {
        decodedContent = JSON.parse('"' + content.replace(/"/g, '\\"') + '"')
      } catch (error) {
        // If JSON parsing fails, use original content
        decodedContent = content
      }
    }

    try {
      const parser = new DOMParser()
      let doc

      // Try to parse as HTML first
      if (decodedContent.includes('<html') || decodedContent.includes('<!DOCTYPE')) {
        doc = parser.parseFromString(decodedContent, 'text/html')
      } else {
        // Wrap fragment in temporary HTML for parsing
        const wrapped = `<html><body>${decodedContent}</body></html>`
        doc = parser.parseFromString(wrapped, 'text/html')
      }

      const images = doc.querySelectorAll('img[src]')
      let imageCounter = this.images.size

      for (const img of images) {
        const src = img.getAttribute('src')

        // Only process external URLs (http/https)
        if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
          let downloadSuccess = false
          let finalUrl = src

          // Try to upgrade HTTP to HTTPS to prevent mixed content errors
          if (src.startsWith('http://')) {
            const httpsUrl = src.replace('http://', 'https://')
            try {
              console.log(`Trying HTTPS upgrade for: ${src}`)
              const httpsResponse = await fetch(httpsUrl)
              if (httpsResponse.ok) {
                console.warn(`Successfully upgraded HTTP to HTTPS: ${src} -> ${httpsUrl}`)
                finalUrl = httpsUrl
              }
            } catch (error) {
              // HTTPS failed, will try original HTTP URL
              console.log(`HTTPS upgrade failed for ${src}, trying original URL`)
            }
          }

          // Try downloading the image
          try {
            console.log(`Downloading image: ${finalUrl}`)
            const response = await fetch(finalUrl)
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const buffer = await response.arrayBuffer()

            // Determine file extension
            let extension = 'jpg' // default
            const contentType = response.headers.get('content-type')
            if (contentType) {
              if (contentType.includes('png')) extension = 'png'
              else if (contentType.includes('gif')) extension = 'gif'
              else if (contentType.includes('webp')) extension = 'webp'
              else if (contentType.includes('svg')) extension = 'svg'
            } else {
              // Try to get extension from URL
              const urlExt = finalUrl.split('.').pop().toLowerCase().split('?')[0]
              if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(urlExt)) {
                extension = urlExt
              }
            }

            // Generate unique filename
            const filename = `image_${imageCounter++}.${extension}`

            // Store image
            this.images.set(filename, {
              buffer,
              extension,
              originalUrl: src,
            })

            // Update img src to point to local file
            img.setAttribute('src', `../Images/${filename}`)
            downloadSuccess = true
          } catch (error) {
            console.warn(`Failed to download image ${finalUrl}:`, error.message)
          }

          // If download failed, remove the img tag entirely
          if (!downloadSuccess) {
            console.warn(`Removing failed image tag: ${src}`)
            img.remove()
          }
        }
      }

      // Return updated content
      if (decodedContent.includes('<html') || decodedContent.includes('<!DOCTYPE')) {
        const serializer = new XMLSerializer()
        return serializer.serializeToString(doc.documentElement)
      } else {
        // Extract just the body content for fragments
        return doc.body.innerHTML
      }
    } catch (error) {
      console.warn('Error processing images in content:', error)
      return decodedContent
    }
  }

  _generateContainer() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`
  }

  _generateContentOpf() {
    const uuid = this.metadata.get('identifier')?.value || crypto.randomUUID()
    const title = this.metadata.get('title')?.value || 'Untitled Book'
    const creator = this.metadata.get('creator')?.value || 'Unknown Author'
    const language = this.metadata.get('language')?.value || 'en'
    const date = this.metadata.get('date')?.value || moment().format('YYYY-MM-DDTHH:mm:ss[Z]')

    let metadata = ''
    for (const [key, data] of this.metadata) {
      const optionsStr = Object.entries(data.options)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ')
      metadata += `        <dc:${key}${optionsStr ? ' ' + optionsStr : ''}>${data.value}</dc:${key}>\n`
    }

    // Add cover reference if cover exists
    if (this.coverBuffer) {
      metadata += `        <meta name="cover" content="cover-image" />\n`
    }

    let manifest = ''
    let spine = ''
    let manifestItems = []
    let spineItems = []

    // Add navigation files
    manifest += `        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n`
    manifest += `        <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n`
    manifestItems.push('ncx', 'nav')

    // Add cover
    if (this.coverBuffer) {
      const mimeType = this.coverExtension === 'png' ? 'image/png' : this.coverExtension === 'gif' ? 'image/gif' : 'image/jpeg'
      manifest += `        <item id="cover-image" href="Images/cover.${this.coverExtension}" media-type="${mimeType}" properties="cover-image"/>\n`
      manifest += `        <item id="cover" href="Text/cover.xhtml" media-type="application/xhtml+xml"/>\n`
      manifestItems.push('cover-image', 'cover')
      spineItems.push('cover')
    }

    // Add downloaded images
    for (const [filename, imageData] of this.images) {
      let mimeType = 'image/jpeg' // default
      switch (imageData.extension) {
        case 'png':
          mimeType = 'image/png'
          break
        case 'gif':
          mimeType = 'image/gif'
          break
        case 'webp':
          mimeType = 'image/webp'
          break
        case 'svg':
          mimeType = 'image/svg+xml'
          break
      }
      const imageId = `img-${filename.replace(/[^a-zA-Z0-9]/g, '-')}`
      manifest += `        <item id="${imageId}" href="Images/${filename}" media-type="${mimeType}"/>\n`
      manifestItems.push(imageId)
    }

    // Add CSS files
    for (const [idx, cssData] of this.cssFiles) {
      manifest += `        <item id="css${idx}" href="Styles/style${idx}.css" media-type="text/css"/>\n`
      manifestItems.push(`css${idx}`)
    }

    // Add CSS map files
    for (const path of this.cssMap.keys()) {
      const id = `css-map-${path.replace(/[^a-zA-Z0-9]/g, '-')}`
      manifest += `        <item id="${id}" href="Styles/${path}" media-type="text/css"/>\n`
      manifestItems.push(id)
    }

    // Add chapters and volume pages from volumes
    const sortedVolumes = Array.from(this.volumes.entries()).sort(([a], [b]) => a - b)
    for (const [volIdx, volume] of sortedVolumes) {
      // Add volume page if createVolumePage is enabled
      if (volume.options.createVolumePage) {
        const volumeId = `volume-page-${volIdx}`
        const volumeHref = `Text/volume${volIdx}_index.xhtml`
        manifest += `        <item id="${volumeId}" href="${volumeHref}" media-type="application/xhtml+xml"/>\n`
        manifestItems.push(volumeId)
        spineItems.push(volumeId)
      }

      // Add chapters
      const sortedChapters = Array.from(volume.chapters.entries()).sort(([a], [b]) => a - b)
      for (const [chapIdx, chapter] of sortedChapters) {
        const id = `chapter-${volIdx}-${chapIdx}`
        const href = `Text/volume${volIdx}_chapter${chapIdx}.xhtml`
        manifest += `        <item id="${id}" href="${href}" media-type="application/xhtml+xml"/>\n`
        manifestItems.push(id)
        spineItems.push(id)
      }
    }

    spine = spineItems.map((id) => `        <itemref idref="${id}"/>`).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
${metadata}    </metadata>
    <manifest>
${manifest}    </manifest>
    <spine toc="ncx">
${spine}
    </spine>
</package>`
  }

  _generateTocNcx() {
    const title = this.metadata.get('title')?.value || 'Untitled Book'
    const uuid = this.metadata.get('identifier')?.value || crypto.randomUUID()

    let navPoints = ''
    let playOrder = 1

    if (this.coverBuffer) {
      navPoints += `        <navPoint id="cover" playOrder="${playOrder++}">
            <navLabel><text>${this._t('cover')}</text></navLabel>
            <content src="Text/cover.xhtml"/>
        </navPoint>\n`
    }

    const sortedVolumes = Array.from(this.volumes.entries()).sort(([a], [b]) => a - b)
    for (const [volIdx, volume] of sortedVolumes) {
      if (volume.chapters.size > 1 || volume.options.alwaysShowVolumeTitle) {
        // Multiple chapters or forced volume display, create volume entry with sub-chapters
        const volumeLink = volume.options.createVolumePage
          ? `Text/volume${volIdx}_index.xhtml`
          : `Text/volume${volIdx}_chapter${Array.from(volume.chapters.keys()).sort((a, b) => a - b)[0]}.xhtml`

        navPoints += `        <navPoint id="volume-${volIdx}" playOrder="${playOrder++}">
            <navLabel><text>${volume.title}</text></navLabel>
            <content src="${volumeLink}"/>
`
        const sortedChapters = Array.from(volume.chapters.entries()).sort(([a], [b]) => a - b)
        for (const [chapIdx, chapter] of sortedChapters) {
          navPoints += `            <navPoint id="chapter-${volIdx}-${chapIdx}" playOrder="${playOrder++}">
                <navLabel><text>${chapter.title}</text></navLabel>
                <content src="Text/volume${volIdx}_chapter${chapIdx}.xhtml"/>
            </navPoint>\n`
        }
        navPoints += `        </navPoint>\n`
      } else {
        // Single chapter, use volume title as chapter title or volume page
        const chapIdx = Array.from(volume.chapters.keys())[0]
        const volumeLink = volume.options.createVolumePage ? `Text/volume${volIdx}_index.xhtml` : `Text/volume${volIdx}_chapter${chapIdx}.xhtml`

        navPoints += `        <navPoint id="volume-${volIdx}" playOrder="${playOrder++}">
            <navLabel><text>${volume.title}</text></navLabel>
            <content src="${volumeLink}"/>
        </navPoint>\n`

        // If volume has its own page, add chapter as sub-item
        if (volume.options.createVolumePage) {
          const chapter = volume.chapters.get(chapIdx)
          navPoints = navPoints.slice(0, -12) // Remove last </navPoint>\n
          navPoints += `            <navPoint id="chapter-${volIdx}-${chapIdx}" playOrder="${playOrder++}">
                <navLabel><text>${chapter.title}</text></navLabel>
                <content src="Text/volume${volIdx}_chapter${chapIdx}.xhtml"/>
            </navPoint>\n        </navPoint>\n`
        }
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">
    <head>
        <meta content="${uuid}" name="dtb:uid"/>
        <meta content="1" name="dtb:depth"/>
        <meta content="0" name="dtb:totalPageCount"/>
        <meta content="0" name="dtb:maxPageNumber"/>
    </head>
    <docTitle>
        <text>${title}</text>
    </docTitle>
    <navMap>
${navPoints}    </navMap>
</ncx>`
  }

  _generateNavXhtml() {
    const title = this.metadata.get('title')?.value || 'Untitled Book'

    let navItems = ''

    if (this.coverBuffer) {
      navItems += `            <li><a href="Text/cover.xhtml">${this._t('cover')}</a></li>\n`
    }

    const sortedVolumes = Array.from(this.volumes.entries()).sort(([a], [b]) => a - b)
    for (const [volIdx, volume] of sortedVolumes) {
      if (volume.chapters.size > 1 || volume.options.alwaysShowVolumeTitle) {
        const volumeLink = volume.options.createVolumePage
          ? `Text/volume${volIdx}_index.xhtml`
          : `Text/volume${volIdx}_chapter${Array.from(volume.chapters.keys()).sort((a, b) => a - b)[0]}.xhtml`

        navItems += `            <li>\n                <a href="${volumeLink}">${volume.title}</a>\n                <ol>\n`
        const sortedChapters = Array.from(volume.chapters.entries()).sort(([a], [b]) => a - b)
        for (const [chapIdx, chapter] of sortedChapters) {
          navItems += `                    <li><a href="Text/volume${volIdx}_chapter${chapIdx}.xhtml">${chapter.title}</a></li>\n`
        }
        navItems += `                </ol>\n            </li>\n`
      } else {
        const chapIdx = Array.from(volume.chapters.keys())[0]
        const volumeLink = volume.options.createVolumePage ? `Text/volume${volIdx}_index.xhtml` : `Text/volume${volIdx}_chapter${chapIdx}.xhtml`

        if (volume.options.createVolumePage) {
          // Volume has its own page, show as hierarchical
          const chapter = volume.chapters.get(chapIdx)
          navItems += `            <li>\n                <a href="${volumeLink}">${volume.title}</a>\n                <ol>\n`
          navItems += `                    <li><a href="Text/volume${volIdx}_chapter${chapIdx}.xhtml">${chapter.title}</a></li>\n`
          navItems += `                </ol>\n            </li>\n`
        } else {
          // Direct link to chapter with volume title
          navItems += `            <li><a href="${volumeLink}">${volume.title}</a></li>\n`
        }
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
        <title>${title} - ${this._t('tableOfContents')}</title>
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0"/>
    </head>
    <body>
        <nav epub:type="toc" id="toc">
            <h1>${this._t('tableOfContents')}</h1>
            <ol>
${navItems}            </ol>
        </nav>
    </body>
</html>`
  }

  _generateCoverXhtml() {
    if (!this.coverBuffer) return ''

    const title = this.metadata.get('title')?.value || 'Untitled Book'

    return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>${title} - ${this._t('cover')}</title>
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0"/>
        <style type="text/css">
            body { margin: 0; padding: 0; text-align: center; }
            .cover { width: 100%; height: 100vh; object-fit: contain; }
        </style>
    </head>
    <body>
        <img src="../Images/cover.${this.coverExtension}" alt="${this._t('cover')}" class="cover"/>
    </body>
</html>`
  }

  _formatXML(xmlString) {
    // Simple XML formatter to add proper indentation
    let formatted = ''
    let indent = ''
    const indentStep = '    ' // 4 spaces

    // Split by tags
    const tokens = xmlString.split(/(<[^>]*>)/)

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      if (!token) continue

      if (token.startsWith('</')) {
        // Closing tag - decrease indent
        indent = indent.substring(indentStep.length)
        formatted += indent + token + '\n'
      } else if (token.startsWith('<')) {
        if (token.endsWith('/>') || token.includes('<?xml') || token.includes('<!DOCTYPE')) {
          // Self-closing tag, XML declaration, or DOCTYPE - same indent
          formatted += indent + token + '\n'
        } else {
          // Opening tag - add at current indent, then increase
          formatted += indent + token + '\n'
          // Check if this is not immediately followed by a closing tag
          const nextToken = i + 1 < tokens.length ? tokens[i + 1].trim() : ''
          if (!nextToken.startsWith('</')) {
            indent += indentStep
          }
        }
      } else {
        // Text content
        if (token.length > 0) {
          formatted += indent + token + '\n'
        }
      }
    }

    return formatted.trim()
  }

  _generateVolumePageXhtml(volume, volIdx) {
    const globalCSS = this.cssFiles.get(0)
    let cssLinks = ''

    // Add global CSS if available
    if (globalCSS) {
      cssLinks += `        <link rel="stylesheet" type="text/css" href="../Styles/style0.css"/>\n`
    }

    let bodyContent = `        <h1>${volume.title}</h1>\n`

    // Add chapter list only if volumePageType is 'navigator'
    if (volume.options.volumePageType === 'navigator') {
      const sortedChapters = Array.from(volume.chapters.entries()).sort(([a], [b]) => a - b)
      if (sortedChapters.length > 0) {
        bodyContent += `        <h2>${this._t('chapters')}</h2>\n        <ul>\n`
        for (const [chapIdx, chapter] of sortedChapters) {
          bodyContent += `            <li><a href="volume${volIdx}_chapter${chapIdx}.xhtml">${chapter.title}</a></li>\n`
        }
        bodyContent += `        </ul>\n`
      }
    }
    // For 'blank' type, only the volume title (h1) is shown

    return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>${volume.title}</title>
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0"/>
${cssLinks}    </head>
    <body>
${bodyContent}    </body>
</html>`
  }

  _generateChapterXhtml(chapter, volIdx, chapIdx) {
    if (chapter.type === 'html' || chapter.type === 'xhtml') {
      // Content is already complete HTML/XHTML, use browser APIs to format properly
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(chapter.content, 'application/xhtml+xml')

        // Check for parsing errors
        const parserError = doc.querySelector('parsererror')
        if (parserError) {
          // Try parsing as HTML instead
          const htmlDoc = parser.parseFromString(chapter.content, 'text/html')

          // Ensure head element exists
          let head = htmlDoc.querySelector('head')
          if (!head) {
            head = htmlDoc.createElement('head')
            htmlDoc.documentElement.insertBefore(head, htmlDoc.body)
          }

          // Add title if missing
          let titleElement = head.querySelector('title')
          if (!titleElement) {
            titleElement = htmlDoc.createElement('title')
            titleElement.textContent = chapter.title
            head.insertBefore(titleElement, head.firstChild)
          }

          // Add viewport meta if missing
          let viewportMeta = head.querySelector('meta[name="viewport"]')
          if (!viewportMeta) {
            viewportMeta = htmlDoc.createElement('meta')
            viewportMeta.setAttribute('name', 'viewport')
            viewportMeta.setAttribute('content', 'width=device-width, height=device-height, initial-scale=1.0')
            head.appendChild(viewportMeta)
          }

          // Add global CSS if useGlobalCSS is true
          if (chapter.useGlobalCSS && this.cssFiles.has(0)) {
            const existingGlobalLink = head.querySelector('link[href="../Styles/style0.css"]')
            if (!existingGlobalLink) {
              const globalCssLink = htmlDoc.createElement('link')
              globalCssLink.setAttribute('rel', 'stylesheet')
              globalCssLink.setAttribute('type', 'text/css')
              globalCssLink.setAttribute('href', '../Styles/style0.css')
              head.appendChild(globalCssLink)
            }
          }

          // Add specific CSS files based on cssIdxs
          if (chapter.cssIdxs && Array.isArray(chapter.cssIdxs)) {
            for (const cssIdx of chapter.cssIdxs) {
              if (this.cssFiles.has(cssIdx)) {
                const existingLink = head.querySelector(`link[href="../Styles/style${cssIdx}.css"]`)
                if (!existingLink) {
                  const cssLink = htmlDoc.createElement('link')
                  cssLink.setAttribute('rel', 'stylesheet')
                  cssLink.setAttribute('type', 'text/css')
                  cssLink.setAttribute('href', `../Styles/style${cssIdx}.css`)
                  head.appendChild(cssLink)
                }
              }
            }
          }

          // Add visible title in body if no heading exists
          const body = htmlDoc.querySelector('body')
          if (typeof chapter.insertTitle === 'undefined' || chapter.insertTitle) {
            const existingHeading = body.querySelector('h1, h2, h3, h4, h5, h6')
            if (!existingHeading || chapter.insertTitle) {
              const chapterHeading = htmlDoc.createElement('h2')
              chapterHeading.textContent = chapter.title
              body.insertBefore(chapterHeading, body.firstChild)
            }
          }

          // Convert to XHTML format
          const serializer = new XMLSerializer()
          let result = serializer.serializeToString(htmlDoc.documentElement)

          // Add XML declaration if missing
          if (!result.startsWith('<?xml')) {
            result = '<?xml version="1.0" encoding="UTF-8"?>\n' + result
          }

          // Ensure XHTML namespace
          if (!result.includes('xmlns="http://www.w3.org/1999/xhtml"')) {
            result = result.replace('<html', '<html xmlns="http://www.w3.org/1999/xhtml"')
          }

          return this._formatXML(result)
        } else {
          // Valid XHTML, ensure head element exists
          let head = doc.querySelector('head')
          if (!head) {
            head = doc.createElement('head')
            doc.documentElement.insertBefore(head, doc.body)
          }

          // Add title if missing
          let titleElement = head.querySelector('title')
          if (!titleElement) {
            titleElement = doc.createElement('title')
            titleElement.textContent = chapter.title
            head.insertBefore(titleElement, head.firstChild)
          }

          // Add viewport meta if missing
          let viewportMeta = head.querySelector('meta[name="viewport"]')
          if (!viewportMeta) {
            viewportMeta = doc.createElement('meta')
            viewportMeta.setAttribute('name', 'viewport')
            viewportMeta.setAttribute('content', 'width=device-width, height=device-height, initial-scale=1.0')
            head.appendChild(viewportMeta)
          }

          // Add global CSS if useGlobalCSS is true
          if (chapter.useGlobalCSS && this.cssFiles.has(0)) {
            const existingGlobalLink = head.querySelector('link[href="../Styles/style0.css"]')
            if (!existingGlobalLink) {
              const globalCssLink = doc.createElement('link')
              globalCssLink.setAttribute('rel', 'stylesheet')
              globalCssLink.setAttribute('type', 'text/css')
              globalCssLink.setAttribute('href', '../Styles/style0.css')
              head.appendChild(globalCssLink)
            }
          }

          // Add specific CSS files based on cssIdxs
          if (chapter.cssIdxs && Array.isArray(chapter.cssIdxs)) {
            for (const cssIdx of chapter.cssIdxs) {
              if (this.cssFiles.has(cssIdx)) {
                const existingLink = head.querySelector(`link[href="../Styles/style${cssIdx}.css"]`)
                if (!existingLink) {
                  const cssLink = doc.createElement('link')
                  cssLink.setAttribute('rel', 'stylesheet')
                  cssLink.setAttribute('type', 'text/css')
                  cssLink.setAttribute('href', `../Styles/style${cssIdx}.css`)
                  head.appendChild(cssLink)
                }
              }
            }
          }

          // Add visible title in body if no heading exists
          const body = doc.querySelector('body')
          if (typeof chapter.insertTitle === 'undefined' && chapter.insertTitle) {
            const existingHeading = body.querySelector('h1, h2, h3, h4, h5, h6')
            if (!existingHeading || chapter.insertTitle) {
              const chapterHeading = doc.createElement('h2')
              chapterHeading.textContent = chapter.title
              body.insertBefore(chapterHeading, body.firstChild)
            }
          }

          // Serialize back to clean XHTML
          const serializer = new XMLSerializer()
          let result = serializer.serializeToString(doc)

          // Add XML declaration if missing
          if (!result.startsWith('<?xml')) {
            result = '<?xml version="1.0" encoding="UTF-8"?>\n' + result
          }

          return this._formatXML(result)
        }
      } catch (error) {
        // Fallback to original content if parsing fails
        console.warn('Failed to parse XHTML content:', error)
        return chapter.content
      }
    } else {
      // Content type is "text", wrap in basic XHTML structure
      const globalCSS = this.cssFiles.get(0)
      let cssLinks = ''

      if (chapter.useGlobalCSS && globalCSS) {
        cssLinks += `        <link rel="stylesheet" type="text/css" href="../Styles/style0.css"/>\n`
      }

      // Add specific CSS files based on cssIdxs
      if (chapter.cssIdxs && Array.isArray(chapter.cssIdxs)) {
        for (const cssIdx of chapter.cssIdxs) {
          if (this.cssFiles.has(cssIdx) && cssIdx !== 0) {
            // Skip global CSS if already added
            cssLinks += `        <link rel="stylesheet" type="text/css" href="../Styles/style${cssIdx}.css"/>\n`
          }
        }
      }

      let bodyContent = chapter.content

      // For text type, wrap in paragraph tags and convert newlines
      bodyContent = `        <p>${bodyContent.replace(/\n\n/g, '</p>\n        <p>').replace(/\n/g, '<br/>')}</p>`

      return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>${chapter.title}</title>
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0"/>
${cssLinks}    </head>
    <body>
        <h1>${chapter.title}</h1>
${bodyContent}
    </body>
</html>`
    }
  }

  async save() {
    // Add mimetype file first (MUST be uncompressed and first in ZIP)
    this.zip.file('mimetype', 'application/epub+zip', {
      compression: 'STORE',
    })

    // Create directory structure
    this.zip.folder('META-INF')
    this.zip.folder('OEBPS')
    this.zip.folder('OEBPS/Text')
    this.zip.folder('OEBPS/Styles')
    this.zip.folder('OEBPS/Images')

    // Compression options for all other files (except mimetype)
    const compressionOptions = {
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6,
      },
    }

    // Add META-INF/container.xml
    this.zip.file('META-INF/container.xml', this._generateContainer(), compressionOptions)

    // Add OEBPS files
    this.zip.file('OEBPS/content.opf', this._generateContentOpf(), compressionOptions)
    this.zip.file('OEBPS/toc.ncx', this._generateTocNcx(), compressionOptions)
    this.zip.file('OEBPS/nav.xhtml', this._generateNavXhtml(), compressionOptions)

    // Add cover image and page
    if (this.coverBuffer) {
      this.zip.file(`OEBPS/Images/cover.${this.coverExtension}`, this.coverBuffer, compressionOptions)
      this.zip.file('OEBPS/Text/cover.xhtml', this._generateCoverXhtml(), compressionOptions)
    }

    // Add downloaded images
    for (const [filename, imageData] of this.images) {
      this.zip.file(`OEBPS/Images/${filename}`, imageData.buffer, compressionOptions)
    }

    // Add CSS files
    for (const [idx, cssData] of this.cssFiles) {
      this.zip.file(`OEBPS/Styles/style${idx}.css`, cssData.content, compressionOptions)
    }

    // Add CSS map files
    for (const [path, content] of this.cssMap) {
      this.zip.file(`OEBPS/Styles/${path}`, content, compressionOptions)
    }

    // Add chapters and volume pages
    const sortedVolumes = Array.from(this.volumes.entries()).sort(([a], [b]) => a - b)
    for (const [volIdx, volume] of sortedVolumes) {
      // Generate volume page if createVolumePage is enabled
      if (volume.options.createVolumePage) {
        const volumeFilename = `OEBPS/Text/volume${volIdx}_index.xhtml`
        const volumeContent = this._generateVolumePageXhtml(volume, volIdx)
        this.zip.file(volumeFilename, volumeContent, compressionOptions)
      }

      // Generate chapters
      const sortedChapters = Array.from(volume.chapters.entries()).sort(([a], [b]) => a - b)
      for (const [chapIdx, chapter] of sortedChapters) {
        const filename = `OEBPS/Text/volume${volIdx}_chapter${chapIdx}.xhtml`
        const content = this._generateChapterXhtml(chapter, volIdx, chapIdx)
        this.zip.file(filename, content, compressionOptions)
      }
    }

    // Generate and return the EPUB buffer
    return await this.zip.generateAsync({
      type: 'arraybuffer',
    })
  }
}

class EpubVolume {
  constructor(idx, title, saver, options = {}) {
    this.idx = idx
    this.title = title
    this.saver = saver
    this.options = {
      alwaysShowVolumeTitle: false, // Controls whether single chapters show volume title in TOC
      createVolumePage: false, // Controls whether volume gets its own dedicated XHTML page
      volumePageType: 'navigator', // 'navigator' (show chapters) or 'blank' (only title) - only when createVolumePage is true
      ...options,
    }
    this.chapters = new Map()
  }

  async addChapter(idx, title, content, type = 'text', useGlobalCSS = false, cssIdxs = [], insertTitle = undefined) {
    // Process CSS links and download images from HTML/XHTML content
    let processedContent = content
    if (type === 'html' || type === 'xhtml') {
      processedContent = await this.saver._processCSSLinksInContent(content)
      processedContent = await this.saver._downloadImagesFromContent(processedContent)
    }

    this.chapters.set(idx, {
      title, // chapter title
      content: processedContent,
      type, // content_type
      useGlobalCSS,
      cssIdxs,
      insertTitle, // undefined -> auto detect || true -> always insert || false -> never insert
    })
  }
}
EpubSaver.version = '1.0.3'

if (globalThis.window === globalThis) {
  globalThis.EpubSaver = EpubSaver
}
if (typeof module !== 'undefined') {
  module.exports = {
    EpubSaver,
  }
}
