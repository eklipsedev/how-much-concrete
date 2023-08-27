const metadata = JSON.parse(document.querySelector("#metadata").textContent);
const calculatorList = document.querySelector(
  "[data-element='calculator-list']"
);
const results = document.querySelector("[data-element='results']");
const empty = document.querySelector("[data-element='empty']");

const unitToggle = document.querySelector('[data-setting="unitType"]');
const costToggle = document.querySelector('[data-setting="costType"]');
const bagSize = document.querySelector('[data-setting="bagSize"]');
const costPerBag = document.querySelector('[data-setting="costPerBag"]');
const wastePercentage = document.querySelector(
  '[data-setting="wastePercentage"]'
);

const totalConcrete = document.querySelector("[data-element='total-concrete']");
const totalBags = document.querySelector("[data-element='total-bags']");
const totalCost = document.querySelector("[data-element='total-cost']");

const body = document.body;

// what unit is this in?
let total = 0;

let wastePercentageAmount = 1;
let volumeYards = 0;
let volumeFeet = 0;
let volumeMeters = 0;

let kgs = 0;
let lbs = 0;

// Settings
const settings = {
  unitType: isImperialCountry() ? "imperial" : "metric",
  costType: () => {
    return costToggle.checked ? "cost-per-area" : "cost-per-bag";
  },
  bagSize: () => {
    return settings.unitType === "imperial" ? "80" : "50";
  },
  costPerBag: "",
  wastePercentage: "0"
};

const calculator = {
  type: metadata.type,
  length: metadata.length,
  width: metadata.width
};

function calculateTotal() {
  calculateTemplate(shapes.slab.type);
  calculateTemplate(shapes.wall.type);
  calculateTemplate(shapes.footing.type);
  calculateTemplate(shapes.column.type);
  calculateTemplate(shapes.curbGutter.type);
  calculateTemplate(shapes.stairs.type);
  calculateTemplate(shapes.tube.type);

  total =
    shapes.slab.subtotals +
    shapes.wall.subtotals +
    shapes.footing.subtotals +
    shapes.column.subtotals +
    shapes.curbGutter.subtotals +
    shapes.stairs.subtotals +
    shapes.tube.subtotals;

  // run calculation based on unit type
  const wastePercentageAmount = wastePercentage.value / 100 + 1;
  const isZero = (unitType) => {
    return setToTwoDecimals(unitType) > 0 ? setToTwoDecimals(unitType) : "—";
  };

  if (settings.unitType === "imperial") {
    // imperial units
    volumeYards = (total / 46660) * wastePercentageAmount;
    volumeFeet = (total / 1728) * wastePercentageAmount;
    lbs = (volumeFeet * 133) / bagSize.value;

    totalConcrete.textContent = isZero(volumeYards);
    totalBags.textContent = isZero(lbs);
  } else {
    // metric units
    volumeMeters = (total / 61020) * wastePercentageAmount;
    kgs = (volumeMeters * 2130) / bagSize.value;

    totalConcrete.textContent = isZero(volumeMeters);
    totalBags.textContent = isZero(kgs);
  }

  // set total cost
  if (calculatorList.children.length && costPerBag.value !== "") {
    const isBags = body.classList.contains("is-cost-per-bag")
      ? totalBags
      : totalConcrete;

    totalCost.textContent = isZero(
      setToTwoDecimals(isBags.textContent) * setToTwoDecimals(costPerBag.value)
    );
  } else {
    totalCost.textContent = "—";
  }

  // set conditional for when the results element should show
  if (total === 0) {
    results.style.display = "none";
  } else {
    results.style.display = "block";
  }
}

const hasValue = (unit) => {
  // for some reason 2 equals signs doesn't work right...confirm later
  return unit != "" ? parseFloat(unit.toFixed(3)).toString() : "";
};

// handle conversion between feet and meters
function convertFeetToMeters(feet) {
  const metersPerFoot = 0.3048;
  return hasValue(feet * metersPerFoot); //(feet * metersPerFoot).toFixed(3);
}

function convertMetersToFeet(meters) {
  const feetPerMeter = 3.28084;
  return hasValue(meters * feetPerMeter);
}

// handle conversion between inches and centimeters
function convertInchesToCentimeters(inches) {
  const centimetersPerInch = 2.54;
  return hasValue(inches * centimetersPerInch);
}

function convertCentimetersToInches(centimeters) {
  const inchesPerCentimeter = 0.393701;
  return hasValue(centimeters * inchesPerCentimeter);
}

function convertRows() {
  let calculatorListItems = Array.from(calculatorList.children);

  calculatorListItems.forEach((listItem) => {
    let rows = Array.from(listItem.querySelector("ul").children);

    rows.forEach((row) => {
      let metricRow = row.querySelector(`[data-unit="metric"]`);
      let imperialRow = row.querySelector(`[data-unit="imperial"]`);

      if (metricRow && imperialRow) {
        let metricUnit1 = metricRow.querySelector('[data-type="unit1"]');
        let metricUnit2 = metricRow.querySelector('[data-type="unit2"]');

        let imperialUnit1 = imperialRow.querySelector('[data-type="unit1"]');
        let imperialUnit2 = imperialRow.querySelector('[data-type="unit2"]');

        if (settings.unitType !== "metric") {
          // metric to imperial
          imperialUnit1.value = convertMetersToFeet(metricUnit1.value);
          imperialUnit2.value = convertCentimetersToInches(metricUnit2.value);
        } else {
          // imperial to metric
          metricUnit1.value = convertFeetToMeters(imperialUnit1.value);
          metricUnit2.value = convertInchesToCentimeters(imperialUnit2.value);
        }
      }
    });
  });
}

// local storage method
// decides whether to set array or to push new item into array
function typeCheck(storedCalcs, condition, method) {
  const objectTemplate = (type) => {
    return {
      type: shapes[type].type,
      name: shapes[type].name,
      template: shapes[type].template
    };
  };

  const setSavedCalculator = (object) => {
    return method === "set"
      ? (storedCalcs = [object])
      : storedCalcs.push(object);
  };

  switch (condition /*calculator.type*/) {
    case shapes.slab.type:
      setSavedCalculator(objectTemplate(shapes.slab.type));
      break;
    case shapes.wall.type:
      setSavedCalculator(objectTemplate(shapes.wall.type));
      break;
    case shapes.footing.type:
      setSavedCalculator(objectTemplate(shapes.footing.type));
      break;
    case shapes.column.type:
      setSavedCalculator(objectTemplate(shapes.column.type));
      break;
    case shapes.curbGutter.type:
      setSavedCalculator(objectTemplate(shapes.curbGutter.type));
      break;
    case shapes.stairs.type:
      setSavedCalculator(objectTemplate(shapes.stairs.type));
      break;
    case shapes.tube.type:
      setSavedCalculator(objectTemplate(shapes.tube.type));
      break;
    default:
      storedCalcs = [];
  }
}

// initialize the first calc storage
// will only be triggered when at least 1 input changes
// so check for event
function updateLocalStorageCalcs(e, action) {
  let storedCalcs = getLocalStorageItem("calculator");
  // loop over all calcs and their data that are currently inside of the calculator list
  // once you have this, set it as the array to be added to local storage
  switch (action) {
    case "create":
      // code block
      const type = e.target.parentNode.dataset.type;
      typeCheck(storedCalcs, type, "push");
      setLocalStorageItem("calculator", storedCalcs);
      break;
    case "remove":
      // code block
      const calc = e.target.closest("li");
      const calcIndex = Array.from(calculatorList.children).indexOf(calc);
      storedCalcs.splice(calcIndex, 1);
      setLocalStorageItem("calculator", storedCalcs);
      break;
    case "update":
      // code block
      const calcRow = e.target.closest("li");
      const calcRows = calcRow.parentNode;
      const calcRowIndex = Array.from(calcRows.children).indexOf(calcRow);
      const calcListItem = calcRows.parentNode;
      const calcListIndex2 = Array.from(calculatorList.children).indexOf(
        calcListItem
      );
      const unitType = e.target.dataset.type;
      const inputValue = parseFloat(e.target.value);
      const calcRowKeys = storedCalcs[calcListIndex2].template[calcRowIndex];

      for (const key in calcRowKeys) {
        if (unitType === key) {
          key.value = storedCalcs[calcListIndex2].template[calcRowIndex][
            key
          ] = inputValue;
        }
      }
      setLocalStorageItem("calculator", storedCalcs);
      break;
    case "updateUnitTypeValues":
      // code block
      Array.from(calculatorList.children).forEach((listItem, listItemIndex) => {
        let rows = Array.from(listItem.querySelector("ul").children);

        rows.forEach((row, rowIndex) => {
          let conversionRow = row.querySelector(
            `[data-unit="${settings.unitType}"]`
          );
          if (conversionRow) {
            let inputs = conversionRow.querySelectorAll("[data-calculate]");

            Array.from(inputs).forEach((input) => {
              let calcRowKeys = storedCalcs[listItemIndex].template[rowIndex];
              for (const key in calcRowKeys) {
                if (input.dataset.type === key) {
                  key.value = storedCalcs[listItemIndex].template[rowIndex][
                    key
                  ] = parseFloat(input.value);
                }
              }
            });
          }
        });
      });
      setLocalStorageItem("calculator", storedCalcs);
      break;
    case "updateName":
      // code block
      const calcItem = e.target.closest("li");
      const calcParent = calcItem.parentNode;
      const calcListIndex = Array.from(calcParent.children).indexOf(calcItem);
      storedCalcs[calcListIndex].name = e.target.value.trim();
      setLocalStorageItem("calculator", storedCalcs);
      break;
    case "reset":
      // code block
      setLocalStorageCalcs();
      break;
    default:
    // code block
  }
  calculateTotal();
  // will likely be an empty array, so check for this
  // there also might be multiple calcs that are empty, with 1 having a value
  // also need to account for name changing
}

function setLocalStorageCalcs() {
  let storedCalcs = [];

  typeCheck(
    storedCalcs,
    calculator.type /*&& localStorage.getItem("calculator").length*/,
    "push"
  );

  setLocalStorageItem("calculator", storedCalcs);
}

function getLocalStorageCalcs(e) {
  let storedCalcs = getLocalStorageItem("calculator")
    ? JSON.parse(localStorage.getItem("calculator"))
    : [];

  // check if any of the inputs have a value assigned to them
  // if not, start with a new calculator
  function doesStoredCalcsHaveValues() {
    let hasAValue = false;

    storedCalcs.forEach((savedItem) => {
      // also check if the name is different than the original name
      if (savedItem.name !== shapes[savedItem.type].name) {
        hasAValue = true;
      }

      savedItem.template.forEach((templateRow) => {
        if (
          (templateRow.unit1 && templateRow.unit1 !== null) ||
          (templateRow.unit2 && templateRow.unit2 !== null) ||
          (templateRow.quantity && templateRow.quantity !== 1)
        ) {
          hasAValue = true;
        }
      });
    });
    if (hasAValue === false) {
      return false;
    } else {
      return true;
    }
  }

  function setLengthAndWidthInputs() {
    const calc = calculatorList.querySelectorAll("li")[0];
    const calcList = calc.querySelector("ul");
    const calcListLengthRow = calcList.querySelectorAll("li")[0];
    const calcListLengthInput = calcListLengthRow
      .querySelector("[data-unit='imperial']")
      .querySelector("input");
    const calcListWidthRow = calcList.querySelectorAll("li")[1];
    const calcListWidthInput = calcListWidthRow
      .querySelector("[data-unit='imperial']")
      .querySelector("input");
    const calcListDepthRow = calcList.querySelectorAll("li")[2];
    const calcListDepthInput = calcListDepthRow
      .querySelector("[data-unit='imperial']")
      .querySelectorAll("input")[1];
    calcListLengthInput.value = calculator.length;
    calcListWidthInput.value = calculator.width;
    calcListDepthInput.value = 4;
  }

  if (!storedCalcs.length) {
    if (calculator.type === "main") {
      // do something?
    } else {
      if (calculator.length && calculator.width) {
        appendTemplate(calculator.type);
        setLengthAndWidthInputs();
        calculateTotal();
      } else {
        appendTemplate(calculator.type);
        typeCheck(storedCalcs, calculator.type, "push");
      }
    }
  } else {
    // stored calcs has a length
    if (calculator.type === "main") {
      if (doesStoredCalcsHaveValues()) {
        storedCalcs.forEach((item) => {
          appendTemplate(item.type);
        });
        renderCalcs(storedCalcs);
      } else {
        storedCalcs = [];
      }
    } else {
      // calc type is not main
      if (calculator.length && calculator.width) {
        appendTemplate(calculator.type);
        setLengthAndWidthInputs();
        calculateTotal();
      } else {
        // if it's not a measurement page, append the calcs
        if (doesStoredCalcsHaveValues()) {
          storedCalcs.forEach((item) => {
            appendTemplate(item.type);
          });
          renderCalcs(storedCalcs);
        } else if (!doesStoredCalcsHaveValues()) {
          appendTemplate(calculator.type);
          storedCalcs = [
            {
              name: shapes[calculator.type].name,
              template: shapes[calculator.type].template,
              type: calculator.type
            }
          ];
          typeCheck(storedCalcs, calculator.type, "set");
        }
      }
    }
  }
  setLocalStorageItem("calculator", storedCalcs);
}

function renderCalcs(storedCalcs) {
  if (storedCalcs) {
    // loop over each row in the calculator & match it with the appropriate object in localStorage
    const calcItems = calculatorList.getElementsByClassName(
      "calculator_list-item"
    );

    if (calcItems.length && storedCalcs.length) {
      Array.from(calcItems).forEach((listItem, listItemIndex) => {
        const nameInput = listItem.getElementsByTagName("input")[0];

        nameInput.value = storedCalcs[listItemIndex].name;

        Array.from(listItem.getElementsByTagName("li")).forEach(
          (row, index) => {
            const unitGroup = row.querySelector(
              `[data-unit="${settings.unitType}"]`
            );

            const value = (unit) => {
              return storedCalcs[listItemIndex].template[index][unit];
            };

            if (unitGroup) {
              const unit1 = unitGroup.querySelector('[data-type="unit1"]');
              const unit2 = unitGroup.querySelector('[data-type="unit2"]');

              if (unit1) {
                unit1.value = value("unit1");
              }
              if (unit2) {
                unit2.value = value("unit2");
              }
            } else {
              const quantity = row.querySelector('[data-type="quantity"]');
              const stepCount = row.querySelector('[data-type="stepCount"]');
              if (quantity) {
                quantity.value = value("quantity");
              }
              if (stepCount) {
                stepCount.value = value("stepCount");
              }
            }
          }
        );
      });
    }
  }
}

// Helper functions
function getLocalStorageItem(key) {
  return JSON.parse(localStorage.getItem(key));
}

function setLocalStorageItem(key, value) {
  return localStorage.setItem(key, JSON.stringify(value));
}

function toggleUnitTypeCheckbox(e) {
  unitToggle.checked
    ? (settings.unitType = "metric")
    : (settings.unitType = "imperial");
  if (body.classList.contains("is-imperial")) {
    body.classList.remove("is-imperial");
    body.classList.add("is-metric");
  } else if (body.classList.contains("is-metric")) {
    body.classList.remove("is-metric");
    body.classList.add("is-imperial");
  }
  convertRows();
  calculateTotal();
  updateLocalStorageCalcs(e, "updateUnitTypeValues");
}

function toggleCostTypeCheckbox(e) {
  costToggle.checked
    ? (settings.costType = "cost-per-area")
    : (settings.costType = "cost-per-bag");
  if (body.classList.contains("is-cost-per-bag")) {
    body.classList.remove("is-cost-per-bag");
    body.classList.add("is-cost-per-area");
  } else if (body.classList.contains("is-cost-per-area")) {
    body.classList.remove("is-cost-per-area");
    body.classList.add("is-cost-per-bag");
  }
  calculateTotal();
  updateLocalStorageCalcs(e, "updateCostTypeValues");
}

// add checked class to input when checked
function setCheckboxStyle(input) {
  const inputClass = input.previousSibling.classList;

  input.checked
    ? inputClass.add("w--redirected-checked")
    : inputClass.remove("w--redirected-checked");
}

function setInputFadeStyle(condition, el) {
  condition ? el.classList.remove("is-faded") : el.classList.add("is-faded");
}

function toggleClass(element, className) {
  if (element.classList.contains(className)) {
    element.classList.remove(className);
  } else {
    element.classList.add(className);
  }
}

function setToTwoDecimals(value) {
  return parseFloat(value).toFixed(2);
}

// get number value of a given input
function getValueOfInput(calc, row) {
  const rowGroup = calc.querySelector(`[data-row="${row}"]`);
  const unitGroup = rowGroup.querySelector(
    `[data-unit="${settings.unitType}"]`
  );
  // handle conversions somewhere else
  const unit1Multiplier = settings.unitType === "metric" ? 39.37 : 12;
  const unit2Multiplier = settings.unitType === "metric" ? 2.54 : 1;

  const setValueAsNumber = (el) => {
    return parseFloat(!el.value ? 0 : el.value);
  };

  // check if there is a unit group... quantity won't have one
  if (unitGroup) {
    return (
      setValueAsNumber(unitGroup.querySelector('[data-type="unit1"]')) *
        unit1Multiplier +
      setValueAsNumber(unitGroup.querySelector('[data-type="unit2"]')) /
        unit2Multiplier
    );
  } else {
    return setValueAsNumber(
      rowGroup.querySelector('[data-type="quantity"]') ||
        rowGroup.querySelector('[data-type="stepCount"]')
    );
  }
}

// create template for all calculator types
function calculateTemplate(type) {
  const calculators = calculatorList.querySelectorAll(
    `[data-calculator="${type}"]`
  );
  shapes[type].totals = [];
  shapes[type].subtotals = 0;

  if (calculators.length) {
    calculators.forEach((calculator, index) => {
      let length, width, quantity, height, depth;
      let formula = 0;

      switch (type) {
        case shapes.slab.type:
          depth = getValueOfInput(calculator, "depth");
          length = getValueOfInput(calculator, "length");
          width = getValueOfInput(calculator, "width");
          quantity = getValueOfInput(calculator, "quantity");

          formula = length * width * depth * quantity;
          break;
        case shapes.footing.type:
          depth = getValueOfInput(calculator, "depth");
          length = getValueOfInput(calculator, "length");
          width = getValueOfInput(calculator, "width");
          quantity = getValueOfInput(calculator, "quantity");

          formula = length * width * depth * quantity;
          break;
        case shapes.column.type:
          const diameter = getValueOfInput(calculator, "diameter");
          height = getValueOfInput(calculator, "height");
          quantity = getValueOfInput(calculator, "quantity");

          formula = (diameter * Math.PI * height * height * quantity) / 4;
          break;
        case shapes.curbGutter.type:
          length = getValueOfInput(calculator, "length");
          const curbDepth = getValueOfInput(calculator, "curbDepth");
          const curbHeight = getValueOfInput(calculator, "curbHeight");
          const flagThickness = getValueOfInput(calculator, "flagThickness");
          const gutterWidth = getValueOfInput(calculator, "gutterWidth");
          quantity = getValueOfInput(calculator, "quantity");

          formula =
            quantity *
            (length * curbDepth * curbHeight +
              length * flagThickness * (gutterWidth + curbDepth));
          break;
        case shapes.stairs.type:
          const rise = getValueOfInput(calculator, "rise");
          const run = getValueOfInput(calculator, "run");
          const platformDepth = getValueOfInput(calculator, "platformDepth");
          width = getValueOfInput(calculator, "width");
          const stepCount = getValueOfInput(calculator, "stepCount");
          quantity = getValueOfInput(calculator, "quantity");

          let steps = 0;
          // formula
          for (steps = 0; steps < stepCount; steps++) {
            if (steps === stepCount - 1) {
              formula += width * rise * (steps + 1) * platformDepth * quantity;
            } else {
              formula += width * rise * (steps + 1) * run * quantity;
            }
          }

          break;
        case shapes.tube.type:
          const innerDiameter = getValueOfInput(calculator, "innerDiameter");
          const outerDiameter = getValueOfInput(calculator, "outerDiameter");
          height = getValueOfInput(calculator, "height");
          quantity = getValueOfInput(calculator, "quantity");

          if (outerDiameter < innerDiameter) {
            settings.deliverMessage("tube change");
            return;
          }
          formula =
            (height *
              Math.PI *
              (outerDiameter * outerDiameter - innerDiameter * innerDiameter) *
              quantity) /
            4;
          break;
        default:
        //something
      }
      shapes[type].totals[index] = formula;

      shapes[type].subtotals = shapes[type].totals.reduce(
        (accumulator, value) => {
          return accumulator + value;
        },
        0
      );
    });
  } else {
    shapes[type].subtotals = 0;
  }
}

// check if the user is in an imperial country, returns True or False
function isImperialCountry() {
  const imperialCountries = ["US", "LR", "MM"]; // Add more country codes as needed

  const userLanguage = (navigator.language || "en-US").toUpperCase();
  const userCountryCode = userLanguage.split("-")[1];

  return imperialCountries.includes(userCountryCode);
}

// append a new list item to the list
const appendTemplate = (type) => {
  if (type !== "main") {
    let template = document
      .getElementById(`js-${type}-template`)
      .getElementsByTagName("li")[0];
    const clonedItem = template.cloneNode(true);
    calculatorList.appendChild(clonedItem);
    empty.style.display = "none";
  }
};

function initLocalStorageSettings() {
  // check to see if settings is saved in local storage
  // if saved, parse it and set the inputs to the correct values
  const storedSettings = getLocalStorageItem("settings");

  if (storedSettings) {
    // unit type check
    if (storedSettings.unitType === "metric") {
      unitToggle.checked = true;
      settings.unitType = "metric";
      if (body.classList.contains("is-imperial")) {
        body.classList.remove("is-imperial");
        body.classList.add("is-metric");
      }
    } else {
      unitToggle.checked = false;
      settings.unitType = "imperial";
      if (body.classList.contains("is-metric")) {
        body.classList.remove("is-metric");
        body.classList.add("is-imperial");
      }
    }

    // cost type check
    if (storedSettings.costType === "cost-per-area") {
      costToggle.checked = true;
      settings.costType = "cost-per-area";
      if (body.classList.contains("is-cost-per-bag")) {
        body.classList.remove("is-cost-per-bag");
        body.classList.add("is-cost-per-area");
      }
    } else {
      costToggle.checked = false;
      settings.costType = "cost-per-bag";
      if (body.classList.contains("is-cost-per-area")) {
        body.classList.remove("is-cost-per-area");
        body.classList.add("is-cost-per-bag");
      }
    }

    // bag size check
    bagSize.value = storedSettings.bagSize;

    // cost per bag check
    storedSettings.costPerBag !== ""
      ? (costPerBag.value = setToTwoDecimals(storedSettings.costPerBag))
      : (costPerBag.value = "");

    // waste percentage check
    wastePercentage.value = storedSettings.wastePercentage;
  } else {
    // set class to body based on user location
    document.body.classList.add(`is-${settings.unitType}`);
    unitToggle.checked = settings.UnitType === "metric" ? true : false; //settings.metric;
    bagSize.value = settings.bagSize();
    costPerBag.value = "";
    wastePercentage.value = settings.wastePercentage;

    // set current item back to local storage
    setLocalStorageItem("settings", {
      unitType: settings.unitType,
      costType: settings.costType(),
      bagSize: settings.bagSize(),
      costPerBag: settings.costPerBag,
      wastePercentage: settings.wastePercentage
    });
  }
  setCheckboxStyle(unitToggle);
  setCheckboxStyle(costToggle);
}

function updateLocalStorageSettings() {
  setLocalStorageItem("settings", {
    unitType: settings.unitType,
    costType: settings.costType,
    bagSize: bagSize.value,
    costPerBag: costPerBag.value,
    wastePercentage: wastePercentage.value
  });
}

// List shape templates
const shapes = {
  slab: {
    type: "slab",
    name: "Slab",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { quantity: 1 }
    ]
  },
  wall: {
    type: "wall",
    name: "Wall",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { quantity: 1 }
    ]
  },
  footing: {
    type: "footing",
    name: "Footing",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { quantity: 1 }
    ]
  },
  column: {
    type: "column",
    name: "Column",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { quantity: 1 }
    ]
  },
  curbGutter: {
    type: "curbGutter",
    name: "Curb / Gutter",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { quantity: 1 }
    ]
  },
  stairs: {
    type: "stairs",
    name: "Stairs",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { stepCount: null },
      { quantity: 1 }
    ]
  },
  tube: {
    type: "tube",
    name: "Circle / Tube",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { unit1: null, unit2: null },
      { quantity: 1 }
    ]
  }
};

// Message delivery system
let messageTimer = 0;

function deliverMessage(e, action) {
  const notification = document.querySelector("[data-element='notification']");
  const title = notification.firstChild;
  const message = title.nextSibling;

  let n = "";
  let t = "✓ success";

  if (notification.classList.contains("is-active")) {
    clearTimeout(messageTimer);
    notification.classList.remove("is-active");
  }

  // match the name for the given calculator
  const matchName = (calculator) => {
    for (const key of Object.entries(shapes)) {
      if (calculator === key[0]) {
        return key[1].name;
      }
    }
  };

  switch (action) {
    case "tube change":
      n = "inner diameter must be smaller than outer diameter";
      t = "✗ warning";
      break;
    case "update name":
      n = `${matchName(
        e.target.closest("li").dataset.calculator
      )} name updated`;
      break;
    case "create":
      n = `New ${matchName(
        e.target.nextSibling.firstChild.dataset.type
      )} added`;
      break;
    case "remove":
      n = `${matchName(e.target.closest("li").dataset.calculator)} removed`;
      break;
    case "reset":
      n = "measurements reset";
      break;
    case "waste percentage change":
      n = "waste percentage updated";
      break;
    case "cost per bag change":
      n = "cost per bag updated";
      break;
    case "bag size change":
      n = "bag size updated";
      break;
    default:
      n = "";
  }

  title.textContent = t;
  title.textContent === "✗ warning"
    ? (title.style.color = "red")
    : (title.style.color = "#ffb238");

  setTimeout(() => {
    message.textContent = n;
    notification.classList.add("is-active");
  }, 200);

  messageTimer = setTimeout(() => {
    notification.classList.remove("is-active");
  }, 3000);
}

// handle global click events
document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (action) {
    switch (action) {
      case "create":
        createCalcListItem(e);
        break;
      case "remove":
        removeCalcListItem(e);
        break;
      case "reset":
        resetCalcListItems(e);
        break;
      default:
        return;
    }
  }
});

// handle global change events
document.addEventListener("change", (e) => {
  const el = e.target;
  const setting = el.dataset.setting;
  const calculate = el.dataset.calculate;

  if (el && calculate) {
    // if the calc local storage item is an empty array
    if (!getLocalStorageItem("calculator").length) {
      // create an instance
      updateLocalStorageCalcs(e, "create");
    } else {
      // update current instance
      updateLocalStorageCalcs(e, "update");
    }
    //calculator.updateLocalStorage(e, "update");
    setInputFadeStyle(parseFloat(el.value) > 0, el);
  }
  if (el && setting) {
    switch (setting) {
      case "unitType":
        toggleUnitTypeCheckbox();
        updateLocalStorageCalcs(e, "updateUnitTypeValues");
        break;
      case "costType":
        toggleCostTypeCheckbox();
        break;
      case "bagSize":
        deliverMessage(e, "bag size change");
        break;
      case "costPerBag":
        if (costPerBag.value !== "") {
          costPerBag.value = setToTwoDecimals(costPerBag.value);
        }
        deliverMessage(e, "cost per bag change");
        break;
      case "wastePercentage":
        wastePercentageAmount = setToTwoDecimals(
          wastePercentage.value / 100 + 1
        );
        deliverMessage(e, "waste percentage change");
        break;
      default:
        return;
    }
    calculateTotal();
    updateLocalStorageSettings();
  }
});

// store name value temporarily to determine if name changed
let nameValue = "";

// handle global focus events
document.addEventListener(
  "focus",
  (e) => {
    const el = e.target;
    const action = el.dataset.action;
    if (action === "updateName") {
      nameValue = el.value.trim();
    }
  },
  true
);

// handle global blur events
document.addEventListener(
  "blur",
  (e) => {
    const el = e.target;
    const action = el.dataset.action;
    if (action === "updateName") {
      el.value = el.value.trim();

      if (el.value.trim() !== nameValue) {
        updateLocalStorageCalcs(e, "updateName");
        deliverMessage(e, "update name");
      }
    }
  },
  true
);

// create a new calculator item
const createCalcListItem = (e) => {
  const type = e.target.nextSibling.firstChild.dataset.type;
  appendTemplate(type);
  if (calculatorList.children.length) {
    empty.style.display = "none";
  }
  updateLocalStorageCalcs(e, "create");
  calculateTotal();
  deliverMessage(e, "create");
};

// remove an existing calculator item
const removeCalcListItem = (e) => {
  const parentListItem = e.target.closest("li");
  updateLocalStorageCalcs(e, "remove");
  parentListItem.remove();
  if (!calculatorList.children.length) {
    empty.style.display = "block";
  }
  calculateTotal();
  deliverMessage(e, "remove");
};

// reset all calculator items
const resetCalcListItems = (e) => {
  if (calculator.type === "main") {
    updateLocalStorageCalcs(e, "reset");
    calculatorList.innerHTML = "";
    empty.style.display = "block";
  } else if (calculator.type !== "main") {
    calculatorList.innerHTML = "";
    appendTemplate(calculator.type);
    setLocalStorageCalcs();
    empty.style.display = "none";
  }
  calculateTotal();
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  deliverMessage(e, "reset");
};

function init() {
  isImperialCountry();
  initLocalStorageSettings();
  getLocalStorageCalcs();
  //setLocalStorageCalcs();
  calculateTotal();
}

init();
