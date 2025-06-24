import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { toggleLine, setZoom } from "../../store/displaySlice"; 
import { styles } from "./styles";
import DisplayCheckbox from "./DisplayCheckbox";
import ResetZoomButton from "./ResetZoomButton";

const DisplayOptions: React.FC = () => {
  const display = useSelector((state: RootState) => state.display);
  const dispatch = useDispatch();
  const [showWarning, setShowWarning] = useState(false);

  const handleToggle = (key: keyof typeof display) => {
    if (key === 'zoomed') return; 
    const newValue = { ...display, [key]: !display[key] };
    const isNoneSelected = Object.entries(newValue)
      .filter(([k]) => k !== 'zoomed') 
      .every(([, v]) => !v);
    setShowWarning(isNoneSelected);
    dispatch(toggleLine(key));
  };

  useEffect(() => {
    const isNoneSelected = Object.entries(display)
      .filter(([k]) => k !== 'zoomed') 
      .every(([, v]) => !v);
    setShowWarning(isNoneSelected);
  }, [display]);

  return (
    <View style={styles.container}>
      <View style={styles.optionsRow}>
        <View style={styles.checkboxColumn}>
          <Text style={styles.title}>Display</Text>

          <DisplayCheckbox label="Open" checked={display.open} onToggle={() => handleToggle("open")} />
          <DisplayCheckbox label="Close" checked={display.close} onToggle={() => handleToggle("close")} />
          <DisplayCheckbox label="Low" checked={display.low} onToggle={() => handleToggle("low")} />
          <DisplayCheckbox label="High" checked={display.high} onToggle={() => handleToggle("high")} />
        </View>

        <View style={styles.buttonColumn}>
          <ResetZoomButton
            title="Reset Zoom"
            onPress={() => {
              dispatch(setZoom(false)); 
            }}
          />
        </View>
        
        {showWarning && (
          <Text style={styles.warning}>
            Please select at least one option to display
          </Text>
        )}
      </View>
    </View>
  );
};

export default DisplayOptions;