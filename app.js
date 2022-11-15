// from inches
const unit_rate = {
  feet: 0.3048,
  inches: 0.0254,
  yards: 46660,
  meters: 1.0,
  centimeters: 0.01,
  density: 2130,
  density_lbs: 133
};

const calculatorList = document.querySelector(".calculator_list");

const toggle = document.getElementById("metric");
const bagSize = document.getElementById("bagSize");
const costPerBag = document.getElementById("costPerBag");
const wastePercentage = document.getElementById("wastePercentage");

const totalConcrete = document.getElementById("totalConcrete");
const totalBags = document.getElementById("totalBags");
const totalCost = document.getElementById("totalCost");

// total in inches
let slabTotals = [];
let wallTotals = [];
let footingTotals = [];
let columnTotals = [];
let curbGutterTotals = [];
let stairsTotals = [];
let tubeTotals = [];

let slabSubTotals = 0;
let wallSubTotals = 0;
let footingSubTotals = 0;
let columnSubTotals = 0;
let curbGutterSubTotals = 0;
let stairsSubTotals = 0;
let tubeSubTotals = 0;

let total = 0;

let wastePercentageAmount = 1;
let volumeYards = 0;
let volumeFeet = 0;

//const kgs = total * 2130;
let lbs = 0;

const units = {
  unit1: "unit1",
  unit2: "unit2",
  unit3: "unit3",
  quantity: "quantity"
};

const empty = document.querySelector("#empty");

// utils
// set dropdown to close when list item is clicked
/*
const dropdown = document.getElementsByClassName("add_dropdown")[0];

Array.from(dropdown.getElementsByClassName("w-dyn-item")).forEach(
  (listItem) => {
    const dropdownToggle = dropdown.firstChild;
    const dropdownNav = dropdown.getElementsByTagName("nav")[0];

    listItem.addEventListener("click", () => {
      dropdown.classList.remove("w--open");
      dropdownToggle.classList.remove("w--open");
      dropdownToggle.setAttribute("aria-expanded", false);
      dropdownNav.classList.remove("w--open");
      const event = new CustomEvent("w-close");
      dropdown.dispatchEvent(event);
    });
  }
);
*/

// get number value of a given input
const selector = (calculatorElement, row, type) => {
  const rowGroup = calculatorElement.querySelector(`[data-row="${row}"]`);
  const unitGroup = rowGroup.querySelector(
    `[data-unit="${calculator.currentUnit}"]`
  );

  const hasValue = (el) => {
    return !el.value ? 0 : el.value;
  };

  // check if there is a unit group... quantity won't have one
  if (!unitGroup) {
    return parseFloat(
      hasValue(rowGroup.querySelector(`[data-type="${type}"]`))
    );
    //return parseFloat(rowGroup.querySelector(`[data-type="${type}"]`).value);
  } else {
    return parseFloat(
      hasValue(unitGroup.querySelector(`[data-type="${type}"]`))
    );
    //return parseFloat(unitGroup.querySelector(`[data-type="${type}"]`).value);
  }
};

// add checked class to input when checked
const setCheckedStyle = (input) => {
  const inputClass = input.previousSibling.classList;

  input.checked
    ? inputClass.add("w--redirected-checked")
    : inputClass.remove("w--redirected-checked");
};

const setSelectClass = (el, isSelected) => {
  const selectClass = el.classList;

  !isSelected ? selectClass.remove("is-faded") : selectClass.add("is-faded");
};

// append a new list item to the list
const appendTemplate = (type) => {
  if (type !== "main") {
    let template = document
      .getElementById(`js-${type}-template`)
      .getElementsByTagName("li")[0];
    const clonedItem = template.cloneNode(true);
    calculatorList.appendChild(clonedItem);
  }
};

const settings = {
  metric: false,
  bagSize: "80",
  costPerBag: "",
  wastePercentage: "0",
  initLocalStorage: () => {
    // check to see if settings is saved in local storage
    // if saved, parse it and set the inputs to the correct values
    const storedSettings = JSON.parse(localStorage.getItem("settings"));

    if (storedSettings) {
      if (storedSettings.metric) {
        toggle.checked = true;
        document.body.className = "is-metric";
      } else {
        toggle.checked = false;
        document.body.className = "is-imperial";
      }

      bagSize.value = storedSettings.bagSize;
      bagSize.value = storedSettings.bagSize;
      if (storedSettings.costPerBag !== "") {
        costPerBag.value = storedSettings.costPerBag;
      } else {
        costPerBag.value = "";
      }
      wastePercentage.value = storedSettings.wastePercentage;
    } else {
      toggle.checked = settings.metric;
      bagSize.value = settings.bagSize;
      costPerBag.value = "";
      wastePercentage.value = settings.wastePercentage;
      localStorage.setItem(
        "settings",
        JSON.stringify({
          metric: settings.metric,
          bagSize: settings.bagSize,
          costPerBag: settings.costPerBag,
          wastePercentage: settings.wastePercentage
        })
      );
    }
    setCheckedStyle(toggle);
  },
  updateLocalStorage: () => {
    // when inputs change, update the local storage for settings
    const settings = {
      metric: toggle.checked,
      bagSize: bagSize.value,
      costPerBag: costPerBag.value,
      wastePercentage: wastePercentage.value
    };
    localStorage.setItem("settings", JSON.stringify(settings));
  },
  deliverMessage: (e, action) => {
    const notification = document.querySelector("#notification");
    const title = notification.querySelector("h5");
    const message = notification.querySelector("p");
    let n = "";
    let t = "✓ success";

    switch (action) {
      case "tube change":
        n = "inner diameter must be smaller than outer diameter";
        t = "✗ warning";
        break;
      case "update name":
        n = `${e.target.closest("li").dataset.calculator} name updated`;
        break;
      case "create":
        n = `New ${e.target.nextSibling.firstChild.dataset.type} added`;
        break;
      case "remove":
        n = `${e.target.closest("li").dataset.calculator} measurement removed`;
        break;
      case "reset":
        n = "calculator reset";
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

    message.textContent = n;
    title.textContent = t;
    title.textContent === "✗ warning"
      ? (title.style.color = "red")
      : (title.style.color = "#ffb238");
    notification.classList.add("is-active");
    setTimeout(() => {
      notification.classList.remove("is-active");
    }, 3000);
  }
};

const metadata = document.querySelector("#metadata");

const calculator = {
  type: JSON.parse(metadata.textContent).type, //document.body.dataset.calculator,
  currentUnit: "imperial",
  metricIsOff: true,
  rectangleTemplate: [
    // covers slabs, footings & walls
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { quantity: 1 }
  ],
  columnTemplate: [
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { quantity: 1 }
  ],
  curbGutterTemplate: [
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { quantity: 1 }
  ],
  stairsTemplate: [
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { quantity: 1 }
  ],
  tubeTemplate: [
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { unit1: null, unit2: null, unit3: null },
    { quantity: 1 }
  ],
  calculateSlabs: (e) => {
    const slabCalculators = calculatorList.querySelectorAll(
      '[data-calculator="slab"]'
    );
    slabTotals = [];

    if (slabCalculators.length) {
      slabCalculators.forEach((calculator, index) => {
        let dimensionValue;

        const length =
          selector(calculator, "length", units.unit1) * 12 +
          selector(calculator, "length", units.unit2) +
          selector(calculator, "length", units.unit3);
        const width =
          selector(calculator, "width", units.unit1) * 12 +
          selector(calculator, "width", units.unit2) +
          selector(calculator, "width", units.unit3);

        const depth =
          selector(calculator, "depth", units.unit1) * 12 +
          selector(calculator, "depth", units.unit2) +
          selector(calculator, "depth", units.unit3);
        const quantity = selector(calculator, "quantity", units.quantity);

        dimensionValue = length * width * depth * quantity;

        slabTotals[index] = dimensionValue;

        slabSubTotals = slabTotals.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);
      });
    } else {
      slabSubTotals = 0;
    }
  },
  calculateWalls: (e) => {
    const wallCalculators = calculatorList.querySelectorAll(
      '[data-calculator="wall"]'
    );
    wallTotals = [];

    if (wallCalculators.length) {
      wallCalculators.forEach((calculator, index) => {
        let dimensionValue;

        const length =
          selector(calculator, "length", units.unit1) * 12 +
          selector(calculator, "length", units.unit2) +
          selector(calculator, "length", units.unit3);
        const width =
          selector(calculator, "width", units.unit1) * 12 +
          selector(calculator, "width", units.unit2) +
          selector(calculator, "width", units.unit3);

        const depth =
          selector(calculator, "depth", units.unit1) * 12 +
          selector(calculator, "depth", units.unit2) +
          selector(calculator, "depth", units.unit3);
        const quantity = selector(calculator, "quantity", units.quantity);

        dimensionValue = length * width * depth * quantity;

        wallTotals[index] = dimensionValue;

        wallSubTotals = wallTotals.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);
      });
    } else {
      wallSubTotals = 0;
    }
  },
  calculateFootings: (e) => {
    const footingCalculators = calculatorList.querySelectorAll(
      '[data-calculator="footing"]'
    );
    footingTotals = [];

    if (footingCalculators.length) {
      footingCalculators.forEach((calculator, index) => {
        let dimensionValue;

        const length =
          selector(calculator, "length", units.unit1) * 12 +
          selector(calculator, "length", units.unit2) +
          selector(calculator, "length", units.unit3);
        const width =
          selector(calculator, "width", units.unit1) * 12 +
          selector(calculator, "width", units.unit2) +
          selector(calculator, "width", units.unit3);

        const depth =
          selector(calculator, "depth", units.unit1) * 12 +
          selector(calculator, "depth", units.unit2) +
          selector(calculator, "depth", units.unit3);
        const quantity = selector(calculator, "quantity", units.quantity);

        dimensionValue = length * width * depth * quantity;

        footingTotals[index] = dimensionValue;

        footingSubTotals = footingTotals.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);
      });
    } else {
      footingSubTotals = 0;
    }
  },
  calculateColumns: (e) => {
    const columnCalculators = calculatorList.querySelectorAll(
      '[data-calculator="column"]'
    );
    columnTotals = [];

    if (columnCalculators.length) {
      columnCalculators.forEach((calculator, index) => {
        let dimensionValue;

        const height =
          selector(calculator, "height", units.unit1) * 12 +
          selector(calculator, "height", units.unit2) +
          selector(calculator, "height", units.unit3);
        const diameter =
          selector(calculator, "diameter", units.unit1) * 12 +
          selector(calculator, "diameter", units.unit2) +
          selector(calculator, "diameter", units.unit3);
        const quantity = selector(calculator, "quantity", units.quantity);

        dimensionValue = (diameter * Math.PI * height * height * quantity) / 4;

        columnTotals[index] = dimensionValue;

        columnSubTotals = columnTotals.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);
      });
    } else {
      columnSubTotals = 0;
    }
  },
  calculateCurbGutters: (e) => {
    const curbGutterCalculators = calculatorList.querySelectorAll(
      '[data-calculator="curbGutter"]'
    );
    curbGutterTotals = [];

    if (curbGutterCalculators.length) {
      curbGutterCalculators.forEach((calculator, index) => {
        let dimensionValue;

        const length =
          selector(calculator, "length", units.unit1) * 12 +
          selector(calculator, "length", units.unit2) +
          selector(calculator, "length", units.unit3);
        const flagThickness =
          selector(calculator, "flagThickness", units.unit1) * 12 +
          selector(calculator, "flagThickness", units.unit2) +
          selector(calculator, "flagThickness", units.unit3);
        const gutterWidth =
          selector(calculator, "gutterWidth", units.unit1) * 12 +
          selector(calculator, "gutterWidth", units.unit2) +
          selector(calculator, "gutterWidth", units.unit3);
        const curbHeight =
          selector(calculator, "curbHeight", units.unit1) * 12 +
          selector(calculator, "curbHeight", units.unit2) +
          selector(calculator, "curbHeight", units.unit3);
        const curbDepth =
          selector(calculator, "curbDepth", units.unit1) * 12 +
          selector(calculator, "curbDepth", units.unit2) +
          selector(calculator, "curbDepth", units.unit3);
        const quantity = selector(calculator, "quantity", units.quantity);

        dimensionValue =
          quantity *
          (length * curbDepth * curbHeight +
            length * flagThickness * (gutterWidth + curbDepth));

        curbGutterTotals[index] = dimensionValue;

        curbGutterSubTotals = curbGutterTotals.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);
      });
    } else {
      curbGutterSubTotals = 0;
    }
  },
  calculateStairs: (e) => {
    const stairsCalculators = calculatorList.querySelectorAll(
      '[data-calculator="stairs"]'
    );
    stairsTotals = [];

    if (stairsCalculators.length) {
      stairsCalculators.forEach((calculator, index) => {
        let dimensionValue;

        const platformDepth =
          selector(calculator, "platformDepth", units.unit1) * 12 +
          selector(calculator, "platformDepth", units.unit2) +
          selector(calculator, "platformDepth", units.unit3);
        const width =
          selector(calculator, "width", units.unit1) * 12 +
          selector(calculator, "width", units.unit2) +
          selector(calculator, "width", units.unit3);
        const rise =
          selector(calculator, "rise", units.unit1) * 12 +
          selector(calculator, "rise", units.unit2) +
          selector(calculator, "rise", units.unit3);
        const run =
          selector(calculator, "run", units.unit1) * 12 +
          selector(calculator, "run", units.unit2) +
          selector(calculator, "run", units.unit3);
        const quantity = selector(calculator, "quantity", units.quantity);
        let stepCount = 0;

        // formula
        for (stepCount = 0; stepCount < quantity; stepCount++) {
          if (stepCount === quantity - 1) {
            dimensionValue = width * rise * (stepCount + 1) * platformDepth;
          } else {
            dimensionValue += width * rise * (stepCount + 1) * run;
          }
        }

        stairsTotals[index] = dimensionValue;

        stairsSubTotals = stairsTotals.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);
      });
    } else {
      stairsSubTotals = 0;
    }
  },
  calculateTubes: (e) => {
    const tubeCalculators = calculatorList.querySelectorAll(
      '[data-calculator="tube"]'
    );
    tubeTotals = [];

    if (tubeCalculators.length) {
      tubeCalculators.forEach((calculator, index) => {
        let dimensionValue;

        const outerDiameter =
          selector(calculator, "outerDiameter", units.unit1) * 12 +
          selector(calculator, "outerDiameter", units.unit2) +
          selector(calculator, "outerDiameter", units.unit3);
        const innerDiameter =
          selector(calculator, "innerDiameter", units.unit1) * 12 +
          selector(calculator, "innerDiameter", units.unit2) +
          selector(calculator, "innerDiameter", units.unit3);
        const height =
          selector(calculator, "height", units.unit1) * 12 +
          selector(calculator, "height", units.unit2) +
          selector(calculator, "height", units.unit3);
        const quantity = selector(calculator, "quantity", units.quantity);

        if (outerDiameter < innerDiameter) {
          settings.deliverMessage(e, "tube change");
          //alert("The inner diamerter needs to be smaller than outer diameter");
          return;
        }
        dimensionValue =
          (height *
            Math.PI *
            (outerDiameter * outerDiameter - innerDiameter * innerDiameter) *
            quantity) /
          4;

        tubeTotals[index] = dimensionValue;

        tubeSubTotals = tubeTotals.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);
      });
    } else {
      tubeSubTotals = 0;
    }
  },
  calculateTotal: (e) => {
    calculator.calculateSlabs(e);
    calculator.calculateWalls(e);
    calculator.calculateFootings(e);
    calculator.calculateColumns(e);
    calculator.calculateCurbGutters(e);
    calculator.calculateStairs(e);
    calculator.calculateTubes(e);

    total =
      slabSubTotals +
      wallSubTotals +
      footingSubTotals +
      columnSubTotals +
      curbGutterSubTotals +
      stairsSubTotals +
      tubeSubTotals;

    volumeYards = (total / 46660) * (wastePercentage.value / 100 + 1);
    // set total cubic yards
    totalConcrete.textContent = volumeYards.toFixed(2);

    volumeFeet = (total / 1728) * (wastePercentage.value / 100 + 1);
    lbs = (volumeFeet * 133) / bagSize.value;

    // set total bags
    totalBags.textContent = lbs.toFixed(2);
    // set total cost
    if (costPerBag.value !== "") {
      totalCost.textContent = `$${(
        parseFloat(totalBags.textContent).toFixed(2) *
        parseFloat(costPerBag.value).toFixed(2)
      ).toFixed(2)}`;
    } else {
      totalCost.textContent = "— —";
    }
  },
  convertRow: (e) => {
    const unitType = e.target.closest(".calculator_inputs").dataset.unit;

    const queryInput = (unitType, unit) => {
      const hasUnitType = e.target
        .closest(".calculator_group")
        .querySelector(`[data-unit="${unitType}"]`);
      if (hasUnitType) {
        return hasUnitType.querySelector(`[data-type="${unit}"]`);
      }
    };
    let feetInput = queryInput("imperial", units.unit1);
    let inchesInput = queryInput("imperial", units.unit2);
    let dyadicInput = queryInput("imperial", units.unit3);

    let metersInput = queryInput("metric", units.unit1);
    let centimetersInput = queryInput("metric", units.unit2);
    let millimetersInput = queryInput("metric", units.unit3);

    const metricToImperial = () => {
      // METERS TO FEET/INCHES
      // total inches = 100×1m/2.54 + 0cm/2.54 + 0mm/2.54 = 39.37007874in
      // feet from total inches = floor(39.37007874in/12) = 3ft
      // leftover inches = 39.37007874in - 12×3ft = 3.37007874in
      // leftover dyadic inches = ?
      // length = 3ft+3.37007874in

      const dyadicValues = [
        0,
        0.0625,
        0.125,
        0.1875,
        0.25,
        0.3125,
        0.375,
        0.4375,
        0.5,
        0.5625,
        0.625,
        0.6875,
        0.75,
        0.8175,
        0.875,
        0.9375
      ];

      const totalInches =
        (100 * metersInput.value) / 2.54 +
        centimetersInput.value / 2.54 +
        millimetersInput.value / 2.54;
      const feetFromTotalInches = Math.floor(totalInches / 12);
      const leftoverInches = totalInches - 12 * feetFromTotalInches;
      const leftoverDyadicInches = leftoverInches % 2;
      const dyadicAmount = dyadicValues.reduce((prev, curr) => {
        return Math.abs(curr - leftoverDyadicInches) <
          Math.abs(prev - leftoverDyadicInches)
          ? curr
          : prev;
      });

      dyadicInput.value = dyadicAmount;
      inchesInput.value = Math.floor(leftoverInches);
      feetInput.value = feetFromTotalInches;
    };
    const imperialToMetric = () => {
      // FEET/INCHES TO METERS
      // 3ft × 0.3048 + 2in × 0.0254
      // = 0.9652m

      const totalMeters =
        feetInput.value / 3.281 +
        inchesInput.value / 39.37 +
        dyadicInput.value / 629.95;
      const decimalValue = Number(totalMeters.toString().split(".")[1]);

      metersInput.value = Math.floor(totalMeters);
      centimetersInput.value = `0.${String(decimalValue).slice(0, 2)}`;
      millimetersInput.value = `0.00${String(decimalValue).slice(2, 3)}`;
    };

    if (unitType === "metric") {
      metricToImperial();
    } else if (unitType === "imperial") {
      imperialToMetric();
    }
  },
  render: (savedCalculatorType) => {
    if (savedCalculatorType) {
      if (savedCalculatorType.length >= 1) {
        empty.style.display = "none";
        savedCalculatorType.forEach((item) => {
          appendTemplate(item.type);
        });
      } else {
        const type = document.body.dataset.calculator;
        type ? appendTemplate(type) : (empty.style.display = "block");
        //appendTemplate(type);
      }

      // loop over each row in the calculator & match it with the appropriate object in localStorage
      const calculatorItems = calculatorList.getElementsByClassName(
        "calculator_list-item"
      );

      if (calculatorItems.length) {
        Array.from(calculatorItems).forEach((listItem, listItemIndex) => {
          const nameInput = listItem.getElementsByTagName("input")[0];

          nameInput.value = savedCalculatorType[listItemIndex].name;

          Array.from(listItem.getElementsByTagName("li")).forEach(
            (row, index) => {
              const unit1Input = row.querySelector(
                `[data-type="${units.unit1}"]`
              );
              const unit2Input = row.querySelector(
                `[data-type="${units.unit2}"]`
              );
              const unit3Input = row.querySelector(
                `[data-type="${units.unit3}"]`
              );
              const quantityInput = row.querySelector('[data-type="quantity"]');

              if (unit1Input) {
                unit1Input.value =
                  savedCalculatorType[listItemIndex].template[index].unit1;
              }
              if (unit2Input) {
                unit2Input.value = savedCalculatorType[listItemIndex].template[
                  index
                ].unit2
                  ? savedCalculatorType[listItemIndex].template[index].unit2
                  : 0;
                setSelectClass(unit2Input, unit2Input.value == 0);
              }
              if (unit3Input) {
                unit3Input.value = savedCalculatorType[listItemIndex].template[
                  index
                ].unit3
                  ? savedCalculatorType[listItemIndex].template[index].unit3
                  : 0;
                setSelectClass(unit3Input, unit3Input.value == 0);
              }
              if (quantityInput) {
                quantityInput.value =
                  savedCalculatorType[listItemIndex].template[index].quantity;
              }
            }
          );
        });
      } else {
      }
    }
  },
  getLocalStorage: () => {
    const calculatorType = calculator.type + "-calculator";
    let savedCalculatorType = localStorage.getItem(calculatorType);

    if (!savedCalculatorType || !savedCalculatorType.length) {
      if (calculator.type === "main") {
        savedCalculatorType = [];
      } else if (calculator.type === "slab") {
        savedCalculatorType = [
          {
            type: "slab",
            name: "Slab",
            template: calculator.rectangleTemplate
          }
        ];
      } else if (calculator.type === "wall") {
        savedCalculatorType = [
          {
            type: "wall",
            name: "Wall",
            template: calculator.rectangleTemplate
          }
        ];
      } else if (calculator.type === "footing") {
        savedCalculatorType = [
          {
            type: "footing",
            name: "Footing",
            template: calculator.rectangleTemplate
          }
        ];
      } else if (calculator.type === "column") {
        savedCalculatorType = [
          {
            type: "column",
            name: "Column",
            template: calculator.columnTemplate
          }
        ];
      } else if (calculator.type === "curbGutter") {
        savedCalculatorType = [
          {
            type: "curbGutter",
            name: "Curb / Gutter",
            template: calculator.curbGutterTemplate
          }
        ];
      } else if (calculator.type === "stairs") {
        savedCalculatorType = [
          {
            type: "stairs",
            name: "Stairs",
            template: calculator.stairsTemplate
          }
        ];
      } else if (calculator.type === "tube") {
        savedCalculatorType = [
          {
            type: "tube",
            name: "Circle / Tube",
            template: calculator.tubeTemplate
          }
        ];
      }
      localStorage.setItem(calculatorType, JSON.stringify(savedCalculatorType));
      calculator.render(savedCalculatorType);
    } else {
      savedCalculatorType = localStorage.getItem(calculatorType);
      calculator.render(JSON.parse(savedCalculatorType));
    }
  },
  setLocalStorage: () => {
    const calculatorType = calculator.type + "-calculator";
    let storageData = [];

    if (calculator.type === "main") {
      storageData = [];
    } else if (calculator.type === "slab") {
      storageData = [
        {
          type: "slab",
          name: "Slab",
          template: calculator.rectangleTemplate
        }
      ];
    } else if (calculator.type === "wall") {
      storageData = [
        {
          type: "wall",
          name: "Wall",
          template: calculator.rectangleTemplate
        }
      ];
    } else if (calculator.type === "footing") {
      storageData = [
        {
          type: "footing",
          name: "Footing",
          template: calculator.rectangleTemplate
        }
      ];
    } else if (calculator.type === "column") {
      storageData = [
        {
          type: "column",
          name: "Column",
          template: calculator.columnTemplate
        }
      ];
    } else if (calculator.type === "curbGutter") {
      storageData = [
        {
          type: "curbGutter",
          name: "Curb / Gutter",
          template: calculator.curbGutterTemplate
        }
      ];
    } else if (calculator.type === "stairs") {
      storageData = [
        {
          type: "stairs",
          name: "Stairs",
          template: calculator.stairsTemplate
        }
      ];
    } else if (calculator.type === "tube") {
      storageData = [
        {
          type: "tube",
          name: "Circle / Tube",
          template: calculator.tubeTemplate
        }
      ];
    }
    localStorage.setItem(calculatorType, JSON.stringify(storageData));
  },
  updateLocalStorage: (e, action) => {
    const calculatorType = calculator.type + "-calculator";
    const savedCalculatorType = JSON.parse(
      localStorage.getItem(calculatorType)
    );

    if (action === "create") {
      const type = e.target.nextSibling.firstChild.dataset.type; //e.target.nextSibling.firstChild.dataset.type;

      if (type === "slab") {
        savedCalculatorType.push({
          type: "slab",
          name: "Slab",
          template: calculator.rectangleTemplate
        });
      } else if (type === "wall") {
        savedCalculatorType.push({
          type: "wall",
          name: "Wall",
          template: calculator.rectangleTemplate
        });
      } else if (type === "footing") {
        savedCalculatorType.push({
          type: "footing",
          name: "Footing",
          template: calculator.rectangleTemplate
        });
      } else if (type === "column") {
        savedCalculatorType.push({
          type: "column",
          name: "Column",
          template: calculator.columnTemplate
        });
      } else if (type === "curbGutter") {
        savedCalculatorType.push({
          type: "curbGutter",
          name: "Curb / Gutter",
          template: calculator.curbGutterTemplate
        });
      } else if (type === "stairs") {
        savedCalculatorType.push({
          type: "stairs",
          name: "Stairs",
          template: calculator.stairsTemplate
        });
      } else if (type === "tube") {
        savedCalculatorType.push({
          type: "tube",
          name: "Circle / Tube",
          template: calculator.tubeTemplate
        });
      }
      localStorage.setItem(calculatorType, JSON.stringify(savedCalculatorType));
    } else if (action === "remove") {
      const calculatorListItem = e.target.closest("li"), // the lists list item
        calculatorListItemIndex = Array.from(calculatorList.children).indexOf(
          calculatorListItem
        );

      savedCalculatorType.splice(calculatorListItemIndex, 1);
      localStorage.setItem(calculatorType, JSON.stringify(savedCalculatorType));
    } else if (action === "update") {
      // read the value from the input
      // loop through all the keys in the storage item
      // set the indexed storage item to value of input
      // reset the localStorage Item
      const calculatorRow = e.target.closest("li"),
        calculatorRows = calculatorRow.parentNode,
        calculatorRowIndex = Array.from(calculatorRows.children).indexOf(
          calculatorRow
        ),
        calculatorListItem = calculatorRows.parentNode, // the lists list item
        calculatorListIndex = Array.from(calculatorList.children).indexOf(
          calculatorListItem
        );
      const datasetType = e.target.dataset.type;
      const datasetValue = parseFloat(e.target.value);
      const calculatorRowKeys =
        savedCalculatorType[calculatorListIndex].template[calculatorRowIndex];

      for (const key in calculatorRowKeys) {
        if (datasetType === key) {
          key.value = savedCalculatorType[calculatorListIndex].template[
            calculatorRowIndex
          ][key] = datasetValue;
        }
      }
      localStorage.setItem(calculatorType, JSON.stringify(savedCalculatorType));
    } else if (action === "updateName") {
      const calculatorItem = e.target.closest("li"),
        calculatorParentItem = calculatorItem.parentNode,
        calculatorListIndex = Array.from(calculatorParentItem.children).indexOf(
          calculatorItem
        );

      savedCalculatorType[calculatorListIndex].name = e.target.value.trim();
      localStorage.setItem(calculatorType, JSON.stringify(savedCalculatorType));
    } else if (action === "reset") {
      calculator.setLocalStorage();
    }
    calculator.calculateTotal();
  },
  init: () => {
    settings.initLocalStorage();
    calculator.getLocalStorage();
    calculator.calculateTotal();

    document.addEventListener("change", (e) => {
      const el = e.target;
      const optionText =
        el.tagName === "SELECT"
          ? el.options[el.selectedIndex].textContent
          : null;

      if (el && el.dataset.calculate) {
        calculator.convertRow(e);
        //if (el.value === "") {
        //  el.value = 0;
        //}
        setSelectClass(
          el,
          optionText &&
            (optionText === "Inches" ||
              optionText === "Fraction" ||
              optionText === "cm" ||
              optionText === "mm")
        );
        calculator.updateLocalStorage(e, "update");
      }
    });

    document.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (action) {
        if (action === "create") {
          createItem(e);
        } else if (action === "remove") {
          removeItem(e);
        } else if (action === "reset") {
          resetCalculatorListItems(e);
        }
      }
    });

    // store name value temporarily to determine if name changed
    let nameValue = "";

    document.addEventListener(
      "focus",
      (e) => {
        const action = e.target.dataset.action;
        if (action === "updateName") {
          nameValue = e.target.value.trim();
        }
      },
      true
    );

    document.addEventListener(
      "blur",
      (e) => {
        const action = e.target.dataset.action;
        if (action === "updateName") {
          e.target.value = e.target.value.trim();
        }
        if (action === "updateName" && e.target.value.trim() !== nameValue) {
          calculator.updateLocalStorage(e, "updateName");
          settings.deliverMessage(e, "update name");
        }
      },
      true
    );
  }
};

wastePercentage.addEventListener("change", (e) => {
  wastePercentageAmount = (wastePercentage.value / 100 + 1).toFixed(2);
  calculator.calculateTotal();
  settings.updateLocalStorage();
  settings.deliverMessage(e, "waste percentage change");
});

costPerBag.addEventListener("change", (e) => {
  calculator.calculateTotal();
  settings.updateLocalStorage();
  if (costPerBag.value !== "") {
    costPerBag.value = parseFloat(costPerBag.value).toFixed(2);
  }
  settings.deliverMessage(e, "cost per bag change");
});

bagSize.addEventListener("change", (e) => {
  calculator.calculateTotal();
  settings.updateLocalStorage();
  settings.deliverMessage(e, "bag size change");
});

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    document.body.className = "is-metric";
  } else {
    document.body.className = "is-imperial";
  }
  //setCheckedStyle(toggle);
  calculator.calculateTotal();
  settings.updateLocalStorage();
});

const createItem = (e) => {
  const type = e.target.nextSibling.firstChild.dataset.type;
  appendTemplate(type);
  if (calculatorList.children.length) {
    empty.style.display = "none";
  }
  calculator.updateLocalStorage(e, "create");
  calculator.calculateTotal();
  settings.deliverMessage(e, "create");
};

const removeItem = (e) => {
  const parentListItem = e.target.closest("li");
  calculator.updateLocalStorage(e, "remove");
  parentListItem.remove();
  if (!calculatorList.children.length) {
    empty.style.display = "block";
  }
  calculator.calculateTotal();
  settings.deliverMessage(e, "remove");
};

const resetCalculatorListItems = (e) => {
  calculator.updateLocalStorage(e, "reset");
  calculatorList.innerHTML = "";
  if (calculator.type !== "main") {
    appendTemplate(calculator.type);
  } else {
    empty.style.display = "block";
  }

  calculator.calculateTotal();
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  settings.deliverMessage(e, "reset");
};

calculator.init();
