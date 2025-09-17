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
    const { message, conversationHistory, currentData } = await req.json()

    // Simple conversation intelligence
    const extractedData: any = {}
    
    // Extract business name
    if (!currentData.businessName && message.match(/(?:company|business|organization).+?(?:called|named|is)\s+(.+?)(?:\s|$|,|\.)/i)) {
      const match = message.match(/(?:company|business|organization).+?(?:called|named|is)\s+(.+?)(?:\s|$|,|\.)/i)
      if (match) extractedData.businessName = match[1].trim()
    } else if (!currentData.businessName && message.match(/^([A-Z][a-zA-Z\s&.,-]+)$/)) {
      extractedData.businessName = message.trim()
    }

    // Extract industry
    if (!currentData.industry && (message.includes('industry') || message.includes('sector'))) {
      const industries = ['healthcare', 'finance', 'technology', 'manufacturing', 'retail', 'education', 'consulting']
      const found = industries.find(ind => message.toLowerCase().includes(ind))
      if (found) extractedData.industry = found
    }

    // Extract employee count
    if (!currentData.employeeCount && message.match(/(\d+)\s*(?:employees?|people|staff)/i)) {
      const match = message.match(/(\d+)\s*(?:employees?|people|staff)/i)
      if (match) extractedData.employeeCount = parseInt(match[1])
    }

    // Extract AI use
    if (!currentData.currentAIUse && (message.includes('AI') || message.includes('artificial intelligence'))) {
      if (message.includes('none') || message.includes('not using')) {
        extractedData.currentAIUse = 'none - exploring possibilities'
      } else if (message.includes('pilot') || message.includes('testing')) {
        extractedData.currentAIUse = 'pilot projects in progress'
      } else {
        extractedData.currentAIUse = message.substring(0, 100) + '...'
      }
    }

    // Extract learning modality
    if (!currentData.learningModality) {
      if (message.includes('workshop') || message.includes('group') || message.includes('together')) {
        extractedData.learningModality = 'live-cohort'
      } else if (message.includes('self-paced') || message.includes('online') || message.includes('individual')) {
        extractedData.learningModality = 'self-paced'
      } else if (message.includes('coaching') || message.includes('one-on-one')) {
        extractedData.learningModality = 'coaching'
      }
    }

    // Extract success targets
    if (message.includes('goal') || message.includes('target') || message.includes('success')) {
      const targets = []
      if (message.includes('efficiency')) targets.push('operational efficiency')
      if (message.includes('innovation')) targets.push('innovation capability')
      if (message.includes('competitive')) targets.push('competitive advantage')
      if (targets.length) extractedData.successTargets = targets
    }

    // Generate appropriate response
    let response = ""
    let isComplete = false

    const dataCollected = Object.keys({ ...currentData, ...extractedData }).length

    if (!currentData.businessName && !extractedData.businessName) {
      response = "Great to meet you! What's your company called? I want to make sure I understand your organization properly."
    } else if (!currentData.industry && !extractedData.industry) {
      response = `Perfect, thanks for sharing about ${extractedData.businessName || currentData.businessName}! \n\nWhat industry are you in? This helps me understand the specific AI opportunities and challenges you might face.`
    } else if (!currentData.employeeCount && !extractedData.employeeCount) {
      response = "Got it! How many employees do you have? This helps me recommend the right scale of approach for your AI literacy program."
    } else if (!currentData.currentAIUse && !extractedData.currentAIUse) {
      response = "Excellent! Now, tell me about your current relationship with AI. Are you using any AI tools currently, running pilots, or is this completely new territory?"
    } else if (!currentData.learningModality && !extractedData.learningModality) {
      response = "That's really helpful context! When your team learns new skills, what format works best? Do you prefer live workshops where everyone learns together, self-paced online modules, or more hands-on coaching approaches?"
    } else if ((!currentData.successTargets || currentData.successTargets.length === 0) && !extractedData.successTargets) {
      response = "Perfect! One last question to make this really personalized - what are your top goals for AI transformation? Are you looking to boost efficiency, drive innovation, gain competitive advantage, or something else entirely?"
    } else {
      response = `🎉 Excellent! I now have a complete picture of ${currentData.businessName || extractedData.businessName}.\n\nBased on our conversation, I can see you're well-positioned for AI transformation. Let me pull together your personalized roadmap now...`
      isComplete = true
    }

    return new Response(
      JSON.stringify({ 
        message: response,
        extractedData,
        isComplete
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "I apologize, but I'm having trouble processing that. Could you try rephrasing your response?"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})