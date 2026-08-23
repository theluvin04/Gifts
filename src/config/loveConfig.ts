import { LoveConfig } from '../types';

export const loveConfig: LoveConfig = {
  couple: {
    senderName: "Anh nè",
    receiverName: "Em bé của anh",
    anniversaryDate: "14/02",
    nickname: "Công chúa nhỏ",
  },
  
  // 1. Màn hình Intro mở đầu
  intro: {
    title: "Gửi người đặc biệt nhất",
    subtitle: "Có một món quà bí mật đang chờ cậu mở ra...",
    heartLabel: "Chạm vào trái tim để mở",
  },

  // 2. Màn hình "Do you love me?"
  proposal: {
    question: "Do you love me? ❤️",
    yesBtnText: "YES! Yêu nhiều lắmmm 💕",
    initialGif: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZtNHUzbnpveTRjcHBhNWlhZTV5bjcxN2I1bDR0enZpc2VpZnB1OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif",
    
    // Các giai đoạn khi người dùng cố bấm nút NO
    noBtnStages: [
      {
        text: "Không nha 😜",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZndrcm1hYnN5b2szbHJwOGd2Z2FvdjFucW9tYWoxbW5ybnFidmU2dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mlvseq9yvZhba/giphy.gif",
        hint: "Ủa alo? Suy nghĩ lại đii!",
      },
      {
        text: "Thật luôn á? 🥺",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndrYmdwOG93bndxOWZ5cjU1aTh4b3c0eWJ5eHh3ejBqdnpkbDJkMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OPU6wzx8JrHna/giphy.gif",
        hint: "Đừng làm tớ buồn mòoo :<",
      },
      {
        text: "Cậu nỡ lòng nào sao? 😭",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnBmbnRnbWlsOG1rMGt3OTFhOGt4dzZpOHF6amN6YndpYWNraGhhdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L95W4wvxxJ7Co/giphy.gif",
        hint: "Mắt tớ đang rưng rưng rồi đấy!",
      },
      {
        text: "Không cho chọn nút này đâu! 😤",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmQ2ZDVzYzI4eGFoMzl5bzZraTVkY2o2N2MxcjNra2pxaWNub2I1dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BBNYBoVQ5NuqA/giphy.gif",
        hint: "Nút NO bị ếm bùa rồi, đừng cố nữa =))",
      },
      {
        text: "Nút này hỏng rồi, bấm YES đi mừ! 👉👈",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbms1ODN1NHc4OXEwZHN5OG84ODZpMjYxaWhmYzNlMm0xd2c0ZThkOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CjmvTCZf2U3p09Cn0h/giphy.gif",
        hint: "Bấm YES để nhận 3 món quà siêu to khổng lồ nha!",
      },
    ],

    // Màn hình khi bấm YES
    successGif: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjA1MDBoaG53Z2djaHlvd3Mxc3VzNXp5aG04ZnRtcWp6d2N4ZWZjayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/T86i6yDyOYz7J6dPhf/giphy.gif",
    successHeading: "YAYYY! Tớ biết ngay mà 🥰",
    successSubheading: "Cảm ơn vì đã luôn ở bên cạnh và yêu thương tớ. Dưới đây là 3 món quà đặc biệt dành riêng cho cậu!",
    continueBtnText: "Khám phá 3 món quà ✨",
  },

  // 3. Màn hình 3 Món quà
  gifts: {
    headerTitle: "Hộp Quà Yêu Thương 🎁",
    headerSubtitle: "Mỗi món quà đều chứa đựng một điều ngọt ngào dành cho cậu",

    // Món quà 1: Polaroid Gallery
    gift1: {
      id: "gift-polaroid",
      title: "Kỷ Niệm Của Chúng Mình",
      tag: "Gift 01",
      desc: "Những khoảnh khắc đáng yêu và hạnh phúc nhất mà chúng ta đã cùng đi qua.",
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

    // Món quà 2: Music Player / Vinyl
    gift2: {
      id: "gift-music",
      title: "Giai Điệu Tình Yêu",
      tag: "Gift 02",
      desc: "Chiếc đĩa than chứa những bản nhạc ngọt ngào dành tặng riêng cho cậu.",
      icon: "Disc",
      playlist: [
        {
          id: "s1",
          title: "Until I Found You (Lofi Sweet)",
          artist: "Stephen Sanchez (Romantic Melody)",
          coverUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80",
          // Reliable sweet romantic audio file
          audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-love-112199.mp3",
          duration: "2:34",
        },
        {
          id: "s2",
          title: "Sweet Sweet Melody",
          artist: "Acoustic Love Dream",
          coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
          audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=melody-of-nature-main-6672.mp3",
          duration: "3:10",
        },
        {
          id: "s3",
          title: "Falling in Love with You",
          artist: "Lofi Dreamer",
          coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
          audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=lofi-study-112191.mp3",
          duration: "2:45",
        }
      ],
    },

    // Món quà 3: Love Letter
    gift3: {
      id: "gift-letter",
      title: "Bức Thư Tay Gửi Cậu",
      tag: "Gift 03",
      desc: "Những lời tâm sự từ tận đáy lòng mà tớ muốn gửi đến người tớ yêu nhất.",
      icon: "Mail",
      letter: {
        salutation: "Gửi Em Bé của anh,",
        paragraphs: [
          "Cảm ơn em vì đã xuất hiện trong cuộc đời anh và biến mỗi ngày bình thường trở thành những khoảnh khắc thật diệu kỳ.",
          "Anh thích những lúc em cười tít mắt, thích cả những lúc em làm nũng, và yêu tất cả những điều đáng yêu thuộc về em.",
          "Cuộc sống ngoài kia có thể có những ngày bận rộn hay mỏi mệt, nhưng chỉ cần được nhìn thấy em, mọi âu lo trong anh đều tan biến hết.",
          "Anh hứa sẽ luôn ở đây, lắng nghe, chăm sóc và cùng em tạo thêm thật nhiều kỷ niệm đẹp trong tương lai nhé!",
          "Yêu em nhiều hơn ngày hôm qua, và ít hơn ngày mai ❤️"
        ],
        closing: "Mãi mãi bên em,",
        signature: "Người thương của em 💌",
        date: "Ngày đặc biệt của chúng ta",
      },
    },
  },

  // Cấu hình âm thanh nền chung
  audio: {
    backgroundMusicUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-love-112199.mp3",
    backgroundMusicTitle: "Romantic Lofi Beats",
  }
};
