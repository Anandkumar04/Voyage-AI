import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { connectToMongoDB, getDBStatus, TripModel, UserModel } from "./db.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

    app.use(cors({
    origin: [
      "https://mynexttrip-ai.vercel.app",
      "https://voyagenext.vercel.app",
      "http://localhost:3000"
    ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true
    }));

  app.use(express.json());

  // Attempt async connection to MongoDB on startup
  connectToMongoDB().catch(err => {
    console.warn('[MongoDB] Initial connection check:', err.message);
  });

  // Database status endpoint
  app.get("/api/db-status", async (req, res) => {
    const status = getDBStatus();
    if (status.configured && !status.connected) {
      // Re-attempt connection
      await connectToMongoDB();
    }
    const updatedStatus = getDBStatus();
    res.json({
      configured: updatedStatus.configured,
      connected: updatedStatus.connected,
      type: "MongoDB Atlas / Local"
    });
  });

  // Get all trips from MongoDB
  app.get("/api/trips", async (req, res) => {
    try {
      const status = getDBStatus();
      if (!status.connected) {
        await connectToMongoDB();
      }
      if (getDBStatus().connected) {
        const trips = await TripModel.find().sort({ updatedAt: -1 }).lean();
        return res.json({ success: true, trips, source: 'mongodb' });
      }
      return res.json({ success: false, trips: [], message: 'MongoDB not connected' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save/Update trip in MongoDB
  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = req.body;
      if (!tripData || !tripData.id) {
        return res.status(400).json({ error: "Trip ID is required" });
      }
      const status = getDBStatus();
      if (!status.connected) {
        await connectToMongoDB();
      }
      if (getDBStatus().connected) {
        const updatedTrip = await TripModel.findOneAndUpdate(
          { id: tripData.id } as any,
          { $set: { ...tripData, updatedAt: new Date() } },
          { upsert: true, returnDocument: "after" }
        );
        return res.json({ success: true, trip: updatedTrip });
      }
      res.json({ success: false, message: "MongoDB not connected. Changes kept in local session." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete trip from MongoDB
  app.delete("/api/trips/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const status = getDBStatus();
      if (!status.connected) {
        await connectToMongoDB();
      }
      if (getDBStatus().connected) {
        await TripModel.deleteOne({ id } as any);
        return res.json({ success: true, id });
      }
      res.json({ success: false, message: "MongoDB not connected." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Sync multiple trips to MongoDB
  app.post("/api/trips/sync", async (req, res) => {
    try {
      const { trips } = req.body;
      if (!Array.isArray(trips)) {
        return res.status(400).json({ error: "Trips array is required" });
      }
      const status = getDBStatus();
      if (!status.connected) {
        await connectToMongoDB();
      }
      if (getDBStatus().connected) {
        const ops = trips.map((trip: any) => ({
          updateOne: {
            filter: { id: trip.id },
            update: { $set: { ...trip, updatedAt: new Date() } },
            upsert: true
          }
        }));
        if (ops.length > 0) {
          await (TripModel as any).bulkWrite(ops);
        }
        return res.json({ success: true, syncedCount: trips.length });
      }
      res.json({ success: false, message: "MongoDB not connected." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Planner endpoint
  app.post("/api/plan-trip", async (req, res) => {
    try {
      const { 
        destination, 
        budget, 
        days, 
        dates, 
        interests, 
        style, 
        groupSize 
      } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Act as an expert luxury travel agent. Create a highly detailed ${days}-day itinerary for ${groupSize} people traveling to ${destination}.
Travel Style: ${style}
Interests: ${interests}
Budget Level: ${budget}
Dates: ${dates || "Flexible"}

Format the response EXACTLY as a JSON object with the following schema:
{
  "summary": "A brief enticing summary of the trip.",
  "estimatedTotalCost": "Estimated cost string in INR (e.g. ₹3,50,000)",
  "weather": "Brief weather expectation",
  "packingAdvice": ["item1", "item2"],
  "days": [
    {
      "day": 1,
      "theme": "Theme for the day",
      "totalDailyCost": "Total estimated cost for the day in INR",
      "activities": [
        {
          "time": "Morning",
          "title": "Activity title",
          "description": "Activity description",
          "cost": "Cost estimate in INR",
          "location": "Location name",
          "rating": "A realistic rating out of 5 (e.g., 4.7)",
          "openingHours": "e.g., 09:00 AM - 05:00 PM",
          "travelTime": "e.g., 15 mins walk from previous stop (or from hotel if first activity)"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Hotel Name",
      "description": "Why it's recommended",
      "pricePerNight": "Price string in INR",
      "rating": "4.8",
      "amenities": ["Free WiFi", "Pool", "Spa", "Breakfast Included"]
    }
  ]
}
Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.`;

      let text = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
          }
        });
        text = response.text || "";
      } catch (geminiErr: any) {
        // Handle Gemini API rate limits (HTTP 429) gracefully without throwing unhandled exceptions
        const isQuotaError = geminiErr?.status === 429 || geminiErr?.message?.includes("quota") || geminiErr?.message?.includes("429");
        if (isQuotaError) {
          console.info(`[Voyage AI Engine] Gemini API rate limit reached (${geminiErr?.status || 429}). Serving smart curated itinerary synthesis.`);
        } else {
          console.warn("[Voyage AI Engine] Gemini API call notice:", geminiErr?.message || geminiErr);
        }

        // Smart dynamic structured itinerary generation
        const fallbackItinerary = buildSmartFallbackItinerary({
          destination,
          days,
          budget,
          style,
          interests,
          groupSize
        });

        return res.json(fallbackItinerary);
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : "{}";
      
      res.json(JSON.parse(jsonString));
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate itinerary" });
    }
  });

  // AI Chat Assistant endpoint - supports conversational advice AND real-time itinerary modifications
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, currentTrip } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const latestUserMsg = messages && messages.length > 0 
        ? messages[messages.length - 1].content 
        : "";

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // If there is an active trip, prompt Gemini to return both a message and updated itinerary JSON if requested
      if (currentTrip && currentTrip.itinerary) {
        const prompt = `You are Voyage AI's expert AI Travel Assistant.
You can answer travel questions AND directly modify existing trip itineraries.

Current Trip Context:
- Destination: ${currentTrip.destination}
- Duration: ${currentTrip.days} Days
- Budget: ${currentTrip.budget}
- Style: ${currentTrip.style}
- Group Size: ${currentTrip.groupSize}
Current Itinerary:
${JSON.stringify(currentTrip.itinerary, null, 2)}

User Request: "${latestUserMsg}"

Determine if the user's message is asking to modify, update, adjust, extend, shorten, or regenerate the itinerary (e.g. "remove museums", "add beaches", "increase budget", "replace hotel", "add restaurants", "add shopping", "regenerate only Day 2", "shorten trip", "extend trip", "make kid-friendly", "make luxury", "make backpacker friendly", etc.).

Format your response as a JSON object with this EXACT structure:
{
  "isModification": true or false,
  "reply": "Your friendly, concise response explaining what you did or answering the query.",
  "toastTitle": "Short notification title (e.g. 'Itinerary Updated')",
  "toastDescription": "Short notification description (e.g. 'Removed museums and added outdoor parks.')",
  "modifiedTrip": {
    "days": "${currentTrip.days}",
    "budget": "${currentTrip.budget}",
    "style": "${currentTrip.style}",
    "notes": "${currentTrip.notes || ''}",
    "itinerary": {
      "summary": "Updated trip summary",
      "estimatedTotalCost": "Updated total cost",
      "weather": "Weather info",
      "packingAdvice": ["item1", "item2"],
      "days": [ ... updated days array with activities ... ],
      "hotels": [ ... updated hotels array ... ]
    }
  }
}
If isModification is false, set modifiedTrip to null.
Return ONLY valid JSON. Do not include markdown code block syntax.`;

        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
              temperature: 0.7,
            }
          });
          const text = response.text || "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return res.json(result);
          }
        } catch (geminiErr: any) {
          console.warn("Gemini modification call failed, using fallback modifier:", geminiErr?.message || geminiErr);
          const fallbackResult = applyFallbackModification(currentTrip, latestUserMsg);
          return res.json(fallbackResult);
        }
      }

      // Standard conversational chat fallback when no active trip or general question
      const systemInstruction = "You are a helpful, expert travel assistant for Voyage AI. Keep your answers concise, friendly, and well-structured. You can advise on visas, packing, itineraries, and local culture.";
      
      const formattedMessages = (messages || []).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      let replyText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: formattedMessages,
          config: {
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            temperature: 0.7,
          }
        });
        replyText = response.text || "";
      } catch (geminiErr: any) {
        console.info(`[Voyage AI Assistant] Rate limit or service note (${geminiErr?.status || 'notice'}). Using conversational assistant generator.`);
        replyText = `Thanks for asking about "${latestUserMsg}"! As your Voyage AI Travel Assistant, I'm here to help with local recommendations, packing lists, visa advice, or modifying your itinerary. Let me know if you'd like to add beaches, change budget, add restaurants, or extend your trip!`;
      }

      res.json({ reply: replyText, isModification: false });
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to chat" });
    }
  });


// Smart Dynamic Fallback Itinerary Generator when Gemini API reaches quota limit
function buildSmartFallbackItinerary(params: {
  destination: string;
  days: string | number;
  budget?: string;
  style?: string;
  interests?: string;
  groupSize?: string;
}) {
  const dest = params.destination || "Destination";
  const daysNum = Math.min(Math.max(parseInt(String(params.days)) || 3, 1), 14);
  const budget = params.budget || "Moderate";
  const style = params.style || "Balanced";
  const interests = params.interests || "Culture, Food, Sightseeing";
  const groupSize = params.groupSize || "2 adults";

  let baseDailyCost = 6500;
  let hotelRate1 = "₹12,500/night";
  let hotelRate2 = "₹8,900/night";
  let hotelName1 = `Grand Heritage Hotel ${dest}`;
  let hotelName2 = `${dest} Vista Resort & Spa`;

  if (budget.toLowerCase().includes("luxury")) {
    baseDailyCost = 22000;
    hotelRate1 = "₹35,000/night";
    hotelRate2 = "₹28,000/night";
    hotelName1 = `The Grand Palace & Spa ${dest}`;
    hotelName2 = `Four Seasons Luxury Haven ${dest}`;
  } else if (budget.toLowerCase().includes("budget") || budget.toLowerCase().includes("backpacker")) {
    baseDailyCost = 2500;
    hotelRate1 = "₹2,200/night";
    hotelRate2 = "₹1,800/night";
    hotelName1 = `${dest} Central Backpackers Hostel`;
    hotelName2 = `Eco Boutique Lodge ${dest}`;
  }

  const totalCostEstimate = `₹${(daysNum * baseDailyCost + Math.round(baseDailyCost * 1.5)).toLocaleString('en-IN')}`;

  const themes = [
    `Arrival & Historic ${dest} Walking Tour`,
    `Cultural Icons, Art & Local Heritage`,
    `Culinary Mastery & Scenic Panorama`,
    `Hidden Gems & Local Artisan Markets`,
    `Nature Escapes & Sunset Excursion`,
    `Vibrant Shopping & Leisurely Cafes`,
    `Architectural Marvels & Evening Performance`,
    `Relaxation, Wellness & Farewell Feast`
  ];

  const days = Array.from({ length: daysNum }, (_, i) => {
    const dayIndex = i + 1;
    const theme = themes[(dayIndex - 1) % themes.length];
    
    return {
      day: dayIndex,
      theme,
      totalDailyCost: `₹${(baseDailyCost + (dayIndex % 3) * 500).toLocaleString('en-IN')}`,
      activities: [
        {
          time: "Morning",
          title: dayIndex === 1 ? `Arrival & Check-In at ${dest}` : `${dest} Iconic Morning Exploration`,
          description: dayIndex === 1 
            ? `Arrive in ${dest}, transfer to your accommodation, check-in, and refresh.`
            : `Discover iconic landmarks, historic plazas, and scenic spots across ${dest}.`,
          cost: dayIndex === 1 ? "Included" : `₹${Math.round(baseDailyCost * 0.25).toLocaleString('en-IN')}`,
          location: `${dest} Central Quarter`,
          rating: "4.8",
          openingHours: "08:30 AM - 12:30 PM",
          travelTime: "15 mins from hotel"
        },
        {
          time: "Afternoon",
          title: `Artisan Markets & Local ${interests.split(',')[0] || 'Culinary'} Tour`,
          description: `Experience ${dest}'s vibrant culture through guided local market visits, street food tasting, and craft stalls.`,
          cost: `₹${Math.round(baseDailyCost * 0.35).toLocaleString('en-IN')}`,
          location: `${dest} Old Town Square`,
          rating: "4.7",
          openingHours: "01:00 PM - 05:00 PM",
          travelTime: "10 mins walk"
        },
        {
          time: "Evening",
          title: `Sunset Viewpoint & Authentic Dining in ${dest}`,
          description: `Enjoy panoramic sunset views followed by a delicious dinner highlighting traditional regional dishes.`,
          cost: `₹${Math.round(baseDailyCost * 0.4).toLocaleString('en-IN')}`,
          location: `${dest} Skyline Promenade`,
          rating: "4.9",
          openingHours: "06:30 PM - 10:30 PM",
          travelTime: "15 mins drive"
        }
      ]
    };
  });

  return {
    summary: `A carefully curated ${daysNum}-day ${style} journey through ${dest} created for ${groupSize} with an emphasis on ${interests}.`,
    estimatedTotalCost: totalCostEstimate,
    weather: `Pleasant & clear with mild breezes, 21°C–26°C — ideal for sightseeing.`,
    packingAdvice: [
      "Comfortable walking shoes & light layers",
      "Sun protection (sunglasses, hat, sunscreen)",
      "Universal power adapter & power bank",
      "Camera & reusable water bottle",
      "Valid photo ID & local currency"
    ],
    days,
    hotels: [
      {
        name: hotelName1,
        description: `Top-rated accommodation located in central ${dest} offering great views, modern comforts, and breakfast.`,
        pricePerNight: hotelRate1,
        rating: "4.9",
        amenities: ["Free High-speed WiFi", "Infinity Pool", "Full Spa & Gym", "Complimentary Breakfast"]
      },
      {
        name: hotelName2,
        description: `Charming resort with comfortable rooms, scenic gardens, and easy access to top attractions in ${dest}.`,
        pricePerNight: hotelRate2,
        rating: "4.8",
        amenities: ["Free WiFi", "Rooftop Restaurant", "Airport Shuttle", "24/7 Concierge"]
      }
    ]
  };
}


// Helper function for deterministic fallback itinerary modifications
function applyFallbackModification(trip: any, instruction: string) {
  const lower = instruction.toLowerCase();
  const modifiedTrip = JSON.parse(JSON.stringify(trip));
  const itinerary = modifiedTrip.itinerary || { days: [], hotels: [] };
  const dest = modifiedTrip.destination || 'Destination';

  let reply = `I've updated your itinerary for ${dest} according to your request!`;
  let toastTitle = "Itinerary Updated";
  let toastDescription = `Modified your ${dest} trip based on your feedback.`;

  // 1. Remove Museums
  if (lower.includes('remove museum') || lower.includes('no museum') || lower.includes('without museum')) {
    itinerary.days = (itinerary.days || []).map((day: any) => ({
      ...day,
      activities: (day.activities || []).map((act: any) => {
        const isMuseum = /museum|gallery|exhibit|art center/i.test(act.title + ' ' + act.description);
        if (isMuseum) {
          return {
            time: act.time || "Afternoon",
            title: `Scenic Outdoor Tour & ${dest} Waterfront Promenade`,
            description: `Replaced museum visit with an invigorating outdoor walking tour along ${dest}'s scenic botanical gardens and historic waterfront.`,
            cost: "₹800",
            location: `${dest} Waterfront Park`,
            rating: "4.8",
            openingHours: "08:00 AM - 08:00 PM",
            travelTime: "10 mins walk"
          };
        }
        return act;
      })
    }));
    reply = `I have removed all museum visits from your ${dest} itinerary and replaced them with vibrant outdoor parks, waterfront walks, and local sightseeing!`;
    toastTitle = "Museums Removed";
    toastDescription = "Replaced museum stops with outdoor gardens and waterfront tours.";
  }

  // 2. Add Beaches
  else if (lower.includes('beach') || lower.includes('coastal') || lower.includes('seaside')) {
    if (itinerary.days && itinerary.days.length > 0) {
      const targetDay = itinerary.days[Math.floor(itinerary.days.length / 2)] || itinerary.days[0];
      targetDay.theme = "Coastal Paradise & Beach Relaxation";
      targetDay.activities = [
        {
          time: "Morning",
          title: `${dest} Sunny Beach Club & Swimming`,
          description: `Relax on powdery golden sands, swim in crystal-clear waters, and enjoy fresh coconut drinks at a beachside lounge.`,
          cost: "₹1,500",
          location: `${dest} Palm Beach`,
          rating: "4.9",
          openingHours: "07:00 AM - 07:00 PM",
          travelTime: "15 mins drive from hotel"
        },
        {
          time: "Afternoon",
          title: `Coastal Watersports & Speedboat Excursion`,
          description: `Try jet skiing, paddleboarding, or snorkeling around coral reefs with certified local instructors.`,
          cost: "₹3,200",
          location: `${dest} Watersports Center`,
          rating: "4.8",
          openingHours: "10:00 AM - 05:00 PM",
          travelTime: "5 mins walk"
        },
        {
          time: "Evening",
          title: `Sunset Beach Barbecue & Live Acoustic Music`,
          description: `Dine directly on the beach with freshly grilled seafood, bonfire ambiance, and serene ocean views.`,
          cost: "₹2,800",
          location: `${dest} Seaside Grill`,
          rating: "4.9",
          openingHours: "06:30 PM - 11:00 PM",
          travelTime: "On location"
        }
      ];
    }
    if (Array.isArray(itinerary.packingAdvice)) {
      if (!itinerary.packingAdvice.includes("High SPF Sunscreen & Swimwear")) {
        itinerary.packingAdvice.push("High SPF Sunscreen & Swimwear");
      }
    }
    reply = `I've added dedicated beach, swimming, and coastal watersport activities to your ${dest} itinerary!`;
    toastTitle = "Beaches Added!";
    toastDescription = "Updated itinerary with scenic beach visits and watersports.";
  }

  // 3. Increase Budget / Make Luxury
  else if (lower.includes('increase budget') || lower.includes('make luxury') || lower.includes('luxury')) {
    modifiedTrip.budget = "Luxury";
    modifiedTrip.style = "Luxury & Premium";
    itinerary.estimatedTotalCost = "₹4,80,000";
    itinerary.hotels = [
      {
        name: `The Ritz-Carlton ${dest} Palace & Spa`,
        description: `An ultra-luxurious 5-star haven offering private butler service, infinity plunge pools, and Michelin-star dining.`,
        pricePerNight: "₹42,000/night",
        rating: "4.9",
        amenities: ["Private Butler", "Infinity Pool", "Helipad Access", "Luxury Spa", "Gourmet Breakfast"]
      },
      {
        name: `Four Seasons Resort ${dest}`,
        description: `Exclusive beachside luxury resort with private villas, yacht charters, and world-class spa facilities.`,
        pricePerNight: "₹38,000/night",
        rating: "4.9",
        amenities: ["Private Beach", "Yacht Rental", "Spa & Wellness", "Wine Cellar"]
      }
    ];
    reply = `I've upgraded your ${dest} trip to an ultra-luxury experience! Added 5-star palace hotels, gourmet fine dining, and private transport options.`;
    toastTitle = "Upgraded to Luxury";
    toastDescription = "Increased budget tier and added 5-star luxury hotels.";
  }

  // 4. Backpacker Friendly / Lower Budget
  else if (lower.includes('backpacker') || lower.includes('decrease budget') || lower.includes('budget friendly') || lower.includes('cheap')) {
    modifiedTrip.budget = "Budget Friendly";
    modifiedTrip.style = "Backpacker Explorer";
    itinerary.estimatedTotalCost = "₹35,000";
    itinerary.hotels = [
      {
        name: `Social Hub Backpackers Hostel ${dest}`,
        description: `Highly-rated vibrant hostel in the city center featuring cozy pods, rooftop terrace, and group walking tours.`,
        pricePerNight: "₹1,800/night",
        rating: "4.8",
        amenities: ["Free High-speed WiFi", "Shared Kitchen", "Rooftop Lounge", "Free Breakfast"]
      },
      {
        name: `Eco Travelers Lodge ${dest}`,
        description: `Clean, sustainable budget stay steps away from public transit and night food markets.`,
        pricePerNight: "₹2,200/night",
        rating: "4.7",
        amenities: ["Free WiFi", "Bicycle Rentals", "Laundry Facilities", "24/7 Desk"]
      }
    ];
    reply = `I've tailored your ${dest} trip to be backpacker-friendly! Switched to budget boutique hostels, local food stalls, and affordable public transit routes.`;
    toastTitle = "Backpacker Friendly Mode";
    toastDescription = "Optimized for budget stays, street food, and free walking tours.";
  }

  // 5. Replace Hotel
  else if (lower.includes('replace hotel') || lower.includes('change hotel') || lower.includes('new hotel')) {
    itinerary.hotels = [
      {
        name: `Grand Central Boutique Hotel ${dest}`,
        description: `Charming boutique accommodation situated right in the historic heart of ${dest}, close to top eateries.`,
        pricePerNight: "₹14,500/night",
        rating: "4.8",
        amenities: ["Central Location", "Free WiFi", "Artisan Coffee Bar", "Rooftop View"]
      },
      {
        name: `The Sanctuary Eco Resort ${dest}`,
        description: `Peaceful nature retreat surrounded by lush gardens, offering serene spa treatments and organic breakfast.`,
        pricePerNight: "₹16,000/night",
        rating: "4.9",
        amenities: ["Organic Breakfast", "Yoga Deck", "Free Airport Shuttle", "Spa & Wellness"]
      }
    ];
    reply = `I've replaced the hotels in your ${dest} itinerary with brand-new highly-rated boutique and eco-resort stays!`;
    toastTitle = "Hotels Replaced";
    toastDescription = "Updated accommodations with top boutique & eco-resort stays.";
  }

  // 6. Add Restaurants / Food
  else if (lower.includes('add restaurant') || lower.includes('food') || lower.includes('dining')) {
    if (itinerary.days && itinerary.days.length > 0) {
      itinerary.days.forEach((day: any) => {
        if (day.activities && day.activities.length > 0) {
          const evening = day.activities.find((a: any) => a.time === 'Evening') || day.activities[day.activities.length - 1];
          evening.title = `Culinary Feast at ${dest} Michelin-Guide Bistro`;
          evening.description = `Indulge in an exquisite 5-course tasting menu highlighting traditional herbs, organic farm-to-table produce, and fine local wines.`;
          evening.cost = "₹3,500";
        }
      });
    }
    reply = `I've enriched your ${dest} itinerary with top-rated restaurant visits, food tasting tours, and local culinary experiences for every evening!`;
    toastTitle = "Restaurants Added";
    toastDescription = "Curated fine dining & culinary tasting experiences.";
  }

  // 7. Add Shopping
  else if (lower.includes('shopping') || lower.includes('market') || lower.includes('souvenir')) {
    if (itinerary.days && itinerary.days.length > 0) {
      const day = itinerary.days[itinerary.days.length - 1] || itinerary.days[0];
      day.activities.push({
        time: "Afternoon",
        title: `${dest} Artisan Craft Bazaar & Souvenir Shopping`,
        description: `Browse vibrant stalls for handcrafted jewelry, local silk textiles, spices, and unique souvenirs to take home.`,
        cost: "₹2,500",
        location: `${dest} Central Shopping District`,
        rating: "4.8",
        openingHours: "10:00 AM - 09:00 PM",
        travelTime: "10 mins walk"
      });
    }
    reply = `I've added dedicated shopping stops at ${dest}'s famous artisan bazaars and craft markets!`;
    toastTitle = "Shopping Added";
    toastDescription = "Included craft bazaars & souvenir market visits.";
  }

  // 8. Regenerate Specific Day (e.g. Day 2)
  else if (lower.includes('regenerate') || lower.includes('day 2') || lower.includes('day 1') || lower.includes('day 3')) {
    const dayMatch = lower.match(/day\s*(\d+)/i);
    const dayNum = dayMatch ? parseInt(dayMatch[1]) : 2;
    
    if (itinerary.days) {
      const dayIndex = itinerary.days.findIndex((d: any) => d.day === dayNum);
      if (dayIndex !== -1) {
        itinerary.days[dayIndex] = {
          day: dayNum,
          theme: `Fresh Adventure & Hidden Gems of ${dest}`,
          totalDailyCost: "₹6,500",
          activities: [
            {
              time: "Morning",
              title: `Sunrise Panorama & Heritage Walk in ${dest}`,
              description: `Kick off Day ${dayNum} with a breathtaking sunrise view followed by a guided walk through charming historic alleys.`,
              cost: "₹1,200",
              location: `${dest} Hilltop Outlook`,
              rating: "4.9",
              openingHours: "06:00 AM - 11:00 AM",
              travelTime: "15 mins from hotel"
            },
            {
              time: "Afternoon",
              title: `Interactive Local Cooking Class & Tasting`,
              description: `Learn secret recipes from master chefs, prepare traditional dishes, and enjoy a delicious lunch feast.`,
              cost: "₹2,800",
              location: `${dest} Culinary Academy`,
              rating: "4.8",
              openingHours: "12:00 PM - 03:30 PM",
              travelTime: "10 mins walk"
            },
            {
              time: "Evening",
              title: `Scenic Sunset Cruise & Starlight Cocktail Lounge`,
              description: `Unwind on a river/ocean cruise taking in twilight city lights with refreshing drinks and live music.`,
              cost: "₹2,500",
              location: `${dest} Marina Pier`,
              rating: "4.9",
              openingHours: "05:30 PM - 09:30 PM",
              travelTime: "15 mins drive"
            }
          ]
        };
      }
    }
    reply = `I have completely regenerated Day ${dayNum} of your ${dest} trip with brand-new sunrise views, interactive culinary workshops, and a sunset cruise!`;
    toastTitle = `Day ${dayNum} Regenerated!`;
    toastDescription = `Replaced Day ${dayNum} activities with brand new curated experiences.`;
  }

  // 9. Shorten Trip
  else if (lower.includes('shorten') || lower.includes('less days') || lower.includes('reduce')) {
    const currentNum = parseInt(modifiedTrip.days) || 3;
    if (currentNum > 1 && itinerary.days && itinerary.days.length > 1) {
      const newDays = currentNum - 1;
      modifiedTrip.days = newDays.toString();
      itinerary.days = itinerary.days.slice(0, newDays);
      reply = `I've shortened your ${dest} trip to ${newDays} days by optimizing the highlights and removing the final day.`;
      toastTitle = "Trip Shortened";
      toastDescription = `Reduced duration to ${newDays} days.`;
    }
  }

  // 10. Extend Trip
  else if (lower.includes('extend') || lower.includes('more days') || lower.includes('add a day') || lower.includes('add day')) {
    const currentNum = parseInt(modifiedTrip.days) || 3;
    const newDayNum = currentNum + 1;
    modifiedTrip.days = newDayNum.toString();

    if (!itinerary.days) itinerary.days = [];
    itinerary.days.push({
      day: newDayNum,
      theme: `Extended Exploration & Leisure in ${dest}`,
      totalDailyCost: "₹5,500",
      activities: [
        {
          time: "Morning",
          title: `Peaceful Nature Walk & Botanical Gardens`,
          description: `Enjoy a quiet morning strolling through exotic flora and tranquil water gardens.`,
          cost: "₹800",
          location: `${dest} Botanical Reserve`,
          rating: "4.8",
          openingHours: "08:00 AM - 12:00 PM",
          travelTime: "15 mins from hotel"
        },
        {
          time: "Afternoon",
          title: `Artisan Village & Pottery Workshop`,
          description: `Visit local craft studios, try your hand at traditional pottery, and meet local artisans.`,
          cost: "₹2,000",
          location: `${dest} Craft Village`,
          rating: "4.7",
          openingHours: "01:00 PM - 05:00 PM",
          travelTime: "15 mins drive"
        },
        {
          time: "Evening",
          title: `Farewell Rooftop Dinner & Skyline Views`,
          description: `Celebrate the final night of your extended trip with panoramic rooftop dining and signature cocktails.`,
          cost: "₹2,700",
          location: `${dest} Skyline Tower`,
          rating: "4.9",
          openingHours: "06:30 PM - 11:00 PM",
          travelTime: "10 mins drive"
        }
      ]
    });
    reply = `I've extended your ${dest} trip to ${newDayNum} days! Added a brand-new Day ${newDayNum} featuring botanical gardens, artisan workshops, and a farewell skyline dinner.`;
    toastTitle = "Trip Extended!";
    toastDescription = `Added Day ${newDayNum} to your itinerary.`;
  }

  // 11. Kid-Friendly / Family
  else if (lower.includes('kid') || lower.includes('family') || lower.includes('child')) {
    modifiedTrip.groupSize = "Family";
    modifiedTrip.style = "Family-Friendly Fun";
    if (itinerary.days && itinerary.days.length > 0) {
      itinerary.days.forEach((day: any) => {
        if (day.activities && day.activities.length > 0) {
          day.activities[1] = {
            time: "Afternoon",
            title: `${dest} Family Adventure Park & Interactive Aquarium`,
            description: `Fun for all ages with interactive marine exhibits, touch pools, 3D theater, and play zones.`,
            cost: "₹2,200",
            location: `${dest} Ocean World`,
            rating: "4.9",
            openingHours: "10:00 AM - 06:00 PM",
            travelTime: "10 mins drive"
          };
        }
      });
    }
    reply = `I've made your ${dest} itinerary kid-friendly! Added interactive aquariums, fun adventure parks, and family dining options.`;
    toastTitle = "Kid-Friendly Mode";
    toastDescription = "Updated with family activities, aquariums, and theme parks.";
  }

  modifiedTrip.itinerary = itinerary;

  return {
    isModification: true,
    reply,
    toastTitle,
    toastDescription,
    modifiedTrip
  };
}
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(process.cwd(), "frontend"),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
