const apiKey = "579b464db66ec23bdd00000188ee27e2c7b949544c2366566d9fea2b";
const baseURL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?format=json&api-key=" + apiKey;

const commoditySelect = document.getElementById("commodity");
const stateSelect = document.getElementById("state");
const resultsDiv = document.getElementById("results");
const paginationDiv = document.getElementById("pagination");

const locationRadios = document.querySelectorAll('input[name="location-mode"]');
const manualLocationDiv = document.getElementById("manual-location");

let currentPage = 1;
const resultsPerPage = 5;
let allResults = [];

locationRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (document.querySelector('input[name="location-mode"]:checked').value === "manual") {
      manualLocationDiv.style.display = "block";
    } else {
      manualLocationDiv.style.display = "none";
    }
  });
});

async function populateDropdowns() {
  const res = await fetch(baseURL + "&limit=1000");
  const data = await res.json();
  const commodities = new Set();
  const states = new Set();

  data.records.forEach(item => {
    if (item.commodity) commodities.add(item.commodity);
    if (item.state) states.add(item.state);
  });

  commoditySelect.innerHTML = '<option value="">--Select--</option>';
  Array.from(commodities).sort().forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    commoditySelect.appendChild(opt);
  });

  stateSelect.innerHTML = '<option value="">--Select State--</option>';
  Array.from(states).sort().forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    stateSelect.appendChild(opt);
  });
}

function paginateResults() {
  const start = (currentPage - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const paginatedResults = allResults.slice(start, end);

  resultsDiv.innerHTML = paginatedResults.map(item => `
    <div class="card">
      <strong>${item.commodity}</strong><br>
      Market: ${item.market}, ${item.state}<br>
      Price: ₹${item.modal_price} / kg
    </div>
  `).join('');

  updatePaginationControls();
}

function updatePaginationControls() {
  const totalPages = Math.ceil(allResults.length / resultsPerPage);
  paginationDiv.innerHTML = "";

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.innerHTML = "&lt;";
    prevButton.className = "page-btn";
    prevButton.onclick = () => {
      currentPage--;
      paginateResults();
    };
    paginationDiv.appendChild(prevButton);
  }

  const pageInfo = document.createElement("span");
  pageInfo.className = "page-info";
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationDiv.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.innerHTML = "&gt;";
    nextButton.className = "page-btn";
    nextButton.onclick = () => {
      currentPage++;
      paginateResults();
    };
    paginationDiv.appendChild(nextButton);
  }
}

async function getPrices() {
  const commodity = commoditySelect.value;
  if (!commodity) return alert("Please select a fruit/vegetable.");

  let selectedState = "";

  if (document.querySelector('input[name="location-mode"]:checked').value === "auto") {
    try {
      const loc = await fetch("https://ipapi.co/json").then(res => res.json());
      selectedState = loc.region; // may need to normalize state names for consistency
    } catch {
      alert("Unable to detect location. Please select it manually.");
      return;
    }
  } else {
    selectedState = stateSelect.value;
    if (!selectedState) return alert("Please select a state.");
  }

  resultsDiv.innerHTML = "Loading...";
  const url = `${baseURL}&filters[commodity]=${encodeURIComponent(commodity)}&filters[state]=${encodeURIComponent(selectedState)}&limit=100`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.records || data.records.length === 0) {
      resultsDiv.innerHTML = `<p>No prices found for "${commodity}" in ${selectedState}.</p>`;
      return;
    }

    const sortedPrices = data.records.sort((a, b) => parseFloat(a.modal_price) - parseFloat(b.modal_price));
    allResults = sortedPrices;

    paginateResults(); // Display the first page of results
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = "<p>Something went wrong. Try again.</p>";
  }
}

window.onload = populateDropdowns;


//<!-- Gemini Chat Script -->
const chatToggle = document.getElementById("chat-toggle");
const chatbox = document.getElementById("chatbox");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const messages = document.getElementById("messages");

const API_KEY = "AIzaSyDVcZtP3U7Bul8MnwoizkK93oaZ7Fks4-A";

const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Toggle chatbox visibility
chatToggle.addEventListener("click", () => {
  chatbox.style.display = chatbox.style.display === "flex" ? "none" : "flex";
});

sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  // Display user message
  messages.innerHTML += `<div class="message user">You: ${message}</div>`;
  messages.scrollTop = messages.scrollHeight;
  userInput.value = "";

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
            {
        text: `
You are Gemini, a smart chatbot assistant for the "Market Connect" platform. Your goal is to provide users with helpful answers in a simple and structured way.

Guidelines for your responses:

- Keep replies short and direct.
- Use plain text only. Avoid using markdown, emojis, or formatting like **bold** or bullet points.
- Focus on answering only what the user asks. Don’t over-explain.
- If the user asks for price or availability, give a sample price range and recommend using Market Connect for exact values.
- Avoid overly generic or technical replies.
- Be friendly, but professional.

Example:
User: What is the tomato price in Tamil Nadu?
You: Tomato prices in Tamil Nadu vary by location and quality. Typically, they range from ₹20–₹40 per kg. Check Market Connect for live prices near you.

User: ${message}
        `.trim()
      }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    let botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";

// Remove markdown characters like ** and *
botReply = botReply.replace(/\*\*/g, '').replace(/\*/g, '');


    messages.innerHTML += `<div class="message bot"><strong>Gemini:</strong> ${botReply}</div>`;
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    messages.innerHTML += `<div class="message bot"><strong>Gemini:</strong> Error occurred while replying.</div>`;
    console.error(error);
  }
});

// Allow "Enter" key to send message
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});
