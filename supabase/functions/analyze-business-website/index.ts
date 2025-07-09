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
  // Parse HTML more intelligently
  const parseContent = (html: string) => {
    // Extract structured content
    const title = extractTitle(html);
    const description = extractMetaDescription(html);
    const headings = extractHeadings(html);
    const paragraphs = extractParagraphs(html);
    const navigation = extractNavigation(html);
    
    return { title, description, headings, paragraphs, navigation };
  };

  const extractTitle = (html: string): string => {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) return '';
    
    let title = titleMatch[1].trim();
    // Clean common patterns
    title = title.replace(/\s*[-|–]\s*(Home|Welcome|Index).*$/i, '');
    title = title.replace(/\s*[-|–]\s*[^-|–]*\.(com|org|net|io).*$/i, '');
    return title;
  };

  const extractMetaDescription = (html: string): string => {
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    return descMatch ? descMatch[1].trim() : '';
  };

  const extractHeadings = (html: string): string[] => {
    const headingMatches = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
    return headingMatches
      .map(h => h.replace(/<[^>]*>/g, '').trim())
      .filter(h => h.length > 0 && h.length < 200);
  };

  const extractParagraphs = (html: string): string[] => {
    const paragraphMatches = html.match(/<p[^>]*>([^<]+(?:<[^/>][^<]*>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi) || [];
    return paragraphMatches
      .map(p => p.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 20 && p.length < 500)
      .slice(0, 10); // Limit to first 10 meaningful paragraphs
  };

  const extractNavigation = (html: string): string[] => {
    const navMatches = html.match(/<nav[^>]*>(.*?)<\/nav>/gis) || 
                      html.match(/<ul[^>]*class="[^"]*nav[^"]*"[^>]*>(.*?)<\/ul>/gis) || [];
    
    const navItems: string[] = [];
    navMatches.forEach(nav => {
      const linkMatches = nav.match(/<a[^>]*>([^<]+)<\/a>/gi) || [];
      linkMatches.forEach(link => {
        const text = link.replace(/<[^>]*>/g, '').trim().toLowerCase();
        if (text && text.length < 50) navItems.push(text);
      });
    });
    
    return [...new Set(navItems)]; // Remove duplicates
  };

  // Parse the content
  const content = parseContent(html);
  
  // Analyze industry with context scoring
  const analyzeIndustry = () => {
    const industryAnalysis = {
      'technology': {
        keywords: ['software', 'tech', 'digital', 'app', 'platform', 'saas', 'ai', 'machine learning', 'automation', 'cloud', 'data', 'api', 'development', 'coding', 'programming'],
        contextWords: ['innovation', 'scalable', 'cutting-edge', 'agile', 'DevOps', 'startup', 'fintech']
      },
      'healthcare': {
        keywords: ['health', 'medical', 'hospital', 'clinic', 'patient', 'care', 'wellness', 'therapy', 'treatment', 'diagnostic', 'pharmaceutical'],
        contextWords: ['healing', 'recovery', 'preventive', 'clinical', 'telemedicine', 'healthcare']
      },
      'finance': {
        keywords: ['finance', 'banking', 'investment', 'financial', 'money', 'payment', 'fintech', 'trading', 'insurance', 'loan', 'credit'],
        contextWords: ['wealth', 'portfolio', 'risk', 'capital', 'advisory', 'fiduciary']
      },
      'consulting': {
        keywords: ['consulting', 'advisory', 'strategy', 'management', 'solutions', 'professional services', 'expertise', 'guidance'],
        contextWords: ['transformation', 'optimization', 'best practices', 'methodology', 'frameworks']
      },
      'education': {
        keywords: ['education', 'learning', 'training', 'school', 'university', 'course', 'academic', 'teaching', 'curriculum'],
        contextWords: ['knowledge', 'skills', 'certification', 'degree', 'scholarship']
      },
      'marketing': {
        keywords: ['marketing', 'advertising', 'branding', 'agency', 'creative', 'digital marketing', 'seo', 'social media', 'campaign'],
        contextWords: ['engagement', 'conversion', 'awareness', 'reach', 'targeting']
      },
      'manufacturing': {
        keywords: ['manufacturing', 'production', 'factory', 'industrial', 'supply', 'logistics', 'assembly', 'quality control'],
        contextWords: ['efficiency', 'lean', 'automation', 'process', 'operations']
      },
      'retail': {
        keywords: ['retail', 'store', 'shop', 'ecommerce', 'marketplace', 'product', 'commerce', 'sales', 'inventory'],
        contextWords: ['customer', 'shopping', 'merchandise', 'fulfillment', 'distribution']
      }
    };

    const allText = [content.title, content.description, ...content.headings, ...content.paragraphs, ...content.navigation]
      .join(' ').toLowerCase();

    let bestIndustry = 'business';
    let bestScore = 0;

    Object.entries(industryAnalysis).forEach(([industry, analysis]) => {
      const keywordScore = analysis.keywords.filter(keyword => allText.includes(keyword)).length * 2;
      const contextScore = analysis.contextWords.filter(word => allText.includes(word)).length;
      const totalScore = keywordScore + contextScore;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestIndustry = industry;
      }
    });

    return bestIndustry;
  };

  // Extract services intelligently
  const extractServices = () => {
    const servicePatterns = [
      /we (provide|offer|deliver|specialize in|focus on) ([^.!?]+)/gi,
      /our (services|solutions|offerings) include ([^.!?]+)/gi,
      /(services|solutions):\s*([^.!?]+)/gi
    ];

    const discoveredServices: string[] = [];
    const allText = [content.description, ...content.paragraphs].join(' ');

    servicePatterns.forEach(pattern => {
      const matches = allText.matchAll(pattern);
      for (const match of matches) {
        const services = match[2].split(/,|and|\||•/)
          .map(s => s.trim().toLowerCase())
          .filter(s => s.length > 2 && s.length < 50);
        discoveredServices.push(...services);
      }
    });

    // Also check navigation for service indicators
    const serviceNavItems = content.navigation.filter(item => 
      ['services', 'solutions', 'products', 'consulting', 'support', 'training'].some(keyword => 
        item.includes(keyword)
      )
    );

    return [...new Set([...discoveredServices, ...serviceNavItems])].slice(0, 5);
  };

  // Generate intelligent company description
  const generateDescription = (industry: string, services: string[]) => {
    if (content.description && content.description.length > 30) {
      return content.description;
    }

    // Try to extract from key paragraphs
    const aboutParagraph = content.paragraphs.find(p => 
      /^(we are|we're|our company|our mission|our vision|about)/i.test(p.trim())
    );
    
    if (aboutParagraph && aboutParagraph.length > 50) {
      return aboutParagraph;
    }

    // Generate contextual description
    const companyName = extractCompanyName();
    const industryDescriptors = {
      'technology': 'innovative technology company',
      'healthcare': 'healthcare services provider',
      'finance': 'financial services organization',
      'consulting': 'professional consulting firm',
      'education': 'educational services provider',
      'marketing': 'marketing and communications agency',
      'manufacturing': 'manufacturing and production company',
      'retail': 'retail and commerce business'
    };

    let description = companyName ? 
      `${companyName} is a ${industryDescriptors[industry] || `${industry} company`}` :
      `A ${industryDescriptors[industry] || `${industry} organization`}`;

    if (services.length > 0) {
      description += ` specializing in ${services.slice(0, 2).join(' and ')}`;
    }

    return description;
  };

  const extractCompanyName = (): string => {
    // Try to get from title first
    if (content.title) {
      const titleParts = content.title.split(/[-|–]/);
      const potentialName = titleParts[0].trim();
      if (potentialName.length > 1 && potentialName.length < 50) {
        return potentialName;
      }
    }

    // Try to find in headings
    const companyHeading = content.headings.find(h => 
      h.length < 50 && !h.toLowerCase().includes('welcome') && !h.toLowerCase().includes('home')
    );

    return companyHeading || '';
  };

  // Extract meaningful keywords
  const extractKeywords = () => {
    const qualityWords = [
      'innovative', 'leading', 'expert', 'professional', 'trusted', 'reliable',
      'cutting-edge', 'advanced', 'comprehensive', 'specialized', 'experienced',
      'award-winning', 'industry-leading', 'premier', 'established', 'proven',
      'dedicated', 'committed', 'excellence', 'quality', 'custom', 'tailored'
    ];

    const allText = [content.title, content.description, ...content.headings].join(' ').toLowerCase();
    return qualityWords.filter(word => allText.includes(word)).slice(0, 3);
  };

  // Build final result
  const industry = analyzeIndustry();
  const services = extractServices();
  const description = generateDescription(industry, services);
  const keywords = extractKeywords();

  return {
    companyDescription: description,
    industry,
    services: services.length > 0 ? services : ['professional services'],
    size: 'growing', // This could be enhanced with employee count detection
    keyWords: keywords.length > 0 ? keywords : ['professional', 'experienced']
  };
}

serve(handler);