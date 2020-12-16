'use strict';

const card = (post) => {
  if (post.img.length == 0) {
    post.img[0] = '';
  }

  return `
  <div class="row">
    <div class="col">
      <div class="card">
        <div class="name-user">
          ${post.userId.name}
        </div>
        <hr>
        <div class="card-image hoverable">
          <img src="${post.img[0]}" id="cardImg" onclick="createModalPost('${
    post.img
  }')">
        </div>
        <div class="card-content">
          <div style='word-break: normal; white-space: pre-line;'>
            <p>${post.text.trim()}</p>
          </div>
          <small class='cardDate'>${new Date(
            post.date
          ).toLocaleDateString()}</small>
        </div>
        <button class='btn btn-small red darken-4 removePost' data-id='${
          post._id
        }''>Удалить</button>
      </div>     
    </div>
  </div>
  `;
};

const cardPersonal = (post) => {
  if (post.img.length == 0) {
    post.img[0] = '';
  }
  return `
  <div class="row">
    <div class="col">
      <div class="card">
        <div class="name-user-personal">
          ${post.userId.name}
        </div>
        <hr>
        <div class="card-image hoverable ">
          <img src="${post.img[0]}" id="cardImg" onclick="createModalPost('${
    post.img
  }')">
        </div>
        <div class="card-content">
          <p style='white-space: pre-line; word-break: normal;'>${post.text.trim()}</p>
          <small class='cardDate'>${new Date(
            post.date
          ).toLocaleDateString()}</small>
          </div>
        </div>
        <div class='card-action actions'>
            <button class='btn btn-small red darken-4 removePostPersonal' data-id='${
              post._id
            }'>Удалить</button>
        </div>     
       </div>
  </div>
  `;
};

let filePath = [];
let posts = [];
let postsPersonal = [];
const BASE_URL = '/api/post';
const PERSONAL_URL = '/personal/posts';

class PostApi {
  static fetch() {
    return fetch(BASE_URL, {
      method: 'get',
    }).then((res) => res.json());
  }

  static create(post) {
    return fetch(BASE_URL, {
      method: 'post',
      body: JSON.stringify(post),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  }

  static remove(id) {
    return fetch(`${BASE_URL}/${id}`, {
      method: 'delete',
    }).then((res) => {
      const status = res.status;
      if (JSON.stringify(status) === JSON.stringify(403)) {
        throw new Error('Вам нельзя удалить этот пост!');
      } else {
        res.json();
      }
    });
  }

  static uploadImage(data) {
    return fetch(`${BASE_URL}/upload`, {
      method: 'post',
      body: data,
    }).then((res) => res.json());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  PostApi.fetch().then((backendPosts) => {
    posts = backendPosts.concat();
    renderPosts(posts);
  }).then;
  PostApiPersonal.fetch().then((backendPosts) => {
    postsPersonal = backendPosts.concat();
    renderPostsPersonal(postsPersonal);
  });
  try {
    document.querySelector('#posts').addEventListener('click', onDeletePost);
  } catch (e) {
    console.log(e);
  }
  try {
    document
      .querySelector('#postsById')
      .addEventListener('click', onDeletePostPersonal);
  } catch (e) {
    console.log(e);
  }
});

function renderPosts(_posts = []) {
  const posts = document.querySelector('#posts');

  if (_posts.length > 0) {
    $(posts).html('');
    _posts.forEach((v) => {
      $(posts).prepend(card(v));
    });
  } else {
    posts.innerHTML = '<h1>Постов нет :(</h1>';
  }
}

function findXSS(str) {
  const regScript = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
  const regHTML = /<[^<>]+>/gi;

  if (str.match(regScript)) {
    str = '😜';
    return str;
  }
  if (str.match(regHTML)) {
    str = '😜';
    return str;
  }

  return str;
}

function onCreatePost() {
  const writePost = document.querySelector('#writePost');
  const $input = document.querySelector('#input');
  const arrImg = document.getElementById('dynamic');
  const divPreview = document.getElementById('preview');
  const imgUpload = document.getElementById('imgUpload');
  const file = document.querySelector('.file-path');

  if ($input.value) {
    let str = $input.value;
    str = findXSS(str);
    const newPost = {
      text: str,
      img: filePath,
    };

    filePath = [];

    PostApi.create(newPost).then((post) => {
      posts.push(post);
      renderPosts(posts);
    });

    file.value = '';
    imgUpload.value = '';
    if (arrImg) {
      divPreview.innerHTML = '';
    }
    $input.value = '';
    writePost.reset();
  }
}

function onDeletePost(event) {
  if (event.target.classList.contains('removePost')) {
    const decision = confirm('Удалить пост?');
    if (decision) {
      const id = event.target.getAttribute('data-id');
      PostApi.remove(id).then(() => {
        const postIndex = posts.findIndex((post) => post._id === id);
        posts.splice(postIndex, 1);
        renderPosts(posts);
      });
    }
  }
}

class PostApiPersonal {
  static async fetch() {
    return fetch(PERSONAL_URL, {
      method: 'get',
    }).then((res) => res.json());
  }

  static create(post) {
    return fetch(PERSONAL_URL, {
      method: 'post',
      body: JSON.stringify(post),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  }

  static remove(id) {
    return fetch(`${PERSONAL_URL}/${id}`, {
      method: 'delete',
    }).then((res) => res.json());
  }

  static uploadImage(data) {
    return fetch(`${PERSONAL_URL}/uploadPersonal`, {
      method: 'post',
      body: data,
    }).then((res) => res.json());
  }
}

function renderPostsPersonal(_postsPersonal = []) {
  const $posts = document.querySelector('#postsById');
  if (_postsPersonal.length > 0) {
    $($posts).html('');
    _postsPersonal.forEach((v) => {
      $($posts).prepend(cardPersonal(v));
    });
  } else {
    $posts.innerHTML = '<h1>Постов нет :(</h1>';
    console.log('no');
  }
}

function onCreatePostPersonal() {
  const writePost = document.querySelector('#writePost');
  const $input = document.querySelector('#input');
  const arrImg = document.getElementById('dynamic');
  const divPreview = document.getElementById('preview');
  const imgUpload = document.getElementById('imgUploadPersonal');
  const file = document.querySelector('.file-path');

  if ($input.value) {
    let str = $input.value;
    str = findXSS(str);

    const newPost = {
      text: str,
      img: filePath,
    };

    filePath = [];

    PostApiPersonal.create(newPost).then((post) => {
      postsPersonal.push(post);
      renderPostsPersonal(postsPersonal);
    });

    file.value = '';
    imgUpload.value = '';
    if (arrImg) {
      divPreview.innerHTML = '';
    }
    $input.value = '';
    writePost.reset();
  }
}

function onDeletePostPersonal(event) {
  if (event.target.classList.contains('removePostPersonal')) {
    const decision = confirm('Удалить пост?');
    if (decision) {
      const id = event.target.getAttribute('data-id');
      PostApiPersonal.remove(id).then(() => {
        const postIndex = postsPersonal.findIndex((post) => post._id === id);
        postsPersonal.splice(postIndex, 1);
        renderPostsPersonal(postsPersonal);
      });
    }
  }
}

M.Tabs.init(document.querySelectorAll('.tabs'));

function readURL(input) {
  const arrImg = document.getElementById('dynamic');
  const divPreview = document.getElementById('preview');
  if (arrImg) {
    divPreview.innerHTML = '';
  }

  for (let i = 0; i < input.files.length; i++) {
    if (input.files[i]) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const div = document.createElement('div');
        div.classList = 'column';

        const img = document.createElement('img');
        img.setAttribute('id', 'dynamic');
        img.setAttribute('src', e.target.result);
        img.setAttribute('onclick', `openModal(); currentSlide(${i + 1})`);
        img.setAttribute(
          'style',
          'padding: 0 8px; float: left; width: 25%; transition: 0.3s;'
        );
        img.classList = 'hover-shadow';
        img.classList.add('HoverClass2');

        div.append(img);
        divPreview.append(div);
      };
      reader.readAsDataURL(input.files[i]);
    }
  }
  createModal(input);
  showSlides(slideIndex);
}

$('#imgUpload').change(function () {
  const form = document.getElementById('uploadImgForm');
  const formData = new FormData(form);

  PostApi.uploadImage(formData).then((link) => {
    filePath = link;
    readURL(this);
  });
});

$('#imgUploadPersonal').change(function () {
  const form = document.getElementById('uploadImgFormPersonal');
  const formData = new FormData(form);

  PostApiPersonal.uploadImage(formData).then((link) => {
    filePath = link;
    readURL(this);
  });
});

function createModal(input) {
  const divMyModal = document.getElementById('myModal');

  const divModalContent = document.getElementById('contentInGallery');
  divModalContent.innerText = ' ';

  for (let i = 0; i < input.files.length; i++) {
    const divMySlides = document.createElement('div');
    divMySlides.classList = 'mySlides';
    divMySlides.setAttribute('style', 'display: none;');

    const img = document.createElement('img');
    img.setAttribute('src', filePath[i]);
    img.setAttribute('style', 'width:100%');

    divMySlides.append(img);
    divModalContent.append(divMySlides);
  }

  for (let i = 0; i < input.files.length; i++) {
    const divColumn = document.createElement('div');
    divColumn.classList = 'column';

    const img = document.createElement('img');
    img.setAttribute('src', filePath[i]);
    img.setAttribute('onclick', `currentSlide(${i + 1})`);
    img.classList = 'demo';
    img.classList.add('HoverClass1');
    img.setAttribute('style', 'opacity: 0.6; display: none');

    divColumn.append(img);
    divModalContent.append(divColumn);
  }

  divMyModal.append(divModalContent);
}

function openModal() {
  document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('myModal').style.display = 'none';
}

let slideIndex = 1;

function plusSlides(n) {
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let slides = document.getElementsByClassName('mySlides');

  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';
  }

  slides[slideIndex - 1].style.display = 'block';
}

//creating lightbox for posts

function createModalPost(arrayImg) {
  arrayImg = arrayImg.split(',');
  console.log(arrayImg);
  console.log(arrayImg.length);
  for (let i = 0; i < arrayImg.length; i++) {
    arrayImg[i] = arrayImg[i].replace('imagesp', 'images\\160');
  }
  console.log(arrayImg);

  document.getElementById('modalInPost').style.display = 'block';

  const divMyModal = document.getElementById('modalInPost');
  const divModalContent = document.getElementById('contentInGalleryPost');
  divModalContent.innerText = ' ';

  for (let i = 0; i < arrayImg.length; i++) {
    const divMySlides = document.createElement('div');
    divMySlides.classList = 'mySlidesPost';
    divMySlides.setAttribute('style', 'display: none;');

    const img = document.createElement('img');
    img.setAttribute('src', arrayImg[i]);
    img.setAttribute('style', 'width:100%');

    divMySlides.append(img);
    divModalContent.append(divMySlides);
  }

  divMyModal.append(divModalContent);
  currentSlidePost(1);
}

function closeModalPost() {
  document.getElementById('modalInPost').style.display = 'none';
}

let slideIndexPost = 1;

function plusSlidesPost(n) {
  showSlidesPost((slideIndexPost += n));
}

function currentSlidePost(n) {
  showSlidesPost((slideIndexPost = n));
}

function showSlidesPost(n) {
  let slides = document.getElementsByClassName('mySlidesPost');

  if (n > slides.length) {
    slideIndexPost = 1;
  }
  if (n < 1) {
    slideIndexPost = slides.length;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';
  }

  slides[slideIndexPost - 1].style.display = 'block';
}
