self.addEventListener('message', function(e) {
  if (e.data.latitude && e.data.longitude) {
    const { latitude, longitude } = e.data;

    const sendLocation = async () => {
      try {
        const response = await fetch('/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ latitude, longitude })
        });

        if (!response.ok) {
          throw new Error('Failed to send location data');
        }
        console.log(`Location sent successfully at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error sending location:', error);
      }
    };

    // Send location immediately when starting
    sendLocation();
    // Set up a setInterval to send location every 6 seconds
    setInterval(sendLocation, 6000);
  } else {
    console.error('Invalid location data received');
  }
});
