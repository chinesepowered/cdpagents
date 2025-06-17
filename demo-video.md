# 🎬 Demo Video Script: MCP Monetization Template

## Video Overview (5-7 minutes)
Showcase the complete payment loop: revenue in → payment out using x402 + CDP Wallet

---

## 📝 Script Outline

### Opening (30 seconds)
**Visual**: Beautiful dashboard homepage
**Narrator**: 
> "Welcome to the MCP Monetization Template - the winning solution for the x402pay + CDP Wallet hackathon. This template demonstrates how to build real-world, revenue-generating AI agents with composable payment infrastructure."

### Section 1: Architecture Overview (1 minute)
**Visual**: Architecture diagram with payment flow animation
**Narrator**:
> "Our template combines three key technologies: x402 protocol for HTTP micropayments, CDP Wallet for automated treasury management, and MCP servers for monetized AI tools. Let me show you how they work together."

**Show**: Payment flow diagram with animations:
1. Client requests premium tool
2. Server returns HTTP 402 with x402 instructions
3. Client submits USDC payment via CDP Wallet
4. x402 facilitator verifies payment
5. CDP Wallet distributes revenue automatically

### Section 2: Dashboard Demo (1.5 minutes)
**Visual**: Live dashboard walkthrough
**Narrator**:
> "The dashboard gives you complete visibility into your monetized MCP server. Here we can see real-time revenue metrics, usage analytics by tool, and wallet management features."

**Show**:
- Revenue metrics: $142.83 total revenue, 1,247 requests
- Tool performance breakdown
- Interactive charts showing revenue trends
- Payment flow demo animation
- Wallet balance and transaction history

### Section 3: MCP Server Demo (2 minutes)
**Visual**: Terminal showing MCP server + live API calls
**Narrator**:
> "Now let's see the MCP server in action. Our server hosts both free and paid tools, with automatic payment verification."

**Show**:
- Start MCP server: `npm run mcp:dev`
- List available tools (free echo + paid premium tools)
- Make a free tool call (echo service)
- Attempt paid tool call without payment → HTTP 402 response
- Submit payment and retry → successful response
- Show revenue distribution in real-time

### Section 4: Real-World Examples (1.5 minutes)
**Visual**: Quick demos of the example applications
**Narrator**:
> "We've built compelling real-world examples that demonstrate the power of this infrastructure."

**Show**:
- **AI Agent Marketplace**: Multiple AI agents with different pricing, automatic revenue sharing between creators and contributors
- **Bounty Board Bot**: Automated bounty system that collects entry fees and distributes prizes to winners
- **Micro-SaaS API**: Gated access with affiliate revenue splits

### Section 5: Amazon Bedrock Integration (45 seconds)
**Visual**: Bedrock-powered AI tool demo
**Narrator**:
> "For bonus points, we integrated Amazon Bedrock to provide premium AI capabilities with usage-based pricing."

**Show**:
- Configure Bedrock credentials
- Call premium AI completion tool
- Show cost calculation and revenue tracking
- Demonstrate content analysis tool

### Section 6: Composability & Developer Experience (45 seconds)
**Visual**: Code editor showing simple integration
**Narrator**:
> "The template is designed for maximum composability. Adding a new monetized tool takes just a few lines of code."

**Show**:
- Create custom tool with payment requirement
- Add revenue distribution configuration  
- Deploy and test immediately
- Show automatic payment verification

### Closing (30 seconds)
**Visual**: Summary slide with key achievements
**Narrator**:
> "This MCP Monetization Template demonstrates all the hackathon criteria: effective use of both x402 and CDP Wallet, complete payment loops, real-world relevance, composability, creativity, and clean technical execution. The future of AI agent monetization starts here."

**Show**:
- ✅ Complete payment loop: revenue in → payment out
- ✅ Real-world relevance: solves actual MCP monetization
- ✅ Composability: reusable flows and templates
- ✅ Creativity: novel financial primitives
- ✅ Technical excellence: production-ready code
- ✅ Amazon Bedrock integration (bonus)

---

## 🎥 Technical Requirements

### Screen Recording Setup
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Audio**: Clear narration with background music
- **Duration**: 5-7 minutes maximum

### Recording Sequence
1. **Dashboard Demo**: Full browser recording at localhost:3000
2. **Terminal Demo**: Split screen with terminal and browser
3. **Code Demo**: VS Code with syntax highlighting
4. **API Demo**: Postman or curl commands with responses

### Post-Production
- **Intro Animation**: Logo and title card
- **Transitions**: Smooth fades between sections
- **Annotations**: Call-out boxes for key features
- **Background Music**: Upbeat, professional
- **Outro**: Contact information and repository link

---

## 📊 Demo Data Preparation

### Before Recording
1. **Seed Dashboard**: Populate with realistic metrics
2. **Prepare Transactions**: Have sample transactions ready
3. **Test All Features**: Ensure everything works smoothly
4. **Clear Logs**: Clean terminal output for clarity

### Demo Script Commands
```bash
# Start the full demo
npm run demo

# Individual components
npm run dev        # Dashboard
npm run mcp:dev    # MCP Server

# Test API calls
curl -X POST http://localhost:3001 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'

# Show wallet info
curl http://localhost:3000/api/wallet
```

---

## 🏆 Key Demo Points to Highlight

### Hackathon Criteria Coverage
1. **x402 + CDP Integration**: Show both working together seamlessly
2. **Payment Loop**: Demonstrate complete revenue in → payment out
3. **Real-World Use**: Actual MCP monetization problem solved
4. **Composability**: Easy to extend and customize
5. **Creativity**: Novel approach to AI agent monetization
6. **Technical Quality**: Clean, documented, working code

### Unique Selling Points
- **Production Ready**: Not just a proof of concept
- **Beautiful UI**: Professional dashboard design
- **Multiple Examples**: Diverse use cases demonstrated
- **Optional Bedrock**: Bonus feature integration
- **Complete Documentation**: Ready for others to use

---

## 🎯 Call to Action

**End the video with:**
> "Ready to monetize your MCP server? Clone the repository, follow our setup guide, and start earning revenue from your AI tools in minutes. The future of composable, revenue-generating infrastructure is here!"

**Show final slide with:**
- GitHub repository URL
- Documentation link
- Contact information
- Hackathon submission details

---

## 📋 Pre-Recording Checklist

- [ ] All dependencies installed and working
- [ ] Environment variables configured
- [ ] Dashboard shows realistic demo data
- [ ] MCP server starts without errors
- [ ] All API endpoints respond correctly
- [ ] Payment flows work end-to-end
- [ ] Bedrock integration (if credentials available)
- [ ] Code examples are clean and commented
- [ ] Terminal has clean output
- [ ] Browser zoom set to appropriate level

---

## 🎬 Recording Tips

### For Screen Recording
- Use clean browser profile without extensions
- Hide bookmarks bar and unnecessary UI
- Set terminal to use clear, readable font
- Ensure good lighting for any camera shots

### For Narration
- Speak clearly and at moderate pace
- Leave pauses for visual demonstrations
- Emphasize key technical achievements
- Sound enthusiastic about the technology

### For Post-Production
- Add captions for accessibility
- Include GitHub repository link in description
- Create thumbnail with key technologies
- Export in multiple resolutions (1080p, 720p)

---

**Recording Target**: Create a compelling 5-7 minute video that showcases the complete MCP monetization solution and wins the hackathon! 🏆