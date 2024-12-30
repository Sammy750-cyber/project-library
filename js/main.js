const newProjectForm = document.querySelector(".new-project-form"),
  lightBox = document.querySelector(".lightbox"),
  form = newProjectForm.querySelector("form"),
  btn = form.querySelector("button"),
  project_title = form.querySelector("#project-title"),
  project_desc = form.querySelector("#project-description"),
  backend_ = form.querySelector("#backend"),
  frontend_ = form.querySelector("#frontend"),
  database_ = form.querySelector("#database"),
  progress_ = form.querySelector(".progress select"),
  addBox = document.querySelector(".new"),
  list_el = document.querySelector(".projects");

const preview = document.querySelector(".preview-lightbox"),
  previewmain = preview.querySelector(".preview-cont"),
  displayName = preview.querySelector(".p-title"),
  disPlayDesc = preview.querySelector(".desc"),
  logic = preview.querySelector(".logic"),
  displayFr = logic.querySelector(".logic-fr"),
  displayBa = logic.querySelector(".logic-ba"),
  displayDa = logic.querySelector(".logic-da"),
  actions = preview.querySelector(".actions"),
  displayTime = actions.querySelector(".p-time"),
  actions_btn = actions.querySelectorAll("button");
// console.log(actions_btn);
// Get local projects
let localprojects = JSON.parse(localStorage.getItem("projects")) || [];

let config = {
  isUpdate: false,
  projectToUpdate: null,
  date: null,
};

const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function showMenu(elem) {
  elem.parentElement.classList.add("show");
  document.addEventListener("click", (e) => {
    if (e.target.tagName != "I" || e.target != elem) {
      elem.parentElement.classList.remove("show");
    }
  });
}

const previewProject = (id) => {
  try {
    const project = localprojects.filter((p) => p.id === id);
    let { projectTitle, description, logic, progress, date } = project[0];
    displayName.innerHTML =
      projectTitle.length >= 35
        ? `<marquee>${projectTitle}</marquee>`
        : projectTitle;
    disPlayDesc.innerText = description;
    displayBa.innerText = logic.backend;
    displayFr.innerText = logic.frontend;
    displayDa.innerText = logic.database;
    displayTime.innerText = date;

    actions_btn[0].setAttribute("onclick", `displayUpdateForm(${id})`);
    // actions_btn[1].setAttribute("onclick", `deleteProject(${id})`);
    previewmain.style.border = `2px solid ${progress}`;
    preview.classList.add("show");
    previewmain.style.display = "block";
    displayNotifications("Preview mode.", "green");
  } catch (error) {
    displayNotifications("an error occured!", "red");
    console.log("an error occured", error);
  }
};

const hidePreview = () => {
  preview.classList.remove("show");
  previewmain.classList.remove("show");
};

const updateFormState = () => {
  project_title.value = "";
  project_desc.value = "";
  backend_.value = "";
  frontend_.value = "";
  database_.value = "";
};

const showForm = () => {
  preview.classList.add("show");
  previewmain.style.display = "none";
  lightBox.style.display = "block";
  project_title.focus();
};

const hideForm = () => {
  config.isUpdate = false;
  config.date = null;
  config.projectToUpdate = null;
  btn.innerText = "Add Project";
  preview.classList.remove("show");
  previewmain.style.display = "none";
  lightBox.style.display = "none";
  updateFormState();
};

// Input validation
const validateForm = () => {
  const title = project_title.value.trim();
  const description = project_desc.value.trim();
  const backend = backend_.value.trim();
  const frontend = frontend_.value.trim();
  const database = database_.value.trim();
  const progress = progress_.value.trim();

  if (!title || !description || !progress) {
    // alert("Please fill in all fields.");
    displayNotifications("Please fill in all fields.", "red");
    return false;
  }

  return true;
};
const notifications = document.querySelector(".notification"),
  notification_texts = notifications.querySelector(".notification-texts");

const displayNotifications = (message, color) => {
  notifications.style.border = `1px solid ${color}`;
  notification_texts.style.color = `${color}`;
  notification_texts.innerText = message;
  notifications.classList.add("show");

  setTimeout(() => notifications.classList.remove("show"), 2000);
};

// Edit project functionality
const editProject = (id, project) => {
  try {
    const index = localprojects.findIndex((p) => p.id === id);
    if (index !== -1) {
      localprojects[index] = project;
      config.isUpdate = false;
      config.date = null;
      config.projectToUpdate = null;
      btn.innerText = "Add Project";
      updateLocalStorage();
      const children = list_el.children;
      while (children.length > 1) {
        list_el.removeChild(list_el.lastChild);
      };
      init();

      updateFormState();
      hideForm();
      displayNotifications("Edited successfully!", "green");
      console.log = project.id;
    }
  } catch (error) {
    displayNotifications("Error editing project.", "red");
    console.log("Error editing project:", error);
  }
};

const displayUpdateForm = async (id) => {
  const projectIndex = localprojects.findIndex((p) => p.id === id);
  const project = localprojects[projectIndex];

  // Display edit form with project data
  // ...
  let { projectTitle, description, logic, progress, date } = project;
  project_title.value = projectTitle;
  project_desc.value = description;
  backend_.value = logic.backend;
  frontend_.value = logic.frontend;
  database_.value = logic.database;
  progress_.value = progress;

  config.projectToUpdate = id;
  config.isUpdate = true;
  config.date = date;
  btn.innerText = "Update Project";
  showForm();
};

// Get new project
const getNewProject = async (e) => {
  try {
    e.preventDefault();
    if (validateForm()) {
      let projectTitle = project_title.value;
      let description = project_desc.value.replace(/\\n/g, "<br>");
      let backend = backend_.value;
      let frontend = frontend_.value;
      let database = database_.value;
      let progress = progress_.value;
      const date = new Date();

      if (!frontend.trim()) frontend = "none";
      if (!backend.trim()) backend = "none";
      if (!database.trim()) database = "none";

      const newProject = {
        projectTitle,
        description,
        logic: { frontend, backend, database },
        progress,
        id: config.isUpdate === false ? generateID() : config.projectToUpdate,
        date:
          config.isUpdate === false
            ? `${month[date.getMonth()]
            } ${date.getDate()}, ${date.getFullYear()}`
            : config.date,
      };

      if (config.isUpdate) {
        return editProject(config.projectToUpdate, newProject);
      }
      localprojects.push(newProject);
      await addProjectDOM(newProject);
      updateLocalStorage();
      updateFormState();
      hideForm();
      displayNotifications("Succesfully added!.", "green");
    }
  } catch (error) {
    console.error("Error creating new project:", error);
  }
};

// Add project to DOM
const addProjectDOM = async (project) => {
  try {
    let {
      projectTitle,
      description,
      logic,
      progress,
      id,
      date = "undefined",
    } = project;
    const project_el = document.createElement("li");
    project_el.classList.add("add-box");

    const tag_el = document.createElement("div");
    tag_el.classList.add("tag");
    tag_el.style.background = progress;
    project_el.appendChild(tag_el);

    const red_el = document.createElement("div");
    red_el.classList.add("red");
    tag_el.appendChild(red_el);

    const title_el = document.createElement("h1");
    title_el.id = "project-name";
    title_el.innerHTML =
      projectTitle.length >= 35
        ? `<marquee>${projectTitle}</marquee>`
        : projectTitle;

    title_el.setAttribute("onclick", `previewProject(${id})`);
    project_el.appendChild(title_el);

    const desc_el = document.createElement("div");
    desc_el.classList.add("desc");
    desc_el.innerText = description;
    desc_el.setAttribute("onclick", `previewProject(${id})`);
    project_el.appendChild(desc_el);

    const time_el = document.createElement("div");
    time_el.classList.add("time-cont");
    time_el.classList.add("flex");
    project_el.appendChild(time_el);

    const date_el = document.createElement("div");
    date_el.classList.add("date");
    time_el.appendChild(date_el);

    const p_el = document.createElement("p");
    p_el.innerText = date;
    date_el.appendChild(p_el);

    const settings_el = document.createElement("div");
    settings_el.classList.add("settings");
    time_el.appendChild(settings_el);

    const actions_el = document.createElement("div");
    actions_el.classList.add("actions");
    settings_el.appendChild(actions_el);

    const delete_btn = document.createElement("button");
    delete_btn.setAttribute("onclick", `deleteProject(${id}, this)`);
    delete_btn.innerText = " Delete";

    const delete_icon = document.createElement("i");
    delete_icon.classList.add("fa");
    delete_icon.classList.add("fa-trash-o");
    delete_btn.prepend(delete_icon);
    actions_el.appendChild(delete_btn);

    const edit_btn = document.createElement("button");
    edit_btn.innerText = " Edit";

    edit_btn.setAttribute("onclick", `displayUpdateForm(${id})`);

    const edit_icon = document.createElement("i");
    edit_icon.classList.add("fa");
    edit_icon.classList.add("fa-edit");
    edit_btn.prepend(edit_icon);
    actions_el.appendChild(edit_btn);

    const menu_icon = document.createElement("i");

    menu_icon.classList.add("fa");
    menu_icon.classList.add("fa-ellipsis-h");
    menu_icon.setAttribute("onclick", "showMenu(this)");
    settings_el.appendChild(menu_icon);

    const dom_ = project_el.outerHTML;
    addBox.insertAdjacentHTML("afterend", dom_);
  } catch (error) {
    console.error("Error adding project to DOM:", error);
  }
};

// Delete project
const deleteProject = async (id, dom_) => {
  if (
    confirm(
      "Are you sure you want to delete project? \n\n Operaion cannogt be undone."
    )
  ) {
    try {
      localprojects = localprojects.filter(
        (project) => project.id !== parseInt(id)
      );
      list_el.removeChild(
        dom_.parentElement.parentElement.parentElement.parentElement
      );
      updateLocalStorage();
      displayNotifications("Deleted successfully", "green");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }
  return;
};

// Update local storage
const updateLocalStorage = async () => {
  try {
    await localStorage.setItem("projects", JSON.stringify(localprojects));
  } catch (error) {
    console.error("Error updating local storage:", error);
  }
};

// Generate unique IDs
function generateUUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const generateID = () =>
  (localprojects.length + 1) *
  Math.floor(Math.random() * 212324376) *
  Math.floor(Math.random() * 2176845324376);

// Initialize
const init = async () => {
  try {
    await Promise.all(localprojects.map(addProjectDOM));
  } catch (error) {
    console.error("Error initializing projects:", error);
  }
};

init();

// Event listeners
form.addEventListener("submit", getNewProject);
