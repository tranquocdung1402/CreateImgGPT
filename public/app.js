let logoDataUrl = "";
let currentImageDataUrl = "";

const form = document.querySelector("#promptForm");
const itinerarySummary = document.querySelector("#itinerarySummary");
const promptOutput = document.querySelector("#promptOutput");
const statusText = document.querySelector("#statusText");
const imagePreview = document.querySelector("#imagePreview");
const downloadButton = document.querySelector("#downloadButton");
const copyNotice = document.querySelector("#copyNotice");
const durationInput = form.elements.duration;
const destinationInput = form.elements.destination;
const tourTitleInput = form.elements.tourTitle;
let copyNoticeTimer;
let promptUpdateTimer;

syncTourTitle();
renderItinerarySummary();
promptOutput.value = buildPrompt();

form.addEventListener("input", (event) => {
  if (event.target === durationInput || event.target === destinationInput) {
    syncTourTitle();
    renderItinerarySummary();
  }

  schedulePromptUpdate();
});

document.querySelector("#generatePromptButton").addEventListener("click", () => {
  syncTourTitle();
  renderItinerarySummary();
  updatePrompt("Prompt đã được cập nhật.");
});

document.querySelector("#resetButton").addEventListener("click", () => {
  form.reset();
  syncTourTitle();
  renderItinerarySummary();
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
downloadButton.addEventListener("click", downloadImage);

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

function buildPrompt() {
  const data = new FormData(form);
  const get = (name) => String(data.get(name) || "").trim();
  const trip = parseDuration(get("duration"));
  const daySections = Array.from({ length: trip.days }, (_, index) => `第${index + 1}天`).join(", ");

  return `${get("role")}

Ngôn ngữ hiển thị trong ảnh: ${get("imageLanguage")}.

Nhiệm vụ:
1. Lập lịch trình du lịch ${get("destination")} chi tiết cho ${get("duration")} theo dạng nghỉ dưỡng cao cấp.
2. Nếu có yêu cầu golf/chi phí, tích hợp đầy đủ vào lịch trình và bố cục ảnh.
3. Từ lịch trình đó, tạo một hình ảnh ${get("imageType")} dựa trên nội dung bên dưới.

Điểm đến chính:
${get("destination")}

Điểm đến chi tiết để lựa chọn và phân bổ vào lịch trình:
${get("destinationDetails")}

Định hướng lịch trình:
${get("tourBrief")}

YÊU CẦU GOLF & CHI PHÍ:
- Yêu cầu gốc của khách: ${get("clientRequest")}
- Số trận golf: ${get("golfRounds")}
- Sân golf / điểm golf cần đưa vào lịch trình: ${get("golfCourses")}
- Số lượng khách cần tính giá: ${get("guestCount")} người
- Quy tắc tính phí và trình bày ngân sách: ${get("costBudgetRules")}
- Lịch trình phải phân bổ đủ số trận golf theo thời lượng tour. Với yêu cầu "3球", phải có đủ 3 buổi đánh golf.
- Ngày cuối nếu có yêu cầu "打好球回国" thì sắp xếp đánh golf trước, sau đó ra sân bay về nước.
- Trong ảnh cần có một block riêng về chi phí/ngân sách, trình bày rõ ràng bằng tiếng Trung Giản thể.
- Bảng chi phí phải tính theo đúng số lượng khách: ${get("guestCount")} người.

Phong cách thiết kế:
${get("style")}

Bố cục tổng thể:
- Chia theo chiều dọc thành các section riêng biệt.
- Thiết kế sang trọng, hiện đại, dùng icon máy bay, khách sạn, nhà hàng, xe hơi, máy ảnh, đồng hồ, cáp treo, chùa.
- Màu chủ đạo xanh sang trọng, gold, trắng và các màu sáng chuyên nghiệp.
- Không dùng tông tối làm chủ đạo.

HEADER:
- Logo công ty đặt ở góc trái header. ${get("logoRequirements")}
- Ảnh nền header: ${get("headerImage")}
- Tiêu đề lớn màu vàng: "${get("tourTitle")}"
- Dòng phụ nhỏ hơn: "${get("tourSubtitle")}"

BODY - LỊCH TRÌNH:
Chia thành ${trip.days} khối lớn cho từng ngày: ${daySections}.
Mỗi khối ngày có thanh tiêu đề màu xanh viền gold kèm icon đại diện phù hợp với chủ đề ngày đó.
Trong mỗi khối ngày, chia 2 phần:
- Bên trái: bảng/danh sách timeline dọc. Mỗi dòng bắt đầu bằng icon chức năng nhỏ, tiếp theo là giờ HH:MM, cuối cùng là nội dung hoạt động ngắn gọn bằng tiếng Trung.
- Bên phải: lưới 4 ảnh thumbnail hình chữ nhật bo góc, ảnh thực tế sắc nét của địa danh trong ngày.

Quy tắc tự động lập lịch trình:
${get("itineraryRules")}

Yêu cầu nội dung lịch trình:
- Tự tạo đủ ${trip.days} ngày và ${trip.nights} đêm, không thiếu ngày, không thêm ngày ngoài thời lượng.
- Dựa vào điểm đến chi tiết để chọn địa danh phù hợp cho từng ngày.
- Sắp xếp địa điểm theo tuyến đường hợp lý, tránh di chuyển vòng lại không cần thiết.
- Mỗi ngày cần có hoạt động sáng, trưa, chiều, tối nếu phù hợp với logic di chuyển.
- Mỗi ngày phải có ít nhất 4 mốc giờ cụ thể dạng HH:MM.
- Mỗi ngày phải có đúng 4 thumbnail địa danh/khách sạn/dịch vụ phù hợp với nội dung ngày đó.
- Nếu là tour golf, mỗi ngày có golf cần ghi rõ sân golf, thời gian tee-off dự kiến, thời lượng chơi, ăn uống và di chuyển.
- Toàn bộ nội dung chữ xuất hiện trong ảnh phải là tiếng Trung Giản thể, ngoại trừ tên thương hiệu tiếng Anh nếu cần giữ nguyên.

KHỐI CHI PHÍ / COST BUDGET:
- Nếu có yêu cầu tính phí, thêm một block riêng nằm sau phần lịch trình và trước khối khách sạn.
- Tiêu đề gợi ý: "成本预算 | Cost Budget".
- Trình bày dạng bảng cao cấp, dễ đọc, có icon tiền/xe/golf/khách sạn.
- Tính theo đúng số lượng khách đã nhập: ${get("guestCount")}人标准.
- Hàng chi phí xe phải tách riêng và nêu rõ là "用车成本".
- Các con số nếu không được cung cấp giá chính xác phải ghi là ước tính/dự kiến, không trình bày như báo giá cam kết.

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

YÊU CẦU KỸ THUẬT:
${get("technicalRequirements")}

Hãy tạo ảnh hoàn chỉnh, ưu tiên bố cục dễ đọc, chữ Trung rõ ràng, không lỗi font, không cắt nội dung.`;
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

function syncTourTitle() {
  const trip = parseDuration(durationInput.value);
  tourTitleInput.value = `${trip.days}天${trip.nights}晚轻奢度假行程`;
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

async function copyPrompt() {
  const prompt = normalizePromptText(promptOutput.value || buildPrompt());
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
