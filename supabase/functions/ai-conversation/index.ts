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
    
    // Extract business name - ULTRA SIMPLE detection
    if (!currentData.businessName && message.trim().length > 1) {
      // Accept any non-empty string as a business name
      const cleanName = message.trim()
      if (cleanName.length > 0 && !cleanName.includes('?') && cleanName.length < 100) {
        extractedData.businessName = cleanName
      }
    }

    // Extract industry - Simple detection
    if (!currentData.industry) {
      const industries = ['e-commerce', 'saas', 'digital marketing', 'agency', 'fintech', 'edtech', 'martech', 'creator', 'online business', 'digital agency', 'technology', 'tech', 'finance', 'consulting', 'education', 'marketing']
      const found = industries.find(ind => message.toLowerCase().includes(ind))
      if (found) extractedData.industry = found === 'tech' ? 'technology' : found
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
      response = "Hi! I'm Alex from Fractionl.ai. Let's quickly discover your AI potential.\n\nWhat's your company name?"
    } else if (!currentData.industry && !extractedData.industry) {
      response = `Thanks! What industry is ${extractedData.businessName || currentData.businessName} in?`
    } else if (!currentData.employeeCount && !extractedData.employeeCount) {
      response = "Got it! How many employees do you have?"
    } else {
      response = `Perfect! I have everything I need for ${currentData.businessName || extractedData.businessName}.\n\nGenerating your personalized AI roadmap now...`
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