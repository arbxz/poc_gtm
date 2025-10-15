import { useState, useRef } from "react";
import "./App.css";

// Extend Window interface for GTM
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

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

  // Debounce timer ref
  const gtmTimerRef = useRef<number | null>(null);

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

  // GTM Helper function with 5-second debounce
  const pushToGTMDelayed = () => {
    // Clear existing timer if it exists
    if (gtmTimerRef.current) {
      clearTimeout(gtmTimerRef.current);
    }

    // Set new timer for 5 seconds
    gtmTimerRef.current = window.setTimeout(() => {
      // Get current slider configs for meaningful names
      const currentConfigs = sliderConfigs[selectedOption];

      // Create meaningful slider data
      const sliderData = Object.entries(sliderValues).reduce(
        (acc, [key, value]) => {
          const config = currentConfigs[key];
          if (config) {
            // Convert label to snake_case for GTM
            const cleanLabel = config.label
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, "_");
            acc[cleanLabel] = value;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      // Initialize GTM dataLayer if it doesn't exist
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "user_configuration_final",
        property_type: selectedOption,
        timestamp: new Date().toISOString(),
        ...sliderData,
      });
      gtmTimerRef.current = null;
    }, 5000); // 5 second delay
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newOption = event.target.value as OptionType;
    setSelectedOption(newOption);
    setParamUrl(newOption);

    // Reset slider values when option changes
    const configs = sliderConfigs[newOption];
    const newSliderValues = {
      slider1: Math.floor((configs.slider1.min + configs.slider1.max) / 2),
      slider2: Math.floor((configs.slider2.min + configs.slider2.max) / 2),
      slider3: Math.floor((configs.slider3.min + configs.slider3.max) / 2),
    };
    setSliderValues(newSliderValues);

    // Trigger delayed GTM push (will use current state after 5 seconds)
    pushToGTMDelayed();
  };

  const handleSliderChange = (sliderKey: string, value: number) => {
    const newSliderValues = {
      ...sliderValues,
      [sliderKey]: value,
    };

    setSliderValues(newSliderValues);

    // Trigger delayed GTM push (will use current state after 5 seconds)
    pushToGTMDelayed();
  };

  const handleButtonClick = (type: OptionType) => {
    setSelectedOption(type);
    setParamUrl(type);

    // Reset slider values when option changes
    const configs = sliderConfigs[type];
    const newSliderValues = {
      slider1: Math.floor((configs.slider1.min + configs.slider1.max) / 2),
      slider2: Math.floor((configs.slider2.min + configs.slider2.max) / 2),
      slider3: Math.floor((configs.slider3.min + configs.slider3.max) / 2),
    };
    setSliderValues(newSliderValues);

    // Trigger delayed GTM push (will use current state after 5 seconds)
    pushToGTMDelayed();
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
                id="project-residential"
                className={`project-type-button ${
                  selectedOption === "residential" ? "active" : ""
                }`}
                onClick={() => handleButtonClick("residential")}
              >
                Residential
              </button>
              <button
                id="project-commercial"
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
                id="project-industrial"
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
