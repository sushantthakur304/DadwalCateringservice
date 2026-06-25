const CONTACT_PHONE_DISPLAY = "+91 9817384661";
const CONTACT_PHONE_TEL = "+919817384661";
const CONTACT_WHATSAPP = "917042268912";
const SUPABASE_URL = "https://fjvpxzeaxbneedxhrwoh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdnB4emVheGJuZWVkeGhyd29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNjkzODAsImV4cCI6MjA5Nzk0NTM4MH0.7ZsBz4-e74Wmt4Zp7h2E2YJHhyZ-Z3ghefYkBZbyUEE";

const rates = {
  classic: 299,
  celebration: 449,
  royal: 699
};

const planNames = {
  classic: "Classic Family Gathering",
  celebration: "Celebration Wedding Feast",
  royal: "Royal Grand Function"
};

const menuSets = {
  wedding: [
    ["Welcome", "Tea, coffee, mocktails, fresh snacks"],
    ["Main Course", "Paneer, dal, rice, roti, seasonal sabzi"],
    ["Special Counters", "Live chaat, tandoor, sweets, desserts"],
    ["Dessert", "Gulab jamun, halwa, ice cream, fruit cream"]
  ],
  dham: [
    ["Traditional Start", "Rice, madra, rajma, dal, kadhi"],
    ["Serving Style", "Leaf plate style serving on request"],
    ["Himachali Flavor", "Meetha, chutney, pickles, seasonal items"],
    ["Best For", "Weddings, jagran, family functions, community meals"]
  ],
  party: [
    ["Snacks", "Noodles, tikki, spring rolls, pakora"],
    ["Mains", "Dal makhani, paneer, pulao, breads"],
    ["Kids Corner", "Mini bites, pasta, fries, soft drinks"],
    ["Sweet Finish", "Pastry, ice cream, brownie, fruit cream"]
  ]
};

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const bookingForm = document.querySelector("#bookingForm");
const guestsInput = document.querySelector("#guests");
const planSelect = document.querySelector("#plan");
const estimateOutput = document.querySelector("#estimate");
const bookingResult = document.querySelector("#bookingResult");
const eventDateInput = document.querySelector("#eventDate");
const menuTabs = document.querySelectorAll(".menu-tab");
const revealItems = document.querySelectorAll("[data-reveal]");

function formatCurrency(value) {
  return `Rs. ${new Intl.NumberFormat("en-IN").format(value)}`;
}

function updateEstimate() {
  const guests = Number.parseInt(guestsInput.value, 10) || 0;
  const rate = rates[planSelect.value] || rates.celebration;
  estimateOutput.textContent = formatCurrency(guests * rate);
}

function setMinimumDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  eventDateInput.min = `${yyyy}-${mm}-${dd}`;
}

function makeEnquiryText(data) {
  return [
    "Dadwal Catering Services booking enquiry",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Function: ${data.eventType}`,
    `Date: ${data.eventDate}`,
    `Guests: ${data.guests}`,
    `Plan: ${planNames[data.plan]}`,
    `Venue location: ${data.location || "Not shared"}`,
    `Service style: ${data.serviceStyle || "Buffet service"}`,
    `Estimated food budget: ${formatCurrency(Number(data.guests) * rates[data.plan])}`,
    `Menu notes: ${data.message || "No special notes"}`
  ].join("\n");
}

function makeWhatsAppUrl(message) {
  return `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function buildBookingPayload(data, estimatedBudget) {
  return {
    full_name: data.name.trim(),
    phone_number: data.phone.trim(),
    event_type: data.eventType,
    event_date: data.eventDate,
    guest_count: Number(data.guests),
    plan: data.plan,
    venue_location: data.location.trim() || null,
    service_style: data.serviceStyle || "Buffet service",
    menu_notes: data.message.trim() || null,
    estimated_budget: estimatedBudget,
    source: "website",
    status: "new",
    user_agent: navigator.userAgent
  };
}

async function saveBookingToSupabase(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/booking_enquiries`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Supabase insert failed");
  }
}

function updateMenu(menuKey) {
  const selectedMenu = menuSets[menuKey] || menuSets.wedding;
  const ids = [
    ["menuOneTitle", "menuOneText"],
    ["menuTwoTitle", "menuTwoText"],
    ["menuThreeTitle", "menuThreeText"],
    ["menuFourTitle", "menuFourText"]
  ];

  ids.forEach(([titleId, textId], index) => {
    document.getElementById(titleId).textContent = selectedMenu[index][0];
    document.getElementById(textId).textContent = selectedMenu[index][1];
  });
}

function copyText(text, button) {
  const finish = (label) => {
    button.textContent = label;
    window.setTimeout(() => {
      button.textContent = "Copy enquiry details";
    }, 1800);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => finish("Copied")).catch(() => finish("Copy unavailable"));
    return;
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.append(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    finish("Copied");
  } catch {
    finish("Copy unavailable");
  }
}

navToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll("[data-plan-link]").forEach((link) => {
  link.addEventListener("click", () => {
    planSelect.value = link.dataset.planLink;
    updateEstimate();
  });
});

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    menuTabs.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    updateMenu(tab.dataset.menu);
  });
});

document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const isOpen = question.classList.toggle("is-open");
    question.setAttribute("aria-expanded", String(isOpen));
    question.nextElementSibling.classList.toggle("is-open", isOpen);
  });
});

guestsInput.addEventListener("input", updateEstimate);
planSelect.addEventListener("change", updateEstimate);

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);
  const data = Object.fromEntries(formData.entries());
  const enquiryText = makeEnquiryText(data);
  const estimatedBudgetValue = Number(data.guests) * rates[data.plan];
  const estimatedBudget = formatCurrency(estimatedBudgetValue);
  const submitButton = bookingForm.querySelector(".form-submit");

  submitButton.disabled = true;
  submitButton.textContent = "Saving enquiry...";

  bookingResult.hidden = false;
  bookingResult.replaceChildren();

  const savingMessage = document.createElement("p");
  savingMessage.textContent = "Saving your booking enquiry securely...";
  bookingResult.append(savingMessage);

  try {
    await saveBookingToSupabase(buildBookingPayload(data, estimatedBudgetValue));
  } catch (error) {
    bookingResult.replaceChildren();

    const errorMessage = document.createElement("p");
    const errorStrong = document.createElement("strong");
    errorStrong.textContent = "Booking could not be saved.";
    errorMessage.append(errorStrong);

    const supportMessage = document.createElement("p");
    supportMessage.textContent = "Please call or copy the enquiry details and share them manually.";

    const actions = document.createElement("div");
    actions.className = "booking-actions";

    const callLink = document.createElement("a");
    callLink.className = "button call-enquiry";
    callLink.href = `tel:${CONTACT_PHONE_TEL}`;
    callLink.textContent = `Call ${CONTACT_PHONE_DISPLAY}`;

    const copyButton = document.createElement("button");
    copyButton.className = "button copy-enquiry";
    copyButton.type = "button";
    copyButton.textContent = "Copy enquiry details";
    copyButton.addEventListener("click", () => copyText(enquiryText, copyButton));

    actions.append(callLink, copyButton);
    bookingResult.append(errorMessage, supportMessage, actions);
    submitButton.disabled = false;
    submitButton.textContent = "Prepare booking enquiry";
    console.error(error);
    return;
  }

  bookingResult.replaceChildren();

  const heading = document.createElement("p");
  const headingStrong = document.createElement("strong");
  headingStrong.textContent = "Booking enquiry saved.";
  heading.append(headingStrong);

  const summary = document.createElement("p");
  summary.append(`${data.name}, your ${data.eventType.toLowerCase()} enquiry for ${data.guests} guests was stored successfully. Estimated food budget: `);
  const summaryStrong = document.createElement("strong");
  summaryStrong.textContent = estimatedBudget;
  summary.append(summaryStrong, ".");

  const actions = document.createElement("div");
  actions.className = "booking-actions";

  const whatsappLink = document.createElement("a");
  whatsappLink.className = "button whatsapp-enquiry";
  whatsappLink.href = makeWhatsAppUrl(enquiryText);
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noreferrer";
  whatsappLink.textContent = "Send on WhatsApp";

  const callLink = document.createElement("a");
  callLink.className = "button call-enquiry";
  callLink.href = `tel:${CONTACT_PHONE_TEL}`;
  callLink.textContent = `Call ${CONTACT_PHONE_DISPLAY}`;

  const copyButton = document.createElement("button");
  copyButton.className = "button copy-enquiry";
  copyButton.type = "button";
  copyButton.textContent = "Copy enquiry details";

  actions.append(whatsappLink, callLink, copyButton);
  bookingResult.append(heading, summary, actions);

  copyButton.addEventListener("click", () => copyText(enquiryText, copyButton));
  submitButton.disabled = false;
  submitButton.textContent = "Prepare booking enquiry";
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

setMinimumDate();
updateEstimate();
