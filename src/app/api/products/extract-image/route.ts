import { NextRequest, NextResponse } from 'next/server';

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
      
      // Extract Open Graph image
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (ogImageMatch && ogImageMatch[1]) {
        const ogImageUrl = ogImageMatch[1];
        // Make sure the URL is absolute
        if (ogImageUrl.startsWith('//')) {
          return NextResponse.json({ image_url: `https:${ogImageUrl}` });
        } else if (ogImageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          return NextResponse.json({ image_url: `${urlObj.protocol}//${urlObj.host}${ogImageUrl}` });
        } else if (ogImageUrl.startsWith('http')) {
          return NextResponse.json({ image_url: ogImageUrl });
        }
      }

      // Extract Twitter Card image
      const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (twitterImageMatch && twitterImageMatch[1]) {
        const twitterImageUrl = twitterImageMatch[1];
        if (twitterImageUrl.startsWith('//')) {
          return NextResponse.json({ image_url: `https:${twitterImageUrl}` });
        } else if (twitterImageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          return NextResponse.json({ image_url: `${urlObj.protocol}//${urlObj.host}${twitterImageUrl}` });
        } else if (twitterImageUrl.startsWith('http')) {
          return NextResponse.json({ image_url: twitterImageUrl });
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
              return NextResponse.json({ image_url: absoluteImgUrl });
            }
          }
        }
      }

      // If no image found, return null
      return NextResponse.json({ image_url: null });

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
