const colorDivs = document.querySelectorAll(".colour");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll("input[type=range]");
const currentHexes = document.querySelectorAll(".colour h2");
const popup = document.querySelector(".copy-container");
const adjustbtn = document.querySelectorAll(".adjust");
const lockbtn = document.querySelectorAll(".lock");
const closeadjustbtns = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

//this is for local storage
let savedPalettes = [];

//Add event listeners

generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustbtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeadjustbtns.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockbtn.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockUI(e, index);
  });
});

//funtions
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  // initial color
  initialColors = [];
  colorDivs.forEach((div, index) => {
    // console.log(div.children);
    const hexText = div.children[0];
    const rColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(rColor).hex());
    }
    //Added it to the array
    // console.log(hexText.innerText,rColor.hex());
    // console.log(chroma(rColor).hex());

    //initialColors.push(chroma(rColor).hex());

    div.style.backgroundColor = rColor;
    hexText.innerText = rColor;

    //check contrast
    checkTextContrast(rColor, hexText);

    //initialize colorize sliders
    const color = chroma(rColor);
    const sliders = div.querySelectorAll(".sliders input");
    // console.log(sliders);
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  //reset input
  resetinputs();

  //check for button contrast
  adjustbtn.forEach((button, index) => {
    // console.log(button);
    // console.log(lockbtn[index]);
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockbtn[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  //scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //update input color
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  // console.log(e);
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");
  // console.log(index);
  let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
  // console.log(sliders);
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];
  // console.log(bgColor);

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  //live colorize input/sliders
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  //  console.log(color);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  //check textcolor contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetinputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      // console.log(hueValue);
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      // console.log(brightValue);
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      // console.log(Math.floor(satValue*100) / 100);
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  //pop up animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockUI(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");
  // console.log(activeBg);

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = "<i class='fas fa-lock'></i>";
  } else {
    e.target.innerHTML = "<i class='fas fa-lock-open'></i>";
  }
}

// implement save to palette and local storeage
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryCnt = document.querySelector(".library-container");
const librarybtn = document.querySelector(".library");
const closelibrarybtn = document.querySelector(".close-library");

//eventlistners

saveBtn.addEventListener("click", openPalatte);
closeSave.addEventListener("click", closePalatte);
submitSave.addEventListener("click", savedPalette);
librarybtn.addEventListener("click", openlibrary);
closelibrarybtn.addEventListener("click", closelibrary);
//functions

function openPalatte(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalatte(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.add("remove");
}

function savedPalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // generate objects

  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalette.length;
  }

  const paletteObj = {
    name,
    colors,
    nr: paletteNr,
  };
  savedPalettes.push(paletteObj);
  // console.log(savedPalettes);

  //save to local storage
  savetolocal(paletteObj);
  saveInput.value = "";

  //generate the palette for library

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  //attach event to the btn
  paletteBtn.addEventListener("click", (e) => {
    closelibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetinputs();
  });

  //append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryCnt.children[0].appendChild(palette);
}

function savetolocal(paletteObj) {
  let localPalette;
  if (localStorage.getItem("palettes") === null) {
    localPalette = [];
  } else {
    localPalette = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalette.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalette));
}

function openlibrary(e) {
  const popup = libraryCnt.children[0];
  libraryCnt.classList.add("active");
  popup.classList.add("active");
}

function closelibrary() {
  const popup = libraryCnt.children[0];
  libraryCnt.classList.remove("active");
  popup.classList.remove("active");
}
function getlocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalette = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      //generate the palette for library

      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";

      //attach event to the btn
      paletteBtn.addEventListener("click", (e) => {
        closelibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetinputs();
      });

      //append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryCnt.children[0].appendChild(palette);
    });
  }
}

getlocal();
randomColors();
