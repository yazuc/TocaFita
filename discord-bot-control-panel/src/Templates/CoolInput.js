import React from 'react';
import './CoolInput.css'; // Import your CSS file

const CoolInput = ({ placeholder }) => {
  return (
    <input
      type="text"
      className="cool-input"
      placeholder={placeholder}
    />
  );
};

export default CoolInput;
