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
  
  // Extract title and meta description with better parsing
  const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
  const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
  
  // Extract headings for better content understanding
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
  
  // Extract specific business information
  const aboutSection = html.match(/(about us|about|who we are|our story|our mission)[^<]*<[^>]*>([^<]+)/gi);
  
  let title = titleMatch ? titleMatch[1].trim() : '';
  let description = descriptionMatch ? descriptionMatch[1].trim() : '';
  
  // Clean and improve title
  if (title) {
    title = title.replace(/\s*\|\s*.*$/, '').replace(/\s*-\s*.*$/, '').trim();
  }
  
  // Extract company name from title or headings
  let companyName = '';
  if (title) {
    const titleParts = title.split(/[-|–]/);
    companyName = titleParts[0].trim();
  }
  
  // Extract business focus from headings
  const headingText = [...h1Matches, ...h2Matches]
    .map(h => h.replace(/<[^>]*>/g, '').trim())
    .join(' ')
    .toLowerCase();
  
  // Enhanced industry detection
  const industryKeywords = {
    'technology': ['software', 'tech', 'digital', 'app', 'platform', 'saas', 'ai', 'automation', 'cloud', 'data'],
    'healthcare': ['health', 'medical', 'hospital', 'clinic', 'patient', 'care', 'wellness', 'therapy'],
    'finance': ['finance', 'banking', 'investment', 'financial', 'money', 'payment', 'fintech', 'trading'],
    'retail': ['retail', 'store', 'shop', 'ecommerce', 'marketplace', 'product', 'commerce'],
    'manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'supply', 'logistics'],
    'consulting': ['consulting', 'advisory', 'strategy', 'management', 'solutions', 'professional services'],
    'education': ['education', 'learning', 'training', 'school', 'university', 'course', 'academic'],
    'real estate': ['real estate', 'property', 'homes', 'commercial', 'residential', 'development'],
    'marketing': ['marketing', 'advertising', 'branding', 'agency', 'creative', 'digital marketing'],
    'legal': ['legal', 'law', 'attorney', 'lawyer', 'firm', 'litigation'],
    'nonprofit': ['nonprofit', 'charity', 'foundation', 'community', 'social impact']
  };
  
  let detectedIndustry = 'business';
  let industryScore = 0;
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    const score = keywords.filter(keyword => text.includes(keyword) || headingText.includes(keyword)).length;
    if (score > industryScore) {
      industryScore = score;
      detectedIndustry = industry;
    }
  }
  
  // Enhanced service extraction
  const serviceKeywords = [
    'consulting', 'development', 'design', 'marketing', 'analytics', 'automation', 
    'integration', 'support', 'training', 'strategy', 'implementation', 'optimization',
    'solutions', 'services', 'management', 'planning', 'research', 'analysis'
  ];
  
  const foundServices = serviceKeywords.filter(service => 
    text.includes(service) || headingText.includes(service)
  );
  
  // Better company description
  let companyDescription = description;
  
  if (!companyDescription || companyDescription.length < 20) {
    // Try to extract from about section or build from available data
    if (aboutSection && aboutSection.length > 0) {
      companyDescription = aboutSection[0].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (companyName && detectedIndustry !== 'business') {
      // Create meaningful description based on what we found
      const industryAdjectives = {
        'technology': 'technology solutions provider',
        'healthcare': 'healthcare services organization',
        'finance': 'financial services company',
        'consulting': 'professional consulting firm',
        'marketing': 'marketing and communications agency',
        'education': 'educational services provider'
      };
      
      companyDescription = `${companyName} is a ${industryAdjectives[detectedIndustry] || `${detectedIndustry} company`}`;
      
      if (foundServices.length > 0) {
        companyDescription += ` specializing in ${foundServices.slice(0, 2).join(' and ')}`;
      }
    }
  }
  
  // Extract key descriptive words from actual content
  const positiveWords = [
    'innovative', 'leading', 'expert', 'professional', 'trusted', 'reliable',
    'cutting-edge', 'advanced', 'comprehensive', 'specialized', 'experienced',
    'award-winning', 'industry-leading', 'premier', 'top-rated', 'established'
  ];
  
  const keyWords = positiveWords.filter(word => text.includes(word) || headingText.includes(word));
  
  return {
    companyDescription: companyDescription || `professional ${detectedIndustry} organization`,
    industry: detectedIndustry,
    services: foundServices.length > 0 ? foundServices.slice(0, 5) : ['professional services'],
    size: 'growing',
    keyWords: keyWords.length > 0 ? keyWords.slice(0, 3) : ['professional', 'experienced']
  };
}

serve(handler);