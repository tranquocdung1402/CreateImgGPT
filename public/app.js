let logoDataUrl = "";
let currentImageDataUrl = "";
let scheduleImageName = "";

const defaultCostItems = [
  {
    item: "高尔夫1 Golf 1",
    detail: "会安南 Hoiana Shores（含果岭费/球童/双人球车）",
    cost: ""
  },
  {
    item: "高尔夫2 Golf 2",
    detail: "巴拿山 Ba Na Hills Golf Club",
    cost: ""
  },
  {
    item: "高尔夫3 Golf 3",
    detail: "传奇诺曼 Norman Course",
    cost: ""
  },
  {
    item: "酒店住宿 Hotel",
    detail: "新世界会安海滩度假酒店 2晚2间",
    cost: ""
  },
  {
    item: "用车成本 Transport",
    detail: "VIP 9座商务车 3天包车（4人适用）",
    cost: ""
  },
  {
    item: "餐饮费用 Food & Beverage",
    detail: "特色午晚餐及早餐",
    cost: ""
  },
  {
    item: "中文导游 Tour Guide",
    detail: "专属私人导游 3天",
    cost: ""
  }
];

const destinationGroupsData = [
  {
    city: "Đà Nẵng",
    places: [
      "Bà Nà Hills",
      "Cầu Vàng",
      "Cầu Rồng",
      "Cầu Sông Hàn",
      "biển Mỹ Khê",
      "bán đảo Sơn Trà",
      "chùa Linh Ứng",
      "danh thắng Ngũ Hành Sơn",
      "làng đá mỹ nghệ Non Nước",
      "nhà thờ Con Gà",
      "chợ Hàn",
      "chợ Cồn",
      "bảo tàng điêu khắc Chăm",
      "công viên Châu Á (Asia Park)",
      "khu du lịch sinh thái suối khoáng nóng Núi Thần Tài",
      "làng cổ Túy Loan"
    ]
  },
  {
    city: "Hội An",
    places: [
      "Phố cổ Hội An",
      "rừng dừa Bảy Mẫu",
      "sông Hoài",
      "làng gốm Thanh Hà",
      "đảo Cù Lao Chàm",
      "làng rau Trà Quế",
      "làng mộc Kim Bồng",
      "công viên Ấn tượng Hội An (Show Ký ức Hội An)"
    ]
  },
  {
    city: "Quảng Nam",
    places: [
      "VinWonders Nam Hội An",
      "Hoiana",
      "biển An Bàng",
      "thánh địa Mỹ Sơn",
      "làng bích họa Tam Thanh",
      "tượng đài Mẹ Thứ",
      "địa đạo Kỳ Anh",
      "Hòn Kẽm Đá Dừng"
    ]
  }
];

const form = document.querySelector("#promptForm");
const itinerarySummary = document.querySelector("#itinerarySummary");
const autoStartTimes = document.querySelector("#autoStartTimes");
const autoFinalDay = document.querySelector("#autoFinalDay");
const destinationGroups = document.querySelector("#destinationGroups");
const selectedDestinationDetails = document.querySelector("#selectedDestinationDetails");
const costItemsContainer = document.querySelector("#costItems");
const costTotal = document.querySelector("#costTotal");
const promptOutput = document.querySelector("#promptOutput");
const statusText = document.querySelector("#statusText");
const imagePreview = document.querySelector("#imagePreview");
const downloadButton = document.querySelector("#downloadButton");
const copyNotice = document.querySelector("#copyNotice");
const durationInput = form.elements.duration;
const destinationInput = form.elements.destination;
const itineraryMode = document.querySelector("#itineraryMode");
const autoItineraryFields = document.querySelector("#autoItineraryFields");
const imageItineraryFields = document.querySelector("#imageItineraryFields");
const manualItineraryFields = document.querySelector("#manualItineraryFields");
const manualItinerarySummary = document.querySelector("#manualItinerarySummary");
const manualDaysContainer = document.querySelector("#manualDays");
const scheduleImageField = document.querySelector("#scheduleImageField");
const scheduleImageInput = document.querySelector("#scheduleImageInput");
const itineraryImageMode = document.querySelector("#itineraryImageMode");
const enableGolf = document.querySelector("#enableGolf");
const enableCost = document.querySelector("#enableCost");
const enableHotel = document.querySelector("#enableHotel");
const enableWechatQr = document.querySelector("#enableWechatQr");
const enableWhatsappQr = document.querySelector("#enableWhatsappQr");
const golfFields = document.querySelector("#golfFields");
const costMetaFields = document.querySelector("#costMetaFields");
const costFields = document.querySelector("#costFields");
const hotelFields = document.querySelector("#hotelFields");
let copyNoticeTimer;
let promptUpdateTimer;

renderDestinationGroups();
updateSelectedDestinationDetails();
renderCostItems(defaultCostItems);
renderItinerarySummary();
renderAutoItineraryControls();
renderManualItinerary();
renderOptionVisibility();
promptOutput.value = buildPrompt();

form.addEventListener("input", (event) => {
  if (event.target === durationInput || event.target === destinationInput) {
    renderItinerarySummary();
    renderAutoItineraryControls();
    renderManualItinerary();
  }

  schedulePromptUpdate();
});

document.querySelector("#generatePromptButton").addEventListener("click", () => {
  renderItinerarySummary();
  updatePrompt("Prompt đã được cập nhật.");
});

document.querySelector("#resetButton").addEventListener("click", () => {
  form.reset();
  updateSelectedDestinationDetails();
  renderAutoItineraryControls({ reset: true });
  renderCostItems(defaultCostItems);
  renderItinerarySummary();
  renderManualItinerary({ reset: true });
  scheduleImageName = "";
  renderOptionVisibility();
  logoDataUrl = "";
  currentImageDataUrl = "";
  updatePrompt("Đã reset form.");
  imagePreview.innerHTML = '<div class="empty-state">Tạm thời tập trung vào tạo prompt</div>';
  downloadButton.disabled = true;
});

document.querySelector("#logoInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  logoDataUrl = file ? await readFileAsDataUrl(file) : "";
  setStatus(file ? "Logo đã được nạp vào prompt." : "");
});

document.querySelector("#copyPromptButton").addEventListener("click", copyPrompt);
document.querySelector("#addCostItemButton").addEventListener("click", addCostItem);
document.querySelector("#exportExcelButton").addEventListener("click", exportExcel);
document.querySelector("#selectAllDestinationsButton").addEventListener("click", () => {
  setAllDestinationCheckboxes(true);
  updatePrompt("Đã chọn tất cả điểm đến.");
});
document.querySelector("#clearDestinationsButton").addEventListener("click", () => {
  setAllDestinationCheckboxes(false);
  updatePrompt("Đã bỏ chọn điểm đến.");
});
document.querySelector("#syncManualItineraryButton").addEventListener("click", () => {
  renderManualItinerary();
  updatePrompt("Đã đồng bộ số ngày lịch trình tự viết.");
});
downloadButton.addEventListener("click", downloadImage);

itineraryMode.addEventListener("change", () => {
  renderOptionVisibility();
  renderManualItinerary();
  updatePrompt("Prompt tự động cập nhật.");
});

enableGolf.addEventListener("change", () => {
  renderOptionVisibility();
  updatePrompt("Prompt tự động cập nhật.");
});

enableCost.addEventListener("change", () => {
  renderOptionVisibility();
  updatePrompt("Prompt tự động cập nhật.");
});

itineraryImageMode.addEventListener("change", () => {
  updatePrompt("Prompt tự động cập nhật.");
});

enableHotel.addEventListener("change", () => {
  renderOptionVisibility();
  updatePrompt("Prompt tự động cập nhật.");
});

enableWechatQr.addEventListener("change", () => {
  updatePrompt("Prompt tự động cập nhật.");
});

enableWhatsappQr.addEventListener("change", () => {
  updatePrompt("Prompt tự động cập nhật.");
});

scheduleImageInput.addEventListener("change", (event) => {
  scheduleImageName = event.target.files?.[0]?.name || "";
  updatePrompt(scheduleImageName ? "Đã nạp tên ảnh lịch trình tham khảo." : "Prompt tự động cập nhật.");
});

destinationGroups.addEventListener("change", (event) => {
  if (!event.target.classList.contains("destination-checkbox")) return;
  updateSelectedDestinationDetails();
  updatePrompt("Prompt tự động cập nhật.");
});

function renderDestinationGroups() {
  destinationGroups.innerHTML = destinationGroupsData
    .map(
      (group) => `
        <fieldset class="destination-group">
          <legend>${escapeHtml(group.city)}</legend>
          <div class="destination-options">
            ${group.places
              .map(
                (place) => `
                  <label class="destination-option">
                    <input class="destination-checkbox" type="checkbox" value="${escapeHtml(place)}" data-city="${escapeHtml(group.city)}" checked />
                    <span>${escapeHtml(place)}</span>
                  </label>
                `
              )
              .join("")}
          </div>
        </fieldset>
      `
    )
    .join("");
}

function setAllDestinationCheckboxes(checked) {
  destinationGroups.querySelectorAll(".destination-checkbox").forEach((checkbox) => {
    checkbox.checked = checked;
  });
  updateSelectedDestinationDetails();
}

function updateSelectedDestinationDetails() {
  selectedDestinationDetails.value = formatSelectedDestinations();
}

function formatSelectedDestinations() {
  const lines = destinationGroupsData
    .map((group) => {
      const selectedPlaces = [...destinationGroups.querySelectorAll(`.destination-checkbox[data-city="${cssEscape(group.city)}"]:checked`)].map((checkbox) => checkbox.value);
      return selectedPlaces.length ? `${group.city}: ${selectedPlaces.join(", ")}.` : "";
    })
    .filter(Boolean);

  return lines.length ? lines.join("\n\n") : "Không có điểm đến chi tiết được chọn. Chỉ dựa vào điểm đến chính và các yêu cầu khác.";
}

function cssEscape(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderOptionVisibility() {
  const mode = itineraryMode.value;
  const useAutoItinerary = mode === "auto";
  const useImageItinerary = mode === "image";
  const useManualItinerary = mode === "manual";
  autoItineraryFields.classList.toggle("hidden", !useAutoItinerary);
  imageItineraryFields.classList.toggle("hidden", !useImageItinerary);
  manualItineraryFields.classList.toggle("hidden", !useManualItinerary);
  scheduleImageField.classList.toggle("hidden", !useImageItinerary);

  golfFields.classList.toggle("hidden", !enableGolf.checked);
  costMetaFields.classList.toggle("hidden", !enableCost.checked);
  costFields.classList.toggle("hidden", !enableCost.checked);
  hotelFields.classList.toggle("hidden", !enableHotel.checked);
}

function renderItinerarySummary() {
  const trip = parseDuration(durationInput.value);
  const dayLabels = Array.from({ length: trip.days }, (_, index) => `第${index + 1}天`);
  itinerarySummary.innerHTML = `
    <div class="summary-card">
      <strong>${escapeHtml(trip.days)} ngày / ${escapeHtml(trip.nights)} đêm</strong>
      <span>${escapeHtml(dayLabels.join(" · "))}</span>
    </div>
  `;
}

function renderAutoItineraryControls(options = {}) {
  renderAutoStartTimes(options);
  renderAutoFinalDay(options);
}

function renderAutoStartTimes(options = {}) {
  const trip = parseDuration(durationInput.value);
  const existingTimes = options.reset ? [] : getAutoStartTimes();
  const autoDays = Math.max(trip.days - 1, 0);

  if (autoDays === 0) {
    autoStartTimes.innerHTML = "";
    return;
  }

  const rows = Array.from({ length: autoDays }, (_, index) => {
    const day = index + 1;
    const startTime = existingTimes[index]?.startTime || defaultAutoStartTime(day);
    return "<label class=\"auto-start-time\">" +
      "<span>第" + day + "天 bắt đầu</span>" +
      "<input class=\"auto-start-time-input\" type=\"time\" value=\"" + escapeHtml(startTime) + "\" data-day=\"" + day + "\" aria-label=\"Giờ bắt đầu ngày " + day + "\" />" +
      "</label>";
  }).join("");

  autoStartTimes.innerHTML =
    "<div class=\"auto-start-times-header\">" +
    "<h3>Thời gian bắt đầu các ngày tự động</h3>" +
    "<p>GPT sẽ tự lên lịch trình cho các ngày này theo giờ bắt đầu bạn chọn. Ngày cuối nhập timeline riêng bên dưới.</p>" +
    "</div>" +
    "<div class=\"auto-start-time-grid\">" + rows + "</div>";
}

function renderAutoFinalDay(options = {}) {
  const trip = parseDuration(durationInput.value);
  const existingRows = options.reset ? [] : getAutoFinalDayRows();
  const rows = existingRows.length ? existingRows : defaultAutoFinalDayRows();

  autoFinalDay.innerHTML =
    "<div class=\"auto-final-day-header\">" +
    "<div>" +
    "<h3>Ngày cuối tự viết - 第" + trip.days + "天</h3>" +
    "<p>Nhập timeline ngày cuối. Mỗi dòng gồm thời gian bắt đầu và nội dung hoạt động.</p>" +
    "</div>" +
    "<button class=\"secondary-button compact-button add-auto-final-row\" type=\"button\">+ Thêm mốc giờ</button>" +
    "</div>" +
    "<div class=\"auto-final-table-head\" aria-hidden=\"true\">" +
    "<span>Bắt đầu</span><span>Lịch trình</span><span></span>" +
    "</div>" +
    "<div class=\"auto-final-rows\">" + rows.map((row) => autoFinalRowTemplate(row)).join("") + "</div>";
}

function defaultAutoFinalDayRows() {
  return [
    { start: "08:30", activity: "酒店享用早餐，整理行李并办理退房。" },
    { start: "11:00", activity: "安排轻松活动或自由购物。" },
    { start: "13:00", activity: "享用午餐。" },
    { start: "15:00", activity: "专车送往机场，结束行程。" }
  ];
}

function autoFinalRowTemplate(row = {}) {
  return "<div class=\"auto-final-row\">" +
    "<input class=\"auto-final-start\" type=\"time\" value=\"" + escapeHtml(row.start || "") + "\" aria-label=\"Thời gian bắt đầu\" />" +
    "<input class=\"auto-final-activity\" value=\"" + escapeHtml(row.activity || "") + "\" placeholder=\"Nhập lịch trình ngày cuối\" aria-label=\"Nội dung ngày cuối\" />" +
    "<button class=\"icon-button remove-auto-final-row\" type=\"button\" aria-label=\"Xóa mốc giờ ngày cuối\">-</button>" +
    "</div>";
}

function getAutoFinalDayRows() {
  return [...autoFinalDay.querySelectorAll(".auto-final-row")]
    .map((row) => ({
      start: row.querySelector(".auto-final-start")?.value.trim() || "",
      activity: row.querySelector(".auto-final-activity")?.value.trim() || ""
    }))
    .filter((row) => row.start || row.activity);
}

function formatAutoFinalDayForPrompt() {
  const trip = parseDuration(durationInput.value);
  const rows = getAutoFinalDayRows();
  if (rows.length === 0) return "第" + trip.days + "天: Chưa nhập timeline ngày cuối.";

  return "第" + trip.days + "天:\n" + rows
    .map((row) => "  - " + (row.start || "未定时间") + " | " + (row.activity || "未填写活动内容"))
    .join("\n");
}

function defaultAutoStartTime(day) {
  return day === 1 ? "09:00" : "08:30";
}

function getAutoStartTimes() {
  return [...autoStartTimes.querySelectorAll(".auto-start-time-input")].map((input, index) => ({
    day: Number(input.dataset.day || index + 1),
    startTime: input.value || defaultAutoStartTime(index + 1)
  }));
}

function formatAutoStartTimesForPrompt() {
  return getAutoStartTimes()
    .map((item) => `第${item.day}天: bắt đầu lịch trình từ ${item.startTime}`)
    .join("\n");
}

function renderManualItinerary(options = {}) {
  const trip = parseDuration(durationInput.value);
  const existingDays = options.reset ? [] : getManualItineraryDays();
  const days = Array.from({ length: trip.days }, (_, index) => {
    const existing = existingDays[index];
    return {
      day: index + 1,
      rows: existing?.rows?.length ? existing.rows : defaultManualTimelineRows(index + 1)
    };
  });

  manualItinerarySummary.textContent = `${trip.days} ngày / ${trip.nights} đêm - ${days.map((day) => `第${day.day}天`).join(" · ")}`;
  manualDaysContainer.innerHTML = days.map((day) => manualDayTemplate(day.day, day.rows)).join("");
}

function defaultManualTimelineRows(day) {
  if (day === 1) {
    return [
      { time: "09:00", activity: "抵达目的地，专车接机。" },
      { time: "12:00", activity: "享用当地特色午餐。" },
      { time: "15:00", activity: "办理入住并自由休息。" },
      { time: "18:30", activity: "享用欢迎晚餐。" }
    ];
  }

  return [
    { time: "08:30", activity: "酒店享用早餐。" },
    { time: "10:00", activity: "开始当天行程活动。" },
    { time: "12:30", activity: "享用午餐。" },
    { time: "18:00", activity: "晚餐后返回酒店休息。" }
  ];
}

function manualDayTemplate(day, rows) {
  return `
    <div class="manual-day-card" data-day="${day}">
      <div class="manual-day-title">
        <h3>第${day}天</h3>
        <button class="secondary-button compact-button add-manual-row" type="button">+ Thêm mốc giờ</button>
      </div>
      <div class="manual-rows">
        ${rows.map((row) => manualRowTemplate(row)).join("")}
      </div>
    </div>
  `;
}

function manualRowTemplate(row = {}) {
  return `
    <div class="manual-row">
      <input class="manual-time" value="${escapeHtml(row.time || "")}" placeholder="HH:MM" aria-label="Mốc giờ" />
      <input class="manual-activity" value="${escapeHtml(row.activity || "")}" placeholder="Nhập lịch trình di chuyển / hoạt động" aria-label="Nội dung lịch trình" />
      <button class="icon-button remove-manual-row" type="button" aria-label="Xóa mốc giờ">-</button>
    </div>
  `;
}

autoFinalDay.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-auto-final-row");
  if (addButton) {
    autoFinalDay.querySelector(".auto-final-rows")?.insertAdjacentHTML("beforeend", autoFinalRowTemplate());
    updatePrompt("Đã thêm mốc giờ ngày cuối.");
    return;
  }

  const removeButton = event.target.closest(".remove-auto-final-row");
  if (!removeButton) return;

  const rowsContainer = removeButton.closest(".auto-final-rows");
  const row = removeButton.closest(".auto-final-row");
  if (!rowsContainer || !row) return;

  if (rowsContainer.querySelectorAll(".auto-final-row").length <= 1) {
    row.querySelector(".auto-final-start").value = "";
    row.querySelector(".auto-final-activity").value = "";
  } else {
    row.remove();
  }

  updatePrompt("Đã xóa mốc giờ ngày cuối.");
});

manualDaysContainer.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-manual-row");
  if (addButton) {
    addButton.closest(".manual-day-card")?.querySelector(".manual-rows")?.insertAdjacentHTML("beforeend", manualRowTemplate());
    updatePrompt("Đã thêm mốc giờ lịch trình.");
    return;
  }

  const removeButton = event.target.closest(".remove-manual-row");
  if (!removeButton) return;

  const rowsContainer = removeButton.closest(".manual-rows");
  const row = removeButton.closest(".manual-row");
  if (!rowsContainer || !row) return;

  if (rowsContainer.querySelectorAll(".manual-row").length <= 1) {
    row.querySelector(".manual-time").value = "";
    row.querySelector(".manual-activity").value = "";
  } else {
    row.remove();
  }

  updatePrompt("Đã xóa mốc giờ lịch trình.");
});

function getManualItineraryDays() {
  return [...manualDaysContainer.querySelectorAll(".manual-day-card")].map((card, dayIndex) => ({
    day: Number(card.dataset.day || dayIndex + 1),
    rows: [...card.querySelectorAll(".manual-row")]
      .map((row) => ({
        time: row.querySelector(".manual-time")?.value.trim() || "",
        activity: row.querySelector(".manual-activity")?.value.trim() || ""
      }))
      .filter((row) => row.time || row.activity)
  }));
}

function renderCostItems(items) {
  costItemsContainer.innerHTML = items.map((item) => costRowTemplate(item)).join("");
  updateCostTotal();
}

function costRowTemplate(item) {
  return `
    <div class="cost-row">
      <input class="cost-item-name" value="${escapeHtml(item.item)}" aria-label="Hạng mục" />
      <input class="cost-item-detail" value="${escapeHtml(item.detail)}" aria-label="Chi tiết" />
      <input class="cost-item-amount" value="${escapeHtml(formatCostInputValue(item.cost))}" inputmode="numeric" aria-label="Chi phí" placeholder="VD: 1,200,000" />
      <button class="icon-button remove-cost-item" type="button" aria-label="Xóa hạng mục">-</button>
    </div>
  `;
}

function addCostItem() {
  costItemsContainer.insertAdjacentHTML(
    "beforeend",
    costRowTemplate({
      item: "新项目 New Item",
      detail: "请输入项目详情",
      cost: ""
    })
  );
  updateCostTotal();
  updatePrompt("Đã thêm hạng mục chi phí.");
}

costItemsContainer.addEventListener("input", (event) => {
  if (event.target.classList.contains("cost-item-amount")) {
    formatCostInput(event.target);
  }

  updateCostTotal();
  updatePrompt("Prompt tự động cập nhật.");
});

costItemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-cost-item");
  if (!button) return;

  button.closest(".cost-row")?.remove();
  updateCostTotal();
  updatePrompt("Đã xóa hạng mục chi phí.");
});

function getCostItems() {
  return [...costItemsContainer.querySelectorAll(".cost-row")]
    .map((row) => ({
      item: row.querySelector(".cost-item-name")?.value.trim() || "",
      detail: row.querySelector(".cost-item-detail")?.value.trim() || "",
      cost: row.querySelector(".cost-item-amount")?.value.trim() || ""
    }))
    .filter((item) => item.item || item.detail || item.cost);
}

function formatCostItemsForPrompt() {
  const items = getCostItems();
  if (items.length === 0) {
    return "Không có hạng mục chi phí được nhập.";
  }

  const rows = items.map((item, index) => {
    const cost = item.cost ? `${item.cost} VND` : "Chưa nhập chi phí";
    return `${index + 1}. ${item.item} | ${item.detail} | ${cost}`;
  });

  return ["Hạng mục | Chi tiết | Chi phí (VND)", ...rows, `TOTAL | 总计 | ${formatCurrency(calculateCostTotal())}`].join("\n");
}

function calculateCostTotal() {
  return getCostItems().reduce((sum, item) => sum + parseCostAmount(item.cost), 0);
}

function updateCostTotal() {
  costTotal.textContent = formatCurrency(calculateCostTotal());
}

function parseCostAmount(value) {
  const normalized = String(value || "")
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function formatCostInputValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const numericText = text.replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(numericText)) return text;

  const [integerPart, decimalPart] = numericText.split(".");
  const formattedInteger = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(Number(integerPart || 0));

  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

function formatCostInput(input) {
  const originalValue = input.value;
  const originalCursor = input.selectionStart ?? originalValue.length;
  const digitsBeforeCursor = originalValue.slice(0, originalCursor).replace(/\D/g, "").length;
  const formattedValue = formatCostInputValue(originalValue);
  input.value = formattedValue;

  let cursor = formattedValue.length;
  if (digitsBeforeCursor > 0) {
    let seenDigits = 0;
    cursor = formattedValue.length;
    for (let index = 0; index < formattedValue.length; index += 1) {
      if (/\d/.test(formattedValue[index])) {
        seenDigits += 1;
      }
      if (seenDigits >= digitsBeforeCursor) {
        cursor = index + 1;
        break;
      }
    }
  }

  input.setSelectionRange(cursor, cursor);
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value)} VND`;
}

function buildPrompt() {
  updateSelectedDestinationDetails();
  const data = new FormData(form);
  const get = (name) => String(data.get(name) || "").trim();
  const trip = parseDuration(get("duration"));
  const daySections = Array.from({ length: trip.days }, (_, index) => `第${index + 1}天`).join(", ");
  const itineraryModeValue = get("itineraryMode") || "auto";
  const useAutoItinerary = itineraryModeValue === "auto";
  const useImageItinerary = itineraryModeValue === "image";
  const useManualItinerary = itineraryModeValue === "manual";
  const itineraryImageModeValue = get("itineraryImageMode") || "single";
  const includeGolf = data.get("enableGolf") === "on";
  const includeCost = data.get("enableCost") === "on";
  const includeHotel = data.get("enableHotel") === "on";
  const includeWechatQr = data.get("enableWechatQr") === "on";
  const includeWhatsappQr = data.get("enableWhatsappQr") === "on";
  const titleHint = get("tourTitle");
  const subtitleHint = get("tourSubtitle");
  const titleHintLine = titleHint ? `- Gợi ý title nếu phù hợp: "${titleHint}"` : "- Không có gợi ý title cố định; tự tạo title tiếng Trung mới theo nội dung lịch trình.";
  const subtitleHintLine = subtitleHint ? `- Gợi ý subtitle nếu phù hợp: "${subtitleHint}"` : "- Không có gợi ý subtitle cố định; tự tạo subtitle tiếng Trung mới theo nội dung lịch trình.";
  const costTable = formatCostItemsForPrompt();
  const totalCost = formatCurrency(calculateCostTotal());
  const tasks = [
    useAutoItinerary
      ? `Lập lịch trình du lịch ${get("destination")} chi tiết cho ${get("duration")} theo dạng nghỉ dưỡng cao cấp.`
      : useImageItinerary
        ? "Đọc ảnh lịch trình tham khảo được cung cấp và chuyển nội dung trong ảnh đó thành phần lịch trình của brochure."
        : "Sử dụng lịch trình tự viết tôi đã nhập để tạo phần lịch trình của brochure.",
    includeGolf || includeCost ? "Tích hợp đầy đủ các yêu cầu Golf/Chi phí đang được bật vào lịch trình và bố cục ảnh." : "",
    `Từ nội dung đó, tạo một hình ảnh ${get("imageType")} dựa trên nội dung bên dưới.`
  ].filter(Boolean);
  const golfCostBlock = buildGolfCostPromptBlock(get, includeGolf, includeCost, costTable, totalCost);
  const stayRuleBlock = buildStayRuleBlock(get, includeHotel);
  const itineraryBlock = buildItineraryPromptBlock(get, trip, daySections, itineraryModeValue, includeGolf, itineraryImageModeValue, stayRuleBlock);
  const costBudgetBlock = includeCost ? buildCostBudgetPromptBlock(get, totalCost) : "";
  const footerQrBlock = buildFooterQrBlock(includeWechatQr, includeWhatsappQr);
  const hotelBlock = includeHotel ? `KHỐI KHÁCH SẠN:
- Vị trí: gần cuối body.
- Tiêu đề: "${get("hotelTitle")}"
- Tên khách sạn nổi bật: "${get("hotelName")}"
- Hình ảnh minh họa: ${get("hotelImages")}
- Tiện ích kèm icon nhỏ: ${get("hotelAmenities")}` : "";

  return `${get("role")}

Ngôn ngữ hiển thị trong ảnh: ${get("imageLanguage")}.

QUY TẮC ƯU TIÊN TÀI LIỆU THAM CHIẾU:
- Nếu tôi upload ảnh logo, hãy dùng ảnh logo đó làm nguồn duy nhất cho logo. Không tự vẽ lại logo, không đổi màu, không đổi tỷ lệ, không tạo logo mới.
${useImageItinerary ? "- Nếu tôi upload ảnh lịch trình, hãy dùng ảnh lịch trình đó làm nguồn chính cho nội dung lịch trình. Không tự lập lịch trình mới và không tự thêm địa điểm không có trong ảnh." : ""}
${useManualItinerary ? "- Nếu tôi nhập lịch trình tự viết, hãy dùng lịch trình đó làm nguồn chính. Không tự thay đổi thứ tự ngày, mốc giờ hoặc hoạt động chính." : ""}

Nhiệm vụ:
${tasks.map((task, index) => `${index + 1}. ${task}`).join("\n")}

Điểm đến chính:
${get("destination")}

${useAutoItinerary ? "Điểm đến chi tiết để lựa chọn và phân bổ vào lịch trình:" : useImageItinerary ? "Điểm đến chi tiết chỉ dùng làm ngữ cảnh phụ, không được dùng để thay đổi lịch trình trong ảnh tham khảo:" : "Điểm đến chi tiết chỉ dùng làm ngữ cảnh phụ và gợi ý hình minh họa, không được thay đổi lịch trình tự viết:"}
${get("destinationDetails")}

Định hướng lịch trình:
${useAutoItinerary ? get("tourBrief") : useImageItinerary ? "Bám theo ảnh lịch trình tham khảo. Không tự chọn và phân bổ địa danh nếu ảnh lịch trình đã có nội dung rõ ràng." : "Bám theo lịch trình tự viết. Chỉ tối ưu câu chữ tiếng Trung, bố cục, icon và hình minh họa; không tự thay đổi nội dung chính."}

${golfCostBlock}

Phong cách thiết kế:
${get("style")}

Bố cục tổng thể:
- Chia theo chiều dọc thành các section riêng biệt.
- Thiết kế sang trọng, hiện đại, dùng icon máy bay, khách sạn, nhà hàng, xe hơi, máy ảnh, đồng hồ, cáp treo, chùa.
- Màu chủ đạo xanh sang trọng, trắng sáng và gold làm điểm nhấn nhỏ.
- Nền tổng thể của brochure bắt buộc là màu trắng sáng, sạch, hiện đại; không dùng nền vàng, beige, kem hoặc ngả vàng.
- Không dùng gold làm màu nền lớn; gold chỉ dùng cho viền, icon, tiêu đề hoặc chi tiết nhấn nhỏ.
- Không dùng tông tối làm chủ đạo.
${includeCost ? `- Kích cỡ chữ phần chi phí: ${get("costFontSize")}. Bảng chi phí, hạng mục, chi tiết, số tiền và TOTAL phải nổi bật, dễ đọc, không bị chen chúc.` : ""}

HEADER:
- Ảnh logo tham chiếu được cung cấp, ưu tiên giữ nguyên hình dáng, màu vàng, tỷ lệ, chi tiết và phong cách của logo tham chiếu; không tự sáng tạo logo mới.
- ${get("logoRequirements")}
- Logo trong header phải là logo duy nhất trong toàn bộ ảnh. Không thêm, không lặp, không biến thể logo ở bất kỳ vị trí nào khác.
- Ảnh nền header: ${get("headerImage")}
- Ảnh header chọn một địa điểm nổi tiếng của Đà Nẵng phù hợp để làm hình quảng cáo, không cần cố định một địa danh cụ thể trong prompt.
- Tự tạo tiêu đề lớn bằng tiếng Trung, màu vàng, dựa trên nội dung lịch trình thực tế.
${titleHintLine}
- Nếu lịch trình có golf, title phải nhấn mạnh trải nghiệm golf cao cấp, nghe hấp dẫn và khác biệt hơn title du lịch chung.
- Nếu lịch trình không có golf, title phải nhấn mạnh chủ đề chính của lịch trình như nghỉ dưỡng biển, văn hóa, gia đình, luxury resort hoặc khám phá.
- Không dùng title chung chung kiểu "5天4晚轻奢度假行程" nếu lịch trình có chủ đề rõ ràng.
- Tự tạo dòng phụ nhỏ hơn bằng tiếng Trung, ngắn gọn, giàu cảm xúc, bám nội dung lịch trình.
${subtitleHintLine}

${stayRuleBlock}

${itineraryBlock}

${costBudgetBlock}

${hotelBlock}

KHỐI DỊCH VỤ ĐƯA ĐÓN VIP:
- Vị trí: cuối body, ngay phía trên footer.
- Tiêu đề: "${get("vipTitle")}"
- Hình ảnh minh họa: ${get("vipImages")}
- Bắt buộc tạo thành một scene/ảnh thống nhất trong cùng một khung: xe limousine và hướng dẫn viên phải cùng xuất hiện trong một bối cảnh thật, có chiều sâu và background rõ ràng. Không đặt xe và người mẫu như 2 đối tượng rời rạc trên nền trống, không tách thành 2 thumbnail riêng, không dùng collage.
- Background của ảnh VIP phải phù hợp dịch vụ đưa đón cao cấp: sân bay, sảnh resort/khách sạn 5 sao, driveway sang trọng hoặc phố biển Đà Nẵng tươi sáng.
- Tiện ích kèm icon nhỏ: ${get("vipAmenities")}

FOOTER:
- Bên trái: dòng lớn "${get("companyChinese")}", dòng dưới "${get("companyEnglish")}".
- Ở giữa: icon điện thoại + "咨询热线: ${get("hotline")}".
- Ở giữa: icon địa điểm + "公司地址: ${get("address")}".
- Bên phải: slogan thư pháp tiếng Trung "${get("slogan")}".
- Footer chỉ có chữ, icon điện thoại, icon địa điểm và các QR được bật trong option; tuyệt đối không đặt logo công ty, không dùng biểu tượng logo, không lặp lại hình ảnh logo ở Footer.
${footerQrBlock}

YÊU CẦU KỸ THUẬT:
${get("technicalRequirements")}

IMAGE QUALITY KEYWORDS:
${get("imageQuality")}

Hãy tạo ảnh hoàn chỉnh với độ sắc nét cao nhất, ưu tiên bố cục dễ đọc, chữ Trung rõ ràng, không lỗi font, không cắt nội dung.`;
}

function buildFooterQrBlock(includeWechatQr, includeWhatsappQr) {
  const lines = [];

  if (includeWechatQr) {
    lines.push("- QR WeChat: tôi sẽ upload ảnh QR WeChat kèm trong GPT; hãy tham khảo đúng ảnh QR đó, đặt ở footer, kích thước vừa phải, rõ nét, có nhãn WeChat.");
  }

  if (includeWhatsappQr) {
    lines.push("- QR WhatsApp: tôi sẽ upload ảnh QR WhatsApp kèm trong GPT; hãy tham khảo đúng ảnh QR đó, đặt ở footer, kích thước vừa phải, rõ nét, có nhãn WhatsApp.");
  }

  if (lines.length === 0) {
    return "- Không thêm mã QR ở footer.";
  }

  return [
    "- Nếu thêm QR, đặt QR ở khu vực footer bên phải hoặc gần thông tin liên hệ, không che slogan/hotline/address.",
    "- QR phải là mã vuông rõ nét, nền trắng, không bị méo, không bị cắt, không tự bịa nội dung QR.",
    ...lines
  ].join("\n");
}

function buildStayRuleBlock(get, includeHotel) {
  const hotelName = get("hotelName");
  const hotelCheckInText = includeHotel
    ? "Check-in tại khách sạn " + hotelName + ". Khi viết bằng tiếng Trung, có thể ghi rõ tên khách sạn này."
    : "Check-in tại khách sạn. Không nêu tên khách sạn cụ thể.";
  const hotelCheckOutText = includeHotel
    ? "Check-out tại khách sạn " + hotelName + ". Khi viết bằng tiếng Trung, có thể ghi rõ tên khách sạn này."
    : "Check-out tại khách sạn. Không nêu tên khách sạn cụ thể.";

  return [
    "YÊU CẦU LƯU TRÚ / CHECK-IN CHECK-OUT:",
    "- Khách lưu trú tại 1 khách sạn duy nhất trong toàn bộ lịch trình, không đổi khách sạn giữa tour.",
    "- Toàn bộ lịch trình chỉ được có đúng 1 lần check-in và đúng 1 lần check-out.",
    "- Không lặp lại check-in/check-out ở nhiều ngày khác nhau.",
    "- Check-in chỉ xuất hiện ở ngày đầu tiên hoặc ngày nhận phòng hợp lý đầu tiên.",
    "- Check-out chỉ xuất hiện ở ngày cuối cùng.",
    "- " + hotelCheckInText,
    "- " + hotelCheckOutText
  ].join("\n");
}

function buildGolfCostPromptBlock(get, includeGolf, includeCost, costTable, totalCost) {
  if (!includeGolf && !includeCost) return "";

  const title = includeGolf && includeCost ? "YÊU CẦU GOLF & CHI PHÍ:" : includeGolf ? "YÊU CẦU GOLF:" : "YÊU CẦU CHI PHÍ:";
  const lines = [title];
  const clientRequest = get("clientRequest");
  if (includeGolf && clientRequest) {
    lines.push(`- Yêu cầu gốc của khách: ${clientRequest}`);
  }

  if (includeGolf) {
    lines.push(`- Số trận golf: ${get("golfRounds")}`);
    lines.push(`- Sân golf / điểm golf cần đưa vào lịch trình: ${get("golfCourses")}`);
    lines.push("- Lịch trình phải phân bổ đủ số trận golf theo thời lượng tour. Với yêu cầu \"3球\", phải có đủ 3 buổi đánh golf.");
    lines.push("- Ngày cuối nếu có yêu cầu \"打好球回国\" thì sắp xếp đánh golf trước, sau đó ra sân bay về nước.");
  }

  if (includeCost) {
    lines.push(`- Số lượng khách cần tính giá: ${get("guestCount")} người`);
    lines.push("- Đơn vị tiền tệ bắt buộc: Việt Nam Đồng (VND / 越南盾).");
    lines.push("- Trong ảnh cần có một block riêng về chi phí/ngân sách, trình bày rõ ràng bằng tiếng Trung Giản thể.");
    lines.push(`- Bảng chi phí phải tính theo đúng số lượng khách: ${get("guestCount")} người.`);
    lines.push("- Tất cả số tiền trong ảnh bắt buộc dùng Việt Nam Đồng, ký hiệu VND. Không dùng Nhân dân tệ, CNY, RMB, 人民币 hoặc 元.");
    lines.push("- Không tự nghĩ giá, không tự báo giá, không tự ước tính chi phí. Chỉ sử dụng các hạng mục và chi phí tôi đã nhập trong bảng dưới đây.");
    lines.push("");
    lines.push("Bảng chi phí do tôi nhập:");
    lines.push(costTable);
    lines.push("");
    lines.push("Tổng chi phí tự động:");
    lines.push(totalCost);
  }

  return lines.join("\n");
}

function buildItineraryImageLayout(mode) {
  if (mode === "quad") {
    return "- Bên phải: lưới 4 hình ảnh minh họa hình chữ nhật bo góc, ảnh thực tế sắc nét, đại diện cho các địa danh/hoạt động chính trong ngày; không cần caption.";
  }

  if (mode === "none") {
    return "- Không cần ảnh minh họa trong từng ngày lịch trình. Ưu tiên timeline chữ rõ ràng, bố cục thoáng và dễ đọc.";
  }

  return "- Bên phải: 1 hình ảnh đại diện lớn, hình chữ nhật bo góc, ảnh thực tế sắc nét tượng trưng cho nội dung chính của ngày đó; không cần caption.";
}

function buildManualItineraryImageRule(mode) {
  if (mode === "quad") {
    return "- Nếu có ảnh minh họa, chọn đúng 4 hình ảnh phù hợp với từng ngày dựa trên địa danh/hoạt động tôi đã nhập; không cần caption.";
  }

  if (mode === "none") {
    return "- Không yêu cầu ảnh minh họa trong từng ngày.";
  }

  return "- Nếu có ảnh minh họa, chọn 1 hình ảnh đại diện phù hợp với từng ngày dựa trên địa danh/hoạt động tôi đã nhập; không cần caption.";
}

function buildAutoItineraryImageRule(mode) {
  if (mode === "quad") {
    return "- Mỗi ngày dùng đúng 4 hình ảnh minh họa phù hợp với các địa danh/khách sạn/dịch vụ chính trong ngày; không cần caption.";
  }

  if (mode === "none") {
    return "- Không yêu cầu ảnh minh họa trong từng ngày.";
  }

  return "- Mỗi ngày chỉ dùng 1 hình ảnh đại diện phù hợp nhất với địa danh/khách sạn/dịch vụ hoặc chủ đề chính của ngày đó; không dùng lưới 4 hình ảnh; không cần caption.";
}

function buildItineraryPromptBlock(get, trip, daySections, itineraryModeValue, includeGolf, itineraryImageModeValue, stayRuleBlock) {
  const imageLayout = buildItineraryImageLayout(itineraryImageModeValue);
  const sharedLayout = `Mỗi khối ngày có thanh tiêu đề màu xanh viền gold kèm icon đại diện phù hợp với chủ đề ngày đó.
Trong mỗi khối ngày, chia 2 phần:
- Bên trái: timeline dọc theo bố cục bắt buộc, không dùng bullet list đơn giản.
- Mỗi dòng timeline phải theo đúng thứ tự ngang: icon chức năng màu xanh navy lớn -> chấm tròn gold nhỏ -> giờ HH:MM -> vạch dọc màu xám nhạt -> nội dung hoạt động tiếng Trung.
- Icon chức năng đặt ở cột ngoài cùng bên trái, kích thước 28-34px, rõ ràng và đồng bộ theo từng loại hoạt động.
- Chấm tròn gold nhỏ nằm giữa icon và giờ, kích thước 5-7px.
- Giờ HH:MM đặt bên phải chấm gold, font 20px, màu đen hoặc xám đậm, căn giữa theo chiều dọc với nội dung hoạt động.
- Sau phần giờ bắt buộc có một vạch dọc màu xám nhạt để ngăn cách rõ ràng giữa thời gian và nội dung.
- Nội dung hoạt động đặt bên phải vạch dọc, font 25-28px, màu xanh đậm hoặc đen, lớn hơn giờ, rõ ràng và dễ đọc.
- Nội dung hoạt động không được thu nhỏ để nhét chữ; nếu câu dài thì tự động xuống dòng 2 dòng. Mỗi dòng timeline phải có khoảng cách thoáng và chiều cao đủ lớn để chữ 2 dòng không chồng lên nhau hoặc bị cắt.
- Không đặt giờ và nội dung quá sát nhau; bắt buộc có khoảng trắng và vạch chia giữa giờ và nội dung.
${imageLayout}`;

  if (itineraryModeValue === "image") {
    return `BODY - LỊCH TRÌNH (THAM KHẢO ẢNH):
- Tôi sẽ cung cấp ảnh lịch trình riêng. Ảnh đó là nguồn dữ liệu chính và có ưu tiên cao hơn mọi thông tin điểm đến mặc định trong prompt.
${scheduleImageName ? `- Tên file ảnh lịch trình tham khảo: ${scheduleImageName}` : "- Ảnh lịch trình tham khảo sẽ được upload kèm trong GPT."}
- ${get("scheduleImageInstruction")}
- Dựa vào ảnh lịch trình tham khảo để xác định chính xác số ngày, thứ tự ngày, điểm đến, hoạt động, thời gian, khách sạn, golf/chi phí nếu có và nội dung quan trọng.
- Không tự thay đổi logic lịch trình trong ảnh. Không tự thêm Bà Nà/Hội An/Đà Nẵng hoặc bất kỳ địa danh nào nếu ảnh lịch trình không có.
- Nếu có xung đột giữa ảnh lịch trình và các field văn bản trong form, ưu tiên ảnh lịch trình.
- Chỉ tối ưu câu chữ tiếng Trung, bố cục, icon và hình minh họa; không thay đổi nội dung gốc của lịch trình.
${sharedLayout}`;
  }

  if (itineraryModeValue === "manual") {
    return `BODY - LỊCH TRÌNH (TỰ VIẾT):
Chia thành ${trip.days} khối lớn cho từng ngày: ${daySections}.
${sharedLayout}

Lịch trình tự viết do tôi nhập:
${formatManualItineraryForPrompt()}

Yêu cầu xử lý lịch trình tự viết:
- Bắt buộc dùng đúng ${trip.days} ngày theo danh sách trên, không thiếu ngày, không thêm ngày ngoài thời lượng.
- Giữ đúng thứ tự ngày, mốc giờ và nội dung hoạt động chính tôi đã nhập.
- Có thể biên tập câu chữ sang tiếng Trung Giản thể cho gọn, sang trọng và dễ đọc, nhưng không tự thay đổi logic di chuyển.
- Nếu dòng nào chưa có giờ hoặc nội dung, hãy giữ bố cục hợp lý và không tự bịa thêm hoạt động quan trọng.
${buildManualItineraryImageRule(itineraryImageModeValue)}
${includeGolf ? "- Nếu là tour golf, giữ đúng các buổi golf đã nhập và ghi rõ sân golf, thời gian tee-off nếu có, ăn uống và di chuyển." : ""}
- Toàn bộ nội dung chữ xuất hiện trong ảnh phải là tiếng Trung Giản thể, ngoại trừ tên thương hiệu tiếng Anh nếu cần giữ nguyên.`;
  }

  return `BODY - LỊCH TRÌNH:
Chia thành ${trip.days} khối lớn cho từng ngày: ${daySections}.
${sharedLayout}

Quy tắc tự động lập lịch trình:
${get("itineraryRules")}

Thời gian bắt đầu các ngày GPT tự lập lịch trình:
${formatAutoStartTimesForPrompt()}

Timeline ngày cuối do tôi nhập:
${formatAutoFinalDayForPrompt()}

Yêu cầu nội dung lịch trình:
- Tự tạo đủ ${trip.days} ngày và ${trip.nights} đêm, không thiếu ngày, không thêm ngày ngoài thời lượng.
- Với các ngày từ 第1天 đến 第${Math.max(trip.days - 1, 1)}天, GPT tự lập lịch trình dựa trên điểm đến chi tiết và giờ bắt đầu đã nhập.
- Riêng ngày cuối 第${trip.days}天, bắt buộc dùng timeline do tôi nhập; không tự thay đổi thời gian bắt đầu hoặc hoạt động chính.
- Dựa vào điểm đến chi tiết để chọn địa danh phù hợp cho từng ngày GPT tự lập.
- Sắp xếp địa điểm theo tuyến đường hợp lý, tránh di chuyển vòng lại không cần thiết.
- Tối ưu hành trình theo khu vực địa lý: nhóm các điểm gần nhau trong cùng một buổi hoặc cùng một ngày.
- Hạn chế tối đa di chuyển xa nhiều lần trong ngày; không đi từ Đà Nẵng sang Hội An rồi quay lại Đà Nẵng nếu không thật sự cần thiết.
- Ưu tiên thứ tự tuyến đường thuận tiện nhất, tiết kiệm thời gian di chuyển và phù hợp nhịp nghỉ dưỡng.
- Nếu có nhiều điểm được chọn, chỉ chọn số lượng điểm phù hợp với thời lượng; không nhồi quá nhiều điểm khiến lịch trình gấp gáp.
- Mỗi ngày cần có hoạt động sáng, trưa, chiều, tối nếu phù hợp với logic di chuyển.
- Các ngày GPT tự lập phải bắt đầu timeline từ đúng giờ bắt đầu đã nhập cho ngày đó.
- Các mốc giờ tiếp theo trong ngày GPT tự lập phải được sắp xếp logic sau giờ bắt đầu, không tạo hoạt động sớm hơn giờ bắt đầu.
- Ngày cuối phải hiển thị theo từng dòng thời gian bắt đầu dạng HH:MM từ timeline tôi nhập.
- Mỗi ngày GPT tự lập phải có ít nhất 4 mốc giờ cụ thể dạng HH:MM.
${buildAutoItineraryImageRule(itineraryImageModeValue)}
${includeGolf ? "- Nếu là tour golf, mỗi ngày có golf cần ghi rõ sân golf, thời gian tee-off dự kiến, thời lượng chơi, ăn uống và di chuyển." : ""}
- Toàn bộ nội dung chữ xuất hiện trong ảnh phải là tiếng Trung Giản thể, ngoại trừ tên thương hiệu tiếng Anh nếu cần giữ nguyên.`;
}

function formatManualItineraryForPrompt() {
  const days = getManualItineraryDays();
  if (days.length === 0 || days.every((day) => day.rows.length === 0)) {
    return "Chưa nhập lịch trình tự viết.";
  }

  return days
    .map((day) => {
      const rows = day.rows.length
        ? day.rows.map((row) => `  - ${row.time || "未定时间"} | ${row.activity || "未填写活动内容"}`).join("\n")
        : "  - Chưa nhập nội dung cho ngày này.";
      return `第${day.day}天:\n${rows}`;
    })
    .join("\n");
}

function buildCostBudgetPromptBlock(get, totalCost) {
  return `KHỐI CHI PHÍ / COST BUDGET:
- Nếu có yêu cầu tính phí, thêm một block riêng nằm sau phần lịch trình và trước khối khách sạn.
- Tiêu đề gợi ý: "成本预算 | Cost Budget".
- Trình bày dạng bảng cao cấp, dễ đọc, có icon tiền/xe/golf/khách sạn.
- Font chữ trong bảng chi phí phải theo cấu hình "${get("costFontSize")}", số tiền và TOTAL phải lớn hơn hoặc đậm hơn nội dung thường.
- Tính theo đúng số lượng khách đã nhập: ${get("guestCount")}人标准.
- Đơn vị tiền tệ bắt buộc: Việt Nam Đồng (VND / 越南盾).
- Không dùng Nhân dân tệ, CNY, RMB, 人民币 hoặc 元 trong bảng chi phí.
- Hàng chi phí xe phải tách riêng và nêu rõ là "用车成本".
- Chỉ hiển thị đúng hạng mục, chi tiết và chi phí từ "Bảng chi phí do tôi nhập".
- Nếu hạng mục nào chưa nhập chi phí, hiển thị "待确认" thay vì tự tạo số tiền.
- Bắt buộc có dòng "TOTAL / 总计" ở cuối bảng chi phí, giá trị là ${totalCost}.
- Không thêm dòng ghi chú/备注 kiểu "以上费用以客户提供信息为准" hoặc các ghi chú báo giá khác.`;
}

function schedulePromptUpdate() {
  clearTimeout(promptUpdateTimer);
  promptUpdateTimer = setTimeout(() => {
    updatePrompt("Prompt tự động cập nhật.");
  }, 250);
}

function updatePrompt(message) {
  promptOutput.value = buildPrompt();
  if (message) setStatus(message);
}

function parseDuration(value) {
  const normalized = String(value || "");
  const numbers = normalized.match(/\d+/g)?.map(Number) || [];
  const days = clamp(numbers[0] || 5, 1, 30);
  const explicitNights = numbers[1];
  const nights = clamp(explicitNights ?? Math.max(days - 1, 0), 0, 30);
  return { days, nights };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function downloadImage() {
  if (!currentImageDataUrl) return;
  const link = document.createElement("a");
  link.href = currentImageDataUrl;
  link.download = "tour-brochure.png";
  document.body.append(link);
  link.click();
  link.remove();
}

function exportExcel() {
  renderItinerarySummary();
  updateCostTotal();
  updatePrompt("Đã xuất dữ liệu Excel.");

  const workbook = buildExcelWorkbook();
  const blob = new Blob([workbook], {
    type: "application/vnd.ms-excel;charset=utf-8"
  });
  const fileName = `tour-itinerary-cost-${new Date().toISOString().slice(0, 10)}.xls`;
  downloadBlob(blob, fileName);
}

function buildExcelWorkbook() {
  const itineraryRows = buildItineraryExcelRows();
  const costRows = buildCostExcelRows();

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
      <Font ss:FontName="Arial" ss:Size="11"/>
    </Style>
    <Style ss:ID="Title">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Arial" ss:Bold="1" ss:Size="16" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F6B5D" ss:Pattern="Solid"/>
      <Borders>${borderXml()}</Borders>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:FontName="Arial" ss:Bold="1" ss:Size="12"/>
      <Interior ss:Color="#D9EAD3" ss:Pattern="Solid"/>
      <Borders>${borderXml()}</Borders>
    </Style>
    <Style ss:ID="Cell">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
      <Borders>${borderXml()}</Borders>
    </Style>
    <Style ss:ID="Label">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
      <Font ss:FontName="Arial" ss:Bold="1"/>
      <Interior ss:Color="#F5EAD1" ss:Pattern="Solid"/>
      <Borders>${borderXml()}</Borders>
    </Style>
    <Style ss:ID="Money">
      <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>${borderXml()}</Borders>
    </Style>
    <Style ss:ID="Total">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Arial" ss:Bold="1" ss:Size="12"/>
      <Interior ss:Color="#F5EAD1" ss:Pattern="Solid"/>
      <Borders>${borderXml()}</Borders>
    </Style>
  </Styles>
  ${worksheetXml("Lich trinh", itineraryRows, [170, 760])}
  ${worksheetXml("Chi phi", costRows, [210, 560, 150])}
</Workbook>`;
}

function buildItineraryExcelRows() {
  const data = new FormData(form);
  const get = (name) => String(data.get(name) || "").trim();
  const trip = parseDuration(get("duration"));
  const itineraryModeValue = get("itineraryMode") || "auto";
  const includeHotel = data.get("enableHotel") === "on";
  const rows = [
    [{ value: "LỊCH TRÌNH", style: "Title", mergeAcross: 1 }],
    [{ value: "Trường", style: "Header" }, { value: "Nội dung", style: "Header" }],
    [labelCell("Gợi ý title"), cell(get("tourTitle"))],
    [labelCell("Thời lượng"), cell(get("duration"))],
    [labelCell("Điểm đến"), cell(get("destination"))],
    [labelCell("Điểm đến chi tiết"), cell(get("destinationDetails"))],
    [labelCell("Loại lịch trình"), cell(itineraryModeLabel(itineraryModeValue))],
    [labelCell("Yêu cầu gốc của khách"), cell(get("clientRequest"))],
    [labelCell("Số trận golf"), cell(get("golfRounds"))],
    [labelCell("Sân golf / điểm golf"), cell(get("golfCourses"))],
    [labelCell("Số lượng khách"), cell(`${get("guestCount")} người`)],
    [],
    [{ value: "Ngày", style: "Header" }, { value: "Yêu cầu lịch trình", style: "Header" }]
  ];

  if (itineraryModeValue === "manual") {
    for (const day of getManualItineraryDays()) {
      rows.push([
        labelCell(`第${day.day}天`),
        cell(day.rows.map((row) => `${row.time || "未定时间"} | ${row.activity || "未填写活动内容"}`).join("\n") || "Chưa nhập nội dung cho ngày này.")
      ]);
    }
  } else if (itineraryModeValue === "image") {
    rows.push([
      labelCell("Ảnh lịch trình"),
      cell(scheduleImageName || "Ảnh lịch trình tham khảo sẽ được upload kèm trong GPT.")
    ]);
    rows.push([labelCell("Yêu cầu tham khảo ảnh"), cell(get("scheduleImageInstruction"))]);
  } else {
    for (let index = 0; index < Math.max(trip.days - 1, 0); index += 1) {
      rows.push([
        labelCell(`第${index + 1}天`),
        cell(`GPT tự lập timeline từ ${getAutoStartTimes()[index]?.startTime || defaultAutoStartTime(index + 1)} dựa trên điểm đến chi tiết, sân golf và logic di chuyển.`)
      ]);
    }

    rows.push([
      labelCell(`第${trip.days}天`),
      cell(getAutoFinalDayRows().map((row) => `${row.start || "未定时间"} | ${row.activity || "未填写活动内容"}`).join("\n") || "Chưa nhập timeline ngày cuối.")
    ]);
  }
  if (includeHotel) {
    rows.push(
      [],
      [{ value: "KHÁCH SẠN", style: "Header" }, { value: "Nội dung", style: "Header" }],
      [labelCell("Tiêu đề block"), cell(get("hotelTitle"))],
      [labelCell("Tên khách sạn"), cell(get("hotelName"))],
      [labelCell("Hình ảnh khách sạn"), cell(get("hotelImages"))],
      [labelCell("Tiện ích"), cell(get("hotelAmenities"))]
    );
  }

  rows.push([], [labelCell("Quy tắc tạo lịch trình"), cell(get("itineraryRules"))]);
  return rows;
}

function itineraryModeLabel(value) {
  if (value === "manual") return "Lịch trình tự viết";
  if (value === "image") return "Tham khảo ảnh lịch trình";
  return "Lịch trình tự động";
}

function buildCostExcelRows() {
  const rows = [
    [{ value: "CHI PHÍ", style: "Title", mergeAcross: 2 }],
    [
      { value: "Hạng mục", style: "Header" },
      { value: "Chi tiết", style: "Header" },
      { value: "Chi phí (VND)", style: "Header" }
    ]
  ];

  for (const item of getCostItems()) {
    rows.push([
      cell(item.item),
      cell(item.detail),
      moneyCell(item.cost || "待确认")
    ]);
  }

  rows.push([
    { value: "TOTAL / 总计", style: "Total", mergeAcross: 1 },
    { value: calculateCostTotal(), style: "Total", type: "Number" }
  ]);
  return rows;
}

function worksheetXml(name, rows, widths = []) {
  const columns = widths.map((width) => `<Column ss:Width="${width}"/>`).join("");
  const tableRows = rows.map((row) => {
    const cells = row.map((cell) => cellXml(cell)).join("");
    return `<Row>${cells}</Row>`;
  }).join("");

  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${columns}${tableRows}</Table></Worksheet>`;
}

function cellXml(cell) {
  if (cell === undefined || cell === null) {
    return "<Cell><Data ss:Type=\"String\"></Data></Cell>";
  }

  if (typeof cell === "object") {
    const style = cell.style || "Cell";
    const type = cell.type || inferCellType(cell.value);
    const merge = cell.mergeAcross ? ` ss:MergeAcross="${cell.mergeAcross}"` : "";
    return `<Cell ss:StyleID="${escapeXml(style)}"${merge}><Data ss:Type="${type}">${escapeXml(cell.value)}</Data></Cell>`;
  }

  const value = String(cell);
  const type = inferCellType(value);
  const output = type === "Number" ? value.replace(/,/g, "") : value;
  return `<Cell ss:StyleID="Cell"><Data ss:Type="${type}">${escapeXml(output)}</Data></Cell>`;
}

function cell(value) {
  return { value, style: "Cell" };
}

function labelCell(value) {
  return { value, style: "Label" };
}

function moneyCell(value) {
  const amount = parseCostAmount(value);
  if (amount > 0 || String(value).trim() === "0") {
    return { value: amount, style: "Money", type: "Number" };
  }
  return { value, style: "Cell" };
}

function inferCellType(value) {
  const text = String(value ?? "");
  return text.trim() !== "" && /^-?\d+(\.\d+)?$/.test(text.replace(/,/g, "")) ? "Number" : "String";
}

function borderXml() {
  return [
    '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B7C8C3"/>',
    '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B7C8C3"/>',
    '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B7C8C3"/>',
    '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B7C8C3"/>'
  ].join("");
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyPrompt() {
  clearTimeout(promptUpdateTimer);
  renderItinerarySummary();
  updateCostTotal();
  const prompt = normalizePromptText(buildPrompt());
  promptOutput.value = prompt;

  try {
    await copyPlainText(prompt);
    showCopyNotice("Đã copy prompt");
    setStatus("Đã copy prompt dạng text, có thể paste vào GPT.");
  } catch {
    selectPromptText();
    showCopyNotice("Hãy copy thủ công");
    setStatus("Không copy tự động được. Prompt đã được bôi đen để bạn copy.", true);
  }
}

async function copyPlainText(text) {
  if (navigator.clipboard?.write && window.ClipboardItem) {
    const blob = new Blob([text], { type: "text/plain" });
    await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.inset = "0 auto auto 0";
  helper.style.width = "1px";
  helper.style.height = "1px";
  helper.style.opacity = "0";
  document.body.append(helper);
  helper.focus();
  helper.select();

  const copied = document.execCommand("copy");
  helper.remove();

  if (!copied) {
    throw new Error("Copy command failed.");
  }
}

function normalizePromptText(text) {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function selectPromptText() {
  promptOutput.focus();
  promptOutput.select();
  promptOutput.setSelectionRange(0, promptOutput.value.length);
}

function showCopyNotice(message) {
  copyNotice.textContent = message;
  clearTimeout(copyNoticeTimer);
  copyNoticeTimer = setTimeout(() => {
    copyNotice.textContent = "";
  }, 2200);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
