const form = document.querySelector("#routePromptForm");
const output = document.querySelector("#routePromptOutput");
const copyButton = document.querySelector("#copyRoutePromptButton");
const copyNotice = document.querySelector("#routeCopyNotice");
let copyNoticeTimer;

function get(name) {
  return (form.elements[name]?.value || "").trim();
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
${get("itinerary")}

Điểm nổi bật cần đưa lên bản đồ:
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

form.addEventListener("input", updatePrompt);
copyButton.addEventListener("click", copyPrompt);
updatePrompt();
