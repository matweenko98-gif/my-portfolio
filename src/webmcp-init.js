const modelContext = (typeof navigator !== 'undefined' && navigator.modelContext) || 
                     (typeof document !== 'undefined' && document.modelContext);

if (modelContext) {
  const getPortfolioInfoTool = {
    name: 'get_portfolio_info',
    description: 'Get contact info, services, FAQ, and workflow details of Ksenia Matveenko.',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    execute: async () => {
      return {
        content: [{
          type: 'text',
          text: 'Ksenia Matveenko - Design & Development of Premium Websites.\nContact: contact@design-matweenko.vercel.app\nServices: UI/UX Design, Web Development, Branding.\nUNP: 193724000'
        }]
      };
    }
  };

  const navigateToSectionTool = {
    name: 'navigate_to_section',
    description: 'Scroll the browser view to a specific section of the portfolio page.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['services', 'cases', 'workflow', 'reviews', 'faq', 'contacts'],
          description: 'The section ID to scroll to'
        }
      },
      required: ['section']
    },
    execute: async (args) => {
      const element = document.getElementById(args.section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return {
          content: [{
            type: 'text',
            text: `Successfully scrolled to section: ${args.section}`
          }]
        };
      }
      return {
        content: [{
          type: 'text',
          text: `Section ${args.section} not found on the page.`
        }]
      };
    }
  };

  try {
    const controller = new AbortController();
    if (typeof window !== 'undefined') {
      window._webmcpController = controller;
    }

    if (typeof modelContext.registerTool === 'function') {
      modelContext.registerTool(getPortfolioInfoTool, { signal: controller.signal });
      modelContext.registerTool(navigateToSectionTool, { signal: controller.signal });
    }
    if (typeof modelContext.provideContext === 'function') {
      modelContext.provideContext({
        tools: [getPortfolioInfoTool, navigateToSectionTool]
      });
    }
  } catch (error) {
    console.error('Failed to register WebMCP tools:', error);
  }
}
