// FIREBASE CONFIGURATION

const firebaseConfig = {
  apiKey: "AIzaSyDTYiM5AarXwcgvSfpLD2Hwmx5T00z2i2E",
  authDomain: "music-player-5a6c1.firebaseapp.com",
  projectId: "music-player-5a6c1",
  appId: "1:754529148217:web:e0a31710e92eb1701d9ce8"
};
// INITIALIZE FIREBASE
firebase.initializeApp(firebaseConfig);
// AUTHENTICATION LOGIC
function openSettings() {
  const box = document.getElementById("settingsBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

if (!firebase || !firebase.auth) {
  console.error("Firebase Auth SDK missing");
}


// GOOGLE LOGIN
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider)
    .then(result => {
      const user = result.user;

      document.getElementById("userInfo").innerHTML = `
        <img src="${user.photoURL}" width="60" style="border-radius:50%">
        <p>${user.displayName}</p>
        <p>${user.email}</p>
      `;
    })
    .catch(error => {
      console.log(error);
    });
}

// CHECK AUTH STATE
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("userInfo").innerHTML = `
      <img src="${user.photoURL}" width="60" style="border-radius:50%">
      <p>${user.displayName}</p>
      <p>${user.email}</p>
    `;
  }
});
// LOGOUT
function logout() {
  firebase.auth().signOut().then(() => {
    document.getElementById("userInfo").innerHTML = "";
  });
}

// MUSIC PLAYER LOGIC

let songs = JSON.parse(localStorage.getItem("songs")) || [
  {
    title: "Gehra Hua",
    artist: "Dhurandhar",
    src: "songs/song1.mp3",
    cover: "images/cover_image1.jpg",
    video: "videos/abstract_loop1.mp4",
    favorite: false
  },
  
  {
    title: "Finding her",
    artist: "Kushagra",
    src: "songs/song2.mp3",
    cover: "images/cover_image2.jpg",
    video: "videos/abstract_loop2.mp4",
    favorite: false
  },

  {
    title: "Dharia",
    artist: "Daria Comanescu",
    src: "songs/song3.mp3",
    cover: "images/cover_image3.jpg",
    favorite: false
  },


];
// ELEMENTS
let index = 0;
let isPlaying = false;

const audio = new Audio();
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const bgVideo = document.getElementById("bgVideo");
const upload = document.getElementById("upload");
const songList = document.getElementById("songList");
const favList = document.getElementById("favList");


// LIST ELEMENTS
function loadSong() {
  const s = songs[index];

  audio.src = s.src;
  cover.src = s.cover;
  title.innerText = s.title;
  artist.innerText = s.artist;

  // 🔥 FIX FOR BACKGROUND VIDEO
  bgVideo.pause();
  bgVideo.removeAttribute("src");   // important
  bgVideo.load();                   // reset

  bgVideo.src = s.video;
  bgVideo.load();

  if (isPlaying) {
    bgVideo.play();
    audio.play();
  }
}


loadSong();
renderLists();

function togglePlay() {
  if (isPlaying) {
    audio.pause(); bgVideo.pause();
  } else {
    audio.play(); bgVideo.play();
  }
  isPlaying = !isPlaying;
}

function nextSong() {
  index = (index + 1) % songs.length;
  loadSong(); audio.play(); bgVideo.play();
}

function prevSong() {
  index = (index - 1 + songs.length) % songs.length;
  loadSong(); audio.play(); bgVideo.play();
}

audio.ontimeupdate = () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
};

progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

volume.oninput = () => audio.volume = volume.value;

// ADD SONG
upload.onchange = () => {
  const file = upload.files[0];
  if (!file) return;
  songs.push({
    title: file.name.replace(".mp3",""),
    artist: "User",
    src: URL.createObjectURL(file),
    cover: "images/default.jpg",
    video: songs[index]?.video || "videos/abstract_loop1.mp4",

    favorite: false
  });
  save();
};

// FAVORITE
function toggleFavorite() {
  songs[index].favorite = !songs[index].favorite;
  save();
}

// DELETE
function deleteSong() {
  songs.splice(index,1);
  index = 0;
  save();
}

// SEARCH
document.getElementById("search").oninput = e => {
  renderLists(e.target.value);
};

// THEME
function toggleTheme() {
  document.body.classList.toggle("light");
}

// SAVE & RENDER
function save() {
  localStorage.setItem("songs", JSON.stringify(songs));
  renderLists();
  loadSong();
}




function renderLists(search="") {
  songList.innerHTML = "";
  favList.innerHTML = "";

  songs.forEach((s,i) => {
    if (s.title.toLowerCase().includes(search.toLowerCase())) {
      songList.innerHTML += `<li onclick="play(${i})">${s.title}</li>`;
    }
    if (s.favorite) {
      favList.innerHTML += `<li onclick="play(${i})">${s.title}</li>`;
    }
  });
}

function play(i) {
  index = i;
  loadSong();
  audio.play(); bgVideo.play();
  isPlaying = true;
}