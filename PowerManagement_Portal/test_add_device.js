// Test script for adding a device
const testDevice = {
  deviceId: "CCMS-TEST-001",
  powerRating: "25kW",
  voltage: "415V",
  frequency: "50Hz",
  incomingCurrent: "35A",
  ipRating: "IP65",
  coordinates: [77.2090, 28.6139], // Delhi coordinates
  address: "Test Location, Delhi, India"
};

async function testAddDevice() {
  try {
    const response = await fetch('http://localhost:3000/api/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDevice),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Device added successfully:', result);
    } else {
      console.log('❌ Error adding device:', result);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Run the test
testAddDevice(); 