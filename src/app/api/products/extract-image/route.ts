import { NextRequest, NextResponse } from 'next/server';

// Store-specific price selectors and patterns
const STORE_SELECTORS = {
  'jysk': {
    selectors: [
      '.price-current',
      '.price .current',
      '.product-price',
      '[data-testid="price"]',
      '.price-regular',
      '.price-value'
    ],
    regex: /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)\s*(?:zł|PLN|€|EUR|\$|USD|,-)?/i
  },
  'ikea': {
    selectors: [
      '.pip-price__integer',
      '.notranslate',
      '[data-testid="price-current-price"]',
      '.price-module__current-price',
      '.price .sr-only',
      '.pip-price'
    ],
    regex: /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)\s*(?:zł|PLN|€|EUR|\$|USD|,-)?/i
  },
  'rtv': {
    selectors: [
      '.price-value',
      '.main-price',
      '.product-price',
      '[data-price]',
      '.price .integer',
      '.current-price'
    ],
    regex: /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)\s*(?:zł|PLN|€|EUR|\$|USD|,-)?/i
  },
  'castorama': {
    selectors: [
      '[data-testid="product-price"]',
      '.price',
      '.product-price',
      '.price-current',
      '[data-testid="price"]',
      '.main-price',
      '.current-price-value'
    ],
    regex: /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)\s*(?:zł|PLN|€|EUR|\$|USD|,-)?/i
  },
  'leroymerlin': {
    selectors: [
      '.price',
      '.product-price',
      '.price-current',
      '.main-price',
      '[data-testid="price"]',
      '.current-price'
    ],
    regex: /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)\s*(?:zł|PLN|€|EUR|\$|USD|,-)?/i
  },
  'agatameble': {
    selectors: [
      '.m-priceBox_price',
      '.m-priceBox_promo',
      '.is-promoColor',
      '.product-price',
      '.price-box',
      '.current-price'
    ],
    regex: /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)\s*(?:zł|PLN|€|EUR|\$|USD|,-)?/i
  },
  'default': {
    selectors: [
      '[class*="price"]',
      '[id*="price"]',
      '[data-price]',
      '[data-testid*="price"]',
      '.cost',
      '.amount',
      '.value',
      '[class*="cost"]',
      '[class*="amount"]'
    ],
    regex: /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)\s*(?:zł|PLN|€|EUR|\$|USD|,-)?/i
  }
};

function detectStore(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    console.log(`Detecting store for hostname: ${hostname}`);
    
    if (hostname.includes('jysk')) {
      console.log('Detected store: jysk');
      return 'jysk';
    }
    if (hostname.includes('ikea')) {
      console.log('Detected store: ikea');
      return 'ikea';
    }
    if (hostname.includes('rtv') || hostname.includes('euro')) {
      console.log('Detected store: rtv');
      return 'rtv';
    }
    if (hostname.includes('castorama')) {
      console.log('Detected store: castorama');
      return 'castorama';
    }
    if (hostname.includes('leroymerlin') || hostname.includes('leroy')) {
      console.log('Detected store: leroymerlin');
      return 'leroymerlin';
    }
    if (hostname.includes('agatameble') || hostname.includes('agata')) {
      console.log('Detected store: agatameble');
      return 'agatameble';
    }
    
    console.log('Using default store configuration');
    return 'default';
  } catch (error) {
    console.error('Error detecting store:', error);
    return 'default';
  }
}

function extractPrice(html: string, storeType: string): string | null {
  try {
    const storeConfig = STORE_SELECTORS[storeType as keyof typeof STORE_SELECTORS];
    
    console.log(`Attempting to extract price from ${storeType} store`);
    
    // Try CSS selectors first - more flexible approach
    for (const selector of storeConfig.selectors) {
      try {
        // Handle different selector types
        let pattern = '';
        
        if (selector.startsWith('[data-testid')) {
          // Handle data-testid selectors like [data-testid="product-price"]
          const testid = selector.match(/\[data-testid[=~*^$|]?["']([^"']+)["']\]/)?.[1];
          if (testid) {
            // More flexible pattern to capture full nested content
            pattern = `<[^>]*data-testid[=~*^$|]?["'][^"']*${testid}[^"']*["'][^>]*>([\s\S]*?)</[^>]*>`;
          }
        } else if (selector.startsWith('.')) {
          // Handle class selectors like .m-priceBox_price
          const className = selector.substring(1);
          pattern = `<[^>]+class[=~*^$|]?["'][^"']*${className.replace(/[-_]/g, '[-_]')}[^"']*["'][^>]*>([^<]*(?:<[^>]*>[^<]*</[^>]*>[^<]*)*)`;
        } else if (selector.startsWith('[class*="')) {
          // Handle attribute selectors like [class*="price"]
          const attr = selector.match(/\[class\*=["']([^"']+)["']\]/)?.[1];
          if (attr) {
            pattern = `<[^>]+class[=~*^$|]?["'][^"']*${attr}[^"']*["'][^>]*>([^<]*(?:<[^>]*>[^<]*</[^>]*>[^<]*)*)`;
          }
        }
        
        if (pattern) {
          const selectorRegex = new RegExp(pattern, 'gi');
          const matches = html.match(selectorRegex);
          
          if (matches) {
            for (const match of matches) {
              // Extract text content and clean it thoroughly
              let textContent = match.replace(/<[^>]*>/g, '').trim();
              
              // Comprehensive HTML entity cleaning
              textContent = textContent
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&hellip;/g, '...')
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
              
              console.log(`Trying to extract price from text: "${textContent}"`);
              
              // Try multiple regex approaches for different price formats
              const pricePatterns = [
                storeConfig.regex, // Original regex
                /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)/i, // Just number, no currency
                /^(\d+)/, // Just digits at start
                /(\d+(?:[,\.]\d{2})?)\s*(?:zł|PLN|€|EUR|\$|USD|,-)?/i, // Simple pattern
              ];
              
              for (const regex of pricePatterns) {
                const priceMatch = textContent.match(regex);
                
                if (priceMatch && priceMatch[1]) {
                  const foundPrice = priceMatch[1];
                  // Basic validation - price should be a reasonable number
                  const cleanPrice = foundPrice.replace(/[^\d.,]/g, '').replace(',', '.');
                  const numValue = parseFloat(cleanPrice);
                  
                  if (numValue > 0 && numValue < 1000000) { // reasonable price range
                    console.log(`Price found using selector ${selector}: ${foundPrice} (text: "${textContent}", regex: ${regex.source})`);
                    return foundPrice;
                  }
                }
              }
            }
          }
        }
      } catch (selectorError) {
        console.warn(`Error with selector ${selector}:`, selectorError);
        continue;
      }
    }
    
    // Enhanced fallback: search for common price patterns in HTML
    console.log('Trying enhanced fallback price detection...');
    
    // Special case for Castorama data-testid="product-price"
    if (storeType === 'castorama') {
      const castoramaPattern = /<[^>]*data-testid[^>]*=["'][^"']*product-price[^"']*["'][^>]*>([\s\S]*?)<\/[^>]*>/gi;
      const castoramaMatches = html.match(castoramaPattern);
      
      if (castoramaMatches) {
        for (const match of castoramaMatches) {
          let textContent = match.replace(/<[^>]*>/g, '').trim();
          textContent = textContent
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();
          
          console.log(`Castorama fallback - extracted text: "${textContent}"`);
          
          // Try to extract just the first number
          const numberMatch = textContent.match(/^(\d+)/);
          if (numberMatch && numberMatch[1]) {
            const foundPrice = numberMatch[1];
            const numValue = parseFloat(foundPrice);
            if (numValue > 0 && numValue < 1000000) {
              console.log(`Castorama fallback - price found: ${foundPrice}`);
              return foundPrice;
            }
          }
        }
      }
    }
    
    // Look for elements with "price" in class name containing numbers
    const priceElementPatterns = [
      /<[^>]+class[^>]*["'][^"']*price[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi,
      /<[^>]+data-[^>]*price[^>]*>([\s\S]*?)<\/[^>]+>/gi,
      /<[^>]+id[^>]*["'][^"']*price[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi
    ];
    
    for (const pattern of priceElementPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        for (const match of matches) {
          let textContent = match.replace(/<[^>]*>/g, '').trim();
          textContent = textContent
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Try multiple approaches to find price
          const pricePatterns = [
            storeConfig.regex,
            /(\d{1,3}(?:[,\s]\d{3})*(?:[,\.-]\d{0,2})?)/i,
            /^(\d+)/
          ];
          
          for (const regex of pricePatterns) {
            const priceMatch = textContent.match(regex);
            if (priceMatch && priceMatch[1]) {
              const foundPrice = priceMatch[1];
              const cleanPrice = foundPrice.replace(/[^\d.,]/g, '').replace(',', '.');
              const numValue = parseFloat(cleanPrice);
              if (numValue > 0 && numValue < 1000000) {
                console.log(`Price found using fallback pattern: ${foundPrice} (text: "${textContent}")`);
                return foundPrice;
              }
            }
          }
        }
      }
    }
    
    console.log(`No price found for ${storeType} store`);
    return null;
    
  } catch (error) {
    console.error('Error extracting price:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
             // Fetch the webpage content with better headers to avoid 403 errors
       const response = await fetch(url, {
         headers: {
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
           'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
           'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
           'Accept-Encoding': 'gzip, deflate, br',
           'Cache-Control': 'max-age=0',
           'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
           'Sec-Ch-Ua-Mobile': '?0',
           'Sec-Ch-Ua-Platform': '"Windows"',
           'Sec-Fetch-Dest': 'document',
           'Sec-Fetch-Mode': 'navigate',
           'Sec-Fetch-Site': 'none',
           'Sec-Fetch-User': '?1',
           'Upgrade-Insecure-Requests': '1',
           'DNT': '1',
           'Connection': 'keep-alive'
         },
         // Add timeout and redirect handling
         redirect: 'follow',
         signal: AbortSignal.timeout(15000), // 15 second timeout
         // Add referer to make it look more legitimate
         referrer: 'https://www.google.com/'
       });

      if (!response.ok) {
        // Provide more specific error messages
                 if (response.status === 403) {
           throw new Error('Strona zablokowała dostęp (403 Forbidden). Użyj opcji "wklej link do obrazka" poniżej.');
         } else if (response.status === 429) {
           throw new Error('Zbyt wiele żądań (429 Too Many Requests). Poczekaj chwilę i spróbuj ponownie.');
         } else if (response.status === 404) {
           throw new Error('Strona nie została znaleziona (404 Not Found). Sprawdź poprawność linku.');
         } else if (response.status === 503) {
           throw new Error('Serwis niedostępny (503 Service Unavailable). Strona może być przeciążona.');
         } else if (response.status === 502) {
           throw new Error('Błąd bramy (502 Bad Gateway). Problem z serwerem strony.');
         } else {
           throw new Error(`Błąd HTTP: ${response.status} ${response.statusText}`);
         }
      }

      const html = await response.text();
      
      // Detect store type and extract price
      const storeType = detectStore(url);
      const price = extractPrice(html, storeType);
      
      // Extract Open Graph image
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (ogImageMatch && ogImageMatch[1]) {
        const ogImageUrl = ogImageMatch[1];
        // Make sure the URL is absolute
        if (ogImageUrl.startsWith('//')) {
          return NextResponse.json({ image_url: `https:${ogImageUrl}`, price });
        } else if (ogImageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          return NextResponse.json({ image_url: `${urlObj.protocol}//${urlObj.host}${ogImageUrl}`, price });
        } else if (ogImageUrl.startsWith('http')) {
          return NextResponse.json({ image_url: ogImageUrl, price });
        }
      }

      // Extract Twitter Card image
      const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (twitterImageMatch && twitterImageMatch[1]) {
        const twitterImageUrl = twitterImageMatch[1];
        if (twitterImageUrl.startsWith('//')) {
          return NextResponse.json({ image_url: `https:${twitterImageUrl}`, price });
        } else if (twitterImageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          return NextResponse.json({ image_url: `${urlObj.protocol}//${urlObj.host}${twitterImageUrl}`, price });
        } else if (twitterImageUrl.startsWith('http')) {
          return NextResponse.json({ image_url: twitterImageUrl, price });
        }
      }

      // Extract first large image from the page
      const imgMatches = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
      if (imgMatches) {
        for (const imgMatch of imgMatches) {
          const srcMatch = imgMatch.match(/src=["']([^"']+)["']/i);
          if (srcMatch && srcMatch[1]) {
            const imgSrc = srcMatch[1];
            
            // Skip small images, icons, and common non-product images
            if (imgSrc.includes('icon') || imgSrc.includes('logo') || imgSrc.includes('avatar') || 
                imgSrc.includes('banner') || imgSrc.includes('ad') || imgSrc.includes('ads')) {
              continue;
            }

            // Make sure the URL is absolute
            let absoluteImgUrl = imgSrc;
            if (imgSrc.startsWith('//')) {
              absoluteImgUrl = `https:${imgSrc}`;
            } else if (imgSrc.startsWith('/')) {
              const urlObj = new URL(url);
              absoluteImgUrl = `${urlObj.protocol}//${urlObj.host}${imgSrc}`;
            } else if (!imgSrc.startsWith('http')) {
              const urlObj = new URL(url);
              absoluteImgUrl = `${urlObj.protocol}//${urlObj.host}/${imgSrc}`;
            }

            // Check if it's a valid image URL
            if (absoluteImgUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i)) {
              return NextResponse.json({ image_url: absoluteImgUrl, price });
            }
          }
        }
      }

      // If no image found, return null for image but still return price if found
      return NextResponse.json({ image_url: null, price });

    } catch (fetchError) {
      console.error('Error fetching webpage:', fetchError);
      
      // Handle specific error types
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Przekroczono limit czasu (10s). Strona ładuje się zbyt wolno.' },
            { status: 408 }
          );
        } else if (fetchError.message.includes('403')) {
          return NextResponse.json(
            { error: 'Strona zablokowała dostęp. Spróbuj innego linku lub skopiuj obrazek ręcznie.' },
            { status: 403 }
          );
        } else if (fetchError.message.includes('429')) {
          return NextResponse.json(
            { error: 'Zbyt wiele żądań. Poczekaj chwilę i spróbuj ponownie.' },
            { status: 429 }
          );
        } else {
          return NextResponse.json(
            { error: fetchError.message || 'Nie udało się pobrać zawartości strony' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Nie udało się pobrać zawartości strony' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
