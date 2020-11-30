'use strict';

const card = (post) => {
  console.log(post.userId.name);
  return `
  <div class="row">
    <div class="col">
      <div class="card">
        <div class="name-user">
         🤡${post.userId.name}
        </div>
        <hr>
        <div class="card-image">
          <img src="" id="cardImg">
        </div>
        <div class="card-content">
          <p style='white-space: pre-line; word-break: break-all;'>${post.text.trim()}</p>
          <small class='cardDate'>${new Date(
            post.date
          ).toLocaleDateString()}</small>
          </div>
        </div>
        <div class='card-action actions'>
            <button class='btn btn-small removePost' data-id='${
              post._id
            }''>Удалить</button>
        </div>     
       </div>
  </div>
  `;
};

const cardPersonal = (post) => {
  console.log(post.userId.name);
  return `
  <div class="row">
    <div class="col">
      <div class="card">
        <div class="name-user-personal">
          👽${post.userId.name}
        </div>
        <hr>
        <div class="card-image">
          <img src="" id="cardImg">
        </div>
        <div class="card-content">
          <p style='white-space: pre-line; word-break: break-all;'>${post.text.trim()}</p>
          <small class='cardDate'>${new Date(
            post.date
          ).toLocaleDateString()}</small>
          </div>
        </div>
        <div class='card-action actions'>
            <button class='btn btn-small removePostPersonal' data-id='${
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
        console.log('403');
        throw new Error('Вам нельзя удалить этот пост!');
      } else {
        console.log('Не 403');
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
    document.querySelector('#btnSend').addEventListener('click', onCreatePost);
  } catch (e) {
    console.log(e);
  }
  try {
    document
      .querySelector('#btnSendPersonal')
      .addEventListener('click', onCreatePostPersonal);
  } catch (e) {
    console.log(e);
  }
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
  const $posts = document.querySelector('#posts');

  if (_posts.length > 0) {
    $($posts).html('');
    _posts.forEach((v) => {
      $($posts).prepend(card(v));
    });
  } else {
    $posts.innerHTML = ' ';
  }
}

function onCreatePost() {
  const writePost = document.querySelector('#writePost');
  const $input = document.querySelector('#input');

  if ($input.value) {
    const newPost = {
      text: $input.value,
      img: filePath,
    };

    PostApi.create(newPost).then((post) => {
      posts.push(post);
      renderPosts(posts);
    });

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
  if ($input.value) {
    const newPost = {
      text: $input.value,
    };
    PostApiPersonal.create(newPost).then((post) => {
      postsPersonal.push(post);
      renderPostsPersonal(postsPersonal);
    });
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
        const a = document.createElement('a');
        a.innerHTML = '';
        a.classList = 'link';
        a.setAttribute('href', filePath[i]);
        a.setAttribute('data-lightbox', 'onload');

        const img = document.createElement('img');
        img.setAttribute('id', 'dynamic');
        img.setAttribute('src', e.target.result);
        img.setAttribute('width', '30%');
        img.setAttribute('height', 'auto');
        img.setAttribute('style', 'margin: 5px; padding: 10px 5px;');

        a.append(img);
        divPreview.append(a);
      };
      reader.readAsDataURL(input.files[i]);
    }
  }
}

$('#imgUpload').change(function () {
  const form = document.getElementById('uploadImgForm');
  const formData = new FormData(form);

  PostApi.uploadImage(formData).then((link) => {
    filePath = link;
    readURL(this);
  });
});

console.log('Test');
