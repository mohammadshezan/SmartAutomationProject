const { exec } = require('child_process');
const util = require('util');
const os = require('os');
const execAsync = util.promisify(exec);

class PortManager {
  constructor() {
    this.ports = {
      web: 3005,
      api: 5000,
      redis: 6379,
      postgres: 5432
    };
    this.platform = process.platform; // 'win32' | 'darwin' | 'linux'
  }

  async checkPort(port) {
    try {
      if (this.platform === 'win32') {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        return stdout.trim() !== '';
      }
      // macOS/Linux
      const { stdout } = await execAsync(`lsof -iTCP:${port} -sTCP:LISTEN -n -P || true`);
      return stdout.trim() !== '';
    } catch (error) {
      return false;
    }
  }

  async killProcessOnPort(port) {
    try {
      if (this.platform === 'win32') {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        if (stdout.trim()) {
          const lines = stdout.trim().split('\n');
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
              console.log(`Killing process ${pid} on port ${port}`);
              await execAsync(`taskkill /PID ${pid} /F`);
            }
          }
          return true;
        }
        return false;
      }
      // macOS/Linux
      const { stdout } = await execAsync(`lsof -ti tcp:${port} || true`);
      const pids = stdout.split(/\s+/).filter(Boolean);
      if (pids.length) {
        for (const pid of pids) {
          console.log(`Killing PID ${pid} on port ${port}`);
          await execAsync(`kill -9 ${pid} || true`);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error killing process on port ${port}:`, error.message);
      return false;
    }
  }

  async killAllNodeProcesses() {
    try {
      console.log('Killing all Node.js processes...');
      if (this.platform === 'win32') {
        await execAsync('taskkill /IM node.exe /F');
      } else {
        // Be conservative: kill only processes bound to our typical ports
        const targets = [3000,3001,3002,3005,5000,5001,5002,5003,5004,5005,5006,5007];
        for (const p of targets) {
          await this.killProcessOnPort(p);
        }
        // Also try to stop common dev runners
        await execAsync("pkill -f 'next dev' || true");
        await execAsync("pkill -f 'node --watch src/index.js' || true");
      }
      console.log('All relevant Node.js dev processes terminated');
      return true;
    } catch (error) {
      console.log('No Node.js processes found or already terminated');
      return false;
    }
  }

  async findAvailablePort(startPort) {
    let port = startPort;
    while (await this.checkPort(port)) {
      port++;
    }
    return port;
  }

  async cleanupPorts() {
    console.log('🧹 Cleaning up ports...');
    
    // Kill all Node.js processes first
    await this.killAllNodeProcesses();
    
    // Wait a moment for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check and clean specific ports (web + API range)
    const portPairs = Object.entries(this.ports);
    // Spread a few likely alternates for API
    const extras = [["api-5001", 5001],["api-5002",5002],["api-5003",5003],["api-5004",5004],["api-5005",5005]];
    for (const [service, port] of [...portPairs, ...extras]) {
      if (service === 'redis' || service === 'postgres') continue; // Skip Docker services
      
      const isUsed = await this.checkPort(port);
      if (isUsed) {
        console.log(`Port ${port} (${service}) is in use, attempting to free...`);
        await this.killProcessOnPort(port);
      } else {
        console.log(`✅ Port ${port} (${service}) is available`);
      }
    }
    
    console.log('✨ Port cleanup completed!');
  }

  async getAvailablePorts() {
    const availablePorts = {};
    
    for (const [service, defaultPort] of Object.entries(this.ports)) {
      if (service === 'redis' || service === 'postgres') {
        availablePorts[service] = defaultPort; // Docker services
        continue;
      }
      
      const availablePort = await this.findAvailablePort(defaultPort);
      availablePorts[service] = availablePort;
      
      if (availablePort !== defaultPort) {
        console.log(`⚠️  Port ${defaultPort} for ${service} is in use, using ${availablePort} instead`);
      }
    }
    
    return availablePorts;
  }
}

module.exports = PortManager;

// If this script is run directly
if (require.main === module) {
  const portManager = new PortManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'cleanup':
      portManager.cleanupPorts();
      break;
    case 'check':
      portManager.getAvailablePorts().then(ports => {
        console.log('Available ports:', ports);
      });
      break;
    default:
      console.log('Usage: node port-manager.js [cleanup|check]');
      console.log('  cleanup - Kill processes and clean up ports');
      console.log('  check   - Check available ports');
  }
}