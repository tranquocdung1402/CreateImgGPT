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

const form = document.querySelector("#promptForm");
const itinerarySummary = document.querySelector("#itinerarySummary");
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
const scheduleImageField = document.querySelector("#scheduleImageField");
const scheduleImageInput = document.querySelector("#scheduleImageInput");
const enableItineraryImages = document.querySelector("#enableItineraryImages");
const enableGolf = document.querySelector("#enableGolf");
const enableCost = document.querySelector("#enableCost");
const golfFields = document.querySelector("#golfFields");
const costMetaFields = document.querySelector("#costMetaFields");
const costFields = document.querySelector("#costFields");
let copyNoticeTimer;
let promptUpdateTimer;

renderCostItems(defaultCostItems);
renderItinerarySummary();
renderOptionVisibility();
promptOutput.value = buildPrompt();

form.addEventListener("input", (event) => {
  if (event.target === durationInput || event.target === destinationInput) {
    renderItinerarySummary();
  }

  schedulePromptUpdate();
});

document.querySelector("#generatePromptButton").addEventListener("click", () => {
  renderItinerarySummary();
  updatePrompt("Prompt đã được cập nhật.");
});

document.querySelector("#resetButton").addEventListener("click", () => {
  form.reset();
  renderCostItems(defaultCostItems);
  renderItinerarySummary();
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
downloadButton.addEventListener("click", downloadImage);

itineraryMode.addEventListener("change", () => {
  renderOptionVisibility();
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

enableItineraryImages.addEventListener("change", () => {
  updatePrompt("Prompt tự động cập nhật.");
});

scheduleImageInput.addEventListener("change", (event) => {
  scheduleImageName = event.target.files?.[0]?.name || "";
  updatePrompt(scheduleImageName ? "Đã nạp tên ảnh lịch trình tham khảo." : "Prompt tự động cập nhật.");
});

function renderOptionVisibility() {
  const useImageItinerary = itineraryMode.value === "image";
  autoItineraryFields.classList.toggle("hidden", useImageItinerary);
  imageItineraryFields.classList.toggle("hidden", !useImageItinerary);
  scheduleImageField.classList.toggle("hidden", !useImageItinerary);

  golfFields.classList.toggle("hidden", !enableGolf.checked);
  costMetaFields.classList.toggle("hidden", !enableCost.checked);
  costFields.classList.toggle("hidden", !enableCost.checked);
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

function renderCostItems(items) {
  costItemsContainer.innerHTML = items.map((item) => costRowTemplate(item)).join("");
  updateCostTotal();
}

function costRowTemplate(item) {
  return `
    <div class="cost-row">
      <input class="cost-item-name" value="${escapeHtml(item.item)}" aria-label="Hạng mục" />
      <input class="cost-item-detail" value="${escapeHtml(item.detail)}" aria-label="Chi tiết" />
      <input class="cost-item-amount" value="${escapeHtml(item.cost)}" inputmode="numeric" aria-label="Chi phí" placeholder="VD: 1200" />
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

costItemsContainer.addEventListener("input", () => {
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
    const cost = item.cost ? `${item.cost} 元` : "Chưa nhập chi phí";
    return `${index + 1}. ${item.item} | ${item.detail} | ${cost}`;
  });

  return ["Hạng mục | Chi tiết | Chi phí (元 - Tệ)", ...rows, `TOTAL | 总计 | ${formatCurrency(calculateCostTotal())}`].join("\n");
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

function formatCurrency(value) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value)} 元`;
}

function buildPrompt() {
  const data = new FormData(form);
  const get = (name) => String(data.get(name) || "").trim();
  const trip = parseDuration(get("duration"));
  const daySections = Array.from({ length: trip.days }, (_, index) => `第${index + 1}天`).join(", ");
  const useAutoItinerary = get("itineraryMode") !== "image";
  const includeItineraryImages = data.get("enableItineraryImages") === "on";
  const includeGolf = data.get("enableGolf") === "on";
  const includeCost = data.get("enableCost") === "on";
  const titleHint = get("tourTitle");
  const subtitleHint = get("tourSubtitle");
  const titleHintLine = titleHint ? `- Gợi ý title nếu phù hợp: "${titleHint}"` : "- Không có gợi ý title cố định; tự tạo title tiếng Trung mới theo nội dung lịch trình.";
  const subtitleHintLine = subtitleHint ? `- Gợi ý subtitle nếu phù hợp: "${subtitleHint}"` : "- Không có gợi ý subtitle cố định; tự tạo subtitle tiếng Trung mới theo nội dung lịch trình.";
  const costTable = formatCostItemsForPrompt();
  const totalCost = formatCurrency(calculateCostTotal());
  const tasks = [
    useAutoItinerary
      ? `Lập lịch trình du lịch ${get("destination")} chi tiết cho ${get("duration")} theo dạng nghỉ dưỡng cao cấp.`
      : "Đọc ảnh lịch trình tham khảo được cung cấp và chuyển nội dung trong ảnh đó thành phần lịch trình của brochure.",
    includeGolf || includeCost ? "Tích hợp đầy đủ các yêu cầu Golf/Chi phí đang được bật vào lịch trình và bố cục ảnh." : "",
    `Từ nội dung đó, tạo một hình ảnh ${get("imageType")} dựa trên nội dung bên dưới.`
  ].filter(Boolean);
  const golfCostBlock = buildGolfCostPromptBlock(get, includeGolf, includeCost, costTable, totalCost);
  const itineraryBlock = buildItineraryPromptBlock(get, trip, daySections, useAutoItinerary, includeGolf, includeItineraryImages);
  const costBudgetBlock = includeCost ? buildCostBudgetPromptBlock(get, totalCost) : "";

  return `${get("role")}

Ngôn ngữ hiển thị trong ảnh: ${get("imageLanguage")}.

QUY TẮC ƯU TIÊN TÀI LIỆU THAM CHIẾU:
- Nếu tôi upload ảnh logo, hãy dùng ảnh logo đó làm nguồn duy nhất cho logo. Không tự vẽ lại logo, không đổi màu, không đổi tỷ lệ, không tạo logo mới.
${useAutoItinerary ? "" : "- Nếu tôi upload ảnh lịch trình, hãy dùng ảnh lịch trình đó làm nguồn chính cho nội dung lịch trình. Không tự lập lịch trình mới và không tự thêm địa điểm không có trong ảnh."}

Nhiệm vụ:
${tasks.map((task, index) => `${index + 1}. ${task}`).join("\n")}

Điểm đến chính:
${get("destination")}

${useAutoItinerary ? "Điểm đến chi tiết để lựa chọn và phân bổ vào lịch trình:" : "Điểm đến chi tiết chỉ dùng làm ngữ cảnh phụ, không được dùng để thay đổi lịch trình trong ảnh tham khảo:"}
${get("destinationDetails")}

Định hướng lịch trình:
${useAutoItinerary ? get("tourBrief") : "Bám theo ảnh lịch trình tham khảo. Không tự chọn và phân bổ địa danh nếu ảnh lịch trình đã có nội dung rõ ràng."}

${golfCostBlock}

Phong cách thiết kế:
${get("style")}

Bố cục tổng thể:
- Chia theo chiều dọc thành các section riêng biệt.
- Thiết kế sang trọng, hiện đại, dùng icon máy bay, khách sạn, nhà hàng, xe hơi, máy ảnh, đồng hồ, cáp treo, chùa.
- Màu chủ đạo xanh sang trọng, gold, trắng và các màu sáng chuyên nghiệp.
- Không dùng tông tối làm chủ đạo.
- Kích cỡ chữ phần lịch trình: ${get("itineraryFontSize")}. Không dùng chữ quá nhỏ; timeline, giờ, hoạt động và caption phải đọc rõ trên ảnh dọc.
${includeCost ? `- Kích cỡ chữ phần chi phí: ${get("costFontSize")}. Bảng chi phí, hạng mục, chi tiết, số tiền và TOTAL phải nổi bật, dễ đọc, không bị chen chúc.` : ""}

HEADER:
- Ảnh logo tham chiếu được cung cấp, ưu tiên giữ nguyên hình dáng, màu vàng, tỷ lệ, chi tiết và phong cách của logo tham chiếu; không tự sáng tạo logo mới.
- ${get("logoRequirements")}
- Logo trong header phải là logo duy nhất trong toàn bộ ảnh. Không thêm, không lặp, không biến thể logo ở bất kỳ vị trí nào khác.
- Ảnh nền header: ${get("headerImage")}
- Tự tạo tiêu đề lớn bằng tiếng Trung, màu vàng, dựa trên nội dung lịch trình thực tế.
${titleHintLine}
- Nếu lịch trình có golf, title phải nhấn mạnh trải nghiệm golf cao cấp, nghe hấp dẫn và khác biệt hơn title du lịch chung.
- Nếu lịch trình không có golf, title phải nhấn mạnh chủ đề chính của lịch trình như nghỉ dưỡng biển, văn hóa, gia đình, luxury resort hoặc khám phá.
- Không dùng title chung chung kiểu "5天4晚轻奢度假行程" nếu lịch trình có chủ đề rõ ràng.
- Tự tạo dòng phụ nhỏ hơn bằng tiếng Trung, ngắn gọn, giàu cảm xúc, bám nội dung lịch trình.
${subtitleHintLine}

${itineraryBlock}

${costBudgetBlock}

KHỐI KHÁCH SẠN:
- Vị trí: gần cuối body.
- Tiêu đề: "${get("hotelTitle")}"
- Tên khách sạn nổi bật: "${get("hotelName")}"
- Hình ảnh minh họa: ${get("hotelImages")}
- Tiện ích kèm icon nhỏ: ${get("hotelAmenities")}

KHỐI DỊCH VỤ ĐƯA ĐÓN VIP:
- Vị trí: cuối body, ngay phía trên footer.
- Tiêu đề: "${get("vipTitle")}"
- Hình ảnh minh họa: ${get("vipImages")}
- Tiện ích kèm icon nhỏ: ${get("vipAmenities")}

FOOTER:
- Bên trái: dòng lớn "${get("companyChinese")}", dòng dưới "${get("companyEnglish")}".
- Ở giữa: icon điện thoại + "咨询热线: ${get("hotline")}".
- Ở giữa: icon địa điểm + "公司地址: ${get("address")}".
- Bên phải: slogan thư pháp tiếng Trung "${get("slogan")}".
- Footer chỉ có chữ, icon điện thoại và icon địa điểm như mô tả; tuyệt đối không đặt logo công ty, không dùng biểu tượng logo, không lặp lại hình ảnh logo ở Footer.

YÊU CẦU KỸ THUẬT:
${get("technicalRequirements")}

IMAGE QUALITY KEYWORDS:
${get("imageQuality")}

Hãy tạo ảnh hoàn chỉnh với độ sắc nét cao nhất, ưu tiên bố cục dễ đọc, chữ Trung rõ ràng, không lỗi font, không cắt nội dung.`;
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
    lines.push("- Đơn vị tiền tệ bắt buộc: tiền Trung Quốc, Nhân dân tệ (CNY / RMB / 人民币 / 元).");
    lines.push("- Trong ảnh cần có một block riêng về chi phí/ngân sách, trình bày rõ ràng bằng tiếng Trung Giản thể.");
    lines.push(`- Bảng chi phí phải tính theo đúng số lượng khách: ${get("guestCount")} người.`);
    lines.push("- Tất cả số tiền trong ảnh bắt buộc dùng tiền Trung Quốc: Nhân dân tệ (CNY / RMB / 人民币 / 元).");
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

function buildItineraryPromptBlock(get, trip, daySections, useAutoItinerary, includeGolf, includeItineraryImages) {
  const imageLayout = includeItineraryImages
    ? "- Bên phải: lưới 4 ảnh thumbnail hình chữ nhật bo góc, ảnh thực tế sắc nét của địa danh trong ngày; mỗi ảnh có caption tiếng Trung màu vàng trên banner xanh đen mờ."
    : "- Không cần lưới ảnh/thumbnail trong từng ngày lịch trình. Ưu tiên timeline chữ rõ ràng, bố cục thoáng và dễ đọc.";
  const sharedLayout = `Mỗi khối ngày có thanh tiêu đề màu xanh viền gold kèm icon đại diện phù hợp với chủ đề ngày đó.
Trong mỗi khối ngày, chia 2 phần:
- Bên trái: bảng/danh sách timeline dọc. Mỗi dòng bắt đầu bằng icon chức năng nhỏ, tiếp theo là giờ HH:MM, cuối cùng là nội dung hoạt động ngắn gọn bằng tiếng Trung.
${imageLayout}
- Font chữ trong các block lịch trình phải theo cấu hình "${get("itineraryFontSize")}", ưu tiên độ rõ hơn số lượng chữ; nếu nội dung dài thì tăng chiều cao section thay vì giảm font quá nhỏ.`;

  if (!useAutoItinerary) {
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

  return `BODY - LỊCH TRÌNH:
Chia thành ${trip.days} khối lớn cho từng ngày: ${daySections}.
${sharedLayout}

Quy tắc tự động lập lịch trình:
${get("itineraryRules")}

Yêu cầu nội dung lịch trình:
- Tự tạo đủ ${trip.days} ngày và ${trip.nights} đêm, không thiếu ngày, không thêm ngày ngoài thời lượng.
- Dựa vào điểm đến chi tiết để chọn địa danh phù hợp cho từng ngày.
- Sắp xếp địa điểm theo tuyến đường hợp lý, tránh di chuyển vòng lại không cần thiết.
- Mỗi ngày cần có hoạt động sáng, trưa, chiều, tối nếu phù hợp với logic di chuyển.
- Mỗi ngày phải có ít nhất 4 mốc giờ cụ thể dạng HH:MM.
${includeItineraryImages ? "- Mỗi ngày phải có đúng 4 thumbnail địa danh/khách sạn/dịch vụ phù hợp với nội dung ngày đó." : "- Không yêu cầu thumbnail ảnh trong từng ngày."}
${includeGolf ? "- Nếu là tour golf, mỗi ngày có golf cần ghi rõ sân golf, thời gian tee-off dự kiến, thời lượng chơi, ăn uống và di chuyển." : ""}
- Toàn bộ nội dung chữ xuất hiện trong ảnh phải là tiếng Trung Giản thể, ngoại trừ tên thương hiệu tiếng Anh nếu cần giữ nguyên.`;
}

function buildCostBudgetPromptBlock(get, totalCost) {
  return `KHỐI CHI PHÍ / COST BUDGET:
- Nếu có yêu cầu tính phí, thêm một block riêng nằm sau phần lịch trình và trước khối khách sạn.
- Tiêu đề gợi ý: "成本预算 | Cost Budget".
- Trình bày dạng bảng cao cấp, dễ đọc, có icon tiền/xe/golf/khách sạn.
- Font chữ trong bảng chi phí phải theo cấu hình "${get("costFontSize")}", số tiền và TOTAL phải lớn hơn hoặc đậm hơn nội dung thường.
- Tính theo đúng số lượng khách đã nhập: ${get("guestCount")}人标准.
- Đơn vị tiền tệ bắt buộc: tiền Trung Quốc, Nhân dân tệ (CNY / RMB / 人民币 / 元).
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
  const rows = [
    [{ value: "LỊCH TRÌNH", style: "Title", mergeAcross: 1 }],
    [{ value: "Trường", style: "Header" }, { value: "Nội dung", style: "Header" }],
    [labelCell("Gợi ý title"), cell(get("tourTitle"))],
    [labelCell("Thời lượng"), cell(get("duration"))],
    [labelCell("Điểm đến"), cell(get("destination"))],
    [labelCell("Điểm đến chi tiết"), cell(get("destinationDetails"))],
    [labelCell("Yêu cầu gốc của khách"), cell(get("clientRequest"))],
    [labelCell("Số trận golf"), cell(get("golfRounds"))],
    [labelCell("Sân golf / điểm golf"), cell(get("golfCourses"))],
    [labelCell("Số lượng khách"), cell(`${get("guestCount")} người`)],
    [],
    [{ value: "Ngày", style: "Header" }, { value: "Yêu cầu lịch trình", style: "Header" }]
  ];

  for (let index = 0; index < trip.days; index += 1) {
    rows.push([
      labelCell(`第${index + 1}天`),
      cell("Tự lập timeline sáng/trưa/chiều/tối dựa trên điểm đến chi tiết, sân golf và logic di chuyển.")
    ]);
  }

  rows.push([], [labelCell("Quy tắc tạo lịch trình"), cell(get("itineraryRules"))]);
  return rows;
}

function buildCostExcelRows() {
  const rows = [
    [{ value: "CHI PHÍ", style: "Title", mergeAcross: 2 }],
    [
      { value: "Hạng mục", style: "Header" },
      { value: "Chi tiết", style: "Header" },
      { value: "Chi phí (元 - Tệ)", style: "Header" }
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
