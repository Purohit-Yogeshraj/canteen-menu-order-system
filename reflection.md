# Reflection on AI-Assisted Development
## Canteen Menu & Order Queue System

During the development of my Canteen Menu & Order Queue System, I used Google Antigravity as an AI coding agent to analyze requirements, design the architecture, generate application code and assist with testing.

One important issue I identified during the planning stage was the difference between simulated real-time updates in the local mock environment and actual real-time synchronization in the production application. The initial architecture proposed a local mock engine with simulated real-time events alongside Supabase integration. Although this was useful for demonstrations, simulated updates alone would not prove that the actual customer, kitchen and display screens were synchronized through a shared database.

I noticed this potential problem while reviewing the proposed architecture and considering how the application would behave when multiple screens were opened simultaneously.

To address this, I clarified my instructions to the AI agent. I specified that mock mode and Supabase mode must follow the same business rules, that production must not silently fall back to mock data, and that actual real-time synchronization must be implemented and tested across separate browser windows.

This experience taught me that AI-generated code and architecture should not be accepted without reviewing the requirements and testing the results. Clear prompts, proper documentation and manual verification are important for developing a reliable application.

Overall, this project helped me understand how AI coding agents can accelerate software development while still requiring human supervision, critical thinking and testing.
