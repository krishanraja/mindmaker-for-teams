import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BusinessInfo {
  companyDescription?: string;
  industry?: string;
  services?: string[];
  size?: string;
  location?: string;
  keyWords?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessUrl } = await req.json();
    
    if (!businessUrl) {
      return new Response(
        JSON.stringify({ error: "Business URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the website content
    const response = await fetch(businessUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract business information from HTML
    const businessInfo: BusinessInfo = extractBusinessInfo(html);

    return new Response(
      JSON.stringify({ businessInfo }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error analyzing business website:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        businessInfo: {
          companyDescription: "innovative company",
          industry: "business",
          services: ["digital solutions"],
          keyWords: ["growth", "technology", "innovation"]
        }
      }),
      {
        status: 200, // Return 200 with fallback data instead of error
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

function extractBusinessInfo(html: string): BusinessInfo {
  // Remove HTML tags and get clean text
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  
  // Extract title and meta description
  const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
  const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
  
  const title = titleMatch ? titleMatch[1] : '';
  const description = descriptionMatch ? descriptionMatch[1] : '';
  
  // Industry detection based on keywords
  const industryKeywords = {
    'technology': ['software', 'tech', 'digital', 'app', 'platform', 'saas', 'ai', 'automation'],
    'healthcare': ['health', 'medical', 'hospital', 'clinic', 'patient', 'care'],
    'finance': ['finance', 'banking', 'investment', 'financial', 'money', 'payment'],
    'retail': ['retail', 'store', 'shop', 'ecommerce', 'marketplace', 'product'],
    'manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'supply'],
    'consulting': ['consulting', 'advisory', 'strategy', 'management', 'solutions'],
    'education': ['education', 'learning', 'training', 'school', 'university', 'course'],
    'real estate': ['real estate', 'property', 'homes', 'commercial', 'residential']
  };
  
  let detectedIndustry = 'business';
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      detectedIndustry = industry;
      break;
    }
  }
  
  // Extract services/offerings
  const serviceKeywords = [
    'services', 'solutions', 'consulting', 'development', 'design', 'marketing',
    'analytics', 'automation', 'integration', 'support', 'training', 'strategy'
  ];
  
  const foundServices = serviceKeywords.filter(service => text.includes(service));
  
  // Company size indicators
  let sizeIndicator = 'growing';
  if (text.includes('enterprise') || text.includes('corporation') || text.includes('global')) {
    sizeIndicator = 'enterprise';
  } else if (text.includes('startup') || text.includes('emerging')) {
    sizeIndicator = 'startup';
  }
  
  // Extract key descriptive words
  const positiveWords = [
    'innovative', 'leading', 'expert', 'professional', 'trusted', 'reliable',
    'cutting-edge', 'advanced', 'comprehensive', 'specialized', 'experienced'
  ];
  
  const keyWords = positiveWords.filter(word => text.includes(word));
  
  return {
    companyDescription: description || `${keyWords[0] || 'innovative'} ${detectedIndustry} company`,
    industry: detectedIndustry,
    services: foundServices.length > 0 ? foundServices : ['business solutions'],
    size: sizeIndicator,
    keyWords: keyWords.length > 0 ? keyWords : ['professional', 'innovative']
  };
}

serve(handler);