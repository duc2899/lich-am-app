export type QuoteCategory = "tucngu" | "loikhuyen";

export type QuoteItem = {
  text: string;
  category: QuoteCategory;
};

// 100 câu: ca dao/tục ngữ Việt Nam (dân gian, không có tác giả cụ thể) + lời khuyên ngắn.
// Chọn cố định 1 câu/ngày dựa theo ngày trong năm -- xem utils/dailyQuote.ts
export const QUOTES: QuoteItem[] = [
  { text: "Có công mài sắt, có ngày nên kim.", category: "tucngu" },
  { text: "Đi một ngày đàng, học một sàng khôn.", category: "tucngu" },
  { text: "Uống nước nhớ nguồn.", category: "tucngu" },
  { text: "Ăn quả nhớ kẻ trồng cây.", category: "tucngu" },
  { text: "Lá lành đùm lá rách.", category: "tucngu" },
  {
    text: "Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao.",
    category: "tucngu",
  },
  { text: "Tốt gỗ hơn tốt nước sơn.", category: "tucngu" },
  { text: "Gần mực thì đen, gần đèn thì sáng.", category: "tucngu" },
  { text: "Cái nết đánh chết cái đẹp.", category: "tucngu" },
  { text: "Đói cho sạch, rách cho thơm.", category: "tucngu" },
  { text: "Thất bại là mẹ thành công.", category: "tucngu" },
  { text: "Không thầy đố mày làm nên.", category: "tucngu" },
  { text: "Học thầy không tày học bạn.", category: "tucngu" },
  { text: "Ăn chắc mặc bền.", category: "tucngu" },
  { text: "Của bền tại người.", category: "tucngu" },
  { text: "Có chí thì nên.", category: "tucngu" },
  { text: "Nước chảy đá mòn.", category: "tucngu" },
  { text: "Kiến tha lâu cũng đầy tổ.", category: "tucngu" },
  { text: "Chậm mà chắc.", category: "tucngu" },
  { text: "Muốn ăn thì lăn vào bếp.", category: "tucngu" },
  { text: "Tay làm hàm nhai, tay quai miệng trễ.", category: "tucngu" },
  { text: "Cần cù bù thông minh.", category: "tucngu" },
  { text: "Góp gió thành bão.", category: "tucngu" },
  { text: "Năng nhặt chặt bị.", category: "tucngu" },
  { text: "Nhất nghệ tinh, nhất thân vinh.", category: "tucngu" },
  { text: "Trọng thầy mới được làm thầy.", category: "tucngu" },
  { text: "Tiên học lễ, hậu học văn.", category: "tucngu" },
  { text: "Một chữ cũng là thầy, nửa chữ cũng là thầy.", category: "tucngu" },
  {
    text: "Muốn sang thì bắc cầu kiều, muốn con hay chữ thì yêu lấy thầy.",
    category: "tucngu",
  },
  { text: "Anh em như thể tay chân.", category: "tucngu" },
  { text: "Chị ngã em nâng.", category: "tucngu" },
  { text: "Máu chảy ruột mềm.", category: "tucngu" },
  { text: "Một giọt máu đào hơn ao nước lã.", category: "tucngu" },
  {
    text: "Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra.",
    category: "tucngu",
  },
  { text: "Con hơn cha là nhà có phúc.", category: "tucngu" },
  {
    text: "Cá không ăn muối cá ươn, con cãi cha mẹ trăm đường con hư.",
    category: "tucngu",
  },
  { text: "Ơn cha nghĩa mẹ trìu mến.", category: "tucngu" },
  { text: "Đi khắp thế gian không ai tốt bằng mẹ.", category: "tucngu" },
  { text: "Nuôi con mới biết lòng cha mẹ.", category: "tucngu" },
  { text: "Gừng càng già càng cay.", category: "tucngu" },
  { text: "Kính lão đắc thọ.", category: "tucngu" },
  { text: "Kính trên nhường dưới.", category: "tucngu" },
  { text: "Yêu nhau lắm, cắn nhau đau.", category: "tucngu" },
  { text: "Xa mặt cách lòng.", category: "tucngu" },
  { text: "Đồng cam cộng khổ.", category: "tucngu" },
  { text: "Một miếng khi đói bằng một gói khi no.", category: "tucngu" },
  {
    text: "Bầu ơi thương lấy bí cùng, tuy rằng khác giống nhưng chung một giàn.",
    category: "tucngu",
  },
  {
    text: "Nhiễu điều phủ lấy giá gương, người trong một nước phải thương nhau cùng.",
    category: "tucngu",
  },
  { text: "Thương người như thể thương thân.", category: "tucngu" },
  { text: "Một con ngựa đau, cả tàu bỏ cỏ.", category: "tucngu" },
  { text: "Chín bỏ làm mười.", category: "tucngu" },
  {
    text: "Lời nói chẳng mất tiền mua, lựa lời mà nói cho vừa lòng nhau.",
    category: "tucngu",
  },
  { text: "Học ăn, học nói, học gói, học mở.", category: "tucngu" },
  { text: "Uốn lưỡi bảy lần trước khi nói.", category: "tucngu" },
  { text: "Im lặng là vàng.", category: "tucngu" },
  { text: "Nói phải củ cải cũng nghe.", category: "tucngu" },
  {
    text: "Biết thì thưa thốt, không biết thì dựa cột mà nghe.",
    category: "tucngu",
  },
  { text: "Có làm thì mới có ăn.", category: "tucngu" },
  { text: "Ăn cây nào rào cây ấy.", category: "tucngu" },
  { text: "Buôn có bạn, bán có phường.", category: "tucngu" },
  { text: "Bán anh em xa, mua láng giềng gần.", category: "tucngu" },
  { text: "Xa thơm gần thối.", category: "tucngu" },
  { text: "Ở hiền gặp lành.", category: "tucngu" },
  { text: "Gieo gió gặt bão.", category: "tucngu" },
  { text: "Cây ngay không sợ chết đứng.", category: "tucngu" },
  { text: "Thẳng như ruột ngựa.", category: "tucngu" },
  { text: "Giấy rách phải giữ lấy lề.", category: "tucngu" },
  { text: "Đường dài mới biết ngựa hay.", category: "tucngu" },
  { text: "Lửa thử vàng, gian nan thử sức.", category: "tucngu" },
  { text: "Có chí làm quan, có gan làm giàu.", category: "tucngu" },
  { text: "Muốn biết phải hỏi, muốn giỏi phải học.", category: "tucngu" },
  { text: "Học, học nữa, học mãi.", category: "loikhuyen" },
  {
    text: "Không có việc gì khó, chỉ sợ lòng không bền.",
    category: "loikhuyen",
  },
  {
    text: "Kỷ luật là cây cầu nối giữa mục tiêu và thành tựu.",
    category: "loikhuyen",
  },
  {
    text: "Hôm nay khó khăn, ngày mai càng khó khăn hơn, nhưng ngày kia sẽ tươi sáng.",
    category: "loikhuyen",
  },
  {
    text: "Đừng đợi đến ngày mai những gì có thể làm hôm nay.",
    category: "loikhuyen",
  },
  { text: "Sai lầm lớn nhất là không dám bắt đầu.", category: "loikhuyen" },
  {
    text: "Thành công là tổng của những nỗ lực nhỏ lặp lại mỗi ngày.",
    category: "loikhuyen",
  },
  { text: "Một khởi đầu tốt bằng một nửa công việc.", category: "loikhuyen" },
  {
    text: "Đường đi khó, không khó vì ngăn sông cách núi, mà khó vì lòng người ngại núi e sông.",
    category: "loikhuyen",
  },
  {
    text: "Ai cũng có thể thành công nếu không sợ thất bại.",
    category: "loikhuyen",
  },
  { text: "Kiên trì là chìa khoá mở mọi cánh cửa.", category: "loikhuyen" },
  {
    text: "Sự bình yên trong tâm hồn đến từ việc chấp nhận những gì không thể thay đổi.",
    category: "loikhuyen",
  },
  {
    text: "Hãy trồng cây hôm nay để có bóng mát ngày mai.",
    category: "loikhuyen",
  },
  {
    text: "Người mạnh mẽ nhất là người biết đứng dậy sau vấp ngã.",
    category: "loikhuyen",
  },
  {
    text: "Đừng so sánh hành trình của mình với người khác.",
    category: "loikhuyen",
  },
  { text: "Mỗi ngày là một cơ hội mới để bắt đầu lại.", category: "loikhuyen" },
  { text: "Niềm vui lớn nhất là được ở bên gia đình.", category: "loikhuyen" },
  {
    text: "Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc.",
    category: "loikhuyen",
  },
  {
    text: "Hạnh phúc không phải là đích đến, mà là cách ta đi trên con đường.",
    category: "loikhuyen",
  },
  { text: "Biết đủ là đủ.", category: "loikhuyen" },
  { text: "An yên đến từ một tâm hồn biết ơn.", category: "loikhuyen" },
  { text: "Sức khoẻ là tài sản quý giá nhất.", category: "loikhuyen" },
  {
    text: "Thời gian là thứ duy nhất không thể mua lại được.",
    category: "loikhuyen",
  },
  {
    text: "Cho đi là cách giữ lại điều tốt đẹp mãi mãi.",
    category: "loikhuyen",
  },
  {
    text: "Một lời cảm ơn đúng lúc có thể sưởi ấm cả một ngày.",
    category: "loikhuyen",
  },
  {
    text: "Yêu thương bắt đầu từ những điều nhỏ nhặt trong gia đình.",
    category: "loikhuyen",
  },
  {
    text: "Người thân là món quà quý giá nhất cuộc đời.",
    category: "loikhuyen",
  },
  { text: "Hãy sống chậm lại để yêu thương nhiều hơn.", category: "loikhuyen" },
  {
    text: "Mỗi khoảnh khắc bên người thân đều đáng trân trọng.",
    category: "loikhuyen",
  },
  {
    text: "Nụ cười là món quà không tốn tiền nhưng quý giá vô cùng.",
    category: "loikhuyen",
  },
  { text: "Hãy tha thứ để lòng mình nhẹ nhõm hơn.", category: "loikhuyen" },
];
