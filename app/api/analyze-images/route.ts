import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

interface Items {
  bedrooms: number;
  bathrooms: number;
  largeFurniture: number;
  tables: number;
  chairs: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route: analyze-images called');
    console.log('🚨 TEST LOG - This should appear in the server console');
    const { images } = await request.json();
    console.log('📸 Received images:', images);

    if (!images || !Array.isArray(images) || images.length === 0) {
      console.log('❌ No images provided');
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // If no API key is provided, return mock data for development
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('🚫 No OpenAI API key provided, returning mock data for', images.length, 'images');
      const mockData = {
        bedrooms: images.length, // Each photo counts as 1 bedroom
        bathrooms: Math.max(1, Math.floor(images.length * 0.6)), // At least 1 bathroom
        largeFurniture: Math.max(2, Math.floor(images.length * 2.5)), // At least 2 large items
        tables: Math.max(1, Math.floor(images.length * 1.8)), // At least 1 table
        chairs: Math.max(3, Math.floor(images.length * 3.2)), // At least 3 chairs
      };
      console.log('🎭 Returning mock data:', mockData);
      return NextResponse.json(mockData);
    }

    // Initialize OpenAI client only when we have a valid API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Analyze each image with OpenAI Vision API
    const imageAnalysisPromises = images.map(async (imageData: string) => {
      try {
        console.log('🔍 Analyzing image (base64 or URL):', imageData.substring(0, 50) + '...');
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this room photo and count furniture items. Categorize as:
- bedrooms: 1 (this photo represents 1 bedroom)
- bathrooms: count visible bathrooms/bathroom fixtures
- largeFurniture: sofas, beds, dressers, wardrobes, bookcases, large cabinets
- tables: dining tables, coffee tables, desks, nightstands, end tables
- chairs: dining chairs, office chairs, any seating furniture

Return ONLY a JSON object with these exact keys: {"bedrooms": 1, "bathrooms": 0, "largeFurniture": 0, "tables": 0, "chairs": 0}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        });

        const content = response.choices[0]?.message?.content;
        console.log('🤖 OpenAI response content:', content);
        
        if (!content) {
          throw new Error('No response content from OpenAI');
        }

        // Clean the content - remove markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Parse the JSON response
        const parsed = JSON.parse(cleanContent);
        console.log('📊 Parsed response:', parsed);
        
        // Validate the response has the expected structure
        const result: Items = {
          bedrooms: parsed.bedrooms || 1, // Default to 1 bedroom per photo
          bathrooms: parsed.bathrooms || 0,
          largeFurniture: parsed.largeFurniture || 0,
          tables: parsed.tables || 0,
          chairs: parsed.chairs || 0,
        };

        console.log('✅ Final result for image:', result);
        return result;
      } catch (error) {
        console.error('Error analyzing image:', error);
        // Return default values for this image if analysis fails
        return {
          bedrooms: 1,
          bathrooms: 0,
          largeFurniture: 0,
          tables: 0,
          chairs: 0,
        };
      }
    });

    // Wait for all image analyses to complete
    const imageResults = await Promise.all(imageAnalysisPromises);

    // Aggregate results across all images
    const aggregatedResults: Items = imageResults.reduce(
      (total, current) => ({
        bedrooms: total.bedrooms + current.bedrooms,
        bathrooms: total.bathrooms + current.bathrooms,
        largeFurniture: total.largeFurniture + current.largeFurniture,
        tables: total.tables + current.tables,
        chairs: total.chairs + current.chairs,
      }),
      { bedrooms: 0, bathrooms: 0, largeFurniture: 0, tables: 0, chairs: 0 }
    );

    return NextResponse.json(aggregatedResults);
  } catch (error) {
    console.error('Error in analyze-images API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze images' },
      { status: 500 }
    );
  }
}
