import { LoveConfig } from '../types';

export const loveConfig: LoveConfig = {
  couple: {
    senderName: "Anh nè",
    receiverName: "Em bé của anh",
    anniversaryDate: "14/02",
    nickname: "Công chúa nhỏ",
  },

  intro: {
    title: "Gửi người đặc biệt nhất",
    subtitle: "Có một món quà bí mật đang chờ cậu mở ra...",
    heartLabel: "Chạm vào trái tim để mở",
  },

  proposal: {
    question: "Do you love me? ❤️",
    yesBtnText: "YES! Yêu nhiều lắmmm 💕",

    initialGif: "/images/cat-default.gif",

    noBtnStages: [
      {
        text: "Không nha 😜",
        gifUrl: "/images/cat-default.gif",
        hint: "Ủa alo? Suy nghĩ lại đii!",
      },
      {
        text: "Thật luôn á? 🥺",
        gifUrl: "/images/cat-default.gif",
        hint: "Đừng làm tớ buồn mòoo :<",
      },
      {
        text: "Cậu nỡ lòng nào sao? 😭",
        gifUrl: "/images/cat-default.gif",
        hint: "Mắt tớ đang rưng rưng rồi đấy!",
      },
      {
        text: "Không cho chọn nút này đâu! 😤",
        gifUrl: "/images/cat-default.gif",
        hint: "Nút NO bị ếm bùa rồi, đừng cố nữa =))",
      },
      {
        text: "Nút này hỏng rồi, bấm YES đi mừ! 👉👈",
        gifUrl: "/images/cat-default.gif",
        hint: "Bấm YES để nhận 3 món quà siêu to khổng lồ nha!",
      },
    ],

    successGif: "/images/cat-default.gif",

    successHeading: "YAYYY! Tớ biết ngay mà 🥰",
    successSubheading:
      "Cảm ơn vì đã luôn ở bên cạnh và yêu thương tớ. Dưới đây là 3 món quà đặc biệt dành riêng cho cậu!",
    continueBtnText: "Khám phá 3 món quà ✨",
  },

  gifts: {
    headerTitle: "Hộp Quà Yêu Thương 🎁",
    headerSubtitle:
      "Mỗi món quà đều chứa đựng một điều ngọt ngào dành cho cậu",

    gift1: {
      id: "gift-polaroid",
      title: "Kỷ Niệm Của Chúng Mình",
      tag: "Gift 01",
      desc:
        "Những khoảnh khắc đáng yêu và hạnh phúc nhất mà chúng ta đã cùng đi qua.",
      icon: "Camera",

      photos: [
        {
          id: "p1",
          url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
          caption: "Lần đầu tiên chúng mình hẹn hò ❤️",
          date: "14.02",
          rotation: -4,
          location: "Quán cà phê quen thuộc",
        },
        {
          id: "p2",
          url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop&q=80",
          caption: "Nụ cười của cậu làm bừng sáng cả ngày của tớ ✨",
          date: "08.03",
          rotation: 3,
          location: "Bờ hồ chiều lộng gió",
        },
        {
          id: "p3",
          url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
          caption: "Cùng nhau ngắm hoàng hôn buông 🌇",
          date: "20.10",
          rotation: -2,
          location: "Bãi biển đầy nắng",
        },
        {
          id: "p4",
          url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
          caption: "Những cái nắm tay ấm áp giữa mùa đông ❄️",
          date: "24.12",
          rotation: 5,
          location: "Góc phố lên đèn",
        },
        {
          id: "p5",
          url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&auto=format&fit=crop&q=80",
          caption: "Mỗi giây phút bên cậu đều là phép màu 💕",
          date: "Hôm nay & Mãi mãi",
          rotation: -3,
          location: "Nơi có hai chúng mình",
        },
      ],
    },

    gift2: {
      id: "gift-music",
      title: "Giai Điệu Tình Yêu",
      tag: "Gift 02",
      desc:
        "Chiếc đĩa than chứa những bản nhạc ngọt ngào dành tặng riêng cho cậu.",
      icon: "Disc",

      playlist: [
        {
          id: "s1",
          title: "Until I Found You (Lofi Sweet)",
          artist: "Stephen Sanchez (Romantic Melody)",
          coverUrl:
            "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80",
          audioUrl:
            "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-love-112199.mp3",
          duration: "2:34",
        },
        {
          id: "s2",
          title: "Sweet Sweet Melody",
          artist: "Acoustic Love Dream",
          coverUrl:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
          audioUrl:
            "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=melody-of-nature-main-6672.mp3",
          duration: "3:10",
        },
        {
          id: "s3",
          title: "Falling in Love with You",
          artist: "Lofi Dreamer",
          coverUrl:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
          audioUrl:
            "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=lofi-study-112191.mp3",
          duration: "2:45",
        },
      ],
    },

    gift3: {
      id: "gift-letter",
      title: "Bức Thư Tay Gửi Cậu",
      tag: "Gift 03",
      desc:
        "Những lời tâm sự từ tận đáy lòng mà tớ muốn gửi đến người tớ yêu nhất.",
      icon: "Mail",

      letter: {
        salutation: "Gửi Em Bé của anh,",

        paragraphs: [
          "Cảm ơn em vì đã xuất hiện trong cuộc đời anh và biến mỗi ngày bình thường trở thành những khoảnh khắc thật diệu kỳ.",
          "Anh thích những lúc em cười tít mắt, thích cả những lúc em làm nũng, và yêu tất cả những điều đáng yêu thuộc về em.",
          "Cuộc sống ngoài kia có thể có những ngày bận rộn hay mỏi mệt, nhưng chỉ cần được nhìn thấy em, mọi âu lo trong anh đều tan biến hết.",
          "Anh hứa sẽ luôn ở đây, lắng nghe, chăm sóc và cùng em tạo thêm thật nhiều kỷ niệm đẹp trong tương lai nhé!",
          "Yêu em nhiều hơn ngày hôm qua, và ít hơn ngày mai ❤️",
        ],

        closing: "Mãi mãi bên em,",
        signature: "Người thương của em 💌",
        date: "Ngày đặc biệt của chúng ta",
      },
    },
  },

  audio: {
    backgroundMusicUrl:
      "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-love-112199.mp3",
    backgroundMusicTitle: "Romantic Lofi Beats",
  },
};