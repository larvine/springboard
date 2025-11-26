const services = [
  {
    name: "결제 API",
    token: "sk_live_51MRL6blXCe2QwDY8A3yxadp4",
    created: "2023-10-01",
    updated: "2024-08-22",
    expires: "2025-03-31"
  },
  {
    name: "알림 센터",
    token: "sk_live_9HkUqmOP2ZZy44F7abc5610",
    created: "2022-06-14",
    updated: "2024-05-10",
    expires: "2024-12-31"
  },
  {
    name: "내부 통계",
    token: "sk_live_7XZ11hqWE9PLmn2944vB0",
    created: "2024-02-01",
    updated: "2024-09-05",
    expires: "2026-02-01"
  }
];

const container = document.getElementById("itemContainer");

services.forEach((service, index) => {
  const card = document.createElement("section");
  card.className = "item-card";

  const toggleId = `details-${index}`;
  card.innerHTML = `
    <button class="item-toggle" aria-expanded="false" aria-controls="${toggleId}">
      <div class="item-title">${service.name}</div>
      <div class="item-meta">
        <span class="meta-collapsed">만료 ${service.expires}</span>
        <div class="meta-expanded">
          <span>생성 ${service.created}</span>
          <span>업데이트 ${service.updated}</span>
          <span>만료 ${service.expires}</span>
        </div>
      </div>
      <span class="chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </button>
    <div class="item-content" id="${toggleId}">
      <div class="sub-cards">
        <article class="sub-card token-card">
          <span class="token-label">Token</span>
          <div class="token-value">${service.token}</div>
          <div class="action-buttons" role="group" aria-label="Token actions">
            <button type="button" class="action-button">Copy</button>
            <button type="button" class="action-button is-revoke">Revoke</button>
          </div>
        </article>
        <article class="sub-card details-card">
          <dl>
            <dt>서비스 이름</dt><dd>${service.name}</dd>
            <dt>생성일</dt><dd>${service.created}</dd>
            <dt>업데이트일</dt><dd>${service.updated}</dd>
            <dt>만료일</dt><dd>${service.expires}</dd>
          </dl>
        </article>
      </div>
    </div>
  `;

  container.appendChild(card);
});

const toggleCards = () => {
  document.querySelectorAll(".item-card").forEach((card) => {
    const button = card.querySelector(".item-toggle");
    const content = card.querySelector(".item-content");

    button.addEventListener("click", () => {
      const isOpen = card.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
      content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : "0px";
    });
  });
};

toggleCards();
