# Mintserve: Campaign Creation, Testing, & Ad Slot Injection Guide

This guide walks you through setting up a campaign in **Mintserve**, testing it on a publisher website, and explains how to integrate ad slots—either through **developer-defined static positions** or **dynamically injected between paragraphs/sections**.

---

## 1. Setup & Campaign Creation Flow

Before serving an ad, you must set up the Mintserve hierarchy. Follow these 4 steps in the Mintserve admin panel (`http://localhost:3000`):

### Step 1: Create an Advertiser
* Go to the **Admin** tab.
* Click **+ New Advertiser**.
* Enter a Brand Name (e.g., *Nike Athletics*) and Contact Email, then save.

### Step 2: Create an Order
* Go to the **Delivery** tab.
* Click **+ New Order**.
* Assign it to the Advertiser you created.
* Enter a Name (e.g., *Nike Summer Launch 2026*), name the Trafficker, and save.

### Step 3: Create an Ad Unit
* Go to the **Inventory** tab.
* Click **+ New Ad Unit**.
* Define a Slot Name (e.g., *Article_Leaderboard*) and dimensions (e.g., Width: `300`, Height: `250`).
* Set a Base Price Floor (e.g., `$1.50 CPM`), check the **Active** box, and save.
* **Copy the Ad Unit ID**: After saving, copy the generated hexadecimal ID (e.g., `646...`) from the inventory table.

### Step 4: Create a Line Item (The Campaign)
* Go to the **Delivery** tab.
* Click **+ New Line Item**.
* Select the **Order** you created in Step 2.
* Set campaign parameters:
  * **Priority**: Enter a numeric value (e.g., `1` for high priority sponsorships, `10` for house ads).
  * **Delivery Goal**: Choose CPM (impressions) or CPC (clicks) and set a total limit (e.g., `50000`).
  * **Targeting Rules**: Target specific devices (e.g., `Desktop`, `Mobile`) or geographical locations (e.g., `US`, `IN`).
  * **Targeted Ad Unit**: Choose the Ad Unit you created in Step 3.
  * **Creative URL**: Enter an image link to show (e.g., `https://images.unsplash.com/photo-1542291026-7eec264c27ff` for a shoe ad).
  * **Click Redirect URL**: Enter the advertiser destination page (e.g., `https://nike.com`).
* Set flight dates (ensure Start Date is today or earlier so it is active immediately) and click save.

---

## 2. Setting Up Ad Slots on a Website

Ad slots on a publisher website can be configured in two ways:

### Option A: Static Developer-Defined Slots
In this setup, you define a fixed HTML container in your page layout where you want the ad to load. 

```html
<!-- Fixed Sidebar Container -->
<div class="sidebar">
  <h3>Sponsored Links</h3>
  <div id="mintserve-sidebar-ad" style="width: 300px; height: 250px; background: #fafafa;">
    <!-- The script will inject the ad image here -->
  </div>
</div>
```

**Testing Code (JavaScript):**
```javascript
const API_URL = 'http://localhost:5000';
const adUnitId = 'YOUR_MAPPED_AD_UNIT_ID'; // Replace with real MongoDB ID

async function loadStaticAd() {
  try {
    const params = new URLSearchParams({ adUnitId, device: 'Desktop', geo: 'US' });
    const res = await fetch(`${API_URL}/api/serve?${params}`);
    if (!res.ok) return;
    
    const adData = await res.json();
    const container = document.getElementById('mintserve-sidebar-ad');
    
    // Inject image and attach click tracking
    container.innerHTML = `<img src="${adData.mediaUrl}" style="width:100%; height:100%; cursor:pointer;" />`;
    container.firstChild.onclick = () => window.open(adData.trackingPixels.clickUrl, '_blank');
    
    // Fire Impression Pixel
    const pixel = new Image();
    pixel.src = adData.trackingPixels.impressionUrl;
  } catch (err) {
    console.error("Ad failed to load", err);
  }
}
window.onload = loadStaticAd;
```

---

### Option B: Dynamic Injection Between Content Sections
If you are running a blog or news site, you don't need to hardcode ad containers in the layout. Instead, you can run a script that **automatically inserts ads between paragraphs** of an article.

For example, you want an ad to appear exactly after the second paragraph.

#### 1. The HTML Layout
```html
<article id="article-body">
  <p>Paragraph 1: Welcome to the Mintserve blog setup guide.</p>
  <p>Paragraph 2: Setting up ad delivery nodes helps monetize your user base.</p>
  <p>Paragraph 3: By dynamically injecting slots, you preserve layout spacing.</p>
  <p>Paragraph 4: Users get a seamless, integrated reading experience.</p>
</article>
```

#### 2. The Dynamic Injector Script
Add this JavaScript block to automatically locate paragraphs, create an ad container slot, insert it into the DOM, and request the ad:

```javascript
const API_URL = 'http://localhost:5000';
const AD_UNIT_ID = 'YOUR_MAPPED_AD_UNIT_ID'; // Replace with real MongoDB ID

function injectAdBetweenParagraphs() {
  const article = document.getElementById('article-body');
  if (!article) return;

  const paragraphs = article.getElementsByTagName('p');
  
  // Make sure we have at least 2 paragraphs to insert after the second one
  if (paragraphs.length >= 2) {
    // 1. Create a dynamic ad slot container
    const adSlot = document.createElement('div');
    adSlot.style.width = '300px';
    adSlot.style.height = '250px';
    adSlot.style.margin = '20px auto';
    adSlot.style.background = '#f8f9fa';
    adSlot.style.display = 'flex';
    adSlot.style.justifyContent = 'center';
    adSlot.style.alignItems = 'center';
    adSlot.style.border = '1px solid #dadce0';
    adSlot.style.borderRadius = '4px';
    adSlot.innerHTML = '<span style="font-size:12px; color:#5f6368">Loading Sponsored Ad...</span>';

    // 2. Insert the slot right after paragraph index 1 (the 2nd paragraph)
    paragraphs[1].parentNode.insertBefore(adSlot, paragraphs[1].nextSibling);

    // 3. Request the ad for this container
    fetchAdForSlot(adSlot);
  }
}

async function fetchAdForSlot(containerElement) {
  try {
    const params = new URLSearchParams({ adUnitId: AD_UNIT_ID, device: 'Desktop' });
    const response = await fetch(`${API_URL}/api/serve?${params}`);
    
    if (!response.ok) {
      containerElement.style.display = 'none'; // Hide if no ad is returned
      return;
    }

    const adData = await response.json();

    // Render ad and attach click track URL
    containerElement.innerHTML = `
      <div style="position:relative; width:100%; height:100%;">
        <span style="position:absolute; top:2px; right:4px; font-size:9px; color:#fff; background:rgba(0,0,0,0.5); padding:1px 4px; border-radius:2px;">Ad</span>
        <img src="${adData.mediaUrl}" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" />
      </div>
    `;
    containerElement.querySelector('img').onclick = () => {
      window.open(adData.trackingPixels.clickUrl, '_blank');
    };

    // Fire Impression tracking pixel
    const imgPixel = new Image();
    imgPixel.src = adData.trackingPixels.impressionUrl;

  } catch (error) {
    console.error("Error fetching ad for injected slot:", error);
    containerElement.style.display = 'none'; // Hide slot on error
  }
}

// Execute on page load
window.addEventListener('DOMContentLoaded', injectAdBetweenParagraphs);
```

---

## 3. Verifying & Troubleshooting

*   **Pacing & Analytics**: Once you click on an ad, check the **Reporting** and **Home** dashboard tabs in Mintserve. You will see the total impressions, clicks, CTR, and estimated revenue update in real-time.
*   **Ad Doesn't Display? Check these reasons**:
    1.  **Line Item Flight Dates**: Verify that the campaign start date is in the past, and end date is in the future.
    2.  **Status**: Verify that both the **Order** status is `Approved` and the **Line Item** status is `Active`.
    3.  **Caps & Limits**: Verify that the line item's delivered impressions/clicks are below the set total limit.
    4.  **Targeting Rules**: Ensure the parameters sent in the API request query (e.g. `device=Mobile` or `geo=US`) match the targeting conditions set on the Line Item.
