const inputComplete = document.getElementById("inputBookIsComplete");
const submitTmbl = document.getElementById("isCheck");
const books = [];

const RENDER_EVENT = "render-books";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function changeBtn() {
  if (inputComplete.checked) {
    submitTmbl.innerText = "Selesai dibaca";
  } else {
    submitTmbl.innerText = "Belum selesai dibaca";
  }
}

inputComplete.addEventListener("click", changeBtn);
changeBtn();
function generateId() {
  return +new Date();
}

function generateBooksObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (const item of books) {
    if (item.id === bookId) {
      return item;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const item of data) {
      books.push(item);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  const textYear = document.createElement("p");
  textYear.innerText = year;
  const action = document.createElement("div");

  const textContainer = document.createElement("article");
  textContainer.classList.add("book_item");
  textContainer.append(textTitle, textAuthor, textYear, action);

  action.classList.add("action");

  textContainer.setAttribute("id", `book-${id}`);

  const trashButton = document.createElement("button");
  trashButton.classList.add("red");
  trashButton.innerText = "Hapus";
  trashButton.addEventListener("click", function () {
    removeBook(id);
  });

  if (isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum Selesai Dibaca";
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(id);
    });

    action.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("green");
    checkButton.innerText = "Selesai Dibaca";
    checkButton.addEventListener("click", function () {
      addBookToCompleted(id);
    });

    action.append(checkButton, trashButton);
  }

  return textContainer;
}

function addBook() {
  const inputTittle = document.getElementById("inputBookTitle").value;
  const inputAuthor = document.getElementById("inputBookAuthor").value;
  const inputYear = document.getElementById("inputBookYear").value;

  const generatedID = generateId();
  const bookObject = generateBooksObject(generatedID, inputTittle, inputAuthor, inputYear, inputComplete.checked);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId /* HTMLELement */) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm /* HTMLFormElement */ = document.getElementById("inputBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const rakBelum = document.getElementById("incompleteBookshelfList");
  const rakSudah = document.getElementById("completeBookshelfList");

  // clearing list item
  rakBelum.innerHTML = "";
  rakSudah.innerHTML = "";

  for (const item of books) {
    const bookElement = makeBook(item);
    if (item.isCompleted) {
      rakSudah.append(bookElement);
    } else {
      rakBelum.append(bookElement);
    }
  }
});

document.getElementById("searchBook").addEventListener("submit", function (e) {
  e.preventDefault();
  const cari = document.getElementById("searchBookTitle").value;
  const rakHasil = document.getElementById("cari");

  rakHasil.removeAttribute("hidden");

  function search(i) {
    return i.title == cari;
  }

  const res = books.find(search);
  console.log(res);

  if (res) {
    rakHasil.innerHTML = `  <article id=${res.id}  class="book_item">
      <h3>${res.title}</h3>
      <p>Penulis: ${res.author}</p>
      <p>Tahun: ${res.year}</p>
    </article>`;
  } else {
    rakHasil.innerHTML = `
    <h3>Hasil tidak ditemukan</h3>`;
  }
});
