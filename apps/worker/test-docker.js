const Docker = require('dockerode');

// Connects to local Docker daemon automatically
const docker = new Docker();

async function testConnection() {
  console.log('?? Connecting to Docker Desktop...');
  try {
    const info = await docker.info();
    console.log('? SUCCESS! Connected to Docker Engine v' + info.ServerVersion);
    
    const containers = await docker.listContainers();
    console.log('\n?? Found ' + containers.length + ' running container(s):');
    containers.forEach((c) => {
      console.log('   • Name: ' + c.Names[0] + ' | Image: ' + c.Image);
    });
  } catch (err) {
    console.error('? Error connecting to Docker:', err.message);
    console.error('?? Make sure Docker Desktop app is running!');
  }
}

testConnection();
