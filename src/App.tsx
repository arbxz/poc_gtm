import { useState } from "react";
import "./App.css";

type OptionType = "residential" | "commercial" | "industrial";

interface SliderConfig {
  min: number;
  max: number;
  step: number;
  label: string;
}

function App() {
  const [selectedOption, setSelectedOption] =
    useState<OptionType>("residential");
  const [sliderValues, setSliderValues] = useState({
    slider1: 50,
    slider2: 30,
    slider3: 70,
  });

  // Define different slider configurations based on selected option
  const sliderConfigs: {
    [key in OptionType]: { [key: string]: SliderConfig };
  } = {
    residential: {
      slider1: { min: 0, max: 100, step: 1, label: "Price Range (k)" },
      slider2: { min: 1, max: 10, step: 1, label: "Bedrooms" },
      slider3: { min: 500, max: 5000, step: 50, label: "Square Feet" },
    },
    commercial: {
      slider1: { min: 0, max: 1000, step: 10, label: "Budget (k)" },
      slider2: { min: 1, max: 50, step: 1, label: "Floors" },
      slider3: { min: 1000, max: 50000, step: 100, label: "Square Feet" },
    },
    industrial: {
      slider1: { min: 0, max: 5000, step: 50, label: "Investment (k)" },
      slider2: { min: 1, max: 100, step: 1, label: "Units" },
      slider3: { min: 5000, max: 100000, step: 500, label: "Square Feet" },
    },
  };

  const setParamUrl = (type: OptionType) => {
    const paramMap: { [key in OptionType]: string } = {
      residential: "residential",
      commercial: "commercial",
      industrial: "industrial",
    };
    const param = paramMap[type];
    if (param) {
      const newUrl = `/${param}`;
      window.history.pushState({}, "", newUrl);
    }
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newOption = event.target.value as OptionType;
    setSelectedOption(newOption);
    setParamUrl(newOption);

    // Reset slider values when option changes
    const configs = sliderConfigs[newOption];
    setSliderValues({
      slider1: Math.floor((configs.slider1.min + configs.slider1.max) / 2),
      slider2: Math.floor((configs.slider2.min + configs.slider2.max) / 2),
      slider3: Math.floor((configs.slider3.min + configs.slider3.max) / 2),
    });
  };

  const handleSliderChange = (sliderKey: string, value: number) => {
    setSliderValues((prev) => ({
      ...prev,
      [sliderKey]: value,
    }));
  };

  const handleButtonClick = (type: OptionType) => {
    setSelectedOption(type);
    setParamUrl(type);

    // Reset slider values when option changes
    const configs = sliderConfigs[type];
    setSliderValues({
      slider1: Math.floor((configs.slider1.min + configs.slider1.max) / 2),
      slider2: Math.floor((configs.slider2.min + configs.slider2.max) / 2),
      slider3: Math.floor((configs.slider3.min + configs.slider3.max) / 2),
    });
  };

  const currentConfigs = sliderConfigs[selectedOption];

  return (
    <>
      <div className="container">
        <h1>Property Configuration</h1>

        <form className="config-form">
          <div className="form-group">
            <label htmlFor="option-select">Property Type:</label>
            <select
              id="option-select"
              value={selectedOption}
              onChange={handleOptionChange}
              className="dropdown"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quick Select:</label>
            <div className="button-group">
              <button
                type="button"
                name="residential"
                className={`project-type-button ${
                  selectedOption === "residential" ? "active" : ""
                }`}
                onClick={() => handleButtonClick("residential")}
              >
                Residential
              </button>
              <button
                type="button"
                name="commercial"
                className={`project-type-button ${
                  selectedOption === "commercial" ? "active" : ""
                }`}
                onClick={() => handleButtonClick("commercial")}
              >
                Commercial
              </button>
              <button
                type="button"
                name="industrial"
                className={`project-type-button ${
                  selectedOption === "industrial" ? "active" : ""
                }`}
                onClick={() => handleButtonClick("industrial")}
              >
                Industrial
              </button>
            </div>
          </div>

          <div className="sliders-container">
            {Object.entries(currentConfigs).map(([key, config]) => (
              <div key={key} className="slider-group">
                <label htmlFor={key}>
                  {config.label}:{" "}
                  {sliderValues[key as keyof typeof sliderValues]}
                </label>
                <input
                  type="range"
                  id={key}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={sliderValues[key as keyof typeof sliderValues]}
                  onChange={(e) =>
                    handleSliderChange(key, parseInt(e.target.value))
                  }
                  className="slider"
                />
                <div className="slider-range">
                  <span>{config.min}</span>
                  <span>{config.max}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="current-values">
            <h3>Current Selection: {selectedOption}</h3>
            <p>URL: /{selectedOption}</p>
            <div className="values">
              {Object.entries(currentConfigs).map(([key, config]) => (
                <div key={key}>
                  {config.label}:{" "}
                  {sliderValues[key as keyof typeof sliderValues]}
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default App;
