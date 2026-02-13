const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const menuClose = document.querySelector(".menu-close");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
  });
}

if (menuClose && mobileMenu) {
  menuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
}

mobileMenu?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    mobileMenu.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

const reviewSections = document.querySelectorAll("[data-google-reviews]");

const buildStars = (ratingValue) => {
  const rating = Math.round(Number(ratingValue) || 5);
  const stars = Array.from({ length: 5 }, (_, index) => {
    const filled = index < rating;
    return `
      <svg class="star ${filled ? "is-filled" : ""}" viewBox="0 0 24 24" aria-hidden="true">
        <polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,16.8 5.5,21 7.5,13.5 2,9 9,9" />
      </svg>
    `;
  }).join("");

  return `<div class="review-stars" aria-label="${rating}/5 stars">${stars}</div>`;
};

const buildReviewCard = (review) => {
  const author = review.author_name || "Google review";
  const rating = review.rating || 5;
  const text = review.text || "Trusted local service with honest advice.";
  const timeLabel = review.relative_time_description || "Recently";
  const avatarLetter = author ? author.trim()[0] : "G";

  return `
    <article class="review-card">
      <div class="review-header">
        <div class="review-avatar" aria-hidden="true">${avatarLetter}</div>
        <div class="review-meta">
          <strong>${author}</strong>
          <span class="review-source">Google Review - ${timeLabel}</span>
        </div>
      </div>
      ${buildStars(rating)}
      <p class="review-text">${text}</p>
    </article>
  `;
};

const loadGoogleReviews = (section) => {
  const fallbackTemplate = section.querySelector(".reviews-fallback");
  const fallbackMarkup = fallbackTemplate ? fallbackTemplate.innerHTML.trim() : "";

  const renderFallback = () => {
    if (fallbackMarkup) {
      section.innerHTML = fallbackMarkup;
    }
  };

  if (!window.google || !window.google.maps || !window.google.maps.places) {
    renderFallback();
    return;
  }

  const placeId = section.dataset.placeId;
  const maxReviews = Number.parseInt(section.dataset.max || "5", 10);
  const mapElement = document.getElementById("reviews-map");

  if (!placeId || !mapElement) {
    renderFallback();
    return;
  }

  const map = new window.google.maps.Map(mapElement, {
    center: { lat: -27.6, lng: 153.1 },
    zoom: 12,
  });

  const service = new window.google.maps.places.PlacesService(map);
  service.getDetails(
    {
      placeId,
      fields: ["reviews", "rating", "user_ratings_total", "name"],
    },
    (place, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place?.reviews) {
        renderFallback();
        return;
      }

      const reviews = [...place.reviews]
        .sort((a, b) => (b.time || 0) - (a.time || 0))
        .slice(0, maxReviews);

      if (reviews.length === 0) {
        renderFallback();
        return;
      }

      section.innerHTML = reviews.map(buildReviewCard).join("");
    }
  );
};

window.initReviews = () => {
  reviewSections.forEach(loadGoogleReviews);
};

const smsForms = document.querySelectorAll("[data-sms-form]");

smsForms.forEach((form) => {
  const submitButton = form.querySelector("[data-sms-submit]");

  const buildSms = () => {
    const name = form.querySelector("[name=\"name\"]")?.value?.trim() || "N/A";
    const phone = form.querySelector("[name=\"phone\"]")?.value?.trim() || "N/A";
    const vehicle = form.querySelector("[name=\"vehicle\"]")?.value?.trim() || "N/A";
    const issue = form.querySelector("[name=\"issue\"]")?.value?.trim() || "N/A";

    const message = [
      "Morgan's Mobile Mechanics enquiry",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Vehicle: ${vehicle}`,
      `Issue: ${issue}`,
    ].join("\n");

    const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const bodyParam = encodeURIComponent(message);
    const smsUrl = isApple
      ? `sms:0457005743&body=${bodyParam}`
      : `sms:0457005743?body=${bodyParam}`;

    window.location.href = smsUrl;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    buildSms();
  });

  submitButton?.addEventListener("click", buildSms);
});
