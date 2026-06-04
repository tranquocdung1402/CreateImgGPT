const form = document.querySelector("#routePromptForm");
const output = document.querySelector("#routePromptOutput");
const copyButton = document.querySelector("#copyRoutePromptButton");
const copyNotice = document.querySelector("#routeCopyNotice");
const durationInput = form.elements.duration;
const titleInput = form.elements.title;
const routeItinerarySummary = document.querySelector("#routeItinerarySummary");
const routeDays = document.querySelector("#routeDays");
let copyNoticeTimer;
let lastAutoTitle = "";

const defaultRouteDays = [
  ["Đà Nẵng city", "biển Mỹ Khê", "bán đảo Sơn Trà", "chùa Linh Ứng", "Cầu Rồng"],
  ["Phố cổ Hội An", "rừng dừa Bảy Mẫu", "sông Hoài", "phố đèn lồng"],
  ["Bà Nà Hills", "Cầu Vàng", "làng Pháp"],
  ["Ngũ Hành Sơn", "làng đá Non Nước", "thánh địa Mỹ Sơn"],
  ["Chợ Hàn", "mua sắm đặc sản", "sân bay"]
];

function get(name) {
  return (form.elements[name]?.value || "").trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseDuration(value) {
  const numbers = String(value).match(/\d+/g)?.map(Number) || [];
  const days = Math.max(numbers[0] || 5, 1);
  const nights = Math.max(numbers[1] ?? Math.max(days - 1, 0), 0);
  return { days, nights };
}

function buildAutoTitle() {
  const trip = parseDuration(durationInput.value);
  return `越南中部${trip.days}天${trip.nights}夜路线规划`;
}

function syncTitleWithDuration() {
  const nextTitle = buildAutoTitle();
  if (!titleInput.value.trim() || titleInput.value.trim() === lastAutoTitle) {
    titleInput.value = nextTitle;
  }
  lastAutoTitle = nextTitle;
}

function defaultPlacesForDay(day) {
  return defaultRouteDays[(day - 1) % defaultRouteDays.length];
}

function getRouteDays() {
  return [...routeDays.querySelectorAll(".route-day-card")].map((card, index) => {
    const day = Number(card.dataset.day || index + 1);
    const places = [...card.querySelectorAll(".route-place-input")]
      .map((input) => input.value.trim())
      .filter(Boolean);
    return { day, places };
  });
}

function routePlaceRowTemplate(value = "") {
  return `<div class="route-place-row">
    <input class="route-place-input" value="${escapeHtml(value)}" placeholder="Nhập địa điểm / hoạt động chính" />
    <button class="icon-button remove-route-place" type="button" aria-label="Xóa địa điểm">-</button>
  </div>`;
}

function routeDayTemplate(day, places) {
  const rows = (places.length ? places : [""]).map((place) => routePlaceRowTemplate(place)).join("");
  return `<article class="route-day-card" data-day="${day}">
    <div class="route-day-title">
      <h3>Day ${day} / 第${day}天</h3>
      <button class="secondary-button compact-button add-route-place" type="button">+ Thêm địa điểm</button>
    </div>
    <div class="route-place-rows">${rows}</div>
  </article>`;
}

function renderRouteDays(options = {}) {
  const trip = parseDuration(durationInput.value);
  const existingDays = options.reset ? [] : getRouteDays();
  const days = Array.from({ length: trip.days }, (_, index) => {
    const day = index + 1;
    return {
      day,
      places: existingDays[index]?.places?.length ? existingDays[index].places : defaultPlacesForDay(day)
    };
  });

  routeItinerarySummary.innerHTML = `<strong>${trip.days} ngày / ${trip.nights} đêm</strong><span>${days.map((day) => `Day ${day.day}`).join(" · ")}</span>`;
  routeDays.innerHTML = days.map((day) => routeDayTemplate(day.day, day.places)).join("");
}

function formatRouteDaysForPrompt() {
  return getRouteDays()
    .map((day) => {
      const places = day.places.length ? day.places.join(" -> ") : "chưa nhập địa điểm";
      return `Day ${day.day} / 第${day.day}天: ${places}.`;
    })
    .join("\n");
}

function formatRouteHighlightsForPrompt() {
  const places = getRouteDays().flatMap((day) => day.places);
  const uniquePlaces = [...new Set(places)];
  return uniquePlaces.length ? uniquePlaces.join(", ") : "chưa nhập điểm nổi bật từ lịch trình";
}

function buildRouteMapPrompt() {
  return `Hãy đóng vai một chuyên gia thiết kế infographic bản đồ du lịch và chuyên gia thiết kế lịch trình du lịch cao cấp.

Ngôn ngữ hiển thị trong ảnh: Tiếng Trung Quốc Giản thể.

Nhiệm vụ:
Tạo một ảnh infographic dạng bản đồ tuyến đường du lịch, tham khảo tinh thần layout của ảnh mẫu route map: bản đồ lớn, tuyến đường nét đứt, pin địa điểm, card ngày và các box phụ về ẩm thực/tips.

Thông tin chính:
- Điểm đến: ${get("destination")}
- Thời lượng: ${get("duration")}
- Title gợi ý: "${get("title")}"
- Tagline gợi ý: "${get("tagline")}"

Nội dung lịch trình nguồn:
${formatRouteDaysForPrompt()}

Điểm nổi bật tự động từ các block lịch trình:
${formatRouteHighlightsForPrompt()}

Điểm nổi bật bổ sung cần đưa lên bản đồ:
${get("mapHighlights")}

Món ăn / tips phụ:
${get("sideNotes")}

Phong cách thiết kế:
${get("style")}

YÊU CẦU BỐ CỤC BẮT BUỘC:
- Đây là ảnh bản đồ lịch trình / route map infographic, không phải brochure công ty.
- Không có logo, không có tên công ty, không có corporate header, không có footer liên hệ, không có QR code, không có hotline, không có địa chỉ công ty.
- Chỉ hiển thị nội dung liên quan đến lịch trình, tuyến đường, điểm đến, món ăn và tips du lịch.
- Có thể có một title du lịch ở góc trên hoặc tích hợp vào vùng bản đồ, nhưng không thiết kế thành header thương hiệu.
- Trung tâm ảnh là bản đồ minh họa của khu vực du lịch, có biển/sông/núi/đường chính theo phong cách travel map.
- Dùng các đường route nét đứt nhiều màu để nối điểm đến theo từng ngày.
- Mỗi ngày có một màu route riêng và một card ngày riêng, ví dụ Day 1, Day 2, Day 3.
- Card ngày đặt gọn ở bên trái hoặc xung quanh bản đồ, mỗi card chỉ có 3-4 điểm chính, không viết quá dài.
- Trên bản đồ có pin địa điểm, nhãn tiếng Trung rõ ràng, icon xe hơi/máy bay/cáp treo/biển/chùa phù hợp.
- Có thể thêm box nhỏ "行程概览", "美食推荐", "旅行小贴士" nếu còn không gian.

YÊU CẦU CHỮ RÕ:
- Typography-first: chữ rõ quan trọng hơn hiệu ứng trang trí.
- Toàn bộ chữ tiếng Trung phải sắc nét, đúng nét, không nhòe, không méo, không giả chữ, không dính chữ.
- Không dùng chữ nhỏ li ti. Nội dung card ngày tối thiểu 28-32px; title ngày 34-40px; title chính 52px+.
- Mỗi dòng chữ ngắn gọn, không quá 18-22 ký tự Trung Quốc nếu có thể.
- Nếu nội dung dài, hãy xuống dòng hoặc tăng chiều cao canvas, không thu nhỏ chữ.
- Không đặt chữ lên vùng ảnh/map quá rối; dùng nền trắng hoặc panel màu phẳng sau chữ để tăng tương phản.

YÊU CẦU HÌNH ẢNH:
- Tươi sáng, sạch, dễ nhìn, giống bản đồ du lịch minh họa cao cấp.
- Không dùng nền tối làm chủ đạo.
- Không tạo ảnh collage rối; bản đồ và card phải có thứ bậc rõ.
- Không bịa quá nhiều chi tiết ngoài lịch trình nguồn.
- Nếu địa lý thực tế không thể chính xác 100%, ưu tiên tính dễ hiểu của tuyến đường và đúng thứ tự lịch trình.

Hãy tạo ảnh route map infographic hoàn chỉnh, chỉ tập trung vào lịch trình và tuyến đường.`;
}

function updatePrompt() {
  output.value = buildRouteMapPrompt();
}

async function copyPrompt() {
  output.select();
  output.setSelectionRange(0, output.value.length);

  try {
    await navigator.clipboard.writeText(output.value);
  } catch (error) {
    document.execCommand("copy");
  }

  copyNotice.textContent = "Đã copy prompt";
  clearTimeout(copyNoticeTimer);
  copyNoticeTimer = setTimeout(() => {
    copyNotice.textContent = "";
  }, 1800);
}

form.addEventListener("input", (event) => {
  if (event.target === durationInput) {
    syncTitleWithDuration();
    renderRouteDays();
  }

  updatePrompt();
});

routeDays.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-route-place");
  if (addButton) {
    addButton.closest(".route-day-card")?.querySelector(".route-place-rows")?.insertAdjacentHTML("beforeend", routePlaceRowTemplate());
    updatePrompt();
    return;
  }

  const removeButton = event.target.closest(".remove-route-place");
  if (!removeButton) return;

  const rowsContainer = removeButton.closest(".route-place-rows");
  const row = removeButton.closest(".route-place-row");
  if (!rowsContainer || !row) return;

  if (rowsContainer.querySelectorAll(".route-place-row").length <= 1) {
    row.querySelector(".route-place-input").value = "";
  } else {
    row.remove();
  }

  updatePrompt();
});

copyButton.addEventListener("click", copyPrompt);
lastAutoTitle = titleInput.value.trim();
syncTitleWithDuration();
renderRouteDays({ reset: true });
updatePrompt();
