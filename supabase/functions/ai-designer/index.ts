import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, extractedDesign, currentStyle } = await req.json()
    const apiKey = Deno.env.get('LOVABLE_API_KEY')

    // Initial suggestion based on deterministic pixel analysis
    let designSuggestion = {
      visual_style: 'modern',
      primary_color: extractedDesign?.primary || '#7c3aed',
      secondary_color: extractedDesign?.secondary || '#10b981',
      background_color: extractedDesign?.background || '#ffffff',
      text_color: extractedDesign?.text || '#1f2937',
      font_family: 'Outfit',
      header_style: 'standard',
      border_radius: '1.5rem'
    }

    if (apiKey) {
      try {
        const response = await fetch('https://api.lovable.app/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are a high-end UI/UX Designer. Analyze the image and the extracted color data to suggest a COMPLETE professional Design System for a restaurant digital menu.
                Extracted Data: ${JSON.stringify(extractedDesign)}
                Rules: 
                - If the image is premium/dark, suggest 'premium' style.
                - If it's craft/warm, suggest 'artesanal'.
                - If it's clean/tech, suggest 'modern' or 'minimalista'.
                Return ONLY JSON with these keys: visual_style, primary_color, background_color, text_color, font_family, header_style, border_radius.`
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Suggest the best design system for this brand.' },
                  { type: 'image_url', image_url: { url: image } }
                ]
              }
            ],
            response_format: { type: 'json_object' }
          })
        })
        
        const aiData = await response.json()
        if (aiData.choices?.[0]?.message?.content) {
          const aiDesign = JSON.parse(aiData.choices[0].message.content)
          designSuggestion = { ...designSuggestion, ...aiDesign }
        }
      } catch (aiError) {
        console.error("AI Gateway Error:", aiError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        design: designSuggestion
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
