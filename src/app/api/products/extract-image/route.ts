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
      // Fetch the webpage content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
      return NextResponse.json(
        { error: 'Failed to fetch webpage content' },
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
