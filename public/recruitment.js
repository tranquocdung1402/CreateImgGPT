const form = document.querySelector("#recruitmentPromptForm");
const output = document.querySelector("#recruitmentPromptOutput");
const copyButton = document.querySelector("#copyRecruitmentPromptButton");
const copyNotice = document.querySelector("#recruitmentCopyNotice");
let copyNoticeTimer;

function get(name) {
  return (form.elements[name]?.value || "").trim();
}

function buildRecruitmentPrompt() {
  const sections = [
    ["VỊ TRÍ TUYỂN DỤNG", get("positions")],
    ["MÔ TẢ CÔNG VIỆC", get("jobDescription")],
    ["YÊU CẦU", get("requirements")],
    ["QUYỀN LỢI", get("benefits")]
  ];
  const content = sections.map(([title, value]) => `${title}:\n${value}`).join("\n\n");
  return `Hãy đóng vai chuyên gia thiết kế đồ họa tuyển dụng chuyên nghiệp.

NHIỆM VỤ
Tạo một ${get("format")} cao cấp cho thông báo tuyển dụng dưới đây. Toàn bộ chữ hiển thị trong ảnh phải là tiếng Việt có dấu, chính xác tuyệt đối.

THƯƠNG HIỆU
- Công ty: ${get("company")}
- Địa điểm làm việc: ${get("location")}
- Tôi sẽ đính kèm một ảnh logo làm ảnh tham chiếu cùng prompt này. Bắt buộc dùng chính ảnh đó làm logo công ty trong poster.
- ${get("logoRule")}

NỘI DUNG BẮT BUỘC
TIÊU ĐỀ LỚN: TUYỂN DỤNG NHÂN SỰ

${content}

THU NHẬP:
- Thử việc: ${get("probationSalary")}
- Sau thử việc: ${get("officialSalary")}
- Thời gian: ${get("schedule")}

LIÊN HỆ NHẬN CV (bắt buộc đặt trong khung CTA nổi bật ở cuối poster):
- Zalo: ${get("zalo")}
- WeChat: ${get("wechat")}
- ${get("cta")}

YÊU CẦU BỐ CỤC VÀ THIẾT KẾ
- Phong cách hiện đại, chuyên nghiệp, đáng tin cậy; chủ đề nhân sự quốc tế và dịch vụ khách hàng cao cấp.
- Dùng tông xanh navy, trắng và vàng kim làm điểm nhấn; nền sáng, tương phản cao, dễ đọc trên điện thoại.
- Header có logo ở góc trên, tiêu đề “TUYỂN DỤNG NHÂN SỰ” lớn và rõ ràng.
- Dùng icon tinh tế cho từng phần: vị trí, địa điểm, thu nhập, thời gian, mô tả, yêu cầu, quyền lợi và liên hệ.
- Phân cấp rõ ràng: vị trí và thu nhập là thông tin nổi bật nhất sau tiêu đề; liên hệ nhận CV là khối CTA nổi bật cuối trang.
- Có hình minh họa nhẹ về nhân viên dịch vụ/đón tiếp khách quốc tế, không che chữ và không làm poster rối.
- Không tự ý thêm số điện thoại, địa chỉ, website, QR code, quyền lợi hoặc điều kiện ngoài nội dung nguồn.

YÊU CẦU CHỮ
- Typography-first: ưu tiên chữ sắc nét, đúng chính tả và đọc được ngay.
- Không dùng chữ nhỏ li ti, chữ lỗi dấu, chữ méo, chữ dính hoặc văn bản giả.
- Tiêu đề tối thiểu 56px; tiêu đề mục 30px+; nội dung tối thiểu 22–26px.
- Với danh sách dài, tăng chiều cao poster và xuống dòng hợp lý; tuyệt đối không thu nhỏ chữ để nhét nội dung.

Tạo một poster hoàn chỉnh, cân bằng, sẵn sàng đăng Facebook/Zalo để tuyển dụng.`;
}

function updatePrompt() {
  output.value = buildRecruitmentPrompt();
}

async function copyPrompt() {
  output.select();
  output.setSelectionRange(0, output.value.length);
  try {
    await navigator.clipboard.writeText(output.value);
  } catch {
    document.execCommand("copy");
  }
  copyNotice.textContent = "Đã copy prompt";
  clearTimeout(copyNoticeTimer);
  copyNoticeTimer = setTimeout(() => { copyNotice.textContent = ""; }, 1800);
}

form.addEventListener("input", updatePrompt);
form.addEventListener("change", updatePrompt);
copyButton.addEventListener("click", copyPrompt);
updatePrompt();
